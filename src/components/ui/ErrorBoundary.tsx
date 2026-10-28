"use client";

import { useEffect } from "react";
import { catchError, type ErrorInfo } from "next/error";
import ErrorState from "@/components/ui/ErrorState";

function Fallback({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return <ErrorState compact message="Ta część ekranu nie wczytała się poprawnie. Reszta aplikacji działa dalej." onRetry={retry} />;
}

/**
 * Granica błędu dla fragmentu ekranu (np. brudnopis, ranking): awaria jednego elementu
 * pokazuje kartę z „Spróbuj ponownie”, a nie wywraca całego widoku. `catchError` z Next.js
 * czyści błąd przy nawigacji i ponawia render w Transition.
 */
const ErrorBoundary = catchError(function ErrorBoundaryFallback(_props: object, { error, retry }: ErrorInfo) {
  return <Fallback error={error} retry={retry} />;
});

export default ErrorBoundary;
