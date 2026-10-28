import { SOLID_MODELS, type SolidKind, type SolidModel } from "@/lib/geometry/solids";
import { add, centroid, mul, rotate, type Vec } from "@/lib/geometry/vec";

// Katalog figur brudnopisu. Każda figura płaska to wielokąt zapisany w układzie lokalnym: pudełko
// [-0,5; 0,5]² (oś y w dół), skalowane przez `size`, obracane o `rotation` i przesuwane do `center`.
// Wierzchołki nazywamy jak w podręczniku: A, B, C… przeciwnie do ruchu wskazówek zegara, od lewego dolnego.

export type PlaneShape =
  | "triangle"
  | "right-triangle"
  | "isosceles"
  | "equilateral"
  | "square"
  | "rectangle"
  | "parallelogram"
  | "rhombus"
  | "trapezoid"
  | "right-trapezoid"
  | "hexagon"
  | "circle";

/** Bryły w rzucie ukośnym (src/lib/geometry/solids.ts) – z wierzchołkami i krawędziami jak figury płaskie. */
export type SolidShape = SolidKind;

export type ShapeKind = PlaneShape | SolidShape;

export interface ShapeGeometry {
  shape: ShapeKind;
  center: Vec;
  /** Szerokość i wysokość pudełka figury (przed obrotem). */
  size: Vec;
  /** Obrót w stopniach (tylko figury płaskie). */
  rotation: number;
}

const SQRT3_2 = Math.sqrt(3) / 2;

/** Wielokąty w układzie lokalnym. Koło nie ma wierzchołków (ma środek). */
const POLYGONS: Record<Exclude<PlaneShape, "circle">, Vec[]> = {
  triangle: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.15, -0.5],
  ],
  "right-triangle": [
    [-0.5, 0.5],
    [0.5, 0.5],
    [-0.5, -0.5],
  ],
  isosceles: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0, -0.5],
  ],
  equilateral: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0, -0.5],
  ],
  square: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
  ],
  rectangle: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.5, -0.5],
    [-0.5, -0.5],
  ],
  parallelogram: [
    [-0.5, 0.5],
    [0.25, 0.5],
    [0.5, -0.5],
    [-0.25, -0.5],
  ],
  rhombus: [
    [0, 0.5],
    [0.5, 0],
    [0, -0.5],
    [-0.5, 0],
  ],
  trapezoid: [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.25, -0.5],
    [-0.25, -0.5],
  ],
  "right-trapezoid": [
    [-0.5, 0.5],
    [0.5, 0.5],
    [0.1, -0.5],
    [-0.5, -0.5],
  ],
  // sześciokąt foremny „na płasko”: kąty 120°, 60°, 0°, −60°, −120°, 180° (od lewego dolnego, przeciwnie do wskazówek).
  // Wypełnia pudełko: x = ½·cos, y = sin/√3 (±½); przy proporcji wysokość/szerokość = √3/2 jest foremny.
  hexagon: [120, 60, 0, -60, -120, 180].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [0.5 * Math.cos(r), Math.sin(r) / Math.sqrt(3)] as Vec;
  }),
};

export interface ShapeInfo {
  label: string;
  /** Stały stosunek wysokości do szerokości (figury foremne) – skalowanie go zachowuje. */
  aspect?: number;
  /** Domyślny rozmiar w jednostkach kartki (1 = szerokość kartki). */
  defaultSize: Vec;
  solid?: boolean;
}

export const SHAPES: Record<ShapeKind, ShapeInfo> = {
  triangle: { label: "Trójkąt", defaultSize: [0.32, 0.24] },
  "right-triangle": { label: "Trójkąt prostokątny", defaultSize: [0.3, 0.24] },
  isosceles: { label: "Trójkąt równoramienny", defaultSize: [0.3, 0.26] },
  equilateral: { label: "Trójkąt równoboczny", aspect: SQRT3_2, defaultSize: [0.3, 0.3 * SQRT3_2] },
  square: { label: "Kwadrat", aspect: 1, defaultSize: [0.24, 0.24] },
  rectangle: { label: "Prostokąt", defaultSize: [0.34, 0.2] },
  parallelogram: { label: "Równoległobok", defaultSize: [0.36, 0.2] },
  rhombus: { label: "Romb", defaultSize: [0.3, 0.22] },
  trapezoid: { label: "Trapez", defaultSize: [0.36, 0.2] },
  "right-trapezoid": { label: "Trapez prostokątny", defaultSize: [0.34, 0.2] },
  hexagon: { label: "Sześciokąt foremny", aspect: SQRT3_2, defaultSize: [0.3, 0.3 * SQRT3_2] },
  circle: { label: "Koło / okrąg", aspect: 1, defaultSize: [0.26, 0.26] },
  cube: { label: "Sześcian", solid: true, aspect: SOLID_MODELS.cube.aspect, defaultSize: [0.3, 0.3 * SOLID_MODELS.cube.aspect!] },
  prism: { label: "Prostopadłościan", solid: true, defaultSize: [0.34, 0.3] },
  "tri-prism": { label: "Graniastosłup trójkątny", solid: true, defaultSize: [0.3, 0.34] },
  "hex-prism": { label: "Graniastosłup sześciokątny", solid: true, defaultSize: [0.32, 0.34] },
  "tri-pyramid": { label: "Ostrosłup trójkątny", solid: true, defaultSize: [0.3, 0.32] },
  pyramid: { label: "Ostrosłup czworokątny", solid: true, defaultSize: [0.3, 0.32] },
  cylinder: { label: "Walec", solid: true, defaultSize: [0.26, 0.32] },
  cone: { label: "Stożek", solid: true, defaultSize: [0.28, 0.32] },
  sphere: { label: "Kula", solid: true, aspect: 1, defaultSize: [0.28, 0.28] },
};

