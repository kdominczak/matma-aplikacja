"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { TypingDots } from "@/components/quiz/ExplainSheet";
import AiSettingsCard from "@/components/tutor/AiSettingsCard";
import Icon from "@/components/ui/Icon";
import RichText from "@/components/ui/RichText";
import { streamAi, takeTutorDraft, type ChatMessage } from "@/lib/ai";
import { GROQ_MODELS, useAiSettings } from "@/lib/ai-settings";

const MAX_HISTORY = 29; // nieparzysta: rozmowa zawsze kończy się wiadomością ucznia; do modelu i tak idzie przycięta końcówka

const SUGGESTIONS = [
  { title: "Wklej zadanie", text: "Mam takie zadanie i nie wiem, od czego zacząć:\n\n" },
  { title: "Sprawdź moje rozwiązanie", text: "Rozwiązałem zadanie, ale nie wiem, czy dobrze. Treść:\n\n\nMoje rozwiązanie:\n\n" },
  { title: "Wytłumacz deltę", text: "Wytłumacz mi prosto, po co jest delta i jak z niej korzystać w równaniach kwadratowych." },
  { title: "Dziedzina w równaniach", text: "Dlaczego w równaniach wymiernych trzeba wyznaczać dziedzinę? Pokaż na przykładzie." },
];

// Czat renderujemy dopiero w przeglądarce – szkic zadania czeka w sessionStorage.
const noop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export default function TutorView() {
  const isClient = useIsClient();
  const settings = useAiSettings();

  return (
    <Page width="reading">
      <PageHeader
        title="Korepetytor AI"
        subtitle="Wklej zadanie ze szkoły albo z próbnej matury – przejdziemy przez nie krok po kroku."
      />
      {settings && !settings.apiKey && <AiSettingsCard intro />}
      {settings?.apiKey && isClient && (
        <>
          <Chat />
          <p className="-mt-3 text-center text-xs text-faint">
            Model: {GROQ_MODELS.find((m) => m.id === settings.model)?.label ?? settings.model} · zmienisz go w{" "}
            <Link href="/postepy#ustawienia-ai" className="font-bold underline">
              Postępach
            </Link>
          </p>
        </>
      )}
    </Page>
  );
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(takeTutorDraft);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abort.current?.abort(), []);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setError(null);
    setInput("");
    const history = [...messages, { role: "user" as const, content: text }].slice(-MAX_HISTORY);
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    const controller = new AbortController();
    abort.current = controller;
    try {
      await streamAi(
        { mode: "tutor", messages: history },
        (reply) => setMessages([...history, { role: "assistant", content: reply }]),
        controller.signal,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się połączyć z korepetytorem.");
      setMessages(history.slice(0, -1));
      setInput(text);
    } finally {
      setStreaming(false);
      abort.current = null;
    }
  }

  function stop() {
    abort.current?.abort();
  }

  function reset() {
    stop();
    setMessages([]);
    setError(null);
  }

  function applySuggestion(text: string) {
    setInput(text);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              onClick={() => applySuggestion(s.text)}
              className="rounded-2xl border border-line bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40"
            >
              <p className="font-extrabold text-ink">{s.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{s.text.trim()}</p>
            </button>
          ))}
        </section>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-faint">Rozmowa</p>
          <button onClick={reset} className="flex items-center gap-1.5 text-sm font-bold text-muted hover:text-ink">
            <Icon name="refresh" className="h-4 w-4" />
            Nowa rozmowa
          </button>
        </div>
      )}

      <ol className="flex flex-col gap-4" aria-live="polite">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <li key={i} className="ml-auto max-w-[85%] rounded-3xl rounded-br-lg bg-brand px-4 py-3 text-white shadow-float">
              <p className="whitespace-pre-wrap">{m.content}</p>
            </li>
          ) : (
            <li key={i} className="flex max-w-[95%] gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <div className="min-w-0 rounded-3xl rounded-tl-lg border border-line bg-card px-4 py-3 text-body shadow-card">
                {m.content ? <RichText text={m.content} /> : <TypingDots />}
              </div>
            </li>
          ),
        )}
      </ol>

      {error && (
        <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <div ref={bottomRef} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex items-end gap-2 rounded-3xl border border-line bg-card p-2 shadow-card lg:bottom-6"
      >
        <label htmlFor="tutor-input" className="sr-only">
          Wiadomość do korepetytora
        </label>
        <textarea
          id="tutor-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
              e.preventDefault();
              send();
            }
          }}
          rows={Math.min(8, Math.max(1, input.split("\n").length))}
          placeholder="Wklej treść zadania albo zadaj pytanie… (wzory możesz pisać zwykłym tekstem)"
          className="max-h-60 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-ink placeholder:text-faint focus:outline-none"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Zatrzymaj odpowiedź"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-subtle text-ink"
          >
            <Icon name="stop" className="h-4 w-4" filled />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Wyślij"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-float transition-colors active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
          >
            <Icon name="send" className="h-5 w-5" />
          </button>
        )}
      </form>
      <p className="-mt-2 text-center text-xs text-faint">
        Korepetytor może się pomylić – sprawdzaj obliczenia i porównuj z kluczem CKE.
      </p>
    </div>
  );
}
