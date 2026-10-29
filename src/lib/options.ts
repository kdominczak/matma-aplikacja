import { seededRandom, shuffled } from "@/lib/random";
import type { OptionKey, Question } from "@/types/quiz";

// Kolejność odpowiedzi ABCD na ekranie. W danych poprawna odpowiedź to najczęściej A – bez mieszania uczeń
// szybko by to zauważył. Mieszamy tylko WYŚWIETLANIE: litera w danych („kanoniczna”) zostaje ta sama
// w kluczach serwera (question_keys), Pudełku porażek i zapisach arkuszy. Ekran pokazuje literę „wyświetlaną”.
// Kolejność zależy wyłącznie od id zadania – to samo zadanie wygląda zawsze tak samo (też po powrocie do niego).

export const OPTION_KEYS: readonly OptionKey[] = ["A", "B", "C", "D"];

/** Zadania, w których kolejność ma znaczenie: P/F (stały układ kombinacji) i przepisane arkusze CKE. */
function keepsOrder(question: Pick<Question, "id" | "format">): boolean {
  return question.format === "truefalse" || question.id.startsWith("cke-");
}

const cache = new Map<string, OptionKey[]>();

/** Litery z danych w kolejności wyświetlania: `order[i]` stoi na i-tej pozycji (A, B, C, D). */
export function optionOrder(question: Pick<Question, "id" | "format">): OptionKey[] {
  if (keepsOrder(question)) return [...OPTION_KEYS];
  let order = cache.get(question.id);
  if (!order) {
    order = shuffled(OPTION_KEYS, seededRandom(`opcje:${question.id}`));
    cache.set(question.id, order);
  }
  return order;
}

/** Litera, którą uczeń widzi przy odpowiedzi z danych (np. „Twoja odpowiedź: C”). */
export function displayKey(question: Pick<Question, "id" | "format">, key: OptionKey): OptionKey {
  return OPTION_KEYS[optionOrder(question).indexOf(key)];
}

/** Odpowiedzi w kolejności ekranu: litera wyświetlana + litera z danych + treść. */
export function displayedOptions(question: Question): { label: OptionKey; key: OptionKey; text: string }[] {
  return optionOrder(question).map((key, i) => ({ label: OPTION_KEYS[i], key, text: question.options[key] }));
}