/** Model bryły (punkty w pudełku, krawędzie z widocznością, elipsy) albo null dla figur płaskich. */
export function solidModel(shape: ShapeKind): SolidModel | null {
  return isSolid(shape) ? SOLID_MODELS[shape] : null;
}

export const PLANE_SHAPES = (Object.keys(SHAPES) as ShapeKind[]).filter((k) => !SHAPES[k].solid) as PlaneShape[];
export const SOLID_SHAPES = (Object.keys(SHAPES) as ShapeKind[]).filter((k) => SHAPES[k].solid) as SolidShape[];

export function isSolid(shape: ShapeKind): shape is SolidShape {
  return Boolean(SHAPES[shape].solid);
}

/** Punkt z układu lokalnego figury (pudełko [-0,5; 0,5]²) na kartkę. */
export function toWorld(g: ShapeGeometry, local: Vec): Vec {
  return add(g.center, rotate(mul(local, g.size), isSolid(g.shape) ? 0 : g.rotation));
}

/** Wierzchołki figury na kartce: wielokąta albo bryły (z punktami pomocniczymi, np. spodkiem wysokości); koło – brak. */
export function shapeVertices(g: ShapeGeometry): Vec[] {
  if (g.shape === "circle") return [];
  if (isSolid(g.shape)) return SOLID_MODELS[g.shape].points.map((p) => toWorld(g, p));
  return POLYGONS[g.shape].map((p) => toWorld(g, p));
}

/** Krawędzie jako pary indeksów wierzchołków: obwód wielokąta albo krawędzie bryły (także niewidoczne). */
export function shapeEdges(g: ShapeGeometry): [number, number][] {
  if (isSolid(g.shape)) return SOLID_MODELS[g.shape].edges.map((e) => [e.a, e.b] as [number, number]);
  const n = shapeVertices(g).length;
  return Array.from({ length: n }, (_, i) => [i, (i + 1) % n] as [number, number]);
}

/**
 * Sąsiedzi wierzchołka (końce krawędzi wychodzących z niego). W wielokącie – poprzedni i następny,
 * w bryle – wszystkie krawędzie (np. w wierzchołku podstawy ostrosłupa: dwie krawędzie podstawy i boczna).
 */
export function vertexNeighbors(g: ShapeGeometry, index: number): number[] {
  if (!isSolid(g.shape)) {
    const n = shapeVertices(g).length;
    return n < 3 ? [] : [(index - 1 + n) % n, (index + 1) % n];
  }
  return shapeEdges(g).flatMap(([a, b]) => (a === index ? [b] : b === index ? [a] : []));
}

/** Punkt pomocniczy bryły (środek podstawy, spodek wysokości) – dla magnesu „środek”, nie „wierzchołek”. */
export function isAuxVertex(g: ShapeGeometry, index: number): boolean {
  return isSolid(g.shape) && SOLID_MODELS[g.shape].aux.includes(index);
}

/** Środek figury (dla koła – środek okręgu, dla wielokąta – środek ciężkości wierzchołków). */
export function shapeCenter(g: ShapeGeometry): Vec {
  const vertices = shapeVertices(g);
  return vertices.length > 0 ? centroid(vertices) : g.center;
}

export function circleRadius(g: ShapeGeometry): number {
  return g.size[0] / 2;
}

/** Domyślne nazwy: A, B, C… (koło – środek S; bryły – jak w arkuszach: ABCD, EFGH, wierzchołek S, spodek O). */
export function defaultLabels(shape: ShapeKind): string[] {
  if (shape === "circle") return ["S"];
  if (isSolid(shape)) return SOLID_MODELS[shape].names;
  return POLYGONS[shape].map((_, i) => String.fromCharCode(65 + i));
}

/** Kolejne litery dla nowej figury – bez powtórek nazw już użytych na kartce (A, B, C → D, E, F). */
export function freshLabels(shape: ShapeKind, used: ReadonlySet<string>): string[] {
  const count = defaultLabels(shape).length;
  if (shape === "circle") return [used.has("S") ? nextFree("O", used) : "S"];
  if (isSolid(shape)) return solidLabels(shape, used);
  const out: string[] = [];
  for (let code = 65; out.length < count && code < 91; code++) {
    const letter = String.fromCharCode(code);
    if (letter !== "S" && !used.has(letter)) out.push(letter);
  }
  // gdy zabraknie liter – z indeksem (A₁, B₁…)
  for (let i = 0; out.length < count; i++) out.push(`${String.fromCharCode(65 + (i % 26))}₁`);
  return out;
}

/** Bryła: nazwy z arkuszy (S, O, ABCD…), a zajęte – z indeksem (A₁, S₁…), żeby nie mylić z inną figurą. */
function solidLabels(shape: SolidShape, used: ReadonlySet<string>): string[] {
  const taken = new Set(used);
  return SOLID_MODELS[shape].names.map((name) => {
    let label = name;
    for (let i = 1; taken.has(label); i++) label = `${name.replace(/₁$/, "")}${"₀₁₂₃₄₅₆₇₈₉"[Math.min(i, 9)]}`;
    taken.add(label);
    return label;
  });
}

function nextFree(base: string, used: ReadonlySet<string>): string {
  if (!used.has(base)) return base;
  for (let i = 1; ; i++) if (!used.has(`${base}${i}`)) return `${base}${i}`;
}

/** Obrys figury w układzie lokalnym (pudełko [-0,5; 0,5]²) – do miniaturek w wyborze figur. Koło i bryły: null. */
export function shapeOutline(shape: ShapeKind): Vec[] | null {
  if (shape === "circle" || isSolid(shape)) return null;
  return POLYGONS[shape];
}
