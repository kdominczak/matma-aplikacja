"use client";

import { useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import { plural } from "@/lib/plural";

/**
 * Matura z matematyki (poziom podstawowy) 2027: 5 maja, godz. 9:00 czasu polskiego.
 * Źródło: komunikat dyrektora CKE z 20 sierpnia 2026 r. – przy kolejnym roczniku zaktualizuj datę.
 */
export const MATURA_DATE = new Date("2027-05-05T09:00:00+02:00");

const MINUTE = 60_000;
let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

// Jeden wspólny zegar tykający co minutę dla wszystkich liczników na ekranie.
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, MINUTE);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function useNow(): number | null {
  return useSyncExternalStore(subscribe, () => now, () => null);
}

/** Pasek „Do matury z matematyki zostało: X dni, Y godzin”. */
export default function Countdown() {
  const current = useNow();
  const left = current === null ? null : MATURA_DATE.getTime() - current;

  const days = left === null ? 0 : Math.floor(left / 86_400_000);
  const hours = left === null ? 0 : Math.floor((left % 86_400_000) / 3_600_000);
  const minutes = left === null ? 0 : Math.floor((left % 3_600_000) / MINUTE);

  return (
    <div className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="pointer-events-none absolute -top-10 left-1/3 h-24 w-64 rounded-full bg-brand/40 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-10">
        <p className="flex min-w-0 items-center gap-2 text-xs font-bold sm:text-sm">
          <Icon name="graduation" className="h-4 w-4 shrink-0 text-amber-300" />
          <span className="truncate text-white/80">
            {left !== null && left <= 0 ? "Matura z matematyki już za Tobą – trzymamy kciuki za wynik!" : (
              <>
                <span className="sm:hidden">Do matury z matmy:</span>
                <span className="hidden sm:inline">Do matury z matematyki zostało:</span>
              </>
            )}
          </span>
        </p>
        {(left === null || left > 0) && (
          <p className="flex shrink-0 items-baseline gap-1.5 font-extrabold tabular-nums" aria-live="off">
            <Unit value={left === null ? "–" : days} label={plural(days, "dzień", "dni", "dni")} />
            <Unit value={left === null ? "–" : hours} label={plural(hours, "godzina", "godziny", "godzin")} />
            <span className="hidden sm:contents">
              <Unit value={left === null ? "–" : minutes} label="min" />
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number | string; label: string }) {
  return (
    <span className="flex items-baseline gap-1 rounded-lg bg-white/10 px-2 py-0.5">
      <span className="text-sm sm:text-base">{value}</span>
      <span className="text-[11px] font-bold text-white/60 sm:text-xs">{label}</span>
    </span>
  );
}
