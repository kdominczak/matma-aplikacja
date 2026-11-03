# Wdrożenie produkcyjne – lista kontrolna

Stan na 29.10.2026 (`main` po scaleniu `faza-b-premium`). Szczegóły poszczególnych części: `docs/premium.md` (AI, Premium, zakupy, lejek), `docs/ocenianie-ai.md` (ocena ze zdjęcia). Kolejność ma znaczenie – serwer przed aplikacją.

## 1. Baza (Supabase → SQL Editor)

Uruchom po kolei pliki, których jeszcze nie ma na produkcji. Każdy od `20261103…` można bezpiecznie powtórzyć **razem ze wszystkimi nowszymi, w kolejności**:

| Migracja | Co robi |
|---|---|
| `20261103120000_ai_quota_refund.sql` | zwrot wiadomości AI przy błędzie Groq |
| `20261104120000_purchases.sql` | zakupy: `purchase_until`, `purchase_events`, `set_purchase_premium()` |
| `20261105120000_progress_save_cas.sql` | kopia postępu tylko przez `save_progress()` (bez wyścigu urządzeń) – **uruchom razem z wydaniem nowej aplikacji**: starsze buildy stracą synchronizację kopii (postęp zostaje na telefonie) |
| `20261106120000_fair_ranking.sql` | ranking: każde zadanie raz dziennie, max 150 pkt dziennie |
| `20261107120000_funnel.sql` | lejek Premium (`funnel_events`, raport `supabase/admin/lejek.sql`) |
| `20261108120000_photo_grading.sql` | licznik oceny zdjęć (Premium) |
| `20261109120000_ai_requires_account.sql` | AI, ocena zdjęć i kody poleceń tylko dla kont z e-mailem albo Google (konta anonimowe – błąd MA030). **Uruchom razem z wydaniem aplikacji bez rankingu**, a potem w Authentication → Sign In / Providers wyłącz „Allow anonymous sign-ins” – inaczej skrypt mógłby dalej zakładać konta anonimowe (bez dostępu do AI, ale zaśmiecające bazę) |

## 2. Funkcje serwerowe

```sh
npx supabase link --project-ref <ref>
npx supabase secrets set REVENUECAT_WEBHOOK_AUTH=<openssl rand -hex 32> REVENUECAT_SECRET_KEY=sk_...
npx supabase functions deploy ai
npx supabase functions deploy revenuecat --no-verify-jwt
```

Od 3.11.2026 funkcja `ai` przyjmuje tylko zapytania z `purpose` (prompty czatu po stronie serwera, `_shared/chat.ts`) – starsze buildy aplikacji dostaną 400 `bad_purpose`, więc **wdróż ją razem z nowym buildem**. `GROQ_API_KEY` jest już ustawiony. Po wdrożeniu sprawdź logi obu funkcji (Edge Functions → Logs).

## 3. Sklep i zakupy

- Google Play Console: produkt jednorazowy „pakiet maturalny” (149 zł) i subskrypcja miesięczna (29,99 zł); testerzy licencji.
- RevenueCat: oba produkty w uprawnieniu `premium`, oferta *current* z pakietami **Lifetime** i **Monthly**, **Restore behavior: „Keep with original App User ID”** (ochrona przed współdzieleniem), webhook na `…/functions/v1/revenuecat` z nagłówkiem = `REVENUECAT_WEBHOOK_AUTH`, „Send test event” → 200.

## 4. Build aplikacji

