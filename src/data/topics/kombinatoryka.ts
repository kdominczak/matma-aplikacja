import type { TopicContent } from "@/types/topic";

// Dział XI podstawy – kombinatoryka (reguła mnożenia i dodawania, bez symbolu Newtona – to poziom rozszerzony).
// Testy i zadania otwarte napisane do lekcji; warianty z szablonów (src/data/templates/kombinatoryka.ts) zostają.
const content: TopicContent = {
  theory: [
    {
      title: "Reguła mnożenia",
      body:
        "Jeśli wybór robisz w kilku krokach, a w każdym kroku liczba możliwości nie zależy od poprzednich, " +
        "to wszystkich możliwości jest $n_1 \\cdot n_2 \\cdot \\ldots \\cdot n_k$.\n\n" +
        "Narysuj „okienka” – jedno na każdy krok – i wpisz do każdego, na ile sposobów można go wypełnić. Potem pomnóż.",
      example: {
        prompt: "Masz $3$ koszulki, $4$ pary spodni i $2$ pary butów. Ile różnych zestawów możesz ubrać?",
        solution: "Trzy okienka: koszulka, spodnie, buty.\n$3 \\cdot 4 \\cdot 2 = 24$ zestawy.",
      },
    },
    {
      title: "Ciągi z powtórzeniami",
      body:
        "Gdy elementy mogą się powtarzać (kod PIN, rzuty monetą, odpowiedzi w teście), w każdym okienku masz tyle samo możliwości. " +
        "Ciągów długości $k$ z $n$ elementów jest $n^k$.",
      example: {
        prompt: "Ile jest czterocyfrowych kodów PIN (cyfry mogą się powtarzać, kod może zaczynać się od zera)?",
        solution: "Każde z $4$ miejsc: $10$ cyfr.\n$10^4 = 10\\,000$ kodów.",
      },
    },
    {
      title: "Bez powtórzeń i ustawienia w kolejce",
      body:
        "Gdy elementy nie mogą się powtarzać (miejsca na podium, różne cyfry), z każdym okienkiem ubywa jedna możliwość: " +
        "$n(n - 1)(n - 2) \\cdot \\ldots$\n\n" +
        "Ustawienie wszystkich $n$ elementów w kolejności to $n! = 1 \\cdot 2 \\cdot \\ldots \\cdot n$ (np. $5! = 120$).\n\n" +
        "Gdy kolejność nie ma znaczenia (wybór delegacji), każda grupa jest policzona tyle razy, na ile sposobów da się ją ustawić – " +
        "wynik dziel przez tę liczbę. Para: przez $2$.",
      example: {
        prompt: "Z $8$ zawodników wybieramy złoto, srebro i brąz. Na ile sposobów?",
        solution: "Okienka: złoto – $8$, srebro – $7$, brąz – $6$.\n$8 \\cdot 7 \\cdot 6 = 336$.",
      },
    },
    {
      title: "Liczby z cyfr – uwaga na zero",
      body:
        "Liczba nie może zaczynać się od zera: na pierwszym miejscu wybierasz spośród $9$ cyfr ($1$–$9$). " +
        "Na pozostałych miejscach zero jest już dozwolone.\n\n" +
        "Warunek na ostatnią cyfrę (parzysta, podzielna przez $5$) zapisz w okienku od razu, a przy różnych cyfrach " +
        "zacznij od miejsc z ograniczeniem.",
      example: {
        prompt: "Ile jest liczb trzycyfrowych o różnych cyfrach?",
        solution: "Setki: $9$ (bez zera), dziesiątki: $9$ (zero wraca, odpada cyfra setek), jedności: $8$.\n$9 \\cdot 9 \\cdot 8 = 648$.",
      },
    },
    {
      title: "Reguła dodawania i „co najmniej jeden”",
      body:
        "Gdy możliwości dzielą się na rozłączne przypadki (np. liczba kończy się na $0$ albo na $5$), policz każdy osobno i dodaj.\n\n" +
        "„Co najmniej jeden” najłatwiej policzyć od drugiej strony: wszystkie możliwości minus te, w których nie ma ani jednego.",
      example: {
        prompt: "Ile jest liczb dwucyfrowych, w których zapisie występuje co najmniej jedna cyfra $7$?",
        solution:
          "Wszystkich dwucyfrowych: $90$. Bez siódemki: $8 \\cdot 9 = 72$ (dziesiątki bez $0$ i $7$, jedności bez $7$).\n" +
          "Z co najmniej jedną siódemką: $90 - 72 = 18$.",
      },
    },
  ],
  formulas: [
    { label: "Reguła mnożenia", tex: "n_1 \\cdot n_2 \\cdot \\ldots \\cdot n_k" },
    { label: "Ciągi k-wyrazowe z n elementów (z powtórzeniami)", tex: "n^k" },
    { label: "Ciągi k-wyrazowe z n elementów (bez powtórzeń)", tex: "n(n - 1)(n - 2) \\cdot \\ldots \\cdot (n - k + 1)" },
    { label: "Ustawienia n elementów", tex: "n! = 1 \\cdot 2 \\cdot \\ldots \\cdot n" },
    { label: "Co najmniej jeden (dopełnienie)", tex: "|A| = |\\Omega| - |A'|" },
  ],
  traps: [
    "Liczba nie zaczyna się od zera – na pierwszym miejscu wybierasz z $9$ cyfr, nie z $10$.",
    "„Różne cyfry” to brak powtórzeń: w każdym kolejnym okienku o jedną możliwość mniej.",
    "Gdy kolejność nie ma znaczenia (wybór dwóch osób), podziel wynik przez liczbę ustawień grupy.",
    "„Co najmniej jeden” licz przez dopełnienie – bez tego łatwo policzyć coś dwa razy (np. liczbę $77$).",
  ],
  openTasks: [
    {
      id: "km-o1",
      difficulty: "podstawowy",
      points: 2,
      prompt: "W restauracji można wybrać jedną z $3$ zup, jedno z $5$ dań głównych i jeden z $2$ deserów. Oblicz, ile jest różnych zestawów obiadowych.",
      answers: ["30"],
      hints: ["Trzy kroki wyboru – użyj reguły mnożenia."],
      solution: [
        { step: "Reguła mnożenia: $3 \\cdot 5 \\cdot 2$.", points: 1 },
        { step: "Wynik: $30$ zestawów.", points: 1 },
      ],
    },
    {
      id: "km-o2",
      difficulty: "sredni",
      points: 2,
      prompt: "Oblicz, ile jest liczb czterocyfrowych, w których zapisie nie występuje cyfra $0$, a cyfry się nie powtarzają.",
      answers: ["3024"],
      hints: ["Do dyspozycji masz cyfry $1$–$9$; z każdym miejscem ubywa jedna."],
      solution: [
        { step: "Okienka: $9 \\cdot 8 \\cdot 7 \\cdot 6$.", points: 1 },
        { step: "Wynik: $3024$.", points: 1 },
      ],
    },
    {
      id: "km-o3",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Oblicz, ile jest liczb trzycyfrowych podzielnych przez $5$, w których zapisie cyfry się nie powtarzają.",
      answers: ["136"],
      hints: ["Rozbij na dwa przypadki: ostatnia cyfra $0$ albo ostatnia cyfra $5$."],
      solution: [
        { step: "Kończące się na $0$: setki $9$, dziesiątki $8$ – razem $72$.", points: 1 },
        { step: "Kończące się na $5$: setki $8$ (bez $0$ i $5$), dziesiątki $8$ – razem $64$.", points: 1 },
        { step: "Reguła dodawania: $72 + 64 = 136$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "km-p1",
        prompt: "Na ile sposobów można wybrać zestaw złożony z jednej z $4$ koszulek i jednej z $3$ par spodni?",
        options: { A: "$12$", B: "$7$", C: "$64$", D: "$81$" },
        correct: "A",
        hints: ["Każdą koszulkę możesz połączyć z każdą parą spodni.", "Reguła mnożenia: $4 \\cdot 3$."],
        explanation: "$4 \\cdot 3 = 12$ zestawów.",
        trap: "$7$ to suma – a każda koszulka pasuje do każdych spodni, więc mnożymy.",
      },
      {
        id: "km-p2",
        prompt: "Ile jest czterocyfrowych kodów PIN, jeśli cyfry mogą się powtarzać, a kod może zaczynać się od zera?",
        options: { A: "$10\\,000$", B: "$5040$", C: "$9000$", D: "$40$" },
        correct: "A",
        hints: ["Na każdym z $4$ miejsc może stać każda z $10$ cyfr."],
        explanation: "$10 \\cdot 10 \\cdot 10 \\cdot 10 = 10^4 = 10\\,000$.",
      },
      {
        id: "km-p3",
        prompt: "Na ile sposobów można ustawić $4$ osoby w kolejce?",
        options: { A: "$24$", B: "$16$", C: "$4$", D: "$256$" },
        correct: "A",
        hints: ["Pierwsze miejsce: $4$ osoby, drugie: już tylko $3$…"],
        explanation: "$4 \\cdot 3 \\cdot 2 \\cdot 1 = 4! = 24$.",
      },
    ],
    sredni: [
      {
        id: "km-s1",
        prompt: "Ile jest liczb trzycyfrowych o różnych cyfrach?",
        options: { A: "$648$", B: "$720$", C: "$900$", D: "$504$" },
        correct: "A",
        explanation: "Setki: $9$ (bez zera), dziesiątki: $9$, jedności: $8$ – razem $648$.",
        trap: "$720 = 10 \\cdot 9 \\cdot 8$ liczy też „liczby” zaczynające się od zera.",
      },
      {
        id: "km-s2",
        prompt: "Z $8$ biegaczy wybieramy zdobywców złotego, srebrnego i brązowego medalu. Na ile sposobów można to zrobić?",
        options: { A: "$336$", B: "$512$", C: "$56$", D: "$24$" },
        correct: "A",
        explanation: "Kolejność ma znaczenie i nikt nie zdobywa dwóch medali: $8 \\cdot 7 \\cdot 6 = 336$.",
      },
      {
        id: "km-s3",
        prompt: "Ile jest liczb dwucyfrowych parzystych?",
        options: { A: "$45$", B: "$50$", C: "$40$", D: "$90$" },
        correct: "A",
        explanation: "Dziesiątki: $9$ możliwości ($1$–$9$), jedności: $5$ ($0, 2, 4, 6, 8$) – razem $45$.",
      },
    ],
    zaawansowany: [
      {
        id: "km-z1",
        prompt: "Ile jest liczb dwucyfrowych, w których zapisie występuje co najmniej jedna cyfra $7$?",
        options: { A: "$18$", B: "$19$", C: "$20$", D: "$10$" },
        correct: "A",
        explanation: "Wszystkich: $90$, bez siódemki: $8 \\cdot 9 = 72$. Z siódemką: $90 - 72 = 18$.",
        trap: "Licząc „$7$ na dziesiątkach” ($10$) i „$7$ na jednościach” ($9$), liczbę $77$ liczysz dwa razy – wychodzi $19$.",
      },
      {
        id: "km-z2",
        prompt: "Z grupy $6$ osób wybieramy dwuosobową delegację. Ile jest możliwości?",
        options: { A: "$15$", B: "$30$", C: "$36$", D: "$12$" },
        correct: "A",
        explanation: "Uporządkowanych par jest $6 \\cdot 5 = 30$, ale kolejność w delegacji nie ma znaczenia – dzielimy przez $2$: $15$.",
      },
      {
        id: "km-z3",
        prompt: "Ile jest liczb trzycyfrowych, których wszystkie cyfry są nieparzyste i różne?",
        options: { A: "$60$", B: "$125$", C: "$120$", D: "$20$" },
        correct: "A",
        explanation: "Cyfry nieparzyste: $1, 3, 5, 7, 9$ (bez zera, więc pierwsze miejsce bez kłopotu): $5 \\cdot 4 \\cdot 3 = 60$.",
        trap: "$125 = 5^3$ pozwala na powtórzenia, a cyfry mają być różne.",
      },
    ],
  },
};

export default content;
