// Zasady hasła konta (src/lib/account.ts) – te same, które pokazuje formularz.
import { describe, expect, it } from "vitest";
import { MIN_PASSWORD, passwordProblem } from "@/lib/account";

describe("hasło konta", () => {
  it("przyjmuje hasło z literami i cyframi o długości co najmniej MIN_PASSWORD", () => {
    expect(passwordProblem("matura2027")).toBeNull();
    expect(passwordProblem("Zażółć123")).toBeNull();
  });

  it("odrzuca za krótkie, bez cyfr, bez liter i dłuższe niż 72 bajty", () => {
    expect(passwordProblem("a1".padEnd(MIN_PASSWORD - 1, "b"))).toMatch(/co najmniej/);
    expect(passwordProblem("samelitery")).toMatch(/litery i cyfry/);
    expect(passwordProblem("1234567890")).toMatch(/litery i cyfry/);
    expect(passwordProblem("ż1".repeat(30))).toMatch(/za długie/);
  });
});
