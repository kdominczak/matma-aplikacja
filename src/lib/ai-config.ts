import { SUPABASE_ENABLED } from "@/lib/supabase";

/**
 * Korepetytor AI działa wyłącznie przez naszą funkcję serwerową (`supabase/functions/ai`): klucz Groq jest
 * w sekretach Supabase, dzienny limit liczy baza. Bez skonfigurowanego Supabase (np. build bez `.env`) AI
 * jest po prostu niedostępne – przyciski AI się nie pokazują.
 * Osobny lekki moduł – czyta go też polityka prywatności (strona statyczna).
 */
export const AI_ENABLED = SUPABASE_ENABLED;

// Modele wybiera aplikacja według rodzaju zapytania; serwer i tak przepuszcza tylko te dwa (ALLOWED_MODELS).
/** Tekst: najlepszy z matematyki model dostępny w Groq. */
export const TEXT_MODEL = "openai/gpt-oss-120b";
/** Zdjęcia i skany – korepetytor przełącza się na niego sam, gdy wiadomość ma obrazy. */
export const VISION_MODEL = "qwen/qwen3.8-27b";
export const VISION_MODEL_LABEL = "Qwen 3.8 27B";

/**
 * Dawny tryb „własny klucz Groq ucznia” zapisywał klucz w Preferences pod `ai.v1`. Klucz nie jest już używany,
 * więc przy starcie usuwamy go z urządzenia (prywatność; nieistniejący wpis – bez skutku).
 */
export async function forgetLegacyAiKey() {
  const { Preferences } = await import("@capacitor/preferences");
  await Preferences.remove({ key: "ai.v1" });
}
