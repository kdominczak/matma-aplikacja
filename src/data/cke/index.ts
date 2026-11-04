import { CKE_2022_MAJ } from "@/data/cke/matura-2022-maj";
import { CKE_2023_MAJ } from "@/data/cke/matura-2023-maj";
import { CKE_2023_MAJ_R } from "@/data/cke/matura-2023-maj-rozszerzona";
import { CKE_2024_MAJ } from "@/data/cke/matura-2024-maj";
import { CKE_2024_MAJ_R } from "@/data/cke/matura-2024-maj-rozszerzona";
import { CKE_2025_MAJ } from "@/data/cke/matura-2025-maj";
import { CKE_2025_MAJ_R } from "@/data/cke/matura-2025-maj-rozszerzona";
import { CKE_2026_MAJ } from "@/data/cke/matura-2026-maj";
import { CKE_2026_MAJ_R } from "@/data/cke/matura-2026-maj-rozszerzona";
import { CKE_HELP } from "@/data/cke/podpowiedzi";
import type { PracticeTask } from "@/data/topics";
import type { ExamSheet } from "@/types/exam";

// Oficjalne arkusze CKE przepisane do aplikacji (od najnowszego) i przypisanie ich zadań do działów.
// Pliki arkuszy importują z `@/data/topics` tylko typy – ten moduł może więc czytać `src/data/topics/index.ts`
// (zadania CKE w zakładce „Zadania”) bez zapętlenia importów.

export const CKE_SHEETS: ExamSheet[] = [CKE_2026_MAJ, CKE_2026_MAJ_R, CKE_2025_MAJ, CKE_2025_MAJ_R, CKE_2024_MAJ, CKE_2024_MAJ_R, CKE_2023_MAJ, CKE_2023_MAJ_R, CKE_2022_MAJ];

/**
 * Dział każdego zadania (numer z arkusza → id działu). Zadania „wybór” i dowody też mają dział (porządek),
 * ale do „Zadań” nie trafiają – nie ma tam ekranu dla „wybierz spośród A–F”, a dowodu nie da się sprawdzić wynikiem.
 * Działy rozszerzenia (`rz-…`) tylko dla arkuszy rozszerzonych; zadanie z podstawy w arkuszu rozszerzonym – dział podstawy.
 */
