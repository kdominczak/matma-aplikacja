"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Icon from "@/components/ui/Icon";
import { sendCode, signOut, useAccount, verifyCode, type CodeMode } from "@/lib/account";
import { syncNow, useCloudStatus } from "@/lib/cloud-sync";
import { hapticSuccess, hapticTap } from "@/lib/haptics";

const RESEND_SECONDS = 60;

/** Konto z e-mailem i kopia postępu w chmurze – zabezpieczenie przed zmianą albo wyczyszczeniem telefonu. */
export default function AccountCard() {
  const account = useAccount();
  if (account.status === "disabled") return null;

  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-extrabold text-ink">
        <Icon name="lock" className="h-5 w-5 text-brand" />
        Konto i kopia zapasowa
      </h2>
      {account.status === "loading" && <div className="mt-3 h-24 animate-pulse rounded-2xl bg-subtle" />}
      {account.status === "email" && <SignedIn email={account.email} />}
      {(account.status === "signed-out" || account.status === "anonymous") && <SignInFlow anonymous={account.status === "anonymous"} />}
    </section>
  );
}

function SignedIn({ email }: { email: string }) {
  const cloud = useCloudStatus();
  const [confirm, setConfirm] = useState(false);
  const time = cloud.lastSyncAt ? new Date(cloud.lastSyncAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : null;
  const line = {
    off: "Synchronizacja wyłączona.",
    syncing: "Zapisywanie kopii…",
    pending: "Zmiany czekają na wysłanie (np. na internet).",
    synced: time ? `Kopia aktualna · zapisana o ${time}` : "Kopia aktualna.",
    error: "Nie udało się zapisać kopii.",
  }[cloud.state];

  return (
    <div className="mt-2 flex flex-col gap-4">
      <p className="text-sm text-muted">
        Zalogowano jako <strong className="break-all text-ink">{email}</strong>. Postęp, odznaki, Pudełko porażek i historia arkuszy są w chmurze –
        na nowym telefonie wystarczy się zalogować.
      </p>
      <div className={`flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold ${cloud.state === "error" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300" : "bg-subtle text-body"}`}>
        <Icon name={cloud.state === "error" ? "alert" : cloud.state === "synced" ? "checkCircle" : "refresh"} className={`h-4 w-4 shrink-0 ${cloud.state === "syncing" ? "animate-spin" : ""}`} />
        <span className="min-w-0 flex-1">{line}</span>
        {(cloud.state === "error" || cloud.state === "pending") && (
          <button onClick={() => void syncNow()} className="-my-2 min-h-11 shrink-0 font-bold text-brand">
            Ponów
          </button>
        )}
      </div>
      <button onClick={() => setConfirm(true)} className="min-h-11 self-start rounded-2xl border border-line px-4 text-sm font-bold text-muted hover:text-ink">
        Wyloguj
      </button>
      {confirm && (
        <ConfirmDialog
          tone="brand"
          icon="lock"
          title="Wylogować się?"
          confirmLabel="Wyloguj"
          onConfirm={async () => {
            await syncNow();
            await signOut();
            setConfirm(false);
          }}
          onCancel={() => setConfirm(false)}
        >
          Postęp zostaje na tym telefonie, a kopia na koncie – zalogujesz się tym samym e-mailem, kiedy zechcesz.
        </ConfirmDialog>
      )}
    </div>
  );
}

function SignInFlow({ anonymous }: { anonymous: boolean }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<{ mode: CodeMode; existing?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestCode() {
    setBusy(true);
    setError(null);
    const result = await sendCode(email);
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    hapticTap();
    setStep(result);
    setCode("");
    setCooldown(RESEND_SECONDS);
  }

  async function confirmCode() {
    if (!step) return;
    setBusy(true);
    setError(null);
    const message = await verifyCode(email, code, step.mode);
    setBusy(false);
    if (message) setError(message);
    else hapticSuccess();
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <p className="text-sm text-muted">
        {anonymous
          ? "Twoje konto w rankingu nie ma e-maila – po zmianie albo wyczyszczeniu telefonu przepadnie razem z postępem. Dodaj e-mail, a zrobimy kopię w chmurze."
          : "Postęp, odznaki i Pudełko porażek są tylko na tym telefonie. Zaloguj się kodem z e-maila – zrobimy kopię w chmurze i przeniesiesz ją na nowy telefon."}
      </p>

      {!step ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void requestCode();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="account-email" className="sr-only">
            Adres e-mail
          </label>
          <input
            id="account-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 font-semibold text-ink placeholder:text-faint focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="min-h-12 rounded-2xl bg-brand px-5 font-bold text-white shadow-float btn-hover active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
          >
            {busy ? "Wysyłam…" : "Wyślij kod"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void confirmCode();
          }}
          className="flex flex-col gap-2"
        >
          <p className="text-sm text-body">
            Wysłaliśmy kod na <strong className="break-all text-ink">{email.trim()}</strong>.
            {step.existing && " To konto już istnieje – zalogujemy Cię na nie, a postęp z tego telefonu dołączy do kopii."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="account-code" className="sr-only">
              Kod z e-maila
            </label>
            <input
              id="account-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="min-h-12 min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 text-center text-xl font-extrabold tracking-[0.4em] text-ink placeholder:text-faint focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="min-h-12 rounded-2xl bg-brand px-5 font-bold text-white shadow-float btn-hover active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              {busy ? "Sprawdzam…" : "Potwierdź"}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4">
            <button type="button" disabled={cooldown > 0 || busy} onClick={() => void requestCode()} className="min-h-11 text-sm font-bold text-brand disabled:text-faint">
              {cooldown > 0 ? `Wyślij ponownie za ${cooldown} s` : "Wyślij kod ponownie"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(null);
                setError(null);
              }}
              className="min-h-11 text-sm font-bold text-muted hover:text-ink"
            >
              Zmień e-mail
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}
