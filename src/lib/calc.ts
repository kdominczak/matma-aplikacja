// Prosty kalkulator (jak dopuszczony na maturze podstawowej) – bez eval, własny parser wyrażeń.
// Obsługuje: + − × ÷ * / : ^, nawiasy, √ i sqrt(), π, %, przecinek dziesiętny, mnożenie domyślne (2π, 3(4+1)).
// Ten sam parser sprawdza odpowiedzi w zadaniach otwartych („1,5” = „3/2” = „x = 1,5”).

type Token = { type: "num"; value: number } | { type: "op"; value: string } | { type: "fn"; value: "sqrt" };

function tokenize(input: string): Token[] {
  const s = input
    .replace(/\s+/g, "")
    .replace(/[×·⋅]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/pi|π/gi, "π")
    .replace(/sqrt|√/gi, "√");
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/[0-9.,]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const raw = s.slice(i, j).replace(",", ".");
      if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) throw new Error("Nieprawidłowa liczba");
      tokens.push({ type: "num", value: Number(raw) });
      i = j;
    } else if (ch === "π") {
      tokens.push({ type: "num", value: Math.PI });
      i++;
    } else if (ch === "√") {
      tokens.push({ type: "fn", value: "sqrt" });
      i++;
    } else if ("+-*/^()%".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i++;
    } else {
      throw new Error(`Nieznany znak: ${ch}`);
    }
  }
  return tokens;
}

/**
 * Parser zstępujący: wyrażenie (+|−) → iloczyn (×|÷|domyślne) → minus jednoargumentowy → potęga → % → pierwotne.
 * Minus jest nad potęgą, więc −3^2 = −9 (jak w matematyce), a wykładnik może być ujemny: 2^−1.
 */
function parse(tokens: Token[]): number {
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (value: string) => peek()?.type === "op" && peek()!.value === value;
  // czy następny token może zacząć czynnik (do mnożenia domyślnego: 2π, 2(3), 2√4)
  const startsFactor = () => {
    const t = peek();
    return t !== undefined && (t.type === "num" || t.type === "fn" || (t.type === "op" && t.value === "("));
  };

  function expression(): number {
    let value = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[pos++].value;
      const right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function term(): number {
    let value = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = tokens[pos++].value;
        const right = unary();
        if (op === "/" && right === 0) throw new Error("Dzielenie przez zero");
        value = op === "*" ? value * right : value / right;
      } else if (startsFactor()) {
        value *= power();
      } else {
        return value;
      }
    }
  }

  function unary(): number {
    if (isOp("-")) {
      pos++;
      return -unary();
    }
    if (isOp("+")) {
      pos++;
      return unary();
    }
    return power();
  }

  function power(): number {
    const base = postfix();
    if (isOp("^")) {
      pos++;
      return Math.pow(base, unary()); // prawostronne (2^3^2 = 2^9) i z ujemnym wykładnikiem (2^−1)
    }
    return base;
  }

  function postfix(): number {
    let value = primary();
    while (isOp("%")) {
      pos++;
      value /= 100;
    }
    return value;
  }

  function primary(): number {
    const t = tokens[pos++];
    if (!t) throw new Error("Niedokończone wyrażenie");
    if (t.type === "num") return t.value;
    if (t.type === "fn") {
      const arg = postfix(); // √ wiąże z najbliższym czynnikiem: √16, √(9+16), √2^2 = (√2)^2
      if (arg < 0) throw new Error("Pierwiastek z liczby ujemnej");
      return Math.sqrt(arg);
    }
    if (t.value === "(") {
      const value = expression();
      if (!isOp(")")) throw new Error("Brak nawiasu zamykającego");
      pos++;
      return value;
    }
    throw new Error("Nieoczekiwany znak");
  }

  const value = expression();
  if (pos < tokens.length) throw new Error("Nieoczekiwany znak");
  return value;
}

/** Oblicza wyrażenie; rzuca błąd z polskim komunikatem przy niepoprawnym zapisie. */
export function evaluate(input: string): number {
  if (!input.trim()) throw new Error("Puste wyrażenie");
  const value = parse(tokenize(input));
  if (!Number.isFinite(value)) throw new Error("Wynik poza zakresem");
  return value;
}

/** Wynik po polsku: przecinek dziesiętny, do 10 cyfr znaczących, bez ogona zer. */
export function formatNumber(value: number): string {
  if (Object.is(value, -0) || Math.abs(value) < 1e-12) return "0";
  const rounded = Number(value.toPrecision(10));
  return String(rounded).replace(".", ",");
}

