import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Preferences } from "@capacitor/preferences";

// Klucz „anon” Supabase jest publiczny z założenia (trafia do aplikacji) – dane chroni RLS w bazie,
// patrz supabase/migrations. Inaczej niż klucz Groq, który jest prywatny i należy do ucznia.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Adres projektu Supabase (np. do publicznych zdjęć profilowych w Storage). */
export const SUPABASE_URL = URL;

/** Czy ranking jest skonfigurowany w tej wersji aplikacji. */
export const SUPABASE_ENABLED = Boolean(URL && ANON_KEY);

// Sesję trzymamy w Preferences: na iOS localStorage w WebView bywa czyszczony,
// a wtedy uczeń straciłby swoje (anonimowe) konto w rankingu.
const preferencesStorage = {
  getItem: async (key: string) => (await Preferences.get({ key })).value,
  setItem: (key: string, value: string) => Preferences.set({ key, value }),
  removeItem: (key: string) => Preferences.remove({ key }),
};

let client: SupabaseClient | null = null;

/** Klient Supabase tworzony leniwie – tylko w przeglądarce i tylko gdy ranking jest skonfigurowany. */
export function supabase(): SupabaseClient | null {
  if (!SUPABASE_ENABLED || typeof window === "undefined") return null;
  client ??= createClient(URL!, ANON_KEY!, {
    auth: {
      storage: preferencesStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // static export, bez przekierowań OAuth
    },
  });
  return client;
}
