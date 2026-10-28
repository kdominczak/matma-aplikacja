import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { findQuestion } from "@/data/topics";
import { newlyEarned, type Achievement } from "@/lib/achievements";
import {
  fetchServerMistakes,
  flushAnswers,
  flushMistakes,
  importLocalMistakesOnce,
  queueAnswers,
  queueMistakes,
  resetServerLearning,
  type AnswerSource,
} from "@/lib/learning-sync";
import { scorePlacement } from "@/lib/placement";
import { mergeProgress } from "@/lib/progress-merge";
import { readyMemberId } from "@/lib/ranking";
import { dayKey, isPassed, starsFor, testKey } from "@/lib/stats";
import type { ExamAttempt } from "@/types/exam";
import type { Progress } from "@/types/progress";
import type { OptionKey, QuizAnswer, QuizResult } from "@/types/quiz";
import type { Difficulty, Target } from "@/types/topic";

// Obliczenia pomocnicze (seria, gwiazdki, poziomy…) – importowane razem z magazynem.
export * from "@/lib/stats";

// Preferences: natywny storage w aplikacji (odporny na czyszczenie WebView), localStorage w przeglądarce.
// Każdy zapis trafia też do kopii zapasowej – uszkodzony główny zapis nie zeruje postępu ucznia.
const STORAGE_KEY = "progress.v2";
const BACKUP_KEY = "progress.v2.backup";
/** Awaryjny zapis bezpośrednio w localStorage, gdy Preferences zawiedzie (np. błąd wtyczki natywnej). */
const FALLBACK_KEY = "matma.progress.fallback";

const EMPTY_PROGRESS: Progress = {
  activityByDay: {},
  tests: {},
  target: 30,
  stats: {
    answered: 0,
    correct: 0,
    perfectTests: 0,
    dailyChallenges: 0,
    nightSessions: 0,
    earlySessions: 0,
    mistakesBeaten: 0,
  },
  achievements: {},
  mistakes: {},
  topicStats: {},
  practice: {},
};

/** Wynik zapisu sesji – nowy stan i odznaki zdobyte właśnie teraz. */
export interface SaveOutcome {
  progress: Progress;
  earned: Achievement[];
}

// ── Magazyn współdzielony przez wszystkie ekrany ──

let current: Progress | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Jedno wczytanie na cały czas działania aplikacji. Zapis zawsze na nie czeka – inaczej wynik zapisany
 * zaraz po starcie zostałby nadpisany przez spóźnione wczytanie starego stanu.
 */
function ensureLoaded(): Promise<void> {
  loading ??= loadProgress().then((progress) => {
    current ??= progress;
    emit();
  });
  return loading;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureLoaded();
  return () => listeners.delete(listener);
}

/** Postęp użytkownika; `null` do czasu wczytania (także podczas prerenderu). */
export function useProgress(): Progress | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

async function readKey(key: string): Promise<string | null> {
  try {
    return (await Preferences.get({ key })).value;
  } catch {
    return null;
  }
}

function readFallback(): string | null {
  try {
    return window.localStorage.getItem(FALLBACK_KEY);
  } catch {
    return null;
  }
}

/** Najnowszy czytelny zapis: główny → kopia zapasowa → awaryjny localStorage. Nigdy nie rzuca. */
async function loadProgress(): Promise<Progress> {
  const candidates = [await readKey(STORAGE_KEY), await readKey(BACKUP_KEY), readFallback()];
  const parsed = candidates.map((value) => (value ? parseProgress(value) : null)).filter((p): p is Progress => p !== null);
  if (parsed.length === 0) return EMPTY_PROGRESS;
  // awaryjny zapis może być nowszy niż główny (gdy Preferences zawiodło) – bierzemy ten z największą liczbą odpowiedzi
  return parsed.reduce((best, p) => (p.stats.answered > best.stats.answered ? p : best));
}

