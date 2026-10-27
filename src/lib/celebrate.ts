import confetti, { type Options } from "canvas-confetti";
import { appSettings } from "@/lib/app-settings";

/** Konfetti na ekranach wyniku – do wyłączenia w Ustawieniach (i pomijane przy ograniczeniu ruchu). */
export function celebrate(options: Options) {
  if (!appSettings().confetti) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  void confetti(options);
}
