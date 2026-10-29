import type { TopicContent } from "@/types/topic";

// Dział IV podstawy – układy równań liniowych. Testy i zadania otwarte napisane do lekcji; warianty z szablonów
// parametrycznych (src/data/templates/uklady-rownan.ts) dochodzą do zakładki „Zadania” jak dotąd.
const content: TopicContent = {
  theory: [
    {
      title: "Co to jest układ równań",
      body:
        "Układ dwóch równań z dwiema niewiadomymi to pytanie: jaka para liczb $(x, y)$ spełnia OBA równania naraz?\n\n" +
        "Każde równanie liniowe to prosta, więc rozwiązanie układu to punkt przecięcia dwóch prostych. " +
        "Na rysunku: $y = x + 1$ i $y = -x + 5$ przecinają się w punkcie $(2, 3)$ – to jedyne rozwiązanie.",
      plot: {
        x: [-1, 5],
        y: [-1, 6],
        lines: [
          [
            [-1, 0],
            [5, 6],
          ],
          [
            [-1, 6],
            [5, 0],
          ],
        ],
        dots: [{ at: [2, 3] }],
      },
    },
    {
      title: "Metoda podstawiania",
      body:
        "Z jednego równania wyznacz jedną niewiadomą (najlepiej tę ze współczynnikiem $1$) i wstaw do drugiego. " +
        "Dostajesz równanie z jedną niewiadomą, a drugą liczysz na końcu.",
      example: {
        prompt: "Rozwiąż układ $\\begin{cases} y = 2x - 1 \\\\ 3x + y = 9 \\end{cases}$.",
        solution: "Podstawiamy: $3x + 2x - 1 = 9 \\Rightarrow 5x = 10 \\Rightarrow x = 2$.\n$y = 2 \\cdot 2 - 1 = 3$.\nRozwiązanie: $x = 2$, $y = 3$.",
      },
    },
    {
      title: "Metoda przeciwnych współczynników",
      body:
        "Pomnóż równania tak, żeby przy jednej niewiadomej stały liczby przeciwne (np. $3y$ i $-3y$), a potem je dodaj – " +
        "ta niewiadoma zniknie. Mnożąc równanie, mnożysz każdy wyraz po obu stronach.",
      example: {
        prompt: "Rozwiąż układ $\\begin{cases} 2x + 3y = 12 \\\\ 4x - 3y = 6 \\end{cases}$.",
        solution:
          "Przy $y$ są już liczby przeciwne – dodajemy: $6x = 18$, więc $x = 3$.\n" +
          "$2 \\cdot 3 + 3y = 12 \\Rightarrow y = 2$.\nSprawdzenie w drugim: $12 - 6 = 6$ ✓.",
      },
    },
    {
      title: "Ile rozwiązań ma układ",
      body:
        "• Proste się przecinają – dokładnie jedno rozwiązanie (układ oznaczony).\n\n" +
        "• Proste są równoległe i różne – brak rozwiązań (układ sprzeczny). Liczenie kończy się fałszem, np. $0 = 1$.\n\n" +
        "• Proste się pokrywają – nieskończenie wiele rozwiązań (układ nieoznaczony). Liczenie kończy się tożsamością $0 = 0$.\n\n" +
        "Szybki sprawdzian: jeśli jedno równanie po pomnożeniu ma te same współczynniki przy $x$ i $y$ co drugie, " +
        "to układ jest nieoznaczony (ta sama prawa strona) albo sprzeczny (inna prawa strona).",
      example: {
        prompt: "Ile rozwiązań ma układ $\\begin{cases} x + y = 3 \\\\ 2x + 2y = 7 \\end{cases}$?",
        solution: "Pierwsze równanie razy $2$: $2x + 2y = 6$, a drugie mówi $2x + 2y = 7$.\n$6 \\neq 7$ – układ jest sprzeczny, nie ma rozwiązań.",
      },
    },
    {
      title: "Zadania z treścią",
      body:
        "Plan zawsze ten sam: 1) oznacz niewiadome (zapisz słownie, co znaczą), 2) z dwóch informacji z treści ułóż dwa równania, " +
        "3) rozwiąż układ, 4) sprawdź, czy odpowiedź ma sens (liczba osób czy biletów nie może być ujemna ani ułamkowa).",
      example: {
        prompt: "Bilet normalny kosztuje $20$ zł, ulgowy $12$ zł. Za $10$ biletów zapłacono $168$ zł. Ile kupiono biletów normalnych?",
        solution:
          "$n$ – normalne, $u$ – ulgowe: $n + u = 10$ i $20n + 12u = 168$.\n" +
          "$u = 10 - n \\Rightarrow 20n + 120 - 12n = 168 \\Rightarrow 8n = 48 \\Rightarrow n = 6$.\n" +
          "Kupiono $6$ biletów normalnych (i $4$ ulgowe).",
      },
    },
  ],
  formulas: [
    { label: "Układ dwóch równań liniowych", tex: "\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}" },
    { label: "Punkt wspólny dwóch prostych", tex: "m_1x + k_1 = m_2x + k_2" },
    { label: "Postać ogólna → kierunkowa", tex: "Ax + By = C \\Rightarrow y = -\\frac{A}{B}x + \\frac{C}{B}" },
  ],
  traps: [
    "Rozwiązanie układu to PARA liczb – podaj i $x$, i $y$.",
    "Mnożąc równanie przez liczbę, pomnóż wszystkie wyrazy po obu stronach – także prawą stronę.",
    "Sprawdzaj wynik w OBU równaniach: para spełniająca tylko jedno to typowa zła odpowiedź CKE.",
    "W zadaniu z treścią odpowiedź musi mieć sens – liczba biletów nie może być ujemna ani ułamkowa.",
  ],
  openTasks: [
    {
      id: "ur-o1",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Rozwiąż układ równań $\\begin{cases} x + y = 10 \\\\ x - y = 4 \\end{cases}$. Podaj wartość $x$.",
      answers: ["7"],
      answerLabel: "x =",
      hints: ["Dodaj równania stronami – $y$ się zredukuje."],
      solution: [
        { step: "Dodanie równań: $2x = 14$, więc $x = 7$.", points: 1 },
        { step: "Druga niewiadoma: $y = 10 - 7 = 3$.", points: 1 },
      ],
    },
    {
      id: "ur-o2",
      difficulty: "sredni",
      points: 2,
      prompt: "W klasie jest $28$ uczniów. Dziewcząt jest o $4$ więcej niż chłopców. Oblicz, ilu jest chłopców.",
      answers: ["12"],
      hints: ["Oznacz $c$ – chłopcy, $d$ – dziewczęta. Ułóż dwa równania."],
      solution: [
        { step: "Układ: $c + d = 28$, $d = c + 4$.", points: 1 },
        { step: "Podstawienie: $2c + 4 = 28$, więc $c = 12$.", points: 1 },
      ],
    },
    {
      id: "ur-o3",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Rozwiąż układ równań $\\begin{cases} 3x - 2y = 4 \\\\ 2x + 5y = 9 \\end{cases}$. Podaj sumę $x + y$.",
      answers: ["3"],
      answerLabel: "x + y =",
      hints: ["Pomnóż pierwsze równanie przez $5$, a drugie przez $2$ – przy $y$ będą liczby przeciwne."],
      solution: [
        { step: "Przeciwne współczynniki: $15x - 10y = 20$ i $4x + 10y = 18$.", points: 1 },
        { step: "Dodanie: $19x = 38$, więc $x = 2$, a z pierwszego równania $y = 1$.", points: 1 },
        { step: "Suma: $x + y = 3$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "ur-p1",
        prompt: "Rozwiązaniem układu równań $\\begin{cases} x + y = 7 \\\\ x - y = 3 \\end{cases}$ jest para:",
        options: { A: "$x = 5$, $y = 2$", B: "$x = 2$, $y = 5$", C: "$x = 4$, $y = 3$", D: "$x = 10$, $y = -3$" },
        correct: "A",
        hints: ["Dodaj równania stronami – $y$ zniknie.", "$2x = 10$."],
        explanation: "Po dodaniu: $2x = 10$, więc $x = 5$, a $y = 7 - 5 = 2$.",
        trap: "$x = 2$, $y = 5$ spełnia pierwsze równanie, ale $2 - 5 \\neq 3$ – sprawdzaj oba.",
      },
      {
        id: "ur-p2",
        prompt: "Która para liczb spełnia jednocześnie równania $2x + y = 8$ i $y = x + 2$?",
        options: { A: "$(2, 4)$", B: "$(3, 2)$", C: "$(4, 0)$", D: "$(1, 6)$" },
        correct: "A",
        hints: ["Wstaw $y = x + 2$ do pierwszego równania."],
        explanation: "$2x + x + 2 = 8 \\Rightarrow x = 2$, $y = 4$. Pozostałe pary spełniają tylko pierwsze równanie.",
      },
      {
        id: "ur-p3",
        prompt: "Układ równań $\\begin{cases} y = 3x \\\\ x + y = 8 \\end{cases}$ ma rozwiązanie:",
        options: { A: "$x = 2$, $y = 6$", B: "$x = 6$, $y = 2$", C: "$x = 3$, $y = 5$", D: "$x = 4$, $y = 12$" },
        correct: "A",
        hints: ["W drugim równaniu zamień $y$ na $3x$."],
        explanation: "$x + 3x = 8 \\Rightarrow x = 2$, a $y = 3 \\cdot 2 = 6$.",
      },
    ],
    sredni: [
      {
        id: "ur-s1",
        prompt: "Rozwiązaniem układu $\\begin{cases} 3x + 2y = 16 \\\\ 5x - 2y = 0 \\end{cases}$ jest para:",
        options: { A: "$(2, 5)$", B: "$(5, 2)$", C: "$(2, -5)$", D: "$(4, 2)$" },
        correct: "A",
        explanation: "Dodajemy równania: $8x = 16$, $x = 2$; z drugiego $2y = 10$, więc $y = 5$.",
      },
      {
        id: "ur-s2",
        prompt: "Układ równań $\\begin{cases} x + 2y = 4 \\\\ 2x + 4y = 8 \\end{cases}$:",
        options: {
          A: "ma nieskończenie wiele rozwiązań",
          B: "nie ma rozwiązań",
          C: "ma dokładnie jedno rozwiązanie",
          D: "ma dokładnie dwa rozwiązania",
        },
        correct: "A",
        explanation: "Drugie równanie to pierwsze pomnożone przez $2$ – opisują tę samą prostą, więc rozwiązań jest nieskończenie wiele.",
        trap: "Układ równań liniowych nigdy nie ma dokładnie dwóch rozwiązań – proste mają $0$, $1$ albo nieskończenie wiele punktów wspólnych.",
      },
      {
        id: "ur-s3",
        prompt: "Suma dwóch liczb jest równa $20$, a ich różnica $6$. Większa z tych liczb to:",
        options: { A: "$13$", B: "$7$", C: "$14$", D: "$10$" },
        correct: "A",
        explanation: "$x + y = 20$, $x - y = 6$. Dodajemy: $2x = 26$, więc $x = 13$ (a mniejsza to $7$).",
      },
    ],
    zaawansowany: [
      {
        id: "ur-z1",
        prompt: "Układ równań $\\begin{cases} 2x - y = 3 \\\\ 4x - 2y = m \\end{cases}$ jest sprzeczny dla:",
        options: { A: "$m \\neq 6$", B: "$m = 6$", C: "$m = 3$", D: "każdego $m$" },
        correct: "A",
        explanation:
          "Pierwsze równanie razy $2$: $4x - 2y = 6$. Lewe strony są takie same, więc przy $m \\neq 6$ dostajemy sprzeczność, a przy $m = 6$ – nieskończenie wiele rozwiązań.",
      },
      {
        id: "ur-z2",
        prompt:
          "Za $3$ zeszyty i $2$ długopisy zapłacono $19$ zł, a za $2$ zeszyty i $3$ długopisy – $16$ zł. Jeden zeszyt kosztuje:",
        options: { A: "$5$ zł", B: "$2$ zł", C: "$4$ zł", D: "$3$ zł" },
        correct: "A",
        explanation:
          "$3z + 2d = 19$, $2z + 3d = 16$. Mnożymy przez $3$ i $2$: $9z + 6d = 57$, $4z + 6d = 32$. Odejmujemy: $5z = 25$, $z = 5$ (a $d = 2$).",
        trap: "$2$ zł to cena długopisu – czytaj, o którą niewiadomą pyta zadanie.",
      },
      {
        id: "ur-z3",
        prompt: "Liczby $x$ i $y$ spełniają układ $\\begin{cases} x + y = 5 \\\\ x - y = 1 \\end{cases}$. Wartość wyrażenia $x^2 - y^2$ jest równa:",
        options: { A: "$5$", B: "$4$", C: "$13$", D: "$6$" },
        correct: "A",
        explanation: "$x^2 - y^2 = (x + y)(x - y) = 5 \\cdot 1 = 5$ (sprawdzenie: $x = 3$, $y = 2$, $9 - 4 = 5$).",
        trap: "$13 = x^2 + y^2$ – to suma kwadratów, a nie różnica.",
      },
    ],
  },
};

export default content;
