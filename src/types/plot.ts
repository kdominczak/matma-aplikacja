export type Point = [x: number, y: number];

/** Wykres funkcji rysowany w SVG (np. w zadaniach „odczytaj z wykresu”). */
export interface Plot {
  x: [min: number, max: number];
  y: [min: number, max: number];
  /** Łamane/krzywe – kolejne punkty łączone odcinkami. */
  lines: Point[][];
  /** Wyróżnione punkty; `open` = puste kółko (punkt nie należy do wykresu). */
  dots?: { at: Point; open?: boolean }[];
}
