"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Countdown from "@/components/layout/Countdown";
import Icon, { type IconName } from "@/components/ui/Icon";
import { ThemeSwitcher } from "@/components/ui/ThemeToggle";
import { useProgress, userLevel, XP_PER_LEVEL } from "@/lib/progress";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Ucz się", icon: "home" },
  { href: "/wzory", label: "Wzory", icon: "book" },
  { href: "/korepetytor", label: "Korepetytor", icon: "sparkles" },
  { href: "/postepy", label: "Postępy", icon: "chart" },
  { href: "/odznaki", label: "Odznaki", icon: "medal" },
];

function useActiveHref() {
  // trailingSlash: true → ścieżki mogą kończyć się „/”; działy należą do „Ucz się”, pudełko porażek do „Postępów”
  const pathname = usePathname().replace(/(.)\/$/, "$1");
  if (pathname.startsWith("/bledy")) return "/postepy";
  return NAV.find((item) => item.href !== "/" && pathname.startsWith(item.href))?.href ?? "/";
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-xl font-extrabold text-white shadow-float">
        Σ
      </span>
      <span className="text-xl font-extrabold tracking-tight text-ink">matma</span>
    </Link>
  );
}

/**
 * Układ aplikacji: na desktopie stały panel boczny, na telefonie dolny pasek.
 * Treść ma własną maksymalną szerokość – na dużych ekranach nie rozciąga się „mobilnie”.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const active = useActiveHref();
  const progress = useProgress();
  const xp = progress?.xp ?? 0;

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-card px-5 py-6 lg:flex">
        <Logo />
        <nav className="mt-10 flex flex-col gap-1" aria-label="Główna nawigacja">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.href ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors ${
                active === item.href ? "bg-brand-soft text-brand" : "text-muted hover:bg-subtle hover:text-ink"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="rounded-2xl bg-navy p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Twój poziom</p>
            <p className="mt-0.5 text-lg font-extrabold">
              Poziom {userLevel(xp)} · {xp} XP
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100}%` }}
              />
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </aside>

      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-10 lg:pl-72">
        <div className="bg-navy pt-[env(safe-area-inset-top)]">
          <Countdown />
        </div>
        {children}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
        aria-label="Główna nawigacja"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active === item.href ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition-colors sm:text-[11px] ${
                  active === item.href ? "text-brand" : "text-faint"
                }`}
              >
                <Icon name={item.icon} className="h-6 w-6" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Wspólny kontener strony: marginesy i maksymalna szerokość treści. */
export function Page({ children, width = "wide" }: { children: ReactNode; width?: "wide" | "reading" }) {
  const max = width === "wide" ? "max-w-6xl" : "max-w-3xl";
  return (
    <div
      className={`mx-auto flex w-full ${max} animate-fade-in flex-col gap-6 px-4 pt-5 sm:px-6 lg:px-10 lg:pt-10`}
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
        <h1 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
