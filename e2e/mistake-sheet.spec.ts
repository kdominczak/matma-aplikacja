// Arkusz poprawek z błędów: wejścia z Arkuszy i Pudełka porażek, rozwiązywanie w aplikacji, pusty stan.
import { expect, test, type Page } from "@playwright/test";
import { activeProgress, freshProgress, storageInit } from "./fixtures";

async function prepare(page: Page, progress: object) {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(progress, "light");
  await page.addInitScript((data) => {
    localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
    localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
    localStorage.setItem("theme", data.theme);
  }, init);
}

test("arkusz poprawek: z Arkuszy do rozwiązywania zadań w aplikacji", async ({ page }) => {
  await prepare(page, activeProgress());
  await page.goto("/arkusze/");
  await page.getByRole("link", { name: /Generuj mój arkusz poprawek/ }).click();

  await expect(page.getByRole("heading", { name: "Arkusz poprawek z błędów" })).toBeVisible();
  await page.getByRole("button", { name: "Rozwiąż arkusz" }).click();

  // ten sam ekran co zadania z działu: nawigator, odpowiedzi ABCD, sprawdzanie
  await expect(page.getByText("Arkusz poprawek", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Zadanie 1 / })).toBeVisible();
  await expect(page.getByText("Zadanie 1", { exact: true })).toBeVisible();
  await expect(page.getByText(/błęd(y|ów)?: \d|błąd: \d/).first()).toBeVisible();

  // zestaw jest zamrożony: po sprawdzeniu odpowiedzi (zapis zmienia Pudełko porażek) lista zadań zostaje ta sama
  const nav = page.getByRole("navigation", { name: "Zadania" }).getByRole("button");
  const count = await nav.count();
  expect(count).toBeGreaterThan(0);
  await page.getByRole("main").getByRole("button").filter({ hasText: /^A/ }).first().click();
  await page.getByRole("button", { name: "Sprawdź odpowiedź" }).click();
  await expect(page.getByRole("button", { name: "Sprawdź odpowiedź" })).toHaveCount(0);
  await expect(nav).toHaveCount(count);

  await page.getByRole("link", { name: "Zakończ arkusz poprawek" }).click();
  await expect(page).toHaveURL(/\/bledy\/?$/);
});

test("arkusz poprawek: wejście z Pudełka porażek i pusty stan nowego ucznia", async ({ page }) => {
  await prepare(page, freshProgress());
  await page.goto("/bledy/");
  await page.getByRole("link", { name: "Arkusz poprawek" }).click();
  await expect(page.getByText(/Brak błędów z ostatnich 30 dni/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Rozwiąż arkusz" })).toHaveCount(0);
});
