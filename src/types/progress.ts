import type { Target } from "@/types/topic";

export type Stars = 1 | 2 | 3;

export interface TestRecord {
  stars: Stars;
  correct: number;
  total: number;
  /** Dzień pierwszego zaliczenia (RRRR-MM-DD) – z tego rysujemy wykres szacowanego wyniku. */
  passedAt?: string;
}

/** Liczniki potrzebne do odznak. */
export interface Stats {
  answered: number;
  correct: number;
  perfectTests: number;
  dailyChallenges: number;
  nightSessions: number;
  earlySessions: number;
}

export interface Progress {
  xp: number;
  /** XP zdobyte danego dnia (klucz RRRR-MM-DD) – z tego liczymy serię i tydzień. */
  xpByDay: Record<string, number>;
  /** Zaliczone testy, klucz `${topicId}/${difficulty}`, zapisany najlepszy wynik. */
  tests: Record<string, TestRecord>;
  /** Dzień, w którym zaliczono dzienne wyzwanie. */
  dailyDone?: string;
  target: Target;
  stats: Stats;
  /** Zdobyte odznaki: id → dzień zdobycia. */
  achievements: Record<string, string>;
}
