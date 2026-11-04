# Konto: hasło, kod z e-maila i Google

Kod: `src/lib/account.ts` (logika), `src/components/settings/AccountCard.tsx` (ekran), plugin `@capgo/capacitor-social-login` (natywne logowanie Google na Androidzie), konfiguracja pluginu w `capacitor.config.ts`.

## Jak to działa

| Sytuacja | Przebieg |
|---|---|
| Nowe konto | e-mail → 6-cyfrowy kod (potwierdza adres) → **obowiązkowo hasło** (`updateUser({ password, data: { has_password: true } })`) |
| Logowanie | e-mail + hasło (`signInWithPassword`) |
| Nie pamiętam hasła | kod z e-maila → zalogowany → formularz „Ustaw nowe hasło” (bez linku resetującego – w aplikacji otworzyłby przeglądarkę) |
| Stare konto bez hasła | logowanie kodem → karta konta prosi o ustawienie hasła |
| Google (aplikacja) | natywne okno wyboru konta → token ID z nonce → `signInWithIdToken` |
| Google (przeglądarka) | przekierowanie do Google i z powrotem na tę samą stronę (`detectSessionInUrl` tylko poza aplikacją) |
| Konto anonimowe (ranking) | e-mail albo Google **dopinane do tego samego konta** (`updateUser` / `linkIdentity`) – ranking i historia zostają. Gdy e-mail lub konto Google należy już do innego konta Matmy – logowanie na tamto, postęp z telefonu dołącza do kopii |

`has_password` w `user_metadata` to jedyny sposób, żeby aplikacja wiedziała, czy konto ma hasło. Konta Google nie muszą go mieć (mogą ustawić w ustawieniach).

## Konfiguracja (jednorazowo)

### 1. Supabase → Authentication

1. **Sign In / Providers → Email:** włączony, „Confirm email” włączony. Szablony maili („Confirm signup”, „Magic Link”, „Change Email Address”) i SMTP **nie wklejamy ręcznie** – wgrywa je `npm run auth:emails` (sekcja „Maile z kodem” niżej).
2. **Password requirements:** minimalna długość **8**, wymagane litery i cyfry – te same zasady co `passwordProblem()` w aplikacji.
3. **Allow manual linking: włączone** (Authentication → Settings) – bez tego `linkIdentity` (Google do konta anonimowego) zwróci błąd.
4. **Providers → Google:** włączony.
   - *Client IDs (Authorized Client IDs):* identyfikator klienta **Web** (ten sam co `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`). Token z Androida ma właśnie ten identyfikator jako odbiorcę.
   - *Client Secret:* sekret klienta Web (potrzebny do logowania w przeglądarce).
   - „Skip nonce check” – **wyłączone** (aplikacja wysyła nonce).
5. **URL Configuration:** Site URL = domena strony; Redirect URLs: `https://<domena>/**`, `http://localhost:3000/**`.

### 1a. Maile z kodem: wygląd i wysyłka (SMTP)

**Dlaczego:** wbudowana poczta Supabase jest tylko do testów – wysyła kilka maili na godzinę i **wyłącznie na adresy członków zespołu projektu**. Każdy inny uczeń dostaje błąd przy zakładaniu konta (`email_address_not_authorized` albo 500 „Error sending confirmation email”). Do wydania potrzebny jest własny SMTP i domena.

**Wygląd:** treść i tematy trzech maili (nowe konto, logowanie/reset hasła kodem, dopięcie e-maila) są w `scripts/auth-emails/templates.ts` – grafit i złoto jak w aplikacji, duży 6-cyfrowy kod, bez linków. Nazwa aplikacji z `LEGAL.appName` (`src/data/legal.ts`). `npm run auth:emails` zapisuje podgląd do `supabase/templates/*.html` (otwórz w przeglądarce); test pilnuje, żeby podgląd był aktualny.

**Raz, po zakupie domeny (np. `matmapro.pl`):**

