// Szablony wzorowane na zadaniach z matur podstawowych formuły 2015 (czerwiec 2020, maj 2021) – te same pomysły,
// inne liczby. Każdy ma siłowe sprawdzenie w tests/templates-2015.test.ts (liczby odczytane z treści wariantu).
import { frac, fracAnswer, joinTerms, paren, term, type ClosedTemplate, type OpenTemplate } from "@/data/templates/engine";

const n = (value: number) => `$${value}$`;
const pct = (value: number) => `$${value}\\%$`;

// ── procenty: powrót do ceny po obniżce (2020, zad. 4) ──

export const restorePrice: ClosedTemplate = {
  id: "pr-powrot-ceny",
  difficulty: "sredni",
  make: (r) => {
    // obniżka p% → podwyżka o 100p / (100 − p) %; tylko pary z całkowitym wynikiem
    const [p, up] = r.pick([
      [20, 25],
      [50, 100],
      [60, 150],
      [75, 300],
      [80, 400],
    ] as const);
    const item = r.pick(["pewnego towaru", "biletu", "roweru", "kurtki", "laptopa"]);
    return {
      prompt: `Cenę $x$ ${item} obniżono o $${p}\\%$ i otrzymano cenę $y$. Aby przywrócić cenę $x$, nową cenę $y$ należy podnieść o`,
      correct: pct(up),
      distractors: [pct(p), pct(p + 10), pct(2 * up)],
      hints: [`Po obniżce $y = ${frac(100 - p, 100)}x$.`, "Policz, ile razy $x$ jest większe od $y$, i zamień nadwyżkę na procenty ceny $y$."],
      explanation: `$y = ${frac(100 - p, 100)}x$, więc $x = ${frac(100, 100 - p)}y$ – to $${up}\\%$ więcej niż $y$.`,
      trap: "Podwyżka liczy się od niższej ceny $y$, więc musi być większa niż obniżka.",
    };
  },
};

// ── wzory skróconego mnożenia: (x − a)² dla x = √k + a (2020, zad. 1) ──

export const squareAtRoot: ClosedTemplate = {
  id: "ws-wartosc-kwadratu",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.pick([2, 3, 4, 5, 6]);
    const k = r.pick([2, 3, 5, 6, 7]);
    const poly = joinTerms(["x^2", term(-2 * a, "x"), String(a * a)]);
    return {
      prompt: `Wartość wyrażenia $${poly}$ dla $x = \\sqrt{${k}} + ${a}$ jest równa`,
      correct: n(k),
      distractors: [n(k + a * a), n(2 * k), n(k + 2 * a)],
      hints: [`Rozpoznaj wzór: $${poly} = (x - ${a})^2$.`, `Dla $x = \\sqrt{${k}} + ${a}$ mamy $x - ${a} = \\sqrt{${k}}$.`],
      explanation: `$${poly} = (x - ${a})^2 = (\\sqrt{${k}})^2 = ${k}$.`,
      trap: "Podstawianie do trzech wyrazów osobno to proszenie się o błąd – najpierw zwiń wyrażenie do kwadratu.",
    };
  },
};

// ── przedziały: ile liczb całkowitych w części wspólnej (2021, zad. 3) ──

export const integersInIntersection: ClosedTemplate = {
  id: "nl-calkowite-wspolne",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.int(-6, 2);
    const b = a + r.int(3, 8);
    const closedA = r.pick([true, false]);
    const closedB = r.pick([true, false]);
    const left = `(-\\infty, ${b}${closedB ? " \\rangle" : ")"}`;
    const right = `${closedA ? "\\langle " : "("}${a}, +\\infty)`;
    const count = b - a + 1 - (closedA ? 0 : 1) - (closedB ? 0 : 1);
    return {
      prompt: `Rozważamy przedziały liczbowe $${left}$ i $${right}$. Ile jest wszystkich liczb całkowitych, które należą jednocześnie do obu rozważanych przedziałów?`,
      correct: n(count),
      distractors: [n(count + 1), n(count - 1), n(count + 2)],
      hints: [`Część wspólna to przedział od $${a}$ do $${b}$.`, "Nawias kątowy – kraniec należy do przedziału, okrągły – nie należy."],
      explanation: `Część wspólna: $${closedA ? "\\langle " : "("}${a}, ${b}${closedB ? " \\rangle" : ")"}$. Liczby całkowite od $${closedA ? a : a + 1}$ do $${closedB ? b : b - 1}$ – jest ich $${count}$.`,
      trap: "Sprawdź oba krańce – liczba przy nawiasie okrągłym nie należy do przedziału.",
    };
  },
};

