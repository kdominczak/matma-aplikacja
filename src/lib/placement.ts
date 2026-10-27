import { PLACEMENT } from "@/data/placement";
import { DIFFICULTIES, getTopic } from "@/data/topics";
import { testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { QuizAnswer } from "@/types/quiz";
import type { Target } from "@/types/topic";

export interface PlacementScore {
  correct: number;
  total: number;
  /** Poprawne w zadaniach z działów „na 30%” / w trudniejszych. */
  basic: { correct: number; total: number };
  hard: { correct: number; total: number };
  target: Target;
  /** Klucze `${topicId}/${difficulty}` poziomów do wstępnego zaliczenia. */
  credited: string[];
}

/**
 * Wynik testu na start. Poprawność liczymy z danych zadań (nie z flagi klienta).
 * Poprawne zadanie na poziomie podstawowym zalicza poziom podstawowy działu,
 * a na poziomie średnim – podstawowy i średni (zaawansowany zawsze trzeba zdobyć samemu).
 */
export function scorePlacement(answers: QuizAnswer[]): PlacementScore {
  const chosen = new Map(answers.map((a) => [a.questionId, a.chosen]));
  const basic = { correct: 0, total: 0 };
  const hard = { correct: 0, total: 0 };
  const credited: string[] = [];

  for (const item of PLACEMENT) {
    const topic = getTopic(item.topicId)!;
    const group = topic.target === 30 ? basic : hard;
    group.total++;
    if (chosen.get(item.question.id) !== item.question.correct) continue;
    group.correct++;
    if (!topic.content) continue; // działy „Wkrótce” nie mają jeszcze testów do zaliczenia
    const upTo = DIFFICULTIES.findIndex((d) => d.id === item.difficulty);
    for (const level of DIFFICULTIES.slice(0, Math.min(upTo, 1) + 1)) credited.push(testKey(topic.id, level.id));
  }

  const basicRatio = basic.total ? basic.correct / basic.total : 0;
  const hardRatio = hard.total ? hard.correct / hard.total : 0;
  // Cel = wynik, do którego warto teraz celować: mocne podstawy + trudne zadania → 85%, solidne podstawy → 60%.
  const target: Target =
    basicRatio >= 0.85 && hardRatio >= 0.66 ? 85 : basicRatio >= 0.65 || (basicRatio >= 0.55 && hardRatio >= 0.66) ? 60 : 30;

  return {
    correct: basic.correct + hard.correct,
    total: basic.total + hard.total,
    basic,
    hard,
    target,
    credited: [...new Set(credited)],
  };
}

/** Test na start proponujemy tylko nowemu uczniowi (bez postępu) i tylko raz. */
export function needsPlacement(progress: Progress): boolean {
  return !progress.placement && progress.stats.answered === 0 && Object.keys(progress.tests).length === 0;
}
