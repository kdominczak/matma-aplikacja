import type { TopicContent } from "@/types/topic";

// Rozszerzenie – planimetria: twierdzenie sinusów, czworokąty wpisane i opisane, dowody (dział VIII, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Twierdzenie sinusów",
      body:
        "W każdym trójkącie stosunek boku do sinusa kąta naprzeciw niego jest stały i równy średnicy okręgu opisanego:\n\n" +
        "$\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma} = 2R$.\n\n" +
        "Używasz go, gdy znasz bok i kąt naprzeciw niego (albo dwa kąty) – a twierdzenie cosinusów, gdy znasz dwa boki i kąt między nimi.",
      example: {
        prompt: "W trójkącie bok $a = 6$ leży naprzeciw kąta $30°$. Oblicz promień okręgu opisanego.",
        solution: "$2R = \\frac{6}{\\sin 30°} = \\frac{6}{\\frac{1}{2}} = 12$.\n$R = 6$.",
      },
      check: {
        id: "rz-pl-t1",
        prompt: "W trójkącie kąt $60°$ leży naprzeciw boku długości $6\\sqrt{3}$. Promień okręgu opisanego na tym trójkącie jest równy:",
        options: { A: "$6$", B: "$12$", C: "$3\\sqrt{3}$", D: "$6\\sqrt{3}$" },
        correct: "A",
        explanation: "$2R = \\frac{6\\sqrt{3}}{\\frac{\\sqrt{3}}{2}} = 12$, więc $R = 6$.",
        trap: "$12$ to średnica – wzór daje $2R$, nie $R$.",
      },
    },
    {
      title: "Czworokąty wpisane i opisane",
      body:
        "Dwa warunki, które rozwiązują większość zadań:\n\n" +
        "• w czworokąt można wpisać okrąg $\\iff$ sumy przeciwległych boków są równe: $a + c = b + d$,\n\n" +
        "• na czworokącie można opisać okrąg $\\iff$ sumy przeciwległych kątów są równe $180°$.\n\n" +
        "Przydatne: w trapezie z wpisanym okręgiem wysokość to średnica okręgu, czyli $h = 2r$.",
      example: {
        prompt: "W trapez równoramienny o podstawach $8$ i $2$ wpisano okrąg. Oblicz długość ramienia i promień okręgu.",
        solution:
          "$8 + 2 = 2c$, więc ramię $c = 5$.\n" +
          "Rzut ramienia na podstawę: $\\frac{8 - 2}{2} = 3$, wysokość $h = \\sqrt{25 - 9} = 4$.\n" +
          "$r = \\frac{h}{2} = 2$.",
      },
      check: {
        id: "rz-pl-t2",
        prompt: "Czworokąt $ABCD$ jest wpisany w okrąg i $|\\angle A| = 70°$. Kąt $C$ ma miarę:",
        options: { A: "$110°$", B: "$70°$", C: "$140°$", D: "$90°$" },
        correct: "A",
        explanation: "W czworokącie wpisanym kąty przeciwległe sumują się do $180°$: $180° - 70° = 110°$.",
      },
    },
    {
      title: "Dowody geometryczne – jak je pisać",
      body:
        "Dowód to łańcuch zdań, z których każde wynika z poprzednich albo z twierdzenia, które nazywasz. Zapisz założenia i tezę, " +
        "zrób rysunek z oznaczeniami, a potem przy każdym kroku podaj powód („bo trójkąt $AOC$ jest równoramienny”).\n\n" +
        "Najczęstsze narzędzia: kąty wpisane i środkowe (wpisany to połowa środkowego opartego na tym samym łuku), " +
        "trójkąty przystające i podobne, twierdzenie Pitagorasa.",
      example: {
        prompt: "Udowodnij, że kąt wpisany oparty na średnicy jest prosty.",
        solution:
          "Niech $AB$ będzie średnicą, $O$ – środkiem okręgu, $C$ – punktem na okręgu.\n" +
          "$|OA| = |OB| = |OC| = r$, więc trójkąty $AOC$ i $BOC$ są równoramienne: $|\\angle OAC| = |\\angle OCA| = \\alpha$, $|\\angle OBC| = |\\angle OCB| = \\beta$.\n" +
          "Suma kątów trójkąta $ABC$: $\\alpha + \\beta + (\\alpha + \\beta) = 180°$.\n" +
          "Stąd $|\\angle ACB| = \\alpha + \\beta = 90°$.",
      },
      check: {
        id: "rz-pl-t3",
        prompt: "Kąt środkowy oparty na pewnym łuku ma miarę $140°$. Kąt wpisany oparty na tym samym łuku ma miarę:",
        options: { A: "$70°$", B: "$140°$", C: "$280°$", D: "$40°$" },
        correct: "A",
        explanation: "Kąt wpisany jest połową kąta środkowego opartego na tym samym łuku.",
      },
    },
  ],
  formulas: [
    { label: "Twierdzenie sinusów", tex: "\\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma} = 2R" },
    { label: "Twierdzenie cosinusów", tex: "c^2 = a^2 + b^2 - 2ab\\cos\\gamma" },
    { label: "Czworokąt opisany na okręgu", tex: "a + c = b + d" },
    { label: "Czworokąt wpisany w okrąg", tex: "\\alpha + \\gamma = \\beta + \\delta = 180°" },
    { label: "Pole trójkąta z promieniem okręgu opisanego", tex: "P = \\frac{abc}{4R}" },
  ],
  traps: [
    "Twierdzenie sinusów daje średnicę $2R$, a nie promień.",
    "Wpisany = okrąg w środku figury (warunek na boki); opisany = okrąg przechodzi przez wierzchołki (warunek na kąty).",
    "W dowodzie każdy krok potrzebuje powodu – „widać z rysunku” to nie argument.",
    "W trapezie z wpisanym okręgiem $h = 2r$.",
  ],
  openTasks: [
    {
      id: "rz-pl-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "W trójkącie $ABC$ dane są: $|BC| = 6$, $|\\angle BAC| = 30°$ i $|\\angle ABC| = 45°$. Oblicz długość boku $AC$.",
      answers: ["6√2"],
      answerLabel: "|AC| =",
      hints: ["Bok $AC$ leży naprzeciw kąta $B$, a bok $BC$ – naprzeciw kąta $A$."],
      solution: [
        { step: "Twierdzenie sinusów: $\\frac{|AC|}{\\sin 45°} = \\frac{|BC|}{\\sin 30°}$.", points: 1 },
        { step: "$|AC| = \\frac{6 \\cdot \\frac{\\sqrt{2}}{2}}{\\frac{1}{2}}$.", points: 1 },
        { step: "$|AC| = 6\\sqrt{2}$.", points: 1 },
      ],
    },
    {
      id: "rz-pl-o2",
      difficulty: "zaawansowany",
      points: 4,
      prompt:
        "W trapez prostokątny wpisano okrąg o promieniu $3$. Dłuższa podstawa trapezu ma długość $12$. Oblicz długość krótszej podstawy.",
      answers: ["4"],
      answerLabel: "b =",
      hints: ["Ramię prostopadłe do podstaw to wysokość, czyli $2r$.", "Warunek na czworokąt opisany i Pitagoras dla drugiego ramienia."],
      solution: [
        { step: "Wysokość (ramię prostopadłe): $h = 2r = 6$.", points: 1 },
        { step: "Okrąg wpisany: $12 + b = 6 + c$, więc $c = b + 6$.", points: 1 },
        { step: "Pitagoras: $c^2 = 6^2 + (12 - b)^2$, czyli $(b + 6)^2 = 36 + (12 - b)^2$.", points: 1 },
        { step: "$36 + 12b + b^2 = 180 - 24b + b^2$, $36b = 144$, $b = 4$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-pl-p1",
        prompt: "W czworokąt o kolejnych bokach $a$, $b$, $c$, $d$ można wpisać okrąg wtedy i tylko wtedy, gdy:",
        options: { A: "$a + c = b + d$", B: "$a + b = c + d$", C: "$a = c$ i $b = d$", D: "$ac = bd$" },
        correct: "A",
        explanation: "Sumy długości przeciwległych boków muszą być równe.",
      },
      {
        id: "rz-pl-p2",
        prompt: "W trójkącie bok długości $10$ leży naprzeciw kąta $30°$. Średnica okręgu opisanego na tym trójkącie jest równa:",
        options: { A: "$20$", B: "$10$", C: "$5$", D: "$10\\sqrt{3}$" },
        correct: "A",
        explanation: "$2R = \\frac{10}{\\sin 30°} = 20$.",
      },
    ],
    sredni: [
      {
        id: "rz-pl-s1",
        prompt: "W trójkącie $ABC$: $|BC| = 8$, $|\\angle A| = 45°$, $|\\angle B| = 30°$. Długość boku $AC$ jest równa:",
        options: { A: "$4\\sqrt{2}$", B: "$8\\sqrt{2}$", C: "$4$", D: "$2\\sqrt{2}$" },
        correct: "A",
        explanation: "$|AC| = \\frac{8 \\sin 30°}{\\sin 45°} = \\frac{4}{\\frac{\\sqrt{2}}{2}} = 4\\sqrt{2}$.",
      },
      {
        id: "rz-pl-s2",
        prompt: "Czworokąt $ABCD$ jest wpisany w okrąg i $|\\angle ABC| = 2|\\angle ADC|$. Kąt $ABC$ ma miarę:",
        options: { A: "$120°$", B: "$60°$", C: "$90°$", D: "$135°$" },
        correct: "A",
        explanation: "$|\\angle B| + |\\angle D| = 180°$ i $|\\angle B| = 2|\\angle D|$, więc $|\\angle D| = 60°$, $|\\angle B| = 120°$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-pl-z1",
        prompt: "W trapez równoramienny o podstawach $8$ i $2$ wpisano okrąg. Ramię trapezu ma długość:",
        options: { A: "$5$", B: "$10$", C: "$4$", D: "$3$" },
        correct: "A",
        explanation: "$8 + 2 = 2c$, więc $c = 5$.",
      },
      {
        id: "rz-pl-z2",
        prompt: "W trapez równoramienny o podstawach $8$ i $2$ wpisano okrąg. Promień tego okręgu jest równy:",
        options: { A: "$2$", B: "$4$", C: "$\\frac{5}{2}$", D: "$3$" },
        correct: "A",
        explanation: "Ramię $5$, rzut ramienia $3$, wysokość $\\sqrt{25 - 9} = 4$, a $r = \\frac{h}{2} = 2$.",
        trap: "$4$ to wysokość – w trapezie z wpisanym okręgiem wysokość to średnica, nie promień.",
      },
    ],
  },
};

export default content;
