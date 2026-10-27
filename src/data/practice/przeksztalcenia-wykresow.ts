// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Przesunięcie o wektor [p, q]", tex: "y = f(x - p) + q" },
    { label: "Symetria względem osi Ox", tex: "y = -f(x)" },
    { label: "Symetria względem osi Oy", tex: "y = f(-x)" },
  ],
  closed: [
    {
      id: "pw-p1",
      difficulty: "podstawowy",
      prompt: "Wykres funkcji $y = f(x) + 3$ powstaje z wykresu $y = f(x)$ przez przesunięcie o $3$ jednostki:",
      options: { A: "w górę", B: "w dół", C: "w prawo", D: "w lewo" },
      correct: "A",
      hints: ["Liczba dodana „na zewnątrz” funkcji działa w pionie."],
      explanation: "Dodanie liczby do wartości funkcji przesuwa wykres w pionie – w górę.",
    },
    {
      id: "pw-p2",
      difficulty: "podstawowy",
      prompt: "Wykres funkcji $y = (x - 2)^2$ powstaje z wykresu $y = x^2$ przez przesunięcie o:",
      options: { A: "$2$ w prawo", B: "$2$ w lewo", C: "$2$ w górę", D: "$2$ w dół" },
      correct: "A",
      hints: ["Zmiana wewnątrz nawiasu działa w poziomie – i odwrotnie do znaku."],
      explanation: "$f(x - 2)$ to przesunięcie o $2$ w prawo.",
    },
    {
      id: "pw-s1",
      difficulty: "sredni",
      prompt: "Wykres funkcji $f(x) = x^2$ przesunięto o wektor $\\vec{v} = [-1, 4]$. Otrzymano wykres funkcji:",
      options: { A: "$y = (x + 1)^2 + 4$", B: "$y = (x - 1)^2 + 4$", C: "$y = (x + 1)^2 - 4$", D: "$y = (x - 4)^2 - 1$" },
      correct: "A",
      explanation: "$y = f(x - p) + q$ dla $p = -1$, $q = 4$: $(x + 1)^2 + 4$.",
    },
    {
      id: "pw-s2",
      difficulty: "sredni",
      prompt: "Wykres funkcji $y = -f(x)$ jest symetryczny do wykresu $y = f(x)$ względem:",
      options: { A: "osi $Ox$", B: "osi $Oy$", C: "początku układu współrzędnych", D: "prostej $y = x$" },
      correct: "A",
      explanation: "Zmiana znaku wartości odbija wykres względem osi $Ox$.",
    },
    {
      id: "pw-z1",
      difficulty: "zaawansowany",
      prompt: "Wykres funkcji $g(x) = 2^{x - 3} + 1$ powstał z wykresu $f(x) = 2^x$ przez przesunięcie o wektor:",
      options: { A: "$[3, 1]$", B: "$[-3, 1]$", C: "$[3, -1]$", D: "$[1, 3]$" },
      correct: "A",
      explanation: "$g(x) = f(x - 3) + 1$, czyli wektor $[3, 1]$.",
    },
    {
      id: "pw-z2",
      difficulty: "zaawansowany",
      prompt: "Wykres funkcji $f(x) = |x|$ przesunięto o wektor $[2, -3]$. Do otrzymanego wykresu należy punkt:",
      options: { A: "$(2, -3)$", B: "$(0, -3)$", C: "$(-2, 3)$", D: "$(3, 2)$" },
      correct: "A",
      explanation: "$g(x) = |x - 2| - 3$ i $g(2) = -3$. Wierzchołek przesuwa się z $(0, 0)$ do $(2, -3)$.",
    },
  ],
  open: [
    {
      id: "pw-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Wykres funkcji $f(x) = x^2 - 4$ przesunięto o $3$ jednostki w prawo i otrzymano wykres funkcji $g$. Oblicz $g(5)$.",
      answers: ["0"],
      hints: ["Przesunięcie w prawo o $3$ to $f(x - 3)$."],
      solution: [
        { step: "Wzór: $g(x) = (x - 3)^2 - 4$.", points: 1 },
        { step: "Obliczenie: $g(5) = 2^2 - 4 = 0$.", points: 1 },
      ],
    },
    {
      id: "pw-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Funkcja $f$ ma miejsca zerowe $-1$ i $4$. Podaj sumę miejsc zerowych funkcji $g(x) = f(x + 2)$.",
      answers: ["-1"],
      hints: ["$f(x + 2)$ przesuwa wykres w lewo."],
      solution: [
        { step: "$g$ to $f$ przesunięta o $2$ w lewo, więc miejsca zerowe to $-3$ i $2$.", points: 1 },
        { step: "Suma: $-3 + 2 = -1$.", points: 1 },
      ],
    },
  ],
};

export default practice;
