export type ScratchTemplate = "grid" | "blank" | "axes" | "numberline";

const GRID = 24; // kratka ~ zeszytowa
const UNIT = 32; // jednostka na osiach

type Props = { template: ScratchTemplate; width: number; height: number };

/** Tło brudnopisu (osobna warstwa pod płótnem – gumka go nie ściera). */
export default function ScratchBackground({ template, width, height }: Props) {
  if (template === "blank" || width === 0) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" width={width} height={height} aria-hidden>
      {template === "grid" && <Grid width={width} height={height} step={GRID} />}
      {template === "axes" && <Axes width={width} height={height} />}
      {template === "numberline" && <NumberLine width={width} height={height} />}
    </svg>
  );
}

function Grid({ width, height, step, offsetX = 0, offsetY = 0 }: { width: number; height: number; step: number; offsetX?: number; offsetY?: number }) {
  const xs = range(Math.ceil(-offsetX / step), Math.floor((width - offsetX) / step)).map((i) => offsetX + i * step);
  const ys = range(Math.ceil(-offsetY / step), Math.floor((height - offsetY) / step)).map((i) => offsetY + i * step);
  return (
    <g className="stroke-line" strokeWidth={1}>
      {xs.map((x) => (
        <line key={`x${x}`} x1={x} x2={x} y1={0} y2={height} />
      ))}
      {ys.map((y) => (
        <line key={`y${y}`} x1={0} x2={width} y1={y} y2={y} />
      ))}
    </g>
  );
}

/** Układ współrzędnych: osie przez środek, podziałka co 1 z opisami. */
function Axes({ width, height }: { width: number; height: number }) {
  const ox = Math.round(width / 2 / UNIT) * UNIT;
  const oy = Math.round(height / 2 / UNIT) * UNIT;
  const xTicks = range(Math.ceil(-ox / UNIT) + 1, Math.floor((width - ox) / UNIT) - 1).filter((i) => i !== 0);
  const yTicks = range(Math.ceil(-(height - oy) / UNIT) + 1, Math.floor(oy / UNIT) - 1).filter((i) => i !== 0);

  return (
    <>
      <Grid width={width} height={height} step={UNIT} offsetX={ox % UNIT} offsetY={oy % UNIT} />
      <g className="stroke-muted" strokeWidth={1.5}>
        <line x1={0} x2={width} y1={oy} y2={oy} />
        <line x1={ox} x2={ox} y1={0} y2={height} />
        {xTicks.map((i) => (
          <line key={`tx${i}`} x1={ox + i * UNIT} x2={ox + i * UNIT} y1={oy - 4} y2={oy + 4} />
        ))}
        {yTicks.map((i) => (
          <line key={`ty${i}`} x1={ox - 4} x2={ox + 4} y1={oy - i * UNIT} y2={oy - i * UNIT} />
        ))}
      </g>
      <g className="fill-muted" fontSize={10} fontWeight={600}>
        <path d={`M${width} ${oy} l-9 -5 v10z`} />
        <path d={`M${ox} 0 l-5 9 h10z`} />
        <text x={width - 6} y={oy - 10} textAnchor="end" fontSize={12}>x</text>
        <text x={ox + 10} y={14} fontSize={12}>y</text>
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
        <text x={ox - 8} y={oy + 16} textAnchor="end">0</text>
      </g>
    </>
  );
}

/** Oś liczbowa w górnej części kartki – miejsce na zaznaczanie przedziałów i rachunki pod spodem. */
function NumberLine({ width, height }: { width: number; height: number }) {
  const ox = Math.round(width / 2 / UNIT) * UNIT;
  const y = Math.min(140, Math.round(height / 3));
  const ticks = range(Math.ceil(-ox / UNIT) + 1, Math.floor((width - ox) / UNIT) - 1);

  return (
    <>
      <g className="stroke-muted" strokeWidth={1.5}>
        <line x1={0} x2={width} y1={y} y2={y} />
        {ticks.map((i) => (
          <line key={i} x1={ox + i * UNIT} x2={ox + i * UNIT} y1={y - (i === 0 ? 8 : 5)} y2={y + (i === 0 ? 8 : 5)} />
        ))}
      </g>
      <g className="fill-muted" fontSize={11} fontWeight={600}>
        <path d={`M${width} ${y} l-9 -5 v10z`} />
        <text x={width - 6} y={y - 12} textAnchor="end" fontSize={12}>x</text>
        {ticks.map((i) => (
          <text key={i} x={ox + i * UNIT} y={y + 22} textAnchor="middle">
            {i}
          </text>
        ))}
      </g>
      {/* delikatne linie pod spodem do rachunków */}
      <g className="stroke-line" strokeWidth={1}>
        {range(1, Math.floor((height - y - 40) / GRID)).map((i) => (
          <line key={i} x1={0} x2={width} y1={y + 40 + i * GRID} y2={y + 40 + i * GRID} />
        ))}
      </g>
    </>
  );
}

function range(from: number, to: number) {
  return to < from ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
