import { describe, expect, it } from "vitest";
import { foldText, matchesQuery } from "@/lib/search";

describe("wyszukiwanie działów i wzorów", () => {
  it("bez polskich znaków i wielkości liter", () => {
    expect(foldText("Potęgi i Pierwiastki")).toBe("potegi i pierwiastki");
    expect(foldText("Ciąg geometryczny – łuk")).toBe("ciag geometryczny – luk");
  });

  it("wszystkie słowa w dowolnej kolejności", () => {
    expect(matchesQuery("Pole trójkąta równobocznego", "pole trojkata")).toBe(true);
    expect(matchesQuery("Pole trójkąta równobocznego", "trojkat pole")).toBe(true);
    expect(matchesQuery("Pole trójkąta równobocznego", "pole kola")).toBe(false);
    expect(matchesQuery("Logarytmy", "  ")).toBe(true);
  });
});
