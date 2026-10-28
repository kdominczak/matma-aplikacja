"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { findQuestion, type PracticeTask } from "@/data/topics";
import { formatDuration, PASS_PERCENT, useExamAttempts } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import { addMistakes } from "@/lib/progress";
import type { ExamAttempt, ExamSheet, ExamTaskResult } from "@/types/exam";
import type { OptionKey } from "@/types/quiz";

// wyjaśnienie AI tylko na żądanie – nie obciąża ekranu wyniku
const ExplainSheet = dynamic(() => import("@/components/quiz/ExplainSheet"), { ssr: false });

type Filter = "all" | "wrong" | "skipped";

const STATUS = {
  correct: { icon: "checkCircle", label: "Dobrze", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  wrong: { icon: "close", label: "Źle", style: "bg-rose-500/15 text-rose-600 dark:text-rose-400" },
  skipped: { icon: "more", label: "Bez odpowiedzi", style: "bg-subtle text-muted" },
} as const;

/** Podsumowanie arkusza: wynik, czas, lista zadań z omówieniem i dodawanie błędów do Pudełka porażek. */
export default function ExamSummary({ exam, attempt, onRetry }: { exam: ExamSheet; attempt: ExamAttempt; onRetry: () => void }) {
  const history = useExamAttempts();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [explain, setExplain] = useState<{ task: PracticeTask & { kind: "closed" }; chosen: OptionKey } | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  const passed = attempt.percent >= PASS_PERCENT;
  const count = (status: ExamTaskResult["status"]) => attempt.results.filter((r) => r.status === status).length;
  const previous = history?.filter((a) => a.examId === exam.id && a.id !== attempt.id) ?? [];
  const best = previous.reduce<ExamAttempt | null>((b, a) => (!b || a.percent > b.percent ? a : b), null);

  // do pudełka trafiają błędne zadania zamknięte z bazy aplikacji (pudełko przechowuje wybraną literę)
  const boxable = attempt.results.filter((r) => r.kind === "closed" && r.status === "wrong" && r.given && findQuestion(r.taskId));
  const shown = attempt.results.filter((r) => filter === "all" || r.status === filter);
  const taskById = new Map(exam.tasks.map((t) => [t.id, t]));

  return (
    <div className="min-h-dvh bg-surface pt-[env(safe-area-inset-top)] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-3xl animate-fade-in flex-col gap-6 px-4 pt-6 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card lg:p-8">
          <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
          <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">{exam.title} · wynik</p>
          <div className="relative mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <p className="bg-linear-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent tabular-nums">
              {attempt.percent}%
            </p>
            <p className="pb-2 text-lg font-bold text-white/80">
              {attempt.points}/{attempt.maxPoints} pkt
            </p>
          </div>
          <p className={`relative mt-2 flex items-center gap-2 font-bold ${passed ? "text-emerald-300" : "text-amber-300"}`}>
            <Icon name={passed ? "checkCircle" : "alert"} className="h-5 w-5" />
            {passed ? `Zdane – próg to ${PASS_PERCENT}%` : `Do progu ${PASS_PERCENT}% brakuje ${Math.ceil((PASS_PERCENT / 100) * attempt.maxPoints) - attempt.points} pkt`}
          </p>
          <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-linear-to-r from-brand to-violet-400 transition-all duration-700" style={{ width: `${attempt.percent}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-white/60" style={{ left: `${PASS_PERCENT}%` }} aria-hidden />
          </div>
          <dl className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Czas", value: formatDuration(attempt.durationSec) },
              { label: "Dobrze", value: count("correct") },
              { label: "Źle", value: count("wrong") },
              { label: "Pominięte", value: count("skipped") },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 px-3 py-2">
                <dt className="text-[11px] font-bold uppercase tracking-widest text-white/60">{item.label}</dt>
                <dd className="text-lg font-extrabold tabular-nums">{item.value}</dd>
              </div>
            ))}
          </dl>
          {best && (
            <p className="relative mt-4 text-sm text-white/70">
              {attempt.percent > best.percent
                ? `Nowy rekord! Poprzednio najlepiej: ${best.percent}%.`
                : `Twój najlepszy wynik w tym arkuszu: ${best.percent}%.`}
            </p>
          )}
        </section>

        {boxable.length > 0 && (
          <section className="flex flex-col gap-3 rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-ink">Błędy do powtórki: {boxable.length}</p>
              <p className="text-sm text-muted">
                {added === null
                  ? "Dodaj je do Pudełka porażek – wrócą w treningu, aż rozwiążesz je poprawnie."
                  : `Dodano ${added} ${added === 1 ? "zadanie" : "zadań"} do Pudełka porażek.`}
              </p>
            </div>
            {added === null ? (
              <button
                onClick={async () => {
                  hapticTap();
                  setAdded(await addMistakes(boxable.map((r) => ({ questionId: r.taskId, chosen: r.given as OptionKey }))));
                }}
                className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 font-bold text-white active:bg-rose-600"
              >
                <Icon name="archive" className="h-4 w-4" /> Dodaj do Pudełka porażek
              </button>
            ) : (
              <Link href="/bledy" className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 font-bold text-ink">
                Otwórz pudełko <Icon name="arrow" className="h-4 w-4" />
              </Link>
            )}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-ink">Omówienie zadań</h2>
            <div className="flex gap-1 rounded-xl bg-subtle p-0.5" role="radiogroup" aria-label="Pokaż zadania">
              {(
                [
                  ["all", "Wszystkie"],
                  ["wrong", `Błędne (${count("wrong")})`],
                  ["skipped", `Pominięte (${count("skipped")})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="radio"
                  aria-checked={filter === id}
                  onClick={() => setFilter(id)}
                  className={`min-h-10 rounded-lg px-3 text-xs font-bold transition-colors ${filter === id ? "bg-card text-ink shadow-card" : "text-muted"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {shown.length === 0 && <p className="rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">Brak zadań w tej grupie.</p>}

          <ol className="flex flex-col gap-2">
            {shown.map((result) => {
              const task = taskById.get(result.taskId);
              if (!task) return null;
              const status = STATUS[result.status];
              const expanded = open === result.taskId;
              const prompt = task.kind === "closed" ? task.question.prompt : task.task.prompt;
              const figure = task.kind === "closed" ? task.question.figure : task.task.figure;
              return (
                <li key={result.taskId} className="overflow-hidden rounded-2xl border border-line glass-card shadow-card">
                  <button
                    onClick={() => setOpen(expanded ? null : result.taskId)}
                    aria-expanded={expanded}
                    className="flex min-h-14 w-full items-center gap-3 p-3 text-left"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${status.style}`} aria-label={status.label}>
                      <Icon name={status.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-ink">
                        Zadanie {result.number} <span className="font-semibold text-muted">· {result.kind === "closed" ? "zamknięte" : "otwarte"}</span>
                      </span>
                      <span className="block truncate text-sm text-muted">
                        <MathText text={prompt} />
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-ink tabular-nums">
                      {result.points}/{result.maxPoints}
                    </span>
                    <Icon name="chevron" className={`h-4 w-4 shrink-0 text-faint transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`} />
                  </button>

                  {expanded && (
                    <div className="flex animate-fade-in flex-col gap-3 border-t border-line p-4 text-sm">
                      <p className="leading-relaxed font-semibold text-ink">
                        <MathText text={prompt} />
                      </p>
                      {figure && (
                        <div className="rounded-2xl bg-subtle/60 p-3">
                          <FunctionPlot plot={figure} />
                        </div>
                      )}
                      {task.kind === "closed" ? (
                        <>
                          <p className="text-body">
                            Twoja odpowiedź: <strong className="text-ink">{result.given ?? "–"}</strong> · Poprawna:{" "}
                            <strong className="text-emerald-600 dark:text-emerald-400">{task.question.correct}</strong>{" "}
                            <MathText text={`(${task.question.options[task.question.correct]})`} />
                          </p>
                          <p className="leading-relaxed text-body">
                            <MathText text={task.question.explanation} />
                          </p>
                          {result.status === "wrong" && result.given && (
                            <button
                              onClick={() => setExplain({ task, chosen: result.given as OptionKey })}
                              className="flex min-h-11 w-fit items-center gap-1.5 rounded-xl bg-brand-soft px-3 font-bold text-brand"
                            >
                              <Icon name="sparkles" className="h-4 w-4" /> Wyjaśnij mi ten błąd
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-body">
                            Twój wynik: <strong className="text-ink">{result.given ?? "–"}</strong> · Poprawny:{" "}
                            <strong className="text-emerald-600 dark:text-emerald-400">{task.task.answers[0].replace(";", "; ")}</strong>
                          </p>
                          <div>
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-faint">Schemat oceniania</p>
                            <ol className="flex flex-col gap-2">
                              {task.task.solution.map((step, i) => (
                                <li key={i} className="flex gap-3 rounded-xl bg-subtle/60 p-3">
                                  <span className="shrink-0 text-xs font-extrabold text-brand">+{step.points} pkt</span>
                                  <MathText text={step.step} className="min-w-0 text-body" />
                                </li>
                              ))}
                            </ol>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRetry}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark"
          >
            <Icon name="refresh" className="h-4 w-4" /> Rozwiąż ponownie
          </button>
          <Link href="/arkusze" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-card font-bold text-ink">
            Wróć do arkuszy
          </Link>
        </div>
      </div>

      {explain && <ExplainSheet question={explain.task.question} chosen={explain.chosen} onClose={() => setExplain(null)} />}
    </div>
  );
}
