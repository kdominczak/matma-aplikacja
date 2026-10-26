import Link from "next/link";
import Icon from "@/components/ui/Icon";
import type { Progress } from "@/types/progress";

/** Skrót „Pudełka porażek” – na Postępach i na ekranie głównym. */
export default function MistakesCard({ progress }: { progress: Progress }) {
  const count = Object.keys(progress.mistakes).length;

  return (
    <Link
      href="/bledy"
      className="group flex items-center gap-4 rounded-3xl border border-rose-500/25 bg-rose-500/10 p-5 transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-rose-500 shadow-card">
        <Icon name="archive" className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-ink">Pudełko porażek</p>
        <p className="text-sm text-muted">
          {count === 0
            ? "Pusto! Każda pomyłka trafi tu do powtórki."
            : `${count} ${count === 1 ? "zadanie czeka" : count < 5 ? "zadania czekają" : "zadań czeka"} na rewanż`}
        </p>
      </div>
      <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
