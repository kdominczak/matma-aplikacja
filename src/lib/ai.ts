import { explainMessage, hintMessage, SYSTEM, type QuestionPayload } from "@/lib/ai-prompts";
import { getAiSettings, VISION_MODEL } from "@/lib/ai-settings";
import { MAX_IMAGES } from "@/lib/attachments";
import type { OptionKey, QuizQuestion } from "@/types/quiz";

// Groq (API zgodne z OpenAI) wołany prosto z aplikacji – Groq zezwala na CORS z przeglądarki i WebView.
const GROQ_URL = "https://api.groq.com/openai/v1";

// Darmowy plan Groq ma limit tokenów na minutę – historię czatu przycinamy do ok. 3–4K tokenów.
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
  | { mode: "hint"; question: QuestionPayload; level: number; previousHints: string[] };

export function toAiQuestion(question: QuizQuestion, chosen?: OptionKey): QuestionPayload {
  return {
    label: question.label,
    prompt: question.prompt,
    options: question.options,
    correct: question.correct,
    chosen,
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
  const code: string | undefined = body?.error?.code;
  if (response.status === 401) return "Klucz Groq jest nieprawidłowy – sprawdź go w ustawieniach korepetytora.";
  if (response.status === 429) return "Wyczerpałeś limit darmowego planu Groq – spróbuj za minutę (albo jutro, jeśli to limit dzienny).";
  if (vision && (code === "model_not_found" || code === "model_decommissioned" || response.status === 404 || response.status === 403)) {
    return "Model czytający zdjęcia (Qwen 3.8) jest niedostępny dla Twojego klucza – wyślij treść zadania tekstem.";
  }
  if (vision && (response.status === 400 || response.status === 413)) {
    return "Groq nie przyjął załączników (za duże albo nieczytelne) – spróbuj mniejszego zdjęcia lub mniej stron PDF-a.";
  }
  if (code === "model_not_found" || code === "model_decommissioned" || response.status === 404) {
    return "Ten model nie jest dostępny dla Twojego klucza – wybierz inny w ustawieniach korepetytora.";
  }
  return `Korepetytor jest chwilowo niedostępny (błąd ${response.status}).`;
}

/**
 * Wysyła zapytanie do Groq i przekazuje kolejne fragmenty odpowiedzi do `onText` (cały dotychczasowy tekst).
 * Zwraca pełną odpowiedź. Przerwanie przez `signal` kończy bez błędu.
 */
export async function streamAi(
  request: AiRequest,
  onText: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const settings = await getAiSettings();
  if (!settings.apiKey) throw new Error("Najpierw podłącz darmowy klucz Groq w ustawieniach korepetytora.");

  const { messages, effort, maxTokens, vision } = buildRequest(request);
  // wybrane modele nie widzą obrazów – zapytanie ze zdjęciem idzie do modelu z obsługą obrazów
  const model = vision ? VISION_MODEL : settings.model;
  let response: Response;
  try {
    response = await fetch(`${GROQ_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${settings.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_completion_tokens: maxTokens,
        // modele gpt-oss rozumują przed odpowiedzią – ukrywamy to i dobieramy wysiłek do zadania
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: effort, include_reasoning: false } : {}),
        ...(model === VISION_MODEL ? { reasoning_effort: effort, reasoning_format: "hidden" } : {}),
      }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) return "";
    throw new Error("Nie udało się połączyć z korepetytorem. Sprawdź internet i spróbuj ponownie.", { cause: error });
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

/** Sprawdza klucz Groq lekkim zapytaniem o listę modeli. */
export async function verifyGroqKey(apiKey: string): Promise<"ok" | "invalid" | "offline"> {
  try {
    const response = await fetch(`${GROQ_URL}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
    return response.ok ? "ok" : "invalid";
  } catch {
    return "offline";
  }
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
  const options = (["A", "B", "C", "D"] as const).map((k) => `${k}. ${question.options[k]}`).join("\n");
  const answer = chosen ? `\n\nZaznaczyłem odpowiedź ${chosen}, a poprawna to ${question.correct}. Nie rozumiem dlaczego.` : "";
  return `${question.prompt}\n\n${options}${answer}`;
}
