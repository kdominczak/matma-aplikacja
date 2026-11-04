// Działy I–III bez szablonów: logarytmy, wartość bezwzględna, wzory skróconego mnożenia, nierówności, równania wymierne.
// Każdy szablon ma siłowe sprawdzenie w tests/templates.test.ts (liczby odczytane z treści, wynik policzony niezależnie).
import { frac, joinTerms, paren, term, type ClosedTemplate, type OpenTemplate } from "@/data/templates/engine";

const n = (value: number) => `$${value}$`;
/** (x − p) z poprawnym znakiem: minus(3) → "x - 3", minus(-2) → "x + 2", minus(0) → "x". */
const minus = (p: number) => (p === 0 ? "x" : `x ${p < 0 ? "+" : "-"} ${Math.abs(p)}`);

// ── Przedziały w zapisie szkolnym: ⟨a, b⟩, (−∞, a), … ──
const lo = (closed: boolean) => (closed ? "\\langle " : "(");
const hi = (closed: boolean) => (closed ? " \\rangle" : ")");
const between = (a: number, b: number, closed: boolean) => `${lo(closed)}${a}, ${b}${hi(closed)}`;
const below = (a: number, closed: boolean) => `(-\\infty, ${a}${hi(closed)}`;
const above = (a: number, closed: boolean) => `${lo(closed)}${a}, +\\infty)`;
const outside = (a: number, b: number, closed: boolean) => `${below(a, closed)} \\cup ${above(b, closed)}`;
const set = (tex: string) => `$${tex}$`;

// ── I – logarytmy ──

export const logDifference: ClosedTemplate = {
  id: "lg-roznica",
  difficulty: "podstawowy",
  make: (r) => {
    const b = r.pick([2, 3, 5]);
    const k = r.int(1, 3);
    const y = r.int(2, 12);
    // y nie może być potęgą podstawy – wtedy da się policzyć każdy logarytm osobno i reguła nie jest potrzebna
    if ([b, b ** 2, b ** 3].includes(y)) return null;
    const x = y * b ** k;
    if (x > 400) return null;
    return {
      prompt: `Liczba $\\log_{${b}} ${x} - \\log_{${b}} ${y}$ jest równa`,
      correct: n(k),
      distractors: [n(k + 1), n(b ** k), `$\\log_{${b}} ${x - y}$`],
      hints: ["Różnica logarytmów o tej samej podstawie to logarytm ilorazu.", `Oblicz $\\frac{${x}}{${y}}$ i zapisz wynik jako potęgę liczby $${b}$.`],
      explanation: `$\\log_{${b}} ${x} - \\log_{${b}} ${y} = \\log_{${b}} \\frac{${x}}{${y}} = \\log_{${b}} ${b ** k} = ${k}$, bo $${b}^{${k}} = ${b ** k}$.`,
      trap: "Różnica logarytmów to logarytm ilorazu, a nie różnicy liczb logarytmowanych.",
    };
  },
};

export const logSum: OpenTemplate = {
  id: "kr-log-suma",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const [p, q] = r.pick([
      [2, 3],
      [2, 5],
      [3, 4],
      [3, 5],
      [2, 7],
    ] as const);
    const b = p * q;
    const k = r.int(2, 3);
    const j = r.int(0, k - 1);
    // b^k = p^k · q^k – część q przenosimy do pierwszej liczby, żeby żadna nie była potęgą podstawy
    const x = p ** k * q ** j;
    const y = q ** (k - j);
    if (x > 5000) return null;
    return {
      prompt: `Oblicz wartość wyrażenia $\\log_{${b}} ${x} + \\log_{${b}} ${y}$.`,
      answers: [String(k)],
      answerLabel: "Wartość:",
      hints: ["Suma logarytmów o tej samej podstawie to logarytm iloczynu.", `Iloczyn $${x} \\cdot ${y}$ jest potęgą liczby $${b}$.`],
      solution: [{ step: `$\\log_{${b}} ${x} + \\log_{${b}} ${y} = \\log_{${b}} (${x} \\cdot ${y}) = \\log_{${b}} ${x * y} = ${k}$, bo $${b}^{${k}} = ${x * y}$.`, points: 1 }],
    };
  },
};

