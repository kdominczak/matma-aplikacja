"use client";

import { useSyncStatus } from "@/lib/learning-sync";
import { useEffect, useRef, useState } from "react";
import { Page, PageHeader, ProfileAvatar } from "@/components/layout/AppShell";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ErrorState from "@/components/ui/ErrorState";
import Icon from "@/components/ui/Icon";
import {
  avatarUrl,
  fetchLeaderboard,
  joinRanking,
  leaveRanking,
  NICK_PATTERN,
  renameNick,
  retryRanking,
  useRanking,
  useRankingSummary,
  watchLeaderboard,
  type LeaderboardPeriod,
  type LeaderboardRow,
  type RankingProfile,
} from "@/lib/ranking";

function plural(n: number) {
  if (n === 1) return "zadanie";
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? "zadania" : "zadań";
}

/** Zdjęcie z rankingu albo inicjał; „Ty” – własny awatar (także zdjęcie zapisane tylko na urządzeniu). */
function RowAvatar({ row, className, fallback }: { row: LeaderboardRow; className: string; fallback: string }) {
  if (row.is_me) return <ProfileAvatar size={className} />;
  const url = avatarUrl(row.user_id, row.avatar_version);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- static export: bez optymalizacji obrazów
    return <img src={url} alt="" aria-hidden loading="lazy" className={`shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full font-extrabold ${fallback} ${className}`}>
      {row.nick.slice(0, 1).toUpperCase()}
    </span>
  );
}

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "week", label: "Ten tydzień" },
  { id: "all", label: "Wszech czasów" },
];

export default function RankingView() {
  const ranking = useRanking();

  return (
    <Page>
      <PageHeader title="Ranking" subtitle="Liczą się poprawnie rozwiązane zadania – sprawdzone przez serwer. Walcz o podium z innymi maturzystami." />

      {ranking.status === "disabled" && <NotConfigured />}
      {ranking.status === "loading" && <div className="h-40 animate-pulse rounded-3xl bg-card" />}
      {ranking.status === "error" && <ErrorState title="Ranking jest chwilowo niedostępny" message={ranking.message} onRetry={retryRanking} />}

      {(ranking.status === "guest" || ranking.status === "member") && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ErrorBoundary>
            <Leaderboard />
          </ErrorBoundary>
          <aside className="flex flex-col gap-4 lg:sticky lg:top-10">
            {ranking.status === "guest" ? <JoinCard /> : <MyCard profile={ranking.profile} />}
            <p className="px-1 text-xs text-faint">
              Ranking tygodniowy startuje od nowa w każdy poniedziałek o północy. W rankingu widać tylko nick, zdjęcie, liczbę zadań i serię –
              nie używaj imienia i nazwiska.
            </p>
          </aside>
        </div>
      )}
    </Page>
  );
}

function NotConfigured() {
  return (
    <section className="rounded-3xl border border-dashed border-line glass-card p-6 text-center shadow-card">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
        <Icon name="trophy" className="h-7 w-7" />
      </span>
      <h2 className="mt-3 text-lg font-extrabold text-ink">Ranking jest jeszcze w drodze</h2>
      <p className="mt-1 text-sm text-muted">W tej wersji aplikacji ranking nie jest jeszcze włączony.</p>
      {process.env.NODE_ENV === "development" && (
        <p className="mt-4 rounded-2xl bg-subtle p-3 text-left text-xs text-muted">
          Dla deweloperów: uruchom <code>supabase/migrations/20261027120000_ranking.sql</code>, włącz logowanie anonimowe
          i ustaw <code>NEXT_PUBLIC_SUPABASE_URL</code> oraz <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> w{" "}
          <code>.env.local</code>.
        </p>
      )}
    </section>
  );
}

// ── Tabela wyników ──

