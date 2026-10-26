"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { estimateHistory } from "@/lib/estimate";
import { useTheme } from "@/lib/theme";
import type { Progress } from "@/types/progress";

// Kolory z tokenów motywu (Recharts potrzebuje wartości, nie klas). Linia sprawdzona walidatorem kontrastu.
const CHART_COLORS = {
  light: { line: "#2f5bff", grid: "#e2e7ef", axis: "#64748b", surface: "#ffffff", target: "#94a3b8" },
  dark: { line: "#6b8aff", grid: "#262b38", axis: "#8f98ad", surface: "#151821", target: "#5f687c" },
};

/** Szacowany wynik matury dzień po dniu, z linią celu. */
export default function EstimateChart({ progress }: { progress: Progress }) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const data = estimateHistory(progress);
  const lastIndex = data.length - 1;

  return (
    <figure>
      <div className="h-64 w-full sm:h-72" role="img" aria-label={`Szacowany wynik: obecnie ${data[lastIndex].value}%`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 44, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="estimate-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.line} stopOpacity={0.22} />
                <stop offset="100%" stopColor={colors.line} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis
              dataKey="label"
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: colors.grid }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine
              y={progress.target}
              stroke={colors.target}
              strokeDasharray="4 4"
              label={{ value: `Cel ${progress.target}%`, position: "insideTopLeft", fill: colors.axis, fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ stroke: colors.axis, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
                if (!active || !point) return null;
                return (
                  <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm shadow-card">
                    <p className="text-xs font-semibold text-muted">{point.label}</p>
                    <p className="font-extrabold text-ink">{point.value}% szacowanego wyniku</p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.line}
              strokeWidth={2}
              fill="url(#estimate-fill)"
              isAnimationActive
              activeDot={{ r: 5, fill: colors.line, stroke: colors.surface, strokeWidth: 2 }}
              dot={(props: { cx?: number; cy?: number; index?: number }) => {
                // etykieta tylko przy ostatnim punkcie – aktualny szacunek
                if (props.index !== lastIndex || props.cx == null || props.cy == null) {
                  return <g key={props.index} />;
                }
                return (
                  <g key="last">
                    <circle cx={props.cx} cy={props.cy} r={5} fill={colors.line} stroke={colors.surface} strokeWidth={2} />
                    <text x={props.cx + 9} y={props.cy + 4} fill={colors.axis} fontSize={12} fontWeight={800}>
                      {data[lastIndex].value}%
                    </text>
                  </g>
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-3 text-sm text-muted">
        <summary className="cursor-pointer font-semibold">Pokaż dane w tabeli</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="text-xs uppercase text-faint">
              <th className="py-1 font-bold">Dzień</th>
              <th className="py-1 text-right font-bold">Szacowany wynik</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.day} className="border-t border-line">
                <td className="py-1">{point.label}</td>
                <td className="py-1 text-right font-semibold text-ink">{point.value}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
