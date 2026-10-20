import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import UTIF from 'utif';
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
  extractAllText,
  renderPageCanvas,
  canvasToBlob,
  parsePageRanges,
} from '../../../lib/pdf/core';
import type { PdfJsDoc } from '../../../lib/pdf/core';
import { PdfToolShell, OptLabel, OptInput, OptSelect } from './PdfToolShell';
import { htmlElementToPdf } from './PdfConvertTools';
import type { ToolItem } from '../../../lib/tools-data';
import { COMMON, useLang, useStrings } from '../../../lib/LangContext';
import { PDF_STRINGS, pluralize } from '../../../lib/strings/pdf';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const BTN =
  'w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hexToRgb(hex: string): ReturnType<typeof rgb> {
  const m = hex.replace('#', '');
  const n = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function makeUuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

interface PctRect {
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
}

// ---------------------------------------------------------------------------
// 1. Extract PDF Images (raw embedded images via pdf.js operator lists)
// ---------------------------------------------------------------------------

function getObjAsync(page: any, id: string): Promise<any> {
  try {
    const v = page.objs.get(id);
    if (v) return Promise.resolve(v);
  } catch {
    /* not resolved yet — fall through to callback form */
  }
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, 4000);
    try {
      page.objs.get(id, (v: any) => {
        if (!done) {
          done = true;
          clearTimeout(timer);
          resolve(v ?? null);
        }
      });
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

async function imageObjToPngBlob(img: any): Promise<Blob | null> {
  if (!img) return null;
  // ImageBitmap fast path (modern pdf.js may deliver decoded bitmaps)
  if (img.bitmap && (img.bitmap.width > 0 || img.width)) {
    const w = img.width || img.bitmap.width;
    const h = img.height || img.bitmap.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img.bitmap, 0, 0);
    return canvasToBlob(canvas, 'image/png');
  }
  // Native passthrough (e.g. JPEG XObjects exposed as a URL)
  if (typeof img.src === 'string') {
    try {
      const el = new Image();
      await new Promise<void>((res, rej) => {
        el.onload = () => res();
        el.onerror = () => rej(new Error('img load failed'));
        el.src = img.src;
      });
      const canvas = document.createElement('canvas');
      canvas.width = el.naturalWidth;
      canvas.height = el.naturalHeight;
      canvas.getContext('2d')!.drawImage(el, 0, 0);
      return canvasToBlob(canvas, 'image/png');
    } catch {
      return null;
    }
  }
  const w: number = img.width;
  const h: number = img.height;
  const data: Uint8ClampedArray | Uint8Array | undefined = img.data;
  if (!w || !h || !data) return null;
  let kind: number | undefined = img.kind;
  if (kind === undefined) {
    if (data.length >= w * h * 4) kind = 3;
    else if (data.length >= w * h * 3) kind = 2;
    else return null;
  }
  const rgba = new Uint8ClampedArray(w * h * 4);
  if (kind === 3) {
    rgba.set(data.subarray(0, w * h * 4));
  } else if (kind === 2) {
    for (let i = 0; i < w * h; i++) {
      rgba[i * 4] = data[i * 3];
      rgba[i * 4 + 1] = data[i * 3 + 1];
      rgba[i * 4 + 2] = data[i * 3 + 2];
      rgba[i * 4 + 3] = 255;
    }
  } else if (kind === 1) {
    const stride = Math.ceil(w / 8);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const byte = data[y * stride + (x >> 3)] ?? 0;
        const bit = (byte >> (7 - (x & 7))) & 1;
        const gray = bit ? 255 : 0;
        const o = (y * w + x) * 4;
        rgba[o] = gray;
        rgba[o + 1] = gray;
        rgba[o + 2] = gray;
        rgba[o + 3] = 255;
      }
    }
  } else {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.putImageData(new ImageData(rgba, w, h), 0, 0);
  return canvasToBlob(canvas, 'image/png');
}

export const ExtractPdfImages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const OPS = pdfjsLib.OPS as any;
    const seenIds = new Set<string>();
    const blobs: Blob[] = [];
    let skipped = 0;
    for (let n = 1; n <= doc.numPages; n++) {
      const page: any = await doc.getPage(n);
      const opList = await page.getOperatorList();
      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        const isXObject = fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject;
        const isInline = fn === OPS.paintInlineImageXObject;
        if (!isXObject && !isInline) continue;
        let imgObj: any = null;
        if (isInline) {
          imgObj = opList.argsArray[i]?.[0];
        } else {
          const objId = opList.argsArray[i]?.[0];
          if (typeof objId !== 'string') continue;
          if (seenIds.has(objId)) continue; // extract each unique image once
          seenIds.add(objId);
          imgObj = await getObjAsync(page, objId);
        }
        const blob = await imageObjToPngBlob(imgObj).catch(() => null);
        if (blob) blobs.push(blob);
        else skipped++;
      }
    }
    if (!blobs.length) {
      throw new Error(s('errNoImages'));
    }
    const base = baseName(file);
    if (blobs.length === 1) {
      downloadBlob(blobs[0], `${base}-image-1.png`);
    } else {
      await downloadZip(
        blobs.map((b, i) => ({ name: `image-${i + 1}.png`, data: b })),
        `${base}-images.zip`
      );
    }
    return s('extractImagesResult2').replace('{count}', String(blobs.length)).replace('{pages}', String(doc.numPages)) +
      (skipped ? s('extractImagesSkipped').replace('{count}', String(skipped)) : '');
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".pdf,application/pdf"
      actionLabel={s('extractImagesActionCaps')}
      dropzoneHint={s('extractImagesHint2')}
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 2. Grayscale PDF
// ---------------------------------------------------------------------------

