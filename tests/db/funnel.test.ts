// Lejek Premium: kroki raz na konto i dzień, ai_limit tylko z serwera, raport z supabase/admin/lejek.sql.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, userId, type TestDb } from "./harness";

let t: TestDb;
const A = userId(51);
const B = userId(52);

const track = (id: string, event: string) => t.as("authenticated", id, `select public.track_funnel($1)`, [event]);
const events = async () =>
  (await t.admin<{ event: string; user_id: string }>(`select event, user_id from public.funnel_events order by event, user_id`)).map((r) => `${r.event}:${r.user_id === A ? "A" : "B"}`);

beforeEach(async () => {
  t = await createTestDb();
  await t.admin(`insert into auth.users (id) values ($1), ($2)`, [A, B]);
});

describe("lejek Premium", () => {
  it("wyczerpany limit AI zapisuje serwer – raz dziennie, nawet przy kolejnych odmowach", async () => {
    for (let i = 0; i < 8; i++) await t.as("authenticated", A, `select * from public.consume_ai_quota()`);
    expect(await events()).toEqual(["ai_limit:A"]);
  });

  it("kroki z aplikacji: raz na konto i dzień", async () => {
    await track(A, "premium_view");
    await track(A, "premium_view");
    await track(A, "buy_start");
    await track(B, "email_gate");
    expect(await events()).toEqual(["buy_start:A", "email_gate:B", "premium_view:A"]);
  });

  it("aplikacja nie zgłosi ai_limit ani nieznanego kroku; bez konta nic nie zapisze; nikt nie czyta tabeli", async () => {
    expect(await t.errorCode("authenticated", A, `select public.track_funnel('ai_limit')`)).toBe("22023");
    expect(await t.errorCode("authenticated", A, `select public.track_funnel('cokolwiek')`)).toBe("22023");
    expect(await t.errorCode("anon", null, `select public.track_funnel('premium_view')`)).toBe("42501");
    expect(await t.errorCode("authenticated", null, `select public.track_funnel('premium_view')`)).toBe("28000");
    expect(await t.errorCode("authenticated", A, `select * from public.funnel_events`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select public.funnel_note($1, 'buy_start')`, [A])).toBe("42501");
  });

  it("usunięcie konta kasuje jego kroki", async () => {
    await track(A, "premium_view");
    await t.admin(`delete from auth.users where id = $1`, [A]);
    expect(await events()).toEqual([]);
  });

  it("raport supabase/admin/lejek.sql działa i liczy dzisiejsze kroki", async () => {
    await track(A, "premium_view");
    await track(B, "premium_view");
    await track(A, "buy_start");
    for (let i = 0; i < 6; i++) await t.as("authenticated", B, `select * from public.consume_ai_quota()`);
    await t.as("service_role", null, `select public.set_purchase_premium($1, now() + interval '30 days', 'premium_monthly', 'APP_SYNC')`, [A]);
    const sql = readFileSync(join(import.meta.dirname, "..", "..", "supabase", "admin", "lejek.sql"), "utf8");
    const rows = await t.admin<Record<string, number | string>>(sql);
    expect(rows).toHaveLength(30);
    expect(rows[0]).toMatchObject({ limit_ai: 1, ekran_premium: 2, klik_kup: 1, pierwsze_zakupy: 1 });
  });
});
