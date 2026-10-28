"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import AccountCard from "@/components/settings/AccountCard";
import AiSettingsCard from "@/components/tutor/AiSettingsCard";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Icon, { type IconName } from "@/components/ui/Icon";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import { CKE_ARCHIVE_URL } from "@/data/cke-sheets";
import { TARGETS } from "@/data/topics";
import { saveAppSettings, useAppSettings } from "@/lib/app-settings";
import { resetCloudData } from "@/lib/cloud-sync";
import { hapticTap } from "@/lib/haptics";
import { formatDay, resetProgress, setTarget, useProgress } from "@/lib/progress";
import { leaveRanking, useRanking } from "@/lib/ranking";
import type { Progress } from "@/types/progress";

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
      <PageHeader title="Ustawienia" subtitle="Konto, cel nauki, wygląd, korepetytor AI i Twoje dane." />

      <div id="konto" className="scroll-mt-6">
        <AccountCard />
      </div>

      <div id="cel" className="scroll-mt-6">
        <TargetSetting progress={progress} />
      </div>

      <Card icon="sun" title="Wygląd" description="Motyw jasny, ciemny lub zgodny z ustawieniami telefonu.">
        <ThemeSwitcher />
      </Card>

      <Card icon="vibrate" title="Dźwięki, wibracje i efekty" description="Reakcje aplikacji przy odpowiedziach i wynikach.">
        <div className="flex flex-col divide-y divide-line">
          <Toggle
            label="Dźwięki"
            description="Cichy klik przy wyborze odpowiedzi A–D (wyłącz, żeby wyciszyć)"
            checked={settings.sounds}
            onChange={(sounds) => void saveAppSettings({ sounds })}
          />
          <Toggle
            label="Wibracje"
            description="Krótka wibracja przy dobrej i złej odpowiedzi"
            checked={settings.haptics}
            onChange={(haptics) => void saveAppSettings({ haptics })}
          />
          <Toggle
            label="Konfetti"
            description="Animacja po zaliczonym teście"
            checked={settings.confetti}
            onChange={(confetti) => void saveAppSettings({ confetti })}
          />
        </div>
      </Card>

      <div id="ustawienia-ai" className="scroll-mt-6">
        <AiSettingsCard />
      </div>

      <PlacementSetting progress={progress} />
      <RankingSetting />
      <ResetSetting progress={progress} />

      <Card icon="info" title="O aplikacji" description="Matma – codzienna nauka do matury z matematyki.">
        <p className="text-sm text-muted">
          Arkusze i karta wzorów pochodzą ze zbiorów{" "}
          <a href={CKE_ARCHIVE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-brand underline">
            Centralnej Komisji Egzaminacyjnej
          </a>
          . Aplikacja nie jest powiązana z CKE. Korepetytor AI korzysta z Twojego klucza Groq.
        </p>
      </Card>
    </Page>
  );
}

function Card({ icon, title, description, children }: { icon: IconName; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-extrabold text-ink">
        <Icon name={icon} className="h-5 w-5 text-brand" />
        {title}
      </h2>
      <p className="mb-3 text-sm text-muted">{description}</p>
      {children}
    </section>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span>
        <span className="block font-bold text-ink">{label}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          onChange(!checked);
          hapticTap();
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-subtle"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

/** Cel na maturze – decyduje, które działy są w planie nauki na stronie głównej. */
function TargetSetting({ progress }: { progress: Progress }) {
  return (
    <Card icon="target" title="Cel na maturze" description="Plan nauki na stronie głównej pokazuje działy potrzebne do wybranego wyniku.">
      <div className="grid gap-2" role="radiogroup" aria-label="Cel na maturze">
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
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-colors ${
                selected ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40"
              }`}
            >
              <span>
                <span className={`block font-extrabold ${selected ? "text-brand" : "text-ink"}`}>{t.label}</span>
                <span className="block text-sm text-muted">{t.subtitle}</span>
              </span>
              {selected && <Icon name="checkCircle" className="h-5 w-5 shrink-0 text-brand" />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function PlacementSetting({ progress }: { progress: Progress }) {
  const placement = progress.placement;
  return (
    <Card
      icon="graduation"
      title="Test na start"
      description={
        placement?.status === "done"
          ? `Zrobiony ${formatDay(placement.at)}: ${placement.correct}/${placement.total} poprawnych, cel ${placement.target}%.`
          : "12 zadań przekrojowych – ustawi cel i zaliczy z góry to, co już umiesz."
      }
    >
      <Link
        href="/start"
        className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-brand transition-colors hover:border-brand/40"
      >
        {placement?.status === "done" ? "Powtórz test" : "Zrób test na start"}
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </Card>
  );
}

function RankingSetting() {
  const ranking = useRanking();
  const [confirm, setConfirm] = useState(false);
  if (ranking.status === "disabled") return null;

  return (
    <Card icon="trophy" title="Ranking i konto" description="Ranking liczy poprawnie rozwiązane zadania. Inni widzą tylko Twój nick i zdjęcie.">
      {ranking.status === "member" ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-body">
            Jesteś w rankingu jako <strong className="text-ink">{ranking.profile.nick}</strong>.
          </p>
          <button onClick={() => setConfirm(true)} className="rounded-2xl border border-line px-4 py-2 text-sm font-bold text-muted hover:text-rose-500">
            Wypisz mnie z rankingu
          </button>
        </div>
      ) : (
        <Link href="/ranking" className="inline-flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-brand">
          Dołącz do rankingu <Icon name="arrow" className="h-4 w-4" />
        </Link>
      )}
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
    </Card>
  );
}

function ResetSetting({ progress }: { progress: Progress }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <section className="rounded-3xl border border-rose-500/30 bg-rose-500/5 p-5">
      <h2 className="flex items-center gap-2 font-extrabold text-ink">
        <Icon name="alert" className="h-5 w-5 text-rose-500" />
        Resetowanie postępów
      </h2>
      <p className="mt-1 text-sm text-muted">
        Usuwa zaliczone testy, serię, statystyki, odznaki, Pudełko porażek i historię arkuszy – także kopię i historię odpowiedzi na koncie. Ustawienia,
        zdjęcie, klucz Groq i nick w rankingu zostają.
      </p>
      {done && <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">Postęp został wyzerowany.</p>}
      {failed && (
        <p role="alert" className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
          Nie udało się wyzerować kopii na koncie (sprawdź internet). Postęp na telefonie został bez zmian – inaczej wróciłby z chmury.
        </p>
      )}
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-2xl border-2 border-rose-500/40 bg-card px-5 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:border-rose-500 dark:text-rose-300"
      >
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
    </section>
  );
}
