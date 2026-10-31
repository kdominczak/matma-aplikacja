import type { AppSettings } from "@/lib/app-settings";
import type { Progress } from "@/types/progress";
import type { Level } from "@/types/topic";

// Poziom matury ucznia: podstawowa (obowiązkowa), rozszerzona albo obie. Wybór zapisujemy w postępie (`levels`,
// synchronizowany z kontem), a który poziom pokazuje ekran główny przy obu – w ustawieniach urządzenia (`activeLevel`).

export const LEVELS: Level[] = ["podstawowy", "rozszerzony"];

export const LEVEL_LABEL: Record<Level, string> = { podstawowy: "Podstawa", rozszerzony: "Rozszerzenie" };
export const LEVEL_LONG: Record<Level, string> = { podstawowy: "Matura podstawowa", rozszerzony: "Matura rozszerzona" };

/** Poziomy, które zdaje uczeń (starsze zapisy bez wyboru – tylko podstawowa). */
export function studentLevels(progress: Pick<Progress, "levels"> | null): Level[] {
  const levels = (progress?.levels ?? []).filter((l): l is Level => LEVELS.includes(l));
  return levels.length > 0 ? LEVELS.filter((l) => levels.includes(l)) : ["podstawowy"];
}

/** Poziom pokazywany teraz: wybrany przełącznikiem, o ile uczeń go zdaje – inaczej pierwszy ze zdawanych. */
export function activeLevel(progress: Pick<Progress, "levels"> | null, settings: Pick<AppSettings, "activeLevel"> | null): Level {
  const levels = studentLevels(progress);
  return settings && levels.includes(settings.activeLevel) ? settings.activeLevel : levels[0];
}

/** Cel ucznia (procent) na danym poziomie. */
export function levelTarget(progress: Pick<Progress, "target" | "targetExtended">, level: Level): number {
  return level === "rozszerzony" ? (progress.targetExtended ?? 30) : progress.target;
}
