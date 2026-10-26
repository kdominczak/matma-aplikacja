import type { Category, Topic } from "@/types/topic";

const CATEGORY_STYLE: Record<Category, string> = {
  Liczby: "bg-brand-soft text-brand",
  Algebra: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  Funkcje: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  Geometria: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  Statystyka: "bg-pink-500/15 text-pink-600 dark:text-pink-300",
};

/** Kafelek z symbolem działu w kolorze kategorii. */
export default function CategoryTile({ topic, muted = false }: { topic: Topic; muted?: boolean }) {
  const style = muted ? "bg-subtle text-faint" : CATEGORY_STYLE[topic.category];
  const size = topic.icon.length > 3 ? "text-xs" : "text-base";
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-extrabold ${size} ${style}`}>
      {topic.icon}
    </span>
  );
}
