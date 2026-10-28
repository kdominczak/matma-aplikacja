"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { evaluate, formatNumber } from "@/lib/calc";

// Prosty kalkulator – taki, jaki CKE dopuszcza na maturze podstawowej (4 działania, %, √, potęga, π).
const KEYS: { label: string; insert?: string; action?: "clear" | "back" | "equals" | "sign"; wide?: boolean; tone?: "op" | "fn" | "eq" }[] = [
  { label: "C", action: "clear", tone: "fn" },
  { label: "⌫", action: "back", tone: "fn" },
  { label: "(", insert: "(", tone: "fn" },
  { label: ")", insert: ")", tone: "fn" },
  { label: "÷", insert: "÷", tone: "op" },
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "√", insert: "√", tone: "fn" },
  { label: "×", insert: "×", tone: "op" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "xʸ", insert: "^", tone: "fn" },
  { label: "−", insert: "−", tone: "op" },
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "π", insert: "π", tone: "fn" },
  { label: "+", insert: "+", tone: "op" },
  { label: "±", action: "sign", tone: "fn" },
  { label: "0", insert: "0" },
  { label: ",", insert: "," },
  { label: "%", insert: "%", tone: "fn" },
  { label: "=", action: "equals", tone: "eq" },
];

type Props = {
  onInsert: (text: string) => void;
  onClose: () => void;
};

export default function Calculator({ onInsert, onClose }: Props) {
  const [expr, setExpr] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  let preview: string | null = null;
  let error: string | null = null;
  if (expr.trim()) {
    try {
      preview = formatNumber(evaluate(expr));
    } catch (e) {
      error = (e as Error).message;
    }
  }

  function press(key: (typeof KEYS)[number]) {
    if (key.insert) setExpr((e) => e + key.insert);
    else if (key.action === "clear") {
      setExpr("");
      setLastResult(null);
    } else if (key.action === "back") setExpr((e) => e.slice(0, -1));
    else if (key.action === "sign") setExpr((e) => (e.startsWith("−(") && e.endsWith(")") ? e.slice(2, -1) : e ? `−(${e})` : "−"));
    else if (key.action === "equals" && preview !== null) {
      setLastResult(`${expr} = ${preview}`);
      setExpr(preview);
    }
  }

  const tone = { op: "bg-brand-soft text-brand", fn: "bg-subtle text-body", eq: "bg-brand text-white", none: "bg-card text-ink border border-line" };

  return (
    <div className="w-64 rounded-3xl border border-line glass-card p-3 shadow-2xl" role="dialog" aria-label="Kalkulator">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-widest text-faint">Kalkulator</p>
        <button onClick={onClose} aria-label="Zamknij kalkulator" className="rounded-full p-1 text-faint hover:text-ink">
          <Icon name="close" className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl bg-surface px-3 py-2 text-right">
        <p className="h-4 truncate text-[11px] text-faint">{lastResult ?? ""}</p>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") press({ label: "=", action: "equals" });
          }}
          inputMode="none"
          aria-label="Działanie"
          placeholder="0"
          className="w-full bg-transparent text-right text-xl font-bold text-ink tabular-nums placeholder:text-faint focus:outline-none"
        />
        <p className={`h-5 truncate text-sm font-semibold tabular-nums ${error ? "text-rose-500" : "text-muted"}`}>
          {error ? "" : preview !== null && preview !== expr ? `= ${preview}` : ""}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {KEYS.map((key) => (
          <button
            key={key.label}
            onClick={() => press(key)}
            className={`h-10 rounded-xl text-base font-bold transition-transform active:scale-95 ${tone[key.tone ?? "none"]}`}
          >
            {key.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => preview !== null && onInsert(preview)}
        disabled={preview === null}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-sm font-bold text-brand transition-colors hover:border-brand/40 disabled:opacity-40"
      >
        <Icon name="pencil" className="h-4 w-4" />
        Wstaw wynik na kartkę
      </button>
    </div>
  );
}
