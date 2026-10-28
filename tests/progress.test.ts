// Zapis postępu na urządzeniu: przeniesienie starych zapisów, sesje, zadania, test na start i scalanie z chmurą.
import { describe, expect, it } from "vitest";
import { PLACEMENT } from "@/data/placement";
import { getTopic, practiceTasks } from "@/data/topics";
import { needsPlacement, scorePlacement } from "@/lib/placement";
import * as P from "@/lib/progress";
import { mergeProgress } from "@/lib/progress-merge";
import type { Progress } from "@/types/progress";
import type { QuizAnswer } from "@/types/quiz";

const day = (offset: number) => P.dayKey(P.shiftDays(new Date(), -offset));
const wrongOf = (c: string) => (c === "A" ? "B" : "A");

// stary zapis z czasów XP – musi się wczytać jako dni nauki (seria zostaje)
localStorage.setItem(
  "CapacitorStorage.progress.v2",
  JSON.stringify({ xp: 55, xpByDay: { [day(0)]: 30, [day(1)]: 25, [day(5)]: 0 }, tests: {}, target: 60 }),
);

function answersWhere(pred: (id: string, i: number) => boolean): QuizAnswer[] {
  return PLACEMENT.map((item, i) => {
    const correct = pred(item.question.id, i);
    return { questionId: item.question.id, chosen: correct ? item.question.correct : wrongOf(item.question.correct), correct };
  });
}

describe("wczytanie starego zapisu", () => {
  it("XP znika, dni z XP stają się dniami nauki, cel zostaje", async () => {
    const progress = await P.readProgress();
    expect(progress).not.toHaveProperty("xp");
    expect(progress).not.toHaveProperty("xpByDay");
    expect(P.streak(progress)).toBe(2);
    expect(progress.target).toBe(60);
  });
});

describe("zakładka „Zadania”", () => {
  it("zła odpowiedź trafia do pudełka i statystyk działu, dobra ją wyjmuje", async () => {
    await P.resetProgress();
    const wrong = await P.savePracticeTask({ taskId: "cg-p1", topicId: "ciagi", difficulty: "podstawowy", kind: "closed", maxPoints: 1, points: 0, chosen: "B", verified: true });
    expect(wrong.progress.mistakes["cg-p1"]).toBeDefined();
    expect(wrong.progress.topicStats["ciagi/podstawowy"].answered).toBe(1);

    const right = await P.savePracticeTask({ taskId: "cg-p1", topicId: "ciagi", difficulty: "podstawowy", kind: "closed", maxPoints: 1, points: 1, chosen: "A", verified: true });
    expect(right.progress.mistakes["cg-p1"]).toBeUndefined();
    expect(right.progress.practice["cg-p1"].verifiedPoints).toBe(1);
  });

  it("samoocena zadania otwartego nie liczy się jako „sprawdzone”", async () => {
    const open = await P.savePracticeTask({ taskId: "cg-o1", topicId: "ciagi", difficulty: "sredni", kind: "open", maxPoints: 2, points: 2, verified: false });
    expect(open.progress.practice["cg-o1"]).toMatchObject({ points: 2, verifiedPoints: 0 });
  });

  it("każde rozwiązane zadanie liczy się do dnia nauki", async () => {
    const progress = await P.readProgress();
    expect(progress.activityByDay[day(0)]).toBe(3);
    expect(P.weekSolved(progress)).toBe(3);
    expect(P.streak(progress)).toBe(1);
  });

  it("dział bez lekcji ma zadania od najłatwiejszych", () => {
    const tasks = practiceTasks(getTopic("ciagi")!);
    expect(tasks[0].difficulty).toBe("podstawowy");
    expect(tasks.at(-1)?.kind).toBe("open");
  });
});

