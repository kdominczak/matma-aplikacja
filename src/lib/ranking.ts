import { useEffect, useState, useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, SUPABASE_ENABLED, SUPABASE_URL } from "@/lib/supabase";

// Ranking = liczba POPRAWNIE rozwiązanych zadań, policzona przez serwer z historii odpowiedzi
// (record_answers sam ocenia każdą odpowiedź). Tu: konto, profil, zdjęcie i tabela wyników.

export interface RankingProfile {
  id: string;
  nick: string;
  streak: number;
  best_streak: number;
  last_active: string | null;
  avatar_version: number | null;
}

export interface LeaderboardRow {
  rank: number;
  user_id: string;
  nick: string;
  avatar_version: number | null;
  solved: number;
  streak: number;
  is_me: boolean;
}

export interface RankingSummary {
  solvedWeek: number;
  rankWeek: number;
  solvedAll: number;
  rankAll: number;
}

export type LeaderboardPeriod = "week" | "all";

export type RankingState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "guest" }
  | { status: "member"; profile: RankingProfile }
  | { status: "error"; message: string };

export const NICK_PATTERN = /^[A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż_.-]{3,20}$/;

// ── Magazyn stanu rankingu ──

let state: RankingState = SUPABASE_ENABLED ? { status: "loading" } : { status: "disabled" };
let initializing: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: RankingState) {
  state = next;
  listeners.forEach((l) => l());
}

/**
 * Wczytuje stan konta (raz). Zapis wyników na niego czeka – ekrany zadań działają bez powłoki aplikacji,
 * więc nie można zakładać, że ktoś już wcześniej „obudził” ranking (wcześniej przez to wyniki po odświeżeniu przepadały).
 */
export function rankingReady(): Promise<void> {
  if (!SUPABASE_ENABLED) return Promise.resolve();
  initializing ??= init();
  return initializing;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void rankingReady();
  return () => listeners.delete(listener);
}

const SERVER_STATE: RankingState = { status: "loading" };

export function useRanking(): RankingState {
  return useSyncExternalStore(subscribe, () => state, () => (SUPABASE_ENABLED ? SERVER_STATE : state));
}

async function fetchOwnProfile(userId: string): Promise<RankingProfile | null> {
  const db = (await supabase())!;
  const { data, error } = await db
    .from("profiles")
    .select("id, nick, streak, best_streak, last_active, avatar_version")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as RankingProfile | null;
}

async function init() {
  const db = await supabase();
  if (!db) return;
  try {
    // pozostałość po rankingu z XP – kolejka nie jest już używana
    await Preferences.remove({ key: "ranking.pending" });
    const { data, error } = await db.auth.getSession();
    // bez internetu odświeżenie sesji się nie udaje – to nie znaczy, że uczeń nie ma konta
    if (error) throw error;
    const userId = data.session?.user.id;
    const profile = userId ? await fetchOwnProfile(userId) : null;
    setState(profile ? { status: "member", profile } : { status: "guest" });
  } catch {
    setState({ status: "error", message: "Nie udało się połączyć z rankingiem. Sprawdź internet." });
  }
}

/** Id konta w rankingu – null, gdy uczeń nie dołączył (albo stan jeszcze się nie wczytał). */
export function memberId(): string | null {
  return state.status === "member" ? state.profile.id : null;
}

/** Jak memberId(), ale najpierw czeka na wczytanie stanu konta. */
export async function readyMemberId(): Promise<string | null> {
  await rankingReady();
  return memberId();
}

export function retryRanking() {
  setState({ status: "loading" });
  initializing = init();
}

/** Ponawia połączenie z kontem po wcześniejszym błędzie (np. po powrocie internetu). */
export function retryRankingIfFailed() {
  if (state.status === "error") retryRanking();
}

/** Odświeża profil (np. serię dni) po zapisaniu odpowiedzi na serwerze. */
export async function refreshOwnProfile() {
  const id = memberId();
  if (!id) return;
  const profile = await fetchOwnProfile(id).catch(() => null);
  if (profile) setState({ status: "member", profile });
}

// ── Dołączanie, zmiana nicku, wypisanie ──

function nickError(error: PostgrestError): string {
  if (error.code === "23505") return "Ten nick jest już zajęty – wybierz inny.";
  if (error.code === "23514") return "Nick może mieć 3–20 znaków: litery, cyfry, _ . -";
  return "Nie udało się zapisać nicku. Spróbuj ponownie.";
}

/** Dołącza do rankingu: anonimowe konto (bez e-maila) + profil z nickiem. Zwraca komunikat błędu albo null. */
export async function joinRanking(nick: string): Promise<string | null> {
  const db = await supabase();
  if (!db) return "Ranking nie jest dostępny.";
  if (!NICK_PATTERN.test(nick)) return "Nick może mieć 3–20 znaków: litery, cyfry, _ . -";

  let { data } = await db.auth.getSession();
  if (!data.session) {
    const signIn = await db.auth.signInAnonymously();
    if (signIn.error || !signIn.data.session) return "Nie udało się utworzyć konta w rankingu. Spróbuj ponownie.";
    data = { session: signIn.data.session };
  }
  const id = data.session!.user.id;
  const { error } = await db.from("profiles").insert({ id, nick });
  if (error) return nickError(error);

  const profile = await fetchOwnProfile(id);
  if (profile) setState({ status: "member", profile });
  return null;
}

