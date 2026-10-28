"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { EXAM_YEARS } from "@/data/cke-sheets";
import RandomExamCard from "@/components/exam/RandomExamCard";
import { EXAMS, examHref, examKindLabel, examMaxPoints } from "@/data/exams";
import { examStats, formatDuration, loadSession, useExamAttempts } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import type { ExamSession } from "@/types/exam";

/** „Rozwiąż arkusz w aplikacji”: arkusze do symulacji z ostatnim wynikiem i arkuszem w toku. */
export default function ExamPicker() {
  const attempts = useExamAttempts();
  const [sessions, setSessions] = useState<Record<string, ExamSession>>({});
  const stats = attempts ? examStats(attempts) : null;

  useEffect(() => {
    let active = true;
    void Promise.all(EXAMS.map((exam) => loadSession(exam.id))).then((list) => {
      if (!active) return;
      setSessions(Object.fromEntries(list.filter((s): s is ExamSession => s !== null).map((s) => [s.examId, s])));
    });
    return () => {
      active = false;
    };
  }, []);

  // roczniki CKE (formuła 2023), których jeszcze nie ma w aplikacji – na razie tylko jako PDF niżej
  const pendingYears = EXAM_YEARS.filter((y) => y.formula === "2023" && !EXAMS.some((e) => e.year === y.year)).map((y) => y.year);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="exam-picker-title">
      <div>
        <h2 id="exam-picker-title" className="text-xl font-extrabold text-ink">
          Rozwiąż arkusz w aplikacji
        </h2>
        <p className="text-sm text-muted">Tryb egzaminu: 180 minut, przechodzenie między zadaniami, wynik i omówienie na końcu.</p>
      </div>

      {stats && (
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Twoje statystyki arkuszy">
          {[
            { label: "Próby", value: String(stats.count) },
            { label: "Najlepszy wynik", value: `${stats.bestPercent}%` },
            { label: "Średnio", value: `${stats.averagePercent}%` },
            { label: "Czas nad arkuszami", value: formatDuration(stats.totalSec) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-line glass-card px-3 py-2 shadow-card">
              <dt className="text-[11px] font-bold uppercase tracking-wide text-faint">{item.label}</dt>
              <dd className="text-lg font-extrabold text-ink tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <RandomExamCard />
        {EXAMS.map((exam) => {
          const session = sessions[exam.id];
          const last = attempts?.find((a) => a.examId === exam.id);
          const answered = session ? Object.keys(session.answers).length : 0;
          return (
            <Link
              key={exam.id}
              href={examHref(exam)}
              onClick={() => hapticTap()}
              className="group flex flex-col gap-3 rounded-3xl border border-line glass-card p-5 shadow-card card-hover hover:border-brand/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-brand">{examKindLabel(exam)}</p>
                  <p className="mt-0.5 text-lg font-extrabold text-ink">{exam.title}</p>
                </div>
                {session ? (
                  <span className="shrink-0 rounded-full bg-amber-400/20 px-2.5 py-1 text-[11px] font-extrabold uppercase text-amber-700 dark:text-amber-300">
                    W toku
                  </span>
                ) : last ? (
                  <span className="shrink-0 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-extrabold text-brand">{last.percent}%</span>
                ) : null}
              </div>
              <p className="text-sm text-muted">
                {exam.tasks.length} zadań · {examMaxPoints(exam)} pkt · {exam.durationMin} min
              </p>
              <span className="mt-auto flex min-h-11 items-center gap-2 text-sm font-bold text-brand">
                {session ? `Wróć do arkusza (${answered}/${exam.tasks.length})` : last ? "Rozwiąż ponownie" : "Rozpocznij"}
                <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      {pendingYears.length > 0 && (
        <p className="flex gap-2 rounded-2xl bg-subtle/70 p-3 text-sm text-muted">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          Oficjalne matury {pendingYears.join(", ")} przenosimy do aplikacji. Do tego czasu rozwiążesz je z PDF-ów poniżej.
        </p>
      )}
    </section>
  );
}
