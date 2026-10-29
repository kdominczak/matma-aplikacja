"use client";

import QuizScreen from "@/components/quiz/QuizScreen";
import { QuizSkeleton } from "@/components/ui/Skeleton";
import { AI_ENABLED } from "@/lib/ai-config";
import { dailyChallenge } from "@/lib/daily";
import { dayKey, saveDailyResult, useProgress } from "@/lib/progress";

export default function DailyChallenge() {
  const progress = useProgress();
  // Czekamy na postęp (cel użytkownika) – przy okazji losowanie dzieje się dopiero w przeglądarce.
  if (!progress) return <QuizSkeleton />;

  const { questions, formulaGroups } = dailyChallenge(dayKey(), progress.target);

  return (
    <QuizScreen
      questions={questions}
      title="Dzienne wyzwanie"
      kicker="Wyzwanie dnia"
      formulaGroups={formulaGroups}
      hints={AI_ENABLED}
      exitHref="/"
      onFinish={saveDailyResult}
    />
  );
}
