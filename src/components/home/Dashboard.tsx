"use client";

import { useMemo } from "react";
import Link from "next/link";
import ContinueCard from "@/components/home/ContinueCard";
import HeroPanel from "@/components/home/HeroPanel";
import ReminderNudge from "@/components/home/ReminderNudge";
import WeekStreak from "@/components/home/WeekStreak";
import { Page } from "@/components/layout/AppShell";
import Welcome from "@/components/onboarding/Welcome";
import { useActiveLevel } from "@/components/progress/LevelSwitch";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { getDifficulty } from "@/data/topics";
import { DAILY_QUESTION_COUNT } from "@/lib/daily";
import { goalPoints } from "@/lib/goal";
import { levelTarget } from "@/lib/level";
import { buildPlan, planStreak, type DailyPlan, type PlanFocus } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { needsPlacement } from "@/lib/placement";
import CkeNotice from "@/components/legal/CkeNotice";
import { hapticTap } from "@/lib/haptics";
import { dayKey, useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";

/**
 * Strona główna – tylko to, co prowadzi do nauki dziś: panel startowy (dni do matury, szacowany wynik, cel, poziom)
 * → plan na dziś → „wróć do…” → wejście do lekcji, a obok seria. Przy obu maturach wszystko liczy się dla poziomu
 * z przełącznika. Ścieżka działów jest w zakładce Zadania, czas nauki, opanowane działy i Pudełko porażek – w Profilu.
 */
export default function Dashboard() {
  const progress = useProgress();
  const { level } = useActiveLevel(progress);
  // plan liczony raz – korzystają z niego panel startowy (czas) i karta planu
  const plan = useMemo(() => (progress ? buildPlan(progress, dayKey(), level) : null), [progress, level]);

  return (
    <Page>
      <HeroPanel progress={progress} plan={plan} level={level} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="stagger flex min-w-0 flex-col gap-5">
          <PlanCard progress={progress} plan={plan} />
          <ContinueCard progress={progress} />
          <Link
            href="/zadania/?widok=lekcje"
            className="card card-hover press flex min-h-11 items-center gap-4 p-5 hover:border-brand/60 dark:hover:border-brand/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Icon name="layers" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold text-ink">Lekcje działów{level === "rozszerzony" ? " · rozszerzenie" : ""}</span>
              <span className="block text-sm text-muted">
                Ścieżka na {goalPoints(progress ? levelTarget(progress, level) : 30, level)} pkt – teoria, przykłady i zadania
              </span>
            </span>
            <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint" />
          </Link>
        </div>

        <aside className="stagger flex flex-col gap-4 lg:sticky lg:top-10">
          {progress && <WeekStreak progress={progress} />}
          {progress && <ReminderNudge progress={progress} />}
        </aside>
      </div>
      <CkeNotice className="mt-2" />
      {/* Pierwsze uruchomienie: powitanie w 4 krokach, na końcu test na start albo „Pomiń” */}
      {progress && needsPlacement(progress) && <Welcome />}
    </Page>
  );
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
    <section className="card relative overflow-hidden p-6 lg:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand)_22%,transparent),transparent)]" />
      <span aria-hidden className="pointer-events-none absolute top-3 right-6 text-6xl text-brand/15 lg:text-7xl">
        <MathText text="$x^2$" />
      </span>
      <p className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-extrabold uppercase tracking-widest text-muted">
        <span>Plan na dziś{plan ? ` · ~${plan.minutes} min` : ""}</span>
        {days > 0 && (
          <span className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
            <Icon name="flame" className="h-3.5 w-3.5" />
            {days} {plural(days, "dzień", "dni", "dni")} z planem
          </span>
        )}
      </p>
      <h2 className="relative mt-1 text-2xl font-extrabold text-ink lg:text-3xl">
        {!plan ? "Układamy Twój plan…" : done ? "Plan na dziś wykonany!" : (plan.focus?.topic.title ?? "Zrób dziś postęp.")}
      </h2>
      {plan?.focus && !done && <p className="relative mt-1 text-sm text-muted">{focusLine(plan.focus)}</p>}
      {done && <p className="relative mt-1 text-sm text-muted">Jutro czekają powtórki i nowy dział. Masz jeszcze chwilę? Zrób kolejną rundę.</p>}

      {plan && !done && (
        <ul className="relative mt-4 flex flex-wrap gap-2 text-xs font-bold">
          {plan.reviewCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-800 dark:text-amber-200">
              <Icon name="refresh" className="h-3.5 w-3.5" />
              {plan.reviewCount} {plural(plan.reviewCount, "powtórka", "powtórki", "powtórek")}
            </li>
          )}
          {plan.focus && focusCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-body">
              <Icon name="target" className="h-3.5 w-3.5" />
              {focusCount} {plural(focusCount, "zadanie", "zadania", "zadań")} · poziom {getDifficulty(plan.focus.difficulty).label.toLowerCase()}
            </li>
          )}
          {plan.mix && mixCount > 0 && (
            <li className="flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-body">
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
            done ? "press border border-line bg-subtle text-ink hover:border-brand/60 dark:hover:border-brand/40" : "bg-cta text-on-cta shadow-float btn-hover active:bg-cta-dark"
          }`}
        >
          {done ? "Kolejna runda" : "Zaczynamy"} <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <Link
          href="/wyzwanie"
          onClick={() => hapticTap()}
          className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-bold text-muted hover:text-ink"
        >
          <Icon name={dailyDone ? "checkCircle" : "bolt"} className={`h-4 w-4 ${dailyDone ? "text-emerald-500" : ""}`} />
          Dzienne wyzwanie · {DAILY_QUESTION_COUNT} losowych zadań
        </Link>
      </div>
    </section>
  );
}

function formatPoints(points: number): string {
  return `${points.toLocaleString("pl-PL", { maximumFractionDigits: 1 })} pkt`;
}
