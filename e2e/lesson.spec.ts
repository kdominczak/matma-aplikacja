// Lekcja: teoria (ze „Sprawdź, czy rozumiesz” bez serc), wzory i zadania – bez testów na zablokowanych poziomach.
// Zrzuty: screenshots/lekcja-*.png.
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

test("teoria kończy się „Sprawdź, czy rozumiesz” – odpowiedź od razu z wyjaśnieniem", async ({ page }) => {
  await page.goto("/dzial/potegi-i-pierwiastki/");
  await expect(page.getByRole("tab", { name: "Zadania" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Test" })).toHaveCount(0);

  const check = page.getByRole("region", { name: "Sprawdź, czy rozumiesz" });
  await check.scrollIntoViewIfNeeded();
  await check.getByRole("radio").first().click();
  await check.getByRole("button", { name: "Sprawdź" }).click();
  await expect(check.getByText(/Dobrze!|Poprawna odpowiedź: [A-D]/)).toBeVisible();
  await expect(page.getByText(/serc/i)).toHaveCount(0);
  await page.screenshot({ path: "screenshots/lekcja-sprawdz.png" });
});

test("zakładka Zadania: postęp według trudności, bez kłódek; stary link #test otwiera Zadania", async ({ page }) => {
  await page.goto("/dzial/potegi-i-pierwiastki/#test");
  await expect(page.getByRole("tab", { name: "Zadania", selected: true })).toBeVisible();
  await expect(page.getByText("Zadania maturalne z działu")).toBeVisible();
  await expect(page.getByText(/Zalicz poprzedni poziom/)).toHaveCount(0);
  await page.screenshot({ path: "screenshots/lekcja-zadania.png" });
  await page.getByRole("link", { name: /Rozwiąż zadania|Rozwiązuj dalej/ }).click();
  await expect(page).toHaveURL(/\/zadania\/potegi-i-pierwiastki\/?$/);
});
