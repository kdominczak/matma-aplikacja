"use client";

import WeekStreak from "@/components/home/WeekStreak";
import { Page, PageHeader } from "@/components/layout/AppShell";
import MistakesCard from "@/components/mistakes/MistakesCard";
import EstimateChart from "@/components/progress/EstimateChart";
import TopicCard from "@/components/topic/TopicCard";
import AiSettingsCard from "@/components/tutor/AiSettingsCard";
import Icon, { type IconName } from "@/components/ui/Icon";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import { topics } from "@/data/topics";
import { currentEstimate } from "@/lib/estimate";
import { passedLevels, streak, totalStars, useProgress, userLevel, XP_PER_LEVEL } from "@/lib/progress";

export default function ProgressView() {
  const progress = useProgress();
  if (!progress) return null;

  const started = topics.filter((t) => passedLevels(progress, t.id) > 0);
  const levelProgress = progress.xp % XP_PER_LEVEL;

  const stats: { icon: IconName; label: string; value: string | number; tone: string }[] = [
    { icon: "bolt", label: "Łącznie XP", value: progress.xp, tone: "text-brand" },
    { icon: "flame", label: "Seria", value: `${streak(progress)} dni`, tone: "text-orange-500" },
    { icon: "star", label: "Gwiazdki", value: totalStars(progress), tone: "text-amber-500" },
    {
      icon: "checkCircle",
      label: "Poprawne odp.",
      value: progress.stats.correct,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <Page>
      <PageHeader title="Postępy" subtitle="Twoja droga do matury w liczbach." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-line bg-card p-5 shadow-card lg:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-ink">Szacowany wynik matury</h2>
              <p className="text-sm text-muted">Na podstawie zaliczonych testów i wagi działów w arkuszu</p>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-brand">{currentEstimate(progress)}%</p>
          </div>
          <div className="mt-4">
            <EstimateChart progress={progress} />
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="rounded-3xl bg-navy p-5 text-white shadow-card">
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">Twój poziom</p>
            <p className="mt-1 text-3xl font-extrabold">Poziom {userLevel(progress.xp)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(levelProgress / XP_PER_LEVEL) * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-white/70">
              Jeszcze {XP_PER_LEVEL - levelProgress} XP do poziomu {userLevel(progress.xp) + 1}
            </p>
          </section>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-line bg-card p-4 shadow-card">
                <p className={`flex items-center gap-1 text-xs font-bold uppercase ${stat.tone}`}>
                  <Icon name={stat.icon} className="h-3.5 w-3.5" />
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-extrabold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MistakesCard progress={progress} />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <WeekStreak progress={progress} />
        <section className="rounded-3xl border border-line bg-card p-5 shadow-card">
          <h2 className="font-extrabold text-ink">Wygląd</h2>
          <p className="mb-3 text-sm text-muted">Motyw jasny, ciemny lub zgodny z ustawieniami telefonu.</p>
          <ThemeSwitcher />
        </section>
      </div>

      <div id="ustawienia-ai" className="scroll-mt-6">
        <AiSettingsCard />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-ink">Rozpoczęte działy</h2>
        {started.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">
            Zalicz pierwszy test, a Twoje działy pojawią się tutaj.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {started.map((topic) => (
              <TopicCard key={topic.id} topic={topic} progress={progress} />
            ))}
          </div>
        )}
      </section>
    </Page>
  );
}
