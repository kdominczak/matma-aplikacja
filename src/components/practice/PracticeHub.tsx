"use client";

import { useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import CategoryTile from "@/components/topic/CategoryTile";
import Icon from "@/components/ui/Icon";
import { practiceTasks, topics } from "@/data/topics";
import { hapticTap } from "@/lib/haptics";
import { useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Category, Topic } from "@/types/topic";

const CATEGORIES: (Category | "Wszystkie")[] = ["Wszystkie", "Liczby", "Algebra", "Funkcje", "Geometria", "Statystyka"];

/** Zakładka „Zadania”: wszystkie działy dostępne od razu – wybierasz dział i rozwiązujesz zadania zamknięte i otwarte. */
export default function PracticeHub() {
  const progress = useProgress();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Wszystkie");
  const shown = topics.filter((t) => practiceTasks(t).length > 0 && (category === "Wszystkie" || t.category === category));

  return (
    <Page>
      <PageHeader
        title="Zadania"
        subtitle="Wybierz dowolny dział i rozwiązuj zadania maturalne – zamknięte i otwarte, z brudnopisem, kalkulatorem i wzorami pod ręką."
      />

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Kategorie">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
              category === c ? "border-brand bg-brand text-white shadow-float" : "border-line bg-card text-muted hover:text-ink"
            }`}
          >
            {c}
          </button>
        ))}
      </nav>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((topic) => (
          <TopicTasksCard key={topic.id} topic={topic} progress={progress} />
        ))}
      </div>
    </Page>
  );
}

function TopicTasksCard({ topic, progress }: { topic: Topic; progress: Progress | null }) {
  const tasks = practiceTasks(topic);
  const closed = tasks.filter((t) => t.kind === "closed").length;
  const open = tasks.length - closed;
  const solved = tasks.filter((t) => {
    const record = progress?.practice[t.id];
    return record && record.points === record.maxPoints;
  }).length;

  return (
    <Link
      href={`/zadania/${topic.id}`}
      onClick={() => hapticTap()}
      className="group flex flex-col gap-3 rounded-3xl border border-line bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40"
    >
      <div className="flex items-center gap-3">
        <CategoryTile topic={topic} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
            {topic.lesson} · {topic.category}
          </p>
          <p className="leading-snug font-extrabold text-ink">{topic.title}</p>
        </div>
        <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs font-bold">
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-brand">{closed} zamkniętych</span>
        <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-violet-600 dark:text-violet-300">{open} otwarte</span>
      </div>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${(solved / tasks.length) * 100}%` }} />
        </div>
        <p className="mt-1 text-xs font-semibold text-faint">
          Rozwiązane: {solved}/{tasks.length}
        </p>
      </div>
    </Link>
  );
}
