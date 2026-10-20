// PDF conversion tools: PDF -> Word / Excel / PowerPoint / Markdown / JPG,
// images -> PDF, Word / Excel / PowerPoint -> PDF and HTML -> PDF.
// Every conversion really runs 100% in the browser (pdf.js, pdf-lib, docx,
// SheetJS, pptxgenjs, mammoth, html2canvas, jsPDF) — files are never uploaded,
// and any failure surfaces as a clear error message.
import React, { useState } from 'react';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { AlertTriangle, Check, CheckCircle2, Copy, Globe, Loader2 } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  fileToBytes,
  baseName,
  formatBytes,
  downloadBlob,
  downloadBytes,
  downloadZip,
  loadPdf,
  savePdf,
  openPdfJs,
  getPageTextItems,
  itemsToLines,
  getPageText,
  renderPageCanvas,
  canvasToBlob,
  parsePageRanges,
} from '../../../lib/pdf/core';
import type { PdfJsDoc } from '../../../lib/pdf/core';
import { PdfToolShell, OptLabel, OptInput, OptSelect } from './PdfToolShell';

// ---------------------------------------------------------------------------
// Local shared helpers
// ---------------------------------------------------------------------------

type PdfLine = ReturnType<typeof itemsToLines>[number];
type EmbeddedImage = Awaited<ReturnType<PDFDocument['embedPng']>>;
type EmbeddedFont = Awaited<ReturnType<PDFDocument['embedFont']>>;

/** Open a PDF with pdf.js, turning low-level failures into clear messages. */
async function openPdfOrThrow(bytes: Uint8Array): Promise<PdfJsDoc> {
  try {
    return await openPdfJs(bytes);
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      throw new Error(
        'This PDF is password-protected. Remove the password first (e.g. with the Unlock PDF tool), then convert it.'
      );
    }
    throw new Error('Could not read this PDF — the file appears to be corrupted or is not a valid PDF.');
  }
}

/**
 * Visual text lines of one page in true reading order (top to bottom).
 * itemsToLines groups items into lines correctly, but walks the page
 * bottom-up; since item y is the distance from the TOP of the page,
 * sorting the lines by ascending y restores reading order.
 */
async function pageLinesTopDown(doc: PdfJsDoc, pageNum: number): Promise<PdfLine[]> {
  const items = await getPageTextItems(doc, pageNum);
  return itemsToLines(items).sort((a, b) => a.y - b.y);
}

function lineFontSize(line: PdfLine): number {
  return line.items.reduce((m, it) => Math.max(m, it.fontSize), 0) || 11;
}

function countWords(text: string): number {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Render a (usually off-screen) HTML element into a downloadable A4 PDF. */
async function htmlElementToPdf(
  el: HTMLElement,
  filename: string,
  orientation: 'p' | 'l'
): Promise<void> {
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0.5) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save(filename);
}

/** Combine image files into a single PDF (also exported for reuse). */
export async function imagesToPdfBytes(
  files: File[],
  pageSize: 'fit' | 'a4' | 'letter',
  marginPt: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToBytes(file);
    const isPng = /png/i.test(file.type) || /\.png$/i.test(file.name);
    const isJpg = /jpe?g/i.test(file.type) || /\.jpe?g$/i.test(file.name);
    let image: EmbeddedImage | null = null;
    try {
      if (isPng) image = await doc.embedPng(bytes);
      else if (isJpg) image = await doc.embedJpg(bytes);
    } catch {
      image = null; // fall through to the generic decode path below
    }
    if (!image) {
      // WebP / GIF / BMP / unknown: decode with the browser and re-encode as PNG.
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        throw new Error(`"${file.name}" could not be decoded as an image. Supported inputs: PNG, JPG, WebP, GIF, BMP.`);
      }
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const pngBlob = await canvasToBlob(canvas, 'image/png');
      image = await doc.embedPng(await fileToBytes(pngBlob));
    }

    const iw = image.width;
    const ih = image.height;
    if (pageSize === 'fit') {
      const scale = Math.min(1, 842 / Math.max(iw, ih));
      const w = iw * scale;
      const h = ih * scale;
      const page = doc.addPage([w, h]);
      page.drawImage(image, { x: 0, y: 0, width: w, height: h });
    } else {
      let pw = pageSize === 'a4' ? 595 : 612;
      let ph = pageSize === 'a4' ? 842 : 792;
      if (iw > ih) {
        const tmp = pw;
        pw = ph;
        ph = tmp;
      }
      const page = doc.addPage([pw, ph]);
      const availW = Math.max(1, pw - marginPt * 2);
      const availH = Math.max(1, ph - marginPt * 2);
      const scale = Math.min(availW / iw, availH / ih);
      const w = iw * scale;
      const h = ih * scale;
      page.drawImage(image, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
  }
  return savePdf(doc);
}

