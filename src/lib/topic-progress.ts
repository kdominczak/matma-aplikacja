import { DIFFICULTIES, practiceTasks } from "@/data/topics";
import { LEVEL_MASTERED, levelStat, MIN_ANSWERS, smoothedAccuracy } from "@/lib/mastery";
import { testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { Difficulty, Topic } from "@/types/topic";

// Postęp w dziale liczony z zadań (a nie z testów na poziomach): ile zadań rozwiązanych w całości, w podziale
// na trudność. Jedna miara dla kafelka działu, lekcji, ścieżki i zakładki Zadania.

export interface TaskProgress {
  total: number;
  solved: number;
  byDifficulty: Record<Difficulty, { total: number; solved: number }>;
}

export function topicTaskProgress(topic: Topic, progress: Progress | null): TaskProgress {
  const byDifficulty = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, { total: 0, solved: 0 }])) as TaskProgress["byDifficulty"];
  let solved = 0;
  const tasks = practiceTasks(topic);
  for (const task of tasks) {
    const record = progress?.practice[task.id];
    const done = Boolean(record && record.points === record.maxPoints);
    byDifficulty[task.difficulty].total++;
    if (done) {
      byDifficulty[task.difficulty].solved++;
      solved++;
    }
  }
  return { total: tasks.length, solved, byDifficulty };
}

/** Stan jednego poziomu trudności w dziale: opanowany (≥ 75% po wygładzeniu, co najmniej MIN_ANSWERS odpowiedzi), w toku albo nie zaczęty. */
export type LevelState = "mastered" | "progress" | "none";

export function levelState(progress: Progress, topicId: string, difficulty: Difficulty): LevelState {
  const legacy = progress.tests[testKey(topicId, difficulty)];
  if (legacy && !legacy.fromPlacement) return "mastered"; // dawny zaliczony test
  const { answered, correct } = levelStat(progress, topicId, difficulty);
  if (answered >= MIN_ANSWERS && smoothedAccuracy(answered, correct) >= LEVEL_MASTERED) return "mastered";
  return answered > 0 ? "progress" : "none";
}

/** Poziomy trudności opanowane w dziale (0–3). */
export function masteredLevels(progress: Progress, topicId: string): number {
  return DIFFICULTIES.filter(({ id }) => levelState(progress, topicId, id) === "mastered").length;
}

export interface TopicMasteryRow {
  topic: Topic;
  levels: { difficulty: Difficulty; state: LevelState; answered: number; correct: number }[];
  /** Dział opanowany = wszystkie trzy poziomy opanowane. */
  mastered: boolean;
  answered: number;
}

/**
 * „Opanowane działy” (Profil, /opanowane): dla każdego działu stan trzech poziomów według jednej miary
 * (levelState). Zastąpiły odznaki – liczy się tylko to, co przekłada się na punkty na maturze.
 */
export function topicMasteryRows(progress: Progress, list: Topic[]): TopicMasteryRow[] {
  return list.map((topic) => {
    const levels = DIFFICULTIES.map(({ id }) => {
      const { answered, correct } = levelStat(progress, topic.id, id);
      return { difficulty: id, state: levelState(progress, topic.id, id), answered, correct };
    });
    return {
      topic,
      levels,
      mastered: levels.every((l) => l.state === "mastered"),
      answered: levels.reduce((sum, l) => sum + l.answered, 0),
    };
  });
}
