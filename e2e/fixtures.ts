// Dane do zrzutów i testów E2E: „aktywny uczeń” po dwóch tygodniach nauki (seria, błędy, odznaki, historia wyniku).
// Zapisywane do localStorage przed startem aplikacji – tak, jak robi to Capacitor Preferences w przeglądarce.

const pad = (n: number) => String(n).padStart(2, "0");
export function day(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Odpowiedzi w działach: [dział/poziom, ile dni temu, odpowiedzi, poprawne]. */
const HISTORY: [string, number, number, number][] = [
  ["potegi-i-pierwiastki/podstawowy", 13, 10, 8],
  ["potegi-i-pierwiastki/sredni", 11, 8, 6],
  ["logarytmy/podstawowy", 10, 8, 5],
  ["wykres-funkcji/podstawowy", 8, 12, 9],
  ["funkcja-liniowa/podstawowy", 6, 10, 8],
  ["ciagi/podstawowy", 4, 9, 5],
  ["nierownosci-kwadratowe/podstawowy", 3, 7, 4],
  ["funkcja-kwadratowa/sredni", 2, 6, 3],
  ["statystyka/podstawowy", 1, 8, 7],
  ["ciagi/sredni", 0, 6, 3],
];

export function activeProgress() {
  const statsByDay: Record<string, Record<string, [number, number]>> = {};
  const topicStats: Record<string, { answered: number; correct: number; lastAnswered: string }> = {};
  const activityByDay: Record<string, number> = {};
  let answered = 0;
  let correct = 0;
  for (const [key, ago, a, c] of HISTORY) {
    const d = day(ago);
    (statsByDay[d] ??= {})[key] = [a, c];
    const t = (topicStats[key] ??= { answered: 0, correct: 0, lastAnswered: d });
    t.answered += a;
    t.correct += c;
    t.lastAnswered = d;
    activityByDay[d] = (activityByDay[d] ?? 0) + a;
    answered += a;
    correct += c;
  }
  return {
    activityByDay,
    tests: {
      "potegi-i-pierwiastki/podstawowy": { stars: 3, correct: 5, total: 5, passedAt: day(13) },
      "potegi-i-pierwiastki/sredni": { stars: 2, correct: 4, total: 5, passedAt: day(11) },
      "logarytmy/podstawowy": { stars: 1, correct: 3, total: 5, passedAt: day(10) },
      "funkcja-liniowa/podstawowy": { stars: 3, correct: 5, total: 5, passedAt: day(6) },
    },
    target: 60,
    stats: { answered, correct, perfectTests: 2, dailyChallenges: 3, nightSessions: 1, earlySessions: 0, mistakesBeaten: 4, reviewsMastered: 1 },
    achievements: { "pierwszy-krok": day(13), "pierwszy-plan": day(5), perfekcjonista: day(6) },
    mistakes: {
      "cg-p2": { lastWrong: day(4), count: 1, chosen: "B" },
      "cg-s1": { lastWrong: day(0), count: 2, chosen: "A" },
      "log-p3": { lastWrong: day(10), count: 1, chosen: "C" },
    },
    topicStats,
    placement: { status: "done", at: day(14), correct: 7, total: 12, target: 60, credited: [] },
    practice: {
      "cg-p1": { points: 1, verifiedPoints: 1, maxPoints: 1, attempts: 1, lastAt: day(4) },
      "cg-p2": { points: 0, verifiedPoints: 0, maxPoints: 1, attempts: 1, lastAt: day(4) },
    },
    reviews: { "cg-p2": { box: 0, due: day(3) }, "log-p3": { box: 1, due: day(1) } },
    planDays: { [day(5)]: 1, [day(2)]: 1, [day(1)]: 1 },
    statsByDay,
  };
}

/** Nowy uczeń po pominięciu testu na start (bez okna powitalnego na każdym zrzucie). */
export function freshProgress() {
  return {
    activityByDay: {},
    tests: {},
    target: 30,
    stats: { answered: 0, correct: 0, perfectTests: 0, dailyChallenges: 0, nightSessions: 0, earlySessions: 0, mistakesBeaten: 0, reviewsMastered: 0 },
    achievements: {},
    mistakes: {},
    topicStats: {},
    placement: { status: "skipped", at: day(0) },
    practice: {},
    reviews: {},
    planDays: {},
    statsByDay: {},
  };
}

export type Theme = "light" | "dark";

/** Skrypt uruchamiany przed aplikacją: postęp, ustawienia i motyw w localStorage. */
export function storageInit(progress: object | null, theme: Theme, name = "Ola") {
  return {
    progress: progress ? JSON.stringify(progress) : null,
    settings: JSON.stringify({ name, avatar: null, avatarColor: "brand", haptics: false, sounds: false, confetti: false }),
    theme,
  };
}
