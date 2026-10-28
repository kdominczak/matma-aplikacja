// Strona główna: próg pierwszego szacunku, liczby za skutecznością w planie i najbliższa odznaka.
import { describe, expect, it } from "vitest";
import { nextAchievement } from "@/components/achievements/NextBadge";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { answersToEstimate, ESTIMATE_MIN_ANSWERS } from "@/lib/estimate";
import { buildPlan } from "@/lib/planner";
import type { Progress } from "@/types/progress";

function progress(patch: Partial<Progress> = {}): Progress {
  return {
    activityByDay: {},
    tests: {},
    target: 30,
    stats: { answered: 0, correct: 0, perfectTests: 0, dailyChallenges: 0, nightSessions: 0, earlySessions: 0, mistakesBeaten: 0, reviewsMastered: 0 },
    achievements: {},
    mistakes: {},
    topicStats: {},
    practice: {},
    reviews: {},
    planDays: {},
    statsByDay: {},
    ...patch,
  };
}

describe("strona główna", () => {
  it("szacunek dopiero po 20 odpowiedziach – wcześniej licznik brakujących", () => {
    expect(answersToEstimate(progress())).toBe(ESTIMATE_MIN_ANSWERS);
    expect(answersToEstimate(progress({ stats: { ...progress().stats, answered: 7 } }))).toBe(ESTIMATE_MIN_ANSWERS - 7);
    expect(answersToEstimate(progress({ stats: { ...progress().stats, answered: 40 } }))).toBe(0);
  });

  it("dział dnia zna liczbę odpowiedzi za skutecznością (do komunikatu „Ostatnio 1/3”)", () => {
    const first = buildPlan(progress(), "2026-11-10").focus!;
    expect(first).toMatchObject({ accuracy: null, answered: 0, correct: 0 });
    const key = `${first.topic.id}/podstawowy`;
    const again = buildPlan(progress({ topicStats: { [key]: { answered: 3, correct: 1, lastAnswered: "2026-11-01" } } }), "2026-11-10").focus!;
    // słaba skuteczność (1/3) w najważniejszym dziale – nadal jest działem dnia
    expect(again.topic.id).toBe(first.topic.id);
    expect(again).toMatchObject({ answered: 3, correct: 1 });
  });

  it("następna odznaka: niezdobyta, najbliżej celu; po zdobyciu wszystkich – brak", () => {
    const next = nextAchievement(progress({ stats: { ...progress().stats, correct: 90 } }))!;
    expect(next.id).toBe("setka");
    const all = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, "2026-11-01"]));
    expect(nextAchievement(progress({ achievements: all }))).toBeNull();
  });
});
