import type { Plot } from "@/types/plot";

export type OptionKey = "A" | "B" | "C" | "D";

/**
 * Tekst w `prompt`, `options`, `explanation` i `hint` może zawierać wzory LaTeX
 * w znacznikach $...$, np. "Oblicz $\\sqrt{16}$".
 */
export interface Question {
  id: string;
  prompt: string;
  options: Record<OptionKey, string>;
  correct: OptionKey;
  explanation: string;
  /** Podpowiedź – pokazywana tylko na poziomie podstawowym. */
  hint?: string;
  /** Wykres pod treścią zadania. */
  figure?: Plot;
}

/** Pytanie gotowe do quizu – z etykietą działu i poziomu nad treścią. */
export interface QuizQuestion extends Question {
  label: string;
}

export interface QuizResult {
  correct: number;
  total: number;
  /** Ile zadań faktycznie rozwiązano (mniej niż `total`, gdy skończyły się serca). */
  answered: number;
  xp: number;
  heartsLeft: number;
}
