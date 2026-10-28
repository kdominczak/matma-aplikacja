import type { ReactNode } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

/** Pusty stan: ikona w kole, krótki tytuł, jedno zdanie i (opcjonalnie) przycisk do pierwszego kroku. */
export default function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-subtle/60 px-5 py-7 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-brand shadow-card">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-1 font-extrabold text-ink">{title}</p>
      {children && <p className="max-w-sm text-sm text-muted">{children}</p>}
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-brand px-4 text-sm font-bold text-white shadow-float btn-hover active:scale-[0.98]"
        >
          {action.label} <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
