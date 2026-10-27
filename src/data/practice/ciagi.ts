// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Wyraz ogólny ciągu arytmetycznego", tex: "a_n = a_1 + (n - 1)r" },
    { label: "Suma ciągu arytmetycznego", tex: "S_n = \\frac{a_1 + a_n}{2} \\cdot n" },
    { label: "Wyraz ogólny ciągu geometrycznego", tex: "a_n = a_1 \\cdot q^{n - 1}" },
    { label: "Suma ciągu geometrycznego", tex: "S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}, \\quad q \\neq 1" },
    { label: "Trzy kolejne wyrazy – arytmetyczny", tex: "2a_n = a_{n-1} + a_{n+1}" },
    { label: "Trzy kolejne wyrazy – geometryczny", tex: "a_n^2 = a_{n-1} \\cdot a_{n+1}" },
  ],
  closed: [
    {
      id: "cg-p1",
      difficulty: "podstawowy",
      prompt: "Ciąg $(a_n)$ jest określony wzorem $a_n = 3n - 2$ dla $n \\ge 1$. Wyraz $a_5$ jest równy:",
      options: { A: "$13$", B: "$15$", C: "$17$", D: "$10$" },
      correct: "A",
      hints: ["Podstaw $n = 5$ do wzoru."],
      explanation: "$a_5 = 3 \\cdot 5 - 2 = 13$.",
    },
    {
      id: "cg-p2",
      difficulty: "podstawowy",
      prompt: "W ciągu arytmetycznym $a_1 = 5$ i $r = -2$. Wyraz $a_4$ jest równy:",
      options: { A: "$-1$", B: "$-3$", C: "$1$", D: "$11$" },
      correct: "A",
      hints: ["Od $a_1$ do $a_4$ są trzy kroki o $r$."],
      explanation: "$a_4 = a_1 + 3r = 5 - 6 = -1$.",
    },
    {
      id: "cg-s1",
      difficulty: "sredni",
      prompt: "Ciąg geometryczny o wyrazach dodatnich ma $a_1 = 3$ i $a_3 = 27$. Iloraz tego ciągu jest równy:",
      options: { A: "$9$", B: "$3$", C: "$-3$", D: "$\\frac{1}{3}$" },
      correct: "B",
      explanation: "$a_3 = a_1 q^2$, więc $q^2 = 9$. Wyrazy są dodatnie, więc $q = 3$.",
    },
    {
      id: "cg-s2",
      difficulty: "sredni",
      prompt: "Suma dziesięciu początkowych wyrazów ciągu arytmetycznego, w którym $a_1 = 2$ i $a_{10} = 20$, jest równa:",
      options: { A: "$110$", B: "$220$", C: "$100$", D: "$200$" },
      correct: "A",
      explanation: "$S_{10} = \\frac{2 + 20}{2} \\cdot 10 = 110$.",
    },
    {
      id: "cg-z1",
      difficulty: "zaawansowany",
      prompt: "Liczby $x - 1$, $4$, $x + 5$ (w tej kolejności) tworzą ciąg arytmetyczny. Wtedy $x$ jest równe:",
      options: { A: "$2$", B: "$3$", C: "$4$", D: "$1$" },
      correct: "A",
      explanation: "$2 \\cdot 4 = (x - 1) + (x + 5)$, czyli $8 = 2x + 4$ i $x = 2$.",
    },
    {
      id: "cg-z2",
      difficulty: "zaawansowany",
      prompt: "Liczby $2$, $x$, $18$ (w tej kolejności) tworzą ciąg geometryczny o wyrazach dodatnich. Suma tych trzech liczb jest równa:",
      options: { A: "$26$", B: "$30$", C: "$20$", D: "$24$" },
      correct: "A",
      explanation: "$x^2 = 2 \\cdot 18 = 36$, więc $x = 6$, a suma to $2 + 6 + 18 = 26$.",
    },
  ],
  open: [
    {
      id: "cg-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W ciągu arytmetycznym $a_2 = 7$ i $a_6 = 19$. Oblicz $a_{20}$.",
      answers: ["61"],
      hints: ["Między $a_2$ a $a_6$ są cztery kroki o $r$."],
      solution: [
        { step: "Różnica: $a_6 - a_2 = 4r = 12$, więc $r = 3$.", points: 1 },
        { step: "$a_1 = 4$, więc $a_{20} = 4 + 19 \\cdot 3 = 61$.", points: 1 },
      ],
    },
    {
      id: "cg-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Ciąg geometryczny ma wyrazy $a_1 = 2$ i $a_4 = 54$. Oblicz sumę pięciu początkowych wyrazów tego ciągu.",
      answers: ["242"],
      hints: ["Najpierw wyznacz iloraz $q$ z $a_4 = a_1 q^3$."],
      solution: [
        { step: "$a_4 = a_1 q^3$, więc $q^3 = 27$ i $q = 3$.", points: 1 },
        { step: "Wzór: $S_5 = 2 \\cdot \\frac{1 - 3^5}{1 - 3}$.", points: 1 },
        { step: "Obliczenie: $S_5 = 2 \\cdot \\frac{-242}{-2} = 242$.", points: 1 },
      ],
    },
  ],
};

export default practice;
