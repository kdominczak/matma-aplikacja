// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Postać ogólna", tex: "f(x) = ax^2 + bx + c" },
    { label: "Postać kanoniczna", tex: "f(x) = a(x - p)^2 + q" },
    { label: "Wierzchołek paraboli", tex: "p = \\frac{-b}{2a}, \\quad q = \\frac{-\\Delta}{4a}" },
    { label: "Postać iloczynowa", tex: "f(x) = a(x - x_1)(x - x_2)" },
    { label: "Wyróżnik", tex: "\\Delta = b^2 - 4ac" },
  ],
  closed: [
    {
      id: "fk-p1",
      difficulty: "podstawowy",
      prompt: "Wierzchołkiem paraboli $y = (x + 3)^2 - 5$ jest punkt:",
      options: { A: "$(-3, -5)$", B: "$(3, -5)$", C: "$(-3, 5)$", D: "$(3, 5)$" },
      correct: "A",
      hints: ["W postaci $a(x - p)^2 + q$ wierzchołek to $(p, q)$."],
      explanation: "$y = (x - (-3))^2 + (-5)$, więc wierzchołek to $(-3, -5)$.",
    },
    {
      id: "fk-p2",
      difficulty: "podstawowy",
      prompt: "Miejscami zerowymi funkcji $f(x) = (x - 1)(x + 6)$ są liczby:",
      options: { A: "$1$ i $-6$", B: "$-1$ i $6$", C: "$1$ i $6$", D: "$-1$ i $-6$" },
      correct: "A",
      hints: ["Przyrównaj każdy nawias do zera."],
      explanation: "Iloczyn jest zerem, gdy $x = 1$ lub $x = -6$.",
    },
    {
      id: "fk-s1",
      difficulty: "sredni",
      prompt: "Osią symetrii wykresu funkcji $f(x) = 2x^2 - 8x + 1$ jest prosta:",
      options: { A: "$x = 2$", B: "$x = -2$", C: "$x = 4$", D: "$x = 8$" },
      correct: "A",
      explanation: "$p = \\frac{8}{4} = 2$.",
    },
    {
      id: "fk-s2",
      difficulty: "sredni",
      prompt: "Największa wartość funkcji $f(x) = -x^2 + 6x - 5$ jest równa:",
      options: { A: "$4$", B: "$3$", C: "$-5$", D: "$9$" },
      correct: "A",
      explanation: "$p = 3$, a $f(3) = -9 + 18 - 5 = 4$.",
    },
    {
      id: "fk-z1",
      difficulty: "zaawansowany",
      prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 4x + 7$ w przedziale $\\langle 0, 3 \\rangle$ jest równa:",
      options: { A: "$3$", B: "$7$", C: "$4$", D: "$2$" },
      correct: "A",
      explanation: "Wierzchołek $p = 2$ leży w przedziale, więc minimum to $f(2) = 3$.",
    },
    {
      id: "fk-z2",
      difficulty: "zaawansowany",
      prompt: "Postać kanoniczna funkcji $f(x) = x^2 + 2x - 3$ to:",
      options: { A: "$f(x) = (x + 1)^2 - 4$", B: "$f(x) = (x - 1)^2 - 4$", C: "$f(x) = (x + 1)^2 - 3$", D: "$f(x) = (x + 2)^2 - 7$" },
      correct: "A",
      explanation: "$p = -1$, $q = f(-1) = 1 - 2 - 3 = -4$.",
    },
  ],
  open: [
    {
      id: "fk-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Wyznacz zbiór wartości funkcji $f(x) = 2x^2 - 12x + 13$. Podaj najmniejszą wartość tej funkcji.",
      answers: ["-5"],
      hints: ["Ramiona są skierowane w górę, więc najmniejsza wartość jest w wierzchołku."],
      solution: [
        { step: "Pierwsza współrzędna wierzchołka: $p = \\frac{12}{4} = 3$.", points: 1 },
        { step: "Najmniejsza wartość: $q = f(3) = 18 - 36 + 13 = -5$.", points: 1 },
        { step: "Zbiór wartości: $\\langle -5, +\\infty)$ (ramiona w górę).", points: 1 },
      ],
    },
    {
      id: "fk-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Funkcja kwadratowa $f(x) = a(x + 2)(x - 4)$ ma wykres przechodzący przez punkt $(0, -16)$. Oblicz $a$.",
      answers: ["2"],
      answerLabel: "a =",
      hints: ["Podstaw $x = 0$ i $f(0) = -16$."],
      solution: [
        { step: "Podstawienie punktu: $f(0) = a \\cdot 2 \\cdot (-4)$.", points: 1 },
        { step: "Równanie: $-8a = -16$.", points: 1 },
        { step: "Wynik: $a = 2$.", points: 1 },
      ],
    },
  ],
};

export default practice;
