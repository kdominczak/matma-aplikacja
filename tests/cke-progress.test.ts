// „Zadania z matur” w Profilu: rozwiązane w „Zadaniach” (wynik sprawdzony przez aplikację) albo poprawnie w arkuszu.
import { describe, expect, it } from "vitest";
import { ckeTasksOfTopic } from "@/data/cke";
import { getTopic, topics } from "@/data/topics";
import { ckeProgress } from "@/lib/cke-progress";
import type { ExamAttempt } from "@/types/exam";
import type { Progress } from "@/types/progress";

const ciagi = getTopic("ciagi")!;
const [a, b, c] = ckeTasksOfTopic("ciagi");
const record = (points: number, verifiedPoints: number, maxPoints: number) => ({ points, verifiedPoints, maxPoints, attempts: 1, lastAt: "2026-11-01" });
const progress = { practice: { [a.id]: record(a.points, a.points, a.points), [b.id]: record(b.points, 0, b.points) } } as unknown as Progress;
const attempt = (taskId: string, status: "correct" | "wrong"): ExamAttempt =>
  ({ id: "x", examId: "cke-2025-maj", startedAt: "", finishedAt: "", durationSec: 0, points: 0, maxPoints: 50, percent: 0, results: [{ taskId, number: 1, kind: "closed", status, points: 0, maxPoints: 1 }] }) as ExamAttempt;

describe("zadania z matur", () => {
  it("liczy rozwiązane w „Zadaniach” i poprawne w arkuszu; samoocena i błędne próby się nie liczą", () => {
    const result = ckeProgress(progress, [attempt(c.id, "correct"), attempt(b.id, "wrong")], [ciagi]);
    expect(result.rows[0]).toMatchObject({ solved: 2, total: ckeTasksOfTopic("ciagi").length });
    expect(result.solved).toBe(2);
  });

  it("wszystkie działy podstawy – suma zadań CKE, najwięcej nierozwiązanych na górze", () => {
    const result = ckeProgress(null, null, topics);
    expect(result.solved).toBe(0);
    expect(result.total).toBe(topics.reduce((s, t) => s + ckeTasksOfTopic(t.id).length, 0));
    const left = result.rows.map((r) => r.total - r.solved);
    expect([...left].sort((x, y) => y - x)).toEqual(left);
  });
});
