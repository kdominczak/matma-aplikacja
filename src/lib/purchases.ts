import { useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { accountState, subscribeAccount } from "@/lib/account";
import { openExternal } from "@/lib/external";
import { refreshPremium } from "@/lib/premium";
import { supabase, SUPABASE_ANON_KEY, SUPABASE_ENABLED, SUPABASE_URL } from "@/lib/supabase";
import { ENTITLEMENT_ID, seasonEnd } from "../../supabase/functions/_shared/purchase";

// Zakupy Premium przez Google Play (RevenueCat, plugin @revenuecat/purchases-capacitor).
//
// • Premium liczy wyłącznie serwer: po zakupie aplikacja prosi funkcję `revenuecat` o synchronizację
//   (serwer sam pyta API RevenueCat), a potem czyta stan przez account_status(). Stan z SDK służy tylko UI.
// • Konto RevenueCat = id konta Supabase z e-mailem. Zakup wymaga e-maila – na koncie anonimowym przepadłby
//   po zmianie telefonu. Bez e-maila SDK działa na anonimowym id RevenueCat (tylko do pobrania cen).
// • Plugin ładuje się osobną paczką dopiero na Androidzie z kluczem SDK – w przeglądarce ekran Premium
//   pokazuje ceny informacyjnie (PLAN_INFO), bez przycisku zakupu.

const API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_KEY ?? "";

export type PlanId = "pass" | "monthly";

/** Opis planów (nazwy, dopiski); ceny ze sklepu, a bez sklepu – informacyjne `fallbackPrice`. */
export const PLAN_INFO: Record<PlanId, { title: string; fallbackPrice: string; note: (now: Date) => string }> = {
  pass: {
    title: "Pakiet maturalny",
    fallbackPrice: "149 zł",
    note: (now) => `jednorazowo, ważny do ${formatSeasonEnd(now)}`,
  },
  monthly: {
    title: "Premium miesięcznie",
    fallbackPrice: "29,99 zł",
    note: () => "co miesiąc, anulujesz w Google Play w każdej chwili",
  },
};

/** „31 maja 2027” – ostatni dzień pakietu kupionego dziś (seasonEnd to północ na 1 czerwca, ta sama reguła co na serwerze). */
export function formatSeasonEnd(now: Date): string {
  const lastMoment = new Date(seasonEnd(now).getTime() - 1);
  return lastMoment.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });
}

export interface Offer {
  plan: PlanId;
  price: string;
  /** Pakiet ze sklepu; null = cena informacyjna (sklep niedostępny). */
  pkg: PurchasesPackage | null;
}

export interface PurchasesState {
  /** unsupported – przeglądarka / build bez klucza: ceny informacyjne, bez zakupu. */
  status: "unsupported" | "loading" | "ready" | "error";
  offers: Offer[];
  /** Link do zarządzania subskrypcją w Google Play – tylko przy aktywnej subskrypcji. */
  manageUrl: string | null;
  /** Zakup aktywny wg Google Play (pakiet albo subskrypcja) – wtedy nie proponujemy kolejnego. */
  owned: boolean;
}

const INFO_OFFERS: Offer[] = (["pass", "monthly"] as const).map((plan) => ({ plan, price: PLAN_INFO[plan].fallbackPrice, pkg: null }));

/** Pakiety z oferty RevenueCat: pakiet sezonowy = typ LIFETIME, subskrypcja = MONTHLY. Kolejność: pakiet, miesięczna. */
export function offersFrom(offering: PurchasesOffering | null): Offer[] {
  if (!offering) return [];
  const pass = offering.lifetime ?? offering.availablePackages.find((p) => String(p.packageType) === "LIFETIME");
  const monthly = offering.monthly ?? offering.availablePackages.find((p) => String(p.packageType) === "MONTHLY");
  const offers: Offer[] = [];
  if (pass) offers.push({ plan: "pass", price: pass.product.priceString, pkg: pass });
  if (monthly) offers.push({ plan: "monthly", price: monthly.product.priceString, pkg: monthly });
  return offers;
}

