import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";
import type { OpenQuestion } from "@/types/quiz";

// Matura z matematyki, poziom rozszerzony, 6 maja 2025 (formuła 2023, 50 pkt, 180 min) – arkusz MMAP-R0-100, wersja A.
// Treść przepisana z PDF CKE, schematy punktowania z „Zasad oceniania rozwiązań zadań” (termin główny 2025).
// Pliki: src/data/cke-sheets.ts. Nie poprawiaj treści „z pamięci” – tylko z PDF.
//
// Wszystkie zadania są otwarte (bez rysunków). Różnice wobec papieru, opisane uczniowi w treści:
// – zad. 8 i 12.2 (kilka wyników): do sprawdzenia automatycznego wpisuje się wskazane wartości po średniku,
// – schemat CKE (poziomy „1 pkt – …, 2 pkt – …” z wariantami ALBO) zapisany jako jedna ścieżka kroków po 1 pkt;
//   inną poprawną metodę uznaje ocena krokami (i ocena AI).

const LABEL = "Matura CKE · maj 2025 · rozszerzenie";

function open(
  n: string,
  prompt: string,
  answers: string[],
  solution: { step: string; points: number }[],
  extra: Partial<Pick<OpenQuestion, "answerLabel" | "format">> = {},
): PracticeTask {
  const id = `cke-2025-maj-r-${n}`;
  const points = solution.reduce((sum, s) => sum + s.points, 0);
  return { kind: "open", id, difficulty: "zaawansowany", points, task: { id, label: LABEL, prompt, points, answers, solution, ...extra } };
}

const step = (text: string) => ({ step: text, points: 1 });

