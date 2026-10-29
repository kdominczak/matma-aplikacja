// Funkcja serwerowa „ai” (Supabase Edge Function, Deno): pośrednik do Groq z dziennym limitem wiadomości.
// Klucz Groq jest tylko tutaj (sekret GROQ_API_KEY) – aplikacja go nie zna.
//
// Wdrożenie:
//   supabase secrets set GROQ_API_KEY=gsk_...
//   supabase functions deploy ai
// Aplikacja woła ją zawsze (src/lib/ai.ts); modele wybiera według zapytania (src/lib/ai-config.ts).
//
// Kolejność: 1) token ucznia (konto, także anonimowe), 2) consume_ai_quota() – limit liczy baza,
// 3) zapytanie do Groq z ograniczeniami (dozwolone modele, maks. długość), 4) strumień odpowiedzi do aplikacji.
//
// Błędy: 401 = tylko sesja ucznia; 429 {error:"limit"} = dzienny limit; błąd Groq → 502 {error:"upstream", status, code}
// i zwrot wiadomości (refund_ai_quota kluczem service_role). Przyczyny trafiają do logów funkcji (bez treści rozmów).
//
// Ocena zadań otwartych (Premium): `purpose: "transcribe"` (zdjęcie kartki → tekst) i `purpose: "grade"` (ocena wg
// schematu). Osobny licznik consume_grading_quota(); prompt, model i limity ustawia serwer (_shared/grading.ts),
// z zapytania aplikacji bierze tylko zdjęcia albo tekst. 403 {error:"premium_required"}, 429 {error:"grading_limit"}.

import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { isGradingPurpose, PURPOSES, purposeMessages, type GradingPurpose } from "../_shared/grading.ts";
import { TEXT_MODEL, VISION_MODEL } from "../_shared/models.ts";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// tekst i obrazy (src/lib/ai-config.ts czyta te same stałe z _shared/models.ts); modele Llama Groq już wycofał
const ALLOWED_MODELS = new Set([TEXT_MODEL, VISION_MODEL]);
const DEFAULT_MODEL = TEXT_MODEL;
const MAX_COMPLETION_TOKENS = 6144;
const MAX_BODY_BYTES = 4_000_000; // do 3 zdjęć JPEG ≤1280 px w base64
const MAX_MESSAGES = 40;
// tylko te pola z zapytania aplikacji idą do Groq (bez n, tools itp. – koszt i zachowanie ustala serwer)
const PASSED_FIELDS = ["messages", "temperature", "reasoning_effort", "include_reasoning", "reasoning_format"] as const;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-ai-remaining, x-ai-premium, x-grading-remaining",
};

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json", ...extra } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return json(405, { error: "method" });

  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return json(401, { error: "auth" });
  // spacja, nowa linia albo cudzysłowy przy wklejaniu sekretu dają u Groq „Invalid API Key”
  const groqKey = Deno.env.get("GROQ_API_KEY")?.trim().replace(/^["']|["']$/g, "");
  if (!groqKey) {
    console.error("ai: brak sekretu GROQ_API_KEY");
    return json(500, { error: "config" });
  }

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

  // Limit liczy baza z tożsamością ucznia z jego tokenu – tej samej co w aplikacji.
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  if (isGradingPurpose(body.purpose)) return grading(body.purpose, body.messages, db, auth, groqKey);

  const { data, error } = await db.rpc("consume_ai_quota");
  if (error) {
    if (error.code !== "28000") console.error("ai: consume_ai_quota", error.code, error.message);
    return json(error.code === "28000" ? 401 : 500, { error: "quota", detail: error.code });
  }
  const quota = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; remaining: number; premium: boolean };
  const quotaHeaders = { "x-ai-remaining": String(quota.remaining), "x-ai-premium": quota.premium ? "1" : "0" };
  if (!quota.allowed) return json(429, { error: "limit", premium: quota.premium }, quotaHeaders);

  const model = typeof body.model === "string" && ALLOWED_MODELS.has(body.model) ? body.model : DEFAULT_MODEL;
  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...pick(body, PASSED_FIELDS),
        model,
        stream: true,
        max_completion_tokens: Math.min(Number(body.max_completion_tokens) || 2048, MAX_COMPLETION_TOKENS),
      }),
    });
  } catch (cause) {
    console.error("ai: brak połączenia z Groq", String(cause));
    await refund(db, auth, "refund_ai_quota");
    return json(502, { error: "upstream", status: 0 }, { ...quotaHeaders, "x-ai-remaining": String(quota.remaining + 1) });
  }

  if (!upstream.ok || !upstream.body) {
    // nie przekazujemy statusu Groq wprost: jego 401/429 aplikacja wzięłaby za wygasłą sesję albo nasz limit
    const detail = await upstream.json().catch(() => null);
    const code = typeof detail?.error?.code === "string" ? detail.error.code : undefined;
    console.error("ai: Groq odrzucił zapytanie", upstream.status, code ?? "", model);
    await refund(db, auth, "refund_ai_quota");
    return json(502, { error: "upstream", status: upstream.status, code }, { ...quotaHeaders, "x-ai-remaining": String(quota.remaining + 1) });
  }
  return new Response(upstream.body, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...quotaHeaders },
  });
});

