import { topicsOfLevel } from "@/data/topics";
import { LEVEL_POINTS, topicExamPoints } from "@/lib/exam-weights";
import type { Level, Topic } from "@/types/topic";

// Cel ucznia: ile punktów chce zdobyć na maturze danego poziomu (suwak). Zapisujemy go jako procent
// (`progress.target` – podstawa, `progress.targetExtended` – rozszerzenie), więc dawne cele 30/60/85% działają bez migracji.
// Z celu wyliczamy działy potrzebne do niego – z wag działów na prawdziwych maturach (src/lib/exam-weights.ts),
// a nie ze stałych grup „na 30/60/85%”.

/** Matura podstawowa: próg zdania 30%. Rozszerzona nie ma progu – suwak od 5 pkt (10%). */
export const GOAL_RANGE: Record<Level, { min: number; max: number }> = {
  podstawowy: { min: Math.ceil(LEVEL_POINTS.podstawowy * 0.3), max: LEVEL_POINTS.podstawowy },
  rozszerzony: { min: 5, max: LEVEL_POINTS.rozszerzony },
};

/** Zgodność wsteczna – zakres podstawy. */
export const GOAL_MIN_POINTS = GOAL_RANGE.podstawowy.min;
export const GOAL_MAX_POINTS = GOAL_RANGE.podstawowy.max;

/** Z działu, który uczeń opanował, zdobywa zwykle ok. 80% jego punktów (błędy, nerwy, czas) – stąd zapas w doborze działów. */
const EXPECTED_SHARE = 0.8;

const clamp = (points: number, level: Level) => Math.min(GOAL_RANGE[level].max, Math.max(GOAL_RANGE[level].min, points));

export function goalPoints(percent: number, level: Level = "podstawowy"): number {
  return clamp(Math.round((percent / 100) * LEVEL_POINTS[level]), level);
}

export function goalPercent(points: number, level: Level = "podstawowy"): number {
  return Math.round((clamp(points, level) / LEVEL_POINTS[level]) * 100);
}

/** Krótki opis celu pod suwakiem. */
export function goalLabel(points: number, level: Level = "podstawowy"): string {
  if (level === "rozszerzony") {
    if (points < 15) return "Start w rozszerzeniu – każdy punkt liczy się w rekrutacji";
    if (points < 25) return "Solidne rozszerzenie – mocny atut w rekrutacji";
    if (points < 35) return "Wysoki wynik – kierunki techniczne i ekonomiczne";
    return "Wynik na najbardziej oblegane kierunki";
  }
  if (points <= GOAL_RANGE.podstawowy.min) return "Zdana matura – próg to 30%";
  if (points < 30) return "Bezpiecznie powyżej progu";
  if (points < 40) return "Solidny wynik – liczy się w rekrutacji na wiele kierunków";
  return "Wynik na wymagające kierunki";
}

/** Kolejność nauki: najwięcej punktów na maturze za godzinę nauki (szybkie zyski najpierw). */
function byValue(level: Level) {
  return (a: Topic, b: Topic) =>
    topicExamPoints(b, level) / b.studyHours - topicExamPoints(a, level) / a.studyHours || b.examShare - a.examShare;
}

/**
 * Działy potrzebne do celu: od najbardziej opłacalnych, aż oczekiwane punkty (waga działu × 80%) sięgną celu.
 * Cel powyżej tego, co da się „uzbierać”, obejmuje wszystkie działy. Wynik w kolejności nauki (najpierw najbardziej opłacalne).
 * Na rozszerzeniu pod uwagę idą działy rozszerzenia i podstawy (arkusz rozszerzony sprawdza oba zakresy).
 */
export function topicsForGoal(percent: number, level: Level = "podstawowy"): Topic[] {
  const needed = goalPoints(percent, level);
  const out: Topic[] = [];
  let expected = 0;
  const candidates = topicsOfLevel(level).filter((t) => (t.content || t.practice) && topicExamPoints(t, level) > 0);
  for (const topic of candidates.sort(byValue(level))) {
    if (expected >= needed) break;
    out.push(topic);
    expected += topicExamPoints(topic, level) * EXPECTED_SHARE;
  }
  return out;
}
