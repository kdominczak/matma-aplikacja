"use client";

import type { RefObject } from "react";
import Icon from "@/components/ui/Icon";
import { formatIntervals, formatNumber, readAnswer, readIntervals } from "@/lib/calc";

/** Znaki, których brakuje na klawiaturze telefonu (albo są głęboko schowane). */
const KEYS = ["/", "√", "π", "^", "-", ";", "∞"];

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
};

/**
 * Pod polem wyniku zadania otwartego: klawisze symboli i podgląd, jak aplikacja odczyta wynik
 * („= −1,5”). Bez podglądu uczeń wpisywał np. „log3 3-3/2” i dopiero na podsumowaniu widział 0 pkt.
 */
export default function AnswerTools({ value, onChange, inputRef, disabled = false }: Props) {
  const values = readAnswer(value);
  // przedział (np. „⟨-4; 4)”, „x ≥ -9”) – podgląd, jak aplikacja go zrozumiała
  const intervals = values ? null : readIntervals(value);

  function insert(key: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const text = key === ";" ? "; " : key;
    onChange(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {!disabled && (
        <div className="flex gap-1.5" aria-label="Symbole">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              // nie zabieramy fokusu z pola – klawiatura telefonu zostaje otwarta
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(key)}
              className="press flex h-10 min-w-10 flex-1 items-center justify-center rounded-xl border border-line bg-subtle text-base font-bold text-ink"
            >
              {key}
            </button>
          ))}
        </div>
      )}
      {value.trim() &&
        (values || intervals ? (
          <p className="text-sm text-muted" aria-live="polite">
            Odczytam: <strong className="text-ink">{values ? values.map((v) => formatNumber(v)).join("; ") : formatIntervals(intervals!)}</strong>
          </p>
        ) : (
          <p className="flex items-start gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300" aria-live="polite">
            <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
            Tego nie policzę – wpisz sam wynik liczbowy, np. -3/2, 2√3 albo 1,5.
          </p>
        ))}
    </div>
  );
}
