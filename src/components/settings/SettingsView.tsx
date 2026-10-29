"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, ProfileAvatar, useDisplayName } from "@/components/layout/AppShell";
import AccountCard from "@/components/settings/AccountCard";
import { IconTile, SettingsBlock, SettingsGroup, SettingsRow, StatusPill } from "@/components/settings/SettingsUI";
import AiSettingsCard from "@/components/tutor/AiSettingsCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Icon from "@/components/ui/Icon";
import Switch from "@/components/ui/Switch";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import { CKE_ARCHIVE_URL } from "@/data/cke-sheets";
import { TARGETS } from "@/data/topics";
import { useAccount } from "@/lib/account";
import { useAiSettings } from "@/lib/ai-settings";
import { saveAppSettings, useAppSettings } from "@/lib/app-settings";
import { resetCloudData, useCloudStatus } from "@/lib/cloud-sync";
import { deleteAccountAndData } from "@/lib/delete-account";
import { hapticTap } from "@/lib/haptics";
import { formatDay, resetProgress, setTarget, useProgress } from "@/lib/progress";
import { leaveRanking, useRanking } from "@/lib/ranking";
import type { Progress } from "@/types/progress";

const SECTIONS = [
  { id: "konto", label: "Konto" },
  { id: "cel", label: "Nauka" },
  { id: "wyglad", label: "Wygląd" },
  { id: "ustawienia-ai", label: "Korepetytor AI" },
  { id: "dane", label: "Prywatność" },
];