function parseProgress(value: string): Progress | null {
  try {
    const saved = JSON.parse(value);
    if (!saved || typeof saved !== "object") return null;
    // Starsze zapisy liczyły serię z XP (xpByDay) – dni z XP to dni z nauką, więc przenosimy je do aktywności.
    const activityByDay: Record<string, number> =
      saved.activityByDay ??
      Object.fromEntries(Object.entries((saved.xpByDay ?? {}) as Record<string, number>).filter(([, xp]) => xp > 0).map(([day]) => [day, 1]));
    const { xp: _xp, xpByDay: _xpByDay, ...rest } = saved;
    void _xp;
    void _xpByDay;
    // starsze zapisy nie mają nowszych pól – uzupełniamy domyślnymi
    return { ...EMPTY_PROGRESS, ...rest, activityByDay, stats: { ...EMPTY_PROGRESS.stats, ...saved.stats } };
  } catch {
    return null;
  }
}

/** Zapisuje stan; gdy Preferences zawiedzie – awaryjnie do localStorage (i ponawia przy następnym zapisie). */
async function persist(progress: Progress) {
  const value = JSON.stringify(progress);
  try {
    await Preferences.set({ key: STORAGE_KEY, value });
    await Preferences.set({ key: BACKUP_KEY, value });
    try {
      window.localStorage.removeItem(FALLBACK_KEY);
    } catch {
      // localStorage niedostępny – nic do sprzątania
    }
  } catch (error) {
    console.warn("Zapis postępu przez Preferences nie powiódł się, używam localStorage:", error);
    try {
      window.localStorage.setItem(FALLBACK_KEY, value);
    } catch {
      // brak miejsca – stan zostaje w pamięci, kolejny zapis spróbuje ponownie
    }
  }
}

// Zapisy po kolei: dwa szybkie zapisy (np. dwa zadania z rzędu) nie nadpisują sobie nawzajem zmian.
let writes: Promise<unknown> = Promise.resolve();

function update(change: (progress: Progress) => Progress): Promise<SaveOutcome> {
  const run = writes.then(() => applyUpdate(change));
  writes = run.catch(() => {});
  return run;
}

async function applyUpdate(change: (progress: Progress) => Progress): Promise<SaveOutcome> {
  await ensureLoaded();
  let next = change(current ?? EMPTY_PROGRESS);
  const earned = newlyEarned(next);
  if (earned.length > 0) {
    const today = dayKey();
    next = {
      ...next,
      achievements: { ...next.achievements, ...Object.fromEntries(earned.map((a) => [a.id, today])) },
    };
  }
  current = next;
  emit();
  await persist(next);
  savedListeners.forEach((listener) => listener(next));
  return { progress: next, earned };
}

// ── Kopia w chmurze (cloud-sync.ts) ──

const savedListeners = new Set<(progress: Progress) => void>();

/** Wywoływane po każdym zapisie postępu – do wysłania kopii na konto. */
export function onProgressSaved(listener: (progress: Progress) => void): () => void {
  savedListeners.add(listener);
  return () => savedListeners.delete(listener);
}

/** Aktualny postęp (po wczytaniu z urządzenia). */
export async function readProgress(): Promise<Progress> {
  await ensureLoaded();
  return current ?? EMPTY_PROGRESS;
}

/** Scala kopię z chmury z postępem na urządzeniu. Zwraca false, gdy kopia jest nieczytelna. */
export async function mergeRemoteProgress(data: unknown, newer: "local" | "remote"): Promise<boolean> {
  const remote = parseProgress(JSON.stringify(data));
  if (!remote) return false;
  await ensureLoaded();
  // bez zmian (np. kopia zapisana przez ten sam telefon) – bez zapisu i bez ponownej wysyłki
  if (JSON.stringify(mergeProgress(current ?? EMPTY_PROGRESS, remote, newer)) === JSON.stringify(current)) return true;
  await update((progress) => mergeProgress(progress, remote, newer));
  return true;
}

// ── Zapis sesji ──

/** Dzień nauki: licznik rozwiązanych zadań (z niego liczymy serię dni i „zadania w tym tygodniu”). */
function addActivity(progress: Progress, count: number): Record<string, number> {
  if (count <= 0) return progress.activityByDay;
  const today = dayKey();
  return { ...progress.activityByDay, [today]: (progress.activityByDay[today] ?? 0) + count };
}