export const GrayscalePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [scale, setScale] = useState('1.5');
  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const scaleNum = parseFloat(scale);
    const out = await PDFDocument.create();
    for (let n = 1; n <= doc.numPages; n++) {
      const src = await renderPageCanvas(doc, n, scaleNum);
      const gray = document.createElement('canvas');
      gray.width = src.width;
      gray.height = src.height;
      const gctx = gray.getContext('2d')!;
      gctx.fillStyle = '#ffffff';
      gctx.fillRect(0, 0, gray.width, gray.height);
      if (typeof (gctx as any).filter === 'string') {
        gctx.filter = 'grayscale(1)';
        gctx.drawImage(src, 0, 0);
        gctx.filter = 'none';
      } else {
        // Manual per-pixel fallback (older Safari has no canvas filter)
        gctx.drawImage(src, 0, 0);
        const imgData = gctx.getImageData(0, 0, gray.width, gray.height);
        const px = imgData.data;
        for (let i = 0; i < px.length; i += 4) {
          const g = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
          px[i] = g;
          px[i + 1] = g;
          px[i + 2] = g;
        }
        gctx.putImageData(imgData, 0, 0);
      }
      const blob = await canvasToBlob(gray, 'image/jpeg', 0.9);
      const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      const page = await doc.getPage(n);
      const vp = page.getViewport({ scale: 1 });
      const outPage = out.addPage([vp.width, vp.height]);
      outPage.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
    }
    downloadBytes(await savePdf(out), `${baseName(file)}-grayscale.pdf`);
    return s('grayscaleResult2').replace('{pages}', String(doc.numPages));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('grayscaleActionCaps')} onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{c('quality')}</OptLabel>
            <OptSelect value={scale} onChange={(e) => setScale(e.target.value)}>
              <option value="1.5">{s('grayScaleStandard')}</option>
              <option value="2.5">{s('grayScaleHigh')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('grayscaleNote')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Deskew PDF (projection-profile angle detection + correction)
// ---------------------------------------------------------------------------

function rotateCanvas(src: HTMLCanvasElement, angleDeg: number): HTMLCanvasElement {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const newW = Math.ceil(src.width * cos + src.height * sin);
  const newH = Math.ceil(src.width * sin + src.height * cos);
  const out = document.createElement('canvas');
  out.width = newW;
  out.height = newH;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, newW, newH);
  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return out;
}

