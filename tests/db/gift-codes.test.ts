// Kody podarunkowe i z przedsprzedaży – nalicza wyłącznie serwer, w bazie tylko skróty kodów.
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, userId, type TestDb } from "./harness";

let t: TestDb;
const A = userId(21);
const B = userId(22);
const C = userId(23);

type Redeemed = { premium_until: string | null; days: number | null; error: string | null };

const redeem = async (id: string, code: string) =>
  (await t.as<Redeemed>("authenticated", id, `select * from public.redeem_gift_code($1)`, [code]))[0];

/** Partia kodów jak z SQL Editora (właściciel bazy). */
async function codes(count: number, days: number, maxUses = 1, validUntil: string | null = null): Promise<string[]> {
  const rows = await t.admin<{ code: string }>(`select public.create_gift_codes($1, $2, 'test', $3, $4) as code`, [count, days, maxUses, validUntil]);
  return rows.map((r) => r.code);
}

beforeEach(async () => {
  t = await createTestDb();
  // konta z e-mailem albo Google – anonimowe dostają MA030 (test na końcu)
  for (const id of [A, B, C]) await t.admin(`insert into auth.users (id, is_anonymous) values ($1, false)`, [id]);
});

describe("kody podarunkowe", () => {
  it("tworzy kody w formacie XXXX-XXXX-XXXX bez mylących znaków, w bazie trzyma tylko skrót", async () => {
    const list = await codes(20, 30);
    expect(new Set(list).size).toBe(20);
    for (const code of list) expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    const stored = await t.admin<{ code_hash: string }>(`select code_hash from public.gift_codes`);
    expect(stored.every((r) => /^[0-9a-f]{64}$/.test(r.code_hash))).toBe(true);
    expect(JSON.stringify(stored)).not.toContain(list[0].replaceAll("-", ""));
  });

  it("poprawny kod daje Premium na dni z partii, a dni się sumują", async () => {
    const [code] = await codes(1, 30);
    await t.admin(`select public.grant_premium($1, 2, 'referred')`, [A]);
    // wielkość liter, spacje i myślniki nie mają znaczenia
    const ok = await redeem(A, ` ${code.toLowerCase().replaceAll("-", " ")} `);
    expect(ok.error).toBeNull();
    expect(ok.days).toBe(30);
    const days = (new Date(ok.premium_until!).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(31.9);
    expect(days).toBeLessThan(32.1);
    const grants = await t.admin<{ source: string }>(`select source from public.premium_grants where user_id = $1 order by id`, [A]);
    expect(grants.map((g) => g.source)).toEqual(["referred", "gift"]);
  });

  it("kod jednorazowy działa raz; drugi uczeń dostaje MA025, ten sam – MA023", async () => {
    const [code] = await codes(1, 7);
    expect((await redeem(A, code)).error).toBeNull();
    expect((await redeem(A, code)).error).toBe("MA023");
    expect((await redeem(B, code)).error).toBe("MA025");
    expect((await t.admin<{ uses: number }>(`select uses from public.gift_codes`))[0].uses).toBe(1);
  });

  it("kod dla klasy: tyle użyć, ile max_uses, każde konto raz", async () => {
    const [code] = await codes(1, 14, 2);
    expect((await redeem(A, code)).error).toBeNull();
    expect((await redeem(B, code)).error).toBeNull();
    expect((await redeem(C, code)).error).toBe("MA025");
  });

  it("wygasły kod – MA022, bez Premium", async () => {
    const [code] = await codes(1, 30, 1, new Date(Date.now() - 60_000).toISOString());
    expect((await redeem(A, code)).error).toBe("MA022");
    expect(await t.admin(`select 1 from public.entitlements where user_id = $1`, [A])).toHaveLength(0);
  });

  it("nieistniejący kod – MA021; po 10 nieudanych próbach w godzinę nawet dobry kod czeka (MA024)", async () => {
    const [code] = await codes(1, 30);
    for (let i = 0; i < 10; i++) expect((await redeem(A, "AAAA-BBBB-CCCC")).error).toBe("MA021");
    expect((await redeem(A, code)).error).toBe("MA024");
    // limit jest na konto – inny uczeń wpisuje normalnie
    expect((await redeem(B, code)).error).toBeNull();
    // po godzinie próby przestają się liczyć
    await t.admin(`update public.gift_attempts set at = now() - interval '2 hours'`);
    expect((await redeem(A, "AAAA-BBBB-CCCC")).error).toBe("MA021");
  });

  it("zły format liczy się jako nieudana próba", async () => {
    expect((await redeem(A, "K7MP2Q")).error).toBe("MA021");
    expect(await t.admin(`select 1 from public.gift_attempts where user_id = $1`, [A])).toHaveLength(1);
  });

  it("klient nie widzi kodów, nie tworzy ich i nie dopisuje użyć", async () => {
    expect(await t.errorCode("authenticated", A, `select * from public.gift_codes`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select * from public.gift_redemptions`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `delete from public.gift_attempts`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select public.create_gift_codes(1, 400, 'x')`)).toBe("42501");
    expect(await t.errorCode("anon", null, `select * from public.redeem_gift_code('AAAA-BBBB-CCCC')`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select public.gift_code_hash('x')`)).toBe("42501");
  });

  it("usunięcie konta kasuje jego użycia i próby, kod zostaje", async () => {
    const [code] = await codes(1, 30);
    await redeem(A, code);
    await redeem(A, "AAAA-BBBB-CCCC");
    await t.admin(`delete from auth.users where id = $1`, [A]);
    expect(await t.admin(`select 1 from public.gift_redemptions`)).toHaveLength(0);
    expect(await t.admin(`select 1 from public.gift_attempts`)).toHaveLength(0);
    expect(await t.admin(`select 1 from public.gift_codes`)).toHaveLength(1);
  });

  it("konto anonimowe: odmowa MA030 (wyjątek), bez Premium i bez zużycia prób", async () => {
    const ANON = userId(24);
    await t.admin(`insert into auth.users (id) values ($1)`, [ANON]); // atrapa: is_anonymous domyślnie true
    const [code] = await codes(1, 30);
    expect(await t.errorCode("authenticated", ANON, `select * from public.redeem_gift_code($1)`, [code])).toBe("MA030");
    expect(await t.admin(`select * from public.gift_attempts where user_id = $1`, [ANON])).toEqual([]);
    expect(await t.admin(`select * from public.gift_redemptions where user_id = $1`, [ANON])).toEqual([]);
  });
});
