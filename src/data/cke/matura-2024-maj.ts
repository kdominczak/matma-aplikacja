import type { PracticeTask } from "@/data/topics";
import type { ChoiceOption, ChoiceQuestion, ExamSheet, ExamTask } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, 8 maja 2024 (formuła 2023, 46 pkt, 180 min) – arkusz MMAP-P0-100, wersja A.
// Treść przepisana z PDF CKE, klucz i schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2024).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Różnice wobec papieru (opisane uczniowi w treści):
// – zad. 1: rysunki zbiorów na osi liczbowej zapisane jako przedziały,
// – zad. 25.2: cztery rysunki graniastosłupa wycięte z PDF (public/cke/2024-maj/), pozostałe rysunki odtworzone
//   z danych zadania (wykresy, trójkąty, okrąg, diagram),
// – zad. 31: do sprawdzenia automatycznego wpisuje się x i y po średniku,
// – zadania otwarte: schemat CKE jako kolejne kroki po 1 pkt.

const LABEL = "Matura CKE · maj 2024";
const TF_PROMPT = "Oceń prawdziwość poniższych stwierdzeń. Wybierz P, jeśli stwierdzenie jest prawdziwe, albo F – jeśli jest fałszywe.";
const TF_OPTIONS: [string, string, string, string] = ["1. P · 2. P", "1. P · 2. F", "1. F · 2. P", "1. F · 2. F"];
const FINISH = "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.";
const id = (n: string) => `cke-2024-maj-${n}`;

function closed(n: string, prompt: string, options: [string, string, string, string], correct: OptionKey, explanation: string, extra: { figure?: Plot; truefalse?: boolean } = {}): PracticeTask {
  return {
    kind: "closed",
    id: id(n),
    difficulty: "sredni",
    points: 1,
    question: {
      id: id(n),
      label: LABEL,
      prompt,
      options: { A: options[0], B: options[1], C: options[2], D: options[3] },
      correct,
      explanation,
      ...(extra.figure ? { figure: extra.figure } : {}),
      ...(extra.truefalse ? { format: "truefalse" as const } : {}),
    },
  };
}

const truefalse = (n: string, intro: string, s1: string, s2: string, correct: OptionKey, explanation: string, figure?: Plot) =>
  closed(n, `${intro}\n\n${TF_PROMPT}\n\n1. ${s1}\n\n2. ${s2}`, TF_OPTIONS, correct, explanation, { figure, truefalse: true });

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id: id(n), difficulty: "sredni", points: solution.length, task: { id: id(n), label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

function choice(n: string, points: number, q: Omit<ChoiceQuestion, "id" | "label">): ExamTask {
  return { kind: "choice", id: id(n), difficulty: "sredni", points, choice: { id: id(n), label: LABEL, ...q } };
}

// ── Rysunki ──

const curve = (f: (x: number) => number, from: number, to: number, step = 0.25): Point[] =>
  Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => {
    const x = from + i * step;
    return [x, f(x)];
  });
const f14 = (x: number) => -((x - 1) ** 2) + 9;
const parabolaPlot = (f: (x: number) => number, from: number, to: number, up = false): Plot => ({
  x: [-7.5, 7.5],
  y: up ? [-10.5, 6.5] : [-6.5, 10.5],
  lines: [curve(f, from, to)],
});

const F11: Plot = {
  x: [-3.5, 4.5],
  y: [-3.5, 4.5],
  lines: [curve((x) => -1.5 * x + 3, -1, 5, 1), curve((x) => -1.5 * x - 1, -4, 2, 1)],
};
const F14: Plot = { ...parabolaPlot(f14, -2.6, 4.6), labels: [{ at: [-3.2, 6], text: "y = f(x)", anchor: "end" }] };

// 14.4 – A: g(x) = f(x + 3), B: f(x − 2), C: f(x) − 3, D: −f(x), E: h(x) = f(−x), F: −f(−x)
const OPTIONS_144: ChoiceOption[] = [
  { key: "A", figure: parabolaPlot((x) => f14(x + 3), -5.6, 1.6) },
  { key: "B", figure: parabolaPlot((x) => f14(x - 2), -0.6, 6.6) },
  { key: "C", figure: parabolaPlot((x) => f14(x) - 3, -2.6, 4.6) },
  { key: "D", figure: parabolaPlot((x) => -f14(x), -2.6, 4.6, true) },
  { key: "E", figure: parabolaPlot((x) => f14(-x), -4.6, 2.6) },
  { key: "F", figure: parabolaPlot((x) => -f14(-x), -4.6, 2.6, true) },
];

