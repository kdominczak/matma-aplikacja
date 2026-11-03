import { describe, expect, it } from "vitest";
import { evaluate, formatIntervals, formatNumber, matchesAnswer, readAnswer, readIntervals } from "@/lib/calc";

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

describe("podgląd wyniku (readAnswer)", () => {
  it("odczytuje liczby, ułamki i kilka rozwiązań", () => {
    expect(readAnswer("-3/2")).toEqual([-1.5]);
    expect(readAnswer("x = 2√3 cm")?.[0]).toBeCloseTo(2 * Math.sqrt(3));
    expect(readAnswer("-2; 3")).toEqual([-2, 3]);
  });

  it("nie odczytuje zapisu, którego nie da się policzyć", () => {
    expect(readAnswer("log3 3-3/2")).toBeNull();
    expect(readAnswer("")).toBeNull();
  });
});

describe("przedziały w odpowiedziach (zadania typu „zbiór rozwiązań”)", () => {
  it.each([
    ["[-4, 4)", "[-4, 4)"],
    ["⟨-4; 4)", "[-4, 4)"],
    ["<-4;4)", "[-4, 4)"],
    ["x ∈ [−4, 4)", "[-4, 4)"],
    ["-4 ≤ x < 4", "[-4, 4)"],
    ["-4<=x<4", "[-4, 4)"],
    ["(-3, 3]", "(-3, 3]"],
    ["x ≥ -9", "[-9, +∞)"],
    ["⟨-9; ∞)", "[-9, +∞)"],
    ["[-9, inf)", "[-9, +∞)"],
    ["(1/3, 3/2)", "(1/3, 3/2)"],
    ["(1/3; 1,5)", "(1/3, 3/2)"],
    ["1/3 < x < 1,5", "(1/3, 3/2)"],
    ["(-∞, -2) ∪ (1, +∞)", "(-∞, -2) ∪ (1, +∞)"],
    ["(1, ∞) U (-∞, -2)", "(-∞, -2) ∪ (1, +∞)"],
  ])("„%s” = %s", (given, key) => {
    expect(matchesAnswer(given, [key])).toBe(true);
  });

  it.each([
    ["[-4, 4]", "[-4, 4)"], // inne domknięcie
    ["(-4, 4)", "[-4, 4)"],
    ["(4, -4]", "[-4, 4)"], // odwrócona kolejność krańców – CKE nie daje punktu (poza dyskalkulią)
    ["[-4, 3)", "[-4, 4)"],
    ["x > -9", "[-9, +∞)"],
    ["4", "[-4, 4)"], // sama liczba to nie przedział
    ["(1/3, 3/2)", "(1/3, 3/2) ∪ (2, 3)"],
  ])("„%s” ≠ %s", (given, key) => {
    expect(matchesAnswer(given, [key])).toBe(false);
  });

  it("liczbowe klucze działają jak dotąd, a podgląd pokazuje odczytany przedział", () => {
    expect(matchesAnswer("x = 1,5", ["3/2"])).toBe(true);
    expect(readIntervals("3/2")).toBeNull();
    expect(formatIntervals(readIntervals("⟨-4;4)")!)).toBe("[-4; 4)");
    expect(formatIntervals(readIntervals("x ≥ -9")!)).toBe("[-9; +∞)");
  });
});

describe("granica nieskończona jako wynik", () => {
  it("„-∞” zgadza się tylko z minus nieskończonością", () => {
    expect(matchesAnswer("-∞", ["-∞"])).toBe(true);
    expect(matchesAnswer("−∞", ["-∞"])).toBe(true);
    expect(matchesAnswer("lim = -inf", ["-∞"])).toBe(true);
    expect(matchesAnswer("+∞", ["-∞"])).toBe(false);
    expect(matchesAnswer("∞", ["+∞"])).toBe(true);
    expect(matchesAnswer("12", ["-∞"])).toBe(false);
  });
});
