import Link from "next/link";
import RedeemCodeForm from "@/components/premium/RedeemCodeForm";
import Icon from "@/components/ui/Icon";
import { AI_FREE_DAILY_LIMIT, AI_PREMIUM_DAILY_LIMIT, REFERRAL_DAYS } from "@/lib/premium";

/** Ekran blokady po wyczerpaniu dziennego limitu AI: Premium albo kod polecenia, a nauka bez AI działa dalej. */
export default function AiLimitCard() {
  return (
    <section role="status" className="card flex flex-col gap-4 border-brand/40 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="sparkles" className="h-6 w-6" />
        </span>
        <div>
          <p className="font-extrabold text-ink">Na dziś to już {AI_FREE_DAILY_LIMIT} wiadomości do korepetytora</p>
          <p className="text-sm text-muted">
            Limit odnowi się o północy. Z Premium piszesz do {AI_PREMIUM_DAILY_LIMIT} wiadomości dziennie – a {REFERRAL_DAYS} dni Premium dostaniesz za darmo, wysyłając kod
            znajomemu.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/premium"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark"
        >
          Premium i kody poleceń <Icon name="arrow" className="h-4 w-4" />
        </Link>
        <Link
          href="/plan"
          className="flex min-h-12 items-center justify-center rounded-2xl border border-line px-5 font-bold text-muted transition-colors hover:text-ink"
        >
          Ucz się dalej z planem
        </Link>
      </div>
      <RedeemCodeForm collapsed />
    </section>
  );
}
