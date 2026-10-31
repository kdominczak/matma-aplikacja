"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useNow } from "@/components/layout/Countdown";
import Icon, { type IconName } from "@/components/ui/Icon";
import { PLACEMENT } from "@/data/placement";
import { saveAppSettings } from "@/lib/app-settings";
import { hapticTap } from "@/lib/haptics";
import { daysToMatura } from "@/lib/matura";
import { plural } from "@/lib/plural";
import GoalSlider from "@/components/progress/GoalSlider";
import LevelPicker from "@/components/progress/LevelPicker";
import { setLevels, setTarget, skipPlacement } from "@/lib/progress";
import type { Level } from "@/types/topic";

/**
 * Powitanie nowego ucznia – cztery krótkie ekrany (ok. minuty): obietnica, Plan na dziś, brudnopis, cel i start.
 * Pokazywane raz, dopóki uczeń nie zrobi albo nie pominie testu na start (`needsPlacement`).
 * „Pomiń” na pierwszych ekranach przeskakuje do wyboru celu – decyzję o teście podejmuje się zawsze świadomie.
 */
export default function Welcome() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [target, setTargetChoice] = useState(30);
  const [levels, setLevelChoice] = useState<Level[]>(["podstawowy"]);
  const [targetExtended, setTargetExtended] = useState(30);
  const [closing, setClosing] = useState(false);
  const last = STEPS - 1;

  async function save() {
    if (name.trim()) await saveAppSettings({ name: name.trim().slice(0, 30) });
    await setLevels(levels);
    await setTarget(target);
    if (levels.includes("rozszerzony")) await setTarget(targetExtended, "rozszerzony");
  }

  async function skipTest() {
    hapticTap();
    setClosing(true);
    await save();
    await skipPlacement();
  }

  function next() {
    hapticTap();
    setStep((s) => Math.min(last, s + 1));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal
      aria-labelledby="welcome-title"
    >
      <div
        className={`relative flex max-h-dvh w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-card shadow-2xl transition-opacity sm:rounded-3xl ${
          closing ? "opacity-0" : "animate-slide-up sm:animate-pop"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-6 pt-5">
          <ol className="flex gap-1.5" aria-label={`Krok ${step + 1} z ${STEPS}`}>
            {Array.from({ length: STEPS }, (_, i) => (
              <li
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-brand" : i < step ? "w-1.5 bg-brand/50" : "w-1.5 bg-line"}`}
              />
            ))}
          </ol>
          {step < last && (
            <button onClick={() => setStep(last)} className="-my-2 min-h-11 px-2 text-sm font-bold text-muted hover:text-ink">
              Pomiń
            </button>
          )}
        </div>

        {/* key: każdy ekran wjeżdża od nowa */}
        <div key={step} className="flex-1 animate-fade-in overflow-y-auto px-6 pt-4 pb-2">
          {step === 0 && <PromiseSlide name={name} onName={setName} />}
          {step === 1 && <PlanSlide />}
          {step === 2 && <ScratchSlide />}
          {step === 3 && (
            <TargetSlide
              levels={levels}
              onLevels={setLevelChoice}
              target={target}
              onTarget={setTargetChoice}
              targetExtended={targetExtended}
              onTargetExtended={setTargetExtended}
            />
          )}
        </div>

        <div className="flex flex-col gap-2 px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {step < last ? (
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  aria-label="Wstecz"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line text-muted transition-colors hover:text-ink"
                >
                  <Icon name="back" className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={next}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-on-brand shadow-float btn-hover btn-shine active:bg-brand-dark"
              >
                Dalej <Icon name="arrow" className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/start"
                onClick={() => {
                  hapticTap();
                  void save();
                }}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-on-brand shadow-float btn-hover btn-shine active:bg-brand-dark"
              >
                Test na start · ok. 10 min <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <button
                onClick={skipTest}
                disabled={closing}
                className="min-h-11 rounded-2xl py-2 font-bold text-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                Pomiń test – zacznę od planu
              </button>
              <p className="text-center text-xs text-faint">Test zrobisz też później w Ustawieniach.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = 4;

function Title({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <>
      <p className="text-xs font-extrabold uppercase tracking-widest text-brand">{eyebrow}</p>
      <h2 id="welcome-title" className="mt-1 text-2xl leading-tight font-extrabold text-ink">
        {children}
      </h2>
    </>
  );
}

function Points({ items }: { items: { icon: IconName; text: string }[] }) {
  return (
    <ul className="mt-5 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.text} className="flex items-center gap-3 text-sm font-semibold text-body">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon name={item.icon} className="h-4 w-4" />
          </span>
          {item.text}
        </li>
      ))}
    </ul>
  );
}

// ── 1. Obietnica ──

