import type { TopicContent } from "@/types/topic";

// Rozszerzenie – trygonometria: radiany, wzory na funkcje sumy i podwojonego kąta, równania (dział VII, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Radiany i okresowość",
      body:
        "Na rozszerzeniu kąty mierzysz w radianach: $\\pi$ rad $= 180°$, więc $1° = \\frac{\\pi}{180}$ rad.\n\n" +
        "Funkcje trygonometryczne są okresowe: $\\sin$ i $\\cos$ powtarzają się co $2\\pi$, a $\\operatorname{tg}$ – co $\\pi$. " +
        "Dlatego równanie trygonometryczne ma nieskończenie wiele rozwiązań, a zadanie zwykle ogranicza je do przedziału.",
      example: {
        prompt: "Zamień $\\frac{5\\pi}{6}$ na stopnie i oblicz $\\sin \\frac{5\\pi}{6}$.",
        solution: "$\\frac{5\\pi}{6} = \\frac{5 \\cdot 180°}{6} = 150°$.\n$\\sin 150° = \\sin(180° - 30°) = \\sin 30° = \\frac{1}{2}$.",
      },
      check: {
        id: "rz-t-t1",
        prompt: "Kąt $\\frac{7\\pi}{4}$ ma miarę:",
        options: { A: "$315°$", B: "$225°$", C: "$135°$", D: "$270°$" },
        correct: "A",
        explanation: "$\\frac{7 \\cdot 180°}{4} = 315°$.",
      },
    },
    {
      title: "Wzory na podwojony kąt i sumę kątów",
      body:
        "Najczęściej potrzebne:\n\n" +
        "• $\\sin 2x = 2\\sin x \\cos x$,\n\n" +
        "• $\\cos 2x = \\cos^2 x - \\sin^2 x = 2\\cos^2 x - 1 = 1 - 2\\sin^2 x$,\n\n" +
        "• $\\sin(\\alpha \\pm \\beta) = \\sin\\alpha\\cos\\beta \\pm \\cos\\alpha\\sin\\beta$, $\\cos(\\alpha \\pm \\beta) = \\cos\\alpha\\cos\\beta \\mp \\sin\\alpha\\sin\\beta$.\n\n" +
        "Gdy znasz tylko jedną funkcję, drugą liczysz z $\\sin^2 x + \\cos^2 x = 1$ – a znak wybierasz z ćwiartki, w której leży kąt.",
      example: {
        prompt: "Wiadomo, że $\\sin x = \\frac{3}{5}$ i $x \\in \\left(\\frac{\\pi}{2}, \\pi\\right)$. Oblicz $\\sin 2x$.",
        solution:
          "$\\cos^2 x = 1 - \\frac{9}{25} = \\frac{16}{25}$; w II ćwiartce cosinus jest ujemny: $\\cos x = -\\frac{4}{5}$.\n" +
          "$\\sin 2x = 2 \\cdot \\frac{3}{5} \\cdot \\left(-\\frac{4}{5}\\right) = -\\frac{24}{25}$.",
      },
      check: {
        id: "rz-t-t2",
        prompt: "Jeśli $\\cos \\alpha = \\frac{1}{3}$, to $\\cos 2\\alpha$ jest równy:",
        options: { A: "$-\\frac{7}{9}$", B: "$\\frac{2}{3}$", C: "$\\frac{7}{9}$", D: "$-\\frac{1}{3}$" },
        correct: "A",
        explanation: "$\\cos 2\\alpha = 2\\cos^2\\alpha - 1 = \\frac{2}{9} - 1 = -\\frac{7}{9}$.",
        trap: "$\\cos 2\\alpha$ to nie $2\\cos\\alpha$ – stąd błędne $\\frac{2}{3}$.",
      },
    },
    {
      title: "Równania trygonometryczne",
      body:
        "Znajdź jedno rozwiązanie podstawowe $x_0$ (np. z tabeli), a potem wszystkie:\n\n" +
        "• $\\sin x = a$: $x = x_0 + 2k\\pi$ lub $x = \\pi - x_0 + 2k\\pi$,\n\n" +
        "• $\\cos x = a$: $x = x_0 + 2k\\pi$ lub $x = -x_0 + 2k\\pi$,\n\n" +
        "• $\\operatorname{tg} x = a$: $x = x_0 + k\\pi$.\n\n" +
        "Równanie z $\\sin^2$ i $\\cos$ (lub odwrotnie) sprowadź do jednej funkcji i podstaw $t = \\cos x$ – dostajesz równanie kwadratowe, " +
        "pamiętając, że $t \\in \\langle -1, 1 \\rangle$.",
      example: {
        prompt: "Rozwiąż równanie $2\\sin x = 1$ w przedziale $\\langle 0, 2\\pi \\rangle$.",
        solution: "$\\sin x = \\frac{1}{2}$, $x_0 = \\frac{\\pi}{6}$.\nDrugie rozwiązanie: $\\pi - \\frac{\\pi}{6} = \\frac{5\\pi}{6}$.\nOdpowiedź: $x = \\frac{\\pi}{6}$ lub $x = \\frac{5\\pi}{6}$.",
      },
      check: {
        id: "rz-t-t3",
        prompt: "Ile rozwiązań ma równanie $\\cos x = 0$ w przedziale $\\langle 0, 2\\pi \\rangle$?",
        options: { A: "$2$", B: "$1$", C: "$3$", D: "$4$" },
        correct: "A",
        explanation: "$x = \\frac{\\pi}{2}$ i $x = \\frac{3\\pi}{2}$.",
      },
    },
  ],
  formulas: [
    { label: "Radiany", tex: "\\pi \\ \\text{rad} = 180°" },
    { label: "Jedynka trygonometryczna", tex: "\\sin^2 x + \\cos^2 x = 1" },
    { label: "Sinus podwojonego kąta", tex: "\\sin 2x = 2\\sin x\\cos x" },
    { label: "Cosinus podwojonego kąta", tex: "\\cos 2x = \\cos^2 x - \\sin^2 x = 2\\cos^2 x - 1" },
    { label: "Sinus sumy", tex: "\\sin(\\alpha + \\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta" },
    { label: "Cosinus różnicy", tex: "\\cos(\\alpha - \\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta" },
  ],
  traps: [
    "Znak funkcji wybierasz z ćwiartki kąta – po jedynce trygonometrycznej masz $\\pm$.",
    "$\\cos 2x \\neq 2\\cos x$ i $\\sin 2x \\neq 2\\sin x$.",
    "Równanie z $\\sin x = a$ ma w okresie zwykle DWA rozwiązania – nie zapomnij o $\\pi - x_0$.",
    "Po podstawieniu $t = \\cos x$ odrzuć rozwiązania spoza $\\langle -1, 1 \\rangle$.",
  ],
  openTasks: [
    {
      id: "rz-t-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Rozwiąż równanie $2\\sin x = \\sqrt{3}$ w przedziale $\\langle 0, 2\\pi \\rangle$. Jako odpowiedź podaj sumę wszystkich rozwiązań.",
      answers: ["π"],
      answerLabel: "suma =",
      hints: ["$\\sin x = \\frac{\\sqrt{3}}{2}$ – to kąt z tabeli."],
      solution: [
        { step: "$\\sin x = \\frac{\\sqrt{3}}{2}$, $x_0 = \\frac{\\pi}{3}$.", points: 1 },
        { step: "Rozwiązania w przedziale: $\\frac{\\pi}{3}$ i $\\pi - \\frac{\\pi}{3} = \\frac{2\\pi}{3}$.", points: 1 },
        { step: "Suma: $\\frac{\\pi}{3} + \\frac{2\\pi}{3} = \\pi$.", points: 1 },
      ],
    },
    {
      id: "rz-t-o2",
      difficulty: "zaawansowany",
      points: 4,
      prompt:
        "Oblicz $\\cos(\\alpha - \\beta)$, wiedząc, że $\\sin\\alpha = \\frac{3}{5}$, $\\alpha \\in \\left(\\frac{\\pi}{2}, \\pi\\right)$ oraz $\\cos\\beta = \\frac{5}{13}$, $\\beta \\in \\left(0, \\frac{\\pi}{2}\\right)$.",
      answers: ["16/65"],
      hints: ["Policz $\\cos\\alpha$ i $\\sin\\beta$ z jedynki – uważaj na znaki."],
      solution: [
        { step: "$\\cos\\alpha = -\\frac{4}{5}$ (II ćwiartka).", points: 1 },
        { step: "$\\sin\\beta = \\frac{12}{13}$ (I ćwiartka).", points: 1 },
        { step: "$\\cos(\\alpha - \\beta) = \\cos\\alpha\\cos\\beta + \\sin\\alpha\\sin\\beta$.", points: 1 },
        { step: "$= -\\frac{4}{5} \\cdot \\frac{5}{13} + \\frac{3}{5} \\cdot \\frac{12}{13} = \\frac{-20 + 36}{65} = \\frac{16}{65}$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-t-p1",
        prompt: "$\\sin\\frac{\\pi}{3}$ jest równy:",
        options: { A: "$\\frac{\\sqrt{3}}{2}$", B: "$\\frac{1}{2}$", C: "$\\frac{\\sqrt{2}}{2}$", D: "$\\sqrt{3}$" },
        correct: "A",
        explanation: "$\\frac{\\pi}{3} = 60°$, a $\\sin 60° = \\frac{\\sqrt{3}}{2}$.",
      },
      {
        id: "rz-t-p2",
        prompt: "Okres podstawowy funkcji $f(x) = \\operatorname{tg} x$ jest równy:",
        options: { A: "$\\pi$", B: "$2\\pi$", C: "$\\frac{\\pi}{2}$", D: "$4\\pi$" },
        correct: "A",
        explanation: "Tangens powtarza się co $\\pi$ (sinus i cosinus – co $2\\pi$).",
      },
    ],
    sredni: [
      {
        id: "rz-t-s1",
        prompt: "Wartość wyrażenia $\\sin 15° \\cdot \\cos 15°$ jest równa:",
        options: { A: "$\\frac{1}{4}$", B: "$\\frac{1}{2}$", C: "$\\frac{\\sqrt{3}}{4}$", D: "$\\frac{1}{8}$" },
        correct: "A",
        explanation: "$\\sin 15°\\cos 15° = \\frac{1}{2}\\sin 30° = \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}$.",
      },
      {
        id: "rz-t-s2",
        prompt: "Wszystkie rozwiązania równania $\\operatorname{tg} x = 1$ to:",
        options: {
          A: "$x = \\frac{\\pi}{4} + k\\pi$, $k \\in \\mathbb{Z}$",
          B: "$x = \\frac{\\pi}{4} + 2k\\pi$, $k \\in \\mathbb{Z}$",
          C: "$x = \\pm\\frac{\\pi}{4} + 2k\\pi$, $k \\in \\mathbb{Z}$",
          D: "$x = \\frac{\\pi}{2} + k\\pi$, $k \\in \\mathbb{Z}$",
        },
        correct: "A",
        explanation: "$\\operatorname{tg}\\frac{\\pi}{4} = 1$, a tangens ma okres $\\pi$.",
        trap: "Okres tangensa to $\\pi$, nie $2\\pi$ – zapis z $2k\\pi$ gubi połowę rozwiązań.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-t-z1",
        prompt: "Ile rozwiązań ma równanie $2\\cos^2 x - \\cos x - 1 = 0$ w przedziale $\\langle 0, 2\\pi)$?",
        options: { A: "$3$", B: "$2$", C: "$4$", D: "$1$" },
        correct: "A",
        explanation:
          "$t = \\cos x$: $2t^2 - t - 1 = 0$, $t = 1$ lub $t = -\\frac{1}{2}$. $\\cos x = 1$: $x = 0$. $\\cos x = -\\frac{1}{2}$: $x = \\frac{2\\pi}{3}$, $x = \\frac{4\\pi}{3}$. Razem $3$.",
        trap: "$2\\pi$ nie należy do przedziału $\\langle 0, 2\\pi)$ – dlatego $\\cos x = 1$ daje tylko jedno rozwiązanie.",
      },
      {
        id: "rz-t-z2",
        prompt: "Jeśli $\\sin\\alpha + \\cos\\alpha = \\frac{1}{2}$, to $\\sin 2\\alpha$ jest równy:",
        options: { A: "$-\\frac{3}{4}$", B: "$\\frac{3}{4}$", C: "$\\frac{1}{4}$", D: "$-\\frac{1}{4}$" },
        correct: "A",
        explanation: "Podnosimy do kwadratu: $1 + 2\\sin\\alpha\\cos\\alpha = \\frac{1}{4}$, więc $\\sin 2\\alpha = -\\frac{3}{4}$.",
      },
    ],
  },
};

export default content;
