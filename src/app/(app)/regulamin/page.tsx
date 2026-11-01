import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { ContactEmail, LegalSection as Section, Missing } from "@/components/legal/LegalParts";
import { CKE_DISCLAIMER, LEGAL, PURCHASE_CONSENT_TEXT } from "@/data/legal";
import { AI_FREE_DAILY_LIMIT, AI_PREMIUM_DAILY_LIMIT, GRADING_DAILY_LIMIT, REFERRAL_DAYS } from "@/lib/limits";
import { formatDay } from "@/lib/stats";

export const metadata = { title: `Regulamin – ${LEGAL.appName}` };

// Regulamin świadczenia usług drogą elektroniczną (art. 8 u.ś.u.d.e.) i sprzedaży Premium (ustawa o prawach konsumenta).
// Projekt do przejrzenia przez prawnika przed publikacją w sklepie. Limity i tekst zgody pochodzą z tych samych stałych,
// których używa aplikacja (src/lib/limits.ts, src/data/legal.ts) – nie przepisuj liczb ręcznie.
// Zmiana treści = nowa data `LEGAL.termsUpdatedAt` i informacja w aplikacji co najmniej 14 dni wcześniej (§ 13).

export default function TermsPage() {
  const app = LEGAL.appName;
  return (
    <Page width="reading">
      <PageHeader title="Regulamin" subtitle={`Regulamin aplikacji ${app}. Obowiązuje od ${formatDay(LEGAL.termsUpdatedAt)}.`} />

      <article className="card flex flex-col gap-7 p-6">
        <Section title="W skrócie">
          <ul>
            <li>{app} to aplikacja do samodzielnej nauki matematyki przed maturą. Lekcje, zadania i arkusze są za darmo.</li>
            <li>
              Premium (płatne przez Google Play) podnosi limit korepetytora AI i odblokowuje ocenę rozwiązań ze zdjęcia. Subskrypcję anulujesz w Google
              Play w każdej chwili.
            </li>
            <li>Premium zaczyna działać od razu po zakupie – dlatego, za Twoją zgodą, nie przysługuje prawo odstąpienia od umowy (§ 8).</li>
            <li>AI może się pomylić, a szacowany wynik to prognoza, nie obietnica. {CKE_DISCLAIMER}</li>
          </ul>
        </Section>

        <Section title="§ 1. Postanowienia ogólne">
          <ol>
            <li>
              Regulamin określa zasady korzystania z aplikacji {app} (aplikacja na Androida i wersja w przeglądarce, dalej: Aplikacja) oraz zasady
              zakupu Premium. Jest regulaminem świadczenia usług drogą elektroniczną.
            </li>
            <li>
              Usługodawcą jest: {LEGAL.controller || <Missing what="imiona i nazwiska lub firma" />}, adres do korespondencji:{" "}
              {LEGAL.address || <Missing what="adres do korespondencji" />}, e-mail: <ContactEmail email={LEGAL.contactEmail} />.
            </li>
            <li>
              Regulamin jest dostępny bezpłatnie w Aplikacji (Ustawienia → Regulamin i na ekranie Premium) w formie, którą można zapisać i wydrukować.
            </li>
            <li>Korzystając z Aplikacji, akceptujesz Regulamin. Jeśli się z nim nie zgadzasz, nie korzystaj z Aplikacji.</li>
          </ol>
        </Section>

        <Section title="§ 2. Pojęcia">
          <ul>
            <li>
              <strong className="text-ink">Użytkownik</strong> – osoba korzystająca z Aplikacji.
            </li>
            <li>
              <strong className="text-ink">Konto</strong> – konto anonimowe (bez e-maila, zakładane przy dołączeniu do rankingu lub pierwszej wiadomości do
              AI) albo konto z e-mailem (logowanie kodem wysyłanym na e-mail).
            </li>
            <li>
              <strong className="text-ink">Korepetytor AI</strong> – funkcje, w których odpowiedzi tworzy zewnętrzny model sztucznej inteligencji:
              korepetytor, wyjaśnienia błędów, podpowiedzi i ocena rozwiązań ze zdjęcia.
            </li>
            <li>
              <strong className="text-ink">Premium</strong> – płatny dostęp do rozszerzonych funkcji Korepetytora AI na czas określony w § 7.
            </li>
          </ul>
        </Section>

        <Section title="§ 3. Charakter Aplikacji">
          <ol>
            <li>
              Aplikacja służy do samodzielnej nauki matematyki na poziomie podstawowym, w tym do przygotowania do egzaminu maturalnego. Nie zastępuje
              szkoły ani nauczyciela i nie gwarantuje określonego wyniku egzaminu.
            </li>
            <li>
              Szacowany wynik, plan nauki i ocena rozwiązania przez AI mają charakter orientacyjny. Ocena AI nie jest oceną egzaminatora i może zawierać
              błędy – porównuj ją ze schematem oceniania pokazanym w Aplikacji.
            </li>
            <li>
              {CKE_DISCLAIMER} Zadania pochodzące z arkuszy Centralnej Komisji Egzaminacyjnej są oznaczone źródłem (sesja i rok egzaminu); pozostałe
              zadania, lekcje i wyjaśnienia są autorskie.
            </li>
          </ol>
        </Section>

        <Section title="§ 4. Wymagania techniczne">
          <ol>
            <li>Do korzystania z Aplikacji potrzebny jest telefon z Androidem 7.0 lub nowszym albo aktualna przeglądarka internetowa.</li>
            <li>
              Lekcje i zadania działają bez internetu. Połączenie jest potrzebne do Korepetytora AI, rankingu, konta, kopii postępu i zakupu Premium.
            </li>
            <li>Ocena rozwiązania ze zdjęcia wymaga dostępu do aparatu albo galerii – zgodę dajesz w ustawieniach telefonu.</li>
          </ol>
        </Section>

        <Section title="§ 5. Konto i zasady korzystania">
          <ol>
            <li>Z lekcji, zadań i arkuszy możesz korzystać bez konta. Konto jest potrzebne do rankingu, Korepetytora AI, kopii postępu i Premium.</li>
            <li>
              Nie wolno: używać nicku lub zdjęcia wulgarnego, obraźliwego albo z cudzymi danymi; używać skryptów i innych automatów, obchodzić limitów ani
              zawyżać wyników w rankingu; udostępniać Premium innym osobom; próbować uzyskać dostęp do cudzych danych; przesyłać do Korepetytora AI
              treści bezprawnych ani danych osobowych innych osób.
            </li>
            <li>
              Przy naruszeniu tych zasad możemy zmienić nick, usunąć zdjęcie, wypisać z rankingu, a przy poważnym lub powtarzającym się naruszeniu –
              zablokować Konto (§ 12). O decyzji i jej powodzie informujemy, a od decyzji możesz się odwołać mailowo.
            </li>
          </ol>
        </Section>

        <Section title="§ 6. Korepetytor AI i limity">
          <ol>
            <li>
              Bez Premium możesz wysłać {AI_FREE_DAILY_LIMIT} wiadomości do Korepetytora AI dziennie. Z Premium – do {AI_PREMIUM_DAILY_LIMIT} wiadomości
              dziennie (pułap techniczny chroniący usługę przed nadużyciami) oraz do {GRADING_DAILY_LIMIT} ocen rozwiązań ze zdjęcia dziennie (osobno
              liczymy przepisanie zdjęcia na tekst).
            </li>
            <li>Limity odnawiają się o północy czasu polskiego. Wiadomość, na którą AI nie odpowiedziało z powodu błędu po naszej stronie, nie zużywa limitu.</li>
            <li>
              Odpowiedzi tworzy zewnętrzny model AI (dostawca: Groq, opis w{" "}
              <Link href="/prywatnosc" className="font-bold text-brand underline">
                polityce prywatności
              </Link>
              ). Mogą zawierać błędy – sprawdzaj wyniki, zwłaszcza przed egzaminem.
            </li>
          </ol>
        </Section>

        <Section title="§ 7. Premium – pakiety i płatność">
          <ol>
            <li>
              Dostępne są: <strong className="text-ink">Pakiet maturalny</strong> – płatny jednorazowo, ważny do 31 maja (zakup od czerwca do grudnia – do
              31 maja następnego roku, zakup od stycznia do maja – do 31 maja tego roku; dokładna data jest podana przed zakupem) oraz{" "}
              <strong className="text-ink">Premium miesięcznie</strong> – subskrypcja odnawiana automatycznie co miesiąc, dopóki jej nie anulujesz.
            </li>
            <li>
              Ceny (z podatkiem VAT) są podane w Aplikacji przed zakupem. Płatność przyjmuje Google Play – stosuje się do niej także regulamin Google Play.
              Nie otrzymujemy danych Twojej karty.
            </li>
            <li>
              Zakup wymaga Konta z e-mailem. Premium jest przypisane do Konta i działa po zalogowaniu na innym urządzeniu; zakup przywrócisz przyciskiem
              „Przywróć zakupy”.
            </li>
            <li>Przed zakupem zaznaczasz zgodę: „{PURCHASE_CONSENT_TEXT}” oraz akceptujesz Regulamin.</li>
            <li>
              Subskrypcję anulujesz w Google Play (Płatności i subskrypcje) w każdej chwili – Premium działa do końca opłaconego okresu. Usunięcie Konta
              lub Aplikacji nie anuluje subskrypcji w Google Play.
            </li>
            <li>
              Kody poleceń: osoba polecona (Konto młodsze niż 7 dni, raz) i polecająca otrzymują po {REFERRAL_DAYS} dni Premium; polecający – najwyżej 5
              razy w sezonie maturalnym. Dni z poleceń sumują się z zakupionym Premium.
            </li>
            <li>
              Kody podarunkowe i z przedsprzedaży dają liczbę dni Premium podaną przy kodzie, jeśli kod jest wpisany przed datą jego ważności. Dany kod
              można wpisać na Koncie jeden raz; kod przeznaczony dla wielu osób działa do wyczerpania liczby użyć. Kod nie podlega wymianie na
              pieniądze. Dni z kodów sumują się z pozostałym Premium.
            </li>
          </ol>
        </Section>

        <Section title="§ 8. Prawo odstąpienia od umowy">
          <ol>
            <li>
              Konsument, a także osoba fizyczna zawierająca umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy umowa nie ma dla niej
              charakteru zawodowego, może odstąpić od umowy zawartej na odległość w ciągu 14 dni bez podania przyczyny.
            </li>
            <li>
              Prawo odstąpienia nie przysługuje, jeśli dostarczanie treści cyfrowych rozpoczęło się za Twoją wyraźną i uprzednią zgodą, po
              poinformowaniu Cię o utracie tego prawa (art. 38 ust. 1 pkt 13 ustawy o prawach konsumenta). Zgodę wyrażasz, zaznaczając pole przed
              zakupem (§ 7 ust. 4). Bez tej zgody zakup nie jest możliwy.
            </li>
            <li>
              Potwierdzenie zakupu wysyła Google Play na adres e-mail Twojego konta Google. Na prośbę przesłaną na{" "}
              <ContactEmail email={LEGAL.contactEmail} subject={`${app} – potwierdzenie zakupu`} /> prześlemy także potwierdzenie treści zgody.
            </li>
            <li>
              Jeśli prawo odstąpienia Ci przysługuje, wystarczy wysłać na ten adres oświadczenie, np.: „Odstępuję od umowy zakupu Premium w aplikacji{" "}
              {app} zawartej dnia … (e-mail Konta: …)”. Pieniądze zwrócimy w ciągu 14 dni tą samą drogą, którą przyszła płatność (przez Google Play).
            </li>
            <li>Niezależnie od tego Google Play może zwrócić płatność według własnych zasad zwrotów.</li>
          </ol>
        </Section>

        <Section title="§ 9. Reklamacje">
          <ol>
            <li>
              Jeśli Aplikacja lub Premium nie działa zgodnie z umową, napisz na{" "}
              <ContactEmail email={LEGAL.contactEmail} subject={`${app} – reklamacja`} />: e-mail Konta, opis problemu i czego oczekujesz.
            </li>
            <li>
              Odpowiemy w ciągu {LEGAL.complaintDays} dni. Konsumentowi przysługują uprawnienia z ustawy o prawach konsumenta (rozdział 5b): doprowadzenie
              usługi do zgodności z umową, obniżenie ceny albo odstąpienie od umowy.
            </li>
            <li>Sprawy samej płatności (np. podwójne obciążenie) rozpatruje Google Play.</li>
          </ol>
        </Section>

        <Section title="§ 10. Prawa autorskie">
          <ol>
            <li>
              Aplikacja, jej kod, lekcje, wyjaśnienia, zadania autorskie, ilustracje i układ treści są chronione prawem autorskim i należą do
              Usługodawcy. Otrzymujesz niewyłączną, nieprzenoszalną licencję na korzystanie z nich do własnej nauki, na czas korzystania z Aplikacji.
            </li>
            <li>
              Bez naszej zgody nie wolno kopiować, publikować, sprzedawać ani udostępniać treści Aplikacji, pobierać ich automatycznie ani tworzyć na
              ich podstawie zbiorów zadań lub innych aplikacji – poza dozwolonym użytkiem przewidzianym w ustawie.
            </li>
            <li>Zadania z arkuszy CKE nie są objęte licencją Usługodawcy – podajemy ich źródło.</li>
            <li>
              Twoje pytania, zdjęcia i rozwiązania pozostają Twoje. Korzystamy z nich wyłącznie w zakresie potrzebnym do udzielenia odpowiedzi (przekazanie
              do modelu AI) i ich nie zapisujemy.
            </li>
          </ol>
        </Section>

        <Section title="§ 11. Odpowiedzialność">
          <ol>
            <li>Dbamy o poprawność treści. Jeśli zauważysz błąd w zadaniu lub kluczu, napisz do nas – poprawimy go.</li>
            <li>
              Mogą zdarzyć się przerwy w działaniu funkcji online (np. prace techniczne, awaria dostawcy). Przy dłuższej przerwie w działaniu Premium
              z naszej winy przedłużymy Premium o czas przerwy.
            </li>
            <li>Postanowienia Regulaminu nie ograniczają uprawnień, które konsumentowi przysługują z mocy prawa.</li>
          </ol>
        </Section>

        <Section title="§ 12. Usunięcie Konta i rozwiązanie umowy">
          <ol>
            <li>
              Możesz w każdej chwili usunąć Konto (Ustawienia → Strefa niebezpieczna albo{" "}
              <Link href="/usun-konto" className="font-bold text-brand underline">
                mailowo
              </Link>
              ) lub odinstalować Aplikację. Usunięcie Konta kasuje też okres Premium – anuluj wcześniej subskrypcję w Google Play.
            </li>
            <li>
              Możemy rozwiązać umowę (zablokować Konto) przy poważnym lub powtarzającym się naruszeniu § 5 – z 14-dniowym wypowiedzeniem, a natychmiast
              tylko przy rażącym naruszeniu (np. atak na usługę, treści bezprawne). Gdy rozwiązujemy umowę bez Twojej winy, zwrócimy proporcjonalną
              część opłaty za niewykorzystany okres Premium.
            </li>
          </ol>
        </Section>

        <Section title="§ 13. Zmiany Regulaminu">
          <ol>
            <li>
              Regulamin możemy zmienić z ważnych powodów: zmiany przepisów, nowych funkcji, bezpieczeństwa, zmiany dostawców, limitów albo cen.
            </li>
            <li>
              O zmianie informujemy w Aplikacji co najmniej 14 dni wcześniej. Jeśli się nie zgadzasz, możesz usunąć Konto i anulować subskrypcję. Zmiany nie
              pogarszają warunków Premium już opłaconego.
            </li>
          </ol>
        </Section>

        <Section title="§ 14. Postanowienia końcowe">
          <ol>
            <li>Regulamin podlega prawu polskiemu. Konsument zachowuje ochronę, którą dają mu przepisy kraju jego zamieszkania.</li>
            <li>
              Konsument może skorzystać z pozasądowych sposobów rozwiązywania sporów, np. pomocy miejskiego lub powiatowego rzecznika konsumentów albo
              wojewódzkiego inspektoratu Inspekcji Handlowej.
            </li>
            <li>Regulamin obowiązuje od {formatDay(LEGAL.termsUpdatedAt)}.</li>
          </ol>
        </Section>
      </article>

      <p className="flex gap-4 text-sm font-bold">
        <Link href="/prywatnosc" className="text-brand">
          Polityka prywatności
        </Link>
        <Link href="/ustawienia" className="text-brand">
          ← Wróć do ustawień
        </Link>
      </p>
    </Page>
  );
}
