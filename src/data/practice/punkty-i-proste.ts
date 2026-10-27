// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Długość odcinka", tex: "|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}" },
    { label: "Środek odcinka", tex: "S = \\left(\\frac{x_A + x_B}{2}, \\frac{y_A + y_B}{2}\\right)" },
    { label: "Współczynnik kierunkowy prostej AB", tex: "a = \\frac{y_B - y_A}{x_B - x_A}" },
    { label: "Proste równoległe", tex: "a_1 = a_2" },
    { label: "Proste prostopadłe", tex: "a_1 \\cdot a_2 = -1" },
  ],
  closed: [
    {
      id: "pp-p1",
      difficulty: "podstawowy",
      prompt: "Środkiem odcinka o końcach $A = (2, 5)$ i $B = (6, -1)$ jest punkt:",
      options: { A: "$(4, 2)$", B: "$(8, 4)$", C: "$(2, 3)$", D: "$(4, 3)$" },
      correct: "A",
      hints: ["Środek to średnie współrzędnych końców."],
      explanation: "$\\left(\\frac{2 + 6}{2}, \\frac{5 - 1}{2}\\right) = (4, 2)$.",
    },
    {
      id: "pp-p2",
      difficulty: "podstawowy",
      prompt: "Długość odcinka o końcach $A = (1, 2)$ i $B = (4, 6)$ jest równa:",
      options: { A: "$5$", B: "$7$", C: "$25$", D: "$\\sqrt{7}$" },
      correct: "A",
      hints: ["Policz różnice współrzędnych i użyj twierdzenia Pitagorasa."],
      explanation: "$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.",
    },
    {
      id: "pp-s1",
      difficulty: "sredni",
      prompt: "Prosta $y = 2x - 3$ jest równoległa do prostej:",
      options: { A: "$y = 2x + 7$", B: "$y = -2x - 3$", C: "$y = \\frac{1}{2}x - 3$", D: "$y = -\\frac{1}{2}x + 1$" },
      correct: "A",
      explanation: "Proste równoległe mają ten sam współczynnik kierunkowy $a = 2$.",
    },
    {
      id: "pp-s2",
      difficulty: "sredni",
      prompt: "Punkt $S = (3, -1)$ jest środkiem odcinka $AB$, gdzie $A = (1, 4)$. Punkt $B$ ma współrzędne:",
      options: { A: "$(5, -6)$", B: "$\\left(2, \\frac{3}{2}\\right)$", C: "$(4, 3)$", D: "$(-5, 6)$" },
      correct: "A",
      explanation: "$x_B = 2 \\cdot 3 - 1 = 5$, $y_B = 2 \\cdot (-1) - 4 = -6$.",
    },
    {
      id: "pp-z1",
      difficulty: "zaawansowany",
      prompt: "Prosta prostopadła do prostej $y = -\\frac{1}{4}x + 2$ ma współczynnik kierunkowy:",
      options: { A: "$4$", B: "$-4$", C: "$\\frac{1}{4}$", D: "$-\\frac{1}{4}$" },
      correct: "A",
      explanation: "$-\\frac{1}{4} \\cdot a = -1$, więc $a = 4$.",
    },
    {
      id: "pp-z2",
      difficulty: "zaawansowany",
      prompt: "Prosta przechodząca przez punkty $A = (-1, 3)$ i $B = (3, -5)$ ma równanie:",
      options: { A: "$y = -2x + 1$", B: "$y = 2x + 5$", C: "$y = -2x - 1$", D: "$y = -\\frac{1}{2}x + \\frac{5}{2}$" },
      correct: "A",
      explanation: "$a = \\frac{-5 - 3}{3 + 1} = -2$. Z punktu $A$: $3 = 2 + b$, więc $b = 1$.",
    },
  ],
  open: [
    {
      id: "pp-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Oblicz obwód trójkąta o wierzchołkach $A = (0, 0)$, $B = (6, 0)$, $C = (6, 8)$.",
      answers: ["24"],
      hints: ["Bok $AC$ policz ze wzoru na długość odcinka."],
      solution: [
        { step: "Długości boków: $|AB| = 6$, $|BC| = 8$, $|AC| = \\sqrt{36 + 64} = 10$.", points: 1 },
        { step: "Obwód: $6 + 8 + 10 = 24$.", points: 1 },
      ],
    },
    {
      id: "pp-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Prosta $k$ jest prostopadła do prostej $y = 2x + 1$ i przechodzi przez punkt $P = (4, 3)$. Wyznacz wyraz wolny $b$ prostej $k$.",
      answers: ["5"],
      answerLabel: "b =",
      hints: ["Prostopadła ma współczynnik $a$ taki, że $2 \\cdot a = -1$."],
      solution: [
        { step: "Współczynnik kierunkowy prostopadłej: $a = -\\frac{1}{2}$.", points: 1 },
        { step: "Podstawienie punktu $P$: $3 = -\\frac{1}{2} \\cdot 4 + b$.", points: 1 },
        { step: "Wynik: $b = 5$.", points: 1 },
      ],
    },
  ],
};

export default practice;
