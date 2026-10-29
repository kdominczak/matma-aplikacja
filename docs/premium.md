# Premium, limit AI i kody poleceń – wdrożenie

## Jak to działa

- **Serwer decyduje.** Premium (`entitlements.premium_until`), dzienny licznik AI (`ai_usage`) i polecenia (`referral_codes`, `referrals`) zapisują wyłącznie funkcje SQL z migracji `20261102120000_premium_referrals.sql`. Aplikacja czyta stan przez `account_status()` (`src/lib/premium.ts`) i nie ma prawa zapisu do tych tabel.
- **Limit AI:** 5 wiadomości dziennie za darmo (`ai_free_daily_limit()`), z Premium pułap techniczny 200 (`ai_premium_daily_limit()`). Dzień liczony według czasu polskiego. Zmieniasz liczbę w SQL i w `AI_FREE_DAILY_LIMIT` (`src/lib/premium.ts`) naraz.
- **AI przez serwer:** funkcja `supabase/functions/ai` sprawdza token ucznia, zużywa jedną wiadomość (`consume_ai_quota()`), woła Groq kluczem z sekretów i strumieniuje odpowiedź. Przy wyczerpanym limicie zwraca 429 `{ "error": "limit" }` – aplikacja pokazuje wtedy `AiLimitCard` (Premium i kody poleceń).
- **Kody poleceń:** każdy ma stały 6-znakowy kod (`my_referral_code()`). Wpisanie kodu znajomego (`redeem_referral()`) daje poleconemu 2 dni Premium od razu – tylko w pierwszym tygodniu konta i raz. Polecający dostaje 2 dni za każde polecenie, najwyżej 5 razy w sezonie (od 1 września) i 2 razy dziennie. Limity są po to, by jedna osoba nie „polecała” sama siebie z kolejnych anonimowych kont.
- **Konto:** jeśli uczeń nie ma sesji, aplikacja zakłada konto anonimowe przy pierwszej akcji, która go wymaga (wiadomość do AI, własny kod, wpisanie kodu). Samo otwarcie ekranu niczego nie zakłada.
- **Dni się sumują:** każde nadanie przedłuża od `max(teraz, premium_until)`. Ten sam mechanizm (`grant_premium()`) wykorzysta webhook RevenueCat po zakupie.

## Kolejność wdrożenia

1. W Supabase SQL Editor uruchom migrację `supabase/migrations/20261102120000_premium_referrals.sql`.
2. Ustaw sekret i wdroż funkcję (Supabase CLI):

   ```sh
   supabase secrets set GROQ_API_KEY=gsk_...
   supabase functions deploy ai
   ```

3. Sprawdź funkcję z kontem testowym (np. w `npm run dev` z flagą poniżej): odpowiedź przychodzi, a nagłówek `x-ai-remaining` maleje.
4. Zbuduj aplikację z flagą: `NEXT_PUBLIC_AI_SERVER=1` (np. w `.env.production.local`), potem `npm run mobile:sync`.
   Z flagą aplikacja nie pyta o własny klucz Groq, pokazuje licznik wiadomości, ekran `/premium`, kartę Premium w profilu i nową treść polityki prywatności.
5. W `src/data/legal.ts` zaktualizuj `updatedAt` polityki prywatności (zmienia się opis przekazywania danych do Groq).

Bez flagi (stan domyślny) aplikacja działa jak dotąd: AI na kluczu ucznia, bez limitu i bez Premium w interfejsie.

## Zakupy (następny krok)

Ceny na ekranie Premium (`PLANS` w `src/lib/premium.ts`: pakiet 149 zł, miesięcznie 29,99 zł) są na razie tylko informacją, przycisk zakupu jest wyłączony. Po założeniu konta sprzedawcy w Google Play i projektu w RevenueCat: webhook RevenueCat → funkcja serwerowa → `grant_premium(user, dni, 'purchase')`, a ceny pobierane ze sklepu zamiast stałych.