// ── Sprawdzanie odpowiedzi otwartych ──
//
// Porównujemy WARTOŚCI, nie tekst: „3/2” = „1,5” = „6/4” = „x = 1,5 cm”. Zapis ucznia czyścimy z tego,
// co nie zmienia wyniku (nazwa niewiadomej, „Odp:”, jednostka, kropka na końcu, różne minusy i ułamki
// Unicode), a niejednoznaczny przecinek („-2,3” = −2,3 albo −2 i 3) sprawdzamy w obu odczytaniach.
// Zły wynik nie przejdzie: w każdym odczytaniu zbiór wartości musi być dokładnie taki jak w kluczu.

const UNICODE_FRACTIONS: Record<string, string> = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅕": "1/5", "⅙": "1/6", "⅛": "1/8" };
const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

/** Jednostki i dopiski po wyniku, które nie zmieniają wartości. */
const UNIT =
  /\s*(?:cm|mm|dm|km|m|kg|dag|g|zł|gr|min|h|s|l|ml|j|jednost(?:ek|ki|ka)|stopni(?:e|a)?(?:\s*celsjusza)?|°\s*c|℃|°|rad|szt\.?|osób|osoby|lat|dni)(?:\^?[23])?\.?$/;

function normalize(answer: string): string {
  let s = answer.toLowerCase().trim();
  for (const [ch, frac] of Object.entries(UNICODE_FRACTIONS)) {
    // „1½” = 1 + 1/2 (liczba mieszana), samo „½” = 1/2
    s = s.replace(new RegExp(`(\\d)${ch}`, "g"), `($1+${frac})`).replaceAll(ch, frac);
  }
  return s
    .replace(/[−–—‐]/g, "-")
    .replace(/[₀-₉]/g, (d) => String(SUBSCRIPT_DIGITS.indexOf(d)))
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/≈/g, "=")
    .replace(/^(?:odp(?:owiedź|owiedz)?\.?\s*:?|wynik\s*:)\s*/, "")
    .replace(/(\d)\s+(\d+)\s*\/\s*(\d+)/g, "($1+$2/$3)"); // „1 1/2” – liczba mieszana
}

/** Usuwa „x =”, „x₁ =”, „x_2 =”, „y=” przed wartością (ale nie „x² =” – to nie jest wynik) i kropkę na końcu. */
function stripName(part: string): string {
  return part
    .trim()
    .replace(/^[a-z](?:_?\d+)?\s*=\s*/, "")
    .replace(/^=\s*/, "")
    .replace(/\.$/, "")
    .trim();
}

const SEPARATOR_WORDS = /;|\blub\b|\boraz\b|\balbo\b|\bi\b|∨/;

/** Możliwe podziały odpowiedzi na wartości – przecinek bez spacji może być dziesiętny albo rozdzielać rozwiązania. */
function readings(answer: string): string[][] {
  // zbiór „x ∈ {-2, 3}” albo „{-2; 3}” rozpakowujemy przed podziałem
  const base = normalize(answer).replace(/^(?:[a-z]\s*∈\s*)?\{(.*)\}\.?$/, "$1");
  // przecinek ze spacją za nim, przed minusem albo przy literze zawsze rozdziela („-2, 3”, „2,-3”, „x1=-2,x2=3”)
  const clear = base.replace(/,(?=\s|-|[a-z])|(?<=[a-z]),/g, ";");
  const variants = [clear, clear.replace(/,/g, ";")].map((text) => text.split(SEPARATOR_WORDS).map(stripName).filter(Boolean));
  return variants[0].join("|") === variants[1].join("|") ? [variants[0]] : variants;
}

/** Wartości jednego wyniku: dosłownie, bez jednostki i bez „%” (30% przy kluczu „30”). */
function valueCandidates(part: string): number[] {
  const out: number[] = [];
  const tryEval = (expr: string) => {
    try {
      out.push(evaluate(expr));
    } catch {
      // ten zapis nie jest wyrażeniem – próbujemy kolejnego wariantu
    }
  };
  tryEval(part);
  const noUnit = part.replace(UNIT, "").trim();
  if (noUnit !== part) tryEval(noUnit);
  if (noUnit.endsWith("%")) tryEval(noUnit.slice(0, -1));
  return out;
}

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a));

