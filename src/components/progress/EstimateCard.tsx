import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { currentEstimate, estimateHistory } from "@/lib/estimate";
import type { Progress } from "@/types/progress";

/** Kompaktowy szacunek wyniku z paskiem do celu – na dashboard. */
export default function EstimateCard({ progress }: { progress: Progress }) {
  const value = currentEstimate(progress);
  const history = estimateHistory(progress);
  const weekAgo = history[Math.max(0, history.length - 8)].value;
  const delta = value - weekAgo;

  return (
    <Link
      href="/profil"
      className="group block rounded-3xl border border-line bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Szacowany wynik</p>
        <Icon name="arrow" className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{value}%</p>
      <p className={`text-sm font-semibold ${delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted"}`}>
        {delta > 0 ? `+${delta} pp w ostatnim tygodniu` : "Zalicz test, by podnieść wynik"}
      </p>
      <div className="relative mt-4 h-2 rounded-full bg-subtle">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
        <span
          className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink"
          style={{ left: `${progress.target}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-xs text-muted">Cel: {progress.target}%</p>
    </Link>
  );
}
