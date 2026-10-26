import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Definicja logarytmu",
      body:
        "$\\log_a b = c \\iff a^c = b$, gdzie $a > 0$, $a \\neq 1$ i $b > 0$.\n\nLogarytm odpowiada na pytanie: do jakiej potęgi trzeba podnieść podstawę, żeby otrzymać daną liczbę? Np. $\\log_2 8 = 3$, bo $2^3 = 8$.",
    },
    {
      title: "Własności logarytmów",
      body:
        "Zawsze $\\log_a 1 = 0$ i $\\log_a a = 1$. Suma logarytmów o tej samej podstawie to logarytm iloczynu, a różnica – logarytm ilorazu. Wykładnik liczby logarytmowanej możemy „wyciągnąć” przed logarytm.",
      example: {
        prompt: "Oblicz $\\log_6 4 + \\log_6 9$.",
        solution: "$\\log_6 (4 \\cdot 9) = \\log_6 36 = 2$, bo $6^2 = 36$.",
      },
    },
    {
      title: "Logarytm dziesiętny i potęgi ułamkowe",
      body:
        "Gdy podstawa nie jest zapisana, chodzi o 10: $\\log 1000 = 3$.\n\nLiczby typu $\\frac{1}{8}$ czy $\\sqrt{3}$ zapisz jako potęgi: $\\log_2 \\frac{1}{8} = \\log_2 2^{-3} = -3$, a $\\log_3 \\sqrt{3} = \\log_3 3^{\\frac{1}{2}} = \\frac{1}{2}$.",
    },
  ],
  formulas: [
    { label: "Definicja", tex: "\\log_a b = c \\iff a^c = b" },
    { label: "Logarytm iloczynu", tex: "\\log_a (x \\cdot y) = \\log_a x + \\log_a y" },
    { label: "Logarytm ilorazu", tex: "\\log_a \\frac{x}{y} = \\log_a x - \\log_a y" },
    { label: "Logarytm potęgi", tex: "\\log_a x^n = n \\cdot \\log_a x" },
    { label: "Zamiana podstawy", tex: "\\log_a b = \\frac{\\log_c b}{\\log_c a}" },
    { label: "Wartości szczególne", tex: "\\log_a 1 = 0, \\quad \\log_a a = 1" },
    { label: "Potęga logarytmu", tex: "a^{\\log_a b} = b" },
  ],
  tests: {
    podstawowy: [
      {
        id: "log-p1",
        prompt: "Wartość wyrażenia $\\log_2 32$ jest równa:",
        options: { A: "$4$", B: "$5$", C: "$16$", D: "$64$" },
        correct: "B",
        hint: "Do jakiej potęgi trzeba podnieść 2, aby otrzymać 32?",
        explanation: "$2^5 = 32$, więc $\\log_2 32 = 5$.",
      },
      {
        id: "log-p2",
        prompt: "Wartość wyrażenia $\\log_3 1$ jest równa:",
        options: { A: "$0$", B: "$1$", C: "$3$", D: "$\\frac{1}{3}$" },
        correct: "A",
        hint: "Każda liczba różna od zera podniesiona do potęgi zerowej daje 1.",
        explanation: "$3^0 = 1$, więc $\\log_3 1 = 0$.",
      },
      {
        id: "log-p3",
        prompt: "Wartość wyrażenia $\\log 1000$ jest równa:",
        options: { A: "$2$", B: "$3$", C: "$100$", D: "$30$" },
        correct: "B",
        hint: "Brak zapisanej podstawy oznacza podstawę 10.",
        explanation: "$10^3 = 1000$, więc $\\log 1000 = 3$.",
      },
    ],
    sredni: [
      {
        id: "log-s1",
        prompt: "Wartość wyrażenia $\\log_6 4 + \\log_6 9$ jest równa:",
        options: { A: "$\\log_6 13$", B: "$1$", C: "$2$", D: "$36$" },
        correct: "C",
        explanation: "Suma logarytmów to logarytm iloczynu: $\\log_6 36 = 2$.",
      },
      {
        id: "log-s2",
        prompt: "Wartość wyrażenia $\\log_2 \\frac{1}{8}$ jest równa:",
        options: { A: "$3$", B: "$-3$", C: "$\\frac{1}{3}$", D: "$-\\frac{1}{3}$" },
        correct: "B",
        explanation: "$\\frac{1}{8} = 2^{-3}$, więc $\\log_2 \\frac{1}{8} = -3$.",
      },
      {
        id: "log-s3",
        prompt: "Wartość wyrażenia $\\log_3 54 - \\log_3 2$ jest równa:",
        options: { A: "$3$", B: "$52$", C: "$\\log_3 52$", D: "$27$" },
        correct: "A",
        explanation: "Różnica logarytmów to logarytm ilorazu: $\\log_3 27 = 3$.",
      },
    ],
    zaawansowany: [
      {
        id: "log-z1",
        prompt: "Wartość wyrażenia $2\\log_5 10 - \\log_5 4$ jest równa:",
        options: { A: "$2$", B: "$1$", C: "$\\log_5 16$", D: "$5$" },
        correct: "A",
        explanation: "$2\\log_5 10 = \\log_5 100$, więc $\\log_5 \\frac{100}{4} = \\log_5 25 = 2$.",
      },
      {
        id: "log-z2",
        prompt: "Wartość wyrażenia $\\log_{\\sqrt{3}} 9$ jest równa:",
        options: { A: "$2$", B: "$4$", C: "$\\frac{1}{2}$", D: "$3$" },
        correct: "B",
        explanation: "$\\left(\\sqrt{3}\\right)^4 = 9$, więc $\\log_{\\sqrt{3}} 9 = 4$.",
      },
      {
        id: "log-z3",
        prompt: "Wiadomo, że $\\log_2 a = 3$. Wtedy $\\log_2 \\left(4a^2\\right)$ jest równy:",
        options: { A: "$6$", B: "$8$", C: "$11$", D: "$36$" },
        correct: "B",
        explanation: "$\\log_2 4 + 2\\log_2 a = 2 + 2 \\cdot 3 = 8$.",
      },
    ],
  },
};

export default content;
