import { Preferences } from "@capacitor/preferences";
import { supabase } from "@/lib/supabase";

// Usunięcie konta (wymóg Google Play i RODO): konto na serwerze razem ze wszystkimi danymi ucznia,
// a potem wszystko z tego urządzenia. Motyw (zwykły localStorage) zostaje – to nie są dane osobowe.

/** Zapasowa kopia postępu w zwykłym localStorage (src/lib/progress.ts). */
const PROGRESS_FALLBACK_KEY = "matma.progress.fallback";

/**
 * Usuwa konto i dane. Rzuca błąd z komunikatem dla ucznia, gdy na serwerze się nie udało –
 * wtedy niczego nie kasujemy na urządzeniu (uczeń może spróbować ponownie).
 * Po sukcesie aplikację trzeba przeładować (stan w pamięci jest nieaktualny).
 */
export async function deleteAccountAndData(): Promise<void> {
  const db = await supabase();
  if (db) {
    const { data } = await db.auth.getSession();
    const userId = data.session?.user.id;
    if (userId) {
      // zdjęcie najpierw – Supabase nie pozwala kasować plików Storage z poziomu SQL; brak pliku to nie błąd
      await db.storage.from("avatars").remove([`${userId}.jpg`]);
      const { error } = await db.rpc("delete_my_account");
      if (error) {
        throw new Error(
          error.code ? "Serwer nie usunął konta – spróbuj ponownie za chwilę." : "Brak połączenia z internetem – konto nie zostało usunięte.",
          { cause: error },
        );
      }
      // konto już nie istnieje – czyścimy tylko sesję na urządzeniu
      await db.auth.signOut({ scope: "local" }).catch(() => {});
    }
  }
  await Preferences.clear();
  try {
    window.localStorage.removeItem(PROGRESS_FALLBACK_KEY);
    window.sessionStorage.clear();
  } catch {
    // brak dostępu do storage – nic tam nie zostało
  }
}