const TOPICS: Record<string, Record<string, string>> = {
  "cke-2026-maj": {
    "1": "potegi-i-pierwiastki", "2": "potegi-i-pierwiastki", "3": "potegi-i-pierwiastki", "4": "logarytmy",
    "5": "potegi-i-pierwiastki", "6": "wzory-skroconego-mnozenia", "7": "wzory-skroconego-mnozenia", "8": "rownania-wymierne",
    "9": "rownania-wymierne", "10": "nierownosci-kwadratowe", "11": "uklady-rownan", "12.1.1": "wykres-funkcji",
    "12.1.2": "wykres-funkcji", "12.2.1": "wykres-funkcji", "12.2.2": "wykres-funkcji", "13.1": "funkcja-liniowa",
    "13.2": "funkcja-liniowa", "14": "funkcja-kwadratowa", "15": "ciagi", "16": "ciagi", "17": "ciagi",
    "18": "trygonometria", "19": "okrag-i-kolo", "20": "trojkaty-i-czworokaty", "21": "trojkaty-i-czworokaty",
    "22": "okrag-i-kolo", "23": "trygonometria", "24.1": "punkty-i-proste", "24.2": "rownanie-okregu",
    "25": "rownanie-okregu", "26": "punkty-i-proste", "27": "geometria-przestrzenna", "28": "geometria-przestrzenna",
    "29": "kombinatoryka", "30": "prawdopodobienstwo", "31": "statystyka", "32": "statystyka", "33.1": "funkcja-kwadratowa",
    "33.2": "optymalizacja",
  },
  "cke-2026-maj-r": {
    "1": "rz-granice", "2": "rz-prawdopodobienstwo", "3": "rz-planimetria", "4": "rz-planimetria", "5": "rz-parametr",
    "6": "ciagi", "7": "rz-trygonometria", "8": "rz-stereometria", "9": "rz-geometria-analityczna", "10": "rz-parametr",
    "11": "rz-planimetria", "12.1": "rz-pochodna", "12.2": "rz-pochodna",
  },
  "cke-2025-maj": {
    "1": "potegi-i-pierwiastki", "2": "potegi-i-pierwiastki", "3": "logarytmy", "4": "wzory-skroconego-mnozenia",
    "5": "wzory-skroconego-mnozenia", "6": "nierownosci-liniowe", "7": "rownania-wymierne", "8": "rownania-wymierne",
    "9": "uklady-rownan", "10": "nierownosci-kwadratowe", "11.1": "wykres-funkcji", "11.2": "wykres-funkcji",
    "11.3": "wykres-funkcji", "11.4": "wykres-funkcji", "12.1": "funkcja-kwadratowa", "12.2": "funkcja-kwadratowa",
    "12.3": "funkcja-kwadratowa", "13": "funkcja-liniowa", "14.1": "ciagi", "14.2": "ciagi", "15": "ciagi", "16": "ciagi",
    "17": "trygonometria", "18.1": "trygonometria", "18.2": "trygonometria", "19": "okrag-i-kolo",
    "20": "trojkaty-i-czworokaty", "21": "twierdzenie-cosinusow", "22": "punkty-i-proste", "23": "punkty-i-proste",
    "24": "rownanie-okregu", "25": "geometria-przestrzenna", "26": "geometria-przestrzenna", "27": "kombinatoryka",
    "28": "prawdopodobienstwo", "29": "statystyka", "30.1": "statystyka", "30.2": "statystyka", "31": "optymalizacja",
  },
  "cke-2025-maj-r": {
    "1": "funkcja-wykladnicza-i-logarytmiczna", "2": "rz-wielomiany", "3": "rz-planimetria", "4": "rz-prawdopodobienstwo",
    "5": "rz-parametr", "6": "rz-granice", "7": "rz-planimetria", "8": "rz-geometria-analityczna", "9": "rz-trygonometria",
    "10": "rz-stereometria", "11": "rz-parametr", "12.1": "rz-pochodna", "12.2": "rz-pochodna",
  },
  "cke-2024-maj": {
    "1": "wartosc-bezwzgledna", "2": "potegi-i-pierwiastki", "3": "wzory-skroconego-mnozenia", "4": "logarytmy",
    "5": "wzory-skroconego-mnozenia", "6": "nierownosci-liniowe", "7": "rownania-wymierne", "8": "rownania-wymierne",
    "9": "rownania-wymierne", "10": "uklady-rownan", "11": "uklady-rownan", "12": "funkcja-liniowa", "13": "funkcja-liniowa",
    "14.1": "funkcja-kwadratowa", "14.2": "funkcja-kwadratowa", "14.3": "funkcja-kwadratowa", "14.4": "przeksztalcenia-wykresow",
    "15": "ciagi", "16": "ciagi", "17": "ciagi", "18": "trygonometria", "19": "trygonometria", "20": "trojkaty-i-czworokaty",
    "21": "twierdzenie-cosinusow", "22": "okrag-i-kolo", "23": "punkty-i-proste", "24": "punkty-i-proste",
    "25.1": "geometria-przestrzenna", "25.2": "geometria-przestrzenna", "26": "geometria-przestrzenna", "27": "kombinatoryka",
    "28": "statystyka", "29": "statystyka", "30": "prawdopodobienstwo", "31": "optymalizacja",
  },
  "cke-2024-maj-r": {
    "1": "funkcja-wykladnicza-i-logarytmiczna", "2": "rz-granice", "3": "rz-prawdopodobienstwo", "4": "rz-pochodna",
    "5": "logarytmy", "6": "rz-kombinatoryka", "7": "ciagi", "8": "rz-planimetria", "9": "rz-planimetria",
    "10": "rz-trygonometria", "11": "rz-geometria-analityczna", "12": "rz-parametr", "13.1": "rz-pochodna", "13.2": "rz-pochodna",
  },
  "cke-2023-maj": {
    "1": "wartosc-bezwzgledna", "2": "potegi-i-pierwiastki", "3": "wzory-skroconego-mnozenia", "4": "logarytmy",
    "5": "wzory-skroconego-mnozenia", "6": "nierownosci-liniowe", "7": "rownania-wymierne", "8": "rownania-wymierne",
    "9": "rownania-wymierne", "10": "uklady-rownan", "11": "uklady-rownan", "12.1": "wykres-funkcji", "12.2": "wykres-funkcji",
    "12.3": "wykres-funkcji", "13": "funkcja-liniowa", "14": "funkcja-kwadratowa", "15": "ciagi", "16": "ciagi", "17": "ciagi",
    "18": "trygonometria", "19": "trygonometria", "20": "twierdzenie-cosinusow", "21": "okrag-i-kolo",
    "22": "trojkaty-i-czworokaty", "23": "punkty-i-proste", "24": "punkty-i-proste", "25": "geometria-przestrzenna",
    "26": "geometria-przestrzenna", "27": "geometria-przestrzenna", "28": "kombinatoryka", "29": "statystyka",
    "30": "prawdopodobienstwo", "31.1": "funkcja-kwadratowa", "31.2": "optymalizacja",
  },
  // formuła 2015 (45 pkt, 170 min)
  "cke-2022-maj": {
    "1": "potegi-i-pierwiastki", "2": "wzory-skroconego-mnozenia", "3": "logarytmy", "4": "potegi-i-pierwiastki",
    "5": "potegi-i-pierwiastki", "6": "uklady-rownan", "7": "nierownosci-liniowe", "8": "rownania-wymierne",
    "9": "wykres-funkcji", "10": "przeksztalcenia-wykresow", "11": "funkcja-liniowa", "12": "funkcja-kwadratowa",
    "13": "ciagi", "14": "ciagi", "15": "ciagi", "16": "trygonometria", "17": "okrag-i-kolo", "18": "okrag-i-kolo",
    "19": "trojkaty-i-czworokaty", "20": "twierdzenie-cosinusow", "21": "punkty-i-proste", "22": "punkty-i-proste",
    "23": "punkty-i-proste", "24": "punkty-i-proste", "25": "geometria-przestrzenna", "26": "geometria-przestrzenna",
    "27": "kombinatoryka", "28": "statystyka", "29": "nierownosci-kwadratowe", "30": "ciagi",
    "31": "wzory-skroconego-mnozenia", "32": "trygonometria", "33": "trojkaty-i-czworokaty", "34": "prawdopodobienstwo",
    "35": "funkcja-kwadratowa",
  },
  "cke-2023-maj-r": {
    "1": "funkcja-wykladnicza-i-logarytmiczna", "2": "rz-prawdopodobienstwo", "3": "rz-pochodna", "4": "rz-wielomiany",
    "5": "rz-planimetria", "6": "rz-trygonometria", "7": "rz-stereometria", "8": "rz-planimetria", "9": "rz-parametr",
    "10": "rz-granice", "11": "rz-parametr", "12.1": "logarytmy", "12.2": "rz-pochodna", "13": "rz-geometria-analityczna",
  },
};

