"use client";

import Link from "next/link";
import { useDisplayName } from "@/components/layout/AppShell";
import { useNow } from "@/components/layout/Countdown";
import LevelSwitch from "@/components/progress/LevelSwitch";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { answersToEstimate, currentEstimate, estimateHistory } from "@/lib/estimate";
import { LEVEL_POINTS } from "@/lib/exam-weights";
import { goalPoints } from "@/lib/goal";
import { LEVEL_LONG, levelTarget } from "@/lib/level";
import { daysToMatura } from "@/lib/matura";
import type { DailyPlan } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { weekSolved } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Level } from "@/types/topic";

/**
 * Panel startowy ekranu głównego – wszystko, co uczeń chce wiedzieć w 3 sekundy: ile dni do matury (wybranego poziomu),
 * jaki ma dziś szacowany wynik względem celu i czy plan na dziś jest zrobiony. Przy obu maturach – przełącznik poziomu.
 * Warstwy: grafitowa tafla, złote światło w rogu, kafle ze szkła (bez backdrop-filter – patrz globals.css).
 */
export default function HeroPanel({ progress, plan, level }: { progress: Progress | null; plan: DailyPlan | null; level: Level }) {
  const name = useDisplayName();
  const now = useNow();
  const first = name === "Twój profil" ? null : name.split(/\s+/)[0];

  if (!progress || !plan || now === null) return <Skeleton className="h-72 rounded-[2rem]" />;

  const date = new Date(now).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
  const today = date.charAt(0).toUpperCase() + date.slice(1);
  const week = weekSolved(progress);
  const weekText = week > 0 ? `W tym tygodniu: ${week} ${plural(week, "zadanie", "zadania", "zadań")}.` : "";
  const line =
    plan.round > 0
      ? `Plan na dziś zrobiony – świetna robota! ${weekText}`
      : week > 0
        ? `${weekText} Dziś czeka plan na ok. ${plan.minutes} min.`
        : `Zacznij od planu na dziś – zajmie ok. ${plan.minutes} min.`;

  const days = daysToMatura(now, level);
  const goal = goalPoints(levelTarget(progress, level), level);
  const max = LEVEL_POINTS[level];
  const collecting = answersToEstimate(progress) > 0;
  const percent = collecting ? 0 : currentEstimate(progress, level);
  const points = Math.round((percent / 100) * max);
  const history = collecting ? [] : estimateHistory(progress, level);
  // zmiana w punktach (jak wynik obok), a nie w punktach procentowych
  const delta = history.length > 7 ? points - Math.round((history[history.length - 8].value / 100) * max) : 0;

  return (
    <section className="hero-surface relative isolate overflow-hidden rounded-[2rem] p-6 text-white sm:p-8 lg:p-10">
      <div aria-hidden className="hero-light pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full" />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/50">{today}</p>
          <h1 className="mt-1 bg-linear-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-3xl leading-tight font-extrabold tracking-tight text-transparent sm:text-4xl">
            {first ? `Cześć, ${first}!` : "Cześć!"}
          </h1>
          <p className="mt-1.5 max-w-md text-white/65">{line}</p>
        </div>
        <LevelSwitch progress={progress} tone="dark" className="w-full sm:w-64" />
      </div>

      <dl className="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-[1fr_1.6fr_1fr]">
        <div className="hero-tile">
          <dt className="hero-label">Do matury</dt>
          <dd className="mt-1 font-display text-4xl font-extrabold tracking-tight tabular-nums">
            <CountUp value={days} />
            <span className="ml-1.5 text-base font-semibold text-white/50">{plural(days, "dzień", "dni", "dni")}</span>
          </dd>
          <p className="mt-1 text-xs text-white/45">{LEVEL_LONG[level]}</p>
        </div>

        <Link href="/profil" className="hero-tile group col-span-2 row-start-2 lg:col-span-1 lg:row-start-auto" aria-label={`Szacowany wynik: ${points} z ${max} punktów`}>
          <div className="flex items-start justify-between">
            <dt className="hero-label">Szacowany wynik</dt>
            <Icon name="arrow" className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-0.5" />
          </div>
          {collecting ? (
            <dd className="mt-1">
              <p className="font-display text-2xl font-extrabold">Zbieramy dane</p>
              <p className="text-sm text-white/55">
                Jeszcze {answersToEstimate(progress)} {plural(answersToEstimate(progress), "zadanie", "zadania", "zadań")} do pierwszego szacunku.
              </p>
            </dd>
          ) : (
            <dd className="mt-1">
              <p className="font-display text-4xl font-extrabold tracking-tight tabular-nums">
                <CountUp value={points} />
                <span className="ml-1 text-base font-semibold text-white/50">/ {max} pkt</span>
              </p>
              <p className={`text-xs font-semibold ${delta > 0 ? "text-emerald-300" : "text-white/45"}`}>
                {delta > 0 ? `+${delta} ${plural(delta, "punkt", "punkty", "punktów")} w ostatnim tygodniu` : "Każde rozwiązane zadanie podnosi wynik"}
              </p>
            </dd>
          )}
          {/* pasek do celu: złoty postęp, kreska = cel */}
          <div className="relative mt-4 h-2 rounded-full bg-white/10">
            <div className="bar-grow h-full rounded-full bg-linear-to-r from-amber-200 to-brand" style={{ width: `${Math.min(percent, 100)}%` }} />
            <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-white" style={{ left: `${(goal / max) * 100}%` }} aria-hidden />
          </div>
        </Link>

        <div className="hero-tile">
          <dt className="hero-label">Twój cel</dt>
          <dd className="mt-1 font-display text-4xl font-extrabold tracking-tight tabular-nums">
            {goal}
            <span className="ml-1 text-base font-semibold text-white/50">pkt</span>
          </dd>
          <Link href="/ustawienia#cel" className="mt-1 inline-flex min-h-6 items-center text-xs font-bold text-brand hover:underline">
            Zmień cel
          </Link>
        </div>
      </dl>
    </section>
  );
}
