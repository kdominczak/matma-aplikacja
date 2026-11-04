// Działy V, VII–IX bez szablonów: przekształcenia wykresów, funkcja wykładnicza, równanie okręgu,
// twierdzenie cosinusów, trójkąty i czworokąty. Sprawdzenie siłowe – tests/templates.test.ts.
import { frac, fracAnswer, paren, type ClosedTemplate, type OpenTemplate } from "@/data/templates/engine";

const n = (value: number) => `$${value}$`;
const deg = (value: number) => `$${value}^\\circ$`;
/** (x − p) z poprawnym znakiem; p = 0 → samo x. */
const minus = (p: number, v = "x") => (p === 0 ? v : `${v} ${p < 0 ? "+" : "-"} ${Math.abs(p)}`);
const plus = (q: number) => (q === 0 ? "" : ` ${q < 0 ? "-" : "+"} ${Math.abs(q)}`);
/** Pierwiastek uproszczony tylko dla kwadratów: root(25) → "5", root(20) → "\\sqrt{20}". */
const root = (value: number) => (Number.isInteger(Math.sqrt(value)) ? String(Math.sqrt(value)) : `\\sqrt{${value}}`);

const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
  [9, 12, 15],
  [20, 21, 29],
];

// ── V – przekształcenia wykresów ──

export const shiftVector: ClosedTemplate = {
  id: "pw-wektor",
  difficulty: "podstawowy",
  make: (r) => {
    const p = r.int(-6, 6);
    const q = r.int(-6, 6);
    if (p === 0 || q === 0) return null;
    const [name, g] = r.pick([
      ["x^2", `(${minus(p)})^2${plus(q)}`],
      ["|x|", `|${minus(p)}|${plus(q)}`],
      ["\\frac{1}{x}", `\\frac{1}{${minus(p)}}${plus(q)}`],
    ] as const);
    const vec = (a: number, b: number) => `$[${a}, ${b}]$`;
    return {
      prompt: `Wykres funkcji $g(x) = ${g}$ otrzymano, przesuwając wykres funkcji $f(x) = ${name}$ o wektor`,
      correct: vec(p, q),
      distractors: [vec(-p, q), vec(p, -q), vec(-p, -q)],
      hints: ["$y = f(x - p) + q$ to wykres $f$ przesunięty o wektor $[p, q]$.", "Zmiana w nawiasie przesuwa wykres w poziomie – w przeciwną stronę, niż podpowiada znak."],
      explanation: `$g(x) = f(${minus(p)})${plus(q)}$, czyli $p = ${p}$ i $q = ${q}$ – przesunięcie o wektor $[${p}, ${q}]$.`,
      trap: "$f(x + 3)$ przesuwa wykres w lewo (o $-3$), a nie w prawo.",
    };
  },
};

export const shiftedValue: OpenTemplate = {
  id: "kr-przesuniecie-wartosc",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const p = r.int(-5, 5);
    const q = r.int(-8, 8);
    const t = r.int(-4, 4);
    if (p === 0 || q === 0) return null;
    const value = (t - p) ** 2 + q;
    return {
      prompt: `Wykres funkcji $f(x) = x^2$ przesunięto o wektor $[${p}, ${q}]$ i otrzymano wykres funkcji $g$. Oblicz $g(${t})$.`,
      answers: [String(value)],
      answerLabel: `g(${t}) =`,
      hints: ["Przesunięcie o wektor $[p, q]$: $g(x) = f(x - p) + q$."],
      solution: [{ step: `$g(x) = (${minus(p)})^2${plus(q)}$, więc $g(${t}) = ${paren(t - p)}^2${plus(q)} = ${value}$.`, points: 1 }],
    };
  },
};

// ── V – funkcja wykładnicza ──

export const exponentialValue: ClosedTemplate = {
  id: "fw-wartosc",
  difficulty: "podstawowy",
  make: (r) => {
    const b = r.pick([2, 3]);
    const p = r.int(-3, 3);
    const q = r.int(-5, 5);
    const e = r.int(-1, 3); // wykładnik po podstawieniu
    const x0 = e + p;
    const value = (exp: number, shift: number) => (exp >= 0 ? n(b ** exp + shift) : `$${frac(1 + shift * b ** -exp, b ** -exp)}$`);
    return {
      prompt: `Funkcja $f$ jest określona wzorem $f(x) = ${b}^{${minus(p)}}${plus(q)}$. Wartość funkcji $f$ dla argumentu $${x0}$ jest równa`,
      correct: value(e, q),
      distractors: [value(x0 + p, q), value(e, -q), value(e + 1, q)],
      hints: [`Podstaw $x = ${x0}$ do wykładnika: $${x0}${plus(-p)}$.`, "$a^{-1} = \\frac{1}{a}$, $a^0 = 1$."],
      explanation: `$f(${x0}) = ${b}^{${x0}${plus(-p)}}${plus(q)} = ${b}^{${e}}${plus(q)} = ${value(e, q).slice(1, -1)}$.`,
    };
  },
};

