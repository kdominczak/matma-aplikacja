import katex from "katex";

type Props = { text: string; className?: string };

/** Renderuje tekst z wstawkami LaTeX w $...$ (np. "Oblicz $\\sqrt{2}$"). Znak nowej linii łamie wiersz (np. zdania w zadaniach P/F). */
export default function MathText({ text, className }: Props) {
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={`whitespace-pre-line ${className ?? ""}`}>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const html = katex.renderToString(part.slice(1, -1), {
            throwOnError: false,
          });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
