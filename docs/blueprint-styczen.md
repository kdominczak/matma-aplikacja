# Blueprint na styczeń 2027 – procedury i stan systemu

Stan na 2.11.2026. Dokument opisuje to, co **jest w kodzie** (z odnośnikami do plików), i to, co **trzeba zrobić** – z wyraźnym oznaczeniem, co jest decyzją, a co tylko pomysłem. Liczby z zewnątrz (cenniki, zasady sklepów) sprawdzone 2.11.2026 – przed wdrożeniem sprawdź je ponownie (źródła na końcu).

Szczegóły, które już są opisane, zostają w swoich plikach: `docs/premium.md` (AI, Premium, RevenueCat, lejek), `docs/ocenianie-ai.md` (ocena ze zdjęcia), `docs/wdrozenie.md` (lista kontrolna wdrożenia).

**Znaki:** ✅ działa · ⚠️ działa, ale z ryzykiem · ❌ brak / błąd · 🔧 do zrobienia.

---

## 1. Płatności i monetyzacja

### 1.1 Zasada nadrzędna

Premium liczy **tylko serwer**: `premium_until_of(user)` = `greatest(premium_until, purchase_until)` w tabeli `entitlements`. Aplikacja czyta stan przez `account_status()` i nigdy nie nalicza Premium lokalnie. Każdy nowy kanał płatności dopisuje **własną kolumnę** do `greatest()` – nigdy nie pisze do cudzej.

| Kolumna | Kto pisze | Zachowanie |
|---|---|---|
| `premium_until` | `grant_premium()` (polecenia, admin) | dni się sumują, nikt ich nie odbiera |
| `purchase_until` | `set_purchase_premium()` (funkcja `revenuecat`) | **nadpisywana** stanem z API RevenueCat przy każdym zdarzeniu – zwrot albo wygaśnięcie ją zeruje |
| `web_until` 🔧 | `set_web_premium()` (funkcja `stripe`, do napisania) | nadpisywana stanem ze Stripe; RevenueCat jej nie dotyka |

To jest odpowiedź na pytanie „jak nie nadpisać zakupów webowych”: **osobna kolumna + osobna funkcja SQL z `grant execute` tylko dla `service_role`**. Gdyby Stripe pisał do `purchase_until`, pierwsza synchronizacja RevenueCat (np. „Przywróć zakupy” na telefonie) wyzerowałaby zakup z PC.

### 1.2 Android – RevenueCat ✅ (kod), 🔧 (konfiguracja)

Kod jest gotowy (`src/lib/purchases.ts`, `supabase/functions/revenuecat`, `_shared/purchase.ts` z testami). Procedura konfiguracji – `docs/premium.md` → „Wdrożenie”. Krytyczne punkty:

1. RevenueCat → **Restore behavior: „Keep with original App User ID”** – inaczej jedno konto Google „przywraca” Premium kolejnym kontom Matmy.
2. Zakup tylko na koncie z e-mailem (anonimowe konto ginie z telefonem, a z nim zakup).
3. Test na koncie testera licencji: zakup → w kilka sekund `APP_SYNC` w `purchase_events` → webhook `INITIAL_PURCHASE` → anulowanie → `EXPIRATION`.

**Publikacja w Google Play (blokuje kalendarz):** konto osobiste założone po 13.11.2023 musi przejść test zamknięty – **co najmniej 12 testerów zapisanych przez 14 dni bez przerwy**, potem wniosek o dostęp do produkcji i przegląd (realnie ~3 tygodnie od pierwszego wgrania). Konto organizacji (z numerem D-U-N-S) jest zwolnione. Testerzy powinni faktycznie używać aplikacji. **Na styczeń: test zamknięty musi wystartować najpóźniej na początku grudnia** – lepiej teraz.

### 1.3 iOS – ❌ nie istnieje

To nie jest „dopisanie iOS w `purchases.ts`”. W repo nie ma katalogu `ios/`. Kolejność:

