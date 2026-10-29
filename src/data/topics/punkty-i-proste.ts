import type { TopicContent } from "@/types/topic";

// Lekcja 35 – punkty, odcinki i proste na płaszczyźnie (dział IX podstawy). Zadania pp-p1…pp-z2 i pp-o1/pp-o2
// przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Długość odcinka",
      body:
        "Odcinek $AB$ jest przeciwprostokątną trójkąta, którego przyprostokątne to różnice współrzędnych. Stąd wzór:\n\n" +
        "$|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}$.\n\n" +
        "Na rysunku: $A = (0, 1)$, $B = (3, 5)$ – w poziomie $3$ kratki, w pionie $4$, więc $|AB| = \\sqrt{9 + 16} = 5$.",
      plot: {
        x: [-1, 4],
        y: [-1, 6],
        lines: [
          [
            [0, 1],
            [3, 5],
          ],
          [
            [0, 1],
            [3, 1],
            [3, 5],
          ],
        ],
        dots: [{ at: [0, 1] }, { at: [3, 5] }],
      },
      example: {
        prompt: "Oblicz długość odcinka o końcach $A = (-1, 7)$ i $B = (5, -1)$.",
        solution: "Różnice: $5 - (-1) = 6$ i $-1 - 7 = -8$.\n$|AB| = \\sqrt{36 + 64} = 10$.",
      },
    },
    {
      title: "Środek odcinka",
      body:
        "Środek odcinka to średnie współrzędnych końców: $S = \\left(\\frac{x_A + x_B}{2}, \\frac{y_A + y_B}{2}\\right)$.\n\n" +
        "Zadanie odwrotne – znasz środek $S$ i koniec $A$, szukasz $B$: z tego samego wzoru $x_B = 2x_S - x_A$, $y_B = 2y_S - y_A$.",
      example: {
        prompt: "Wyznacz środek odcinka o końcach $A = (-3, 4)$ i $B = (5, 2)$.",
        solution: "$S = \\left(\\frac{-3 + 5}{2}, \\frac{4 + 2}{2}\\right) = (1, 3)$.",
      },
    },
    {
      title: "Prosta przez dwa punkty",
      body:
        "Prosta $y = ax + b$: $a$ to współczynnik kierunkowy (o ile wzrasta $y$, gdy $x$ wzrasta o $1$), $b$ – punkt przecięcia z osią $OY$.\n\n" +
        "Przez dwa punkty: najpierw $a = \\frac{y_B - y_A}{x_B - x_A}$, potem $b$ z podstawienia jednego z punktów do $y = ax + b$.",
      example: {
        prompt: "Wyznacz równanie prostej przechodzącej przez punkty $A = (1, 2)$ i $B = (3, 8)$.",
        solution: "$a = \\frac{8 - 2}{3 - 1} = 3$.\nPunkt $A$: $2 = 3 \\cdot 1 + b$, więc $b = -1$.\nProsta: $y = 3x - 1$.",
      },
    },
    {
      title: "Proste równoległe i prostopadłe",
      body:
        "• Równoległe mają ten sam współczynnik kierunkowy: $a_1 = a_2$.\n\n" +
        "• Prostopadłe: $a_1 \\cdot a_2 = -1$, czyli $a_2 = -\\frac{1}{a_1}$ – odwrotność z przeciwnym znakiem.\n\n" +
        "Prostą o znanym $a$ przez punkt $(x_0, y_0)$ zapiszesz od razu: $y - y_0 = a(x - x_0)$.",
      example: {
        prompt: "Wyznacz prostą prostopadłą do $y = 3x + 1$, przechodzącą przez punkt $P = (6, 0)$.",
        solution: "$a = -\\frac{1}{3}$.\n$0 = -\\frac{1}{3} \\cdot 6 + b$, więc $b = 2$.\nProsta: $y = -\\frac{1}{3}x + 2$.",
      },
    },
    {
      title: "Punkt przecięcia prostych",
      body:
        "Punkt wspólny dwóch prostych spełnia oba równania naraz – to rozwiązanie układu równań. " +
        "Gdy obie proste są w postaci $y = \\ldots$, przyrównaj prawe strony.\n\n" +
        "Proste równoległe (to samo $a$, różne $b$) nie mają punktu wspólnego.",
      example: {
        prompt: "Wyznacz punkt przecięcia prostych $y = 2x - 1$ i $y = -x + 5$.",
        solution: "$2x - 1 = -x + 5 \\Rightarrow 3x = 6 \\Rightarrow x = 2$.\n$y = 2 \\cdot 2 - 1 = 3$, punkt $(2, 3)$.",
      },
    },
  ],
  formulas: [
    { label: "Długość odcinka", tex: "|AB| = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2}" },
    { label: "Środek odcinka", tex: "S = \\left(\\frac{x_A + x_B}{2}, \\frac{y_A + y_B}{2}\\right)" },
    { label: "Współczynnik kierunkowy prostej AB", tex: "a = \\frac{y_B - y_A}{x_B - x_A}" },
    { label: "Prosta o współczynniku a przez punkt", tex: "y - y_0 = a(x - x_0)" },
    { label: "Proste równoległe", tex: "a_1 = a_2" },
    { label: "Proste prostopadłe", tex: "a_1 \\cdot a_2 = -1" },
  ],
  traps: [
    "Środek: dodajesz współrzędne i dzielisz przez $2$. Długość: odejmujesz i podnosisz do kwadratu – nie mieszaj wzorów.",
    "Prostopadła do $a = 2$ ma $a = -\\frac{1}{2}$ – nie $-2$ i nie $\\frac{1}{2}$.",
    "We wzorze na $a$ odejmuj w tej samej kolejności na górze i na dole: $\\frac{y_B - y_A}{x_B - x_A}$.",
    "Znasz środek $S$ i koniec $A$? Drugi koniec to $B = 2S - A$, a nie średnia $S$ i $A$.",
  ],
  openTasks: [
    {
      id: "pp-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Oblicz długość odcinka o końcach $A = (-2, 1)$ i $B = (4, 9)$.",
      answers: ["10"],
      answerLabel: "|AB| =",
      hints: ["Różnice współrzędnych to przyprostokątne – dalej Pitagoras."],
      solution: [
        { step: "Różnice: $4 - (-2) = 6$, $9 - 1 = 8$.", points: 1 },
        { step: "Długość: $\\sqrt{36 + 64} = 10$.", points: 1 },
      ],
    },
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
  tests: {
    podstawowy: [
      {
        id: "pp-p1",
        prompt: "Środkiem odcinka o końcach $A = (2, 5)$ i $B = (6, -1)$ jest punkt:",
        options: { A: "$(4, 2)$", B: "$(8, 4)$", C: "$(2, 3)$", D: "$(4, 3)$" },
        correct: "A",
        hints: ["Środek to średnie współrzędnych końców."],
        explanation: "$\\left(\\frac{2 + 6}{2}, \\frac{5 - 1}{2}\\right) = (4, 2)$.",
      },
      {
        id: "pp-p2",
        prompt: "Długość odcinka o końcach $A = (1, 2)$ i $B = (4, 6)$ jest równa:",
        options: { A: "$5$", B: "$7$", C: "$25$", D: "$\\sqrt{7}$" },
        correct: "A",
        hints: ["Policz różnice współrzędnych i użyj twierdzenia Pitagorasa."],
        explanation: "$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.",
      },
      {
        id: "pp-p3",
        prompt: "Współczynnik kierunkowy prostej przechodzącej przez punkty $A = (1, 2)$ i $B = (3, 8)$ jest równy:",
        options: { A: "$3$", B: "$\\frac{1}{3}$", C: "$5$", D: "$-3$" },
        correct: "A",
        hints: ["$a = \\frac{y_B - y_A}{x_B - x_A}$.", "Na górze różnica $y$-ów: $8 - 2$, na dole $x$-ów: $3 - 1$."],
        explanation: "$a = \\frac{8 - 2}{3 - 1} = \\frac{6}{2} = 3$.",
        trap: "$\\frac{1}{3}$ wychodzi, gdy różnicę $x$-ów wpiszesz na górę – na górze zawsze są $y$-ki.",
      },
    ],
    sredni: [
      {
        id: "pp-s1",
        prompt: "Prosta $y = 2x - 3$ jest równoległa do prostej:",
        options: { A: "$y = 2x + 7$", B: "$y = -2x - 3$", C: "$y = \\frac{1}{2}x - 3$", D: "$y = -\\frac{1}{2}x + 1$" },
        correct: "A",
        explanation: "Proste równoległe mają ten sam współczynnik kierunkowy $a = 2$.",
      },
      {
        id: "pp-s2",
        prompt: "Punkt $S = (3, -1)$ jest środkiem odcinka $AB$, gdzie $A = (1, 4)$. Punkt $B$ ma współrzędne:",
        options: { A: "$(5, -6)$", B: "$\\left(2, \\frac{3}{2}\\right)$", C: "$(4, 3)$", D: "$(-5, 6)$" },
        correct: "A",
        explanation: "$x_B = 2 \\cdot 3 - 1 = 5$, $y_B = 2 \\cdot (-1) - 4 = -6$.",
      },
      {
        id: "pp-s3",
        prompt: "Punktem przecięcia prostych $y = 2x - 1$ i $y = -x + 5$ jest punkt:",
        options: { A: "$(2, 3)$", B: "$(3, 2)$", C: "$(-2, -5)$", D: "$(0, -1)$" },
        correct: "A",
        explanation: "$2x - 1 = -x + 5 \\Rightarrow x = 2$, a $y = 2 \\cdot 2 - 1 = 3$.",
        trap: "$(0, -1)$ leży tylko na pierwszej prostej – punkt przecięcia musi spełniać oba równania.",
      },
    ],
    zaawansowany: [
      {
        id: "pp-z1",
        prompt: "Prosta prostopadła do prostej $y = -\\frac{1}{4}x + 2$ ma współczynnik kierunkowy:",
        options: { A: "$4$", B: "$-4$", C: "$\\frac{1}{4}$", D: "$-\\frac{1}{4}$" },
        correct: "A",
        explanation: "$-\\frac{1}{4} \\cdot a = -1$, więc $a = 4$.",
      },
      {
        id: "pp-z2",
        prompt: "Prosta przechodząca przez punkty $A = (-1, 3)$ i $B = (3, -5)$ ma równanie:",
        options: { A: "$y = -2x + 1$", B: "$y = 2x + 5$", C: "$y = -2x - 1$", D: "$y = -\\frac{1}{2}x + \\frac{5}{2}$" },
        correct: "A",
        explanation: "$a = \\frac{-5 - 3}{3 + 1} = -2$. Z punktu $A$: $3 = 2 + b$, więc $b = 1$.",
      },
      {
        id: "pp-z3",
        prompt: "Prosta prostopadła do prostej $y = 3x + 1$, przechodząca przez punkt $P = (6, 0)$, ma równanie:",
        options: {
          A: "$y = -\\frac{1}{3}x + 2$",
          B: "$y = 3x - 18$",
          C: "$y = -3x + 18$",
          D: "$y = \\frac{1}{3}x - 2$",
        },
        correct: "A",
        explanation: "$a = -\\frac{1}{3}$, a z punktu $P$: $0 = -2 + b$, więc $b = 2$.",
        trap: "Wszystkie cztery proste przechodzą przez $P$ – rozstrzyga współczynnik: odwrotność z PRZECIWNYM znakiem.",
      },
    ],
  },
};

export default content;
