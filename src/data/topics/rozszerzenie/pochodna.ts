import { sample } from "@/lib/plot";
import type { TopicContent } from "@/types/topic";

// Rozszerzenie – pochodna funkcji, styczna, monotoniczność i optymalizacja (dział XIII, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Pochodna – wzory, które trzeba mieć w palcach",
      body:
        "Pochodna mówi, jak szybko funkcja rośnie lub maleje w danym punkcie. Liczy się ją z kilku wzorów:\n\n" +
        "• $(x^n)' = nx^{n - 1}$, stała ma pochodną $0$,\n\n" +
        "• pochodna sumy to suma pochodnych, stałą wyciągasz przed pochodną,\n\n" +
        "• iloraz: $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$ – w liczniku MINUS i kolejność ma znaczenie.",
      example: {
        prompt: "Oblicz pochodną funkcji $f(x) = x^3 - 3x^2 + 2$.",
        solution: "$(x^3)' = 3x^2$, $(3x^2)' = 6x$, $(2)' = 0$.\n$f'(x) = 3x^2 - 6x$.",
      },
      check: {
        id: "rz-p-t1",
        prompt: "Pochodna funkcji $f(x) = 2x^3 - 5x + 1$ to:",
        options: { A: "$f'(x) = 6x^2 - 5$", B: "$f'(x) = 6x^2 - 5x$", C: "$f'(x) = 2x^2 - 5$", D: "$f'(x) = 6x^3 - 5$" },
        correct: "A",
        explanation: "$(2x^3)' = 6x^2$, $(5x)' = 5$, $(1)' = 0$.",
        trap: "Pochodna $5x$ to $5$, a nie $5x$ – wykładnik maleje o jeden.",
      },
    },
    {
      title: "Styczna do wykresu",
      body:
        "Pochodna w punkcie $x_0$ to współczynnik kierunkowy stycznej w tym punkcie. Równanie stycznej:\n\n" +
        "$y = f'(x_0)(x - x_0) + f(x_0)$.\n\n" +
        "Potrzebujesz więc dwóch liczb: $f(x_0)$ (punkt styczności) i $f'(x_0)$ (nachylenie) – nie pomyl ich.",
      example: {
        prompt: "Wyznacz równanie stycznej do wykresu $f(x) = x^2$ w punkcie o odciętej $x_0 = 1$.",
        solution: "$f(1) = 1$, $f'(x) = 2x$, $f'(1) = 2$.\n$y = 2(x - 1) + 1$\n$y = 2x - 1$.",
      },
      check: {
        id: "rz-p-t2",
        prompt: "Współczynnik kierunkowy stycznej do wykresu $f(x) = x^3 - x$ w punkcie o odciętej $2$ jest równy:",
        options: { A: "$11$", B: "$6$", C: "$12$", D: "$4$" },
        correct: "A",
        explanation: "$f'(x) = 3x^2 - 1$, więc $f'(2) = 12 - 1 = 11$.",
        trap: "$6$ to $f(2)$ – wartość funkcji, a nie nachylenie stycznej.",
      },
    },
    {
      title: "Monotoniczność, ekstrema i optymalizacja",
      body:
        "Gdzie $f' > 0$, funkcja rośnie, gdzie $f' < 0$ – maleje. Ekstremum jest tam, gdzie pochodna zmienia znak: " +
        "z $+$ na $-$ – maksimum, z $-$ na $+$ – minimum. Samo $f'(x_0) = 0$ nie wystarcza.\n\n" +
        "Zadanie optymalizacyjne: zapisz wielkość jako funkcję jednej zmiennej, ustal jej dziedzinę, policz pochodną, " +
        "zbadaj jej znak i pokaż, że w znalezionym punkcie jest największa (najmniejsza) wartość.",
      example: {
        prompt: "Wyznacz ekstrema funkcji $f(x) = x^3 - 3x^2 + 2$.",
        solution:
          "$f'(x) = 3x^2 - 6x = 3x(x - 2)$.\n" +
          "$f' > 0$ dla $x < 0$ i $x > 2$, $f' < 0$ dla $0 < x < 2$.\n" +
          "Maksimum w $x = 0$: $f(0) = 2$. Minimum w $x = 2$: $f(2) = 8 - 12 + 2 = -2$.",
      },
      plot: {
        x: [-1.5, 3.5],
        y: [-3, 3.5],
        lines: [sample((x) => x ** 3 - 3 * x * x + 2, -0.9, 3.1)],
        dots: [{ at: [0, 2] }, { at: [2, -2] }],
      },
      check: {
        id: "rz-p-t3",
        prompt: "Funkcja $f(x) = x^3 - 12x$ ma minimum lokalne w punkcie:",
        options: { A: "$x = 2$", B: "$x = -2$", C: "$x = 0$", D: "$x = 4$" },
        correct: "A",
        explanation:
          "$f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$. Znak pochodnej: $+$, potem $-$ między $-2$ a $2$, potem $+$. Zmiana z $-$ na $+$ w $x = 2$ – minimum.",
        trap: "W $x = -2$ pochodna też jest zerem, ale zmienia znak z $+$ na $-$ – tam jest maksimum.",
      },
    },
  ],
  formulas: [
    { label: "Pochodna potęgi", tex: "(x^n)' = nx^{n - 1}" },
    { label: "Pochodna iloczynu", tex: "(fg)' = f'g + fg'" },
    { label: "Pochodna ilorazu", tex: "\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}" },
    { label: "Styczna w punkcie x₀", tex: "y = f'(x_0)(x - x_0) + f(x_0)" },
    { label: "Monotoniczność", tex: "f' > 0 \\Rightarrow f \\nearrow, \\quad f' < 0 \\Rightarrow f \\searrow" },
  ],
  traps: [
    "Równanie stycznej potrzebuje $f(x_0)$ i $f'(x_0)$ – to dwie różne liczby.",
    "$f'(x_0) = 0$ to nie zawsze ekstremum – pochodna musi zmienić znak.",
    "We wzorze na pochodną ilorazu w liczniku jest minus: $f'g - fg'$.",
    "W optymalizacji wyznacz dziedzinę (np. długość boku $> 0$) i uzasadnij, że to wartość największa, a nie tylko miejsce zerowe pochodnej.",
  ],
  openTasks: [
    {
      id: "rz-p-o1",
      difficulty: "sredni",
      points: 3,
      prompt:
        "Wyznacz równanie stycznej do wykresu funkcji $f(x) = x^3 - 2x$ w punkcie o odciętej $x_0 = 1$. Jako odpowiedź wpisz wyraz wolny $b$ w równaniu $y = ax + b$.",
      answers: ["-2"],
      answerLabel: "b =",
      hints: ["Policz $f(1)$ i $f'(1)$."],
      solution: [
        { step: "$f(1) = 1 - 2 = -1$.", points: 1 },
        { step: "$f'(x) = 3x^2 - 2$, $f'(1) = 1$.", points: 1 },
        { step: "$y = 1 \\cdot (x - 1) - 1$, czyli $y = x - 2$.", points: 1 },
      ],
    },
    {
      id: "rz-p-o2",
      difficulty: "zaawansowany",
      points: 6,
      prompt:
        "Rozważamy prostopadłościany o podstawie kwadratowej, w których suma długości wszystkich krawędzi jest równa $48$. Oblicz największą możliwą objętość takiego prostopadłościanu.",
      answers: ["64"],
      answerLabel: "V =",
      hints: ["Krawędź podstawy $a$, wysokość $h$: $8a + 4h = 48$.", "Zapisz $V$ jako funkcję zmiennej $a$ i zbadaj pochodną."],
      solution: [
        { step: "$8a + 4h = 48$, więc $h = 12 - 2a$.", points: 1 },
        { step: "$V(a) = a^2(12 - 2a) = 12a^2 - 2a^3$, dziedzina $a \\in (0, 6)$.", points: 1 },
        { step: "$V'(a) = 24a - 6a^2 = 6a(4 - a)$.", points: 1 },
        { step: "$V'(a) = 0$ dla $a = 4$; $V' > 0$ na $(0, 4)$, $V' < 0$ na $(4, 6)$.", points: 1 },
        { step: "Największa objętość dla $a = 4$, $h = 4$.", points: 1 },
        { step: "$V(4) = 16 \\cdot 4 = 64$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-p-p1",
        prompt: "Pochodna funkcji $f(x) = x^4 - 3x^2 + 7x$ to:",
        options: {
          A: "$f'(x) = 4x^3 - 6x + 7$",
          B: "$f'(x) = 4x^3 - 6x$",
          C: "$f'(x) = x^3 - 3x + 7$",
          D: "$f'(x) = 4x^4 - 6x^2 + 7$",
        },
        correct: "A",
        explanation: "$(x^4)' = 4x^3$, $(3x^2)' = 6x$, $(7x)' = 7$.",
      },
      {
        id: "rz-p-p2",
        prompt: "Dla funkcji $f(x) = x^2 - 4x$ wartość $f'(3)$ jest równa:",
        options: { A: "$2$", B: "$-3$", C: "$6$", D: "$5$" },
        correct: "A",
        explanation: "$f'(x) = 2x - 4$, więc $f'(3) = 2$.",
        trap: "$-3$ to $f(3)$, a pytanie jest o pochodną.",
      },
    ],
    sredni: [
      {
        id: "rz-p-s1",
        prompt: "Funkcja $f(x) = x^3 - 3x$ jest malejąca w przedziale:",
        options: {
          A: "$\\langle -1, 1 \\rangle$",
          B: "$(-\\infty, -1 \\rangle$",
          C: "$\\langle 1, +\\infty)$",
          D: "$\\langle 0, 3 \\rangle$",
        },
        correct: "A",
        explanation: "$f'(x) = 3x^2 - 3 = 3(x - 1)(x + 1) \\leq 0$ dla $x \\in \\langle -1, 1 \\rangle$.",
      },
      {
        id: "rz-p-s2",
        prompt: "Styczna do wykresu funkcji $f(x) = x^2 + 1$ w punkcie $(1, 2)$ ma równanie:",
        options: { A: "$y = 2x$", B: "$y = 2x + 2$", C: "$y = x + 1$", D: "$y = 2x - 1$" },
        correct: "A",
        explanation: "$f'(1) = 2$, więc $y = 2(x - 1) + 2 = 2x$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-p-z1",
        prompt: "Pochodna funkcji $f(x) = \\frac{2x + 1}{x - 1}$ (dla $x \\neq 1$) to:",
        options: {
          A: "$f'(x) = \\frac{-3}{(x - 1)^2}$",
          B: "$f'(x) = \\frac{3}{(x - 1)^2}$",
          C: "$f'(x) = 2$",
          D: "$f'(x) = \\frac{4x - 1}{(x - 1)^2}$",
        },
        correct: "A",
        explanation: "$\\frac{2(x - 1) - (2x + 1) \\cdot 1}{(x - 1)^2} = \\frac{2x - 2 - 2x - 1}{(x - 1)^2} = \\frac{-3}{(x - 1)^2}$.",
        trap: "Zamiana kolejności w liczniku ($fg' - f'g$) zmienia znak wyniku.",
      },
      {
        id: "rz-p-z2",
        prompt: "Największa wartość funkcji $f(x) = x^3 - 3x$ w przedziale $\\langle 0, 2 \\rangle$ jest równa:",
        options: { A: "$2$", B: "$0$", C: "$-2$", D: "$1$" },
        correct: "A",
        explanation: "$f'(x) = 0$ dla $x = 1$ (w przedziale), $f(1) = -2$ to minimum. Końce: $f(0) = 0$, $f(2) = 8 - 6 = 2$. Największa: $2$.",
        trap: "Punkt, w którym $f' = 0$, daje tu minimum – największa wartość jest na końcu przedziału.",
      },
    ],
  },
};

export default content;