export const exponentialBase: ClosedTemplate = {
  id: "fw-podstawa",
  difficulty: "sredni",
  make: (r) => {
    // podstawa a = num/den, punkt (k, a^k)
    const [num, den] = r.pick([
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 2],
    ] as const);
    const k = r.pick([-2, -1, 2, 3]);
    const [yn, yd] = k > 0 ? [num ** k, den ** k] : [den ** -k, num ** -k];
    if (yn > 200 || yd > 200) return null;
    const base = `$${frac(num, den)}$`;
    return {
      prompt: `Wykres funkcji wykładniczej $f(x) = a^x$ (gdzie $a > 0$ i $a \\ne 1$) przechodzi przez punkt $P = (${k}, ${frac(yn, yd)})$. Podstawa $a$ jest równa`,
      correct: base,
      distractors: [`$${frac(den, num)}$`, `$${frac(yn, yd)}$`, `$${frac(num * num, den * den)}$`],
      hints: [`Punkt należy do wykresu, więc $a^{${k}} = ${frac(yn, yd)}$.`, k < 0 ? "Ujemny wykładnik: $a^{-k} = \\left(\\frac{1}{a}\\right)^k$." : "Szukasz liczby, której potęga daje drugą współrzędną."],
      explanation: `$a^{${k}} = ${frac(yn, yd)}$ i $\\left(${frac(num, den)}\\right)^{${k}} = ${frac(yn, yd)}$, więc $a = ${frac(num, den)}$.`,
      trap: k < 0 ? "Wykładnik ujemny odwraca ułamek – łatwo podać odwrotność podstawy." : undefined,
    };
  },
};

// ── IX – równanie okręgu ──

export const circleCenter: ClosedTemplate = {
  id: "ok-srodek-promien",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.int(-6, 6);
    const b = r.int(-6, 6);
    const s = r.pick([4, 9, 16, 25, 36, 2, 3, 5, 8, 12, 18, 20]);
    if (a === 0 && b === 0) return null;
    const sq = (c: number, v: string) => (c === 0 ? `${v}^2` : `(${minus(c, v)})^2`);
    const option = (x: number, y: number, radius: string) => `$S = (${x}, ${y}),\\ r = ${radius}$`;
    return {
      prompt: `Okrąg o równaniu $${sq(a, "x")} + ${sq(b, "y")} = ${s}$ ma środek $S$ i promień $r$. Wtedy`,
      correct: option(a, b, root(s)),
      distractors: [option(-a, -b, root(s)), option(a, b, String(s)), option(-a, -b, String(s))],
      hints: ["Równanie okręgu: $(x - a)^2 + (y - b)^2 = r^2$, środek $S = (a, b)$.", "Po prawej stronie jest kwadrat promienia."],
      explanation: `Z postaci $(x - a)^2 + (y - b)^2 = r^2$: $S = (${a}, ${b})$, $r^2 = ${s}$, więc $r = ${root(s)}$.`,
      trap: "Znaki współrzędnych środka są przeciwne do znaków w nawiasach, a po prawej stronie stoi $r^2$, nie $r$.",
    };
  },
};

export const circleRadius: OpenTemplate = {
  id: "kr-promien-okregu",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const [u, v, w] = r.pick(TRIPLES.filter(([, , c]) => c <= 17));
    const [dx, dy] = r.int(0, 1) ? [u, v] : [v, u];
    const a = r.int(-5, 5);
    const b = r.int(-5, 5);
    const P = [a + r.sign() * dx, b + r.sign() * dy];
    return {
      prompt: `Okrąg o środku $S = (${a}, ${b})$ przechodzi przez punkt $P = (${P[0]}, ${P[1]})$. Oblicz promień tego okręgu.`,
      answers: [String(w)],
      answerLabel: "r =",
      hints: ["Promień to długość odcinka $SP$.", "$|SP| = \\sqrt{(x_P - x_S)^2 + (y_P - y_S)^2}$"],
      solution: [{ step: `$r = |SP| = \\sqrt{${paren(P[0] - a)}^2 + ${paren(P[1] - b)}^2} = \\sqrt{${w * w}} = ${w}$.`, points: 1 }],
    };
  },
};

