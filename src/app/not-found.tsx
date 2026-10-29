import Link from "next/link";

export const metadata = { title: "Nie ma takiej strony – Matma" };

// Każdy nieznany adres (też w static export: out/404.html) – po polsku, w wyglądzie aplikacji.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-3xl font-extrabold text-white shadow-float">
        Σ
      </span>
      <h1 className="text-2xl font-extrabold text-ink">Nie ma takiej strony</h1>
      <p className="text-muted">Ten adres prowadzi donikąd – może dział zmienił nazwę albo link jest niepełny.</p>
      <Link
        href="/"
        className="mt-2 flex min-h-11 items-center rounded-2xl bg-brand px-6 font-bold text-white shadow-float transition-colors hover:bg-brand-dark"
      >
        Wróć na ekran główny
      </Link>
    </main>
  );
}
