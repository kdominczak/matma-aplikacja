"use client";

import { useEffect } from "react";
import Link from "next/link";
import QuizScreen, { type SummaryProps } from "@/components/quiz/QuizScreen";
import Icon from "@/components/ui/Icon";
import { celebrate } from "@/lib/celebrate";
import { DIFFICULTIES, formulaGroup, getTopic, placementQuestions, TARGETS } from "@/data/topics";
import { scorePlacement } from "@/lib/placement";
import { savePlacementResult } from "@/lib/progress";

const ITEMS = placementQuestions();
// Wzory z działów, których dotyczy test (jak karta wzorów na maturze)
const FORMULAS = [...new Map(ITEMS.filter((i) => i.topic.content).map((i) => [i.topic.id, i.topic])).values()].map(formulaGroup);

/** Test na start: diagnoza bez serc i podpowiedzi – na końcu cel i wstępnie zaliczone poziomy. */
export default function PlacementTest() {
  return (
    <QuizScreen
      questions={ITEMS.map((i) => i.question)}
      title="Test na start"
      kicker="Test na start"
      formulaGroups={FORMULAS}
      hints={false}
      hearts={false}
      exitHref="/"
      onFinish={savePlacementResult}
      Summary={PlacementSummary}
    />
  );
}

function PlacementSummary({ result, outcome }: SummaryProps) {
  const score = scorePlacement(result.answers);
  const target = TARGETS.find((t) => t.value === score.target)!;
  const placement = outcome?.progress.placement;
  const credited = placement?.status === "done" ? placement.credited : [];

  useEffect(() => {
    celebrate({ particleCount: 100, spread: 80, origin: { y: 0.35 } });
  }, []);

  // „potegi-i-pierwiastki/sredni” → dział + najwyższy zaliczony poziom
  const creditedTopics = [...new Set(credited.map((key) => key.split("/")[0]))].map((topicId) => {
    const levels = credited.filter((k) => k.startsWith(`${topicId}/`)).map((k) => k.split("/")[1]);
    const top = DIFFICULTIES.filter((d) => levels.includes(d.id)).at(-1)!;
    return { topic: getTopic(topicId)!, level: top.label };
  });

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 lg:flex-none">
        <p className="text-center text-xs font-extrabold uppercase tracking-widest text-brand">Test na start · wynik</p>
        <div className="text-center">
          <p className="text-6xl font-extrabold tracking-tight text-ink">
            {score.correct}
            <span className="text-faint">/{score.total}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Podstawy: {score.basic.correct}/{score.basic.total} · zadania trudniejsze: {score.hard.correct}/{score.hard.total}
          </p>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card">
          <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
          <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">Twój cel na maturze</p>
          <p className="relative mt-1 text-4xl font-extrabold">{target.label}</p>
          <p className="relative mt-1 text-sm text-white/70">
            {target.subtitle}.{" "}
            {score.target === 30
              ? "Zaczniemy od fundamentów – to one dają najwięcej punktów najmniejszym kosztem."
              : score.target === 60
                ? "Masz solidne podstawy – czas dołożyć funkcje, ciągi i geometrię."
                : "Świetny start! Celujemy wysoko – przed Tobą geometria i zadania optymalizacyjne."}
          </p>
          <p className="relative mt-3 text-xs text-white/50">Cel zmienisz w każdej chwili w profilu.</p>
        </section>

        <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-extrabold text-ink">
            <Icon name="checkCircle" className="h-5 w-5 text-emerald-500" />
            Zaliczone na start
          </h2>
          {creditedTopics.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Tym razem nic – i dobrze, przejdziemy wszystko krok po kroku.</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">Te poziomy masz już odblokowane. Gwiazdki zdobędziesz w prawdziwych testach.</p>
              <ul className="mt-3 flex flex-col gap-2">
                {creditedTopics.map(({ topic, level }) => (
                  <li key={topic.id} className="flex items-center justify-between gap-3 rounded-2xl bg-subtle px-3 py-2 text-sm">
                    <span className="font-bold text-ink">{topic.title}</span>
                    <span className="shrink-0 text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">do: {level}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {score.total - score.correct > 0 && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon name="archive" className="h-4 w-4 shrink-0 text-rose-500" />
            {score.total - score.correct} {score.total - score.correct === 1 ? "zadanie trafiło" : "zadania trafiły"} do Pudełka porażek.
          </p>
        )}

        <Link
          href="/"
          className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark lg:mt-2"
        >
          Zobacz swój plan <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
