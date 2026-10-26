import { notFound } from "next/navigation";
import TopicView from "@/components/topic/TopicView";
import { getTopic, topics } from "@/data/topics";

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.filter((topic) => topic.content).map((topic) => ({ topicId: topic.id }));
}

export default async function TopicPage({ params }: PageProps<"/dzial/[topicId]">) {
  const { topicId } = await params;
  if (!getTopic(topicId)?.content) notFound();

  return <TopicView topicId={topicId} />;
}
