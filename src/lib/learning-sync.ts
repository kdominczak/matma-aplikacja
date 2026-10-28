import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { readyMemberId, refreshOwnProfile, retryRankingIfFailed } from "@/lib/ranking";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import type { Mistake } from "@/types/progress";
import type { OptionKey, QuizAnswer } from "@/types/quiz";

// Synchronizacja historii odpowiedzi i „Pudełka porażek” z Supabase – wysyłamy tylko dla uczniów w rankingu (mają konto).
// Odpowiedzi czekają w kolejce na urządzeniu – także przed dołączeniem do rankingu – więc nic nie ginie
// bez internetu, a zadania rozwiązane przed dołączeniem liczą się po założeniu konta.
// Serwer sam ocenia poprawność (supabase/migrations/…_learning_history.sql) – wysyłamy tylko wybraną literę.

export type AnswerSource = "test" | "daily" | "training" | "placement";

interface PendingAnswer {
  q: string;
  c: OptionKey;
  s: AnswerSource;
}

const PENDING_KEY = "sync.answers";
const IMPORTED_KEY = "sync.mistakesImported"; // id konta, dla którego lokalne pudełko trafiło już na serwer
const BATCH = 30; // limit record_answers()
const MAX_PENDING = 600;

async function readPending(): Promise<PendingAnswer[]> {
  try {
    const { value } = await Preferences.get({ key: PENDING_KEY });
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? (parsed as PendingAnswer[]) : [];
  } catch {
    return [];
  }
}

// Kolejkę zmieniają dwie strony naraz (dopisywanie po sesji i wysyłka w tle). Każda zmiana
// czyta i zapisuje ją pod blokadą – inaczej wysyłka zapisałaby starą kopię i zgubiła nowe odpowiedzi.
let queueLock: Promise<unknown> = Promise.resolve();

function withQueue<T>(change: (pending: PendingAnswer[]) => { next: PendingAnswer[]; result: T }): Promise<T> {
  const run = queueLock.then(async () => {
    const { next, result } = change(await readPending());
    await writePending(next);
    return result;
  });
  queueLock = run.catch(() => {});
  return run;
}

const sameAnswer = (a: PendingAnswer, b: PendingAnswer) => a.q === b.q && a.c === b.c && a.s === b.s;

async function writePending(pending: PendingAnswer[]) {
  if (pending.length > 0) await Preferences.set({ key: PENDING_KEY, value: JSON.stringify(pending.slice(-MAX_PENDING)) });
  else await Preferences.remove({ key: PENDING_KEY });
  setStatus({ pending: Math.min(pending.length, MAX_PENDING) });
}

// ── Stan synchronizacji (widoczny w rankingu, żeby problem z zapisem nie był cichy) ──

export interface SyncStatus {
  /** Odpowiedzi czekające na wysłanie. */
  pending: number;
  /** Ostatni błąd zapisu (np. brak migracji) – null, gdy wszystko doszło. */
  error: string | null;
  /** Odpowiedzi odrzucone, bo serwer nie zna klucza zadania (nie wgrano seeda `question_keys.sql`). */
  unknown: number;
  lastSyncAt: string | null;
}

let status: SyncStatus = { pending: 0, error: null, unknown: 0, lastSyncAt: null };
const statusListeners = new Set<() => void>();
let statusLoaded = false;

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  statusListeners.forEach((l) => l());
}

function subscribeStatus(listener: () => void) {
  statusListeners.add(listener);
  if (!statusLoaded) {
    statusLoaded = true;
    void readPending().then((p) => setStatus({ pending: p.length }));
  }
  return () => statusListeners.delete(listener);
}

const EMPTY_STATUS: SyncStatus = { pending: 0, error: null, unknown: 0, lastSyncAt: null };

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(subscribeStatus, () => status, () => EMPTY_STATUS);
}

