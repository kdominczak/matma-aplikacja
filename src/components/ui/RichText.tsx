import { Fragment, type ReactNode } from "react";
import MathText from "@/components/ui/MathText";

/**
 * Lekki renderer odpowiedzi AI: akapity, listy („- ”, „1. ”), **pogrubienia** i wzory w $...$.
 * Celowo bez pełnego markdownu – prompt prosi model tylko o te elementy.
 */
export default function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = normalizeMath(text).trim().split(/\n{2,}/);
  return (
    <div className={`flex flex-col gap-3 leading-relaxed ${className}`}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

/** Modele czasem piszą wzory jako \( \), \[ \] albo $$ $$ mimo instrukcji – sprowadzamy je do $...$. */
function normalizeMath(text: string): string {
  return text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => `$${tex.trim()}$`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, tex: string) => `$${tex.trim()}$`)
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, tex: string) => `$${tex.trim()}$`);
}

function Block({ block }: { block: string }) {
  const lines = block.split("\n").filter((l) => l.trim());
  if (lines.length > 0 && lines.every((l) => /^\s*[-*•]\s+/.test(l))) {
    return (
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {lines.map((l, i) => (
          <li key={i}>
            <Inline text={l.replace(/^\s*[-*•]\s+/, "")} />
          </li>
        ))}
      </ul>
    );
  }
  if (lines.length > 0 && lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
    return (
      <ol className="flex list-decimal flex-col gap-1 pl-5 marker:font-bold marker:text-brand">
        {lines.map((l, i) => (
          <li key={i}>
            <Inline text={l.replace(/^\s*\d+[.)]\s+/, "")} />
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p>
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <Inline text={l} />
        </Fragment>
      ))}
    </p>
  );
}

function Inline({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-extrabold text-ink">
        <MathText text={part.slice(2, -2)} />
      </strong>
    ) : (
      <MathText key={i} text={part} />
    ),
  );
}
