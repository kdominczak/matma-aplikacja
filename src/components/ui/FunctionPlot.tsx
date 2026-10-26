import type { Plot } from "@/types/plot";

const UNIT = 28; // px na jednostkę układu
const PAD = 14;

/** Wykres funkcji w układzie współrzędnych z kratką – skaluje się do szerokości ekranu. */
export default function FunctionPlot({ plot }: { plot: Plot }) {
  const [xMin, xMax] = plot.x;
  const [yMin, yMax] = plot.y;
  const width = (xMax - xMin) * UNIT + PAD * 2;
  const height = (yMax - yMin) * UNIT + PAD * 2;
  const px = (x: number) => PAD + (x - xMin) * UNIT;
  const py = (y: number) => PAD + (yMax - y) * UNIT;
  // id z wymiarów: kilka wykresów na stronie nie nadpisze sobie obszaru przycięcia
  const clipId = `plot-${xMin}-${xMax}-${yMin}-${yMax}`;

  const xs = range(Math.ceil(xMin), Math.floor(xMax));
  const ys = range(Math.ceil(yMin), Math.floor(yMax));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-sm"
      role="img"
      aria-label="Wykres funkcji"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD} y={PAD} width={width - PAD * 2} height={height - PAD * 2} />
        </clipPath>
      </defs>

      {/* kratka */}
      <g className="stroke-line" strokeWidth={1}>
        {xs.map((x) => (
          <line key={`gx${x}`} x1={px(x)} x2={px(x)} y1={PAD} y2={height - PAD} />
        ))}
        {ys.map((y) => (
          <line key={`gy${y}`} x1={PAD} x2={width - PAD} y1={py(y)} y2={py(y)} />
        ))}
      </g>

      {/* osie */}
      <g className="stroke-muted" strokeWidth={1.5}>
        <line x1={PAD - 6} x2={width - PAD + 6} y1={py(0)} y2={py(0)} />
        <line x1={px(0)} x2={px(0)} y1={height - PAD + 6} y2={PAD - 6} />
      </g>
      <g className="fill-muted">
        <path d={`M${width - PAD + 8} ${py(0)} l-7 -4 v8z`} />
        <path d={`M${px(0)} ${PAD - 8} l-4 7 h8z`} />
      </g>
      <g className="fill-muted" fontSize={10} fontWeight={600}>
        <text x={width - PAD - 2} y={py(0) - 6} textAnchor="end">x</text>
        <text x={px(0) + 6} y={PAD + 4}>y</text>
        {xs
          .filter((x) => x !== 0)
          .map((x) => (
            <text key={`lx${x}`} x={px(x)} y={py(0) + 13} textAnchor="middle">
              {x}
            </text>
          ))}
        {ys
          .filter((y) => y !== 0)
          .map((y) => (
            <text key={`ly${y}`} x={px(0) - 5} y={py(y) + 3.5} textAnchor="end">
              {y}
            </text>
          ))}
        <text x={px(0) - 5} y={py(0) + 13} textAnchor="end">0</text>
      </g>

      {/* wykres */}
      <g
        clipPath={`url(#${clipId})`}
        className="stroke-brand"
        fill="none"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {plot.lines.map((line, i) => (
          <polyline key={i} points={line.map(([x, y]) => `${px(x)},${py(y)}`).join(" ")} />
        ))}
      </g>
      {plot.dots?.map(({ at: [x, y], open }, i) => (
        <circle
          key={i}
          cx={px(x)}
          cy={py(y)}
          r={4.5}
          className={`stroke-brand ${open ? "fill-card" : "fill-brand"}`}
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
