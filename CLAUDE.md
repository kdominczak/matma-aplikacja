@AGENTS.md

# Matma – aplikacja do matury z matematyki

Gamifikowana aplikacja mobilna (klimat Duolingo): krótkie sesje, serie dni, XP.

## Stos
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Capacitor 8 (Android/iOS) – pakuje folder `out/`
- KaTeX do wzorów – w treści pytań LaTeX w `$...$`, renderowany przez `src/components/ui/MathText.tsx`
- Backend (planowany): Supabase

## Ważne ograniczenie
`next.config.ts` ma `output: "export"`. Aplikacja działa bez serwera, więc NIE używamy:
Server Actions, Route Handlers z Request, `cookies()`, `headers()`, proxy, redirects/rewrites,
dynamicznych tras bez `generateStaticParams`. Dane z backendu pobieramy po stronie klienta.
API przeglądarki (`window`, `localStorage`, `navigator`) tylko w handlerach lub `useEffect`.

## Komendy
- `npm run dev` – podgląd w przeglądarce (http://localhost:3000)
- `npm run build` – static export do `out/`
- `npm run lint`
- `npm run mobile:sync` – build + kopiowanie do projektów natywnych
- `npm run android` – sync + otwarcie Android Studio

## Konwencje
- Komponenty: `src/components/<obszar>/` (quiz, gamification, ui)
- Typy: `src/types/`, logika: `src/lib/`, dane testowe: `src/data/`
- Teksty UI po polsku
