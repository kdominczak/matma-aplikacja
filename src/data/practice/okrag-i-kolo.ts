// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Długość okręgu", tex: "L = 2\\pi r" },
    { label: "Pole koła", tex: "P = \\pi r^2" },
    { label: "Długość łuku", tex: "l = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r" },
    { label: "Pole wycinka koła", tex: "P = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2" },
    { label: "Kąt wpisany i środkowy (ten sam łuk)", tex: "\\beta = \\frac{1}{2}\\alpha" },
  ],
  closed: [
    {
      id: "ok-p1",
      difficulty: "podstawowy",
      prompt: "Pole koła o promieniu $4$ jest równe:",
      options: { A: "$16\\pi$", B: "$8\\pi$", C: "$4\\pi$", D: "$64\\pi$" },
      correct: "A",
      hints: ["Pole koła to $\\pi r^2$ – podnieś promień do kwadratu."],
      explanation: "$P = \\pi \\cdot 4^2 = 16\\pi$.",
    },
    {
      id: "ok-p2",
      difficulty: "podstawowy",
      prompt: "Kąt środkowy ma miarę $80^\\circ$. Kąt wpisany oparty na tym samym łuku ma miarę:",
      options: { A: "$40^\\circ$", B: "$80^\\circ$", C: "$160^\\circ$", D: "$20^\\circ$" },
      correct: "A",
      hints: ["Kąt wpisany to połowa kąta środkowego."],
      explanation: "Kąt wpisany jest dwa razy mniejszy od środkowego: $40^\\circ$.",
    },
    {
      id: "ok-s1",
      difficulty: "sredni",
      prompt: "Długość okręgu jest równa $10\\pi$. Pole koła ograniczonego tym okręgiem jest równe:",
      options: { A: "$25\\pi$", B: "$100\\pi$", C: "$10\\pi$", D: "$5\\pi$" },
      correct: "A",
      explanation: "$2\\pi r = 10\\pi$, więc $r = 5$ i $P = 25\\pi$.",
    },
    {
      id: "ok-s2",
      difficulty: "sredni",
      prompt: "Kąt wpisany oparty na średnicy okręgu ma miarę:",
      options: { A: "$90^\\circ$", B: "$180^\\circ$", C: "$45^\\circ$", D: "$60^\\circ$" },
      correct: "A",
      explanation: "Kąt środkowy oparty na średnicy to $180^\\circ$, a wpisany jest jego połową: $90^\\circ$.",
    },
    {
      id: "ok-z1",
      difficulty: "zaawansowany",
      prompt: "Pole wycinka koła o promieniu $6$ i kącie środkowym $60^\\circ$ jest równe:",
      options: { A: "$6\\pi$", B: "$12\\pi$", C: "$36\\pi$", D: "$3\\pi$" },
      correct: "A",
      explanation: "$\\frac{60^\\circ}{360^\\circ} \\cdot 36\\pi = 6\\pi$.",
    },
    {
      id: "ok-z2",
      difficulty: "zaawansowany",
      prompt: "Kąt wpisany $ACB$ ma miarę $35^\\circ$. Kąt środkowy $ASB$ oparty na tym samym łuku ma miarę:",
      options: { A: "$70^\\circ$", B: "$35^\\circ$", C: "$145^\\circ$", D: "$110^\\circ$" },
      correct: "A",
      explanation: "Kąt środkowy jest dwa razy większy od wpisanego: $70^\\circ$.",
    },
  ],
  open: [
    {
      id: "ok-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Długość łuku okręgu o promieniu $9$, na którym oparty jest kąt środkowy $120^\\circ$, jest równa $a\\pi$. Oblicz $a$.",
      answers: ["6"],
      answerLabel: "a =",
      hints: ["Łuk to taka część obwodu, jaką częścią $360^\\circ$ jest kąt środkowy."],
      solution: [
        { step: "Wzór: $l = \\frac{120^\\circ}{360^\\circ} \\cdot 2\\pi \\cdot 9$.", points: 1 },
        { step: "Obliczenie: $l = \\frac{1}{3} \\cdot 18\\pi = 6\\pi$, więc $a = 6$.", points: 1 },
      ],
    },
    {
      id: "ok-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Pole koła jest równe $49\\pi$. Obwód tego koła zapisz w postaci $b\\pi$ i podaj liczbę $b$.",
      answers: ["14"],
      answerLabel: "b =",
      hints: ["Z pola wyznacz promień."],
      solution: [
        { step: "$\\pi r^2 = 49\\pi$, więc $r = 7$.", points: 1 },
        { step: "Obwód: $2\\pi \\cdot 7 = 14\\pi$, więc $b = 14$.", points: 1 },
      ],
    },
  ],
};

export default practice;