export async function renameNick(nick: string): Promise<string | null> {
  const db = await supabase();
  if (!db || state.status !== "member") return "Najpierw dołącz do rankingu.";
  if (!NICK_PATTERN.test(nick)) return "Nick może mieć 3–20 znaków: litery, cyfry, _ . -";
  const { data, error } = await db
    .from("profiles")
    .update({ nick })
    .eq("id", state.profile.id)
    .select("id, nick, streak, best_streak, last_active, avatar_version")
    .single();
  if (error) return nickError(error);
  setState({ status: "member", profile: data as RankingProfile });
  return null;
}

/**
 * Usuwa profil z rankingu (razem z historią odpowiedzi i zdjęciem). Konto anonimowe – istniejące tylko dla
 * rankingu – wylogowujemy; konto z e-mailem zostaje (trzyma kopię postępu i historię arkuszy).
 */
export async function leaveRanking(): Promise<void> {
  const db = await supabase();
  if (!db || state.status !== "member") return;
  const id = state.profile.id;
  await db.storage.from("avatars").remove([`${id}.jpg`]);
  await db.from("profiles").delete().eq("id", id);
  const { data } = await db.auth.getSession();
  if (data.session?.user.is_anonymous) await db.auth.signOut();
  setState({ status: "guest" });
}

// ── Zdjęcie profilowe w rankingu ──

/** Publiczny adres zdjęcia z rankingu; `version` w adresie omija pamięć podręczną po zmianie zdjęcia. */
export function avatarUrl(userId: string, version: number | null): string | null {
  if (!SUPABASE_URL || !version) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${userId}.jpg?v=${version}`;
}

/** Wgrywa zdjęcie (JPEG 256×256) jako avatars/<id>.jpg i zapisuje nową wersję w profilu. */
export async function uploadRankingAvatar(jpeg: Blob): Promise<string | null> {
  const db = await supabase();
  if (!db || state.status !== "member") return "Najpierw dołącz do rankingu.";
  const id = state.profile.id;
  const upload = await db.storage.from("avatars").upload(`${id}.jpg`, jpeg, { upsert: true, contentType: "image/jpeg" });
  if (upload.error) return "Nie udało się wysłać zdjęcia. Spróbuj ponownie.";
  const version = Math.floor(Date.now() / 1000);
  const { data, error } = await db
    .from("profiles")
    .update({ avatar_version: version })
    .eq("id", id)
    .select("id, nick, streak, best_streak, last_active, avatar_version")
    .single();
  if (error) return "Zdjęcie wysłane, ale nie udało się zapisać profilu.";
  setState({ status: "member", profile: data as RankingProfile });
  return null;
}

export async function removeRankingAvatar() {
  const db = await supabase();
  if (!db || state.status !== "member") return;
  const id = state.profile.id;
  await db.storage.from("avatars").remove([`${id}.jpg`]);
  const { data } = await db
    .from("profiles")
    .update({ avatar_version: null })
    .eq("id", id)
    .select("id, nick, streak, best_streak, last_active, avatar_version")
    .single();
  if (data) setState({ status: "member", profile: data as RankingProfile });
}

// ── Tabela wyników ──

export async function fetchLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardRow[]> {
  const db = await supabase();
  if (!db) return [];
  await rankingReady(); // „Ty” w tabeli wymaga wczytanej sesji
  const { data, error } = await db.rpc("leaderboard", { p_period: period, p_limit: 50 });
  if (error) throw error;
  return (data as LeaderboardRow[]).map((row) => ({ ...row, rank: Number(row.rank), solved: Number(row.solved) }));
}

export async function fetchRankingSummary(): Promise<RankingSummary | null> {
  const db = await supabase();
  if (!db || !(await readyMemberId())) return null;
  const { data, error } = await db.rpc("my_ranking_summary");
  if (error) throw error;
  const row = (data as { solved_week: number; rank_week: number; solved_all: number; rank_all: number }[] | null)?.[0];
  if (!row) return null;
  return {
    solvedWeek: Number(row.solved_week),
    rankWeek: Number(row.rank_week),
    solvedAll: Number(row.solved_all),
    rankAll: Number(row.rank_all),
  };
}

/**
 * Podsumowanie miejsca w rankingu z obsługą błędu: `error` = nie udało się pobrać (pokaż „Spróbuj ponownie”).
 * `refreshKey` – zmiana (np. nowy profil po zapisanej sesji) pobiera dane od nowa.
 */
export function useRankingSummary(enabled: boolean, refreshKey?: unknown) {
  const [summary, setSummary] = useState<RankingSummary | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetchRankingSummary()
      .then((s) => {
        if (!active) return;
        setSummary(s);
        setError(false);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [enabled, refreshKey, attempt]);

  return { summary, error, retry: () => setAttempt((n) => n + 1) };
}

/** Nasłuch zmian w profilach (Supabase Realtime) – każda zapisana sesja kogoś z rankingu odświeża tabelę. */
export function watchLeaderboard(onChange: () => void): () => void {
  let stopped = false;
  let stop = () => {};
  void supabase().then((db) => {
    if (!db || stopped) return;
    const channel = db
      .channel(`leaderboard-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, onChange)
      .subscribe();
    stop = () => void db.removeChannel(channel);
  });
  return () => {
    stopped = true;
    stop();
  };
}
