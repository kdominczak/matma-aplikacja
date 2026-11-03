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
