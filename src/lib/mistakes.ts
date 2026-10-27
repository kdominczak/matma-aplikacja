import { findQuestion, formulaGroup, type QuestionRef } from "@/data/topics";
import { dayKey, parseDay } from "@/lib/stats";
import type { Mistake, Progress } from "@/types/progress";
import type { FormulaGroup } from "@/types/topic";

export const TRAINING_SIZE = 10;

export interface MistakeEntry extends QuestionRef {
  mistake: Mistake;
}

/** Zadania z pudełka – najświeższe pomyłki na górze (pytania usunięte z bazy pomijamy). */
export function mistakeEntries(progress: Progress): MistakeEntry[] {
  return Object.entries(progress.mistakes)
    .flatMap(([id, mistake]) => {
      const ref = findQuestion(id);
      return ref ? [{ ...ref, mistake }] : [];
    })
    .sort((a, b) => b.mistake.lastWrong.localeCompare(a.mistake.lastWrong) || b.mistake.count - a.mistake.count);
}

export function trainingSet(entries: MistakeEntry[]): { questionIds: string[]; formulaGroups: FormulaGroup[] } {
  const picked = entries.slice(0, TRAINING_SIZE);
  const topics = [...new Map(picked.map((e) => [e.topic.id, e.topic])).values()];
  // działy „Wkrótce” (np. zadania z testu na start) nie mają jeszcze wzorów – pomijamy puste grupy
  return { questionIds: picked.map((e) => e.question.id), formulaGroups: topics.filter((t) => t.content).map(formulaGroup) };
}

export function daysAgo(key: string): string {
  const diff = Math.round((parseDay(dayKey()).getTime() - parseDay(key).getTime()) / 86_400_000);
  if (diff <= 0) return "dziś";
  if (diff === 1) return "wczoraj";
  return `${diff} dni temu`;
}
