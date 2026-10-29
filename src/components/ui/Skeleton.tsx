import type { ReactNode } from "react";

// Szkielety ładowania: zamiast pustego ekranu (postęp z Preferences, dane z Supabase) pokazujemy zarys widoku.
// Pulsują tylko przy włączonym ruchu (motion-safe) – przy „ogranicz ruch” są po prostu szare.

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block rounded-2xl bg-subtle motion-safe:animate-pulse ${className}`} />;
}

/** Obudowa dla czytników ekranu: jedno „Wczytywanie…” zamiast wielu pustych bloków. */
function Loading({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">Wczytywanie…</span>
      {children}
    </div>
  );
}

/** Zarys karty: ikonka, dwie linijki tekstu. */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`card flex items-center gap-4 p-5 ${className}`}>
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Zarys ekranu z zakładek (Profil, Ustawienia, Odznaki…): nagłówek, duża karta i kilka mniejszych.
 * Te same marginesy co `Page`, więc po wczytaniu treść nie „skacze”.
 */
export function PageSkeleton({ cards = 3, hero = true }: { cards?: number; hero?: boolean }) {
  return (
    <Loading className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 max-w-full rounded-full" />
      </div>
      {hero && <Skeleton className="h-56 rounded-3xl" />}
      {Array.from({ length: cards }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </Loading>
  );
}

/** Zarys ekranu pełnoekranowego (test, plan, wyzwanie): pasek postępu, treść zadania i cztery odpowiedzi. */
export function QuizSkeleton() {
  return (
    <Loading className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 bg-surface px-4 pt-[calc(1rem+env(safe-area-inset-top))]">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 flex-1 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-7 w-40 rounded-xl" />
      <Skeleton className="h-28 rounded-3xl" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-2xl" />
      ))}
    </Loading>
  );
}
