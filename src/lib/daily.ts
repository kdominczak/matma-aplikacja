import { DIFFICULTIES, formulaGroup, testQuestions } from "@/data/topics";
import { topicsForGoal } from "@/lib/goal";
import { seededRandom } from "@/lib/random";
import type { QuizQuestion } from "@/types/quiz";
import type { FormulaGroup } from "@/types/topic";

export const DAILY_QUESTION_COUNT = 10;

/** Losuje zadania dnia z działów potrzebnych do celu (wszystkie poziomy trudności). */
export function dailyChallenge(day: string, target: number): { questions: QuizQuestion[]; formulaGroups: FormulaGroup[] } {
  const topics = topicsForGoal(target).filter((t) => t.content);
  const pool = topics.flatMap((topic) =>
    DIFFICULTIES.flatMap((d) => testQuestions(topic, d.id).map((q) => ({ q, topic }))),
  );

  const random = seededRandom(`${day}/${target}`);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, DAILY_QUESTION_COUNT);
  const usedTopics = topics.filter((topic) => picked.some((p) => p.topic === topic));

  return {
    questions: picked.map((p) => p.q),
    formulaGroups: usedTopics.map(formulaGroup),
  };
}
