import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { Plot, Point } from "@/types/plot";
import type { OpenQuestion } from "@/types/quiz";

// Matura z matematyki, poziom rozszerzony, 9 maja 2024 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-R0-100, wersja A.
// Treść przepisana z PDF CKE, schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2024).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Wszystkie zadania są otwarte. Różnice wobec papieru, opisane uczniowi w treści:
// – kilka wyników (4, 7, 10, 11, 13.2) wpisuje się po średniku; w 9 – współczynniki przy a²,
// – schemat CKE (poziomy z wariantami ALBO) zapisany jako jedna ścieżka kroków po 1 pkt.
// Rysunek do zad. 9 odtworzony z treści (kwadrat o boku 1), nie skan.

const LABEL = "Matura CKE · maj 2024 · rozszerzenie";

function open(
  n: string,
  prompt: string,
  answers: string[],
  steps: string[],
  extra: Partial<Pick<OpenQuestion, "answerLabel" | "format" | "figure">> = {},
): PracticeTask {
  const id = `cke-2024-maj-r-${n}`;
  const solution = steps.map((step) => ({ step, points: 1 }));
  return { kind: "open", id, difficulty: "zaawansowany", points: solution.length, task: { id, label: LABEL, prompt, points: solution.length, answers, solution, ...extra } };
}

// 9: A(0,0), B(1,0), C(1,1), D(0,1), E – środek CD; G = AC ∩ BD, F = AE ∩ BD
const P: Record<string, Point> = { A: [0, 0], B: [4, 0], C: [4, 4], D: [0, 4], E: [2, 4], F: [4 / 3, 8 / 3], G: [2, 2] };
const F9: Plot = {
  axes: false,
  x: [-0.7, 4.7],
  y: [-0.8, 4.7],
  lines: [
    [P.A, P.B, P.C, P.D, P.A],
    [P.B, P.D],
    [P.A, P.C],
    [P.A, P.E],
  ],
  labels: [
    { at: [-0.3, -0.35], text: "A" },
    { at: [4.3, -0.35], text: "B" },
    { at: [4.3, 4.3], text: "C" },
    { at: [-0.3, 4.3], text: "D" },
    { at: [2, 4.35], text: "E" },
    { at: [0.95, 2.85], text: "F" },
    { at: [2, 1.5], text: "G" },
    { at: [2, -0.5], text: "a" },
  ],
};

const T13 = "Rozważamy wszystkie graniastosłupy prawidłowe trójkątne o objętości $3456$, których krawędź podstawy ma długość nie większą niż $8\\sqrt{3}$.";

