// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Funkcje kąta ostrego", tex: "\\sin\\alpha = \\frac{a}{c}, \\quad \\cos\\alpha = \\frac{b}{c}, \\quad \\operatorname{tg}\\alpha = \\frac{a}{b}" },
    { label: "Jedynka trygonometryczna", tex: "\\sin^2\\alpha + \\cos^2\\alpha = 1" },
    { label: "Tangens", tex: "\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}" },
    { label: "Wartości 30°, 45°, 60°", tex: "\\sin 30^\\circ = \\frac{1}{2}, \\ \\sin 45^\\circ = \\frac{\\sqrt{2}}{2}, \\ \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}" },
  ],
  closed: [
    {
      id: "tr-p1",
      difficulty: "podstawowy",
      prompt: "Wartość wyrażenia $\\sin 30^\\circ + \\cos 60^\\circ$ jest równa:",
      options: { A: "$1$", B: "$\\sqrt{3}$", C: "$\\frac{1}{2}$", D: "$\\frac{\\sqrt{3} + 1}{2}$" },
      correct: "A",
      hints: ["Obie wartości znajdziesz w tablicy wzorów."],
      explanation: "$\\frac{1}{2} + \\frac{1}{2} = 1$.",
    },
    {
      id: "tr-p2",
      difficulty: "podstawowy",
      prompt: "Przyprostokątne trójkąta prostokątnego mają długości $3$ i $4$. Sinus kąta leżącego naprzeciw boku długości $3$ jest równy:",
      options: { A: "$\\frac{3}{5}$", B: "$\\frac{4}{5}$", C: "$\\frac{3}{4}$", D: "$\\frac{4}{3}$" },
      correct: "A",
      hints: ["Najpierw policz przeciwprostokątną."],
      explanation: "Przeciwprostokątna: $5$. Sinus to przyprostokątna naprzeciw kąta przez przeciwprostokątną: $\\frac{3}{5}$.",
    },
    {
      id: "tr-s1",
      difficulty: "sredni",
      prompt: "Kąt $\\alpha$ jest ostry i $\\cos\\alpha = \\frac{12}{13}$. Wtedy $\\sin\\alpha$ jest równy:",
      options: { A: "$\\frac{5}{13}$", B: "$\\frac{12}{5}$", C: "$\\frac{1}{13}$", D: "$\\frac{5}{12}$" },
      correct: "A",
      explanation: "$\\sin\\alpha = \\sqrt{1 - \\frac{144}{169}} = \\frac{5}{13}$.",
    },
    {
      id: "tr-s2",
      difficulty: "sredni",
      prompt: "Wartość wyrażenia $\\operatorname{tg} 60^\\circ \\cdot \\cos 30^\\circ$ jest równa:",
      options: { A: "$\\frac{3}{2}$", B: "$\\frac{\\sqrt{3}}{2}$", C: "$1$", D: "$3$" },
      correct: "A",
      explanation: "$\\sqrt{3} \\cdot \\frac{\\sqrt{3}}{2} = \\frac{3}{2}$.",
    },
    {
      id: "tr-z1",
      difficulty: "zaawansowany",
      prompt: "Kąt $\\alpha$ jest ostry i $\\operatorname{tg}\\alpha = 2$. Wtedy $\\cos\\alpha$ jest równy:",
      options: { A: "$\\frac{\\sqrt{5}}{5}$", B: "$\\frac{2\\sqrt{5}}{5}$", C: "$\\frac{1}{2}$", D: "$\\frac{1}{5}$" },
      correct: "A",
      explanation: "$\\sin\\alpha = 2\\cos\\alpha$, więc $5\\cos^2\\alpha = 1$ i $\\cos\\alpha = \\frac{1}{\\sqrt{5}} = \\frac{\\sqrt{5}}{5}$.",
    },
    {
      id: "tr-z2",
      difficulty: "zaawansowany",
      prompt: "Wartość wyrażenia $\\sin^2 37^\\circ + \\cos^2 37^\\circ + \\operatorname{tg} 45^\\circ$ jest równa:",
      options: { A: "$1$", B: "$2$", C: "$3$", D: "$0$" },
      correct: "B",
      explanation: "Jedynka trygonometryczna daje $1$, a $\\operatorname{tg} 45^\\circ = 1$.",
    },
  ],
  open: [
    {
      id: "tr-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W trójkącie prostokątnym przeciwprostokątna ma długość $10$, a jeden z kątów ostrych ma miarę $30^\\circ$. Oblicz długość przyprostokątnej leżącej naprzeciw tego kąta.",
      answers: ["5"],
      hints: ["Bok naprzeciw kąta i przeciwprostokątna – to sinus."],
      solution: [
        { step: "Zapisanie: $\\sin 30^\\circ = \\frac{a}{10}$.", points: 1 },
        { step: "Obliczenie: $a = 10 \\cdot \\frac{1}{2} = 5$.", points: 1 },
      ],
    },
    {
      id: "tr-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{3}{5}$. Oblicz wartość wyrażenia $\\cos\\alpha + \\operatorname{tg}\\alpha$.",
      answers: ["31/20"],
      hints: ["Zacznij od $\\cos\\alpha$ z jedynki trygonometrycznej."],
      solution: [
        { step: "Z jedynki trygonometrycznej: $\\cos\\alpha = \\frac{4}{5}$.", points: 1 },
        { step: "Tangens: $\\operatorname{tg}\\alpha = \\frac{3}{5} : \\frac{4}{5} = \\frac{3}{4}$.", points: 1 },
        { step: "Suma: $\\frac{4}{5} + \\frac{3}{4} = \\frac{31}{20}$.", points: 1 },
      ],
    },
  ],
};

export default practice;
