import { cross, dot, sub, type Vec } from "@/lib/geometry/vec";

// Ramiona kąta w wierzchołku, z którego wychodzi więcej odcinków (boki figury + przekątne, wysokości…).
// Porządkujemy ramiona dookoła wierzchołka: sąsiednie ramiona wyznaczają „kliny” (najmniejsze kąty),
// a wszystkie pary – kolejne kąty do przełączania stuknięciem.

export interface Arm {
  /** Stałe odniesienie ramienia, np. "v:2" (sąsiedni wierzchołek figury) albo "l:<id linii>". */
  id: string;
  point: Vec;
}

const direction = (vertex: Vec, p: Vec) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0]);

/** Kąt między ramionami w radianach (0–π). */
function between(vertex: Vec, a: Vec, b: Vec): number {
  const u = sub(a, vertex);
  const v = sub(b, vertex);
  return Math.abs(Math.atan2(cross(u, v), dot(u, v)));
}

/** Ramiona bez duplikatów kierunku (dwa odcinki w tę samą stronę = jedno ramię), posortowane dookoła wierzchołka. */
export function sortArms(vertex: Vec, arms: Arm[]): Arm[] {
  const sorted = [...arms].sort((a, b) => direction(vertex, a.point) - direction(vertex, b.point));
  return sorted.filter((arm, i) => i === 0 || Math.abs(direction(vertex, arm.point) - direction(vertex, sorted[i - 1].point)) > 1e-6);
}

/** Wszystkie pary ramion – od najmniejszego kąta (kolejność przełączania stuknięciem). */
export function armPairs(vertex: Vec, arms: Arm[]): [Arm, Arm][] {
  const unique = sortArms(vertex, arms);
  const pairs: [Arm, Arm][] = [];
  for (let i = 0; i < unique.length; i++) for (let j = i + 1; j < unique.length; j++) pairs.push([unique[i], unique[j]]);
  return pairs.sort((p, q) => between(vertex, p[0].point, p[1].point) - between(vertex, q[0].point, q[1].point));
}

/**
 * Kąt, w który wskazuje przeciągnięcie od wierzchołka: spośród par ramion, między którymi leży kierunek palca
 * (po stronie mniejszej niż 180°), pierwszeństwo mają pary z linią narysowaną przez ucznia („l:…”) – po to ją
 * rysował – a potem ta, której dwusieczna jest najbliżej kierunku palca.
 * Sam „najmniejszy klin” nie wystarcza: w rzucie bryły między ramionami jednego kąta przestrzennego leży
 * czasem inna krawędź (np. AD między AO i AS w ostrosłupie). Null – kierunek poza figurą (kąt zewnętrzny).
 * Każdą parę (także pełny kąt mimo przekątnej) da się wybrać stuknięciem – `armPairs`.
 */
export function sectorFor(vertex: Vec, arms: Arm[], toward: Vec): [Arm, Arm] | null {
  const unique = sortArms(vertex, arms);
  const target = sub(toward, vertex);
  const unit = (p: Vec): Vec => {
    const d = sub(p, vertex);
    const len = Math.hypot(d[0], d[1]) || 1;
    return [d[0] / len, d[1] / len];
  };
  let best: [Arm, Arm] | null = null;
  let bestOff = Infinity;
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const [u, v] = [unit(unique[i].point), unit(unique[j].point)];
      // kierunek palca leży w kącie (mniejszym niż 180°) między ramionami, gdy jest po tej samej stronie każdego z nich
      const inside = cross(u, target) * cross(u, v) >= 0 && cross(v, target) * cross(v, u) >= 0 && dot(u, v) > -1 + 1e-9;
      if (!inside) continue;
      const bisector: Vec = [u[0] + v[0], u[1] + v[1]];
      const drawn = unique[i].id.startsWith("l:") || unique[j].id.startsWith("l:");
      const off = Math.abs(Math.atan2(cross(bisector, target), dot(bisector, target))) + (drawn ? 0 : Math.PI);
      if (off < bestOff) {
        best = [unique[i], unique[j]];
        bestOff = off;
      }
    }
  }
  return best;
}

/** Czy dwie pary to te same ramiona (kolejność bez znaczenia). */
export function samePair(p: [string, string], q: [string, string]): boolean {
  return (p[0] === q[0] && p[1] === q[1]) || (p[0] === q[1] && p[1] === q[0]);
}
