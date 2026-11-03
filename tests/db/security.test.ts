// Strażnik powierzchni bezpieczeństwa bazy po wszystkich migracjach: RLS na każdej tabeli, bezpieczne funkcje
// SECURITY DEFINER i dokładna lista tego, co wolno klientowi (anon / authenticated). Nowa tabela, funkcja albo
// uprawnienie dla klienta wymaga świadomego dopisania tutaj – nic nie otworzy się „przy okazji”.
import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, type TestDb } from "./harness";

let t: TestDb;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

const names = (rows: { name: string }[]) => rows.map((r) => r.name).sort();

describe("bezpieczeństwo bazy", () => {
  it("każda tabela w public ma włączone RLS", async () => {
    const rows = await t.admin<{ name: string }>(
      `select c.relname as name from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity`,
    );
    expect(names(rows)).toEqual([]);
  });

  it("każda funkcja SECURITY DEFINER ma ustawiony search_path (bez podmiany obiektów przez schemat ucznia)", async () => {
    const rows = await t.admin<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.prosecdef
         and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')`,
    );
    expect(names(rows)).toEqual([]);
  });

  it("niezalogowany (anon) wywoła tylko stałe (limity)", async () => {
    const rows = await t.admin<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')`,
    );
    expect(names(rows)).toEqual([
      "ai_free_daily_limit",
      "ai_grading_daily_limit",
      "ai_premium_daily_limit",
    ]);
  });

  it("zalogowany uczeń wywoła tylko te funkcje z prawami właściciela", async () => {
    const rows = await t.admin<{ name: string }>(
      `select p.proname as name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.prosecdef and has_function_privilege('authenticated', p.oid, 'execute')`,
    );
    expect(names(rows)).toEqual([
      "account_status",
      "consume_ai_quota",
      "consume_grading_quota",
      "delete_my_account",
      "my_referral_code",
      "redeem_gift_code",
      "redeem_referral",
      "save_progress",
      "track_funnel",
    ]);
  });

  it("bezpośredni dostęp do tabel: anon – nic, uczeń – tylko swoje dane (dalej zawęża RLS)", async () => {
    const grants = (role: string) =>
      t.admin<{ name: string; privileges: string }>(
        `select table_name as name, string_agg(privilege_type, ',' order by privilege_type) as privileges
         from information_schema.role_table_grants
         where table_schema = 'public' and grantee = $1 group by table_name order by table_name`,
        [role],
      );
    expect(await grants("anon")).toEqual([]);
    expect(await grants("authenticated")).toEqual([
      { name: "exam_attempts", privileges: "DELETE,INSERT,SELECT" },
      { name: "user_progress", privileges: "DELETE,SELECT" },
    ]);
  });
});
