import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { daysToMatura } from "@/lib/matura";
import { plural } from "@/lib/plural";
import { dayKey, shiftDays, streak } from "@/lib/stats";
import type { Progress } from "@/types/progress";

// Codzienne przypomnienie o planie nauki – lokalne powiadomienia (tylko w aplikacji na telefonie, bez serwera).
// Zamiast jednego powtarzanego powiadomienia planujemy osobne na 7 najbliższych dni i przeliczamy je przy każdym
// otwarciu aplikacji i po każdej sesji. Dzięki temu:
// – dzisiejsze przypomnienie znika, gdy uczeń już się dziś uczył,
// – treść zna aktualną serię („Twoja seria: 5 dni”),
// – po tygodniu bez otwierania aplikacji przypomnienia same się kończą (nie zasypujemy ucznia).

export interface ReminderSettings {
  enabled: boolean;
  /** Godzina i minuta przypomnienia (czas lokalny). */
  hour: number;
  minute: number;
}

export const DEFAULT_REMINDER: ReminderSettings = { enabled: false, hour: 19, minute: 0 };

/** Godziny do wyboru w ustawieniach – po szkole, przed snem. */
export const REMINDER_TIMES = [
  { hour: 16, minute: 0 },
  { hour: 17, minute: 0 },
  { hour: 18, minute: 0 },
  { hour: 19, minute: 0 },
  { hour: 20, minute: 0 },
  { hour: 21, minute: 0 },
] as const;

export const REMINDER_DAYS = 7;
/** Id powiadomień: 7001…7007 (dzień 0…6). */
const FIRST_ID = 7001;

export interface PlannedReminder {
  id: number;
  at: Date;
  title: string;
  body: string;
}

export function formatTime(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, "0")}`;
}

/**
 * Przypomnienia na najbliższe dni (czysta funkcja – testy w tests/reminders.test.ts).
 * Dziś: tylko jeśli godzina jeszcze nie minęła i uczeń nic dziś nie zrobił.
 */
export function planReminders(progress: Progress, settings: ReminderSettings, now = new Date()): PlannedReminder[] {
  if (!settings.enabled) return [];
  const days = streak(progress);
  const activeToday = (progress.activityByDay[dayKey(now)] ?? 0) > 0;
  const result: PlannedReminder[] = [];

  for (let offset = 0; offset < REMINDER_DAYS; offset++) {
    const at = shiftDays(now, offset);
    at.setHours(settings.hour, settings.minute, 0, 0);
    if (offset === 0 && (activeToday || at <= now)) continue;

    // seria trwa jeszcze dziś (offset 0) albo jutro, jeśli dziś już była nauka
    const streakAlive = days > 0 && (offset === 0 || (offset === 1 && activeToday));
    const left = daysToMatura(at.getTime());
    result.push({
      id: FIRST_ID + offset,
      at,
      ...(streakAlive
        ? {
            title: `Twoja seria: ${days} ${plural(days, "dzień", "dni", "dni")}`,
            body: offset === 0 ? "Jeszcze dziś 15 minut z planem – nie przerywaj jej." : "Plan na dziś czeka – 15 minut i seria rośnie.",
          }
        : offset <= 1
          ? { title: "Plan na dziś czeka", body: "15 minut: dział dnia i powtórki. Zaczynamy?" }
          : { title: "Wracamy do matmy?", body: `Do matury ${left} ${plural(left, "dzień", "dni", "dni")}. 15 minut dziennie robi różnicę.` }),
    });
  }
  return result;
}

const native = () => Capacitor.isNativePlatform();

/** Czy przypomnienia działają na tym urządzeniu (w przeglądarce – nie). */
export function remindersSupported(): boolean {
  return native();
}

/** Prośba o zgodę na powiadomienia. Zwraca, czy uczeń się zgodził. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!native()) return false;
  const status = await LocalNotifications.checkPermissions();
  if (status.display === "granted") return true;
  const asked = await LocalNotifications.requestPermissions();
  return asked.display === "granted";
}

let lastSignature = "";

/**
 * Przelicza zaplanowane przypomnienia. Wołane przy zmianie postępu/ustawień – realnie planuje tylko wtedy,
 * gdy zmieniło się coś, co wpływa na treść albo czas (sygnatura).
 */
export async function syncReminders(progress: Progress, settings: ReminderSettings): Promise<void> {
  if (!native()) return;
  const planned = planReminders(progress, settings);
  const signature = JSON.stringify([dayKey(), planned.map((r) => [r.id, r.at.getTime(), r.title, r.body])]);
  if (signature === lastSignature) return;
  lastSignature = signature;
  try {
    await LocalNotifications.cancel({ notifications: Array.from({ length: REMINDER_DAYS }, (_, i) => ({ id: FIRST_ID + i })) });
    if (planned.length === 0) return;
    // bez zgody nie planujemy (schedule() sam pytałby o zgodę – pytamy tylko po włączeniu w ustawieniach)
    if ((await LocalNotifications.checkPermissions()).display !== "granted") return;
    await LocalNotifications.schedule({
      notifications: planned.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        // przypomnienie nie musi być co do minuty – bez proszenia o „Alarmy i przypomnienia” na Androidzie
        schedule: { at: r.at, allowWhileIdle: true },
        isExactNotification: false,
        extra: { href: "/plan" },
      })),
    });
  } catch (error) {
    lastSignature = "";
    console.warn("Nie udało się zaplanować przypomnień", error);
  }
}

/** Dotknięcie przypomnienia otwiera plan na dziś. Zwraca funkcję sprzątającą. */
export function onReminderTap(open: (href: string) => void): () => void {
  if (!native()) return () => {};
  const handle = LocalNotifications.addListener("localNotificationActionPerformed", (action) => {
    const href = (action.notification.extra as { href?: string } | undefined)?.href;
    if (href) open(href);
  });
  return () => void handle.then((h) => h.remove());
}
