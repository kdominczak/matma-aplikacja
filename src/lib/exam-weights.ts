import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { topics } from "@/data/topics";
import type { Section } from "@/types/blueprint";
import type { Topic } from "@/types/topic";

// Ile punktów na maturze daje dział aplikacji – z prawdziwych arkuszy (src/data/blueprints.ts), a nie z szacunków.
// Punkty działu podstawy programowej (I–XIII) to średnia z obowiązujących układów; dzielimy je między działy
// aplikacji z tej samej sekcji proporcjonalnie do ich względnej wagi (`points × examShare` z analizy tematów).

/** Liczba punktów na maturze podstawowej (od 2025: 50). */
export const MATURA_POINTS = CURRENT_BLUEPRINTS[0].totalPoints;

/** Średnia liczba punktów działu podstawy w obowiązujących arkuszach (zadanie z kilku działów liczy się do głównego). */
export const SECTION_POINTS: Record<Section, number> = (() => {
  const totals = {} as Record<Section, number>;
  for (const blueprint of CURRENT_BLUEPRINTS) {
    for (const slot of blueprint.slots) {
      const section = slot.sections.at(-1)!;
      totals[section] = (totals[section] ?? 0) + slot.points;
    }
  }
  for (const key of Object.keys(totals) as Section[]) totals[key] /= CURRENT_BLUEPRINTS.length;
  return totals;
})();

const relativeWeight = (topic: Topic) => topic.points * topic.examShare;

const weights = new Map<string, number>(
  topics.map((topic) => {
    const siblings = topics.filter((t) => t.section === topic.section);
    const share = relativeWeight(topic) / siblings.reduce((sum, t) => sum + relativeWeight(t), 0);
    return [topic.id, (SECTION_POINTS[topic.section] ?? 0) * share] as const;
  }),
);

/** Średnio tyle punktów na maturze przypada na dział aplikacji. */
export function topicExamPoints(topic: Topic): number {
  return weights.get(topic.id) ?? 0;
}
