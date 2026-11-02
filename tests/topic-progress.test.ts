// Lekcje bez testów na poziomach: postęp w zadaniach działu i poziomy opanowane w zadaniach (odznaki).
import { describe, expect, it } from "vitest";
import { practiceTasks, theoryChecks, topics } from "@/data/topics";
import { levelState, masteredLevels, topicMasteryRows, topicTaskProgress } from "@/lib/topic-progress";
import { MIN_ANSWERS } from "@/lib/mastery";
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

const topic = topics.find((t) => t.id === "potegi-i-pierwiastki")!;

describe("postęp w zadaniach działu", () => {
  it("liczy zadania rozwiązane w całości, w podziale na trudność", () => {
    const tasks = practiceTasks(topic);
    const [first, second] = tasks;
    const p = progress({
      practice: {
        [first.id]: { points: first.points, maxPoints: first.points, verifiedPoints: first.points } as Progress["practice"][string],
        [second.id]: { points: 0, maxPoints: second.points, verifiedPoints: 0 } as Progress["practice"][string],
      },
    });
    const result = topicTaskProgress(topic, p);
    expect(result.total).toBe(tasks.length);
    expect(result.solved).toBe(1);
    expect(Object.values(result.byDifficulty).reduce((s, d) => s + d.total, 0)).toBe(tasks.length);
    expect(result.byDifficulty[first.difficulty].solved).toBe(1);
    expect(topicTaskProgress(topic, null).solved).toBe(0);
  });
});

describe("poziomy opanowane (odznaki zamiast zaliczonych testów)", () => {
  const stat = (answered: number, correct: number) => ({ answered, correct });

  it("≥ 75% przy kilku odpowiedziach = opanowany; pojedyncze trafienie jeszcze nie", () => {
    const p = progress({
      topicStats: {
        [`${topic.id}/podstawowy`]: stat(10, 9),
        [`${topic.id}/sredni`]: stat(2, 2),
        [`${topic.id}/zaawansowany`]: stat(10, 4),
      } as Progress["topicStats"],
    });
    expect(masteredLevels(p, topic.id)).toBe(1);
  });

  it("dawny zaliczony test dalej się liczy (zdobyte postępy nie znikają), wstępny z testu na start – nie", () => {
    const p = progress({
      tests: {
        [`${topic.id}/podstawowy`]: { stars: 2, correct: 2, total: 3 },
        [`${topic.id}/sredni`]: { stars: 1, correct: 2, total: 3, fromPlacement: true },
      } as Progress["tests"],
    });
    expect(masteredLevels(p, topic.id)).toBe(1);
  });

  it("dział jest opanowany, gdy wszystkie trzy poziomy są opanowane – z samych zadań, bez testu", () => {
    const all = progress({
      topicStats: Object.fromEntries(["podstawowy", "sredni", "zaawansowany"].map((d) => [`${topic.id}/${d}`, stat(12, 11)])) as Progress["topicStats"],
    });
    const [row] = topicMasteryRows(all, [topic]);
    expect(row.mastered).toBe(true);
    expect(row.levels.map((l) => l.state)).toEqual(["mastered", "mastered", "mastered"]);

    const partial = progress({
      topicStats: { [`${topic.id}/podstawowy`]: stat(12, 11), [`${topic.id}/sredni`]: stat(3, 1) } as Progress["topicStats"],
    });
    const [half] = topicMasteryRows(partial, [topic]);
    expect(half.mastered).toBe(false);
    expect(half.levels.map((l) => l.state)).toEqual(["mastered", "progress", "none"]);
  });

  it("mniej niż MIN_ANSWERS odpowiedzi to jeszcze nie opanowanie, nawet przy 100%", () => {
    const p = progress({ topicStats: { [`${topic.id}/podstawowy`]: stat(MIN_ANSWERS - 1, MIN_ANSWERS - 1) } as Progress["topicStats"] });
    expect(levelState(p, topic.id, "podstawowy")).toBe("progress");
  });
});

it("pytania przy krokach teorii trafiają do indeksu pytań (klucze serwera, Pudełko porażek)", async () => {
  const { allQuestionRefs } = await import("@/data/topics");
  const ids = new Set(allQuestionRefs().map((r) => r.question.id));
  for (const t of topics) for (const q of theoryChecks(t)) expect(ids.has(q.id)).toBe(true);
});
