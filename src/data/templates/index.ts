// Rejestr szablonów: który dział dostaje które szablony i ile wariantów każdego.
// Warianty są stałe (to samo id = ta sama treść i klucz), więc trafiają do kluczy na serwerze (npm run db:keys)
// i działają w „Pudełku porażek”, powtórkach i statystykach jak zwykłe zadania.
import { closedVariants, openVariants, type ClosedTemplate, type ClosedVariant, type OpenTemplate, type OpenVariant } from "@/data/templates/engine";
import { chooseRoles, digitsNoZero, digitsWithZero, parityDigits } from "@/data/templates/kombinatoryka";
import {
  arithmeticSum,
  arithmeticTerm,
  fenceOptimization,
  inscribedAngle,
  linearZero,
  prismDiagonal,
  prismSurface,
  quadraticFromVertex,
} from "@/data/templates/otwarte";
import { linearTrueFalse, powersTrueFalse, segmentTrueFalse, sequenceTrueFalse, trigTrueFalse } from "@/data/templates/prawda-falsz";
import { diceSum, divisibleDraw, divisibleOrOpen, gradesMean, statsTrueFalse, urn } from "@/data/templates/prawdopodobienstwo";
import { agesProblem, intersectLines, solveSystem, ticketsProblem } from "@/data/templates/uklady-rownan";

export interface GeneratedTasks {
  closed: ClosedVariant[];
  open: OpenVariant[];
}

/** Ile wariantów: ABCD – 8, P/F – 6 (mniej różnych układów prawdy), otwarte – 6. */
const ABCD = 8;
const TF = 6;
const OPEN = 6;

const SETS: Record<string, { closed?: [ClosedTemplate, number][]; open?: [OpenTemplate, number][] }> = {
  "potegi-i-pierwiastki": { closed: [[powersTrueFalse, TF]] },
  "funkcja-liniowa": { closed: [[linearTrueFalse, TF]], open: [[linearZero, OPEN]] },
  "uklady-rownan": {
    closed: [
      [solveSystem, ABCD],
      [intersectLines, ABCD],
    ],
    open: [
      [ticketsProblem, OPEN],
      [agesProblem, OPEN],
    ],
  },
  ciagi: {
    closed: [[sequenceTrueFalse, TF]],
    open: [
      [arithmeticTerm, OPEN],
      [arithmeticSum, OPEN],
    ],
  },
  "okrag-i-kolo": { open: [[inscribedAngle, OPEN]] },
  "punkty-i-proste": { closed: [[segmentTrueFalse, TF]] },
  statystyka: { closed: [[statsTrueFalse, TF]], open: [[gradesMean, OPEN]] },
  "funkcja-kwadratowa": { open: [[quadraticFromVertex, OPEN]] },
  trygonometria: { closed: [[trigTrueFalse, TF]] },
  "geometria-przestrzenna": {
    open: [
      [prismDiagonal, OPEN],
      [prismSurface, OPEN],
    ],
  },
  optymalizacja: { open: [[fenceOptimization, OPEN]] },
  kombinatoryka: {
    closed: [
      [digitsNoZero, ABCD],
      [digitsWithZero, ABCD],
      [chooseRoles, ABCD],
      [parityDigits, 6],
    ],
  },
  prawdopodobienstwo: {
    closed: [
      [urn, ABCD],
      [diceSum, ABCD],
      [divisibleDraw, ABCD],
    ],
    open: [[divisibleOrOpen, OPEN]],
  },
};

const cache = new Map<string, GeneratedTasks>();

/** Warianty z szablonów dla działu (puste, gdy dział nie ma szablonów). */
export function generatedTasks(topicId: string): GeneratedTasks {
  const cached = cache.get(topicId);
  if (cached) return cached;
  const set = SETS[topicId] ?? {};
  const tasks = {
    closed: (set.closed ?? []).flatMap(([t, count]) => closedVariants(t, count)),
    open: (set.open ?? []).flatMap(([t, count]) => openVariants(t, count)),
  };
  cache.set(topicId, tasks);
  return tasks;
}

/** Wszystkie szablony (do testów). */
export const TEMPLATE_TOPICS = Object.keys(SETS);
