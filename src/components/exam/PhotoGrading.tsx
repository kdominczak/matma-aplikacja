"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import RichText from "@/components/ui/RichText";
import { gradeSolution, transcribeSolution } from "@/lib/ai";
import type { Grading } from "@/lib/ai-grading";
import { MAX_IMAGES, prepareImage } from "@/lib/attachments";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import { isPremium, PremiumRequiredError, usePremium } from "@/lib/premium";
import type { OpenQuestion } from "@/types/quiz";
import type { Level } from "@/types/topic";

type Phase =
  | { name: "idle" }
  | { name: "reading" } // przygotowanie zdjęć + przepisywanie
  | { name: "edit"; text: string }
  | { name: "grading"; text: string }
  | { name: "done" };

/**
 * Ocena ze zdjęcia (Premium): zdjęcie kartki → przepisany tekst (uczeń poprawia błędy odczytu) → ocena AI według
 * schematu → punkty i uzasadnienia przy krokach (`onGraded`). Bez Premium – zaproszenie do Premium.
 * Odczyt pisma bywa błędny, dlatego uczeń zawsze widzi i zatwierdza tekst, który oceniamy.
 */
export default function PhotoGrading({ task, level, onGraded }: { task: OpenQuestion; level: Level; onGraded: (grading: Grading) => void }) {
  const premium = usePremium();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [error, setError] = useState<{ text: string; upsell?: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);

  if (premium.status === "unavailable") return null;
  const active = isPremium(premium);
  const left = Math.max(0, premium.gradingLimit - premium.gradingUsed);

  if (!active || error?.upsell) {
    return (
      <Link href="/premium" className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-3 text-sm font-bold text-brand">
        <Icon name="camera" className="h-5 w-5 shrink-0" />
        <span className="min-w-0 flex-1">
          Ocena ze zdjęcia z AI – Premium
          <span className="block text-xs font-semibold text-brand/80">Robisz zdjęcie kartki, a korepetytor przyznaje punkty za kroki jak egzaminator.</span>
        </span>
        <Icon name="chevron" className="h-4 w-4 shrink-0" />
      </Link>
    );
  }

  function fail(e: unknown) {
    if (abort.current?.signal.aborted) return;
    if (e instanceof PremiumRequiredError) setError({ text: e.message, upsell: true });
    else setError({ text: e instanceof Error ? e.message : "Coś poszło nie tak. Spróbuj ponownie." });
  }

  async function readPhotos(files: File[]) {
    if (files.length === 0) return;
    hapticTap();
    setError(null);
    setPhase({ name: "reading" });
    abort.current = new AbortController();
    try {
      const images = await Promise.all(files.slice(0, MAX_IMAGES).map((f) => prepareImage(f, f.name)));
      const text = await transcribeSolution(
        images.map((i) => i.dataUrl),
        abort.current.signal,
      );
      if (text === null) {
        setError({ text: "Na zdjęciu nie widać rozwiązania. Zrób zdjęcie kartki z bliska, przy dobrym świetle." });
        setPhase({ name: "idle" });
        return;
      }
      setPhase({ name: "edit", text });
    } catch (e) {
      fail(e);
      setPhase({ name: "idle" });
    }
  }

  async function grade(text: string) {
    hapticTap();
    setError(null);
    setPhase({ name: "grading", text });
    abort.current = new AbortController();
    try {
      const grading = await gradeSolution(task, text, { level, signal: abort.current.signal });
      if (!grading) {
        setError({ text: "Nie udało się odczytać oceny. Spróbuj jeszcze raz albo zaznacz kroki samodzielnie." });
        setPhase({ name: "edit", text });
        return;
      }
      hapticSuccess();
      onGraded(grading);
      setPhase({ name: "done" });
    } catch (e) {
      fail(e);
      setPhase({ name: "edit", text });
    }
  }

  const busy = phase.name === "reading" || phase.name === "grading";
  const quota = (
    <span className="text-xs font-semibold text-muted">
      {left > 0 ? `Ocen na dziś: ${left}` : "Limit ocen na dziś wykorzystany"}
    </span>
  );

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-brand/20 bg-brand-soft/50 p-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void readPhotos([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />

      {(phase.name === "idle" || phase.name === "done" || phase.name === "reading") && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy || left === 0}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand shadow-float active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
          >
            <Icon name="camera" className="h-4 w-4" />
            {phase.name === "reading" ? "Odczytuję kartkę…" : phase.name === "done" ? "Oceń inne zdjęcie" : "Oceń ze zdjęcia (AI)"}
          </button>
          {quota}
        </div>
      )}

      {(phase.name === "edit" || phase.name === "grading") && (
        <>
          <label htmlFor={`photo-text-${task.id}`} className="text-xs font-extrabold uppercase tracking-widest text-brand">
            Tak odczytaliśmy Twoją kartkę – popraw błędy odczytu
          </label>
          <textarea
            id={`photo-text-${task.id}`}
            value={phase.text}
            disabled={phase.name === "grading"}
            onChange={(e) => setPhase({ name: "edit", text: e.target.value })}
            rows={Math.min(10, Math.max(4, phase.text.split("\n").length + 1))}
            className="w-full rounded-xl border border-line bg-surface p-3 font-mono text-sm text-ink focus:border-brand focus:outline-none"
          />
          <div className="rounded-xl bg-card p-3 text-sm">
            <p className="mb-1 text-xs font-extrabold uppercase tracking-widest text-faint">Podgląd</p>
            <RichText text={phase.text} className="text-body" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => void grade(phase.text)}
              disabled={phase.name === "grading" || !phase.text.trim()}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand shadow-float active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              <Icon name="sparkles" className="h-4 w-4" />
              {phase.name === "grading" ? "Oceniam według schematu…" : "Oceń według schematu"}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={phase.name === "grading"}
              className="min-h-11 rounded-xl px-3 text-sm font-bold text-muted hover:text-ink disabled:text-faint"
            >
              Inne zdjęcie
            </button>
            {quota}
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error.text}
        </p>
      )}
    </div>
  );
}
