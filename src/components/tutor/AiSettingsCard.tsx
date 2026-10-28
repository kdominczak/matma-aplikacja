"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { verifyGroqKey } from "@/lib/ai";
import { GROQ_MODELS, removeApiKey, saveAiSettings, useAiSettings } from "@/lib/ai-settings";

/**
 * Podłączenie darmowego korepetytora: uczeń wkleja własny klucz Groq,
 * który zostaje tylko na tym urządzeniu. Bez klucza funkcje AI są ukryte.
 */
export default function AiSettingsCard({ intro = false }: { intro?: boolean }) {
  const settings = useAiSettings();
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "invalid" | "offline">("idle");

  if (!settings) return null;

  async function connect() {
    const key = draft.trim();
    if (!key.startsWith("gsk_")) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    const result = await verifyGroqKey(key);
    if (result === "ok") {
      await saveAiSettings({ apiKey: key });
      setDraft("");
      setStatus("idle");
    } else {
      setStatus(result);
    }
  }

  const connected = Boolean(settings.apiKey);

  return (
    <section className="rounded-3xl border border-line glass-card p-5 shadow-card lg:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Icon name="sparkles" className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="font-extrabold text-ink">{intro ? "Podłącz darmowego korepetytora AI" : "Korepetytor AI"}</h2>
          <p className="text-sm text-muted">
            {connected
              ? "Połączono z Groq. Klucz jest zapisany tylko na tym urządzeniu."
              : "Korepetytor działa na darmowych modelach Groq. Wystarczy Twój własny, bezpłatny klucz."}
          </p>
        </div>
      </div>

      {!connected ? (
        <div className="mt-4 flex flex-col gap-3">
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-body marker:font-bold marker:text-brand">
            <li>
              Załóż darmowe konto na{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="font-bold text-brand underline">
                console.groq.com/keys
              </a>
              .
            </li>
            <li>Kliknij „Create API Key” i skopiuj klucz (zaczyna się od gsk_).</li>
            <li>Wklej go poniżej.</li>
          </ol>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              connect();
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <label htmlFor="groq-key" className="sr-only">
              Klucz Groq
            </label>
            <input
              id="groq-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setStatus("idle");
              }}
              placeholder="gsk_..."
              className="min-w-0 flex-1 rounded-2xl border border-line bg-surface px-4 py-3 font-mono text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || status === "checking"}
              className="rounded-2xl bg-brand px-5 py-3 font-bold text-white shadow-float active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              {status === "checking" ? "Sprawdzam…" : "Połącz"}
            </button>
          </form>
          {status === "invalid" && (
            <p className="text-sm font-semibold text-rose-500">Ten klucz nie działa – sprawdź, czy skopiowałeś go w całości.</p>
          )}
          {status === "offline" && (
            <p className="text-sm font-semibold text-rose-500">Brak połączenia z Groq – sprawdź internet i spróbuj ponownie.</p>
          )}
          <p className="text-xs text-faint">
            Twoje pytania do korepetytora trafiają do Groq. Nie wklejaj do czatu danych osobowych.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-xs font-extrabold uppercase tracking-widest text-faint">Model</legend>
            {GROQ_MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  settings.model === m.id ? "border-brand bg-brand-soft" : "border-line hover:border-brand/40"
                }`}
              >
                <input
                  type="radio"
                  name="groq-model"
                  checked={settings.model === m.id}
                  onChange={() => saveAiSettings({ model: m.id })}
                  className="accent-brand"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-ink">{m.label}</span>
                  <span className="block text-xs text-muted">{m.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <button onClick={() => removeApiKey()} className="-my-2 min-h-11 self-start text-sm font-bold text-muted hover:text-rose-500">
            Odłącz klucz
          </button>
        </div>
      )}
    </section>
  );
}
