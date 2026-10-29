import type { TopicContent } from "@/types/topic";

// Lekcja 45 – statystyka (dział XII podstawy). Zadania st-p1…st-z2 i st-o1/st-o2 przeniesione bez zmian
// z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Średnia arytmetyczna",
      body:
        "Średnia to suma wszystkich danych podzielona przez ich liczbę: $\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}$.\n\n" +
        "W zadaniach „dopisano liczbę” albo „średnia wzrosła” myśl o SUMIE: średnia razy liczba danych to suma, " +
        "a nowa suma minus stara to dopisana liczba.",
      example: {
        prompt: "Średnia pięciu ocen ucznia jest równa $4$. Uczeń dostał jeszcze szóstkę. Oblicz nową średnią.",
        solution: "Suma pięciu ocen: $5 \\cdot 4 = 20$.\nNowa średnia: $\\frac{20 + 6}{6} = \\frac{13}{3} \\approx 4{,}33$.",
      },
    },
    {
      title: "Średnia ważona",
      body:
        "Gdy dane mają różną wagę (np. sprawdzian liczy się bardziej niż kartkówka), każdą wartość mnożysz przez jej wagę, " +
        "a sumę dzielisz przez sumę wag: $\\bar{x} = \\frac{w_1 x_1 + \\ldots + w_n x_n}{w_1 + \\ldots + w_n}$.\n\n" +
        "Ten sam wzór liczy średnią z tabeli liczebności – wagą jest liczba osób z daną wartością.",
      example: {
        prompt: "Uczeń dostał $5$ ze sprawdzianu (waga $3$), $4$ z kartkówki (waga $2$) i $2$ z odpowiedzi (waga $1$). Oblicz średnią ważoną.",
        solution: "$\\bar{x} = \\frac{3 \\cdot 5 + 2 \\cdot 4 + 1 \\cdot 2}{3 + 2 + 1} = \\frac{25}{6} \\approx 4{,}17$.",
      },
    },
    {
      title: "Mediana",
      body:
        "Mediana to wartość środkowa danych UPORZĄDKOWANYCH od najmniejszej do największej:\n\n" +
        "• nieparzysta liczba danych – dokładnie środkowa liczba,\n\n" +
        "• parzysta liczba danych – średnia dwóch środkowych.\n\n" +
        "Mediana, w przeciwieństwie do średniej, nie reaguje na pojedyncze skrajne wartości.",
      example: {
        prompt: "Wyznacz medianę zestawu $7, 2, 9, 4, 4, 10$.",
        solution: "Po uporządkowaniu: $2, 4, 4, 7, 9, 10$ – sześć liczb.\nMediana: $\\frac{4 + 7}{2} = 5{,}5$.",
      },
    },
    {
      title: "Dominanta i dane w tabeli",
      body:
        "Dominanta to wartość, która występuje najczęściej (może być ich kilka). W tabeli liczebności to wartość z największą liczbą osób.\n\n" +
        "Medianę z tabeli wyznaczysz, licząc osoby narastająco: szukasz numeru środkowego (przy $n$ parzystym – dwóch środkowych).",
      example: {
        prompt:
          "Oceny w klasie: $2$ – 1 osoba, $3$ – 4 osoby, $4$ – 6 osób, $5$ – 3 osoby, $6$ – 1 osoba. Wyznacz dominantę, medianę i średnią.",
        solution:
          "Razem $15$ osób. Dominanta: $4$ (najwięcej osób).\n" +
          "Mediana to $8$. wynik: narastająco $1, 5, 11$ – ósma osoba ma $4$.\n" +
          "Średnia: $\\frac{2 + 12 + 24 + 15 + 6}{15} = \\frac{59}{15} \\approx 3{,}93$.",
      },
    },
    {
      title: "Wariancja i odchylenie standardowe",
      body:
        "Mówią, jak bardzo dane są rozrzucone wokół średniej. Wariancja to średnia kwadratów odchyleń od średniej:\n\n" +
        "$\\sigma^2 = \\frac{(x_1 - \\bar{x})^2 + \\ldots + (x_n - \\bar{x})^2}{n}$, a odchylenie standardowe to jej pierwiastek: $\\sigma = \\sqrt{\\sigma^2}$.\n\n" +
        "Kolejność zawsze ta sama: średnia → odchylenia → kwadraty → ich średnia → pierwiastek.",
      example: {
        prompt: "Oblicz wariancję i odchylenie standardowe zestawu $1, 3, 5, 7$.",
        solution:
          "Średnia: $\\bar{x} = 4$. Kwadraty odchyleń: $9, 1, 1, 9$.\n" +
          "Wariancja: $\\sigma^2 = \\frac{20}{4} = 5$, odchylenie: $\\sigma = \\sqrt{5}$.",
      },
    },
  ],
  formulas: [
    { label: "Średnia arytmetyczna", tex: "\\bar{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}" },
    { label: "Średnia ważona", tex: "\\bar{x} = \\frac{w_1 x_1 + \\ldots + w_n x_n}{w_1 + \\ldots + w_n}" },
    { label: "Mediana (n parzyste)", tex: "Me = \\frac{x_{\\frac{n}{2}} + x_{\\frac{n}{2} + 1}}{2}" },
    { label: "Wariancja", tex: "\\sigma^2 = \\frac{(x_1 - \\bar{x})^2 + \\ldots + (x_n - \\bar{x})^2}{n}" },
    { label: "Odchylenie standardowe", tex: "\\sigma = \\sqrt{\\sigma^2}" },
  ],
  traps: [
    "Mediana wymaga uporządkowania danych – „środkowa” z nieposortowanej listy to zwykle zły wynik.",
    "Przy parzystej liczbie danych mediana to średnia DWÓCH środkowych liczb.",
    "W tabeli liczebności dzielisz przez liczbę wszystkich osób, a nie przez liczbę wierszy tabeli.",
    "Wariancja to jeszcze nie odchylenie standardowe – na końcu trzeba wyciągnąć pierwiastek.",
  ],
  openTasks: [
    {
      id: "st-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Oblicz medianę zestawu danych $8, 3, 5, 10, 1, 7$.",
      answers: ["6"],
      hints: ["Uporządkuj dane. Liczb jest sześć, więc weź średnią dwóch środkowych."],
      solution: [
        { step: "Uporządkowanie: $1, 3, 5, 7, 8, 10$.", points: 1 },
        { step: "Mediana: $\\frac{5 + 7}{2} = 6$.", points: 1 },
      ],
    },
    {
      id: "st-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Uczeń otrzymał oceny: $5, 3, 4, 4, 2, 6$. Oblicz średnią arytmetyczną jego ocen.",
      answers: ["4"],
      hints: ["Ocen jest sześć."],
      solution: [
        { step: "Suma ocen: $5 + 3 + 4 + 4 + 2 + 6 = 24$.", points: 1 },
        { step: "Średnia: $\\frac{24}{6} = 4$.", points: 1 },
      ],
    },
    {
      id: "st-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Średnia arytmetyczna liczb $3, x, 7, 10$ jest równa $6$. Oblicz medianę tego zestawu.",
      answers: ["11/2"],
      hints: ["Najpierw wyznacz $x$ ze średniej."],
      solution: [
        { step: "Równanie: $\\frac{3 + x + 7 + 10}{4} = 6$.", points: 1 },
        { step: "Rozwiązanie: $x = 4$.", points: 1 },
        { step: "Po uporządkowaniu $3, 4, 7, 10$ mediana to $\\frac{4 + 7}{2} = 5{,}5$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "st-p1",
        prompt: "Średnia arytmetyczna liczb $4, 7, 9, 12$ jest równa:",
        options: { A: "$7$", B: "$8$", C: "$9$", D: "$32$" },
        correct: "B",
        hints: ["Dodaj liczby i podziel przez ich liczbę."],
        explanation: "$\\frac{4 + 7 + 9 + 12}{4} = \\frac{32}{4} = 8$.",
      },
      {
        id: "st-p2",
        prompt: "Mediana zestawu danych $3, 8, 1, 6, 5$ jest równa:",
        options: { A: "$5$", B: "$1$", C: "$6$", D: "$4{,}6$" },
        correct: "A",
        hints: ["Najpierw ustaw dane od najmniejszej do największej."],
        explanation: "Po uporządkowaniu: $1, 3, 5, 6, 8$ – środkowa liczba to $5$.",
      },
      {
        id: "st-p3",
        prompt: "Uczeń dostał ocenę $6$ z wagą $3$ i ocenę $3$ z wagą $1$. Jego średnia ważona jest równa:",
        options: { A: "$5{,}25$", B: "$4{,}5$", C: "$5$", D: "$6$" },
        correct: "A",
        hints: ["Każdą ocenę pomnóż przez jej wagę.", "Sumę iloczynów podziel przez sumę wag: $3 + 1 = 4$."],
        explanation: "$\\frac{3 \\cdot 6 + 1 \\cdot 3}{3 + 1} = \\frac{21}{4} = 5{,}25$.",
        trap: "$4{,}5$ to zwykła średnia $6$ i $3$ – bez wag.",
      },
    ],
    sredni: [
      {
        id: "st-s1",
        prompt: "Dominanta zestawu $2, 5, 5, 7, 2, 5, 9$ jest równa:",
        options: { A: "$2$", B: "$5$", C: "$7$", D: "$9$" },
        correct: "B",
        explanation: "Najczęściej (trzy razy) występuje $5$.",
      },
      {
        id: "st-s2",
        prompt: "Mediana zestawu $1, 4, 4, 6, 9, 10$ jest równa:",
        options: { A: "$5$", B: "$4$", C: "$6$", D: "$\\frac{17}{3}$" },
        correct: "A",
        explanation: "Liczb jest sześć – mediana to średnia dwóch środkowych: $\\frac{4 + 6}{2} = 5$.",
      },
      {
        id: "st-s3",
        prompt: "Średnia arytmetyczna liczb $2, 5, x, 9$ jest równa $5$. Wtedy $x$ jest równe:",
        options: { A: "$4$", B: "$5$", C: "$3$", D: "$6$" },
        correct: "A",
        explanation: "Suma musi być równa $4 \\cdot 5 = 20$, więc $x = 20 - 2 - 5 - 9 = 4$.",
      },
    ],
    zaawansowany: [
      {
        id: "st-z1",
        prompt: "Średnia arytmetyczna pięciu liczb jest równa $6$. Po dopisaniu szóstej liczby średnia wzrosła do $7$. Dopisana liczba to:",
        options: { A: "$12$", B: "$7$", C: "$13$", D: "$8$" },
        correct: "A",
        explanation: "Suma pięciu liczb: $30$, sześciu: $42$. Dopisana liczba to $42 - 30 = 12$.",
      },
      {
        id: "st-z2",
        prompt: "Odchylenie standardowe zestawu danych $2, 4, 6$ jest równe:",
        options: { A: "$\\frac{2\\sqrt{6}}{3}$", B: "$\\frac{8}{3}$", C: "$2$", D: "$\\sqrt{8}$" },
        correct: "A",
        explanation: "$\\bar{x} = 4$, $\\sigma^2 = \\frac{4 + 0 + 4}{3} = \\frac{8}{3}$, więc $\\sigma = \\sqrt{\\frac{8}{3}} = \\frac{2\\sqrt{6}}{3}$.",
      },
      {
        id: "st-z3",
        prompt:
          "Wyniki testu w klasie: ocenę $2$ dostały $3$ osoby, ocenę $3$ – $5$ osób, ocenę $4$ – $8$ osób, ocenę $5$ – $4$ osoby. Mediana ocen jest równa:",
        options: { A: "$4$", B: "$3{,}5$", C: "$3$", D: "$8$" },
        correct: "A",
        explanation:
          "Razem $20$ osób – mediana to średnia ocen $10.$ i $11.$ osoby. Narastająco: $3, 8, 16$ – obie mają ocenę $4$, więc mediana to $4$.",
        trap: "$8$ to liczba osób z oceną $4$, a nie ocena. Mediana to zawsze jedna z wartości (albo średnia dwóch).",
      },
    ],
  },
};

export default content;
