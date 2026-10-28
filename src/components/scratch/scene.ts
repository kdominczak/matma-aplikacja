import { interiorAngle, type AngleArms } from "@/lib/geometry/angle";
import type { Arm } from "@/lib/geometry/arms";
import { heightVertex } from "@/lib/geometry/marks";
import { isSolid, shapeCenter, shapeEdges, shapeVertices, vertexNeighbors } from "@/lib/geometry/shapes";
import { resolveRef, snapTargets, type PointRef, type SnapTarget } from "@/lib/geometry/snap";
import { midpoint, sub, type Vec } from "@/lib/geometry/vec";
import type { AngleItem, EdgeRef, LineItem, ScratchItem, ShapeItem } from "@/types/scratch";

// Scena brudnopisu: aktualne położenie elementów powiązanych z figurami (końce przypiętych linii,
// ramiona kątów). Bez canvasa i Reacta – korzystają z niej rysowanie, brudnopis i testy.

export interface Scene {
  shapes: ReadonlyMap<string, ShapeItem>;
  lines: ReadonlyMap<string, LineItem>;
}

export function buildScene(items: ScratchItem[], draft?: ShapeItem | null): Scene {
  const shapes = new Map<string, ShapeItem>();
  const lines = new Map<string, LineItem>();
  for (const item of items) {
    if (item.kind === "shape") shapes.set(item.id, item);
    if (item.kind === "line") lines.set(item.id, item);
  }
  if (draft) shapes.set(draft.id, draft);
  return { shapes, lines };
}

/** Końce linii: przypięte do figury – z jej bieżącego położenia, inaczej zapisane współrzędne. */
export function lineEnds(line: LineItem, scene: Scene): { from: Vec; to: Vec } {
  return {
    from: (line.fromRef && resolveRef(line.fromRef, scene.shapes)) || line.from,
    to: (line.toRef && resolveRef(line.toRef, scene.shapes)) || line.to,
  };
}

const sameVertex = (ref: PointRef | undefined, shapeId: string, vertex: number) => Boolean(ref && "vertex" in ref && ref.shapeId === shapeId && ref.vertex === vertex);

/** Ramiona w wierzchołku figury: krawędzie z niego wychodzące (boki, krawędzie bryły) i przypięte do niego linie. */
export function armsAt(shapeId: string, vertex: number, scene: Scene): Arm[] {
  const shape = scene.shapes.get(shapeId);
  if (!shape) return [];
  const vertices = shapeVertices(shape);
  const arms: Arm[] = vertexNeighbors(shape, vertex).map((n) => ({ id: `v:${n}`, point: vertices[n] }));
  for (const line of scene.lines.values()) {
    const ends = lineEnds(line, scene);
    if (sameVertex(line.fromRef, shapeId, vertex)) arms.push({ id: `l:${line.id}`, point: ends.to });
    else if (sameVertex(line.toRef, shapeId, vertex)) arms.push({ id: `l:${line.id}`, point: ends.from });
  }
  return arms;
}

/**
 * Ramiona kąta na kartce – z wierzchołka figury (wybrana para albo kąt wewnętrzny) lub z trzech punktów.
 * Null, gdy figury już nie ma. Gdy wybrane ramię zniknęło (usunięta linia) – wracamy do kąta wewnętrznego.
 */
export function angleArms(item: AngleItem, scene: Scene): AngleArms | null {
  if ("points" in item.anchor) {
    const [a, vertex, b] = item.anchor.points;
    return { vertex, a, b };
  }
  const { shapeId, vertex, arms } = item.anchor;
  const shape = scene.shapes.get(shapeId);
  if (!shape) return null;
  if (arms) {
    const available = armsAt(shapeId, vertex, scene);
    const a = available.find((arm) => arm.id === arms[0]);
    const b = available.find((arm) => arm.id === arms[1]);
    if (a && b) return { vertex: shapeVertices(shape)[vertex], a: a.point, b: b.point };
  }
  return interiorAngle(shape, vertex);
}

