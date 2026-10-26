"use client";

import { useEffect, useRef, useState } from "react";
import ScratchBackground, { type ScratchTemplate } from "@/components/quiz/ScratchBackground";
import Icon, { type IconName } from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { useTheme } from "@/lib/theme";

type PenColor = "ink" | "blue" | "red";

export type Stroke = {
  points: [number, number][];
  /** Klucz koloru, nie wartość – „czarny” w ciemnym motywie rysuje się jasno. */
  color: PenColor;
  width: number;
  erase: boolean;
};

const PALETTE: Record<PenColor, { label: string; light: string; dark: string }> = {
  ink: { label: "Czarny", light: "#0f172a", dark: "#f1f4fa" },
  blue: { label: "Niebieski", light: "#2f5bff", dark: "#7b97ff" },
  red: { label: "Czerwony", light: "#e11d48", dark: "#fb7185" },
};

const TEMPLATES: { id: ScratchTemplate; label: string; icon: IconName }[] = [
  { id: "grid", label: "Kratka", icon: "grid" },
  { id: "blank", label: "Czysta", icon: "square" },
  { id: "axes", label: "Układ XY", icon: "axes" },
  { id: "numberline", label: "Oś liczbowa", icon: "ruler" },
];

const ERASER_SCALE = 5;

type Props = {
  prompt: string;
  strokes: Stroke[];
  onChange: (strokes: Stroke[]) => void;
  template: ScratchTemplate;
  onTemplateChange: (template: ScratchTemplate) => void;
  onClose: () => void;
};

/** Brudnopis do rozpisywania zadania palcem, rysikiem lub myszą. */
export default function Scratchpad({ prompt, strokes, onChange, template, onTemplateChange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<Stroke | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState<PenColor>("ink");
  const [width, setWidth] = useState(3);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { isDark } = useTheme();

  // Dopasowanie płótna do rozmiaru (z gęstością pikseli ekranu) i odrysowanie notatek.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const redraw = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      strokes.forEach((stroke) => drawStroke(ctx, stroke, isDark));
      setSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    };
    // ResizeObserver wywołuje się od razu po observe() – to jest też pierwsze rysowanie
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [strokes, isDark]);

  function point(e: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const erase = tool === "eraser";
    drawing.current = { points: [point(e)], color, width: erase ? width * ERASER_SCALE : width, erase };
    drawStroke(e.currentTarget.getContext("2d")!, drawing.current, isDark);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const stroke = drawing.current;
    if (!stroke) return;
    stroke.points.push(point(e));
    // dorysowujemy tylko ostatni odcinek – płynniej niż przerysowanie całości
    drawStroke(e.currentTarget.getContext("2d")!, { ...stroke, points: stroke.points.slice(-2) }, isDark);
  }

  function handleUp() {
    if (!drawing.current) return;
    onChange([...strokes, drawing.current]);
    drawing.current = null;
  }

  const toolButton = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors";
  const previewSize = tool === "eraser" ? Math.min(width * ERASER_SCALE, 36) : width;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-card pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
            <Icon name="pencil" className="h-5 w-5" />
          </span>
          <h2 className="font-extrabold text-ink">Brudnopis</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white shadow-float active:bg-brand-dark"
        >
          Gotowe
        </button>
      </header>

      <div className="border-b border-line bg-surface px-4 py-3 text-sm font-semibold text-body lg:px-8">
        <div className="mx-auto max-w-3xl">
          <MathText text={prompt} />
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScratchBackground template={template} width={size.width} height={size.height} />
        <canvas
          ref={canvasRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className={`absolute inset-0 h-full w-full touch-none ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
          aria-label="Pole do rysowania"
        />
      </div>

      <footer className="border-t border-line bg-card px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            {(Object.keys(PALETTE) as PenColor[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool("pen");
                }}
                aria-label={PALETTE[c].label}
                aria-pressed={tool === "pen" && color === c}
                className={`${toolButton} ${tool === "pen" && color === c ? "bg-subtle ring-2 ring-brand" : ""}`}
              >
                <span className="h-5 w-5 rounded-full border border-line" style={{ background: PALETTE[c][isDark ? "dark" : "light"] }} />
              </button>
            ))}
            <button
              onClick={() => setTool("eraser")}
              aria-label="Gumka"
              aria-pressed={tool === "eraser"}
              className={`${toolButton} ${tool === "eraser" ? "bg-subtle text-ink ring-2 ring-brand" : "text-muted"}`}
            >
              <Icon name="eraser" />
            </button>

            <label className="ml-2 flex min-w-0 flex-1 items-center gap-2 lg:w-48 lg:flex-none">
              <span className="sr-only">Grubość</span>
              <input
                type="range"
                min={1}
                max={14}
                step={0.5}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="min-w-0 flex-1 accent-brand"
              />
              <span className="flex h-9 w-9 shrink-0 items-center justify-center" aria-hidden>
                <span
                  className={`rounded-full ${tool === "eraser" ? "border-2 border-dashed border-muted" : ""}`}
                  style={{
                    width: previewSize,
                    height: previewSize,
                    background: tool === "eraser" ? "transparent" : PALETTE[color][isDark ? "dark" : "light"],
                  }}
                />
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1 rounded-2xl bg-subtle p-1" role="radiogroup" aria-label="Tło kartki">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={template === t.id}
                  onClick={() => onTemplateChange(t.id)}
                  title={t.label}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${
                    template === t.id ? "bg-card text-ink shadow-card" : "text-muted"
                  }`}
                >
                  <Icon name={t.icon} className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 text-muted">
              <button
                onClick={() => onChange(strokes.slice(0, -1))}
                disabled={strokes.length === 0}
                aria-label="Cofnij"
                className={`${toolButton} hover:bg-subtle disabled:opacity-30`}
              >
                <Icon name="undo" />
              </button>
              <button
                onClick={() => onChange([])}
                disabled={strokes.length === 0}
                aria-label="Wyczyść wszystko"
                className={`${toolButton} hover:bg-subtle hover:text-rose-500 disabled:opacity-30`}
              >
                <Icon name="trash" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, isDark: boolean) {
  const [first, ...rest] = stroke.points;
  const color = PALETTE[stroke.color][isDark ? "dark" : "light"];
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (rest.length === 0) {
    // pojedyncze tapnięcie = kropka
    ctx.beginPath();
    ctx.arc(first[0], first[1], stroke.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
}
