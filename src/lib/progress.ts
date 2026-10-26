import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { newlyEarned, type Achievement } from "@/lib/achievements";
import { dayKey, isPassed, starsFor, testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { QuizResult } from "@/types/quiz";
import type { Difficulty, Target } from "@/types/topic";

// Obliczenia pomocnicze (seria, gwiazdki, poziomy…) – importowane razem z magazynem.
export * from "@/lib/stats";

// Preferences: natywny storage w aplikacji (odporny na czyszczenie WebView), localStorage w przeglądarce.
const STORAGE_KEY = "progress.v2";

const EMPTY_PROGRESS: Progress = {
  xp: 0,
  xpByDay: {},
  tests: {},
  target: 30,
  stats: { answered: 0, correct: 0, perfectTests: 0, dailyChallenges: 0, nightSessions: 0, earlySessions: 0 },
  achievements: {},
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
    // starsze zapisy nie mają nowszych pól – uzupełniamy domyślnymi
    return { ...EMPTY_PROGRESS, ...saved, stats: { ...EMPTY_PROGRESS.stats, ...saved.stats } };
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

/** XP do dziennego licznika + statystyki wspólne dla testów i wyzwań. */
function recordSession(progress: Progress, result: QuizResult): Progress {
  const today = dayKey();
  const hour = new Date().getHours();
  const { stats } = progress;
  return {
    ...progress,
    xp: progress.xp + result.xp,
    xpByDay: { ...progress.xpByDay, [today]: (progress.xpByDay[today] ?? 0) + result.xp },
    stats: {
      ...stats,
      answered: stats.answered + result.answered,
      correct: stats.correct + result.correct,
      perfectTests: stats.perfectTests + (result.correct === result.total ? 1 : 0),
      nightSessions: stats.nightSessions + (hour >= 22 || hour < 4 ? 1 : 0),
      earlySessions: stats.earlySessions + (hour >= 4 && hour < 7 ? 1 : 0),
    },
  };
}

/** Zapisuje test działu: XP zawsze się sumuje, a zostaje najlepszy zaliczony wynik. */
export function saveTestResult(topicId: string, difficulty: Difficulty, result: QuizResult) {
  return update((progress) => {
    const next = recordSession(progress, result);
    const stars = starsFor(result);
    const key = testKey(topicId, difficulty);
    const best = progress.tests[key];
    if (stars && (!best || result.correct / result.total > best.correct / best.total)) {
      next.tests = {
        ...progress.tests,
        [key]: { stars, correct: result.correct, total: result.total, passedAt: best?.passedAt ?? dayKey() },
      };
    }
    return next;
  });
}

export function saveDailyResult(result: QuizResult) {
  return update((progress) => {
    const next = recordSession(progress, result);
    if (isPassed(result) && progress.dailyDone !== dayKey()) {
      next.dailyDone = dayKey();
      next.stats = { ...next.stats, dailyChallenges: next.stats.dailyChallenges + 1 };
    }
    return next;
  });
}

export async function setTarget(target: Target) {
  await update((progress) => ({ ...progress, target }));
}
