"use client";

import { useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import ExplainSheet, { TypingDots } from "@/components/quiz/ExplainSheet";
import QuizSummary from "@/components/quiz/QuizSummary";
import type { ScratchTemplate } from "@/components/scratch/ScratchBoard";
import TaskScratch from "@/components/scratch/TaskScratch";
import FormulaList from "@/components/topic/FormulaList";
import BottomSheet from "@/components/ui/BottomSheet";
import TrapCard from "@/components/quiz/TrapCard";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import RichText from "@/components/ui/RichText";
import { streamAi, toAiQuestion } from "@/lib/ai";
import { useAiReady } from "@/lib/ai-settings";
import { hapticError, hapticSuccess, hapticTap } from "@/lib/haptics";
import type { SaveOutcome } from "@/lib/progress";
import { clearScratchNotes, useScratchNotes } from "@/lib/scratch-notes";
import { soundSelect } from "@/lib/sounds";
import type { OptionKey, QuizAnswer, QuizQuestion, QuizResult } from "@/types/quiz";
import type { FormulaGroup } from "@/types/topic";

const KEYS: OptionKey[] = ["A", "B", "C", "D"];
const MAX_HEARTS = 3;
/** Ile stopni podpowiedzi maksymalnie (z klucza, a dalej generowane przez AI). */
const MAX_HINT_STEPS = 3;

type Props = {
  questions: QuizQuestion[];
  /** Nagłówek ekranu sukcesu, np. „Logarytmy”. */
  title: string;
  /** Nadtytuł ekranu sukcesu, np. „Test – poziom średni”. */
  kicker: string;
  formulaGroups: FormulaGroup[];
  /** Czy wolno korzystać z podpowiedzi. */
  hints: boolean;
  exitHref: string;
  onFinish: (result: QuizResult) => Promise<SaveOutcome>;
  /** Serca: 3 pomyłki kończą test. Wyłączone w teście na start – diagnoza idzie do końca. */
  hearts?: boolean;
  /** Własny ekran wyniku zamiast standardowego podsumowania testu. */
  Summary?: ComponentType<SummaryProps>;
};

export interface SummaryProps {
  result: QuizResult;
  outcome: SaveOutcome | null;
  onRetry: () => void;
}

type Panel = "formulas" | "explain" | null;

export default function QuizScreen(props: Props) {
  const { questions, formulaGroups, hints, exitHref, onFinish, hearts: useHearts = true } = props;
  const aiReady = useAiReady();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintsShown, setHintsShown] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState(false);
  const hintAbort = useRef<AbortController | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [panel, setPanel] = useState<Panel>(null);
  const [template, setTemplate] = useState<ScratchTemplate>("grid");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [outcome, setOutcome] = useState<SaveOutcome | null>(null);

  const question = questions[index];
  const isCorrect = selected === question.correct;
  const isLast = index + 1 >= questions.length;
  const progressPercent = ((index + (checked ? 1 : 0)) / questions.length) * 100;
  const [questionNotes, setQuestionNotes] = useScratchNotes(question.id);

  // Podpowiedzi: najpierw te z klucza, potem (jeśli działa AI) kolejne stopnie generowane na żywo.
  const authoredHints = question.hints ?? [];
  const maxHints = aiReady ? Math.max(authoredHints.length, MAX_HINT_STEPS) : authoredHints.length;
  const canHint = hints && !checked && !hintLoading && hintsShown.length < maxHints;

  async function handleHint() {
    hapticTap();
    setHintError(false);
    const step = hintsShown.length;
    if (step < authoredHints.length) {
      setHintsShown([...hintsShown, authoredHints[step]]);
      return;
    }
    const controller = new AbortController();
    hintAbort.current = controller;
    setHintLoading(true);
    setHintsShown([...hintsShown, ""]);
    try {
      await streamAi(
        { mode: "hint", question: toAiQuestion(question), level: Math.min(step + 1, MAX_HINT_STEPS), previousHints: hintsShown },
        (text) => setHintsShown((h) => [...h.slice(0, -1), text]),
        controller.signal,
      );
    } catch {
      if (!controller.signal.aborted) {
        setHintsShown((h) => h.slice(0, -1));
        setHintError(true);
      }
    } finally {
      setHintLoading(false);
    }
  }

  function resetQuestionState() {
    hintAbort.current?.abort();
    setSelected(null);
    setChecked(false);
    setHintsShown([]);
    setHintLoading(false);
    setHintError(false);
  }

  function handleCheck() {
    if (!selected) return;
    hintAbort.current?.abort();
    setChecked(true);
    setAnswers((a) => [...a, { questionId: question.id, chosen: selected, correct: selected === question.correct }]);
    if (selected === question.correct) {
      setCorrect((c) => c + 1);
      hapticSuccess();
    } else {
      if (useHearts) setHearts((h) => h - 1);
      hapticError();
    }
  }

  async function handleNext() {
    if (isLast || hearts === 0) {
      const final: QuizResult = { correct, total: questions.length, answered: index + 1, heartsLeft: hearts, answers };
      setResult(final);
      setOutcome(await onFinish(final));
      return;
    }
    setIndex((i) => i + 1);
    resetQuestionState();
  }

  function handleRetry() {
    setIndex(0);
    resetQuestionState();
    setAnswers([]);
    setCorrect(0);
    setHearts(MAX_HEARTS);
    clearScratchNotes(questions.map((q) => q.id));
    setResult(null);
    setOutcome(null);
  }

  if (result) {
    if (props.Summary) return <props.Summary result={result} outcome={outcome} onRetry={handleRetry} />;
    return (
      <QuizSummary
        result={result}
        outcome={outcome}
        title={props.title}
        kicker={props.kicker}
        exitHref={exitHref}
        onRetry={handleRetry}
      />
    );
  }

  function optionClasses(key: OptionKey) {
    const base =
      "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-base font-semibold transition-all duration-150";
    if (!checked) {
      return key === selected
        ? `${base} border-brand bg-brand-soft text-brand shadow-card`
        : `${base} border-line bg-card text-ink hover:border-brand/40 active:scale-[0.99]`;
    }
    if (key === question.correct)
      return `${base} border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`;
    if (key === selected) return `${base} animate-shake border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300`;
    return `${base} border-line bg-card text-faint opacity-60`;
  }

  function badgeClasses(key: OptionKey) {
    const base = "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold";
    if (checked && key === question.correct) return `${base} bg-emerald-500 text-white`;
    if (checked && key === selected) return `${base} bg-rose-500 text-white`;
    if (!checked && key === selected) return `${base} bg-brand text-white`;
    return `${base} bg-subtle text-muted`;
  }

  const heading = index === 0 ? "Zaczynamy!" : isLast ? "Ostatnie zadanie." : `Zadanie ${index + 1}.`;

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface pt-[env(safe-area-inset-top)]">
      <header className="mx-auto w-full max-w-6xl px-4 pt-3 sm:px-6 lg:px-10 lg:pt-6">
        <div className="flex items-center gap-3">
          <Link href={exitHref} aria-label="Zakończ test" className="-ml-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-faint hover:text-ink">
            <Icon name="close" className="h-6 w-6" />
          </Link>
          <span className="flex-1 text-sm font-semibold text-muted">
            Zadanie {index + 1}/{questions.length}
          </span>
          {useHearts && (
            <span
              key={hearts}
              className={`flex items-center gap-1 text-sm font-bold ${hearts < MAX_HEARTS ? "animate-shake" : ""} ${
                hearts === 0 ? "text-faint" : "text-rose-500"
              }`}
              aria-label={`Serca: ${hearts} z ${MAX_HEARTS}`}
            >
              <Icon name="heart" filled className="h-5 w-5" />
              {hearts}/{MAX_HEARTS}
            </span>
          )}
          <button
            onClick={() => setPanel("formulas")}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-sm font-bold text-brand shadow-card transition-colors hover:border-brand/40"
          >
            <Icon name="book" className="h-4 w-4" />
            Wzory
          </button>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-subtle"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-brand transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
        </div>
      </header>

      <main
        key={question.id}
        className="mx-auto grid w-full max-w-6xl flex-1 animate-fade-in grid-cols-1 content-start gap-5 px-4 pt-5 pb-72 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-10 lg:pb-40"
      >
        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
              <Icon name="layers" className="h-3.5 w-3.5" />
              {question.label}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-ink lg:text-3xl">{heading}</h1>
          </div>

          <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-7">
            <p className="text-lg leading-relaxed font-semibold text-ink lg:text-xl">
              <MathText text={question.prompt} />
            </p>
            {question.figure && (
              <div className="mt-4 rounded-2xl bg-subtle/60 p-3">
                <FunctionPlot plot={question.figure} />
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {canHint && (
                <button
                  onClick={handleHint}
                  className="flex min-h-11 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
                >
                  <Icon name="bulb" className="h-4 w-4" />
                  {hintsShown.length === 0 ? "Podpowiedź" : "Kolejna podpowiedź"}
                  <span className="rounded-md bg-amber-500/15 px-1.5 text-xs">
                    {hintsShown.length + 1}/{maxHints}
                  </span>
                </button>
              )}
            </div>
            {hintsShown.length > 0 && (
              <ol className="mt-3 flex flex-col gap-2">
                {hintsShown.map((hint, i) => (
                  <li
                    key={i}
                    className="flex animate-fade-in gap-2.5 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-extrabold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {hint ? <RichText text={hint} /> : <TypingDots />}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {hintError && (
              <p className="mt-2 text-xs font-semibold text-rose-500">Nie udało się pobrać podpowiedzi – spróbuj ponownie.</p>
            )}
          </section>

          <TaskScratch
            prompt={question.prompt}
            items={questionNotes}
            onChange={setQuestionNotes}
            template={template}
            onTemplateChange={setTemplate}
            formulaGroups={formulaGroups}
          />
        </div>

        <section className="lg:pt-14">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-body">Wybierz odpowiedź</span>
            {selected && !checked && <span className="text-brand">1 wybrana</span>}
          </div>
          <div className="flex flex-col gap-3">
            {KEYS.map((key) => (
              <button key={key} onClick={() => {
                  setSelected(key);
                  soundSelect();
                }} disabled={checked} className={optionClasses(key)}>
                <span className={badgeClasses(key)}>{key}</span>
                <MathText text={question.options[key]} className="flex-1" />
                {!checked && key === selected && <Icon name="checkCircle" className="h-5 w-5 shrink-0" />}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer
        aria-live="polite"
        className={`fixed inset-x-0 bottom-0 z-20 border-t px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-lg sm:px-6 lg:px-10 ${
          !checked
            ? "border-line bg-card/90"
            : isCorrect
              ? "animate-slide-up border-emerald-500/30 bg-emerald-50/95 dark:bg-emerald-950/90"
              : "animate-slide-up border-rose-500/30 bg-rose-50/95 dark:bg-rose-950/90"
        }`}
      >
        <div className="mx-auto flex max-h-[60dvh] max-w-6xl flex-col gap-3 overflow-y-auto lg:max-h-none lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {checked ? (
            <>
              <div className="flex min-w-0 flex-col gap-3">
                <div>
                <p
                  className={`flex items-center gap-2 text-lg font-extrabold ${
                    isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <Icon name={isCorrect ? "checkCircle" : "close"} className="h-5 w-5" />
                  {isCorrect ? "Dobrze!" : `Poprawna odpowiedź: ${question.correct}`}
                </p>
                <p className={`mt-1 text-sm ${isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"}`}>
                  <MathText text={question.explanation} />
                </p>
                {hearts === 0 && (
                  <p className="mt-2 text-sm font-bold text-rose-600 dark:text-rose-400">Skończyły się serca – spróbuj jeszcze raz.</p>
                )}
                </div>
                {!isCorrect && question.trap && <TrapCard text={question.trap} compact />}
              </div>
              <div className="flex shrink-0 flex-col gap-2 lg:w-64">
                {!isCorrect && (
                  <button
                    onClick={() => setPanel("explain")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-rose-500/30 bg-card py-3 text-sm font-bold text-rose-600 transition-colors hover:border-rose-500/60 dark:text-rose-300"
                  >
                    <Icon name="sparkles" className="h-4 w-4" />
                    Wyjaśnij mi to zadanie
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`w-full rounded-2xl py-4 text-base font-bold text-white ${
                    isCorrect ? "bg-emerald-500 active:bg-emerald-600" : "bg-rose-500 active:bg-rose-600"
                  }`}
                >
                  {isLast || hearts === 0 ? "Zobacz wynik" : "Dalej"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="hidden text-sm font-medium text-faint lg:block">Masz czas. Dasz radę.</p>
              <button
                onClick={handleCheck}
                disabled={!selected}
                className="w-full rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none lg:w-64"
              >
                Sprawdź odpowiedź
              </button>
              <p className="text-center text-xs font-medium text-faint lg:hidden">Masz czas. Dasz radę.</p>
            </>
          )}
        </div>
      </footer>

      {panel === "formulas" && (
        <BottomSheet title="Wzory" onClose={() => setPanel(null)}>
          <div className="flex flex-col gap-6">
            {formulaGroups.map((group) => (
              <section key={group.title}>
                {formulaGroups.length > 1 && <h3 className="mb-2 text-sm font-extrabold text-body">{group.title}</h3>}
                <FormulaList formulas={group.formulas} columns />
              </section>
            ))}
          </div>
        </BottomSheet>
      )}

      {panel === "explain" && selected && (
        <ExplainSheet question={question} chosen={selected} onClose={() => setPanel(null)} />
      )}

    </div>
  );
}
