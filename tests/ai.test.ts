// Korepetytor: co dokładnie trafia do Groq (atrapa fetch) i jak przygotowujemy załączniki.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { streamAi, type ChatMessage } from "@/lib/ai";
import { VISION_MODEL } from "@/lib/ai-settings";
import { MAX_PDF_CHARS, parsePageRange, pdfContext, pdfHasContent, type PdfAttachment } from "@/lib/attachments";

type Part = { type: string; text?: string; image_url?: { url: string } };
type Body = { model: string; messages: { role: string; content: string | Part[] }[]; reasoning_format?: string; max_completion_tokens: number };

const bodies: Body[] = [];
const img = (n: number) => `data:image/jpeg;base64,IMG${n}`;

localStorage.setItem("CapacitorStorage.ai.v1", JSON.stringify({ apiKey: "gsk_test", model: "llama-3.3-70b-versatile" }));

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
  it("bez obrazów: model wybrany przez ucznia, treść jako tekst", async () => {
    const { reply, body } = await ask([{ role: "user", content: "Ile to 2+2?" }]);
    expect(reply).toBe("OK");
    expect(body.model).toBe("llama-3.3-70b-versatile");
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

  it("brak dostępu do modelu z obrazami → jasny komunikat", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ error: { code: "model_not_found" } }), { status: 404 }));
    await expect(ask([{ role: "user", content: "x", images: [img(1)] }])).rejects.toThrow(/tekstem/);
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
