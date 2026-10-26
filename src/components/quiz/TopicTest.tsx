"use client";

import QuizScreen from "@/components/quiz/QuizScreen";
import { formulaGroup, getDifficulty, getTopic, testQuestions } from "@/data/topics";
import { saveTestResult } from "@/lib/progress";
import type { Difficulty } from "@/types/topic";

type Props = { topicId: string; difficulty: Difficulty };

/** Test podsumowujący dział na wybranym poziomie trudności. */
export default function TopicTest({ topicId, difficulty }: Props) {
  const topic = getTopic(topicId)!;
  const level = getDifficulty(difficulty);

  return (
    <QuizScreen
      questions={testQuestions(topic, difficulty)}
      title={topic.title}
      kicker={`Test – poziom ${level.label.toLowerCase()}`}
      formulaGroups={[formulaGroup(topic)]}
      hints={difficulty === "podstawowy"}
      xpPerCorrect={level.xpPerCorrect}
      exitHref={`/dzial/${topic.id}#test`}
      onFinish={(result) => saveTestResult(topic.id, difficulty, result)}
    />
  );
}
