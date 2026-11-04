/** Tekst do wyszukiwania: małe litery, bez polskich znaków i akcentów („potegi” znajduje „Potęgi”, „ciag” – „Ciąg”). */
export function foldText(text: string): string {
  return text.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/\p{M}/gu, "").replace(/ł/g, "l");
}

/** Czy tekst zawiera wszystkie słowa zapytania (w dowolnej kolejności): „pole trojkata” znajdzie „Pole trójkąta równobocznego”. */
export function matchesQuery(text: string, query: string): boolean {
  const words = foldText(query).split(/\s+/).filter(Boolean);
  const haystack = foldText(text);
  return words.every((word) => haystack.includes(word));
}
