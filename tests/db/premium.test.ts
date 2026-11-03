// Premium, dzienny limit AI i kody poleceń – liczy wyłącznie serwer, klient nie może niczego „dopisać”.
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, MIGRATIONS, userId, type TestDb } from "./harness";

let t: TestDb;
const A = userId(11);
const B = userId(12);

/** Konto z e-mailem albo Google (AI i kody poleceń są tylko dla takich kont – migracja 20261109120000). */
async function account(id: string, ageDays = 0) {
  await t.admin(`insert into auth.users (id, created_at, is_anonymous) values ($1, now() - make_interval(days => $2), false)`, [id, ageDays]);
}

const status = async (id: string) =>
  (await t.as<{ premium_until: string | null; ai_used: number; ai_limit: number; referral_code: string | null; referral_count: number }>(
    "authenticated",
    id,
    `select * from public.account_status()`,
  ))[0];

const consume = async (id: string) =>
  (await t.as<{ allowed: boolean; remaining: number; premium: boolean }>("authenticated", id, `select * from public.consume_ai_quota()`))[0];

const codeOf = async (id: string) => (await t.as<{ code: string }>("authenticated", id, `select public.my_referral_code() as code`))[0].code;

const redeem = (id: string, code: string) => t.as<{ premium_until: string; days: number }>("authenticated", id, `select * from public.redeem_referral($1)`, [code]);

beforeEach(async () => {
  t = await createTestDb();
  await account(A);
  await account(B);
});

describe("dzienny limit AI", () => {
  it("darmowe konto ma 5 wiadomości dziennie, szósta jest odrzucana", async () => {
    for (let i = 4; i >= 0; i--) expect(await consume(A)).toEqual({ allowed: true, remaining: i, premium: false });
    expect(await consume(A)).toEqual({ allowed: false, remaining: 0, premium: false });
    expect(await status(A)).toMatchObject({ ai_used: 5, ai_limit: 5 });
    // limit jest osobny dla każdego konta
    expect((await consume(B)).remaining).toBe(4);
  });

  it("nowy dzień zaczyna od zera", async () => {
    for (let i = 0; i < 5; i++) await consume(A);
    await t.admin(`update public.ai_usage set day = day - 1 where user_id = $1`, [A]);
    expect((await consume(A)).allowed).toBe(true);
  });

  it("Premium podnosi limit do pułapu technicznego", async () => {
    await t.admin(`select public.grant_premium($1, 2, 'admin')`, [A]);
    const first = await consume(A);
    expect(first).toMatchObject({ allowed: true, premium: true });
    expect(first.remaining).toBe(199);
  });

  it("klient nie może zapisać licznika ani Premium bezpośrednio, ani nadać sobie dni", async () => {
    expect(await t.errorCode("authenticated", A, `update public.ai_usage set messages = 0`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `insert into public.entitlements (user_id, premium_until) values ($1, now() + interval '1 year')`, [A])).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select public.grant_premium($1, 30, 'admin')`, [A])).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select * from public.referral_codes`)).toBe("42501");
  });

  it("serwer oddaje wiadomość po błędzie Groq, licznik nie spada poniżej zera", async () => {
    const refund = () => t.as<{ used: number }>("service_role", null, `select public.refund_ai_quota($1) as used`, [A]);
    for (let i = 0; i < 5; i++) await consume(A);
    expect((await consume(A)).allowed).toBe(false);
    expect((await refund())[0].used).toBe(4);
    expect(await consume(A)).toEqual({ allowed: true, remaining: 0, premium: false });
    await t.admin(`update public.ai_usage set messages = 0 where user_id = $1`, [A]);
    expect((await refund())[0].used).toBe(0);
    // bez wiersza z dzisiaj (pierwsza wiadomość dnia nie doszła do bazy) – nic się nie dzieje
    expect((await t.as<{ used: number }>("service_role", null, `select public.refund_ai_quota($1) as used`, [B]))[0].used).toBe(0);
  });

  it("uczeń nie może sam oddać sobie wiadomości", async () => {
    await consume(A);
    expect(await t.errorCode("authenticated", A, `select public.refund_ai_quota($1)`, [A])).toBe("42501");
    expect(await t.errorCode("anon", null, `select public.refund_ai_quota($1)`, [A])).toBe("42501");
    expect((await status(A)).ai_used).toBe(1);
  });

  it("bez sesji nie ma dostępu do AI ani stanu konta", async () => {
    expect(await t.errorCode("anon", null, `select * from public.consume_ai_quota()`)).toBe("42501");
    expect(await t.errorCode("authenticated", null, `select * from public.consume_ai_quota()`)).toBe("28000");
  });
});

