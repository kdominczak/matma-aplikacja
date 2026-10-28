import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ALLOWED_FRAGMENTS, BLOCKED_ROOTS, isNickAllowed, normalizeNick } from "@/lib/moderation";

describe("filtr nicków", () => {
  it.each(["kurwa", "K.U.R.W.A", "kuuurwa", "Ch_u_j", "kurw4", "hvj_chuj", "Fuck_you", "d1ck", "Admin", "Pierdolec", "Zjeb123"])("blokuje %s", (nick) => {
    expect(isNickAllowed(nick)).toBe(false);
  });

  it.each(["Euklides", "Kasia_2007", "Knight", "nightwolf", "Analityk", "Principal", "Szmaragd", "Dupleks", "Nazim", "Zośka", "Pitagoras"])(
    "przepuszcza %s",
    (nick) => {
      expect(isNickAllowed(nick)).toBe(true);
    },
  );

  it("normalizuje polskie znaki, cyfry, separatory i powtórzenia", () => {
    expect(normalizeNick("Żółć_1337")).toBe("zolciet");
    expect(normalizeNick("k..uuu-rrw4")).toBe("kurwa");
  });

  it("lista w bazie jest identyczna z listą w aplikacji", () => {
    const file = readdirSync("supabase/migrations").find((f) => f.includes("moderation"))!;
    const sql = readFileSync(`supabase/migrations/${file}`, "utf8");
    const array = sql.match(/unnest\(array\[([\s\S]*?)\]\)/)![1];
    const roots = [...array.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
    expect(roots).toEqual([...BLOCKED_ROOTS]);
    expect(sql).toContain(`'${ALLOWED_FRAGMENTS.join("|")}'`);
  });
});