/**
 * Odpowiedzi z sesji: skuteczność ogólna i per dział/poziom, aktywność dnia i Pudełko porażek
 * (pomyłka trafia do pudełka, poprawna odpowiedź na zadanie z pudełka je wyjmuje).
 * Pytania spoza bazy zadań (np. wygenerowane przez AI) są pomijane – nie wpływają na statystyki.
 */
function recordAnswers(progress: Progress, answers: QuizAnswer[]): Progress {
  const today = dayKey();
  const mistakes = { ...progress.mistakes };
  const topicStats = { ...progress.topicStats };
  let answered = 0;
  let correct = 0;
  let beaten = 0;

  for (const answer of answers) {
    const ref = findQuestion(answer.questionId);
    if (!ref) continue;
    answered++;
    if (answer.correct) correct++;

    const key = testKey(ref.topic.id, ref.difficulty);
    const stat = topicStats[key] ?? { answered: 0, correct: 0, lastAnswered: today };
    topicStats[key] = { answered: stat.answered + 1, correct: stat.correct + (answer.correct ? 1 : 0), lastAnswered: today };

    const existing = mistakes[answer.questionId];
    if (!answer.correct) {
      mistakes[answer.questionId] = { lastWrong: today, count: (existing?.count ?? 0) + 1, chosen: answer.chosen };
    } else if (existing) {
      delete mistakes[answer.questionId];
      beaten++;
    }
  }

  const { stats } = progress;
  return {
    ...progress,
    mistakes,
    topicStats,
    activityByDay: addActivity(progress, answered),
    stats: {
      ...stats,
      answered: stats.answered + answered,
      correct: stats.correct + correct,
      mistakesBeaten: stats.mistakesBeaten + beaten,
    },
  };
}

/** Odpowiedzi i statystyki wspólne dla wszystkich sesji (testy, wyzwanie, trening). */
function recordSession(progress: Progress, result: QuizResult): Progress {
  const hour = new Date().getHours();
  const next = recordAnswers(progress, result.answers);
  return {
    ...next,
    stats: {
      ...next.stats,
      perfectTests: next.stats.perfectTests + (result.correct === result.total ? 1 : 0),
      nightSessions: next.stats.nightSessions + (hour >= 22 || hour < 4 ? 1 : 0),
      earlySessions: next.stats.earlySessions + (hour >= 4 && hour < 7 ? 1 : 0),
    },
  };
}

/**
 * Zapis ukończonej sesji. W tle (nie blokuje ekranu wyniku) odpowiedzi idą do historii w Supabase –
 * serwer sam je ocenia i na tej podstawie liczy ranking (tylko dla uczniów w rankingu).
 */
async function saveSession(
  result: QuizResult,
  source: AnswerSource,
  change: (progress: Progress) => Progress,
): Promise<SaveOutcome> {
  const outcome = await update(change);
  void queueAnswers(source, result.answers);
  return outcome;
}

/** Zapisuje test działu: zostaje najlepszy zaliczony wynik. */
export function saveTestResult(topicId: string, difficulty: Difficulty, result: QuizResult) {
  return saveSession(result, "test", (progress) => {
    const next = recordSession(progress, result);
    const stars = starsFor(result);
    const key = testKey(topicId, difficulty);
    const best = progress.tests[key];
    // wstępne zaliczenie z testu na start zawsze ustępuje prawdziwemu wynikowi
    if (stars && (!best || best.fromPlacement || result.correct / result.total > best.correct / best.total)) {
      next.tests = {
        ...progress.tests,
        [key]: { stars, correct: result.correct, total: result.total, passedAt: best?.passedAt ?? dayKey() },
      };
    }
    return next;
  });
}

export function saveDailyResult(result: QuizResult) {
  return saveSession(result, "daily", (progress) => {
    const next = recordSession(progress, result);
    if (isPassed(result) && progress.dailyDone !== dayKey()) {
      next.dailyDone = dayKey();
      next.stats = { ...next.stats, dailyChallenges: next.stats.dailyChallenges + 1 };
    }
    return next;
  });
}

