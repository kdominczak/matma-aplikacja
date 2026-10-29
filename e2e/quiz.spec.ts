// Przebieg testu działu: wybór odpowiedzi (wymieszanych na ekranie), sprawdzenie, informacja zwrotna, wynik.
import { expect, test } from "@playwright/test";
import { freshProgress, storageInit } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

test("test działu: każda odpowiedź dostaje ocenę, a na końcu jest wynik", async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(freshProgress(), "light");
  await page.addInitScript((data) => {
    localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
    localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
  }, init);

  await page.goto("/dzial/potegi-i-pierwiastki/test/podstawowy/");
  for (let i = 0; i < 3; i++) {
    // pierwsza odpowiedź na ekranie (litera „A” – po wymieszaniu to dowolna litera z danych)
    await page.locator("main button").filter({ hasText: /^A/ }).first().click();
    await page.getByRole("button", { name: "Sprawdź odpowiedź" }).click();
    // informacja zwrotna podaje literę z ekranu
    await expect(page.getByText(/Dobrze!|Poprawna odpowiedź: [A-D]/).first()).toBeVisible();
    const next = page.getByRole("button", { name: /Dalej|Zobacz wynik/ });
    if (!(await next.isVisible())) break; // skończyły się serca
    await next.click();
  }
  await expect(page.getByText(/\d\s*\/\s*3|z 3/).first()).toBeVisible();
});
