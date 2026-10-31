"use client";

import { useEffect, useState } from "react";
import { GOAL_MAX_POINTS, GOAL_MIN_POINTS, goalLabel, goalPercent, goalPoints, topicsForGoal } from "@/lib/goal";
import { plural } from "@/lib/plural";

/**
 * Cel w punktach (15–50): suwak z opisem i liczbą działów potrzebnych do celu. Wartość w procentach (tak zapisujemy
 * cel). `debounceMs` – zapis po krótkiej przerwie w przesuwaniu (ustawienia: zapis do pamięci i chmury);
 * 0 – od razu (powitanie: stan lokalny, uczeń może zaraz kliknąć „Dalej”).
 */
export default function GoalSlider({
  percent,
  onChange,
  id = "goal",
  debounceMs = 350,
}: {
  percent: number;
  onChange: (percent: number) => void;
  id?: string;
  debounceMs?: number;
}) {
  const [points, setPoints] = useState(() => goalPoints(percent));

  useEffect(() => {
    if (debounceMs === 0 || goalPercent(points) === percent) return;
    const timer = setTimeout(() => onChange(goalPercent(points)), debounceMs);
    return () => clearTimeout(timer);
  }, [points, percent, onChange, debounceMs]);

  const topics = topicsForGoal(goalPercent(points)).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-bold text-ink">
          Ile punktów chcesz zdobyć?
        </label>
        <p className="shrink-0 text-2xl font-extrabold text-brand tabular-nums">
          {points}
          <span className="text-sm font-bold text-muted">
            /{GOAL_MAX_POINTS} pkt · {goalPercent(points)}%
          </span>
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={GOAL_MIN_POINTS}
        max={GOAL_MAX_POINTS}
        step={1}
        value={points}
        onChange={(e) => {
          const next = Number(e.target.value);
          setPoints(next);
          if (debounceMs === 0) onChange(goalPercent(next));
        }}
        aria-valuetext={`${points} punktów, ${goalPercent(points)}%`}
        className="h-11 w-full accent-brand"
      />
      <div className="flex justify-between text-[11px] font-bold text-faint" aria-hidden>
        <span>{GOAL_MIN_POINTS} pkt · zdana</span>
        <span>{GOAL_MAX_POINTS} pkt</span>
      </div>
      <p className="text-sm text-muted">
        {goalLabel(points)}. Plan i ścieżka obejmą {topics} {plural(topics, "dział", "działy", "działów")} – od tych, które dają najwięcej punktów.
      </p>
    </div>
  );
}
