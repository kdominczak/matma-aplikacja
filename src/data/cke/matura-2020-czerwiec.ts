import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, termin główny 2020 (formuła 2015, 50 pkt, 170 min) – arkusz MMA-P1_1P-202.
// Na okładce data 5 maja 2020, ale przez pandemię egzamin odbył się w czerwcu – „Zasady oceniania” CKE podają
// „Termin główny – czerwiec 2020”. Treść przepisana z PDF CKE, klucz wersji X (ta jest w opublikowanym PDF-ie)
// i schematy punktowania z „Zasad oceniania”. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Różnice wobec papieru: rysunki odtworzone z danych zadania (nie skany); zadania 7–9 mają wspólną informację,
// tu powtórzoną w każdym; zadania otwarte – schemat CKE jako kolejne kroki po 1 pkt.

const LABEL = "Matura CKE · czerwiec 2020";
const id = (n: string) => `cke-2020-czerwiec-${n}`;

function closed(n: string, prompt: string, options: [string, string, string, string], correct: OptionKey, explanation: string, figure?: Plot): PracticeTask {
  return {
    kind: "closed",
    id: id(n),
    difficulty: "sredni",
    points: 1,
    question: {
      id: id(n),
      label: LABEL,
      prompt,
      options: { A: options[0], B: options[1], C: options[2], D: options[3] },
      correct,
      explanation,
      ...(figure ? { figure } : {}),
    },
  };
}

function open(n: string, prompt: string, answers: string[], steps: string[], extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {}): PracticeTask {
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id: id(n), difficulty: "sredni", points: solution.length, task: { id: id(n), label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const onCircle = (deg: number, r = 1): Point => [r * Math.cos(rad(deg)), r * Math.sin(rad(deg))];
const circle = (r = 1): Point[] => Array.from({ length: 73 }, (_, i) => onCircle(i * 5, r));
const sample = (f: (x: number) => number, from: number, to: number, steps = 48): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / steps;
    return [x, f(x)];
  });

/** Znacznik kąta prostego w wierzchołku `v` między ramionami w stronę `a` i `b` (kwadracik o boku `size`). */
function rightMark(v: Point, a: Point, b: Point, size: number): Point[] {
  const unit = ([x, y]: Point): Point => {
    const len = Math.hypot(x - v[0], y - v[1]);
    return [(x - v[0]) / len, (y - v[1]) / len];
  };
  const [ua, ub] = [unit(a), unit(b)];
  return [
    [v[0] + size * ua[0], v[1] + size * ua[1]],
    [v[0] + size * (ua[0] + ub[0]), v[1] + size * (ua[1] + ub[1])],
    [v[0] + size * ub[0], v[1] + size * ub[1]],
  ];
}

// ── Rysunki ──

// 7–9: parabola f(x) = −(x − 1)(x − 3), wierzchołek W = (2, 1)
const F7: Plot = {
  x: [-4.5, 5.5],
  y: [-4.5, 4.5],
  lines: [sample((x) => -(x - 1) * (x - 3), -0.25, 4.25)],
  dots: [{ at: [2, 1] }],
  labels: [{ at: [2, 1.45], text: "W" }],
};

// 11: prosta y = −2x + 1
const F11: Plot = {
  x: [-4.5, 5.5],
  y: [-4.5, 4.5],
  lines: [
    [
      [-1.8, 4.6],
      [2.5, -4],
    ],
  ],
};

