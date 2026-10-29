import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ContactEmail, LegalSection as Section, Missing } from "@/components/legal/LegalParts";
import { LEGAL } from "@/data/legal";
import { AI_ENABLED } from "@/lib/ai-config";
import { formatDay } from "@/lib/stats";

export const metadata = { title: "Polityka prywatności – Matma" };

export default function PrivacyPage() {
  return (
    <Page width="reading">
      <PageHeader title="Polityka prywatności" subtitle={`Obowiązuje od ${formatDay(LEGAL.updatedAt)}. Piszemy wprost, bez prawniczego żargonu.`} />

      <article className="card flex flex-col gap-7 p-6">
        <Section title="W skrócie">
          <ul>
            <li>Możesz korzystać z aplikacji bez konta – wtedy wszystko zostaje na Twoim telefonie.</li>
            <li>Nie pokazujemy reklam, nie śledzimy Cię między aplikacjami i nie sprzedajemy danych.</li>
            <li>W rankingu inni widzą tylko nick, zdjęcie (jeśli dodasz), liczbę rozwiązanych zadań i serię dni.</li>
            <li>
              Konto i wszystkie dane usuniesz sam w Ustawieniach albo mailowo –{" "}
              <Link href="/usun-konto" className="font-bold text-brand underline">
                jak usunąć konto
              </Link>
              .
            </li>
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
            <strong className="text-ink">Na urządzeniu (zawsze):</strong> postęp nauki, wyniki testów i arkuszy, Pudełko porażek, ustawienia, imię i zdjęcie
            z profilu. Te dane nie opuszczają telefonu, dopóki nie założysz konta.
          </p>
          {AI_ENABLED && (
            <p>
              <strong className="text-ink">Korepetytor AI i Premium (jeśli korzystasz):</strong> anonimowe konto bez e-maila, liczba wiadomości do AI
              w danym dniu (dzienny limit), okres Premium, Twój kod polecenia i to, kto kogo polecił. Treści rozmów nie zapisujemy.
            </p>
          )}
          <p>
            <strong className="text-ink">Zakup Premium (jeśli kupisz):</strong> zakup wymaga konta z e-mailem, żeby Premium nie przepadło po zmianie
            telefonu. Zapisujemy rodzaj pakietu, datę końca Premium i historię zdarzeń zakupu (zakup, odnowienie, zwrot). Danych karty ani płatności
            nie dostajemy – płatność obsługuje Google Play.
          </p>
          <p>
            <strong className="text-ink">Ranking (jeśli dołączysz):</strong> anonimowe konto bez e-maila, nick, opcjonalne zdjęcie, historia odpowiedzi
            (które zadanie, wybrana litera, czas) i seria dni. Historia jest potrzebna, żeby serwer sam sprawdzał odpowiedzi i ranking był uczciwy.
          </p>
          <p>
            <strong className="text-ink">Konto z e-mailem (jeśli założysz):</strong> adres e-mail do logowania kodem, kopia postępu i historia arkuszy –
            żeby nic nie przepadło po zmianie telefonu.
          </p>
          <p>
            Podstawą przetwarzania jest świadczenie usługi, o którą prosisz (art. 6 ust. 1 lit. b RODO). Jeśli masz mniej niż 16 lat, przed założeniem
            konta z e-mailem porozmawiaj o tym z rodzicem lub opiekunem.
          </p>
        </Section>

        <Section title="Komu przekazujemy dane">
          <ul>
            <li>
              <strong className="text-ink">Supabase</strong> – baza danych i logowanie (konto, ranking, kopia postępu). Region serwerów:{" "}
              {LEGAL.serverRegion || <Missing what="region serwerów Supabase" />}.
            </li>
            <li>
              <strong className="text-ink">Groq</strong> – generuje odpowiedzi korepetytora AI. Treść rozmowy, załączone zdjęcia i tekst z plików PDF
              przekazujemy przez nasz serwer do Groq tylko po to, żeby powstała odpowiedź; serwer ich nie zapisuje. Nie wysyłaj w czacie danych
              osobowych.
            </li>
            <li>
              <strong className="text-ink">Google Play</strong> – przyjmuje płatność za Premium (według własnej polityki prywatności Google).
            </li>
            <li>
              <strong className="text-ink">RevenueCat</strong> – potwierdza zakupy ze sklepu i ich odnowienia. Dostaje identyfikator Twojego konta
              (bez imienia i e-maila) i dane transakcji ze sklepu.
            </li>
          </ul>
        </Section>

        <Section title="Jak długo przechowujemy dane">
          <p>
            Dopóki masz konto. Po usunięciu konta (Ustawienia → Strefa niebezpieczna → Usunięcie konta) serwer od razu kasuje profil, zdjęcie, historię odpowiedzi, kopię postępu
            i historię arkuszy; automatyczne kopie zapasowe bazy wygasają najpóźniej po {LEGAL.backupRetentionDays} dniach. Wypisanie się z rankingu usuwa
            profil, zdjęcie i historię odpowiedzi.
          </p>
          <p>
            Usunięcie konta kasuje też okres Premium i historię zakupów u nas, ale nie anuluje subskrypcji w Google Play – anuluj ją w Google Play
            (Płatności i subskrypcje), żeby nie została pobrana kolejna opłata.
          </p>
        </Section>

        <Section title="Twoje prawa">
          <p>
            Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia i sprzeciwu. Większość z nich
            zrealizujesz sam w aplikacji (zmiana nicku, usunięcie zdjęcia, wypisanie z rankingu, usunięcie konta). W pozostałych sprawach napisz do
            administratora. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl).
          </p>
        </Section>

        <Section title="Moderacja">
          <p>
            Nicki z wulgaryzmami i obraźliwe są blokowane automatycznie. Administrator może zmienić nick lub usunąć zdjęcie, które narusza zasady
            (wulgarne, obraźliwe, cudze dane).
          </p>
        </Section>
      </article>

      <Link href="/ustawienia" className="self-start text-sm font-bold text-brand">
        ← Wróć do ustawień
      </Link>
    </Page>
  );
}