/** Punkty magnesu dla całej kartki (figury z podglądem + linie w bieżącym położeniu). */
export function sceneSnapTargets(scene: Scene, skipLine?: string): SnapTarget[] {
  const shapes = [...scene.shapes.values()];
  const segments = [...scene.lines.values()].filter((l) => l.id !== skipLine).map((l) => ({ id: l.id, ...lineEnds(l, scene) }));
  return snapTargets(shapes, segments);
}

/**
 * Usunięcie figury: znikają przypięte do niej kąty i oznaczenia boków, a przypięte linie zostają tam, gdzie były
 * (odpinamy je, zapisując bieżące współrzędne).
 */
export function removeShapeFrom(items: ScratchItem[], shapeId: string, scene: Scene): ScratchItem[] {
  return items.flatMap((item): ScratchItem[] => {
    if (item.id === shapeId) return [];
    if (item.kind === "angle" && "shapeId" in item.anchor && item.anchor.shapeId === shapeId) return [];
    if (item.kind === "mark" && "shapeId" in item.target && item.target.shapeId === shapeId) return [];
    if (item.kind === "line" && (item.fromRef?.shapeId === shapeId || item.toRef?.shapeId === shapeId)) {
      const ends = lineEnds(item, scene);
      return [
        {
          ...item,
          ...ends,
          fromRef: item.fromRef?.shapeId === shapeId ? undefined : item.fromRef,
          toRef: item.toRef?.shapeId === shapeId ? undefined : item.toRef,
        },
      ];
    }
    return [item];
  });
}

// ── Oznaczenia boków i wysokości ──

/** Odcinek oznaczanego boku w bieżącym położeniu i kierunek „na zewnątrz” (tam trafia podpis długości). */
export function edgeSegment(target: EdgeRef, scene: Scene): { a: Vec; b: Vec; outward: Vec } | null {
  let a: Vec;
  let b: Vec;
  let outward: Vec;
  if ("lineId" in target) {
    const line = scene.lines.get(target.lineId);
    if (!line) return null;
    ({ from: a, to: b } = lineEnds(line, scene));
    outward = [-(b[1] - a[1]), b[0] - a[0]]; // prostopadła do linii
  } else {
    const shape = scene.shapes.get(target.shapeId);
    const pair = shape && shapeEdges(shape)[target.edge];
    if (!shape || !pair) return null;
    const vertices = shapeVertices(shape);
    [a, b] = [vertices[pair[0]], vertices[pair[1]]];
    const center = isSolid(shape.shape) ? shape.center : shapeCenter(shape);
    outward = sub(midpoint(a, b), center);
  }
  const len = Math.hypot(outward[0], outward[1]) || 1;
  return { a, b, outward: [outward[0] / len, outward[1] / len] };
}

/** Wysokość opuszczona na bok wielokąta: z najdalszego wierzchołka do spodka prostopadłej (oba końce przypięte). */
export function heightLine(shapeId: string, edge: number, scene: Scene): Pick<LineItem, "from" | "to" | "fromRef" | "toRef"> | null {
  const shape = scene.shapes.get(shapeId);
  const vertex = shape ? heightVertex(shape, edge) : null;
  if (!shape || vertex === null) return null;
  const fromRef: PointRef = { shapeId, vertex };
  const toRef: PointRef = { shapeId, foot: [vertex, edge] };
  const from = resolveRef(fromRef, scene.shapes);
  const to = resolveRef(toRef, scene.shapes);
  return from && to ? { from, to, fromRef, toRef } : null;
}

/** Usunięcie linii razem z jej oznaczeniami. */
export function removeLineFrom(items: ScratchItem[], lineId: string): ScratchItem[] {
  return items.filter((i) => i.id !== lineId && !(i.kind === "mark" && "lineId" in i.target && i.target.lineId === lineId));
}

export function sameEdge(a: EdgeRef, b: EdgeRef): boolean {
  if ("lineId" in a || "lineId" in b) return "lineId" in a && "lineId" in b && a.lineId === b.lineId;
  return a.shapeId === b.shapeId && a.edge === b.edge;
}
