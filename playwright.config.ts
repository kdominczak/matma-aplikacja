import { defineConfig } from "@playwright/test";

// Zrzuty ekranu i testy E2E na zbudowanej aplikacji (out/). Najpierw `npm run build`.
// `npm run screens` – zrzuty wszystkich ekranów (telefon/komputer, jasny/ciemny) do screenshots/.
export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    // stabilne zrzuty: bez animacji, polski język, stała strefa czasowa
    reducedMotion: "reduce",
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
  },
  webServer: {
    command: "node scripts/serve-out.mjs 4173",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
