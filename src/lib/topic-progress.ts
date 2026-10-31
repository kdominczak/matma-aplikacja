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

/**
 * Poziomy trudności opanowane w dziale (0–3): skuteczność ≥ 75% przy co najmniej kilku odpowiedziach
 * (z zadań, arkuszy, planu – wszystko liczy się do statystyk działu) albo dawny zaliczony test. Do odznak.
 */
export function masteredLevels(progress: Progress, topicId: string): number {
  return DIFFICULTIES.filter(({ id }) => {
    const legacy = progress.tests[testKey(topicId, id)];
    if (legacy && !legacy.fromPlacement) return true;
    const { answered, correct } = levelStat(progress, topicId, id);
    return answered >= MIN_ANSWERS && smoothedAccuracy(answered, correct) >= LEVEL_MASTERED;
  }).length;
}
