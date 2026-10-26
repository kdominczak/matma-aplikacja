import { DIFFICULTIES, topics } from "@/data/topics";
import { dayKey, parseDay, shiftDays, testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { Difficulty } from "@/types/topic";

/**
 * Szacowany wynik matury (poziom podstawowy, 46 pkt).
 * Każdy dział waży tyle, ile średnio daje punktów: `points × examShare`.
 * Opanowanie działu rośnie z najwyższym zaliczonym poziomem trudności.
 */
const MATURA_POINTS = 46;
const MASTERY: Record<Difficulty, number> = { podstawowy: 0.4, sredni: 0.75, zaawansowany: 1 };
const MIN_DAYS = 14;

function estimateAt(progress: Progress, day: string, fallbackDay: string): number {
  let points = 0;
  for (const topic of topics) {
    let mastery = 0;
    for (const level of DIFFICULTIES) {
      const record = progress.tests[testKey(topic.id, level.id)];
      if (record && (record.passedAt ?? fallbackDay) <= day) mastery = MASTERY[level.id];
    }
    points += topic.points * (topic.examShare / 100) * mastery;
  }
  return Math.round((points / MATURA_POINTS) * 100);
}

export function currentEstimate(progress: Progress): number {
  const today = dayKey();
  return estimateAt(progress, today, today);
}

/** Dzienna historia szacunku – od pierwszej aktywności (min. 14 ostatnich dni) do dziś. */
export function estimateHistory(progress: Progress): { day: string; label: string; value: number }[] {
  const activeDays = [
    ...Object.keys(progress.xpByDay),
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
      value: estimateAt(progress, key, firstActive),
    });
  }
  return history;
}
