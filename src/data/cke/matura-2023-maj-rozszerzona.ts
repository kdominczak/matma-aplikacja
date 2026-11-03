import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion } from "@/types/quiz";

// Matura z matematyki, poziom rozszerzony, 12 maja 2023 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-R0-100.
// Treść przepisana z PDF CKE, schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2023).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Wszystkie zadania są otwarte. Różnice wobec papieru, opisane uczniowi w treści:
// – kilka wyników po średniku (3, 13), zad. 6 – rozwiązania z przedziału [0, π), zad. 10 – współczynnik przy a,
// – schemat CKE (poziomy z wariantami ALBO) jako jedna ścieżka kroków po 1 pkt,
// – rysunki (5, 7, 10, 13) odtworzone z danych zadania, nie skany.

const LABEL = "Matura CKE · maj 2023 · rozszerzenie";

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const id = `cke-2023-maj-r-${n}`;
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id, difficulty: "zaawansowany", points: solution.length, task: { id, label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

// ── Rysunki ──

// 5: |AD| = 2 i kąt A = 60° → |AB| = 4, |BC| = 4√3; |BK| = |BL| = 1, N = KL ∩ BD
const A5: Point = [0, 0];
const B5: Point = [4, 0];
const C5: Point = [4, 4 * Math.sqrt(3)];
const D5: Point = [1, Math.sqrt(3)];
const K5: Point = [3, 0];
const L5: Point = [4, 1];
// N na KL (y = x − 3) i na BD (przez B i D)
const N5: Point = (() => {
  const t = (B5[0] - 3 - B5[1]) / (D5[1] - B5[1] - (D5[0] - B5[0]));
  return [B5[0] + t * (D5[0] - B5[0]), B5[1] + t * (D5[1] - B5[1])];
})();
const F5: Plot = {
  axes: false,
  x: [-0.7, 4.8],
  y: [-0.7, 7.5],
  lines: [[A5, B5, C5, A5], [B5, D5], [K5, L5]],
  labels: [
    { at: [-0.3, -0.4], text: "A" },
    { at: [4.3, -0.4], text: "B" },
    { at: [4.3, 7.1], text: "C" },
    { at: [0.65, 1.95], text: "D" },
    { at: [3, -0.45], text: "K" },
    { at: [4.3, 1], text: "L" },
    { at: [N5[0] - 0.05, N5[1] + 0.4], text: "N" },
    { at: [0.75, 0.3], text: "60°" },
    { at: [3.5, -0.45], text: "1" },
    { at: [4.3, 0.5], text: "1" },
    { at: [0.2, 1.1], text: "2" },
  ],
};

// 7: sześcian o krawędzi 6 w rzucie ukośnym; S – środek ściany ADHE
const cube: Record<string, Point> = { A: [0, 0], B: [6, 0], C: [8.2, 2.2], D: [2.2, 2.2], E: [0, 6], F: [6, 6], G: [8.2, 8.2], H: [2.2, 8.2] };
const S7: Point = [(cube.A[0] + cube.H[0]) / 2, (cube.A[1] + cube.H[1]) / 2];
const path = (names: string) => [...names].map((n) => cube[n]);
const F7: Plot = {
  axes: false,
  x: [-0.8, 9],
  y: [-0.9, 9],
  lines: [path("ABFEA"), path("BCGF"), path("EHG"), [S7, cube.B]],
  guides: [path("AD"), path("DC"), path("DH"), path("AH"), path("DE"), [S7, cube.H], [cube.B, cube.H]],
  dots: [{ at: S7 }],
  labels: [
    ...Object.entries(cube).map(([text, [x, y]]) => ({ at: [x + (x > 4 ? 0.4 : -0.4), y + (y > 4 ? 0.35 : -0.4)] as Point, text })),
    { at: [S7[0] + 0.45, S7[1]], text: "S" },
    { at: [3, -0.5], text: "6" },
  ],
};

// 10: kwadraty, z których każdy dzieli boki poprzedniego w stosunku 1 : 3
const nextSquare = (sq: Point[]): Point[] => sq.map((p, i) => {
  const q = sq[(i + 1) % 4];
  return [p[0] + (q[0] - p[0]) / 4, p[1] + (q[1] - p[1]) / 4];
});
const squares: Point[][] = [
  [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ],
];
for (let i = 0; i < 4; i++) squares.push(nextSquare(squares[i]));
const F10: Plot = {
  axes: false,
  x: [-0.8, 4.6],
  y: [-0.8, 4.6],
  lines: squares.map((sq) => [...sq, sq[0]]),
  labels: [
    { at: [2, -0.5], text: "a" },
    { at: [-0.5, 2], text: "a" },
  ],
};

// 13: prosta x − y − 2 = 0, parabola y = 4x² − 7x + 1, okrąg o średnicy AB, punkt C
const F13: Plot = {
  x: [-0.5, 2.5],
  y: [-2.5, 1.5],
  lines: [
    [
      [-0.5, -2.5],
      [2.5, 0.5],
    ],
    Array.from({ length: 33 }, (_, i): Point => {
      const x = 0.05 + i * 0.05;
      return [x, 4 * x * x - 7 * x + 1];
    }),
    Array.from({ length: 73 }, (_, i): Point => [1 + Math.SQRT1_2 * Math.cos((i * 5 * Math.PI) / 180), -1 + Math.SQRT1_2 * Math.sin((i * 5 * Math.PI) / 180)]),
    [
      [0.5, -1.5],
      [1.1, -0.3],
    ],
  ],
  dots: [{ at: [0.5, -1.5] }, { at: [1.5, -0.5] }, { at: [1.1, -0.3] }],
  labels: [
    { at: [0.3, -1.55], text: "A", anchor: "end" },
    { at: [1.65, -0.65], text: "B", anchor: "start" },
    { at: [1.1, -0.05], text: "C" },
    { at: [2.35, 0.6], text: "l" },
    { at: [0.8, -1.35], text: "α" },
  ],
};

const T12 =
  "Funkcja $f$ jest określona wzorem $f(x) = 81^{\\log_3 x} + \\frac{2 \\cdot \\log_2 \\sqrt{27} \\cdot \\log_3 2}{3} \\cdot x^2 - 6x$ dla każdej liczby dodatniej $x$.";

const TASKS: [number: string, task: PracticeTask][] = [
  [
    "1",
    open(
      "1",
      "W chwili początkowej $(t = 0)$ masa substancji jest równa $4$ gramom. Wskutek rozpadu cząsteczek tej substancji jej masa się zmniejsza. Po każdej kolejnej dobie ubywa $19\\%$ masy, jaka była na koniec doby poprzedniej. Dla każdej liczby całkowitej $t \\ge 0$ funkcja $m(t)$ określa masę substancji w gramach po $t$ pełnych dobach (czas liczymy od chwili początkowej).\n\nWyznacz wzór funkcji $m(t)$. Oblicz, po ilu pełnych dobach masa tej substancji będzie po raz pierwszy mniejsza od $1{,}5$ grama. Zapisz obliczenia.\n\n(W aplikacji jako wynik wpisz liczbę dób.)",
      ["5"],
      ["$m(t) = 4 \\cdot 0{,}81^t$.", "$4 \\cdot 0{,}81^4 \\approx 1{,}72 \\ge 1{,}5$, a $4 \\cdot 0{,}81^5 \\approx 1{,}39 < 1{,}5$ – po $5$ dobach."],
      { answerLabel: "t =" },
    ),
  ],
  [
    "2",
    open(
      "2",
      "Tomek i Romek postanowili rozegrać między sobą pięć partii szachów. Prawdopodobieństwo wygrania pojedynczej partii przez Tomka jest równe $\\frac{1}{4}$.\n\nOblicz prawdopodobieństwo wygrania przez Tomka co najmniej czterech z pięciu partii. Wynik podaj w postaci ułamka zwykłego nieskracalnego. Zapisz obliczenia.",
      ["1/64"],
      [
        "Schemat Bernoullego: $n = 5$, $p = \\frac{1}{4}$, $q = \\frac{3}{4}$.",
        "$P = \\binom{5}{4}\\left(\\frac{1}{4}\\right)^4 \\cdot \\frac{3}{4} + \\left(\\frac{1}{4}\\right)^5$.",
        "$P = \\frac{15}{1024} + \\frac{1}{1024} = \\frac{1}{64}$.",
      ],
    ),
  ],
  [
    "3",
    open(
      "3",
      "Funkcja $f$ jest określona wzorem $f(x) = \\frac{3x^2 - 2x}{x^2 + 2x + 8}$ dla każdej liczby rzeczywistej $x$. Punkt $P = (x_0, 3)$ należy do wykresu funkcji $f$.\n\nOblicz $x_0$ oraz wyznacz równanie stycznej do wykresu funkcji $f$ w punkcie $P$. Zapisz obliczenia.\n\n(W aplikacji wpisz $x_0$ oraz współczynniki $a$ i $b$ stycznej $y = ax + b$, oddzielone średnikami.)",
      ["-3; -8/11; 9/11"],
      [
        "$3x^2 - 2x = 3(x^2 + 2x + 8)$, więc $-8x = 24$ i $x_0 = -3$.",
        "$f'(x) = \\frac{(6x - 2)(x^2 + 2x + 8) - (3x^2 - 2x)(2x + 2)}{(x^2 + 2x + 8)^2}$.",
        "$f'(-3) = -\\frac{8}{11}$, styczna: $y = -\\frac{8}{11}(x + 3) + 3$, czyli $y = -\\frac{8}{11}x + \\frac{9}{11}$.",
      ],
      { answerLabel: "x_0;\\ a;\\ b =" },
    ),
  ],
  [
    "4",
    open(
      "4",
      "Liczby rzeczywiste $x$ oraz $y$ spełniają jednocześnie równanie $x + y = 4$ i nierówność $x^3 - x^2y \\le xy^2 - y^3$.\n\nWykaż, że $x = 2$ oraz $y = 2$.",
      [],
      [
        "Podstawienie $y = 4 - x$: $x^3 - x^2(4 - x) \\le x(4 - x)^2 - (4 - x)^3$ (albo rozkład $x^3 - x^2y - xy^2 + y^3 = (x - y)^2(x + y)$).",
        "Nierówność kwadratowa: $16x^2 - 64x + 64 \\le 0$, czyli $16(x - 2)^2 \\le 0$ (albo $4(x - y)^2 \\le 0$).",
        "Kwadrat liczby jest nieujemny, więc $x = 2$, a stąd $y = 4 - x = 2$.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "5",
    open(
      "5",
      "Dany jest trójkąt prostokątny $ABC$, w którym $|\\angle ABC| = 90°$ oraz $|\\angle CAB| = 60°$. Punkty $K$ i $L$ leżą na bokach – odpowiednio – $AB$ i $BC$ tak, że $|BK| = |BL| = 1$ (zobacz rysunek). Odcinek $KL$ przecina wysokość $BD$ tego trójkąta w punkcie $N$, a ponadto $|AD| = 2$.\n\nWykaż, że $|ND| = \\sqrt{3} + 1$.",
      [],
      [
        "Równanie z $x = |BN|$, np. z pól: $\\frac{1}{2} \\cdot 1 \\cdot x \\cdot \\sin 60° + \\frac{1}{2} \\cdot x \\cdot 1 \\cdot \\sin 30° = \\frac{1}{2}$ (trójkąty $BLN$ i $KBN$ tworzą $KBL$).",
        "$|BN| = \\frac{2}{1 + \\sqrt{3}} = \\sqrt{3} - 1$.",
        "$|BD| = |AD| \\cdot \\operatorname{tg} 60° = 2\\sqrt{3}$, więc $|ND| = 2\\sqrt{3} - (\\sqrt{3} - 1) = \\sqrt{3} + 1$.",
      ],
      { format: "proof", figure: F5 },
    ),
  ],
  [
    "6",
    open(
      "6",
      "Rozwiąż równanie\n\n$4\\sin(4x)\\cos(6x) = 2\\sin(10x) + 1$\n\nZapisz obliczenia.\n\n(W aplikacji wpisz rozwiązania z przedziału $[0, \\pi)$, oddzielone średnikiem.)",
      ["7π/12; 11π/12"],
      [
        "Wzór na iloczyn: $2\\sin(4x)\\cos(6x) = \\sin(10x) + \\sin(-2x)$.",
        "$2\\sin(10x) - 2\\sin(2x) = 2\\sin(10x) + 1$, czyli $\\sin(2x) = -\\frac{1}{2}$.",
        "$x = \\frac{7}{12}\\pi + k\\pi$ lub $x = \\frac{11}{12}\\pi + k\\pi$, $k \\in \\mathbb{Z}$.",
      ],
    ),
  ],
  [
    "7",
    open(
      "7",
      "Dany jest sześcian $ABCDEFGH$ o krawędzi długości $6$. Punkt $S$ jest punktem przecięcia przekątnych $AH$ i $DE$ ściany bocznej $ADHE$ (zobacz rysunek).\n\nOblicz wysokość trójkąta $SBH$ poprowadzoną z punktu $S$ na bok $BH$ tego trójkąta. Zapisz obliczenia.",
      ["√6"],
      [
        "Jeden z odcinków, np. $|BH| = 6\\sqrt{3}$ (przekątna sześcianu).",
        "Boki trójkąta $SBH$: $|HS| = 3\\sqrt{2}$, $|HB| = 6\\sqrt{3}$, $|SB| = 3\\sqrt{6}$.",
        "Równanie na wysokość $h = |SP|$, np. z pola: $P_{SBH} = 9\\sqrt{2} = \\frac{1}{2} \\cdot 6\\sqrt{3} \\cdot h$ (albo z podobieństwa trójkątów $PHS$ i $AHB$).",
        "$h = \\sqrt{6}$.",
      ],
      { answerLabel: "h =", figure: F7 },
    ),
  ],
  [
    "8",
    open(
      "8",
      "Czworokąt $ABCD$, w którym $|BC| = 4$ i $|CD| = 5$, jest opisany na okręgu. Przekątna $AC$ tego czworokąta tworzy z bokiem $BC$ kąt o mierze $60°$, natomiast z bokiem $AB$ – kąt ostry, którego sinus jest równy $\\frac{1}{4}$.\n\nOblicz obwód czworokąta $ABCD$. Zapisz obliczenia.",
      ["16√3+10"],
      [
        "Twierdzenie sinusów w trójkącie $ABC$: $\\frac{|AB|}{\\sin 60°} = \\frac{4}{\\frac{1}{4}}$.",
        "$|AB| = 8\\sqrt{3}$.",
        "Czworokąt opisany na okręgu: $|AB| + |CD| = |BC| + |AD|$, więc obwód $= 2(|AB| + |CD|)$.",
        "Obwód $= 2(8\\sqrt{3} + 5) = 16\\sqrt{3} + 10$.",
      ],
    ),
  ],
  [
    "9",
    open(
      "9",
      "Rozwiąż nierówność\n\n$\\sqrt{x^2 + 4x + 4} < \\frac{25}{3} - \\sqrt{x^2 - 6x + 9}$\n\nZapisz obliczenia.\n\nWskazówka: skorzystaj z tego, że $\\sqrt{a^2} = |a|$ dla każdej liczby rzeczywistej $a$.",
      ["(-11/3, 14/3)"],
      [
        "$|x + 2| < \\frac{25}{3} - |x - 3|$.",
        "Nierówność bez wartości bezwzględnej w przedziałach $(-\\infty, -2)$, $[-2, 3)$, $[3, +\\infty)$.",
        "Rozwiązania w dwóch przedziałach, np. $x \\in \\left(-\\frac{11}{3}, -2\\right)$ oraz cały $[-2, 3)$ (tam $5 < \\frac{25}{3}$).",
        "Trzeci przedział: $x \\in \\left[3, \\frac{14}{3}\\right)$; odpowiedź $x \\in \\left(-\\frac{11}{3}, \\frac{14}{3}\\right)$.",
      ],
    ),
  ],
  [
    "10",
    open(
      "10",
      "Określamy kwadraty $K_1, K_2, K_3, \\ldots$ następująco: $K_1$ jest kwadratem o boku długości $a$; $K_2$ jest kwadratem, którego każdy wierzchołek leży na innym boku kwadratu $K_1$ i dzieli ten bok w stosunku $1 : 3$; $K_3$ jest kwadratem, którego każdy wierzchołek leży na innym boku kwadratu $K_2$ i dzieli ten bok w stosunku $1 : 3$; i ogólnie, dla każdej liczby naturalnej $n \\ge 2$, $K_n$ jest kwadratem, którego każdy wierzchołek leży na innym boku kwadratu $K_{n-1}$ i dzieli ten bok w stosunku $1 : 3$.\n\nObwody wszystkich kwadratów określonych powyżej tworzą nieskończony ciąg geometryczny. Na rysunku przedstawiono kwadraty utworzone w sposób opisany powyżej.\n\nOblicz sumę wszystkich wyrazów tego nieskończonego ciągu. Zapisz obliczenia.\n\n(W aplikacji wpisz współczynnik przy $a$.)",
      ["8(4+√10)/3"],
      [
        "Bok $K_2$ (przeciwprostokątna o przyprostokątnych $\\frac{a}{4}$ i $\\frac{3a}{4}$): $\\frac{\\sqrt{10}}{4}a$.",
        "Iloraz ciągu obwodów: $q = \\frac{\\sqrt{10}}{4}$ (i $|q| < 1$).",
        "$L = 4a\\left(1 + \\frac{\\sqrt{10}}{4} + \\frac{5}{8} + \\ldots\\right)$.",
        "$L = \\frac{4a}{1 - \\frac{\\sqrt{10}}{4}} = \\frac{8(4 + \\sqrt{10})}{3}a$.",
      ],
      { answerLabel: "L : a =", figure: F10 },
    ),
  ],
  [
    "11",
    open(
      "11",
      "Wyznacz wszystkie wartości parametru $m \\ne 2$, dla których równanie\n\n$x^2 + 4x - \\frac{m - 3}{m - 2} = 0$\n\nma dwa różne rozwiązania rzeczywiste $x_1$, $x_2$ spełniające warunek $x_1^3 + x_2^3 > -28$.\n\nZapisz obliczenia.",
      ["(11/5, 9/4)"],
      [
        "$\\Delta > 0$: $m \\in (-\\infty, 2) \\cup \\left(\\frac{11}{5}, +\\infty\\right)$.",
        "$x_1^3 + x_2^3 = (x_1 + x_2)^3 - 3x_1x_2(x_1 + x_2)$ – postać pod wzory Viète'a.",
        "Nierówność z niewiadomą $m$: $-64 - 3 \\cdot \\left(-\\frac{m - 3}{m - 2}\\right) \\cdot (-4) > -28$.",
        "Jej rozwiązanie: $m \\in \\left(2, \\frac{9}{4}\\right)$.",
        "Część wspólna z $\\Delta > 0$: $m \\in \\left(\\frac{11}{5}, \\frac{9}{4}\\right)$.",
      ],
    ),
  ],
  [
    "12.1",
    open(
      "12.1",
      `${T12}\n\nWykaż, że dla każdej liczby dodatniej $x$ wyrażenie $81^{\\log_3 x} + \\frac{2 \\cdot \\log_2 \\sqrt{27} \\cdot \\log_3 2}{3} \\cdot x^2 - 6x$ można równoważnie przekształcić do postaci $x^4 + x^2 - 6x$.`,
      [],
      ["$81^{\\log_3 x} = 3^{4\\log_3 x} = 3^{\\log_3 x^4} = x^4$.", "$\\log_2 \\sqrt{27} \\cdot \\log_3 2 = \\frac{3}{2}\\log_2 3 \\cdot \\log_3 2 = \\frac{3}{2}$, więc współczynnik przy $x^2$ to $\\frac{2 \\cdot \\frac{3}{2}}{3} = 1$."],
      { format: "proof" },
    ),
  ],
  [
    "12.2",
    open(
      "12.2",
      `${T12}\n\nOblicz najmniejszą wartość funkcji $f$ określonej dla każdej liczby dodatniej $x$. Zapisz obliczenia.\n\nWskazówka: przyjmij, że wzór funkcji $f$ można przedstawić w postaci $f(x) = x^4 + x^2 - 6x$.`,
      ["-4"],
      [
        "$f'(x) = 4x^3 + 2x - 6$.",
        "$4x^3 + 2x - 6 = (x - 1)(4x^2 + 4x + 6) = 0$ tylko dla $x = 1$.",
        "$f' < 0$ na $(0, 1)$ i $f' > 0$ na $(1, +\\infty)$ – najmniejsza wartość w $x = 1$.",
        "$f(1) = 1 + 1 - 6 = -4$.",
      ],
    ),
  ],
  [
    "13",
    open(
      "13",
      "W kartezjańskim układzie współrzędnych $(x, y)$ prosta $l$ o równaniu $x - y - 2 = 0$ przecina parabolę o równaniu $y = 4x^2 - 7x + 1$ w punktach $A$ oraz $B$. Odcinek $AB$ jest średnicą okręgu $\\mathcal{O}$. Punkt $C$ leży na okręgu $\\mathcal{O}$ nad prostą $l$, a kąt $BAC$ jest ostry i ma miarę $\\alpha$ taką, że $\\operatorname{tg}\\alpha = \\frac{1}{3}$ (zobacz rysunek).\n\nOblicz współrzędne punktu $C$. Zapisz obliczenia.\n\n(W aplikacji wpisz współrzędne $C$: $x$ i $y$ oddzielone średnikiem.)",
      ["11/10; -3/10"],
      [
        "Równanie z jedną niewiadomą z układu prostej i paraboli, np. $x - 2 = 4x^2 - 7x + 1$.",
        "$A = \\left(\\frac{1}{2}, -\\frac{3}{2}\\right)$, $B = \\left(\\frac{3}{2}, -\\frac{1}{2}\\right)$.",
        "Współczynnik kierunkowy prostej $AC$: $\\operatorname{tg}(45° + \\alpha) = \\frac{1 + \\frac{1}{3}}{1 - \\frac{1}{3}} = 2$.",
        "Prosta $AC$: $y = 2\\left(x - \\frac{1}{2}\\right) - \\frac{3}{2}$ (albo okrąg $\\mathcal{O}$: $(x - 1)^2 + (y + 1)^2 = \\frac{1}{2}$).",
        "Układ prostej $AC$ i okręgu $\\mathcal{O}$.",
        "$C = \\left(\\frac{11}{10}, -\\frac{3}{10}\\right)$.",
      ],
      { answerLabel: "C =", figure: F13 },
    ),
  ],
];

export const CKE_2023_MAJ_R: ExamSheet = {
  id: "cke-2023-maj-r",
  kind: "cke",
  year: 2023,
  session: "maj",
  title: "Matura rozszerzona maj 2023",
  subtitle: "Oficjalny arkusz CKE · poziom rozszerzony",
  level: "rozszerzony",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2023/Matematyka/poziom_rozszerzony/MMAP-R0-100-2305-zasady.pdf",
  },
};
