import { explainMessage, hintMessage, SYSTEM, type QuestionPayload } from "@/lib/ai-prompts";
import { gradingUserMessage, NO_SOLUTION, parseGrading, type Grading } from "@/lib/ai-grading";
import { AI_ENABLED, TEXT_MODEL, VISION_MODEL } from "@/lib/ai-config";
import { MAX_IMAGES } from "@/lib/attachments";
import { displayedOptions, displayKey } from "@/lib/options";
import { AI_FUNCTION_URL, AiLimitError, aiRequestHeaders, GradingLimitError, noteAiRemaining, noteGradingRemaining, PremiumRequiredError } from "@/lib/premium";
import type { OpenQuestion, OptionKey, QuizQuestion } from "@/types/quiz";

// AI idzie wyłącznie przez naszą funkcję serwerową `ai` (supabase/functions/ai): token ucznia → dzienny limit
// w bazie → Groq kluczem z sekretów → strumień SSE z powrotem. Aplikacja nie zna żadnego klucza Groq.

// Groq ma limit tokenów na minutę – historię czatu przycinamy do ok. 3–4K tokenów.
const MAX_HISTORY_CHARS = 12_000;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Zdjęcia i zeskanowane strony (data URL JPEG) – widzi je tylko model z obsługą obrazów. */
  images?: string[];
  /** Tekst z załączonych PDF-ów – idzie do modelu, w dymku pokazujemy tylko nazwę pliku. */
  context?: string;
  /** Opis załączników do dymka czatu. */
  files?: { name: string; detail: string }[];
}

type ContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
type ApiMessage = { role: string; content: string | ContentPart[] };

type Effort = "low" | "medium" | "high";

export type AiRequest =
  | { mode: "tutor"; messages: ChatMessage[] }
  | { mode: "explain"; question: QuestionPayload }
  | { mode: "hint"; question: QuestionPayload; level: number; previousHints: string[] }
  | { mode: "grade"; task: OpenQuestion; solution: string }
  | { mode: "transcribe"; images: string[] };

export function toAiQuestion(question: QuizQuestion, chosen?: OptionKey): QuestionPayload {
  // litery jak na ekranie ucznia (odpowiedzi są tam wymieszane – src/lib/options.ts)
  const options = Object.fromEntries(displayedOptions(question).map((o) => [o.label, o.text])) as Record<OptionKey, string>;
  return {
    label: question.label,
    prompt: question.prompt,
    options,
    correct: displayKey(question, question.correct),
    chosen: chosen && displayKey(question, chosen),
    explanation: question.explanation,
    trap: question.trap,
  };
}

/** Najnowsze wiadomości mieszczące się w budżecie; rozmowa zawsze zaczyna się od ucznia. */
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const size = (m: ChatMessage) => m.content.length + (m.context?.length ?? 0);
  let total = 0;
  let start = messages.length;
  while (start > 0 && total + size(messages[start - 1]) <= MAX_HISTORY_CHARS) {
    total += size(messages[start - 1]);
    start--;
  }
  if (start === messages.length) start = messages.length - 1; // ostatnia wiadomość ucznia zawsze idzie
  if (messages[start].role !== "user") start++;
  return messages.slice(start);
}

/**
 * Wiadomości czatu w formacie API. Groq przyjmuje najwyżej 3 obrazy na zapytanie, więc obrazy dostają
 * najnowsze wiadomości, a starsze zdjęcia zastępujemy krótką notką.
 */
function tutorMessages(messages: ChatMessage[]): { messages: ApiMessage[]; images: number } {
  let budget = MAX_IMAGES;
  const out: ApiMessage[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    let text = m.context ? `${m.content}

${m.context}` : m.content;
    const images = m.images ?? [];
    const shown = images.slice(0, Math.max(0, budget));
    budget -= shown.length;
    if (shown.length < images.length) text += `

[${images.length - shown.length} wcześniej załączone zdjęcie(-a) – już niewidoczne]`;
    out.unshift(
      shown.length
        ? { role: m.role, content: [{ type: "text", text }, ...shown.map((url) => ({ type: "image_url" as const, image_url: { url } }))] }
        : { role: m.role, content: text },
    );
  }
  return { messages: out, images: MAX_IMAGES - budget };
}

interface BuiltRequest {
  messages: ApiMessage[];
  effort: Effort;
  maxTokens: number;
  vision?: boolean;
  /** Ocena zdjęć (Premium): serwer sam ustawia prompt, model i osobny licznik. */
  purpose?: "grade" | "transcribe";
}

