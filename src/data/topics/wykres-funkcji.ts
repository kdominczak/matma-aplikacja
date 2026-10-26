import type { Plot } from "@/types/plot";
import type { TopicContent } from "@/types/topic";

// Jedna funkcja do wszystkich zadań: dziedzina ⟨-4, 5⟩, zbiór wartości ⟨-2, 2⟩,
// miejsca zerowe -3, 2, 4, stała na ⟨-2, 1⟩.
const f: Plot = {
  x: [-5, 6],
  y: [-3, 3],
  lines: [[[-4, -2], [-2, 2], [1, 2], [3, -2], [5, 2]]],
  dots: [{ at: [-4, -2] }, { at: [5, 2] }],
};

const PROMPT = "Na rysunku przedstawiono wykres funkcji $f$.";

const content: TopicContent = {
  theory: [
    {
      title: "Dziedzina i zbiór wartości",
      body:
        "Dziedzinę odczytujemy z osi $OX$ – od skrajnego lewego do skrajnego prawego punktu wykresu. Zbiór wartości odczytujemy z osi $OY$ – od najniższego do najwyższego punktu.\n\nPełne kółko oznacza, że punkt należy do wykresu (nawias ostry), puste – że nie należy (nawias okrągły).",
      plot: f,
    },
    {
      title: "Miejsca zerowe i znak funkcji",
      body:
        "Miejsca zerowe to argumenty, dla których wykres przecina oś $OX$. Funkcja jest dodatnia tam, gdzie wykres leży nad osią, a ujemna – pod osią.\n\nNa wykresie obok: miejsca zerowe to $-3$, $2$ i $4$.",
    },
    {
      title: "Monotoniczność i wartości ekstremalne",
      body:
        "Funkcja rośnie, gdy wykres (czytany od lewej) idzie w górę, maleje – gdy idzie w dół, jest stała – gdy biegnie poziomo.\n\nPrzedziały monotoniczności podajemy zawsze dla argumentów $x$, nie dla wartości $y$!",
      example: {
        prompt: "Podaj przedziały monotoniczności funkcji z wykresu.",
        solution:
          "Rosnąca na $\\langle -4, -2 \\rangle$ i $\\langle 3, 5 \\rangle$, stała na $\\langle -2, 1 \\rangle$, malejąca na $\\langle 1, 3 \\rangle$.",
      },
    },
  ],
  formulas: [
    { label: "Miejsce zerowe", tex: "f(x_0) = 0" },
    { label: "Funkcja rosnąca", tex: "x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)" },
    { label: "Funkcja malejąca", tex: "x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)" },
    { label: "Punkt wykresu", tex: "(x, y) \\in \\text{wykres } f \\iff y = f(x)" },
  ],
  tests: {
    podstawowy: [
      {
        id: "wf-p1",
        prompt: `${PROMPT} Wartość $f(0)$ jest równa:`,
        figure: f,
        options: { A: "$2$", B: "$0$", C: "$-3$", D: "$1$" },
        correct: "A",
        hint: "Znajdź punkt wykresu leżący na osi $OY$, czyli dla $x = 0$.",
        explanation: "Dla $x = 0$ wykres jest na wysokości $y = 2$.",
      },
      {
        id: "wf-p2",
        prompt: `${PROMPT} Dziedziną funkcji $f$ jest:`,
        figure: f,
        options: {
          A: "$\\langle -4, 5 \\rangle$",
          B: "$\\langle -2, 2 \\rangle$",
          C: "$(-4, 5)$",
          D: "$\\langle -3, 4 \\rangle$",
        },
        correct: "A",
        hint: "Dziedzinę odczytujesz z osi $OX$. Kółka na końcach są pełne.",
        explanation: "Wykres zaczyna się w $x = -4$ i kończy w $x = 5$; oba końce należą do wykresu.",
      },
      {
        id: "wf-p3",
        prompt: `${PROMPT} Ile miejsc zerowych ma funkcja $f$?`,
        figure: f,
        options: { A: "$3$", B: "$2$", C: "$1$", D: "$4$" },
        correct: "A",
        hint: "Policz, ile razy wykres przecina oś $OX$.",
        explanation: "Wykres przecina oś $OX$ w punktach $-3$, $2$ i $4$.",
      },
    ],
    sredni: [
      {
        id: "wf-s1",
        prompt: `${PROMPT} Zbiorem wartości funkcji $f$ jest:`,
        figure: f,
        options: {
          A: "$\\langle -2, 2 \\rangle$",
          B: "$\\langle -4, 5 \\rangle$",
          C: "$\\langle -3, 4 \\rangle$",
          D: "$\\langle 0, 2 \\rangle$",
        },
        correct: "A",
        explanation: "Najniżej wykres schodzi do $y = -2$, najwyżej sięga $y = 2$.",
      },
      {
        id: "wf-s2",
        prompt: `${PROMPT} Funkcja $f$ jest malejąca w przedziale:`,
        figure: f,
        options: {
          A: "$\\langle 1, 3 \\rangle$",
          B: "$\\langle -2, 1 \\rangle$",
          C: "$\\langle -4, -2 \\rangle$",
          D: "$\\langle -2, 2 \\rangle$",
        },
        correct: "A",
        explanation: "Między $x = 1$ a $x = 3$ wykres opada z $2$ do $-2$.",
      },
      {
        id: "wf-s3",
        prompt: `${PROMPT} Równanie $f(x) = 2$ ma:`,
        figure: f,
        options: {
          A: "nieskończenie wiele rozwiązań",
          B: "dokładnie jedno rozwiązanie",
          C: "dokładnie dwa rozwiązania",
          D: "zero rozwiązań",
        },
        correct: "A",
        explanation: "Na całym odcinku $\\langle -2, 1 \\rangle$ funkcja ma wartość $2$ – to nieskończenie wiele argumentów.",
      },
    ],
    zaawansowany: [
      {
        id: "wf-z1",
        prompt: `${PROMPT} Zbiorem rozwiązań nierówności $f(x) > 0$ jest:`,
        figure: f,
        options: {
          A: "$(-3, 2) \\cup (4, 5\\rangle$",
          B: "$(-3, 2) \\cup (4, 5)$",
          C: "$\\langle -3, 2 \\rangle \\cup \\langle 4, 5 \\rangle$",
          D: "$(-4, -3) \\cup (2, 4)$",
        },
        correct: "A",
        explanation: "Nad osią $OX$ wykres jest dla $x \\in (-3, 2)$ oraz $x \\in (4, 5\\rangle$ – punkt $(5, 2)$ należy do wykresu.",
      },
      {
        id: "wf-z2",
        prompt: `${PROMPT} Równanie $f(x) = 1$ ma dokładnie:`,
        figure: f,
        options: { A: "$3$ rozwiązania", B: "$2$ rozwiązania", C: "$1$ rozwiązanie", D: "$4$ rozwiązania" },
        correct: "A",
        explanation: "Prosta $y = 1$ przecina wykres trzy razy: na odcinkach rosnącym, malejącym i ostatnim rosnącym.",
      },
      {
        id: "wf-z3",
        prompt: `${PROMPT} Suma wszystkich miejsc zerowych funkcji $f$ jest równa:`,
        figure: f,
        options: { A: "$3$", B: "$0$", C: "$9$", D: "$-1$" },
        correct: "A",
        explanation: "$-3 + 2 + 4 = 3$.",
      },
    ],
  },
};

export default content;
