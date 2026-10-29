// Zakupy po stronie aplikacji: pakiety z oferty RevenueCat, komunikaty błędów sklepu, data ważności pakietu.
import { describe, expect, it } from "vitest";
import type { PurchasesOffering, PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { formatSeasonEnd, offersFrom, purchaseErrorMessage, purchasesSupported } from "@/lib/purchases";

const pkg = (packageType: string, priceString: string) => ({ packageType, product: { priceString } }) as unknown as PurchasesPackage;
const offering = (o: Partial<{ lifetime: PurchasesPackage | null; monthly: PurchasesPackage | null; availablePackages: PurchasesPackage[] }>) =>
  ({ lifetime: null, monthly: null, availablePackages: [], ...o }) as unknown as PurchasesOffering;

describe("offersFrom", () => {
  it("pakiet (LIFETIME) i subskrypcja (MONTHLY) z cenami ze sklepu, pakiet pierwszy", () => {
    const pass = pkg("LIFETIME", "149,00 zł");
    const monthly = pkg("MONTHLY", "29,99 zł");
    expect(offersFrom(offering({ monthly, lifetime: pass }))).toEqual([
      { plan: "pass", price: "149,00 zł", pkg: pass },
      { plan: "monthly", price: "29,99 zł", pkg: monthly },
    ]);
  });

  it("pakiety bez skrótów lifetime/monthly – po typie z listy", () => {
    const pass = pkg("LIFETIME", "149 zł");
    expect(offersFrom(offering({ availablePackages: [pkg("ANNUAL", "199 zł"), pass] }))).toEqual([{ plan: "pass", price: "149 zł", pkg: pass }]);
  });

  it("brak oferty → brak planów (UI pokazuje ceny informacyjne)", () => {
    expect(offersFrom(null)).toEqual([]);
  });
});

describe("purchaseErrorMessage", () => {
  it("anulowanie przez ucznia to nie błąd", () => {
    expect(purchaseErrorMessage("1")).toBeNull();
  });

  it("płatność oczekująca, kontrola rodzicielska, zakup na innym koncie – konkretne komunikaty", () => {
    expect(purchaseErrorMessage("20")).toMatch(/czeka na potwierdzenie/);
    expect(purchaseErrorMessage("3")).toMatch(/kontrolę rodzicielską/);
    expect(purchaseErrorMessage("7")).toMatch(/innego konta/);
    expect(purchaseErrorMessage("999")).toMatch(/nie zostały pobrane/);
  });
});

it("pakiet kupiony jesienią jest ważny do 31 maja następnego roku", () => {
  expect(formatSeasonEnd(new Date("2026-10-29T12:00:00Z"))).toBe("31 maja 2027");
  expect(formatSeasonEnd(new Date("2027-02-01T12:00:00Z"))).toBe("31 maja 2027");
});

it("w przeglądarce (testy) zakup jest niedostępny – ekran pokazuje ceny informacyjnie", () => {
  expect(purchasesSupported()).toBe(false);
});
