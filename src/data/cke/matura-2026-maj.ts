import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, maj 2026 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-P0-100, wersja A.
// Treść przepisana z PDF CKE, klucz (wersja A) i schematy punktowania z „Zasad oceniania” (termin główny 2026).
// Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Różnice wobec papieru: zad. 12.1 i 12.2 (po dwie luki) – każda luka osobno za 1 pkt (tak punktuje CKE);
// zad. 14 – do sprawdzenia wpisuje się a, b, c postaci ogólnej; rysunki odtworzone z danych zadania, nie skany.

const LABEL = "Matura CKE · maj 2026";
const TF_PROMPT = "Oceń prawdziwość poniższych stwierdzeń. Wybierz P, jeśli stwierdzenie jest prawdziwe, albo F – jeśli jest fałszywe.";
const TF_OPTIONS: [string, string, string, string] = ["1. P · 2. P", "1. P · 2. F", "1. F · 2. P", "1. F · 2. F"];
const FINISH = "Dokończ zdanie. Wybierz właściwą odpowiedź spośród podanych.";
const id = (n: string) => `cke-2026-maj-${n}`;

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
  closed(n, `${intro}${intro ? "\n\n" : ""}${TF_PROMPT}\n\n1. ${s1}\n\n2. ${s2}`, TF_OPTIONS, correct, explanation, { figure, truefalse: true });

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id: id(n), difficulty: "sredni", points: solution.length, task: { id: id(n), label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

const label = (at: Point, text: string, anchor?: "start" | "middle" | "end") => ({ at, text, ...(anchor ? { anchor } : {}) });

// ── Rysunki ──

const F12: Plot = {
  x: [-5.5, 5.5],
  y: [-3.5, 5.5],
  lines: [
    [
      [-4, -2],
      [2, 4],
    ],
    [
      [2, 3],
      [5, 0],
    ],
  ],
  dots: [{ at: [-4, -2] }, { at: [2, 4] }, { at: [2, 3], open: true }, { at: [5, 0], open: true }],
  labels: [label([-3.2, 2.2], "y = f(x)", "end")],
};

// 13: prosta przez (−2, 0) i (0, −3); α – kąt nachylenia do osi Ox
const F13: Plot = {
  x: [-5.5, 5.5],
  y: [-5.5, 5.5],
  lines: [
    [
      [-5.5, 5.25],
      [1.5, -5.25],
    ],
  ],
  fills: [[[-2, 0], ...Array.from({ length: 13 }, (_, i): Point => {
    const a = (((180 - (Math.atan(1.5) * 180) / Math.PI) * i) / 12) * (Math.PI / 180);
    return [-2 + 0.55 * Math.cos(a), 0.55 * Math.sin(a)];
  })]],
  labels: [label([-1.55, 0.75], "α"), label([-3, 4.3], "y = f(x)", "end")],
};

// 18: trójkąt prostokątny (kąt prosty przy B), |BC| = 2, |AB| = 6
const F18: Plot = {
  axes: false,
  x: [-0.7, 2.9],
  y: [-0.8, 6.6],
  lines: [
    [
      [0, 0],
      [2, 0],
      [0, 6],
      [0, 0],
    ],
    [
      [0, 0.35],
      [0.35, 0.35],
      [0.35, 0],
    ],
  ],
  labels: [label([-0.3, 6.25], "A"), label([-0.3, -0.4], "B"), label([2.3, -0.4], "C"), label([1, -0.5], "2"), label([1.55, 0.5], "γ")],
};

// 19: łuk CA (z punktem B) = 100°, kąt COB = 30°, D na dłuższym łuku
const on = (deg: number): Point => [3 * Math.cos((deg * Math.PI) / 180), 3 * Math.sin((deg * Math.PI) / 180)];
const [A19, B19, C19, D19] = [on(200), on(270), on(300), on(95)];
const F19: Plot = {
  axes: false,
  x: [-3.7, 3.7],
  y: [-3.7, 3.7],
  lines: [Array.from({ length: 73 }, (_, i) => on(i * 5)), [A19, D19, C19], [A19, [0, 0], C19], [[0, 0], B19]],
  dots: [{ at: [0, 0] }],
  labels: [
    label([A19[0] - 0.35, A19[1]], "A"),
    label([B19[0], B19[1] - 0.4], "B"),
    label([C19[0] + 0.3, C19[1] - 0.25], "C"),
    label([D19[0], D19[1] + 0.4], "D"),
    label([0.35, 0.3], "O"),
    label([D19[0] - 0.05, D19[1] - 0.8], "50°"),
    label([0.65, -0.95], "30°"),
  ],
};

// 20: k ∥ l, m = AC, n = DB, O = AC ∩ BD; trójkąty AOD i COB podobne w skali 12 : 8
const [A20, C20, B20, D20, O20]: Point[] = [
  [0, 3],
  [4, 0],
  [1, 0],
  [4.5, 3],
  [2.4, 1.2],
];
const F20: Plot = {
  axes: false,
  x: [-1, 6.4],
  y: [-0.9, 3.9],
  lines: [
    [
      [-0.8, 3],
      [6, 3],
    ],
    [
      [-0.8, 0],
      [6, 0],
    ],
    [
      [-0.4, 3.3],
      [4.4, -0.3],
    ],
    [
      [5, 3.43],
      [0.5, -0.43],
    ],
  ],
  labels: [
    label([A20[0] - 0.15, A20[1] + 0.35], "A"),
    label([C20[0] + 0.25, C20[1] - 0.35], "C"),
    label([B20[0] - 0.3, B20[1] - 0.35], "B"),
    label([D20[0] + 0.2, D20[1] + 0.35], "D"),
    label([O20[0] + 0.4, O20[1]], "O"),
    label([6.15, 3], "k", "start"),
    label([6.15, 0], "l", "start"),
    label([4.5, -0.6], "m"),
    label([0.35, -0.65], "n"),
    label([1.05, 2.35], "12"),
    label([1.45, 0.55], "6"),
    label([3.4, 0.75], "8"),
  ],
};

// 21: trójkąt KLM z dwusieczną MN
const K: Point = [0, 0];
const L: Point = [7, 0];
const M: Point = [2.4, 3.6];
const dist = (p: Point, q: Point) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const N21: Point = [(7 * dist(M, K)) / (dist(M, K) + dist(M, L)), 0];
const F21: Plot = {
  axes: false,
  x: [-0.6, 7.6],
  y: [-0.8, 4.2],
  lines: [[K, L, M, K], [M, N21]],
  labels: [label([-0.3, -0.4], "K"), label([7.3, -0.4], "L"), label([2.4, 3.95], "M"), label([N21[0], -0.45], "N"), label([0.85, 2.1], "a"), label([5, 2.1], "b")],
};

// 31: oceny w klasach IV A i IV B
const IVA = [1, 6, 3, 3, 6, 1];
const IVB = [1, 3, 6, 6, 3, 1];
const chart = (counts: number[], dx: number) => counts.map((c, i): Point[] => [
  [dx + i + 0.55, 0],
  [dx + i + 0.55, c],
  [dx + i + 1.45, c],
  [dx + i + 1.45, 0],
]);
const F31: Plot = {
  axes: false,
  x: [-1.2, 16.2],
  y: [-1.6, 8.4],
  lines: [
    [
      [0, 7.3],
      [0, 0],
      [7, 0],
    ],
    [
      [9, 7.3],
      [9, 0],
      [16, 0],
    ],
  ],
  fills: [...chart(IVA, 0), ...chart(IVB, 9)],
  labels: [
    ...[0, 9].flatMap((dx) => [1, 2, 3, 4, 5, 6].map((v) => label([dx + v, -0.6], String(v)))),
    ...[0, 9].flatMap((dx) => [0, 1, 2, 3, 4, 5, 6, 7].map((v) => label([dx - 0.3, v], String(v), "end"))),
    label([3.5, 7.9], "klasa IV A"),
    label([12.5, 7.9], "klasa IV B"),
    label([3.5, -1.35], "ocena"),
    label([12.5, -1.35], "ocena"),
  ],
};

// ── Zadania ──

const F12_INTRO =
  "Funkcja $f$ jest określona następująco:\n\n$f(x) = x + 2$ dla $x \\in [-4, 2]$, $f(x) = -x + 5$ dla $x \\in (2, 5)$.\n\nWykres funkcji $y = f(x)$ przedstawiono w kartezjańskim układzie współrzędnych $(x, y)$ na rysunku.";
const F13_INTRO =
  "Funkcja liniowa $f$ jest określona wzorem $f(x) = ax + b$, gdzie $a$ i $b$ są pewnymi liczbami rzeczywistymi. W kartezjańskim układzie współrzędnych $(x, y)$ przedstawiono fragment wykresu funkcji $f$. Każdy z punktów przecięcia wykresu funkcji $f$ z osiami układu współrzędnych ma obie współrzędne całkowite. Wykres funkcji $f$ jest nachylony do osi $Ox$ układu współrzędnych pod kątem o mierze $\\alpha$ (zobacz rysunek).";
const T24 = "W kartezjańskim układzie współrzędnych $(x, y)$ punkty $A = (0, -3)$, $B = (2, 1)$ oraz $C = (0, 2)$ są wierzchołkami trójkąta prostokątnego.";
const T33 =
  "W chwili $t = 0$ z poziomu ziemi wyrzucono piłeczkę pionowo do góry. Przyjmijmy, że wysokość $h$, na której znajduje się piłeczka w danej chwili $t$, jest określona wzorem\n\n$h(t) = -4{,}9t^2 + 14{,}7t$\n\ngdzie: czas $t$ jest wyrażony w sekundach (s) i zmienia się od $0$ do chwili pierwszego uderzenia piłeczki o ziemię; wysokość $h$ jest wyrażona w metrach i jest liczona względem poziomu ziemi.";
const shortTask = (n: string, prompt: string, answer: string, step: string, figure?: Plot) => open(n, prompt, [answer], [step], { format: "short", ...(figure ? { figure } : {}) });

const TASKS: [number: string, task: PracticeTask][] = [
  ["1", closed("1", `${FINISH}\n\nLiczba $\\sqrt{\\frac{25}{8}} \\cdot \\sqrt{2} + 2^{-1}$ jest równa`, ["$1$", "$2$", "$3$", "$4$"], "C", "$\\sqrt{\\frac{25}{8} \\cdot 2} + \\frac{1}{2} = \\frac{5}{2} + \\frac{1}{2} = 3$.")],
  [
    "2",
    closed(
      "2",
      `Klient wpłacił do banku $10\\,000$ zł na lokatę dwuletnią. Po każdym rocznym okresie oszczędzania bank dolicza odsetki w wysokości $6\\%$ od kwoty bieżącego kapitału znajdującego się na lokacie – zgodnie z procentem składanym.\n\n${FINISH}\n\nPo dwóch latach oszczędzania łączna wartość doliczonych odsetek na tej lokacie (bez uwzględniania podatków) jest równa`,
      ["$1200$ zł", "$1236$ zł", "$1836$ zł", "$3600$ zł"],
      "B",
      "$10\\,000 \\cdot 1{,}06^2 = 11\\,236$ zł, odsetki: $1236$ zł.",
    ),
  ],
  ["3", closed("3", `${FINISH}\n\nLiczba $\\sqrt{5\\sqrt{5}}$ jest równa`, ["$5^{\\frac{1}{4}}$", "$5^{\\frac{1}{2}}$", "$5^{\\frac{3}{4}}$", "$5$"], "C", "$\\sqrt{5^{\\frac{3}{2}}} = 5^{\\frac{3}{4}}$.")],
  ["4", closed("4", `${FINISH}\n\nLiczba $\\log_8 4 - \\log_8 32$ jest równa`, ["$(-2)$", "$(-1)$", "$1$", "$2$"], "B", "$\\log_8 \\frac{4}{32} = \\log_8 \\frac{1}{8} = -1$.")],
  [
    "5",
    truefalse(
      "5",
      "",
      "Liczba naturalna $4^{12} \\cdot 5^{24}$ jest podzielna przez $20$.",
      "Liczba naturalna $4^{12} \\cdot 5^{24}$ jest w zapisie dziesiętnym liczbą $25$-cyfrową.",
      "A",
      "$4^{12} \\cdot 5^{24} = 2^{24} \\cdot 5^{24} = 10^{24}$ – dzieli się przez $20$ (P) i ma $25$ cyfr (P).",
    ),
  ],
  ["6", closed("6", `${FINISH}\n\nWartość wyrażenia $x^2 + 10x + 25$ dla $x = \\sqrt{2} - 5$ jest równa`, ["$2$", "$\\sqrt{2}$", "$2 - 20\\sqrt{2}$", "$62 - 10\\sqrt{2}$"], "A", "$x^2 + 10x + 25 = (x + 5)^2 = (\\sqrt{2})^2 = 2$.")],
  [
    "7",
    open(
      "7",
      "Wykaż, że dla każdej liczby całkowitej $n$ liczba $7n^2 + 21n$ jest podzielna przez $14$.",
      [],
      ["$7n^2 + 21n = 7n(n + 3)$ – liczba podzielna przez $7$.", "Liczby $n$ i $n + 3$ są różnej parzystości, więc $n(n + 3)$ jest parzyste – liczba dzieli się przez $2$ i przez $7$, czyli przez $14$."],
      { format: "proof" },
    ),
  ],
  [
    "8",
    closed(
      "8",
      `Dane jest równanie\n\n$3(x + 3)(x - m)(2x + 4) = 0$\n\ngdzie $x$ jest niewiadomą, natomiast $m$ jest pewną liczbą rzeczywistą. Suma wszystkich rozwiązań tego równania jest równa $0$.\n\n${FINISH}\n\nLiczba $m$ jest równa`,
      ["$(-7)$", "$2$", "$5$", "$7$"],
      "C",
      "Rozwiązania: $-3$, $m$, $-2$; $-3 + m - 2 = 0$, więc $m = 5$.",
    ),
  ],
  ["9", closed("9", `${FINISH}\n\nRozwiązaniem równania $\\frac{x + 2}{3x - 1} = \\frac{2}{5}$ jest liczba`, ["$\\frac{1}{3}$", "$\\frac{8}{11}$", "$3$", "$12$"], "D", "$5(x + 2) = 2(3x - 1)$, czyli $5x + 10 = 6x - 2$ i $x = 12$.")],
  [
    "10",
    open(
      "10",
      "Rozwiąż nierówność\n\n$3x^2 + 4x \\ge 6x + 8$\n\nZapisz obliczenia.",
      ["(-∞, -4/3] ∪ [2, +∞)"],
      ["$3x^2 - 2x - 8 \\ge 0$, pierwiastki: $x_1 = -\\frac{4}{3}$, $x_2 = 2$.", "Ramiona paraboli w górę: $x \\in \\left(-\\infty, -\\frac{4}{3}\\right] \\cup [2, +\\infty)$."],
    ),
  ],
  [
    "11",
    open(
      "11",
      "Na przedstawienie w pewnym teatrze sprzedawano bilety według cennika: bilet normalny – $35$ zł, bilet ulgowy – $25$ zł. Na to przedstawienie sprzedano łącznie $200$ biletów. Po opłaceniu kosztów związanych z organizacją przedstawienia w wysokości $25\\%$ wpływów ze sprzedaży biletów organizatorom pozostało $4665$ zł.\n\nOblicz liczbę biletów ulgowych sprzedanych na to przedstawienie. Zapisz obliczenia.",
      ["78"],
      ["Układ: $n + u = 200$ oraz $0{,}75(35n + 25u) = 4665$.", "$35n + 25u = 6220$, $7000 - 10u = 6220$, więc $u = 78$."],
    ),
  ],
  ["12.1.1", shortTask("12.1.1", `${F12_INTRO}\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.\n\nRozwiązaniem równania $f(x) = 3$ jest liczba …`, "1", "$x + 2 = 3$ daje $x = 1 \\in [-4, 2]$; $-x + 5 = 3$ daje $x = 2 \\notin (2, 5)$.", F12)],
  ["12.1.2", shortTask("12.1.2", `${F12_INTRO}\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.\n\nNajwiększa wartość funkcji $f$ w przedziale $[2, 3]$ jest równa …`, "4", "$f(2) = 4$, a na $(2, 3]$ funkcja maleje od $3$ do $2$ – największa wartość to $4$.", F12)],
  ["12.2.1", shortTask("12.2.1", `${F12_INTRO}\n\nUzupełnij zdanie. Wpisz odpowiedni przedział.\n\nZbiorem wartości funkcji $f$ jest przedział …`, "[-2, 4]", "Na $[-4, 2]$ wartości $[-2, 4]$, na $(2, 5)$ – $(0, 3)$; razem $[-2, 4]$.", F12)],
  ["12.2.2", shortTask("12.2.2", `${F12_INTRO}\n\nUzupełnij zdanie. Wpisz odpowiedni przedział.\n\nZbiorem wszystkich argumentów, dla których funkcja $f$ przyjmuje wartości większe od $1$, jest przedział …`, "(-1, 4)", "$x + 2 > 1$ na $(-1, 2]$ oraz $-x + 5 > 1$ na $(2, 4)$; razem $(-1, 4)$.", F12)],
  ["13.1", truefalse("13.1", F13_INTRO, "Współczynnik $a$ we wzorze funkcji $f$ jest liczbą dodatnią.", "Współczynnik $b$ we wzorze funkcji $f$ jest liczbą dodatnią.", "D", "Funkcja maleje ($a < 0$, F), a wykres przecina oś $Oy$ w punkcie $(0, -3)$ ($b < 0$, F).", F13)],
  [
    "13.2",
    closed(
      "13.2",
      `${F13_INTRO}\n\n${FINISH}\n\nTangens kąta o mierze $\\alpha$ jest równy`,
      ["$\\left(-\\frac{3}{2}\\right)$", "$\\left(-\\frac{2}{3}\\right)$", "$\\frac{2}{3}$", "$\\frac{3}{2}$"],
      "A",
      "Prosta przechodzi przez $(-2, 0)$ i $(0, -3)$: $a = -\\frac{3}{2}$, a $\\operatorname{tg}\\alpha = a$.",
      { figure: F13 },
    ),
  ],
  [
    "14",
    open(
      "14",
      "W kartezjańskim układzie współrzędnych $(x, y)$ wykresem funkcji kwadratowej $f$ jest parabola o wierzchołku w punkcie $W = (3, -2)$. Funkcja kwadratowa $g$ jest określona za pomocą funkcji $f$ wzorem $g(x) = f(x + 1)$. Jednym z miejsc zerowych funkcji $g$ jest liczba $0$.\n\nWyznacz wzór funkcji $f$ w postaci ogólnej. Zapisz obliczenia.\n\n(W aplikacji wpisz współczynniki $a$, $b$, $c$ postaci $f(x) = ax^2 + bx + c$, oddzielone średnikami.)",
      ["1/2; -3; 5/2"],
      [
        "$f(x) = a(x - 3)^2 - 2$.",
        "$g(0) = f(1) = 0$ – liczba $1$ jest miejscem zerowym $f$.",
        "$a(1 - 3)^2 - 2 = 0$, więc $a = \\frac{1}{2}$.",
        "$f(x) = \\frac{1}{2}(x - 3)^2 - 2 = \\frac{1}{2}x^2 - 3x + \\frac{5}{2}$.",
      ],
      { answerLabel: "a;\\ b;\\ c =" },
    ),
  ],
  [
    "15",
    open(
      "15",
      "Ciąg $(a_n)$ jest określony wzorem $a_n = 3n + 5$ dla każdej liczby naturalnej $n \\ge 1$. Trzywyrazowy ciąg $(a_1, a_9, a_k)$ jest geometryczny.\n\nOblicz $k$. Zapisz obliczenia.",
      ["41"],
      ["$a_1 = 8$, $a_9 = 32$.", "Iloraz $q = 4$, więc $a_k = 128$ – ciąg $(8, 32, 128)$.", "$3k + 5 = 128$, $k = 41$."],
      { answerLabel: "k =" },
    ),
  ],
  ["16", closed("16", `Ciąg arytmetyczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. W tym ciągu $a_1 = 1$ oraz $a_5 = 17$.\n\n${FINISH}\n\nDziewiąty wyraz ciągu $(a_n)$ jest równy`, ["$29$", "$33$", "$34$", "$37$"], "B", "$4r = 16$, $r = 4$, $a_9 = 1 + 8 \\cdot 4 = 33$.")],
  [
    "17",
    shortTask(
      "17",
      "Ciąg geometryczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. Wyrazy trzeci i szósty tego ciągu spełniają warunek $a_3 \\cdot a_6 = 18$.\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.\n\nIloczyn $a_2 \\cdot a_7$ jest równy …",
      "18",
      "$a_2 \\cdot a_7 = a_1^2q^7 = a_3 \\cdot a_6 = 18$.",
    ),
  ],
  [
    "18",
    closed(
      "18",
      `Dany jest trójkąt prostokątny $ABC$, w którym bok $AC$ jest przeciwprostokątną oraz $|BC| = 2$ i $|AC| = 2\\sqrt{10}$. Oznaczmy kąt $BCA$ przez $\\gamma$ (zobacz rysunek).\n\n${FINISH}\n\nSinus kąta $\\gamma$ jest równy`,
      ["$\\frac{1}{\\sqrt{10}}$", "$\\frac{1}{3}$", "$\\frac{3}{\\sqrt{10}}$", "$\\frac{\\sqrt{10}}{\\sqrt{11}}$"],
      "C",
      "$|AB| = \\sqrt{40 - 4} = 6$, $\\sin\\gamma = \\frac{|AB|}{|AC|} = \\frac{6}{2\\sqrt{10}} = \\frac{3}{\\sqrt{10}}$.",
      { figure: F18 },
    ),
  ],
  [
    "19",
    closed(
      "19",
      `Punkty $A$, $B$, $C$ oraz $D$ leżą na okręgu o środku w punkcie $O$. Punkt $B$ leży na krótszym łuku $AC$. Kąt $CDA$ ma miarę $50°$, a kąt $COB$ ma miarę $30°$ (zobacz rysunek).\n\n${FINISH}\n\nMiara kąta ostrego $BOA$ jest równa`,
      ["$50°$", "$60°$", "$70°$", "$100°$"],
      "C",
      "Kąt środkowy $COA = 2 \\cdot 50° = 100°$, więc $|\\angle BOA| = 100° - 30° = 70°$.",
      { figure: F19 },
    ),
  ],
  [
    "20",
    closed(
      "20",
      `Na płaszczyźnie dane są cztery proste: $k$, $l$, $m$ oraz $n$. Proste $k$ oraz $l$ są równoległe. Prosta $m$ przecina proste $k$ oraz $l$ w punktach – odpowiednio – $A$ oraz $C$. Prosta $n$ przecina proste $k$ oraz $l$ w punktach – odpowiednio – $D$ oraz $B$. Odcinki $AC$ i $BD$ przecinają się w punkcie $O$. Ponadto $|OA| = 12$, $|OB| = 6$ oraz $|OC| = 8$ (zobacz rysunek).\n\n${FINISH}\n\nOdcinek $OD$ ma długość`,
      ["$4$", "$9$", "$10$", "$16$"],
      "B",
      "Trójkąty $AOD$ i $COB$ są podobne: $\\frac{|OD|}{|OB|} = \\frac{|OA|}{|OC|}$, więc $|OD| = \\frac{12 \\cdot 6}{8} = 9$.",
      { figure: F20 },
    ),
  ],
  [
    "21",
    open(
      "21",
      "Dany jest trójkąt $KLM$, w którym $|KM| = a$ oraz $|LM| = b$. Dwusieczna kąta $LMK$ przecina bok $KL$ w punkcie $N$ (zobacz rysunek).\n\nWykaż, że stosunek pola trójkąta $KNM$ do pola trójkąta $NLM$ jest równy $\\frac{a}{b}$.",
      [],
      [
        "Pola z sinusem połowy kąta $\\alpha = |\\angle KMN| = |\\angle NML|$: $P_{KNM} = \\frac{1}{2} \\cdot a \\cdot |MN| \\cdot \\sin\\alpha$, $P_{NLM} = \\frac{1}{2} \\cdot b \\cdot |MN| \\cdot \\sin\\alpha$.",
        "Iloraz: $\\frac{P_{KNM}}{P_{NLM}} = \\frac{a}{b}$.",
      ],
      { format: "proof", figure: F21 },
    ),
  ],
  ["22", shortTask("22", "W okrąg $\\mathcal{O}$ o promieniu $9\\sqrt{3}$ wpisano trójkąt równoboczny $\\mathcal{T}$.\n\nUzupełnij zdanie. Wpisz odpowiednią liczbę.\n\nBok trójkąta $\\mathcal{T}$ ma długość …", "27", "$R = \\frac{a\\sqrt{3}}{3}$, więc $a = R\\sqrt{3} = 9\\sqrt{3} \\cdot \\sqrt{3} = 27$.")],
  [
    "23",
    closed(
      "23",
      `Kąt $\\alpha$ jest ostry i spełnia warunek $\\frac{3\\sin\\alpha + 4\\cos\\alpha}{4\\cos\\alpha} = 6$.\n\n${FINISH}\n\nTangens kąta $\\alpha$ jest równy`,
      ["$\\frac{5}{8}$", "$\\frac{8}{3}$", "$\\frac{32}{5}$", "$\\frac{20}{3}$"],
      "D",
      "$\\frac{3}{4}\\operatorname{tg}\\alpha + 1 = 6$, więc $\\operatorname{tg}\\alpha = \\frac{20}{3}$.",
    ),
  ],
  ["24.1", closed("24.1", `${T24}\n\n${FINISH}\n\nPole trójkąta $ABC$ jest równe`, ["$3$", "$5$", "$6$", "$10$"], "B", "Kąt prosty przy $B$: $|AB| = \\sqrt{20}$, $|BC| = \\sqrt{5}$, pole $\\frac{1}{2}\\sqrt{20} \\cdot \\sqrt{5} = 5$ (albo $\\frac{1}{2} \\cdot |AC| \\cdot 2 = 5$).")],
  [
    "24.2",
    closed(
      "24.2",
      `${T24}\n\n${FINISH}\n\nŚrodek okręgu opisanego na trójkącie $ABC$ ma współrzędne`,
      ["$\\left(\\frac{2}{3}, 0\\right)$", "$\\left(-\\frac{1}{2}, 0\\right)$", "$\\left(0, -\\frac{2}{3}\\right)$", "$\\left(0, -\\frac{1}{2}\\right)$"],
      "D",
      "Środek okręgu opisanego na trójkącie prostokątnym to środek przeciwprostokątnej $AC$: $\\left(0, -\\frac{1}{2}\\right)$.",
    ),
  ],
  [
    "25",
    truefalse(
      "25",
      "W kartezjańskim układzie współrzędnych $(x, y)$ dany jest okrąg $\\mathcal{O}$ o środku w punkcie $S = (1, -3)$ i o promieniu $5$.",
      "Punkt $A = (4, -7)$ leży na okręgu $\\mathcal{O}$.",
      "Okrąg $\\mathcal{O}$ jest określony równaniem $(x - 1)^2 + (y + 3)^2 = 5$.",
      "B",
      "$|SA| = \\sqrt{9 + 16} = 5$ (P); po prawej stronie równania powinno być $r^2 = 25$ (F).",
    ),
  ],
  [
    "26",
    closed(
      "26",
      `W kartezjańskim układzie współrzędnych $(x, y)$ dana jest prosta $k$ o równaniu $y = -\\frac{1}{3}x + 2$. Prosta $l$ jest równoległa do prostej $k$ i przechodzi przez punkt $(2, -2)$.\n\n${FINISH}\n\nProsta $l$ przecina oś $Oy$ w punkcie`,
      ["$(0, -3)$", "$\\left(0, -\\frac{1}{2}\\right)$", "$(0, -1)$", "$\\left(0, -\\frac{4}{3}\\right)$"],
      "D",
      "$l:\\ y = -\\frac{1}{3}x + b$, $-2 = -\\frac{2}{3} + b$, więc $b = -\\frac{4}{3}$.",
    ),
  ],
  [
    "27",
    open(
      "27",
      "Dany jest ostrosłup prawidłowy czworokątny, w którym przekątna podstawy ma długość $8\\sqrt{3}$. Krawędź boczna tego ostrosłupa jest nachylona do płaszczyzny podstawy pod kątem $30°$.\n\nOblicz objętość tego ostrosłupa. Zapisz obliczenia.",
      ["128"],
      ["Wysokość: $H = 4\\sqrt{3} \\cdot \\operatorname{tg} 30° = 4$.", "Pole podstawy $\\frac{(8\\sqrt{3})^2}{2} = 96$, $V = \\frac{1}{3} \\cdot 96 \\cdot 4 = 128$."],
      { answerLabel: "V =" },
    ),
  ],
  ["28", closed("28", `Stożek i walec mają równe wysokości. Promień podstawy stożka jest dwa razy większy od promienia podstawy walca.\n\n${FINISH}\n\nStosunek objętości stożka do objętości walca jest równy`, ["$\\frac{1}{12}$", "$\\frac{1}{6}$", "$\\frac{2}{3}$", "$\\frac{4}{3}$"], "D", "$\\frac{\\frac{1}{3}\\pi(2r)^2 h}{\\pi r^2 h} = \\frac{4}{3}$.")],
  [
    "29",
    closed(
      "29",
      `${FINISH}\n\nWszystkich liczb naturalnych trzycyfrowych nieparzystych, w których zapisie dziesiętnym występują tylko cyfry $0, 1, 2, 3, 4, 5, 6$ (np.: $321$, $555$), jest`,
      ["$6 \\cdot 7 \\cdot 3$", "$6 \\cdot 7 \\cdot 7$", "$7 \\cdot 7 \\cdot 3$", "$7 \\cdot 7 \\cdot 7$"],
      "A",
      "Setki: $6$ cyfr (bez zera), dziesiątki: $7$, jedności nieparzyste: $1, 3, 5$ – razem $6 \\cdot 7 \\cdot 3$.",
    ),
  ],
  [
    "30",
    open(
      "30",
      "Dane są dwa zbiory cyfr: $X = \\{1, 3, 5, 7, 9\\}$ oraz $Y = \\{0, 2, 4, 6, 8\\}$. Losujemy jedną cyfrę ze zbioru $X$, a następnie losujemy jedną cyfrę ze zbioru $Y$. Następnie zapisujemy liczbę dwucyfrową w ten sposób, że cyfra wylosowana ze zbioru $X$ jest cyfrą dziesiątek, a cyfra wylosowana ze zbioru $Y$ jest cyfrą jedności tej liczby dwucyfrowej.\n\nOblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że otrzymana w ten sposób liczba dwucyfrowa będzie podzielna przez $6$. Zapisz obliczenia.",
      ["9/25"],
      ["$|\\Omega| = 5 \\cdot 5 = 25$.", "Liczba jest parzysta, więc wystarczy podzielność przez $3$: $12, 18, 30, 36, 54, 72, 78, 90, 96$ – $|A| = 9$, $P(A) = \\frac{9}{25}$."],
    ),
  ],
  [
    "31",
    truefalse(
      "31",
      "Nauczyciel matematyki po każdym sprawdzianie porównuje wyniki uzyskane przez uczniów dwóch klas: klasy IV A oraz klasy IV B. Na dwóch diagramach przedstawiono wyniki sprawdzianu ze statystyki, jakie uzyskali uczniowie tych klas. Na osiach poziomych podano oceny, które uzyskali uczniowie tych klas, a na osiach pionowych podano liczbę uczniów, którzy otrzymali daną ocenę.",
      "Średnia arytmetyczna ocen uzyskanych ze sprawdzianu ze statystyki przez uczniów klasy IV A jest równa średniej arytmetycznej ocen uzyskanych z tego sprawdzianu przez uczniów klasy IV B.",
      "Mediana ocen uzyskanych ze sprawdzianu ze statystyki przez uczniów klasy IV A jest równa medianie ocen uzyskanych z tego sprawdzianu przez uczniów klasy IV B.",
      "A",
      "IV A: $1, 6, 3, 3, 6, 1$ uczniów, IV B: $1, 3, 6, 6, 3, 1$ – w obu klasach $20$ osób, średnia $\\frac{70}{20} = 3{,}5$ i mediana $\\frac{3 + 4}{2} = 3{,}5$ (P, P).",
      F31,
    ),
  ],
  [
    "32",
    closed(
      "32",
      `Średnia arytmetyczna trzech liczb: $a$, $b$, $c$, jest równa $2$. Średnia arytmetyczna czterech liczb: $d$, $e$, $f$, $g$, jest równa $5{,}5$.\n\n${FINISH}\n\nŚrednia arytmetyczna siedmiu liczb: $a, b, c, d, e, f, g$, jest równa`,
      ["$3{,}5$", "$3{,}75$", "$4$", "$4{,}25$"],
      "C",
      "$\\frac{3 \\cdot 2 + 4 \\cdot 5{,}5}{7} = \\frac{28}{7} = 4$.",
    ),
  ],
  ["33.1", closed("33.1", `${T33}\n\n${FINISH}\n\nWyrzucona piłeczka po raz pierwszy uderzy w ziemię w chwili`, ["$t = 1{,}5$ s", "$t = 2$ s", "$t = 2{,}5$ s", "$t = 3$ s"], "D", "$-4{,}9t^2 + 14{,}7t = -4{,}9t(t - 3) = 0$ dla $t = 3$ s.")],
  ["33.2", closed("33.2", `${T33}\n\n${FINISH}\n\nWyrzucona piłeczka osiągnęła największą wysokość w chwili`, ["$t = 1{,}5$ s", "$t = 2$ s", "$t = 2{,}5$ s", "$t = 3$ s"], "A", "Wierzchołek paraboli: $t = \\frac{-14{,}7}{2 \\cdot (-4{,}9)} = 1{,}5$ s.")],
];

export const CKE_2026_MAJ: ExamSheet = {
  id: "cke-2026-maj",
  kind: "cke",
  year: 2026,
  session: "maj",
  title: "Matura maj 2026",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy",
  level: "podstawowy",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-A-2605-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_podstawowy/MMAP-P0-100-2605-zasady.pdf",
  },
};
