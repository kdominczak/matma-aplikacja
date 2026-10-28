/** Polska odmiana po liczebniku: 1 zadanie, 2–4 zadania (ale 12–14 zadań), 5+ zadań. */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
