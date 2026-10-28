import { useSyncExternalStore } from "react";
import { Preferences } from "@capacitor/preferences";

// Ustawienia aplikacji i wygląd profilu – zapisane na urządzeniu (Preferences).
// Zdjęcie profilowe trzymamy tu zawsze (działa bez rankingu); uczniowie w rankingu wgrywają je też do Supabase.

export const AVATAR_COLORS = {
  brand: "from-brand to-violet-500",
  sunset: "from-orange-400 to-rose-500",
  mint: "from-emerald-400 to-teal-600",
  ocean: "from-sky-400 to-blue-600",
  candy: "from-pink-400 to-fuchsia-600",
  gold: "from-amber-300 to-orange-500",
} as const;

export type AvatarColor = keyof typeof AVATAR_COLORS;

export interface AppSettings {
  /** Imię do powitania na ekranie głównym (tylko na urządzeniu). */
  name: string;
  /** Zdjęcie profilowe jako data URL (JPEG 256×256). */
  avatar: string | null;
  avatarColor: AvatarColor;
  haptics: boolean;
  /** Ciche dźwięki przy wyborze odpowiedzi. */
  sounds: boolean;
  confetti: boolean;
}

const STORAGE_KEY = "settings.v1";
const DEFAULTS: AppSettings = { name: "", avatar: null, avatarColor: "brand", haptics: true, sounds: true, confetti: true };

let current: AppSettings = DEFAULTS;
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function load(): Promise<void> {
  loading ??= Preferences.get({ key: STORAGE_KEY }).then(({ value }) => {
    try {
      current = { ...DEFAULTS, ...(value ? JSON.parse(value) : {}) };
    } catch {
      current = DEFAULTS;
    }
    loaded = true;
    emit();
  });
  return loading;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  void load();
  return () => listeners.delete(listener);
}

/** Ustawienia; `null` do czasu wczytania (także podczas prerenderu). */
export function useAppSettings(): AppSettings | null {
  return useSyncExternalStore(subscribe, () => (loaded ? current : null), () => null);
}

/** Bieżące ustawienia poza Reactem (np. haptyka). Przed wczytaniem – domyślne. */
export function appSettings(): AppSettings {
  if (!loaded) void load();
  return current;
}

export async function saveAppSettings(change: Partial<AppSettings>) {
  await load();
  current = { ...current, ...change };
  emit();
  await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(current) });
}

// ── Zdjęcie profilowe ──

const AVATAR_SIZE = 256;

/** Kadruje zdjęcie do kwadratu ze środka i zmniejsza do 256×256 (JPEG ~20–40 KB). */
export async function prepareAvatar(file: File): Promise<{ dataUrl: string; blob: Blob }> {
  if (!file.type.startsWith("image/")) throw new Error("Wybierz plik ze zdjęciem.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Nie udało się wczytać zdjęcia."));
      img.src = url;
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Nie udało się przetworzyć zdjęcia."))), "image/jpeg", 0.85),
    );
    return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), blob };
  } finally {
    URL.revokeObjectURL(url);
  }
}