describe("test na start", () => {
  it("cel wynika z wyniku, a punktacja liczy z klucza, nie z flagi klienta", () => {
    expect(scorePlacement(answersWhere(() => true)).target).toBe(85);
    expect(scorePlacement(answersWhere(() => false))).toMatchObject({ target: 30, credited: [] });
    const forged = answersWhere(() => false).map((a) => ({ ...a, correct: true }));
    expect(scorePlacement(forged).correct).toBe(0);
  });

  it("po teście: cel ustawiony, wstępne zaliczenia bez gwiazdek, test nie wraca", async () => {
    await P.resetProgress();
    expect(needsPlacement(await P.readProgress())).toBe(true);
    const answers = answersWhere((id) => id === "start-01" || id === "start-02");
    const { progress } = await P.savePlacementResult({ correct: 2, total: 12, answered: 12, heartsLeft: 3, answers });
    expect(progress.placement?.status).toBe("done");
    expect(needsPlacement(progress)).toBe(false);
    expect(Object.values(progress.tests).every((t) => t.fromPlacement)).toBe(true);
    expect(P.totalStars(progress)).toBe(0);
    expect(Object.keys(progress.mistakes)).toHaveLength(10);
  });

  it("odpowiedź spoza bazy (np. od AI) nie wpływa na statystyki", async () => {
    const before = (await P.readProgress()).stats.answered;
    await P.saveMistakeTraining({ correct: 1, total: 1, answered: 1, heartsLeft: 3, answers: [{ questionId: "ai-gen-1", chosen: "A", correct: true }] });
    expect((await P.readProgress()).stats.answered).toBe(before);
  });
});

describe("plan na dziś i powtórki", () => {
  it("pomyłka w sesji planuje powtórkę na jutro, wykonany plan się liczy i daje odznakę", async () => {
    await P.resetProgress();
    const [first, second] = PLACEMENT.slice(0, 2).map((i) => i.question);
    const { progress, earned } = await P.savePlanResult({
      correct: 1,
      total: 2,
      answered: 2,
      heartsLeft: 3,
      answers: [
        { questionId: first.id, chosen: first.correct, correct: true },
        { questionId: second.id, chosen: wrongOf(second.correct), correct: false },
      ],
    });
    expect(progress.reviews[second.id]).toEqual({ box: 0, due: day(-1) });
    expect(progress.reviews[first.id]).toBeUndefined();
    expect(progress.planDays[day(0)]).toBe(1);
    expect(earned.map((a) => a.id)).toContain("pierwszy-plan");
  });
});

describe("scalanie z kopią w chmurze", () => {
  const base = (patch: Partial<Progress>): Progress => ({ ...structuredClone(EMPTY), ...patch });
  const EMPTY: Progress = {
    activityByDay: {},
    tests: {},
    target: 60,
    stats: { answered: 0, correct: 0, perfectTests: 0, dailyChallenges: 0, nightSessions: 0, earlySessions: 0, mistakesBeaten: 0, reviewsMastered: 0 },
    achievements: {},
    mistakes: {},
    topicStats: {},
    practice: {},
    reviews: {},
    planDays: {},
    statsByDay: {},
  };

  it("nic nie ginie i nic nie liczy się podwójnie", () => {
    const phone = base({ activityByDay: { "2026-10-01": 5 }, stats: { ...EMPTY.stats, answered: 10 }, achievements: { a: "2026-10-02" } });
    const cloud = base({ activityByDay: { "2026-10-01": 3, "2026-10-02": 4 }, stats: { ...EMPTY.stats, answered: 7 }, achievements: { a: "2026-10-01", b: "2026-10-03" } });
    const merged = mergeProgress(phone, cloud, "local");
    expect(merged.activityByDay).toEqual({ "2026-10-01": 5, "2026-10-02": 4 });
    expect(merged.stats.answered).toBe(10);
    expect(merged.achievements).toEqual({ a: "2026-10-01", b: "2026-10-03" });
  });

  it("prawdziwy wynik testu wygrywa ze wstępnym zaliczeniem", () => {
    const phone = base({ tests: { "x/podstawowy": { stars: 1, correct: 2, total: 3, fromPlacement: true, passedAt: "2026-10-01" } } });
    const cloud = base({ tests: { "x/podstawowy": { stars: 1, correct: 1, total: 3, passedAt: "2026-10-05" } } });
    const merged = mergeProgress(phone, cloud, "local");
    expect(merged.tests["x/podstawowy"]).toMatchObject({ correct: 1, passedAt: "2026-10-01" });
    expect(merged.tests["x/podstawowy"].fromPlacement).toBeUndefined();
  });
});
