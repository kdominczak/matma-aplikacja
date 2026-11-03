import { Suspense } from "react";
import { notFound } from "next/navigation";
import PracticeSession from "@/components/practice/PracticeSession";
import { QuizSkeleton } from "@/components/ui/Skeleton";
import { allTopics, getTopic, practiceTasks } from "@/data/topics";

// Static export: plik HTML dla każdego działu z zadaniami, innych adresów nie ma.
export const dynamicParams = false;

export function generateStaticParams() {
  return allTopics.filter((topic) => practiceTasks(topic).length > 0).map((topic) => ({ topicId: topic.id }));
}

export default async function PracticeTopicPage({ params }: PageProps<"/zadania/[topicId]">) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic || practiceTasks(topic).length === 0) notFound();

  // Suspense: sesja czyta `?zadanie=` w przeglądarce (useSearchParams w statycznym eksporcie)
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <PracticeSession topicId={topicId} />
    </Suspense>
  );
}
