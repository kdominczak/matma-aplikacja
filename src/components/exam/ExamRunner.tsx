"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChoiceAnswer from "@/components/exam/ChoiceAnswer";
import ExamAssessment from "@/components/exam/ExamAssessment";
import ExamNavGrid, { NavLegend } from "@/components/exam/ExamNavGrid";
import ExamSummary from "@/components/exam/ExamSummary";
import AnswerTools from "@/components/practice/AnswerTools";
import type { ScratchTemplate } from "@/components/scratch/ScratchBoard";
import TaskScratch from "@/components/scratch/TaskScratch";
import FormulaList from "@/components/topic/FormulaList";
import BottomSheet from "@/components/ui/BottomSheet";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ErrorState from "@/components/ui/ErrorState";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import { revealAboveKeyboard } from "@/lib/keyboard";
import MathText from "@/components/ui/MathText";
import { examKindLabel, examMaxPoints, examSource, getExam, taskSource } from "@/data/exams";
import CkeNotice from "@/components/legal/CkeNotice";
import { formulaGroup, topicsOfLevel } from "@/data/topics";
import { clearSession, finishExam, formatDuration, isAnswered, loadSession, needsAssessment, saveAttempt, saveSession, scoreExam, sessionElapsedMs, taskFigure, taskNumber, taskPrompt } from "@/lib/exam";
import { readIntervals } from "@/lib/calc";
import { hapticTap } from "@/lib/haptics";
import { displayedOptions } from "@/lib/options";
import { saveExamResult } from "@/lib/progress";
import { useScratchNotes } from "@/lib/scratch-notes";
import { soundSelect } from "@/lib/sounds";
import type { ExamAttempt, ExamSession, ExamSheet, ExamTask, ExamTaskResult } from "@/types/exam";
import type { FormulaGroup, Level } from "@/types/topic";


// Karta wzorów na cały arkusz (jak „Wybrane wzory matematyczne” CKE) – ze wszystkich działów poziomu arkusza.
const FORMULA_GROUPS: Record<Level, FormulaGroup[]> = {
  podstawowy: topicsOfLevel("podstawowy").map(formulaGroup).filter((g) => g.formulas.length > 0),
  rozszerzony: topicsOfLevel("rozszerzony").map(formulaGroup).filter((g) => g.formulas.length > 0),
};

type Phase =
  | { name: "loading" }
  | { name: "intro" }
  | { name: "running"; session: ExamSession }
  | { name: "checking"; session: ExamSession; results: ExamTaskResult[] }
  | { name: "done"; attempt: ExamAttempt };

/** Czy po „Zakończ” jest co oceniać krokami (zadania otwarte bez poprawnego wyniku końcowego). */
function hasPendingAssessment(exam: ExamSheet, results: ExamTaskResult[]): boolean {
  return results.some((r) => {
    const task = exam.tasks.find((t) => t.id === r.taskId);
    return task ? needsAssessment(task, r) : false;
  });
}

/** Zapis zakończonej próby (historia, statystyki) i usunięcie sesji – dopiero po sprawdzeniu zadań otwartych. */
async function completeAttempt(exam: ExamSheet, session: ExamSession, results: ExamTaskResult[]): Promise<ExamAttempt> {
  const attempt = finishExam(exam, session, Date.now(), results);
  await Promise.all([saveAttempt(attempt), saveExamResult(attempt), clearSession(exam.id)]);
  return attempt;
}

/**
 * Symulacja matury: wstęp → rozwiązywanie (nawigacja po zadaniach, czas, zapis po każdej zmianie) → sprawdzanie
 * zadań otwartych krokami (gdy jest co sprawdzać) → podsumowanie. Odpowiedzi nie są sprawdzane w trakcie –
 * jak na egzaminie, wynik dopiero po „Zakończ arkusz”. Czas egzaminu kończy się w chwili „Zakończ”.
 */
