"use client";

import Icon, { type IconName } from "@/components/ui/Icon";
import { setTheme, useTheme, type ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "light", label: "Jasny", icon: "sun" },
  { value: "dark", label: "Ciemny", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

/** Miniatura motywu: tło, pasek i dwie „karty” w kolorach danego trybu. */
function Screen({ dark }: { dark: boolean }) {
  return (
    <span className={`flex h-full flex-1 flex-col gap-1 p-1.5 ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
      <span className={`h-1.5 w-2/3 rounded-full ${dark ? "bg-slate-600" : "bg-slate-300"}`} />
      <span className={`h-3 rounded ${dark ? "bg-slate-800" : "bg-white shadow-sm"}`} />
      <span className={`h-3 rounded ${dark ? "bg-slate-800" : "bg-white shadow-sm"}`} />
    </span>
  );
}

function ThemePreview({ value }: { value: ThemePreference }) {
  return (
    <span aria-hidden className="flex h-16 w-full overflow-hidden rounded-xl border border-line">
      {value !== "dark" && <Screen dark={false} />}
      {value !== "light" && <Screen dark />}
    </span>
  );
}

/** Przełącznik trzech trybów: kompaktowy (panel boczny) albo z podglądem (ustawienia). */
export function ThemeSwitcher({ preview = false }: { preview?: boolean }) {
  const { preference } = useTheme();
  if (preview) {
    return (
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Motyw">
        {OPTIONS.map((option) => {
          const selected = preference === option.value;
          return (
            <button
              key={option.value}
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(option.value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-2 text-sm font-bold transition-all active:scale-[0.97] ${
                selected ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-brand/40 hover:text-ink"
              }`}
            >
              <ThemePreview value={option.value} />
              <span className="flex items-center gap-1">
                <Icon name={option.icon} className="h-4 w-4" />
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
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
