import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Działania na potęgach",
      body:
        "Potęga $a^n$ to iloczyn $n$ czynników równych $a$. Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki, przy dzieleniu – odejmujemy, a przy potęgowaniu potęgi – mnożymy.\n\nZanim zaczniesz liczyć, sprowadź wszystkie liczby do tej samej podstawy, np. $9 = 3^2$, $27 = 3^3$.",
      example: {
        prompt: "Oblicz $\\frac{2^7 \\cdot 2^3}{2^8}$.",
        solution: "$\\frac{2^{7+3}}{2^8} = \\frac{2^{10}}{2^8} = 2^{10-8} = 2^2 = 4$.",
      },
    },
    {
      title: "Wykładnik zerowy i ujemny",
      body:
        "Dla $a \\neq 0$ mamy $a^0 = 1$. Ujemny wykładnik oznacza odwrotność: $a^{-n} = \\frac{1}{a^n}$.\n\nUłamek do potęgi ujemnej po prostu odwracamy: $\\left(\\frac{2}{3}\\right)^{-2} = \\left(\\frac{3}{2}\\right)^2 = \\frac{9}{4}$.",
    },
    {
      title: "Pierwiastki i wyłączanie czynnika",
      body:
        "Dla $a, b \\ge 0$: $\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}$. Aby uprościć pierwiastek, szukamy w liczbie podpierwiastkowej kwadratu liczby naturalnej: $\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$.\n\nPierwiastek nieparzystego stopnia istnieje także z liczby ujemnej: $\\sqrt[3]{-8} = -2$. Pamiętaj też, że $\\sqrt{a^2} = |a|$.",
      example: {
        prompt: "Oblicz $\\sqrt{50} - \\sqrt{8}$.",
        solution: "$\\sqrt{50} = 5\\sqrt{2}$, $\\sqrt{8} = 2\\sqrt{2}$, więc różnica to $3\\sqrt{2}$.",
      },
    },
    {
      title: "Potęga o wykładniku wymiernym",
      body:
        "$a^{\\frac{m}{n}} = \\sqrt[n]{a^m}$, np. $8^{\\frac{2}{3}} = \\left(\\sqrt[3]{8}\\right)^2 = 4$.\n\nW zadaniach zamkniętych najpewniejsza metoda to zamiana wszystkich pierwiastków na potęgi tej samej podstawy.",
      example: {
        prompt: "Zapisz $\\sqrt[3]{9} \\cdot 3^{\\frac{1}{3}}$ jako potęgę liczby 3.",
        solution: "$9^{\\frac{1}{3}} \\cdot 3^{\\frac{1}{3}} = 3^{\\frac{2}{3}} \\cdot 3^{\\frac{1}{3}} = 3^1 = 3$.",
      },
    },
  ],
  formulas: [
    { label: "Mnożenie potęg", tex: "a^m \\cdot a^n = a^{m+n}" },
    { label: "Dzielenie potęg", tex: "\\frac{a^m}{a^n} = a^{m-n}" },
    { label: "Potęgowanie potęgi", tex: "\\left(a^m\\right)^n = a^{m \\cdot n}" },
    { label: "Potęga iloczynu", tex: "(a \\cdot b)^n = a^n \\cdot b^n" },
    { label: "Wykładnik ujemny", tex: "a^{-n} = \\frac{1}{a^n}" },
    { label: "Wykładnik wymierny", tex: "a^{\\frac{m}{n}} = \\sqrt[n]{a^m}" },
    { label: "Pierwiastek iloczynu", tex: "\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}" },
    { label: "Pierwiastek z kwadratu", tex: "\\sqrt{a^2} = |a|" },
  ],
  traps: [
    "Minus w wykładniku to odwrotność, nie liczba ujemna: $2^{-3} = \\frac{1}{8}$.",
    "Pierwiastków nie dodajesz „w środku”: $\\sqrt{9} + \\sqrt{16} = 7$, a nie $\\sqrt{25} = 5$.",
    "$\\sqrt{a^2} = |a|$ – jeśli w środku siedzi coś ujemnego, wynik zmienia znak.",
  ],
  openTasks: [
    {
      id: "pot-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Oblicz wartość wyrażenia $\\frac{2^{10} \\cdot 4^3}{8^5}$.",
      answers: ["2"],
      hints: ["Zapisz $4$ i $8$ jako potęgi dwójki."],
      solution: [
        { step: "Zapisanie liczb jako potęg dwójki: $4^3 = 2^6$, $8^5 = 2^{15}$.", points: 1 },
        { step: "Obliczenie: $\\frac{2^{10} \\cdot 2^6}{2^{15}} = 2^{16 - 15} = 2$.", points: 1 },
      ],
    },
    {
      id: "pot-o2",
      difficulty: "sredni",
      points: 2,
      prompt: "Liczbę $\\sqrt{75} - \\sqrt{27} + \\sqrt{12}$ zapisz w postaci $a\\sqrt{3}$. Podaj liczbę $a$.",
      answers: ["4"],
      answerLabel: "a =",
      hints: ["W każdym pierwiastku znajdź kwadrat liczby naturalnej, np. $75 = 25 \\cdot 3$."],
      solution: [
        { step: "Wyłączenie czynników: $\\sqrt{75} = 5\\sqrt{3}$, $\\sqrt{27} = 3\\sqrt{3}$, $\\sqrt{12} = 2\\sqrt{3}$.", points: 1 },
        { step: "Redukcja: $5\\sqrt{3} - 3\\sqrt{3} + 2\\sqrt{3} = 4\\sqrt{3}$, więc $a = 4$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "pot-p1",
        prompt: "Liczba $2^5 \\cdot 2^3$ jest równa:",
        options: { A: "$2^8$", B: "$2^{15}$", C: "$4^8$", D: "$4^{15}$" },
        correct: "A",
        hints: [
          "Podstawy są takie same – co robimy z wykładnikami przy mnożeniu?",
          "$a^m \\cdot a^n = a^{m+n}$, więc wykładnik wyniku to $5 + 3$.",
        ],
        explanation: "Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki: $5 + 3 = 8$.",
        trap: "Klasyk: mnożysz wykładniki ($2^{15}$) albo podstawy ($4^8$). Przy mnożeniu potęg podstawa zostaje, wykładniki się dodają.",
      },
      {
        id: "pot-p2",
        prompt: "Liczba $5^{-2}$ jest równa:",
        options: { A: "$-25$", B: "$-\\frac{1}{25}$", C: "$\\frac{1}{25}$", D: "$\\frac{1}{10}$" },
        correct: "C",
        hints: [
          "Ujemny wykładnik zamienia liczbę na jej odwrotność – znak liczby się nie zmienia.",
          "$5^{-2} = \\frac{1}{5^2}$ – policz mianownik.",
        ],
        explanation: "$5^{-2} = \\frac{1}{5^2} = \\frac{1}{25}$.",
        trap: "Minus w wykładniku NIE robi liczby ujemnej. To tylko „odwróć ułamek”, a nie „dopisz minus”.",
      },
      {
        id: "pot-p3",
        prompt: "Liczba $\\sqrt{50} - \\sqrt{8}$ jest równa:",
        options: { A: "$\\sqrt{42}$", B: "$3\\sqrt{2}$", C: "$7\\sqrt{2}$", D: "$2\\sqrt{3}$" },
        correct: "B",
        hints: [
          "Rozłóż $50 = 25 \\cdot 2$ oraz $8 = 4 \\cdot 2$ i wyłącz czynnik przed pierwiastek.",
          "$\\sqrt{50} = 5\\sqrt{2}$. Zrób to samo z $\\sqrt{8}$ i odejmij jak wyrazy podobne.",
        ],
        explanation: "$\\sqrt{50} = 5\\sqrt{2}$ oraz $\\sqrt{8} = 2\\sqrt{2}$, więc różnica to $3\\sqrt{2}$.",
        trap: "Nie odejmuj pod pierwiastkiem: $\\sqrt{50} - \\sqrt{8} \\neq \\sqrt{42}$. Odejmujesz dopiero pierwiastki z tą samą liczbą w środku.",
      },
    ],
    sredni: [
      {
        id: "pot-s1",
        prompt: "Liczba $\\frac{3^{10} \\cdot 9^2}{27^4}$ jest równa:",
        options: { A: "$3$", B: "$9$", C: "$27$", D: "$\\frac{1}{3}$" },
        correct: "B",
        explanation: "$\\frac{3^{10} \\cdot 3^4}{3^{12}} = 3^{14 - 12} = 3^2 = 9$.",
        trap: "Najpierw zamień $9$ i $27$ na potęgi trójki – inaczej utkniesz w liczeniu ogromnych liczb.",
      },
      {
        id: "pot-s2",
        prompt: "Liczba $8^{\\frac{2}{3}}$ jest równa:",
        options: { A: "$4$", B: "$\\frac{16}{3}$", C: "$2$", D: "$16$" },
        correct: "A",
        explanation: "$8^{\\frac{2}{3}} = \\left(\\sqrt[3]{8}\\right)^2 = 2^2 = 4$.",
      },
      {
        id: "pot-s3",
        prompt: "Liczba $\\sqrt{3} \\cdot \\sqrt{12} + \\sqrt[3]{-27}$ jest równa:",
        options: { A: "$3$", B: "$9$", C: "$\\sqrt{15} - 3$", D: "$-3$" },
        correct: "A",
        explanation: "$\\sqrt{3} \\cdot \\sqrt{12} = \\sqrt{36} = 6$, a $\\sqrt[3]{-27} = -3$. Razem $6 - 3 = 3$.",
      },
    ],
    zaawansowany: [
      {
        id: "pot-z1",
        prompt: "Liczba $\\sqrt[3]{9} \\cdot 3^{\\frac{1}{3}} \\cdot 3^{-2}$ jest równa:",
        options: { A: "$\\frac{1}{3}$", B: "$3$", C: "$\\frac{1}{9}$", D: "$3^{\\frac{2}{3}}$" },
        correct: "A",
        explanation: "$3^{\\frac{2}{3}} \\cdot 3^{\\frac{1}{3}} \\cdot 3^{-2} = 3^{1 - 2} = 3^{-1} = \\frac{1}{3}$.",
      },
      {
        id: "pot-z2",
        prompt: "Liczba $\\left(\\frac{2}{3}\\right)^{-2} \\cdot \\left(\\frac{3}{2}\\right)^{-1}$ jest równa:",
        options: { A: "$\\frac{3}{2}$", B: "$\\frac{2}{3}$", C: "$\\frac{27}{8}$", D: "$1$" },
        correct: "A",
        explanation: "$\\left(\\frac{3}{2}\\right)^2 \\cdot \\frac{2}{3} = \\frac{9}{4} \\cdot \\frac{2}{3} = \\frac{3}{2}$.",
      },
      {
        id: "pot-z3",
        prompt: "Liczba $\\sqrt{\\left(2 - \\sqrt{5}\\right)^2}$ jest równa:",
        options: { A: "$2 - \\sqrt{5}$", B: "$\\sqrt{5} - 2$", C: "$\\sqrt{5} + 2$", D: "$-2 - \\sqrt{5}$" },
        correct: "B",
        explanation: "$\\sqrt{a^2} = |a|$. Ponieważ $2 < \\sqrt{5}$, mamy $|2 - \\sqrt{5}| = \\sqrt{5} - 2$.",
        trap: "$\\sqrt{a^2} = |a|$, a nie $a$. CKE podsuwa $2 - \\sqrt{5}$, czyli liczbę ujemną – a pierwiastek nigdy nie jest ujemny.",
      },
    ],
  },
};

export default content;