function PromiseSlide({ name, onName }: { name: string; onName: (name: string) => void }) {
  const now = useNow();
  const days = now === null ? null : daysToMatura(now);
  return (
    <>
      <div className="relative mb-5 overflow-hidden rounded-3xl bg-navy p-5 text-white">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
        <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">Do matury z matematyki</p>
        <p className="relative mt-1 text-4xl font-extrabold tabular-nums">
          {days ?? "–"} <span className="text-lg text-white/70">{plural(days ?? 0, "dzień", "dni", "dni")}</span>
        </p>
        <p className="relative mt-1 text-sm text-white/70">To dużo czasu – jeśli wykorzystasz go regularnie.</p>
      </div>
      <Title eyebrow="Witaj w Matmie">15 minut dziennie wystarczy</Title>
      <p className="mt-2 text-sm text-muted">
        Codziennie układamy Ci krótki plan: dokładnie to, co da najwięcej punktów na maturze. Ty tylko klikasz „Zaczynamy”.
      </p>
      <label className="mt-5 block">
        <span className="text-sm font-bold text-ink">
          Jak masz na imię? <span className="font-semibold text-faint">(opcjonalnie)</span>
        </span>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          maxLength={30}
          autoComplete="given-name"
          placeholder="np. Ola"
          className="mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 py-3 font-bold text-ink outline-none focus:border-brand"
        />
        <span className="mt-1 block text-xs text-faint">Widzisz je tylko Ty – w powitaniu na ekranie głównym.</span>
      </label>
    </>
  );
}

// ── 2. Plan na dziś ──

function PlanSlide() {
  return (
    <>
      {/* miniatura karty planu z ekranu głównego */}
      <div aria-hidden className="relative mb-5 overflow-hidden rounded-3xl bg-navy p-5 text-white">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/60">Plan na dziś · ~15 min</p>
        <p className="mt-1 text-xl font-extrabold">Funkcja kwadratowa</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-200">2 powtórki</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">6 zadań · dział dnia</span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">2 dla odmiany</span>
        </div>
        <span className="mt-4 flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-bold text-on-brand">Zaczynamy →</span>
      </div>
      <Title eyebrow="Jak to działa">Plan na dziś myśli za Ciebie</Title>
      <Points
        items={[
          { icon: "target", text: "Dział dnia: tam, gdzie zyskasz najwięcej punktów" },
          { icon: "refresh", text: "Powtórki błędów wracają po 1, 3, 7 i 14 dniach – aż zapamiętasz" },
          { icon: "flame", text: "Codzienny plan buduje serię dni – nie przerwij jej" },
        ]}
      />
    </>
  );
}

// ── 3. Brudnopis ──

const TOOLS: { icon: IconName; label: string }[] = [
  { icon: "pencil", label: "Pisz" },
  { icon: "shapes", label: "Figury" },
  { icon: "angle", label: "Kąty" },
  { icon: "cone", label: "Bryły" },
  { icon: "calculator", label: "Kalkulator" },
  { icon: "book", label: "Wzory" },
];

function ScratchSlide() {
  return (
    <>
      <div aria-hidden className="mb-5 rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-bold text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
          <Icon name="pencil" className="h-4 w-4" />
          Brudnopis · kalkulator · wzory
          <Icon name="chevron" className="ml-auto h-4 w-4 rotate-90" />
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {TOOLS.map((tool) => (
            <span key={tool.label} className="flex flex-col items-center gap-1 rounded-xl bg-card py-2 text-[10px] font-bold text-muted">
              <Icon name={tool.icon} className="h-5 w-5 text-brand" />
              {tool.label}
            </span>
          ))}
        </div>
      </div>
      <Title eyebrow="Pod każdym zadaniem">Brudnopis jak kartka na maturze</Title>
      <Points
        items={[
          { icon: "shapes", text: "Figury i bryły jednym dotknięciem – kąty i długości same się przypinają" },
          { icon: "calculator", text: "Kalkulator i wzory z działu zawsze obok zadania" },
          { icon: "check", text: "Notatki zapisują się przy zadaniu – wrócisz do nich później" },
        ]}
      />
    </>
  );
}

// ── 4. Cel i start ──

function TargetSlide(props: {
  levels: Level[];
  onLevels: (levels: Level[]) => void;
  target: number;
  onTarget: (target: number) => void;
  targetExtended: number;
  onTargetExtended: (target: number) => void;
}) {
  const both = props.levels.length > 1;
  return (
    <>
      <Title eyebrow="Ostatni krok">Którą maturę zdajesz i na ile?</Title>
      <p className="mt-2 text-sm text-muted">
        Z celu wyliczymy działy, które są Ci potrzebne. Test na start ({PLACEMENT.length} zadań) sprawdzi, co już umiesz.
      </p>
      <div className="mt-4">
        <LevelPicker value={props.levels} onChange={props.onLevels} />
      </div>
      <div className="mt-4 flex flex-col gap-5 rounded-2xl border border-line p-4">
        <GoalSlider percent={props.target} onChange={props.onTarget} id="welcome-goal" debounceMs={0} showLevel={both} />
        {both && (
          <GoalSlider
            percent={props.targetExtended}
            onChange={props.onTargetExtended}
            id="welcome-goal-extended"
            debounceMs={0}
            level="rozszerzony"
            showLevel
          />
        )}
      </div>
    </>
  );
}
