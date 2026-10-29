// Zrzuty wszystkich ekranów: telefon (375 px) i komputer, jasny i ciemny motyw, uczeń aktywny i nowy.
// Wynik: screenshots/<stan>-<urządzenie>-<motyw>/<ekran>.png – do przeglądu wyglądu (także przez Claude).
// Sieć do Supabase i Groq jest zablokowana: zrzuty nie dotykają prawdziwej bazy ani AI.
import { test, type Page } from "@playwright/test";
import { activeProgress, freshProgress, storageInit, type Theme } from "./fixtures";

const SCREENS: [string, string][] = [
  ["glowna", "/"],
  ["plan", "/plan/"],
  ["zadania", "/zadania/"],
  ["zadania-ciagi", "/zadania/ciagi/"],
  ["dzial-potegi", "/dzial/potegi-i-pierwiastki/"],
  ["nie-ma-strony", "/nie-ma-takiej-strony/"],
  ["test", "/dzial/potegi-i-pierwiastki/test/podstawowy/"],
  ["wzory", "/wzory/"],
  ["arkusze", "/arkusze/"],
  ["arkusz", "/arkusz/probny-1/"],
  ["bledy", "/bledy/"],
  ["korepetytor", "/korepetytor/"],
  ["ranking", "/ranking/"],
  ["odznaki", "/odznaki/"],
  ["profil", "/profil/"],
  ["ustawienia", "/ustawienia/"],
  ["start", "/start/"],
  ["wyzwanie", "/wyzwanie/"],
  ["prywatnosc", "/prywatnosc/"],
];

const DEVICES = {
  telefon: { width: 375, height: 812 },
  komputer: { width: 1440, height: 900 },
} as const;

/** Ekrany, na których stan „nowy uczeń” wygląda inaczej (puste stany). */
const FRESH_SCREENS = new Set(["glowna", "plan", "bledy", "profil", "odznaki", "ranking", "arkusze"]);

async function prepare(page: Page, progress: object, theme: Theme) {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(progress, theme);
  await page.addInitScript((data) => {
    localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
    localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
    localStorage.setItem("theme", data.theme);
  }, init);
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
}

async function shoot(page: Page, path: string, file: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle").catch(() => {});
  // czas na wczytanie postępu (Preferences), wykresów i czcionek
  await page.waitForTimeout(700);
  await page.screenshot({ path: file, fullPage: true });
  // na telefonie także kolejne ekrany po przewinięciu – tak, jak widzi je uczeń (z dolnym paskiem)
  const { width, height: screen } = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  if (width > 500) return;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = screen - 120;
  for (let i = 0, y = 0; y < height && i < 8; i++, y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(150);
    await page.screenshot({ path: file.replace(/\.png$/, `.${i + 1}.png`) });
  }
}

for (const [deviceName, viewport] of Object.entries(DEVICES)) {
  for (const theme of ["light", "dark"] as const) {
    test.describe(`${deviceName} · ${theme}`, () => {
      test.use({ viewport });

      for (const [name, path] of SCREENS) {
        test(`aktywny · ${name}`, async ({ page }) => {
          await prepare(page, activeProgress(), theme);
          await shoot(page, path, `screenshots/aktywny-${deviceName}-${theme}/${name}.png`);
        });
        if (FRESH_SCREENS.has(name)) {
          test(`nowy · ${name}`, async ({ page }) => {
            await prepare(page, freshProgress(), theme);
            await shoot(page, path, `screenshots/nowy-${deviceName}-${theme}/${name}.png`);
          });
        }
      }
    });
  }
}
