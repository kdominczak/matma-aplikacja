import type { ReactNode } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

// Elementy ekranu ustawień w stylu list grupowanych (jak w ustawieniach iOS / Notion):
// grupa = nagłówek nad kartą, w karcie wiersze rozdzielone linią; wiersz = kolorowa ikona, opis, kontrolka.

export type Tone = "brand" | "violet" | "emerald" | "amber" | "rose" | "sky" | "slate";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  slate: "bg-subtle text-muted",
};

export function IconTile({ icon, tone = "brand", size = "md" }: { icon: IconName; tone?: Tone; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  return (
    <span className={`flex shrink-0 items-center justify-center ${box} ${TONES[tone]}`}>
      <Icon name={icon} className={size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]"} />
    </span>
  );
}

/** Grupa ustawień z kotwicą (np. /ustawienia#konto). */
export function SettingsGroup({ id, title, hint, children }: { id?: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-2" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="px-1">
        <h2 id={id ? `${id}-title` : undefined} className="text-xs font-extrabold uppercase tracking-widest text-faint">
          {title}
        </h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div className="flex flex-col divide-y divide-line rounded-3xl border border-line glass-card shadow-card">{children}</div>
    </section>
  );
}

/** Zawartość wiersza bez własnej akcji (np. kontrolka pod spodem). */
export function SettingsBlock({ children }: { children: ReactNode }) {
  return <div className="p-4 sm:p-5">{children}</div>;
}

interface RowProps {
  icon: IconName;
  tone?: Tone;
  title: string;
  description?: ReactNode;
  /** Wartość/status po prawej (np. „Połączono”). */
  value?: ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
  external?: boolean;
}

/** Wiersz ustawień – cały klikalny, gdy ma `href` albo `onClick`. */
export function SettingsRow({ icon, tone, title, description, value, href, onClick, danger, external }: RowProps) {
  const body = (
    <>
      <IconTile icon={icon} tone={danger ? "rose" : tone} />
      <span className="min-w-0 flex-1">
        <span className={`block font-bold ${danger ? "text-rose-600 dark:text-rose-300" : "text-ink"}`}>{title}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      {value && <span className="shrink-0 text-sm font-semibold text-muted">{value}</span>}
      {(href || onClick) && <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />}
    </>
  );
  const base = "group flex w-full items-center gap-3 p-4 text-left first:rounded-t-3xl last:rounded-b-3xl sm:px-5";
  const className = `${base} transition-colors hover:bg-subtle/60 active:bg-subtle`;
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    ) : (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }
  return <div className={base}>{body}</div>;
}

/** Status w formie pigułki (np. „Kopia aktualna”). */
export function StatusPill({ tone, children }: { tone: "emerald" | "amber" | "slate" | "rose"; children: ReactNode }) {
  const styles = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    slate: "bg-subtle text-muted",
  }[tone];
  const dot = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", slate: "bg-faint" }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {children}
    </span>
  );
}
