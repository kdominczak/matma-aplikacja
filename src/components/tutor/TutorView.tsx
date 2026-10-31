"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Page, PageHeader } from "@/components/layout/AppShell";
import { TypingDots } from "@/components/quiz/ExplainSheet";
import AiLimitCard from "@/components/premium/AiLimitCard";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import RichText from "@/components/ui/RichText";
import { streamAi, takeTutorDraft, type ChatMessage } from "@/lib/ai";
import { AI_ENABLED, VISION_MODEL_LABEL } from "@/lib/ai-config";
import { TUTOR_STYLES, type TutorStyle } from "@/lib/ai-prompts";
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
import { useExamAttempts } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import { AI_PREMIUM_DAILY_LIMIT, AiLimitError, isPremium, usePremium } from "@/lib/premium";
import { useProgress } from "@/lib/progress";
import { tutorSuggestions, type TutorSuggestion } from "@/lib/tutor-suggestions";

const MAX_HISTORY = 29; // nieparzysta: rozmowa zawsze kończy się wiadomością ucznia; do modelu i tak idzie przycięta końcówka
const MAX_ATTACHMENTS = 3;
const DEFAULT_PROMPT = "Pomóż mi z tym, co jest w załączniku – wytłumacz krok po kroku.";

// Czat renderujemy dopiero w przeglądarce – szkic zadania czeka w sessionStorage.
const noop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export default function TutorView() {
  const isClient = useIsClient();

  return (
    <Page width="reading">
      <PageHeader
        title="Korepetytor AI"
        subtitle="Masz zadanie, którego nie umiesz ruszyć? Zrób mu zdjęcie albo wklej treść – naprowadzę Cię, pokażę rozwiązanie albo sprawdzę Twoje."
      />
      {!AI_ENABLED ? (
        <p className="card p-5 text-sm text-muted">Korepetytor AI nie jest dostępny w tej wersji aplikacji.</p>
      ) : (
        isClient && (
          <>
            <Chat />
            <AiQuotaLine />
          </>
        )
      )}
    </Page>
  );
}

