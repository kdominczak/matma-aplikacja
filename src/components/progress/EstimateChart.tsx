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
import { levelTarget } from "@/lib/level";
import { LEVEL_POINTS } from "@/lib/exam-weights";
import { goalPoints } from "@/lib/goal";
import type { Progress } from "@/types/progress";
import type { Level } from "@/types/topic";

// Kolory z tokenów motywu (Recharts potrzebuje wartości, nie klas). Linia sprawdzona walidatorem kontrastu.
const CHART_COLORS = {
  light: { line: "#7a5c0e", grid: "#dcd7cb", axis: "#5b6270", surface: "#ffffff", target: "#7c8494" },
  dark: { line: "#d4af37", grid: "#232b3b", axis: "#8b94a7", surface: "#111827", target: "#5b6476" },
};

/** Szacowany wynik matury dzień po dniu, z linią celu – w punktach, tak jak cel i wynik na ekranie głównym. */
export default function EstimateChart({ progress, level = "podstawowy" }: { progress: Progress; level?: Level }) {
  const { isDark } = useTheme();
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  const max = LEVEL_POINTS[level];
  const data = estimateHistory(progress, level).map((point) => ({ ...point, percent: point.value, value: Math.round((point.value / 100) * max) }));
  const target = goalPoints(levelTarget(progress, level), level);
  const ticks = Array.from({ length: Math.floor(max / 10) + 1 }, (_, i) => i * 10);
  const lastIndex = data.length - 1;

  return (
    <figure>
      <div className="h-64 w-full sm:h-72" role="img" aria-label={`Szacowany wynik: obecnie ${data[lastIndex].value} z ${max} pkt`}>
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
              domain={[0, max]}
              ticks={ticks}
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine
              y={target}
              stroke={colors.target}
              strokeDasharray="4 4"
              label={{ value: `Cel ${target} pkt`, position: "insideTopLeft", fill: colors.axis, fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ stroke: colors.axis, strokeWidth: 1, strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
                if (!active || !point) return null;
                return (
                  <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm shadow-card">
                    <p className="text-xs font-semibold text-muted">{point.label}</p>
                    <p className="font-extrabold text-ink">
                      {point.value}/{max} pkt · {point.percent}%
                    </p>
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
                      {data[lastIndex].value} pkt
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
            <tr className="text-xs uppercase text-muted">
              <th className="py-1 font-bold">Dzień</th>
              <th className="py-1 text-right font-bold">Szacowany wynik</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.day} className="border-t border-line">
                <td className="py-1">{point.label}</td>
                <td className="py-1 text-right font-semibold text-ink">
                  {point.value}/{max} pkt · {point.percent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
