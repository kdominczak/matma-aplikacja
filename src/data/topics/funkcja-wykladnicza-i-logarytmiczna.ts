import { sample } from "@/lib/plot";
import type { TopicContent } from "@/types/topic";

// Lekcja 22 – funkcja wykładnicza i logarytmiczna (dział V podstawy). Zadania wl-p1…wl-z2 i wl-o1/wl-o2
// przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Funkcja wykładnicza",
      body:
        "$f(x) = a^x$, gdzie podstawa $a > 0$ i $a \\neq 1$. Najważniejsze cechy:\n\n" +
        "• wykres zawsze przechodzi przez punkt $(0, 1)$, bo $a^0 = 1$,\n\n" +
        "• wartości są zawsze dodatnie – zbiór wartości to $(0, +\\infty)$, wykres nie dotyka osi $Ox$,\n\n" +
        "• $a > 1$ – funkcja rośnie, $0 < a < 1$ – maleje.\n\n" +
        "Na rysunku: ciągła $y = 2^x$ (rośnie) i przerywana $y = \\left(\\frac{1}{2}\\right)^x$ (maleje) – odbicia względem osi $Oy$.",
      plot: {
        x: [-3, 3],
        y: [-1, 8],
        lines: [sample((x) => 2 ** x, -3, 2.95)],
        guides: [sample((x) => 0.5 ** x, -2.95, 3)],
        dots: [{ at: [0, 1] }],
      },
    },
    {
      title: "Wartości i podstawa z punktu",
      body:
        "Ujemny wykładnik to odwrotność: $a^{-n} = \\frac{1}{a^n}$, np. $3^{-2} = \\frac{1}{9}$ – nigdy liczba ujemna.\n\n" +
        "Gdy znasz punkt na wykresie, podstawę wyznaczysz z równania $a^{x_0} = y_0$.",
      example: {
        prompt: "Wykres funkcji $f(x) = a^x$ przechodzi przez punkt $\\left(3, \\frac{1}{8}\\right)$. Wyznacz $a$ i opisz monotoniczność.",
        solution: "$a^3 = \\frac{1}{8}$, więc $a = \\frac{1}{2}$.\nPodstawa jest między $0$ a $1$ – funkcja jest malejąca.",
      },
    },
    {
      title: "Równania wykładnicze",
      body:
        "Sprowadź obie strony do potęg tej samej liczby – wtedy wykładniki muszą być równe. " +
        "Przydają się zamiany: $8 = 2^3$, $27 = 3^3$, $9 = 3^2$, $\\frac{1}{4} = 2^{-2}$, $\\sqrt{2} = 2^{\\frac{1}{2}}$.",
      example: {
        prompt: "Rozwiąż równania $3^{x - 1} = 27$ oraz $9^x = 3^{x + 3}$.",
        solution:
          "$3^{x - 1} = 3^3 \\Rightarrow x - 1 = 3 \\Rightarrow x = 4$.\n" +
          "$9^x = (3^2)^x = 3^{2x}$, więc $2x = x + 3 \\Rightarrow x = 3$.",
      },
    },
    {
      title: "Funkcja logarytmiczna",
      body:
        "$f(x) = \\log_a x$ odwraca funkcję wykładniczą: $\\log_a x = c$ oznacza $a^c = x$.\n\n" +
        "• dziedzina: $x > 0$ (logarytmujemy tylko liczby dodatnie),\n\n" +
        "• wykres przechodzi przez $(1, 0)$, bo $\\log_a 1 = 0$,\n\n" +
        "• zbiór wartości: wszystkie liczby rzeczywiste; $a > 1$ – rośnie, $0 < a < 1$ – maleje.\n\n" +
        "Na rysunku: $y = \\log_2 x$ i przerywana $y = 2^x$ – wykresy są symetryczne względem prostej $y = x$.",
      plot: {
        x: [-2, 6],
        y: [-3, 5],
        lines: [sample((x) => Math.log2(x), 0.13, 6)],
        guides: [sample((x) => 2 ** x, -2, 2.3)],
        dots: [{ at: [1, 0] }],
      },
    },
    {
      title: "Dziedzina i miejsce zerowe logarytmu",
      body:
        "Dla $f(x) = \\log_a g(x)$: dziedzinę wyznaczasz z warunku $g(x) > 0$, a miejsce zerowe z $g(x) = 1$ " +
        "(logarytm z jedynki jest zerem).",
      example: {
        prompt: "Dla $f(x) = \\log_2 (x + 4)$ wyznacz dziedzinę, miejsce zerowe i $f(4)$.",
        solution:
          "Dziedzina: $x + 4 > 0 \\Rightarrow x > -4$.\n" +
          "Miejsce zerowe: $x + 4 = 1 \\Rightarrow x = -3$.\n" +
          "$f(4) = \\log_2 8 = 3$.",
      },
    },
  ],
  formulas: [
    { label: "Funkcja wykładnicza", tex: "f(x) = a^x, \\quad a > 0, \\ a \\neq 1" },
    { label: "Funkcja logarytmiczna", tex: "f(x) = \\log_a x, \\quad x > 0" },
    { label: "Definicja logarytmu", tex: "\\log_a b = c \\iff a^c = b" },
    { label: "Ujemny wykładnik", tex: "a^{-n} = \\frac{1}{a^n}" },
    { label: "Punkty charakterystyczne", tex: "a^0 = 1, \\quad \\log_a 1 = 0" },
    { label: "Monotoniczność", tex: "a > 1: \\text{ rosnąca}, \\quad 0 < a < 1: \\text{ malejąca}" },
  ],
  traps: [
    "Funkcja wykładnicza nie przyjmuje wartości ujemnych ani zera – $3^{-2} = \\frac{1}{9}$, a nie $-9$.",
    "Monotoniczność zależy od podstawy: $a > 1$ – rośnie, $0 < a < 1$ – maleje.",
    "Dziedzina logarytmu: liczba logarytmowana musi być DODATNIA – nawias otwarty, bez zera.",
    "Logarytm jest równy zero, gdy liczba logarytmowana jest równa $1$, a nie $0$.",
  ],
  openTasks: [
    {
      id: "wl-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Oblicz wartość funkcji $f(x) = 2^x$ dla $x = -3$.",
      answers: ["1/8"],
      answerLabel: "f(−3) =",
      hints: ["Ujemny wykładnik to odwrotność: $2^{-3} = \\frac{1}{2^3}$."],
      solution: [
        { step: "Zapisanie: $f(-3) = 2^{-3} = \\frac{1}{2^3}$.", points: 1 },
        { step: "Wynik: $\\frac{1}{8}$.", points: 1 },
      ],
    },
    {
      id: "wl-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Rozwiąż równanie $2^{x + 1} = 32$.",
      answers: ["4"],
      answerLabel: "x =",
      hints: ["Zapisz $32$ jako potęgę liczby $2$."],
      solution: [
        { step: "Zapisanie prawej strony jako potęgi dwójki: $32 = 2^5$.", points: 1 },
        { step: "Porównanie wykładników: $x + 1 = 5$, więc $x = 4$.", points: 1 },
      ],
    },
    {
      id: "wl-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Do wykresu funkcji $f(x) = \\log_a x$ należy punkt $(16, 4)$. Oblicz $f(8)$.",
      answers: ["3"],
      hints: ["Najpierw wyznacz podstawę $a$."],
      solution: [
        { step: "$\\log_a 16 = 4$, więc $a^4 = 16$ i $a = 2$.", points: 1 },
        { step: "$f(8) = \\log_2 8 = 3$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "wl-p1",
        prompt: "Wartość funkcji $f(x) = 3^x$ dla $x = -2$ jest równa:",
        options: { A: "$\\frac{1}{9}$", B: "$-9$", C: "$-6$", D: "$9$" },
        correct: "A",
        hints: ["Ujemny wykładnik to odwrotność."],
        explanation: "$3^{-2} = \\frac{1}{9}$.",
      },
      {
        id: "wl-p2",
        prompt: "Funkcja $f(x) = \\left(\\frac{1}{2}\\right)^x$ jest:",
        options: { A: "rosnąca", B: "malejąca", C: "stała", D: "rosnąca tylko dla $x > 0$" },
        correct: "B",
        hints: ["Spójrz, czy podstawa jest większa, czy mniejsza od $1$."],
        explanation: "Podstawa $\\frac{1}{2}$ jest między $0$ a $1$, więc funkcja maleje.",
      },
      {
        id: "wl-p3",
        prompt: "Wykres funkcji $f(x) = 5^x$ przecina oś $Oy$ w punkcie:",
        options: { A: "$(0, 1)$", B: "$(0, 5)$", C: "$(1, 0)$", D: "$(0, 0)$" },
        correct: "A",
        hints: ["Na osi $Oy$ jest $x = 0$.", "Każda liczba (różna od zera) do potęgi zerowej to $1$."],
        explanation: "$f(0) = 5^0 = 1$, więc punkt $(0, 1)$.",
        trap: "$(0, 5)$ to wartość dla $x = 1$ przeniesiona na oś – a na osi $Oy$ liczymy $f(0)$.",
      },
    ],
    sredni: [
      {
        id: "wl-s1",
        prompt: "Do wykresu funkcji $f(x) = 2^x$ należy punkt:",
        options: { A: "$(8, 3)$", B: "$(3, 8)$", C: "$(0, 0)$", D: "$(-1, -2)$" },
        correct: "B",
        explanation: "$f(3) = 2^3 = 8$.",
      },
      {
        id: "wl-s2",
        prompt: "Dziedziną funkcji $f(x) = \\log_2 (x - 3)$ jest:",
        options: { A: "$(3, +\\infty)$", B: "$\\langle 3, +\\infty)$", C: "$(-3, +\\infty)$", D: "$\\mathbb{R}$" },
        correct: "A",
        explanation: "Liczba logarytmowana musi być dodatnia: $x - 3 > 0$.",
      },
      {
        id: "wl-s3",
        prompt: "Zbiorem wartości funkcji $f(x) = 2^x - 3$ jest przedział:",
        options: { A: "$(-3, +\\infty)$", B: "$(0, +\\infty)$", C: "$\\langle -3, +\\infty)$", D: "$\\mathbb{R}$" },
        correct: "A",
        explanation: "$2^x > 0$, więc $2^x - 3 > -3$. Wykres $2^x$ przesunięty o $3$ w dół – wartości od $-3$ (bez niej).",
        trap: "$2^x$ nigdy nie jest równe $0$, więc $-3$ nie należy do zbioru wartości – nawias otwarty.",
      },
    ],
    zaawansowany: [
      {
        id: "wl-z1",
        prompt: "Funkcja $f(x) = a^x$ przyjmuje dla $x = 2$ wartość $25$. Wtedy $f(-1)$ jest równe:",
        options: { A: "$\\frac{1}{5}$", B: "$-5$", C: "$5$", D: "$-\\frac{1}{5}$" },
        correct: "A",
        explanation: "$a^2 = 25$, więc $a = 5$ i $f(-1) = 5^{-1} = \\frac{1}{5}$.",
      },
      {
        id: "wl-z2",
        prompt: "Miejscem zerowym funkcji $f(x) = \\log_3 (x + 2)$ jest:",
        options: { A: "$-1$", B: "$-2$", C: "$1$", D: "$3$" },
        correct: "A",
        explanation: "$\\log_3 (x + 2) = 0$, gdy $x + 2 = 1$, czyli $x = -1$.",
      },
      {
        id: "wl-z3",
        prompt: "Rozwiązaniem równania $4^x = 2^{x + 5}$ jest liczba:",
        options: { A: "$5$", B: "$1$", C: "$3$", D: "$\\frac{5}{3}$" },
        correct: "A",
        explanation: "$4^x = (2^2)^x = 2^{2x}$, więc $2x = x + 5$ i $x = 5$.",
        trap: "Najpierw ta sama podstawa: $4^x$ to $2^{2x}$, a nie $2^{x + 2}$.",
      },
    ],
  },
};

export default content;