/** Komunikat dla kodu błędu RevenueCat (PURCHASES_ERROR_CODE); null = uczeń sam anulował. */
export function purchaseErrorMessage(code: string): string | null {
  switch (code) {
    case "1": // PURCHASE_CANCELLED_ERROR
      return null;
    case "3": // PURCHASE_NOT_ALLOWED_ERROR
      return "Zakupy są zablokowane na tym urządzeniu (np. przez kontrolę rodzicielską w Google Play).";
    case "6": // PRODUCT_ALREADY_PURCHASED_ERROR
      return "Ten pakiet jest już kupiony na Twoim koncie Google – użyj „Przywróć zakupy”.";
    case "7": // RECEIPT_ALREADY_IN_USE_ERROR
      return "Ten zakup jest przypisany do innego konta Matmy. Zaloguj się e-mailem konta, na którym kupiono Premium.";
    case "10": // NETWORK_ERROR
      return "Brak połączenia z Google Play. Sprawdź internet i spróbuj ponownie.";
    case "20": // PAYMENT_PENDING_ERROR
      return "Płatność czeka na potwierdzenie. Premium włączy się samo, gdy Google Play ją zaksięguje.";
    default:
      return "Google Play nie przyjął zakupu. Spróbuj ponownie za chwilę – pieniądze nie zostały pobrane.";
  }
}

// ── Stan dla UI ──

let state: PurchasesState = { status: "unsupported", offers: INFO_OFFERS, manageUrl: null, owned: false };
const listeners = new Set<() => void>();

function setState(change: Partial<PurchasesState>) {
  state = { ...state, ...change };
  listeners.forEach((l) => l());
}

const SERVER_STATE: PurchasesState = { status: "unsupported", offers: INFO_OFFERS, manageUrl: null, owned: false };

/** Czy w tej wersji da się kupić (aplikacja na Androida z kluczem RevenueCat i Supabase). Tylko w przeglądarce/WebView. */
export function purchasesSupported(): boolean {
  if (!API_KEY || !SUPABASE_ENABLED || typeof window === "undefined") return false;
  return Capacitor.getPlatform() === "android";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (purchasesSupported() && state.status === "unsupported") void loadOffers();
  return () => listeners.delete(listener);
}

export function usePurchases(): PurchasesState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

// ── SDK: konfiguracja i tożsamość ──

type Sdk = (typeof import("@revenuecat/purchases-capacitor"))["Purchases"];
let sdk: Promise<Sdk> | null = null;
/** Id konta, na które SDK jest zalogowane (null = anonimowe id RevenueCat); undefined = jeszcze nieskonfigurowane. */
let identity: string | null | undefined;
// operacje na SDK po kolei – zmiana konta w trakcie konfiguracji nie może się przeplatać z zakupem
let chain: Promise<unknown> = Promise.resolve();
function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job);
  chain = run.catch(() => {});
  return run;
}

function emailUserId(): string | null {
  const account = accountState();
  return account.status === "email" ? account.userId : null;
}

/** SDK skonfigurowane i zalogowane na bieżące konto z e-mailem (albo anonimowe, gdy e-maila brak). */
function ready(): Promise<Sdk> {
  return serial(async () => {
    sdk ??= import("@revenuecat/purchases-capacitor").then((m) => m.Purchases);
    const Purchases = await sdk;
    const id = emailUserId();
    if (identity === undefined) {
      await Purchases.configure({ apiKey: API_KEY, appUserID: id });
      identity = id;
    } else if (identity !== id) {
      if (id) await Purchases.logIn({ appUserID: id });
      else await Purchases.logOut().catch(() => {}); // wylogowanie z anonimowego id RevenueCat zgłasza błąd – bez znaczenia
      identity = id;
    }
    return Purchases;
  });
}

function noteCustomer(info: CustomerInfo) {
  // link do Google Play tylko przy subskrypcji (pakiet jednorazowy nie ma czego anulować)
  setState({
    manageUrl: info.activeSubscriptions.length > 0 ? info.managementURL : null,
    owned: Boolean(info.entitlements.active[ENTITLEMENT_ID]),
  });
}

/** Ponowne pobranie cen (przycisk „Spróbuj ponownie” po błędzie sklepu). */
export function reloadOffers() {
  if (purchasesSupported()) void loadOffers();
}

async function loadOffers(): Promise<void> {
  setState({ status: "loading" });
  try {
    const Purchases = await ready();
    const [{ current }, { customerInfo }] = await Promise.all([Purchases.getOfferings(), Purchases.getCustomerInfo()]);
    const offers = offersFrom(current);
    noteCustomer(customerInfo);
    setState(offers.length ? { status: "ready", offers } : { status: "error", offers: INFO_OFFERS });
  } catch {
    setState({ status: "error", offers: INFO_OFFERS });
  }
}