function Leaderboard() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchLeaderboard(period)
        .then((data) => {
          if (!active) return;
          setRows(data);
          setError(false);
        })
        .catch(() => active && setError(true));
    void load();
    // na żywo: każda zmiana profilu (ktoś zapisał rozwiązane zadania) odświeża tabelę – z opóźnieniem, żeby nie zasypać bazy
    const stop = watchLeaderboard(() => {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(load, 1500);
    });
    return () => {
      active = false;
      clearTimeout(refreshTimer.current);
      stop();
    };
  }, [period, attempt]);

  // wiersze przychodzą posortowane – podium to pierwsze miejsca 1–3 (przy remisach maks. trzy osoby)
  const podium = rows?.filter((r) => r.rank <= 3).slice(0, 3) ?? [];
  const rest = rows?.slice(podium.length) ?? [];

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="grid max-w-xs flex-1 grid-cols-2 rounded-2xl border border-line bg-card p-1 shadow-card" role="radiogroup" aria-label="Okres">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={period === p.id}
              onClick={() => {
                setPeriod(p.id);
                setRows(null);
              }}
              className={`rounded-xl py-2 text-sm font-bold transition-colors ${
                period === p.id ? "bg-brand text-white shadow-float" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* „na żywo” tylko wtedy, gdy tabela naprawdę się wczytała */}
        {rows && !error && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Na żywo
          </span>
        )}
      </div>

      {error && (
        <ErrorState
          compact
          title={rows ? "Ranking może być nieaktualny" : "Nie udało się pobrać rankingu"}
          message={rows ? "Pokazujemy ostatnio pobrane wyniki. Sprawdź internet." : undefined}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}
      {!rows && !error && <div className="h-72 animate-pulse rounded-3xl bg-card" />}
      {rows && rows.length === 0 && (
        <p className="rounded-3xl border border-dashed border-line glass-card p-8 text-center text-sm text-muted">
          {period === "week" ? "W tym tygodniu nikt jeszcze nie rozwiązał zadania. Zostań pierwszy!" : "Ranking jest jeszcze pusty."}
        </p>
      )}

      {podium.length > 0 && <Podium rows={podium} />}

      {rest.length > 0 && (
        <ol className="overflow-hidden rounded-3xl border border-line glass-card shadow-card">
          {rest.map((row, i) => {
            const gap = i > 0 && row.rank - rest[i - 1].rank > 1;
            return (
              <li key={row.user_id}>
                {gap && <p className="border-t border-line py-1 text-center text-xs font-bold text-faint">⋯</p>}
                <Row row={row} />
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

const MEDAL = [
  { ring: "ring-amber-400", bg: "bg-linear-to-br from-amber-300 to-orange-500", height: "h-28", label: "1" },
  { ring: "ring-slate-300", bg: "bg-linear-to-br from-slate-200 to-slate-400", height: "h-20", label: "2" },
  { ring: "ring-orange-300", bg: "bg-linear-to-br from-orange-300 to-amber-700", height: "h-16", label: "3" },
];

/** Podium: 2. miejsce – 1. – 3. */
function Podium({ rows }: { rows: LeaderboardRow[] }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean) as LeaderboardRow[];
  return (
    <div className="grid grid-cols-3 items-end gap-3 rounded-3xl border border-line glass-card p-4 pt-6 shadow-card">
      {order.map((row) => {
        const medal = MEDAL[Math.min(row.rank, 3) - 1];
        return (
          <div key={row.user_id} className="flex min-w-0 flex-col items-center gap-2 text-center">
            <span className={`rounded-full shadow-lg ring-4 ${medal.ring}`}>
              <RowAvatar row={row} className="h-12 w-12 text-lg" fallback={`text-white ${medal.bg}`} />
            </span>
            <p className={`w-full truncate text-sm font-extrabold ${row.is_me ? "text-brand" : "text-ink"}`}>
              {row.nick}
              {row.is_me && " (Ty)"}
            </p>
            <p className="text-xs font-bold text-muted">
              {row.solved} {plural(row.solved)}
            </p>
            <div className={`flex w-full items-start justify-center rounded-t-2xl pt-2 text-2xl font-extrabold text-white ${medal.bg} ${medal.height}`}>
              {row.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Row({ row }: { row: LeaderboardRow }) {
  return (
    <div className={`flex items-center gap-3 border-t border-line px-4 py-3 first:border-t-0 ${row.is_me ? "bg-brand-soft" : ""}`}>
      <span className="w-8 shrink-0 text-center text-sm font-extrabold text-faint">{row.rank}</span>
      <RowAvatar row={row} className="h-9 w-9 text-sm" fallback="bg-subtle text-body" />
      <p className={`min-w-0 flex-1 truncate font-bold ${row.is_me ? "text-brand" : "text-ink"}`}>
        {row.nick}
        {row.is_me && <span className="ml-1.5 text-xs font-extrabold uppercase">Ty</span>}
      </p>
      {row.streak > 0 && (
        <span className="flex items-center gap-0.5 text-xs font-bold text-orange-500" title="Seria dni">
          <Icon name="flame" className="h-3.5 w-3.5" />
          {row.streak}
        </span>
      )}
      <span className="w-24 shrink-0 text-right text-sm font-extrabold text-ink tabular-nums">
        {row.solved} <span className="text-xs font-semibold text-faint">{plural(row.solved)}</span>
      </span>
    </div>
  );
}

// ── Profil w rankingu ──

function NickInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={20}
      autoComplete="off"
      spellCheck={false}
      placeholder="np. Pitagoras_2027"
      className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-faint focus:border-brand focus:outline-none"
    />
  );
}

function JoinCard() {
  const [nick, setNick] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    setError(await joinRanking(nick.trim()));
    setBusy(false);
  }

  return (
    <section className="rounded-3xl bg-navy p-5 text-white shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
        <Icon name="trophy" className="h-6 w-6" />
      </span>
      <h2 className="mt-3 text-lg font-extrabold">Dołącz do rankingu</h2>
      <p className="mt-1 text-sm text-white/70">Wystarczy nick – bez e-maila i hasła. Liczą się zadania rozwiązane od dołączenia.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void join();
        }}
        className="mt-4 flex flex-col gap-2"
      >
        <label htmlFor="join-nick" className="text-xs font-bold uppercase tracking-widest text-white/60">
          Twój nick
        </label>
        <NickInput id="join-nick" value={nick} onChange={setNick} />
        {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={busy || !NICK_PATTERN.test(nick.trim())}
          className="mt-1 rounded-2xl bg-brand py-3 font-bold text-white shadow-float disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none"
        >
          {busy ? "Dołączam…" : "Dołącz"}
        </button>
      </form>
    </section>
  );
}

function MyCard({ profile }: { profile: RankingProfile }) {
  // odświeżamy razem z profilem – zmienia się po każdej zapisanej sesji (seria, updated_at)
  const { summary, error: summaryError, retry: retrySummary } = useRankingSummary(true, profile);
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(profile.nick);
  const [error, setError] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  async function save() {
    const message = await renameNick(nick.trim());
    setError(message);
    if (!message) setEditing(false);
  }

  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card">
      <p className="text-xs font-extrabold uppercase tracking-widest text-faint">Twój profil</p>
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="mt-2 flex flex-col gap-2"
        >
          <label htmlFor="rename-nick" className="sr-only">
            Nowy nick
          </label>
          <NickInput id="rename-nick" value={nick} onChange={setNick} />
          {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-2xl bg-brand py-2.5 text-sm font-bold text-white">
              Zapisz
            </button>
            <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-2xl bg-subtle py-2.5 text-sm font-bold text-muted">
              Anuluj
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-2xl font-extrabold text-ink">{profile.nick}</p>
          <button onClick={() => setEditing(true)} className="shrink-0 text-sm font-bold text-brand">
            Zmień nick
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Ten tydzień" value={summary?.solvedWeek ?? (summaryError ? "–" : "…")} />
        <Stat label="Łącznie" value={summary?.solvedAll ?? (summaryError ? "–" : "…")} />
        <Stat label="Seria" value={profile.streak} />
      </div>
      {summaryError && (
        <button onClick={retrySummary} className="mt-2 flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand">
          <Icon name="refresh" className="h-4 w-4" />
          Nie wczytano wyniku – spróbuj ponownie
        </button>
      )}

      <SyncNote />

      <div className="mt-4 border-t border-line pt-3">
        {confirmLeave ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">Usunąć Cię z rankingu? Stracisz nick, zdjęcie i wynik w rankingu (postęp w nauce zostaje).</p>
            <div className="flex gap-2">
              <button onClick={() => void leaveRanking()} className="flex-1 rounded-2xl bg-rose-500 py-2.5 text-sm font-bold text-white">
                Tak, usuń
              </button>
              <button onClick={() => setConfirmLeave(false)} className="flex-1 rounded-2xl bg-subtle py-2.5 text-sm font-bold text-muted">
                Anuluj
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmLeave(true)} className="text-sm font-bold text-muted hover:text-rose-500">
            Wypisz mnie z rankingu
          </button>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-subtle py-2">
      <p className="text-lg font-extrabold text-ink tabular-nums">{value}</p>
      <p className="text-[11px] font-bold uppercase text-faint">{label}</p>
    </div>
  );
}

/** Widoczna informacja, gdy odpowiedzi nie docierają na serwer (zamiast cichego zera w rankingu). */
function SyncNote() {
  const sync = useSyncStatus();
  const text = sync.error
    ? sync.error
    : sync.unknown > 0
      ? `Serwer nie zna ${sync.unknown} zadań – wgraj supabase/seed/question_keys.sql.`
      : sync.pending > 0
        ? `${sync.pending} odpowiedzi czeka na wysłanie.`
        : null;
  if (!text) return null;
  return <p className="mt-3 rounded-2xl bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{text}</p>;
}