1. Mac z Xcode, Apple Developer Program (opłata roczna), `npx cap add ios`, ikony, ekran startowy, uprawnienia (aparat i zdjęcia dla załączników korepetytora – opisy `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` w `Info.plist`), lokalne powiadomienia.
2. App Store Connect – produkty. **Pakiet maturalny ważny do 31 maja to w App Store typ „Non-Renewing Subscription”**, nie „Non-Consumable” (non-consumable jest dożywotni). Subskrypcja miesięczna – „Auto-Renewable”.
3. RevenueCat: aplikacja App Store, te same uprawnienie `premium` i oferta. Webhook i funkcja `revenuecat` działają bez zmian (zdarzenia mają pole `store`).
4. `purchases.ts`: `NEXT_PUBLIC_REVENUECAT_IOS_KEY`, `purchasesSupported()` przepuszcza `ios`, link „Zarządzaj subskrypcją” → `https://apps.apple.com/account/subscriptions`.
5. Wymogi przeglądu Apple, które już spełniamy: usuwanie konta w aplikacji ✅, „Przywróć zakupy” ✅. Logowanie Apple nie jest wymagane (nie mamy logowania przez Google/Facebook).

**Rekomendacja:** iOS po starcie Androida i strony. Na styczeń nierealny bez Maca i bez ~2 tygodni na przegląd i poprawki.

### 1.4 Płatności webowe (PC) – 🔧 projekt

**Najpierw polityka sklepów (to jest mina, nie technika):**
- W aplikacji z Google Play cyfrowe Premium **musi** iść przez Play Billing. Nie wolno w aplikacji na Androida pokazywać przycisku ani linku do tańszej płatności na stronie (anti-steering), chyba że dołączymy do programów płatności alternatywnych/ofert zewnętrznych dla EOG – z ich opłatami i wymogami. **Decyzja: na Androidzie żadnych linków do płatności webowej.**
- Wolno natomiast, żeby Premium kupione na stronie działało w aplikacji (to samo konto). U nas działa to automatycznie, bo Premium liczy serwer.
- Na stronie to my jesteśmy sprzedawcą (w Google Play – Google): potrzebna działalność gospodarcza, faktury/paragony, VAT 23% na usługi elektroniczne. **Do sprawdzenia z księgową przed włączeniem.**

**Zakres na start:** tylko **pakiet maturalny (płatność jednorazowa)** – BLIK, Przelewy24 i karta przez Stripe Checkout. Subskrypcję webową odkładamy: cykliczny BLIK w Stripe wymaga włączenia przez wsparcie Stripe (tylko PLN, limit 2000 zł na obciążenie), a Przelewy24 w Stripe nie obsługuje płatności cyklicznych.

**Architektura (statyczna strona, więc wszystko po stronie Supabase):**

```
[strona /premium] --token ucznia--> funkcja stripe: POST /checkout
      → sprawdza token (konto z e-mailem, nie anonimowe)
      → tworzy Checkout Session: mode=payment, PLN, payment_method_types=[blik, p24, card],
        client_reference_id=user_id, metadata.user_id, success_url=/premium/?zakup=ok
      ← url → przekierowanie do Stripe

Stripe --webhook--> funkcja stripe: POST /webhook (--no-verify-jwt)
      → weryfikacja podpisu `Stripe-Signature` (constructEventAsync – Deno, Web Crypto)
      → idempotencja: event.id w tabeli `stripe_events` (unique) – powtórzony webhook nic nie robi
      → checkout.session.completed z payment_status=paid
        albo checkout.session.async_payment_succeeded (P24/BLIK bywają asynchroniczne)
          → set_web_premium(user_id, seasonEnd(), 'stripe_pass', event.type)
      → charge.refunded → set_web_premium(user_id, null, …)
```

**Migracja (szkic):**

```sql
alter table public.entitlements add column if not exists web_until timestamptz;
create table if not exists public.stripe_events (id text primary key, received_at timestamptz not null default now());
revoke all on public.stripe_events from anon, authenticated;

create or replace function public.premium_until_of(p_user uuid) returns timestamptz …
  select greatest(e.premium_until, e.purchase_until, e.web_until) from public.entitlements e where e.user_id = p_user;

create or replace function public.set_web_premium(p_user uuid, p_until timestamptz, p_product text, p_event text) …
-- grant execute tylko service_role (jak set_purchase_premium)
```

