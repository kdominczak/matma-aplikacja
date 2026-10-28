// Rysowanie elementów brudnopisu na canvasie: kreski, figury (z nazwami wierzchołków), bryły 3D i kąty.
// Geometria (wierzchołki, kąty, przekształcenia) jest w src/lib/geometry – tu tylko piksele.
// Wzory przeciągnięte na kartkę (kind: "formula") to warstwa HTML z KaTeX nad canvasem.

import { angleArms, edgeSegment, lineEnds, type Scene } from "@/components/scratch/scene";
import { angleArc, angleDegrees, isRightAngle } from "@/lib/geometry/angle";
import { circleRadius, isSolid, SHAPES, shapeCenter, shapeEdges, shapeVertices, solidModel, toWorld, type ShapeKind } from "@/lib/geometry/shapes";
import { boxCorners } from "@/lib/geometry/transform";
import { SNAP_LABELS, type SnapTarget } from "@/lib/geometry/snap";
import { add, distance, length, scale, sub, type Vec } from "@/lib/geometry/vec";
import { onSegment } from "@/lib/geometry/marks";
import type { AngleItem, LineItem, MarkItem, PenColor, ScratchItem, ShapeItem } from "@/types/scratch";

export type { PenColor, ScratchItem } from "@/types/scratch";
export type Point = Vec;

export const PALETTE: Record<PenColor, { label: string; light: string; dark: string }> = {
  ink: { label: "Czarny", light: "#0f172a", dark: "#f1f4fa" },
  blue: { label: "Niebieski", light: "#2f5bff", dark: "#7b97ff" },
  red: { label: "Czerwony", light: "#e11d48", dark: "#fb7185" },
};

export function colorOf(color: PenColor, isDark: boolean) {
  return PALETTE[color][isDark ? "dark" : "light"];
}

/** Kontekst rysowania: motyw, szerokość kartki w px (jednostki → piksele) i scena (figury, linie – do elementów przypiętych). */
export interface DrawContext {
  isDark: boolean;
  width: number;
  scene: Scene;
}

const DASH = [6, 5];
const ANGLE_RADIUS = 24;
const LABEL_OFFSET = 14;
const LABEL_FONT = "italic 600 17px 'Times New Roman', serif";

const px = (p: Vec, w: number): Vec => [p[0] * w, p[1] * w];

