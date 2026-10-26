"use client";

import { useEffect, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Na telefonie panel wysuwany od dołu, na desktopie wyśrodkowane okno. */
export default function BottomSheet({ title, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center lg:justify-center lg:p-8" role="dialog" aria-modal aria-label={title}>
      <button aria-label="Zamknij" onClick={onClose} className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" />
      <div className="relative mx-auto flex max-h-[85dvh] w-full max-w-xl animate-slide-up flex-col rounded-t-3xl border border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl lg:max-w-3xl lg:animate-pop lg:rounded-3xl lg:pb-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-extrabold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Zamknij" className="rounded-full p-2 text-faint hover:bg-subtle hover:text-ink">
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
