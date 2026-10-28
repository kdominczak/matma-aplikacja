// Raport: czy pula zadań wystarcza do arkuszy w układzie prawdziwej matury (npm run blueprint:coverage).
// Pokazuje, ile różnych arkuszy da się złożyć i których zadań brakuje najbardziej.
import { CURRENT_BLUEPRINTS } from "@/data/blueprints";
import { examPool } from "@/data/task-meta";
import { blueprintCoverage } from "@/lib/blueprint-coverage";
import type { TaskFormat } from "@/types/blueprint";

const FORMAT_LABEL: Record<TaskFormat, string> = { abcd: "ABCD", truefalse: "P/F", choice: "wybór", short: "krótka", extended: "otwarte" };

console.log(`Pula: ${examPool().length} zadań\n`);
for (const blueprint of CURRENT_BLUEPRINTS) {
  const c = blueprintCoverage(blueprint);
  console.log(`=== Układ ${blueprint.year} (${blueprint.totalPoints} pkt, ${blueprint.slots.length} pozycji)`);
  console.log(`Różnych arkuszy bez powtórzeń: ${c.distinctSheets}`);
  console.log(`Punkty bez żadnego zadania: ${c.missingPoints} · punkty z zastępczym typem zadania: ${c.fallbackPoints}\n`);
  const rows = [...c.groups].sort((a, b) => a.sheets - b.sheets || b.points * b.demand - a.points * a.demand);
  for (const g of rows) {
    const status = g.supply === 0 ? "BRAK" : g.sheets < 3 ? "mało" : "ok";
    const slots = Object.entries(g.slots)
      .map(([f, n]) => `${FORMAT_LABEL[f as TaskFormat]}×${n}`)
      .join(" ");
    console.log(
      `${status.padEnd(5)} ${g.section.padEnd(5)} ${g.sectionName.padEnd(41)} ${String(g.points).padStart(1)} pkt  pozycje: ${slots.padEnd(22)} pula: ${String(g.supply).padStart(3)}  → ${g.sheets} ark.${g.fallbackSlots ? `  (zastępstwo typu: ${g.fallbackSlots})` : ""}`,
    );
  }
  console.log();
}
