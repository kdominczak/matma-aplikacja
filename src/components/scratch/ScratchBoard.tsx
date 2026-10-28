"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import dynamic from "next/dynamic";
import ScratchBackground, { type ScratchTemplate } from "@/components/scratch/ScratchBackground";
import { armsAt, buildScene, edgeSegment, heightLine, lineEnds, removeLineFrom, removeShapeFrom, sameEdge, sceneSnapTargets, type Scene } from "@/components/scratch/scene";
import {
  colorOf,
  drawAnglePreview,
  drawEdgeHighlight,
  drawItem,
  drawLinePreview,
  drawSelection,
  drawSnapIndicator,
  drawStrokeTail,
  PALETTE,
  markLabelPosition,
  shapeFromDrag,
  type DrawContext,
} from "@/components/scratch/scratch-draw";
import Icon, { type IconName } from "@/components/ui/Icon";
import MathText from "@/components/ui/MathText";
import { armPairs, samePair, sectorFor } from "@/lib/geometry/arms";
import { hitShape, nearestVertex } from "@/lib/geometry/hit";
import { heightVertex, labelToTex } from "@/lib/geometry/marks";
import { freshLabels, isSolid, PLANE_SHAPES, SHAPES, shapeEdges, shapeOutline, shapeVertices, solidModel, SOLID_SHAPES, vertexNeighbors, type ShapeKind } from "@/lib/geometry/shapes";
import { boxCorners, moveShape, rotateShape, rotationFromHandle, rotationHandle, scaleShapeTo } from "@/lib/geometry/transform";
import { nearestSnap, type SnapTarget } from "@/lib/geometry/snap";
import { distance, distanceToSegment, sub, type Vec } from "@/lib/geometry/vec";
import { scratchId } from "@/lib/scratch-notes";
import { useTheme } from "@/lib/theme";
import type { AngleItem, EdgeRef, LineItem, MarkItem, PenColor, ScratchItem, ShapeItem, StrokeItem } from "@/types/scratch";
import type { FormulaGroup } from "@/types/topic";

// kalkulator doczytuje się dopiero po otwarciu
const Calculator = dynamic(() => import("@/components/scratch/Calculator"), { ssr: false });

export type { ScratchItem } from "@/types/scratch";
export type { ScratchTemplate } from "@/components/scratch/ScratchBackground";

type Tool = "pen" | "eraser" | "line" | "shape" | "angle" | "mark" | "select";

const TEMPLATES: { id: ScratchTemplate; label: string; icon: IconName }[] = [
  { id: "grid", label: "Kratka", icon: "grid" },
  { id: "blank", label: "Czysta", icon: "square" },
  { id: "axes", label: "Układ XY", icon: "axes" },
  { id: "numberline", label: "Oś liczbowa", icon: "ruler" },
];

const ANGLE_LABELS = ["α", "β", "γ", "δ"];
const ANGLE_STEPS = ["punkt na pierwszym ramieniu", "wierzchołek kąta", "punkt na drugim ramieniu"];
const ERASER_SCALE = 5;
/** Progi w pikselach – przeliczane na jednostki kartki według jej szerokości. */
const DRAG_THRESHOLD = 6;
const SNAP_RADIUS = 18;
const HIT_TOLERANCE = 12;
const MIN_DRAG = 24;
const ROTATE_HANDLE_OFFSET = 34;
const DUPLICATE_SHIFT = 0.04;
const MIN_LINE = 10;
/** Szuflada pełnego ekranu: wysokość jako część ekranu, zapamiętana na urządzeniu. */
const SHEET_MIN = 0.35;
const SHEET_KEY = "scratch.sheetHeight";

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

/** Wzór „w locie” – ciągnięty z paska wzorów nad kartkę (px ekranu). */
type ChipDrag = { tex: string; startX: number; startY: number; x: number; y: number; dragging: boolean };
/** Przesuwanie wzoru, który już leży na kartce (jednostki kartki). */
type FormulaMove = { id: string; offset: Vec; at: Vec; moved: boolean };

/** Trwający gest na kartce (rysowanie, nowa figura, przesuwanie/skalowanie/obrót zaznaczonej). */
type Gesture =
  | { kind: "stroke"; item: StrokeItem }
  | { kind: "line"; id: string; from: SnapTarget | null; start: Vec }
  | { kind: "angle-vertex"; shapeId: string; vertex: number; start: Vec }
  | { kind: "new-shape"; from: Vec; id: string }
  | { kind: "move"; base: ShapeItem; start: Vec; moved: boolean }
  | { kind: "scale"; base: ShapeItem }
  | { kind: "rotate"; base: ShapeItem };

/**
 * Historia zmian (cofnij / ponów). Zmiana notatek z zewnątrz (np. inne zadanie) czyści historię –
 * wykrywamy ją, porównując notatki z ostatnim stanem zapisanym przez brudnopis.
 */
function useHistory(items: ScratchItem[], onChange: (items: ScratchItem[]) => void) {
  const [stacks, setStacks] = useState<{ past: ScratchItem[][]; future: ScratchItem[][]; current: ScratchItem[] }>({ past: [], future: [], current: items });
  if (stacks.current !== items) setStacks({ past: [], future: [], current: items });

  return {
    commit(next: ScratchItem[]) {
      setStacks({ past: [...stacks.past, items].slice(-100), future: [], current: next });
      onChange(next);
    },
    undo() {
      const previous = stacks.past.at(-1);
      if (!previous) return;
      setStacks({ past: stacks.past.slice(0, -1), future: [items, ...stacks.future], current: previous });
      onChange(previous);
    },
    redo() {
      const [next, ...rest] = stacks.future;
      if (!next) return;
      setStacks({ past: [...stacks.past, items], future: rest, current: next });
      onChange(next);
    },
    canUndo: stacks.past.length > 0,
    canRedo: stacks.future.length > 0,
  };
}

