@AGENTS.md

# Matma – aplikacja do matury z matematyki

Aplikacja mobilna do nauki: krótkie sesje, serie dni, ranking rozwiązanych zadań (bez XP).

## Stos
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Capacitor 8 (Android/iOS) – pakuje folder `out/`
- KaTeX do wzorów – w treści pytań LaTeX w `$...$`, renderowany przez `src/components/ui/MathText.tsx`
- Backend: Supabase – ranking (`supabase/migrations`, klient `src/lib/supabase.ts` + `src/lib/ranking.ts`). Konto: anonimowe (ranking) albo e-mail + kod OTP (`src/lib/account.ts`; e-mail dopinany do anonimowego konta – to samo id). Ranking: nick + opcjonalne zdjęcie w Storage `avatars/<id>.jpg`. Ranking = liczba poprawnych odpowiedzi; odpowiedzi i serię zapisuje tylko `record_answers()` – serwer ocenia poprawność z `question_keys`, klient wysyła tylko literę (`src/lib/learning-sync.ts`). Nie dawaj klientowi uprawnień do kolumn serii. Kopia postępu (`user_progress`) i historia arkuszy (`exam_attempts`) – prywatne tabele z RLS, synchronizacja w `src/lib/cloud-sync.ts` (najpierw pobierz i scal przez `progress-merge.ts`, potem wysyłaj; nie wpływają na ranking). Kolejność migracji: pliki w `supabase/migrations` po kolei, seed `question_keys.sql` po drugiej
- AI (korepetytor, wyjaśnienia, podpowiedzi): Groq wołany bezpośrednio z aplikacji (`src/lib/ai.ts`, prompty w `src/lib/ai-prompts.ts`). Uczeń wkleja własny klucz Groq w aplikacji (`src/lib/ai-settings.ts`, zapis na urządzeniu); `NEXT_PUBLIC_GROQ_API_KEY` z `.env.local` działa tylko w `npm run dev` – nigdy nie wkompilowuj wspólnego klucza do buildu. Załączniki w korepetytorze (`src/lib/attachments.ts`): zdjęcia → JPEG ≤1280 px, PDF → tekst przez pdf.js na urządzeniu (skany jako obrazy); wiadomość z obrazem idzie do `VISION_MODEL` (Groq: max 3 obrazy na zapytanie)

## Ważne ograniczenie
`next.config.ts` ma `output: "export"`. Aplikacja działa bez serwera, więc NIE używamy:
Server Actions, Route Handlers z Request, `cookies()`, `headers()`, proxy, redirects/rewrites,
dynamicznych tras bez `generateStaticParams`. Dane z backendu pobieramy po stronie klienta.
API przeglądarki (`window`, `localStorage`, `navigator`) tylko w handlerach lub `useEffect`.

