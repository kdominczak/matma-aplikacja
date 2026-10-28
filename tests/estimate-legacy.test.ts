// Zapis sprzed dziennej historii skuteczności: po wczytaniu historia powstaje z sum, a szacowany wynik
// liczy się tak samo jak ze skuteczności łącznej.
import { describe, expect, it } from "vitest";
import { getTopic } from "@/data/topics";
import { currentEstimate, estimateHistory } from "@/lib/estimate";
import { topicExamPoints } from "@/lib/exam-weights";
import { EVIDENCE } from "@/lib/mastery";
import * as P from "@/lib/progress";

const day = (offset: number) => P.dayKey(P.shiftDays(new Date(), -offset));

// zapis istnieje, zanim moduł postępu go wczyta
localStorage.setItem(
  "CapacitorStorage.progress.v2",
  JSON.stringify({ tests: {}, target: 60, activityByDay: { [day(4)]: 12 }, topicStats: { "ciagi/sredni": { answered: 12, correct: 9, lastAnswered: day(4) } } }),
);

describe("stary zapis bez historii dziennej", () => {
  it("skuteczność trafia na dzień ostatniej odpowiedzi", async () => {
    const progress = await P.readProgress();
    expect(progress.statsByDay).toEqual({ [day(4)]: { "ciagi/sredni": [12, 9] } });
  });

  it("szacowany wynik uwzględnia dawną skuteczność, wykres rośnie od tego dnia", async () => {
    const progress = await P.readProgress();
    const expected = Math.round(((topicExamPoints(getTopic("ciagi")!) * 0.35 * (9 / (12 + EVIDENCE))) / 50) * 100);
    expect(currentEstimate(progress)).toBe(expected);
    const byDay = Object.fromEntries(estimateHistory(progress).map((h) => [h.day, h.value]));
    expect(byDay[day(5)]).toBe(0);
    expect(byDay[day(4)]).toBe(expected);
  });
});