Do tego test w `tests/db/` (PGlite): zdarzenie RevenueCat z `purchase_until = null` **nie zmienia** `web_until` i odwrotnie. Logika webhooka jako czysta funkcja w `_shared/stripe.ts` z testami – tak jak `_shared/purchase.ts`.

Na stronie: przycisk „Kup przez BLIK / Przelewy24” tylko gdy `!Capacitor.isNativePlatform()`. Zgoda `PURCHASE_CONSENT_TEXT` przed płatnością (utrata prawa odstąpienia) – ta sama co w aplikacji. Ostrzeżenie, gdy konto ma już aktywny zakup ze sklepu (żeby nie płacić dwa razy).

### 1.5 Cennik ⚠️ – do decyzji

Dziś pakiet kosztuje 149 zł niezależnie od daty i działa do 31 maja. Kupiony w kwietniu kosztuje 149 zł za ~6 tygodni, a miesięczna subskrypcja wyszłaby taniej. Opcje: cena malejąca w ciągu sezonu albo pakiet „do matury” z ceną zależną od miesiąca. **Decyzja produktowa przed startem sprzedaży.**

---

## 2. AI – ocena zadań i korepetytor

### 2.1 Ocena zadania otwartego ze zdjęcia ✅

Szczegóły i pomiar trafności – `docs/ocenianie-ai.md`. Przebieg:

1. **Przepisanie** (`purpose: "transcribe"`, `VISION_MODEL`, temperatura 0): model przepisuje kartkę „dokładnie, także błędy, niczego nie poprawia, nie rozwiązuje” (`TRANSCRIBE_SYSTEM` w `supabase/functions/_shared/grading.ts`). Brak rozwiązania na zdjęciu → `BRAK_ROZWIAZANIA`.
2. **Weryfikacja przez ucznia:** tekst z podglądem wzorów, uczeń poprawia błędy odczytu. Nie jest to „surowy OCR”: to przepisanie przez model z obrazami, a uczeń jest jedyną kontrolą jakości odczytu.
3. **Ocena** (`purpose: "grade"`, `TEXT_MODEL`, temperatura 0): zadanie, wynik, schemat punktowania i rozwiązanie w `<rozwiazanie_ucznia>` (jako dane – polecenia w środku są ignorowane). Zasady CKE w prompcie. Odpowiedź to JSON; `parseGrading()` nie zgaduje – zła struktura = samoocena.
4. Serwer **sam narzuca** prompt, model i limit tokenów dla obu kroków – klient nie podmieni promptu.

✅ (3.11.2026 – `gradingSystem(level)`, 8 przypadków z rozszerzenia; pomiar 24/26 → 26/26, wdrożone, `docs/ocenianie-ai.md`) ~~**Rozbieżność do poprawy:** `GRADING_SYSTEM` mówi „poziom podstawowy”, a od 2.11 są arkusze rozszerzone.~~ Zmiana promptu = `npm run grading:eval` przed i po (zasada projektu). Zestaw `scripts/grading-eval/cases.ts` nie ma jeszcze przypadków z rozszerzenia.

### 2.2 Limity atomowe ✅

| Licznik | Funkcja SQL | Limit | Kto |
|---|---|---|---|
| wiadomości (korepetytor, wyjaśnienia, podpowiedzi) | `consume_ai_quota()` | 5/dzień bez Premium, 200 z Premium | każde konto, także anonimowe |
| przepisania zdjęć | `consume_grading_quota('transcribe')` | 30/dzień | tylko Premium |
| oceny | `consume_grading_quota('grade')` | 30/dzień | tylko Premium |

- **Atomowość:** wiersz `ai_usage (user_id, day)` jest blokowany `select … for update`, sprawdzenie i zwiększenie dzieją się w jednej transakcji – dwa równoległe zapytania nie przekroczą limitu.
- **Zwrot:** błąd Groq → 502 `upstream` + `refund_ai_quota()` / `refund_grading_quota()` (tylko `service_role`). Uczeń nie traci wiadomości przez awarię dostawcy.
- **Dzień** liczony w czasie polskim (`Europe/Warsaw`).
- **Twarde ograniczenia funkcji `ai`:** 4 MB treści, 40 wiadomości, `max_completion_tokens` ≤ 6144, tylko dwa dozwolone modele.

