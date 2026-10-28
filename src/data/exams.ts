import { practiceTasks, topics, type PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";

// Arkusze do rozwiązania w aplikacji (tryb symulacji matury, poziom podstawowy).
//
// 1. Arkusze próbne – złożone automatycznie z zadań aplikacji, w proporcjach matury podstawowej
//    (ok. 28 zadań zamkniętych po 1 pkt + zadania otwarte, razem ok. 46 pkt, 180 minut).
// 2. Oficjalne arkusze CKE – trafią do CKE_EXAMS po przepisaniu treści i klucza z PDF-ów CKE
//    (src/data/cke-sheets.ts). Nie generujemy ich „z pamięci”: uczeń musi dostać dokładnie te zadania
//    i ten klucz, które były na maturze. Id zadań muszą trafić do question_keys (npm run db:keys).

const CLOSED_COUNT = 28;
const OPEN_POINTS = 18;
const MOCK_COUNT = 3;

/** Po kolei z każdego działu, zaczynając od innego działu i innego zadania w każdym arkuszu. */
function roundRobin(groups: PracticeTask[][], seed: number, enough: (picked: PracticeTask[]) => boolean): PracticeTask[] {
  const picked: PracticeTask[] = [];
  const used = new Set<string>();
  for (let round = 0; !enough(picked) && round < 50; round++) {
    let added = false;
    for (let g = 0; g < groups.length && !enough(picked); g++) {
      const group = groups[(g + seed * 3) % groups.length];
      if (group.length === 0) continue;
      const task = group[(seed * 2 + round) % group.length];
      if (used.has(task.id)) continue;
      used.add(task.id);
      picked.push(task);
      added = true;
    }
    if (!added && round >= Math.max(...groups.map((g) => g.length))) break;
  }
  return picked;
}

function mockExam(n: number): ExamSheet {
  const byTopic = topics.map((topic) => practiceTasks(topic));
  const closed = roundRobin(
    byTopic.map((tasks) => tasks.filter((t) => t.kind === "closed")),
    n,
    (picked) => picked.length >= CLOSED_COUNT,
  );
  const open = roundRobin(
    byTopic.map((tasks) => tasks.filter((t) => t.kind === "open")),
    n,
    (picked) => picked.reduce((sum, t) => sum + t.points, 0) >= OPEN_POINTS,
  );
  return {
    id: `probny-${n}`,
    kind: "probny",
    title: `Arkusz próbny nr ${n}`,
    subtitle: "Zadania z aplikacji w układzie matury podstawowej",
    level: "podstawowy",
    durationMin: 180,
    tasks: [...closed, ...open],
  };
}

/**
 * Oficjalne arkusze CKE przepisane do aplikacji. Format zadań – jak `PracticeTask` (patrz src/data/practice).
 * Przykład wpisu: { id: "cke-2024-maj", kind: "cke", year: 2024, title: "Matura maj 2024", … , pdf: { … } }.
 */
const CKE_EXAMS: ExamSheet[] = [];

export const EXAMS: ExamSheet[] = [...CKE_EXAMS, ...Array.from({ length: MOCK_COUNT }, (_, i) => mockExam(i + 1))];

export function getExam(id: string): ExamSheet | undefined {
  return EXAMS.find((exam) => exam.id === id);
}

export function examMaxPoints(exam: ExamSheet): number {
  return exam.tasks.reduce((sum, task) => sum + task.points, 0);
}
