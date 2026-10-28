// Szacowany wynik: liczy wszystkie zadania (nie tylko testy działów), samoocena nie podnosi wyniku,
// a wykres w czasie odtwarza się z dziennej historii skuteczności.
import { describe, expect, it } from "vitest";
import { DIFFICULTIES, getTopic, practiceTasks, topics } from "@/data/topics";
import { currentEstimate, estimateHistory } from "@/lib/estimate";
import { topicExamPoints } from "@/lib/exam-weights";
import { EVIDENCE, expectedScore } from "@/lib/mastery";
import * as P from "@/lib/progress";
import { mergeProgress } from "@/lib/progress-merge";
import type { Progress } from "@/types/progress";

const day = (offset: number) => P.dayKey(P.shiftDays(new Date(), -offset));

function progress(patch: Partial<Progress> = {}): Progress {
  return {
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
    ...patch,
  };
}

/** Każdy poziom każdego działu: `answered` odpowiedzi, z czego `correct` poprawnych – jednego dnia. */
function everywhere(answered: number, correct: number, date = day(0)): Progress {
  const entries = Object.fromEntries(topics.flatMap((t) => DIFFICULTIES.map((d) => [`${t.id}/${d.id}`, [answered, correct] as [number, number]])));
  const topicStats = Object.fromEntries(Object.entries(entries).map(([k, [a, c]]) => [k, { answered: a, correct: c, lastAnswered: date }]));
  return progress({ statsByDay: { [date]: entries }, topicStats });
}

describe("szacowany wynik z całej skuteczności", () => {
  it("nowy uczeń: 0%", () => {
    expect(currentEstimate(progress())).toBe(0);
  });

  it("nie ma już limitu działów z lekcjami: uczeń bezbłędny we wszystkim dochodzi do ponad 90%", () => {
    const perfect = everywhere(30, 30);
    expect(currentEstimate(perfect)).toBeGreaterThanOrEqual(90);
    expect(currentEstimate(everywhere(5, 5))).toBeLessThan(currentEstimate(perfect)); // pewność rośnie z liczbą zadań
  });

  it("skuteczność 50% daje wynik w okolicy połowy, nie więcej", () => {
    const half = currentEstimate(everywhere(40, 20));
    expect(half).toBeGreaterThan(40);
    expect(half).toBeLessThanOrEqual(50);
  });

  it("ostrożność: 5/5 to jeszcze nie pełne opanowanie", () => {
    const ciagi = getTopic("ciagi")!;
    const p = progress({ topicStats: { "ciagi/podstawowy": { answered: 5, correct: 5, lastAnswered: day(0) } } });
    expect(expectedScore(p, ciagi)).toBeCloseTo(0.45 * (5 / (5 + EVIDENCE)), 10);
  });

  it("dział bez lekcji (ciągi) podnosi wynik o swoją wagę na maturze", () => {
    const ciagi = getTopic("ciagi")!;
    const entries = Object.fromEntries(DIFFICULTIES.map((d) => [`ciagi/${d.id}`, [30, 30] as [number, number]]));
    const value = currentEstimate(progress({ statsByDay: { [day(0)]: entries } }));
    expect(value).toBe(Math.round(((topicExamPoints(ciagi) * (30 / 32)) / 50) * 100));
    expect(value).toBeGreaterThan(5);
  });
});

