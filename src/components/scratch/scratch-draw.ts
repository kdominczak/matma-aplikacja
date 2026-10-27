// Rysowanie elementów brudnopisu na canvasie: kreski, bryły 3D i oznaczenia kątów.
// Wzory przeciągnięte na kartkę (kind: "formula") nie są rysowane na canvasie – to warstwa HTML z KaTeX nad nim.

export type Point = [number, number];
export type PenColor = "ink" | "blue" | "red";
export type Solid = "cone" | "sphere" | "pyramid" | "prism";

export type ScratchItem =
  | { kind: "stroke"; points: Point[]; color: PenColor; width: number; erase: boolean }
  | { kind: "solid"; solid: Solid; x: number; y: number; w: number; h: number; color: PenColor; width: number }
  | { kind: "angle"; vertex: Point; a: Point; b: Point; label: string; color: PenColor }
  /** Wzór (LaTeX) albo wynik z kalkulatora położony na kartce; x, y = lewy górny róg w px kartki. */
  | { kind: "formula"; tex: string; x: number; y: number };

export const PALETTE: Record<PenColor, { label: string; light: string; dark: string }> = {
  ink: { label: "Czarny", light: "#0f172a", dark: "#f1f4fa" },
  blue: { label: "Niebieski", light: "#2f5bff", dark: "#7b97ff" },
  red: { label: "Czerwony", light: "#e11d48", dark: "#fb7185" },
};

export function colorOf(color: PenColor, isDark: boolean) {
  return PALETTE[color][isDark ? "dark" : "light"];
}

const DASH = [6, 5];
const ANGLE_RADIUS = 26;

export function drawItem(ctx: CanvasRenderingContext2D, item: ScratchItem, isDark: boolean) {
  if (item.kind === "formula") return;
  const color = colorOf(item.color, isDark);
  ctx.save();
  ctx.globalCompositeOperation = item.kind === "stroke" && item.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (item.kind === "stroke") drawStroke(ctx, item.points, item.width);
  else if (item.kind === "solid") drawSolid(ctx, item);
  else drawAngle(ctx, item.vertex, item.a, item.b, item.label);
  ctx.restore();
}

