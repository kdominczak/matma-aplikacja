// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Twierdzenie cosinusów", tex: "c^2 = a^2 + b^2 - 2ab\\cos\\gamma" },
    { label: "Pole trójkąta (dwa boki i kąt)", tex: "P = \\frac{1}{2}ab\\sin\\gamma" },
    { label: "Kąty rozwarte", tex: "\\cos 120^\\circ = -\\frac{1}{2}, \\quad \\sin 120^\\circ = \\frac{\\sqrt{3}}{2}" },
  ],
  closed: [
    {
      id: "tc-p1",
      difficulty: "podstawowy",
      prompt: "Pole trójkąta o bokach $6$ i $4$ oraz kącie między nimi $30^\\circ$ jest równe:",
      options: { A: "$6$", B: "$12$", C: "$24$", D: "$3$" },
      correct: "A",
      hints: ["Użyj wzoru $P = \\frac{1}{2}ab\\sin\\gamma$."],
      explanation: "$P = \\frac{1}{2} \\cdot 6 \\cdot 4 \\cdot \\frac{1}{2} = 6$.",
    },
    {
      id: "tc-p2",
      difficulty: "podstawowy",
      prompt: "Dwa boki trójkąta mają długości $3$ i $5$, a kąt między nimi ma $60^\\circ$. Kwadrat długości trzeciego boku jest równy:",
      options: { A: "$19$", B: "$34$", C: "$49$", D: "$4$" },
      correct: "A",
      hints: ["Twierdzenie cosinusów, $\\cos 60^\\circ = \\frac{1}{2}$."],
      explanation: "$9 + 25 - 2 \\cdot 15 \\cdot \\frac{1}{2} = 19$.",
    },
    {
      id: "tc-s1",
      difficulty: "sredni",
      prompt: "Dwa boki trójkąta mają długości $3$ i $5$, a kąt między nimi ma $120^\\circ$. Trzeci bok ma długość:",
      options: { A: "$7$", B: "$\\sqrt{19}$", C: "$\\sqrt{34}$", D: "$8$" },
      correct: "A",
      explanation: "$c^2 = 9 + 25 - 30 \\cdot \\left(-\\frac{1}{2}\\right) = 49$, więc $c = 7$.",
    },
    {
      id: "tc-s2",
      difficulty: "sredni",
      prompt: "Pole trójkąta równobocznego o boku $4$ jest równe:",
      options: { A: "$4\\sqrt{3}$", B: "$8\\sqrt{3}$", C: "$16$", D: "$2\\sqrt{3}$" },
      correct: "A",
      explanation: "$\\frac{1}{2} \\cdot 4 \\cdot 4 \\cdot \\sin 60^\\circ = 8 \\cdot \\frac{\\sqrt{3}}{2} = 4\\sqrt{3}$.",
    },
    {
      id: "tc-z1",
      difficulty: "zaawansowany",
      prompt: "Trójkąt ma boki długości $5$, $7$ i $8$. Cosinus kąta leżącego naprzeciw boku długości $7$ jest równy:",
      options: { A: "$\\frac{1}{2}$", B: "$-\\frac{1}{2}$", C: "$\\frac{\\sqrt{3}}{2}$", D: "$\\frac{1}{7}$" },
      correct: "A",
      explanation: "$49 = 25 + 64 - 80\\cos\\gamma$, więc $80\\cos\\gamma = 40$ i $\\cos\\gamma = \\frac{1}{2}$.",
    },
    {
      id: "tc-z2",
      difficulty: "zaawansowany",
      prompt: "Pole trójkąta o bokach $6$ i $10$ jest równe $15\\sqrt{3}$. Kąt ostry między tymi bokami ma miarę:",
      options: { A: "$60^\\circ$", B: "$30^\\circ$", C: "$45^\\circ$", D: "$90^\\circ$" },
      correct: "A",
      explanation: "$\\frac{1}{2} \\cdot 60 \\cdot \\sin\\gamma = 15\\sqrt{3}$, więc $\\sin\\gamma = \\frac{\\sqrt{3}}{2}$ i $\\gamma = 60^\\circ$.",
    },
  ],
  open: [
    {
      id: "tc-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W trójkącie $ABC$: $|AC| = 8$, $|BC| = 5$, $|\\angle ACB| = 60^\\circ$. Oblicz długość boku $AB$.",
      answers: ["7"],
      hints: ["Kąt $C$ leży między bokami $AC$ i $BC$ – to dokładnie sytuacja z twierdzenia cosinusów."],
      solution: [
        { step: "Twierdzenie cosinusów: $|AB|^2 = 64 + 25 - 2 \\cdot 8 \\cdot 5 \\cdot \\frac{1}{2} = 49$.", points: 1 },
        { step: "Wynik: $|AB| = 7$.", points: 1 },
      ],
    },
    {
      id: "tc-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Trójkąt ma boki długości $7$, $8$ i $13$. Oblicz miarę (w stopniach) kąta leżącego naprzeciw najdłuższego boku.",
      answers: ["120"],
      hints: ["Kąt naprzeciw najdłuższego boku jest największy – może być rozwarty."],
      solution: [
        { step: "Twierdzenie cosinusów: $169 = 49 + 64 - 2 \\cdot 7 \\cdot 8 \\cos\\gamma$.", points: 1 },
        { step: "Obliczenie: $\\cos\\gamma = -\\frac{1}{2}$.", points: 1 },
        { step: "Kąt: $\\gamma = 120^\\circ$.", points: 1 },
      ],
    },
  ],
};

export default practice;