export default function SettingsView() {
  const progress = useProgress();
  const settings = useAppSettings();

  // Linki typu /ustawienia#cel – treść pojawia się po wczytaniu, więc przewijamy dopiero wtedy.
  const loaded = progress !== null && settings !== null;
  useEffect(() => {
    if (!loaded || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [loaded]);

  if (!progress || !settings) return null;

  return (
    <Page width="reading">
      <PageHeader title="Ustawienia" subtitle="Konto, nauka, wygląd i Twoje dane – wszystko w jednym miejscu." />

      <AccountHero />

      <nav aria-label="Sekcje ustawień" className="-mx-4 -mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-bold text-muted transition-colors hover:border-brand/40 hover:text-ink active:scale-[0.97]"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <SettingsGroup id="konto" title="Konto i kopia zapasowa">
        <SettingsBlock>
          <AccountCard embedded />
        </SettingsBlock>
        <RankingRows />
      </SettingsGroup>

      <SettingsGroup id="cel" title="Nauka" hint="Cel ustala, które działy są w planie na dziś i na stronie głównej.">
        <SettingsBlock>
          <TargetPicker progress={progress} />
        </SettingsBlock>
        <PlacementRow progress={progress} />
      </SettingsGroup>

      <SettingsGroup id="wyglad" title="Wygląd i reakcje">
        <SettingsBlock>
          <ThemeSwitcher preview />
        </SettingsBlock>
        <SettingsBlock>
          <div className="flex flex-col divide-y divide-line">
            <Switch label="Dźwięki" description="Cichy klik przy wyborze odpowiedzi" checked={settings.sounds} onChange={(sounds) => void saveAppSettings({ sounds })} />
            <Switch label="Wibracje" description="Krótka wibracja przy dobrej i złej odpowiedzi" checked={settings.haptics} onChange={(haptics) => void saveAppSettings({ haptics })} />
            <Switch label="Konfetti" description="Animacja po zaliczonym teście i planie na dziś" checked={settings.confetti} onChange={(confetti) => void saveAppSettings({ confetti })} />
          </div>
        </SettingsBlock>
      </SettingsGroup>

      <SettingsGroup id="ustawienia-ai" title="Korepetytor AI" hint="Wyjaśnienia, podpowiedzi i czat działają na Twoim darmowym kluczu Groq.">
        <SettingsBlock>
          <AiSettingsCard embedded />
        </SettingsBlock>
      </SettingsGroup>

      <SettingsGroup id="dane" title="Prywatność i dane">
        <SettingsRow icon="lock" tone="sky" title="Polityka prywatności" description="Jakie dane zbieramy i po co" href="/prywatnosc" />
        <SettingsRow icon="trash" tone="slate" title="Jak usunąć konto" description="W aplikacji albo e-mailem, bez instalowania" href="/usun-konto" />
        <SettingsRow icon="file" tone="slate" title="Arkusze i karta wzorów CKE" description="Oficjalne źródła na cke.gov.pl" href={CKE_ARCHIVE_URL} external />
      </SettingsGroup>

      <DangerZone progress={progress} />

      <footer className="pb-4 text-center text-xs text-faint">
        Matma – codzienna nauka do matury z matematyki. Aplikacja nie jest powiązana z Centralną Komisją Egzaminacyjną.
      </footer>
    </Page>
  );
}

// ── Podsumowanie konta na górze: kto jest zalogowany i czy postęp jest bezpieczny ──

function AccountHero() {
  const account = useAccount();
  const cloud = useCloudStatus();
  const name = useDisplayName();

  const status =
    account.status === "email"
      ? cloud.state === "error"
        ? { tone: "rose" as const, label: "Kopia nie zapisała się" }
        : cloud.state === "pending" || cloud.state === "syncing"
          ? { tone: "amber" as const, label: "Zapisywanie kopii…" }
          : { tone: "emerald" as const, label: "Kopia w chmurze" }
      : account.status === "anonymous"
        ? { tone: "amber" as const, label: "Konto bez e-maila" }
        : account.status === "signed-out"
          ? { tone: "amber" as const, label: "Tylko na tym telefonie" }
          : null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <ProfileAvatar size="h-14 w-14 text-2xl" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold">{name}</p>
          <p className="truncate text-sm text-white/70">{account.status === "email" ? account.email : "Bez logowania"}</p>
          {status && (
            <span className="mt-1.5 inline-block">
              <StatusPill tone={status.tone}>{status.label}</StatusPill>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Nauka ──

function TargetPicker({ progress }: { progress: Progress }) {
  return (
    <div>
      <p className="mb-2 font-bold text-ink">Cel na maturze</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Cel na maturze">
        {TARGETS.map((t) => {
          const selected = progress.target === t.value;
          return (
            <button
              key={t.value}
              role="radio"
              aria-checked={selected}
              onClick={() => {
                hapticTap();
                void setTarget(t.value);
              }}
              className={`flex min-h-24 flex-col items-start justify-between gap-1 rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.97] ${
                selected ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40"
              }`}
            >
              <span className={`text-xl font-extrabold tracking-tight ${selected ? "text-brand" : "text-ink"}`}>{t.value}%</span>
              <span className="text-xs leading-snug text-muted">{t.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlacementRow({ progress }: { progress: Progress }) {
  const placement = progress.placement;
  return (
    <SettingsRow
      icon="graduation"
      tone="violet"
      title={placement?.status === "done" ? "Powtórz test na start" : "Zrób test na start"}
      description={
        placement?.status === "done"
          ? `${formatDay(placement.at)}: ${placement.correct}/${placement.total} poprawnych, cel ${placement.target}%`
          : "12 zadań – ustawi cel i zaliczy to, co już umiesz"
      }
      href="/start"
    />
  );
}

// ── Ranking ──

function RankingRows() {
  const ranking = useRanking();
  const [confirm, setConfirm] = useState(false);
  if (ranking.status === "disabled") return null;

  if (ranking.status !== "member") {
    return <SettingsRow icon="trophy" tone="amber" title="Dołącz do rankingu" description="Inni zobaczą tylko Twój nick i liczbę rozwiązanych zadań" href="/ranking" />;
  }
  return (
    <>
      <SettingsRow icon="trophy" tone="amber" title="Ranking" description="Liczą się poprawnie rozwiązane zadania" value={ranking.profile.nick} href="/ranking" />
      <SettingsRow icon="close" tone="slate" title="Wypisz mnie z rankingu" description="Nick i zdjęcie znikną z rankingu" onClick={() => setConfirm(true)} />
      {confirm && (
        <ConfirmDialog
          title="Wypisać Cię z rankingu?"
          confirmLabel="Tak, wypisz"
          onConfirm={async () => {
            await leaveRanking();
            setConfirm(false);
          }}
          onCancel={() => setConfirm(false)}
        >
          Znikną Twój nick, zdjęcie w rankingu i historia odpowiedzi na serwerze. Postęp nauki na tym urządzeniu zostaje.
        </ConfirmDialog>
      )}
    </>
  );
}

// ── Strefa niebezpieczna: reset postępów i usunięcie konta (zwinięta, żeby nikt nie trafił tu przypadkiem) ──

function DangerZone({ progress }: { progress: Progress }) {
  const ai = useAiSettings();
  return (
    <details id="strefa" className="group scroll-mt-24 rounded-3xl border border-rose-500/30 bg-rose-500/5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-5">
        <IconTile icon="alert" tone="rose" />
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-ink">Strefa niebezpieczna</span>
          <span className="block text-sm text-muted">Reset postępów i usunięcie konta</span>
        </span>
        <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint transition-transform group-open:rotate-90" />
      </summary>
      <div className="flex flex-col divide-y divide-rose-500/20 border-t border-rose-500/20">
        <ResetSetting progress={progress} />
        <DeleteAccountSetting hasAiKey={Boolean(ai?.apiKey)} />
      </div>
    </details>
  );
}

const dangerButton =
  "min-h-11 rounded-2xl border-2 border-rose-500/40 bg-card px-5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-500 active:scale-[0.98] dark:text-rose-300";

function ResetSetting({ progress }: { progress: Progress }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="p-4 sm:p-5">
      <h3 className="font-extrabold text-ink">Resetowanie postępów</h3>
      <p className="mt-1 text-sm text-muted">
        Usuwa zaliczone testy, serię, statystyki, odznaki, Pudełko porażek i historię arkuszy – także kopię na koncie. Ustawienia, zdjęcie, klucz Groq i
        nick zostają.
      </p>
      {done && <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Postęp został wyzerowany.</p>}
      {failed && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
          Nie udało się wyzerować kopii na koncie (sprawdź internet). Postęp na telefonie został bez zmian – inaczej wróciłby z chmury.
        </p>
      )}
      <button onClick={() => setOpen(true)} className={`mt-4 ${dangerButton}`}>
        Resetuj postępy…
      </button>
      {open && (
        <ConfirmDialog
          title="Zresetować wszystkie postępy?"
          confirmLabel="Tak, resetuj"
          confirmWord="RESET"
          onConfirm={async () => {
            // najpierw konto: gdyby reset zrobić tylko na telefonie, synchronizacja przywróciłaby postęp z chmury
            try {
              await resetCloudData();
            } catch {
              setOpen(false);
              setFailed(true);
              return;
            }
            await resetProgress();
            hapticTap();
            setOpen(false);
            setFailed(false);
            setDone(true);
          }}
          onCancel={() => setOpen(false)}
        >
          <p>Tej operacji nie da się cofnąć. Stracisz:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>{progress.stats.answered} rozwiązanych zadań w statystykach i serię dni,</li>
            <li>{Object.keys(progress.tests).length} zaliczonych testów i wszystkie gwiazdki,</li>
            <li>{Object.keys(progress.achievements).length} zdobytych odznak,</li>
            <li>{Object.keys(progress.mistakes).length} zadań w Pudełku porażek.</li>
          </ul>
        </ConfirmDialog>
      )}
    </div>
  );
}

/** Usunięcie konta i wszystkich danych (wymóg Google Play i RODO). Bez konta – czyści dane z tego urządzenia. */
function DeleteAccountSetting({ hasAiKey }: { hasAiKey: boolean }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAccount = account.status === "anonymous" || account.status === "email";

  return (
    <div className="p-4 sm:p-5">
      <h3 className="font-extrabold text-ink">{hasAccount ? "Usunięcie konta" : "Usunięcie danych z urządzenia"}</h3>
      <p className="mt-1 text-sm text-muted">
        {hasAccount
          ? "Trwale usuwa konto i wszystko, co jest na serwerze: profil w rankingu, zdjęcie, historię odpowiedzi, kopię postępu i historię arkuszy – a potem dane z tego urządzenia."
          : `Nie masz konta – Twoje dane są tylko na tym urządzeniu. Możesz je wszystkie usunąć: postęp i ustawienia${hasAiKey ? " razem z kluczem Groq" : ""}.`}
      </p>
      {hasAccount && <AccountId id={account.userId} />}
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button onClick={() => setOpen(true)} className={dangerButton}>
          {hasAccount ? "Usuń konto i dane…" : "Usuń dane…"}
        </button>
        <Link href="/usun-konto" className="text-sm font-bold text-muted underline hover:text-ink">
          Inne sposoby usunięcia
        </Link>
      </div>
      {open && (
        <ConfirmDialog
          title={hasAccount ? "Usunąć konto na zawsze?" : "Usunąć wszystkie dane?"}
          confirmLabel="Tak, usuń wszystko"
          confirmWord="USUŃ"
          onConfirm={async () => {
            try {
              await deleteAccountAndData();
            } catch (e) {
              setOpen(false);
              setError(e instanceof Error ? e.message : "Nie udało się usunąć konta.");
              return;
            }
            // stan w pamięci jest nieaktualny – start od zera
            window.location.replace("/");
          }}
          onCancel={() => setOpen(false)}
        >
          Tej operacji nie da się cofnąć{hasAccount ? " – konta nie da się potem odzyskać, także logując się tym samym e-mailem do starych danych" : ""}.
          Aplikacja uruchomi się od nowa jak po instalacji.
        </ConfirmDialog>
      )}
    </div>
  );
}

/** ID konta do zgłoszeń mailowych (np. usunięcie konta bez dostępu do aplikacji – /usun-konto). */
function AccountId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      hapticTap();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // brak dostępu do schowka – ID i tak jest widoczne do przepisania
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">ID konta (do zgłoszeń mailowych)</p>
        <p className="truncate font-mono text-xs text-body select-all">{id}</p>
      </div>
      <button onClick={() => void copy()} className="min-h-11 shrink-0 px-2 text-sm font-bold text-brand">
        {copied ? "Skopiowano" : "Kopiuj"}
      </button>
    </div>
  );
}
