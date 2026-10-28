import { useSyncExternalStore } from "react";

// Stan połączenia z internetem (navigator.onLine + zdarzenia online/offline).

function subscribe(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

/** `true`, gdy urządzenie ma sieć; podczas prerenderu zakładamy, że ma. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