/** Wartości z klucza (zapisane przez nas średnikami, więc jednoznaczne) – bez powtórzeń. */
function keyValues(answer: string): number[] | null {
  try {
    const values = answer.split(";").map((p) => evaluate(p.trim()));
    return values.filter((v, i) => values.findIndex((w) => close(v, w)) === i);
  } catch {
    return null;
  }
}

/** Każda część odpowiedzi ma wartość z klucza i każda wartość z klucza jest w odpowiedzi (podwójne „3; 3” liczymy raz). */
function sameSet(parts: string[], expected: number[]): boolean {
  if (parts.length === 0) return false;
  const found = new Set<number>();
  for (const part of parts) {
    const candidates = valueCandidates(part);
    const index = expected.findIndex((v) => candidates.some((c) => close(v, c)));
    if (index < 0) return false;
    found.add(index);
  }
  return found.size === expected.length;
}

/** Czy odpowiedź ucznia odpowiada jednej z akceptowanych (porównanie wartości, kolejność rozwiązań dowolna). */
export function matchesAnswer(given: string, accepted: string[]): boolean {
  if (!given.trim()) return false;
  // granica nieskończona („-∞”, „+∞”): porównujemy znak nieskończoności
  const infinite = accepted.map(infinityValue);
  if (infinite.some((v) => v !== null)) {
    const mine = infinityValue(given);
    return mine !== null && infinite.includes(mine);
  }
  // klucz-przedział (np. „[-4, 4)”) porównujemy jako zbiór: krańce i ich domknięcie, zapis dowolny
  const keyIntervals = accepted.map(readIntervals);
  if (keyIntervals.some(Boolean)) {
    const mine = readIntervals(given);
    return mine !== null && keyIntervals.some((key) => key !== null && sameIntervals(mine, key));
  }
  const options = readings(given);
  return accepted.some((answer) => {
    const expected = keyValues(answer);
    return expected !== null && expected.length > 0 && options.some((parts) => sameSet(parts, expected));
  });
}

/**
 * Jak aplikacja odczyta wynik ucznia – do podglądu pod polem odpowiedzi („= −1,5”), zanim uczeń go zatwierdzi.
 * null – zapisu nie da się policzyć (np. „log3 3-3/2”: wynik trzeba uprościć do liczby).
 */
export function readAnswer(given: string): number[] | null {
  if (!given.trim()) return null;
  const parts = readings(given)[0];
  const values: number[] = [];
  for (const part of parts) {
    const [value] = valueCandidates(part);
    if (value === undefined) return null;
    values.push(value);
  }
  return values.length ? values : null;
}

// ── Przedziały (odpowiedzi typu „zbiór rozwiązań”, dziedzina, zbiór wartości) ──
//
// Akceptujemy zapisy z polskiej szkoły i z CKE: [a, b), ⟨a; b), <a; b) (znak „<” jako ⟨), (−∞, 3], x ∈ …,
// nierówności („-4 ≤ x < 4”, „x ≥ -9”) i sumy przedziałów (∪). Odwrócona kolejność krańców („(4, −4]”) to błąd.

export interface IntervalBound {
  value: number;
  closed: boolean;
}

export interface Interval {
  lo: IntervalBound;
  hi: IntervalBound;
}

const LEFT = "[(⟨<";
const RIGHT = "])⟩>";

/** Odpowiedź „−∞” / „+∞” (np. granica) – ±Infinity, inna – null. Bez znaku: +∞. */
function infinityValue(answer: string): number | null {
  const t = stripName(normalize(answer).replace(/\s+/g, "").replace(/^lim[^=]*=/, ""));
  return /^[+-]?(∞|inf|oo|nieskończoność)$/.test(t) ? (t.startsWith("-") ? -Infinity : Infinity) : null;
}

/** Kraniec: liczba albo nieskończoność („∞”, „+∞”, „inf”, „oo”). */
function boundValue(text: string): number | null {
  const t = text.replace(/\s+/g, "");
  if (/^\+?(∞|inf|oo|nieskończoność)$/.test(t)) return Infinity;
  if (/^-(∞|inf|oo|nieskończoność)$/.test(t)) return -Infinity;
  for (const candidate of [t, t.replace(",", ".")]) {
    try {
      return evaluate(candidate);
    } catch {
      // kolejny zapis
    }
  }
  return null;
}

function interval(lo: number, loClosed: boolean, hi: number, hiClosed: boolean): Interval | null {
  if (!(lo < hi)) return null;
  // przy nieskończoności domknięcie nie ma znaczenia
  return { lo: { value: lo, closed: Number.isFinite(lo) && loClosed }, hi: { value: hi, closed: Number.isFinite(hi) && hiClosed } };
}

