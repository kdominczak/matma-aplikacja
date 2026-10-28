"use client";

import TrapCard from "@/components/quiz/TrapCard";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { soundSelect } from "@/lib/sounds";
import type { OptionKey, QuizQuestion } from "@/types/quiz";

const KEYS: OptionKey[] = ["A", "B", "C", "D"];

export interface ClosedState {
  selected?: OptionKey;
  checked: boolean;
}

type Props = {
  question: QuizQuestion;
  state: ClosedState;
  onChange: (state: ClosedState) => void;
  onCheck: () => void;
  onExplain: () => void;
  onNext: (() => void) | null;
};

/** Zadanie zamknięte ABCD z natychmiastową informacją zwrotną (bez serc – to tryb ćwiczeń). */
export default function ClosedAnswer({ question, state, onChange, onCheck, onExplain, onNext }: Props) {
  const { selected, checked } = state;
  const isCorrect = selected === question.correct;

  function optionClasses(key: OptionKey) {
    const base = "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-base font-semibold transition-all duration-150";
    if (!checked) {
      return key === selected
        ? `${base} border-brand bg-brand-soft text-brand shadow-card`
        : `${base} border-line bg-card text-ink hover:border-brand/40 active:scale-[0.99]`;
    }
    if (key === question.correct) return `${base} border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300`;
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

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-bold text-body">Wybierz odpowiedź</p>
        <div className="flex flex-col gap-3">
          {KEYS.map((key) => (
            <button key={key} onClick={() => {
                onChange({ ...state, selected: key });
                soundSelect();
              }} disabled={checked} className={optionClasses(key)}>
              <span className={badgeClasses(key)}>{key}</span>
              <MathText text={question.options[key]} className="flex-1" />
              {!checked && key === selected && <Icon name="checkCircle" className="h-5 w-5 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {!checked ? (
        <button
          onClick={onCheck}
          disabled={!selected}
          className="rounded-2xl bg-brand py-3.5 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
        >
          Sprawdź odpowiedź
        </button>
      ) : (
        <div
          aria-live="polite"
          className={`flex animate-fade-in flex-col gap-3 rounded-2xl border p-4 ${
            isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"
          }`}
        >
          <p className={`flex items-center gap-2 font-extrabold ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            <Icon name={isCorrect ? "checkCircle" : "close"} className="h-5 w-5" />
            {isCorrect ? "Dobrze!" : `Poprawna odpowiedź: ${question.correct}`}
          </p>
          <p className={`text-sm ${isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"}`}>
            <MathText text={question.explanation} />
          </p>
          {!isCorrect && question.trap && <TrapCard text={question.trap} compact />}
          <div className="flex flex-wrap gap-2">
            {!isCorrect && (
              <button onClick={onExplain} className="flex items-center gap-1.5 rounded-xl bg-card px-3 py-2 text-sm font-bold text-rose-600 dark:text-rose-300">
                <Icon name="sparkles" className="h-4 w-4" />
                Wyjaśnij mi to zadanie
              </button>
            )}
            <button onClick={() => onChange({ checked: false })} className="rounded-xl bg-card px-3 py-2 text-sm font-bold text-muted hover:text-ink">
              Spróbuj ponownie
            </button>
          </div>
        </div>
      )}

      {checked && onNext && (
        <button onClick={onNext} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card py-3.5 font-bold text-brand hover:border-brand/40">
          Następne zadanie <Icon name="arrow" className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
