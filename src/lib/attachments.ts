// Załączniki do korepetytora: zdjęcia zmniejszamy na urządzeniu, z PDF-ów wyciągamy tekst (Groq nie czyta PDF-ów).
// Strony bez warstwy tekstowej (skany) renderujemy do obrazków – model widzi je jak zdjęcia.

/** Groq przyjmuje najwyżej 3 obrazy w jednym zapytaniu (model Qwen 3.8). */
export const MAX_IMAGES = 3;
/** Ile znaków tekstu z jednego PDF-a wysyłamy – darmowy plan ma limit tokenów na minutę. */
export const MAX_PDF_CHARS = 16_000;
const MAX_IMAGE_SIDE = 1280;
const MIN_PAGE_TEXT = 40; // mniej znaków na stronie = skan albo sam rysunek

export interface ImageAttachment {
  kind: "image";
  id: string;
  name: string;
  dataUrl: string;
}

export interface PdfAttachment {
  kind: "pdf";
  id: string;
  name: string;
  file: Blob;
  pageCount: number;
  /** Tekst każdej strony (indeks 0 = strona 1). */
  pages: string[];
  /** Wybrany zakres stron (1-based, włącznie). */
  from: number;
  to: number;
  /** Wyrenderowane skany z wybranego zakresu. */
  scans: { page: number; dataUrl: string }[];
}

export type Attachment = ImageAttachment | PdfAttachment;

const newId = () => Math.random().toString(36).slice(2, 10);

export function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function isImage(file: File) {
  return file.type.startsWith("image/");
}

function canvasToJpeg(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", 0.82);
}

function fitCanvas(width: number, height: number) {
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  return { canvas, scale };
}

/** Zdjęcie → JPEG do 1280 px (mniejsze zapytanie, szybsza odpowiedź). */
export async function prepareImage(file: Blob, name: string): Promise<ImageAttachment> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (error) {
    throw new Error(`Nie udało się odczytać zdjęcia „${name}”. Spróbuj formatu JPG albo PNG.`, { cause: error });
  }
  const { canvas } = fitCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // przezroczyste PNG na białym tle, a nie czarnym
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { kind: "image", id: newId(), name, dataUrl: canvasToJpeg(canvas) };
}

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjs: Promise<PdfJs> | null = null;

/** pdf.js ładujemy dopiero przy pierwszym PDF-ie (to spora biblioteka); wersja „legacy” działa też w starszych WebView. */
function loadPdfJs(): Promise<PdfJs> {
  pdfjs ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    return lib;
  });
  return pdfjs;
}

async function openPdf(file: Blob) {
  const lib = await loadPdfJs();
  const task = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  // zamknięcie zadania ładowania zwalnia dokument i worker
  return Object.assign(doc, { close: () => void task.destroy() });
}

type PdfDoc = Awaited<ReturnType<typeof openPdf>>;

async function pageText(doc: PdfDoc, pageNumber: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();
  let text = "";
  for (const item of content.items) {
    if (!("str" in item)) continue;
    text += item.str + (item.hasEOL ? "\n" : "");
  }
  page.cleanup();
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function renderPage(doc: PdfDoc, pageNumber: number): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const { canvas, scale } = fitCanvas(base.width * 2, base.height * 2);
  const viewport = page.getViewport({ scale: scale * 2 });
  await page.render({ canvas, viewport, background: "#ffffff" }).promise;
  page.cleanup();
  return canvasToJpeg(canvas);
}

/** Skany z zakresu stron – tyle, ile zostało miejsca na obrazy. */
async function renderScans(doc: PdfDoc, pages: string[], from: number, to: number, slots: number) {
  const scans: PdfAttachment["scans"] = [];
  for (let n = from; n <= to && scans.length < slots; n++) {
    if (pages[n - 1].length < MIN_PAGE_TEXT) scans.push({ page: n, dataUrl: await renderPage(doc, n) });
  }
  return scans;
}

/** Domyślny zakres: od pierwszej strony, póki tekst mieści się w limicie. */
function defaultRange(pages: string[]): number {
  let chars = 0;
  for (let i = 0; i < pages.length; i++) {
    chars += pages[i].length;
    if (chars > MAX_PDF_CHARS && i > 0) return i;
  }
  return pages.length;
}

export async function preparePdf(file: File, imageSlots: number): Promise<PdfAttachment> {
  let doc: PdfDoc;
  try {
    doc = await openPdf(file);
  } catch (error) {
    const locked = error instanceof Error && error.name === "PasswordException";
    throw new Error(locked ? `Plik „${file.name}” jest zabezpieczony hasłem.` : `Nie udało się otworzyć pliku „${file.name}”.`, {
      cause: error,
    });
  }
  try {
    const pages: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) pages.push(await pageText(doc, n));
    const to = defaultRange(pages);
    const scans = await renderScans(doc, pages, 1, to, imageSlots);
    return { kind: "pdf", id: newId(), name: file.name, file, pageCount: doc.numPages, pages, from: 1, to, scans };
  } finally {
    doc.close();
  }
}

/** Zmiana zakresu stron (np. „12-14”) – na nowo renderuje skany z tego zakresu. */
export async function setPdfRange(pdf: PdfAttachment, from: number, to: number, imageSlots: number): Promise<PdfAttachment> {
  const doc = await openPdf(pdf.file);
  try {
    return { ...pdf, from, to, scans: await renderScans(doc, pdf.pages, from, to, imageSlots) };
  } finally {
    doc.close();
  }
}

/** „5”, „5-7”, „5–7” → zakres w granicach dokumentu; null gdy nie da się odczytać. */
export function parsePageRange(input: string, pageCount: number): { from: number; to: number } | null {
  const match = input.trim().match(/^(\d+)\s*(?:[-–—]\s*(\d+))?$/);
  if (!match) return null;
  const from = Number(match[1]);
  const to = match[2] ? Number(match[2]) : from;
  if (from < 1 || to < from || from > pageCount) return null;
  return { from, to: Math.min(to, pageCount) };
}

/** Tekst z wybranych stron, przycięty do limitu. */
export function pdfContext(pdf: PdfAttachment): string {
  const parts: string[] = [];
  let chars = 0;
  let cut = false;
  for (let n = pdf.from; n <= pdf.to; n++) {
    const text = pdf.pages[n - 1];
    if (!text) continue;
    if (chars + text.length > MAX_PDF_CHARS) {
      parts.push(`--- strona ${n} ---\n${text.slice(0, Math.max(0, MAX_PDF_CHARS - chars))}`);
      cut = true;
      break;
    }
    parts.push(`--- strona ${n} ---\n${text}`);
    chars += text.length;
  }
  const scanned = pdf.scans.map((s) => s.page);
  const header = `[Plik PDF „${pdf.name}”, strony ${pdf.from}–${pdf.to} z ${pdf.pageCount}. Tekst wyciągnięty automatycznie – wzory mogą być zniekształcone.${
    scanned.length ? ` Strony ${scanned.join(", ")} to skany – są w załączonych obrazach.` : ""
  }]`;
  return [header, ...parts, cut ? "[…dalsza część pominięta – uczeń może wskazać konkretne strony]" : ""].filter(Boolean).join("\n\n");
}

export function pdfHasContent(pdf: PdfAttachment): boolean {
  return pdf.scans.length > 0 || pdf.pages.slice(pdf.from - 1, pdf.to).some((t) => t.length > 0);
}

/** Ile obrazów zajmuje załącznik. */
export function imageCount(attachment: Attachment): number {
  return attachment.kind === "image" ? 1 : attachment.scans.length;
}
