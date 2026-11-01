// Arkusz poprawek z błędów: wejścia z Arkuszy i Pudełka porażek, kartka z zadaniami, klucz odpowiedzi, pusty stan.
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

test("arkusz poprawek: z Arkuszy na kartkę z zadaniami i odpowiedziami", async ({ page }) => {
  await prepare(page, activeProgress());
  await page.goto("/arkusze/");
  await page.getByRole("link", { name: /Generuj mój arkusz poprawek/ }).click();

  await expect(page.getByRole("heading", { name: "Arkusz poprawek z błędów" })).toBeVisible();
  await expect(page.getByText("Zadanie 1.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Odpowiedzi i schemat oceniania" })).toBeVisible();

  // klucz można wyłączyć (kartka bez odpowiedzi – np. dla korepetytora)
  await page.getByLabel("Odpowiedzi na osobnej stronie").uncheck();
  await expect(page.getByRole("heading", { name: "Odpowiedzi i schemat oceniania" })).toHaveCount(0);

  // wydruk: pasek z przyciskami nie trafia na kartkę
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Zapisz PDF" })).toBeHidden();
  await expect(page.getByText("Zadanie 1.", { exact: true })).toBeVisible();
});

test("arkusz poprawek: wejście z Pudełka porażek i pusty stan nowego ucznia", async ({ page }) => {
  await prepare(page, freshProgress());
  await page.goto("/bledy/");
  await page.getByRole("link", { name: "Arkusz poprawek (PDF)" }).click();
  await expect(page.getByText(/Brak błędów z ostatnich 30 dni/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Zapisz PDF" })).toBeDisabled();
});
