import type { Difficulty, FormulaGroup, Level, Target, Topic } from "@/types/topic";
import type { OpenQuestion, QuizQuestion } from "@/types/quiz";
import { PLACEMENT } from "@/data/placement";
import { generatedTasks } from "@/data/templates";
import ciagi from "./ciagi";
import funkcjaKwadratowa from "./funkcja-kwadratowa";
import funkcjaLiniowa from "./funkcja-liniowa";
import funkcjaWykladniczaILogarytmiczna from "./funkcja-wykladnicza-i-logarytmiczna";
import geometriaPrzestrzenna from "./geometria-przestrzenna";
import kombinatoryka from "./kombinatoryka";
import logarytmy from "./logarytmy";
import nierownosciKwadratowe from "./nierownosci-kwadratowe";
import nierownosciLiniowe from "./nierownosci-liniowe";
import okragIKolo from "./okrag-i-kolo";
import optymalizacja from "./optymalizacja";
import potegiIPierwiastki from "./potegi-i-pierwiastki";
import prawdopodobienstwo from "./prawdopodobienstwo";
import przeksztalceniaWykresow from "./przeksztalcenia-wykresow";
import punktyIProste from "./punkty-i-proste";
import rownaniaWymierne from "./rownania-wymierne";
import rownanieOkregu from "./rownanie-okregu";
import statystyka from "./statystyka";
import trojkatyICzworokaty from "./trojkaty-i-czworokaty";
import trygonometria from "./trygonometria";
import twierdzenieCosinusow from "./twierdzenie-cosinusow";
import ukladyRownan from "./uklady-rownan";
import wartoscBezwzgledna from "./wartosc-bezwzgledna";
import wykresFunkcji from "./wykres-funkcji";
import wzorySkroconegoMnozenia from "./wzory-skroconego-mnozenia";
import rzGeometriaAnalityczna from "./rozszerzenie/geometria-analityczna";
import rzGranice from "./rozszerzenie/granice";
import rzKombinatoryka from "./rozszerzenie/kombinatoryka";
import rzParametr from "./rozszerzenie/parametr";
import rzPlanimetria from "./rozszerzenie/planimetria";
import rzPochodna from "./rozszerzenie/pochodna";
import rzPrawdopodobienstwo from "./rozszerzenie/prawdopodobienstwo";
import rzStereometria from "./rozszerzenie/stereometria";
import rzTrygonometria from "./rozszerzenie/trygonometria";
import rzWielomiany from "./rozszerzenie/wielomiany";

// Kolejność = kolejność w planie nauki. Priorytet, częstość, punkty i czas – z analizy arkuszy.
/** Dokłada działom warianty zadań z szablonów parametrycznych. */
function withGenerated(list: Topic[]): Topic[] {
  return list.map((topic) => {
    const generated = generatedTasks(topic.id);
    return generated.closed.length || generated.open.length ? { ...topic, generated } : topic;
  });
}

