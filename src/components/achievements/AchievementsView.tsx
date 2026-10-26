"use client";

import { BadgeCard } from "@/components/achievements/Badge";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useProgress } from "@/lib/progress";

export default function AchievementsView() {
  const progress = useProgress();
  if (!progress) return null;

  const earned = ACHIEVEMENTS.filter((a) => progress.achievements[a.id]);
  // najpierw zdobyte, potem te najbliżej zdobycia
  const locked = ACHIEVEMENTS.filter((a) => !progress.achievements[a.id]).sort(
    (a, b) => b.current(progress) / b.goal - a.current(progress) / a.goal,
  );

  return (
    <Page>
      <PageHeader title="Odznaki" subtitle="Zdobywaj je za systematyczność, dokładność i opanowane działy." />

      <section className="flex items-center gap-4 rounded-3xl bg-navy p-5 text-white">
        <div className="flex-1">
          <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">Kolekcja</p>
          <p className="mt-1 text-3xl font-extrabold">
            {earned.length}
            <span className="text-white/50">/{ACHIEVEMENTS.length}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${(earned.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {earned.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-extrabold text-ink">Zdobyte</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {earned.map((a) => (
              <BadgeCard key={a.id} achievement={a} progress={progress} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-ink">Do zdobycia</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {locked.map((a) => (
            <BadgeCard key={a.id} achievement={a} progress={progress} />
          ))}
        </div>
      </section>
    </Page>
  );
}
