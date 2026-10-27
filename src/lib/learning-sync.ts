import { Preferences } from "@capacitor/preferences";
import { readyMemberId, refreshOwnProfile } from "@/lib/ranking";
import { supabase } from "@/lib/supabase";
import type { Mistake } from "@/types/progress";
import type { OptionKey, QuizAnswer } from "@/types/quiz";

// Synchronizacja historii odpowiedzi i „Pudełka porażek” z Supabase – tylko dla uczniów w rankingu (mają konto).
// Odpowiedzi czekają w kolejce na urządzeniu, więc nic nie ginie bez internetu.
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
  const { value } = await Preferences.get({ key: PENDING_KEY });
  try {
    return value ? (JSON.parse(value) as PendingAnswer[]) : [];
  } catch {
    return [];
  }
}

async function writePending(pending: PendingAnswer[]) {
  if (pending.length > 0) await Preferences.set({ key: PENDING_KEY, value: JSON.stringify(pending.slice(-MAX_PENDING)) });
  else await Preferences.remove({ key: PENDING_KEY });
}

/** Dopisuje odpowiedzi z ukończonej sesji do kolejki i próbuje je wysłać. */
export async function queueAnswers(source: AnswerSource, answers: QuizAnswer[]) {
  if (answers.length === 0 || !(await readyMemberId())) return;
  const pending = await readPending();
  pending.push(...answers.map((a) => ({ q: a.questionId, c: a.chosen, s: source })));
  await writePending(pending);
  await flushAnswers();
}

let flushing: Promise<boolean> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

/** Wysyła kolejkę paczkami. Zwraca true, gdy kolejka jest pusta (serwer ma wszystkie odpowiedzi). */
export function flushAnswers(): Promise<boolean> {
  flushing ??= doFlush().finally(() => {
    flushing = null;
  });
  return flushing;
}

async function doFlush(): Promise<boolean> {
  const db = supabase();
  if (!db || !(await readyMemberId())) return false;
  let pending = await readPending();
  let sent = false;
  while (pending.length > 0) {
    // paczka = kolejne odpowiedzi z jednego źródła (record_answers przyjmuje jedno źródło na wywołanie)
    const source = pending[0].s;
    let size = 0;
    while (size < pending.length && size < BATCH && pending[size].s === source) size++;
    const batch = pending.slice(0, size);

    const { error } = await db.rpc("record_answers", {
      p_source: source,
      p_answers: batch.map(({ q, c }) => ({ q, c })),
    });
    if (error) {
      if (error.code === "MA001") {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(() => void flushAnswers(), 4_000);
        return false;
      }
      if (error.code !== "MA002" && error.code !== "22023") return false; // sieć itp. – spróbujemy później
      // dzienny limit albo odrzucona paczka – porzucamy ją, żeby nie blokowała kolejnych
    }
    pending = pending.slice(size);
    await writePending(pending);
    sent = true;
  }
  if (sent) void refreshOwnProfile(); // seria dni w profilu rankingu
  return true;
}

/** Pudełko porażek z serwera w formacie aplikacji – null, gdy synchronizacja jest niemożliwa. */
export async function fetchServerMistakes(): Promise<Record<string, Mistake> | null> {
  const db = supabase();
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
  const db = supabase();
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
  await Preferences.remove({ key: PENDING_KEY });
  const db = supabase();
  if (!db || !(await readyMemberId())) return;
  await db.rpc("reset_learning_data");
}
