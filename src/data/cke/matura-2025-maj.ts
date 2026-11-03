import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, 6 maja 2025 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-P0-100, wersja A.
// Treść przepisana z PDF CKE, klucz i schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2025).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Różnice wobec papieru (wymuszone przez aplikację, opisane uczniowi w treści):
// – zad. 6: rysunki zbiorów na osi liczbowej zapisane jako przedziały,
// – zad. 11 i 30 (kilka luk): każda luka to osobna pozycja za 1 pkt (11.1–11.4, 30.1–30.2) – tak samo punktuje CKE,
// – zad. 12.1: do sprawdzenia automatycznego uczeń wpisuje współczynnik a postaci kanonicznej,
// – zadania otwarte: schemat CKE (poziomy „1 pkt – …, 2 pkt – …”) zapisany jako kolejne kroki po 1 pkt.
// Rysunki odtworzone z danych zadania (współrzędne z treści), nie skany.

const LABEL = "Matura CKE · maj 2025";
const TF_PROMPT = "Oceń prawdziwość poniższych stwierdzeń. Wybierz P, jeśli stwierdzenie jest prawdziwe, albo F – jeśli jest fałszywe.";
const TF_OPTIONS: Record<OptionKey, string> = { A: "1. P · 2. P", B: "1. P · 2. F", C: "1. F · 2. P", D: "1. F · 2. F" };
const FINISH = "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.";

