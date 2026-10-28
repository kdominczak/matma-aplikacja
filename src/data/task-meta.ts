import { placementQuestions, practiceTasks, topics, type PracticeTask } from "@/data/topics";
import type { BlueprintSlot, Section, TaskFormat } from "@/types/blueprint";
import type { Difficulty, Topic } from "@/types/topic";

// Metadane zadań do składania arkuszy według szablonu (src/data/blueprints.ts).
// Większość wynika z danych zadania (dział → dział podstawy, punkty, poziom); wartości szacunkowe
// (czas, trudność) są na razie z poziomu trudności, a docelowo z prawdziwych odpowiedzi uczniów.
// Wyjątki dla pojedynczych zadań – w TASK_OVERRIDES.

export interface TaskMeta {
  id: string;
  topicId: string;
  section: Section;
  format: TaskFormat;
  points: number;
  difficulty: Difficulty;
  /** Rodzina wariantów tego samego zadania – dwa zadania z jednej rodziny nie trafiają do jednego arkusza. */
  family: string;
  /** Szacowany czas rozwiązania w minutach (matura: 180 min na 50 pkt, ok. 3,6 min/pkt). */
  minutes: number;
  /** Szacowany odsetek uczniów rozwiązujących poprawnie (0–1). */
  expectedSuccess: number;
  /** `prior` – z poziomu trudności; `measured` – z odpowiedzi uczniów (etap kalibracji). */
  successSource: "prior" | "measured";
}

/** Szacunek trudności przed zebraniem danych: odsetek poprawnych odpowiedzi na danym poziomie. */
const PRIOR_SUCCESS: Record<Difficulty, number> = { podstawowy: 0.8, sredni: 0.6, zaawansowany: 0.4 };
const CLOSED_MINUTES: Record<Difficulty, number> = { podstawowy: 2, sredni: 3, zaawansowany: 4 };
/** Zadania otwarte: punkty częściowe sprawiają, że pełny wynik zdobywa mniej osób niż w zamkniętych. */
const OPEN_SUCCESS_FACTOR = 0.85;
const MINUTES_PER_OPEN_POINT = 4;

/**
 * Poprawki dla pojedynczych zadań, np. krótka odpowiedź zamiast rozwiązania (`format: "short"`),
 * wspólna rodzina dla wariantów (`family`) albo czas inny niż szacunek.
 */
export const TASK_OVERRIDES: Record<string, Partial<Pick<TaskMeta, "format" | "family" | "minutes" | "expectedSuccess">>> = {};

function baseMeta(task: PracticeTask, topic: Topic): TaskMeta {
  const closed = task.kind === "closed";
  return {
    id: task.id,
    topicId: topic.id,
    section: topic.section,
    // zadania otwarte w aplikacji mają rozwiązanie krok po kroku i schemat punktowania – jak „rozszerzone” w CKE
    format: closed ? (task.question.format ?? "abcd") : (task.task.format ?? "extended"),
    points: task.points,
    difficulty: task.difficulty,
    family: (closed ? task.question.family : task.task.family) ?? task.id,
    minutes: closed ? CLOSED_MINUTES[task.difficulty] : task.points * MINUTES_PER_OPEN_POINT,
    expectedSuccess: closed ? PRIOR_SUCCESS[task.difficulty] : Math.round(PRIOR_SUCCESS[task.difficulty] * OPEN_SUCCESS_FACTOR * 100) / 100,
    successSource: "prior",
  };
}

export function taskMeta(task: PracticeTask, topic: Topic): TaskMeta {
  return { ...baseMeta(task, topic), ...TASK_OVERRIDES[task.id] };
}

export interface PoolTask {
  task: PracticeTask;
  topic: Topic;
  meta: TaskMeta;
}

let pool: PoolTask[] | null = null;

/** Wszystkie zadania, z których można składać arkusze (bez testu na start – to diagnoza). */
export function examPool(): PoolTask[] {
  if (pool) return pool;
  const placement = new Set(placementQuestions().map((r) => r.question.id));
  pool = topics.flatMap((topic) =>
    practiceTasks(topic)
      .filter((task) => !placement.has(task.id))
      .map((task) => ({ task, topic, meta: taskMeta(task, topic) })),
  );
  return pool;
}

/**
 * Jakie typy zadań z puli mogą zastąpić typ z szablonu. Pierwszy = dokładne dopasowanie.
 * Zadania „krótkiej odpowiedzi” sprawdzamy po wyniku, więc nadają się do nich też nasze otwarte;
 * P/F i dobierania jeszcze nie mamy – do czasu ich dodania zastępuje je zadanie ABCD za tyle samo punktów.
 */
export const FORMAT_FALLBACK: Record<TaskFormat, TaskFormat[]> = {
  abcd: ["abcd"],
  truefalse: ["truefalse", "abcd"],
  choice: ["choice", "abcd"],
  short: ["short", "extended"],
  extended: ["extended"],
};

/** Główny dział pozycji szablonu (przy kilku – ostatni, jak w wymaganiach CKE). */
export function slotSection(slot: BlueprintSlot): Section {
  return slot.sections.at(-1) ?? "I";
}

/** Kandydaci do pozycji szablonu: ten sam dział i punkty, typ wg FORMAT_FALLBACK (z informacją, czy dokładny). */
export function slotCandidates(slot: BlueprintSlot, from = examPool()): { item: PoolTask; exact: boolean }[] {
  const section = slotSection(slot);
  const formats = FORMAT_FALLBACK[slot.format];
  return from
    .filter((p) => p.meta.section === section && p.meta.points === slot.points && formats.includes(p.meta.format))
    .map((item) => ({ item, exact: item.meta.format === slot.format }));
}
