import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { answersToEstimate, currentEstimate, ESTIMATE_MIN_ANSWERS, estimateHistory } from "@/lib/estimate";
import { MATURA_POINTS } from "@/lib/exam-weights";
import { plural } from "@/lib/plural";
import type { Progress } from "@/types/progress";

/**
 * Kompaktowy szacunek wyniku z paskiem do celu – na stronę główną.
 * Przez pierwsze zadania pokazujemy „zbieramy dane”: szacunek z kilku odpowiedzi byłby szumem.
 */
export default function EstimateCard({ progress }: { progress: Progress }) {
  const missing = answersToEstimate(progress);
  if (missing > 0) return <CollectingData progress={progress} missing={missing} />;

  const value = currentEstimate(progress);
  const history = estimateHistory(progress);
  const weekAgo = history[Math.max(0, history.length - 8)].value;
  const delta = value - weekAgo;

  return (
    <Link href="/profil" className="group block rounded-3xl border border-line glass-card p-5 shadow-card card-hover hover:border-brand/40 active:scale-[0.99]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Szacowany wynik</p>
        <Icon name="arrow" className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink tabular-nums">
        {value}% <span className="text-base font-bold text-muted">· ok. {Math.round((value / 100) * MATURA_POINTS)}/{MATURA_POINTS} pkt</span>
      </p>
      <p className={`text-sm font-semibold ${delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
        {delta > 0 ? `+${delta} pp w ostatnim tygodniu` : "Każde rozwiązane zadanie podnosi wynik"}
      </p>
      <div className="relative mt-4 h-2 rounded-full bg-subtle">
        <div className="bar-grow h-full rounded-full bg-brand" style={{ width: `${Math.min(value, 100)}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink" style={{ left: `${progress.target}%` }} aria-hidden />
      </div>
      <p className="mt-2 text-xs text-muted">Cel: {progress.target}%</p>
    </Link>
  );
}

function CollectingData({ progress, missing }: { progress: Progress; missing: number }) {
  const done = ESTIMATE_MIN_ANSWERS - missing;
  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Szacowany wynik</p>
      <p className="mt-1 text-xl font-extrabold text-ink">Zbieramy dane</p>
      <p className="text-sm text-muted">
        Jeszcze {missing} {plural(missing, "zadanie", "zadania", "zadań")} do pierwszego szacunku Twojego wyniku na maturze.
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuemin={0} aria-valuemax={ESTIMATE_MIN_ANSWERS} aria-valuenow={done}>
        <div className="bar-grow h-full rounded-full bg-brand" style={{ width: `${(done / ESTIMATE_MIN_ANSWERS) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {done}/{ESTIMATE_MIN_ANSWERS} · cel: {progress.target}%
      </p>
    </section>
  );
}
