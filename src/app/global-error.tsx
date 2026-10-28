"use client";

import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

/** Ostatnia linia obrony: błąd w głównym layoucie. Zastępuje cały dokument, więc ma własne <html> i motyw. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <title>Matma – wystąpił błąd</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh items-center justify-center p-4 font-sans">
        <main className="flex w-full max-w-sm flex-col items-center gap-3 rounded-3xl border border-line bg-card p-8 text-center shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-3xl text-rose-500">!</span>
          <h1 className="text-lg font-extrabold text-ink">Aplikacja napotkała błąd</h1>
          <p className="text-sm text-muted">Twój postęp jest zapisany na urządzeniu. Spróbuj ponownie albo uruchom aplikację jeszcze raz.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-1 min-h-11 rounded-2xl bg-brand px-5 py-3 text-sm font-bold text-white shadow-float"
          >
            Spróbuj ponownie
          </button>
        </main>
      </body>
    </html>
  );
}
