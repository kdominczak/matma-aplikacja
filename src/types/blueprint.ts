// Szablon arkusza („blueprint”): układ prawdziwego arkusza matury podstawowej – pozycja po pozycji.
// Generator arkuszy próbnych wypełnia każdą pozycję zadaniem z puli o tym samym dziale, typie i punktacji,
// więc arkusz próbny zachowuje proporcje oryginału (punkty, typy zadań, wagę działów).

/** Działy podstawy programowej (zakres podstawowy) – numeracja jak w „Zasadach oceniania” CKE. */
export type Section = "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | "X" | "XI" | "XII" | "XIII";

/**
 * Typ zadania w arkuszu:
 * - `abcd` – wybór jednej z czterech odpowiedzi,
 * - `truefalse` – ocena prawdziwości (P/F) zwykle dwóch zdań,
 * - `choice` – wybór kilku odpowiedzi, dobieranie, wybór z uzasadnieniem,
 * - `short` – krótka odpowiedź bez rozwiązania (wpisanie liczby, przedziału, uzupełnienie zdań),
 * - `extended` – zadanie otwarte z rozwiązaniem ocenianym schematem (także dowody).
 */
export type TaskFormat = "abcd" | "truefalse" | "choice" | "short" | "extended";

export interface BlueprintSlot {
  /** Numer w oryginalnym arkuszu, np. "12.1". */
  number: string;
  points: number;
  format: TaskFormat;
  /** Działy z wymagań szczegółowych (ostatni = główny). */
  sections: Section[];
  /** Kody wymagań szczegółowych, np. "V.4" (XIII – optymalizacja, bez podpunktów). */
  requirements: string[];
}

/** Zastępstwo w arkuszu z generatora – czym pozycja różni się od oryginalnego układu. */
export interface Relaxation {
  /** Numer pozycji w oryginalnym arkuszu. */
  slot: string;
  points: number;
  rule: "format" | "neighbor" | "split" | "any-section" | "missing";
  /** Opis dla ucznia, np. „Zad. 11 (Układy równań, 2 pkt): zadanie z działu Równania i nierówności”. */
  note: string;
}

export interface ExamBlueprint {
  id: string;
  year: number;
  /** Suma punktów (2023–2024: 46, od 2025: 50). */
  totalPoints: number;
  durationMin: number;
  /** Czy układ obowiązuje na najbliższej maturze (wcześniejsze – tylko do porównań). */
  current: boolean;
  /** Źródło układu – „Zasady oceniania rozwiązań zadań” CKE. */
  source: string;
  slots: BlueprintSlot[];
}
