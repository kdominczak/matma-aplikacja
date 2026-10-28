import { shapeVertices, vertexNeighbors, type ShapeGeometry } from "@/lib/geometry/shapes";
import { cross, dot, length, sub, toDeg, type Vec } from "@/lib/geometry/vec";

// Kąty: kąt wewnętrzny przy wierzchołku figury (ramiona = sąsiednie boki), miara i kąt prosty.

/** Tolerancja kąta prostego – rysujemy kwadracik zamiast łuku. */
export const RIGHT_ANGLE_TOLERANCE = 2;

export interface AngleArms {
  vertex: Vec;
  /** Punkty na ramionach (sąsiednie wierzchołki). */
  a: Vec;
  b: Vec;
}

/** Miara kąta AVB w stopniach (0–180). */
export function angleDegrees(vertex: Vec, a: Vec, b: Vec): number {
  const u = sub(a, vertex);
  const v = sub(b, vertex);
  const lengths = length(u) * length(v);
  if (lengths === 0) return 0;
  return toDeg(Math.acos(Math.max(-1, Math.min(1, dot(u, v) / lengths))));
}

export function isRightAngle(degrees: number, tolerance = RIGHT_ANGLE_TOLERANCE): boolean {
  return Math.abs(degrees - 90) <= tolerance;
}

/**
 * Kąt domyślny przy wierzchołku `index`: w wielokącie – kąt wewnętrzny (ramiona do poprzedniego i następnego
 * wierzchołka), w bryle – między dwiema pierwszymi krawędziami (kolejne pary przełącza się stuknięciem).
 */
export function interiorAngle(g: ShapeGeometry, index: number): AngleArms | null {
  const vertices = shapeVertices(g);
  const [a, b] = vertexNeighbors(g, index);
  if (index < 0 || index >= vertices.length || a === undefined || b === undefined) return null;
  return { vertex: vertices[index], a: vertices[a], b: vertices[b] };
}

/**
 * Łuk do narysowania: kąt początkowy i rozpiętość (zawsze mniejszy z dwóch kątów między ramionami,
 * więc w figurach wypukłych – kąt wewnętrzny). Kąty w radianach, jak w `CanvasRenderingContext2D.arc`.
 */
export function angleArc({ vertex, a, b }: AngleArms): { start: number; sweep: number } {
  const start = Math.atan2(a[1] - vertex[1], a[0] - vertex[0]);
  const u = sub(a, vertex);
  const v = sub(b, vertex);
  const sweep = Math.atan2(cross(u, v), dot(u, v));
  return { start, sweep };
}
