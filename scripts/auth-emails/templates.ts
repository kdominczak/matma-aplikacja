// Maile logowania z Supabase Auth: treść i wygląd w jednym miejscu (zamiast ręcznego wklejania w panelu).
// Aplikacja nie używa linków w mailach – tylko 6-cyfrowego kodu ({{ .Token }}), który uczeń przepisuje w aplikacji
// (link otworzyłby przeglądarkę zamiast aplikacji). Nazwa aplikacji z LEGAL.appName – zmiana nazwy = jedno miejsce.
//
// Szablony Supabase (Go templates): {{ .Token }} – kod, {{ .Email }} – adres, {{ .NewEmail }} – nowy adres przy zmianie.
// HTML maili: tabele i style inline (Gmail i Outlook wycinają <style> i nie znają flexboxa), bez obrazków
// (bez własnej domeny nie ma ich skąd bezpiecznie podać; część skrzynek i tak je blokuje).

import { LEGAL } from "../../src/data/legal";

export type AuthEmailKind = "confirmation" | "magic_link" | "email_change";

export type AuthEmail = { kind: AuthEmailKind; subject: string; html: string };

/** Ważność kodu – ustawiana razem z szablonami (mailer_otp_exp), żeby tekst maila mówił prawdę. */
export const OTP_EXPIRY_SECONDS = 3600;

const C = {
  page: "#eeece6",
  card: "#ffffff",
  ink: "#111827",
  muted: "#4b5563",
  line: "#e5e1d8",
  navy: "#111827",
  gold: "#d4af37",
  goldText: "#7a5c0e",
  codeBg: "#faf6ea",
};

const FONT = "Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Wspólny układ: grafitowy nagłówek ze złotą nazwą, biała karta z kodem, stopka. */
function layout({ preheader, title, intro, after, to = "{{ .Email }}" }: { preheader: string; title: string; intro: string; after: string; to?: string }) {
  const app = escape(LEGAL.appName);
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
<tr><td style="background:${C.navy};border-radius:20px 20px 0 0;padding:22px 28px;font-family:${FONT};">
<span style="font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#ffffff;">${app}</span><span style="font-size:22px;font-weight:700;color:${C.gold};">.</span>
<div style="margin-top:2px;font-size:13px;color:#9ca3af;">Matura z matematyki</div>
</td></tr>
<tr><td style="background:${C.card};border-radius:0 0 20px 20px;padding:28px;font-family:${FONT};color:${C.ink};">
<h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;font-weight:700;color:${C.ink};">${escape(title)}</h1>
<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${C.muted};">${intro}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="background:${C.codeBg};border:1px solid ${C.gold};border-radius:14px;padding:18px 12px;">
<div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.goldText};">Twój kod</div>
<div style="margin-top:6px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:${C.ink};">{{ .Token }}</div>
</td></tr>
</table>
<p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:${C.muted};">${after}</p>
<p style="margin:18px 0 0;padding-top:18px;border-top:1px solid ${C.line};font-size:13px;line-height:1.6;color:${C.muted};">Kod jest ważny przez ${OTP_EXPIRY_SECONDS / 60} minut. Nikomu go nie podawaj – ${app} nigdy nie prosi o kod mailem ani telefonicznie.</p>
</td></tr>
<tr><td align="center" style="padding:18px 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted};">
Wiadomość wysłana automatycznie na adres ${to}.<br>Kontakt: <a href="mailto:${LEGAL.contactEmail}" style="color:${C.goldText};">${LEGAL.contactEmail}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}

const IGNORE = "Jeśli to nie Ty, zignoruj tę wiadomość – bez kodu nikt nie zaloguje się na Twoje konto.";

export function authEmails(): AuthEmail[] {
  const app = escape(LEGAL.appName);
  return [
    {
      // nowe konto (logowanie kodem na adres, który jeszcze nie ma konta)
      kind: "confirmation",
      subject: `{{ .Token }} – kod do założenia konta w aplikacji ${LEGAL.appName}`,
      html: layout({
        preheader: `Twój kod: {{ .Token }}. Wpisz go w aplikacji ${app}.`,
        title: "Potwierdź swój e-mail",
        intro: `Cześć! Wpisz ten kod w aplikacji ${app}, żeby założyć konto. Potem ustawisz hasło.`,
        after: IGNORE,
      }),
    },
    {
      // logowanie kodem i „Nie pamiętam hasła” (kod → nowe hasło w aplikacji)
      kind: "magic_link",
      subject: `{{ .Token }} – kod do logowania w aplikacji ${LEGAL.appName}`,
      html: layout({
        preheader: `Twój kod: {{ .Token }}. Wpisz go w aplikacji ${app}.`,
        title: "Zaloguj się kodem",
        intro: `Wpisz ten kod w aplikacji ${app}, żeby się zalogować. Jeśli nie pamiętasz hasła – po zalogowaniu ustawisz nowe.`,
        after: IGNORE,
      }),
    },
    {
      // dopięcie e-maila do starego konta bez adresu (postęp zostaje na tym samym koncie)
      kind: "email_change",
      subject: `{{ .Token }} – potwierdź e-mail w aplikacji ${LEGAL.appName}`,
      html: layout({
        preheader: `Twój kod: {{ .Token }}. Potwierdź adres {{ .NewEmail }}.`,
        title: "Potwierdź nowy adres e-mail",
        intro: `Wpisz ten kod w aplikacji ${app}, żeby przypisać adres <strong style="color:${C.ink};">{{ .NewEmail }}</strong> do swojego konta. Twój postęp zostaje.`,
        after: IGNORE,
        // konto anonimowe nie ma jeszcze adresu – {{ .Email }} byłby pusty
        to: "{{ .NewEmail }}",
      }),
    },
  ];
}

/** Pola konfiguracji Auth w API zarządzania Supabase (PATCH /v1/projects/{ref}/config/auth) – tylko maile. */
export function templateConfig(emails: AuthEmail[] = authEmails()): Record<string, string | number> {
  const config: Record<string, string | number> = { mailer_otp_exp: OTP_EXPIRY_SECONDS };
  for (const e of emails) {
    config[`mailer_subjects_${e.kind}`] = e.subject;
    config[`mailer_templates_${e.kind}_content`] = e.html;
  }
  return config;
}