// 18: ramię kąta w II ćwiartce o kierunku (−1, 3) – tg α = −3
const arc = (r: number, toDeg: number): Point[] => Array.from({ length: 13 }, (_, i) => [r * Math.cos(((toDeg * i) / 12) * (Math.PI / 180)), r * Math.sin(((toDeg * i) / 12) * (Math.PI / 180))]);
const ALPHA18 = 180 - (Math.atan(3) * 180) / Math.PI;
const F18: Plot = {
  x: [-3.5, 3.5],
  y: [-1.5, 3.5],
  lines: [
    [
      [0, 0],
      [-1.15, 3.45],
    ],
    [
      [0, 0],
      [3.4, 0],
    ],
  ],
  fills: [[[0, 0], ...arc(0.6, ALPHA18)]],
  labels: [{ at: [0.45, 0.65], text: "α" }],
};

// 20: dwusieczna MN kąta KML; |KN| : |NL| = |KM| : |LM|
const K: Point = [0, 0];
const L: Point = [7, 0];
const M: Point = [2.2, 3.6];
const dist = (p: Point, q: Point) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const N20: Point = [(7 * dist(M, K)) / (dist(M, K) + dist(M, L)), 0];
const F20: Plot = {
  axes: false,
  x: [-0.6, 7.6],
  y: [-0.8, 4.2],
  lines: [[K, L, M, K], [M, N20]],
  labels: [
    { at: [-0.3, -0.4], text: "K" },
    { at: [7.3, -0.4], text: "L" },
    { at: [2.2, 3.95], text: "M" },
    { at: [N20[0], -0.45], text: "N" },
    { at: [0.85, 2], text: "a" },
    { at: [4.9, 2.1], text: "b" },
    { at: [N20[0] / 2, -0.45], text: "c" },
    { at: [(N20[0] + 7) / 2, -0.45], text: "d" },
    { at: [(M[0] + N20[0]) / 2 + 0.3, 1.9], text: "e" },
  ],
};

// 22: okrąg o środku S; łuk AB (bez C) = 84° → kąt wpisany ACB = 42°
const onCircle = (deg: number, r = 3): Point => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
const [A22, B22, C22] = [onCircle(200), onCircle(284), onCircle(125)];
const F22: Plot = {
  axes: false,
  x: [-3.7, 4.4],
  y: [-3.6, 3.6],
  lines: [Array.from({ length: 73 }, (_, i) => onCircle(i * 5)), [A22, B22, C22, A22], [A22, onCircle(20, 3.9)]],
  dots: [{ at: [0, 0] }],
  labels: [
    { at: [A22[0] - 0.35, A22[1]], text: "A" },
    { at: [B22[0] + 0.2, B22[1] - 0.35], text: "B" },
    { at: [C22[0] - 0.25, C22[1] + 0.3], text: "C" },
    { at: [0.1, 0.4], text: "S" },
    { at: [C22[0] + 0.1, C22[1] - 0.7], text: "42°" },
  ],
};

// 25: graniastosłup prawidłowy sześciokątny o wysokości 6 (rzut ukośny)
const hex = (y: number): Point[] => [0, 60, 120, 180, 240, 300].map((deg) => [2 * Math.cos((deg * Math.PI) / 180), y + 0.8 * Math.sin((deg * Math.PI) / 180)]);
const [bottom, top] = [hex(0), hex(4.5)];
const F25: Plot = {
  axes: false,
  x: [-2.6, 3.2],
  y: [-1.2, 5.6],
  lines: [[...top, top[0]], [bottom[3], bottom[4], bottom[5], bottom[0]], ...[0, 3, 4, 5].map((i) => [bottom[i], top[i]])],
  guides: [[bottom[0], bottom[1], bottom[2], bottom[3]], [bottom[1], top[1]], [bottom[2], top[2]]],
  labels: [{ at: [2.35, 2.1], text: "6", anchor: "start" }],
};

const COUNTS_29 = [2, 7, 4, 3, 6, 4];
const F29: Plot = {
  x: [0, 7.8],
  y: [0, 8.5],
  lines: [],
  fills: COUNTS_29.map((c, i): Point[] => [
    [i + 0.8, 0],
    [i + 0.8, c],
    [i + 1.2, c],
    [i + 1.2, 0],
  ]),
  axisNames: ["ocena", "liczba uczniów"],
};