/**
 * Start w AppShell: pilnuje, żeby SDK było zalogowane na bieżące konto (logowanie e-mailem, wylogowanie),
 * i odświeża stan po zmianach z Google Play (odnowienie, anulowanie). Zwraca sprzątanie.
 */
export function startPurchases(): () => void {
  if (!purchasesSupported()) return () => {};
  let last = emailUserId();
  let listenerId: string | null = null;
  let stopped = false;
  void ready()
    .then((Purchases) =>
      Purchases.addCustomerInfoUpdateListener((info) => {
        noteCustomer(info);
        void refreshPremium();
      }),
    )
    .then((id) => {
      if (stopped) void sdk?.then((P) => P.removeCustomerInfoUpdateListener({ listenerToRemove: id }));
      else listenerId = id;
    })
    .catch(() => {});
  const unsubscribe = subscribeAccount(() => {
    const id = emailUserId();
    if (id === last) return;
    last = id;
    void loadOffers();
  });
  return () => {
    stopped = true;
    unsubscribe();
    if (listenerId) void sdk?.then((P) => P.removeCustomerInfoUpdateListener({ listenerToRemove: listenerId! }));
  };
}

// ── Synchronizacja z serwerem ──

/** Prosi serwer o stan zakupów z RevenueCat (od razu po zakupie, bez czekania na webhook). */
async function syncServer(): Promise<void> {
  const db = await supabase();
  const token = (await db?.auth.getSession())?.data.session?.access_token;
  if (!db || !token) throw new Error("no-session");
  const response = await fetch(`${SUPABASE_URL}/functions/v1/revenuecat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`sync ${response.status}`);
}

/** Synchronizacja z kilkoma próbami – zakup jest już opłacony, nie chcemy zgubić go przez chwilowy brak sieci. */
async function syncWithRetry(): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await syncServer();
      await refreshPremium();
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
    }
  }
  return false;
}

// ── Akcje ──

export type PurchaseOutcome =
  | { status: "done" }
  /** Zapłacone, ale serwer jeszcze nie potwierdził – Premium włączy webhook albo „Przywróć zakupy”. */
  | { status: "activating" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

const NEEDS_EMAIL = "Zakup wymaga konta z e-mailem – dzięki temu Premium nie przepadnie po zmianie telefonu.";

export async function buyPlan(plan: PlanId): Promise<PurchaseOutcome> {
  if (!emailUserId()) return { status: "error", message: NEEDS_EMAIL };
  const offer = state.offers.find((o) => o.plan === plan);
  if (!offer?.pkg) return { status: "error", message: "Ten plan jest chwilowo niedostępny w Google Play." };
  try {
    const Purchases = await ready();
    const { customerInfo } = await serial(() => Purchases.purchasePackage({ aPackage: offer.pkg! }));
    noteCustomer(customerInfo);
  } catch (error) {
    const message = purchaseErrorMessage(String((error as { code?: unknown }).code ?? ""));
    return message === null ? { status: "cancelled" } : { status: "error", message };
  }
  return (await syncWithRetry()) ? { status: "done" } : { status: "activating" };
}

/** „Przywróć zakupy” – po reinstalacji albo na nowym telefonie (to samo konto Google i ten sam e-mail w Matmie). */
export async function restorePurchases(): Promise<{ status: "restored" | "nothing" } | { status: "error"; message: string }> {
  if (!emailUserId()) return { status: "error", message: NEEDS_EMAIL };
  try {
    const Purchases = await ready();
    const { customerInfo } = await serial(() => Purchases.restorePurchases());
    noteCustomer(customerInfo);
    if (!(await syncWithRetry())) return { status: "error", message: "Nie udało się połączyć z serwerem. Spróbuj ponownie za chwilę." };
    return { status: customerInfo.entitlements.active[ENTITLEMENT_ID] ? "restored" : "nothing" };
  } catch (error) {
    const message = purchaseErrorMessage(String((error as { code?: unknown }).code ?? ""));
    return { status: "error", message: message ?? "Przywracanie przerwane." };
  }
}

/** Zarządzanie subskrypcją (anulowanie, zmiana karty) – strona Google Play. */
export async function manageSubscription(): Promise<void> {
  if (state.manageUrl) await openExternal(state.manageUrl);
}
