import type { TopicContent } from "@/types/topic";

// Lekcja 30 – okrąg i koło (dział VIII podstawy). Zadania ok-p1…ok-z2 i ok-o1/ok-o2 przeniesione bez zmian
// z dawnego zestawu w src/data/practice – te same id.
const content: TopicContent = {
  theory: [
    {
      title: "Długość okręgu i pole koła",
      body:
        "Okrąg to linia, koło – cała figura w jej środku. Dla promienia $r$: długość okręgu $L = 2\\pi r$, pole koła $P = \\pi r^2$. " +
        "Średnica to dwa promienie: $d = 2r$.\n\n" +
        "Najczęstszy schemat zadania: dostajesz jedną wielkość (obwód, pole, średnicę), wyznaczasz z niej $r$ i liczysz drugą.",
      example: {
        prompt: "Pole koła jest równe $36\\pi$. Oblicz długość okręgu, który je ogranicza.",
        solution: "$\\pi r^2 = 36\\pi \\Rightarrow r^2 = 36 \\Rightarrow r = 6$.\n$L = 2\\pi \\cdot 6 = 12\\pi$.",
      },
    },
    {
      title: "Łuk i wycinek koła",
      body:
        "Kąt środkowy $\\alpha$ wycina z okręgu łuk, a z koła wycinek. Biorą one taką część całości, jaką częścią $360^\\circ$ jest kąt:\n\n" +
        "$l = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r$, $\\quad P_w = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2$.\n\n" +
        "Kąty „okrągłe” warto przeliczać na ułamki od razu: $90^\\circ$ to $\\frac{1}{4}$, $120^\\circ$ – $\\frac{1}{3}$, $60^\\circ$ – $\\frac{1}{6}$.",
      example: {
        prompt: "Promień okręgu jest równy $6$, a kąt środkowy $120^\\circ$. Oblicz długość łuku i pole wycinka.",
        solution: "$120^\\circ$ to $\\frac{1}{3}$ pełnego kąta.\nŁuk: $\\frac{1}{3} \\cdot 12\\pi = 4\\pi$.\nWycinek: $\\frac{1}{3} \\cdot 36\\pi = 12\\pi$.",
      },
    },
    {
      title: "Kąt środkowy i kąt wpisany",
      body:
        "Kąt środkowy ma wierzchołek w środku okręgu, kąt wpisany – na okręgu. " +
        "Kąt wpisany jest połową kąta środkowego opartego na tym samym łuku.\n\n" +
        "Wnioski, które CKE lubi najbardziej:\n\n" +
        "• wszystkie kąty wpisane oparte na tym samym łuku są równe,\n\n" +
        "• kąt wpisany oparty na średnicy (półokręgu) jest prosty – $90^\\circ$.",
      example: {
        prompt: "Kąt środkowy $ASB$ ma miarę $140^\\circ$. Oblicz miarę kąta wpisanego $ACB$ opartego na tym samym łuku.",
        solution: "Kąt wpisany to połowa środkowego: $\\frac{140^\\circ}{2} = 70^\\circ$.",
      },
    },
    {
      title: "Styczna do okręgu",
      body:
        "Styczna ma z okręgiem dokładnie jeden punkt wspólny i jest prostopadła do promienia poprowadzonego do tego punktu. " +
        "Dlatego w zadaniach ze styczną prawie zawsze pojawia się trójkąt prostokątny: promień, odcinek stycznej " +
        "i odcinek od środka do punktu poza okręgiem (przeciwprostokątna).\n\n" +
        "Dwie styczne poprowadzone z jednego punktu mają równe odcinki – od tego punktu do punktów styczności.",
      example: {
        prompt: "Punkt $P$ leży w odległości $10$ od środka okręgu o promieniu $6$. Oblicz długość odcinka stycznej z $P$ do punktu styczności.",
        solution: "Kąt przy punkcie styczności jest prosty, więc $x^2 + 6^2 = 10^2$.\n$x^2 = 64$, czyli $x = 8$.",
      },
    },
    {
      title: "Okrąg opisany i wpisany w trójkąt",
      body:
        "• Trójkąt prostokątny: środek okręgu opisanego leży w środku przeciwprostokątnej, więc $R = \\frac{c}{2}$.\n\n" +
        "• Trójkąt równoboczny o boku $a$: $R = \\frac{a\\sqrt{3}}{3}$, $r = \\frac{a\\sqrt{3}}{6}$ (czyli $R = 2r$).\n\n" +
        "• Dowolny trójkąt: promień okręgu wpisanego $r = \\frac{2P}{a + b + c}$.",
      example: {
        prompt: "Trójkąt ma boki $6$, $8$ i $10$. Oblicz promienie okręgu opisanego i wpisanego.",
        solution:
          "$6^2 + 8^2 = 10^2$ – trójkąt prostokątny, więc $R = \\frac{10}{2} = 5$.\n" +
          "$P = \\frac{1}{2} \\cdot 6 \\cdot 8 = 24$, $r = \\frac{2 \\cdot 24}{6 + 8 + 10} = 2$.",
      },
    },
  ],
  formulas: [
    { label: "Długość okręgu", tex: "L = 2\\pi r" },
    { label: "Pole koła", tex: "P = \\pi r^2" },
    { label: "Długość łuku", tex: "l = \\frac{\\alpha}{360^\\circ} \\cdot 2\\pi r" },
    { label: "Pole wycinka koła", tex: "P = \\frac{\\alpha}{360^\\circ} \\cdot \\pi r^2" },
    { label: "Kąt wpisany i środkowy (ten sam łuk)", tex: "\\beta = \\frac{1}{2}\\alpha" },
    { label: "Okrąg opisany na trójkącie prostokątnym", tex: "R = \\frac{c}{2}" },
    { label: "Trójkąt równoboczny", tex: "R = \\frac{a\\sqrt{3}}{3}, \\quad r = \\frac{a\\sqrt{3}}{6}" },
    { label: "Promień okręgu wpisanego", tex: "r = \\frac{2P}{a + b + c}" },
  ],
  traps: [
    "Kąt wpisany to połowa środkowego, nie odwrotnie – wierzchołek w środku okręgu oznacza kąt środkowy.",
    "Z pola dostajesz $r^2$: przy $P = 49\\pi$ promień to $7$, a nie $49$.",
    "Styczna jest prostopadła do promienia w punkcie styczności – to Twój kąt prosty do Pitagorasa.",
    "Średnica to nie promień: przy $d = 10$ długość okręgu to $10\\pi$, a nie $20\\pi$.",
  ],
  openTasks: [
    {
      id: "ok-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Obwód koła jest równy $12\\pi$. Pole tego koła zapisz w postaci $c\\pi$ i podaj liczbę $c$.",
      answers: ["36"],
      answerLabel: "c =",
      hints: ["Z obwodu $2\\pi r = 12\\pi$ wyznacz promień."],
      solution: [
        { step: "Promień: $2\\pi r = 12\\pi$, więc $r = 6$.", points: 1 },
        { step: "Pole: $\\pi \\cdot 6^2 = 36\\pi$, więc $c = 36$.", points: 1 },
      ],
    },
    {
      id: "ok-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Długość łuku okręgu o promieniu $9$, na którym oparty jest kąt środkowy $120^\\circ$, jest równa $a\\pi$. Oblicz $a$.",
      answers: ["6"],
      answerLabel: "a =",
      hints: ["Łuk to taka część obwodu, jaką częścią $360^\\circ$ jest kąt środkowy."],
      solution: [
        { step: "Wzór: $l = \\frac{120^\\circ}{360^\\circ} \\cdot 2\\pi \\cdot 9$.", points: 1 },
        { step: "Obliczenie: $l = \\frac{1}{3} \\cdot 18\\pi = 6\\pi$, więc $a = 6$.", points: 1 },
      ],
    },
    {
      id: "ok-o2",
      difficulty: "zaawansowany",
      points: 2,
      prompt: "Pole koła jest równe $49\\pi$. Obwód tego koła zapisz w postaci $b\\pi$ i podaj liczbę $b$.",
      answers: ["14"],
      answerLabel: "b =",
      hints: ["Z pola wyznacz promień."],
      solution: [
        { step: "$\\pi r^2 = 49\\pi$, więc $r = 7$.", points: 1 },
        { step: "Obwód: $2\\pi \\cdot 7 = 14\\pi$, więc $b = 14$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "ok-p1",
        prompt: "Pole koła o promieniu $4$ jest równe:",
        options: { A: "$16\\pi$", B: "$8\\pi$", C: "$4\\pi$", D: "$64\\pi$" },
        correct: "A",
        hints: ["Pole koła to $\\pi r^2$ – podnieś promień do kwadratu."],
        explanation: "$P = \\pi \\cdot 4^2 = 16\\pi$.",
      },
      {
        id: "ok-p2",
        prompt: "Kąt środkowy ma miarę $80^\\circ$. Kąt wpisany oparty na tym samym łuku ma miarę:",
        options: { A: "$40^\\circ$", B: "$80^\\circ$", C: "$160^\\circ$", D: "$20^\\circ$" },
        correct: "A",
        hints: ["Kąt wpisany to połowa kąta środkowego."],
        explanation: "Kąt wpisany jest dwa razy mniejszy od środkowego: $40^\\circ$.",
      },
      {
        id: "ok-p3",
        prompt: "Średnica okręgu ma długość $10$. Długość tego okręgu jest równa:",
        options: { A: "$10\\pi$", B: "$20\\pi$", C: "$25\\pi$", D: "$5\\pi$" },
        correct: "A",
        hints: ["Promień to połowa średnicy.", "$L = 2\\pi r$, a $2r$ to właśnie średnica."],
        explanation: "$r = 5$, więc $L = 2\\pi \\cdot 5 = 10\\pi$.",
        trap: "$20\\pi$ wychodzi, gdy średnicę wstawisz do wzoru jako promień.",
      },
    ],
    sredni: [
      {
        id: "ok-s1",
        prompt: "Długość okręgu jest równa $10\\pi$. Pole koła ograniczonego tym okręgiem jest równe:",
        options: { A: "$25\\pi$", B: "$100\\pi$", C: "$10\\pi$", D: "$5\\pi$" },
        correct: "A",
        explanation: "$2\\pi r = 10\\pi$, więc $r = 5$ i $P = 25\\pi$.",
      },
      {
        id: "ok-s2",
        prompt: "Kąt wpisany oparty na średnicy okręgu ma miarę:",
        options: { A: "$90^\\circ$", B: "$180^\\circ$", C: "$45^\\circ$", D: "$60^\\circ$" },
        correct: "A",
        explanation: "Kąt środkowy oparty na średnicy to $180^\\circ$, a wpisany jest jego połową: $90^\\circ$.",
      },
      {
        id: "ok-s3",
        prompt:
          "Punkt $P$ leży w odległości $13$ od środka okręgu o promieniu $5$. Odcinek stycznej poprowadzonej z punktu $P$ do punktu styczności ma długość:",
        options: { A: "$12$", B: "$8$", C: "$\\sqrt{194}$", D: "$18$" },
        correct: "A",
        explanation: "Styczna jest prostopadła do promienia: $x^2 + 5^2 = 13^2$, więc $x = \\sqrt{144} = 12$.",
        trap: "Przeciwprostokątną jest odcinek od środka do $P$ ($13$) – kwadraty odejmujesz, a nie dodajesz.",
      },
    ],
    zaawansowany: [
      {
        id: "ok-z1",
        prompt: "Pole wycinka koła o promieniu $6$ i kącie środkowym $60^\\circ$ jest równe:",
        options: { A: "$6\\pi$", B: "$12\\pi$", C: "$36\\pi$", D: "$3\\pi$" },
        correct: "A",
        explanation: "$\\frac{60^\\circ}{360^\\circ} \\cdot 36\\pi = 6\\pi$.",
      },
      {
        id: "ok-z2",
        prompt: "Kąt wpisany $ACB$ ma miarę $35^\\circ$. Kąt środkowy $ASB$ oparty na tym samym łuku ma miarę:",
        options: { A: "$70^\\circ$", B: "$35^\\circ$", C: "$145^\\circ$", D: "$110^\\circ$" },
        correct: "A",
        explanation: "Kąt środkowy jest dwa razy większy od wpisanego: $70^\\circ$.",
      },
      {
        id: "ok-z3",
        prompt: "Trójkąt prostokątny o przyprostokątnych $6$ i $8$ jest wpisany w okrąg. Promień tego okręgu jest równy:",
        options: { A: "$5$", B: "$10$", C: "$7$", D: "$2$" },
        correct: "A",
        explanation: "Przeciwprostokątna $c = 10$ jest średnicą okręgu opisanego, więc $R = 5$.",
        trap: "$2$ to promień okręgu WPISANEGO w ten trójkąt, a $10$ – średnica, nie promień.",
      },
    ],
  },
};

export default content;
