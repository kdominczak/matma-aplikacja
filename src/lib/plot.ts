import type { Point } from "@/types/plot";

/** Próbkuje funkcję do łamanej – dane wykresu zostają zwykłymi liczbami (serializowalne). */
export function sample(fn: (x: number) => number, from: number, to: number, steps = 60): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / steps;
    return [x, fn(x)];
  });
}