`.env.production.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

Z `.env.local` usuń `NEXT_PUBLIC_GROQ_API_KEY` (nieużywany, klucz był unieważniony). Potem `npm run mobile:sync` (nowy plugin natywny RevenueCat) → Android Studio → podpisany AAB.

## 5. Kontrola przed wysłaniem do sklepu

- `npm test` (482 testy: logika, treść, migracje w PGlite), `npm run lint`, `npx playwright test` (151 testów E2E i zrzuty).
- **Ocena AI:** pełny pomiar zrobiony 29.10.2026 – 18/18 (100%), kroki 57/57, 0 nieczytelnych. Powtórz `npm run grading:eval` po każdej zmianie promptu albo modelu.
- Telefon (konto testera licencji):
  1. nowy uczeń: powitanie → plan → korepetytor odpowiada, licznik „Zostało 4 z 5”,
  2. 6. wiadomość → ekran limitu z Premium; podpowiedź/wyjaśnienie po limicie → link do Premium,
  3. Premium → logowanie kodem z e-maila → zakup → „Premium aktywne” w kilka sekund; „Przywróć zakupy” po reinstalacji,
  4. arkusz → „Zakończ” → zdjęcie kartki → poprawka odczytu → ocena AI z uzasadnieniami → wynik z punktami częściowymi,
  5. dwa telefony na jednym e-mailu: zmiany z obu trafiają do kopii (bez nadpisywania),
  6. anulowanie subskrypcji w Google Play → po końcu okresu plan darmowy.

## 6. Prawo i sklep – blokery premiery

- **Regulamin** – projekt w aplikacji (`/regulamin`, `src/app/(app)/regulamin/page.tsx`; link w Ustawieniach, na ekranie Premium i w polityce). Przed zakupem pole zgody (tekst `PURCHASE_CONSENT_TEXT` w `src/data/legal.ts`, przycisk „Kup” nieaktywny bez zgody). Do przejrzenia przez prawnika, zwłaszcza: czy Premium to treść cyfrowa (art. 38 ust. 1 pkt 13) czy usługa cyfrowa (wtedy inne zasady odstąpienia od subskrypcji), potwierdzenie zgody na trwałym nośniku (dziś: na prośbę mailem), obietnica przedłużenia Premium przy awarii (§ 11).
- **Publiczny adres** stron `/prywatnosc` i `/usun-konto` (Google Play wymaga URL-i) – hosting statyczny folderu `out/` (np. Cloudflare Pages), `trailingSlash` już ustawiony.
- **Polityka prywatności:** sekcja o przekazaniu poza EOG (Groq, RevenueCat – USA) jest; brakuje podstawy – wpisz `transferBasis` w `src/data/legal.ts` po sprawdzeniu umów DPA obu dostawców (do tego czasu strona pokazuje „[do uzupełnienia]”).
- **Google Play – Bezpieczeństwo danych:** e-mail, identyfikator konta, historia zakupów, aktywność w aplikacji (odpowiedzi, lejek), zdjęcia i tekst wysyłane do AI (przetwarzane, nie przechowywane); szyfrowanie w transmisji; możliwość usunięcia konta (`/usun-konto`).
- **Grupa docelowa:** uczniowie 16–19 lat (bez kierowania do dzieci poniżej 13); zakupy niepełnoletnich obsługuje Google Play (kontrola rodzicielska – aplikacja pokazuje czytelny komunikat).
- Podatki i forma prowadzenia sprzedaży (dwie osoby, profil płatności Google) – z księgowym przed pierwszą wypłatą.

## 7. Po premierze – co obserwować

- Edge Functions → Logs: `ai: Groq odrzucił zapytanie …` (klucz, wycofany model, przeciążenie), `revenuecat: …` (każde zdarzenie zakupu).
- `supabase/admin/lejek.sql` – limit AI → ekran Premium → e-mail → „Kup” → zakupy; decyzja o limicie 5 wiadomości i cenach na danych.
- `purchase_events` – zwroty i wygaśnięcia; zgłoszenia „nie mam Premium” → „Przywróć zakupy” albo sprawdzenie w RevenueCat.
- Koszt Groq (panel Groq) względem liczby Premium – pułapy: 200 wiadomości, 30 + 30 ocen zdjęć dziennie na konto.

## Znane ograniczenia (świadome)

- Ranking: klucze odpowiedzi są w aplikacji (offline), więc skrypt może zdobyć do 150 pkt dziennie – pułap zrównuje go z bardzo pracowitym uczniem, nie wyklucza.
- Scalanie kopii postępu przy sprzecznych polach porównuje zegar telefonu z czasem serwera (dane nie giną, scalanie łączy obie strony).
- Lejek widzi tylko osoby z kontem (statystyki nie zakładają kont).
- Ocena AI to ocena orientacyjna z uzasadnieniem – uczeń może ją poprawić; do rankingu nic z arkuszy nie trafia.
