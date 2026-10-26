import { notFound } from "next/navigation";
import TopicTest from "@/components/quiz/TopicTest";
import { DIFFICULTIES, getTopic, topics } from "@/data/topics";
import type { Difficulty } from "@/types/topic";

// Static export: plik HTML dla każdej pary dział × poziom, innych adresów nie ma.
export const dynamicParams = false;

export function generateStaticParams() {
  return topics
    .filter((topic) => topic.content)
    .flatMap((topic) => DIFFICULTIES.map((d) => ({ topicId: topic.id, difficulty: d.id })));
}

export default async function TestPage({ params }: PageProps<"/dzial/[topicId]/test/[difficulty]">) {
  const { topicId, difficulty } = await params;
  if (!getTopic(topicId)?.content) notFound();

  return <TopicTest topicId={topicId} difficulty={difficulty as Difficulty} />;
}
