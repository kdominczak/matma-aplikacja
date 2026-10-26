"use client";

import QuizScreen from "@/components/quiz/QuizScreen";
import { dailyChallenge } from "@/lib/daily";
import { dayKey, saveDailyResult, useProgress } from "@/lib/progress";

const XP_PER_CORRECT = 15;

export default function DailyChallenge() {
  const progress = useProgress();
  // Czekamy na postęp (cel użytkownika) – przy okazji losowanie dzieje się dopiero w przeglądarce.
  if (!progress) return <div className="min-h-dvh bg-surface" />;

  const { questions, formulaGroups } = dailyChallenge(dayKey(), progress.target);

  return (
    <QuizScreen
      questions={questions}
      title="Dzienne wyzwanie"
      kicker="Wyzwanie dnia"
      formulaGroups={formulaGroups}
      hints={false}
      xpPerCorrect={XP_PER_CORRECT}
      exitHref="/"
      onFinish={saveDailyResult}
    />
  );
}
