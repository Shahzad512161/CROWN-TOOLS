// Competitor-inspired PDF tools (batch A) — page-level power tools that go
// beyond the basic suite: delete/extract pages, alternate mixing, bookmark /
// size / text splitting, flattening, Bates numbering, bookmark creation,
// metadata editing, page flipping, N-up imposition, page resizing,
// annotation removal, headers & footers, and page backgrounds.
// All processing happens 100% in the browser.
import React, { useState } from 'react';
import { Download, Plus, Trash2, X } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { COMMON, lookup, useLang, useStrings } from '../../../lib/LangContext';
import { PDF_STRINGS, pluralize } from '../../../lib/strings/pdf';
import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  baseName,
  canvasToBlob,
  downloadBytes,
  downloadZip,
  fileToBytes,
  formatBytes,
  getPageText,
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


function readError(fileName?: string, lang: 'en' | 'es' | 'fr' | 'ar' | 'ru' = 'en'): string {
  return fileName
    ? lookup(PDF_STRINGS, lang, 'readErrorNamed').replace('{name}', fileName)
    : lookup(PDF_STRINGS, lang, 'readError');
}

/** Load a PDF, converting low-level failures into a clear message. */
async function loadOrThrow(bytes: Uint8Array, fileName?: string, lang: 'en' | 'es' | 'fr' | 'ar' | 'ru' = 'en'): Promise<PDFDocument> {
  try {
    return await loadPdf(bytes);
  } catch {
    throw new Error(readError(fileName, lang));
  }
}

/** Build a new PDF containing only the given 0-based page indices of src. */
async function buildFromIndices(src: PDFDocument, indices: number[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
  return savePdf(out);
}

/** Make a string safe to use as a file name. */
function sanitizeFileName(name: string, fallback = 'section'): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned || fallback;
}

/** Parse a '#rrggbb' color into a pdf-lib rgb color. */
function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return rgb(1, 1, 1);
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}


// ---------------------------------------------------------------------------
// 1. Delete PDF Pages (visual thumbnail picker)
// ---------------------------------------------------------------------------

