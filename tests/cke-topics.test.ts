// Zadania z arkuszy CKE w zakładce „Zadania”: każde przypisane do istniejącego działu, bez „wyboru” i dowodów,
// a generator arkuszy losowych (zadania autorskie) ich nie używa.
import { describe, expect, it } from "vitest";
import { CKE_SHEETS, ckeTasksOfTopic, ckeTopicOf, isCkeTask } from "@/data/cke";
import { allTopics, findQuestion, getTopic, practiceTasks } from "@/data/topics";
import { examPool } from "@/data/task-meta";

describe("zadania CKE w działach", () => {
  it("każde zadanie arkusza ma dział; działy rozszerzenia tylko w arkuszach rozszerzonych", () => {
    for (const sheet of CKE_SHEETS) {
      sheet.tasks.forEach((task, i) => {
        const topicId = ckeTopicOf(sheet, i);
        expect(topicId, `${sheet.id} ${task.id}`).toBeDefined();
        const topic = getTopic(topicId!);
        expect(topic, `${task.id} → ${topicId}`).toBeDefined();
        if (sheet.level === "podstawowy") expect(topicId!.startsWith("rz-"), task.id).toBe(false);
      });
    }
  });

  it("w „Zadaniach” są zamknięte i otwarte z wynikiem – bez „wyboru” i dowodów; zamknięte w indeksie pytań", () => {
    const all = allTopics.flatMap((t) => ckeTasksOfTopic(t.id));
    expect(all.length).toBeGreaterThan(100);
    for (const task of all) {
      expect(task.kind === "closed" || (task.kind === "open" && task.task.format !== "proof"), task.id).toBe(true);
      if (task.kind === "closed") expect(findQuestion(task.id)?.question.correct, task.id).toBe(task.question.correct);
    }
    const choicesAndProofs = CKE_SHEETS.flatMap((s) => s.tasks).filter((t) => t.kind === "choice" || (t.kind === "open" && t.task.format === "proof"));
    const shown = new Set(all.map((t) => t.id));
    expect(choicesAndProofs.some((t) => shown.has(t.id))).toBe(false);
    expect(practiceTasks(getTopic("ciagi")!).some(isCkeTask)).toBe(true);
  });

  it("arkusze losowe biorą tylko zadania autorskie", () => {
    for (const level of ["podstawowy", "rozszerzony"] as const) expect(examPool(level).some((p) => isCkeTask(p.task))).toBe(false);
  });
});

describe("podpowiedzi do zadań CKE w „Zadaniach”", () => {
  it("każde zadanie CKE w działach ma co najmniej dwie podpowiedzi; arkusz zostaje bez pomocy", () => {
    const all = allTopics.flatMap((t) => ckeTasksOfTopic(t.id));
    const missing = all.filter((t) => ((t.kind === "closed" ? t.question.hints : t.task.hints) ?? []).length < 2).map((t) => t.id);
    expect(missing).toEqual([]);
    const original = CKE_SHEETS.flatMap((s) => s.tasks).filter((t) => t.kind === "closed" || t.kind === "open");
    expect(original.some((t) => (t.kind === "closed" ? t.question.hints : t.kind === "open" ? t.task.hints : undefined)?.length)).toBe(false);
  });

  it("w pliku podpowiedzi nie ma wpisów dla nieistniejących zadań", async () => {
    const { CKE_HELP } = await import("@/data/cke/podpowiedzi");
    const ids = new Set(allTopics.flatMap((t) => ckeTasksOfTopic(t.id)).map((t) => t.id));
    expect(Object.keys(CKE_HELP).filter((id) => !ids.has(id))).toEqual([]);
  });
});
