import type { Difficulty, FormulaGroup, Target, Topic } from "@/types/topic";
import type { OpenQuestion, QuizQuestion } from "@/types/quiz";
import { PLACEMENT } from "@/data/placement";
import ciagiPractice from "@/data/practice/ciagi";
import okragIKoloPractice from "@/data/practice/okrag-i-kolo";
import punktyIProstePractice from "@/data/practice/punkty-i-proste";
import rownanieOkreguPractice from "@/data/practice/rownanie-okregu";
import statystykaPractice from "@/data/practice/statystyka";
import przeksztalceniaWykresowPractice from "@/data/practice/przeksztalcenia-wykresow";
import funkcjaKwadratowaPractice from "@/data/practice/funkcja-kwadratowa";
import funkcjaWykladniczaILogarytmicznaPractice from "@/data/practice/funkcja-wykladnicza-i-logarytmiczna";
import trygonometriaPractice from "@/data/practice/trygonometria";
import twierdzenieCosinusowPractice from "@/data/practice/twierdzenie-cosinusow";
import trojkatyICzworokatyPractice from "@/data/practice/trojkaty-i-czworokaty";
import geometriaPrzestrzennaPractice from "@/data/practice/geometria-przestrzenna";
import optymalizacjaPractice from "@/data/practice/optymalizacja";
import funkcjaLiniowa from "./funkcja-liniowa";
import logarytmy from "./logarytmy";
import nierownosciKwadratowe from "./nierownosci-kwadratowe";
import nierownosciLiniowe from "./nierownosci-liniowe";
import potegiIPierwiastki from "./potegi-i-pierwiastki";
import rownaniaWymierne from "./rownania-wymierne";
import wartoscBezwzgledna from "./wartosc-bezwzgledna";
import wykresFunkcji from "./wykres-funkcji";
import wzorySkroconegoMnozenia from "./wzory-skroconego-mnozenia";

