// Korepetytor: „Twoje zadania” na starcie – ostatni arkusz, Pudełko porażek, najsłabszy dział (a nie ogólne tematy).
import { describe, expect, it } from "vitest";
import { allQuestionRefs, topics } from "@/data/topics";
import { EXAMS } from "@/data/exams";
import { tutorSuggestions } from "@/lib/tutor-suggestions";
import type { ExamAttempt } from "@/types/exam";
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

describe("tutorSuggestions", () => {
  it("nowy uczeń – nic (ekran pokazuje wtedy tylko zdjęcie i wklejanie)", () => {
    expect(tutorSuggestions(progress())).toEqual([]);
  });

  it("Pudełko porażek: najnowsze pomyłki z treścią i wybraną literą, tryb „pełne rozwiązanie”", () => {
    const [a, b, c] = allQuestionRefs();
    const out = tutorSuggestions(
      progress({
        mistakes: {
          [a.question.id]: { lastWrong: "2026-10-01", count: 1, chosen: "A" },
          [b.question.id]: { lastWrong: "2026-10-20", count: 1, chosen: "B" },
          [c.question.id]: { lastWrong: "2026-10-10", count: 1, chosen: "C" },
        },
      }),
    );
    expect(out.map((s) => s.id)).toEqual([`mistake-${b.question.id}`, `mistake-${c.question.id}`]);
    expect(out[0].style).toBe("rozwiazanie");
    expect(out[0].source).toContain("Pudełko porażek");
    expect(out[0].text).toContain("Nie rozumiem dlaczego");
  });

  it("ostatni arkusz: pierwsze zadanie otwarte bez kompletu – z wynikiem ucznia, tryb „naprowadź”", () => {
    const exam = EXAMS.find((e) => e.kind === "probny" && e.tasks.some((t) => t.kind === "open"))!;
    const task = exam.tasks.find((t) => t.kind === "open")!;
    const attempt: ExamAttempt = {
      id: "a1",
      examId: exam.id,
      startedAt: "2026-10-28T10:00:00Z",
      finishedAt: "2026-10-28T12:00:00Z",
      durationSec: 3600,
      points: 0,
      maxPoints: 50,
      percent: 0,
      results: [{ taskId: task.id, number: 7, kind: "open", status: "wrong", points: 0, maxPoints: task.points, given: "12345" }],
    };
    const [first] = tutorSuggestions(progress(), [attempt]);
    expect(first.id).toBe(`exam-${task.id}`);
    expect(first.source).toBe(`${exam.title} · zad. 7`);
    expect(first.style).toBe("naprowadz");
    expect(first.text).toContain("Mój wynik: 12345");
  });

  it("najsłabszy dział – tylko z kilkoma odpowiedziami i niskim opanowaniem", () => {
    const topic = topics.find((t) => t.content)!;
    const weak = progress({ topicStats: { [`${topic.id}/podstawowy`]: { answered: 6, correct: 1 } } as Progress["topicStats"] });
    expect(tutorSuggestions(weak).at(-1)).toMatchObject({ id: `topic-${topic.id}`, title: topic.title, style: "rozwiazanie" });
    const few = progress({ topicStats: { [`${topic.id}/podstawowy`]: { answered: 1, correct: 0 } } as Progress["topicStats"] });
    expect(tutorSuggestions(few)).toEqual([]);
  });
});
