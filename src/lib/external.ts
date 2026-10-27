import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

// Otwieramy wyłącznie adresy https z zaufanych domen – link z danych nie przeniesie ucznia nigdzie indziej.
const TRUSTED_HOSTS = ["cke.gov.pl", "console.groq.com"];

export function isTrustedUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && TRUSTED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

/**
 * W aplikacji natywnej: przeglądarka systemowa w aplikacji (Custom Tabs / SFSafariViewController) –
 * uczeń wraca jednym gestem. W przeglądarce: nowa karta.
 */
export async function openExternal(url: string) {
  if (!isTrustedUrl(url)) return;
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
