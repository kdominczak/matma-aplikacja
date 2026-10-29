import { sample } from "@/lib/plot";
import type { TopicContent } from "@/types/topic";

// Lekcja 15 – przekształcenia wykresów funkcji (dział V podstawy: f(x − a), f(x) + b, −f(x), f(−x)).
// Zadania pw-p1…pw-z2 i pw-o1/pw-o2 przeniesione bez zmian z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Przesunięcie w pionie",
      body:
        "Dodanie liczby do wartości funkcji przesuwa cały wykres w pionie – zgodnie ze znakiem: $f(x) + 2$ to $2$ w górę, " +
        "$f(x) - 3$ to $3$ w dół. Każdy punkt $(x, y)$ przechodzi na $(x, y + q)$.\n\n" +
        "Na rysunku: przerywana $y = x^2$ i ciągła $y = x^2 + 2$ – ta sama parabola, podniesiona o $2$.",
      plot: {
        x: [-3, 3],
        y: [-1, 7],
        lines: [sample((x) => x * x + 2, -2.2, 2.2)],
        guides: [sample((x) => x * x, -2.6, 2.6)],
        dots: [{ at: [0, 0] }, { at: [0, 2] }],
      },
    },
    {
      title: "Przesunięcie w poziomie",
      body:
        "Zmiana „w środku” funkcji przesuwa wykres w poziomie – ODWROTNIE do znaku: $f(x - 2)$ to $2$ w prawo, " +
        "$f(x + 4)$ to $4$ w lewo. Każdy punkt $(x, y)$ przechodzi na $(x + p, y)$.\n\n" +
        "Dlaczego odwrotnie? Wartość, którą $f$ miała w $0$, funkcja $f(x - 2)$ przyjmuje dopiero w $x = 2$. " +
        "Na rysunku przerywana $y = x^2$ i ciągła $y = (x - 2)^2$.",
      plot: {
        x: [-3, 5],
        y: [-1, 6],
        lines: [sample((x) => (x - 2) ** 2, -0.4, 4.4)],
        guides: [sample((x) => x * x, -2.4, 2.4)],
        dots: [{ at: [0, 0] }, { at: [2, 0] }],
      },
      example: {
        prompt: "Jak powstaje wykres funkcji $y = (x + 4)^2$ z wykresu $y = x^2$?",
        solution: "$(x + 4)^2 = f(x - (-4))$, więc $p = -4$: przesunięcie o $4$ jednostki w lewo.",
      },
    },
    {
      title: "Przesunięcie o wektor [p, q]",
      body:
        "Oba przesunięcia naraz: wykres $y = f(x - p) + q$ powstaje z wykresu $y = f(x)$ przez przesunięcie o wektor $[p, q]$ – " +
        "o $p$ w poziomie i o $q$ w pionie.\n\n" +
        "Dla paraboli to dokładnie postać kanoniczna: wierzchołek $(0, 0)$ wędruje do $(p, q)$.",
      example: {
        prompt: "Wykres $y = x^2$ przesunięto o wektor $[3, -2]$. Podaj wzór i wierzchołek nowej paraboli.",
        solution: "$y = (x - 3)^2 - 2$.\nWierzchołek: $(3, -2)$.",
      },
    },
    {
      title: "Symetria względem osi",
      body:
        "• $y = -f(x)$ – odbicie względem osi $Ox$: każda wartość zmienia znak, punkt $(x, y)$ przechodzi na $(x, -y)$.\n\n" +
        "• $y = f(-x)$ – odbicie względem osi $Oy$: punkt $(x, y)$ przechodzi na $(-x, y)$.\n\n" +
        "Minus „na zewnątrz” odwraca wykres do góry nogami, minus „w środku” – na lewo/prawo.",
      example: {
        prompt: "Funkcja $f(x) = 2^x$. Zapisz wzory funkcji $-f(x)$ i $f(-x)$.",
        solution: "$-f(x) = -2^x$ – wykres pod osią $Ox$.\n$f(-x) = 2^{-x} = \\left(\\frac{1}{2}\\right)^x$ – funkcja malejąca.",
      },
    },
    {
      title: "Punkty i miejsca zerowe po przekształceniu",
      body:
        "Zamiast liczyć nowy wzór, często wystarczy przesunąć punkty:\n\n" +
        "• przesunięcie o $[p, q]$: $(x_0, y_0) \\to (x_0 + p, y_0 + q)$,\n\n" +
        "• $f(x - p)$ przesuwa miejsca zerowe o $p$, $f(-x)$ zmienia ich znak,\n\n" +
        "• przesunięcie w pionie zmienia miejsca zerowe „nieprzewidywalnie” – trzeba je policzyć od nowa.",
      example: {
        prompt: "Funkcja $f$ ma miejsca zerowe $-1$ i $3$. Podaj miejsca zerowe funkcji $g(x) = f(x - 2)$ i $h(x) = f(-x)$.",
        solution: "$g$: przesunięcie o $2$ w prawo – miejsca zerowe $1$ i $5$.\n$h$: odbicie względem $Oy$ – miejsca zerowe $1$ i $-3$.",
      },
    },
  ],
  formulas: [
    { label: "Przesunięcie o wektor [p, q]", tex: "y = f(x - p) + q" },
    { label: "Punkt po przesunięciu o [p, q]", tex: "(x_0, y_0) \\to (x_0 + p, \\ y_0 + q)" },
    { label: "Symetria względem osi Ox", tex: "y = -f(x)" },
    { label: "Symetria względem osi Oy", tex: "y = f(-x)" },
  ],
  traps: [
    "Zmiana w nawiasie działa odwrotnie do znaku: $f(x - 3)$ to $3$ w PRAWO, $f(x + 3)$ – w lewo.",
    "Liczba dodana poza funkcją przesuwa w pionie – zgodnie ze znakiem.",
    "$-f(x)$ odbija względem osi $Ox$, a $f(-x)$ – względem osi $Oy$. Łatwo je zamienić.",
    "Po przesunięciu w pionie miejsca zerowe trzeba policzyć od nowa – nie przesuwają się o $q$.",
  ],
  openTasks: [
    {
      id: "pw-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Wykres funkcji $f(x) = x^2$ przesunięto o wektor $[3, -2]$ i otrzymano wykres funkcji $g$. Oblicz $g(0)$.",
      answers: ["7"],
      answerLabel: "g(0) =",
      hints: ["Przesunięcie o $[p, q]$ daje $g(x) = f(x - p) + q$."],
      solution: [
        { step: "Wzór: $g(x) = (x - 3)^2 - 2$.", points: 1 },
        { step: "Obliczenie: $g(0) = 9 - 2 = 7$.", points: 1 },
      ],
    },
    {
      id: "pw-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Wykres funkcji $f(x) = x^2 - 4$ przesunięto o $3$ jednostki w prawo i otrzymano wykres funkcji $g$. Oblicz $g(5)$.",
      answers: ["0"],
      hints: ["Przesunięcie w prawo o $3$ to $f(x - 3)$."],
      solution: [
        { step: "Wzór: $g(x) = (x - 3)^2 - 4$.", points: 1 },
        { step: "Obliczenie: $g(5) = 2^2 - 4 = 0$.", points: 1 },
      ],
    },
    {
      id: "pw-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Funkcja $f$ ma miejsca zerowe $-1$ i $4$. Podaj sumę miejsc zerowych funkcji $g(x) = f(x + 2)$.",
      answers: ["-1"],
      hints: ["$f(x + 2)$ przesuwa wykres w lewo."],
      solution: [
        { step: "$g$ to $f$ przesunięta o $2$ w lewo, więc miejsca zerowe to $-3$ i $2$.", points: 1 },
        { step: "Suma: $-3 + 2 = -1$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "pw-p1",
        prompt: "Wykres funkcji $y = f(x) + 3$ powstaje z wykresu $y = f(x)$ przez przesunięcie o $3$ jednostki:",
        options: { A: "w górę", B: "w dół", C: "w prawo", D: "w lewo" },
        correct: "A",
        hints: ["Liczba dodana „na zewnątrz” funkcji działa w pionie."],
        explanation: "Dodanie liczby do wartości funkcji przesuwa wykres w pionie – w górę.",
      },
      {
        id: "pw-p2",
        prompt: "Wykres funkcji $y = (x - 2)^2$ powstaje z wykresu $y = x^2$ przez przesunięcie o:",
        options: { A: "$2$ w prawo", B: "$2$ w lewo", C: "$2$ w górę", D: "$2$ w dół" },
        correct: "A",
        hints: ["Zmiana wewnątrz nawiasu działa w poziomie – i odwrotnie do znaku."],
        explanation: "$f(x - 2)$ to przesunięcie o $2$ w prawo.",
      },
      {
        id: "pw-p3",
        prompt: "Wykres funkcji $y = x^2 - 5$ powstaje z wykresu $y = x^2$ przez przesunięcie o $5$ jednostek:",
        options: { A: "w dół", B: "w górę", C: "w prawo", D: "w lewo" },
        correct: "A",
        hints: ["$-5$ stoi poza kwadratem – zmienia wartości, czyli działa w pionie."],
        explanation: "$x^2 - 5 = f(x) - 5$ – każda wartość jest o $5$ mniejsza, więc wykres idzie w dół.",
      },
    ],
    sredni: [
      {
        id: "pw-s1",
        prompt: "Wykres funkcji $f(x) = x^2$ przesunięto o wektor $\\vec{v} = [-1, 4]$. Otrzymano wykres funkcji:",
        options: { A: "$y = (x + 1)^2 + 4$", B: "$y = (x - 1)^2 + 4$", C: "$y = (x + 1)^2 - 4$", D: "$y = (x - 4)^2 - 1$" },
        correct: "A",
        explanation: "$y = f(x - p) + q$ dla $p = -1$, $q = 4$: $(x + 1)^2 + 4$.",
      },
      {
        id: "pw-s2",
        prompt: "Wykres funkcji $y = -f(x)$ jest symetryczny do wykresu $y = f(x)$ względem:",
        options: { A: "osi $Ox$", B: "osi $Oy$", C: "początku układu współrzędnych", D: "prostej $y = x$" },
        correct: "A",
        explanation: "Zmiana znaku wartości odbija wykres względem osi $Ox$.",
      },
      {
        id: "pw-s3",
        prompt: "Wykres funkcji $f(x) = 2^x$ odbito symetrycznie względem osi $Oy$. Otrzymano wykres funkcji:",
        options: { A: "$y = 2^{-x}$", B: "$y = -2^x$", C: "$y = -2^{-x}$", D: "$y = 2^x + 1$" },
        correct: "A",
        explanation: "Symetria względem osi $Oy$ to $f(-x) = 2^{-x}$.",
        trap: "$-2^x$ to odbicie względem osi $Ox$ – minus „na zewnątrz”, a nie w wykładniku.",
      },
    ],
    zaawansowany: [
      {
        id: "pw-z1",
        prompt: "Wykres funkcji $g(x) = 2^{x - 3} + 1$ powstał z wykresu $f(x) = 2^x$ przez przesunięcie o wektor:",
        options: { A: "$[3, 1]$", B: "$[-3, 1]$", C: "$[3, -1]$", D: "$[1, 3]$" },
        correct: "A",
        explanation: "$g(x) = f(x - 3) + 1$, czyli wektor $[3, 1]$.",
      },
      {
        id: "pw-z2",
        prompt: "Wykres funkcji $f(x) = |x|$ przesunięto o wektor $[2, -3]$. Do otrzymanego wykresu należy punkt:",
        options: { A: "$(2, -3)$", B: "$(0, -3)$", C: "$(-2, 3)$", D: "$(3, 2)$" },
        correct: "A",
        explanation: "$g(x) = |x - 2| - 3$ i $g(2) = -3$. Wierzchołek przesuwa się z $(0, 0)$ do $(2, -3)$.",
      },
      {
        id: "pw-z3",
        prompt: "Funkcja $f$ ma miejsca zerowe $-2$ i $5$. Miejscami zerowymi funkcji $g(x) = f(-x)$ są liczby:",
        options: { A: "$2$ i $-5$", B: "$-2$ i $5$", C: "$-4$ i $10$", D: "$0$ i $3$" },
        correct: "A",
        explanation: "$g(x) = 0 \\Leftrightarrow f(-x) = 0 \\Leftrightarrow -x \\in \\{-2, 5\\}$, czyli $x = 2$ lub $x = -5$.",
        trap: "Odbicie względem osi $Oy$ zmienia znak miejsc zerowych – nie zostają takie same.",
      },
    ],
  },
};

export default content;