export const topics: Topic[] = withGenerated([
  // ── Na 30% ──
  { id: "potegi-i-pierwiastki", section: "I", lesson: "Lekcja 1", title: "Potęgi i pierwiastki", icon: "x²", category: "Liczby", target: 30, priority: "S+", examShare: 100, points: 2, studyHours: 2, content: potegiIPierwiastki },
  { id: "logarytmy", section: "I", lesson: "Lekcja 3", title: "Logarytmy", icon: "log", category: "Liczby", target: 30, priority: "S+", examShare: 100, points: 1, studyHours: 1, content: logarytmy },
  { id: "wartosc-bezwzgledna", section: "I", lesson: "Lekcja 4", title: "Wartość bezwzględna", icon: "|x|", category: "Liczby", target: 30, priority: "S+", examShare: 60, points: 1, studyHours: 1, content: wartoscBezwzgledna },
  { id: "wzory-skroconego-mnozenia", section: "II", lesson: "Lekcja 6", title: "Wzory skróconego mnożenia", icon: "(a+b)²", category: "Algebra", target: 30, priority: "S", examShare: 90, points: 1, studyHours: 1, content: wzorySkroconegoMnozenia },
  { id: "nierownosci-liniowe", section: "III", lesson: "Lekcja 12", title: "Nierówności liniowe", icon: "<", category: "Algebra", target: 30, priority: "S+", examShare: 100, points: 1, studyHours: 1, content: nierownosciLiniowe },
  { id: "nierownosci-kwadratowe", section: "III", lesson: "Lekcja 18", title: "Nierówności kwadratowe", icon: "x²<0", category: "Algebra", target: 30, priority: "S", examShare: 100, points: 2, studyHours: 1, content: nierownosciKwadratowe },
  { id: "rownania-wymierne", section: "III", lesson: "Lekcja 19", title: "Równania wymierne", icon: "a/b", category: "Algebra", target: 30, priority: "S", examShare: 60, points: 4, studyHours: 3, content: rownaniaWymierne },
  { id: "wykres-funkcji", section: "V", lesson: "Lekcja 10", title: "Odczytywanie informacji z wykresu funkcji", icon: "f(x)", category: "Funkcje", target: 30, priority: "S+", examShare: 100, points: 4, studyHours: 2, content: wykresFunkcji },
  { id: "funkcja-liniowa", section: "V", lesson: "Lekcja 11", title: "Funkcja liniowa", icon: "ax+b", category: "Funkcje", target: 30, priority: "S", examShare: 100, points: 1, studyHours: 1, content: funkcjaLiniowa },

  // ── Na 60% ──
  { id: "uklady-rownan", section: "IV", lesson: "Lekcja 13", title: "Układy równań", icon: "{ }", category: "Algebra", target: 30, priority: "S", examShare: 100, points: 2, studyHours: 2, content: ukladyRownan },
  { id: "kombinatoryka", section: "XI", lesson: "Lekcja 43", title: "Kombinatoryka", icon: "n!", category: "Statystyka", target: 60, priority: "S", examShare: 100, points: 1, studyHours: 2, content: kombinatoryka },
  { id: "prawdopodobienstwo", section: "XII", lesson: "Lekcja 44", title: "Rachunek prawdopodobieństwa", icon: "P(A)", category: "Statystyka", target: 60, priority: "S+", examShare: 100, points: 2, studyHours: 2, content: prawdopodobienstwo },
  { id: "ciagi", section: "VI", lesson: "Lekcje 23–25", title: "Ciągi", icon: "aₙ", category: "Algebra", target: 60, priority: "S+", examShare: 100, points: 5, studyHours: 3, content: ciagi },
  { id: "okrag-i-kolo", section: "VIII", lesson: "Lekcja 30", title: "Okrąg i koło", icon: "○", category: "Geometria", target: 60, priority: "S+", examShare: 100, points: 1, studyHours: 2, content: okragIKolo },
  { id: "punkty-i-proste", section: "IX", lesson: "Lekcja 35", title: "Punkty, odcinki i proste na płaszczyźnie", icon: "AB", category: "Geometria", target: 60, priority: "S+", examShare: 90, points: 2, studyHours: 1, content: punktyIProste },
  { id: "rownanie-okregu", section: "IX", lesson: "Lekcja 36", title: "Równanie okręgu", icon: "r²", category: "Geometria", target: 60, priority: "S", examShare: 50, points: 1, studyHours: 2, content: rownanieOkregu },
  { id: "statystyka", section: "XII", lesson: "Lekcja 45", title: "Statystyka", icon: "x̄", category: "Statystyka", target: 60, priority: "S", examShare: 100, points: 2, studyHours: 2, content: statystyka },
  { id: "przeksztalcenia-wykresow", section: "V", lesson: "Lekcja 15", title: "Przekształcenia wykresów funkcji", icon: "↔", category: "Funkcje", target: 60, priority: "A", examShare: 80, points: 1, studyHours: 1, content: przeksztalceniaWykresow },
  { id: "funkcja-kwadratowa", section: "V", lesson: "Lekcja 16", title: "Funkcja kwadratowa", icon: "∪", category: "Funkcje", target: 60, priority: "S", examShare: 100, points: 4, studyHours: 5, content: funkcjaKwadratowa },
  { id: "funkcja-wykladnicza-i-logarytmiczna", section: "V", lesson: "Lekcja 22", title: "Funkcja wykładnicza i logarytmiczna", icon: "aˣ", category: "Funkcje", target: 60, priority: "B", examShare: 15, points: 1, studyHours: 1, content: funkcjaWykladniczaILogarytmiczna },

  // ── Na 85% ──
  { id: "trygonometria", section: "VII", lesson: "Lekcja 28", title: "Podstawy trygonometrii", icon: "sin", category: "Geometria", target: 85, priority: "A", examShare: 100, points: 2, studyHours: 3, content: trygonometria },
  { id: "twierdzenie-cosinusow", section: "VII", lesson: "Lekcja 29", title: "Twierdzenie cosinusów i wzór na pole trójkąta", icon: "cos", category: "Geometria", target: 85, priority: "A", examShare: 30, points: 1, studyHours: 1, content: twierdzenieCosinusow },
  { id: "trojkaty-i-czworokaty", section: "VIII", lesson: "Lekcje 31–34", title: "Trójkąty, czworokąty, podobieństwo i Tales", icon: "△", category: "Geometria", target: 85, priority: "S", examShare: 100, points: 4, studyHours: 10, content: trojkatyICzworokaty },
  { id: "geometria-przestrzenna", section: "X", lesson: "Lekcje 38–42", title: "Geometria przestrzenna", icon: "▱", category: "Geometria", target: 85, priority: "B", examShare: 100, points: 4, studyHours: 10, content: geometriaPrzestrzenna },
  { id: "optymalizacja", section: "XIII", lesson: "Lekcja 46", title: "Zadania optymalizacyjne", icon: "max", category: "Funkcje", target: 85, priority: "S", examShare: 100, points: 3, studyHours: 5, content: optymalizacja },
]);

