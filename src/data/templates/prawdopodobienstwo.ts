// Dział XII – rachunek prawdopodobieństwa (XII.1, model klasyczny) i statystyka (XII.2: średnia, mediana).
import { frac, fracAnswer, type ClosedTemplate, type OpenTemplate } from "@/data/templates/engine";

const $ = (tex: string) => `$${tex}$`;

export const urn: ClosedTemplate = {
  id: "pr-urna",
  difficulty: "podstawowy",
  make: (r) => {
    const white = r.int(2, 9);
    const black = r.int(2, 9);
    const green = r.int(0, 5);
    const total = white + black + green;
    const others = black + green;
    const colors = green ? `${white} kul białych, ${black} czarnych i ${green} zielonych` : `${white} kul białych i ${black} czarnych`;
    return {
      prompt: `W pudełku jest ${colors}. Losujemy jedną kulę. Prawdopodobieństwo wylosowania kuli białej jest równe:`,
      correct: $(frac(white, total)),
      distractors: [$(frac(white, others)), $(frac(others, total)), $(frac(1, total))],
      hints: ["W modelu klasycznym $P(A) = \\frac{|A|}{|\\Omega|}$.", "$|\\Omega|$ to liczba wszystkich kul, $|A|$ – liczba kul białych."],
      explanation: `$|\\Omega| = ${total}$, $|A| = ${white}$, więc $P(A) = \\frac{${white}}{${total}}${frac(white, total) === `\\frac{${white}}{${total}}` ? "" : ` = ${frac(white, total)}`}$.`,
      trap: "Dzielimy przez liczbę WSZYSTKICH kul, a nie przez liczbę kul innego koloru.",
    };
  },
};

/** Pary oczek o danej sumie przy dwóch rzutach kostką. */
function dicePairs(sum: number): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a <= 6; a++) {
    const b = sum - a;
    if (b >= 1 && b <= 6) out.push([a, b]);
  }
  return out;
}

export const diceSum: ClosedTemplate = {
  id: "pr-kostka",
  difficulty: "sredni",
  make: (r) => {
    const sum = r.int(3, 11);
    const pairs = dicePairs(sum);
    const count = pairs.length;
    return {
      prompt: `Rzucamy dwa razy symetryczną sześcienną kostką do gry. Prawdopodobieństwo, że suma wyrzuconych oczek będzie równa ${sum}, jest równe:`,
      correct: $(frac(count, 36)),
      distractors: [$(frac(1, 11)), $(frac(count + 1, 36)), $(frac(count, 6) === "1" ? frac(count, 12) : frac(count, 6))],
      hints: ["Wyników dwóch rzutów jest $6 \\cdot 6 = 36$ – kolejność ma znaczenie.", `Wypisz pary $(a, b)$, dla których $a + b = ${sum}$.`],
      explanation: `$|\\Omega| = 36$. Sumę ${sum} dają pary: ${pairs.map(([a, b]) => `$(${a}, ${b})$`).join(", ")} – razem ${count}. $P = \\frac{${count}}{36}${frac(count, 36) === `\\frac{${count}}{36}` ? "" : ` = ${frac(count, 36)}`}$.`,
      trap: "Sumy nie są jednakowo prawdopodobne – nie dziel przez 11 możliwych sum.",
    };
  },
};

export const divisibleDraw: ClosedTemplate = {
  id: "pr-podzielnosc",
  difficulty: "sredni",
  make: (r) => {
    const n = r.pick([20, 25, 30, 40, 45, 50, 60, 75, 100]);
    const d = r.pick([3, 4, 6, 7, 8, 9]);
    const count = Math.floor(n / d);
    return {
      prompt: `Ze zbioru liczb $\\{1, 2, 3, \\ldots, ${n}\\}$ losujemy jedną liczbę. Prawdopodobieństwo wylosowania liczby podzielnej przez ${d} jest równe:`,
      correct: $(frac(count, n)),
      distractors: [$(frac(1, d)), $(frac(count + 1, n)), $(frac(count - 1, n))],
      hints: [`Policz wielokrotności liczby ${d} nie większe niż ${n}.`, `Jest ich $\\left\\lfloor \\frac{${n}}{${d}} \\right\\rfloor$.`],
      explanation: `$|\\Omega| = ${n}$. Liczby podzielne przez ${d}: $${d}, ${2 * d}, \\ldots, ${count * d}$ – jest ich ${count}. $P = \\frac{${count}}{${n}}${frac(count, n) === `\\frac{${count}}{${n}}` ? "" : ` = ${frac(count, n)}`}$.`,
    };
  },
};

const COPRIME: [number, number][] = [
  [2, 3],
  [2, 5],
  [3, 4],
  [3, 5],
  [4, 5],
  [2, 7],
  [3, 7],
];

