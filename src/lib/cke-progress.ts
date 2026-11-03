import { ckeTasksOfTopic } from "@/data/cke";
import type { ExamAttempt } from "@/types/exam";
import type { Progress } from "@/types/progress";
import type { Topic } from "@/types/topic";

// „Zadania z matur” – ile prawdziwych zadań CKE (z zakładki „Zadania”) uczeń rozwiązał w każdym dziale.
// Rozwiązane = komplet punktów w „Zadaniach” (wynik sprawdzony przez aplikację) albo poprawny wynik w arkuszu CKE.

export interface CkeTopicProgress {
  topic: Topic;
  solved: number;
  total: number;
}

export interface CkeProgress {
  solved: number;
  total: number;
  /** Działy z zadaniami CKE – najwięcej nierozwiązanych na górze. */
  rows: CkeTopicProgress[];
}

export function ckeProgress(progress: Progress | null, attempts: ExamAttempt[] | null, list: Topic[]): CkeProgress {
  const fromExams = new Set((attempts ?? []).flatMap((a) => a.results.filter((r) => r.status === "correct").map((r) => r.taskId)));
  const rows = list
    .map((topic) => {
      const tasks = ckeTasksOfTopic(topic.id);
      const solved = tasks.filter((task) => {
        const record = progress?.practice[task.id];
        return fromExams.has(task.id) || Boolean(record && record.verifiedPoints >= record.maxPoints);
      }).length;
      return { topic, solved, total: tasks.length };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - b.solved - (a.total - a.solved) || a.topic.title.localeCompare(b.topic.title, "pl"));
  return { solved: rows.reduce((s, r) => s + r.solved, 0), total: rows.reduce((s, r) => s + r.total, 0), rows };
}