// Kolejność = kolejność w planie nauki. Priorytet, częstość, punkty i czas – z analizy arkuszy.
export const topics: Topic[] = [
  // ── Na 30% ──
  { id: "potegi-i-pierwiastki", lesson: "Lekcja 1", title: "Potęgi i pierwiastki", icon: "x²", category: "Liczby", target: 30, priority: "S+", examShare: 100, points: 2, studyHours: 2, content: potegiIPierwiastki },
  { id: "logarytmy", lesson: "Lekcja 3", title: "Logarytmy", icon: "log", category: "Liczby", target: 30, priority: "S+", examShare: 100, points: 1, studyHours: 1, content: logarytmy },
  { id: "wartosc-bezwzgledna", lesson: "Lekcja 4", title: "Wartość bezwzględna", icon: "|x|", category: "Liczby", target: 30, priority: "S+", examShare: 60, points: 1, studyHours: 1, content: wartoscBezwzgledna },
  { id: "wzory-skroconego-mnozenia", lesson: "Lekcja 6", title: "Wzory skróconego mnożenia", icon: "(a+b)²", category: "Algebra", target: 30, priority: "S", examShare: 90, points: 1, studyHours: 1, content: wzorySkroconegoMnozenia },
  { id: "nierownosci-liniowe", lesson: "Lekcja 12", title: "Nierówności liniowe", icon: "<", category: "Algebra", target: 30, priority: "S+", examShare: 100, points: 1, studyHours: 1, content: nierownosciLiniowe },
  { id: "nierownosci-kwadratowe", lesson: "Lekcja 18", title: "Nierówności kwadratowe", icon: "x²<0", category: "Algebra", target: 30, priority: "S", examShare: 100, points: 2, studyHours: 1, content: nierownosciKwadratowe },
  { id: "rownania-wymierne", lesson: "Lekcja 19", title: "Równania wymierne", icon: "a/b", category: "Algebra", target: 30, priority: "S", examShare: 60, points: 4, studyHours: 3, content: rownaniaWymierne },
  { id: "wykres-funkcji", lesson: "Lekcja 10", title: "Odczytywanie informacji z wykresu funkcji", icon: "f(x)", category: "Funkcje", target: 30, priority: "S+", examShare: 100, points: 4, studyHours: 2, content: wykresFunkcji },
  { id: "funkcja-liniowa", lesson: "Lekcja 11", title: "Funkcja liniowa", icon: "ax+b", category: "Funkcje", target: 30, priority: "S", examShare: 100, points: 1, studyHours: 1, content: funkcjaLiniowa },

  // ── Na 60% ──
  { id: "ciagi", lesson: "Lekcje 23–25", title: "Ciągi", icon: "aₙ", category: "Algebra", target: 60, priority: "S+", examShare: 100, points: 5, studyHours: 3, practice: ciagiPractice },
  { id: "okrag-i-kolo", lesson: "Lekcja 30", title: "Okrąg i koło", icon: "○", category: "Geometria", target: 60, priority: "S+", examShare: 100, points: 1, studyHours: 2, practice: okragIKoloPractice },
  { id: "punkty-i-proste", lesson: "Lekcja 35", title: "Punkty, odcinki i proste na płaszczyźnie", icon: "AB", category: "Geometria", target: 60, priority: "S+", examShare: 90, points: 2, studyHours: 1, practice: punktyIProstePractice },
  { id: "rownanie-okregu", lesson: "Lekcja 36", title: "Równanie okręgu", icon: "r²", category: "Geometria", target: 60, priority: "S", examShare: 50, points: 1, studyHours: 2, practice: rownanieOkreguPractice },
  { id: "statystyka", lesson: "Lekcja 45", title: "Statystyka", icon: "x̄", category: "Statystyka", target: 60, priority: "S", examShare: 100, points: 2, studyHours: 2, practice: statystykaPractice },
  { id: "przeksztalcenia-wykresow", lesson: "Lekcja 15", title: "Przekształcenia wykresów funkcji", icon: "↔", category: "Funkcje", target: 60, priority: "A", examShare: 80, points: 1, studyHours: 1, practice: przeksztalceniaWykresowPractice },
  { id: "funkcja-kwadratowa", lesson: "Lekcja 16", title: "Funkcja kwadratowa", icon: "∪", category: "Funkcje", target: 60, priority: "S", examShare: 100, points: 4, studyHours: 5, practice: funkcjaKwadratowaPractice },
  { id: "funkcja-wykladnicza-i-logarytmiczna", lesson: "Lekcja 22", title: "Funkcja wykładnicza i logarytmiczna", icon: "aˣ", category: "Funkcje", target: 60, priority: "B", examShare: 15, points: 1, studyHours: 1, practice: funkcjaWykladniczaILogarytmicznaPractice },

  // ── Na 85% ──
  { id: "trygonometria", lesson: "Lekcja 28", title: "Podstawy trygonometrii", icon: "sin", category: "Geometria", target: 85, priority: "A", examShare: 100, points: 2, studyHours: 3, practice: trygonometriaPractice },
  { id: "twierdzenie-cosinusow", lesson: "Lekcja 29", title: "Twierdzenie cosinusów i wzór na pole trójkąta", icon: "cos", category: "Geometria", target: 85, priority: "A", examShare: 30, points: 1, studyHours: 1, practice: twierdzenieCosinusowPractice },
  { id: "trojkaty-i-czworokaty", lesson: "Lekcje 31–34", title: "Trójkąty, czworokąty, podobieństwo i Tales", icon: "△", category: "Geometria", target: 85, priority: "S", examShare: 100, points: 4, studyHours: 10, practice: trojkatyICzworokatyPractice },
  { id: "geometria-przestrzenna", lesson: "Lekcje 38–42", title: "Geometria przestrzenna", icon: "▱", category: "Geometria", target: 85, priority: "B", examShare: 100, points: 4, studyHours: 10, practice: geometriaPrzestrzennaPractice },
  { id: "optymalizacja", lesson: "Lekcja 46", title: "Zadania optymalizacyjne", icon: "max", category: "Funkcje", target: 85, priority: "S", examShare: 100, points: 3, studyHours: 5, practice: optymalizacjaPractice },
];

export const TARGETS: { value: Target; label: string; subtitle: string }[] = [
  { value: 30, label: "Na 30%", subtitle: "Fundamenty – zdana matura" },
  { value: 60, label: "Na 60%", subtitle: "Solidny wynik" },
  { value: 85, label: "Na 85%", subtitle: "Wynik na studia" },
];