function describeError(error: { code?: string; message?: string }): string {
  if (error.code === "PGRST202" || error.code === "42883") return "Na serwerze brakuje funkcji record_answers – uruchom migracje z supabase/migrations.";
  if (error.code === "MA003") return "Serwer nie widzi Twojego profilu w rankingu.";
  if (error.code === "42501") return "Brak uprawnień do zapisu odpowiedzi – sprawdź migracje.";
  if (!error.code) return "Brak połączenia z serwerem – odpowiedzi wyślemy później.";
  return `Serwer odrzucił zapis (${error.code}).`;
}

/** Dopisuje odpowiedzi z ukończonej sesji do kolejki i próbuje je wysłać (gdy uczeń jest w rankingu). */
export async function queueAnswers(source: AnswerSource, answers: QuizAnswer[]) {
  if (answers.length === 0 || !SUPABASE_ENABLED) return;
  const added = answers.map((a) => ({ q: a.questionId, c: a.chosen, s: source }));
  await withQueue((pending) => ({ next: [...pending, ...added], result: undefined }));
  await flushAnswers();
}

let flushing: Promise<boolean> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
const MIN_RETRY_MS = 15_000;
const MAX_RETRY_MS = 5 * 60_000;
let retryDelay = MIN_RETRY_MS;

/** Wysyła kolejkę paczkami. Zwraca true, gdy kolejka jest pusta (serwer ma wszystkie odpowiedzi). */
export function flushAnswers(): Promise<boolean> {
  flushing ??= doFlush().finally(() => {
    flushing = null;
  });
  return flushing;
}

async function doFlush(): Promise<boolean> {
  const db = await supabase();
  if (!db || !(await readyMemberId())) return false;
  let pending = await readPending();
  let sent = false;
  clearTimeout(retryTimer);
  while (pending.length > 0) {
    // paczka = kolejne odpowiedzi z jednego źródła (record_answers przyjmuje jedno źródło na wywołanie)
    const source = pending[0].s;
    let size = 0;
    while (size < pending.length && size < BATCH && pending[size].s === source) size++;
    const batch = pending.slice(0, size);

    const { data, error } = await db.rpc("record_answers", {
      p_source: source,
      p_answers: batch.map(({ q, c }) => ({ q, c })),
    });
    if (error) {
      if (error.code === "MA001") {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => void flushAnswers(), 4_000);
        return false;
      }
      if (error.code !== "MA002" && error.code !== "22023") {
        // sieć, brak migracji itp. – kolejka zostaje, ponawiamy z rosnącą przerwą (i od razu po powrocie internetu)
        console.warn("record_answers:", error);
        setStatus({ error: describeError(error) });
        retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
        retryTimer = setTimeout(() => void flushAnswers(), retryDelay);
        return false;
      }
      // dzienny limit albo odrzucona paczka – porzucamy ją, żeby nie blokowała kolejnych
    }
    const result = (Array.isArray(data) ? data[0] : data) as { skipped?: number } | null;
    if (result?.skipped) setStatus({ unknown: status.unknown + result.skipped });
    // zdejmujemy wysłaną paczkę z aktualnej kolejki (w międzyczasie mogły dojść nowe odpowiedzi na końcu)
    pending = await withQueue((current) => {
      const stillFirst = batch.every((item, i) => current[i] && sameAnswer(current[i], item));
      const next = stillFirst ? current.slice(size) : current;
      return { next, result: next };
    });
    sent = true;
  }
  retryDelay = MIN_RETRY_MS;
  setStatus({ error: null, lastSyncAt: new Date().toISOString() });
  if (sent) void refreshOwnProfile(); // seria dni w profilu rankingu
  return true;
}

/**
 * Synchronizacja w tle (raz, w głównym layoucie): po powrocie internetu i po powrocie do aplikacji
 * wysyłamy zaległe odpowiedzi – także gdy wcześniej nie udało się połączyć z kontem.
 */
