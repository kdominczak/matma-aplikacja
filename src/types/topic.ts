import type { Section } from "@/types/blueprint";
import type { Plot } from "@/types/plot";
import type { OpenQuestion, Question } from "@/types/quiz";

export type Difficulty = "podstawowy" | "sredni" | "zaawansowany";

/** Wynik na maturze, do którego potrzebny jest dział (kumulatywnie). */
export type Target = 30 | 60 | 85;

export type Category = "Liczby" | "Algebra" | "Funkcje" | "Geometria" | "Statystyka";

/** Priorytet z analizy arkuszy maturalnych (S+ = najważniejsze). */
export type Priority = "S+" | "S" | "A" | "B";

export interface Formula {
  label: string;
  /** Sam LaTeX, bez znaczników $. */
  tex: string;
}

export interface FormulaGroup {
  title: string;
  formulas: Formula[];
}

export interface TheorySection {
  title: string;
  /** Akapity rozdzielone pustą linią; LaTeX w $...$. */
  body: string;
  example?: { prompt: string; solution: string };
  plot?: Plot;
}

export interface TopicContent {
  theory: TheorySection[];
  formulas: Formula[];
  /** Najczęstsze haczyki CKE w dziale – luźnym językiem. */
  traps: string[];
  tests: Record<Difficulty, Question[]>;
  /** Zadania otwarte do zakładki „Zadania” (z poziomem trudności jak w testach). */
  openTasks: (OpenQuestion & { difficulty: Difficulty })[];
}

/** Same zadania (bez teorii) – dla działów, których lekcja jeszcze powstaje. Wystarczą do zakładki „Zadania”. */
export interface PracticeContent {
  formulas: Formula[];
  closed: (Question & { difficulty: Difficulty })[];
  open: (OpenQuestion & { difficulty: Difficulty })[];
}

export interface Topic {
  id: string;
  /** Dział podstawy programowej (jak w „Zasadach oceniania” CKE) – do składania arkuszy według szablonu. */
  section: Section;
  lesson: string;
  title: string;
  /** Krótki symbol na kafelku, np. "log". */
  icon: string;
  category: Category;
  target: Target;
  priority: Priority;
  /** W ilu procentach arkuszy pojawia się temat. */
  examShare: number;
  /**
   * Względna waga tematu w jego dziale podstawy (ile punktów zwykle daje, gdy się pojawi). Punkty na maturze
   * liczymy z prawdziwych arkuszy – `topicExamPoints()` w src/lib/exam-weights.ts.
   */
  points: number;
  studyHours: number;
  /** Brak treści = lekcja (teoria, testy) „Wkrótce”. */
  content?: TopicContent;
  /** Zadania do zakładki „Zadania” dla działów bez pełnej lekcji. */
  practice?: PracticeContent;
  /** Warianty zadań z szablonów parametrycznych (src/data/templates) – dochodzą do zadań działu. */
  generated?: Omit<PracticeContent, "formulas">;
}