export const DeletePdfPages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [srcName, setSrcName] = useState('document.pdf');
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const handleFilesChange = async (files: File[]) => {
    setSelected(new Set());
    setThumbs([]);
    setPageCount(0);
    setSrcBytes(null);
    if (!files.length) return;
    setLoading(true);
    try {
      const bytes = await fileToBytes(files[0]);
      const jsDoc = await openPdfJs(bytes);
      setSrcBytes(bytes);
      setSrcName(files[0].name);
      setPageCount(jsDoc.numPages);
      setThumbs(await renderThumbnails(bytes));
    } catch {
      setSrcBytes(null);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const applyDelete = async (setStatus: (s: any, m?: string) => void) => {
    if (!srcBytes) return;
    if (selected.size === 0) {
      setStatus('error', s('errDeleteSelect'));
      return;
    }
    if (selected.size >= pageCount) {
      setStatus('error', s('errDeleteAll'));
      return;
    }
    setStatus('working', s('deletingPages'));
    try {
      const src = await loadOrThrow(srcBytes, srcName, lang);
      const keep = src.getPageIndices().filter((i) => !selected.has(i));
      const data = await buildFromIndices(src, keep);
      downloadBytes(data, `${baseName(srcName)}-pages-deleted.pdf`);
      setStatus(
        'done',
        s('deleteDoneA').replace('{deleted}', pluralize(lang, selected.size, 'wordPage', 'wordPages')).replace('{kept}', pluralize(lang, keep.length, 'wordPage', 'wordPages'))
      );
    } catch (err: any) {
      setStatus('error', err?.message || s('errDeleteFailed'));
    }
  };

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      dropzoneHint={s('deleteHintA')}
      onFilesChange={handleFilesChange}
    >
      {(ctx) => {
        if (!ctx.files.length) {
          return (
            <p className="text-[11px] text-gray-500 mt-4">
              {s('deleteChoose')}
            </p>
          );
        }
        if (loading) {
          return <p className="text-xs text-gray-500 mt-4">{s('loadingThumbnails')}</p>;
        }
        if (!srcBytes) {
          return (
            <p className="text-xs text-red-500 mt-4">
              {s('readErrorTryOther')}
            </p>
          );
        }
        const tiles = Array.from({ length: pageCount }, (_, i) => i);
        return (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] text-gray-500">
                {s('deleteHeaderLine').replace('{selected}', String(selected.size)).replace('{pages}', pluralize(lang, pageCount, 'wordPage', 'wordPages')).replace('{remain}', String(pageCount - selected.size))}
              </span>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="ms-auto px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                >
                  {s('clearSelection')}
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {tiles.map((i) => {
                const isSel = selected.has(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggle(i)}
                    className={`relative border rounded-xl p-2 text-start cursor-pointer transition-colors ${
                      isSel
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-400'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-orange-400'
                    }`}
                    aria-label={s('togglePageDeletion').replace('{n}', String(i + 1))}
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white flex items-center justify-center min-h-[110px]">
                      {thumbs[i] ? (
                        <img
                          src={thumbs[i]}
                          alt={`${c('page')} ${i + 1}`}
                          className={`max-h-[150px] w-auto object-contain ${isSel ? 'opacity-40' : ''}`}
                        />
                      ) : (
                        <span className="text-[11px] text-gray-400">{c('page')} {i + 1}</span>
                      )}
                      <span className="absolute top-1 start-1 text-[10px] font-black bg-black/70 text-white rounded-md px-1.5 py-0.5">
                        {i + 1}
                      </span>
                      {isSel && (
                        <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-black uppercase tracking-wide text-red-600">
                          {s('willBeDeleted')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {pageCount > thumbs.length && thumbs.length > 0 && (
              <p className="text-[11px] text-gray-500 mt-2">
                {s('thumbsNote').replace('{count}', String(thumbs.length))}
              </p>
            )}
            <button
              type="button"
              onClick={() => void applyDelete(ctx.setStatus)}
              disabled={selected.size === 0}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {selected.size > 0 ? s('deleteBtnTpl').replace('{selected}', pluralize(lang, selected.size, 'wordSelectedPage', 'wordSelectedPages')) : s('deleteBtnNone')}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 2. Extract PDF Pages
// ---------------------------------------------------------------------------

export const ExtractPdfPages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [ranges, setRanges] = useState('1-3');
  const [separate, setSeparate] = useState(false);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('extractPagesAction')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        const src = await loadOrThrow(bytes, files[0].name, lang);
        const count = src.getPageCount();
        const base = baseName(files[0]);

        if (separate) {
          const groups = ranges
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean);
          const outputs: { name: string; data: Uint8Array }[] = [];
          for (const group of groups) {
            const pages = parsePageRanges(group, count);
            if (!pages.length) continue;
            const data = await buildFromIndices(
              src,
              pages.map((p) => p - 1)
            );
            outputs.push({ name: `${base}-pages-${group.replace(/\s+/g, '')}.pdf`, data });
          }
          if (!outputs.length) {
            throw new Error(
              s('errNoValidPagesRange').replace('{pages}', pluralize(lang, count, 'wordPage', 'wordPages'))
            );
          }
          if (outputs.length === 1) {
            downloadBytes(outputs[0].data, outputs[0].name);
          } else {
            await downloadZip(outputs, `${base}-extracted.zip`);
          }
          return s('extractSeparateResult').replace('{count}', String(outputs.length)).replace('{name}', files[0].name);
        }

        const pages = parsePageRanges(ranges, count);
        if (!pages.length) {
          throw new Error(s('errNoValidPagesRange').replace('{pages}', pluralize(lang, count, 'wordPage', 'wordPages')));
        }
        const data = await buildFromIndices(
          src,
          pages.map((p) => p - 1)
        );
        downloadBytes(data, `${base}-extracted.pdf`);
        return s('extractIntoNewPdf').replace('{pages}', pluralize(lang, pages.length, 'wordPage', 'wordPages'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('pagesToExtract')}</OptLabel>
            <OptInput
              type="text"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder={s('rangePlaceholderEx')} dir="ltr"
            />
          </div>
          <div className="flex items-end pb-1">
            <OptCheck
              label={s('onePdfPerGroup')}
              checked={separate}
              onChange={setSeparate}
            />
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('extractZipNote')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Alternate Mix (interleave pages of 2+ PDFs)
// ---------------------------------------------------------------------------

export const AlternateMixPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [startWith, setStartWith] = useState<'first' | 'second'>('first');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      multiple
      minFiles={2}
      actionLabel={s('mixActionAlt')}
      dropzoneHint={s('mixHintAlt')}
      onProcess={async (files) => {
        if (files.length < 2) {
          throw new Error(s('errMixTwo'));
        }
        const docs: PDFDocument[] = [];
        for (const f of files) {
          docs.push(await loadOrThrow(await fileToBytes(f), f.name, lang));
        }
        // Order of documents to cycle through, starting with the chosen file.
        const order = docs.map((_, i) => i);
        if (startWith === 'second' && order.length > 1) {
          order.push(order.shift()!);
        }
        const maxCount = Math.max(...docs.map((d) => d.getPageCount()));
        const out = await PDFDocument.create();
        let added = 0;
        for (let i = 0; i < maxCount; i++) {
          for (const di of order) {
            const doc = docs[di];
            if (i < doc.getPageCount()) {
              const [copied] = await out.copyPages(doc, [i]);
              out.addPage(copied);
              added++;
            }
          }
        }
        downloadBytes(await savePdf(out), `${baseName(files[0])}-mixed.pdf`);
        return s('mixResultAlt').replace('{pages}', pluralize(lang, added, 'wordPage', 'wordPages')).replace('{files}', pluralize(lang, files.length, 'wordFile', 'wordFiles'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('startWith')}</OptLabel>
            <OptSelect
              value={startWith}
              onChange={(e) => setStartWith(e.target.value as 'first' | 'second')}
            >
              <option value="first">{s('firstFile')}</option>
              <option value="second">{s('secondFile')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('mixNoteAlt')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 4. Split by Bookmarks
// ---------------------------------------------------------------------------

export const SplitByBookmarks: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('splitBookmarksAction')}
      dropzoneHint={s('splitBookmarksHint2')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        let jsDoc;
        try {
          jsDoc = await openPdfJs(bytes);
        } catch {
          throw new Error(s('readError'));
        }
        const outline: any[] = (await jsDoc.getOutline()) || [];
        if (!outline.length) {
          throw new Error(s('errNoBookmarks'));
        }

        // Flatten the outline depth-first, resolving destinations to pages.
        const flat: { title: string; page: number }[] = [];
        const walk = async (items: any[]) => {
          for (const item of items) {
            try {
              let dest: any = item.dest;
              if (typeof dest === 'string') {
                dest = await jsDoc.getDestination(dest);
              }
              if (Array.isArray(dest) && dest.length) {
                const first = dest[0];
                const page =
                  typeof first === 'number' ? first : await jsDoc.getPageIndex(first);
                if (typeof page === 'number' && page >= 0 && page < jsDoc.numPages) {
                  flat.push({ title: String(item.title || s('untitled')).trim() || s('untitled'), page });
                }
              }
            } catch {
              // Skip bookmarks whose destination cannot be resolved.
            }
            if (Array.isArray(item.items) && item.items.length) {
              await walk(item.items);
            }
          }
        };
        await walk(outline);

        // Unique split points, ascending, with their titles.
        const byPage = new Map<number, string>();
        for (const bm of flat) {
          if (!byPage.has(bm.page)) byPage.set(bm.page, bm.title);
        }
        const points = [...byPage.keys()].sort((a, b) => a - b);
        if (!points.length) {
          throw new Error(s('errBookmarksResolve'));
        }

        const sections: { title: string; start: number; end: number }[] = [];
        if (points[0] > 0) {
          sections.push({ title: s('frontMatter'), start: 0, end: points[0] });
        }
        points.forEach((start, i) => {
          sections.push({
            title: byPage.get(start)!,
            start,
            end: i + 1 < points.length ? points[i + 1] : jsDoc.numPages,
          });
        });

        const src = await loadOrThrow(bytes, files[0].name, lang);
        const base = baseName(files[0]);
        const outputs: { name: string; data: Uint8Array }[] = [];
        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          const indices: number[] = [];
          for (let p = s.start; p < s.end; p++) indices.push(p);
          if (!indices.length) continue;
          const data = await buildFromIndices(src, indices);
          outputs.push({
            name: `${String(outputs.length + 1).padStart(2, '0')}-${sanitizeFileName(s.title)}.pdf`,
            data,
          });
        }
        if (!outputs.length) {
          throw new Error(s('errNoSections'));
        }
        if (outputs.length === 1) {
          downloadBytes(outputs[0].data, outputs[0].name);
        } else {
          await downloadZip(outputs, `${base}-by-bookmarks.zip`);
        }
        return s('splitBookmarksResult2').replace('{sections}', pluralize(lang, outputs.length, 'wordSection', 'wordSections'));
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// 5. Split in Half (two-page spreads → single pages)
// ---------------------------------------------------------------------------

export const SplitInHalf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [dir, setDir] = useState<'horizontal' | 'vertical'>('horizontal');
  const [reversed, setReversed] = useState(false);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('splitHalfAction')}
      dropzoneHint={s('splitHalfHint2')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        const src = await loadOrThrow(bytes, files[0].name, lang);
        const out = await PDFDocument.create();
        const count = src.getPageCount();
        for (let i = 0; i < count; i++) {
          const mb = src.getPage(i).getMediaBox();
          // Two separate copyPages calls: each returns an independent copy so
          // the two halves can carry different crop boxes.
          const [firstCopy] = await out.copyPages(src, [i]);
          const [secondCopy] = await out.copyPages(src, [i]);
          if (dir === 'horizontal') {
            firstCopy.setCropBox(mb.x, mb.y, mb.width / 2, mb.height); // left half
            secondCopy.setCropBox(mb.x + mb.width / 2, mb.y, mb.width / 2, mb.height); // right half
          } else {
            firstCopy.setCropBox(mb.x, mb.y, mb.width, mb.height / 2); // bottom half
            secondCopy.setCropBox(mb.x, mb.y + mb.height / 2, mb.width, mb.height / 2); // top half
          }
          const ordered = reversed ? [secondCopy, firstCopy] : [firstCopy, secondCopy];
          ordered.forEach((p) => out.addPage(p));
        }
        downloadBytes(await savePdf(out), `${baseName(files[0])}-split-half.pdf`);
        return s('splitHalfResult2').replace('{spread}', pluralize(lang, count, 'wordSpreadPage', 'wordSpreadPages')).replace('{single}', pluralize(lang, count * 2, 'wordSinglePage', 'wordSinglePages'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('splitDirection')}</OptLabel>
            <OptSelect
              value={dir}
              onChange={(e) => {
                setDir(e.target.value as 'horizontal' | 'vertical');
                setReversed(false);
              }}
            >
              <option value="horizontal">{s('splitHalfHorizontal2')}</option>
              <option value="vertical">{s('splitHalfVertical2')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('halfOrder')}</OptLabel>
            <OptSelect
              value={reversed ? 'reversed' : 'natural'}
              onChange={(e) => setReversed(e.target.value === 'reversed')}
            >
              {dir === 'horizontal' ? (
                <>
                  <option value="natural">{s('leftThenRight')}</option>
                  <option value="reversed">{s('rightThenLeft')}</option>
                </>
              ) : (
                <>
                  <option value="natural">{s('bottomThenTop')}</option>
                  <option value="reversed">{s('topThenBottom')}</option>
                </>
              )}
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('splitHalfNote')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. Split by File Size
// ---------------------------------------------------------------------------

export const SplitBySize: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [sizeStr, setSizeStr] = useState('2');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('splitSizeAction')}
      onProcess={async (files) => {
        const mb = parseFloat(sizeStr);
        if (!Number.isFinite(mb) || mb < 0.1) {
          throw new Error(s('errSplitSizeMin'));
        }
        const targetBytes = mb * 1024 * 1024;
        const bytes = await fileToBytes(files[0]);
        const src = await loadOrThrow(bytes, files[0].name, lang);
        const count = src.getPageCount();

        // Greedy chunking: keep adding pages to the current part while a
        // probe build stays under the target size. Probe saves make this
        // O(n^2) in the worst case, which is fine for typical documents.
        const chunks: number[][] = [];
        let current: number[] = [];
        for (let i = 0; i < count; i++) {
          const candidate = [...current, i];
          const probe = await buildFromIndices(src, candidate);
          if (probe.length > targetBytes && current.length > 0) {
            chunks.push(current);
            current = [i];
          } else {
            current = candidate;
          }
        }
        if (current.length) chunks.push(current);

        const base = baseName(files[0]);
        if (chunks.length === 1) {
          const data = await buildFromIndices(src, chunks[0]);
          downloadBytes(data, `${base}.pdf`);
          return s('splitSizeFits').replace('{size}', formatBytes(data.length)).replace('{mb}', String(mb));
        }
        const outputs: { name: string; data: Uint8Array }[] = [];
        for (let i = 0; i < chunks.length; i++) {
          outputs.push({
            name: `${base}-part-${i + 1}.pdf`,
            data: await buildFromIndices(src, chunks[i]),
          });
        }
        await downloadZip(outputs, `${base}-split-by-size.zip`);
        const summary = outputs
          .map((o, i) => `${s('partWord')} ${i + 1}: ${pluralize(lang, chunks[i].length, 'wordPage', 'wordPages')}, ${formatBytes(o.data.length)}`)
          .join(' · ');
        return s('splitSizeResult2').replace('{count}', String(outputs.length)).replace('{mb}', String(mb)).replace('{summary}', summary);
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('maxSizePerPart')}</OptLabel>
            <OptInput
              type="number"
              min="0.1"
              step="0.1"
              value={sizeStr}
              onChange={(e) => setSizeStr(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('splitSizeNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. Split by Text (split before each page containing a phrase)
// ---------------------------------------------------------------------------

export const SplitByText: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [text, setText] = useState('');
  const [discard, setDiscard] = useState(false);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('splitTextAction')}
      onProcess={async (files) => {
        const needle = text.trim();
        if (!needle) {
          throw new Error(s('errSplitTextEnter'));
        }
        const bytes = await fileToBytes(files[0]);
        let jsDoc;
        try {
          jsDoc = await openPdfJs(bytes);
        } catch {
          throw new Error(s('readError'));
        }
        const total = jsDoc.numPages;
        const matches: number[] = []; // 0-based pages containing the text
        for (let p = 1; p <= total; p++) {
          const pageText = await getPageText(jsDoc, p);
          if (pageText.toLowerCase().includes(needle.toLowerCase())) {
            matches.push(p - 1);
          }
        }
        if (!matches.length) {
          throw new Error(s('splitTextNotFound2').replace('{term}', needle));
        }

        // Section boundaries: a section starts at each match page; any pages
        // before the first match form a leading section.
        const sections: { start: number; end: number }[] = [];
        if (matches[0] > 0) {
          sections.push({ start: 0, end: matches[0] });
        }
        matches.forEach((start, i) => {
          sections.push({ start, end: i + 1 < matches.length ? matches[i + 1] : total });
        });

        const src = await loadOrThrow(bytes, files[0].name, lang);
        const base = baseName(files[0]);
        const outputs: { name: string; data: Uint8Array }[] = [];
        for (const s of sections) {
          const from = discard && matches.includes(s.start) ? s.start + 1 : s.start;
          const indices: number[] = [];
          for (let p = from; p < s.end; p++) indices.push(p);
          if (!indices.length) continue;
          outputs.push({
            name: `${base}-section-${outputs.length + 1}.pdf`,
            data: await buildFromIndices(src, indices),
          });
        }
        if (!outputs.length) {
          throw new Error(s('errDiscardAll'));
        }
        if (outputs.length === 1) {
          downloadBytes(outputs[0].data, outputs[0].name);
        } else {
          await downloadZip(outputs, `${base}-split-by-text.zip`);
        }
        return s('splitTextResult2').replace('{needle}', needle).replace('{pages}', pluralize(lang, matches.length, 'wordPage', 'wordPages')).replace('{sections}', pluralize(lang, outputs.length, 'wordSection', 'wordSections'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('splitBeforePages')}</OptLabel>
            <OptInput
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={s('egChapterInvoice')}
            />
          </div>
          <div className="flex items-end pb-1">
            <OptCheck
              label={s('discardSeparator')}
              checked={discard}
              onChange={setDiscard}
            />
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('splitTextNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. Flatten PDF (form fields, or everything)
// ---------------------------------------------------------------------------

export const FlattenPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [mode, setMode] = useState<'forms' | 'everything'>('forms');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('flattenAction')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        const base = baseName(files[0]);

        if (mode === 'forms') {
          const doc = await loadOrThrow(bytes, files[0].name, lang);
          const form = doc.getForm();
          const count = form.getFields().length;
          if (count === 0) {
            const rebuilt = await buildFromIndices(doc, doc.getPageIndices());
            downloadBytes(rebuilt, `${base}-flattened.pdf`);
            return s('flattenNoFields');
          }
          form.updateFieldAppearances();
          form.flatten();
          downloadBytes(await savePdf(doc), `${base}-flattened.pdf`);
          return s('flattenFormsResult2').replace('{fields}', pluralize(lang, count, 'wordFormField', 'wordFormFields'));
        }

        // Flatten everything: rasterize each page so forms, annotations and
        // layers are permanently baked into the page image.
        let jsDoc;
        try {
          jsDoc = await openPdfJs(bytes);
        } catch {
          throw new Error(s('readError'));
        }
        const out = await PDFDocument.create();
        for (let i = 1; i <= jsDoc.numPages; i++) {
          const page = await jsDoc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          const canvas = await renderPageCanvas(jsDoc, i, 2.5);
          const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
          const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          const newPage = out.addPage([vp.width, vp.height]);
          newPage.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
        }
        downloadBytes(await savePdf(out), `${base}-flattened.pdf`);
        return s('flattenEverythingResult').replace('{pages}', pluralize(lang, jsDoc.numPages, 'wordPage', 'wordPages'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('flattenModeLabel')}</OptLabel>
            <OptSelect
              value={mode}
              onChange={(e) => setMode(e.target.value as 'forms' | 'everything')}
            >
              <option value="forms">{s('flattenFormsOnly')}</option>
              <option value="everything">{s('flattenEverythingOpt')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('flattenNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 9. Bates Numbering (sequential stamps across multiple PDFs)
// ---------------------------------------------------------------------------

export const BatesNumbering: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [prefix, setPrefix] = useState('CASE-');
  const [startNum, setStartNum] = useState('1');
  const [digits, setDigits] = useState('6');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-center' | 'top-right'>(
    'bottom-right'
  );
  const [fontSize, setFontSize] = useState('10');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      multiple
      actionLabel={s('batesAction')}
      dropzoneHint={s('batesHint2')}
      onProcess={async (files) => {
        const start = parseInt(startNum, 10);
        const pad = parseInt(digits, 10);
        const size = parseFloat(fontSize);
        if (!Number.isFinite(start) || start < 0) {
          throw new Error(s('errBatesStart'));
        }
        if (!Number.isFinite(pad) || pad < 1 || pad > 12) {
          throw new Error(s('errBatesPadding'));
        }
        if (!Number.isFinite(size) || size < 6 || size > 24) {
          throw new Error(s('errBatesFontSize'));
        }
        let n = start;
        let totalPages = 0;
        const outputs: { name: string; data: Uint8Array }[] = [];
        for (const file of files) {
          const doc = await loadOrThrow(await fileToBytes(file), file.name, lang);
          const font = await doc.embedFont(StandardFonts.Helvetica);
          for (const page of doc.getPages()) {
            const label = `${prefix}${String(n).padStart(pad, '0')}`;
            n++;
            totalPages++;
            const { width, height } = page.getSize();
            const tw = font.widthOfTextAtSize(label, size);
            const x =
              position === 'bottom-center' ? (width - tw) / 2 : width - 28 - tw;
            const y = position === 'top-right' ? height - 20 - size : 20;
            page.drawText(label, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
          }
          outputs.push({ name: `${baseName(file)}-bates.pdf`, data: await savePdf(doc) });
        }
        const range = `${prefix}${String(start).padStart(pad, '0')} – ${prefix}${String(n - 1).padStart(pad, '0')}`;
        if (outputs.length === 1) {
          downloadBytes(outputs[0].data, outputs[0].name);
        } else {
          await downloadZip(outputs, 'bates-numbered.zip');
        }
        return s('batesResult2').replace('{range}', range).replace('{pages}', pluralize(lang, totalPages, 'wordPage', 'wordPages')).replace('{files}', pluralize(lang, files.length, 'wordFile', 'wordFiles'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('batesPrefix')}</OptLabel>
            <OptInput
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder={s('batesPrefixPlaceholder')} dir="ltr"
            />
          </div>
          <div>
            <OptLabel>{s('startingNumber')}</OptLabel>
            <OptInput
              type="number"
              min="0"
              value={startNum}
              onChange={(e) => setStartNum(e.target.value)}
            />
          </div>
          <div>
            <OptLabel>{s('batesDigits')}</OptLabel>
            <OptInput
              type="number"
              min="1"
              max="12"
              value={digits}
              onChange={(e) => setDigits(e.target.value)}
            />
          </div>
          <div>
            <OptLabel>{s('positionLabel')}</OptLabel>
            <OptSelect
              value={position}
              onChange={(e) =>
                setPosition(e.target.value as 'bottom-right' | 'bottom-center' | 'top-right')
              }
            >
              <option value="bottom-right">{s('posBottomRight')}</option>
              <option value="bottom-center">{s('posBottomCenter')}</option>
              <option value="top-right">{s('posTopRight')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('fontSizePt')}</OptLabel>
            <OptInput
              type="number"
              min="6"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('batesNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 10. Create Bookmarks (build an outline / table of contents)
// ---------------------------------------------------------------------------

interface BookmarkRow {
  title: string;
  page: string;
}

export const CreateBookmarks: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [srcName, setSrcName] = useState('document.pdf');
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<BookmarkRow[]>([{ title: '', page: '1' }]);
  const [building, setBuilding] = useState(false);

  const handleFilesChange = async (files: File[]) => {
    setSrcBytes(null);
    setPageCount(0);
    if (!files.length) return;
    try {
      const bytes = await fileToBytes(files[0]);
      const jsDoc = await openPdfJs(bytes);
      setSrcBytes(bytes);
      setSrcName(files[0].name);
      setPageCount(jsDoc.numPages);
    } catch {
      setSrcBytes(null);
      setPageCount(0);
    }
  };

  const updateRow = (i: number, patch: Partial<BookmarkRow>) => {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  const applyPreset = async (setStatus: (s: any, m?: string) => void) => {
    if (!srcBytes) return;
    setStatus('working', s('bookmarksReading'));
    try {
      const jsDoc = await openPdfJs(srcBytes);
      const next: BookmarkRow[] = [];
      for (let p = 1; p <= jsDoc.numPages; p++) {
        const text = await getPageText(jsDoc, p);
        const firstLine =
          text
            .split('\n')
            .map((s) => s.trim())
            .find(Boolean) || `${c('page')} ${p}`;
        next.push({ title: firstLine.slice(0, 80), page: String(p) });
      }
      setRows(next);
      setStatus('done', s('bookmarksPresetDone').replace('{rows}', pluralize(lang, next.length, 'wordBookmarkRow', 'wordBookmarkRows')));
    } catch {
      setStatus('error', s('readError'));
    }
  };

  const applyBookmarks = async (setStatus: (s: any, m?: string) => void) => {
    if (!srcBytes || building) return;
    const valid = rows
      .map((r) => ({ title: r.title.trim(), page: parseInt(r.page, 10) }))
      .filter(
        (r) => r.title && Number.isFinite(r.page) && r.page >= 1 && r.page <= pageCount
      );
    if (!valid.length) {
      setStatus(
        'error',
        s('bookmarksNeedValid').replace('{count}', String(pageCount))
      );
      return;
    }
    const sorted = [...valid].sort((a, b) => a.page - b.page);
    setBuilding(true);
    setStatus('working', s('bookmarksBuilding'));
    try {
      const doc = await loadOrThrow(srcBytes, srcName, lang);
      const context = doc.context;
      const outlinesDict: any = context.obj({
        Type: PDFName.of('Outlines'),
        Count: sorted.length,
      });
      const outlinesRef = context.register(outlinesDict);

      const itemDicts: any[] = [];
      const itemRefs: any[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const dict: any = context.obj({});
        itemDicts.push(dict);
        itemRefs.push(context.register(dict));
      }
      sorted.forEach((bm, i) => {
        const dict = itemDicts[i];
        const page = doc.getPage(bm.page - 1);
        const pageHeight = page.getSize().height;
        dict.set(PDFName.of('Title'), PDFString.of(bm.title));
        dict.set(PDFName.of('Parent'), outlinesRef);
        dict.set(
          PDFName.of('Dest'),
          context.obj([page.ref, PDFName.of('XYZ'), null, pageHeight, null])
        );
        if (i > 0) dict.set(PDFName.of('Prev'), itemRefs[i - 1]);
        if (i < sorted.length - 1) dict.set(PDFName.of('Next'), itemRefs[i + 1]);
      });
      outlinesDict.set(PDFName.of('First'), itemRefs[0]);
      outlinesDict.set(PDFName.of('Last'), itemRefs[itemRefs.length - 1]);
      doc.catalog.set(PDFName.of('Outlines'), outlinesRef);
      doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'));

      downloadBytes(await savePdf(doc), `${baseName(srcName)}-bookmarked.pdf`);
      setStatus(
        'done',
        s('bookmarksAddedDone').replace('{bookmarks}', pluralize(lang, sorted.length, 'wordBookmark', 'wordBookmarks'))
      );
    } catch (err: any) {
      setStatus('error', err?.message || s('errBookmarksAdd'));
    } finally {
      setBuilding(false);
    }
  };

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      dropzoneHint={s('bookmarksHint2')}
      onFilesChange={handleFilesChange}
    >
      {(ctx) => {
        if (!ctx.files.length) {
          return (
            <p className="text-[11px] text-gray-500 mt-4">
              {s('bookmarksChoose')}
            </p>
          );
        }
        if (!srcBytes) {
          return <p className="text-xs text-red-500 mt-4">{s('readErrorTryOther')}</p>;
        }
        return (
          <div className="mt-4">
            <div className="space-y-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1">
                    {i === 0 && <OptLabel>{s('bookmarkTitleLabel')}</OptLabel>}
                    <OptInput
                      type="text"
                      value={row.title}
                      onChange={(e) => updateRow(i, { title: e.target.value })}
                      placeholder={s('egIntroduction')}
                    />
                  </div>
                  <div className="w-24">
                    {i === 0 && <OptLabel>{c('page')}</OptLabel>}
                    <OptInput
                      type="number"
                      min="1"
                      max={pageCount}
                      value={row.page}
                      onChange={(e) => updateRow(i, { page: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                    className={`p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-red-500 hover:border-red-400 cursor-pointer ${i === 0 ? 'mt-5' : ''}`}
                    aria-label={s('removeBookmarkRow').replace('{n}', String(i + 1))}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, { title: '', page: '1' }])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {s('addBookmarkBtn')}
              </button>
              <button
                type="button"
                onClick={() => void applyPreset(ctx.setStatus)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                {s('oneBookmarkPerPage')}
              </button>
              <span className="text-[11px] text-gray-500 ms-auto">
                {s('pagesInThisPdf').replace('{pages}', pluralize(lang, pageCount, 'wordPage', 'wordPages'))}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void applyBookmarks(ctx.setStatus)}
              disabled={building}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {building ? s('buildingLabel') : s('addBookmarksDownload')}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 11. Edit Metadata (title, author, subject, keywords, creator, producer)
// ---------------------------------------------------------------------------

interface MetaFields {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

const EMPTY_META: MetaFields = {
  title: '',
  author: '',
  subject: '',
  keywords: '',
  creator: '',
  producer: '',
};

export const EditMetadata: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [srcBytes, setSrcBytes] = useState<Uint8Array | null>(null);
  const [srcName, setSrcName] = useState('document.pdf');
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [meta, setMeta] = useState<MetaFields>(EMPTY_META);

  const handleFilesChange = async (files: File[]) => {
    setSrcBytes(null);
    setMeta(EMPTY_META);
    setPageCount(0);
    if (!files.length) return;
    try {
      const bytes = await fileToBytes(files[0]);
      const doc = await loadPdf(bytes);
      const kw: any = doc.getKeywords();
      setMeta({
        title: doc.getTitle() || '',
        author: doc.getAuthor() || '',
        subject: doc.getSubject() || '',
        keywords: Array.isArray(kw) ? kw.join(', ') : kw || '',
        creator: doc.getCreator() || '',
        producer: doc.getProducer() || '',
      });
      setSrcBytes(bytes);
      setSrcName(files[0].name);
      setFileSize(files[0].size);
      setPageCount(doc.getPageCount());
    } catch {
      setSrcBytes(null);
    }
  };

  const applyMeta = async (setStatus: (s: any, m?: string) => void) => {
    if (!srcBytes) return;
    setStatus('working', s('metadataUpdating'));
    try {
      const doc = await loadOrThrow(srcBytes, srcName, lang);
      doc.setTitle(meta.title);
      doc.setAuthor(meta.author);
      doc.setSubject(meta.subject);
      doc.setKeywords(
        meta.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      );
      doc.setCreator(meta.creator);
      doc.setProducer(meta.producer);
      try {
        doc.setModificationDate(new Date());
      } catch {
        // Older PDFs without a mod-date entry simply skip this.
      }
      downloadBytes(await savePdf(doc), `${baseName(srcName)}-metadata.pdf`);
      setStatus('done', s('metadataDone2'));
    } catch (err: any) {
      setStatus('error', err?.message || s('errMetadataUpdate'));
    }
  };

  const field = (label: string, key: keyof MetaFields, placeholder: string) => (
    <div>
      <OptLabel>{label}</OptLabel>
      <OptInput
        type="text"
        value={meta[key]}
        onChange={(e) => setMeta((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      dropzoneHint={s('metadataHint2')}
      onFilesChange={handleFilesChange}
    >
      {(ctx) => {
        if (!ctx.files.length) {
          return (
            <p className="text-[11px] text-gray-500 mt-4">
              {s('metadataChoose')}
            </p>
          );
        }
        if (!srcBytes) {
          return <p className="text-xs text-red-500 mt-4">{s('readErrorTryOther')}</p>;
        }
        return (
          <div className="mt-4">
            <p className="text-[11px] text-gray-500 mb-3">
              {srcName} · {pluralize(lang, pageCount, 'wordPage', 'wordPages')} · {formatBytes(fileSize)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {field(s('metaTitle'), 'title', s('docTitlePlaceholder'))}
              {field(s('metaAuthor'), 'author', s('authorNamePlaceholder'))}
              {field(s('metaSubject'), 'subject', s('subjectPlaceholder'))}
              {field(s('keywordsCommaLabel'), 'keywords', 'invoice, 2026, report')}
              {field(s('metaCreator'), 'creator', s('creatorPlaceholder'))}
              {field(s('metaProducer'), 'producer', s('producerPlaceholder'))}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setMeta(EMPTY_META)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              >
                {s('clearAllMetadata')}
              </button>
              <button
                type="button"
                onClick={() => void applyMeta(ctx.setStatus)}
                className="ms-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> {s('saveMetadataDownload')}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              {s('metadataNote2')}
            </p>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 12. Flip PDF Pages (mirror horizontally or vertically)
// ---------------------------------------------------------------------------

export const FlipPdfPages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [dir, setDir] = useState<'horizontal' | 'vertical'>('horizontal');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('flipAction')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        let jsDoc;
        try {
          jsDoc = await openPdfJs(bytes);
        } catch {
          throw new Error(s('readError'));
        }
        const out = await PDFDocument.create();
        for (let i = 1; i <= jsDoc.numPages; i++) {
          const page = await jsDoc.getPage(i);
          const vp = page.getViewport({ scale: 1 });
          const canvas = await renderPageCanvas(jsDoc, i, 2.5);
          const flipped = document.createElement('canvas');
          flipped.width = canvas.width;
          flipped.height = canvas.height;
          const fctx = flipped.getContext('2d')!;
          fctx.fillStyle = '#ffffff';
          fctx.fillRect(0, 0, flipped.width, flipped.height);
          if (dir === 'horizontal') {
            fctx.translate(flipped.width, 0);
            fctx.scale(-1, 1);
          } else {
            fctx.translate(0, flipped.height);
            fctx.scale(1, -1);
          }
          fctx.drawImage(canvas, 0, 0);
          const blob = await canvasToBlob(flipped, 'image/jpeg', 0.92);
          const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          const newPage = out.addPage([vp.width, vp.height]);
          newPage.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
        }
        downloadBytes(await savePdf(out), `${baseName(files[0])}-flipped.pdf`);
        return s('flipResult2').replace('{pages}', pluralize(lang, jsDoc.numPages, 'wordPage', 'wordPages')).replace('{dir}', dir === 'horizontal' ? s('flipDirH2') : s('flipDirV2'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('flipDirection')}</OptLabel>
            <OptSelect
              value={dir}
              onChange={(e) => setDir(e.target.value as 'horizontal' | 'vertical')}
            >
              <option value="horizontal">{s('flipHorizontalOpt2')}</option>
              <option value="vertical">{s('flipVerticalOpt2')}</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('flipNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 13. N-up (multiple pages per sheet)
// ---------------------------------------------------------------------------

const NUP_GRIDS: Record<string, Record<number, { cols: number; rows: number }>> = {
  portrait: {
    2: { cols: 1, rows: 2 },
    4: { cols: 2, rows: 2 },
    6: { cols: 2, rows: 3 },
    9: { cols: 3, rows: 3 },
  },
  landscape: {
    2: { cols: 2, rows: 1 },
    4: { cols: 2, rows: 2 },
    6: { cols: 3, rows: 2 },
    9: { cols: 3, rows: 3 },
  },
};

const SHEET_SIZES: Record<string, [number, number]> = {
  a4: [595, 842],
  a3: [842, 1191],
  letter: [612, 792],
};

export const NupPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [perSheet, setPerSheet] = useState('4');
  const [sheetSize, setSheetSize] = useState<'a4' | 'a3' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState('18');
  const [gap, setGap] = useState('10');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('nupAction2')}
      onProcess={async (files) => {
        const n = parseInt(perSheet, 10);
        const m = parseFloat(margin);
        const g = parseFloat(gap);
        const bytes = await fileToBytes(files[0]);
        const out = await PDFDocument.create();
        let embedded;
        try {
          embedded = await out.embedPdf(bytes, Array.from({ length: (await loadPdf(bytes)).getPageCount() }, (_, i) => i));
        } catch {
          throw new Error(s('readError'));
        }
        if (!embedded.length) {
          throw new Error(s('errNoPagesFound'));
        }
        let [sheetW, sheetH] = SHEET_SIZES[sheetSize];
        if (orientation === 'landscape') {
          [sheetW, sheetH] = [sheetH, sheetW];
        }
        const { cols, rows } = NUP_GRIDS[orientation][n];
        const cellW = (sheetW - 2 * m - (cols - 1) * g) / cols;
        const cellH = (sheetH - 2 * m - (rows - 1) * g) / rows;

        let sheet: ReturnType<typeof out.addPage> | null = null;
        for (let i = 0; i < embedded.length; i++) {
          const slot = i % n;
          if (slot === 0 || !sheet) {
            sheet = out.addPage([sheetW, sheetH]);
          }
          const row = Math.floor(slot / cols);
          const col = slot % cols;
          const cellX = m + col * (cellW + g);
          const cellTop = m + row * (cellH + g); // distance from the top edge
          const ew = embedded[i].width;
          const eh = embedded[i].height;
          const scale = Math.min(cellW / ew, cellH / eh);
          const w = ew * scale;
          const h = eh * scale;
          const x = cellX + (cellW - w) / 2;
          // Convert the cell's top-based position to pdf-lib bottom-left origin.
          const y = sheetH - cellTop - cellH + (cellH - h) / 2;
          sheet.drawPage(embedded[i], { x, y, width: w, height: h });
        }
        const sheets = Math.ceil(embedded.length / n);
        downloadBytes(await savePdf(out), `${baseName(files[0])}-nup.pdf`);
        return s('nupResult2').replace('{pages}', pluralize(lang, embedded.length, 'wordPage', 'wordPages')).replace('{sheets}', pluralize(lang, sheets, 'wordSheet', 'wordSheets')).replace('{n}', String(n));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('pagesPerSheet')}</OptLabel>
            <OptSelect value={perSheet} onChange={(e) => setPerSheet(e.target.value)}>
              <option value="2">2-up</option>
              <option value="4">4-up</option>
              <option value="6">6-up</option>
              <option value="9">9-up</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('sheetSizeLabel')}</OptLabel>
            <OptSelect
              value={sheetSize}
              onChange={(e) => setSheetSize(e.target.value as 'a4' | 'a3' | 'letter')}
            >
              <option value="a4">A4</option>
              <option value="a3">A3</option>
              <option value="letter">Letter</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('sheetOrientation')}</OptLabel>
            <OptSelect
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
            >
              <option value="portrait">{s('portrait')}</option>
              <option value="landscape">{s('landscape')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('outerMarginPt')}</OptLabel>
            <OptSelect value={margin} onChange={(e) => setMargin(e.target.value)}>
              <option value="0">{s('noneZero')}</option>
              <option value="18">18 pt</option>
              <option value="36">36 pt</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('gapBetweenPages')}</OptLabel>
            <OptSelect value={gap} onChange={(e) => setGap(e.target.value)}>
              <option value="0">{s('noneZero')}</option>
              <option value="10">10 pt</option>
              <option value="20">20 pt</option>
            </OptSelect>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('nupNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 14. Resize PDF Pages (fit every page onto a standard sheet size)
// ---------------------------------------------------------------------------

const PAGE_TARGETS: Record<string, [number, number]> = {
  a3: [842, 1191],
  a4: [595, 842],
  a5: [420, 595],
  letter: [612, 792],
  legal: [612, 1008],
};

export const ResizePdfPages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [target, setTarget] = useState<string>('a4');
  const [mode, setMode] = useState<'fit' | 'stretch'>('fit');
  const [marginPt, setMarginPt] = useState('36');
  const [matchOrientation, setMatchOrientation] = useState(true);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('resizeAction')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        const out = await PDFDocument.create();
        let embedded;
        try {
          embedded = await out.embedPdf(bytes, Array.from({ length: (await loadPdf(bytes)).getPageCount() }, (_, i) => i));
        } catch {
          throw new Error(s('readError'));
        }
        if (!embedded.length) {
          throw new Error(s('errNoPagesFound'));
        }
        const extraMargin = parseFloat(marginPt);
        for (let i = 0; i < embedded.length; i++) {
          const ew = embedded[i].width;
          const eh = embedded[i].height;
          let tw: number;
          let th: number;
          if (target === 'margin') {
            const m = Number.isFinite(extraMargin) && extraMargin > 0 ? extraMargin : 0;
            tw = ew + 2 * m;
            th = eh + 2 * m;
          } else {
            [tw, th] = PAGE_TARGETS[target];
            // Keep each page's own orientation: swap the target if the source
            // page is landscape but the target is portrait (or vice versa).
            if (matchOrientation && ew > eh !== tw > th) {
              [tw, th] = [th, tw];
            }
          }
          const page = out.addPage([tw, th]);
          if (mode === 'stretch') {
            page.drawPage(embedded[i], { x: 0, y: 0, width: tw, height: th });
          } else {
            const scale = Math.min(tw / ew, th / eh);
            const w = ew * scale;
            const h = eh * scale;
            page.drawPage(embedded[i], { x: (tw - w) / 2, y: (th - h) / 2, width: w, height: h });
          }
        }
        downloadBytes(await savePdf(out), `${baseName(files[0])}-resized.pdf`);
        const label =
          target === 'margin'
            ? s('resizeMarginLabel').replace('{margin}', String(marginPt))
            : target.toUpperCase();
        return s('resizeResult2').replace('{pages}', pluralize(lang, embedded.length, 'wordPage', 'wordPages')).replace('{label}', label).replace('{mode}', mode === 'fit' ? s('resizeFitNote') : s('resizeStretchNote'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('targetPageSize')}</OptLabel>
            <OptSelect value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="a3">A3 (842 × 1191 pt)</option>
              <option value="a4">A4 (595 × 842 pt)</option>
              <option value="a5">A5 (420 × 595 pt)</option>
              <option value="letter">Letter (612 × 792 pt)</option>
              <option value="legal">Legal (612 × 1008 pt)</option>
              <option value="margin">{s('sameSizeMargin')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('scalingMode')}</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value as 'fit' | 'stretch')}>
              <option value="fit">{s('fitKeepAspect')}</option>
              <option value="stretch">{s('stretchFillPage')}</option>
            </OptSelect>
          </div>
          {target === 'margin' ? (
            <div>
              <OptLabel>{s('marginToAdd')}</OptLabel>
              <OptInput
                type="number"
                min="0"
                value={marginPt}
                onChange={(e) => setMarginPt(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex items-end pb-1">
              <OptCheck
                label={s('matchOrientation')}
                checked={matchOrientation}
                onChange={setMatchOrientation}
              />
            </div>
          )}
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('resizeNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 15. Remove Annotations (comments, highlights, stamps, markups)
// ---------------------------------------------------------------------------

export const RemoveAnnotations: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('removeAnnotationsAction')}
      dropzoneHint={s('removeAnnotHint2')}
      onProcess={async (files) => {
        const doc = await loadOrThrow(await fileToBytes(files[0]), files[0].name, lang);
        let count = 0;
        for (const page of doc.getPages()) {
          try {
            const annots = page.node.Annots();
            if (annots) {
              count += annots.size();
              page.node.set(PDFName.of('Annots'), doc.context.obj([]));
            }
          } catch {
            // A malformed annotation array on one page should not fail the job.
          }
        }
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-no-annotations.pdf`);
        if (count === 0) {
          return s('removeAnnotNone2');
        }
        return s('removeAnnotResult2').replace('{annotations}', pluralize(lang, count, 'wordAnnotation', 'wordAnnotations'));
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// 16. Header & Footer
// ---------------------------------------------------------------------------

export const HeaderFooterPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [hLeft, setHLeft] = useState('');
  const [hCenter, setHCenter] = useState('');
  const [hRight, setHRight] = useState('');
  const [fLeft, setFLeft] = useState('');
  const [fCenter, setFCenter] = useState('');
  const [fRight, setFRight] = useState(() => s('hfPageOfTemplate'));
  const [fontSize, setFontSize] = useState('10');
  const [skipFirst, setSkipFirst] = useState(false);

  const textField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder: string
  ) => (
    <div>
      <OptLabel>{label}</OptLabel>
      <OptInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('hfAction')}
      onProcess={async (files) => {
        const templates = [hLeft, hCenter, hRight, fLeft, fCenter, fRight];
        if (templates.every((t) => !t.trim())) {
          throw new Error(s('hfNeedText2'));
        }
        const size = parseFloat(fontSize) || 10;
        const doc = await loadOrThrow(await fileToBytes(files[0]), files[0].name, lang);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const total = doc.getPageCount();
        const pages = doc.getPages();
        let stamped = 0;
        const fill = (tpl: string, pageNum: number) =>
          tpl.replaceAll('{page}', String(pageNum)).replaceAll('{total}', String(total));
        const draw = (
          page: (typeof pages)[number],
          text: string,
          pos: 'left' | 'center' | 'right',
          y: number
        ) => {
          if (!text) return;
          const { width } = page.getSize();
          const tw = font.widthOfTextAtSize(text, size);
          const x = pos === 'left' ? 36 : pos === 'right' ? width - 36 - tw : (width - tw) / 2;
          page.drawText(text, { x, y, size, font, color: rgb(0.3, 0.3, 0.3) });
        };
        pages.forEach((page, idx) => {
          if (skipFirst && idx === 0) return;
          stamped++;
          const num = idx + 1;
          const { height } = page.getSize();
          const headerY = height - 24 - size;
          const footerY = 24;
          draw(page, fill(hLeft, num), 'left', headerY);
          draw(page, fill(hCenter, num), 'center', headerY);
          draw(page, fill(hRight, num), 'right', headerY);
          draw(page, fill(fLeft, num), 'left', footerY);
          draw(page, fill(fCenter, num), 'center', footerY);
          draw(page, fill(fRight, num), 'right', footerY);
        });
        downloadBytes(await savePdf(doc), `${baseName(files[0])}-header-footer.pdf`);
        return s('hfResult2').replace('{pages}', pluralize(lang, stamped, 'wordPage', 'wordPages'));
      }}
    >
      {() => (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {textField(s('headerLeft'), hLeft, setHLeft, s('egCompanyName'))}
            {textField(s('headerCenter'), hCenter, setHCenter, s('egConfidential'))}
            {textField(s('headerRight'), hRight, setHRight, 'e.g. 2026')}
            {textField(s('footerLeft'), fLeft, setFLeft, s('egCopyrightCompany'))}
            {textField(s('footerCenter'), fCenter, setFCenter, '')}
            {textField(s('footerRight'), fRight, setFRight, s('hfPageOfTemplate'))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <OptLabel>{s('fontSizeLabel')}</OptLabel>
              <OptSelect value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                <option value="8">8 pt</option>
                <option value="9">9 pt</option>
                <option value="10">10 pt</option>
                <option value="12">12 pt</option>
              </OptSelect>
            </div>
            <div className="flex items-end pb-1">
              <OptCheck label={s('skipFirstCover')} checked={skipFirst} onChange={setSkipFirst} />
            </div>
            <p className="text-[11px] text-gray-500 self-end pb-1">
              {s('hfPlaceholdersNote2')}
            </p>
          </div>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 17. PDF Background (paint a solid color behind every page)
// ---------------------------------------------------------------------------

export const PdfBackground: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);

  const [color, setColor] = useState('#fef3c7');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('bgAction2')}
      onProcess={async (files) => {
        const bytes = await fileToBytes(files[0]);
        const out = await PDFDocument.create();
        let embedded;
        try {
          embedded = await out.embedPdf(bytes, Array.from({ length: (await loadPdf(bytes)).getPageCount() }, (_, i) => i));
        } catch {
          throw new Error(s('readError'));
        }
        if (!embedded.length) {
          throw new Error(s('errNoPagesFound'));
        }
        const bg = hexToRgb(color);
        for (let i = 0; i < embedded.length; i++) {
          const w = embedded[i].width;
          const h = embedded[i].height;
          const page = out.addPage([w, h]);
          page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: bg });
          page.drawPage(embedded[i], { x: 0, y: 0, width: w, height: h });
        }
        downloadBytes(await savePdf(out), `${baseName(files[0])}-background.pdf`);
        return s('bgResult2').replace('{color}', color).replace('{pages}', pluralize(lang, embedded.length, 'wordPage', 'wordPages'));
      }}
    >
      {() => (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <OptLabel>{s('bgColorLabel2')}</OptLabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer p-0.5"
                aria-label={s('pickBgColor')}
              />
              <OptInput
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#fef3c7" dir="ltr"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-500 self-end pb-1">
            {s('bgNote2')}
          </p>
        </div>
      )}
    </PdfToolShell>
  );
};