### 2.3 Luki znalezione przy przeglądzie ❌ – do naprawy przed startem

1. **Farma Premium z kodów poleceń.** `redeem_referral()` działa dla **kont anonimowych**, a nagroda dla zaproszonego (2 dni Premium) nie ma pułapu. Skrypt z publicznym kluczem anon może tworzyć konta anonimowe i na każdym wpisać kod → 2 dni Premium (200 wiadomości + 30 ocen dziennie) na koszt naszego klucza Groq. Pułap ma tylko polecający (5/sezon, 2/dzień). **Naprawa:** `redeem_referral` tylko dla konta z potwierdzonym e-mailem (`auth.users.email is not null and not is_anonymous`), komunikat w `ReferralCard` „dodaj e-mail, żeby odebrać dni”.
2. **5 darmowych wiadomości na każde nowe konto anonimowe.** Wyczyszczenie danych = nowe konto = nowe 5 wiadomości, a skrypt może to zautomatyzować. **Naprawa:** w Supabase Auth włączyć CAPTCHA (Cloudflare Turnstile) dla logowania anonimowego i pilnować limitu tworzenia kont anonimowych na IP. Do rozważenia: AI tylko z e-mailem (mocniejsze, ale kosztuje część lejka – decyzja).
3. ✅ (3.11.2026 – `_shared/chat.ts`, zapytanie bez `purpose` → 400) **Prompt korepetytora, wyjaśnień i podpowiedzi wysyła klient.** W trybach innych niż ocena funkcja `ai` przyjmuje dowolne wiadomości, także systemowe – w granicach limitu to ogólny czat z LLM. Ryzyko kosztowe jest ograniczone limitem, ale **naprawa** jest prosta: `purpose: "tutor" | "explain" | "hint"` z promptem po stronie serwera, jak przy ocenie.
4. ✅ (3.11.2026 – `_shared/fallback.ts`, sekrety `FALLBACK_*`, do skonfigurowania) **Jeden dostawca (Groq).** Groq już wycofywał modele. Plan B: drugi dostawca za tym samym interfejsem w funkcji `ai` (zmiana w jednym miejscu: `_shared/models.ts`).

---

## 3. Baza danych (Supabase)

### 3.1 Schemat ✅

Migracje w `supabase/migrations` przez Supabase CLI z historią (`docs/wdrozenie.md`). Ranking i `record_answers()` usunięte z bazy 3.11.2026 (`20261111120000_drop_ranking.sql`) – dwa punkty niżej są historyczne. Każda testowana w PGlite (`tests/db/`).

- **Odpowiedzi i ranking:** `record_answers()` – klient wysyła tylko id zadania i literę; poprawność ocenia serwer z `question_keys`. Każde zadanie liczy się raz dziennie, najwyżej `ranking_daily_cap()` (150) dziennie. Bez limitu tempa – zgubiłby kolejkę offline. Klient nie ma uprawnień do kolumn serii.
- **Offline-first:** odpowiedzi trafiają do kolejki na urządzeniu i idą do `record_answers()` po odzyskaniu sieci (`src/lib/learning-sync.ts`).
- **Kopia postępu:** tylko `save_progress(dane, oczekiwany updated_at)` – optymistyczna blokada. Konflikt (`MA020`, inne urządzenie zapisało w międzyczasie) → pobierz, scal (`progress-merge.ts`), ponów (`src/lib/cloud-sync.ts`). Klient nie ma INSERT/UPDATE na `user_progress`.
- **Historia arkuszy:** `exam_attempts` – tylko do dopisywania.
- **Usuwanie konta:** `delete_my_account()` – kaskada od `auth.users`.

✅ (3.11.2026 – `npm run db:push:test` / `db:push:prod`, `docs/wdrozenie.md`) ~~**Proces:** migracje produkcyjne wykonywane ręcznie w SQL Editorze.~~ Przed styczniem: osobny **projekt testowy (staging)** i `supabase db push` z historią migracji, żeby było wiadomo, co jest na produkcji.

