import type { Level } from "@/types/topic";

/**
 * Matura z matematyki 2027 (termin główny, godz. 9:00 czasu polskiego): podstawowa – 5 maja (komunikat dyrektora CKE
 * z 20 sierpnia 2026 r.), rozszerzona – 11 maja (wg harmonogramu podawanego przez serwisy edukacyjne – potwierdź na
 * cke.gov.pl). Przy kolejnym roczniku zaktualizuj obie daty.
 */
export const MATURA_DATE = new Date("2027-05-05T09:00:00+02:00");

export const MATURA_DATES: Record<Level, Date> = {
  podstawowy: MATURA_DATE,
  rozszerzony: new Date("2027-05-11T09:00:00+02:00"),
};

/** Pełne dni do matury (jak w pasku odliczania: 188 dni i 7 godzin → 188). */
export function daysToMatura(now: number, level: Level = "podstawowy"): number {
  return Math.max(0, Math.floor((MATURA_DATES[level].getTime() - now) / 86_400_000));
}
