"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import ExamCard from "@/components/exam/ExamCard";
import { EXAM_YEARS } from "@/data/cke-sheets";
import RandomExamCard from "@/components/exam/RandomExamCard";
import { EXAMS } from "@/data/exams";
import { examStats, loadSession, useExamAttempts } from "@/lib/exam";
import type { ExamAttempt, ExamSession } from "@/types/exam";
import type { Level } from "@/types/topic";

/** Czas w wąskiej kolumnie: „8 h”, „7,5 h”, „45 min”. */
function shortDuration(sec: number): string {
  if (sec < 3600) return `${Math.round(sec / 60)} min`;
  const hours = Math.round(sec / 1800) / 2;
  return `${String(hours).replace(".", ",")} h`;
}

/** Poziom matury próby – arkusze losowe rozszerzone mają kod z „r” („los-r26…”), reszta z listy arkuszy. */
function attemptLevel(attempt: ExamAttempt): Level | undefined {
  if (attempt.examId.startsWith("los-")) return attempt.examId.startsWith("los-r") ? "rozszerzony" : "podstawowy";
  return EXAMS.find((exam) => exam.id === attempt.examId)?.level;
}

/** „Rozwiąż arkusz w aplikacji”: arkusze do symulacji z ostatnim wynikiem i arkuszem w toku. */
export default function ExamPicker({ level }: { level: Level }) {
  const attempts = useExamAttempts();
  const [sessions, setSessions] = useState<Record<string, ExamSession>>({});
  // statystyki tylko z arkuszy wybranego poziomu – 45% z rozszerzenia i z podstawy to nie to samo
  const stats = attempts ? examStats(attempts.filter((a) => attemptLevel(a) === level)) : null;

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
  // arkusz w toku na górze – uczeń wraca do niego jednym stuknięciem
  const exams = EXAMS.filter((exam) => exam.level === level && (exam.kind !== "probny" || sessions[exam.id])).sort(
    (a, b) => Number(Boolean(sessions[b.id])) - Number(Boolean(sessions[a.id])),
  );
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
        // jeden pasek zamiast czterech kafli – arkusze są ważniejsze niż statystyki, mają być widoczne od razu
        <dl className="card grid grid-cols-4 divide-x divide-line py-2.5" aria-label="Twoje statystyki arkuszy">
          {[
            { label: "Próby", value: String(stats.count) },
            { label: "Najlepszy", value: `${stats.bestPercent}%` },
            { label: "Średnio", value: `${stats.averagePercent}%` },
            { label: "Czas", value: shortDuration(stats.totalSec) },
          ].map((item) => (
            <div key={item.label} className="min-w-0 px-2 text-center">
              <dt className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">{item.label}</dt>
              <dd className="truncate font-display text-base font-bold text-ink tabular-nums">{item.value}</dd>
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
