import { supabase } from "@/lib/supabase";

// Lejek Premium (migracja 20261107120000, raport supabase/admin/lejek.sql): kroki zgłaszamy tylko z istniejącym
// kontem – statystyki nigdy nie zakładają konta – i najwyżej raz na uruchomienie aplikacji (serwer i tak liczy
// raz na konto i dzień). Błędy ignorujemy: statystyki nie mogą przeszkadzać w nauce ani w zakupie.
// Krok ai_limit zapisuje sam serwer (consume_ai_quota).

export type FunnelStep = "premium_view" | "email_gate" | "buy_start";

const sent = new Set<FunnelStep>();

export async function trackFunnel(step: FunnelStep): Promise<void> {
  if (sent.has(step)) return;
  sent.add(step);
  try {
    const db = await supabase();
    if (!db || !(await db.auth.getSession()).data.session) {
      sent.delete(step); // bez konta – spróbujemy, gdy konto już będzie
      return;
    }
    await db.rpc("track_funnel", { p_event: step });
  } catch {
    // statystyki są opcjonalne
  }
}
