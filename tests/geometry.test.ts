// Moduł geometrii brudnopisu: figury, nazwy wierzchołków, kąty, trafianie palcem i przekształcenia.
import { describe, expect, it } from "vitest";
import { angleArc, angleDegrees, interiorAngle, isRightAngle } from "@/lib/geometry/angle";
import { hitShape, nearestVertex } from "@/lib/geometry/hit";
import { defaultLabels, freshLabels, PLANE_SHAPES, SHAPES, shapeEdges, shapeVertices, type ShapeGeometry, type ShapeKind } from "@/lib/geometry/shapes";
import { boxCorners, MIN_SIZE, moveShape, rotationFromHandle, rotateShape, scaleShapeTo } from "@/lib/geometry/transform";
import { distance, type Vec } from "@/lib/geometry/vec";

const shape = (kind: ShapeKind, patch: Partial<ShapeGeometry> = {}): ShapeGeometry => ({
  shape: kind,
  center: [0.5, 0.5],
  size: SHAPES[kind].defaultSize,
  rotation: 0,
  ...patch,
});

const angles = (g: ShapeGeometry) => shapeVertices(g).map((_, i) => {
  const arms = interiorAngle(g, i)!;
  return angleDegrees(arms.vertex, arms.a, arms.b);
});
const sides = (g: ShapeGeometry) => {
  const v = shapeVertices(g);
  return shapeEdges(g).map(([i, j]) => distance(v[i], v[j]));
};
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe("figury", () => {
  it.each(PLANE_SHAPES.filter((s) => s !== "circle"))("%s: suma kątów wielokąta = (n − 2) · 180°", (kind) => {
    const g = shape(kind, { rotation: 30 });
    const n = shapeVertices(g).length;
    expect(sum(angles(g))).toBeCloseTo((n - 2) * 180, 6);
  });

  it("kwadrat: cztery równe boki i kąty proste – także po obrocie", () => {
    const g = shape("square", { rotation: 45 });
    for (const side of sides(g)) expect(side).toBeCloseTo(sides(g)[0], 9);
    for (const a of angles(g)) expect(isRightAngle(a)).toBe(true);
  });

  it("trójkąt równoboczny i sześciokąt foremny są foremne przy domyślnych proporcjach", () => {
    for (const kind of ["equilateral", "hexagon"] as const) {
      const g = shape(kind);
      const s = sides(g);
      for (const side of s) expect(side, kind).toBeCloseTo(s[0], 9);
    }
    for (const a of angles(shape("equilateral"))) expect(a).toBeCloseTo(60, 6);
    for (const a of angles(shape("hexagon"))) expect(a).toBeCloseTo(120, 6);
  });

  it("trójkąt prostokątny ma kąt prosty przy A, trapez prostokątny – przy A i D", () => {
    expect(isRightAngle(angles(shape("right-triangle"))[0])).toBe(true);
    const t = angles(shape("right-trapezoid"));
    expect([isRightAngle(t[0]), isRightAngle(t[3])]).toEqual([true, true]);
  });

  it("równoległobok i romb: przeciwległe boki równe", () => {
    for (const kind of ["parallelogram", "rhombus"] as const) {
      const s = sides(shape(kind));
      expect(s[0], kind).toBeCloseTo(s[2], 9);
      expect(s[1], kind).toBeCloseTo(s[3], 9);
    }
    const r = sides(shape("rhombus"));
    expect(r[0]).toBeCloseTo(r[1], 9);
  });

  it("wierzchołki nazwane A, B, C… przeciwnie do ruchu wskazówek zegara (jak w podręczniku)", () => {
    expect(defaultLabels("square")).toEqual(["A", "B", "C", "D"]);
    expect(defaultLabels("circle")).toEqual(["S"]);
    const [a, b, c] = shapeVertices(shape("triangle"));
    // na ekranie (y w dół) obieg przeciwny do wskazówek ma ujemny iloczyn wektorowy
    expect((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])).toBeLessThan(0);
  });

  it("nowa figura dostaje wolne litery (bez S, zarezerwowanej dla środka)", () => {
    expect(freshLabels("triangle", new Set(["A", "B", "C"]))).toEqual(["D", "E", "F"]);
    expect(freshLabels("square", new Set(["P", "Q", "R"]))).toEqual(["A", "B", "C", "D"]);
    expect(freshLabels("circle", new Set(["S"]))).toEqual(["O"]);
    expect(freshLabels("rectangle", new Set(["N", "O", "P", "Q", "R"]))).not.toContain("S");
  });
});

