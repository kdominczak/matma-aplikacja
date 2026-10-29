// Arkusz: po „Zakończ” ocena kroków zadań otwartych (samoocena wg schematu), potem wynik z punktami częściowymi.
// Przy okazji zrzut ekranu sprawdzania do screenshots/arkusz-sprawdzanie.png.
import { readFileSync } from "node:fs";
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

// ── Ocena ze zdjęcia (Premium) – serwer podstawiony w przeglądarce, prawdziwa baza i Groq nietknięte ──

function supabaseRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? readFileSync(".env.local", "utf8").match(/NEXT_PUBLIC_SUPABASE_URL=(\S+)/)?.[1] ?? "";
  return new URL(url).hostname.split(".")[0];
}

// 1×1 px PNG – wystarczy, żeby aplikacja przygotowała zdjęcie (createImageBitmap + JPEG)
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Expose-Headers": "x-grading-remaining" };
const sse = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;

test("Premium: zdjęcie kartki → poprawiony odczyt → punkty AI z uzasadnieniem → wynik", async ({ page }) => {
  const session = {
    access_token: "test-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "test-refresh",
    user: { id: "00000000-0000-4000-8000-0000000000aa", aud: "authenticated", role: "authenticated", is_anonymous: true, app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() },
  };
  const sent: { purpose?: string; text?: string }[] = [];
  await page.route(/supabase\.co/, async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") return route.fulfill({ status: 200, headers: CORS });
    const url = req.url();
    if (url.includes("/rpc/account_status")) {
      return route.fulfill({
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify([{ premium_until: new Date(Date.now() + 86_400_000).toISOString(), ai_used: 0, ai_limit: 200, referral_code: null, referral_count: 0, grading_used: 0, grading_limit: 30 }]),
      });
    }
    if (url.includes("/functions/v1/ai")) {
      const body = req.postDataJSON() as { purpose?: string; messages: { content: unknown }[] };
      const content = body.messages[0].content;
      sent.push({ purpose: body.purpose, text: typeof content === "string" ? content : undefined });
      const reply =
        body.purpose === "transcribe"
          ? "$x = 12345$ (odczyt z błędem)"
          : JSON.stringify({ steps: [...String(content).matchAll(/^\d+\. \(maks\./gm)].map((_, i) => ({ points: i === 0 ? 1 : 0, reason: i === 0 ? "pierwszy krok poprawny" : "brak tego kroku" })) });
      return route.fulfill({ headers: { ...CORS, "Content-Type": "text/event-stream", "x-grading-remaining": "29" }, body: sse(reply) });
    }
    return route.abort();
  });
  const ref = supabaseRef();
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: `CapacitorStorage.sb-${ref}-auth-token`, value: JSON.stringify(session) },
  );

  await page.goto("/arkusz/probny-1/");
  await page.getByRole("button", { name: /Rozpocznij arkusz/ }).click();
  await page.getByRole("button", { name: "Zakończ", exact: true }).click();
  await page.getByRole("button", { name: "Zakończ i sprawdź" }).click();

  const card = page.locator("li.card").first();
  await expect(card.getByRole("button", { name: "Oceń ze zdjęcia (AI)" })).toBeVisible();
  await card.locator('input[type="file"]').setInputFiles({ name: "kartka.png", mimeType: "image/png", buffer: PNG });

  // uczeń widzi odczyt i go poprawia, zanim cokolwiek zostanie ocenione
  const textarea = card.getByLabel(/Tak odczytaliśmy Twoją kartkę/);
  await expect(textarea).toHaveValue("$x = 12345$ (odczyt z błędem)");
  await textarea.fill("Moje poprawione rozwiązanie");
  await card.getByRole("button", { name: "Oceń według schematu" }).click();

  await expect(card.getByText("AI: pierwszy krok poprawny")).toBeVisible();
  await expect(card.getByText(/· ocena AI/)).toBeVisible();
  expect(sent.map((s) => s.purpose)).toEqual(["transcribe", "grade"]);
  expect(sent[1].text).toContain("<rozwiazanie_ucznia>\nMoje poprawione rozwiązanie");
  await page.screenshot({ path: "screenshots/arkusz-ocena-ai.png" });

  await page.getByRole("button", { name: /Pokaż wynik/ }).click();
  await expect(page.getByText("Źle / częściowo")).toBeVisible();
});

test("bez Premium: zamiast oceny ze zdjęcia – zaproszenie do Premium", async ({ page }) => {
  await page.route(/supabase\.co|groq\.com/, (route) => route.abort());
  await page.goto("/arkusz/probny-1/");
  await page.getByRole("button", { name: /Rozpocznij arkusz/ }).click();
  await page.getByRole("button", { name: "Zakończ", exact: true }).click();
  await page.getByRole("button", { name: "Zakończ i sprawdź" }).click();
  await expect(page.getByRole("link", { name: /Ocena ze zdjęcia z AI – Premium/ }).first()).toBeVisible();
});
