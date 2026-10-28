"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import QuizScreen, { type SummaryProps } from "@/components/quiz/QuizScreen";
import Icon from "@/components/ui/Icon";
import { getDifficulty } from "@/data/topics";
import { useAiReady } from "@/lib/ai-settings";
import { celebrate } from "@/lib/celebrate";
import { buildPlan, planStreak, type DailyPlan } from "@/lib/planner";
import { readProgress, savePlanResult, useProgress } from "@/lib/progress";
import { plural } from "@/lib/plural";
import { reviewsDueOn } from "@/lib/reviews";
import { dayKey, shiftDays } from "@/lib/stats";
import type { Progress } from "@/types/progress";

/** Plan bieżącej sesji i start kolejnej rundy – dla ekranu wyniku (QuizScreen przyjmuje komponent, nie dane). */
const PlanContext = createContext<{ plan: DailyPlan; nextRound: () => void } | null>(null);

/** Plan na dziś – codzienna sesja: powtórki, dział dnia i przeplatanie (src/lib/planner.ts). */
export default function PlanSession() {
  const progress = useProgress();
  // Czekamy na postęp – plan liczymy z danych ucznia, w przeglądarce.
  if (!progress) return <div className="min-h-dvh bg-surface" />;
  return <PlanRunner initial={progress} />;
}

function PlanRunner({ initial }: { initial: Progress }) {
  const aiReady = useAiReady();
  // Plan zamrożony na czas sesji – zapis wyniku zmienia postęp, ale nie może podmienić zadań w trakcie.
  const [plan, setPlan] = useState(() => buildPlan(initial));
  const [session, setSession] = useState(0);

  async function nextRound() {
    setPlan(buildPlan(await readProgress()));
    setSession((s) => s + 1);
  }

  if (plan.items.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <p className="text-xl font-extrabold text-ink">Na dziś nie mamy dla Ciebie nowych zadań.</p>
        <p className="text-muted">Wszystkie działy z Twojego celu są opanowane – spróbuj arkusza w trybie egzaminu.</p>
        <Link href="/arkusze" className="rounded-2xl bg-brand px-6 py-3 font-bold text-white">
          Przejdź do arkuszy
        </Link>
      </div>
    );
  }

  const kicker = plan.round > 0 ? `Plan na dziś · runda ${plan.round + 1}` : "Plan na dziś";
  return (
    <PlanContext.Provider value={{ plan, nextRound }}>
      <QuizScreen
        key={session}
        questions={plan.items.map((i) => i.question)}
        title={plan.focus?.topic.title ?? "Plan na dziś"}
        kicker={kicker}
        formulaGroups={plan.formulaGroups}
        hints={aiReady}
        // nauka, nie egzamin – pomyłki nie przerywają sesji, trafiają do powtórek
        hearts={false}
        exitHref="/"
        onFinish={savePlanResult}
        Summary={PlanSummary}
      />
    </PlanContext.Provider>
  );
}

function PlanSummary({ result, outcome }: SummaryProps) {
  const context = useContext(PlanContext)!;
  const { plan } = context;
  const progress = outcome?.progress;
  const tomorrow = dayKey(shiftDays(new Date(), 1));
  const reviewsTomorrow = progress ? reviewsDueOn(progress, tomorrow) : 0;
  const streakDays = progress ? planStreak(progress) : 0;
  const correctIds = new Set(result.answers.filter((a) => a.correct).map((a) => a.questionId));
  const reviewsPassed = plan.items.filter((item) => item.kind === "review" && correctIds.has(item.question.id)).length;
  const wrong = result.answered - result.correct;
  const percent = result.answered ? Math.round((result.correct / result.answered) * 100) : 0;

  useEffect(() => {
    celebrate({ particleCount: 90, spread: 75, origin: { y: 0.35 } });
  }, []);

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface px-5 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:justify-center lg:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 lg:flex-none">
        <p className="text-center text-xs font-extrabold uppercase tracking-widest text-brand">
          {plan.round > 0 ? `Runda ${plan.round + 1} ukończona` : "Plan na dziś wykonany"}
        </p>
        <div className="text-center">
          <p className="text-6xl font-extrabold tracking-tight text-ink">
            {result.correct}
            <span className="text-faint">/{result.answered}</span>
          </p>
          <p className="mt-1 text-sm text-muted">{percent >= 80 ? "Świetna robota!" : percent >= 50 ? "Dobry trening – tak się buduje wynik." : "Każda pomyłka dziś to punkt więcej w maju."}</p>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card">
          <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
          <p className="relative flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/60">
            <Icon name="flame" className="h-4 w-4 text-orange-400" />
            Plan dzień po dniu
          </p>
          <p className="relative mt-1 text-4xl font-extrabold">
            {streakDays} {plural(streakDays, "dzień", "dni", "dni")}
          </p>
          <p className="relative mt-1 text-sm text-white/70">
            {streakDays >= 7 ? "Regularność robi największą różnicę – trzymasz tempo maturzysty z wynikiem." : "Krótko, ale codziennie – tak najskuteczniej uczy się mózg."}
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-3xl border border-line glass-card p-5 shadow-card text-sm">
          {plan.focus && (
            <p className="flex items-start gap-2 text-body">
              <Icon name="target" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                Dział dnia: <strong className="text-ink">{plan.focus.topic.title}</strong> · {getDifficulty(plan.focus.difficulty).label.toLowerCase()}
              </span>
            </p>
          )}
          {reviewsPassed > 0 && (
            <p className="flex items-start gap-2 text-body">
              <Icon name="checkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                {reviewsPassed} {plural(reviewsPassed, "powtórka zaliczona", "powtórki zaliczone", "powtórek zaliczonych")} – wrócą za dłuższą przerwę, aż zostaną na stałe.
              </span>
            </p>
          )}
          {wrong > 0 && (
            <p className="flex items-start gap-2 text-body">
              <Icon name="refresh" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                {wrong} {plural(wrong, "zadanie wróci", "zadania wrócą", "zadań wróci")} jutro na powtórkę – sprawdzimy, czy już siedzi.
              </span>
            </p>
          )}
          <p className="flex items-start gap-2 text-body">
            <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
            <span>
              {reviewsTomorrow > 0 ? `Jutro: ${reviewsTomorrow} ${plural(reviewsTomorrow, "powtórka", "powtórki", "powtórek")} i nowy dział.` : "Jutro nowy dział dnia – wpadnij choćby na 10 minut."}
            </span>
          </p>
        </section>

        <div className="mt-auto flex flex-col gap-3 lg:mt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark"
          >
            Gotowe na dziś <Icon name="checkCircle" className="h-5 w-5" />
          </Link>
          <button onClick={() => void context.nextRound()} className="min-h-12 rounded-2xl border border-line bg-card font-bold text-body hover:text-ink">
            Mam jeszcze chwilę – kolejna runda
          </button>
        </div>
      </div>
    </div>
  );
}
