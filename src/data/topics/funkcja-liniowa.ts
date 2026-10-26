import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Wzór i współczynniki",
      body:
        "Funkcja liniowa ma wzór $f(x) = ax + b$.\n\nWspółczynnik kierunkowy $a$ opisuje nachylenie: $a > 0$ – funkcja rosnąca, $a < 0$ – malejąca, $a = 0$ – stała. Wyraz wolny $b$ wskazuje punkt przecięcia z osią $OY$: $(0, b)$.",
    },
    {
      title: "Miejsce zerowe",
      body: "Rozwiązujemy równanie $ax + b = 0$. Dla $a \\neq 0$ otrzymujemy $x_0 = -\\frac{b}{a}$.",
    },
    {
      title: "Prosta przez dwa punkty",
      body:
        "Współczynnik kierunkowy liczymy ze wzoru $a = \\frac{y_2 - y_1}{x_2 - x_1}$, a $b$ wyznaczamy, podstawiając współrzędne jednego z punktów.",
      example: {
        prompt: "Wyznacz wzór prostej przechodzącej przez punkty $(1, 3)$ i $(3, 7)$.",
        solution: "$a = \\frac{7 - 3}{3 - 1} = 2$. Z punktu $(1, 3)$: $3 = 2 \\cdot 1 + b$, więc $b = 1$. Wzór: $y = 2x + 1$.",
      },
      plot: {
        x: [-3, 4],
        y: [-3, 8],
        lines: [[[-2, -3], [3.5, 8]]],
        dots: [{ at: [1, 3] }, { at: [3, 7] }],
      },
    },
    {
      title: "Proste równoległe i prostopadłe",
      body:
        "Proste $y = a_1x + b_1$ i $y = a_2x + b_2$ są równoległe, gdy $a_1 = a_2$, a prostopadłe, gdy $a_1 \\cdot a_2 = -1$.\n\nNp. prostopadła do $y = 3x$ ma współczynnik $-\\frac{1}{3}$.",
    },
  ],
  formulas: [
    { label: "Wzór funkcji liniowej", tex: "f(x) = ax + b" },
    { label: "Miejsce zerowe", tex: "x_0 = -\\frac{b}{a}, \\quad a \\neq 0" },
    { label: "Współczynnik kierunkowy", tex: "a = \\frac{y_2 - y_1}{x_2 - x_1}" },
    { label: "Proste równoległe", tex: "a_1 = a_2" },
    { label: "Proste prostopadłe", tex: "a_1 \\cdot a_2 = -1" },
  ],
  tests: {
    podstawowy: [
      {
        id: "fl-p1",
        prompt: "Miejscem zerowym funkcji $f(x) = 2x - 6$ jest:",
        options: { A: "$-6$", B: "$-3$", C: "$2$", D: "$3$" },
        correct: "D",
        hint: "Rozwiąż równanie $2x - 6 = 0$.",
        explanation: "$2x - 6 = 0$, więc $x = 3$.",
      },
      {
        id: "fl-p2",
        prompt: "Funkcja $f(x) = -3x + 2$ jest:",
        options: { A: "rosnąca", B: "malejąca", C: "stała", D: "rosnąca tylko dla $x > 0$" },
        correct: "B",
        hint: "Spójrz na znak współczynnika przy $x$.",
        explanation: "$a = -3 < 0$, więc funkcja jest malejąca.",
      },
      {
        id: "fl-p3",
        prompt: "Wykres funkcji $f(x) = 4x - 5$ przecina oś $OY$ w punkcie:",
        options: { A: "$(0, -5)$", B: "$(-5, 0)$", C: "$(0, 4)$", D: "$\\left(\\frac{5}{4}, 0\\right)$" },
        correct: "A",
        hint: "Na osi $OY$ mamy $x = 0$ – oblicz $f(0)$.",
        explanation: "$f(0) = -5$, więc punkt $(0, -5)$.",
      },
    ],
    sredni: [
      {
        id: "fl-s1",
        prompt: "Prosta przechodzi przez punkty $(0, 1)$ i $(2, 5)$. Jej współczynnik kierunkowy jest równy:",
        options: { A: "$-2$", B: "$\\frac{1}{2}$", C: "$2$", D: "$4$" },
        correct: "C",
        explanation: "$a = \\frac{5 - 1}{2 - 0} = 2$.",
      },
      {
        id: "fl-s2",
        prompt: "Do wykresu funkcji $f(x) = ax + 3$ należy punkt $(2, 7)$. Wtedy:",
        options: { A: "$a = 2$", B: "$a = 5$", C: "$a = -2$", D: "$a = 4$" },
        correct: "A",
        explanation: "$7 = 2a + 3$, więc $a = 2$.",
      },
      {
        id: "fl-s3",
        prompt: "Prosta równoległa do prostej $y = -2x + 5$, przechodząca przez punkt $(0, 1)$, ma równanie:",
        options: { A: "$y = -2x + 1$", B: "$y = \\frac{1}{2}x + 1$", C: "$y = -2x + 5$", D: "$y = 2x + 1$" },
        correct: "A",
        explanation: "Równoległa ma ten sam współczynnik $a = -2$, a punkt $(0, 1)$ daje $b = 1$.",
      },
    ],
    zaawansowany: [
      {
        id: "fl-z1",
        prompt: "Prosta prostopadła do prostej $y = 3x - 1$, przechodząca przez punkt $(3, 2)$, ma równanie:",
        options: {
          A: "$y = -\\frac{1}{3}x + 3$",
          B: "$y = -\\frac{1}{3}x + 2$",
          C: "$y = 3x - 7$",
          D: "$y = \\frac{1}{3}x + 1$",
        },
        correct: "A",
        explanation: "$a = -\\frac{1}{3}$. Z punktu $(3, 2)$: $2 = -1 + b$, więc $b = 3$.",
      },
      {
        id: "fl-z2",
        prompt: "Funkcja $f(x) = (2m - 4)x + 1$ jest malejąca dla:",
        options: { A: "$m < 2$", B: "$m > 2$", C: "$m = 2$", D: "$m < -2$" },
        correct: "A",
        explanation: "Malejąca, gdy $2m - 4 < 0$, czyli $m < 2$.",
      },
      {
        id: "fl-z3",
        prompt: "Wykres funkcji liniowej przechodzi przez punkty $(-1, 5)$ i $(2, -1)$. Jej miejscem zerowym jest:",
        options: { A: "$\\frac{3}{2}$", B: "$3$", C: "$-\\frac{3}{2}$", D: "$\\frac{2}{3}$" },
        correct: "A",
        explanation: "$a = \\frac{-1 - 5}{2 + 1} = -2$, z punktu $(-1, 5)$: $b = 3$. $-2x + 3 = 0 \\Rightarrow x = \\frac{3}{2}$.",
      },
    ],
  },
};

export default content;
