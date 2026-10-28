import { Suspense } from "react";
import RandomExam from "@/components/exam/RandomExam";

export const metadata = { title: "Arkusz losowy – Matma" };

/** Tryb egzaminu dla arkusza z generatora – kod arkusza czyta komponent w przeglądarce (statyczny eksport). */
export default function RandomExamPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface" />}>
      <RandomExam />
    </Suspense>
  );
}