function pick(source: Record<string, unknown>, keys: readonly string[]) {
  return Object.fromEntries(keys.filter((key) => key in source).map((key) => [key, source[key]]));
}

/** Przepisanie zdjęcia albo ocena wg schematu – osobny licznik (tylko Premium), prompt i model z serwera. */
async function grading(purpose: GradingPurpose, messages: unknown[], db: SupabaseClient, auth: string, groqKey: string): Promise<Response> {
  const prepared = purposeMessages(purpose, messages);
  if (!prepared) return json(400, { error: "bad_messages" });

  const { data, error } = await db.rpc("consume_grading_quota", { p_kind: purpose });
  if (error) {
    if (error.code !== "28000") console.error("ai: consume_grading_quota", error.code, error.message);
    return json(error.code === "28000" ? 401 : 500, { error: "quota", detail: error.code });
  }
  const quota = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; remaining: number; premium: boolean };
  const headers = { "x-grading-remaining": String(quota.remaining) };
  if (!quota.premium) return json(403, { error: "premium_required" }, headers);
  if (!quota.allowed) return json(429, { error: "grading_limit" }, headers);

  const config = PURPOSES[purpose];
  const refunded = { "x-grading-remaining": String(quota.remaining + 1) };
  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...config.extra, model: config.model, messages: prepared, stream: true, max_completion_tokens: config.maxTokens }),
    });
  } catch (cause) {
    console.error("ai: brak połączenia z Groq", purpose, String(cause));
    await refund(db, auth, "refund_grading_quota", purpose);
    return json(502, { error: "upstream", status: 0 }, refunded);
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.json().catch(() => null);
    const code = typeof detail?.error?.code === "string" ? detail.error.code : undefined;
    console.error("ai: Groq odrzucił zapytanie", purpose, upstream.status, code ?? "", config.model);
    await refund(db, auth, "refund_grading_quota", purpose);
    return json(502, { error: "upstream", status: upstream.status, code }, refunded);
  }
  return new Response(upstream.body, { headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...headers } });
}

/** Oddaje zużyte zapytanie (refund_ai_quota albo refund_grading_quota), gdy odpowiedź nie powstała. Błąd zwrotu tylko logujemy. */
async function refund(db: SupabaseClient, auth: string, fn: "refund_ai_quota" | "refund_grading_quota", kind?: GradingPurpose) {
  try {
    const { data } = await db.auth.getUser(auth.slice("Bearer ".length));
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!data.user || !serviceKey) throw new Error(!data.user ? "brak użytkownika" : "brak SUPABASE_SERVICE_ROLE_KEY");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } });
    const { error } = await admin.rpc(fn, kind ? { p_user: data.user.id, p_kind: kind } : { p_user: data.user.id });
    if (error) throw new Error(`${error.code} ${error.message}`);
  } catch (cause) {
    console.error("ai: nie udało się oddać wiadomości", String(cause));
  }
}
