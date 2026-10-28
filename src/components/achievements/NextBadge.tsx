import Link from "next/link";
import { BadgeIcon } from "@/components/achievements/Badge";
import { ACHIEVEMENTS, type Achievement } from "@/lib/achievements";
import type { Progress } from "@/types/progress";

/** Niezdobyta odznaka najbliżej zdobycia (największy postęp względem celu) – null, gdy zdobyto wszystkie. */
export function nextAchievement(progress: Progress): Achievement | null {
  return (
    ACHIEVEMENTS.filter((a) => !progress.achievements[a.id]).sort((a, b) => b.current(progress) / b.goal - a.current(progress) / a.goal)[0] ?? null
  );
}

/** Najbliższa odznaka z paskiem postępu – mały, konkretny cel na teraz. */
export default function NextBadge({ progress, achievement, card = false }: { progress: Progress; achievement: Achievement; card?: boolean }) {
  const current = Math.min(achievement.current(progress), achievement.goal);
  return (
    <Link
      href="/odznaki"
      className={`group flex items-center gap-3 transition-colors active:scale-[0.99] ${
        card ? "rounded-3xl border border-line glass-card p-4 shadow-card card-hover hover:border-brand/40" : "rounded-2xl bg-subtle/70 p-3 hover:bg-subtle"
      }`}
    >
      <BadgeIcon achievement={achievement} unlocked={false} />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-faint">Następna odznaka</span>
        <span className="block truncate font-extrabold text-ink">{achievement.title}</span>
        <span className="block truncate text-xs text-muted">{achievement.description}</span>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-line">
          <span className="bar-grow block h-full rounded-full bg-brand" style={{ width: `${(current / achievement.goal) * 100}%` }} />
        </span>
      </span>
      <span className="shrink-0 text-sm font-extrabold text-muted tabular-nums">
        {current}/{achievement.goal}
      </span>
    </Link>
  );
}
