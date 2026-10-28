// Filtr nicków w rankingu (wulgaryzmy, obelgi, podszywanie się pod administrację).
// Ta sama lista i normalizacja są w bazie (supabase/migrations/…_moderation_account_deletion.sql) –
// serwer odrzuca nick niezależnie od aplikacji, a test (tests/moderation.test.ts) pilnuje, by listy były zgodne.
//
// Normalizacja łapie typowe obejścia: wielkie litery, polskie znaki, cyfry zamiast liter (k0rwa, d1ck),
// separatory (k.u.r.w.a) i powtórzenia (kuuurwa). Rdzenie są dobrane tak, by nie blokować zwykłych słów
// (np. „analiza”, „dupleks”, „szmaragd”, „Knight”), a nieliczne kolizje („principal”) obsługują wyjątki.

export const BLOCKED_ROOTS = [
  // polskie wulgaryzmy i obelgi
  "kurw",
  "kurew",
  "chuj",
  "huj",
  "pierd",
  "jeb",
  "pizd",
  "cipa",
  "cipk",
  "cipo",
  "kutas",
  "fiut",
  "dupa",
  "dupek",
  "dupc",
  "dziwk",
  "szmat",
  "ruchac",
  "rucham",
  "ruchan",
  "cwel",
  "ciota",
  "pedal",
  "pedzio",
  "debil",
  "kretyn",
  "seks",
  "porn",
  "gwalt",
  // angielskie
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "dick",
  "penis",
  "pusy",
  "niga",
  "niger",
  "whore",
  "slut",
  // nienawiść
  "hitler",
  // podszywanie się pod obsługę aplikacji
  "admin",
  "moderator",
] as const;

/** Fragmenty zwykłych słów zawierające rdzeń z listy (prin-cipa-l, muni-cipa-l, parti-cipa-te) – usuwane przed sprawdzeniem. */
export const ALLOWED_FRAGMENTS = ["ncipa", "icipa"] as const;

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t" };
const PL: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };

/** Postać do porównań: małe litery bez ogonków, cyfry jak litery, bez separatorów i powtórzeń liter. */
export function normalizeNick(nick: string): string {
  return nick
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => PL[c])
    .replace(/[013457]/g, (c) => LEET[c])
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

export function isNickAllowed(nick: string): boolean {
  let normalized = normalizeNick(nick);
  for (const fragment of ALLOWED_FRAGMENTS) normalized = normalized.replaceAll(fragment, "");
  return !BLOCKED_ROOTS.some((root) => normalized.includes(root));
}