function closed(
  n: string,
  prompt: string,
  options: [string, string, string, string],
  correct: OptionKey,
  explanation: string,
  extra: { figure?: OpenQuestion["figure"]; truefalse?: boolean } = {},
): PracticeTask {
  return {
    kind: "closed",
    id: `cke-2025-maj-${n}`,
    difficulty: "sredni",
    points: 1,
    question: {
      id: `cke-2025-maj-${n}`,
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

function truefalse(n: string, intro: string, s1: string, s2: string, correct: OptionKey, explanation: string, figure?: OpenQuestion["figure"]): PracticeTask {
  const options = Object.values(TF_OPTIONS) as [string, string, string, string];
  return closed(n, `${intro}\n\n${TF_PROMPT}\n\n1. ${s1}\n\n2. ${s2}`, options, correct, explanation, { figure, truefalse: true });
}

function open(
  n: string,
  prompt: string,
  answers: string[],
  solution: { step: string; points: number }[],
  extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {},
): PracticeTask {
  const points = solution.reduce((sum, s) => sum + s.points, 0);
  return {
    kind: "open",
    id: `cke-2025-maj-${n}`,
    difficulty: "sredni",
    points,
    task: { id: `cke-2025-maj-${n}`, label: LABEL, prompt, points, answers, solution, ...extra },
  };
}

// ── Rysunki ──

const F11 = {
  x: [-5.5, 5.5] as [number, number],
  y: [-5.5, 5.5] as [number, number],
  lines: [
    [
      [-4, 1],
      [-2, 3],
      [2, 3],
      [4, -3],
    ] as Point[],
  ],
  dots: [{ at: [-4, 1] as Point }, { at: [4, -3] as Point, open: true }],
  labels: [{ at: [1.2, 4] as Point, text: "y = f(x)", anchor: "start" as const }],
};

const parabola: Point[] = Array.from({ length: 33 }, (_, i) => {
  const x = -1 + i * 0.25;
  return [x, -((x - 3) ** 2) / 3 + 6];
});
const F12 = {
  x: [-2.5, 7.5] as [number, number],
  y: [-2.5, 7] as [number, number],
  lines: [parabola],
  dots: [{ at: [3, 6] as Point }, { at: [0, 3] as Point }],
  labels: [{ at: [4.6, 5.6] as Point, text: "y = f(x)", anchor: "start" as const }],
};

// 18: AD = 3 (połowa AB), z |CD| = 5 → |AC| = 4
const F18 = {
  axes: false,
  x: [-0.8, 6.8] as [number, number],
  y: [-0.9, 4.6] as [number, number],
  lines: [
    [
      [0, 0],
      [6, 0],
      [0, 4],
      [0, 0],
    ] as Point[],
    [
      [0, 4],
      [3, 0],
    ] as Point[],
    [
      [0, 0.4],
      [0.4, 0.4],
      [0.4, 0],
    ] as Point[],
  ],
  labels: [
    { at: [-0.35, -0.45] as Point, text: "A" },
    { at: [6.3, -0.45] as Point, text: "B" },
    { at: [-0.35, 4.2] as Point, text: "C" },
    { at: [3.3, 0.3] as Point, text: "D" },
    { at: [1.85, 2.35] as Point, text: "5" },
    { at: [3, -0.6] as Point, text: "6" },
    { at: [2.55, 0.35] as Point, text: "α" },
    { at: [5.1, 0.3] as Point, text: "β" },
  ],
};

// 19: okrąg o promieniu 3; C na górze, łuk AB (bez C) = 100° → kąt wpisany BCA = 50°
const polar = (deg: number, r = 3): Point => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
const [A19, B19, C19] = [polar(200), polar(300), polar(90)];
const F19 = {
  axes: false,
  x: [-3.6, 3.6] as [number, number],
  y: [-3.6, 3.7] as [number, number],
  lines: [
    Array.from({ length: 73 }, (_, i) => polar(i * 5)),
    [A19, B19, C19, A19],
    [A19, [0, 0] as Point, B19],
  ],
  dots: [{ at: [0, 0] as Point }],
  labels: [
    { at: [A19[0] - 0.35, A19[1]] as Point, text: "A" },
    { at: [B19[0] + 0.3, B19[1] - 0.25] as Point, text: "B" },
    { at: [0, 3.35] as Point, text: "C" },
    { at: [0.3, 0.3] as Point, text: "O" },
    { at: [-0.05, 1.95] as Point, text: "50°" },
  ],
};

// 20: |AC| = |BC| = 4, |AB| = 3; trójkąty ABC i BDA podobne → |BD| = 9/4
const H20 = Math.sqrt(16 - 2.25);
const D20: Point = [3 - (1.5 * 2.25) / 4, (H20 * 2.25) / 4];
const F20 = {
  axes: false,
  x: [-0.8, 3.8] as [number, number],
  y: [-0.8, 4.3] as [number, number],
  lines: [
    [
      [0, 0],
      [3, 0],
      [1.5, H20],
      [0, 0],
    ] as Point[],
    [[0, 0], D20] as Point[],
  ],
  labels: [
    { at: [-0.3, -0.4] as Point, text: "A" },
    { at: [3.3, -0.4] as Point, text: "B" },
    { at: [1.5, H20 + 0.3] as Point, text: "C" },
    { at: [D20[0] + 0.3, D20[1] + 0.1] as Point, text: "D" },
    { at: [0.45, 2] as Point, text: "4" },
    { at: [1.5, -0.55] as Point, text: "3" },
  ],
};

// 21: |AB| = 11, |BC| = 12, kąt ABC = 60° (rysunek w skali 1:2)
const F21 = {
  axes: false,
  x: [-0.8, 6.3] as [number, number],
  y: [-0.9, 5.8] as [number, number],
  lines: [
    [
      [0, 0],
      [5.5, 0],
      [2.5, 5.196],
      [0, 0],
    ] as Point[],
  ],
  labels: [
    { at: [-0.3, -0.4] as Point, text: "A" },
    { at: [5.8, -0.4] as Point, text: "B" },
    { at: [2.5, 5.5] as Point, text: "C" },
    { at: [2.75, -0.55] as Point, text: "11" },
    { at: [4.45, 2.75] as Point, text: "12" },
    { at: [4.75, 0.35] as Point, text: "60°" },
  ],
};

// 30: liczba uczniów z ocenami 1–6 (razem 24)
const COUNTS = [1, 3, 4, 4, 5, 7];
const F30 = {
  x: [0, 7.8] as [number, number],
  y: [0, 8.5] as [number, number],
  lines: [],
  fills: COUNTS.map((c, i): Point[] => [
    [i + 0.8, 0],
    [i + 0.8, c],
    [i + 1.2, c],
    [i + 1.2, 0],
  ]),
  axisNames: ["ocena", "liczba uczniów"] as [string, string],
};

// 31: prostopadłościan w rzucie ukośnym, krawędzie niewidoczne przerywane
const box: Record<string, Point> = {
  A: [0, 0],
  B: [3, 0],
  F: [3, 5],
  E: [0, 5],
  D: [1.3, 1.2],
  C: [4.3, 1.2],
  G: [4.3, 6.2],
  H: [1.3, 6.2],
};
const path = (names: string) => [...names].map((n) => box[n]);
const F31 = {
  axes: false,
  x: [-0.8, 5] as [number, number],
  y: [-0.9, 6.8] as [number, number],
  lines: [path("ABFEA"), path("BCGF"), path("EHG")],
  guides: [path("AD"), path("DC"), path("DH")],
  labels: [
    ...Object.entries(box).map(([text, [x, y]]) => ({
      at: [x + (x > 2 ? 0.3 : -0.3), y + (y > 2 ? 0.3 : -0.35)] as Point,
      text,
    })),
    { at: [1.5, -0.5] as Point, text: "x" },
    { at: [3.95, 0.45] as Point, text: "4" },
  ],
};

// ── Zadania ──

const F11_INTRO =
  "Funkcja $f$ jest określona następująco:\n\n$f(x) = x + 5$ dla $x \\in [-4, -2]$, $f(x) = 3$ dla $x \\in (-2, 2]$, $f(x) = -3x + 9$ dla $x \\in (2, 4)$.\n\nWykres funkcji $y = f(x)$ przedstawiono w kartezjańskim układzie współrzędnych $(x, y)$ na rysunku.\n\nUzupełnij zdanie. Wpisz odpowiedni przedział.";
const F12_INTRO =
  "W kartezjańskim układzie współrzędnych $(x, y)$ przedstawiono fragment paraboli, która jest wykresem funkcji kwadratowej $f$ (zobacz rysunek). Wierzchołek tej paraboli ma współrzędne $(3, 6)$. Ta parabola przecina oś $Oy$ w punkcie o współrzędnych $(0, 3)$.";
const C14_INTRO = "Ciąg $(a_n)$ jest określony następująco: $a_1 = 2$ oraz $a_{n+1} = 2a_n + 1$ dla każdej liczby naturalnej $n \\ge 1$.";
const T18_INTRO =
  "Dany jest trójkąt prostokątny $ABC$, w którym bok $BC$ jest przeciwprostokątną, przyprostokątna $AB$ ma długość $6$, a środkowa $CD$ ma długość $5$. Oznaczmy kąt $ADC$ przez $\\alpha$, natomiast kąt $ABC$ – przez $\\beta$ (zobacz rysunek).";
const T30_INTRO =
  "Na diagramie przedstawiono wyniki sprawdzianu z matematyki w pewnej klasie maturalnej liczącej $24$ uczniów. Na osi poziomej podano oceny, które uzyskali uczniowie tej klasy, a na osi pionowej podano liczbę uczniów, którzy otrzymali daną ocenę.\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.";

const TASKS: [number: string, task: PracticeTask][] = [
  [
    "1",
    closed("1", `${FINISH}\n\nLiczba $(\\sqrt{32} - \\sqrt{2})^2$ jest równa`, ["$16$", "$18$", "$30$", "$34$"], "B", "$\\sqrt{32} = 4\\sqrt{2}$, więc $(4\\sqrt{2} - \\sqrt{2})^2 = (3\\sqrt{2})^2 = 18$."),
  ],
  [
    "2",
    closed(
      "2",
      `${FINISH}\n\nLiczba $\\frac{5^{12} + 5^{13} + 5^{14}}{5^{12}}$ jest równa`,
      ["$30$", "$31$", "$5^{12}$", "$5^{27}$"],
      "B",
      "Dzielimy każdy składnik przez $5^{12}$: $1 + 5 + 25 = 31$.",
    ),
  ],
  [
    "3",
    closed(
      "3",
      `${FINISH}\n\nLiczba $\\log_3 108 - 2\\log_3 2$ jest równa`,
      ["$3$", "$9$", "$\\log_3 104$", "$2\\log_3 54$"],
      "A",
      "$2\\log_3 2 = \\log_3 4$, więc różnica to $\\log_3 \\frac{108}{4} = \\log_3 27 = 3$.",
    ),
  ],
  [
    "4",
    closed(
      "4",
      `${FINISH}\n\nDla każdej liczby rzeczywistej $x$ wartość wyrażenia $(3x + 2)^2 - (2x - 3)^2$ jest równa wartości wyrażenia`,
      ["$5x^2 - 5$", "$5x^2 + 13$", "$5x^2 + 24x - 5$", "$5x^2 + 24x - 13$"],
      "C",
      "$(9x^2 + 12x + 4) - (4x^2 - 12x + 9) = 5x^2 + 24x - 5$.",
    ),
  ],
  [
    "5",
    open(
      "5",
      "Wykaż, że dla każdej nieparzystej liczby naturalnej $n$ liczba $3n^2 + 2n + 7$ jest podzielna przez $4$.",
      [],
      [
        {
          step: "Zapis $n = 2l + 1$ i podstawienie: $3n^2 + 2n + 7 = 3(4l^2 + 4l + 1) + 2(2l + 1) + 7$ (albo inny rozkład na sumę liczb podzielnych przez $4$, w którym podzielność jednego składnika jest oczywista).",
          points: 1,
        },
        { step: "Przekształcenie do postaci $4(3l^2 + 4l + 3)$ – iloczyn $4$ i liczby całkowitej, więc liczba jest podzielna przez $4$.", points: 1 },
      ],
      { format: "proof" },
    ),
  ],
  [
    "6",
    closed(
      "6",
      "Dana jest nierówność\n\n$3 - 2(1 - 2x) \\ge 2x - 17$\n\nNa którym rysunku poprawnie zaznaczono na osi liczbowej zbiór wszystkich liczb rzeczywistych spełniających powyższą nierówność? Wybierz właściwą odpowiedź spośród podanych.\n\n(W aplikacji rysunki z osią liczbową zapisano jako przedziały.)",
      ["$(-\\infty, 3]$", "$[3, +\\infty)$", "$(-\\infty, -9]$", "$[-9, +\\infty)$"],
      "D",
      "$3 - 2 + 4x \\ge 2x - 17$, czyli $2x \\ge -18$, więc $x \\ge -9$.",
    ),
  ],
  [
    "7",
    closed(
      "7",
      `${FINISH}\n\nRównanie $2x(x + 3)(x^2 + 25) = 0$ w zbiorze liczb rzeczywistych ma dokładnie`,
      ["dwa rozwiązania: $(-3)$ oraz $0$.", "dwa rozwiązania: $(-3)$ oraz $2$.", "trzy rozwiązania: $(-5)$, $(-3)$ oraz $0$.", "cztery rozwiązania: $(-5)$, $(-3)$, $0$ oraz $5$."],
      "A",
      "$2x = 0$ daje $x = 0$, $x + 3 = 0$ daje $x = -3$, a $x^2 + 25 > 0$ dla każdego $x$ – nie ma pierwiastków.",
    ),
  ],
  [
    "8",
    closed(
      "8",
      `${FINISH}\n\nDla każdej liczby rzeczywistej $x$ różnej od $(-2)$ oraz różnej od $0$ wartość wyrażenia $\\frac{x^2 + x}{x^2 + 4x + 4} \\cdot \\frac{x + 2}{x}$ jest równa wartości wyrażenia`,
      ["$\\frac{x + 2}{4x + 4}$", "$\\frac{x + 1}{4x + 5}$", "$\\frac{x + 1}{x + 2}$", "$\\frac{2x}{x + 2}$"],
      "C",
      "$\\frac{x(x + 1)}{(x + 2)^2} \\cdot \\frac{x + 2}{x} = \\frac{x + 1}{x + 2}$.",
    ),
  ],
  [
    "9",
    open(
      "9",
      "Zarząd firmy wydzielił z budżetu kwotę $1\\,200\\,000$ złotych łącznie na projekty badawcze dla dwóch zespołów: A i B. W pierwszym półroczu realizacji tych projektów oba zespoły wykorzystały łącznie $146\\,700$ złotych – zespół A wykorzystał $13\\%$ przyznanych mu środków, a zespół B wykorzystał $11\\%$ przyznanych mu środków.\n\nOblicz kwotę przyznaną zespołowi A na realizację projektu badawczego. Zapisz obliczenia.",
      ["735000"],
      [
        { step: "Układ $x + y = 1\\,200\\,000$ oraz $0{,}13x + 0{,}11y = 146\\,700$ (albo równanie z jedną niewiadomą, np. $0{,}13x + 0{,}11(1\\,200\\,000 - x) = 146\\,700$).", points: 1 },
        { step: "$0{,}02x = 14\\,700$, więc zespół A dostał $735\\,000$ zł.", points: 1 },
      ],
    ),
  ],
  [
    "10",
    open(
      "10",
      "Rozwiąż nierówność\n\n$3(2x^2 + 1) < 11x$\n\nZapisz obliczenia.",
      ["(1/3, 3/2)"],
      [
        { step: "$6x^2 - 11x + 3 < 0$, pierwiastki trójmianu: $x_1 = \\frac{1}{3}$, $x_2 = \\frac{3}{2}$.", points: 1 },
        { step: "Ramiona paraboli w górę, więc $x \\in \\left(\\frac{1}{3}, \\frac{3}{2}\\right)$.", points: 1 },
      ],
    ),
  ],
  ...(
    [
      ["11.1", "Dziedziną funkcji $f$ jest przedział …", "[-4, 4)", "Dziedzina: $[-4, -2] \\cup (-2, 2] \\cup (2, 4) = [-4, 4)$."],
      ["11.2", "Zbiorem wartości funkcji $f$ jest przedział …", "(-3, 3]", "Największa wartość $3$, a przy $x \\to 4$ wartości zbliżają się do $-3$ (punkt $(4, -3)$ nie należy do wykresu): $(-3, 3]$."],
      ["11.3", "Zbiorem wszystkich argumentów, dla których funkcja $f$ przyjmuje wartości dodatnie, jest przedział …", "[-4, 3)", "$f(3) = 0$, a na lewo od $3$ wykres leży nad osią $Ox$: $[-4, 3)$."],
      ["11.4", "Zbiorem wszystkich rozwiązań równania $f(x) = 3$ jest przedział …", "[-2, 2]", "$f(x) = 3$ na $(-2, 2]$ i w $x = -2$ (bo $-2 + 5 = 3$): $[-2, 2]$."],
    ] as const
  ).map(([n, sentence, answer, step]): [string, PracticeTask] => [n, open(n, `${F11_INTRO}\n\n${sentence}`, [answer], [{ step, points: 1 }], { format: "short", figure: F11 })]),
  [
    "12.1",
    open(
      "12.1",
      `${F12_INTRO}\n\nWyznacz wzór funkcji $f$ w postaci kanonicznej. Zapisz obliczenia.\n\n(W aplikacji jako wynik wpisz współczynnik $a$ tej postaci.)`,
      ["-1/3"],
      [
        { step: "$f(x) = a(x - 3)^2 + 6$ i warunek $f(0) = 3$: $3 = a(0 - 3)^2 + 6$.", points: 1 },
        { step: "$9a = -3$, $a = -\\frac{1}{3}$, czyli $f(x) = -\\frac{1}{3}(x - 3)^2 + 6$.", points: 1 },
      ],
      { answerLabel: "a =", figure: F12 },
    ),
  ],
  ["12.2", closed("12.2", `${F12_INTRO}\n\n${FINISH}\n\nOsią symetrii wykresu funkcji $f$ jest prosta o równaniu`, ["$x = 3$", "$x = -3$", "$y = 6$", "$y = -6$"], "A", "Oś symetrii paraboli przechodzi przez wierzchołek $(3, 6)$ pionowo: $x = 3$.", { figure: F12 })],
  [
    "12.3",
    open(
      "12.3",
      `${F12_INTRO}\n\nFunkcja $g$ jest określona dla każdej liczby rzeczywistej $x$ wzorem $g(x) = f(x) - 3$. Liczby $x_1$ oraz $x_2$ są różnymi miejscami zerowymi funkcji $g$.\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.\n\nSuma $x_1 + x_2$ jest równa …`,
      ["6"],
      [{ step: "Wykres $g$ to wykres $f$ przesunięty o $3$ w dół – oś symetrii dalej $x = 3$, więc miejsca zerowe leżą symetrycznie: $x_1 + x_2 = 2 \\cdot 3 = 6$.", points: 1 }],
      { format: "short", figure: F12 },
    ),
  ],
  ["13", closed("13", `Funkcja liniowa $f$ jest określona wzorem $f(x) = (3 - m)x - 4$.\n\n${FINISH}\n\nFunkcja $f$ nie ma miejsca zerowego dla $m$ równego`, ["$(-3)$", "$0$", "$3$", "$4$"], "C", "Dla $m = 3$ funkcja jest stała: $f(x) = -4$ – nigdy nie przyjmuje wartości $0$.")],
  ["14.1", closed("14.1", `${C14_INTRO}\n\n${FINISH}\n\nTrzeci wyraz ciągu $(a_n)$ jest równy`, ["$4$", "$5$", "$7$", "$11$"], "D", "$a_2 = 2 \\cdot 2 + 1 = 5$, $a_3 = 2 \\cdot 5 + 1 = 11$.")],
  ["14.2", truefalse("14.2", C14_INTRO, "Ciąg $(a_n)$ jest arytmetyczny.", "Ciąg $(a_n)$ jest geometryczny.", "D", "Wyrazy $2, 5, 11$: różnice $3$ i $6$ – nie jest arytmetyczny; ilorazy $\\frac{5}{2}$ i $\\frac{11}{5}$ – nie jest geometryczny.")],
  [
    "15",
    open(
      "15",
      "Wyznacz wartość $m$, dla której trzywyrazowy ciąg\n\n$(2m + 11,\\ m^2 + 3,\\ 5 - m)$\n\njest arytmetyczny i malejący. Zapisz obliczenia.",
      ["5/2"],
      [
        { step: "Warunek ciągu arytmetycznego: $2(m^2 + 3) = (2m + 11) + (5 - m)$.", points: 1 },
        { step: "$2m^2 - m - 10 = 0$, więc $m = -2$ lub $m = \\frac{5}{2}$.", points: 1 },
        { step: "Dla $m = -2$ ciąg $(7, 7, 7)$ jest stały, dla $m = \\frac{5}{2}$: $(16;\\ 9{,}25;\\ 2{,}5)$ – malejący. Odpowiedź: $m = \\frac{5}{2}$.", points: 1 },
      ],
      { answerLabel: "m =" },
    ),
  ],
  [
    "16",
    closed(
      "16",
      `Dany jest ciąg geometryczny $(a_n)$ określony dla każdej liczby naturalnej $n \\ge 1$, w którym $a_1 = 27$ oraz $a_2 = 9$.\n\n${FINISH}\n\nCzwarty wyraz ciągu $(a_n)$ jest równy`,
      ["$\\frac{1}{3}$", "$1$", "$3$", "$729$"],
      "B",
      "$q = \\frac{9}{27} = \\frac{1}{3}$, $a_4 = 27 \\cdot \\left(\\frac{1}{3}\\right)^3 = 1$.",
    ),
  ],
  [
    "17",
    closed(
      "17",
      `Kąt $\\alpha$ jest ostry i spełnia warunek $\\sqrt{3}\\,\\operatorname{tg}\\alpha = 2\\sin\\alpha$.\n\n${FINISH}\n\nCosinus kąta $\\alpha$ jest równy`,
      ["$\\frac{1}{2}$", "$\\frac{\\sqrt{2}}{2}$", "$\\frac{\\sqrt{3}}{2}$", "$\\frac{\\sqrt{3}}{3}$"],
      "C",
      "$\\sqrt{3} \\cdot \\frac{\\sin\\alpha}{\\cos\\alpha} = 2\\sin\\alpha$ i $\\sin\\alpha \\ne 0$, więc $\\cos\\alpha = \\frac{\\sqrt{3}}{2}$.",
    ),
  ],
  ["18.1", closed("18.1", `${T18_INTRO}\n\n${FINISH}\n\nTangens kąta $\\alpha$ jest równy`, ["$\\frac{2}{3}$", "$\\frac{3}{4}$", "$\\frac{4}{5}$", "$\\frac{4}{3}$"], "D", "$|AD| = 3$, z Pitagorasa w $ADC$: $|AC| = 4$, więc $\\operatorname{tg}\\alpha = \\frac{|AC|}{|AD|} = \\frac{4}{3}$.", { figure: F18 })],
  [
    "18.2",
    closed(
      "18.2",
      `${T18_INTRO}\n\n${FINISH}\n\nSinus kąta $\\beta$ jest równy`,
      ["$\\frac{2}{\\sqrt{13}}$", "$\\frac{3}{\\sqrt{13}}$", "$\\frac{5}{2\\sqrt{13}}$", "$\\frac{4}{5}$"],
      "A",
      "$|AC| = 4$, $|BC| = \\sqrt{4^2 + 6^2} = \\sqrt{52} = 2\\sqrt{13}$, więc $\\sin\\beta = \\frac{4}{2\\sqrt{13}} = \\frac{2}{\\sqrt{13}}$.",
      { figure: F18 },
    ),
  ],
  [
    "19",
    closed(
      "19",
      `Punkty $A$, $B$ oraz $C$ leżą na okręgu o środku w punkcie $O$. Miara kąta $BCA$ jest równa $50°$ (zobacz rysunek).\n\n${FINISH}\n\nMiara kąta ostrego $ABO$ jest równa`,
      ["$20°$", "$35°$", "$40°$", "$50°$"],
      "C",
      "Kąt środkowy $AOB = 2 \\cdot 50° = 100°$, trójkąt $AOB$ jest równoramienny: $|\\angle ABO| = \\frac{180° - 100°}{2} = 40°$.",
      { figure: F19 },
    ),
  ],
  [
    "20",
    closed(
      "20",
      `W trójkącie równoramiennym $ABC$ dane są: $|AC| = |BC| = 4$ i $|AB| = 3$. Na boku $BC$, między punktami $B$ i $C$, wybrano taki punkt $D$, że trójkąty $ABC$ i $BDA$ są podobne (zobacz rysunek).\n\n${FINISH}\n\nOdcinek $BD$ ma długość`,
      ["$2$", "$2{,}25$", "$2{,}5$", "$3$"],
      "B",
      "Z podobieństwa $\\frac{|BD|}{|AB|} = \\frac{|AB|}{|BC|}$, więc $|BD| = \\frac{3 \\cdot 3}{4} = 2{,}25$.",
      { figure: F20 },
    ),
  ],
  [
    "21",
    truefalse(
      "21",
      "Dany jest trójkąt $ABC$, w którym $|AB| = 11$, $|BC| = 12$ oraz $|\\angle ABC| = 60°$ (zobacz rysunek).",
      "Trójkąt $ABC$ jest równoramienny.",
      "Pole trójkąta $ABC$ jest równe $33\\sqrt{3}$.",
      "C",
      "Z twierdzenia cosinusów $|AC|^2 = 121 + 144 - 132 = 133$ – żadne dwa boki nie są równe (F). Pole: $\\frac{1}{2} \\cdot 11 \\cdot 12 \\cdot \\sin 60° = 33\\sqrt{3}$ (P).",
      F21,
    ),
  ],
  [
    "22",
    closed(
      "22",
      `W kartezjańskim układzie współrzędnych $(x, y)$ dany jest kwadrat $ABCD$, w którym $A = (4, -1)$. Przekątne tego kwadratu przecinają się w punkcie $S = (1, 3)$.\n\n${FINISH}\n\nPrzekątna kwadratu $ABCD$ ma długość`,
      ["$5$", "$7$", "$10$", "$14$"],
      "C",
      "$|AS| = \\sqrt{3^2 + 4^2} = 5$ to połowa przekątnej, więc przekątna ma długość $10$.",
    ),
  ],
  [
    "23",
    closed(
      "23",
      `W kartezjańskim układzie współrzędnych $(x, y)$ proste $k$ oraz $l$ są określone równaniami\n\n$k:\\ y = (m - 2)x + 5$\n\n$l:\\ y = -4x + (m + 3)$\n\n${FINISH}\n\nProste $k$ oraz $l$ są równoległe, gdy liczba $m$ jest równa`,
      ["$(-4)$", "$(-2)$", "$2$", "$5$"],
      "B",
      "Równe współczynniki kierunkowe: $m - 2 = -4$, więc $m = -2$ (wyrazy wolne $5$ i $1$ są różne – proste się nie pokrywają).",
    ),
  ],
  [
    "24",
    closed(
      "24",
      `W kartezjańskim układzie współrzędnych $(x, y)$ punkt $P = (0, 0)$ leży na okręgu $\\mathcal{O}$ o środku w punkcie $S = (2, 4)$.\n\n${FINISH}\n\nOkrąg $\\mathcal{O}$ jest określony równaniem`,
      ["$(x - 2)^2 + (y - 4)^2 = 2\\sqrt{5}$", "$(x - 2)^2 + (y - 4)^2 = 20$", "$(x + 2)^2 + (y + 4)^2 = 2\\sqrt{5}$", "$(x + 2)^2 + (y + 4)^2 = 20$"],
      "B",
      "$r^2 = |SP|^2 = 2^2 + 4^2 = 20$, środek $(2, 4)$: $(x - 2)^2 + (y - 4)^2 = 20$.",
    ),
  ],
  [
    "25",
    open(
      "25",
      "Tworząca stożka ma długość $8$. Kąt rozwarcia tego stożka ma miarę $120°$.\n\nOblicz objętość tego stożka. Zapisz obliczenia.",
      ["64π"],
      [
        { step: "Wysokość: $H = 8 \\cos 60° = 4$.", points: 1 },
        { step: "Promień podstawy: $r = 8 \\sin 60° = 4\\sqrt{3}$ (czyli $r^2 = 48$).", points: 1 },
        { step: "$V = \\frac{1}{3}\\pi r^2 H = \\frac{1}{3}\\pi \\cdot 48 \\cdot 4 = 64\\pi$.", points: 1 },
      ],
      { answerLabel: "V =" },
    ),
  ],
  ["26", closed("26", `Objętość sześcianu jest równa $729$.\n\n${FINISH}\n\nDługość przekątnej tego sześcianu jest równa`, ["$9\\sqrt{3}$", "$9\\sqrt{2}$", "$3\\sqrt{3}$", "$3\\sqrt{2}$"], "A", "Krawędź $a = \\sqrt[3]{729} = 9$, przekątna sześcianu $a\\sqrt{3} = 9\\sqrt{3}$.")],
  [
    "27",
    closed(
      "27",
      `${FINISH}\n\nWszystkich liczb naturalnych trzycyfrowych nieparzystych, w których zapisie dziesiętnym występuje dokładnie jeden raz cyfra $0$, jest`,
      ["$45$", "$50$", "$54$", "$81$"],
      "A",
      "Zero może stać tylko na miejscu dziesiątek (cyfra jedności jest nieparzysta, setek – niezerowa): $9 \\cdot 1 \\cdot 5 = 45$.",
    ),
  ],
  [
    "28",
    closed(
      "28",
      `Doświadczenie losowe polega na dwukrotnym rzucie symetryczną sześcienną kostką do gry, która na każdej ściance ma inną liczbę oczek – od jednego oczka do sześciu oczek. Zdarzenie $A$ polega na tym, że suma liczb wyrzuconych oczek będzie równa $11$.\n\n${FINISH}\n\nPrawdopodobieństwo zdarzenia $A$ jest równe`,
      ["$\\frac{1}{36}$", "$\\frac{6}{36}$", "$\\frac{11}{36}$", "$\\frac{2}{36}$"],
      "D",
      "Suma $11$: $(5, 6)$ i $(6, 5)$ – $2$ wyniki z $36$.",
    ),
  ],
  ["29", closed("29", `Średnia arytmetyczna siedmiu liczb: $1, 2, 3, 4, 5, x, y$, jest równa $3$.\n\n${FINISH}\n\nSuma $x + y$ jest równa`, ["$4$", "$5$", "$6$", "$7$"], "C", "Suma liczb to $7 \\cdot 3 = 21$, a $1 + 2 + 3 + 4 + 5 = 15$, więc $x + y = 6$.")],
  [
    "30.1",
    open(
      "30.1",
      `${T30_INTRO}\n\nMediana ocen uzyskanych z tego sprawdzianu przez uczniów tej klasy jest równa …`,
      ["9/2"],
      [{ step: "Liczebności ocen $1$–$6$: $1, 3, 4, 4, 5, 7$. Mediana to średnia $12.$ i $13.$ oceny: $\\frac{4 + 5}{2} = 4{,}5$.", points: 1 }],
      { format: "short", figure: F30 },
    ),
  ],
  ["30.2", open("30.2", `${T30_INTRO}\n\nDominanta ocen uzyskanych z tego sprawdzianu przez uczniów tej klasy jest równa …`, ["6"], [{ step: "Najwięcej uczniów ($7$) dostało ocenę $6$.", points: 1 }], { format: "short", figure: F30 })],
  [
    "31",
    open(
      "31",
      "Rozważamy wszystkie prostopadłościany $ABCDEFGH$, w których krawędź $BC$ ma długość $4$ oraz suma długości wszystkich krawędzi wychodzących z wierzchołka $B$ jest równa $15$ (zobacz rysunek).\n\nNiech $P(x)$ oznacza funkcję pola powierzchni całkowitej takiego prostopadłościanu w zależności od długości $x$ krawędzi $AB$.\n\nWyznacz wzór i dziedzinę funkcji $P$. Oblicz długość $x$ krawędzi $AB$ tego z rozważanych prostopadłościanów, którego pole powierzchni całkowitej jest największe. Zapisz obliczenia.",
      ["11/2"],
      [
        { step: "$x + 4 + |BF| = 15$, czyli $|BF| = 11 - x$.", points: 1 },
        { step: "$P(x) = 2\\big(4x + x(11 - x) + 4(11 - x)\\big) = -2x^2 + 22x + 88$.", points: 1 },
        { step: "Dziedzina: $x > 0$ i $11 - x > 0$, czyli $x \\in (0, 11)$.", points: 1 },
        { step: "Parabola o ramionach w dół, wierzchołek $x = \\frac{22}{4} = \\frac{11}{2} \\in (0, 11)$ – tam pole jest największe.", points: 1 },
      ],
      { answerLabel: "x =", figure: F31 },
    ),
  ],
];

export const CKE_2025_MAJ: ExamSheet = {
  id: "cke-2025-maj",
  kind: "cke",
  year: 2025,
  session: "maj",
  title: "Matura maj 2025",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy",
  level: "podstawowy",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2505-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/zasady_oceniania/MMAP-P0-100-2505-zasady.pdf",
  },
};
