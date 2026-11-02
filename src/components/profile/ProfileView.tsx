"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import StudyTimeCard from "@/components/home/StudyTimeCard";
import WeekStreak from "@/components/home/WeekStreak";
import { Page, PageHeader, ProfileAvatar, useDisplayName } from "@/components/layout/AppShell";
import EstimateChart from "@/components/progress/EstimateChart";
import EmptyState from "@/components/ui/EmptyState";
import Icon, { type IconName } from "@/components/ui/Icon";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { extendedTopics, practiceTasks, topics } from "@/data/topics";
import { useAccount } from "@/lib/account";
import { AI_ENABLED } from "@/lib/ai-config";
import { prepareAvatar, saveAppSettings, useAppSettings } from "@/lib/app-settings";
import { answersToEstimate, currentEstimate } from "@/lib/estimate";
import { LEVEL_POINTS } from "@/lib/exam-weights";
import { LEVEL_LONG, levelTarget } from "@/lib/level";
import LevelSwitch, { useActiveLevel } from "@/components/progress/LevelSwitch";
import CountUp from "@/components/ui/CountUp";
import { longestPlanStreak } from "@/lib/planner";
import { plural } from "@/lib/plural";
import { formatPremiumUntil, isPremium, REFERRAL_DAYS, usePremium } from "@/lib/premium";
import { streak, useProgress, weekSolved } from "@/lib/progress";
import { topicMasteryRows } from "@/lib/topic-progress";
import { MasteryRows } from "@/components/progress/MasteredTopics";
import { goalPoints } from "@/lib/goal";
import type { Progress } from "@/types/progress";
import type { Level } from "@/types/topic";

export default function ProfileView() {
  const progress = useProgress();
  if (!progress) return <PageSkeleton />;

  return (
    <Page>
      <PageHeader
        title="Profil"
        subtitle="Twoje zdjęcie, statystyki i postępy."
      />

      <ProfileCard progress={progress} />
      <SecureAccountNudge />
      <QuickLinks progress={progress} />
      <PremiumStrip />

      <Section title="Statystyki">
        <div className="grid gap-3 lg:grid-cols-2">
          <AccuracyCard progress={progress} />
          <WeekStreak progress={progress} showRecord className="flex flex-col justify-between" />
        </div>
        <StudyTimeCard />
        <StatTiles progress={progress} />
      </Section>

      <Section title="Opanowane działy" action={{ label: "Wszystkie działy", href: "/opanowane" }}>
        <MasteryPreview progress={progress} />
      </Section>

      <Section title="Szacowany wynik">
        <EstimateSection progress={progress} />
      </Section>
    </Page>
  );
}

/** Szacowany wynik z wykresem – dla poziomu z przełącznika (przy obu maturach). */
function EstimateSection({ progress }: { progress: Progress }) {
  const { level } = useActiveLevel(progress);
  const value = currentEstimate(progress, level);
  const max = LEVEL_POINTS[level];
  return (
        <section className="card p-5 lg:p-6">
          <LevelSwitch progress={progress} className="mb-4 sm:max-w-sm" />
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm text-muted">
              {LEVEL_LONG[level]} – ze skuteczności we wszystkich zadaniach i wagi działów na maturze
            </p>
            {answersToEstimate(progress) > 0 ? (
              <p className="text-sm font-bold text-brand">
                Zbieramy dane – jeszcze {answersToEstimate(progress)} {plural(answersToEstimate(progress), "zadanie", "zadania", "zadań")}
              </p>
            ) : (
              <p className="font-display text-3xl font-extrabold tracking-tight text-brand tabular-nums">
                <CountUp value={value} suffix="%" />{" "}
                <span className="text-base font-bold text-muted">
                  · ok. {Math.round((value / 100) * max)}/{max} pkt
                </span>
              </p>
            )}
          </div>
          {answersToEstimate(progress) === 0 && <PassBar estimate={value} level={level} goal={levelTarget(progress, level)} />}
          <div className="mt-4">
            <EstimateChart progress={progress} level={level} />
          </div>
        </section>
  );
}

/** Próg zdania matury podstawowej (rozszerzona nie ma progu – liczy się do rekrutacji). */
const PASS_PERCENT = 30;

/**
 * Szacowany wynik na tle progu zdania i celu ucznia – zamiast rankingu: porównanie z tym, co naprawdę się liczy.
 */
