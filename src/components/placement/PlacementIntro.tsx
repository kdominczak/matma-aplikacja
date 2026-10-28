"use client";

import { useState } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { PLACEMENT } from "@/data/placement";
import { hapticTap } from "@/lib/haptics";
import { skipPlacement } from "@/lib/progress";

const BENEFITS: { icon: IconName; text: string }[] = [
  { icon: "target", text: "Dobierzemy cel na maturze do Twojego poziomu" },
  { icon: "check", text: "Zaliczymy z góry to, co już umiesz – bez nudnych powtórek" },
  { icon: "archive", text: "Pomyłki trafią do Pudełka porażek, żeby je potem pokonać" },
];

/** Powitanie nowego ucznia: zaproszenie do testu na start z wyraźną opcją „Pomiń”. Pokazywane raz. */
export default function PlacementIntro() {
  const [closing, setClosing] = useState(false);

  async function skip() {
    setClosing(true);
    await skipPlacement();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal aria-labelledby="placement-title">
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-card shadow-2xl transition-opacity sm:rounded-3xl ${
          closing ? "opacity-0" : "animate-slide-up sm:animate-pop"
        }`}
      >
        <div className="relative overflow-hidden bg-navy px-6 pt-8 pb-6 text-white">
          <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-brand/40 blur-3xl" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <Icon name="graduation" className="h-8 w-8" />
          </span>
          <p className="relative mt-4 text-xs font-extrabold uppercase tracking-widest text-white/60">Witaj w Matmie!</p>
          <h2 id="placement-title" className="relative mt-1 text-2xl leading-tight font-extrabold">
            Sprawdźmy, od czego zacząć
          </h2>
          <p className="relative mt-2 text-sm text-white/70">
            Krótki test na start: {PLACEMENT.length} zadań przekrojowych, ok. 10 minut. Bez serc i bez stresu – liczy się
            szczerość, nie wynik.
          </p>
        </div>

        <div className="flex flex-col gap-5 px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <ul className="flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm font-semibold text-body">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon name={b.icon} className="h-4 w-4" />
                </span>
                {b.text}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2">
            <Link
              href="/start"
              onClick={() => hapticTap()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-float btn-hover btn-shine active:bg-brand-dark"
            >
              Rozpocznij test <Icon name="arrow" className="h-4 w-4" />
            </Link>
            <button onClick={skip} disabled={closing} className="rounded-2xl py-3 font-bold text-muted transition-colors hover:bg-subtle hover:text-ink">
              Pomiń – zacznę od razu
            </button>
          </div>
          <p className="-mt-2 text-center text-xs text-faint">Test możesz zrobić później w profilu.</p>
        </div>
      </div>
    </div>
  );
}
