// Wektory na płaszczyźnie kartki brudnopisu. Oś y w dół (jak na ekranie).

export type Vec = [number, number];

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
export const mul = (a: Vec, b: Vec): Vec => [a[0] * b[0], a[1] * b[1]];
export const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
export const cross = (a: Vec, b: Vec) => a[0] * b[1] - a[1] * b[0];
export const length = (a: Vec) => Math.hypot(a[0], a[1]);
export const distance = (a: Vec, b: Vec) => length(sub(a, b));
export const midpoint = (a: Vec, b: Vec): Vec => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Obrót wektora o `deg` stopni (zgodnie z ruchem wskazówek zegara na ekranie, bo y rośnie w dół). */
export function rotate(a: Vec, deg: number): Vec {
  const r = toRad(deg);
  const [c, s] = [Math.cos(r), Math.sin(r)];
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
}

export function centroid(points: Vec[]): Vec {
  const sum = points.reduce((acc, p) => add(acc, p), [0, 0] as Vec);
  return scale(sum, 1 / Math.max(1, points.length));
}

/** Odległość punktu od odcinka AB. */
export function distanceToSegment(p: Vec, a: Vec, b: Vec): number {
  const ab = sub(b, a);
  const len2 = dot(ab, ab);
  if (len2 === 0) return distance(p, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / len2));
  return distance(p, add(a, scale(ab, t)));
}

/** Czy punkt leży w wielokącie (reguła parzystości przecięć). */
export function pointInPolygon(p: Vec, polygon: Vec[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
