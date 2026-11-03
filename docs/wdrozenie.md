# Wdrożenie produkcyjne – lista kontrolna

Stan na 3.11.2026. Szczegóły poszczególnych części: `docs/premium.md` (AI, Premium, zakupy, lejek), `docs/ocenianie-ai.md` (ocena ze zdjęcia). Kolejność ma znaczenie – serwer przed aplikacją.

## 1. Baza – migracje przez Supabase CLI (od 3.11.2026)

Dwa projekty: **produkcja** `nnpgwnxfqsjsdgtitobe` (podlinkowany, `supabase/.temp`) i **testowy** `hewatagpzhxhuoaqckih` („projekt2”, plan darmowy). Obie bazy mają historię migracji (`supabase_migrations.schema_migrations`) – CLI wie, co już jest, i wgrywa tylko brakujące pliki, po kolei. Hasło do bazy nie jest potrzebne (CLI zakłada tymczasową rolę logowania przez konto Supabase).

```sh
npm run db:status          # które migracje są lokalnie / na produkcji
npm run db:push:test       # najpierw projekt testowy
npm run db:push:prod       # potem produkcja (CLI pyta o potwierdzenie i pokazuje listę)
npx supabase db push --remote --dry-run   # sama lista, bez zmian
```

Zasady:
- **Nigdy więcej migracji przez SQL Editor** – wtedy historia się rozjeżdża (tak było z `20261108120000_photo_grading.sql`: nikt jej nie uruchomił, a następna migracja z niej korzystała – ocena zdjęć na produkcji kończyła się błędem; naprawione 3.11.2026).
- Nowa migracja = kolejny wolny numer (`RRRRMMDDGGMMSS_nazwa.sql`); przed nadaniem numeru `git fetch` – druga osoba też dodaje migracje. Powtórzony numer zatrzymuje `tests/migration-names.test.ts`.
- Migracja, która zmienia to, czego używa starsza aplikacja – wgrywaj razem z wydaniem nowego builda (opis w nagłówku pliku migracji).
- SQL Editor tylko do zapytań i skryptów z `supabase/admin/` (np. partie kodów, raport lejka). Zapytanie tylko do odczytu z terminala: `npx supabase db query --remote --read-only "select …"`.

Po migracjach uruchom `supabase/admin/kontrola-bezpieczenstwa.sql` – RLS, funkcje i uprawnienia klienta muszą zgadzać się z `tests/db/security.test.ts`.

Stan 3.11.2026: obie bazy mają komplet migracji do `20261111120000_drop_ranking.sql` (ranking usunięty z bazy). „Allow anonymous sign-ins” (Authentication → Sign In / Providers) – **wyłącz na produkcji** po wydaniu nowego builda (do potwierdzenia).

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
- **Nazwa aplikacji – do ustalenia.** Potrzebna do: karty w Google Play, maila do CKE, regulaminu i polityki (`LEGAL.appName` w `src/data/legal.ts`), domeny strony.
- **Mail do CKE (po ustaleniu nazwy)** – na sekretariat@cke.gov.pl, temat „Wykorzystanie treści arkuszy maturalnych z matematyki w aplikacji edukacyjnej”: tworzymy aplikację do nauki do matury, chcemy udostępnić zadania z opublikowanych arkuszy z matematyki (formuła 2023) – treść przepisana, ze źródłem („Zadanie z arkusza CKE, matura maj 2025”), bez logo i układu graficznego CKE, bezpłatnie; prośba o zgodę albo warunki. Odpowiedź zachować.
- **Arkusze CKE w aplikacji** (`src/data/cke/`, od 3.11.2026): treść zadań przepisana i złożona na nowo, rysunki odtworzone, źródło przy każdym zadaniu, za darmo (nie w Premium). Podstawa: art. 4 pkt 2 pr. aut. („urzędowe dokumenty, materiały” – CKE jest instytucją państwową); brak oficjalnego stanowiska CKE i orzecznictwa wprost o arkuszach, a strona z arkuszami nie ma regulaminu ani licencji. Do zrobienia: (1) mail do CKE (sekretariat@cke.gov.pl) z prośbą o pisemne potwierdzenie, (2) pytanie do prawnika razem z regulaminem. Jedyna grafika skopiowana z PDF: 4 rysunki do zad. 25.2 (2024, `public/cke/2024-maj/`) – w razie wątpliwości przerysować. Wyłączenie arkuszy: lista `CKE_EXAMS` w `src/data/exams.ts`.
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
