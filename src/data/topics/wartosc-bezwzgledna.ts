import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Definicja",
      body:
        "$|x| = x$ dla $x \\ge 0$ oraz $|x| = -x$ dla $x < 0$.\n\nWartość bezwzględna to odległość liczby od zera na osi liczbowej, więc nigdy nie jest ujemna: $|-5| = 5$, $|3| = 3$.",
    },
    {
      title: "Opuszczanie wartości bezwzględnej",
      body:
        "Sprawdź znak wyrażenia w środku. Jeśli jest nieujemne – przepisz je bez zmian, jeśli ujemne – zmień znak na przeciwny.\n\nNp. $|1 - \\sqrt{2}| = \\sqrt{2} - 1$, bo $1 - \\sqrt{2} < 0$.",
    },
    {
      title: "Równania i nierówności",
      body:
        "$|x - a|$ to odległość liczby $x$ od $a$. Stąd:\n\n$|x - a| = r$ – liczby odległe od $a$ dokładnie o $r$, czyli $x = a - r$ lub $x = a + r$.\n\n$|x - a| < r$ – liczby bliżej niż $r$, czyli przedział $(a - r, a + r)$.\n\n$|x - a| > r$ – liczby dalej niż $r$, czyli $(-\\infty, a - r) \\cup (a + r, +\\infty)$.",
      example: {
        prompt: "Rozwiąż równanie $|x - 3| = 5$.",
        solution: "$x - 3 = 5$ lub $x - 3 = -5$, więc $x = 8$ lub $x = -2$.",
      },
    },
  ],
  formulas: [
    { label: "Definicja", tex: "|x| = \\begin{cases} x & \\text{dla } x \\ge 0 \\\\ -x & \\text{dla } x < 0 \\end{cases}" },
    { label: "Pierwiastek z kwadratu", tex: "\\sqrt{x^2} = |x|" },
    { label: "Iloczyn", tex: "|a \\cdot b| = |a| \\cdot |b|" },
    { label: "Równanie", tex: "|x - a| = r \\iff x = a - r \\ \\lor \\ x = a + r" },
    { label: "Nierówność „mniejsze”", tex: "|x - a| < r \\iff a - r < x < a + r" },
    { label: "Nierówność „większe”", tex: "|x - a| > r \\iff x < a - r \\ \\lor \\ x > a + r" },
  ],
  traps: [
    "$|x - a| < r$ to przedział w środku, $|x - a| > r$ – dwa kawałki na zewnątrz.",
    "$|x + 3|$ to odległość od $-3$ – znak w środku odwracasz.",
    "$|x| = -2$ nie ma rozwiązań. Nie licz, tylko skreśl.",
  ],
  tests: {
    podstawowy: [
      {
        id: "abs-p1",
        prompt: "Wartość wyrażenia $|-7| + |3|$ jest równa:",
        options: { A: "$10$", B: "$-4$", C: "$4$", D: "$-10$" },
        correct: "A",
        hints: [
          "Wartość bezwzględna liczby ujemnej to liczba do niej przeciwna.",
          "$|-7| = 7$. Teraz dodaj $|3|$.",
        ],
        explanation: "$|-7| = 7$, $|3| = 3$, więc suma to $10$.",
        trap: "Wartość bezwzględna „zjada” minus: $|-7| = 7$, nie $-7$.",
      },
      {
        id: "abs-p2",
        prompt: "Liczba $|1 - \\sqrt{2}|$ jest równa:",
        options: { A: "$\\sqrt{2} - 1$", B: "$1 - \\sqrt{2}$", C: "$1 + \\sqrt{2}$", D: "$-1 - \\sqrt{2}$" },
        correct: "A",
        hints: [
          "Sprawdź, czy $1 - \\sqrt{2}$ jest dodatnie, czy ujemne ($\\sqrt{2} \\approx 1{,}41$).",
          "$1 - 1{,}41 < 0$, więc wynik to liczba przeciwna: $-(1 - \\sqrt{2})$.",
        ],
        explanation: "$1 - \\sqrt{2} < 0$, więc zmieniamy znak: $\\sqrt{2} - 1$.",
        trap: "Nie przepisuj na ślepo: $|1 - \\sqrt{2}| \\neq 1 - \\sqrt{2}$, bo wynik nie może być ujemny.",
      },
      {
        id: "abs-p3",
        prompt: "Rozwiązaniami równania $|x| = 4$ są liczby:",
        options: { A: "$-4$ i $4$", B: "tylko $4$", C: "tylko $-4$", D: "brak rozwiązań" },
        correct: "A",
        hints: [
          "Które liczby leżą w odległości 4 od zera?",
          "Na osi liczbowej idziesz 4 kroki od zera – w prawo albo w lewo.",
        ],
        explanation: "Odległość 4 od zera mają liczby $-4$ i $4$.",
        trap: "$|x| = 4$ ma DWA rozwiązania. Zgubiony ujemny wynik to najczęściej tracony punkt.",
      },
    ],
    sredni: [
      {
        id: "abs-s1",
        prompt: "Rozwiązaniami równania $|x - 3| = 5$ są liczby:",
        options: { A: "$-2$ i $8$", B: "$2$ i $8$", C: "$-8$ i $2$", D: "$-2$ i $-8$" },
        correct: "A",
        explanation: "$x - 3 = 5$ lub $x - 3 = -5$, czyli $x = 8$ lub $x = -2$.",
      },
      {
        id: "abs-s2",
        prompt: "Zbiorem rozwiązań nierówności $|x + 1| < 3$ jest:",
        options: {
          A: "$(-4, 2)$",
          B: "$(-2, 4)$",
          C: "$(-\\infty, -4) \\cup (2, +\\infty)$",
          D: "$\\langle -4, 2 \\rangle$",
        },
        correct: "A",
        explanation: "$|x - (-1)| < 3$ – liczby odległe od $-1$ o mniej niż 3: $-4 < x < 2$.",
        trap: "$|x + 1|$ to odległość od $-1$, nie od $1$. Znak w środku się odwraca!",
      },
      {
        id: "abs-s3",
        prompt: "Równanie $|x - 2| = -1$:",
        options: {
          A: "nie ma rozwiązań",
          B: "ma jedno rozwiązanie $x = 1$",
          C: "ma dwa rozwiązania",
          D: "ma jedno rozwiązanie $x = 3$",
        },
        correct: "A",
        explanation: "Wartość bezwzględna nigdy nie jest ujemna, więc równanie jest sprzeczne.",
        trap: "Wartość bezwzględna nigdy nie jest ujemna – $|\\ldots| = -1$ jest sprzeczne od razu, bez liczenia.",
      },
    ],
    zaawansowany: [
      {
        id: "abs-z1",
        prompt: "Zbiorem rozwiązań nierówności $|2x - 4| \\ge 6$ jest:",
        options: {
          A: "$(-\\infty, -1\\rangle \\cup \\langle 5, +\\infty)$",
          B: "$\\langle -1, 5 \\rangle$",
          C: "$(-\\infty, -5\\rangle \\cup \\langle 1, +\\infty)$",
          D: "$(-\\infty, -1) \\cup (5, +\\infty)$",
        },
        correct: "A",
        explanation: "$|2x - 4| = 2|x - 2| \\ge 6$, czyli $|x - 2| \\ge 3$: $x \\le -1$ lub $x \\ge 5$.",
        trap: "Przy „$\\ge$” rozwiązanie to dwa kawałki osi NA ZEWNĄTRZ, z domkniętymi nawiasami. Przedział w środku to odpowiedź dla „$\\le$”.",
      },
      {
        id: "abs-z2",
        prompt: "Dla $x \\in (-5, 2)$ wyrażenie $|x - 2| + |x + 5|$ jest równe:",
        options: { A: "$7$", B: "$2x + 3$", C: "$-2x - 3$", D: "$3$" },
        correct: "A",
        explanation: "W tym przedziale $x - 2 < 0$ i $x + 5 > 0$, więc $(2 - x) + (x + 5) = 7$.",
      },
      {
        id: "abs-z3",
        prompt: "Ile liczb całkowitych spełnia nierówność $|x - 4| \\le 3$?",
        options: { A: "$6$", B: "$7$", C: "$3$", D: "$8$" },
        correct: "B",
        explanation: "$1 \\le x \\le 7$, czyli liczby $1, 2, \\ldots, 7$ – jest ich 7.",
      },
    ],
  },
};

export default content;
