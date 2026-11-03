"use client";

import { useState } from "react";
import PhotoGrading from "@/components/exam/PhotoGrading";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import type { PracticeTask } from "@/data/topics";
import { AI_ENABLED } from "@/lib/ai-config";
import type { Grading } from "@/lib/ai-grading";
import { applyAssessment, needsAssessment } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import type { ExamSheet, ExamTaskResult, StepAssessment } from "@/types/exam";
import type { Level } from "@/types/topic";

type OpenTask = PracticeTask & { kind: "open" };

/**
 * Po „Zakończ”, przed wynikiem: ocena kroków zadań otwartych bez poprawnego wyniku końcowego – jak egzaminator
 * z zasadami oceniania CKE. Uczeń zaznacza kroki, które ma w swoim rozwiązaniu (na kartce albo w brudnopisie).
 * Z Premium – ocena ze zdjęcia kartki przez AI (PhotoGrading): punkty i uzasadnienia trafiają do kroków, a uczeń
 * może je jeszcze zmienić (wtedy ocena staje się samooceną). Częściowe punkty nie zmieniają statystyk
 * (status „partial”, nie „correct”). Można pominąć – zostaje sam wynik końcowy.
 */
export default function ExamAssessment({
  exam,
  results,
  onDone,
}: {
  exam: ExamSheet;
  results: ExamTaskResult[];
  onDone: (results: ExamTaskResult[]) => void;
}) {
  const pending = results.flatMap((result) => {
    const task = exam.tasks.find((t) => t.id === result.taskId);
    return task && needsAssessment(task, result) ? [{ task, result }] : [];
  });
  const [assessments, setAssessments] = useState<Record<string, StepAssessment>>({});

  function assessed(): ExamTaskResult[] {
    return results.map((result) => {
      const item = pending.find((p) => p.result.taskId === result.taskId);
      if (!item) return result;
      return applyAssessment(item.task, result, assessments[result.taskId] ?? { by: "self", steps: [] });
    });
  }
  const gained = assessed().reduce((sum, r, i) => sum + r.points - results[i].points, 0);

  return (
    <div className="min-h-dvh bg-surface pt-[env(safe-area-inset-top)] pb-[max(7rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-3xl animate-fade-in flex-col gap-5 px-4 pt-6 sm:px-6">
        <header>
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand">{exam.title} · sprawdzanie</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Oceń swoje rozwiązania</h1>
          <p className="mt-2 text-sm text-muted">
            Na maturze za zadanie otwarte dostajesz punkty za kolejne kroki – także bez poprawnego wyniku. Zaznacz kroki, które naprawdę masz w
            rozwiązaniu (na kartce albo w brudnopisie)
            {AI_ENABLED ? " albo zrób zdjęcie kartki – korepetytor AI oceni ją według schematu" : ""}. Bądź surowym egzaminatorem – tylko wtedy
            wynik coś Ci powie.
          </p>
        </header>

        <ol className="flex flex-col gap-4">
          {pending.map(({ task, result }) => (
            <AssessCard
              key={task.id}
              task={task}
              level={exam.level}
              result={result}
              assessment={assessments[task.id]}
              onChange={(next) => setAssessments((all) => ({ ...all, [task.id]: next }))}
            />
          ))}
        </ol>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 pt-3 sm:flex-row sm:px-6">
          <button
            onClick={() => {
              hapticTap();
              onDone(assessed());
            }}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark"
          >
            Pokaż wynik{gained > 0 ? ` (+${gained} pkt za kroki)` : ""} <Icon name="arrow" className="h-4 w-4" />
          </button>
          <button onClick={() => onDone(results)} className="min-h-11 rounded-2xl px-4 text-sm font-bold text-muted hover:text-ink">
            Pomiń – licz tylko wyniki końcowe
          </button>
        </div>
      </div>
    </div>
  );
}

function AssessCard({
  task,
  level,
  result,
  assessment,
  onChange,
}: {
  task: OpenTask;
  /** Poziom arkusza – AI ocenia według zasad tego poziomu (w arkuszu rozszerzonym także zadania z podstawy). */
  level: Level;
  result: ExamTaskResult;
  assessment: StepAssessment | undefined;
  onChange: (assessment: StepAssessment) => void;
}) {
  const rubric = task.task.solution;
  const steps = rubric.map((_, i) => assessment?.steps[i] ?? 0);
  const points = steps.reduce((sum, p) => sum + p, 0);
  const byAi = assessment?.by === "ai";

  // ręczna zmiana po ocenie AI = samoocena (bez uzasadnień AI), żeby podsumowanie nie przypisywało jej AI
  function toggle(i: number) {
    const next = steps.map((p, j) => (j === i ? (p > 0 ? 0 : rubric[j].points) : p));
    onChange({ by: "self", steps: next });
  }

  function graded(grading: Grading) {
    onChange({ by: "ai", steps: grading.steps.map((p, i) => Math.max(0, Math.min(rubric[i].points, Math.round(p)))), reasons: grading.reasons });
  }

  return (
    <li className="card flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-extrabold text-ink">Zadanie {result.number}</p>
        <p className="text-sm font-extrabold text-brand tabular-nums">
          {points}/{task.points} pkt{byAi ? " · ocena AI" : ""}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-body">
        <MathText text={task.task.prompt} />
      </p>
      {task.task.figure && (
        <div className="rounded-2xl bg-subtle/60 p-3">
          <FunctionPlot plot={task.task.figure} />
        </div>
      )}
      <p className="text-sm text-body">
        Twój wynik: <strong className="text-ink">{result.given ?? "– (brak)"}</strong> · poprawny:{" "}
        <strong className="text-emerald-600 dark:text-emerald-400">{task.task.answers[0].replace(";", "; ")}</strong>
      </p>
      {AI_ENABLED && <PhotoGrading task={task.task} level={level} onGraded={graded} />}
      <fieldset>
        <legend className="mb-2 text-xs font-extrabold uppercase tracking-widest text-faint">
          {byAi ? "Ocena korepetytora AI – możesz ją poprawić" : "Które kroki masz w rozwiązaniu?"}
        </legend>
        <ul className="flex flex-col gap-2">
          {rubric.map((step, i) => (
            <li key={i}>
              <label
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                  steps[i] > 0 ? "border-emerald-500/40 bg-emerald-500/5" : "border-line"
                }`}
              >
                <input type="checkbox" checked={steps[i] > 0} onChange={() => toggle(i)} className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600" />
                <span className="min-w-0 flex-1">
                  <MathText text={step.step} className="text-sm text-body" />
                  {byAi && assessment?.reasons?.[i] && <span className="mt-1 block text-xs text-muted">AI: {assessment.reasons[i]}</span>}
                </span>
                <span className="shrink-0 text-xs font-extrabold text-brand">
                  {byAi ? `${steps[i]}/${step.points}` : `+${step.points}`} pkt
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </li>
  );
}
