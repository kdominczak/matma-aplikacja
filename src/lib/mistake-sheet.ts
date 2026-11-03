import { getExam, taskSource } from "@/data/exams";
import { findQuestion, practiceTaskById, type PracticeTask } from "@/data/topics";
import { dayKey, parseDay, shiftDays } from "@/lib/stats";
import type { ExamAttempt } from "@/types/exam";
import type { Progress } from "@/types/progress";

/**
 * Arkusz poprawek z błędów (do wydruku / PDF): zadania, które sprawiły uczniowi najwięcej kłopotu w ostatnim
 * miesiącu. Źródła – wszystkie na urządzeniu (kopia postępu i historia arkuszy synchronizują się z kontem, więc
 * po zalogowaniu widać też błędy z innego telefonu):
 * - Pudełko porażek (zadania zamknięte, liczba pomyłek),
 * - zadania z „Zadań” próbowane, ale nierozwiązane w całości (głównie otwarte),
 * - błędne i częściowe zadania z rozwiązanych arkuszy (ze źródłem, gdy zadanie pochodzi z arkusza CKE).
 * Liczony na bieżąco, bez serwera – nic nie zużywa limitów AI.
 */

export const SHEET_DAYS = 30;
export const SHEET_MAX_TASKS = 15;
export const SHEET_MAX_OPEN = 5;

export interface SheetItem {
  task: PracticeTask;
  /** Ile razy zadanie poszło źle (pomyłki, nieudane próby, błędy w arkuszach). */
  wrong: number;
  /** Ostatni błąd (RRRR-MM-DD). */
  lastDay: string;
  /** Źródło zadania z arkusza CKE (null – zadanie autorskie aplikacji). */
  source: string | null;
}

export interface MistakeSheet {
  items: SheetItem[];
  /** Pierwszy dzień okresu (null – od początku). */
  from: string | null;
  to: string;
  points: number;
}

/** Zadanie zamknięte spoza „Zadań” (pytanie przy teorii, test na start) – w arkuszu wygląda jak zwykłe ABCD. */
function closedTask(id: string): PracticeTask | undefined {
  const practice = practiceTaskById(id);
  if (practice) return practice;
  const ref = findQuestion(id);
  return ref && { kind: "closed", id, difficulty: ref.difficulty, points: 1, question: ref.question };
}

export function buildMistakeSheet(
  progress: Progress,
  attempts: ExamAttempt[],
  { days = SHEET_DAYS as number | null, today = dayKey() } = {},
): MistakeSheet {
  const from = days === null ? null : dayKey(shiftDays(parseDay(today), -(days - 1)));
  const inPeriod = (day: string) => from === null || day >= from;
  const found = new Map<string, SheetItem>();

  function add(task: PracticeTask | undefined, wrong: number, day: string, source: string | null = null) {
    if (!task || !inPeriod(day)) return;
    const item = found.get(task.id);
    if (!item) {
      found.set(task.id, { task, wrong, lastDay: day, source });
      return;
    }
    item.wrong += wrong;
    if (day > item.lastDay) item.lastDay = day;
    item.source ??= source;
  }

  for (const [id, mistake] of Object.entries(progress.mistakes)) add(closedTask(id), mistake.count, mistake.lastWrong);

  for (const [id, record] of Object.entries(progress.practice)) {
    // zamknięte z „Zadań” liczy już Pudełko porażek (poprawna odpowiedź je z niego usuwa)
    if (record.attempts === 0 || record.verifiedPoints >= record.maxPoints || id in progress.mistakes) continue;
    const task = practiceTaskById(id);
    if (task?.kind === "open") add(task, record.attempts, record.lastAt);
  }

  for (const attempt of attempts) {
    const exam = getExam(attempt.examId);
    if (!exam) continue;
    const day = dayKey(new Date(attempt.finishedAt));
    for (const result of attempt.results) {
      if (result.status !== "wrong" && result.status !== "partial") continue;
      // poprawione później w „Zadaniach” – już nie jest problemem
      const later = progress.practice[result.taskId];
      if (later && later.verifiedPoints >= later.maxPoints && later.lastAt >= day) continue;
      const task = exam.tasks.find((t) => t.id === result.taskId);
      // dowodu nie da się sprawdzić wynikiem w aplikacji – zostaje do oceny krokami w arkuszu;
      // zadania „wybierz spośród A–F” są tylko w arkuszach CKE (w „Zadaniach” nie ma takiego ekranu)
      if (!task || task.kind === "choice" || (task.kind === "open" && task.task.format === "proof")) continue;
      add(
        task,
        1,
        day,
        taskSource(exam),
      );
    }
  }

  const ranked = [...found.values()].sort((a, b) => b.wrong - a.wrong || b.lastDay.localeCompare(a.lastDay) || a.task.id.localeCompare(b.task.id));
  const open = ranked.filter((i) => i.task.kind === "open").slice(0, SHEET_MAX_OPEN);
  const closed = ranked.filter((i) => i.task.kind === "closed").slice(0, SHEET_MAX_TASKS - open.length);
  // układ jak na maturze: najpierw zamknięte, potem otwarte
  const items = [...closed, ...open];
  return { items, from, to: today, points: items.reduce((sum, i) => sum + i.task.points, 0) };
}
