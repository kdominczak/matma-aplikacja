export type OptionKey = "A" | "B" | "C" | "D";

/**
 * Tekst w `prompt`, `options` i `explanation` może zawierać wzory LaTeX
 * w znacznikach $...$, np. "Oblicz $\\sqrt{16}$".
 */
export interface Question {
  id: string;
  topic: string;
  prompt: string;
  options: Record<OptionKey, string>;
  correct: OptionKey;
  explanation: string;
}

export interface QuizResult {
  correct: number;
  total: number;
  xp: number;
}
