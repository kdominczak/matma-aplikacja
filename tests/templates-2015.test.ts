// Szablony wzorowane na maturach formuły 2015 (src/data/templates/matura-2015.ts).
// NIEZALEŻNA weryfikacja: liczby odczytane z treści wariantu, wynik policzony siłowo – bez obliczeń szablonu.
// Każdy dystraktor musi być błędny.
import { describe, expect, it } from "vitest";
import { generatedTasks } from "@/data/templates";
import type { ClosedVariant } from "@/data/templates/engine";

function closedOf(topicId: string, family: string): ClosedVariant[] {
  const list = generatedTasks(topicId).closed.filter((q) => q.family === family);
  expect(list.length, family).toBe(8);
  return list;
}
const numbersIn = (text: string) => [...text.matchAll(/-?\d+/g)].map((m) => Number(m[0]));
/** „$25\%$”, „$-3$”, „$a = 7$”, „$30$ cm³” → liczba. */
const value = (option: string) => numbersIn(option)[0];

/** Dokładnie jedna opcja ma poprawną wartość – i to ta oznaczona w kluczu. */
function expectOnlyCorrect(q: ClosedVariant, truth: number) {
  for (const [key, option] of Object.entries(q.options)) {
    expect(value(option) === truth, `${q.id} ${key}: ${option} (prawda: ${truth})`).toBe(key === q.correct);
  }
}

