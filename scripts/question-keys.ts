// Treść pliku supabase/seed/question_keys.sql – wspólna dla generatora (npm run db:keys)
// i testu, który pilnuje, żeby seed w repo był aktualny względem zadań w aplikacji.
import { allQuestionRefs } from "@/data/topics";

export function questionKeysSql(): string {
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

  return `-- WYGENEROWANE przez scripts/generate-question-keys.ts – nie edytuj ręcznie (npm run db:keys).
-- Klucze odpowiedzi: na ich podstawie serwer sam ocenia poprawność odpowiedzi ucznia.
insert into public.question_keys (question_id, topic_id, difficulty, correct) values
${values}
on conflict (question_id) do update
  set topic_id = excluded.topic_id,
      difficulty = excluded.difficulty,
      correct = excluded.correct;
`;
}