// 17: okrąg o środku O; średnice BC i AD; D (58°), C (300°), A (238°), B (120°); |∠DOC| = 118°
const [A17, B17, C17, D17] = [onCircle(238), onCircle(120), onCircle(300), onCircle(58)];
const F17: Plot = {
  axes: false,
  x: [-1.3, 1.3],
  y: [-1.3, 1.3],
  lines: [circle(), [A17, B17, C17], [A17, D17]],
  dots: [{ at: [0, 0] }, { at: A17 }, { at: B17 }, { at: C17 }, { at: D17 }],
  labels: [
    { at: [A17[0] - 0.08, A17[1] - 0.14], text: "A", anchor: "end" },
    { at: [B17[0] - 0.06, B17[1] + 0.1], text: "B", anchor: "end" },
    { at: [C17[0] + 0.06, C17[1] - 0.14], text: "C", anchor: "start" },
    { at: [D17[0] + 0.06, D17[1] + 0.1], text: "D", anchor: "start" },
    { at: [-0.12, 0.04], text: "O", anchor: "end" },
    { at: [0.18, -0.04], text: "118°", anchor: "start" },
  ],
};

// 19: trójkąt prostokątny – kąt prosty w lewym dolnym rogu, β u góry, α po prawej
const F19: Plot = {
  axes: false,
  x: [-0.6, 5.2],
  y: [-0.6, 3.8],
  lines: [
    [
      [0, 0],
      [4.6, 0],
      [0, 3.2],
      [0, 0],
    ],
    rightMark([0, 0], [4.6, 0], [0, 3.2], 0.4),
  ],
  labels: [
    { at: [0.3, 2.45], text: "β" },
    { at: [3.65, 0.25], text: "α" },
  ],
};

// 22: prostokąt ABCD, |AP| : |PB| = |CR| : |RD| = 3 : 2; odcinki AR i PC
const F22: Plot = {
  axes: false,
  x: [-0.6, 5.6],
  y: [-0.7, 3.6],
  lines: [
    [
      [0, 0],
      [5, 0],
      [5, 2.9],
      [0, 2.9],
      [0, 0],
    ],
    [
      [0, 0],
      [2, 2.9],
    ],
    [
      [3, 0],
      [5, 2.9],
    ],
  ],
  dots: [{ at: [0, 0] }, { at: [3, 0] }, { at: [5, 0] }, { at: [5, 2.9] }, { at: [2, 2.9] }, { at: [0, 2.9] }],
  labels: [
    { at: [-0.25, -0.45], text: "A" },
    { at: [3, -0.5], text: "P" },
    { at: [5.25, -0.45], text: "B" },
    { at: [5.25, 3.15], text: "C" },
    { at: [2, 3.25], text: "R" },
    { at: [-0.25, 3.15], text: "D" },
  ],
};

// 25: dwa stożki o wspólnej podstawie (promień r), wysokości 3 : 2
const ellipse = (rx: number, ry: number, from: number, to: number): Point[] =>
  Array.from({ length: 37 }, (_, i) => {
    const a = rad(from + ((to - from) * i) / 36);
    return [rx * Math.cos(a), ry * Math.sin(a)];
  });
const F25: Plot = {
  axes: false,
  x: [-2.6, 2.6],
  y: [-2.4, 3.4],
  guides: [ellipse(2, 0.4, 0, 360)],
  lines: [
    [
      [-2, 0],
      [0, 3],
      [2, 0],
      [0, -2],
      [-2, 0],
    ],
    [
      [-2, 0],
      [2, 0],
    ],
  ],
  dots: [{ at: [-2, 0] }, { at: [0, 0] }, { at: [2, 0] }],
  labels: [{ at: [1, 0.15], text: "r" }],
};

// 29: trójkąt równoboczny ABC, wysokość CD, E na CD (|CE| = ¾|CD|), EF ⟂ BC
const H29 = Math.sqrt(3) * 2; // bok 4
const C29: Point = [2, H29];
const E29: Point = [2, H29 / 4];
const F29: Point = (() => {
  // rzut E na prostą BC: B = (4, 0), kierunek C − B
  const [bx, by] = [4, 0];
  const [dx, dy] = [C29[0] - bx, C29[1] - by];
  const t = ((E29[0] - bx) * dx + (E29[1] - by) * dy) / (dx * dx + dy * dy);
  return [bx + t * dx, by + t * dy];
})();
const FIG29: Plot = {
  axes: false,
  x: [-0.6, 4.8],
  y: [-0.7, 4.2],
  lines: [
    [[0, 0], [4, 0], C29, [0, 0]],
    [C29, [2, 0]],
    [E29, F29],
    rightMark(F29, C29, E29, 0.25),
  ],
  dots: [{ at: [0, 0] }, { at: [2, 0] }, { at: [4, 0] }, { at: C29 }, { at: E29 }, { at: F29 }],
  labels: [
    { at: [-0.25, -0.45], text: "A" },
    { at: [2, -0.5], text: "D" },
    { at: [4.25, -0.45], text: "B" },
    { at: [2, C29[1] + 0.25], text: "C" },
    { at: [1.7, E29[1]], text: "E", anchor: "end" },
    { at: [F29[0] + 0.2, F29[1] + 0.05], text: "F", anchor: "start" },
  ],
};

