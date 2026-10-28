// Bryły w rzucie ukośnym: krawędzie niewidoczne (liczone ze ścian), nazwy jak w arkuszach, wierzchołki dla
// magnesu i kąty w przestrzeni – np. kąt nachylenia krawędzi bocznej do podstawy.
import { describe, expect, it } from "vitest";
import { angleArms, armsAt, buildScene } from "@/components/scratch/scene";
import { angleDegrees, interiorAngle } from "@/lib/geometry/angle";
import { armPairs, sectorFor } from "@/lib/geometry/arms";
import { defaultLabels, freshLabels, SHAPES, SOLID_SHAPES, shapeVertices, vertexNeighbors, type ShapeGeometry } from "@/lib/geometry/shapes";
import { snapTargets } from "@/lib/geometry/snap";
import { SOLID_MODELS } from "@/lib/geometry/solids";
import { scaleShapeTo } from "@/lib/geometry/transform";
import { distance } from "@/lib/geometry/vec";
import type { AngleItem, LineItem, ShapeItem } from "@/types/scratch";

const hidden = (kind: keyof typeof SOLID_MODELS) => {
  const m = SOLID_MODELS[kind];
  return m.edges
    .filter((e) => e.hidden)
    .map((e) => [m.names[e.a], m.names[e.b]].sort().join(""))
    .sort();
};

const solid = (kind: ShapeItem["shape"], id = "s"): ShapeItem => ({
  id,
  kind: "shape",
  shape: kind,
  center: [0.5, 0.5],
  size: SHAPES[kind].defaultSize,
  rotation: 0,
  color: "ink",
  width: 2,
  labels: defaultLabels(kind),
  showLabels: true,
});