function buildRequest(request: AiRequest): BuiltRequest {
  switch (request.mode) {
    case "tutor": {
      const { messages, images } = tutorMessages(trimHistory(request.messages));
      return {
        messages: [{ role: "system", content: SYSTEM.tutor }, ...messages],
        effort: "medium",
        // model z obrazami najpierw „myśli” – zapas na rozumowanie
        maxTokens: images > 0 ? 6144 : 2048,
        vision: images > 0,
      };
    }
    case "explain":
      return {
        messages: [
          { role: "system", content: SYSTEM.explain },
          { role: "user", content: explainMessage(request.question) },
        ],
        effort: "medium",
        maxTokens: 1500,
      };
    case "grade":
      // prompt egzaminatora i model ustawia serwer (_shared/grading.ts) – wysyłamy tylko treść do oceny
      return { messages: [{ role: "user", content: gradingUserMessage(request.task, request.solution) }], effort: "medium", maxTokens: 4096, purpose: "grade" };
    case "transcribe":
      return {
        messages: [{ role: "user", content: request.images.slice(0, MAX_IMAGES).map((url) => ({ type: "image_url" as const, image_url: { url } })) }],
        effort: "low",
        maxTokens: 3000,
        vision: true,
        purpose: "transcribe",
      };
    case "hint":
      return {
        messages: [
          { role: "system", content: SYSTEM.hint },
          { role: "user", content: hintMessage(request.question, request.level, request.previousHints) },
        ],
        effort: "low",
        maxTokens: 600,
      };
  }
}

const TRUNCATED = "\n\n…(odpowiedź została ucięta – napisz „kontynuuj”)";

/** Tekst odpowiedzi z jednej linii SSE (`data: {...}`); pole `reasoning` (tok myślenia modelu) pomijamy. */
export function textFromSseLine(line: string): string {
  if (!line.startsWith("data:")) return "";
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  const choice = JSON.parse(data).choices?.[0];
  const content = typeof choice?.delta?.content === "string" ? choice.delta.content : "";
  return content + (choice?.finish_reason === "length" ? TRUNCATED : "");
}

async function errorMessage(response: Response, vision = false): Promise<string> {
  const body = await response.json().catch(() => null);
  if (response.status === 401) return "Sesja wygasła – spróbuj ponownie za chwilę.";
  // błąd po stronie Groq (funkcja `ai` oddała już wiadomość do limitu) – status Groq w polu `status`
  const upstream = body?.error === "upstream";
  const status = upstream && typeof body.status === "number" ? body.status : response.status;
  const kept = upstream ? " Ta wiadomość nie zmniejszyła Twojego limitu." : "";
  if (status === 429) return `Korepetytor jest teraz mocno obciążony – spróbuj za minutę.${kept}`;
  if (vision && (status === 400 || status === 413)) {
    return "Załączniki są za duże albo nieczytelne – spróbuj mniejszego zdjęcia lub mniej stron PDF-a.";
  }
  return `Korepetytor jest chwilowo niedostępny (błąd ${status}).${kept}`;
}

/**
 * Wysyła zapytanie przez funkcję `ai` i przekazuje kolejne fragmenty odpowiedzi do `onText` (cały dotychczasowy tekst).
 * Zwraca pełną odpowiedź. Przerwanie przez `signal` kończy bez błędu. Wyczerpany limit dzienny → `AiLimitError`.
 */
