"use client";

import { useCloseOnBack } from "@/lib/back-button";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import type { ScratchItem, ScratchTemplate } from "@/components/scratch/ScratchBoard";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Icon from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { hapticTap } from "@/lib/haptics";
import type { FormulaGroup } from "@/types/topic";

// Brudnopis (kanwa, bryły 3D, kalkulator) to osobna paczka – treść zadania i odpowiedzi pojawiają się bez czekania na nią.
const ScratchBoard = dynamic(() => import("@/components/scratch/ScratchBoard"), {
  ssr: false,
  loading: () => <Skeleton className="h-[22rem] rounded-3xl" />,
});

type Props = {
  prompt: string;
  items: ScratchItem[];
  onChange: (items: ScratchItem[]) => void;
  template: ScratchTemplate;
  onTemplateChange: (template: ScratchTemplate) => void;
  formulaGroups: FormulaGroup[];
};

const noop = () => () => {};

/** Szeroki ekran (Tailwind `lg`) – tam brudnopis stoi obok zadania; na telefonie tylko pełny ekran. */
const DESKTOP = "(min-width: 64rem)";
function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Dolny pasek ekranu (np. „Sprawdź”, „Następne”) – pływający przycisk brudnopisu stoi nad nim. */
const BOTTOM_BAR_ATTR = "data-bottom-bar";

/** Wysokość widocznych dolnych pasków ekranu – na bieżąco (pasek po sprawdzeniu odpowiedzi rośnie). */
function useBottomBarHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const measure = () => {
      const bars = [...document.querySelectorAll<HTMLElement>(`[${BOTTOM_BAR_ATTR}]`)];
      setHeight(Math.max(0, ...bars.map((b) => b.getBoundingClientRect().height)));
    };
    // paski pojawiają się i znikają razem ze stanem zadania („Sprawdź” → „Następne”) – obserwujemy wysokość
    // obecnych i co klatkę po zmianie drzewa szukamy nowych
    const resize = new ResizeObserver(measure);
    const observeAll = () => document.querySelectorAll(`[${BOTTOM_BAR_ATTR}]`).forEach((b) => resize.observe(b));
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        observeAll();
        measure();
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    observeAll();
    measure();
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resize.disconnect();
    };
  }, []);
  return height;
}

/** Czy klawiatura ekranowa jest wysunięta (widok wyraźnie niższy od ekranu) – wtedy pływający przycisk zasłaniałby pole i klawisze. */
function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
const keyboardOpen = () => window.innerHeight < window.screen.height * 0.72;

/**
 * Brudnopis przy zadaniu: na komputerze zawsze widoczny obok treści; na telefonie pływający przycisk
 * (zawsze w zasięgu kciuka, bez przewijania) otwiera go od razu na pełnym ekranie. Te same notatki w obu.
 */
export default function TaskScratch(props: Props) {
  const [full, setFull] = useState(false);
  // portal tylko w przeglądarce (static export – przy prerenderze nie ma document)
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP).matches, () => false);
  const barHeight = useBottomBarHeight();
  const typing = useSyncExternalStore(subscribeResize, keyboardOpen, () => false);
  useCloseOnBack(() => setFull(false), full);

  return (
    <>
      {desktop && (
        // awaria brudnopisu (np. canvas) nie blokuje rozwiązywania zadania
        <ErrorBoundary>
          <ScratchBoard variant="inline" {...props} onExpand={() => setFull(true)} />
        </ErrorBoundary>
      )}

      {mounted &&
        !desktop &&
        !full &&
        !typing &&
        createPortal(
          <button
            onClick={() => {
              hapticTap();
              setFull(true);
            }}
            style={{ bottom: `calc(${barHeight}px + 0.75rem${barHeight ? "" : " + env(safe-area-inset-bottom)"})` }}
            className="press fixed right-4 z-30 flex min-h-12 animate-fade-in items-center gap-2 rounded-full border border-white/15 bg-navy py-2.5 pr-4 pl-3.5 text-sm font-bold text-white shadow-float"
          >
            <span className="relative">
              <Icon name="pencil" className="h-5 w-5 text-[#d4af37]" />
              {props.items.length > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#d4af37] ring-2 ring-navy" aria-label="masz notatki" />}
            </span>
            Brudnopis
          </button>,
          document.body,
        )}

      {full && (
        <ErrorBoundary>
          <ScratchBoard variant="full" {...props} onClose={() => setFull(false)} />
        </ErrorBoundary>
      )}
    </>
  );
}
