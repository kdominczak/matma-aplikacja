import type { TopicContent } from "@/types/topic";

// Lekcje 38–42 – geometria przestrzenna (dział X podstawy). Zadania gp-p1…gp-z2 i gp-o1/gp-o2 przeniesione
// bez zmian z dawnego zestawu w src/data/practice – te same id. Bryły narysujesz w brudnopisie (narzędzie „Bryły”).
const content: TopicContent = {
  theory: [
    {
      title: "Graniastosłupy i prostopadłościan",
      body:
        "Objętość każdego graniastosłupa to pole podstawy razy wysokość: $V = P_p \\cdot H$. " +
        "Pole całkowite: dwie podstawy i ściany boczne, $P_c = 2P_p + P_b$.\n\n" +
        "W prostopadłościanie o krawędziach $a, b, c$: $V = abc$, a przekątna bryły $d = \\sqrt{a^2 + b^2 + c^2}$ " +
        "(dwa razy Pitagoras: najpierw przekątna podstawy, potem trójkąt z wysokością).\n\n" +
        "Sześcian o krawędzi $a$: przekątna ściany $a\\sqrt{2}$, przekątna sześcianu $a\\sqrt{3}$, $V = a^3$, $P_c = 6a^2$.",
      example: {
        prompt: "Sześcian ma krawędź $4$. Oblicz jego przekątną, pole powierzchni i objętość.",
        solution: "Przekątna: $d = 4\\sqrt{3}$.\nPole: $P_c = 6 \\cdot 16 = 96$.\nObjętość: $V = 4^3 = 64$.",
      },
    },
    {
      title: "Ostrosłupy",
      body:
        "Objętość ostrosłupa to jedna trzecia objętości graniastosłupa o tej samej podstawie i wysokości: $V = \\frac{1}{3} P_p \\cdot H$.\n\n" +
        "W ostrosłupie prawidłowym spodek wysokości leży w środku podstawy. Prawie każde zadanie sprowadza się do " +
        "trójkąta prostokątnego z wysokością $H$:\n\n" +
        "• z połową przekątnej podstawy – daje krawędź boczną,\n\n" +
        "• z połową krawędzi podstawy (podstawa kwadratowa) – daje wysokość ściany bocznej $h$.",
      example: {
        prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $4$. Oblicz pole całkowite i objętość.",
        solution:
          "Wysokość ściany bocznej: $h = \\sqrt{4^2 + 3^2} = 5$.\n" +
          "$P_b = 4 \\cdot \\frac{1}{2} \\cdot 6 \\cdot 5 = 60$, $P_c = 36 + 60 = 96$.\n" +
          "$V = \\frac{1}{3} \\cdot 36 \\cdot 4 = 48$.",
      },
    },
    {
      title: "Kąty w bryłach",
      body:
        "Kąt nachylenia odcinka do płaszczyzny podstawy to kąt między tym odcinkiem a jego rzutem na podstawę. " +
        "Szukasz trójkąta prostokątnego: jedna przyprostokątna to wysokość (pionowo), druga – rzut (leży w podstawie).\n\n" +
        "Przykładowo dla przekątnej prostopadłościanu: $\\operatorname{tg} \\alpha = \\frac{H}{d_p}$, gdzie $d_p$ to przekątna podstawy.",
      example: {
        prompt: "Prostopadłościan ma podstawę kwadratową o boku $3$ i wysokość $3\\sqrt{2}$. Pod jakim kątem przekątna bryły jest nachylona do podstawy?",
        solution:
          "Przekątna podstawy: $d_p = 3\\sqrt{2}$.\n" +
          "$\\operatorname{tg} \\alpha = \\frac{3\\sqrt{2}}{3\\sqrt{2}} = 1$, więc $\\alpha = 45^\\circ$.",
      },
    },
    {
      title: "Walec i stożek",
      body:
        "Walec o promieniu $r$ i wysokości $H$: $V = \\pi r^2 H$, pole boczne $P_b = 2\\pi r H$ (prostokąt po rozwinięciu).\n\n" +
        "Stożek: $V = \\frac{1}{3}\\pi r^2 H$, pole boczne $P_b = \\pi r l$, gdzie $l$ to tworząca. " +
        "Promień, wysokość i tworząca tworzą trójkąt prostokątny: $l^2 = r^2 + H^2$ – tworząca jest przeciwprostokątną.\n\n" +
        "Przekrój osiowy (cięcie przez oś) walca to prostokąt $2r \\times H$, a stożka – trójkąt równoramienny o podstawie $2r$.",
      example: {
        prompt: "Stożek ma promień podstawy $6$ i wysokość $8$. Oblicz tworzącą, pole całkowite i objętość.",
        solution:
          "$l = \\sqrt{36 + 64} = 10$.\n" +
          "$P_c = \\pi r^2 + \\pi r l = 36\\pi + 60\\pi = 96\\pi$.\n" +
          "$V = \\frac{1}{3}\\pi \\cdot 36 \\cdot 8 = 96\\pi$.",
      },
    },
    {
      title: "Kula",
      body:
        "Kula o promieniu $r$: objętość $V = \\frac{4}{3}\\pi r^3$, pole powierzchni (sfery) $P = 4\\pi r^2$.\n\n" +
        "W zadaniach zwykle dostajesz jedną z tych wielkości – z niej wyznacz $r$, a potem policz drugą. " +
        "Uważaj na potęgi: promień dwa razy większy to pole $4$ razy, a objętość $8$ razy większa.",
      example: {
        prompt: "Pole powierzchni kuli jest równe $100\\pi$. Oblicz jej objętość.",
        solution: "$4\\pi r^2 = 100\\pi \\Rightarrow r^2 = 25 \\Rightarrow r = 5$.\n$V = \\frac{4}{3}\\pi \\cdot 125 = \\frac{500}{3}\\pi$.",
      },
    },
  ],
  formulas: [
    { label: "Przekątna prostopadłościanu", tex: "d = \\sqrt{a^2 + b^2 + c^2}" },
    { label: "Sześcian", tex: "d = a\\sqrt{3}, \\quad V = a^3, \\quad P_c = 6a^2" },
    { label: "Objętość graniastosłupa", tex: "V = P_p \\cdot H" },
    { label: "Objętość ostrosłupa", tex: "V = \\frac{1}{3} P_p \\cdot H" },
    { label: "Walec", tex: "V = \\pi r^2 H, \\quad P_b = 2\\pi r H" },
    { label: "Stożek", tex: "V = \\frac{1}{3}\\pi r^2 H, \\quad P_b = \\pi r l, \\quad l^2 = r^2 + H^2" },
    { label: "Kula", tex: "V = \\frac{4}{3}\\pi r^3, \\quad P = 4\\pi r^2" },
  ],
  traps: [
    "Objętość ostrosłupa i stożka ma $\\frac{1}{3}$ – bez niej wynik jest 3 razy za duży.",
    "Tworząca stożka jest przeciwprostokątną: $l^2 = r^2 + H^2$, a nie $H^2 = r^2 + l^2$.",
    "Wysokość ściany bocznej to nie wysokość ostrosłupa – policz ją z trójkąta z $H$ i połową krawędzi podstawy.",
    "Pole całkowite to podstawy plus ściany boczne – nie zapomnij o podstawach (w stożku jednej, w walcu dwóch).",
  ],
  openTasks: [
    {
      id: "gp-o3",
      difficulty: "podstawowy",
      points: 2,
      prompt: "Prostopadłościan ma krawędzie długości $3$, $4$ i $12$. Oblicz długość jego przekątnej.",
      answers: ["13"],
      answerLabel: "d =",
      hints: ["$d = \\sqrt{a^2 + b^2 + c^2}$."],
      solution: [
        { step: "Suma kwadratów: $9 + 16 + 144 = 169$.", points: 1 },
        { step: "Przekątna: $d = \\sqrt{169} = 13$.", points: 1 },
      ],
    },
    {
      id: "gp-o1",
      difficulty: "sredni",
      points: 2,
      prompt: "Graniastosłup prawidłowy trójkątny ma krawędź podstawy $4$ i wysokość $5$. Jego objętość zapisz w postaci $k\\sqrt{3}$ i podaj $k$.",
      answers: ["20"],
      answerLabel: "k =",
      hints: ["Podstawa to trójkąt równoboczny."],
      solution: [
        { step: "Pole podstawy: $P_p = \\frac{16\\sqrt{3}}{4} = 4\\sqrt{3}$.", points: 1 },
        { step: "Objętość: $V = 4\\sqrt{3} \\cdot 5 = 20\\sqrt{3}$, więc $k = 20$.", points: 1 },
      ],
    },
    {
      id: "gp-o2",
      difficulty: "zaawansowany",
      points: 3,
      prompt: "Przekątna sześcianu ma długość $6\\sqrt{3}$. Oblicz objętość tego sześcianu.",
      answers: ["216"],
      hints: ["Przekątna sześcianu ma długość $a\\sqrt{3}$."],
      solution: [
        { step: "Przekątna sześcianu o krawędzi $a$: $d = a\\sqrt{3}$.", points: 1 },
        { step: "Krawędź: $a = 6$.", points: 1 },
        { step: "Objętość: $V = 6^3 = 216$.", points: 1 },
      ],
    },
  ],
  tests: {
    podstawowy: [
      {
        id: "gp-p1",
        prompt: "Objętość sześcianu o krawędzi $3$ jest równa:",
        options: { A: "$27$", B: "$9$", C: "$54$", D: "$81$" },
        correct: "A",
        hints: ["Objętość sześcianu to krawędź do potęgi trzeciej."],
        explanation: "$V = 3^3 = 27$.",
      },
      {
        id: "gp-p2",
        prompt: "Objętość walca o promieniu podstawy $2$ i wysokości $5$ jest równa:",
        options: { A: "$20\\pi$", B: "$10\\pi$", C: "$4\\pi$", D: "$50\\pi$" },
        correct: "A",
        hints: ["Pole podstawy ($\\pi r^2$) razy wysokość."],
        explanation: "$V = \\pi \\cdot 4 \\cdot 5 = 20\\pi$.",
      },
      {
        id: "gp-p3",
        prompt: "Pole powierzchni całkowitej sześcianu o krawędzi $2$ jest równe:",
        options: { A: "$24$", B: "$8$", C: "$16$", D: "$12$" },
        correct: "A",
        hints: ["Sześcian ma $6$ ścian – każda to kwadrat.", "Pole jednej ściany: $2^2 = 4$."],
        explanation: "$P_c = 6 \\cdot 2^2 = 24$.",
        trap: "$8$ to objętość ($2^3$), a nie pole powierzchni.",
      },
    ],
    sredni: [
      {
        id: "gp-s1",
        prompt: "Przekątna prostopadłościanu o krawędziach $2$, $3$ i $6$ ma długość:",
        options: { A: "$7$", B: "$11$", C: "$\\sqrt{13}$", D: "$49$" },
        correct: "A",
        explanation: "$\\sqrt{4 + 9 + 36} = \\sqrt{49} = 7$.",
      },
      {
        id: "gp-s2",
        prompt: "Ostrosłup prawidłowy czworokątny ma krawędź podstawy $6$ i wysokość $5$. Jego objętość jest równa:",
        options: { A: "$60$", B: "$180$", C: "$30$", D: "$90$" },
        correct: "A",
        explanation: "$V = \\frac{1}{3} \\cdot 36 \\cdot 5 = 60$.",
      },
      {
        id: "gp-s3",
        prompt: "Stożek ma promień podstawy $6$ i wysokość $8$. Tworząca tego stożka ma długość:",
        options: { A: "$10$", B: "$14$", C: "$2\\sqrt{7}$", D: "$100$" },
        correct: "A",
        explanation: "$l = \\sqrt{r^2 + H^2} = \\sqrt{36 + 64} = 10$.",
        trap: "Tworząca jest przeciwprostokątną – kwadraty dodajesz. $2\\sqrt{7} = \\sqrt{64 - 36}$ to odejmowanie.",
      },
    ],
    zaawansowany: [
      {
        id: "gp-z1",
        prompt: "Stożek ma promień podstawy $3$ i tworzącą długości $5$. Jego objętość jest równa:",
        options: { A: "$12\\pi$", B: "$15\\pi$", C: "$36\\pi$", D: "$45\\pi$" },
        correct: "A",
        explanation: "$H = \\sqrt{25 - 9} = 4$, więc $V = \\frac{1}{3}\\pi \\cdot 9 \\cdot 4 = 12\\pi$.",
      },
      {
        id: "gp-z2",
        prompt: "Pole powierzchni kuli jest równe $36\\pi$. Objętość tej kuli jest równa:",
        options: { A: "$36\\pi$", B: "$108\\pi$", C: "$27\\pi$", D: "$12\\pi$" },
        correct: "A",
        explanation: "$4\\pi r^2 = 36\\pi$, więc $r = 3$ i $V = \\frac{4}{3}\\pi \\cdot 27 = 36\\pi$.",
      },
      {
        id: "gp-z3",
        prompt:
          "Prostopadłościan ma podstawę kwadratową o boku $2$ i wysokość $2\\sqrt{6}$. Przekątna prostopadłościanu jest nachylona do płaszczyzny podstawy pod kątem:",
        options: { A: "$60^\\circ$", B: "$45^\\circ$", C: "$30^\\circ$", D: "$75^\\circ$" },
        correct: "A",
        explanation:
          "Przekątna podstawy: $2\\sqrt{2}$. $\\operatorname{tg} \\alpha = \\frac{2\\sqrt{6}}{2\\sqrt{2}} = \\sqrt{3}$, więc $\\alpha = 60^\\circ$.",
        trap: "Kąt z podstawą mierzysz od przekątnej PODSTAWY, a nie od jej boku – z bokiem wyszłoby $\\operatorname{tg} \\alpha = \\sqrt{6}$.",
      },
    ],
  },
};

export default content;
