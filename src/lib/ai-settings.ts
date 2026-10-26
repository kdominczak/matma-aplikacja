import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";

// Klucz Groq ucznia trzymamy wyłącznie na jego urządzeniu (Preferences: natywny storage / localStorage).
// Aplikacja nie ma serwera, więc nie ma też wspólnego klucza – każdy uczeń korzysta z własnego darmowego limitu.
const STORAGE_KEY = "ai.v1";

export const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", description: "Domyślny – dobry balans jakości i szybkości" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", description: "Najlepszy z matematyki, trochę wolniejszy" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", description: "Najszybszy, ale częściej się myli" },
] as const;

export const DEFAULT_MODEL = GROQ_MODELS[0].id;

export interface AiSettings {
  apiKey: string;
  model: string;
}

/**
 * Klucz z `.env.local` (NEXT_PUBLIC_GROQ_API_KEY) działa tylko w `npm run dev` – do testów dewelopera.
 * W buildzie produkcyjnym warunek jest stały (false) i kompilator usuwa klucz z paczki,
 * więc nie trafi do APK ani na stronę.
 */
function devKey(): string {
  if (process.env.NODE_ENV === "development") return process.env.NEXT_PUBLIC_GROQ_API_KEY ?? "";
  return "";
}

const EMPTY: AiSettings = { apiKey: "", model: DEFAULT_MODEL };

let current: AiSettings | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function load(): Promise<AiSettings> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  let saved: Partial<AiSettings> = {};
  try {
    saved = value ? JSON.parse(value) : {};
  } catch {
    // uszkodzony zapis – zaczynamy od zera
  }
  return { apiKey: saved.apiKey || devKey(), model: saved.model || DEFAULT_MODEL };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  loading ??= load().then((settings) => {
    current = settings;
    emit();
  });
  return () => listeners.delete(listener);
}

/** Ustawienia AI; `null` do czasu wczytania (także podczas prerenderu). */
export function useAiSettings(): AiSettings | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

/** Czy uczeń podłączył klucz Groq – od tego zależą przyciski AI w całej aplikacji. */
export function useAiReady(): boolean {
  return Boolean(useAiSettings()?.apiKey);
}

/** Aktualne ustawienia dla wywołań API (poza Reactem). */
export async function getAiSettings(): Promise<AiSettings> {
  return current ?? (current = await load());
}

export async function saveAiSettings(change: Partial<AiSettings>) {
  const next = { ...(current ?? EMPTY), ...change };
  current = next;
  emit();
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) });
}

export async function removeApiKey() {
  await saveAiSettings({ apiKey: "" });
}
