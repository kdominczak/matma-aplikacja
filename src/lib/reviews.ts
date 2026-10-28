import { dayKey, parseDay, shiftDays } from "@/lib/stats";
import type { Progress, ReviewItem } from "@/types/progress";

// Powtórki w odstępach (pudełka Leitnera) – najlepiej przebadana metoda utrwalania wiedzy:
// zadanie wraca tuż przed tym, zanim zdążysz je zapomnieć, a każdy sukces wydłuża przerwę.
// Pomyłka → pudełko 0 (powtórka jutro). Poprawna odpowiedź w terminie → kolejne pudełko.
// Po poprawnej odpowiedzi w ostatnim pudełku zadanie jest utrwalone i znika z powtórek.

/** Ile dni czeka zadanie w danym pudełku (indeks = numer pudełka). */
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30] as const;

function addDays(day: string, days: number): string {
  return dayKey(shiftDays(parseDay(day), days));
}

export type ReviewChange = "scheduled" | "promoted" | "mastered" | "unchanged";

/**
 * Aktualizuje powtórki po odpowiedzi (zmienia przekazany obiekt).
 * Poprawna odpowiedź przed terminem niczego nie przesuwa – liczy się odstęp, nie liczba powtórzeń.
 */
export function scheduleReview(reviews: Record<string, ReviewItem>, questionId: string, correct: boolean, today: string): ReviewChange {
  const item = reviews[questionId];
  if (!correct) {
    reviews[questionId] = { box: 0, due: addDays(today, REVIEW_INTERVALS[0]) };
    return "scheduled";
  }
  if (!item || item.due > today) return "unchanged";
  const box = item.box + 1;
  if (box >= REVIEW_INTERVALS.length) {
    delete reviews[questionId];
    return "mastered";
  }
  reviews[questionId] = { box, due: addDays(today, REVIEW_INTERVALS[box]) };
  return "promoted";
}

/**
 * Zadania, które dziś czekają na powtórkę – najpierw najdłużej zaległe, potem z niższych pudełek.
 * Pomyłki sprzed wprowadzenia powtórek (są w pudełku porażek, nie mają terminu) wracają dzień po błędzie.
 */
export function dueReviews(progress: Progress, today = dayKey()): string[] {
  const items: { id: string; due: string; box: number }[] = Object.entries(progress.reviews)
    .filter(([, r]) => r.due <= today)
    .map(([id, r]) => ({ id, due: r.due, box: r.box }));
  for (const [id, mistake] of Object.entries(progress.mistakes)) {
    if (!progress.reviews[id] && mistake.lastWrong < today) items.push({ id, due: addDays(mistake.lastWrong, 1), box: 0 });
  }
  return items.sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box || a.id.localeCompare(b.id)).map((i) => i.id);
}

/** Ile powtórek czeka jutro (do zapowiedzi na ekranie po wykonanym planie). */
export function reviewsDueOn(progress: Progress, day: string): number {
  return Object.values(progress.reviews).filter((r) => r.due <= day).length;
}
