import { topics } from "@/data/topics";
import { MATURA_POINTS, topicExamPoints } from "@/lib/exam-weights";
import { expectedScore, type MasteryInput } from "@/lib/mastery";
import { dayKey, parseDay, shiftDays } from "@/lib/stats";
import type { Progress, TopicStat } from "@/types/progress";

/**
 * Szacowany wynik matury (poziom podstawowy, od 2025: 50 pkt) – ile punktów uczeń zdobyłby dziś:
 * suma po działach `punkty działu na maturze × oczekiwany odsetek punktów` (src/lib/mastery.ts).
 * Liczą się wszystkie rozwiązane zadania (testy, „Zadania”, arkusze, plan, wyzwanie) i zaliczone testy;
 * samoocena zadań otwartych – nie. Wynik w czasie odtwarzamy z dziennej historii skuteczności (`statsByDay`),
 * więc wykres i bieżąca wartość zawsze liczą się tak samo.
 */
const MIN_DAYS = 14;

/** Od ilu odpowiedzi pokazujemy szacunek – wcześniej to szum („2%” po trzech zadaniach) zamiast informacji. */
export const ESTIMATE_MIN_ANSWERS = 20;

/** Ile odpowiedzi brakuje do pierwszego szacunku (0 = szacunek gotowy). */
export function answersToEstimate(progress: Progress): number {
  return Math.max(0, ESTIMATE_MIN_ANSWERS - progress.stats.answered);
}

function estimateFrom(input: MasteryInput): number {
  let points = 0;
  for (const topic of topics) points += topicExamPoints(topic) * expectedScore(input, topic);
  return Math.round((points / MATURA_POINTS) * 100);
}

/** Skuteczność działów zsumowana z historii dziennej (do wskazanego dnia włącznie). */
function statsUpTo(progress: Progress, day: string): Record<string, TopicStat> {
  const totals: Record<string, TopicStat> = {};
  for (const [date, entries] of Object.entries(progress.statsByDay)) {
    if (date > day) continue;
    for (const [key, [answered, correct]] of Object.entries(entries)) {
      const t = (totals[key] ??= { answered: 0, correct: 0, lastAnswered: date });
      t.answered += answered;
      t.correct += correct;
      if (date > t.lastAnswered) t.lastAnswered = date;
    }
  }
  return totals;
}

/** Zaliczone testy do danego dnia (stare zapisy bez daty – od pierwszego dnia aktywności). */
function testsUpTo(progress: Progress, day: string, fallbackDay: string): Progress["tests"] {
  return Object.fromEntries(Object.entries(progress.tests).filter(([, t]) => (t.passedAt ?? fallbackDay) <= day));
}

export function currentEstimate(progress: Progress): number {
  const today = dayKey();
  return estimateFrom({ tests: progress.tests, topicStats: statsUpTo(progress, today) });
}

/** Dzienna historia szacunku – od pierwszej aktywności (min. 14 ostatnich dni) do dziś. */
export function estimateHistory(progress: Progress): { day: string; label: string; value: number }[] {
  const activeDays = [
    ...Object.keys(progress.activityByDay),
    ...Object.keys(progress.statsByDay),
    ...Object.values(progress.tests).flatMap((t) => (t.passedAt ? [t.passedAt] : [])),
  ].sort();
  const today = new Date();
  const firstActive = activeDays[0] ?? dayKey(today);
  const windowStart = dayKey(shiftDays(today, -(MIN_DAYS - 1)));
  const start = firstActive < windowStart ? firstActive : windowStart;

  const history = [];
  for (let date = parseDay(start); dayKey(date) <= dayKey(today); date = shiftDays(date, 1)) {
    const key = dayKey(date);
    history.push({
      day: key,
      label: date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
      value: estimateFrom({ tests: testsUpTo(progress, key, firstActive), topicStats: statsUpTo(progress, key) }),
    });
  }
  return history;
}
