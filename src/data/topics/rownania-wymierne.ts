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
        hint: "Mianownik nie może być zerem. Dla jakiego $x$ mamy $x - 2 = 0$?",
        explanation: "$x - 2 \\neq 0$, czyli $x \\neq 2$.",
      },
      {
        id: "rw-p2",
        prompt: "Rozwiązaniem równania $\\frac{x + 1}{x - 3} = 2$ jest:",
        options: { A: "$x = 7$", B: "$x = 3$", C: "$x = -7$", D: "$x = 5$" },
        correct: "A",
        hint: "Pomnóż obie strony przez $(x - 3)$.",
        explanation: "$x + 1 = 2x - 6$, więc $x = 7$ (i $7 \\neq 3$, więc należy do dziedziny).",
      },
      {
        id: "rw-p3",
        prompt: "Rozwiązaniem równania $\\frac{x - 4}{x + 1} = 0$ jest:",
        options: { A: "$x = 4$", B: "$x = -1$", C: "$x = 4$ lub $x = -1$", D: "brak rozwiązań" },
        correct: "A",
        hint: "Ułamek jest równy zero, gdy jego licznik jest równy zero.",
        explanation: "$x - 4 = 0$, czyli $x = 4$; mianownik $4 + 1 \\neq 0$.",
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
      },
    ],
    zaawansowany: [
      {
        id: "rw-z1",
        prompt: "Suma wszystkich rozwiązań równania $\\frac{x^2 - 4}{x(x + 2)} = 0$ jest równa:",
        options: { A: "$0$", B: "$2$", C: "$-2$", D: "$4$" },
        correct: "B",
        explanation: "Licznik: $x = \\pm 2$. Dziedzina wyklucza $0$ i $-2$, więc zostaje tylko $x = 2$.",
      },
      {
        id: "rw-z2",
        prompt: "Rozwiązaniem równania $\\frac{2}{x - 1} + \\frac{1}{x + 1} = \\frac{4}{x^2 - 1}$ jest:",
        options: { A: "brak rozwiązań", B: "$x = 1$", C: "$x = -1$", D: "$x = \\frac{5}{3}$" },
        correct: "A",
        explanation: "Mnożymy przez $x^2 - 1$: $2(x + 1) + (x - 1) = 4$, czyli $x = 1$ – ale $1$ jest poza dziedziną.",
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
