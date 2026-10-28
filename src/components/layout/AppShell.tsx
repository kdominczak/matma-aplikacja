"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Countdown from "@/components/layout/Countdown";
import GlowBackground from "@/components/layout/GlowBackground";
import BottomSheet from "@/components/ui/BottomSheet";
import Icon, { type IconName } from "@/components/ui/Icon";
import { ThemeSwitcher, ThemeToggle } from "@/components/ui/ThemeToggle";
import { AVATAR_COLORS, useAppSettings } from "@/lib/app-settings";
import { streak, syncLearning, useProgress } from "@/lib/progress";
import { avatarUrl, useRanking } from "@/lib/ranking";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Na telefonie w dolnym pasku; pozostałe trafiają do „Więcej”. */
  primary: boolean;
  description: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "Ucz się", icon: "home", primary: true, description: "Plan nauki i dzienne wyzwanie" },
  { href: "/zadania", label: "Zadania", icon: "tasks", primary: true, description: "Zadania maturalne z wybranego działu" },
  { href: "/wzory", label: "Wzory", icon: "book", primary: false, description: "Wszystkie wzory z działów" },
  { href: "/arkusze", label: "Arkusze CKE", icon: "file", primary: false, description: "Matury z poprzednich lat (PDF)" },
  { href: "/korepetytor", label: "Korepetytor", icon: "sparkles", primary: true, description: "Wklej zadanie i rozwiąż je z AI" },
  { href: "/ranking", label: "Ranking", icon: "trophy", primary: false, description: "Top maturzystów tygodnia" },
  { href: "/profil", label: "Profil", icon: "user", primary: true, description: "Zdjęcie, statystyki i postępy" },
  { href: "/odznaki", label: "Odznaki", icon: "medal", primary: false, description: "Twoja kolekcja osiągnięć" },
  { href: "/ustawienia", label: "Ustawienia", icon: "settings", primary: false, description: "Cel, motyw, korepetytor AI, dane" },
];

function useActiveHref() {
  // trailingSlash: true → ścieżki mogą kończyć się „/”; działy należą do „Ucz się”, pudełko porażek do „Profilu”
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  if (pathname.startsWith("/bledy")) return "/profil";
  return NAV.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/";
}

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xl font-extrabold text-white shadow-float">
        Σ
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink">matma</span>
    </Link>
  );
}

/** Nazwa ucznia: nick z rankingu, imię z profilu albo „Twój profil”. */
export function useDisplayName(): string {
  const ranking = useRanking();
  const settings = useAppSettings();
  if (ranking.status === "member") return ranking.profile.nick;
  return settings?.name.trim() || "Twój profil";
}

/** Awatar: własne zdjęcie (z urządzenia albo z rankingu), inaczej inicjał na wybranym kolorze. */
export function ProfileAvatar({ size = "h-10 w-10 text-base" }: { size?: string }) {
  const ranking = useRanking();
  const settings = useAppSettings();
  const name = useDisplayName();
  const remote = ranking.status === "member" ? avatarUrl(ranking.profile.id, ranking.profile.avatar_version) : null;
  const photo = settings?.avatar ?? remote;
  const color = AVATAR_COLORS[settings?.avatarColor ?? "brand"];

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static export: bez optymalizacji obrazów, data URL
      <img src={photo} alt="" aria-hidden className={`shrink-0 rounded-full object-cover shadow-float ${size}`} />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-extrabold text-white shadow-float ${color} ${size}`}
    >
      {name === "Twój profil" ? <Icon name="user" className="h-1/2 w-1/2" /> : name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** Pasek nad treścią: logo (telefon), ustawienia i wejście do profilu w prawym górnym rogu. */
function TopBar({ active }: { active: string }) {
  const progress = useProgress();
  const name = useDisplayName();
  const days = progress ? streak(progress) : 0;

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-3 sm:px-6 lg:px-10 lg:pt-6">
      <div className="lg:invisible">
        <Logo />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle className="lg:hidden" />
        <Link
          href="/ustawienia"
          aria-label="Ustawienia"
          aria-current={active === "/ustawienia" ? "page" : undefined}
          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors ${
            active === "/ustawienia" ? "border-brand text-brand" : "border-line text-muted hover:text-ink"
          }`}
        >
          <Icon name="settings" className="h-5 w-5" />
        </Link>
        <Link
          href="/profil"
          aria-label="Twój profil"
          aria-current={active === "/profil" ? "page" : undefined}
          className={`flex items-center gap-2.5 rounded-full border bg-card p-1 transition-colors sm:pr-4 ${
            active === "/profil" ? "border-brand ring-2 ring-brand/30" : "border-line hover:border-brand/40"
          }`}
        >
          <ProfileAvatar size="h-9 w-9 text-sm" />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block max-w-36 truncate text-sm font-extrabold text-ink">{name}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-muted">
              <Icon name="flame" className="h-3 w-3 text-orange-500" />
              {days > 0 ? `${days} ${days === 1 ? "dzień" : "dni"} z rzędu` : "Zacznij serię"}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}

