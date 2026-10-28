import { beforeAll, describe, expect, it } from "vitest";
import { allQuestionRefs } from "@/data/topics";
import { isNickAllowed, normalizeNick } from "@/lib/moderation";
import { createTestDb, MIGRATIONS, userId, type TestDb } from "./harness";

const refs = allQuestionRefs();
const [q1, q2, q3] = refs;
const wrong = (letter: string) => (letter === "A" ? "B" : "A");

const A = userId(1);
const B = userId(2);
const C = userId(3);

let t: TestDb;

/** Odpowiedzi jako uczeń; czyści limit „jedna paczka na 3 s”, żeby testy nie musiały czekać. */
async function send(user: string, answers: { q: string; c: string }[], source = "test") {
  await t.admin(`update public.answers set created_at = created_at - interval '10 seconds' where user_id = $1`, [user]);
  const [row] = await t.as<{ recorded: number; beaten: number; skipped: number }>(
    "authenticated",
    user,
    `select * from public.record_answers($1, $2::jsonb)`,
    [source, JSON.stringify(answers)],
  );
  return row;
}

beforeAll(async () => {
  t = await createTestDb();
  await t.createMember(A, "Euklides");
  await t.createMember(B, "Kasia");
  await t.createMember(C, "Nowy");
});

describe("migracje", () => {
  it("wszystkie przechodzą po kolei na czystej bazie", () => {
    expect(MIGRATIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("seed zawiera klucz każdego zadania zamkniętego z aplikacji", async () => {
    const [{ count }] = await t.admin<{ count: number }>(`select count(*)::int as count from public.question_keys`);
    expect(count).toBe(refs.length);
  });

  it("po migracjach nie zostało nic z XP", async () => {
    const columns = await t.admin(`select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'xp'`);
    expect(columns).toHaveLength(0);
  });
});

describe("record_answers – serwer sam ocenia odpowiedzi", () => {
  it("liczy poprawność z kluczy, nie z tego, co przyśle klient", async () => {
    const row = await send(A, [
      { q: q1.question.id, c: q1.question.correct },
      { q: q2.question.id, c: wrong(q2.question.correct) },
    ]);
    expect(row).toMatchObject({ recorded: 2, skipped: 0 });
    const saved = await t.as<{ question_id: string; correct: boolean }>("authenticated", A, `select question_id, correct from public.answers order by question_id`);
    expect(saved.find((r) => r.question_id === q1.question.id)?.correct).toBe(true);
    expect(saved.find((r) => r.question_id === q2.question.id)?.correct).toBe(false);
  });

  it("pomyłka trafia do pudełka, poprawna odpowiedź ją wyjmuje", async () => {
    expect(await t.as("authenticated", A, `select 1 from public.mistakes where question_id = $1`, [q2.question.id])).toHaveLength(1);
    const row = await send(A, [{ q: q2.question.id, c: q2.question.correct }], "training");
    expect(row.beaten).toBe(1);
    expect(await t.as("authenticated", A, `select 1 from public.mistakes where question_id = $1`, [q2.question.id])).toHaveLength(0);
  });

  it("pomija zadania, których serwer nie zna, i złe litery", async () => {
    const row = await send(A, [
      { q: "nie-ma-takiego", c: "A" },
      { q: q3.question.id, c: "Z" },
    ]);
    expect(row).toMatchObject({ recorded: 0, skipped: 2 });
  });

  it("limituje częstotliwość zapisów (MA001)", async () => {
    await send(B, [{ q: q1.question.id, c: q1.question.correct }]);
    const code = await t.errorCode("authenticated", B, `select * from public.record_answers('test', $1::jsonb)`, [
      JSON.stringify([{ q: q2.question.id, c: "A" }]),
    ]);
    expect(code).toBe("MA001");
  });

  it("wymaga profilu w rankingu (MA003) i zalogowania", async () => {
    const stranger = userId(99);
    await t.admin(`insert into auth.users (id) values ($1)`, [stranger]);
    const payload = JSON.stringify([{ q: q1.question.id, c: "A" }]);
    expect(await t.errorCode("authenticated", stranger, `select * from public.record_answers('test', $1::jsonb)`, [payload])).toBe("MA003");
    expect(await t.errorCode("anon", null, `select * from public.record_answers('test', $1::jsonb)`, [payload])).toBe("42501");
  });

  it("zaczyna serię dni, a profilu nie da się „podkręcić” ręcznie", async () => {
    const [profile] = await t.admin<{ streak: number }>(`select streak from public.profiles where id = $1`, [A]);
    expect(profile.streak).toBe(1);
    expect(await t.errorCode("authenticated", A, `update public.profiles set streak = 100 where id = $1`, [A])).toBe("42501");
  });
});

describe("ranking", () => {
  it("pokazuje wszystkich uczestników, także z zerem, posortowanych po rozwiązanych", async () => {
    const rows = await t.as<{ nick: string; solved: number; is_me: boolean }>("authenticated", C, `select * from public.leaderboard('week', 50)`);
    expect(rows.map((r) => r.nick)).toEqual(["Euklides", "Kasia", "Nowy"]);
    expect(rows.map((r) => Number(r.solved))).toEqual([2, 1, 0]);
    expect(rows.find((r) => r.nick === "Nowy")?.is_me).toBe(true);
  });

  it("ranking tygodniowy liczy tylko bieżący tydzień", async () => {
    await t.admin(`update public.answers set created_at = now() - interval '20 days' where user_id = $1`, [B]);
    const week = await t.as<{ nick: string; solved: number }>("anon", null, `select * from public.leaderboard('week', 50)`);
    const all = await t.as<{ nick: string; solved: number }>("anon", null, `select * from public.leaderboard('all', 50)`);
    expect(Number(week.find((r) => r.nick === "Kasia")?.solved)).toBe(0);
    expect(Number(all.find((r) => r.nick === "Kasia")?.solved)).toBe(1);
  });
});

describe("kopia postępu i arkusze – prywatne dane", () => {
  it("uczeń zapisuje i czyta tylko swoją kopię", async () => {
    await t.as("authenticated", A, `insert into public.user_progress (user_id, data) values ($1, '{"x": 1}')`, [A]);
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
});

describe("moderacja nicków", () => {
  it("odrzuca wulgaryzmy także w przebraniu (MA004)", async () => {
    const id = userId(10);
    await t.admin(`insert into auth.users (id) values ($1)`, [id]);
    for (const nick of ["kurwa", "K.U.R.W.A", "kuuurwa", "Fuck_you", "d1ck", "admin1"]) {
      expect(await t.errorCode("authenticated", id, `insert into public.profiles (id, nick) values ($1, $2)`, [id, nick]), nick).toBe("MA004");
    }
  });

  it("przepuszcza zwykłe nicki", async () => {
    const id = userId(11);
    await t.admin(`insert into auth.users (id) values ($1)`, [id]);
    await t.as("authenticated", id, `insert into public.profiles (id, nick) values ($1, 'Knight_2007')`, [id]);
    for (const nick of ["Analityk", "Principal", "Szmaragd", "Nazim", "Zośka"]) {
      expect(await t.errorCode("authenticated", id, `update public.profiles set nick = $2 where id = $1`, [id, nick]), nick).toBeNull();
    }
  });

  it("serwer i aplikacja podejmują tę samą decyzję dla każdego nicka", async () => {
    const nicks = ["kurwa", "K.U.R.W.A", "Ch_u_j", "kurw4", "Pierdolec", "Zjeb123", "Admin", "Principal", "Municipal", "Knight", "Szmaragd", "Żółć_1337", "Euklides", "dick_cipa"];
    for (const nick of nicks) {
      const [row] = await t.admin<{ allowed: boolean; normalized: string }>(`select public.nick_allowed($1) as allowed, public.normalize_nick($1) as normalized`, [nick]);
      expect(row, nick).toEqual({ allowed: isNickAllowed(nick), normalized: normalizeNick(nick) });
    }
  });

  it("nie da się zmienić nicku na niedozwolony", async () => {
    expect(await t.errorCode("authenticated", A, `update public.profiles set nick = 'chujek' where id = $1`, [A])).toBe("MA004");
  });

  it("migracja zamienia istniejące niedozwolone nicki na neutralne", async () => {
    const before = MIGRATIONS[MIGRATIONS.indexOf("20261101120000_moderation_account_deletion.sql") - 1];
    const old = await createTestDb(before);
    const id = userId(20);
    await old.createMember(id, "kutas13cm");
    await old.createMember(userId(21), "Kasia");
    await old.applyMigration("20261101120000_moderation_account_deletion.sql");
    const rows = await old.admin<{ nick: string }>(`select nick from public.profiles order by created_at`);
    expect(rows.map((r) => r.nick)).toEqual([`Uczen-${id.replace(/-/g, "").slice(0, 6)}`, "Kasia"]);
  });
});

describe("usunięcie konta", () => {
  it("kasuje konto i wszystkie dane ucznia – tylko jego", async () => {
    await t.as("authenticated", A, `select public.delete_my_account()`);
    const left = await t.admin<{ users: number; profiles: number; answers: number; progress: number; attempts: number }>(
      `select
        (select count(*)::int from auth.users where id = $1) as users,
        (select count(*)::int from public.profiles where id = $1) as profiles,
        (select count(*)::int from public.answers where user_id = $1) as answers,
        (select count(*)::int from public.user_progress where user_id = $1) as progress,
        (select count(*)::int from public.exam_attempts where user_id = $1) as attempts`,
      [A],
    );
    expect(left[0]).toEqual({ users: 0, profiles: 0, answers: 0, progress: 0, attempts: 0 });
    const others = await t.admin(`select 1 from public.profiles where id = $1`, [B]);
    expect(others).toHaveLength(1);
  });

  it("bez sesji nie da się nic usunąć", async () => {
    expect(await t.errorCode("anon", null, `select public.delete_my_account()`)).toBe("42501");
  });
});
