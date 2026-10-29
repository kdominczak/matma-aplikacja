import type { TopicContent } from "@/types/topic";

// Lekcje 23–25 – ciągi (dział VI podstawy). Zadania cg-p1…cg-z2 i cg-o1/cg-o2 przeniesione bez zmian
// z dawnego zestawu w src/data/practice – te same id (klucze odpowiedzi, Pudełko porażek, arkusze próbne).
const content: TopicContent = {
  theory: [
    {
      title: "Ciąg i jego wyrazy",
      body:
        "Ciąg to ponumerowana lista liczb: $a_1$ – pierwszy wyraz, $a_2$ – drugi i tak dalej. Wzór ogólny $a_n$ mówi, " +
        "jak policzyć wyraz o dowolnym numerze $n$ – wystarczy podstawić.\n\n" +
        "Pytanie odwrotne – „który wyraz jest równy…” – to równanie z niewiadomą $n$. " +
        "Numer wyrazu musi być liczbą naturalną dodatnią: rozwiązania ujemne i ułamkowe odrzucasz.",
      example: {
        prompt: "Ciąg jest określony wzorem $a_n = n^2 - 3n$. Oblicz $a_4$ i sprawdź, który wyraz jest równy $10$.",
        solution:
          "$a_4 = 16 - 12 = 4$.\n" +
          "$n^2 - 3n = 10 \\Rightarrow n^2 - 3n - 10 = 0 \\Rightarrow (n - 5)(n + 2) = 0$.\n" +
          "$n = -2$ odpada (to nie numer wyrazu), więc $a_5 = 10$.",
      },
    },
    {
      title: "Ciąg arytmetyczny",
      body:
        "Każdy kolejny wyraz powstaje przez dodanie tej samej liczby $r$ (różnicy): $a_{n+1} = a_n + r$. " +
        "Stąd wzór $a_n = a_1 + (n - 1)r$ – od $a_1$ do $a_n$ jest $n - 1$ kroków.\n\n" +
        "Gdy znasz dwa wyrazy, nie potrzebujesz $a_1$: między $a_m$ a $a_k$ jest $k - m$ kroków, więc $a_k - a_m = (k - m)r$.\n\n" +
        "Wyrazy ciągu arytmetycznego leżą na jednej prostej – to „schodki” o stałej wysokości $r$. " +
        "Na wykresie ciąg $a_n = n + 1$: $2, 3, 4, 5, 6$ (każdy krok w prawo to krok o $r = 1$ w górę).",
      example: {
        prompt: "W ciągu arytmetycznym $a_3 = 11$ i $a_7 = 23$. Wyznacz wzór ogólny.",
        solution:
          "Między $a_3$ a $a_7$ są 4 kroki: $4r = 23 - 11 = 12$, więc $r = 3$.\n" +
          "$a_1 = a_3 - 2r = 11 - 6 = 5$.\n" +
          "$a_n = 5 + (n - 1) \\cdot 3 = 3n + 2$.",
      },
      plot: {
        x: [0, 6],
        y: [0, 7],
        lines: [],
        dots: [{ at: [1, 2] }, { at: [2, 3] }, { at: [3, 4] }, { at: [4, 5] }, { at: [5, 6] }],
      },
    },
    {
      title: "Suma ciągu arytmetycznego",
      body:
        "Suma $n$ początkowych wyrazów to średnia z pierwszego i ostatniego razy liczba wyrazów: " +
        "$S_n = \\frac{a_1 + a_n}{2} \\cdot n$. Gdy nie znasz $a_n$, użyj wersji z różnicą: $S_n = \\frac{2a_1 + (n - 1)r}{2} \\cdot n$.\n\n" +
        "W zadaniach z sumą najpierw ustal, ile jest wyrazów – to najczęstsze źródło błędu.",
      example: {
        prompt: "Oblicz sumę $1 + 3 + 5 + \\ldots + 39$.",
        solution:
          "To ciąg arytmetyczny: $a_1 = 1$, $r = 2$.\n" +
          "Liczba wyrazów: $1 + (n - 1) \\cdot 2 = 39 \\Rightarrow n = 20$.\n" +
          "$S_{20} = \\frac{1 + 39}{2} \\cdot 20 = 400$.",
      },
    },
    {
      title: "Ciąg geometryczny",
      body:
        "Każdy kolejny wyraz powstaje przez pomnożenie przez tę samą liczbę $q$ (iloraz): $a_{n+1} = a_n \\cdot q$. " +
        "Wzór ogólny: $a_n = a_1 \\cdot q^{n - 1}$.\n\n" +
        "Z dwóch wyrazów: $\\frac{a_k}{a_m} = q^{k - m}$. Przy parzystej potędze wychodzą dwie wartości $q$ " +
        "(np. $q^2 = 9 \\Rightarrow q = 3$ lub $q = -3$) – zadanie zwykle mówi, które wybrać („wyrazy dodatnie”). " +
        "Ujemny iloraz oznacza naprzemienne znaki: $3, -6, 12, -24, \\ldots$",
      example: {
        prompt: "W ciągu geometrycznym $a_2 = 6$ i $a_5 = 48$. Wyznacz $a_1$ i iloraz.",
        solution:
          "$\\frac{a_5}{a_2} = q^3 = \\frac{48}{6} = 8$, więc $q = 2$.\n" +
          "$a_1 = \\frac{a_2}{q} = 3$, czyli $a_n = 3 \\cdot 2^{n - 1}$.",
      },
    },
    {
      title: "Trzy kolejne wyrazy i suma ciągu geometrycznego",
      body:
        "Trzy liczby $x$, $y$, $z$ (w tej kolejności) tworzą ciąg:\n\n" +
        "• arytmetyczny, gdy środkowa jest średnią: $2y = x + z$,\n\n" +
        "• geometryczny, gdy kwadrat środkowej jest iloczynem skrajnych: $y^2 = x \\cdot z$.\n\n" +
        "Suma $n$ początkowych wyrazów ciągu geometrycznego: $S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}$ dla $q \\neq 1$ " +
        "(dla $q = 1$ wszystkie wyrazy są równe i $S_n = n \\cdot a_1$).",
      example: {
        prompt: "Liczby $4$, $x$, $16$ tworzą ciąg geometryczny. Wyznacz $x$.",
        solution:
          "$x^2 = 4 \\cdot 16 = 64$, więc $x = 8$ lub $x = -8$.\n" +
          "Obie wartości są dobre: $4, 8, 16$ ($q = 2$) i $4, -8, 16$ ($q = -2$).",
      },
    },
  ],
  formulas: [
    { label: "Wyraz ogólny ciągu arytmetycznego", tex: "a_n = a_1 + (n - 1)r" },
    { label: "Wyraz z innego wyrazu", tex: "a_k = a_m + (k - m)r" },
    { label: "Suma ciągu arytmetycznego", tex: "S_n = \\frac{a_1 + a_n}{2} \\cdot n" },
    { label: "Suma ciągu arytmetycznego (z różnicą)", tex: "S_n = \\frac{2a_1 + (n - 1)r}{2} \\cdot n" },
    { label: "Wyraz ogólny ciągu geometrycznego", tex: "a_n = a_1 \\cdot q^{n - 1}" },
    { label: "Suma ciągu geometrycznego", tex: "S_n = a_1 \\cdot \\frac{1 - q^n}{1 - q}, \\quad q \\neq 1" },
    { label: "Trzy kolejne wyrazy – arytmetyczny", tex: "2a_n = a_{n-1} + a_{n+1}" },
    { label: "Trzy kolejne wyrazy – geometryczny", tex: "a_n^2 = a_{n-1} \\cdot a_{n+1}" },
  ],
  traps: [
    "We wzorze jest $(n - 1)r$, a nie $nr$: od $a_1$ do $a_{10}$ jest 9 kroków.",
    "Z $q^2 = 9$ wychodzi $q = 3$ albo $q = -3$ – sprawdź, czy zadanie mówi o wyrazach dodatnich.",
    "Wzór na sumę ciągu geometrycznego nie działa dla $q = 1$ – wtedy $S_n = n \\cdot a_1$.",
    "„Który wyraz…” – $n$ musi być naturalne. Rozwiązanie ujemne albo ułamkowe odrzuć.",
  ],
  openTasks: [
    {
      id: "cg-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "W ciągu arytmetycznym $a_1 = 3$ i $r = 2$. Oblicz sumę dwunastu początkowych wyrazów tego ciągu.",
      answers: ["168"],
      answerLabel: "S₁₂ =",
      hints: ["Najpierw policz $a_{12} = a_1 + 11r$, potem użyj wzoru na sumę."],
      solution: [
        { step: "Ostatni wyraz: $a_{12} = 3 + 11 \\cdot 2 = 25$.", points: 1 },
        { step: "Suma: $S_{12} = \\frac{3 + 25}{2} \\cdot 12 = 168$.", points: 1 },
      ],
    },
    {
      id: "cg-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "W ciągu arytmetycznym $a_2 = 7$ i $a_6 = 19$. Oblicz $a_{20}$.",
      answers: ["61"],
      hints: ["Między $a_2$ a $a_6$ są cztery kroki o $r$."],
      solution: [
        { step: "Różnica: $a_6 - a_2 = 4r = 12$, więc $r = 3$.", points: 1 },
        { step: "$a_1 = 4$, więc $a_{20} = 4 + 19 \\cdot 3 = 61$.", points: 1 },
      ],
    },
    {
      id: "cg-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Ciąg geometryczny ma wyrazy $a_1 = 2$ i $a_4 = 54$. Oblicz sumę pięciu początkowych wyrazów tego ciągu.",
      answers: ["242"],
      hints: ["Najpierw wyznacz iloraz $q$ z $a_4 = a_1 q^3$."],
      solution: [
        { step: "$a_4 = a_1 q^3$, więc $q^3 = 27$ i $q = 3$.", points: 1 },
        { step: "Wzór: $S_5 = 2 \\cdot \\frac{1 - 3^5}{1 - 3}$.", points: 1 },
        { step: "Obliczenie: $S_5 = 2 \\cdot \\frac{-242}{-2} = 242$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "cg-p1",
        prompt: "Ciąg $(a_n)$ jest określony wzorem $a_n = 3n - 2$ dla $n \\ge 1$. Wyraz $a_5$ jest równy:",
        options: { A: "$13$", B: "$15$", C: "$17$", D: "$10$" },
        correct: "A",
        hints: ["Podstaw $n = 5$ do wzoru."],
        explanation: "$a_5 = 3 \\cdot 5 - 2 = 13$.",
      },
      {
        id: "cg-p2",
        prompt: "W ciągu arytmetycznym $a_1 = 5$ i $r = -2$. Wyraz $a_4$ jest równy:",
        options: { A: "$-1$", B: "$-3$", C: "$1$", D: "$11$" },
        correct: "A",
        hints: ["Od $a_1$ do $a_4$ są trzy kroki o $r$."],
        explanation: "$a_4 = a_1 + 3r = 5 - 6 = -1$.",
      },
      {
        id: "cg-p3",
        prompt: "W ciągu geometrycznym $a_1 = 2$ i $q = 3$. Wyraz $a_4$ jest równy:",
        options: { A: "$54$", B: "$18$", C: "$162$", D: "$24$" },
        correct: "A",
        hints: ["$a_n = a_1 \\cdot q^{n - 1}$.", "Dla $n = 4$ potęga to $q^3 = 27$."],
        explanation: "$a_4 = 2 \\cdot 3^3 = 2 \\cdot 27 = 54$.",
        trap: "Wykładnik to $n - 1 = 3$, a nie $n = 4$ – stąd błędne $2 \\cdot 3^4 = 162$.",
      },
    ],
    sredni: [
      {
        id: "cg-s1",
        prompt: "Ciąg geometryczny o wyrazach dodatnich ma $a_1 = 3$ i $a_3 = 27$. Iloraz tego ciągu jest równy:",
        options: { A: "$9$", B: "$3$", C: "$-3$", D: "$\\frac{1}{3}$" },
        correct: "B",
        explanation: "$a_3 = a_1 q^2$, więc $q^2 = 9$. Wyrazy są dodatnie, więc $q = 3$.",
      },
      {
        id: "cg-s2",
        prompt: "Suma dziesięciu początkowych wyrazów ciągu arytmetycznego, w którym $a_1 = 2$ i $a_{10} = 20$, jest równa:",
        options: { A: "$110$", B: "$220$", C: "$100$", D: "$200$" },
        correct: "A",
        explanation: "$S_{10} = \\frac{2 + 20}{2} \\cdot 10 = 110$.",
      },
      {
        id: "cg-s3",
        prompt: "Ciąg jest określony wzorem $a_n = 2n + 7$. Liczba $31$ jest wyrazem tego ciągu o numerze:",
        options: { A: "$12$", B: "$19$", C: "$11$", D: "$24$" },
        correct: "A",
        explanation: "$2n + 7 = 31 \\Rightarrow 2n = 24 \\Rightarrow n = 12$, czyli $a_{12} = 31$.",
        trap: "$24$ to $2n$, a nie $n$ – po odjęciu $7$ trzeba jeszcze podzielić przez $2$.",
      },
    ],
    zaawansowany: [
      {
        id: "cg-z1",
        prompt: "Liczby $x - 1$, $4$, $x + 5$ (w tej kolejności) tworzą ciąg arytmetyczny. Wtedy $x$ jest równe:",
        options: { A: "$2$", B: "$3$", C: "$4$", D: "$1$" },
        correct: "A",
        explanation: "$2 \\cdot 4 = (x - 1) + (x + 5)$, czyli $8 = 2x + 4$ i $x = 2$.",
      },
      {
        id: "cg-z2",
        prompt: "Liczby $2$, $x$, $18$ (w tej kolejności) tworzą ciąg geometryczny o wyrazach dodatnich. Suma tych trzech liczb jest równa:",
        options: { A: "$26$", B: "$30$", C: "$20$", D: "$24$" },
        correct: "A",
        explanation: "$x^2 = 2 \\cdot 18 = 36$, więc $x = 6$, a suma to $2 + 6 + 18 = 26$.",
      },
      {
        id: "cg-z3",
        prompt: "W ciągu arytmetycznym $a_1 = -10$ i $r = 4$. Suma $n$ początkowych wyrazów jest równa $0$ dla $n$ równego:",
        options: { A: "$6$", B: "$5$", C: "$3$", D: "$7$" },
        correct: "A",
        explanation:
          "$S_n = \\frac{2 \\cdot (-10) + (n - 1) \\cdot 4}{2} \\cdot n = n(2n - 12)$. Dla $n \\ge 1$: $2n - 12 = 0$, czyli $n = 6$ " +
          "(wyrazy $-10, -6, -2, 2, 6, 10$ się znoszą).",
      },
    ],
  },
};

export default content;
