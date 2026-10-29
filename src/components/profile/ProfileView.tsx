"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { BadgeIcon } from "@/components/achievements/Badge";
import NextBadge, { nextAchievement } from "@/components/achievements/NextBadge";
import WeekStreak from "@/components/home/WeekStreak";
import { Page, PageHeader, ProfileAvatar, useDisplayName } from "@/components/layout/AppShell";
import MistakesCard from "@/components/mistakes/MistakesCard";
import EstimateChart from "@/components/progress/EstimateChart";
import EmptyState from "@/components/ui/EmptyState";
import Icon, { type IconName } from "@/components/ui/Icon";
import { DIFFICULTIES, practiceTasks, topics } from "@/data/topics";
import { useAccount } from "@/lib/account";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AVATAR_COLORS, prepareAvatar, saveAppSettings, useAppSettings, type AvatarColor } from "@/lib/app-settings";
import { answersToEstimate, currentEstimate } from "@/lib/estimate";
import { MATURA_POINTS } from "@/lib/exam-weights";
import { hapticTap } from "@/lib/haptics";
import { topicMastery } from "@/lib/mastery";
import { longestPlanStreak } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { streak, testKey, totalStars, useProgress, weekSolved } from "@/lib/progress";
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
      />

      <ProfileCard progress={progress} />
      <SecureAccountNudge />
      <QuickLinks progress={progress} />

      <Section title="Statystyki">
        <div className="grid gap-3 lg:grid-cols-2">
          <AccuracyCard progress={progress} />
          <WeekStreak progress={progress} showRecord className="flex flex-col justify-between" />
        </div>
        <StatTiles progress={progress} />
      </Section>

      <Section title="Odznaki" action={{ label: `Wszystkie · ${Object.keys(progress.achievements).length}/${ACHIEVEMENTS.length}`, href: "/odznaki" }}>
        <BadgesShowcase progress={progress} />
      </Section>

      <Section title="Opanowanie działów">
        <MasteryList progress={progress} />
      </Section>

      <Section title="Szacowany wynik">
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-muted">Ze skuteczności we wszystkich zadaniach i wagi działów na maturze</p>
              {answersToEstimate(progress) > 0 ? (
                <p className="text-sm font-bold text-brand">
                  Zbieramy dane – jeszcze {answersToEstimate(progress)} {plural(answersToEstimate(progress), "zadanie", "zadania", "zadań")}
                </p>
              ) : (
                <p className="text-3xl font-extrabold tracking-tight text-brand tabular-nums">
                  {currentEstimate(progress)}%{" "}
                  <span className="text-base font-bold text-muted">
                    · ok. {Math.round((currentEstimate(progress) / 100) * MATURA_POINTS)}/{MATURA_POINTS} pkt
                  </span>
                </p>
              )}
            </div>
            <div className="mt-4">
              <EstimateChart progress={progress} />
            </div>
          </section>
          <MistakesCard progress={progress} />
        </div>
      </Section>
    </Page>
  );
}

/** Skróty do miejsc, które na telefonie nie mają własnej zakładki. */
function QuickLinks({ progress }: { progress: Progress }) {
  const mistakes = Object.keys(progress.mistakes).length;
  const links: { href: string; icon: IconName; label: string; hint: string }[] = [
    { href: "/ranking", icon: "trophy", label: "Ranking", hint: "Top tygodnia" },
    { href: "/odznaki", icon: "medal", label: "Odznaki", hint: `${Object.keys(progress.achievements).length}/${ACHIEVEMENTS.length}` },
    { href: "/bledy", icon: "archive", label: "Błędy", hint: mistakes > 0 ? `${mistakes} do poprawy` : "Pusto" },
  ];
  return (
    <nav aria-label="Skróty" className="grid grid-cols-3 gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex min-h-11 flex-col items-center gap-1.5 rounded-3xl border border-line bg-card p-3 text-center shadow-card transition-colors hover:border-brand/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Icon name={link.icon} className="h-5 w-5" />
          </span>
          <span className="text-sm font-extrabold text-ink">{link.label}</span>
          <span className="text-xs font-semibold text-muted">{link.hint}</span>
        </Link>
      ))}
    </nav>
  );
}

