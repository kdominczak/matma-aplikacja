// Zapasowy dostawca AI dla funkcji `ai`: gdy Groq nie odpowie (awaria, przeciążenie, wycofany model, zły klucz),
// to samo zapytanie idzie do dowolnego API zgodnego z OpenAI (chat/completions, strumień SSE) z sekretów:
//   FALLBACK_API_URL       – pełny adres, np. https://openrouter.ai/api/v1/chat/completions
//   FALLBACK_API_KEY       – klucz tego dostawcy
//   FALLBACK_TEXT_MODEL    – model tekstowy (zamiennik TEXT_MODEL)
//   FALLBACK_VISION_MODEL  – model ze zdjęciami (zamiennik VISION_MODEL; bez niego zapytania ze zdjęciami nie mają zapasu)
// Bez sekretów działa jak dotąd – tylko Groq. Czysty TypeScript bez Deno API (testy: tests/ai-fallback.test.ts).

import { TEXT_MODEL, VISION_MODEL } from "./models.ts";

export interface FallbackConfig {
  url: string;
  key: string;
  textModel: string;
  visionModel?: string;
}

/** Konfiguracja z sekretów (null – zapasowy dostawca wyłączony). */
export function fallbackConfig(env: (name: string) => string | undefined): FallbackConfig | null {
  const clean = (name: string) => env(name)?.trim().replace(/^["']|["']$/g, "") || undefined;
  const url = clean("FALLBACK_API_URL");
  const key = clean("FALLBACK_API_KEY");
  const textModel = clean("FALLBACK_TEXT_MODEL");
  if (!url || !key || !textModel || !/^https:\/\//.test(url)) return null;
  return { url, key, textModel, visionModel: clean("FALLBACK_VISION_MODEL") };
}

/**
 * Czy po odpowiedzi Groq próbować zapasowego dostawcy. Tak: brak połączenia (status 0), przeciążenie (429), błąd
 * serwera (5xx), zły klucz (401/403), wycofany albo nieznany model (404, kody model_*). Nie: zapytanie odrzucone
 * z powodu treści (inne 4xx – u drugiego dostawcy skończyłoby się tak samo).
 */
export function shouldFallback(status: number, code?: string): boolean {
  if (status === 0 || status === 429 || status >= 500 || status === 401 || status === 403 || status === 404) return true;
  return typeof code === "string" && /model/.test(code);
}

interface Prepared {
  model: string;
  messages: unknown[];
  maxTokens: number;
  extra: Record<string, unknown>;
}

/**
 * Treść zapytania do zapasowego dostawcy: ten sam prompt i dane, jego model (tekst albo zdjęcia), bez parametrów
 * specyficznych dla Groq (reasoning_format, include_reasoning, reasoning_effort) – zostaje tylko temperatura.
 * null – brak zamiennika (np. zapytanie ze zdjęciami bez FALLBACK_VISION_MODEL).
 */
export function fallbackBody(request: Prepared, config: FallbackConfig): Record<string, unknown> | null {
  const model = request.model === VISION_MODEL ? config.visionModel : request.model === TEXT_MODEL ? config.textModel : undefined;
  if (!model) return null;
  const temperature = request.extra.temperature;
  return {
    model,
    messages: request.messages,
    stream: true,
    max_tokens: request.maxTokens,
    ...(typeof temperature === "number" ? { temperature } : {}),
  };
}
