import type { TopicContent } from "@/types/topic";

// Rozszerzenie – równania i nierówności z wartością bezwzględną i z parametrem (dział III, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Wartość bezwzględna – podział na przedziały",
      body:
        "$|x - a|$ to odległość liczby $x$ od $a$ na osi. W równaniach z kilkoma wartościami bezwzględnymi dzielisz oś " +
        "w miejscach zerowych wyrażeń pod modułem i w każdym przedziale opuszczasz moduł ze znakiem.\n\n" +
        "Najważniejsze: wynik z danego przedziału przyjmujesz tylko wtedy, gdy do tego przedziału należy.",
      example: {
        prompt: "Rozwiąż równanie $|x - 1| + |x + 2| = 5$.",
        solution:
          "Punkty podziału: $-2$ i $1$.\n" +
          "$x < -2$: $-(x - 1) - (x + 2) = 5$, czyli $-2x - 1 = 5$, $x = -3$ – należy do przedziału.\n" +
          "$-2 \\leq x < 1$: $(1 - x) + (x + 2) = 3 \\neq 5$ – brak rozwiązań.\n" +
          "$x \\geq 1$: $2x + 1 = 5$, $x = 2$ – należy.\n" +
          "Rozwiązania: $x = -3$, $x = 2$.",
      },
      check: {
        id: "rz-m-t1",
        prompt: "Równanie $|x - 3| = 2x$ ma:",
        options: { A: "jedno rozwiązanie $x = 1$", B: "jedno rozwiązanie $x = -3$", C: "dwa rozwiązania: $1$ i $-3$", D: "brak rozwiązań" },
        correct: "A",
        explanation:
          "Dla $x \\geq 3$: $x - 3 = 2x$ daje $x = -3$ – poza przedziałem. Dla $x < 3$: $3 - x = 2x$ daje $x = 1$ – należy. Jedyne rozwiązanie: $1$.",
        trap: "$x = -3$ wychodzi z rachunku, ale nie należy do przedziału $x \\geq 3$ (zresztą prawa strona $2x$ byłaby ujemna).",
      },
    },
    {
      title: "Równanie kwadratowe z parametrem – liczba rozwiązań",
      body:
        "Liczbę rozwiązań równania $ax^2 + bx + c = 0$ mówi delta: dwa ($\\Delta > 0$), jedno ($\\Delta = 0$), zero ($\\Delta < 0$).\n\n" +
        "Gdy parametr stoi przy $x^2$, zacznij od przypadku $a = 0$ – wtedy równanie jest liniowe i delty nie ma. " +
        "To najczęściej gubiony punkt w zadaniach maturalnych.",
      example: {
        prompt: "Dla jakich $m$ równanie $x^2 - 2mx + m + 6 = 0$ ma dwa różne rozwiązania?",
        solution:
          "$\\Delta = 4m^2 - 4(m + 6) > 0$\n" +
          "$m^2 - m - 6 > 0$, czyli $(m - 3)(m + 2) > 0$.\n" +
          "$m \\in (-\\infty, -2) \\cup (3, +\\infty)$.",
      },
      check: {
        id: "rz-m-t2",
        prompt: "Równanie $x^2 + 4x + m = 0$ ma dokładnie jedno rozwiązanie dla:",
        options: { A: "$m = 4$", B: "$m = -4$", C: "$m = 16$", D: "$m = 2$" },
        correct: "A",
        explanation: "$\\Delta = 16 - 4m = 0$, więc $m = 4$ (wtedy $x = -2$).",
      },
    },
    {
      title: "Wzory Viète'a w zadaniach z parametrem",
      body:
        "Gdy warunek dotyczy rozwiązań (ich sumy, kwadratów, odwrotności), nie licz ich wprost – użyj wzorów Viète'a: " +
        "$x_1 + x_2 = \\frac{-b}{a}$, $x_1 x_2 = \\frac{c}{a}$.\n\n" +
        "Przydatne przekształcenia: $x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$ oraz $\\frac{1}{x_1} + \\frac{1}{x_2} = \\frac{x_1 + x_2}{x_1 x_2}$.\n\n" +
        "Zawsze dołóż warunek istnienia rozwiązań ($\\Delta > 0$ albo $\\Delta \\geq 0$ – zgodnie z treścią) i na końcu wybierz część wspólną.",
      example: {
        prompt: "Dla jakich $m$ równanie $x^2 + mx + 4 = 0$ ma dwa różne rozwiązania, dla których $x_1^2 + x_2^2 = 17$?",
        solution:
          "$\\Delta = m^2 - 16 > 0$, czyli $|m| > 4$.\n" +
          "$x_1 + x_2 = -m$, $x_1 x_2 = 4$.\n" +
          "$x_1^2 + x_2^2 = m^2 - 8 = 17$, więc $m^2 = 25$.\n" +
          "$m = -5$ lub $m = 5$ – oba spełniają $|m| > 4$.",
      },
      check: {
        id: "rz-m-t3",
        prompt: "Dla rozwiązań $x_1$, $x_2$ równania $x^2 - 5x + 3 = 0$ wartość $\\frac{1}{x_1} + \\frac{1}{x_2}$ jest równa:",
        options: { A: "$\\frac{5}{3}$", B: "$\\frac{3}{5}$", C: "$-\\frac{5}{3}$", D: "$5$" },
        correct: "A",
        explanation: "$\\frac{x_1 + x_2}{x_1 x_2} = \\frac{5}{3}$ (a $\\Delta = 25 - 12 > 0$, więc rozwiązania istnieją).",
        trap: "Suma rozwiązań to $\\frac{-b}{a} = 5$, a nie $-5$ – minus przy $b$ się znosi.",
      },
    },
  ],
  formulas: [
    { label: "Wartość bezwzględna", tex: "|x| = \\begin{cases} x, & x \\geq 0 \\\\ -x, & x < 0 \\end{cases}" },
    { label: "Nierówność z modułem", tex: "|x - a| < r \\iff a - r < x < a + r" },
    { label: "Wzory Viète'a", tex: "x_1 + x_2 = \\frac{-b}{a}, \\quad x_1 x_2 = \\frac{c}{a}" },
    { label: "Suma kwadratów rozwiązań", tex: "x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2" },
    { label: "Dwa rozwiązania tego samego znaku", tex: "\\Delta > 0, \\quad x_1 x_2 > 0" },
  ],
  traps: [
    "Rozwiązanie z przedziału przyjmujesz tylko, gdy do niego należy.",
    "Parametr przy $x^2$: najpierw przypadek $a = 0$ (równanie liniowe), dopiero potem delta.",
    "Wzory Viète'a nie gwarantują, że rozwiązania istnieją – zawsze dopisz warunek na deltę.",
    "„Dwa różne rozwiązania” to $\\Delta > 0$, a „rozwiązania” (mogą być równe) – $\\Delta \\geq 0$.",
  ],
  openTasks: [
    {
      id: "rz-m-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Rozwiąż równanie $|x - 1| + |x + 2| = 5$.",
      answers: ["-3;2"],
      answerLabel: "x =",
      hints: ["Podziel oś liczbami $-2$ i $1$."],
      solution: [
        { step: "Podział osi na przedziały $(-\\infty, -2)$, $\\langle -2, 1)$, $\\langle 1, +\\infty)$.", points: 1 },
        { step: "Równania w przedziałach: $-2x - 1 = 5$, $3 = 5$ (sprzeczne), $2x + 1 = 5$.", points: 1 },
        { step: "Rozwiązania należące do przedziałów: $x = -3$, $x = 2$.", points: 1 },
      ],
    },
    {
      id: "rz-m-o2",
      difficulty: "zaawansowany",
      points: 5,
      prompt:
        "Wyznacz wszystkie wartości parametru $m$, dla których równanie $x^2 + mx + 4 = 0$ ma dwa różne rozwiązania $x_1$, $x_2$ spełniające warunek $x_1^2 + x_2^2 = 17$.",
      answers: ["-5;5"],
      answerLabel: "m =",
      hints: ["Warunek na deltę i wzory Viète'a.", "$x_1^2 + x_2^2 = (x_1 + x_2)^2 - 2x_1x_2$."],
      solution: [
        { step: "Dwa różne rozwiązania: $\\Delta = m^2 - 16 > 0$, czyli $m \\in (-\\infty, -4) \\cup (4, +\\infty)$.", points: 1 },
        { step: "Wzory Viète'a: $x_1 + x_2 = -m$, $x_1 x_2 = 4$.", points: 1 },
        { step: "$x_1^2 + x_2^2 = m^2 - 8$.", points: 1 },
        { step: "$m^2 - 8 = 17$, więc $m^2 = 25$.", points: 1 },
        { step: "$m = -5$ lub $m = 5$ – oba spełniają warunek na deltę.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-m-p1",
        prompt: "Rozwiązaniami równania $|x + 2| = 5$ są liczby:",
        options: { A: "$3$ i $-7$", B: "$-3$ i $7$", C: "tylko $3$", D: "$-7$ i $7$" },
        correct: "A",
        explanation: "$x + 2 = 5$ lub $x + 2 = -5$, czyli $x = 3$ lub $x = -7$.",
      },
      {
        id: "rz-m-p2",
        prompt: "Równanie $x^2 - 6x + m = 0$ ma dwa różne rozwiązania wtedy i tylko wtedy, gdy:",
        options: { A: "$m < 9$", B: "$m > 9$", C: "$m < 36$", D: "$m \\neq 9$" },
        correct: "A",
        explanation: "$\\Delta = 36 - 4m > 0$, więc $m < 9$.",
      },
    ],
    sredni: [
      {
        id: "rz-m-s1",
        prompt: "Zbiorem rozwiązań nierówności $|2x - 1| < 5$ jest:",
        options: {
          A: "$(-2, 3)$",
          B: "$(-3, 2)$",
          C: "$(-\\infty, -2) \\cup (3, +\\infty)$",
          D: "$(-2, 2)$",
        },
        correct: "A",
        explanation: "$-5 < 2x - 1 < 5$, czyli $-4 < 2x < 6$ i $-2 < x < 3$.",
        trap: "$(-\\infty, -2) \\cup (3, +\\infty)$ to rozwiązanie nierówności z „$>$” – przy „$<$” wychodzi jeden przedział.",
      },
      {
        id: "rz-m-s2",
        prompt: "Suma kwadratów rozwiązań równania $x^2 - 4x - 1 = 0$ jest równa:",
        options: { A: "$18$", B: "$14$", C: "$16$", D: "$17$" },
        correct: "A",
        explanation: "$x_1 + x_2 = 4$, $x_1 x_2 = -1$, więc $x_1^2 + x_2^2 = 16 - 2 \\cdot (-1) = 18$.",
        trap: "$14$ wychodzi, gdy zgubisz minus przy $x_1 x_2 = -1$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-m-z1",
        prompt: "Równanie $(m - 1)x^2 + 2x + 1 = 0$ ma dokładnie jedno rozwiązanie dla:",
        options: { A: "$m = 1$ lub $m = 2$", B: "tylko $m = 2$", C: "tylko $m = 1$", D: "$m = 0$ lub $m = 2$" },
        correct: "A",
        explanation:
          "Dla $m = 1$ równanie jest liniowe: $2x + 1 = 0$ – jedno rozwiązanie. Dla $m \\neq 1$: $\\Delta = 4 - 4(m - 1) = 8 - 4m = 0$, czyli $m = 2$.",
        trap: "Przypadek $m = 1$ (równanie liniowe) łatwo pominąć, licząc od razu deltę.",
      },
      {
        id: "rz-m-z2",
        prompt: "Równanie $x^2 + 2mx + m + 2 = 0$ ma dwa różne rozwiązania ujemne wtedy i tylko wtedy, gdy:",
        options: { A: "$m > 2$", B: "$m < -1$", C: "$-2 < m < -1$", D: "$m > 0$" },
        correct: "A",
        explanation:
          "$\\Delta > 0$: $m^2 - m - 2 > 0$, czyli $m < -1$ lub $m > 2$. Suma ujemna: $-2m < 0$, czyli $m > 0$. Iloczyn dodatni: $m + 2 > 0$. Część wspólna: $m > 2$.",
      },
    ],
  },
};

export default content;
