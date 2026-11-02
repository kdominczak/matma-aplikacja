"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { examHref } from "@/data/exams";
import { lastRandomExamCode, loadSession, readAttempts, rememberRandomExam } from "@/lib/exam";
import { blueprintLevel, currentBlueprint, parseExamCode, pickExam } from "@/lib/exam-generator";
import { hapticTap } from "@/lib/haptics";
import { readProgress } from "@/lib/progress";
import type { Level } from "@/types/topic";

/** Karta „Arkusz losowy”: nowy arkusz w układzie prawdziwej matury, kod od znajomego, powrót do arkusza w toku. */
export default function RandomExamCard({ level = "podstawowy" }: { level?: Level }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState<{ code: string; answered: number } | null>(null);
  const blueprint = currentBlueprint(level);
  const extended = level === "rozszerzony";

  useEffect(() => {
    let active = true;
    void (async () => {
      const value = await lastRandomExamCode();
      const parsed = value ? parseExamCode(value) : null;
      // arkusz w toku z drugiego poziomu pokazujemy po przełączeniu poziomu
      if (!value || !parsed || blueprintLevel(parsed.blueprint) !== level) return;
      const session = await loadSession(`los-${value}`);
      if (active && session) setResume({ code: value, answered: Object.keys(session.answers).length });
    })();
    return () => {
      active = false;
    };
  }, [level]);

  function open(examCode: string) {
    hapticTap();
    void rememberRandomExam(examCode);
    router.push(examHref({ id: `los-${examCode}`, kind: "losowy", code: examCode }));
  }

  async function draw() {
    setBusy(true);
    // zadania, które uczeń już zna (z „Zadań” i wcześniejszych arkuszy) – losujemy arkusz z jak najmniejszą ich liczbą
    const [progress, attempts] = await Promise.all([readProgress(), readAttempts()]);
    const seen = new Set([...Object.keys(progress.practice), ...attempts.flatMap((a) => a.results.map((r) => r.taskId))]);
    open(pickExam(blueprint, { seen }).code);
  }

  function submitCode() {
    const normalized = code.trim().toLowerCase();
    if (!parseExamCode(normalized)) {
      setError("To nie jest poprawny kod arkusza (np. 26K3F9A albo R26K3F9A dla rozszerzenia).");
      return;
    }
    open(normalized);
  }

  return (
    <section className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card md:col-span-2 xl:col-span-3 lg:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-extrabold uppercase tracking-widest text-white/60">
          Arkusz losowy · układ matury {extended ? "rozszerzonej " : ""}
          {blueprint.year}
        </p>
        <h3 className="mt-1 text-2xl font-extrabold">Nowy arkusz za każdym razem</h3>
        <p className="mt-1 max-w-2xl text-sm text-white/70">
          {blueprint.totalPoints} pkt, {blueprint.durationMin} minut, te same działy{extended ? ", same zadania otwarte" : ", typy zadań"} i punktacja co na
          prawdziwej maturze. Wybieramy arkusze o podobnej trudności i z zadaniami, których jeszcze nie znasz.
        </p>
      </div>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => void draw()}
          disabled={busy}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-6 font-bold text-on-brand shadow-float btn-hover active:bg-brand-dark disabled:opacity-60"
        >
          <Icon name="refresh" className="h-4 w-4" />
          Losuj arkusz
        </button>
        {resume && (
          <Link
            href={examHref({ id: `los-${resume.code}`, kind: "losowy", code: resume.code })}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/15"
          >
            Wróć do arkusza {resume.code.toUpperCase()} ({resume.answered} odp.)
          </Link>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCode();
        }}
        className="relative flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center"
      >
        <label htmlFor="exam-code" className="text-sm font-semibold text-white/70">
          Masz kod od znajomego?
        </label>
        <div className="flex gap-2">
          <input
            id="exam-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder={extended ? "np. R26K3F9A" : "np. 26K3F9A"}
            maxLength={8}
            autoCapitalize="characters"
            autoComplete="off"
            className="min-h-11 w-36 rounded-xl border border-white/15 bg-white/10 px-3 font-mono text-sm uppercase tracking-widest text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button type="submit" className="min-h-11 rounded-xl bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/15">
            Otwórz
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-amber-300">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
