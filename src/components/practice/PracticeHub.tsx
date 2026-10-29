"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Page, PageHeader } from "@/components/layout/AppShell";
import CategoryTile from "@/components/topic/CategoryTile";
import LearningPath from "@/components/topic/LearningPath";
import Icon from "@/components/ui/Icon";
import { practiceTasks, topics } from "@/data/topics";
import { hapticTap } from "@/lib/haptics";
import { useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Category, Topic } from "@/types/topic";

const CATEGORIES: (Category | "Wszystkie")[] = ["Wszystkie", "Liczby", "Algebra", "Funkcje", "Geometria", "Statystyka"];

type View = "zadania" | "lekcje";

/** Widok w adresie (?widok=lekcje) – skróty z ekranu głównego i Profilu otwierają od razu lekcje, „wstecz” wraca do nich. */
function useView(): [View, (view: View) => void] {
  const router = useRouter();
  const view: View = useSearchParams().get("widok") === "lekcje" ? "lekcje" : "zadania";
  return [view, (next) => router.replace(next === "lekcje" ? "/zadania/?widok=lekcje" : "/zadania/", { scroll: false })];
}

/**
 * Zakładka „Zadania”: wszystkie działy dostępne od razu. Dwa widoki: zadania z działów (zamknięte i otwarte)
 * oraz ścieżka lekcji z testami na trzech poziomach (ułożona według celu ucznia).
 */
export default function PracticeHub() {
  const progress = useProgress();
  const [view, setView] = useView();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Wszystkie");
  const shown = topics.filter((t) => practiceTasks(t).length > 0 && (category === "Wszystkie" || t.category === category));

  return (
    <Page>
      <PageHeader
        title="Zadania"
        subtitle="Zadania maturalne i lekcje z każdego działu – z brudnopisem i kalkulatorem."
        action={
          <Link
            href="/wzory"
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-card px-3 py-2 text-sm font-bold text-brand transition-colors hover:border-brand/40"
          >
            <Icon name="book" className="h-4 w-4" />
            Wzory
          </Link>
        }
      />

      <div role="tablist" aria-label="Widok" className="grid grid-cols-2 gap-1 rounded-2xl bg-subtle p-1">
        {(
          [
            ["zadania", "Zadania"],
            ["lekcje", "Lekcje i testy"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => {
              hapticTap();
              setView(id);
            }}
            className={`min-h-11 rounded-xl text-sm font-bold transition-colors ${view === id ? "bg-card text-ink shadow-card" : "text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "lekcje" ? (
        <LearningPath progress={progress} />
      ) : (
        <>
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Kategorie">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
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
        </>
      )}
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
      className="card group flex flex-col gap-3 p-4 card-hover hover:border-brand/40"
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