/**
 * Działy rozszerzenia (matura rozszerzona, formuła 2023). Osobna lista: `topics` zostaje zakresem podstawowym
 * (arkusze próbne, test na start, odznaki „fundamentów”), a rozszerzenie dochodzi tam, gdzie uczeń je wybrał
 * (`topicsOfLevel`). Działy podstawy programowej – jak w „Zasadach oceniania” matury rozszerzonej (wymagania „R”).
 * `target: 85` – poza grupą fundamentów; `points`/`examShare` – względne wagi w obrębie działu podstawy.
 */
export const extendedTopics: Topic[] = withGenerated([
  { id: "rz-wielomiany", section: "III", level: "rozszerzony", lesson: "Rozszerzenie", title: "Wielomiany", icon: "W(x)", category: "Algebra", target: 85, priority: "S+", examShare: 100, points: 3, studyHours: 4, content: rzWielomiany },
  { id: "rz-parametr", section: "III", level: "rozszerzony", lesson: "Rozszerzenie", title: "Wartość bezwzględna i równania z parametrem", icon: "m", category: "Algebra", target: 85, priority: "S+", examShare: 100, points: 3, studyHours: 5, content: rzParametr },
  { id: "rz-granice", section: "VI", level: "rozszerzony", lesson: "Rozszerzenie", title: "Granice ciągów i szereg geometryczny", icon: "lim", category: "Algebra", target: 85, priority: "S", examShare: 70, points: 2, studyHours: 3, content: rzGranice },
  { id: "rz-pochodna", section: "XIII", level: "rozszerzony", lesson: "Rozszerzenie", title: "Pochodna i optymalizacja", icon: "f′", category: "Funkcje", target: 85, priority: "S+", examShare: 100, points: 6, studyHours: 6, content: rzPochodna },
  { id: "rz-trygonometria", section: "VII", level: "rozszerzony", lesson: "Rozszerzenie", title: "Trygonometria: wzory i równania", icon: "sin 2x", category: "Funkcje", target: 85, priority: "S+", examShare: 100, points: 5, studyHours: 5, content: rzTrygonometria },
  { id: "rz-planimetria", section: "VIII", level: "rozszerzony", lesson: "Rozszerzenie", title: "Planimetria: twierdzenie sinusów i dowody", icon: "⊙", category: "Geometria", target: 85, priority: "S", examShare: 100, points: 5, studyHours: 6, content: rzPlanimetria },
  { id: "rz-geometria-analityczna", section: "IX", level: "rozszerzony", lesson: "Rozszerzenie", title: "Geometria analityczna: okręgi i styczne", icon: "(x,y)", category: "Geometria", target: 85, priority: "S+", examShare: 100, points: 5, studyHours: 5, content: rzGeometriaAnalityczna },
  { id: "rz-stereometria", section: "X", level: "rozszerzony", lesson: "Rozszerzenie", title: "Stereometria: kąty i przekroje", icon: "▱", category: "Geometria", target: 85, priority: "S", examShare: 100, points: 6, studyHours: 6, content: rzStereometria },
  { id: "rz-kombinatoryka", section: "XI", level: "rozszerzony", lesson: "Rozszerzenie", title: "Kombinatoryka: symbol i dwumian Newtona", icon: "(ⁿₖ)", category: "Statystyka", target: 85, priority: "A", examShare: 70, points: 2, studyHours: 3, content: rzKombinatoryka },
  { id: "rz-prawdopodobienstwo", section: "XII", level: "rozszerzony", lesson: "Rozszerzenie", title: "Prawdopodobieństwo warunkowe i całkowite", icon: "P(A|B)", category: "Statystyka", target: 85, priority: "S", examShare: 100, points: 3, studyHours: 3, content: rzPrawdopodobienstwo },
]);

