"use client";

import { useSearchParams } from "next/navigation";
import ExamRunner from "@/components/exam/ExamRunner";
import ErrorState from "@/components/ui/ErrorState";
import { parseExamCode } from "@/lib/exam-generator";

/** Arkusz losowy z kodu w adresie (`/arkusz/losowy/?kod=26k3f9a`) – ten sam kod daje zawsze ten sam arkusz. */
export default function RandomExam() {
  const code = (useSearchParams().get("kod") ?? "").trim().toLowerCase();
  if (!parseExamCode(code)) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <ErrorState title="Nieprawidłowy kod arkusza" message="Sprawdź kod (7 znaków, np. 26K3F9A) albo wylosuj nowy arkusz w zakładce Arkusze." />
      </div>
    );
  }
  return <ExamRunner examId={`los-${code}`} />;
}
