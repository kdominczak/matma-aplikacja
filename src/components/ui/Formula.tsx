import katex from "katex";

type Props = { tex: string; className?: string };

/** Wzór w trybie „display” (wyśrodkowany, większy) – do kart ze wzorami. */
export default function Formula({ tex, className }: Props) {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false });
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
