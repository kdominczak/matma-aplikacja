"use client";

import { useEffect, useRef } from "react";
import { isAnswered, taskNumber } from "@/lib/exam";
import type { ExamAnswer, ExamTask } from "@/types/exam";

type Props = {
  tasks: ExamTask[];
  /** Numery jak w arkuszu CKE („12.1”) – domyślnie 1, 2, 3… */
  numbers?: string[];
  answers: Record<string, ExamAnswer>;
  flagged: string[];
  current: number;
  onSelect: (index: number) => void;
  /** „strip” – przewijany pasek w nagłówku; „grid” – pełna siatka (np. w oknie „Wszystkie zadania”). */
  layout?: "strip" | "grid";
};

/** Numery zadań: rozwiązane (niebieskie), pominięte (szare), oznaczone „wrócę” (bursztynowa kropka), bieżące (obwódka). */
export default function ExamNavGrid({ tasks, numbers, answers, flagged, current, onSelect, layout = "strip" }: Props) {
  const currentRef = useRef<HTMLButtonElement>(null);

  // bieżące zadanie zawsze widoczne w pasku (także po przejściu „Dalej”)
  useEffect(() => {
    if (layout === "strip") currentRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [current, layout]);

  return (
    <nav
      aria-label="Zadania arkusza"
      className={layout === "strip" ? "-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_8px,black_calc(100%-16px),transparent)]" : "grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2"}
    >
      {tasks.map((task, i) => {
        const answered = isAnswered(answers[task.id]);
        const isFlagged = flagged.includes(task.id);
        const isCurrent = i === current;
        return (
          <button
            key={task.id}
            ref={isCurrent ? currentRef : undefined}
            onClick={() => onSelect(i)}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Zadanie ${taskNumber({ numbers }, i)}${answered ? ", rozwiązane" : ", bez odpowiedzi"}${isFlagged ? ", oznaczone do powrotu" : ""}`}
            className={`relative flex h-11 min-w-11 shrink-0 items-center justify-center rounded-xl px-2 text-sm font-extrabold tabular-nums transition-all ${
              answered ? "bg-brand text-on-brand shadow-float" : "border border-line bg-card text-muted"
            } ${isCurrent ? "ring-2 ring-brand ring-offset-2 ring-offset-surface" : ""}`}
          >
            {taskNumber({ numbers }, i)}
            {task.kind === "open" && <span aria-hidden className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />}
            {isFlagged && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-surface bg-amber-400" aria-hidden />}
          </button>
        );
      })}
    </nav>
  );
}

export function NavLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted">
      <li className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-brand" aria-hidden /> Z odpowiedzią
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-line bg-card" aria-hidden /> Bez odpowiedzi
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden /> Wrócę do tego
      </li>
      <li className="flex items-center gap-1.5">
        <span className="h-1 w-1 rounded-full bg-current" aria-hidden /> Zadanie otwarte
      </li>
    </ul>
  );
}
