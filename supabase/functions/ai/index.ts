// Funkcja serwerowa „ai” (Supabase Edge Function, Deno): pośrednik do Groq z dziennym limitem wiadomości.
// Klucz Groq jest tylko tutaj (sekret GROQ_API_KEY) – aplikacja go nie zna.
//
// Wdrożenie:
//   supabase secrets set GROQ_API_KEY=gsk_...
//   supabase functions deploy ai
//   (opcjonalnie) zapasowy dostawca przy awarii Groq – API zgodne z OpenAI, _shared/fallback.ts:
//   supabase secrets set FALLBACK_API_URL=https://… FALLBACK_API_KEY=… FALLBACK_TEXT_MODEL=… FALLBACK_VISION_MODEL=…
// Aplikacja woła ją zawsze (src/lib/ai.ts) z polem `purpose`; prompt systemowy, model i limit tokenów ustawia serwer,
// od aplikacji bierze tylko dane (rozmowę ucznia, zadanie, zdjęcia) – funkcja nie posłuży do zwykłego czatu z LLM.
//
// Kolejność: 1) token ucznia, 2) zapytanie z `purpose` i danych (400, gdy niepoprawne),
// 3) licznik w bazie (odmawia kontom anonimowym), 4) zapytanie do Groq, 5) strumień odpowiedzi do aplikacji.
//
// Korepetytor, wyjaśnienia i podpowiedzi (`purpose: "tutor" | "explain" | "hint"`, _shared/chat.ts) – licznik
// consume_ai_quota(). Błędy: 401 = tylko sesja ucznia; 403 {error:"account_required"} = konto anonimowe;
// 429 {error:"limit"} = dzienny limit; błąd Groq → 502 {error:"upstream", status, code} i zwrot wiadomości
// (refund_ai_quota kluczem service_role). Przyczyny trafiają do logów funkcji (bez treści rozmów).
//
// Ocena zadań otwartych (Premium): `purpose: "transcribe"` (zdjęcie kartki → tekst) i `purpose: "grade"` (ocena wg
// schematu dla poziomu `level`, _shared/grading.ts). Osobny licznik consume_grading_quota(). 403 {error:"premium_required"},
// 429 {error:"grading_limit"}.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.117.3";
import { chatRequest, isChatPurpose, type ChatRequest } from "../_shared/chat.ts";
import { fallbackBody, fallbackConfig, shouldFallback } from "../_shared/fallback.ts";
import { isGradingLevel, isGradingPurpose, PURPOSES, purposeMessages, type GradingPurpose } from "../_shared/grading.ts";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_BODY_BYTES = 4_000_000; // do 3 zdjęć JPEG ≤1280 px w base64
const MAX_MESSAGES = 40;

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
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "bad_json" });
  }
  if (!body || typeof body !== "object") return json(400, { error: "bad_json" });
  if (Array.isArray(body.messages) && body.messages.length > MAX_MESSAGES) return json(400, { error: "bad_messages" });

  // Limit liczy baza z tożsamością ucznia z jego tokenu – tej samej co w aplikacji.
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  if (isGradingPurpose(body.purpose)) {
    // poziom matury wybiera prompt egzaminatora (zasady rozszerzenia); nieznany = podstawowy
    const prepared = purposeMessages(body.purpose, Array.isArray(body.messages) ? body.messages : [], isGradingLevel(body.level) ? body.level : "podstawowy");
    if (!prepared) return json(400, { error: "bad_messages" });
    return grading(body.purpose, prepared, db, auth, groqKey);
  }
  // bez `purpose` (starsze wersje aplikacji wysyłały własny prompt) – odmowa, żadnego czatu „na wolno”
  if (!isChatPurpose(body.purpose)) return json(400, { error: "bad_purpose" });
  const prepared = chatRequest(body.purpose, body);
  if (!prepared) return json(400, { error: "bad_messages" });

  const { data, error } = await db.rpc("consume_ai_quota");
  if (error) return quotaError("consume_ai_quota", error);
  const quota = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; remaining: number; premium: boolean };
  const quotaHeaders = { "x-ai-remaining": String(quota.remaining), "x-ai-premium": quota.premium ? "1" : "0" };
  if (!quota.allowed) return json(429, { error: "limit", premium: quota.premium }, quotaHeaders);

  const result = await callAi(groqKey, prepared, String(body.purpose));
  if (!("body" in result)) {
    // nie przekazujemy statusu Groq wprost: jego 401/429 aplikacja wzięłaby za wygasłą sesję albo nasz limit
    await refund(db, auth, "refund_ai_quota");
    return json(502, { error: "upstream", status: result.status, code: result.code }, { ...quotaHeaders, "x-ai-remaining": String(quota.remaining + 1) });
  }
  return new Response(result.body, {
    headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...quotaHeaders },
  });
});

