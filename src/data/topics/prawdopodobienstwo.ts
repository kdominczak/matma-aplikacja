import type { TopicContent } from "@/types/topic";

// Dział XII podstawy – rachunek prawdopodobieństwa (klasyczna definicja, zdarzenie przeciwne, suma zdarzeń).
// Testy i zadania otwarte napisane do lekcji; warianty z szablonów (src/data/templates/prawdopodobienstwo.ts) zostają.
const content: TopicContent = {
  theory: [
    {
      title: "Doświadczenie, wyniki i zdarzenia",
      body:
        "$\\Omega$ (omega) to zbiór wszystkich możliwych wyników doświadczenia, a $|\\Omega|$ – ich liczba. " +
        "Zdarzenie $A$ to wybrane wyniki, które nas interesują (np. „wypadła liczba pierwsza”).\n\n" +
        "Zanim cokolwiek policzysz, zapisz $\\Omega$ albo przynajmniej $|\\Omega|$ – to połowa punktów w zadaniu otwartym.",
      example: {
        prompt: "Rzucamy raz kostką. Zapisz $\\Omega$ i zdarzenie $A$ – „wypadła liczba pierwsza”.",
        solution: "$\\Omega = \\{1, 2, 3, 4, 5, 6\\}$, $|\\Omega| = 6$.\n$A = \\{2, 3, 5\\}$, $|A| = 3$ (jedynka nie jest liczbą pierwszą).",
      },
    },
    {
      title: "Prawdopodobieństwo klasyczne",
      body:
        "Gdy wszystkie wyniki są jednakowo prawdopodobne: $P(A) = \\frac{|A|}{|\\Omega|}$ – liczba wyników sprzyjających przez liczbę wszystkich.\n\n" +
        "Zawsze $0 \\le P(A) \\le 1$. Wynik ujemny albo większy od $1$ to pewny znak błędu.",
      example: {
        prompt: "Rzucamy raz kostką. Oblicz prawdopodobieństwo wyrzucenia liczby oczek podzielnej przez $3$.",
        solution: "$A = \\{3, 6\\}$, więc $P(A) = \\frac{2}{6} = \\frac{1}{3}$.",
      },
    },
    {
      title: "Dwa rzuty – tabelka 6 × 6",
      body:
        "Przy dwóch rzutach kostką wynik to para (pierwszy rzut, drugi rzut), więc $|\\Omega| = 6 \\cdot 6 = 36$. " +
        "Pary $(1, 6)$ i $(6, 1)$ to dwa RÓŻNE wyniki.\n\n" +
        "Najpewniej jest narysować tabelkę $6 \\times 6$ w brudnopisie i zaznaczyć pola, które spełniają warunek.",
      example: {
        prompt: "Rzucamy dwa razy kostką. Oblicz prawdopodobieństwo, że suma oczek będzie równa $7$.",
        solution: "Pary: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ – jest ich $6$.\n$P = \\frac{6}{36} = \\frac{1}{6}$.",
      },
    },
    {
      title: "Losowanie bez zwracania",
      body:
        "Losując kolejno bez zwracania, w drugim losowaniu masz o jeden element mniej. Licz wyniki jak ciągi (z kolejnością) – " +
        "i $|\\Omega|$, i $|A|$ regułą mnożenia. Najważniejsze, żeby oba liczyć tym samym sposobem.",
      example: {
        prompt: "W urnie są $3$ kule białe i $5$ czarnych. Losujemy kolejno bez zwracania dwie kule. Oblicz prawdopodobieństwo, że obie są białe.",
        solution: "$|\\Omega| = 8 \\cdot 7 = 56$, $|A| = 3 \\cdot 2 = 6$.\n$P(A) = \\frac{6}{56} = \\frac{3}{28}$.",
      },
    },
    {
      title: "Zdarzenie przeciwne i „lub”",
      body:
        "Zdarzenie przeciwne $A'$ to „$A$ nie zaszło”: $P(A') = 1 - P(A)$. Przydaje się przy „co najmniej jeden” – " +
        "łatwiej policzyć „ani jednego” i odjąć od $1$.\n\n" +
        "„$A$ lub $B$” to suma zdarzeń: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ – część wspólną odejmujemy, " +
        "bo liczyliśmy ją dwa razy.",
      example: {
        prompt: "Ze zbioru $\\{1, 2, \\ldots, 20\\}$ losujemy jedną liczbę. Oblicz prawdopodobieństwo, że jest podzielna przez $2$ lub przez $5$.",
        solution:
          "Podzielnych przez $2$: $10$, przez $5$: $4$, przez obie (przez $10$): $2$.\n" +
          "$|A \\cup B| = 10 + 4 - 2 = 12$, więc $P = \\frac{12}{20} = \\frac{3}{5}$.",
      },
    },
  ],
  formulas: [
    { label: "Prawdopodobieństwo klasyczne", tex: "P(A) = \\frac{|A|}{|\\Omega|}" },
    { label: "Własność prawdopodobieństwa", tex: "0 \\le P(A) \\le 1" },
    { label: "Zdarzenie przeciwne", tex: "P(A') = 1 - P(A)" },
    { label: "Suma zdarzeń", tex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
    { label: "Dwa rzuty kostką", tex: "|\\Omega| = 6 \\cdot 6 = 36" },
  ],
  traps: [
    "Prawdopodobieństwo nie może być ujemne ani większe od $1$ – taki wynik to sygnał błędu.",
    "W dwóch rzutach $(1, 6)$ i $(6, 1)$ to różne wyniki – $|\\Omega| = 36$, a nie $21$.",
    "„Lub” to suma zdarzeń – odejmij część wspólną, żeby nie liczyć jej dwa razy.",
    "Bez zwracania w drugim losowaniu jest o jedną kulę mniej – $\\frac{4}{6} \\cdot \\frac{4}{6}$ to losowanie ze zwracaniem.",
  ],
  openTasks: [
    {
      id: "pr-o1",
      difficulty: "podstawowy",
      points: 2,
      prompt: "W klasie jest $12$ dziewcząt i $18$ chłopców. Losujemy jedną osobę. Oblicz prawdopodobieństwo wylosowania dziewczyny.",
      answers: ["2/5"],
      answerLabel: "P =",
      hints: ["$|\\Omega|$ to liczba wszystkich uczniów w klasie."],
      solution: [
        { step: "$|\\Omega| = 30$, $|A| = 12$.", points: 1 },
        { step: "$P(A) = \\frac{12}{30} = \\frac{2}{5}$.", points: 1 },
      ],
    },
    {
      id: "pr-o2",
      difficulty: "sredni",
      points: 2,
      prompt: "Rzucamy dwa razy sześcienną kostką. Oblicz prawdopodobieństwo, że suma wyrzuconych oczek będzie większa od $9$.",
      answers: ["1/6"],
      answerLabel: "P =",
      hints: ["Suma większa od $9$ to $10$, $11$ albo $12$ – wypisz pary."],
      solution: [
        { step: "$|\\Omega| = 36$; pary: suma $10$ – $3$, suma $11$ – $2$, suma $12$ – $1$, razem $|A| = 6$.", points: 1 },
        { step: "$P(A) = \\frac{6}{36} = \\frac{1}{6}$.", points: 1 },
      ],
    },
    {
      id: "pr-o3",
      difficulty: "zaawansowany",
      points: 3,
      prompt:
        "Ze zbioru $\\{1, 2, \\ldots, 9\\}$ losujemy kolejno bez zwracania dwie liczby: pierwsza to cyfra dziesiątek, druga – jedności. Oblicz prawdopodobieństwo, że otrzymana liczba dwucyfrowa będzie parzysta.",
      answers: ["4/9"],
      answerLabel: "P =",
      hints: ["Zacznij od cyfry jedności – musi być parzysta."],
      solution: [
        { step: "Wszystkich wyników: $|\\Omega| = 9 \\cdot 8 = 72$.", points: 1 },
        { step: "Sprzyjające: jedności – $4$ cyfry parzyste, dziesiątki – $8$ pozostałych, $|A| = 32$.", points: 1 },
        { step: "$P(A) = \\frac{32}{72} = \\frac{4}{9}$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "pr-p1",
        prompt: "Rzucamy raz sześcienną kostką. Prawdopodobieństwo wyrzucenia liczby oczek większej od $4$ jest równe:",
        options: { A: "$\\frac{1}{3}$", B: "$\\frac{1}{2}$", C: "$\\frac{2}{3}$", D: "$\\frac{1}{6}$" },
        correct: "A",
        hints: ["Które wyniki są większe od $4$?", "Sprzyjające są $5$ i $6$ – dwa z sześciu."],
        explanation: "$A = \\{5, 6\\}$, więc $P(A) = \\frac{2}{6} = \\frac{1}{3}$.",
        trap: "„Większa od $4$” nie obejmuje czwórki – dla „co najmniej $4$” byłoby $\\frac{1}{2}$.",
      },
      {
        id: "pr-p2",
        prompt: "W urnie są $3$ kule białe i $7$ czarnych. Losujemy jedną kulę. Prawdopodobieństwo wylosowania kuli białej jest równe:",
        options: { A: "$\\frac{3}{10}$", B: "$\\frac{3}{7}$", C: "$\\frac{7}{10}$", D: "$\\frac{1}{3}$" },
        correct: "A",
        hints: ["$|\\Omega|$ to liczba wszystkich kul w urnie."],
        explanation: "$|\\Omega| = 10$, $|A| = 3$, więc $P(A) = \\frac{3}{10}$.",
        trap: "$\\frac{3}{7}$ dzieli białe przez czarne – a dzielimy przez WSZYSTKIE kule.",
      },
      {
        id: "pr-p3",
        prompt: "Prawdopodobieństwo zdarzenia $A$ jest równe $0{,}3$. Prawdopodobieństwo zdarzenia przeciwnego do $A$ jest równe:",
        options: { A: "$0{,}7$", B: "$0{,}3$", C: "$1{,}3$", D: "$0$" },
        correct: "A",
        hints: ["$P(A') = 1 - P(A)$."],
        explanation: "$P(A') = 1 - 0{,}3 = 0{,}7$.",
      },
    ],
    sredni: [
      {
        id: "pr-s1",
        prompt: "Rzucamy dwa razy sześcienną kostką. Prawdopodobieństwo, że suma oczek będzie równa $10$, jest równe:",
        options: { A: "$\\frac{1}{12}$", B: "$\\frac{1}{18}$", C: "$\\frac{1}{6}$", D: "$\\frac{5}{36}$" },
        correct: "A",
        explanation: "Pary $(4, 6)$, $(5, 5)$, $(6, 4)$: $P = \\frac{3}{36} = \\frac{1}{12}$.",
        trap: "$(4, 6)$ i $(6, 4)$ to dwa wyniki – pomijając jeden, wychodzi $\\frac{1}{18}$.",
      },
      {
        id: "pr-s2",
        prompt: "Ze zbioru liczb $\\{1, 2, 3, \\ldots, 20\\}$ losujemy jedną liczbę. Prawdopodobieństwo wylosowania liczby podzielnej przez $4$ jest równe:",
        options: { A: "$\\frac{1}{4}$", B: "$\\frac{1}{5}$", C: "$\\frac{1}{2}$", D: "$\\frac{3}{20}$" },
        correct: "A",
        explanation: "Podzielne przez $4$: $4, 8, 12, 16, 20$ – pięć liczb. $P = \\frac{5}{20} = \\frac{1}{4}$.",
      },
      {
        id: "pr-s3",
        prompt: "Rzucamy dwa razy monetą. Prawdopodobieństwo wyrzucenia co najmniej jednego orła jest równe:",
        options: { A: "$\\frac{3}{4}$", B: "$\\frac{1}{2}$", C: "$\\frac{1}{4}$", D: "$\\frac{2}{3}$" },
        correct: "A",
        explanation: "Zdarzenie przeciwne – dwie reszki – ma prawdopodobieństwo $\\frac{1}{4}$, więc $P = 1 - \\frac{1}{4} = \\frac{3}{4}$.",
        trap: "$\\frac{2}{3}$ wychodzi, gdy wyniki OR i RO policzysz jako jeden – a to dwa różne wyniki.",
      },
    ],
    zaawansowany: [
      {
        id: "pr-z1",
        prompt: "Ze zbioru $\\{1, 2, \\ldots, 30\\}$ losujemy jedną liczbę. Prawdopodobieństwo, że będzie podzielna przez $3$ lub przez $5$, jest równe:",
        options: { A: "$\\frac{7}{15}$", B: "$\\frac{8}{15}$", C: "$\\frac{1}{2}$", D: "$\\frac{2}{15}$" },
        correct: "A",
        explanation: "Przez $3$: $10$ liczb, przez $5$: $6$, przez $15$: $2$. $|A \\cup B| = 10 + 6 - 2 = 14$, $P = \\frac{14}{30} = \\frac{7}{15}$.",
        trap: "Bez odjęcia części wspólnej ($15$ i $30$) wychodzi $\\frac{16}{30} = \\frac{8}{15}$.",
      },
      {
        id: "pr-z2",
        prompt: "W urnie są $4$ kule białe i $2$ czarne. Losujemy kolejno bez zwracania dwie kule. Prawdopodobieństwo, że obie będą białe, jest równe:",
        options: { A: "$\\frac{2}{5}$", B: "$\\frac{4}{9}$", C: "$\\frac{1}{3}$", D: "$\\frac{2}{3}$" },
        correct: "A",
        explanation: "$|\\Omega| = 6 \\cdot 5 = 30$, $|A| = 4 \\cdot 3 = 12$, więc $P = \\frac{12}{30} = \\frac{2}{5}$.",
        trap: "$\\frac{4}{9} = \\frac{4}{6} \\cdot \\frac{4}{6}$ to losowanie ZE zwracaniem.",
      },
      {
        id: "pr-z3",
        prompt: "Rzucamy dwa razy sześcienną kostką. Prawdopodobieństwo, że iloczyn wyrzuconych oczek będzie liczbą parzystą, jest równe:",
        options: { A: "$\\frac{3}{4}$", B: "$\\frac{1}{2}$", C: "$\\frac{1}{4}$", D: "$\\frac{2}{3}$" },
        correct: "A",
        explanation: "Iloczyn jest nieparzysty tylko, gdy oba wyniki są nieparzyste: $\\frac{3 \\cdot 3}{36} = \\frac{1}{4}$. Stąd $P = 1 - \\frac{1}{4} = \\frac{3}{4}$.",
      },
    ],
  },
};

export default content;
