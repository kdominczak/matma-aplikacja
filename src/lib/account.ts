import { useSyncExternalStore } from "react";
import type { AuthError, Session, SignInWithIdTokenCredentials } from "@supabase/supabase-js";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";

// Konto ucznia: e-mail + hasło, Google albo 6-cyfrowy kod (OTP). Kod zamiast magic linku, bo aplikacja to
// static export w Capacitorze – link z maila otworzyłby przeglądarkę, a nie aplikację. Dlatego też reset hasła
// to logowanie kodem i ustawienie nowego hasła (a nie link z resetPasswordForEmail).
//
// • Nowe konto: e-mail → kod (potwierdza adres) → hasło (updateUser). Hasło ustawione = `has_password`
//   w user_metadata (Supabase nie mówi klientowi, czy konto ma hasło).
// • Google: w aplikacji natywne okno wyboru konta (token ID → signInWithIdToken), w przeglądarce przekierowanie.
//   Stare konto anonimowe (z czasów rankingu) dostaje Google jako drugą tożsamość (linkIdentity) – to samo id.
//
// • Starsze konto anonimowe (z czasów rankingu) – e-mail dopinamy do TEGO SAMEGO konta (auth.updateUser).
//   Nowych kont anonimowych aplikacja już nie zakłada (AI wymaga konta – migracja 20261109120000).
// • Uczeń bez konta albo na nowym telefonie – logowanie kodem (tworzy konto, jeśli go nie ma).
// Postęp z urządzenia trafia do kopii w chmurze (cloud-sync.ts) i scala się po zalogowaniu.

export type AccountState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "anonymous"; userId: string }
  | { status: "email"; userId: string; email: string; hasPassword: boolean; google: boolean };

/** Jak wysłany kod ma zostać potwierdzony. */
export type CodeMode = "link" | "login";

let state: AccountState = SUPABASE_ENABLED ? { status: "loading" } : { status: "disabled" };
let started: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: AccountState) {
  state = next;
  listeners.forEach((l) => l());
}

function fromSession(session: Session | null): AccountState {
  const user = session?.user;
  if (!user) return { status: "signed-out" };
  if (user.is_anonymous || !user.email) return { status: "anonymous", userId: user.id };
  return {
    status: "email",
    userId: user.id,
    email: user.email,
    hasPassword: user.user_metadata?.has_password === true,
    google: (user.identities ?? []).some((i) => i.provider === "google"),
  };
}

/** Wczytuje sesję i nasłuchuje zmian (logowanie, wylogowanie, dopięcie e-maila). Wywoływane raz. */
export function startAccount(): Promise<void> {
  if (!SUPABASE_ENABLED) return Promise.resolve();
  started ??= (async () => {
    const db = await supabase();
    if (!db) return;
    const { data } = await db.auth.getSession();
    setState(fromSession(data.session));
    db.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // poza wywołaniem zwrotnym – supabase-js nie pozwala w nim wołać kolejnych metod auth
        setTimeout(() => setState(fromSession(session)), 0);
      }
    });
  })().catch(() => setState({ status: "signed-out" }));
  return started;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void startAccount();
  return () => listeners.delete(listener);
}

const SERVER_STATE: AccountState = SUPABASE_ENABLED ? { status: "loading" } : { status: "disabled" };

export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

export function accountState(): AccountState {
  return state;
}

export function subscribeAccount(listener: () => void): () => void {
  return subscribe(listener);
}