export const DeskewPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [docObj, setDocObj] = useState<PdfJsDoc | null>(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);

  const loadFile = async (files: File[]) => {
    setBytes(null);
    setDocObj(null);
    setProgress('');
    if (!files.length) return;
    try {
      const b = await fileToBytes(files[0]);
      const d = await openPdfJs(b);
      setBytes(b);
      setDocObj(d);
      setFileName(files[0].name);
    } catch {
      setProgress(s('readError'));
    }
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" onFilesChange={(files) => void loadFile(files)}>
      {(ctx) => {
        const run = async () => {
          if (!bytes || !docObj) {
            ctx.setStatus('error', s('errChoosePdfFirst'));
            return;
          }
          setBusy(true);
          ctx.setStatus('working', s('deskewDetecting'));
          try {
            // --- build small grayscale analysis image of page 1 ---
            const page1 = await renderPageCanvas(docObj, 1, 1);
            const AW = 400;
            const AH = Math.max(10, Math.round((AW * page1.height) / page1.width));
            const aCanvas = document.createElement('canvas');
            aCanvas.width = AW;
            aCanvas.height = AH;
            const actx = aCanvas.getContext('2d')!;
            actx.fillStyle = '#ffffff';
            actx.fillRect(0, 0, AW, AH);
            actx.drawImage(page1, 0, 0, AW, AH);

            const score = (angle: number): number => {
              const rot = rotateCanvas(aCanvas, angle);
              const rctx = rot.getContext('2d')!;
              const data = rctx.getImageData(0, 0, rot.width, rot.height).data;
              const rowSums = new Float64Array(rot.height);
              for (let y = 0; y < rot.height; y++) {
                let sum = 0;
                const rowOff = y * rot.width * 4;
                for (let x = 0; x < rot.width; x++) {
                  const o = rowOff + x * 4;
                  const lum = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
                  sum += 255 - lum;
                }
                rowSums[y] = sum;
              }
              const mean = rowSums.reduce((a, b) => a + b, 0) / rowSums.length;
              let variance = 0;
              for (const v of rowSums) variance += (v - mean) * (v - mean);
              return variance / rowSums.length;
            };

            let best = 0;
            let bestScore = score(0);
            for (let a = -5; a <= 5.001; a += 0.5) {
              const s = score(a);
              if (s > bestScore) {
                bestScore = s;
                best = a;
              }
            }
            for (let a = best - 0.5; a <= best + 0.501; a += 0.25) {
              const s = score(a);
              if (s > bestScore) {
                bestScore = s;
                best = a;
              }
            }
            const angle = Math.round(best * 100) / 100;
            if (Math.abs(angle) < 0.25) {
              ctx.setStatus('done', s('deskewStraight'));
              setProgress('');
              setBusy(false);
              return;
            }

            // --- apply the same rotation to every page at high quality ---
            const out = await PDFDocument.create();
            for (let n = 1; n <= docObj.numPages; n++) {
              setProgress(s('deskewProgress').replace('{n}', String(n)).replace('{total}', String(docObj.numPages)));
              ctx.setStatus('working', s('deskewProgress').replace('{n}', String(n)).replace('{total}', String(docObj.numPages)));
              const src = await renderPageCanvas(docObj, n, 2.5);
              const fixed = rotateCanvas(src, angle);
              const blob = await canvasToBlob(fixed, 'image/jpeg', 0.92);
              const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
              const page = await docObj.getPage(n);
              const vp = page.getViewport({ scale: 1 });
              const outPage = out.addPage([vp.width, vp.height]);
              outPage.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
            }
            downloadBytes(await savePdf(out), `${baseName(fileName)}-deskewed.pdf`);
            setProgress('');
            ctx.setStatus(
              'done',
              s('deskewDone').replace('{angle}', String(angle)).replace('{pages}', String(docObj.numPages))
            );
          } catch (err: any) {
            ctx.setStatus('error', err?.message || s('errDeskewFailed'));
            setProgress('');
          } finally {
            setBusy(false);
          }
        };

        return (
          <div className="mt-4">
            <p className="text-[11px] text-gray-500">
              {s('deskewIntro')}
            </p>
            {progress && <p className="text-[11px] text-gray-500 mt-2">{progress}</p>}
            <button onClick={() => void run()} disabled={!bytes || busy} className={BTN}>
              {busy ? c('working') : s('deskewBtn')}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 4. Rename PDFs by content (first line of text becomes the file name)
// ---------------------------------------------------------------------------

export const RenamePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [mapping, setMapping] = useState<{ from: string; to: string }[]>([]);

  const process = async (files: File[]) => {
    const used = new Set<string>();
    const results: { from: string; to: string; bytes: Uint8Array }[] = [];
    for (const file of files) {
      const bytes = await fileToBytes(file);
      const original = baseName(file);
      let candidate = '';
      try {
        const pages = await extractAllText(bytes);
        for (const pageText of pages) {
          const line = pageText
            .split('\n')
            .map((l) => l.trim())
            .find((l) => l.length >= 3);
          if (line) {
            candidate = line;
            break;
          }
        }
      } catch {
        candidate = '';
      }
      let clean = candidate
        .replace(/[\\/:*?"<>|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 70)
        .trim();
      if (clean.length < 3) clean = original;
      let name = clean;
      let k = 2;
      while (used.has(name.toLowerCase())) {
        name = `${clean} (${k})`;
        k++;
      }
      used.add(name.toLowerCase());
      results.push({ from: file.name, to: `${name}.pdf`, bytes });
    }
    setMapping(results.map((r) => ({ from: r.from, to: r.to })));
    if (results.length === 1) {
      downloadBytes(results[0].bytes, results[0].to);
    } else {
      await downloadZip(
        results.map((r) => ({ name: r.to, data: r.bytes })),
        'renamed-pdfs.zip'
      );
    }
    return s('renameResult2').replace('{count}', String(results.length));
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".pdf,application/pdf"
      multiple
      actionLabel={s('renameAction2')}
      dropzoneHint={s('renameHint2')}
      onProcess={process}
    >
      {() =>
        mapping.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-start">
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('originalName')}</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('renameNewName')}</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((m, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300 break-all">{m.from}</td>
                    <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white break-all">{m.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null
      }
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 5. PDF to EPUB
// ---------------------------------------------------------------------------

export const PdfToEpub: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [perChapter, setPerChapter] = useState('5');

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    let title = baseName(file);
    try {
      const loaded = await loadPdf(bytes);
      title = loaded.getTitle() || title;
    } catch {
      /* title falls back to the file name */
    }
    const groupSize = parseInt(perChapter, 10) || 5;
    const pageTexts: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) pageTexts.push(await getPageText(doc, n));
    if (!pageTexts.some((t) => t.trim())) {
      throw new Error(s('epubNoText2'));
    }
    const chapters: string[] = [];
    for (let start = 0; start < pageTexts.length; start += groupSize) {
      const slice = pageTexts.slice(start, start + groupSize);
      const chNum = chapters.length + 1;
      const body = slice
        .map((t, idx) => {
          const paras = t
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((l) => `<p>${escapeHtml(l)}</p>`)
            .join('\n');
          return (idx > 0 ? '<hr/>\n' : '') + (paras || `<p><em>${s('blankPageMarker')}</em></p>`);
        })
        .join('\n');
      chapters.push(
        `<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${s('chapterWord')} ${chNum} — ${escapeHtml(title)}</title></head><body><h1>${s('chapterWord')} ${chNum}</h1>\n${body}\n</body></html>`
      );
    }

    const uid = `urn:uuid:${makeUuid()}`;
    const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const manifestItems = chapters
      .map((_, i) => `    <item id="chapter-${i + 1}" href="chapter-${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
      .join('\n');
    const spineItems = chapters.map((_, i) => `    <itemref idref="chapter-${i + 1}"/>`).join('\n');
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${uid}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>${lang}</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
${manifestItems}
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
    const nav = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>${s('contentsWord')}</title></head><body><nav epub:type="toc"><h1>${s('contentsWord')}</h1><ol>${chapters
      .map((_, i) => `<li><a href="chapter-${i + 1}.xhtml">${s('chapterWord')} ${i + 1}</a></li>`)
      .join('')}</ol></nav></body></html>`;
    const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.file('META-INF/container.xml', container);
    zip.file('OEBPS/content.opf', opf);
    zip.file('OEBPS/nav.xhtml', nav);
    chapters.forEach((c, i) => zip.file(`OEBPS/chapter-${i + 1}.xhtml`, c));
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    downloadBlob(blob, `${baseName(file)}.epub`);
    return s('epubResult2').replace('{chapters}', String(chapters.length)).replace('{pages}', String(doc.numPages)).replace('{title}', title);
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('epubAction')} onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('pagesPerChapter')}</OptLabel>
            <OptSelect value={perChapter} onChange={(e) => setPerChapter(e.target.value)}>
              <option value="1">1 {s('wordPage')}</option>
              <option value="5">5 {s('wordPages')}</option>
              <option value="10">10 {s('wordPages')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('epubNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. EPUB to PDF
// ---------------------------------------------------------------------------

function resolveEpubPath(baseDir: string, href: string): string {
  const clean = href.split('#')[0].split('?')[0];
  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    /* keep raw */
  }
  const parts = (baseDir ? baseDir.split('/') : []).concat(decoded.split('/'));
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

export const EpubToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const process = async (files: File[]) => {
    const file = files[0];
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
      throw new Error(s('errEpubCorrupt'));
    }
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) throw new Error(s('errEpubNoContainer'));
    const containerXml = await containerFile.async('string');
    const rootPath = containerXml.match(/full-path="([^"]+)"/)?.[1];
    if (!rootPath) throw new Error(s('errEpubNoPackage'));
    const opfFile = zip.file(rootPath);
    if (!opfFile) throw new Error(s('errEpubNoOpf'));
    const opf = await opfFile.async('string');
    const baseDir = rootPath.includes('/') ? rootPath.slice(0, rootPath.lastIndexOf('/')) : '';

    const manifest = new Map<string, string>();
    for (const tag of opf.match(/<item\s[^>]*>/g) || []) {
      const id = tag.match(/id="([^"]+)"/)?.[1];
      const href = tag.match(/href="([^"]+)"/)?.[1];
      if (id && href) manifest.set(id, href);
    }
    const spineIds = [...opf.matchAll(/<itemref\s[^>]*idref="([^"]+)"/g)].map((m) => m[1]);
    if (!spineIds.length) throw new Error(s('errEpubEmptySpine'));

    const chapterHtmls: string[] = [];
    for (const idref of spineIds) {
      const href = manifest.get(idref);
      if (!href) continue;
      const path = resolveEpubPath(baseDir, href);
      const entry = zip.file(path);
      if (!entry) continue;
      const content = await entry.async('string');
      let body = content;
      try {
        const parsed = new DOMParser().parseFromString(content, 'text/html');
        if (parsed.body && parsed.body.innerHTML.trim()) body = parsed.body.innerHTML;
        else body = content.replace(/<[^>]+>/g, ' ');
      } catch {
        body = content.replace(/<[^>]+>/g, ' ');
      }
      chapterHtmls.push(body.replace(/<img[^>]*>/gi, ''));
    }
    if (!chapterHtmls.length) throw new Error(s('epubNoChapters'));

    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width:794px;padding:56px;font-family:Georgia,serif;font-size:16px;line-height:1.65;color:#111111;background:#ffffff;position:absolute;left:-10000px;top:0;';
    wrapper.innerHTML = chapterHtmls.join('<div style="page-break-before: always"></div>');
    document.body.appendChild(wrapper);
    try {
      await htmlElementToPdf(wrapper, `${baseName(file)}.pdf`, 'p');
    } finally {
      wrapper.remove();
    }
    return s('epubPdfResult2').replace('{chapters}', String(chapterHtmls.length));
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".epub,application/epub+zip"
      actionLabel={s('convertToPdfAction')}
      dropzoneHint={s('epubPdfHint2')}
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 7. PDF to CSV
// ---------------------------------------------------------------------------

export const PdfToCsv: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [preview, setPreview] = useState('');

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const rows: string[][] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const lines = itemsToLines(await getPageTextItems(doc, n));
      for (const line of lines) {
        const items = [...line.items].sort((a, b) => a.x - b.x);
        const cells: string[] = [];
        let current = '';
        let prevEnd = -Infinity;
        for (const it of items) {
          if (current && it.x - prevEnd > 18) {
            cells.push(current);
            current = it.str;
          } else {
            if (current && it.x - prevEnd > 1) current += ' ';
            current += it.str;
          }
          prevEnd = it.x + it.width;
        }
        if (current) cells.push(current);
        if (cells.length) rows.push(cells);
      }
    }
    if (!rows.length) {
      throw new Error(s('errCsvNoRows'));
    }
    const csvCell = (c: string) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
    const csv = rows.map((r) => r.map(csvCell).join(',')).join('\n');
    setPreview(rows.slice(0, 40).map((r) => r.map(csvCell).join(',')).join('\n'));
    downloadBytes(new TextEncoder().encode(csv), `${baseName(file)}.csv`, 'text/csv;charset=utf-8');
    return s('csvResult2').replace('{rows}', String(rows.length)).replace('{pages}', String(doc.numPages));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('csvAction')} onProcess={process}>
      {() =>
        preview ? (
          <div className="mt-4">
            <OptLabel>{s('csvPreviewLabel')}</OptLabel>
            <pre className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs p-3 font-mono overflow-x-auto max-h-64 overflow-y-auto text-gray-800 dark:text-gray-100">
              {preview}
            </pre>
          </div>
        ) : null
      }
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. PDF to TIFF (real multi-page uncompressed TIFF writer)
// ---------------------------------------------------------------------------

interface TiffPageData {
  width: number;
  height: number;
  rgba: Uint8ClampedArray;
}

function encodeTiff(pages: TiffPageData[], dpi: number): ArrayBuffer {
  const even = (n: number) => (n % 2 ? n + 1 : n);
  // Pass 1: compute offsets
  const pixelOffsets: number[] = [];
  let cursor = 8;
  for (const p of pages) {
    pixelOffsets.push(cursor);
    cursor += even(p.width * p.height * 3);
  }
  const IFD_SIZE = 2 + 12 * 12 + 4; // count + 12 entries + next-offset = 150
  const EXTRA_SIZE = 24; // bitsPerSample[3] (6B, padded) + XRes (8B) + YRes (8B)
  const ifdOffsets: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    ifdOffsets.push(cursor);
    cursor += IFD_SIZE + EXTRA_SIZE;
  }
  const total = cursor;
  const buffer = new ArrayBuffer(total);
  const u8 = new Uint8Array(buffer);
  const dv = new DataView(buffer);

  // Header
  u8[0] = 0x49; // 'I'
  u8[1] = 0x49;
  dv.setUint16(2, 42, true);
  dv.setUint32(4, pages.length ? ifdOffsets[0] : 0, true);

  pages.forEach((p, idx) => {
    // Pixel data (RGB, alpha composited over white)
    const pxOff = pixelOffsets[idx];
    let o = pxOff;
    for (let i = 0; i < p.width * p.height; i++) {
      const a = p.rgba[i * 4 + 3] / 255;
      u8[o++] = Math.round(p.rgba[i * 4] * a + 255 * (1 - a));
      u8[o++] = Math.round(p.rgba[i * 4 + 1] * a + 255 * (1 - a));
      u8[o++] = Math.round(p.rgba[i * 4 + 2] * a + 255 * (1 - a));
    }
    // Extra data right after the IFD
    const ifdOff = ifdOffsets[idx];
    const extraOff = ifdOff + IFD_SIZE;
    dv.setUint16(extraOff, 8, true);
    dv.setUint16(extraOff + 2, 8, true);
    dv.setUint16(extraOff + 4, 8, true);
    dv.setUint32(extraOff + 8, dpi, true);
    dv.setUint32(extraOff + 12, 1, true);
    dv.setUint32(extraOff + 16, dpi, true);
    dv.setUint32(extraOff + 20, 1, true);
    // IFD
    const entries: [number, number, number, number][] = [
      [256, 4, 1, p.width], // ImageWidth LONG
      [257, 4, 1, p.height], // ImageLength LONG
      [258, 3, 3, extraOff], // BitsPerSample SHORT x3 -> offset
      [259, 3, 1, 1], // Compression = none
      [262, 3, 1, 2], // Photometric = RGB
      [273, 4, 1, pxOff], // StripOffsets
      [277, 3, 1, 3], // SamplesPerPixel
      [278, 4, 1, p.height], // RowsPerStrip
      [279, 4, 1, p.width * p.height * 3], // StripByteCounts
      [282, 5, 1, extraOff + 8], // XResolution RATIONAL -> offset
      [283, 5, 1, extraOff + 16], // YResolution RATIONAL -> offset
      [296, 3, 1, 2], // ResolutionUnit = inch
    ];
    dv.setUint16(ifdOff, entries.length, true);
    entries.forEach(([tag, type, count, value], i) => {
      const e = ifdOff + 2 + i * 12;
      dv.setUint16(e, tag, true);
      dv.setUint16(e + 2, type, true);
      dv.setUint32(e + 4, count, true);
      if (type === 3 && count === 1) dv.setUint16(e + 8, value, true);
      else dv.setUint32(e + 8, value, true);
    });
    dv.setUint32(ifdOff + 2 + entries.length * 12, idx + 1 < pages.length ? ifdOffsets[idx + 1] : 0, true);
  });
  return buffer;
}