/** Trening z „Pudełka porażek” – liczy się jak każda sesja (seria, wyjmowanie błędów, ranking). */
export function saveMistakeTraining(result: QuizResult) {
  return saveSession(result, "training", (progress) => recordSession(progress, result));
}

// ── Zakładka „Zadania” ──

export interface PracticeAttempt {
  taskId: string;
  topicId: string;
  difficulty: Difficulty;
  kind: "closed" | "open";
  maxPoints: number;
  points: number;
  /** Zamknięte: wybrana litera (do Pudełka porażek i historii na koncie). */
  chosen?: OptionKey;
  /** Otwarte: czy wynik sprawdziła aplikacja (true), czy uczeń ocenił się sam wg schematu (false). */
  verified: boolean;
}

/**
 * Wynik zadania z zakładki „Zadania”. Punkty częściowe z samooceny liczą się do statystyk na urządzeniu,
 * do rankingu trafiają tylko zadania zamknięte (serwer sam sprawdza wybraną odpowiedź).
 */
export async function savePracticeTask(attempt: PracticeAttempt): Promise<SaveOutcome> {
  const outcome = await update((progress) => {
    const today = dayKey();
    const previous = progress.practice[attempt.taskId];
    const best = previous?.points ?? 0;
    const verifiedBest = previous?.verifiedPoints ?? 0;
    const solved = attempt.points === attempt.maxPoints;

    let next: Progress;
    if (attempt.kind === "closed" && attempt.chosen) {
      next = recordAnswers(progress, [{ questionId: attempt.taskId, chosen: attempt.chosen, correct: solved }]);
    } else {
      // zadanie otwarte: do skuteczności działu liczy się jako poprawne tylko pełne rozwiązanie
      const key = testKey(attempt.topicId, attempt.difficulty);
      const stat = progress.topicStats[key] ?? { answered: 0, correct: 0, lastAnswered: today };
      next = {
        ...progress,
        topicStats: { ...progress.topicStats, [key]: { answered: stat.answered + 1, correct: stat.correct + (solved ? 1 : 0), lastAnswered: today } },
        stats: { ...progress.stats, answered: progress.stats.answered + 1, correct: progress.stats.correct + (solved ? 1 : 0) },
        activityByDay: addActivity(progress, 1),
      };
    }

    return {
      ...next,
      practice: {
        ...next.practice,
        [attempt.taskId]: {
          points: Math.max(best, attempt.points),
          verifiedPoints: attempt.verified ? Math.max(verifiedBest, attempt.points) : verifiedBest,
          maxPoints: attempt.maxPoints,
          attempts: (previous?.attempts ?? 0) + 1,
          lastAt: today,
        },
      },
    };
  });
  if (attempt.kind === "closed" && attempt.chosen) {
    void queueAnswers("training", [{ questionId: attempt.taskId, chosen: attempt.chosen, correct: attempt.points === 1 }]);
  }
  return outcome;
}

// ── Arkusz (symulacja matury) ──

/**
 * Wynik arkusza w statystykach na urządzeniu: rozwiązane zadania, seria dni, skuteczność działów.
 * Pomyłki NIE trafiają same do Pudełka porażek – uczeń dodaje je przyciskiem na podsumowaniu.
 */
export async function saveExamResult(attempt: ExamAttempt): Promise<SaveOutcome> {
  const answered = attempt.results.filter((r) => r.status !== "skipped");
  return update((progress) => {
    const today = dayKey();
    const topicStats = { ...progress.topicStats };
    for (const result of answered) {
      const ref = findQuestion(result.taskId);
      if (!ref) continue; // zadania otwarte i spoza bazy zamkniętych liczą się tylko do ogólnych statystyk
      const key = testKey(ref.topic.id, ref.difficulty);
      const stat = topicStats[key] ?? { answered: 0, correct: 0, lastAnswered: today };
      topicStats[key] = { answered: stat.answered + 1, correct: stat.correct + (result.status === "correct" ? 1 : 0), lastAnswered: today };
    }
    const correct = answered.filter((r) => r.status === "correct").length;
    return {
      ...progress,
      topicStats,
      activityByDay: addActivity(progress, answered.length),
      stats: { ...progress.stats, answered: progress.stats.answered + answered.length, correct: progress.stats.correct + correct },
    };
  });
}

