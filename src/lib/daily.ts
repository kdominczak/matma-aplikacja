import { DIFFICULTIES, formulaGroup, testQuestions, topicsForTarget } from "@/data/topics";
import type { QuizQuestion } from "@/types/quiz";
import type { FormulaGroup, Target } from "@/types/topic";

export const DAILY_QUESTION_COUNT = 10;

/** Prosty generator pseudolosowy z ziarnem – ten sam zestaw przez cały dzień. */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Losuje zadania dnia z działów planu (wszystkie poziomy trudności). */
export function dailyChallenge(day: string, target: Target): { questions: QuizQuestion[]; formulaGroups: FormulaGroup[] } {
  const topics = topicsForTarget(target).filter((t) => t.content);
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