function drawStroke(ctx: CanvasRenderingContext2D, points: Point[], width: number) {
  const [first, ...rest] = points;
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

/** Odcinek ciągły (krawędź widoczna) lub przerywany (niewidoczna). */
function edge(ctx: CanvasRenderingContext2D, from: Point, to: Point, hidden = false) {
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

function dot(ctx: CanvasRenderingContext2D, [x, y]: Point) {
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSolid(ctx: CanvasRenderingContext2D, s: Extract<ScratchItem, { kind: "solid" }>) {
  ctx.lineWidth = s.width;
  const { x, y, w, h } = s;
  const cx = x + w / 2;

  switch (s.solid) {
    case "cone": {
      // podstawa (elipsa) + tworzące + wysokość i promień przerywane
      const ry = Math.max(8, h * 0.12);
      const by = y + h - ry;
      halfEllipse(ctx, cx, by, w / 2, ry, true);
      halfEllipse(ctx, cx, by, w / 2, ry, false);
      edge(ctx, [cx, y], [x, by]);
      edge(ctx, [cx, y], [x + w, by]);
      edge(ctx, [cx, y], [cx, by], true);
      edge(ctx, [cx, by], [x + w, by], true);
      dot(ctx, [cx, by]);
      break;
    }
    case "sphere": {
      const r = Math.min(w, h) / 2;
      const cy = y + h / 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      halfEllipse(ctx, cx, cy, r, r * 0.3, true);
      halfEllipse(ctx, cx, cy, r, r * 0.3, false);
      edge(ctx, [cx, cy], [cx + r, cy], true);
      dot(ctx, [cx, cy]);
      break;
    }
    case "pyramid": {
      // ostrosłup prawidłowy czworokątny: podstawa w rzucie ukośnym, spodek wysokości w środku podstawy
      const depthX = w * 0.28;
      const depthY = h * 0.22;
      const fl: Point = [x, y + h];
      const fr: Point = [x + w - depthX, y + h];
      const br: Point = [x + w, y + h - depthY];
      const bl: Point = [x + depthX, y + h - depthY];
      const center: Point = [(fl[0] + br[0]) / 2, (fl[1] + br[1]) / 2];
      const apex: Point = [center[0], y];
      edge(ctx, fl, fr);
      edge(ctx, fr, br);
      edge(ctx, bl, fl, true);
      edge(ctx, bl, br, true);
      edge(ctx, apex, fl);
      edge(ctx, apex, fr);
      edge(ctx, apex, br);
      edge(ctx, apex, bl, true);
      edge(ctx, apex, center, true);
      dot(ctx, center);
      break;
    }
    case "prism": {
      // graniastosłup prawidłowy czworokątny (prostopadłościan) w rzucie ukośnym
      const depthX = w * 0.28;
      const depthY = h * 0.2;
      const f = { tl: [x, y + depthY], tr: [x + w - depthX, y + depthY], br: [x + w - depthX, y + h], bl: [x, y + h] } as const;
      const b = { tl: [x + depthX, y], tr: [x + w, y], br: [x + w, y + h - depthY], bl: [x + depthX, y + h - depthY] } as const;
      const p = (pt: readonly [number, number]): Point => [pt[0], pt[1]];
      edge(ctx, p(f.tl), p(f.tr));
      edge(ctx, p(f.tr), p(f.br));
      edge(ctx, p(f.br), p(f.bl));
      edge(ctx, p(f.bl), p(f.tl));
      edge(ctx, p(f.tl), p(b.tl));
      edge(ctx, p(f.tr), p(b.tr));
      edge(ctx, p(f.br), p(b.br));
      edge(ctx, p(b.tl), p(b.tr));
      edge(ctx, p(b.tr), p(b.br));
      // niewidoczny narożnik z tyłu
      edge(ctx, p(f.bl), p(b.bl), true);
      edge(ctx, p(b.bl), p(b.tl), true);
      edge(ctx, p(b.bl), p(b.br), true);
      break;
    }
  }
}

function drawAngle(ctx: CanvasRenderingContext2D, vertex: Point, a: Point, b: Point, label: string) {
  const [vx, vy] = vertex;
  const start = Math.atan2(a[1] - vy, a[0] - vx);
  const end = Math.atan2(b[1] - vy, b[0] - vx);
  // zawsze mniejszy z dwóch kątów między ramionami
  let sweep = end - start;
  while (sweep <= -Math.PI) sweep += Math.PI * 2;
  while (sweep > Math.PI) sweep -= Math.PI * 2;

  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  edge(ctx, vertex, a);
  edge(ctx, vertex, b);

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(vx, vy, ANGLE_RADIUS, start, start + sweep, sweep < 0);
  ctx.stroke();

  const mid = start + sweep / 2;
  ctx.font = "italic 600 18px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, vx + Math.cos(mid) * (ANGLE_RADIUS + 14), vy + Math.sin(mid) * (ANGLE_RADIUS + 14));
}

/** Podgląd zaznaczanego kąta – kropki w klikniętych punktach i linie między nimi. */
export function drawAnglePreview(ctx: CanvasRenderingContext2D, points: Point[], color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  if (points.length === 2) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/** Prostokąt z przeciągnięcia (dowolny kierunek) → bryła; samo stuknięcie wstawia bryłę domyślnego rozmiaru. */
export function solidBox(from: Point, to: Point): { x: number; y: number; w: number; h: number } {
  const w = Math.abs(to[0] - from[0]);
  const h = Math.abs(to[1] - from[1]);
  if (w < 24 || h < 24) return { x: from[0] - 70, y: from[1] - 80, w: 140, h: 160 };
  return { x: Math.min(from[0], to[0]), y: Math.min(from[1], to[1]), w, h };
}
