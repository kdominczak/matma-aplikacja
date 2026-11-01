"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { celebrate } from "@/lib/celebrate";
import { hapticSuccess } from "@/lib/haptics";
import { AI_PREMIUM_DAILY_LIMIT, formatPremiumUntil, GRADING_DAILY_LIMIT } from "@/lib/premium";

/** Złote konfetti zamiast domyślnej tęczy. */
const GOLD = ["#d4af37", "#f3e3a1", "#b8962c", "#ffffff"];

const FEATURES: { icon: IconName; text: string }[] = [
  { icon: "sparkles", text: `Korepetytor AI – do ${AI_PREMIUM_DAILY_LIMIT} wiadomości dziennie` },
  { icon: "camera", text: `Ocena rozwiązań ze zdjęcia – do ${GRADING_DAILY_LIMIT} dziennie` },
  { icon: "bulb", text: "Wyjaśnienie każdego błędu i podpowiedzi krok po kroku" },
];

type Unlocked = {
  /** Ile dni Premium dał kod. */
  days: number;
  /** Koniec Premium – data z serwera (redeem_referral / redeem_gift_code), nie liczona w aplikacji. */
  until: Date;
};

type Props = Unlocked & { onClose: () => void };

// Ekran sukcesu żyje poza polem kodu: pole przy blokadzie (np. ocena zdjęć) znika, gdy tylko Premium się włączy,
// a złoty ekran ma zostać. Pole woła showPremiumUnlocked(), wyświetla go PremiumUnlockedHost z głównego layoutu.
let shown: Unlocked | null = null;
const listeners = new Set<() => void>();

function setShown(next: Unlocked | null) {
  shown = next;
  listeners.forEach((l) => l());
}

export function showPremiumUnlocked(unlocked: Unlocked) {
  setShown(unlocked);
}

/** Jedno miejsce wyświetlania ekranu sukcesu – w root layoutcie (działa też w quizach i arkuszach poza AppShell). */
export function PremiumUnlockedHost() {
  const current = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => shown,
    () => null,
  );
  return current ? <PremiumUnlockedModal {...current} onClose={() => setShown(null)} /> : null;
}

/**
 * Sukces po wpisaniu kodu: grafitowo-złoty panel z listą odblokowanych funkcji i konfetti z obu stron
 * (`celebrate` pomija je, gdy uczeń wyłączył konfetti albo ma „ogranicz ruch”). Portal do `body` – nakładka nad wszystkim.
 */
export default function PremiumUnlockedModal({ days, until, onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    void hapticSuccess();
    closeRef.current?.focus();
    celebrate({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: GOLD });
    celebrate({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: GOLD });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center" role="dialog" aria-modal aria-labelledby={titleId}>
      {/* tło zamyka dotknięciem; dla czytnika ekranu i klawiatury jest jeden przycisk „Zamknij” (plus Escape) */}
      <button aria-hidden tabIndex={-1} onClick={onClose} className="absolute inset-0 animate-fade-in bg-slate-950/70 backdrop-blur-sm" />

      <div className="hero-surface relative isolate max-h-full w-full max-w-sm animate-pop overflow-y-auto rounded-3xl p-6 text-white">
        <div className="hero-light pointer-events-none absolute -top-16 left-1/2 -z-10 h-48 w-48 -translate-x-1/2" aria-hidden />

        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-float">
          <Icon name="crown" className="h-8 w-8" />
        </span>

        <p className="hero-label mt-5 text-center">Kod przyjęty</p>
        <h2
          id={titleId}
          className="mt-1 bg-linear-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-center text-3xl leading-tight font-extrabold text-transparent"
        >
          Premium odblokowane
        </h2>
        <p className="mt-2 text-center text-sm text-white/70">
          {days} {days === 1 ? "dzień" : "dni"} Premium – do {formatPremiumUntil(until)}
        </p>

        <ul className="mt-5 flex flex-col gap-2">
          {FEATURES.map((f) => (
            <li key={f.icon} className="hero-tile py-3 text-sm font-semibold">
              {/* `hero-tile` ustawia display: block – układ ikona + tekst w środku */}
              <span className="flex items-center gap-3">
                <Icon name={f.icon} className="h-5 w-5 shrink-0 text-brand" />
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/korepetytor"
            onClick={onClose}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cta font-bold text-on-cta shadow-float btn-hover btn-shine active:bg-cta-dark"
          >
            Wypróbuj korepetytora <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <button ref={closeRef} onClick={onClose} className="min-h-11 rounded-2xl font-bold text-white/60 transition-colors hover:text-white">
            Zamknij
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