function Section({ title, action, children }: { title: string; action?: { label: string; href: string }; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-extrabold text-ink">{title}</h2>
        {action && (
          <Link href={action.href} className="-my-2 flex min-h-11 shrink-0 items-center gap-1 text-sm font-bold text-brand">
            {action.label} <Icon name="chevron" className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Karta profilu: zdjęcie, kolor, imię/nick, miejsce w rankingu ──

function ProfileCard({ progress }: { progress: Progress }) {
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

      <HeroStats progress={progress} />
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

/** Trzy liczby, które uczeń chce zobaczyć od razu: seria, rozwiązane zadania i szacowany wynik. */
function HeroStats({ progress }: { progress: Progress }) {
  const days = streak(progress);
  const items: { icon: IconName; value: string; label: string; tone: string }[] = [
    { icon: "flame", value: String(days), label: plural(days, "dzień serii", "dni serii", "dni serii"), tone: "text-orange-300" },
    { icon: "checkCircle", value: String(progress.stats.correct), label: "rozwiązane", tone: "text-emerald-300" },
    { icon: "target", value: answersToEstimate(progress) > 0 ? "–" : `${currentEstimate(progress)}%`, label: "szac. wynik", tone: "text-sky-300" },
  ];
  return (
    <dl className="relative mt-5 grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-2xl bg-white/10 px-2 py-3 text-center">
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <Icon name={item.icon} className={`mx-auto h-5 w-5 ${item.tone}`} />
            <span className="mt-1 block text-2xl font-extrabold tracking-tight tabular-nums">{item.value}</span>
            <span className="block truncate text-[11px] font-bold uppercase tracking-wide text-white/60">{item.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

const RING_RADIUS = 42;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Skuteczność jako pierścień – główny kafel statystyk. */
function AccuracyCard({ progress }: { progress: Progress }) {
  const { answered, correct } = progress.stats;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const week = weekSolved(progress);
  const tone = accuracy >= 80 ? "text-emerald-500" : accuracy >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <section className="flex items-center gap-5 rounded-3xl border border-line glass-card p-5 shadow-card">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={RING_RADIUS} fill="none" strokeWidth="10" className="stroke-subtle" />
          {answered > 0 && (
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              className={`ring-fill ${tone}`}
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - accuracy / 100)}
              style={{ "--ring-length": RING_LENGTH } as React.CSSProperties}
            />
          )}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold tracking-tight text-ink tabular-nums">{answered > 0 ? `${accuracy}%` : "–"}</span>
          <span className="text-[11px] font-bold text-faint">skuteczność</span>
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-extrabold text-ink">{answered > 0 ? `${correct} z ${answered} poprawnie` : "Jeszcze bez odpowiedzi"}</p>
        <p className="mt-1 text-sm text-muted">
          {answered > 0
            ? week > 0
              ? `W tym tygodniu: ${week} ${plural(week, "zadanie", "zadania", "zadań")}. Tak trzymaj!`
              : "W tym tygodniu jeszcze nic – plan na dziś zajmie kilkanaście minut."
            : "Rozwiąż pierwsze zadanie, a zobaczysz tu swoją skuteczność."}
        </p>
        <Link href="/plan" className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-2xl bg-brand-soft px-4 text-sm font-bold text-brand active:scale-[0.98]">
          Plan na dziś <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/** Kafle drugiego rzędu – każdy prowadzi tam, gdzie liczbę da się podnieść. */
function StatTiles({ progress }: { progress: Progress }) {
  const practiceSolved = Object.values(progress.practice).filter((r) => r.verifiedPoints === r.maxPoints).length;
  const passed = Object.values(progress.tests).filter((t) => !t.fromPlacement).length;
  const planBest = longestPlanStreak(progress);
  const stars = totalStars(progress);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile icon="tasks" tone="bg-brand-soft text-brand" value={practiceSolved} label={plural(practiceSolved, "zadanie rozwiązane", "zadania rozwiązane", "zadań rozwiązanych")} note="w zakładce Zadania" href="/zadania" />
      <Tile icon="star" tone="bg-amber-500/15 text-amber-500" value={stars} label={plural(stars, "gwiazdka", "gwiazdki", "gwiazdek")} note="z testów działów" href="/" />
      <Tile icon="layers" tone="bg-violet-500/15 text-violet-500" value={passed} label={plural(passed, "zaliczony test", "zaliczone testy", "zaliczonych testów")} note="działów z lekcjami" href="/" />
      <Tile icon="calendar" tone="bg-teal-500/15 text-teal-500" value={planBest} label={plural(planBest, "dzień z planem", "dni z planem", "dni z planem")} note="najdłuższa seria planu" href="/plan" />
    </div>
  );
}

function Tile({ icon, tone, value, label, note, href }: { icon: IconName; tone: string; value: number; label: string; note: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 flex-col gap-2 rounded-3xl border border-line glass-card p-4 shadow-card card-hover hover:border-brand/40 active:scale-[0.98]"
    >
      <span className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon name={icon} className="h-[18px] w-[18px]" />
        </span>
        <Icon name="chevron" className="h-4 w-4 text-faint transition-transform group-hover:translate-x-0.5" />
      </span>
      <span>
        <span className="block text-3xl font-extrabold tracking-tight text-ink tabular-nums">{value}</span>
        <span className="line-clamp-2 block text-sm leading-snug font-bold text-body">{label}</span>
        <span className="block truncate text-xs text-faint">{note}</span>
      </span>
    </Link>
  );
}

/** Gablota: zdobyte odznaki (najnowsze pierwsze) i najbliższa do zdobycia. */
function BadgesShowcase({ progress }: { progress: Progress }) {
  const earned = ACHIEVEMENTS.filter((a) => progress.achievements[a.id]).sort((a, b) => progress.achievements[b.id].localeCompare(progress.achievements[a.id]));
  const next = nextAchievement(progress);

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-line glass-card p-5 shadow-card">
      {earned.length > 0 ? (
        <ul className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-1" aria-label="Zdobyte odznaki">
          {earned.map((a) => (
            <li key={a.id} className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
              <BadgeIcon achievement={a} unlocked />
              <span className="line-clamp-2 text-xs font-bold leading-tight text-ink">{a.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Pierwsza odznaka jest bliżej, niż myślisz – zobacz, co ją odblokuje.</p>
      )}
      {next && <NextBadge progress={progress} achievement={next} />}
    </section>
  );
}

const LEVEL_NAMES = { podstawowy: "podstawowy", sredni: "średni", zaawansowany: "zaawansowany" } as const;
const LEVEL_SHORT = { podstawowy: "podst.", sredni: "śr.", zaawansowany: "zaaw." } as const;
const VISIBLE_TOPICS = 5;

/**
 * Opanowanie działów (ta sama miara co w planie na dziś) – najsłabsze na górze. Każdy wiersz prowadzi
 * prosto do zadań z działu, a kropki pokazują skuteczność na poziomach trudności.
 */
function MasteryList({ progress }: { progress: Progress }) {
  const [expanded, setExpanded] = useState(false);
  const rows = topics
    .map((topic) => {
      const levels = DIFFICULTIES.map((d) => ({ level: d, stat: progress.topicStats[testKey(topic.id, d.id)] }));
      const answered = levels.reduce((sum, l) => sum + (l.stat?.answered ?? 0), 0);
      return { topic, levels, answered, mastery: Math.round(topicMastery(progress, topic) * 100) };
    })
    .filter((row) => row.answered > 0)
    .sort((a, b) => a.mastery - b.mastery);

  if (rows.length === 0) {
    return (
      <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
        <EmptyState icon="layers" title="Tu zobaczysz swoje mocne i słabe działy" action={{ label: "Zacznij plan na dziś", href: "/plan" }}>
          Po kilku zadaniach pokażemy, które działy masz opanowane, a do których warto wrócić.
        </EmptyState>
      </section>
    );
  }

  const shown = expanded ? rows : rows.slice(0, VISIBLE_TOPICS);
  return (
    <section className="rounded-3xl border border-line glass-card shadow-card">
      <p className="px-5 pt-4 text-sm text-muted">Najsłabsze działy na górze – stuknij, żeby od razu poćwiczyć.</p>
      <ul className="mt-2 flex flex-col divide-y divide-line">
        {shown.map(({ topic, levels, answered, mastery }) => {
          const tone = mastery >= 80 ? "bg-emerald-500" : mastery >= 50 ? "bg-amber-400" : "bg-rose-500";
          const href = practiceTasks(topic).length > 0 ? `/zadania/${topic.id}` : `/dzial/${topic.id}`;
          return (
            <li key={topic.id}>
              <Link href={href} className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-subtle/60 active:bg-subtle">
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-bold text-ink">{topic.title}</span>
                    <span className="shrink-0 text-sm font-extrabold text-ink tabular-nums">{mastery}%</span>
                  </span>
                  <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-subtle">
                    <span className={`bar-grow block h-full rounded-full ${tone}`} style={{ width: `${Math.max(mastery, 3)}%` }} />
                  </span>
                  <span className="mt-1.5 flex items-center gap-2 text-xs text-faint">
                    {levels.map(({ level, stat }) => {
                      const ratio = stat && stat.answered > 0 ? stat.correct / stat.answered : null;
                      const dot = ratio === null ? "bg-line" : ratio >= 0.8 ? "bg-emerald-500" : ratio >= 0.5 ? "bg-amber-400" : "bg-rose-500";
                      return (
                        <span key={level.id} className="flex items-center gap-1" title={`${level.label}: ${stat ? `${stat.correct}/${stat.answered}` : "bez zadań"}`}>
                          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
                          <span className="sr-only">
                            Poziom {LEVEL_NAMES[level.id]}: {stat ? `${stat.correct} z ${stat.answered} poprawnie` : "bez zadań"}
                          </span>
                          <span aria-hidden>{LEVEL_SHORT[level.id]}</span>
                        </span>
                      );
                    })}
                    <span className="ml-auto">
                      {answered} {plural(answered, "odpowiedź", "odpowiedzi", "odpowiedzi")}
                    </span>
                  </span>
                </span>
                <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
      {rows.length > VISIBLE_TOPICS && (
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-b-3xl border-t border-line text-sm font-bold text-brand hover:bg-subtle/60"
        >
          {expanded ? "Pokaż mniej" : `Pokaż wszystkie (${rows.length})`}
          <Icon name="chevron" className={`h-4 w-4 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`} />
        </button>
      )}
    </section>
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
