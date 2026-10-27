import { DIFFICULTIES } from "@/data/topics";
import type { Progress, Stars } from "@/types/progress";
import type { QuizResult } from "@/types/quiz";
import type { Difficulty } from "@/types/topic";

// Czyste obliczenia na postępie – bez stanu i zapisu, łatwe do użycia w każdym miejscu.

const PASS_RATIO = 0.6;

// ── Daty ──

export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatDay(key: string): string {
  return parseDay(key).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
}

// ── Testy ──

export function testKey(topicId: string, difficulty: Difficulty) {
  return `${topicId}/${difficulty}`;
}

export function isPassed({ correct, total, heartsLeft }: QuizResult): boolean {
  return heartsLeft > 0 && correct / total >= PASS_RATIO;
}

export function starsFor(result: QuizResult): Stars | null {
  if (!isPassed(result)) return null;
  const ratio = result.correct / result.total;
  if (ratio === 1) return 3;
  if (ratio >= 0.8) return 2;
  return 1;
}

/** Poziom podstawowy zawsze otwarty; kolejny po zaliczeniu poprzedniego. */
export function isUnlocked(progress: Progress, topicId: string, difficulty: Difficulty): boolean {
  const index = DIFFICULTIES.findIndex((d) => d.id === difficulty);
  return index === 0 || Boolean(progress.tests[testKey(topicId, DIFFICULTIES[index - 1].id)]);
}

export function passedLevels(progress: Progress, topicId: string): number {
  return DIFFICULTIES.filter((d) => progress.tests[testKey(topicId, d.id)]).length;
}

/** Gwiazdki tylko za prawdziwe testy – wstępne zaliczenia z testu na start ich nie dają. */
export function totalStars(progress: Progress): number {
  return Object.values(progress.tests).reduce((sum, t) => sum + (t.fromPlacement ? 0 : t.stars), 0);
}

/** Poziomy zaliczone samodzielnym testem (bez wstępnych zaliczeń z testu na start) – do odznak. */
export function earnedLevels(progress: Progress, topicId: string): number {
  return DIFFICULTIES.filter((d) => {
    const record = progress.tests[testKey(topicId, d.id)];
    return record && !record.fromPlacement;
  }).length;
}

// ── Seria i aktywność ──

/** Liczba kolejnych dni z nauką, licząc od dziś (albo od wczoraj, jeśli dziś jeszcze nic). */
export function streak(progress: Progress): number {
  let day = new Date();
  if (!progress.activityByDay[dayKey(day)]) day = shiftDays(day, -1);
  let count = 0;
  while (progress.activityByDay[dayKey(day)]) {
    count++;
    day = shiftDays(day, -1);
  }
  return count;
}

/** Najdłuższa seria w historii (do odznaki „Niezłomny”). */
export function longestStreak(progress: Progress): number {
  const days = Object.keys(progress.activityByDay).filter((k) => progress.activityByDay[k] > 0).sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous && dayKey(shiftDays(parseDay(previous), 1)) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

const WEEKDAYS = ["Pn", "Wt", "Śr", "Czw", "Pt", "So", "Nd"];

/** Bieżący tydzień (Pn–Nd) z informacją, czy danego dnia była nauka. */
export function currentWeek(progress: Progress) {
  const today = new Date();
  const monday = shiftDays(today, -((today.getDay() + 6) % 7));
  return WEEKDAYS.map((label, i) => {
    const key = dayKey(shiftDays(monday, i));
    return { label, key, active: Boolean(progress.activityByDay[key]), isToday: key === dayKey(today) };
  });
}

/** Zadania rozwiązane w bieżącym tygodniu (Pn–Nd). */
export function weekSolved(progress: Progress): number {
  return currentWeek(progress).reduce((sum, day) => sum + (progress.activityByDay[day.key] ?? 0), 0);
}
