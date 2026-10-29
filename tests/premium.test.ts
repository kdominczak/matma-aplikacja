// Premium po stronie aplikacji: wpisywanie kodu polecenia i odczyt stanu (liczy serwer – tests/db/premium.test.ts).
import { describe, expect, it } from "vitest";
import { isPremium, normalizeReferralCode, REFERRAL_CODE_PATTERN, type PremiumState } from "@/lib/premium";

const base: PremiumState = { status: "ready", premiumUntil: null, aiUsed: 0, aiLimit: 5, referralCode: null, referralCount: 0 };

describe("kod polecenia", () => {
  it("wielkość liter, spacje i myślniki nie mają znaczenia", () => {
    expect(normalizeReferralCode(" k7m-p2q ")).toBe("K7MP2Q");
  });

  it("format jak na serwerze: 6 znaków bez mylących 0/O i 1/I", () => {
    expect(REFERRAL_CODE_PATTERN.test("K7MP2Q")).toBe(true);
    expect(REFERRAL_CODE_PATTERN.test("K7MP2")).toBe(false);
    expect(REFERRAL_CODE_PATTERN.test("O0I1LL")).toBe(false);
  });
});

describe("isPremium", () => {
  it("aktywne tylko do daty z serwera", () => {
    const now = Date.parse("2026-11-02T12:00:00Z");
    expect(isPremium(base, now)).toBe(false);
    expect(isPremium({ ...base, premiumUntil: new Date("2026-11-04T12:00:00Z") }, now)).toBe(true);
    expect(isPremium({ ...base, premiumUntil: new Date("2026-11-01T12:00:00Z") }, now)).toBe(false);
  });
});
