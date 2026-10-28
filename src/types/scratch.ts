import type { ShapeGeometry } from "@/lib/geometry/shapes";
import type { PointRef } from "@/lib/geometry/snap";
import type { Vec } from "@/lib/geometry/vec";

// Notatki z brudnopisu (format 2). Współrzędne w jednostkach kartki: 1 = szerokość kartki, więc ten sam
// rysunek wygląda tak samo w małym brudnopisie przy zadaniu i na pełnym ekranie. Grubość linii – w pikselach.

export const SCRATCH_VERSION = 2;

export type PenColor = "ink" | "blue" | "red";

export interface StrokeItem {
  id: string;
  kind: "stroke";
  points: Vec[];
  color: PenColor;
  width: number;
  erase: boolean;
}

/** Figura jako obiekt: geometria (środek, rozmiar, obrót) + wygląd i nazwy wierzchołków. */
export interface ShapeItem extends ShapeGeometry {
  id: string;
  kind: "shape";
  color: PenColor;
  width: number;
  /** Nazwy wierzchołków (A, B, C…), dla koła – środek (S). Uczeń może je zmienić. */
  labels: string[];
  showLabels: boolean;
}

/**
 * Odcinek od punktu do punktu (przekątna, wysokość, promień). Koniec złapany magnesem na wierzchołku,
 * środku boku albo środku figury jest do niej przypięty (`fromRef`/`toRef`) – jedzie razem z figurą.
 */
export interface LineItem {
  id: string;
  kind: "line";
  from: Vec;
  to: Vec;
  fromRef?: PointRef;
  toRef?: PointRef;
  color: PenColor;
  width: number;
}

/**
 * Kąt: przypięty do wierzchołka figury (przesuwa się razem z nią) albo swobodny – trzy punkty
 * (punkt na ramieniu, wierzchołek, punkt na drugim ramieniu).
 * `arms` – wybrana para ramion, gdy z wierzchołka wychodzi więcej odcinków: "v:<indeks>" (sąsiedni
 * wierzchołek figury) albo "l:<id linii>". Bez `arms` – kąt wewnętrzny figury.
 */
export interface AngleItem {
  id: string;
  kind: "angle";
  anchor: { shapeId: string; vertex: number; arms?: [string, string] } | { points: [Vec, Vec, Vec] };
  label: string;
  color: PenColor;
}

/** Bok figury, krawędź bryły albo narysowana linia – to, co da się oznaczyć. */
export type EdgeRef = { shapeId: string; edge: number } | { lineId: string };

/**
 * Oznaczenie boku (jedno na bok): długość („a”, „2√3” – zapis ucznia, rysowany jako LaTeX),
 * znaczniki równych odcinków (|, ||, |||) i środek boku. Przypięte – jedzie razem z figurą.
 */
export interface MarkItem {
  id: string;
  kind: "mark";
  target: EdgeRef;
  label: string;
  ticks: 0 | 1 | 2 | 3;
  midpoint: boolean;
  color: PenColor;
}

/** Wzór (LaTeX) albo wynik z kalkulatora położony na kartce; `at` – lewy górny róg. */
export interface FormulaItem {
  id: string;
  kind: "formula";
  tex: string;
  at: Vec;
}

export type ScratchItem = StrokeItem | ShapeItem | LineItem | AngleItem | MarkItem | FormulaItem;