// 31: trzy wybiegi y × x obok siebie, siatka przerywana
const F31: Plot = {
  axes: false,
  x: [-1, 9.6],
  y: [-0.6, 4.6],
  lines: [],
  guides: [
    [
      [0, 0],
      [9, 0],
      [9, 3],
      [0, 3],
      [0, 0],
    ],
    [
      [3, 0],
      [3, 3],
    ],
    [
      [6, 0],
      [6, 3],
    ],
  ],
  labels: [
    { at: [1.5, 3.5], text: "y" },
    { at: [4.5, 3.5], text: "y" },
    { at: [7.5, 3.5], text: "y" },
    { at: [-0.5, 1.5], text: "x" },
    { at: [1.5, 1.5], text: "wybieg 1." },
    { at: [4.5, 1.5], text: "wybieg 2." },
    { at: [7.5, 1.5], text: "wybieg 3." },
  ],
};

// ── Zadania ──

const F14_INTRO =
  "W kartezjańskim układzie współrzędnych $(x, y)$ przedstawiono fragment paraboli, która jest wykresem funkcji kwadratowej $f$ (zobacz rysunek). Wierzchołek tej paraboli oraz punkty przecięcia paraboli z osiami układu współrzędnych mają obie współrzędne całkowite.";
const T25 = "Wysokość graniastosłupa prawidłowego sześciokątnego jest równa $6$ (zobacz rysunek). Pole podstawy tego graniastosłupa jest równe $15\\sqrt{3}$.";
const sys = (a: string, b: string) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

