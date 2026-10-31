import { sample } from "@/lib/plot";
import type { TopicContent } from "@/types/topic";

// Lekcja 16 – funkcja kwadratowa (dział V podstawy). Zadania fk-p1…fk-z2 i fk-o1/fk-o2 przeniesione bez zmian
// z dawnego zestawu w src/data/practice – te same id (klucze odpowiedzi, Pudełko porażek, arkusze próbne).
const content: TopicContent = {
  theory: [
    {
      title: "Parabola – zacznij od liczby przy $x^2$",
      body:
        "Wykres funkcji kwadratowej to parabola – symetryczna krzywa jak tor rzuconej piłki. Zanim zaczniesz cokolwiek liczyć, " +
        "spójrz na współczynnik $a$ przy $x^2$. To on decyduje o kształcie:\n\n" +
        "• $a > 0$ – ramiona w górę, funkcja ma wartość najmniejszą (na dole paraboli),\n\n" +
        "• $a < 0$ – ramiona w dół, funkcja ma wartość największą (na górze),\n\n" +
        "• im większe $|a|$, tym węższa parabola.\n\n" +
        "Na wykresie: $y = x^2$ (ramiona w górę) i $y = -\\frac{1}{2}x^2$ (ramiona w dół, szersza). " +
        "Ta jedna obserwacja mówi, czy szukasz minimum, czy maksimum, i daje szkic, z którym porównasz wynik.",
      plot: {
        x: [-3, 3],
        y: [-4, 5],
        lines: [sample((x) => x * x, -2.2, 2.2), sample((x) => -0.5 * x * x, -2.8, 2.8)],
        dots: [{ at: [0, 0] }],
      },
      check: {
        id: "fk-t1",
        prompt: "Która funkcja ma wykres o ramionach skierowanych w dół?",
        options: { A: "$f(x) = 3 - 2x^2$", B: "$f(x) = -2 + 3x^2$", C: "$f(x) = x^2 - 5x$", D: "$f(x) = (x - 4)^2$" },
        correct: "A",
        explanation:
          "Liczy się tylko współczynnik przy $x^2$: w $3 - 2x^2$ jest to $a = -2 < 0$. W pozostałych funkcjach $a > 0$ – minusy przy innych wyrazach nie zmieniają kierunku ramion.",
        trap: "Minus na początku wzoru (np. $-2 + 3x^2$) nie odwraca paraboli – patrz wyłącznie na liczbę przy $x^2$.",
      },
    },
    {
      title: "Trzy postaci – trzy różne informacje",
      body:
        "Tę samą funkcję kwadratową można zapisać na trzy sposoby. Każdy od razu coś mówi:\n\n" +
        "• ogólna $f(x) = ax^2 + bx + c$ – liczba $c$ to punkt przecięcia z osią $OY$, czyli $(0, c)$,\n\n" +
        "• kanoniczna $f(x) = a(x - p)^2 + q$ – wierzchołek paraboli $W = (p, q)$,\n\n" +
        "• iloczynowa $f(x) = a(x - x_1)(x - x_2)$ – miejsca zerowe $x_1$ i $x_2$.\n\n" +
        "Współczynnik $a$ jest we wszystkich postaciach ten sam. W nawiasach znak się odwraca: $(x + 5)$ oznacza liczbę $-5$. " +
        "W zadaniu wybierz postać, z której odczytasz to, o co pytają – często wystarczy przejść z jednej do drugiej.",
      example: {
        prompt: "Zapisz funkcję $f(x) = x^2 - 4x + 3$ w postaci kanonicznej i iloczynowej.",
        solution:
          "Kanoniczna: $p = \\frac{4}{2} = 2$, $q = f(2) = 4 - 8 + 3 = -1$, więc $f(x) = (x - 2)^2 - 1$.\n" +
          "Iloczynowa: $\\Delta = 16 - 12 = 4$, $x_1 = 1$, $x_2 = 3$, więc $f(x) = (x - 1)(x - 3)$.\n" +
          "Na wykresie widać wszystkie trzy informacje: $(0, 3)$ na osi $OY$, wierzchołek $(2, -1)$ i miejsca zerowe $1$ oraz $3$.",
      },
      plot: {
        x: [-1, 5],
        y: [-2, 6],
        lines: [sample((x) => x * x - 4 * x + 3, -0.6, 4.6)],
        dots: [{ at: [0, 3] }, { at: [1, 0] }, { at: [3, 0] }, { at: [2, -1] }],
      },
      check: {
        id: "fk-t2",
        prompt: "Dana jest funkcja $f(x) = -3(x - 2)(x + 5)$. Które zdanie jest prawdziwe?",
        options: {
          A: "Miejscami zerowymi są $2$ i $-5$.",
          B: "Miejscami zerowymi są $-2$ i $5$.",
          C: "Ramiona paraboli są skierowane w górę.",
          D: "Wierzchołkiem paraboli jest $(2, -5)$.",
        },
        correct: "A",
        explanation:
          "To postać iloczynowa: $x - 2 = 0$ daje $x = 2$, a $x + 5 = 0$ daje $x = -5$. Współczynnik $a = -3 < 0$, więc ramiona idą w dół. Wierzchołka z tej postaci nie odczytasz wprost.",
        trap: "Znak w nawiasie się odwraca: $(x + 5)$ to miejsce zerowe $-5$, a nie $5$.",
      },
    },
    {
      title: "Wierzchołek i oś symetrii",
      body:
        "Parabola jest symetryczna względem pionowej prostej $x = p$ przechodzącej przez wierzchołek. " +
        "Pierwsza współrzędna wierzchołka: $p = \\frac{-b}{2a}$. Drugą najprościej policzyć, podstawiając: $q = f(p)$ " +
        "(wzór $q = \\frac{-\\Delta}{4a}$ daje to samo, ale łatwiej w nim o pomyłkę w znakach).\n\n" +
        "Skrót z symetrii: wierzchołek leży dokładnie w połowie między miejscami zerowymi, więc $p = \\frac{x_1 + x_2}{2}$.\n\n" +
        "W wierzchołku funkcja ma wartość najmniejszą (ramiona w górę) albo największą (ramiona w dół) – i ta wartość to $q$.",
      example: {
        prompt: "Wyznacz wierzchołek paraboli $f(x) = -2x^2 + 8x - 5$ i największą wartość funkcji.",
        solution:
          "$a = -2$, $b = 8$, więc $p = \\frac{-8}{2 \\cdot (-2)} = 2$.\n" +
          "$q = f(2) = -2 \\cdot 4 + 16 - 5 = 3$, więc $W = (2, 3)$.\n" +
          "Ramiona w dół ($a < 0$), więc największa wartość funkcji to $3$.",
      },
      plot: {
        x: [-0.5, 4.5],
        y: [-6, 4],
        lines: [sample((x) => -2 * x * x + 8 * x - 5, -0.1, 4.1)],
        guides: [
          [
            [2, -6],
            [2, 4],
          ],
        ],
        dots: [{ at: [2, 3] }],
      },
      check: {
        id: "fk-t3",
        prompt: "Miejscami zerowymi funkcji kwadratowej są liczby $-1$ i $7$. Pierwsza współrzędna wierzchołka jej wykresu jest równa:",
        options: { A: "$3$", B: "$4$", C: "$-3$", D: "$6$" },
        correct: "A",
        explanation: "Wierzchołek leży w połowie między miejscami zerowymi: $p = \\frac{-1 + 7}{2} = 3$.",
        trap: "$4$ to połowa odległości między miejscami zerowymi ($\\frac{7 - (-1)}{2}$), a nie środek. Środek to średnia: $\\frac{x_1 + x_2}{2}$.",
      },
    },
    {
      title: "Miejsca zerowe i delta",
      body:
        "Miejsce zerowe to punkt, w którym parabola spotyka oś $OX$. Wyróżnik $\\Delta = b^2 - 4ac$ mówi, ile jest takich punktów, " +
        "zanim cokolwiek policzysz:\n\n" +
        "• $\\Delta > 0$ – dwa miejsca zerowe $x_{1,2} = \\frac{-b \\mp \\sqrt{\\Delta}}{2a}$,\n\n" +
        "• $\\Delta = 0$ – jedno: $x_0 = \\frac{-b}{2a}$ (wierzchołek leży na osi $OX$),\n\n" +
        "• $\\Delta < 0$ – brak (parabola nie dotyka osi $OX$, postaci iloczynowej nie ma).\n\n" +
        "Na wykresie ta sama parabola na trzech wysokościach: przecina oś $OX$ dwa razy, dotyka jej albo leży nad nią.\n\n" +
        "Gdy brakuje $b$ albo $c$, delta nie jest potrzebna: $x^2 - 9 = 0 \\Rightarrow x = \\pm 3$, " +
        "a $x^2 - 5x = 0 \\Rightarrow x(x - 5) = 0$, czyli $x = 0$ lub $x = 5$.",
      example: {
        prompt: "Wyznacz miejsca zerowe funkcji $f(x) = x^2 + 2x - 8$.",
        solution:
          "$a = 1$, $b = 2$, $c = -8$.\n" +
          "$\\Delta = 2^2 - 4 \\cdot 1 \\cdot (-8) = 36$, $\\sqrt{\\Delta} = 6$.\n" +
          "$x_1 = \\frac{-2 - 6}{2} = -4$, $x_2 = \\frac{-2 + 6}{2} = 2$.\n" +
          "Sprawdzenie: $f(2) = 4 + 4 - 8 = 0$.",
      },
      plot: {
        x: [-2, 4],
        y: [-3, 5],
        lines: [
          sample((x) => (x - 1) ** 2 - 2, -1.4, 3.4),
          sample((x) => (x - 1) ** 2, -1.2, 3.2),
          sample((x) => (x - 1) ** 2 + 1.5, -0.85, 2.85),
        ],
        dots: [{ at: [1 - Math.SQRT2, 0] }, { at: [1 + Math.SQRT2, 0] }, { at: [1, 0] }],
      },
      check: {
        id: "fk-t4",
        prompt: "Funkcja $f(x) = 2x^2 - 4x + 3$:",
        options: {
          A: "nie ma miejsc zerowych",
          B: "ma jedno miejsce zerowe",
          C: "ma miejsca zerowe $\\frac{1}{2}$ i $\\frac{3}{2}$",
          D: "ma miejsca zerowe $1$ i $3$",
        },
        correct: "A",
        explanation:
          "$\\Delta = (-4)^2 - 4 \\cdot 2 \\cdot 3 = 16 - 24 = -8 < 0$, więc miejsc zerowych nie ma. Zgadza się to z wykresem: wierzchołek $(1, 1)$ leży nad osią $OX$, a ramiona idą w górę.",
        trap: "Pamiętaj o $a = 2$ w iloczynie $4ac$: $4 \\cdot 2 \\cdot 3 = 24$, a nie $12$. Z błędną deltą $4$ wychodzą „miejsca zerowe” $\\frac{1}{2}$ i $\\frac{3}{2}$.",
      },
    },
    {
      title: "Wzór funkcji z podanych informacji",
      body:
        "Częste zadanie maturalne: wyznacz wzór funkcji, znając kilka jej cech. Wybierz postać pasującą do danych – " +
        "wtedy zostaje jedna niewiadoma, liczba $a$:\n\n" +
        "• znasz wierzchołek $(p, q)$ → $f(x) = a(x - p)^2 + q$,\n\n" +
        "• znasz miejsca zerowe $x_1$ i $x_2$ → $f(x) = a(x - x_1)(x - x_2)$.\n\n" +
        "Liczbę $a$ wyznaczasz, podstawiając jeszcze jeden punkt wykresu. Na koniec, jeśli zadanie tego wymaga, " +
        "wymnóż nawiasy do postaci ogólnej.",
      example: {
        prompt: "Wierzchołkiem paraboli jest $W = (1, -8)$, a wykres przechodzi przez punkt $(3, 0)$. Wyznacz wzór funkcji w postaci ogólnej.",
        solution:
          "Znamy wierzchołek, więc $f(x) = a(x - 1)^2 - 8$.\n" +
          "Podstawiamy punkt $(3, 0)$: $0 = a \\cdot (3 - 1)^2 - 8$.\n" +
          "Stąd $4a = 8$, czyli $a = 2$.\n" +
          "Wymnażamy: $f(x) = 2(x^2 - 2x + 1) - 8$\n" +
          "$f(x) = 2x^2 - 4x - 6$.",
      },
      check: {
        id: "fk-t5",
        prompt: "Miejscami zerowymi funkcji kwadratowej są $-2$ i $4$, a jej wykres przecina oś $OY$ w punkcie $(0, 8)$. Ta funkcja to:",
        options: {
          A: "$f(x) = -(x + 2)(x - 4)$",
          B: "$f(x) = (x + 2)(x - 4)$",
          C: "$f(x) = -(x - 2)(x + 4)$",
          D: "$f(x) = 8(x + 2)(x - 4)$",
        },
        correct: "A",
        explanation:
          "Z miejsc zerowych: $f(x) = a(x + 2)(x - 4)$. Podstawiamy $(0, 8)$: $8 = a \\cdot 2 \\cdot (-4) = -8a$, więc $a = -1$.",
        trap: "Punkt $(0, 8)$ nie oznacza, że $a = 8$ – liczbę $a$ trzeba wyliczyć, podstawiając ten punkt do wzoru.",
      },
    },
    {
      title: "Zbiór wartości i monotoniczność",
      body:
        "Wszystko odczytasz z wierzchołka $W = (p, q)$ i kierunku ramion:\n\n" +
        "• $a > 0$: zbiór wartości $\\langle q, +\\infty)$, funkcja maleje w $(-\\infty, p\\rangle$ i rośnie w $\\langle p, +\\infty)$,\n\n" +
        "• $a < 0$: zbiór wartości $(-\\infty, q\\rangle$, funkcja rośnie w $(-\\infty, p\\rangle$ i maleje w $\\langle p, +\\infty)$.\n\n" +
        "Zbiór wartości dotyczy osi $OY$ (liczba $q$), a monotoniczność – osi $OX$ (liczba $p$). To najczęstsze pomylenie: " +
        "pytają o wartości – patrz w pionie, pytają, gdzie rośnie – patrz w poziomie.",
      example: {
        prompt: "Podaj zbiór wartości i przedziały monotoniczności funkcji $f(x) = (x + 1)^2 - 4$.",
        solution:
          "Wierzchołek $W = (-1, -4)$, $a = 1 > 0$ – ramiona w górę.\n" +
          "Zbiór wartości: $\\langle -4, +\\infty)$.\n" +
          "Funkcja maleje w $(-\\infty, -1\\rangle$, rośnie w $\\langle -1, +\\infty)$.",
      },
      plot: {
        x: [-4.5, 2.5],
        y: [-5, 4],
        lines: [sample((x) => (x + 1) ** 2 - 4, -3.9, 1.9)],
        dots: [{ at: [-1, -4] }],
      },
      check: {
        id: "fk-t6",
        prompt: "Funkcja $f(x) = -(x - 2)^2 + 3$ jest rosnąca w przedziale:",
        options: {
          A: "$(-\\infty, 2\\rangle$",
          B: "$\\langle 2, +\\infty)$",
          C: "$(-\\infty, 3\\rangle$",
          D: "$\\langle 3, +\\infty)$",
        },
        correct: "A",
        explanation:
          "Wierzchołek $W = (2, 3)$, ramiona w dół ($a = -1$): funkcja rośnie aż do wierzchołka, czyli w $(-\\infty, 2\\rangle$, a potem maleje.",
        trap: "Monotoniczność to przedziały na osi $OX$ – wyznaczasz je z $p = 2$, nie z $q = 3$.",
      },
    },
    {
      title: "Wartość najmniejsza i największa w przedziale",
      body:
        "Gdy zadanie ogranicza $x$ do przedziału $\\langle m, n \\rangle$, z paraboli zostaje tylko kawałek – " +
        "najmniejsza i największa wartość mogą leżeć na jego końcach. Postępuj zawsze tak samo:\n\n" +
        "1. Policz $p$ i sprawdź, czy $p \\in \\langle m, n \\rangle$.\n\n" +
        "2. Policz $f(m)$, $f(n)$ i – tylko gdy $p$ leży w przedziale – $f(p)$.\n\n" +
        "3. Najmniejsza z tych liczb to wartość najmniejsza, a największa – wartość największa.",
      example: {
        prompt: "Wyznacz najmniejszą i największą wartość funkcji $f(x) = x^2 - 6x + 5$ w przedziale $\\langle 0, 4 \\rangle$.",
        solution:
          "Wierzchołek: $p = \\frac{6}{2} = 3 \\in \\langle 0, 4 \\rangle$, $f(3) = 9 - 18 + 5 = -4$.\n" +
          "Końce: $f(0) = 5$, $f(4) = 16 - 24 + 5 = -3$.\n" +
          "Najmniejsza wartość: $-4$, największa: $5$.",
      },
      plot: {
        x: [-1, 7],
        y: [-5, 7],
        lines: [sample((x) => x * x - 6 * x + 5, -0.3, 6.3)],
        guides: [
          [
            [4, -5],
            [4, 7],
          ],
        ],
        dots: [{ at: [0, 5] }, { at: [4, -3] }, { at: [3, -4] }],
      },
      check: {
        id: "fk-t7",
        prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 2x$ w przedziale $\\langle 2, 5 \\rangle$ jest równa:",
        options: { A: "$0$", B: "$-1$", C: "$15$", D: "$1$" },
        correct: "A",
        explanation:
          "$p = 1$ nie należy do przedziału $\\langle 2, 5 \\rangle$, więc wierzchołka nie bierzemy. $f(2) = 0$, $f(5) = 15$ – najmniejsza wartość to $0$.",
        trap: "$-1$ to wartość w wierzchołku, ale wierzchołek ($x = 1$) leży poza przedziałem.",
      },
    },
  ],
  formulas: [
    { label: "Postać ogólna", tex: "f(x) = ax^2 + bx + c" },
    { label: "Postać kanoniczna", tex: "f(x) = a(x - p)^2 + q" },
    { label: "Wierzchołek paraboli", tex: "p = \\frac{-b}{2a}, \\quad q = \\frac{-\\Delta}{4a}" },
    { label: "Wierzchołek z miejsc zerowych", tex: "p = \\frac{x_1 + x_2}{2}" },
    { label: "Postać iloczynowa", tex: "f(x) = a(x - x_1)(x - x_2)" },
    { label: "Wyróżnik", tex: "\\Delta = b^2 - 4ac" },
    { label: "Miejsca zerowe (Δ > 0)", tex: "x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}" },
    { label: "Wzory Viète'a", tex: "x_1 + x_2 = \\frac{-b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}" },
  ],
  traps: [
    "W postaci $a(x - p)^2 + q$ znak przy $p$ się odwraca: $(x + 3)^2$ oznacza $p = -3$.",
    "Zbiór wartości czytasz z $q$ (oś $OY$), a monotoniczność z $p$ (oś $OX$) – nie zamieniaj ich.",
    "Najmniejsza wartość w przedziale nie zawsze jest w wierzchołku – sprawdź, czy $p$ leży w przedziale, i porównaj końce.",
    "Kwadrat liczby ujemnej jest dodatni: przy $b = -4$ w delcie jest $(-4)^2 = 16$, a nie $-16$.",
    "Liczba $a$ to nie wyraz wolny ani współrzędna podanego punktu – wylicz ją, podstawiając punkt do wzoru.",
    "Przy $a < 0$ wszystko się odwraca: zbiór wartości $(-\\infty, q\\rangle$, a funkcja najpierw rośnie.",
  ],
  openTasks: [
    {
      id: "fk-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Wyznacz miejsca zerowe funkcji $f(x) = x^2 - 2x - 15$.",
      answers: ["-3;5"],
      answerLabel: "x =",
      hints: ["Policz $\\Delta = b^2 - 4ac$ dla $a = 1$, $b = -2$, $c = -15$."],
      solution: [
        { step: "Wyróżnik: $\\Delta = 4 + 60 = 64$, $\\sqrt{\\Delta} = 8$.", points: 1 },
        { step: "Miejsca zerowe: $x_1 = \\frac{2 - 8}{2} = -3$, $x_2 = \\frac{2 + 8}{2} = 5$.", points: 1 },
      ],
    },
    {
      id: "fk-o1",
      difficulty: "sredni",
      points: 3,
      prompt: "Wyznacz zbiór wartości funkcji $f(x) = 2x^2 - 12x + 13$. Podaj najmniejszą wartość tej funkcji.",
      answers: ["-5"],
      hints: ["Ramiona są skierowane w górę, więc najmniejsza wartość jest w wierzchołku."],
      solution: [
        { step: "Pierwsza współrzędna wierzchołka: $p = \\frac{12}{4} = 3$.", points: 1 },
        { step: "Najmniejsza wartość: $q = f(3) = 18 - 36 + 13 = -5$.", points: 1 },
        { step: "Zbiór wartości: $\\langle -5, +\\infty)$ (ramiona w górę).", points: 1 },
      ],
    },
    {
      id: "fk-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Funkcja kwadratowa $f(x) = a(x + 2)(x - 4)$ ma wykres przechodzący przez punkt $(0, -16)$. Oblicz $a$.",
      answers: ["2"],
      answerLabel: "a =",
      hints: ["Podstaw $x = 0$ i $f(0) = -16$."],
      solution: [
        { step: "Podstawienie punktu: $f(0) = a \\cdot 2 \\cdot (-4)$.", points: 1 },
        { step: "Równanie: $-8a = -16$.", points: 1 },
        { step: "Wynik: $a = 2$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "fk-p1",
        prompt: "Wierzchołkiem paraboli $y = (x + 3)^2 - 5$ jest punkt:",
        options: { A: "$(-3, -5)$", B: "$(3, -5)$", C: "$(-3, 5)$", D: "$(3, 5)$" },
        correct: "A",
        hints: ["W postaci $a(x - p)^2 + q$ wierzchołek to $(p, q)$."],
        explanation: "$y = (x - (-3))^2 + (-5)$, więc wierzchołek to $(-3, -5)$.",
      },
      {
        id: "fk-p2",
        prompt: "Miejscami zerowymi funkcji $f(x) = (x - 1)(x + 6)$ są liczby:",
        options: { A: "$1$ i $-6$", B: "$-1$ i $6$", C: "$1$ i $6$", D: "$-1$ i $-6$" },
        correct: "A",
        hints: ["Przyrównaj każdy nawias do zera."],
        explanation: "Iloczyn jest zerem, gdy $x = 1$ lub $x = -6$.",
      },
      {
        id: "fk-p3",
        prompt: "Wykres funkcji $f(x) = x^2 - 6x + 5$ przecina oś $OY$ w punkcie:",
        options: { A: "$(0, 5)$", B: "$(5, 0)$", C: "$(0, -6)$", D: "$(1, 0)$" },
        correct: "A",
        hints: ["Na osi $OY$ jest $x = 0$.", "Policz $f(0)$ – zostaje sam wyraz wolny $c$."],
        explanation: "$f(0) = 0 - 0 + 5 = 5$, więc punkt przecięcia z osią $OY$ to $(0, 5)$.",
        trap: "$(5, 0)$ i $(1, 0)$ leżą na osi $OX$ – to miejsca zerowe, a nie punkt na osi $OY$.",
      },
    ],
    sredni: [
      {
        id: "fk-s1",
        prompt: "Osią symetrii wykresu funkcji $f(x) = 2x^2 - 8x + 1$ jest prosta:",
        options: { A: "$x = 2$", B: "$x = -2$", C: "$x = 4$", D: "$x = 8$" },
        correct: "A",
        explanation: "$p = \\frac{8}{4} = 2$.",
      },
      {
        id: "fk-s2",
        prompt: "Największa wartość funkcji $f(x) = -x^2 + 6x - 5$ jest równa:",
        options: { A: "$4$", B: "$3$", C: "$-5$", D: "$9$" },
        correct: "A",
        explanation: "$p = 3$, a $f(3) = -9 + 18 - 5 = 4$.",
      },
      {
        id: "fk-s3",
        prompt: "Zbiorem wartości funkcji $f(x) = -2(x - 1)^2 + 5$ jest przedział:",
        options: {
          A: "$(-\\infty, 5\\rangle$",
          B: "$\\langle 5, +\\infty)$",
          C: "$(-\\infty, 1\\rangle$",
          D: "$\\langle -2, +\\infty)$",
        },
        correct: "A",
        explanation: "Wierzchołek $W = (1, 5)$, ramiona w dół ($a = -2$), więc największa wartość to $5$: $(-\\infty, 5\\rangle$.",
        trap: "Ramiona w dół – wartości są POD wierzchołkiem. A $1$ to $p$, które mówi o monotoniczności, nie o wartościach.",
      },
    ],
    zaawansowany: [
      {
        id: "fk-z1",
        prompt: "Najmniejsza wartość funkcji $f(x) = x^2 - 4x + 7$ w przedziale $\\langle 0, 3 \\rangle$ jest równa:",
        options: { A: "$3$", B: "$7$", C: "$4$", D: "$2$" },
        correct: "A",
        explanation: "Wierzchołek $p = 2$ leży w przedziale, więc minimum to $f(2) = 3$.",
      },
      {
        id: "fk-z2",
        prompt: "Postać kanoniczna funkcji $f(x) = x^2 + 2x - 3$ to:",
        options: { A: "$f(x) = (x + 1)^2 - 4$", B: "$f(x) = (x - 1)^2 - 4$", C: "$f(x) = (x + 1)^2 - 3$", D: "$f(x) = (x + 2)^2 - 7$" },
        correct: "A",
        explanation: "$p = -1$, $q = f(-1) = 1 - 2 - 3 = -4$.",
      },
      {
        id: "fk-z3",
        prompt:
          "Funkcja $f(x) = x^2 + bx + 3$ jest malejąca w przedziale $(-\\infty, 2\\rangle$ i rosnąca w przedziale $\\langle 2, +\\infty)$. Wtedy:",
        options: { A: "$b = -4$", B: "$b = 4$", C: "$b = -2$", D: "$b = 2$" },
        correct: "A",
        explanation: "Monotoniczność zmienia się w wierzchołku, więc $p = \\frac{-b}{2} = 2$, czyli $b = -4$.",
        trap: "Z $p = \\frac{-b}{2a}$ wychodzi $b = -2ap$ – minus łatwo zgubić i zaznaczyć $b = 4$.",
      },
    ],
  },
};

export default content;
