// Arkusz: po „Zakończ” ocena kroków zadań otwartych (samoocena wg schematu), potem wynik z punktami częściowymi.
// Przy okazji zrzut ekranu sprawdzania do screenshots/arkusz-sprawdzanie.png.
import { expect, test } from "@playwright/test";
import { freshProgress, storageInit } from "./fixtures";

test.use({ viewport: { width: 375, height: 812 } });

test("zadania otwarte: samoocena krokami daje punkty częściowe w wyniku", async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  const init = storageInit(freshProgress(), "light");
  await page.addInitScript((data) => {
    localStorage.setItem("CapacitorStorage.progress.v2", data.progress!);
    localStorage.setItem("CapacitorStorage.settings.v1", data.settings);
  }, init);

  await page.goto("/arkusz/probny-1/");
  await page.getByRole("button", { name: /Rozpocznij arkusz/ }).click();

  // pierwsze zadanie otwarte – zły wynik końcowy
  const input = page.getByPlaceholder("np. 3/2, 1,5 albo -2; 3");
  for (let i = 0; i < 40 && !(await input.isVisible()); i++) await page.getByRole("button", { name: /Następne/ }).click();
  await input.fill("12345");

  await page.getByRole("button", { name: "Zakończ", exact: true }).click();
  await page.getByRole("button", { name: "Zakończ i sprawdź" }).click();

  await expect(page.getByRole("heading", { name: "Oceń swoje rozwiązania" })).toBeVisible();
  await page.getByRole("checkbox").first().check();
  await page.screenshot({ path: "screenshots/arkusz-sprawdzanie.png" });
  const show = page.getByRole("button", { name: /Pokaż wynik \(\+\d+ pkt za kroki\)/ });
  await expect(show).toBeVisible();
  await show.click();

  await expect(page.getByText("Źle / częściowo")).toBeVisible();
  await expect(page.getByLabel("Częściowo").first()).toBeVisible();
});

test("„Pomiń” w sprawdzaniu – wynik tylko z wyników końcowych", async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  await page.goto("/arkusz/probny-1/");
  await page.getByRole("button", { name: /Rozpocznij arkusz/ }).click();
  await page.getByRole("button", { name: "Zakończ", exact: true }).click();
  await page.getByRole("button", { name: "Zakończ i sprawdź" }).click();
  await page.getByRole("button", { name: "Pomiń – licz tylko wyniki końcowe" }).click();
  await expect(page.getByText(/0\/\d+ pkt/).first()).toBeVisible();
});
