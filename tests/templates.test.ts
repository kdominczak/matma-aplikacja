// Szablony parametryczne: silnik (warianty, P/F) i NIEZALEŻNA weryfikacja matematyki – test odczytuje liczby
// z treści wariantu i liczy wynik siłowo (wyliczenie przypadków), bez korzystania z obliczeń szablonu.
import { describe, expect, it } from "vitest";
import { closedVariants, frac, openVariants, type ClosedTemplate } from "@/data/templates/engine";
import { generatedTasks, TEMPLATE_TOPICS } from "@/data/templates";
import { getTopic } from "@/data/topics";
import { evaluate, matchesAnswer } from "@/lib/calc";
import type { ClosedVariant } from "@/data/templates/engine";

/** Wartość liczbowa opcji: "$24$" → 24, "$\\frac{1}{6}$" → 0.1666… */
function optionValue(option: string): number {
  const tex = option.replace(/\$/g, "").trim();
  const f = tex.match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/);
  if (f) return (f[1] ? -1 : 1) * (Number(f[2]) / Number(f[3]));
  return Number(tex);
}
const correctValue = (q: ClosedVariant) => optionValue(q.options[q.correct]);
/** Warianty rodziny – test od razu pada, gdy rodzina jest pusta (pętla po pustej liście niczego by nie sprawdziła). */
function closedOf(topicId: string, family: string) {
  const list = generatedTasks(topicId).closed.filter((q) => q.family === family);
  expect(list.length, family).toBeGreaterThanOrEqual(6);
  return list;
}
function openOf(topicId: string, family: string) {
  const list = generatedTasks(topicId).open.filter((q) => q.family === family);
  expect(list.length, family).toBeGreaterThanOrEqual(6);
  return list;
}

/** Wszystkie liczby k-cyfrowe z podanych cyfr (siłowo). */
function countNumbers(k: number, allowed: (digit: number, position: number) => boolean): number {
  let count = 0;
  for (let n = 10 ** (k - 1); n < 10 ** k; n++) {
    const digits = String(n).split("").map(Number);
    if (digits.every((d, i) => allowed(d, i))) count++;
  }
  return count;
}

describe("silnik szablonów", () => {
  const tfTemplate: ClosedTemplate = {
    id: "test-pf",
    difficulty: "podstawowy",
    make: (r) => {
      const a = r.int(0, 1) === 1;
      const b = r.int(0, 1) === 1;
      return { intro: `Test ${r.int(1, 1000)}`, statements: [{ text: `A=${a}`, true: a }, { text: `B=${b}`, true: b }], explanation: "-" };
    },
  };

  it("P/F: poprawna kombinacja odpowiada prawdziwości obu zdań", () => {
    for (const q of closedVariants(tfTemplate, 20)) {
      const a = q.prompt.includes("A=true");
      const b = q.prompt.includes("B=true");
      expect(q.format).toBe("truefalse");
      expect(q.options[q.correct]).toBe(`1. ${a ? "P" : "F"} · 2. ${b ? "P" : "F"}`);
    }
  });

  it("warianty są stałe (te same id i treść przy każdym uruchomieniu) i mają wspólną rodzinę", () => {
    const first = closedVariants(tfTemplate, 5);
    const again = closedVariants(tfTemplate, 5);
    expect(again).toEqual(first);
    expect(first.map((q) => q.id)).toEqual(["test-pf-1", "test-pf-2", "test-pf-3", "test-pf-4", "test-pf-5"]);
    expect(new Set(first.map((q) => q.family))).toEqual(new Set(["test-pf"]));
  });

  it("za mało różnych wariantów → czytelny błąd zamiast cichych duplikatów", () => {
    const tiny: ClosedTemplate = { id: "test-maly", difficulty: "podstawowy", make: () => ({ prompt: "To samo", correct: "1", distractors: ["2", "3", "4"], explanation: "-" }) };
    expect(() => closedVariants(tiny, 2)).toThrow(/tylko 1 z 2/);
  });

  it("punkty zadania otwartego = suma kroków schematu", () => {
    for (const task of openVariants({ id: "test-ot", difficulty: "sredni", make: (r) => ({ prompt: `P${r.int(1, 99)}`, answers: ["1"], solution: [{ step: "a", points: 1 }, { step: "b", points: 2 }] }) }, 3)) {
      expect(task.points).toBe(3);
    }
  });

  it("ułamki są skracane i mają znak przed kreską", () => {
    expect(frac(6, 8)).toBe("\\frac{3}{4}");
    expect(frac(4, 2)).toBe("2");
    expect(frac(3, -6)).toBe("-\\frac{1}{2}");
  });

  it("każdy dział z szablonami istnieje w aplikacji", () => {
    for (const id of TEMPLATE_TOPICS) expect(getTopic(id), id).toBeDefined();
  });
});

