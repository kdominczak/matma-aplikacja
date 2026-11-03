import type { PracticeTask } from "@/data/topics";
import type { Relaxation } from "@/types/blueprint";
import type { Plot } from "@/types/plot";
import type { OptionKey } from "@/types/quiz";
import type { Difficulty, Level } from "@/types/topic";

/** Odpowiedź do wyboru w zadaniu „choice” – tekst (LaTeX w $…$) albo rysunek, np. wykres funkcji. */
export interface ChoiceOption {
  key: string;
  text?: string;
  figure?: Plot;
}

/**
 * Zadanie z arkusza CKE „wybierz spośród A–F”: dopasowanie (kilka luk po jednej literze), wybór kilku odpowiedzi
 * (luka z kilkoma literami) albo ABCD z rysunkami. Punkt za każdą poprawną literę w luce – tak punktuje CKE
 * („1 pkt – jedna poprawna odpowiedź”); w luce nie da się zaznaczyć więcej liter, niż ma klucz.
 */
export interface ChoiceQuestion {
  id: string;
  label: string;
  prompt: string;
  figure?: Plot;
  options: ChoiceOption[];
  /** Luki do uzupełnienia: opis (np. „funkcja g”) i litery z klucza (kolejność dowolna). */
  blanks: { label?: string; answer: string[] }[];
  explanation: string;
}

/** Zadanie tylko w arkuszach CKE (nie ma go w „Zadaniach” ani w puli generatora). */
export type ChoiceTask = { kind: "choice"; id: string; difficulty: Difficulty; points: number; choice: ChoiceQuestion };

/** Zadanie arkusza: jak w „Zadaniach” (zamknięte, otwarte) albo „wybór” z arkusza CKE. */
export type ExamTask = PracticeTask | ChoiceTask;

/**
 * Arkusz do rozwiązania w aplikacji (tryb symulacji egzaminu).
 * Zadania mają ten sam format co w zakładce „Zadania” – zamknięte ABCD albo otwarte z wynikiem końcowym.
 */
export interface ExamSheet {
  id: string;
  /**
   * „cke” – przepisany oficjalny arkusz CKE; „probny” – stały arkusz próbny z zadań aplikacji;
   * „losowy” – arkusz z generatora, odtwarzany z kodu (`code`).
   */
  kind: "cke" | "probny" | "losowy";
  title: string;
  subtitle: string;
  year?: number;
  /** Sesja egzaminu CKE (tylko `kind: "cke"`) – do oznaczenia źródła: „Zadanie z arkusza CKE, matura maj 2024”. */
  session?: "maj" | "czerwiec" | "sierpień";
  level: Level;
  /** Numery zadań jak w arkuszu CKE (np. „12.1”, „14.2”) – domyślnie 1, 2, 3… (`taskNumber`). */
  numbers?: string[];
  /** Czas na egzamin w minutach (matura podstawowa i rozszerzona: 180). */
  durationMin: number;
  tasks: ExamTask[];
  /** Oficjalne pliki CKE – do porównania z oryginałem (tylko `kind: "cke"`). */
  pdf?: { exam: string; solutions: string };
  /** Kod arkusza z generatora – do udostępnienia znajomym (ten sam kod = ten sam arkusz). */
  code?: string;
  /** Rok matury, której układ odwzorowuje arkusz z generatora. */
  layoutYear?: number;
  /** Czym arkusz z generatora różni się od oryginalnego układu (zastępstwa zadań). */
  relaxations?: Relaxation[];
}

/** Odpowiedź ucznia w trakcie arkusza. */
export type ExamAnswer =
  | { kind: "closed"; chosen: OptionKey }
  | { kind: "open"; input: string }
  /** Litery wybrane w kolejnych lukach zadania „choice”. */
  | { kind: "choice"; picks: string[][] };

/** Rozwiązywany arkusz – zapisywany na urządzeniu po każdej zmianie (odświeżenie strony nic nie gubi). */
export interface ExamSession {
  examId: string;
  /** Znacznik czasu rozpoczęcia (ms) – czas liczy się jak na prawdziwej maturze, także gdy aplikacja jest w tle. */
  startedAt: number;
  current: number;
  answers: Record<string, ExamAnswer>;
  /** Zadania oznaczone „wrócę do tego”. */
  flagged: string[];
  /** Moment „Zakończ” (ms) – potem jest już tylko sprawdzanie zadań otwartych. */
  finishedAt?: number;
  /**
   * Czas rozwiązywania (ms) liczony tylko przy otwartej aplikacji – wyjście na obiad nie zjada czasu egzaminu.
   * Brak (starsze sesje) = czas od `startedAt`, najwyżej czas egzaminu.
   */
  elapsedMs?: number;
}

/**
 * Ocena rozwiązania zadania otwartego według schematu (kroki z `solution`): punkty przyznane za każdy krok.
 * `self` – uczeń zaznaczył kroki sam, `ai` – ocenił korepetytor AI.
 */
export interface StepAssessment {
  by: "self" | "ai";
  steps: number[];
  /** Uzasadnienie korepetytora AI dla każdego kroku (tylko `by: "ai"`). */
  reasons?: string[];
}

export interface ExamTaskResult {
  taskId: string;
  number: number;
  kind: "closed" | "open" | "choice";
  /**
   * „correct” – wynik sprawdzony przez aplikację; „partial” – część punktów za kroki (samoocena albo AI, bez poprawnego
   * wyniku końcowego); „skipped” – bez odpowiedzi. Tylko „correct” liczy się w statystykach jako poprawne.
   */
  status: "correct" | "partial" | "wrong" | "skipped";
  points: number;
  maxPoints: number;
  /** Odpowiedź ucznia (litera albo wpisany wynik). */
  given?: string;
  /** Punkty za kroki rozwiązania (zadania otwarte rozszerzone bez poprawnego wyniku końcowego). */
  assessment?: StepAssessment;
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
