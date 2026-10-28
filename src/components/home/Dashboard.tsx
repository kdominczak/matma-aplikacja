"use client";

import { useMemo } from "react";
import Link from "next/link";
import NextBadge, { nextAchievement } from "@/components/achievements/NextBadge";
import ContinueCard from "@/components/home/ContinueCard";
import Greeting from "@/components/home/Greeting";
import StudyTimeCard from "@/components/home/StudyTimeCard";
import WeekStreak from "@/components/home/WeekStreak";
import { Page } from "@/components/layout/AppShell";
import MistakesCard from "@/components/mistakes/MistakesCard";
import PlacementIntro from "@/components/placement/PlacementIntro";
import EstimateCard from "@/components/progress/EstimateCard";
import TopicCard from "@/components/topic/TopicCard";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { DIFFICULTIES, getDifficulty, TARGETS, topicsForTarget } from "@/data/topics";
import { DAILY_QUESTION_COUNT } from "@/lib/daily";
import { buildPlan, planStreak, type DailyPlan, type PlanFocus } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { needsPlacement } from "@/lib/placement";
import { hapticTap } from "@/lib/haptics";
import { dayKey, passedLevels, useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Target } from "@/types/topic";

/**
 * Strona główna. Na telefonie kolejność: powitanie → plan na dziś → „wróć do…” → wynik, passa, czas, pudełko,
 * odznaka → ścieżka działów. Na komputerze karty statusu są w prawej kolumnie obok planu.
 * Każda liczba jest pokazana raz (seria – w karcie passy i przy awatarze, rozwiązane w tygodniu – w powitaniu).
 */
export default function Dashboard() {
  const progress = useProgress();
  // plan liczony raz – korzystają z niego powitanie (czas) i karta planu
  const plan = useMemo(() => (progress ? buildPlan(progress) : null), [progress]);

  return (
    <Page>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Greeting progress={progress} plan={plan} />
          <PlanCard progress={progress} plan={plan} />
          <ContinueCard progress={progress} />
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-10 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {progress && <EstimateCard progress={progress} />}
          {progress && <WeekStreak progress={progress} />}
          <StudyTimeCard />
          {progress && Object.keys(progress.mistakes).length > 0 && <MistakesCard progress={progress} />}
          {progress && <NextBadgeCard progress={progress} />}
        </aside>

        <LearningPath progress={progress} />
      </div>
      {/* Pierwsze uruchomienie: zaproszenie do testu na start (z opcją „Pomiń”) */}
      {progress && needsPlacement(progress) && <PlacementIntro />}
    </Page>
  );
}