### 3.2 Free vs Pro

| | Free | Pro |
|---|---|---|
| Cena | 0 | od 25 USD/mies. |
| Baza | 500 MB | 8 GB dysku, potem 0,125 USD/GB |
| Pliki (zdjęcia rankingu) | 1 GB | 100 GB |
| Transfer (egress) | 5 GB | 250 GB |
| Aktywni użytkownicy (MAU) | 50 000 | 100 000 |
| Wywołania funkcji | 500 000 | 2 mln |
| Wstrzymanie po tygodniu bez ruchu | **tak** | nie |
| Kopie zapasowe | **brak** | codzienne, 7 dni |
| Limit wydatków | – | domyślnie włączony |

**Dlaczego Pro przed startem:**
- **Brak kopii zapasowych na Free.** Jedna zła migracja albo błąd w `delete_my_account` = utracone postępy i zakupy bez możliwości odtworzenia. Przy płacących użytkownikach to niedopuszczalne.
- **Wstrzymanie projektu po tygodniu bez ruchu.** Groźne w okresie testów (np. przerwa świąteczna) – aplikacja przestaje logować i synchronizować.
- **Transfer 5 GB:** zdjęcia w rankingu i JSON-y postępu przy kilku tysiącach aktywnych uczniów miesięcznie mogą go przekroczyć.

Projekt testowy (staging) może zostać na Free (2 aktywne projekty za darmo).

---

## 4. Strona WWW – Cloudflare Pages 🔧

Eksport: `npm run build` → `out/` (dziś **1131 plików, 25 MB**; limit Pages na planie darmowym: 20 000 plików, 25 MiB na plik, 500 buildów/mies.). `trailingSlash: true` – Pages serwuje `x/index.html` pod `/x/`.

1. **Projekt:** Workers & Pages → Pages → połącz z repo (albo `npx wrangler pages deploy out`). Build command `npm run build`, output `out`, zmienna `NODE_VERSION` zgodna z lokalną.
2. **Zmienne:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Bez** `NEXT_PUBLIC_REVENUECAT_ANDROID_KEY` (na stronie i tak nie działa, ale nie ma po co go wystawiać). Klucz Groq nigdy.
3. **Domena:** Custom domains → domena → rekordy DNS w Cloudflare. HTTPS automatycznie.
4. **Supabase Auth:** Site URL i Redirect URLs = domena (kody e-mail OTP nie potrzebują przekierowań, ale linki w mailach już tak).
5. **CORS:** funkcje `ai` i `revenuecat` mają `Access-Control-Allow-Origin: *` – strona zadziała bez zmian (autoryzacja tokenem ucznia, nie ciasteczkiem).
6. **Nagłówki** (`out/_headers`, kopiowany przy buildzie): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. CSP – dopiero po teście (KaTeX ładuje fonty, Supabase i Stripe mają własne domeny).
7. **Adresy wymagane przez sklepy** (Play Console → Zasady aplikacji): polityka prywatności `https://<domena>/prywatnosc/`, usuwanie konta `https://<domena>/usun-konto/` (strona działa bez instalowania aplikacji – wymóg Google). Regulamin `https://<domena>/regulamin/` – link w opisie sklepu i przy zakupie webowym.
8. **Licencja:** Cloudflare Pages na planie darmowym można używać komercyjnie (warunki Cloudflare), transfer statycznych plików nie jest limitowany.

Uwaga: wersja WWW to ta sama aplikacja (dane w `localStorage`). Uczeń bez e-maila straci postęp przy czyszczeniu przeglądarki – na stronie zachęta do dodania e-maila powinna być mocniejsza niż w aplikacji.

---

## 5. Audyt wyglądu („AI look”) – wykonany 2.11.2026

Zasady sprawdzone ręcznie według listy z `enmerasoftware/ai-design-check` (samej paczki nie instalowaliśmy – to kod z zewnątrz uruchamiany przez `npx`; przed instalacją trzeba przeczytać jej `SKILL.md` i skrypty).

### Poprawione

