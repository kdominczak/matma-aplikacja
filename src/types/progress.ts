import type { OptionKey } from "@/types/quiz";
import type { Target } from "@/types/topic";

export type Stars = 1 | 2 | 3;

export interface TestRecord {
  stars: Stars;
  correct: number;
  total: number;
  /** Dzień pierwszego zaliczenia (RRRR-MM-DD) – z tego rysujemy wykres szacowanego wyniku. */
  passedAt?: string;
  /** Poziom zaliczony wstępnie testem na start (prawdziwy test działu go nadpisuje). */
  fromPlacement?: boolean;
}

/** Odpowiedzi w jednym dziale na jednym poziomie trudności – podstawa skuteczności i doboru zadań. */
export interface TopicStat {
  answered: number;
  correct: number;
  lastAnswered: string;
}

/** Wynik zadania z zakładki „Zadania” (najlepszy uzyskany). Rozwiązane = points === maxPoints. */
export interface PracticeRecord {
  /** Najlepszy wynik (także z samooceny wg schematu) – do wyświetlania. */
  points: number;
  /** Najlepszy wynik sprawdzony przez aplikację (bez samooceny) – „naprawdę rozwiązane”. */
  verifiedPoints: number;
  maxPoints: number;
  attempts: number;
  lastAt: string;
}

/** Test na start: wykonany albo pominięty (wtedy aplikacja nie pyta ponownie). */
export type PlacementState =
  | { status: "skipped"; at: string }
  | { status: "done"; at: string; correct: number; total: number; target: Target; credited: string[] };

/** Liczniki potrzebne do odznak. */
export interface Stats {
  answered: number;
  correct: number;
  perfectTests: number;
  dailyChallenges: number;
  nightSessions: number;
  earlySessions: number;
  /** Zadania wyjęte z „Pudełka porażek” poprawną odpowiedzią. */
  mistakesBeaten: number;
  /** Zadania utrwalone powtórkami (przeszły wszystkie odstępy – patrz `reviews`). */
  reviewsMastered: number;
}

/**
 * Powtórka w odstępach (pudełka Leitnera). Pomyłka → pudełko 0, powtórka jutro. Każda poprawna odpowiedź
 * w terminie przesuwa zadanie dalej (3, 7, 14, 30 dni); po ostatnim pudełku zadanie jest utrwalone i wypada.
 */
export interface ReviewItem {
  box: number;
  /** Dzień, od którego zadanie czeka na powtórkę (RRRR-MM-DD). */
  due: string;
}

/** Zadanie, w którym uczeń się pomylił – czeka w „Pudełku porażek”. */
export interface Mistake {
  lastWrong: string;
  count: number;
  chosen: OptionKey;
}

export interface Progress {
  /** Liczba rozwiązanych zadań danego dnia (klucz RRRR-MM-DD) – z tego liczymy serię i tydzień. */
  activityByDay: Record<string, number>;
  /** Zaliczone testy, klucz `${topicId}/${difficulty}`, zapisany najlepszy wynik. */
  tests: Record<string, TestRecord>;
  /** Dzień, w którym zaliczono dzienne wyzwanie. */
  dailyDone?: string;
  target: Target;
  stats: Stats;
  /** Zdobyte odznaki: id → dzień zdobycia. */
  achievements: Record<string, string>;
  /** Pudełko porażek: id pytania → ostatnia pomyłka. Poprawna odpowiedź usuwa wpis. */
  mistakes: Record<string, Mistake>;
  /** Skuteczność per dział i poziom, klucz `${topicId}/${difficulty}` (jak w `tests`). */
  topicStats: Record<string, TopicStat>;
  placement?: PlacementState;
  /** Zakładka „Zadania”: id zadania → najlepszy wynik. */
  practice: Record<string, PracticeRecord>;
  /** Powtórki w odstępach: id zadania → pudełko i termin. */
  reviews: Record<string, ReviewItem>;
  /** Plan na dziś: dzień → liczba ukończonych sesji planu. */
  planDays: Record<string, number>;
  /**
   * Dzienna historia skuteczności: dzień → `${topicId}/${difficulty}` → [odpowiedzi, poprawne].
   * Z niej odtwarzamy szacowany wynik w czasie (wykres). Sumy = `topicStats`.
   */
  statsByDay: Record<string, Record<string, [number, number]>>;
}