const TASKS: [number: string, task: ExamTask][] = [
  [
    "1",
    closed(
      "1",
      "Dana jest nierówność\n\n$|x - 1| \\ge 3$\n\nNa którym rysunku poprawnie zaznaczono na osi liczbowej zbiór wszystkich liczb rzeczywistych spełniających powyższą nierówność? Wybierz właściwą odpowiedź spośród podanych.\n\n(W aplikacji rysunki z osią liczbową zapisano jako zbiory.)",
      ["$[-2, 4]$", "$(-\\infty, -2] \\cup [4, +\\infty)$", "$(-2, 4)$", "$(-\\infty, -2) \\cup (4, +\\infty)$"],
      "B",
      "$x - 1 \\le -3$ lub $x - 1 \\ge 3$, czyli $x \\le -2$ lub $x \\ge 4$ – krańce należą do zbioru.",
    ),
  ],
  ["2", closed("2", `${FINISH}\n\nLiczba $\\left(\\frac{1}{16}\\right)^8 \\cdot 8^{16}$ jest równa`, ["$2^{24}$", "$2^{16}$", "$2^{12}$", "$2^{8}$"], "B", "$\\left(2^{-4}\\right)^8 \\cdot \\left(2^3\\right)^{16} = 2^{-32} \\cdot 2^{48} = 2^{16}$.")],
  [
    "3",
    open(
      "3",
      "Wykaż, że dla każdej liczby naturalnej $n \\ge 1$ liczba $n^2 + (n + 1)^2 + (n + 2)^2$ przy dzieleniu przez $3$ daje resztę $2$.",
      [],
      ["Rozwinięcie: $n^2 + n^2 + 2n + 1 + n^2 + 4n + 4 = 3n^2 + 6n + 5$.", "$3n^2 + 6n + 5 = 3(n^2 + 2n + 1) + 2$ – wielokrotność $3$ powiększona o $2$, więc reszta jest równa $2$."],
      { format: "proof" },
    ),
  ],
  ["4", closed("4", `${FINISH}\n\nLiczba $\\log_{\\sqrt{3}} 9$ jest równa`, ["$2$", "$3$", "$4$", "$9$"], "C", "$(\\sqrt{3})^4 = 9$, więc $\\log_{\\sqrt{3}} 9 = 4$.")],
  ["5", closed("5", `${FINISH}\n\nDla każdej liczby rzeczywistej $a$ i dla każdej liczby rzeczywistej $b$ wartość wyrażenia $(2a + b)^2 - (2a - b)^2$ jest równa wartości wyrażenia`, ["$8a^2$", "$8ab$", "$-8ab$", "$2b^2$"], "B", "$(4a^2 + 4ab + b^2) - (4a^2 - 4ab + b^2) = 8ab$.")],
  [
    "6",
    closed(
      "6",
      `${FINISH}\n\nZbiorem wszystkich rozwiązań nierówności\n\n$1 - \\frac{3}{2}x < \\frac{2}{3} - x$\n\njest przedział`,
      ["$\\left(-\\infty, -\\frac{2}{3}\\right)$", "$\\left(-\\infty, \\frac{2}{3}\\right)$", "$\\left(-\\frac{2}{3}, +\\infty\\right)$", "$\\left(\\frac{2}{3}, +\\infty\\right)$"],
      "D",
      "$\\frac{1}{3} < \\frac{1}{2}x$, więc $x > \\frac{2}{3}$.",
    ),
  ],
  [
    "7",
    closed(
      "7",
      `${FINISH}\n\nRównanie $\\frac{x + 1}{(x + 2)(x - 3)} = 0$ w zbiorze liczb rzeczywistych`,
      ["nie ma rozwiązania.", "ma dokładnie jedno rozwiązanie: $(-1)$.", "ma dokładnie dwa rozwiązania: $(-2)$ oraz $3$.", "ma dokładnie trzy rozwiązania: $(-1)$, $(-2)$ oraz $3$."],
      "B",
      "Ułamek jest równy $0$, gdy licznik $x + 1 = 0$, a mianownik nie jest zerem: $x = -1$ ($-2$ i $3$ są poza dziedziną).",
    ),
  ],
  [
    "8",
    truefalse(
      "8",
      "Dany jest wielomian $W(x) = 3x^3 + 6x^2 + 9x$.",
      "Wielomian $W$ jest iloczynem wielomianów $F(x) = 3x$ i $G(x) = x^2 + 2x + 3$.",
      "Liczba $(-1)$ jest rozwiązaniem równania $W(x) = 0$.",
      "B",
      "$3x(x^2 + 2x + 3) = 3x^3 + 6x^2 + 9x$ (P); $W(-1) = -3 + 6 - 9 = -6 \\ne 0$ (F).",
    ),
  ],
  [
    "9",
    open(
      "9",
      "Rozwiąż równanie\n\n$x^3 - 2x^2 - 3x + 6 = 0$\n\nZapisz obliczenia.",
      ["-√3; √3; 2"],
      ["Rozkład na czynniki: $x^2(x - 2) - 3(x - 2) = (x - 2)(x^2 - 3)$.", "Jedno rozwiązanie z rozkładu, np. $x = 2$.", "Wszystkie rozwiązania: $x = 2$, $x = -\\sqrt{3}$, $x = \\sqrt{3}$."],
    ),
  ],
  [
    "10",
    closed(
      "10",
      `W październiku 2022 roku założono dwa sady, w których posadzono łącznie $1960$ drzew. Po roku stwierdzono, że uschło $5\\%$ drzew w pierwszym sadzie i $10\\%$ drzew w drugim sadzie. Uschnięte drzewa usunięto, a nowych nie dosadzano. Liczba drzew, które pozostały w drugim sadzie, stanowiła $60\\%$ liczby drzew, które pozostały w pierwszym sadzie.\n\nNiech $x$ oraz $y$ oznaczają liczby drzew posadzonych – odpowiednio – w pierwszym i drugim sadzie.\n\n${FINISH}\n\nUkładem równań, którego poprawne rozwiązanie prowadzi do obliczenia liczby $x$ drzew posadzonych w pierwszym sadzie oraz liczby $y$ drzew posadzonych w drugim sadzie, jest`,
      [
        sys("x + y = 1960", "0{,}6 \\cdot 0{,}95x = 0{,}9y"),
        sys("x + y = 1960", "0{,}95x = 0{,}6 \\cdot 0{,}9y"),
        sys("x + y = 1960", "0{,}05x = 0{,}6 \\cdot 0{,}1y"),
        sys("x + y = 1960", "0{,}4 \\cdot 0{,}95x = 0{,}9y"),
      ],
      "A",
      "Zostało $0{,}95x$ i $0{,}9y$ drzew, a drugie to $60\\%$ pierwszego: $0{,}9y = 0{,}6 \\cdot 0{,}95x$.",
    ),
  ],
  [
    "11",
    closed(
      "11",
      `Na rysunku, w kartezjańskim układzie współrzędnych $(x, y)$, przedstawiono dwie proste równoległe, które są interpretacją geometryczną jednego z poniższych układów równań A–D.\n\n${FINISH}\n\nUkładem równań, którego interpretację geometryczną przedstawiono na rysunku, jest`,
      [
        sys("y = -\\frac{3}{2}x + 3", "y = -\\frac{3}{2}x - 1"),
        sys("y = \\frac{3}{2}x + 3", "y = -\\frac{2}{3}x - 1"),
        sys("y = \\frac{3}{2}x + 3", "y = \\frac{3}{2}x - 1"),
        sys("y = -\\frac{3}{2}x - 3", "y = \\frac{3}{2}x + 1"),
      ],
      "A",
      "Obie proste maleją (ujemny współczynnik kierunkowy, ten sam – są równoległe) i przecinają oś $Oy$ w punktach $3$ i $-1$.",
      { figure: F11 },
    ),
  ],
  [
    "12",
    closed(
      "12",
      `Funkcja liniowa $f$ jest określona wzorem $f(x) = (-2k + 3)x + k - 1$, gdzie $k \\in \\mathbb{R}$.\n\n${FINISH}\n\nFunkcja $f$ jest malejąca dla każdej liczby $k$ należącej do przedziału`,
      ["$(-\\infty, 1)$", "$\\left(-\\infty, -\\frac{3}{2}\\right)$", "$(1, +\\infty)$", "$\\left(\\frac{3}{2}, +\\infty\\right)$"],
      "D",
      "Malejąca, gdy $-2k + 3 < 0$, czyli $k > \\frac{3}{2}$.",
    ),
  ],
  [
    "13",
    closed(
      "13",
      `Funkcje liniowe $f$ oraz $g$, określone wzorami $f(x) = 3x + 6$ oraz $g(x) = ax + 7$, mają to samo miejsce zerowe.\n\n${FINISH}\n\nWspółczynnik $a$ we wzorze funkcji $g$ jest równy`,
      ["$\\left(-\\frac{7}{2}\\right)$", "$\\left(-\\frac{2}{7}\\right)$", "$\\frac{2}{7}$", "$\\frac{7}{2}$"],
      "D",
      "Miejsce zerowe $f$: $x = -2$; $g(-2) = -2a + 7 = 0$, więc $a = \\frac{7}{2}$.",
    ),
  ],
  [
    "14.1",
    open(
      "14.1",
      `${F14_INTRO}\n\nUzupełnij poniższe zdanie. Wpisz odpowiedni przedział.\n\nZbiorem wszystkich rozwiązań nierówności $f(x) \\ge 0$ jest przedział …`,
      ["[-2, 4]"],
      ["Miejsca zerowe z wykresu: $-2$ i $4$; parabola ma ramiona w dół, więc $f(x) \\ge 0$ dla $x \\in [-2, 4]$."],
      { format: "short", figure: F14 },
    ),
  ],
  [
    "14.2",
    closed(
      "14.2",
      `${F14_INTRO}\n\n${FINISH}\n\nFunkcja kwadratowa $f$ jest określona wzorem`,
      ["$f(x) = -(x + 1)^2 - 9$", "$f(x) = -(x - 1)^2 + 9$", "$f(x) = -(x - 1)^2 - 9$", "$f(x) = -(x + 1)^2 + 9$"],
      "B",
      "Wierzchołek $(1, 9)$, ramiona w dół: $f(x) = -(x - 1)^2 + 9$.",
      { figure: F14 },
    ),
  ],
  ["14.3", closed("14.3", `${F14_INTRO}\n\n${FINISH}\n\nDla funkcji $f$ prawdziwa jest równość`, ["$f(-4) = f(6)$", "$f(-4) = f(5)$", "$f(-4) = f(4)$", "$f(-4) = f(7)$"], "A", "Oś symetrii $x = 1$: punkty $-4$ i $6$ leżą symetrycznie ($1 - 5$ i $1 + 5$).", { figure: F14 })],
  [
    "14.4",
    choice("14.4", 2, {
      prompt: `${F14_INTRO}\n\nFunkcje kwadratowe $g$ oraz $h$ są określone za pomocą funkcji $f$ (rysunek) następująco: $g(x) = f(x + 3)$, $h(x) = f(-x)$.\n\nNa rysunkach A–F przedstawiono fragmenty wykresów różnych funkcji – w tym fragment wykresu funkcji $g$ oraz fragment wykresu funkcji $h$.\n\nUzupełnij tabelę. Każdej z funkcji $g$ oraz $h$ przyporządkuj fragment jej wykresu.`,
      figure: F14,
      options: OPTIONS_144,
      blanks: [
        { label: "Fragment wykresu funkcji $y = g(x)$ – rysunek", answer: ["A"] },
        { label: "Fragment wykresu funkcji $y = h(x)$ – rysunek", answer: ["E"] },
      ],
      explanation: "$g(x) = f(x + 3)$ – wykres $f$ przesunięty o $3$ w lewo: wierzchołek $(-2, 9)$ (A). $h(x) = f(-x)$ – odbicie względem osi $Oy$: wierzchołek $(-1, 9)$ (E).",
    }),
  ],
  [
    "15",
    truefalse(
      "15",
      "Ciąg $(a_n)$ jest określony wzorem $a_n = (-1)^n \\cdot (n - 5)$ dla każdej liczby naturalnej $n \\ge 1$.",
      "Pierwszy wyraz ciągu $(a_n)$ jest dwa razy większy od trzeciego wyrazu tego ciągu.",
      "Wszystkie wyrazy ciągu $(a_n)$ są dodatnie.",
      "B",
      "$a_1 = 4$, $a_3 = 2$ (P); $a_5 = 0$ – nie jest dodatni (F).",
    ),
  ],
  [
    "16",
    choice("16", 1, {
      prompt: "Trzywyrazowy ciąg $(12, 6, 2m - 1)$ jest geometryczny.\n\nDokończ zdanie. Wybierz odpowiedź A albo B oraz odpowiedź 1., 2. albo 3.\n\nTen ciąg jest … oraz …",
      options: [
        { key: "A", text: "rosnący" },
        { key: "B", text: "malejący" },
        { key: "1", text: "$m = \\frac{1}{2}$" },
        { key: "2", text: "$m = 2$" },
        { key: "3", text: "$m = 3$" },
      ],
      blanks: [
        { label: "Ten ciąg jest", answer: ["B"], keys: ["A", "B"] },
        { label: "oraz", answer: ["2"], keys: ["1", "2", "3"] },
      ],
      allOrNothing: true,
      explanation: "$q = \\frac{6}{12} = \\frac{1}{2}$, więc trzeci wyraz to $3 = 2m - 1$, czyli $m = 2$; wyrazy $12, 6, 3$ – ciąg malejący.",
    }),
  ],
  [
    "17",
    open(
      "17",
      "Ciąg arytmetyczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. Trzeci wyraz tego ciągu jest równy $(-1)$, a suma piętnastu początkowych kolejnych wyrazów tego ciągu jest równa $(-165)$.\n\nOblicz różnicę tego ciągu. Zapisz obliczenia.",
      ["-2"],
      ["Układ: $a_1 + 2r = -1$ oraz $\\frac{2a_1 + 14r}{2} \\cdot 15 = -165$.", "$a_1 + 7r = -11$, więc $5r = -10$ i $r = -2$."],
      { answerLabel: "r =" },
    ),
  ],
  [
    "18",
    choice("18", 2, {
      prompt: "W kartezjańskim układzie współrzędnych $(x, y)$ zaznaczono kąt o mierze $\\alpha$ taki, że $\\operatorname{tg}\\alpha = -3$ oraz $90° < \\alpha < 180°$ (zobacz rysunek).\n\nUzupełnij zdanie. Wybierz dwie właściwe odpowiedzi spośród oznaczonych literami A–F.\n\nPrawdziwe są zależności: … oraz …",
      figure: F18,
      options: [
        { key: "A", text: "$\\sin\\alpha < 0$" },
        { key: "B", text: "$\\sin\\alpha \\cdot \\cos\\alpha < 0$" },
        { key: "C", text: "$\\sin\\alpha \\cdot \\cos\\alpha > 0$" },
        { key: "D", text: "$\\cos\\alpha > 0$" },
        { key: "E", text: "$\\sin\\alpha = -\\frac{1}{3}\\cos\\alpha$" },
        { key: "F", text: "$\\sin\\alpha = -3\\cos\\alpha$" },
      ],
      blanks: [{ label: "Prawdziwe są zależności", answer: ["B", "F"] }],
      explanation: "W II ćwiartce $\\sin\\alpha > 0$ i $\\cos\\alpha < 0$, więc $\\sin\\alpha \\cdot \\cos\\alpha < 0$ (B); z $\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha} = -3$ wynika $\\sin\\alpha = -3\\cos\\alpha$ (F).",
    }),
  ],
  ["19", closed("19", `${FINISH}\n\nLiczba $\\sin^3 20° + \\cos^2 20° \\cdot \\sin 20°$ jest równa`, ["$\\cos 20°$", "$\\sin 20°$", "$\\operatorname{tg} 20°$", "$\\sin 20° \\cdot \\cos 20°$"], "B", "$\\sin 20°\\,(\\sin^2 20° + \\cos^2 20°) = \\sin 20°$.")],
  [
    "20",
    closed(
      "20",
      `Dany jest trójkąt $KLM$, w którym $|KM| = a$, $|LM| = b$ oraz $a \\ne b$. Dwusieczna kąta $KML$ przecina bok $KL$ w punkcie $N$ takim, że $|KN| = c$, $|NL| = d$ oraz $|MN| = e$ (zobacz rysunek).\n\n${FINISH}\n\nW trójkącie $KLM$ prawdziwa jest równość`,
      ["$a \\cdot b = c \\cdot d$", "$a \\cdot d = b \\cdot c$", "$a \\cdot c = b \\cdot d$", "$a \\cdot b = e \\cdot e$"],
      "B",
      "Twierdzenie o dwusiecznej: $\\frac{c}{d} = \\frac{a}{b}$, czyli $a \\cdot d = b \\cdot c$.",
      { figure: F20 },
    ),
  ],
  ["21", closed("21", `Dany jest równoległobok o bokach długości $3$ i $4$ oraz o kącie między nimi o mierze $120°$.\n\n${FINISH}\n\nPole tego równoległoboku jest równe`, ["$12$", "$12\\sqrt{3}$", "$6$", "$6\\sqrt{3}$"], "D", "$P = 3 \\cdot 4 \\cdot \\sin 120° = 12 \\cdot \\frac{\\sqrt{3}}{2} = 6\\sqrt{3}$.")],
  [
    "22",
    closed(
      "22",
      `W trójkącie $ABC$, wpisanym w okrąg o środku w punkcie $S$, kąt $ACB$ ma miarę $42°$ (zobacz rysunek).\n\n${FINISH}\n\nMiara kąta ostrego $BAS$ jest równa`,
      ["$42°$", "$45°$", "$48°$", "$69°$"],
      "C",
      "Kąt środkowy $ASB = 84°$, trójkąt $ASB$ jest równoramienny: $|\\angle BAS| = \\frac{180° - 84°}{2} = 48°$.",
      { figure: F22 },
    ),
  ],
  [
    "23",
    closed(
      "23",
      `W kartezjańskim układzie współrzędnych $(x, y)$ proste $k$ oraz $l$ są określone równaniami\n\n$k:\\ y = (m + 1)x + 7$\n\n$l:\\ y = -2x + 7$\n\n${FINISH}\n\nProste $k$ oraz $l$ są prostopadłe, gdy liczba $m$ jest równa`,
      ["$\\left(-\\frac{1}{2}\\right)$", "$\\frac{1}{2}$", "$(-3)$", "$1$"],
      "A",
      "Prostopadłe: $(m + 1) \\cdot (-2) = -1$, więc $m + 1 = \\frac{1}{2}$ i $m = -\\frac{1}{2}$.",
    ),
  ],
  [
    "24",
    open(
      "24",
      "W kartezjańskim układzie współrzędnych $(x, y)$ dany jest równoległobok $ABCD$, w którym $A = (-2, 6)$ oraz $B = (10, 2)$. Przekątne $AC$ oraz $BD$ tego równoległoboku przecinają się w punkcie $P = (6, 7)$.\n\nOblicz długość boku $BC$ tego równoległoboku. Zapisz obliczenia.",
      ["√52"],
      ["$P$ jest środkiem $AC$, więc $C = (2 \\cdot 6 + 2,\\ 2 \\cdot 7 - 6) = (14, 8)$.", "$|BC| = \\sqrt{(14 - 10)^2 + (8 - 2)^2} = \\sqrt{52}$."],
      { answerLabel: "|BC| =" },
    ),
  ],
  ["25.1", closed("25.1", `${T25}\n\n${FINISH}\n\nPole jednej ściany bocznej tego graniastosłupa jest równe`, ["$36\\sqrt{10}$", "$60$", "$6\\sqrt{10}$", "$360$"], "C", "$6 \\cdot \\frac{a^2\\sqrt{3}}{4} = 15\\sqrt{3}$, więc $a^2 = 10$, $a = \\sqrt{10}$; ściana boczna: $6\\sqrt{10}$.", { figure: F25 })],
  [
    "25.2",
    choice("25.2", 1, {
      prompt: `${T25}\n\n${FINISH}\n\nKąt nachylenia najdłuższej przekątnej graniastosłupa prawidłowego sześciokątnego do płaszczyzny podstawy jest zaznaczony na rysunku\n\n(Rysunki A–D z arkusza CKE.)`,
      options: (["A", "B", "C", "D"] as const).map((key) => ({ key, image: `/cke/2024-maj/25-2-${key}.png` })),
      blanks: [{ answer: ["D"] }],
      explanation: "Najdłuższa przekątna łączy przeciwległe wierzchołki; jej rzut na podstawę to najdłuższa przekątna sześciokąta wychodząca z tego samego wierzchołka – kąt między nimi zaznaczono na rysunku D.",
    }),
  ],
  [
    "26",
    open(
      "26",
      "Ostrosłup $F_1$ jest podobny do ostrosłupa $F_2$. Objętość ostrosłupa $F_1$ jest równa $64$. Objętość ostrosłupa $F_2$ jest równa $512$.\n\nUzupełnij poniższe zdanie. Wpisz odpowiednią liczbę.\n\nStosunek pola powierzchni całkowitej ostrosłupa $F_2$ do pola powierzchni całkowitej ostrosłupa $F_1$ jest równy …",
      ["4"],
      ["Stosunek objętości $8 = k^3$, więc skala $k = 2$, a stosunek pól $k^2 = 4$."],
      { format: "short" },
    ),
  ],
  ["27", closed("27", `Rozważamy wszystkie kody czterocyfrowe utworzone tylko z cyfr $1$, $3$, $6$, $8$, przy czym w każdym kodzie każda z tych cyfr występuje dokładnie jeden raz.\n\n${FINISH}\n\nLiczba wszystkich takich kodów jest równa`, ["$4$", "$10$", "$24$", "$16$"], "C", "Permutacje czterech cyfr: $4! = 24$.")],
  ["28", closed("28", `Średnia arytmetyczna trzech liczb: $a$, $b$, $c$, jest równa $9$.\n\n${FINISH}\n\nŚrednia arytmetyczna sześciu liczb: $a, a, b, b, c, c$, jest równa`, ["$9$", "$6$", "$4{,}5$", "$18$"], "A", "$\\frac{2(a + b + c)}{6} = \\frac{a + b + c}{3} = 9$.")],
  [
    "29",
    closed(
      "29",
      `Na diagramie przedstawiono wyniki sprawdzianu z matematyki w pewnej klasie maturalnej. Na osi poziomej podano oceny, które uzyskali uczniowie tej klasy, a na osi pionowej podano liczbę uczniów, którzy otrzymali daną ocenę.\n\n${FINISH}\n\nMediana ocen uzyskanych z tego sprawdzianu przez uczniów tej klasy jest równa`,
      ["$4{,}5$", "$4$", "$3{,}5$", "$3$"],
      "C",
      "Liczebności ocen $1$–$6$: $2, 7, 4, 3, 6, 4$ – razem $26$. Mediana to średnia $13.$ i $14.$ oceny: $\\frac{3 + 4}{2} = 3{,}5$.",
      { figure: F29 },
    ),
  ],
  [
    "30",
    open(
      "30",
      "Dany jest pięcioelementowy zbiór $K = \\{5, 6, 7, 8, 9\\}$. Wylosowanie każdej liczby z tego zbioru jest jednakowo prawdopodobne. Ze zbioru $K$ losujemy ze zwracaniem kolejno dwa razy po jednej liczbie i zapisujemy je w kolejności losowania.\n\nOblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że suma wylosowanych liczb jest liczbą parzystą. Zapisz obliczenia.",
      ["13/25"],
      ["$|\\Omega| = 5 \\cdot 5 = 25$.", "Suma parzysta: obie parzyste ($2 \\cdot 2 = 4$) albo obie nieparzyste ($3 \\cdot 3 = 9$), $|A| = 13$, więc $P(A) = \\frac{13}{25}$."],
    ),
  ],
  [
    "31",
    open(
      "31",
      "W schronisku dla zwierząt, na płaskiej powierzchni, należy zbudować ogrodzenie z siatki wydzielające trzy identyczne wybiegi o wspólnych ścianach wewnętrznych. Podstawą każdego z tych trzech wybiegów jest prostokąt (jak pokazano na rysunku). Do wykonania tego ogrodzenia należy zużyć $36$ metrów bieżących siatki.\n\nSchematyczny rysunek trzech wybiegów (widok z góry). Linią przerywaną zaznaczono siatkę.\n\nOblicz wymiary $x$ oraz $y$ jednego wybiegu, przy których suma pól podstaw tych trzech wybiegów będzie największa. W obliczeniach pomiń szerokość wejścia na każdy z wybiegów. Zapisz obliczenia.\n\n(W aplikacji wpisz $x$ i $y$ w metrach, oddzielone średnikiem.)",
      ["9/2; 3"],
      [
        "Długość siatki: $4x + 6y = 36$.",
        "Suma pól w zależności od jednej zmiennej, np. $P(x) = 3xy = x(18 - 2x)$.",
        "Wierzchołek paraboli (ramiona w dół): $x = 4{,}5$ m – tu pole jest największe.",
        "$y = \\frac{36 - 4 \\cdot 4{,}5}{6} = 3$ m.",
      ],
      { answerLabel: "x;\\ y =", figure: F31 },
    ),
  ],
];

export const CKE_2024_MAJ: ExamSheet = {
  id: "cke-2024-maj",
  kind: "cke",
  year: 2024,
  session: "maj",
  title: "Matura maj 2024",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy",
  level: "podstawowy",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2405-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_podstawowy/MMAP-P0-100-2405-zasady.pdf",
  },
};
