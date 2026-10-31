import Icon from "@/components/ui/Icon";
import { CKE_DISCLAIMER } from "@/data/legal";

/**
 * Informacja, że aplikacja nie jest powiązana z CKE – przy arkuszach, na ekranie głównym i w Premium.
 * `card` – osobna ramka (listy arkuszy), domyślnie – dyskretna stopka pod treścią.
 */
export default function CkeNotice({ variant = "footer", className = "" }: { variant?: "footer" | "card"; className?: string }) {
  if (variant === "card") {
    return (
      <p className={`flex items-start gap-3 rounded-2xl border border-line bg-subtle/60 p-4 text-sm text-muted ${className}`}>
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        {CKE_DISCLAIMER}
      </p>
    );
  }
  return (
    <p className={`flex items-center justify-center gap-1.5 text-center text-xs text-faint ${className}`}>
      <Icon name="info" className="h-3.5 w-3.5 shrink-0" />
      {CKE_DISCLAIMER}
    </p>
  );
}
