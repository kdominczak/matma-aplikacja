import type { TopicContent } from "@/types/topic";

// Rozszerzenie – geometria analityczna: odległość punktu od prostej, styczne, wzajemne położenie okręgów (dział IX, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Odległość punktu od prostej",
      body:
        "Prostą zapisz w postaci ogólnej $Ax + By + C = 0$. Odległość punktu $P = (x_0, y_0)$ od tej prostej:\n\n" +
        "$d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}$.\n\n" +
        "Ten sam wzór daje odległość prostych równoległych – wystarczy wziąć dowolny punkt jednej z nich.",
      example: {
        prompt: "Oblicz odległość punktu $P = (1, 2)$ od prostej $3x + 4y - 1 = 0$.",
        solution: "$d = \\frac{|3 \\cdot 1 + 4 \\cdot 2 - 1|}{\\sqrt{9 + 16}}$\n$= \\frac{10}{5} = 2$.",
      },
      check: {
        id: "rz-ga-t1",
        prompt: "Odległość punktu $(0, 0)$ od prostej $4x - 3y + 10 = 0$ jest równa:",
        options: { A: "$2$", B: "$10$", C: "$\\frac{10}{7}$", D: "$5$" },
        correct: "A",
        explanation: "$d = \\frac{|10|}{\\sqrt{16 + 9}} = \\frac{10}{5} = 2$.",
        trap: "$\\frac{10}{7}$ wychodzi, gdy w mianowniku dodasz $4 + 3$ zamiast $\\sqrt{4^2 + 3^2}$.",
      },
    },
    {
      title: "Prosta i okrąg – styczna",
      body:
        "Porównaj odległość $d$ środka okręgu od prostej z promieniem $r$:\n\n" +
        "• $d < r$ – dwa punkty wspólne (sieczna),\n\n" +
        "• $d = r$ – jeden punkt wspólny (styczna),\n\n" +
        "• $d > r$ – brak punktów wspólnych.\n\n" +
        "Warunek $d = r$ zamienia zadanie o stycznej z parametrem w równanie z wartością bezwzględną.",
      example: {
        prompt: "Dla jakich $c$ prosta $2x - y + c = 0$ jest styczna do okręgu $(x - 1)^2 + (y + 2)^2 = 5$?",
        solution:
          "$S = (1, -2)$, $r = \\sqrt{5}$.\n" +
          "$d = \\frac{|2 + 2 + c|}{\\sqrt{5}} = \\sqrt{5}$, czyli $|4 + c| = 5$.\n" +
          "$c = 1$ lub $c = -9$.",
      },
      check: {
        id: "rz-ga-t2",
        prompt: "Prosta $y = 3$ jest styczna do okręgu $(x - 2)^2 + (y + 1)^2 = r^2$. Wtedy:",
        options: { A: "$r = 4$", B: "$r = 3$", C: "$r = 2$", D: "$r = 16$" },
        correct: "A",
        explanation: "Środek $(2, -1)$, odległość od prostej $y = 3$ to $|3 - (-1)| = 4$, więc $r = 4$.",
        trap: "Środek ma $y = -1$ (znak w nawiasie się odwraca), więc odległość to $4$, a nie $2$.",
      },
    },
    {
      title: "Wzajemne położenie dwóch okręgów",
      body:
        "Policz odległość środków $|O_1O_2|$ i porównaj z sumą i różnicą promieni:\n\n" +
        "• $|O_1O_2| = r_1 + r_2$ – styczne zewnętrznie,\n\n" +
        "• $|O_1O_2| = |r_1 - r_2|$ – styczne wewnętrznie,\n\n" +
        "• $|r_1 - r_2| < |O_1O_2| < r_1 + r_2$ – przecinają się w dwóch punktach,\n\n" +
        "• większa odległość – rozłączne zewnętrznie, mniejsza – jeden okrąg w drugim.",
      example: {
        prompt: "Jak położone są okręgi $x^2 + y^2 = 4$ i $(x - 6)^2 + y^2 = 16$?",
        solution: "$O_1 = (0, 0)$, $r_1 = 2$; $O_2 = (6, 0)$, $r_2 = 4$.\n$|O_1O_2| = 6 = 2 + 4$ – okręgi są styczne zewnętrznie.",
      },
      check: {
        id: "rz-ga-t3",
        prompt: "Środki dwóch okręgów są odległe o $5$, a ich promienie to $2$ i $3$. Te okręgi są:",
        options: {
          A: "styczne zewnętrznie",
          B: "przecinające się w dwóch punktach",
          C: "rozłączne zewnętrznie",
          D: "styczne wewnętrznie",
        },
        correct: "A",
        explanation: "$|O_1O_2| = 5 = 2 + 3$ – suma promieni.",
      },
    },
  ],
  formulas: [
    { label: "Odległość punktu od prostej", tex: "d = \\frac{|Ax_0 + By_0 + C|}{\\sqrt{A^2 + B^2}}" },
    { label: "Równanie okręgu", tex: "(x - a)^2 + (y - b)^2 = r^2" },
    { label: "Postać rozwinięta okręgu", tex: "x^2 + y^2 - 2ax - 2by + c = 0, \\quad r^2 = a^2 + b^2 - c" },
    { label: "Styczna do okręgu", tex: "d(S, l) = r" },
    { label: "Okręgi styczne", tex: "|O_1O_2| = r_1 + r_2 \\ \\text{lub} \\ |O_1O_2| = |r_1 - r_2|" },
  ],
  traps: [
    "W mianowniku wzoru na odległość jest $\\sqrt{A^2 + B^2}$, nie $A + B$.",
    "Prosta musi być w postaci ogólnej – z $y = ax + b$ przejdź do $ax - y + b = 0$.",
    "Warunek styczności z wartością bezwzględną daje zwykle DWA rozwiązania.",
    "Okręgi styczne mogą być styczne zewnętrznie albo wewnętrznie – sprawdź oba warunki.",
  ],
  openTasks: [
    {
      id: "rz-ga-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Oblicz odległość środka okręgu $x^2 + y^2 + 4x - 2y - 4 = 0$ od prostej $3x + 4y - 13 = 0$.",
      answers: ["3"],
      answerLabel: "d =",
      hints: ["Zwiń równanie okręgu do postaci $(x - a)^2 + (y - b)^2 = r^2$."],
      solution: [
        { step: "$(x + 2)^2 + (y - 1)^2 = 9$, środek $S = (-2, 1)$.", points: 1 },
        { step: "$d = \\frac{|3 \\cdot (-2) + 4 \\cdot 1 - 13|}{5}$.", points: 1 },
        { step: "$d = \\frac{15}{5} = 3$ (prosta jest styczna – $r = 3$).", points: 1 },
      ],
    },
    {
      id: "rz-ga-o2",
      difficulty: "zaawansowany",
      points: 4,
      prompt: "Wyznacz wszystkie wartości $c$, dla których prosta $2x - y + c = 0$ jest styczna do okręgu $(x - 1)^2 + (y + 2)^2 = 5$.",
      answers: ["-9;1"],
      answerLabel: "c =",
      hints: ["Prosta jest styczna, gdy odległość środka od prostej równa się promieniowi."],
      solution: [
        { step: "Środek $S = (1, -2)$, promień $r = \\sqrt{5}$.", points: 1 },
        { step: "$d = \\frac{|2 \\cdot 1 - (-2) + c|}{\\sqrt{5}} = \\frac{|4 + c|}{\\sqrt{5}}$.", points: 1 },
        { step: "$\\frac{|4 + c|}{\\sqrt{5}} = \\sqrt{5}$, czyli $|4 + c| = 5$.", points: 1 },
        { step: "$c = 1$ lub $c = -9$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-ga-p1",
        prompt: "Okrąg $x^2 + y^2 - 6x + 4y - 3 = 0$ ma środek $S$ i promień $r$:",
        options: {
          A: "$S = (3, -2)$, $r = 4$",
          B: "$S = (-3, 2)$, $r = 4$",
          C: "$S = (3, -2)$, $r = 16$",
          D: "$S = (3, -2)$, $r = \\sqrt{3}$",
        },
        correct: "A",
        explanation: "$(x - 3)^2 + (y + 2)^2 = 3 + 9 + 4 = 16$, więc $S = (3, -2)$, $r = 4$.",
      },
      {
        id: "rz-ga-p2",
        prompt: "Odległość punktu $A = (2, -1)$ od prostej $3x + 4y + 8 = 0$ jest równa:",
        options: { A: "$2$", B: "$10$", C: "$\\frac{6}{5}$", D: "$\\frac{14}{5}$" },
        correct: "A",
        explanation: "$\\frac{|6 - 4 + 8|}{5} = \\frac{10}{5} = 2$.",
      },
    ],
    sredni: [
      {
        id: "rz-ga-s1",
        prompt: "Prosta $x - y + m = 0$ jest styczna do okręgu $x^2 + y^2 = 8$ wtedy i tylko wtedy, gdy:",
        options: { A: "$m = 4$ lub $m = -4$", B: "$m = 8$", C: "$m = 2\\sqrt{2}$", D: "$m = 4$" },
        correct: "A",
        explanation: "$\\frac{|m|}{\\sqrt{2}} = \\sqrt{8}$, więc $|m| = 4$.",
        trap: "Wartość bezwzględna daje dwa rozwiązania – po obu stronach okręgu.",
      },
      {
        id: "rz-ga-s2",
        prompt: "Punkt symetryczny do $A = (3, 1)$ względem prostej $y = x$ to:",
        options: { A: "$(1, 3)$", B: "$(-3, -1)$", C: "$(-1, -3)$", D: "$(3, -1)$" },
        correct: "A",
        explanation: "Symetria względem prostej $y = x$ zamienia współrzędne miejscami.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-ga-z1",
        prompt: "Okręgi $x^2 + y^2 = 9$ i $(x - a)^2 + y^2 = 1$ są styczne zewnętrznie wtedy i tylko wtedy, gdy:",
        options: { A: "$a = 4$ lub $a = -4$", B: "$a = 2$ lub $a = -2$", C: "$a = 4$", D: "$a = 2$ lub $a = 4$" },
        correct: "A",
        explanation: "Odległość środków $|a| = 3 + 1 = 4$.",
        trap: "$|a| = 2$ to styczność wewnętrzna ($|r_1 - r_2|$).",
      },
      {
        id: "rz-ga-z2",
        prompt: "Odległość między prostymi równoległymi $3x - 4y + 2 = 0$ i $3x - 4y - 8 = 0$ jest równa:",
        options: { A: "$2$", B: "$\\frac{6}{5}$", C: "$10$", D: "$6$" },
        correct: "A",
        explanation: "Punkt $(2, 2)$ leży na pierwszej prostej; jego odległość od drugiej: $\\frac{|6 - 8 - 8|}{5} = 2$.",
      },
    ],
  },
};

export default content;
