// Generator arkuszy: proporcje prawdziwej matury, powtarzalność kodów i drabina zastępstw.
import { describe, expect, it } from "vitest";
import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { EXAMS, examHref, getExam, randomExam } from "@/data/exams";
import { examPool } from "@/data/task-meta";
import { topics } from "@/data/topics";
import { currentEstimate } from "@/lib/estimate";
import { MATURA_POINTS, topicExamPoints } from "@/lib/exam-weights";
import { DIFFICULTY_TOLERANCE, examCode, generateExam, parseExamCode, pickExam, referenceExpected } from "@/lib/exam-generator";
import type { Progress } from "@/types/progress";

const SEEDS = 200;

describe("arkusze z generatora", () => {
  for (const blueprint of CURRENT_BLUEPRINTS) {
    it(`układ ${blueprint.year}: ${SEEDS} arkuszy – zawsze ${blueprint.totalPoints} pkt, bez powtórzeń zadań i wariantów`, () => {
      const pool = new Map(examPool().map((p) => [p.task.id, p]));
      for (let seed = 0; seed < SEEDS; seed++) {
        const exam = generateExam(blueprint, seed * 7 + 1);
        expect(exam.points, exam.code).toBe(blueprint.totalPoints);
        const ids = exam.tasks.map((t) => t.id);
        expect(new Set(ids).size, exam.code).toBe(ids.length);
        const families = ids.map((id) => pool.get(id)!.meta.family);
        expect(new Set(families).size, exam.code).toBe(families.length);
        expect(exam.relaxations.filter((r) => r.rule === "missing"), exam.code).toEqual([]);
      }
    });

    it(`układ ${blueprint.year}: każda pozycja ma zadanie z tego samego działu i za tyle samo punktów (poza zapisanymi zastępstwami)`, () => {
      const pool = new Map(examPool().map((p) => [p.task.id, p]));
      const exam = generateExam(blueprint, 42);
      const relaxed = new Set(exam.relaxations.filter((r) => r.rule !== "format").map((r) => r.slot));
      exam.tasks.forEach((task, i) => {
        const slot = blueprint.slots.find((s) => s.number === exam.slotNumbers[i])!;
        if (relaxed.has(slot.number)) return;
        expect(pool.get(task.id)!.meta.section, `${slot.number}`).toBe(slot.sections.at(-1));
        expect(task.points, `${slot.number}`).toBe(slot.points);
      });
    });
  }

  it("ten sam kod = ten sam arkusz; kod da się odczytać", () => {
    const blueprint = CURRENT_BLUEPRINTS[0];
    const a = generateExam(blueprint, 123456);
    const b = generateExam(blueprint, 123456);
    expect(a.tasks.map((t) => t.id)).toEqual(b.tasks.map((t) => t.id));
    expect(a.code).toBe(examCode(blueprint, 123456));
    expect(parseExamCode(a.code.toUpperCase())).toEqual({ blueprint, seed: 123456 });
    expect(generateExam(blueprint, 123457).tasks.map((t) => t.id)).not.toEqual(a.tasks.map((t) => t.id));
  });

  it.each(["", "abc", "99abcde", "26abc", "26abcd!", "2600000000"])("odrzuca błędny kod „%s”", (code) => {
    expect(parseExamCode(code)).toBeNull();
    expect(randomExam(code)).toBeNull();
  });

  it("arkusz losowy otwiera się po id z kodem i ma własny adres", () => {
    const code = generateExam(CURRENT_BLUEPRINTS[0], 999).code;
    const sheet = getExam(`los-${code}`)!;
    expect(sheet.kind).toBe("losowy");
    expect(sheet.tasks.map((t) => t.id)).toEqual(generateExam(CURRENT_BLUEPRINTS[0], 999).tasks.map((t) => t.id));
    expect(examHref(sheet)).toBe(`/arkusz/losowy/?kod=${code}`);
    expect(getExam("los-zlykod")).toBeUndefined();
  });

  it("stałe arkusze próbne: 3 arkusze po 50 pkt o typowej trudności", () => {
    const mocks = EXAMS.filter((e) => e.kind === "probny");
    expect(mocks).toHaveLength(3);
    const reference = referenceExpected(CURRENT_BLUEPRINTS[0]);
    for (const mock of mocks) {
      expect(mock.tasks.reduce((s, t) => s + t.points, 0)).toBe(50);
      const parsed = parseExamCode(mock.code!)!;
      expect(Math.abs(generateExam(parsed.blueprint, parsed.seed).expected - reference)).toBeLessThanOrEqual(DIFFICULTY_TOLERANCE);
    }
  });

  it("losowanie dla ucznia omija znane zadania i trzyma typową trudność", () => {
    const blueprint = CURRENT_BLUEPRINTS[0];
    const known = generateExam(blueprint, 5);
    const seen = new Set(known.tasks.map((t) => t.id));
    let i = 0;
    const random = () => ((i++ * 0.6180339887) % 1 + 1) % 1;
    const picked = pickExam(blueprint, { seen, tries: 16, random });
    const overlap = picked.tasks.filter((t) => seen.has(t.id)).length / picked.tasks.length;
    expect(overlap).toBeLessThan(0.9);
    expect(Math.abs(picked.expected - referenceExpected(blueprint))).toBeLessThanOrEqual(DIFFICULTY_TOLERANCE);
  });
});

