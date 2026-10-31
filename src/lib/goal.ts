import { topics } from "@/data/topics";
import { MATURA_POINTS, topicExamPoints } from "@/lib/exam-weights";
import type { Topic } from "@/types/topic";

// Cel ucznia: ile punktów chce zdobyć na maturze (suwak 15–50 pkt). Zapisujemy go jako procent (`progress.target`),
// więc dawne cele 30/60/85% działają bez migracji. Z celu wyliczamy działy potrzebne do niego – z wag działów
// na prawdziwych maturach (src/lib/exam-weights.ts), a nie ze stałych grup „na 30/60/85%”.

/** Próg zdania: 30% punktów. */
export const GOAL_MIN_POINTS = Math.ceil(MATURA_POINTS * 0.3);
export const GOAL_MAX_POINTS = MATURA_POINTS;
/** Z działu, który uczeń opanował, zdobywa zwykle ok. 80% jego punktów (błędy, nerwy, czas) – stąd zapas w doborze działów. */
const EXPECTED_SHARE = 0.8;

export function goalPoints(percent: number): number {
  return Math.min(GOAL_MAX_POINTS, Math.max(GOAL_MIN_POINTS, Math.round((percent / 100) * MATURA_POINTS)));
}

export function goalPercent(points: number): number {
  return Math.round((Math.min(GOAL_MAX_POINTS, Math.max(GOAL_MIN_POINTS, points)) / MATURA_POINTS) * 100);
}

/** Krótki opis celu pod suwakiem. */
export function goalLabel(points: number): string {
  if (points <= GOAL_MIN_POINTS) return "Zdana matura – próg to 30%";
  if (points < 30) return "Bezpiecznie powyżej progu";
  if (points < 40) return "Solidny wynik – liczy się w rekrutacji na wiele kierunków";
  return "Wynik na wymagające kierunki";
}

/** Kolejność nauki: najwięcej punktów na maturze za godzinę nauki (szybkie zyski najpierw). */
function byValue(a: Topic, b: Topic): number {
  return topicExamPoints(b) / b.studyHours - topicExamPoints(a) / a.studyHours || b.examShare - a.examShare;
}

/**
 * Działy potrzebne do celu: od najbardziej opłacalnych, aż oczekiwane punkty (waga działu × 80%) sięgną celu.
 * Cel powyżej tego, co da się „uzbierać”, obejmuje wszystkie działy. Wynik w kolejności nauki (najpierw najbardziej opłacalne).
 */
export function topicsForGoal(percent: number): Topic[] {
  const needed = goalPoints(percent);
  const out: Topic[] = [];
  let expected = 0;
  for (const topic of [...topics].filter((t) => t.content || t.practice).sort(byValue)) {
    if (expected >= needed) break;
    out.push(topic);
    expected += topicExamPoints(topic) * EXPECTED_SHARE;
  }
  return out;
}
