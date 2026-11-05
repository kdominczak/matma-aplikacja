import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";

// Systemowy przycisk „wstecz” na Androidzie. Bez obsługi zamykał aplikację z każdego ekranu.
// Kolejność: najpierw zamyka otwartą nakładkę (panel, okno, brudnopis), potem wraca do poprzedniego ekranu;
// aplikację zamyka dopiero na ekranie głównym.

export type BackAction = "overlay" | "history" | "home" | "exit";

export function decideBack({ overlays, path, canGoBack }: { overlays: number; path: string; canGoBack: boolean }): BackAction {
  if (overlays > 0) return "overlay";
  if (path === "/" || path === "/index.html") return "exit";
  return canGoBack ? "history" : "home";
}

/** Otwarte nakładki, ostatnia na wierzchu. */
const overlays: (() => void)[] = [];

/** Póki nakładka jest otwarta (`active`), „wstecz” ją zamyka zamiast opuszczać ekran. */
export function useCloseOnBack(onClose: () => void, active = true) {
  const latest = useRef(onClose);
  useEffect(() => {
    latest.current = onClose;
  });
  useEffect(() => {
    if (!active) return;
    const close = () => latest.current();
    overlays.push(close);
    return () => {
      overlays.splice(overlays.lastIndexOf(close), 1);
    };
  }, [active]);
}

/** Podpina przycisk „wstecz” (tylko aplikacja na telefonie). Zwraca funkcję sprzątającą. */
export function startBackButton(): () => void {
  if (!Capacitor.isNativePlatform()) return () => {};
  let stopped = false;
  let remove: (() => void) | undefined;
  void import("@capacitor/app")
    .then(async ({ App }) => {
      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        const action = decideBack({ overlays: overlays.length, path: window.location.pathname, canGoBack });
        if (action === "overlay") overlays[overlays.length - 1]();
        else if (action === "history") window.history.back();
        else if (action === "home") window.location.assign("/");
        else void App.exitApp();
      });
      if (stopped) void handle.remove();
      else remove = () => void handle.remove();
    })
    .catch((error) => console.warn("Przycisk wstecz:", error));
  return () => {
    stopped = true;
    remove?.();
  };
}
