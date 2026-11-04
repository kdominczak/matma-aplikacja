// Brudnopis: zapis notatek na urządzeniu, kąty przypięte do figur i wstawianie figur.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { angleArms as sceneAngleArms, buildScene } from "@/components/scratch/scene";
import { placeShape } from "@/components/scratch/scratch-draw";
import { interiorAngle } from "@/lib/geometry/angle";
import { SHAPES } from "@/lib/geometry/shapes";
import { moveShape } from "@/lib/geometry/transform";
import type { AngleItem, ShapeItem } from "@/types/scratch";

const triangle: ShapeItem = {
  id: "t1",
  kind: "shape",
  shape: "triangle",
  center: [0.5, 0.5],
  size: [0.3, 0.2],
  rotation: 0,
  color: "ink",
  width: 2,
  labels: ["A", "B", "C"],
  showLabels: true,
};

describe("kąty przypięte do figur", () => {
  const angle: AngleItem = { id: "a1", kind: "angle", anchor: { shapeId: "t1", vertex: 2 }, label: "α", color: "ink" };

  it("kąt przy wierzchołku C idzie za przesuniętą figurą", () => {
    const moved = moveShape(triangle, [0.2, 0.1]);
    const arms = sceneAngleArms(angle, buildScene([moved]))!;
    expect(arms).toEqual(interiorAngle(moved, 2));
  });

  it("po usunięciu figury kąt nie ma czego pokazać", () => {
    expect(sceneAngleArms(angle, buildScene([]))).toBeNull();
  });

  it("kąt swobodny – trzy zapisane punkty", () => {
    const free: AngleItem = { id: "a2", kind: "angle", anchor: { points: [[0, 0], [0.1, 0.1], [0.2, 0]] }, label: "β", color: "blue" };
    expect(sceneAngleArms(free, buildScene([]))).toEqual({ a: [0, 0], vertex: [0.1, 0.1], b: [0.2, 0] });
  });
});

describe("wstawianie figury z siatki", () => {
  it("na środku widoku, w domyślnym rozmiarze", () => {
    expect(placeShape("cube", [0.5, 0.3], 1, [], 0.04)).toEqual({ center: [0.5, 0.3], size: SHAPES.cube.defaultSize });
  });

  it("przy przybliżeniu ten sam rozmiar na ekranie", () => {
    const { size } = placeShape("rectangle", [0.5, 0.3], 2, [], 0.04);
    expect(size[0]).toBeCloseTo(SHAPES.rectangle.defaultSize[0] / 2, 9);
    expect(size[1]).toBeCloseTo(SHAPES.rectangle.defaultSize[1] / 2, 9);
  });

  it("kolejna figura nie ląduje na poprzedniej", () => {
    const first = placeShape("cube", [0.5, 0.3], 1, [], 0.04).center;
    const second = placeShape("cube", [0.5, 0.3], 1, [first], 0.04).center;
    const third = placeShape("cube", [0.5, 0.3], 1, [first, second], 0.04).center;
    expect(second).not.toEqual(first);
    expect(third).not.toEqual(second);
    expect(third).not.toEqual(first);
  });
});

describe("zapis notatek", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  const load = () => import("@/lib/scratch-notes");
  const saved = () => JSON.parse(localStorage.getItem("CapacitorStorage.scratch.v2") ?? "null");

  it("notatki zapisują się z opóźnieniem (nie przy każdej kresce) i wracają po ponownym uruchomieniu", async () => {
    const notes = await load();
    notes.setScratchNotes("zad-1", [triangle]);
    expect(saved()).toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(saved().tasks["zad-1"].items).toEqual([triangle]);
  });

  it("puste kartki nie zajmują miejsca, czyszczenie usuwa wskazane zadania", async () => {
    const notes = await load();
    notes.setScratchNotes("a", [triangle]);
    notes.setScratchNotes("b", []);
    notes.setScratchNotes("c", [triangle]);
    notes.clearScratchNotes(["c"]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(Object.keys(saved().tasks)).toEqual(["a"]);
  });

  it("przechowuje najwyżej 40 ostatnich zadań – najstarsze wypadają", async () => {
    const notes = await load();
    for (let i = 0; i < 45; i++) {
      vi.setSystemTime(1_000_000 + i * 1000);
      notes.setScratchNotes(`z${i}`, [triangle]);
    }
    await vi.advanceTimersByTimeAsync(1000);
    const ids = Object.keys(saved().tasks);
    expect(ids).toHaveLength(40);
    expect(ids).not.toContain("z0");
    expect(ids).toContain("z44");
  });

  it("zapis przed wczytaniem nie kasuje notatek innych zadań", async () => {
    localStorage.setItem("CapacitorStorage.scratch.v2", JSON.stringify({ v: 2, tasks: { stare: { at: 1, items: [triangle] } } }));
    const notes = await load();
    notes.setScratchNotes("nowe", [triangle]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(Object.keys(saved().tasks).sort()).toEqual(["nowe", "stare"]);
  });

  it("zapis w innej wersji formatu jest pomijany (brudnopis działa, notatki od nowa)", async () => {
    localStorage.setItem("CapacitorStorage.scratch.v2", JSON.stringify({ v: 1, tasks: { x: { at: 1, items: [{ kind: "solid" }] } } }));
    const notes = await load();
    notes.setScratchNotes("y", [triangle]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(Object.keys(saved().tasks)).toEqual(["y"]);
  });
});
