import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-white p-6 pt-[env(safe-area-inset-top)] text-center">
      <div>
        <div className="text-7xl">📐</div>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-800">Matma</h1>
        <p className="mt-2 text-lg text-slate-500">
          Codziennie 5 minut do zdanej matury
        </p>
      </div>
      <Link
        href="/quiz"
        className="w-full max-w-sm rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 py-4 text-lg font-bold uppercase text-white active:translate-y-0.5 active:border-b-2"
      >
        Zacznij lekcję
      </Link>
    </main>
  );
}