// ── I – wartość bezwzględna ──

export const absEquation: ClosedTemplate = {
  id: "wb-rownanie",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.int(-9, 9);
    const c = r.int(1, 9);
    if (a === 0) return null;
    return {
      prompt: `Suma wszystkich rozwiązań równania $|${minus(a)}| = ${c}$ jest równa`,
      correct: n(2 * a),
      distractors: [n(-2 * a), n(2 * c), n(0)],
      hints: [`Liczby, których odległość od $${a}$ na osi liczbowej jest równa $${c}$.`, `$${minus(a)} = ${c}$ albo $${minus(a)} = -${c}$.`],
      explanation: `$|${minus(a)}| = ${c}$, więc $x = ${a} + ${c} = ${a + c}$ albo $x = ${a} - ${c} = ${a - c}$. Suma: $${a + c} + ${paren(a - c)} = ${2 * a}$.`,
      trap: `$|x - a|$ to odległość od liczby $a$ – przy zapisie $|${minus(a)}|$ tą liczbą jest $${a}$, nie $${-a}$.`,
    };
  },
};

export const absInequality: ClosedTemplate = {
  id: "wb-nierownosc",
  difficulty: "sredni",
  make: (r) => {
    const a = r.int(-8, 8);
    const c = r.int(1, 7);
    if (a === 0) return null;
    const rel = r.pick(["\\le", "<", "\\ge", ">"] as const);
    const inside = rel === "\\le" || rel === "<";
    const closed = rel === "\\le" || rel === "\\ge";
    const shape = (center: number, isInside: boolean, isClosed: boolean) => set(isInside ? between(center - c, center + c, isClosed) : outside(center - c, center + c, isClosed));
    return {
      prompt: `Zbiorem wszystkich rozwiązań nierówności $|${minus(a)}| ${rel} ${c}$ jest`,
      correct: shape(a, inside, closed),
      distractors: [shape(a, !inside, closed), shape(-a, inside, closed), shape(a, inside, !closed)],
      hints: [`$|${minus(a)}|$ to odległość liczby $x$ od $${a}$.`, `Zaznacz na osi liczby odległe od $${a}$ o ${inside ? "co najwyżej" : "co najmniej"} $${c}$.`],
      explanation: `Odległość $x$ od $${a}$ ma być ${rel === "<" ? "mniejsza niż" : rel === "\\le" ? "nie większa niż" : rel === ">" ? "większa niż" : "nie mniejsza niż"} $${c}$. Końce przedziału: $${a} - ${c} = ${a - c}$ i $${a} + ${c} = ${a + c}$, więc $x \\in ${inside ? between(a - c, a + c, closed) : outside(a - c, a + c, closed)}$.`,
      trap: closed ? "Nierówność nieostra – końce przedziału należą do zbioru rozwiązań." : "Nierówność ostra – końce przedziału nie należą do zbioru rozwiązań.",
    };
  },
};

// ── II – wzory skróconego mnożenia ──

