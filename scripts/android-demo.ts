// Przykładowy postęp ucznia w aplikacji na emulatorze/telefonie – do pokazu: wypełniony wykres, plan, Pudełko porażek, wyniki arkuszy.
//   npm run android:demo            wgrywa dane z e2e/fixtures.ts (dotychczasowe zapisuje w kopii)
//   npm run android:demo -- --reset przywraca dane sprzed pokazu
// Wymaga: uruchomionej aplikacji w wersji debug (Android Studio ▶) i adb. Dane są zmyślone, więc odmawia na zalogowanym koncie –
// kopia w chmurze wysłałaby je na prawdziwe konto.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import { activeProgress, examAttempts } from "../e2e/fixtures";

const KEYS = ["progress.v2", "exam-attempts.v1"];
const BACKUP = join(tmpdir(), "matma-android-demo-kopia.json");
const ADB = process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Android", "Sdk", "platform-tools", "adb.exe") : "adb";

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof chromium.connectOverCDP>>["newPage"]>>;
const adb = (...args: string[]) => execFileSync(ADB, args).toString().trim();

/** Preferences przez most Capacitora działający w stronie (dane aplikacji natywnej nie leżą w localStorage). */
const prefs = (page: Page, action: "get" | "set" | "remove" | "keys", options: Record<string, string> = {}) =>
  page.evaluate(
    ([name, args]) => (window as unknown as { Capacitor: { Plugins: { Preferences: Record<string, (a: unknown) => Promise<{ value?: string | null; keys?: string[] }>> } } }).Capacitor.Plugins.Preferences[name as string](args),
    [action, options] as const,
  );

async function main() {
  const pid = adb("shell", "pidof", "pl.matma.app");
  if (!pid) throw new Error("Aplikacja nie działa – uruchom ją najpierw (Android Studio ▶).");
  adb("forward", "tcp:9222", `localabstract:webview_devtools_remote_${pid}`);
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  try {
    const page = browser.contexts()[0].pages()[0];
    if (process.argv.includes("--reset")) {
      if (!existsSync(BACKUP)) throw new Error("Brak kopii – nie ma czego przywracać.");
      const saved = JSON.parse(readFileSync(BACKUP, "utf8")) as Record<string, string | null>;
      for (const key of KEYS) {
        if (saved[key] === null) await prefs(page, "remove", { key });
        else await prefs(page, "set", { key, value: saved[key] });
      }
      rmSync(BACKUP);
      console.log("Przywrócono dane sprzed pokazu.");
    } else {
      const { keys = [] } = await prefs(page, "keys");
      if (keys.some((key) => key.includes("auth-token"))) throw new Error("Aplikacja jest zalogowana – zmyślony postęp trafiłby do kopii w chmurze. Wyloguj się albo pokaż prawdziwy postęp.");
      if (!existsSync(BACKUP)) {
        const saved: Record<string, string | null> = {};
        for (const key of KEYS) saved[key] = (await prefs(page, "get", { key })).value ?? null;
        writeFileSync(BACKUP, JSON.stringify(saved));
      }
      await prefs(page, "set", { key: KEYS[0], value: JSON.stringify(activeProgress()) });
      await prefs(page, "set", { key: KEYS[1], value: JSON.stringify(examAttempts()) });
      console.log("Wgrano przykładowy postęp. Cofnięcie: npm run android:demo -- --reset");
    }
    await page.evaluate(() => window.location.replace("/"));
  } finally {
    await browser.close();
    adb("forward", "--remove", "tcp:9222");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
