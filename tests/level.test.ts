// Matura podstawowa i rozszerzona: wagi działów z arkuszy CKE, cel, szacowany wynik i plan liczone dla poziomu.
import { describe, expect, it } from "vitest";
import { EXTENDED_BLUEPRINTS } from "@/data/blueprints-extended";
import { allTopics, extendedTopics, topics } from "@/data/topics";
import { currentEstimate } from "@/lib/estimate";
import { LEVEL_POINTS, topicExamPoints } from "@/lib/exam-weights";
import { goalPercent, goalPoints, topicsForGoal } from "@/lib/goal";
import { activeLevel, levelTarget, studentLevels } from "@/lib/level";
import { buildPlan } from "@/lib/planner";
import { dayKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";

function emptyProgress(): Progress {
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
  };
}

const sum = (level: "podstawowy" | "rozszerzony") => allTopics.reduce((s, t) => s + topicExamPoints(t, level), 0);

describe("arkusze rozszerzone z „Zasad oceniania” CKE", () => {
  it("każdy układ ma 50 pkt, same zadania otwarte, kody wymagań z działu pozycji", () => {
    for (const b of EXTENDED_BLUEPRINTS) {
      expect(b.slots.reduce((s, x) => s + x.points, 0), b.id).toBe(50);
      expect(b.slots.every((x) => x.format === "extended")).toBe(true);
      for (const slot of b.slots) expect(slot.requirements.some((r) => r.startsWith(`${slot.sections.at(-1)}.`)), slot.number).toBe(true);
    }
  });
});

describe("wagi działów na poziomie", () => {
  it("na obu poziomach działy sumują się do 50 pkt", () => {
    expect(sum("podstawowy")).toBeCloseTo(LEVEL_POINTS.podstawowy, 6);
    expect(sum("rozszerzony")).toBeCloseTo(LEVEL_POINTS.rozszerzony, 6);
  });

  it("działy rozszerzenia nie mają wagi na podstawie, a na rozszerzeniu – największe z pochodnej i trygonometrii", () => {
    for (const t of extendedTopics) expect(topicExamPoints(t, "podstawowy"), t.id).toBe(0);
    const top = [...allTopics].sort((a, b) => topicExamPoints(b, "rozszerzony") - topicExamPoints(a, "rozszerzony")).slice(0, 2).map((t) => t.id);
    expect(top.sort()).toEqual(["rz-pochodna", "rz-trygonometria"]);
  });

  it("rozszerzenie liczy też podstawę (wymagania bez „R” w arkuszu rozszerzonym)", () => {
    expect(topics.filter((t) => topicExamPoints(t, "rozszerzony") > 0).length).toBeGreaterThan(5);
  });
});

describe("cel na rozszerzeniu", () => {
  it("bez progu zdania: suwak od 5 pkt; procent ↔ punkty", () => {
    expect(goalPoints(0, "rozszerzony")).toBe(5);
    expect(goalPoints(60, "rozszerzony")).toBe(30);
    expect(goalPercent(30, "rozszerzony")).toBe(60);
    expect(goalPoints(0)).toBe(15);
  });

  it("działy do celu: niski cel – tylko część, wysoki – również działy rozszerzenia", () => {
    const low = topicsForGoal(20, "rozszerzony");
    const high = topicsForGoal(100, "rozszerzony");
    expect(low.length).toBeLessThan(high.length);
    expect(high.some((t) => t.level === "rozszerzony")).toBe(true);
    expect(topicsForGoal(100).some((t) => t.level === "rozszerzony")).toBe(false);
  });
});

describe("poziom ucznia", () => {
  it("starszy zapis bez wyboru – tylko podstawa; przełącznik działa tylko na zdawane poziomy", () => {
    expect(studentLevels({})).toEqual(["podstawowy"]);
    expect(studentLevels({ levels: ["rozszerzony", "podstawowy"] })).toEqual(["podstawowy", "rozszerzony"]);
    expect(activeLevel({ levels: ["podstawowy"] }, { activeLevel: "rozszerzony" })).toBe("podstawowy");
    expect(activeLevel({ levels: ["podstawowy", "rozszerzony"] }, { activeLevel: "rozszerzony" })).toBe("rozszerzony");
    expect(activeLevel({ levels: ["rozszerzony"] }, null)).toBe("rozszerzony");
    expect(levelTarget({ target: 60 }, "rozszerzony")).toBe(30);
    expect(levelTarget({ target: 60, targetExtended: 80 }, "rozszerzony")).toBe(80);
  });
});

describe("szacowany wynik i plan na rozszerzeniu", () => {
  const solvedPochodna = (): Progress => {
    const p = emptyProgress();
    const today = dayKey();
    p.statsByDay = { [today]: { "rz-pochodna/podstawowy": [10, 10], "rz-pochodna/sredni": [10, 10], "rz-pochodna/zaawansowany": [10, 10] } };
    p.stats.answered = 30;
    return p;
  };

  it("opanowana pochodna podnosi wynik rozszerzony, a podstawowego nie", () => {
    const p = solvedPochodna();
    expect(currentEstimate(p, "rozszerzony")).toBeGreaterThan(currentEstimate(emptyProgress(), "rozszerzony"));
    expect(currentEstimate(p, "podstawowy")).toBe(currentEstimate(emptyProgress(), "podstawowy"));
  });

  it("plan na rozszerzeniu wybiera dział ważny na maturze rozszerzonej", () => {
    const plan = buildPlan(emptyProgress(), dayKey(), "rozszerzony");
    expect(plan.focus).not.toBeNull();
    expect(topicExamPoints(plan.focus!.topic, "rozszerzony")).toBeGreaterThan(0);
    expect(plan.items.length).toBeGreaterThan(0);
  });
});
