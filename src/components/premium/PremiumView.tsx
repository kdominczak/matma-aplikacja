"use client";

import { Page, PageHeader } from "@/components/layout/AppShell";
import ReferralCard from "@/components/premium/ReferralCard";
import Icon, { type IconName } from "@/components/ui/Icon";
import { AI_FREE_DAILY_LIMIT, formatPremiumUntil, isPremium, PLANS, usePremium } from "@/lib/premium";

const BENEFITS: { icon: IconName; title: string; text: string; soon?: boolean }[] = [
  { icon: "sparkles", title: "Korepetytor AI bez limitu", text: `Za darmo ${AI_FREE_DAILY_LIMIT} wiadomości dziennie, z Premium – ile potrzebujesz przed klasówką.` },
  { icon: "camera", title: "Zdjęcie rozwiązania → punkty jak na maturze", text: "Rozwiązujesz na kartce, robisz zdjęcie, dostajesz punkty za kolejne kroki według schematu.", soon: true },
  { icon: "file", title: "Arkusze losowe bez limitu", text: "Nowy arkusz w układzie matury, kiedy tylko chcesz, z analizą działów.", soon: true },
];

/** Ekran Premium: stan konta, korzyści, oferty (zakup po podłączeniu sklepu) i kody poleceń. */
export default function PremiumView() {
  const premium = usePremium();
  const active = isPremium(premium);

  return (
    <Page width="reading">
      <PageHeader title="Premium" subtitle="Nauka zostaje za darmo. Premium daje więcej AI i narzędzia na finisz przed maturą." />

      <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card lg:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">Twój plan</p>
        <h2 className="relative mt-1 text-2xl font-extrabold">{active ? "Premium aktywne" : "Plan darmowy"}</h2>
        <p className="relative mt-1 text-sm text-white/70">
          {active && premium.premiumUntil
            ? `Do ${formatPremiumUntil(premium.premiumUntil)}. Korepetytor AI bez limitu.`
            : premium.status === "ready"
              ? `Korepetytor AI: ${Math.max(0, premium.aiLimit - premium.aiUsed)} z ${premium.aiLimit} wiadomości na dziś.`
              : `Korepetytor AI: ${AI_FREE_DAILY_LIMIT} wiadomości dziennie.`}
        </p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="text-xl font-extrabold text-ink">
          Co daje Premium
        </h2>
        <ul className="flex flex-col gap-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="card flex items-start gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-extrabold text-ink">
                  {b.title}
                  {b.soon && <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-bold text-muted">wkrótce</span>}
                </p>
                <p className="text-sm text-muted">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ReferralCard />

      <section className="flex flex-col gap-3" aria-labelledby="plans-title">
        <h2 id="plans-title" className="text-xl font-extrabold text-ink">
          Kup Premium
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[PLANS.pass, PLANS.monthly].map((plan, i) => (
            <div key={plan.title} className={`card flex flex-col gap-1 p-5 ${i === 0 ? "border-brand/50 ring-2 ring-brand/20" : ""}`}>
              {i === 0 && <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Najlepszy wybór</p>}
              <p className="font-extrabold text-ink">{plan.title}</p>
              <p className="text-3xl font-extrabold tracking-tight text-ink tabular-nums">{plan.price}</p>
              <p className="text-sm text-muted">{plan.note}</p>
            </div>
          ))}
        </div>
        <button
          disabled
          className="min-h-12 rounded-2xl bg-subtle font-bold text-faint"
          aria-describedby="plans-soon"
        >
          Zakup w Google Play – wkrótce
        </button>
        <p id="plans-soon" className="text-center text-xs text-faint">
          Płatności uruchomimy w najbliższej wersji. Do tego czasu Premium zdobędziesz kodem polecenia.
        </p>
      </section>
    </Page>
  );
}
