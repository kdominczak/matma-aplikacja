"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import CategoryTile from "@/components/topic/CategoryTile";
import FormulaList from "@/components/topic/FormulaList";
import FunctionPlot from "@/components/ui/FunctionPlot";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import Stars from "@/components/ui/Stars";
import { DIFFICULTIES, getTopic } from "@/data/topics";
import { hapticError, hapticTap } from "@/lib/haptics";
import { isUnlocked, testKey, useProgress } from "@/lib/progress";
import type { Progress } from "@/types/progress";
import type { Topic } from "@/types/topic";

const TABS = [
  { id: "teoria", label: "Teoria" },
  { id: "wzory", label: "Wzory" },
  { id: "test", label: "Test" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Zakładka trzymana w #hash – powrót z testu (`/dzial/x#test`) otwiera od razu „Test”.
function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function useTab(): [TabId, (tab: TabId) => void] {
  const hash = useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
  const tab = TABS.some((t) => t.id === hash) ? (hash as TabId) : "teoria";
  const setTab = (next: TabId) => {
    history.replaceState(null, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return [tab, setTab];
}

export default function TopicView({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!;
  const content = topic.content!;
  const [tab, setTab] = useTab();
  const progress = useProgress();

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in px-4 sm:px-6 lg:px-10">
      <div className="flex items-center gap-2 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-2 lg:pt-8">
        <Link href="/" aria-label="Wróć do planu" className="-ml-2 flex items-center gap-1 rounded-full p-2 font-bold text-muted hover:bg-card hover:text-ink">
          <Icon name="back" className="h-5 w-5" />
          <span className="text-sm">Plan nauki</span>
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
          <TopicHero topic={topic} />
          <LevelSummary topic={topic} progress={progress} onOpen={() => setTab("test")} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="sticky top-0 z-20 -mx-4 bg-surface/90 px-4 pt-[env(safe-area-inset-top)] pb-3 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:pt-3">
            <div className="grid max-w-md grid-cols-3 rounded-2xl border border-line bg-card p-1 shadow-card" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-xl py-2 text-sm font-bold transition-colors ${
                    tab === t.id ? "bg-brand text-white shadow-float" : "text-muted hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div key={tab} className="flex max-w-3xl animate-fade-in flex-col gap-4">
            {tab === "teoria" && (
              <>
                {content.theory.map((section, i) => (
                  <article key={section.title} className="rounded-3xl border border-line bg-card p-5 shadow-card lg:p-7">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Krok {i + 1}</p>
                    <h2 className="mt-1 text-xl font-extrabold text-ink">{section.title}</h2>
                    <div className="mt-3 flex flex-col gap-3 leading-relaxed text-body lg:text-[17px]">
                      {section.body.split("\n\n").map((paragraph, j) => (
                        <p key={j}>
                          <MathText text={paragraph} />
                        </p>
                      ))}
                    </div>
                    {section.plot && (
                      <div className="mt-5 rounded-2xl bg-subtle/60 p-3">
                        <FunctionPlot plot={section.plot} />
                      </div>
                    )}
                    {section.example && (
                      <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-soft p-4">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Przykład</p>
                        <p className="mt-1 font-semibold text-ink">
                          <MathText text={section.example.prompt} />
                        </p>
                        <p className="mt-2 text-body">
                          <MathText text={section.example.solution} />
                        </p>
                      </div>
                    )}
                  </article>
                ))}
                <NextStep label="Przejdź do wzorów" onClick={() => setTab("wzory")} />
              </>
            )}

            {tab === "wzory" && (
              <>
                <FormulaList formulas={content.formulas} columns />
                <NextStep label="Sprawdź się w teście" onClick={() => setTab("test")} />
              </>
            )}

            {tab === "test" && <TestLevels topic={topic} progress={progress} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicHero({ topic }: { topic: Topic }) {
  const chips = [
    { icon: "clock" as const, text: `~${topic.studyHours} h nauki` },
    { icon: "target" as const, text: `${topic.examShare}% matur` },
    { icon: "bolt" as const, text: `Priorytet ${topic.priority}` },
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-card lg:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-brand/30 blur-3xl" />
      <div className="relative flex items-start gap-4 lg:flex-col">
        <CategoryTile topic={topic} />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">
            {topic.lesson} · {topic.category}
          </p>
          <h1 className="text-xl leading-tight font-extrabold lg:text-2xl">{topic.title}</h1>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip.text} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">
                <Icon name={chip.icon} className="h-3.5 w-3.5" />
                {chip.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Skrót statusu poziomów (tylko desktop – na telefonie jest zakładka „Test”). */
function LevelSummary({ topic, progress, onOpen }: { topic: Topic; progress: Progress | null; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="hidden flex-col gap-3 rounded-3xl border border-line bg-card p-5 text-left shadow-card transition-transform hover:-translate-y-0.5 lg:flex"
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted">Test podsumowujący</p>
      {DIFFICULTIES.map((level) => {
        const record = progress?.tests[testKey(topic.id, level.id)];
        return (
          <div key={level.id} className="flex items-center justify-between gap-2">
            <span className={`text-sm font-bold ${record ? "text-ink" : "text-muted"}`}>{level.label}</span>
            <Stars value={record?.stars ?? 0} />
          </div>
        );
      })}
    </button>
  );
}

function NextStep({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl bg-brand py-4 font-bold text-white shadow-float transition-transform hover:-translate-y-0.5 active:bg-brand-dark sm:max-w-xs"
    >
      {label} <Icon name="arrow" className="h-4 w-4" />
    </button>
  );
}

const LEVEL_STYLE = {
  podstawowy: { tile: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300", icon: "bulb" },
  sredni: { tile: "bg-brand-soft text-brand", icon: "target" },
  zaawansowany: { tile: "bg-violet-500/15 text-violet-600 dark:text-violet-300", icon: "trophy" },
} as const;

function TestLevels({ topic, progress }: { topic: Topic; progress: Progress | null }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Każdy test ma 3 serca. Zaliczasz od 60% poprawnych odpowiedzi – to odblokowuje kolejny poziom.
      </p>
      {DIFFICULTIES.map((level) => {
        const record = progress?.tests[testKey(topic.id, level.id)];
        const unlocked = progress ? isUnlocked(progress, topic.id, level.id) : level.id === "podstawowy";
        const style = LEVEL_STYLE[level.id];
        const questionCount = topic.content!.tests[level.id].length;

        const body = (
          <>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${unlocked ? style.tile : "bg-subtle text-faint"}`}>
              <Icon name={unlocked ? style.icon : "lock"} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-ink">Poziom {level.label.toLowerCase()}</p>
              <p className="text-sm text-muted">{unlocked ? level.description : "Zalicz poprzedni poziom, aby odblokować"}</p>
              <p className="mt-1 text-xs font-semibold text-faint">
                {questionCount} {pluralTasks(questionCount)} · {level.xpPerCorrect} XP za zadanie
                {record && ` · najlepiej ${record.correct}/${record.total}`}
              </p>
            </div>
            {record ? (
              <Stars value={record.stars} />
            ) : (
              unlocked && <Icon name="chevron" className="h-5 w-5 shrink-0 text-faint" />
            )}
          </>
        );

        const className = "flex items-center gap-4 rounded-3xl border border-line bg-card p-4 lg:p-5";
        return unlocked ? (
          <Link
            key={level.id}
            href={`/dzial/${topic.id}/test/${level.id}`}
            onClick={() => hapticTap()}
            className={`${className} shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 active:scale-[0.98]`}
          >
            {body}
          </Link>
        ) : (
          <button key={level.id} onClick={() => hapticError()} className={`${className} text-left opacity-60`}>
            {body}
          </button>
        );
      })}
    </section>
  );
}

function pluralTasks(n: number) {
  if (n === 1) return "zadanie";
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? "zadania" : "zadań";
}
