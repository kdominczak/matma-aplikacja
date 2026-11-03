import type { PracticeTask } from "@/data/topics";
import type { ChoiceQuestion, ExamSheet, ExamTask } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, 8 maja 2023 (formuła 2023, 46 pkt, 180 min) – arkusz MMAP-P0-100.
// Treść przepisana z PDF CKE, klucz (wersja A) i schematy punktowania z „Zasad oceniania” (termin główny 2023).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Różnice wobec papieru: rysunki odtworzone z danych zadania (nie skany); kilka wyników po średniku (26, 31.2);
// zadania otwarte – schemat CKE jako kolejne kroki po 1 pkt.

const LABEL = "Matura CKE · maj 2023";
const TF_PROMPT = "Oceń prawdziwość poniższych stwierdzeń. Wybierz P, jeśli stwierdzenie jest prawdziwe, albo F – jeśli jest fałszywe.";
const TF_OPTIONS: [string, string, string, string] = ["1. P · 2. P", "1. P · 2. F", "1. F · 2. P", "1. F · 2. F"];
const FINISH = "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.";
const id = (n: string) => `cke-2023-maj-${n}`;

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

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id: id(n), difficulty: "sredni", points: solution.length, task: { id: id(n), label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

function choice(n: string, points: number, q: Omit<ChoiceQuestion, "id" | "label">): ExamTask {
  return { kind: "choice", id: id(n), difficulty: "sredni", points, choice: { id: id(n), label: LABEL, ...q } };
}

const sys = (a: string, b: string) => `$\\begin{cases} ${a} \\\\ ${b} \\end{cases}$`;

// ── Rysunki ──

// 1: (−∞, −2] ∪ [5, +∞) na osi liczbowej
const F1: Plot = {
  axes: false,
  x: [-4.6, 8.2],
  y: [-1.2, 1.4],
  lines: [
    [
      [-4.5, 0],
      [8, 0],
    ],
  ],
  fills: [
    [
      [-4.5, 0],
      [-4.5, 0.8],
      [-2, 0.8],
      [-2, 0],
    ],
    [
      [5, 0],
      [5, 0.8],
      [7.6, 0.8],
      [7.6, 0],
    ],
  ],
  dots: [{ at: [-2, 0] }, { at: [5, 0] }],
  labels: [
    { at: [-2, -0.7], text: "−2" },
    { at: [5, -0.7], text: "5" },
    { at: [8, -0.7], text: "x" },
  ],
};

const F10: Plot = {
  x: [-5.5, 5.5],
  y: [-3.5, 5.5],
  lines: [
    [
      [-3.5, 5.5],
      [5.5, -3.5],
    ],
    [
      [-1.25, -3.5],
      [3.25, 5.5],
    ],
  ],
};

// 12: f stała 2 na [−6, −3), liniowa od (−3, −3) do (1, 1), potem od (1, 5) (bez) przez (2, 5) do (5, 3)
const F12: Plot = {
  x: [-6.5, 5.5],
  y: [-3.5, 5.5],
  lines: [
    [
      [-6, 2],
      [-3, 2],
    ],
    [
      [-3, -3],
      [1, 1],
    ],
    [
      [1, 5],
      [2, 5],
      [5, 3],
    ],
  ],
  dots: [{ at: [-6, 2] }, { at: [-3, 2], open: true }, { at: [-3, -3] }, { at: [1, 1] }, { at: [1, 5], open: true }, { at: [5, 3] }],
};

const F13: Plot = {
  x: [-1.5, 2.5],
  y: [-2.5, 2.5],
  lines: [
    [
      [-0.45, 2.5],
      [1.55, -2.5],
    ],
  ],
  labels: [{ at: [1.3, -1.2], text: "y = f(x)", anchor: "start" }],
};

const F18: Plot = {
  x: [-3.5, 2.5],
  y: [-1.5, 2.5],
  lines: [
    [
      [0, 0],
      [-3, 1],
    ],
    [
      [0, 0],
      [2.3, 0],
    ],
  ],
  dots: [{ at: [-3, 1] }],
  fills: [[[0, 0], ...Array.from({ length: 13 }, (_, i): Point => {
    const a = ((180 - (Math.atan(1 / 3) * 180) / Math.PI) * i * Math.PI) / (12 * 180);
    return [0.5 * Math.cos(a), 0.5 * Math.sin(a)];
  })]],
  labels: [
    { at: [-3, 1.45], text: "P = (−3, 1)" },
    { at: [0.35, 0.6], text: "α" },
    { at: [-0.25, -0.35], text: "O" },
  ],
};

// 21: okrąg o środku O; łuk AC = 40° → kąt ACO = 70°, kąt ABC = 20°
const on = (deg: number): Point => [3 * Math.cos((deg * Math.PI) / 180), 3 * Math.sin((deg * Math.PI) / 180)];
const [A21, C21, B21] = [on(250), on(290), on(30)];
const F21: Plot = {
  axes: false,
  x: [-3.6, 3.8],
  y: [-3.7, 3.6],
  lines: [Array.from({ length: 73 }, (_, i) => on(i * 5)), [A21, [0, 0], C21, A21, B21, C21]],
  dots: [{ at: [0, 0] }],
  labels: [
    { at: [A21[0] - 0.2, A21[1] - 0.35], text: "A" },
    { at: [C21[0] + 0.35, C21[1] - 0.1], text: "C" },
    { at: [B21[0] + 0.3, B21[1] + 0.2], text: "B" },
    { at: [0, 0.4], text: "O" },
    { at: [C21[0] - 0.55, C21[1] + 0.55], text: "70°" },
  ],
};

// 26: ostrosłup prawidłowy czworokątny – wysokość ściany bocznej 6 nachylona pod kątem 30°
const base: Point[] = [
  [0, 0],
  [6, 0],
  [8, 2],
  [2, 2],
];
const apex: Point = [4, 5];
const midFront: Point = [3, 0];
const center: Point = [4, 1];
const F26: Plot = {
  axes: false,
  x: [-0.6, 8.6],
  y: [-0.7, 5.6],
  lines: [[base[0], base[1], base[2]], [base[0], apex, base[1]], [apex, base[2]], [apex, midFront]],
  guides: [[base[0], base[3], base[2]], [apex, base[3]], [apex, center, midFront]],
  labels: [
    { at: [3.1, 2.4], text: "6", anchor: "end" },
    { at: [3.65, 0.45], text: "30°" },
  ],
};

// 29: ceny pomidorów – 2, 4, 2, 5, 3 sklepy
const PRICES = ["5,05", "5,60", "5,70", "6,00", "6,30"];
const SHOPS = [2, 4, 2, 5, 3];
const F29: Plot = {
  axes: false,
  x: [-1.6, 6],
  y: [-1.4, 6.6],
  lines: [
    [
      [0, 6.2],
      [0, 0],
      [5.8, 0],
    ],
  ],
  fills: SHOPS.map((c, i): Point[] => [
    [i + 0.75, 0],
    [i + 0.75, c],
    [i + 1.25, c],
    [i + 1.25, 0],
  ]),
  labels: [
    ...PRICES.map((p, i) => ({ at: [i + 1, -0.6] as Point, text: p })),
    ...[0, 1, 2, 3, 4, 5, 6].map((v) => ({ at: [-0.3, v] as Point, text: String(v), anchor: "end" as const })),
    { at: [3, -1.25], text: "cena za 1 kg pomidorów (w zł)" },
    { at: [0.2, 6.35], text: "liczba sklepów", anchor: "start" },
  ],
};

const F12_INTRO = "W kartezjańskim układzie współrzędnych $(x, y)$ narysowano wykres funkcji $y = f(x)$ (zobacz rysunek).";
const T31 =
  "Właściciel pewnej apteki przeanalizował dane dotyczące liczby obsługiwanych klientów z $30$ kolejnych dni. Przyjmijmy, że liczbę $L$ obsługiwanych klientów $n$-tego dnia opisuje funkcja\n\n$L(n) = -n^2 + 22n + 279$\n\ngdzie $n$ jest liczbą naturalną spełniającą warunki $n \\ge 1$ i $n \\le 30$.";

const TASKS: [number: string, task: ExamTask][] = [
  [
    "1",
    closed(
      "1",
      `Na osi liczbowej zaznaczono sumę przedziałów.\n\n${FINISH}\n\nZbiór zaznaczony na osi jest zbiorem wszystkich rozwiązań nierówności`,
      ["$|x - 3{,}5| \\ge 1{,}5$", "$|x - 1{,}5| \\ge 3{,}5$", "$|x - 3{,}5| \\le 1{,}5$", "$|x - 1{,}5| \\le 3{,}5$"],
      "B",
      "Zaznaczono $(-\\infty, -2] \\cup [5, +\\infty)$ – liczby odległe od środka $1{,}5$ o co najmniej $3{,}5$: $|x - 1{,}5| \\ge 3{,}5$.",
      { figure: F1 },
    ),
  ],
  [
    "2",
    closed("2", `${FINISH}\n\nLiczba $\\sqrt[3]{-\\frac{27}{16}} \\cdot \\sqrt[3]{2}$ jest równa`, ["$\\left(-\\frac{3}{2}\\right)$", "$\\frac{3}{2}$", "$\\frac{2}{3}$", "$\\left(-\\frac{2}{3}\\right)$"], "A", "$\\sqrt[3]{-\\frac{27}{16} \\cdot 2} = \\sqrt[3]{-\\frac{27}{8}} = -\\frac{3}{2}$."),
  ],
  [
    "3",
    open(
      "3",
      "Wykaż, że dla każdej liczby naturalnej $n \\ge 1$ liczba $(2n + 1)^2 - 1$ jest podzielna przez $8$.",
      [],
      ["$(2n + 1)^2 - 1 = 4n^2 + 4n = 4n(n + 1)$.", "Z dwóch kolejnych liczb $n$, $n + 1$ jedna jest parzysta, więc $n(n + 1)$ jest parzyste i $4n(n + 1)$ dzieli się przez $8$."],
      { format: "proof" },
    ),
  ],
  ["4", closed("4", `${FINISH}\n\nLiczba $\\log_9 27 + \\log_9 3$ jest równa`, ["$81$", "$9$", "$4$", "$2$"], "D", "$\\log_9 (27 \\cdot 3) = \\log_9 81 = 2$.")],
  ["5", closed("5", `${FINISH}\n\nDla każdej liczby rzeczywistej $a$ wyrażenie $(2a - 3)^2 - (2a + 3)^2$ jest równe`, ["$-24a$", "$0$", "$18$", "$16a^2 - 24a$"], "A", "$(4a^2 - 12a + 9) - (4a^2 + 12a + 9) = -24a$.")],
  [
    "6",
    closed(
      "6",
      `${FINISH}\n\nZbiorem wszystkich rozwiązań nierówności\n\n$-2(x + 3) \\le \\frac{2 - x}{3}$\n\njest przedział`,
      ["$(-\\infty, -4]$", "$(-\\infty, 4]$", "$[-4, \\infty)$", "$[4, \\infty)$"],
      "C",
      "$-6x - 18 \\le 2 - x$, czyli $-5x \\le 20$ i $x \\ge -4$.",
    ),
  ],
  ["7", closed("7", `${FINISH}\n\nJednym z rozwiązań równania $\\sqrt{3}(x^2 - 2)(x + 3) = 0$ jest liczba`, ["$3$", "$2$", "$\\sqrt{3}$", "$\\sqrt{2}$"], "D", "Rozwiązania: $x = \\pm\\sqrt{2}$ oraz $x = -3$.")],
  [
    "8",
    closed(
      "8",
      `${FINISH}\n\nRównanie $\\frac{(x + 1)(x - 1)^2}{(x - 1)(x + 1)^2} = 0$ w zbiorze liczb rzeczywistych`,
      ["nie ma rozwiązania.", "ma dokładnie jedno rozwiązanie: $-1$.", "ma dokładnie jedno rozwiązanie: $1$.", "ma dokładnie dwa rozwiązania: $-1$ oraz $1$."],
      "A",
      "Licznik zeruje się dla $-1$ i $1$, ale obie liczby zerują też mianownik – są poza dziedziną.",
    ),
  ],
  [
    "9",
    open(
      "9",
      "Rozwiąż równanie\n\n$3x^3 - 2x^2 - 12x + 8 = 0$\n\nZapisz obliczenia.",
      ["-2; 2/3; 2"],
      ["Rozkład: $x^2(3x - 2) - 4(3x - 2) = (3x - 2)(x^2 - 4)$.", "Jedno rozwiązanie z rozkładu, np. $x = \\frac{2}{3}$.", "Wszystkie rozwiązania: $x = -2$, $x = \\frac{2}{3}$, $x = 2$."],
    ),
  ],
  [
    "10",
    closed(
      "10",
      `Na rysunku przedstawiono interpretację geometryczną w kartezjańskim układzie współrzędnych $(x, y)$ jednego z niżej zapisanych układów równań A–D.\n\n${FINISH}\n\nUkładem równań, którego interpretację geometryczną przedstawiono na rysunku, jest`,
      [sys("y = -x + 2", "y = -2x + 1"), sys("y = x - 2", "y = -2x - 1"), sys("y = x - 2", "y = 2x + 1"), sys("y = -x + 2", "y = 2x - 1")],
      "D",
      "Prosta malejąca przecina oś $Oy$ w $2$ ($y = -x + 2$), rosnąca – w $-1$ i ma współczynnik $2$ ($y = 2x - 1$).",
      { figure: F10 },
    ),
  ],
  [
    "11",
    choice("11", 2, {
      prompt:
        "Dany jest prostokąt o bokach długości $a$ i $b$, gdzie $a > b$. Obwód tego prostokąta jest równy $30$. Jeden z boków prostokąta jest o $5$ krótszy od drugiego.\n\nUzupełnij zdanie. Wybierz dwie właściwe odpowiedzi spośród oznaczonych literami A–F.\n\nZależności między długościami boków tego prostokąta zapisano w układach równań oznaczonych literami: … oraz …",
      options: [
        { key: "A", text: sys("2ab = 30", "a - b = 5") },
        { key: "B", text: sys("2a + b = 30", "a = 5b") },
        { key: "C", text: sys("2(a + b) = 30", "b = a - 5") },
        { key: "D", text: sys("2a + 2b = 30", "b = 5a") },
        { key: "E", text: sys("2a + 2b = 30", "a - b = 5") },
        { key: "F", text: sys("a + b = 30", "a = b + 5") },
      ],
      blanks: [{ label: "Układy równań", answer: ["C", "E"] }],
      explanation: "Obwód: $2a + 2b = 30$ (to samo co $2(a + b) = 30$), krótszy bok $b$ o $5$ mniejszy: $b = a - 5$, czyli $a - b = 5$ – układy C i E.",
    }),
  ],
  ["12.1", closed("12.1", `${F12_INTRO}\n\n${FINISH}\n\nDziedziną funkcji $f$ jest zbiór`, ["$[-6, 5]$", "$(-6, 5)$", "$(-3, 5]$", "$[-3, 5]$"], "A", "Wykres zaczyna się w pełnym punkcie $x = -6$ i kończy w pełnym punkcie $x = 5$ – bez przerw.", { figure: F12 })],
  ["12.2", closed("12.2", `${F12_INTRO}\n\n${FINISH}\n\nNajwiększa wartość funkcji $f$ w przedziale $[-4, 1]$ jest równa`, ["$0$", "$1$", "$2$", "$5$"], "C", "Na $[-4, -3)$ funkcja ma wartość $2$, na $[-3, 1]$ rośnie od $-3$ do $1$ – największa wartość to $2$.", { figure: F12 })],
  ["12.3", closed("12.3", `${F12_INTRO}\n\n${FINISH}\n\nFunkcja $f$ jest malejąca w zbiorze`, ["$[-6, -3)$", "$[-3, 1]$", "$(1, 2]$", "$[2, 5]$"], "D", "Od $x = 2$ do $x = 5$ wykres opada z $5$ do $3$.", { figure: F12 })],
  [
    "13",
    closed(
      "13",
      `Funkcja liniowa $f$ jest określona wzorem $f(x) = ax + b$, gdzie $a$ i $b$ są pewnymi liczbami rzeczywistymi. Na rysunku przedstawiono fragment wykresu funkcji $f$ w kartezjańskim układzie współrzędnych $(x, y)$.\n\n${FINISH}\n\nLiczba $a$ oraz liczba $b$ we wzorze funkcji $f$ spełniają warunki:`,
      ["$a > 0$ i $b > 0$.", "$a > 0$ i $b < 0$.", "$a < 0$ i $b > 0$.", "$a < 0$ i $b < 0$."],
      "C",
      "Funkcja maleje ($a < 0$), a wykres przecina oś $Oy$ powyżej zera ($b > 0$).",
      { figure: F13 },
    ),
  ],
  ["14", closed("14", `Jednym z miejsc zerowych funkcji kwadratowej $f$ jest liczba $(-5)$. Pierwsza współrzędna wierzchołka paraboli, będącej wykresem funkcji $f$, jest równa $3$.\n\n${FINISH}\n\nDrugim miejscem zerowym funkcji $f$ jest liczba`, ["$11$", "$1$", "$(-1)$", "$(-13)$"], "A", "Miejsca zerowe leżą symetrycznie względem $x = 3$: $3 + 8 = 11$.")],
  ["15", closed("15", `Ciąg $(a_n)$ jest określony wzorem $a_n = 2^n \\cdot (n + 1)$ dla każdej liczby naturalnej $n \\ge 1$.\n\n${FINISH}\n\nWyraz $a_4$ jest równy`, ["$64$", "$40$", "$48$", "$80$"], "D", "$a_4 = 2^4 \\cdot 5 = 80$.")],
  ["16", closed("16", `Trzywyrazowy ciąg $(27, 9, a - 1)$ jest geometryczny.\n\n${FINISH}\n\nLiczba $a$ jest równa`, ["$3$", "$0$", "$4$", "$2$"], "C", "$9^2 = 27(a - 1)$, więc $a - 1 = 3$ i $a = 4$.")],
  [
    "17",
    open(
      "17",
      "Pan Stanisław spłacił pożyczkę w wysokości $8910$ zł w osiemnastu ratach. Każda kolejna rata była mniejsza od poprzedniej o $30$ zł.\n\nOblicz kwotę pierwszej raty. Zapisz obliczenia.",
      ["750"],
      ["Raty tworzą ciąg arytmetyczny o różnicy $r = -30$: $\\frac{2a_1 + 17 \\cdot (-30)}{2} \\cdot 18 = 8910$.", "$2a_1 - 510 = 990$, więc $a_1 = 750$ zł."],
      { answerLabel: "a_1 =" },
    ),
  ],
  [
    "18",
    closed(
      "18",
      `W kartezjańskim układzie współrzędnych $(x, y)$ zaznaczono kąt $\\alpha$ o wierzchołku w punkcie $O = (0, 0)$. Jedno z ramion tego kąta pokrywa się z dodatnią półosią $Ox$, a drugie przechodzi przez punkt $P = (-3, 1)$ (zobacz rysunek).\n\n${FINISH}\n\nTangens kąta $\\alpha$ jest równy`,
      ["$\\frac{1}{\\sqrt{10}}$", "$\\left(-\\frac{3}{\\sqrt{10}}\\right)$", "$\\left(-\\frac{3}{1}\\right)$", "$\\left(-\\frac{1}{3}\\right)$"],
      "D",
      "$\\operatorname{tg}\\alpha = \\frac{y}{x} = \\frac{1}{-3} = -\\frac{1}{3}$.",
      { figure: F18 },
    ),
  ],
  [
    "19",
    closed(
      "19",
      `${FINISH}\n\nDla każdego kąta ostrego $\\alpha$ wyrażenie $\\sin^4\\alpha + \\sin^2\\alpha \\cdot \\cos^2\\alpha$ jest równe`,
      ["$\\sin^2\\alpha$", "$\\sin^6\\alpha \\cdot \\cos^2\\alpha$", "$\\sin^4\\alpha + 1$", "$\\sin^2\\alpha \\cdot (\\sin\\alpha + \\cos\\alpha) \\cdot (\\sin\\alpha - \\cos\\alpha)$"],
      "A",
      "$\\sin^2\\alpha\\,(\\sin^2\\alpha + \\cos^2\\alpha) = \\sin^2\\alpha$.",
    ),
  ],
  ["20", closed("20", `W rombie o boku długości $6\\sqrt{2}$ kąt rozwarty ma miarę $150°$.\n\n${FINISH}\n\nIloczyn długości przekątnych tego rombu jest równy`, ["$24$", "$72$", "$36$", "$36\\sqrt{2}$"], "B", "Pole rombu $(6\\sqrt{2})^2 \\cdot \\sin 150° = 36$, a iloczyn przekątnych to dwa pola: $72$.")],
  [
    "21",
    closed(
      "21",
      `Punkty $A$, $B$, $C$ leżą na okręgu o środku w punkcie $O$. Kąt $ACO$ ma miarę $70°$ (zobacz rysunek).\n\n${FINISH}\n\nMiara kąta ostrego $ABC$ jest równa`,
      ["$10°$", "$20°$", "$35°$", "$40°$"],
      "B",
      "Trójkąt $AOC$ jest równoramienny: $|\\angle AOC| = 180° - 2 \\cdot 70° = 40°$, a kąt wpisany $ABC$ to połowa: $20°$.",
      { figure: F21 },
    ),
  ],
  [
    "22",
    open(
      "22",
      "Trójkąty prostokątne $T_1$ i $T_2$ są podobne. Przyprostokątne trójkąta $T_1$ mają długości $5$ i $12$. Przeciwprostokątna trójkąta $T_2$ ma długość $26$.\n\nOblicz pole trójkąta $T_2$. Zapisz obliczenia.",
      ["120"],
      ["Przeciwprostokątna $T_1$ to $13$, skala podobieństwa $k = 2$: przyprostokątne $T_2$ to $10$ i $24$.", "$P_{T_2} = \\frac{1}{2} \\cdot 10 \\cdot 24 = 120$."],
    ),
  ],
  [
    "23",
    choice("23", 1, {
      prompt: "W kartezjańskim układzie współrzędnych $(x, y)$ dane są proste $k$ oraz $l$ o równaniach\n\n$k:\\ y = \\frac{2}{3}x$\n\n$l:\\ y = -\\frac{3}{2}x + 13$\n\nDokończ zdanie. Wybierz odpowiedź A albo B oraz odpowiedź 1., 2. albo 3.\n\nProste $k$ oraz $l$ … i przecinają się w punkcie $P$ o współrzędnych …",
      options: [
        { key: "A", text: "są prostopadłe" },
        { key: "B", text: "nie są prostopadłe" },
        { key: "1", text: "$(-6, -4)$" },
        { key: "2", text: "$(6, 4)$" },
        { key: "3", text: "$(-6, 4)$" },
      ],
      blanks: [
        { label: "Proste $k$ oraz $l$", answer: ["A"], keys: ["A", "B"] },
        { label: "Punkt $P$", answer: ["2"], keys: ["1", "2", "3"] },
      ],
      allOrNothing: true,
      explanation: "$\\frac{2}{3} \\cdot \\left(-\\frac{3}{2}\\right) = -1$ – proste są prostopadłe; $\\frac{2}{3}x = -\\frac{3}{2}x + 13$ daje $x = 6$, $y = 4$.",
    }),
  ],
  [
    "24",
    closed(
      "24",
      `W kartezjańskim układzie współrzędnych $(x, y)$ dana jest prosta $k$ o równaniu $y = -\\frac{1}{3}x + 2$.\n\n${FINISH}\n\nProsta o równaniu $y = ax + b$ jest równoległa do prostej $k$ i przechodzi przez punkt $P = (3, 5)$, gdy`,
      ["$a = 3$ i $b = 4$.", "$a = -\\frac{1}{3}$ i $b = 4$.", "$a = 3$ i $b = -4$.", "$a = -\\frac{1}{3}$ i $b = 6$."],
      "D",
      "Równoległa: $a = -\\frac{1}{3}$; przez $P$: $5 = -1 + b$, więc $b = 6$.",
    ),
  ],
  [
    "25",
    closed(
      "25",
      `Dany jest graniastosłup prawidłowy czworokątny, w którym krawędź podstawy ma długość $15$. Przekątna graniastosłupa jest nachylona do płaszczyzny podstawy pod kątem $\\alpha$ takim, że $\\cos\\alpha = \\frac{\\sqrt{2}}{3}$.\n\n${FINISH}\n\nDługość przekątnej tego graniastosłupa jest równa`,
      ["$15\\sqrt{2}$", "$45$", "$5\\sqrt{2}$", "$10$"],
      "B",
      "Przekątna podstawy $15\\sqrt{2}$, a $\\cos\\alpha = \\frac{15\\sqrt{2}}{d} = \\frac{\\sqrt{2}}{3}$, więc $d = 45$.",
    ),
  ],
  [
    "26",
    open(
      "26",
      "Dany jest ostrosłup prawidłowy czworokątny. Wysokość ściany bocznej tego ostrosłupa jest nachylona do płaszczyzny podstawy pod kątem $30°$ i ma długość równą $6$ (zobacz rysunek).\n\nOblicz objętość i pole powierzchni całkowitej tego ostrosłupa. Zapisz obliczenia.\n\n(W aplikacji wpisz objętość i pole, oddzielone średnikiem.)",
      ["108; 108+72√3"],
      [
        "Krawędź podstawy: $\\frac{a}{2} = 6\\cos 30° = 3\\sqrt{3}$, więc $a = 6\\sqrt{3}$.",
        "Wysokość ostrosłupa: $H = 6\\sin 30° = 3$.",
        "$V = \\frac{1}{3} \\cdot (6\\sqrt{3})^2 \\cdot 3 = 108$.",
        "$P_c = 108 + 4 \\cdot \\frac{1}{2} \\cdot 6\\sqrt{3} \\cdot 6 = 108 + 72\\sqrt{3}$.",
      ],
      { answerLabel: "V;\\ P_c =", figure: F26 },
    ),
  ],
  [
    "27",
    closed(
      "27",
      `W pewnym ostrosłupie prawidłowym stosunek liczby $W$ wszystkich wierzchołków do liczby $K$ wszystkich krawędzi jest równy $\\frac{W}{K} = \\frac{3}{5}$.\n\n${FINISH}\n\nPodstawą tego ostrosłupa jest`,
      ["kwadrat.", "pięciokąt foremny.", "sześciokąt foremny.", "siedmiokąt foremny."],
      "B",
      "Ostrosłup o podstawie $n$-kąta: $W = n + 1$, $K = 2n$; $\\frac{n + 1}{2n} = \\frac{3}{5}$ daje $n = 5$.",
    ),
  ],
  ["28", closed("28", `${FINISH}\n\nWszystkich liczb naturalnych pięciocyfrowych, w których zapisie dziesiętnym występują tylko cyfry $0, 5, 7$ (np. $57\\,075$, $55\\,555$), jest`, ["$5^3$", "$2 \\cdot 4^3$", "$2 \\cdot 3^4$", "$3^5$"], "C", "Pierwsza cyfra: $5$ albo $7$ (2 sposoby), pozostałe cztery – dowolna z trzech: $2 \\cdot 3^4$.")],
  [
    "29",
    choice("29", 2, {
      prompt: "Na diagramie poniżej przedstawiono ceny pomidorów w szesnastu wybranych sklepach.\n\nUzupełnij tabelę. Wpisz w każdą pustą komórkę tabeli właściwą odpowiedź, wybraną spośród oznaczonych literami A–E.",
      figure: F29,
      options: [
        { key: "A", text: "$5{,}80$ zł" },
        { key: "B", text: "$5{,}73$ zł" },
        { key: "C", text: "$5{,}85$ zł" },
        { key: "D", text: "$6{,}00$ zł" },
        { key: "E", text: "$5{,}70$ zł" },
      ],
      blanks: [
        { label: "29.1. Mediana ceny kilograma pomidorów w tych wybranych sklepach jest równa", answer: ["C"] },
        { label: "29.2. Średnia cena kilograma pomidorów w tych wybranych sklepach jest równa", answer: ["A"] },
      ],
      explanation: "Mediana – średnia $8.$ i $9.$ ceny: $\\frac{5{,}70 + 6{,}00}{2} = 5{,}85$ zł. Średnia: $\\frac{2 \\cdot 5{,}05 + 4 \\cdot 5{,}60 + 2 \\cdot 5{,}70 + 5 \\cdot 6{,}00 + 3 \\cdot 6{,}30}{16} = \\frac{92{,}80}{16} = 5{,}80$ zł.",
    }),
  ],
  [
    "30",
    open(
      "30",
      "Ze zbioru ośmiu liczb $\\{2, 3, 4, 5, 6, 7, 8, 9\\}$ losujemy ze zwracaniem kolejno dwa razy po jednej liczbie.\n\nOblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że iloczyn wylosowanych liczb jest podzielny przez $15$. Zapisz obliczenia.",
      ["6/64"],
      ["$|\\Omega| = 8 \\cdot 8 = 64$.", "Iloczyn podzielny przez $15$: jedna liczba to $5$, druga – $3$, $6$ albo $9$, w dowolnej kolejności: $|A| = 6$, więc $P(A) = \\frac{6}{64}$."],
    ),
  ],
  [
    "31.1",
    closed(
      "31.1",
      `${T31}\n\n${TF_PROMPT}\n\n1. Łączna liczba klientów obsłużonych w czasie wszystkich analizowanych dni jest równa $L(30)$.\n\n2. W trzecim dniu analizowanego okresu obsłużono $336$ klientów.`,
      TF_OPTIONS,
      "C",
      "$L(30)$ to liczba klientów tylko trzydziestego dnia, nie suma (F); $L(3) = -9 + 66 + 279 = 336$ (P).",
      { truefalse: true },
    ),
  ],
  [
    "31.2",
    open(
      "31.2",
      `${T31}\n\nKtórego dnia analizowanego okresu w aptece obsłużono największą liczbę klientów? Oblicz liczbę klientów obsłużonych tego dnia. Zapisz obliczenia.\n\n(W aplikacji wpisz numer dnia i liczbę klientów, oddzielone średnikiem.)`,
      ["11; 400"],
      ["Postać kanoniczna: $L(n) = -(n - 11)^2 + 400$ (albo wierzchołek $n = \\frac{-22}{-2} = 11$).", "Największa liczba klientów jedenastego dnia: $L(11) = 400$."],
      { answerLabel: "n;\\ L =" },
    ),
  ],
];

export const CKE_2023_MAJ: ExamSheet = {
  id: "cke-2023-maj",
  kind: "cke",
  year: 2023,
  session: "maj",
  title: "Matura maj 2023",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy",
  level: "podstawowy",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2023/Matematyka/poziom_podstawowy/MMAP-P0-100-2305-zasady.pdf",
  },
};
