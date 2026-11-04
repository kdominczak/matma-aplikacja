// Matura rozszerzona: szablony krótkiej odpowiedzi do działów rz-… (tam było po 8–15 zadań na dział).
// Sprawdzenie siłowe – tests/templates-dzialy.test.ts.
import { frac, fracAnswer, joinTerms, paren, term, type OpenTemplate } from "@/data/templates/engine";

const minus = (p: number) => (p === 0 ? "x" : `x ${p < 0 ? "+" : "-"} ${Math.abs(p)}`);
/** Wielomian z listy współczynników od najwyższej potęgi: poly([1, -2, 0, 5]) → "x^3 - 2x^2 + 5". */
function poly(coefs: number[]): string {
  const deg = coefs.length - 1;
  return joinTerms(coefs.map((c, i) => (c === 0 ? "" : deg - i === 0 ? String(c) : term(c, deg - i === 1 ? "x" : `x^${deg - i}`))));
}
const binom = (n: number, k: number) => {
  let out = 1;
  for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i;
  return out;
};

// ── III – wielomiany ──

export const polyRemainder: OpenTemplate = {
  id: "rz-reszta",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const [a, b, c] = [r.int(-6, 6), r.int(-9, 9), r.int(-9, 9)];
    const p = r.pick([-3, -2, -1, 1, 2, 3]);
    const lead = r.pick([1, 2, -1]);
    const value = lead * p ** 3 + a * p * p + b * p + c;
    return {
      prompt: `Oblicz resztę z dzielenia wielomianu $W(x) = ${poly([lead, a, b, c])}$ przez dwumian $${minus(p)}$.`,
      answers: [String(value)],
      answerLabel: "Reszta:",
      hints: ["Twierdzenie o reszcie: reszta z dzielenia $W(x)$ przez $(x - p)$ jest równa $W(p)$."],
      solution: [{ step: `Reszta $= W(${p}) = ${value}$.`, points: 1 }],
    };
  },
};

export const polyRootParameter: OpenTemplate = {
  id: "rz-pierwiastek-parametr",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const m = r.int(-6, 6);
    const p = r.pick([-3, -2, -1, 1, 2, 3]);
    const b = r.int(-9, 9);
    if (m === 0) return null;
    const c = -(p ** 3 + m * p * p + b * p);
    if (Math.abs(c) > 60) return null;
    const rest = joinTerms([term(b, "x"), String(c)]);
    return {
      prompt: `Liczba $${p}$ jest pierwiastkiem wielomianu $W(x) = x^3 + mx^2${rest ? ` ${rest.startsWith("-") ? "- " + rest.slice(1) : "+ " + rest}` : ""}$. Oblicz $m$.`,
      answers: [String(m)],
      answerLabel: "m =",
      hints: [`$W(${p}) = 0$ – podstaw $x = ${p}$ i rozwiąż równanie z niewiadomą $m$.`],
      solution: [
        {
          step: `$W(${p}) = ${paren(p)}^3 + m \\cdot ${paren(p)}^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)} \\cdot ${paren(p)} ${c < 0 ? "-" : "+"} ${Math.abs(c)} = ${joinTerms([term(p * p, "m"), String(p ** 3 + b * p + c)])} = 0$, więc $m = ${m}$.`,
          points: 1,
        },
      ],
    };
  },
};

// ── XIII – pochodna ──

export const derivativeValue: OpenTemplate = {
  id: "rz-pochodna-wartosc",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const [a, b, c] = [r.pick([-2, -1, 1, 2, 3]), r.int(-5, 5), r.int(-9, 9)];
    const x0 = r.int(-3, 3);
    const value = 3 * a * x0 * x0 + 2 * b * x0 + c;
    return {
      prompt: `Funkcja $f$ jest określona wzorem $f(x) = ${poly([a, b, c, r.int(-9, 9)])}$. Oblicz $f'(${x0})$.`,
      answers: [String(value)],
      answerLabel: `f'(${x0}) =`,
      hints: ["$(x^n)' = nx^{n-1}$, pochodna stałej jest równa zero."],
      solution: [{ step: `$f'(x) = ${poly([3 * a, 2 * b, c])}$, więc $f'(${x0}) = ${value}$.`, points: 1 }],
    };
  },
};

