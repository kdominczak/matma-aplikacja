import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { DIFFICULTY_TOLERANCE, generateExam, parseExamCode, referenceExpected, type GeneratedExam } from "@/lib/exam-generator";
import type { ExamSheet } from "@/types/exam";

// Arkusze do rozwiązania w aplikacji (tryb symulacji matury, poziom podstawowy, od 2025: 50 pkt, 180 min).
//
// 1. Arkusze próbne – stałe arkusze z generatora (src/lib/exam-generator.ts) w układzie najnowszej matury:
//    te same działy, typy zadań i punktacja co w oryginale, zadania z puli aplikacji.
// 2. Arkusze losowe – z generatora, odtwarzane z kodu (id „los-<kod>”); nie są zapisane na stałe,
//    więc każdy kod daje inny arkusz, a ten sam kod – zawsze ten sam.
// 3. Oficjalne arkusze CKE – trafią do CKE_EXAMS po przepisaniu treści i klucza z PDF-ów CKE
//    (src/data/cke-sheets.ts). Nie generujemy ich „z pamięci”: uczeń musi dostać dokładnie te zadania
//    i ten klucz, które były na maturze. Id zadań muszą trafić do question_keys (npm run db:keys).

const MOCK_COUNT = 3;
const RANDOM_PREFIX = "los-";

function sheet(exam: GeneratedExam, base: Pick<ExamSheet, "id" | "kind" | "title" | "subtitle">): ExamSheet {
  return {
    ...base,
    level: "podstawowy",
    durationMin: exam.blueprint.durationMin,
    tasks: exam.tasks,
    code: exam.code,
    layoutYear: exam.blueprint.year,
    relaxations: exam.relaxations,
  };
}

/** Stałe arkusze próbne: kolejne ziarna, których arkusze mają typową trudność. */
function mockExams(): ExamSheet[] {
  const blueprint = CURRENT_BLUEPRINTS[0];
  const reference = referenceExpected(blueprint);
  const out: ExamSheet[] = [];
  for (let seed = 1; out.length < MOCK_COUNT && seed < 500; seed++) {
    const exam = generateExam(blueprint, seed);
    if (Math.abs(exam.expected - reference) > DIFFICULTY_TOLERANCE) continue;
    const n = out.length + 1;
    out.push(
      sheet(exam, {
        id: `probny-${n}`,
        kind: "probny",
        title: `Arkusz próbny nr ${n}`,
        subtitle: `W układzie matury ${blueprint.year} · zadania z aplikacji`,
      }),
    );
  }
  return out;
}

/**
 * Oficjalne arkusze CKE przepisane do aplikacji. Format zadań – jak `PracticeTask` (patrz src/data/practice).
 * Przykład wpisu: { id: "cke-2024-maj", kind: "cke", year: 2024, title: "Matura maj 2024", … , pdf: { … } }.
 */
const CKE_EXAMS: ExamSheet[] = [];

export const EXAMS: ExamSheet[] = [...CKE_EXAMS, ...mockExams()];

/** Arkusz losowy z kodu (np. „26k3f9a”) – null, gdy kod jest niepoprawny. */
export function randomExam(code: string): ExamSheet | null {
  const parsed = parseExamCode(code);
  if (!parsed) return null;
  const exam = generateExam(parsed.blueprint, parsed.seed);
  return sheet(exam, {
    id: `${RANDOM_PREFIX}${exam.code}`,
    kind: "losowy",
    title: "Arkusz losowy",
    subtitle: `Kod ${exam.code.toUpperCase()} · w układzie matury ${parsed.blueprint.year}`,
  });
}

const randomCache = new Map<string, ExamSheet | null>();

export function getExam(id: string): ExamSheet | undefined {
  const fixed = EXAMS.find((exam) => exam.id === id);
  if (fixed || !id.startsWith(RANDOM_PREFIX)) return fixed;
  const code = id.slice(RANDOM_PREFIX.length);
  if (!randomCache.has(code)) randomCache.set(code, randomExam(code));
  return randomCache.get(code) ?? undefined;
}

/** Adres arkusza – losowe mają jedną stronę z kodem w adresie (statyczny eksport nie zna wszystkich kodów). */
export function examHref(exam: Pick<ExamSheet, "id" | "kind" | "code">): string {
  return exam.kind === "losowy" && exam.code ? `/arkusz/losowy/?kod=${exam.code}` : `/arkusz/${exam.id}/`;
}

export function examKindLabel(exam: Pick<ExamSheet, "kind">): string {
  return { cke: "Oficjalny arkusz CKE", probny: "Arkusz próbny", losowy: "Arkusz losowy" }[exam.kind];
}

export function examMaxPoints(exam: ExamSheet): number {
  return exam.tasks.reduce((sum, task) => sum + task.points, 0);
}
