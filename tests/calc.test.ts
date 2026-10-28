import { describe, expect, it } from "vitest";
import { evaluate, formatNumber, matchesAnswer } from "@/lib/calc";

describe("kalkulator (parser bez eval)", () => {
  it.each([
    ["2+2*2", 6],
    ["(2+2)*2", 8],
    ["2^10", 1024],
    ["-3^2", -9], // jak na kartce: minus przed potęgowaniem
    ["2^-1", 0.5],
    ["10/4", 2.5],
    ["3,5+1,5", 5],
  ])("%s = %d", (input, expected) => {
    expect(evaluate(input)).toBeCloseTo(expected);
  });

  it("odrzuca niepoprawne wyrażenia zamiast zgadywać", () => {
    expect(() => evaluate("2+")).toThrow();
    expect(() => evaluate("alert(1)")).toThrow();
  });

  it("formatuje liczby po polsku", () => {
    expect(formatNumber(2.5)).toBe("2,5");
  });
});

describe("sprawdzanie odpowiedzi w zadaniach otwartych", () => {
  it("akceptuje równoważne zapisy liczby", () => {
    expect(matchesAnswer("5,5", ["11/2"])).toBe(true);
    expect(matchesAnswer("11/2", ["5.5"])).toBe(true);
    expect(matchesAnswer("242", ["242"])).toBe(true);
  });

  it("odrzuca inną wartość", () => {
    expect(matchesAnswer("240", ["242"])).toBe(false);
    expect(matchesAnswer("", ["242"])).toBe(false);
  });
});
