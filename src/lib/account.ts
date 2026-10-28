import { useSyncExternalStore } from "react";
import type { AuthError, Session } from "@supabase/supabase-js";
import { retryRanking } from "@/lib/ranking";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";

// Konto ucznia: e-mail + 6-cyfrowy kod (OTP). Kod zamiast magic linku, bo aplikacja to static export
// w Capacitorze – link z maila otworzyłby przeglądarkę, a nie aplikację.
//
// • Uczeń z anonimowym kontem (ranking) – e-mail dopinamy do TEGO SAMEGO konta (auth.updateUser),
//   więc ranking, historia odpowiedzi i pudełko na serwerze zostają.
// • Uczeń bez konta albo na nowym telefonie – logowanie kodem (tworzy konto, jeśli go nie ma).
// Postęp z urządzenia trafia do kopii w chmurze (cloud-sync.ts) i scala się po zalogowaniu.

export type AccountState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "anonymous"; userId: string }
  | { status: "email"; userId: string; email: string };

/** Jak wysłany kod ma zostać potwierdzony. */
export type CodeMode = "link" | "login";

let state: AccountState = SUPABASE_ENABLED ? { status: "loading" } : { status: "disabled" };
let started: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: AccountState) {
  const prev = state;
  state = next;
  listeners.forEach((l) => l());
  // inne konto (logowanie, wylogowanie) – stan rankingu wczytujemy od nowa. Wyjątki: to samo konto
  // (dopięcie e-maila) i nowe konto anonimowe – to dołączanie do rankingu, które samo ustawia swój stan.
  const prevId = userIdOf(prev);
  const nextId = userIdOf(next);
  if (prev.status === "loading" || prevId === nextId) return;
  if (prev.status === "signed-out" && next.status === "anonymous") return;
  retryRanking();
}

function userIdOf(s: AccountState): string | null {
  return s.status === "anonymous" || s.status === "email" ? s.userId : null;
}

function fromSession(session: Session | null): AccountState {
  const user = session?.user;
  if (!user) return { status: "signed-out" };
  if (user.is_anonymous || !user.email) return { status: "anonymous", userId: user.id };
  return { status: "email", userId: user.id, email: user.email };
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

/** Czeka na wczytanie sesji i zwraca id konta (anonimowego albo z e-mailem). */
export async function accountUserId(): Promise<string | null> {
  await startAccount();
  return userIdOf(state);
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
    case "otp_expired":
      return "Kod jest nieprawidłowy albo wygasł. Wyślij nowy.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Logowanie e-mailem jest chwilowo wyłączone.";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return "Brak internetu. Połącz się i spróbuj ponownie.";
  return "Coś poszło nie tak. Spróbuj ponownie za chwilę.";
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
    if (error.code !== "email_exists") return { error: describe(error) };
    const login = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    return login.error ? { error: describe(login.error) } : { mode: "login", existing: true };
  }
  const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return error ? { error: describe(error) } : { mode: "login" };
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