export async function streamAi(
  request: AiRequest,
  onText: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!AI_ENABLED) throw new Error("Korepetytor AI nie jest dostępny w tej wersji aplikacji.");

  const { messages, effort, maxTokens, vision, purpose } = buildRequest(request);
  // tekst – model najlepszy z matematyki; zdjęcia – model z obsługą obrazów
  const model = vision ? VISION_MODEL : TEXT_MODEL;
  const payload = JSON.stringify({
    ...(purpose ? { purpose } : {}),
    model,
    messages,
    stream: true,
    max_completion_tokens: maxTokens,
    // oba modele rozumują przed odpowiedzią – ukrywamy to i dobieramy wysiłek do zadania
    ...(model === TEXT_MODEL ? { reasoning_effort: effort, include_reasoning: false } : { reasoning_effort: effort, reasoning_format: "hidden" }),
  });
  const send = async (refreshSession: boolean) =>
    fetch(AI_FUNCTION_URL, { method: "POST", headers: await aiRequestHeaders(refreshSession), body: payload, signal });

  let response: Response;
  try {
    response = await send(false);
    // 401 z naszej funkcji = tylko sesja (np. token unieważniony) – jedna próba z odświeżoną
    if (response.status === 401) response = await send(true);
  } catch (error) {
    if (signal?.aborted) return "";
    if (error instanceof Error && error.message.startsWith("Korepetytor AI nie jest dostępny")) throw error;
    throw new Error("Nie udało się połączyć z korepetytorem. Sprawdź internet i spróbuj ponownie.", { cause: error });
  }
  if (response.headers.has("x-ai-remaining")) {
    noteAiRemaining(Number(response.headers.get("x-ai-remaining")), response.headers.get("x-ai-premium") === "1");
  }
  if (response.headers.has("x-grading-remaining")) noteGradingRemaining(Number(response.headers.get("x-grading-remaining")));
  if (!response.ok) {
    const body = await response.clone().json().catch(() => null);
    if (response.status === 429 && body?.error === "limit") throw new AiLimitError();
    if (response.status === 429 && body?.error === "grading_limit") throw new GradingLimitError();
    if (response.status === 403 && body?.error === "premium_required") throw new PremiumRequiredError();
    // Groq przeciążony (jego limit zapytań) – zapytanie wróciło do limitu ucznia, można ponowić
    if (body?.error === "upstream" && body.status === 429) throw new AiBusyError(await errorMessage(response, vision));
  }
  if (!response.ok || !response.body) throw new Error(await errorMessage(response, vision));

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // niepełna linia czeka na kolejny fragment
      const chunk = lines.map(textFromSseLine).join("");
      if (chunk) {
        text += chunk;
        onText(text);
      }
    }
    const rest = textFromSseLine(buffer + decoder.decode());
    if (rest) onText((text += rest));
  } catch (error) {
    if (signal?.aborted) return text;
    throw new Error("Połączenie z korepetytorem zostało przerwane. Spróbuj ponownie.", { cause: error });
  }
  return text;
}

/** Groq chwilowo przeciążony (429 po stronie Groq) – zapytanie nie zmniejszyło limitu, warto ponowić za chwilę. */
export class AiBusyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiBusyError";
  }
}

/** Przerwy między ponowieniami przy przeciążonym Groq (ms) – przy ocenie kilku zadań pod rząd to się zdarza. */
export const BUSY_RETRY_DELAYS = [3_000, 8_000];

async function retryWhenBusy<T>(run: () => Promise<T>, signal?: AbortSignal, delays = BUSY_RETRY_DELAYS): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      if (!(error instanceof AiBusyError) || attempt >= delays.length || signal?.aborted) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
    }
  }
}

/**
 * Zdjęcie kartki → tekst rozwiązania (Premium, licznik ocen). Uczeń widzi wynik i może go poprawić przed oceną.
 * null = na zdjęciu nie ma rozwiązania.
 */
export async function transcribeSolution(images: string[], signal?: AbortSignal, delays?: number[]): Promise<string | null> {
  const text = (await retryWhenBusy(() => streamAi({ mode: "transcribe", images }, () => {}, signal), signal, delays)).trim();
  return !text || text.includes(NO_SOLUTION) ? null : text;
}

/**
 * Ocena rozwiązania zadania otwartego przez AI według schematu (src/lib/ai-grading.ts; Premium, licznik ocen).
 * null = odpowiedź modelu nieczytelna (pokaż samoocenę). Punkty trzeba jeszcze przepuścić przez
 * applyAssessment (obcięcie do schematu). Trafność mierzy `npm run grading:eval`.
 */
export async function gradeSolution(task: OpenQuestion, solution: string, signal?: AbortSignal, delays?: number[]): Promise<Grading | null> {
  const text = await retryWhenBusy(() => streamAi({ mode: "grade", task, solution }, () => {}, signal), signal, delays);
  return parseGrading(text, task);
}

// ── Przekazanie zadania do ekranu korepetytora (np. z „Dopytaj korepetytora”) ──

const DRAFT_KEY = "tutor-draft";

export function setTutorDraft(text: string) {
  try {
    sessionStorage.setItem(DRAFT_KEY, text);
  } catch {
    // brak storage – korepetytor otworzy się po prostu pusty
  }
}

export function takeTutorDraft(): string {
  try {
    const draft = sessionStorage.getItem(DRAFT_KEY) ?? "";
    sessionStorage.removeItem(DRAFT_KEY);
    return draft;
  } catch {
    return "";
  }
}

/** Treść zadania gotowa do wklejenia w czat. */
export function questionAsText(question: QuizQuestion, chosen?: OptionKey): string {
  const options = displayedOptions(question).map((o) => `${o.label}. ${o.text}`).join("\n");
  const answer = chosen
    ? `\n\nMoja odpowiedź: ${displayKey(question, chosen)}, a poprawna to ${displayKey(question, question.correct)}. Nie rozumiem dlaczego.`
    : "";
  return `${question.prompt}\n\n${options}${answer}`;
}
