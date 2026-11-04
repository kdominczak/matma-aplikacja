// Brudnopis: oddalanie, przybliżanie i przesuwanie kartki (mało miejsca na telefonie). Zrzut po oddaleniu
// do screenshots/brudnopis-oddalony.png.
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

async function openScratch(page: Page) {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  await page.goto("/zadania/potegi-i-pierwiastki/");
  const zoomOut = page.getByRole("button", { name: "Oddal kartkę" });
  if (!(await zoomOut.isVisible())) await page.getByRole("button", { name: /Brudnopis/ }).first().click();
  await expect(zoomOut).toBeVisible();
  // na telefonie pływający przycisk otwiera brudnopis od razu na pełnym ekranie
  return page.getByLabel("Pole do rysowania");
}

async function drawLine(page: Page, from: [number, number], to: [number, number]) {
  await page.mouse.move(...from);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / 8, from[1] + ((to[1] - from[1]) * i) / 8);
  await page.mouse.up();
}

test("oddalanie i przybliżanie przyciskami, powrót do 100% jednym stuknięciem", async ({ page }) => {
  const board = await openScratch(page);
  const box = (await board.boundingBox())!;
  await drawLine(page, [box.x + 40, box.y + 60], [box.x + box.width - 40, box.y + box.height - 60]);

  await page.getByRole("button", { name: "Oddal kartkę" }).click();
  await page.getByRole("button", { name: "Oddal kartkę" }).click();
  await expect(page.getByRole("button", { name: "Przywróć 100% i początek kartki" })).toHaveText("64%");
  await page.screenshot({ path: "screenshots/brudnopis-oddalony.png" });

  // po oddaleniu da się rysować dalej – w nowym miejscu kartki
  await drawLine(page, [box.x + 30, box.y + box.height - 30], [box.x + box.width - 30, box.y + box.height - 30]);
  await page.getByRole("button", { name: "Przybliż kartkę" }).click();
  await expect(page.getByRole("button", { name: "Przywróć 100% i początek kartki" })).toHaveText("80%");
  await page.getByRole("button", { name: "Przywróć 100% i początek kartki" }).click();
  await expect(page.getByRole("button", { name: "Przywróć 100% i początek kartki" })).toHaveText("100%");
});

test("narzędzie „Przesuń” przesuwa kartkę zamiast rysować; cofnij nie ma czego cofać", async ({ page }) => {
  const board = await openScratch(page);
  const box = (await board.boundingBox())!;
  await page.getByRole("button", { name: /Przesuń kartkę/ }).click();
  await expect(page.getByText(/Przeciągnij, żeby przesunąć kartkę/)).toBeVisible();
  await drawLine(page, [box.x + 200, box.y + 150], [box.x + 80, box.y + 60]);
  // przesuwanie nie dodaje kreski do historii
  await expect(page.getByRole("button", { name: "Cofnij" }).first()).toBeDisabled();
});

test.describe("dotyk", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("szczypanie dwoma palcami oddala kartkę i nie zostawia kreski", async ({ page }) => {
    const board = await openScratch(page);
    const box = (await board.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: "touchStart" | "touchMove" | "touchEnd", points: [number, number][]) =>
      cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points.map(([x, y], id) => ({ x, y, id })) });

    // palce rozsunięte na 160 px → zsuwamy do 80 px: oddalenie ok. 2×
    await touch("touchStart", [[cx - 80, cy], [cx + 80, cy]]);
    for (let i = 1; i <= 8; i++) await touch("touchMove", [[cx - 80 + i * 5, cy], [cx + 80 - i * 5, cy]]);
    await touch("touchEnd", []);

    const label = await page.getByRole("button", { name: "Przywróć 100% i początek kartki" }).textContent();
    expect(Number(label!.replace("%", ""))).toBeLessThan(70);
    // gest dwoma palcami nie rysuje
    await expect(page.getByRole("button", { name: "Cofnij" }).first()).toBeDisabled();
  });
});

test("bryła w dwóch stuknięciach: Figury → Sześcian stawia ją zaznaczoną na środku kartki", async ({ page }) => {
  await openScratch(page);
  await page.getByRole("button", { name: "Figury i bryły" }).click();
  await page.getByRole("button", { name: "Sześcian" }).click();
  await expect(page.getByText("Przeciągnij bryłę · narożniki zmieniają rozmiar")).toBeVisible();
  await expect(page.getByRole("slider", { name: "Zmień rozmiar figury" })).toHaveCount(4);
  await page.screenshot({ path: "screenshots/brudnopis-bryla.png" });
  // cofnij usuwa bryłę jednym stuknięciem
  await page.getByRole("button", { name: "Cofnij" }).first().click();
  await expect(page.getByRole("slider", { name: "Zmień rozmiar figury" })).toHaveCount(0);
});
