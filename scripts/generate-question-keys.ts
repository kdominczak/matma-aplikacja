// Generuje supabase/seed/question_keys.sql z danych aplikacji (testy działów, zestawy z „Zadań”, test na start).
// Uruchom po każdej zmianie zadań: `npm run db:keys`, potem wklej plik w Supabase SQL Editor.
// Plik jest idempotentny (insert … on conflict do update) – można go uruchamiać wielokrotnie.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { questionKeysSql } from "./question-keys";

const sql = questionKeysSql();
const rows = sql.match(/^  \(/gm) ?? [];

const out = resolve("supabase/seed/question_keys.sql");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, sql);
console.log(`Zapisano ${rows.length} kluczy odpowiedzi → ${out}`);
