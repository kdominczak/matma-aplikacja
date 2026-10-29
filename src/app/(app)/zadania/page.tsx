import { Suspense } from "react";
import PracticeHub from "@/components/practice/PracticeHub";
import { PageSkeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Zadania – Matma" };

// widok (zadania / lekcje) czyta komponent z adresu w przeglądarce – statyczny eksport wymaga Suspense
export default function PracticePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PracticeHub />
    </Suspense>
  );
}
