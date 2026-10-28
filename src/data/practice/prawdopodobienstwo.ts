// Dział XII – rachunek prawdopodobieństwa. Zadania pochodzą z szablonów parametrycznych (src/data/templates/prawdopodobienstwo.ts).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Prawdopodobieństwo klasyczne", tex: "P(A) = \\frac{|A|}{|\\Omega|}" },
    { label: "Zdarzenie przeciwne", tex: "P(A') = 1 - P(A)" },
    { label: "Suma zdarzeń", tex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
  ],
  closed: [],
  open: [],
};

export default practice;