export const squareOfSum: ClosedTemplate = {
  id: "ws-kwadrat",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.int(2, 5);
    const b = r.int(1, 7);
    const s = r.sign();
    const poly = (x2: number, x1: number, x0: number) => `$${joinTerms([term(x2, "x^2"), term(x1, "x"), String(x0)])}$`;
    return {
      prompt: `Dla każdej liczby rzeczywistej $x$ wyrażenie $(${a}x ${s < 0 ? "-" : "+"} ${b})^2$ jest równe`,
      correct: poly(a * a, 2 * s * a * b, b * b),
      distractors: [`$${joinTerms([term(a * a, "x^2"), String(b * b)])}$`, poly(a, 2 * s * a * b, b * b), poly(a * a, s * a * b, b * b)],
      hints: ["$(u + v)^2 = u^2 + 2uv + v^2$, $(u - v)^2 = u^2 - 2uv + v^2$.", `Do kwadratu podnosisz cały wyraz $${a}x$, a nie tylko $x$.`],
      explanation: `$(${a}x ${s < 0 ? "-" : "+"} ${b})^2 = (${a}x)^2 ${s < 0 ? "-" : "+"} 2 \\cdot ${a}x \\cdot ${b} + ${b}^2 = ${joinTerms([term(a * a, "x^2"), term(2 * s * a * b, "x"), String(b * b)])}$.`,
      trap: "Kwadrat sumy to nie suma kwadratów – brakuje podwojonego iloczynu.",
    };
  },
};

export const rootIdentity: OpenTemplate = {
  id: "kr-wzory-pierwiastek",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const a = r.pick([2, 3, 5, 6, 7, 10, 11]);
    const b = r.int(2, 6);
    const difference = r.int(0, 1) === 1;
    const value = difference ? a - b * b : a + b * b;
    return {
      prompt: difference
        ? `Oblicz wartość wyrażenia $(\\sqrt{${a}} - ${b})(\\sqrt{${a}} + ${b})$.`
        : `Oblicz wartość wyrażenia $(\\sqrt{${a}} + ${b})^2 - ${2 * b}\\sqrt{${a}}$.`,
      answers: [String(value)],
      answerLabel: "Wartość:",
      hints: [difference ? "Skorzystaj ze wzoru $(u - v)(u + v) = u^2 - v^2$." : "Rozwiń kwadrat sumy: $(u + v)^2 = u^2 + 2uv + v^2$."],
      solution: [
        {
          step: difference
            ? `$(\\sqrt{${a}})^2 - ${b}^2 = ${a} - ${b * b} = ${value}$.`
            : `$${a} + ${2 * b}\\sqrt{${a}} + ${b * b} - ${2 * b}\\sqrt{${a}} = ${value}$.`,
          points: 1,
        },
      ],
    };
  },
};

// ── III – nierówności liniowe ──

export const linearInequality: ClosedTemplate = {
  id: "nl-zbior",
  difficulty: "podstawowy",
  make: (r) => {
    const k = r.int(-6, 6);
    const a = r.int(-5, 5);
    const c = r.int(-5, 5);
    const b = r.int(-9, 9);
    if (k === 0 || a === c || a === 0) return null;
    const d = b + (a - c) * k;
    const rel = r.pick(["\\le", "<", "\\ge", ">"] as const);
    const closed = rel === "\\le" || rel === "\\ge";
    // (a − c)x rel (d − b): dzielenie przez liczbę ujemną odwraca znak
    const lessThan = (rel === "\\le" || rel === "<") === a - c > 0;
    const ray = (at: number, less: boolean, isClosed: boolean) => set(less ? below(at, isClosed) : above(at, isClosed));
    const left = joinTerms([term(a, "x"), String(b)]);
    const right = c === 0 ? String(d) : joinTerms([term(c, "x"), String(d)]);
    return {
      prompt: `Zbiorem wszystkich rozwiązań nierówności $${left} ${rel} ${right}$ jest przedział`,
      correct: ray(k, lessThan, closed),
      distractors: [ray(k, !lessThan, closed), ray(-k, lessThan, closed), ray(k, lessThan, !closed)],
      hints: ["Przenieś wyrazy z $x$ na jedną stronę, a liczby na drugą.", "Dzieląc obie strony przez liczbę ujemną, zmień zwrot nierówności."],
      explanation: `$${term(a - c, "x")} ${rel} ${d - b}$, więc $x ${lessThan ? (closed ? "\\le" : "<") : closed ? "\\ge" : ">"} ${k}$${a - c < 0 ? " (dzielenie przez liczbę ujemną odwraca znak)" : ""}.`,
      trap: "Przy dzieleniu przez liczbę ujemną zmienia się zwrot nierówności.",
    };
  },
};