/** Dodaje błędne odpowiedzi (zadania zamknięte z bazy) do Pudełka porażek – na urządzeniu i na koncie. */
export async function addMistakes(entries: { questionId: string; chosen: OptionKey }[]): Promise<number> {
  const known = entries.filter((e) => findQuestion(e.questionId));
  if (known.length === 0) return 0;
  const today = dayKey();
  await update((progress) => {
    const mistakes = { ...progress.mistakes };
    for (const { questionId, chosen } of known) {
      mistakes[questionId] = { lastWrong: today, count: (mistakes[questionId]?.count ?? 0) + 1, chosen };
    }
    return { ...progress, mistakes };
  });
  void queueMistakes(known.map(({ questionId, chosen }) => ({ q: questionId, c: chosen, n: 1, d: today })));
  return known.length;
}

// ── Test na start ──

/**
 * Wynik testu na start: ustawia cel i wstępnie zalicza poziomy w działach z poprawnymi odpowiedziami.
 * To diagnoza, nie sesja nauki – bez gwiazdek i odznak. Odpowiedzi trafiają do statystyk działów i pudełka.
 */
export async function savePlacementResult(result: QuizResult): Promise<SaveOutcome> {
  const score = scorePlacement(result.answers);
  const outcome = await update((progress) => {
    const next = recordAnswers(progress, result.answers);
    const today = dayKey();
    const tests = { ...next.tests };
    const credited = score.credited.filter((key) => !tests[key]);
    for (const key of credited) tests[key] = { stars: 1, correct: 1, total: 1, passedAt: today, fromPlacement: true };
    return {
      ...next,
      tests,
      target: score.target,
      placement: { status: "done", at: today, correct: score.correct, total: score.total, target: score.target, credited },
    };
  });
  void queueAnswers("placement", result.answers);
  return outcome;
}

export async function skipPlacement() {
  await update((progress) => ({ ...progress, placement: { status: "skipped", at: dayKey() } }));
}

/**
 * Kasuje cały postęp nauki na tym urządzeniu (testy, serię, statystyki, odznaki, pudełko porażek).
 * Ustawienia (motyw, klucz Groq) i profil w rankingu zostają – mają osobne magazyny.
 */
export async function resetProgress() {
  // reset obejmuje też historię odpowiedzi na koncie – inaczej synchronizacja przywróciłaby pudełko
  await resetServerLearning().catch(() => {});
  await update(() => ({ ...EMPTY_PROGRESS, stats: { ...EMPTY_PROGRESS.stats } }));
  await Promise.all([Preferences.remove({ key: STORAGE_KEY }), Preferences.remove({ key: BACKUP_KEY })]).catch(() => {});
}

// ── Synchronizacja z kontem (Supabase) ──

let syncing: Promise<void> | null = null;

/**
 * Wyrównuje Pudełko porażek z kontem: wysyła zaległe odpowiedzi, jednorazowo przenosi lokalne
 * pudełko na konto, a potem przyjmuje stan z serwera (np. pomyłki pokonane na innym urządzeniu).
 */
export function syncLearning(): Promise<void> {
  syncing ??= (async () => {
    if (!(await readyMemberId())) return;
    if (!(await flushAnswers())) return; // zaległe odpowiedzi nie dotarły – serwer nie jest aktualny
    if (!(await flushMistakes())) return; // pomyłki dodane ręcznie (np. z arkusza) też muszą być na serwerze
    await ensureLoaded();
    const local = current ?? EMPTY_PROGRESS;
    if (!(await importLocalMistakesOnce(local.mistakes))) return;
    const server = await fetchServerMistakes();
    if (!server) return;
    await update((progress) => ({ ...progress, mistakes: server }));
  })().finally(() => {
    syncing = null;
  });
  return syncing;
}

export async function setTarget(target: Target) {
  await update((progress) => ({ ...progress, target }));
}
