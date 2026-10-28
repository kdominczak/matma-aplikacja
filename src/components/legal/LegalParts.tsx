import type { ReactNode } from "react";

/** Brakujące dane administratora (src/data/legal.ts) – widoczne, żeby nie wydać aplikacji z pustym polem. */
export function Missing({ what }: { what: string }) {
  return <mark className="rounded bg-amber-500/20 px-1 font-semibold text-amber-800 dark:text-amber-200">[do uzupełnienia: {what}]</mark>;
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
      <div className="flex flex-col gap-2 text-body [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal">{children}</div>
    </section>
  );
}

export function ContactEmail({ email, subject }: { email: string; subject?: string }) {
  if (!email) return <Missing what="e-mail kontaktowy" />;
  const href = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <a href={href} className="font-bold break-all text-brand underline">
      {email}
    </a>
  );
}
