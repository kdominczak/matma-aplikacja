"use client";

import FunctionPlot from "@/components/ui/FunctionPlot";
import MathText from "@/components/ui/MathText";
import { hapticTap } from "@/lib/haptics";
import { soundSelect } from "@/lib/sounds";
import type { ChoiceQuestion } from "@/types/exam";

/**
 * Odpowiedź w zadaniu „wybierz spośród A–F” z arkusza CKE: karty odpowiedzi (tekst albo rysunek) i luki z literami.
 * Luka z jedną literą działa jak wybór jednokrotny, z kilkoma – zaznacza się najwyżej tyle liter, ile ma klucz.
 * Przy jednej luce można też stuknąć w samą kartę odpowiedzi.
 */
export default function ChoiceAnswer({ question, picks, onChange }: { question: ChoiceQuestion; picks: string[][]; onChange: (picks: string[][]) => void }) {
  const single = question.blanks.length === 1;

  function toggle(blank: number, key: string) {
    const size = question.blanks[blank].answer.length;
    const current = picks[blank] ?? [];
    let next: string[];
    if (current.includes(key)) next = current.filter((k) => k !== key);
    else if (size === 1) next = [key];
    else if (current.length < size) next = [...current, key];
    else return; // komplet liter – najpierw trzeba odznaczyć którąś
    soundSelect();
    hapticTap();
    onChange(question.blanks.map((_, i) => (i === blank ? next : (picks[i] ?? []))));
  }

  return (
    <section className="flex flex-col gap-4">
      <ul className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const selected = single && (picks[0] ?? []).includes(option.key);
          const body = (
            <>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selected ? "bg-brand text-on-brand" : "bg-subtle text-muted"}`}>
                {option.key}
              </span>
              <span className="min-w-0 flex-1">
                {option.text && <MathText display text={option.text} />}
                {option.figure && <FunctionPlot plot={option.figure} />}
                {option.image && (
                  // rysunek z arkusza CKE (czarne linie) – zawsze na białym tle, także w ciemnym motywie
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={option.image} alt={`Rysunek ${option.key}`} className="mx-auto w-full max-w-60 rounded-xl bg-white p-2" />
                )}
              </span>
            </>
          );
          return (
            <li key={option.key}>
              {single ? (
                <button
                  onClick={() => toggle(0, option.key)}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3 text-left text-base font-semibold transition-all duration-150 ${
                    selected ? "border-brand bg-brand-soft text-brand shadow-card" : "border-line glass-card text-ink hover:border-brand/60 dark:hover:border-brand/40 active:scale-[0.99]"
                  }`}
                >
                  {body}
                </button>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border-2 border-line glass-card p-3 text-base font-semibold text-ink">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {question.blanks.map((blank, i) => {
        const mine = picks[i] ?? [];
        const size = blank.answer.length;
        return (
          <fieldset key={i} className="rounded-2xl border border-line bg-subtle/50 p-3">
            <legend className="px-1 text-sm font-bold text-body">
              {blank.label ? <MathText text={blank.label} /> : "Twoja odpowiedź"}
              <span className="ml-1 font-semibold text-muted">· {size === 1 ? "wybierz jedną literę" : `wybierz ${size} litery (${mine.length}/${size})`}</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {question.options.filter((option) => !blank.keys || blank.keys.includes(option.key)).map((option) => {
                const on = mine.includes(option.key);
                return (
                  <button
                    key={option.key}
                    onClick={() => toggle(i, option.key)}
                    aria-pressed={on}
                    aria-label={`${blank.label ? `${blank.label}: ` : ""}${option.key}`}
                    className={`press flex h-11 w-11 items-center justify-center rounded-xl border-2 text-base font-extrabold transition-colors ${
                      on ? "border-brand bg-brand text-on-brand" : "border-line bg-card text-ink hover:border-brand/60"
                    }`}
                  >
                    {option.key}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </section>
  );
}
