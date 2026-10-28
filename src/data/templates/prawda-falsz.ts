// Zadania prawda/fałsz (P/F) – w arkuszach od 2025 r. 2–4 takie pozycje. 1 pkt tylko za obie poprawne oceny.
import { frac, joinTerms, paren, term, type ClosedTemplate } from "@/data/templates/engine";

const coin = (r: { int: (a: number, b: number) => number }) => r.int(0, 1) === 1;

/** I – potęgi (I.4: prawa działań na potęgach). */
export const powersTrueFalse: ClosedTemplate = {
  id: "pf-potegi",
  difficulty: "podstawowy",
  make: (r) => {
    const base = r.pick([2, 3, 5]);
    const m = r.int(2, 9);
    const k = r.int(2, 9);
    if (m * k === m + k || m === 2) return null; // błędne wersje muszą się różnić od poprawnych
    const [productTrue, powerTrue] = [coin(r), coin(r)];
    return {
      intro: `Dane są liczby $x = ${base}^{${m}}$ oraz $y = ${base}^{${k}}$.`,
      statements: [
        { text: `Iloczyn $x \\cdot y$ jest równy $${base}^{${productTrue ? m + k : m * k}}$.`, true: productTrue },
        { text: `Liczba $x^2$ jest równa $${base}^{${powerTrue ? 2 * m : m + 2}}$.`, true: powerTrue },
      ],
      hints: ["Przy mnożeniu potęg o tej samej podstawie wykładniki dodajemy.", "Przy potęgowaniu potęgi wykładniki mnożymy."],
      explanation: `$x \\cdot y = ${base}^{${m}} \\cdot ${base}^{${k}} = ${base}^{${m + k}}$ oraz $x^2 = (${base}^{${m}})^2 = ${base}^{${2 * m}}$.`,
      trap: "Wykładniki dodajemy przy mnożeniu potęg, a mnożymy przy potęgowaniu potęgi – nie odwrotnie.",
    };
  },
};

/** V – funkcja liniowa (V.5: interpretacja współczynników). */
export const linearTrueFalse: ClosedTemplate = {
  id: "pf-liniowa",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const b = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    const askIncreasing = coin(r);
    const monotoneTrue = askIncreasing ? a > 0 : a < 0;
    const interceptTrue = coin(r);
    return {
      intro: `Funkcja liniowa $f$ jest określona wzorem $f(x) = ${joinTerms([term(a, "x"), String(b)])}$.`,
      statements: [
        { text: `Funkcja $f$ jest ${askIncreasing ? "rosnąca" : "malejąca"}.`, true: monotoneTrue },
        { text: `Wykres funkcji $f$ przecina oś $Oy$ w punkcie $(0, ${interceptTrue ? b : -b})$.`, true: interceptTrue },
      ],
      hints: ["O monotoniczności funkcji $f(x) = ax + b$ decyduje znak współczynnika $a$.", "Punkt przecięcia z osią $Oy$ to $(0, f(0))$."],
      explanation: `Współczynnik $a = ${a}$ jest ${a > 0 ? "dodatni – funkcja jest rosnąca" : "ujemny – funkcja jest malejąca"}. $f(0) = ${b}$, więc wykres przecina oś $Oy$ w punkcie $(0, ${b})$.`,
    };
  },
};

/** VI – ciągi (VI.4: czy ciąg jest arytmetyczny, wyrazy ciągu). */
export const sequenceTrueFalse: ClosedTemplate = {
  id: "pf-ciagi",
  difficulty: "sredni",
  make: (r) => {
    const p = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const q = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    if (q === p) return null;
    const k = r.int(3, 10);
    const [diffTrue, termTrue] = [coin(r), coin(r)];
    const value = p * k + q;
    return {
      intro: `Ciąg $(a_n)$ jest określony wzorem $a_n = ${joinTerms([term(p, "n"), String(q)])}$ dla każdej liczby naturalnej $n \\ge 1$.`,
      statements: [
        { text: `Ciąg $(a_n)$ jest arytmetyczny o różnicy $${diffTrue ? p : q}$.`, true: diffTrue },
        { text: `Wyraz $a_{${k}}$ jest równy $${termTrue ? value : value + p}$.`, true: termTrue },
      ],
      hints: ["Policz $a_{n+1} - a_n$ – jeśli wynik nie zależy od $n$, ciąg jest arytmetyczny.", `Podstaw $n = ${k}$ do wzoru.`],
      explanation: `$a_{n+1} - a_n = ${p}$ – ciąg jest arytmetyczny o różnicy $${p}$. $a_{${k}} = ${p} \\cdot ${k} ${q < 0 ? "-" : "+"} ${Math.abs(q)} = ${value}$.`,
    };
  },
};

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
];

