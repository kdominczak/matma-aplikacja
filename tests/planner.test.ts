// Plan na dziś i powtórki w odstępach – czy plan podejmuje sensowne decyzje dla ucznia.
import { describe, expect, it } from "vitest";
import { allQuestionRefs, findQuestion, getTopic, topicsForTarget } from "@/data/topics";
import { buildPlan, longestPlanStreak, MAX_REVIEWS, planStreak, rankTopics, topicMastery } from "@/lib/planner";
import { dueReviews, REVIEW_INTERVALS, scheduleReview } from "@/lib/reviews";
import { mergeProgress } from "@/lib/progress-merge";
import type { Progress, ReviewItem } from "@/types/progress";

const TODAY = "2026-11-10";

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

describe("powtórki w odstępach", () => {
  it("pomyłka → jutro; kolejne sukcesy w terminie → 3, 7, 14, 30 dni; potem utrwalone", () => {
    const reviews: Record<string, ReviewItem> = {};
    expect(scheduleReview(reviews, "q", false, "2026-11-01")).toBe("scheduled");
    expect(reviews.q).toEqual({ box: 0, due: "2026-11-02" });

    let day = "2026-11-02";
    for (let box = 1; box < REVIEW_INTERVALS.length; box++) {
      expect(scheduleReview(reviews, "q", true, day)).toBe("promoted");
      expect(reviews.q.box).toBe(box);
      day = reviews.q.due;
    }
    expect(scheduleReview(reviews, "q", true, day)).toBe("mastered");
    expect(reviews.q).toBeUndefined();
  });

  it("poprawna odpowiedź przed terminem niczego nie przesuwa", () => {
    const reviews: Record<string, ReviewItem> = { q: { box: 2, due: "2026-11-20" } };
    expect(scheduleReview(reviews, "q", true, "2026-11-10")).toBe("unchanged");
    expect(reviews.q).toEqual({ box: 2, due: "2026-11-20" });
  });

  it("pomyłka w dowolnym pudełku cofa na początek", () => {
    const reviews: Record<string, ReviewItem> = { q: { box: 3, due: "2026-11-01" } };
    scheduleReview(reviews, "q", false, "2026-11-10");
    expect(reviews.q).toEqual({ box: 0, due: "2026-11-11" });
  });

  it("zaległe powtórki: najpierw najstarsze; stare pomyłki bez terminu wracają dzień po błędzie", () => {
    const p = progress({
      reviews: { a: { box: 1, due: "2026-11-09" }, b: { box: 0, due: "2026-11-05" }, future: { box: 0, due: "2026-11-11" } },
      mistakes: { legacy: { lastWrong: "2026-11-01", count: 1, chosen: "A" }, today: { lastWrong: TODAY, count: 1, chosen: "A" } },
    });
    expect(dueReviews(p, TODAY)).toEqual(["legacy", "b", "a"]);
  });

  it("scalanie z chmurą wybiera ostrożniejszą powtórkę", () => {
    const phone = progress({ reviews: { q: { box: 3, due: "2026-12-01" } }, planDays: { [TODAY]: 1 } });
    const cloud = progress({ reviews: { q: { box: 0, due: "2026-11-11" } }, planDays: { [TODAY]: 2 } });
    const merged = mergeProgress(phone, cloud, "local");
    expect(merged.reviews.q).toEqual({ box: 0, due: "2026-11-11" });
    expect(merged.planDays[TODAY]).toBe(2);
  });
});

