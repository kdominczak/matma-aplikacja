import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";

/** Nazwa sekcji z pułapkami egzaminacyjnymi – w jednym miejscu, łatwa do zmiany. */
export const TRAPS_LABEL = "Haczyk CKE";

/** Ostrzeżenie o typowej pułapce maturalnej – luźnym, młodzieżowym językiem. Karta na tle wyniku (szałwia/cegła), więc neutralna, ze złotym akcentem. */
export default function TrapCard({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-dashed border-brand/50 bg-card ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand">
        <Icon name="alert" className="h-4 w-4" />
        {TRAPS_LABEL}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        <MathText text={text} />
      </p>
    </div>
  );
}
