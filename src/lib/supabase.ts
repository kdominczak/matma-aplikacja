import type { SupabaseClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// Klucz „anon” Supabase jest publiczny z założenia (trafia do aplikacji) – dane chroni RLS w bazie,
// patrz supabase/migrations. Klucze prywatne (Groq, service_role, RevenueCat) są tylko w sekretach funkcji serwerowych.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Adres projektu Supabase (np. do publicznych zdjęć profilowych w Storage). */
export const SUPABASE_URL = URL;

/** Publiczny klucz „anon” – nagłówek `apikey` przy wywołaniu funkcji serwerowych (np. AI). */
export const SUPABASE_ANON_KEY = ANON_KEY;

/** Czy backend (konto, kopia postępu, AI, Premium) jest skonfigurowany w tej wersji aplikacji. */
export const SUPABASE_ENABLED = Boolean(URL && ANON_KEY);

// Sesję trzymamy w Preferences: na iOS localStorage w WebView bywa czyszczony,
// a wtedy uczeń straciłby swoje (anonimowe) konto w rankingu.
const preferencesStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: (key: string, value: string) => Preferences.set({ key, value }),
  removeItem: (key: string) => Preferences.remove({ key }),
};

let client: Promise<SupabaseClient> | null = null;

/**
 * Klient Supabase tworzony leniwie – tylko w przeglądarce i tylko gdy ranking jest skonfigurowany.
 * Biblioteka (~320 KB) ładuje się osobną paczką dopiero przy pierwszym użyciu, nie przy starcie aplikacji.
 */
export function supabase(): Promise<SupabaseClient | null> {
  if (!SUPABASE_ENABLED || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(URL!, ANON_KEY!, {
      auth: {
        storage: preferencesStorage,
        persistSession: true,
        autoRefreshToken: true,
        // w przeglądarce logowanie Google wraca przekierowaniem z sesją w adresie; w aplikacji Google loguje
        // natywnie (token ID), więc adresu nie czytamy
        detectSessionInUrl: !Capacitor.isNativePlatform(),
      },
    }),
  );
  return client;
}
