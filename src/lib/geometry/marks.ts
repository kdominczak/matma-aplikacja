import { isSolid, shapeEdges, shapeVertices, type ShapeGeometry } from "@/lib/geometry/shapes";
import { add, distance, dot, scale, sub, type Vec } from "@/lib/geometry/vec";

// Oznaczenia na rysunku: spodek wysokości, wierzchołek, z którego ją prowadzimy, i zapis długości boku.

/** Rzut prostopadły punktu P na prostą AB (może wypaść poza odcinek – np. w trójkącie rozwartokątnym). */
export function footOfPerpendicular(p: Vec, a: Vec, b: Vec): Vec {
  const ab = sub(b, a);
  const len2 = dot(ab, ab);
  if (len2 === 0) return a;
  return add(a, scale(ab, dot(sub(p, a), ab) / len2));
}

/** Czy punkt leży na odcinku AB (z tolerancją) – inaczej rysujemy przerywane przedłużenie boku. */
export function onSegment(p: Vec, a: Vec, b: Vec, eps = 1e-6): boolean {
  return Math.abs(distance(a, p) + distance(p, b) - distance(a, b)) <= eps;
}

/**
 * Wierzchołek, z którego prowadzimy wysokość na bok `edge` wielokąta: najdalszy od prostej tego boku
 * (w trójkącie – przeciwległy, w trapezie – z drugiej podstawy). Null dla koła i brył.
 */
export function heightVertex(g: ShapeGeometry, edge: number): number | null {
  if (g.shape === "circle" || isSolid(g.shape)) return null;
  const vertices = shapeVertices(g);
  const pair = shapeEdges(g)[edge];
  if (!pair) return null;
  const [a, b] = [vertices[pair[0]], vertices[pair[1]]];
  let best: number | null = null;
  let bestDistance = 1e-9;
  vertices.forEach((v, i) => {
    if (i === pair[0] || i === pair[1]) return;
    const d = distance(v, footOfPerpendicular(v, a, b));
    if (d > bestDistance + 1e-9) {
      best = i;
      bestDistance = d;
    }
  });
  return best;
}

/**
 * Zapis długości wpisany przez ucznia → LaTeX: „2√3” → 2\sqrt{3}, „sqrt(5)” → \sqrt{5}, „a/2” → \frac{a}{2},
 * „3,5” → 3{,}5, „pi”/„π” → \pi, „*” → \cdot.
 */
export function labelToTex(input: string): string {
  let tex = input.trim().slice(0, 24);
  tex = tex.replace(/\\/g, ""); // bez surowych komend LaTeX z klawiatury
  tex = tex.replace(/sqrt\s*\(([^)]*)\)/gi, "\\sqrt{$1}");
  tex = tex.replace(/√\s*\(([^)]*)\)/g, "\\sqrt{$1}");
  tex = tex.replace(/√\s*([0-9]+(?:[.,][0-9]+)?|[a-zA-Z])/g, "\\sqrt{$1}");
  tex = tex.replace(/(?<![a-z])pi(?![a-z])|π/gi, "\\pi "); // także „2pi”, ale nie „pi” w środku słowa
  tex = tex.replace(/([0-9a-zA-Z}]+)\s*\/\s*([0-9a-zA-Z]+)/g, "\\frac{$1}{$2}");
  tex = tex.replace(/\*/g, "\\cdot ");
  tex = tex.replace(/(\d),(\d)/g, "$1{,}$2");
  return tex.trim();
}
