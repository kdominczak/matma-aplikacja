// Kopia postępu: zapis z optymistyczną blokadą (save_progress) – dwa urządzenia nie nadpiszą sobie zmian.
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, userId, type TestDb } from "./harness";

let t: TestDb;
const A = userId(31);
const B = userId(32);

const save = async (id: string, data: object, expected: string | null, force = false) =>
  (await t.as<{ at: string }>("authenticated", id, `select public.save_progress($1::jsonb, $2::timestamptz, $3) as at`, [JSON.stringify(data), expected, force]))[0].at;
const saveError = (id: string, data: object, expected: string | null) =>
  t.errorCode("authenticated", id, `select public.save_progress($1::jsonb, $2::timestamptz)`, [JSON.stringify(data), expected]);
const read = async (id: string) => (await t.as<{ data: { v: number }; updated_at: string }>("authenticated", id, `select data, updated_at from public.user_progress`))[0];

beforeEach(async () => {
  t = await createTestDb();
  await t.admin(`insert into auth.users (id) values ($1), ($2)`, [A, B]);
});

describe("save_progress", () => {
  it("pierwszy zapis (bez kopii) i kolejne z aktualnym updated_at", async () => {
    const first = await save(A, { v: 1 }, null);
    const second = await save(A, { v: 2 }, first);
    expect(new Date(second).getTime()).toBeGreaterThan(new Date(first).getTime());
    expect(await read(A)).toMatchObject({ data: { v: 2 } });
  });

  it("wyścig: telefon z nieaktualnym odczytem dostaje MA020 zamiast nadpisać zmiany drugiego", async () => {
    const seen = await save(A, { v: 1 }, null); // oba urządzenia widziały tę wersję
    await save(A, { v: 2 }, seen); // telefon 1 zapisuje
    expect(await saveError(A, { v: 3 }, seen)).toBe("MA020"); // telefon 2 ze starym odczytem
    expect((await read(A)).data.v).toBe(2);
    // telefon 2 pobiera, scala i zapisuje z nowym updated_at
    const fresh = (await read(A)).updated_at;
    await save(A, { v: 3 }, fresh);
    expect((await read(A)).data.v).toBe(3);
  });

  it("„myślę, że kopii nie ma”, a jest (drugie urządzenie było pierwsze) → MA020", async () => {
    await save(A, { v: 1 }, null);
    expect(await saveError(A, { v: 9 }, null)).toBe("MA020");
  });

  it("widziana kopia zniknęła (usunięta gdzie indziej) → MA020, aplikacja pobierze stan od nowa", async () => {
    const seen = await save(A, { v: 1 }, null);
    await t.as("authenticated", A, `delete from public.user_progress`);
    expect(await saveError(A, { v: 2 }, seen)).toBe("MA020");
  });

  it("reset (p_force) nadpisuje bez względu na wersję", async () => {
    await save(A, { v: 1 }, null);
    await save(A, {}, "2000-01-01T00:00:00Z", true);
    expect((await read(A)).data).toEqual({});
  });

  it("updated_at nadaje serwer i zawsze rośnie", async () => {
    let at = await save(A, { v: 0 }, null);
    for (let i = 1; i <= 5; i++) {
      const next = await save(A, { v: i }, at);
      expect(next > at || new Date(next) > new Date(at)).toBe(true);
      at = next;
    }
  });

  it("zapis tylko przez funkcję: bez bezpośredniego INSERT/UPDATE, bez cudzej kopii, bez sesji", async () => {
    await save(A, { v: 1 }, null);
    expect(await t.errorCode("authenticated", A, `update public.user_progress set data = '{"v": 99}'`)).toBe("42501");
    expect(await t.errorCode("authenticated", A, `insert into public.user_progress (user_id, data) values ($1, '{}')`, [A])).toBe("42501");
    // B nie dotknie kopii A – funkcja pisze zawsze do własnego wiersza
    await save(B, { v: 7 }, null);
    expect((await read(A)).data.v).toBe(1);
    expect(await t.errorCode("anon", null, `select public.save_progress('{}', null)`)).toBe("42501");
    expect(await t.errorCode("authenticated", null, `select public.save_progress('{}', null)`)).toBe("28000");
  });

  it("limit rozmiaru i typ danych z tabeli nadal obowiązują", async () => {
    expect(await saveError(A, [] as unknown as object, null)).toBe("23514");
  });
});
