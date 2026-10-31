# Jak pisać lekcję (standard)

Wzór: `src/data/topics/funkcja-kwadratowa.ts`. Teoria to sedno aplikacji – uczeń ma ją zrozumieć bez nauczyciela.

## Krok teorii (`TheorySection`)

Jeden krok = jedna myśl. 5–8 kroków na dział, od intuicji do zadań maturalnych.

1. **Po co / co widać** – pierwsze zdanie mówi, czym jest pojęcie albo co z niego odczytasz (obraz, a nie definicja z podręcznika).
2. **Reguła** – krótko, wypunktowana (`• ` na początku akapitu, akapity rozdziela `\n\n`). Wzory w `$...$`.
3. **Skrót albo pułapka** – jeśli jest szybsza droga (np. $p = \frac{x_1 + x_2}{2}$) albo typowe pomylenie, powiedz to wprost.
4. **Przykład** (`example`) – zadanie w stylu CKE, rozwiązanie w krokach: jedna linia (`\n`) = jeden ruch. Najpierw wypisz dane (`$a = 1$, $b = 2$…`), na końcu sprawdzenie albo odpowiedź słowami.
5. **Wykres** (`plot`), gdy pomaga zobaczyć regułę: punkty z przykładu jako `dots`, osie symetrii i granice przedziałów jako `guides`. Tekst kroku mówi, co jest na wykresie.
6. **Pytanie sprawdzające** (`check`) – patrz niżej.

## Pytanie przy kroku (`check`)

- Sprawdza **zrozumienie tego kroku**, nie rachunki (liczby małe, wynik w pamięci albo w 1–2 linijkach).
- Dystraktory = **typowe błędy**: odwrócony znak, pomylone $p$ i $q$, wierzchołek spoza przedziału, zgubiony czynnik. Każda zła odpowiedź powinna wynikać z konkretnej pomyłki.
- `explanation` – pełne rozwiązanie w 1–2 zdaniach. `trap` – nazwij błąd, który prowadzi do najpopularniejszej złej odpowiedzi.
- Nie pisz „odpowiedź A” w treści – odpowiedzi są mieszane na ekranie.
- Id: `<skrót działu>-t<n>` (np. `fk-t3`), nowe pytanie → `npm run db:keys`. Nie zmieniaj id istniejących.

## Telefon

- Wzór w KaTeX nie łamie się w środku: w przykładach jedna linia ≤ ok. 35 znaków wzoru. Długi rachunek rozbij na dwie linie.
- Akapit ≤ 3–4 zdania. Lepiej dwa krótkie kroki niż jeden długi.

## Reszta lekcji

- `formulas` – to, co uczeń ma mieć pod ręką (także skróty z teorii).
- `traps` – haczyki CKE luźnym językiem, po jednym zdaniu.
- `tests` (3 poziomy) i `openTasks` – zadania do zakładki „Zadania”; koniec teorii („Sprawdź, czy rozumiesz”) bierze 3 zadania z poziomu podstawowego.

Testy (`tests/content.test.ts`) pilnują KaTeX, czterech różnych odpowiedzi, wyjaśnień i kluczy – merytorykę sprawdza człowiek.
