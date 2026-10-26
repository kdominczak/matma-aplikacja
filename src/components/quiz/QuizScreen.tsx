"use client";

import { useState } from "react";
import Link from "next/link";
import QuizSummary from "@/components/quiz/QuizSummary";
import type { ScratchTemplate } from "@/components/quiz/ScratchBackground";
import Scratchpad, { type Stroke } from "@/components/quiz/Scratchpad";
import FormulaList from "@/components/topic/FormulaList";
import BottomSheet from "@/components/ui/BottomSheet";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { hapticError, hapticSuccess, hapticTap } from "@/lib/haptics";
import type { SaveOutcome } from "@/lib/progress";
import type { OptionKey, QuizQuestion, QuizResult } from "@/types/quiz";
import type { FormulaGroup } from "@/types/topic";

const KEYS: OptionKey[] = ["A", "B", "C", "D"];
const MAX_HEARTS = 3;

type Props = {
  questions: QuizQuestion[];
  /** Nagłówek ekranu sukcesu, np. „Logarytmy”. */
  title: string;
  /** Nadtytuł ekranu sukcesu, np. „Test – poziom średni”. */
  kicker: string;
  formulaGroups: FormulaGroup[];
  hints: boolean;
  xpPerCorrect: number;
  exitHref: string;
  onFinish: (result: QuizResult) => Promise<SaveOutcome>;
};

type Panel = "formulas" | "scratchpad" | null;

export default function QuizScreen(props: Props) {
  const { questions, formulaGroups, hints, xpPerCorrect, exitHref, onFinish } = props;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [panel, setPanel] = useState<Panel>(null);
  const [notes, setNotes] = useState<Record<string, Stroke[]>>({});
  const [template, setTemplate] = useState<ScratchTemplate>("grid");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [outcome, setOutcome] = useState<SaveOutcome | null>(null);

  const question = questions[index];
  const isCorrect = selected === question.correct;
  const isLast = index + 1 >= questions.length;
  const progressPercent = ((index + (checked ? 1 : 0)) / questions.length) * 100;
  const questionNotes = notes[question.id] ?? [];

  function handleCheck() {
    if (!selected) return;
    setChecked(true);
    if (selected === question.correct) {
      setCorrect((c) => c + 1);
      // podpowiedź obniża nagrodę o połowę
      setXp((x) => x + (hintShown ? Math.round(xpPerCorrect / 2) : xpPerCorrect));
      hapticSuccess();
    } else {
      setHearts((h) => h - 1);
      hapticError();
    }
  }

  async function handleNext() {
    if (isLast || hearts === 0) {
      const final: QuizResult = { correct, total: questions.length, answered: index + 1, xp, heartsLeft: hearts };
      setResult(final);
      setOutcome(await onFinish(final));
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
    setHintShown(false);
  }

  function handleRetry() {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setHintShown(false);
    setCorrect(0);
    setXp(0);
    setHearts(MAX_HEARTS);
    setNotes({});
    setResult(null);
    setOutcome(null);
  }

  if (result) {
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
          <Link href={exitHref} aria-label="Zakończ test" className="-ml-1 rounded-full p-1 text-faint hover:text-ink">
            <Icon name="close" className="h-6 w-6" />
          </Link>
          <span className="flex-1 text-sm font-semibold text-muted">
            Zadanie {index + 1}/{questions.length}
          </span>
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
          <button
            onClick={() => setPanel("formulas")}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-sm font-bold text-brand shadow-card transition-colors hover:border-brand/40"
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
        className="mx-auto grid w-full max-w-6xl flex-1 animate-fade-in content-start gap-5 px-4 pt-5 pb-72 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:pt-10 lg:pb-40"
      >
        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand">
              <Icon name="layers" className="h-3.5 w-3.5" />
              {question.label}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-ink lg:text-3xl">{heading}</h1>
          </div>

          <section className="rounded-3xl border border-line bg-card p-5 shadow-card lg:p-7">
            <p className="text-lg leading-relaxed font-semibold text-ink lg:text-xl">
              <MathText text={question.prompt} />
            </p>
            {question.figure && (
              <div className="mt-4 rounded-2xl bg-subtle/60 p-3">
                <FunctionPlot plot={question.figure} />
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {hints && question.hint && !hintShown && !checked && (
                <button
                  onClick={() => setHintShown(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400"
                >
                  <Icon name="bulb" className="h-4 w-4" />
                  Podpowiedź
                </button>
              )}
              <button
                onClick={() => {
                  hapticTap();
                  setPanel("scratchpad");
                }}
                className="relative flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm font-bold text-orange-600 dark:text-orange-400"
              >
                <Icon name="pencil" className="h-4 w-4" />
                Brudnopis
                {questionNotes.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-card bg-orange-500" />
                )}
              </button>
            </div>
            {hintShown && (
              <div className="mt-3 flex animate-fade-in gap-2 rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                <Icon name="bulb" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <MathText text={question.hint!} />
                  <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Za to zadanie dostaniesz połowę XP.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="lg:pt-14">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span className="text-body">Wybierz odpowiedź</span>
            {selected && !checked && <span className="text-brand">1 wybrana</span>}
          </div>
          <div className="flex flex-col gap-3">
            {KEYS.map((key) => (
              <button key={key} onClick={() => setSelected(key)} disabled={checked} className={optionClasses(key)}>
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
        <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          {checked ? (
            <>
              <div className="min-w-0">
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
              <button
                onClick={handleNext}
                className={`w-full shrink-0 rounded-2xl py-4 text-base font-bold text-white lg:w-64 ${
                  isCorrect ? "bg-emerald-500 active:bg-emerald-600" : "bg-rose-500 active:bg-rose-600"
                }`}
              >
                {isLast || hearts === 0 ? "Zobacz wynik" : "Dalej"}
              </button>
            </>
          ) : (
            <>
              <p className="hidden text-sm font-medium text-faint lg:block">Masz czas. Dasz radę.</p>
              <button
                onClick={handleCheck}
                disabled={!selected}
                className="w-full rounded-2xl bg-brand py-4 text-base font-bold text-white shadow-float transition-colors active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none lg:w-64"
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

      {panel === "scratchpad" && (
        <Scratchpad
          prompt={question.prompt}
          strokes={questionNotes}
          onChange={(strokes) => setNotes((n) => ({ ...n, [question.id]: strokes }))}
          template={template}
          onTemplateChange={setTemplate}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  );
}
