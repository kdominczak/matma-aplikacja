"use client";

import { saveAppSettings, useAppSettings } from "@/lib/app-settings";
import { hapticTap } from "@/lib/haptics";
import { activeLevel, LEVEL_LABEL, studentLevels } from "@/lib/level";
import type { Progress } from "@/types/progress";
import type { Level } from "@/types/topic";

/** Aktywny poziom (przełącznik przy obu maturach) – wspólny dla ekranu głównego, planu i „Zadań”. */
export function useActiveLevel(progress: Progress | null): { level: Level; levels: Level[]; setLevel: (level: Level) => void } {
  const settings = useAppSettings();
  return {
    level: activeLevel(progress, settings),
    levels: studentLevels(progress),
    setLevel: (level) => void saveAppSettings({ activeLevel: level }),
  };
}

/**
 * Przełącznik Podstawa / Rozszerzenie: złoty „suwak” przesuwa się pod wybraną opcją. Bez drugiego poziomu – nic
 * (uczeń zdający tylko podstawę nie widzi elementu, który nic by nie zmieniał). `tone="dark"` – na grafitowej karcie.
 */
export default function LevelSwitch({ progress, tone = "light", className = "" }: { progress: Progress | null; tone?: "light" | "dark"; className?: string }) {
  const { level, levels, setLevel } = useActiveLevel(progress);
  if (levels.length < 2) return null;
  const index = levels.indexOf(level);
  const dark = tone === "dark";

  return (
    <div
      role="radiogroup"
      aria-label="Poziom matury"
      className={`relative grid grid-cols-2 rounded-2xl p-1 ${dark ? "bg-white/10" : "border border-line bg-card shadow-card"} ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl bg-brand shadow-float transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateX(${index * 100}%)` }}
      />
      {levels.map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={l === level}
          onClick={() => {
            if (l === level) return;
            hapticTap();
            setLevel(l);
          }}
          className={`relative z-10 min-h-10 rounded-xl px-4 text-sm font-bold transition-colors duration-300 ${
            l === level ? "text-on-brand" : dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink"
          }`}
        >
          {LEVEL_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