type AiResult = { body: ReadableStream<Uint8Array> } | { status: number; code?: string };

/**
 * Zapytanie w całości ustawione przez serwer (model, prompt, limit tokenów, rozumowanie): najpierw Groq, a przy jego
 * awarii (_shared/fallback.ts: brak połączenia, 429, 5xx, zły klucz, wycofany model) – zapasowy dostawca z sekretów
 * FALLBACK_*, jeśli jest. Gdy oba zawiodą, aplikacja dostaje status Groq.
 */
async function callAi(groqKey: string, request: ChatRequest, label: string): Promise<AiResult> {
  const groq = await send(
    GROQ_URL,
    groqKey,
    { ...request.extra, model: request.model, messages: request.messages, stream: true, max_completion_tokens: request.maxTokens },
  );
  if ("body" in groq) return groq;
  console.error("ai: Groq odrzucił zapytanie", label, groq.status, groq.code ?? "", request.model);
  const config = fallbackConfig((name) => Deno.env.get(name));
  const backupBody = config && shouldFallback(groq.status, groq.code) ? fallbackBody(request, config) : null;
  if (!config || !backupBody) return groq;
  const backup = await send(config.url, config.key, backupBody);
  if ("body" in backup) {
    console.warn("ai: odpowiedź od zapasowego dostawcy", label, backupBody.model);
    return backup;
  }
  console.error("ai: zapasowy dostawca też odrzucił zapytanie", label, backup.status, backup.code ?? "", backupBody.model);
  return groq;
}

async function send(url: string, key: string, payload: Record<string, unknown>): Promise<AiResult> {
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok && response.body) return { body: response.body };
    const detail = await response.json().catch(() => null);
    return { status: response.status, code: typeof detail?.error?.code === "string" ? detail.error.code : undefined };
  } catch (cause) {
    console.error("ai: brak połączenia", new URL(url).host, String(cause));
    return { status: 0 };
  }
}

/**
 * Odmowa licznika: 401 – brak ważnej sesji (aplikacja odświeży token), 403 `account_required` – konto anonimowe
 * (AI tylko z e-mailem albo Google, migracja 20261109120000 – aplikacja pokazuje logowanie), 500 – inny błąd.
 */
function quotaError(fn: string, error: { code?: string; message: string }): Response {
  if (error.code === "28000") return json(401, { error: "quota", detail: error.code });
  if (error.code === "MA030") return json(403, { error: "account_required" });
  console.error(`ai: ${fn}`, error.code, error.message);
  return json(500, { error: "quota", detail: error.code });
}

/** Przepisanie zdjęcia albo ocena wg schematu – osobny licznik (tylko Premium), prompt i model z serwera. */
async function grading(purpose: GradingPurpose, prepared: unknown[], db: SupabaseClient, auth: string, groqKey: string): Promise<Response> {
  const { data, error } = await db.rpc("consume_grading_quota", { p_kind: purpose });
  if (error) return quotaError("consume_grading_quota", error);
  const quota = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; remaining: number; premium: boolean };
  const headers = { "x-grading-remaining": String(quota.remaining) };
  if (!quota.premium) return json(403, { error: "premium_required" }, headers);
  if (!quota.allowed) return json(429, { error: "grading_limit" }, headers);

  const config = PURPOSES[purpose];
  const refunded = { "x-grading-remaining": String(quota.remaining + 1) };
  const result = await callAi(groqKey, { ...config, messages: prepared }, purpose);
  if (!("body" in result)) {
    await refund(db, auth, "refund_grading_quota", purpose);
    return json(502, { error: "upstream", status: result.status, code: result.code }, refunded);
  }
  return new Response(result.body, { headers: { ...CORS, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...headers } });
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