// ── VII – twierdzenie cosinusów i pole trójkąta ──

export const triangleAreaSine: OpenTemplate = {
  id: "kr-pole-sinus",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const a = r.int(3, 14);
    const b = r.int(3, 14);
    const angle = r.pick([30, 150]);
    return {
      prompt: `Dwa boki trójkąta mają długości $${a}$ i $${b}$, a kąt między nimi ma miarę $${angle}^\\circ$. Oblicz pole tego trójkąta.`,
      answers: [fracAnswer(a * b, 4)],
      answerLabel: "P =",
      hints: ["$P = \\frac{1}{2}ab\\sin\\gamma$", angle === 150 ? "$\\sin 150^\\circ = \\sin 30^\\circ$" : "$\\sin 30^\\circ = \\frac{1}{2}$"],
      solution: [{ step: `$P = \\frac{1}{2} \\cdot ${a} \\cdot ${b} \\cdot \\sin ${angle}^\\circ = \\frac{1}{2} \\cdot ${a * b} \\cdot \\frac{1}{2} = ${frac(a * b, 4)}$.`, points: 1 }],
    };
  },
};

/** Trójkąty o bokach całkowitych z kątem 60° albo 120° między bokami a, b (c² = a² + b² ∓ ab). */
const COSINE_TRIPLES: { a: number; b: number; c: number; angle: 60 | 120 }[] = [];
for (let a = 2; a <= 16; a++) {
  for (let b = a + 1; b <= 16; b++) {
    for (const angle of [60, 120] as const) {
      const c2 = a * a + b * b + (angle === 60 ? -a * b : a * b);
      const c = Math.round(Math.sqrt(c2));
      if (c * c === c2) COSINE_TRIPLES.push({ a, b, c, angle });
    }
  }
}

export const lawOfCosines: OpenTemplate = {
  id: "kr-cosinusow",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const { a, b, c, angle } = r.pick(COSINE_TRIPLES);
    const [first, second] = r.int(0, 1) ? [a, b] : [b, a];
    return {
      prompt: `W trójkącie $ABC$ boki $AC$ i $BC$ mają długości $|AC| = ${first}$ i $|BC| = ${second}$, a kąt $ACB$ ma miarę $${angle}^\\circ$. Oblicz długość boku $AB$.`,
      answers: [String(c)],
      answerLabel: "|AB| =",
      hints: ["Twierdzenie cosinusów: $c^2 = a^2 + b^2 - 2ab\\cos\\gamma$.", angle === 60 ? "$\\cos 60^\\circ = \\frac{1}{2}$" : "$\\cos 120^\\circ = -\\frac{1}{2}$"],
      solution: [
        {
          step: `$|AB|^2 = ${first}^2 + ${second}^2 - 2 \\cdot ${first} \\cdot ${second} \\cdot ${angle === 60 ? "\\frac{1}{2}" : "\\left(-\\frac{1}{2}\\right)"} = ${c * c}$, więc $|AB| = ${c}$.`,
          points: 1,
        },
      ],
    };
  },
};

// ── VIII – trójkąty i czworokąty ──

export const pythagoras: ClosedTemplate = {
  id: "tc-pitagoras",
  difficulty: "podstawowy",
  make: (r) => {
    const [u, v, w] = r.pick(TRIPLES);
    const m = r.pick([1, 1, 2, 3]);
    const [a, b, c] = [u * m, v * m, w * m];
    if (c > 60) return null;
    const askLeg = r.int(0, 1) === 1;
    if (askLeg) {
      return {
        prompt: `Przeciwprostokątna trójkąta prostokątnego ma długość $${c}$, a jedna z przyprostokątnych – długość $${a}$. Druga przyprostokątna ma długość`,
        correct: n(b),
        distractors: [`$${root(c * c + a * a)}$`, n(c - a), `$${root(c + a)}$`],
        hints: ["Twierdzenie Pitagorasa: $a^2 + b^2 = c^2$, gdzie $c$ to przeciwprostokątna.", "Szukasz przyprostokątnej – odejmij kwadraty."],
        explanation: `$b^2 = ${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b * b}$, więc $b = ${b}$.`,
        trap: "Przyprostokątna: kwadraty się odejmuje, a nie dodaje.",
      };
    }
    return {
      prompt: `Przyprostokątne trójkąta prostokątnego mają długości $${a}$ i $${b}$. Przeciwprostokątna tego trójkąta ma długość`,
      correct: n(c),
      distractors: [n(a + b), `$${root(Math.abs(b * b - a * a))}$`, `$${root(a + b)}$`],
      hints: ["Twierdzenie Pitagorasa: $a^2 + b^2 = c^2$."],
      explanation: `$c^2 = ${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$, więc $c = ${c}$.`,
      trap: "Długość przeciwprostokątnej to nie suma przyprostokątnych.",
    };
  },
};

