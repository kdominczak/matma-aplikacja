// Matura rozszerzona: wybór obu matur w powitaniu, przełącznik poziomu na ekranie głównym i w „Zadaniach”,
// lekcja działu rozszerzenia. Zrzuty: screenshots/rozszerzenie-*.png.
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 393, height: 852 } });

test.beforeEach(async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
});

test("podstawa + rozszerzenie: dwa cele, przełącznik i plan pod rozszerzenie", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("np. Ola").fill("Ala");
  for (let i = 0; i < 3; i++) await dialog.getByRole("button", { name: "Dalej" }).click();

  await dialog.getByRole("radio", { name: /Podstawowa \+ rozszerzona/ }).click();
  await expect(dialog.getByLabel("Matura rozszerzona")).toBeVisible();
  await dialog.getByLabel("Matura rozszerzona").fill("25");
  await expect(dialog.getByText("25/50 pkt · 50%")).toBeVisible();
  await page.screenshot({ path: "screenshots/rozszerzenie-powitanie.png" });
  await dialog.getByRole("button", { name: "Pomiń test – zacznę od planu" }).click();
  await expect(dialog).toBeHidden();

  const levels = page.getByRole("radiogroup", { name: "Poziom matury" });
  await expect(levels).toBeVisible();
  await levels.getByRole("radio", { name: "Rozszerzenie" }).click();
  await expect(levels.getByRole("radio", { name: "Rozszerzenie" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Matura rozszerzona", { exact: true })).toBeVisible();
  await expect(page.getByText(/Ścieżka na 25 pkt/)).toBeVisible();
  await page.waitForTimeout(1000); // liczniki doliczają
  await page.screenshot({ path: "screenshots/rozszerzenie-glowna.png" });

  // „Zadania” pamiętają poziom: najpierw działy rozszerzenia
  await page.goto("/zadania/");
  await expect(page.getByRole("heading", { name: "Rozszerzenie", level: 2 })).toBeVisible();
  await expect(page.getByText("Pochodna i optymalizacja")).toBeVisible();
});

test("lekcja działu rozszerzenia: teoria z pytaniem po kroku", async ({ page }) => {
  await page.goto("/dzial/rz-pochodna/");
  await expect(page.getByRole("heading", { name: "Pochodna – wzory, które trzeba mieć w palcach" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Sprawdź ten krok" })).toHaveCount(3);
});