export default function ScratchBoard(props: Props) {
  const { variant, items, onChange, template, onTemplateChange, formulaGroups } = props;
  const full = variant === "full";
  const history = useHistory(items, onChange);

  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<PenColor>("ink");
  const [width, setWidth] = useState(3);
  const [shapeTab, setShapeTab] = useState<"plane" | "solid">("plane");
  const [shapeKind, setShapeKind] = useState<ShapeKind>("triangle");
  const [angleLabel, setAngleLabel] = useState(ANGLE_LABELS[0]);
  const [anglePoints, setAnglePoints] = useState<Vec[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [formulasOpen, setFormulasOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [chipDrag, setChipDrag] = useState<ChipDrag | null>(null);
  const [formulaMove, setFormulaMove] = useState<FormulaMove | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  /** Podgląd figury w trakcie gestu (przesuwanie, skalowanie, obrót, wstawianie) – zapis do historii po puszczeniu. */
  const [draft, setDraft] = useState<ShapeItem | null>(null);
  /** Który uchwyt jest ciągnięty – do podpowiedzi z kątem obrotu. */
  const [handleKind, setHandleKind] = useState<"scale" | "rotate" | null>(null);
  /** Punkt magnesu pod palcem/kursorem (podświetlenie) i rysowana linia. */
  const [snap, setSnap] = useState<SnapTarget | null>(null);
  const [linePreview, setLinePreview] = useState<{ from: Vec; to: Vec } | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  /** Bok wybrany narzędziem „Oznacz”. */
  const [selectedEdge, setSelectedEdge] = useState<EdgeRef | null>(null);
  const [sheet, setSheet] = useState(() => {
    try {
      return Math.min(1, Math.max(SHEET_MIN, Number(localStorage.getItem(SHEET_KEY)) || 1));
    } catch {
      return 1;
    }
  });
  const sheetDrag = useRef<{ startY: number; start: number } | null>(null);
  const { isDark } = useTheme();

  const formulas = formulaGroups.flatMap((g) => g.formulas);
  const W = size.width || 1;
  const units = (p: Vec): Vec => [p[0] / W, p[1] / W];
  const pixels = (p: Vec): Vec => [p[0] * W, p[1] * W];

  /** Scena z uwzględnieniem podglądu – kąty i przypięte linie jadą razem z przesuwaną figurą. */
  const scene = useMemo(() => buildScene(items, draft), [items, draft]);
  const shapes = scene.shapes;
  const selected = selectedShape ? (shapes.get(selectedShape) ?? null) : null;
  const targets = useMemo(() => sceneSnapTargets(scene), [scene]);

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.clientWidth;
    const dc: DrawContext = { isDark, width: w, scene };
    const accent = colorOf("blue", isDark);
    // kolejność warstw: pismo odręczne (z gumką) pod spodem, figury, linie i kąty nad nim – gumka nie ściera figur
    for (const item of items) if (item.kind === "stroke") drawItem(ctx, item, dc);
    for (const shape of shapes.values()) drawItem(ctx, shape, dc);
    for (const line of scene.lines.values()) drawItem(ctx, line, dc);
    for (const item of items) if (item.kind === "mark") drawItem(ctx, item, dc);
    for (const item of items) if (item.kind === "angle") drawItem(ctx, item, dc);
    const edge = tool === "mark" && selectedEdge ? edgeSegment(selectedEdge, scene) : null;
    if (edge) drawEdgeHighlight(ctx, [edge.a[0] * w, edge.a[1] * w], [edge.b[0] * w, edge.b[1] * w], accent);
    if (selected && tool === "select") drawSelection(ctx, selected, w, accent);
    const line = selectedLine ? scene.lines.get(selectedLine) : null;
    if (line && tool === "select") {
      const ends = lineEnds(line, scene);
      drawLinePreview(ctx, [ends.from[0] * w, ends.from[1] * w], [ends.to[0] * w, ends.to[1] * w], accent, line.width + 4);
    }
    if (linePreview) drawLinePreview(ctx, [linePreview.from[0] * w, linePreview.from[1] * w], [linePreview.to[0] * w, linePreview.to[1] * w], colorOf(color, isDark), Math.max(1.5, width * 0.6));
    if (anglePoints.length > 0) drawAnglePreview(ctx, anglePoints.map((p) => [p[0] * w, p[1] * w]), colorOf(color, isDark));
    if (snap) drawSnapIndicator(ctx, snap, w, accent);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redraw czyta aktualny stan kartki
  }, [items, isDark, anglePoints, scene, selected, selectedLine, selectedEdge, tool, snap, linePreview]);

  /** Punkt ekranu → piksele kartki. */
  function boardPoint(clientX: number, clientY: number): Vec {
    const rect = boardRef.current!.getBoundingClientRect();
    return [clientX - rect.left, clientY - rect.top];
  }

  function insideBoard(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    return Boolean(rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom);
  }

  function usedLabels(): Set<string> {
    return new Set(items.flatMap((i) => (i.kind === "shape" ? i.labels : [])));
  }

  function addFormula(tex: string, at?: Vec) {
    // bez punktu (stuknięcie w pasek / wynik kalkulatora) – w okolice środka, lekko przesunięte, żeby się nie nakładały
    const shift = (items.filter((i) => i.kind === "formula").length % 5) * 18;
    const [x, y] = at ?? [Math.max(8, size.width / 2 - 60 + shift), Math.max(8, size.height / 3 + shift)];
    history.commit([...items, { id: scratchId(), kind: "formula", tex, at: units([Math.max(0, x), Math.max(0, y)]) }]);
  }

  function selectTool(next: Tool) {
    setTool(next);
    setAnglePoints([]);
    setSelectedFormula(null);
    setSnap(null);
    setSelectedEdge(null);
    if (next !== "select") {
      setSelectedShape(null);
      setSelectedLine(null);
    }
  }

  /** Magnes: najlepszy punkt w zasięgu palca (tylko dla linii i kątów). */
  function snapAt(u: Vec): SnapTarget | null {
    return nearestSnap(u, targets, SNAP_RADIUS / W);
  }

  /** Podświetlenie magnesu przy ruchu kursora bez naciskania (myszka) – tylko gdy zmienia się punkt. */
  function hover(u: Vec) {
    if (tool !== "line" && tool !== "angle") return;
    const next = snapAt(u);
    if (next?.point[0] !== snap?.point[0] || next?.point[1] !== snap?.point[1]) setSnap(next);
  }

  function replaceShape(next: ShapeItem) {
    history.commit(items.map((i) => (i.id === next.id ? next : i)));
  }

  function removeShape(id: string) {
    // razem z figurą znikają przypięte do niej kąty; przypięte linie zostają w miejscu
    history.commit(removeShapeFrom(items, id, scene));
    setSelectedShape(null);
  }

  function duplicateShape(shape: ShapeItem) {
    const copy: ShapeItem = {
      ...shape,
      id: scratchId(),
      center: [shape.center[0] + DUPLICATE_SHIFT, shape.center[1] + DUPLICATE_SHIFT],
      labels: freshLabels(shape.shape, usedLabels()),
    };
    history.commit([...items, copy]);
    setSelectedShape(copy.id);
  }

  /** Oznaczenie boku: jedno na bok; puste (bez długości, znaczników i środka) – usuwamy. */
  function upsertMark(target: EdgeRef, patch: Partial<Pick<MarkItem, "label" | "ticks" | "midpoint">>) {
    const existing = items.find((i): i is MarkItem => i.kind === "mark" && sameEdge(i.target, target));
    const next: MarkItem = { id: existing?.id ?? scratchId(), kind: "mark", target, label: "", ticks: 0, midpoint: false, color, ...existing, ...patch };
    const empty = !next.label.trim() && next.ticks === 0 && !next.midpoint;
    if (empty) history.commit(items.filter((i) => i.id !== next.id));
    else history.commit(existing ? items.map((i) => (i.id === next.id ? next : i)) : [...items, next]);
  }

  /** Wysokość na bok – raz na bok (ponowne stuknięcie nie dubluje). */
  function addHeight(shapeId: string, edge: number) {
    const exists = items.some((i) => i.kind === "line" && i.toRef && "foot" in i.toRef && i.toRef.shapeId === shapeId && i.toRef.foot[1] === edge);
    const height = heightLine(shapeId, edge, scene);
    if (exists || !height) return;
    history.commit([...items, { id: scratchId(), kind: "line", ...height, color, width: Math.max(1.5, width * 0.6) }]);
  }

  function nextAngleLabel() {
    setAngleLabel(ANGLE_LABELS[(ANGLE_LABELS.indexOf(angleLabel) + 1) % ANGLE_LABELS.length]);
  }

  /**
   * Kąt w wierzchołku figury. Przeciągnięcie (`toward`) – kąt w klinie, w który wskazuje palec.
   * Stuknięcie – nowy kąt wewnętrzny, a jeśli w tym wierzchołku już jest kąt: kolejna para ramion
   * (gdy z wierzchołka wychodzą też przekątne, wysokości…).
   */
  function placeAngle(shapeId: string, vertex: number, toward: Vec | null) {
    const shape = shapes.get(shapeId);
    if (!shape) return;
    const point = shapeVertices(shape)[vertex];
    const arms = armsAt(shapeId, vertex, scene);
    const here = items.filter((i): i is AngleItem => i.kind === "angle" && "shapeId" in i.anchor && i.anchor.shapeId === shapeId && i.anchor.vertex === vertex);
    // kąt bez wybranych ramion = kąt domyślny (dwie pierwsze krawędzie z wierzchołka – w wielokącie sąsiednie boki)
    const [first, second] = vertexNeighbors(shape, vertex);
    const pairOf = (a: AngleItem): [string, string] => ("arms" in a.anchor && a.anchor.arms ? a.anchor.arms : [`v:${first}`, `v:${second}`]);
    const create = (pair?: [string, string]) => {
      history.commit([...items, { id: scratchId(), kind: "angle", anchor: { shapeId, vertex, ...(pair ? { arms: pair } : {}) }, label: angleLabel, color }]);
      nextAngleLabel();
    };

    if (toward) {
      const sector = sectorFor(point, arms, toward);
      if (!sector) return;
      const pair: [string, string] = [sector[0].id, sector[1].id];
      if (here.some((a) => samePair(pairOf(a), pair))) return; // taki kąt już jest
      create(pair);
      return;
    }
    const last = here.at(-1);
    if (!last) {
      create();
      return;
    }
    const pairs = armPairs(point, arms).map((p): [string, string] => [p[0].id, p[1].id]);
    if (pairs.length < 2) return;
    const index = pairs.findIndex((p) => samePair(p, pairOf(last)));
    const next = pairs[(index + 1) % pairs.length];
    history.commit(items.map((i) => (i.id === last.id && i.kind === "angle" && "shapeId" in i.anchor ? { ...i, anchor: { ...i.anchor, arms: next } } : i)));
  }

  // ── Kartka: rysowanie, figury, kąty, zaznaczanie ──

  function handleDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    setSelectedFormula(null);
    const p = boardPoint(e.clientX, e.clientY);
    const u = units(p);
    const topShapes = [...shapes.values()].reverse();

    if (tool === "angle") {
      if (anglePoints.length === 0) {
        // wierzchołek figury: stuknięcie – kąt (albo kolejna para ramion), przeciągnięcie – kąt we wskazanym klinie
        for (const shape of topShapes) {
          const vertex = nearestVertex(shape, u, SNAP_RADIUS / W);
          if (vertex === null) continue;
          e.currentTarget.setPointerCapture(e.pointerId);
          gesture.current = { kind: "angle-vertex", shapeId: shape.id, vertex, start: u };
          return;
        }
      }
      // kąt swobodny: punkty z magnesem
      const next = [...anglePoints, snapAt(u)?.point ?? u];
      if (next.length < 3) {
        setAnglePoints(next);
        return;
      }
      const angle: AngleItem = { id: scratchId(), kind: "angle", anchor: { points: [next[0], next[1], next[2]] }, label: angleLabel, color };
      history.commit([...items, angle]);
      setAnglePoints([]);
      nextAngleLabel();
      return;
    }

    if (tool === "mark") {
      setSelectedEdge(nearestEdge(u, scene, HIT_TOLERANCE / W));
      return;
    }

    if (tool === "select") {
      // linie mają pierwszeństwo – leżą na figurach i trudniej je trafić
      const lineHit = [...scene.lines.values()].reverse().find((l) => {
        const ends = lineEnds(l, scene);
        return distanceToSegment(u, ends.from, ends.to) <= HIT_TOLERANCE / W;
      });
      setSelectedLine(lineHit?.id ?? null);
      if (lineHit) {
        setSelectedShape(null);
        return;
      }
      const hit = topShapes.find((s) => hitShape(s, u, HIT_TOLERANCE / W));
      setSelectedShape(hit?.id ?? null);
      if (hit) {
        e.currentTarget.setPointerCapture(e.pointerId);
        gesture.current = { kind: "move", base: hit, start: u, moved: false };
      }
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    if (tool === "shape") {
      gesture.current = { kind: "new-shape", from: u, id: scratchId() };
      return;
    }
    if (tool === "line") {
      const from = snapAt(u);
      gesture.current = { kind: "line", id: scratchId(), from, start: from?.point ?? u };
      setSnap(from);
      return;
    }
    const erase = tool === "eraser";
    const stroke: StrokeItem = { id: scratchId(), kind: "stroke", points: [u], color, width: erase ? width * ERASER_SCALE : width, erase };
    gesture.current = { kind: "stroke", item: stroke };
    drawItem(e.currentTarget.getContext("2d")!, stroke, { isDark, width: W, scene });
  }

  function newShape(id: string, from: Vec, to: Vec): ShapeItem {
    const box = shapeFromDrag(shapeKind, from, to, MIN_DRAG / W);
    return {
      id,
      kind: "shape",
      shape: shapeKind,
      ...box,
      rotation: 0,
      color,
      width: Math.max(1.5, width * 0.6),
      labels: freshLabels(shapeKind, usedLabels()),
      showLabels: true,
    };
  }

  function handleMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    const p = boardPoint(e.clientX, e.clientY);
    const u = units(p);
    if (!g) {
      hover(u);
      return;
    }
    if (g.kind === "line") {
      const to = snapAt(u);
      setSnap(to);
      setLinePreview({ from: g.start, to: to?.point ?? u });
      return;
    }
    if (g.kind === "stroke") {
      const last = g.item.points.at(-1)!;
      g.item.points.push(u);
      // dorysowujemy tylko ostatni odcinek – płynniej niż przerysowanie całości
      drawStrokeTail(e.currentTarget.getContext("2d")!, pixels(last), p, colorOf(color, isDark), g.item.width, g.item.erase);
    } else if (g.kind === "new-shape") {
      setDraft(newShape(g.id, g.from, u));
    } else if (g.kind === "move") {
      g.moved ||= distance(pixels(g.start), p) > DRAG_THRESHOLD;
      if (g.moved) setDraft(moveShape(g.base, sub(u, g.start)));
    }
  }

  function handleUp(e: ReactPointerEvent<HTMLCanvasElement>) {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const u = units(boardPoint(e.clientX, e.clientY));
    if (g.kind === "line") {
      const to = snapAt(u);
      const end = to?.point ?? u;
      setLinePreview(null);
      setSnap(null);
      if (distance(pixels(g.start), pixels(end)) < MIN_LINE) return;
      const line: LineItem = {
        id: g.id,
        kind: "line",
        from: g.start,
        to: end,
        fromRef: g.from?.ref,
        toRef: to?.ref,
        color,
        width: Math.max(1.5, width * 0.6),
      };
      history.commit([...items, line]);
      return;
    }
    if (g.kind === "angle-vertex") {
      placeAngle(g.shapeId, g.vertex, distance(pixels(g.start), pixels(u)) > DRAG_THRESHOLD ? u : null);
      return;
    }
    if (g.kind === "stroke") {
      history.commit([...items, g.item]);
    } else if (g.kind === "new-shape") {
      const shape = newShape(g.id, g.from, units(boardPoint(e.clientX, e.clientY)));
      history.commit([...items, shape]);
      // po wstawieniu od razu zaznaczona – można ją przesunąć, przeskalować, obrócić
      setTool("select");
      setSelectedShape(shape.id);
    } else if (g.kind === "move" && g.moved && draft) {
      replaceShape(draft);
    }
    setDraft(null);
  }

  // ── Uchwyty zaznaczonej figury: narożniki (skalowanie) i uchwyt obrotu ──

  function grabHandle(e: ReactPointerEvent<HTMLDivElement>, kind: "scale" | "rotate") {
    if (!selected) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { kind, base: selected };
    setHandleKind(kind);
  }

  function handleDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    if (!g || (g.kind !== "scale" && g.kind !== "rotate")) return;
    const u = units(boardPoint(e.clientX, e.clientY));
    setDraft(g.kind === "scale" ? scaleShapeTo(g.base, u) : rotateShape(g.base, rotationFromHandle(g.base.center, u)));
  }

  function handleRelease() {
    const g = gesture.current;
    gesture.current = null;
    if (g && (g.kind === "scale" || g.kind === "rotate") && draft) replaceShape(draft);
    setDraft(null);
    setHandleKind(null);
  }

  // ── Szuflada pełnego ekranu: pasek u góry zmienia wysokość brudnopisu ──

  function saveSheet(value: number) {
    try {
      localStorage.setItem(SHEET_KEY, String(value));
    } catch {
      // brak dostępu do storage – wysokość obowiązuje do zamknięcia brudnopisu
    }
  }

  function clampSheet(value: number) {
    // przy samej górze dosuwamy do pełnego ekranu – łatwo go trafić palcem
    const clamped = Math.min(1, Math.max(SHEET_MIN, value));
    return clamped > 0.96 ? 1 : clamped;
  }

  function sheetDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    sheetDrag.current = { startY: e.clientY, start: sheet };
  }

  function sheetMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = sheetDrag.current;
    if (!drag) return;
    setSheet(clampSheet(drag.start - (e.clientY - drag.startY) / window.innerHeight));
  }

  function sheetUp() {
    if (!sheetDrag.current) return;
    sheetDrag.current = null;
    saveSheet(sheet);
  }

  function setSheetTo(value: number) {
    const next = clampSheet(value);
    setSheet(next);
    saveSheet(next);
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

  function formulaDown(e: ReactPointerEvent<HTMLDivElement>, id: string, at: Vec) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const u = units(boardPoint(e.clientX, e.clientY));
    setFormulaMove({ id, offset: sub(u, at), at, moved: false });
  }

  function formulaDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (!formulaMove) return;
    const u = units(boardPoint(e.clientX, e.clientY));
    const at: Vec = [Math.max(0, Math.min(u[0] - formulaMove.offset[0], (size.width - 24) / W)), Math.max(0, Math.min(u[1] - formulaMove.offset[1], (size.height - 24) / W))];
    setFormulaMove({ ...formulaMove, at, moved: formulaMove.moved || distance(pixels(at), pixels(formulaMove.at)) > 2 });
  }

  function formulaUp() {
    if (!formulaMove) return;
    if (formulaMove.moved) history.commit(items.map((i) => (i.id === formulaMove.id && i.kind === "formula" ? { ...i, at: formulaMove.at } : i)));
    else setSelectedFormula(selectedFormula === formulaMove.id ? null : formulaMove.id);
    setFormulaMove(null);
  }

  // 44×44 – wygodne do trafienia palcem także na 320 px
  const toolButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors";
  const active = "bg-subtle text-ink ring-2 ring-brand";
  const previewSize = tool === "eraser" ? Math.min(width * ERASER_SCALE, 32) : width;
  const handles = tool === "select" && selected ? boxCorners(selected).map(pixels) : [];
  const rotateAt = tool === "select" && selected && !isSolid(selected.shape) ? pixels(rotationHandle(selected, ROTATE_HANDLE_OFFSET / W)) : null;
  const hint =
    tool === "line"
      ? "Przeciągnij od punktu do punktu – końce przyciągają się do wierzchołków i środków"
      : tool === "angle"
      ? anglePoints.length === 0
        ? `Kąt ${angleLabel}: stuknij wierzchołek (ponownie – inne ramiona) albo przeciągnij w głąb kąta`
        : `Kąt ${angleLabel}: dotknij – ${ANGLE_STEPS[anglePoints.length]} (${anglePoints.length + 1}/3)`
      : tool === "shape"
        ? "Przeciągnij, aby narysować figurę, albo dotknij"
        : tool === "mark" && !selectedEdge
          ? "Stuknij bok figury, krawędź bryły albo linię, żeby ją oznaczyć"
          : tool === "select" && !selected && !selectedLine
          ? "Stuknij figurę albo linię, aby ją przesunąć, przeskalować, obrócić lub usunąć"
          : null;

  return (
    <div
      className={
        full
          ? `fixed inset-x-0 bottom-0 z-50 flex animate-fade-in flex-col bg-card shadow-2xl ${sheet < 1 ? "rounded-t-3xl border-t border-line" : "pt-[env(safe-area-inset-top)]"}`
          : "flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-card"
      }
      style={full ? { height: `${sheet * 100}dvh` } : undefined}
    >
      {full && (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Wysokość brudnopisu – przeciągnij albo użyj strzałek"
          aria-valuemin={Math.round(SHEET_MIN * 100)}
          aria-valuemax={100}
          aria-valuenow={Math.round(sheet * 100)}
          tabIndex={0}
          onPointerDown={sheetDown}
          onPointerMove={sheetMove}
          onPointerUp={sheetUp}
          onPointerCancel={sheetUp}
          // podwójne stuknięcie: pół ekranu ↔ pełny ekran
          onDoubleClick={() => setSheetTo(sheet < 0.9 ? 1 : 0.55)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") setSheetTo(sheet + 0.05);
            if (e.key === "ArrowDown") setSheetTo(sheet - 0.05);
            if (e.key === "Home") setSheetTo(1);
            if (e.key === "End") setSheetTo(SHEET_MIN);
          }}
          className="group flex h-7 shrink-0 cursor-row-resize touch-none items-center justify-center focus-visible:outline-none"
        >
          <span className="h-1.5 w-12 rounded-full bg-line transition-colors group-hover:bg-faint group-focus-visible:bg-brand group-active:bg-brand" />
        </div>
      )}
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

      {full && props.prompt && sheet >= 0.85 && (
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
          onPointerLeave={() => !gesture.current && setSnap(null)}
          className={`absolute inset-0 h-full w-full touch-none ${tool === "eraser" ? "cursor-cell" : tool === "select" ? "cursor-default" : "cursor-crosshair"}`}
          aria-label="Pole do rysowania"
        />

        {items.map((item) => {
          if (item.kind !== "formula") return null;
          const moving = formulaMove?.id === item.id;
          const [x, y] = pixels(moving ? formulaMove.at : item.at);
          return (
            <div
              key={item.id}
              onPointerDown={(e) => formulaDown(e, item.id, item.at)}
              onPointerMove={formulaDrag}
              onPointerUp={formulaUp}
              onPointerCancel={() => setFormulaMove(null)}
              style={{ left: x, top: y }}
              className={`absolute cursor-move touch-none rounded-lg px-1.5 py-0.5 text-lg text-ink select-none ${
                selectedFormula === item.id || moving ? "bg-brand-soft/80 ring-2 ring-brand" : "hover:ring-1 hover:ring-brand/40"
              }`}
            >
              <MathText text={`$${item.tex}$`} className="pointer-events-none whitespace-nowrap" />
              {selectedFormula === item.id && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    history.commit(items.filter((i) => i.id !== item.id));
                    setSelectedFormula(null);
                  }}
                  aria-label="Usuń z kartki"
                  className="absolute -top-3 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-card"
                >
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* podpisy długości boków – KaTeX nad canvasem, na zewnątrz boku */}
        {items.map((item) => {
          if (item.kind !== "mark" || !item.label) return null;
          const segment = edgeSegment(item.target, scene);
          if (!segment) return null;
          const [x, y] = markLabelPosition(segment, W);
          return (
            <span
              key={item.id}
              style={{ left: x, top: y, color: colorOf(item.color, isDark) }}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-base whitespace-nowrap"
            >
              <MathText text={`$${labelToTex(item.label)}$`} />
            </span>
          );
        })}

        {/* uchwyty zaznaczonej figury: narożniki – skalowanie, kółko nad figurą – obrót co 15° */}
        {handles.map(([x, y], i) => (
          <div
            key={i}
            role="slider"
            aria-label="Zmień rozmiar figury"
            aria-valuenow={Math.round((selected?.size[0] ?? 0) * 100)}
            onPointerDown={(e) => grabHandle(e, "scale")}
            onPointerMove={handleDrag}
            onPointerUp={handleRelease}
            onPointerCancel={handleRelease}
            style={{ left: x - 14, top: y - 14 }}
            className="absolute z-10 flex h-7 w-7 cursor-nwse-resize touch-none items-center justify-center"
          >
            <span className="h-3.5 w-3.5 rounded-sm border-2 border-brand bg-card shadow-card" />
          </div>
        ))}
        {rotateAt && selected && (
          <div
            role="slider"
            aria-label="Obróć figurę"
            aria-valuenow={selected.rotation}
            onPointerDown={(e) => grabHandle(e, "rotate")}
            onPointerMove={handleDrag}
            onPointerUp={handleRelease}
            onPointerCancel={handleRelease}
            style={{ left: rotateAt[0] - 16, top: rotateAt[1] - 16 }}
            className="absolute z-10 flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-full border-2 border-brand bg-card text-brand shadow-card"
          >
            <Icon name="refresh" className="h-4 w-4" />
          </div>
        )}
        {draft && handleKind === "rotate" && (
          <p className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-navy/90 px-3 py-1 text-xs font-bold text-white tabular-nums">
            {draft.rotation}°
          </p>
        )}

        {hint && !draft && (
          <p className="pointer-events-none absolute top-2 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-navy/90 px-3 py-1 text-[11px] font-bold text-white shadow-card">
            {hint}
          </p>
        )}

        {calcOpen && (
          <div className="absolute right-2 bottom-2 z-20 max-h-[calc(100%-1rem)] overflow-y-auto">
            <Calculator onInsert={(value) => addFormula(value.replace(",", "{,}"))} onClose={() => setCalcOpen(false)} />
          </div>
        )}
      </div>

      <footer className={`border-t border-line bg-card ${full ? "px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:px-8" : "px-2 py-2"}`}>
        <div className={`mx-auto flex flex-col gap-2 ${full ? "max-w-5xl lg:flex-row lg:items-center lg:justify-between" : ""}`}>
          {/* jeden zawijany rząd: narzędzia od lewej, cofnij/ponów/wyczyść dosunięte do prawej */}
          <div className="flex flex-wrap items-center gap-0.5">
            <div className="contents">
              {(Object.keys(PALETTE) as PenColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    if (tool === "eraser") selectTool("pen");
                    if (selected && tool === "select") replaceShape({ ...selected, color: c });
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
              <ToolButton icon="eraser" label="Gumka (ściera pismo – figurę usuniesz po zaznaczeniu)" selected={tool === "eraser"} onClick={() => selectTool("eraser")} />
              <ToolButton icon="line" label="Linia (z magnesem)" selected={tool === "line"} onClick={() => selectTool("line")} />
              <ToolButton icon="shapes" label="Figury i bryły" selected={tool === "shape"} onClick={() => selectTool("shape")} />
              <ToolButton icon="angle" label="Kąt" selected={tool === "angle"} onClick={() => selectTool("angle")} />
              <ToolButton icon="mark" label="Oznacz bok (długość, równe odcinki, środek, wysokość)" selected={tool === "mark"} onClick={() => selectTool("mark")} />
              <ToolButton icon="pointer" label="Zaznacz i przesuń figurę" selected={tool === "select"} onClick={() => selectTool("select")} />
              <span className="mx-0.5 h-6 w-px shrink-0 bg-line" aria-hidden />
              {formulas.length > 0 && (
                <ToolButton icon="book" label="Wzory do przeciągnięcia" selected={formulasOpen} onClick={() => setFormulasOpen(!formulasOpen)} />
              )}
              <ToolButton icon="calculator" label="Kalkulator" selected={calcOpen} onClick={() => setCalcOpen(!calcOpen)} />
            </div>
            <div className={`ml-auto flex shrink-0 items-center gap-0.5 text-muted ${full ? "lg:hidden" : ""}`}>
              <HistoryButtons history={history} empty={items.length === 0} onClear={() => history.commit([])} className={toolButton} />
            </div>
          </div>

          {/* Opcje wybranego narzędzia */}
          <div className={`flex min-h-11 min-w-0 items-center gap-2 ${full ? "lg:flex-1 lg:justify-center" : ""}`}>
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
                    style={{ width: previewSize, height: previewSize, background: tool === "eraser" ? "transparent" : colorOf(color, isDark) }}
                  />
                </span>
              </label>
            )}
            {tool === "shape" && (
              <ShapePicker tab={shapeTab} onTab={setShapeTab} value={shapeKind} onChange={setShapeKind} activeClass={active} />
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
            {tool === "mark" && selectedEdge && (
              <MarkOptions
                target={selectedEdge}
                mark={items.find((i): i is MarkItem => i.kind === "mark" && sameEdge(i.target, selectedEdge)) ?? null}
                canHeight={"shapeId" in selectedEdge && heightVertex(shapes.get(selectedEdge.shapeId)!, selectedEdge.edge) !== null}
                onMark={(patch) => upsertMark(selectedEdge, patch)}
                onHeight={() => "shapeId" in selectedEdge && addHeight(selectedEdge.shapeId, selectedEdge.edge)}
              />
            )}
            {tool === "select" && selectedLine && (
              <div className="flex flex-1 items-center gap-2">
                <span className="px-1 text-xs font-bold text-muted">Linia{scene.lines.get(selectedLine)?.fromRef || scene.lines.get(selectedLine)?.toRef ? " · przypięta do figury" : ""}</span>
                <button
                  onClick={() => {
                    if (selectedLine) history.commit(removeLineFrom(items, selectedLine));
                    setSelectedLine(null);
                  }}
                  aria-label="Usuń linię"
                  title="Usuń"
                  className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-subtle hover:text-rose-500"
                >
                  <Icon name="trash" className="h-[18px] w-[18px]" />
                </button>
              </div>
            )}
            {tool === "select" && selected && (
              <SelectionOptions
                shape={selected}
                onLabels={(labels) => replaceShape({ ...selected, labels })}
                onToggleLabels={() => replaceShape({ ...selected, showLabels: !selected.showLabels })}
                onDuplicate={() => duplicateShape(selected)}
                onRemove={() => removeShape(selected.id)}
              />
            )}
          </div>

          {full && (
            <div className="hidden items-center gap-1 text-muted lg:flex">
              <HistoryButtons history={history} empty={items.length === 0} onClear={() => history.commit([])} className={toolButton} />
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

/** Miniatura bryły z jej modelu: krawędzie (niewidoczne przerywane) i elipsy podstaw. */
function SolidIcon({ kind }: { kind: ShapeKind }) {
  const model = solidModel(kind)!;
  const [w, h] = SHAPES[kind].defaultSize;
  const sy = Math.min(1, h / w);
  const sx = Math.min(1, w / h);
  const pt = ([x, y]: [number, number]) => [x * 20 * sx, y * 20 * sy];
  return (
    <svg viewBox="-12 -12 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      {model.ellipses.map((e, i) => (
        <ellipse key={i} cx={e.center[0] * 20 * sx} cy={e.center[1] * 20 * sy} rx={e.rx * 20 * sx} ry={e.ry * 20 * sy} />
      ))}
      {model.edges.map(({ a, b, hidden }, i) => {
        const [x1, y1] = pt(model.points[a]);
        const [x2, y2] = pt(model.points[b]);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={hidden ? "2 2" : undefined} opacity={hidden ? 0.6 : 1} />;
      })}
    </svg>
  );
}

/** Miniatura figury z jej własnego obrysu – ikona zawsze zgadza się z tym, co się narysuje. */
function ShapeIcon({ kind }: { kind: ShapeKind }) {
  if (isSolid(kind)) return <SolidIcon kind={kind} />;
  const outline = shapeOutline(kind);
  const { aspect } = SHAPES[kind];
  const [w, h] = aspect ? [1, aspect] : [1, Math.min(1, SHAPES[kind].defaultSize[1] / SHAPES[kind].defaultSize[0])];
  return (
    <svg viewBox="-12 -12 24 24" className="h-5 w-5" aria-hidden>
      {outline ? (
        <polygon points={outline.map(([x, y]) => `${x * 20 * w},${y * 20 * h}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <circle r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

function ShapePicker({
  tab,
  onTab,
  value,
  onChange,
  activeClass,
}: {
  tab: "plane" | "solid";
  onTab: (tab: "plane" | "solid") => void;
  value: ShapeKind;
  onChange: (kind: ShapeKind) => void;
  activeClass: string;
}) {
  const list = tab === "plane" ? PLANE_SHAPES : SOLID_SHAPES;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <div className="flex shrink-0 gap-0.5 rounded-xl bg-subtle p-0.5" role="radiogroup" aria-label="Rodzaj figur">
        {(
          [
            ["plane", "Płaskie"],
            ["solid", "Bryły"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="radio"
            aria-checked={tab === id}
            onClick={() => {
              onTab(id);
              onChange(id === "plane" ? PLANE_SHAPES[0] : SOLID_SHAPES[0]);
            }}
            className={`min-h-9 rounded-lg px-2.5 text-xs font-bold ${tab === id ? "bg-card text-ink shadow-card" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 gap-1 overflow-x-auto" role="radiogroup" aria-label="Figura">
        {list.map((kind) => (
          <button
            key={kind}
            role="radio"
            aria-checked={value === kind}
            aria-label={SHAPES[kind].label}
            title={SHAPES[kind].label}
            onClick={() => onChange(kind)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${value === kind ? activeClass : "text-muted hover:bg-subtle"}`}
          >
            <ShapeIcon kind={kind} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Opcje zaznaczonej figury: nazwy wierzchołków (do edycji), pokaż/ukryj nazwy, powiel, usuń. */
function SelectionOptions({
  shape,
  onLabels,
  onToggleLabels,
  onDuplicate,
  onRemove,
}: {
  shape: ShapeItem;
  onLabels: (labels: string[]) => void;
  onToggleLabels: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState<{ index: number; value: string } | null>(null);

  function save() {
    if (!editing) return;
    const value = editing.value.trim().slice(0, 3);
    if (value) onLabels(shape.labels.map((l, i) => (i === editing.index ? value : l)));
    setEditing(null);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
      {shape.labels.length > 0 && (
        <>
          <span className="shrink-0 px-1 text-xs font-bold text-muted">{SHAPES[shape.shape].label}</span>
          {shape.labels.map((label, index) =>
            editing?.index === index ? (
              <input
                key={index}
                autoFocus
                value={editing.value}
                maxLength={3}
                onChange={(e) => setEditing({ index, value: e.target.value })}
                onBlur={save}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") setEditing(null);
                }}
                aria-label={`Nazwa wierzchołka ${label}`}
                className="h-9 w-12 shrink-0 rounded-lg border-2 border-brand bg-card text-center font-serif text-base italic text-ink focus:outline-none"
              />
            ) : (
              <button
                key={index}
                onClick={() => setEditing({ index, value: label })}
                title="Zmień nazwę wierzchołka"
                className="h-9 min-w-9 shrink-0 rounded-lg border border-line px-2 font-serif text-base italic text-ink hover:border-brand/40"
              >
                {label}
              </button>
            ),
          )}
          <button
            onClick={onToggleLabels}
            aria-pressed={shape.showLabels}
            className="ml-1 h-9 shrink-0 rounded-lg px-2 text-xs font-bold text-muted hover:bg-subtle"
          >
            {shape.showLabels ? "Ukryj nazwy" : "Pokaż nazwy"}
          </button>
        </>
      )}
      <span className="ml-auto flex shrink-0 gap-0.5">
        <button onClick={onDuplicate} aria-label="Powiel figurę" title="Powiel" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-subtle hover:text-ink">
          <Icon name="copy" className="h-[18px] w-[18px]" />
        </button>
        <button onClick={onRemove} aria-label="Usuń figurę" title="Usuń" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-subtle hover:text-rose-500">
          <Icon name="trash" className="h-[18px] w-[18px]" />
        </button>
      </span>
    </div>
  );
}

function HistoryButtons({
  history,
  empty,
  onClear,
  className,
}: {
  history: { undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean };
  empty: boolean;
  onClear: () => void;
  className: string;
}) {
  return (
    <>
      <button onClick={history.undo} disabled={!history.canUndo} aria-label="Cofnij" title="Cofnij" className={`${className} hover:bg-subtle disabled:opacity-30`}>
        <Icon name="undo" className="h-[18px] w-[18px]" />
      </button>
      <button onClick={history.redo} disabled={!history.canRedo} aria-label="Ponów" title="Ponów" className={`${className} hover:bg-subtle disabled:opacity-30`}>
        <Icon name="redo" className="h-[18px] w-[18px]" />
      </button>
      <button
        onClick={onClear}
        disabled={empty}
        aria-label="Wyczyść wszystko"
        title="Wyczyść wszystko (można cofnąć)"
        className={`${className} hover:bg-subtle hover:text-rose-500 disabled:opacity-30`}
      >
        <Icon name="trash" className="h-[18px] w-[18px]" />
      </button>
    </>
  );
}

/** Najbliższy bok figury, krawędź bryły albo linia w zasięgu palca. */
function nearestEdge(p: Vec, scene: Scene, tolerance: number): EdgeRef | null {
  let best: EdgeRef | null = null;
  let bestDistance = tolerance;
  for (const line of scene.lines.values()) {
    const { from, to } = lineEnds(line, scene);
    const d = distanceToSegment(p, from, to);
    if (d <= bestDistance) {
      best = { lineId: line.id };
      bestDistance = d;
    }
  }
  for (const shape of scene.shapes.values()) {
    const vertices = shapeVertices(shape);
    shapeEdges(shape).forEach(([i, j], edge) => {
      const d = distanceToSegment(p, vertices[i], vertices[j]);
      if (d <= bestDistance) {
        best = { shapeId: shape.id, edge };
        bestDistance = d;
      }
    });
  }
  return best;
}

const QUICK_LABELS = ["a", "b", "c", "h", "r", "x"];

/** Opcje oznaczenia boku: długość (z szybkimi literami), znaczniki równych odcinków, środek, wysokość. */
function MarkOptions({
  target,
  mark,
  canHeight,
  onMark,
  onHeight,
}: {
  target: EdgeRef;
  mark: MarkItem | null;
  canHeight: boolean;
  onMark: (patch: Partial<Pick<MarkItem, "label" | "ticks" | "midpoint">>) => void;
  onHeight: () => void;
}) {
  // szkic wpisywanej długości – zapis do historii dopiero po Enter / opuszczeniu pola (nie przy każdej literze)
  const key = "lineId" in target ? target.lineId : `${target.shapeId}/${target.edge}`;
  const [draft, setDraft] = useState<{ key: string; value: string } | null>(null);
  const value = draft?.key === key ? draft.value : (mark?.label ?? "");
  const chip = "h-9 min-w-9 shrink-0 rounded-lg border px-2 text-sm font-bold transition-colors";

  function save() {
    if (draft?.key === key && draft.value !== (mark?.label ?? "")) onMark({ label: draft.value });
    setDraft(null);
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
      <input
        value={value}
        onChange={(e) => setDraft({ key, value: e.target.value })}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="np. 5, 2√3, a/2"
        aria-label="Długość boku"
        maxLength={24}
        className="h-9 w-28 shrink-0 rounded-lg border border-line bg-card px-2 text-sm text-ink focus:border-brand focus:outline-none"
      />
      {QUICK_LABELS.map((l) => (
        <button key={l} onClick={() => onMark({ label: mark?.label === l ? "" : l })} className={`${chip} font-serif italic ${mark?.label === l ? "border-brand bg-brand-soft text-brand" : "border-line text-ink"}`}>
          {l}
        </button>
      ))}
      <span className="mx-0.5 h-6 w-px shrink-0 bg-line" aria-hidden />
      <div className="flex shrink-0 gap-0.5" role="radiogroup" aria-label="Znaczniki równych odcinków">
        {([0, 1, 2, 3] as const).map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={(mark?.ticks ?? 0) === n}
            aria-label={n === 0 ? "Bez znaczników" : `${n} ${n === 1 ? "kreska" : "kreski"}`}
            onClick={() => onMark({ ticks: n })}
            className={`${chip} ${(mark?.ticks ?? 0) === n ? "border-brand bg-brand-soft text-brand" : "border-line text-muted"}`}
          >
            {n === 0 ? "–" : "|".repeat(n)}
          </button>
        ))}
      </div>
      <button
        onClick={() => onMark({ midpoint: !mark?.midpoint })}
        aria-pressed={Boolean(mark?.midpoint)}
        className={`${chip} ${mark?.midpoint ? "border-brand bg-brand-soft text-brand" : "border-line text-muted"}`}
      >
        Środek
      </button>
      {canHeight && (
        <button onClick={onHeight} className={`${chip} border-line text-muted hover:text-ink`}>
          Wysokość
        </button>
      )}
    </div>
  );
}
