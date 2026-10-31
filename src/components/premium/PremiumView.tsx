"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import CkeNotice from "@/components/legal/CkeNotice";
import { PURCHASE_CONSENT_TEXT } from "@/data/legal";
import ReferralCard from "@/components/premium/ReferralCard";
import AccountCard from "@/components/settings/AccountCard";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAccount } from "@/lib/account";
import { trackFunnel } from "@/lib/funnel";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import { AI_FREE_DAILY_LIMIT, AI_PREMIUM_DAILY_LIMIT, formatPremiumUntil, GRADING_DAILY_LIMIT, isPremium, usePremium } from "@/lib/premium";
import {
  buyPlan,
  manageSubscription,
  PLAN_INFO,
  reloadOffers,
  restorePurchases,
  usePurchases,
  type Offer,
  type PlanId,
} from "@/lib/purchases";

// Tylko to, co działa dziś.
const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "camera",
    title: "Zdjęcie rozwiązania → punkty jak na maturze",
    text: `Robisz zdjęcie kartki z zadaniem otwartym z arkusza, a korepetytor przyznaje punkty za kolejne kroki według schematu CKE – z uzasadnieniem. Do ${GRADING_DAILY_LIMIT} ocen dziennie.`,
  },
  { icon: "sparkles", title: "Korepetytor AI na co dzień", text: `Za darmo ${AI_FREE_DAILY_LIMIT} wiadomości dziennie. Z Premium do ${AI_PREMIUM_DAILY_LIMIT} – także ze zdjęciem zadania albo PDF-em.` },
  { icon: "book", title: "Wyjaśnienie każdego błędu", text: "Po złej odpowiedzi korepetytor tłumaczy krok po kroku, gdzie był haczyk – w testach, planie i Pudełku porażek." },
  { icon: "bolt", title: "Podpowiedzi stopniowane", text: "Nie wiesz, jak zacząć? Kolejne podpowiedzi naprowadzają na rozwiązanie, ale nie zdradzają wyniku." },
];

