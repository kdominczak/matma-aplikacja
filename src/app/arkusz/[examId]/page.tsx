import { notFound } from "next/navigation";
import ExamRunner from "@/components/exam/ExamRunner";
import { EXAMS, getExam } from "@/data/exams";

// Static export: plik HTML dla każdego arkusza z listy, innych adresów nie ma.
export const dynamicParams = false;

export function generateStaticParams() {
  return EXAMS.map((exam) => ({ examId: exam.id }));
}

export async function generateMetadata({ params }: PageProps<"/arkusz/[examId]">) {
  const { examId } = await params;
  return { title: `${getExam(examId)?.title ?? "Arkusz"} – Matma` };
}

/** Tryb egzaminu – pełny ekran, bez menu aplikacji (jak testy działów). */
export default async function ExamPage({ params }: PageProps<"/arkusz/[examId]">) {
  const { examId } = await params;
  if (!getExam(examId)) notFound();
  return <ExamRunner examId={examId} />;
}