// ── Kod z e-maila ──

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function describe(error: AuthError | null | undefined): string {
  switch (error?.code) {
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Za dużo prób. Odczekaj kilka minut i spróbuj ponownie.";
    case "email_address_invalid":
      return "Ten adres e-mail jest nieprawidłowy.";
    // poczta Supabase bez własnego SMTP wysyła tylko na adresy zespołu projektu (docs/konto.md)
    case "email_address_not_authorized":
      return "Nie udało się wysłać kodu na ten adres. Spróbuj za chwilę albo zaloguj się przez Google.";
    case "otp_expired":
      return "Kod jest nieprawidłowy albo wygasł. Wyślij nowy.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Logowanie e-mailem jest chwilowo wyłączone.";
    case "invalid_credentials":
      return "Zły e-mail albo hasło. Konto bez hasła? Zaloguj się kodem z e-maila i ustaw hasło.";
    case "email_not_confirmed":
      return "Ten e-mail nie jest potwierdzony. Zaloguj się kodem z e-maila.";
    case "weak_password":
      return `Hasło jest za słabe – co najmniej ${MIN_PASSWORD} znaków, litery i cyfry.`;
    case "same_password":
      return "To hasło jest takie samo jak obecne.";
    case "reauthentication_needed":
    case "session_expired":
      return "Ze względów bezpieczeństwa zaloguj się ponownie kodem z e-maila i ustaw hasło.";
    case "provider_disabled":
      return "Logowanie przez Google jest chwilowo wyłączone.";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return "Brak internetu. Połącz się i spróbuj ponownie.";
  return "Coś poszło nie tak. Spróbuj ponownie za chwilę.";
}

/** Błąd wysyłki kodu: awaria poczty (SMTP) Supabase zgłasza jako 500 „Error sending … email”. */
function describeSend(error: AuthError): string {
  if (error.status === 500 || /error sending/i.test(error.message)) return "Nie udało się wysłać maila z kodem. Spróbuj za chwilę albo zaloguj się przez Google.";
  return describe(error);
}

/**
 * Wysyła 6-cyfrowy kod. Konto anonimowe → kod potwierdza dopięcie e-maila (to samo konto).
 * Gdy e-mail ma już konto (np. z innego telefonu) → logujemy na nie, a postęp z tego telefonu dołączy się do kopii.
 */
export async function sendCode(rawEmail: string): Promise<{ mode: CodeMode; existing?: boolean } | { error: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { error: "Wpisz poprawny adres e-mail." };
  const db = await supabase();
  if (!db) return { error: "Konto nie jest dostępne w tej wersji aplikacji." };

  const { data } = await db.auth.getSession();
  if (data.session?.user.is_anonymous) {
    const { error } = await db.auth.updateUser({ email });
    if (!error) return { mode: "link" };
    if (error.code !== "email_exists") return { error: describeSend(error) };
    const login = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    return login.error ? { error: describeSend(login.error) } : { mode: "login", existing: true };
  }
  const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return error ? { error: describeSend(error) } : { mode: "login" };
}

export async function verifyCode(rawEmail: string, code: string, mode: CodeMode): Promise<string | null> {
  const token = code.replace(/\s+/g, "");
  if (!/^\d{6,10}$/.test(token)) return "Wpisz kod z e-maila (same cyfry).";
  const db = await supabase();
  if (!db) return "Konto nie jest dostępne w tej wersji aplikacji.";
  const email = rawEmail.trim().toLowerCase();
  const { error } = await db.auth.verifyOtp({ email, token, type: mode === "link" ? "email_change" : "email" });
  if (error) return describe(error);
  // od razu, nie czekając na zdarzenie z onAuthStateChange
  const { data } = await db.auth.getSession();
  setState(fromSession(data.session));
  return null;
}

/** Wylogowanie. Postęp zostaje na tym telefonie; kopia w chmurze czeka na ponowne zalogowanie. */
export async function signOut(): Promise<void> {
  const db = await supabase();
  if (!db) return;
  await db.auth.signOut();
  setState({ status: "signed-out" });
}

// ── Hasło ──

export const MIN_PASSWORD = 8;

/** Co jest nie tak z hasłem (null – w porządku). Bcrypt w Supabase bierze najwyżej 72 bajty. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) return `Hasło musi mieć co najmniej ${MIN_PASSWORD} znaków.`;
  if (new TextEncoder().encode(password).length > 72) return "Hasło jest za długie (najwyżej 72 znaki).";
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return "Hasło musi zawierać litery i cyfry.";
  return null;
}

/** Logowanie e-mailem i hasłem. Sesja anonimowa zostaje zastąpiona – postęp z telefonu dołączy do kopii konta. */
export async function signInWithPassword(rawEmail: string, password: string): Promise<string | null> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return "Wpisz poprawny adres e-mail.";
  if (!password) return "Wpisz hasło.";
  const db = await supabase();
  if (!db) return "Konto nie jest dostępne w tej wersji aplikacji.";
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return describe(error);
  setState(fromSession(data.session));
  return null;
}

