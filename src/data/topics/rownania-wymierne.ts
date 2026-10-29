import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Najpierw dziedzina",
      body:
        "Mianownik nie może być równy zero. Zanim zaczniesz liczyć, wypisz liczby, które trzeba wykluczyć.\n\nNp. w równaniu $\\frac{x + 1}{x - 3} = 2$ zakładamy $x \\neq 3$.",
    },
    {
      title: "Mnożenie na krzyż i ułamek równy zero",
      body:
        "Gdy po obu stronach stoją pojedyncze ułamki, mnożymy na krzyż: $\\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc$.\n\nUłamek jest równy zero tylko wtedy, gdy jego licznik jest zerem (a mianownik nie).",
    },
    {
      title: "Sprawdź wynik z dziedziną",
      body: "Ostatni krok to zawsze porównanie otrzymanych liczb z dziedziną – część „rozwiązań” może odpaść.",
      example: {
        prompt: "Rozwiąż równanie $\\frac{x^2 - 9}{x - 3} = 0$.",
        solution:
          "Licznik: $x^2 - 9 = 0$, więc $x = 3$ lub $x = -3$. Ale $x \\neq 3$ (dziedzina), zatem jedynym rozwiązaniem jest $x = -3$.",
      },
    },
  ],
  formulas: [
    { label: "Dziedzina", tex: "\\frac{W(x)}{Q(x)}: \\quad Q(x) \\neq 0" },
    { label: "Ułamek równy zero", tex: "\\frac{a}{b} = 0 \\iff a = 0 \\ \\land \\ b \\neq 0" },
    { label: "Mnożenie na krzyż", tex: "\\frac{a}{b} = \\frac{c}{d} \\Rightarrow ad = bc \\quad (b, d \\neq 0)" },
    { label: "Dodawanie ułamków", tex: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}" },
  ],
  traps: [
    "Uwaga! A dziedzina? Zawsze zaczynaj od niej – CKE celowo daje „rozwiązania”, które ją łamią.",
    "Ułamek jest równy $0$ tylko wtedy, gdy licznik jest równy $0$.",
    "Na koniec porównaj wynik z dziedziną – to najczęściej tracony punkt.",
  ],
  openTasks: [
    {
      id: "rw-o1",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Rozwiąż równanie $\\frac{2x + 3}{x - 1} = 3$.",
      answers: ["6"],
      answerLabel: "x =",
      hints: ["Zapisz dziedzinę, a potem pomnóż obie strony przez $(x - 1)$."],
      solution: [
        { step: "Dziedzina $x \\neq 1$ i przekształcenie: $2x + 3 = 3(x - 1)$.", points: 1 },
        { step: "Rozwiązanie: $x = 6$, należy do dziedziny.", points: 1 },
      ],
    },
    {
      id: "rw-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Rozwiąż równanie $\\frac{x^2 - 4}{x + 2} = 3x$.",
      answers: ["-1"],
      answerLabel: "x =",
      hints: ["Licznik to różnica kwadratów. Pamiętaj o dziedzinie."],
      solution: [
        { step: "Dziedzina: $x \\neq -2$.", points: 1 },
        { step: "Skrócenie ułamka: $\\frac{(x - 2)(x + 2)}{x + 2} = x - 2$, więc $x - 2 = 3x$.", points: 1 },
        { step: "Rozwiązanie $x = -1$ i sprawdzenie, że należy do dziedziny.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rw-p1",
        prompt: "Dziedziną wyrażenia $\\frac{5}{x - 2}$ jest zbiór:",
        options: {
          A: "$\\mathbb{R} \\setminus \\{2\\}$",
          B: "$\\mathbb{R} \\setminus \\{-2\\}$",
          C: "$\\mathbb{R} \\setminus \\{5\\}$",
          D: "$\\mathbb{R}$",
        },
        correct: "A",
        hints: [
          "Mianownik nie może być zerem. Dla jakiego $x$ mamy $x - 2 = 0$?",
          "$x - 2 = 0$ dla $x = 2$ – tę liczbę wyrzucasz z dziedziny.",
        ],
        explanation: "$x - 2 \\neq 0$, czyli $x \\neq 2$.",
        trap: "Dziedzinę wyznacza MIANOWNIK. Licznik (tu $5$) nie ma tu nic do gadania.",
      },
      {
        id: "rw-p2",
        prompt: "Rozwiązaniem równania $\\frac{x + 1}{x - 3} = 2$ jest:",
        options: { A: "$x = 7$", B: "$x = 3$", C: "$x = -7$", D: "$x = 5$" },
        correct: "A",
        hints: [
          "Pomnóż obie strony przez $(x - 3)$.",
          "$x + 1 = 2(x - 3)$. Wymnóż nawias i zbierz $x$ po jednej stronie.",
        ],
        explanation: "$x + 1 = 2x - 6$, więc $x = 7$ (i $7 \\neq 3$, więc należy do dziedziny).",
        trap: "Mnożąc przez $(x - 3)$, mnożysz całą prawą stronę: $2(x - 3) = 2x - 6$, nie $2x - 3$.",
      },
      {
        id: "rw-p3",
        prompt: "Rozwiązaniem równania $\\frac{x - 4}{x + 1} = 0$ jest:",
        options: { A: "$x = 4$", B: "$x = -1$", C: "$x = 4$ lub $x = -1$", D: "brak rozwiązań" },
        correct: "A",
        hints: [
          "Ułamek jest równy zero, gdy jego licznik jest równy zero.",
          "$x - 4 = 0$. Sprawdź jeszcze, czy mianownik nie zeruje się dla tej liczby.",
        ],
        explanation: "$x - 4 = 0$, czyli $x = 4$; mianownik $4 + 1 \\neq 0$.",
        trap: "Zerowanie mianownika NIE daje rozwiązania – wyklucza liczbę z dziedziny. $x = -1$ to pułapka.",
      },
    ],
    sredni: [
      {
        id: "rw-s1",
        prompt: "Równanie $\\frac{x^2 - 9}{x - 3} = 0$ ma:",
        options: {
          A: "jedno rozwiązanie: $x = -3$",
          B: "dwa rozwiązania: $-3$ i $3$",
          C: "jedno rozwiązanie: $x = 3$",
          D: "zero rozwiązań",
        },
        correct: "A",
        explanation: "Licznik zeruje się dla $\\pm 3$, ale $x = 3$ wypada z dziedziny.",
        trap: "Uwaga! A dziedzina? $x = 3$ zeruje mianownik, więc wylatuje, chociaż zeruje też licznik.",
      },
      {
        id: "rw-s2",
        prompt: "Rozwiązaniem równania $\\frac{3}{x} = \\frac{2}{x - 1}$ jest:",
        options: { A: "$x = 3$", B: "$x = -3$", C: "$x = 1$", D: "$x = \\frac{3}{5}$" },
        correct: "A",
        explanation: "Na krzyż: $3(x - 1) = 2x$, więc $x = 3$.",
      },
      {
        id: "rw-s3",
        prompt: "Równanie $\\frac{x + 2}{x - 2} = 1$:",
        options: {
          A: "nie ma rozwiązań",
          B: "ma rozwiązanie $x = 0$",
          C: "ma rozwiązanie $x = 2$",
          D: "ma nieskończenie wiele rozwiązań",
        },
        correct: "A",
        explanation: "$x + 2 = x - 2$ prowadzi do $2 = -2$ – sprzeczność.",
        trap: "Gdy $x$ się skraca i zostaje fałsz typu $2 = -2$, równanie jest sprzeczne – nie szukaj rozwiązania na siłę.",
      },
    ],
    zaawansowany: [
      {
        id: "rw-z1",
        prompt: "Suma wszystkich rozwiązań równania $\\frac{x^2 - 4}{x(x + 2)} = 0$ jest równa:",
        options: { A: "$0$", B: "$2$", C: "$-2$", D: "$4$" },
        correct: "B",
        explanation: "Licznik: $x = \\pm 2$. Dziedzina wyklucza $0$ i $-2$, więc zostaje tylko $x = 2$.",
        trap: "$x = -2$ zeruje licznik, ale też mianownik. Bez dziedziny wyjdzie Ci suma $0$ i punkt przepada.",
      },
      {
        id: "rw-z2",
        prompt: "Rozwiązaniem równania $\\frac{2}{x - 1} + \\frac{1}{x + 1} = \\frac{4}{x^2 - 1}$ jest:",
        options: { A: "brak rozwiązań", B: "$x = 1$", C: "$x = -1$", D: "$x = \\frac{5}{3}$" },
        correct: "A",
        explanation: "Mnożymy przez $x^2 - 1$: $2(x + 1) + (x - 1) = 4$, czyli $x = 1$ – ale $1$ jest poza dziedziną.",
        trap: "Wyszło $x = 1$? Zerknij do dziedziny: $x^2 - 1 \\neq 0$. Jedyny kandydat odpada, więc rozwiązań brak.",
      },
      {
        id: "rw-z3",
        prompt: "Rozwiązaniami równania $\\frac{x - 1}{2} = \\frac{3}{x}$ są:",
        options: { A: "$-2$ i $3$", B: "$2$ i $-3$", C: "tylko $3$", D: "$0$ i $3$" },
        correct: "A",
        explanation: "$x(x - 1) = 6 \\Rightarrow x^2 - x - 6 = 0$, więc $x = -2$ lub $x = 3$ (obie $\\neq 0$).",
      },
    ],
  },
};

export default content;
