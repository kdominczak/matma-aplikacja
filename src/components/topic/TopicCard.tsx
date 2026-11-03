"use client";

import Link from "next/link";
import CategoryTile from "@/components/topic/CategoryTile";
import Icon from "@/components/ui/Icon";
import { hapticTap } from "@/lib/haptics";
import { topicTaskProgress } from "@/lib/topic-progress";
import type { Progress } from "@/types/progress";
import type { Topic } from "@/types/topic";

/** Karta działu w ścieżce nauki: postęp w zadaniach działu + priorytet maturalny. */
export default function TopicCard({ topic, progress }: { topic: Topic; progress: Progress | null }) {
  const ready = Boolean(topic.content);
  // dział bez lekcji, ale z zestawem zadań – prowadzi do zakładki „Zadania”
  const tasksOnly = !ready && Boolean(topic.practice);
  const tasks = ready ? topicTaskProgress(topic, progress) : null;

  const body = (
    <>
      <CategoryTile topic={topic} muted={!ready && !tasksOnly} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          {topic.lesson} · Priorytet {topic.priority}
        </p>
        <p className={`leading-snug font-extrabold ${ready ? "text-ink" : "text-muted"}`}>{topic.title}</p>
        {ready ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            {tasks && (
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-subtle" aria-label={`Rozwiązane zadania: ${tasks.solved} z ${tasks.total}`}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${tasks.total ? (tasks.solved / tasks.total) * 100 : 0}%` }} />
              </div>
            )}
            <span className="text-xs font-semibold text-muted">
              ~{topic.studyHours} h · {topic.examShare}% matur
            </span>
          </div>
        ) : (
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap ${
              tasksOnly ? "bg-brand-soft text-brand" : "bg-subtle text-muted"
            }`}
          >
            {tasksOnly ? "Same zadania" : "Wkrótce"}
          </span>
        )}
      </div>
      {(ready || tasksOnly) && (
        <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const className = "group flex items-center gap-3 rounded-3xl border border-line glass-card p-4";
  if (!ready && !tasksOnly) {
    return <div className={`${className} opacity-60`}>{body}</div>;
  }
  return (
    <Link
      href={ready ? `/dzial/${topic.id}` : `/zadania/${topic.id}`}
      onClick={() => hapticTap()}
      className={`${className} shadow-card card-hover hover:border-brand/60 dark:hover:border-brand/40`}
    >
      {body}
    </Link>
  );
}