export function drawItem(ctx: CanvasRenderingContext2D, item: ScratchItem, dc: DrawContext) {
  if (item.kind === "formula") return;
  const color = colorOf(item.color, dc.isDark);
  ctx.save();
  ctx.globalCompositeOperation = item.kind === "stroke" && item.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (item.kind === "stroke") drawStroke(ctx, item.points.map((p) => px(p, dc.width)), item.width);
  else if (item.kind === "shape") drawShape(ctx, item, dc.width);
  else if (item.kind === "line") drawLine(ctx, item, dc);
  else if (item.kind === "mark") drawMark(ctx, item, dc);
  else drawAngle(ctx, item, dc);
  ctx.restore();
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Vec[], width: number) {
  const [first, ...rest] = points;
  if (!first) return;
  ctx.lineWidth = width;
  if (rest.length === 0) {
    // pojedyncze tapnięcie = kropka
    ctx.beginPath();
    ctx.arc(first[0], first[1], width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);
  rest.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
}

/** Dorysowanie ostatniego odcinka kreski (płynne rysowanie bez przerysowania całości). */
export function drawStrokeTail(ctx: CanvasRenderingContext2D, from: Vec, to: Vec, color: string, width: number, erase: boolean) {
  ctx.save();
  ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.stroke();
  ctx.restore();
}

// ── Figury płaskie ──

function drawShape(ctx: CanvasRenderingContext2D, s: ShapeItem, w: number) {
  ctx.lineWidth = s.width;
  if (isSolid(s.shape)) {
    drawSolid(ctx, s, w);
    return;
  }
  if (s.shape === "circle") {
    const [cx, cy] = px(s.center, w);
    ctx.beginPath();
    ctx.arc(cx, cy, circleRadius(s) * w, 0, Math.PI * 2);
    ctx.stroke();
    dot(ctx, [cx, cy]);
    if (s.showLabels && s.labels[0]) label(ctx, s.labels[0], [cx + LABEL_OFFSET * 0.8, cy - LABEL_OFFSET * 0.8]);
    return;
  }
  const vertices = shapeVertices(s).map((p) => px(p, w));
  ctx.beginPath();
  vertices.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.stroke();
  if (s.showLabels) {
    // nazwy na zewnątrz figury: od środka przez wierzchołek
    const center = px(shapeCenter(s), w);
    vertices.forEach((v, i) => {
      const out = sub(v, center);
      const len = length(out) || 1;
      label(ctx, s.labels[i] ?? "", add(v, scale(out, LABEL_OFFSET / len)));
    });
  }
}

function label(ctx: CanvasRenderingContext2D, text: string, [x, y]: Vec) {
  if (!text) return;
  ctx.save();
  ctx.setLineDash([]);
  ctx.font = LABEL_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ── Kąty ──

function drawLine(ctx: CanvasRenderingContext2D, line: LineItem, dc: DrawContext) {
  const { from, to } = lineEnds(line, dc.scene);
  ctx.lineWidth = line.width;
  edge(ctx, px(from, dc.width), px(to, dc.width));
  if (line.toRef && "foot" in line.toRef) drawHeightFoot(ctx, line, dc, px(from, dc.width), px(to, dc.width));
}

/** Koniec wysokości: kwadracik kąta prostego przy spodku i przerywane przedłużenie boku, gdy spodek wypada poza bok. */
function drawHeightFoot(ctx: CanvasRenderingContext2D, line: LineItem, dc: DrawContext, from: Vec, foot: Vec) {
  const ref = line.toRef as { shapeId: string; foot: [number, number] };
  const shape = dc.scene.shapes.get(ref.shapeId);
  const pair = shape && shapeEdges(shape)[ref.foot[1]];
  if (!shape || !pair) return;
  const vertices = shapeVertices(shape);
  const [pa, pb] = [px(vertices[pair[0]], dc.width), px(vertices[pair[1]], dc.width)];
  if (!onSegment(foot, pa, pb, 0.5)) {
    // spodek poza bokiem (np. trójkąt rozwartokątny) – przedłużenie boku do spodka
    const near = distance(foot, pa) < distance(foot, pb) ? pa : pb;
    ctx.lineWidth = 1.2;
    edge(ctx, near, foot, true);
  }
  // kwadracik: wzdłuż boku i wzdłuż wysokości
  const along = sub(pb, pa);
  const up = sub(from, foot);
  const [la, lu] = [length(along) || 1, length(up) || 1];
  const side = Math.min(10, lu * 0.4);
  const u = scale(along, side / la);
  const v = scale(up, side / lu);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(foot[0] + u[0], foot[1] + u[1]);
  ctx.lineTo(foot[0] + u[0] + v[0], foot[1] + u[1] + v[1]);
  ctx.lineTo(foot[0] + v[0], foot[1] + v[1]);
  ctx.stroke();
}

const TICK = 7;
const TICK_GAP = 4;

/** Kreski równych odcinków (1–3) prostopadle do odcinka, w punkcie `at` (px). */
function ticks(ctx: CanvasRenderingContext2D, a: Vec, b: Vec, at: Vec, count: number) {
  const dir = sub(b, a);
  const len = length(dir) || 1;
  const d = scale(dir, 1 / len);
  const n: Vec = [-d[1], d[0]];
  for (let i = 0; i < count; i++) {
    const c = add(at, scale(d, (i - (count - 1) / 2) * TICK_GAP));
    edge(ctx, add(c, scale(n, TICK)), sub(c, scale(n, TICK)));
  }
}

/** Oznaczenie boku na canvasie: znaczniki równych odcinków i środek boku (podpis długości – warstwa HTML z KaTeX). */
function drawMark(ctx: CanvasRenderingContext2D, mark: MarkItem, dc: DrawContext) {
  const segment = edgeSegment(mark.target, dc.scene);
  if (!segment) return;
  const [a, b] = [px(segment.a, dc.width), px(segment.b, dc.width)];
  const mid: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);
  if (mark.midpoint) {
    // środek boku: kropka i jednakowe kreski na obu połówkach
    dot(ctx, mid);
    ticks(ctx, a, b, [(a[0] + mid[0]) / 2, (a[1] + mid[1]) / 2], 1);
    ticks(ctx, a, b, [(mid[0] + b[0]) / 2, (mid[1] + b[1]) / 2], 1);
  }
  if (mark.ticks > 0) ticks(ctx, a, b, mid, mark.ticks);
}

/** Wyróżnienie wybranego boku (oznaczanie) – px. */
export function drawEdgeHighlight(ctx: CanvasRenderingContext2D, a: Vec, b: Vec, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineCap = "round";
  ctx.lineWidth = 10;
  edge(ctx, a, b);
  ctx.restore();
}

/** Pozycja podpisu długości (px): na zewnątrz boku, w połowie jego długości. */
export function markLabelPosition(segment: { a: Vec; b: Vec; outward: Vec }, w: number): Vec {
  const mid: Vec = [((segment.a[0] + segment.b[0]) / 2) * w, ((segment.a[1] + segment.b[1]) / 2) * w];
  return add(mid, scale(segment.outward, 16));
}

/** Podgląd rysowanej linii (px). */
export function drawLinePreview(ctx: CanvasRenderingContext2D, from: Vec, to: Vec, color: string, width: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  edge(ctx, from, to);
  ctx.restore();
}

/** Magnes: kółko na złapanym punkcie i podpis, co to za punkt (px). */
export function drawSnapIndicator(ctx: CanvasRenderingContext2D, target: SnapTarget, w: number, color: string) {
  const [x, y] = px(target.point, w);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = "700 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(SNAP_LABELS[target.kind], x, y - 12);
  ctx.restore();
}

function drawAngle(ctx: CanvasRenderingContext2D, item: AngleItem, dc: DrawContext) {
  const arms = angleArms(item, dc.scene);
  if (!arms) return;
  const [vertex, a, b] = [arms.vertex, arms.a, arms.b].map((p) => px(p, dc.width));
  const free = "points" in item.anchor;
  ctx.setLineDash([]);
  if (free) {
    // kąt swobodny – rysujemy też ramiona (przypięty korzysta z boków figury)
    ctx.lineWidth = 1.5;
    edge(ctx, vertex, a);
    edge(ctx, vertex, b);
  }
  // promień łuku nie większy niż ~40% krótszego ramienia – łuk nie wychodzi poza mały trójkąt
  const radius = Math.min(ANGLE_RADIUS, 0.4 * Math.min(length(sub(a, vertex)), length(sub(b, vertex))));
  const ua = scale(sub(a, vertex), 1 / (length(sub(a, vertex)) || 1));
  const ub = scale(sub(b, vertex), 1 / (length(sub(b, vertex)) || 1));
  ctx.lineWidth = 2;

  if (isRightAngle(angleDegrees(vertex, a, b))) {
    // kąt prosty – kwadracik
    const side = radius * 0.6;
    const p1 = add(vertex, scale(ua, side));
    const p2 = add(add(vertex, scale(ua, side)), scale(ub, side));
    const p3 = add(vertex, scale(ub, side));
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.stroke();
    dot(ctx, add(vertex, scale(add(ua, ub), side * 0.5)));
  } else {
    const { start, sweep } = angleArc({ vertex, a, b });
    ctx.beginPath();
    ctx.arc(vertex[0], vertex[1], radius, start, start + sweep, sweep < 0);
    ctx.stroke();
  }

  const bisector = add(ua, ub);
  const dir = scale(bisector, 1 / (length(bisector) || 1));
  label(ctx, item.label, add(vertex, scale(dir, radius + 13)));
}

/** Podgląd zaznaczanego kąta swobodnego – kropki w klikniętych punktach i linia między nimi (px). */
export function drawAnglePreview(ctx: CanvasRenderingContext2D, points: Vec[], color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  if (points.length === 2) edge(ctx, points[0], points[1]);
  ctx.setLineDash([]);
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/** Ramka zaznaczonej figury i kropki wierzchołków (px). */
export function drawSelection(ctx: CanvasRenderingContext2D, s: ShapeItem, w: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  const corners = boxCorners(s).map((p) => px(p, w));
  ctx.beginPath();
  corners.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  shapeVertices(s).forEach((v) => {
    const [x, y] = px(v, w);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/** Pudełko nowej figury z przeciągnięcia (w jednostkach); samo stuknięcie – domyślny rozmiar wokół punktu. */
export function shapeFromDrag(kind: ShapeKind, from: Vec, to: Vec, minDrag: number): { center: Vec; size: Vec } {
  let w = Math.abs(to[0] - from[0]);
  let h = Math.abs(to[1] - from[1]);
  if (w < minDrag || h < minDrag) return { center: from, size: SHAPES[kind].defaultSize };
  const aspect = SHAPES[kind].aspect;
  if (aspect) {
    const k = Math.max(w, h / aspect);
    w = k;
    h = k * aspect;
  }
  const center: Vec = [from[0] + (Math.sign(to[0] - from[0]) * w) / 2, from[1] + (Math.sign(to[1] - from[1]) * h) / 2];
  return { center, size: [w, h] };
}

// ── Elementy rysunku ──

/** Odcinek ciągły (krawędź widoczna) lub przerywany (niewidoczna). */
function edge(ctx: CanvasRenderingContext2D, from: Vec, to: Vec, hidden = false) {
  ctx.setLineDash(hidden ? DASH : []);
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.stroke();
}

/** Połowa elipsy: przednia (dolna) ciągła albo tylna (górna) przerywana. */
function halfEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, front: boolean) {
  ctx.setLineDash(front ? [] : DASH);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2);
  ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, [x, y]: Vec) {
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Bryła z modelu (src/lib/geometry/solids.ts): elipsy podstaw (tylna połowa przerywana), krawędzie
 * (niewidoczne przerywane), punkty pomocnicze (spodek wysokości, środki podstaw) i nazwy wierzchołków.
 */
function drawSolid(ctx: CanvasRenderingContext2D, s: ShapeItem, w: number) {
  const model = solidModel(s.shape)!;
  const at = (p: Vec) => px(toWorld(s, p), w);
  for (const e of model.ellipses) {
    const [cx, cy] = at(e.center);
    const [rx, ry] = [e.rx * s.size[0] * w, e.ry * s.size[1] * w];
    if (e.full) {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      halfEllipse(ctx, cx, cy, rx, ry, true);
      halfEllipse(ctx, cx, cy, rx, ry, false);
    }
  }
  const points = model.points.map(at);
  for (const { a, b, hidden } of model.edges) edge(ctx, points[a], points[b], hidden);
  for (const i of model.aux) dot(ctx, points[i]);
  if (!s.showLabels) return;
  const center = px(s.center, w);
  points.forEach((p, i) => {
    const text = s.labels[i];
    if (!text) return;
    if (model.aux.includes(i)) {
      // punkt wewnątrz bryły (spodek wysokości, środek kuli) – nazwa obok, w prawo w dół
      label(ctx, text, [p[0] + LABEL_OFFSET * 0.8, p[1] + LABEL_OFFSET * 0.8]);
      return;
    }
    const out = sub(p, center);
    const len = length(out) || 1;
    label(ctx, text, add(p, scale(out, LABEL_OFFSET / len)));
  });
}
