// Generuje supabase/seed/question_keys.sql z danych aplikacji (testy działów, zestawy z „Zadań”, test na start).
// Uruchom po każdej zmianie zadań: `npm run db:keys`, potem wklej plik w Supabase SQL Editor.
// Plik jest idempotentny (insert … on conflict do update) – można go uruchamiać wielokrotnie.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { allQuestionRefs } from "@/data/topics";

const rows = allQuestionRefs().map((ref) => ({
  id: ref.question.id,
  topic: ref.topic.id,
  difficulty: ref.difficulty,
  correct: ref.question.correct,
}));

const ids = new Set<string>();
for (const row of rows) {
  if (ids.has(row.id)) throw new Error(`Powtórzone id pytania: ${row.id}`);
  if (!/^[a-z0-9-]{2,40}$/.test(row.id)) throw new Error(`Id pytania nie pasuje do bazy: ${row.id}`);
  ids.add(row.id);
}

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
const values = rows
  .map((r) => `  (${quote(r.id)}, ${quote(r.topic)}, ${quote(r.difficulty)}, ${quote(r.correct)})`)
  .join(",\n");

const sql = `-- WYGENEROWANE przez scripts/generate-question-keys.ts – nie edytuj ręcznie (npm run db:keys).
-- Klucze odpowiedzi: na ich podstawie serwer sam ocenia poprawność odpowiedzi ucznia.
insert into public.question_keys (question_id, topic_id, difficulty, correct) values
${values}
on conflict (question_id) do update
  set topic_id = excluded.topic_id,
      difficulty = excluded.difficulty,
      correct = excluded.correct;
`;

const out = resolve("supabase/seed/question_keys.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`Zapisano ${rows.length} kluczy odpowiedzi → ${out}`);
