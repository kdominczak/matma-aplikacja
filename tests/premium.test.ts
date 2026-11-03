// Premium po stronie aplikacji: wpisywanie kodów (polecenia, podarunkowych) i odczyt stanu (liczy serwer – tests/db/premium.test.ts).
import { describe, expect, it } from "vitest";
import { GIFT_CODE_PATTERN, isPremium, normalizeReferralCode, redeemCode, REFERRAL_CODE_PATTERN, type PremiumState } from "@/lib/premium";

const base: PremiumState = { status: "ready", premiumUntil: null, aiUsed: 0, aiLimit: 5, referralCode: null, referralCount: 0, gradingUsed: 0, gradingLimit: 0 };

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

describe("kod podarunkowy", () => {
  it("XXXX-XXXX-XXXX po normalizacji – 12 znaków z tego samego alfabetu co SQL (redeem_gift_code)", () => {
    expect(GIFT_CODE_PATTERN.test(normalizeReferralCode("abcd-efgh-jk23"))).toBe(true);
    expect(GIFT_CODE_PATTERN.test(normalizeReferralCode("ABCD-EFGH-JK2"))).toBe(false);
    expect(GIFT_CODE_PATTERN.test("ABCD0FGH1K23")).toBe(false);
  });

  it("zły format nie idzie do serwera", async () => {
    // 12 znaków, ale z mylącym „0” – odrzucone na urządzeniu (bez zakładania konta)
    expect(await redeemCode("ABCD-0FGH-JK23")).toEqual({ error: expect.stringContaining("Nie ma takiego kodu") });
    // ani 6, ani 12 – komunikat o obu formatach
    expect(await redeemCode("ABC")).toEqual({ error: expect.stringContaining("12") });
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