/** Ekran Premium: stan konta, korzyści, zakup przez Google Play (po zalogowaniu e-mailem) i kody poleceń. */
export default function PremiumView() {
  const premium = usePremium();
  const active = isPremium(premium);

  useEffect(() => void trackFunnel("premium_view"), []);

  return (
    <Page width="reading">
      <PageHeader title="Premium" subtitle="Nauka zostaje za darmo. Premium podnosi limit korepetytora AI i ocenia Twoje rozwiązania ze zdjęcia – na finisz przed maturą." />

      <section className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white shadow-card lg:p-8">
        <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
        <p className="relative text-xs font-extrabold uppercase tracking-widest text-white/60">Twój plan</p>
        <h2 className="relative mt-1 text-2xl font-extrabold">{active ? "Premium aktywne" : "Plan darmowy"}</h2>
        <p className="relative mt-1 text-sm text-white/70">
          {active && premium.premiumUntil
            ? `Do ${formatPremiumUntil(premium.premiumUntil)}. Korepetytor AI: do ${AI_PREMIUM_DAILY_LIMIT} wiadomości dziennie.`
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
                <p className="font-extrabold text-ink">{b.title}</p>
                <p className="text-sm text-muted">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <BuySection />

      <ReferralCard />

      <footer className="flex flex-col items-center gap-2 pt-2">
        <p className="flex gap-4 text-sm font-bold">
          <Link href="/regulamin" className="text-brand underline">
            Regulamin
          </Link>
          <Link href="/prywatnosc" className="text-brand underline">
            Polityka prywatności
          </Link>
        </p>
        <CkeNotice />
      </footer>
    </Page>
  );
}

function BuySection() {
  const store = usePurchases();
  const account = useAccount();
  const [plan, setPlan] = useState<PlanId>("pass");
  // zgoda na natychmiastowy dostęp (treść cyfrowa) i akceptacja regulaminu – wymagana przed każdym zakupem
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const canBuy = store.status === "ready";
  const hasEmail = account.status === "email";

  async function buy() {
    hapticTap();
    void trackFunnel("buy_start");
    setBusy("buy");
    setMessage(null);
    const result = await buyPlan(plan);
    setBusy(null);
    if (result.status === "done") {
      hapticSuccess();
      setMessage({ tone: "ok", text: "Dziękujemy! Premium jest aktywne." });
    } else if (result.status === "activating") {
      setMessage({ tone: "ok", text: "Zakup przyjęty. Premium włączy się za chwilę – jeśli nie, użyj „Przywróć zakupy”." });
    } else if (result.status === "error") {
      setMessage({ tone: "error", text: result.message });
    }
  }

  async function restore() {
    setBusy("restore");
    setMessage(null);
    const result = await restorePurchases();
    setBusy(null);
    if (result.status === "error") setMessage({ tone: "error", text: result.message });
    else if (result.status === "restored") setMessage({ tone: "ok", text: "Zakup przywrócony – Premium jest aktywne." });
    else setMessage({ tone: "error", text: "Nie znaleźliśmy aktywnego zakupu na tym koncie Google." });
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="plans-title">
      <h2 id="plans-title" className="text-xl font-extrabold text-ink">
        {store.owned ? "Twój zakup" : "Kup Premium"}
      </h2>

      {store.owned ? (
        <div className="card flex flex-col gap-3 p-5">
          <p className="text-sm text-body">Premium z Google Play jest aktywne na tym koncie. Dziękujemy za wsparcie!</p>
          {store.manageUrl && (
            <button onClick={() => void manageSubscription()} className="min-h-11 self-start rounded-2xl border border-line px-4 text-sm font-bold text-brand hover:border-brand/40">
              Zarządzaj subskrypcją w Google Play
            </button>
          )}
        </div>
      ) : (
        <>
          {store.status === "loading" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
          ) : (
            <div role="radiogroup" aria-label="Wybierz plan" className="grid gap-3 sm:grid-cols-2">
              {store.offers.map((offer) => (
                <PlanCard key={offer.plan} offer={offer} selected={canBuy && plan === offer.plan} selectable={canBuy} onSelect={() => setPlan(offer.plan)} />
              ))}
            </div>
          )}

          {store.status === "unsupported" && (
            <p className="text-center text-sm text-muted">Premium kupisz w aplikacji Matma na Androida (Google Play).</p>
          )}
          {store.status === "error" && (
            <p className="text-center text-sm text-muted">
              Nie udało się pobrać cen z Google Play.{" "}
              <button onClick={reloadOffers} className="min-h-11 font-bold text-brand underline">
                Spróbuj ponownie
              </button>
            </p>
          )}

          {canBuy && !hasEmail && account.status !== "loading" && (
            <EmailGate>
              <h3 className="flex items-center gap-2 font-extrabold text-ink">
                <Icon name="lock" className="h-5 w-5 text-brand" />
                Najpierw konto z e-mailem
              </h3>
              <div className="mt-2">
                <AccountCard
                  embedded
                  intro="Premium przypiszemy do Twojego e-maila – po zmianie telefonu wystarczy się zalogować i nic nie przepadnie. Wpisz adres, wyślemy 6-cyfrowy kod."
                />
              </div>
            </EmailGate>
          )}

          {canBuy && hasEmail && <PurchaseConsent checked={consent} onChange={setConsent} />}

          {canBuy && hasEmail && (
            <button
              onClick={() => void buy()}
              disabled={busy !== null || !consent}
              className="min-h-12 rounded-2xl bg-brand font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              {busy === "buy" ? "Łączę z Google Play…" : `Kup – ${store.offers.find((o) => o.plan === plan)?.price ?? ""}`}
            </button>
          )}
        </>
      )}

      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={`text-center text-sm font-semibold ${message.tone === "error" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {message.text}
        </p>
      )}

      {canBuy && (
        <div className="flex flex-col items-center gap-1 text-center text-xs text-faint">
          <p>Płatność obsługuje Google Play. Subskrypcja odnawia się co miesiąc, dopóki jej nie anulujesz w Google Play; pakiet maturalny płacisz raz.</p>
          {hasEmail && (
            <button onClick={() => void restore()} disabled={busy !== null} className="min-h-11 font-bold text-muted underline hover:text-ink disabled:text-faint">
              {busy === "restore" ? "Przywracam…" : "Przywróć zakupy"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** Zgoda przed zakupem: regulamin + natychmiastowy dostęp i utrata prawa odstąpienia (tekst w src/data/legal.ts). */
function PurchaseConsent({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="card flex cursor-pointer items-start gap-3 p-4 text-sm text-body">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
      />
      <span>
        {PURCHASE_CONSENT_TEXT} Akceptuję{" "}
        <Link href="/regulamin" className="font-bold text-brand underline">
          regulamin
        </Link>
        .
      </span>
    </label>
  );
}

/** Formularz e-maila przed zakupem – jego pokazanie to krok lejka (ile osób odpada na wymogu konta). */
function EmailGate({ children }: { children: ReactNode }) {
  useEffect(() => void trackFunnel("email_gate"), []);
  return <div className="card p-5">{children}</div>;
}

function PlanCard({ offer, selected, selectable, onSelect }: { offer: Offer; selected: boolean; selectable: boolean; onSelect: () => void }) {
  const info = PLAN_INFO[offer.plan];
  const content = (
    <>
      {offer.plan === "pass" && <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Najlepszy wybór</p>}
      <p className="font-extrabold text-ink">{info.title}</p>
      <p className="text-3xl font-extrabold tracking-tight text-ink tabular-nums">{offer.price}</p>
      <p className="text-sm text-muted">{info.note(new Date())}</p>
    </>
  );
  if (!selectable) return <div className="card flex flex-col gap-1 p-5">{content}</div>;
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`card flex flex-col gap-1 p-5 text-left transition-colors ${selected ? "border-brand ring-2 ring-brand/30" : "hover:border-brand/40"}`}
    >
      {content}
    </button>
  );
}
