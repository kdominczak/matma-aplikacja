import type { TopicContent } from "@/types/topic";

// Rozszerzenie – prawdopodobieństwo warunkowe, całkowite i schemat Bernoullego (dział XII, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Prawdopodobieństwo warunkowe",
      body:
        "$P(A \\mid B)$ to prawdopodobieństwo $A$, gdy wiemy, że zaszło $B$:\n\n" +
        "$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$.\n\n" +
        "Intuicja: wiedza o $B$ zawęża świat do zdarzeń z $B$ – liczysz, jaką część tego mniejszego świata stanowi $A$.",
      example: {
        prompt: "Rzucamy kostką. Jakie jest prawdopodobieństwo, że wypadło więcej niż $3$, jeśli wiadomo, że wypadła liczba parzysta?",
        solution:
          "$B = \\{2, 4, 6\\}$, $A \\cap B = \\{4, 6\\}$.\n" +
          "$P(A \\mid B) = \\frac{\\frac{2}{6}}{\\frac{3}{6}} = \\frac{2}{3}$.",
      },
      check: {
        id: "rz-pr-t1",
        prompt: "Rzucamy kostką. Prawdopodobieństwo, że wypadła szóstka, jeśli wiadomo, że wypadła liczba parzysta, jest równe:",
        options: { A: "$\\frac{1}{3}$", B: "$\\frac{1}{6}$", C: "$\\frac{1}{2}$", D: "$\\frac{1}{12}$" },
        correct: "A",
        explanation: "Świat zawęża się do $\\{2, 4, 6\\}$ – szóstka to jedna z trzech możliwości.",
        trap: "$\\frac{1}{6}$ ignoruje informację, że wynik jest parzysty.",
      },
    },
    {
      title: "Prawdopodobieństwo całkowite – drzewko",
      body:
        "Gdy doświadczenie ma etapy (najpierw losujesz urnę, potem kulę), narysuj drzewko. Prawdopodobieństwo wyniku to suma " +
        "po wszystkich gałęziach, które do niego prowadzą, a każda gałąź to iloczyn prawdopodobieństw na jej odcinkach:\n\n" +
        "$P(A) = P(A \\mid B_1)P(B_1) + P(A \\mid B_2)P(B_2) + \\ldots$",
      example: {
        prompt:
          "Rzucamy monetą: orzeł – losujemy kulę z urny I (3 białe, 2 czarne), reszka – z urny II (1 biała, 4 czarne). Oblicz prawdopodobieństwo wylosowania kuli białej.",
        solution: "$P(B) = \\frac{1}{2} \\cdot \\frac{3}{5} + \\frac{1}{2} \\cdot \\frac{1}{5}$\n$= \\frac{3}{10} + \\frac{1}{10} = \\frac{2}{5}$.",
      },
      check: {
        id: "rz-pr-t2",
        prompt:
          "W urnie I są 2 kule białe i 2 czarne, w urnie II – 3 białe i 1 czarna. Losujemy urnę (każdą z prawdopodobieństwem $\\frac{1}{2}$), a z niej kulę. Prawdopodobieństwo wylosowania kuli białej jest równe:",
        options: { A: "$\\frac{5}{8}$", B: "$\\frac{5}{4}$", C: "$\\frac{1}{2}$", D: "$\\frac{3}{8}$" },
        correct: "A",
        explanation: "$\\frac{1}{2} \\cdot \\frac{2}{4} + \\frac{1}{2} \\cdot \\frac{3}{4} = \\frac{1}{4} + \\frac{3}{8} = \\frac{5}{8}$.",
        trap: "$\\frac{5}{4}$ to suma bez mnożenia przez $\\frac{1}{2}$ – prawdopodobieństwo nie może przekroczyć $1$.",
      },
    },
    {
      title: "Schemat Bernoullego",
      body:
        "$n$ niezależnych powtórzeń tej samej próby, sukces z prawdopodobieństwem $p$. Prawdopodobieństwo dokładnie $k$ sukcesów:\n\n" +
        "$P(S_n = k) = \\binom{n}{k}p^k(1 - p)^{n - k}$.\n\n" +
        "Symbol Newtona liczy, na których miejscach są sukcesy. Przy „co najmniej” sumuj kilka wartości $k$ albo licz dopełnienie.",
      example: {
        prompt: "Rzucamy trzy razy monetą. Oblicz prawdopodobieństwo wyrzucenia dokładnie dwóch orłów.",
        solution: "$n = 3$, $k = 2$, $p = \\frac{1}{2}$.\n$\\binom{3}{2}\\left(\\frac{1}{2}\\right)^2\\left(\\frac{1}{2}\\right)^1 = \\frac{3}{8}$.",
      },
      check: {
        id: "rz-pr-t3",
        prompt: "Rzucamy cztery razy symetryczną monetą. Prawdopodobieństwo wyrzucenia dokładnie dwóch orłów jest równe:",
        options: { A: "$\\frac{3}{8}$", B: "$\\frac{1}{2}$", C: "$\\frac{1}{4}$", D: "$\\frac{1}{16}$" },
        correct: "A",
        explanation: "$\\binom{4}{2} \\cdot \\frac{1}{16} = \\frac{6}{16} = \\frac{3}{8}$.",
        trap: "„Połowa rzutów to orły” nie znaczy $\\frac{1}{2}$ – trzeba policzyć ustawienia.",
      },
    },
  ],
  formulas: [
    { label: "Prawdopodobieństwo warunkowe", tex: "P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}" },
    { label: "Prawdopodobieństwo całkowite", tex: "P(A) = \\sum_{i} P(A \\mid B_i)P(B_i)" },
    { label: "Zdarzenia niezależne", tex: "P(A \\cap B) = P(A) \\cdot P(B)" },
    { label: "Schemat Bernoullego", tex: "P(S_n = k) = \\binom{n}{k}p^k(1 - p)^{n - k}" },
  ],
  traps: [
    "W $P(A \\mid B)$ dzielisz przez $P(B)$ – zdarzenie, które WIEMY, że zaszło.",
    "W drzewku mnożysz wzdłuż gałęzi, a sumujesz różne gałęzie.",
    "Wynik większy niż $1$ to zawsze błąd – sprawdź, czy nie zgubiłeś mnożenia.",
    "W schemacie Bernoullego nie zapomnij o symbolu Newtona.",
  ],
  openTasks: [
    {
      id: "rz-pr-o1",
      difficulty: "sredni",
      points: 3,
      prompt:
        "W urnie I są 4 kule białe i 1 czarna, a w urnie II – 2 białe i 3 czarne. Rzucamy kostką: gdy wypadnie $1$ lub $2$, losujemy kulę z urny I, w przeciwnym razie – z urny II. Oblicz prawdopodobieństwo wylosowania kuli białej.",
      answers: ["8/15"],
      hints: ["Urna I z prawdopodobieństwem $\\frac{2}{6}$, urna II – $\\frac{4}{6}$."],
      solution: [
        { step: "$P(U_1) = \\frac{1}{3}$, $P(U_2) = \\frac{2}{3}$.", points: 1 },
        { step: "$P(B \\mid U_1) = \\frac{4}{5}$, $P(B \\mid U_2) = \\frac{2}{5}$.", points: 1 },
        { step: "$P(B) = \\frac{1}{3} \\cdot \\frac{4}{5} + \\frac{2}{3} \\cdot \\frac{2}{5} = \\frac{4}{15} + \\frac{4}{15} = \\frac{8}{15}$.", points: 1 },
      ],
    },
    {
      id: "rz-pr-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Rzucamy pięć razy symetryczną monetą. Oblicz prawdopodobieństwo, że orzeł wypadnie co najmniej cztery razy.",
      answers: ["3/16"],
      hints: ["„Co najmniej cztery” to $k = 4$ lub $k = 5$."],
      solution: [
        { step: "Schemat Bernoullego: $n = 5$, $p = \\frac{1}{2}$.", points: 1 },
        { step: "$P(S_5 = 4) = \\binom{5}{4} \\cdot \\frac{1}{32} = \\frac{5}{32}$, $P(S_5 = 5) = \\frac{1}{32}$.", points: 1 },
        { step: "$P = \\frac{6}{32} = \\frac{3}{16}$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-pr-p1",
        prompt: "$P(A \\cap B) = 0{,}2$ i $P(B) = 0{,}5$. Wtedy $P(A \\mid B)$ jest równe:",
        options: { A: "$0{,}4$", B: "$0{,}1$", C: "$0{,}7$", D: "$2{,}5$" },
        correct: "A",
        explanation: "$\\frac{0{,}2}{0{,}5} = 0{,}4$.",
      },
      {
        id: "rz-pr-p2",
        prompt: "Zdarzenia $A$ i $B$ są niezależne, $P(A) = 0{,}3$, $P(B) = 0{,}5$. Wtedy $P(A \\cap B)$ jest równe:",
        options: { A: "$0{,}15$", B: "$0{,}8$", C: "$0{,}2$", D: "$0{,}65$" },
        correct: "A",
        explanation: "Dla zdarzeń niezależnych $P(A \\cap B) = 0{,}3 \\cdot 0{,}5 = 0{,}15$.",
        trap: "$0{,}65$ to $P(A \\cup B)$, a nie część wspólna.",
      },
    ],
    sredni: [
      {
        id: "rz-pr-s1",
        prompt: "Rzucamy dwa razy kostką. Prawdopodobieństwo, że suma oczek wynosi $8$, jeśli w pierwszym rzucie wypadły $3$ oczka, jest równe:",
        options: { A: "$\\frac{1}{6}$", B: "$\\frac{5}{36}$", C: "$\\frac{1}{36}$", D: "$\\frac{1}{3}$" },
        correct: "A",
        explanation: "W drugim rzucie musi wypaść $5$ – jedna z sześciu możliwości.",
        trap: "$\\frac{5}{36}$ to prawdopodobieństwo sumy $8$ bez warunku.",
      },
      {
        id: "rz-pr-s2",
        prompt: "Strzelec trafia z prawdopodobieństwem $0{,}8$. Oddaje trzy niezależne strzały. Prawdopodobieństwo, że trafi dokładnie dwa razy, jest równe:",
        options: { A: "$0{,}384$", B: "$0{,}128$", C: "$0{,}64$", D: "$0{,}512$" },
        correct: "A",
        explanation: "$\\binom{3}{2} \\cdot 0{,}8^2 \\cdot 0{,}2 = 3 \\cdot 0{,}128 = 0{,}384$.",
        trap: "$0{,}128$ to jedno konkretne ustawienie – symbol Newtona liczy, który strzał był chybiony.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-pr-z1",
        prompt:
          "Maszyna $M_1$ produkuje $60\\%$ wyrobów, z czego $2\\%$ jest wadliwych, a maszyna $M_2$ – $40\\%$, z czego $5\\%$ jest wadliwych. Prawdopodobieństwo, że losowy wyrób jest wadliwy, jest równe:",
        options: { A: "$0{,}032$", B: "$0{,}07$", C: "$0{,}035$", D: "$0{,}02$" },
        correct: "A",
        explanation: "$0{,}6 \\cdot 0{,}02 + 0{,}4 \\cdot 0{,}05 = 0{,}012 + 0{,}02 = 0{,}032$.",
        trap: "$0{,}07$ to suma procentów bez wag maszyn.",
      },
      {
        id: "rz-pr-z2",
        prompt:
          "Maszyna $M_1$ produkuje $60\\%$ wyrobów ($2\\%$ wadliwych), a $M_2$ – $40\\%$ ($5\\%$ wadliwych). Wylosowany wyrób okazał się wadliwy. Prawdopodobieństwo, że wyprodukowała go maszyna $M_2$, jest równe:",
        options: { A: "$0{,}625$", B: "$0{,}4$", C: "$0{,}375$", D: "$0{,}05$" },
        correct: "A",
        explanation: "$\\frac{0{,}4 \\cdot 0{,}05}{0{,}032} = \\frac{0{,}02}{0{,}032} = 0{,}625$.",
        trap: "$0{,}4$ to udział $M_2$ w całej produkcji – informacja o wadzie go zmienia.",
      },
    ],
  },
};

export default content;
