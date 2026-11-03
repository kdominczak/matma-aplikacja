import { beforeAll, describe, expect, it } from "vitest";
import { createTestDb, MIGRATIONS, userId, type TestDb } from "./harness";

const A = userId(1);
const B = userId(2);

let t: TestDb;

beforeAll(async () => {
  t = await createTestDb();
  await t.createUser(A);
  await t.createUser(B);
});

describe("migracje", () => {
  it("wszystkie przechodzą po kolei na czystej bazie", () => {
    expect(MIGRATIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("po rankingu nic nie zostało (20261111120000): tabele, funkcje, reguły zdjęć", async () => {
    const tables = await t.admin(
      `select relname from pg_class where relnamespace = 'public'::regnamespace and relname in ('profiles', 'answers', 'mistakes', 'question_keys', 'xp_events')`,
    );
    expect(tables).toEqual([]);
    const functions = await t.admin<{ proname: string }>(
      `select proname from pg_proc where pronamespace = 'public'::regnamespace
         and proname in ('leaderboard', 'record_activity', 'record_answers', 'import_mistakes', 'my_topic_stats', 'reset_learning_data',
                         'my_ranking_summary', 'ranking_daily_cap', 'check_nick', 'nick_allowed', 'normalize_nick')`,
    );
    expect(functions).toEqual([]);
    expect(await t.admin(`select policyname from pg_policies where schemaname = 'storage' and policyname like 'Avatary%'`)).toEqual([]);
    expect(await t.admin(`select id from storage.buckets where id = 'avatars'`)).toEqual([]);
  });

  it("sprzątanie można powtórzyć", async () => {
    await t.applyMigration("20261111120000_drop_ranking.sql");
  });
});

describe("kopia postępu i arkusze – prywatne dane", () => {
  it("uczeń zapisuje (przez save_progress) i czyta tylko swoją kopię", async () => {
    await t.as("authenticated", A, `select public.save_progress('{"x": 1}', null)`);
    expect(await t.as("authenticated", A, `select data from public.user_progress`)).toHaveLength(1);
    expect(await t.as("authenticated", B, `select data from public.user_progress`)).toHaveLength(0);
    expect(await t.errorCode("authenticated", B, `insert into public.user_progress (user_id, data) values ($1, '{}')`, [A])).toBe("42501");
  });

  it("bez sesji (rola anon) nie ma dostępu wcale", async () => {
    expect(await t.errorCode("anon", null, `select * from public.user_progress`)).toBe("42501");
    expect(await t.errorCode("anon", null, `select * from public.exam_attempts`)).toBe("42501");
  });

  it("próby arkuszy: zapis własnych, bez edycji wyniku", async () => {
    const insert = `insert into public.exam_attempts (id, user_id, exam_id, started_at, finished_at, duration_sec, points, max_points, answers)
      values (gen_random_uuid(), $1, 'probny-1', now() - interval '1 hour', now(), 3600, 30, 46, '[]')`;
    await t.as("authenticated", A, insert, [A]);
    expect(await t.as("authenticated", A, `select 1 from public.exam_attempts`)).toHaveLength(1);
    expect(await t.errorCode("authenticated", A, `update public.exam_attempts set points = 46`)).toBe("42501");
    expect(await t.errorCode("authenticated", B, insert, [A])).toBe("42501");
  });

  it("próba z dawnym czasem 27 h: wiersz z klienta (attemptRow) przechodzi przez ograniczenia tabeli", async () => {
    const { attemptRow } = await import("@/lib/cloud-sync");
    const finished = new Date();
    const started = new Date(finished.getTime() - 27 * 3_600_000);
    const row = attemptRow(
      {
        id: "7d0c7c1e-8a77-4c6f-9a1b-5a6d3f0b2c11",
        examId: "probny-2",
        startedAt: started.toISOString(),
        finishedAt: finished.toISOString(),
        durationSec: 27 * 3600,
        points: 20,
        maxPoints: 50,
        percent: 40,
        results: [],
      },
      A,
    )!;
    expect(row.duration_sec).toBe(180 * 60);
    await t.as(
      "authenticated",
      A,
      `insert into public.exam_attempts (id, user_id, exam_id, started_at, finished_at, duration_sec, points, max_points, answers)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [row.id, row.user_id, row.exam_id, row.started_at, row.finished_at, row.duration_sec, row.points, row.max_points, JSON.stringify(row.answers)],
    );
  });
});

describe("usunięcie konta", () => {
  it("kasuje konto i wszystkie dane ucznia – tylko jego", async () => {
    await t.as("authenticated", B, `select public.save_progress('{"y": 2}', null)`);
    await t.as("authenticated", A, `select public.delete_my_account()`);
    const left = await t.admin<{ users: number; progress: number; attempts: number }>(
      `select
        (select count(*)::int from auth.users where id = $1) as users,
        (select count(*)::int from public.user_progress where user_id = $1) as progress,
        (select count(*)::int from public.exam_attempts where user_id = $1) as attempts`,
      [A],
    );
    expect(left[0]).toEqual({ users: 0, progress: 0, attempts: 0 });
    expect(await t.admin(`select 1 from public.user_progress where user_id = $1`, [B])).toHaveLength(1);
  });

  it("bez sesji nie da się nic usunąć", async () => {
    expect(await t.errorCode("anon", null, `select public.delete_my_account()`)).toBe("42501");
  });
});
