// Szablony działów I–IX dodane 4.11.2026 (logarytmy, wartość bezwzględna, wzory skróconego mnożenia, nierówności,
// równania wymierne, przekształcenia wykresów, funkcja wykładnicza, równanie okręgu, tw. cosinusów, trójkąty).
// NIEZALEŻNA weryfikacja: liczby i wyrażenia odczytane z treści wariantu, wynik policzony siłowo (siatka punktów,
// przeszukiwanie liczb całkowitych, wartości funkcji) – bez korzystania z obliczeń szablonu.
import { describe, expect, it } from "vitest";
import { generatedTasks } from "@/data/templates";
import type { ClosedVariant } from "@/data/templates/engine";
import { matchesAnswer } from "@/lib/calc";

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

/** Wyrażenie z treści (LaTeX) → funkcja JS zmiennej x: „(x + 3)^2 - 2”, „\frac{1}{x - 1}”, „|x + 2|”, „4x^2 - 20x + 25”. */
function jsFn(tex: string): (x: number) => number {
  const expr = tex
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))")
    .replace(/\|([^|]*)\|/g, "Math.abs($1)")
    .replace(/(\d)\s*x/g, "$1*x")
    .replace(/\)\s*\(/g, ")*(")
    .replace(/x\s*\(/g, "x*(")
    .replace(/\)\s*x/g, ")*x")
    .replace(/(\d)\s*\(/g, "$1*(")
    .replace(/([\w)])\^\{?(\d)\}?/g, "$1**$2")
    // JS nie pozwala na „-x**3” – unarny minus jako odejmowanie od zera
    .replace(/(^|[(*/])\s*-/g, "$1 0-");
  return new Function("x", `return ${expr};`) as (x: number) => number;
}

/** Zbiór w zapisie szkolnym („⟨-8, 2⟩”, „(-∞, -4⟩ ∪ ⟨-1, +∞)”) → przynależność liczby. */
function intervalSet(option: string): (x: number) => boolean {
  const pieces = option
    .replace(/\$/g, "")
    .split("\\cup")
    .map((piece) => {
      const m = piece.trim().match(/^(\\langle |\()(-\\infty|-?\d+), (\+\\infty|-?\d+)( \\rangle|\))$/);
      if (!m) throw new Error(`Nie rozumiem przedziału: ${piece}`);
      const a = m[2] === "-\\infty" ? -Infinity : Number(m[2]);
      const b = m[3] === "+\\infty" ? Infinity : Number(m[3]);
      const [closedA, closedB] = [m[1] === "\\langle ", m[4] === " \\rangle"];
      return (x: number) => (closedA ? x >= a : x > a) && (closedB ? x <= b : x < b);
    });
  return (x) => pieces.some((inside) => inside(x));
}

const RELATIONS: Record<string, (u: number, v: number) => boolean> = {
  "\\le": (u, v) => u <= v,
  "<": (u, v) => u < v,
  "\\ge": (u, v) => u >= v,
  ">": (u, v) => u > v,
};
/** Siatka co 1/4 – trafia w końce przedziałów (całkowite) i w punkty między nimi. */
const GRID = Array.from({ length: 241 }, (_, i) => -30 + i / 4);
const sameSet = (option: string, truth: (x: number) => boolean) => GRID.every((x) => intervalSet(option)(x) === truth(x));
const wrongOptions = (q: ClosedVariant) => (Object.keys(q.options) as (keyof typeof q.options)[]).filter((k) => k !== q.correct).map((k) => q.options[k]);

