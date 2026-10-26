import type { Difficulty, FormulaGroup, Target, Topic } from "@/types/topic";
import type { QuizQuestion } from "@/types/quiz";
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
  { id: "ciagi", lesson: "Lekcje 23–25", title: "Ciągi", icon: "aₙ", category: "Algebra", target: 60, priority: "S+", examShare: 100, points: 5, studyHours: 3 },
  { id: "okrag-i-kolo", lesson: "Lekcja 30", title: "Okrąg i koło", icon: "○", category: "Geometria", target: 60, priority: "S+", examShare: 100, points: 1, studyHours: 2 },
  { id: "punkty-i-proste", lesson: "Lekcja 35", title: "Punkty, odcinki i proste na płaszczyźnie", icon: "AB", category: "Geometria", target: 60, priority: "S+", examShare: 90, points: 2, studyHours: 1 },
  { id: "rownanie-okregu", lesson: "Lekcja 36", title: "Równanie okręgu", icon: "r²", category: "Geometria", target: 60, priority: "S", examShare: 50, points: 1, studyHours: 2 },
  { id: "statystyka", lesson: "Lekcja 45", title: "Statystyka", icon: "x̄", category: "Statystyka", target: 60, priority: "S", examShare: 100, points: 2, studyHours: 2 },
  { id: "przeksztalcenia-wykresow", lesson: "Lekcja 15", title: "Przekształcenia wykresów funkcji", icon: "↔", category: "Funkcje", target: 60, priority: "A", examShare: 80, points: 1, studyHours: 1 },
  { id: "funkcja-kwadratowa", lesson: "Lekcja 16", title: "Funkcja kwadratowa", icon: "∪", category: "Funkcje", target: 60, priority: "S", examShare: 100, points: 4, studyHours: 5 },
  { id: "funkcja-wykladnicza-i-logarytmiczna", lesson: "Lekcja 22", title: "Funkcja wykładnicza i logarytmiczna", icon: "aˣ", category: "Funkcje", target: 60, priority: "B", examShare: 15, points: 1, studyHours: 1 },

  // ── Na 85% ──
  { id: "trygonometria", lesson: "Lekcja 28", title: "Podstawy trygonometrii", icon: "sin", category: "Geometria", target: 85, priority: "A", examShare: 100, points: 2, studyHours: 3 },
  { id: "twierdzenie-cosinusow", lesson: "Lekcja 29", title: "Twierdzenie cosinusów i wzór na pole trójkąta", icon: "cos", category: "Geometria", target: 85, priority: "A", examShare: 30, points: 1, studyHours: 1 },
  { id: "trojkaty-i-czworokaty", lesson: "Lekcje 31–34", title: "Trójkąty, czworokąty, podobieństwo i Tales", icon: "△", category: "Geometria", target: 85, priority: "S", examShare: 100, points: 4, studyHours: 10 },
  { id: "geometria-przestrzenna", lesson: "Lekcje 38–42", title: "Geometria przestrzenna", icon: "▱", category: "Geometria", target: 85, priority: "B", examShare: 100, points: 4, studyHours: 10 },
  { id: "optymalizacja", lesson: "Lekcja 46", title: "Zadania optymalizacyjne", icon: "max", category: "Funkcje", target: 85, priority: "S", examShare: 100, points: 3, studyHours: 5 },
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
  xpPerCorrect: number;
}[] = [
  { id: "podstawowy", label: "Podstawowy", description: "Łatwe zadania, możesz skorzystać z podpowiedzi", xpPerCorrect: 10 },
  { id: "sredni", label: "Średni", description: "Typowe zadania maturalne, bez podpowiedzi", xpPerCorrect: 15 },
  { id: "zaawansowany", label: "Zaawansowany", description: "Trudniejsze zadania i maturalne pułapki", xpPerCorrect: 20 },
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
  return { title: topic.title, formulas: topic.content?.formulas ?? [] };
}

export function testQuestions(topic: Topic, difficulty: Difficulty): QuizQuestion[] {
  const label = `${topic.title} · ${getDifficulty(difficulty).label}`;
  return (topic.content?.tests[difficulty] ?? []).map((q) => ({ ...q, label }));
}
