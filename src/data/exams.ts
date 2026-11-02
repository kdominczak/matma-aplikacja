import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { MOCK_EXAMS, type FrozenExam } from "@/data/mock-exams";
import { practiceTaskById } from "@/data/topics";
import { blueprintLevel, DIFFICULTY_TOLERANCE, generateExam, parseExamCode, referenceExpected, type GeneratedExam } from "@/lib/exam-generator";
import { LEGAL } from "@/data/legal";
import type { ExamSheet } from "@/types/exam";

// Arkusze do rozwiązania w aplikacji (tryb symulacji matury, poziom podstawowy, od 2025: 50 pkt, 180 min).
//
// 1. Arkusze próbne – arkusze z generatora (src/lib/exam-generator.ts) w układzie najnowszej matury, ZAMROŻONE
//    w src/data/mock-exams.ts (lista id zadań). Generator zależy od puli zadań, więc bez zamrożenia każde nowe
//    zadanie w aplikacji zmieniałoby treść arkusza – także rozpoczętego. Nowe arkusze: `npm run exams:freeze`.
// 2. Arkusze losowe – z generatora, odtwarzane z kodu (id „los-<kod>”); nie są zapisane na stałe,
//    więc każdy kod daje inny arkusz, a ten sam kod – zawsze ten sam. Na obu poziomach: kod matury
//    rozszerzonej zaczyna się od „r” (np. „r26k3f9a”).
// 3. Oficjalne arkusze CKE – trafią do CKE_EXAMS po przepisaniu treści i klucza z PDF-ów CKE
//    (src/data/cke-sheets.ts). Nie generujemy ich „z pamięci”: uczeń musi dostać dokładnie te zadania
//    i ten klucz, które były na maturze. Id zadań muszą trafić do question_keys (npm run db:keys).

const MOCK_COUNT = 3;
const RANDOM_PREFIX = "los-";

function sheet(exam: GeneratedExam, base: Pick<ExamSheet, "id" | "kind" | "title" | "subtitle">): ExamSheet {
  return {
    ...base,
    level: blueprintLevel(exam.blueprint),
    durationMin: exam.blueprint.durationMin,
    tasks: exam.tasks,
    code: exam.code,
    layoutYear: exam.blueprint.year,
    relaxations: exam.relaxations,
  };
}

/** Kolejne ziarna, których arkusze mają typową trudność – źródło zamrożonych arkuszy próbnych (skrypt). */
export function generateMockExams(): FrozenExam[] {
  const blueprint = CURRENT_BLUEPRINTS[0];
  const reference = referenceExpected(blueprint);
  const out: FrozenExam[] = [];
  for (let seed = 1; out.length < MOCK_COUNT && seed < 500; seed++) {
    const exam = generateExam(blueprint, seed);
    if (Math.abs(exam.expected - reference) > DIFFICULTY_TOLERANCE) continue;
    out.push({
      id: `probny-${out.length + 1}`,
      code: exam.code,
      layoutYear: blueprint.year,
      durationMin: blueprint.durationMin,
      taskIds: exam.tasks.map((task) => task.id),
      relaxations: exam.relaxations,
    });
  }
  return out;
}

/** Arkusze próbne z zamrożonych list zadań. */
function mockExams(): ExamSheet[] {
  return MOCK_EXAMS.map((frozen, i) => ({
    id: frozen.id,
    kind: "probny",
    title: `Arkusz próbny nr ${i + 1}`,
    subtitle: `W układzie matury ${frozen.layoutYear} · zadania z aplikacji`,
    level: "podstawowy",
    durationMin: frozen.durationMin,
    tasks: frozen.taskIds.map((id) => {
      const task = practiceTaskById(id);
      if (!task) throw new Error(`Arkusz ${frozen.id}: brak zadania ${id} – nie usuwaj zadań z zamrożonych arkuszy`);
      return task;
    }),
    code: frozen.code,
    layoutYear: frozen.layoutYear,
    relaxations: frozen.relaxations,
  }));
}

/**
 * Oficjalne arkusze CKE przepisane do aplikacji. Format zadań – jak `PracticeTask` (patrz src/data/topics).
 * Przykład wpisu: { id: "cke-2024-maj", kind: "cke", year: 2024, session: "maj", title: "Matura maj 2024", … , pdf: { … } }.
 * `year` i `session` są obowiązkowe – z nich powstaje oznaczenie źródła (examSource, taskSource; pilnuje tego test).
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
    title: blueprintLevel(parsed.blueprint) === "rozszerzony" ? "Arkusz losowy – rozszerzenie" : "Arkusz losowy",
    subtitle: `Kod ${exam.code.toUpperCase()} · w układzie matury ${blueprintLevel(parsed.blueprint) === "rozszerzony" ? "rozszerzonej " : ""}${parsed.blueprint.year}`,
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

/**
 * Źródło zadań arkusza – widoczne przy arkuszu i przy każdym zadaniu. Zadania CKE zawsze ze wskazaniem sesji
 * i roku (podstawa korzystania z nich: materiały urzędowe, art. 4 pr. aut.); pozostałe to zadania autorskie aplikacji.
 */
export function examSource(exam: Pick<ExamSheet, "kind" | "year" | "session" | "layoutYear">): string {
  if (exam.kind === "cke") return `Zadania z arkusza CKE, matura ${exam.session ?? "maj"} ${exam.year ?? ""}`.trimEnd();
  const layout = exam.layoutYear ? ` w układzie matury ${exam.layoutYear}` : "";
  return `Zadania autorskie aplikacji ${LEGAL.appName}${layout} – nie pochodzą z arkuszy CKE`;
}

/** Krótkie źródło przy pojedynczym zadaniu arkusza CKE (null – zadanie autorskie, bez dopisku). */
export function taskSource(exam: Pick<ExamSheet, "kind" | "year" | "session">): string | null {
  return exam.kind === "cke" ? `Zadanie z arkusza CKE, ${exam.session ?? "maj"} ${exam.year ?? ""}`.trimEnd() : null;
}

export function examMaxPoints(exam: ExamSheet): number {
  return exam.tasks.reduce((sum, task) => sum + task.points, 0);
}
