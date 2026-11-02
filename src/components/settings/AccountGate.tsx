"use client";

import AccountCard from "@/components/settings/AccountCard";
import Icon from "@/components/ui/Icon";

/**
 * Zamiast funkcji, która wymaga konta (korepetytor AI, kody poleceń): logowanie na miejscu – Google, e-mail z hasłem
 * albo kod. Po zalogowaniu karta znika sama (ekran sprawdza stan konta).
 */
export default function AccountGate({ title, text }: { title: string; text: string }) {
  return (
    <section className="card flex flex-col gap-4 border-brand/40 p-5" aria-label={title}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="user" className="h-6 w-6" />
        </span>
        <p className="pt-2 font-extrabold text-ink">{title}</p>
      </div>
      <AccountCard embedded intro={text} />
    </section>
  );
}