// --- PowerPoint (.pptx) parsing helpers ------------------------------------

function slideNumber(path: string): number {
  return parseInt(path.match(/slide(\d+)\.xml$/)?.[1] || '0', 10);
}

function elementsByLocalName(root: Document | Element, localName: string): Element[] {
  return Array.from(root.getElementsByTagName('*')).filter((el) => el.localName === localName);
}

function parseRelationships(relsXml: string): Record<string, string> {
  const map: Record<string, string> = {};
  const tags = relsXml.match(/<Relationship\b[^>]*>/g) || [];
  for (const tag of tags) {
    const id = tag.match(/Id="([^"]+)"/)?.[1];
    const target = tag.match(/Target="([^"]+)"/)?.[1];
    if (id && target) map[id] = target;
  }
  return map;
}

function blipEmbedId(blip: Element): string | null {
  for (let i = 0; i < blip.attributes.length; i++) {
    const attr = blip.attributes[i];
    if (attr.name === 'r:embed' || attr.localName === 'embed') return attr.value;
  }
  return null;
}

function resolveZipPath(fromPath: string, target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  const parts = fromPath.split('/').slice(0, -1);
  for (const seg of target.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  return parts.join('/');
}

async function embedImageBytes(doc: PDFDocument, bytes: Uint8Array, path: string): Promise<EmbeddedImage> {
  const ext = (path.split('.').pop() || '').toLowerCase();
  if (ext === 'png') return doc.embedPng(bytes);
  if (ext === 'jpg' || ext === 'jpeg') return doc.embedJpg(bytes);
  // gif / bmp / webp / tif: decode through the browser and re-encode as PNG.
  const bitmap = await createImageBitmap(new Blob([bytes as BlobPart]));
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob = await canvasToBlob(canvas, 'image/png');
  return doc.embedPng(await fileToBytes(pngBlob));
}

/** Greedy word-wrap using real font metrics. */
function wrapText(text: string, font: EmbeddedFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

// ---------------------------------------------------------------------------
// 1. Compress PDF
// ---------------------------------------------------------------------------

type CompressMode = 'recommended' | 'extreme' | 'high-quality' | 'lossless';

export const CompressPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState<CompressMode>('recommended');

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    const base = baseName(file);

    if (mode === 'lossless') {
      let doc;
      try {
        doc = await loadPdf(bytes);
      } catch {
        throw new Error('Could not read this PDF — the file appears to be corrupted, encrypted or not a valid PDF.');
      }
      const out = await savePdf(doc);
      downloadBytes(out, `${base}-compressed.pdf`);
      return `Re-saved losslessly (structure optimized, quality and text untouched): ${formatBytes(file.size)} → ${formatBytes(out.byteLength)}.`;
    }

    const settings = {
      extreme: { scale: 1.0, quality: 0.45 },
      recommended: { scale: 1.5, quality: 0.65 },
      'high-quality': { scale: 2.0, quality: 0.82 },
    }[mode];

    const src = await openPdfOrThrow(bytes);
    const out = await PDFDocument.create();
    for (let i = 1; i <= src.numPages; i++) {
      const page = await src.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = await renderPageCanvas(src, i, settings.scale);
      const blob = await canvasToBlob(canvas, 'image/jpeg', settings.quality);
      const img = await out.embedJpg(await fileToBytes(blob));
      const newPage = out.addPage([viewport.width, viewport.height]);
      newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }
    const outBytes = await savePdf(out);
    downloadBytes(outBytes, `${base}-compressed.pdf`);
    const pct = Math.round((1 - outBytes.byteLength / file.size) * 100);
    if (pct > 0) {
      return `Compressed from ${formatBytes(file.size)} to ${formatBytes(outBytes.byteLength)} (${pct}% smaller). Note: pages were re-rendered as images, so text is no longer selectable.`;
    }
    return `Processed at the chosen quality: ${formatBytes(file.size)} → ${formatBytes(outBytes.byteLength)}. The result is not smaller — this PDF was already well optimized; try Extreme mode for a smaller file.`;
  };

  return (
    <PdfToolShell tool={tool} accept="application/pdf,.pdf" actionLabel="Compress PDF" onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>Compression level</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value as CompressMode)}>
              <option value="recommended">Recommended (balanced)</option>
              <option value="extreme">Extreme (smallest file)</option>
              <option value="high-quality">High quality</option>
              <option value="lossless">Lossless (keep text)</option>
            </OptSelect>
          </div>
          <p className="col-span-2 text-[11px] text-gray-500 dark:text-gray-400 self-end pb-1">
            Lossy modes re-render each page as a JPEG image — much smaller, but text stops being selectable.
            Lossless only re-packs the file structure and keeps everything intact.
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 2. PDF to Word (real .docx via the PDF text layer)
// ---------------------------------------------------------------------------

