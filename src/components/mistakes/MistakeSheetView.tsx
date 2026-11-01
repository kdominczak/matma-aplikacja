"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDisplayName } from "@/components/layout/AppShell";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { QuizSkeleton } from "@/components/ui/Skeleton";
import { LEGAL } from "@/data/legal";
import { useExamAttempts } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import { buildMistakeSheet, SHEET_DAYS, type SheetItem } from "@/lib/mistake-sheet";
import { displayedOptions, displayKey } from "@/lib/options";
import { plural } from "@/lib/plural";
import { printPage } from "@/lib/print";
import { useProgress } from "@/lib/progress";
import { formatDay } from "@/lib/stats";

/**
 * Spersonalizowany arkusz poprawek z błędów – kartka A4 do wydruku albo PDF (systemowy dialog druku).
 * Na ekranie podgląd kartki (zawsze jasnej), nad nią pasek z okresem i przyciskiem; pasek nie trafia na wydruk.
 */
export default function MistakeSheetView() {
  const progress = useProgress();
  const attempts = useExamAttempts();
  const name = useDisplayName();
  const [allTime, setAllTime] = useState(false);
  const [withKey, setWithKey] = useState(true);
  const [error, setError] = useState(false);

  const sheet = useMemo(
    () => (progress && attempts ? buildMistakeSheet(progress, attempts, { days: allTime ? null : SHEET_DAYS }) : null),
    [progress, attempts, allTime],
  );
  if (!sheet) return <QuizSkeleton />;

  const empty = sheet.items.length === 0;

  async function save() {
    hapticTap();
    setError(false);
    try {
      await printPage(`Arkusz-poprawek-${sheet!.to}`);
    } catch (e) {
      console.warn("Nie udało się otworzyć drukowania:", e);
      setError(true);
    }
  }

  return (
    <div className="min-h-dvh bg-surface pb-10 print:bg-white print:p-0">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 pt-[env(safe-area-inset-top)] print:hidden">
        <div className="mx-auto flex max-w-[210mm] flex-col gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/bledy" aria-label="Wróć do Pudełka porażek" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-muted hover:bg-subtle hover:text-ink">
              <Icon name="back" className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-extrabold text-ink">Arkusz poprawek z błędów</h1>
              <p className="truncate text-sm text-muted">
                {empty ? "Brak zadań do poprawy" : `${sheet.items.length} ${plural(sheet.items.length, "zadanie", "zadania", "zadań")} · ${sheet.points} pkt`}
              </p>
            </div>
            <button
              onClick={() => void save()}
              disabled={empty}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-cta px-4 font-bold text-on-cta shadow-float btn-hover btn-shine active:bg-cta-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              <Icon name="file" className="h-4 w-4" />
              Zapisz PDF
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div role="radiogroup" aria-label="Okres" className="flex rounded-2xl border border-line bg-card p-1">
              {[
                { all: false, label: `Ostatnie ${SHEET_DAYS} dni` },
                { all: true, label: "Od początku" },
              ].map((option) => (
                <button
                  key={option.label}
                  role="radio"
                  aria-checked={allTime === option.all}
                  onClick={() => setAllTime(option.all)}
                  className={`min-h-9 rounded-xl px-3 font-bold transition-colors ${allTime === option.all ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="flex min-h-11 items-center gap-2 px-1 font-semibold text-body">
              <input type="checkbox" checked={withKey} onChange={(e) => setWithKey(e.target.checked)} className="h-4 w-4 accent-[var(--color-brand)]" />
              Odpowiedzi na osobnej stronie
            </label>
          </div>
          {error && (
            <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">
              Nie udało się otworzyć drukowania. Spróbuj ponownie albo zaktualizuj aplikację.
            </p>
          )}
          {!empty && <p className="text-xs text-muted">W oknie drukowania wybierz „Zapisz jako PDF”, żeby mieć plik, albo drukarkę.</p>}
        </div>
      </header>

      {empty ? (
        <section className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Icon name="checkCircle" className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-extrabold text-ink">{allTime ? "Nie ma czego poprawiać" : `Brak błędów z ostatnich ${SHEET_DAYS} dni`}</h2>
          <p className="text-sm text-muted">
            Arkusz zbiera zadania z Pudełka porażek, nierozwiązane zadania otwarte i błędy z arkuszy.
            {!allTime && " Sprawdź „Od początku” albo rozwiąż kilka zadań."}
          </p>
          <Link href="/zadania" className="mt-2 flex min-h-11 items-center rounded-2xl bg-cta px-5 font-bold text-on-cta shadow-float active:bg-cta-dark">
            Przejdź do zadań
          </Link>
        </section>
      ) : (
        <Paper items={sheet.items} name={name} from={sheet.from} to={sheet.to} points={sheet.points} withKey={withKey} />
      )}
    </div>
  );
}

function Paper({ items, name, from, to, points, withKey }: { items: SheetItem[]; name: string; from: string | null; to: string; points: number; withKey: boolean }) {
  const student = name === "Twój profil" ? null : name;
  return (
    <article className="paper mx-auto mt-4 max-w-[210mm] rounded-sm p-[12mm] text-[15px] leading-relaxed shadow-card print:mt-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
      <header className="flex flex-col gap-2 border-b-2 border-ink pb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">{LEGAL.appName} · arkusz poprawek</p>
        <h2 className="text-2xl font-extrabold text-ink">Moje zadania do poprawy{student ? ` – ${student}` : ""}</h2>
        <p className="text-sm text-body">
          {from ? `Błędy z okresu ${formatDay(from)} – ${formatDay(to)}` : `Wszystkie zapisane błędy, stan na ${formatDay(to)}`} · {items.length}{" "}
          {plural(items.length, "zadanie", "zadania", "zadań")} · {points} pkt
        </p>
        <div className="flex flex-wrap justify-between gap-x-8 gap-y-1 pt-1 text-sm text-body">
          <span>Data rozwiązania: ………………………</span>
          <span>
            Wynik: ……… / {points} pkt
          </span>
        </div>
      </header>

      <p className="mt-3 text-sm text-muted">
        Rozwiąż zadania bez zaglądania do odpowiedzi. W zamkniętych zakreśl jedną odpowiedź, w otwartych zapisz pełne rozwiązanie – punkty
        przyznasz sobie ze schematu na końcu.
      </p>

      <ol className="mt-4 flex flex-col gap-6">
        {items.map((item, i) => (
          <Task key={item.task.id} item={item} number={i + 1} />
        ))}
      </ol>

      {withKey && <AnswerKey items={items} />}

      <footer className="mt-8 border-t border-line pt-2 text-[11px] text-muted">
        Wygenerowano w aplikacji {LEGAL.appName} {formatDay(to)} na podstawie Twoich błędów. Zadania bez dopisku źródła są zadaniami autorskimi aplikacji.
      </footer>
    </article>
  );
}

function meta(item: SheetItem): string {
  const label = item.task.kind === "closed" ? item.task.question.label : item.task.task.label;
  const parts = [label, `${plural(item.wrong, "błąd", "błędy", "błędów")}: ${item.wrong}`, `ostatnio ${formatDay(item.lastDay)}`];
  if (item.source) parts.push(item.source);
  return parts.filter(Boolean).join(" · ");
}

function Task({ item, number }: { item: SheetItem; number: number }) {
  const { task } = item;
  const figure = task.kind === "closed" ? task.question.figure : task.task.figure;
  return (
    <li className="print-avoid flex flex-col gap-2">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-extrabold text-ink">Zadanie {number}.</span>
        <span className="text-sm text-muted">
          ({task.points === 1 ? "0–1 pkt" : `0–${task.points} pkt`})
        </span>
      </p>
      <p className="-mt-1 text-[11px] text-muted">{meta(item)}</p>
      <p className="text-ink">
        <MathText text={task.kind === "closed" ? task.question.prompt : task.task.prompt} />
      </p>
      {figure && (
        <div className="max-w-[80mm]">
          <FunctionPlot plot={figure} />
        </div>
      )}
      {task.kind === "closed" ? (
        <ul className={`grid gap-x-6 gap-y-1.5 ${task.question.format === "truefalse" ? "" : "sm:grid-cols-2 print:grid-cols-2"}`}>
          {displayedOptions(task.question).map(({ label, key, text }) => (
            <li key={key} className="flex items-baseline gap-2">
              <span className="font-bold text-ink">{label}.</span>
              <MathText display text={text} />
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="paper-grid rounded-sm border border-line" style={{ height: `${30 + task.points * 18}mm` }} aria-label="Miejsce na rozwiązanie" />
          <p className="text-sm text-body">
            Odpowiedź: {task.task.answerLabel ? <MathText text={task.task.answerLabel} /> : null} ……………………………………
          </p>
        </>
      )}
    </li>
  );
}

function AnswerKey({ items }: { items: SheetItem[] }) {
  return (
    <section className="print-break mt-10 border-t-2 border-ink pt-4 print:mt-0 print:border-t-0 print:pt-0">
      <h2 className="text-xl font-extrabold text-ink">Odpowiedzi i schemat oceniania</h2>
      <ol className="mt-3 flex flex-col gap-4 text-sm">
        {items.map((item, i) => (
          <li key={item.task.id} className="print-avoid flex flex-col gap-1">
            {item.task.kind === "closed" ? (
              <>
                <p className="font-bold text-ink">
                  {i + 1}. Odpowiedź {displayKey(item.task.question, item.task.question.correct)}
                </p>
                <p className="text-body">
                  <MathText text={item.task.question.explanation} />
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-ink">
                  {i + 1}. Wynik: {item.task.task.answerLabel ? <MathText text={item.task.task.answerLabel} /> : null}{" "}
                  {item.task.task.answers[0].replace(";", "; ")}
                </p>
                <ul className="flex flex-col gap-1 pl-4">
                  {item.task.task.solution.map((step, s) => (
                    <li key={s} className="flex gap-2 text-body">
                      <span className="shrink-0 font-bold text-ink">{step.points} pkt</span>
                      <MathText text={step.step} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
