import { DIFFICULTIES } from "@/data/topics";
import { testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { Difficulty, Topic } from "@/types/topic";

// Jak dobrze uczeń zna dział – wspólne źródło dla planu na dziś (co ćwiczyć) i szacowanego wyniku (ile punktów).
// Dowody: skuteczność odpowiedzi w dziale na każdym poziomie (testy, „Zadania”, arkusze, plan, wyzwanie)
// i zaliczone testy działów.

/** Udział poziomów w dziale (na maturze podstawowej dominują zadania łatwe i średnie). */
export const LEVEL_WEIGHT: Record<Difficulty, number> = { podstawowy: 0.45, sredni: 0.35, zaawansowany: 0.2 };
/** Skuteczność, od której poziom uznajemy za opanowany (i po ilu odpowiedziach w ogóle oceniamy). */
export const LEVEL_MASTERED = 0.75;
export const MIN_ANSWERS = 5;
/**
 * Ostrożność szacunku: skuteczność liczymy tak, jakby uczeń miał jeszcze tyle błędnych odpowiedzi.
 * 5/5 → 71%, 10/10 → 83%, 30/30 → 94% – pewność rośnie z liczbą rozwiązanych zadań.
 */
export const EVIDENCE = 2;
/** Zaliczony test działu bez odpowiedzi w statystykach (stare zapisy) – liczymy wynik testu z takim zapasem. */
const TEST_CONFIDENCE = 0.8;

export type MasteryInput = Pick<Progress, "tests" | "topicStats">;

export function levelStat(input: MasteryInput, topicId: string, difficulty: Difficulty) {
  const stat = input.topicStats[testKey(topicId, difficulty)];
  return { answered: stat?.answered ?? 0, correct: stat?.correct ?? 0, lastAnswered: stat?.lastAnswered };
}

/** Skuteczność z „wygładzeniem” – 1 dobra odpowiedź na 1 to jeszcze nie 100% pewności. */
export function smoothedAccuracy(answered: number, correct: number): number {
  return (correct + 1) / (answered + 2);
}

/** Opanowanie działu 0–1 (plan na dziś): zaliczone testy albo skuteczność, ważone poziomami. */
export function topicMastery(input: MasteryInput, topic: Topic): number {
  let mastery = 0;
  for (const { id } of DIFFICULTIES) {
    const passed = input.tests[testKey(topic.id, id)];
    const { answered, correct } = levelStat(input, topic.id, id);
    const fromStats = answered === 0 ? 0 : smoothedAccuracy(answered, correct) * Math.min(1, answered / MIN_ANSWERS);
    const level = Math.max(passed && !passed.fromPlacement ? 1 : passed ? 0.6 : 0, fromStats);
    mastery += LEVEL_WEIGHT[id] * Math.min(1, level / LEVEL_MASTERED);
  }
  return Math.min(1, mastery);
}

/**
 * Oczekiwany odsetek punktów z działu na maturze (0–1) – do szacowanego wyniku.
 * Na każdym poziomie: ostrożna skuteczność `correct / (answered + EVIDENCE)`; bez odpowiedzi – 0
 * (dział, którego uczeń nie ćwiczył, nie podnosi wyniku). Zaliczony test daje co najmniej swój wynik z zapasem.
 */
export function expectedScore(input: MasteryInput, topic: Topic): number {
  let score = 0;
  for (const { id } of DIFFICULTIES) {
    const { answered, correct } = levelStat(input, topic.id, id);
    const fromStats = answered === 0 ? 0 : correct / (answered + EVIDENCE);
    const passed = input.tests[testKey(topic.id, id)];
    const fromTest = passed && !passed.fromPlacement ? (passed.correct / passed.total) * TEST_CONFIDENCE : 0;
    score += LEVEL_WEIGHT[id] * Math.max(fromStats, fromTest);
  }
  return Math.min(1, score);
}
