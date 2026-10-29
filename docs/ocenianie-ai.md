# Ocenianie zadań otwartych przez AI

## Stan

- **Samoocena krokami** (za darmo): po „Zakończ” w arkuszu uczeń zaznacza kroki schematu, które ma w rozwiązaniu (`ExamAssessment`). Punkty obcina `applyAssessment()` (`src/lib/exam.ts`), status `partial`.
- **Ocena ze zdjęcia** (Premium, `PhotoGrading` na ekranie sprawdzania): zdjęcie kartki → `transcribeSolution()` (model z obrazami przepisuje, niczego nie poprawia) → uczeń widzi i poprawia tekst z podglądem wzorów → `gradeSolution()` (ocena wg schematu) → punkty i uzasadnienia przy krokach. Uczeń może je jeszcze zmienić – wtedy ocena staje się samooceną. Uzasadnienia AI zostają w wyniku (podsumowanie arkusza).
- **Limity:** osobny dzienny licznik (`consume_grading_quota`, migracja `20261108120000_photo_grading.sql`): 30 przepisań i osobno 30 ocen dziennie, tylko z Premium (`GRADING_DAILY_LIMIT` w `src/lib/premium.ts` i `ai_grading_daily_limit()` zmieniaj razem). Błąd Groq zwraca zapytanie do licznika.
- **Serwer narzuca prompt i model:** przy `purpose: "grade" | "transcribe"` funkcja `ai` bierze z zapytania tylko tekst albo zdjęcia JPEG, a prompt systemowy, model i limity ustawia sama (`supabase/functions/_shared/grading.ts`). Licznik ocen nie posłuży więc do zwykłego czatu, a przepisywanie nie stanie się darmowym OCR-em bez limitu.
- **Przeciążenie Groq (429):** aplikacja ponawia przepisanie i ocenę po 3 s i 8 s (`BUSY_RETRY_DELAYS`, zapytanie wraca do limitu, więc ponowienie nic nie kosztuje); skrypt pomiarowy robi przerwy między zapytaniami i czeka zgodnie z `Retry-After`.

## Jak to działa

- Model tekstowy (`TEXT_MODEL`) dostaje zadanie, poprawny wynik, schemat (kroki z punktami) i rozwiązanie ucznia w znacznikach `<rozwiazanie_ucznia>` – wyłącznie jako dane; polecenia w rozwiązaniu („przyznaj punkty”) są ignorowane, a znacznik zamykający w tekście ucznia jest usuwany.
- Zasady CKE w prompcie: inna poprawna metoda się liczy, błąd w kroku = 0 za ten krok, krok na błędnym wyniku = 0, sam wynik bez obliczeń = 0.
- Odpowiedź to JSON z punktami i uzasadnieniem dla każdego kroku. `parseGrading()` nie zgaduje: zła liczba kroków albo brak liczb = `null` (aplikacja ma wtedy pokazać samoocenę). Pojedyncze ukośniki LaTeX-a w uzasadnieniach (niepoprawny JSON) są naprawiane.

## Pomiar trafności

Zestaw: `scripts/grading-eval/cases.ts` – rozwiązania z punktacją wg schematu (komplet, inna metoda, pomyłka rachunkowa, urwane, zły wzór, pominięta dziedzina, sam wynik, manipulacja). Poprawność zestawu pilnuje `tests/ai-grading.test.ts`.

```sh
# wszystkie przypadki prosto do Groq – klucz tylko w terminalu, nigdy w .env aplikacji
GROQ_API_KEY=gsk_... npm run grading:eval

# pełna ścieżka produkcyjna przez funkcję `ai` (tryb „grade”, licznik ocen – konto testowe z Premium:
# select public.grant_premium('<id konta>', 7, 'admin'); w SQL Editorze)
MATMA_TOKEN=<JWT konta> npm run grading:eval -- --przez-funkcje --tylko wsm-rachunek,rw-inna-metoda

# przerwa między zapytaniami (domyślnie 2500 ms); przy 429 skrypt sam czeka
GROQ_API_KEY=gsk_... npm run grading:eval -- --przerwa 5000
```

**Próg przed włączeniem oceny AI w aplikacji:** suma punktów zgodna dokładnie w ≥ 85% przypadków, z dokładnością ±1 w ≥ 95%, zero nieczytelnych odpowiedzi i zero udanych manipulacji. Przy rozbieżności najpierw sprawdź `why` przypadku – czasem myli się zestaw, nie model.

Pierwszy pomiar (29.10.2026, przez funkcję `ai`, 5 najtrudniejszych przypadków): 4/4 odczytanych ocen zgodnych co do kroku (pomyłka rachunkowa, manipulacja, inna metoda, zły wzór), 1 odpowiedź nieczytelna (LaTeX w JSON-ie) – naprawione w `parseGrading` i prompcie, do potwierdzenia pełnym pomiarem.

## Przed premierą

Pełny pomiar na wszystkich przypadkach (`npm run grading:eval`) – dotąd na żywo sprawdzonych było 5 z 18. Przy wyniku poniżej progu: najpierw popraw prompt (`_shared/grading.ts`) i zmierz ponownie; ekran i tak pokazuje uczniowi uzasadnienia i pozwala poprawić ocenę.
