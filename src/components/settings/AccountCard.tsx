"use client";

import { useEffect, useId, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Icon from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  GOOGLE_CANCELLED,
  GOOGLE_ENABLED,
  MIN_PASSWORD,
  passwordProblem,
  sendCode,
  setPassword,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  useAccount,
  verifyCode,
  type CodeMode,
} from "@/lib/account";
import { syncNow, useCloudStatus } from "@/lib/cloud-sync";
import { hapticSuccess, hapticTap } from "@/lib/haptics";

const RESEND_SECONDS = 60;

const INPUT =
  "min-h-12 w-full min-w-0 rounded-2xl border border-line bg-surface px-4 font-semibold text-ink placeholder:text-faint focus:border-brand focus:outline-none";
const PRIMARY =
  "min-h-12 rounded-2xl bg-brand px-5 font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none";

/** Po zalogowaniu kodem z „Nie pamiętam hasła” – karta zalogowanego od razu prosi o nowe hasło. */
type PasswordPrompt = "reset";

/**
 * Konto (e-mail + hasło, Google albo kod z e-maila) i kopia postępu w chmurze – zabezpieczenie przed zmianą albo
 * wyczyszczeniem telefonu. `embedded` – bez własnej karty i nagłówka (wewnątrz grupy w ustawieniach); `intro` – własny
 * tekst nad formularzem (np. przed zakupem Premium).
 */
export default function AccountCard({ embedded = false, intro }: { embedded?: boolean; intro?: string }) {
  const account = useAccount();
  // stan przetrwa zmianę konta (formularz logowania znika, pojawia się karta zalogowanego z prośbą o hasło)
  const [prompt, setPrompt] = useState<PasswordPrompt | null>(null);
  if (account.status === "disabled") return null;

  const content = (
    <>
      {account.status === "loading" && <Skeleton className="mt-3 h-24" />}
      {account.status === "email" && (
        <SignedIn email={account.email} hasPassword={account.hasPassword} google={account.google} prompt={prompt} onPasswordSet={() => setPrompt(null)} />
      )}
      {(account.status === "signed-out" || account.status === "anonymous") && (
        <SignInFlow anonymous={account.status === "anonymous"} intro={intro} onCodeVerified={setPrompt} />
      )}
    </>
  );
  if (embedded) return content;
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-extrabold text-ink">
        <Icon name="lock" className="h-5 w-5 text-brand" />
        Konto i kopia zapasowa
      </h2>
      {content}
    </section>
  );
}

// ── Zalogowany ──

function SignedIn({
  email,
  hasPassword,
  google,
  prompt,
  onPasswordSet,
}: {
  email: string;
  hasPassword: boolean;
  google: boolean;
  prompt: PasswordPrompt | null;
  onPasswordSet: () => void;
}) {
  const cloud = useCloudStatus();
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const time = cloud.lastSyncAt ? new Date(cloud.lastSyncAt).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) : null;
  const line = {
    off: "Synchronizacja wyłączona.",
    syncing: "Zapisywanie kopii…",
    pending: "Zmiany czekają na wysłanie (np. na internet).",
    synced: time ? `Kopia aktualna · zapisana o ${time}` : "Kopia aktualna.",
    error: "Nie udało się zapisać kopii.",
  }[cloud.state];
  // konto e-mailowe bez hasła musi je ustawić (inaczej zaloguje się tylko kodem); przy Google hasło jest dodatkiem
  const mustSetPassword = prompt === "reset" || (!hasPassword && !google);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Zalogowano jako <strong className="break-all text-ink">{email}</strong>
        {google && " (Google)"}. Postęp, odznaki, Pudełko porażek i historia arkuszy są w chmurze – na nowym telefonie wystarczy się zalogować.
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

      {mustSetPassword || editing ? (
        <PasswordForm
          title={prompt === "reset" ? "Ustaw nowe hasło" : hasPassword ? "Zmień hasło" : "Ustaw hasło"}
          hint={
            mustSetPassword && !hasPassword
              ? "Następnym razem zalogujesz się e-mailem i hasłem – bez czekania na kod."
              : "Kod z e-maila zostaje na wypadek, gdybyś zapomniał(a) hasła."
          }
          onDone={() => {
            setEditing(false);
            onPasswordSet();
          }}
          onCancel={mustSetPassword ? undefined : () => setEditing(false)}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(true)} className="min-h-11 rounded-2xl border border-line px-4 text-sm font-bold text-ink hover:border-brand/40">
            {hasPassword ? "Zmień hasło" : "Ustaw hasło"}
          </button>
          <button onClick={() => setConfirm(true)} className="min-h-11 rounded-2xl border border-line px-4 text-sm font-bold text-muted hover:text-ink">
            Wyloguj
          </button>
        </div>
      )}

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

function PasswordForm({ title, hint, onDone, onCancel }: { title: string; hint: string; onDone: () => void; onCancel?: () => void }) {
  const [password, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    const message = await setPassword(password);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    hapticSuccess();
    setSaved(true);
    onDone();
  }

  if (saved) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
        <Icon name="checkCircle" className="h-4 w-4 shrink-0" />
        Hasło zapisane.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="flex flex-col gap-2 rounded-2xl border border-brand/30 bg-brand-soft/60 p-4"
    >
      <p className="font-extrabold text-ink">{title}</p>
      <p className="text-sm text-muted">{hint}</p>
      <PasswordInput value={password} onChange={setValue} autoComplete="new-password" label="Nowe hasło" />
      <p className="text-xs text-faint">Co najmniej {MIN_PASSWORD} znaków, litery i cyfry.</p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={busy || passwordProblem(password) !== null} className={PRIMARY}>
          {busy ? "Zapisuję…" : "Zapisz hasło"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="min-h-12 px-3 text-sm font-bold text-muted hover:text-ink">
            Anuluj
          </button>
        )}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </form>
  );
}

