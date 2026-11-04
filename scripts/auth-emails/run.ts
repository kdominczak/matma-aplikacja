// Maile logowania (Supabase Auth): podgląd i wgranie do projektu.
//
//   npm run auth:emails                     – zapisuje podgląd do supabase/templates/*.html (otwórz w przeglądarce)
//   npm run auth:emails -- --push test      – szablony (+ SMTP, jeśli ustawiony) do projektu testowego
//   npm run auth:emails -- --push prod      – to samo na produkcję (pyta o potwierdzenie)
//
// Wgrywanie przez API zarządzania Supabase zmienia TYLKO pola maili i SMTP – reszta ustawień logowania
// (Google, adresy przekierowań, hasła) zostaje. Potrzebny osobisty token: supabase.com/dashboard/account/tokens
// → SUPABASE_ACCESS_TOKEN. Dane SMTP (opcjonalnie) w .env.smtp.local – opis w docs/konto.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { LEGAL } from "../../src/data/legal";
import { authEmails, templateConfig } from "./templates";

const PROJECTS: Record<string, string> = { test: "hewatagpzhxhuoaqckih", prod: "nnpgwnxfqsjsdgtitobe" };
/** Limit maili na godzinę po podpięciu własnego SMTP (bez niego Supabase pozwala na kilka i tylko na adresy zespołu). */
const DEFAULT_EMAIL_RATE = 100;

const emails = authEmails();
const dir = resolve("supabase/templates");
mkdirSync(dir, { recursive: true });
for (const e of emails) writeFileSync(resolve(dir, `${e.kind}.html`), e.html);
console.log(`Podgląd: ${emails.length} szablony → ${dir}`);
for (const e of emails) console.log(`  ${e.kind.padEnd(13)} „${e.subject}”`);

const pushAt = process.argv.indexOf("--push");
if (pushAt === -1) process.exit(0);

const target = process.argv[pushAt + 1] ?? "";
const ref = PROJECTS[target] ?? target;
if (!/^[a-z]{20}$/.test(ref)) {
  console.error(`Nieznany projekt „${target}” – użyj: test, prod albo identyfikatora projektu.`);
  process.exit(1);
}
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("Brak SUPABASE_ACCESS_TOKEN (supabase.com/dashboard/account/tokens).");
  process.exit(1);
}

const config: Record<string, string | number> = templateConfig(emails);
const smtp = process.env.SMTP_HOST;
if (smtp) {
  const missing = ["SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`SMTP_HOST jest ustawiony, ale brakuje: ${missing.join(", ")}.`);
    process.exit(1);
  }
  Object.assign(config, {
    smtp_host: smtp,
    smtp_port: process.env.SMTP_PORT!,
    smtp_user: process.env.SMTP_USER!,
    smtp_pass: process.env.SMTP_PASS!,
    smtp_admin_email: process.env.SMTP_FROM!,
    smtp_sender_name: LEGAL.appName,
    rate_limit_email_sent: Number(process.env.SMTP_RATE_PER_HOUR) || DEFAULT_EMAIL_RATE,
  });
}

console.log(`\nProjekt ${ref}${target in PROJECTS ? ` (${target})` : ""}:`);
console.log(`  szablony: ${emails.map((e) => e.kind).join(", ")}; ważność kodu ${config.mailer_otp_exp} s`);
console.log(smtp ? `  SMTP: ${smtp}:${config.smtp_port}, nadawca „${LEGAL.appName}” <${config.smtp_admin_email}>, limit ${config.rate_limit_email_sent}/h` : "  SMTP: bez zmian (brak SMTP_HOST)");

async function push() {
  if (ref === PROJECTS.prod && !process.argv.includes("--yes")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question("Wgrać na PRODUKCJĘ? [t/N] ");
    rl.close();
    if (!/^t/i.test(answer.trim())) {
      console.log("Przerwano.");
      process.exit(0);
    }
  }

  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    console.error(`Błąd ${response.status}: ${await response.text()}`);
    process.exit(1);
  }
  console.log("Gotowe – wyślij sobie kod z aplikacji i sprawdź skrzynkę (też folder Spam).");
}

void push();
