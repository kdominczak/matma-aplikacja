"use client";

import { useMemo } from "react";
import Link from "next/link";
import ContinueCard from "@/components/home/ContinueCard";
import Greeting from "@/components/home/Greeting";
import ReminderNudge from "@/components/home/ReminderNudge";
import WeekStreak from "@/components/home/WeekStreak";
import { Page } from "@/components/layout/AppShell";
import Welcome from "@/components/onboarding/Welcome";
import EstimateCard from "@/components/progress/EstimateCard";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { getDifficulty } from "@/data/topics";
import { DAILY_QUESTION_COUNT } from "@/lib/daily";
import { goalPoints } from "@/lib/goal";
import { buildPlan, planStreak, type DailyPlan, type PlanFocus } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { needsPlacement } from "@/lib/placement";
import { hapticTap } from "@/lib/haptics";
import { dayKey, useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";

/**
 * Strona główna – tylko to, co prowadzi do nauki dziś: powitanie → plan na dziś → „wróć do…” → wejście do lekcji,
 * a obok wynik i seria. Ścieżka działów jest w zakładce Zadania (widok „Lekcje”), czas nauki, odznaki i Pudełko
 * porażek – w Profilu. Na komputerze karty statusu są w prawej kolumnie obok planu.
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
          <Link
            href="/zadania/?widok=lekcje"
            className="card card-hover flex min-h-11 items-center gap-3 p-4 hover:border-brand/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon name="layers" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold text-ink">Lekcje i testy działów</span>
              <span className="block text-sm text-muted">Ścieżka na {goalPoints(progress?.target ?? 30)} pkt – teoria, przykłady i zadania</span>
            </span>
            <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint" />
          </Link>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-10">
          {progress && <EstimateCard progress={progress} />}
          {progress && <WeekStreak progress={progress} />}
          {progress && <ReminderNudge progress={progress} />}
        </aside>
      </div>
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
