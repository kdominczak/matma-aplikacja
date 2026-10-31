// Jakość treści: każde zadanie musi się poprawnie wyrenderować, mieć spójny klucz i punktację.
// Błędny klucz w aplikacji maturalnej kosztuje zaufanie ucznia – ten test łapie błędy techniczne
// (merytorykę i tak musi sprawdzić nauczyciel).
import { readFileSync } from "node:fs";
import katex from "katex";
import { describe, expect, it } from "vitest";
import { allQuestionRefs, findQuestion, formulaGroup, practiceTasks, theoryChecks, topics } from "@/data/topics";
import { matchesAnswer } from "@/lib/calc";
import { questionKeysSql } from "../scripts/question-keys";

function texErrors(text: string, display = false): string[] {
  const parts = display ? [text] : (text.match(/\$[^$]+\$/g) ?? []).map((m) => m.slice(1, -1));
  const errors: string[] = [];
  for (const part of parts) {
    try {
      katex.renderToString(part, { throwOnError: true, displayMode: display });
    } catch (error) {
      errors.push(`${part}: ${(error as Error).message}`);
    }
  }
  return errors;
}

describe("treść zadań", () => {
  it("każdy dział ma zadania do zakładki „Zadania”", () => {
    const empty = topics.filter((t) => practiceTasks(t).length === 0).map((t) => t.id);
    expect(empty).toEqual([]);
  });

  it("identyfikatory zadań są unikalne w całej aplikacji", () => {
    const ids = [...allQuestionRefs().map((r) => r.question.id), ...topics.flatMap((t) => practiceTasks(t).filter((x) => x.kind === "open").map((x) => x.id))];
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  for (const topic of topics) {
    describe(topic.title, () => {
      const tasks = practiceTasks(topic);

      it("wzory i treść renderują się w KaTeX bez błędów", () => {
        const errors = formulaGroup(topic).formulas.flatMap((f) => texErrors(f.tex, true));
        for (const task of tasks) {
          if (task.kind === "closed") {
            const q = task.question;
            for (const text of [q.prompt, q.explanation, ...(q.hints ?? []), ...Object.values(q.options)]) errors.push(...texErrors(text));
          } else {
            const t = task.task;
            for (const text of [t.prompt, ...(t.hints ?? []), ...t.solution.map((s) => s.step)]) errors.push(...texErrors(text));
          }
        }
        expect(errors).toEqual([]);
      });

      it("teoria, przykłady, haczyki i pułapki zadań renderują się w KaTeX", () => {
        const content = topic.content;
        const texts = [
          ...(content?.theory.flatMap((s) => [s.title, s.body, s.example?.prompt ?? "", ...(s.example?.solution.split("\n") ?? [])]) ?? []),
          ...(content?.traps ?? []),
          ...tasks.flatMap((t) => (t.kind === "closed" && t.question.trap ? [t.question.trap] : [])),
        ];
        expect(texts.flatMap((text) => texErrors(text))).toEqual([]);
      });

      it("bez znaków sterujących (zgubiony backslash w LaTeX, np. form feed zamiast \\frac)", () => {
        // poza nową linią (kroki przykładów, zdania P/F) żaden tekst nie może zawierać znaków sterujących
        const strings: string[] = [];
        const collect = (value: unknown) => {
          if (typeof value === "string") strings.push(value);
          else if (value && typeof value === "object") Object.values(value).forEach(collect);
        };
        collect({ content: topic.content, tasks });
        expect(strings.filter((s) => /[\x00-\x09\x0b-\x1f]/.test(s))).toEqual([]);
      });

      it("zadania zamknięte: 4 różne odpowiedzi, poprawna wśród nich, wyjaśnienie, klucz w indeksie", () => {
        for (const task of tasks) {
          if (task.kind !== "closed") continue;
          const q = task.question;
          expect(new Set(Object.values(q.options)).size, q.id).toBe(4);
          expect(Object.keys(q.options), q.id).toContain(q.correct);
          expect(q.explanation.trim().length, q.id).toBeGreaterThan(0);
          expect(findQuestion(q.id)?.question.correct, q.id).toBe(q.correct);
        }
      });

      it("zadania otwarte: punkty schematu sumują się do maksimum, odpowiedzi da się sprawdzić", () => {
        for (const task of tasks) {
          if (task.kind !== "open") continue;
          const t = task.task;
          expect(t.solution.reduce((sum, s) => sum + s.points, 0), t.id).toBe(t.points);
          expect(t.answers.length, t.id).toBeGreaterThan(0);
          for (const answer of t.answers) expect(matchesAnswer(answer, t.answers), `${t.id}: ${answer}`).toBe(true);
        }
      });

      it("pytania przy krokach teorii: KaTeX, 4 różne odpowiedzi, wyjaśnienie, klucz w indeksie", () => {
        for (const q of theoryChecks(topic)) {
          const texts = [q.prompt, q.explanation, q.trap ?? "", ...(q.hints ?? []), ...Object.values(q.options)];
          expect(texts.flatMap((text) => texErrors(text)), q.id).toEqual([]);
          expect(new Set(Object.values(q.options)).size, q.id).toBe(4);
          expect(q.explanation.trim().length, q.id).toBeGreaterThan(0);
          expect(findQuestion(q.id)?.question.correct, q.id).toBe(q.correct);
        }
      });
    });
  }

  it("seed kluczy w repo jest aktualny (inaczej uruchom npm run db:keys)", () => {
    const file = readFileSync("supabase/seed/question_keys.sql", "utf8").replace(/\r\n/g, "\n");
    expect(file).toBe(questionKeysSql());
  });
});
