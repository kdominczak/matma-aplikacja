# Premium, limit AI, kody poleceń i zakupy – wdrożenie

## Jak to działa

- **Serwer decyduje.** Premium (`entitlements`), dzienny licznik AI (`ai_usage`), polecenia (`referral_codes`, `referrals`) i zakupy (`purchase_events`) zapisują wyłącznie funkcje SQL. Aplikacja czyta stan przez `account_status()` (`src/lib/premium.ts`) i nie ma prawa zapisu do tych tabel.
- **Limit AI:** 5 wiadomości dziennie za darmo (`ai_free_daily_limit()`), z Premium pułap techniczny 200 (`ai_premium_daily_limit()`). Dzień liczony według czasu polskiego. Zmieniasz liczbę w SQL i w `AI_FREE_DAILY_LIMIT` (`src/lib/premium.ts`) naraz. Limit obejmuje czat korepetytora, wyjaśnienia błędów i podpowiedzi AI.
- **AI wyłącznie przez serwer:** aplikacja nie zna żadnego klucza Groq. Funkcja `supabase/functions/ai` sprawdza token ucznia, zużywa jedną wiadomość (`consume_ai_quota()`), woła Groq kluczem z sekretów i strumieniuje odpowiedź. Modele: `openai/gpt-oss-120b` (tekst) i `qwen/qwen3.8-27b` (zdjęcia) – `src/lib/ai-config.ts` i `ALLOWED_MODELS` w funkcji zmieniasz razem. Do Groq przechodzą tylko wybrane pola zapytania. Odpowiedzi:
  - 401 – wyłącznie sesja ucznia (aplikacja raz odświeża token i ponawia),
  - 429 `{ "error": "limit" }` – wyczerpany limit; aplikacja pokazuje Premium (czat: `AiLimitCard`, podpowiedzi i wyjaśnienia: link do `/premium`),
  - 502 `{ "error": "upstream", "status", "code" }` – błąd Groq; wiadomość wraca do limitu (`refund_ai_quota()`, tylko kluczem `service_role`), a przyczyna trafia do logów funkcji,
  - 500 `{ "error": "config" }` – brak sekretu `GROQ_API_KEY`.
- **Kody poleceń:** każdy ma stały 6-znakowy kod (`my_referral_code()`). Wpisanie kodu znajomego (`redeem_referral()`) daje poleconemu 2 dni Premium od razu – tylko w pierwszym tygodniu konta i raz. Polecający dostaje 2 dni za każde polecenie, najwyżej 5 razy w sezonie (od 1 września) i 2 razy dziennie. Limity są po to, by jedna osoba nie „polecała” sama siebie z kolejnych anonimowych kont.
- **Konto:** jeśli uczeń nie ma sesji, aplikacja zakłada konto anonimowe przy pierwszej akcji, która go wymaga (wiadomość do AI, własny kod, wpisanie kodu). Zakup wymaga konta z e-mailem (kod OTP, `src/lib/account.ts`) – zakup na koncie anonimowym przepadłby po zmianie telefonu.

## AI – wdrożenie

1. W Supabase SQL Editor uruchom migracje `20261102120000_premium_referrals.sql` i `20261103120000_ai_quota_refund.sql` (w tej kolejności).
2. Ustaw sekret i wdróż funkcję (Supabase CLI):

   ```sh
   supabase secrets set GROQ_API_KEY=gsk_...
   supabase functions deploy ai
   ```

   Po każdej zmianie `supabase/functions/ai/index.ts` funkcję trzeba wdrożyć ponownie. Zmiana sekretu działa bez ponownego wdrożenia.
