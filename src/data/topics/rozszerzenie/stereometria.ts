import type { TopicContent } from "@/types/topic";

// Rozszerzenie – stereometria: kąty w bryłach, przekroje (dział X, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Kąt nachylenia – krawędź czy ściana?",
      body:
        "Kąt między prostą a płaszczyzną to kąt między tą prostą a jej rzutem na płaszczyznę. W ostrosłupie prawidłowym " +
        "spodek wysokości to środek podstawy, więc:\n\n" +
        "• kąt nachylenia KRAWĘDZI bocznej – w trójkącie: wysokość, krawędź boczna i odcinek od środka podstawy do WIERZCHOŁKA,\n\n" +
        "• kąt nachylenia ŚCIANY bocznej – w trójkącie: wysokość, wysokość ściany i odcinek od środka podstawy do środka KRAWĘDZI podstawy.\n\n" +
        "W kwadracie o boku $a$ te odcinki to $\\frac{a\\sqrt{2}}{2}$ i $\\frac{a}{2}$ – stąd różne kąty w tej samej bryle.",
      example: {
        prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $3$. Oblicz kąt nachylenia ściany bocznej do podstawy.",
        solution: "Odcinek od środka podstawy do środka krawędzi: $\\frac{6}{2} = 3$.\n$\\operatorname{tg}\\alpha = \\frac{3}{3} = 1$, więc $\\alpha = 45°$.",
      },
      check: {
        id: "rz-s-t1",
        prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $4$ i wysokość $2\\sqrt{2}$. Krawędź boczna jest nachylona do podstawy pod kątem:",
        options: { A: "$45°$", B: "$60°$", C: "$30°$", D: "ok. $55°$" },
        correct: "A",
        explanation: "Połowa przekątnej podstawy: $\\frac{4\\sqrt{2}}{2} = 2\\sqrt{2}$. $\\operatorname{tg}\\alpha = \\frac{2\\sqrt{2}}{2\\sqrt{2}} = 1$, więc $45°$.",
        trap: "Ok. $55°$ to kąt nachylenia ŚCIANY ($\\operatorname{tg}\\alpha = \\frac{2\\sqrt{2}}{2}$) – dla krawędzi bierzesz połowę przekątnej.",
      },
    },
    {
      title: "Przekroje brył",
      body:
        "Przekrój to wielokąt, w którym płaszczyzna przecina bryłę. Narysuj bryłę, zaznacz punkty, przez które przechodzi płaszczyzna, " +
        "i połącz te, które leżą na jednej ścianie. Boki przekroju liczysz zwykle z przekątnych ścian i twierdzenia Pitagorasa.\n\n" +
        "Klasyka: w sześcianie o krawędzi $a$ płaszczyzna przez przekątną podstawy i wierzchołek górnej podstawy daje trójkąt " +
        "równoboczny o boku $a\\sqrt{2}$ (każdy bok to przekątna ściany).",
      example: {
        prompt: "Oblicz pole tego przekroju sześcianu o krawędzi $a$.",
        solution: "Bok trójkąta: $a\\sqrt{2}$.\nPole trójkąta równobocznego: $\\frac{(a\\sqrt{2})^2\\sqrt{3}}{4} = \\frac{2a^2\\sqrt{3}}{4} = \\frac{a^2\\sqrt{3}}{2}$.",
      },
      check: {
        id: "rz-s-t2",
        prompt: "Przekrój sześcianu o krawędzi $2$ płaszczyzną zawierającą dwie przeciwległe krawędzie (nie leżące na jednej ścianie) jest prostokątem o polu:",
        options: { A: "$4\\sqrt{2}$", B: "$4$", C: "$8$", D: "$2\\sqrt{2}$" },
        correct: "A",
        explanation: "Boki prostokąta to krawędź $2$ i przekątna ściany $2\\sqrt{2}$, pole $4\\sqrt{2}$.",
      },
    },
    {
      title: "Objętość z kąta – plan działania",
      body:
        "Typowe zadanie: dana krawędź podstawy i kąt nachylenia, policz objętość. Plan:\n\n" +
        "1. Narysuj trójkąt prostokątny z kątem (wysokość + odcinek w podstawie).\n\n" +
        "2. Odcinek w podstawie policz z figury podstawy (dla trójkąta równobocznego: promień okręgu wpisanego $\\frac{a\\sqrt{3}}{6}$ albo opisanego $\\frac{a\\sqrt{3}}{3}$).\n\n" +
        "3. Wysokość z funkcji trygonometrycznej, na końcu $V = \\frac{1}{3}P_p H$.",
      example: {
        prompt: "Ostrosłup prawidłowy trójkątny ma krawędź podstawy $6$, a ściana boczna jest nachylona do podstawy pod kątem $60°$. Oblicz objętość.",
        solution:
          "Odcinek do środka krawędzi: $r = \\frac{6\\sqrt{3}}{6} = \\sqrt{3}$.\n" +
          "$H = r \\operatorname{tg} 60° = \\sqrt{3} \\cdot \\sqrt{3} = 3$.\n" +
          "$P_p = \\frac{36\\sqrt{3}}{4} = 9\\sqrt{3}$, $V = \\frac{1}{3} \\cdot 9\\sqrt{3} \\cdot 3 = 9\\sqrt{3}$.",
      },
      check: {
        id: "rz-s-t3",
        prompt: "Spodek wysokości ostrosłupa prawidłowego trójkątnego to:",
        options: {
          A: "środek okręgu wpisanego w podstawę (i opisanego na niej)",
          B: "środek jednej z krawędzi podstawy",
          C: "jeden z wierzchołków podstawy",
          D: "środek jednej z wysokości podstawy",
        },
        correct: "A",
        explanation: "W trójkącie równobocznym środki okręgów wpisanego i opisanego pokrywają się – tam pada wysokość ostrosłupa prawidłowego.",
      },
    },
  ],
  formulas: [
    { label: "Objętość ostrosłupa", tex: "V = \\frac{1}{3}P_p H" },
    { label: "Przekątna sześcianu", tex: "d = a\\sqrt{3}" },
    { label: "Przekątna kwadratu", tex: "d = a\\sqrt{2}" },
    { label: "Promienie w trójkącie równobocznym", tex: "r = \\frac{a\\sqrt{3}}{6}, \\quad R = \\frac{a\\sqrt{3}}{3}" },
    { label: "Pole trójkąta równobocznego", tex: "P = \\frac{a^2\\sqrt{3}}{4}" },
  ],
  traps: [
    "Kąt krawędzi bocznej i kąt ściany bocznej to różne kąty – inny odcinek w podstawie.",
    "W ostrosłupie prawidłowym trójkątnym do kąta ściany bierzesz $r$ (okrąg wpisany), do kąta krawędzi – $R$ (opisany).",
    "We wzorze na objętość ostrosłupa jest $\\frac{1}{3}$ – w graniastosłupie go nie ma.",
    "Przekrój rysuj na bryle – boki przekroju leżą na ścianach.",
  ],
  openTasks: [
    {
      id: "rz-s-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $8$, a krawędź boczna jest nachylona do podstawy pod kątem $60°$. Oblicz wysokość ostrosłupa.",
      answers: ["4√6"],
      answerLabel: "H =",
      hints: ["Krawędź boczna – odcinek w podstawie to połowa przekątnej."],
      solution: [
        { step: "Połowa przekątnej podstawy: $\\frac{8\\sqrt{2}}{2} = 4\\sqrt{2}$.", points: 1 },
        { step: "$\\operatorname{tg} 60° = \\frac{H}{4\\sqrt{2}}$.", points: 1 },
        { step: "$H = 4\\sqrt{2} \\cdot \\sqrt{3} = 4\\sqrt{6}$.", points: 1 },
      ],
    },
    {
      id: "rz-s-o2",
      difficulty: "zaawansowany",
      points: 4,
      prompt:
        "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$, a ściana boczna jest nachylona do podstawy pod kątem $60°$. Oblicz pole powierzchni bocznej tego ostrosłupa.",
      answers: ["72"],
      answerLabel: "P_b =",
      hints: ["Wysokość ściany bocznej policz z cosinusa kąta $60°$."],
      solution: [
        { step: "Odcinek od środka podstawy do środka krawędzi: $3$.", points: 1 },
        { step: "$\\cos 60° = \\frac{3}{h_s}$, więc wysokość ściany $h_s = 6$.", points: 1 },
        { step: "Pole ściany: $\\frac{1}{2} \\cdot 6 \\cdot 6 = 18$.", points: 1 },
        { step: "$P_b = 4 \\cdot 18 = 72$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-s-p1",
        prompt: "Przekątna sześcianu o krawędzi $3$ ma długość:",
        options: { A: "$3\\sqrt{3}$", B: "$3\\sqrt{2}$", C: "$9$", D: "$6$" },
        correct: "A",
        explanation: "$d = a\\sqrt{3} = 3\\sqrt{3}$.",
        trap: "$3\\sqrt{2}$ to przekątna ŚCIANY, a nie całej bryły.",
      },
      {
        id: "rz-s-p2",
        prompt: "Objętość ostrosłupa prawidłowego czworokątnego o krawędzi podstawy $6$ i wysokości $4$ jest równa:",
        options: { A: "$48$", B: "$144$", C: "$96$", D: "$24$" },
        correct: "A",
        explanation: "$V = \\frac{1}{3} \\cdot 36 \\cdot 4 = 48$.",
        trap: "$144$ to objętość graniastosłupa – w ostrosłupie jest jeszcze $\\frac{1}{3}$.",
      },
    ],
    sredni: [
      {
        id: "rz-s-s1",
        prompt:
          "W graniastosłupie prawidłowym czworokątnym krawędź podstawy ma długość $2$, a przekątna bryły jest nachylona do podstawy pod kątem $45°$. Wysokość graniastosłupa jest równa:",
        options: { A: "$2\\sqrt{2}$", B: "$2$", C: "$4$", D: "$\\sqrt{2}$" },
        correct: "A",
        explanation: "Kąt $45°$ – wysokość równa przekątnej podstawy: $2\\sqrt{2}$.",
      },
      {
        id: "rz-s-s2",
        prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $3\\sqrt{3}$. Ściana boczna jest nachylona do podstawy pod kątem:",
        options: { A: "$60°$", B: "$30°$", C: "$45°$", D: "ok. $51°$" },
        correct: "A",
        explanation: "$\\operatorname{tg}\\alpha = \\frac{3\\sqrt{3}}{3} = \\sqrt{3}$, więc $\\alpha = 60°$.",
        trap: "Ok. $51°$ to kąt KRAWĘDZI bocznej (odcinek $3\\sqrt{2}$ zamiast $3$).",
      },
    ],
    zaawansowany: [
      {
        id: "rz-s-z1",
        prompt:
          "Przekrój sześcianu o krawędzi $a$ płaszczyzną przechodzącą przez przekątną dolnej podstawy i wierzchołek górnej podstawy (nieleżący nad tą przekątną) ma pole:",
        options: { A: "$\\frac{a^2\\sqrt{3}}{2}$", B: "$a^2\\sqrt{2}$", C: "$\\frac{a^2\\sqrt{3}}{4}$", D: "$\\frac{a^2}{2}$" },
        correct: "A",
        explanation: "To trójkąt równoboczny o boku $a\\sqrt{2}$: $\\frac{2a^2\\sqrt{3}}{4} = \\frac{a^2\\sqrt{3}}{2}$.",
      },
      {
        id: "rz-s-z2",
        prompt:
          "Ostrosłup prawidłowy trójkątny ma krawędź podstawy $6$, a ściana boczna jest nachylona do podstawy pod kątem $60°$. Objętość ostrosłupa jest równa:",
        options: { A: "$9\\sqrt{3}$", B: "$27\\sqrt{3}$", C: "$3\\sqrt{3}$", D: "$18\\sqrt{3}$" },
        correct: "A",
        explanation: "$r = \\sqrt{3}$, $H = \\sqrt{3} \\cdot \\sqrt{3} = 3$, $P_p = 9\\sqrt{3}$, $V = \\frac{1}{3} \\cdot 9\\sqrt{3} \\cdot 3 = 9\\sqrt{3}$.",
      },
    ],
  },
};

export default content;
