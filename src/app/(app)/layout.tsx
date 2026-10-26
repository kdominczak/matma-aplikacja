import AppShell from "@/components/layout/AppShell";

/** Ekrany z nawigacją: Ucz się, działy, Wzory, Postępy, Odznaki. Testy działają w trybie pełnoekranowym. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
