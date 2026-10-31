import type { TopicContent } from "@/types/topic";

// Rozszerzenie – granice ciągów i szereg geometryczny (dział VI, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Granica ciągu – porównaj najwyższe potęgi",
      body:
        "W ułamku z wielomianami od $n$ podziel licznik i mianownik przez najwyższą potęgę $n$ z mianownika. " +
        "Wyrazy typu $\\frac{1}{n}$, $\\frac{5}{n^2}$ dążą do zera i znikają.\n\n" +
        "Skrót: gdy stopnie licznika i mianownika są równe, granica to iloraz współczynników przy najwyższych potęgach; " +
        "gdy licznik ma niższy stopień – granica $0$; gdy wyższy – $\\pm\\infty$.",
      example: {
        prompt: "Oblicz $\\lim\\limits_{n \\to \\infty} \\frac{3n^2 + 1}{2n^2 - n}$.",
        solution:
          "Dzielimy przez $n^2$: $\\frac{3 + \\frac{1}{n^2}}{2 - \\frac{1}{n}}$.\n" +
          "$\\frac{1}{n^2} \\to 0$, $\\frac{1}{n} \\to 0$.\n" +
          "Granica: $\\frac{3}{2}$.",
      },
      check: {
        id: "rz-g-t1",
        prompt: "$\\lim\\limits_{n \\to \\infty} \\frac{5n - 2}{n + 4}$ jest równa:",
        options: { A: "$5$", B: "$-\\frac{1}{2}$", C: "$0$", D: "$+\\infty$" },
        correct: "A",
        explanation: "Równe stopnie (pierwsze): granica to iloraz współczynników $\\frac{5}{1} = 5$.",
        trap: "$-\\frac{1}{2}$ to iloraz wyrazów wolnych – one przy $n \\to \\infty$ nie mają znaczenia.",
      },
    },
    {
      title: "Różnica z pierwiastkiem – mnożenie przez sprzężenie",
      body:
        "Wyrażenie $\\sqrt{n^2 + 4n} - n$ to symbol $\\infty - \\infty$ – nie wiadomo z góry, ile wynosi (na pewno nie „zero”). " +
        "Mnożysz i dzielisz przez sumę $\\sqrt{n^2 + 4n} + n$ i korzystasz z $(a - b)(a + b) = a^2 - b^2$.",
      example: {
        prompt: "Oblicz $\\lim\\limits_{n \\to \\infty} \\left(\\sqrt{n^2 + 4n} - n\\right)$.",
        solution:
          "$\\sqrt{n^2 + 4n} - n = \\frac{n^2 + 4n - n^2}{\\sqrt{n^2 + 4n} + n}$\n" +
          "$= \\frac{4n}{\\sqrt{n^2 + 4n} + n}$\n" +
          "Dzielimy przez $n$: $\\frac{4}{\\sqrt{1 + \\frac{4}{n}} + 1} \\to \\frac{4}{2} = 2$.",
      },
      check: {
        id: "rz-g-t2",
        prompt: "$\\lim\\limits_{n \\to \\infty} \\left(\\sqrt{n^2 + 6n} - n\\right)$ jest równa:",
        options: { A: "$3$", B: "$6$", C: "$0$", D: "$+\\infty$" },
        correct: "A",
        explanation: "Po pomnożeniu przez sprzężenie: $\\frac{6n}{\\sqrt{n^2 + 6n} + n} \\to \\frac{6}{2} = 3$.",
        trap: "„$\\infty - \\infty = 0$” to błąd – trzeba przekształcić wyrażenie.",
      },
    },
    {
      title: "Szereg geometryczny – suma nieskończenie wielu wyrazów",
      body:
        "Suma $a_1 + a_1q + a_1q^2 + \\ldots$ istnieje (szereg jest zbieżny) tylko wtedy, gdy $|q| < 1$. Wtedy $S = \\frac{a_1}{1 - q}$.\n\n" +
        "W zadaniach z niewiadomą w ilorazie zawsze sprawdź warunek $|q| < 1$ – to on odrzuca część rozwiązań.",
      example: {
        prompt: "Oblicz sumę szeregu $6 + 3 + \\frac{3}{2} + \\ldots$",
        solution: "$a_1 = 6$, $q = \\frac{1}{2}$, $|q| < 1$.\n$S = \\frac{6}{1 - \\frac{1}{2}} = 12$.",
      },
      check: {
        id: "rz-g-t3",
        prompt: "Suma szeregu geometrycznego $9 - 3 + 1 - \\frac{1}{3} + \\ldots$ jest równa:",
        options: { A: "$\\frac{27}{4}$", B: "$\\frac{27}{2}$", C: "$\\frac{9}{4}$", D: "$6$" },
        correct: "A",
        explanation: "$q = -\\frac{1}{3}$, więc $S = \\frac{9}{1 + \\frac{1}{3}} = \\frac{9}{\\frac{4}{3}} = \\frac{27}{4}$.",
        trap: "$\\frac{27}{2}$ wychodzi z $q = \\frac{1}{3}$ – iloraz jest ujemny, bo znaki się przeplatają.",
      },
    },
  ],
  formulas: [
    { label: "Granica ilorazu wielomianów (równe stopnie)", tex: "\\lim_{n \\to \\infty} \\frac{a_k n^k + \\ldots}{b_k n^k + \\ldots} = \\frac{a_k}{b_k}" },
    { label: "Podstawowe granice", tex: "\\lim_{n \\to \\infty} \\frac{1}{n} = 0, \\quad \\lim_{n \\to \\infty} q^n = 0 \\ \\text{dla} \\ |q| < 1" },
    { label: "Sprzężenie", tex: "\\sqrt{a} - \\sqrt{b} = \\frac{a - b}{\\sqrt{a} + \\sqrt{b}}" },
    { label: "Suma szeregu geometrycznego", tex: "S = \\frac{a_1}{1 - q}, \\quad |q| < 1" },
  ],
  traps: [
    "$\\infty - \\infty$ i $\\frac{\\infty}{\\infty}$ to symbole nieoznaczone – nie mają z góry wartości.",
    "Wyrazy wolne nie decydują o granicy ilorazu wielomianów – decydują najwyższe potęgi.",
    "Szereg geometryczny ma sumę tylko dla $|q| < 1$ – sprawdź to przed podaniem wyniku.",
    "Przy naprzemiennych znakach iloraz $q$ jest ujemny.",
  ],
  openTasks: [
    {
      id: "rz-g-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Oblicz $\\lim\\limits_{n \\to \\infty} \\frac{3n^2 - 2n + 1}{1 - 6n^2}$.",
      answers: ["-1/2"],
      hints: ["Podziel licznik i mianownik przez $n^2$."],
      solution: [
        { step: "Po podzieleniu przez $n^2$: $\\frac{3 - \\frac{2}{n} + \\frac{1}{n^2}}{\\frac{1}{n^2} - 6}$.", points: 1 },
        { step: "Granica: $\\frac{3}{-6} = -\\frac{1}{2}$.", points: 1 },
      ],
    },
    {
      id: "rz-g-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Rozwiąż równanie $1 + x + x^2 + x^3 + \\ldots = 3$, w którym lewa strona jest sumą nieskończonego szeregu geometrycznego.",
      answers: ["2/3"],
      answerLabel: "x =",
      hints: ["Iloraz szeregu to $x$ – kiedy szereg jest zbieżny?"],
      solution: [
        { step: "Szereg jest zbieżny dla $|x| < 1$.", points: 1 },
        { step: "Suma: $\\frac{1}{1 - x} = 3$.", points: 1 },
        { step: "$1 - x = \\frac{1}{3}$, $x = \\frac{2}{3}$ – spełnia $|x| < 1$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-g-p1",
        prompt: "$\\lim\\limits_{n \\to \\infty} \\frac{2n^2 + 3}{n^2 - 1}$ jest równa:",
        options: { A: "$2$", B: "$-3$", C: "$0$", D: "$+\\infty$" },
        correct: "A",
        explanation: "Równe stopnie: $\\frac{2}{1} = 2$.",
      },
      {
        id: "rz-g-p2",
        prompt: "Suma nieskończonego szeregu geometrycznego $4 + 2 + 1 + \\frac{1}{2} + \\ldots$ jest równa:",
        options: { A: "$8$", B: "$6$", C: "$4$", D: "$+\\infty$" },
        correct: "A",
        explanation: "$q = \\frac{1}{2}$, $S = \\frac{4}{1 - \\frac{1}{2}} = 8$.",
        trap: "Nieskończenie wiele wyrazów nie oznacza nieskończonej sumy – przy $|q| < 1$ suma jest skończona.",
      },
    ],
    sredni: [
      {
        id: "rz-g-s1",
        prompt: "$\\lim\\limits_{n \\to \\infty} \\frac{n + 1}{n^2 + 2}$ jest równa:",
        options: { A: "$0$", B: "$1$", C: "$\\frac{1}{2}$", D: "$+\\infty$" },
        correct: "A",
        explanation: "Licznik ma niższy stopień niż mianownik, więc granica to $0$.",
      },
      {
        id: "rz-g-s2",
        prompt: "Nieskończony szereg geometryczny o pierwszym wyrazie $5$ ma sumę $10$. Jego iloraz jest równy:",
        options: { A: "$\\frac{1}{2}$", B: "$2$", C: "$-\\frac{1}{2}$", D: "$\\frac{1}{5}$" },
        correct: "A",
        explanation: "$\\frac{5}{1 - q} = 10$, więc $1 - q = \\frac{1}{2}$ i $q = \\frac{1}{2}$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-g-z1",
        prompt: "$\\lim\\limits_{n \\to \\infty} \\left(\\sqrt{4n^2 + n} - 2n\\right)$ jest równa:",
        options: { A: "$\\frac{1}{4}$", B: "$\\frac{1}{2}$", C: "$0$", D: "$1$" },
        correct: "A",
        explanation:
          "$\\frac{4n^2 + n - 4n^2}{\\sqrt{4n^2 + n} + 2n} = \\frac{n}{\\sqrt{4n^2 + n} + 2n} \\to \\frac{1}{2 + 2} = \\frac{1}{4}$.",
        trap: "W mianowniku po podzieleniu przez $n$ jest $\\sqrt{4} + 2 = 4$, nie $2$.",
      },
      {
        id: "rz-g-z2",
        prompt: "Szereg $1 + (x - 1) + (x - 1)^2 + \\ldots$ jest zbieżny wtedy i tylko wtedy, gdy:",
        options: { A: "$x \\in (0, 2)$", B: "$x \\in (-1, 1)$", C: "$x \\in \\langle 0, 2 \\rangle$", D: "$x > 1$" },
        correct: "A",
        explanation: "Iloraz $q = x - 1$, warunek $|x - 1| < 1$, czyli $0 < x < 2$.",
        trap: "Końce przedziału odpadają: dla $|q| = 1$ szereg nie jest zbieżny.",
      },
    ],
  },
};

export default content;
