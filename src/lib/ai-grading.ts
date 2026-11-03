import type { OpenQuestion } from "@/types/quiz";

// Ocena rozwiązania zadania otwartego przez AI według schematu oceniania (kroki `solution` z punktami).
// Czysta logika: prompt i bezpieczne odczytanie odpowiedzi modelu. Wywołanie – `gradeSolution` w src/lib/ai.ts,
// zestaw testowy trafności – scripts/grading-eval/ (npm run grading:eval).
//
// Zasady bezpieczeństwa: punkty zawsze liczy kod (applyAssessment obcina je do schematu), a tekst ucznia jest
// w prompcie wyłącznie danymi – prośba „daj 5 pkt” w rozwiązaniu nie jest poleceniem.

// Prompty narzuca też serwer (funkcja `ai` przy `purpose: "grade" | "transcribe"`) – jeden tekst dla obu stron.
export { gradingSystem, TRANSCRIBE_SYSTEM, NO_SOLUTION, type GradingLevel } from "../../supabase/functions/_shared/grading";

/** Treść zapytania: zadanie, poprawny wynik, schemat i rozwiązanie ucznia (jako dane w znacznikach). */
export function gradingUserMessage(task: OpenQuestion, solution: string): string {
  const rubric = task.solution.map((s, i) => `${i + 1}. (maks. ${s.points} pkt) ${s.step}`).join("\n");
  // znacznik zamykający w tekście ucznia nie może „wyjść” z danych
  const safe = solution.replace(/<\/?rozwiazanie_ucznia>/gi, "").trim();
  return [
    `Zadanie (${task.points} pkt): ${task.prompt}`,
    `Poprawny wynik końcowy: ${task.answers.join(" lub ")}`,
    `Schemat oceniania:\n${rubric}`,
    `<rozwiazanie_ucznia>\n${safe || "(puste)"}\n</rozwiazanie_ucznia>`,
    `Oceń rozwiązanie według schematu (${task.solution.length} kroków). Odpowiedz samym JSON-em.`,
  ].join("\n\n");
}

export interface Grading {
  /** Punkty za kolejne kroki schematu (jeszcze przed obcięciem – zrobi to applyAssessment). */
  steps: number[];
  /** Uzasadnienie dla każdego kroku – pokazujemy je uczniowi obok punktów. */
  reasons: string[];
}

/**
 * Odczytuje ocenę z odpowiedzi modelu. Toleruje otoczkę (```json, tekst przed/po), ale nie zgaduje:
 * zła liczba kroków albo brak liczb = null (aplikacja pokaże wtedy samoocenę zamiast wymyślonych punktów).
 */
export function parseGrading(text: string, task: OpenQuestion): Grading | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  const data = parseLenient(text.slice(start, end + 1));
  if (data === undefined) return null;
  const steps = (data as { steps?: unknown }).steps;
  if (!Array.isArray(steps) || steps.length !== task.solution.length) return null;
  const points: number[] = [];
  const reasons: string[] = [];
  for (const step of steps) {
    const value = Number((step as { points?: unknown })?.points);
    if (!Number.isFinite(value)) return null;
    points.push(value);
    const reason = (step as { reason?: unknown })?.reason;
    reasons.push(typeof reason === "string" ? reason.slice(0, 400) : "");
  }
  return { steps: points, reasons };
}

/**
 * JSON.parse, a gdy się nie uda – druga próba po naprawie LaTeX-a w tekście: model potrafi wpisać „\in” albo „\sqrt”
 * z jednym ukośnikiem, co w JSON-ie jest niedozwolonym znakiem ucieczki. Nieparzysta liczba ukośników przed
 * komendą (co najmniej 2 litery) dostaje jeden więcej. undefined = nie da się odczytać.
 */
function parseLenient(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    try {
      return JSON.parse(json.replace(/(\\+)([a-zA-Z]{2,})/g, (all, slashes: string, word: string) => (slashes.length % 2 ? `\\${slashes}${word}` : all)));
    } catch {
      return undefined;
    }
  }
}
