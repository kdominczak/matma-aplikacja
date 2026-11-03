import type { QuestionPayload, TutorStyle } from "@/lib/ai-prompts";
import { gradingUserMessage, NO_SOLUTION, parseGrading, type Grading } from "@/lib/ai-grading";
import { AI_ENABLED } from "@/lib/ai-config";
import { MAX_IMAGES } from "@/lib/attachments";
import { displayedOptions, displayKey } from "@/lib/options";
import { AccountRequiredError, AI_FUNCTION_URL, AiLimitError, aiRequestHeaders, GradingLimitError, noteAiRemaining, noteGradingRemaining, PremiumRequiredError } from "@/lib/premium";
import type { OpenQuestion, OptionKey, QuizQuestion } from "@/types/quiz";
import type { Level } from "@/types/topic";

// AI idzie wyłącznie przez naszą funkcję serwerową `ai` (supabase/functions/ai): token ucznia → dzienny limit
// w bazie → Groq kluczem z sekretów → strumień SSE z powrotem. Aplikacja nie zna żadnego klucza Groq.
// Aplikacja wysyła tylko `purpose` i dane (rozmowę, zadanie, zdjęcia) – prompt systemowy, model i limit tokenów
// dokłada serwer (supabase/functions/_shared/chat.ts i grading.ts).

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

export type AiRequest =
  | { mode: "tutor"; messages: ChatMessage[]; style?: TutorStyle }
  | { mode: "explain"; question: QuestionPayload }
  | { mode: "hint"; question: QuestionPayload; level: number; previousHints: string[] }
  | { mode: "grade"; task: OpenQuestion; solution: string; level: Level }
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
  /** Treść zapytania do funkcji `ai` – `purpose` i dane, bez promptu i modelu. */
  body: Record<string, unknown>;
  /** Zapytanie ze zdjęciami – inny komunikat przy odrzuconych załącznikach. */
  vision?: boolean;
}

function buildRequest(request: AiRequest): BuiltRequest {
  switch (request.mode) {
    case "tutor": {
      const { messages, images } = tutorMessages(trimHistory(request.messages));
      // tryb pomocy wybrany przez ucznia (naprowadź / pełne rozwiązanie / sprawdź) – instrukcję dokłada serwer
      return { body: { purpose: "tutor", style: request.style ?? "naprowadz", messages }, vision: images > 0 };
    }
    case "explain":
      return { body: { purpose: "explain", question: request.question } };
    case "hint":
      return { body: { purpose: "hint", question: request.question, level: request.level, previousHints: request.previousHints } };
    case "grade":
      return { body: { purpose: "grade", level: request.level, messages: [{ role: "user", content: gradingUserMessage(request.task, request.solution) }] } };
    case "transcribe":
      return {
        body: {
          purpose: "transcribe",
          messages: [{ role: "user", content: request.images.slice(0, MAX_IMAGES).map((url) => ({ type: "image_url" as const, image_url: { url } })) }],
        },
        vision: true,
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

  const { body: requestBody, vision } = buildRequest(request);
  const payload = JSON.stringify(requestBody);
  const send = async (refreshSession: boolean) =>
    fetch(AI_FUNCTION_URL, { method: "POST", headers: await aiRequestHeaders(refreshSession), body: payload, signal });

  let response: Response;
  try {
    response = await send(false);
    // 401 z naszej funkcji = tylko sesja (np. token unieważniony) – jedna próba z odświeżoną
    if (response.status === 401) response = await send(true);
  } catch (error) {
    if (signal?.aborted) return "";
    // brak konta albo AI wyłączone w tej wersji – to nie jest problem z siecią
    if (error instanceof AccountRequiredError || (error instanceof Error && error.message.includes("nie jest dostępna w tej wersji"))) throw error;
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
    if (response.status === 403 && body?.error === "account_required") throw new AccountRequiredError();
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
 * applyAssessment (obcięcie do schematu). Trafność mierzy `npm run grading:eval`. `level` – poziom arkusza (na
 * rozszerzeniu serwer dokłada zasady pełnego uzasadnienia i warunków zadania).
 */
export async function gradeSolution(
  task: OpenQuestion,
  solution: string,
  { level = "podstawowy", signal, delays }: { level?: Level; signal?: AbortSignal; delays?: number[] } = {},
): Promise<Grading | null> {
  const text = await retryWhenBusy(() => streamAi({ mode: "grade", task, solution, level }, () => {}, signal), signal, delays);
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
