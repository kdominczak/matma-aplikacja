// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Średnia arytmetyczna", tex: "\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}" },
    { label: "Średnia ważona", tex: "\\bar{x} = \\frac{w_1 x_1 + \\ldots + w_n x_n}{w_1 + \\ldots + w_n}" },
    { label: "Wariancja", tex: "\\sigma^2 = \\frac{(x_1 - \\bar{x})^2 + \\ldots + (x_n - \\bar{x})^2}{n}" },
    { label: "Odchylenie standardowe", tex: "\\sigma = \\sqrt{\\sigma^2}" },
  ],
  closed: [
    {
      id: "st-p1",
      difficulty: "podstawowy",
      prompt: "Średnia arytmetyczna liczb $4, 7, 9, 12$ jest równa:",
      options: { A: "$7$", B: "$8$", C: "$9$", D: "$32$" },
      correct: "B",
      hints: ["Dodaj liczby i podziel przez ich liczbę."],
      explanation: "$\\frac{4 + 7 + 9 + 12}{4} = \\frac{32}{4} = 8$.",
    },
    {
      id: "st-p2",
      difficulty: "podstawowy",
      prompt: "Mediana zestawu danych $3, 8, 1, 6, 5$ jest równa:",
      options: { A: "$5$", B: "$1$", C: "$6$", D: "$4{,}6$" },
      correct: "A",
      hints: ["Najpierw ustaw dane od najmniejszej do największej."],
      explanation: "Po uporządkowaniu: $1, 3, 5, 6, 8$ – środkowa liczba to $5$.",
    },
    {
      id: "st-s1",
      difficulty: "sredni",
      prompt: "Dominanta zestawu $2, 5, 5, 7, 2, 5, 9$ jest równa:",
      options: { A: "$2$", B: "$5$", C: "$7$", D: "$9$" },
      correct: "B",
      explanation: "Najczęściej (trzy razy) występuje $5$.",
    },
    {
      id: "st-s2",
      difficulty: "sredni",
      prompt: "Mediana zestawu $1, 4, 4, 6, 9, 10$ jest równa:",
      options: { A: "$5$", B: "$4$", C: "$6$", D: "$\\frac{17}{3}$" },
      correct: "A",
      explanation: "Liczb jest sześć – mediana to średnia dwóch środkowych: $\\frac{4 + 6}{2} = 5$.",
    },
    {
      id: "st-z1",
      difficulty: "zaawansowany",
      prompt: "Średnia arytmetyczna pięciu liczb jest równa $6$. Po dopisaniu szóstej liczby średnia wzrosła do $7$. Dopisana liczba to:",
      options: { A: "$12$", B: "$7$", C: "$13$", D: "$8$" },
      correct: "A",
      explanation: "Suma pięciu liczb: $30$, sześciu: $42$. Dopisana liczba to $42 - 30 = 12$.",
    },
    {
      id: "st-z2",
      difficulty: "zaawansowany",
      prompt: "Odchylenie standardowe zestawu danych $2, 4, 6$ jest równe:",
      options: { A: "$\\frac{2\\sqrt{6}}{3}$", B: "$\\frac{8}{3}$", C: "$2$", D: "$\\sqrt{8}$" },
      correct: "A",
      explanation: "$\\bar{x} = 4$, $\\sigma^2 = \\frac{4 + 0 + 4}{3} = \\frac{8}{3}$, więc $\\sigma = \\sqrt{\\frac{8}{3}} = \\frac{2\\sqrt{6}}{3}$.",
    },
  ],
  open: [
    {
      id: "st-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Uczeń otrzymał oceny: $5, 3, 4, 4, 2, 6$. Oblicz średnią arytmetyczną jego ocen.",
      answers: ["4"],
      hints: ["Ocen jest sześć."],
      solution: [
        { step: "Suma ocen: $5 + 3 + 4 + 4 + 2 + 6 = 24$.", points: 1 },
        { step: "Średnia: $\\frac{24}{6} = 4$.", points: 1 },
      ],
    },
    {
      id: "st-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Średnia arytmetyczna liczb $3, x, 7, 10$ jest równa $6$. Oblicz medianę tego zestawu.",
      answers: ["11/2"],
      hints: ["Najpierw wyznacz $x$ ze średniej."],
      solution: [
        { step: "Równanie: $\\frac{3 + x + 7 + 10}{4} = 6$.", points: 1 },
        { step: "Rozwiązanie: $x = 4$.", points: 1 },
        { step: "Po uporządkowaniu $3, 4, 7, 10$ mediana to $\\frac{4 + 7}{2} = 5{,}5$.", points: 1 },
      ],
    },
  ],
};

export default practice;
