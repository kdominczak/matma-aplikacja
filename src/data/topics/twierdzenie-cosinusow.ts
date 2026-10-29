import type { TopicContent } from "@/types/topic";

// Lekcja 29 – twierdzenie cosinusów i wzór na pole trójkąta (dział VII podstawy). Zadania tc-p1…tc-z2
// i tc-o1/tc-o2 przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Pole trójkąta z dwóch boków i kąta",
      body:
        "Gdy znasz dwa boki i kąt MIĘDZY nimi, pole policzysz bez wysokości: $P = \\frac{1}{2}ab\\sin\\gamma$.\n\n" +
        "Dla kąta prostego $\\sin 90^\\circ = 1$ i wzór zamienia się w znane $\\frac{1}{2}ab$. " +
        "Działa też dla kątów rozwartych – pamiętaj, że $\\sin(180^\\circ - \\gamma) = \\sin\\gamma$.",
      example: {
        prompt: "Dwa boki trójkąta mają długości $8$ i $5$, a kąt między nimi $150^\\circ$. Oblicz pole trójkąta.",
        solution: "$\\sin 150^\\circ = \\sin 30^\\circ = \\frac{1}{2}$.\n$P = \\frac{1}{2} \\cdot 8 \\cdot 5 \\cdot \\frac{1}{2} = 10$.",
      },
    },
    {
      title: "Twierdzenie cosinusów",
      body:
        "W każdym trójkącie: $c^2 = a^2 + b^2 - 2ab\\cos\\gamma$, gdzie $\\gamma$ to kąt między bokami $a$ i $b$ – leżący naprzeciw boku $c$.\n\n" +
        "To „Pitagoras z poprawką”: dla $\\gamma = 90^\\circ$ cosinus jest zerem i zostaje $c^2 = a^2 + b^2$. " +
        "Używasz go, gdy znasz dwa boki i kąt między nimi, a szukasz trzeciego boku.",
      example: {
        prompt: "Dwa boki trójkąta mają długości $4$ i $6$, a kąt między nimi $60^\\circ$. Oblicz trzeci bok.",
        solution: "$c^2 = 16 + 36 - 2 \\cdot 4 \\cdot 6 \\cdot \\frac{1}{2} = 28$.\n$c = \\sqrt{28} = 2\\sqrt{7}$.",
      },
    },
    {
      title: "Kąt z trzech boków",
      body:
        "Twierdzenie cosinusów działa też w drugą stronę – z trzech boków wyznaczysz kąt: " +
        "$\\cos\\gamma = \\frac{a^2 + b^2 - c^2}{2ab}$.\n\n" +
        "Ujemny cosinus oznacza kąt rozwarty, np. $\\cos\\gamma = -\\frac{1}{2}$ to $\\gamma = 120^\\circ$.",
      example: {
        prompt: "Trójkąt ma boki $3$, $5$ i $7$. Oblicz miarę największego kąta.",
        solution:
          "Największy kąt leży naprzeciw najdłuższego boku ($7$).\n" +
          "$\\cos\\gamma = \\frac{9 + 25 - 49}{2 \\cdot 3 \\cdot 5} = \\frac{-15}{30} = -\\frac{1}{2}$, więc $\\gamma = 120^\\circ$.",
      },
    },
    {
      title: "Ostrokątny, prostokątny czy rozwartokątny?",
      body:
        "Porównaj kwadrat najdłuższego boku $c$ z sumą kwadratów dwóch pozostałych:\n\n" +
        "• $c^2 < a^2 + b^2$ – trójkąt ostrokątny,\n\n" +
        "• $c^2 = a^2 + b^2$ – prostokątny,\n\n" +
        "• $c^2 > a^2 + b^2$ – rozwartokątny.\n\n" +
        "Wynika to wprost z twierdzenia cosinusów: znak różnicy to znak $\\cos\\gamma$.",
      example: {
        prompt: "Jaki jest trójkąt o bokach $4$, $5$ i $7$?",
        solution: "$7^2 = 49$, a $4^2 + 5^2 = 41$.\n$49 > 41$ – trójkąt jest rozwartokątny.",
      },
    },
    {
      title: "Kąt z pola – dwie odpowiedzi",
      body:
        "Gdy znasz pole i dwa boki, z wzoru $P = \\frac{1}{2}ab\\sin\\gamma$ wyznaczysz $\\sin\\gamma$. " +
        "Ale sinus ma tę samą wartość dla $\\gamma$ i $180^\\circ - \\gamma$ – kąt może być ostry albo rozwarty. " +
        "Jeśli zadanie mówi „kąt ostry”, bierzesz mniejszy.",
      example: {
        prompt: "Boki trójkąta mają długości $4$ i $6$, a pole jest równe $6$. Jaki może być kąt między nimi?",
        solution: "$6 = \\frac{1}{2} \\cdot 4 \\cdot 6 \\cdot \\sin\\gamma \\Rightarrow \\sin\\gamma = \\frac{1}{2}$.\n$\\gamma = 30^\\circ$ albo $\\gamma = 150^\\circ$.",
      },
    },
  ],
  formulas: [
    { label: "Twierdzenie cosinusów", tex: "c^2 = a^2 + b^2 - 2ab\\cos\\gamma" },
    { label: "Cosinus kąta z trzech boków", tex: "\\cos\\gamma = \\frac{a^2 + b^2 - c^2}{2ab}" },
    { label: "Pole trójkąta (dwa boki i kąt)", tex: "P = \\frac{1}{2}ab\\sin\\gamma" },
    { label: "Kąty rozwarte", tex: "\\cos 120^\\circ = -\\frac{1}{2}, \\quad \\sin 120^\\circ = \\frac{\\sqrt{3}}{2}" },
    { label: "Kąt rozwarty – sinus i cosinus", tex: "\\sin(180^\\circ - \\gamma) = \\sin\\gamma, \\quad \\cos(180^\\circ - \\gamma) = -\\cos\\gamma" },
  ],
  traps: [
    "Kąt $\\gamma$ w twierdzeniu cosinusów leży NAPRZECIW boku $c$ – między bokami $a$ i $b$.",
    "Dla kąta rozwartego $\\cos\\gamma < 0$, więc $-2ab\\cos\\gamma$ jest dodatnie – trzeci bok wychodzi dłuższy.",
    "W polu $\\frac{1}{2}ab\\sin\\gamma$ kąt musi leżeć między bokami $a$ i $b$, a nie naprzeciw któregoś z nich.",
    "Z $\\sin\\gamma$ wychodzą dwa kąty: $\\gamma$ i $180^\\circ - \\gamma$.",
  ],
  openTasks: [
    {
      id: "tc-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Oblicz pole trójkąta, w którym dwa boki mają długości $10$ i $6$, a kąt między nimi ma miarę $30^\\circ$.",
      answers: ["15"],
      answerLabel: "P =",
      hints: ["$P = \\frac{1}{2}ab\\sin\\gamma$, a $\\sin 30^\\circ = \\frac{1}{2}$."],
      solution: [
        { step: "Wzór: $P = \\frac{1}{2} \\cdot 10 \\cdot 6 \\cdot \\sin 30^\\circ$.", points: 1 },
        { step: "Wynik: $P = 30 \\cdot \\frac{1}{2} = 15$.", points: 1 },
      ],
    },
    {
      id: "tc-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W trójkącie $ABC$: $|AC| = 8$, $|BC| = 5$, $|\\angle ACB| = 60^\\circ$. Oblicz długość boku $AB$.",
      answers: ["7"],
      hints: ["Kąt $C$ leży między bokami $AC$ i $BC$ – to dokładnie sytuacja z twierdzenia cosinusów."],
      solution: [
        { step: "Twierdzenie cosinusów: $|AB|^2 = 64 + 25 - 2 \\cdot 8 \\cdot 5 \\cdot \\frac{1}{2} = 49$.", points: 1 },
        { step: "Wynik: $|AB| = 7$.", points: 1 },
      ],
    },
    {
      id: "tc-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Trójkąt ma boki długości $7$, $8$ i $13$. Oblicz miarę (w stopniach) kąta leżącego naprzeciw najdłuższego boku.",
      answers: ["120"],
      hints: ["Kąt naprzeciw najdłuższego boku jest największy – może być rozwarty."],
      solution: [
        { step: "Twierdzenie cosinusów: $169 = 49 + 64 - 2 \\cdot 7 \\cdot 8 \\cos\\gamma$.", points: 1 },
        { step: "Obliczenie: $\\cos\\gamma = -\\frac{1}{2}$.", points: 1 },
        { step: "Kąt: $\\gamma = 120^\\circ$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "tc-p1",
        prompt: "Pole trójkąta o bokach $6$ i $4$ oraz kącie między nimi $30^\\circ$ jest równe:",
        options: { A: "$6$", B: "$12$", C: "$24$", D: "$3$" },
        correct: "A",
        hints: ["Użyj wzoru $P = \\frac{1}{2}ab\\sin\\gamma$."],
        explanation: "$P = \\frac{1}{2} \\cdot 6 \\cdot 4 \\cdot \\frac{1}{2} = 6$.",
      },
      {
        id: "tc-p2",
        prompt: "Dwa boki trójkąta mają długości $3$ i $5$, a kąt między nimi ma $60^\\circ$. Kwadrat długości trzeciego boku jest równy:",
        options: { A: "$19$", B: "$34$", C: "$49$", D: "$4$" },
        correct: "A",
        hints: ["Twierdzenie cosinusów, $\\cos 60^\\circ = \\frac{1}{2}$."],
        explanation: "$9 + 25 - 2 \\cdot 15 \\cdot \\frac{1}{2} = 19$.",
      },
      {
        id: "tc-p3",
        prompt: "Pole trójkąta o bokach $8$ i $5$ oraz kącie między nimi $45^\\circ$ jest równe:",
        options: { A: "$10\\sqrt{2}$", B: "$20\\sqrt{2}$", C: "$20$", D: "$10$" },
        correct: "A",
        hints: ["$P = \\frac{1}{2}ab\\sin\\gamma$.", "$\\sin 45^\\circ = \\frac{\\sqrt{2}}{2}$."],
        explanation: "$P = \\frac{1}{2} \\cdot 8 \\cdot 5 \\cdot \\frac{\\sqrt{2}}{2} = 10\\sqrt{2}$.",
        trap: "$20\\sqrt{2}$ wychodzi bez $\\frac{1}{2}$ na początku wzoru.",
      },
    ],
    sredni: [
      {
        id: "tc-s1",
        prompt: "Dwa boki trójkąta mają długości $3$ i $5$, a kąt między nimi ma $120^\\circ$. Trzeci bok ma długość:",
        options: { A: "$7$", B: "$\\sqrt{19}$", C: "$\\sqrt{34}$", D: "$8$" },
        correct: "A",
        explanation: "$c^2 = 9 + 25 - 30 \\cdot \\left(-\\frac{1}{2}\\right) = 49$, więc $c = 7$.",
      },
      {
        id: "tc-s2",
        prompt: "Pole trójkąta równobocznego o boku $4$ jest równe:",
        options: { A: "$4\\sqrt{3}$", B: "$8\\sqrt{3}$", C: "$16$", D: "$2\\sqrt{3}$" },
        correct: "A",
        explanation: "$\\frac{1}{2} \\cdot 4 \\cdot 4 \\cdot \\sin 60^\\circ = 8 \\cdot \\frac{\\sqrt{3}}{2} = 4\\sqrt{3}$.",
      },
      {
        id: "tc-s3",
        prompt: "Trójkąt o bokach długości $4$, $5$ i $7$ jest:",
        options: { A: "rozwartokątny", B: "prostokątny", C: "ostrokątny", D: "równoramienny" },
        correct: "A",
        explanation: "$7^2 = 49 > 4^2 + 5^2 = 41$, więc kąt naprzeciw boku $7$ jest rozwarty.",
      },
    ],
    zaawansowany: [
      {
        id: "tc-z1",
        prompt: "Trójkąt ma boki długości $5$, $7$ i $8$. Cosinus kąta leżącego naprzeciw boku długości $7$ jest równy:",
        options: { A: "$\\frac{1}{2}$", B: "$-\\frac{1}{2}$", C: "$\\frac{\\sqrt{3}}{2}$", D: "$\\frac{1}{7}$" },
        correct: "A",
        explanation: "$49 = 25 + 64 - 80\\cos\\gamma$, więc $80\\cos\\gamma = 40$ i $\\cos\\gamma = \\frac{1}{2}$.",
      },
      {
        id: "tc-z2",
        prompt: "Pole trójkąta o bokach $6$ i $10$ jest równe $15\\sqrt{3}$. Kąt ostry między tymi bokami ma miarę:",
        options: { A: "$60^\\circ$", B: "$30^\\circ$", C: "$45^\\circ$", D: "$90^\\circ$" },
        correct: "A",
        explanation: "$\\frac{1}{2} \\cdot 60 \\cdot \\sin\\gamma = 15\\sqrt{3}$, więc $\\sin\\gamma = \\frac{\\sqrt{3}}{2}$ i $\\gamma = 60^\\circ$.",
      },
      {
        id: "tc-z3",
        prompt: "Dwa boki trójkąta mają długości $4$ i $6$, a jego pole jest równe $6$. Kąt między tymi bokami może mieć miarę:",
        options: {
          A: "$30^\\circ$ albo $150^\\circ$",
          B: "tylko $30^\\circ$",
          C: "tylko $60^\\circ$",
          D: "$60^\\circ$ albo $120^\\circ$",
        },
        correct: "A",
        explanation: "$6 = \\frac{1}{2} \\cdot 4 \\cdot 6 \\cdot \\sin\\gamma$, więc $\\sin\\gamma = \\frac{1}{2}$ – a to $30^\\circ$ lub $150^\\circ$.",
        trap: "Sinus kąta rozwartego jest dodatni – $\\sin 150^\\circ = \\sin 30^\\circ$, więc oba kąty pasują.",
      },
    ],
  },
};

export default content;