export default function ExamRunner({ examId }: { examId: string }) {
  const exam = getExam(examId);
  const [phase, setPhase] = useState<Phase>({ name: "loading" });

  useEffect(() => {
    let active = true;
    void loadSession(examId).then((session) => {
      if (!active) return;
      if (!session) return setPhase({ name: "intro" });
      // zamknięta aplikacja w trakcie sprawdzania – wracamy do sprawdzania (czas egzaminu już zamknięty)
      const exam = getExam(examId);
      setPhase(session.finishedAt && exam ? { name: "checking", session, results: scoreExam(exam, session) } : { name: "running", session });
    });
    return () => {
      active = false;
    };
  }, [examId]);

  if (!exam) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <ErrorState title="Nie ma takiego arkusza" message="Wybierz arkusz z listy w zakładce Arkusze." />
      </div>
    );
  }
  if (phase.name === "loading") return <div className="min-h-dvh bg-surface" />;
  if (phase.name === "intro") {
    return (
      <ExamIntro
        exam={exam}
        onStart={() => {
          const session: ExamSession = { examId, startedAt: Date.now(), current: 0, answers: {}, flagged: [] };
          void saveSession(session);
          setPhase({ name: "running", session });
        }}
      />
    );
  }
  if (phase.name === "done") {
    return <ExamSummary exam={exam} attempt={phase.attempt} onRetry={() => setPhase({ name: "intro" })} />;
  }
  if (phase.name === "checking") {
    return (
      <ExamAssessment
        exam={exam}
        results={phase.results}
        onDone={(results) => void completeAttempt(exam, phase.session, results).then((attempt) => setPhase({ name: "done", attempt }))}
      />
    );
  }
  return (
    <ExamInProgress
      exam={exam}
      initial={phase.session}
      onFinished={(session, results) => {
        if (hasPendingAssessment(exam, results)) setPhase({ name: "checking", session, results });
        else void completeAttempt(exam, session, results).then((attempt) => setPhase({ name: "done", attempt }));
      }}
    />
  );
}

function ExamIntro({ exam, onStart }: { exam: ExamSheet; onStart: () => void }) {
  const closed = exam.tasks.filter((t) => t.kind === "closed").length;
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-[max(1.5rem,env(safe-area-inset-top))]">
      <section className="card w-full max-w-lg animate-fade-in p-6 lg:p-8">
        <Link href="/arkusze" className="-ml-2 flex min-h-11 w-fit items-center gap-1 rounded-full px-2 text-sm font-bold text-muted hover:text-ink">
          <Icon name="back" className="h-4 w-4" /> Arkusze
        </Link>
        <p className="mt-3 text-xs font-extrabold uppercase tracking-widest text-brand">
          {examKindLabel(exam)} · poziom {exam.level === "rozszerzony" ? "rozszerzony" : "podstawowy"}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{exam.title}</h1>
        {/* arkusz CKE: rodzaj i poziom są już w nagłówku, a źródło niżej – z opisu zostaje tylko inna formuła */}
        {exam.kind !== "cke" ? <p className="mt-1 text-muted">{exam.subtitle}</p> : exam.year !== undefined && exam.year <= 2022 ? <p className="mt-1 text-muted">Formuła 2015</p> : null}
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-muted">
          <Icon name="file" className="mt-px h-3.5 w-3.5 shrink-0" />
          {examSource(exam)}
        </p>

        <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Zadań", value: exam.tasks.length },
            { label: "Punktów", value: examMaxPoints(exam) },
            { label: "Minut", value: exam.durationMin },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-subtle py-3">
              <dd className="text-2xl font-extrabold text-ink tabular-nums">{item.value}</dd>
              <dt className="text-xs font-bold uppercase text-muted">{item.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-col gap-2 text-sm text-body">
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            {closed} zadań zamkniętych (1 pkt) i {exam.tasks.length - closed} otwartych – w otwartych wpisujesz wynik końcowy, a po zakończeniu
            ocenisz kroki rozwiązania według schematu CKE (punkty częściowe jak na maturze).
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            Możesz skakać między zadaniami i wracać do nich. Wynik zobaczysz dopiero po zakończeniu.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            Postęp zapisuje się na bieżąco – możesz zamknąć aplikację i wrócić później. Czas egzaminu wtedy stoi.
          </li>
        </ul>

        {exam.kind === "losowy" && exam.code && <ShareCode code={exam.code} />}
        {exam.relaxations && exam.relaxations.length > 0 && <Relaxations exam={exam} />}

        <button
          onClick={() => {
            hapticTap();
            onStart();
          }}
          className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cta py-4 font-bold text-on-cta shadow-float btn-hover active:bg-cta-dark"
        >
          Rozpocznij arkusz <Icon name="arrow" className="h-4 w-4" />
        </button>
        <CkeNotice className="mt-5" />
      </section>
    </div>
  );
}

