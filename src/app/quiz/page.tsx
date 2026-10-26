import QuizScreen from "@/components/quiz/QuizScreen";
import { sampleQuestions } from "@/data/questions";

export default function QuizPage() {
  return <QuizScreen questions={sampleQuestions} />;
}
