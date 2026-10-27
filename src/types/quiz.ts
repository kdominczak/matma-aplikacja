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

/**
 * Zadanie otwarte (jak na maturze: uczeń zapisuje rozwiązanie, ocena wg schematu).
 * W aplikacji: wpisuje wynik końcowy (sprawdzany automatycznie), a potem porównuje się ze schematem oceniania.
 */
export interface OpenQuestion {
  id: string;
  prompt: string;
  figure?: Plot;
  /** Maks. liczba punktów – suma punktów kroków w `solution`. */
  points: number;
  /** Akceptowane wyniki końcowe; kilka wartości oddziel średnikiem („-2;3”), dozwolone ułamki („3/2”). */
  answers: string[];
  /** Etykieta przed polem odpowiedzi, np. „x =”. */
  answerLabel?: string;
  hints?: string[];
  /** Schemat oceniania: kolejne kroki rozwiązania z punktami (jak w zasadach oceniania CKE). */
  solution: { step: string; points: number }[];
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
  heartsLeft: number;
  /** Odpowiedzi na kolejne zadania – z nich zasilamy „Pudełko porażek”. */
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  chosen: OptionKey;
  correct: boolean;
}