export const smallestInteger: OpenTemplate = {
  id: "kr-najmniejsza-calkowita",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const k = r.int(2, 6);
    const a = r.int(-9, 9);
    const b = r.int(-6, 6);
    if (a === 0) return null;
    const strict = r.int(0, 1) === 1;
    const bound = k * b - a;
    const answer = strict ? bound + 1 : bound;
    return {
      prompt: `Wyznacz najmniejszą liczbę całkowitą $x$ spełniającą nierówność $\\frac{${minus(-a)}}{${k}} ${strict ? ">" : "\\ge"} ${b}$.`,
      answers: [String(answer)],
      answerLabel: "x =",
      hints: [`Pomnóż obie strony przez $${k}$.`, strict ? "Nierówność jest ostra – sam koniec przedziału jej nie spełnia." : "Nierówność jest nieostra – koniec przedziału ją spełnia."],
      solution: [{ step: `$${minus(-a)} ${strict ? ">" : "\\ge"} ${k * b}$, czyli $x ${strict ? ">" : "\\ge"} ${bound}$. Najmniejsza liczba całkowita: $${answer}$.`, points: 1 }],
    };
  },
};

// ── III – nierówności kwadratowe ──

export const quadraticInequality: ClosedTemplate = {
  id: "nk-zbior",
  difficulty: "sredni",
  make: (r) => {
    const p = r.int(-7, 6);
    const q = p + r.int(1, 8);
    if (p === -q) return null; // przedział symetryczny – błąd znaku dałby ten sam zbiór
    const rel = r.pick(["\\le", "<", "\\ge", ">"] as const);
    const flip = r.int(0, 2) === 0; // minus przed nawiasem odwraca znak iloczynu
    const negative = (rel === "\\le" || rel === "<") !== flip;
    const closed = rel === "\\le" || rel === "\\ge";
    const shape = (a: number, b: number, isInside: boolean, isClosed: boolean) => set(isInside ? between(a, b, isClosed) : outside(a, b, isClosed));
    const factor = (t: number) => (t === 0 ? "x" : `(${minus(t)})`);
    return {
      prompt: `Zbiorem wszystkich rozwiązań nierówności $${flip ? "-" : ""}${factor(p)}${factor(q)} ${rel} 0$ jest`,
      correct: shape(p, q, negative, closed),
      distractors: [shape(p, q, !negative, closed), shape(-q, -p, negative, closed), shape(p, q, negative, !closed)],
      hints: [`Miejsca zerowe lewej strony: $${p}$ i $${q}$.`, `Parabola ma ramiona skierowane ${flip ? "w dół" : "w górę"} – zaznacz, gdzie leży ${negative ? "pod" : "nad"} osią $Ox$.`],
      explanation: `Miejsca zerowe: $${p}$ i $${q}$, ramiona paraboli ${flip ? "w dół" : "w górę"}. Wartości ${negative ? "ujemne" : "dodatnie"} ${negative ? "między" : "poza"} pierwiastkami, więc $x \\in ${negative ? between(p, q, closed) : outside(p, q, closed)}$.`,
      trap: flip ? "Minus przed iloczynem odwraca ramiona paraboli – i zbiór rozwiązań." : "Miejsca zerowe czynnika $(x - a)$ to $a$, a nie $-a$.",
    };
  },
};

