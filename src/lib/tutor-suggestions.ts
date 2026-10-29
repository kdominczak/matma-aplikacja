import { getExam } from "@/data/exams";
import { findQuestion, topics } from "@/data/topics";
import { questionAsText } from "@/lib/ai";
import type { TutorStyle } from "@/lib/ai-prompts";
import { topicMastery } from "@/lib/mastery";
import type { ExamAttempt } from "@/types/exam";
import type { Progress } from "@/types/progress";

// „Twoje zadania” na starcie korepetytora: zamiast ogólnych tematów – to, z czym uczeń naprawdę miał problem.
// Jedno stuknięcie wkleja treść do czatu i ustawia tryb pomocy.

export interface TutorSuggestion {
  id: string;
  /** Skąd zadanie: „Pudełko porażek”, „Arkusz próbny nr 1 · zad. 7”, „Najsłabszy dział”. */
  source: string;
  title: string;
  text: string;
  style: TutorStyle;
}

const MAX_MISTAKES = 2;
const MIN_ANSWERS_FOR_WEAKEST = 3;

/** Pierwszy akapit treści do karty (wzory zostają – karta renderuje je KaTeX-em w jednej linii). */
function preview(text: string): string {
  return text.split("\n")[0].trim();
}

export function tutorSuggestions(progress: Progress, attempts: ExamAttempt[] = []): TutorSuggestion[] {
  const out: TutorSuggestion[] = [];

  // 1. Ostatni arkusz: pierwsze zadanie otwarte bez kompletu punktów – do przerobienia krok po kroku
  const last = [...attempts].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  const exam = last && getExam(last.examId);
  const missed = last?.results.find((r) => r.kind === "open" && r.status !== "correct");
  const task = missed && exam?.tasks.find((t) => t.id === missed.taskId);
  if (exam && missed && task?.kind === "open") {
    const answer = missed.given ? `\n\nMój wynik: ${missed.given}. Poprawny wynik to ${task.task.answers[0].replace(";", "; ")}.` : "";
    out.push({
      id: `exam-${task.id}`,
      source: `${exam.title} · zad. ${missed.number}`,
      title: preview(task.task.prompt),
      text: `${task.task.prompt}${answer}\n\nPomóż mi dojść do rozwiązania.`,
      style: "naprowadz",
    });
  }

  // 2. Pudełko porażek: najnowsze pomyłki – wyjaśnienie, skąd się wzięła zła odpowiedź
  const mistakes = Object.entries(progress.mistakes)
    .sort(([, a], [, b]) => b.lastWrong.localeCompare(a.lastWrong))
    .flatMap(([id, mistake]) => {
      const ref = findQuestion(id);
      return ref ? [{ id, ref, mistake }] : [];
    })
    .slice(0, MAX_MISTAKES);
  for (const { id, ref, mistake } of mistakes) {
    out.push({
      id: `mistake-${id}`,
      source: `Pudełko porażek · ${ref.topic.title}`,
      title: preview(ref.question.prompt),
      text: questionAsText(ref.question, mistake.chosen),
      style: "rozwiazanie",
    });
  }

  // 3. Najsłabszy dział (z odpowiedziami, nie zupełnie nowy) – wytłumaczenie od podstaw
  const weakest = topics
    .map((topic) => {
      const answered = Object.entries(progress.topicStats)
        .filter(([key]) => key.startsWith(`${topic.id}/`))
        .reduce((sum, [, stat]) => sum + stat.answered, 0);
      return { topic, answered, mastery: topicMastery(progress, topic) };
    })
    .filter((t) => t.answered >= MIN_ANSWERS_FOR_WEAKEST)
    .sort((a, b) => a.mastery - b.mastery)[0];
  if (weakest && weakest.mastery < 0.7) {
    out.push({
      id: `topic-${weakest.topic.id}`,
      source: "Najsłabszy dział",
      title: weakest.topic.title,
      text: `Wytłumacz mi najważniejsze rzeczy z działu „${weakest.topic.title}”, które są potrzebne na maturze – od podstaw, na prostych przykładach.`,
      style: "rozwiazanie",
    });
  }
  return out;
}
