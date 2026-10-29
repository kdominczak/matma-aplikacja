import type { TopicContent } from "@/types/topic";

// Lekcja 46 – zadania optymalizacyjne (dział XIII podstawy: funkcja kwadratowa w zadaniach z treścią).
// Zadania op-p1…op-z2 i op-o1/op-o2 przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Plan zadania optymalizacyjnego",
      body:
        "Na maturze podstawowej optymalizacja to prawie zawsze funkcja kwadratowa i jej wierzchołek. Schemat (za każdy krok są punkty):\n\n" +
        "1. Oznacz jedną wielkość jako $x$.\n\n" +
        "2. Z warunku zadania wyraź drugą wielkość przez $x$.\n\n" +
        "3. Zapisz funkcję, którą masz zmaksymalizować lub zminimalizować (np. pole $P(x)$).\n\n" +
        "4. Ustal dziedzinę (długości są dodatnie).\n\n" +
        "5. Wyznacz wierzchołek, sprawdź, czy leży w dziedzinie, i policz szukaną wartość.",
    },
    {
      title: "Funkcja celu i dziedzina",
      body:
        "Funkcja celu to wzór na wielkość, o którą pyta zadanie, zapisany za pomocą jednej zmiennej. " +
        "Dziedzina wynika z treści: boki prostokąta są dodatnie, liczba sztuk – naturalna itd.",
      example: {
        prompt: "Prostokąt ma obwód $24$. Zapisz jego pole jako funkcję długości boku $x$ i podaj dziedzinę.",
        solution: "$2x + 2y = 24 \\Rightarrow y = 12 - x$.\n$P(x) = x(12 - x) = -x^2 + 12x$.\nDziedzina: $x > 0$ i $12 - x > 0$, czyli $x \\in (0, 12)$.",
      },
    },
    {
      title: "Wierzchołek daje odpowiedź",
      body:
        "Gdy $a < 0$ (ramiona w dół), największa wartość jest w wierzchołku: $p = \\frac{-b}{2a}$, wartość $f(p)$. " +
        "Gdy $a > 0$, w wierzchołku jest wartość najmniejsza.\n\n" +
        "Odpowiadaj na pytanie z zadania: czasem pytają o $x$ (wymiary), a czasem o samą największą wartość.",
      example: {
        prompt: "Dla $P(x) = -x^2 + 12x$ z poprzedniego kroku wyznacz największe pole.",
        solution: "$p = \\frac{-12}{-2} = 6 \\in (0, 12)$.\n$P(6) = 36$ – największe pole ma kwadrat $6 \\times 6$.",
      },
    },
    {
      title: "Gdy wierzchołek nie leży w przedziale",
      body:
        "Jeśli zadanie ogranicza $x$ do przedziału, a wierzchołek leży poza nim, funkcja jest na tym przedziale monotoniczna – " +
        "najmniejsza i największa wartość są na końcach. Licz wtedy $f$ w końcach przedziału.",
      example: {
        prompt: "Wyznacz najmniejszą i największą wartość $f(x) = x^2 - 4x + 1$ w przedziale $\\langle 3, 5 \\rangle$.",
        solution: "$p = 2 \\notin \\langle 3, 5 \\rangle$ – funkcja rośnie na całym przedziale.\n$f(3) = -2$ (najmniejsza), $f(5) = 6$ (największa).",
      },
    },
    {
      title: "Typowe sytuacje z matury",
      body:
        "• Stała suma dwóch liczb – iloczyn jest największy, gdy liczby są równe.\n\n" +
        "• Prostokąt o danym obwodzie – największe pole ma kwadrat.\n\n" +
        "• Wybieg przy ścianie: ogradzasz tylko trzy boki, więc $2x + y = L$ i $P(x) = x(L - 2x)$.\n\n" +
        "• Suma kwadratów przy stałej sumie – najmniejsza, gdy liczby są równe.",
      example: {
        prompt: "Siatką o długości $60$ m ogrodzono prostokątny wybieg przy ścianie budynku. Oblicz największe możliwe pole wybiegu.",
        solution: "$P(x) = x(60 - 2x) = -2x^2 + 60x$.\n$p = \\frac{-60}{-4} = 15$, więc boki $15$ m i $30$ m.\n$P = 15 \\cdot 30 = 450 \\text{ m}^2$.",
      },
    },
  ],
  formulas: [
    { label: "Wierzchołek paraboli", tex: "p = \\frac{-b}{2a}, \\quad q = f(p)" },
    { label: "Wartość ekstremalna", tex: "a < 0: \\ f_{\\max} = f(p), \\quad a > 0: \\ f_{\\min} = f(p)" },
    { label: "Prostokąt", tex: "P = xy, \\quad Obw = 2x + 2y" },
    { label: "Wybieg przy ścianie (siatka L)", tex: "P(x) = x(L - 2x)" },
  ],
  traps: [
    "Ustal dziedzinę – długości są dodatnie. Wierzchołek spoza dziedziny nie jest odpowiedzią.",
    "Pytają o największe pole, a nie o $x$? Po wierzchołku policz jeszcze wartość funkcji.",
    "Przy ścianie ogradzasz tylko trzy boki: $2x + y = L$, a nie $2x + 2y = L$.",
    "Maksimum jest w wierzchołku tylko przy $a < 0$ (ramiona w dół).",
  ],
  openTasks: [
    {
      id: "op-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Suma dwóch liczb jest równa $14$. Oblicz największą możliwą wartość ich iloczynu.",
      answers: ["49"],
      hints: ["Oznacz jedną liczbę $x$ – druga to $14 - x$."],
      solution: [
        { step: "Funkcja: $P(x) = x(14 - x) = -x^2 + 14x$.", points: 1 },
        { step: "Wierzchołek $x = 7$, więc największy iloczyn to $7 \\cdot 7 = 49$.", points: 1 },
      ],
    },
    {
      id: "op-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Z drutu o długości $36$ cm wygięto prostokąt. Oblicz największe możliwe pole tego prostokąta (w $\\text{cm}^2$).",
      answers: ["81"],
      hints: ["Połowa obwodu to suma dwóch sąsiednich boków."],
      solution: [
        { step: "Funkcja pola: $x + y = 18$, więc $P(x) = x(18 - x)$.", points: 1 },
        { step: "Wierzchołek: $x = 9$.", points: 1 },
        { step: "Największe pole: $P = 9 \\cdot 9 = 81$.", points: 1 },
      ],
    },
    {
      id: "op-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Liczby dodatnie $x$ i $y$ spełniają warunek $x + 2y = 12$. Oblicz największą możliwą wartość iloczynu $x \\cdot y$.",
      answers: ["18"],
      hints: ["Wyznacz $x$ z warunku i zapisz iloczyn jako funkcję $y$."],
      solution: [
        { step: "Funkcja: $x = 12 - 2y$, więc $P(y) = y(12 - 2y) = -2y^2 + 12y$.", points: 1 },
        { step: "Wierzchołek: $y = 3$ (wtedy $x = 6$).", points: 1 },
        { step: "Największa wartość: $P = 18$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "op-p1",
        prompt: "Funkcja $f(x) = -x^2 + 4x$ przyjmuje największą wartość dla $x$ równego:",
        options: { A: "$2$", B: "$4$", C: "$-2$", D: "$0$" },
        correct: "A",
        hints: ["Największa wartość jest w wierzchołku paraboli."],
        explanation: "$p = \\frac{-4}{-2} = 2$.",
      },
      {
        id: "op-p2",
        prompt: "Suma dwóch liczb dodatnich jest równa $10$. Ich iloczyn jest największy, gdy każda z nich jest równa:",
        options: { A: "$5$", B: "$2$", C: "$4$", D: "$10$" },
        correct: "A",
        hints: ["Zapisz iloczyn jako funkcję jednej liczby $x$."],
        explanation: "$P(x) = x(10 - x)$ ma wierzchołek w $x = 5$.",
      },
      {
        id: "op-p3",
        prompt: "Funkcja $f(x) = x^2 - 8x + 3$ przyjmuje najmniejszą wartość dla $x$ równego:",
        options: { A: "$4$", B: "$-4$", C: "$8$", D: "$3$" },
        correct: "A",
        hints: ["Ramiona w górę – najmniejsza wartość jest w wierzchołku.", "$p = \\frac{-b}{2a}$, gdzie $b = -8$."],
        explanation: "$p = \\frac{8}{2} = 4$.",
        trap: "Minus przy $b$: $p = \\frac{-(-8)}{2} = 4$, a nie $-4$.",
      },
    ],
    sredni: [
      {
        id: "op-s1",
        prompt: "Obwód prostokąta jest równy $20$. Największe możliwe pole takiego prostokąta jest równe:",
        options: { A: "$25$", B: "$20$", C: "$100$", D: "$24$" },
        correct: "A",
        explanation: "$x + y = 10$, $P = x(10 - x)$ – największe dla $x = 5$: $P = 25$.",
      },
      {
        id: "op-s2",
        prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 6x + 10$ jest równa:",
        options: { A: "$1$", B: "$3$", C: "$10$", D: "$-1$" },
        correct: "A",
        explanation: "$p = 3$, $f(3) = 9 - 18 + 10 = 1$.",
      },
      {
        id: "op-s3",
        prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 4x + 1$ w przedziale $\\langle 3, 5 \\rangle$ jest równa:",
        options: { A: "$-2$", B: "$-3$", C: "$6$", D: "$1$" },
        correct: "A",
        explanation: "Wierzchołek $p = 2$ leży poza przedziałem, a funkcja rośnie na $\\langle 3, 5 \\rangle$ – minimum to $f(3) = -2$.",
        trap: "$-3 = f(2)$ to wartość w wierzchołku, ale $x = 2$ nie należy do przedziału.",
      },
    ],
    zaawansowany: [
      {
        id: "op-z1",
        prompt: "Prostokątny wybieg przy ścianie (ściana tworzy jeden bok) ogrodzono siatką o długości $40$ m. Największe możliwe pole wybiegu to:",
        options: { A: "$200 \\text{ m}^2$", B: "$400 \\text{ m}^2$", C: "$100 \\text{ m}^2$", D: "$160 \\text{ m}^2$" },
        correct: "A",
        explanation: "$P(x) = x(40 - 2x)$, wierzchołek w $x = 10$: $P = 10 \\cdot 20 = 200$.",
      },
      {
        id: "op-z2",
        prompt: "Liczby $x$ i $y$ spełniają warunek $x + y = 8$. Najmniejsza wartość wyrażenia $x^2 + y^2$ jest równa:",
        options: { A: "$32$", B: "$64$", C: "$16$", D: "$0$" },
        correct: "A",
        explanation: "$x^2 + (8 - x)^2 = 2x^2 - 16x + 64$, minimum w $x = 4$: $16 + 16 = 32$.",
      },
      {
        id: "op-z3",
        prompt: "Różnica dwóch liczb jest równa $6$. Ich iloczyn jest najmniejszy, gdy mniejsza z tych liczb jest równa:",
        options: { A: "$-3$", B: "$0$", C: "$3$", D: "$-6$" },
        correct: "A",
        explanation: "Liczby $x$ i $x + 6$: $P(x) = x^2 + 6x$, wierzchołek $x = -3$. Liczby $-3$ i $3$ dają iloczyn $-9$.",
        trap: "Liczby nie muszą być dodatnie – iloczyn ujemny jest mniejszy od zera.",
      },
    ],
  },
};

export default content;
