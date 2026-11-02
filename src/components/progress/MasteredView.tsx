"use client";

import { Page, PageHeader } from "@/components/layout/AppShell";
import { MasteryRows, MasterySummary } from "@/components/progress/MasteredTopics";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { extendedTopics, topics } from "@/data/topics";
import { LEVEL_LONG, studentLevels } from "@/lib/level";
import { useProgress } from "@/lib/progress";
import { topicMasteryRows } from "@/lib/topic-progress";

/** „Opanowane działy” – zastąpiły odznaki: każdy dział z trzema poziomami, osobno podstawa i rozszerzenie. */
export default function MasteredView() {
  const progress = useProgress();
  if (!progress) return <PageSkeleton />;

  const groups = studentLevels(progress).map((level) => ({
    level,
    rows: topicMasteryRows(progress, level === "rozszerzony" ? extendedTopics : topics),
  }));

  return (
    <Page width="reading">
      <PageHeader title="Opanowane działy" subtitle="Które działy masz już w małym palcu, a które trzeba jeszcze dokończyć." />
      {groups.map(({ level, rows }) => (
        <section key={level} className="card overflow-hidden" aria-label={LEVEL_LONG[level]}>
          <div className="flex flex-col gap-3 p-5">
            {groups.length > 1 && <p className="text-xs font-extrabold uppercase tracking-widest text-brand">{LEVEL_LONG[level]}</p>}
            <MasterySummary rows={rows} />
          </div>
          <div className="border-t border-line">
            <MasteryRows rows={rows} />
          </div>
        </section>
      ))}
    </Page>
  );
}
