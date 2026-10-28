import { allQuestionRefs, DIFFICULTIES, findQuestion, formulaGroup, placementQuestions, topics, topicsForTarget, type QuestionRef } from "@/data/topics";
import { seededRandom, shuffled } from "@/lib/random";
import { topicExamPoints } from "@/lib/exam-weights";
import { LEVEL_MASTERED, levelStat, MIN_ANSWERS, smoothedAccuracy, topicMastery } from "@/lib/mastery";
import { dueReviews } from "@/lib/reviews";
import { dayKey, parseDay, testKey } from "@/lib/stats";
import type { Progress } from "@/types/progress";
import type { QuizQuestion } from "@/types/quiz";
import type { Difficulty, FormulaGroup, Topic } from "@/types/topic";

export { topicMastery };

// „Plan na dziś” – krótka, codzienna sesja ułożona pod ucznia (bez AI, liczona na urządzeniu):
// 1. Powtórki: zadania, których termin powtórki minął (src/lib/reviews.ts) – utrwalanie zamiast zapominania.
// 2. Dział dnia: największy możliwy zysk punktów na maturze = waga działu × to, czego jeszcze brakuje
//    (z celu ucznia; poziom trudności dobrany do jego skuteczności).
// 3. Przeplatanie: 2 zadania z drugiego działu – mieszanie tematów lepiej uczy rozpoznawać typ zadania.
// Plan jest stały w ciągu dnia (ziarno losowania = dzień + numer rundy), kolejna runda daje nowe zadania.

export const MAX_REVIEWS = 5;
const FOCUS_COUNT = 5;
const MIX_COUNT = 2;
/** Docelowa długość sesji – brakujące powtórki uzupełniamy zadaniami z działu dnia. */
const SESSION_SIZE = 10;
const MINUTES_PER_TASK = 1.5;

export interface PlanItem {
  question: QuizQuestion;
  topic: Topic;
  difficulty: Difficulty;
  kind: "review" | "focus" | "mix";
}

export interface PlanFocus {
  topic: Topic;
  difficulty: Difficulty;
  /** Średnio tyle punktów daje dział na maturze. */
  examPoints: number;
  /** Skuteczność ucznia w dziale (0–1) albo null, gdy jeszcze go nie ćwiczył. */
  accuracy: number | null;
  /** Na ilu odpowiedziach opiera się skuteczność (przy kilku – komunikat „Ostatnio 1/3”, a nie procent). */
  answered: number;
  correct: number;
}

export interface DailyPlan {
  day: string;
  /** Która to dziś runda (0 = pierwsza, plan „wykonany”, gdy ≥ 1). */
  round: number;
  items: PlanItem[];
  reviewCount: number;
  focus: PlanFocus | null;
  mix: Topic | null;
  minutes: number;
  formulaGroups: FormulaGroup[];
}

/** Pierwszy poziom, którego uczeń jeszcze nie opanował (opanowany dział – najtrudniejszy, na utrzymanie formy). */
function nextLevel(progress: Progress, topic: Topic): Difficulty {
  for (const { id } of DIFFICULTIES) {
    const { answered, correct } = levelStat(progress, topic.id, id);
    if (answered < MIN_ANSWERS || smoothedAccuracy(answered, correct) < LEVEL_MASTERED) return id;
  }
  return "zaawansowany";
}

function lastPracticed(progress: Progress, topic: Topic): string | undefined {
  return DIFFICULTIES.map((d) => levelStat(progress, topic.id, d.id).lastAnswered)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
}

const daysBetween = (from: string, to: string) => Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000);

/** Pula zadań zamkniętych do nauki (bez testu na start – to diagnoza, nie ćwiczenie). */
let pool: Map<string, QuestionRef[]> | null = null;
function questionPool(): Map<string, QuestionRef[]> {
  if (pool) return pool;
  const placement = new Set(placementQuestions().map((r) => r.question.id));
  pool = new Map();
  for (const ref of allQuestionRefs()) {
    if (placement.has(ref.question.id)) continue;
    const key = testKey(ref.topic.id, ref.difficulty);
    pool.set(key, [...(pool.get(key) ?? []), ref]);
  }
  return pool;
}

function hasQuestions(topic: Topic) {
  return DIFFICULTIES.some((d) => (questionPool().get(testKey(topic.id, d.id)) ?? []).length > 0);
}

/**
 * Ranking działów do nauki: ile punktów da się jeszcze zdobyć (waga × brak opanowania).
 * Dział ćwiczony dziś schodzi niżej (kolejna runda = inny dział), zaniedbany od tygodnia – wyżej.
 */
