"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import ExamCard from "@/components/exam/ExamCard";
import { EXAM_YEARS } from "@/data/cke-sheets";
import RandomExamCard from "@/components/exam/RandomExamCard";
import { EXAMS } from "@/data/exams";
import { examStats, formatDuration, loadSession, useExamAttempts } from "@/lib/exam";
import type { ExamSession } from "@/types/exam";
import type { Level } from "@/types/topic";

/** „Rozwiąż arkusz w aplikacji”: arkusze do symulacji z ostatnim wynikiem i arkuszem w toku. */
export default function ExamPicker({ level }: { level: Level }) {
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

  // Stałe arkusze próbne nr 1–3 zastąpił arkusz losowy (ten sam układ matury, nowe zadania za każdym razem) –
  // zostają w danych dla historii prób, na liście tylko ten, który uczeń ma w toku.
  const exams = EXAMS.filter((exam) => exam.level === level && (exam.kind !== "probny" || sessions[exam.id]));
  // roczniki CKE (formuła 2023), których jeszcze nie ma w aplikacji – na razie tylko jako PDF niżej
  const pendingYears = EXAM_YEARS.filter((y) => y.formula === "2023" && !EXAMS.some((e) => e.level === level && e.year === y.year)).map((y) => y.year);

  return (
    <section className="flex flex-col gap-4" aria-labelledby="exam-picker-title">
      <div>
        <h2 id="exam-picker-title" className="text-xl font-extrabold text-ink">
          Rozwiąż arkusz w aplikacji
        </h2>
        <p className="text-sm text-muted">Tryb egzaminu: pełny czas matury, przechodzenie między zadaniami, wynik i omówienie na końcu.</p>
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
              <dt className="text-xs font-bold uppercase tracking-wide text-muted">{item.label}</dt>
              <dd className="text-lg font-extrabold text-ink tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <RandomExamCard level={level} />
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} session={sessions[exam.id]} attempts={attempts?.filter((a) => a.examId === exam.id) ?? []} />
        ))}
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
