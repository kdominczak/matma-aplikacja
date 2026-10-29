// Funkcja serwerowa „ai” (Supabase Edge Function, Deno): pośrednik do Groq z dziennym limitem wiadomości.
// Klucz Groq jest tylko tutaj (sekret GROQ_API_KEY) – aplikacja go nie zna.
//
// Wdrożenie:
//   supabase secrets set GROQ_API_KEY=gsk_...
//   supabase functions deploy ai
// Potem w aplikacji build z NEXT_PUBLIC_AI_SERVER=1 (src/lib/ai-settings.ts).
//
// Kolejność: 1) token ucznia (konto, także anonimowe), 2) consume_ai_quota() – limit liczy baza,
// 3) zapytanie do Groq z ograniczeniami (dozwolone modele, maks. długość), 4) strumień odpowiedzi do aplikacji.

import { createClient } from "jsr:@supabase/supabase-js@2";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const ALLOWED_MODELS = new Set(["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "llama-3.1-8b-instant", "qwen/qwen3.8-27b"]);
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const MAX_COMPLETION_TOKENS = 6144;
const MAX_BODY_BYTES = 4_000_000; // do 3 zdjęć JPEG ≤1280 px w base64
const MAX_MESSAGES = 40;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-ai-remaining, x-ai-premium",
};

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return json(405, { error: "method" });

  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(401, { error: "auth" });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: "too_large" });
  let body: { model?: string; messages?: unknown[]; max_completion_tokens?: number; [key: string]: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "bad_json" });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
    return json(400, { error: "bad_messages" });
  }

  // Limit liczy baza (consume_ai_quota) z tożsamością ucznia z jego tokenu – tej samej co w aplikacji.
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data, error } = await db.rpc("consume_ai_quota");
  if (error) return json(error.code === "28000" ? 401 : 500, { error: "quota", detail: error.code });
  const quota = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; remaining: number; premium: boolean };
  const quotaHeaders = { "x-ai-remaining": String(quota.remaining), "x-ai-premium": quota.premium ? "1" : "0" };
  if (!quota.allowed) return json(429, { error: "limit", premium: quota.premium }, quotaHeaders);

  const model = typeof body.model === "string" && ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL;
  const upstream = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      model,
      stream: true,
      max_completion_tokens: Math.min(Number(body.max_completion_tokens) || 2048, MAX_COMPLETION_TOKENS),
    }),
  });

  if (!upstream.ok || !upstream.body) {
    // błąd po stronie Groq – treść błędu przekazujemy, żeby aplikacja pokazała sensowny komunikat
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { ...CORS, "Content-Type": "application/json", ...quotaHeaders },
    });
  }
  return new Response(upstream.body, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...quotaHeaders },
  });
});
