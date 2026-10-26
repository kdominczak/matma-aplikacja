"use client";

import { useEffect, useRef, useState } from "react";
import ScratchBackground, { type ScratchTemplate } from "@/components/quiz/ScratchBackground";
import {
  colorOf,
  drawAnglePreview,
  drawItem,
  PALETTE,
  solidBox,
  type PenColor,
  type Point,
  type ScratchItem,
  type Solid,
} from "@/components/quiz/scratch-draw";
import Icon, { type IconName } from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { useTheme } from "@/lib/theme";

export type { ScratchItem } from "@/components/quiz/scratch-draw";

type Tool = "pen" | "eraser" | "solid" | "angle";

const TEMPLATES: { id: ScratchTemplate; label: string; icon: IconName }[] = [
  { id: "grid", label: "Kratka", icon: "grid" },
  { id: "blank", label: "Czysta", icon: "square" },
  { id: "axes", label: "Układ XY", icon: "axes" },
  { id: "numberline", label: "Oś liczbowa", icon: "ruler" },
];

const SOLIDS: { id: Solid; label: string; icon: IconName }[] = [
  { id: "cone", label: "Stożek", icon: "cone" },
  { id: "sphere", label: "Kula", icon: "sphere" },
  { id: "pyramid", label: "Ostrosłup", icon: "pyramid" },
  { id: "prism", label: "Graniastosłup", icon: "prism" },
];

const ANGLE_LABELS = ["α", "β", "γ", "δ"];
const ANGLE_STEPS = ["punkt na pierwszym ramieniu", "wierzchołek kąta", "punkt na drugim ramieniu"];
const ERASER_SCALE = 5;

type Props = {
  prompt: string;
  items: ScratchItem[];
  onChange: (items: ScratchItem[]) => void;
  template: ScratchTemplate;
  onTemplateChange: (template: ScratchTemplate) => void;
  onClose: () => void;
};

