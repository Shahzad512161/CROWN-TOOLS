// PDF organize / page-level tools — all processing happens 100% in the browser.
// Merge, split, rotate, organize, crop, page numbers, watermark, protect,
// unlock, repair, PDF/A conversion, and a page inspector.
import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Plus,
  RotateCcw,
  RotateCw,
  Trash2,
} from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  baseName,
  canvasToBlob,
  degrees,
  downloadBytes,
  downloadZip,
  fileToBytes,
  formatBytes,
  loadPdf,
  openPdfJs,
  parsePageRanges,
  renderPageCanvas,
  renderThumbnails,
  rgb,
  savePdf,
} from '../../../lib/pdf/core';
import { OptCheck, OptInput, OptLabel, OptSelect, PdfToolShell } from './PdfToolShell';

const ACCEPT = '.pdf,application/pdf';

const READ_ERROR = 'Could not read this PDF — it may be corrupt or password-protected.';

/** Copy every page of a loaded source doc into a fresh document and save it. */
async function copyAllPages(src: PDFDocument): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, src.getPageIndices());
  copied.forEach((p) => out.addPage(p));
  return savePdf(out);
}

/** Rebuild a PDF by rendering every page to a high-resolution JPEG image page. */
async function rebuildAsImagePdf(
  bytes: Uint8Array,
  password?: string
): Promise<{ data: Uint8Array; pages: number }> {
  const jsDoc = await openPdfJs(bytes, password);
  const out = await PDFDocument.create();
  for (let i = 1; i <= jsDoc.numPages; i++) {
    const page = await jsDoc.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const canvas = await renderPageCanvas(jsDoc, i, 2.5);
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
    const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const p = out.addPage([vp.width, vp.height]);
    p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
  }
  return { data: await savePdf(out), pages: jsDoc.numPages };
}

// ---------------------------------------------------------------------------
// 1. Merge PDF
// ---------------------------------------------------------------------------

export const MergePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    multiple
    minFiles={2}
    actionLabel="Merge PDFs"
    dropzoneHint="Add 2 or more PDFs · they are merged in the order shown below"
    onProcess={async (files) => {
      const out = await PDFDocument.create();
      let totalPages = 0;
      for (const f of files) {
        let src: PDFDocument;
        try {
          src = await loadPdf(await fileToBytes(f));
        } catch {
          throw new Error(`Could not read ${f.name} — it may be corrupt or password-protected.`);
        }
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
        totalPages += copied.length;
      }
      downloadBytes(await savePdf(out), `${baseName(files[0])}-merged.pdf`);
      return `Merged ${files.length} PDFs into one file with ${totalPages} pages.`;
    }}
  >
    {(ctx) =>
      ctx.files.length > 1 ? (
        <div className="mt-4">
          <OptLabel>Merge order — the first file's pages come first</OptLabel>
          <ul className="space-y-1.5">
            {ctx.files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
              >
                <span className="font-black text-orange-500 w-5 text-center">{i + 1}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{f.name}</span>
                <span className="ml-auto flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => {
                      const next = [...ctx.files];
                      const tmp = next[i - 1];
                      next[i - 1] = next[i];
                      next[i] = tmp;
                      ctx.setFiles(next);
                    }}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label={`Move ${f.name} up`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={i === ctx.files.length - 1}
                    onClick={() => {
                      const next = [...ctx.files];
                      const tmp = next[i + 1];
                      next[i + 1] = next[i];
                      next[i] = tmp;
                      ctx.setFiles(next);
                    }}
                    className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label={`Move ${f.name} down`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-[11px] text-gray-500 mt-4">
          Add at least two PDFs — you can then reorder them here before merging.
        </p>
      )
    }
  </PdfToolShell>
);

// ---------------------------------------------------------------------------
// 2. Split PDF
// ---------------------------------------------------------------------------

type SplitMode = 'ranges' | 'extract' | 'each' | 'everyn';

