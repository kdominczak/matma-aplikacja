"use client";

import { useEffect } from "react";
import Link from "next/link";
import ErrorState from "@/components/ui/ErrorState";

/** Wspólny ekran błędu dla plików error.tsx – z ponowieniem i powrotem na ekran główny. */
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-10">
      <ErrorState message="Ten ekran nie wczytał się poprawnie. Twój postęp jest zapisany na urządzeniu – nic nie przepadło." onRetry={retry} />
      <Link href="/" className="flex min-h-11 items-center text-sm font-bold text-brand hover:underline">
        Wróć na ekran główny
      </Link>
    </div>
  );
}
