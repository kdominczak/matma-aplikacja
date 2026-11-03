// Wszystkie arkusze CKE: punktacja jak w arkuszu, numery bez powtórzeń, wynik z klucza zaliczany, dowód bez wyniku.
import { existsSync } from "node:fs";
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

describe("matura podstawowa maj 2024 – klucz i zadania „wybór”", () => {
  const exam = EXAMS.find((e) => e.id === "cke-2024-maj")!;
  const byNumber = (n: string) => exam.tasks[exam.numbers!.indexOf(n)];

  it("klucz wersji A (zamknięte i P/F)", () => {
    const key = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "closed" ? [[taskNumber(exam, i), t.question.correct]] : [])));
    expect(key).toEqual({
      "1": "B", "2": "B", "4": "C", "5": "B", "6": "D", "7": "B", "8": "B", "10": "A", "11": "A", "12": "D", "13": "D",
      "14.2": "B", "14.3": "A", "15": "B", "19": "B", "20": "B", "21": "D", "22": "C", "23": "A", "25.1": "C", "27": "C",
      "28": "A", "29": "C",
    });
  });

  it("„wybór”: 14.4 (g → A, h → E), 16 (B i 2 – za komplet), 18 (B, F), 25.2 (D, rysunki z PDF)", () => {
    const answers = (n: string) => {
      const t = byNumber(n);
      if (t.kind !== "choice") throw new Error(n);
      return { t, key: t.choice.blanks.map((b) => b.answer) };
    };
    for (const n of ["14.4", "16", "18", "25.2"]) {
      const { t, key } = answers(n);
      expect(scoreTask(t, { kind: "choice", picks: key }, 1).points, n).toBe(t.points);
    }
    expect(answers("14.4").key).toEqual([["A"], ["E"]]);
    expect(answers("16").key).toEqual([["B"], ["2"]]);
    expect(answers("18").key).toEqual([["B", "F"]]);
    expect(answers("25.2").key).toEqual([["D"]]);
    const { t } = answers("25.2");
    expect(t.kind === "choice" && t.choice.options.every((o) => o.image?.startsWith("/cke/2024-maj/") && existsSync(`public${o.image}`))).toBe(true);
  });
});
