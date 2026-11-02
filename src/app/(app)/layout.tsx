import AppShell from "@/components/layout/AppShell";

/** Ekrany z nawigacją (Ucz się, Zadania, Arkusze, Korepetytor, Profil i podstrony). Testy działają w trybie pełnoekranowym. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