export const PdfToWordPro: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    const src = await openPdfOrThrow(await fileToBytes(file));
    const children: Paragraph[] = [];
    let words = 0;
    for (let i = 1; i <= src.numPages; i++) {
      const lines = await pageLinesTopDown(src, i);
      for (const line of lines) {
        if (!line.text) continue;
        words += countWords(line.text);
        const maxFont = lineFontSize(line);
        if (maxFont >= 17) {
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(line.text)] }));
        } else if (maxFont >= 13.5) {
          children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(line.text)] }));
        } else {
          children.push(new Paragraph({ children: [new TextRun(line.text)], spacing: { after: 120 } }));
        }
      }
      if (i < src.numPages) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    }
    if (!words) {
      throw new Error(
        'No extractable text found — this looks like a scanned or image-only PDF, so there is no text layer to convert.'
      );
    }
    const doc = new DocxDocument({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `${baseName(file)}.docx`);
    return `Converted ${src.numPages} page(s) (~${words.toLocaleString()} words) into an editable Word document. Headings are detected from font size; complex tables and multi-column layouts may need light cleanup.`;
  };

  return (
    <PdfToolShell tool={tool} accept="application/pdf,.pdf" actionLabel="Convert to Word (.docx)" onProcess={process} />
  );
};

// ---------------------------------------------------------------------------
// 3. PDF to Excel (one sheet per page, columns split on wide gaps)
// ---------------------------------------------------------------------------

export const PdfToExcel: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    const src = await openPdfOrThrow(await fileToBytes(file));
    const wb = XLSX.utils.book_new();
    let totalRows = 0;
    for (let i = 1; i <= src.numPages; i++) {
      const lines = await pageLinesTopDown(src, i);
      const rows: string[][] = [];
      for (const line of lines) {
        const sortedItems = [...line.items].sort((a, b) => a.x - b.x);
        const cells: string[] = [];
        let cur = '';
        let prevEnd: number | null = null;
        for (const it of sortedItems) {
          if (prevEnd !== null && it.x - prevEnd > 18) {
            cells.push(cur);
            cur = it.str;
          } else if (prevEnd !== null && it.x - prevEnd > 1) {
            cur += ` ${it.str}`;
          } else {
            cur += it.str;
          }
          prevEnd = it.x + it.width;
        }
        if (cur || cells.length === 0) cells.push(cur);
        rows.push(cells);
      }
      if (!rows.length) rows.push([]);
      totalRows += rows.filter((r) => r.some((c) => c.trim())).length;
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`.slice(0, 31));
    }
    if (!totalRows) {
      throw new Error(
        'No extractable text found — this looks like a scanned or image-only PDF, so there is nothing to put into spreadsheet cells.'
      );
    }
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    downloadBytes(out, `${baseName(file)}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return `Converted ${src.numPages} page(s) into an Excel workbook (${totalRows} text rows, one sheet per page). Columns are split where the PDF has wide horizontal gaps.`;
  };

  return (
    <PdfToolShell tool={tool} accept="application/pdf,.pdf" actionLabel="Convert to Excel (.xlsx)" onProcess={process} />
  );
};

// ---------------------------------------------------------------------------
// 4. PDF to PowerPoint (one slide per page: page image + text layer)
// ---------------------------------------------------------------------------

