"use client";

import { createContext, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import ExamPicker from "@/components/exam/ExamPicker";
import { Page, PageHeader } from "@/components/layout/AppShell";
import ErrorState from "@/components/ui/ErrorState";
import Icon, { type IconName } from "@/components/ui/Icon";
import { CKE_ARCHIVE_URL, EXAM_YEARS, FORMULA_SHEET_URL, type ExamYear, type SheetLevel } from "@/data/cke-sheets";
import { hapticTap } from "@/lib/haptics";
import { openExternal } from "@/lib/external";
import { useOnline } from "@/lib/network";

/** Otwiera plik CKE; błąd (brak sieci, zablokowana przeglądarka) zgłasza do widoku zamiast go połykać. */
const OpenSheetContext = createContext<(href: string) => void>(() => {});

const LEVELS: { id: SheetLevel; label: string }[] = [
  { id: "podstawowy", label: "Poziom podstawowy" },
  { id: "rozszerzony", label: "Poziom rozszerzony" },
];

export default function SheetsView() {
  const [level, setLevel] = useState<SheetLevel>("podstawowy");
  const online = useOnline();
  const [failed, setFailed] = useState<string | null>(null);

  async function open(href: string) {
    if (!navigator.onLine) {
      setFailed(href);
      return;
    }
    try {
      await openExternal(href);
      setFailed(null);
    } catch (error) {
      console.warn("Nie udało się otworzyć arkusza:", error);
      setFailed(href);
    }
  }

  return (
    <OpenSheetContext.Provider value={(href) => void open(href)}>
      <Page>
        <PageHeader
          title="Arkusze"
          subtitle="Arkusze w układzie prawdziwej matury i oryginalne matury CKE – rozwiąż na czas i sprawdź się z kluczem."
        />

        <ExamPicker />

        <h2 className="-mb-2 text-xl font-extrabold text-ink">Oficjalne arkusze CKE (PDF)</h2>

        {!online && (
          <p role="status" className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-800 dark:text-amber-200">
            <Icon name="wifiOff" className="h-5 w-5 shrink-0" />
            Jesteś offline. Arkusze CKE to pliki PDF z cke.gov.pl – otworzysz je po połączeniu z internetem.
          </p>
        )}

        <section className="flex gap-3 rounded-3xl border border-line glass-card p-4 text-sm shadow-card">
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
            className="flex items-center gap-3 rounded-2xl border border-brand/25 bg-brand-soft px-4 py-3 text-sm font-bold text-brand card-hover hover:border-brand/50"
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

        {failed && (
          <div className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 lg:inset-x-auto lg:right-8 lg:bottom-8 lg:w-96">
            <ErrorState
              compact
              title="Nie udało się otworzyć arkusza"
              message={online ? "Serwer CKE nie odpowiada albo plik jest chwilowo niedostępny." : undefined}
              onRetry={() => open(failed)}
              onDismiss={() => setFailed(null)}
              className="shadow-2xl"
            />
          </div>
        )}
      </Page>
    </OpenSheetContext.Provider>
  );
}

function YearCard({ exam, level }: { exam: ExamYear; level: SheetLevel }) {
  const files = exam.levels[level];
  const current = exam.formula === "2023";

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-line glass-card p-5 shadow-card">
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

      <ExternalLink href={exam.page} className="mt-auto -mb-2 flex min-h-11 items-center text-xs font-bold text-faint hover:text-brand">
        Inne wersje arkusza na cke.gov.pl →
      </ExternalLink>
    </article>
  );
}

function FileButton({ href, icon, primary = false, children }: { href: string; icon: IconName; primary?: boolean; children: ReactNode }) {
  return (
    <ExternalLink
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold btn-hover ${
        primary ? "bg-brand text-white shadow-float active:bg-brand-dark" : "border border-line bg-surface text-ink hover:border-brand/40"
      }`}
    >
      <Icon name={icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1">{children}</span>
      <span className={`text-[11px] font-extrabold ${primary ? "text-white/70" : "text-faint"}`}>PDF</span>
    </ExternalLink>
  );
}

/**
 * Link do zewnętrznego pliku: w przeglądarce zwykły <a> w nowej karcie (można też skopiować adres),
 * w aplikacji natywnej – przeglądarka systemowa wewnątrz aplikacji.
 */
function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const open = useContext(OpenSheetContext);
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    hapticTap();
    // bez sieci nowa karta pokazałaby tylko stronę błędu przeglądarki – zamiast tego nasz komunikat z ponowieniem
    if (Capacitor.isNativePlatform() || !navigator.onLine) {
      e.preventDefault();
      open(href);
    }
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
