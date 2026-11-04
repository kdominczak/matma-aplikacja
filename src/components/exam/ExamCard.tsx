"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { examCode, examHref, examKindLabel, examMaxPoints, examSource } from "@/data/exams";
import { hapticTap } from "@/lib/haptics";
import { LEVEL_LONG } from "@/lib/level";
import type { ExamAttempt, ExamSession, ExamSheet } from "@/types/exam";

/** Próg zdania matury podstawowej – znacznik na pasku wyniku (na rozszerzonej progu nie ma). */
const THRESHOLD = 30;

/**
 * Karta arkusza jak strona tytułowa raportu: kod arkusza CKE, parametry w jednym rzędzie (zadania · punkty · czas)
 * i najlepszy wynik z paskiem. Elegancko, ale bez imitowania wyglądu CKE – żadnych pieczęci ani logo.
 */
export default function ExamCard({ exam, attempts, session }: { exam: ExamSheet; attempts: ExamAttempt[]; session?: ExamSession }) {
  const code = examCode(exam);
  const official = exam.kind === "cke";
  const best = attempts.reduce<ExamAttempt | null>((top, a) => (!top || a.percent > top.percent ? a : top), null);
  const answered = session ? Object.keys(session.answers).length : 0;
  const formula = official && exam.year !== undefined && exam.year <= 2022 ? "formuła 2015" : null;

  return (
    <Link
      href={examHref(exam)}
      onClick={() => hapticTap()}
      className="card group relative flex flex-col overflow-hidden card-hover hover:border-brand/60 dark:hover:border-brand/40"
    >
      {/* cienka złota linia – wyróżnia oficjalne arkusze bez krzykliwych plakietek */}
      {official && <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-brand/80 via-brand/40 to-transparent" />}

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted">{examKindLabel(exam)}</p>
            <p className="mt-1 font-display text-xl font-bold text-ink">{exam.title}</p>
            <p className="mt-0.5 text-sm text-muted">
              {LEVEL_LONG[exam.level]}
              {formula ? ` · ${formula}` : ""}
            </p>
            {/* przy CKE źródło mówią już nagłówek i tytuł („Oficjalny arkusz CKE · Matura maj 2025”) */}
            {!official && <p className="mt-1 text-xs text-muted">{examSource(exam)}</p>}
          </div>
          {session && (
            <span className="shrink-0 rounded-full border border-amber-500/40 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">W toku</span>
          )}
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line">
          {[
            ["Zadania", String(exam.tasks.length)],
            ["Punkty", String(examMaxPoints(exam))],
            ["Czas", `${exam.durationMin} min`],
          ].map(([label, value]) => (
            <div key={label} className="px-3 py-2">
              <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="font-display text-base font-bold text-ink tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {best ? (
          <div>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted">
                Najlepszy wynik{attempts.length > 1 ? ` · ${attempts.length} podejścia` : ""}
              </span>
              <span className="font-display font-bold text-ink tabular-nums">
                {best.points}/{best.maxPoints} · {best.percent}%
              </span>
            </div>
            <div className="relative mt-1.5 h-1.5 rounded-full bg-subtle" role="img" aria-label={`Najlepszy wynik: ${best.percent}%`}>
              <div className="bar-grow h-full rounded-full bg-brand" style={{ width: `${Math.min(100, best.percent)}%` }} />
              {exam.level === "podstawowy" && (
                <span aria-hidden className="absolute -top-1 h-3.5 w-px bg-ink/50" style={{ left: `${THRESHOLD}%` }} title="próg 30%" />
              )}
            </div>
            {exam.level === "podstawowy" && (
              <p className="mt-1 text-xs text-muted">{best.percent >= THRESHOLD ? "Powyżej progu zdania (30%)" : "Poniżej progu zdania (30%)"}</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <span className="min-w-0 truncate font-mono text-[0.7rem] tracking-wide text-muted">{code ?? ""}</span>
        <span className="flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-bold text-brand">
          {session ? `Wróć (${answered}/${exam.tasks.length})` : best ? "Rozwiąż ponownie" : "Rozpocznij"}
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
