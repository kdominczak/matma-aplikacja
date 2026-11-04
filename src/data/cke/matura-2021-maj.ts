import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion, OptionKey } from "@/types/quiz";

// Matura z matematyki, poziom podstawowy, 5 maja 2021 (formuła 2015, 45 pkt, 170 min) – arkusz EMAP-P0-100-2105.
// Treść przepisana z PDF CKE, klucz (wersja A) i schematy punktowania z „Zasad oceniania” (termin główny 2021).
// Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Formuła 2015, wymagania egzaminacyjne 2021 (okrojone po pandemii): wszystkie zadania zamknięte to ABCD,
// przedziały zapisane jak w arkuszu: ⟨ ⟩. Różnice wobec papieru: rysunki odtworzone z danych zadania (nie skany);
// w zad. 24 obie figury na jednym rysunku; zadania otwarte – schemat CKE jako kolejne kroki po 1 pkt.

const LABEL = "Matura CKE · maj 2021";
const id = (n: string) => `cke-2021-maj-${n}`;

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
const onCircle = (deg: number, r = 1, [cx, cy]: Point = [0, 0]): Point => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];
const circle = (r = 1, center: Point = [0, 0]): Point[] => Array.from({ length: 73 }, (_, i) => onCircle(i * 5, r, center));

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

// 7: f na ⟨−6, 5⟩ – odcinek (−6, 3)–(−3, 3) bez prawego końca, potem łamana (−3, 1)–(0, −2)–(3, 1)–(5, 1)
const F7: Plot = {
  x: [-9.5, 10.5],
  y: [-4.5, 6.5],
  lines: [
    [
      [-6, 3],
      [-3, 3],
    ],
    [
      [-3, 1],
      [0, -2],
      [3, 1],
      [5, 1],
    ],
  ],
  dots: [{ at: [-6, 3] }, { at: [-3, 3], open: true }, { at: [-3, 1] }, { at: [5, 1] }],
};

// 8: proste y = x + 1 i y = −2x + 4 przecinające się w (1, 2)
const F8: Plot = {
  x: [-4.5, 4.5],
  y: [-3.5, 4.5],
  lines: [
    [
      [-2.8, -1.8],
      [3.3, 4.3],
    ],
    [
      [0, 4],
      [3.1, -2.2],
    ],
  ],
};

// 17: okrąg o środku O, styczna k w A (na dole), |∠AOB| = 80°, prosta OB przecina k w C
const A17: Point = [0, -1];
const B17 = onCircle(190);
const C17: Point = [B17[0] / -B17[1], -1]; // prosta przez O i B: y = (B_y / B_x)·x, przecięcie z y = −1
const F17: Plot = {
  axes: false,
  x: [-6.4, 2.6],
  y: [-1.6, 1.4],
  lines: [
    circle(),
    [
      [-6.3, -1],
      [2.4, -1],
    ],
    [C17, onCircle(10, 0.6)],
    [B17, A17, [0, 0]],
  ],
  dots: [{ at: [0, 0] }, { at: A17 }, { at: B17 }, { at: C17 }],
  labels: [
    { at: [0.1, 0.25], text: "O" },
    { at: [0, -1.4], text: "A" },
    { at: [B17[0] - 0.12, B17[1] + 0.18], text: "B", anchor: "end" },
    { at: [C17[0], C17[1] + 0.25], text: "C" },
    { at: [2.3, -0.75], text: "k" },
    { at: [-0.28, -0.35], text: "80°" },
  ],
};

// 18: trójkąt prostokątny, kąt prosty w C, |AC| = 8, tg α = 2/5 → |BC| = 16/5
const F18: Plot = {
  axes: false,
  x: [-0.9, 9],
  y: [-0.9, 3.9],
  lines: [
    [
      [0, 0],
      [8, 0],
      [0, 3.2],
      [0, 0],
    ],
    rightMark([0, 0], [8, 0], [0, 3.2], 0.45),
  ],
  labels: [
    { at: [-0.3, -0.5], text: "C" },
    { at: [8.3, -0.5], text: "A" },
    { at: [-0.3, 3.4], text: "B" },
    { at: [4, -0.6], text: "8" },
    { at: [6.9, 0.2], text: "α" },
  ],
};

