import type { IconName } from "@/components/ui/Icon";
import { topics } from "@/data/topics";
import { longestPlanStreak } from "@/lib/planner";
import { longestStreak } from "@/lib/stats";
import { masteredLevels } from "@/lib/topic-progress";
import type { Progress } from "@/types/progress";

export type BadgeTone = "amber" | "violet" | "blue" | "emerald" | "rose" | "orange" | "indigo" | "teal";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  tone: BadgeTone;
  goal: number;
  /** Aktualny postęp w stronę `goal` (pasek na zablokowanej odznace). */
  current: (progress: Progress) => number;
}

const basicTopics = topics.filter((t) => t.target === 30 && t.content);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "pierwszy-krok",
    title: "Pierwszy krok",
    description: "Rozwiąż poprawnie pierwsze zadanie",
    icon: "check",
    tone: "emerald",
    goal: 1,
    current: (p) => p.stats.correct,
  },
  {
    id: "mistrz-poteg",
    title: "Mistrz Potęg",
    description: "Opanuj potęgi i pierwiastki na wszystkich poziomach trudności (≥ 75% poprawnych)",
    icon: "bolt",
    tone: "amber",
    goal: 3,
    current: (p) => masteredLevels(p, "potegi-i-pierwiastki"),
  },
  {
    id: "wladca-logarytmow",
    title: "Władca Logarytmów",
    description: "Opanuj logarytmy na wszystkich poziomach trudności (≥ 75% poprawnych)",
    icon: "crown",
    tone: "violet",
    goal: 3,
    current: (p) => masteredLevels(p, "logarytmy"),
  },
  {
    id: "analityk-wykresow",
    title: "Analityk Wykresów",
    description: "Opanuj odczytywanie wykresów na wszystkich poziomach trudności (≥ 75% poprawnych)",
    icon: "chart",
    tone: "teal",
    goal: 3,
    current: (p) => masteredLevels(p, "wykres-funkcji"),
  },
  {
    id: "nocny-marek",
    title: "Nocny Marek",
    description: "Ukończ plan, wyzwanie albo „Sprawdź się” po 22:00",
    icon: "moon",
    tone: "indigo",
    goal: 1,
    current: (p) => p.stats.nightSessions,
  },
  {
    id: "ranny-ptaszek",
    title: "Ranny Ptaszek",
    description: "Ukończ plan, wyzwanie albo „Sprawdź się” przed 7:00",
    icon: "sun",
    tone: "orange",
    goal: 1,
    current: (p) => p.stats.earlySessions,
  },
  {
    id: "niezlomny",
    title: "Niezłomny",
    description: "Ucz się 7 dni z rzędu",
    icon: "flame",
    tone: "rose",
    goal: 7,
    current: longestStreak,
  },
  {
    id: "perfekcjonista",
    title: "Perfekcjonista",
    description: "Ukończ 3 sesje (plan, wyzwanie, „Sprawdź się”) bez żadnego błędu",
    icon: "target",
    tone: "blue",
    goal: 3,
    current: (p) => p.stats.perfectTests,
  },
  {
    id: "codzienny-rytual",
    title: "Codzienny rytuał",
    description: "Zalicz 5 dziennych wyzwań",
    icon: "calendar",
    tone: "orange",
    goal: 5,
    current: (p) => p.stats.dailyChallenges,
  },
  {
    id: "solidne-fundamenty",
    title: "Solidne fundamenty",
    description: "Opanuj zadania podstawowe we wszystkich działach fundamentów",
    icon: "layers",
    tone: "emerald",
    goal: basicTopics.length,
    current: (p) => basicTopics.filter((t) => masteredLevels(p, t.id) > 0).length,
  },
  {
    id: "pogromca-bledow",
    title: "Pogromca błędów",
    description: "Wyjmij 10 zadań z Pudełka porażek",
    icon: "archive",
    tone: "violet",
    goal: 10,
    current: (p) => p.stats.mistakesBeaten,
  },
  {
    id: "setka",
    title: "Setka",
    description: "Udziel 100 poprawnych odpowiedzi",
    icon: "medal",
    tone: "blue",
    goal: 100,
    current: (p) => p.stats.correct,
  },
  {
    id: "kolekcjoner-gwiazd",
    title: "Kolekcjoner poziomów",
    description: "Opanuj 15 poziomów trudności w różnych działach (≥ 75% poprawnych)",
    icon: "star",
    tone: "amber",
    goal: 15,
    current: (p) => topics.reduce((sum, t) => sum + masteredLevels(p, t.id), 0),
  },
  {
    id: "pierwszy-plan",
    title: "Mam plan",
    description: "Wykonaj swój pierwszy plan na dziś",
    icon: "target",
    tone: "teal",
    goal: 1,
    current: (p) => Object.keys(p.planDays).length,
  },
  {
    id: "tydzien-z-planem",
    title: "Tydzień z planem",
    description: "Wykonaj plan na dziś 7 dni z rzędu",
    icon: "flame",
    tone: "orange",
    goal: 7,
    current: longestPlanStreak,
  },
  {
    id: "pamiec-slonia",
    title: "Pamięć słonia",
    description: "Utrwal 10 zadań powtórkami (każde wraca coraz rzadziej, aż zostaje na stałe)",
    icon: "layers",
    tone: "indigo",
    goal: 10,
    current: (p) => p.stats.reviewsMastered,
  },
];

export function getAchievement(id: string) {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** Odznaki, których warunek jest już spełniony, a nie zostały jeszcze przyznane. */
export function newlyEarned(progress: Progress): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !progress.achievements[a.id] && a.current(progress) >= a.goal);
}
