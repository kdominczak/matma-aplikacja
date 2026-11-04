import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, 5 maja 2022 (formuła 2015, 45 pkt, 170 min) – arkusz EMAP-P0-100-2205.
// Treść przepisana z PDF CKE, klucz (wersja A) i schematy punktowania z „Zasad oceniania” (termin główny 2022).
// Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Formuła 2015 (matury 2015–2024 dla absolwentów starszej podstawy): wszystkie zadania zamknięte to ABCD,
// zakres prawie ten sam co dziś (2022 – wymagania okrojone po pandemii). Przedziały zapisane jak w arkuszu: ⟨ ⟩.
// Różnice wobec papieru: rysunki odtworzone z danych zadania (nie skany); w zad. 10 oba wykresy na jednym rysunku
// (f – linia przerywana, g – ciągła); zadania otwarte – schemat CKE jako kolejne kroki po 1 pkt.

const LABEL = "Matura CKE · maj 2022";
const id = (n: string) => `cke-2022-maj-${n}`;

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

// ── Rysunki ──

// 9: łamana (−8, −3) – (−4, −3) – (3, 4) – (8, 4)
const F9: Plot = {
  x: [-9.5, 10.5],
  y: [-4.5, 6.5],
  lines: [
    [
      [-8, -3],
      [-4, -3],
      [3, 4],
      [8, 4],
    ],
  ],
  dots: [{ at: [-8, -3] }, { at: [8, 4] }],
};

// 10: f na ⟨−4, 5⟩ (przerywana) i g – ten sam wykres przesunięty o 2 w lewo (ciągła)
const F10: Plot = {
  x: [-6.5, 5.5],
  y: [-4.5, 3.5],
  guides: [
    [
      [-4, 1],
      [-2, -1],
      [0, 2],
      [5, -3],
    ],
  ],
  lines: [
    [
      [-6, 1],
      [-4, -1],
      [-2, 2],
      [3, -3],
    ],
  ],
  dots: [{ at: [-4, 1] }, { at: [5, -3] }, { at: [-6, 1] }, { at: [3, -3] }],
  labels: [
    { at: [1.2, 2.2], text: "y = f(x)", anchor: "start" },
    { at: [-5.8, -2.2], text: "y = g(x)", anchor: "start" },
  ],
};

// 17: okrąg o środku S; C (0°), A (143°), B (216°), średnica z B przez S; D = AC ∩ średnica
const [A17, B17, C17, E17] = [onCircle(143), onCircle(216), onCircle(0), onCircle(36)];
const D17: Point = (() => {
  // przecięcie odcinka AC z prostą przez B i S (S = (0, 0))
  const [dx, dy] = [C17[0] - A17[0], C17[1] - A17[1]];
  const t = (B17[1] * A17[0] - B17[0] * A17[1]) / (B17[0] * dy - B17[1] * dx);
  return [A17[0] + t * dx, A17[1] + t * dy];
})();
const F17: Plot = {
  axes: false,
  x: [-1.35, 1.45],
  y: [-1.2, 1.2],
  lines: [circle(), [B17, A17, C17], [B17, E17], [[0, 0], C17]],
  fills: [[B17, ...Array.from({ length: 7 }, (_, i): Point => {
    // kąt ABD przy B (szary wycinek)
    const from = Math.atan2(A17[1] - B17[1], A17[0] - B17[0]);
    const to = Math.atan2(-B17[1], -B17[0]);
    const a = from + ((to - from) * i) / 6;
    return [B17[0] + 0.18 * Math.cos(a), B17[1] + 0.18 * Math.sin(a)];
  })]],
  dots: [{ at: [0, 0] }],
  labels: [
    { at: [A17[0] - 0.08, A17[1] + 0.06], text: "A", anchor: "end" },
    { at: [B17[0] - 0.06, B17[1] - 0.12], text: "B", anchor: "end" },
    { at: [C17[0] + 0.06, C17[1] - 0.04], text: "C", anchor: "start" },
    { at: [D17[0] + 0.02, D17[1] + 0.1], text: "D" },
    { at: [-0.12, 0.02], text: "S", anchor: "end" },
    { at: [D17[0] - 0.12, D17[1] + 0.0], text: "γ" },
    { at: [0.02, -0.22], text: "α" },
  ],
};

