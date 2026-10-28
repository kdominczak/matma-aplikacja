// Losowanie z ziarnem – ten sam seed daje zawsze ten sam wynik (plan dnia, wyzwanie, arkusze, warianty zadań).

/** Generator liczb 0–1 z ziarnem (FNV-1a + mieszanie bitów). */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Wygodne losowanie dla szablonów zadań. */
export interface Rng {
  /** Liczba całkowita z przedziału [min, max]. */
  int(min: number, max: number): number;
  pick<T>(list: readonly T[]): T;
  shuffle<T>(list: readonly T[]): T[];
  /** Losowy znak: 1 albo -1. */
  sign(): 1 | -1;
}

export function createRng(seed: string): Rng {
  const random = seededRandom(seed);
  return {
    int: (min, max) => min + Math.floor(random() * (max - min + 1)),
    pick: (list) => list[Math.floor(random() * list.length)],
    shuffle: (list) => shuffled(list, random),
    sign: () => (random() < 0.5 ? 1 : -1),
  };
}