/** Ścieżka nauki: działy z lekcjami ułożone według celu (testy na trzech poziomach). */
function LearningPath({ progress }: { progress: Progress | null }) {
  const target: Target = progress?.target ?? 30;
  const pathTopics = topicsForTarget(target).filter((t) => t.content);
  const passed = progress ? pathTopics.reduce((sum, t) => sum + passedLevels(progress, t.id), 0) : 0;
  const total = pathTopics.length * DIFFICULTIES.length;

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-start-1">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">Ścieżka nauki na {target}%</h2>
          <p className="text-sm text-muted">
            Działy z lekcjami według wagi na maturze ·{" "}
            <Link href="/ustawienia#cel" className="font-bold text-brand hover:underline">
              zmień cel
            </Link>
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-brand">
          {passed}/{total} {plural(total, "test", "testy", "testów")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${total ? (passed / total) * 100 : 0}%` }} />
      </div>

      {TARGETS.filter((t) => t.value <= target).map((group) => (
        <div key={group.value} className="mt-2 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand">{group.label}</p>
            <p className="text-sm font-semibold text-muted">{group.subtitle}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {topicsForTarget(group.value)
              .filter((topic) => topic.target === group.value)
              .map((topic) => (
                <TopicCard key={topic.id} topic={topic} progress={progress} />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function NextBadgeCard({ progress }: { progress: Progress }) {
  const achievement = nextAchievement(progress);
  return achievement ? <NextBadge progress={progress} achievement={achievement} card /> : null;
}

/** Skuteczność w dziale dnia: przy kilku odpowiedziach liczby („Ostatnio 1/3”), a nie zniechęcający procent. */
function focusLine(focus: PlanFocus): string {
  const points = `średnio ${formatPoints(focus.examPoints)} na maturze`;
  if (focus.accuracy === null) return `Nowy dział – ${points}. Zaczynamy od podstaw.`;
  if (focus.answered < 5) {
    const comeback = focus.correct / focus.answered < 0.5 ? " – dziś to nadrobimy." : ".";
    return `Dział dnia – ${points}. Ostatnio ${focus.correct}/${focus.answered}${comeback}`;
  }
  const percent = Math.round(focus.accuracy * 100);
  return percent < 50
    ? `Dział dnia – ${points}. Skuteczność ${percent}% – tu zyskasz najwięcej punktów.`
    : `Dział dnia – ${points}. Twoja skuteczność: ${percent}%.`;
}

/**
 * Plan na dziś – główna karta ekranu: co konkretnie zrobić dziś i dlaczego (src/lib/planner.ts).
 * Pod spodem dzienne wyzwanie jako dodatkowa, luźniejsza opcja.
 */
function PlanCard({ progress, plan }: { progress: Progress | null; plan: DailyPlan | null }) {
  const done = plan ? plan.round > 0 : false;
  const days = progress ? planStreak(progress) : 0;
  const focusCount = plan?.items.filter((i) => i.kind === "focus").length ?? 0;
  const mixCount = plan?.items.filter((i) => i.kind === "mix").length ?? 0;
  const dailyDone = progress?.dailyDone === dayKey();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card lg:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute top-3 right-6 text-6xl text-white/15 lg:text-7xl">
        <MathText text="$x^2$" />
      </span>
      <p className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-widest text-white/60">
        <span>Plan na dziś{plan ? ` · ~${plan.minutes} min` : ""}</span>
        {days > 0 && (
          <span className="flex items-center gap-1 text-orange-300">
            <Icon name="flame" className="h-3.5 w-3.5" />
            {days} {plural(days, "dzień", "dni", "dni")} z planem
          </span>
        )}
      </p>
      <h2 className="relative mt-1 text-2xl font-extrabold lg:text-3xl">
        {!plan ? "Układamy Twój plan…" : done ? "Plan na dziś wykonany!" : (plan.focus?.topic.title ?? "Zrób dziś postęp.")}
      </h2>
      {plan?.focus && !done && <p className="relative mt-1 text-sm text-white/70">{focusLine(plan.focus)}</p>}
      {done && <p className="relative mt-1 text-sm text-white/70">Jutro czekają powtórki i nowy dział. Masz jeszcze chwilę? Zrób kolejną rundę.</p>}

      {plan && !done && (
        <ul className="relative mt-4 flex flex-wrap gap-2 text-xs font-bold">
          {plan.reviewCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-200">
              <Icon name="refresh" className="h-3.5 w-3.5" />
              {plan.reviewCount} {plural(plan.reviewCount, "powtórka", "powtórki", "powtórek")}
            </li>
          )}
          {plan.focus && focusCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/90">
              <Icon name="target" className="h-3.5 w-3.5" />
              {focusCount} {plural(focusCount, "zadanie", "zadania", "zadań")} · poziom {getDifficulty(plan.focus.difficulty).label.toLowerCase()}
            </li>
          )}
          {plan.mix && mixCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/90">
              <Icon name="shapes" className="h-3.5 w-3.5" />
              {mixCount} dla odmiany: {plan.mix.title}
            </li>
          )}
        </ul>
      )}

      <div className="relative mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/plan"
          onClick={() => hapticTap()}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold sm:min-w-64 sm:px-6 ${
            done ? "bg-white/10 text-white hover:bg-white/15" : "bg-brand text-white shadow-float btn-hover btn-shine active:bg-brand-dark"
          }`}
        >
          {done ? "Kolejna runda" : "Zaczynamy"} <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <Link
          href="/wyzwanie"
          onClick={() => hapticTap()}
          className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-bold text-white/70 hover:text-white"
        >
          <Icon name={dailyDone ? "checkCircle" : "bolt"} className={`h-4 w-4 ${dailyDone ? "text-emerald-400" : ""}`} />
          Dzienne wyzwanie · {DAILY_QUESTION_COUNT} losowych zadań
        </Link>
      </div>
    </section>
  );
}

function formatPoints(points: number): string {
  return `${points.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} pkt`;
}
