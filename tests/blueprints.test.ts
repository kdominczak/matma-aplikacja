// Szablony arkuszy (układy prawdziwych matur) i metadane zadań – podstawa generatora arkuszy próbnych.
import { describe, expect, it } from "vitest";
import { BLUEPRINTS, CURRENT_BLUEPRINTS, SECTION_NAMES } from "@/data/blueprints";
import { examPool, FORMAT_FALLBACK, slotCandidates, TASK_OVERRIDES } from "@/data/task-meta";
import { topics } from "@/data/topics";
import { blueprintCoverage } from "@/lib/blueprint-coverage";
import type { Section } from "@/types/blueprint";

const SECTIONS = Object.keys(SECTION_NAMES) as Section[];

describe("szablony arkuszy", () => {
  it("od 2025 matura podstawowa ma 50 pkt, wcześniej 46 – zawsze 180 minut", () => {
    for (const b of BLUEPRINTS) {
      expect(b.slots.reduce((sum, s) => sum + s.points, 0), b.id).toBe(b.totalPoints);
      expect(b.durationMin).toBe(180);
      expect(b.totalPoints).toBe(b.year >= 2025 ? 50 : 46);
      expect(b.current).toBe(b.year >= 2025);
    }
    expect(CURRENT_BLUEPRINTS.length).toBeGreaterThanOrEqual(2);
  });

  it("pozycje są unikalne, po kolei i mają poprawne działy, typy i punkty", () => {
    for (const b of BLUEPRINTS) {
      const numbers = b.slots.map((s) => s.number);
      expect(new Set(numbers).size, b.id).toBe(numbers.length);
      const order = numbers.map((n) => n.split(".").map(Number));
      for (let i = 1; i < order.length; i++) {
        const [a, b2] = [order[i - 1], order[i]];
        expect(a[0] < b2[0] || (a[0] === b2[0] && (a[1] ?? 0) < (b2[1] ?? 0)), `${b.id}: ${numbers[i - 1]} → ${numbers[i]}`).toBe(true);
      }
      for (const slot of b.slots) {
        expect(slot.sections.length, `${b.id} ${slot.number}`).toBeGreaterThan(0);
        for (const s of slot.sections) expect(SECTIONS).toContain(s);
        expect(Object.keys(FORMAT_FALLBACK)).toContain(slot.format);
        expect(slot.points).toBeGreaterThanOrEqual(1);
        expect(slot.points).toBeLessThanOrEqual(5);
      }
    }
  });

  it("aktualny układ obejmuje wszystkie działy podstawy (I–XIII)", () => {
    for (const b of CURRENT_BLUEPRINTS) {
      const covered = new Set(b.slots.flatMap((s) => s.sections));
      expect(SECTIONS.filter((s) => !covered.has(s)), b.id).toEqual([]);
    }
  });

  it("zadania zamknięte (ABCD, P/F, wybór) to ok. połowa punktów, ABCD zawsze za 1 pkt", () => {
    for (const b of CURRENT_BLUEPRINTS) {
      const closed = b.slots.filter((s) => s.format === "abcd" || s.format === "truefalse").reduce((sum, s) => sum + s.points, 0);
      expect(closed / b.totalPoints, b.id).toBeGreaterThan(0.4);
      expect(closed / b.totalPoints, b.id).toBeLessThan(0.6);
      expect(b.slots.filter((s) => s.format === "abcd").every((s) => s.points === 1)).toBe(true);
    }
  });
});

describe("metadane zadań", () => {
  const pool = examPool();

  it("każdy dział ma dział podstawy programowej", () => {
    for (const topic of topics) expect(SECTIONS, topic.id).toContain(topic.section);
  });

  it("każde zadanie z puli ma spójne metadane", () => {
    expect(pool.length).toBeGreaterThan(150);
    for (const { task, topic, meta } of pool) {
      expect(meta.section, task.id).toBe(topic.section);
      expect(meta.points, task.id).toBe(task.points);
      expect(meta.format === "abcd" || meta.format === "truefalse" || meta.format === "choice", task.id).toBe(task.kind === "closed");
      expect(meta.minutes, task.id).toBeGreaterThan(0);
      expect(meta.expectedSuccess, task.id).toBeGreaterThan(0);
      expect(meta.expectedSuccess, task.id).toBeLessThan(1);
      expect(meta.family.length, task.id).toBeGreaterThan(0);
    }
  });

  it("pula nie zawiera testu na start ani duplikatów", () => {
    const ids = pool.map((p) => p.task.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => id.startsWith("start-"))).toBe(false);
  });

  it("poprawki metadanych dotyczą istniejących zadań", () => {
    const ids = new Set(pool.map((p) => p.task.id));
    for (const id of Object.keys(TASK_OVERRIDES)) expect(ids.has(id), id).toBe(true);
  });
});

describe("pokrycie szablonu", () => {
  it("kandydaci do pozycji mają ten sam dział i punkty, a dokładny typ jest oznaczony", () => {
    const slot = CURRENT_BLUEPRINTS[0].slots.find((s) => s.format === "truefalse")!;
    const candidates = slotCandidates(slot);
    expect(candidates.length).toBeGreaterThan(0);
    for (const { item, exact } of candidates) {
      expect(item.meta.section).toBe(slot.sections.at(-1));
      expect(item.meta.points).toBe(slot.points);
      expect(exact).toBe(item.meta.format === "truefalse");
    }
  });

  it("raport sumuje zapotrzebowanie wszystkich pozycji szablonu", () => {
    for (const b of CURRENT_BLUEPRINTS) {
      const c = blueprintCoverage(b);
      expect(c.groups.reduce((sum, g) => sum + g.demand, 0)).toBe(b.slots.length);
      expect(c.missingPoints + c.fallbackPoints).toBeLessThanOrEqual(b.totalPoints);
    }
  });
});