describe("kąty", () => {
  it("łuk kąta wewnętrznego ma rozpiętość równą mierze kąta", () => {
    const g = shape("triangle", { rotation: 75 });
    shapeVertices(g).forEach((_, i) => {
      const arms = interiorAngle(g, i)!;
      expect(Math.abs((angleArc(arms).sweep * 180) / Math.PI)).toBeCloseTo(angleDegrees(arms.vertex, arms.a, arms.b), 6);
    });
  });

  it("kąt prosty z tolerancją 2°", () => {
    expect(isRightAngle(90)).toBe(true);
    expect(isRightAngle(91.5)).toBe(true);
    expect(isRightAngle(93)).toBe(false);
  });

  it("koło nie ma kątów przy wierzchołkach; stożek ma – w wierzchołku S kąt rozwarcia", () => {
    expect(interiorAngle(shape("circle"), 0)).toBeNull();
    expect(interiorAngle(shape("cone"), 0)).not.toBeNull();
  });
});

describe("trafianie palcem", () => {
  it("środek i okolice obwodu trafiają, daleki punkt – nie", () => {
    const g = shape("square");
    expect(hitShape(g, [0.5, 0.5], 0.02)).toBe(true);
    expect(hitShape(g, [0.5 + 0.12 + 0.01, 0.5], 0.02)).toBe(true); // tuż za bokiem, w tolerancji
    expect(hitShape(g, [0.9, 0.9], 0.02)).toBe(false);
    expect(hitShape(shape("circle"), [0.5 + 0.13, 0.5], 0.01)).toBe(true);
  });

  it("najbliższy wierzchołek w zasięgu", () => {
    const g = shape("square");
    const [a] = shapeVertices(g);
    expect(nearestVertex(g, [a[0] + 0.01, a[1]], 0.03)).toBe(0);
    expect(nearestVertex(g, [0.5, 0.5], 0.03)).toBeNull();
  });
});

describe("przekształcenia", () => {
  it("przesunięcie przesuwa wszystkie wierzchołki o ten sam wektor", () => {
    const g = shape("trapezoid", { rotation: 15 });
    const moved = moveShape(g, [0.1, -0.05]);
    shapeVertices(g).forEach((v, i) => {
      const w = shapeVertices(moved)[i];
      expect(w[0] - v[0]).toBeCloseTo(0.1, 9);
      expect(w[1] - v[1]).toBeCloseTo(-0.05, 9);
    });
  });

  it("skalowanie narożnikiem: narożnik idzie za palcem, figury foremne zachowują proporcje", () => {
    const rect = scaleShapeTo(shape("rectangle"), [0.8, 0.7]);
    expect(rect.size[0]).toBeCloseTo(0.6, 9);
    expect(rect.size[1]).toBeCloseTo(0.4, 9);
    const square = scaleShapeTo(shape("square"), [0.8, 0.6]);
    expect(square.size[0]).toBeCloseTo(square.size[1], 9);
    const tiny = scaleShapeTo(shape("rectangle"), [0.5, 0.5]);
    expect(Math.min(...tiny.size)).toBeGreaterThanOrEqual(MIN_SIZE);
  });

  it("skalowanie obróconej figury liczy w jej własnym układzie", () => {
    const g = shape("rectangle", { rotation: 90 });
    const pointer: Vec = [0.5 + 0.1, 0.5 + 0.2]; // po obrocie o 90° oś x figury jest pionowa
    const scaled = scaleShapeTo(g, pointer);
    expect(scaled.size[0]).toBeCloseTo(0.4, 9);
    expect(scaled.size[1]).toBeCloseTo(0.2, 9);
  });

  it("obrót z uchwytu co 15°, w zakresie 0–359°", () => {
    const c: Vec = [0.5, 0.5];
    expect(rotationFromHandle(c, [0.5, 0.2])).toBe(0); // uchwyt prosto nad figurą
    expect(rotationFromHandle(c, [0.8, 0.5])).toBe(90);
    expect(rotationFromHandle(c, [0.2, 0.5])).toBe(270);
    expect(rotationFromHandle(c, [0.51, 0.2]) % 15).toBe(0);
  });

  it("bryły się nie obracają (rzut ukośny jest stały)", () => {
    expect(rotateShape(shape("prism"), 45).rotation).toBe(0);
    expect(boxCorners(shape("prism", { rotation: 45 }))[0]).toEqual(boxCorners(shape("prism"))[0]);
  });
});
