"use client";

import Icon from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import type { OpenQuestion } from "@/types/quiz";

export interface OpenState {
  input: string;
  /** correct – wynik sprawdzony i dobry; wrong – zły wynik; revealed – uczeń poprosił o rozwiązanie. */
  verdict?: "correct" | "wrong" | "revealed";
  /** Samoocena wg schematu: które kroki uczeń ma poprawnie. */
  steps: boolean[];
  saved: boolean;
}

type Props = {
  task: OpenQuestion;
  state: OpenState;
  onChange: (state: OpenState) => void;
  onCheck: () => void;
  onReveal: () => void;
  onSaveSelfAssessment: (points: number) => void;
  onNext: (() => void) | null;
};

/** Zadanie otwarte: wynik końcowy sprawdzany automatycznie + schemat oceniania jak w zasadach CKE. */
export default function OpenAnswer({ task, state, onChange, onCheck, onReveal, onSaveSelfAssessment, onNext }: Props) {
  const selfPoints = task.solution.reduce((sum, s, i) => sum + (state.steps[i] ? s.points : 0), 0);
  const showSolution = state.verdict !== undefined;
  const canSelfAssess = state.verdict === "wrong" && !state.saved;

  return (
    <section className="flex flex-col gap-4">
      {state.verdict !== "correct" && state.verdict !== "revealed" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (state.input.trim()) onCheck();
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor={`answer-${task.id}`} className="text-sm font-bold text-body">
            Twój wynik końcowy
          </label>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-line bg-card px-4 focus-within:border-brand">
            {task.answerLabel && (
              <span className="shrink-0 font-serif text-lg text-muted italic">
                <MathText text={`$${task.answerLabel}$`} />
              </span>
            )}
            <input
              id={`answer-${task.id}`}
              value={state.input}
              onChange={(e) => onChange({ ...state, input: e.target.value, verdict: undefined })}
              disabled={state.verdict === "wrong"}
              autoComplete="off"
              spellCheck={false}
              placeholder="np. 3/2, 1,5 albo -2; 3"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-lg font-bold text-ink placeholder:font-medium placeholder:text-faint focus:outline-none disabled:opacity-70"
            />
          </div>
          <p className="text-xs text-faint">Ułamki zapisuj jako 3/2, kilka rozwiązań oddziel średnikiem. Zapisz rozwiązanie w brudnopisie.</p>

          {state.verdict === "wrong" ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="flex items-center gap-2 font-extrabold text-rose-600 dark:text-rose-400">
                <Icon name="close" className="h-5 w-5" />
                To nie jest poprawny wynik
              </p>
              <p className="mt-1 text-sm text-rose-800 dark:text-rose-200">
                Spróbuj jeszcze raz albo porównaj swoje rozwiązanie ze schematem – na maturze dostałbyś punkty za poprawne kroki.
              </p>
              <button
                type="button"
                onClick={() => onChange({ ...state, verdict: undefined, steps: [] })}
                className="mt-3 rounded-xl bg-card px-4 py-2 text-sm font-bold text-rose-600 dark:text-rose-300"
              >
                Spróbuj jeszcze raz
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={!state.input.trim()}
                className="flex-1 rounded-2xl bg-brand py-3.5 font-bold text-white shadow-float active:bg-brand-dark disabled:bg-subtle disabled:text-faint disabled:shadow-none"
              >
                Sprawdź wynik
              </button>
              <button type="button" onClick={onReveal} className="rounded-2xl border border-line bg-card px-4 py-3.5 font-bold text-muted hover:text-ink">
                Nie wiem – pokaż rozwiązanie
              </button>
            </div>
          )}
        </form>
      )}

      {state.verdict === "correct" && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="flex items-center gap-2 font-extrabold text-emerald-600 dark:text-emerald-400">
            <Icon name="checkCircle" className="h-5 w-5" />
            Dobrze! {task.points}/{task.points} pkt
          </p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            Twój wynik: <strong>{state.input}</strong>. Sprawdź, czy Twoje rozwiązanie ma wszystkie kroki ze schematu.
          </p>
        </div>
      )}

      {showSolution && (
        <section className="rounded-3xl border border-line bg-card p-5 shadow-card">
          <p className="text-xs font-extrabold uppercase tracking-widest text-brand">Schemat oceniania</p>
          <p className="mt-0.5 text-sm text-muted">
            {canSelfAssess
              ? "Zaznacz kroki, które masz poprawnie w swoim rozwiązaniu."
              : state.verdict === "revealed"
                ? "Przeanalizuj rozwiązanie krok po kroku i spróbuj podobnego zadania."
                : "Tak wygląda pełne rozwiązanie za maksymalną liczbę punktów."}
          </p>
          <ol className="mt-3 flex flex-col gap-2">
            {task.solution.map((step, i) => {
              const checked = state.verdict === "correct" || Boolean(state.steps[i]);
              return (
                <li key={i}>
                  <label
                    className={`flex gap-3 rounded-2xl border p-3 text-sm ${
                      canSelfAssess ? "cursor-pointer hover:border-brand/40" : ""
                    } ${checked && state.verdict !== "revealed" ? "border-emerald-500/40 bg-emerald-500/5" : "border-line"}`}
                  >
                    {canSelfAssess ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const steps = [...state.steps];
                          steps[i] = e.target.checked;
                          onChange({ ...state, steps });
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-extrabold text-muted">
                        {i + 1}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 leading-relaxed text-body">
                      <MathText text={step.step} />
                    </span>
                    <span className="shrink-0 text-xs font-extrabold text-brand">
                      {step.points} pkt
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
          {canSelfAssess && (
            <button
              onClick={() => onSaveSelfAssessment(selfPoints)}
              className="mt-4 w-full rounded-2xl bg-brand py-3 font-bold text-white shadow-float active:bg-brand-dark"
            >
              Zapisz wynik: {selfPoints}/{task.points} pkt
            </button>
          )}
          {state.verdict === "wrong" && state.saved && (
            <p className="mt-3 text-sm font-semibold text-muted">
              Zapisano {selfPoints}/{task.points} pkt (samoocena). Spróbuj jeszcze raz, żeby rozwiązać zadanie w całości.
            </p>
          )}
        </section>
      )}

      {onNext && (state.verdict === "correct" || state.verdict === "revealed" || state.saved) && (
        <button onClick={onNext} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card py-3.5 font-bold text-brand hover:border-brand/40">
          Następne zadanie <Icon name="arrow" className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