export const PdfToPowerPoint: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    const src = await openPdfOrThrow(await fileToBytes(file));
    const pptx = new PptxGenJS();
    pptx.defineLayout({ name: 'W', width: 13.33, height: 7.5 });
    pptx.layout = 'W';
    for (let i = 1; i <= src.numPages; i++) {
      const slide = pptx.addSlide();
      const canvas = await renderPageCanvas(src, i, 1.5);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      slide.addImage({ data: dataUrl, x: 0, y: 0, w: 13.33, h: 7.5 });
      const text = await getPageText(src, i);
      if (text.trim()) {
        slide.addText(text.slice(0, 1200), {
          x: 0.4,
          y: 5.9,
          w: 12.5,
          h: 1.4,
          fontSize: 10,
          color: '1F2937',
          fill: { color: 'FFFFFF' },
          lineSpacingMultiple: 1.1,
        });
      }
    }
    await pptx.writeFile({ fileName: `${baseName(file)}.pptx` });
    return `Created a PowerPoint deck with ${src.numPages} slide(s) — one per PDF page, each with a page snapshot and its extracted text.`;
  };

  return (
    <PdfToolShell
      tool={tool}
      accept="application/pdf,.pdf"
      actionLabel="Convert to PowerPoint (.pptx)"
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 5. PDF to Markdown (headings from font size, bullets normalized)
// ---------------------------------------------------------------------------

export const PdfToMarkdown: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [md, setMd] = useState('');
  const [copied, setCopied] = useState(false);

  const process = async (files: File[]) => {
    const file = files[0];
    const src = await openPdfOrThrow(await fileToBytes(file));
    const pageTexts: string[] = [];
    let totalWords = 0;
    for (let i = 1; i <= src.numPages; i++) {
      const lines = await pageLinesTopDown(src, i);
      const out: string[] = [];
      let prev: PdfLine | null = null;
      for (const line of lines) {
        const text = line.text;
        if (!text) continue;
        totalWords += countWords(text);
        // Large vertical gap before this line -> paragraph break.
        if (prev && line.y - prev.y > lineFontSize(prev) * 1.7) out.push('');
        const maxFont = lineFontSize(line);
        const bullet = text.match(/^([•·▪◦*-])\s+(.*)$/);
        const numbered = /^\d+[.)]\s+/.test(text);
        if (maxFont >= 17) out.push(`# ${text}`);
        else if (maxFont >= 13.5) out.push(`## ${text}`);
        else if (bullet) out.push(`- ${bullet[2]}`);
        else if (numbered) out.push(text);
        else out.push(text);
        prev = line;
      }
      pageTexts.push(out.join('\n'));
    }
    const result = pageTexts.join('\n\n---\n\n');
    if (!result.trim() || !totalWords) {
      throw new Error(
        'No extractable text found — this looks like a scanned or image-only PDF, so there is no text layer to convert to Markdown.'
      );
    }
    setMd(result);
    downloadBytes(new TextEncoder().encode(result), `${baseName(file)}.md`, 'text/markdown');
    return `Converted ${src.numPages} page(s) to Markdown (~${totalWords.toLocaleString()} words). The .md file has been downloaded — a preview is shown below.`;
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PdfToolShell tool={tool} accept="application/pdf,.pdf" actionLabel="Convert to Markdown" onProcess={process}>
      {() =>
        md ? (
          <div className="mt-4">
            <OptLabel>Markdown preview</OptLabel>
            <textarea
              readOnly
              rows={12}
              value={md}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-100"
            />
            <button
              onClick={copyMarkdown}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-orange-400 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
          </div>
        ) : null
      }
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. PDF to JPG / PNG (rendered page images, ZIP when multiple)
// ---------------------------------------------------------------------------

export const PdfToJpg: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [scale, setScale] = useState('2');
  const [pagesInput, setPagesInput] = useState('');

  const process = async (files: File[]) => {
    const file = files[0];
    const src = await openPdfOrThrow(await fileToBytes(file));
    const selected = pagesInput.trim()
      ? parsePageRanges(pagesInput, src.numPages)
      : Array.from({ length: src.numPages }, (_, i) => i + 1);
    if (!selected.length) {
      throw new Error(
        `No valid pages in "${pagesInput}" — this PDF has ${src.numPages} page(s). Use ranges like 1-3, 5.`
      );
    }
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const rendered: { n: number; blob: Blob }[] = [];
    for (const n of selected) {
      const canvas = await renderPageCanvas(src, n, Number(scale));
      const blob = await canvasToBlob(canvas, mime, 0.92);
      rendered.push({ n, blob });
    }
    const base = baseName(file);
    if (rendered.length === 1) {
      downloadBlob(rendered[0].blob, `${base}-page-${rendered[0].n}.${format}`);
    } else {
      await downloadZip(
        rendered.map((r) => ({ name: `${base}-page-${r.n}.${format}`, data: r.blob })),
        `${base}-pages.zip`
      );
    }
    return `Exported ${rendered.length} page(s) as ${format.toUpperCase()} image(s)${rendered.length > 1 ? ' (zipped)' : ''}.`;
  };

  return (
    <PdfToolShell tool={tool} accept="application/pdf,.pdf" actionLabel="Export page images" onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>Image format</OptLabel>
            <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'jpg' | 'png')}>
              <option value="jpg">JPG (smaller)</option>
              <option value="png">PNG (lossless)</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Resolution</OptLabel>
            <OptSelect value={scale} onChange={(e) => setScale(e.target.value)}>
              <option value="1">Standard (1x)</option>
              <option value="1.5">High (1.5x)</option>
              <option value="2">Very high (2x)</option>
              <option value="3">Print (3x)</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Pages (blank = all)</OptLabel>
            <OptInput
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="e.g. 1-3, 5"
            />
          </div>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. JPG / images to PDF
