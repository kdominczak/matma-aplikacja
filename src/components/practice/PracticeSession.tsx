"use client";

import { useState } from "react";
import Link from "next/link";
import ClosedAnswer, { type ClosedState } from "@/components/practice/ClosedAnswer";
import OpenAnswer, { type OpenState } from "@/components/practice/OpenAnswer";
import ExplainSheet from "@/components/quiz/ExplainSheet";
import type { ScratchItem, ScratchTemplate } from "@/components/scratch/ScratchBoard";
import TaskScratch from "@/components/scratch/TaskScratch";
import FormulaList from "@/components/topic/FormulaList";
import BottomSheet from "@/components/ui/BottomSheet";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { formulaGroup, getDifficulty, getTopic, practiceTasks, type PracticeTask } from "@/data/topics";
import { matchesAnswer } from "@/lib/calc";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import { savePracticeTask, useProgress } from "@/lib/progress";
import type { PracticeRecord } from "@/types/progress";

type Filter = "all" | "closed" | "open";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Wszystkie" },
  { id: "closed", label: "Zamknięte" },
  { id: "open", label: "Otwarte" },
];

/** Stan zadania na ekranie (odpowiedź w toku, podpowiedzi). */
interface TaskUi {
  closed: ClosedState;
  open: OpenState;
  hints: number;
}

const EMPTY_UI: TaskUi = { closed: { checked: false }, open: { input: "", steps: [], saved: false }, hints: 0 };

function status(record: PracticeRecord | undefined) {
  if (!record) return "new";
  if (record.points === record.maxPoints) return "solved";
  return record.points > 0 ? "partial" : "wrong";
}

const PILL: Record<ReturnType<typeof status>, string> = {
  new: "bg-subtle text-muted",
  solved: "bg-emerald-500 text-white",
  partial: "bg-amber-400 text-white",
  wrong: "bg-rose-500 text-white",
};

