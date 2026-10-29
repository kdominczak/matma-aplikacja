"use client";

import Link from "next/link";
import TopicCard from "@/components/topic/TopicCard";
import { DIFFICULTIES, TARGETS, topicsForTarget } from "@/data/topics";
import { plural } from "@/lib/plural";
import { passedLevels } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Target } from "@/types/topic";

/** Ścieżka nauki: działy z lekcjami ułożone według celu (testy na trzech poziomach). */
export default function LearningPath({ progress }: { progress: Progress | null }) {
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
