// Regulamin, polityka prywatności i informacja o CKE – widoczne tam, gdzie uczeń ich szuka.
import { expect, test } from "@playwright/test";
import { activeProgress, storageInit } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(activeProgress(), "light");
  await page.addInitScript((data) => {
    localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
    localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
  }, init);
});

const CKE = /nie jest powiązana z Centralną Komisją Egzaminacyjną/;

test("regulamin: paragrafy, limity z aplikacji, prawo odstąpienia; link z ustawień", async ({ page }) => {
  await page.goto("/ustawienia/");
  await expect(page.getByRole("link", { name: /Regulamin/ })).toHaveAttribute("href", /\/regulamin/);
  await page.goto("/regulamin/");
  await expect(page.getByRole("heading", { name: /§ 8\. Prawo odstąpienia/ })).toBeVisible();
  await expect(page.getByText(/do 200 wiadomości/)).toBeVisible();
  await expect(page.getByText(/tracę prawo do odstąpienia/).first()).toBeVisible();
  await page.screenshot({ path: "screenshots/regulamin.png" });
});

test("polityka prywatności: AI w USA bez danych konta, przekazywanie poza EOG", async ({ page }) => {
  await page.goto("/prywatnosc/");
  await expect(page.getByRole("heading", { name: /poza Europejski Obszar Gospodarczy/ })).toBeVisible();
  await expect(page.getByText(/Nie przekazujemy identyfikatora konta, e-maila, nicku/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Regulamin" })).toBeVisible();
});

test("informacja o CKE: ekran główny, Premium, start arkusza i źródło zadań", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(CKE)).toBeVisible();
  await page.goto("/premium/");
  await expect(page.getByText(CKE)).toBeVisible();
  await expect(page.getByRole("link", { name: "Regulamin" })).toBeVisible();
  await page.goto("/arkusze/");
  await expect(page.getByText(/Zadania autorskie aplikacji Matma/).first()).toBeVisible();
  await page.getByRole("link", { name: /Arkusz próbny/ }).first().click();
  await expect(page.getByRole("button", { name: /Rozpocznij arkusz/ })).toBeVisible();
  await expect(page.getByText(CKE)).toBeVisible();
  await expect(page.getByText(/nie pochodzą z arkuszy CKE/)).toBeVisible();
});
