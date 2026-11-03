"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { GOAL_RANGE, goalLabel, goalPercent, goalPoints, topicsForGoal } from "@/lib/goal";
import { LEVEL_LONG } from "@/lib/level";
import { plural } from "@/lib/plural";
import type { Level } from "@/types/topic";

/**
 * Cel w punktach na maturze danego poziomu: suwak z opisem i liczbą działów potrzebnych do celu. Wartość w procentach
 * (tak zapisujemy cel). `debounceMs` – zapis po krótkiej przerwie w przesuwaniu (ustawienia: zapis do pamięci i chmury);
 * 0 – od razu (powitanie: stan lokalny, uczeń może zaraz kliknąć „Dalej”). `showLevel` – nazwa matury w etykiecie
 * (gdy uczeń ustawia cele na dwóch poziomach).
 */
export default function GoalSlider({
  percent,
  onChange,
  id = "goal",
  debounceMs = 350,
  level = "podstawowy",
  showLevel = false,
}: {
  percent: number;
  onChange: (percent: number) => void;
  id?: string;
  debounceMs?: number;
  level?: Level;
  showLevel?: boolean;
}) {
  const [points, setPoints] = useState(() => goalPoints(percent, level));
  const range = GOAL_RANGE[level];

  useEffect(() => {
    if (debounceMs === 0 || goalPercent(points, level) === percent) return;
    const timer = setTimeout(() => onChange(goalPercent(points, level)), debounceMs);
    return () => clearTimeout(timer);
  }, [points, percent, onChange, debounceMs, level]);

  const topics = topicsForGoal(goalPercent(points, level), level).length;
  const fill = ((points - range.min) / (range.max - range.min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-bold text-ink">
          {showLevel ? LEVEL_LONG[level] : "Ile punktów chcesz zdobyć?"}
        </label>
        <p className="shrink-0 font-display text-2xl font-extrabold text-brand tabular-nums">
          {points}
          <span className="text-sm font-bold text-muted">
            /{range.max} pkt · {goalPercent(points, level)}%
          </span>
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={1}
        value={points}
        onChange={(e) => {
          const next = Number(e.target.value);
          setPoints(next);
          if (debounceMs === 0) onChange(goalPercent(next, level));
        }}
        aria-valuetext={`${points} punktów, ${goalPercent(points, level)}%`}
        style={{ "--fill": `${fill}%` } as CSSProperties}
        className="goal-range h-11 w-full"
      />
      <div className="flex justify-between text-xs font-bold text-muted" aria-hidden>
        <span>
          {range.min} pkt{level === "podstawowy" ? " · zdana" : ""}
        </span>
        <span>{range.max} pkt</span>
      </div>
      <p className="text-sm text-muted">
        {goalLabel(points, level)}. Plan i ścieżka obejmą {topics} {plural(topics, "dział", "działy", "działów")} – od tych, które dają najwięcej punktów.
      </p>
    </div>
  );
}
