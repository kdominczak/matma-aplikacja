import type { Point } from "@/types/plot";
import type { TopicContent } from "@/types/topic";

/** Punkty okręgu do rysunku (wykres przyjmuje łamane). */
function circle(a: number, b: number, r: number): Point[] {
  return Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI;
    return [a + r * Math.cos(t), b + r * Math.sin(t)];
  });
}

// Lekcja 36 – równanie okręgu (dział IX podstawy). Zadania ro-p1…ro-z2 i ro-o1/ro-o2 przeniesione bez zmian
// z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Równanie okręgu",
      body:
        "Okrąg to wszystkie punkty odległe od środka $S = (a, b)$ o promień $r$. Z twierdzenia Pitagorasa dostajemy równanie:\n\n" +
        "$(x - a)^2 + (y - b)^2 = r^2$.\n\n" +
        "Odczytując środek, odwracasz znaki z nawiasów, a promień to pierwiastek z prawej strony. " +
        "Na rysunku: $(x - 1)^2 + (y - 1)^2 = 4$ – środek $(1, 1)$, promień $2$.",
      plot: {
        x: [-2, 4],
        y: [-2, 4],
        lines: [circle(1, 1, 2)],
        dots: [{ at: [1, 1] }],
      },
      example: {
        prompt: "Podaj środek i promień okręgu $(x + 3)^2 + (y - 2)^2 = 49$.",
        solution: "$x + 3 = x - (-3)$, więc $S = (-3, 2)$.\n$r^2 = 49$, więc $r = 7$.",
      },
    },
    {
      title: "Równanie ze środka i promienia",
      body:
        "Znając środek i promień, wstawiasz je od razu do wzoru. Uważaj na ujemne współrzędne: odjęcie liczby ujemnej to dodawanie. " +
        "Okrąg o środku w początku układu ma najprostsze równanie: $x^2 + y^2 = r^2$.",
      example: {
        prompt: "Zapisz równanie okręgu o środku $S = (-2, 3)$ i promieniu $4$.",
        solution: "$(x - (-2))^2 + (y - 3)^2 = 4^2$, czyli $(x + 2)^2 + (y - 3)^2 = 16$.",
      },
    },
    {
      title: "Środek i punkt albo średnica",
      body:
        "• Znasz środek $S$ i punkt $P$ na okręgu – promień to odległość $|SP|$.\n\n" +
        "• Znasz końce średnicy $A$ i $B$ – środek okręgu to środek odcinka $AB$, a promień to połowa jego długości.\n\n" +
        "Do równania potrzebujesz $r^2$, więc często nie musisz nawet wyciągać pierwiastka.",
      example: {
        prompt: "Odcinek o końcach $A = (1, 2)$ i $B = (7, 10)$ jest średnicą okręgu. Wyznacz równanie okręgu.",
        solution: "Środek: $S = (4, 6)$.\n$|AB| = \\sqrt{36 + 64} = 10$, więc $r = 5$.\nRównanie: $(x - 4)^2 + (y - 6)^2 = 25$.",
      },
    },
    {
      title: "Punkt na okręgu, wewnątrz czy na zewnątrz",
      body:
        "Wstaw współrzędne punktu do lewej strony równania i porównaj z $r^2$:\n\n" +
        "• wynik równy $r^2$ – punkt leży na okręgu,\n\n" +
        "• mniejszy – wewnątrz koła,\n\n" +
        "• większy – na zewnątrz.",
      example: {
        prompt: "Okrąg ma równanie $(x - 1)^2 + (y + 2)^2 = 25$. Gdzie leżą punkty $P = (4, 2)$ i $Q = (2, 0)$?",
        solution: "$P$: $9 + 16 = 25$ – na okręgu.\n$Q$: $1 + 4 = 5 < 25$ – wewnątrz koła.",
      },
    },
    {
      title: "Okrąg styczny do osi układu",
      body:
        "Okrąg styczny do osi $Ox$ dotyka jej w jednym punkcie, więc promień to odległość środka od tej osi: $r = |b|$. " +
        "Styczny do osi $Oy$: $r = |a|$.\n\n" +
        "Odległość od osi $Ox$ mierzysz w pionie (druga współrzędna), od osi $Oy$ – w poziomie (pierwsza).",
      example: {
        prompt: "Okrąg o środku $S = (3, -5)$ jest styczny do osi $Oy$. Wyznacz jego równanie.",
        solution: "Odległość od osi $Oy$: $r = |3| = 3$.\nRównanie: $(x - 3)^2 + (y + 5)^2 = 9$.",
      },
    },
  ],
  formulas: [
    { label: "Równanie okręgu o środku (a, b) i promieniu r", tex: "(x - a)^2 + (y - b)^2 = r^2" },
    { label: "Okrąg o środku w początku układu", tex: "x^2 + y^2 = r^2" },
    { label: "Odległość punktu P od środka S", tex: "|PS| = \\sqrt{(x - a)^2 + (y - b)^2}" },
    { label: "Okrąg styczny do osi Ox / Oy", tex: "r = |b|, \\quad r = |a|" },
  ],
  traps: [
    "Znaki w nawiasach się odwracają: $(x + 2)^2$ oznacza $a = -2$.",
    "Po prawej stronie jest $r^2$ – przy $= 16$ promień to $4$, a nie $16$.",
    "Styczny do osi $Ox$: $r = |b|$ (pion), do osi $Oy$: $r = |a|$ (poziom) – nie zamieniaj osi.",
    "Średnica to cały odcinek – promień to połowa jego długości, a środek okręgu to środek odcinka.",
  ],
  openTasks: [
    {
      id: "ro-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Okrąg o środku $S = (2, -3)$ przechodzi przez punkt $P = (5, 1)$. Oblicz promień tego okręgu.",
      answers: ["5"],
      answerLabel: "r =",
      hints: ["Promień to odległość $|SP|$ – policz ją ze wzoru na długość odcinka."],
      solution: [
        { step: "Różnice współrzędnych: $5 - 2 = 3$, $1 - (-3) = 4$.", points: 1 },
        { step: "Promień: $r = \\sqrt{9 + 16} = 5$.", points: 1 },
      ],
    },
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
  tests: {
    podstawowy: [
      {
        id: "ro-p1",
        prompt: "Środkiem okręgu $(x - 3)^2 + (y + 2)^2 = 16$ jest punkt:",
        options: { A: "$(3, -2)$", B: "$(-3, 2)$", C: "$(3, 2)$", D: "$(-3, -2)$" },
        correct: "A",
        hints: ["Znaki w nawiasach odwracasz: $x - 3$ daje $3$."],
        explanation: "W równaniu $(x - a)^2 + (y - b)^2 = r^2$ środek to $(a, b)$, a $y + 2 = y - (-2)$.",
      },
      {
        id: "ro-p2",
        prompt: "Promień okręgu $(x + 1)^2 + (y - 4)^2 = 25$ jest równy:",
        options: { A: "$25$", B: "$5$", C: "$\\sqrt{5}$", D: "$4$" },
        correct: "B",
        hints: ["Po prawej stronie stoi $r^2$, a nie $r$."],
        explanation: "$r^2 = 25$, więc $r = 5$.",
      },
      {
        id: "ro-p3",
        prompt: "Okrąg o środku w punkcie $(0, 0)$ i promieniu $3$ ma równanie:",
        options: { A: "$x^2 + y^2 = 9$", B: "$x^2 + y^2 = 3$", C: "$x^2 + y^2 = 6$", D: "$(x - 3)^2 + (y - 3)^2 = 9$" },
        correct: "A",
        hints: ["Środek w początku układu: $a = 0$, $b = 0$.", "Po prawej stronie wpisujesz $r^2$."],
        explanation: "$(x - 0)^2 + (y - 0)^2 = 3^2$, czyli $x^2 + y^2 = 9$.",
        trap: "$x^2 + y^2 = 3$ to okrąg o promieniu $\\sqrt{3}$ – po prawej musi być kwadrat promienia.",
      },
    ],
    sredni: [
      {
        id: "ro-s1",
        prompt: "Okrąg o środku $S = (2, -1)$ i promieniu $3$ ma równanie:",
        options: { A: "$(x - 2)^2 + (y + 1)^2 = 9$", B: "$(x + 2)^2 + (y - 1)^2 = 9$", C: "$(x - 2)^2 + (y + 1)^2 = 3$", D: "$(x - 2)^2 + (y - 1)^2 = 9$" },
        correct: "A",
        explanation: "$(x - 2)^2 + (y - (-1))^2 = 3^2$.",
      },
      {
        id: "ro-s2",
        prompt: "Punkt $P = (5, 1)$ leży na okręgu $(x - 2)^2 + (y - 1)^2 = r^2$. Wtedy $r$ jest równe:",
        options: { A: "$3$", B: "$9$", C: "$5$", D: "$4$" },
        correct: "A",
        explanation: "$(5 - 2)^2 + 0^2 = 9 = r^2$, więc $r = 3$.",
      },
      {
        id: "ro-s3",
        prompt: "Punkt $P = (4, 2)$ względem okręgu $(x - 1)^2 + (y + 2)^2 = 25$:",
        options: { A: "leży na okręgu", B: "leży wewnątrz koła", C: "leży na zewnątrz koła", D: "jest środkiem okręgu" },
        correct: "A",
        explanation: "$(4 - 1)^2 + (2 + 2)^2 = 9 + 16 = 25 = r^2$, więc $P$ leży na okręgu.",
      },
    ],
    zaawansowany: [
      {
        id: "ro-z1",
        prompt: "Okrąg o środku $S = (-3, 4)$ jest styczny do osi $Ox$. Jego promień jest równy:",
        options: { A: "$4$", B: "$3$", C: "$5$", D: "$7$" },
        correct: "A",
        explanation: "Promień to odległość środka od osi $Ox$, czyli $|y_S| = 4$.",
      },
      {
        id: "ro-z2",
        prompt: "Okrąg o środku $S = (1, 2)$ przechodzi przez początek układu współrzędnych. Jego równanie to:",
        options: { A: "$(x - 1)^2 + (y - 2)^2 = 5$", B: "$(x - 1)^2 + (y - 2)^2 = \\sqrt{5}$", C: "$(x + 1)^2 + (y + 2)^2 = 5$", D: "$(x - 1)^2 + (y - 2)^2 = 3$" },
        correct: "A",
        explanation: "$r^2 = 1^2 + 2^2 = 5$.",
      },
      {
        id: "ro-z3",
        prompt: "Odcinek o końcach $A = (-1, 3)$ i $B = (5, -5)$ jest średnicą okręgu. Równanie tego okręgu to:",
        options: {
          A: "$(x - 2)^2 + (y + 1)^2 = 25$",
          B: "$(x - 2)^2 + (y + 1)^2 = 100$",
          C: "$(x + 2)^2 + (y - 1)^2 = 25$",
          D: "$(x - 2)^2 + (y + 1)^2 = 5$",
        },
        correct: "A",
        explanation: "Środek: $S = (2, -1)$. $|AB| = \\sqrt{36 + 64} = 10$, więc $r = 5$ i $r^2 = 25$.",
        trap: "$100$ to kwadrat ŚREDNICY – do równania wchodzi kwadrat promienia.",
      },
    ],
  },
};

export default content;
