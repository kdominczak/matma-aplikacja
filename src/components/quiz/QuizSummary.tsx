"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BadgeIcon } from "@/components/achievements/Badge";
import WeekStreak from "@/components/home/WeekStreak";
import Icon from "@/components/ui/Icon";
import { celebrate } from "@/lib/celebrate";
import Stars from "@/components/ui/Stars";
import type { SaveOutcome } from "@/lib/progress";
import { isPassed, starsFor } from "@/lib/stats";
import type { QuizResult } from "@/types/quiz";

type Props = {
  result: QuizResult;
  /** null, dopóki zapis postępu się nie zakończy. */
  outcome: SaveOutcome | null;
  title: string;
  kicker: string;
  exitHref: string;
  onRetry: () => void;
};

export default function QuizSummary({ result, outcome, title, kicker, exitHref, onRetry }: Props) {
  const passed = isPassed(result);
  const stars = starsFor(result) ?? 0;
  const percent = Math.round((result.correct / result.total) * 100);
  const earned = outcome?.earned ?? [];

  useEffect(() => {
    if (passed) celebrate({ particleCount: 120, spread: 80, origin: { y: 0.35 } });
  }, [passed]);

  useEffect(() => {
    // druga salwa konfetti dla nowej odznaki
    if (earned.length > 0) celebrate({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: ["#fbbf24", "#f97316", "#a855f7"] });
  }, [earned.length]);

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:max-w-2xl lg:flex-none">
        <p className={`text-center text-xs font-extrabold uppercase tracking-widest ${passed ? "text-brand" : "text-rose-500"}`}>
          {kicker} · {passed ? "zaliczony" : "niezaliczony"}
        </p>

        <Trophy passed={passed} />

        <h1 className="text-center text-3xl leading-tight font-extrabold text-ink lg:text-4xl">
          {passed ? (
            <>
              Zrobione!
              <span className="block text-brand">{title}</span>
            </>
          ) : result.heartsLeft === 0 ? (
            "Skończyły się serca"
          ) : (
            "Prawie się udało"
          )}
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          {passed
            ? "Jeden krok bliżej zdanej matury."
            : "Do zaliczenia potrzebujesz 60% poprawnych odpowiedzi. Przejrzyj teorię i spróbuj ponownie."}
        </p>

        {earned.length > 0 && (
          <section className="mt-6 animate-pop rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {earned.length === 1 ? "Nowa odznaka!" : `Nowe odznaki: ${earned.length}`}
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {earned.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  <BadgeIcon achievement={a} unlocked />
                  <div>
                    <p className="font-extrabold text-ink">{a.title}</p>
                    <p className="text-sm text-muted">{a.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div
          className={`mt-6 flex items-center justify-between rounded-2xl border p-4 ${
            passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"
          }`}
        >
          <p className={`flex items-center gap-2 font-bold ${passed ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
            <Icon name={passed ? "checkCircle" : "target"} />
            Wynik {result.correct}/{result.total} · {percent}%
          </p>
          <Stars value={stars} size="h-5 w-5" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
            <p className="flex items-center gap-1 text-xs font-bold uppercase text-brand">
              <Icon name="layers" className="h-3.5 w-3.5" />
              Rozwiązane łącznie
            </p>
            <p className="mt-1 text-3xl font-extrabold text-brand">{outcome ? outcome.progress.stats.answered : "–"}</p>
            <p className="text-xs text-faint">{outcome ? `w tym ${outcome.progress.stats.correct} poprawnie` : "Zapisywanie…"}</p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-4 shadow-card">
            <p className="flex items-center gap-1 text-xs font-bold uppercase text-muted">
              <Icon name="target" className="h-3.5 w-3.5" />
              Poprawne
            </p>
            <p className="mt-1 text-3xl font-extrabold text-ink">
              {result.correct}/{result.total}
            </p>
            <p className="text-xs text-faint">Zalicza 60%</p>
          </div>
        </div>

        {outcome && <WeekStreak progress={outcome.progress} className="mt-3" />}

        <div className="mt-auto flex flex-col gap-3 pt-8 lg:mt-8 lg:flex-row-reverse">
          {passed ? (
            <Link
              href={exitHref}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-float transition-transform hover:-translate-y-0.5 active:bg-brand-dark"
            >
              Kontynuuj <Icon name="arrow" className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={onRetry}
                className="w-full rounded-2xl bg-brand py-4 font-bold text-white shadow-float transition-transform hover:-translate-y-0.5 active:bg-brand-dark"
              >
                Spróbuj ponownie
              </button>
              <Link
                href={exitHref}
                className="w-full rounded-2xl border border-line bg-card py-4 text-center font-bold text-muted transition-colors hover:text-ink"
              >
                Wróć do teorii
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Trophy({ passed }: { passed: boolean }) {
  return (
    <div className="relative mx-auto my-6 flex h-40 w-40 items-center justify-center">
      <div className={`absolute inset-0 rounded-full ${passed ? "bg-brand-soft" : "bg-rose-500/10"}`} />
      <div className={`absolute inset-5 rounded-full ${passed ? "bg-brand/15" : "bg-rose-500/15"}`} />
      {passed && (
        <>
          <span className="absolute top-5 left-3 h-2 w-4 rotate-[30deg] rounded-full bg-orange-400" />
          <span className="absolute top-2 right-8 h-2 w-2 rounded-full bg-emerald-400" />
          <span className="absolute right-1 bottom-12 h-2 w-4 -rotate-[20deg] rounded-full bg-brand" />
          <span className="absolute bottom-4 left-6 h-2 w-2 rounded-full bg-amber-400" />
        </>
      )}
      <div
        className={`relative flex h-24 w-24 -rotate-6 animate-pop items-center justify-center rounded-3xl text-white shadow-xl ${
          passed ? "bg-brand shadow-float" : "bg-rose-400 shadow-rose-400/30"
        }`}
      >
        <Icon name={passed ? "trophy" : "book"} className="h-11 w-11" />
      </div>
      {passed && (
        <span className="absolute right-6 bottom-6 flex h-9 w-9 animate-pop items-center justify-center rounded-full border-4 border-surface bg-emerald-500 text-white">
          <Icon name="check" className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
