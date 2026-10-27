// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Wierzchołek paraboli", tex: "p = \\frac{-b}{2a}, \\quad q = f(p)" },
    { label: "Wartość ekstremalna", tex: "a < 0: \\ f_{\\max} = f(p), \\quad a > 0: \\ f_{\\min} = f(p)" },
    { label: "Prostokąt", tex: "P = xy, \\quad Obw = 2x + 2y" },
  ],
  closed: [
    {
      id: "op-p1",
      difficulty: "podstawowy",
      prompt: "Funkcja $f(x) = -x^2 + 4x$ przyjmuje największą wartość dla $x$ równego:",
      options: { A: "$2$", B: "$4$", C: "$-2$", D: "$0$" },
      correct: "A",
      hints: ["Największa wartość jest w wierzchołku paraboli."],
      explanation: "$p = \\frac{-4}{-2} = 2$.",
    },
    {
      id: "op-p2",
      difficulty: "podstawowy",
      prompt: "Suma dwóch liczb dodatnich jest równa $10$. Ich iloczyn jest największy, gdy każda z nich jest równa:",
      options: { A: "$5$", B: "$2$", C: "$4$", D: "$10$" },
      correct: "A",
      hints: ["Zapisz iloczyn jako funkcję jednej liczby $x$."],
      explanation: "$P(x) = x(10 - x)$ ma wierzchołek w $x = 5$.",
    },
    {
      id: "op-s1",
      difficulty: "sredni",
      prompt: "Obwód prostokąta jest równy $20$. Największe możliwe pole takiego prostokąta jest równe:",
      options: { A: "$25$", B: "$20$", C: "$100$", D: "$24$" },
      correct: "A",
      explanation: "$x + y = 10$, $P = x(10 - x)$ – największe dla $x = 5$: $P = 25$.",
    },
    {
      id: "op-s2",
      difficulty: "sredni",
      prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 6x + 10$ jest równa:",
      options: { A: "$1$", B: "$3$", C: "$10$", D: "$-1$" },
      correct: "A",
      explanation: "$p = 3$, $f(3) = 9 - 18 + 10 = 1$.",
    },
    {
      id: "op-z1",
      difficulty: "zaawansowany",
      prompt: "Prostokątny wybieg przy ścianie (ściana tworzy jeden bok) ogrodzono siatką o długości $40$ m. Największe możliwe pole wybiegu to:",
      options: { A: "$200 \\text{ m}^2$", B: "$400 \\text{ m}^2$", C: "$100 \\text{ m}^2$", D: "$160 \\text{ m}^2$" },
      correct: "A",
      explanation: "$P(x) = x(40 - 2x)$, wierzchołek w $x = 10$: $P = 10 \\cdot 20 = 200$.",
    },
    {
      id: "op-z2",
      difficulty: "zaawansowany",
      prompt: "Liczby $x$ i $y$ spełniają warunek $x + y = 8$. Najmniejsza wartość wyrażenia $x^2 + y^2$ jest równa:",
      options: { A: "$32$", B: "$64$", C: "$16$", D: "$0$" },
      correct: "A",
      explanation: "$x^2 + (8 - x)^2 = 2x^2 - 16x + 64$, minimum w $x = 4$: $16 + 16 = 32$.",
    },
  ],
  open: [
    {
      id: "op-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Z drutu o długości $36$ cm wygięto prostokąt. Oblicz największe możliwe pole tego prostokąta (w $\\text{cm}^2$).",
      answers: ["81"],
      hints: ["Połowa obwodu to suma dwóch sąsiednich boków."],
      solution: [
        { step: "Funkcja pola: $x + y = 18$, więc $P(x) = x(18 - x)$.", points: 1 },
        { step: "Wierzchołek: $x = 9$.", points: 1 },
        { step: "Największe pole: $P = 9 \\cdot 9 = 81$.", points: 1 },
      ],
    },
    {
      id: "op-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Liczby dodatnie $x$ i $y$ spełniają warunek $x + 2y = 12$. Oblicz największą możliwą wartość iloczynu $x \\cdot y$.",
      answers: ["18"],
      hints: ["Wyznacz $x$ z warunku i zapisz iloczyn jako funkcję $y$."],
      solution: [
        { step: "Funkcja: $x = 12 - 2y$, więc $P(y) = y(12 - 2y) = -2y^2 + 12y$.", points: 1 },
        { step: "Wierzchołek: $y = 3$ (wtedy $x = 6$).", points: 1 },
        { step: "Największa wartość: $P = 18$.", points: 1 },
      ],
    },
  ],
};

export default practice;
