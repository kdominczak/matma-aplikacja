import type { TopicContent } from "@/types/topic";

// Lekcje 31–34 – trójkąty, czworokąty, podobieństwo i Tales (dział VIII podstawy). Zadania tk-p1…tk-z2
// i tk-o1/tk-o2 przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Twierdzenie Pitagorasa",
      body:
        "W trójkącie prostokątnym suma kwadratów przyprostokątnych jest równa kwadratowi przeciwprostokątnej: $a^2 + b^2 = c^2$. " +
        "Przeciwprostokątna $c$ leży naprzeciw kąta prostego i jest najdłuższym bokiem.\n\n" +
        "Warto znać „trójki pitagorejskie”: $3, 4, 5$, $6, 8, 10$, $5, 12, 13$ – często pojawiają się w zadaniach. " +
        "Działa też w drugą stronę: jeśli $a^2 + b^2 = c^2$, to trójkąt jest prostokątny.\n\n" +
        "Na rysunku przyprostokątne mają $3$ i $4$ kratki, więc przeciwprostokątna: $\\sqrt{9 + 16} = 5$.",
      example: {
        prompt: "Przeciwprostokątna trójkąta prostokątnego ma długość $13$, a jedna z przyprostokątnych $5$. Oblicz drugą.",
        solution: "$b^2 = 13^2 - 5^2 = 169 - 25 = 144$, więc $b = 12$.",
      },
      plot: {
        x: [-1, 5],
        y: [-1, 4],
        lines: [
          [
            [0, 0],
            [4, 0],
            [0, 3],
            [0, 0],
          ],
        ],
        dots: [{ at: [0, 0] }, { at: [4, 0] }, { at: [0, 3] }],
      },
    },
    {
      title: "Trójkąty, które trzeba znać",
      body:
        "• Równoboczny o boku $a$: wysokość $h = \\frac{a\\sqrt{3}}{2}$, pole $P = \\frac{a^2\\sqrt{3}}{4}$.\n\n" +
        "• Połówka kwadratu (kąty $45^\\circ, 45^\\circ, 90^\\circ$): przyprostokątne $a$, przeciwprostokątna $a\\sqrt{2}$ – " +
        "stąd przekątna kwadratu $d = a\\sqrt{2}$.\n\n" +
        "• Połówka trójkąta równobocznego (kąty $30^\\circ, 60^\\circ, 90^\\circ$): boki $a$, $a\\sqrt{3}$, $2a$. " +
        "Najkrótszy bok leży naprzeciw kąta $30^\\circ$ i jest połową przeciwprostokątnej.",
      example: {
        prompt: "W trójkącie prostokątnym o kątach $30^\\circ$ i $60^\\circ$ przeciwprostokątna ma długość $10$. Oblicz przyprostokątne.",
        solution: "Naprzeciw kąta $30^\\circ$: $\\frac{10}{2} = 5$.\nDruga przyprostokątna: $5\\sqrt{3}$.",
      },
    },
    {
      title: "Pola trójkątów i czworokątów",
      body:
        "• trójkąt: $P = \\frac{1}{2}ah$ (wysokość opuszczona na bok $a$),\n\n" +
        "• równoległobok: $P = ah$,\n\n" +
        "• romb: $P = \\frac{d_1 d_2}{2}$ – przekątne dzielą się na połowy pod kątem prostym,\n\n" +
        "• trapez: $P = \\frac{(a + b)h}{2}$ – średnia podstaw razy wysokość.\n\n" +
        "W trapezie równoramiennym i rombie brakującą wysokość albo bok zwykle liczysz z Pitagorasa w trójkącie, " +
        "który „odetniesz” wysokością lub przekątnymi.",
      example: {
        prompt: "Przekątne rombu mają długości $10$ i $24$. Oblicz pole i obwód rombu.",
        solution:
          "Pole: $P = \\frac{10 \\cdot 24}{2} = 120$.\n" +
          "Bok z połówek przekątnych: $\\sqrt{5^2 + 12^2} = 13$, więc obwód $4 \\cdot 13 = 52$.",
      },
    },
    {
      title: "Podobieństwo trójkątów",
      body:
        "Trójkąty są podobne, gdy mają takie same kąty (wystarczą dwa), albo gdy ich boki są proporcjonalne. " +
        "Skala podobieństwa $k$ to stosunek odpowiadających sobie boków.\n\n" +
        "Odcinki (boki, wysokości, obwody) zmieniają się $k$ razy, a pola – $k^2$ razy.",
      example: {
        prompt: "Obwody dwóch trójkątów podobnych są równe $12$ i $18$. Pole mniejszego jest równe $8$. Oblicz pole większego.",
        solution: "Skala: $k = \\frac{18}{12} = \\frac{3}{2}$.\nPole: $8 \\cdot k^2 = 8 \\cdot \\frac{9}{4} = 18$.",
      },
    },
    {
      title: "Twierdzenie Talesa",
      body:
        "Gdy ramiona kąta o wierzchołku $O$ przetniemy dwiema prostymi równoległymi ($A$, $C$ na jednym ramieniu, " +
        "$B$, $D$ na drugim), odcinki na ramionach są proporcjonalne: $\\frac{|OA|}{|AC|} = \\frac{|OB|}{|BD|}$.\n\n" +
        "Odcinki równoległe porównujesz z całymi odcinkami od wierzchołka: $\\frac{|AB|}{|CD|} = \\frac{|OA|}{|OC|}$ – " +
        "to po prostu podobieństwo trójkątów $OAB$ i $OCD$.",
      example: {
        prompt: "W układzie z twierdzenia Talesa $|OA| = 3$, $|AC| = 6$ i $|AB| = 4$. Oblicz $|CD|$.",
        solution: "$|OC| = 3 + 6 = 9$.\n$\\frac{|AB|}{|CD|} = \\frac{|OA|}{|OC|} = \\frac{3}{9}$, więc $|CD| = 12$.",
      },
    },
  ],
  formulas: [
    { label: "Twierdzenie Pitagorasa", tex: "a^2 + b^2 = c^2" },
    { label: "Pole trójkąta", tex: "P = \\frac{1}{2}ah" },
    { label: "Trójkąt równoboczny", tex: "h = \\frac{a\\sqrt{3}}{2}, \\quad P = \\frac{a^2\\sqrt{3}}{4}" },
    { label: "Przekątna kwadratu", tex: "d = a\\sqrt{2}" },
    { label: "Pole równoległoboku", tex: "P = ah" },
    { label: "Pole rombu", tex: "P = \\frac{d_1 d_2}{2}" },
    { label: "Pole trapezu", tex: "P = \\frac{(a + b)h}{2}" },
    { label: "Pola figur podobnych w skali k", tex: "\\frac{P_2}{P_1} = k^2" },
    { label: "Twierdzenie Talesa", tex: "\\frac{|OA|}{|AC|} = \\frac{|OB|}{|BD|}" },
  ],
  traps: [
    "Przeciwprostokątna leży naprzeciw kąta prostego – to ona jest „$c$” w Pitagorasie, nie dowolny bok.",
    "Przy podobieństwie pola zmieniają się z kwadratem skali: skala $3$ – pole $9$ razy większe.",
    "W Talesie odcinki równoległe porównuj z całymi odcinkami od wierzchołka ($|OA|$ i $|OC|$), a nie z kawałkiem $|AC|$.",
    "W trójkącie $30^\\circ$–$60^\\circ$–$90^\\circ$ najkrótszy bok leży naprzeciw kąta $30^\\circ$.",
  ],
  openTasks: [
    {
      id: "tk-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Oblicz pole trójkąta równobocznego o boku $6$.",
      answers: ["9√3"],
      answerLabel: "P =",
      hints: ["$P = \\frac{a^2\\sqrt{3}}{4}$. Pierwiastek wpiszesz jako √ albo sqrt()."],
      solution: [
        { step: "Wzór: $P = \\frac{6^2\\sqrt{3}}{4}$.", points: 1 },
        { step: "Wynik: $P = \\frac{36\\sqrt{3}}{4} = 9\\sqrt{3}$.", points: 1 },
      ],
    },
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
    {
      id: "tk-o4",
      difficulty: "sredni",
      points: 2,
      prompt: "Przeciwprostokątna trójkąta prostokątnego ma długość $13$, a jedna z przyprostokątnych $5$. Oblicz pole tego trójkąta.",
      answers: ["30"],
      answerLabel: "P =",
      hints: ["Najpierw z Pitagorasa policz drugą przyprostokątną."],
      solution: [
        { step: "Druga przyprostokątna: $\\sqrt{169 - 25} = 12$.", points: 1 },
        { step: "Pole: $\\frac{1}{2} \\cdot 5 \\cdot 12 = 30$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "tk-p1",
        prompt: "Przyprostokątne trójkąta prostokątnego mają długości $6$ i $8$. Przeciwprostokątna ma długość:",
        options: { A: "$10$", B: "$14$", C: "$12$", D: "$2\\sqrt{7}$" },
        correct: "A",
        hints: ["Twierdzenie Pitagorasa: $a^2 + b^2 = c^2$."],
        explanation: "$\\sqrt{36 + 64} = \\sqrt{100} = 10$.",
      },
      {
        id: "tk-p2",
        prompt: "Pole trapezu o podstawach $7$ i $3$ oraz wysokości $4$ jest równe:",
        options: { A: "$20$", B: "$40$", C: "$84$", D: "$10$" },
        correct: "A",
        hints: ["Średnia podstaw razy wysokość."],
        explanation: "$\\frac{(7 + 3) \\cdot 4}{2} = 20$.",
      },
      {
        id: "tk-p3",
        prompt: "Przekątna kwadratu o boku $4$ ma długość:",
        options: { A: "$4\\sqrt{2}$", B: "$8$", C: "$2\\sqrt{2}$", D: "$16$" },
        correct: "A",
        hints: ["Przekątna dzieli kwadrat na dwa trójkąty prostokątne.", "$d^2 = 4^2 + 4^2 = 32$."],
        explanation: "$d = a\\sqrt{2} = 4\\sqrt{2}$, bo $d^2 = 16 + 16 = 32$.",
        trap: "Przekątna nie jest sumą boków – $8$ to $4 + 4$, a w Pitagorasie dodajemy kwadraty.",
      },
    ],
    sredni: [
      {
        id: "tk-s1",
        prompt: "Wysokość trójkąta równobocznego o boku $6$ jest równa:",
        options: { A: "$3\\sqrt{3}$", B: "$6\\sqrt{3}$", C: "$3$", D: "$9$" },
        correct: "A",
        explanation: "$h = \\frac{6\\sqrt{3}}{2} = 3\\sqrt{3}$.",
      },
      {
        id: "tk-s2",
        prompt: "Trójkąt $DEF$ jest podobny do trójkąta $ABC$ w skali $k = 3$. Pole trójkąta $ABC$ jest równe $4$. Pole trójkąta $DEF$ jest równe:",
        options: { A: "$36$", B: "$12$", C: "$7$", D: "$81$" },
        correct: "A",
        explanation: "Pola figur podobnych mają się jak $k^2$: $4 \\cdot 9 = 36$.",
      },
      {
        id: "tk-s3",
        prompt:
          "W trójkącie prostokątnym jeden z kątów ostrych ma miarę $30^\\circ$, a przeciwprostokątna ma długość $12$. Przyprostokątna leżąca naprzeciw kąta $30^\\circ$ ma długość:",
        options: { A: "$6$", B: "$6\\sqrt{3}$", C: "$12\\sqrt{3}$", D: "$4$" },
        correct: "A",
        explanation: "Naprzeciw kąta $30^\\circ$ leży bok równy połowie przeciwprostokątnej: $\\frac{12}{2} = 6$.",
        trap: "$6\\sqrt{3}$ to druga przyprostokątna – ta naprzeciw kąta $60^\\circ$.",
      },
    ],
    zaawansowany: [
      {
        id: "tk-z1",
        prompt: "Ramiona kąta o wierzchołku $O$ przecięto prostymi równoległymi $AB$ i $CD$ ($A$ i $C$ na jednym ramieniu, $B$ i $D$ na drugim, $A$ między $O$ i $C$). Wiadomo, że $|OA| = 4$, $|AC| = 6$, $|OB| = 6$. Długość $|BD|$ jest równa:",
        options: { A: "$9$", B: "$4$", C: "$8$", D: "$12$" },
        correct: "A",
        explanation: "Twierdzenie Talesa: $\\frac{|OA|}{|AC|} = \\frac{|OB|}{|BD|}$, czyli $\\frac{4}{6} = \\frac{6}{|BD|}$ i $|BD| = 9$.",
      },
      {
        id: "tk-z2",
        prompt: "Romb ma przekątne długości $6$ i $8$. Bok tego rombu ma długość:",
        options: { A: "$5$", B: "$7$", C: "$10$", D: "$14$" },
        correct: "A",
        explanation: "Przekątne rombu dzielą się na połowy pod kątem prostym: $\\sqrt{3^2 + 4^2} = 5$.",
      },
      {
        id: "tk-z3",
        prompt: "Romb ma bok długości $10$, a jedna z jego przekątnych ma długość $12$. Pole tego rombu jest równe:",
        options: { A: "$96$", B: "$120$", C: "$192$", D: "$60$" },
        correct: "A",
        explanation:
          "Połowa znanej przekątnej to $6$, połowa drugiej: $\\sqrt{10^2 - 6^2} = 8$, więc druga przekątna ma $16$. " +
          "$P = \\frac{12 \\cdot 16}{2} = 96$.",
        trap: "Pole rombu to połowa iloczynu przekątnych – bez dzielenia przez $2$ wychodzi $192$.",
      },
    ],
  },
};

export default content;
