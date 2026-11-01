"use client";

import Icon from "@/components/ui/Icon";
import { hapticTap } from "@/lib/haptics";
import type { Level } from "@/types/topic";

const OPTIONS: { levels: Level[]; title: string; text: string; extendedOnly?: boolean }[] = [
  { levels: ["podstawowy"], title: "Podstawowa", text: "Obowiązkowa dla wszystkich – 50 pkt, próg 30%." },
  { levels: ["podstawowy", "rozszerzony"], title: "Podstawowa + rozszerzona", text: "Dwa plany i dwa szacowane wyniki – przełączasz jednym stuknięciem." },
  {
    levels: ["rozszerzony"],
    title: "Skupiam się na rozszerzeniu",
    text: "Podstawę masz opanowaną – plan i ekran główny tylko pod rozszerzenie.",
    extendedOnly: true,
  },
];

const same = (a: Level[], b: Level[]) => a.length === b.length && a.every((l) => b.includes(l));

/**
 * Wybór matur ucznia. Matura podstawowa z matematyki jest obowiązkowa, więc „tylko rozszerzenie” to skupienie nauki,
 * a nie rezygnacja z podstawy – dostępne w ustawieniach (`allowExtendedOnly`), w powitaniu wystarczą dwie opcje.
 */
export default function LevelPicker({
  value,
  onChange,
  allowExtendedOnly = false,
}: {
  value: Level[];
  onChange: (levels: Level[]) => void;
  allowExtendedOnly?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Którą maturę zdajesz?" className="flex flex-col gap-2">
      {OPTIONS.filter((o) => allowExtendedOnly || !o.extendedOnly).map((option) => {
        const checked = same(option.levels, value);
        return (
          <button
            key={option.title}
            role="radio"
            aria-checked={checked}
            onClick={() => {
              hapticTap();
              onChange(option.levels);
            }}
            className={`press flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              checked ? "border-brand bg-brand-soft/60 ring-1 ring-brand/40" : "border-line hover:border-brand/60 dark:hover:border-brand/40"
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                checked ? "border-brand bg-brand text-on-brand" : "border-line"
              }`}
            >
              {checked && <Icon name="check" className="h-3 w-3" />}
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-ink">{option.title}</span>
              <span className="block text-sm text-muted">{option.text}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
