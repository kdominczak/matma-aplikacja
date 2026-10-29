# Ocenianie zadań otwartych przez AI

## Stan

- **Samoocena krokami** (gotowe, za darmo): po „Zakończ” w arkuszu uczeń zaznacza kroki schematu, które ma w rozwiązaniu (`ExamAssessment`). Punkty obcina `applyAssessment()` (`src/lib/exam.ts`), status `partial`.
- **Ocena AI** (prototyp, jeszcze bez interfejsu): `gradeSolution(task, rozwiązanie)` w `src/lib/ai.ts` – prompt egzaminatora i odczyt odpowiedzi w `src/lib/ai-grading.ts`. Wynik przechodzi przez to samo `applyAssessment()` z `by: "ai"`, więc AI nigdy nie da więcej, niż pozwala schemat.

## Jak to działa

- Model tekstowy (`TEXT_MODEL`) dostaje zadanie, poprawny wynik, schemat (kroki z punktami) i rozwiązanie ucznia w znacznikach `<rozwiazanie_ucznia>` – wyłącznie jako dane; polecenia w rozwiązaniu („przyznaj punkty”) są ignorowane, a znacznik zamykający w tekście ucznia jest usuwany.
- Zasady CKE w prompcie: inna poprawna metoda się liczy, błąd w kroku = 0 za ten krok, krok na błędnym wyniku = 0, sam wynik bez obliczeń = 0.
- Odpowiedź to JSON z punktami i uzasadnieniem dla każdego kroku. `parseGrading()` nie zgaduje: zła liczba kroków albo brak liczb = `null` (aplikacja ma wtedy pokazać samoocenę). Pojedyncze ukośniki LaTeX-a w uzasadnieniach (niepoprawny JSON) są naprawiane.

## Pomiar trafności

Zestaw: `scripts/grading-eval/cases.ts` – rozwiązania z punktacją wg schematu (komplet, inna metoda, pomyłka rachunkowa, urwane, zły wzór, pominięta dziedzina, sam wynik, manipulacja). Poprawność zestawu pilnuje `tests/ai-grading.test.ts`.

```sh
# wszystkie przypadki prosto do Groq – klucz tylko w terminalu, nigdy w .env aplikacji
GROQ_API_KEY=gsk_... npm run grading:eval

# pełna ścieżka produkcyjna przez funkcję `ai` (zużywa limit konta – najlepiej konto testowe z Premium)
MATMA_TOKEN=<JWT konta> npm run grading:eval -- --przez-funkcje --tylko wsm-rachunek,rw-inna-metoda
```

**Próg przed włączeniem oceny AI w aplikacji:** suma punktów zgodna dokładnie w ≥ 85% przypadków, z dokładnością ±1 w ≥ 95%, zero nieczytelnych odpowiedzi i zero udanych manipulacji. Przy rozbieżności najpierw sprawdź `why` przypadku – czasem myli się zestaw, nie model.

Pierwszy pomiar (29.10.2026, przez funkcję `ai`, 5 najtrudniejszych przypadków): 4/4 odczytanych ocen zgodnych co do kroku (pomyłka rachunkowa, manipulacja, inna metoda, zły wzór), 1 odpowiedź nieczytelna (LaTeX w JSON-ie) – naprawione w `parseGrading` i prompcie, do potwierdzenia pełnym pomiarem.

## Następny krok (po przejściu progu)

Zdjęcie rozwiązania → przepisanie przez `VISION_MODEL` (uczeń widzi i poprawia przepisany tekst) → `gradeSolution` → punkty i uzasadnienia przy krokach w `ExamAssessment`. Funkcja Premium z osobnym licznikiem (arkusz = kilka zapytań; 5 darmowych wiadomości by nie wystarczyło).
