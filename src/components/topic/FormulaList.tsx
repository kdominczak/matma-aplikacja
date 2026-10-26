import Formula from "@/components/ui/Formula";
import type { Formula as FormulaType } from "@/types/topic";

/** Lista kart ze wzorami – w zakładce działu, ściądze w quizie i na ekranie „Wzory”. */
export default function FormulaList({ formulas, columns = false }: { formulas: FormulaType[]; columns?: boolean }) {
  return (
    <ul className={`grid gap-3 ${columns ? "sm:grid-cols-2" : ""}`}>
      {formulas.map((formula) => (
        <li key={formula.label} className="rounded-2xl border border-line bg-card px-4 py-3 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wide text-faint">{formula.label}</p>
          <Formula tex={formula.tex} className="mt-1 text-ink" />
        </li>
      ))}
    </ul>
  );
}
