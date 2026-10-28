import type { PracticeTask } from "@/data/topics";
import type { OptionKey } from "@/types/quiz";

/**
 * Arkusz do rozwiązania w aplikacji (tryb symulacji egzaminu).
 * Zadania mają ten sam format co w zakładce „Zadania” – zamknięte ABCD albo otwarte z wynikiem końcowym.
 */
export interface ExamSheet {
  id: string;
  /** „cke” – przepisany oficjalny arkusz CKE; „probny” – arkusz złożony z zadań aplikacji. */
  kind: "cke" | "probny";
  title: string;
  subtitle: string;
  year?: number;
  level: "podstawowy";
  /** Czas na egzamin w minutach (matura podstawowa: 180). */
  durationMin: number;
  tasks: PracticeTask[];
  /** Oficjalne pliki CKE – do porównania z oryginałem (tylko `kind: "cke"`). */
  pdf?: { exam: string; solutions: string };
}

/** Odpowiedź ucznia w trakcie arkusza. */
export type ExamAnswer = { kind: "closed"; chosen: OptionKey } | { kind: "open"; input: string };

/** Rozwiązywany arkusz – zapisywany na urządzeniu po każdej zmianie (odświeżenie strony nic nie gubi). */
export interface ExamSession {
  examId: string;
  /** Znacznik czasu rozpoczęcia (ms) – czas liczy się jak na prawdziwej maturze, także gdy aplikacja jest w tle. */
  startedAt: number;
  current: number;
  answers: Record<string, ExamAnswer>;
  /** Zadania oznaczone „wrócę do tego”. */
  flagged: string[];
}

export interface ExamTaskResult {
  taskId: string;
  number: number;
  kind: "closed" | "open";
  /** „skipped” – bez odpowiedzi. */
  status: "correct" | "wrong" | "skipped";
  points: number;
  maxPoints: number;
  /** Odpowiedź ucznia (litera albo wpisany wynik). */
  given?: string;
}

/** Zakończona próba – historia na urządzeniu (i w Supabase, gdy powstanie tabela). */
export interface ExamAttempt {
  id: string;
  examId: string;
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  points: number;
  maxPoints: number;
  percent: number;
  results: ExamTaskResult[];
}
