"use client";

import { useState } from "react";
import RedeemCodeForm from "@/components/premium/RedeemCodeForm";
import Icon from "@/components/ui/Icon";
import { hapticTap } from "@/lib/haptics";
import { myReferralCode, REFERRAL_DAYS, usePremium } from "@/lib/premium";

/**
 * Kody poleceń: własny kod do wysłania znajomym i pole na kod od znajomego.
 * Obie strony dostają po 2 dni Premium – nalicza serwer (redeem_referral), aplikacja tylko pokazuje wynik.
 */
export default function ReferralCard() {
  const premium = usePremium();

  return (
    <section className="card flex flex-col gap-5 p-5 lg:p-6" aria-labelledby="referral-title">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Polecenia</p>
        <h2 id="referral-title" className="mt-1 text-xl font-extrabold text-ink">
          {REFERRAL_DAYS} dni Premium dla Ciebie i znajomego
        </h2>
        <p className="mt-1 text-sm text-muted">
          Wyślij swój kod. Gdy znajomy wpisze go w pierwszym tygodniu korzystania z Matmy, oboje dostajecie {REFERRAL_DAYS} dni Premium.
          {premium.referralCount > 0 && ` Polecenia: ${premium.referralCount}.`}
        </p>
      </div>
      <MyCode />
      <div className="h-px bg-line" />
      <RedeemCodeForm />
    </section>
  );
}

function MyCode() {
  const premium = usePremium();
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const shown = code ?? premium.referralCode;

  async function reveal() {
    setBusy(true);
    setMessage(null);
    try {
      setCode(await myReferralCode());
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    if (!shown) return;
    hapticTap();
    const text = `Uczę się do matury z matmy w aplikacji Matma. Wpisz mój kod ${shown} w Profilu → Premium, a oboje dostaniemy ${REFERRAL_DAYS} dni Premium.`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // anulowane udostępnianie albo brak obsługi – kopiujemy
    }
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Skopiowano wiadomość z kodem – wklej ją znajomemu.");
    } catch {
      setMessage(`Twój kod: ${shown}`);
    }
  }

  if (!shown) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={reveal}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark disabled:opacity-60"
        >
          <Icon name="send" className="h-4 w-4" />
          {busy ? "Tworzymy kod…" : "Pokaż mój kod polecenia"}
        </button>
        {message && <p className="text-sm text-rose-600 dark:text-rose-400">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-ink">Twój kod</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-2xl border-2 border-dashed border-brand/40 bg-brand-soft px-5 py-2.5 font-mono text-2xl font-extrabold tracking-[0.25em] text-brand select-all">
          {shown}
        </span>
        <button
          onClick={share}
          className="flex min-h-12 items-center gap-2 rounded-2xl bg-brand px-5 font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark"
        >
          <Icon name="send" className="h-4 w-4" />
          Wyślij znajomemu
        </button>
      </div>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
