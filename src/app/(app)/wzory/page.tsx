import { Page, PageHeader } from "@/components/layout/AppShell";
import CategoryTile from "@/components/topic/CategoryTile";
import FormulaList from "@/components/topic/FormulaList";
import { formulaGroup, topics } from "@/data/topics";

export const metadata = { title: "Wzory – Matma" };

export default function FormulasPage() {
  const withFormulas = topics.filter((t) => formulaGroup(t).formulas.length > 0);

  return (
    <Page>
      <PageHeader title="Wzory" subtitle="Wszystkie wzory z działów w jednym miejscu." />

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Działy">
        {withFormulas.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-sm font-bold text-muted transition-colors hover:border-brand/40 hover:text-brand"
          >
            {topic.title}
          </a>
        ))}
      </nav>

      <div className="gap-6 lg:columns-2">
        {withFormulas.map((topic) => (
          <section key={topic.id} id={topic.id} className="mb-8 break-inside-avoid scroll-mt-6">
            <div className="mb-3 flex items-center gap-3">
              <CategoryTile topic={topic} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-faint">{topic.lesson}</p>
                <h2 className="text-lg font-extrabold text-ink">{topic.title}</h2>
              </div>
            </div>
            <FormulaList formulas={formulaGroup(topic).formulas} />
          </section>
        ))}
      </div>
    </Page>
  );
}
