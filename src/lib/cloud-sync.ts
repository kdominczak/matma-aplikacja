import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { accountState, startAccount, subscribeAccount } from "@/lib/account";
import { clearAttempts, mergeAttempts, onAttemptSaved, readAttempts } from "@/lib/exam";
import { mergeRemoteProgress, onProgressSaved, readProgress } from "@/lib/progress";
import { supabase, SUPABASE_ENABLED } from "@/lib/supabase";
import type { ExamAttempt, ExamTaskResult } from "@/types/exam";

// Kopia w chmurze: postęp z urządzenia (tabela user_progress) i historia arkuszy (exam_attempts).
// Działa dla każdego konta – anonimowego (ranking) i z e-mailem; po zalogowaniu na nowym telefonie
// kopia SCALA się z tym, co jest na urządzeniu (progress-merge.ts), więc nic nie znika.
//
// Kolejność ma znaczenie: najpierw pobranie i scalenie, dopiero potem wysyłanie – inaczej świeży,
// pusty telefon nadpisałby kopię. Przed każdą wysyłką sprawdzamy, czy inne urządzenie nie zapisało
// w międzyczasie nowszej kopii (wtedy najpierw ją scalamy).

const PUSH_DELAY_MS = 4_000;
const LOCAL_SAVED_KEY = "cloud.localSavedAt";

export interface CloudStatus {
  state: "off" | "syncing" | "synced" | "pending" | "error";
  lastSyncAt: string | null;
}

let status: CloudStatus = { state: "off", lastSyncAt: null };
const listeners = new Set<() => void>();

function setStatus(patch: Partial<CloudStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

const OFF: CloudStatus = { state: "off", lastSyncAt: null };

export function useCloudStatus(): CloudStatus {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => OFF,
  );
}

// ── Stan synchronizacji dla bieżącego konta ──

let userId: string | null = null;
/** Konto, dla którego kopia została już pobrana i scalona – dopiero wtedy wolno wysyłać. */
let pulledFor: string | null = null;
/** updated_at kopii, którą ostatnio widzieliśmy albo zapisaliśmy. */
let remoteUpdatedAt: string | null = null;
let dirty = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

// wszystkie operacje po kolei – pobranie, scalenie i wysyłka nie mogą się przeplatać
let chain: Promise<unknown> = Promise.resolve();
function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job);
  chain = run.catch(() => {});
  return run;
}

async function localSavedAt(): Promise<string | null> {
  try {
    return (await Preferences.get({ key: LOCAL_SAVED_KEY })).value;
  } catch {
    return null;
  }
}

async function pullProgress(id: string): Promise<boolean> {
  const db = await supabase();
  if (!db) return false;
  const { data, error } = await db.from("user_progress").select("data, updated_at").eq("user_id", id).maybeSingle();
  if (error) throw error;
  if (!data) {
    dirty = true; // na koncie nie ma jeszcze kopii – wyślemy stan z urządzenia
    return true;
  }
  remoteUpdatedAt = data.updated_at as string;
  const local = await localSavedAt();
  const newer = local && local > remoteUpdatedAt ? "local" : "remote";
  await mergeRemoteProgress(data.data, newer);
  return true;
}

async function pushProgress(id: string) {
  const db = await supabase();
  if (!db || pulledFor !== id || !dirty) return;
  // inne urządzenie zapisało kopię po naszym ostatnim odczycie – najpierw ją scalamy
  const { data: head, error: headError } = await db.from("user_progress").select("updated_at").eq("user_id", id).maybeSingle();
  if (headError) throw headError;
  if (head && head.updated_at !== remoteUpdatedAt) await pullProgress(id);

  const progress = await readProgress();
  const { data, error } = await db
    .from("user_progress")
    .upsert({ user_id: id, data: progress, updated_at: new Date().toISOString() })
    .select("updated_at")
    .single();
  if (error) throw error;
  remoteUpdatedAt = data.updated_at as string;
  dirty = false;
}

function toAttempt(row: {
  id: string;
  exam_id: string;
  started_at: string;
  finished_at: string;
  duration_sec: number;
  points: number;
  max_points: number;
  answers: ExamTaskResult[];
}): ExamAttempt {
  return {
    id: row.id,
    examId: row.exam_id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationSec: row.duration_sec,
    points: row.points,
    maxPoints: row.max_points,
    percent: row.max_points ? Math.round((row.points / row.max_points) * 100) : 0,
    results: row.answers,
  };
}