/** „Zostały 3 z 5 wiadomości na dziś” pod czatem – limit nie zaskakuje ucznia. */
function AiQuotaLine() {
  const premium = usePremium();
  if (premium.status !== "ready") return null;
  const left = Math.max(0, premium.aiLimit - premium.aiUsed);
  return (
    <p className="-mt-3 text-center text-xs text-faint">
      {isPremium(premium) ? `Premium – do ${AI_PREMIUM_DAILY_LIMIT} wiadomości dziennie` : `Zostało ${left} z ${premium.aiLimit} wiadomości na dziś`} ·{" "}
      <Link href="/premium" className="font-bold underline">
        {isPremium(premium) ? "szczegóły" : "więcej z Premium"}
      </Link>
    </p>
  );
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [limited, setLimited] = useState(false);
  const [input, setInput] = useState(takeTutorDraft);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [style, setStyle] = useState<TutorStyle>("naprowadz");
  const abort = useRef<AbortController | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
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
          if (slots <= 0) throw new Error(`Korepetytor przyjmuje najwyżej ${MAX_IMAGES} obrazy na wiadomość (zdjęcia + skany z PDF-ów).`);
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
        { mode: "tutor", messages: history, style },
        (reply) => setMessages([...history, { role: "assistant", content: reply }]),
        controller.signal,
      );
    } catch (e) {
      if (e instanceof AiLimitError) setLimited(true);
      else setError(e instanceof Error ? e.message : "Nie udało się połączyć z korepetytorem.");
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

  function applySuggestion(suggestion: TutorSuggestion) {
    hapticTap();
    setInput(suggestion.text);
    setStyle(suggestion.style);
    inputRef.current?.focus();
  }

  // pole rośnie razem z tekstem (do ok. 8 linii), zamiast ucinać wklejone zadanie
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [input]);

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <StartPanel
          onCamera={() => cameraRef.current?.click()}
          onFiles={() => fileRef.current?.click()}
          onSuggestion={applySuggestion}
          busy={preparing}
        />
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
              <p className="whitespace-pre-wrap rounded-3xl rounded-br-lg bg-brand px-4 py-3 text-on-brand shadow-float">{m.content}</p>
            </li>
          ) : (
            <li key={i} className="flex max-w-[95%] gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <div className="card min-w-0 rounded-tl-lg px-4 py-3 text-body">
                {m.content ? <RichText text={m.content} /> : <TypingDots />}
              </div>
            </li>
          ),
        )}
      </ol>

      {limited && <AiLimitCard />}
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

        <div role="radiogroup" aria-label="Jak mam pomóc?" className="grid grid-cols-3 gap-1 px-1 pt-1">
          {(Object.keys(TUTOR_STYLES) as TutorStyle[]).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={style === id}
              title={TUTOR_STYLES[id].hint}
              onClick={() => setStyle(id)}
              className={`min-h-9 rounded-full px-2 text-xs font-bold transition-colors ${
                style === id ? "bg-brand text-on-brand" : "bg-subtle text-muted hover:text-ink"
              }`}
            >
              {TUTOR_STYLES[id].label}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-1">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => {
              addFiles([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
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
            rows={1}
            placeholder="Napisz albo wklej zadanie…"
            className="max-h-60 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-ink placeholder:text-faint focus:outline-none"
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand shadow-float transition-colors active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
            >
              <Icon name="send" className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
      <p className="-mt-2 text-center text-xs text-faint">
        Korepetytor może się pomylić – sprawdzaj obliczenia. Zdjęcia czyta model {VISION_MODEL_LABEL} (do {MAX_IMAGES} na wiadomość).
      </p>
    </div>
  );
}

/**
 * Pusty czat: najpierw to, z czym uczeń przychodzi naprawdę – zdjęcie albo wklejone zadanie – a pod spodem
 * „Twoje zadania” (ostatni arkusz, Pudełko porażek, najsłabszy dział).
 */
function StartPanel({
  onCamera,
  onFiles,
  onSuggestion,
  busy,
}: {
  onCamera: () => void;
  onFiles: () => void;
  onSuggestion: (s: TutorSuggestion) => void;
  busy: boolean;
}) {
  const progress = useProgress();
  const attempts = useExamAttempts();
  const suggestions = progress ? tutorSuggestions(progress, attempts ?? []) : [];

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCamera}
          disabled={busy}
          className="flex min-h-24 flex-col items-start justify-between gap-2 rounded-3xl bg-brand p-4 text-left text-on-brand shadow-float btn-hover active:bg-brand-dark disabled:opacity-60"
        >
          <Icon name="camera" className="h-6 w-6" />
          <span>
            <span className="block font-extrabold">Zrób zdjęcie zadania</span>
            <span className="block text-xs text-white/80">z zeszytu, książki, arkusza</span>
          </span>
        </button>
        <button
          onClick={onFiles}
          disabled={busy}
          className="card card-hover flex min-h-24 flex-col items-start justify-between gap-2 p-4 text-left hover:border-brand/40 disabled:opacity-60"
        >
          <Icon name="image" className="h-6 w-6 text-brand" />
          <span>
            <span className="block font-extrabold text-ink">Z galerii albo PDF</span>
            <span className="block text-xs text-muted">zrzut ekranu, skan, arkusz</span>
          </span>
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-faint">Twoje zadania</p>
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSuggestion(s)}
              className="card card-hover flex items-center gap-3 p-4 text-left hover:border-brand/40"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-brand">{s.source}</span>
                <MathText text={s.title} className="line-clamp-1 font-bold text-ink" />
                <span className="block text-xs text-muted">{TUTOR_STYLES[s.style].hint}</span>
              </span>
              <Icon name="chevron" className="h-4 w-4 shrink-0 text-faint" />
            </button>
          ))}
        </div>
      )}
    </section>
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