## Komendy
- `npm run dev` – podgląd w przeglądarce (http://localhost:3000)
- `npm run build` – static export do `out/`
- `npm run lint`
- `npm test` – Vitest: logika, treść zadań (KaTeX, klucze, punktacja, aktualność seeda) i migracje Supabase w PGlite (`tests/db/`). Po zmianie zadań, migracji lub logiki postępu testy muszą przechodzić
- `npm run blueprint:coverage` – ile różnych arkuszy w układzie prawdziwej matury da się złożyć z puli i gdzie brakuje zadań
- `npm run db:keys` – po zmianie zadań: generuje `supabase/seed/question_keys.sql` (klucze odpowiedzi dla serwera)
- `npm run mobile:sync` – build + kopiowanie do projektów natywnych
- `npm run android` – sync + otwarcie Android Studio

## Konwencje
- Komponenty: `src/components/<obszar>/` (quiz, gamification, ui)
- Brudnopis: `src/components/scratch/` (`ScratchBoard` w wersji inline/full, kalkulator); parser wyrażeń `src/lib/calc.ts` służy też do sprawdzania odpowiedzi w zadaniach otwartych
- Brudnopis – model obiektowy (`src/types/scratch.ts`, format 2): elementy z `id`, współrzędne w jednostkach kartki (1 = szerokość kartki). Figury i kąty liczy `src/lib/geometry/` (bez canvasa, testy w `tests/geometry.test.ts`); kąt przypięty zapisuje `{shapeId, vertex}`, a nie piksele. Scena (`scene.ts`): końce linii przypiętych do figur (`PointRef`), ramiona kąta w wierzchołku (boki + przypięte linie, `arms` = para "v:<i>"/"l:<id>"). Magnes: `src/lib/geometry/snap.ts`. Bryły: `src/lib/geometry/solids.ts` – wielościany w 3D (ściany), rzut ukośny gabinetowy, krawędzie niewidoczne liczone ze ścian (nie wpisuj ich ręcznie); bryły obrotowe opisane w pudełku z elipsami. Wierzchołki brył działają jak figur płaskich (`shapeVertices`, `vertexNeighbors`). Oznaczenia boków (`MarkItem`: długość, znaczniki |/||/|||, środek) przypięte do boku/krawędzi/linii (`EdgeRef`); podpis rysowany jako KaTeX nad canvasem (`labelToTex` w `src/lib/geometry/marks.ts`). Wysokość = linia z `toRef: {foot: [wierzchołek, bok]}` – spodek prostopadłej liczony na bieżąco. Rysowanie: `scratch-draw.ts` (warstwy: pismo → figury → linie → kąty). Pełny ekran = szuflada o zmiennej wysokości (`scratch.sheetHeight` w localStorage). Notatki zapisuje `src/lib/scratch-notes.ts` (ostatnie 40 zadań; w arkuszu klucz z czasem rozpoczęcia podejścia)
- Zakładka „Zadania”: wszystkie działy odblokowane; zadania z `openTasks`/testów działu albo z `src/data/practice/` (działy bez lekcji). „Rozwiązane” liczy się tylko z wyniku sprawdzonego przez aplikację, samoocena nie
- Ustawienia lokalne (imię, zdjęcie, wibracje, dźwięki, konfetti): `src/lib/app-settings.ts`
- Plan na dziś (`/plan`, `src/lib/planner.ts`): powtórki w odstępach (`src/lib/reviews.ts`, pudełka 1/3/7/14/30 dni) + dział o największym zysku punktów (waga działu × brak opanowania) + 2 zadania z innego działu. Bez AI, liczony na urządzeniu, stały w ciągu dnia (ziarno = dzień + runda)
- Moderacja nicków: `src/lib/moderation.ts` i ta sama lista w SQL (`nick_allowed()`); test pilnuje zgodności – zmieniaj obie naraz
- Usuwanie konta: `src/lib/delete-account.ts` + `delete_my_account()` (kaskada od `auth.users`). Polityka prywatności `/prywatnosc` i strona usuwania konta dla Google Play `/usun-konto` (dane w `src/data/legal.ts`); zgłoszenia mailowe – procedura SQL w `supabase/admin/usun-konto.sql`
- Arkusze w trybie egzaminu: dane `src/data/exams.ts` (próbne z zadań aplikacji; oficjalne CKE tylko przepisane z PDF + klucz, nigdy z pamięci), logika `src/lib/exam.ts`, widoki `src/components/exam/`, trasa `/arkusz/[examId]`
- Szablony arkuszy (`src/data/blueprints.ts`): układy prawdziwych matur podstawowych z „Zasad oceniania” CKE – pozycja, punkty, typ (`abcd`/`truefalse`/`choice`/`short`/`extended`), dział podstawy I–XIII. Od 2025: 50 pkt (wcześniej 46). Tylko struktura, bez treści zadań CKE. Metadane zadań do składania arkuszy: `src/data/task-meta.ts` (dział z `topic.section`, wyjątki w `TASK_OVERRIDES`)
- Generator arkuszy (`src/lib/exam-generator.ts`): wypełnia pozycje szablonu zadaniami z puli, z drabiną zastępstw (typ → pokrewny dział → rozbicie otwartego → dowolny dział → brak), każde zastępstwo zapisane i pokazane uczniowi. Kod arkusza = rok układu + ziarno (np. `26k3f9a`), arkusz losowy ma id `los-<kod>` i stronę `/arkusz/losowy/?kod=`. Wagi działów na maturze (50 pkt) – `src/lib/exam-weights.ts`, liczone z szablonów, nie wpisywane ręcznie
- Szacowany wynik (`src/lib/estimate.ts`): Σ punkty działu na maturze × oczekiwany odsetek punktów (`expectedScore` w `src/lib/mastery.ts` – ostrożna skuteczność ze wszystkich zadań + zaliczone testy). Wykres odtwarzany z dziennej historii `statsByDay` (sumy = `topicStats`). Każda odpowiedź do statystyk działu idzie przez `countAnswer()` w `src/lib/progress.ts`; samoocena zadań otwartych nie liczy się jako poprawna
- Szablony parametryczne zadań: `src/data/templates/` (rejestr w `index.ts`, poradnik `docs/szablony-zadan.md`). Warianty mają stałe id `<szablon>-<n>` – nie zmieniaj id ani kolejności istniejących szablonów. Każdy szablon ma sprawdzenie siłowe w `tests/templates.test.ts`
- Typy: `src/types/`, logika: `src/lib/`, dane testowe: `src/data/`
- Teksty UI po polsku
