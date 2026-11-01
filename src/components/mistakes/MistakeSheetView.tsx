"use client";

import { useState } from "react";
import Link from "next/link";
import TaskSession, { type SessionTask } from "@/components/practice/TaskSession";
import Icon from "@/components/ui/Icon";
import { QuizSkeleton } from "@/components/ui/Skeleton";
import { findTask, formulaGroup } from "@/data/topics";
import { useExamAttempts } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import { buildMistakeSheet, SHEET_DAYS, type MistakeSheet, type SheetItem } from "@/lib/mistake-sheet";
import { plural } from "@/lib/plural";
import { useProgress } from "@/lib/progress";
import { formatDay } from "@/lib/stats";
import type { Topic } from "@/types/topic";

/**
 * Spersonalizowany arkusz poprawek z błędów – rozwiązywany w aplikacji jak zadania z działu (ten sam ekran:
 * brudnopis, podpowiedzi, sprawdzanie). Najpierw podsumowanie z wyborem okresu, potem sesja na zamrożonym zestawie:
 * poprawne odpowiedzi usuwają zadania z Pudełka porażek, a lista na ekranie ma zostać ta sama.
 */
export default function MistakeSheetView() {
  const progress = useProgress();
  const attempts = useExamAttempts();
  const [allTime, setAllTime] = useState(false);
  const [started, setStarted] = useState<MistakeSheet | null>(null);

  if (started) return <Session sheet={started} />;
  if (!progress || !attempts) return <QuizSkeleton />;

  const sheet = buildMistakeSheet(progress, attempts, { days: allTime ? null : SHEET_DAYS });
  const empty = sheet.items.length === 0;
  const topics = [...new Set(sheet.items.map((i) => topicOf(i)?.title).filter(Boolean))];
  const open = sheet.items.filter((i) => i.task.kind === "open").length;

  return (
    <div className="flex min-h-dvh animate-fade-in flex-col bg-surface pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-4 sm:px-6">
        <Link href="/bledy" className="-ml-1 flex min-h-11 items-center gap-1 self-start text-sm font-bold text-muted hover:text-ink">
          <Icon name="back" className="h-4 w-4" />
          Pudełko porażek
        </Link>

        <header>
          <h1 className="text-2xl font-extrabold text-ink">Arkusz poprawek z błędów</h1>
          <p className="mt-1 text-muted">Zadania, które sprawiły Ci najwięcej kłopotu – rozwiąż je jeszcze raz, tym razem do końca.</p>
        </header>

        <div role="radiogroup" aria-label="Okres" className="grid grid-cols-2 rounded-2xl border border-line bg-card p-1 shadow-card">
          {[
            { all: false, label: `Ostatnie ${SHEET_DAYS} dni` },
            { all: true, label: "Od początku" },
          ].map((option) => (
            <button
              key={option.label}
              role="radio"
              aria-checked={allTime === option.all}
              onClick={() => setAllTime(option.all)}
              className={`min-h-10 rounded-xl text-sm font-bold transition-colors ${allTime === option.all ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {empty ? (
          <section className="card flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <Icon name="checkCircle" className="h-7 w-7" />
            </span>
            <h2 className="text-lg font-extrabold text-ink">{allTime ? "Nie ma czego poprawiać" : `Brak błędów z ostatnich ${SHEET_DAYS} dni`}</h2>
            <p className="text-sm text-muted">
              Arkusz zbiera zadania z Pudełka porażek, nierozwiązane zadania otwarte i błędy z arkuszy.
              {!allTime && " Sprawdź „Od początku” albo rozwiąż kilka zadań."}
            </p>
            <Link href="/zadania" className="mt-2 flex min-h-11 items-center rounded-2xl bg-cta px-5 font-bold text-on-cta shadow-float active:bg-cta-dark">
              Przejdź do zadań
            </Link>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card">
            <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-rose-500/30 blur-3xl" />
            <div className="relative grid grid-cols-3 gap-3">
              <Stat label="Zadania" value={sheet.items.length} />
              <Stat label="Otwarte" value={open} />
              <Stat label="Punkty" value={sheet.points} />
            </div>
            <p className="relative mt-4 text-sm text-white/75">
              {sheet.from ? `Błędy z okresu ${formatDay(sheet.from)} – ${formatDay(sheet.to)}` : "Wszystkie zapisane błędy"}
              {topics.length > 0 && ` · ${topics.slice(0, 4).join(", ")}${topics.length > 4 ? ` i ${topics.length - 4} więcej` : ""}`}
            </p>
            <button
              onClick={() => {
                hapticTap();
                setStarted(sheet);
              }}
              className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cta py-3.5 font-bold text-on-cta shadow-float btn-hover btn-shine active:bg-cta-dark"
            >
              Rozwiąż arkusz <Icon name="arrow" className="h-4 w-4" />
            </button>
          </section>
        )}

        {!empty && (
          <ul className="flex flex-col gap-2">
            {sheet.items.map((item, i) => (
              <li key={item.task.id} className="card flex items-center gap-3 p-3 text-sm">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-xs font-extrabold text-muted">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{topicOf(item)?.title ?? "Zadanie z arkusza"}</span>
                  <span className="block text-xs text-muted">
                    {item.task.kind === "closed" ? "Zamknięte" : "Otwarte"} · {item.task.points} pkt · {plural(item.wrong, "błąd", "błędy", "błędów")}: {item.wrong}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function topicOf(item: SheetItem): Topic | undefined {
  return findTask(item.task.id)?.topic;
}

function Session({ sheet }: { sheet: MistakeSheet }) {
  // zestaw zamrożony przy starcie (props) – zapis wyników zmienia Pudełko porażek, a lista ma zostać ta sama
  const [tasks] = useState<SessionTask[]>(() =>
    sheet.items.map((item) => {
      const topic = topicOf(item);
      return {
        task: item.task,
        topicId: topic?.id ?? null,
        note: [topic?.title, item.source, `${plural(item.wrong, "błąd", "błędy", "błędów")}: ${item.wrong}`].filter(Boolean).join(" · "),
      };
    }),
  );
  const [groups] = useState(() => {
    const topics = [...new Map(tasks.flatMap((t) => (t.topicId ? [findTask(t.task.id)!.topic] : [])).map((topic) => [topic.id, topic])).values()];
    return topics.map(formulaGroup).filter((group) => group.formulas.length > 0);
  });

  return <TaskSession title="Arkusz poprawek" exitHref="/bledy" exitLabel="Zakończ arkusz poprawek" tasks={tasks} formulaGroups={groups} />;
}
