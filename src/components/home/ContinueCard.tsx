"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { EXAMS, examHref, getExam } from "@/data/exams";
import { findTask, practiceTasks } from "@/data/topics";
import { lastRandomExamCode, loadSession } from "@/lib/exam";
import { hapticTap } from "@/lib/haptics";
import { dayKey, formatDay, parseDay } from "@/lib/stats";
import type { Progress } from "@/types/progress";

/** Ile dni wstecz proponujemy powrót do ostatnio ćwiczonego działu. */
const RECENT_DAYS = 7;

interface Resume {
  href: string;
  kicker: string;
  title: string;
  detail: string;
}

/** Arkusz w toku (stały albo ostatni losowy) – najświeższy. */
async function examInProgress(): Promise<Resume | null> {
  const code = await lastRandomExamCode();
  const ids = [...EXAMS.map((e) => e.id), ...(code ? [`los-${code}`] : [])];
  const sessions = (await Promise.all(ids.map((id) => loadSession(id)))).filter((s) => s !== null);
  const latest = sessions.sort((a, b) => b.startedAt - a.startedAt)[0];
  const exam = latest && getExam(latest.examId);
  if (!latest || !exam) return null;
  return {
    href: examHref(exam),
    kicker: "Arkusz w toku",
    title: exam.title,
    detail: `${Object.keys(latest.answers).length}/${exam.tasks.length} odpowiedzi · czas leci jak na maturze`,
  };
}

/**
 * Ostatnio ćwiczony dział z „Zadań”, jeśli został w nim jeszcze jakiś nierozwiązany – link prowadzi prosto do zadania:
 * ostatniego, jeśli nie jest rozwiązane, inaczej do następnego nierozwiązanego (po kolei, z zawinięciem na początek).
 */
function recentPractice(progress: Progress): Resume | null {
  const [taskId, record] = Object.entries(progress.practice).sort(([, a], [, b]) => b.lastAt.localeCompare(a.lastAt))[0] ?? [];
  if (!taskId || !record) return null;
  const days = Math.round((parseDay(dayKey()).getTime() - parseDay(record.lastAt).getTime()) / 86_400_000);
  const ref = findTask(taskId);
  if (!ref || days > RECENT_DAYS) return null;
  const tasks = practiceTasks(ref.topic);
  const unsolved = (i: number) => progress.practice[tasks[i].id]?.verifiedPoints !== tasks[i].points;
  const left = tasks.filter((_, i) => unsolved(i)).length;
  if (left === 0) return null;
  const last = Math.max(0, tasks.findIndex((t) => t.id === taskId));
  const target = [...tasks.keys()].map((k) => (last + k) % tasks.length).find(unsolved) ?? last;
  return {
    href: `/zadania/${ref.topic.id}?zadanie=${encodeURIComponent(tasks[target].id)}`,
    kicker: days === 0 ? "Ćwiczone dziś" : days === 1 ? "Ćwiczone wczoraj" : `Ćwiczone ${formatDay(record.lastAt)}`,
    title: `${ref.topic.title} · zadanie ${target + 1}`,
    detail: `Do rozwiązania: ${left} z ${tasks.length}`,
  };
}

/** „Wróć do…” – jednym stuknięciem tam, gdzie uczeń skończył. Nie pokazuje się, gdy nie ma do czego wracać. */
export default function ContinueCard({ progress }: { progress: Progress | null }) {
  const [exam, setExam] = useState<Resume | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void examInProgress().then((found) => active && setExam(found));
    return () => {
      active = false;
    };
  }, []);

  if (!progress || exam === undefined) return null;
  const resume = exam ?? recentPractice(progress);
  if (!resume) return null;

  return (
    <Link
      href={resume.href}
      onClick={() => hapticTap()}
      className="card group flex items-center gap-4 p-4 card-hover hover:border-brand/60 dark:hover:border-brand/40 active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon name={exam ? "file" : "tasks"} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-wide text-muted">Kontynuuj · {resume.kicker}</span>
        <span className="block truncate font-extrabold text-ink">{resume.title}</span>
        <span className="block truncate text-sm text-muted">{resume.detail}</span>
      </span>
      <Icon name="arrow" className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
