import type { Plot } from "@/types/plot";

export type OptionKey = "A" | "B" | "C" | "D";

/**
 * Tekst w `prompt`, `options`, `explanation`, `hints` i `trap` może zawierać wzory LaTeX
 * w znacznikach $...$, np. "Oblicz $\\sqrt{16}$".
 */
export interface Question {
  id: string;
  prompt: string;
  options: Record<OptionKey, string>;
  correct: OptionKey;
  explanation: string;
  /** Stopniowe podpowiedzi (od kierunku myślenia do konkretnego wzoru), bez podawania wyniku. */
  hints?: string[];
  /** Haczyk CKE: typowa pułapka w tym zadaniu, pokazywana po błędnej odpowiedzi. */
  trap?: string;
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
  /** Odpowiedzi na kolejne zadania – z nich zasilamy „Pudełko porażek”. */
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  chosen: OptionKey;
  correct: boolean;
}