describe("kody poleceń", () => {
  it("kod jest stały, 6 znaków bez mylących 0/O i 1/I", async () => {
    const code = await codeOf(A);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(await codeOf(A)).toBe(code);
    expect((await status(A)).referral_code).toBe(code);
  });

  it("polecony i polecający dostają po 2 dni Premium", async () => {
    const code = await codeOf(A);
    const [result] = await redeem(B, ` ${code.toLowerCase()} `); // wielkość liter i spacje bez znaczenia
    expect(result.days).toBe(2);
    const hours = (until: string | null) => (new Date(until!).getTime() - Date.now()) / 3_600_000;
    expect(hours((await status(B)).premium_until)).toBeCloseTo(48, 0);
    expect(hours((await status(A)).premium_until)).toBeCloseTo(48, 0);
    expect((await status(A)).referral_count).toBe(1);
  });

  it("dni się sumują z istniejącym Premium", async () => {
    await t.admin(`select public.grant_premium($1, 5, 'admin')`, [B]);
    await redeem(B, await codeOf(A));
    const days = (new Date((await status(B)).premium_until!).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeCloseTo(7, 1);
  });

  it("nie da się wpisać własnego, nieistniejącego ani drugiego kodu", async () => {
    const codeA = await codeOf(A);
    expect(await t.errorCode("authenticated", A, `select * from public.redeem_referral($1)`, [codeA])).toBe("MA011");
    expect(await t.errorCode("authenticated", B, `select * from public.redeem_referral('ZZZZZZ')`)).toBe("MA010");
    await redeem(B, codeA);
    const C = userId(13);
    await account(C);
    expect(await t.errorCode("authenticated", B, `select * from public.redeem_referral($1)`, [await codeOf(C)])).toBe("MA012");
  });

  it("kod działa tylko w pierwszym tygodniu konta", async () => {
    const old = userId(14);
    await account(old, 8);
    expect(await t.errorCode("authenticated", old, `select * from public.redeem_referral($1)`, [await codeOf(A)])).toBe("MA013");
  });

  it("polecający zbiera najwyżej 2 nagrody dziennie i 5 w sezonie – polecony zawsze dostaje swoje dni", async () => {
    const code = await codeOf(A);
    for (let i = 0; i < 8; i++) {
      const id = userId(100 + i);
      await account(id);
      // co dwa polecenia „przesuwamy czas” o dzień, żeby dzienny limit nie zasłaniał sezonowego
      if (i % 2 === 0) await t.admin(`update public.referrals set created_at = created_at - interval '1 day' where referrer_id = $1`, [A]);
      const [result] = await redeem(id, code);
      expect(result.days).toBe(2);
    }
    const rewarded = await t.admin<{ n: number }>(`select count(*)::int as n from public.referrals where referrer_id = $1 and referrer_rewarded`, [A]);
    expect(rewarded[0].n).toBe(5);
    const grants = await t.admin<{ n: number }>(`select count(*)::int as n from public.premium_grants where user_id = $1 and source = 'referral'`, [A]);
    expect(grants[0].n).toBe(5);
  });

  it("dzienny limit polecającego: trzecie polecenie tego samego dnia bez nagrody", async () => {
    const code = await codeOf(A);
    for (let i = 0; i < 3; i++) {
      const id = userId(200 + i);
      await account(id);
      await redeem(id, code);
    }
    const rows = await t.admin<{ referrer_rewarded: boolean }>(`select referrer_rewarded from public.referrals where referrer_id = $1 order by created_at`, [A]);
    expect(rows.map((r) => r.referrer_rewarded)).toEqual([true, true, false]);
  });

  it("usunięcie konta kasuje Premium, licznik i kody", async () => {
    await codeOf(A);
    await consume(A);
    await t.admin(`select public.grant_premium($1, 2, 'admin')`, [A]);
    await t.admin(`delete from auth.users where id = $1`, [A]);
    const left = await t.admin<{ n: number }>(
      `select (select count(*) from public.entitlements where user_id = $1) + (select count(*) from public.ai_usage where user_id = $1)
        + (select count(*) from public.referral_codes where user_id = $1) + (select count(*) from public.premium_grants where user_id = $1) as n`,
      [A],
    );
    expect(Number(left[0].n)).toBe(0);
  });
});

describe("zakupy (webhook RevenueCat → set_purchase_premium)", () => {
  const setPurchase = (id: string, until: string | null, event = "RENEWAL") =>
    t.as<{ until: string | null }>("service_role", null, `select public.set_purchase_premium($1, $2, 'premium_monthly', $3) as until`, [id, until, event]);
  const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();

  it("zakup włącza Premium; kolejne zdarzenie nadpisuje datę, a nie dodaje dni", async () => {
    await setPurchase(A, inDays(30), "INITIAL_PURCHASE");
    expect((await consume(A)).premium).toBe(true);
    await setPurchase(A, inDays(30)); // duplikat webhooka
    await setPurchase(A, inDays(60)); // odnowienie
    const until = new Date((await status(A)).premium_until!).getTime();
    expect(until).toBeGreaterThan(Date.now() + 59 * 86_400_000);
    expect(until).toBeLessThan(Date.now() + 61 * 86_400_000);
    expect((await status(A)).ai_limit).toBe(200);
  });

  it("zwrot albo wygaśnięcie odbiera Premium z zakupu, ale nie dni z poleceń", async () => {
    await setPurchase(A, inDays(30));
    await setPurchase(A, null, "CANCELLATION");
    expect((await status(A)).premium_until).toBeNull();
    expect((await consume(A)).premium).toBe(false);

    await t.admin(`select public.grant_premium($1, 2, 'referral')`, [B]);
    await setPurchase(B, inDays(30));
    await setPurchase(B, inDays(-1), "EXPIRATION");
    const until = new Date((await status(B)).premium_until!).getTime();
    expect(until).toBeGreaterThan(Date.now() + 86_400_000); // zostały 2 dni z polecenia
    expect((await consume(B)).premium).toBe(true);
  });

  it("dni z polecenia po zakupie nie skracają zakupu (Premium do późniejszej z dat)", async () => {
    await setPurchase(A, inDays(30));
    await t.admin(`select public.grant_premium($1, 2, 'referral')`, [A]);
    expect(new Date((await status(A)).premium_until!).getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);
  });

  it("każde zdarzenie trafia do dziennika", async () => {
    await setPurchase(A, inDays(30), "INITIAL_PURCHASE");
    await setPurchase(A, null, "CANCELLATION");
    const rows = await t.admin<{ event_type: string }>(`select event_type from public.purchase_events where user_id = $1 order by id`, [A]);
    expect(rows.map((r) => r.event_type)).toEqual(["INITIAL_PURCHASE", "CANCELLATION"]);
  });

  it("migracje od zakupów wzwyż można powtórzyć po kolei – dane i nowsze funkcje zostają", async () => {
    await setPurchase(A, inDays(30), "INITIAL_PURCHASE");
    // powtórka = ta migracja i wszystkie nowsze w kolejności (sama starsza cofnęłaby nowsze wersje funkcji);
    // bez 20261106 (ranking) – jej tabele usuwa 20261111120000_drop_ranking.sql
    const replay = MIGRATIONS.filter((f) => f >= "20261103120000" && f !== "20261106120000_fair_ranking.sql");
    for (const file of replay) await t.applyMigration(file);
    expect((await consume(A)).premium).toBe(true);
    expect(await status(A)).toHaveProperty("grading_limit");
    expect((await t.admin<{ n: number }>(`select count(*)::int as n from public.purchase_events`))[0].n).toBe(1);
  });

  it("uczeń nie może ustawić sobie zakupu ani czytać dziennika", async () => {
    expect(await t.errorCode("authenticated", A, `select public.set_purchase_premium($1, now() + interval '1 year', 'x', 'x')`, [A])).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select * from public.purchase_events`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `select public.premium_until_of($1)`, [A])).toBe("42501");
    expect(await t.errorCode("authenticated", A, `update public.entitlements set purchase_until = now() + interval '1 year'`)).toBe("42501");
  });
});

describe("konto anonimowe (bez e-maila i Google)", () => {
  const ANON = userId(19);

  beforeEach(async () => {
    await t.admin(`insert into auth.users (id) values ($1)`, [ANON]); // atrapa: is_anonymous domyślnie true
  });

  it("nie dostaje wiadomości do AI, oceny zdjęć ani kodów poleceń – i nie rusza licznika", async () => {
    const code = await codeOf(A);
    expect(await t.errorCode("authenticated", ANON, `select * from public.consume_ai_quota()`)).toBe("MA030");
    expect(await t.errorCode("authenticated", ANON, `select * from public.consume_grading_quota('grade')`)).toBe("MA030");
    expect(await t.errorCode("authenticated", ANON, `select public.my_referral_code()`)).toBe("MA030");
    expect(await t.errorCode("authenticated", ANON, `select * from public.redeem_referral($1)`, [code])).toBe("MA030");
    expect(await t.admin(`select * from public.ai_usage where user_id = $1`, [ANON])).toEqual([]);
    expect(await t.admin(`select * from public.referrals where referee_id = $1`, [ANON])).toEqual([]);
  });

  it("po dopięciu e-maila (to samo konto) wszystko działa", async () => {
    await t.admin(`update auth.users set is_anonymous = false, email = 'uczen@example.com' where id = $1`, [ANON]);
    expect((await consume(ANON)).allowed).toBe(true);
  });

  it("uczeń nie wywoła sprawdzenia konta bezpośrednio", async () => {
    expect(await t.errorCode("authenticated", ANON, `select public.require_full_account($1)`, [ANON])).toBe("42501");
  });
});
