// Limity AI i Premium – czyste stałe (bez Reacta i Supabase), żeby mogły z nich korzystać także statyczne strony
// (regulamin). Liczy je wyłącznie serwer – te wartości muszą być równe funkcjom SQL (pilnuje tests/db/grading.test.ts).

/** Darmowe wiadomości do AI dziennie – SQL ai_free_daily_limit(). */
export const AI_FREE_DAILY_LIMIT = 5;
/** Techniczny pułap wiadomości z Premium (chroni budżet przed skryptem) – SQL ai_premium_daily_limit(); podany w regulaminie. */
export const AI_PREMIUM_DAILY_LIMIT = 200;
/** Dni Premium za polecenie (dla obu stron) – SQL redeem_referral(). */
export const REFERRAL_DAYS = 2;
/** Ocena zdjęć rozwiązań (Premium): dzienny limit przepisań i osobno ocen – SQL ai_grading_daily_limit(). */
export const GRADING_DAILY_LIMIT = 30;
