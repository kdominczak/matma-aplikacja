import type { Question } from "@/types/quiz";

export const sampleQuestions: Question[] = [
  {
    id: "pot-1",
    topic: "Potęgi",
    prompt: "Liczba $2^5 \\cdot 2^3$ jest równa:",
    options: { A: "$2^8$", B: "$2^{15}$", C: "$4^8$", D: "$4^{15}$" },
    correct: "A",
    explanation:
      "Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki: $5 + 3 = 8$.",
  },
  {
    id: "rown-1",
    topic: "Równania",
    prompt: "Rozwiązaniem równania $3x - 7 = 8$ jest:",
    options: {
      A: "$x = \\frac{1}{3}$",
      B: "$x = 3$",
      C: "$x = 5$",
      D: "$x = 15$",
    },
    correct: "C",
    explanation: "$3x = 15$, więc $x = 5$.",
  },
  {
    id: "proc-1",
    topic: "Procenty",
    prompt: "Kurtka kosztowała 200 zł. Po obniżce o 15% kosztuje:",
    options: { A: "185 zł", B: "170 zł", C: "175 zł", D: "30 zł" },
    correct: "B",
    explanation: "15% z 200 zł to 30 zł, a $200 - 30 = 170$ zł.",
  },
  {
    id: "fun-1",
    topic: "Funkcja liniowa",
    prompt: "Miejscem zerowym funkcji $f(x) = 2x - 6$ jest:",
    options: { A: "$-6$", B: "$-3$", C: "$2$", D: "$3$" },
    correct: "D",
    explanation: "$2x - 6 = 0$, więc $x = 3$.",
  },
  {
    id: "log-1",
    topic: "Logarytmy",
    prompt: "Wartość wyrażenia $\\log_2 32$ jest równa:",
    options: { A: "$4$", B: "$5$", C: "$16$", D: "$64$" },
    correct: "B",
    explanation: "$2^5 = 32$, więc $\\log_2 32 = 5$.",
  },
  {
    id: "pierw-1",
    topic: "Pierwiastki",
    prompt: "Liczba $\\sqrt{50} - \\sqrt{8}$ jest równa:",
    options: {
      A: "$\\sqrt{42}$",
      B: "$3\\sqrt{2}$",
      C: "$7\\sqrt{2}$",
      D: "$2\\sqrt{3}$",
    },
    correct: "B",
    explanation:
      "$\\sqrt{50} = 5\\sqrt{2}$ oraz $\\sqrt{8} = 2\\sqrt{2}$, więc różnica to $3\\sqrt{2}$.",
  },
];
