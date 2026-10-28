import type { Vec } from "@/lib/geometry/vec";

// Bryły w rzucie ukośnym (jak w podręcznikach i arkuszach CKE): oś głębokości w prawo-w górę pod 45°,
// skrócona o połowę. Wielościany opisujemy w 3D (wierzchołki + ściany); krawędź jest niewidoczna (przerywana),
// gdy żadna z jej ścian nie jest zwrócona do patrzącego – liczymy to, zamiast wpisywać ręcznie.
// Wynik to model 2D w pudełku [-0,5; 0,5]² (oś y w dół), skalowany jak figury płaskie.

type Vec3 = [number, number, number];

export interface SolidEdge {
  a: number;
  b: number;
  hidden: boolean;
}

/** Elipsa podstawy bryły obrotowej (w pudełku): tylna połowa przerywana, chyba że `full`. */
export interface SolidEllipse {
  center: Vec;
  rx: number;
  ry: number;
  /** Cała ciągła (np. górna podstawa walca, obrys kuli). */
  full?: boolean;
}

export interface SolidModel {
  points: Vec[];
  names: string[];
  edges: SolidEdge[];
  /** Punkty pomocnicze (środki podstaw, spodek wysokości) – magnes traktuje je jak „środek”. */
  aux: number[];
  ellipses: SolidEllipse[];
  /** Proporcja wysokość/szerokość pudełka, przy której bryła wygląda „prawidłowo” (sześcian, kula). */
  aspect?: number;
}

/** Rzut ukośny gabinetowy: głębokość × ½ pod kątem 45°. */
const DEPTH = 0.5 * Math.SQRT1_2;
const project = ([x, y, z]: Vec3): Vec => [x + DEPTH * z, -(y + DEPTH * z)];

interface Polyhedron {
  points: Vec3[];
  names: string[];
  faces: number[][];
  /** Dodatkowe punkty (np. spodek wysokości) i krawędzie pomocnicze (np. wysokość – zawsze przerywana). */
  aux?: { point: Vec3; name: string; joins?: number[] }[];
  lockAspect?: boolean;
}

const sub3 = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mean3 = (ps: Vec3[]): Vec3 => {
  const s = ps.reduce<Vec3>((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
  return [s[0] / ps.length, s[1] / ps.length, s[2] / ps.length];
};

/** Kierunek do patrzącego: punkty p i p + t·(−DEPTH, −DEPTH, 1) mają ten sam rzut, patrzymy „od przodu”. */
const TOWARD_VIEWER: Vec3 = [DEPTH, DEPTH, -1];

/** Pudełko obejmujące punkty → [-0,5; 0,5]² (bryła wypełnia pudełko figury). */
function fitToBox(points: Vec[]): { points: Vec[]; aspect: number } {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  return { points: points.map(([x, y]) => [(x - minX) / w - 0.5, (y - minY) / h - 0.5] as Vec), aspect: h / w };
}

function polyhedron(def: Polyhedron): SolidModel {
  const center = mean3(def.points);
  const front = def.faces.map((face) => {
    const ps = face.map((i) => def.points[i]);
    let normal = cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0]));
    if (dot3(normal, sub3(mean3(ps), center)) < 0) normal = [-normal[0], -normal[1], -normal[2]]; // na zewnątrz
    return dot3(normal, TOWARD_VIEWER) > 1e-9;
  });
  const edges = new Map<string, SolidEdge>();
  def.faces.forEach((face, f) =>
    face.forEach((a, k) => {
      const b = face[(k + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const edge = edges.get(key) ?? { a: Math.min(a, b), b: Math.max(a, b), hidden: true };
      if (front[f]) edge.hidden = false;
      edges.set(key, edge);
    }),
  );

  const all3 = [...def.points, ...(def.aux ?? []).map((x) => x.point)];
  const { points, aspect } = fitToBox(all3.map(project));
  const aux = (def.aux ?? []).map((_, i) => def.points.length + i);
  const auxEdges = (def.aux ?? []).flatMap((x, i) => (x.joins ?? []).map((j) => ({ a: def.points.length + i, b: j, hidden: true })));
  return {
    points,
    names: [...def.names, ...(def.aux ?? []).map((x) => x.name)],
    edges: [...edges.values(), ...auxEdges],
    aux,
    ellipses: [],
    aspect: def.lockAspect ? aspect : undefined,
  };
}

/** Prostopadłościan a × h × d: podstawa ABCD (A z przodu po lewej), górna podstawa EFGH nad nią. */
function box(a: number, h: number, d: number, lockAspect = false): SolidModel {
  return polyhedron({
    points: [
      [0, 0, 0],
      [a, 0, 0],
      [a, 0, d],
      [0, 0, d],
      [0, h, 0],
      [a, h, 0],
      [a, h, d],
      [0, h, d],
    ],
    names: ["A", "B", "C", "D", "E", "F", "G", "H"],
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [1, 2, 6, 5],
      [2, 3, 7, 6],
      [3, 0, 4, 7],
    ],
    lockAspect,
  });
}

