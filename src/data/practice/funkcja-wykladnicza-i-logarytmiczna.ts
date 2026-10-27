// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Funkcja wykładnicza", tex: "f(x) = a^x, \\quad a > 0, \\ a \\neq 1" },
    { label: "Funkcja logarytmiczna", tex: "f(x) = \\log_a x, \\quad x > 0" },
    { label: "Monotoniczność", tex: "a > 1: \\text{ rosnąca}, \\quad 0 < a < 1: \\text{ malejąca}" },
  ],
  closed: [
    {
      id: "wl-p1",
      difficulty: "podstawowy",
      prompt: "Wartość funkcji $f(x) = 3^x$ dla $x = -2$ jest równa:",
      options: { A: "$\\frac{1}{9}$", B: "$-9$", C: "$-6$", D: "$9$" },
      correct: "A",
      hints: ["Ujemny wykładnik to odwrotność."],
      explanation: "$3^{-2} = \\frac{1}{9}$.",
    },
    {
      id: "wl-p2",
      difficulty: "podstawowy",
      prompt: "Funkcja $f(x) = \\left(\\frac{1}{2}\\right)^x$ jest:",
      options: { A: "rosnąca", B: "malejąca", C: "stała", D: "rosnąca tylko dla $x > 0$" },
      correct: "B",
      hints: ["Spójrz, czy podstawa jest większa, czy mniejsza od $1$."],
      explanation: "Podstawa $\\frac{1}{2}$ jest między $0$ a $1$, więc funkcja maleje.",
    },
    {
      id: "wl-s1",
      difficulty: "sredni",
      prompt: "Do wykresu funkcji $f(x) = 2^x$ należy punkt:",
      options: { A: "$(8, 3)$", B: "$(3, 8)$", C: "$(0, 0)$", D: "$(-1, -2)$" },
      correct: "B",
      explanation: "$f(3) = 2^3 = 8$.",
    },
    {
      id: "wl-s2",
      difficulty: "sredni",
      prompt: "Dziedziną funkcji $f(x) = \\log_2 (x - 3)$ jest:",
      options: { A: "$(3, +\\infty)$", B: "$\\langle 3, +\\infty)$", C: "$(-3, +\\infty)$", D: "$\\mathbb{R}$" },
      correct: "A",
      explanation: "Liczba logarytmowana musi być dodatnia: $x - 3 > 0$.",
    },
    {
      id: "wl-z1",
      difficulty: "zaawansowany",
      prompt: "Funkcja $f(x) = a^x$ przyjmuje dla $x = 2$ wartość $25$. Wtedy $f(-1)$ jest równe:",
      options: { A: "$\\frac{1}{5}$", B: "$-5$", C: "$5$", D: "$-\\frac{1}{5}$" },
      correct: "A",
      explanation: "$a^2 = 25$, więc $a = 5$ i $f(-1) = 5^{-1} = \\frac{1}{5}$.",
    },
    {
      id: "wl-z2",
      difficulty: "zaawansowany",
      prompt: "Miejscem zerowym funkcji $f(x) = \\log_3 (x + 2)$ jest:",
      options: { A: "$-1$", B: "$-2$", C: "$1$", D: "$3$" },
      correct: "A",
      explanation: "$\\log_3 (x + 2) = 0$, gdy $x + 2 = 1$, czyli $x = -1$.",
    },
  ],
  open: [
    {
      id: "wl-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Rozwiąż równanie $2^{x + 1} = 32$.",
      answers: ["4"],
      answerLabel: "x =",
      hints: ["Zapisz $32$ jako potęgę liczby $2$."],
      solution: [
        { step: "Zapisanie prawej strony jako potęgi dwójki: $32 = 2^5$.", points: 1 },
        { step: "Porównanie wykładników: $x + 1 = 5$, więc $x = 4$.", points: 1 },
      ],
    },
    {
      id: "wl-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Do wykresu funkcji $f(x) = \\log_a x$ należy punkt $(16, 4)$. Oblicz $f(8)$.",
      answers: ["3"],
      hints: ["Najpierw wyznacz podstawę $a$."],
      solution: [
        { step: "$\\log_a 16 = 4$, więc $a^4 = 16$ i $a = 2$.", points: 1 },
        { step: "$f(8) = \\log_2 8 = 3$.", points: 1 },
      ],
    },
  ],
};

export default practice;
