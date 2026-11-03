export type Point = [x: number, y: number];

/** Wykres funkcji rysowany w SVG (np. w zadaniach „odczytaj z wykresu”). */
export interface Plot {
  x: [min: number, max: number];
  y: [min: number, max: number];
  /** Łamane/krzywe – kolejne punkty łączone odcinkami. */
  lines: Point[][];
  /** Linie pomocnicze (przerywane, w tle): np. wykres przed przekształceniem, przyprostokątne do Pitagorasa. */
  guides?: Point[][];
  /** Wyróżnione punkty; `open` = puste kółko (punkt nie należy do wykresu). */
  dots?: { at: Point; open?: boolean }[];
  /** false = rysunek geometryczny: bez kratki i osi, linie cieńsze, w kolorze tekstu (domyślnie układ współrzędnych). */
  axes?: boolean;
  /** Podpisy na rysunku: wierzchołki, długości, kąty („A”, „5”, „α”, „50°”). Pojedyncza litera – kursywą. */
  labels?: { at: Point; text: string; anchor?: "start" | "middle" | "end" }[];
  /** Wypełnione wielokąty (np. słupki diagramu) – półprzezroczyste, pod liniami. */
  fills?: Point[][];
  /** Nazwy osi zamiast „x” i „y” (np. „ocena”, „liczba uczniów”). */
  axisNames?: [x: string, y: string];
}