/** Graniastosłup o podstawie-wielokącie (w płaszczyźnie podstawy, przeciwnie do wskazówek patrząc z góry). */
function prism(base: [number, number][], h: number, names: string[]): SolidModel {
  const n = base.length;
  const bottom: Vec3[] = base.map(([x, z]) => [x, 0, z]);
  const top: Vec3[] = base.map(([x, z]) => [x, h, z]);
  return polyhedron({
    points: [...bottom, ...top],
    names,
    faces: [
      bottom.map((_, i) => i),
      top.map((_, i) => n + i),
      ...base.map((_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]),
    ],
  });
}

/** Ostrosłup prawidłowy: podstawa + wierzchołek S nad środkiem; spodek wysokości O z przerywaną wysokością SO. */
function pyramid(base: [number, number][], h: number, names: string[]): SolidModel {
  const n = base.length;
  const bottom: Vec3[] = base.map(([x, z]) => [x, 0, z]);
  const foot = mean3(bottom);
  const apex: Vec3 = [foot[0], h, foot[2]];
  return polyhedron({
    points: [...bottom, apex],
    names: [...names, "S"],
    faces: [bottom.map((_, i) => i), ...base.map((_, i) => [i, (i + 1) % n, n])],
    aux: [{ point: foot, name: "O", joins: [n] }],
  });
}

const regular = (n: number, r: number, phase: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const t = phase + (i * 2 * Math.PI) / n;
    return [r * Math.cos(t), r * Math.sin(t)] as [number, number];
  });

// ── Bryły obrotowe – opisane od razu w pudełku (elipsy podstaw w rzucie) ──

const ELLIPSE_RY = 0.12;

function cone(): SolidModel {
  const by = 0.5 - ELLIPSE_RY;
  return {
    points: [
      [0, -0.5],
      [-0.5, by],
      [0.5, by],
      [0, by],
    ],
    names: ["S", "A", "B", "O"],
    edges: [
      { a: 0, b: 1, hidden: false },
      { a: 0, b: 2, hidden: false },
      { a: 0, b: 3, hidden: true },
      { a: 3, b: 2, hidden: true },
    ],
    aux: [3],
    ellipses: [{ center: [0, by], rx: 0.5, ry: ELLIPSE_RY }],
  };
}

function cylinder(): SolidModel {
  const top = -0.5 + ELLIPSE_RY;
  const bottom = 0.5 - ELLIPSE_RY;
  return {
    points: [
      [-0.5, bottom],
      [0.5, bottom],
      [0.5, top],
      [-0.5, top],
      [0, bottom],
      [0, top],
    ],
    names: ["A", "B", "C", "D", "O", "O₁"],
    edges: [
      { a: 0, b: 3, hidden: false },
      { a: 1, b: 2, hidden: false },
      { a: 4, b: 5, hidden: true },
      { a: 4, b: 1, hidden: true },
    ],
    aux: [4, 5],
    ellipses: [
      { center: [0, top], rx: 0.5, ry: ELLIPSE_RY, full: true },
      { center: [0, bottom], rx: 0.5, ry: ELLIPSE_RY },
    ],
  };
}

function sphere(): SolidModel {
  return {
    points: [
      [0, 0],
      [0.5, 0],
    ],
    names: ["O", "A"],
    edges: [{ a: 0, b: 1, hidden: true }],
    aux: [0],
    ellipses: [
      { center: [0, 0], rx: 0.5, ry: 0.5, full: true },
      { center: [0, 0], rx: 0.5, ry: 0.15 },
    ],
    aspect: 1,
  };
}

const HEX_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const SOLID_MODELS = {
  cube: box(1, 1, 1, true),
  prism: box(1.4, 1, 1),
  "tri-prism": prism(
    [
      [0, 0],
      [1, 0],
      [0.5, 0.85],
    ],
    1.2,
    ["A", "B", "C", "D", "E", "F"],
  ),
  // sześciokąt: A z przodu po lewej, dalej przeciwnie do wskazówek patrząc z góry
  "hex-prism": prism(regular(6, 0.5, -2 * Math.PI / 3), 1.1, HEX_NAMES),
  "tri-pyramid": pyramid(
    [
      [0, 0],
      [1, 0],
      [0.45, 0.85],
    ],
    1.1,
    ["A", "B", "C"],
  ),
  pyramid: pyramid(
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    1.2,
    ["A", "B", "C", "D"],
  ),
  cylinder: cylinder(),
  cone: cone(),
  sphere: sphere(),
} satisfies Record<string, SolidModel>;

export type SolidKind = keyof typeof SOLID_MODELS;
