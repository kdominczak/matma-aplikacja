"use client";

import Icon, { type IconName } from "@/components/ui/Icon";
import { setTheme, useTheme, type ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "light", label: "Jasny", icon: "sun" },
  { value: "dark", label: "Ciemny", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** Przełącznik trzech trybów (do panelu bocznego i ustawień). */
export function ThemeSwitcher() {
  const { preference } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-subtle p-1" role="radiogroup" aria-label="Motyw">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          role="radio"
          aria-checked={preference === option.value}
          onClick={() => setTheme(option.value)}
          className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-bold transition-colors ${
            preference === option.value ? "bg-card text-ink shadow-card" : "text-muted hover:text-ink"
          }`}
        >
          <Icon name={option.icon} className="h-4 w-4" />
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Jedna ikona: przełącza jasny ↔ ciemny (do nagłówka na telefonie). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark } = useTheme();
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors hover:text-ink ${className}`}
    >
      <Icon name={isDark ? "sun" : "moon"} className="h-5 w-5" />
    </button>
  );
}