export const PdfToTiff: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [dpi, setDpi] = useState('150');

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const dpiNum = parseInt(dpi, 10) || 150;
    const scale = dpiNum / 72;
    const pages: TiffPageData[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const canvas = await renderPageCanvas(doc, n, scale);
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      pages.push({ width: canvas.width, height: canvas.height, rgba: imgData.data });
    }
    const buffer = encodeTiff(pages, dpiNum);
    downloadBytes(buffer, `${baseName(file)}.tiff`, 'image/tiff');
    return s('tiffResult2').replace('{count}', String(pages.length)).replace('{dpi}', String(dpiNum)).replace('{size}', formatBytes(buffer.byteLength));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('tiffAction')} onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('resolutionLabel')}</OptLabel>
            <OptSelect value={dpi} onChange={(e) => setDpi(e.target.value)}>
              <option value="150">150 DPI</option>
              <option value="300">{s('dpi300Print')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('tiffNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 9. TIFF to PDF
// ---------------------------------------------------------------------------

export const TiffToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const process = async (files: File[]) => {
    const out = await PDFDocument.create();
    let pageCount = 0;
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      let ifds: any[];
      try {
        ifds = UTIF.decode(buffer);
      } catch {
        throw new Error(s('errTiffDecode').replace('{name}', file.name));
      }
      if (!ifds?.length) throw new Error(s('errTiffNoPages').replace('{name}', file.name));
      for (const ifd of ifds) {
        try {
          UTIF.decodeImage(buffer, ifd, ifds);
        } catch {
          continue;
        }
        const w: number = ifd.width ?? ifd.t256?.[0];
        const h: number = ifd.height ?? ifd.t257?.[0];
        if (!w || !h) continue;
        const rgba = UTIF.toRGBA8(ifd);
        if (!rgba || rgba.length < w * h * 4) continue;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        const clamped = new Uint8ClampedArray(w * h * 4);
        clamped.set(rgba.subarray(0, w * h * 4));
        ctx.putImageData(new ImageData(clamped, w, h), 0, 0);
        const blob = await canvasToBlob(canvas, 'image/png');
        const img = await out.embedPng(new Uint8Array(await blob.arrayBuffer()));
        const fit = Math.min(1, 842 / Math.max(w, h));
        const page = out.addPage([w * fit, h * fit]);
        page.drawImage(img, { x: 0, y: 0, width: w * fit, height: h * fit });
        pageCount++;
      }
    }
    if (!pageCount) throw new Error(s('errTiffNoneConverted'));
    downloadBytes(await savePdf(out), files.length === 1 ? `${baseName(files[0])}.pdf` : 'tiff.pdf');
    return s('tiffPdfResult2').replace('{count}', String(pageCount));
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".tif,.tiff,image/tiff"
      multiple
      actionLabel={s('convertToPdfAction')}
      dropzoneHint={s('tiffPdfHint2')}
      onProcess={process}
    />
  );
};

