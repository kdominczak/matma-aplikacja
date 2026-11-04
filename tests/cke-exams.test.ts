// Wszystkie arkusze CKE: punktacja jak w arkuszu, numery bez powtórzeń, wynik z klucza zaliczany, dowód bez wyniku.
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXAMS, examCode, examMaxPoints } from "@/data/exams";
import { matchesAnswer } from "@/lib/calc";
import { scoreTask, taskNumber } from "@/lib/exam";

const CKE = EXAMS.filter((e) => e.kind === "cke");
/** Matura podstawowa: formuła 2015 w 2022 – 45 pkt (okrojone wymagania), 46 pkt w latach 2023–2024, od 2025 – 50; rozszerzona – 50. */
const maxPoints = (level: string, year: number) => (level === "podstawowy" && year <= 2022 ? 45 : level === "podstawowy" && year < 2025 ? 46 : 50);
/** Formuła 2015 (do 2022): 170 min na poziomie podstawowym; od 2023 – 180. */
const duration = (level: string, year: number) => (level === "podstawowy" && year <= 2022 ? 170 : 180);

describe.each(CKE.map((e) => [e.id, e] as const))("arkusz CKE %s", (_, exam) => {
  it("punkty, czas, numery i id jak w arkuszu", () => {
    expect(examMaxPoints(exam)).toBe(maxPoints(exam.level, exam.year!));
    expect(exam.durationMin).toBe(duration(exam.level, exam.year!));
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

describe("matura podstawowa maj 2023 – klucz wersji A", () => {
  const exam = EXAMS.find((e) => e.id === "cke-2023-maj")!;

  it("zamknięte, P/F i „wybór” (11: C, E; 23: A i 2; 29: C, A)", () => {
    const key = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "closed" ? [[taskNumber(exam, i), t.question.correct]] : [])));
    expect(key).toEqual({
      "1": "B", "2": "A", "4": "D", "5": "A", "6": "C", "7": "D", "8": "A", "10": "D", "12.1": "A", "12.2": "C", "12.3": "D",
      "13": "C", "14": "A", "15": "D", "16": "C", "18": "D", "19": "A", "20": "B", "21": "B", "24": "D", "25": "B", "27": "B",
      "28": "C", "31.1": "C",
    });
    const choices = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "choice" ? [[taskNumber(exam, i), t.choice.blanks.map((b) => b.answer.join(""))]] : [])));
    expect(choices).toEqual({ "11": ["CE"], "23": ["A", "2"], "29": ["C", "A"] });
  });
});

describe("matura podstawowa maj 2026 – klucz wersji A", () => {
  const exam = EXAMS.find((e) => e.id === "cke-2026-maj")!;

  it("zamknięte i P/F", () => {
    const key = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "closed" ? [[taskNumber(exam, i), t.question.correct]] : [])));
    expect(key).toEqual({
      "1": "C", "2": "B", "3": "C", "4": "B", "5": "A", "6": "A", "8": "C", "9": "D", "13.1": "D", "13.2": "A", "16": "B",
      "18": "C", "19": "C", "20": "B", "23": "D", "24.1": "B", "24.2": "D", "25": "B", "26": "D", "28": "D", "29": "A",
      "31": "A", "32": "C", "33.1": "D", "33.2": "A",
    });
  });
});

describe("matura podstawowa maj 2022 (formuła 2015) – klucz wersji A", () => {
  const exam = EXAMS.find((e) => e.id === "cke-2022-maj")!;

  it("zadania zamknięte 1–28 i wyniki otwartych", () => {
    const key = Object.fromEntries(exam.tasks.flatMap((t, i) => (t.kind === "closed" ? [[taskNumber(exam, i), t.question.correct]] : [])));
    expect(key).toEqual({
      "1": "A", "2": "B", "3": "C", "4": "B", "5": "A", "6": "B", "7": "C", "8": "C", "9": "B", "10": "D", "11": "D", "12": "B",
      "13": "D", "14": "A", "15": "A", "16": "D", "17": "B", "18": "D", "19": "D", "20": "A", "21": "B", "22": "C", "23": "A",
      "24": "A", "25": "B", "26": "D", "27": "B", "28": "C",
    });
    const open = (n: string) => exam.tasks[exam.numbers!.indexOf(n)];
    const accepts = (n: string, input: string) => scoreTask(open(n), { kind: "open", input }, exam.numbers!.indexOf(n) + 1).status;
    expect(accepts("29", "(-inf; -2> u <8/3; inf)")).toBe("correct");
    expect(accepts("30", "14750")).toBe("correct");
    expect(accepts("32", "0,8")).toBe("correct");
    expect(accepts("33", "72")).toBe("correct");
    expect(accepts("34", "4/81")).toBe("correct");
    expect(accepts("35", "-0,375; -0,75; 5,625")).toBe("correct");
  });
});

describe("kod arkusza CKE na karcie", () => {
  it("z nazwy PDF, bez dopisku „-arkusz”; arkusze aplikacji bez kodu", () => {
    const code = (id: string) => examCode(EXAMS.find((e) => e.id === id)!);
    expect(code("cke-2022-maj")).toBe("EMAP-P0-100-2205");
    expect(code("cke-2025-maj")).toBe("MMAP-P0-100-A-2505");
    expect(code("cke-2026-maj-r")).toBe("MMAP-R0-100-A-2605");
    for (const exam of EXAMS.filter((e) => e.kind !== "cke")) expect(examCode(exam)).toBeNull();
  });
});
