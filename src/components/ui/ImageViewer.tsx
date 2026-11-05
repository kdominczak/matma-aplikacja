"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/Icon";
import { useCloseOnBack } from "@/lib/back-button";

type Props = {
  src: string;
  alt: string;
  onClose: () => void;
};

/** Zdjęcie na cały ekran (portal do `body`); stuknięcie w zdjęcie przybliża 2×, a przybliżone można przesuwać. */
export default function ImageViewer({ src, alt, onClose }: Props) {
  useCloseOnBack(onClose);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal aria-label={alt} className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-slate-950/95">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2 text-white">
        <p className="text-sm font-semibold text-white/70">{zoomed ? "Stuknij, żeby oddalić" : "Stuknij, żeby przybliżyć"}</p>
        <button onClick={onClose} aria-label="Zamknij podgląd" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <Icon name="close" className="h-6 w-6" />
        </button>
      </div>
      <div
        className={`flex min-h-0 flex-1 overflow-auto pb-[env(safe-area-inset-bottom)] ${zoomed ? "" : "items-center justify-center"}`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- lokalny data URL */}
        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          className={zoomed ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain"}
          style={zoomed ? { width: "200%" } : undefined}
        />
      </div>
    </div>,
    document.body,
  );
}
