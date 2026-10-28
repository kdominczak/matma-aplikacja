"use client";

import Icon from "@/components/ui/Icon";
import { useStudyMinutesToday } from "@/lib/study-time";

/** Dzisiejszy cel czasu nauki – tyle trwa mniej więcej dzienne wyzwanie z małym zapasem. */
const DAILY_GOAL_MIN = 15;

function minutesLabel(n: number) {
  if (n === 1) return "minuta";
  const lastTwo = n % 100;
  const last = n % 10;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? "minuty" : "minut";
}

/** Widget „Czas nauki dzisiaj”: minuty aktywności w aplikacji i pasek do dziennego celu. */
export default function StudyTimeCard({ className = "" }: { className?: string }) {
  const minutes = useStudyMinutesToday();
  const value = minutes ?? 0;
  const done = value >= DAILY_GOAL_MIN;

  return (
    <section className={`glass-card rounded-3xl border border-line p-5 shadow-card ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="clock" className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Czas nauki dzisiaj</p>
          <p className="font-extrabold text-ink" aria-live="polite">
            <span className="text-2xl tabular-nums">{minutes === null ? "–" : value}</span> {minutesLabel(value)}
          </p>
        </div>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-subtle"
        role="progressbar"
        aria-label="Postęp dziennego celu czasu nauki"
        aria-valuemin={0}
        aria-valuemax={DAILY_GOAL_MIN}
        aria-valuenow={Math.min(value, DAILY_GOAL_MIN)}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ${done ? "bg-emerald-500" : "bg-brand"}`}
          style={{ width: `${Math.min(100, (value / DAILY_GOAL_MIN) * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {done ? "Dzienny cel osiągnięty – świetna robota!" : `Cel: ${DAILY_GOAL_MIN} min · liczymy tylko aktywny czas w aplikacji`}
      </p>
    </section>
  );
}
