// Webhook zakupów: do kiedy Premium wg stanu z RevenueCat i których kont dotyczy zdarzenie.
import { describe, expect, it } from "vitest";
import { affectedUsers, purchaseUntil, safeEqual, seasonEnd } from "../supabase/functions/_shared/purchase";

const U1 = "3f2b8c1e-0a4d-4e5f-9b6a-1c2d3e4f5a6b";
const U2 = "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d";

const entitlement = (e: Partial<{ expires_date: string | null; grace_period_expires_date: string | null; purchase_date: string; product_identifier: string }>) => ({
  subscriber: { entitlements: { premium: { expires_date: null, purchase_date: "2026-11-02T10:00:00Z", product_identifier: "premium_monthly", ...e } } },
});

describe("purchaseUntil", () => {
  it("subskrypcja: data końca okresu ze sklepu", () => {
    expect(purchaseUntil(entitlement({ expires_date: "2026-12-02T10:00:00Z" }))).toEqual({
      until: new Date("2026-12-02T10:00:00Z"),
      product: "premium_monthly",
    });
  });

  it("problem z płatnością: liczy się późniejszy koniec okresu karencji", () => {
    const r = purchaseUntil(entitlement({ expires_date: "2026-12-02T10:00:00Z", grace_period_expires_date: "2026-12-18T10:00:00Z" }));
    expect(r.until).toEqual(new Date("2026-12-18T10:00:00Z"));
  });

  it("pakiet jednorazowy (bez daty końca w sklepie) → do końca sezonu maturalnego", () => {
    const r = purchaseUntil(entitlement({ expires_date: null, product_identifier: "matura_pass" }));
    expect(r).toEqual({ until: new Date("2027-05-31T22:00:00Z"), product: "matura_pass" });
  });

  it("brak uprawnienia (nigdy nie kupił albo zwrot pakietu) → null", () => {
    expect(purchaseUntil({ subscriber: { entitlements: {} } })).toEqual({ until: null, product: null });
    expect(purchaseUntil({})).toEqual({ until: null, product: null });
  });
});

describe("seasonEnd", () => {
  it("od czerwca – do maja następnego roku, od stycznia do maja – tego roku (czas polski)", () => {
    expect(seasonEnd(new Date("2026-06-01T08:00:00Z"))).toEqual(new Date("2027-05-31T22:00:00Z"));
    expect(seasonEnd(new Date("2026-10-29T08:00:00Z"))).toEqual(new Date("2027-05-31T22:00:00Z"));
    expect(seasonEnd(new Date("2027-03-10T08:00:00Z"))).toEqual(new Date("2027-05-31T22:00:00Z"));
    // 31 maja 23:30 w Polsce to jeszcze ten sezon (w UTC już 21:30)
    expect(seasonEnd(new Date("2027-05-31T21:30:00Z"))).toEqual(new Date("2027-05-31T22:00:00Z"));
    // 1 czerwca 00:30 w Polsce – już następny
    expect(seasonEnd(new Date("2027-05-31T22:30:00Z"))).toEqual(new Date("2028-05-31T22:00:00Z"));
  });
});

describe("affectedUsers", () => {
  it("tylko konta Supabase (UUID), bez anonimowych id RevenueCat, bez powtórzeń", () => {
    expect(affectedUsers({ app_user_id: U1, original_app_user_id: "$RCAnonymousID:abc", aliases: [U1, "$RCAnonymousID:abc"] })).toEqual([U1]);
  });

  it("TRANSFER – obie strony", () => {
    expect(affectedUsers({ type: "TRANSFER", transferred_from: [U1], transferred_to: [U2.toUpperCase()] })).toEqual([U1, U2]);
  });

  it("zdarzenie testowe z panelu – nikogo", () => {
    expect(affectedUsers({ type: "TEST", app_user_id: "test_user" })).toEqual([]);
  });
});

it("safeEqual", () => {
  expect(safeEqual("abc", "abc")).toBe(true);
  expect(safeEqual("abc", "abd")).toBe(false);
  expect(safeEqual("abc", "abcd")).toBe(false);
});
