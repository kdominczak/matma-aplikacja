"use client";

import { useId, useState } from "react";
import { showPremiumUnlocked } from "@/components/premium/PremiumUnlockedModal";
import Icon from "@/components/ui/Icon";
import { formatPremiumUntil, redeemCode } from "@/lib/premium";

type Props = {
  /** Zwinięte do linku „Masz kod Premium?” – przy blokadach (paywall), żeby nie zasłaniać głównej drogi. */
  collapsed?: boolean;
  className?: string;
};

/**
 * Pole „Masz kod?” – kod od znajomego (6 znaków) albo podarunkowy / z przedsprzedaży (12 znaków).
 * Rodzaj rozpoznaje `redeemCode()`, dni i datę końca Premium zwraca serwer. Po sukcesie złoty ekran z konfetti
 * (`showPremiumUnlocked` – wyświetla go root layout, więc zostaje, nawet gdy blokada z polem zniknie),
 * a po jego zamknięciu zostaje zielone potwierdzenie.
 */
export default function RedeemCodeForm({ collapsed = false, className = "" }: Props) {
  const inputId = useId();
  const [open, setOpen] = useState(!collapsed);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: true; until: Date; days: number } | { ok: false; error: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    const outcome = await redeemCode(input);
    setBusy(false);
    if ("until" in outcome) {
      setInput("");
      setResult({ ok: true, ...outcome });
      showPremiumUnlocked(outcome);
    } else {
      setResult({ ok: false, error: outcome.error });
    }
  }

  if (result?.ok) {
    return (
      <div role="status" className={`flex animate-pop items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 ${className}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <Icon name="checkCircle" className="h-6 w-6" />
        </span>
        <div>
          <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
            Kod przyjęty! Masz {result.days} {result.days === 1 ? "dzień" : "dni"} Premium
          </p>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">Premium do {formatPremiumUntil(result.until)}.</p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-brand hover:underline ${className}`}
      >
        <Icon name="star" className="h-4 w-4" />
        Masz kod Premium? Wpisz go
      </button>
    );
  }

  return (
    <form onSubmit={submit} className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-bold text-ink">
        Masz kod?
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          maxLength={16}
          autoFocus={collapsed}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="np. K7MP2Q"
          aria-describedby={`${inputId}-hint`}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 font-mono text-base font-bold tracking-[0.12em] text-ink uppercase outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={busy || input.replace(/[^A-Za-z0-9]/g, "").length < 6}
          className="min-h-12 shrink-0 rounded-2xl bg-ink px-5 font-bold text-surface transition-opacity disabled:opacity-40"
        >
          {busy ? "Sprawdzam…" : "Wpisz"}
        </button>
      </div>
      <p id={`${inputId}-hint`} className="text-xs text-muted">
        Kod od znajomego (6 znaków) albo podarunkowy / z przedsprzedaży (12 znaków).
      </p>
      {result && !result.ok && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {result.error}
        </p>
      )}
    </form>
  );
}
