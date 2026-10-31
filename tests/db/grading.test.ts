// Ocena zdjęć rozwiązań (Premium): osobny dzienny licznik przepisań i ocen, zwrot tylko przez serwer.
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, userId, type TestDb } from "./harness";

let t: TestDb;
const A = userId(61);
const FREE = userId(62);

type Quota = { allowed: boolean; remaining: number; premium: boolean };
const consume = async (id: string, kind: string) =>
  (await t.as<Quota>("authenticated", id, `select * from public.consume_grading_quota($1)`, [kind]))[0];
const status = async (id: string) =>
  (await t.as<{ ai_used: number; grading_used: number; grading_limit: number }>("authenticated", id, `select * from public.account_status()`))[0];

beforeEach(async () => {
  t = await createTestDb();
  await t.admin(`insert into auth.users (id) values ($1), ($2)`, [A, FREE]);
  await t.admin(`select public.grant_premium($1, 30, 'admin')`, [A]);
});

describe("licznik oceny zdjęć", () => {
  it("bez Premium – odmowa (aplikacja pokazuje Premium), licznik bez zmian", async () => {
    expect(await consume(FREE, "grade")).toEqual({ allowed: false, remaining: 0, premium: false });
    expect(await status(FREE)).toMatchObject({ grading_used: 0, grading_limit: 0 });
  });

  it("z Premium – 30 ocen i osobno 30 przepisań dziennie; wiadomości do korepetytora nietknięte", async () => {
    const [{ limit }] = await t.admin<{ limit: number }>(`select public.ai_grading_daily_limit() as limit`);
    for (let i = limit - 1; i >= 0; i--) expect((await consume(A, "grade")).remaining).toBe(i);
    expect((await consume(A, "grade")).allowed).toBe(false);
    expect((await consume(A, "transcribe")).allowed).toBe(true);
    expect(await status(A)).toMatchObject({ ai_used: 0, grading_used: limit, grading_limit: limit });
  });

  it("zwrot po błędzie Groq tylko przez serwer; nie poniżej zera", async () => {
    await consume(A, "grade");
    expect(await t.errorCode("authenticated", A, `select public.refund_grading_quota($1, 'grade')`, [A])).toBe("42501");
    await t.as("service_role", null, `select public.refund_grading_quota($1, 'grade')`, [A]);
    await t.as("service_role", null, `select public.refund_grading_quota($1, 'grade')`, [A]);
    expect((await status(A)).grading_used).toBe(0);
  });

  it("nieznany rodzaj i brak sesji – odrzucone", async () => {
    expect(await t.errorCode("authenticated", A, `select * from public.consume_grading_quota('chat')`)).toBe("22023");
    expect(await t.errorCode("anon", null, `select * from public.consume_grading_quota('grade')`)).toBe("42501");
  });

  it("migracja jest idempotentna", async () => {
    await consume(A, "grade");
    await t.applyMigration("20261108120000_photo_grading.sql");
    expect((await status(A)).grading_used).toBe(1);
  });
});

describe("limity w regulaminie i na ekranie Premium = limity serwera", () => {
  it("stałe w aplikacji zgadzają się z funkcjami SQL", async () => {
    const { AI_FREE_DAILY_LIMIT, AI_PREMIUM_DAILY_LIMIT, GRADING_DAILY_LIMIT } = await import("@/lib/premium");
    const [row] = await t.admin<{ free: number; premium: number; grading: number }>(
      `select public.ai_free_daily_limit() as free, public.ai_premium_daily_limit() as premium, public.ai_grading_daily_limit() as grading`,
    );
    expect(row).toEqual({ free: AI_FREE_DAILY_LIMIT, premium: AI_PREMIUM_DAILY_LIMIT, grading: GRADING_DAILY_LIMIT });
  });
});
