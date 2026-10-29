// Ranking: każde zadanie raz dziennie, najwyżej ranking_daily_cap() punktów dziennie (migracja 20261106120000).
import { beforeEach, describe, expect, it } from "vitest";
import { createTestDb, userId, type TestDb } from "./harness";

const A = userId(41);
const B = userId(42);
let t: TestDb;

/** Poprawna odpowiedź na n-te zadanie z kluczy serwera, zapisana z pominięciem limitów record_answers, `daysAgo` dni temu. */
async function correct(user: string, questionIndex: number, daysAgo = 0) {
  await t.admin(
    `insert into public.answers (user_id, question_id, topic_id, difficulty, chosen, correct, source, created_at)
     select $1, k.question_id, k.topic_id, k.difficulty, k.correct, true, 'test', now() - make_interval(days => $3)
     from public.question_keys k order by k.question_id offset $2 limit 1`,
    [user, questionIndex, daysAgo],
  );
}

const points = async (period: "week" | "all", user = A) => {
  const rows = await t.as<{ user_id: string; solved: string }>("anon", null, `select * from public.leaderboard($1, 50)`, [period]);
  return Number(rows.find((r) => r.user_id === user)?.solved ?? -1);
};

beforeEach(async () => {
  t = await createTestDb();
  await t.createMember(A, "Ola");
  await t.createMember(B, "Bot");
});

describe("uczciwy ranking", () => {
  it("to samo zadanie rozwiązane kilka razy tego samego dnia liczy się raz", async () => {
    for (let i = 0; i < 5; i++) await correct(A, 0);
    await correct(A, 1);
    expect(await points("all")).toBe(2);
  });

  it("to samo zadanie w inny dzień liczy się znowu (powtórki mają sens)", async () => {
    await correct(A, 0, 0);
    await correct(A, 0, 1);
    await correct(A, 0, 2);
    expect(await points("all")).toBe(3);
  });

  it("dzienny pułap: skrypt z setkami poprawnych odpowiedzi dostaje najwyżej 150 za dzień", async () => {
    const [{ cap, keys }] = await t.admin<{ cap: number; keys: number }>(
      `select public.ranking_daily_cap() as cap, (select count(*)::int from public.question_keys) as keys`,
    );
    expect(keys).toBeGreaterThan(cap);
    await t.admin(
      `insert into public.answers (user_id, question_id, topic_id, difficulty, chosen, correct, source)
       select $1, k.question_id, k.topic_id, k.difficulty, k.correct, true, 'test' from public.question_keys k limit $2`,
      [B, cap + 50],
    );
    expect(await points("all", B)).toBe(cap);
  });

  it("dane nauki zostają pełne – w historii są wszystkie odpowiedzi, także powtórzone", async () => {
    for (let i = 0; i < 3; i++) await correct(A, 0);
    const [{ n }] = await t.admin<{ n: number }>(`select count(*)::int as n from public.answers where user_id = $1`, [A]);
    expect(n).toBe(3);
  });
});