// 34: ostrosłup prawidłowy czworokątny ABCDS (rzut ukośny), krawędź boczna 6
const [A34, B34, C34, D34]: Point[] = [[0, 0], [3.2, 0], [5, 1.05], [1.8, 1.05]];
const S34: Point = [2.5, 4.4];
const FIG34: Plot = {
  axes: false,
  x: [-0.6, 5.8],
  y: [-0.7, 5],
  guides: [
    [A34, D34, C34],
    [D34, S34],
    [D34, B34],
  ],
  lines: [
    [A34, B34, C34],
    [A34, S34, C34],
    [B34, S34],
    [A34, C34],
  ],
  dots: [{ at: A34 }, { at: B34 }, { at: C34 }, { at: D34 }, { at: S34 }],
  labels: [
    { at: [-0.2, -0.45], text: "A" },
    { at: [3.3, -0.5], text: "B" },
    { at: [5.3, 1], text: "C", anchor: "start" },
    { at: [1.6, 1.3], text: "D", anchor: "end" },
    { at: [2.5, 4.75], text: "S" },
    { at: [4.05, 2.95], text: "6", anchor: "start" },
  ],
};

const INFO_7_9 =
  "Funkcja kwadratowa $f$ jest określona wzorem $f(x) = a(x - 1)(x - 3)$. Na rysunku przedstawiono fragment paraboli będącej wykresem tej funkcji. Wierzchołkiem tej paraboli jest punkt $W = (2, 1)$.";