/** Liczba z opcji: „$7$”, „$-\frac{9}{8}$”, „$\sqrt{20}$”, „$39^\circ$”. */
function numberOf(option: string): number {
  const tex = option.replace(/\$|\^\\circ/g, "").trim();
  const sqrt = tex.match(/^\\sqrt\{(\d+)\}$/);
  if (sqrt) return Math.sqrt(Number(sqrt[1]));
  const f = tex.match(/^(-?)\\frac\{(\d+)\}\{(\d+)\}$/);
  if (f) return (f[1] ? -1 : 1) * (Number(f[2]) / Number(f[3]));
  return Number(tex);
}
const correctValue = (q: ClosedVariant) => numberOf(q.options[q.correct]);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe("matematyka szablonów działów I–IX (sprawdzona siłowo)", () => {
  it("logarytmy: różnica i suma logarytmów", () => {
    for (const q of closedOf("logarytmy", "lg-roznica")) {
      const [, b, x, y] = q.prompt.match(/\\log_\{(\d+)\} (\d+) - \\log_\{\d+\} (\d+)/)!.map(Number);
      const value = Math.log(x / y) / Math.log(b);
      expect(near(correctValue(q), value), q.id).toBe(true);
      for (const o of wrongOptions(q)) if (!o.includes("log")) expect(near(numberOf(o), value), q.id).toBe(false);
    }
    for (const t of openOf("logarytmy", "kr-log-suma")) {
      const [, b, x, y] = t.prompt.match(/\\log_\{(\d+)\} (\d+) \+ \\log_\{\d+\} (\d+)/)!.map(Number);
      expect(near(Number(t.answers[0]), Math.log(x * y) / Math.log(b)), t.id).toBe(true);
    }
  });

  it("wartość bezwzględna: suma rozwiązań równania i zbiór rozwiązań nierówności", () => {
    for (const q of closedOf("wartosc-bezwzgledna", "wb-rownanie")) {
      const [, expr, c] = q.prompt.match(/\$\|(.+)\| = (\d+)\$/)!;
      const f = jsFn(`|${expr}|`);
      let sum = 0;
      for (let x = -40; x <= 40; x++) if (f(x) === Number(c)) sum += x;
      expect(correctValue(q), q.id).toBe(sum);
    }
    for (const q of closedOf("wartosc-bezwzgledna", "wb-nierownosc")) {
      const [, expr, rel, c] = q.prompt.match(/\$\|(.+)\| (\\le|<|\\ge|>) (\d+)\$/)!;
      const truth = (x: number) => RELATIONS[rel](jsFn(`|${expr}|`)(x), Number(c));
      expect(sameSet(q.options[q.correct], truth), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(sameSet(o, truth), `${q.id}: ${o}`).toBe(false);
    }
  });

  it("wzory skróconego mnożenia: rozwinięcie kwadratu i wartość z pierwiastkiem", () => {
    for (const q of closedOf("wzory-skroconego-mnozenia", "ws-kwadrat")) {
      const square = jsFn(q.prompt.match(/wyrażenie \$(.+)\$ jest/)![1]);
      const equal = (o: string) => [-2, 1, 3, 5].every((x) => jsFn(o.replace(/\$/g, ""))(x) === square(x));
      expect(equal(q.options[q.correct]), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(equal(o), `${q.id}: ${o}`).toBe(false);
    }
    for (const t of openOf("wzory-skroconego-mnozenia", "kr-wzory-pierwiastek")) {
      const diff = t.prompt.match(/\(\\sqrt\{(\d+)\} - (\d+)\)\(\\sqrt\{\d+\} \+ \d+\)/);
      const sum = t.prompt.match(/\(\\sqrt\{(\d+)\} \+ (\d+)\)\^2 - (\d+)\\sqrt/);
      const value = diff
        ? (Math.sqrt(Number(diff[1])) - Number(diff[2])) * (Math.sqrt(Number(diff[1])) + Number(diff[2]))
        : (Math.sqrt(Number(sum![1])) + Number(sum![2])) ** 2 - Number(sum![3]) * Math.sqrt(Number(sum![1]));
      expect(Math.abs(Number(t.answers[0]) - value), t.id).toBeLessThan(1e-9);
    }
  });

  it("nierówności liniowe: zbiór rozwiązań i najmniejsza liczba całkowita", () => {
    for (const q of closedOf("nierownosci-liniowe", "nl-zbior")) {
      const [, left, rel, right] = q.prompt.match(/nierówności \$(.+) (\\le|<|\\ge|>) (.+)\$ jest/)!;
      const truth = (x: number) => RELATIONS[rel](jsFn(left)(x), jsFn(right)(x));
      expect(sameSet(q.options[q.correct], truth), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(sameSet(o, truth), `${q.id}: ${o}`).toBe(false);
    }
    for (const t of openOf("nierownosci-liniowe", "kr-najmniejsza-calkowita")) {
      const [, left, rel, right] = t.prompt.match(/nierówność \$(.+) (>|\\ge) (-?\d+)\$/)!;
      let x = -400;
      while (!RELATIONS[rel](jsFn(left)(x), Number(right))) x++;
      expect(Number(t.answers[0]), t.id).toBe(x);
    }
  });

  it("nierówności kwadratowe: zbiór rozwiązań i liczba rozwiązań całkowitych", () => {
    for (const q of closedOf("nierownosci-kwadratowe", "nk-zbior")) {
      const [, left, rel] = q.prompt.match(/nierówności \$(.+) (\\le|<|\\ge|>) 0\$/)!;
      const truth = (x: number) => RELATIONS[rel](jsFn(left)(x), 0);
      expect(sameSet(q.options[q.correct], truth), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(sameSet(o, truth), `${q.id}: ${o}`).toBe(false);
    }
    for (const t of openOf("nierownosci-kwadratowe", "kr-nk-calkowite")) {
      const [, left, rel] = t.prompt.match(/nierówność \$(.+) (<|\\le) 0\$/)!;
      let count = 0;
      for (let x = -100; x <= 100; x++) if (RELATIONS[rel](jsFn(left)(x), 0)) count++;
      expect(Number(t.answers[0]), t.id).toBe(count);
    }
  });

  it("równania wymierne: rozwiązanie i liczba rozwiązań (z dziedziną)", () => {
    for (const t of openOf("rownania-wymierne", "kr-wymierne")) {
      const [, num, den, c] = t.prompt.match(/\$\\frac\{(.+)\}\{(.+)\} = (-?\d+)\$/)!;
      const solutions = [];
      for (let x = -60; x <= 60; x++) if (jsFn(den)(x) !== 0 && jsFn(num)(x) === Number(c) * jsFn(den)(x)) solutions.push(x);
      expect(solutions, t.id).toEqual([Number(t.answers[0])]);
    }
    for (const q of closedOf("rownania-wymierne", "wm-liczba-rozwiazan")) {
      const [, num, den] = q.prompt.match(/\$\\frac\{(.+)\}\{(.+)\} = 0\$/)!;
      let count = 0;
      for (let x = -60; x <= 60; x++) if (jsFn(den)(x) !== 0 && jsFn(num)(x) === 0) count++;
      expect(q.options[q.correct], q.id).toBe(["nie ma rozwiązań", "ma dokładnie jedno rozwiązanie", "ma dokładnie dwa rozwiązania"][count]);
    }
  });

  it("przekształcenia wykresów: wektor przesunięcia i wartość po przesunięciu", () => {
    const vector = (o: string) => o.match(/\[(-?\d+), (-?\d+)\]/)!.slice(1).map(Number);
    for (const q of closedOf("przeksztalcenia-wykresow", "pw-wektor")) {
      const [, g, f] = q.prompt.match(/\$g\(x\) = (.+)\$ otrzymano, przesuwając wykres funkcji \$f\(x\) = (.+)\$ o wektor/)!;
      const shifted = (o: string) => {
        const [p, s] = vector(o);
        return [0.5, 1.7, 4.2, -2.3].every((x) => near(jsFn(g)(x), jsFn(f)(x - p) + s));
      };
      expect(shifted(q.options[q.correct]), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(shifted(o), `${q.id}: ${o}`).toBe(false);
    }
    for (const t of openOf("przeksztalcenia-wykresow", "kr-przesuniecie-wartosc")) {
      const [p, s] = vector(t.prompt);
      const x = Number(t.prompt.match(/g\((-?\d+)\)\$/)![1]);
      expect(Number(t.answers[0]), t.id).toBe((x - p) ** 2 + s);
    }
  });

  it("funkcja wykładnicza: wartość i podstawa z punktu wykresu", () => {
    for (const q of closedOf("funkcja-wykladnicza-i-logarytmiczna", "fw-wartosc")) {
      const [, b, exponent, rest] = q.prompt.match(/f\(x\) = (\d)\^\{([^}]*)\}([^$]*)\$/)!;
      const x0 = Number(q.prompt.match(/argumentu \$(-?\d+)\$/)![1]);
      const value = Number(b) ** jsFn(exponent)(x0) + (rest.trim() ? Number(rest.replace(/\s/g, "")) : 0);
      expect(near(correctValue(q), value), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(near(numberOf(o), value), `${q.id}: ${o}`).toBe(false);
    }
    for (const q of closedOf("funkcja-wykladnicza-i-logarytmiczna", "fw-podstawa")) {
      const [, k, y] = q.prompt.match(/P = \((-?\d+), (.+)\)\$/)!;
      const yValue = numberOf(`$${y}$`);
      const passes = (o: string) => numberOf(o) > 0 && near(numberOf(o) ** Number(k), yValue);
      expect(passes(q.options[q.correct]) && correctValue(q) !== 1, q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(passes(o), `${q.id}: ${o}`).toBe(false);
    }
  });

  it("równanie okręgu: środek i promień, promień z punktu", () => {
    for (const q of closedOf("rownanie-okregu", "ok-srodek-promien")) {
      const [, left, s] = q.prompt.match(/równaniu \$(.+) = (\d+)\$/)!;
      const [, a, b, radius] = q.options[q.correct].match(/S = \((-?\d+), (-?\d+)\),\\ r = (.+)\$/)!;
      // lewa strona jako funkcja punktu: y podstawiamy liczbą, x zostaje zmienną
      const circle = (x: number, y: number) => jsFn(left.replace(/y/g, `(${y})`))(x);
      const r = numberOf(`$${radius}$`);
      expect(circle(Number(a), Number(b)), q.id).toBe(0); // środek
      expect(near(circle(Number(a) + r, Number(b)), Number(s)), q.id).toBe(true); // punkt odległy o r leży na okręgu
      for (const o of wrongOptions(q)) {
        const [, oa, ob, oradius] = o.match(/S = \((-?\d+), (-?\d+)\),\\ r = (.+)\$/)!;
        const ok = circle(Number(oa), Number(ob)) === 0 && near(numberOf(`$${oradius}$`) ** 2, Number(s));
        expect(ok, `${q.id}: ${o}`).toBe(false);
      }
    }
    for (const t of openOf("rownanie-okregu", "kr-promien-okregu")) {
      const [[sx, sy], [px, py]] = [...t.prompt.matchAll(/= \((-?\d+), (-?\d+)\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
      expect(Number(t.answers[0]), t.id).toBe(Math.hypot(px - sx, py - sy));
    }
  });

  it("twierdzenie cosinusów i pole trójkąta z sinusem", () => {
    for (const t of openOf("twierdzenie-cosinusow", "kr-pole-sinus")) {
      const [a, b, angle] = [...t.prompt.matchAll(/\$(\d+)(?:\^\\circ)?\$/g)].map((m) => Number(m[1]));
      expect(matchesAnswer(String((a * b * Math.sin((angle * Math.PI) / 180)) / 2), t.answers), t.id).toBe(true);
    }
    for (const t of openOf("twierdzenie-cosinusow", "kr-cosinusow")) {
      const [a, b] = [...t.prompt.matchAll(/\| = (\d+)/g)].map((m) => Number(m[1]));
      const angle = Number(t.prompt.match(/\$(\d+)\^\\circ\$/)![1]);
      const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((angle * Math.PI) / 180));
      expect(near(Number(t.answers[0]), c), t.id).toBe(true);
    }
  });

  it("rozszerzenie: wielomiany (reszta, parametr z pierwiastka)", () => {
    for (const t of openOf("rz-wielomiany", "rz-reszta")) {
      const [, w, divisor] = t.prompt.match(/W\(x\) = (.+)\$ przez dwumian \$(.+)\$/)!;
      // twierdzenie o reszcie: W(x) = Q(x)(x − p) + R, więc W(x) − R zeruje się w pierwiastku dwumianu
      const p = -jsFn(divisor)(0);
      expect(jsFn(w)(p) - Number(t.answers[0]), t.id).toBe(0);
    }
    for (const t of openOf("rz-wielomiany", "rz-pierwiastek-parametr")) {
      const [, p, w] = t.prompt.match(/Liczba \$(-?\d+)\$ jest pierwiastkiem wielomianu \$W\(x\) = (.+)\$\. Oblicz/)!;
      const withM = (m: number) => jsFn(w.replace(/mx\^2/, `(${m})*x^2`));
      expect(withM(Number(t.answers[0]))(Number(p)), t.id).toBe(0);
    }
  });

  it("rozszerzenie: pochodna (wartość i minimum lokalne)", () => {
    for (const t of openOf("rz-pochodna", "rz-pochodna-wartosc")) {
      const [, f, x0] = t.prompt.match(/f\(x\) = (.+)\$\. Oblicz \$f'\((-?\d+)\)/)!;
      const h = 1e-4;
      const derivative = (jsFn(f)(Number(x0) + h) - jsFn(f)(Number(x0) - h)) / (2 * h);
      expect(Math.abs(derivative - Number(t.answers[0])), t.id).toBeLessThan(1e-4);
    }
    for (const t of openOf("rz-pochodna", "rz-minimum")) {
      const f = jsFn(t.prompt.match(/f\(x\) = (.+)\$\. Wyznacz/)![1]);
      const minima = [];
      for (let x = -20; x <= 20; x++) if (f(x) < f(x - 0.01) && f(x) < f(x + 0.01)) minima.push(x);
      expect(minima, t.id).toEqual([Number(t.answers[0])]);
    }
  });

  it("rozszerzenie: granica ciągu, dwumian Newtona, prawdopodobieństwo warunkowe", () => {
    const fraction = (answer: string) => answer.split("/").map(Number).reduce((a, b) => a / b);
    for (const t of openOf("rz-granice", "rz-granica")) {
      const [, num, den] = t.prompt.match(/\\frac\{(.+)\}\{(.+)\}\$/)!;
      const term = (n: number) => jsFn(num.replace(/n/g, "x"))(n) / jsFn(den.replace(/n/g, "x"))(n);
      expect(Math.abs(term(1e7) - fraction(t.answers[0])), t.id).toBeLessThan(1e-5);
    }
    for (const t of openOf("rz-kombinatoryka", "rz-newton")) {
      const k = Number(t.prompt.match(/x\^\{(\d+)\}/)![1]);
      const [, inner, n] = t.prompt.match(/\$\((.+)\)\^\{(\d+)\}\$/)!;
      const a = jsFn(inner)(0);
      // mnożenie wielomianów: (x + a)^n, współczynniki od x^0
      let coefs = [1];
      for (let i = 0; i < Number(n); i++) coefs = [...coefs, 0].map((c, j) => c * a + (j > 0 ? coefs[j - 1] : 0));
      expect(Number(t.answers[0]), t.id).toBe(coefs[k]);
    }
    for (const t of openOf("rz-prawdopodobienstwo", "rz-warunkowe")) {
      const k = Number(t.prompt.match(/wypadło \$(\d+)\$ oczek/)![1]);
      const s = Number(t.prompt.match(/jest równa \$(\d+)\$/)![1]);
      let [given, both] = [0, 0];
      for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (x + y === s) [given, both] = [given + 1, both + (x === k ? 1 : 0)];
      expect(near(fraction(t.answers[0]), both / given), t.id).toBe(true);
    }
  });

  it("rozszerzenie: trygonometria, odległość punktu od prostej, parametr, twierdzenie sinusów", () => {
    const fraction = (answer: string) => answer.split("/").map(Number).reduce((a, b) => a / b);
    for (const t of openOf("rz-trygonometria", "rz-sin2a")) {
      const sin = numberOf(`$${t.prompt.match(/\\sin\\alpha = (.+?)\$/)![1]}$`);
      const alpha = Math.asin(sin);
      const value = t.prompt.includes("\\cos 2\\alpha") ? Math.cos(2 * alpha) : Math.sin(2 * alpha);
      expect(near(fraction(t.answers[0]), value), t.id).toBe(true);
    }
    for (const t of openOf("rz-geometria-analityczna", "rz-odleglosc")) {
      const [x0, y0] = t.prompt.match(/P = \((-?\d+), (-?\d+)\)/)!.slice(1).map(Number);
      const line = t.prompt.match(/równaniu \$(.+) = 0\$/)![1];
      // A, B, C z wartości lewej strony w punktach (0,0), (1,0), (0,1)
      const L = (x: number, y: number) => jsFn(line.replace(/y/g, `(${y})`))(x);
      const [C, A, B] = [L(0, 0), L(1, 0) - L(0, 0), L(0, 1) - L(0, 0)];
      // odległość siłowo: najbliższy punkt prostej na gęstej siatce parametru
      const [dx, dy] = [-B, A];
      const foot = (-(A * x0 + B * y0 + C)) / (A * A + B * B);
      const [fx, fy] = [x0 + A * foot, y0 + B * foot];
      let best = Infinity;
      for (let s = -2; s <= 2; s += 0.001) best = Math.min(best, Math.hypot(fx + s * dx - x0, fy + s * dy - y0));
      expect(near(L(fx, fy), 0) && Math.abs(best - Number(t.answers[0])) < 1e-6, t.id).toBe(true);
    }
    for (const t of openOf("rz-parametr", "rz-parametr-delta")) {
      const b = jsFn(t.prompt.match(/równanie \$(.+) \+ m = 0\$/)![1])(1) - 1;
      let m = 200;
      while (b * b - 4 * m <= 0) m--;
      expect(Number(t.answers[0]), t.id).toBe(m);
    }
    for (const t of openOf("rz-planimetria", "rz-sinusow")) {
      const [, k, root3] = t.prompt.match(/długość \$(\d+)(\\sqrt\{3\})?\$/)!;
      const a = Number(k) * (root3 ? Math.sqrt(3) : 1);
      const angle = Number(t.prompt.match(/\$(\d+)\^\\circ\$/)![1]);
      expect(near(Number(t.answers[0]), a / (2 * Math.sin((angle * Math.PI) / 180))), t.id).toBe(true);
    }
  });

  it("trójkąty i czworokąty: Pitagoras, kąty w trójkącie równoramiennym, podobieństwo, romb", () => {
    for (const q of closedOf("trojkaty-i-czworokaty", "tc-pitagoras")) {
      const [x, y] = [...q.prompt.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]));
      const value = q.prompt.startsWith("Przeciwprostokątna") ? Math.sqrt(x * x - y * y) : Math.hypot(x, y);
      expect(near(correctValue(q), value), q.id).toBe(true);
      for (const o of wrongOptions(q)) expect(near(numberOf(o), value), `${q.id}: ${o}`).toBe(false);
    }
    for (const q of closedOf("trojkaty-i-czworokaty", "tc-katy-rownoramienny")) {
      const given = Number(q.prompt.match(/\$(\d+)\^\\circ\$/)![1]);
      // dany kąt przy wierzchołku C → szukany przy podstawie, i odwrotnie (β + β + γ = 180°)
      const value = q.prompt.includes("kąt $ACB$ ma miarę $") ? (180 - given) / 2 : 180 - 2 * given;
      expect(correctValue(q), q.id).toBe(value);
      for (const o of wrongOptions(q)) expect(numberOf(o), `${q.id}: ${o}`).not.toBe(value);
    }
    for (const t of openOf("trojkaty-i-czworokaty", "kr-podobienstwo-pole")) {
      const x = Number(t.prompt.match(/\|AB\| = (\d+)/)![1]);
      const y = Number(t.prompt.match(/\|DE\| = (\d+)/)![1]);
      const P = Number(t.prompt.match(/ABC\$ jest równe \$(\d+)\$/)![1]);
      expect(near(Number(t.answers[0]), P * (y / x) ** 2), t.id).toBe(true);
    }
    for (const t of openOf("trojkaty-i-czworokaty", "kr-romb-bok")) {
      const [d1, d2] = [...t.prompt.matchAll(/\$(\d+)\$/g)].map((m) => Number(m[1]));
      expect(Number(t.answers[0]), t.id).toBe(Math.hypot(d1 / 2, d2 / 2));
    }
  });
});
