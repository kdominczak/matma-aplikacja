/**
 * AI przez nasz serwer (funkcja Supabase `supabase/functions/ai`, klucz Groq w sekretach, limit dzienny w bazie).
 * Włączane przy buildzie (`NEXT_PUBLIC_AI_SERVER=1`) po wdrożeniu funkcji – wtedy aplikacja nie pyta o własny
 * klucz Groq. Bez flagi zostaje dotychczasowy tryb z kluczem ucznia, żeby AI nie przestało działać przed wdrożeniem.
 * Osobny moduł bez zależności – czyta go też polityka prywatności (strona statyczna).
 */
export const AI_SERVER = process.env.NEXT_PUBLIC_AI_SERVER === "1" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
