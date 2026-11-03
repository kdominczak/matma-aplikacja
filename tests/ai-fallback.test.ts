// Zapasowy dostawca AI (funkcja `ai`): kiedy przełączać i co wysyłać.
import { describe, expect, it } from "vitest";
import { fallbackBody, fallbackConfig, shouldFallback } from "../supabase/functions/_shared/fallback";
import { TEXT_MODEL, VISION_MODEL } from "../supabase/functions/_shared/models";

const env = (vars: Record<string, string>) => (name: string) => vars[name];
const full = env({ FALLBACK_API_URL: "https://api.example.com/v1/chat/completions", FALLBACK_API_KEY: " 'sk-x' ", FALLBACK_TEXT_MODEL: "tekst", FALLBACK_VISION_MODEL: "obraz" });

describe("zapasowy dostawca AI", () => {
  it("konfiguracja z sekretów; bez kompletu albo bez https – wyłączony", () => {
    expect(fallbackConfig(full)).toEqual({ url: "https://api.example.com/v1/chat/completions", key: "sk-x", textModel: "tekst", visionModel: "obraz" });
    expect(fallbackConfig(env({}))).toBeNull();
    expect(fallbackConfig(env({ FALLBACK_API_URL: "http://x", FALLBACK_API_KEY: "k", FALLBACK_TEXT_MODEL: "m" }))).toBeNull();
  });

  it("przełącza przy awarii, przeciążeniu, złym kluczu i wycofanym modelu – nie przy błędzie treści zapytania", () => {
    for (const status of [0, 401, 403, 404, 429, 500, 503]) expect(shouldFallback(status), String(status)).toBe(true);
    expect(shouldFallback(400, "model_decommissioned")).toBe(true);
    expect(shouldFallback(400, "invalid_request_error")).toBe(false);
    expect(shouldFallback(413)).toBe(false);
  });

  it("ten sam prompt, model dostawcy, bez parametrów Groq; zdjęcia bez modelu z obrazami – brak zapasu", () => {
    const config = fallbackConfig(full)!;
    const messages = [{ role: "system", content: "s" }, { role: "user", content: "u" }];
    const text = fallbackBody({ model: TEXT_MODEL, messages, maxTokens: 2048, extra: { reasoning_effort: "medium", include_reasoning: false, temperature: 0 } }, config);
    expect(text).toEqual({ model: "tekst", messages, stream: true, max_tokens: 2048, temperature: 0 });
    expect(fallbackBody({ model: VISION_MODEL, messages, maxTokens: 6144, extra: {} }, config)?.model).toBe("obraz");
    expect(fallbackBody({ model: VISION_MODEL, messages, maxTokens: 6144, extra: {} }, { ...config, visionModel: undefined })).toBeNull();
  });
});
