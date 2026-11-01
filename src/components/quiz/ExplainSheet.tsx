"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RedeemCodeForm from "@/components/premium/RedeemCodeForm";
import TrapCard from "@/components/quiz/TrapCard";
import BottomSheet from "@/components/ui/BottomSheet";
import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import RichText from "@/components/ui/RichText";
import { questionAsText, setTutorDraft, streamAi, toAiQuestion } from "@/lib/ai";
import { AI_ENABLED } from "@/lib/ai-config";
import { displayKey } from "@/lib/options";
import { AiLimitError } from "@/lib/premium";
import type { OptionKey, QuizQuestion } from "@/types/quiz";

type Props = {
  question: QuizQuestion;
  chosen: OptionKey;
  onClose: () => void;
};

/** „Wyjaśnij mi to zadanie” – wytłumaczenie krok po kroku od AI albo z klucza odpowiedzi (bez AI albo po wyczerpaniu limitu). */
export default function ExplainSheet({ question, chosen, onClose }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    if (!AI_ENABLED) return;
    const controller = new AbortController();
    streamAi({ mode: "explain", question: toAiQuestion(question, chosen) }, setText, controller.signal)
      .catch((e: Error) => {
        if (controller.signal.aborted) return;
        setError(e.message);
        setLimited(e instanceof AiLimitError);
      });
    return () => controller.abort();
  }, [question, chosen]);

  function askTutor() {
    setTutorDraft(questionAsText(question, chosen));
    router.push("/korepetytor");
  }

  const fallback = (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        Poprawna odpowiedź: {displayKey(question, question.correct)}
      </p>
      <p className="leading-relaxed text-body">
        <MathText text={question.explanation} />
      </p>
    </div>
  );

  return (
    <BottomSheet title="Wyjaśnienie krok po kroku" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-subtle p-4 text-sm font-semibold text-body">
          <MathText text={question.prompt} />
          <p className="mt-2 text-xs font-bold text-muted">
            Twoja odpowiedź: <span className="text-rose-500">{displayKey(question, chosen)}</span> · poprawna:{" "}
            <span className="text-emerald-600 dark:text-emerald-400">{displayKey(question, question.correct)}</span>
          </p>
        </div>

        {AI_ENABLED && !error ? (
          <div className="rounded-2xl border border-brand/20 bg-brand-soft p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brand">
              <Icon name="sparkles" className="h-4 w-4" />
              Korepetytor AI
            </p>
            {text ? <RichText text={text} className="text-body" /> : <TypingDots />}
          </div>
        ) : (
          <>
            {error && !limited && <p className="text-sm text-muted">{error} Poniżej wyjaśnienie z klucza odpowiedzi.</p>}
            {fallback}
            {limited && (
              <Link
                href="/premium"
                className="flex items-center gap-2 rounded-2xl border border-brand/20 bg-brand-soft p-3 text-sm font-bold text-brand"
              >
                <Icon name="sparkles" className="h-4 w-4 shrink-0" />
                Darmowe wyjaśnienia AI na dziś się skończyły. Z Premium korepetytor wytłumaczy każde zadanie krok po kroku.
              </Link>
            )}
            {limited && <RedeemCodeForm collapsed />}
          </>
        )}

        {question.trap && <TrapCard text={question.trap} />}

        {AI_ENABLED && (
          <button
            onClick={askTutor}
            className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card py-3 font-bold text-brand transition-colors hover:border-brand/60 dark:hover:border-brand/40"
          >
            <Icon name="message" className="h-4 w-4" />
            Dopytaj korepetytora
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

export function TypingDots() {
  return (
    <span className="flex gap-1 py-2" aria-label="Korepetytor pisze…">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-brand/60" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </span>
  );
}
