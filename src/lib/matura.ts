/**
 * Matura z matematyki (poziom podstawowy) 2027: 5 maja, godz. 9:00 czasu polskiego.
 * Źródło: komunikat dyrektora CKE z 20 sierpnia 2026 r. – przy kolejnym roczniku zaktualizuj datę.
 */
export const MATURA_DATE = new Date("2027-05-05T09:00:00+02:00");

/** Pełne dni do matury (jak w pasku odliczania: 188 dni i 7 godzin → 188). */
export function daysToMatura(now: number): number {
  return Math.max(0, Math.floor((MATURA_DATE.getTime() - now) / 86_400_000));
}
