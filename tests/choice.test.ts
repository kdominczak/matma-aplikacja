// Zadania „wybierz spośród A–F” z arkuszy CKE: punktacja jak w zasadach oceniania CKE.
import { describe, expect, it } from "vitest";
import { choicePoints, formatPicks, isAnswered, scoreTask } from "@/lib/exam";
import type { ChoiceQuestion, ChoiceTask } from "@/types/exam";

const options = ["A", "B", "C", "D", "E", "F"].map((key) => ({ key, text: key }));
const matching: ChoiceQuestion = { id: "m", label: "", prompt: "", options, explanation: "", blanks: [{ label: "g", answer: ["A"] }, { label: "h", answer: ["E"] }] };
const two: ChoiceQuestion = { id: "t", label: "", prompt: "", options, explanation: "", blanks: [{ answer: ["B", "F"] }] };
const task = (choice: ChoiceQuestion): ChoiceTask => ({ kind: "choice", id: choice.id, difficulty: "sredni", points: 2, choice });

describe("zadanie „choice”", () => {
  it("dopasowanie (dwie luki): 1 pkt za każdą dobrze wypełnioną lukę", () => {
    expect(choicePoints(matching, [["A"], ["E"]])).toBe(2);
    expect(choicePoints(matching, [["A"], ["C"]])).toBe(1);
    expect(choicePoints(matching, [["E"], ["A"]])).toBe(0);
  });

  it("dwie litery w jednej luce: 2 pkt za obie, 1 pkt za jedną poprawną (także obok błędnej)", () => {
    expect(choicePoints(two, [["F", "B"]])).toBe(2);
    expect(choicePoints(two, [["B", "C"]])).toBe(1);
    expect(choicePoints(two, [["B"]])).toBe(1);
    expect(choicePoints(two, [["A", "C"]])).toBe(0);
    // więcej liter niż w kluczu się nie liczy – zgadywanie wszystkich nie daje punktów
    expect(choicePoints(two, [["A", "C", "B", "F"]])).toBe(0);
  });

  it("wynik w arkuszu: status, punkty i zapis odpowiedzi", () => {
    expect(scoreTask(task(matching), { kind: "choice", picks: [["A"], ["E"]] }, 1)).toMatchObject({ status: "correct", points: 2, given: "A; E", kind: "choice" });
    expect(scoreTask(task(matching), { kind: "choice", picks: [["A"], []] }, 1)).toMatchObject({ status: "partial", points: 1, given: "A; –" });
    expect(scoreTask(task(two), { kind: "choice", picks: [["C", "A"]] }, 1)).toMatchObject({ status: "wrong", points: 0, given: "A, C" });
    expect(scoreTask(task(two), { kind: "choice", picks: [[]] }, 1)).toMatchObject({ status: "skipped", points: 0 });
    expect(formatPicks(two, [["F", "B"]])).toBe("B, F");
    expect(isAnswered({ kind: "choice", picks: [[], ["E"]] })).toBe(true);
    expect(isAnswered({ kind: "choice", picks: [[]] })).toBe(false);
  });
});

it("„wszystko albo nic” (np. „malejący oraz m = 2” za 1 pkt): punkt tylko za komplet", () => {
  const q: ChoiceQuestion = {
    id: "w",
    label: "",
    prompt: "",
    options: ["A", "B", "1", "2", "3"].map((key) => ({ key, text: key })),
    explanation: "",
    allOrNothing: true,
    blanks: [{ answer: ["B"], keys: ["A", "B"] }, { answer: ["2"], keys: ["1", "2", "3"] }],
  };
  const t: ChoiceTask = { kind: "choice", id: "w", difficulty: "sredni", points: 1, choice: q };
  expect(scoreTask(t, { kind: "choice", picks: [["B"], ["2"]] }, 1)).toMatchObject({ status: "correct", points: 1 });
  expect(scoreTask(t, { kind: "choice", picks: [["B"], ["3"]] }, 1)).toMatchObject({ status: "wrong", points: 0 });
});
