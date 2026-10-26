import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Trzy najważniejsze wzory",
      body:
        "$(a + b)^2 = a^2 + 2ab + b^2$\n\n$(a - b)^2 = a^2 - 2ab + b^2$\n\n$a^2 - b^2 = (a - b)(a + b)$\n\nNajczęstszy błąd: $(a + b)^2 \\neq a^2 + b^2$. Nie zapominaj o podwojonym iloczynie $2ab$.",
    },
    {
      title: "Wzory z pierwiastkami",
      body:
        "Wzory działają też, gdy $a$ lub $b$ to pierwiastki: $(\\sqrt{3} - 1)^2 = 3 - 2\\sqrt{3} + 1 = 4 - 2\\sqrt{3}$.\n\nRóżnica kwadratów pozwala usunąć niewymierność z mianownika – mnożymy licznik i mianownik przez „sprzężenie”.",
      example: {
        prompt: "Usuń niewymierność z mianownika: $\\frac{1}{\\sqrt{2} - 1}$.",
        solution:
          "$\\frac{1}{\\sqrt{2} - 1} \\cdot \\frac{\\sqrt{2} + 1}{\\sqrt{2} + 1} = \\frac{\\sqrt{2} + 1}{2 - 1} = \\sqrt{2} + 1$.",
      },
    },
    {
      title: "Rozkład na czynniki",
      body:
        "Wzory czytamy też od prawej do lewej: $x^2 - 9 = (x - 3)(x + 3)$, $x^2 + 6x + 9 = (x + 3)^2$.\n\nTo podstawa upraszczania wyrażeń wymiernych i rozwiązywania równań bez delty.",
    },
  ],
  formulas: [
    { label: "Kwadrat sumy", tex: "(a + b)^2 = a^2 + 2ab + b^2" },
    { label: "Kwadrat różnicy", tex: "(a - b)^2 = a^2 - 2ab + b^2" },
    { label: "Różnica kwadratów", tex: "a^2 - b^2 = (a - b)(a + b)" },
    { label: "Sześcian sumy", tex: "(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3" },
    { label: "Sześcian różnicy", tex: "(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3" },
    { label: "Suma sześcianów", tex: "a^3 + b^3 = (a + b)(a^2 - ab + b^2)" },
    { label: "Różnica sześcianów", tex: "a^3 - b^3 = (a - b)(a^2 + ab + b^2)" },
  ],
  traps: [
    "$(a + b)^2 \\neq a^2 + b^2$ – zawsze pamiętaj o $2ab$.",
    "$(-a - b)^2 = (a + b)^2$ – minus w kwadracie znika.",
    "Przy $(2x)^2$ do kwadratu idzie też współczynnik: $4x^2$.",
  ],
  tests: {
    podstawowy: [
      {
        id: "wsm-p1",
        prompt: "Wyrażenie $(x + 3)^2$ jest równe:",
        options: { A: "$x^2 + 6x + 9$", B: "$x^2 + 9$", C: "$x^2 + 3x + 9$", D: "$x^2 + 6x + 6$" },
        correct: "A",
        hints: [
          "Użyj wzoru $(a + b)^2 = a^2 + 2ab + b^2$ dla $a = x$ i $b = 3$.",
          "$a^2 = x^2$, $2ab = 2 \\cdot x \\cdot 3$, $b^2 = 9$. Dodaj te trzy części.",
        ],
        explanation: "$x^2 + 2 \\cdot x \\cdot 3 + 3^2 = x^2 + 6x + 9$.",
        trap: "$(x + 3)^2 \\neq x^2 + 9$! Bez wyrazu $2ab$ robisz najpopularniejszy błąd w historii matur.",
      },
      {
        id: "wsm-p2",
        prompt: "Wyrażenie $x^2 - 25$ można zapisać w postaci:",
        options: { A: "$(x - 5)(x + 5)$", B: "$(x - 5)^2$", C: "$(x - 25)(x + 25)$", D: "$(x + 5)^2$" },
        correct: "A",
        hints: [
          "To różnica kwadratów, bo $25 = 5^2$.",
          "$a^2 - b^2 = (a - b)(a + b)$, gdzie $a = x$ i $b = 5$.",
        ],
        explanation: "$x^2 - 5^2 = (x - 5)(x + 5)$.",
        trap: "Różnica kwadratów to iloczyn RÓŻNICY i SUMY, a nie kwadrat różnicy: $(x - 5)^2 = x^2 - 10x + 25$.",
      },
      {
        id: "wsm-p3",
        prompt: "Wyrażenie $(2a - 1)^2$ jest równe:",
        options: { A: "$4a^2 - 4a + 1$", B: "$4a^2 + 1$", C: "$2a^2 - 4a + 1$", D: "$4a^2 - 2a + 1$" },
        correct: "A",
        hints: [
          "Pierwszym składnikiem jest $2a$, więc jego kwadrat to $4a^2$.",
          "$(2a)^2 = 4a^2$ oraz $2 \\cdot 2a \\cdot 1 = 4a$.",
        ],
        explanation: "$(2a)^2 - 2 \\cdot 2a \\cdot 1 + 1^2 = 4a^2 - 4a + 1$.",
        trap: "Do kwadratu idzie CAŁE $2a$: $(2a)^2 = 4a^2$, a nie $2a^2$.",
      },
    ],
    sredni: [
      {
        id: "wsm-s1",
        prompt: "Liczba $(\\sqrt{3} - 1)^2$ jest równa:",
        options: { A: "$4 - 2\\sqrt{3}$", B: "$2$", C: "$4 + 2\\sqrt{3}$", D: "$2 - 2\\sqrt{3}$" },
        correct: "A",
        explanation: "$3 - 2\\sqrt{3} + 1 = 4 - 2\\sqrt{3}$.",
      },
      {
        id: "wsm-s2",
        prompt: "Liczba $(\\sqrt{7} - \\sqrt{2})(\\sqrt{7} + \\sqrt{2})$ jest równa:",
        options: { A: "$5$", B: "$9$", C: "$\\sqrt{5}$", D: "$3$" },
        correct: "A",
        explanation: "Różnica kwadratów: $7 - 2 = 5$.",
      },
      {
        id: "wsm-s3",
        prompt: "Wyrażenie $(x - 2)^2 - (x + 2)^2$ jest równe:",
        options: { A: "$-8x$", B: "$0$", C: "$-8$", D: "$2x^2 + 8$" },
        correct: "A",
        explanation: "$(x^2 - 4x + 4) - (x^2 + 4x + 4) = -8x$.",
        trap: "Minus przed nawiasem zmienia znaki WSZYSTKICH wyrazów drugiego kwadratu – łącznie z $4$.",
      },
    ],
    zaawansowany: [
      {
        id: "wsm-z1",
        prompt: "Liczba $\\frac{2}{\\sqrt{5} - \\sqrt{3}}$ jest równa:",
        options: {
          A: "$\\sqrt{5} + \\sqrt{3}$",
          B: "$\\sqrt{5} - \\sqrt{3}$",
          C: "$\\frac{\\sqrt{5} + \\sqrt{3}}{2}$",
          D: "$2\\left(\\sqrt{5} + \\sqrt{3}\\right)$",
        },
        correct: "A",
        explanation: "$\\frac{2(\\sqrt{5} + \\sqrt{3})}{5 - 3} = \\sqrt{5} + \\sqrt{3}$.",
        trap: "Mnożysz licznik i mianownik przez sprzężenie $\\sqrt{5} + \\sqrt{3}$. W mianowniku zostaje $5 - 3 = 2$.",
      },
      {
        id: "wsm-z2",
        prompt: "Wyrażenie $(a + 1)^3$ jest równe:",
        options: {
          A: "$a^3 + 3a^2 + 3a + 1$",
          B: "$a^3 + 1$",
          C: "$a^3 + 3a + 1$",
          D: "$a^3 + 3a^2 + 1$",
        },
        correct: "A",
        explanation: "Ze wzoru na sześcian sumy: $a^3 + 3a^2 \\cdot 1 + 3a \\cdot 1^2 + 1^3$.",
      },
      {
        id: "wsm-z3",
        prompt: "Liczba $(2 + \\sqrt{3})^2 + (2 - \\sqrt{3})^2$ jest równa:",
        options: { A: "$14$", B: "$8$", C: "$14 + 8\\sqrt{3}$", D: "$2$" },
        correct: "A",
        explanation: "$(7 + 4\\sqrt{3}) + (7 - 4\\sqrt{3}) = 14$.",
      },
    ],
  },
};

export default content;
