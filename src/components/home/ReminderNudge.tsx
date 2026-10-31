"use client";

import { useState, useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import { saveAppSettings, useAppSettings } from "@/lib/app-settings";
import { hapticTap } from "@/lib/haptics";
import { formatTime, remindersSupported, requestReminderPermission } from "@/lib/reminders";
import type { Progress } from "@/types/progress";

const noop = () => () => {};

/**
 * Jednorazowa propozycja przypomnienia – dopiero po 2 dniach nauki (wtedy wiadomo, że uczeń wraca)
 * i tylko w aplikacji na telefonie. „Nie teraz” chowa kartę na stałe; włączyć można też w Ustawieniach.
 */
export default function ReminderNudge({ progress }: { progress: Progress }) {
  const settings = useAppSettings();
  const supported = useSyncExternalStore(noop, remindersSupported, () => false);
  const [denied, setDenied] = useState(false);
  const activeDays = Object.values(progress.activityByDay).filter((n) => n > 0).length;

  if (!supported || !settings || settings.reminder.enabled || settings.reminderAsked || activeDays < 2) return null;
  const time = formatTime(settings.reminder.hour, settings.reminder.minute);

  async function enable() {
    hapticTap();
    if (!(await requestReminderPermission())) {
      setDenied(true);
      return;
    }
    await saveAppSettings({ reminder: { ...settings!.reminder, enabled: true }, reminderAsked: true });
  }

  return (
    <section className="card p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="clock" className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="font-extrabold text-ink">Przypominać Ci o planie?</p>
          <p className="text-sm text-muted">
            {denied
              ? "Powiadomienia są zablokowane w ustawieniach telefonu – włącz je dla Matmy i spróbuj ponownie."
              : `Jedno powiadomienie o ${time}, tylko w dni, w które jeszcze się nie uczysz.`}
          </p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={enable}
          className="flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-brand px-4 text-sm font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark"
        >
          Tak, o {time}
        </button>
        <button
          onClick={() => void saveAppSettings({ reminderAsked: true })}
          className="min-h-11 rounded-2xl px-4 text-sm font-bold text-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          Nie teraz
        </button>
      </div>
    </section>
  );
}