/** Brudnopis: pisanie, gumka, bryły 3D i zaznaczanie kątów na kartce z wybranym tłem. */
export default function Scratchpad({ prompt, items, onChange, template, onTemplateChange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<ScratchItem | null>(null);
  const dragStart = useRef<Point | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<PenColor>("ink");
  const [width, setWidth] = useState(3);
  const [solid, setSolid] = useState<Solid>("cone");
  const [angleLabel, setAngleLabel] = useState(ANGLE_LABELS[0]);
  const [anglePoints, setAnglePoints] = useState<Point[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { isDark } = useTheme();

  function redraw(extra?: ScratchItem) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach((item) => drawItem(ctx, item, isDark));
    if (extra) drawItem(ctx, extra, isDark);
    if (anglePoints.length > 0) drawAnglePreview(ctx, anglePoints, colorOf(color, isDark));
  }

  // Dopasowanie płótna do rozmiaru (z gęstością pikseli ekranu) i odrysowanie notatek.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
      setSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    };
    // ResizeObserver wywołuje się od razu po observe() – to jest też pierwsze rysowanie
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw czyta aktualne items/isDark/anglePoints
  }, [items, isDark, anglePoints]);

  function point(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function selectTool(next: Tool) {
    setTool(next);
    setAnglePoints([]);
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const p = point(e);
    if (tool === "angle") {
      const next = [...anglePoints, p];
      if (next.length < 3) {
        setAnglePoints(next);
        return;
      }
      const [a, vertex, b] = next;
      onChange([...items, { kind: "angle", vertex, a, b, label: angleLabel, color }]);
      setAnglePoints([]);
      // kolejny kąt dostaje następną literę
      setAngleLabel(ANGLE_LABELS[(ANGLE_LABELS.indexOf(angleLabel) + 1) % ANGLE_LABELS.length]);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === "solid") {
      dragStart.current = p;
      return;
    }
    const erase = tool === "eraser";
    drawing.current = { kind: "stroke", points: [p], color, width: erase ? width * ERASER_SCALE : width, erase };
    drawItem(e.currentTarget.getContext("2d")!, drawing.current, isDark);
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (tool === "solid" && dragStart.current) {
      // podgląd bryły w trakcie przeciągania
      const box = solidBox(dragStart.current, point(e));
      redraw({ kind: "solid", solid, ...box, color, width: Math.max(1.5, width * 0.6) });
      return;
    }
    const stroke = drawing.current;
    if (!stroke || stroke.kind !== "stroke") return;
    stroke.points.push(point(e));
    // dorysowujemy tylko ostatni odcinek – płynniej niż przerysowanie całości
    drawItem(e.currentTarget.getContext("2d")!, { ...stroke, points: stroke.points.slice(-2) }, isDark);
  }

  function handleUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (tool === "solid" && dragStart.current) {
      const box = solidBox(dragStart.current, point(e));
      dragStart.current = null;
      onChange([...items, { kind: "solid", solid, ...box, color, width: Math.max(1.5, width * 0.6) }]);
      return;
    }
    if (!drawing.current) return;
    onChange([...items, drawing.current]);
    drawing.current = null;
  }

  const toolButton = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors";
  const active = "bg-subtle text-ink ring-2 ring-brand";
  const previewSize = tool === "eraser" ? Math.min(width * ERASER_SCALE, 36) : width;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-card pt-[env(safe-area-inset-top)]">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
            <Icon name="pencil" className="h-5 w-5" />
          </span>
          <h2 className="hidden font-extrabold text-ink sm:block">Brudnopis</h2>
        </div>
        <div className="flex gap-1 rounded-2xl bg-subtle p-1" role="radiogroup" aria-label="Tło kartki">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={template === t.id}
              onClick={() => onTemplateChange(t.id)}
              title={t.label}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                template === t.id ? "bg-card text-ink shadow-card" : "text-muted"
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              <span className="hidden md:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white shadow-float active:bg-brand-dark"
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
        {(tool === "angle" || tool === "solid") && (
          <p className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-navy/90 px-4 py-1.5 text-xs font-bold text-white shadow-card">
            {tool === "angle"
              ? `Kąt ${angleLabel}: dotknij – ${ANGLE_STEPS[anglePoints.length]} (${anglePoints.length + 1}/3)`
              : "Przeciągnij, aby wstawić bryłę, albo dotknij, by wstawić ją w punkcie"}
          </p>
        )}
      </div>

      <footer className="border-t border-line bg-card px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Narzędzia */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              {(Object.keys(PALETTE) as PenColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    if (tool === "eraser") selectTool("pen");
                  }}
                  aria-label={PALETTE[c].label}
                  aria-pressed={color === c && tool !== "eraser"}
                  className={`${toolButton} ${color === c && tool !== "eraser" ? active : ""}`}
                >
                  <span className="h-5 w-5 rounded-full border border-line" style={{ background: colorOf(c, isDark) }} />
                </button>
              ))}
              <span className="mx-1 h-6 w-px bg-line" aria-hidden />
              <ToolButton icon="pencil" label="Długopis" selected={tool === "pen"} onClick={() => selectTool("pen")} />
              <ToolButton icon="eraser" label="Gumka" selected={tool === "eraser"} onClick={() => selectTool("eraser")} />
              <ToolButton icon="shapes" label="Bryły 3D" selected={tool === "solid"} onClick={() => selectTool("solid")} />
              <ToolButton icon="angle" label="Kąt" selected={tool === "angle"} onClick={() => selectTool("angle")} />
            </div>
            <div className="flex items-center gap-1 text-muted lg:hidden">
              <UndoClear items={items} onChange={onChange} className={toolButton} />
            </div>
          </div>

          {/* Opcje wybranego narzędzia */}
          <div className="flex min-h-10 items-center gap-2 lg:flex-1 lg:justify-center">
            {(tool === "pen" || tool === "eraser") && (
              <label className="flex w-full max-w-xs items-center gap-2">
                <span className="text-xs font-bold text-muted">Grubość</span>
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
                      background: tool === "eraser" ? "transparent" : colorOf(color, isDark),
                    }}
                  />
                </span>
              </label>
            )}
            {tool === "solid" && (
              <div className="flex gap-1 overflow-x-auto" role="radiogroup" aria-label="Bryła">
                {SOLIDS.map((s) => (
                  <button
                    key={s.id}
                    role="radio"
                    aria-checked={solid === s.id}
                    onClick={() => setSolid(s.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                      solid === s.id ? active : "text-muted hover:bg-subtle"
                    }`}
                  >
                    <Icon name={s.icon} className="h-4 w-4" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            {tool === "angle" && (
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Oznaczenie kąta">
                <span className="mr-1 text-xs font-bold text-muted">Oznaczenie</span>
                {ANGLE_LABELS.map((label) => (
                  <button
                    key={label}
                    role="radio"
                    aria-checked={angleLabel === label}
                    onClick={() => setAngleLabel(label)}
                    className={`${toolButton} font-serif text-lg italic ${angleLabel === label ? active : "text-muted"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-1 text-muted lg:flex">
            <UndoClear items={items} onChange={onChange} className={toolButton} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function ToolButton({ icon, label, selected, onClick }: { icon: IconName; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={selected}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
        selected ? "bg-subtle text-ink ring-2 ring-brand" : "text-muted hover:bg-subtle"
      }`}
    >
      <Icon name={icon} />
    </button>
  );
}

function UndoClear({ items, onChange, className }: { items: ScratchItem[]; onChange: (items: ScratchItem[]) => void; className: string }) {
  return (
    <>
      <button
        onClick={() => onChange(items.slice(0, -1))}
        disabled={items.length === 0}
        aria-label="Cofnij"
        className={`${className} hover:bg-subtle disabled:opacity-30`}
      >
        <Icon name="undo" />
      </button>
      <button
        onClick={() => onChange([])}
        disabled={items.length === 0}
        aria-label="Wyczyść wszystko"
        className={`${className} hover:bg-subtle hover:text-rose-500 disabled:opacity-30`}
      >
        <Icon name="trash" />
      </button>
    </>
  );
}
