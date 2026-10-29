// Korepetytor w trybie serwerowym (funkcja `ai`): limit, błędy Groq i ponowienie po wygasłej sesji.
import { beforeEach, describe, expect, it, vi } from "vitest";

const headerCalls: boolean[] = [];

vi.mock("@/lib/ai-config", async (original) => ({ ...(await original<typeof import("@/lib/ai-config")>()), AI_ENABLED: true }));

vi.mock("@/lib/premium", async (original) => ({
  ...(await original<typeof import("@/lib/premium")>()),
  AI_FUNCTION_URL: "https://example.supabase.co/functions/v1/ai",
  aiRequestHeaders: async (refresh = false) => {
    headerCalls.push(refresh);
    return { Authorization: `Bearer ${refresh ? "nowy" : "stary"}`, "Content-Type": "application/json" };
  },
  noteAiRemaining: () => {},
}));

const { streamAi } = await import("@/lib/ai");
const { AiLimitError } = await import("@/lib/premium");

const ok = () => new Response('data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n', { status: 200 });
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
const ask = () => streamAi({ mode: "tutor", messages: [{ role: "user", content: "2+2?" }] }, () => {});

beforeEach(() => {
  headerCalls.length = 0;
});

describe("AI przez serwer", () => {
  it("odpowiedź idzie do funkcji `ai` z tokenem ucznia", async () => {
    const fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    expect(await ask()).toBe("OK");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]).toEqual(["https://example.supabase.co/functions/v1/ai", expect.anything()]);
  });

  it("401 → jedna ponowna próba z odświeżoną sesją", async () => {
    const responses = [json(401, { error: "quota" }), ok()];
    vi.stubGlobal("fetch", async () => responses.shift()!);
    expect(await ask()).toBe("OK");
    expect(headerCalls).toEqual([false, true]);
  });

  it("401 także po odświeżeniu → komunikat o sesji, bez pętli", async () => {
    vi.stubGlobal("fetch", async () => json(401, { error: "quota" }));
    await expect(ask()).rejects.toThrow(/Sesja wygasła/);
    expect(headerCalls).toHaveLength(2);
  });

  it("wyczerpany limit dzienny → AiLimitError (ekran Premium)", async () => {
    vi.stubGlobal("fetch", async () => json(429, { error: "limit", premium: false }));
    await expect(ask()).rejects.toBeInstanceOf(AiLimitError);
  });

  it("błąd Groq (502 upstream) nie jest brany za sesję ani limit; uczeń wie, że wiadomość nie przepadła", async () => {
    vi.stubGlobal("fetch", async () => json(502, { error: "upstream", status: 401, code: "invalid_api_key" }));
    await expect(ask()).rejects.toThrow(/chwilowo niedostępny \(błąd 401\).*nie zmniejszyła/);
    expect(headerCalls).toEqual([false]);

    vi.stubGlobal("fetch", async () => json(502, { error: "upstream", status: 429 }));
    await expect(ask()).rejects.toThrow(/obciążony.*nie zmniejszyła/);
  });
});
