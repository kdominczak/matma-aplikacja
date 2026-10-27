// Zadania do zakładki „Zadania” – dział bez pełnej lekcji (teoria w przygotowaniu).
// Po zmianie zadań zamkniętych uruchom `npm run db:keys` (klucze odpowiedzi dla serwera).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Równanie okręgu o środku (a, b) i promieniu r", tex: "(x - a)^2 + (y - b)^2 = r^2" },
    { label: "Odległość punktu P od środka S", tex: "|PS| = \\sqrt{(x - a)^2 + (y - b)^2}" },
  ],
  closed: [
    {
      id: "ro-p1",
      difficulty: "podstawowy",
      prompt: "Środkiem okręgu $(x - 3)^2 + (y + 2)^2 = 16$ jest punkt:",
      options: { A: "$(3, -2)$", B: "$(-3, 2)$", C: "$(3, 2)$", D: "$(-3, -2)$" },
      correct: "A",
      hints: ["Znaki w nawiasach odwracasz: $x - 3$ daje $3$."],
      explanation: "W równaniu $(x - a)^2 + (y - b)^2 = r^2$ środek to $(a, b)$, a $y + 2 = y - (-2)$.",
    },
    {
      id: "ro-p2",
      difficulty: "podstawowy",
      prompt: "Promień okręgu $(x + 1)^2 + (y - 4)^2 = 25$ jest równy:",
      options: { A: "$25$", B: "$5$", C: "$\\sqrt{5}$", D: "$4$" },
      correct: "B",
      hints: ["Po prawej stronie stoi $r^2$, a nie $r$."],
      explanation: "$r^2 = 25$, więc $r = 5$.",
    },
    {
      id: "ro-s1",
      difficulty: "sredni",
      prompt: "Okrąg o środku $S = (2, -1)$ i promieniu $3$ ma równanie:",
      options: { A: "$(x - 2)^2 + (y + 1)^2 = 9$", B: "$(x + 2)^2 + (y - 1)^2 = 9$", C: "$(x - 2)^2 + (y + 1)^2 = 3$", D: "$(x - 2)^2 + (y - 1)^2 = 9$" },
      correct: "A",
      explanation: "$(x - 2)^2 + (y - (-1))^2 = 3^2$.",
    },
    {
      id: "ro-s2",
      difficulty: "sredni",
      prompt: "Punkt $P = (5, 1)$ leży na okręgu $(x - 2)^2 + (y - 1)^2 = r^2$. Wtedy $r$ jest równe:",
      options: { A: "$3$", B: "$9$", C: "$5$", D: "$4$" },
      correct: "A",
      explanation: "$(5 - 2)^2 + 0^2 = 9 = r^2$, więc $r = 3$.",
    },
    {
      id: "ro-z1",
      difficulty: "zaawansowany",
      prompt: "Okrąg o środku $S = (-3, 4)$ jest styczny do osi $Ox$. Jego promień jest równy:",
      options: { A: "$4$", B: "$3$", C: "$5$", D: "$7$" },
      correct: "A",
      explanation: "Promień to odległość środka od osi $Ox$, czyli $|y_S| = 4$.",
    },
    {
      id: "ro-z2",
      difficulty: "zaawansowany",
      prompt: "Okrąg o środku $S = (1, 2)$ przechodzi przez początek układu współrzędnych. Jego równanie to:",
      options: { A: "$(x - 1)^2 + (y - 2)^2 = 5$", B: "$(x - 1)^2 + (y - 2)^2 = \\sqrt{5}$", C: "$(x + 1)^2 + (y + 2)^2 = 5$", D: "$(x - 1)^2 + (y - 2)^2 = 3$" },
      correct: "A",
      explanation: "$r^2 = 1^2 + 2^2 = 5$.",
    },
  ],
  open: [
    {
      id: "ro-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Odcinek $AB$, gdzie $A = (-2, 1)$ i $B = (4, 9)$, jest średnicą okręgu. Oblicz promień tego okręgu.",
      answers: ["5"],
      hints: ["Promień to połowa długości średnicy."],
      solution: [
        { step: "Długość średnicy: $|AB| = \\sqrt{6^2 + 8^2} = 10$.", points: 1 },
        { step: "Promień: $r = 5$.", points: 1 },
      ],
    },
    {
      id: "ro-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Punkt $A = (1, 3)$ leży na okręgu o środku $S = (4, -1)$. Pole koła ograniczonego tym okręgiem zapisz w postaci $k\\pi$ i podaj $k$.",
      answers: ["25"],
      answerLabel: "k =",
      hints: ["Do pola potrzebujesz $r^2$ – nie musisz liczyć pierwiastka."],
      solution: [
        { step: "Kwadrat promienia: $r^2 = |AS|^2 = 3^2 + 4^2 = 25$.", points: 1 },
        { step: "Pole: $\\pi r^2 = 25\\pi$, więc $k = 25$.", points: 1 },
      ],
    },
  ],
};

export default practice;
