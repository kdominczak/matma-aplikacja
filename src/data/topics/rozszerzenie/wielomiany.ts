import type { TopicContent } from "@/types/topic";

// Rozszerzenie – wielomiany (dział III podstawy, wymagania R: równania i nierówności wielomianowe; II.R5 – wzory na a³ ± b³).
const content: TopicContent = {
  theory: [
    {
      title: "Twierdzenie Bézouta – pierwiastek i reszta",
      body:
        "Liczba $a$ jest pierwiastkiem wielomianu $W$ wtedy i tylko wtedy, gdy $W$ dzieli się przez dwumian $(x - a)$. " +
        "To jedno twierdzenie robi większość roboty w zadaniach z wielomianami.\n\n" +
        "Bonus: reszta z dzielenia $W(x)$ przez $(x - a)$ to po prostu $W(a)$ – bez dzielenia pisemnego.\n\n" +
        "Uwaga na znak: dzielenie przez $(x + 1)$ to dzielenie przez $(x - (-1))$, więc liczysz $W(-1)$.",
      example: {
        prompt: "Oblicz resztę z dzielenia $W(x) = x^3 - 2x^2 + 3x - 5$ przez $(x - 2)$.",
        solution: "Reszta to $W(2)$.\n$W(2) = 8 - 8 + 6 - 5 = 1$.\nReszta jest równa $1$.",
      },
      check: {
        id: "rz-w-t1",
        prompt: "Reszta z dzielenia wielomianu $W(x) = x^3 + 2x - 7$ przez dwumian $(x + 1)$ jest równa:",
        options: { A: "$-10$", B: "$-4$", C: "$-6$", D: "$10$" },
        correct: "A",
        explanation: "Dzielimy przez $(x - (-1))$, więc reszta to $W(-1) = -1 - 2 - 7 = -10$.",
        trap: "$-4$ to $W(1)$ – przy $(x + 1)$ podstawiasz $-1$, nie $1$.",
      },
    },
    {
      title: "Pierwiastki całkowite i rozkład na czynniki",
      body:
        "Gdy współczynniki są całkowite, każdy pierwiastek całkowity jest dzielnikiem wyrazu wolnego. Sprawdzasz kandydatów, " +
        "a po znalezieniu jednego dzielisz wielomian przez $(x - a)$ i zostaje trójmian kwadratowy.\n\n" +
        "Często szybsze jest grupowanie wyrazów: $x^3 - 3x^2 - 4x + 12 = x^2(x - 3) - 4(x - 3) = (x - 3)(x^2 - 4)$.\n\n" +
        "Pierwiastek, który pojawia się w rozkładzie dwa razy (np. $(x - 2)^2$), jest pierwiastkiem podwójnym – to wciąż jedna liczba.",
      example: {
        prompt: "Rozwiąż równanie $x^3 - 2x^2 - 5x + 6 = 0$.",
        solution:
          "Kandydaci (dzielniki $6$): $\\pm 1, \\pm 2, \\pm 3, \\pm 6$.\n" +
          "$W(1) = 1 - 2 - 5 + 6 = 0$, więc dzielimy przez $(x - 1)$.\n" +
          "$x^3 - 2x^2 - 5x + 6 = (x - 1)(x^2 - x - 6)$\n" +
          "$x^2 - x - 6 = (x - 3)(x + 2)$\n" +
          "Rozwiązania: $x = -2$, $x = 1$, $x = 3$.",
      },
      check: {
        id: "rz-w-t2",
        prompt: "Ile różnych pierwiastków ma wielomian $W(x) = (x^2 - 4)(x^2 + 1)(x - 2)$?",
        options: { A: "$2$", B: "$3$", C: "$4$", D: "$5$" },
        correct: "A",
        explanation:
          "$x^2 - 4 = 0$ daje $x = 2$ lub $x = -2$, $x^2 + 1$ nie ma pierwiastków, a $x - 2 = 0$ daje znowu $2$. Różne pierwiastki: $-2$ i $2$ ($2$ jest podwójny).",
        trap: "Liczba $2$ pojawia się dwa razy, ale to jeden pierwiastek (podwójny). Stopień wielomianu ($5$) to nie liczba pierwiastków.",
      },
    },
    {
      title: "Nierówności wielomianowe – szkic znaku",
      body:
        "Rozłóż wielomian na czynniki i zaznacz pierwiastki na osi. Szkic zaczynasz z prawej strony: nad osią, gdy współczynnik " +
        "przy najwyższej potędze jest dodatni, pod osią – gdy ujemny.\n\n" +
        "Przy pierwiastku pojedynczym (i każdym o nieparzystej krotności) wykres przechodzi na drugą stronę osi, " +
        "przy podwójnym – tylko jej dotyka i wraca.\n\n" +
        "Na koniec odczytaj przedziały i pilnuj końców: przy $\\geq$ i $\\leq$ pierwiastki należą do rozwiązania.",
      example: {
        prompt: "Rozwiąż nierówność $x^3 - 2x^2 - 5x + 6 > 0$.",
        solution:
          "Z poprzedniego kroku: $(x + 2)(x - 1)(x - 3) > 0$.\n" +
          "Z prawej nad osią (współczynnik $1 > 0$), przy każdym pierwiastku zmiana strony.\n" +
          "Znak: $(3, +\\infty)$ dodatni, $(1, 3)$ ujemny, $(-2, 1)$ dodatni, $(-\\infty, -2)$ ujemny.\n" +
          "Rozwiązanie: $x \\in (-2, 1) \\cup (3, +\\infty)$.",
      },
      check: {
        id: "rz-w-t3",
        prompt: "Zbiorem rozwiązań nierówności $(x - 2)^2(x + 1) < 0$ jest:",
        options: {
          A: "$(-\\infty, -1)$",
          B: "$(-1, +\\infty)$",
          C: "$(-\\infty, -1) \\cup (2, +\\infty)$",
          D: "$(-1, 2)$",
        },
        correct: "A",
        explanation:
          "$(x - 2)^2 \\geq 0$, więc iloczyn jest ujemny tylko wtedy, gdy $x + 1 < 0$ (i $x \\neq 2$). Stąd $x < -1$.",
        trap: "Przy podwójnym pierwiastku $2$ znak się nie zmienia – wykres tylko dotyka osi.",
      },
    },
  ],
  formulas: [
    { label: "Twierdzenie Bézouta", tex: "W(a) = 0 \\iff (x - a) \\mid W(x)" },
    { label: "Reszta z dzielenia przez (x − a)", tex: "r = W(a)" },
    { label: "Różnica sześcianów", tex: "a^3 - b^3 = (a - b)(a^2 + ab + b^2)" },
    { label: "Suma sześcianów", tex: "a^3 + b^3 = (a + b)(a^2 - ab + b^2)" },
    { label: "Sześcian sumy", tex: "(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3" },
  ],
  traps: [
    "Dzielenie przez $(x + a)$ to podstawienie $-a$, nie $a$.",
    "Pierwiastek podwójny to jedna liczba – i przy nim znak wielomianu się nie zmienia.",
    "Szkic znaku zaczynasz z prawej i patrzysz na współczynnik przy najwyższej potędze, a nie na wyraz wolny.",
    "Trójmian bez pierwiastków (np. $x^2 + 1$) ma stały znak – nie wnosi nic do rozwiązania, ale nie wolno go „skreślić” bez sprawdzenia znaku.",
  ],
  openTasks: [
    {
      id: "rz-w-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Rozwiąż równanie $x^3 + 2x^2 - 9x - 18 = 0$.",
      answers: ["-3;-2;3"],
      answerLabel: "x =",
      hints: ["Pogrupuj wyrazy po dwa: $x^2(x + 2) - 9(\\ldots)$."],
      solution: [
        { step: "Grupowanie: $x^2(x + 2) - 9(x + 2) = (x + 2)(x^2 - 9)$.", points: 1 },
        { step: "Rozkład: $(x + 2)(x - 3)(x + 3) = 0$.", points: 1 },
        { step: "Rozwiązania: $x = -3$, $x = -2$, $x = 3$.", points: 1 },
      ],
    },
    {
      id: "rz-w-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt:
        "Wielomian $W(x) = x^3 + mx^2 - 4x - 12$ jest podzielny przez dwumian $(x - 2)$. Oblicz $m$ i wyznacz pozostałe pierwiastki tego wielomianu.",
      answers: ["3"],
      answerLabel: "m =",
      hints: ["Z twierdzenia Bézouta $W(2) = 0$.", "Po wyznaczeniu $m$ pogrupuj wyrazy."],
      solution: [
        { step: "Warunek podzielności: $W(2) = 8 + 4m - 8 - 12 = 0$.", points: 1 },
        { step: "Stąd $4m = 12$, czyli $m = 3$.", points: 1 },
        { step: "$W(x) = x^2(x + 3) - 4(x + 3) = (x + 3)(x - 2)(x + 2)$ – pozostałe pierwiastki: $-3$ i $-2$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-w-p1",
        prompt: "Liczba $2$ jest pierwiastkiem wielomianu $W(x) = x^3 + ax - 4$. Wtedy:",
        options: { A: "$a = -2$", B: "$a = 2$", C: "$a = -6$", D: "$a = 4$" },
        correct: "A",
        explanation: "$W(2) = 8 + 2a - 4 = 0$, więc $2a = -4$ i $a = -2$.",
      },
      {
        id: "rz-w-p2",
        prompt: "Wielomian $x^3 - 8$ rozłożony na czynniki to:",
        options: {
          A: "$(x - 2)(x^2 + 2x + 4)$",
          B: "$(x - 2)(x^2 - 2x + 4)$",
          C: "$(x - 2)^3$",
          D: "$(x + 2)(x^2 - 2x + 4)$",
        },
        correct: "A",
        explanation: "Różnica sześcianów: $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$ dla $a = x$, $b = 2$.",
        trap: "W różnicy sześcianów w drugim nawiasie jest PLUS: $a^2 + ab + b^2$.",
      },
    ],
    sredni: [
      {
        id: "rz-w-s1",
        prompt: "Reszta z dzielenia wielomianu $W(x) = 2x^4 - 3x^2 + x - 1$ przez dwumian $(x - 2)$ jest równa:",
        options: { A: "$21$", B: "$17$", C: "$13$", D: "$-21$" },
        correct: "A",
        explanation: "$W(2) = 32 - 12 + 2 - 1 = 21$.",
        trap: "$17$ to $W(-2)$ – przy $(x - 2)$ podstawiasz $2$.",
      },
      {
        id: "rz-w-s2",
        prompt: "Pierwiastkami wielomianu $W(x) = x^3 - 3x^2 - 4x + 12$ są liczby:",
        options: { A: "$-2$, $2$, $3$", B: "$-3$, $-2$, $2$", C: "$3$ i $4$", D: "$-2$ i $3$" },
        correct: "A",
        explanation: "$W(x) = x^2(x - 3) - 4(x - 3) = (x - 3)(x - 2)(x + 2)$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-w-z1",
        prompt: "Wielomian $W(x) = x^3 + bx^2 + cx - 6$ jest podzielny przez $(x - 1)$ i przez $(x + 2)$. Wtedy:",
        options: { A: "$b = 4$, $c = 1$", B: "$b = 1$, $c = 4$", C: "$b = -4$, $c = 9$", D: "$b = 2$, $c = 3$" },
        correct: "A",
        explanation:
          "$W(1) = 1 + b + c - 6 = 0$, czyli $b + c = 5$. $W(-2) = -8 + 4b - 2c - 6 = 0$, czyli $2b - c = 7$. Dodając: $3b = 12$, $b = 4$, $c = 1$.",
      },
      {
        id: "rz-w-z2",
        prompt: "Zbiorem rozwiązań nierówności $x^3 - 4x \\geq 0$ jest:",
        options: {
          A: "$\\langle -2, 0 \\rangle \\cup \\langle 2, +\\infty)$",
          B: "$(-\\infty, -2 \\rangle \\cup \\langle 0, 2 \\rangle$",
          C: "$\\langle 2, +\\infty)$",
          D: "$\\langle -2, 2 \\rangle$",
        },
        correct: "A",
        explanation:
          "$x(x - 2)(x + 2) \\geq 0$. Z prawej nad osią, przy każdym pierwiastku zmiana: dodatni na $\\langle 2, +\\infty)$ i $\\langle -2, 0 \\rangle$.",
        trap: "Podzielenie obu stron przez $x$ gubi rozwiązania – $x$ może być ujemny albo równy zero.",
      },
    ],
  },
};

export default content;
