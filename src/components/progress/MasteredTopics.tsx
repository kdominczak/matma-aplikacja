"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { practiceTasks } from "@/data/topics";
import { MIN_ANSWERS } from "@/lib/mastery";
import type { LevelState, TopicMasteryRow } from "@/lib/topic-progress";
import type { Difficulty } from "@/types/topic";

const LEVEL_SHORT: Record<Difficulty, string> = { podstawowy: "podst.", sredni: "śr.", zaawansowany: "zaaw." };
const LEVEL_NAME: Record<Difficulty, string> = { podstawowy: "podstawowy", sredni: "średni", zaawansowany: "zaawansowany" };
const STATE_DOT: Record<LevelState, string> = { mastered: "bg-good", progress: "bg-amber-400", none: "bg-line" };
const STATE_TEXT: Record<LevelState, string> = { mastered: "opanowany", progress: "w toku", none: "bez zadań" };

/** Zasada opanowania – ta sama w Profilu i na ekranie „Opanowane działy”. */
export const MASTERY_RULE = `Poziom jest opanowany przy co najmniej ${MIN_ANSWERS} odpowiedziach i ok. 75% poprawnych. Dział – gdy opanowane są wszystkie trzy poziomy.`;

/** Licznik „X z N działów opanowanych” z paskiem. */
export function MasterySummary({ rows }: { rows: TopicMasteryRow[] }) {
  const done = rows.filter((r) => r.mastered).length;
  const levels = rows.reduce((sum, r) => sum + r.levels.filter((l) => l.state === "mastered").length, 0);
  const percent = rows.length ? Math.round((done / rows.length) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-extrabold tracking-tight text-ink tabular-nums">{done}</span>
        <span className="font-bold text-muted">z {rows.length} działów opanowanych</span>
      </p>
      <span className="block h-2 overflow-hidden rounded-full bg-subtle" aria-hidden>
        <span className="bar-grow block h-full rounded-full bg-good" style={{ width: `${Math.max(percent, done ? 3 : 0)}%` }} />
      </span>
      <p className="text-xs text-faint">
        Opanowane poziomy: {levels} z {rows.length * 3}. {MASTERY_RULE}
      </p>
    </div>
  );
}

/** Lista działów z trzema poziomami; wiersz prowadzi do zadań działu. */
export function MasteryRows({ rows }: { rows: TopicMasteryRow[] }) {
  return (
    <ul className="flex flex-col divide-y divide-line">
      {rows.map(({ topic, levels, mastered, answered }) => {
        const href = practiceTasks(topic).length > 0 ? `/zadania/${topic.id}` : `/dzial/${topic.id}`;
        return (
          <li key={topic.id}>
            <Link href={href} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-subtle/60 active:bg-subtle">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-sm font-bold text-ink">{topic.title}</span>
                  {mastered && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-good-soft px-2 py-0.5 text-xs font-bold text-good">
                      <Icon name="checkCircle" className="h-3.5 w-3.5" />
                      Opanowany
                    </span>
                  )}
                </span>
                <span className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                  {levels.map((l) => (
                    <span key={l.difficulty} className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${STATE_DOT[l.state]}`} aria-hidden />
                      <span aria-hidden>{LEVEL_SHORT[l.difficulty]}</span>
                      <span className="sr-only">
                        Poziom {LEVEL_NAME[l.difficulty]}: {STATE_TEXT[l.state]}
                        {l.answered > 0 ? `, ${l.correct} z ${l.answered} poprawnie` : ""}
                      </span>
                    </span>
                  ))}
                  <span className="ml-auto text-faint">{answered > 0 ? `${answered} odp.` : "nie zaczęty"}</span>
                </span>
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
