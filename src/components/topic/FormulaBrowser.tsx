"use client";

import { useState } from "react";
import LevelSwitch, { useActiveLevel } from "@/components/progress/LevelSwitch";
import CategoryTile from "@/components/topic/CategoryTile";
import FormulaList from "@/components/topic/FormulaList";
import Icon from "@/components/ui/Icon";
import { formulaGroup, topicsOfLevel } from "@/data/topics";
import { useProgress } from "@/lib/progress";
import { matchesQuery } from "@/lib/search";

/**
 * Ekran „Wzory”: wszystkie wzory działów aktywnego poziomu (na podstawie bez wzorów rozszerzenia) z wyszukiwarką –
 * uczeń w trakcie zadania szuka konkretnego wzoru („pole trojkata”, „delta”), a nie przewija 25 działów.
 */
export default function FormulaBrowser() {
  const progress = useProgress();
  const { level } = useActiveLevel(progress);
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  const groups = topicsOfLevel(level)
    .map((topic) => {
      const { formulas } = formulaGroup(topic);
      // najpierw wzory pasujące nazwą; gdy żaden – cały dział, jeśli pasuje jego nazwa („logarytmy”)
      const byLabel = formulas.filter((f) => matchesQuery(f.label, query));
      const shown = !searching ? formulas : byLabel.length > 0 ? byLabel : matchesQuery(topic.title, query) ? formulas : [];
      return { topic, formulas: shown };
    })
    .filter((group) => group.formulas.length > 0);

  return (
    <>
      <LevelSwitch progress={progress} className="sm:max-w-sm" />

      <label className="relative block sm:max-w-sm">
        <span className="sr-only">Szukaj wzoru</span>
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj wzoru, np. pole trójkąta"
          enterKeyHint="search"
          className="min-h-11 w-full rounded-2xl border border-line bg-card py-2.5 pr-4 pl-10 text-ink placeholder:text-muted focus:border-brand focus:outline-none"
        />
      </label>

      {!searching && (
        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Działy">
          {groups.map(({ topic }) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="flex min-h-10 shrink-0 items-center rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold text-muted transition-colors hover:border-brand/60 hover:text-brand dark:hover:border-brand/40"
            >
              {topic.title}
            </a>
          ))}
        </nav>
      )}

      {groups.length === 0 ? (
        <p className="card p-5 text-center text-sm text-muted">Nie ma wzoru „{query.trim()}”. Spróbuj innego słowa, np. nazwy działu.</p>
      ) : (
        <div className="gap-6 lg:columns-2">
          {groups.map(({ topic, formulas }) => (
            <section key={topic.id} id={topic.id} className="mb-8 break-inside-avoid scroll-mt-6">
              <div className="mb-3 flex items-center gap-3">
                <CategoryTile topic={topic} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">{topic.category}</p>
                  <h2 className="text-lg font-extrabold text-ink">{topic.title}</h2>
                </div>
              </div>
              <FormulaList formulas={formulas} />
            </section>
          ))}
        </div>
      )}
    </>
  );
}
