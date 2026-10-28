import { circleRadius, isSolid, shapeVertices, type ShapeGeometry } from "@/lib/geometry/shapes";
import { boxCorners } from "@/lib/geometry/transform";
import { distance, distanceToSegment, pointInPolygon, type Vec } from "@/lib/geometry/vec";

/**
 * Czy punkt trafia w figurę: wnętrze albo blisko obwodu (`tolerance` – dla palca, w jednostkach kartki).
 * Bryły – pudełko, w którym są narysowane.
 */
export function hitShape(g: ShapeGeometry, p: Vec, tolerance: number): boolean {
  if (g.shape === "circle") return distance(p, g.center) <= circleRadius(g) + tolerance;
  const outline = isSolid(g.shape) ? boxCorners(g) : shapeVertices(g);
  if (pointInPolygon(p, outline)) return true;
  return outline.some((a, i) => distanceToSegment(p, a, outline[(i + 1) % outline.length]) <= tolerance);
}

/** Indeks wierzchołka najbliżej punktu (w zasięgu `radius`) albo null. */
export function nearestVertex(g: ShapeGeometry, p: Vec, radius: number): number | null {
  let best: number | null = null;
  let bestDistance = radius;
  shapeVertices(g).forEach((v, index) => {
    const d = distance(v, p);
    if (d <= bestDistance) {
      best = index;
      bestDistance = d;
    }
  });
  return best;
}