export const localMinimum: OpenTemplate = {
  id: "rz-minimum",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const p = r.int(-5, 3);
    const q = p + 2 * r.int(1, 3); // p + q parzyste – całkowite współczynniki
    const d = r.int(-9, 9);
    // f'(x) = 3(x − p)(x − q)
    const f = poly([1, (-3 * (p + q)) / 2, 3 * p * q, d]);
    return {
      prompt: `Funkcja $f$ jest określona wzorem $f(x) = ${f}$. Wyznacz argument, dla którego funkcja $f$ osiąga minimum lokalne.`,
      answers: [String(q)],
      answerLabel: "x =",
      hints: ["Wyznacz pochodną i jej miejsca zerowe.", "Minimum jest tam, gdzie pochodna zmienia znak z ujemnego na dodatni."],
      solution: [{ step: `$f'(x) = ${poly([3, -3 * (p + q), 3 * p * q])} = 3(${minus(p)})(${minus(q)})$. Pochodna zmienia znak z „−” na „+” w $x = ${q}$ – tam jest minimum.`, points: 1 }],
    };
  },
};

// ── VI – granice ──

export const sequenceLimit: OpenTemplate = {
  id: "rz-granica",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const [a, b, c] = [r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), r.int(-9, 9), r.int(-9, 9)];
    const [d, e] = [r.pick([1, 2, 3, 4, 5, 6]), r.int(1, 9)];
    if (a === d) return null;
    return {
      prompt: `Oblicz granicę $\\lim\\limits_{n \\to \\infty} \\frac{${joinTerms([term(a, "n^2"), term(b, "n"), String(c)])}}{${joinTerms([term(d, "n^2"), String(e)])}}$.`,
      answers: [fracAnswer(a, d)],
      answerLabel: "Granica:",
      hints: ["Podziel licznik i mianownik przez najwyższą potęgę $n$ w mianowniku."],
      solution: [{ step: `Po podzieleniu przez $n^2$ wszystkie wyrazy oprócz współczynników przy $n^2$ dążą do zera: granica $= ${frac(a, d)}$.`, points: 1 }],
    };
  },
};

// ── XI – dwumian Newtona ──

export const binomialCoefficient: OpenTemplate = {
  id: "rz-newton",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const n = r.int(4, 7);
    const k = r.int(2, n - 1);
    const a = r.pick([-3, -2, 2, 3]);
    const value = binom(n, k) * a ** (n - k);
    return {
      prompt: `Oblicz współczynnik przy $x^{${k}}$ w rozwinięciu wyrażenia $(${minus(-a)})^{${n}}$.`,
      answers: [String(value)],
      answerLabel: "Współczynnik:",
      hints: ["Wzór dwumianowy: $(x + a)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^k a^{n-k}$.", "Uważaj na znak, gdy $a$ jest ujemne."],
      solution: [{ step: `$\\binom{${n}}{${k}} \\cdot ${paren(a)}^{${n - k}} = ${binom(n, k)} \\cdot ${paren(a ** (n - k))} = ${value}$.`, points: 1 }],
    };
  },
};

// ── XII – prawdopodobieństwo warunkowe ──

export const conditionalDice: OpenTemplate = {
  id: "rz-warunkowe",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const s = r.int(4, 10);
    const k = r.int(1, 6);
    const given = Array.from({ length: 36 }, (_, i) => [Math.floor(i / 6) + 1, (i % 6) + 1]).filter(([x, y]) => x + y === s);
    const both = given.filter(([x]) => x === k).length;
    if (both === 0) return null;
    return {
      prompt: `Rzucamy dwa razy symetryczną sześcienną kostką do gry. Oblicz prawdopodobieństwo, że w pierwszym rzucie wypadło $${k}$ oczek, jeśli wiadomo, że suma oczek w obu rzutach jest równa $${s}$.`,
      answers: [fracAnswer(both, given.length)],
      answerLabel: "P =",
      hints: ["$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$ – albo licz tylko wyniki, w których suma jest równa podanej liczbie."],
      solution: [{ step: `Suma $${s}$: ${given.length} wyników; wśród nich ${both} z $${k}$ w pierwszym rzucie. $P = ${frac(both, given.length)}$.`, points: 1 }],
    };
  },
};

// ── VII – trygonometria ──

