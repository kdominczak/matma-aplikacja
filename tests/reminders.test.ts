// Przypomnienia o planie: kiedy i z jaką treścią – bez spamowania ucznia, który już się dziś uczył.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_REMINDER, planReminders, REMINDER_DAYS } from "@/lib/reminders";
import type { Progress } from "@/types/progress";

function progress(activity: string[] = []): Progress {
  return {
    activityByDay: Object.fromEntries(activity.map((d) => [d, 5])),
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

const ON = { ...DEFAULT_REMINDER, enabled: true, hour: 19, minute: 0 };

describe("planReminders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function at(iso: string) {
    const now = new Date(iso);
    vi.setSystemTime(now);
    return now;
  }

  it("wyłączone → nic", () => {
    expect(planReminders(progress(), DEFAULT_REMINDER, at("2026-11-10T08:00:00"))).toEqual([]);
  });

  it("rano bez nauki: dziś o 19:00 i kolejne dni, razem 7 przypomnień", () => {
    const list = planReminders(progress(), ON, at("2026-11-10T08:00:00"));
    expect(list).toHaveLength(REMINDER_DAYS);
    expect(list[0].at.getHours()).toBe(19);
    expect(list[0].at.getDate()).toBe(10);
    expect(list.at(-1)!.at.getDate()).toBe(16);
    expect(new Set(list.map((r) => r.id)).size).toBe(REMINDER_DAYS);
  });

  it("po nauce dziś – bez dzisiejszego przypomnienia, jutro o serii", () => {
    const list = planReminders(progress(["2026-11-08", "2026-11-09", "2026-11-10"]), ON, at("2026-11-10T08:00:00"));
    expect(list).toHaveLength(REMINDER_DAYS - 1);
    expect(list[0].at.getDate()).toBe(11);
    expect(list[0].title).toBe("Twoja seria: 3 dni");
  });

  it("seria zagrożona dziś: przypomnienie mówi o serii (do wczoraj)", () => {
    const list = planReminders(progress(["2026-11-08", "2026-11-09"]), ON, at("2026-11-10T08:00:00"));
    expect(list[0].title).toBe("Twoja seria: 2 dni");
    expect(list[0].body).toContain("nie przerywaj");
    // pojutrze seria już by przepadła – łagodniejsza treść z dniami do matury
    expect(list[2].title).toBe("Wracamy do matmy?");
    expect(list[2].body).toMatch(/Do matury \d+ dni/);
  });

  it("po godzinie przypomnienia – dzisiejsze pomijamy", () => {
    const list = planReminders(progress(), ON, at("2026-11-10T20:30:00"));
    expect(list[0].at.getDate()).toBe(11);
    expect(list).toHaveLength(REMINDER_DAYS - 1);
  });

  it("bez serii: zachęta do planu, bez liczby dni serii", () => {
    const list = planReminders(progress(), ON, at("2026-11-10T08:00:00"));
    expect(list[0].title).toBe("Plan na dziś czeka");
    expect(list.every((r) => !r.title.includes("seria"))).toBe(true);
  });
});
