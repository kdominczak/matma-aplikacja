"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Page, PageHeader } from "@/components/layout/AppShell";
import Icon, { type IconName } from "@/components/ui/Icon";
import { CKE_ARCHIVE_URL, EXAM_YEARS, FORMULA_SHEET_URL, type ExamYear, type SheetLevel } from "@/data/cke-sheets";
import { hapticTap } from "@/lib/haptics";
import { openExternal } from "@/lib/external";

const LEVELS: { id: SheetLevel; label: string }[] = [
  { id: "podstawowy", label: "Poziom podstawowy" },
  { id: "rozszerzony", label: "Poziom rozszerzony" },
];

export default function SheetsView() {
  const [level, setLevel] = useState<SheetLevel>("podstawowy");

  return (
    <Page>
      <PageHeader
        title="Arkusze CKE"
        subtitle="Prawdziwe matury z poprzednich lat – rozwiąż arkusz na czas i sprawdź się z kluczem."
      />

      <section className="flex gap-3 rounded-3xl border border-line bg-card p-4 text-sm shadow-card">
        <Icon name="book" className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-body">
          Materiały pochodzą ze zbiorów <strong className="text-ink">Centralnej Komisji Egzaminacyjnej (CKE)</strong>. Linki
          prowadzą bezpośrednio do oficjalnych plików PDF w serwisie{" "}
          <ExternalLink href={CKE_ARCHIVE_URL} className="font-bold text-brand underline">
            cke.gov.pl
          </ExternalLink>
          . Aplikacja nie jest powiązana z CKE.
        </p>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid max-w-md flex-1 grid-cols-2 rounded-2xl border border-line bg-card p-1 shadow-card" role="radiogroup" aria-label="Poziom">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={level === l.id}
              onClick={() => setLevel(l.id)}
              className={`rounded-xl py-2 text-sm font-bold transition-colors ${
                level === l.id ? "bg-brand text-white shadow-float" : "text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <ExternalLink
          href={FORMULA_SHEET_URL}
          className="flex items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3 text-sm font-bold text-brand transition-transform hover:-translate-y-0.5"
        >
          <Icon name="layers" className="h-5 w-5 shrink-0" />
          Karta „Wybrane wzory matematyczne” (CKE)
          <Icon name="arrow" className="h-4 w-4 shrink-0" />
        </ExternalLink>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {EXAM_YEARS.map((exam) => (
          <YearCard key={exam.year} exam={exam} level={level} />
        ))}
      </div>

      <p className="text-sm text-muted">
        Arkusze z formuły 2015 (do 2022 r.) to dobry trening, ale część zadań wykracza poza obecną podstawę, a punktacja jest
        inna. Pozostałe sesje i wersje dostosowane znajdziesz na{" "}
        <ExternalLink href={CKE_ARCHIVE_URL} className="font-bold text-brand underline">
          stronie CKE
        </ExternalLink>
        .
      </p>
    </Page>
  );
}

function YearCard({ exam, level }: { exam: ExamYear; level: SheetLevel }) {
  const files = exam.levels[level];
  const current = exam.formula === "2023";

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-line bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-ink">{exam.year}</p>
          <p className="text-sm text-muted">Termin główny · maj</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
            current ? "bg-brand-soft text-brand" : "bg-subtle text-muted"
          }`}
        >
          Formuła {exam.formula}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <FileButton href={files.exam} icon="book" primary>
          Arkusz egzaminacyjny
        </FileButton>
        <FileButton href={files.solutions} icon="checkCircle">
          Zasady oceniania (klucz)
        </FileButton>
        {files.answerCard && (
          <FileButton href={files.answerCard} icon="square">
            Karta odpowiedzi
          </FileButton>
        )}
      </div>

      <ExternalLink href={exam.page} className="mt-auto text-xs font-bold text-faint hover:text-brand">
        Inne wersje arkusza na cke.gov.pl →
      </ExternalLink>
    </article>
  );
}

function FileButton({ href, icon, primary = false, children }: { href: string; icon: IconName; primary?: boolean; children: ReactNode }) {
  return (
    <ExternalLink
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
        primary ? "bg-brand text-white shadow-float active:bg-brand-dark" : "border border-line bg-surface text-ink hover:border-brand/40"
      }`}
    >
      <Icon name={icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1">{children}</span>
      <span className={`text-[10px] font-extrabold ${primary ? "text-white/70" : "text-faint"}`}>PDF</span>
    </ExternalLink>
  );
}

/**
 * Link do zewnętrznego pliku: w przeglądarce zwykły <a> w nowej karcie (można też skopiować adres),
 * w aplikacji natywnej – przeglądarka systemowa wewnątrz aplikacji.
 */
function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    hapticTap();
    if (Capacitor.isNativePlatform()) {
      e.preventDefault();
      openExternal(href);
    }
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
