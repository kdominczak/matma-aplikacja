"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import WeekStreak from "@/components/home/WeekStreak";
import { Page, PageHeader, ProfileAvatar, useDisplayName } from "@/components/layout/AppShell";
import MistakesCard from "@/components/mistakes/MistakesCard";
import EstimateChart from "@/components/progress/EstimateChart";
import TopicCard from "@/components/topic/TopicCard";
import Icon, { type IconName } from "@/components/ui/Icon";
import { DIFFICULTIES, topics } from "@/data/topics";
import { useAccount } from "@/lib/account";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AVATAR_COLORS, prepareAvatar, saveAppSettings, useAppSettings, type AvatarColor } from "@/lib/app-settings";
import { currentEstimate } from "@/lib/estimate";
import { hapticTap } from "@/lib/haptics";
import { longestStreak, passedLevels, streak, testKey, totalStars, useProgress } from "@/lib/progress";
import {
  NICK_PATTERN,
  removeRankingAvatar,
  renameNick,
  uploadRankingAvatar,
  useRanking,
  useRankingSummary,
} from "@/lib/ranking";
import type { Progress } from "@/types/progress";

export default function ProfileView() {
  const progress = useProgress();
  if (!progress) return null;

  return (
    <Page>
      <PageHeader
        title="Profil"
        subtitle="Twoje zdjęcie, statystyki i postępy."
        action={
          <Link
            href="/ustawienia"
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl border border-line bg-card px-3 py-2 text-sm font-bold text-muted transition-colors hover:text-ink"
          >
            <Icon name="settings" className="h-4 w-4" />
            <span className="hidden sm:inline">Ustawienia</span>
          </Link>
        }
      />

      <ProfileCard />
      <SecureAccountNudge />

      <Section title="Statystyki">
        <StatsGrid progress={progress} />
        <TopicAccuracy progress={progress} />
      </Section>

      <Section title="Postępy">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-ink">Szacowany wynik matury</h3>
                <p className="text-sm text-muted">Na podstawie zaliczonych testów i wagi działów w arkuszu</p>
              </div>
              <p className="text-3xl font-extrabold tracking-tight text-brand">{currentEstimate(progress)}%</p>
            </div>
            <div className="mt-4">
              <EstimateChart progress={progress} />
            </div>
          </section>
          <div className="flex flex-col gap-4">
            <WeekStreak progress={progress} />
            <MistakesCard progress={progress} />
          </div>
        </div>
        <StartedTopics progress={progress} />
      </Section>
    </Page>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

// ── Karta profilu: zdjęcie, kolor, imię/nick, miejsce w rankingu ──

function ProfileCard() {
  const settings = useAppSettings();
  const ranking = useRanking();
  const name = useDisplayName();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const member = ranking.status === "member" ? ranking.profile : null;
  const hasPhoto = Boolean(settings?.avatar || member?.avatar_version);

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const { dataUrl, blob } = await prepareAvatar(file);
      await saveAppSettings({ avatar: dataUrl });
      if (member) setMessage((await uploadRankingAvatar(blob)) ?? "Zdjęcie zapisane – widać je też w rankingu.");
      else setMessage("Zdjęcie zapisane na tym urządzeniu.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto() {
    setBusy(true);
    await saveAppSettings({ avatar: null });
    if (member) await removeRankingAvatar();
    setBusy(false);
    setMessage("Zdjęcie usunięte.");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card lg:p-7">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative self-start">
          <ProfileAvatar size="h-24 w-24 text-4xl" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Zmień zdjęcie profilowe"
            className="absolute -right-2 -bottom-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-navy bg-brand text-white shadow-float disabled:opacity-60"
          >
            <Icon name="camera" className="h-4 w-4" />
          </button>
          {/* accept="image/*" – na telefonie system proponuje galerię albo aparat */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void choosePhoto(e.target.files?.[0])} />
        </div>

        <div className="min-w-0 flex-1">
          {member ? <NickEditor nick={member.nick} /> : <NameEditor />}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="min-h-11 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-60"
            >
              {busy ? "Zapisywanie…" : hasPhoto ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
            </button>
            {hasPhoto && (
              <button
                onClick={() => void removePhoto()}
                disabled={busy}
                className="rounded-xl px-3 py-1.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                Usuń zdjęcie
              </button>
            )}
          </div>
          {message && <p className="mt-2 text-sm text-white/70">{message}</p>}
        </div>
      </div>

      {!hasPhoto && settings && (
        <div className="relative mt-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Kolor awatara</p>
          <div className="mt-2 flex flex-wrap gap-3" role="radiogroup" aria-label="Kolor awatara">
            {(Object.keys(AVATAR_COLORS) as AvatarColor[]).map((color) => (
              <button
                key={color}
                role="radio"
                aria-checked={settings.avatarColor === color}
                aria-label={color}
                onClick={() => {
                  hapticTap();
                  void saveAppSettings({ avatarColor: color });
                }}
                className={`h-10 w-10 shrink-0 rounded-full bg-linear-to-br transition-transform ${AVATAR_COLORS[color]} ${
                  settings.avatarColor === color ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-navy" : "hover:scale-105"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <RankingStrip />
      <p className="sr-only">Zalogowany jako {name}</p>
    </section>
  );
}

function NameEditor() {
  const settings = useAppSettings();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? settings?.name ?? "";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void saveAppSettings({ name: value.trim().slice(0, 30) });
        setDraft(null);
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-widest text-white/60">
        Jak masz na imię?
      </label>
      <div className="flex gap-2">
        <input
          id="profile-name"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={30}
          placeholder="np. Ola"
          className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-xl font-extrabold text-white placeholder:text-white/40 focus:bg-white/15 focus:outline-none"
        />
        {draft !== null && (
          <button type="submit" className="rounded-xl bg-brand px-4 text-sm font-bold">
            Zapisz
          </button>
        )}
      </div>
      <p className="text-xs text-white/50">
        Imię widzisz tylko Ty.{" "}
        <Link href="/ranking" className="font-bold text-white/80 underline">
          Dołącz do rankingu
        </Link>
        , żeby mieć publiczny nick.
      </p>
    </form>
  );
}

function NickEditor({ nick }: { nick: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(nick);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">Nick w rankingu</p>
        <div className="flex items-center gap-3">
          <p className="truncate text-2xl font-extrabold">{nick}</p>
          <button
            onClick={() => {
              setDraft(nick);
              setEditing(true);
            }}
            className="shrink-0 text-sm font-bold text-white/70 underline hover:text-white"
          >
            Zmień
          </button>
        </div>
      </div>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const result = await renameNick(draft.trim());
        setError(result);
        if (!result) setEditing(false);
      }}
      className="flex flex-col gap-1"
    >
      <label htmlFor="profile-nick" className="text-xs font-bold uppercase tracking-widest text-white/60">
        Nowy nick
      </label>
      <div className="flex gap-2">
        <input
          id="profile-nick"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={20}
          className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-xl font-extrabold text-white focus:outline-none"
        />
        <button type="submit" disabled={!NICK_PATTERN.test(draft.trim())} className="rounded-xl bg-brand px-4 text-sm font-bold disabled:opacity-50">
          Zapisz
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </form>
  );
}

/** Miejsce w rankingu – tylko dla uczniów, którzy do niego dołączyli. */
function RankingStrip() {
  const ranking = useRanking();
  const memberId = ranking.status === "member" ? ranking.profile.id : null;
  const { summary, error, retry } = useRankingSummary(Boolean(memberId), memberId);

  if (!memberId) return null;
  if (error && !summary) {
    return (
      <button
        onClick={retry}
        className="relative mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 p-3 text-sm font-bold transition-colors hover:bg-white/15"
      >
        <Icon name="refresh" className="h-4 w-4" />
        Nie udało się wczytać miejsca w rankingu – spróbuj ponownie
      </button>
    );
  }
  return (
    <Link href="/ranking" className="relative mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/10 p-3 transition-colors hover:bg-white/15">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Ranking · ten tydzień</p>
        <p className="text-lg font-extrabold">{summary ? `#${summary.rankWeek} · ${summary.solvedWeek} zadań` : "…"}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Wszech czasów</p>
        <p className="text-lg font-extrabold">{summary ? `#${summary.rankAll} · ${summary.solvedAll} zadań` : "…"}</p>
      </div>
    </Link>
  );
}

// ── Statystyki ──

function StatsGrid({ progress }: { progress: Progress }) {
  const { answered, correct } = progress.stats;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
  const days = streak(progress);
  const best = longestStreak(progress);
  const earned = Object.keys(progress.achievements).length;
  const practiceSolved = Object.values(progress.practice).filter((r) => r.points === r.maxPoints).length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-3xl border border-line glass-card p-5 shadow-card sm:col-span-2">
        <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <Icon name="target" className="h-4 w-4" />
          Skuteczność
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{accuracy === null ? "–" : `${accuracy}%`}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-subtle">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${accuracy ?? 0}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">
          {answered > 0 ? `${correct} z ${answered} odpowiedzi poprawnych` : "Rozwiąż pierwsze zadanie, aby zobaczyć skuteczność."}
        </p>
      </div>
      <Stat icon="checkCircle" tone="text-emerald-600 dark:text-emerald-400" label="Rozwiązane poprawnie" value={correct} note={`z ${answered} prób`} />
      <Stat icon="flame" tone="text-orange-500" label="Seria dni" value={days} note={`Rekord: ${best} ${best === 1 ? "dzień" : "dni"}`} />
      <Stat icon="tasks" tone="text-brand" label="Zadania (zakładka)" value={practiceSolved} note="rozwiązane w całości" href="/zadania" />
      <Stat icon="star" tone="text-amber-500" label="Gwiazdki" value={totalStars(progress)} />
      <Stat icon="layers" tone="text-violet-500" label="Zaliczone testy" value={Object.values(progress.tests).filter((t) => !t.fromPlacement).length} />
      <Stat icon="medal" tone="text-violet-500" label="Odznaki" value={`${earned}/${ACHIEVEMENTS.length}`} href="/odznaki" />
    </div>
  );
}

function Stat({
  icon,
  tone,
  label,
  value,
  note,
  href,
}: {
  icon: IconName;
  tone: string;
  label: string;
  value: string | number;
  note?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className={`flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest ${tone}`}>
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-ink tabular-nums">{value}</p>
      {note && <p className="text-sm text-muted">{note}</p>}
    </>
  );
  const className = "rounded-3xl border border-line glass-card p-5 shadow-card";
  return href ? (
    <Link href={href} className={`${className} card-hover hover:border-brand/40`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const LEVEL_SHORT = { podstawowy: "P", sredni: "Ś", zaawansowany: "Z" } as const;

/** Skuteczność per dział (z rozbiciem na poziomy) – najsłabsze działy na górze. */
function TopicAccuracy({ progress }: { progress: Progress }) {
  const rows = topics
    .map((topic) => {
      const levels = DIFFICULTIES.map((d) => ({ level: d, stat: progress.topicStats[testKey(topic.id, d.id)] }));
      const answered = levels.reduce((sum, l) => sum + (l.stat?.answered ?? 0), 0);
      const correct = levels.reduce((sum, l) => sum + (l.stat?.correct ?? 0), 0);
      return { topic, levels, answered, accuracy: answered ? correct / answered : 0 };
    })
    .filter((row) => row.answered > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-6">
      <h3 className="font-extrabold text-ink">Skuteczność w działach</h3>
      <p className="text-sm text-muted">Najsłabsze działy na górze – tam warto wrócić najpierw.</p>
      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">
          Rozwiąż kilka zadań, a zobaczysz tu swoją skuteczność w każdym dziale.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {rows.map(({ topic, levels, answered, accuracy }) => {
            const percent = Math.round(accuracy * 100);
            const tone = percent >= 80 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-400" : "bg-rose-500";
            return (
              <li key={topic.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-bold text-ink">{topic.title}</p>
                  <p className="shrink-0 text-sm font-extrabold text-ink tabular-nums">
                    {percent}% <span className="text-xs font-semibold text-faint">· {answered} odp.</span>
                  </p>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle">
                  <div className={`h-full rounded-full transition-all duration-500 ${tone}`} style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 flex gap-3 text-xs font-semibold text-faint">
                  {levels.map(({ level, stat }) => (
                    <span key={level.id} title={level.label}>
                      {LEVEL_SHORT[level.id]}: {stat ? `${stat.correct}/${stat.answered}` : "–"}
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function StartedTopics({ progress }: { progress: Progress }) {
  const started = topics.filter((t) => passedLevels(progress, t.id) > 0);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-extrabold text-ink">Rozpoczęte działy</h3>
      {started.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Zalicz pierwszy test, a Twoje działy pojawią się tutaj.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {started.map((topic) => (
            <TopicCard key={topic.id} topic={topic} progress={progress} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Przypomnienie o zabezpieczeniu postępu – dopóki konto nie ma e-maila, postęp jest tylko na telefonie. */
function SecureAccountNudge() {
  const account = useAccount();
  if (account.status !== "signed-out" && account.status !== "anonymous") return null;
  return (
    <Link
      href="/ustawienia#konto"
      className="flex items-center gap-3 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 card-hover hover:border-amber-500/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <Icon name="lock" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-ink">Zabezpiecz swój postęp</span>
        <span className="block text-sm text-muted">Bez konta odznaki i Pudełko porażek znikną przy zmianie telefonu. Zajmie to minutę.</span>
      </span>
      <Icon name="arrow" className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
    </Link>
  );
}