const TASKS: [string, PracticeTask][] = [
  [
    "1",
    closed("1", "Wartość wyrażenia $x^2 - 6x + 9$ dla $x = \\sqrt{3} + 3$ jest równa", ["$1$", "$3$", "$1 + 2\\sqrt{3}$", "$1 - 2\\sqrt{3}$"], "B", "$x^2 - 6x + 9 = (x - 3)^2 = (\\sqrt{3})^2 = 3$."),
  ],
  [
    "2",
    closed(
      "2",
      "Liczba $\\frac{2^{50} \\cdot 3^{40}}{36^{10}}$ jest równa",
      ["$6^{70}$", "$6^{45}$", "$2^{30} \\cdot 3^{20}$", "$2^{10} \\cdot 3^{20}$"],
      "C",
      "$36^{10} = (2^2 \\cdot 3^2)^{10} = 2^{20} \\cdot 3^{20}$, więc iloraz to $2^{30} \\cdot 3^{20}$.",
    ),
  ],
  ["3", closed("3", "Liczba $\\log_5\\sqrt{125}$ jest równa", ["$\\frac{2}{3}$", "$2$", "$3$", "$\\frac{3}{2}$"], "D", "$\\sqrt{125} = 5^{\\frac{3}{2}}$, więc $\\log_5\\sqrt{125} = \\frac{3}{2}$.")],
  [
    "4",
    closed(
      "4",
      "Cenę $x$ pewnego towaru obniżono o $20\\%$ i otrzymano cenę $y$. Aby przywrócić cenę $x$, nową cenę $y$ należy podnieść o",
      ["$25\\%$", "$20\\%$", "$15\\%$", "$12\\%$"],
      "A",
      "$y = 0{,}8x$, więc $x = \\frac{y}{0{,}8} = 1{,}25y$ – trzeba podnieść o $25\\%$.",
    ),
  ],
  [
    "5",
    closed(
      "5",
      "Zbiorem wszystkich rozwiązań nierówności $3(1 - x) > 2(3x - 1) - 12x$ jest przedział",
      ["$\\left(-\\frac{5}{3}, +\\infty\\right)$", "$\\left(-\\infty, \\frac{5}{3}\\right)$", "$\\left(\\frac{5}{3}, +\\infty\\right)$", "$\\left(-\\infty, -\\frac{5}{3}\\right)$"],
      "A",
      "$3 - 3x > 6x - 2 - 12x$, czyli $3 - 3x > -6x - 2$, stąd $3x > -5$ i $x > -\\frac{5}{3}$.",
    ),
  ],
  ["6", closed("6", "Suma wszystkich rozwiązań równania $x(x - 3)(x + 2) = 0$ jest równa", ["$0$", "$1$", "$2$", "$3$"], "B", "Rozwiązania: $0$, $3$, $-2$ – ich suma to $1$.")],
  ["7", closed("7", `${INFO_7_9}\n\nWspółczynnik $a$ we wzorze funkcji $f$ jest równy`, ["$1$", "$2$", "$-2$", "$-1$"], "D", "$f(2) = a \\cdot 1 \\cdot (-1) = -a = 1$, więc $a = -1$.", F7)],
  [
    "8",
    closed("8", `${INFO_7_9}\n\nNajwiększa wartość funkcji $f$ w przedziale $\\langle 1, 4 \\rangle$ jest równa`, ["$-3$", "$0$", "$1$", "$2$"], "C", "Wierzchołek $W = (2, 1)$ leży w przedziale $\\langle 1, 4 \\rangle$, a ramiona są skierowane w dół – największa wartość to $1$.", F7),
  ],
  ["9", closed("9", `${INFO_7_9}\n\nOsią symetrii paraboli będącej wykresem funkcji $f$ jest prosta o równaniu`, ["$x = 1$", "$x = 2$", "$y = 1$", "$y = 2$"], "B", "Oś symetrii przechodzi przez wierzchołek $W = (2, 1)$ pionowo: $x = 2$.", F7)],
  [
    "10",
    closed(
      "10",
      "Równanie $x(x - 2) = (x - 2)^2$ w zbiorze liczb rzeczywistych",
      ["nie ma rozwiązań.", "ma dokładnie jedno rozwiązanie: $x = 2$.", "ma dokładnie jedno rozwiązanie: $x = 0$.", "ma dwa różne rozwiązania: $x = 1$ i $x = 2$."],
      "B",
      "$x(x - 2) - (x - 2)^2 = (x - 2)(x - x + 2) = 2(x - 2) = 0$, więc $x = 2$.",
    ),
  ],
  [
    "11",
    closed(
      "11",
      "Na rysunku przedstawiono fragment wykresu funkcji liniowej $f$ określonej wzorem $f(x) = ax + b$.\n\nWspółczynniki $a$ oraz $b$ we wzorze funkcji $f$ spełniają zależność",
      ["$a + b > 0$", "$a + b = 0$", "$a \\cdot b > 0$", "$a \\cdot b < 0$"],
      "D",
      "Funkcja maleje, więc $a < 0$, a wykres przecina oś $Oy$ powyżej zera, więc $b > 0$. Stąd $a \\cdot b < 0$.",
      F11,
    ),
  ],
  [
    "12",
    closed(
      "12",
      "Funkcja $f$ jest określona wzorem $f(x) = 4^{-x} + 1$ dla każdej liczby rzeczywistej $x$. Liczba $f\\left(\\frac{1}{2}\\right)$ jest równa",
      ["$\\frac{1}{2}$", "$\\frac{3}{2}$", "$3$", "$17$"],
      "B",
      "$4^{-\\frac{1}{2}} = \\frac{1}{\\sqrt{4}} = \\frac{1}{2}$, więc $f\\left(\\frac{1}{2}\\right) = \\frac{3}{2}$.",
    ),
  ],
  [
    "13",
    closed(
      "13",
      "Proste o równaniach $y = (m - 2)x$ oraz $y = \\frac{3}{4}x + 7$ są równoległe. Wtedy",
      ["$m = -\\frac{5}{4}$", "$m = \\frac{2}{3}$", "$m = \\frac{11}{4}$", "$m = \\frac{10}{3}$"],
      "C",
      "Równe współczynniki kierunkowe: $m - 2 = \\frac{3}{4}$, więc $m = \\frac{11}{4}$.",
    ),
  ],
  ["14", closed("14", "Ciąg $(a_n)$ jest określony wzorem $a_n = 2n^2$ dla $n \\ge 1$. Różnica $a_5 - a_4$ jest równa", ["$4$", "$20$", "$36$", "$18$"], "D", "$a_5 - a_4 = 50 - 32 = 18$.")],
  [
    "15",
    closed(
      "15",
      "W ciągu arytmetycznym $(a_n)$, określonym dla $n \\ge 1$, czwarty wyraz jest równy $3$, a różnica tego ciągu jest równa $5$. Suma $a_1 + a_2 + a_3 + a_4$ jest równa",
      ["$-42$", "$-36$", "$-18$", "$6$"],
      "C",
      "$a_1 = a_4 - 3r = -12$, więc $S_4 = \\frac{a_1 + a_4}{2} \\cdot 4 = \\frac{-12 + 3}{2} \\cdot 4 = -18$.",
    ),
  ],
  [
    "16",
    closed(
      "16",
      "Punkt $A = \\left(\\frac{1}{3}, -1\\right)$ należy do wykresu funkcji liniowej $f$ określonej wzorem $f(x) = 3x + b$. Wynika stąd, że",
      ["$b = 2$", "$b = 1$", "$b = -1$", "$b = -2$"],
      "D",
      "$3 \\cdot \\frac{1}{3} + b = -1$, czyli $1 + b = -1$ i $b = -2$.",
    ),
  ],
  [
    "17",
    closed(
      "17",
      "Punkty $A$, $B$, $C$, $D$ leżą na okręgu o środku w punkcie $O$. Kąt środkowy $DOC$ ma miarę $118^\\circ$ (zobacz rysunek).\n\nMiara kąta $ABC$ jest równa",
      ["$59^\\circ$", "$48^\\circ$", "$62^\\circ$", "$31^\\circ$"],
      "D",
      "$AD$ i $BC$ to średnice, więc $|\\angle AOC| = 180^\\circ - 118^\\circ = 62^\\circ$. Kąt wpisany $ABC$ jest oparty na tym samym łuku: $\\frac{62^\\circ}{2} = 31^\\circ$.",
      F17,
    ),
  ],
  [
    "18",
    closed(
      "18",
      "Prosta przechodząca przez punkty $A = (3, -2)$ i $B = (-1, 6)$ jest określona równaniem",
      ["$y = -2x + 4$", "$y = -2x - 8$", "$y = 2x + 8$", "$y = 2x - 4$"],
      "A",
      "$a = \\frac{6 - (-2)}{-1 - 3} = -2$, a z punktu $A$: $-2 = -6 + b$, więc $b = 4$.",
    ),
  ],
  [
    "19",
    closed(
      "19",
      "Dany jest trójkąt prostokątny o kątach ostrych $\\alpha$ i $\\beta$ (zobacz rysunek).\n\nWyrażenie $2\\cos\\alpha - \\sin\\beta$ jest równe",
      ["$2\\sin\\beta$", "$\\cos\\alpha$", "$0$", "$2$"],
      "B",
      "$\\alpha + \\beta = 90^\\circ$, więc $\\sin\\beta = \\cos\\alpha$ i $2\\cos\\alpha - \\cos\\alpha = \\cos\\alpha$.",
      F19,
    ),
  ],
  [
    "20",
    closed(
      "20",
      "Punkt $B$ jest obrazem punktu $A = (-3, 5)$ w symetrii względem początku układu współrzędnych. Długość odcinka $AB$ jest równa",
      ["$2\\sqrt{34}$", "$8$", "$\\sqrt{34}$", "$12$"],
      "A",
      "$B = (3, -5)$, więc $|AB| = \\sqrt{6^2 + 10^2} = \\sqrt{136} = 2\\sqrt{34}$.",
    ),
  ],
  [
    "21",
    closed(
      "21",
      "Ile jest wszystkich dwucyfrowych liczb naturalnych utworzonych z cyfr: $1, 3, 5, 7, 9$, w których cyfry się nie powtarzają?",
      ["$10$", "$15$", "$20$", "$25$"],
      "C",
      "Cyfra dziesiątek – $5$ sposobów, cyfra jedności – $4$ (inna niż dziesiątek): $5 \\cdot 4 = 20$.",
    ),
  ],
  [
    "22",
    closed(
      "22",
      "Pole prostokąta $ABCD$ jest równe $90$. Na bokach $AB$ i $CD$ wybrano – odpowiednio – punkty $P$ i $R$, takie, że $\\frac{|AP|}{|PB|} = \\frac{|CR|}{|RD|} = \\frac{3}{2}$ (zobacz rysunek).\n\nPole czworokąta $APCR$ jest równe",
      ["$36$", "$40$", "$54$", "$60$"],
      "C",
      "$APCR$ to równoległobok o podstawie $|AP| = \\frac{3}{5}|AB|$ i wysokości $|BC|$, więc jego pole to $\\frac{3}{5} \\cdot 90 = 54$.",
      F22,
    ),
  ],
  [
    "23",
    closed(
      "23",
      "Cztery liczby: $2, 3, a, 8$, tworzące zestaw danych, są uporządkowane rosnąco. Mediana tego zestawu czterech danych jest równa medianie zestawu pięciu danych: $5, 3, 6, 8, 2$. Zatem",
      ["$a = 7$", "$a = 6$", "$a = 5$", "$a = 4$"],
      "A",
      "Mediana zestawu $2, 3, 5, 6, 8$ to $5$, więc $\\frac{3 + a}{2} = 5$ i $a = 7$.",
    ),
  ],
  [
    "24",
    closed(
      "24",
      "Przekątna sześcianu ma długość $4\\sqrt{3}$. Pole powierzchni tego sześcianu jest równe",
      ["$96$", "$24\\sqrt{3}$", "$192$", "$16\\sqrt{3}$"],
      "A",
      "Przekątna sześcianu to $a\\sqrt{3}$, więc $a = 4$ i $P = 6a^2 = 96$.",
    ),
  ],
  [
    "25",
    closed(
      "25",
      "Dwa stożki o takich samych podstawach połączono podstawami w taki sposób jak na rysunku. Stosunek wysokości tych stożków jest równy $3 : 2$. Objętość stożka o krótszej wysokości jest równa $12$ cm³.\n\nObjętość bryły utworzonej z połączonych stożków jest równa",
      ["$20$ cm³", "$30$ cm³", "$39$ cm³", "$52{,}5$ cm³"],
      "B",
      "Przy tej samej podstawie objętości są w stosunku wysokości: wyższy stożek ma $\\frac{3}{2} \\cdot 12 = 18$ cm³, razem $30$ cm³.",
      F25,
    ),
  ],
  [
    "26",
    open(
      "26",
      "Rozwiąż nierówność $2(x - 1)(x + 3) > x - 1$.",
      ["(-∞, -5/2) ∪ (1, +∞)"],
      ["Postać $(x - 1)(2x + 5) > 0$ (albo $2x^2 + 3x - 5 > 0$); pierwiastki: $x_1 = -\\frac{5}{2}$, $x_2 = 1$.", "Ramiona paraboli w górę: $x \\in \\left(-\\infty, -\\frac{5}{2}\\right) \\cup (1, +\\infty)$."],
    ),
  ],
  [
    "27",
    open(
      "27",
      "Rozwiąż równanie $(x^2 - 1)(x^2 - 2x) = 0$.\n\n(Wpisz wszystkie rozwiązania, oddzielone średnikiem.)",
      ["-1; 0; 1; 2"],
      ["Każdy czynnik przyrównany do zera: $x^2 - 1 = 0$ lub $x^2 - 2x = 0$ (albo rozwiązania jednego z nich).", "$x = -1$, $x = 1$, $x = 0$, $x = 2$."],
      { answerLabel: "x =" },
    ),
  ],
  [
    "28",
    open(
      "28",
      "Wykaż, że dla każdych dwóch różnych liczb rzeczywistych $a$ i $b$ prawdziwa jest nierówność\n\n$$a(a - 2b) + 2b^2 > 0$$",
      [],
      [
        "Przekształcenie do postaci $(a - b)^2 + b^2 > 0$ (albo potraktowanie lewej strony jako trójmianu zmiennej $a$ z $\\Delta = -4b^2$).",
        "Uzasadnienie: $a \\ne b$, więc $(a - b)^2 > 0$, a $b^2 \\ge 0$ – suma jest dodatnia.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "29",
    open(
      "29",
      "Trójkąt $ABC$ jest równoboczny. Punkt $E$ leży na wysokości $CD$ tego trójkąta oraz $|CE| = \\frac{3}{4}|CD|$. Punkt $F$ leży na boku $BC$ i odcinek $EF$ jest prostopadły do $BC$ (zobacz rysunek).\n\nWykaż, że $|CF| = \\frac{9}{16}|CB|$.",
      [],
      [
        "Trójkąty $CFE$ i $CDB$ są podobne (albo: $|\\angle ECF| = 30^\\circ$, więc $|CF| = |CE| \\cos 30^\\circ$), np. $\\frac{|CF|}{|CE|} = \\frac{|CD|}{|CB|}$.",
        "Z $|CD| = \\frac{\\sqrt{3}}{2}|CB|$: $|CF| = \\frac{3}{4} \\cdot \\frac{\\sqrt{3}}{2}|CB| \\cdot \\frac{\\sqrt{3}}{2} = \\frac{9}{16}|CB|$.",
      ],
      { format: "proof", figure: FIG29 },
    ),
  ],
  [
    "30",
    open(
      "30",
      "Rzucamy dwa razy symetryczną sześcienną kostką do gry, która na każdej ściance ma inną liczbę oczek – od jednego oczka do sześciu oczek. Oblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że co najmniej jeden raz wypadnie ścianka z pięcioma oczkami.",
      ["11/36"],
      ["$|\\Omega| = 36$ (albo zdarzenie przeciwne: żadnej piątki, $5 \\cdot 5 = 25$ wyników).", "$|A| = 11$, więc $P(A) = \\frac{11}{36}$."],
      { answerLabel: "P(A) =" },
    ),
  ],
  [
    "31",
    open(
      "31",
      "Kąt $\\alpha$ jest ostry i spełnia warunek $\\frac{2\\sin\\alpha + 3\\cos\\alpha}{\\cos\\alpha} = 4$. Oblicz tangens kąta $\\alpha$.",
      ["1/2"],
      ["Podział licznika przez $\\cos\\alpha$: $2\\operatorname{tg}\\alpha + 3 = 4$ (albo $2\\sin\\alpha = \\cos\\alpha$).", "$\\operatorname{tg}\\alpha = \\frac{1}{2}$."],
      { answerLabel: "\\operatorname{tg}\\alpha =" },
    ),
  ],
  [
    "32",
    open(
      "32",
      "Dany jest kwadrat $ABCD$, w którym $A = \\left(5, -\\frac{5}{3}\\right)$. Przekątna $BD$ tego kwadratu jest zawarta w prostej o równaniu $y = \\frac{4}{3}x$. Oblicz współrzędne punktu przecięcia przekątnych $AC$ i $BD$ oraz pole kwadratu $ABCD$.\n\n(W aplikacji wpisz obie współrzędne punktu przecięcia i pole, oddzielone średnikiem.)",
      ["1; 4/3; 50"],
      [
        "Prosta $AC$ jest prostopadła do $BD$ i przechodzi przez $A$: $y = -\\frac{3}{4}x + \\frac{25}{12}$.",
        "Punkt przecięcia przekątnych: $\\frac{4}{3}x = -\\frac{3}{4}x + \\frac{25}{12}$, więc $O = \\left(1, \\frac{4}{3}\\right)$.",
        "$|AO| = \\sqrt{4^2 + 3^2} = 5$, więc przekątna kwadratu ma długość $10$.",
        "Pole kwadratu: $\\frac{10^2}{2} = 50$.",
      ],
      { answerLabel: "x_O;\\ y_O;\\ P =" },
    ),
  ],
  [
    "33",
    open(
      "33",
      "Wszystkie wyrazy ciągu geometrycznego $(a_n)$, określonego dla $n \\ge 1$, są dodatnie. Wyrazy tego ciągu spełniają warunek $6a_1 - 5a_2 + a_3 = 0$. Oblicz iloraz $q$ tego ciągu należący do przedziału $\\langle 2\\sqrt{2}, 3\\sqrt{2} \\rangle$.",
      ["3"],
      [
        "Zapisanie wyrazów przez $a_1$ i $q$: $a_2 = a_1q$, $a_3 = a_1q^2$.",
        "Równanie $6a_1 - 5a_1q + a_1q^2 = 0$, a po podzieleniu przez $a_1 > 0$: $q^2 - 5q + 6 = 0$.",
        "Rozwiązania: $q = 2$ lub $q = 3$.",
        "Do przedziału $\\langle 2\\sqrt{2}, 3\\sqrt{2} \\rangle \\approx \\langle 2{,}83;\\ 4{,}24 \\rangle$ należy tylko $q = 3$.",
      ],
      { answerLabel: "q =" },
    ),
  ],
  [
    "34",
    open(
      "34",
      "Dany jest ostrosłup prawidłowy czworokątny $ABCDS$, którego krawędź boczna ma długość $6$ (zobacz rysunek). Ściana boczna tego ostrosłupa jest nachylona do płaszczyzny podstawy pod kątem, którego tangens jest równy $\\sqrt{7}$. Oblicz objętość tego ostrosłupa.",
      ["32√7/3"],
      [
        "Kąt nachylenia ściany: $\\operatorname{tg}\\alpha = \\frac{H}{\\frac{a}{2}} = \\sqrt{7}$, gdzie $a$ – krawędź podstawy, $H$ – wysokość ostrosłupa.",
        "Układ: $H = \\frac{a}{2}\\sqrt{7}$ i $H^2 + \\left(\\frac{a\\sqrt{2}}{2}\\right)^2 = 6^2$.",
        "Równanie z jedną niewiadomą: $\\frac{7a^2}{4} + \\frac{a^2}{2} = 36$.",
        "$a = 4$ i $H = 2\\sqrt{7}$.",
        "$V = \\frac{1}{3} \\cdot 16 \\cdot 2\\sqrt{7} = \\frac{32\\sqrt{7}}{3}$.",
      ],
      { answerLabel: "V =", figure: FIG34 },
    ),
  ],
];

export const CKE_2020_CZERWIEC: ExamSheet = {
  id: "cke-2020-czerwiec",
  kind: "cke",
  year: 2020,
  session: "czerwiec",
  title: "Matura czerwiec 2020",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy · formuła 2015",
  level: "podstawowy",
  durationMin: 170,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2020/formula_od_2015/matematyka/MMA-P1_1P-202.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2020/formula_od_2015/Zasady_oceniania/MMA-PP-202_zasady.pdf",
  },
};
