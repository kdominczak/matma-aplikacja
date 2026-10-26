import Icon from "@/components/ui/Icon";
import { currentWeek, streak } from "@/lib/stats";
import type { Progress } from "@/types/progress";

/** Karta serii z kółkami dni bieżącego tygodnia. */
export default function WeekStreak({ progress, className = "" }: { progress: Progress; className?: string }) {
  const days = streak(progress);
  const week = currentWeek(progress);

  return (
    <div className={`rounded-3xl border border-orange-500/25 bg-orange-500/10 p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-orange-500 shadow-card">
          <Icon name="flame" className="h-6 w-6" />
        </span>
        <div>
          <p className="font-extrabold text-ink">{days > 0 ? `${days}-dniowa passa!` : "Zacznij serię dziś"}</p>
          <p className="text-xs text-muted">Codziennie trochę. Na maturze dużo.</p>
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-7 gap-1 text-center">
        {week.map((day) => (
          <li key={day.key} className="flex flex-col items-center gap-1">
            <span className={`text-[11px] font-bold ${day.isToday ? "text-orange-600 dark:text-orange-400" : "text-faint"}`}>
              {day.label}
            </span>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                day.active
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : day.isToday
                    ? "border-2 border-dashed border-orange-400/60"
                    : "bg-orange-500/10"
              }`}
            >
              {day.active && <Icon name="check" className="h-4 w-4" />}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