describe("modele brył", () => {
  it.each(Object.keys(SOLID_MODELS) as (keyof typeof SOLID_MODELS)[])("%s: spójny model (nazwy, krawędzie bez powtórzeń, punkty w pudełku)", (kind) => {
    const m = SOLID_MODELS[kind];
    expect(m.names).toHaveLength(m.points.length);
    const keys = m.edges.map((e) => `${Math.min(e.a, e.b)}-${Math.max(e.a, e.b)}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const e of m.edges) expect(e.a !== e.b && e.a < m.points.length && e.b < m.points.length).toBe(true);
    for (const [x, y] of m.points) {
      expect(Math.abs(x)).toBeLessThanOrEqual(0.5 + 1e-9);
      expect(Math.abs(y)).toBeLessThanOrEqual(0.5 + 1e-9);
    }
  });

  it("krawędzie niewidoczne jak w podręczniku (liczone ze ścian zwróconych do patrzącego)", () => {
    expect(hidden("cube")).toEqual(["AD", "CD", "DH"]);
    expect(hidden("prism")).toEqual(["AD", "CD", "DH"]);
    expect(hidden("tri-prism")).toEqual(["AC", "BC", "CF"]);
    expect(hidden("pyramid")).toEqual(["AD", "CD", "DS", "OS"]);
    expect(hidden("tri-pyramid")).toEqual(["AC", "BC", "CS", "OS"]);
    expect(hidden("hex-prism")).toEqual(["CD", "DE", "DJ", "EF", "EK"]);
    expect(hidden("cone")).toEqual(["BO", "OS"]);
  });

  it("liczba krawędzi wielościanów zgadza się ze wzorem Eulera (W − K + S = 2)", () => {
    expect(SOLID_MODELS.cube.edges).toHaveLength(12);
    expect(SOLID_MODELS["hex-prism"].edges).toHaveLength(18);
    // ostrosłup: 8 krawędzi + wysokość SO (pomocnicza)
    expect(SOLID_MODELS.pyramid.edges).toHaveLength(9);
  });

  it("sześcian: ściana przednia jest kwadratem przy domyślnych proporcjach", () => {
    const [a, b, , , e] = shapeVertices(solid("cube"));
    expect(distance(a, b)).toBeCloseTo(distance(a, e), 9);
  });

  it("w katalogu wszystkie dziewięć brył", () => {
    expect(SOLID_SHAPES).toHaveLength(9);
  });
});

describe("nazwy wierzchołków brył", () => {
  it("jak w arkuszach: ostrosłup ABCDS ze spodkiem O, sześcian ABCDEFGH", () => {
    expect(defaultLabels("pyramid")).toEqual(["A", "B", "C", "D", "S", "O"]);
    expect(defaultLabels("cube")).toEqual(["A", "B", "C", "D", "E", "F", "G", "H"]);
  });

  it("druga bryła na kartce dostaje indeksy (A₁, S₁…), żeby nie mylić z pierwszą", () => {
    const labels = freshLabels("pyramid", new Set(defaultLabels("pyramid")));
    expect(labels).toEqual(["A₁", "B₁", "C₁", "D₁", "S₁", "O₁"]);
  });
});

describe("magnes i kąty w bryłach", () => {
  it("magnes łapie wierzchołki bryły, środki krawędzi i spodek wysokości (jako „środek”)", () => {
    const targets = snapTargets([solid("pyramid")], []);
    expect(targets.filter((t) => t.kind === "vertex")).toHaveLength(5);
    expect(targets.filter((t) => t.kind === "center")).toHaveLength(1);
    expect(targets.filter((t) => t.kind === "midpoint")).toHaveLength(9);
  });

  it("w wierzchołku podstawy ostrosłupa wychodzą trzy krawędzie: dwie podstawy i boczna", () => {
    const g: ShapeGeometry = solid("pyramid");
    expect(vertexNeighbors(g, 0).map((i) => defaultLabels("pyramid")[i]).sort()).toEqual(["B", "D", "S"]);
  });

  it("stożek: kąt domyślny w wierzchołku S to kąt rozwarcia (między tworzącymi)", () => {
    const arms = interiorAngle(solid("cone"), 0)!;
    const [s, a, b] = shapeVertices(solid("cone"));
    expect([arms.vertex, arms.a, arms.b]).toEqual([s, a, b]);
  });

  it("kąt nachylenia krawędzi bocznej do podstawy: linia AO + krawędź AS, wybrany przeciągnięciem", () => {
    const pyr = solid("pyramid", "p");
    const [A, , , , S, O] = shapeVertices(pyr);
    // odcinek od A do spodka wysokości O, przypięty do bryły
    const ao: LineItem = { id: "ao", kind: "line", from: A, to: O, fromRef: { shapeId: "p", vertex: 0 }, toRef: { shapeId: "p", vertex: 5 }, color: "ink", width: 2 };
    const scene = buildScene([pyr, ao]);
    const arms = armsAt("p", 0, scene);
    expect(arms.map((a) => a.id).sort()).toEqual(["l:ao", "v:1", "v:3", "v:4"]);
    // palec przeciągnięty między AO a AS
    const toward = [(O[0] + S[0]) / 2, (O[1] + S[1]) / 2] as [number, number];
    const sector = sectorFor(A, arms, toward)!;
    expect(sector.map((a) => a.id).sort()).toEqual(["l:ao", "v:4"]);
    const angle: AngleItem = { id: "k", kind: "angle", anchor: { shapeId: "p", vertex: 0, arms: [sector[0].id, sector[1].id] }, label: "α", color: "ink" };
    const resolved = angleArms(angle, scene)!;
    expect(angleDegrees(resolved.vertex, resolved.a, resolved.b)).toBeCloseTo(angleDegrees(A, O, S), 6);
    expect(armPairs(A, arms)).toHaveLength(6);
  });

  it("kąt w bryle jedzie razem z nią przy skalowaniu", () => {
    const pyr = solid("pyramid", "p");
    const bigger = scaleShapeTo(pyr, [0.9, 0.9]);
    const angle: AngleItem = { id: "k", kind: "angle", anchor: { shapeId: "p", vertex: 0 }, label: "α", color: "ink" };
    expect(angleArms(angle, buildScene([bigger]))!.vertex).toEqual(shapeVertices(bigger)[0]);
  });
});