| Problem | Gdzie | Poprawka |
|---|---|---|
| Tekst z gradientem (biel → bursztyn → złoto) | tytuły wszystkich stron (`PageHeader`), panel główny, wynik arkusza, nagłówek działu, podsumowanie quizu | jednolity kolor: `text-ink`, na grafitowych kartach `text-white` |
| Paski postępu z gradientem | panel główny, wynik arkusza | jednolity `bg-brand` |
| Animowany „błysk” przechodzący przez przyciski co 6 s (`btn-shine`) | 19 przycisków | usunięty razem z narzędziem w `globals.css` |
| Złota poświata pod przyciskami (`shadow-float`) i unoszenie z obwódką przy najechaniu (`btn-hover`) | 58 miejsc (zmiana w tokenie) | krótki, neutralny cień; najechanie = lekkie rozjaśnienie, dotyk = wciśnięcie |
| Emoji zamiast ikon | „Pudełko jest puste 🎉”, „⚠” w pułapkach działu | ikony z `Icon` |
| Napisy 10–11 px (poniżej czytelności na telefonie) | 33 miejsca | `text-xs` (12 px) |

### Świadomie zostawione

- **Gradienty o znaczeniu:** medale w rankingu (złoto/srebro/brąz), odznaki i awatar – to ilustracje, nie ozdobnik przycisku.
- **Półkroki odstępów (2 px: `gap-1.5`, `py-2.5`, `mt-0.5`)** – ~140 użyć. Siatka 4 px z dopuszczeniem 2 px przy ikonach i ciasnych etykietach to standard (Tailwind, Material). Masowa zamiana dałaby regresje bez widocznego zysku. Nowe komponenty: odstępy z siatki 4 px, półkrok tylko przy ikonie obok tekstu.
- **Wzory w KaTeX zostają w krojach KaTeX** – nie w Inter. Inter to treść, Outfit to nagłówki i duże liczby.

### Do zrobienia (projekt, nie kosmetyka)

1. **Karty statystyk w profilu** (ikona → liczba → podpis ×3) to wzorzec „stat card” z listy AI-looku. Lepiej jedna linia z najważniejszą liczbą (szacowany wynik) i dwie drugorzędne w tekście.
2. **Złota jest za dużo** – po zmianach z 2.11 także przycisk „Wzory”. Zasada: złoto tylko na głównej akcji ekranu i na liczbie, która jest wynikiem. Reszta – grafit i biel.
3. **Brudnopis na pełnym ekranie:** pływający pasek narzędzi („wyspa”) zamiast pełnej stopki – największy zysk jakości tam, gdzie uczeń spędza najwięcej czasu.

---

## 6. Kolejność prac do stycznia

1. Commit i testy na fizycznych telefonach (dwa urządzenia, w tym słabsze).
2. **Test zamknięty Google Play – start natychmiast** (14 dni + przegląd).
3. Luki z p. 2.3: kody poleceń tylko z e-mailem, CAPTCHA dla kont anonimowych, prompty po stronie serwera.
4. Supabase Pro + projekt testowy + migracje przez CLI.
5. Matura podstawowa maj 2025 w aplikacji (z P/F i odpowiedziami-przedziałami).
6. Przegląd merytoryczny kluczy i schematów przez nauczyciela; dopisanie ~30 zadań otwartych z rozszerzenia.
7. Strona na Cloudflare Pages z domeną; adresy polityki i usuwania konta do Play Console.
8. Prawnik (regulamin, AI poza EOG) i księgowa (sprzedaż webowa, VAT) → dopiero potem Stripe.
9. iOS – po starcie Androida.

## Źródła (2.11.2026)

- Supabase – cennik: https://supabase.com/pricing
- Cloudflare Pages – limity: https://developers.cloudflare.com/pages/platform/limits/
- Google Play – test zamknięty dla nowych kont osobistych: https://support.google.com/googleplay/android-developer/answer/14151465
- Stripe – BLIK: https://docs.stripe.com/payments/blik, cykliczny BLIK: https://docs.stripe.com/payments/blik/recurring-payments
- Stripe – Przelewy24: https://docs.stripe.com/payments/p24
