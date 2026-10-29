// Synchronizacja kopii postępu: konflikt wersji (MA020) → pobranie, scalenie, ponowny zapis – nic nie przepada.
// Atrapa Supabase odtwarza save_progress() z migracji 20261105120000 (zapis tylko przy zgodnym updated_at).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-000000000001";

// startCloudSync nasłuchuje „online” i zmiany widoczności – w testach (node) wystarczy EventTarget
const windowEvents = new EventTarget();
vi.stubGlobal("addEventListener", windowEvents.addEventListener.bind(windowEvents));
vi.stubGlobal("removeEventListener", windowEvents.removeEventListener.bind(windowEvents));
vi.stubGlobal("document", Object.assign(new EventTarget(), { visibilityState: "visible" }));

type Row = { data: Record<string, number>; updated_at: string };
const server = { row: null as Row | null, clock: 0, conflicts: 0 };
/** Zapisy „innego urządzenia” wykonywane tuż przed kolejnymi naszymi zapisami. */
let interleave: (() => void)[] = [];
let local: Record<string, number> = {};
let progressSaved: (() => void) | null = null;

const stamp = () => new Date(Date.UTC(2026, 9, 29, 12, 0, 0, ++server.clock)).toISOString();
const otherDeviceSaves = (data: Record<string, number>) => () => (server.row = { data, updated_at: stamp() });

const db = {
  auth: { getSession: async () => ({ data: { session: { user: { id: USER } } } }) },
  from(table: string) {
    if (table === "user_progress") {
      return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: server.row, error: null }) }) }) };
    }
    // exam_attempts – pusta historia arkuszy
    return { select: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }), delete: () => ({ eq: async () => ({ error: null }) }) };
  },
  async rpc(name: string, args: { p_data: Record<string, number>; p_expected: string | null; p_force?: boolean }) {
    if (name !== "save_progress") throw new Error(name);
    interleave.shift()?.();
    if (!args.p_force && (server.row?.updated_at ?? null) !== args.p_expected) {
      server.conflicts++;
      return { data: null, error: { code: "MA020", message: "conflict" } };
    }
    server.row = { data: args.p_data, updated_at: stamp() };
    return { data: server.row.updated_at, error: null };
  },
};

vi.mock("@/lib/supabase", () => ({ SUPABASE_ENABLED: true, supabase: async () => db }));
vi.mock("@/lib/account", () => ({
  accountState: () => ({ status: "email", userId: USER, email: "uczen@example.com" }),
  subscribeAccount: () => () => {},
  startAccount: async () => {},
}));
vi.mock("@/lib/exam", () => ({
  clearAttempts: async () => {},
  mergeAttempts: async () => {},
  onAttemptSaved: () => () => {},
  readAttempts: async () => [],
}));
vi.mock("@/lib/progress", () => ({
  onProgressSaved: (listener: () => void) => {
    progressSaved = listener;
    return () => {};
  },
  readProgress: async () => local,
  // scalanie jak w progress-merge: nic nie ginie (tu – suma kluczy)
  mergeRemoteProgress: async (data: Record<string, number>) => {
    local = { ...data, ...local };
    return true;
  },
}));

let sync: typeof import("@/lib/cloud-sync");
let stop = () => {};

beforeEach(async () => {
  vi.resetModules(); // świeży stan modułu (konto, ostatnio widziana wersja) w każdym teście
  sync = await import("@/lib/cloud-sync");
  server.row = { data: { a: 1 }, updated_at: stamp() };
  server.conflicts = 0;
  interleave = [];
  local = { mine: 1 };
  stop = sync.startCloudSync();
  await sync.syncNow(); // pierwsze pobranie i scalenie
});

afterEach(() => stop());

/** Zmiana postępu na tym telefonie i wysyłka (bez czekania 4 s na zaplanowaną). */
async function changeAndPush(change: Record<string, number>) {
  local = { ...local, ...change };
  progressSaved?.();
  await sync.syncNow();
}

describe("synchronizacja kopii postępu", () => {
  it("bez konfliktu – jeden zapis z ostatnio widzianą wersją", async () => {
    await changeAndPush({ mine: 2 });
    expect(server.conflicts).toBe(0);
    expect(server.row?.data).toEqual({ a: 1, mine: 2 });
  });

  it("drugie urządzenie zapisuje w trakcie – konflikt, scalenie jego zmian, ponowny zapis; nic nie ginie", async () => {
    interleave = [otherDeviceSaves({ a: 1, other: 5 })];
    await changeAndPush({ mine: 2 });
    expect(server.conflicts).toBe(1);
    expect(server.row?.data).toEqual({ a: 1, other: 5, mine: 2 });
  });

  it("ciągłe konflikty – po 3 próbach rezygnujemy i niczego nie nadpisujemy", async () => {
    interleave = [1, 2, 3].map((n) => otherDeviceSaves({ other: n }));
    await changeAndPush({ mine: 3 });
    expect(server.conflicts).toBe(3);
    expect(server.row?.data).toEqual({ other: 3 });
  });

  it("reset nadpisuje kopię bez względu na wersję", async () => {
    otherDeviceSaves({ other: 1 })();
    await sync.resetCloudData();
    expect(server.row?.data).toEqual({});
  });
});
