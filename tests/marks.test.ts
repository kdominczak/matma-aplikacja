// Oznaczenia: wysokości (spodek prostopadłej przypięty do boku), zapis długości w LaTeX, podpisy na zewnątrz boku
// i sprzątanie oznaczeń po usunięciu figury albo linii.
import { describe, expect, it } from "vitest";
import { buildScene, edgeSegment, heightLine, removeLineFrom, removeShapeFrom } from "@/components/scratch/scene";
import { footOfPerpendicular, heightVertex, labelToTex, onSegment } from "@/lib/geometry/marks";
import { SHAPES, shapeCenter, shapeEdges, shapeVertices, type ShapeKind } from "@/lib/geometry/shapes";
import { resolveRef } from "@/lib/geometry/snap";
import { rotateShape, scaleShapeTo } from "@/lib/geometry/transform";
import { dot, midpoint, sub, type Vec } from "@/lib/geometry/vec";
import type { LineItem, MarkItem, ShapeItem } from "@/types/scratch";

const shape = (kind: ShapeKind, id = "f"): ShapeItem => ({
  id,
  kind: "shape",
  shape: kind,
  center: [0.5, 0.5],
  size: SHAPES[kind].defaultSize,
  rotation: 0,
  color: "ink",
  width: 2,
  labels: [],
  showLabels: true,
});

describe("wysokość", () => {
  it("spodek prostopadłej i położenie na odcinku", () => {
    expect(footOfPerpendicular([1, 1], [0, 0], [2, 0])).toEqual([1, 0]);
    expect(onSegment([1, 0], [0, 0], [2, 0])).toBe(true);
    expect(onSegment([3, 0], [0, 0], [2, 0])).toBe(false);
  });

  it("z wierzchołka najdalszego od boku: w trójkącie przeciwległy, w trapezie z drugiej podstawy; koło i bryły – brak", () => {
    expect(heightVertex(shape("triangle"), 0)).toBe(2);
    expect([2, 3]).toContain(heightVertex(shape("trapezoid"), 0));
    expect(heightVertex(shape("circle"), 0)).toBeNull();
    expect(heightVertex(shape("pyramid"), 0)).toBeNull();
  });

  it("wysokość zostaje prostopadła do boku po obrocie i skalowaniu figury", () => {
    const base = shape("triangle");
    const line = heightLine("f", 0, buildScene([base]))!;
    for (const moved of [rotateShape(base, 30), scaleShapeTo(rotateShape(base, 75), [0.8, 0.9])]) {
      const shapes = new Map([["f", moved]]);
      const from = resolveRef(line.fromRef!, shapes)!;
      const foot = resolveRef(line.toRef!, shapes)!;
      const [a, b] = shapeEdges(moved)[0].map((i) => shapeVertices(moved)[i]);
      expect(dot(sub(from, foot), sub(b, a))).toBeCloseTo(0, 9);
    }
  });

  it("w trójkącie rozwartokątnym spodek wypada poza bok (rysujemy przedłużenie)", () => {
    // trójkąt z wierzchołkiem C nad przedłużeniem boku AB: wysokość z A na prostą BC
    const obtuse: ShapeItem = { ...shape("triangle"), size: [0.4, 0.1] };
    const vertices = shapeVertices(obtuse);
    const foot = footOfPerpendicular(vertices[0], vertices[1], vertices[2]);
    expect(onSegment(foot, vertices[1], vertices[2])).toBe(false);
  });
});

describe("zapis długości", () => {
  it.each([
    ["5", "5"],
    ["2√3", "2\\sqrt{3}"],
    ["√(a+b)", "\\sqrt{a+b}"],
    ["sqrt(5)", "\\sqrt{5}"],
    ["a/2", "\\frac{a}{2}"],
    ["3,5", "3{,}5"],
    ["2pi", "2\\pi"],
    ["2*a", "2\\cdot a"],
    ["\\frac{1}{2}", "frac{1}{2}"], // surowe komendy LaTeX z klawiatury są wycinane
  ])("„%s” → %s", (input, tex) => {
    expect(labelToTex(input)).toBe(tex);
  });
});

describe("oznaczenia boków", () => {
  it("podpis trafia na zewnątrz figury", () => {
    const sq = shape("square");
    const seg = edgeSegment({ shapeId: "f", edge: 0 }, buildScene([sq]))!;
    const out = sub(midpoint(seg.a, seg.b), shapeCenter(sq));
    expect(dot(seg.outward, out)).toBeGreaterThan(0);
    expect(Math.hypot(...seg.outward)).toBeCloseTo(1, 9);
  });

  it("krawędź bryły i narysowana linia też dają się oznaczyć", () => {
    const line: LineItem = { id: "l", kind: "line", from: [0.1, 0.1], to: [0.4, 0.1], color: "ink", width: 2 };
    const scene = buildScene([shape("cube", "c"), line]);
    expect(edgeSegment({ shapeId: "c", edge: 3 }, scene)).not.toBeNull();
    const seg = edgeSegment({ lineId: "l" }, scene)!;
    expect([seg.a, seg.b]).toEqual([[0.1, 0.1], [0.4, 0.1]] as Vec[]);
  });

  it("usunięcie figury albo linii zabiera ich oznaczenia", () => {
    const sq = shape("square");
    const line: LineItem = { id: "l", kind: "line", from: [0, 0], to: [0.2, 0], color: "ink", width: 2 };
    const onShape: MarkItem = { id: "m1", kind: "mark", target: { shapeId: "f", edge: 1 }, label: "a", ticks: 1, midpoint: false, color: "ink" };
    const onLine: MarkItem = { id: "m2", kind: "mark", target: { lineId: "l" }, label: "", ticks: 2, midpoint: true, color: "ink" };
    const items = [sq, line, onShape, onLine];
    expect(removeShapeFrom(items, "f", buildScene(items)).map((i) => i.id)).toEqual(["l", "m2"]);
    expect(removeLineFrom(items, "l").map((i) => i.id)).toEqual(["f", "m1"]);
  });
});
