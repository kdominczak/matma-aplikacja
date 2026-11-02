import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ContactEmail, LegalSection as Section, Missing } from "@/components/legal/LegalParts";
import { LEGAL } from "@/data/legal";

export const metadata = {
  title: `Usuwanie konta i danych – ${LEGAL.appName}`,
  description: `Jak usunąć konto i dane w aplikacji ${LEGAL.appName}: w aplikacji albo przez e-mail, bez instalowania aplikacji.`,
};

// Strona wymagana przez Google Play (Data deletion): publiczny adres z instrukcją usunięcia konta,
// także bez dostępu do aplikacji, oraz informacją, jakie dane są usuwane i jak długo coś zostaje.

const MAIL_SUBJECT = `Usunięcie konta – ${LEGAL.appName}`;

export default function DeleteAccountPage() {
  return (
    <Page width="reading">
      <PageHeader
        title="Usuwanie konta i danych"
        subtitle={`Aplikacja ${LEGAL.appName} · ${LEGAL.controller || "administrator"}. Konto usuniesz sam w aplikacji albo poprosisz o to mailem.`}
      />

      <article className="card flex flex-col gap-7 p-6">
        <Section title="Sposób 1: w aplikacji (od razu)">
          <ol>
            <li>
              Otwórz aplikację {LEGAL.appName} i przejdź do <strong className="text-ink">Ustawienia</strong> (ikona zębatki u góry ekranu albo „Ustawienia” w menu).
            </li>
            <li>
              Przewiń na dół i rozwiń <strong className="text-ink">Strefę niebezpieczną</strong>, a potem wybierz{" "}
              <strong className="text-ink">Usuń konto i dane…</strong>
            </li>
            <li>
              Wpisz słowo <strong className="text-ink">USUŃ</strong> i potwierdź.
            </li>
          </ol>
          <p>Konto i dane na serwerze znikają natychmiast, a aplikacja na telefonie wraca do stanu jak po instalacji.</p>
        </Section>

        <Section title="Sposób 2: e-mailem (bez instalowania aplikacji)">
          <p>
            Napisz na <ContactEmail email={LEGAL.contactEmail} subject={MAIL_SUBJECT} /> z tematem „{MAIL_SUBJECT}” i podaj:
          </p>
          <ul>
            <li>
              <strong className="text-ink">ID konta</strong> – znajdziesz je w aplikacji w Ustawieniach → Strefa niebezpieczna → Usunięcie konta (przycisk „Kopiuj”),
            </li>
            <li>
              albo <strong className="text-ink">adres e-mail konta</strong> – e-mail, którym logujesz się hasłem, kodem albo przez Google (napisz wtedy z
              tego adresu),
            </li>
            <li>
              przy starszym koncie bez e-maila (z dawnego rankingu) – <strong className="text-ink">ID konta i nick</strong>.
            </li>
          </ul>
          <p>
            Usuniemy konto w ciągu {LEGAL.requestDays} dni i potwierdzimy to mailem. Starsze konta bez e-maila rozpoznajemy po ID i nicku –
            bez nich nie da się bezpiecznie wskazać, które konto jest Twoje.
          </p>
        </Section>

        <Section title="Co zostanie usunięte">
          <ul>
            <li>konto (e-mail, Google albo starsze konto bez e-maila),</li>
            <li>kopia postępu w chmurze (statystyki, Pudełko porażek, rozwiązane zadania) i historia arkuszy,</li>
            <li>Premium, kody poleceń i historia zakupów zapisane u nas,</li>
            <li>dane z dawnego rankingu, jeśli konto w nim było (nick, zdjęcie, historia odpowiedzi).</li>
          </ul>
          <p>
            Nie zatrzymujemy żadnych danych po usunięciu konta. Jedynie automatyczne kopie zapasowe bazy u dostawcy (Supabase, {LEGAL.serverRegion || <Missing what="region" />}
            ) mogą zawierać dane jeszcze przez najwyżej {LEGAL.backupRetentionDays} dni – potem wygasają same.
          </p>
        </Section>

        <Section title="Usunięcie części danych (bez usuwania konta)">
          <ul>
            <li>
              <strong className="text-ink">Zdjęcie profilowe:</strong> Profil → „Usuń zdjęcie”.
            </li>
            <li>
              <strong className="text-ink">Postęp nauki:</strong> Ustawienia → Strefa niebezpieczna → „Resetuj postępy…” – kasuje postęp na telefonie i na koncie.
            </li>
          </ul>
        </Section>

        <p className="text-sm text-muted">
          Więcej o tym, jakie dane przetwarzamy i dlaczego:{" "}
          <Link href="/prywatnosc" className="font-bold text-brand underline">
            polityka prywatności
          </Link>
          .
        </p>
      </article>
    </Page>
  );
}
