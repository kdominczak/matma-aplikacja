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
- `npm run db:keys` – po zmianie zadań: generuje `supabase/seed/question_keys.sql` (klucze odpowiedzi dla serwera)
- `npm run mobile:sync` – build + kopiowanie do projektów natywnych
- `npm run android` – sync + otwarcie Android Studio

## Konwencje
- Komponenty: `src/components/<obszar>/` (quiz, gamification, ui)
- Brudnopis: `src/components/scratch/` (`ScratchBoard` w wersji inline/full, kalkulator); parser wyrażeń `src/lib/calc.ts` służy też do sprawdzania odpowiedzi w zadaniach otwartych
- Zakładka „Zadania”: wszystkie działy odblokowane; zadania z `openTasks`/testów działu albo z `src/data/practice/` (działy bez lekcji). „Rozwiązane” liczy się tylko z wyniku sprawdzonego przez aplikację, samoocena nie
- Ustawienia lokalne (imię, zdjęcie, wibracje, dźwięki, konfetti): `src/lib/app-settings.ts`
- Arkusze w trybie egzaminu: dane `src/data/exams.ts` (próbne z zadań aplikacji; oficjalne CKE tylko przepisane z PDF + klucz, nigdy z pamięci), logika `src/lib/exam.ts`, widoki `src/components/exam/`, trasa `/arkusz/[examId]`
- Typy: `src/types/`, logika: `src/lib/`, dane testowe: `src/data/`
- Teksty UI po polsku
