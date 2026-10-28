// Magnes, przecięcia, linie przypięte do figur i ramiona kąta (przekątne w wierzchołku).
import { describe, expect, it } from "vitest";
import { angleArms, armsAt, buildScene, lineEnds, removeShapeFrom, sceneSnapTargets } from "@/components/scratch/scene";
import { angleDegrees } from "@/lib/geometry/angle";
import { armPairs, sectorFor } from "@/lib/geometry/arms";
import { shapeVertices } from "@/lib/geometry/shapes";
import { nearestSnap, resolveRef, segmentIntersection, snapTargets } from "@/lib/geometry/snap";
import { moveShape, scaleShapeTo } from "@/lib/geometry/transform";
import type { Vec } from "@/lib/geometry/vec";
import type { AngleItem, LineItem, ShapeItem } from "@/types/scratch";

const square: ShapeItem = {
  id: "sq",
  kind: "shape",
  shape: "square",
  center: [0.5, 0.5],
  size: [0.2, 0.2],
  rotation: 0,
  color: "ink",
  width: 2,
  labels: ["A", "B", "C", "D"],
  showLabels: true,
};
const [A, B, C, D] = shapeVertices(square);
// przekątna AC przypięta do wierzchołków A i C
const diagonal: LineItem = { id: "ac", kind: "line", from: A, to: C, fromRef: { shapeId: "sq", vertex: 0 }, toRef: { shapeId: "sq", vertex: 2 }, color: "ink", width: 2 };

describe("magnes", () => {
  it("przecięcie przekątnych kwadratu to jego środek; równoległe i stykające się końcami – brak", () => {
    const p = segmentIntersection(A, C, B, D)!;
    expect(p[0]).toBeCloseTo(0.5, 9);
    expect(p[1]).toBeCloseTo(0.5, 9);
    expect(segmentIntersection(A, B, D, C)).toBeNull();
    expect(segmentIntersection(A, B, B, C)).toBeNull();
  });

  it("punkty kwadratu: środek, 4 wierzchołki, 4 środki boków", () => {
    const targets = snapTargets([square], []);
    expect(targets.filter((t) => t.kind === "vertex")).toHaveLength(4);
    expect(targets.filter((t) => t.kind === "midpoint")).toHaveLength(4);
    expect(targets.filter((t) => t.kind === "center")).toHaveLength(1);
  });

  it("dwie przekątne dają przecięcie w środku", () => {
    const targets = snapTargets([square], [
      { id: "1", from: A, to: C },
      { id: "2", from: B, to: D },
    ]);
    const crossing = targets.filter((t) => t.kind === "intersection");
    expect(crossing).toHaveLength(1);
    expect(crossing[0].point[0]).toBeCloseTo(0.5, 9);
  });

  it("wierzchołek wygrywa z odrobinę bliższym, ale mniej ważnym punktem; poza zasięgiem – nic", () => {
    const targets = [
      { point: [0, 0] as Vec, kind: "vertex" as const },
      { point: [0.012, 0] as Vec, kind: "midpoint" as const },
    ];
    expect(nearestSnap([0.009, 0], targets, 0.03)?.kind).toBe("vertex");
    expect(nearestSnap([0.2, 0.2], targets, 0.03)).toBeNull();
  });

  it("punkt przypięty do figury podąża za nią (wierzchołek, środek boku, środek)", () => {
    const moved = moveShape(square, [0.1, 0]);
    const shapes = new Map([["sq", moved]]);
    expect(resolveRef({ shapeId: "sq", vertex: 0 }, shapes)).toEqual(shapeVertices(moved)[0]);
    expect(resolveRef({ shapeId: "sq", center: true }, shapes)![0]).toBeCloseTo(0.6, 9);
    expect(resolveRef({ shapeId: "sq", edge: 0 }, shapes)![1]).toBeCloseTo(0.6, 9);
    expect(resolveRef({ shapeId: "brak", vertex: 0 }, shapes)).toBeNull();
  });
});

describe("linie przypięte do figur", () => {
  it("przekątna jedzie razem z przeskalowanym kwadratem", () => {
    const bigger = scaleShapeTo(square, [0.7, 0.7]);
    const ends = lineEnds(diagonal, buildScene([bigger, diagonal]));
    const [a, , c] = shapeVertices(bigger);
    expect(ends).toEqual({ from: a, to: c });
  });

  it("usunięcie figury: kąty przy niej znikają, linia zostaje w miejscu (odpięta)", () => {
    const angle: AngleItem = { id: "k", kind: "angle", anchor: { shapeId: "sq", vertex: 0 }, label: "α", color: "ink" };
    const items = [square, diagonal, angle];
    const after = removeShapeFrom(items, "sq", buildScene(items));
    expect(after.map((i) => i.id)).toEqual(["ac"]);
    const line = after[0] as LineItem;
    expect(line.fromRef).toBeUndefined();
    expect([line.from, line.to]).toEqual([A, C]);
  });

  it("magnes widzi końce i środek przypiętej linii w bieżącym położeniu", () => {
    const targets = sceneSnapTargets(buildScene([square, diagonal]));
    expect(targets.filter((t) => t.kind === "endpoint")).toHaveLength(2);
  });
});

describe("ramiona kąta", () => {
  const scene = buildScene([square, diagonal]);

  it("w wierzchołku A: dwa boki i przekątna – trzy ramiona, trzy pary od najmniejszego kąta", () => {
    const arms = armsAt("sq", 0, scene);
    expect(arms.map((a) => a.id).sort()).toEqual(["l:ac", "v:1", "v:3"]);
    const sizes = armPairs(A, arms).map(([a, b]) => Math.round(angleDegrees(A, a.point, b.point)));
    expect(sizes).toEqual([45, 45, 90]);
  });

  it("przeciągnięcie w głąb klina wybiera kąt między przekątną a bokiem", () => {
    const arms = armsAt("sq", 0, scene);
    // A to lewy dolny róg; tuż nad bokiem AB (w prawo, lekko w górę) – klin między AB a przekątną AC
    const toward: Vec = [A[0] + 0.1, A[1] - 0.02];
    const sector = sectorFor(A, arms, toward)!;
    expect(sector.map((a) => a.id).sort()).toEqual(["l:ac", "v:1"]);
    // na zewnątrz kwadratu – brak klina (kąt zewnętrzny nie jest rysowany)
    expect(sectorFor(A, arms, [A[0] - 0.1, A[1] + 0.1])).toBeNull();
  });

  it("kąt z wybranymi ramionami ma 45°, a po usunięciu przekątnej wraca do kąta wewnętrznego", () => {
    const angle: AngleItem = { id: "k", kind: "angle", anchor: { shapeId: "sq", vertex: 0, arms: ["v:1", "l:ac"] }, label: "α", color: "ink" };
    const arms = angleArms(angle, scene)!;
    expect(angleDegrees(arms.vertex, arms.a, arms.b)).toBeCloseTo(45, 6);
    const without = angleArms(angle, buildScene([square]))!;
    expect(angleDegrees(without.vertex, without.a, without.b)).toBeCloseTo(90, 6);
  });
});