/** Dział zadania z arkusza CKE (undefined – zadanie spoza mapy). */
export function ckeTopicOf(sheet: ExamSheet, index: number): string | undefined {
  return TOPICS[sheet.id]?.[sheet.numbers?.[index] ?? String(index + 1)];
}

let byTopic: Map<string, PracticeTask[]> | undefined;

/**
 * Zadania z arkuszy CKE do zakładki „Zadania” danego działu: zamknięte i otwarte z wynikiem do sprawdzenia
 * (bez „wyboru” i dowodów). Od najnowszego arkusza.
 */
export function ckeTasksOfTopic(topicId: string): PracticeTask[] {
  if (!byTopic) {
    byTopic = new Map();
    for (const sheet of CKE_SHEETS) {
      sheet.tasks.forEach((task, i) => {
        const topic = ckeTopicOf(sheet, i);
        if (!topic || task.kind === "choice" || (task.kind === "open" && task.task.format === "proof")) return;
        byTopic!.set(topic, [...(byTopic!.get(topic) ?? []), withHelp(task)]);
      });
    }
  }
  return byTopic.get(topicId) ?? [];
}

/** Podpowiedzi i pułapka (src/data/cke/podpowiedzi.ts) – kopia zadania, arkusz zostaje bez pomocy jak na maturze. */
function withHelp(task: PracticeTask): PracticeTask {
  const help = CKE_HELP[task.id];
  if (!help) return task;
  return task.kind === "closed"
    ? { ...task, question: { ...task.question, hints: help.hints, ...(help.trap ? { trap: help.trap } : {}) } }
    : { ...task, task: { ...task.task, hints: help.hints } };
}

/** Czy zadanie pochodzi z arkusza CKE (generator arkuszy losowych bierze tylko zadania autorskie). */
export const isCkeTask = (task: { id: string }) => task.id.startsWith("cke-");