// ── ciągi: różnica kolejnych wyrazów a_n = c·n² (2020, zad. 14) ──

export const squareSequenceDifference: ClosedTemplate = {
  id: "ci-roznica-kwadratowa",
  difficulty: "podstawowy",
  make: (r) => {
    const c = r.pick([2, 3, 4, 5]);
    const m = r.int(3, 7);
    const diff = c * ((m + 1) ** 2 - m ** 2);
    return {
      prompt: `Ciąg $(a_n)$ jest określony wzorem $a_n = ${c}n^2$ dla $n \\ge 1$. Różnica $a_{${m + 1}} - a_{${m}}$ jest równa`,
      correct: n(diff),
      distractors: [n(c), n(c * c), n(c * (2 * m))],
      hints: [`Oblicz osobno $a_{${m + 1}} = ${c} \\cdot ${(m + 1) ** 2}$ i $a_{${m}} = ${c} \\cdot ${m ** 2}$.`, "Odejmij wyniki."],
      explanation: `$a_{${m + 1}} - a_{${m}} = ${c * (m + 1) ** 2} - ${c * m * m} = ${diff}$.`,
      trap: "To nie ciąg arytmetyczny – różnice kolejnych wyrazów nie są stałe.",
    };
  },
};

// ── ciągi: suma czterech wyrazów z a₄ i r (2020, zad. 15) ──

export const fourTermSum: ClosedTemplate = {
  id: "ci-suma-czterech",
  difficulty: "sredni",
  make: (r) => {
    const a4 = r.int(-6, 9);
    const d = r.pick([-4, -3, -2, 2, 3, 4, 5]);
    const a1 = a4 - 3 * d;
    const sum = 2 * (a1 + a4);
    return {
      prompt: `W ciągu arytmetycznym $(a_n)$, określonym dla $n \\ge 1$, czwarty wyraz jest równy $${a4}$, a różnica tego ciągu jest równa $${d}$. Suma $a_1 + a_2 + a_3 + a_4$ jest równa`,
      correct: n(sum),
      distractors: [n(2 * (a4 - 4 * d + a4)), n(4 * a4), n(sum + 2 * d)],
      hints: [`$a_1 = a_4 - 3r = ${a4} - 3 \\cdot ${paren(d)}$.`, "$S_4 = \\frac{a_1 + a_4}{2} \\cdot 4$."],
      explanation: `$a_1 = ${a1}$, więc $a_1 + a_2 + a_3 + a_4 = \\frac{${a1} + ${paren(a4)}}{2} \\cdot 4 = ${sum}$.`,
      trap: "Od $a_1$ do $a_4$ są trzy kroki, nie cztery.",
    };
  },
};

// ── statystyka: mediana z brakującą liczbą (2020, zad. 23) ──

export const medianMissing: ClosedTemplate = {
  id: "st-mediana-brakujaca",
  difficulty: "sredni",
  make: (r) => {
    const five = r.shuffle(Array.from(new Set(Array.from({ length: 5 }, () => r.int(1, 12)))));
    if (five.length !== 5) return null;
    const median = [...five].sort((x, y) => x - y)[2];
    // zestaw czterech danych: p < q < a < s, mediana (q + a) / 2 = median
    const q = median - r.int(1, 3);
    const a = 2 * median - q;
    const p = q - r.int(1, 2);
    const s = a + r.int(1, 3);
    if (p < 0) return null;
    const value = (x: number) => `$a = ${x}$`;
    return {
      prompt: `Cztery liczby: $${p}, ${q}, a, ${s}$, tworzące zestaw danych, są uporządkowane rosnąco. Mediana tego zestawu czterech danych jest równa medianie zestawu pięciu danych: $${five.join(", ")}$. Zatem`,
      correct: value(a),
      distractors: [value(median), value(a - 1), value(a + 1)],
      hints: ["Uporządkuj zestaw pięciu liczb – mediana to środkowa liczba.", `Mediana czterech liczb to średnia dwóch środkowych: $\\frac{${q} + a}{2}$.`],
      explanation: `Mediana zestawu pięciu liczb to $${median}$, więc $\\frac{${q} + a}{2} = ${median}$ i $a = ${a}$.`,
      trap: "Przed odczytaniem mediany zestaw trzeba uporządkować rosnąco.",
    };
  },
};

// ── geometria analityczna: obraz punktu w symetrii względem początku układu (2020, zad. 20) ──

