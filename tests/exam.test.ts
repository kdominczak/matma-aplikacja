// Arkusz: punkty częściowe za kroki zadań otwartych (samoocena / AI) i czas egzaminu do „Zakończ”.
import { describe, expect, it } from "vitest";
import { practiceTasks, topics, type PracticeTask } from "@/data/topics";
import { applyAssessment, finishExam, needsAssessment, scoreExam } from "@/lib/exam";
import type { ExamSession, ExamSheet } from "@/types/exam";

const all = topics.flatMap(practiceTasks);
const extended = all.find((t): t is PracticeTask & { kind: "open" } => t.kind === "open" && t.task.format !== "short" && t.task.solution.length > 2)!;
const short = all.find((t): t is PracticeTask & { kind: "open" } => t.kind === "open" && t.task.format === "short");
const closed = all.find((t) => t.kind === "closed")!;

const exam: ExamSheet = { id: "test", kind: "probny", title: "Test", subtitle: "", level: "podstawowy", durationMin: 180, tasks: [closed, extended] };
const session = (input: string, finishedAt?: number): ExamSession => ({
  examId: "test",
  startedAt: 1_000_000,
  current: 0,
  answers: { [extended.id]: { kind: "open", input } },
  flagged: [],
  finishedAt,
});

describe("ocena kroków zadań otwartych", () => {
  it("czeka tylko rozszerzone zadanie bez poprawnego wyniku", () => {
    const [closedResult, wrong] = scoreExam(exam, session("12345"));
    expect(needsAssessment(extended, wrong)).toBe(true);
    expect(needsAssessment(closed, closedResult)).toBe(false);
    const [, right] = scoreExam(exam, session(extended.task.answers[0]));
    expect(needsAssessment(extended, right)).toBe(false);
    if (short) expect(needsAssessment(short, { ...wrong, taskId: short.id })).toBe(false); // na maturze liczy się sam wynik
  });

  it("punkty za zaznaczone kroki, status „partial” (nie „correct” – statystyki zostają uczciwe)", () => {
    const [, wrong] = scoreExam(exam, session("12345"));
    const steps = extended.task.solution.map((s, i) => (i === 0 ? s.points : 0));
    const result = applyAssessment(extended, wrong, { by: "self", steps });
    expect(result.points).toBe(extended.task.solution[0].points);
    expect(result.status).toBe("partial");
    expect(result.assessment).toEqual({ by: "self", steps });
  });

  it("ocena spoza schematu (np. z AI) jest obcinana do punktów kroku i zadania", () => {
    const [, skipped] = scoreExam(exam, session(""));
    const result = applyAssessment(extended, skipped, { by: "ai", steps: extended.task.solution.map(() => 99).concat([5]) });
    expect(result.points).toBe(extended.points);
    expect(result.assessment?.steps).toEqual(extended.task.solution.map((s) => s.points));
    expect(applyAssessment(extended, skipped, { by: "ai", steps: [-3, 0.4] }).points).toBe(0);
    expect(applyAssessment(extended, skipped, { by: "ai", steps: [] }).status).toBe("skipped");
  });

  it("wynik arkusza z ocenionymi krokami; czas egzaminu do chwili „Zakończ”, nie do końca sprawdzania", () => {
    const s = session("12345", 1_000_000 + 600_000);
    const results = scoreExam(exam, s);
    results[1] = applyAssessment(extended, results[1], { by: "self", steps: extended.task.solution.map((x) => x.points) });
    const attempt = finishExam(exam, s, 1_000_000 + 900_000, results);
    expect(attempt.durationSec).toBe(600);
    expect(attempt.points).toBe(results.reduce((sum, r) => sum + r.points, 0));
  });
});

it("ocena AI zachowuje uzasadnienia przy krokach (przycięte), samoocena – bez nich", () => {
  const [, wrong] = scoreExam(exam, session("12345"));
  const reasons = extended.task.solution.map((_, i) => (i === 0 ? "x".repeat(500) : `krok ${i + 1}`));
  const ai = applyAssessment(extended, wrong, { by: "ai", steps: [1], reasons });
  expect(ai.assessment?.reasons?.[0]).toHaveLength(400);
  expect(ai.assessment?.reasons).toHaveLength(extended.task.solution.length);
  expect(applyAssessment(extended, wrong, { by: "self", steps: [1], reasons }).assessment?.reasons).toBeUndefined();
});
