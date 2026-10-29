// Korepetytor: co dokładnie trafia do funkcji `ai` (atrapa fetch) i jak przygotowujemy załączniki.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamAi, type ChatMessage } from "@/lib/ai";
import { TEXT_MODEL, VISION_MODEL } from "@/lib/ai-config";
import { MAX_PDF_CHARS, parsePageRange, pdfContext, pdfHasContent, type PdfAttachment } from "@/lib/attachments";

type Part = { type: string; text?: string; image_url?: { url: string } };
type Body = { model: string; messages: { role: string; content: string | Part[] }[]; reasoning_format?: string; include_reasoning?: boolean; max_completion_tokens: number };

const bodies: Body[] = [];
const img = (n: number) => `data:image/jpeg;base64,IMG${n}`;

vi.mock("@/lib/ai-config", async (original) => ({ ...(await original<typeof import("@/lib/ai-config")>()), AI_ENABLED: true }));
vi.mock("@/lib/premium", async (original) => ({
  ...(await original<typeof import("@/lib/premium")>()),
  AI_FUNCTION_URL: "https://example.supabase.co/functions/v1/ai",
  aiRequestHeaders: async () => ({ Authorization: "Bearer test", "Content-Type": "application/json" }),
}));

beforeEach(() => {
  bodies.length = 0;
  vi.stubGlobal("fetch", async (_url: string, init: { body: string }) => {
    bodies.push(JSON.parse(init.body));
    return new Response('data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n', { status: 200 });
  });
});

async function ask(messages: ChatMessage[]) {
  const reply = await streamAi({ mode: "tutor", messages }, () => {});
  return { reply, body: bodies.at(-1)! };
}

describe("zapytania korepetytora", () => {
  it("bez obrazów: model tekstowy z ukrytym rozumowaniem, treść jako tekst", async () => {
    const { reply, body } = await ask([{ role: "user", content: "Ile to 2+2?" }]);
    expect(reply).toBe("OK");
    expect(body.model).toBe(TEXT_MODEL);
    expect(body.include_reasoning).toBe(false);
    expect(typeof body.messages[1].content).toBe("string");
  });

  it("ze zdjęciem: model z obsługą obrazów, ukryte rozumowanie, obraz jako image_url", async () => {
    const { body } = await ask([{ role: "user", content: "Pomóż", images: [img(1)], context: "[Plik PDF] Zadanie 3", files: [{ name: "a.pdf", detail: "str. 1" }] }]);
    expect(body.model).toBe(VISION_MODEL);
    expect(body.reasoning_format).toBe("hidden");
    const parts = body.messages[1].content as Part[];
    expect(parts[0].text).toContain("Zadanie 3");
    expect(parts[1].image_url?.url).toBe(img(1));
    expect(JSON.stringify(body)).not.toContain('"files"'); // opis plików jest tylko do dymka
  });

  it("najwyżej 3 obrazy na zapytanie – najnowsze mają pierwszeństwo", async () => {
    const { body } = await ask([
      { role: "user", content: "stare", images: [img(1), img(2)] },
      { role: "assistant", content: "odp" },
      { role: "user", content: "nowe", images: [img(3), img(4)] },
    ]);
    expect(JSON.stringify(body.messages).match(/IMG\d/g)).toEqual(["IMG1", "IMG3", "IMG4"]);
    expect((body.messages[1].content as Part[])[0].text).toContain("1 wcześniej załączone");
  });

  it("pytanie uzupełniające nadal widzi wcześniejsze zdjęcie", async () => {
    const { body } = await ask([
      { role: "user", content: "zdjęcie", images: [img(7)] },
      { role: "assistant", content: "odp" },
      { role: "user", content: "a dlaczego?" },
    ]);
    expect(body.model).toBe(VISION_MODEL);
    expect(JSON.stringify(body.messages)).toContain("IMG7");
  });

  it("za duże załączniki (Groq odrzucił obraz) → jasny komunikat", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: "upstream", status: 413 }), { status: 502 }));
    await expect(ask([{ role: "user", content: "x", images: [img(1)] }])).rejects.toThrow(/Załączniki są za duże/);
  });
});