// 18: okrąg o środku S i promieniu 6; P (90°), A (150°), B (30°); zakreskowany wycinek ASB (120°)
const [A18, P18, B18] = [onCircle(150, 6), onCircle(90, 6), onCircle(30, 6)];
const F18: Plot = {
  axes: false,
  x: [-7, 7],
  y: [-6.8, 7.2],
  fills: [[[0, 0], ...Array.from({ length: 25 }, (_, i) => onCircle(150 - i * 5, 6))]],
  lines: [circle(6), [A18, P18, B18, [0, 0], A18]],
  dots: [{ at: A18 }, { at: P18 }, { at: B18 }, { at: [0, 0] }],
  labels: [
    { at: [A18[0] - 0.3, A18[1] + 0.2], text: "A", anchor: "end" },
    { at: [P18[0], P18[1] + 0.6], text: "P" },
    { at: [B18[0] + 0.3, B18[1] + 0.2], text: "B", anchor: "start" },
    { at: [0, -0.9], text: "S" },
    { at: [A18[0] + 1.2, A18[1] + 0.1], text: "60°", anchor: "start" },
  ],
};

// 26: sześcian ABCDEFGH (rzut ukośny), ostrosłup EFGB – krawędzie EG, EB, GB
const [A26, B26, C26, D26] = [[0, 0], [4, 0], [5.4, 1.4], [1.4, 1.4]] as Point[];
const up = (p: Point): Point => [p[0], p[1] + 4];
const [E26, Fv26, G26, H26] = [up(A26), up(B26), up(C26), up(D26)];
const FIG26: Plot = {
  axes: false,
  x: [-0.8, 6.2],
  y: [-0.9, 6.1],
  guides: [
    [A26, D26, C26],
    [D26, H26],
  ],
  lines: [[A26, B26, C26, G26, H26, E26, A26], [E26, Fv26, B26], [Fv26, G26], [E26, G26], [E26, B26, G26]],
  labels: [
    { at: [-0.25, -0.35], text: "A" },
    { at: [4.15, -0.4], text: "B" },
    { at: [5.75, 1.3], text: "C", anchor: "start" },
    { at: [1.65, 1.75], text: "D", anchor: "start" },
    { at: [-0.25, 4.1], text: "E", anchor: "end" },
    { at: [3.7, 3.55], text: "F" },
    { at: [5.7, 5.6], text: "G", anchor: "start" },
    { at: [1.4, 5.8], text: "H" },
    { at: [2, -0.45], text: "a" },
  ],
};

// 33: trójkąt równoramienny, |∠BAC| = |∠ABC| = 72°, AD – dwusieczna kąta BAC
const C33: Point = [1, Math.tan(rad(72))];
const D33: Point = (() => {
  const k = Math.tan(rad(36));
  const t = (2 * k) / (C33[1] + k); // B + t(C − B) leży na y = kx
  return [2 - t, C33[1] * t];
})();
const F33: Plot = {
  axes: false,
  x: [-0.5, 2.6],
  y: [-0.45, 3.45],
  lines: [
    [[0, 0], [2, 0], C33, [0, 0]],
    [[0, 0], D33],
  ],
  labels: [
    { at: [-0.12, -0.25], text: "A" },
    { at: [2.1, -0.25], text: "B" },
    { at: [1, 3.25], text: "C" },
    { at: [D33[0] + 0.12, D33[1] + 0.05], text: "D", anchor: "start" },
  ],
};

