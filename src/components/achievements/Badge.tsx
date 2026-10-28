import Icon from "@/components/ui/Icon";
import type { Achievement, BadgeTone } from "@/lib/achievements";
import { formatDay } from "@/lib/stats";
import type { Progress } from "@/types/progress";

const TONE: Record<BadgeTone, string> = {
  amber: "from-amber-300 to-orange-500 shadow-amber-500/30",
  violet: "from-violet-400 to-fuchsia-600 shadow-violet-500/30",
  blue: "from-sky-400 to-blue-600 shadow-blue-500/30",
  emerald: "from-emerald-300 to-teal-600 shadow-emerald-500/30",
  rose: "from-rose-400 to-red-600 shadow-rose-500/30",
  orange: "from-yellow-300 to-orange-600 shadow-orange-500/30",
  indigo: "from-indigo-400 to-violet-700 shadow-indigo-500/30",
  teal: "from-teal-300 to-cyan-600 shadow-teal-500/30",
};

/** Medal odznaki: kolorowy gradient po zdobyciu, szary z kłódką przed. */
export function BadgeIcon({ achievement, unlocked, large = false }: { achievement: Achievement; unlocked: boolean; large?: boolean }) {
  const size = large ? "h-20 w-20" : "h-14 w-14";
  const icon = large ? "h-9 w-9" : "h-6 w-6";
  return (
    <span className={`relative inline-flex shrink-0 ${size}`}>
      <span
        className={`flex h-full w-full items-center justify-center rounded-full ${
          unlocked
            ? `bg-linear-to-br text-white shadow-lg ring-4 ring-white/40 dark:ring-white/10 ${TONE[achievement.tone]}`
            : "border-2 border-dashed border-line bg-subtle text-faint"
        }`}
      >
        <Icon name={achievement.icon} className={icon} />
      </span>
      {!unlocked && (
        <span className="absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-muted text-card">
          <Icon name="lock" className="h-3 w-3" />
        </span>
      )}
    </span>
  );
}

/** Karta odznaki z opisem oraz datą zdobycia albo paskiem postępu. */
export function BadgeCard({ achievement, progress }: { achievement: Achievement; progress: Progress }) {
  const earnedAt = progress.achievements[achievement.id];
  const current = Math.min(achievement.current(progress), achievement.goal);
  const percent = (current / achievement.goal) * 100;

  return (
    <article
      className={`flex flex-col items-center gap-3 rounded-3xl border p-5 text-center card-hover ${
        earnedAt ? "border-line glass-card shadow-card" : "border-line bg-card/60"
      }`}
    >
      <BadgeIcon achievement={achievement} unlocked={Boolean(earnedAt)} large />
      <div>
        <h3 className={`font-extrabold ${earnedAt ? "text-ink" : "text-muted"}`}>{achievement.title}</h3>
        <p className="mt-0.5 text-sm text-muted">{achievement.description}</p>
      </div>
      {earnedAt ? (
        <p className="mt-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          Zdobyto {formatDay(earnedAt)}
        </p>
      ) : (
        <div className="mt-auto w-full">
          <div className="h-2 overflow-hidden rounded-full bg-subtle">
            <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1.5 text-xs font-bold text-faint">
            {current}/{achievement.goal}
          </p>
        </div>
      )}
    </article>
  );
}
