import { appSettings } from "@/lib/app-settings";

// Subtelne dźwięki interfejsu generowane przez Web Audio – bez plików audio w paczce.
// Można je wyciszyć w Ustawieniach.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !appSettings().sounds) return null;
  ctx ??= new AudioContext();
  // przeglądarki wstrzymują kontekst do pierwszego gestu – kliknięcie w odpowiedź nim jest
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Krótki, miękki „klik” (opadający sinus z szybkim wygaszeniem). */
function blip(frequency: number, endFrequency: number, duration: number, volume: number) {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Wybór odpowiedzi A–D. */
export function soundSelect() {
  blip(880, 620, 0.09, 0.08);
}
