import type { PracticeRecord, Progress, ReviewItem, TestRecord, TopicStat } from "@/types/progress";

// Scalanie postępu z dwóch miejsc (to urządzenie + kopia w chmurze, np. po zalogowaniu na nowym telefonie).
// Zasada: nic nie ginie i nic nie liczy się podwójnie – liczniki biorą maksimum (nie sumę),
// zbiory (odznaki, pudełko, dni nauki) sumę, a wyniki testów i zadań – lepszy z dwóch.

function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a };
  for (const [key, value] of Object.entries(b)) out[key] = key in out ? pick(out[key], value) : value;
  return out;
}

const earlier = (x?: string, y?: string) => (x && y ? (x < y ? x : y) : (x ?? y));
const later = (x?: string, y?: string) => (x && y ? (x > y ? x : y) : (x ?? y));

function betterTest(x: TestRecord, y: TestRecord): TestRecord {
  // prawdziwy wynik testu wygrywa ze wstępnym zaliczeniem z testu na start
  if (x.fromPlacement !== y.fromPlacement) return { ...(x.fromPlacement ? y : x), passedAt: earlier(x.passedAt, y.passedAt) };
  const best = y.correct / y.total > x.correct / x.total ? y : x;
  return { ...best, passedAt: earlier(x.passedAt, y.passedAt) };
}

function betterPractice(x: PracticeRecord, y: PracticeRecord): PracticeRecord {
  return {
    points: Math.max(x.points, y.points),
    verifiedPoints: Math.max(x.verifiedPoints, y.verifiedPoints),
    maxPoints: Math.max(x.maxPoints, y.maxPoints),
    attempts: Math.max(x.attempts, y.attempts),
    lastAt: later(x.lastAt, y.lastAt)!,
  };
}

/** Powtórka: ostrożniej – niższe pudełko (pomyłka na którymś urządzeniu cofa zadanie), przy remisie wcześniejszy termin. */
const saferReview = (x: ReviewItem, y: ReviewItem): ReviewItem => (x.box !== y.box ? (x.box < y.box ? x : y) : x.due <= y.due ? x : y);

const moreAnswered = (x: TopicStat, y: TopicStat): TopicStat => (y.answered > x.answered ? y : x);

/**
 * Łączy dwa stany postępu. `newer` – który z nich zapisano później (decyduje o polach,
 * których nie da się scalić, np. wybrany cel na maturze).
 */
export function mergeProgress(local: Progress, remote: Progress, newer: "local" | "remote"): Progress {
  const recent = newer === "local" ? local : remote;
  const placement =
    local.placement?.status === "done" && remote.placement?.status !== "done"
      ? local.placement
      : remote.placement?.status === "done" && local.placement?.status !== "done"
        ? remote.placement
        : (recent.placement ?? local.placement ?? remote.placement);

  const stats = { ...local.stats };
  for (const key of Object.keys(stats) as (keyof Progress["stats"])[]) stats[key] = Math.max(local.stats[key] ?? 0, remote.stats[key] ?? 0);

  return {
    ...recent,
    activityByDay: mergeRecords(local.activityByDay, remote.activityByDay, Math.max),
    tests: mergeRecords(local.tests, remote.tests, betterTest),
    dailyDone: later(local.dailyDone, remote.dailyDone),
    target: recent.target,
    stats,
    achievements: mergeRecords(local.achievements, remote.achievements, (x, y) => earlier(x, y)!),
    mistakes: mergeRecords(local.mistakes, remote.mistakes, (x, y) => ({
      lastWrong: later(x.lastWrong, y.lastWrong)!,
      count: Math.max(x.count, y.count),
      chosen: x.lastWrong >= y.lastWrong ? x.chosen : y.chosen,
    })),
    topicStats: mergeRecords(local.topicStats, remote.topicStats, moreAnswered),
    placement,
    practice: mergeRecords(local.practice, remote.practice, betterPractice),
    reviews: mergeRecords(local.reviews ?? {}, remote.reviews ?? {}, saferReview),
    planDays: mergeRecords(local.planDays ?? {}, remote.planDays ?? {}, Math.max),
    statsByDay: mergeRecords(local.statsByDay ?? {}, remote.statsByDay ?? {}, (x, y) => mergeRecords(x, y, (a, b) => (b[0] > a[0] ? b : a))),
  };
}