describe("matematyka wariantów (sprawdzona siłowo)", () => {
  it("układ równań: wskazana para spełnia oba równania, pozostałe – nie", () => {
    const eq = /(-?\d*)x\s*([+-])\s*(\d*)y\s*=\s*(-?\d+)/g;
    const coef = (s: string) => (s === "" ? 1 : s === "-" ? -1 : Number(s));
    for (const q of closedOf("uklady-rownan", "ur-uklad")) {
      const rows = [...q.prompt.matchAll(eq)].map((m) => [coef(m[1]), (m[2] === "-" ? -1 : 1) * coef(m[3]), Number(m[4])]);
      expect(rows, q.id).toHaveLength(2);
      for (const [key, option] of Object.entries(q.options)) {
        const [, x, y] = option.match(/x = (-?\d+),\\ y = (-?\d+)/)!.map(Number);
        const solves = rows.every(([a, b, c]) => a * x + b * y === c);
        expect(solves, `${q.id} ${key}`).toBe(key === q.correct);
      }
    }
  });

  it("kombinatoryka: liczby z cyfr zbioru (z powtórzeniami)", () => {
    for (const q of [...closedOf("kombinatoryka", "km-cyfry"), ...closedOf("kombinatoryka", "km-zero")]) {
      const k = Number(q.prompt.match(/(\d)-cyfrowych/)![1]);
      const digits = q.prompt.match(/\\\{([\d, ]+)\\\}/)![1].split(",").map((d) => Number(d.trim()));
      expect(correctValue(q), q.id).toBe(countNumbers(k, (d) => digits.includes(d)));
    }
  });

  it("kombinatoryka: wszystkie cyfry parzyste / nieparzyste", () => {
    for (const q of closedOf("kombinatoryka", "km-parzystosc")) {
      const k = Number(q.prompt.match(/(\d)-cyfrowych/)![1]);
      const odd = q.prompt.includes("nieparzyste");
      expect(correctValue(q), q.id).toBe(countNumbers(k, (d) => d % 2 === (odd ? 1 : 0)));
    }
  });

  it("kombinatoryka: wybór osób na różne funkcje", () => {
    for (const q of closedOf("kombinatoryka", "km-funkcje")) {
      const n = Number(q.prompt.match(/jest (\d+) uczniów/)![1]);
      const roles = q.prompt.includes("skarbnika") ? 3 : 2;
      let count = 0;
      for (let a = 0; a < n; a++)
        for (let b = 0; b < n; b++)
          for (let c = 0; c < (roles === 3 ? n : 1); c++) if (a !== b && (roles === 2 || (c !== a && c !== b))) count++;
      expect(correctValue(q), q.id).toBe(count);
    }
  });

  it("prawdopodobieństwo: suma oczek na dwóch kostkach", () => {
    for (const q of closedOf("prawdopodobienstwo", "pr-kostka")) {
      const sum = Number(q.prompt.match(/równa (\d+), jest/)![1]);
      let hits = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sum) hits++;
      expect(correctValue(q), q.id).toBeCloseTo(hits / 36, 10);
    }
  });

  it("prawdopodobieństwo: liczba podzielna przez d", () => {
    for (const q of closedOf("prawdopodobienstwo", "pr-podzielnosc")) {
      const n = Number(q.prompt.match(/\\ldots, (\d+)\\\}/)![1]);
      const d = Number(q.prompt.match(/podzielnej przez (\d+)/)![1]);
      const hits = Array.from({ length: n }, (_, i) => i + 1).filter((x) => x % d === 0).length;
      expect(correctValue(q), q.id).toBeCloseTo(hits / n, 10);
    }
  });

  it("prawdopodobieństwo: kula biała", () => {
    for (const q of closedOf("prawdopodobienstwo", "pr-urna")) {
      const counts = [...q.prompt.matchAll(/(\d+) (?:kul|czarnych|zielonych)/g)].map((m) => Number(m[1]));
      const total = counts.reduce((a, b) => a + b, 0);
      expect(correctValue(q), q.id).toBeCloseTo(counts[0] / total, 10);
    }
  });

  it("prawdopodobieństwo (otwarte): podzielna przez a lub przez b", () => {
    for (const t of openOf("prawdopodobienstwo", "pr-lub")) {
      const n = Number(t.prompt.match(/\\ldots, (\d+)\\\}/)![1]);
      const [, a, b] = t.prompt.match(/podzielna przez (\d+) lub przez (\d+)/)!.map(Number);
      const hits = Array.from({ length: n }, (_, i) => i + 1).filter((x) => x % a === 0 || x % b === 0).length;
      expect(evaluate(t.answers[0]), t.id).toBeCloseTo(hits / n, 10);
    }
  });

  it("układy równań (otwarte): bilety i wiek – odpowiedź spełnia warunki zadania", () => {
    for (const t of openOf("uklady-rownan", "ur-bilety")) {
      const [total, normal, reduced, sum] = [...t.prompt.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
      const y = Number(t.answers[0]);
      expect(normal * (total - y) + reduced * y, t.id).toBe(sum);
    }
    for (const t of openOf("uklady-rownan", "ur-wiek")) {
      const [diff, years] = [...t.prompt.matchAll(/(\d+) lat/g)].map((m) => Number(m[1]));
      const times = t.prompt.includes("dwa razy") ? 2 : 3;
      const son = Number(t.answers[0]);
      expect(son + diff + years, t.id).toBe(times * (son + years));
    }
  });

  it("statystyka: średnia ocen z tabeli", () => {
    for (const t of openOf("statystyka", "st-srednia")) {
      const rows = t.prompt.match(/\\text\{liczba uczniów\} & ([\d & ]+) \\\\/)![1].split("&").map((x) => Number(x.trim()));
      const total = rows.reduce((a, b) => a + b, 0);
      const sum = rows.reduce((acc, c, i) => acc + c * (i + 1), 0);
      expect(matchesAnswer(String(sum / total), t.answers), t.id).toBe(true);
    }
  });

  it("geometria: przekątna i pole graniastosłupa, kąt wpisany, wybieg", () => {
    for (const t of openOf("geometria-przestrzenna", "ot-przekatna")) {
      const [a, h] = [...t.prompt.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]));
      expect(Number(t.answers[0]) ** 2, t.id).toBe(2 * a * a + h * h);
    }
    for (const t of openOf("geometria-przestrzenna", "ot-pole-graniastoslupa")) {
      const [a, d] = [...t.prompt.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]));
      const h = Math.sqrt(d * d - a * a);
      expect(Number(t.answers[0]), t.id).toBe(2 * a * a + 4 * a * h);
    }
    for (const t of openOf("okrag-i-kolo", "kr-kat-wpisany")) {
      const central = Number(t.prompt.match(/\$(\d+)\^\\circ\$/)![1]);
      expect(Number(t.answers[0]) * 2, t.id).toBe(central);
    }
    for (const t of openOf("optymalizacja", "ot-wybieg")) {
      const length = Number(t.prompt.match(/\$(\d+)\$ m/)![1]);
      let best = 0;
      for (let x = 0; x <= length / 2; x += 0.25) best = Math.max(best, x * (length - 2 * x));
      expect(Number(t.answers[0]), t.id).toBeCloseTo(best, 6);
    }
  });

  /** Klucz P/F z ocen obu zdań (kolejność opcji jak na karcie odpowiedzi). */
  const tfKey = (first: boolean, second: boolean) => `1. ${first ? "P" : "F"} · 2. ${second ? "P" : "F"}`;
  const fracValue = (tex: string) => {
    const m = tex.match(/\\frac\{(\d+)\}\{(\d+)\}/);
    return m ? Number(m[1]) / Number(m[2]) : Number(tex);
  };

  it("P/F potęgi: prawdziwość zdań sprawdzona rachunkiem", () => {
    for (const q of closedOf("potegi-i-pierwiastki", "pf-potegi")) {
      const [, base, m, k] = q.prompt.match(/x = (\d)\^\{(\d+)\}\$ oraz \$y = \d\^\{(\d+)\}/)!.map(Number);
      const product = Number(q.prompt.match(/x \\cdot y\$ jest równy \$\d\^\{(\d+)\}/)![1]);
      const square = Number(q.prompt.match(/x\^2\$ jest równa \$\d\^\{(\d+)\}/)![1]);
      // x·y = b^(m+k), x² = b^(2m) – porównanie wykładników (ta sama podstawa)
      expect(base, q.id).toBeGreaterThan(1);
      expect(q.options[q.correct], q.id).toBe(tfKey(product === m + k, square === 2 * m));
    }
  });

  it("P/F trygonometria: cos i tg z sin dla kąta ostrego", () => {
    for (const q of closedOf("trygonometria", "pf-trygonometria")) {
      const sin = fracValue(q.prompt.match(/\\sin\\alpha = ([^$]+)\$/)![1]);
      const cos = Math.sqrt(1 - sin * sin);
      const shownCos = fracValue(q.prompt.match(/\\cos\\alpha = ([^$]+)\$/)![1]);
      const shownTg = fracValue(q.prompt.match(/\\operatorname\{tg\}\\alpha = ([^$]+)\$/)![1]);
      expect(q.options[q.correct], q.id).toBe(tfKey(Math.abs(shownCos - cos) < 1e-9, Math.abs(shownTg - sin / cos) < 1e-9));
    }
  });

  it("P/F odcinek: długość i środek z współrzędnych", () => {
    for (const q of closedOf("punkty-i-proste", "pf-odcinek")) {
      const [, x1, y1] = q.prompt.match(/A = \((-?\d+), (-?\d+)\)/)!.map(Number);
      const [, x2, y2] = q.prompt.match(/B = \((-?\d+), (-?\d+)\)/)!.map(Number);
      const length = Number(q.prompt.match(/jest równa \$(\d+)\$/)![1]);
      const [, mx, my] = q.prompt.match(/jest punkt \$\((-?\d+), (-?\d+)\)\$/)!.map(Number);
      const lengthTrue = Math.hypot(x2 - x1, y2 - y1) === length;
      const middleTrue = mx === (x1 + x2) / 2 && my === (y1 + y2) / 2;
      expect(q.options[q.correct], q.id).toBe(tfKey(lengthTrue, middleTrue));
    }
  });

  it("funkcja kwadratowa: współczynnik a pasuje do wierzchołka i punktu", () => {
    for (const t of openOf("funkcja-kwadratowa", "ot-kwadratowa-wzor")) {
      const [p, q] = t.prompt.match(/W = \((-?\d+), (-?\d+)\)/)!.slice(1).map(Number);
      const [x, y] = t.prompt.match(/A = \((-?\d+), (-?\d+)\)/)!.slice(1).map(Number);
      const a = Number(t.answers[0]);
      expect(a * (x - p) ** 2 + q, t.id).toBe(y);
    }
  });

  it("ciągi: wyraz i suma ciągu arytmetycznego", () => {
    for (const t of openOf("ciagi", "kr-wyraz-ciagu")) {
      const [a1, r] = [t.prompt.match(/a_1 = (-?\d+)/)![1], t.prompt.match(/r = (-?\d+)/)![1]].map(Number);
      const n = Number(t.prompt.match(/wyraz \$a_\{(\d+)\}/)![1]);
      let value = a1;
      for (let i = 1; i < n; i++) value += r;
      expect(Number(t.answers[0]), t.id).toBe(value);
    }
    for (const t of openOf("ciagi", "ot-suma-ciagu")) {
      const [[k, ak], [m, am]] = [...t.prompt.matchAll(/a_\{(\d+)\} = (-?\d+)/g)].map((x) => [Number(x[1]), Number(x[2])]);
      const n = Number(t.prompt.match(/sumę (\d+) początkowych/)![1]);
      const r = (am - ak) / (m - k);
      const a1 = ak - (k - 1) * r;
      let sum = 0;
      for (let i = 0; i < n; i++) sum += a1 + i * r;
      expect(Number(t.answers[0]), t.id).toBe(sum);
    }
  });
});