/** Zadania z jednego działu – jak arkusz: nawigator zadań, treść z brudnopisem, odpowiedź zamknięta lub otwarta. */
export default function PracticeSession({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!;
  const allTasks = practiceTasks(topic);
  const groups = [formulaGroup(topic)];
  const progress = useProgress();

  const [filter, setFilter] = useState<Filter>("all");
  const [currentId, setCurrentId] = useState(allTasks[0].id);
  const [ui, setUi] = useState<Record<string, TaskUi>>({});
  const [notes, setNotes] = useState<Record<string, ScratchItem[]>>({});
  const [template, setTemplate] = useState<ScratchTemplate>("grid");
  const [panel, setPanel] = useState<"formulas" | "explain" | null>(null);

  const tasks = allTasks.filter((t) => filter === "all" || t.kind === filter);
  const task = tasks.find((t) => t.id === currentId) ?? tasks[0];
  const index = tasks.indexOf(task);
  const state = ui[task.id] ?? EMPTY_UI;
  const prompt = task.kind === "closed" ? task.question.prompt : task.task.prompt;
  const figure = task.kind === "closed" ? task.question.figure : task.task.figure;
  const hints = (task.kind === "closed" ? task.question.hints : task.task.hints) ?? [];
  const solvedCount = allTasks.filter((t) => status(progress?.practice[t.id]) === "solved").length;
  const next = index + 1 < tasks.length ? () => go(tasks[index + 1]) : null;

  function patch(change: Partial<TaskUi>) {
    setUi((all) => ({ ...all, [task.id]: { ...(all[task.id] ?? EMPTY_UI), ...change } }));
  }

  function go(target: PracticeTask) {
    setCurrentId(target.id);
    setPanel(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(points: number, verified: boolean, chosen?: ClosedState["selected"]) {
    await savePracticeTask({
      taskId: task.id,
      topicId: topic.id,
      difficulty: task.difficulty,
      kind: task.kind,
      maxPoints: task.points,
      points,
      chosen,
      verified,
    });
  }

  async function checkClosed() {
    if (task.kind !== "closed" || !state.closed.selected) return;
    const correct = state.closed.selected === task.question.correct;
    if (correct) hapticSuccess();
    else hapticError();
    patch({ closed: { ...state.closed, checked: true } });
    await save(correct ? 1 : 0, true, state.closed.selected);
  }

  async function checkOpen() {
    if (task.kind !== "open") return;
    const correct = matchesAnswer(state.open.input, task.task.answers);
    if (correct) {
      hapticSuccess();
      const opened = { ...state.open, verdict: "correct" as const, saved: true };
      patch({ open: opened });
      await save(task.points, true);
    } else {
      hapticError();
      patch({ open: { ...state.open, verdict: "wrong", steps: [], saved: false } });
    }
  }

  async function revealOpen() {
    patch({ open: { ...state.open, verdict: "revealed", saved: true } });
    await save(0, false);
  }

  async function saveSelfAssessment(points: number) {
    patch({ open: { ...state.open, saved: true } });
    await save(points, false);
  }

  const level = getDifficulty(task.difficulty);

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface pt-[env(safe-area-inset-top)]">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur-lg">
        <div className="mx-auto w-full max-w-6xl px-4 pt-3 pb-3 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Link href="/zadania" aria-label="Wróć do listy działów" className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-faint hover:text-ink">
              <Icon name="close" className="h-6 w-6" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">{topic.title}</p>
              <p className="text-xs font-semibold text-muted">
                Rozwiązane {solvedCount}/{allTasks.length}
              </p>
            </div>
            <button
              onClick={() => setPanel("formulas")}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-sm font-bold text-brand shadow-card transition-colors hover:border-brand/40"
            >
              <Icon name="book" className="h-4 w-4" />
              Wzory
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-xl bg-subtle p-0.5" role="radiogroup" aria-label="Rodzaj zadań">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  role="radio"
                  aria-checked={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${filter === f.id ? "bg-card text-ink shadow-card" : "text-muted"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <nav className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5" aria-label="Zadania">
              {tasks.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => go(t)}
                  aria-current={t.id === task.id ? "step" : undefined}
                  aria-label={`Zadanie ${i + 1} (${t.kind === "closed" ? "zamknięte" : "otwarte"})`}
                  className={`flex h-11 min-w-11 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-extrabold transition-all ${
                    PILL[status(progress?.practice[t.id])]
                  } ${t.id === task.id ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
                >
                  {i + 1}
                  {t.kind === "open" && <span className="ml-0.5 text-[11px] opacity-80">O</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main
        key={task.id}
        className="mx-auto grid w-full max-w-6xl flex-1 animate-fade-in grid-cols-1 content-start gap-5 px-4 pt-5 pb-10 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-8"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
            <span className="text-faint">Zadanie {index + 1}</span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                task.kind === "closed" ? "bg-brand-soft text-brand" : "bg-violet-500/15 text-violet-600 dark:text-violet-300"
              }`}
            >
              {task.kind === "closed" ? "Zamknięte" : "Otwarte"} · {task.points} pkt
            </span>
            <span className="rounded-full bg-subtle px-2.5 py-1 text-muted">{level.label}</span>
            {status(progress?.practice[task.id]) === "solved" && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Icon name="checkCircle" className="h-3.5 w-3.5" /> Rozwiązane
              </span>
            )}
          </div>

          <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-7">
            <p className="text-lg leading-relaxed font-semibold text-ink lg:text-xl">
              <MathText text={prompt} />
            </p>
            {figure && (
              <div className="mt-4 rounded-2xl bg-subtle/60 p-3">
                <FunctionPlot plot={figure} />
              </div>
            )}
            {hints.length > 0 && (
              <div className="mt-4">
                {state.hints < hints.length && (
                  <button
                    onClick={() => patch({ hints: state.hints + 1 })}
                    className="flex min-h-11 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400"
                  >
                    <Icon name="bulb" className="h-4 w-4" />
                    Podpowiedź {state.hints + 1}/{hints.length}
                  </button>
                )}
                {state.hints > 0 && (
                  <ol className="mt-3 flex flex-col gap-2">
                    {hints.slice(0, state.hints).map((hint, i) => (
                      <li key={i} className="flex gap-2.5 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-extrabold text-white">
                          {i + 1}
                        </span>
                        <MathText text={hint} />
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </section>

          <TaskScratch
            prompt={prompt}
            items={notes[task.id] ?? []}
            onChange={(items) => setNotes((n) => ({ ...n, [task.id]: items }))}
            template={template}
            onTemplateChange={setTemplate}
            formulaGroups={groups}
          />
        </div>

        <div className="lg:pt-9">
          {task.kind === "closed" ? (
            <ClosedAnswer
              question={task.question}
              state={state.closed}
              onChange={(closed) => patch({ closed })}
              onCheck={checkClosed}
              onExplain={() => setPanel("explain")}
              onNext={next}
            />
          ) : (
            <OpenAnswer
              task={task.task}
              state={state.open}
              onChange={(open) => patch({ open })}
              onCheck={checkOpen}
              onReveal={revealOpen}
              onSaveSelfAssessment={saveSelfAssessment}
              onNext={next}
            />
          )}
        </div>
      </main>

      {panel === "formulas" && (
        <BottomSheet title={`Wzory · ${topic.title}`} onClose={() => setPanel(null)}>
          <FormulaList formulas={groups[0].formulas} columns />
        </BottomSheet>
      )}

      {panel === "explain" && task.kind === "closed" && state.closed.selected && (
        <ExplainSheet question={task.question} chosen={state.closed.selected} onClose={() => setPanel(null)} />
      )}
    </div>
  );
}