function PassBar({ estimate, level, goal }: { estimate: number; level: Level; goal: number }) {
  const max = LEVEL_POINTS[level];
  const points = Math.round((estimate / 100) * max);
  const pass = level === "podstawowy";
  const passPoints = Math.ceil((PASS_PERCENT / 100) * max);
  const goalPts = goalPoints(goal, level);
  const status = pass
    ? points >= passPoints
      ? `Nad progiem zdania o ${points - passPoints} pkt`
      : `Do progu zdania brakuje ${passPoints - points} pkt`
    : "Matura rozszerzona nie ma progu zdania – liczy się wynik do rekrutacji";
  const goalLine = points >= goalPts ? "cel osiągnięty" : `do celu ${goalPts} pkt brakuje ${goalPts - points} pkt`;
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="relative h-3 rounded-full bg-subtle" aria-hidden>
        <span className="bar-grow absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${Math.min(estimate, 100)}%` }} />
        {pass && <span className="absolute -inset-y-1 w-0.5 rounded-full bg-ink" style={{ left: `${PASS_PERCENT}%` }} />}
        <span className="absolute -inset-y-1 w-0.5 rounded-full bg-emerald-500" style={{ left: `${Math.min((goalPts / max) * 100, 100)}%` }} />
      </div>
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {pass && (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded-full bg-ink" aria-hidden />
            próg {PASS_PERCENT}% ({passPoints} pkt)
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 rounded-full bg-emerald-500" aria-hidden />
          Twój cel: {goalPts} pkt
        </span>
      </p>
      <p className="text-sm font-bold text-ink">
        {status} · {goalLine}.
      </p>
    </div>
  );
}

/** Premium w profilu: stan albo zachęta do polecenia znajomemu. */
function PremiumStrip() {
  const premium = usePremium();
  const active = isPremium(premium);
  if (!AI_ENABLED || premium.status === "unavailable") return null;
  return (
    <Link href="/premium" className="card card-hover flex items-center gap-4 p-4 hover:border-brand/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-float">
        <Icon name="sparkles" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-ink">{active ? "Premium aktywne" : "Premium"}</span>
        <span className="block text-sm text-muted">
          {active && premium.premiumUntil
            ? `Do ${formatPremiumUntil(premium.premiumUntil)}`
            : `Poleć znajomemu – oboje dostaniecie ${REFERRAL_DAYS} dni Premium`}
        </span>
      </span>
      <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint" />
    </Link>
  );
}

/** Skróty do miejsc, które na telefonie nie mają własnej zakładki. */
function QuickLinks({ progress }: { progress: Progress }) {
  const mistakes = Object.keys(progress.mistakes).length;
  const mastered = topicMasteryRows(progress, topics).filter((r) => r.mastered).length;
  const links: { href: string; icon: IconName; label: string; hint: string }[] = [
    { href: "/opanowane", icon: "checkCircle", label: "Działy", hint: `${mastered}/${topics.length} opanowanych` },
    { href: "/bledy", icon: "archive", label: "Błędy", hint: mistakes > 0 ? `${mistakes} do poprawy` : "Pusto" },
    { href: "/wzory", icon: "book", label: "Wzory", hint: "Wszystkie działy" },
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

// ── Karta profilu: zdjęcie i imię (tylko na urządzeniu) ──

function ProfileCard({ progress }: { progress: Progress }) {
  const settings = useAppSettings();
  const name = useDisplayName();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasPhoto = Boolean(settings?.avatar);

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const { dataUrl } = await prepareAvatar(file);
      await saveAppSettings({ avatar: dataUrl });
      setMessage("Zdjęcie zapisane na tym urządzeniu.");
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
    setBusy(false);
    setMessage("Zdjęcie usunięte.");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card lg:p-7">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <div className="relative shrink-0 self-start">
          <ProfileAvatar size="h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl" />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Zmień zdjęcie profilowe"
            className="absolute -right-2 -bottom-2 flex h-11 w-11 items-center justify-center rounded-full border-4 border-navy bg-brand text-on-brand shadow-float disabled:opacity-60"
          >
            <Icon name="camera" className="h-4 w-4" />
          </button>
          {/* accept="image/*" – na telefonie system proponuje galerię albo aparat */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void choosePhoto(e.target.files?.[0])} />
        </div>

        <div className="min-w-0 flex-1">
          <NameEditor />
          {/* zdjęcie zmienia przycisk z aparatem przy awatarze; tu tylko usuwanie i komunikaty */}
          {(hasPhoto || busy || message) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {busy && <span className="text-white/70">Zapisywanie…</span>}
              {!busy && message && <span className="text-white/70">{message}</span>}
              {hasPhoto && !busy && (
                <button
                  onClick={() => void removePhoto()}
                  className="-my-2 min-h-11 font-bold text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
                >
                  Usuń zdjęcie
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <HeroStats progress={progress} />
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
          <button type="submit" className="rounded-xl bg-brand px-4 text-sm font-bold text-on-brand">
            Zapisz
          </button>
        )}
      </div>
      <p className="text-xs text-white/50">Imię i zdjęcie widzisz tylko Ty – zostają na tym urządzeniu.</p>
    </form>
  );
}

// ── Statystyki ──

/** Trzy liczby, które uczeń chce zobaczyć od razu: seria, rozwiązane zadania i szacowany wynik. */
function HeroStats({ progress }: { progress: Progress }) {
  const days = streak(progress);
  const items: { icon: IconName; value: string; label: string; tone: string }[] = [
    { icon: "flame", value: String(days), label: plural(days, "dzień serii", "dni serii", "dni serii"), tone: "text-orange-300" },
    { icon: "checkCircle", value: String(progress.stats.correct), label: "poprawne odp.", tone: "text-emerald-300" },
    { icon: "target", value: answersToEstimate(progress) > 0 ? "–" : `${currentEstimate(progress)}%`, label: "szacowany wynik", tone: "text-sky-300" },
  ];
  return (
    <dl className="relative mt-5 grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-2xl bg-white/10 px-2 py-3 text-center">
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <Icon name={item.icon} className={`mx-auto h-5 w-5 ${item.tone}`} />
            <span className="mt-1 block text-2xl font-extrabold tracking-tight tabular-nums">{item.value}</span>
            {/* bez wersalików i obcinania – „ROZWIĄZA…” na wąskim telefonie było nieczytelne */}
            <span className="mt-0.5 block text-xs leading-tight font-semibold text-white/65">{item.label}</span>
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
    <section className="card flex items-center gap-5 p-5">
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
          <span className="text-xs font-bold text-faint">skuteczność</span>
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

const OPEN_TASK_IDS = topics.flatMap(practiceTasks).flatMap((t) => (t.kind === "open" ? [t.id] : []));

/** Kafle drugiego rzędu – każdy prowadzi tam, gdzie liczbę da się podnieść. */
function StatTiles({ progress }: { progress: Progress }) {
  const practiceSolved = Object.values(progress.practice).filter((r) => r.verifiedPoints === r.maxPoints).length;
  const planBest = longestPlanStreak(progress);
  const mastered = topicMasteryRows(progress, topics).filter((r) => r.mastered).length;
  const openSolved = OPEN_TASK_IDS.filter((id) => {
    const record = progress.practice[id];
    return record && record.verifiedPoints === record.maxPoints;
  }).length;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile icon="tasks" tone="bg-brand-soft text-brand" value={practiceSolved} label={plural(practiceSolved, "zadanie rozwiązane", "zadania rozwiązane", "zadań rozwiązanych")} note="w zakładce Zadania" href="/zadania" />
      <Tile icon="checkCircle" tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" value={mastered} label={plural(mastered, "dział opanowany", "działy opanowane", "działów opanowanych")} note="wszystkie 3 poziomy" href="/opanowane" />
      <Tile icon="layers" tone="bg-violet-500/15 text-violet-500" value={openSolved} label={plural(openSolved, "zadanie otwarte", "zadania otwarte", "zadań otwartych")} note="rozwiązane w całości" href="/zadania" />
      <Tile icon="calendar" tone="bg-teal-500/15 text-teal-500" value={planBest} label={plural(planBest, "dzień z planem", "dni z planem", "dni z planem")} note="najdłuższa seria planu" href="/plan" />
    </div>
  );
}

function Tile({ icon, tone, value, label, note, href }: { icon: IconName; tone: string; value: number; label: string; note: string; href: string }) {
  return (
    <Link
      href={href}
      className="card group flex min-w-0 flex-col gap-2 p-4 card-hover hover:border-brand/40 active:scale-[0.98]"
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
        <span className="block text-xs leading-snug text-faint">{note}</span>
      </span>
    </Link>
  );
}

/**
 * Podgląd „Opanowanych działów”: działy w toku, najsłabsze na górze (stuknięcie – zadania z działu).
 * Pełna lista z podstawą i rozszerzeniem – /opanowane.
 */
function MasteryPreview({ progress }: { progress: Progress }) {
  const { levels } = useActiveLevel(progress);
  const list = levels.includes("rozszerzony") ? [...topics, ...extendedTopics] : topics;
  const rows = topicMasteryRows(progress, list)
    .filter((r) => r.answered > 0 && !r.mastered)
    .sort((a, b) => a.levels.filter((l) => l.state === "mastered").length - b.levels.filter((l) => l.state === "mastered").length)
    .slice(0, 5);
  if (rows.length === 0) {
    return (
      <section className="card p-5">
        <EmptyState icon="layers" title="Tu zobaczysz działy do dokończenia" action={{ label: "Zacznij plan na dziś", href: "/plan" }}>
          Rozwiązuj zadania – dział jest opanowany, gdy na wszystkich trzech poziomach masz ok. 75% poprawnych.
        </EmptyState>
      </section>
    );
  }
  return (
    <section className="card overflow-hidden">
      <p className="px-5 pt-4 text-sm text-muted">Działy w toku – najdalej od opanowania na górze.</p>
      <div className="mt-2">
        <MasteryRows rows={rows} />
      </div>
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
        <span className="block text-sm text-muted">Bez konta postęp i Pudełko porażek znikną przy zmianie telefonu. Google albo e-mail – kilka sekund.</span>
      </span>
      <Icon name="arrow" className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
    </Link>
  );
}