export function rankTopics(progress: Progress, today = dayKey()): { topic: Topic; score: number }[] {
  const inTarget = topicsForTarget(progress.target).filter(hasQuestions);
  const candidates = inTarget.some((t) => topicMastery(progress, t) < 1) ? inTarget : topics.filter(hasQuestions);
  return candidates
    .map((topic) => {
      const examPoints = topicExamPoints(topic);
      let score = examPoints * (1 - topicMastery(progress, topic) * 0.9);
      const last = lastPracticed(progress, topic);
      if (last === today) score *= 0.4;
      else if (last && daysBetween(last, today) >= 7) score *= 1.25;
      return { topic, score };
    })
    .sort((a, b) => b.score - a.score || a.topic.id.localeCompare(b.topic.id));
}

function pick(refs: QuestionRef[], count: number, exclude: Set<string>, random: () => number, progress: Progress): QuestionRef[] {
  const available = shuffled(refs, random).filter((r) => !exclude.has(r.question.id));
  // najpierw zadania jeszcze nierozwiązane w „Zadaniach” – nowe wyzwania zamiast powtarzania znanych
  const fresh = available.filter((r) => !progress.practice[r.question.id]);
  const known = available.filter((r) => progress.practice[r.question.id]);
  return [...fresh, ...known].slice(0, count);
}

/** Zadania z działu od wybranego poziomu w górę (gdy poziom ma mało zadań, sięgamy wyżej, potem niżej). */
function levelRefs(topic: Topic, from: Difficulty): QuestionRef[] {
  const order = DIFFICULTIES.map((d) => d.id);
  const start = order.indexOf(from);
  const levels = [...order.slice(start), ...order.slice(0, start).reverse()];
  return levels.flatMap((level) => questionPool().get(testKey(topic.id, level)) ?? []);
}

export function buildPlan(progress: Progress, today = dayKey()): DailyPlan {
  const round = progress.planDays[today] ?? 0;
  const random = seededRandom(`${today}/${round}`);
  const used = new Set<string>();

  const reviews: PlanItem[] = [];
  for (const id of dueReviews(progress, today)) {
    if (reviews.length >= MAX_REVIEWS) break;
    const ref = findQuestion(id);
    if (!ref) continue;
    used.add(id);
    reviews.push({ question: { ...ref.question, label: `Powtórka · ${ref.topic.title}` }, topic: ref.topic, difficulty: ref.difficulty, kind: "review" });
  }

  const ranked = rankTopics(progress, today);
  const focusTopic = ranked[0]?.topic;
  const mixTopic = ranked.find((r) => r.topic !== focusTopic)?.topic ?? null;
  const items = [...reviews];
  let focus: PlanFocus | null = null;

  if (focusTopic) {
    const difficulty = nextLevel(progress, focusTopic);
    const { answered, correct } = DIFFICULTIES.reduce(
      (sum, d) => {
        const s = levelStat(progress, focusTopic.id, d.id);
        return { answered: sum.answered + s.answered, correct: sum.correct + s.correct };
      },
      { answered: 0, correct: 0 },
    );
    focus = {
      topic: focusTopic,
      difficulty,
      examPoints: Math.round(topicExamPoints(focusTopic) * 10) / 10,
      accuracy: answered > 0 ? correct / answered : null,
      answered,
      correct,
    };
    const want = Math.max(FOCUS_COUNT, SESSION_SIZE - reviews.length - MIX_COUNT);
    for (const ref of pick(levelRefs(focusTopic, difficulty), want, used, random, progress)) {
      used.add(ref.question.id);
      items.push({ question: ref.question, topic: ref.topic, difficulty: ref.difficulty, kind: "focus" });
    }
  }
  if (mixTopic) {
    for (const ref of pick(levelRefs(mixTopic, nextLevel(progress, mixTopic)), MIX_COUNT, used, random, progress)) {
      used.add(ref.question.id);
      items.push({ question: ref.question, topic: ref.topic, difficulty: ref.difficulty, kind: "mix" });
    }
  }

  const involved = [...new Set(items.map((i) => i.topic))];
  return {
    day: today,
    round,
    items,
    reviewCount: reviews.length,
    focus,
    mix: items.some((i) => i.kind === "mix") ? mixTopic : null,
    minutes: Math.max(1, Math.round(items.length * MINUTES_PER_TASK)),
    formulaGroups: involved.map(formulaGroup).filter((g) => g.formulas.length > 0),
  };
}

/** Ile dni z rzędu (kończąc dziś albo wczoraj) uczeń wykonał plan. */
export function planStreak(progress: Progress, today = dayKey()): number {
  let count = 0;
  const date = parseDay(today);
  if (!progress.planDays[today]) date.setDate(date.getDate() - 1);
  while (progress.planDays[dayKey(date)]) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}

/** Najdłuższa seria dni z wykonanym planem (do odznaki). */
export function longestPlanStreak(progress: Progress): number {
  const days = Object.keys(progress.planDays).filter((d) => progress.planDays[d] > 0).sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous && daysBetween(previous, day) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}