/** Ustawia albo zmienia hasło zalogowanego konta (po kodzie z e-maila; przy Google – opcjonalnie). */
export async function setPassword(password: string): Promise<string | null> {
  const problem = passwordProblem(password);
  if (problem) return problem;
  const db = await supabase();
  if (!db) return "Konto nie jest dostępne w tej wersji aplikacji.";
  const { error } = await db.auth.updateUser({ password, data: { has_password: true } });
  if (error) return describe(error);
  const { data } = await db.auth.getSession();
  setState(fromSession(data.session));
  return null;
}

// ── Google ──

/** Identyfikator klienta OAuth typu „Aplikacja internetowa” z Google Cloud (publiczny). Bez niego – bez przycisku Google. */
const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
export const GOOGLE_ENABLED = SUPABASE_ENABLED && Boolean(GOOGLE_WEB_CLIENT_ID);

/** Uczeń zamknął okno Google bez wyboru konta – nie pokazujemy błędu. */
export const GOOGLE_CANCELLED = "cancelled";

let googleReady: Promise<void> | null = null;

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Logowanie przez Google. Zwraca null (zalogowano / trwa przekierowanie), GOOGLE_CANCELLED albo komunikat błędu.
 * Konto anonimowe: Google dopinamy do tego samego konta; gdy to konto Google jest już przy innym koncie Matmy –
 * logujemy na tamto (jak przy kodzie dla istniejącego e-maila).
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!GOOGLE_ENABLED) return "Logowanie przez Google nie jest dostępne w tej wersji aplikacji.";
  const db = await supabase();
  if (!db) return "Konto nie jest dostępne w tej wersji aplikacji.";
  const { data: current } = await db.auth.getSession();
  const anonymous = Boolean(current.session?.user.is_anonymous);

  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) {
    // przeglądarka: przekierowanie do Google i powrót na tę samą stronę (sesję odczyta klient – detectSessionInUrl)
    const redirectTo = window.location.href.split("#")[0];
    const { error } = anonymous
      ? await db.auth.linkIdentity({ provider: "google", options: { redirectTo } })
      : await db.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
    return error ? describe(error) : null;
  }

  const { SocialLogin } = await import("@capgo/capacitor-social-login");
  // potrzebujemy tylko tokenu ID – bez dodatkowej autoryzacji, która na zwykłym BridgeActivity potrafi się zawiesić
  googleReady ??= SocialLogin.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID, mode: "online", skipAuthOnlyAuthorizationAfterSignIn: true } });
  try {
    await googleReady;
  } catch (e) {
    googleReady = null;
    console.warn("Google: inicjalizacja", e);
    return "Nie udało się uruchomić logowania Google.";
  }

  // nonce: do Google skrót SHA-256, do Supabase surowa wartość – Supabase sam porównuje skrót z tokenem
  const nonce = crypto.randomUUID();
  let token: string | null = null;
  try {
    const { result } = await SocialLogin.login({ provider: "google", options: { nonce: await sha256Hex(nonce) } });
    token = result.responseType === "online" ? result.idToken : null;
  } catch (e) {
    const message = String((e as Error)?.message ?? e);
    if (/cancel/i.test(message)) return GOOGLE_CANCELLED;
    console.warn("Google: logowanie", e);
    return "Nie udało się zalogować przez Google. Spróbuj ponownie albo użyj e-maila.";
  }
  if (!token) return "Google nie zwrócił danych logowania. Spróbuj ponownie.";

  const credentials: SignInWithIdTokenCredentials = { provider: "google", token, nonce };
  if (anonymous) {
    const linked = await db.auth.linkIdentity(credentials);
    if (!linked.error) {
      setState(fromSession(linked.data.session));
      return null;
    }
    if (linked.error.code !== "identity_already_exists") return describe(linked.error);
  }
  const { data, error } = await db.auth.signInWithIdToken(credentials);
  if (error) return describe(error);
  setState(fromSession(data.session));
  return null;
}
