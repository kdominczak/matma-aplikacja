import { SUPABASE_ENABLED } from "@/lib/supabase";

/**
 * Korepetytor AI działa wyłącznie przez naszą funkcję serwerową (`supabase/functions/ai`): klucz Groq jest
 * w sekretach Supabase, dzienny limit liczy baza. Bez skonfigurowanego Supabase (np. build bez `.env`) AI
 * jest po prostu niedostępne – przyciski AI się nie pokazują.
 * Osobny lekki moduł – czyta go też polityka prywatności (strona statyczna).
 */
export const AI_ENABLED = SUPABASE_ENABLED;

// Modele wybiera serwer według rodzaju zapytania (_shared/chat.ts, _shared/grading.ts); tu tylko do opisu w UI.
export { TEXT_MODEL, VISION_MODEL, VISION_MODEL_LABEL } from "../../supabase/functions/_shared/models";

/**
 * Dawny tryb „własny klucz Groq ucznia” zapisywał klucz w Preferences pod `ai.v1`. Klucz nie jest już używany,
 * więc przy starcie usuwamy go z urządzenia (prywatność; nieistniejący wpis – bez skutku).
 */
export async function forgetLegacyAiKey() {
  const { Preferences } = await import("@capacitor/preferences");
  await Preferences.remove({ key: "ai.v1" });
}
