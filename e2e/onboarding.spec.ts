// Pierwsze uruchomienie: powitanie w 4 krokach (imię, Plan na dziś, brudnopis, cel) i „Pomiń test”.
// Przy okazji zrzuty każdego kroku do screenshots/powitanie/.
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
});

test("nowy uczeń przechodzi powitanie i trafia na plan", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText("15 minut dziennie wystarczy");
  await page.waitForTimeout(600); // koniec animacji wjazdu
  await page.screenshot({ path: "screenshots/powitanie/1.png" });

  await dialog.getByPlaceholder("np. Ola").fill("Kuba");
  for (const [i, title] of [
    [2, "Plan na dziś myśli za Ciebie"],
    [3, "Brudnopis jak kartka na maturze"],
    [4, "Którą maturę zdajesz i na ile?"],
  ] as const) {
    await dialog.getByRole("button", { name: "Dalej" }).click();
    await expect(dialog.getByRole("heading")).toHaveText(title);
    await page.screenshot({ path: `screenshots/powitanie/${i}.png` });
  }

  await dialog.getByLabel("Ile punktów chcesz zdobyć?").fill("30");
  await expect(dialog.getByText("30/50 pkt · 60%")).toBeVisible();
  await dialog.getByRole("button", { name: "Pomiń test – zacznę od planu" }).click();
  await expect(dialog).toBeHidden();

  // imię w powitaniu, cel w skrócie do lekcji – i po odświeżeniu powitanie już nie wraca
  await expect(page.getByRole("heading", { name: "Cześć, Kuba!" })).toBeVisible();
  await expect(page.getByText(/Ścieżka na 30 pkt/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Cześć, Kuba!" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // skrót prowadzi do ścieżki lekcji w zakładce Zadania
  await page.getByRole("link", { name: /Lekcje działów/ }).click();
  await expect(page).toHaveURL(/\/zadania\/\?widok=lekcje$/);
  await expect(page.getByRole("tab", { name: "Lekcje i testy", selected: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ścieżka na 30 pkt" })).toBeVisible();
});

test("„Pomiń” przeskakuje do wyboru celu, a test na start otwiera /start", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Pomiń", exact: true }).click();
  await expect(dialog.getByRole("heading")).toHaveText("Którą maturę zdajesz i na ile?");
  await dialog.getByRole("link", { name: /Test na start/ }).click();
  await expect(page).toHaveURL(/\/start\/?$/);
});
