import { useDisplayName } from "@/components/layout/AppShell";
import type { DailyPlan } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { weekSolved } from "@/lib/progress";
import type { Progress } from "@/types/progress";

/**
 * Powitanie zamiast hasła reklamowego: imię, dzisiejsza data i jedno zdanie o tym, co czeka.
 * Liczba dni do matury jest w pasku odliczania nad ekranem – tu jej nie powtarzamy.
 * Renderowane dopiero z wczytanym postępem (data i imię są znane tylko w przeglądarce).
 */
export default function Greeting({ progress, plan }: { progress: Progress | null; plan: DailyPlan | null }) {
  const name = useDisplayName();
  const first = name === "Twój profil" ? null : name.split(/\s+/)[0];

  if (!progress || !plan) {
    return <div className="h-[4.5rem] animate-pulse rounded-2xl bg-subtle/60" aria-hidden />;
  }

  const date = new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
  const today = date.charAt(0).toUpperCase() + date.slice(1); // „Czwartek, 29 października” – miesiąc małą literą
  const week = weekSolved(progress);
  const weekText = week > 0 ? `W tym tygodniu: ${week} ${plural(week, "zadanie", "zadania", "zadań")}.` : "";
  const line =
    plan.round > 0
      ? `Plan na dziś zrobiony – świetna robota! ${weekText}`
      : week > 0
        ? `${weekText} Dziś czeka plan na ok. ${plan.minutes} min.`
        : `Zacznij od planu na dziś – zajmie ok. ${plan.minutes} min.`;

  return (
    <section>
      <p className="text-sm font-bold text-faint">{today}</p>
      <h1 className="bg-linear-to-r from-navy via-brand-dark to-brand bg-clip-text text-3xl leading-tight font-extrabold tracking-tight text-transparent sm:text-4xl dark:from-white dark:via-blue-200 dark:to-blue-400">
        {first ? `Cześć, ${first}!` : "Cześć!"}
      </h1>
      <p className="mt-1 text-muted">{line}</p>
    </section>
  );
}