async function syncAttempts(id: string) {
  const db = await supabase();
  if (!db) return;
  const { data, error } = await db
    .from("exam_attempts")
    .select("id, exam_id, started_at, finished_at, duration_sec, points, max_points, answers")
    .order("finished_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const remote = (data ?? []).map(toAttempt);
  await mergeAttempts(remote);

  const remoteIds = new Set(remote.map((a) => a.id));
  const missing = (await readAttempts()).filter((a) => !remoteIds.has(a.id));
  if (missing.length === 0) return;
  const { error: insertError } = await db.from("exam_attempts").upsert(
    missing.map((a) => ({
      id: a.id,
      user_id: id,
      exam_id: a.examId,
      started_at: a.startedAt,
      finished_at: a.finishedAt,
      duration_sec: a.durationSec,
      points: a.points,
      max_points: a.maxPoints,
      answers: a.results,
    })),
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (insertError) throw insertError;
}

/** Pełna synchronizacja: pobranie i scalenie kopii, wysłanie zmian i brakujących prób arkuszy. */
export function syncNow(): Promise<void> {
  return serial(async () => {
    const id = userId;
    if (!id) return;
    setStatus({ state: "syncing" });
    try {
      if (pulledFor !== id) {
        await pullProgress(id);
        pulledFor = id;
      }
      await pushProgress(id);
      await syncAttempts(id);
      if (userId === id) setStatus({ state: "synced", lastSyncAt: new Date().toISOString() });
    } catch (error) {
      console.warn("Synchronizacja z chmurą:", error);
      setStatus({ state: typeof navigator !== "undefined" && !navigator.onLine ? "pending" : "error" });
    }
  });
}

function schedulePush() {
  void Preferences.set({ key: LOCAL_SAVED_KEY, value: new Date().toISOString() }).catch(() => {});
  dirty = true;
  if (!userId) return;
  setStatus({ state: "pending" });
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void syncNow(), PUSH_DELAY_MS);
}

function onAccountChange() {
  const s = accountState();
  const id = s.status === "anonymous" || s.status === "email" ? s.userId : null;
  if (id === userId) return;
  userId = id;
  pulledFor = null;
  remoteUpdatedAt = null;
  if (id) void syncNow();
  else setStatus({ state: "off" });
}

/** Uruchamiane raz, w głównym layoucie. */
export function startCloudSync(): () => void {
  if (!SUPABASE_ENABLED) return () => {};
  const stopAccount = subscribeAccount(onAccountChange);
  const stopProgress = onProgressSaved(schedulePush);
  const stopAttempts = onAttemptSaved(() => void syncNow());
  const onOnline = () => void syncNow();
  const onVisibility = () => {
    // przy wyjściu z aplikacji wysyłamy od razu, po powrocie – sprawdzamy zmiany z innych urządzeń
    if (document.visibilityState === "hidden" && dirty) {
      clearTimeout(pushTimer);
      void syncNow();
    } else if (document.visibilityState === "visible" && userId) {
      pulledFor = null;
      void syncNow();
    }
  };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisibility);
  void startAccount().then(onAccountChange);
  return () => {
    stopAccount();
    stopProgress();
    stopAttempts();
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisibility);
    clearTimeout(pushTimer);
  };
}

/**
 * Reset postępów na koncie – wywoływany PRZED resetem na urządzeniu. Nadpisuje kopię pustym stanem
 * (bez scalania) i kasuje historię arkuszy; inaczej synchronizacja przywróciłaby stary postęp z chmury.
 * Rzuca błąd, gdy się nie uda (np. brak internetu) – wtedy nie resetujemy też urządzenia.
 */
export function resetCloudData(): Promise<void> {
  return serial(async () => {
    await startAccount();
    onAccountChange();
    const id = userId;
    const db = await supabase();
    if (db && id) {
      const { data, error } = await db
        .from("user_progress")
        .upsert({ user_id: id, data: {}, updated_at: new Date().toISOString() })
        .select("updated_at")
        .single();
      if (error) throw error;
      const { error: deleteError } = await db.from("exam_attempts").delete().eq("user_id", id);
      if (deleteError) throw deleteError;
      remoteUpdatedAt = data.updated_at as string;
      pulledFor = id;
      dirty = false;
    }
    await clearAttempts();
  });
}
