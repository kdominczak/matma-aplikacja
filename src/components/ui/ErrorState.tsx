"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

type Props = {
  title?: string;
  message?: string;
  /** Ponowienie; może zwrócić Promise – przycisk pokazuje wtedy „Łączę…”. */
  onRetry?: () => unknown;
  /** Mniejsza wersja do wnętrza karty (np. tabela rankingu), zamiast pełnego bloku. */
  compact?: boolean;
  /** Przycisk zamknięcia (np. w powiadomieniu). */
  onDismiss?: () => void;
  className?: string;
};

/** Czy błąd wygląda na brak internetu (wtedy inna ikona i podpowiedź). */
function offline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Estetyczny stan błędu z przyciskiem „Spróbuj ponownie” – zamiast białego ekranu albo „undefined”. */
export default function ErrorState({ title, message, onRetry, compact = false, onDismiss, className = "" }: Props) {
  const [busy, setBusy] = useState(false);
  const noNetwork = offline();
  const heading = title ?? (noNetwork ? "Brak połączenia z internetem" : "Coś poszło nie tak");
  const text =
    message ?? (noNetwork ? "Połącz się z siecią i spróbuj ponownie. Twój postęp jest bezpieczny na urządzeniu." : "Serwer nie odpowiada. Spróbuj ponownie za chwilę.");

  async function retry() {
    if (!onRetry || busy) return;
    setBusy(true);
    try {
      await onRetry();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      role="alert"
      className={`relative flex animate-fade-in flex-col items-center gap-3 rounded-3xl border border-line glass-card text-center shadow-card ${
        compact ? "p-5" : "p-8"
      } ${className}`}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Zamknij"
          className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-full text-faint hover:text-ink"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      )}
      <span className={`flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 ${compact ? "h-11 w-11" : "h-14 w-14"}`}>
        <Icon name={noNetwork ? "wifiOff" : "alert"} className={compact ? "h-6 w-6" : "h-7 w-7"} />
      </span>
      <div>
        <h2 className={`font-extrabold text-ink ${compact ? "" : "text-lg"}`}>{heading}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={() => void retry()}
          disabled={busy}
          className="mt-1 flex min-h-11 items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark disabled:opacity-70"
        >
          <Icon name="refresh" className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          {busy ? "Łączę…" : "Spróbuj ponownie"}
        </button>
      )}
    </section>
  );
}
