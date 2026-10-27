// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Twierdzenie Pitagorasa", tex: "a^2 + b^2 = c^2" },
    { label: "Pole trójkąta", tex: "P = \\frac{1}{2}ah" },
    { label: "Pole trapezu", tex: "P = \\frac{(a + b)h}{2}" },
    { label: "Trójkąt równoboczny", tex: "h = \\frac{a\\sqrt{3}}{2}, \\quad P = \\frac{a^2\\sqrt{3}}{4}" },
    { label: "Pola figur podobnych w skali k", tex: "\\frac{P_2}{P_1} = k^2" },
  ],
  closed: [
    {
      id: "tk-p1",
      difficulty: "podstawowy",
      prompt: "Przyprostokątne trójkąta prostokątnego mają długości $6$ i $8$. Przeciwprostokątna ma długość:",
      options: { A: "$10$", B: "$14$", C: "$12$", D: "$2\\sqrt{7}$" },
      correct: "A",
      hints: ["Twierdzenie Pitagorasa: $a^2 + b^2 = c^2$."],
      explanation: "$\\sqrt{36 + 64} = \\sqrt{100} = 10$.",
    },
    {
      id: "tk-p2",
      difficulty: "podstawowy",
      prompt: "Pole trapezu o podstawach $7$ i $3$ oraz wysokości $4$ jest równe:",
      options: { A: "$20$", B: "$40$", C: "$84$", D: "$10$" },
      correct: "A",
      hints: ["Średnia podstaw razy wysokość."],
      explanation: "$\\frac{(7 + 3) \\cdot 4}{2} = 20$.",
    },
    {
      id: "tk-s1",
      difficulty: "sredni",
      prompt: "Wysokość trójkąta równobocznego o boku $6$ jest równa:",
      options: { A: "$3\\sqrt{3}$", B: "$6\\sqrt{3}$", C: "$3$", D: "$9$" },
      correct: "A",
      explanation: "$h = \\frac{6\\sqrt{3}}{2} = 3\\sqrt{3}$.",
    },
    {
      id: "tk-s2",
      difficulty: "sredni",
      prompt: "Trójkąt $DEF$ jest podobny do trójkąta $ABC$ w skali $k = 3$. Pole trójkąta $ABC$ jest równe $4$. Pole trójkąta $DEF$ jest równe:",
      options: { A: "$36$", B: "$12$", C: "$7$", D: "$81$" },
      correct: "A",
      explanation: "Pola figur podobnych mają się jak $k^2$: $4 \\cdot 9 = 36$.",
    },
    {
      id: "tk-z1",
      difficulty: "zaawansowany",
      prompt: "Ramiona kąta o wierzchołku $O$ przecięto prostymi równoległymi $AB$ i $CD$ ($A$ i $C$ na jednym ramieniu, $B$ i $D$ na drugim, $A$ między $O$ i $C$). Wiadomo, że $|OA| = 4$, $|AC| = 6$, $|OB| = 6$. Długość $|BD|$ jest równa:",
      options: { A: "$9$", B: "$4$", C: "$8$", D: "$12$" },
      correct: "A",
      explanation: "Twierdzenie Talesa: $\\frac{|OA|}{|AC|} = \\frac{|OB|}{|BD|}$, czyli $\\frac{4}{6} = \\frac{6}{|BD|}$ i $|BD| = 9$.",
    },
    {
      id: "tk-z2",
      difficulty: "zaawansowany",
      prompt: "Romb ma przekątne długości $6$ i $8$. Bok tego rombu ma długość:",
      options: { A: "$5$", B: "$7$", C: "$10$", D: "$14$" },
      correct: "A",
      explanation: "Przekątne rombu dzielą się na połowy pod kątem prostym: $\\sqrt{3^2 + 4^2} = 5$.",
    },
  ],
  open: [
    {
      id: "tk-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Prostokąt ma boki długości $5$ i $12$. Oblicz długość jego przekątnej.",
      answers: ["13"],
      hints: ["Przekątna dzieli prostokąt na dwa trójkąty prostokątne."],
      solution: [
        { step: "Twierdzenie Pitagorasa: $d^2 = 25 + 144 = 169$.", points: 1 },
        { step: "Wynik: $d = 13$.", points: 1 },
      ],
    },
    {
      id: "tk-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "W trapezie równoramiennym podstawy mają długości $14$ i $6$, a ramię ma długość $5$. Oblicz pole tego trapezu.",
      answers: ["30"],
      hints: ["Poprowadź wysokości z końców krótszej podstawy."],
      solution: [
        { step: "Odcinek przy podstawie: $\\frac{14 - 6}{2} = 4$.", points: 1 },
        { step: "Wysokość z Pitagorasa: $h = \\sqrt{25 - 16} = 3$.", points: 1 },
        { step: "Pole: $\\frac{(14 + 6) \\cdot 3}{2} = 30$.", points: 1 },
      ],
    },
  ],
};

export default practice;
