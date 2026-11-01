import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Drukowanie / zapis do PDF bieżącej strony (style `@media print`). WebView Androida nie obsługuje `window.print()`,
 * więc w aplikacji wołamy systemowy dialog druku przez własną wtyczkę (`android/…/PrintPlugin.java`) – stamtąd
 * „Zapisz jako PDF” albo drukarka. W przeglądarce: zwykłe `window.print()` (nazwa pliku PDF = tytuł strony).
 */
const NativePrint = registerPlugin<{ print(options: { name: string }): Promise<void> }>("Print");

export async function printPage(name: string): Promise<void> {
  if (Capacitor.getPlatform() === "android") {
    await NativePrint.print({ name });
    return;
  }
  const title = document.title;
  document.title = name;
  try {
    window.print();
  } finally {
    document.title = title;
  }
}
