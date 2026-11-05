import type { FocusEvent } from "react";

/**
 * Po stuknięciu w pole na telefonie klawiatura zmniejsza ekran, a przyklejony nagłówek może zasłonić pole – przewijamy je
 * na środek widocznej części, gdy klawiatura już się wysunęła. Tylko na telefonie (komputer nie ma czego odsłaniać).
 */
export function revealAboveKeyboard(event: FocusEvent<HTMLElement>) {
  const field = event.currentTarget;
  if (window.matchMedia("(min-width: 64rem)").matches) return;
  window.setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 350);
}
