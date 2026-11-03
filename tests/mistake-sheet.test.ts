// Arkusz poprawek z błędów: które zadania trafiają na kartkę, w jakiej kolejności i z jakiego okresu.
import { describe, expect, it } from "vitest";
import { EXAMS } from "@/data/exams";
import { allTopics, practiceTasks } from "@/data/topics";
import { buildMistakeSheet, SHEET_MAX_OPEN, SHEET_MAX_TASKS } from "@/lib/mistake-sheet";
import type { ExamAttempt, ExamTaskResult } from "@/types/exam";
import type { Progress } from "@/types/progress";

const TODAY = "2026-11-01";

function progress(patch: Partial<Progress> = {}): Progress {
  return {
    activityByDay: {},
    tests: {},
    target: 30,
    stats: { answered: 0, correct: 0, perfectTests: 0, dailyChallenges: 0, nightSessions: 0, earlySessions: 0, mistakesBeaten: 0, reviewsMastered: 0 },
    achievements: {},
    mistakes: {},
    topicStats: {},
    practice: {},
    reviews: {},
    planDays: {},
    statsByDay: {},
    ...patch,
  };
}

const tasks = allTopics.flatMap(practiceTasks);
const closed = tasks.filter((t) => t.kind === "closed");
const open = tasks.filter((t) => t.kind === "open");

function attempt(examId: string, finishedAt: string, results: Partial<ExamTaskResult>[]): ExamAttempt {
  return {
    id: `a-${finishedAt}`,
    examId,
    startedAt: finishedAt,
    finishedAt,
    durationSec: 600,
    points: 0,
    maxPoints: 50,
    percent: 0,
    results: results.map((r, i) => ({ taskId: "", number: i + 1, kind: "closed", status: "wrong", points: 0, maxPoints: 1, ...r })),
  };
}

describe("arkusz poprawek z błędów", () => {
  it("bierze pomyłki z ostatnich 30 dni, najczęstsze na początku", () => {
    const sheet = buildMistakeSheet(
      progress({
        mistakes: {
          [closed[0].id]: { lastWrong: "2026-10-30", count: 1, chosen: "B" },
          [closed[1].id]: { lastWrong: "2026-10-03", count: 4, chosen: "C" },
          [closed[2].id]: { lastWrong: "2026-10-02", count: 9, chosen: "C" }, // 31 dni temu – poza okresem
        },
      }),
      [],
      { today: TODAY },
    );
    expect(sheet.from).toBe("2026-10-03");
    expect(sheet.items.map((i) => i.task.id)).toEqual([closed[1].id, closed[0].id]);
    expect(sheet.points).toBe(2);
  });

  it("„od początku” bierze też starsze błędy", () => {
    const sheet = buildMistakeSheet(progress({ mistakes: { [closed[2].id]: { lastWrong: "2025-01-01", count: 1, chosen: "C" } } }), [], {
      today: TODAY,
      days: null,
    });
    expect(sheet.from).toBeNull();
    expect(sheet.items).toHaveLength(1);
  });

  it("zadania otwarte: próbowane i nierozwiązane w całości – tak, rozwiązane – nie; otwarte po zamkniętych", () => {
    const sheet = buildMistakeSheet(
      progress({
        mistakes: { [closed[0].id]: { lastWrong: TODAY, count: 1, chosen: "B" } },
        practice: {
          [open[0].id]: { points: 1, verifiedPoints: 0, maxPoints: open[0].points, attempts: 3, lastAt: TODAY },
          [open[1].id]: { points: open[1].points, verifiedPoints: open[1].points, maxPoints: open[1].points, attempts: 2, lastAt: TODAY },
        },
      }),
      [],
      { today: TODAY },
    );
    expect(sheet.items.map((i) => i.task.id)).toEqual([closed[0].id, open[0].id]);
    expect(sheet.items[1].wrong).toBe(3);
  });

  it("błędy z arkuszy sumują się z pomyłkami; zadanie poprawione później w „Zadaniach” wypada", () => {
    const exam = EXAMS[0];
    const [a, b] = exam.tasks;
    const sheet = buildMistakeSheet(
      progress({
        mistakes: a.kind === "closed" ? { [a.id]: { lastWrong: "2026-10-20", count: 1, chosen: "B" } } : {},
        practice: { [b.id]: { points: b.points, verifiedPoints: b.points, maxPoints: b.points, attempts: 1, lastAt: "2026-10-29" } },
      }),
      [
        attempt(exam.id, "2026-10-28T10:00:00.000Z", [
          { taskId: a.id, kind: a.kind, status: "wrong" },
          { taskId: b.id, kind: b.kind, status: "partial" },
        ]),
      ],
      { today: TODAY },
    );
    expect(sheet.items.map((i) => i.task.id)).toEqual([a.id]);
    expect(sheet.items[0].wrong).toBe(a.kind === "closed" ? 2 : 1);
    expect(sheet.items[0].lastDay).toBe("2026-10-28");
    expect(sheet.items[0].source).toBeNull(); // arkusz próbny – zadania autorskie
  });

  it("pomija pominięte zadania arkusza i nieznane arkusze", () => {
    const exam = EXAMS[0];
    const sheet = buildMistakeSheet(
      progress(),
      [attempt(exam.id, "2026-10-28T10:00:00.000Z", [{ taskId: exam.tasks[0].id, status: "skipped" }]), attempt("nie-ma", "2026-10-28T10:00:00.000Z", [{ taskId: "x" }])],
      { today: TODAY },
    );
    expect(sheet.items).toEqual([]);
  });

  it(`najwyżej ${SHEET_MAX_TASKS} zadań, w tym ${SHEET_MAX_OPEN} otwartych`, () => {
    const sheet = buildMistakeSheet(
      progress({
        mistakes: Object.fromEntries(closed.slice(0, 30).map((t) => [t.id, { lastWrong: TODAY, count: 1, chosen: "A" as const }])),
        practice: Object.fromEntries(open.slice(0, 10).map((t) => [t.id, { points: 0, verifiedPoints: 0, maxPoints: t.points, attempts: 1, lastAt: TODAY }])),
      }),
      [],
      { today: TODAY },
    );
    expect(sheet.items).toHaveLength(SHEET_MAX_TASKS);
    expect(sheet.items.filter((i) => i.task.kind === "open")).toHaveLength(SHEET_MAX_OPEN);
  });
});
