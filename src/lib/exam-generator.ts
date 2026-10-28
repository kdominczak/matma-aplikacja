import { CURRENT_BLUEPRINTS, SECTION_NAMES } from "@/data/blueprints";
import { examPool, FORMAT_FALLBACK, slotSection, type PoolTask } from "@/data/task-meta";
import type { PracticeTask } from "@/data/topics";
import { seededRandom, shuffled } from "@/lib/random";
import type { BlueprintSlot, ExamBlueprint, Relaxation, Section, TaskFormat } from "@/types/blueprint";

// Generator arkuszy w układzie prawdziwej matury: każda pozycja szablonu (src/data/blueprints.ts) dostaje
// zadanie z puli o tym samym dziale, typie i punktacji. Gdy pula nie ma pasującego zadania, generator schodzi
// po drabinie zastępstw i zapisuje każde zastępstwo, żeby uczeń wiedział, czym arkusz różni się od oryginału:
//   1. inny typ zadania za tyle samo punktów (np. ABCD zamiast P/F) – FORMAT_FALLBACK,
//   2. pokrewny dział za tyle samo punktów (np. równania zamiast układów równań),
//   3. zadanie otwarte rozbite na dwa mniejsze z tego samego lub pokrewnego działu (np. 4 = 2 + 2),
//   4. dowolny dział za tyle samo punktów,
//   5. brak – pozycja odpada (arkusz ma mniej punktów niż oryginał).
// Ten sam kod arkusza = zawsze ten sam arkusz (można go wysłać znajomemu).

/** Pokrewne działy – zastępstwo, gdy w dziale brakuje zadań (najpierw najbliższy tematycznie). */
const NEIGHBORS: Record<Section, Section[]> = {
  I: ["II", "III"],
  II: ["I", "III"],
  III: ["II", "IV", "V"],
  IV: ["III", "V"],
  V: ["XIII", "III"],
  VI: ["V", "I"],
  VII: ["VIII", "X"],
  VIII: ["VII", "IX"],
  IX: ["VIII", "V"],
  X: ["VIII", "VII"],
  XI: ["XII", "I"],
  XII: ["XI", "I"],
  XIII: ["V", "III"],
};

export type { Relaxation };

export interface GeneratedExam {
  blueprint: ExamBlueprint;
  seed: number;
  code: string;
  tasks: PracticeTask[];
  /** Numer pozycji szablonu dla każdego zadania (przy rozbiciu – ten sam numer dla dwóch zadań). */
  slotNumbers: string[];
  points: number;
  relaxations: Relaxation[];
  /** Szacowany wynik przeciętnego ucznia (0–1) – z trudności zadań. */
  expected: number;
}

const FORMAT_NAMES: Record<TaskFormat, string> = {
  abcd: "zamknięte ABCD",
  truefalse: "prawda/fałsz",
  choice: "wielokrotnego wyboru",
  short: "z krótką odpowiedzią",
  extended: "otwarte z rozwiązaniem",
};

const isOpen = (format: TaskFormat) => format === "short" || format === "extended";

// ── Kod arkusza: 2 cyfry roku układu + ziarno w systemie 36 (np. „26k3f9a”) ──

const SEED_SPACE = 36 ** 5;

export function examCode(blueprint: ExamBlueprint, seed: number): string {
  return `${String(blueprint.year).slice(2)}${seed.toString(36).padStart(5, "0")}`;
}

export function parseExamCode(code: string): { blueprint: ExamBlueprint; seed: number } | null {
  const match = code.trim().toLowerCase().match(/^(\d{2})([0-9a-z]{5})$/);
  if (!match) return null;
  const blueprint = CURRENT_BLUEPRINTS.find((b) => String(b.year).slice(2) === match[1]);
  const seed = parseInt(match[2], 36);
  return blueprint && Number.isFinite(seed) ? { blueprint, seed } : null;
}

// ── Składanie ──

interface Picker {
  used: Set<string>;
  families: Set<string>;
  random: () => number;
}

function available(pool: PoolTask[], picker: Picker, filter: (p: PoolTask) => boolean): PoolTask[] {
  return shuffled(
    pool.filter((p) => !picker.used.has(p.task.id) && !picker.families.has(p.meta.family) && filter(p)),
    picker.random,
  );
}

function take(item: PoolTask, picker: Picker) {
  picker.used.add(item.task.id);
  picker.families.add(item.meta.family);
}