function ExamInProgress({
  exam,
  initial,
  onFinished,
}: {
  exam: ExamSheet;
  initial: ExamSession;
  onFinished: (session: ExamSession, results: ExamTaskResult[]) => void;
}) {
  const [session, setSession] = useState(initial);
  const [panel, setPanel] = useState<"formulas" | "overview" | "finish" | null>(null);
  const [template, setTemplate] = useState<ScratchTemplate>("grid");
  const finishing = useRef(false);

  const index = Math.min(session.current, exam.tasks.length - 1);
  const task = exam.tasks[index];
  // notatki osobno dla każdego podejścia do arkusza – nowe podejście zaczyna się od czystych kartek
  const [notes, setNotes] = useScratchNotes(`${exam.id}@${session.startedAt}/${task.id}`);
  const answeredCount = exam.tasks.filter((t) => isAnswered(session.answers[t.id])).length;
  const unanswered = exam.tasks.length - answeredCount;

  // zapis po każdej zmianie – odświeżenie strony albo zamknięcie aplikacji nie gubi odpowiedzi
  const update = useCallback((change: (s: ExamSession) => ExamSession) => {
    setSession((s) => {
      const next = change(s);
      void saveSession(next);
      return next;
    });
  }, []);

  const go = useCallback(
    (i: number) => {
      update((s) => ({ ...s, current: Math.max(0, Math.min(exam.tasks.length - 1, i)) }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [exam.tasks.length, update],
  );

  // Czas egzaminu liczy się tylko przy otwartej aplikacji: w tle i po zamknięciu stoi. Zapis co 10 s i przy wyjściu,
  // więc po „zabiciu” aplikacji giną najwyżej sekundy.
  const [clock] = useState(() => new ActiveClock(sessionElapsedMs(initial, exam.durationMin)));
  const elapsed = useCallback(() => clock.elapsed(), [clock]);
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  useEffect(() => {
    const persist = () => void saveSession({ ...sessionRef.current, elapsedMs: clock.elapsed() });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        clock.pause();
        persist();
      } else {
        clock.resume();
      }
    };
    const timer = window.setInterval(() => clock.running && persist(), 10_000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", persist);
    };
  }, [clock]);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    // koniec egzaminu: od teraz czas stoi, a sesja (z odpowiedziami) czeka na sprawdzenie zadań otwartych
    const finished = { ...session, elapsedMs: elapsed(), finishedAt: Date.now() };
    await saveSession(finished);
    onFinished(finished, scoreExam(exam, finished));
  }, [exam, session, onFinished, elapsed]);

  // ← → na klawiaturze (poza polem wpisywania)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, panel]);

  const flagged = session.flagged.includes(task.id);
  const prompt = taskPrompt(task);
  const figure = taskFigure(task);

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface pt-[env(safe-area-inset-top)]">
      <header className="sticky top-[env(safe-area-inset-top)] z-20 border-b border-line bg-surface/90 backdrop-blur-lg">
        <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-2 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <Link
              href="/arkusze"
              aria-label="Wyjdź – arkusz zostanie zapisany"
              className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-faint hover:text-ink"
            >
              <Icon name="close" className="h-6 w-6" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink">
                Zadanie {taskNumber(exam, index)}
                {!exam.numbers && <span className="font-semibold text-muted"> z {exam.tasks.length}</span>}
              </p>
              <p className="truncate text-xs font-semibold text-muted">
                Odpowiedzi: {answeredCount}/{exam.tasks.length}
                {taskSource(exam) && <> · {taskSource(exam)}</>}
              </p>
            </div>
            <ExamTimer elapsed={elapsed} durationMin={exam.durationMin} onTimeUp={() => void finish()} />
            <button
              onClick={() => setPanel("finish")}
              className="flex min-h-11 shrink-0 items-center rounded-xl bg-brand px-3 text-sm font-bold text-on-brand shadow-float active:bg-brand-dark"
            >
              Zakończ
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <ExamNavGrid tasks={exam.tasks} numbers={exam.numbers} answers={session.answers} flagged={session.flagged} current={index} onSelect={go} />
            </div>
            <button
              onClick={() => setPanel("overview")}
              aria-label="Wszystkie zadania"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-card text-muted hover:text-ink"
            >
              <Icon name="grid" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main
        key={task.id}
        className="mx-auto grid w-full max-w-6xl flex-1 animate-fade-in grid-cols-1 content-start gap-5 px-4 pt-5 pb-36 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-8"
      >
        {/* telefon: kolumna rozpada się na elementy siatki – odpowiedź zaraz pod treścią, brudnopis na końcu */}
        <div className="flex min-w-0 flex-col gap-4 max-lg:contents">
          <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wide">
            <span className={`rounded-full px-2.5 py-1 ${task.kind !== "open" ? "bg-brand-soft text-brand" : "bg-violet-500/15 text-violet-600 dark:text-violet-300"}`}>
              {task.kind === "open" ? "Otwarte" : "Zamknięte"} · {task.points} pkt
            </span>
            <button
              onClick={() =>
                update((s) => ({ ...s, flagged: flagged ? s.flagged.filter((id) => id !== task.id) : [...s.flagged, task.id] }))
              }
              aria-pressed={flagged}
              className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 normal-case tracking-normal transition-colors ${
                flagged ? "bg-amber-400/20 text-amber-700 dark:text-amber-300" : "text-muted hover:text-ink"
              }`}
            >
              <Icon name="flag" className="h-4 w-4" />
              {flagged ? "Oznaczone – wrócę" : "Wrócę do tego"}
            </button>
            <button onClick={() => setPanel("formulas")} className="press ml-auto flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink/20 bg-card px-3.5 normal-case tracking-normal font-extrabold text-ink hover:border-ink/40">
              <Icon name="book" className="h-4 w-4" />
              Karta wzorów
            </button>
          </div>

          <section className="card p-5 lg:p-7">
            <p className="text-lg leading-relaxed font-semibold text-ink lg:text-xl">
              <MathText text={prompt} />
            </p>
            {figure && (
              <div className="mt-4 rounded-2xl bg-subtle/60 p-3">
                <FunctionPlot plot={figure} />
              </div>
            )}
          </section>

          <div className="flex flex-col gap-4 max-lg:order-2">
            <TaskScratch
              prompt={prompt}
              items={notes}
              onChange={setNotes}
              template={template}
              onTemplateChange={setTemplate}
              formulaGroups={FORMULA_GROUPS[exam.level]}
            />
          </div>
        </div>

        <div className="min-w-0 max-lg:order-1 lg:pt-9">
          <AnswerInput task={task} session={session} update={update} />
        </div>
      </main>

      <footer data-bottom-bar className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3 lg:px-4">
          <button
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-card font-bold text-ink disabled:opacity-40 sm:flex-none sm:px-6"
          >
            <Icon name="back" className="h-4 w-4" /> Poprzednie
          </button>
          {index < exam.tasks.length - 1 ? (
            <button
              onClick={() => go(index + 1)}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark sm:ml-auto sm:flex-none sm:px-8"
            >
              Następne <Icon name="chevron" className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setPanel("finish")}
              className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-cta font-bold text-on-cta shadow-float btn-hover active:bg-cta-dark sm:ml-auto sm:flex-none sm:px-8"
            >
              Zakończ arkusz <Icon name="checkCircle" className="h-4 w-4" />
            </button>
          )}
        </div>
      </footer>

      {panel === "overview" && (
        <BottomSheet title="Wszystkie zadania" onClose={() => setPanel(null)}>
          <div className="flex flex-col gap-4">
            <NavLegend />
            <ExamNavGrid
              layout="grid"
              numbers={exam.numbers}
              tasks={exam.tasks}
              answers={session.answers}
              flagged={session.flagged}
              current={index}
              onSelect={(i) => {
                go(i);
                setPanel(null);
              }}
            />
          </div>
        </BottomSheet>
      )}

      {panel === "formulas" && (
        <BottomSheet title="Karta wzorów" onClose={() => setPanel(null)}>
          <div className="flex flex-col gap-6">
            {FORMULA_GROUPS[exam.level].map((group) => (
              <section key={group.title}>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-brand">{group.title}</h3>
                <FormulaList formulas={group.formulas} columns />
              </section>
            ))}
          </div>
        </BottomSheet>
      )}

      {panel === "finish" && (
        <ConfirmDialog
          tone="brand"
          icon="checkCircle"
          title="Zakończyć arkusz?"
          confirmLabel="Zakończ i sprawdź"
          onConfirm={finish}
          onCancel={() => setPanel(null)}
        >
          {unanswered > 0 ? (
            <>
              Bez odpowiedzi: <strong className="text-ink">{unanswered}</strong> z {exam.tasks.length} zadań – za nie dostaniesz 0 pkt.
              {session.flagged.length > 0 && <> Oznaczone do powrotu: {session.flagged.length}.</>}
            </>
          ) : (
            "Wszystkie zadania mają odpowiedź. Po zakończeniu zobaczysz wynik i omówienie."
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Odpowiedź: litery A–D albo pole na wynik. Bez sprawdzania – jak na egzaminie. */
function AnswerInput({ task, session, update }: { task: ExamTask; session: ExamSession; update: (change: (s: ExamSession) => ExamSession) => void }) {
  const answer = session.answers[task.id];
  const inputRef = useRef<HTMLInputElement>(null);

  if (task.kind === "choice") {
    const picks = answer?.kind === "choice" ? answer.picks : [];
    return (
      <ChoiceAnswer
        question={task.choice}
        picks={picks}
        onChange={(next) => update((s) => ({ ...s, answers: { ...s.answers, [task.id]: { kind: "choice", picks: next } } }))}
      />
    );
  }

  if (task.kind === "closed") {
    const chosen = answer?.kind === "closed" ? answer.chosen : undefined;
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-body">Wybierz odpowiedź</p>
          {chosen && (
            <button
              onClick={() =>
                update((s) => {
                  const { [task.id]: _removed, ...rest } = s.answers;
                  void _removed;
                  return { ...s, answers: rest };
                })
              }
              className="-my-2 min-h-11 text-sm font-bold text-muted hover:text-ink"
            >
              Wyczyść
            </button>
          )}
        </div>
        {displayedOptions(task.question).map(({ label, key, text }) => {
          const selected = chosen === key;
          return (
            <button
              key={key}
              onClick={() => {
                soundSelect();
                hapticTap();
                update((s) => ({ ...s, answers: { ...s.answers, [task.id]: { kind: "closed", chosen: key } } }));
              }}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-base font-semibold transition-all duration-150 ${
                selected ? "border-brand bg-brand-soft text-brand shadow-card" : "border-line glass-card text-ink hover:border-brand/60 dark:hover:border-brand/40 active:scale-[0.99]"
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selected ? "bg-brand text-on-brand" : "bg-subtle text-muted"}`}>
                {label}
              </span>
              <MathText display text={text} className="min-w-0 flex-1" />
              {selected && <Icon name="checkCircle" className="h-5 w-5 shrink-0" />}
            </button>
          );
        })}
      </section>
    );
  }

  if (task.task.format === "proof") {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-line bg-subtle/60 p-4 text-sm text-body">
        <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p>
          To zadanie na dowód – nie ma wyniku do wpisania. Zapisz rozumowanie na kartce albo w brudnopisie. Po „Zakończ” ocenisz je krokami ze schematu
          CKE (z Premium – także ze zdjęcia kartki), do {task.points} pkt.
        </p>
      </section>
    );
  }

  const input = answer?.kind === "open" ? answer.input : "";
  // odpowiedzią jest przedział (dziedzina, zbiór rozwiązań) – inna podpowiedź zapisu
  const interval = task.task.answers.some((a) => readIntervals(a) !== null);
  const setInput = (value: string) => update((s) => ({ ...s, answers: { ...s.answers, [task.id]: { kind: "open", input: value } } }));
  return (
    <section className="flex flex-col gap-3">
      <label htmlFor={`exam-${task.id}`} className="text-sm font-bold text-body">
        Twój wynik końcowy
      </label>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-line glass-card px-4 focus-within:border-brand">
        {task.task.answerLabel && (
          <span className="shrink-0 font-serif text-lg text-muted italic">
            <MathText text={`$${task.task.answerLabel}$`} />
          </span>
        )}
        <input
          ref={inputRef}
          id={`exam-${task.id}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          onFocus={revealAboveKeyboard}
          inputMode="text"
          placeholder={interval ? "np. [-4, 4) albo x ≥ 2" : "np. 3/2, 1,5 albo -2; 3"}
          className="min-h-12 min-w-0 flex-1 bg-transparent py-3 text-lg font-bold text-ink placeholder:font-medium placeholder:text-faint focus:outline-none"
        />
      </div>
      <AnswerTools value={input} onChange={setInput} inputRef={inputRef} />
      <p className="text-xs text-muted">
        {interval
          ? "Wpisz przedział: nawias kwadratowy [ albo ⟨ – koniec należy do zbioru, okrągły ( – nie należy; nieskończoność to ∞. Możesz też zapisać nierówność."
          : "Wpisz sam wynik liczbowy (ułamek jako 3/2), kilka rozwiązań oddziel średnikiem."}{" "}
        Za poprawny wynik dostajesz {task.points} pkt – tok rozwiązania porównasz ze
        schematem na podsumowaniu.
      </p>
    </section>
  );
}

/** Pozostały czas (jak na maturze – liczony od startu, także gdy aplikacja jest w tle). Po upływie czasu arkusz się kończy. */
/** Czas aktywny arkusza: liczy się od `resume()` do `pause()`; start od czasu zapisanego w sesji. */
class ActiveClock {
  private since: number | null = Date.now();
  constructor(private base: number) {}
  get running() {
    return this.since !== null;
  }
  elapsed(): number {
    return this.base + (this.since === null ? 0 : Date.now() - this.since);
  }
  pause() {
    this.base = this.elapsed();
    this.since = null;
  }
  resume() {
    if (this.since === null) this.since = Date.now();
  }
}

/** Pozostały czas – z czasu aktywnego (`elapsed`), więc w tle zegar stoi. */
function ExamTimer({ elapsed, durationMin, onTimeUp }: { elapsed: () => number; durationMin: number; onTimeUp: () => void }) {
  const [elapsedMs, setElapsedMs] = useState(elapsed);
  const fired = useRef(false);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsedMs(elapsed()), 1000);
    return () => window.clearInterval(timer);
  }, [elapsed]);
  const left = Math.max(0, durationMin * 60 - Math.floor(elapsedMs / 1000));
  useEffect(() => {
    if (left === 0 && !fired.current) {
      fired.current = true;
      onTimeUp();
    }
  }, [left, onTimeUp]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const label = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  const tone = left <= 300 ? "text-rose-500" : left <= 900 ? "text-amber-700 dark:text-amber-400" : "text-muted";
  return (
    <span
      className={`flex shrink-0 items-center gap-1 text-sm font-extrabold tabular-nums ${tone}`}
      aria-label={`Pozostały czas: ${formatDuration(left)}`}
      role="timer"
    >
      <Icon name="clock" className="h-4 w-4" />
      {label}
    </span>
  );
}

/** Kod arkusza losowego – znajomy z tym kodem dostanie dokładnie ten sam arkusz. */
function ShareCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const text = `Rozwiąż ze mną arkusz maturalny w aplikacji Matma – kod: ${code.toUpperCase()}`;

  async function share() {
    hapticTap();
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(code.toUpperCase());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // anulowane udostępnianie albo brak schowka – kod i tak jest widoczny
    }
  }

  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-subtle px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Kod arkusza</p>
        <p className="font-mono text-xl font-extrabold tracking-widest text-ink select-all">{code.toUpperCase()}</p>
      </div>
      <button onClick={() => void share()} className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-bold text-brand">
        {copied ? "Skopiowano" : "Udostępnij"}
      </button>
    </div>
  );
}

/** Czym arkusz różni się od oryginalnego układu – uczciwie, zanim uczeń zacznie. */
function Relaxations({ exam }: { exam: ExamSheet }) {
  const list = exam.relaxations ?? [];
  return (
    <details className="mt-3 rounded-2xl border border-line px-4 py-3 text-sm">
      <summary className="cursor-pointer font-bold text-body">
        Różnice względem matury {exam.layoutYear}: {list.length} {list.length === 1 ? "pozycja" : "pozycje"}
      </summary>
      <p className="mt-2 text-muted">
        Arkusz odwzorowuje układ prawdziwej matury, ale nie dla każdej pozycji mamy jeszcze zadanie tego samego typu. Punktacja się nie zmienia.
      </p>
      <ul className="mt-2 flex flex-col gap-1 text-muted">
        {list.map((r) => (
          <li key={r.slot} className="flex gap-2">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            {r.note}
          </li>
        ))}
      </ul>
    </details>
  );
}
