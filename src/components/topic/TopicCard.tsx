"use client";

import Link from "next/link";
import CategoryTile from "@/components/topic/CategoryTile";
import Icon from "@/components/ui/Icon";
import { DIFFICULTIES } from "@/data/topics";
import { hapticTap } from "@/lib/haptics";
import { testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { Topic } from "@/types/topic";

/** Karta działu w planie nauki: postęp na trzech poziomach + priorytet maturalny. */
export default function TopicCard({ topic, progress }: { topic: Topic; progress: Progress | null }) {
  const ready = Boolean(topic.content);
  // dział bez lekcji, ale z zestawem zadań – prowadzi do zakładki „Zadania”
  const tasksOnly = !ready && Boolean(topic.practice);

  const body = (
    <>
      <CategoryTile topic={topic} muted={!ready && !tasksOnly} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
          {topic.lesson} · Priorytet {topic.priority}
        </p>
        <p className={`leading-snug font-extrabold ${ready ? "text-ink" : "text-muted"}`}>{topic.title}</p>
        {ready ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex gap-1" aria-label="Zaliczone poziomy">
              {DIFFICULTIES.map((level) => (
                <span
                  key={level.id}
                  title={level.label}
                  className={`h-1.5 w-6 rounded-full ${
                    progress?.tests[testKey(topic.id, level.id)] ? "bg-emerald-500" : "bg-subtle"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-faint">
              ~{topic.studyHours} h · {topic.examShare}% matur
            </span>
          </div>
        ) : (
          <span
            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
              tasksOnly ? "bg-brand-soft text-brand" : "bg-subtle text-muted"
            }`}
          >
            {tasksOnly ? "Teoria wkrótce · zadania dostępne" : "Wkrótce"}
          </span>
        )}
      </div>
      {(ready || tasksOnly) && (
        <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const className = "group flex items-center gap-3 rounded-3xl border border-line bg-card p-4";
  if (!ready && !tasksOnly) {
    return <div className={`${className} opacity-60`}>{body}</div>;
  }
  return (
    <Link
      href={ready ? `/dzial/${topic.id}` : `/zadania/${topic.id}`}
      onClick={() => hapticTap()}
      className={`${className} shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 active:scale-[0.98]`}
    >
      {body}
    </Link>
  );
}
