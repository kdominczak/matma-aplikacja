import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ContactEmail, LegalSection as Section, Missing } from "@/components/legal/LegalParts";
import { LEGAL } from "@/data/legal";
import { AI_ENABLED } from "@/lib/ai-config";
import { formatDay } from "@/lib/stats";

export const metadata = { title: `Polityka prywatności – ${LEGAL.appName}` };

export default function PrivacyPage() {
  return (
    <Page width="reading">
      <PageHeader title="Polityka prywatności" subtitle={`Obowiązuje od ${formatDay(LEGAL.updatedAt)}. Piszemy wprost, bez prawniczego żargonu.`} />

      <article className="card flex flex-col gap-7 p-6">
        <Section title="W skrócie">
          <ul>
            <li>Możesz korzystać z aplikacji bez konta – wtedy wszystko zostaje na Twoim telefonie.</li>
            <li>Nie pokazujemy reklam, nie śledzimy Cię między aplikacjami i nie sprzedajemy danych.</li>
            <li>Nic o Tobie nie jest publiczne – imię i zdjęcie w profilu zostają na Twoim telefonie.</li>
            <li>
              Konto i wszystkie dane usuniesz sam w Ustawieniach albo mailowo –{" "}
              <Link href="/usun-konto" className="font-bold text-brand underline">
                jak usunąć konto
              </Link>
              .
            </li>
            {AI_ENABLED && (
              <li>
                Wiadomości do korepetytora AI i zdjęcia rozwiązań przekazujemy do modelu AI firmy Groq w USA – bez danych Twojego konta i bez zapisywania
                ich u nas.
              </li>
            )}
          </ul>
        </Section>

        <Section title="Kto jest administratorem danych">
          <p>
            Administratorzy (współadministratorzy) aplikacji {LEGAL.appName}: {LEGAL.controller || <Missing what="imiona i nazwiska lub firma" />}, adres
            do korespondencji: {LEGAL.address || <Missing what="adres do korespondencji" />}. Kontakt w sprawie danych:{" "}
            <ContactEmail email={LEGAL.contactEmail} />.
          </p>
        </Section>

        <Section title="Jakie dane i po co">
          <p>
            <strong className="text-ink">Na urządzeniu (zawsze):</strong> postęp nauki, wyniki zadań i arkuszy, Pudełko porażek, ustawienia, imię i zdjęcie
            z profilu. Te dane nie opuszczają telefonu, dopóki nie założysz konta.
          </p>
          {AI_ENABLED && (
            <p>
              <strong className="text-ink">Korepetytor AI i Premium (jeśli korzystasz – wymagają konta):</strong> liczba wiadomości do AI
              w danym dniu (dzienny limit), a z Premium także liczba ocen zdjęć rozwiązań, okres Premium, Twój kod polecenia i to, kto kogo
              polecił. Treści rozmów, zdjęć ani ocen nie zapisujemy na serwerze (ocena arkusza zostaje na Twoim urządzeniu i w kopii postępu). Do statystyk
              zapisujemy też, czy danego dnia konto wyczerpało limit AI, otworzyło ekran Premium albo zaczęło zakup (bez innych szczegółów; usuwamy
              to po 180 dniach) – żeby wiedzieć, czy Premium jest dobrze ustawione.
            </p>
          )}
          <p>
            <strong className="text-ink">Zakup Premium (jeśli kupisz):</strong> zakup wymaga konta z e-mailem, żeby Premium nie przepadło po zmianie
            telefonu. Zapisujemy rodzaj pakietu, datę końca Premium i historię zdarzeń zakupu (zakup, odnowienie, zwrot). Danych karty ani płatności
            nie dostajemy – płatność obsługuje Google Play.
          </p>
          <p>
            <strong className="text-ink">Dawny ranking:</strong> aplikacja nie ma już rankingu. Jeśli Twoje konto było w nim wcześniej, nick, zdjęcie
            i historia odpowiedzi zostaną usunięte z serwera; do tego czasu nikt ich nie widzi, a usunięcie konta kasuje je od razu.
          </p>
          <p>
            <strong className="text-ink">Konto z e-mailem (jeśli założysz):</strong> adres e-mail, hasło (przechowywane wyłącznie jako skrót –
            nikt, także my, nie zna jego treści), kopia postępu i historia arkuszy – żeby nic nie przepadło po zmianie telefonu. Przy logowaniu
            przez Google dostajemy od Google adres e-mail, imię i nazwisko z konta Google oraz jego identyfikator. Zapisują się przy koncie, ale
            do logowania używamy tylko adresu e-mail i identyfikatora.
          </p>
          <p>
            Podstawą przetwarzania jest świadczenie usługi, o którą prosisz (art. 6 ust. 1 lit. b RODO). Jeśli masz mniej niż 16 lat, przed założeniem
            konta z e-mailem porozmawiaj o tym z rodzicem lub opiekunem.
          </p>
        </Section>

        <Section title="Komu przekazujemy dane">
          <ul>
            <li>
              <strong className="text-ink">Supabase</strong> – baza danych i logowanie (konto, kopia postępu, Premium). Region serwerów:{" "}
              {LEGAL.serverRegion || <Missing what="region serwerów Supabase" />}.
            </li>
            <li>
              <strong className="text-ink">Groq (USA)</strong> – model AI, który tworzy odpowiedzi korepetytora, wyjaśnienia, podpowiedzi i ocenę
              rozwiązań ze zdjęcia. Przez nasz serwer przekazujemy wyłącznie treść zapytania: Twoją wiadomość, załączone zdjęcie, tekst z pliku PDF
              albo przepisane rozwiązanie. Nie przekazujemy identyfikatora konta, e-maila, imienia ani Twojego adresu IP (zapytanie wysyła nasz serwer),
              a nasz serwer tych treści nie zapisuje. Nie umieszczaj w wiadomościach i na zdjęciach danych osobowych (np. imienia i nazwiska na kartce)
              – sama treść może je zawierać, więc nie nazywamy jej anonimową.
            </li>
            <li>
              <strong className="text-ink">Google Play</strong> – przyjmuje płatność za Premium (według własnej polityki prywatności Google).
            </li>
            <li>
              <strong className="text-ink">Google (logowanie, jeśli wybierzesz „Kontynuuj z Google”)</strong> – potwierdza Twoją tożsamość i przekazuje
              nam e-mail oraz podstawowe dane konta Google (według polityki prywatności Google). Nie dostajemy dostępu do Twojej poczty ani plików.
            </li>
            <li>
              <strong className="text-ink">RevenueCat</strong> – potwierdza zakupy ze sklepu i ich odnowienia. Dostaje identyfikator Twojego konta
              (bez imienia i e-maila) i dane transakcji ze sklepu.
            </li>
          </ul>
        </Section>

        <Section title="Przekazywanie danych poza Europejski Obszar Gospodarczy">
          <p>
            Groq i RevenueCat to firmy z USA, więc dane opisane wyżej mogą trafić poza EOG. Podstawa przekazania:{" "}
            {LEGAL.transferBasis || <Missing what="podstawa przekazania danych do USA (art. 44–46 RODO)" />}. Kopię zabezpieczeń możesz otrzymać,
            pisząc na <ContactEmail email={LEGAL.contactEmail} />.
          </p>
        </Section>

        <Section title="Jak długo przechowujemy dane">
          <p>
            Dopóki masz konto. Po usunięciu konta (Ustawienia → Strefa niebezpieczna → Usunięcie konta) serwer od razu kasuje kopię postępu, historię arkuszy
            i dane z dawnego rankingu; automatyczne kopie zapasowe bazy wygasają najpóźniej po {LEGAL.backupRetentionDays} dniach.
          </p>
          <p>
            Usunięcie konta kasuje też okres Premium i historię zakupów u nas, ale nie anuluje subskrypcji w Google Play – anuluj ją w Google Play
            (Płatności i subskrypcje), żeby nie została pobrana kolejna opłata.
          </p>
        </Section>

        <Section title="Twoje prawa">
          <p>
            Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia i sprzeciwu. Większość z nich
            zrealizujesz sam w aplikacji (zmiana imienia i zdjęcia, reset postępu, usunięcie konta). W pozostałych sprawach napisz do
            administratora. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
          </p>
        </Section>

      </article>

      <p className="flex gap-4 text-sm font-bold">
        <Link href="/regulamin" className="text-brand">
          Regulamin
        </Link>
        <Link href="/ustawienia" className="text-brand">
          ← Wróć do ustawień
        </Link>
      </p>
    </Page>
  );
}
