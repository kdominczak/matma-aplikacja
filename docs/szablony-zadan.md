# Szablony zadań – jak zasypywać luki w puli

Szablon parametryczny to jedno zadanie „z dziurami”, z którego powstaje wiele wariantów z innymi liczbami.
Klucz i błędne odpowiedzi liczy kod, więc każdy wariant jest poprawny z konstrukcji, a do sprawdzenia
merytorycznego jest **jeden szablon**, nie dziesiątki zadań.

## Proces (od luki do zadań w aplikacji)

1. `npm run blueprint:coverage` – raport pokazuje pozycje prawdziwych arkuszy (2025–2026), dla których brakuje zadań
   (`BRAK`), jest ich za mało (`mało`) albo są zastępowane innym typem (`zastępstwo typu`).
2. Napisz szablon w `src/data/templates/<dział>.ts` (wzory: `uklady-rownan.ts`, `prawda-falsz.ts`, `otwarte.ts`).
3. Dopisz go do działu w `src/data/templates/index.ts` (liczba wariantów: ABCD 8, P/F 6, otwarte 6).
4. Dodaj sprawdzenie siłowe w `tests/templates.test.ts` – test odczytuje liczby z treści wariantu i liczy wynik
   niezależnie od szablonu (wyliczenie przypadków, podstawienie do równań).
5. `npm test` – testy treści sprawdzą też KaTeX, 4 różne odpowiedzi, punktację i odpowiedzi otwarte.
6. `npm run db:keys` i wklej `supabase/seed/question_keys.sql` w Supabase SQL Editor (klucze dla rankingu).
7. Ponownie `npm run blueprint:coverage` – luka powinna zniknąć.

## Typy zadań

| Typ w arkuszu | Szablon | Uwagi |
|---|---|---|
| ABCD | `ClosedTemplate` zwracający `correct` + 3 `distractors` | silnik tasuje litery; dystraktory = typowe błędy ucznia |
| Prawda/fałsz | `ClosedTemplate` zwracający `intro` + 2 `statements` | zapis jako 4 kombinacje P/F – 1 pkt tylko za obie oceny, jak w CKE |
| Krótka odpowiedź | `OpenTemplate` z `format: "short"` | liczy się sam wynik; 1 krok schematu |
| Otwarte z rozwiązaniem | `OpenTemplate` (domyślnie `extended`) | punkty = suma kroków `solution` |

## Zasady dobrego szablonu

- **Dystraktory z prawdziwych pomyłek**, nie losowe liczby: zamiana `x` i `y`, zapomniane zero na początku liczby,
  dzielenie przez złą liczbę, pomylenie średniej z medianą.
- **Odrzucaj złe losowania**: zwróć `null`, gdy liczby dają niejednoznaczne zadanie (dystraktor równy odpowiedzi,
  dzielenie przez zero, wynik nie z tego zakresu). Silnik wylosuje ponownie.
- **Jedna liczba w odpowiedzi otwartej**: `matchesAnswer` porównuje kilka wartości bez kolejności (`-2;3` = `3;-2`),
  więc nie pytaj o uporządkowane pary współczynników – poproś o jeden z nich.
- **Bez płci w tekstach**: „obliczono”, „sprawdź”, zamiast „policzyłeś”.
- **Stałe id**: nie zmieniaj `id` istniejącego szablonu ani kolejności wariantów – od id zależą Pudełko porażek,
  powtórki i klucze na serwerze. Nowa wersja zadania = nowy szablon.

## Sprawdzenie merytoryczne (nauczyciel)

Dla każdego szablonu: czy treść jest jednoznaczna dla każdych dopuszczalnych liczb, czy poziom pasuje do matury
podstawowej, czy schemat punktowania odpowiada zasadom oceniania CKE, czy dystraktory są wiarygodne.
Najprościej przejrzeć 3–4 warianty w zakładce „Zadania” (dział → filtr poziomu).