describe("szablony z matur formuły 2015 (sprawdzone siłowo)", () => {
  it("procenty: podwyżka przywraca cenę sprzed obniżki", () => {
    for (const q of closedOf("potegi-i-pierwiastki", "pr-powrot-ceny")) {
      const p = Number(q.prompt.match(/obniżono o \$(\d+)\\%/)![1]);
      for (const [key, option] of Object.entries(q.options)) {
        const back = 100 * (1 - p / 100) * (1 + value(option) / 100);
        expect(Math.abs(back - 100) < 1e-9, `${q.id} ${key}`).toBe(key === q.correct);
      }
    }
  });

  it("wzory skróconego mnożenia: wartość trójmianu w x = √k + a", () => {
    for (const q of closedOf("wzory-skroconego-mnozenia", "ws-wartosc-kwadratu")) {
      const [, b, c, k, a] = q.prompt.match(/x\^2 - (\d+)x \+ (\d+)\$ dla \$x = \\sqrt\{(\d+)\} \+ (\d+)/)!.map(Number);
      const x = Math.sqrt(k) + a;
      expectOnlyCorrect(q, Math.round(x * x - b * x + c));
      expect(Math.abs(x * x - b * x + c - Math.round(x * x - b * x + c))).toBeLessThan(1e-9);
    }
  });

  it("przedziały: liczby całkowite w części wspólnej", () => {
    for (const q of closedOf("nierownosci-liniowe", "nl-calkowite-wspolne")) {
      const m = q.prompt.match(/\$\(-\\infty, (-?\d+)( \\rangle|\)).+?\$(\\langle |\()(-?\d+), \+\\infty\)\$/)!;
      const [b, closedB, closedA, a] = [Number(m[1]), m[2] === " \\rangle", m[3] === "\\langle ", Number(m[4])];
      let count = 0;
      for (let x = -50; x <= 50; x++) if ((closedB ? x <= b : x < b) && (closedA ? x >= a : x > a)) count++;
      expectOnlyCorrect(q, count);
    }
  });

  it("ciągi: różnica wyrazów a_n = c·n² i suma czterech wyrazów", () => {
    for (const q of closedOf("ciagi", "ci-roznica-kwadratowa")) {
      const [, c, m1, m] = q.prompt.match(/a_n = (\d+)n\^2.+a_\{(\d+)\} - a_\{(\d+)\}/)!.map(Number);
      expectOnlyCorrect(q, c * m1 * m1 - c * m * m);
    }
    for (const q of closedOf("ciagi", "ci-suma-czterech")) {
      const [, a4, d] = q.prompt.match(/czwarty wyraz jest równy \$(-?\d+)\$, a różnica tego ciągu jest równa \$(-?\d+)\$/)!.map(Number);
      let sum = 0;
      for (let i = 0; i < 4; i++) sum += a4 - i * d;
      expectOnlyCorrect(q, sum);
    }
  });

  it("ciągi: iloraz geometryczny z warunku – dokładnie jeden w przedziale", () => {
    const tasks = generatedTasks("ciagi").open.filter((t) => t.family === "ot-iloraz-geometryczny");
    expect(tasks.length).toBe(6);
    for (const t of tasks) {
      const m = t.prompt.match(/\$(\d+)a_1 - (\d+)a_2 \+ a_3 = 0\$.+\\langle ([\d{},]+); ([\d{},]+) \\rangle/)!;
      const [pr, s] = [Number(m[1]), Number(m[2])];
      const read = (x: string) => Number(x.replace("{,}", "."));
      const [lo, hi] = [read(m[3]), read(m[4])];
      const found: number[] = [];
      for (let q = 1; q <= 20; q += 0.5) if (pr - s * q + q * q === 0 && q >= lo && q <= hi) found.push(q);
      expect(found, t.id).toEqual([Number(t.answers[0])]);
      expect(t.points).toBe(4);
    }
  });

  it("statystyka: brakująca liczba z równości median, zestaw rosnący", () => {
    for (const q of closedOf("statystyka", "st-mediana-brakujaca")) {
      const [, list4, list5] = q.prompt.match(/liczby: \$(.+?)\$, tworzące.+pięciu danych: \$(.+?)\$\. Zatem/)!;
      const five = numbersIn(list5).sort((x, y) => x - y);
      expect(five.length).toBe(5);
      const [p, second, s] = numbersIn(list4);
      const a = 2 * five[2] - second;
      expect(p < second && second < a && a < s, q.id).toBe(true);
      expectOnlyCorrect(q, a);
    }
  });

  it("symetria względem początku: długość AB, pierwiastek w prostej postaci", () => {
    for (const q of closedOf("punkty-i-proste", "pp-symetria-poczatek")) {
      const [, x, y] = q.prompt.match(/A = \((-?\d+), (-?\d+)\)/)!.map(Number);
      const length = Math.hypot(2 * x, 2 * y);
      const read = (o: string) => {
        const m = o.match(/^\$(\d*)\\sqrt\{(\d+)\}\$$/);
        return m ? Number(m[1] || 1) * Math.sqrt(Number(m[2])) : value(o);
      };
      for (const [key, option] of Object.entries(q.options)) expect(Math.abs(read(option) - length) < 1e-9, `${q.id} ${key}`).toBe(key === q.correct);
      for (const square of [4, 9, 25, 49]) expect((x * x + y * y) % square, q.id).not.toBe(0);
    }
  });

  it("stereometria: sześcian z przekątnej i dwa stożki", () => {
    for (const q of closedOf("geometria-przestrzenna", "gp-szescian-przekatna")) {
      const a = Number(q.prompt.match(/długość \$(\d+)\\sqrt\{3\}/)![1]);
      expectOnlyCorrect(q, 6 * a * a);
    }
    for (const q of closedOf("geometria-przestrzenna", "gp-dwa-stozki")) {
      const [, hi, lo, small] = q.prompt.match(/równy \$(\d+) : (\d+)\$.+równa \$(\d+)\$ cm³/)!.map(Number);
      expectOnlyCorrect(q, small + (small * hi) / lo);
    }
  });

  it("funkcja kwadratowa: przedział monotoniczności sprawdzony na wartościach", () => {
    for (const q of closedOf("funkcja-kwadratowa", "fk-monotonicznosc")) {
      const m = q.prompt.match(/f\(x\) = (-?\d*)(.+?)\$ jest (malejąca|rosnąca)/)!;
      const a = m[1] === "" ? 1 : m[1] === "-" ? -1 : Number(m[1]);
      const roots = [...m[2].matchAll(/\(x ([+-]) (\d+)\)|x/g)].map((f) => (f[1] ? (f[1] === "+" ? -Number(f[2]) : Number(f[2])) : 0));
      expect(roots.length, q.id).toBe(2);
      const f = (x: number) => a * (x - roots[0]) * (x - roots[1]);
      const wantsDown = m[3] === "malejąca";
      const monotonic = (from: number, to: number) => {
        for (let x = from; x < to; x += 0.25) if (wantsDown ? f(x + 0.25) >= f(x) : f(x + 0.25) <= f(x)) return false;
        return true;
      };
      for (const [key, option] of Object.entries(q.options)) {
        const bound = value(option);
        const fits = option.includes("+\\infty") ? monotonic(bound, bound + 30) : monotonic(bound - 30, bound);
        expect(fits, `${q.id} ${key}: ${option}`).toBe(key === q.correct);
      }
    }
  });

  it("trygonometria: tangens z warunku", () => {
    const tasks = generatedTasks("trygonometria").open.filter((t) => t.family === "kr-tangens-z-ilorazu");
    expect(tasks.length).toBe(6);
    for (const t of tasks) {
      const [, b, c, d] = t.prompt.match(/\\frac\{(\d+)\\sin\\alpha \+ (\d+)\\cos\\alpha\}\{\\cos\\alpha\} = (\d+)/)!.map(Number);
      const [num, den = 1] = t.answers[0].split("/").map(Number);
      const tg = num / den;
      // kąt o tym tangensie naprawdę spełnia warunek
      const angle = Math.atan(tg);
      expect(Math.abs((b * Math.sin(angle) + c * Math.cos(angle)) / Math.cos(angle) - d), t.id).toBeLessThan(1e-9);
    }
  });
});
