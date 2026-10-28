"use client";

import Link from "next/link";
import { BadgeIcon } from "@/components/achievements/Badge";
import StudyTimeCard from "@/components/home/StudyTimeCard";
import WeekStreak from "@/components/home/WeekStreak";
import { Page } from "@/components/layout/AppShell";
import MistakesCard from "@/components/mistakes/MistakesCard";
import PlacementIntro from "@/components/placement/PlacementIntro";
import EstimateCard from "@/components/progress/EstimateCard";
import TopicCard from "@/components/topic/TopicCard";
import Icon, { type IconName } from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { DIFFICULTIES, TARGETS, topicsForTarget } from "@/data/topics";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { DAILY_QUESTION_COUNT } from "@/lib/daily";
import { needsPlacement } from "@/lib/placement";
import { hapticTap } from "@/lib/haptics";
import { dayKey, passedLevels, streak, useProgress, weekSolved } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Target } from "@/types/topic";

export default function Dashboard() {
  const progress = useProgress();
  const target: Target = progress?.target ?? 30;
  const planTopics = topicsForTarget(target).filter((t) => t.content);
  const planDone = progress ? planTopics.reduce((sum, t) => sum + passedLevels(progress, t.id), 0) : 0;
  const planTotal = planTopics.length * DIFFICULTIES.length;

  return (
    <Page>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section>
            {/* gradient przez cały nagłówek – „Wielkie wyniki” wypadają na jego najjaśniejszym, niebieskim końcu */}
            <h1 className="bg-linear-to-r from-navy via-brand-dark to-brand bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-blue-400 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Małe kroki. Wielkie wyniki.
            </h1>
            <p className="mt-2 text-muted lg:text-lg">Twój następny sukces na maturze zaczyna się tu.</p>
          </section>

          <QuickStats progress={progress} className="lg:hidden" />
          <StudyTimeCard className="lg:hidden" />
          <DailyCard progress={progress} />

          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-ink">Twój plan na {target}%</h2>
                <p className="text-sm text-muted">
                  Działy ułożone według wagi na maturze ·{" "}
                  <Link href="/ustawienia#cel" className="font-bold text-brand hover:underline">
                    zmień cel
                  </Link>
                </p>
              </div>
              <span className="shrink-0 text-sm font-bold text-brand">
                {planDone}/{planTotal} testów
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-subtle">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${planTotal ? (planDone / planTotal) * 100 : 0}%` }}
              />
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
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-10">
          <QuickStats progress={progress} className="hidden lg:grid" />
          <StudyTimeCard className="hidden lg:block" />
          {progress && <EstimateCard progress={progress} />}
          {progress && <WeekStreak progress={progress} />}
          {progress && Object.keys(progress.mistakes).length > 0 && <MistakesCard progress={progress} />}
          {progress && <NextBadges progress={progress} />}
        </aside>
      </div>
      {/* Pierwsze uruchomienie: zaproszenie do testu na start (z opcją „Pomiń”) */}
      {progress && needsPlacement(progress) && <PlacementIntro />}
    </Page>
  );
}

function QuickStats({ progress, className = "" }: { progress: Progress | null; className?: string }) {
  const days = progress ? streak(progress) : 0;
  const items: { icon: IconName; value: string; caption: string; style: string }[] = [
    {
      icon: "flame",
      value: progress ? `${days} dni serii` : "–",
      caption: days > 0 ? "Zachowaj serię" : "Zacznij serię dziś",
      style: "border-orange-500/25 bg-orange-500/10 text-orange-500",
    },
    {
      icon: "bolt",
      value: progress ? `${weekSolved(progress)} zadań` : "–",
      caption: "Rozwiązane w tym tygodniu",
      style: "border-brand/25 bg-brand-soft text-brand",
    },
  ];
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      {items.map((item) => (
        <div key={item.icon} className={`flex items-center gap-3 rounded-2xl border p-3 ${item.style}`}>
          <Icon name={item.icon} className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-ink">{item.value}</p>
            <p className="truncate text-xs text-muted">{item.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DailyCard({ progress }: { progress: Progress | null }) {
  const done = progress?.dailyDone === dayKey();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card lg:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute top-3 right-6 text-6xl text-white/15 lg:text-7xl">
        <MathText text="$x^2$" />
      </span>
      <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">
        Dzienne wyzwanie · {DAILY_QUESTION_COUNT} zadań
      </p>
      <h2 className="relative mt-1 text-2xl font-extrabold lg:text-3xl">
        {done ? "Dzisiejszy cel zaliczony!" : "Zrób dziś postęp."}
      </h2>
      <p className="relative mt-1 text-sm text-white/70">Mieszanka zadań z Twojego planu · ~8 min</p>
      {done ? (
        <p className="relative mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3.5 font-bold sm:max-w-xs">
          <Icon name="checkCircle" className="h-5 w-5 text-emerald-400" />
          Wróć jutro po nowe zadania
        </p>
      ) : (
        <Link
          href="/wyzwanie"
          onClick={() => hapticTap()}
          className="relative mt-5 flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark sm:max-w-xs"
        >
          Rozpocznij wyzwanie <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}

/** Trzy niezdobyte odznaki najbliżej zdobycia. */
function NextBadges({ progress }: { progress: Progress }) {
  const next = ACHIEVEMENTS.filter((a) => !progress.achievements[a.id])
    .sort((a, b) => b.current(progress) / b.goal - a.current(progress) / a.goal)
    .slice(0, 3);
  if (next.length === 0) return null;

  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-ink">Najbliższe odznaki</h2>
        <Link href="/odznaki" className="-my-2 flex min-h-11 items-center text-sm font-bold text-brand">
          Wszystkie
        </Link>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {next.map((a) => {
          const current = Math.min(a.current(progress), a.goal);
          return (
            <li key={a.id} className="flex items-center gap-3">
              <BadgeIcon achievement={a} unlocked={false} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{a.title}</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-subtle">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(current / a.goal) * 100}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-faint">
                {current}/{a.goal}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
