"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { TypingDots } from "@/components/quiz/ExplainSheet";
import AiSettingsCard from "@/components/tutor/AiSettingsCard";
import Icon from "@/components/ui/Icon";
import RichText from "@/components/ui/RichText";
import { streamAi, takeTutorDraft, type ChatMessage } from "@/lib/ai";
import { GROQ_MODELS, useAiSettings, VISION_MODEL_LABEL } from "@/lib/ai-settings";
import {
  imageCount,
  isImage,
  isPdf,
  MAX_IMAGES,
  parsePageRange,
  pdfContext,
  pdfHasContent,
  prepareImage,
  preparePdf,
  setPdfRange,
  type Attachment,
  type ImageAttachment,
  type PdfAttachment,
} from "@/lib/attachments";

const MAX_HISTORY = 29; // nieparzysta: rozmowa zawsze kończy się wiadomością ucznia; do modelu i tak idzie przycięta końcówka
const MAX_ATTACHMENTS = 3;
const DEFAULT_PROMPT = "Pomóż mi z tym, co załączyłem – wytłumacz krok po kroku.";

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
        subtitle="Wklej zadanie ze szkoły albo z próbnej matury – tekstem, zdjęciem albo PDF-em. Przejdziemy przez nie krok po kroku."
      />
      {settings && !settings.apiKey && <AiSettingsCard intro />}
      {settings?.apiKey && isClient && (
        <>
          <Chat />
          <p className="-mt-3 text-center text-xs text-faint">
            Model: {GROQ_MODELS.find((m) => m.id === settings.model)?.label ?? settings.model} · zmienisz go w{" "}
            <Link href="/ustawienia#ustawienia-ai" className="font-bold underline">
              ustawieniach
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abort.current?.abort(), []);

  async function addFiles(files: File[]) {
    if (files.length === 0 || preparing) return;
    setError(null);
    setPreparing(true);
    let current = attachments;
    try {
      for (const file of files) {
        if (current.length >= MAX_ATTACHMENTS) throw new Error(`Możesz dołączyć najwyżej ${MAX_ATTACHMENTS} pliki do jednej wiadomości.`);
        const slots = MAX_IMAGES - current.reduce((n, a) => n + imageCount(a), 0);
        let added: Attachment;
        if (isPdf(file)) {
          added = await preparePdf(file, slots);
          if (!pdfHasContent(added)) {
            throw new Error(`„${file.name}” to skan bez tekstu, a limit ${MAX_IMAGES} obrazów jest już zajęty – usuń któreś zdjęcie.`);
          }
        } else if (isImage(file)) {
          if (slots <= 0) throw new Error(`Groq przyjmuje najwyżej ${MAX_IMAGES} obrazy na wiadomość (zdjęcia + skany z PDF-ów).`);
          added = await prepareImage(file, file.name);
        } else {
          throw new Error(`„${file.name}” – obsługuję tylko zdjęcia i pliki PDF.`);
        }
        current = [...current, added];
        setAttachments(current);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się dodać pliku.");
    } finally {
      setPreparing(false);
    }
  }

  function removeAttachment(id: string) {
    setAttachments((list) => list.filter((a) => a.id !== id));
  }

  async function changeRange(pdf: PdfAttachment, from: number, to: number) {
    setError(null);
    setPreparing(true);
    try {
      const slots = MAX_IMAGES - attachments.reduce((n, a) => n + (a.id === pdf.id ? 0 : imageCount(a)), 0);
      const updated = await setPdfRange(pdf, from, to, slots);
      setAttachments((list) => list.map((a) => (a.id === pdf.id ? updated : a)));
    } catch {
      setError("Nie udało się odczytać tych stron.");
    } finally {
      setPreparing(false);
    }
  }

  async function send() {
    const text = input.trim();
    if ((!text && attachments.length === 0) || streaming || preparing) return;
    const sent = attachments;
    setError(null);
    setInput("");
    setAttachments([]);
    const history = [...messages, userMessage(text, sent)].slice(-MAX_HISTORY);
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
      setAttachments(sent);
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
    setAttachments([]);
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
              className="rounded-2xl border border-line glass-card p-4 text-left shadow-card card-hover hover:border-brand/40"
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
            <li key={i} className="ml-auto flex max-w-[85%] flex-col items-end gap-2">
              <SentAttachments message={m} />
              <p className="whitespace-pre-wrap rounded-3xl rounded-br-lg bg-brand px-4 py-3 text-white shadow-float">{m.content}</p>
            </li>
          ) : (
            <li key={i} className="flex max-w-[95%] gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <div className="min-w-0 rounded-3xl rounded-tl-lg border border-line glass-card px-4 py-3 text-body shadow-card">
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
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles([...e.dataTransfer.files]);
        }}
        className={`sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] flex flex-col gap-2 rounded-3xl border bg-card p-2 shadow-card transition-colors lg:bottom-6 ${
          dragging ? "border-brand ring-2 ring-brand/30" : "border-line"
        }`}
      >
        {(attachments.length > 0 || preparing) && (
          <div className="flex flex-wrap gap-2 px-1 pt-1">
            {attachments.map((a) =>
              a.kind === "image" ? (
                <ImageChip key={a.id} image={a} onRemove={() => removeAttachment(a.id)} />
              ) : (
                <PdfChip
                  key={a.id}
                  pdf={a}
                  disabled={preparing}
                  onRemove={() => removeAttachment(a.id)}
                  onRange={(from, to) => changeRange(a, from, to)}
                />
              ),
            )}
            {preparing && (
              <span className="flex h-14 items-center gap-2 rounded-2xl bg-subtle px-3 text-xs font-bold text-muted">
                <TypingDots />
                Czytam plik…
              </span>
            )}
          </div>
        )}

        <div className="flex items-end gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf,.pdf"
            multiple
            hidden
            onChange={(e) => {
              addFiles([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={preparing || attachments.length >= MAX_ATTACHMENTS}
            aria-label="Dołącz zdjęcie lub PDF"
            title="Dołącz zdjęcie lub PDF"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-muted transition-colors hover:bg-subtle hover:text-ink disabled:opacity-40"
          >
            <Icon name="paperclip" className="h-5 w-5" />
          </button>
          <label htmlFor="tutor-input" className="sr-only">
            Wiadomość do korepetytora
          </label>
          <textarea
            id="tutor-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const files = [...e.clipboardData.files];
              if (files.length === 0) return;
              e.preventDefault();
              addFiles(files);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                e.preventDefault();
                send();
              }
            }}
            rows={Math.min(8, Math.max(1, input.split("\n").length))}
            placeholder="Wklej treść zadania, zdjęcie albo PDF… (wzory możesz pisać zwykłym tekstem)"
            className="max-h-60 min-h-11 flex-1 resize-none bg-transparent px-2 py-2.5 text-ink placeholder:text-faint focus:outline-none"
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
              disabled={(!input.trim() && attachments.length === 0) || preparing}
              aria-label="Wyślij"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-float transition-colors active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              <Icon name="send" className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
      <p className="-mt-2 text-center text-xs text-faint">
        Korepetytor może się pomylić – sprawdzaj obliczenia i porównuj z kluczem CKE. Zdjęcia i skany czyta model {VISION_MODEL_LABEL} (do{" "}
        {MAX_IMAGES} na wiadomość).
      </p>
    </div>
  );
}

