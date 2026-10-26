import { sample } from "@/lib/plot";
import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Metoda w trzech krokach",
      body:
        "1. Przenieś wszystko na jedną stronę i znajdź miejsca zerowe (deltą albo z postaci iloczynowej).\n\n2. Naszkicuj parabolę: ramiona w górę, gdy $a > 0$, w dół, gdy $a < 0$.\n\n3. Odczytaj, gdzie wykres leży nad osią $OX$ (znak $>$) lub pod nią (znak $<$).",
    },
    {
      title: "Delta i miejsca zerowe",
      body:
        "$\\Delta = b^2 - 4ac$. Gdy $\\Delta > 0$, są dwa miejsca zerowe; gdy $\\Delta = 0$ – jedno; gdy $\\Delta < 0$ – brak (cała parabola leży nad osią albo pod nią).\n\nJeśli w nierówności brakuje wyrazu wolnego, nie licz delty – wyłącz $x$ przed nawias. I nigdy nie dziel obu stron przez $x$!",
    },
    {
      title: "Przykład z wykresem",
      body: "Parabola $y = x^2 - x - 6$ ma ramiona skierowane w górę i miejsca zerowe $-2$ oraz $3$.",
      example: {
        prompt: "Rozwiąż nierówność $x^2 - x - 6 \\le 0$.",
        solution:
          "$\\Delta = 1 + 24 = 25$, $x_1 = -2$, $x_2 = 3$. Wartości niedodatnie leżą między pierwiastkami: $x \\in \\langle -2, 3 \\rangle$.",
      },
      plot: {
        x: [-4, 5],
        y: [-7, 7],
        lines: [sample((x) => x * x - x - 6, -3.2, 4.2)],
        dots: [{ at: [-2, 0] }, { at: [3, 0] }],
      },
    },
  ],
  formulas: [
    { label: "Wyróżnik", tex: "\\Delta = b^2 - 4ac" },
    { label: "Miejsca zerowe (Δ > 0)", tex: "x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}" },
    { label: "Jedno miejsce zerowe (Δ = 0)", tex: "x_0 = \\frac{-b}{2a}" },
    { label: "Postać iloczynowa", tex: "f(x) = a(x - x_1)(x - x_2)" },
    { label: "Wierzchołek paraboli", tex: "p = \\frac{-b}{2a}, \\quad q = \\frac{-\\Delta}{4a}" },
  ],
  traps: [
    "$\\Delta < 0$ nie oznacza automatycznie zbioru pustego – patrz na ramiona i znak nierówności.",
    "Nie dziel przez $x$ – wyłącz go przed nawias.",
    "Ujemne $a$ odwraca obrazek: ramiona idą w dół.",
  ],
  tests: {
    podstawowy: [
      {
        id: "nk-p1",
        prompt: "Zbiorem rozwiązań nierówności $x^2 - 4 < 0$ jest:",
        options: {
          A: "$(-2, 2)$",
          B: "$(-\\infty, -2) \\cup (2, +\\infty)$",
          C: "$(-4, 4)$",
          D: "$\\langle -2, 2 \\rangle$",
        },
        correct: "A",
        hints: [
          "Miejsca zerowe to $-2$ i $2$, a ramiona paraboli są skierowane w górę.",
          "Ramiona w górę – wykres jest POD osią między miejscami zerowymi. Nierówność ostra, więc nawiasy okrągłe.",
        ],
        explanation: "Parabola z ramionami w górę jest pod osią między miejscami zerowymi: $(-2, 2)$.",
        trap: "„$< 0$” przy ramionach w górę to przedział MIĘDZY pierwiastkami. Suma przedziałów to rozwiązanie dla „$> 0$”.",
      },
      {
        id: "nk-p2",
        prompt: "Zbiorem rozwiązań nierówności $(x - 1)(x - 5) \\ge 0$ jest:",
        options: {
          A: "$(-\\infty, 1\\rangle \\cup \\langle 5, +\\infty)$",
          B: "$\\langle 1, 5 \\rangle$",
          C: "$(1, 5)$",
          D: "$(-\\infty, -5\\rangle \\cup \\langle -1, +\\infty)$",
        },
        correct: "A",
        hints: [
          "Miejsca zerowe odczytasz od razu: $1$ i $5$. Gdzie parabola z ramionami w górę jest nad osią?",
          "Szukasz miejsc nad osią lub na niej ($\\ge$) – to dwa kawałki na zewnątrz, z domkniętymi końcami.",
        ],
        explanation: "Nad osią (lub na niej) poza przedziałem między pierwiastkami, z końcami włącznie.",
        trap: "$(x - 1)(x - 5)$ ma pierwiastki $1$ i $5$, a nie $-1$ i $-5$. Znak się odwraca!",
      },
      {
        id: "nk-p3",
        prompt: "Wyróżnik $\\Delta$ trójmianu $x^2 + 4x + 5$ jest równy:",
        options: { A: "$-4$", B: "$36$", C: "$4$", D: "$21$" },
        correct: "A",
        hints: [
          "$\\Delta = b^2 - 4ac$, gdzie $a = 1$, $b = 4$, $c = 5$.",
          "$\\Delta = 4^2 - 4 \\cdot 1 \\cdot 5$.",
        ],
        explanation: "$\\Delta = 16 - 20 = -4$.",
        trap: "$b^2 = 16$, a $4ac = 20$. Kolejność odejmowania ma znaczenie – $\\Delta$ może wyjść ujemna.",
      },
    ],
    sredni: [
      {
        id: "nk-s1",
        prompt: "Zbiorem rozwiązań nierówności $x^2 - x - 6 \\le 0$ jest:",
        options: {
          A: "$\\langle -2, 3 \\rangle$",
          B: "$\\langle -3, 2 \\rangle$",
          C: "$(-\\infty, -2\\rangle \\cup \\langle 3, +\\infty)$",
          D: "$(-2, 3)$",
        },
        correct: "A",
        explanation: "$\\Delta = 25$, $x_1 = -2$, $x_2 = 3$; ramiona w górę, więc między pierwiastkami (z końcami).",
      },
      {
        id: "nk-s2",
        prompt: "Zbiorem rozwiązań nierówności $x^2 > 3x$ jest:",
        options: {
          A: "$(-\\infty, 0) \\cup (3, +\\infty)$",
          B: "$(3, +\\infty)$",
          C: "$(0, 3)$",
          D: "$(-\\infty, 3)$",
        },
        correct: "A",
        explanation: "$x^2 - 3x > 0 \\Rightarrow x(x - 3) > 0$. Nie dzielimy przez $x$ – tracilibyśmy rozwiązania ujemne.",
        trap: "Nie dziel przez $x$! Nie wiesz, czy jest dodatni – zgubisz połowę rozwiązań. Wyłącz $x$ przed nawias.",
      },
      {
        id: "nk-s3",
        prompt: "Zbiorem rozwiązań nierówności $-x^2 + 2x + 8 > 0$ jest:",
        options: {
          A: "$(-2, 4)$",
          B: "$(-\\infty, -2) \\cup (4, +\\infty)$",
          C: "$(-4, 2)$",
          D: "$\\langle -2, 4 \\rangle$",
        },
        correct: "A",
        explanation: "Miejsca zerowe: $-2$ i $4$. Ramiona w dół, więc nad osią między pierwiastkami.",
        trap: "Współczynnik przy $x^2$ jest ujemny – ramiona w dół, więc „$> 0$” to przedział MIĘDZY pierwiastkami.",
      },
    ],
    zaawansowany: [
      {
        id: "nk-z1",
        prompt: "Nierówność $x^2 + 6x + 9 \\le 0$ spełnia:",
        options: {
          A: "tylko liczba $-3$",
          B: "każda liczba rzeczywista",
          C: "żadna liczba rzeczywista",
          D: "tylko liczba $3$",
        },
        correct: "A",
        explanation: "$(x + 3)^2 \\le 0$ – kwadrat nie jest ujemny, więc musi być równy zero: $x = -3$.",
        trap: "Kwadrat nigdy nie jest ujemny. $(x + 3)^2 \\le 0$ działa tylko wtedy, gdy kwadrat jest równy zero.",
      },
      {
        id: "nk-z2",
        prompt: "Zbiorem rozwiązań nierówności $x^2 + x + 1 > 0$ jest:",
        options: { A: "$\\mathbb{R}$", B: "$\\emptyset$", C: "$(-1, 0)$", D: "$(0, +\\infty)$" },
        correct: "A",
        explanation: "$\\Delta = -3 < 0$ i ramiona w górę – cała parabola leży nad osią.",
        trap: "$\\Delta < 0$ nie znaczy „brak rozwiązań”! Przy ramionach w górę cała parabola jest nad osią – „$> 0$” spełnia KAŻDA liczba.",
      },
      {
        id: "nk-z3",
        prompt: "Ile liczb całkowitych spełnia nierówność $2x^2 - 7x + 3 < 0$?",
        options: { A: "$1$", B: "$2$", C: "$3$", D: "$4$" },
        correct: "B",
        explanation: "$\\Delta = 25$, pierwiastki $\\frac{1}{2}$ i $3$. W przedziale $\\left(\\frac{1}{2}, 3\\right)$ leżą liczby $1$ i $2$.",
      },
    ],
  },
};

export default content;
