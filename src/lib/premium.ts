import { useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { accountState, subscribeAccount } from "@/lib/account";
import { supabase, SUPABASE_ANON_KEY, SUPABASE_ENABLED, SUPABASE_URL } from "@/lib/supabase";

// Premium, dzienny limit AI i kody poleceń. O wszystkim decyduje serwer (migracja 20261102120000_premium_referrals):
// aplikacja czyta stan z account_status() i woła funkcje, sama niczego nie nalicza – stanu lokalnego
// nie da się więc „podkręcić”. Konto (anonimowe) zakładamy dopiero przy pierwszej akcji, która go wymaga
// (wiadomość do AI, własny kod, wpisanie kodu) – samo otwarcie ekranu nie tworzy konta.

import { AI_FREE_DAILY_LIMIT, GRADING_DAILY_LIMIT, REFERRAL_DAYS } from "@/lib/limits";

export { AI_FREE_DAILY_LIMIT, AI_PREMIUM_DAILY_LIMIT, GRADING_DAILY_LIMIT, REFERRAL_DAYS } from "@/lib/limits";

export interface PremiumState {
  status: "unavailable" | "no-account" | "loading" | "ready" | "error";
  premiumUntil: Date | null;
  aiUsed: number;
  aiLimit: number;
  referralCode: string | null;
  referralCount: number;
  /** Oceny zdjęć dziś / dzienny limit (0 bez Premium). */
  gradingUsed: number;
  gradingLimit: number;
}

const INITIAL: PremiumState = {
  status: SUPABASE_ENABLED ? "loading" : "unavailable",
  premiumUntil: null,
  aiUsed: 0,
  aiLimit: AI_FREE_DAILY_LIMIT,
  referralCode: null,
  referralCount: 0,
  gradingUsed: 0,
  gradingLimit: 0,
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
  /** Od migracji 20261108120000 – na starszej bazie brak (wtedy 0). */
  grading_used?: number;
  grading_limit?: number;
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
        gradingUsed: row.grading_used ?? 0,
        gradingLimit: row.grading_limit ?? 0,
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

// ── Kody podarunkowe i z przedsprzedaży (migracja 20261109120000_gift_codes) ──

/** Kod podarunkowy: 12 znaków (pokazywany jako XXXX-XXXX-XXXX), ten sam alfabet co kody poleceń. */
export const GIFT_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{12}$/;

const GIFT_ERRORS: Record<string, string> = {
  MA021: "Nie ma takiego kodu – sprawdź, czy jest przepisany bez pomyłki.",
  MA022: "Ten kod już wygasł.",
  MA023: "Ten kod był już wpisany na tym koncie.",
  MA024: "Za dużo nieudanych prób. Spróbuj ponownie za godzinę.",
  MA025: "Ten kod został już wykorzystany.",
};

export type RedeemResult = { until: Date; days: number } | { error: string };

/**
 * Pole „Masz kod?”: rozpoznaje rodzaj po długości – 6 znaków to kod polecenia, 12 – podarunkowy/z przedsprzedaży.
 * Dni i datę końca Premium zwraca serwer.
 */
export async function redeemCode(input: string): Promise<RedeemResult> {
  const code = normalizeReferralCode(input);
  if (code.length !== 12) {
    const outcome = await redeemReferralCode(code);
    return "until" in outcome ? { ...outcome, days: REFERRAL_DAYS } : outcome;
  }
  if (!GIFT_CODE_PATTERN.test(code)) return { error: GIFT_ERRORS.MA021 };
  try {
    const session = await client(true);
    if (!session) return { error: "Kody nie są dostępne w tej wersji aplikacji." };
    const { data, error } = await session.db.rpc("redeem_gift_code", { p_code: code });
    if (error) return { error: "Nie udało się wpisać kodu. Spróbuj ponownie za chwilę." };
    const row = (Array.isArray(data) ? data[0] : data) as { premium_until: string | null; days: number | null; error: string | null };
    if (row.error || !row.premium_until || !row.days) return { error: GIFT_ERRORS[row.error ?? ""] ?? "Nie udało się wpisać kodu. Spróbuj ponownie za chwilę." };
    await refreshPremium();
    return { until: new Date(row.premium_until), days: row.days };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/** Wpisuje kod znajomego. Zwraca datę końca Premium albo komunikat błędu. */
export async function redeemReferralCode(input: string): Promise<{ until: Date } | { error: string }> {
  const code = normalizeReferralCode(input);
  if (!REFERRAL_CODE_PATTERN.test(code)) return { error: "Kod polecenia ma 6 znaków, a kod podarunkowy 12 – litery i cyfry." };
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

/** Po odpowiedzi serwera na przepisanie/ocenę: ile ocen zostało na dziś (nagłówek `x-grading-remaining`). */
export function noteGradingRemaining(remaining: number) {
  if (!Number.isFinite(remaining)) return;
  const limit = state.gradingLimit || GRADING_DAILY_LIMIT;
  setState({ gradingLimit: limit, gradingUsed: Math.max(0, limit - remaining) });
}

/** Ocena zdjęć jest w Premium – serwer odmówił (403 premium_required). */
export class PremiumRequiredError extends Error {
  constructor() {
    super("Ocena rozwiązania ze zdjęcia jest w Premium.");
    this.name = "PremiumRequiredError";
  }
}

/** Dzienny limit ocen zdjęć wyczerpany (429 grading_limit). */
export class GradingLimitError extends Error {
  constructor() {
    super(`Na dziś wykorzystano limit ${GRADING_DAILY_LIMIT} ocen zdjęć. Wróć jutro – a teraz oceń kroki samodzielnie.`);
    this.name = "GradingLimitError";
  }
}
