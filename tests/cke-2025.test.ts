// Matura maj 2025 (arkusz CKE przepisany z PDF): punktacja jak w arkuszu, klucz przechodzi przez sprawdzanie aplikacji.
import { describe, expect, it } from "vitest";
import { CKE_2025_MAJ } from "@/data/cke/matura-2025-maj";
import { examMaxPoints, getExam } from "@/data/exams";
import { matchesAnswer } from "@/lib/calc";
import { scoreTask, taskNumber } from "@/lib/exam";

const exam = CKE_2025_MAJ;

describe("matura maj 2025 – arkusz CKE", () => {
  it("50 punktów, 180 minut, źródło CKE, dostępny pod swoim id", () => {
    expect(examMaxPoints(exam)).toBe(50);
    expect(exam.durationMin).toBe(180);
    expect(exam.kind === "cke" && exam.year === 2025 && exam.session === "maj").toBe(true);
    expect(getExam("cke-2025-maj")).toBe(exam);
  });

  it("numery jak w arkuszu (1–31 z podpunktami), bez powtórzeń, jeden numer na zadanie", () => {
    const numbers = exam.tasks.map((_, i) => taskNumber(exam, i));
    expect(numbers).toHaveLength(exam.tasks.length);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(numbers[0]).toBe("1");
    expect(numbers.at(-1)).toBe("31");
    expect(numbers).toContain("12.1");
    expect(new Set(exam.tasks.map((t) => t.id)).size).toBe(exam.tasks.length);
  });

  it("klucz wersji A: litery zadań zamkniętych", () => {
    const key = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "closed" ? [[taskNumber(exam, i), t.question.correct]] : [])));
    expect(key).toEqual({
      "1": "B", "2": "B", "3": "A", "4": "C", "6": "D", "7": "A", "8": "C", "12.2": "A", "13": "C", "14.1": "D",
      "14.2": "D", "16": "B", "17": "C", "18.1": "D", "18.2": "A", "19": "C", "20": "B", "21": "C", "22": "C", "23": "B",
      "24": "B", "26": "A", "27": "A", "28": "D", "29": "C",
    });
  });

  it("zadania otwarte: kroki sumują się do punktów, wynik z klucza zalicza się automatycznie (dowód – bez wyniku)", () => {
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

  it("odpowiedzi ucznia w typowych zapisach (przedziały, ułamki, π)", () => {
    const task = (n: string) => {
      const t = exam.tasks[exam.numbers!.indexOf(n)];
      if (t.kind !== "open") throw new Error(n);
      return t.task.answers;
    };
    expect(matchesAnswer("⟨-4; 4)", task("11.1"))).toBe(true);
    expect(matchesAnswer("[-4, 4]", task("11.1"))).toBe(false);
    expect(matchesAnswer("(-3;3>", task("11.2"))).toBe(true);
    expect(matchesAnswer("x ∈ (1/3; 1,5)", task("10"))).toBe(true);
    expect(matchesAnswer("4,5", task("30.1"))).toBe(true);
    expect(matchesAnswer("64π", task("25"))).toBe(true);
    expect(matchesAnswer("735 000 zł", task("9"))).toBe(true);
  });
});
