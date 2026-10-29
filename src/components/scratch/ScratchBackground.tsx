export type ScratchTemplate = "grid" | "blank" | "axes" | "numberline";

const GRID = 24; // kratka ~ zeszytowa
const UNIT = 32; // jednostka na osiach

/**
 * `width`/`height` – rozmiar pola na ekranie; `zoom` i `pan` (lewy górny róg widoku w pikselach kartki przy 100%)
 * – widok brudnopisu. Tło rysujemy w układzie kartki przy 100% i nakładamy widok jak na płótnie, więc kratka,
 * osie i oś liczbowa przesuwają się razem z notatkami, a po oddaleniu wypełniają całe pole.
 */
type Props = { template: ScratchTemplate; width: number; height: number; zoom?: number; pan?: [number, number] };

/** Widoczny fragment kartki (piksele kartki przy 100%) i położenie wzoru wyznaczone dla widoku 100%. */
type Region = { x: number; y: number; w: number; h: number; baseWidth: number; baseHeight: number };

/** Tło brudnopisu (osobna warstwa pod płótnem – gumka go nie ściera). */
export default function ScratchBackground({ template, width, height, zoom = 1, pan = [0, 0] }: Props) {
  if (template === "blank" || width === 0) return null;
  const region: Region = { x: pan[0], y: pan[1], w: width / zoom, h: height / zoom, baseWidth: width, baseHeight: height };

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" width={width} height={height} aria-hidden>
      <g transform={`scale(${zoom}) translate(${-pan[0]} ${-pan[1]})`}>
        {template === "grid" && <Grid region={region} step={GRID} />}
        {template === "axes" && <Axes region={region} />}
        {template === "numberline" && <NumberLine region={region} />}
      </g>
    </svg>
  );
}

/** Linie co `step` (przesunięte o `offset`) na całym widocznym fragmencie. */
function Grid({ region, step, offsetX = 0, offsetY = 0 }: { region: Region; step: number; offsetX?: number; offsetY?: number }) {
  const { x, y, w, h } = region;
  const xs = range(Math.ceil((x - offsetX) / step), Math.floor((x + w - offsetX) / step)).map((i) => offsetX + i * step);
  const ys = range(Math.ceil((y - offsetY) / step), Math.floor((y + h - offsetY) / step)).map((i) => offsetY + i * step);
  return (
    <g className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke">
      {xs.map((lx) => (
        <line key={`x${lx}`} x1={lx} x2={lx} y1={y} y2={y + h} vectorEffect="non-scaling-stroke" />
      ))}
      {ys.map((ly) => (
        <line key={`y${ly}`} x1={x} x2={x + w} y1={ly} y2={ly} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
}

/** Układ współrzędnych: osie przez środek pola (przy 100%), podziałka co 1 z opisami. */
function Axes({ region }: { region: Region }) {
  const { x, y, w, h } = region;
  const ox = Math.round(region.baseWidth / 2 / UNIT) * UNIT;
  const oy = Math.round(region.baseHeight / 2 / UNIT) * UNIT;
  // podziałka w widocznej części, bez kresek tuż przy krawędzi (tam strzałki i opisy osi)
  const xTicks = range(Math.ceil((x - ox) / UNIT) + 1, Math.floor((x + w - ox) / UNIT) - 1).filter((i) => i !== 0);
  const yTicks = range(Math.ceil((oy - (y + h)) / UNIT) + 1, Math.floor((oy - y) / UNIT) - 1).filter((i) => i !== 0);
  const right = x + w;
  const top = y;

  return (
    <>
      <Grid region={region} step={UNIT} offsetX={ox % UNIT} offsetY={oy % UNIT} />
      <g className="stroke-muted" strokeWidth={1.5}>
        <line x1={x} x2={right} y1={oy} y2={oy} vectorEffect="non-scaling-stroke" />
        <line x1={ox} x2={ox} y1={top} y2={y + h} vectorEffect="non-scaling-stroke" />
        {xTicks.map((i) => (
          <line key={`tx${i}`} x1={ox + i * UNIT} x2={ox + i * UNIT} y1={oy - 4} y2={oy + 4} vectorEffect="non-scaling-stroke" />
        ))}
        {yTicks.map((i) => (
          <line key={`ty${i}`} x1={ox - 4} x2={ox + 4} y1={oy - i * UNIT} y2={oy - i * UNIT} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g className="fill-muted" fontSize={10} fontWeight={600}>
        <path d={`M${right} ${oy} l-9 -5 v10z`} />
        <path d={`M${ox} ${top} l-5 9 h10z`} />
        <text x={right - 6} y={oy - 10} textAnchor="end" fontSize={12}>
          x
        </text>
        <text x={ox + 10} y={top + 14} fontSize={12}>
          y
        </text>
        {xTicks.map((i) => (
          <text key={`lx${i}`} x={ox + i * UNIT} y={oy + 16} textAnchor="middle">
            {i}
          </text>
        ))}
        {yTicks.map((i) => (
          <text key={`ly${i}`} x={ox - 8} y={oy - i * UNIT + 3.5} textAnchor="end">
            {i}
          </text>
        ))}
        <text x={ox - 8} y={oy + 16} textAnchor="end">
          0
        </text>
      </g>
    </>
  );
}

/** Oś liczbowa w górnej części kartki – miejsce na zaznaczanie przedziałów i rachunki pod spodem. */
function NumberLine({ region }: { region: Region }) {
  const { x, y: top, w, h } = region;
  const ox = Math.round(region.baseWidth / 2 / UNIT) * UNIT;
  const y = Math.min(140, Math.round(region.baseHeight / 3));
  const right = x + w;
  const ticks = range(Math.ceil((x - ox) / UNIT) + 1, Math.floor((right - ox) / UNIT) - 1);
  const firstRow = y + 40;
  const rows = range(Math.max(1, Math.ceil((top - firstRow) / GRID)), Math.floor((top + h - firstRow) / GRID));

  return (
    <>
      <g className="stroke-muted" strokeWidth={1.5}>
        <line x1={x} x2={right} y1={y} y2={y} vectorEffect="non-scaling-stroke" />
        {ticks.map((i) => (
          <line key={i} x1={ox + i * UNIT} x2={ox + i * UNIT} y1={y - (i === 0 ? 8 : 5)} y2={y + (i === 0 ? 8 : 5)} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g className="fill-muted" fontSize={11} fontWeight={600}>
        <path d={`M${right} ${y} l-9 -5 v10z`} />
        <text x={right - 6} y={y - 12} textAnchor="end" fontSize={12}>
          x
        </text>
        {ticks.map((i) => (
          <text key={i} x={ox + i * UNIT} y={y + 22} textAnchor="middle">
            {i}
          </text>
        ))}
      </g>
      {/* delikatne linie pod spodem do rachunków */}
      <g className="stroke-line" strokeWidth={1}>
        {rows.map((i) => (
          <line key={i} x1={x} x2={right} y1={firstRow + i * GRID} y2={firstRow + i * GRID} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </>
  );
}

function range(from: number, to: number) {
  return to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
