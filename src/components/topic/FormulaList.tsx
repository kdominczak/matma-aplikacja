import Formula from "@/components/ui/Formula";
import type { Formula as FormulaType } from "@/types/topic";

/** Lista kart ze wzorami – w zakładce działu, ściądze w quizie i na ekranie „Wzory”. */
export default function FormulaList({ formulas, columns = false }: { formulas: FormulaType[]; columns?: boolean }) {
  return (
    <ul className={`grid grid-cols-1 gap-3 ${columns ? "sm:grid-cols-2" : ""}`}>
      {formulas.map((formula) => (
        <li key={formula.label} className="min-w-0 card-hover rounded-2xl border border-line glass-card px-4 py-3 shadow-card hover:border-brand/40">
          <p className="text-xs font-bold uppercase tracking-wide text-faint">{formula.label}</p>
          <Formula tex={formula.tex} className="mt-1 text-ink" />
        </li>
      ))}
    </ul>
  );
}
