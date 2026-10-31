"use client";

import Link from "next/link";
import TopicCard from "@/components/topic/TopicCard";
import { topics } from "@/data/topics";
import { goalPoints, topicsForGoal } from "@/lib/goal";
import { plural } from "@/lib/plural";
import { topicTaskProgress } from "@/lib/topic-progress";
import type { Progress } from "@/types/progress";

/**
 * Ścieżka nauki: działy potrzebne do celu ucznia (wyliczone z wag na maturze) w kolejności programu,
 * a pod nimi pozostałe – „na wyższy wynik”.
 */
export default function LearningPath({ progress }: { progress: Progress | null }) {
  const target = progress?.target ?? 30;
  const needed = new Set(topicsForGoal(target).map((t) => t.id));
  const withLessons = topics.filter((t) => t.content);
  const pathTopics = withLessons.filter((t) => needed.has(t.id));
  const rest = withLessons.filter((t) => !needed.has(t.id));
  const counts = pathTopics.map((t) => topicTaskProgress(t, progress));
  const passed = counts.reduce((sum, c) => sum + c.solved, 0);
  const total = counts.reduce((sum, c) => sum + c.total, 0);

  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-start-1">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">Ścieżka na {goalPoints(target)} pkt</h2>
          <p className="text-sm text-muted">
            Działy potrzebne do Twojego celu ·{" "}
            <Link href="/ustawienia#cel" className="font-bold text-brand hover:underline">
              zmień cel
            </Link>
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-brand">
          {passed}/{total} {plural(total, "zadanie", "zadania", "zadań")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${total ? (passed / total) * 100 : 0}%` }} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {pathTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} progress={progress} />
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Na wyższy wynik</p>
            <p className="text-sm font-semibold text-muted">poza Twoim celem – kiedy zechcesz</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {rest.map((topic) => (
              <TopicCard key={topic.id} topic={topic} progress={progress} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
