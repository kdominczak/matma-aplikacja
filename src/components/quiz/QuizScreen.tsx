"use client";

import { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import MathText from "@/components/ui/MathText";
import { hapticError, hapticSuccess } from "@/lib/haptics";
import type { OptionKey, Question, QuizResult } from "@/types/quiz";

const KEYS: OptionKey[] = ["A", "B", "C", "D"];
const XP_PER_CORRECT = 10;
const COMBO_BONUS = 5; // od 3 dobrych odpowiedzi z rzędu

type Props = {
  questions: Question[];
  onFinish?: (result: QuizResult) => void;
};

export default function QuizScreen({ questions, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[index];
  const answered = selected !== null;
  const isCorrect = selected === question.correct;
  // pasek „skacze” od razu po odpowiedzi, jak w Duolingo
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;

  function handleSelect(key: OptionKey) {
    if (answered) return;
    setSelected(key);

    if (key === question.correct) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      setXp((x) => x + XP_PER_CORRECT + (nextCombo >= 3 ? COMBO_BONUS : 0));
      hapticSuccess();
    } else {
      setCombo(0);
      hapticError();
    }
  }

  function handleNext() {
    if (index + 1 >= questions.length) {
      setFinished(true);
      onFinish?.({ correct: correctCount, total: questions.length, xp });
      if (correctCount / questions.length >= 0.5) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setCombo(0);
    setXp(0);
    setFinished(false);
  }

  function optionClasses(key: OptionKey) {
    const base =
      "flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 p-4 text-left text-lg font-semibold transition-all duration-150";

    if (!answered)
      return `${base} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2`;
    if (key === question.correct)
      return `${base} border-emerald-500 bg-emerald-50 text-emerald-700`;
    if (key === selected)
      return `${base} animate-shake border-rose-500 bg-rose-50 text-rose-700`;
    return `${base} border-slate-200 bg-white text-slate-400 opacity-60`;
  }

  function badgeClasses(key: OptionKey) {
    const base =
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-sm font-bold";
    if (answered && key === question.correct)
      return `${base} border-emerald-500 bg-emerald-500 text-white`;
    if (answered && key === selected)
      return `${base} border-rose-500 bg-rose-500 text-white`;
    return `${base} border-slate-200 text-slate-500`;
  }

  if (finished) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white p-6 text-center">
        <div className="text-7xl">{percent >= 80 ? "🏆" : percent >= 50 ? "💪" : "📚"}</div>
        <h1 className="text-3xl font-extrabold text-slate-800">Lekcja ukończona!</h1>
        <div className="flex gap-4">
          <div className="rounded-2xl border-2 border-amber-400 px-6 py-3">
            <p className="text-xs font-bold uppercase text-amber-500">XP</p>
            <p className="text-2xl font-extrabold text-amber-500">+{xp}</p>
          </div>
          <div className="rounded-2xl border-2 border-emerald-500 px-6 py-3">
            <p className="text-xs font-bold uppercase text-emerald-600">Wynik</p>
            <p className="text-2xl font-extrabold text-emerald-600">{percent}%</p>
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="w-full max-w-sm rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-4 text-lg font-bold uppercase text-white active:translate-y-0.5 active:border-b-2"
        >
          Jeszcze raz
        </button>
        <Link href="/" className="font-bold uppercase text-slate-400">
          Wróć do menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white pt-[env(safe-area-inset-top)]">
      {/* Górny pasek: zamknij + postęp + combo */}
      <header className="flex items-center gap-4 px-4 py-4">
        <Link href="/" aria-label="Zamknij quiz" className="text-2xl text-slate-400 hover:text-slate-600">
          ✕
        </Link>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className={`flex items-center gap-1 font-bold transition-colors ${
            combo >= 3 ? "text-orange-500" : "text-slate-300"
          }`}
        >
          🔥 {combo}
        </div>
      </header>

      {/* Pytanie */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-56">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-500">
            {question.topic} · {index + 1}/{questions.length}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-snug text-slate-800">
            <MathText text={question.prompt} />
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={answered}
              className={optionClasses(key)}
            >
              <span className={badgeClasses(key)}>{key}</span>
              <MathText text={question.options[key]} />
            </button>
          ))}
        </div>
      </main>

      {/* Natychmiastowa informacja zwrotna */}
      {answered && (
        <div
          aria-live="polite"
          className={`fixed inset-x-0 bottom-0 animate-slide-up border-t-2 px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
            isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
          }`}
        >
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            <div>
              <p
                className={`text-xl font-extrabold ${
                  isCorrect ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isCorrect
                  ? combo >= 3
                    ? `Świetnie! ${combo} z rzędu 🔥`
                    : "Dobrze! 🎉"
                  : `Poprawna odpowiedź: ${question.correct}`}
              </p>
              <p className={`mt-1 ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                <MathText text={question.explanation} />
              </p>
            </div>
            <button
              onClick={handleNext}
              className={`w-full rounded-2xl border-b-4 py-4 text-lg font-bold uppercase text-white active:translate-y-0.5 active:border-b-2 ${
                isCorrect
                  ? "border-emerald-700 bg-emerald-500"
                  : "border-rose-700 bg-rose-500"
              }`}
            >
              {index + 1 >= questions.length ? "Zakończ" : "Dalej"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