describe("ocena rozwiązania (grade)", () => {
  it("tryb grade (prompt egzaminatora dokłada serwer), odczyt punktów z odpowiedzi", async () => {
    const { gradeSolution } = await import("@/lib/ai");
    const json = JSON.stringify({ steps: [{ points: 1, reason: "a" }, { points: 0, reason: "b" }] });
    vi.stubGlobal("fetch", async (_url: string, init: { body: string }) => {
      bodies.push(JSON.parse(init.body));
      return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: json } }] })}\n\ndata: [DONE]\n\n`, { status: 200 });
    });
    const task = { id: "t", prompt: "x", points: 2, answers: ["1"], solution: [{ step: "a", points: 1 }, { step: "b", points: 1 }] };
    expect(await gradeSolution(task, "moje rozwiązanie")).toEqual({ steps: [1, 0], reasons: ["a", "b"] });
    const body = bodies.at(-1)!;
    expect(body.model).toBe(TEXT_MODEL);
    expect((body as unknown as { purpose: string }).purpose).toBe("grade");
    expect(body.messages).toHaveLength(1);
    expect(String(body.messages[0].content)).toContain("<rozwiazanie_ucznia>\nmoje rozwiązanie");
  });
});

describe("PDF jako tekst", () => {
  const pdf: PdfAttachment = {
    kind: "pdf",
    id: "1",
    name: "arkusz.pdf",
    file: new Blob(),
    pageCount: 3,
    pages: ["Zadanie 1. Oblicz 2^10.", "", "Zadanie 3. Suma ciągu."],
    from: 1,
    to: 3,
    scans: [],
  };

  it("kontekst ma nazwę pliku, zakres stron i znaczniki stron (bez pustych)", () => {
    const text = pdfContext(pdf);
    expect(text).toContain("„arkusz.pdf”, strony 1–3 z 3");
    expect(text).toContain("--- strona 3 ---");
    expect(text).not.toContain("--- strona 2 ---");
  });

  it("pusta strona bez miejsca na skan nie ma treści", () => {
    expect(pdfHasContent(pdf)).toBe(true);
    expect(pdfHasContent({ ...pdf, from: 2, to: 2 })).toBe(false);
  });

  it("długi plik jest przycinany do limitu z notką", () => {
    const long = { ...pdf, pages: ["x".repeat(10_000), "y".repeat(10_000), "z".repeat(10_000)] };
    const text = pdfContext(long);
    expect(text.length).toBeLessThan(MAX_PDF_CHARS + 600);
    expect(text).toContain("dalsza część pominięta");
  });

  it.each([
    ["3", { from: 3, to: 3 }],
    ["2-3", { from: 2, to: 3 }],
    ["2–9", { from: 2, to: 3 }],
    ["0", null],
    ["3-1", null],
    ["5", null],
    ["abc", null],
  ])("zakres stron „%s”", (input, expected) => {
    expect(parsePageRange(input, 3)).toEqual(expected);
  });
});

describe("tryb pomocy korepetytora", () => {
  it("wybrany tryb trafia do promptu systemowego; domyślnie naprowadzanie", async () => {
    const { streamAi } = await import("@/lib/ai");
    await streamAi({ mode: "tutor", messages: [{ role: "user", content: "x" }], style: "sprawdz" }, () => {});
    expect(String(bodies.at(-1)!.messages[0].content)).toContain("SPRAWDZENIE ROZWIĄZANIA");
    await streamAi({ mode: "tutor", messages: [{ role: "user", content: "x" }] }, () => {});
    expect(String(bodies.at(-1)!.messages[0].content)).toContain("NAPROWADZANIE");
  });
});