export const doubleAngle: OpenTemplate = {
  id: "rz-sin2a",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const [u, v, w] = r.pick([
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [8, 15, 17],
      [15, 8, 17],
    ] as const);
    const cosine = r.int(0, 1) === 1;
    return {
      prompt: `Kąt $\\alpha$ jest ostry i $\\sin\\alpha = ${frac(u, w)}$. Oblicz $${cosine ? "\\cos 2\\alpha" : "\\sin 2\\alpha"}$.`,
      answers: [cosine ? fracAnswer(v * v - u * u, w * w) : fracAnswer(2 * u * v, w * w)],
      answerLabel: cosine ? "cos 2α =" : "sin 2α =",
      hints: ["Z jedynki trygonometrycznej wyznacz $\\cos\\alpha$ (kąt ostry – dodatni).", cosine ? "$\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha$" : "$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha$"],
      solution: [
        {
          step: `$\\cos\\alpha = ${frac(v, w)}$, więc ${cosine ? `$\\cos 2\\alpha = ${frac(v * v, w * w)} - ${frac(u * u, w * w)} = ${frac(v * v - u * u, w * w)}$` : `$\\sin 2\\alpha = 2 \\cdot ${frac(u, w)} \\cdot ${frac(v, w)} = ${frac(2 * u * v, w * w)}$`}.`,
          points: 1,
        },
      ],
    };
  },
};

// ── IX – geometria analityczna ──

export const pointLineDistance: OpenTemplate = {
  id: "rz-odleglosc",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const [A0, B0, w] = r.pick([
      [3, 4, 5],
      [4, 3, 5],
      [5, 12, 13],
      [12, 5, 13],
      [6, 8, 10],
    ] as const);
    const [A, B] = [A0 * r.sign(), B0 * r.sign()];
    const [x0, y0] = [r.int(-6, 6), r.int(-6, 6)];
    const d = r.int(1, 6);
    const C = d * w * r.sign() - A * x0 - B * y0;
    return {
      prompt: `Oblicz odległość punktu $P = (${x0}, ${y0})$ od prostej o równaniu $${joinTerms([term(A, "x"), term(B, "y"), String(C)])} = 0$.`,
      answers: [String(d)],
      answerLabel: "d =",
      hints: ["$d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}$"],
      solution: [{ step: `$d = \\frac{|${A} \\cdot ${paren(x0)} + ${paren(B)} \\cdot ${paren(y0)} + ${paren(C)}|}{\\sqrt{${A * A} + ${B * B}}} = \\frac{${d * w}}{${w}} = ${d}$.`, points: 1 }],
    };
  },
};

// ── III – parametr ──

export const quadraticParameter: OpenTemplate = {
  id: "rz-parametr-delta",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const b = r.int(-9, 9);
    if (b === 0) return null;
    // Δ = b² − 4m > 0 ⇔ m < b²/4
    const answer = Math.ceil((b * b) / 4) - 1;
    return {
      prompt: `Wyznacz największą liczbę całkowitą $m$, dla której równanie $${joinTerms(["x^2", term(b, "x")])} + m = 0$ ma dwa różne rozwiązania rzeczywiste.`,
      answers: [String(answer)],
      answerLabel: "m =",
      hints: ["Dwa różne rozwiązania – wyróżnik dodatni: $\\Delta > 0$.", "Nierówność jest ostra – sam koniec przedziału jej nie spełnia."],
      solution: [{ step: `$\\Delta = ${b * b} - 4m > 0$, czyli $m < ${frac(b * b, 4)}$. Największa liczba całkowita: $${answer}$.`, points: 1 }],
    };
  },
};

// ── VIII – twierdzenie sinusów ──

export const sineLaw: OpenTemplate = {
  id: "rz-sinusow",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const R = r.int(2, 12);
    const angle = r.pick([30, 150, 60, 120]);
    const side = angle === 30 || angle === 150 ? String(R) : `${R}\\sqrt{3}`;
    return {
      prompt: `W trójkącie $ABC$ bok $BC$ ma długość $${side}$, a kąt $BAC$ ma miarę $${angle}^\\circ$. Oblicz promień okręgu opisanego na tym trójkącie.`,
      answers: [String(R)],
      answerLabel: "R =",
      hints: ["Twierdzenie sinusów: $\\frac{a}{\\sin\\alpha} = 2R$, gdzie $a$ to bok naprzeciw kąta $\\alpha$."],
      solution: [{ step: `$2R = \\frac{${side}}{\\sin ${angle}^\\circ}$, więc $R = ${R}$.`, points: 1 }],
    };
  },
};