const TASKS: [string, PracticeTask][] = [
  ["1", closed("1", "Liczba $(2\\sqrt{8} - 3\\sqrt{2})^2$ jest równa", ["$2$", "$1$", "$26$", "$14$"], "A", "$2\\sqrt{8} = 4\\sqrt{2}$, więc $(4\\sqrt{2} - 3\\sqrt{2})^2 = (\\sqrt{2})^2 = 2$.")],
  [
    "2",
    closed(
      "2",
      "Dodatnie liczby $x$ i $y$ spełniają warunek $2x = 3y$. Wynika stąd, że wartość wyrażenia $\\frac{x^2 + y^2}{x \\cdot y}$ jest równa",
      ["$\\frac{2}{3}$", "$\\frac{13}{6}$", "$\\frac{6}{13}$", "$\\frac{3}{2}$"],
      "B",
      "$x = \\frac{3}{2}y$, więc $\\frac{\\frac{9}{4}y^2 + y^2}{\\frac{3}{2}y^2} = \\frac{13}{4} \\cdot \\frac{2}{3} = \\frac{13}{6}$.",
    ),
  ],
  ["3", closed("3", "Liczba $4\\log_4 2 + 2\\log_4 8$ jest równa", ["$6\\log_4 10$", "$16$", "$5$", "$6\\log_4 16$"], "C", "$\\log_4 2 = \\frac{1}{2}$, $\\log_4 8 = \\frac{3}{2}$, więc $4 \\cdot \\frac{1}{2} + 2 \\cdot \\frac{3}{2} = 5$.")],
  [
    "4",
    closed(
      "4",
      "Cena działki po kolejnych dwóch obniżkach, za każdym razem o $10\\%$ w odniesieniu do ceny obowiązującej w danym momencie, jest równa $78\\,732$ zł. Cena tej działki przed obiema obniżkami była, w zaokrągleniu do $1$ zł, równa",
      ["$98\\,732$ zł", "$97\\,200$ zł", "$95\\,266$ zł", "$94\\,478$ zł"],
      "B",
      "$x \\cdot 0{,}9^2 = 78\\,732$, więc $x = \\frac{78\\,732}{0{,}81} = 97\\,200$ zł.",
    ),
  ],
  [
    "5",
    closed("5", "Liczba $3^{2 + \\frac{1}{4}}$ jest równa", ["$3^2 \\cdot \\sqrt[4]{3}$", "$\\sqrt[4]{3^3}$", "$3^2 + \\sqrt[4]{3}$", "$3^2 + \\sqrt{3^4}$"], "A", "$3^{2 + \\frac{1}{4}} = 3^2 \\cdot 3^{\\frac{1}{4}} = 3^2 \\cdot \\sqrt[4]{3}$."),
  ],
  [
    "6",
    closed(
      "6",
      "Rozwiązaniem układu równań $\\begin{cases} 11x - 11y = 1 \\\\ 22x + 22y = -1 \\end{cases}$ jest para liczb: $x = x_0$, $y = y_0$. Wtedy",
      ["$x_0 > 0$ i $y_0 > 0$", "$x_0 > 0$ i $y_0 < 0$", "$x_0 < 0$ i $y_0 > 0$", "$x_0 < 0$ i $y_0 < 0$"],
      "B",
      "$x - y = \\frac{1}{11}$ i $x + y = -\\frac{1}{22}$, więc $x_0 = \\frac{1}{44} > 0$, $y_0 = -\\frac{3}{44} < 0$.",
    ),
  ],
  [
    "7",
    closed(
      "7",
      "Zbiorem wszystkich rozwiązań nierówności $\\frac{2}{5} - \\frac{x}{3} > \\frac{x}{5}$ jest przedział",
      ["$(-\\infty, 0)$", "$(0, +\\infty)$", "$\\left(-\\infty, \\frac{3}{4}\\right)$", "$\\left(\\frac{3}{4}, +\\infty\\right)$"],
      "C",
      "Mnożymy przez $15$: $6 - 5x > 3x$, czyli $x < \\frac{3}{4}$.",
    ),
  ],
  ["8", closed("8", "Iloczyn wszystkich rozwiązań równania $2x(x^2 - 9)(x + 1) = 0$ jest równy", ["$(-3)$", "$3$", "$0$", "$9$"], "C", "Rozwiązania: $0$, $3$, $-3$, $-1$ – wśród nich jest zero, więc iloczyn jest równy $0$.")],
  [
    "9",
    closed("9", "Na rysunku przedstawiono wykres funkcji $f$.\n\nIloczyn $f(-3) \\cdot f(0) \\cdot f(4)$ jest równy", ["$(-12)$", "$(-8)$", "$0$", "$16$"], "B", "Z wykresu: $f(-3) = -2$, $f(0) = 1$, $f(4) = 4$, więc iloczyn to $-8$.", F9),
  ],
  [
    "10",
    closed(
      "10",
      "Na rysunku przedstawiono wykres funkcji $f$ określonej na zbiorze $\\langle -4, 5 \\rangle$ (linia przerywana) oraz wykres funkcji $g$ określonej za pomocą funkcji $f$ (linia ciągła).\n\nWynika stąd, że",
      ["$g(x) = f(x) - 2$", "$g(x) = f(x - 2)$", "$g(x) = f(x) + 2$", "$g(x) = f(x + 2)$"],
      "D",
      "Wykres $g$ to wykres $f$ przesunięty o $2$ w lewo (o wektor $[-2, 0]$), czyli $g(x) = f(x + 2)$.",
      F10,
    ),
  ],
  ["11", closed("11", "Miejscem zerowym funkcji liniowej $f$ określonej wzorem $f(x) = -\\frac{1}{3}(x + 3) + 5$ jest liczba", ["$(-3)$", "$\\frac{9}{2}$", "$5$", "$12$"], "D", "$-\\frac{1}{3}(x + 3) + 5 = 0$, czyli $x + 3 = 15$ i $x = 12$.")],
  [
    "12",
    closed(
      "12",
      "Wykresem funkcji kwadratowej $f(x) = 3x^2 + bx + c$ jest parabola o wierzchołku w punkcie $W = (-3, 2)$. Wzór tej funkcji w postaci kanonicznej to",
      ["$f(x) = 3(x - 3)^2 + 2$", "$f(x) = 3(x + 3)^2 + 2$", "$f(x) = (x - 3)^2 + 2$", "$f(x) = (x + 3)^2 + 2$"],
      "B",
      "Postać kanoniczna $f(x) = a(x - p)^2 + q$ z $a = 3$, $p = -3$, $q = 2$.",
    ),
  ],
  ["13", closed("13", "Ciąg $(a_n)$ jest określony wzorem $a_n = \\frac{2n^2 - 30n}{n}$ dla każdej liczby naturalnej $n \\ge 1$. Wtedy $a_7$ jest równy", ["$(-196)$", "$(-32)$", "$(-26)$", "$(-16)$"], "D", "$a_n = 2n - 30$, więc $a_7 = 14 - 30 = -16$.")],
  [
    "14",
    closed("14", "W ciągu arytmetycznym $(a_n)$, określonym dla każdej liczby naturalnej $n \\ge 1$, $a_5 = -31$ oraz $a_{10} = -66$. Różnica tego ciągu jest równa", ["$(-7)$", "$(-19{,}4)$", "$7$", "$19{,}4$"], "A", "$a_{10} - a_5 = 5r = -35$, więc $r = -7$."),
  ],
  [
    "15",
    closed(
      "15",
      "Wszystkie wyrazy nieskończonego ciągu geometrycznego $(a_n)$, określonego dla każdej liczby naturalnej $n \\ge 1$, są dodatnie i $9a_5 = 4a_3$. Wtedy iloraz tego ciągu jest równy",
      ["$\\frac{2}{3}$", "$\\frac{3}{2}$", "$\\frac{2}{9}$", "$\\frac{9}{2}$"],
      "A",
      "$a_5 = a_3q^2$, więc $9q^2 = 4$ i $q = \\frac{2}{3}$ (wyrazy dodatnie – iloraz dodatni).",
    ),
  ],
  [
    "16",
    closed("16", "Liczba $\\cos 12^\\circ \\cdot \\sin 78^\\circ + \\sin 12^\\circ \\cdot \\cos 78^\\circ$ jest równa", ["$\\frac{1}{2}$", "$\\frac{\\sqrt{2}}{2}$", "$\\frac{\\sqrt{3}}{2}$", "$1$"], "D", "$\\sin 78^\\circ = \\cos 12^\\circ$ i $\\cos 78^\\circ = \\sin 12^\\circ$, więc wyrażenie to $\\cos^2 12^\\circ + \\sin^2 12^\\circ = 1$."),
  ],
  [
    "17",
    closed(
      "17",
      "Punkty $A$, $B$, $C$ leżą na okręgu o środku $S$. Punkt $D$ jest punktem przecięcia cięciwy $AC$ i średnicy okręgu poprowadzonej z punktu $B$. Miara kąta $BSC$ jest równa $\\alpha$, a miara kąta $ADB$ jest równa $\\gamma$ (zobacz rysunek).\n\nWtedy kąt $ABD$ ma miarę",
      ["$\\frac{\\alpha}{2} + \\gamma - 180^\\circ$", "$180^\\circ - \\frac{\\alpha}{2} - \\gamma$", "$180^\\circ - \\alpha - \\gamma$", "$\\alpha + \\gamma - 180^\\circ$"],
      "B",
      "Kąt wpisany $BAC$ jest oparty na tym samym łuku co kąt środkowy $BSC$, więc ma miarę $\\frac{\\alpha}{2}$. W trójkącie $ABD$: $|\\angle ABD| = 180^\\circ - \\frac{\\alpha}{2} - \\gamma$.",
      F17,
    ),
  ],
  [
    "18",
    closed(
      "18",
      "Punkty $A$, $B$, $P$ leżą na okręgu o środku $S$ i promieniu $6$. Czworokąt $ASBP$ jest rombem, w którym kąt ostry $PAS$ ma miarę $60^\\circ$ (zobacz rysunek).\n\nPole zakreskowanej na rysunku figury jest równe",
      ["$6\\pi$", "$9\\pi$", "$10\\pi$", "$12\\pi$"],
      "D",
      "Trójkąty $ASP$ i $PSB$ są równoboczne, więc $|\\angle ASB| = 120^\\circ$. Zakreskowana figura to wycinek koła: $\\frac{120^\\circ}{360^\\circ} \\cdot \\pi \\cdot 6^2 = 12\\pi$.",
      F18,
    ),
  ],
  ["19", closed("19", "Wysokość trójkąta równobocznego jest równa $6\\sqrt{3}$. Pole tego trójkąta jest równe", ["$3\\sqrt{3}$", "$4\\sqrt{3}$", "$27\\sqrt{3}$", "$36\\sqrt{3}$"], "D", "$\\frac{a\\sqrt{3}}{2} = 6\\sqrt{3}$, więc $a = 12$ i $P = \\frac{12^2\\sqrt{3}}{4} = 36\\sqrt{3}$.")],
  [
    "20",
    closed("20", "Boki równoległoboku mają długości $6$ i $10$, a kąt rozwarty między tymi bokami ma miarę $120^\\circ$. Pole tego równoległoboku jest równe", ["$30\\sqrt{3}$", "$30$", "$60\\sqrt{3}$", "$60$"], "A", "$P = 6 \\cdot 10 \\cdot \\sin 120^\\circ = 60 \\cdot \\frac{\\sqrt{3}}{2} = 30\\sqrt{3}$."),
  ],
  ["21", closed("21", "Punkty $A = (-2, 6)$ oraz $B = (3, b)$ leżą na prostej, która przechodzi przez początek układu współrzędnych. Wtedy $b$ jest równe", ["$9$", "$(-9)$", "$(-4)$", "$4$"], "B", "Prosta przez $(0, 0)$ i $A$: $y = -3x$, więc $b = -9$.")],
  [
    "22",
    closed(
      "22",
      "Dane są cztery proste $k$, $l$, $m$, $n$ o równaniach:\n\n$k\\colon y = -x + 1$, $\\quad l\\colon y = \\frac{2}{3}x + 1$, $\\quad m\\colon y = -\\frac{3}{2}x + 4$, $\\quad n\\colon y = -\\frac{2}{3}x - 1$.\n\nWśród tych prostych prostopadłe są",
      ["proste $k$ oraz $l$.", "proste $k$ oraz $n$.", "proste $l$ oraz $m$.", "proste $m$ oraz $n$."],
      "C",
      "Iloczyn współczynników kierunkowych prostych prostopadłych jest równy $-1$: $\\frac{2}{3} \\cdot \\left(-\\frac{3}{2}\\right) = -1$.",
    ),
  ],
  [
    "23",
    closed("23", "Punkty $K = (4, -10)$ i $L = (b, 2)$ są końcami odcinka $KL$. Pierwsza współrzędna środka odcinka $KL$ jest równa $(-12)$. Wynika stąd, że", ["$b = -28$", "$b = -14$", "$b = -24$", "$b = -10$"], "A", "$\\frac{4 + b}{2} = -12$, więc $b = -28$."),
  ],
  [
    "24",
    closed("24", "Punkty $A = (-4, 4)$ i $B = (4, 0)$ są sąsiednimi wierzchołkami kwadratu $ABCD$. Przekątna tego kwadratu ma długość", ["$4\\sqrt{10}$", "$4\\sqrt{2}$", "$4\\sqrt{5}$", "$4\\sqrt{7}$"], "A", "$|AB| = \\sqrt{8^2 + 4^2} = 4\\sqrt{5}$, przekątna $= |AB|\\sqrt{2} = 4\\sqrt{10}$."),
  ],
  [
    "25",
    closed(
      "25",
      "Podstawą graniastosłupa prostego jest romb o przekątnych długości $7$ cm i $10$ cm. Wysokość tego graniastosłupa jest krótsza od dłuższej przekątnej rombu o $2$ cm. Wtedy objętość graniastosłupa jest równa",
      ["$560$ cm³", "$280$ cm³", "$\\frac{280}{3}$ cm³", "$\\frac{560}{3}$ cm³"],
      "B",
      "Pole podstawy $\\frac{7 \\cdot 10}{2} = 35$ cm², wysokość $8$ cm, więc $V = 35 \\cdot 8 = 280$ cm³.",
    ),
  ],
  [
    "26",
    closed(
      "26",
      "Dany jest sześcian $ABCDEFGH$ o krawędzi długości $a$. Punkty $E$, $F$, $G$, $B$ są wierzchołkami ostrosłupa $EFGB$ (zobacz rysunek).\n\nPole powierzchni całkowitej ostrosłupa $EFGB$ jest równe",
      ["$a^2$", "$\\frac{3\\sqrt{3}}{2} \\cdot a^2$", "$\\frac{3}{2}a^2$", "$\\frac{3 + \\sqrt{3}}{2} \\cdot a^2$"],
      "D",
      "Trzy ściany ($EFG$, $EFB$, $FGB$) to trójkąty prostokątne o polu $\\frac{a^2}{2}$, czwarta ($EGB$) – trójkąt równoboczny o boku $a\\sqrt{2}$, pole $\\frac{(a\\sqrt{2})^2\\sqrt{3}}{4} = \\frac{\\sqrt{3}}{2}a^2$. Razem $\\frac{3 + \\sqrt{3}}{2}a^2$.",
      FIG26,
    ),
  ],
  [
    "27",
    closed("27", "Wszystkich różnych liczb naturalnych czterocyfrowych nieparzystych podzielnych przez $5$ jest", ["$9 \\cdot 8 \\cdot 7 \\cdot 2$", "$9 \\cdot 10 \\cdot 10 \\cdot 1$", "$9 \\cdot 10 \\cdot 10 \\cdot 2$", "$9 \\cdot 9 \\cdot 8 \\cdot 1$"], "B", "Nieparzysta i podzielna przez $5$ – ostatnia cyfra $5$ (1 sposób); pierwsza cyfra: $9$ sposobów, druga i trzecia: po $10$."),
  ],
  ["28", closed("28", "Średnia arytmetyczna zestawu sześciu liczb: $2x, 4, 6, 8, 11, 13$, jest równa $5$. Wynika stąd, że", ["$x = -1$", "$x = 7$", "$x = -6$", "$x = 6$"], "C", "$\\frac{2x + 42}{6} = 5$, więc $2x = -12$ i $x = -6$.")],
  [
    "29",
    open(
      "29",
      "Rozwiąż nierówność:\n\n$$3x^2 - 2x - 9 \\ge 7$$",
      ["(-∞, -2] ∪ [8/3, +∞)"],
      ["$3x^2 - 2x - 16 \\ge 0$; pierwiastki trójmianu: $x_1 = -2$, $x_2 = \\frac{8}{3}$.", "Ramiona paraboli w górę: $x \\in (-\\infty, -2\\rangle \\cup \\left\\langle \\frac{8}{3}, +\\infty\\right)$."],
    ),
  ],
  [
    "30",
    open(
      "30",
      "W ciągu arytmetycznym $(a_n)$, określonym dla każdej liczby naturalnej $n \\ge 1$, $a_1 = -1$ i $a_4 = 8$. Oblicz sumę stu początkowych kolejnych wyrazów tego ciągu.",
      ["14750"],
      ["$a_4 = a_1 + 3r$, więc $8 = -1 + 3r$ i $r = 3$.", "$S_{100} = \\frac{2 \\cdot (-1) + 99 \\cdot 3}{2} \\cdot 100 = 14\\,750$."],
      { answerLabel: "S_{100} =" },
    ),
  ],
  [
    "31",
    open(
      "31",
      "Wykaż, że dla każdej liczby rzeczywistej $a$ i każdej liczby rzeczywistej $b$ takich, że $b \\ne a$, spełniona jest nierówność\n\n$$\\frac{a^2 + b^2}{2} > \\left(\\frac{a + b}{2}\\right)^2$$",
      [],
      [
        "Przekształcenie nierówności do postaci równoważnej $(a - b)^2 > 0$ (albo $a^2 + b^2 > 2ab$).",
        "Uzasadnienie: $a \\ne b$, więc $a - b \\ne 0$ i $(a - b)^2 > 0$ – nierówność jest prawdziwa.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "32",
    open(
      "32",
      "Kąt $\\alpha$ jest ostry i $\\operatorname{tg}\\alpha = 2$. Oblicz wartość wyrażenia $\\sin^2\\alpha$.",
      ["4/5"],
      ["Układ $\\frac{\\sin\\alpha}{\\cos\\alpha} = 2$ i $\\sin^2\\alpha + \\cos^2\\alpha = 1$ (np. $\\sin^2\\alpha + \\frac{1}{4}\\sin^2\\alpha = 1$).", "$\\sin^2\\alpha = \\frac{4}{5}$."],
      { answerLabel: "\\sin^2\\alpha =" },
    ),
  ],
  [
    "33",
    open(
      "33",
      "Dany jest trójkąt równoramienny $ABC$, w którym $|AC| = |BC|$. Dwusieczna kąta $BAC$ przecina bok $BC$ w takim punkcie $D$, że trójkąty $ABC$ i $BDA$ są podobne (zobacz rysunek). Oblicz miarę kąta $BAC$.",
      ["72"],
      [
        "Zauważenie równości kątów z podobieństwa, np. $|\\angle BAD| = |\\angle ACB|$ (albo: trójkąt $ABD$ jest równoramienny, $|AB| = |AD|$).",
        "Oznaczenie $|\\angle BAC| = \\alpha$: $\\frac{\\alpha}{2} = 180^\\circ - 2\\alpha$, więc $|\\angle BAC| = 72^\\circ$.",
      ],
      { answerLabel: "|\\angle BAC| =", figure: F33 },
    ),
  ],
  [
    "34",
    open(
      "34",
      "Ze zbioru dziewięcioelementowego $M = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\}$ losujemy kolejno ze zwracaniem dwa razy po jednej liczbie. Zdarzenie $A$ polega na wylosowaniu dwóch liczb ze zbioru $M$, których iloczyn jest równy $24$. Oblicz prawdopodobieństwo zdarzenia $A$.",
      ["4/81"],
      ["$|\\Omega| = 9 \\cdot 9 = 81$ (albo wypisanie zdarzeń sprzyjających: $(3, 8)$, $(4, 6)$, $(6, 4)$, $(8, 3)$).", "$|A| = 4$, więc $P(A) = \\frac{4}{81}$."],
      { answerLabel: "P(A) =" },
    ),
  ],
  [
    "35",
    open(
      "35",
      "Wykres funkcji kwadratowej $f$ określonej wzorem $f(x) = ax^2 + bx + c$ ma z prostą o równaniu $y = 6$ dokładnie jeden punkt wspólny. Punkty $A = (-5, 0)$ i $B = (3, 0)$ należą do wykresu funkcji $f$. Oblicz wartości współczynników $a$, $b$ oraz $c$.\n\n(W aplikacji wpisz $a$, $b$ i $c$ w tej kolejności, oddzielone średnikiem.)",
      ["-3/8; -3/4; 45/8"],
      [
        "Postać iloczynowa $f(x) = a(x + 5)(x - 3)$ (albo odcięta wierzchołka $p = -1$).",
        "Prosta $y = 6$ ma z parabolą jeden punkt wspólny, więc wierzchołek to $W = (-1, 6)$.",
        "Równanie z jedną niewiadomą: $6 = a(-1 + 5)(-1 - 3)$, czyli $6 = -16a$.",
        "$a = -\\frac{3}{8}$.",
        "$f(x) = -\\frac{3}{8}(x^2 + 2x - 15)$, więc $b = -\\frac{3}{4}$ i $c = \\frac{45}{8}$.",
      ],
      { answerLabel: "a;\\ b;\\ c =" },
    ),
  ],
];

export const CKE_2022_MAJ: ExamSheet = {
  id: "cke-2022-maj",
  kind: "cke",
  year: 2022,
  session: "maj",
  title: "Matura maj 2022",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy · formuła 2015",
  level: "podstawowy",
  durationMin: 170,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2022/Matematyka/poziom_podstawowy/EMAP-P0-100-2205.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2022/Zasady_oceniania/EMAP-P0-100-2205-zasady.pdf",
  },
};
