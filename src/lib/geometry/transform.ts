import { isSolid, SHAPES, toWorld, type ShapeGeometry } from "@/lib/geometry/shapes";
import { add, rotate, sub, toDeg, type Vec } from "@/lib/geometry/vec";

// Przekształcenia figur z uchwytów: przesuwanie, skalowanie (narożniki) i obrót (co 15°).

/** Najmniejszy bok pudełka figury (w jednostkach kartki) – żeby figura nie znikła przy ściskaniu. */
export const MIN_SIZE = 0.04;
export const ROTATION_STEP = 15;

export function moveShape<T extends ShapeGeometry>(g: T, delta: Vec): T {
  return { ...g, center: add(g.center, delta) };
}

/**
 * Skalowanie narożnikiem: figura rośnie symetrycznie względem środka, a narożnik podąża za palcem.
 * Figury foremne (kwadrat, koło, trójkąt równoboczny…) zachowują proporcje.
 */
export function scaleShapeTo<T extends ShapeGeometry>(g: T, pointer: Vec): T {
  const rotation = isSolid(g.shape) ? 0 : g.rotation;
  const local = rotate(sub(pointer, g.center), -rotation);
  let w = Math.max(MIN_SIZE, Math.abs(local[0]) * 2);
  let h = Math.max(MIN_SIZE, Math.abs(local[1]) * 2);
  const aspect = SHAPES[g.shape].aspect;
  if (aspect) {
    // jednolita skala: większa z dwóch propozycji, przeliczona na proporcję figury
    const k = Math.max(w, h / aspect);
    w = k;
    h = k * aspect;
  }
  return { ...g, size: [w, h] };
}

/** Kąt obrotu z położenia uchwytu nad figurą, zaokrąglony do 15° (łatwo o idealny poziom i pion). */
export function rotationFromHandle(center: Vec, pointer: Vec, step = ROTATION_STEP): number {
  const [dx, dy] = sub(pointer, center);
  // uchwyt jest nad figurą (kierunek „w górę” = −90° na ekranie) – stąd przesunięcie o 90°
  const raw = toDeg(Math.atan2(dy, dx)) + 90;
  const snapped = Math.round(raw / step) * step;
  return ((snapped % 360) + 360) % 360;
}

export function rotateShape<T extends ShapeGeometry>(g: T, rotation: number): T {
  return isSolid(g.shape) ? g : { ...g, rotation };
}

/** Narożniki pudełka figury na kartce (do rysowania uchwytów): lewy górny, prawy górny, prawy dolny, lewy dolny. */
export function boxCorners(g: ShapeGeometry): Vec[] {
  return (
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ] as Vec[]
  ).map((p) => toWorld(g, p));
}

/** Położenie uchwytu obrotu: nad górną krawędzią pudełka, w odległości `offset`. */
export function rotationHandle(g: ShapeGeometry, offset: number): Vec {
  return toWorld(g, [0, -0.5 - offset / Math.max(g.size[1], 1e-6)]);
}
