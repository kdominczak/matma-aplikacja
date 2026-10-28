import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { examMaxPoints } from "@/data/exams";
import type { PracticeTask } from "@/data/topics";
import { matchesAnswer } from "@/lib/calc";
import type { ExamAnswer, ExamAttempt, ExamSession, ExamSheet, ExamTaskResult } from "@/types/exam";

// Symulacja arkusza: punktacja, zapis rozwiązywanego arkusza (odświeżenie strony go nie przerywa)
// i historia prób na urządzeniu.

/** Próg zdania matury: 30% punktów. */
export const PASS_PERCENT = 30;

// ── Punktacja ──

/**
 * Zamknięte: 1 pkt za literę z klucza. Otwarte: komplet punktów za poprawny wynik końcowy
 * (sprawdzony jak w zakładce „Zadania”), 0 za błędny – aplikacja nie ocenia toku rozumowania.
 */
export function scoreTask(task: PracticeTask, answer: ExamAnswer | undefined, number: number): ExamTaskResult {
  const base = { taskId: task.id, number, kind: task.kind, maxPoints: task.points } as const;
  if (task.kind === "closed") {
    if (answer?.kind !== "closed") return { ...base, status: "skipped", points: 0 };
    const correct = answer.chosen === task.question.correct;
    return { ...base, status: correct ? "correct" : "wrong", points: correct ? 1 : 0, given: answer.chosen };
  }
  const input = answer?.kind === "open" ? answer.input.trim() : "";
  if (!input) return { ...base, status: "skipped", points: 0 };
  const correct = matchesAnswer(input, task.task.answers);
  return { ...base, status: correct ? "correct" : "wrong", points: correct ? task.points : 0, given: input };
}

export function isAnswered(answer: ExamAnswer | undefined): boolean {
  return answer?.kind === "closed" || (answer?.kind === "open" && answer.input.trim() !== "");
}

export function finishExam(exam: ExamSheet, session: ExamSession, now = Date.now()): ExamAttempt {
  const results = exam.tasks.map((task, i) => scoreTask(task, session.answers[task.id], i + 1));
  const points = results.reduce((sum, r) => sum + r.points, 0);
  const maxPoints = examMaxPoints(exam);
  return {
    id: crypto.randomUUID(),
    examId: exam.id,
    startedAt: new Date(session.startedAt).toISOString(),
    finishedAt: new Date(now).toISOString(),
    durationSec: Math.max(0, Math.round((now - session.startedAt) / 1000)),
    points,
    maxPoints,
    percent: maxPoints ? Math.round((points / maxPoints) * 100) : 0,
    results,
  };
}

/** „1 h 07 min”, „12 min 05 s”. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  return `${m} min ${String(s).padStart(2, "0")} s`;
}

// ── Rozwiązywany arkusz ──

const sessionKey = (examId: string) => `exam-session.${examId}`;

export async function loadSession(examId: string): Promise<ExamSession | null> {
  try {
    const { value } = await Preferences.get({ key: sessionKey(examId) });
    const parsed = value ? (JSON.parse(value) as ExamSession) : null;
    return parsed && parsed.examId === examId && typeof parsed.startedAt === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: ExamSession): Promise<void> {
  return Preferences.set({ key: sessionKey(session.examId), value: JSON.stringify(session) }).catch((error) => {
    console.warn("Nie udało się zapisać arkusza w toku:", error);
  });
}

export function clearSession(examId: string): Promise<void> {
  return Preferences.remove({ key: sessionKey(examId) }).catch(() => {});
}

// ── Historia prób ──

const ATTEMPTS_KEY = "exam-attempts.v1";
const MAX_ATTEMPTS = 50;

let attempts: ExamAttempt[] | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function ensureLoaded(): Promise<void> {
  loading ??= Preferences.get({ key: ATTEMPTS_KEY })
    .then(({ value }) => {
      const parsed = value ? JSON.parse(value) : [];
      attempts = Array.isArray(parsed) ? parsed : [];
    })
    .catch(() => {
      attempts = [];
    })
    .finally(emit);
  return loading;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void ensureLoaded();
  return () => listeners.delete(listener);
}

/** Wszystkie próby, najnowsze pierwsze; `null` do czasu wczytania. */
export function useExamAttempts(): ExamAttempt[] | null {
  return useSyncExternalStore(subscribe, () => attempts, () => null);
}

async function store(next: ExamAttempt[]) {
  attempts = [...next].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)).slice(0, MAX_ATTEMPTS);
  emit();
  await Preferences.set({ key: ATTEMPTS_KEY, value: JSON.stringify(attempts) }).catch((error) => {
    console.warn("Nie udało się zapisać wyników arkuszy:", error);
  });
}

const savedListeners = new Set<(attempt: ExamAttempt) => void>();

/** Wywoływane po zapisaniu nowej próby – do wysłania jej na konto (cloud-sync.ts). */
export function onAttemptSaved(listener: (attempt: ExamAttempt) => void): () => void {
  savedListeners.add(listener);
  return () => savedListeners.delete(listener);
}

export async function saveAttempt(attempt: ExamAttempt): Promise<void> {
  await ensureLoaded();
  await store([attempt, ...(attempts ?? []).filter((a) => a.id !== attempt.id)]);
  savedListeners.forEach((listener) => listener(attempt));
}

export async function readAttempts(): Promise<ExamAttempt[]> {
  await ensureLoaded();
  return attempts ?? [];
}

/** Dokłada próby z konta (np. z innego telefonu) do historii na urządzeniu. */
export async function mergeAttempts(remote: ExamAttempt[]): Promise<void> {
  await ensureLoaded();
  const known = new Set((attempts ?? []).map((a) => a.id));
  const added = remote.filter((a) => !known.has(a.id));
  if (added.length > 0) await store([...(attempts ?? []), ...added]);
}

/** Reset postępów: historia arkuszy i arkusze w toku znikają z urządzenia. */
export async function clearAttempts(): Promise<void> {
  await ensureLoaded();
  await store([]);
}

// ── Statystyki prób ──

export interface ExamStats {
  count: number;
  bestPercent: number;
  averagePercent: number;
  /** Łączny czas spędzony nad arkuszami (s). */
  totalSec: number;
}

export function examStats(list: ExamAttempt[]): ExamStats | null {
  if (list.length === 0) return null;
  return {
    count: list.length,
    bestPercent: Math.max(...list.map((a) => a.percent)),
    averagePercent: Math.round(list.reduce((sum, a) => sum + a.percent, 0) / list.length),
    totalSec: list.reduce((sum, a) => sum + a.durationSec, 0),
  };
}