export function startBackgroundSync(): () => void {
  if (!SUPABASE_ENABLED) return () => {};
  const kick = () => {
    retryRankingIfFailed();
    void flushAnswers();
    void flushMistakes();
  };
  const onVisibility = () => document.visibilityState === "visible" && kick();
  window.addEventListener("online", kick);
  document.addEventListener("visibilitychange", onVisibility);
  kick();
  return () => {
    window.removeEventListener("online", kick);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

// ── Pomyłki dodane ręcznie (np. „Dodaj błędy do Pudełka porażek” po arkuszu) ──
// Czekają w kolejce, bo synchronizacja przyjmuje stan pudełka z serwera – bez wysłania by zniknęły.

const PENDING_MISTAKES_KEY = "sync.mistakes";

export interface MistakeImport {
  q: string;
  c: OptionKey;
  n: number;
  d: string;
}

async function readPendingMistakes(): Promise<MistakeImport[]> {
  try {
    const { value } = await Preferences.get({ key: PENDING_MISTAKES_KEY });
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let mistakesLock: Promise<unknown> = Promise.resolve();

function withMistakes<T>(run: (pending: MistakeImport[]) => Promise<{ next: MistakeImport[]; result: T }>): Promise<T> {
  const job = mistakesLock.then(async () => {
    const { next, result } = await run(await readPendingMistakes());
    if (next.length > 0) await Preferences.set({ key: PENDING_MISTAKES_KEY, value: JSON.stringify(next.slice(-300)) });
    else await Preferences.remove({ key: PENDING_MISTAKES_KEY });
    return result;
  });
  mistakesLock = job.catch(() => {});
  return job;
}

export async function queueMistakes(items: MistakeImport[]) {
  if (items.length === 0 || !SUPABASE_ENABLED) return;
  await withMistakes(async (pending) => ({ next: [...pending, ...items], result: undefined }));
  await flushMistakes();
}

/** Wysyła kolejkę pomyłek (import_mistakes scala je z pudełkiem na koncie). True, gdy kolejka jest pusta. */
export function flushMistakes(): Promise<boolean> {
  return withMistakes(async (pending) => {
    if (pending.length === 0) return { next: pending, result: true };
    const db = await supabase();
    if (!db || !(await readyMemberId())) return { next: pending, result: false };
    const { error } = await db.rpc("import_mistakes", { p_mistakes: pending.slice(0, 300) });
    if (error) {
      console.warn("import_mistakes:", error);
      return { next: pending, result: false };
    }
    return { next: pending.slice(300), result: pending.length <= 300 };
  });
}

/** Pudełko porażek z serwera w formacie aplikacji – null, gdy synchronizacja jest niemożliwa. */
export async function fetchServerMistakes(): Promise<Record<string, Mistake> | null> {
  const db = await supabase();
  if (!db || !(await readyMemberId())) return null;
  const { data, error } = await db.from("mistakes").select("question_id, chosen, wrong_count, last_wrong");
  if (error) return null;
  return Object.fromEntries(
    (data as { question_id: string; chosen: OptionKey; wrong_count: number; last_wrong: string }[]).map((m) => [
      m.question_id,
      { chosen: m.chosen, count: m.wrong_count, lastWrong: m.last_wrong },
    ]),
  );
}

/** Jednorazowo przenosi lokalne pudełko na konto (np. pomyłki sprzed dołączenia do rankingu). */
export async function importLocalMistakesOnce(local: Record<string, Mistake>): Promise<boolean> {
  const db = await supabase();
  const id = await readyMemberId();
  if (!db || !id) return false;
  const { value } = await Preferences.get({ key: IMPORTED_KEY });
  if (value === id) return true;

  const items = Object.entries(local)
    .slice(0, 300)
    .map(([q, m]) => ({ q, c: m.chosen, n: m.count, d: m.lastWrong }));
  if (items.length > 0) {
    const { error } = await db.rpc("import_mistakes", { p_mistakes: items });
    if (error) return false;
  }
  await Preferences.set({ key: IMPORTED_KEY, value: id });
  return true;
}

/** Reset postępów: kasuje historię i pomyłki na serwerze oraz kolejkę na urządzeniu. */
export async function resetServerLearning() {
  await withQueue(() => ({ next: [], result: undefined }));
  await withMistakes(async () => ({ next: [], result: undefined }));
  const db = await supabase();
  if (!db || !(await readyMemberId())) return;
  await db.rpc("reset_learning_data");
}