/** Wszystkie działy (podstawa + rozszerzenie) – do wyszukiwania po id, kluczy odpowiedzi i stron działów. */
export const allTopics: Topic[] = [...topics, ...extendedTopics];

export function topicLevel(topic: Topic): Level {
  return topic.level ?? "podstawowy";
}

/**
 * Działy do nauki na danym poziomie: podstawa – zakres podstawowy; rozszerzenie – najpierw działy rozszerzenia,
 * potem podstawa (arkusz rozszerzony sprawdza też wymagania podstawowe).
 */
export function topicsOfLevel(level: Level): Topic[] {
  return level === "rozszerzony" ? [...extendedTopics, ...topics] : topics;
}

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
  return allTopics.find((t) => t.id === id);
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

/** Zadania zamknięte z zestawów dla działów bez lekcji i z szablonów parametrycznych (zakładka „Zadania”). */
function practiceClosedRefs(topic: Topic): QuestionRef[] {
  return [...(topic.practice?.closed ?? []), ...(topic.generated?.closed ?? [])].map(({ difficulty, ...question }) => ({
    question: { ...question, label: `${topic.title} · ${getDifficulty(difficulty).label}` },
    topic,
    difficulty,
  }));
}

/** Pytania sprawdzające przy krokach teorii (poziom podstawowy – sprawdzają zrozumienie, nie trudne rachunki). */
export function theoryChecks(topic: Topic): QuizQuestion[] {
  const label = `${topic.title} · Sprawdź się`;
  return (topic.content?.theory ?? []).flatMap((section) => (section.check ? [{ ...section.check, label }] : []));
}

/** Wszystkie zadania zamknięte aplikacji: zadania działów, pytania przy teorii, zestawy z „Zadań” i test na start. */
export function allQuestionRefs(): QuestionRef[] {
  return [
    ...allTopics.flatMap((topic) => DIFFICULTIES.flatMap((d) => testQuestions(topic, d.id).map((question) => ({ question, topic, difficulty: d.id })))),
    ...allTopics.flatMap((topic) => theoryChecks(topic).map((question) => ({ question, topic, difficulty: "podstawowy" as const }))),
    ...allTopics.flatMap(practiceClosedRefs),
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
    ? [
        ...DIFFICULTIES.flatMap((d) => testQuestions(topic, d.id).map((question) => ({ question, difficulty: d.id }))),
        ...(topic.generated?.closed ?? []).map(({ difficulty, ...question }) => ({ question: { ...question, label: "" }, difficulty })),
      ]
    : practiceClosedRefs(topic).sort((a, b) => order(a.difficulty) - order(b.difficulty));
  const closed: PracticeTask[] = closedRefs.map(({ question, difficulty }) => ({
    kind: "closed" as const,
    id: question.id,
    difficulty,
    points: 1 as const,
    question: { ...question, label: `${topic.title} · ${getDifficulty(difficulty).label}` },
  }));
  const open: PracticeTask[] = [...(topic.content?.openTasks ?? topic.practice?.open ?? []), ...(topic.generated?.open ?? [])]
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

// Indeks wszystkich zadań (zamkniętych i otwartych) po id – np. do przypisania wyniku z arkusza do działu.
let taskIndex: Map<string, { topic: Topic; difficulty: Difficulty }> | null = null;
let practiceIndex: Map<string, PracticeTask> | null = null;

/** Zadanie z zakładki „Zadania” po id (np. do odtworzenia zamrożonego arkusza próbnego). */
export function practiceTaskById(id: string): PracticeTask | undefined {
  practiceIndex ??= new Map(allTopics.flatMap((topic) => practiceTasks(topic).map((task) => [task.id, task] as const)));
  return practiceIndex.get(id);
}

export function findTask(id: string): { topic: Topic; difficulty: Difficulty } | undefined {
  taskIndex ??= new Map(allTopics.flatMap((topic) => practiceTasks(topic).map((task) => [task.id, { topic, difficulty: task.difficulty }] as const)));
  return taskIndex.get(id) ?? findQuestion(id);
}