// 20: trójkąt ABC z wysokością CD, |AD| = 3, |DB| = 12, |BC| = 13 (|CD| = 5)
const F20: Plot = {
  axes: false,
  x: [-1, 16],
  y: [-1.4, 6],
  lines: [
    [
      [0, 0],
      [15, 0],
      [3, 5],
      [0, 0],
    ],
    [
      [3, 5],
      [3, 0],
    ],
    rightMark([3, 0], [15, 0], [3, 5], 0.6),
  ],
  labels: [
    { at: [-0.4, -0.9], text: "A" },
    { at: [3, -0.9], text: "D" },
    { at: [15.4, -0.9], text: "B" },
    { at: [3, 5.5], text: "C" },
    { at: [1.5, -0.9], text: "3" },
    { at: [9, -0.9], text: "12" },
    { at: [9.6, 3.1], text: "13" },
  ],
};

// 21: okrąg o środku S; A (270°), B (30°), C (90°), D (170°) – łamana D–C–B, cięciwa DA, promienie SA i SB
const [A21, B21, C21, D21] = [onCircle(270), onCircle(30), onCircle(90), onCircle(170)];
const F21: Plot = {
  axes: false,
  x: [-1.3, 1.3],
  y: [-1.3, 1.3],
  lines: [circle(), [D21, C21, B21], [D21, A21], [[0, 0], A21], [[0, 0], B21], rightMark(D21, C21, A21, 0.12)],
  dots: [{ at: [0, 0] }, { at: A21 }, { at: B21 }, { at: C21 }, { at: D21 }],
  labels: [
    { at: [A21[0], A21[1] - 0.18], text: "A" },
    { at: [B21[0] + 0.08, B21[1] + 0.04], text: "B", anchor: "start" },
    { at: [C21[0], C21[1] + 0.1], text: "C" },
    { at: [D21[0] - 0.08, D21[1] - 0.02], text: "D", anchor: "end" },
    { at: [-0.1, 0.08], text: "S", anchor: "end" },
    { at: [0, 0.68], text: "110°" },
    { at: [0.58, 0.48], text: "60°" },
    { at: [-0.09, -0.72], text: "α" },
  ],
};

// 22: równoległobok ABCD, |∠DAB| = 70°; z B wysokości na AD (spodek E) i na DC (spodek F), β – kąt między nimi
const D22 = onCircle(70, 3.5);
const C22: Point = [D22[0] + 5, D22[1]];
const u22 = onCircle(70);
const E22: Point = [5 * u22[0] * u22[0], 5 * u22[0] * u22[1]]; // rzut B = (5, 0) na prostą AD
const F22: Point = [5, D22[1]];
const FIG22: Plot = {
  axes: false,
  x: [-0.7, 7],
  y: [-0.7, 4],
  lines: [[[0, 0], [5, 0], C22, D22, [0, 0]], [[5, 0], E22], [[5, 0], F22], rightMark(E22, D22, [5, 0], 0.3), rightMark(F22, C22, [5, 0], 0.3)],
  labels: [
    { at: [-0.3, -0.4], text: "A" },
    { at: [5.2, -0.45], text: "B" },
    { at: [C22[0] + 0.3, C22[1] + 0.05], text: "C" },
    { at: [D22[0] - 0.25, D22[1] + 0.05], text: "D" },
    { at: [0.75, 0.3], text: "α" },
    { at: [4.55, 0.65], text: "β" },
  ],
};

// 24: F₁ – koła o promieniach 1 i 3 styczne zewnętrznie; F₂ – dwa koła o promieniu r = √5 styczne zewnętrznie
const R24 = Math.sqrt(5);
const [S1, S2, S3, S4]: Point[] = [[-3, 0], [1, 0], [6.5 + R24, 0], [6.5 + 3 * R24, 0]];
const F24: Plot = {
  axes: false,
  x: [-4.6, 15.6],
  y: [-3.6, 4.6],
  fills: [circle(1, S1), circle(3, S2), circle(R24, S3), circle(R24, S4)],
  lines: [circle(1, S1), circle(3, S2), circle(R24, S3), circle(R24, S4), [S1, onCircle(15, 1, S1)], [S2, onCircle(15, 3, S2)], [S3, onCircle(15, R24, S3)], [S4, onCircle(15, R24, S4)]],
  dots: [{ at: S1 }, { at: S2 }, { at: S3 }, { at: S4 }],
  labels: [
    { at: [-2.5, -0.5], text: "1" },
    { at: [2.5, -0.6], text: "3" },
    { at: [S3[0] + 1.1, -0.6], text: "r" },
    { at: [S4[0] + 1.1, -0.6], text: "r" },
    { at: [-1, 4], text: "Figura F₁" },
    { at: [6.5 + 2 * R24, 4], text: "Figura F₂" },
  ],
};

