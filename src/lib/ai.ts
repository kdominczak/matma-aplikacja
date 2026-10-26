import { explainMessage, hintMessage, SYSTEM, type QuestionPayload } from "@/lib/ai-prompts";
import { getAiSettings } from "@/lib/ai-settings";
import type { OptionKey, QuizQuestion } from "@/types/quiz";

// Groq (API zgodne z OpenAI) wołany prosto z aplikacji – Groq zezwala na CORS z przeglądarki i WebView.
const GROQ_URL = "https://api.groq.com/openai/v1";

// Darmowy plan Groq ma limit tokenów na minutę – historię czatu przycinamy do ok. 3–4K tokenów.
const MAX_HISTORY_CHARS = 12_000;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  let total = 0;
  let start = messages.length;
  while (start > 0 && total + messages[start - 1].content.length <= MAX_HISTORY_CHARS) {
    total += messages[start - 1].content.length;
    start--;
  }
  if (start === messages.length) start = messages.length - 1; // ostatnia wiadomość ucznia zawsze idzie
  if (messages[start].role !== "user") start++;
  return messages.slice(start);
}

function buildRequest(request: AiRequest): { messages: { role: string; content: string }[]; effort: Effort; maxTokens: number } {
  switch (request.mode) {
    case "tutor":
      return {
        messages: [{ role: "system", content: SYSTEM.tutor }, ...trimHistory(request.messages)],
        effort: "medium",
        maxTokens: 2048,
      };
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

async function errorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  const code: string | undefined = body?.error?.code;
  if (response.status === 401) return "Klucz Groq jest nieprawidłowy – sprawdź go w ustawieniach korepetytora.";
  if (response.status === 429) return "Wyczerpałeś limit darmowego planu Groq – spróbuj za minutę (albo jutro, jeśli to limit dzienny).";
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
  const { apiKey, model } = await getAiSettings();
  if (!apiKey) throw new Error("Najpierw podłącz darmowy klucz Groq w ustawieniach korepetytora.");

  const { messages, effort, maxTokens } = buildRequest(request);
  let response: Response;
  try {
    response = await fetch(`${GROQ_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_completion_tokens: maxTokens,
        // modele gpt-oss rozumują przed odpowiedzią – ukrywamy to i dobieramy wysiłek do zadania
        ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: effort, include_reasoning: false } : {}),
      }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) return "";
    throw new Error("Nie udało się połączyć z korepetytorem. Sprawdź internet i spróbuj ponownie.", { cause: error });
  }
  if (!response.ok || !response.body) throw new Error(await errorMessage(response));

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