/**
 * Układ aplikacji: na desktopie stały panel boczny, na telefonie dolny pasek.
 * Treść ma własną maksymalną szerokość – na dużych ekranach nie rozciąga się „mobilnie”.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const active = useActiveHref();
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  const progress = useProgress();
  const [moreOpen, setMoreOpen] = useState(false);
  const secondary = NAV.filter((item) => !item.primary);
  const secondaryActive = secondary.some((item) => item.href === active);

  // Uczeń z kontem (ranking): wyrównujemy Pudełko porażek i historię odpowiedzi z Supabase
  const ranking = useRanking();
  const memberId = ranking.status === "member" ? ranking.profile.id : null;
  useEffect(() => {
    if (memberId) void syncLearning();
  }, [memberId]);

  return (
    // reducedMotion="user": przy systemowym „ogranicz ruch” widoki pojawiają się bez animacji
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {pathname === "/" && <GlowBackground />}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-card px-5 py-6 lg:flex">
          <Logo />
          <nav className="mt-10 flex flex-col gap-1" aria-label="Główna nawigacja">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active === item.href ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
                  active === item.href ? "text-brand" : "text-muted hover:bg-subtle hover:text-ink"
                }`}
              >
                {/* podświetlenie aktywnej zakładki „przepływa” między pozycjami menu */}
                {active === item.href && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl bg-brand-soft"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon name={item.icon} className="relative h-5 w-5" />
                <span className="relative">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-navy p-4 text-white">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Seria</p>
                <p className="mt-0.5 flex items-center gap-1 text-lg font-extrabold">
                  <Icon name="flame" className="h-4 w-4 text-orange-400" />
                  {progress ? streak(progress) : 0}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60">Rozwiązane</p>
                <p className="mt-0.5 text-lg font-extrabold">{progress?.stats.correct ?? 0}</p>
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </aside>

        <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-10 lg:pl-72">
          <div className="bg-navy pt-[env(safe-area-inset-top)]">
            <Countdown />
          </div>
          <TopBar active={active} />
          {/*
            Każdy widok wjeżdża z lekkim uniesieniem i rozjaśnieniem. Bez animacji wyjścia: w App Routerze
            stary widok podmienia się od razu, więc „znikanie” pokazałoby już nową treść.
            initial={false} – pierwsze wejście do aplikacji bez animacji (treść widoczna od razu w HTML).
          */}
          <AnimatePresence initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
          aria-label="Główna nawigacja"
        >
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {NAV.filter((item) => item.primary).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active === item.href ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors sm:text-xs ${
                    active === item.href ? "text-brand" : "text-faint"
                  }`}
                >
                  <Icon name={item.icon} className="h-6 w-6" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={() => setMoreOpen(true)}
                aria-haspopup="dialog"
                className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors sm:text-xs ${
                  secondaryActive ? "text-brand" : "text-faint"
                }`}
              >
                <Icon name="more" className="h-6 w-6" />
                Więcej
              </button>
            </li>
          </ul>
        </nav>

        {moreOpen && (
          <BottomSheet title="Więcej" onClose={() => setMoreOpen(false)}>
            <ul className="flex flex-col gap-2">
              {secondary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                      active === item.href ? "border-brand bg-brand-soft" : "border-line bg-card hover:border-brand/40"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-brand">
                      <Icon name={item.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-ink">{item.label}</span>
                      <span className="block text-sm text-muted">{item.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </BottomSheet>
        )}
      </div>
    </MotionConfig>
  );
}

/** Wspólny kontener strony: marginesy i maksymalna szerokość treści. */
export function Page({ children, width = "wide" }: { children: ReactNode; width?: "wide" | "reading" }) {
  const max = width === "wide" ? "max-w-6xl" : "max-w-3xl";
  return (
    <div
      className={`mx-auto flex w-full ${max} flex-col gap-6 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-6`}
    >
      {children}
    </div>
  );
}

/** Nagłówek ekranu: tytuł + podtytuł, opcjonalnie akcja po prawej. */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        {/* w jasnym motywie granat → niebieski (biały gradient byłby niewidoczny na jasnym tle) */}
        <h1 className="bg-linear-to-r from-navy via-brand-dark to-brand bg-clip-text text-transparent dark:from-white dark:via-blue-200 dark:to-blue-400 text-3xl font-extrabold tracking-tight lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
