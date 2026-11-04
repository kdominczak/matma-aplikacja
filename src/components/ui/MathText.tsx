import katex from "katex";

type Props = {
  text: string;
  className?: string;
  /** Ułamki i potęgi w pełnym rozmiarze (\displaystyle) – odpowiedzi ABCD, gdzie wzór jest całą treścią. */
  display?: boolean;
};

const PUNCTUATION = /^[.,;:!?)]+/;
const isMath = (part: string) => part.startsWith("$") && part.endsWith("$") && part.length > 2;

/** Renderuje tekst z wstawkami LaTeX w $...$ (np. "Oblicz $\\sqrt{2}$"). Znak nowej linii łamie wiersz (np. zdania w zadaniach P/F). */
export default function MathText({ text, className, display = false }: Props) {
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={`whitespace-pre-line ${className ?? ""}`}>
      {parts.map((part, i) => {
        if (isMath(part)) {
          const tex = part.slice(1, -1);
          const html = katex.renderToString(display ? `\\displaystyle ${tex}` : tex, {
            throwOnError: false,
          });
          // przecinek albo kropka tuż po wzorze nie może spaść sama do nowej linii – łączy je niełamliwy
          // znak U+2060 (word joiner). Bez `whitespace-nowrap` na całym wzorze: długi wzór dalej łamie się po „=” i „⇒”.
          const glued = parts[i + 1]?.match(PUNCTUATION)?.[0];
          return (
            <span key={i}>
              <span dangerouslySetInnerHTML={{ __html: html }} />
              {glued ? `\u2060${glued}` : null}
            </span>
          );
        }
        const glued = isMath(parts[i - 1] ?? "") ? part.match(PUNCTUATION)?.[0] : undefined;
        return <span key={i}>{glued ? part.slice(glued.length) : part}</span>;
      })}
    </span>
  );
}
