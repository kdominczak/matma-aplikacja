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

/** Rozbija odpowiedź na wartości: „x = 2 lub x = 3”, „-2; 3”, „2 i 3” → ["2", "3"]. */
function splitValues(answer: string): string[] {
  return answer
    .toLowerCase()
    .split(/;|\blub\b|\boraz\b|\bi\b/)
    .map((part) => part.trim().replace(/^[a-z]\s*=\s*/, "").replace(/\.$/, ""))
    .filter(Boolean);
}

function values(answer: string): number[] | null {
  try {
    return splitValues(answer)
      .map(evaluate)
      .sort((a, b) => a - b);
  } catch {
    return null;
  }
}

/** Czy odpowiedź ucznia odpowiada jednej z akceptowanych (porównanie wartości, kolejność rozwiązań dowolna). */
export function matchesAnswer(given: string, accepted: string[]): boolean {
  const mine = values(given);
  if (!mine || mine.length === 0) return false;
  return accepted.some((answer) => {
    const expected = values(answer);
    return (
      expected !== null &&
      expected.length === mine.length &&
      expected.every((v, i) => Math.abs(v - mine[i]) <= 1e-6 * Math.max(1, Math.abs(v)))
    );
  });
}
