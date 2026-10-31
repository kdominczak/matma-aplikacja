"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import { AI_PREMIUM_DAILY_LIMIT, formatPremiumUntil, myReferralCode, redeemReferralCode, REFERRAL_DAYS, usePremium } from "@/lib/premium";

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
      <RedeemCode />
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
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-5 font-bold text-white shadow-float btn-hover active:bg-brand-dark disabled:opacity-60"
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
          className="flex min-h-12 items-center gap-2 rounded-2xl bg-brand px-5 font-bold text-white shadow-float btn-hover active:bg-brand-dark"
        >
          <Icon name="send" className="h-4 w-4" />
          Wyślij znajomemu
        </button>
      </div>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}

function RedeemCode() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: true; until: Date } | { ok: false; error: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    const outcome = await redeemReferralCode(input);
    setBusy(false);
    if ("until" in outcome) {
      hapticSuccess();
      setInput("");
      setResult({ ok: true, until: outcome.until });
    } else {
      setResult({ ok: false, error: outcome.error });
    }
  }

  if (result?.ok) {
    return (
      <div role="status" className="flex animate-pop items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <Icon name="checkCircle" className="h-6 w-6" />
        </span>
        <div>
          <p className="font-extrabold text-emerald-700 dark:text-emerald-300">Kod przyjęty! Masz {REFERRAL_DAYS} dni Premium</p>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">Premium do {formatPremiumUntil(result.until)} – korepetytor AI do {AI_PREMIUM_DAILY_LIMIT} wiadomości dziennie.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label htmlFor="referral-input" className="text-sm font-bold text-ink">
        Masz kod od znajomego?
      </label>
      <div className="flex gap-2">
        <input
          id="referral-input"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          maxLength={8}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="np. K7MP2Q"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-2 border-line bg-surface px-4 font-mono text-lg font-bold tracking-[0.2em] text-ink uppercase outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 6}
          className="min-h-12 shrink-0 rounded-2xl bg-ink px-5 font-bold text-surface transition-opacity disabled:opacity-40"
        >
          {busy ? "Sprawdzam…" : "Wpisz"}
        </button>
      </div>
      {result && !result.ok && <p className="text-sm text-rose-600 dark:text-rose-400">{result.error}</p>}
    </form>
  );
}
