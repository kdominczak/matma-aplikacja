// Dane do regulaminu (/regulamin), polityki prywatności (/prywatnosc) i strony usuwania konta (/usun-konto).
// RODO wymaga wskazania administratora danych i kontaktu; Google Play – nazwy aplikacji i dewelopera
// takiej jak w sklepie. Puste pola strony oznaczają jako brakujące.

export const LEGAL = {
  /** Nazwa aplikacji dokładnie jak w Google Play. */
  appName: "Matma",
  /** Administrator danych (współadministratorzy): imiona i nazwiska albo nazwa firmy. */
  controller: "Kacper Domińczak i Oskar Piskulak",
  /** Adres do korespondencji administratora (RODO, art. 13). */
  address: "ul. Prosta 12/4, 00-850 Warszawa",
  /** E-mail do spraw danych osobowych (wnioski o dostęp, usunięcie, sprzeciw). */
  contactEmail: "matma.aplikacja@gmail.com",
  /** Region serwerów Supabase (Project Settings → General: eu-west-1). */
  serverRegion: "Irlandia (UE)",
  /**
   * Podstawa przekazania danych do USA (Groq, RevenueCat) – art. 44–46 RODO, np. „standardowe klauzule umowne zatwierdzone przez
   * Komisję Europejską, zawarte w umowach powierzenia z dostawcami” albo „decyzja o odpowiednim stopniu ochrony (EU-US Data Privacy
   * Framework)”. Wpisz po sprawdzeniu umów (DPA) obu dostawców – pusta wartość jest widoczna na stronie jako brak.
   */
  transferBasis: "",
  /** Po ilu dniach znikają automatyczne kopie zapasowe bazy (Supabase – zależnie od planu, maks. 7 dni). */
  backupRetentionDays: 7,
  /** Na odpowiedź na wniosek mailowy RODO daje miesiąc – obiecujemy tyle samo. */
  requestDays: 30,
  /** Data ostatniej zmiany polityki (RRRR-MM-DD). */
  updatedAt: "2026-10-31",
  /** Data ostatniej zmiany regulaminu (RRRR-MM-DD). Zmiana regulaminu = nowa data + informacja w aplikacji z wyprzedzeniem. */
  termsUpdatedAt: "2026-10-31",
  /** Ile dni mamy na odpowiedź na reklamację (ustawa o prawach konsumenta: 14 dni). */
  complaintDays: 14,
};

/** Komunikat przy arkuszach, na ekranie głównym i w Premium – nie sugerujemy powiązania z CKE (zadania CKE podajemy ze źródłem). */
export const CKE_DISCLAIMER = "Aplikacja ma charakter edukacyjny i nie jest powiązana z Centralną Komisją Egzaminacyjną (CKE).";

/**
 * Zgoda przed zakupem Premium (pole wyboru na ekranie Premium, § 7 regulaminu): żądanie natychmiastowego dostępu
 * i przyjęcie do wiadomości utraty prawa odstąpienia (ustawa o prawach konsumenta, art. 38 ust. 1 pkt 13).
 */
export const PURCHASE_CONSENT_TEXT =
  "Chcę, żeby Premium zaczęło działać od razu po zakupie. Wiem, że przez to tracę prawo do odstąpienia od umowy w ciągu 14 dni.";