const TASKS: [number: string, task: PracticeTask][] = [
  [
    "1",
    open(
      "1",
      "W warunkach laboratoryjnych obserwowano dynamikę wzrostu liczebności populacji pewnego gatunku bakterii. Liczebność $N$ populacji bakterii zmienia się w czasie zgodnie z zależnością wykładniczą\n\n$N(t) = N_0 \\cdot k^t$ dla $t \\ge 0$\n\ngdzie: $N_0$ – liczebność populacji w chwili $t = 0$ rozpoczęcia obserwacji, $k$ – stała dodatnia, charakterystyczna dla danego gatunku bakterii i dla warunków przeprowadzenia obserwacji, $t$ – czas wyrażony w godzinach, liczony od chwili $t = 0$ rozpoczęcia obserwacji.\n\nW chwili rozpoczęcia obserwacji liczebność populacji była równa $10\\,000$, a po dwóch godzinach była równa $15\\,625$.\n\nOblicz, o ile procent wzrastała liczebność populacji tej bakterii w ciągu każdej godziny. Zapisz obliczenia.",
      ["25"],
      [step("Równanie $15\\,625 = 10\\,000 \\cdot k^2$."), step("$k^2 = 1{,}5625$, $k > 0$, więc $k = 1{,}25$ – liczebność rośnie o $25\\%$ na godzinę.")],
    ),
  ],
  [
    "2",
    open(
      "2",
      "Wykaż, że dla każdej dodatniej liczby rzeczywistej $a$ i dla każdej dodatniej liczby rzeczywistej $b$ takich, że $b \\ne \\frac{1}{2}a$, prawdziwa jest nierówność\n\n$(a + 2b)^3 > 8a^2b + 16ab^2$",
      [],
      [
        step("Wzór na sześcian sumy i przekształcenie do postaci $a^2(a - 2b) - 4b^2(a - 2b) > 0$ (albo $(a + 2b)^2 > 8ab$)."),
        step("Postać $(a - 2b)^2(a + 2b) > 0$."),
        step("Uzasadnienie: $a + 2b > 0$, bo $a, b > 0$, oraz $(a - 2b)^2 > 0$, bo $b \\ne \\frac{1}{2}a$ – iloczyn jest dodatni."),
      ],
      { format: "proof" },
    ),
  ],
  [
    "3",
    open(
      "3",
      "W trójkącie równobocznym $ABC$ punkt $D$ leży na boku $BC$. Stosunek pola trójkąta $ABD$ do pola trójkąta $ADC$ jest równy $\\frac{\\sqrt{3} - 1}{2}$.\n\nOblicz miarę kąta $DAC$. Zapisz obliczenia.",
      ["45"],
      [
        step("Trójkąty $ABD$ i $ADC$ mają wspólną wysokość z $A$, więc $\\frac{|BD|}{|CD|} = \\frac{\\sqrt{3} - 1}{2}$ – albo równanie $\\frac{\\sin(60° - \\alpha)}{\\sin\\alpha} = \\frac{\\sqrt{3} - 1}{2}$, gdzie $\\alpha = |\\angle DAC|$."),
        step("Równanie z funkcjami jednego argumentu: $\\frac{\\sin 60° \\cos\\alpha - \\cos 60° \\sin\\alpha}{\\sin\\alpha} = \\frac{\\sqrt{3} - 1}{2}$."),
        step("$\\frac{\\sqrt{3}}{2}\\operatorname{ctg}\\alpha - \\frac{1}{2} = \\frac{\\sqrt{3} - 1}{2}$, więc $\\operatorname{ctg}\\alpha = 1$ i $|\\angle DAC| = 45°$."),
      ],
      { answerLabel: "|\\angle DAC| =" },
    ),
  ],
  [
    "4",
    open(
      "4",
      "Doświadczenie losowe polega na czterokrotnym rzucie symetryczną sześcienną kostką do gry, która na każdej ściance ma inną liczbę oczek – od jednego oczka do sześciu oczek.\n\nOblicz prawdopodobieństwo zdarzenia polegającego na tym, że otrzymamy co najmniej jeden raz sześć oczek, pod warunkiem że otrzymamy dokładnie dwa razy pięć oczek. Zapisz obliczenia.",
      ["9/25"],
      [
        step("$B$ – dokładnie dwa razy pięć oczek: $|B| = \\binom{4}{2} \\cdot 5 \\cdot 5 = 150$."),
        step("$A \\cap B$ – dodatkowo co najmniej jedna szóstka: $|A \\cap B| = \\binom{4}{2} \\cdot \\binom{2}{1} \\cdot 4 + \\binom{4}{2} = 54$."),
        step("$P(A \\mid B) = \\frac{54}{150} = \\frac{9}{25}$."),
      ],
    ),
  ],
  [
    "5",
    open(
      "5",
      "Rozwiąż nierówność\n\n$|x - 2| - 2 \\cdot |x + 3| < -2$\n\nZapisz obliczenia.",
      ["(-∞, -10) ∪ (-2/3, +∞)"],
      [
        step("Podział na przedziały $(-\\infty, -3)$, $[-3, 2)$, $[2, +\\infty)$ i zapis nierówności bez wartości bezwzględnej w jednym z nich."),
        step("Nierówność bez wartości bezwzględnej we wszystkich trzech przedziałach: $x + 8 < -2$, $-3x - 4 < -2$, $-x - 8 < -2$."),
        step("Rozwiązania w dwóch przedziałach (część wspólna z przedziałem), np. $x < -10$ oraz $x \\in \\left(-\\frac{2}{3}, 2\\right)$."),
        step("Trzeci przedział: $[2, +\\infty)$ w całości; odpowiedź $x \\in (-\\infty, -10) \\cup \\left(-\\frac{2}{3}, +\\infty\\right)$."),
      ],
    ),
  ],
  [
    "6",
    open(
      "6",
      "Ciąg $(a_n)$, określony dla każdej liczby naturalnej $n \\ge 1$, jest geometryczny i zbieżny. W tym ciągu $a_1 + a_3 = 20$ i $a_1^2 + a_3^2 = 328$.\n\nOblicz sumę wszystkich wyrazów tego ciągu. Rozważ wszystkie przypadki. Zapisz obliczenia.\n\n(W aplikacji wpisz wszystkie możliwe sumy, oddzielone średnikiem.)",
      ["27/2; 27"],
      [
        step("Równanie z jedną niewiadomą, np. $a_1^2 + (20 - a_1)^2 = 328$."),
        step("$a_1^2 - 20a_1 + 36 = 0$, więc $a_1 = 2$ lub $a_1 = 18$."),
        step("Pary: $(a_1, q) = (18, \\pm\\frac{1}{3})$ oraz $(2, \\pm 3)$ – szereg zbieżny tylko dla $|q| < 1$."),
        step("$S = \\frac{18}{1 - \\frac{1}{3}} = 27$ albo $S = \\frac{18}{1 + \\frac{1}{3}} = \\frac{27}{2}$."),
      ],
      { answerLabel: "S =" },
    ),
  ],
  [
    "7",
    open(
      "7",
      "W trapezie $ABCD$ o podstawach $AB$ i $CD$ punkt $E$ jest środkiem ramienia $AD$, a punkt $F$ jest środkiem ramienia $BC$ trapezu. Stosunek pola trapezu $EFCD$ do pola trapezu $ABFE$ jest równy $\\frac{1}{2}$.\n\nWykaż, że $\\frac{|CD|}{|AB|} = \\frac{1}{5}$.",
      [],
      [
        step("Odcinek łączący środki ramion: $d = |EF| = \\frac{a + b}{2}$, gdzie $a = |AB|$, $b = |CD|$."),
        step("Pola z wysokością $\\frac{h}{2}$: $P_{EFCD} = \\frac{1}{2}(d + b) \\cdot \\frac{h}{2}$, $P_{ABFE} = \\frac{1}{2}(a + d) \\cdot \\frac{h}{2}$."),
        step("Związek między podstawami: $\\frac{\\frac{a + b}{2} + b}{a + \\frac{a + b}{2}} = \\frac{1}{2}$, czyli $\\frac{a + 3b}{3a + b} = \\frac{1}{2}$."),
        step("$2a + 6b = 3a + b$, więc $a = 5b$ i $\\frac{|CD|}{|AB|} = \\frac{b}{a} = \\frac{1}{5}$."),
      ],
      { format: "proof" },
    ),
  ],
  [
    "8",
    open(
      "8",
      "W kartezjańskim układzie współrzędnych $(x, y)$ dane są okręgi $\\mathcal{O}_1$ oraz $\\mathcal{O}_2$ o równaniach:\n\n$\\mathcal{O}_1:\\ (x - 1)^2 + (y + 3)^2 = 5$\n\n$\\mathcal{O}_2:\\ (x - 2)^2 + (y - 4)^2 = 45$\n\nTe okręgi przecinają się w punktach $A$ oraz $B$. Punkt $A$ ma pierwszą współrzędną dodatnią. Punkt $M$ spełnia warunek $\\overrightarrow{AM} = -2 \\cdot \\overrightarrow{BM}$.\n\nOblicz współrzędne punktów $A$, $B$ oraz $M$. Zapisz obliczenia.\n\n(W aplikacji jako wynik wpisz współrzędne punktu $M$: $x$ i $y$ oddzielone średnikiem.)",
      ["2/5; -11/5"],
      [
        step("Prosta $AB$ z odjęcia równań okręgów: $2x + 14y = -30$, czyli $x = -7y - 15$."),
        step("Równanie z jedną niewiadomą, np. $(-7y - 15 - 2)^2 + (y - 4)^2 = 45$."),
        step("$A = \\left(\\frac{16}{5}, -\\frac{13}{5}\\right)$, $B = (-1, -2)$."),
        step("Z $\\overrightarrow{AM} = -2\\overrightarrow{BM}$: $M = \\frac{A + 2B}{3}$, czyli $x_M = \\frac{1}{3}x_A + \\frac{2}{3}x_B$, $y_M = \\frac{1}{3}y_A + \\frac{2}{3}y_B$."),
        step("$M = \\left(\\frac{2}{5}, -\\frac{11}{5}\\right)$."),
      ],
      { answerLabel: "M =" },
    ),
  ],
  [
    "9",
    open(
      "9",
      "Rozwiąż równanie\n\n$3\\cos^2 x + \\sqrt{3}\\sin(2x) - 3\\sin^2 x = 0$\n\nw przedziale $[-\\pi, \\pi]$. Zapisz obliczenia.",
      ["-2π/3; -π/6; π/3; 5π/6"],
      [
        step("$\\sin(2x) = 2\\sin x\\cos x$ i dzielenie przez $\\cos^2 x$: $-3\\operatorname{tg}^2 x + 2\\sqrt{3}\\operatorname{tg} x + 3 = 0$."),
        step("$\\operatorname{tg} x = \\sqrt{3}$ lub $\\operatorname{tg} x = -\\frac{\\sqrt{3}}{3}$."),
        step("$x = \\frac{\\pi}{3} + k\\pi$ lub $x = -\\frac{\\pi}{6} + k\\pi$, $k \\in \\mathbb{Z}$."),
        step("Uzasadnienie, że $\\cos x \\ne 0$: dla $x = \\frac{\\pi}{2} + k\\pi$ lewa strona to $-3 \\ne 0$ – dzielenie nie gubi rozwiązań."),
        step("W przedziale $[-\\pi, \\pi]$: $-\\frac{2\\pi}{3}$, $-\\frac{\\pi}{6}$, $\\frac{\\pi}{3}$, $\\frac{5\\pi}{6}$."),
      ],
    ),
  ],
  [
    "10",
    open(
      "10",
      "Podstawą ostrosłupa $ABCDS$ jest kwadrat $ABCD$. Krawędź boczna $SA$ jest wysokością ostrosłupa, natomiast krawędź podstawy ma długość $3\\sqrt{34}$. Cosinus kąta $\\beta$ między ścianami bocznymi $CDS$ i $BCS$ tego ostrosłupa jest równy $\\left(-\\frac{9}{25}\\right)$.\n\nOblicz pole powierzchni bocznej tego ostrosłupa. Zapisz obliczenia.",
      ["918"],
      [
        step("$E$ – spodek wysokości z $B$ i z $D$ na krawędź $SC$ (kąt $BED = \\beta$); twierdzenie cosinusów w $BED$: $(3\\sqrt{34} \\cdot \\sqrt{2})^2 = x^2 + x^2 - 2x^2 \\cdot \\left(-\\frac{9}{25}\\right)$, $x = |BE|$."),
        step("$x = |BE| = 15$."),
        step("$|CE| = \\sqrt{306 - 225} = 9$ i podobieństwo trójkątów $BCS$ i $ECB$: $\\frac{|CE|}{|BC|} = \\frac{|BC|}{|SC|}$."),
        step("$|SC| = 34$, $|BS| = 5\\sqrt{34}$, $|AS| = 4\\sqrt{34}$ (ściany $SBC$ i $SDC$ – trójkąty prostokątne)."),
        step("$P_b = 2 \\cdot \\frac{1}{2} \\cdot 3\\sqrt{34} \\cdot 4\\sqrt{34} + 2 \\cdot \\frac{1}{2} \\cdot 3\\sqrt{34} \\cdot 5\\sqrt{34} = 408 + 510 = 918$."),
      ],
      { answerLabel: "P_b =" },
    ),
  ],
  [
    "11",
    open(
      "11",
      "Funkcja $f$ jest określona wzorem\n\n$f(x) = (2 - m)x^2 - 2(2m + 1)x + m + 8$\n\ndla każdej liczby rzeczywistej $x$, gdzie $m$ jest liczbą rzeczywistą różną od $2$.\n\nWyznacz wszystkie wartości parametru $m$, dla których funkcja $f$ ma dokładnie dwa miejsca zerowe $x_1$ oraz $x_2$ tego samego znaku, które spełniają warunek\n\n$(x_1 - x_2)^2 \\le 180$\n\nZapisz obliczenia.",
      ["(-8, -3) ∪ (1, 3/2]"],
      [
        step("$\\Delta > 0$: $m \\in (-\\infty, -3) \\cup (1, +\\infty)$ (warunek $\\Delta \\ge 0$ – bez punktu)."),
        step("Miejsca zerowe tego samego znaku: $x_1 x_2 = \\frac{m + 8}{2 - m} > 0$, czyli $m \\in (-8, 2)$."),
        step("$(x_1 - x_2)^2 = (x_1 + x_2)^2 - 4x_1x_2 \\le 180$ (postać pod wzory Viète'a)."),
        step("Nierówność z niewiadomą $m$: $\\left[\\frac{2(2m + 1)}{2 - m}\\right]^2 - 4 \\cdot \\frac{m + 8}{2 - m} \\le 180$."),
        step("Jej rozwiązanie: $m \\in \\left(-\\infty, \\frac{3}{2}\\right] \\cup \\left[\\frac{13}{4}, +\\infty\\right)$."),
        step("Część wspólna wszystkich warunków (i $m \\ne 2$): $m \\in (-8, -3) \\cup \\left(1, \\frac{3}{2}\\right]$."),
      ],
    ),
  ],
  [
    "12.1",
    open(
      "12.1",
      "Rozważamy wszystkie stożki, których wysokość jest większa od $5$, a odległość środka podstawy od tworzącej jest równa $5$.\n\nWykaż, że objętość $V$ stożka, jako funkcja wysokości $h$ stożka, wyraża się wzorem\n\n$V(h) = \\frac{\\pi}{3} \\cdot \\frac{25h^3}{h^2 - 25}$",
      [],
      [
        step("Związek promienia $r$ z wysokością $h$, np. z pola trójkąta: $\\frac{1}{2}rh = \\frac{1}{2} \\cdot 5 \\cdot \\sqrt{h^2 + r^2}$."),
        step("$r^2 = \\frac{25h^2}{h^2 - 25}$, więc $V = \\frac{1}{3}\\pi r^2 h = \\frac{\\pi}{3} \\cdot \\frac{25h^3}{h^2 - 25}$."),
      ],
      { format: "proof" },
    ),
  ],
  [
    "12.2",
    open(
      "12.2",
      "Rozważamy wszystkie stożki, których wysokość jest większa od $5$, a odległość środka podstawy od tworzącej jest równa $5$.\n\nObjętość $V$ stożka, jako funkcja wysokości $h$ stożka, wyraża się wzorem\n\n$V(h) = \\frac{\\pi}{3} \\cdot \\frac{25h^3}{h^2 - 25}$ dla $h \\in (5, +\\infty)$.\n\nWyznacz wysokość tego z rozważanych stożków, którego objętość jest najmniejsza. Oblicz tę najmniejszą objętość. Zapisz obliczenia.\n\n(W aplikacji wpisz wysokość i objętość, oddzielone średnikiem.)",
      ["5√3; 125√3π/2"],
      [
        step("$V'(h) = \\frac{\\pi}{3} \\cdot \\frac{75h^2(h^2 - 25) - 25h^3 \\cdot 2h}{(h^2 - 25)^2} = \\frac{\\pi}{3} \\cdot \\frac{25h^2(h^2 - 75)}{(h^2 - 25)^2}$."),
        step("$V'(h) = 0$ dla $h = 5\\sqrt{3}$ (w dziedzinie)."),
        step("$V' < 0$ na $(5, 5\\sqrt{3})$ i $V' > 0$ na $(5\\sqrt{3}, +\\infty)$ – w $h = 5\\sqrt{3}$ objętość jest najmniejsza."),
        step("$V(5\\sqrt{3}) = \\frac{\\pi}{3} \\cdot \\frac{25 \\cdot 375\\sqrt{3}}{50} = \\frac{125\\sqrt{3}\\pi}{2}$."),
      ],
    ),
  ],
];

export const CKE_2025_MAJ_R: ExamSheet = {
  id: "cke-2025-maj-r",
  kind: "cke",
  year: 2025,
  session: "maj",
  title: "Matura rozszerzona maj 2025",
  subtitle: "Oficjalny arkusz CKE · poziom rozszerzony",
  level: "rozszerzony",
  durationMin: 180,
  tasks: TASKS.map(([, task]) => task),
  numbers: TASKS.map(([n]) => n),
  pdf: {
    exam: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/Matematyka/poziom_rozszerzony/MMAP-R0-100-A-2505-arkusz.pdf",
    solutions: "https://cke.gov.pl/images/_EGZAMIN_MATURALNY_OD_2023/Arkusze_egzaminacyjne/2025/zasady_oceniania/MMAP-R0-100-2505-zasady.pdf",
  },
};
