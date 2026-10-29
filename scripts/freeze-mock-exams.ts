// Zamraża arkusze próbne: zapisuje listy id zadań z generatora do src/data/mock-exams.ts.
// Uruchom świadomie (np. po dużej zmianie puli, gdy chcesz nowe arkusze próbne) – zmienia treść arkuszy uczniów,
// którzy je zaczęli. Zwykłe dodawanie zadań NIE wymaga tego skryptu.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateMockExams } from "@/data/exams";

const exams = generateMockExams();
const out = resolve("src/data/mock-exams.ts");
writeFileSync(
  out,
  `import type { Relaxation } from "@/types/blueprint";

export interface FrozenExam {
  id: string;
  code: string;
  layoutYear: number;
  durationMin: number;
  taskIds: string[];
  relaxations: Relaxation[];
}

// Wygenerowane przez \`npm run exams:freeze\` – nie edytuj ręcznie.
export const MOCK_EXAMS: FrozenExam[] = ${JSON.stringify(exams, null, 2)};
`,
);
console.log(`Zamrożono ${exams.length} arkusze próbne → ${out}`);