function userMessage(text: string, files: Attachment[]): ChatMessage {
  if (files.length === 0) return { role: "user", content: text };
  const pdfs = files.filter((a): a is PdfAttachment => a.kind === "pdf");
  const images = files.flatMap((a) => (a.kind === "image" ? [a.dataUrl] : a.scans.map((s) => s.dataUrl)));
  return {
    role: "user",
    content: text || DEFAULT_PROMPT,
    images: images.length ? images : undefined,
    context: pdfs.length ? pdfs.map(pdfContext).join("\n\n") : undefined,
    files: pdfs.length ? pdfs.map((p) => ({ name: p.name, detail: pageLabel(p) })) : undefined,
  };
}

function pageLabel(pdf: PdfAttachment) {
  const range = pdf.from === pdf.to ? `str. ${pdf.from}` : `str. ${pdf.from}–${pdf.to}`;
  return `${range} z ${pdf.pageCount}${pdf.scans.length ? ` · skany: ${pdf.scans.length}` : ""}`;
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-card text-muted shadow-card hover:text-ink"
    >
      <Icon name="close" className="h-3.5 w-3.5" />
    </button>
  );
}

function ImageChip({ image, onRemove }: { image: ImageAttachment; onRemove: () => void }) {
  return (
    <span className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- podgląd lokalnego data URL */}
      <img src={image.dataUrl} alt={image.name} className="h-14 w-14 rounded-2xl border border-line object-cover" />
      <RemoveButton label={`Usuń ${image.name}`} onClick={onRemove} />
    </span>
  );
}

function PdfChip({
  pdf,
  disabled,
  onRemove,
  onRange,
}: {
  pdf: PdfAttachment;
  disabled: boolean;
  onRemove: () => void;
  onRange: (from: number, to: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const parsed = parsePageRange(value, pdf.pageCount);

  function apply() {
    if (!parsed) return;
    onRange(parsed.from, parsed.to);
    setEditing(false);
  }

  return (
    <span className="relative flex h-14 max-w-full items-center gap-2.5 rounded-2xl border border-line bg-subtle py-2 pl-3 pr-4">
      <Icon name="file" className="h-5 w-5 shrink-0 text-rose-500" />
      <span className="min-w-0">
        <span className="block max-w-44 truncate text-sm font-bold text-ink">{pdf.name}</span>
        {editing ? (
          <span className="flex items-center gap-1">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder={`np. 3-5 (1–${pdf.pageCount})`}
              aria-label="Zakres stron"
              className="w-28 rounded-lg border border-line bg-card px-1.5 py-0.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button type="button" disabled={!parsed} onClick={apply} className="rounded-lg px-1.5 py-0.5 text-xs font-bold text-brand disabled:text-faint">
              OK
            </button>
          </span>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setValue(pdf.from === pdf.to ? String(pdf.from) : `${pdf.from}-${pdf.to}`);
              setEditing(true);
            }}
            title="Zmień zakres stron"
            className="text-xs font-semibold text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            {pageLabel(pdf)}
          </button>
        )}
      </span>
      <RemoveButton label={`Usuń ${pdf.name}`} onClick={onRemove} />
    </span>
  );
}

function SentAttachments({ message }: { message: ChatMessage }) {
  if (!message.images?.length && !message.files?.length) return null;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {message.files?.map((f, i) => (
        <span key={i} className="flex items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2 shadow-card">
          <Icon name="file" className="h-4 w-4 shrink-0 text-rose-500" />
          <span className="min-w-0">
            <span className="block max-w-48 truncate text-sm font-bold text-ink">{f.name}</span>
            <span className="block text-xs text-muted">{f.detail}</span>
          </span>
        </span>
      ))}
      {message.images?.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- lokalny data URL
        <img key={i} src={url} alt={`Załącznik ${i + 1}`} className="h-28 w-28 rounded-2xl border border-line object-cover shadow-card" />
      ))}
    </div>
  );
}