/** VII – trygonometria (VII.2: sin²α + cos²α = 1, tg α = sin α / cos α). */
export const trigTrueFalse: ClosedTemplate = {
  id: "pf-trygonometria",
  difficulty: "sredni",
  make: (r) => {
    const [x, y, c] = r.pick(TRIPLES);
    const [a, b] = coin(r) ? [x, y] : [y, x]; // sin α = a/c, cos α = b/c
    const [cosTrue, tgTrue] = [coin(r), coin(r)];
    return {
      intro: `Kąt $\\alpha$ jest ostry i $\\sin\\alpha = ${frac(a, c)}$.`,
      statements: [
        { text: `$\\cos\\alpha = ${cosTrue ? frac(b, c) : frac(a, b)}$`, true: cosTrue },
        { text: `$\\operatorname{tg}\\alpha = ${tgTrue ? frac(a, b) : frac(b, a)}$`, true: tgTrue },
      ],
      hints: ["Skorzystaj z jedynki trygonometrycznej: $\\sin^2\\alpha + \\cos^2\\alpha = 1$.", "$\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}$; dla kąta ostrego cosinus jest dodatni."],
      explanation: `$\\cos^2\\alpha = 1 - ${frac(a * a, c * c)} = ${frac(b * b, c * c)}$, a kąt jest ostry, więc $\\cos\\alpha = ${frac(b, c)}$. $\\operatorname{tg}\\alpha = ${frac(a, c)} : ${frac(b, c)} = ${frac(a, b)}$.`,
    };
  },
};

const LEGS: [number, number, number][] = [
  [6, 8, 10],
  [8, 6, 10],
  [12, 16, 20],
  [16, 12, 20],
  [10, 24, 26],
  [24, 10, 26],
];

/** IX – geometria analityczna (IX.3: odległość punktów, środek odcinka). */
export const segmentTrueFalse: ClosedTemplate = {
  id: "pf-odcinek",
  difficulty: "sredni",
  make: (r) => {
    const [dx, dy, d] = r.pick(LEGS);
    const x1 = r.int(-6, 6);
    const y1 = r.int(-6, 6);
    const [x2, y2] = [x1 + r.sign() * dx, y1 + r.sign() * dy];
    const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2];
    const [lengthTrue, middleTrue] = [coin(r), coin(r)];
    // typowe pomyłki: suma różnic zamiast pierwiastka, połowa różnicy zamiast średniej współrzędnych
    const [wx, wy] = [(x2 - x1) / 2, (y2 - y1) / 2];
    if (wx === mx && wy === my) return null;
    return {
      intro: `Dane są punkty $A = (${x1}, ${y1})$ oraz $B = (${x2}, ${y2})$.`,
      statements: [
        { text: `Długość odcinka $AB$ jest równa $${lengthTrue ? d : dx + dy}$.`, true: lengthTrue },
        { text: `Środkiem odcinka $AB$ jest punkt $(${middleTrue ? mx : wx}, ${middleTrue ? my : wy})$.`, true: middleTrue },
      ],
      hints: ["$|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$", "Środek odcinka: $\\left(\\frac{x_A + x_B}{2}, \\frac{y_A + y_B}{2}\\right)$."],
      explanation: `$|AB| = \\sqrt{${paren(x2 - x1)}^2 + ${paren(y2 - y1)}^2} = \\sqrt{${d * d}} = ${d}$. Środek: $\\left(\\frac{${x1} + ${paren(x2)}}{2}, \\frac{${y1} + ${paren(y2)}}{2}\\right) = (${mx}, ${my})$.`,
    };
  },
};
