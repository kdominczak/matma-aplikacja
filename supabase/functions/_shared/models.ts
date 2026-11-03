// Modele Groq – jedno źródło dla aplikacji (src/lib/ai-config.ts) i funkcji serwerowej `ai` (model wybiera serwer).
// Groq wycofuje modele (Llamy już zniknęły): przy „model_not_found” w logach funkcji zmień tutaj.

/** Tekst: najlepszy z matematyki model dostępny w Groq. */
export const TEXT_MODEL = "openai/gpt-oss-120b";
/** Zdjęcia i skany. */
export const VISION_MODEL = "qwen/qwen3.8-27b";
export const VISION_MODEL_LABEL = "Qwen 3.8 27B";
