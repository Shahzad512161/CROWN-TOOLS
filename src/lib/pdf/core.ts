// Shared PDF engine core for all Super Crown PDF tools.
// Everything runs 100% in the browser: files never leave the user's device.
import { PDFDocument, StandardFonts, degrees, rgb, PDFName, PDFString, PDFHexString } from '@cantoo/pdf-lib';
import JSZip from 'jszip';

// pdf.js is heavy (~350 KB gz) and only tools that READ/render existing PDFs
// need it — load it lazily on first use so write-only tools never pay for it.
type PdfJsLib = typeof import('pdfjs-dist');
let pdfjsPromise: Promise<PdfJsLib> | null = null;
export function loadPdfJsLib(): Promise<PdfJsLib> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const lib = await import('pdfjs-dist');
      // @ts-ignore - Vite URL import for the pdf.js worker bundle
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      lib.GlobalWorkerOptions.workerSrc = workerUrl as string;
      return lib;
    })();
  }
  return pdfjsPromise;
}

export { PDFDocument, StandardFonts, degrees, rgb, PDFName, PDFString, PDFHexString };
export type { PDFPage } from '@cantoo/pdf-lib';

// ---------------------------------------------------------------------------
// Basic file helpers
// ---------------------------------------------------------------------------

export async function fileToBytes(file: File | Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

export function baseName(file: File | string): string {
  const n = typeof file === 'string' ? file : file.name;
  return n.replace(/\.[^/.]+$/, '') || 'document';
}

export function formatBytes(n: number): string {
  if (!n && n !== 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadBytes(data: Uint8Array | ArrayBuffer, filename: string, mime = 'application/pdf') {
  const blob = new Blob([data as BlobPart], { type: mime });
  downloadBlob(blob, filename);
}

export async function downloadZip(files: { name: string; data: Uint8Array | Blob | string }[], zipName: string) {
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.data as any));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
}

// ---------------------------------------------------------------------------
// pdf-lib helpers
// ---------------------------------------------------------------------------

export async function loadPdf(bytes: Uint8Array, opts?: { ignoreEncryption?: boolean }) {
  return PDFDocument.load(bytes, { ignoreEncryption: opts?.ignoreEncryption ?? false });
}

export async function savePdf(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save({ useObjectStreams: true });
}

// ---------------------------------------------------------------------------
// pdf.js helpers
// ---------------------------------------------------------------------------

export type PdfJsDoc = import('pdfjs-dist').PDFDocumentProxy;

export async function openPdfJs(bytes: Uint8Array, password?: string): Promise<PdfJsDoc> {
  const pdfjsLib = await loadPdfJsLib();
  const task = pdfjsLib.getDocument({ data: bytes.slice() as any, password });
  return task.promise;
}

export interface TextItem {
  str: string;
  x: number; // pdf points, origin bottom-left
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

/** Extract positioned text items of one page (1-based page number). */
export async function getPageTextItems(doc: PdfJsDoc, pageNum: number): Promise<TextItem[]> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  return tc.items
    .filter((it: any) => typeof it.str === 'string')
    .map((it: any) => {
      const tx = it.transform[4];
      const ty = it.transform[5];
      const fontSize = Math.hypot(it.transform[2], it.transform[3]) || Math.abs(it.transform[3]) || 10;
      return {
        str: it.str,
        x: tx,
        y: viewport.height - ty - fontSize, // convert to bottom-left origin box top offset
        width: it.width,
        height: it.height || fontSize,
        fontSize,
      } as TextItem;
    });
}

/** Group positioned items into visual text lines, top-to-bottom. */
export function itemsToLines(items: TextItem[]): { y: number; text: string; items: TextItem[] }[] {
  // item.y is distance from the TOP of the page, so ascending y = reading order.
  const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
  const lines: { y: number; text: string; items: TextItem[] }[] = [];
  for (const it of sorted) {
    const line = lines.find((l) => Math.abs(l.y - it.y) < Math.max(3, it.fontSize * 0.5));
    if (line) {
      line.items.push(it);
    } else {
      lines.push({ y: it.y, text: '', items: [it] });
    }
  }
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    let text = '';
    let prevEnd = -Infinity;
    for (const it of line.items) {
      if (text && it.x - prevEnd > 1) text += ' ';
      text += it.str;
      prevEnd = it.x + it.width;
    }
    line.text = text.trim();
  }
  return lines.filter((l) => l.text.length > 0);
}

/** Plain text of one page with line breaks. */
export async function getPageText(doc: PdfJsDoc, pageNum: number): Promise<string> {
  const items = await getPageTextItems(doc, pageNum);
  return itemsToLines(items)
    .map((l) => l.text)
    .join('\n');
}

/** Plain text of the whole document, pages separated by form feeds. */
export async function extractAllText(bytes: Uint8Array, password?: string): Promise<string[]> {
  const doc = await openPdfJs(bytes, password);
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    pages.push(await getPageText(doc, i));
  }
  return pages;
}

/** Render a page (1-based) to a canvas at the given scale. */
export async function renderPageCanvas(
  doc: PdfJsDoc,
  pageNum: number,
  scale = 2,
  rotation = 0
): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale, rotation });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality)
  );
}

/** Small JPEG thumbnail data-URLs for every page (for organize / pick UIs). */
export async function renderThumbnails(bytes: Uint8Array, maxPages = 60): Promise<string[]> {
  const doc = await openPdfJs(bytes);
  const out: string[] = [];
  const n = Math.min(doc.numPages, maxPages);
  for (let i = 1; i <= n; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = 140 / base.width;
    const canvas = await renderPageCanvas(doc, i, scale);
    out.push(canvas.toDataURL('image/jpeg', 0.72));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Page-range parsing: "1-3, 5, 8-10" -> sorted unique 1-based page numbers
// ---------------------------------------------------------------------------

export function parsePageRanges(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(',').map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, parseInt(m[1], 10));
      const b = Math.min(maxPage, parseInt(m[2], 10));
      for (let p = a; p <= b; p++) pages.add(p);
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p >= 1 && p <= maxPage) pages.add(p);
    }
  }
  return [...pages].sort((a, b) => a - b);
}
