import { useSyncExternalStore } from "react";
import { DARK_QUERY, THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/theme-script";

export type ThemePreference = "light" | "dark" | "system";

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function apply(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && matchMedia(DARK_QUERY).matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function setTheme(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // brak dostępu do storage (tryb prywatny) – motyw działa do końca sesji
  }
  apply(preference);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // przy „systemowym” motywie reagujemy na zmianę ustawień telefonu
  const media = matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (readPreference() === "system") {
      apply("system");
      listener();
    }
  };
  media.addEventListener("change", onSystemChange);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as const);
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  return { preference, isDark };
}
