import { createRng, type Rng } from "@/lib/random";
import type { OpenQuestion, OptionKey, Question } from "@/types/quiz";
import type { Difficulty } from "@/types/topic";

// Szablony parametryczne: jedno zadanie „z dziurami” → wiele wariantów z innymi liczbami.
// Klucz i błędne odpowiedzi liczy kod (z typowych pomyłek), więc każdy wariant jest poprawny z konstrukcji,
// a nauczyciel sprawdza jeden szablon zamiast setek zadań. Warianty są stałe (ziarno = id szablonu + numer),
// mają stałe id (`<szablon>-<n>`) i trafiają do puli jak zwykłe zadania – także do kluczy na serwerze.

const KEYS: OptionKey[] = ["A", "B", "C", "D"];
const MAX_ATTEMPTS = 60;

type ClosedBody = Omit<Question, "id" | "options" | "correct" | "family" | "format">;

/** Zadanie ABCD: poprawna odpowiedź i trzy dystraktory (silnik je tasuje). */
export interface AbcdDraft extends ClosedBody {
  correct: string;
  distractors: [string, string, string];
}

/** Zadanie P/F: dwa zdania z oceną prawdziwości. */
export interface TrueFalseDraft extends Omit<ClosedBody, "prompt"> {
  /** Wstęp przed zdaniami (np. dane zadania). */
  intro: string;
  statements: [{ text: string; true: boolean }, { text: string; true: boolean }];
}

export interface ClosedTemplate {
  id: string;
  difficulty: Difficulty;
  make: (r: Rng) => AbcdDraft | TrueFalseDraft | null;
}

export interface OpenTemplate {
  id: string;
  difficulty: Difficulty;
  /** `short` – liczy się sam wynik (krótka odpowiedź CKE). */
  format?: "short" | "extended";
  make: (r: Rng) => Omit<OpenQuestion, "id" | "family" | "format" | "points"> | null;
}

export type ClosedVariant = Question & { difficulty: Difficulty };
export type OpenVariant = OpenQuestion & { difficulty: Difficulty };

const TF_PROMPT = "Oceń prawdziwość podanych zdań. Wybierz P, jeśli zdanie jest prawdziwe, albo F – jeśli jest fałszywe.";
/** Kolejność jak na karcie odpowiedzi: zdanie 1, zdanie 2. */
const TF_OPTIONS: Record<OptionKey, [boolean, boolean]> = { A: [true, true], B: [true, false], C: [false, true], D: [false, false] };
const tf = (value: boolean) => (value ? "P" : "F");

function isTrueFalse(draft: AbcdDraft | TrueFalseDraft): draft is TrueFalseDraft {
  return "statements" in draft;
}

function buildClosed(draft: AbcdDraft | TrueFalseDraft, r: Rng): Omit<Question, "id" | "family"> | null {
  if (isTrueFalse(draft)) {
    const [s1, s2] = draft.statements;
    const correct = KEYS.find((k) => TF_OPTIONS[k][0] === s1.true && TF_OPTIONS[k][1] === s2.true)!;
    const { intro, statements: _statements, ...rest } = draft;
    void _statements;
    return {
      ...rest,
      format: "truefalse",
      prompt: `${intro}\n\n${TF_PROMPT}\n\n1. ${s1.text}\n\n2. ${s2.text}`,
      options: Object.fromEntries(KEYS.map((k) => [k, `1. ${tf(TF_OPTIONS[k][0])} · 2. ${tf(TF_OPTIONS[k][1])}`])) as Record<OptionKey, string>,
      correct,
    };
  }
  const values = [draft.correct, ...draft.distractors];
  if (new Set(values).size !== 4) return null; // dystraktor zbiegł się z odpowiedzią – losujemy jeszcze raz
  const order = r.shuffle(values);
  const { correct: answer, distractors: _distractors, ...rest } = draft;
  void _distractors;
  return {
    ...rest,
    options: Object.fromEntries(KEYS.map((k, i) => [k, order[i]])) as Record<OptionKey, string>,
    correct: KEYS[order.indexOf(answer)],
  };
}

/** `count` różnych wariantów szablonu zadania zamkniętego. */
export function closedVariants(template: ClosedTemplate, count: number): ClosedVariant[] {
  const out: ClosedVariant[] = [];
  const prompts = new Set<string>();
  for (let n = 1, attempt = 0; out.length < count && attempt < count * MAX_ATTEMPTS; attempt++) {
    const r = createRng(`${template.id}#${attempt}`);
    const draft = template.make(r);
    const question = draft && buildClosed(draft, r);
    if (!question || prompts.has(question.prompt)) continue;
    prompts.add(question.prompt);
    out.push({ ...question, id: `${template.id}-${n++}`, family: template.id, difficulty: template.difficulty });
  }
  if (out.length < count) throw new Error(`Szablon ${template.id}: tylko ${out.length} z ${count} różnych wariantów`);
  return out;
}

/** `count` różnych wariantów szablonu zadania otwartego (punkty = suma kroków schematu). */
export function openVariants(template: OpenTemplate, count: number): OpenVariant[] {
  const out: OpenVariant[] = [];
  const prompts = new Set<string>();
  for (let n = 1, attempt = 0; out.length < count && attempt < count * MAX_ATTEMPTS; attempt++) {
    const task = template.make(createRng(`${template.id}#${attempt}`));
    if (!task || prompts.has(task.prompt)) continue;
    prompts.add(task.prompt);
    out.push({
      ...task,
      id: `${template.id}-${n++}`,
      family: template.id,
      format: template.format ?? "extended",
      points: task.solution.reduce((sum, s) => sum + s.points, 0),
      difficulty: template.difficulty,
    });
  }
  if (out.length < count) throw new Error(`Szablon ${template.id}: tylko ${out.length} z ${count} różnych wariantów`);
  return out;
}

// ── Pomocnicze formatowanie liczb w LaTeX ──

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Ułamek skrócony w LaTeX: frac(6, 8) → "\\frac{3}{4}", frac(4, 2) → "2". */
export function frac(num: number, den: number): string {
  const g = gcd(num, den) || 1;
  let [n, d] = [num / g, den / g];
  if (d < 0) [n, d] = [-n, -d];
  if (d === 1) return String(n);
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

/** Ułamek jako odpowiedź do wpisania (bez LaTeX): "3/4". */
export function fracAnswer(num: number, den: number): string {
  const g = gcd(num, den) || 1;
  let [n, d] = [num / g, den / g];
  if (d < 0) [n, d] = [-n, -d];
  return d === 1 ? String(n) : `${n}/${d}`;
}

/** Wyraz z współczynnikiem: term(1, "x") → "x", term(-1, "x") → "-x", term(3, "x") → "3x". */
export function term(coef: number, variable: string): string {
  if (coef === 1) return variable;
  if (coef === -1) return `-${variable}`;
  return `${coef}${variable}`;
}

/** Suma wyrazów z poprawnymi znakami: join(["2x", "-3y"]) → "2x - 3y". */
export function joinTerms(terms: string[]): string {
  return terms
    .filter((t) => t !== "" && t !== "0")
    .map((t, i) => (i === 0 ? t : t.startsWith("-") ? `- ${t.slice(1)}` : `+ ${t}`))
    .join(" ");
}

/** Liczba w nawiasie, gdy ujemna: paren(-3) → "(-3)". */
export function paren(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}
