import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { EXTENDED_BLUEPRINTS } from "@/data/blueprints-extended";
import { extendedTopics, topicLevel, topics } from "@/data/topics";
import type { ExamBlueprint, Section } from "@/types/blueprint";
import type { Level, Topic } from "@/types/topic";

// Ile punktów na maturze daje dział aplikacji – z prawdziwych arkuszy (src/data/blueprints*.ts), a nie z szacunków.
// Punkty działu podstawy programowej (I–XIII) to średnia z obowiązujących układów; dzielimy je między działy
// aplikacji z tej samej sekcji proporcjonalnie do ich względnej wagi (`points × examShare` z analizy tematów).
//
// Matura rozszerzona sprawdza też wymagania podstawowe. Punkty pozycji z wymaganiem „R” (np. „XIII.R4”) idą do działów
// rozszerzenia z tej sekcji, pozostałe – do działów podstawy. Gdy w sekcji brakuje działu danego zakresu, punkty
// dostaje drugi zakres (żeby suma zawsze wynosiła 50).

/** Liczba punktów na maturze podstawowej (od 2025: 50). */
export const MATURA_POINTS = CURRENT_BLUEPRINTS[0].totalPoints;

/** Liczba punktów na maturze danego poziomu (podstawowa i rozszerzona – po 50). */
export const LEVEL_POINTS: Record<Level, number> = {
  podstawowy: MATURA_POINTS,
  rozszerzony: EXTENDED_BLUEPRINTS[0].totalPoints,
};

type Scope = "basic" | "extended";

/** Średnia liczba punktów (sekcja, zakres wymagań) w układach – zadanie z kilku działów liczy się do głównego (ostatniego). */
function averagePoints(blueprints: ExamBlueprint[], split: boolean): Map<string, number> {
  const totals = new Map<string, number>();
  for (const blueprint of blueprints) {
    for (const slot of blueprint.slots) {
      const section = slot.sections.at(-1)!;
      const scope: Scope = split && slot.requirements.some((r) => r.startsWith(`${section}.R`)) ? "extended" : "basic";
      const key = `${section}/${scope}`;
      totals.set(key, (totals.get(key) ?? 0) + slot.points);
    }
  }
  for (const [key, value] of totals) totals.set(key, value / blueprints.length);
  return totals;
}

const relativeWeight = (topic: Topic) => topic.points * topic.examShare;

/** Dzieli punkty (sekcja, zakres) między działy aplikacji z tej sekcji i zakresu (z zastępstwem, gdy zakres jest pusty). */
function distribute(points: Map<string, number>, pool: Record<Scope, Topic[]>): Map<string, number> {
  const out = new Map<string, number>();
  for (const [key, value] of points) {
    const [section, scope] = key.split("/") as [Section, Scope];
    const other: Scope = scope === "basic" ? "extended" : "basic";
    let siblings = pool[scope].filter((t) => t.section === section);
    if (siblings.length === 0) siblings = pool[other].filter((t) => t.section === section);
    const total = siblings.reduce((sum, t) => sum + relativeWeight(t), 0);
    for (const topic of siblings) out.set(topic.id, (out.get(topic.id) ?? 0) + (value * relativeWeight(topic)) / total);
  }
  return out;
}

const weights: Record<Level, Map<string, number>> = {
  podstawowy: distribute(averagePoints(CURRENT_BLUEPRINTS, false), { basic: topics, extended: [] }),
  rozszerzony: distribute(averagePoints(EXTENDED_BLUEPRINTS, true), { basic: topics, extended: extendedTopics }),
};

/** Średnio tyle punktów na maturze danego poziomu przypada na dział aplikacji (dział rozszerzenia na podstawowej – 0). */
export function topicExamPoints(topic: Topic, level: Level = "podstawowy"): number {
  if (level === "podstawowy" && topicLevel(topic) === "rozszerzony") return 0;
  return weights[level].get(topic.id) ?? 0;
}
