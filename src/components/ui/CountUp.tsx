"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Liczba, która „dolicza” do wartości (szacowany wynik, wynik arkusza): od 0 przy pierwszym pokazaniu,
 * potem od poprzedniej wartości. Czytnik ekranu dostaje od razu wartość końcową; „ogranicz ruch” – bez animacji.
 */
export default function CountUp({ value, durationMs = 900, suffix = "" }: { value: number; durationMs?: number; suffix?: string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = from.current;
    if (start === value || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value;
      setShown(value);
      return;
    }
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / durationMs);
      const eased = 1 - (1 - t) ** 3; // szybki start, miękkie dojście do wartości
      const current = Math.round(start + (value - start) * eased);
      from.current = current;
      setShown(current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return (
    <span aria-label={`${value}${suffix}`}>
      <span aria-hidden>
        {shown}
        {suffix}
      </span>
    </span>
  );
}