export const isoscelesAngles: ClosedTemplate = {
  id: "tc-katy-rownoramienny",
  difficulty: "podstawowy",
  make: (r) => {
    const gamma = 2 * r.int(10, 80);
    if (gamma === 60) return null; // trójkąt równoboczny – wszystkie kąty równe
    const base = (180 - gamma) / 2;
    const askBase = r.int(0, 1) === 1;
    if (askBase) {
      return {
        prompt: `W trójkącie równoramiennym $ABC$, w którym $|AC| = |BC|$, kąt $ACB$ ma miarę $${gamma}^\\circ$. Kąt $BAC$ ma miarę`,
        correct: deg(base),
        distractors: [deg(180 - gamma), deg(gamma / 2), deg(90 + gamma / 2)],
        hints: ["Kąty przy podstawie trójkąta równoramiennego są równe.", "Suma kątów w trójkącie to $180^\\circ$."],
        explanation: `$|\\angle BAC| = |\\angle ABC| = \\frac{180^\\circ - ${gamma}^\\circ}{2} = ${base}^\\circ$.`,
      };
    }
    return {
      prompt: `W trójkącie równoramiennym $ABC$, w którym $|AC| = |BC|$, kąt $BAC$ ma miarę $${base}^\\circ$. Kąt $ACB$ ma miarę`,
      correct: deg(gamma),
      distractors: [deg(180 - base), deg(base), deg(90 - base / 2)],
      hints: ["Kąty przy podstawie $AB$ są równe.", "Suma kątów w trójkącie to $180^\\circ$."],
      explanation: `$|\\angle ACB| = 180^\\circ - 2 \\cdot ${base}^\\circ = ${gamma}^\\circ$.`,
      trap: "Przy podstawie są dwa równe kąty – od $180^\\circ$ odejmij oba.",
    };
  },
};

export const similarArea: OpenTemplate = {
  id: "kr-podobienstwo-pole",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const x = r.int(2, 8);
    const k = r.pick([2, 3, 4, 1.5, 2.5]);
    const y = x * k;
    if (!Number.isInteger(y)) return null;
    const P = r.int(3, 30);
    const area = P * k * k;
    if (!Number.isInteger(area)) return null;
    return {
      prompt: `Trójkąty $ABC$ i $DEF$ są podobne, przy czym $|AB| = ${x}$ i $|DE| = ${y}$ to odpowiadające sobie boki. Pole trójkąta $ABC$ jest równe $${P}$. Oblicz pole trójkąta $DEF$.`,
      answers: [String(area)],
      answerLabel: "P =",
      hints: ["Skala podobieństwa to stosunek odpowiadających sobie boków.", "Pola figur podobnych są w stosunku równym kwadratowi skali."],
      solution: [{ step: `Skala $k = \\frac{${y}}{${x}} = ${frac(y, x)}$, więc $P_{DEF} = k^2 \\cdot ${P} = ${frac(y * y, x * x)} \\cdot ${P} = ${area}$.`, points: 1 }],
    };
  },
};

export const rhombusSide: OpenTemplate = {
  id: "kr-romb-bok",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const [u, v, w] = r.pick(TRIPLES.filter(([, , c]) => c <= 25));
    const [d1, d2] = r.int(0, 1) ? [2 * u, 2 * v] : [2 * v, 2 * u];
    return {
      prompt: `Przekątne rombu mają długości $${d1}$ i $${d2}$. Oblicz długość boku tego rombu.`,
      answers: [String(w)],
      answerLabel: "a =",
      hints: ["Przekątne rombu przecinają się pod kątem prostym i dzielą się na połowy.", "Bok rombu jest przeciwprostokątną trójkąta o przyprostokątnych równych połowom przekątnych."],
      solution: [{ step: `$a^2 = ${d1 / 2}^2 + ${d2 / 2}^2 = ${w * w}$, więc $a = ${w}$.`, points: 1 }],
    };
  },
};
