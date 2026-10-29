// Pomiar trafności oceniania AI na zestawie testowym (scripts/grading-eval/cases.ts).
//
//   GROQ_API_KEY=gsk_... npm run grading:eval              – wszystkie przypadki prosto do Groq (klucz tylko w terminalu,
//                                                             nigdy w .env aplikacji)
//   MATMA_TOKEN=<JWT> npm run grading:eval -- --przez-funkcje --limit 2   (albo --tylko id1,id2)
//                                                           – przez funkcję `ai` (pełna ścieżka produkcyjna; zużywa limit
//                                                             konta, więc najlepiej konto testowe z Premium)
//
// Wynik: zgodność sumy punktów (dokładnie i ±1), zgodność kroków, odporność na manipulację, nieczytelne odpowiedzi.
// Ten sam prompt i to samo odczytanie co w aplikacji (src/lib/ai-grading.ts) – mierzymy dokładnie to, co dostanie uczeń.

import { readFileSync } from "node:fs";
import { TEXT_MODEL } from "@/lib/ai-config";
import { GRADING_SYSTEM, gradingUserMessage, parseGrading } from "@/lib/ai-grading";
import { practiceTasks, topics } from "@/data/topics";
import type { OpenQuestion } from "@/types/quiz";
import { GRADING_CASES } from "./cases";

const OPEN_TASKS = new Map(
  topics.flatMap(practiceTasks).flatMap((t) => (t.kind === "open" ? [[t.id, t.task as OpenQuestion] as const] : [])),
);

const args = process.argv.slice(2);
const viaFunction = args.includes("--przez-funkcje");
const limitArg = args.indexOf("--limit");
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;
const onlyArg = args.indexOf("--tylko");
const only = onlyArg >= 0 ? new Set(args[onlyArg + 1].split(",")) : null;

function env(name: string): string | undefined {
  if (process.env[name]) return process.env[name];
  try {
    const line = readFileSync(".env.local", "utf8").split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).trim().replace(/^"|"$/g, "");
  } catch {
    return undefined;
  }
}

function body(task: OpenQuestion, solution: string) {
  return {
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: GRADING_SYSTEM },
      { role: "user", content: gradingUserMessage(task, solution) },
    ],
    max_completion_tokens: 4096, // ukryte rozumowanie modelu też zużywa tokeny – za mało = ucięty JSON
    reasoning_effort: "medium",
    include_reasoning: false,
    temperature: 0,
  };
}

async function askGroq(task: OpenQuestion, solution: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Brak GROQ_API_KEY w zmiennych środowiskowych (albo użyj --przez-funkcje z MATMA_TOKEN).");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body(task, solution)),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  return (await res.json()).choices[0].message.content as string;
}

async function askFunction(task: OpenQuestion, solution: string): Promise<string> {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const token = process.env.MATMA_TOKEN;
  if (!url || !anon || !token) throw new Error("Tryb --przez-funkcje potrzebuje NEXT_PUBLIC_SUPABASE_URL/ANON_KEY (.env.local) i MATMA_TOKEN.");
  const res = await fetch(`${url}/functions/v1/ai`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body(task, solution), stream: true }),
  });
  if (!res.ok) throw new Error(`Funkcja ai ${res.status}: ${await res.text()}`);
  // strumień SSE → tekst
  let text = "";
  for (const line of (await res.text()).split("\n")) {
    const data = line.startsWith("data:") ? line.slice(5).trim() : "";
    if (!data || data === "[DONE]") continue;
    text += JSON.parse(data).choices?.[0]?.delta?.content ?? "";
  }
  return text;
}

async function main() {
  const cases = GRADING_CASES.filter((c) => !only || only.has(c.id)).slice(0, limit);
  let exact = 0;
  let within1 = 0;
  let stepsOk = 0;
  let stepsAll = 0;
  let unreadable = 0;
  const misses: string[] = [];

  for (const c of cases) {
    const task = OPEN_TASKS.get(c.taskId);
    if (!task) throw new Error(`Brak zadania otwartego ${c.taskId}`);
    const raw = await (viaFunction ? askFunction(task, c.solution) : askGroq(task, c.solution));
    const grading = parseGrading(raw, task);
    if (!grading) {
      unreadable++;
      misses.push(`${c.id}: nieczytelna odpowiedź (${raw.length} znaków):\n${raw}`);
      continue;
    }
    // jak w aplikacji: punkty obcięte do schematu
    const got = grading.steps.map((p, i) => Math.max(0, Math.min(task.solution[i].points, Math.round(p))));
    const sumGot = got.reduce((a, b) => a + b, 0);
    const sumExp = c.expected.reduce((a, b) => a + b, 0);
    if (sumGot === sumExp) exact++;
    if (Math.abs(sumGot - sumExp) <= 1) within1++;
    got.forEach((p, i) => {
      stepsAll++;
      if (p === c.expected[i]) stepsOk++;
    });
    const mark = sumGot === sumExp ? "✓" : Math.abs(sumGot - sumExp) <= 1 ? "≈" : "✗";
    console.log(`${mark} ${c.id.padEnd(22)} oczekiwane ${JSON.stringify(c.expected)} = ${sumExp}, AI ${JSON.stringify(got)} = ${sumGot}`);
    if (sumGot !== sumExp) misses.push(`${c.id} (${c.why}):\n   ${grading.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n   ")}`);
  }

  const n = cases.length;
  const pct = (x: number, of = n) => `${Math.round((x / of) * 100)}%`;
  console.log(`\nPrzypadków: ${n} (${viaFunction ? "przez funkcję ai" : `Groq, ${TEXT_MODEL}`})`);
  console.log(`Suma punktów dokładnie: ${exact}/${n} (${pct(exact)}), z dokładnością ±1: ${within1}/${n} (${pct(within1)})`);
  console.log(`Kroki zgodne: ${stepsOk}/${stepsAll} (${pct(stepsOk, stepsAll || 1)}), nieczytelne odpowiedzi: ${unreadable}`);
  if (misses.length) console.log(`\nRozbieżności:\n${misses.join("\n")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
