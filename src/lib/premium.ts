import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountState, subscribeAccount } from "@/lib/account";
import { supabase, SUPABASE_ANON_KEY, SUPABASE_ENABLED, SUPABASE_URL } from "@/lib/supabase";

// Premium, dzienny limit AI i kody poleceń. O wszystkim decyduje serwer (migracja 20261102120000_premium_referrals):
// aplikacja czyta stan z account_status() i woła funkcje, sama niczego nie nalicza – stanu lokalnego
// nie da się więc „podkręcić”. Konto (anonimowe) zakładamy dopiero przy pierwszej akcji, która go wymaga
// (wiadomość do AI, własny kod, wpisanie kodu) – samo otwarcie ekranu nie tworzy konta.

export const AI_FREE_DAILY_LIMIT = 5;
export const REFERRAL_DAYS = 2;

export interface PremiumState {
  status: "unavailable" | "no-account" | "loading" | "ready" | "error";
  premiumUntil: Date | null;
  aiUsed: number;
  aiLimit: number;
  referralCode: string | null;
  referralCount: number;
}

const INITIAL: PremiumState = {
  status: SUPABASE_ENABLED ? "loading" : "unavailable",
  premiumUntil: null,
  aiUsed: 0,
  aiLimit: AI_FREE_DAILY_LIMIT,
  referralCode: null,
  referralCount: 0,
};

let state: PremiumState = INITIAL;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(change: Partial<PremiumState>) {
  state = { ...state, ...change };
  listeners.forEach((l) => l());
}

/** Klient z sesją; `create` – załóż konto anonimowe, jeśli go nie ma. */
async function client(create: boolean): Promise<{ db: SupabaseClient; token: string } | null> {
  const db = await supabase();
  if (!db) return null;
  let { data } = await db.auth.getSession();
  if (!data.session && create) {
    const signIn = await db.auth.signInAnonymously();
    if (signIn.error || !signIn.data.session) throw new Error("Nie udało się połączyć z serwerem. Sprawdź internet i spróbuj ponownie.");
    data = { session: signIn.data.session };
  }
  return data.session ? { db, token: data.session.access_token } : null;
}

interface StatusRow {
  premium_until: string | null;
  ai_used: number;
  ai_limit: number;
  referral_code: string | null;
  referral_count: number;
}

/** Wczytuje stan z serwera (bez zakładania konta). */
export function refreshPremium(): Promise<void> {
  if (!SUPABASE_ENABLED) return Promise.resolve();
  loading = (async () => {
    try {
      const session = await client(false);
      if (!session) return setState({ ...INITIAL, status: "no-account" });
      const { data, error } = await session.db.rpc("account_status");
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as StatusRow;
      setState({
        status: "ready",
        premiumUntil: row.premium_until ? new Date(row.premium_until) : null,
        aiUsed: row.ai_used,
        aiLimit: row.ai_limit,
        referralCode: row.referral_code,
        referralCount: row.referral_count,
      });
    } catch {
      setState({ status: "error" });
    }
  })();
  return loading;
}

let watchingAccount = false;

function subscribe(listener: () => void) {
  listeners.add(listener);
  loading ??= refreshPremium();
  // inne konto (logowanie e-mailem na istniejące konto, wylogowanie, nowe konto anonimowe) = inny stan Premium
  if (!watchingAccount) {
    watchingAccount = true;
    let last = currentUserId();
    subscribeAccount(() => {
      const id = currentUserId();
      if (id === last) return;
      last = id;
      void refreshPremium();
    });
  }
  return () => listeners.delete(listener);
}

function currentUserId(): string | null {
  const account = accountState();
  return account.status === "anonymous" || account.status === "email" ? account.userId : null;
}

export function usePremium(): PremiumState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

/** Czy Premium jest aktywne w tej chwili (data z serwera). */
export function isPremium(s: PremiumState, now = Date.now()): boolean {
  return Boolean(s.premiumUntil && s.premiumUntil.getTime() > now);
}

/** „do 31 października, 14:20” – do kiedy trwa Premium. */
export function formatPremiumUntil(date: Date): string {
  return date.toLocaleString("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

// ── Kody poleceń ──

/** Kod do wpisania: wielkie litery i cyfry, bez spacji (tak jak normalizuje go serwer). */
export function normalizeReferralCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/;

/** Własny kod polecenia (przy pierwszym razie zakłada konto i tworzy kod). */
export async function myReferralCode(): Promise<string> {
  if (state.referralCode) return state.referralCode;
  const session = await client(true);
  if (!session) throw new Error("Kody poleceń nie są dostępne w tej wersji aplikacji.");
  const { data, error } = await session.db.rpc("my_referral_code");
  if (error) throw new Error("Nie udało się pobrać kodu. Spróbuj ponownie za chwilę.");
  setState({ referralCode: data as string });
  return data as string;
}

const REDEEM_ERRORS: Record<string, string> = {
  MA010: "Nie ma takiego kodu – sprawdź, czy jest przepisany bez pomyłki.",
  MA011: "To Twój własny kod – wyślij go znajomym, a dostaniecie po 2 dni Premium.",
  MA012: "Kod polecenia był już wpisany na tym koncie.",
  MA013: "Kod polecenia można wpisać tylko w pierwszym tygodniu korzystania z aplikacji.",
};

/** Wpisuje kod znajomego. Zwraca datę końca Premium albo komunikat błędu. */
export async function redeemReferralCode(input: string): Promise<{ until: Date } | { error: string }> {
  const code = normalizeReferralCode(input);
  if (!REFERRAL_CODE_PATTERN.test(code)) return { error: "Kod ma 6 znaków – litery i cyfry." };
  try {
    const session = await client(true);
    if (!session) return { error: "Kody poleceń nie są dostępne w tej wersji aplikacji." };
    const { data, error } = await session.db.rpc("redeem_referral", { p_code: code });
    if (error) return { error: REDEEM_ERRORS[error.code ?? ""] ?? "Nie udało się wpisać kodu. Spróbuj ponownie za chwilę." };
    const row = (Array.isArray(data) ? data[0] : data) as { premium_until: string };
    await refreshPremium();
    return { until: new Date(row.premium_until) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ── AI przez serwer ──

export const AI_FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai` : "";

/** Nagłówki do funkcji `ai` (zakłada konto anonimowe przy pierwszej wiadomości); `refresh` – wymuś nowy token. */
export async function aiRequestHeaders(refresh = false): Promise<Record<string, string>> {
  const session = await client(true);
  if (!session) throw new Error("Korepetytor AI nie jest dostępny w tej wersji aplikacji.");
  let token = session.token;
  if (refresh) token = (await session.db.auth.refreshSession()).data.session?.access_token ?? token;
  return { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" };
}

/** Po odpowiedzi serwera: ile wiadomości zostało na dziś (z nagłówka `x-ai-remaining`). */
export function noteAiRemaining(remaining: number, premium: boolean) {
  if (!Number.isFinite(remaining)) return;
  const limit = premium ? Math.max(state.aiLimit, remaining) : AI_FREE_DAILY_LIMIT;
  setState({ aiLimit: limit, aiUsed: Math.max(0, limit - remaining), status: state.status === "ready" ? "ready" : state.status });
}

/** Dzienny limit wyczerpany – ekran korepetytora pokazuje wtedy zachętę do Premium i kodów poleceń. */
export class AiLimitError extends Error {
  constructor() {
    super(`Na dziś wykorzystano ${AI_FREE_DAILY_LIMIT} darmowych wiadomości do AI. Wróć jutro albo odblokuj Premium – także kodem polecenia.`);
    this.name = "AiLimitError";
  }
}
