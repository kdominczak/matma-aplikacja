"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import dynamic from "next/dynamic";
import ScratchBackground, { type ScratchTemplate } from "@/components/scratch/ScratchBackground";
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
} from "@/components/scratch/scratch-draw";
import Icon, { type IconName } from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { useTheme } from "@/lib/theme";
import type { FormulaGroup } from "@/types/topic";

// kalkulator doczytuje się dopiero po otwarciu
const Calculator = dynamic(() => import("@/components/scratch/Calculator"), { ssr: false });

export type { ScratchItem } from "@/components/scratch/scratch-draw";
export type { ScratchTemplate } from "@/components/scratch/ScratchBackground";

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
const DRAG_THRESHOLD = 6;

type Props = {
  /** „inline” – mały brudnopis obok zadania; „full” – pełny ekran. */
  variant: "inline" | "full";
  items: ScratchItem[];
  onChange: (items: ScratchItem[]) => void;
  template: ScratchTemplate;
  onTemplateChange: (template: ScratchTemplate) => void;
  /** Wzory do przeciągnięcia na kartkę (z działu zadania). */
  formulaGroups: FormulaGroup[];
  /** Treść zadania – w wersji pełnoekranowej nad kartką. */
  prompt?: string;
  onExpand?: () => void;
  onClose?: () => void;
};

/** Wzór „w locie” – ciągnięty z paska wzorów nad kartkę. */
type ChipDrag = { tex: string; startX: number; startY: number; x: number; y: number; dragging: boolean };
/** Przesuwanie wzoru, który już leży na kartce. */
type ItemMove = { index: number; offsetX: number; offsetY: number; x: number; y: number; moved: boolean };