/** Zadania dla jednej pozycji szablonu + ewentualne zastępstwo. */
function fillSlot(slot: BlueprintSlot, pool: PoolTask[], picker: Picker): { items: PoolTask[]; relaxation?: Relaxation } {
  const section = slotSection(slot);
  const formats = FORMAT_FALLBACK[slot.format];
  const where = `Zad. ${slot.number} (${SECTION_NAMES[section]}, ${slot.points} pkt)`;
  const sameKind = (p: PoolTask) => isOpen(p.meta.format) === isOpen(slot.format);

  // 0–1: ten sam dział i punkty; najpierw dokładny typ, potem zastępczy
  for (const format of formats) {
    const [item] = available(pool, picker, (p) => p.meta.section === section && p.meta.points === slot.points && p.meta.format === format);
    if (item) {
      take(item, picker);
      return format === slot.format
        ? { items: [item] }
        : { items: [item], relaxation: { slot: slot.number, points: slot.points, rule: "format", note: `${where}: zadanie ${FORMAT_NAMES[format]} zamiast ${FORMAT_NAMES[slot.format]}` } };
    }
  }

  // 2: pokrewny dział
  for (const neighbor of NEIGHBORS[section]) {
    const [item] = available(pool, picker, (p) => p.meta.section === neighbor && p.meta.points === slot.points && formats.includes(p.meta.format));
    if (item) {
      take(item, picker);
      return { items: [item], relaxation: { slot: slot.number, points: slot.points, rule: "neighbor", note: `${where}: zadanie z działu ${SECTION_NAMES[neighbor]}` } };
    }
  }

  // 3: rozbicie zadania otwartego na dwa mniejsze (np. 4 = 2 + 2 albo 3 + 1)
  if (isOpen(slot.format) && slot.points >= 2) {
    for (const s of [section, ...NEIGHBORS[section]]) {
      const parts = available(pool, picker, (p) => p.meta.section === s && isOpen(p.meta.format) && p.meta.points < slot.points);
      for (const first of parts) {
        const second = parts.find((p) => p !== first && p.meta.family !== first.meta.family && p.meta.points === slot.points - first.meta.points);
        if (!second) continue;
        take(first, picker);
        take(second, picker);
        const from = s === section ? "" : ` z działu ${SECTION_NAMES[s]}`;
        return {
          items: [first, second],
          relaxation: {
            slot: slot.number,
            points: slot.points,
            rule: "split",
            note: `${where}: dwa krótsze zadania${from} (${first.meta.points} + ${second.meta.points} pkt)`,
          },
        };
      }
    }
  }

  // 4: dowolny dział, ten sam rodzaj zadania i punkty
  const [any] = available(pool, picker, (p) => p.meta.points === slot.points && sameKind(p));
  if (any) {
    take(any, picker);
    return { items: [any], relaxation: { slot: slot.number, points: slot.points, rule: "any-section", note: `${where}: zadanie z działu ${SECTION_NAMES[any.meta.section]}` } };
  }

  return { items: [], relaxation: { slot: slot.number, points: slot.points, rule: "missing", note: `${where}: brak zadania – pozycja pominięta` } };
}

/** Arkusz dla danego szablonu i ziarna – zawsze ten sam dla tych samych danych. */
export function generateExam(blueprint: ExamBlueprint, seed: number, pool: PoolTask[] = examPool()): GeneratedExam {
  const picker: Picker = { used: new Set(), families: new Set(), random: seededRandom(`${blueprint.id}/${seed}`) };
  const tasks: PracticeTask[] = [];
  const slotNumbers: string[] = [];
  const relaxations: Relaxation[] = [];
  let expectedPoints = 0;

  for (const slot of blueprint.slots) {
    const { items, relaxation } = fillSlot(slot, pool, picker);
    if (relaxation) relaxations.push(relaxation);
    for (const item of items) {
      tasks.push(item.task);
      slotNumbers.push(slot.number);
      expectedPoints += item.meta.points * item.meta.expectedSuccess;
    }
  }

  const points = tasks.reduce((sum, t) => sum + t.points, 0);
  return {
    blueprint,
    seed,
    code: examCode(blueprint, seed),
    tasks,
    slotNumbers,
    points,
    relaxations,
    expected: points ? expectedPoints / points : 0,
  };
}

// ── Losowanie arkusza dla ucznia ──

/** Arkusze o zbliżonej trudności: odchyłka od typowej trudności układu najwyżej o tyle (w punktach procentowych / 100). */
export const DIFFICULTY_TOLERANCE = 0.04;
const REFERENCE_SAMPLES = 40;
const referenceCache = new Map<string, number>();

/** Typowa szacowana trudność arkusza w danym układzie (średnia z próbki ziaren). */
export function referenceExpected(blueprint: ExamBlueprint): number {
  const cached = referenceCache.get(blueprint.id);
  if (cached !== undefined) return cached;
  let sum = 0;
  for (let s = 0; s < REFERENCE_SAMPLES; s++) sum += generateExam(blueprint, s * 7919).expected;
  const value = sum / REFERENCE_SAMPLES;
  referenceCache.set(blueprint.id, value);
  return value;
}

export interface PickOptions {
  /** Zadania, które uczeń już zna – losowanie woli arkusze z nowymi zadaniami. */
  seen?: ReadonlySet<string>;
  /** Ile ziaren sprawdzić. */
  tries?: number;
  random?: () => number;
}

/**
 * Losuje arkusz dla ucznia: z kilkunastu kandydatów wybiera ten o typowej trudności (bez arkuszy wyraźnie
 * łatwiejszych lub trudniejszych) i z najmniejszą liczbą znanych zadań. Wynik nadal opisuje jeden kod.
 */
export function pickExam(blueprint: ExamBlueprint, { seen, tries = 16, random = Math.random }: PickOptions = {}): GeneratedExam {
  const reference = referenceExpected(blueprint);
  let best: { exam: GeneratedExam; score: number } | null = null;
  for (let i = 0; i < tries; i++) {
    const exam = generateExam(blueprint, Math.floor(random() * SEED_SPACE));
    const off = Math.abs(exam.expected - reference);
    const known = seen ? exam.tasks.filter((t) => seen.has(t.id)).length / exam.tasks.length : 0;
    const missing = exam.relaxations.filter((r) => r.rule === "missing").length;
    const score = known + (off > DIFFICULTY_TOLERANCE ? 1 + off : off) + missing * 10;
    if (!best || score < best.score) best = { exam, score };
  }
  return best!.exam;
}
