"use client";

import { useState } from "react";
import TrapCard from "@/components/quiz/TrapCard";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { hapticError, hapticSuccess, hapticTap } from "@/lib/haptics";
import { displayedOptions, displayKey } from "@/lib/options";
import { soundSelect } from "@/lib/sounds";
import type { OptionKey, QuizAnswer, QuizQuestion, QuizResult } from "@/types/quiz";

/**
 * „Sprawdź się” w treści lekcji: pytania jedno po drugim, od razu z wyjaśnieniem – bez serc, bez blokowania
 * i bez osobnego ekranu. Po ostatnim pytaniu `onComplete` zapisuje odpowiedzi (statystyki, Pudełko porażek).
 */
export default function InlineCheck({
  questions,
  title,
  onComplete,
}: {
  questions: QuizQuestion[];
  title: string;
  onComplete: (result: QuizResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const done = answers.length === questions.length && questions.length > 0;
  const question = questions[Math.min(index, questions.length - 1)];
  if (!question) return null;

  function check() {
    if (!chosen) return;
    const correct = chosen === question.correct;
    if (correct) hapticSuccess();
    else hapticError();
    const next = [...answers, { questionId: question.id, chosen, correct }];
    setAnswers(next);
    setChecked(true);
    if (next.length === questions.length) {
      const good = next.filter((a) => a.correct).length;
      onComplete({ correct: good, total: questions.length, answered: questions.length, heartsLeft: 0, answers: next });
    }
  }

  function nextQuestion() {
    hapticTap();
    setIndex(index + 1);
    setChosen(null);
    setChecked(false);
  }

  function restart() {
    setIndex(0);
    setChosen(null);
    setChecked(false);
    setAnswers([]);
  }

  const correct = checked && chosen === question.correct;
  const score = answers.filter((a) => a.correct).length;

  return (
    <section className="card flex flex-col gap-4 border-brand/30 p-5 lg:p-7" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand">
          <Icon name="check" className="h-4 w-4" />
          {title}
        </p>
        {questions.length > 1 && (
          <p className="text-xs font-bold text-muted tabular-nums">
            {Math.min(index + 1, questions.length)}/{questions.length}
          </p>
        )}
      </div>

      <p className="font-semibold leading-relaxed text-ink">
        <MathText text={question.prompt} />
      </p>
      {question.figure && (
        <div className="rounded-2xl bg-subtle/60 p-3">
          <FunctionPlot plot={question.figure} />
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Odpowiedzi">
        {displayedOptions(question).map((option) => {
          const isChosen = chosen === option.key;
          const isRight = checked && option.key === question.correct;
          const isWrong = checked && isChosen && !isRight;
          return (
            <button
              key={option.key}
              role="radio"
              aria-checked={isChosen}
              disabled={checked}
              onClick={() => {
                soundSelect();
                setChosen(option.key);
              }}
              className={`flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left transition-colors ${
                isRight
                  ? "border-good bg-good-soft"
                  : isWrong
                    ? "border-bad bg-bad-soft"
                    : isChosen
                      ? "border-brand bg-brand-soft"
                      : "border-line bg-card hover:border-brand/60 dark:hover:border-brand/40"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-sm font-extrabold text-ink">{option.label}</span>
              <MathText text={option.text} className="min-w-0 text-body" />
            </button>
          );
        })}
      </div>

      {checked && (
        <div className={`rounded-2xl p-4 text-sm ${correct ? "bg-good-soft" : "bg-bad-soft"}`} role="status">
          <p className={`font-extrabold ${correct ? "text-good" : "text-bad"}`}>
            {correct ? "Dobrze!" : `Poprawna odpowiedź: ${displayKey(question, question.correct)}`}
          </p>
          <p className="mt-1 leading-relaxed text-body">
            <MathText text={question.explanation} />
          </p>
        </div>
      )}
      {checked && !correct && question.trap && <TrapCard text={question.trap} compact />}

      {!checked ? (
        <button
          onClick={check}
          disabled={!chosen}
          className="min-h-12 rounded-2xl bg-brand font-bold text-on-brand shadow-float active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
        >
          Sprawdź
        </button>
      ) : done ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-extrabold text-ink">
            {questions.length > 1 ? `Wynik: ${score}/${questions.length}` : correct ? "Rozumiesz ten krok." : "Wróć na chwilę do tego kroku."}
          </p>
          <button onClick={restart} className="min-h-11 rounded-2xl px-3 text-sm font-bold text-muted hover:text-ink">
            Jeszcze raz
          </button>
        </div>
      ) : (
        <button onClick={nextQuestion} className="min-h-12 rounded-2xl bg-brand font-bold text-on-brand shadow-float active:bg-brand-dark">
          Dalej
        </button>
      )}
    </section>
  );
}