export const quadraticIntegers: OpenTemplate = {
  id: "kr-nk-calkowite",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const p = r.int(-6, 4);
    const q = p + r.int(2, 9);
    const strict = r.int(0, 1) === 1;
    const count = strict ? q - p - 1 : q - p + 1;
    const poly = joinTerms([term(1, "x^2"), term(-(p + q), "x"), String(p * q)]);
    return {
      prompt: `Ile liczb całkowitych spełnia nierówność $${poly} ${strict ? "<" : "\\le"} 0$?`,
      answers: [String(count)],
      answerLabel: "Liczba:",
      hints: ["Wyznacz miejsca zerowe trójmianu.", "Ramiona paraboli są skierowane w górę – rozwiązania leżą między pierwiastkami."],
      solution: [{ step: `Pierwiastki: $${p}$ i $${q}$, więc $x \\in ${between(p, q, !strict)}$. Liczb całkowitych w tym przedziale jest $${count}$.`, points: 1 }],
    };
  },
};

// ── III – równania wymierne ──

export const rationalEquation: OpenTemplate = {
  id: "kr-wymierne",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const x0 = r.int(-9, 9);
    const b = r.int(-9, 9);
    const c = r.pick([-3, -2, 2, 3, 4]);
    if (x0 === b) return null;
    const a = c * (x0 - b) - x0; // x0 + a = c(x0 − b)
    if (Math.abs(a) > 30) return null;
    return {
      prompt: `Rozwiąż równanie $\\frac{${minus(-a)}}{${minus(b)}} = ${c}$, gdzie $x \\ne ${b}$.`,
      answers: [String(x0)],
      answerLabel: "x =",
      hints: [`Pomnóż obie strony przez $${minus(b)}$ (wolno, bo $x \\ne ${b}$).`, "Sprawdź, czy wynik należy do dziedziny."],
      solution: [{ step: `$${minus(-a)} = ${c}(${minus(b)})$, czyli $${minus(-a)} = ${joinTerms([term(c, "x"), String(-c * b)])}$, stąd $x = ${frac(a + c * b, c - 1)}$ – należy do dziedziny.`, points: 1 }],
    };
  },
};

export const rationalRootCount: ClosedTemplate = {
  id: "wm-liczba-rozwiazan",
  difficulty: "sredni",
  make: (r) => {
    const p = r.int(-7, 7);
    const shape = r.int(0, 2);
    // shape 1: drugi pierwiastek licznika też wypada z dziedziny – równanie bez rozwiązań
    const q = shape === 1 ? -p : r.int(-7, 7);
    if (p === 0 || p === q) return null;
    let denominator: string;
    let excluded: number[];
    if (shape < 2) {
      denominator = `x^2 - ${p * p}`;
      excluded = [p, -p];
    } else {
      const s = r.int(-7, 7);
      if (s === p || s === q) return null;
      denominator = minus(s);
      excluded = [s];
    }
    const roots = [p, q].filter((x) => !excluded.includes(x));
    const answers = ["nie ma rozwiązań", "ma dokładnie jedno rozwiązanie", "ma dokładnie dwa rozwiązania", "ma dokładnie trzy rozwiązania"];
    const correct = answers[roots.length];
    const factor = (t: number) => (t === 0 ? "x" : `(${minus(t)})`);
    return {
      // czynnik „x” z przodu: x(x − 3), a nie (x − 3)x
      prompt: `Równanie $\\frac{${q === 0 ? `x${factor(p)}` : `${factor(p)}${factor(q)}`}}{${denominator}} = 0$ w zbiorze liczb rzeczywistych`,
      correct,
      distractors: answers.filter((a) => a !== correct) as [string, string, string],
      hints: ["Ułamek jest równy zero, gdy licznik jest równy zero, a mianownik – nie.", "Wyznacz liczby, dla których mianownik jest równy zero, i wyklucz je."],
      explanation: `Licznik zeruje się dla $x = ${p}$ i $x = ${q}$. Mianownik zeruje się dla $x \\in \\{${excluded.join(", ")}\\}$ – te liczby nie należą do dziedziny. ${roots.length ? `Zostaje: $x \\in \\{${roots.join(", ")}\\}$.` : "Nie zostaje żadne rozwiązanie."}`,
      trap: "Najpierw dziedzina – liczba zerująca mianownik nie jest rozwiązaniem, nawet gdy zeruje licznik.",
    };
  },
};