describe("drabina zastępstw", () => {
  const blueprint = CURRENT_BLUEPRINTS.find((b) => b.year === 2026)!;

  it("brak działu (układy równań) → zadanie z pokrewnego działu za tyle samo punktów", () => {
    const pool = examPool().filter((p) => p.meta.section !== "IV");
    const exam = generateExam(blueprint, 1, pool);
    const relaxation = exam.relaxations.find((r) => r.slot === "11")!;
    expect(relaxation.rule).toBe("neighbor");
    expect(relaxation.note).toContain("Równania i nierówności");
    expect(exam.points).toBe(50);
  });

  it("brak zadania otwartego za 4 pkt → dwa krótsze zadania (2 + 2), punktacja bez zmian", () => {
    const pool = examPool().filter((p) => !(p.meta.section === "V" && p.meta.points === 4) && !(p.meta.section === "XIII" && p.meta.points === 4));
    const exam = generateExam(blueprint, 1, pool);
    const relaxation = exam.relaxations.find((r) => r.slot === "14")!;
    expect(relaxation.rule).toBe("split");
    expect(exam.slotNumbers.filter((n) => n === "14")).toHaveLength(2);
    expect(exam.points).toBe(50);
  });

  it("brak P/F → zadanie ABCD za 1 pkt (zastępstwo typu)", () => {
    const pool = examPool().filter((p) => p.meta.format !== "truefalse");
    const exam = generateExam(blueprint, 1, pool);
    const tf = blueprint.slots.filter((s) => s.format === "truefalse").map((s) => s.number);
    expect(exam.relaxations.filter((r) => tf.includes(r.slot)).every((r) => r.rule === "format")).toBe(true);
    expect(exam.points).toBe(50);
  });

  it("pusta pula → pozycje pominięte i opisane, bez wyjątku", () => {
    const exam = generateExam(blueprint, 1, []);
    expect(exam.tasks).toEqual([]);
    expect(exam.relaxations).toHaveLength(blueprint.slots.length);
    expect(exam.relaxations.every((r) => r.rule === "missing")).toBe(true);
  });
});

describe("50 punktów w szacowanym wyniku", () => {
  it("wagi działów aplikacji sumują się do punktów matury", () => {
    expect(MATURA_POINTS).toBe(50);
    expect(topics.reduce((s, t) => s + topicExamPoints(t), 0)).toBeCloseTo(50, 5);
  });

  it("same zaliczone testy (stare zapisy bez odpowiedzi) liczą się jako wynik testu z zapasem", () => {
    const tests = Object.fromEntries(
      topics
        .filter((t) => t.content)
        .flatMap((t) => ["podstawowy", "sredni", "zaawansowany"].map((d) => [`${t.id}/${d}`, { stars: 3 as const, correct: 5, total: 5, passedAt: "2026-01-01" }])),
    );
    const progress = { tests, activityByDay: {}, statsByDay: {} } as unknown as Progress;
    const lessonPoints = topics.filter((t) => t.content).reduce((s, t) => s + topicExamPoints(t), 0);
    expect(currentEstimate(progress)).toBe(Math.round(((lessonPoints * 0.8) / 50) * 100));
  });
});
