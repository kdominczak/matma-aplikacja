// Czysta logika zakupów (bez Deno API) – używa jej funkcja `revenuecat`, testy w tests/purchase.test.ts.
//
// Źródłem prawdy jest stan klienta z API RevenueCat (GET /v1/subscribers/<id>), a nie treść pojedynczego
// webhooka: zdarzenia mogą przyjść podwójnie albo w innej kolejności, stan zawsze jest aktualny.

/** Uprawnienie w RevenueCat (Entitlements → identifier), do którego podpięte są oba produkty. */
export const ENTITLEMENT_ID = "premium";

/** Fragment odpowiedzi GET /v1/subscribers/<app_user_id>, z którego korzystamy. */
export interface RevenueCatSubscriber {
  subscriber?: {
    entitlements?: Record<
      string,
      { expires_date: string | null; grace_period_expires_date?: string | null; purchase_date: string; product_identifier: string }
    >;
  };
}

/**
 * Do kiedy działa Premium z zakupu (null = brak uprawnienia, np. po zwrocie).
 * Subskrypcja: data końca okresu (albo okresu karencji przy problemie z płatnością, jeśli późniejsza).
 * Pakiet jednorazowy nie ma daty końca w sklepie – działa do końca sezonu maturalnego, w którym go kupiono.
 */
export function purchaseUntil(data: RevenueCatSubscriber): { until: Date | null; product: string | null } {
  const entitlement = data.subscriber?.entitlements?.[ENTITLEMENT_ID];
  if (!entitlement) return { until: null, product: null };
  const product = entitlement.product_identifier;
  if (entitlement.expires_date === null) return { until: seasonEnd(new Date(entitlement.purchase_date)), product };
  const dates = [entitlement.expires_date, entitlement.grace_period_expires_date].filter((d): d is string => Boolean(d));
  return { until: new Date(Math.max(...dates.map((d) => Date.parse(d)))), product };
}

/**
 * Koniec sezonu maturalnego: północ z 31 maja na 1 czerwca czasu polskiego (UTC+2 latem).
 * Zakup od czerwca – do maja następnego roku; od stycznia do maja – do maja tego roku.
 */
export function seasonEnd(purchase: Date): Date {
  const warsaw = new Date(purchase.getTime() + 2 * 3_600_000);
  const year = warsaw.getUTCMonth() >= 5 ? warsaw.getUTCFullYear() + 1 : warsaw.getUTCFullYear();
  return new Date(Date.UTC(year, 4, 31, 22, 0, 0));
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Webhook RevenueCat (fragment): kogo dotyczy zdarzenie. */
export interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  aliases?: string[];
  transferred_from?: string[];
  transferred_to?: string[];
}

/**
 * Konta Supabase, których stan trzeba przeliczyć. W aplikacji logujemy się do RevenueCat id konta Supabase,
 * więc liczą się tylko identyfikatory w formacie UUID ($RCAnonymousID:… pomijamy). Przy TRANSFER –
 * obie strony (zakup przeszedł z jednego konta na drugie).
 */
export function affectedUsers(event: RevenueCatEvent): string[] {
  const ids = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
    ...(event.transferred_from ?? []),
    ...(event.transferred_to ?? []),
  ];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && UUID.test(id)).map((id) => id.toLowerCase()))];
}

/** Porównanie sekretu w stałym czasie (nagłówek Authorization webhooka). */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
