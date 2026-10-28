"use client";

import { useId } from "react";
import { hapticTap } from "@/lib/haptics";

/**
 * Przełącznik włącz/wyłącz. Cały wiersz (etykieta + opis) jest klikalny, a czytnik ekranu dostaje
 * jeden element `switch` z etykietą i opisem – bez zagnieżdżonych elementów interaktywnych.
 */
export default function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-description` : undefined}
      onClick={() => {
        hapticTap();
        onChange(!checked);
      }}
      className="group flex w-full items-center justify-between gap-4 py-3 text-left first:pt-0 last:pb-0"
    >
      <span className="min-w-0">
        <span id={`${id}-label`} className="block font-bold text-ink">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="block text-sm text-muted">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-brand/40 ${
          checked ? "bg-brand" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}