describe("wybór działu dnia", () => {
  it("nowy uczeń: dział o największej wadze na maturze z jego celu", () => {
    const [first] = rankTopics(progress({ target: 30 }), TODAY);
    const best = Math.max(...topicsForTarget(30).map((t) => t.points * t.examShare));
    expect(first.topic.points * first.topic.examShare).toBe(best);
  });

  it("opanowany dział ustępuje miejsca następnemu", () => {
    const fresh = rankTopics(progress(), TODAY)[0].topic;
    const mastered = progress({
      topicStats: {
        [`${fresh.id}/podstawowy`]: { answered: 20, correct: 20, lastAnswered: "2026-11-09" },
        [`${fresh.id}/sredni`]: { answered: 20, correct: 20, lastAnswered: "2026-11-09" },
        [`${fresh.id}/zaawansowany`]: { answered: 20, correct: 20, lastAnswered: "2026-11-09" },
      },
    });
    expect(topicMastery(mastered, fresh)).toBeGreaterThan(0.95);
    expect(rankTopics(mastered, TODAY)[0].topic.id).not.toBe(fresh.id);
  });

  it("cel 30% nie wrzuca działów z wyższych celów, dopóki są nieopanowane", () => {
    const ids = new Set(topicsForTarget(30).map((t) => t.id));
    for (const { topic } of rankTopics(progress({ target: 30 }), TODAY)) expect(ids.has(topic.id)).toBe(true);
  });

  it("poziom trudności rośnie z opanowaniem", () => {
    // wszystkie działy celu 30% opanowane, w logarytmach tylko poziom podstawowy → dział dnia: logarytmy, poziom średni
    const full = { answered: 20, correct: 20, lastAnswered: "2026-11-09" };
    const topicStats = Object.fromEntries(
      topicsForTarget(30)
        .filter((t) => t.id !== "logarytmy")
        .flatMap((t) => ["podstawowy", "sredni", "zaawansowany"].map((d) => [`${t.id}/${d}`, full])),
    );
    topicStats["logarytmy/podstawowy"] = full;
    const plan = buildPlan(progress({ topicStats }), TODAY);
    expect(plan.focus?.topic.id).toBe(getTopic("logarytmy")!.id);
    expect(plan.focus?.difficulty).toBe("sredni");
    expect(plan.items.filter((i) => i.kind === "focus").every((i) => i.topic.id === "logarytmy")).toBe(true);
  });
});

describe("plan na dziś", () => {
  it("nowy uczeń: ok. 10 zadań z działu dnia i przeplatania, bez powtórek", () => {
    const plan = buildPlan(progress(), TODAY);
    expect(plan.reviewCount).toBe(0);
    expect(plan.items.length).toBeGreaterThanOrEqual(6);
    expect(plan.items.length).toBeLessThanOrEqual(12);
    expect(plan.items.filter((i) => i.kind === "mix").every((i) => i.topic.id !== plan.focus?.topic.id)).toBe(true);
    expect(plan.minutes).toBeGreaterThan(0);
  });

  it("zadania się nie powtarzają i wszystkie istnieją w bazie", () => {
    const plan = buildPlan(progress(), TODAY);
    const ids = plan.items.map((i) => i.question.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(findQuestion(id)).toBeDefined();
    expect(ids.some((id) => id.startsWith("start-"))).toBe(false);
  });

  it(`powtórki idą pierwsze, najwyżej ${MAX_REVIEWS}`, () => {
    const ids = allQuestionRefs()
      .filter((r) => !r.question.id.startsWith("start-"))
      .slice(0, 8)
      .map((r) => r.question.id);
    const reviews = Object.fromEntries(ids.map((id) => [id, { box: 0, due: "2026-11-01" }]));
    const plan = buildPlan(progress({ reviews }), TODAY);
    expect(plan.reviewCount).toBe(MAX_REVIEWS);
    expect(plan.items.slice(0, MAX_REVIEWS).every((i) => i.kind === "review" && i.question.label?.startsWith("Powtórka"))).toBe(true);
    expect(plan.items.slice(MAX_REVIEWS).some((i) => i.kind === "review")).toBe(false);
  });

  it("ten sam dzień = ten sam plan; kolejna runda = inne zadania", () => {
    const a = buildPlan(progress(), TODAY).items.map((i) => i.question.id);
    const b = buildPlan(progress(), TODAY).items.map((i) => i.question.id);
    const next = buildPlan(progress({ planDays: { [TODAY]: 1 } }), TODAY).items.map((i) => i.question.id);
    expect(a).toEqual(b);
    expect(next).not.toEqual(a);
  });

  it("seria planu liczy dni z rzędu (dziś albo do wczoraj)", () => {
    expect(planStreak(progress({ planDays: { "2026-11-08": 1, "2026-11-09": 2 } }), TODAY)).toBe(2);
    expect(planStreak(progress({ planDays: { "2026-11-08": 1, "2026-11-09": 1, [TODAY]: 1 } }), TODAY)).toBe(3);
    expect(planStreak(progress({ planDays: { "2026-11-07": 1 } }), TODAY)).toBe(0);
  });

  it("najdłuższa seria planu (do odznaki) liczy też dawne serie", () => {
    const planDays = { "2026-10-01": 1, "2026-10-02": 1, "2026-10-03": 1, "2026-10-10": 1, "2026-10-11": 1 };
    expect(longestPlanStreak(progress({ planDays }))).toBe(3);
  });
});
