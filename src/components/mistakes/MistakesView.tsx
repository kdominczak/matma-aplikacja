"use client";

import { useState } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import TrapCard from "@/components/quiz/TrapCard";
import CategoryTile from "@/components/topic/CategoryTile";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { getDifficulty } from "@/data/topics";
import { daysAgo, mistakeEntries, TRAINING_SIZE, type MistakeEntry } from "@/lib/mistakes";
import { useProgress } from "@/lib/progress";

export default function MistakesView() {
  const progress = useProgress();
  if (!progress) return null;

  const entries = mistakeEntries(progress);
  const trainingCount = Math.min(entries.length, TRAINING_SIZE);

  return (
    <Page width="reading">
      <Link href="/profil" className="-my-2 flex min-h-11 items-center gap-1 self-start text-sm font-bold text-muted hover:text-ink">
        <Icon name="back" className="h-4 w-4" />
        Profil
      </Link>
      <PageHeader
        title="Pudełko porażek"
        subtitle="Tu lądują zadania, w których się pomyliłeś. Rozwiąż je poprawnie, a znikną z pudełka – to najlepsza nauka."
      />

      <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card lg:p-6">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="relative grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">W pudełku</p>
            <p className="mt-1 text-4xl font-extrabold">{entries.length}</p>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">Pokonane błędy</p>
            <p className="mt-1 text-4xl font-extrabold text-emerald-300">{progress.stats.mistakesBeaten}</p>
          </div>
        </div>
        {entries.length > 0 && (
          <Link
            href="/bledy/trening"
            className="relative mt-5 flex items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark sm:max-w-xs"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Przećwicz swoje błędy ({trainingCount})
          </Link>
        )}
      </section>

      {entries.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-line glass-card p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Icon name="checkCircle" className="h-7 w-7" />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-ink">Pudełko jest puste</h2>
          <p className="mt-1 text-sm text-muted">Zero błędów albo wszystkie już pokonane. Tak trzymaj!</p>
        </section>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <MistakeCard key={entry.question.id} entry={entry} />
          ))}
        </ul>
      )}
    </Page>
  );
}

function MistakeCard({ entry }: { entry: MistakeEntry }) {
  const [open, setOpen] = useState(false);
  const { question, topic, difficulty, mistake } = entry;

  return (
    <li className="rounded-3xl border border-line glass-card p-4 shadow-card lg:p-5">
      <div className="flex items-start gap-3">
        <CategoryTile topic={topic} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-faint">
            {topic.title} · {getDifficulty(difficulty).label}
          </p>
          <p className={`mt-1 font-semibold text-ink ${open ? "" : "line-clamp-2"}`}>
            <MathText text={question.prompt} />
          </p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
            <span>
              Twoja odpowiedź: <span className="text-rose-500">{mistake.chosen}</span>
            </span>
            <span>{daysAgo(mistake.lastWrong)}</span>
            {mistake.count > 1 && <span className="text-rose-500">pomyłek: {mistake.count}</span>}
          </p>
        </div>
      </div>

      {open && (
        <div className="mt-4 flex animate-fade-in flex-col gap-3">
          <ul className="grid gap-2 sm:grid-cols-2">
            {(["A", "B", "C", "D"] as const).map((key) => (
              <li
                key={key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  key === question.correct
                    ? "border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                    : key === mistake.chosen
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      : "border-line text-muted"
                }`}
              >
                <span className="font-bold">{key}.</span>
                <MathText text={question.options[key]} />
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-body">
            <MathText text={question.explanation} />
          </p>
          {question.trap && <TrapCard text={question.trap} compact />}
        </div>
      )}

      <button onClick={() => setOpen(!open)} className="mt-3 text-sm font-bold text-brand">
        {open ? "Ukryj rozwiązanie" : "Pokaż rozwiązanie"}
      </button>
    </li>
  );
}
