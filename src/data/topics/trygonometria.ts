import type { TopicContent } from "@/types/topic";

// Lekcja 28 – podstawy trygonometrii (dział VII podstawy). Zadania tr-p1…tr-z2 i tr-o1/tr-o2 przeniesione
// bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Sinus, cosinus i tangens kąta ostrego",
      body:
        "W trójkącie prostokątnym, patrząc z kąta ostrego $\\alpha$:\n\n" +
        "• $\\sin\\alpha$ = przyprostokątna naprzeciw kąta : przeciwprostokątna,\n\n" +
        "• $\\cos\\alpha$ = przyprostokątna przy kącie : przeciwprostokątna,\n\n" +
        "• $\\operatorname{tg}\\alpha$ = przyprostokątna naprzeciw : przyprostokątna przy kącie.\n\n" +
        "Na rysunku kąt $\\alpha$ jest w początku układu: naprzeciw leży bok $3$, przy kącie – bok $4$, przeciwprostokątna to $5$. " +
        "Stąd $\\sin\\alpha = \\frac{3}{5}$, $\\cos\\alpha = \\frac{4}{5}$, $\\operatorname{tg}\\alpha = \\frac{3}{4}$.",
      plot: {
        x: [-1, 5],
        y: [-1, 4],
        lines: [
          [
            [0, 0],
            [4, 0],
            [4, 3],
            [0, 0],
          ],
        ],
        dots: [{ at: [0, 0] }],
      },
      example: {
        prompt: "Przyprostokątne trójkąta mają długości $5$ i $12$. Wyznacz funkcje trygonometryczne kąta leżącego naprzeciw boku $5$.",
        solution:
          "Przeciwprostokątna: $\\sqrt{25 + 144} = 13$.\n" +
          "$\\sin\\alpha = \\frac{5}{13}$, $\\cos\\alpha = \\frac{12}{13}$, $\\operatorname{tg}\\alpha = \\frac{5}{12}$.",
      },
    },
    {
      title: "Wartości dla 30°, 45° i 60°",
      body:
        "Te wartości są w karcie wzorów, ale warto je mieć w głowie:\n\n" +
        "• $\\sin 30^\\circ = \\cos 60^\\circ = \\frac{1}{2}$,\n\n" +
        "• $\\sin 45^\\circ = \\cos 45^\\circ = \\frac{\\sqrt{2}}{2}$, $\\operatorname{tg} 45^\\circ = 1$,\n\n" +
        "• $\\sin 60^\\circ = \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}$, $\\operatorname{tg} 60^\\circ = \\sqrt{3}$, $\\operatorname{tg} 30^\\circ = \\frac{\\sqrt{3}}{3}$.\n\n" +
        "Zauważ: sinus kąta to cosinus kąta dopełniającego do $90^\\circ$ – $\\sin\\alpha = \\cos(90^\\circ - \\alpha)$.",
      example: {
        prompt: "Oblicz $\\sin 60^\\circ \\cdot \\cos 30^\\circ + \\operatorname{tg} 45^\\circ$.",
        solution: "$\\frac{\\sqrt{3}}{2} \\cdot \\frac{\\sqrt{3}}{2} + 1 = \\frac{3}{4} + 1 = \\frac{7}{4}$.",
      },
    },
    {
      title: "Jedynka trygonometryczna",
      body:
        "Dla każdego kąta: $\\sin^2\\alpha + \\cos^2\\alpha = 1$ oraz $\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}$.\n\n" +
        "Znając jedną funkcję kąta ostrego, policzysz pozostałe. Dla kąta ostrego wszystkie są dodatnie, " +
        "więc z pierwiastka bierzesz wynik dodatni.",
      example: {
        prompt: "Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{8}{17}$. Oblicz $\\cos\\alpha$ i $\\operatorname{tg}\\alpha$.",
        solution:
          "$\\cos^2\\alpha = 1 - \\frac{64}{289} = \\frac{225}{289}$, więc $\\cos\\alpha = \\frac{15}{17}$.\n" +
          "$\\operatorname{tg}\\alpha = \\frac{8}{17} : \\frac{15}{17} = \\frac{8}{15}$.",
      },
    },
    {
      title: "Obliczanie boków z kąta",
      body:
        "Znasz kąt i jeden bok? Wybierz funkcję, która łączy bok znany z szukanym:\n\n" +
        "• przeciwprostokątna i bok naprzeciw kąta – sinus,\n\n" +
        "• przeciwprostokątna i bok przy kącie – cosinus,\n\n" +
        "• dwie przyprostokątne – tangens.",
      example: {
        prompt: "Przeciwprostokątna ma długość $8$, a jeden z kątów ostrych $60^\\circ$. Oblicz przyprostokątne.",
        solution:
          "Naprzeciw kąta: $8 \\cdot \\sin 60^\\circ = 8 \\cdot \\frac{\\sqrt{3}}{2} = 4\\sqrt{3}$.\n" +
          "Przy kącie: $8 \\cdot \\cos 60^\\circ = 8 \\cdot \\frac{1}{2} = 4$.",
      },
    },
    {
      title: "Kąty od 0° do 180°",
      body:
        "Na maturze pojawiają się też kąty rozwarte. Sprowadzasz je do kąta ostrego wzorami:\n\n" +
        "$\\sin(180^\\circ - \\alpha) = \\sin\\alpha$, $\\quad \\cos(180^\\circ - \\alpha) = -\\cos\\alpha$, $\\quad " +
        "\\operatorname{tg}(180^\\circ - \\alpha) = -\\operatorname{tg}\\alpha$.\n\n" +
        "Dla kąta rozwartego sinus jest dodatni, a cosinus i tangens – ujemne.",
      example: {
        prompt: "Oblicz $\\sin 150^\\circ$ i $\\cos 120^\\circ$.",
        solution:
          "$\\sin 150^\\circ = \\sin(180^\\circ - 30^\\circ) = \\sin 30^\\circ = \\frac{1}{2}$.\n" +
          "$\\cos 120^\\circ = \\cos(180^\\circ - 60^\\circ) = -\\cos 60^\\circ = -\\frac{1}{2}$.",
      },
    },
  ],
  formulas: [
    { label: "Funkcje kąta ostrego", tex: "\\sin\\alpha = \\frac{a}{c}, \\quad \\cos\\alpha = \\frac{b}{c}, \\quad \\operatorname{tg}\\alpha = \\frac{a}{b}" },
    { label: "Jedynka trygonometryczna", tex: "\\sin^2\\alpha + \\cos^2\\alpha = 1" },
    { label: "Tangens", tex: "\\operatorname{tg}\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}" },
    { label: "Wartości 30°, 45°, 60°", tex: "\\sin 30^\\circ = \\frac{1}{2}, \\ \\sin 45^\\circ = \\frac{\\sqrt{2}}{2}, \\ \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}" },
    { label: "Tangensy 30°, 45°, 60°", tex: "\\operatorname{tg} 30^\\circ = \\frac{\\sqrt{3}}{3}, \\ \\operatorname{tg} 45^\\circ = 1, \\ \\operatorname{tg} 60^\\circ = \\sqrt{3}" },
    { label: "Kąt dopełniający", tex: "\\sin(90^\\circ - \\alpha) = \\cos\\alpha" },
    { label: "Kąt rozwarty", tex: "\\sin(180^\\circ - \\alpha) = \\sin\\alpha, \\quad \\cos(180^\\circ - \\alpha) = -\\cos\\alpha" },
  ],
  traps: [
    "Sinus to bok NAPRZECIW kąta, cosinus – bok PRZY kącie. Zaznacz kąt na rysunku, zanim zaczniesz liczyć.",
    "Dla kąta ostrego z jedynki trygonometrycznej bierz dodatni pierwiastek.",
    "Kąt rozwarty: sinus dodatni, cosinus i tangens ujemne – $\\cos 120^\\circ = -\\frac{1}{2}$.",
    "$\\sin 30^\\circ = \\frac{1}{2}$, a $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$ – łatwo je zamienić.",
  ],
  openTasks: [
    {
      id: "tr-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Przeciwprostokątna trójkąta prostokątnego ma długość $8$, a jeden z kątów ostrych ma miarę $60^\\circ$. Oblicz długość przyprostokątnej leżącej przy tym kącie.",
      answers: ["4"],
      hints: ["Bok przy kącie i przeciwprostokątna – to cosinus."],
      solution: [
        { step: "Zapisanie: $\\cos 60^\\circ = \\frac{b}{8}$.", points: 1 },
        { step: "Obliczenie: $b = 8 \\cdot \\frac{1}{2} = 4$.", points: 1 },
      ],
    },
    {
      id: "tr-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W trójkącie prostokątnym przeciwprostokątna ma długość $10$, a jeden z kątów ostrych ma miarę $30^\\circ$. Oblicz długość przyprostokątnej leżącej naprzeciw tego kąta.",
      answers: ["5"],
      hints: ["Bok naprzeciw kąta i przeciwprostokątna – to sinus."],
      solution: [
        { step: "Zapisanie: $\\sin 30^\\circ = \\frac{a}{10}$.", points: 1 },
        { step: "Obliczenie: $a = 10 \\cdot \\frac{1}{2} = 5$.", points: 1 },
      ],
    },
    {
      id: "tr-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{3}{5}$. Oblicz wartość wyrażenia $\\cos\\alpha + \\operatorname{tg}\\alpha$.",
      answers: ["31/20"],
      hints: ["Zacznij od $\\cos\\alpha$ z jedynki trygonometrycznej."],
      solution: [
        { step: "Z jedynki trygonometrycznej: $\\cos\\alpha = \\frac{4}{5}$.", points: 1 },
        { step: "Tangens: $\\operatorname{tg}\\alpha = \\frac{3}{5} : \\frac{4}{5} = \\frac{3}{4}$.", points: 1 },
        { step: "Suma: $\\frac{4}{5} + \\frac{3}{4} = \\frac{31}{20}$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "tr-p1",
        prompt: "Wartość wyrażenia $\\sin 30^\\circ + \\cos 60^\\circ$ jest równa:",
        options: { A: "$1$", B: "$\\sqrt{3}$", C: "$\\frac{1}{2}$", D: "$\\frac{\\sqrt{3} + 1}{2}$" },
        correct: "A",
        hints: ["Obie wartości znajdziesz w tablicy wzorów."],
        explanation: "$\\frac{1}{2} + \\frac{1}{2} = 1$.",
      },
      {
        id: "tr-p2",
        prompt: "Przyprostokątne trójkąta prostokątnego mają długości $3$ i $4$. Sinus kąta leżącego naprzeciw boku długości $3$ jest równy:",
        options: { A: "$\\frac{3}{5}$", B: "$\\frac{4}{5}$", C: "$\\frac{3}{4}$", D: "$\\frac{4}{3}$" },
        correct: "A",
        hints: ["Najpierw policz przeciwprostokątną."],
        explanation: "Przeciwprostokątna: $5$. Sinus to przyprostokątna naprzeciw kąta przez przeciwprostokątną: $\\frac{3}{5}$.",
      },
      {
        id: "tr-p3",
        prompt: "Przyprostokątne trójkąta prostokątnego mają długości $5$ i $12$. Tangens kąta leżącego naprzeciw boku długości $5$ jest równy:",
        options: { A: "$\\frac{5}{12}$", B: "$\\frac{12}{5}$", C: "$\\frac{5}{13}$", D: "$\\frac{12}{13}$" },
        correct: "A",
        hints: ["Tangens to stosunek dwóch przyprostokątnych.", "Na górze bok naprzeciw kąta, na dole – bok przy kącie."],
        explanation: "$\\operatorname{tg}\\alpha = \\frac{5}{12}$ – bok naprzeciw kąta przez bok przy kącie.",
        trap: "$\\frac{5}{13}$ to sinus (przez przeciwprostokątną), a $\\frac{12}{5}$ – tangens drugiego kąta.",
      },
    ],
    sredni: [
      {
        id: "tr-s1",
        prompt: "Kąt $\\alpha$ jest ostry i $\\cos\\alpha = \\frac{12}{13}$. Wtedy $\\sin\\alpha$ jest równy:",
        options: { A: "$\\frac{5}{13}$", B: "$\\frac{12}{5}$", C: "$\\frac{1}{13}$", D: "$\\frac{5}{12}$" },
        correct: "A",
        explanation: "$\\sin\\alpha = \\sqrt{1 - \\frac{144}{169}} = \\frac{5}{13}$.",
      },
      {
        id: "tr-s2",
        prompt: "Wartość wyrażenia $\\operatorname{tg} 60^\\circ \\cdot \\cos 30^\\circ$ jest równa:",
        options: { A: "$\\frac{3}{2}$", B: "$\\frac{\\sqrt{3}}{2}$", C: "$1$", D: "$3$" },
        correct: "A",
        explanation: "$\\sqrt{3} \\cdot \\frac{\\sqrt{3}}{2} = \\frac{3}{2}$.",
      },
      {
        id: "tr-s3",
        prompt: "Wartość $\\cos 120^\\circ$ jest równa:",
        options: { A: "$-\\frac{1}{2}$", B: "$\\frac{1}{2}$", C: "$-\\frac{\\sqrt{3}}{2}$", D: "$\\frac{\\sqrt{3}}{2}$" },
        correct: "A",
        explanation: "$\\cos 120^\\circ = \\cos(180^\\circ - 60^\\circ) = -\\cos 60^\\circ = -\\frac{1}{2}$.",
        trap: "Kąt rozwarty ma ujemny cosinus – bez minusa wychodzi $\\cos 60^\\circ$.",
      },
    ],
    zaawansowany: [
      {
        id: "tr-z1",
        prompt: "Kąt $\\alpha$ jest ostry i $\\operatorname{tg}\\alpha = 2$. Wtedy $\\cos\\alpha$ jest równy:",
        options: { A: "$\\frac{\\sqrt{5}}{5}$", B: "$\\frac{2\\sqrt{5}}{5}$", C: "$\\frac{1}{2}$", D: "$\\frac{1}{5}$" },
        correct: "A",
        explanation: "$\\sin\\alpha = 2\\cos\\alpha$, więc $5\\cos^2\\alpha = 1$ i $\\cos\\alpha = \\frac{1}{\\sqrt{5}} = \\frac{\\sqrt{5}}{5}$.",
      },
      {
        id: "tr-z2",
        prompt: "Wartość wyrażenia $\\sin^2 37^\\circ + \\cos^2 37^\\circ + \\operatorname{tg} 45^\\circ$ jest równa:",
        options: { A: "$1$", B: "$2$", C: "$3$", D: "$0$" },
        correct: "B",
        explanation: "Jedynka trygonometryczna daje $1$, a $\\operatorname{tg} 45^\\circ = 1$.",
      },
      {
        id: "tr-z3",
        prompt: "Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{2}{3}$. Wtedy $\\operatorname{tg}\\alpha$ jest równy:",
        options: { A: "$\\frac{2\\sqrt{5}}{5}$", B: "$\\frac{\\sqrt{5}}{2}$", C: "$\\frac{2}{3}$", D: "$\\frac{\\sqrt{5}}{3}$" },
        correct: "A",
        explanation:
          "$\\cos\\alpha = \\sqrt{1 - \\frac{4}{9}} = \\frac{\\sqrt{5}}{3}$, więc $\\operatorname{tg}\\alpha = \\frac{2}{3} : \\frac{\\sqrt{5}}{3} = \\frac{2}{\\sqrt{5}} = \\frac{2\\sqrt{5}}{5}$.",
        trap: "$\\frac{\\sqrt{5}}{3}$ to cosinus – tangens to jeszcze dzielenie sinusa przez cosinus.",
      },
    ],
  },
};

export default content;
