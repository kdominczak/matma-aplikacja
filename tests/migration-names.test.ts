// Nazwy migracji: Supabase CLI zapisuje w historii sam numer (14 cyfr przed „_”), więc dwa pliki z tym samym numerem
// to jedna migracja dla `db push` – druga po cichu by przepadła (3.11.2026: dwie osoby dały ten sam numer).
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

const files = readdirSync(join(__dirname, "..", "supabase", "migrations")).filter((f) => f.endsWith(".sql"));

it("każda migracja: numer z 14 cyfr, małe litery w nazwie, numery bez powtórzeń", () => {
  for (const file of files) expect(file, file).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
  const versions = files.map((f) => f.slice(0, 14));
  const repeated = versions.filter((v, i) => versions.indexOf(v) !== i);
  expect(repeated, `powtórzone numery: ${repeated.join(", ")} – nadaj nowej migracji kolejny wolny numer`).toEqual([]);
});