export const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  description: string;
}[] = [
  { id: "podstawowy", label: "Podstawowy", description: "Łatwe zadania, z podpowiedziami krok po kroku" },
  { id: "sredni", label: "Średni", description: "Typowe zadania maturalne" },
  { id: "zaawansowany", label: "Zaawansowany", description: "Trudniejsze zadania i maturalne pułapki" },
];

export function getDifficulty(id: Difficulty) {
  return DIFFICULTIES.find((d) => d.id === id)!;
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

/** Działy potrzebne do danego celu (kumulatywnie: cel 60% obejmuje też działy na 30%). */
export function topicsForTarget(target: Target): Topic[] {
  return topics.filter((t) => t.target <= target);
}

export function formulaGroup(topic: Topic): FormulaGroup {
  return { title: topic.title, formulas: topic.content?.formulas ?? topic.practice?.formulas ?? [] };
}

export function testQuestions(topic: Topic, difficulty: Difficulty): QuizQuestion[] {
  const label = `${topic.title} · ${getDifficulty(difficulty).label}`;
  return (topic.content?.tests[difficulty] ?? []).map((q) => ({ ...q, label }));
}

export interface QuestionRef {
  question: QuizQuestion;
  topic: Topic;
  difficulty: Difficulty;
}

/** Zadania testu na start z etykietą działu, w kolejności testu. */
export function placementQuestions(): QuestionRef[] {
  return PLACEMENT.map(({ topicId, difficulty, question }) => {
    const topic = getTopic(topicId)!;
    return { question: { ...question, label: `Test na start · ${topic.title}` }, topic, difficulty };
  });
}

/** Zadania zamknięte z zestawów dla działów bez lekcji (zakładka „Zadania”). */
function practiceClosedRefs(topic: Topic): QuestionRef[] {
  return (topic.practice?.closed ?? []).map(({ difficulty, ...question }) => ({
    question: { ...question, label: `${topic.title} · ${getDifficulty(difficulty).label}` },
    topic,
    difficulty,
  }));
}

/** Wszystkie zadania zamknięte aplikacji: testy działów, zestawy z „Zadań” i test na start. */
export function allQuestionRefs(): QuestionRef[] {
  return [
    ...topics.flatMap((topic) => DIFFICULTIES.flatMap((d) => testQuestions(topic, d.id).map((question) => ({ question, topic, difficulty: d.id })))),
    ...topics.flatMap(practiceClosedRefs),
    ...placementQuestions(),
  ];
}

// Indeks pytań po id – „Pudełko porażek”, statystyki działów i synchronizacja przechowują tylko identyfikatory.
const questionIndex = new Map<string, QuestionRef>(allQuestionRefs().map((ref) => [ref.question.id, ref] as const));

export function findQuestion(id: string): QuestionRef | undefined {
  return questionIndex.get(id);
}

// ── Zakładka „Zadania”: zadania działu jak w arkuszu – najpierw zamknięte, potem otwarte, od najłatwiejszych ──

export type PracticeTask =
  | { kind: "closed"; id: string; difficulty: Difficulty; points: 1; question: QuizQuestion }
  | { kind: "open"; id: string; difficulty: Difficulty; points: number; task: OpenQuestion & { label: string } };

export function practiceTasks(topic: Topic): PracticeTask[] {
  const order = (d: Difficulty) => DIFFICULTIES.findIndex((x) => x.id === d);
  // dział z lekcją: zadania z testów; dział bez lekcji: osobny zestaw zadań
  const closedRefs = topic.content
    ? DIFFICULTIES.flatMap((d) => testQuestions(topic, d.id).map((question) => ({ question, difficulty: d.id })))
    : practiceClosedRefs(topic).sort((a, b) => order(a.difficulty) - order(b.difficulty));
  const closed: PracticeTask[] = closedRefs.map(({ question, difficulty }) => ({
    kind: "closed" as const,
    id: question.id,
    difficulty,
    points: 1 as const,
    question: { ...question, label: `${topic.title} · ${getDifficulty(difficulty).label}` },
  }));
  const open: PracticeTask[] = [...(topic.content?.openTasks ?? topic.practice?.open ?? [])]
    .sort((a, b) => order(a.difficulty) - order(b.difficulty))
    .map(({ difficulty, ...task }) => ({
      kind: "open" as const,
      id: task.id,
      difficulty,
      points: task.points,
      task: { ...task, label: `${topic.title} · ${getDifficulty(difficulty).label}` },
    }));
  return [...closed, ...open];
}
