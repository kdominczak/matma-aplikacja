// Prompty korepetytora, wyjaśnień i podpowiedzi są tylko na serwerze (supabase/functions/_shared/chat.ts) – aplikacja
// wysyła `purpose` i dane. Tu zostają typy i etykiety trybów pomocy do interfejsu.
import type { TutorStyle } from "../../supabase/functions/_shared/chat";

export type { QuestionPayload, TutorStyle } from "../../supabase/functions/_shared/chat";

/** Jak korepetytor ma pomóc – uczeń wybiera przed wysłaniem; instrukcję dla modelu dokłada serwer. */
export const TUTOR_STYLES: Record<TutorStyle, { label: string; hint: string }> = {
  naprowadz: { label: "Naprowadź", hint: "krok po kroku, bez podawania wyniku" },
  rozwiazanie: { label: "Rozwiązanie", hint: "całe rozwiązanie z wyjaśnieniem" },
  sprawdz: { label: "Sprawdź moje", hint: "ocena jak na maturze" },
};
