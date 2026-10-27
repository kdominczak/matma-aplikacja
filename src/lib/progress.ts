import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { findQuestion } from "@/data/topics";
import { newlyEarned, type Achievement } from "@/lib/achievements";
import {
  fetchServerMistakes,
  flushAnswers,
  importLocalMistakesOnce,
  queueAnswers,
  resetServerLearning,
  type AnswerSource,
} from "@/lib/learning-sync";
import { scorePlacement } from "@/lib/placement";
import { readyMemberId } from "@/lib/ranking";
import { dayKey, isPassed, starsFor, testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { OptionKey, QuizAnswer, QuizResult } from "@/types/quiz";
import type { Difficulty, Target } from "@/types/topic";

// Obliczenia pomocnicze (seria, gwiazdki, poziomy…) – importowane razem z magazynem.
export * from "@/lib/stats";

// Preferences: natywny storage w aplikacji (odporny na czyszczenie WebView), localStorage w przeglądarce.
const STORAGE_KEY = "progress.v2";

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

function subscribe(listener: () => void) {
  listeners.add(listener);
  loading ??= loadProgress().then((progress) => {
    current = progress;
    emit();
  });
  return () => listeners.delete(listener);
}

/** Postęp użytkownika; `null` do czasu wczytania (także podczas prerenderu). */
export function useProgress(): Progress | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

async function loadProgress(): Promise<Progress> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (!value) return EMPTY_PROGRESS;
  try {
    const saved = JSON.parse(value);
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
    return EMPTY_PROGRESS;
  }
}

async function update(change: (progress: Progress) => Progress): Promise<SaveOutcome> {
  let next = change(current ?? (await loadProgress()));
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
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) });
  return { progress: next, earned };
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
  current = { ...EMPTY_PROGRESS, stats: { ...EMPTY_PROGRESS.stats } };
  emit();
  await Preferences.remove({ key: STORAGE_KEY });
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
    const local = current ?? (await loadProgress());
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