describe("zapis odpowiedzi do skuteczności", () => {
  it("zadania z „Zadań”: zamknięte i otwarte sprawdzone liczą się, samoocena – nie", async () => {
    await P.resetProgress();
    const open = practiceTasks(getTopic("ciagi")!).find((t) => t.kind === "open")!;
    await P.savePracticeTask({ taskId: open.id, topicId: "ciagi", difficulty: open.difficulty, kind: "open", maxPoints: open.points, points: open.points, verified: false });
    let p = await P.readProgress();
    const key = `ciagi/${open.difficulty}`;
    expect(p.topicStats[key]).toMatchObject({ answered: 1, correct: 0 }); // samoocena: odpowiedź jest, poprawnej nie ma
    expect(currentEstimate(p)).toBe(0);

    await P.savePracticeTask({ taskId: open.id, topicId: "ciagi", difficulty: open.difficulty, kind: "open", maxPoints: open.points, points: open.points, verified: true });
    p = await P.readProgress();
    expect(p.topicStats[key]).toMatchObject({ answered: 2, correct: 1 });
    expect(currentEstimate(p)).toBeGreaterThan(0);
  });

  it("arkusz: zadania otwarte też trafiają do skuteczności działu", async () => {
    await P.resetProgress();
    const open = practiceTasks(getTopic("geometria-przestrzenna")!).find((t) => t.kind === "open")!;
    await P.saveExamResult({
      id: "test",
      examId: "probny-1",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      durationSec: 60,
      points: open.points,
      maxPoints: open.points,
      percent: 100,
      results: [{ taskId: open.id, number: 1, kind: "open", status: "correct", points: open.points, maxPoints: open.points, given: "1" }],
    });
    const p = await P.readProgress();
    expect(p.topicStats[`geometria-przestrzenna/${open.difficulty}`]).toMatchObject({ answered: 1, correct: 1 });
  });

  it("historia dzienna sumuje się do skuteczności łącznej", async () => {
    const p = await P.readProgress();
    for (const [key, stat] of Object.entries(p.topicStats)) {
      const fromDays = Object.values(p.statsByDay).reduce((sum, entries) => sum + (entries[key]?.[0] ?? 0), 0);
      expect(fromDays, key).toBe(stat.answered);
    }
  });
});

describe("wykres w czasie", () => {
  const p = progress({
    statsByDay: {
      [day(6)]: { "ciagi/podstawowy": [10, 8] },
      [day(3)]: { "ciagi/podstawowy": [10, 10], "funkcja-kwadratowa/sredni": [8, 6] },
      [day(0)]: { "statystyka/podstawowy": [12, 11] },
    },
  });

  it("wynik rośnie w dniach nauki i stoi w pozostałych; ostatni punkt = bieżący wynik", () => {
    const history = estimateHistory(p);
    const byDay = Object.fromEntries(history.map((h) => [h.day, h.value]));
    expect(byDay[day(7)]).toBe(0);
    expect(byDay[day(6)]).toBeGreaterThan(0);
    expect(byDay[day(5)]).toBe(byDay[day(6)]);
    expect(byDay[day(3)]).toBeGreaterThan(byDay[day(4)]);
    expect(byDay[day(0)]).toBeGreaterThan(byDay[day(1)]);
    expect(history.at(-1)!.value).toBe(currentEstimate(p));
  });

  it("zaliczony test liczy się od dnia zaliczenia", () => {
    const withTest = progress({ tests: { "logarytmy/podstawowy": { stars: 3, correct: 5, total: 5, passedAt: day(2) } } });
    const byDay = Object.fromEntries(estimateHistory(withTest).map((h) => [h.day, h.value]));
    expect(byDay[day(3)]).toBe(0);
    expect(byDay[day(2)]).toBeGreaterThan(0);
  });
});

describe("chmura", () => {
  it("scalanie z chmurą nie podwaja odpowiedzi z tego samego dnia", () => {
    const phone = progress({ statsByDay: { [day(1)]: { "ciagi/podstawowy": [6, 5] }, [day(0)]: { "ciagi/podstawowy": [2, 2] } } });
    const cloud = progress({ statsByDay: { [day(1)]: { "ciagi/podstawowy": [6, 5] }, [day(2)]: { "statystyka/sredni": [4, 3] } } });
    const merged = mergeProgress(phone, cloud, "local");
    expect(merged.statsByDay).toEqual({
      [day(2)]: { "statystyka/sredni": [4, 3] },
      [day(1)]: { "ciagi/podstawowy": [6, 5] },
      [day(0)]: { "ciagi/podstawowy": [2, 2] },
    });
  });
});