export const divisibleOrOpen: OpenTemplate = {
  id: "pr-lub",
  difficulty: "sredni",
  make: (r) => {
    const [a, b] = r.pick(COPRIME);
    const n = r.pick([30, 40, 50, 60, 70, 84, 90, 100]);
    const [na, nb, nab] = [Math.floor(n / a), Math.floor(n / b), Math.floor(n / (a * b))];
    const count = na + nb - nab;
    return {
      prompt: `Ze zbioru liczb $\\{1, 2, 3, \\ldots, ${n}\\}$ losujemy jedną liczbę. Oblicz prawdopodobieństwo zdarzenia $A$ polegającego na tym, że wylosowana liczba jest podzielna przez ${a} lub przez ${b}.`,
      answers: [fracAnswer(count, n)],
      answerLabel: "P(A) =",
      hints: [`Policz osobno liczby podzielne przez ${a} i przez ${b}.`, `Liczby podzielne przez ${a} i ${b} jednocześnie (czyli przez ${a * b}) są wtedy policzone dwa razy.`],
      solution: [
        {
          step: `$|\\Omega| = ${n}$. Podzielnych przez ${a}: ${na}, przez ${b}: ${nb}, przez ${a * b} (czyli przez obie): ${nab}. Zatem $|A| = ${na} + ${nb} - ${nab} = ${count}$.`,
          points: 1,
        },
        { step: `$P(A) = \\frac{${count}}{${n}}${frac(count, n) === `\\frac{${count}}{${n}}` ? "" : ` = ${frac(count, n)}`}$.`, points: 1 },
      ],
    };
  },
};

// ── Statystyka ──

/** Liczba dziesiętna po polsku w LaTeX: 3.5 → "3{,}5". */
const dec = (value: number) => String(Math.round(value * 100) / 100).replace(".", "{,}");

export const gradesMean: OpenTemplate = {
  id: "st-srednia",
  difficulty: "podstawowy",
  format: "short",
  make: (r) => {
    const grades = [1, 2, 3, 4, 5, 6];
    const counts = grades.map((g) => (g === 1 ? r.int(0, 2) : r.int(1, 7)));
    const total = counts.reduce((a, b) => a + b, 0);
    const sum = grades.reduce((acc, g, i) => acc + g * counts[i], 0);
    if ((sum * 100) % total !== 0) return null; // średnia z co najwyżej dwoma miejscami po przecinku
    const mean = sum / total;
    const table = `\\begin{array}{|l|c|c|c|c|c|c|} \\hline \\text{ocena} & ${grades.join(" & ")} \\\\ \\hline \\text{liczba uczniów} & ${counts.join(" & ")} \\\\ \\hline \\end{array}`;
    return {
      prompt: `W tabeli zestawiono oceny ze sprawdzianu w pewnej klasie.\n$${table}$\nOblicz średnią arytmetyczną ocen z tego sprawdzianu.`,
      answers: [String(mean)],
      answerLabel: "\\bar{x} =",
      hints: ["Pomnóż każdą ocenę przez liczbę uczniów, którzy ją otrzymali, i dodaj.", "Podziel sumę ocen przez liczbę wszystkich uczniów."],
      solution: [
        { step: `Suma ocen: $${grades.map((g, i) => `${g} \\cdot ${counts[i]}`).join(" + ")} = ${sum}$, liczba uczniów: $${total}$.`, points: 1 },
        { step: `Średnia: $\\bar{x} = \\frac{${sum}}{${total}} = ${dec(mean)}$.`, points: 1 },
      ],
    };
  },
};

export const statsTrueFalse: ClosedTemplate = {
  id: "st-pf",
  difficulty: "sredni",
  make: (r) => {
    const size = r.pick([6, 8]);
    const data = Array.from({ length: size }, () => r.int(1, 12)).sort((a, b) => a - b);
    const sum = data.reduce((a, b) => a + b, 0);
    if (sum % size !== 0) return null; // całkowita średnia
    const mean = sum / size;
    const median = (data[size / 2 - 1] + data[size / 2]) / 2;
    if (median === mean) return null; // pomylenie średniej z medianą musi dawać fałsz
    const medianTrue = r.int(0, 1) === 1;
    const meanTrue = r.int(0, 1) === 1;
    const shown = r.shuffle(data);
    return {
      intro: `Dany jest zestaw danych: $${shown.join(",\\ ")}$.`,
      statements: [
        { text: `Mediana tego zestawu danych jest równa $${dec(medianTrue ? median : mean)}$.`, true: medianTrue },
        { text: `Średnia arytmetyczna tego zestawu danych jest równa $${dec(meanTrue ? mean : median)}$.`, true: meanTrue },
      ],
      hints: ["Do mediany uporządkuj dane rosnąco – przy parzystej liczbie danych to średnia dwóch środkowych.", "Średnia to suma danych podzielona przez ich liczbę."],
      explanation: `Po uporządkowaniu: $${data.join(",\\ ")}$. Mediana $= \\frac{${data[size / 2 - 1]} + ${data[size / 2]}}{2} = ${dec(median)}$, średnia $= \\frac{${sum}}{${size}} = ${dec(mean)}$.`,
      trap: "Medianę liczymy z danych uporządkowanych – nie bierz środkowych liczb w kolejności z treści.",
    };
  },
};