/** Jeden przedział w nawiasach: „[a, b)”, „⟨a; b⟩”, „(1,5; 3)” – przecinek dziesiętny rozstrzyga średnik albo próba. */
function bracketInterval(text: string): Interval | null {
  const open = text[0];
  const close = text[text.length - 1];
  if (!LEFT.includes(open) || !RIGHT.includes(close)) return null;
  const inside = text.slice(1, -1);
  const splits = inside.includes(";")
    ? [inside.split(";")]
    : [...inside.matchAll(/,/g)].map((m) => [inside.slice(0, m.index), inside.slice(m.index! + 1)]);
  for (const parts of splits) {
    if (parts.length !== 2) continue;
    const lo = boundValue(parts[0]);
    const hi = boundValue(parts[1]);
    if (lo === null || hi === null) continue;
    return interval(lo, "[⟨<".includes(open), hi, "]⟩>".includes(close));
  }
  return null;
}

const LE = "(?:<=|≤|=<)";
const GE = "(?:>=|≥|=>)";

/** Nierówność z jedną zmienną: „a ≤ x < b”, „x ≥ a”, „x < b”, „a < x”. */
function inequalityInterval(text: string): Interval | null {
  const v = "[a-z]";
  let m = text.match(new RegExp(`^(.+?)(${LE}|<)${v}(${LE}|<)(.+)$`));
  if (m) {
    const lo = boundValue(m[1]);
    const hi = boundValue(m[4]);
    return lo === null || hi === null ? null : interval(lo, m[2] !== "<", hi, m[3] !== "<");
  }
  m = text.match(new RegExp(`^${v}(${GE}|>|${LE}|<)(.+)$`)) ?? null;
  if (m) {
    const value = boundValue(m[2]);
    if (value === null) return null;
    const greater = /^(>|>=|≥|=>)$/.test(m[1]);
    const closed = !/^[<>]$/.test(m[1]);
    return greater ? interval(value, closed, Infinity, false) : interval(-Infinity, false, value, closed);
  }
  m = text.match(new RegExp(`^(.+?)(${LE}|<|${GE}|>)${v}$`));
  if (m) {
    const value = boundValue(m[1]);
    if (value === null) return null;
    const below = /^(<|<=|≤|=<)$/.test(m[2]); // „a < x” – x większe od a
    const closed = !/^[<>]$/.test(m[2]);
    return below ? interval(value, closed, Infinity, false) : interval(-Infinity, false, value, closed);
  }
  return null;
}

/**
 * Odpowiedź jako suma przedziałów albo null (to nie jest przedział – np. sama liczba).
 * Zwykła liczba nie jest przedziałem, więc liczbowe klucze sprawdzamy jak dotąd.
 */
export function readIntervals(answer: string): Interval[] | null {
  const text = normalize(answer)
    .replace(/\s+/g, "")
    .replace(/^(?:[a-z]∈|[a-z]należydo)/, "")
    .replace(/\.$/, "");
  if (!text) return null;
  // „U” z klawiatury tylko między przedziałami; „lub” / „∨” – między nierównościami („x < −2 lub x > 1”)
  const parts = text.split(/∪|lub|∨|(?<=[\])⟩>])u(?=[[(⟨<])/);
  const out: Interval[] = [];
  for (const part of parts) {
    const found = bracketInterval(part) ?? inequalityInterval(part);
    if (!found) return null;
    out.push(found);
  }
  return out;
}

const sameBound = (a: IntervalBound, b: IntervalBound) => a.closed === b.closed && (a.value === b.value || close(a.value, b.value));

/** Te same przedziały (kolejność w sumie dowolna). */
function sameIntervals(a: Interval[], b: Interval[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...b];
  return a.every((x) => {
    const i = left.findIndex((y) => sameBound(x.lo, y.lo) && sameBound(x.hi, y.hi));
    if (i < 0) return false;
    left.splice(i, 1);
    return true;
  });
}

/** Przedział do podglądu („[−4; 4)”), jak go odczytała aplikacja. */
export function formatIntervals(intervals: Interval[]): string {
  const bound = (b: IntervalBound) => (b.value === Infinity ? "+∞" : b.value === -Infinity ? "−∞" : formatNumber(b.value));
  return intervals.map((i) => `${i.lo.closed ? "[" : "("}${bound(i.lo)}; ${bound(i.hi)}${i.hi.closed ? "]" : ")"}`).join(" ∪ ");
}
