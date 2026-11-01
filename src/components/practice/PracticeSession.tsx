"use client";

import { useSearchParams } from "next/navigation";
import TaskSession from "@/components/practice/TaskSession";
import { formulaGroup, getTopic, practiceTasks } from "@/data/topics";

/** Zadania z jednego działu (zakładka „Zadania”). */
export default function PracticeSession({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!;
  // `?zadanie=<id>` – karta „Kontynuuj” otwiera dokładnie to zadanie, na którym uczeń skończył
  const startId = useSearchParams().get("zadanie");
  return (
    <TaskSession
      title={topic.title}
      exitHref="/zadania"
      exitLabel="Wróć do listy działów"
      tasks={practiceTasks(topic).map((task) => ({ task, topicId: topic.id }))}
      formulaGroups={[formulaGroup(topic)]}
      startId={startId}
    />
  );
}
