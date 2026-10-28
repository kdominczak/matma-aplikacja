import { useCallback, useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { SCRATCH_VERSION, type ScratchItem } from "@/types/scratch";

// Notatki z brudnopisu zapamiętane przy zadaniu – po wyjściu z zadania albo arkusza i powrocie są na miejscu.
// Jeden zapis na urządzeniu z ostatnimi zadaniami (najstarsze wypadają), zapisywany z opóźnieniem,
// bo podczas rysowania notatki zmieniają się wiele razy na sekundę.

const STORAGE_KEY = "scratch.v2";
const MAX_TASKS = 40;
/** Rysunki odręczne potrafią być duże – powyżej tego rozmiaru usuwamy najstarsze notatki. */
const MAX_CHARS = 1_500_000;
const SAVE_DELAY_MS = 600;

interface Saved {
  v: typeof SCRATCH_VERSION;
  tasks: Record<string, { at: number; items: ScratchItem[] }>;
}

const EMPTY_ITEMS: ScratchItem[] = [];
let state: Saved = { v: SCRATCH_VERSION, tasks: {} };
let loading: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): Promise<void> {
  loading ??= Preferences.get({ key: STORAGE_KEY })
    .then(({ value }) => {
      const saved = value ? (JSON.parse(value) as Saved) : null;
      // inna wersja formatu – zaczynamy od czystych kartek (migracje dopiszemy przy kolejnej zmianie formatu)
      if (saved?.v === SCRATCH_VERSION && saved.tasks && typeof saved.tasks === "object") {
        state = { v: SCRATCH_VERSION, tasks: { ...saved.tasks, ...state.tasks } };
        emit();
      }
    })
    .catch(() => {
      // uszkodzony zapis – brudnopis działa dalej, notatki zaczną się od nowa
    });
  return loading;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => listeners.delete(listener);
}

/** Ostatnie zadania; gdy zapis jest za duży – kolejne najstarsze wypadają. */
function trimmed(saved: Saved): Saved {
  const entries = Object.entries(saved.tasks)
    .filter(([, t]) => t.items.length > 0)
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_TASKS);
  while (entries.length > 1 && JSON.stringify(entries).length > MAX_CHARS) entries.pop();
  return { v: SCRATCH_VERSION, tasks: Object.fromEntries(entries) };
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    // zapis zawsze po wczytaniu – inaczej pierwsza kreska nadpisałaby notatki innych zadań
    void load().then(() => {
      state = trimmed(state);
      return Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) });
    }).catch(() => {});
  }, SAVE_DELAY_MS);
}

export function setScratchNotes(taskId: string, items: ScratchItem[]) {
  state = { ...state, tasks: { ...state.tasks, [taskId]: { at: Date.now(), items } } };
  emit();
  scheduleSave();
}

/** Czyści notatki wskazanych zadań (np. przy ponownym podejściu do testu). */
export function clearScratchNotes(taskIds: string[]) {
  const tasks = { ...state.tasks };
  for (const id of taskIds) delete tasks[id];
  state = { ...state, tasks };
  emit();
  scheduleSave();
}

/** Notatki zadania i funkcja zapisu – jak `useState`, ale zapamiętane na urządzeniu. */
export function useScratchNotes(taskId: string): [ScratchItem[], (items: ScratchItem[]) => void] {
  const items = useSyncExternalStore(
    subscribe,
    () => state.tasks[taskId]?.items ?? EMPTY_ITEMS,
    () => EMPTY_ITEMS,
  );
  const save = useCallback((next: ScratchItem[]) => setScratchNotes(taskId, next), [taskId]);
  return [items, save];
}

/** Nowy identyfikator elementu brudnopisu. */
export function scratchId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 12);
}
