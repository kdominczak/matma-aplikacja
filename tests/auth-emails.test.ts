// Maile logowania: każdy niesie 6-cyfrowy kod (aplikacja nie obsługuje linków), podgląd w repo zgadza się z generatorem.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { authEmails, templateConfig } from "../scripts/auth-emails/templates";

const emails = authEmails();

describe("maile logowania", () => {
  it("są wszystkie trzy, których używa aplikacja (nowe konto, logowanie kodem, dopięcie e-maila)", () => {
    expect(emails.map((e) => e.kind).sort()).toEqual(["confirmation", "email_change", "magic_link"]);
  });

  it.each(emails)("$kind: kod w treści i w temacie, bez linku", (e) => {
    expect(e.html).toContain("{{ .Token }}");
    expect(e.subject).toContain("{{ .Token }}");
    expect(e.html).not.toContain("ConfirmationURL");
    expect(e.html).not.toContain("TokenHash");
  });

  it("zmiana e-maila nie pokazuje pustego adresu konta anonimowego", () => {
    const change = emails.find((e) => e.kind === "email_change")!;
    expect(change.html).not.toContain("{{ .Email }}");
    expect(change.html).toContain("{{ .NewEmail }}");
  });

  it("tylko znane zmienne szablonu Supabase", () => {
    for (const e of emails) {
      const vars = [...`${e.subject}${e.html}`.matchAll(/\{\{\s*([^}]*?)\s*\}\}/g)].map((m) => m[1]);
      expect(vars.every((v) => [".Token", ".Email", ".NewEmail"].includes(v))).toBe(true);
    }
  });

  it("konfiguracja do API zawiera temat i treść każdego maila", () => {
    const config = templateConfig(emails);
    for (const e of emails) {
      expect(config[`mailer_subjects_${e.kind}`]).toBe(e.subject);
      expect(config[`mailer_templates_${e.kind}_content`]).toBe(e.html);
    }
  });

  it.each(emails)("podgląd supabase/templates/$kind.html jest aktualny (npm run auth:emails)", (e) => {
    const file = readFileSync(resolve("supabase/templates", `${e.kind}.html`), "utf8").replace(/\r\n/g, "\n");
    expect(file).toBe(e.html);
  });
});