const TASKS: [string, PracticeTask][] = [
  [
    "1",
    closed("1", "Liczba $100^5 \\cdot (0{,}1)^{-6}$ jest równa", ["$10^{13}$", "$10^{16}$", "$10^{-1}$", "$10^{-30}$"], "B", "$100^5 = 10^{10}$ i $(0{,}1)^{-6} = (10^{-1})^{-6} = 10^6$, więc iloczyn to $10^{16}$."),
  ],
  ["2", closed("2", "Liczba $78$ stanowi $150\\%$ liczby $c$. Wtedy liczba $c$ jest równa", ["$60$", "$52$", "$48$", "$39$"], "B", "$1{,}5c = 78$, więc $c = 52$.")],
  [
    "3",
    closed(
      "3",
      "Rozważamy przedziały liczbowe $(-\\infty, 5)$ i $\\langle -1, +\\infty)$. Ile jest wszystkich liczb całkowitych, które należą jednocześnie do obu rozważanych przedziałów?",
      ["$6$", "$5$", "$4$", "$7$"],
      "A",
      "Część wspólna to $\\langle -1, 5)$ – liczby całkowite $-1, 0, 1, 2, 3, 4$, czyli $6$ liczb.",
    ),
  ],
  ["4", closed("4", "Suma $2\\log\\sqrt{10} + \\log 10^3$ jest równa", ["$2$", "$3$", "$4$", "$5$"], "C", "$2\\log\\sqrt{10} = 2 \\cdot \\frac{1}{2} = 1$ i $\\log 10^3 = 3$, razem $4$.")],
  [
    "5",
    closed(
      "5",
      "Różnica $0{,}(3) - \\frac{23}{33}$ jest równa",
      ["$-0{,}(39)$", "$-\\frac{39}{100}$", "$-0{,}36$", "$-\\frac{4}{11}$"],
      "D",
      "$0{,}(3) = \\frac{1}{3} = \\frac{11}{33}$, więc $\\frac{11}{33} - \\frac{23}{33} = -\\frac{12}{33} = -\\frac{4}{11}$.",
    ),
  ],
  [
    "6",
    closed(
      "6",
      "Zbiorem wszystkich rozwiązań nierówności $\\frac{2 - x}{2} - 2x \\ge 1$ jest przedział",
      ["$\\langle 0, +\\infty)$", "$(-\\infty, 0\\rangle$", "$(-\\infty, 5\\rangle$", "$\\left(-\\infty, \\frac{1}{3}\\right\\rangle$"],
      "B",
      "Mnożymy przez $2$: $2 - x - 4x \\ge 2$, czyli $-5x \\ge 0$ i $x \\le 0$.",
    ),
  ],
  [
    "7",
    closed(
      "7",
      "Na rysunku przedstawiono wykres funkcji $f$ określonej w zbiorze $\\langle -6, 5 \\rangle$.\n\nFunkcja $g$ jest określona wzorem $g(x) = f(x) - 2$ dla $x \\in \\langle -6, 5 \\rangle$. Wskaż zdanie prawdziwe.",
      [
        "Liczba $f(2) + g(2)$ jest równa $(-2)$.",
        "Zbiory wartości funkcji $f$ i $g$ są równe.",
        "Funkcje $f$ i $g$ mają te same miejsca zerowe.",
        "Punkt $P = (0, -2)$ należy do wykresów funkcji $f$ i $g$.",
      ],
      "A",
      "Z wykresu $f(2) = 0$, więc $g(2) = 0 - 2 = -2$ i $f(2) + g(2) = -2$.",
      F7,
    ),
  ],
  [
    "8",
    closed(
      "8",
      "Na rysunku przedstawiono geometryczną interpretację jednego z niżej zapisanych układów równań. Wskaż ten układ, którego geometryczną interpretację przedstawiono na rysunku.",
      [
        "$\\begin{cases} y = x + 1 \\\\ y = -2x + 4 \\end{cases}$",
        "$\\begin{cases} y = x - 1 \\\\ y = 2x + 4 \\end{cases}$",
        "$\\begin{cases} y = x - 1 \\\\ y = -2x + 4 \\end{cases}$",
        "$\\begin{cases} y = x + 1 \\\\ y = 2x + 4 \\end{cases}$",
      ],
      "A",
      "Rosnąca prosta przechodzi przez $(-1, 0)$ i $(0, 1)$: $y = x + 1$. Malejąca – przez $(0, 4)$ i $(2, 0)$: $y = -2x + 4$.",
      F8,
    ),
  ],
  [
    "9",
    closed("9", "Proste o równaniach $y = 3x - 5$ oraz $y = \\frac{m - 3}{2}x + \\frac{9}{2}$ są równoległe, gdy", ["$m = 1$", "$m = 3$", "$m = 6$", "$m = 9$"], "D", "Proste równoległe mają równe współczynniki kierunkowe: $\\frac{m - 3}{2} = 3$, więc $m = 9$."),
  ],
  [
    "10",
    closed(
      "10",
      "Funkcja $f$ jest określona wzorem $f(x) = \\frac{x^2}{2x - 2}$ dla każdej liczby rzeczywistej $x \\ne 1$. Wtedy dla argumentu $x = \\sqrt{3} - 1$ wartość funkcji $f$ jest równa",
      ["$\\frac{1}{\\sqrt{3} - 1}$", "$-1$", "$1$", "$\\frac{1}{\\sqrt{3} - 2}$"],
      "B",
      "$x^2 = 3 - 2\\sqrt{3} + 1 = 4 - 2\\sqrt{3}$, a $2x - 2 = 2\\sqrt{3} - 4$ – licznik i mianownik są liczbami przeciwnymi, więc $f(x) = -1$.",
    ),
  ],
  [
    "11",
    closed(
      "11",
      "Do wykresu funkcji $f$ określonej dla każdej liczby rzeczywistej $x$ wzorem $f(x) = 3^x - 2$ należy punkt o współrzędnych",
      ["$(-1, -5)$", "$(0, -2)$", "$(0, -1)$", "$(2, 4)$"],
      "C",
      "$f(0) = 3^0 - 2 = -1$, więc do wykresu należy $(0, -1)$.",
    ),
  ],
  [
    "12",
    closed(
      "12",
      "Funkcja kwadratowa $f$ określona wzorem $f(x) = -2(x + 1)(x - 3)$ jest malejąca w przedziale",
      ["$\\langle 1, +\\infty)$", "$(-\\infty, 1\\rangle$", "$(-\\infty, -8\\rangle$", "$\\langle -8, +\\infty)$"],
      "A",
      "Miejsca zerowe $-1$ i $3$, więc odcięta wierzchołka to $p = 1$. Ramiona w dół ($a = -2$) – funkcja maleje w $\\langle 1, +\\infty)$.",
    ),
  ],
  [
    "13",
    closed(
      "13",
      "Trzywyrazowy ciąg $\\left(15, 3x, \\frac{5}{3}\\right)$ jest geometryczny i wszystkie jego wyrazy są dodatnie. Stąd wynika, że",
      ["$x = \\frac{3}{5}$", "$x = \\frac{4}{5}$", "$x = 1$", "$x = \\frac{5}{3}$"],
      "D",
      "$(3x)^2 = 15 \\cdot \\frac{5}{3} = 25$, a wyrazy są dodatnie, więc $3x = 5$ i $x = \\frac{5}{3}$.",
    ),
  ],
  [
    "14",
    closed(
      "14",
      "Ciąg $(b_n)$ jest określony wzorem $b_n = 3n^2 - 25n$ dla każdej liczby naturalnej $n \\ge 1$. Liczba niedodatnich wyrazów ciągu $(b_n)$ jest równa",
      ["$14$", "$13$", "$9$", "$8$"],
      "D",
      "$n(3n - 25) \\le 0$ dla $n \\le \\frac{25}{3} = 8\\frac{1}{3}$, czyli dla $n = 1, 2, \\ldots, 8$ – to $8$ wyrazów.",
    ),
  ],
  [
    "15",
    closed(
      "15",
      "Ciąg arytmetyczny $(a_n)$ jest określony dla każdej liczby naturalnej $n \\ge 1$. Trzeci i piąty wyraz ciągu spełniają warunek $a_3 + a_5 = 58$. Wtedy czwarty wyraz tego ciągu jest równy",
      ["$28$", "$29$", "$33$", "$40$"],
      "B",
      "Wyraz $a_4$ jest średnią arytmetyczną sąsiednich: $a_4 = \\frac{a_3 + a_5}{2} = 29$.",
    ),
  ],
  [
    "16",
    closed(
      "16",
      "Dla każdego kąta ostrego $\\alpha$ iloczyn $\\frac{\\cos\\alpha}{1 - \\sin^2\\alpha} \\cdot \\frac{1 - \\cos^2\\alpha}{\\sin\\alpha}$ jest równy",
      ["$\\sin\\alpha$", "$\\operatorname{tg}\\alpha$", "$\\cos\\alpha$", "$\\sin^2\\alpha$"],
      "B",
      "$1 - \\sin^2\\alpha = \\cos^2\\alpha$ i $1 - \\cos^2\\alpha = \\sin^2\\alpha$, więc iloczyn to $\\frac{\\cos\\alpha}{\\cos^2\\alpha} \\cdot \\frac{\\sin^2\\alpha}{\\sin\\alpha} = \\frac{\\sin\\alpha}{\\cos\\alpha} = \\operatorname{tg}\\alpha$.",
    ),
  ],
  [
    "17",
    closed(
      "17",
      "Prosta $k$ jest styczna w punkcie $A$ do okręgu o środku $O$. Punkt $B$ leży na tym okręgu i miara kąta $AOB$ jest równa $80^\\circ$. Przez punkty $O$ i $B$ poprowadzono prostą, która przecina prostą $k$ w punkcie $C$ (zobacz rysunek).\n\nMiara kąta $BAC$ jest równa",
      ["$10^\\circ$", "$30^\\circ$", "$40^\\circ$", "$50^\\circ$"],
      "C",
      "Trójkąt $AOB$ jest równoramienny ($|OA| = |OB|$), więc $|\\angle OAB| = \\frac{180^\\circ - 80^\\circ}{2} = 50^\\circ$. Styczna jest prostopadła do promienia $OA$, więc $|\\angle BAC| = 90^\\circ - 50^\\circ = 40^\\circ$.",
      F17,
    ),
  ],
  [
    "18",
    closed(
      "18",
      "Przyprostokątna $AC$ trójkąta prostokątnego $ABC$ ma długość $8$ oraz $\\operatorname{tg}\\alpha = \\frac{2}{5}$ (zobacz rysunek).\n\nPole tego trójkąta jest równe",
      ["$12$", "$\\frac{37}{3}$", "$\\frac{62}{5}$", "$\\frac{64}{5}$"],
      "D",
      "$\\operatorname{tg}\\alpha = \\frac{|BC|}{|AC|}$, więc $|BC| = \\frac{2}{5} \\cdot 8 = \\frac{16}{5}$ i $P = \\frac{1}{2} \\cdot 8 \\cdot \\frac{16}{5} = \\frac{64}{5}$.",
      F18,
    ),
  ],
  [
    "19",
    closed(
      "19",
      "Pole pewnego trójkąta równobocznego jest równe $\\frac{4\\sqrt{3}}{9}$. Obwód tego trójkąta jest równy",
      ["$4$", "$2$", "$\\frac{4}{3}$", "$\\frac{2}{3}$"],
      "A",
      "$\\frac{a^2\\sqrt{3}}{4} = \\frac{4\\sqrt{3}}{9}$, więc $a^2 = \\frac{16}{9}$, $a = \\frac{4}{3}$ i obwód $3a = 4$.",
    ),
  ],
  [
    "20",
    closed(
      "20",
      "W trójkącie $ABC$ bok $BC$ ma długość $13$, a wysokość $CD$ tego trójkąta dzieli bok $AB$ na odcinki o długościach $|AD| = 3$ i $|BD| = 12$ (zobacz rysunek). Długość boku $AC$ jest równa",
      ["$\\sqrt{34}$", "$\\frac{13}{4}$", "$2\\sqrt{14}$", "$3\\sqrt{45}$"],
      "A",
      "Z trójkąta $BCD$: $|CD| = \\sqrt{13^2 - 12^2} = 5$. Z trójkąta $ACD$: $|AC| = \\sqrt{3^2 + 5^2} = \\sqrt{34}$.",
      F20,
    ),
  ],
  [
    "21",
    closed(
      "21",
      "Punkty $A$, $B$, $C$ i $D$ leżą na okręgu o środku $S$. Miary kątów $SBC$, $BCD$, $CDA$ są równe odpowiednio: $|\\angle SBC| = 60^\\circ$, $|\\angle BCD| = 110^\\circ$, $|\\angle CDA| = 90^\\circ$ (zobacz rysunek).\n\nWynika stąd, że miara $\\alpha$ kąta $DAS$ jest równa",
      ["$25^\\circ$", "$30^\\circ$", "$35^\\circ$", "$40^\\circ$"],
      "D",
      "W czworokącie wpisanym $ABCD$ sumy przeciwległych kątów to $180^\\circ$: $|\\angle DAB| = 70^\\circ$ i $|\\angle ABC| = 90^\\circ$. Stąd $|\\angle SBA| = 30^\\circ$, a trójkąt $ASB$ jest równoramienny, więc $|\\angle SAB| = 30^\\circ$ i $\\alpha = 70^\\circ - 30^\\circ = 40^\\circ$.",
      F21,
    ),
  ],
  [
    "22",
    closed(
      "22",
      "W równoległoboku $ABCD$, przedstawionym na rysunku, kąt $\\alpha$ ma miarę $70^\\circ$.\n\nWtedy kąt $\\beta$ ma miarę",
      ["$80^\\circ$", "$70^\\circ$", "$60^\\circ$", "$50^\\circ$"],
      "B",
      "Wysokość na $AD$ tworzy z bokiem $AB$ kąt $90^\\circ - 70^\\circ = 20^\\circ$, a wysokość na $DC$ jest prostopadła do $AB$ (bo $DC \\parallel AB$). Stąd $\\beta = 90^\\circ - 20^\\circ = 70^\\circ$.",
      FIG22,
    ),
  ],
  [
    "23",
    closed(
      "23",
      "W każdym $n$-kącie wypukłym ($n \\ge 3$) liczba przekątnych jest równa $\\frac{n(n - 3)}{2}$. Wielokątem wypukłym, w którym liczba przekątnych jest o $25$ większa od liczby boków, jest",
      ["siedmiokąt.", "dziesięciokąt.", "dwunastokąt.", "piętnastokąt."],
      "B",
      "$\\frac{n(n - 3)}{2} = n + 25$, czyli $n^2 - 5n - 50 = 0$ i $n = 10$ (drugi pierwiastek, $-5$, odpada).",
    ),
  ],
  [
    "24",
    closed(
      "24",
      "Pole figury $F_1$ złożonej z dwóch stycznych zewnętrznie kół o promieniach $1$ i $3$ jest równe polu figury $F_2$ złożonej z dwóch stycznych zewnętrznie kół o promieniach długości $r$ (zobacz rysunek).\n\nDługość $r$ promienia jest równa",
      ["$\\sqrt{3}$", "$2$", "$\\sqrt{5}$", "$3$"],
      "C",
      "$\\pi \\cdot 1^2 + \\pi \\cdot 3^2 = 2\\pi r^2$, więc $r^2 = 5$ i $r = \\sqrt{5}$.",
      F24,
    ),
  ],
  [
    "25",
    closed(
      "25",
      "Punkt $A = (3, -5)$ jest wierzchołkiem kwadratu $ABCD$, a punkt $M = (1, 3)$ jest punktem przecięcia się przekątnych tego kwadratu. Wynika stąd, że pole kwadratu $ABCD$ jest równe",
      ["$68$", "$136$", "$2\\sqrt{34}$", "$8\\sqrt{34}$"],
      "B",
      "$|AM| = \\sqrt{2^2 + 8^2} = \\sqrt{68}$ to połowa przekątnej, więc $d = 2\\sqrt{68}$ i $P = \\frac{d^2}{2} = \\frac{4 \\cdot 68}{2} = 136$.",
    ),
  ],
  [
    "26",
    closed(
      "26",
      "Z wierzchołków sześcianu $ABCDEFGH$ losujemy jednocześnie dwa różne wierzchołki. Prawdopodobieństwo tego, że wierzchołki te będą końcami przekątnej sześcianu $ABCDEFGH$, jest równe",
      ["$\\frac{1}{7}$", "$\\frac{4}{7}$", "$\\frac{1}{14}$", "$\\frac{3}{7}$"],
      "A",
      "Par wierzchołków jest $\\binom{8}{2} = 28$, a sześcian ma $4$ przekątne, więc $P = \\frac{4}{28} = \\frac{1}{7}$.",
    ),
  ],
  [
    "27",
    closed(
      "27",
      "Wszystkich liczb naturalnych trzycyfrowych, większych od $700$, w których każda cyfra należy do zbioru $\\{1, 2, 3, 7, 8, 9\\}$ i żadna cyfra się nie powtarza, jest",
      ["$108$", "$60$", "$40$", "$299$"],
      "B",
      "Pierwsza cyfra: $7$, $8$ albo $9$ ($3$ sposoby), druga – jedna z pozostałych $5$, trzecia – z $4$: $3 \\cdot 5 \\cdot 4 = 60$.",
    ),
  ],
  [
    "28",
    closed(
      "28",
      "Sześciowyrazowy ciąg liczbowy $(1, 2, 2x, x + 2, 5, 6)$ jest niemalejący. Mediana wyrazów tego ciągu jest równa $4$. Wynika stąd, że",
      ["$x = 1$", "$x = \\frac{3}{2}$", "$x = 2$", "$x = \\frac{8}{3}$"],
      "C",
      "Mediana to średnia trzeciego i czwartego wyrazu: $\\frac{2x + x + 2}{2} = 4$, więc $3x = 6$ i $x = 2$ (ciąg $1, 2, 4, 4, 5, 6$ jest niemalejący).",
    ),
  ],
  [
    "29",
    open(
      "29",
      "Rozwiąż nierówność:\n\n$$x^2 - 5x \\le 14$$",
      ["[-2, 7]"],
      ["Pierwiastki trójmianu $x^2 - 5x - 14$: $x_1 = -2$, $x_2 = 7$.", "Ramiona paraboli w górę: $x \\in \\langle -2, 7 \\rangle$."],
    ),
  ],
  [
    "30",
    open(
      "30",
      "Wykaż, że dla każdych trzech dodatnich liczb $a$, $b$ i $c$ takich, że $a < b$, spełniona jest nierówność\n\n$$\\frac{a}{b} < \\frac{a + c}{b + c}$$",
      [],
      [
        "Przekształcenie nierówności do postaci równoważnej, np. $a(b + c) < b(a + c)$, czyli $ac < bc$ (mnożymy przez dodatnie $b(b + c)$).",
        "Wykorzystanie założeń: $c > 0$ i $a < b$, więc $ac < bc$ – nierówność jest prawdziwa.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "31",
    open(
      "31",
      "Funkcja liniowa $f$ przyjmuje wartość $2$ dla argumentu $0$, a ponadto $f(4) - f(2) = 6$. Wyznacz wzór funkcji $f$.\n\n(W aplikacji wpisz współczynniki $a$ i $b$ wzoru $f(x) = ax + b$, oddzielone średnikiem.)",
      ["3; 2"],
      ["$f(0) = 2$, więc $b = 2$ (albo: $a = \\frac{f(4) - f(2)}{4 - 2} = 3$).", "$a = \\frac{6}{2} = 3$, więc $f(x) = 3x + 2$."],
      { answerLabel: "a;\\ b =" },
    ),
  ],
  [
    "32",
    open(
      "32",
      "Rozwiąż równanie:\n\n$$\\frac{3x + 2}{3x - 2} = 4 - x$$\n\n(Jeśli rozwiązań jest kilka, oddziel je średnikiem.)",
      ["5/3; 2"],
      ["Dla $x \\ne \\frac{2}{3}$: $3x + 2 = (3x - 2)(4 - x)$, czyli $3x^2 - 11x + 10 = 0$.", "$\\Delta = 1$, więc $x = \\frac{5}{3}$ lub $x = 2$."],
      { answerLabel: "x =" },
    ),
  ],
  [
    "33",
    open(
      "33",
      "Trójkąt równoboczny $ABC$ ma pole równe $9\\sqrt{3}$. Prosta równoległa do boku $BC$ przecina boki $AB$ i $AC$ – odpowiednio – w punktach $K$ i $L$. Trójkąty $ABC$ i $AKL$ są podobne, a stosunek długości boków tych trójkątów jest równy $\\frac{3}{2}$. Oblicz długość boku trójkąta $AKL$.",
      ["4"],
      ["$\\frac{a^2\\sqrt{3}}{4} = 9\\sqrt{3}$, więc bok trójkąta $ABC$ ma długość $6$ (albo pole $AKL$: $9\\sqrt{3} \\cdot \\frac{4}{9} = 4\\sqrt{3}$).", "$|AK| = \\frac{2}{3} \\cdot 6 = 4$."],
      { answerLabel: "|AK| =" },
    ),
  ],
  [
    "34",
    open(
      "34",
      "Gracz rzuca dwukrotnie symetryczną sześcienną kostką do gry i oblicza sumę liczb wyrzuconych oczek. Oblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że suma liczb wyrzuconych oczek jest równa $4$ lub $5$, lub $6$.",
      ["1/3"],
      [
        "$|\\Omega| = 36$ (albo wypisanie zdarzeń sprzyjających: sumę $4$ dają $3$ pary, $5$ – $4$ pary, $6$ – $5$ par).",
        "$|A| = 12$, więc $P(A) = \\frac{12}{36} = \\frac{1}{3}$.",
      ],
      { answerLabel: "P(A) =" },
    ),
  ],
  [
    "35",
    open(
      "35",
      "Punkty $A = (-20, 12)$ i $B = (7, 3)$ są wierzchołkami trójkąta równoramiennego $ABC$, w którym $|AC| = |BC|$. Wierzchołek $C$ leży na osi $Oy$ układu współrzędnych. Oblicz współrzędne wierzchołka $C$ oraz obwód tego trójkąta.\n\n(W aplikacji wpisz drugą współrzędną punktu $C$ i obwód, oddzielone średnikiem.)",
      ["27; 50+9√10"],
      [
        "$C = (0, y_C)$ (albo środek $AB$: $M = \\left(-\\frac{13}{2}, \\frac{15}{2}\\right)$, albo współczynnik kierunkowy $AB$: $-\\frac{1}{3}$).",
        "Równanie z jedną niewiadomą: $20^2 + (y_C - 12)^2 = 7^2 + (y_C - 3)^2$ (albo symetralna $AB$: $y = 3x + 27$).",
        "$C = (0, 27)$.",
        "$|AB| = \\sqrt{27^2 + 9^2} = 9\\sqrt{10}$ i $|AC| = |BC| = \\sqrt{7^2 + 24^2} = 25$.",
        "Obwód $L = 50 + 9\\sqrt{10}$.",
      ],
      { answerLabel: "y_C;\\ L =" },
    ),
  ],
];

export const CKE_2021_MAJ: ExamSheet = {
  id: "cke-2021-maj",
  kind: "cke",
  year: 2021,
  session: "maj",
  title: "Matura maj 2021",
  subtitle: "Oficjalny arkusz CKE · poziom podstawowy · formuła 2015",
  level: "podstawowy",
  durationMin: 170,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2021/Matematyka/poziom_podstawowy/EMAP-P0-100-2105.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2015/Arkusze_egzaminacyjne/2021/Zasady_Oceniania/EMAP-P0-100-2105-zasady.pdf",
  },
};
