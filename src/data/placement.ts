import type { Question } from "@/types/quiz";
import type { Difficulty } from "@/types/topic";

// Test na start: 12 zadań przekrojowych. Osobne od testów działów, żeby nie zdradzać ich treści.
// 9 zadań z działów „na 30%” (jedno na dział) + 3 trudniejsze z działów „na 60%” i „na 85%”.
// Bez importów z data/topics – indeks pytań w data/topics importuje ten plik.

export interface PlacementItem {
  topicId: string;
  difficulty: Difficulty;
  question: Question;
}

export const PLACEMENT: PlacementItem[] = [
  {
    topicId: "potegi-i-pierwiastki",
    difficulty: "podstawowy",
    question: {
      id: "start-01",
      prompt: "Liczba $\\frac{4^3 \\cdot 2^5}{8^2}$ jest równa:",
      options: { A: "$2^4$", B: "$2^5$", C: "$2^{11}$", D: "$2^{-1}$" },
      correct: "B",
      explanation: "$4^3 = 2^6$ i $8^2 = 2^6$, więc $\\frac{2^6 \\cdot 2^5}{2^6} = 2^5$.",
    },
  },
  {
    topicId: "logarytmy",
    difficulty: "sredni",
    question: {
      id: "start-02",
      prompt: "Liczba $\\log_3 18 - \\log_3 2$ jest równa:",
      options: { A: "$2$", B: "$16$", C: "$\\log_3 16$", D: "$6$" },
      correct: "A",
      explanation: "Różnica logarytmów to logarytm ilorazu: $\\log_3 \\frac{18}{2} = \\log_3 9 = 2$.",
    },
  },
  {
    topicId: "wartosc-bezwzgledna",
    difficulty: "podstawowy",
    question: {
      id: "start-03",
      prompt: "Zbiorem rozwiązań nierówności $|x - 2| \\le 3$ jest:",
      options: {
        A: "$\\langle -1, 5 \\rangle$",
        B: "$(-1, 5)$",
        C: "$\\langle -5, 1 \\rangle$",
        D: "$(-\\infty, -1\\rangle \\cup \\langle 5, +\\infty)$",
      },
      correct: "A",
      explanation: "Liczby odległe od $2$ o co najwyżej $3$: $-1 \\le x \\le 5$.",
    },
  },
  {
    topicId: "wzory-skroconego-mnozenia",
    difficulty: "sredni",
    question: {
      id: "start-04",
      prompt: "Wyrażenie $(x - 3)^2 - (x + 3)(x - 3)$ jest równe:",
      options: { A: "$-6x + 18$", B: "$-6x$", C: "$18$", D: "$2x^2 - 6x$" },
      correct: "A",
      explanation: "$(x^2 - 6x + 9) - (x^2 - 9) = -6x + 18$.",
    },
  },
  {
    topicId: "nierownosci-liniowe",
    difficulty: "podstawowy",
    question: {
      id: "start-05",
      prompt: "Zbiorem rozwiązań nierówności $3 - 2x \\ge 7$ jest:",
      options: {
        A: "$(-\\infty, -2\\rangle$",
        B: "$\\langle -2, +\\infty)$",
        C: "$(-\\infty, 2\\rangle$",
        D: "$\\langle 2, +\\infty)$",
      },
      correct: "A",
      explanation: "$-2x \\ge 4$. Dzielimy przez $-2$ i odwracamy znak: $x \\le -2$.",
    },
  },
  {
    topicId: "nierownosci-kwadratowe",
    difficulty: "sredni",
    question: {
      id: "start-06",
      prompt: "Zbiorem rozwiązań nierówności $x^2 - 2x - 3 > 0$ jest:",
      options: {
        A: "$(-\\infty, -1) \\cup (3, +\\infty)$",
        B: "$(-1, 3)$",
        C: "$(-\\infty, -3) \\cup (1, +\\infty)$",
        D: "$\\langle -1, 3 \\rangle$",
      },
      correct: "A",
      explanation: "Miejsca zerowe: $-1$ i $3$. Ramiona w górę, więc nad osią poza przedziałem między pierwiastkami.",
    },
  },
  {
    topicId: "rownania-wymierne",
    difficulty: "sredni",
    question: {
      id: "start-07",
      prompt: "Równanie $\\frac{x^2 - 1}{x + 1} = 0$ ma:",
      options: {
        A: "dokładnie jedno rozwiązanie: $x = 1$",
        B: "dwa rozwiązania: $-1$ i $1$",
        C: "dokładnie jedno rozwiązanie: $x = -1$",
        D: "zero rozwiązań",
      },
      correct: "A",
      explanation: "Licznik zeruje się dla $\\pm 1$, ale $x = -1$ zeruje też mianownik, więc wypada z dziedziny.",
    },
  },
  {
    topicId: "wykres-funkcji",
    difficulty: "podstawowy",
    question: {
      id: "start-08",
      prompt: "Na rysunku przedstawiono wykres funkcji $f$. Największa wartość funkcji $f$ jest równa:",
      figure: {
        x: [-4, 5],
        y: [-3, 3],
        lines: [[[-3, -1], [0, 2], [2, 2], [4, -2]]],
        dots: [{ at: [-3, -1] }, { at: [4, -2] }],
      },
      options: { A: "$2$", B: "$4$", C: "$-3$", D: "$0$" },
      correct: "A",
      explanation: "Najwyżej wykres sięga $y = 2$ (na odcinku od $x = 0$ do $x = 2$).",
    },
  },
  {
    topicId: "funkcja-liniowa",
    difficulty: "podstawowy",
    question: {
      id: "start-09",
      prompt: "Miejscem zerowym funkcji $f(x) = -\\frac{1}{2}x + 3$ jest:",
      options: { A: "$3$", B: "$-6$", C: "$6$", D: "$\\frac{1}{2}$" },
      correct: "C",
      explanation: "$-\\frac{1}{2}x + 3 = 0 \\Rightarrow x = 6$.",
    },
  },
  // ── Trudniejsze: działy „na 60%” i „na 85%” ──
  {
    topicId: "ciagi",
    difficulty: "sredni",
    question: {
      id: "start-10",
      prompt: "W ciągu arytmetycznym $a_3 = 7$ i $a_7 = 19$. Suma dziesięciu początkowych wyrazów tego ciągu jest równa:",
      options: { A: "$145$", B: "$150$", C: "$130$", D: "$290$" },
      correct: "A",
      explanation: "$4r = 12$, więc $r = 3$ i $a_1 = 1$. Wtedy $a_{10} = 28$ i $S_{10} = \\frac{1 + 28}{2} \\cdot 10 = 145$.",
    },
  },
  {
    topicId: "funkcja-kwadratowa",
    difficulty: "sredni",
    question: {
      id: "start-11",
      prompt: "Zbiorem wartości funkcji $f(x) = -2(x - 1)^2 + 8$ jest:",
      options: {
        A: "$(-\\infty, 8\\rangle$",
        B: "$\\langle 8, +\\infty)$",
        C: "$(-\\infty, 1\\rangle$",
        D: "$\\langle -2, 8 \\rangle$",
      },
      correct: "A",
      explanation: "Wierzchołek to $(1, 8)$, a ramiona są skierowane w dół, więc wartości to $(-\\infty, 8\\rangle$.",
    },
  },
  {
    topicId: "trygonometria",
    difficulty: "sredni",
    question: {
      id: "start-12",
      prompt: "Kąt $\\alpha$ jest ostry i $\\sin\\alpha = \\frac{3}{5}$. Wtedy $\\operatorname{tg}\\alpha$ jest równy:",
      options: { A: "$\\frac{3}{4}$", B: "$\\frac{4}{3}$", C: "$\\frac{3}{5}$", D: "$\\frac{4}{5}$" },
      correct: "A",
      explanation: "$\\cos\\alpha = \\sqrt{1 - \\frac{9}{25}} = \\frac{4}{5}$, więc $\\operatorname{tg}\\alpha = \\frac{3}{5} : \\frac{4}{5} = \\frac{3}{4}$.",
    },
  },
];
