// Cel w punktach: przeliczanie punktów i procentów, działy potrzebne do celu z wag na maturze.
import { describe, expect, it } from "vitest";
import { MATURA_POINTS, topicExamPoints } from "@/lib/exam-weights";
import { GOAL_MAX_POINTS, GOAL_MIN_POINTS, goalPercent, goalPoints, topicsForGoal } from "@/lib/goal";

describe("cel w punktach", () => {
  it("procent ↔ punkty; dawne cele 30/60/85% zostają czytelne", () => {
    expect(MATURA_POINTS).toBe(50);
    expect(goalPoints(30)).toBe(15);
    expect(goalPoints(60)).toBe(30);
    expect(goalPoints(85)).toBe(43);
    expect(goalPercent(35)).toBe(70);
    // poza zakresem – przycięte do 15–50 pkt
    expect(goalPoints(10)).toBe(GOAL_MIN_POINTS);
    expect(goalPercent(99)).toBe(100);
    expect(goalPoints(goalPercent(GOAL_MAX_POINTS))).toBe(GOAL_MAX_POINTS);
  });

  it("wyższy cel = więcej działów; mniejszy zbiór zawiera się w większym", () => {
    let previous = new Set<string>();
    for (const percent of [30, 40, 50, 60, 70, 80, 90, 100]) {
      const ids = new Set(topicsForGoal(percent).map((t) => t.id));
      expect(ids.size).toBeGreaterThanOrEqual(previous.size);
      for (const id of previous) expect(ids.has(id)).toBe(true);
      previous = ids;
    }
  });

  it("działy celu dają oczekiwane punkty (80% wagi) co najmniej równe celowi, gdy to w ogóle możliwe", () => {
    for (const percent of [30, 50, 70]) {
      const expected = topicsForGoal(percent).reduce((sum, t) => sum + topicExamPoints(t) * 0.8, 0);
      expect(expected).toBeGreaterThanOrEqual(goalPoints(percent));
    }
  });
});
