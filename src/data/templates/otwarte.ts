// Krótkie odpowiedzi i zadania otwarte pod luki szablonu arkusza (npm run blueprint:coverage).
import { fracAnswer, frac, joinTerms, paren, term, type OpenTemplate } from "@/data/templates/engine";

/** (x − p) z poprawnym znakiem: shifted(3) → "(x - 3)", shifted(-2) → "(x + 2)". */
const shifted = (p: number) => `(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})`;

// ── V – funkcje ──

export const linearZero: OpenTemplate = {
  id: "kr-miejsce-zerowe",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const a = r.pick([-5, -4, -3, -2, 2, 3, 4, 5]);
    const b = r.pick([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    return {
      prompt: `Funkcja liniowa $f$ jest określona wzorem $f(x) = ${joinTerms([term(a, "x"), String(b)])}$. Oblicz miejsce zerowe funkcji $f$.`,
      answers: [fracAnswer(-b, a)],
      answerLabel: "x_0 =",
      hints: ["Miejsce zerowe to argument, dla którego $f(x) = 0$."],
      solution: [{ step: `$${joinTerms([term(a, "x"), String(b)])} = 0$, więc $x_0 = ${frac(-b, a)}$.`, points: 1 }],
    };
  },
};

export const quadraticFromVertex: OpenTemplate = {
  id: "ot-kwadratowa-wzor",
  difficulty: "zaawansowany",
  make: (r) => {
    const a = r.pick([-3, -2, -1, 1, 2, 3]);
    const p = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]);
    const q = r.int(-8, 8);
    if (q === 0) return null;
    const d = r.pick([-3, -2, -1, 1, 2, 3]);
    const [x1, y1] = [p + d, a * d * d + q];
    const [b, c] = [-2 * a * p, a * p * p + q];
    const general = joinTerms([term(a, "x^2"), term(b, "x"), String(c)]);
    const lead = a === 1 ? "" : a === -1 ? "-" : String(a);
    return {
      prompt: `Wierzchołkiem paraboli, która jest wykresem funkcji kwadratowej $f$, jest punkt $W = (${p}, ${q})$. Do wykresu funkcji $f$ należy punkt $A = (${x1}, ${y1})$. Wyznacz wzór funkcji $f$ w postaci ogólnej. W polu odpowiedzi wpisz współczynnik przy $x^2$.`,
      answers: [String(a)],
      answerLabel: "a =",
      hints: ["Zacznij od postaci kanonicznej $f(x) = a(x - p)^2 + q$.", "Podstaw współrzędne punktu $A$, żeby wyznaczyć $a$."],
      solution: [
        { step: `Postać kanoniczna: $f(x) = a${shifted(p)}^2 ${q < 0 ? "-" : "+"} ${Math.abs(q)}$.`, points: 1 },
        { step: `Punkt $A$ należy do wykresu: $${y1} = a${paren(x1 - p)}^2 ${q < 0 ? "-" : "+"} ${Math.abs(q)}$, czyli $${y1} = ${d * d}a ${q < 0 ? "-" : "+"} ${Math.abs(q)}$.`, points: 1 },
        { step: `Stąd $a = ${a}$.`, points: 1 },
        { step: `Postać ogólna: $f(x) = ${lead}${shifted(p)}^2 ${q < 0 ? "-" : "+"} ${Math.abs(q)} = ${general}$.`, points: 1 },
      ],
    };
  },
};

// ── VI – ciągi ──

export const arithmeticTerm: OpenTemplate = {
  id: "kr-wyraz-ciagu",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const a1 = r.int(-10, 10);
    const d = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const n = r.int(8, 25);
    const value = a1 + (n - 1) * d;
    return {
      prompt: `W ciągu arytmetycznym $(a_n)$ pierwszy wyraz $a_1 = ${a1}$, a różnica $r = ${d}$. Oblicz wyraz $a_{${n}}$.`,
      answers: [String(value)],
      answerLabel: `a_{${n}} =`,
      hints: ["$a_n = a_1 + (n - 1)r$"],
      solution: [{ step: `$a_{${n}} = ${a1} + ${n - 1} \\cdot ${paren(d)} = ${value}$.`, points: 1 }],
    };
  },
};

export const arithmeticSum: OpenTemplate = {
  id: "ot-suma-ciagu",
  difficulty: "sredni",
  make: (r) => {
    const a1 = r.int(-10, 12);
    const d = r.pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const k = r.int(2, 4);
    const m = r.int(6, 9);
    const n = r.pick([10, 12, 15, 20]);
    const [ak, am] = [a1 + (k - 1) * d, a1 + (m - 1) * d];
    const sum = (n * (2 * a1 + (n - 1) * d)) / 2;
    return {
      prompt: `W ciągu arytmetycznym $(a_n)$ dane są wyrazy $a_{${k}} = ${ak}$ oraz $a_{${m}} = ${am}$. Oblicz sumę ${n} początkowych wyrazów tego ciągu.`,
      answers: [String(sum)],
      answerLabel: `S_{${n}} =`,
      hints: ["Zapisz oba wyrazy za pomocą $a_1$ i $r$.", "$S_n = \\frac{2a_1 + (n - 1)r}{2} \\cdot n$"],
      solution: [
        { step: `$\\begin{cases} a_1 + ${k - 1}r = ${ak} \\\\ a_1 + ${m - 1}r = ${am} \\end{cases}$`, points: 1 },
        { step: `Odejmujemy równania: $${m - k}r = ${am - ak}$, więc $r = ${d}$ i $a_1 = ${a1}$.`, points: 1 },
        { step: `$S_{${n}} = \\frac{2 \\cdot ${paren(a1)} + ${n - 1} \\cdot ${paren(d)}}{2} \\cdot ${n} = ${sum}$.`, points: 1 },
      ],
    };
  },
};

