// Dział XI – kombinatoryka. Zadania pochodzą z szablonów parametrycznych (src/data/templates/kombinatoryka.ts).
import type { PracticeContent } from "@/types/topic";

const practice: PracticeContent = {
  formulas: [
    { label: "Reguła mnożenia", tex: "n_1 \\cdot n_2 \\cdot \\ldots \\cdot n_k" },
    { label: "Ciągi k-wyrazowe z n elementów (z powtórzeniami)", tex: "n^k" },
    { label: "Ciągi k-wyrazowe z n elementów (bez powtórzeń)", tex: "n(n - 1)(n - 2) \\cdot \\ldots \\cdot (n - k + 1)" },
  ],
  closed: [],
  open: [],
};

export default practice;