// ---------------------------------------------------------------------------
// 10. PDF Reader (in-browser viewer)
// ---------------------------------------------------------------------------

export const PdfReader: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('');
  const [docObj, setDocObj] = useState<PdfJsDoc | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [zoom, setZoom] = useState('1');
  const [rendering, setRendering] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadFile = async (files: File[]) => {
    setBytes(null);
    setDocObj(null);
    setImages([]);
    setLoadError('');
    if (!files.length) return;
    try {
      const b = await fileToBytes(files[0]);
      const d = await openPdfJs(b);
      setBytes(b);
      setDocObj(d);
      setFileName(files[0].name);
    } catch {
      setLoadError(s('errOpenPdf'));
    }
  };

  useEffect(() => {
    if (!docObj) return;
    let cancelled = false;
    (async () => {
      setRendering(true);
      const urls: string[] = [];
      const scale = parseFloat(zoom) * 1.5;
      for (let n = 1; n <= docObj.numPages; n++) {
        if (cancelled) return;
        const canvas = await renderPageCanvas(docObj, n, scale);
        urls.push(canvas.toDataURL('image/jpeg', 0.85));
        if (!cancelled) setImages([...urls]);
      }
      if (!cancelled) setRendering(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [docObj, zoom]);

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" onFilesChange={(files) => void loadFile(files)}>
      {(ctx) => (
        <div className="mt-4">
          {loadError && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{loadError}</p>}
          {docObj ? (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate max-w-[220px]">
                  {fileName}
                </span>
                <span className="text-[11px] text-gray-500">
                  {pluralize(lang, docObj.numPages, 'wordPage', 'wordPages')}
                  {bytes ? ` · ${formatBytes(bytes.length)}` : ''}
                </span>
                <div className="w-32">
                  <OptSelect value={zoom} onChange={(e) => setZoom(e.target.value)} aria-label={s('zoomLabel')}>
                    <option value="0.75">{s('zoomOpt').replace('{pct}', '75')}</option>
                    <option value="1">{s('zoomOpt').replace('{pct}', '100')}</option>
                    <option value="1.25">{s('zoomOpt').replace('{pct}', '125')}</option>
                    <option value="1.5">{s('zoomOpt').replace('{pct}', '150')}</option>
                    <option value="2">{s('zoomOpt').replace('{pct}', '200')}</option>
                  </OptSelect>
                </div>
                <button
                  onClick={() => bytes && downloadBytes(bytes, fileName || 'document.pdf')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                >
                  {s('downloadOriginal')}
                </button>
                {rendering && <span className="text-[11px] text-gray-500">{s('renderingPages')}</span>}
              </div>
              <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-gray-200/70 dark:bg-gray-800 p-4 space-y-5">
                {images.map((src, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <img
                      src={src}
                      alt={`${c('page')} ${i + 1}`}
                      className="max-w-full shadow-lg bg-white"
                      style={{ width: `${Math.round(parseFloat(zoom) * 100)}%`, maxWidth: '900px' }}
                    />
                    <span className="text-[11px] font-semibold text-gray-500 mt-1.5">{c('page')} {i + 1}</span>
                  </div>
                ))}
                {!images.length && !rendering && (
                  <p className="text-xs text-gray-500 text-center py-6">{s('noPagesDisplay')}</p>
                )}
              </div>
            </>
          ) : (
            !loadError && (
              <p className="text-[11px] text-gray-500">
                {s('readerHint2')}
              </p>
            )
          )}
          {ctx.status === 'error' && null}
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 11. PDF to Text (with stats, preview, copy)
// ---------------------------------------------------------------------------

export const PdfToText: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [text, setText] = useState('');
  const [stats, setStats] = useState<{ pages: number; words: number; chars: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let pages: string[];
    try {
      pages = await extractAllText(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const full = pages.map((t, i) => `----- ${c('page')} ${i + 1} -----\n${t}`).join('\n\n');
    setText(full);
    setStats({
      pages: pages.length,
      words: full.split(/\s+/).filter(Boolean).length,
      chars: full.length,
    });
    setCopied(false);
    downloadBytes(new TextEncoder().encode(full), `${baseName(file)}.txt`, 'text/plain;charset=utf-8');
    return s('textResult2').replace('{pages}', String(pages.length));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('textExtractActionCaps')} onProcess={process}>
      {() =>
        text ? (
          <div className="mt-4">
            {stats && (
              <p className="text-[11px] text-gray-500 mb-2">
                {s('statsLine').replace('{pages}', String(stats.pages)).replace('{words}', stats.words.toLocaleString()).replace('{chars}', stats.chars.toLocaleString())}
              </p>
            )}
            <textarea
              readOnly
              rows={12}
              value={text}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs p-3 font-mono text-gray-800 dark:text-gray-100"
            />
            <button
              onClick={() => {
                void navigator.clipboard.writeText(text).then(() => setCopied(true));
              }}
              className="mt-2 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
            >
              {copied ? c('copied') : s('copyAllText')}
            </button>
          </div>
        ) : null
      }
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 12. Text to PDF
// ---------------------------------------------------------------------------

export const TextToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [text, setText] = useState('');
  const [loadedName, setLoadedName] = useState('');
  const [fontName, setFontName] = useState('Helvetica');
  const [fontSize, setFontSize] = useState('12');
  const [margin, setMargin] = useState('54');
  const [busy, setBusy] = useState(false);
  const txtInputRef = useRef<HTMLInputElement>(null);

  return (
    <PdfToolShell tool={tool} accept=".txt" hideDropzone>
      {(ctx) => {
        const convert = async () => {
          if (!text.trim()) {
            ctx.setStatus('error', s('errEnterLoadText'));
            return;
          }
          setBusy(true);
          ctx.setStatus('working', s('buildingYourPdf'));
          try {
            const size = parseInt(fontSize, 10) || 12;
            const m = parseInt(margin, 10) || 54;
            const fontKey =
              fontName === 'Courier'
                ? StandardFonts.Courier
                : fontName === 'Times-Roman'
                  ? StandardFonts.TimesRoman
                  : StandardFonts.Helvetica;
            const doc = await PDFDocument.create();
            const font = await doc.embedFont(fontKey);
            const PAGE_W = 595;
            const PAGE_H = 842;
            const maxWidth = PAGE_W - m * 2;
            const lineHeight = size * 1.4;
            let page = doc.addPage([PAGE_W, PAGE_H]);
            let y = PAGE_H - m;
            const drawLine = (line: string) => {
              if (y < m) {
                page = doc.addPage([PAGE_W, PAGE_H]);
                y = PAGE_H - m;
              }
              if (line) page.drawText(line, { x: m, y: y - size, size, font, color: rgb(0.07, 0.07, 0.07) });
              y -= lineHeight;
            };
            for (const rawLine of text.replace(/\r\n?/g, '\n').split('\n')) {
              if (!rawLine.trim()) {
                drawLine('');
                continue;
              }
              // Word-wrap the paragraph line to the printable width
              let current = '';
              for (const word of rawLine.split(/\s+/)) {
                const trial = current ? `${current} ${word}` : word;
                if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
                  current = trial;
                } else {
                  if (current) drawLine(current);
                  // A single word longer than the line: hard-split it
                  let w = word;
                  while (font.widthOfTextAtSize(w, size) > maxWidth && w.length > 1) {
                    let cut = w.length;
                    while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxWidth) cut--;
                    drawLine(w.slice(0, cut));
                    w = w.slice(cut);
                  }
                  current = w;
                }
              }
              if (current) drawLine(current);
            }
            downloadBytes(await savePdf(doc), loadedName ? `${baseName(loadedName)}.pdf` : 'text.pdf');
            ctx.setStatus('done', s('textPdfCreated').replace('{count}', String(doc.getPageCount())));
          } catch (err: any) {
            ctx.setStatus('error', err?.message || s('errTextPdfBuild'));
          } finally {
            setBusy(false);
          }
        };

        return (
          <div className="mt-1">
            <div className="flex items-center gap-3 mb-2">
              <OptLabel>{s('pasteTypeText')}</OptLabel>
              <button
                onClick={() => txtInputRef.current?.click()}
                className="ms-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                {s('loadTxtFile')}
              </button>
              <input
                ref={txtInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    void f.text().then((t) => {
                      setText(t);
                      setLoadedName(f.name);
                    });
                  }
                  e.target.value = '';
                }}
              />
            </div>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setLoadedName('');
              }}
              placeholder={s('textToPdfPlaceholder2')}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm p-3 text-gray-900 dark:text-white"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div>
                <OptLabel>{s('fontLabel')}</OptLabel>
                <OptSelect value={fontName} onChange={(e) => setFontName(e.target.value)}>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier">{s('courierMono')}</option>
                  <option value="Times-Roman">Times Roman</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>{s('fontSizeLabel')}</OptLabel>
                <OptSelect value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                  <option value="10">10 pt</option>
                  <option value="11">11 pt</option>
                  <option value="12">12 pt</option>
                  <option value="14">14 pt</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>{s('marginsLabel')}</OptLabel>
                <OptSelect value={margin} onChange={(e) => setMargin(e.target.value)}>
                  <option value="36">{s('marginNarrowOpt2')}</option>
                  <option value="54">{s('marginNormalOpt2')}</option>
                  <option value="72">{s('marginWideOpt2')}</option>
                </OptSelect>
              </div>
            </div>
            <button onClick={() => void convert()} disabled={busy} className={BTN}>
              {busy ? s('buildingLabel') : s('convertTextToPdf')}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 13. PDF to BMP (24-bit BMP encoder)
// ---------------------------------------------------------------------------

function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  // Composite over white first (BMP has no alpha)
  const flat = document.createElement('canvas');
  flat.width = canvas.width;
  flat.height = canvas.height;
  const fctx = flat.getContext('2d')!;
  fctx.fillStyle = '#ffffff';
  fctx.fillRect(0, 0, flat.width, flat.height);
  fctx.drawImage(canvas, 0, 0);
  const { width: w, height: h } = flat;
  const px = fctx.getImageData(0, 0, w, h).data;
  const rowSize = Math.floor((24 * w + 31) / 32) * 4;
  const imageSize = rowSize * h;
  const fileSize = 54 + imageSize;
  const buffer = new ArrayBuffer(fileSize);
  const u8 = new Uint8Array(buffer);
  const dv = new DataView(buffer);
  u8[0] = 0x42; // 'B'
  u8[1] = 0x4d; // 'M'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(10, 54, true); // pixel data offset
  dv.setUint32(14, 40, true); // BITMAPINFOHEADER size
  dv.setInt32(18, w, true);
  dv.setInt32(22, h, true); // positive = bottom-up
  dv.setUint16(26, 1, true); // planes
  dv.setUint16(28, 24, true); // bits per pixel
  dv.setUint32(30, 0, true); // no compression
  dv.setUint32(34, imageSize, true);
  dv.setInt32(38, 2835, true); // ~72 DPI
  dv.setInt32(42, 2835, true);
  let o = 54;
  for (let y = h - 1; y >= 0; y--) {
    const rowStart = o;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      u8[o++] = px[i + 2]; // B
      u8[o++] = px[i + 1]; // G
      u8[o++] = px[i]; // R
    }
    o = rowStart + rowSize; // skip row padding (zeros)
  }
  return new Blob([buffer], { type: 'image/bmp' });
}

export const PdfToBmp: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [scale, setScale] = useState('2');
  const [pagesInput, setPagesInput] = useState('');

  const process = async (files: File[]) => {
    const file = files[0];
    const bytes = await fileToBytes(file);
    let doc: PdfJsDoc;
    try {
      doc = await openPdfJs(bytes);
    } catch {
      throw new Error(s('readError'));
    }
    const scaleNum = parseFloat(scale) || 2;
    let pageNums = Array.from({ length: doc.numPages }, (_, i) => i + 1);
    if (pagesInput.trim()) {
      pageNums = parsePageRanges(pagesInput, doc.numPages);
      if (!pageNums.length) throw new Error(s('errNoValidPagesBmp').replace('{input}', pagesInput).replace('{pages}', String(doc.numPages)));
    }
    const base = baseName(file);
    const blobs: { n: number; blob: Blob }[] = [];
    for (const n of pageNums) {
      const canvas = await renderPageCanvas(doc, n, scaleNum);
      blobs.push({ n, blob: canvasToBmpBlob(canvas) });
    }
    if (blobs.length === 1) {
      downloadBlob(blobs[0].blob, `${base}-page-${blobs[0].n}.bmp`);
    } else {
      await downloadZip(
        blobs.map((b) => ({ name: `${base}-page-${b.n}.bmp`, data: b.blob })),
        `${base}-bmp.zip`
      );
    }
    return s('bmpResult2').replace('{count}', String(blobs.length));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" actionLabel={s('bmpAction2')} onProcess={process}>
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('resolutionScale')}</OptLabel>
            <OptSelect value={scale} onChange={(e) => setScale(e.target.value)}>
              <option value="1">1× (72 DPI)</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
              <option value="3">3×</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('pagesBlankAll')}</OptLabel>
            <OptInput
              value={pagesInput}
              onChange={(e) => setPagesInput(e.target.value)}
              placeholder="e.g. 1-3, 5" dir="ltr"
            />
          </div>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 14. Cover Watermark (opaque patches over watermark areas, vector preserved)
// ---------------------------------------------------------------------------

export const CoverWatermark: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [docObj, setDocObj] = useState<PdfJsDoc | null>(null);
  const [fileName, setFileName] = useState('');
  const [page, setPage] = useState(1);
  const [pageImg, setPageImg] = useState('');
  const [rects, setRects] = useState<Record<number, PctRect[]>>({});
  const [liveRect, setLiveRect] = useState<PctRect | null>(null);
  const [color, setColor] = useState('#ffffff');
  const [busy, setBusy] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; active: boolean }>({ startX: 0, startY: 0, active: false });
  const boxRef = useRef<HTMLDivElement>(null);

  const renderPreview = async (doc: PdfJsDoc, pageNum: number) => {
    const canvas = await renderPageCanvas(doc, pageNum, 1.5);
    setPageImg(canvas.toDataURL('image/png'));
  };

  const loadFile = async (files: File[]) => {
    setBytes(null);
    setDocObj(null);
    setPageImg('');
    setRects({});
    setPage(1);
    if (!files.length) return;
    try {
      const b = await fileToBytes(files[0]);
      const d = await openPdfJs(b);
      setBytes(b);
      setDocObj(d);
      setFileName(files[0].name);
      await renderPreview(d, 1);
    } catch {
      setPageImg('');
    }
  };

  const gotoPage = async (n: number) => {
    if (!docObj) return;
    const clamped = Math.min(docObj.numPages, Math.max(1, n));
    setPage(clamped);
    await renderPreview(docObj, clamped);
  };

  const pctFromEvent = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = boxRef.current!.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" onFilesChange={(files) => void loadFile(files)}>
      {(ctx) => {
        const pageRects = rects[page] || [];
        const totalRects = Object.values(rects).reduce((a, r) => a + r.length, 0);

        const apply = async () => {
          if (!bytes) {
            ctx.setStatus('error', s('errChoosePdfFirst'));
            return;
          }
          if (!totalRects) {
            ctx.setStatus('error', s('errDrawPatch'));
            return;
          }
          setBusy(true);
          ctx.setStatus('working', s('coveringAreas'));
          try {
            const doc = await loadPdf(bytes);
            const fill = hexToRgb(color);
            for (let p = 1; p <= doc.getPageCount(); p++) {
              const list = rects[p];
              if (!list?.length) continue;
              const pg = doc.getPage(p - 1);
              const { width, height } = pg.getSize();
              for (const r of list) {
                pg.drawRectangle({
                  x: (r.xPct / 100) * width,
                  y: height - ((r.yPct + r.hPct) / 100) * height,
                  width: (r.wPct / 100) * width,
                  height: (r.hPct / 100) * height,
                  color: fill,
                  opacity: 1,
                });
              }
            }
            downloadBytes(await savePdf(doc), `${baseName(fileName)}-watermark-covered.pdf`);
            ctx.setStatus(
              'done',
              s('coveredDone').replace('{areas}', pluralize(lang, totalRects, 'wordArea', 'wordAreas'))
            );
          } catch (err: any) {
            ctx.setStatus('error', err?.message || s('errApplyPatches'));
          } finally {
            setBusy(false);
          }
        };

        return (
          <div className="mt-4">
            <p className="text-[11px] text-gray-500">
              {s('coverIntro')}
            </p>
            {docObj && pageImg ? (
              <>
                <div className="flex flex-wrap items-center gap-3 mt-4 mb-3">
                  <button
                    onClick={() => void gotoPage(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    ← {s('prevBtn')}
                  </button>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {c('page')} {page} {c('of')} {docObj.numPages}
                  </span>
                  <button
                    onClick={() => void gotoPage(page + 1)}
                    disabled={page >= docObj.numPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 disabled:opacity-40 cursor-pointer"
                  >
                    {s('nextBtn')} →
                  </button>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 ms-auto">
                    {s('patchColor')}
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-9 h-8 rounded cursor-pointer bg-transparent"
                    />
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {s('patchColorNote')}
                  </span>
                  {pageRects.length > 0 && (
                    <button
                      onClick={() => setRects((prev) => ({ ...prev, [page]: [] }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 cursor-pointer"
                    >
                      {s('clearPageElements').replace('{count}', String(pageRects.length))}
                    </button>
                  )}
                </div>
                <div
                  ref={boxRef}
                  className="relative select-none touch-none border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden cursor-crosshair"
                  onPointerDown={(e) => {
                    const p = pctFromEvent(e);
                    dragRef.current = { startX: p.x, startY: p.y, active: true };
                    setLiveRect({ xPct: p.x, yPct: p.y, wPct: 0, hPct: 0 });
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (!dragRef.current.active) return;
                    const p = pctFromEvent(e);
                    const sx = dragRef.current.startX;
                    const sy = dragRef.current.startY;
                    setLiveRect({
                      xPct: Math.min(sx, p.x),
                      yPct: Math.min(sy, p.y),
                      wPct: Math.abs(p.x - sx),
                      hPct: Math.abs(p.y - sy),
                    });
                  }}
                  onPointerUp={() => {
                    if (!dragRef.current.active) return;
                    dragRef.current.active = false;
                    if (liveRect && liveRect.wPct >= 1 && liveRect.hPct >= 1) {
                      setRects((prev) => ({ ...prev, [page]: [...(prev[page] || []), liveRect] }));
                    }
                    setLiveRect(null);
                  }}
                >
                  <img src={pageImg} alt={`${c('page')} ${page}`} className="w-full block" draggable={false} />
                  {pageRects.map((r, i) => (
                    <div
                      key={i}
                      className="absolute border border-dashed border-orange-500"
                      style={{
                        left: `${r.xPct}%`,
                        top: `${r.yPct}%`,
                        width: `${r.wPct}%`,
                        height: `${r.hPct}%`,
                        backgroundColor: color,
                        opacity: 0.85,
                      }}
                    />
                  ))}
                  {liveRect && (
                    <div
                      className="absolute border border-dashed border-orange-600"
                      style={{
                        left: `${liveRect.xPct}%`,
                        top: `${liveRect.yPct}%`,
                        width: `${liveRect.wPct}%`,
                        height: `${liveRect.hPct}%`,
                        backgroundColor: color,
                        opacity: 0.6,
                      }}
                    />
                  )}
                </div>
                <button onClick={() => void apply()} disabled={busy || !totalRects} className={BTN}>
                  {busy ? s('applyingLabel') : s('coverBtnTpl').replace('{areas}', totalRects ? pluralize(lang, totalRects, 'wordMarkedArea', 'wordMarkedAreas') : s('wordMarkedAreas'))}
                </button>
              </>
            ) : (
              <p className="text-[11px] text-gray-500 mt-3">
                {s('coverChoose')}
              </p>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};
