import { isAuxVertex, isSolid, shapeCenter, shapeEdges, shapeVertices, type ShapeGeometry } from "@/lib/geometry/shapes";
import { footOfPerpendicular } from "@/lib/geometry/marks";
import { cross, distance, midpoint, sub, type Vec } from "@/lib/geometry/vec";

// Magnes: punkty, do których przyciągają się końce linii i punkty kątów – wierzchołki, końce odcinków,
// przecięcia, środki figur i środki boków. Punkt związany z figurą ma odniesienie (`ref`), dzięki któremu
// przypięta linia jedzie razem z figurą.

/**
 * Punkt figury, do którego można coś przypiąć: wierzchołek, środek boku, środek figury albo spodek
 * prostopadłej z wierzchołka na prostą boku (koniec wysokości – pilnuje prostopadłości przy obrocie i skalowaniu).
 */
export type PointRef =
  | { shapeId: string; vertex: number }
  | { shapeId: string; edge: number }
  | { shapeId: string; center: true }
  | { shapeId: string; foot: [vertex: number, edge: number] };

export type SnapKind = "vertex" | "endpoint" | "intersection" | "center" | "midpoint";

export interface SnapTarget {
  point: Vec;
  kind: SnapKind;
  ref?: PointRef;
}

/** Ważniejsze punkty wygrywają z bliższymi, ale mniej ważnymi (wierzchołek przed środkiem boku tuż obok). */
const PRIORITY: Record<SnapKind, number> = { vertex: 0, endpoint: 0, intersection: 1, center: 2, midpoint: 3 };

export const SNAP_LABELS: Record<SnapKind, string> = {
  vertex: "wierzchołek",
  endpoint: "koniec odcinka",
  intersection: "przecięcie",
  center: "środek",
  midpoint: "środek boku",
};

export interface SnapShape extends ShapeGeometry {
  id: string;
}

export interface SnapSegment {
  id: string;
  from: Vec;
  to: Vec;
}

/** Położenie punktu przypiętego do figury (null, gdy figury już nie ma albo nie ma takiego punktu). */
export function resolveRef(ref: PointRef, shapes: ReadonlyMap<string, ShapeGeometry>): Vec | null {
  const shape = shapes.get(ref.shapeId);
  if (!shape) return null;
  if ("center" in ref) return shape.shape === "circle" ? shape.center : shapeCenter(shape);
  const vertices = shapeVertices(shape);
  if ("vertex" in ref) return vertices[ref.vertex] ?? null;
  if ("foot" in ref) {
    const [vertex, edgeIndex] = ref.foot;
    const pair = shapeEdges(shape)[edgeIndex];
    return pair && vertices[vertex] ? footOfPerpendicular(vertices[vertex], vertices[pair[0]], vertices[pair[1]]) : null;
  }
  const edge = shapeEdges(shape)[ref.edge];
  return edge ? midpoint(vertices[edge[0]], vertices[edge[1]]) : null;
}

/** Punkt przecięcia odcinków AB i CD (bez samych końców – te łapie się jako wierzchołki). */
export function segmentIntersection(a: Vec, b: Vec, c: Vec, d: Vec): Vec | null {
  const r = sub(b, a);
  const s = sub(d, c);
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-12) return null; // równoległe
  const t = cross(sub(c, a), s) / denominator;
  const u = cross(sub(c, a), r) / denominator;
  const eps = 1e-6;
  if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return null;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}

/** Wszystkie punkty magnesu na kartce. */
export function snapTargets(shapes: SnapShape[], segments: SnapSegment[]): SnapTarget[] {
  const targets: SnapTarget[] = [];
  const edges: [Vec, Vec][] = [];

  for (const shape of shapes) {
    // bryły nie mają jednego „środka” – ich środki podstaw i spodek wysokości to punkty pomocnicze (niżej)
    if (!isSolid(shape.shape)) {
      targets.push({ point: shape.shape === "circle" ? shape.center : shapeCenter(shape), kind: "center", ref: { shapeId: shape.id, center: true } });
    }
    const vertices = shapeVertices(shape);
    vertices.forEach((point, vertex) =>
      targets.push({ point, kind: isAuxVertex(shape, vertex) ? "center" : "vertex", ref: { shapeId: shape.id, vertex } }),
    );
    shapeEdges(shape).forEach(([i, j], edge) => {
      targets.push({ point: midpoint(vertices[i], vertices[j]), kind: "midpoint", ref: { shapeId: shape.id, edge } });
      edges.push([vertices[i], vertices[j]]);
    });
  }
  for (const segment of segments) {
    targets.push({ point: segment.from, kind: "endpoint" }, { point: segment.to, kind: "endpoint" }, { point: midpoint(segment.from, segment.to), kind: "midpoint" });
    edges.push([segment.from, segment.to]);
  }
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const point = segmentIntersection(edges[i][0], edges[i][1], edges[j][0], edges[j][1]);
      if (point) targets.push({ point, kind: "intersection" });
    }
  }
  return targets;
}

/** Najlepszy punkt magnesu w zasięgu `radius` (ważność, potem odległość) albo null. */
export function nearestSnap(p: Vec, targets: SnapTarget[], radius: number): SnapTarget | null {
  let best: SnapTarget | null = null;
  let bestScore = Infinity;
  for (const target of targets) {
    const d = distance(p, target.point);
    if (d > radius) continue;
    // ważność przeważa: o jeden stopień ważniejszy punkt wygrywa, jeśli jest najwyżej o ~⅓ promienia dalej
    const score = d + PRIORITY[target.kind] * radius * 0.35;
    if (score < bestScore) {
      best = target;
      bestScore = score;
    }
  }
  return best;
}
