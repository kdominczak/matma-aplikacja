// Wszystkie arkusze CKE: punktacja jak w arkuszu, numery bez powtórzeń, wynik z klucza zaliczany, dowód bez wyniku.
import { describe, expect, it } from "vitest";
import { EXAMS, examMaxPoints } from "@/data/exams";
import { matchesAnswer } from "@/lib/calc";
import { scoreTask, taskNumber } from "@/lib/exam";

const CKE = EXAMS.filter((e) => e.kind === "cke");
/** Matura podstawowa: 46 pkt w latach 2023–2024, od 2025 – 50; rozszerzona – zawsze 50. */
const maxPoints = (level: string, year: number) => (level === "podstawowy" && year < 2025 ? 46 : 50);

describe.each(CKE.map((e) => [e.id, e] as const))("arkusz CKE %s", (_, exam) => {
  it("punkty, czas, numery i id jak w arkuszu", () => {
    expect(examMaxPoints(exam)).toBe(maxPoints(exam.level, exam.year!));
    expect(exam.durationMin).toBe(180);
    const numbers = exam.tasks.map((_, i) => taskNumber(exam, i));
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(exam.numbers).toHaveLength(exam.tasks.length);
    expect(exam.tasks.every((t) => t.id.startsWith(`${exam.id}-`))).toBe(true);
  });

  it("zadania otwarte: kroki = punkty, wynik z klucza zaliczany, dowód bez wyniku", () => {
    for (const [i, t] of exam.tasks.entries()) {
      if (t.kind !== "open") continue;
      const n = taskNumber(exam, i);
      expect(t.task.solution.reduce((s, x) => s + x.points, 0), n).toBe(t.points);
      if (t.task.format === "proof") {
        expect(t.task.answers, n).toEqual([]);
        continue;
      }
      expect(scoreTask(t, { kind: "open", input: t.task.answers[0] }, i + 1).status, n).toBe("correct");
    }
  });
});

describe("matura rozszerzona maj 2024 – zapisy ucznia", () => {
  const exam = EXAMS.find((e) => e.id === "cke-2024-maj-r")!;
  const answers = (n: string) => {
    const t = exam.tasks[exam.numbers!.indexOf(n)];
    if (t.kind !== "open") throw new Error(n);
    return t.task.answers;
  };

  it("granica, zaokrąglenie, kilka wartości, przedział", () => {
    expect(exam.tasks.map((t) => t.points)).toEqual([2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 6, 2, 4]);
    expect(matchesAnswer("−∞", answers("2"))).toBe(true);
    expect(matchesAnswer("+∞", answers("2"))).toBe(false);
    expect(matchesAnswer("59 °C", answers("1"))).toBe(true);
    expect(matchesAnswer("0,996", answers("3"))).toBe(true);
    expect(matchesAnswer("3,5; -5", answers("4"))).toBe(true);
    expect(matchesAnswer("11 040", answers("6"))).toBe(true);
    expect(matchesAnswer("x ∈ (-∞; -3)", answers("12"))).toBe(true);
    expect(matchesAnswer("(-∞; 1/3]", answers("12"))).toBe(false);
    expect(matchesAnswer("8√3; 1728+96√3", answers("13.2"))).toBe(true);
  });
});
