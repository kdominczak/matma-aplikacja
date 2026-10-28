import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";
import { dayKey } from "@/lib/stats";

// Czas nauki: liczymy sekundy, gdy aplikacja jest na ekranie, a uczeń coś robi.
// Po 2 minutach bez dotyku/klawiatury/przewijania przestajemy liczyć (telefon odłożony na biurko).
// Zapis na urządzeniu, dzień po dniu – trzymamy ostatnie dwa tygodnie.

const STORAGE_KEY = "study-time.v1";
const TICK_MS = 5_000;
const IDLE_MS = 2 * 60_000;
const SAVE_EVERY_MS = 30_000;
const KEEP_DAYS = 14;

type Log = Record<string, number>;

let log: Log = {};
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): Promise<void> {
  loading ??= Preferences.get({ key: STORAGE_KEY }).then(({ value }) => {
    try {
      // sekundy naliczone przed wczytaniem dokładamy do zapisanych
      const saved: Log = value ? JSON.parse(value) : {};
      for (const [day, seconds] of Object.entries(log)) saved[day] = (saved[day] ?? 0) + seconds;
      log = saved;
    } catch {
      // uszkodzony zapis – liczymy od nowa
    }
    loaded = true;
    emit();
  });
  return loading;
}

async function save() {
  await load();
  const days = Object.keys(log).sort().slice(-KEEP_DAYS);
  log = Object.fromEntries(days.map((d) => [d, log[d]]));
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(log) });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => listeners.delete(listener);
}

/** Minuty nauki dzisiaj; `null` do czasu wczytania (także podczas prerenderu). */
export function useStudyMinutesToday(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => (loaded ? Math.floor((log[dayKey()] ?? 0) / 60) : null),
    () => null,
  );
}

/** Uruchamia licznik (raz, w głównym layoucie). Zwraca funkcję sprzątającą. */
export function startStudyTimer(): () => void {
  let lastInput = Date.now();
  let lastTick = Date.now();
  let lastSave = Date.now();

  const onInput = () => {
    lastInput = Date.now();
  };
  const tick = () => {
    const now = Date.now();
    const elapsed = Math.min(now - lastTick, TICK_MS * 2);
    lastTick = now;
    if (document.visibilityState !== "visible" || now - lastInput > IDLE_MS) return;
    const day = dayKey();
    log[day] = (log[day] ?? 0) + elapsed / 1000;
    emit();
    if (now - lastSave >= SAVE_EVERY_MS) {
      lastSave = now;
      void save();
    }
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") void save();
    else lastInput = lastTick = Date.now();
  };

  const events = ["pointerdown", "keydown", "wheel", "touchmove", "scroll"] as const;
  events.forEach((e) => window.addEventListener(e, onInput, { passive: true, capture: true }));
  document.addEventListener("visibilitychange", onVisibility);
  const timer = window.setInterval(tick, TICK_MS);
  void load();

  return () => {
    window.clearInterval(timer);
    events.forEach((e) => window.removeEventListener(e, onInput, { capture: true }));
    document.removeEventListener("visibilitychange", onVisibility);
    void save();
  };
}