const TASKS: [number: string, task: PracticeTask][] = [
  [
    "1",
    open(
      "1",
      "W chwili początkowej $(t = 0)$ filiżanka z gorącą kawą znajduje się w pokoju, a temperatura tej kawy jest równa $80\\ ^\\circ\\mathrm{C}$. Temperatura w pokoju (temperatura otoczenia) jest stała i równa $20\\ ^\\circ\\mathrm{C}$. Temperatura $T$ tej kawy zmienia się w czasie zgodnie z zależnością\n\n$T(t) = (T_p - T_z) \\cdot k^{-t} + T_z$ dla $t \\ge 0$\n\ngdzie: $T$ – temperatura kawy wyrażona w stopniach Celsjusza, $t$ – czas wyrażony w minutach, liczony od chwili początkowej, $T_p$ – temperatura początkowa kawy wyrażona w stopniach Celsjusza, $T_z$ – temperatura otoczenia wyrażona w stopniach Celsjusza, $k$ – stała charakterystyczna dla danej cieczy.\n\nPo $10$ minutach, licząc od chwili początkowej, kawa ostygła do temperatury $65\\ ^\\circ\\mathrm{C}$.\n\nOblicz temperaturę tej kawy po następnych pięciu minutach. Wynik podaj w stopniach Celsjusza, w zaokrągleniu do jedności. Zapisz obliczenia.",
      ["59"],
      ["$65 = 60 \\cdot k^{-10} + 20$, więc $k^{-10} = \\frac{45}{60} = \\frac{3}{4}$.", "$T(15) = 60 \\cdot \\left(\\frac{3}{4}\\right)^{\\frac{3}{2}} + 20 \\approx 59\\ ^\\circ\\mathrm{C}$."],
      { answerLabel: "T(15) \\approx" },
    ),
  ],
  [
    "2",
    open(
      "2",
      "Oblicz granicę\n\n$\\lim\\limits_{x \\to 2^-} \\frac{x^3 - 8}{(x - 2)^2}$\n\nZapisz obliczenia.\n\n(Nieskończoność wpisz jako ∞ ze znakiem, np. -∞.)",
      ["-∞"],
      ["$\\frac{x^3 - 8}{(x - 2)^2} = \\frac{x^2 + 2x + 4}{x - 2}$ (dla $x \\ne 2$).", "Licznik dąży do $12$, mianownik do $0$ przez wartości ujemne – granica jest równa $-\\infty$."],
    ),
  ],
  [
    "3",
    open(
      "3",
      "W pewnym zakładzie mleczarskim śmietana produkowana jest w $200$-gramowych opakowaniach. Prawdopodobieństwo zdarzenia, że w losowo wybranym opakowaniu śmietana zawiera mniej niż $36\\%$ tłuszczu, jest równe $0{,}01$. Kontroli poddajemy $10$ losowo wybranych opakowań ze śmietaną.\n\nOblicz prawdopodobieństwo zdarzenia polegającego na tym, że wśród opakowań poddanych tej kontroli będzie co najwyżej jedno opakowanie ze śmietaną, która zawiera mniej niż $36\\%$ tłuszczu. Wynik zapisz w postaci ułamka dziesiętnego w zaokrągleniu do części tysięcznych. Zapisz obliczenia.",
      ["0.996"],
      [
        "Schemat Bernoullego: $n = 10$, sukces $p = 0{,}01$, porażka $q = 0{,}99$.",
        "$P = \\binom{10}{0} \\cdot 0{,}99^{10} + \\binom{10}{1} \\cdot 0{,}01 \\cdot 0{,}99^{9}$.",
        "$P \\approx 0{,}996$.",
      ],
    ),
  ],
  [
    "4",
    open(
      "4",
      "Funkcja $f$ jest określona wzorem\n\n$f(x) = \\frac{x^3 - 3x + 2}{x}$\n\ndla każdej liczby rzeczywistej $x$ różnej od zera. W kartezjańskim układzie współrzędnych $(x, y)$ punkt $P$, o pierwszej współrzędnej równej $2$, należy do wykresu funkcji $f$. Prosta o równaniu $y = ax + b$ jest styczna do wykresu funkcji $f$ w punkcie $P$.\n\nOblicz współczynniki $a$ oraz $b$ w równaniu tej stycznej. Zapisz obliczenia.\n\n(W aplikacji wpisz $a$ i $b$ oddzielone średnikiem.)",
      ["7/2; -5"],
      ["$f'(x) = \\frac{(3x^2 - 3)x - (x^3 - 3x + 2)}{x^2} = \\frac{2x^3 - 2}{x^2}$.", "$a = f'(2) = \\frac{7}{2}$.", "$f(2) = 2$, więc $2 = \\frac{7}{2} \\cdot 2 + b$ i $b = -5$."],
      { answerLabel: "a;\\ b =" },
    ),
  ],
  [
    "5",
    open(
      "5",
      "Wykaż, że jeżeli $\\log_5 4 = a$ oraz $\\log_4 3 = b$, to $\\log_{12} 80 = \\frac{2a + 1}{a \\cdot (1 + b)}$.",
      [],
      [
        "Zamiana podstawy: $\\log_{12} 80 = \\frac{\\log_5 80}{\\log_5 12}$.",
        "$\\log_5 80 = \\log_5(4 \\cdot 4 \\cdot 5) = 2a + 1$ oraz $\\log_5 12 = \\log_5 4 + \\log_5 3$, gdzie $\\log_5 3 = \\log_5 4 \\cdot \\log_4 3 = ab$.",
        "$\\log_{12} 80 = \\frac{2a + 1}{a + ab} = \\frac{2a + 1}{a(1 + b)}$.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "6",
    open(
      "6",
      "Rozważamy wszystkie liczby naturalne, w których zapisie dziesiętnym nie powtarza się jakakolwiek cyfra oraz dokładnie trzy cyfry są nieparzyste i dokładnie dwie cyfry są parzyste.\n\nOblicz, ile jest wszystkich takich liczb. Zapisz obliczenia.",
      ["11040"],
      [
        "Wszystkie ustawienia (także z zerem na początku): $L_1 = \\binom{5}{3} \\cdot \\binom{5}{2} \\cdot 5! = 12\\,000$.",
        "Ustawienia z zerem na początku: $L_2 = \\binom{5}{3} \\cdot \\binom{4}{1} \\cdot 4! = 960$.",
        "$L_1 - L_2 = 11\\,040$.",
      ],
    ),
  ],
  [
    "7",
    open(
      "7",
      "Trzywyrazowy ciąg $(x, y, z)$ jest geometryczny i rosnący. Suma wyrazów tego ciągu jest równa $105$. Liczby $x$, $y$ oraz $z$ są – odpowiednio – pierwszym, drugim oraz szóstym wyrazem ciągu arytmetycznego $(a_n)$, określonego dla każdej liczby naturalnej $n \\ge 1$.\n\nOblicz $x$, $y$ oraz $z$. Zapisz obliczenia.\n\n(W aplikacji wpisz $x$, $y$, $z$ oddzielone średnikami.)",
      ["5; 20; 80"],
      [
        "Z ciągu arytmetycznego: $y = x + r$, $z = x + 5r$ i $x + (x + r) + (x + 5r) = 105$.",
        "$x = 35 - 2r$, $y = 35 - r$, $z = 35 + 3r$.",
        "Warunek ciągu geometrycznego: $(35 - r)^2 = (35 - 2r)(35 + 3r)$.",
        "$7r^2 - 105r = 0$, ciąg rosnący, więc $r = 15$: $x = 5$, $y = 20$, $z = 80$.",
      ],
    ),
  ],
  [
    "8",
    open(
      "8",
      "Dany jest trójkąt $ABC$, który nie jest równoramienny. W tym trójkącie miara kąta $ABC$ jest dwa razy większa od miary kąta $BAC$.\n\nWykaż, że długości boków tego trójkąta spełniają warunek\n\n$|AC|^2 = |BC|^2 + |AB| \\cdot |BC|$",
      [],
      [
        "Oznaczenia $a = |BC|$, $b = |AC|$, $c = |AB|$, $\\alpha = |\\angle BAC|$; twierdzenie sinusów: $\\frac{b}{\\sin(2\\alpha)} = \\frac{a}{\\sin\\alpha}$ (albo dwusieczna $BD$ kąta $ABC$ i podobieństwo trójkątów $CAB$ i $CBD$).",
        "$\\cos\\alpha = \\frac{b}{2a}$.",
        "Twierdzenie cosinusów: $a^2 = b^2 + c^2 - 2bc\\cos\\alpha = b^2 + c^2 - \\frac{b^2 c}{a}$, czyli $(a - c)(a^2 + ac - b^2) = 0$.",
        "Trójkąt nie jest równoramienny, więc $a \\ne c$ i $b^2 = a^2 + ac$, czyli $|AC|^2 = |BC|^2 + |AB| \\cdot |BC|$.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "9",
    open(
      "9",
      "Dany jest kwadrat $ABCD$ o boku długości $a$. Punkt $E$ jest środkiem boku $CD$. Przekątna $BD$ dzieli trójkąt $ACE$ na dwie figury: $AGF$ oraz $CEFG$ (zobacz rysunek).\n\nOblicz pola figur $AGF$ oraz $CEFG$. Zapisz obliczenia.\n\n(W aplikacji wpisz współczynniki przy $a^2$: dla $AGF$ i dla $CEFG$, oddzielone średnikiem.)",
      ["1/12; 1/6"],
      [
        "$G$ – środek kwadratu, a $F$ dzieli $DG$ w stosunku $|DF| : |FG| = 2 : 1$ (np. z podobieństwa trójkątów $DFE$ i $BFA$).",
        "$P_{AGD} = \\frac{1}{4}a^2$, więc $P_{AGF} = \\frac{1}{3} \\cdot \\frac{1}{4}a^2 = \\frac{1}{12}a^2$.",
        "$P_{ACE} = \\frac{1}{2} \\cdot \\frac{a}{2} \\cdot a = \\frac{1}{4}a^2$.",
        "$P_{CEFG} = \\frac{1}{4}a^2 - \\frac{1}{12}a^2 = \\frac{1}{6}a^2$.",
      ],
      { figure: F9 },
    ),
  ],
  [
    "10",
    open(
      "10",
      "Rozwiąż równanie\n\n$\\sin(4x) - \\sin(2x) = 4\\cos^2 x - 3$\n\nw zbiorze $[0, 2\\pi]$. Zapisz obliczenia.",
      ["π/6; π/4; 5π/6; 7π/6; 5π/4; 11π/6"],
      [
        "$\\sin(4x) = 2\\sin(2x)\\cos(2x)$ oraz $4\\cos^2 x - 3 = 2\\cos(2x) - 1$.",
        "$\\sin(2x)\\,[2\\cos(2x) - 1] = 2\\cos(2x) - 1$.",
        "$[2\\cos(2x) - 1][\\sin(2x) - 1] = 0$, czyli $\\sin(2x) = 1$ lub $\\cos(2x) = \\frac{1}{2}$.",
        "$\\sin(2x) = 1$ w $[0, 2\\pi]$: $x = \\frac{\\pi}{4}$, $x = \\frac{5\\pi}{4}$.",
        "$\\cos(2x) = \\frac{1}{2}$ w $[0, 2\\pi]$: $x = \\frac{\\pi}{6}$, $\\frac{5\\pi}{6}$, $\\frac{7\\pi}{6}$, $\\frac{11\\pi}{6}$.",
      ],
    ),
  ],
  [
    "11",
    open(
      "11",
      "W kartezjańskim układzie współrzędnych $(x, y)$ środek $S$ okręgu o promieniu $\\sqrt{5}$ leży na prostej o równaniu $y = x + 1$. Przez punkt $A = (1, 2)$, którego odległość od punktu $S$ jest większa od $\\sqrt{5}$, poprowadzono dwie proste styczne do tego okręgu w punktach – odpowiednio – $B$ i $C$. Pole czworokąta $ABSC$ jest równe $15$.\n\nOblicz współrzędne punktu $S$. Rozważ wszystkie przypadki. Zapisz obliczenia.\n\n(W aplikacji wpisz współrzędne wszystkich możliwych punktów $S$ po średniku, np. $x_1;\\ y_1;\\ x_2;\\ y_2$.)",
      ["6; 7; -4; -3"],
      [
        "$S = (s, s + 1)$, a czworokąt $ABSC$ to dwa przystające trójkąty prostokątne o przyprostokątnych $\\sqrt{5}$ i $|AB|$.",
        "$2 \\cdot \\frac{1}{2} \\cdot \\sqrt{5} \\cdot |AB| = 15$, więc $|AB| = 3\\sqrt{5}$.",
        "$|AS|^2 = 5 + 45 = 50$.",
        "$(s - 1)^2 + (s - 1)^2 = 50$, więc $s = 6$ lub $s = -4$.",
        "$S = (6, 7)$ albo $S = (-4, -3)$.",
      ],
    ),
  ],
  [
    "12",
    open(
      "12",
      "Wyznacz wszystkie wartości parametru $m$, dla których równanie\n\n$x^2 - (3m + 1) \\cdot x + 2m^2 + m + 1 = 0$\n\nma dwa różne rozwiązania rzeczywiste $x_1$, $x_2$ spełniające warunek\n\n$x_1^3 + x_2^3 + 3 \\cdot x_1 \\cdot x_2 \\cdot (x_1 + x_2 - 3) \\le 3m - 7$\n\nZapisz obliczenia.",
      ["(-∞, -3)"],
      [
        "$\\Delta = m^2 + 2m - 3 > 0$: $m \\in (-\\infty, -3) \\cup (1, +\\infty)$ (warunek $\\Delta \\ge 0$ – bez punktu).",
        "Lewa strona to $(x_1 + x_2)^3 - 9x_1x_2$ – postać pod wzory Viète'a.",
        "Nierówność z niewiadomą $m$: $(3m + 1)^3 - 9(2m^2 + m + 1) \\le 3m - 7$.",
        "Po uproszczeniu: $27m^3 + 9m^2 - 3m - 1 \\le 0$, czyli $(3m + 1)^2(3m - 1) \\le 0$.",
        "Rozwiązanie: $m \\in \\left(-\\infty, \\frac{1}{3}\\right]$.",
        "Część wspólna z warunkiem $\\Delta > 0$: $m \\in (-\\infty, -3)$.",
      ],
    ),
  ],
  [
    "13.1",
    open(
      "13.1",
      `${T13}\n\nWykaż, że pole $P$ powierzchni całkowitej graniastosłupa w zależności od długości $a$ krawędzi podstawy graniastosłupa jest określone wzorem\n\n$P(a) = \\frac{a^2 \\cdot \\sqrt{3}}{2} + \\frac{13824\\sqrt{3}}{a}$`,
      [],
      [
        "Wysokość z objętości: $\\frac{a^2\\sqrt{3}}{4} \\cdot H = 3456$, więc $H = \\frac{13824}{a^2\\sqrt{3}}$.",
        "$P = 2 \\cdot \\frac{a^2\\sqrt{3}}{4} + 3aH = \\frac{a^2\\sqrt{3}}{2} + \\frac{3 \\cdot 13824}{a\\sqrt{3}} = \\frac{a^2\\sqrt{3}}{2} + \\frac{13824\\sqrt{3}}{a}$.",
      ],
      { format: "proof" },
    ),
  ],
  [
    "13.2",
    open(
      "13.2",
      `${T13}\n\nPole $P$ powierzchni całkowitej graniastosłupa w zależności od długości $a$ krawędzi podstawy graniastosłupa jest określone wzorem\n\n$P(a) = \\frac{a^2 \\cdot \\sqrt{3}}{2} + \\frac{13824\\sqrt{3}}{a}$ dla $a \\in (0, 8\\sqrt{3}]$.\n\nWyznacz długość krawędzi podstawy tego z rozważanych graniastosłupów, którego pole powierzchni całkowitej jest najmniejsze. Oblicz to najmniejsze pole. Zapisz obliczenia.\n\n(W aplikacji wpisz długość krawędzi i pole, oddzielone średnikiem.)`,
      ["8√3; 96√3+1728"],
      [
        "$P'(a) = a\\sqrt{3} - \\frac{13824\\sqrt{3}}{a^2}$.",
        "$P'(a) = 0$ dla $a = 24$ – poza dziedziną ($24 > 8\\sqrt{3}$).",
        "$P'(a) < 0$ w całej dziedzinie $(0, 8\\sqrt{3}]$ – funkcja malejąca, najmniejsza wartość dla $a = 8\\sqrt{3}$.",
        "$P(8\\sqrt{3}) = 96\\sqrt{3} + 1728$.",
      ],
    ),
  ],
];

export const CKE_2024_MAJ_R: ExamSheet = {
  id: "cke-2024-maj-r",
  kind: "cke",
  year: 2024,
  session: "maj",
  title: "Matura rozszerzona maj 2024",
  subtitle: "Oficjalny arkusz CKE · poziom rozszerzony",
  level: "rozszerzony",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2405-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2024/Matematyka/poziom_rozszerzony/MMAP-R0-100-2405-zasady.pdf",
  },
};