1. Konto w serwisie do maili transakcyjnych – np. **Resend** (3000 maili/mies. za darmo, 100/dzień) albo **Brevo** (300/dzień za darmo) – limity sprawdź na ich stronach, mogły się zmienić. Region UE, jeśli jest do wyboru (polityka prywatności – dopisać dostawcę do odbiorców danych w `src/data/legal.ts`).
2. W serwisie: dodaj domenę i przepisz podane rekordy DNS u rejestratora (SPF, DKIM, zwykle też MX dla zwrotów). Dodaj **DMARC**: rekord TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:<twój e-mail>`. Poczekaj na „Verified”. Bez tego Gmail wrzuca maile do Spamu albo je odrzuca. Nie wysyłaj z adresu `@gmail.com` – nie przejdzie DMARC.
3. W serwisie: dane SMTP (host, port 465 albo 587, użytkownik, hasło/klucz API).
4. W katalogu projektu plik **`.env.smtp.local`** (jest w `.gitignore`, nie commituj):
   ```
   SUPABASE_ACCESS_TOKEN=sbp_…          # supabase.com/dashboard/account/tokens
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=re_…
   SMTP_FROM=kod@matmapro.pl            # adres w zweryfikowanej domenie
   SMTP_RATE_PER_HOUR=100               # opcjonalnie, limit maili na godzinę
   ```
5. `npm run auth:emails -- --push test` → w aplikacji podpiętej do projektu testowego załóż konto na zwykły adres (np. drugi Gmail) → mail przychodzi, wygląda dobrze, nie ląduje w Spamie.
6. `npm run auth:emails -- --push prod` (pyta o potwierdzenie).

Skrypt zmienia przez API zarządzania Supabase **tylko** pola maili, ważność kodu (60 min) i SMTP – Google, adresy przekierowań i reguły haseł zostają. Bez `SMTP_HOST` wgrywa same szablony (można to zrobić już teraz, przed domeną). Zmiana nazwy aplikacji albo treści maila = edycja, `npm run auth:emails`, ponowne `--push` na oba projekty.

### 2. Google Cloud Console (projekt dla Matmy)

1. **OAuth consent screen / Branding:** typ External, nazwa „Matma”, e-mail wsparcia, logo, link do polityki prywatności (`https://<domena>/prywatnosc/`), domena autoryzowana. Zakresy: `openid`, `email`, `profile` (niewrażliwe – bez weryfikacji zakresów, tylko weryfikacja marki).
2. **Credentials → OAuth client ID → Web application:**
   - Authorized JavaScript origins: `https://<domena>`, `http://localhost:3000`.
   - Authorized redirect URIs: `https://<projekt>.supabase.co/auth/v1/callback`.
   - Identyfikator → `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` (w `.env.local` i `.env.production.local`), identyfikator i sekret → Supabase (p. 1.4).
3. **Credentials → OAuth client ID → Android** – osobny klient dla **każdego** klucza podpisu, nazwa pakietu `pl.matma.app`:
   - debug: `cd android && ./gradlew signingReport` (wariant `debug`, SHA1),
   - klucz wysyłania (upload key – ten z `keystore.properties`),
   - **Play App Signing** – Play Console → Integralność aplikacji → Podpisywanie aplikacji → SHA-1 klucza podpisywania aplikacji. Bez niego Google nie zadziała w wersji ze sklepu, choć działa w debugu.
   - Identyfikatora klienta Android **nie wpisujemy** nigdzie w kodzie – Google rozpoznaje aplikację po pakiecie i SHA-1.
4. Zmiany w Google Cloud potrafią wchodzić w życie do kilku godzin.

### 3. Aplikacja

```sh
npm run mobile:sync   # build z NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID + rejestracja pluginu w projekcie Android
```

Bez `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` przycisk Google się nie pokazuje (`GOOGLE_ENABLED`), reszta działa.

## Sprawdzenie na telefonie

1. Nowe konto e-mailem: kod → hasło → wyloguj → zaloguj hasłem.
2. „Nie pamiętam hasła”: kod → „Ustaw nowe hasło” → logowanie nowym hasłem.
3. Konto anonimowe w rankingu → „Kontynuuj z Google” → ten sam nick w rankingu (to samo id).
4. Google na koncie Google, które już ma konto Matmy → logowanie na istniejące konto, postęp się scala.
5. Zamknięcie okna Google bez wyboru konta → brak komunikatu błędu.
6. Błąd po wyborze konta: Logcat z filtrem `GoogleProvider` – plugin wypisuje pakiet, SHA-1 i identyfikator klienta; porównaj z Google Cloud. Jeśli zapytanie nie dotarło do Supabase (Authentication → Logs) – problem jest po stronie telefonu albo Google Cloud.

## iOS (później)

Na iOS logowanie przez Google pociąga wymóg App Store (wytyczna 4.8): trzeba też zaoferować równoważne logowanie dbające o prywatność – w praktyce „Zaloguj przez Apple”. W `capacitor.config.ts` włączyć wtedy `apple: true`, dodać klienta iOS w Google Cloud (`iOSClientId`) i dostawcę Apple w Supabase.
