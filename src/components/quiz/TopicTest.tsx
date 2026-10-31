"use client";

import QuizScreen from "@/components/quiz/QuizScreen";
import { formulaGroup, getDifficulty, getTopic, testQuestions } from "@/data/topics";
import { AI_ENABLED } from "@/lib/ai-config";
import { saveTestResult } from "@/lib/progress";
import type { Difficulty } from "@/types/topic";

type Props = { topicId: string; difficulty: Difficulty };

/** Zestaw zadań działu na wybranym poziomie (dawna trasa testu – bez serc, z lekcji już do niej nie prowadzimy). */
export default function TopicTest({ topicId, difficulty }: Props) {
  const topic = getTopic(topicId)!;
  const level = getDifficulty(difficulty);

  return (
    <QuizScreen
      questions={testQuestions(topic, difficulty)}
      title={topic.title}
      kicker={`Test – poziom ${level.label.toLowerCase()}`}
      formulaGroups={[formulaGroup(topic)]}
      // podstawowy: podpowiedzi z klucza (+ AI); wyższe poziomy tylko z korepetytorem AI
      hints={difficulty === "podstawowy" || AI_ENABLED}
      exitHref={`/dzial/${topic.id}#zadania`}
      onFinish={(result) => saveTestResult(topic.id, difficulty, result)}
    />
  );
}
