// Dział XI – kombinatoryka (XI.2: zliczanie z regułą mnożenia i dodawania).
import type { ClosedTemplate } from "@/data/templates/engine";

const n = (value: number) => `$${value}$`;
const factorialFall = (m: number, k: number) => Array.from({ length: k }, (_, i) => m - i).reduce((a, b) => a * b, 1);

export const digitsNoZero: ClosedTemplate = {
  id: "km-cyfry",
  difficulty: "podstawowy",
  make: (r) => {
    const m = r.int(3, 6);
    const k = r.int(2, 4);
    const digits = r
      .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
      .slice(0, m)
      .sort((a, b) => a - b);
    const answer = m ** k;
    return {
      prompt: `Ile jest wszystkich liczb naturalnych ${k}-cyfrowych, których zapis dziesiętny składa się wyłącznie z cyfr zbioru $\\{${digits.join(", ")}\\}$ (cyfry mogą się powtarzać)?`,
      correct: n(answer),
      distractors: [n(m * k), n(k ** m), n(k <= m ? factorialFall(m, k) : m ** (k - 1))],
      hints: ["Na każdym miejscu w liczbie może stać dowolna z dostępnych cyfr.", "Skorzystaj z reguły mnożenia: liczba możliwości na każdym miejscu razy kolejne."],
      explanation: `Na każdym z ${k} miejsc może stać każda z ${m} cyfr, więc z reguły mnożenia liczb jest $${m}^{${k}} = ${answer}$.`,
      trap: "Cyfry mogą się powtarzać – nie zmniejszaj liczby możliwości na kolejnych miejscach.",
    };
  },
};

export const digitsWithZero: ClosedTemplate = {
  id: "km-zero",
  difficulty: "sredni",
  make: (r) => {
    const others = r.int(2, 5);
    const k = r.int(2, 4);
    const digits = [
      0,
      ...r
        .shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        .slice(0, others)
        .sort((a, b) => a - b),
    ];
    const m = digits.length;
    const answer = (m - 1) * m ** (k - 1);
    return {
      prompt: `Ile jest wszystkich liczb naturalnych ${k}-cyfrowych, których zapis dziesiętny składa się wyłącznie z cyfr zbioru $\\{${digits.join(", ")}\\}$ (cyfry mogą się powtarzać)?`,
      correct: n(answer),
      distractors: [n(m ** k), n((m - 1) ** k), n(m ** (k - 1))],
      hints: ["Pamiętaj, że liczba nie może zaczynać się od zera.", "Na pierwszym miejscu jest mniej możliwości niż na pozostałych."],
      explanation: `Pierwsza cyfra nie może być zerem – ${m - 1} możliwości; na każdym z pozostałych ${k - 1} miejsc – ${m} możliwości. Razem $${m - 1} \\cdot ${m}^{${k - 1}} = ${answer}$.`,
      trap: "Zero na początku nie daje liczby " + k + "-cyfrowej – to najczęstsza pułapka w tym zadaniu.",
    };
  },
};

export const chooseRoles: ClosedTemplate = {
  id: "km-funkcje",
  difficulty: "podstawowy",
  make: (r) => {
    const people = r.int(12, 32);
    const three = r.int(0, 1) === 1;
    const answer = three ? people * (people - 1) * (people - 2) : people * (people - 1);
    const roles = three ? "przewodniczącego, jego zastępcę i skarbnika" : "przewodniczącego i jego zastępcę";
    const combinations = three ? (people * (people - 1) * (people - 2)) / 6 : (people * (people - 1)) / 2;
    return {
      prompt: `W klasie jest ${people} uczniów. Na ile sposobów można wybrać spośród nich ${roles} (jedna osoba pełni co najwyżej jedną funkcję)?`,
      correct: n(answer),
      distractors: [n(three ? people ** 3 : people ** 2), n(combinations), n(three ? 3 * people : 2 * people)],
      hints: ["Funkcje są różne – kolejność wyboru ma znaczenie.", "Wybraną osobę nie można wybrać drugi raz."],
      explanation: three
        ? `Przewodniczącego wybieramy na ${people} sposobów, zastępcę na ${people - 1}, skarbnika na ${people - 2}: $${people} \\cdot ${people - 1} \\cdot ${people - 2} = ${answer}$.`
        : `Przewodniczącego wybieramy na ${people} sposobów, a zastępcę spośród pozostałych ${people - 1} osób: $${people} \\cdot ${people - 1} = ${answer}$.`,
    };
  },
};

export const parityDigits: ClosedTemplate = {
  id: "km-parzystosc",
  difficulty: "sredni",
  make: (r) => {
    const k = r.int(2, 4);
    const odd = r.int(0, 1) === 1;
    const answer = odd ? 5 ** k : 4 * 5 ** (k - 1);
    return {
      prompt: `Ile jest wszystkich liczb naturalnych ${k}-cyfrowych, których wszystkie cyfry są ${odd ? "nieparzyste" : "parzyste"}?`,
      correct: n(answer),
      distractors: odd ? [n(4 * 5 ** (k - 1)), n(4 ** k), n(5 * k)] : [n(5 ** k), n(4 ** k), n(5 ** (k - 1))],
      hints: [
        odd ? "Cyfr nieparzystych jest pięć: 1, 3, 5, 7, 9." : "Cyfr parzystych jest pięć: 0, 2, 4, 6, 8 – ale liczba nie zaczyna się od zera.",
        "Policz możliwości na każdym miejscu i pomnóż.",
      ],
      explanation: odd
        ? `Na każdym z ${k} miejsc może stać jedna z 5 cyfr nieparzystych: $5^{${k}} = ${answer}$.`
        : `Pierwsza cyfra: 2, 4, 6 lub 8 (4 możliwości), pozostałe: 0, 2, 4, 6, 8 (po 5): $4 \\cdot 5^{${k - 1}} = ${answer}$.`,
    };
  },
};
