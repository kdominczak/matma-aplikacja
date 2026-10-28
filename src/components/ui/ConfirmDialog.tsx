"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

type Props = {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Słowo, które trzeba przepisać, żeby odblokować przycisk – dla nieodwracalnych akcji. */
  confirmWord?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  /** „brand” – zwykła decyzja (np. zakończenie arkusza) zamiast czerwonej akcji niszczącej. */
  tone?: "danger" | "brand";
  icon?: IconName;
};

/** Modal potwierdzenia akcji niszczącej (np. reset postępów). */
export default function ConfirmDialog({ title, children, confirmLabel, confirmWord, onConfirm, onCancel, tone = "danger", icon = "alert" }: Props) {
  const brand = tone === "brand";
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const unlocked = !confirmWord || typed.trim().toUpperCase() === confirmWord.toUpperCase();

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  async function confirm() {
    if (!unlocked || busy) return;
    setBusy(true);
    await onConfirm();
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal aria-labelledby={titleId}>
      <button aria-label="Anuluj" onClick={onCancel} className="absolute inset-0 animate-fade-in bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-pop rounded-3xl border border-line glass-card p-6 shadow-2xl">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${brand ? "bg-brand-soft text-brand" : "bg-rose-500/15 text-rose-500"}`}>
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <h2 id={titleId} className="mt-4 text-xl font-extrabold text-ink">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-body">{children}</div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirm();
          }}
          className="mt-5 flex flex-col gap-3"
        >
          {confirmWord && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-muted">
              <span>
                Wpisz <strong className="font-extrabold text-ink">{confirmWord}</strong>, aby potwierdzić
              </span>
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="rounded-2xl border border-line bg-surface px-4 py-3 font-bold tracking-widest text-ink uppercase focus:border-rose-500 focus:outline-none"
              />
            </label>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-2xl bg-subtle py-3 font-bold text-body">
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!unlocked || busy}
              className={`min-h-11 flex-1 rounded-2xl py-3 font-bold text-white transition-colors disabled:bg-subtle disabled:text-faint ${
                brand ? "bg-brand active:bg-brand-dark" : "bg-rose-500 active:bg-rose-600"
              }`}
            >
              {busy ? "Chwila…" : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
