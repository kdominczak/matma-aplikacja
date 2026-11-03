import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion } from "@/types/quiz";

// Matura z matematyki, poziom rozszerzony, maj 2026 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-R0-100, wersja A.
// Treść przepisana z PDF CKE, schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2026).
// Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Wszystkie zadania są otwarte. Różnice wobec papieru, opisane uczniowi w treści: kilka wyników po średniku
// (8, 9, 11, 12.2), zad. 7 – rozwiązania z przedziału [0, π/2); schemat CKE jako kroki po 1 pkt;
// rysunki (4, 11, 12) odtworzone z danych zadania, nie skany.

const LABEL = "Matura CKE · maj 2026 · rozszerzenie";

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const id = `cke-2026-maj-r-${n}`;
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id, difficulty: "zaawansowany", points: solution.length, task: { id, label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

const label = (at: Point, text: string) => ({ at, text });

// 4: kwadrat o boku 4; K, L – środki AB i BC, M na BC (KM ⟂ DK), P = AL ∩ DK, Q = AL ∩ DM
const F4: Plot = {
  axes: false,
  x: [-0.7, 4.7],
  y: [-0.8, 4.6],
  lines: [
    [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
      [0, 0],
    ],
    [
      [0, 4],
      [2, 0],
      [4, 1],
      [0, 4],
    ],
    [
      [0, 0],
      [4, 2],
    ],
  ],
  labels: [
    label([-0.3, -0.4], "A"),
    label([4.3, -0.4], "B"),
    label([4.3, 4.3], "C"),
    label([-0.3, 4.3], "D"),
    label([2, -0.45], "K"),
    label([4.35, 2], "L"),
    label([4.35, 1], "M"),
    label([1.35, 0.95], "P"),
    label([3.2, 2.05], "Q"),
    label([-0.4, 2], "a"),
  ],
};

// 11: |AB| = 9, |AD| = 10, kąt BAD = 60°, |BC| = 5, |CD| = 6; okrąg opisany i wpisany (r = 2√3, środek (6, 2√3))
const A11: Point = [0, 0];
const B11: Point = [9, 0];
const D11: Point = [5, 5 * Math.sqrt(3)];
const C11: Point = (() => {
  // przecięcie okręgów: |BC| = 5, |DC| = 6, po stronie przeciwnej do A
  const [dx, dy] = [D11[0] - B11[0], D11[1] - B11[1]];
  const d = Math.hypot(dx, dy);
  const a = (25 - 36 + d * d) / (2 * d);
  const h = Math.sqrt(25 - a * a);
  const [mx, my] = [B11[0] + (a * dx) / d, B11[1] + (a * dy) / d];
  return [mx + (h * dy) / d, my - (h * dx) / d];
})();
const circumcenter = (p: Point, q: Point, r: Point): Point => {
  const d = 2 * (p[0] * (q[1] - r[1]) + q[0] * (r[1] - p[1]) + r[0] * (p[1] - q[1]));
  const s = (v: Point) => v[0] ** 2 + v[1] ** 2;
  return [(s(p) * (q[1] - r[1]) + s(q) * (r[1] - p[1]) + s(r) * (p[1] - q[1])) / d, (s(p) * (r[0] - q[0]) + s(q) * (p[0] - r[0]) + s(r) * (q[0] - p[0])) / d];
};
const O11 = circumcenter(A11, B11, D11);
const R11 = Math.hypot(O11[0], O11[1]);
const circle = (c: Point, r: number): Point[] => Array.from({ length: 73 }, (_, i) => [c[0] + r * Math.cos((i * 5 * Math.PI) / 180), c[1] + r * Math.sin((i * 5 * Math.PI) / 180)]);
const F11: Plot = {
  axes: false,
  x: [O11[0] - R11 - 0.6, O11[0] + R11 + 0.6],
  y: [O11[1] - R11 - 0.6, O11[1] + R11 + 0.6],
  lines: [[A11, B11, C11, D11, A11], circle(O11, R11), circle([6, 2 * Math.sqrt(3)], 2 * Math.sqrt(3))],
  labels: [
    label([A11[0] - 0.4, A11[1] - 0.3], "A"),
    label([B11[0] + 0.4, B11[1] - 0.3], "B"),
    label([C11[0] + 0.45, C11[1]], "C"),
    label([D11[0], D11[1] + 0.45], "D"),
    label([4.5, -0.5], "9"),
    label([2.1, 4.6], "10"),
    label([1.25, 0.45], "60°"),
  ],
};

// 12: trójkąt równoramienny o podstawie x z wpisanym kołem o średnicy 4 (rysunek dla x = 4√3)
const X12 = 4 * Math.sqrt(3);
const H12 = (4 * X12 * X12) / (X12 * X12 - 16);
const F12: Plot = {
  axes: false,
  x: [-X12 / 2 - 0.8, X12 / 2 + 0.8],
  y: [-1, H12 + 0.6],
  lines: [
    [
      [-X12 / 2, 0],
      [X12 / 2, 0],
      [0, H12],
      [-X12 / 2, 0],
    ],
    circle([0, 2], 2),
  ],
  labels: [label([0, -0.6], "x")],
};

const T12 =
  "W projekcie ogrodu zaplanowano kwietnik w kształcie trójkąta równoramiennego o podstawie długości $x$ metrów nieprzekraczającej $10$ metrów. Na tym kwietniku ma znajdować się fontanna w kształcie koła o średnicy $4$ metrów, które ma być styczne do każdego z boków trójkątnego kwietnika (zobacz rysunek). Projektantowi zależy, aby przy tak ustalonej wielkości fontanny pole tego kwietnika było najmniejsze.";

const TASKS: [number: string, task: PracticeTask][] = [
  [
    "1",
    open(
      "1",
      "Oblicz granicę\n\n$\\lim\\limits_{n \\to +\\infty} \\frac{\\binom{n + 2}{n - 1}}{\\frac{1}{2}n^3 - 4n + 7}$\n\nZapisz obliczenia.",
      ["1/3"],
      ["$\\binom{n + 2}{n - 1} = \\frac{(n + 2)!}{3!\\,(n - 1)!} = \\frac{n(n + 1)(n + 2)}{6}$.", "Po podzieleniu licznika i mianownika przez $n^3$: granica $\\frac{\\frac{1}{6}}{\\frac{1}{2}} = \\frac{1}{3}$."],
    ),
  ],
  [
    "2",
    open(
      "2",
      "Ze zbioru ośmiu liczb $\\{1, 2, 3, 4, 5, 6, 7, 8\\}$ losujemy bez zwracania osiem razy po jednej liczbie. Wylosowane liczby ustawiamy w ciąg zgodnie z kolejnością losowania.\n\nOblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że wylosowane liczby utworzą ciąg, w którym iloczyn każdych trzech kolejnych wyrazów będzie liczbą podzielną przez $3$. Wynik podaj w postaci nieskracalnego ułamka zwykłego. Zapisz obliczenia.",
      ["1/28"],
      [
        "$|\\Omega| = 8!$.",
        "Każda trójka kolejnych wyrazów musi zawierać $3$ albo $6$ – możliwe tylko, gdy stoją na miejscach $3.$ i $6.$: $|A| = 2 \\cdot 6!$.",
        "$P(A) = \\frac{2 \\cdot 6!}{8!} = \\frac{1}{28}$.",
      ],
    ),
  ],
  [
    "3",
    open(
      "3",
      "Wykaż, że dla każdej dodatniej liczby rzeczywistej $x$ i dla każdej dodatniej liczby rzeczywistej $y$ prawdziwa jest nierówność\n\n$\\frac{1}{x} + \\frac{1}{y} \\le \\frac{x}{y^2} + \\frac{y}{x^2}$",
      [],
      [
        "Mnożenie przez $x^2y^2 > 0$: $x^3 + y^3 - xy^2 - x^2y \\ge 0$.",
        "$x^3 + y^3 - xy(x + y) = (x + y)(x^2 - 2xy + y^2)$, a $x + y > 0$, więc wystarczy $x^2 - 2xy + y^2 \\ge 0$.",
        "$x^2 - 2xy + y^2 = (x - y)^2 \\ge 0$ – kwadrat liczby rzeczywistej jest nieujemny.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "4",
    open(
      "4",
      "Punkty $K$ i $L$ są środkami – odpowiednio – boków $AB$ i $BC$ kwadratu $ABCD$ o boku długości $a$. Punkt $M$ jest takim punktem na boku $BC$, że odcinki $DK$ i $KM$ są prostopadłe.\n\nOdcinek $AL$ przecina odcinki $DK$ oraz $DM$ w punktach – odpowiednio – $P$ oraz $Q$ (zobacz rysunek).\n\nWykaż, że $|PQ| = \\frac{\\sqrt{5}}{5}a$.",
      [],
      [
        "Uzasadnienie, że $AL \\perp DK$ (trójkąty $ABL$ i $DAK$ są przystające), więc $AL \\parallel KM$.",
        "Z twierdzenia Talesa w trójkącie $DKM$: $\\frac{|PQ|}{|KM|} = \\frac{|DP|}{|DK|} = \\frac{4}{5}$ (np. $|DP| = \\frac{2\\sqrt{5}}{5}a$, $|DK| = \\frac{\\sqrt{5}}{2}a$).",
        "$|KM| = \\frac{\\sqrt{5}}{4}a$ (trójkąt $KBM$ podobny do $DAK$), więc $|PQ| = \\frac{4}{5} \\cdot \\frac{\\sqrt{5}}{4}a = \\frac{\\sqrt{5}}{5}a$.",
      ],
      { format: "proof", figure: F4 },
    ),
  ],
  [
    "5",
    open(
      "5",
      "Rozwiąż nierówność\n\n$|2x - 6| - |x^2 - 9| < 0$\n\nZapisz obliczenia.",
      ["(-∞, -5) ∪ (-1, 3) ∪ (3, +∞)"],
      [
        "Podział na przedziały $(-\\infty, -3)$, $[-3, 3)$, $[3, +\\infty)$ i zapis nierówności bez wartości bezwzględnej w jednym z nich.",
        "Zapis nierówności bez wartości bezwzględnej we wszystkich trzech przedziałach.",
        "Rozwiązania w dwóch przedziałach, np. $x < -5$ oraz $x \\in (-1, 3)$.",
        "Trzeci przedział: $(3, +\\infty)$; odpowiedź $x \\in (-\\infty, -5) \\cup (-1, 3) \\cup (3, +\\infty)$.",
      ],
    ),
  ],
  [
    "6",
    open(
      "6",
      "Dany jest ciąg arytmetyczny $(a_n)$ o skończonej liczbie wyrazów. Liczba wyrazów tego ciągu jest większa od $6$. Pierwszy wyraz tego ciągu jest równy $1$, a ostatni wyraz tego ciągu jest równy $(-2025)$. Drugi, trzeci i szósty wyraz tego ciągu tworzą – w podanej kolejności – ciąg geometryczny.\n\nOblicz sumę wszystkich wyrazów ciągu $(a_n)$. Zapisz obliczenia.",
      ["-1026168"],
      [
        "Równanie z niewiadomą $r$: $(1 + 2r)^2 = (1 + r)(1 + 5r)$.",
        "$r^2 + 2r = 0$, więc $r = 0$ albo $r = -2$; $r = 0$ odpada (ostatni wyraz byłby równy $1$).",
        "$1 - 2(n - 1) = -2025$, więc $n = 1014$.",
        "$S_{1014} = \\frac{1 + (-2025)}{2} \\cdot 1014 = -1\\,026\\,168$.",
      ],
    ),
  ],
  [
    "7",
    open(
      "7",
      "Rozwiąż równanie\n\n$\\sin(6x) - 2\\sin(2x) = 0$\n\nZapisz obliczenia.\n\n(W aplikacji wpisz rozwiązania z przedziału $\\left[0, \\frac{\\pi}{2}\\right)$, oddzielone średnikami.)",
      ["0; π/12; 5π/12"],
      [
        "Wzór na sinus sumy: $\\sin(6x) = \\sin(4x)\\cos(2x) + \\cos(4x)\\sin(2x)$ (albo $\\sin(3t) = 3\\sin t - 4\\sin^3 t$ dla $t = 2x$).",
        "Alternatywa: $\\sin(2x) = 0$ lub $\\cos^2(2x) = \\frac{3}{4}$ (równoważnie $\\sin(2x) = \\pm\\frac{1}{2}$).",
        "Rozwiązanie jednego z równań, np. $\\sin(2x) = 0$: $x = \\frac{\\pi k}{2}$.",
        "Wszystkie rozwiązania: $x = \\frac{\\pi k}{2}$, $x = -\\frac{\\pi}{12} + \\frac{\\pi k}{2}$, $x = \\frac{\\pi}{12} + \\frac{\\pi k}{2}$, $k \\in \\mathbb{Z}$.",
      ],
    ),
  ],
  [
    "8",
    open(
      "8",
      "W ostrosłupie prawidłowym trójkątnym $ABCS$ podstawa $ABC$ jest trójkątem równobocznym. Długość okręgu opisanego na podstawie $ABC$ jest równa $6\\sqrt{2}\\pi$, a cosinus kąta między krawędziami bocznymi $SB$ i $SC$ jest równy $\\frac{5}{9}$.\n\nOblicz długość krawędzi podstawy $ABC$ oraz cosinus kąta między ścianami bocznymi $SAC$ i $SBC$ tego ostrosłupa. Zapisz obliczenia.\n\n(W aplikacji wpisz długość krawędzi i cosinus, oddzielone średnikiem.)",
      ["3√6; 5/14"],
      [
        "$2\\pi R = 6\\sqrt{2}\\pi$, $R = 3\\sqrt{2}$, więc $a = R\\sqrt{3} = 3\\sqrt{6}$.",
        "Kąt $\\alpha$ przy wierzchołku ściany: $\\cos\\frac{\\alpha}{2} = \\frac{\\sqrt{7}}{3}$ (z $\\cos\\alpha = \\frac{5}{9}$).",
        "Wysokość ściany bocznej opuszczona na krawędź $SC$: $x = \\sqrt{42}$.",
        "Twierdzenie cosinusów: $a^2 = 2x^2 - 2x^2\\cos\\beta$, czyli $54 = 84 - 84\\cos\\beta$ i $\\cos\\beta = \\frac{5}{14}$.",
      ],
      { answerLabel: "a;\\ \\cos\\beta =" },
    ),
  ],
  [
    "9",
    open(
      "9",
      "W kartezjańskim układzie współrzędnych $(x, y)$ punkty $A = (1, -1)$ oraz $B = (4, 0)$ są wierzchołkami trójkąta $ABC$, w którym $|CA| = |CB|$. Jedno z ramion trójkąta $ABC$ zawiera się w prostej o równaniu $x + 2y - 4 = 0$. Na boku $AC$ tego trójkąta obrano taki punkt $M$, że $|AM| : |MC| = 1 : 4$.\n\nWyznacz równanie okręgu, który ma środek w punkcie $M$ i przechodzi przez punkt $C$. Zapisz obliczenia.\n\n(W aplikacji wpisz współrzędne środka i kwadrat promienia: $a;\\ b;\\ r^2$ dla $(x - a)^2 + (y - b)^2 = r^2$.)",
      ["6/5; -3/5; 16/5"],
      [
        "Symetralna boku $AB$: $6x + 2y - 14 = 0$ (na niej leży $C$).",
        "Równanie z jedną niewiadomą, np. $6x_C + 2\\left(-\\frac{1}{2}x_C + 2\\right) - 14 = 0$ ($C$ leży na prostej $x + 2y - 4 = 0$, która przechodzi przez $B$).",
        "$C = (2, 1)$.",
        "$M = A + \\frac{1}{5}\\overrightarrow{AC} = \\left(\\frac{6}{5}, -\\frac{3}{5}\\right)$.",
        "$r^2 = |MC|^2 = \\frac{16}{5}$: $\\left(x - \\frac{6}{5}\\right)^2 + \\left(y + \\frac{3}{5}\\right)^2 = \\frac{16}{5}$.",
      ],
      { answerLabel: "a;\\ b;\\ r^2 =" },
    ),
  ],
  [
    "10",
    open(
      "10",
      "Wyznacz wszystkie rzeczywiste wartości parametru $m$, gdzie $m \\ne 0$, dla których funkcja kwadratowa $f$ określona wzorem\n\n$f(x) = m^2 \\cdot x^2 - 2mx - m + 1$\n\nma dwa różne miejsca zerowe $x_1$ oraz $x_2$ należące do przedziału $(-2, 2)$.\n\nZapisz obliczenia.",
      ["(1, +∞)"],
      [
        "Warunki: $\\Delta > 0$, wierzchołek $-2 < p < 2$, $f(-2) > 0$, $f(2) > 0$ (ramiona w górę, bo $m^2 > 0$).",
        "$\\Delta = 4m^3 > 0$, czyli $m > 0$.",
        "$p = \\frac{1}{m} \\in (-2, 2)$: $m \\in \\left(-\\infty, -\\frac{1}{2}\\right) \\cup \\left(\\frac{1}{2}, +\\infty\\right)$.",
        "$f(-2) = 4m^2 + 3m + 1 > 0$ dla każdego $m$, $f(2) = 4m^2 - 5m + 1 > 0$: $m \\in \\left(-\\infty, \\frac{1}{4}\\right) \\cup (1, +\\infty)$.",
        "Część wspólna: $m \\in (1, +\\infty)$.",
      ],
    ),
  ],
  [
    "11",
    open(
      "11",
      "W czworokącie $ABCD$ są dane: $|AB| = 9$, $|AD| = 10$ oraz $|\\angle BAD| = 60°$. W ten czworokąt wpisano okrąg oraz na tym czworokącie opisano okrąg (zobacz rysunek).\n\nOblicz długości boków $BC$ i $CD$ oraz pole czworokąta $ABCD$. Zapisz obliczenia.\n\n(W aplikacji wpisz $|BC|$, $|CD|$ i pole, oddzielone średnikami.)",
      ["5; 6; 30√3"],
      [
        "Czworokąt opisany na okręgu: $9 + |CD| = 10 + |BC|$, czyli $|CD| = |BC| + 1$.",
        "Czworokąt wpisany w okrąg: $|\\angle BCD| = 180° - 60° = 120°$.",
        "Twierdzenie cosinusów w trójkącie $ABD$: $|BD|^2 = 81 + 100 - 90 = 91$.",
        "Twierdzenie cosinusów w trójkącie $BCD$ z $b = |BC|$: $b^2 + (b + 1)^2 + b(b + 1) = 91$.",
        "$b^2 + b - 30 = 0$, więc $|BC| = 5$ i $|CD| = 6$.",
        "$P = \\frac{1}{2} \\cdot 9 \\cdot 10 \\cdot \\sin 60° + \\frac{1}{2} \\cdot 5 \\cdot 6 \\cdot \\sin 120° = 30\\sqrt{3}$.",
      ],
      { answerLabel: "|BC|;\\ |CD|;\\ P =", figure: F11 },
    ),
  ],
  [
    "12.1",
    open(
      "12.1",
      `${T12}\n\nWykaż, że pole $P$ (wyrażone w metrach kwadratowych) trójkątnego kwietnika o podstawie długości $x$ metrów jest określone wzorem\n\n$P(x) = \\frac{2x^3}{x^2 - 16}$`,
      [],
      [
        "Związek wysokości $h$, podstawy $x$ i ramienia $b$: $b^2 = \\left(\\frac{1}{2}x\\right)^2 + h^2$.",
        "Pole przez promień okręgu wpisanego $r = 2$: $\\frac{1}{2}xh = 2\\left(\\frac{1}{2}x + b\\right)$ – układ równań z $h$, $b$, $x$.",
        "Rugowanie $b$: $h(x^2 - 16) = 4x^2$, więc $h = \\frac{4x^2}{x^2 - 16}$ i $P = \\frac{1}{2}xh = \\frac{2x^3}{x^2 - 16}$.",
      ],
      { format: "proof", figure: F12 },
    ),
  ],
  [
    "12.2",
    open(
      "12.2",
      `${T12}\n\nPole $P$ trójkątnego kwietnika o podstawie długości $x$ metrów jest określone wzorem\n\n$P(x) = \\frac{2x^3}{x^2 - 16}$ dla każdego $x \\in (4, 10]$.\n\nWyznacz długość $x$ podstawy trójkątnego kwietnika, dla której pole tego kwietnika jest najmniejsze. Oblicz to najmniejsze pole. Zapisz obliczenia.\n\n(W aplikacji wpisz $x$ i pole, oddzielone średnikiem.)`,
      ["4√3; 12√3"],
      [
        "$P'(x) = \\frac{6x^2(x^2 - 16) - 2x^3 \\cdot 2x}{(x^2 - 16)^2} = \\frac{2x^2(x^2 - 48)}{(x^2 - 16)^2}$.",
        "$P'(x) = 0$ dla $x = 4\\sqrt{3}$ (w dziedzinie).",
        "$P' < 0$ na $(4, 4\\sqrt{3})$ i $P' > 0$ na $(4\\sqrt{3}, 10]$ – najmniejsze pole dla $x = 4\\sqrt{3}$ m.",
        "$P(4\\sqrt{3}) = \\frac{2 \\cdot 192\\sqrt{3}}{32} = 12\\sqrt{3}$ m².",
      ],
      { answerLabel: "x;\\ P =" },
    ),
  ],
];

export const CKE_2026_MAJ_R: ExamSheet = {
  id: "cke-2026-maj-r",
  kind: "cke",
  year: 2026,
  session: "maj",
  title: "Matura rozszerzona maj 2026",
  subtitle: "Oficjalny arkusz CKE · poziom rozszerzony",
  level: "rozszerzony",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2605-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2026/Matematyka/poziom_rozszerzony/MMAP-R0-100-2605-zasady.pdf",
  },
};