// ── VIII – planimetria ──

export const inscribedAngle: OpenTemplate = {
  id: "kr-kat-wpisany",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const alpha = r.int(14, 80);
    return {
      prompt: `Punkty $A$, $B$ i $C$ leżą na okręgu o środku $S$. Kąt środkowy $ASB$ ma miarę $${2 * alpha}^\\circ$. Oblicz miarę kąta wpisanego $ACB$ opartego na tym samym łuku $AB$ (punkt $C$ leży na dłuższym łuku $AB$).`,
      answers: [String(alpha)],
      answerLabel: "|\\angle ACB| =",
      hints: ["Kąt wpisany jest dwa razy mniejszy od kąta środkowego opartego na tym samym łuku."],
      solution: [{ step: `$|\\angle ACB| = \\frac{1}{2} \\cdot ${2 * alpha}^\\circ = ${alpha}^\\circ$.`, points: 1 }],
    };
  },
};

// ── X – stereometria ──

const PRISM_DIAGONAL: [number, number, number][] = [
  [2, 1, 3],
  [4, 7, 9],
  [6, 7, 11],
  [12, 1, 17],
  [6, 17, 19],
];

export const prismDiagonal: OpenTemplate = {
  id: "ot-przekatna",
  difficulty: "sredni",
  make: (r) => {
    const [a0, h0, d0] = r.pick(PRISM_DIAGONAL);
    const s = r.int(1, 3);
    const [a, h, d] = [a0 * s, h0 * s, d0 * s];
    return {
      prompt: `Podstawą graniastosłupa prawidłowego czworokątnego jest kwadrat o boku długości $${a}$. Wysokość graniastosłupa jest równa $${h}$. Oblicz długość przekątnej tego graniastosłupa.`,
      answers: [String(d)],
      answerLabel: "d =",
      hints: ["Przekątna podstawy kwadratowej o boku $a$ ma długość $a\\sqrt{2}$.", "Przekątna bryły, przekątna podstawy i wysokość tworzą trójkąt prostokątny."],
      solution: [
        { step: `Przekątna podstawy: $${a}\\sqrt{2}$, jej kwadrat: $${2 * a * a}$.`, points: 1 },
        { step: `Z twierdzenia Pitagorasa: $d = \\sqrt{${2 * a * a} + ${h * h}} = \\sqrt{${d * d}} = ${d}$.`, points: 1 },
      ],
    };
  },
};

const FACE_DIAGONAL: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [9, 12, 15],
  [8, 15, 17],
];

export const prismSurface: OpenTemplate = {
  id: "ot-pole-graniastoslupa",
  difficulty: "sredni",
  make: (r) => {
    const [a, h, d] = r.pick(FACE_DIAGONAL);
    const lateral = 4 * a * h;
    const total = 2 * a * a + lateral;
    return {
      prompt: `W graniastosłupie prawidłowym czworokątnym krawędź podstawy ma długość $${a}$, a przekątna ściany bocznej ma długość $${d}$. Oblicz pole powierzchni całkowitej tego graniastosłupa.`,
      answers: [String(total)],
      answerLabel: "P_c =",
      hints: ["Ściana boczna jest prostokątem – z jej przekątnej wyznacz wysokość graniastosłupa.", "$P_c = 2P_p + P_b$"],
      solution: [
        { step: `Wysokość: $h = \\sqrt{${d}^2 - ${a}^2} = \\sqrt{${d * d - a * a}} = ${h}$.`, points: 1 },
        { step: `Pole powierzchni bocznej: $P_b = 4 \\cdot ${a} \\cdot ${h} = ${lateral}$.`, points: 1 },
        { step: `$P_c = 2 \\cdot ${a}^2 + ${lateral} = ${total}$.`, points: 1 },
      ],
    };
  },
};

// ── XIII – optymalizacja ──

export const fenceOptimization: OpenTemplate = {
  id: "ot-wybieg",
  difficulty: "zaawansowany",
  make: (r) => {
    const k = r.int(5, 30);
    const length = 4 * k;
    const best = length / 4;
    const area = 2 * k * k;
    return {
      prompt: `Z siatki o długości $${length}$ m należy ogrodzić wybieg w kształcie prostokąta, który jednym bokiem przylega do ściany budynku (wzdłuż ściany siatki nie stawiamy). Oblicz największe możliwe pole takiego wybiegu.`,
      answers: [String(area)],
      answerLabel: "P_{\\max} =",
      hints: ["Oznacz przez $x$ długość boków prostopadłych do ściany – bok równoległy ma wtedy $" + length + " - 2x$.", "Pole jest funkcją kwadratową – szukaj wierzchołka paraboli."],
      solution: [
        { step: `Niech $x$ – długość boków prostopadłych do ściany. Bok równoległy: $${length} - 2x$, pole: $P(x) = x(${length} - 2x) = -2x^2 + ${length}x$.`, points: 1 },
        { step: `Dziedzina: $x \\in (0, ${length / 2})$.`, points: 1 },
        { step: `Parabola ma ramiona skierowane w dół, więc największą wartość funkcja przyjmuje w wierzchołku: $x_w = \\frac{-${length}}{2 \\cdot (-2)} = ${best}$ – należy do dziedziny.`, points: 1 },
        { step: `$P_{\\max} = P(${best}) = ${best} \\cdot ${length - 2 * best} = ${area}$ m².`, points: 1 },
      ],
    };
  },
};