export default function ScratchBoard(props: Props) {
  const { variant, items, onChange, template, onTemplateChange, formulaGroups } = props;
  const full = variant === "full";

  const boardRef = useRef<HTMLDivElement>(null);
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
  const [formulasOpen, setFormulasOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [chipDrag, setChipDrag] = useState<ChipDrag | null>(null);
  const [move, setMove] = useState<ItemMove | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { isDark } = useTheme();

  const formulas = formulaGroups.flatMap((g) => g.formulas);

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

  /** Punkt ekranu → współrzędne kartki. */
  function boardPoint(clientX: number, clientY: number): Point {
    const rect = boardRef.current!.getBoundingClientRect();
    return [clientX - rect.left, clientY - rect.top];
  }

  function insideBoard(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    return Boolean(rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom);
  }

  function addFormula(tex: string, at?: Point) {
    // bez punktu (stuknięcie w pasek / wynik kalkulatora) – w okolice środka, lekko przesunięte, żeby się nie nakładały
    const shift = (items.filter((i) => i.kind === "formula").length % 5) * 18;
    const [x, y] = at ?? [Math.max(8, size.width / 2 - 60 + shift), Math.max(8, size.height / 3 + shift)];
    onChange([...items, { kind: "formula", tex, x: Math.max(0, x), y: Math.max(0, y) }]);
  }

  // ── Rysowanie ──

  function selectTool(next: Tool) {
    setTool(next);
    setAnglePoints([]);
    setSelected(null);
  }

  function handleDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    setSelected(null);
    const p = boardPoint(e.clientX, e.clientY);
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

  function handleMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool === "solid" && dragStart.current) {
      // podgląd bryły w trakcie przeciągania
      const box = solidBox(dragStart.current, boardPoint(e.clientX, e.clientY));
      redraw({ kind: "solid", solid, ...box, color, width: Math.max(1.5, width * 0.6) });
      return;
    }
    const stroke = drawing.current;
    if (!stroke || stroke.kind !== "stroke") return;
    stroke.points.push(boardPoint(e.clientX, e.clientY));
    // dorysowujemy tylko ostatni odcinek – płynniej niż przerysowanie całości
    drawItem(e.currentTarget.getContext("2d")!, { ...stroke, points: stroke.points.slice(-2) }, isDark);
  }

  function handleUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool === "solid" && dragStart.current) {
      const box = solidBox(dragStart.current, boardPoint(e.clientX, e.clientY));
      dragStart.current = null;
      onChange([...items, { kind: "solid", solid, ...box, color, width: Math.max(1.5, width * 0.6) }]);
      return;
    }
    if (!drawing.current) return;
    onChange([...items, drawing.current]);
    drawing.current = null;
  }

  // ── Wzory: przeciąganie z paska na kartkę ──

  function chipDown(e: ReactPointerEvent<HTMLButtonElement>, tex: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setChipDrag({ tex, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, dragging: false });
  }

  function chipMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!chipDrag) return;
    const dragging = chipDrag.dragging || Math.hypot(e.clientX - chipDrag.startX, e.clientY - chipDrag.startY) > DRAG_THRESHOLD;
    setChipDrag({ ...chipDrag, x: e.clientX, y: e.clientY, dragging });
  }

  function chipUp(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!chipDrag) return;
    if (!chipDrag.dragging) addFormula(chipDrag.tex); // stuknięcie – wstaw na środek
    else if (insideBoard(e.clientX, e.clientY)) {
      const [x, y] = boardPoint(e.clientX, e.clientY);
      addFormula(chipDrag.tex, [x - 24, y - 16]);
    }
    setChipDrag(null);
  }

  // ── Wzory na kartce: przesuwanie, zaznaczanie, usuwanie ──

  function itemDown(e: ReactPointerEvent<HTMLDivElement>, index: number) {
    const item = items[index];
    if (item.kind !== "formula") return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const [px, py] = boardPoint(e.clientX, e.clientY);
    setMove({ index, offsetX: px - item.x, offsetY: py - item.y, x: item.x, y: item.y, moved: false });
  }

  function itemMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!move) return;
    const [px, py] = boardPoint(e.clientX, e.clientY);
    const x = Math.max(0, Math.min(px - move.offsetX, size.width - 24));
    const y = Math.max(0, Math.min(py - move.offsetY, size.height - 24));
    setMove({ ...move, x, y, moved: move.moved || Math.hypot(x - move.x, y - move.y) > 2 });
  }

  function itemUp() {
    if (!move) return;
    if (move.moved) {
      onChange(items.map((item, i) => (i === move.index && item.kind === "formula" ? { ...item, x: move.x, y: move.y } : item)));
    } else {
      setSelected(selected === move.index ? null : move.index);
    }
    setMove(null);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setSelected(null);
  }

  // 44×44 – wygodne do trafienia palcem także na 320 px
  const toolButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors";
  const active = "bg-subtle text-ink ring-2 ring-brand";
  const previewSize = tool === "eraser" ? Math.min(width * ERASER_SCALE, 32) : width;

  return (
    <div
      className={
        full
          ? "fixed inset-0 z-50 flex animate-fade-in flex-col bg-card pt-[env(safe-area-inset-top)]"
          : "flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-card"
      }
    >
      <header className={`flex items-center justify-between gap-2 border-b border-line ${full ? "px-4 py-3 lg:px-8" : "px-3 py-2"}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className={`flex shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500 ${full ? "h-9 w-9" : "h-7 w-7"}`}>
            <Icon name="pencil" className="h-4 w-4" />
          </span>
          <h2 className={`truncate font-extrabold text-ink ${full ? "hidden sm:block" : "hidden text-sm min-[400px]:block"}`}>Brudnopis</h2>
        </div>
        <div className="flex gap-0.5 rounded-xl bg-subtle p-0.5" role="radiogroup" aria-label="Tło kartki">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={template === t.id}
              aria-label={t.label}
              onClick={() => onTemplateChange(t.id)}
              title={t.label}
              className={`flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold transition-colors ${
                template === t.id ? "bg-card text-ink shadow-card" : "text-muted"
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {full && <span className="hidden md:inline">{t.label}</span>}
            </button>
          ))}
        </div>
        {full ? (
          <button onClick={props.onClose} className="min-h-11 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white shadow-float active:bg-brand-dark">
            Gotowe
          </button>
        ) : (
          <button onClick={props.onExpand} aria-label="Brudnopis na pełny ekran" title="Pełny ekran" className={`${toolButton} text-muted hover:bg-subtle hover:text-ink`}>
            <Icon name="expand" className="h-4 w-4" />
          </button>
        )}
      </header>

      {full && props.prompt && (
        <div className="border-b border-line bg-surface px-4 py-3 text-sm font-semibold text-body lg:px-8">
          <div className="mx-auto max-w-3xl">
            <MathText text={props.prompt} />
          </div>
        </div>
      )}

      {formulasOpen && formulas.length > 0 && (
        <div className="border-b border-line bg-surface">
          <p className="px-3 pt-2 text-[11px] font-bold text-faint">Przeciągnij wzór na kartkę albo stuknij, żeby go wstawić</p>
          <div className="flex gap-2 overflow-x-auto px-3 py-2">
            {formulas.map((f) => (
              <button
                key={f.label}
                onPointerDown={(e) => chipDown(e, f.tex)}
                onPointerMove={chipMove}
                onPointerUp={chipUp}
                onPointerCancel={() => setChipDrag(null)}
                title={f.label}
                // pan-x: przewijanie paska w poziomie zostaje przeglądarce, ruch w dół (na kartkę) to przeciąganie
                className="shrink-0 cursor-grab touch-pan-x rounded-xl border border-line bg-card px-3 py-1.5 text-left select-none active:cursor-grabbing"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wide text-faint">{f.label}</span>
                <span className="pointer-events-none block text-sm whitespace-nowrap text-ink">
                  <MathText text={`$${f.tex}$`} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={boardRef} className={`relative overflow-hidden ${full ? "flex-1" : "h-80 lg:h-[26rem]"}`}>
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

        {items.map((item, index) => {
          if (item.kind !== "formula") return null;
          const moving = move?.index === index;
          return (
            <div
              key={index}
              onPointerDown={(e) => itemDown(e, index)}
              onPointerMove={itemMove}
              onPointerUp={itemUp}
              onPointerCancel={() => setMove(null)}
              style={{ left: moving ? move.x : item.x, top: moving ? move.y : item.y }}
              className={`absolute cursor-move touch-none rounded-lg px-1.5 py-0.5 text-lg text-ink select-none ${
                selected === index || moving ? "bg-brand-soft/80 ring-2 ring-brand" : "hover:ring-1 hover:ring-brand/40"
              }`}
            >
              <MathText text={`$${item.tex}$`} className="pointer-events-none whitespace-nowrap" />
              {selected === index && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeItem(index)}
                  aria-label="Usuń z kartki"
                  className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-card"
                >
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {(tool === "angle" || tool === "solid") && (
          <p className="pointer-events-none absolute top-2 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold text-white shadow-card">
            {tool === "angle"
              ? `Kąt ${angleLabel}: dotknij – ${ANGLE_STEPS[anglePoints.length]} (${anglePoints.length + 1}/3)`
              : "Przeciągnij, aby wstawić bryłę, albo dotknij"}
          </p>
        )}

        {calcOpen && (
          <div className="absolute right-2 bottom-2 z-10 max-h-[calc(100%-1rem)] overflow-y-auto">
            <Calculator onInsert={(value) => addFormula(value.replace(",", "{,}"))} onClose={() => setCalcOpen(false)} />
          </div>
        )}
      </div>

      <footer className={`border-t border-line bg-card ${full ? "px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-8" : "px-2 py-2"}`}>
        <div className={`mx-auto flex flex-col gap-2 ${full ? "max-w-5xl lg:flex-row lg:items-center lg:justify-between" : ""}`}>
          {/* jeden zawijany rząd: narzędzia od lewej, cofnij/wyczyść dosunięte do prawej – bez pustych miejsc na wąskim ekranie */}
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="contents">
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
                  <span className="h-4 w-4 rounded-full border border-line" style={{ background: colorOf(c, isDark) }} />
                </button>
              ))}
              <span className="mx-0.5 h-6 w-px shrink-0 bg-line" aria-hidden />
              <ToolButton icon="pencil" label="Długopis" selected={tool === "pen"} onClick={() => selectTool("pen")} />
              <ToolButton icon="eraser" label="Gumka" selected={tool === "eraser"} onClick={() => selectTool("eraser")} />
              <ToolButton icon="shapes" label="Bryły 3D" selected={tool === "solid"} onClick={() => selectTool("solid")} />
              <ToolButton icon="angle" label="Kąt" selected={tool === "angle"} onClick={() => selectTool("angle")} />
              <span className="mx-0.5 h-6 w-px shrink-0 bg-line" aria-hidden />
              {formulas.length > 0 && (
                <ToolButton icon="book" label="Wzory do przeciągnięcia" selected={formulasOpen} onClick={() => setFormulasOpen(!formulasOpen)} />
              )}
              <ToolButton icon="calculator" label="Kalkulator" selected={calcOpen} onClick={() => setCalcOpen(!calcOpen)} />
            </div>
            <div className={`ml-auto flex shrink-0 items-center gap-0.5 text-muted ${full ? "lg:hidden" : ""}`}>
              <UndoClear items={items} onChange={onChange} className={toolButton} />
            </div>
          </div>

          {/* Opcje wybranego narzędzia */}
          <div className={`flex min-h-9 items-center gap-2 ${full ? "lg:flex-1 lg:justify-center" : ""}`}>
            {(tool === "pen" || tool === "eraser") && (
              <label className="flex w-full max-w-xs items-center gap-2 px-1">
                <span className="text-xs font-bold text-muted">Grubość</span>
                <input
                  type="range"
                  min={1}
                  max={14}
                  step={0.5}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="h-11 min-w-0 flex-1 accent-brand"
                />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center" aria-hidden>
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
                    className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
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

          {full && (
            <div className="hidden items-center gap-1 text-muted lg:flex">
              <UndoClear items={items} onChange={onChange} className={toolButton} />
            </div>
          )}
        </div>
      </footer>

      {/* Wzór ciągnięty z paska – podąża za palcem / kursorem */}
      {chipDrag?.dragging && (
        <div
          className="pointer-events-none fixed z-[60] rounded-lg bg-card/95 px-2 py-1 text-lg text-ink shadow-2xl ring-2 ring-brand"
          style={{ left: chipDrag.x - 24, top: chipDrag.y - 16 }}
        >
          <MathText text={`$${chipDrag.tex}$`} className="whitespace-nowrap" />
        </div>
      )}
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
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
        selected ? "bg-subtle text-ink ring-2 ring-brand" : "text-muted hover:bg-subtle"
      }`}
    >
      <Icon name={icon} className="h-[18px] w-[18px]" />
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
        <Icon name="undo" className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={() => onChange([])}
        disabled={items.length === 0}
        aria-label="Wyczyść wszystko"
        className={`${className} hover:bg-subtle hover:text-rose-500 disabled:opacity-30`}
      >
        <Icon name="trash" className="h-[18px] w-[18px]" />
      </button>
    </>
  );
}