3. Sprawdź funkcję z kontem testowym (`npm run dev` z `NEXT_PUBLIC_SUPABASE_URL` w `.env.local`): odpowiedź przychodzi, a nagłówek `x-ai-remaining` maleje.
   Gdy coś nie działa: Supabase → Edge Functions → `ai` → Logs.
   - `ai: Groq odrzucił zapytanie 401 invalid_api_key` – zły klucz w sekretach; sprawdź go poza aplikacją (200 = działa, 401 = unieważniony albo przepisany z błędem):

     ```sh
     curl -s -o /dev/null -w "%{http_code}\n" https://api.groq.com/openai/v1/models -H "Authorization: Bearer gsk_..."
     ```

   - `ai: Groq odrzucił zapytanie 404 model_not_found` – Groq wycofał model; zmień `TEXT_MODEL`/`VISION_MODEL` i `ALLOWED_MODELS` na dostępne (lista: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer gsk_..."`).

## Zakupy

### Jak to działa

- **Dwa źródła Premium** w `entitlements` (migracja `20261104120000_purchases.sql`): `premium_until` – dni z poleceń i od admina (sumują się, `grant_premium()`), `purchase_until` – koniec z ostatniego zakupu wg sklepu (**nadpisywany**, nigdy dodawany: odnowienie przesuwa, zwrot/wygaśnięcie cofa). Premium działa do późniejszej z dat (`premium_until_of()`); `account_status()` i `consume_ai_quota()` liczą z obu.
- **Funkcja `supabase/functions/revenuecat`** ma dwa wejścia, oba zapisują stan pobrany z API RevenueCat przez `set_purchase_premium()` (tylko `service_role`, każde zdarzenie w `purchase_events`):
  - **webhook** RevenueCat (nagłówek `Authorization` = sekret) – odnowienia, anulowania, zwroty, wygaśnięcia, `TRANSFER` (obie strony),
  - **synchronizacja z aplikacji** (token ucznia z e-mailem) – zaraz po zakupie i po „Przywróć zakupy”, więc Premium włącza się od razu, bez czekania na webhook.
- **Produkty:** oba w RevenueCat w uprawnieniu `premium` (`ENTITLEMENT_ID` w `supabase/functions/_shared/purchase.ts`). Subskrypcja – data końca ze sklepu (z okresem karencji przy problemie z płatnością). Pakiet maturalny (produkt jednorazowy, w sklepie bez daty końca) – do 31 maja sezonu, w którym go kupiono (`seasonEnd()`, ta sama funkcja liczy datę na ekranie).
- **Aplikacja** (`src/lib/purchases.ts`, plugin `@revenuecat/purchases-capacitor`, ładowany osobną paczką tylko na Androidzie): SDK zalogowane na id konta Supabase z e-mailem (`logIn`/`logOut` same przy zmianie konta), ceny z oferty Google Play, zakup, „Przywróć zakupy”, link „Zarządzaj subskrypcją” (Google Play). Stan z SDK służy tylko interfejsowi – Premium zawsze z `account_status()`. W przeglądarce i w buildzie bez klucza ekran Premium pokazuje ceny informacyjne (`PLAN_INFO`) bez przycisku zakupu.

### Wdrożenie

1. W SQL Editor uruchom `20261104120000_purchases.sql`.
2. **Google Play Console:** produkt jednorazowy (pakiet maturalny, 149 zł) i subskrypcja miesięczna (29,99 zł). Testerzy licencji (Ustawienia → Testowanie licencji) kupują bez obciążenia karty.
3. **RevenueCat:** projekt → aplikacja Google Play (konto usługi z dostępem do Play Console) → oba produkty → uprawnienie `premium` z oboma → oferta (Offering) oznaczona jako *current* z pakietami typu **Lifetime** (pakiet maturalny) i **Monthly** (subskrypcja).
   - Project settings → **Restore behavior: „Keep with original App User ID”** – zakup zostaje przy koncie, na którym go zrobiono. Inaczej jedno konto Google mogłoby „przywracać” Premium kolejnym kontom Matmy (współdzielenie). Uczeń zobaczy wtedy komunikat, żeby zalogował się e-mailem konta, na którym kupił.
4. Sekrety i funkcja (webhook nie ma tokenu Supabase, stąd `--no-verify-jwt` – webhook zabezpiecza sekret w nagłówku, synchronizację – token ucznia sprawdzany w funkcji):

   ```sh
   supabase secrets set REVENUECAT_WEBHOOK_AUTH=<losowy ciąg, np. openssl rand -hex 32> REVENUECAT_SECRET_KEY=sk_...
   supabase functions deploy revenuecat --no-verify-jwt
   ```

5. RevenueCat → Integrations → Webhooks: URL `https://<projekt>.supabase.co/functions/v1/revenuecat`, Authorization header = wartość `REVENUECAT_WEBHOOK_AUTH`. „Send test event” powinien dać 200 (w logach: „zdarzenie bez konta Supabase”).
6. Klucz SDK (RevenueCat → API keys → aplikacja Google Play, `goog_…`) do `.env.production.local` jako `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY`, potem `npm run mobile:sync`. Klucz SDK jest publiczny z założenia; tajny `sk_…` tylko w sekretach funkcji.
7. Test na telefonie (konto testera licencji): zakup → „Premium aktywne” w kilka sekund, w `purchase_events` wpis `APP_SYNC`, chwilę później webhook `INITIAL_PURCHASE`. Potem anulowanie w Google Play → po końcu okresu `EXPIRATION` i powrót do planu darmowego.

### Usuwanie konta

`delete_my_account()` kasuje `entitlements` i `purchase_events` (kaskada od `auth.users`), ale nie anuluje subskrypcji w Google Play – mówią o tym ekran usuwania konta i polityka prywatności. Klienta w RevenueCat usuwa się ręcznie (panel → Customer → Delete) przy zgłoszeniu RODO.
