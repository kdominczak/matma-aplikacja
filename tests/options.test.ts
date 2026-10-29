// Mieszanie odpowiedzi na ekranie: poprawna odpowiedź nie może stać ciągle pod „A”.
import { describe, expect, it } from "vitest";
import { allQuestionRefs } from "@/data/topics";
import { displayedOptions, displayKey, optionOrder, OPTION_KEYS } from "@/lib/options";

const questions = allQuestionRefs().map((r) => r.question);

describe("kolejność odpowiedzi", () => {
  it("każda kolejność to permutacja A–D, stała dla danego zadania", () => {
    for (const q of questions) {
      const order = optionOrder(q);
      expect([...order].sort()).toEqual([...OPTION_KEYS]);
      expect(optionOrder({ id: q.id, format: q.format })).toEqual(order);
    }
  });

  it("litera na ekranie wskazuje tę samą treść co litera w danych", () => {
    for (const q of questions) {
      const shown = displayedOptions(q);
      for (const key of OPTION_KEYS) {
        const label = displayKey(q, key);
        expect(shown.find((o) => o.label === label)!.text).toBe(q.options[key]);
      }
    }
  });

  it("P/F i arkusze CKE zachowują kolejność z danych", () => {
    expect(optionOrder({ id: "x", format: "truefalse" })).toEqual([...OPTION_KEYS]);
    expect(optionOrder({ id: "cke-2024-1" })).toEqual([...OPTION_KEYS]);
  });

  it("poprawne odpowiedzi rozkładają się na wszystkie pozycje (żadna nie ma > 40%)", () => {
    const shuffledOnes = questions.filter((q) => q.format !== "truefalse");
    const counts = Object.fromEntries(OPTION_KEYS.map((k) => [k, 0]));
    for (const q of shuffledOnes) counts[displayKey(q, q.correct)]++;
    for (const key of OPTION_KEYS) {
      expect(counts[key] / shuffledOnes.length).toBeGreaterThan(0.1);
      expect(counts[key] / shuffledOnes.length).toBeLessThan(0.4);
    }
  });
});
