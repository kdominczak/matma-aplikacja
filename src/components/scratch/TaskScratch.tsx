"use client";

import { useState } from "react";
import ScratchBoard, { type ScratchItem, type ScratchTemplate } from "@/components/scratch/ScratchBoard";
import Icon from "@/components/ui/Icon";
import { hapticTap } from "@/lib/haptics";
import type { FormulaGroup } from "@/types/topic";

type Props = {
  prompt: string;
  items: ScratchItem[];
  onChange: (items: ScratchItem[]) => void;
  template: ScratchTemplate;
  onTemplateChange: (template: ScratchTemplate) => void;
  formulaGroups: FormulaGroup[];
};

/**
 * Brudnopis przy zadaniu: na komputerze zawsze widoczny pod treścią,
 * na telefonie rozwijany przyciskiem; z obu można przejść do pełnego ekranu (te same notatki).
 */
export default function TaskScratch(props: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [full, setFull] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          hapticTap();
          setMobileOpen(!mobileOpen);
        }}
        aria-expanded={mobileOpen}
        className="flex items-center justify-between gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm font-bold text-orange-600 lg:hidden dark:text-orange-400"
      >
        <span className="flex items-center gap-2">
          <Icon name="pencil" className="h-4 w-4" />
          Brudnopis · kalkulator · wzory
          {props.items.length > 0 && <span className="h-2 w-2 rounded-full bg-orange-500" aria-label="masz notatki" />}
        </span>
        <Icon name="chevron" className={`h-4 w-4 transition-transform ${mobileOpen ? "-rotate-90" : "rotate-90"}`} />
      </button>

      <div className={`${mobileOpen ? "block" : "hidden"} animate-fade-in lg:block`}>
        <ScratchBoard variant="inline" {...props} onExpand={() => setFull(true)} />
      </div>

      {full && <ScratchBoard variant="full" {...props} onClose={() => setFull(false)} />}
    </>
  );
}
