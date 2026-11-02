// Korepetytor: bez konta – logowanie na miejscu; z kontem – start od zadania ucznia (zdjęcie / wklejenie / Twoje
// zadania), tryby pomocy, pole rośnie z tekstem. Zrzuty do screenshots/korepetytor-*.png.
import { expect, test, type Page } from "@playwright/test";
import { activeProgress, signedInSession, storageInit } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

async function open(page: Page, signedIn: boolean) {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(activeProgress(), "dark");
  const session = signedIn ? signedInSession() : null;
  await page.addInitScript(
    ({ data, session }) => {
      localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
      localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
      localStorage.setItem("theme", data.theme);
      if (session) localStorage.setItem(session.key, session.value);
    },
    { data: init, session },
  );
  await page.goto("/korepetytor/");
}

test("bez konta: zamiast pola wiadomości logowanie (AI działa na koncie)", async ({ page }) => {
  test.skip(!signedInSession(), "build bez Supabase – korepetytor wyłączony");
  await open(page, false);
  await expect(page.getByRole("region", { name: /Zaloguj się, żeby pisać do korepetytora/ })).toBeVisible();
  await expect(page.getByLabel("Wiadomość do korepetytora")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Wyślij kod na e-mail|Zaloguj się/ }).first()).toBeVisible();
  await page.screenshot({ path: "screenshots/korepetytor-bez-konta.png", fullPage: true });
});

test("z kontem: ekran startowy, tryby pomocy i długie zadanie bez ucinania", async ({ page }) => {
  test.skip(!signedInSession(), "build bez Supabase – korepetytor wyłączony");
  await open(page, true);

  await expect(page.getByRole("button", { name: /Zrób zdjęcie zadania/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Z galerii albo PDF/ })).toBeVisible();
  await expect(page.getByText("Wytłumacz deltę")).toHaveCount(0);
  await page.screenshot({ path: "screenshots/korepetytor-start.png", fullPage: true });

  // „Twoje zadania” wklejają treść i ustawiają tryb
  const suggestion = page.getByText("Twoje zadania");
  if (await suggestion.isVisible()) {
    await page.getByRole("button", { name: /Pudełko porażek|zad\. \d|Najsłabszy dział/ }).first().click();
    await expect(page.getByLabel("Wiadomość do korepetytora")).not.toHaveValue("");
  }

  await page.getByRole("radio", { name: "Sprawdź moje" }).click();
  await expect(page.getByRole("radio", { name: "Sprawdź moje" })).toHaveAttribute("aria-checked", "true");

  const input = page.getByLabel("Wiadomość do korepetytora");
  await input.fill("Rozwiąż nierówność x^2 - 5x + 4 <= 0.\nMoje rozwiązanie:\ndelta = 9\nx1 = 1, x2 = 4\nx należy do <1, 4>\nSuma liczb całkowitych = 10");
  const height = await input.evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeGreaterThan(100); // 6 linii widać od razu
  await page.screenshot({ path: "screenshots/korepetytor-pisanie.png" });
});