// ---------------------------------------------------------------------------

export const JpgToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [size, setSize] = useState<'fit' | 'a4' | 'letter'>('a4');
  const [margin, setMargin] = useState('18');

  const process = async (files: File[]) => {
    const out = await imagesToPdfBytes(files, size, Number(margin));
    downloadBytes(out, files.length === 1 ? `${baseName(files[0])}.pdf` : 'images.pdf');
    return `Created a ${files.length}-page PDF from your image(s) (${formatBytes(out.byteLength)}).`;
  };

  return (
    <PdfToolShell
      tool={tool}
      accept="image/*"
      multiple
      actionLabel="Convert images to PDF"
      dropzoneHint="PNG, JPG, WebP, GIF or BMP — pages are added in the order shown below"
      onProcess={process}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>Page size</OptLabel>
            <OptSelect value={size} onChange={(e) => setSize(e.target.value as 'fit' | 'a4' | 'letter')}>
              <option value="fit">Fit to image</option>
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Margin</OptLabel>
            <OptSelect value={margin} onChange={(e) => setMargin(e.target.value)}>
              <option value="0">No margin</option>
              <option value="18">Small (18 pt)</option>
              <option value="36">Large (36 pt)</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 self-end pb-1">
            Landscape images automatically get landscape pages on A4 / Letter.
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. Word to PDF (mammoth HTML -> rendered A4 PDF)
// ---------------------------------------------------------------------------

export const WordToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    if (file.name.toLowerCase().endsWith('.doc')) {
      throw new Error('Legacy .doc files are not supported by the in-browser converter — please save as .docx first.');
    }
    let html: string;
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
      html = result.value;
    } catch {
      throw new Error('Could not read this Word file — it appears to be corrupted or is not a valid .docx document.');
    }
    if (!html.trim()) {
      throw new Error('No readable content was found in this Word document.');
    }
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width:794px;padding:56px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#111111;background:#ffffff;position:absolute;left:-10000px;top:0;';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
    try {
      await htmlElementToPdf(wrapper, `${baseName(file)}.pdf`, 'p');
    } finally {
      wrapper.remove();
    }
    return 'Word document converted to PDF. Formatting is preserved as closely as the in-browser renderer allows.';
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".docx,.doc"
      actionLabel="Convert to PDF"
      dropzoneHint="Word .docx documents (legacy .doc is not supported — save as .docx first)"
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 9. Excel to PDF (each sheet rendered as a landscape table)
// ---------------------------------------------------------------------------

const MAX_SHEET_ROWS = 400;

