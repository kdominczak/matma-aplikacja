// Dane do polityki prywatności (/prywatnosc) i strony usuwania konta (/usun-konto).
// RODO wymaga wskazania administratora danych i kontaktu; Google Play – nazwy aplikacji i dewelopera
// takiej jak w sklepie. Puste pola strony oznaczają jako brakujące.

export const LEGAL = {
  /** Nazwa aplikacji dokładnie jak w Google Play. */
  appName: "Matma",
  /** Administrator danych (współadministratorzy): imiona i nazwiska albo nazwa firmy. */
  controller: "Kacper Domińczak i Oskar Piskulak",
  /** Adres do korespondencji administratora (RODO, art. 13). */
  address: "",
  /** E-mail do spraw danych osobowych (wnioski o dostęp, usunięcie, sprzeciw). */
  contactEmail: "matma.aplikacja@gmail.com",
  /** Region serwerów Supabase (Project Settings → General: eu-west-1). */
  serverRegion: "Irlandia (UE)",
  /** Po ilu dniach znikają automatyczne kopie zapasowe bazy (Supabase – zależnie od planu, maks. 7 dni). */
  backupRetentionDays: 7,
  /** Na odpowiedź na wniosek mailowy RODO daje miesiąc – obiecujemy tyle samo. */
  requestDays: 30,
  /** Data ostatniej zmiany polityki (RRRR-MM-DD). */
  updatedAt: "2026-10-28",
};
