"use client";

import { useState, useSyncExternalStore } from "react";
import Switch from "@/components/ui/Switch";
import { saveAppSettings, type AppSettings } from "@/lib/app-settings";
import { hapticTap } from "@/lib/haptics";
import { formatTime, REMINDER_TIMES, remindersSupported, requestReminderPermission } from "@/lib/reminders";

const noop = () => () => {};

/** Codzienne przypomnienie o planie: włącznik + godzina. W przeglądarce tylko informacja (działa w aplikacji). */
export default function ReminderSetting({ settings }: { settings: AppSettings }) {
  // na serwerze (prerender) zawsze „nie” – inaczej HTML różniłby się od aplikacji na telefonie
  const supported = useSyncExternalStore(noop, remindersSupported, () => false);
  const [denied, setDenied] = useState(false);
  const reminder = settings.reminder;

  async function toggle(enabled: boolean) {
    setDenied(false);
    if (enabled && !(await requestReminderPermission())) {
      setDenied(true);
      return;
    }
    await saveAppSettings({ reminder: { ...reminder, enabled } });
  }

  return (
    <div className="flex flex-col gap-3">
      <Switch
        label="Codzienne przypomnienie"
        description={
          supported
            ? "Raz dziennie, tylko jeśli tego dnia jeszcze się nie uczysz. Po tygodniu przerwy przestajemy przypominać."
            : "Działa w aplikacji na telefonie – w przeglądarce nie wysyłamy powiadomień."
        }
        checked={supported && reminder.enabled}
        onChange={(value) => (supported ? void toggle(value) : undefined)}
      />
      {denied && (
        <p className="rounded-2xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          Telefon zablokował powiadomienia dla Matmy. Włącz je w ustawieniach systemu (Aplikacje → Matma → Powiadomienia) i spróbuj
          ponownie.
        </p>
      )}
      {supported && reminder.enabled && (
        <div>
          <p className="mb-2 text-sm font-bold text-ink">O której?</p>
          <div className="grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Godzina przypomnienia">
            {REMINDER_TIMES.map((time) => {
              const selected = time.hour === reminder.hour && time.minute === reminder.minute;
              return (
                <button
                  key={time.hour}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    hapticTap();
                    void saveAppSettings({ reminder: { ...reminder, ...time } });
                  }}
                  className={`min-h-11 rounded-xl border-2 text-sm font-bold tabular-nums transition-colors ${
                    selected ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-brand/40"
                  }`}
                >
                  {formatTime(time.hour, time.minute)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
