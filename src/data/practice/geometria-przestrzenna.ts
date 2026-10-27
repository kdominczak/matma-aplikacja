// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Przekątna prostopadłościanu", tex: "d = \\sqrt{a^2 + b^2 + c^2}" },
    { label: "Objętość graniastosłupa", tex: "V = P_p \\cdot H" },
    { label: "Objętość ostrosłupa", tex: "V = \\frac{1}{3} P_p \\cdot H" },
    { label: "Walec", tex: "V = \\pi r^2 H" },
    { label: "Stożek", tex: "V = \\frac{1}{3}\\pi r^2 H, \\quad l^2 = r^2 + H^2" },
    { label: "Kula", tex: "V = \\frac{4}{3}\\pi r^3, \\quad P = 4\\pi r^2" },
  ],
  closed: [
    {
      id: "gp-p1",
      difficulty: "podstawowy",
      prompt: "Objętość sześcianu o krawędzi $3$ jest równa:",
      options: { A: "$27$", B: "$9$", C: "$54$", D: "$81$" },
      correct: "A",
      hints: ["Objętość sześcianu to krawędź do potęgi trzeciej."],
      explanation: "$V = 3^3 = 27$.",
    },
    {
      id: "gp-p2",
      difficulty: "podstawowy",
      prompt: "Objętość walca o promieniu podstawy $2$ i wysokości $5$ jest równa:",
      options: { A: "$20\\pi$", B: "$10\\pi$", C: "$4\\pi$", D: "$50\\pi$" },
      correct: "A",
      hints: ["Pole podstawy ($\\pi r^2$) razy wysokość."],
      explanation: "$V = \\pi \\cdot 4 \\cdot 5 = 20\\pi$.",
    },
    {
      id: "gp-s1",
      difficulty: "sredni",
      prompt: "Przekątna prostopadłościanu o krawędziach $2$, $3$ i $6$ ma długość:",
      options: { A: "$7$", B: "$11$", C: "$\\sqrt{13}$", D: "$49$" },
      correct: "A",
      explanation: "$\\sqrt{4 + 9 + 36} = \\sqrt{49} = 7$.",
    },
    {
      id: "gp-s2",
      difficulty: "sredni",
      prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $5$. Jego objętość jest równa:",
      options: { A: "$60$", B: "$180$", C: "$30$", D: "$90$" },
      correct: "A",
      explanation: "$V = \\frac{1}{3} \\cdot 36 \\cdot 5 = 60$.",
    },
    {
      id: "gp-z1",
      difficulty: "zaawansowany",
      prompt: "Stożek ma promień podstawy $3$ i tworzącą długości $5$. Jego objętość jest równa:",
      options: { A: "$12\\pi$", B: "$15\\pi$", C: "$36\\pi$", D: "$45\\pi$" },
      correct: "A",
      explanation: "$H = \\sqrt{25 - 9} = 4$, więc $V = \\frac{1}{3}\\pi \\cdot 9 \\cdot 4 = 12\\pi$.",
    },
    {
      id: "gp-z2",
      difficulty: "zaawansowany",
      prompt: "Pole powierzchni kuli jest równe $36\\pi$. Objętość tej kuli jest równa:",
      options: { A: "$36\\pi$", B: "$108\\pi$", C: "$27\\pi$", D: "$12\\pi$" },
      correct: "A",
      explanation: "$4\\pi r^2 = 36\\pi$, więc $r = 3$ i $V = \\frac{4}{3}\\pi \\cdot 27 = 36\\pi$.",
    },
  ],
  open: [
    {
      id: "gp-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Graniastosłup prawidłowy trójkątny ma krawędź podstawy $4$ i wysokość $5$. Jego objętość zapisz w postaci $k\\sqrt{3}$ i podaj $k$.",
      answers: ["20"],
      answerLabel: "k =",
      hints: ["Podstawa to trójkąt równoboczny."],
      solution: [
        { step: "Pole podstawy: $P_p = \\frac{16\\sqrt{3}}{4} = 4\\sqrt{3}$.", points: 1 },
        { step: "Objętość: $V = 4\\sqrt{3} \\cdot 5 = 20\\sqrt{3}$, więc $k = 20$.", points: 1 },
      ],
    },
    {
      id: "gp-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Przekątna sześcianu ma długość $6\\sqrt{3}$. Oblicz objętość tego sześcianu.",
      answers: ["216"],
      hints: ["Przekątna sześcianu ma długość $a\\sqrt{3}$."],
      solution: [
        { step: "Przekątna sześcianu o krawędzi $a$: $d = a\\sqrt{3}$.", points: 1 },
        { step: "Krawędź: $a = 6$.", points: 1 },
        { step: "Objętość: $V = 6^3 = 216$.", points: 1 },
      ],
    },
  ],
};

export default practice;
