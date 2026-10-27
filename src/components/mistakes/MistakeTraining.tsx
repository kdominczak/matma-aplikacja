"use client";

import { useState } from "react";
import Link from "next/link";
import QuizScreen from "@/components/quiz/QuizScreen";
import { findQuestion } from "@/data/topics";
import { useAiReady } from "@/lib/ai-settings";
import { mistakeEntries, trainingSet } from "@/lib/mistakes";
import { saveMistakeTraining, useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";

/** „Przećwicz swoje błędy” – quiz z zadań z Pudełka porażek. */
export default function MistakeTraining() {
  const progress = useProgress();
  if (!progress) return <div className="min-h-dvh bg-surface" />;
  return <Session progress={progress} />;
}

function Session({ progress }: { progress: Progress }) {
  const aiReady = useAiReady();
  // Zestaw zamrażamy na starcie – zapis wyniku zmienia pudełko, a quiz musi zostać ten sam.
  const [set] = useState(() => trainingSet(mistakeEntries(progress)));
  const questions = set.questionIds.flatMap((id) => {
    const ref = findQuestion(id);
    return ref ? [ref.question] : [];
  });

  if (questions.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
        <p className="text-2xl font-extrabold text-ink">Pudełko jest puste 🎉</p>
        <p className="text-muted">Nie masz żadnych błędów do przećwiczenia.</p>
        <Link href="/" className="rounded-2xl bg-brand px-6 py-3 font-bold text-white shadow-float">
          Wróć do nauki
        </Link>
      </div>
    );
  }

  return (
    <QuizScreen
      questions={questions}
      title="Pudełko porażek"
      kicker="Trening błędów"
      formulaGroups={set.formulaGroups}
      hints={aiReady || questions.some((q) => q.hints?.length)}
      exitHref="/bledy"
      onFinish={saveMistakeTraining}
    />
  );
}