export const ExcelToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array' });
    } catch {
      throw new Error('Could not read this file — it appears to be corrupted or is not a valid spreadsheet.');
    }
    if (!wb.SheetNames.length) {
      throw new Error('No sheets were found in this spreadsheet.');
    }
    let html = '';
    let truncated = false;
    let anyRows = false;
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name];
      if (!ws) continue;
      const aoa = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
      if (!aoa.length) continue;
      anyRows = true;
      if (aoa.length > MAX_SHEET_ROWS) truncated = true;
      const body = aoa
        .slice(0, MAX_SHEET_ROWS)
        .map((row, ri) => {
          const tag = ri === 0 ? 'th' : 'td';
          const cells = (Array.isArray(row) ? row : [])
            .map(
              (c) =>
                `<${tag} style="border:1px solid #cccccc;padding:4px 8px;font-size:11px;text-align:left;">${escapeHtml(
                  c == null ? '' : String(c)
                )}</${tag}>`
            )
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      html += `<h3 style="font-size:15px;margin:18px 0 8px;">${escapeHtml(name)}</h3><table style="border-collapse:collapse;width:100%;">${body}</table>`;
    }
    if (!anyRows) {
      throw new Error('No readable table data was found in this spreadsheet.');
    }
    if (truncated) {
      html += `<p style="font-size:11px;color:#666666;">Note: sheets longer than ${MAX_SHEET_ROWS} rows were trimmed to the first ${MAX_SHEET_ROWS} rows.</p>`;
    }
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width:1100px;padding:40px;font-family:Arial,sans-serif;color:#111111;background:#ffffff;position:absolute;left:-10000px;top:0;';
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
    try {
      await htmlElementToPdf(wrapper, `${baseName(file)}.pdf`, 'l');
    } finally {
      wrapper.remove();
    }
    return (
      `Converted ${wb.SheetNames.length} sheet(s) to a landscape PDF.` +
      (truncated ? ` Sheets longer than ${MAX_SHEET_ROWS} rows were trimmed.` : '')
    );
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".xlsx,.xls,.csv"
      actionLabel="Convert to PDF"
      dropzoneHint="Excel .xlsx / .xls or CSV — every sheet becomes a table in one landscape PDF"
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 10. PowerPoint to PDF (.pptx parsed directly: text + first image per slide)
// ---------------------------------------------------------------------------

export const PowerPointToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const process = async (files: File[]) => {
    const file = files[0];
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
      throw new Error('Could not read this file — is it a valid .pptx presentation?');
    }
    const slidePaths = Object.keys(zip.files)
      .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => slideNumber(a) - slideNumber(b));
    if (!slidePaths.length) {
      throw new Error('No slides found — is this a valid .pptx file?');
    }

    // Slide size from presentation.xml (EMU -> points: 1 pt = 12700 EMU).
    let slideW = 960;
    let slideH = 540;
    const presFile = zip.file('ppt/presentation.xml');
    if (presFile) {
      const presXml = await presFile.async('text');
      const m = presXml.match(/sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
      if (m) {
        slideW = parseInt(m[1], 10) / 12700;
        slideH = parseInt(m[2], 10) / 12700;
      }
    }

    const out = await PDFDocument.create();
    const font = await out.embedFont(StandardFonts.Helvetica);
    const fontBold = await out.embedFont(StandardFonts.HelveticaBold);
    const ink = rgb(0.12, 0.14, 0.18);
    const margin = 36;

    for (const slidePath of slidePaths) {
      const slideFile = zip.file(slidePath);
      if (!slideFile) continue;
      const xmlText = await slideFile.async('text');
      const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');

      // Paragraph texts (kept to printable Latin-1 so pdf-lib WinAnsi can encode them).
      const paragraphs = elementsByLocalName(xmlDoc, 'p')
        .map((p) =>
          elementsByLocalName(p, 't')
            .map((t) => t.textContent || '')
            .join('')
        )
        .map((s) => s.replace(/[^\x20-\xFF]/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean);

      // First embedded image on the slide, resolved via the slide's rels.
      let image: EmbeddedImage | null = null;
      const blips = elementsByLocalName(xmlDoc, 'blip');
      if (blips.length) {
        const relsPath = `${slidePath.replace(/\.xml$/, '')}.rels`.replace(
          'ppt/slides/',
          'ppt/slides/_rels/'
        );
        const relsFile = zip.file(relsPath);
        if (relsFile) {
          const relMap = parseRelationships(await relsFile.async('text'));
          for (const blip of blips) {
            const rid = blipEmbedId(blip);
            const target = rid ? relMap[rid] : undefined;
            if (!target) continue;
            const mediaFile = zip.file(resolveZipPath(slidePath, target));
            if (!mediaFile) continue;
            try {
              image = await embedImageBytes(
                out,
                await mediaFile.async('uint8array'),
                resolveZipPath(slidePath, target)
              );
            } catch {
              image = null;
            }
            if (image) break;
          }
        }
      }

      const page = out.addPage([slideW, slideH]);
      let imgW = 0;
      let imgH = 0;
      if (image) {
        const s = Math.min((slideW * 0.45) / image.width, (slideH * 0.6) / image.height);
        imgW = image.width * s;
        imgH = image.height * s;
        page.drawImage(image, { x: slideW - imgW - margin, y: (slideH - imgH) / 2, width: imgW, height: imgH });
      }

      const textMaxW = slideW - margin * 2 - (image ? slideW * 0.45 + 16 : 0);
      let cursorY = slideH - margin;
      paragraphs.forEach((para, idx) => {
        const isTitle = idx === 0;
        const size = isTitle ? 26 : 13;
        const fnt = isTitle ? fontBold : font;
        for (const lineText of wrapText(para, fnt, size, textMaxW)) {
          cursorY -= size;
          if (cursorY < margin) break;
          page.drawText(lineText, { x: margin, y: cursorY, size, font: fnt, color: ink });
          cursorY -= size * 0.45;
        }
        cursorY -= isTitle ? 14 : 8;
      });
    }

    const outBytes = await savePdf(out);
    downloadBytes(outBytes, `${baseName(file)}.pdf`);
    return `Converted ${slidePaths.length} slide(s) to PDF. Slide text and the first image per slide are preserved; animations and layered design elements are flattened.`;
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
      actionLabel="Convert to PDF"
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 11. HTML to PDF (URL fetch with proxy fallback, or pasted HTML)
// ---------------------------------------------------------------------------

export const HtmlToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const convert = async () => {
    if (busy) return;
    setBusy(true);
    setStatus('idle');
    setMessage('');
    try {
      let content = html.trim();
      if (!content) {
        const target = url.trim();
        if (!target) throw new Error('Enter a page URL above, or paste the page HTML instead.');
        let fetched: string | null = null;
        try {
          const r = await fetch(target);
          if (r.ok) fetched = await r.text();
        } catch {
          fetched = null;
        }
        if (!fetched) {
          try {
            const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`);
            if (r.ok) fetched = await r.text();
          } catch {
            fetched = null;
          }
        }
        if (!fetched) {
          throw new Error('Could not fetch that URL (the site blocks cross-origin reads). Paste the page HTML instead.');
        }
        content = fetched;
      }

      let bodyHtml = content;
      if (/<html[\s>]/i.test(content) || /<body[\s>]/i.test(content)) {
        const parsed = new DOMParser().parseFromString(content, 'text/html');
        bodyHtml = parsed.body ? parsed.body.innerHTML : content;
      }
      if (!bodyHtml.trim()) {
        throw new Error('Nothing renderable was found in that content.');
      }

      const wrapper = document.createElement('div');
      wrapper.style.cssText =
        'width:794px;padding:40px;background:#ffffff;color:#111111;font-family:Arial,sans-serif;position:absolute;left:-10000px;top:0;';
      wrapper.innerHTML = bodyHtml;
      document.body.appendChild(wrapper);
      try {
        await htmlElementToPdf(wrapper, 'webpage.pdf', orientation);
      } finally {
        wrapper.remove();
      }
      setStatus('done');
      setMessage('Your PDF has been downloaded.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Conversion failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PdfToolShell tool={tool} accept="" hideDropzone>
      {() => (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
            <div className="col-span-2">
              <OptLabel>Page URL</OptLabel>
              <OptInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                type="url"
              />
            </div>
            <div>
              <OptLabel>Orientation</OptLabel>
              <OptSelect value={orientation} onChange={(e) => setOrientation(e.target.value as 'p' | 'l')}>
                <option value="p">Portrait (A4)</option>
                <option value="l">Landscape (A4)</option>
              </OptSelect>
            </div>
          </div>

          <div className="mt-4">
            <OptLabel>…or paste HTML</OptLabel>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={6}
              placeholder="<h1>My page</h1><p>Paste any HTML here — it takes priority over the URL.</p>"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-gray-100"
            />
          </div>

          <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
            Note: scripts and some external images may not render in the in-browser converter.
          </p>

          <button
            onClick={convert}
            disabled={busy}
            className={`w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              busy
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer'
            }`}
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span>{busy ? 'Converting…' : 'Convert to PDF'}</span>
          </button>

          {status === 'done' && (
            <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>
      )}
    </PdfToolShell>
  );
};
