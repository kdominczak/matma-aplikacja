// Funkcja serwerowa „revenuecat” (Supabase Edge Function, Deno): zakupy → Premium w bazie. Dwa wejścia:
//
// 1. Webhook RevenueCat – nagłówek Authorization = sekret REVENUECAT_WEBHOOK_AUTH. Odnowienia, zwroty, wygaśnięcia.
// 2. Synchronizacja z aplikacji – nagłówek Authorization = token ucznia (Bearer <JWT Supabase>). Aplikacja woła ją
//    zaraz po zakupie i po „Przywróć zakupy”, żeby Premium włączyło się od razu, a nie dopiero po webhooku.
//
// W obu przypadkach treści nie ufamy co do dat: pytamy API RevenueCat o aktualny stan konta i zapisujemy go przez
// set_purchase_premium() (nadpisuje, nie dodaje). Duplikaty i zła kolejność zdarzeń są nieszkodliwe.
//
// Wdrożenie (docs/premium.md):
//   supabase secrets set REVENUECAT_WEBHOOK_AUTH=<losowy długi ciąg> REVENUECAT_SECRET_KEY=sk_...
//   supabase functions deploy revenuecat --no-verify-jwt
// (--no-verify-jwt, bo webhook nie ma tokenu Supabase; token ucznia sprawdzamy sami przez auth.getUser).

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.117.3";
import { affectedUsers, purchaseUntil, safeEqual, type RevenueCatEvent, type RevenueCatSubscriber } from "../_shared/purchase.ts";

const RC_API = "https://api.revenuecat.com/v1/subscribers/";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

class RetryLater extends Error {}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return json(405, { error: "method" });

  const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_AUTH")?.trim();
  const rcKey = Deno.env.get("REVENUECAT_SECRET_KEY")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!webhookSecret || !rcKey || !serviceKey) {
    console.error("revenuecat: brak sekretów REVENUECAT_WEBHOOK_AUTH / REVENUECAT_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY");
    return json(500, { error: "config" });
  }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } });
  const given = request.headers.get("Authorization") ?? "";

  try {
    // ── 1. webhook ──
    if (safeEqual(given, webhookSecret) || safeEqual(given, `Bearer ${webhookSecret}`)) {
      const payload = (await request.json().catch(() => null)) as { event?: RevenueCatEvent } | null;
      const event = payload?.event;
      if (!event) return json(400, { error: "bad_event" });
      const users = affectedUsers(event);
      if (users.length === 0) {
        // TEST z panelu RevenueCat albo zakup przed zalogowaniem ($RCAnonymousID) – nic do zapisania
        console.log("revenuecat: zdarzenie bez konta Supabase", event.type);
        return json(200, { ok: true, users: 0 });
      }
      for (const user of users) await syncUser(db, rcKey, user, event.type ?? "UNKNOWN");
      return json(200, { ok: true, users: users.length });
    }

    // ── 2. synchronizacja z aplikacji (token ucznia) ──
    if (!given.startsWith("Bearer ")) return json(401, { error: "auth" });
    const { data, error } = await db.auth.getUser(given.slice("Bearer ".length));
    if (error || !data.user) return json(401, { error: "auth" });
    // zakup wymaga konta z e-mailem (inaczej przepadłby po zmianie telefonu) – tak samo pilnuje aplikacja
    if (data.user.is_anonymous) return json(403, { error: "email_required" });
    const until = await syncUser(db, rcKey, data.user.id, "APP_SYNC");
    return json(200, { ok: true, premium_until: until });
  } catch (cause) {
    if (cause instanceof RetryLater) return json(502, { error: "retry" }); // RevenueCat ponowi webhook później
    console.error("revenuecat:", String(cause));
    return json(500, { error: "internal" });
  }
});

/** Stan konta z API RevenueCat → set_purchase_premium(). Zwraca koniec Premium (z obu źródeł) albo null. */
async function syncUser(db: SupabaseClient, rcKey: string, user: string, eventType: string): Promise<string | null> {
  const response = await fetch(RC_API + encodeURIComponent(user), { headers: { Authorization: `Bearer ${rcKey}` } });
  if (!response.ok) {
    console.error("revenuecat: API RevenueCat", response.status, user);
    throw new RetryLater();
  }
  const { until, product } = purchaseUntil((await response.json()) as RevenueCatSubscriber);
  const { data, error } = await db.rpc("set_purchase_premium", {
    p_user: user,
    p_until: until?.toISOString() ?? null,
    p_product: product,
    p_event: eventType,
  });
  if (error?.code === "23503") {
    // konto usunięte albo nie z tego projektu – ponawianie nic nie da
    console.warn("revenuecat: brak konta", user, eventType);
    return null;
  }
  if (error) throw new Error(`set_purchase_premium ${error.code} ${error.message}`);
  console.log("revenuecat:", eventType, user, product ?? "-", until?.toISOString() ?? "brak");
  return (data as string | null) ?? null;
}