// ── Logowanie / zakładanie konta ──

type Tab = "new" | "login";

function SignInFlow({ anonymous, intro, onCodeVerified }: { anonymous: boolean; intro?: string; onCodeVerified: (prompt: PasswordPrompt) => void }) {
  const [tab, setTab] = useState<Tab>(anonymous ? "new" : "login");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [code, setCode] = useState("");
  // krok z kodem: po „Wyślij kod” (nowe konto) albo „Nie pamiętam hasła”
  const [step, setStep] = useState<{ mode: CodeMode; existing?: boolean; reset: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(reset: boolean) {
    setBusy(true);
    setError(null);
    const result = await sendCode(email);
    setBusy(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    hapticTap();
    setStep({ ...result, reset });
    setCode("");
    setCooldown(RESEND_SECONDS);
  }

  async function confirmCode() {
    if (!step) return;
    setBusy(true);
    setError(null);
    const message = await verifyCode(email, code, step.mode);
    setBusy(false);
    if (message) {
      setError(message);
      return;
    }
    // formularz już znika (konto zalogowane) – karta zalogowanego poprosi o hasło
    if (step.reset) onCodeVerified("reset");
    hapticSuccess();
  }

  async function login() {
    setBusy(true);
    setError(null);
    const message = await signInWithPassword(email, password);
    setBusy(false);
    if (message) setError(message);
    else hapticSuccess();
  }

  async function google() {
    setBusy(true);
    setError(null);
    const message = await signInWithGoogle();
    setBusy(false);
    if (message && message !== GOOGLE_CANCELLED) setError(message);
    else if (!message) hapticSuccess();
  }

  function switchTab(next: Tab) {
    setTab(next);
    setStep(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {intro ??
          (anonymous
            ? "Twoje konto w rankingu nie ma e-maila – po zmianie albo wyczyszczeniu telefonu przepadnie razem z postępem. Załóż konto, a zrobimy kopię w chmurze."
            : "Postęp, odznaki i Pudełko porażek są tylko na tym telefonie. Zaloguj się – zrobimy kopię w chmurze i przeniesiesz ją na nowy telefon.")}
      </p>

      {GOOGLE_ENABLED && !step && (
        <>
          <button
            type="button"
            onClick={() => void google()}
            disabled={busy}
            className="press flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-line bg-card px-5 font-bold text-ink shadow-card hover:border-brand/40 disabled:opacity-60"
          >
            <GoogleMark />
            Kontynuuj z Google
          </button>
          <p className="flex items-center gap-3 text-xs font-semibold text-faint">
            <span className="h-px flex-1 bg-line" />
            albo e-mailem
            <span className="h-px flex-1 bg-line" />
          </p>
        </>
      )}

      {!step && (
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-subtle p-1" role="radiogroup" aria-label="Rodzaj logowania">
          {(
            [
              ["new", "Nowe konto"],
              ["login", "Mam konto"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={tab === id}
              onClick={() => switchTab(id)}
              className={`min-h-10 rounded-xl text-sm font-bold transition-colors ${tab === id ? "bg-card text-ink shadow-card" : "text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {step ? (
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
            {step.reset ? " Po zalogowaniu ustawisz nowe hasło." : " Potem ustawisz hasło."}
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
              className={`${INPUT} text-center text-xl font-extrabold tracking-[0.4em] sm:flex-1`}
            />
            <button type="submit" disabled={busy || code.length < 6} className={PRIMARY}>
              {busy ? "Sprawdzam…" : "Potwierdź"}
            </button>
          </div>
          <div className="flex flex-wrap gap-x-4">
            <button type="button" disabled={cooldown > 0 || busy} onClick={() => void requestCode(step.reset)} className="min-h-11 text-sm font-bold text-brand disabled:text-faint">
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
      ) : tab === "new" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void requestCode(false);
          }}
          className="flex flex-col gap-2"
        >
          <EmailInput value={email} onChange={setEmail} />
          <button type="submit" disabled={busy || !email.trim()} className={PRIMARY}>
            {busy ? "Wysyłam…" : "Wyślij kod na e-mail"}
          </button>
          <p className="text-xs text-faint">Kod potwierdza, że e-mail jest Twój. Hasło ustawisz zaraz potem.</p>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
          className="flex flex-col gap-2"
        >
          <EmailInput value={email} onChange={setEmail} />
          <PasswordInput value={password} onChange={setPasswordValue} autoComplete="current-password" label="Hasło" />
          <button type="submit" disabled={busy || !email.trim() || !password} className={PRIMARY}>
            {busy ? "Loguję…" : "Zaloguj się"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => (email.trim() ? void requestCode(true) : setError("Wpisz e-mail – wyślemy na niego kod."))}
            className="min-h-11 self-start text-sm font-bold text-brand disabled:text-faint"
          >
            Nie pamiętam hasła – wyślij kod
          </button>
        </form>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function EmailInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <>
      <label htmlFor="account-email" className="sr-only">
        Adres e-mail
      </label>
      <input
        id="account-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="twoj@email.pl"
        className={INPUT}
      />
    </>
  );
}

function PasswordInput({ value, onChange, autoComplete, label }: { value: string; onChange: (value: string) => void; autoComplete: string; label: string }) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className={`${INPUT} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-ink"
      >
        <Icon name={visible ? "eyeOff" : "eye"} className="h-5 w-5" />
      </button>
    </div>
  );
}

function ErrorText({ children }: { children: string }) {
  return (
    <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">
      {children}
    </p>
  );
}

/** Znak Google (wielokolorowe „G”) – wymagany w przycisku logowania przez wytyczne Google. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}
