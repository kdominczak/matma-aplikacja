import type { TopicContent } from "@/types/topic";

const content: TopicContent = {
  theory: [
    {
      title: "Rozwiązywanie krok po kroku",
      body:
        "Przenosimy wyrazy z $x$ na jedną stronę, liczby na drugą, a na końcu dzielimy przez współczynnik przy $x$.\n\nNp. $3x - 5 > 7 \\Rightarrow 3x > 12 \\Rightarrow x > 4$.",
      example: {
        prompt: "Rozwiąż nierówność $\\frac{x}{2} - 1 \\ge \\frac{x + 1}{3}$.",
        solution:
          "Mnożymy obie strony przez 6: $3x - 6 \\ge 2x + 2$, więc $x \\ge 8$, czyli $x \\in \\langle 8, +\\infty)$.",
      },
    },
    {
      title: "Uwaga na liczbę ujemną",
      body:
        "Mnożąc lub dzieląc nierówność przez liczbę ujemną, zmieniamy jej zwrot: $-2x \\le 6 \\Rightarrow x \\ge -3$.\n\nTo najczęstsza pułapka w zadaniach zamkniętych.",
    },
    {
      title: "Zapis w postaci przedziału",
      body:
        "Nierówność ostra ($<$, $>$) – nawias okrągły, nieostra ($\\le$, $\\ge$) – nawias ostry. Przy nieskończoności zawsze stawiamy nawias okrągły.\n\n$x > 4$ to $(4, +\\infty)$, a $x \\le -3$ to $(-\\infty, -3\\rangle$.",
    },
  ],
  formulas: [
    { label: "Dzielenie przez liczbę dodatnią", tex: "ax > b,\\ a > 0 \\Rightarrow x > \\frac{b}{a}" },
    { label: "Dzielenie przez liczbę ujemną", tex: "ax > b,\\ a < 0 \\Rightarrow x < \\frac{b}{a}" },
    { label: "Przedział otwarty", tex: "x > a \\iff x \\in (a, +\\infty)" },
    { label: "Przedział domknięty z jednej strony", tex: "x \\le a \\iff x \\in (-\\infty, a\\rangle" },
  ],
  traps: [
    "Mnożenie lub dzielenie przez liczbę ujemną odwraca znak nierówności.",
    "Przy nieskończoności nawias jest zawsze okrągły.",
    "Mnożąc przez wspólny mianownik, mnożysz każdy wyraz – także te bez ułamka.",
  ],
  openTasks: [
    {
      id: "nl-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Rozwiąż nierówność $\\frac{x - 1}{2} - \\frac{x + 2}{3} \\le 1$. Podaj największą liczbę, która ją spełnia.",
      answers: ["13"],
      hints: ["Pomnóż obie strony przez wspólny mianownik $6$."],
      solution: [
        { step: "Pomnożenie przez $6$: $3(x - 1) - 2(x + 2) \\le 6$.", points: 1 },
        { step: "Rozwiązanie: $x - 7 \\le 6$, czyli $x \\le 13$ – największa liczba to $13$.", points: 1 },
      ],
    },
    {
      id: "nl-o2",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Ile liczb naturalnych dodatnich spełnia nierówność $3(x - 2) < x + 9$?",
      answers: ["7"],
      hints: ["Rozwiąż nierówność, a potem policz liczby $1, 2, 3, \\ldots$ spełniające wynik."],
      solution: [
        { step: "Rozwiązanie: $3x - 6 < x + 9 \\Rightarrow 2x < 15 \\Rightarrow x < 7{,}5$.", points: 1 },
        { step: "Liczby $1, 2, \\ldots, 7$ – jest ich $7$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "nl-p1",
        prompt: "Zbiorem rozwiązań nierówności $2x - 4 > 0$ jest:",
        options: { A: "$(-\\infty, 2)$", B: "$(2, +\\infty)$", C: "$\\langle 2, +\\infty)$", D: "$(-2, +\\infty)$" },
        correct: "B",
        hints: [
          "Przenieś $-4$ na prawą stronę i podziel przez 2.",
          "$2x > 4$. Dzielisz przez $2 > 0$, więc znak się nie zmienia.",
        ],
        explanation: "$2x > 4$, więc $x > 2$. Nierówność jest ostra, dlatego nawias okrągły.",
        trap: "Ostry znak $>$ to nawias okrągły. Nawias ostry przy $2$ znaczyłby, że $2$ też pasuje – a nie pasuje.",
      },
      {
        id: "nl-p2",
        prompt: "Rozwiązaniem nierówności $-3x \\le 9$ jest:",
        options: { A: "$x \\le -3$", B: "$x \\ge -3$", C: "$x \\le 3$", D: "$x \\ge 3$" },
        correct: "B",
        hints: [
          "Dzielisz przez liczbę ujemną – co dzieje się wtedy ze znakiem nierówności?",
          "Podziel obie strony przez $-3$ i odwróć znak: $\\le$ zmienia się w $\\ge$.",
        ],
        explanation: "Dzielimy przez $-3$ i zmieniamy zwrot: $x \\ge -3$.",
        trap: "Dzielisz przez minus? Odwracasz znak. Zapomnisz – CKE ma już przygotowaną odpowiedź A specjalnie dla Ciebie.",
      },
      {
        id: "nl-p3",
        prompt: "Liczba $x = 2$ spełnia nierówność:",
        options: { A: "$3x - 1 > 5$", B: "$x + 4 < 6$", C: "$2x - 1 \\ge 3$", D: "$5 - x > 3$" },
        correct: "C",
        hints: [
          "Podstaw $x = 2$ do każdej nierówności i sprawdź, czy jest prawdziwa.",
          "Dla odpowiedzi C: $2 \\cdot 2 - 1 = 3$. Czy $3 \\ge 3$?",
        ],
        explanation: "$2 \\cdot 2 - 1 = 3 \\ge 3$ – prawda. W pozostałych wychodzi równość przy nierówności ostrej.",
        trap: "Uważaj na granice: $5 > 5$ to fałsz, ale $3 \\ge 3$ to prawda.",
      },
    ],
    sredni: [
      {
        id: "nl-s1",
        prompt: "Najmniejszą liczbą całkowitą spełniającą nierówność $5x + 1 > 12$ jest:",
        options: { A: "$2$", B: "$3$", C: "$11$", D: "$12$" },
        correct: "B",
        explanation: "$5x > 11$, czyli $x > 2{,}2$. Najmniejsza liczba całkowita to $3$.",
        trap: "$x > 2{,}2$ – najmniejsza CAŁKOWITA to $3$. $2$ nie jest większe od $2{,}2$.",
      },
      {
        id: "nl-s2",
        prompt: "Zbiorem rozwiązań nierówności $\\frac{x}{2} - 1 \\ge \\frac{x + 1}{3}$ jest:",
        options: {
          A: "$\\langle 8, +\\infty)$",
          B: "$(8, +\\infty)$",
          C: "$(-\\infty, 8\\rangle$",
          D: "$\\langle -8, +\\infty)$",
        },
        correct: "A",
        explanation: "Po pomnożeniu przez 6: $3x - 6 \\ge 2x + 2$, więc $x \\ge 8$.",
        trap: "Mnożąc przez 6, mnożysz KAŻDY wyraz – także samotną jedynkę: $-1 \\cdot 6 = -6$.",
      },
      {
        id: "nl-s3",
        prompt: "Zbiorem rozwiązań nierówności $2(x - 3) < 5x + 3$ jest:",
        options: { A: "$(-3, +\\infty)$", B: "$(-\\infty, -3)$", C: "$(3, +\\infty)$", D: "$(-\\infty, 3)$" },
        correct: "A",
        explanation: "$2x - 6 < 5x + 3 \\Rightarrow -9 < 3x \\Rightarrow x > -3$.",
      },
    ],
    zaawansowany: [
      {
        id: "nl-z1",
        prompt: "Ile liczb całkowitych dodatnich spełnia nierówność $\\frac{2x - 1}{3} < \\frac{x + 4}{2}$?",
        options: { A: "$12$", B: "$13$", C: "$14$", D: "$15$" },
        correct: "B",
        explanation: "Po pomnożeniu przez 6: $4x - 2 < 3x + 12$, czyli $x < 14$. Liczby $1, \\ldots, 13$ – jest ich 13.",
      },
      {
        id: "nl-z2",
        prompt: "Zbiorem rozwiązań nierówności $(x - 1)^2 \\ge x^2 + 7$ jest:",
        options: {
          A: "$(-\\infty, -3\\rangle$",
          B: "$\\langle -3, +\\infty)$",
          C: "$(-\\infty, 3\\rangle$",
          D: "$\\langle 3, +\\infty)$",
        },
        correct: "A",
        explanation: "$x^2 - 2x + 1 \\ge x^2 + 7 \\Rightarrow -2x \\ge 6 \\Rightarrow x \\le -3$.",
      },
      {
        id: "nl-z3",
        prompt: "Zbiorem rozwiązań nierówności $ax + 2 > 8$ jest przedział $(-\\infty, -2)$. Wtedy:",
        options: { A: "$a = -3$", B: "$a = 3$", C: "$a = -4$", D: "$a = 5$" },
        correct: "A",
        explanation: "$ax > 6$. Zwrot się zmienił, więc $a < 0$ i $x < \\frac{6}{a} = -2$, stąd $a = -3$.",
        trap: "Zwrot nierówności się zmienił – to znak, że dzielenie było przez liczbę ujemną, więc $a < 0$.",
      },
    ],
  },
};

export default content;
