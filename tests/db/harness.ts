// Postgres w pamięci (PGlite) z atrapą tego, co dokłada Supabase: schemat auth z auth.uid(),
// role anon/authenticated z domyślnymi uprawnieniami jak w Supabase, Storage i publikacja Realtime.
// Migracje idą w tej samej kolejności co na produkcji (seed kluczy po drugiej).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const ROOT = join(import.meta.dirname, "..", "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");
const SEED = join(ROOT, "supabase", "seed", "question_keys.sql");
const SEED_AFTER = "20261028120000_learning_history.sql";

export const MIGRATIONS = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const SUPABASE_STUB = `
  create schema auth;
  create table auth.users (id uuid primary key, email text, is_anonymous boolean not null default true);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public, auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  create publication supabase_realtime;

  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id bigint generated always as identity primary key, bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant all on storage.objects to authenticated;
`;

export type Role = "anon" | "authenticated";

export interface TestDb {
  db: PGlite;
  /** Zapytanie jako dana rola i użytkownik (jak przez PostgREST z JWT). */
  as<T = Record<string, unknown>>(role: Role, userId: string | null, sql: string, params?: unknown[]): Promise<T[]>;
  /** Kod błędu Postgresa (np. 42501, MA004) albo null, gdy zapytanie się udało. */
  errorCode(role: Role, userId: string | null, sql: string, params?: unknown[]): Promise<string | null>;
  /** Zapytanie jako właściciel bazy (z pominięciem RLS) – do przygotowania danych i sprawdzeń. */
  admin<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  /** Konto (jak po signInAnonymously) z profilem w rankingu. */
  createMember(id: string, nick: string): Promise<void>;
  applyMigration(file: string): Promise<void>;
}

/** Baza po migracjach do `until` włącznie (domyślnie wszystkich). */
export async function createTestDb(until?: string): Promise<TestDb> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);

  async function applyMigration(file: string) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
    if (file === SEED_AFTER) await db.exec(readFileSync(SEED, "utf8"));
  }

  for (const file of MIGRATIONS) {
    await applyMigration(file);
    if (file === until) break;
  }

  async function as<T>(role: Role, userId: string | null, sql: string, params: unknown[] = []): Promise<T[]> {
    return db.transaction(async (tx) => {
      await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? ""]);
      await tx.exec(`set local role ${role}`);
      const result = await tx.query<T>(sql, params);
      return result.rows;
    });
  }

  return {
    db,
    as,
    async errorCode(role, userId, sql, params) {
      try {
        await as(role, userId, sql, params);
        return null;
      } catch (error) {
        return (error as { code?: string }).code ?? "unknown";
      }
    },
    async admin<T>(sql: string, params: unknown[] = []) {
      return (await db.query<T>(sql, params)).rows;
    },
    async createMember(id, nick) {
      await db.query(`insert into auth.users (id) values ($1)`, [id]);
      await as("authenticated", id, `insert into public.profiles (id, nick) values ($1, $2)`, [id, nick]);
    },
    applyMigration,
  };
}

/** Kolejne „konta” testowe. */
export function userId(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}
