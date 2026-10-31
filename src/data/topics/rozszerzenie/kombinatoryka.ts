import type { TopicContent } from "@/types/topic";

// Rozszerzenie – kombinatoryka: symbol Newtona, kombinacje i wariacje, dwumian Newtona (dział XI, wymagania R).
const content: TopicContent = {
  theory: [
    {
      title: "Symbol Newtona",
      body:
        "$\\binom{n}{k} = \\frac{n!}{k!(n - k)!}$ to liczba sposobów wyboru $k$ elementów z $n$, gdy kolejność nie ma znaczenia.\n\n" +
        "Skróty: $\\binom{n}{k} = \\binom{n}{n - k}$, $\\binom{n}{1} = n$, $\\binom{n}{2} = \\frac{n(n - 1)}{2}$. " +
        "Licząc, skracaj silnie zamiast je mnożyć: $\\binom{7}{3} = \\frac{7 \\cdot 6 \\cdot 5}{3 \\cdot 2 \\cdot 1} = 35$.",
      example: {
        prompt: "Rozwiąż równanie $\\binom{n}{2} = 21$.",
        solution: "$\\frac{n(n - 1)}{2} = 21$, czyli $n^2 - n - 42 = 0$.\n$n = 7$ lub $n = -6$; $n$ jest naturalne, więc $n = 7$.",
      },
      check: {
        id: "rz-k-t1",
        prompt: "$\\binom{8}{2}$ jest równe:",
        options: { A: "$28$", B: "$56$", C: "$16$", D: "$64$" },
        correct: "A",
        explanation: "$\\frac{8 \\cdot 7}{2} = 28$.",
        trap: "$56$ to liczba par UPORZĄDKOWANYCH ($8 \\cdot 7$) – w symbolu Newtona kolejność się nie liczy.",
      },
    },
    {
      title: "Kolejność się liczy czy nie?",
      body:
        "Zanim zaczniesz liczyć, zadaj jedno pytanie: czy zamiana kolejności daje inny wynik?\n\n" +
        "• komisja, drużyna, zestaw kul – NIE: kombinacje $\\binom{n}{k}$,\n\n" +
        "• podium, kod, liczba z cyfr – TAK: mnożenie kolejnych wyborów (reguła mnożenia).\n\n" +
        "Przy warunkach („dokładnie dwie kobiety”) licz osobno każdą grupę i mnóż; przy „co najmniej” – sumuj przypadki albo licz dopełnienie.",
      example: {
        prompt: "Na ile sposobów z 10 osób wybierzesz trzyosobową komisję, a na ile – podium (1., 2., 3. miejsce)?",
        solution: "Komisja: $\\binom{10}{3} = 120$.\nPodium: $10 \\cdot 9 \\cdot 8 = 720$ – każda komisja daje $3! = 6$ różnych podiów.",
      },
      check: {
        id: "rz-k-t2",
        prompt: "Na ile sposobów można wybrać dwuosobową delegację z grupy sześciu osób?",
        options: { A: "$15$", B: "$30$", C: "$12$", D: "$36$" },
        correct: "A",
        explanation: "Kolejność nie ma znaczenia: $\\binom{6}{2} = 15$.",
      },
    },
    {
      title: "Dwumian Newtona",
      body:
        "$(a + b)^n = \\sum_{k = 0}^{n} \\binom{n}{k} a^{n - k} b^k$. Wyraz z numerem $k$ (licząc od zera) to $\\binom{n}{k}a^{n - k}b^k$.\n\n" +
        "Szukając współczynnika przy danej potędze $x$, zapisz ogólny wyraz, przyrównaj wykładnik $x$ do żądanego i wyznacz $k$.",
      example: {
        prompt: "Oblicz współczynnik przy $x^2$ w rozwinięciu $(x + 2)^5$.",
        solution: "Wyraz ogólny: $\\binom{5}{k}x^{5 - k}2^k$.\n$5 - k = 2$, więc $k = 3$.\nWspółczynnik: $\\binom{5}{3} \\cdot 2^3 = 10 \\cdot 8 = 80$.",
      },
      check: {
        id: "rz-k-t3",
        prompt: "Współczynnik przy $x^3$ w rozwinięciu $(x + 1)^5$ jest równy:",
        options: { A: "$10$", B: "$5$", C: "$20$", D: "$1$" },
        correct: "A",
        explanation: "$\\binom{5}{2}x^3 \\cdot 1^2$, czyli $10$.",
      },
    },
  ],
  formulas: [
    { label: "Symbol Newtona", tex: "\\binom{n}{k} = \\frac{n!}{k!(n - k)!}" },
    { label: "Symetria", tex: "\\binom{n}{k} = \\binom{n}{n - k}" },
    { label: "Wariacje bez powtórzeń", tex: "V_n^k = \\frac{n!}{(n - k)!}" },
    { label: "Dwumian Newtona", tex: "(a + b)^n = \\sum_{k = 0}^{n} \\binom{n}{k}a^{n - k}b^k" },
  ],
  traps: [
    "Najpierw ustal, czy kolejność ma znaczenie – to decyduje o wzorze.",
    "Liczba wielocyfrowa nie może zaczynać się od zera – pierwszą cyfrę licz osobno.",
    "„Co najmniej jeden” najszybciej liczy się przez dopełnienie: wszystkie minus żaden.",
    "W dwumianie Newtona wyrazy numeruje się od $k = 0$.",
  ],
  openTasks: [
    {
      id: "rz-k-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Ile jest liczb naturalnych pięciocyfrowych, w których zapisie występują wyłącznie cyfry $1$ i $2$, przy czym cyfra $2$ występuje dokładnie dwa razy?",
      answers: ["10"],
      hints: ["Wybierz dwie pozycje z pięciu dla dwójek – reszta to jedynki."],
      solution: [
        { step: "Pozycje dwójek wybieramy spośród $5$ miejsc (kolejność wyboru nieistotna).", points: 1 },
        { step: "$\\binom{5}{2} = 10$.", points: 1 },
      ],
    },
    {
      id: "rz-k-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Oblicz, ile jest liczb naturalnych czterocyfrowych parzystych o różnych cyfrach.",
      answers: ["2296"],
      hints: ["Rozbij na przypadki: ostatnia cyfra $0$ albo ostatnia cyfra $2, 4, 6, 8$."],
      solution: [
        { step: "Ostatnia cyfra $0$: $9 \\cdot 8 \\cdot 7 = 504$.", points: 1 },
        { step: "Ostatnia cyfra $2, 4, 6$ lub $8$: $4 \\cdot 8 \\cdot 8 \\cdot 7 = 1792$ (pierwsza cyfra – bez zera i bez ostatniej).", points: 1 },
        { step: "Razem: $504 + 1792 = 2296$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "rz-k-p1",
        prompt: "$\\binom{6}{3}$ jest równe:",
        options: { A: "$20$", B: "$120$", C: "$18$", D: "$6$" },
        correct: "A",
        explanation: "$\\frac{6 \\cdot 5 \\cdot 4}{3 \\cdot 2 \\cdot 1} = 20$.",
      },
      {
        id: "rz-k-p2",
        prompt: "Ile jest liczb trzycyfrowych o różnych cyfrach?",
        options: { A: "$648$", B: "$720$", C: "$900$", D: "$504$" },
        correct: "A",
        explanation: "Pierwsza cyfra: $9$ możliwości (bez zera), druga: $9$, trzecia: $8$. $9 \\cdot 9 \\cdot 8 = 648$.",
        trap: "$720 = 10 \\cdot 9 \\cdot 8$ liczy też „liczby” zaczynające się od zera.",
      },
    ],
    sredni: [
      {
        id: "rz-k-s1",
        prompt: "Na ile sposobów można z 5 kobiet i 4 mężczyzn wybrać trzyosobową komisję, w której są dokładnie dwie kobiety?",
        options: { A: "$40$", B: "$84$", C: "$10$", D: "$80$" },
        correct: "A",
        explanation: "$\\binom{5}{2} \\cdot \\binom{4}{1} = 10 \\cdot 4 = 40$.",
      },
      {
        id: "rz-k-s2",
        prompt: "Rozwiązaniem równania $\\binom{n}{2} = 21$ jest:",
        options: { A: "$n = 7$", B: "$n = 6$", C: "$n = 21$", D: "$n = 42$" },
        correct: "A",
        explanation: "$\\frac{n(n - 1)}{2} = 21$, $n(n - 1) = 42$, $n = 7$.",
      },
    ],
    zaawansowany: [
      {
        id: "rz-k-z1",
        prompt: "Ile jest liczb czterocyfrowych, w których zapisie cyfra $5$ występuje dokładnie raz?",
        options: { A: "$2673$", B: "$2916$", C: "$1944$", D: "$729$" },
        correct: "A",
        explanation:
          "Piątka na pierwszym miejscu: $9^3 = 729$. Piątka na jednym z trzech dalszych miejsc: $3 \\cdot 8 \\cdot 9 \\cdot 9 = 1944$ (pierwsza cyfra bez $0$ i $5$). Razem $2673$.",
        trap: "$2916 = 4 \\cdot 729$ pomija, że pierwsza cyfra nie może być zerem.",
      },
      {
        id: "rz-k-z2",
        prompt: "Wyraz niezależny od $x$ w rozwinięciu $\\left(x + \\frac{1}{x}\\right)^6$ jest równy:",
        options: { A: "$20$", B: "$15$", C: "$6$", D: "$1$" },
        correct: "A",
        explanation: "$\\binom{6}{k}x^{6 - k}x^{-k}$, wykładnik $6 - 2k = 0$, więc $k = 3$ i wyraz to $\\binom{6}{3} = 20$.",
      },
    ],
  },
};

export default content;