export const SplitPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState<SplitMode>('ranges');
  const [rangesText, setRangesText] = useState('1-3\n4-6');
  const [extractRanges, setExtractRanges] = useState('1-3, 5');
  const [everyN, setEveryN] = useState(3);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Split PDF"
      onProcess={async (files) => {
        const file = files[0];
        const base = baseName(file);
        let src: PDFDocument;
        try {
          src = await loadPdf(await fileToBytes(file));
        } catch {
          throw new Error(READ_ERROR);
        }
        const count = src.getPageCount();

        const makePdf = async (pages1Based: number[]): Promise<Uint8Array> => {
          const out = await PDFDocument.create();
          const copied = await out.copyPages(
            src,
            pages1Based.map((p) => p - 1)
          );
          copied.forEach((p) => out.addPage(p));
          return savePdf(out);
        };

        const deliver = async (parts: { name: string; data: Uint8Array }[], summary: string) => {
          if (parts.length === 1) {
            downloadBytes(parts[0].data, parts[0].name);
          } else {
            await downloadZip(parts, `${base}-split.zip`);
          }
          return summary;
        };

        if (mode === 'extract') {
          const pages = parsePageRanges(extractRanges, count);
          if (!pages.length) {
            throw new Error(`No valid pages in that range — this PDF has ${count} page${count === 1 ? '' : 's'}.`);
          }
          const data = await makePdf(pages);
          downloadBytes(data, `${base}-extract.pdf`);
          return `Extracted ${pages.length} page${pages.length === 1 ? '' : 's'} (${pages.join(', ')}) into a new PDF.`;
        }

        if (mode === 'each') {
          const parts: { name: string; data: Uint8Array }[] = [];
          for (let i = 1; i <= count; i++) {
            parts.push({ name: `${base}-page-${i}.pdf`, data: await makePdf([i]) });
          }
          return deliver(parts, `Split ${count} pages into ${parts.length} separate PDFs.`);
        }

        if (mode === 'everyn') {
          const n = Math.floor(everyN);
          if (!n || n < 1) throw new Error('Enter how many pages go into each file (1 or more).');
          const parts: { name: string; data: Uint8Array }[] = [];
          for (let start = 1; start <= count; start += n) {
            const chunk: number[] = [];
            for (let p = start; p < Math.min(start + n, count + 1); p++) chunk.push(p);
            parts.push({
              name: `${base}-pages-${chunk[0]}-${chunk[chunk.length - 1]}.pdf`,
              data: await makePdf(chunk),
            });
          }
          return deliver(parts, `Split ${count} pages into ${parts.length} file${parts.length === 1 ? '' : 's'} of up to ${n} pages each.`);
        }

        // mode === 'ranges': one output PDF per line
        const parts: { name: string; data: Uint8Array }[] = [];
        for (const line of rangesText.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const pages = parsePageRanges(trimmed, count);
          if (!pages.length) continue;
          const label = trimmed.replace(/[\s,]+/g, '-');
          parts.push({ name: `${base}-pages-${label}.pdf`, data: await makePdf(pages) });
        }
        if (!parts.length) {
          throw new Error(`No valid page ranges — this PDF has ${count} page${count === 1 ? '' : 's'}. Enter ranges like 1-3, one per line.`);
        }
        return deliver(parts, `Created ${parts.length} PDF${parts.length === 1 ? '' : 's'} from your page ranges.`);
      }}
    >
      {() => (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>Split mode</OptLabel>
              <OptSelect value={mode} onChange={(e) => setMode(e.target.value as SplitMode)}>
                <option value="ranges">Page ranges (one file per line)</option>
                <option value="extract">Extract pages into one PDF</option>
                <option value="each">Every page as its own PDF</option>
                <option value="everyn">Every N pages</option>
              </OptSelect>
            </div>
            {mode === 'everyn' && (
              <div>
                <OptLabel>Pages per file</OptLabel>
                <OptInput
                  type="number"
                  min={1}
                  value={everyN}
                  onChange={(e) => setEveryN(Number(e.target.value))}
                />
              </div>
            )}
            {mode === 'extract' && (
              <div className="col-span-2">
                <OptLabel>Pages to extract</OptLabel>
                <OptInput
                  type="text"
                  value={extractRanges}
                  onChange={(e) => setExtractRanges(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8"
                />
              </div>
            )}
          </div>
          {mode === 'ranges' && (
            <div>
              <OptLabel>Page ranges — one output PDF per line</OptLabel>
              <textarea
                value={rangesText}
                onChange={(e) => setRangesText(e.target.value)}
                rows={3}
                placeholder={'1-3\n4-6\n7'}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Each line becomes its own PDF. Multiple results are delivered together in a ZIP file.
              </p>
            </div>
          )}
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Rotate PDF
// ---------------------------------------------------------------------------

export const RotatePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [angle, setAngle] = useState(90);
  const [scope, setScope] = useState<'all' | 'ranges'>('all');
  const [ranges, setRanges] = useState('1');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Rotate pages"
      onProcess={async (files) => {
        let doc: PDFDocument;
        try {
          doc = await loadPdf(await fileToBytes(files[0]));
        } catch {
          throw new Error(READ_ERROR);
        }
        const count = doc.getPageCount();
        const targets =
          scope === 'all'
            ? doc.getPageIndices()
            : parsePageRanges(ranges, count).map((p) => p - 1);
        if (!targets.length) {
          throw new Error(`No valid pages in that range — this PDF has ${count} page${count === 1 ? '' : 's'}.`);
        }
        const pages = doc.getPages();
        for (const idx of targets) {
          const page = pages[idx];
          page.setRotation(degrees((page.getRotation().angle + angle) % 360));
        }
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-rotated.pdf`);
        return `Rotated ${targets.length} page${targets.length === 1 ? '' : 's'} by ${angle}° clockwise.`;
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>Rotate clockwise</OptLabel>
            <OptSelect value={angle} onChange={(e) => setAngle(Number(e.target.value))}>
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Apply to</OptLabel>
            <OptSelect value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'ranges')}>
              <option value="all">All pages</option>
              <option value="ranges">Page range</option>
            </OptSelect>
          </div>
          {scope === 'ranges' && (
            <div>
              <OptLabel>Pages</OptLabel>
              <OptInput
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-3, 5"
              />
            </div>
          )}
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 4. Organize PDF (interactive thumbnail grid)
// ---------------------------------------------------------------------------

type OrganizeItem =
  | { kind: 'page'; src: number; thumb: string; rot: number }
  | { kind: 'blank' };

export const OrganizePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [items, setItems] = useState<OrganizeItem[]>([]);
  const [originalItems, setOriginalItems] = useState<OrganizeItem[]>([]);
  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [srcName, setSrcName] = useState('document');
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  const handleFilesChange = async (files: File[]) => {
    if (!files.length) {
      setItems([]);
      setOriginalItems([]);
      setSrcBytes(null);
      return;
    }
    const file = files[0];
    setLoadingThumbs(true);
    try {
      const bytes = await fileToBytes(file);
      const [thumbs, doc] = await Promise.all([renderThumbnails(bytes), loadPdf(bytes)]);
      const n = doc.getPageCount();
      const arr: OrganizeItem[] = Array.from({ length: n }, (_, i) => ({
        kind: 'page' as const,
        src: i + 1,
        thumb: thumbs[i] || '',
        rot: 0,
      }));
      setSrcBytes(bytes);
      setSrcName(file.name);
      setItems(arr);
      setOriginalItems(arr);
    } catch {
      setItems([]);
      setOriginalItems([]);
      setSrcBytes(null);
    } finally {
      setLoadingThumbs(false);
    }
  };

  const applyAndDownload = async (ctx: { setStatus: (s: any, m?: string) => void }) => {
    if (!srcBytes) return;
    ctx.setStatus('working', 'Building your organized PDF…');
    try {
      const src = await loadPdf(srcBytes);
      const out = await PDFDocument.create();
      let lastSize: [number, number] = [595, 842];
      for (const it of items) {
        if (it.kind === 'page') {
          const [copied] = await out.copyPages(src, [it.src - 1]);
          if (it.rot) {
            copied.setRotation(degrees((copied.getRotation().angle + it.rot) % 360));
          }
          const size = copied.getSize();
          lastSize = [size.width, size.height];
          out.addPage(copied);
        } else {
          out.addPage([lastSize[0], lastSize[1]]);
        }
      }
      if (out.getPageCount() === 0) {
        throw new Error('There are no pages left to save. Reset the layout or add a blank page.');
      }
      downloadBytes(await savePdf(out), `${baseName(srcName)}-organized.pdf`);
      ctx.setStatus('done', `Saved ${out.getPageCount()} pages in the new order.`);
    } catch (err: any) {
      ctx.setStatus('error', err?.message || 'Could not build the organized PDF.');
    }
  };

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      dropzoneHint="Select one PDF to rearrange, rotate, delete and insert pages visually"
      onFilesChange={handleFilesChange}
    >
      {(ctx) => {
        if (!ctx.files.length) {
          return (
            <p className="text-[11px] text-gray-500 mt-4">
              Choose a PDF above — its pages will appear here as thumbnails you can rearrange.
            </p>
          );
        }
        if (loadingThumbs) {
          return <p className="text-xs text-gray-500 mt-4">Loading page thumbnails…</p>;
        }
        return (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, { kind: 'blank' }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add blank page
              </button>
              <button
                type="button"
                onClick={() => setItems(originalItems)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <span className="text-[11px] text-gray-500 ml-auto">
                {items.filter((i) => i.kind === 'page').length} original pages · {items.length} total
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((it, i) =>
                it.kind === 'page' ? (
                  <div
                    key={`p-${it.src}-${i}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white flex items-center justify-center min-h-[110px]">
                      {it.thumb ? (
                        <img
                          src={it.thumb}
                          alt={`Page ${it.src}`}
                          style={{ transform: `rotate(${it.rot}deg)` }}
                          className="max-h-[150px] w-auto object-contain transition-transform"
                        />
                      ) : (
                        <span className="text-[11px] text-gray-400">Page {it.src}</span>
                      )}
                      <span className="absolute top-1 left-1 text-[10px] font-black bg-black/70 text-white rounded-md px-1.5 py-0.5">
                        {it.src}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setItems((prev) =>
                            prev.map((x, j) =>
                              j === i && x.kind === 'page' ? { ...x, rot: (x.rot + 90) % 360 } : x
                            )
                          )
                        }
                        className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-orange-400 cursor-pointer"
                        aria-label={`Rotate page ${it.src}`}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-red-500 hover:border-red-400 cursor-pointer"
                        aria-label={`Delete page ${it.src}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={`b-${i}`}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-white dark:bg-gray-900 flex flex-col"
                  >
                    <div className="flex-1 min-h-[110px] flex items-center justify-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Blank page
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 hover:border-red-400 cursor-pointer"
                        aria-label="Remove blank page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              disabled={!items.length || ctx.status === 'working'}
              onClick={() => applyAndDownload(ctx)}
              className={`w-full mt-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                items.length && ctx.status !== 'working'
                  ? 'bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Apply &amp; download organized PDF</span>
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 5. Crop PDF
// ---------------------------------------------------------------------------

export const CropPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [unit, setUnit] = useState<'percent' | 'mm'>('percent');
  const [top, setTop] = useState(5);
  const [right, setRight] = useState(5);
  const [bottom, setBottom] = useState(5);
  const [left, setLeft] = useState(5);
  const [scope, setScope] = useState<'all' | 'ranges'>('all');
  const [ranges, setRanges] = useState('1');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Crop pages"
      onProcess={async (files) => {
        let doc: PDFDocument;
        try {
          doc = await loadPdf(await fileToBytes(files[0]));
        } catch {
          throw new Error(READ_ERROR);
        }
        const count = doc.getPageCount();
        const targets =
          scope === 'all'
            ? doc.getPageIndices()
            : parsePageRanges(ranges, count).map((p) => p - 1);
        if (!targets.length) {
          throw new Error(`No valid pages in that range — this PDF has ${count} page${count === 1 ? '' : 's'}.`);
        }
        if ([top, right, bottom, left].some((v) => !isFinite(v) || v < 0)) {
          throw new Error('Crop margins cannot be negative.');
        }
        const mmToPt = 72 / 25.4;
        const pages = doc.getPages();
        for (const idx of targets) {
          const page = pages[idx];
          const { width: w, height: h } = page.getSize();
          const l = unit === 'percent' ? (w * left) / 100 : left * mmToPt;
          const r = unit === 'percent' ? (w * right) / 100 : right * mmToPt;
          const t = unit === 'percent' ? (h * top) / 100 : top * mmToPt;
          const b = unit === 'percent' ? (h * bottom) / 100 : bottom * mmToPt;
          const newW = w - l - r;
          const newH = h - t - b;
          if (newW <= 10 || newH <= 10) {
            throw new Error(
              `That crop is too large for page ${idx + 1} — it would leave almost nothing. Reduce the margins.`
            );
          }
          page.setCropBox(l, b, newW, newH);
        }
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-cropped.pdf`);
        return `Cropped ${targets.length} page${targets.length === 1 ? '' : 's'}. Content outside the crop area is hidden (the page box is changed, nothing is deleted).`;
      }}
    >
      {() => (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>Unit</OptLabel>
              <OptSelect value={unit} onChange={(e) => setUnit(e.target.value as 'percent' | 'mm')}>
                <option value="percent">Percent of page</option>
                <option value="mm">Millimetres</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>Apply to</OptLabel>
              <OptSelect value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'ranges')}>
                <option value="all">All pages</option>
                <option value="ranges">Page range</option>
              </OptSelect>
            </div>
            {scope === 'ranges' && (
              <div>
                <OptLabel>Pages</OptLabel>
                <OptInput type="text" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 5" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <OptLabel>Top {unit === 'percent' ? '%' : 'mm'}</OptLabel>
              <OptInput type="number" min={0} value={top} onChange={(e) => setTop(Number(e.target.value))} />
            </div>
            <div>
              <OptLabel>Right {unit === 'percent' ? '%' : 'mm'}</OptLabel>
              <OptInput type="number" min={0} value={right} onChange={(e) => setRight(Number(e.target.value))} />
            </div>
            <div>
              <OptLabel>Bottom {unit === 'percent' ? '%' : 'mm'}</OptLabel>
              <OptInput type="number" min={0} value={bottom} onChange={(e) => setBottom(Number(e.target.value))} />
            </div>
            <div>
              <OptLabel>Left {unit === 'percent' ? '%' : 'mm'}</OptLabel>
              <OptInput type="number" min={0} value={left} onChange={(e) => setLeft(Number(e.target.value))} />
            </div>
          </div>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. Add page numbers
// ---------------------------------------------------------------------------

type NumberPosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
type NumberFormat = 'n' | 'page-n' | 'page-n-of-n' | 'n-of-n';

export const PageNumbersPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [position, setPosition] = useState<NumberPosition>('bottom-center');
  const [format, setFormat] = useState<NumberFormat>('n');
  const [startAt, setStartAt] = useState(1);
  const [fontSize, setFontSize] = useState(10);
  const [skipFirst, setSkipFirst] = useState(false);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Add page numbers"
      onProcess={async (files) => {
        let doc: PDFDocument;
        try {
          doc = await loadPdf(await fileToBytes(files[0]));
        } catch {
          throw new Error(READ_ERROR);
        }
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const total = doc.getPageCount();
        const color = rgb(0.3, 0.3, 0.3);
        let counter = Math.floor(startAt) || 1;
        let stamped = 0;
        doc.getPages().forEach((page, i) => {
          if (skipFirst && i === 0) return;
          const text =
            format === 'page-n'
              ? `Page ${counter}`
              : format === 'page-n-of-n'
                ? `Page ${counter} of ${total}`
                : format === 'n-of-n'
                  ? `${counter} / ${total}`
                  : `${counter}`;
          counter++;
          stamped++;
          const { width, height } = page.getSize();
          const tw = font.widthOfTextAtSize(text, fontSize);
          const isTop = position.startsWith('top');
          const y = isTop ? height - 24 : 24;
          const x = position.endsWith('left')
            ? 28
            : position.endsWith('right')
              ? width - 28 - tw
              : (width - tw) / 2;
          page.drawText(text, { x, y, size: fontSize, font, color });
        });
        if (!stamped) throw new Error('No pages were numbered — the only page is skipped. Untick "Skip first page".');
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-numbered.pdf`);
        return `Added page numbers to ${stamped} of ${total} pages.`;
      }}
    >
      {() => (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>Position</OptLabel>
              <OptSelect value={position} onChange={(e) => setPosition(e.target.value as NumberPosition)}>
                <option value="bottom-center">Bottom center</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
                <option value="top-center">Top center</option>
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>Format</OptLabel>
              <OptSelect value={format} onChange={(e) => setFormat(e.target.value as NumberFormat)}>
                <option value="n">1</option>
                <option value="page-n">Page 1</option>
                <option value="page-n-of-n">Page 1 of 10</option>
                <option value="n-of-n">1 / 10</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>Font size</OptLabel>
              <OptSelect value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}>
                <option value={9}>9 pt</option>
                <option value={10}>10 pt</option>
                <option value={12}>12 pt</option>
                <option value={14}>14 pt</option>
              </OptSelect>
            </div>
            <div>
              <OptLabel>Start numbering at</OptLabel>
              <OptInput type="number" min={0} value={startAt} onChange={(e) => setStartAt(Number(e.target.value))} />
            </div>
          </div>
          <OptCheck label="Skip the first page (e.g. a cover page)" checked={skipFirst} onChange={setSkipFirst} />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. Watermark PDF
// ---------------------------------------------------------------------------

type WatermarkPlacement = 'diagonal' | 'center' | 'tiled';

export const WatermarkPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('DRAFT');
  const [size, setSize] = useState(48);
  const [textOpacity, setTextOpacity] = useState(0.3);
  const [placement, setPlacement] = useState<WatermarkPlacement>('diagonal');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgScale, setImgScale] = useState(50);
  const [imgOpacity, setImgOpacity] = useState(0.5);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Add watermark"
      onProcess={async (files) => {
        let doc: PDFDocument;
        try {
          doc = await loadPdf(await fileToBytes(files[0]));
        } catch {
          throw new Error(READ_ERROR);
        }
        const pages = doc.getPages();

        if (mode === 'text') {
          const label = text.trim();
          if (!label) throw new Error('Enter the watermark text first.');
          const font = await doc.embedFont(StandardFonts.HelveticaBold);
          const color = rgb(0.35, 0.35, 0.35);
          for (const page of pages) {
            const { width: w, height: h } = page.getSize();
            const tw = font.widthOfTextAtSize(label, size);
            if (placement === 'diagonal') {
              page.drawText(label, {
                x: w / 2 - tw / 2,
                y: h / 2 - size / 2,
                size,
                font,
                color,
                opacity: textOpacity,
                rotate: degrees(45),
              });
            } else if (placement === 'center') {
              page.drawText(label, {
                x: w / 2 - tw / 2,
                y: h / 2 - size / 2,
                size,
                font,
                color,
                opacity: textOpacity,
              });
            } else {
              for (let x = -40; x < w + 40; x += 220) {
                for (let y = 10; y < h; y += 160) {
                  page.drawText(label, {
                    x,
                    y,
                    size,
                    font,
                    color,
                    opacity: textOpacity,
                    rotate: degrees(30),
                  });
                }
              }
            }
          }
          downloadBytes(await savePdf(doc), `${baseName(files[0])}-watermarked.pdf`);
          return `Text watermark "${label}" stamped on ${pages.length} page${pages.length === 1 ? '' : 's'}.`;
        }

        // image mode
        if (!imgFile) throw new Error('Choose a watermark image (PNG or JPG) first.');
        const imgBytes = await fileToBytes(imgFile);
        let img;
        try {
          img = await doc.embedPng(imgBytes);
        } catch {
          try {
            img = await doc.embedJpg(imgBytes);
          } catch {
            throw new Error('That image format is not supported — use a PNG or JPG watermark image.');
          }
        }
        const scalePct = Math.min(100, Math.max(10, imgScale || 50));
        for (const page of pages) {
          const { width: w, height: h } = page.getSize();
          const targetW = (w * scalePct) / 100;
          const targetH = img.height * (targetW / img.width);
          page.drawImage(img, {
            x: (w - targetW) / 2,
            y: (h - targetH) / 2,
            width: targetW,
            height: targetH,
            opacity: imgOpacity,
          });
        }
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-watermarked.pdf`);
        return `Image watermark stamped on ${pages.length} page${pages.length === 1 ? '' : 's'}.`;
      }}
    >
      {() => (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>Watermark type</OptLabel>
              <OptSelect value={mode} onChange={(e) => setMode(e.target.value as 'text' | 'image')}>
                <option value="text">Text</option>
                <option value="image">Image / logo</option>
              </OptSelect>
            </div>
            {mode === 'text' && (
              <>
                <div>
                  <OptLabel>Text</OptLabel>
                  <OptInput type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. DRAFT" />
                </div>
                <div>
                  <OptLabel>Placement</OptLabel>
                  <OptSelect value={placement} onChange={(e) => setPlacement(e.target.value as WatermarkPlacement)}>
                    <option value="diagonal">Diagonal (rotated 45°)</option>
                    <option value="center">Center</option>
                    <option value="tiled">Tiled across the page</option>
                  </OptSelect>
                </div>
              </>
            )}
            {mode === 'image' && (
              <div>
                <OptLabel>Watermark image</OptLabel>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                  className="w-full text-xs font-semibold text-gray-700 dark:text-gray-300 file:mr-2 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:text-xs file:font-semibold cursor-pointer"
                />
                {imgFile && <p className="text-[11px] text-gray-500 mt-1">{imgFile.name}</p>}
              </div>
            )}
          </div>

          {mode === 'text' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <OptLabel>Text size: {size} pt</OptLabel>
                <input
                  type="range"
                  min={12}
                  max={120}
                  step={2}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <OptLabel>Opacity: {Math.round(textOpacity * 100)}%</OptLabel>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={textOpacity}
                  onChange={(e) => setTextOpacity(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <OptLabel>Width: {imgScale}% of page</OptLabel>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={imgScale}
                  onChange={(e) => setImgScale(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div>
                <OptLabel>Opacity: {Math.round(imgOpacity * 100)}%</OptLabel>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={imgOpacity}
                  onChange={(e) => setImgOpacity(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. Protect PDF
// ---------------------------------------------------------------------------

export const ProtectPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [userPw, setUserPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [ownerPw, setOwnerPw] = useState('');
  const [permPrinting, setPermPrinting] = useState(true);
  const [permCopying, setPermCopying] = useState(true);
  const [permModifying, setPermModifying] = useState(false);
  const [permAnnotating, setPermAnnotating] = useState(true);
  const [permFillingForms, setPermFillingForms] = useState(true);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Protect PDF"
      onProcess={async (files) => {
        if (userPw.length < 4) throw new Error('Password must be at least 4 characters long.');
        if (userPw !== confirmPw) throw new Error('The two passwords do not match.');
        let doc: PDFDocument;
        try {
          doc = await loadPdf(await fileToBytes(files[0]));
        } catch {
          throw new Error(READ_ERROR);
        }
        doc.encrypt({
          userPassword: userPw,
          ownerPassword: ownerPw.trim() || userPw,
          permissions: {
            printing: permPrinting ? 'highResolution' : false,
            copying: permCopying,
            modifying: permModifying,
            annotating: permAnnotating,
            fillingForms: permFillingForms,
          },
        } as any);
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-protected.pdf`);
        return 'PDF encrypted with a password and your permission settings. Warning: this password cannot be recovered — if you lose it, the file cannot be opened.';
      }}
    >
      {() => (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>Password (to open the file)</OptLabel>
              <OptInput
                type="password"
                value={userPw}
                onChange={(e) => setUserPw(e.target.value)}
                placeholder="Min. 4 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <OptLabel>Confirm password</OptLabel>
              <OptInput
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <OptLabel>Owner password (optional)</OptLabel>
              <OptInput
                type="password"
                value={ownerPw}
                onChange={(e) => setOwnerPw(e.target.value)}
                placeholder="Blank = same as password"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <OptLabel>Allow people who open the file to…</OptLabel>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1">
              <OptCheck label="Print (high resolution)" checked={permPrinting} onChange={setPermPrinting} />
              <OptCheck label="Copy text & images" checked={permCopying} onChange={setPermCopying} />
              <OptCheck label="Modify the document" checked={permModifying} onChange={setPermModifying} />
              <OptCheck label="Add annotations" checked={permAnnotating} onChange={setPermAnnotating} />
              <OptCheck label="Fill in forms" checked={permFillingForms} onChange={setPermFillingForms} />
            </div>
          </div>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 9. Unlock PDF
// ---------------------------------------------------------------------------

export const UnlockPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [password, setPassword] = useState('');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Unlock PDF"
      dropzoneHint="Removes password & permission restrictions from a PDF you own"
      onProcess={async (files) => {
        const file = files[0];
        const base = baseName(file);
        const bytes = await fileToBytes(file);
        const successMsg =
          'Restrictions removed — this copy has no password and no permission limits.';

        // (a) Plain load: works for unencrypted PDFs and owner-password-only files.
        try {
          const src = await loadPdf(bytes);
          downloadBytes(await copyAllPages(src), `${base}-unlocked.pdf`);
          return successMsg;
        } catch {
          /* fall through */
        }

        // (b) Ignore-encryption load: strips restrictions when the structure allows it.
        try {
          const src = await loadPdf(bytes, { ignoreEncryption: true });
          downloadBytes(await copyAllPages(src), `${base}-unlocked.pdf`);
          return successMsg;
        } catch {
          /* fall through */
        }

        // (c) Genuinely password-encrypted and no password given.
        if (!password) {
          throw new Error('This PDF is password-encrypted. Enter its password to unlock it.');
        }

        // (d) Validate the password with pdf.js, then rebuild page-by-page as images.
        try {
          await openPdfJs(bytes, password);
        } catch {
          throw new Error('Incorrect password for this PDF.');
        }
        const { data, pages } = await rebuildAsImagePdf(bytes, password);
        downloadBytes(data, `${base}-unlocked.pdf`);
        return `Unlocked ${pages} pages. Because the file was strongly encrypted, its pages were rebuilt as high-resolution images — text is no longer selectable in the unlocked copy.`;
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>Password (only if the PDF needs one to open)</OptLabel>
            <OptInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank for restriction-only PDFs"
              autoComplete="current-password"
            />
          </div>
          <p className="text-[11px] text-gray-500 col-span-2 self-end">
            Many "locked" PDFs only carry an owner password that blocks printing, copying or editing —
            those unlock instantly with no password. A PDF that needs a password to open can be unlocked
            here if you know that password.
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 10. Repair PDF
// ---------------------------------------------------------------------------

export const RepairPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel="Repair PDF"
    onProcess={async (files) => {
      const file = files[0];
      const base = baseName(file);
      const bytes = await fileToBytes(file);

      // First pass: strict pdf-lib parse + clean rebuild.
      try {
        const src = await loadPdf(bytes);
        const data = await copyAllPages(src);
        downloadBytes(data, `${base}-repaired.pdf`);
        return `Recovered ${src.getPageCount()} pages and rebuilt the file with a clean structure.`;
      } catch {
        /* fall through to the tolerant renderer */
      }

      // Fallback: tolerant pdf.js parse + image rebuild.
      try {
        const { data, pages } = await rebuildAsImagePdf(bytes);
        downloadBytes(data, `${base}-repaired.pdf`);
        return `Recovered ${pages} pages by re-rendering them as high-resolution images (the original structure was too damaged to reuse, so text is no longer selectable).`;
      } catch {
        throw new Error('This file is too damaged to repair — both recovery engines failed to read it.');
      }
    }}
  >
    {() => (
      <p className="text-[11px] text-gray-500 mt-4">
        The repair first tries a strict structural rebuild of your PDF. If the file is too damaged for
        that, it falls back to re-rendering every readable page into a fresh PDF.
      </p>
    )}
  </PdfToolShell>
);

// ---------------------------------------------------------------------------
// 11. PDF to PDF/A
// ---------------------------------------------------------------------------

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const PdfToPdfA: React.FC<{ tool: ToolItem }> = ({ tool }) => (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel="Convert to PDF/A"
    onProcess={async (files) => {
      const file = files[0];
      const base = baseName(file);
      let src: PDFDocument;
      try {
        src = await loadPdf(await fileToBytes(file));
      } catch {
        throw new Error(READ_ERROR);
      }
      const title = src.getTitle() || base;

      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, src.getPageIndices());
      copied.forEach((p) => out.addPage(p));
      out.setTitle(title);
      out.setCreator('Super Crown Tools');
      out.setProducer('Super Crown Tools');
      out.setSubject(`PDF/A-3B archival conversion of "${title}"`);

      const xmp = [
        '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
        '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
        ' <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
        '  <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/" pdfaid:part="3" pdfaid:conformance="B"/>',
        '  <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">',
        '   <dc:title><rdf:Alt>',
        `    <rdf:li xml:lang="x-default">${xmlEscape(title)}</rdf:li>`,
        '   </rdf:Alt></dc:title>',
        '  </rdf:Description>',
        '  <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmp:CreatorTool="Super Crown Tools"/>',
        ' </rdf:RDF>',
        '</x:xmpmeta>',
        '<?xpacket end="w"?>',
      ].join('\n');

      const stream = out.context.flateStream(new TextEncoder().encode(xmp));
      const ref = out.context.register(stream);
      out.catalog.set(PDFName.of('Metadata'), ref);
      out.catalog.set(PDFName.of('Lang'), PDFString.of('en-US'));

      downloadBytes(await savePdf(out), `${base}-pdfa.pdf`);
      return 'Converted with PDF/A-3B identification (XMP) metadata and a clean rebuilt structure.';
    }}
  >
    {() => (
      <p className="text-[11px] text-gray-500 mt-4">
        Rebuilds the document with PDF/A-3B identification metadata (XMP packet with pdfaid:part 3,
        conformance B), document language, and clean catalog info — the standard self-contained format
        used for long-term archiving.
      </p>
    )}
  </PdfToolShell>
);

// ---------------------------------------------------------------------------
// 12. PDF page inspector (PDF Page Counter & Metadata Inspector)
// ---------------------------------------------------------------------------

interface InspectorReport {
  pages: number;
  fileSize: number;
  info: Record<string, string>;
  sizes: { w: number; h: number }[];
}

export const PdfPageInspector: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [report, setReport] = useState<InspectorReport | null>(null);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel="Inspect PDF"
      onProcess={async (files) => {
        const file = files[0];
        const bytes = await fileToBytes(file);
        let doc;
        try {
          doc = await openPdfJs(bytes);
        } catch {
          throw new Error(READ_ERROR);
        }
        const meta: any = await doc.getMetadata().catch(() => null);
        const info: Record<string, any> = (meta?.info ?? {}) as Record<string, any>;
        const pick = (v: any) => (v === undefined || v === null || v === '' ? '—' : String(v));

        const sizes: { w: number; h: number }[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          sizes.push({ w: Math.round(vp.width * 10) / 10, h: Math.round(vp.height * 10) / 10 });
        }

        setReport({
          pages: doc.numPages,
          fileSize: file.size,
          info: {
            Title: pick(info.Title),
            Author: pick(info.Author),
            Creator: pick(info.Creator),
            Producer: pick(info.Producer),
            Created: pick(info.CreationDate),
            Modified: pick(info.ModDate),
          },
          sizes,
        });
        return `Inspected ${doc.numPages} pages.`;
      }}
    >
      {() =>
        report ? (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pages', value: String(report.pages) },
                { label: 'File size', value: formatBytes(report.fileSize) },
                { label: 'Title', value: report.info.Title },
                { label: 'Author', value: report.info.Author },
                { label: 'Creator', value: report.info.Creator },
                { label: 'Producer', value: report.info.Producer },
                { label: 'Created', value: report.info.Created },
                { label: 'Modified', value: report.info.Modified },
              ].map((f) => (
                <div
                  key={f.label}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {f.label}
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white truncate" title={f.value}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-left text-gray-500">
                    <th className="px-3 py-2 font-bold">Page</th>
                    <th className="px-3 py-2 font-bold">Size (pt)</th>
                    <th className="px-3 py-2 font-bold">Size (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.sizes.map((s, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-1.5 font-semibold text-gray-800 dark:text-gray-100">{i + 1}</td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">
                        {s.w} × {s.h}
                      </td>
                      <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">
                        {(s.w / 72).toFixed(2)} × {(s.h / 72).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-500 mt-4">
            Select a PDF to see its page count, document metadata, and the exact size of every page.
          </p>
        )
      }
    </PdfToolShell>
  );
};