export const originSymmetryLength: ClosedTemplate = {
  id: "pp-symetria-poczatek",
  difficulty: "podstawowy",
  make: (r) => {
    const x = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const y = r.pick([-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
    const s = x * x + y * y;
    // tylko pierwiastek w najprostszej postaci – bez kwadratów pod pierwiastkiem („2√8” to już 4√2)
    if ([4, 9, 25, 49].some((square) => s % square === 0)) return null;
    return {
      prompt: `Punkt $B$ jest obrazem punktu $A = (${x}, ${y})$ w symetrii względem początku układu współrzędnych. Długość odcinka $AB$ jest równa`,
      correct: `$2\\sqrt{${s}}$`,
      distractors: [`$\\sqrt{${s}}$`, n(2 * (Math.abs(x) + Math.abs(y))), `$4\\sqrt{${s}}$`],
      hints: ["W symetrii względem początku układu obie współrzędne zmieniają znak.", "Długość odcinka: $\\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$."],
      explanation: `$B = (${-x}, ${-y})$, więc $|AB| = \\sqrt{${(2 * x) ** 2} + ${(2 * y) ** 2}} = 2\\sqrt{${s}}$.`,
      trap: "To dwa razy odległość punktu $A$ od początku układu – nie sama ta odległość.",
    };
  },
};

// ── stereometria: pole sześcianu z przekątnej (2020, zad. 24) ──

export const cubeFromDiagonal: ClosedTemplate = {
  id: "gp-szescian-przekatna",
  difficulty: "podstawowy",
  make: (r) => {
    const a = r.int(2, 12);
    const area = 6 * a * a;
    return {
      prompt: `Przekątna sześcianu ma długość $${a}\\sqrt{3}$. Pole powierzchni tego sześcianu jest równe`,
      correct: n(area),
      distractors: [n(a * a), n(4 * a * a), n(a ** 3)],
      hints: ["Przekątna sześcianu o krawędzi $a$ ma długość $a\\sqrt{3}$.", "Pole powierzchni to $6$ kwadratów o boku $a$."],
      explanation: `Krawędź $a = ${a}$, więc $P = 6 \\cdot ${a}^2 = ${area}$.`,
      trap: "Przekątna ściany to $a\\sqrt{2}$, a przekątna sześcianu – $a\\sqrt{3}$.",
    };
  },
};

// ── stereometria: dwa stożki o wspólnej podstawie (2020, zad. 25) ──

export const doubleCone: ClosedTemplate = {
  id: "gp-dwa-stozki",
  difficulty: "sredni",
  make: (r) => {
    const [hi, lo] = r.pick([
      [3, 2],
      [2, 1],
      [5, 2],
      [4, 3],
      [5, 3],
    ] as const);
    const unit = r.int(2, 8);
    const small = lo * unit;
    const big = hi * unit;
    return {
      prompt: `Dwa stożki o takich samych podstawach połączono podstawami. Stosunek wysokości tych stożków jest równy $${hi} : ${lo}$. Objętość stożka o krótszej wysokości jest równa $${small}$ cm³. Objętość bryły utworzonej z połączonych stożków jest równa`,
      correct: `$${small + big}$ cm³`,
      distractors: [`$${big}$ cm³`, `$${small * 2}$ cm³`, `$${small + big * 3}$ cm³`],
      hints: ["Przy tej samej podstawie objętości stożków są w takim stosunku jak wysokości.", `Wyższy stożek ma objętość $\\frac{${hi}}{${lo}} \\cdot ${small}$ cm³.`],
      explanation: `Wyższy stożek: $\\frac{${hi}}{${lo}} \\cdot ${small} = ${big}$ cm³, razem $${small + big}$ cm³.`,
      trap: "Pytają o całą bryłę – dodaj objętości obu stożków.",
    };
  },
};

// ── funkcja kwadratowa: przedział monotoniczności z postaci iloczynowej (2021, zad. 12) ──

export const quadraticMonotonic: ClosedTemplate = {
  id: "fk-monotonicznosc",
  difficulty: "sredni",
  make: (r) => {
    const x1 = r.int(-6, 2);
    const x2 = x1 + 2 * r.int(1, 4);
    const a = r.pick([-3, -2, -1, 1, 2, 3]);
    const p = (x1 + x2) / 2;
    const decreasing = a < 0;
    const lead = a === 1 ? "" : a === -1 ? "-" : String(a);
    const factor = (x0: number) => `(x ${x0 < 0 ? "+" : "-"} ${Math.abs(x0)})`;
    const right = `$\\langle ${p}, +\\infty)$`;
    const left = `$(-\\infty, ${p} \\rangle$`;
    return {
      prompt: `Funkcja kwadratowa $f$ określona wzorem $f(x) = ${lead}${x1 === 0 ? "x" : factor(x1)}${x2 === 0 ? "x" : factor(x2)}$ jest ${decreasing ? "malejąca" : "rosnąca"} w przedziale`,
      correct: right,
      // od miejsc zerowych: wierzchołek wewnątrz przedziału, więc funkcja nie jest tam monotoniczna
      distractors: [left, `$(-\\infty, ${x2} \\rangle$`, `$\\langle ${x1}, +\\infty)$`],
      hints: [`Miejsca zerowe: $${x1}$ i $${x2}$ – wierzchołek leży pośrodku, $p = ${p}$.`, `Współczynnik przy $x^2$ to $${a}$ – ramiona ${a < 0 ? "w dół" : "w górę"}.`],
      explanation: `$p = \\frac{${x1} + ${paren(x2)}}{2} = ${p}$, a ramiona są skierowane ${a < 0 ? "w dół, więc funkcja maleje" : "w górę, więc funkcja rośnie"} w $\\langle ${p}, +\\infty)$.`,
      trap: "Funkcja zmienia monotoniczność w wierzchołku, a nie w miejscach zerowych.",
    };
  },
};

// ── trygonometria: tangens z warunku z sinusem i cosinusem (2020, zad. 31) ──

export const tangentFromRatio: OpenTemplate = {
  id: "kr-tangens-z-ilorazu",
  difficulty: "sredni",
  format: "short",
  make: (r) => {
    const b = r.int(2, 5);
    const c = r.int(1, 6);
    const t = r.pick([[1, 2], [1, 3], [2, 3], [3, 2], [2, 1], [3, 4]] as const);
    const [tn, td] = t;
    // b·tg + c = d ⇒ d całkowite: b·tn/td całkowite
    if ((b * tn) % td !== 0) return null;
    const d = (b * tn) / td + c;
    return {
      prompt: `Kąt $\\alpha$ jest ostry i spełnia warunek $\\frac{${b}\\sin\\alpha + ${c}\\cos\\alpha}{\\cos\\alpha} = ${d}$. Oblicz tangens kąta $\\alpha$.`,
      answers: [fracAnswer(tn, td)],
      answerLabel: "\\operatorname{tg}\\alpha =",
      hints: ["Podziel każdy wyraz licznika przez $\\cos\\alpha$.", "$\\frac{\\sin\\alpha}{\\cos\\alpha} = \\operatorname{tg}\\alpha$."],
      solution: [
        { step: `$${b}\\operatorname{tg}\\alpha + ${c} = ${d}$.`, points: 1 },
        { step: `$\\operatorname{tg}\\alpha = \\frac{${d - c}}{${b}} = ${frac(tn, td)}$.`, points: 1 },
      ],
    };
  },
};

// ── ciągi: iloraz ciągu geometrycznego z warunku na trzy wyrazy (2020, zad. 33) ──

export const geometricRatio: OpenTemplate = {
  id: "ot-iloraz-geometryczny",
  difficulty: "zaawansowany",
  make: (r) => {
    // q² − (u + v)q + uv = 0, pierwiastki u < v; przedział zawiera tylko v
    const u = r.int(1, 4);
    const v = u + r.int(1, 3);
    const s = u + v;
    const pr = u * v;
    // dolny kraniec między pierwiastkami – w przedziale jest tylko większy
    const lo = v - u > 1 ? r.pick([u + 0.5, v - 0.5]) : v - 0.5;
    const hi = v + r.pick([0.5, 1, 2]);
    const fmt = (x: number) => String(x).replace(".", "{,}");
    return {
      prompt: `Wszystkie wyrazy ciągu geometrycznego $(a_n)$, określonego dla $n \\ge 1$, są dodatnie. Wyrazy tego ciągu spełniają warunek $${pr}a_1 - ${s}a_2 + a_3 = 0$. Oblicz iloraz $q$ tego ciągu należący do przedziału $\\langle ${fmt(lo)}; ${fmt(hi)} \\rangle$.`,
      answers: [String(v)],
      answerLabel: "q =",
      hints: ["Zapisz $a_2 = a_1q$ i $a_3 = a_1q^2$, a potem podziel przez $a_1 > 0$.", "Rozwiąż równanie kwadratowe i wybierz iloraz z podanego przedziału."],
      solution: [
        { step: "$a_2 = a_1q$, $a_3 = a_1q^2$.", points: 1 },
        { step: `$${pr}a_1 - ${s}a_1q + a_1q^2 = 0$, czyli $q^2 - ${s}q + ${pr} = 0$.`, points: 1 },
        { step: `$q = ${u}$ lub $q = ${v}$.`, points: 1 },
        { step: `Do przedziału należy tylko $q = ${v}$.`, points: 1 },
      ],
    };
  },
};
