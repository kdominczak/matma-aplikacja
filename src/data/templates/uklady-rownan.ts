// Dział IV – układy równań (IV.1 rozwiązywanie układów, IV.2 zadania tekstowe).
import { joinTerms, paren, term, type ClosedTemplate, type OpenTemplate } from "@/data/templates/engine";
import type { Rng } from "@/lib/random";

const NONZERO = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
const COEFS = [-4, -3, -2, -1, 1, 2, 3, 4];

const equation = (a: number, b: number, c: number) => `${joinTerms([term(a, "x"), term(b, "y")])} = ${c}`;
const system = (rows: [number, number, number][]) => `\\begin{cases} ${rows.map(([a, b, c]) => equation(a, b, c)).join(" \\\\ ")} \\end{cases}`;
const pair = (x: number, y: number) => `$x = ${x},\\ y = ${y}$`;
const check = (a: number, b: number, x: number, y: number) => `${a} \\cdot ${paren(x)} ${b < 0 ? "-" : "+"} ${Math.abs(b)} \\cdot ${paren(y)}`;

/** Punkt (x, y) o całkowitych, niezerowych współrzędnych, z którego łatwo zrobić trzy różne pomyłki. */
function solutionPoint(r: Rng): [number, number] | null {
  const x = r.pick(NONZERO);
  const y = r.pick(NONZERO);
  return x === y || x === -y ? null : [x, y];
}

export const solveSystem: ClosedTemplate = {
  id: "ur-uklad",
  difficulty: "podstawowy",
  make: (r) => {
    const point = solutionPoint(r);
    if (!point) return null;
    const [x, y] = point;
    const [a1, b1, a2, b2] = [r.pick(COEFS), r.pick(COEFS), r.pick(COEFS), r.pick(COEFS)];
    if (a1 * b2 - a2 * b1 === 0) return null; // układ musi mieć dokładnie jedno rozwiązanie
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    return {
      prompt: `Rozwiązaniem układu równań $${system([
        [a1, b1, c1],
        [a2, b2, c2],
      ])}$ jest para liczb:`,
      correct: pair(x, y),
      distractors: [pair(y, x), pair(x, -y), pair(-x, y)],
      hints: ["Możesz rozwiązać układ albo podstawić każdą parę z odpowiedzi do obu równań.", "Para musi spełniać oba równania jednocześnie."],
      explanation: `Sprawdzamy parę $x = ${x}$, $y = ${y}$: $${check(a1, b1, x, y)} = ${c1}$ oraz $${check(a2, b2, x, y)} = ${c2}$. Oba równania są spełnione.`,
      trap: "Pozostałe pary często spełniają tylko jedno z równań – sprawdzaj zawsze oba.",
    };
  },
};

const line = (m: number, k: number) => `y = ${joinTerms([term(m, "x"), String(k)])}`;
const point = (x: number, y: number) => `$(${x}, ${y})$`;

export const intersectLines: ClosedTemplate = {
  id: "ur-proste",
  difficulty: "sredni",
  make: (r) => {
    const p = solutionPoint(r);
    if (!p) return null;
    const [x, y] = p;
    const m1 = r.pick([-3, -2, -1, 1, 2, 3]);
    const m2 = r.pick([-3, -2, -1, 1, 2, 3]);
    if (m1 === m2) return null;
    const [k1, k2] = [y - m1 * x, y - m2 * x];
    return {
      prompt: `Proste o równaniach $${line(m1, k1)}$ oraz $${line(m2, k2)}$ przecinają się w punkcie:`,
      correct: point(x, y),
      distractors: [point(y, x), point(x, -y), point(-x, y)],
      hints: ["Punkt wspólny spełnia oba równania – przyrównaj prawe strony.", "Z równania $m_1x + k_1 = m_2x + k_2$ wyznacz $x$, a potem $y$."],
      explanation: `$${joinTerms([term(m1, "x"), String(k1)])} = ${joinTerms([term(m2, "x"), String(k2)])}$, więc $x = ${x}$ i $y = ${m1} \\cdot ${paren(x)} ${k1 < 0 ? "-" : "+"} ${Math.abs(k1)} = ${y}$.`,
    };
  },
};

export const ticketsProblem: OpenTemplate = {
  id: "ur-bilety",
  difficulty: "sredni",
  make: (r) => {
    const total = r.int(24, 60);
    const normal = r.pick([16, 18, 20, 24, 25, 30]);
    const reduced = r.pick([8, 10, 12, 14, 15]);
    if (reduced >= normal) return null;
    const x = r.int(6, total - 6);
    const y = total - x;
    const sum = normal * x + reduced * y;
    return {
      prompt: `Do kina sprzedano łącznie ${total} biletów: normalnych po ${normal} zł i ulgowych po ${reduced} zł. Za wszystkie bilety zapłacono ${sum} zł. Oblicz, ile sprzedano biletów ulgowych.`,
      answers: [String(y)],
      answerLabel: "\\text{ulgowych} =",
      hints: ["Oznacz liczbę biletów normalnych i ulgowych dwiema niewiadomymi.", "Jedno równanie opisuje liczbę biletów, drugie – zapłaconą kwotę."],
      solution: [
        {
          step: `Oznaczamy: $x$ – liczba biletów normalnych, $y$ – ulgowych. Zapisujemy układ $\\begin{cases} x + y = ${total} \\\\ ${normal}x + ${reduced}y = ${sum} \\end{cases}$.`,
          points: 1,
        },
        {
          step: `Z pierwszego równania $x = ${total} - y$, więc $${normal}(${total} - y) + ${reduced}y = ${sum}$, skąd $y = ${y}$ (i $x = ${x}$). Sprzedano ${y} biletów ulgowych.`,
          points: 1,
        },
      ],
    };
  },
};

export const agesProblem: OpenTemplate = {
  id: "ur-wiek",
  difficulty: "sredni",
  make: (r) => {
    const son = r.int(4, 16);
    const years = r.int(2, 10);
    const times = r.pick([2, 3]);
    const diff = (times - 1) * (son + years);
    const father = son + diff;
    if (father < 24 || father > 60) return null;
    return {
      prompt: `Ojciec jest o ${diff} lat starszy od syna. Za ${years} lat ojciec będzie ${times === 2 ? "dwa" : "trzy"} razy starszy od syna. Oblicz, ile lat ma teraz syn.`,
      answers: [String(son)],
      answerLabel: "\\text{wiek syna} =",
      hints: ["Oznacz obecny wiek syna i ojca.", `Za ${years} lat obaj będą starsi o tyle samo lat.`],
      solution: [
        { step: `Oznaczamy: $x$ – wiek syna, $y$ – wiek ojca. Zapisujemy układ $\\begin{cases} y = x + ${diff} \\\\ y + ${years} = ${times}(x + ${years}) \\end{cases}$.`, points: 1 },
        { step: `Podstawiamy: $x + ${diff + years} = ${times}x + ${times * years}$, skąd $x = ${son}$. Syn ma teraz ${son} lat (ojciec ${father}).`, points: 1 },
      ],
    };
  },
};
