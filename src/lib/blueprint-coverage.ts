import { SECTION_NAMES } from "@/data/blueprints";
import { examPool, slotCandidates, slotSection, type PoolTask } from "@/data/task-meta";
import type { ExamBlueprint, Section, TaskFormat } from "@/types/blueprint";

// Pokrycie szablonu przez pulę zadań: czy da się złożyć arkusz w układzie prawdziwej matury
// i ile różnych arkuszy (bez powtórzeń zadań) wystarczy pula. Pokazuje, gdzie dopisać zadania.
//
// Pozycje grupujemy po wspólnej puli kandydatów (dział + punkty + zamknięte/otwarte): np. P/F i ABCD
// z jednego działu korzystają z tych samych zadań ABCD, więc ich zapotrzebowanie się sumuje.

export interface CoverageGroup {
  section: Section;
  sectionName: string;
  points: number;
  /** Zamknięte (ABCD, P/F, wybór) albo otwarte (krótka odpowiedź, rozwiązanie). */
  family: "closed" | "open";
  /** Typy pozycji w szablonie z liczbą wystąpień, np. { abcd: 2, truefalse: 1 }. */
  slots: Partial<Record<TaskFormat, number>>;
  demand: number;
  /** Zadania z puli pasujące do tych pozycji. */
  supply: number;
  /** Pozycje, dla których pula nie ma zadań dokładnie tego typu (wypełnia je typ zastępczy). */
  fallbackSlots: number;
  /** Ile rozłącznych zestawów do tych pozycji starczy pula. */
  sheets: number;
}

export interface Coverage {
  blueprint: ExamBlueprint;
  groups: CoverageGroup[];
  /** Ile różnych arkuszy bez powtórzeń zadań da się złożyć (najsłabsze ogniwo). */
  distinctSheets: number;
  /** Punkty z pozycji, dla których nie ma żadnego zadania. */
  missingPoints: number;
  /** Punkty z pozycji wypełnianych zastępczym typem zadania. */
  fallbackPoints: number;
}

const familyOf = (format: TaskFormat) => (format === "short" || format === "extended" ? "open" : "closed");

export function blueprintCoverage(blueprint: ExamBlueprint, pool: PoolTask[] = examPool()): Coverage {
  const groups = new Map<string, CoverageGroup & { ids: Set<string> }>();
  let fallbackPoints = 0;

  for (const slot of blueprint.slots) {
    const section = slotSection(slot);
    const family = familyOf(slot.format);
    const key = `${section}/${slot.points}/${family}`;
    const group =
      groups.get(key) ??
      groups
        .set(key, { section, sectionName: SECTION_NAMES[section], points: slot.points, family, slots: {}, demand: 0, supply: 0, fallbackSlots: 0, sheets: 0, ids: new Set() })
        .get(key)!;
    const candidates = slotCandidates(slot, pool);
    for (const c of candidates) group.ids.add(c.item.task.id);
    group.slots[slot.format] = (group.slots[slot.format] ?? 0) + 1;
    group.demand++;
    if (candidates.length > 0 && !candidates.some((c) => c.exact)) {
      group.fallbackSlots++;
      fallbackPoints += slot.points;
    }
  }

  const list: CoverageGroup[] = [...groups.values()].map(({ ids, ...g }) => ({ ...g, supply: ids.size, sheets: Math.floor(ids.size / g.demand) }));
  return {
    blueprint,
    groups: list,
    distinctSheets: Math.min(...list.map((g) => g.sheets)),
    missingPoints: list.filter((g) => g.supply === 0).reduce((sum, g) => sum + g.points * g.demand, 0),
    fallbackPoints,
  };
}
