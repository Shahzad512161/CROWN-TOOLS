// Interactive PDF tools: edit, sign, redact, compare, OCR, forms, scan, AI.
// Every operation runs 100% in the browser — no uploads, no fake results.
import React, { useEffect, useRef, useState } from 'react';
import {
  PenLine, Type, ImagePlus, Square, Trash2, ChevronLeft, ChevronRight,
  Eraser, Upload, Search, ArrowLeftRight, ScanLine, Download, ClipboardList,
  Plus, Camera, VideoOff, Sparkles, Languages, FileText, Play,
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { GoogleGenAI } from '@google/genai';
import type { ToolItem } from '../../../lib/tools-data';
import {
  PDFDocument, StandardFonts, rgb,
  fileToBytes, baseName, downloadBytes,
  loadPdf, savePdf, openPdfJs, getPageTextItems, extractAllText,
  renderPageCanvas, canvasToBlob,
  type PdfJsDoc,
} from '../../../lib/pdf/core';
import { PdfToolShell, OptLabel, OptInput, OptSelect, OptCheck } from './PdfToolShell';
import { imagesToPdfBytes } from './PdfConvertTools';
import { useLang, useStrings, COMMON } from '../../../lib/LangContext';
import { PDF_STRINGS, pluralize } from '../../../lib/strings/pdf';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const btnPrimary =
  'w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors';
const btnGhost =
  'px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 cursor-pointer hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed';
const btnTab = (active: boolean) =>
  `px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
    active
      ? 'bg-orange-500 text-white border-orange-500'
      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-orange-400'
  }`;

function hexToRgb(hex: string) {
  const h = (hex || '#000000').replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return rgb((isNaN(r) ? 0 : r) / 255, (isNaN(g) ? 0 : g) / 255, (isNaN(b) ? 0 : b) / 255);
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load that image.'));
    img.src = dataUrl;
  });
}

/** Replace characters pdf-lib's WinAnsi fonts cannot draw. */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/[^\x00-\xFF]/g, '');
}

function downloadText(text: string, filename: string) {
  downloadBytes(new TextEncoder().encode(text), filename, 'text/plain;charset=utf-8');
}

/** Build a clean multi-page text PDF (used by the AI tools for .pdf export). */
async function buildTextPdfBytes(title: string, body: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 40;
  const size = 11;
  const lineHeight = 15.5;
  const pageW = 595.28;
  const pageH = 841.89;
  const maxWidth = pageW - margin * 2;
  const wrap = (text: string, f = font, s = size): string[] => {
    const out: string[] = [];
    for (const para of text.split('\n')) {
      if (!para.trim()) {
        out.push('');
        continue;
      }
      let line = '';
      for (const word of para.split(/\s+/)) {
        const test = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(test, s) > maxWidth && line) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) out.push(line);
    }
    return out;
  };
  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;
  const ensureSpace = (need: number) => {
    if (y - need < margin) {
      page = doc.addPage([pageW, pageH]);
      y = pageH - margin;
    }
  };
  if (title) {
    for (const line of wrap(sanitizeForPdf(title), bold, 15)) {
      ensureSpace(24);
      page.drawText(line, { x: margin, y: y - 15, size: 15, font: bold, color: rgb(0.07, 0.09, 0.13) });
      y -= 24;
    }
    y -= 6;
  }
  for (const rawLine of wrap(sanitizeForPdf(body))) {
    if (!rawLine) {
      y -= lineHeight * 0.6;
      continue;
    }
    ensureSpace(lineHeight);
    page.drawText(rawLine, { x: margin, y: y - size, size, font, color: rgb(0.1, 0.1, 0.12) });
    y -= lineHeight;
  }
  return doc.save();
}

// ---------------------------------------------------------------------------
// Hook: load a PDF with pdf.js and keep a rendered preview of the current page
// ---------------------------------------------------------------------------

function usePdfPreview() {
  const s = useStrings(PDF_STRINGS);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [doc, setDoc] = useState<PdfJsDoc | null>(null);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageImg, setPageImg] = useState('');
  const [pageSize, setPageSize] = useState({ w: 612, h: 792 });
  const [loadError, setLoadError] = useState('');

  const load = async (files: File[]) => {
    if (!files.length) {
      setBytes(null);
      setDoc(null);
      setPageCount(0);
      setPageImg('');
      setFileName('');
      return;
    }
    try {
      setLoadError('');
      const b = await fileToBytes(files[0]);
      const d = await openPdfJs(b);
      setBytes(b);
      setDoc(d);
      setFileName(files[0].name);
      setPageCount(d.numPages);
      setPage(1);
    } catch (e: any) {
      setLoadError(e?.message || s('errOpenPdf'));
      setBytes(null);
      setDoc(null);
      setPageCount(0);
      setPageImg('');
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!doc) return;
    (async () => {
      try {
        const pg = await doc.getPage(page);
        const vp = pg.getViewport({ scale: 1 });
        const canvas = await renderPageCanvas(doc, page, 1.5);
        if (cancelled) return;
        setPageSize({ w: vp.width, h: vp.height });
        setPageImg(canvas.toDataURL('image/png'));
      } catch {
        /* page render errors are surfaced on apply */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, page]);

  return { bytes, doc, fileName, pageCount, page, setPage, pageImg, pageSize, loadError, load };
}

const PageNav: React.FC<{
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}> = ({ page, pageCount, onChange }) => {
  const s = useStrings(PDF_STRINGS);
  return (
  <div className="flex items-center justify-center gap-2 mt-3">
    <button type="button" className={btnGhost} disabled={page <= 1} onClick={() => onChange(page - 1)}>
      <ChevronLeft className="w-4 h-4 rtl:-scale-x-100" /> {s('prevBtn')}
    </button>
    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
      {s('pageOfNav').replace('{page}', String(page)).replace('{total}', String(pageCount))}
    </span>
    <button type="button" className={btnGhost} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
      {s('nextBtn')} <ChevronRight className="w-4 h-4 rtl:-scale-x-100" />
    </button>
  </div>
  );
};

const LoadErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-4 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
    {message}
  </div>
);

// ---------------------------------------------------------------------------
// 1. Edit PDF — click on the page preview to place text / images / rectangles
// ---------------------------------------------------------------------------

interface Ann {
  kind: 'text' | 'image' | 'rect';
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
  text?: string;
  size?: number;
  color?: string;
  dataUrl?: string;
}

export const EditPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const pv = usePdfPreview();
  const [mode, setMode] = useState<'text' | 'image' | 'rect'>('text');
  const [textVal, setTextVal] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#111827');
  const [imgDataUrl, setImgDataUrl] = useState('');
  const [imgAspect, setImgAspect] = useState({ w: 1, h: 1 });
  const [annotations, setAnnotations] = useState<Record<number, Ann[]>>({});
  const imgRef = useRef<HTMLImageElement>(null);
  const [dispW, setDispW] = useState(0);

  useEffect(() => {
    const update = () => {
      if (imgRef.current) setDispW(imgRef.current.clientWidth);
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const totalAnns = Object.values(annotations).reduce((n, a) => n + a.length, 0);
  const pageAnns = annotations[pv.page] || [];

  const handleImagePick = async (file: File | undefined) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    const img = await loadImage(url);
    setImgDataUrl(url);
    setImgAspect({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pv.doc) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    let ann: Ann | null = null;
    if (mode === 'text') {
      const text = textVal.trim();
      if (!text) return;
      const wPt = text.length * fontSize * 0.52 + 6;
      ann = {
        kind: 'text',
        xPct,
        yPct,
        wPct: Math.min(100, (wPt / pv.pageSize.w) * 100),
        hPct: ((fontSize * 1.3) / pv.pageSize.h) * 100,
        text,
        size: fontSize,
        color,
      };
    } else if (mode === 'image') {
      if (!imgDataUrl) return;
      const wPct = 25;
      const hPct = wPct * (imgAspect.h / imgAspect.w) * (pv.pageSize.w / pv.pageSize.h);
      ann = { kind: 'image', xPct, yPct, wPct, hPct, dataUrl: imgDataUrl };
    } else {
      ann = { kind: 'rect', xPct, yPct, wPct: 22, hPct: 9, color };
    }
    if (ann) {
      setAnnotations((prev) => ({ ...prev, [pv.page]: [...(prev[pv.page] || []), ann as Ann] }));
    }
  };

  const removeAnn = (pageNum: number, idx: number) => {
    setAnnotations((prev) => ({
      ...prev,
      [pageNum]: (prev[pageNum] || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".pdf,application/pdf"
      actionLabel={s('editApplyAction')}
      onFilesChange={(files) => {
        setAnnotations({});
        void pv.load(files);
      }}
    >
      {(ctx) => {
        const apply = async () => {
          if (!pv.bytes) return;
          if (totalAnns === 0) {
            ctx.setStatus('error', s('errEditPlaceFirst'));
            return;
          }
          try {
            ctx.setStatus('working', s('editPlacing'));
            const doc = await loadPdf(pv.bytes);
            const font = await doc.embedFont(StandardFonts.Helvetica);
            const pages = doc.getPages();
            for (const [pStr, anns] of Object.entries(annotations)) {
              const page = pages[Number(pStr) - 1];
              if (!page) continue;
              const { width: pageW, height: pageH } = page.getSize();
              for (const ann of anns) {
                const xPt = (ann.xPct / 100) * pageW;
                const yTopPt = (ann.yPct / 100) * pageH;
                const wPt = (ann.wPct / 100) * pageW;
                const hPt = (ann.hPct / 100) * pageH;
                if (ann.kind === 'text' && ann.text) {
                  page.drawText(sanitizeForPdf(ann.text), {
                    x: xPt,
                    y: pageH - yTopPt - (ann.size ?? 16),
                    size: ann.size ?? 16,
                    font,
                    color: hexToRgb(ann.color ?? '#111827'),
                  });
                } else if (ann.kind === 'image' && ann.dataUrl) {
                  const ib = await dataUrlToBytes(ann.dataUrl);
                  const img = ann.dataUrl.startsWith('data:image/png')
                    ? await doc.embedPng(ib)
                    : await doc.embedJpg(ib);
                  page.drawImage(img, { x: xPt, y: pageH - yTopPt - hPt, width: wPt, height: hPt });
                } else if (ann.kind === 'rect') {
                  page.drawRectangle({
                    x: xPt,
                    y: pageH - yTopPt - hPt,
                    width: wPt,
                    height: hPt,
                    color: hexToRgb(ann.color ?? '#f97316'),
                    opacity: 0.85,
                  });
                }
              }
            }
            const out = await savePdf(doc);
            downloadBytes(out, `${baseName(pv.fileName)}-edited.pdf`);
            ctx.setStatus('done', s('editDoneResult').replace('{count}', String(totalAnns)));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errEditApply'));
          }
        };

        return (
          <div className="mt-5">
            {pv.loadError && <LoadErrorBox message={pv.loadError} />}
            {!pv.doc && !pv.loadError && (
              <p className="text-xs text-gray-500">{s('editChoose2')}</p>
            )}
            {pv.doc && (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button type="button" className={btnTab(mode === 'text')} onClick={() => setMode('text')}>
                    <Type className="w-4 h-4" /> {s('addTextBtn')}
                  </button>
                  <button type="button" className={btnTab(mode === 'image')} onClick={() => setMode('image')}>
                    <ImagePlus className="w-4 h-4" /> {s('addImageBtn')}
                  </button>
                  <button type="button" className={btnTab(mode === 'rect')} onClick={() => setMode('rect')}>
                    <Square className="w-4 h-4" /> {s('addRectangleBtn')}
                  </button>
                </div>

                {mode === 'text' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div className="sm:col-span-1">
                      <OptLabel>{s('textToPlace')}</OptLabel>
                      <OptInput value={textVal} onChange={(e) => setTextVal(e.target.value)} placeholder={s('typeTextPlaceholder')} />
                    </div>
                    <div>
                      <OptLabel>{s('fontSizePt')}</OptLabel>
                      <OptInput
                        type="number"
                        min={8}
                        max={48}
                        value={fontSize}
                        onChange={(e) => setFontSize(Math.min(48, Math.max(8, Number(e.target.value) || 16)))}
                      />
                    </div>
                    <div>
                      <OptLabel>{s('colorLabel')}</OptLabel>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-[42px] px-1 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
                {mode === 'image' && (
                  <div className="mb-3">
                    <OptLabel>{s('imageToPlace')}</OptLabel>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={(e) => void handleImagePick(e.target.files?.[0])}
                      className="block w-full text-xs text-gray-600 dark:text-gray-300 file:me-3 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:font-semibold file:cursor-pointer"
                    />
                    {imgDataUrl && <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{s('imageReady')}</p>}
                  </div>
                )}
                {mode === 'rect' && (
                  <div className="mb-3 max-w-[220px]">
                    <OptLabel>{s('rectangleColor')}</OptLabel>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-[42px] px-1 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer"
                    />
                  </div>
                )}

                <div
                  className="relative w-full select-none border border-gray-300 dark:border-gray-600 shadow bg-white cursor-crosshair overflow-hidden"
                  onClick={handlePreviewClick}
                >
                  <img
                    ref={imgRef}
                    src={pv.pageImg}
                    alt={s('pagePreviewAlt').replace('{n}', String(pv.page))}
                    className="w-full block"
                    draggable={false}
                    onLoad={(e) => setDispW(e.currentTarget.clientWidth)}
                  />
                  {pageAnns.map((ann, i) => {
                    if (ann.kind === 'text') {
                      return (
                        <span
                          key={i}
                          className="absolute pointer-events-none whitespace-nowrap"
                          style={{
                            left: `${ann.xPct}%`,
                            top: `${ann.yPct}%`,
                            fontSize: dispW && pv.pageSize.w ? ((ann.size ?? 16) * dispW) / pv.pageSize.w : (ann.size ?? 16),
                            color: ann.color,
                            lineHeight: 1.1,
                            fontFamily: 'Helvetica, Arial, sans-serif',
                          }}
                        >
                          {ann.text}
                        </span>
                      );
                    }
                    if (ann.kind === 'image') {
                      return (
                        <img
                          key={i}
                          src={ann.dataUrl}
                          alt=""
                          className="absolute pointer-events-none"
                          style={{ left: `${ann.xPct}%`, top: `${ann.yPct}%`, width: `${ann.wPct}%` }}
                        />
                      );
                    }
                    return (
                      <div
                        key={i}
                        className="absolute pointer-events-none"
                        style={{
                          left: `${ann.xPct}%`,
                          top: `${ann.yPct}%`,
                          width: `${ann.wPct}%`,
                          height: `${ann.hPct}%`,
                          backgroundColor: ann.color,
                          opacity: 0.85,
                        }}
                      />
                    );
                  })}
                </div>
                <PageNav page={pv.page} pageCount={pv.pageCount} onChange={(p) => pv.setPage(Math.min(pv.pageCount, Math.max(1, p)))} />

                {totalAnns > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {Object.entries(annotations).flatMap(([pStr, anns]) =>
                      anns.map((ann, i) => (
                        <li
                          key={`${pStr}-${i}`}
                          className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                        >
                          <span className="font-bold text-gray-700 dark:text-gray-200">{ann.kind === 'text' ? s('kindText') : ann.kind === 'image' ? s('kindImage') : s('kindRectangle')}</span>
                          <span className="text-gray-500 truncate">
                            {s('editAnnLine').replace('{page}', pStr).replace('{text}', ann.text ? ` · “${ann.text}”` : '').replace('{x}', ann.xPct.toFixed(0)).replace('{y}', ann.yPct.toFixed(0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAnn(Number(pStr), i)}
                            className="ms-auto p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                            aria-label={s('removeElement')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}

                <button type="button" className={btnPrimary} disabled={ctx.status === 'working'} onClick={() => void apply()}>
                  <Play className="w-4 h-4" /> {s('editApplyBtn')}
                </button>
              </>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 2. Sign PDF — draw, type or upload a signature and stamp it onto a page
// ---------------------------------------------------------------------------

const SIGN_STYLES: { label: string; family: string }[] = [
  { label: 'Handwriting 1', family: 'cursive' },
  { label: 'Handwriting 2', family: '"Segoe Script", cursive' },
  { label: 'Handwriting 3', family: '"Brush Script MT", cursive' },
  { label: 'Handwriting 4', family: '"Comic Sans MS", cursive' },
];

type SigPos = 'bottom-right' | 'bottom-left' | 'bottom-center' | 'center';

export const SignPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const drawRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeStyle, setTypeStyle] = useState(SIGN_STYLES[0].family);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAspect, setUploadAspect] = useState(2);
  const [pageNum, setPageNum] = useState(1);
  const [pos, setPos] = useState<SigPos>('bottom-right');
  const [sigWidth, setSigWidth] = useState(180);

  const loadFile = async (files: File[]) => {
    if (!files.length) {
      setBytes(null);
      setPageCount(0);
      return;
    }
    try {
      setLoadError('');
      const b = await fileToBytes(files[0]);
      const d = await openPdfJs(b);
      setBytes(b);
      setFileName(files[0].name);
      setPageCount(d.numPages);
      setPageNum(d.numPages);
    } catch (e: any) {
      setLoadError(e?.message || s('errOpenPdf'));
      setBytes(null);
      setPageCount(0);
    }
  };

  const drawPos = (e: React.PointerEvent) => {
    const canvas = drawRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvas.width / r.width),
      y: (e.clientY - r.top) * (canvas.height / r.height),
    };
  };

  const onDrawDown = (e: React.PointerEvent) => {
    drawingRef.current = true;
    lastRef.current = drawPos(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDrawMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || !drawRef.current) return;
    const cctx = drawRef.current.getContext('2d');
    if (!cctx || !lastRef.current) return;
    const p = drawPos(e);
    cctx.strokeStyle = '#111111';
    cctx.lineWidth = 2.5;
    cctx.lineCap = 'round';
    cctx.lineJoin = 'round';
    cctx.beginPath();
    cctx.moveTo(lastRef.current.x, lastRef.current.y);
    cctx.lineTo(p.x, p.y);
    cctx.stroke();
    lastRef.current = p;
    setHasDrawn(true);
  };
  const onDrawUp = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };
  const clearDraw = () => {
    const canvas = drawRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleUploadPick = async (file: File | undefined) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    const img = await loadImage(url);
    setUploadUrl(url);
    setUploadAspect((img.naturalWidth || 2) / (img.naturalHeight || 1));
  };

  const getSignature = async (): Promise<{ data: Uint8Array; png: boolean; aspect: number }> => {
    if (tab === 'draw') {
      if (!drawRef.current || !hasDrawn) throw new Error(s('errDrawSignature'));
      const blob = await canvasToBlob(drawRef.current, 'image/png');
      return { data: new Uint8Array(await blob.arrayBuffer()), png: true, aspect: 520 / 200 };
    }
    if (tab === 'type') {
      const name = typeName.trim();
      if (!name) throw new Error(s('errTypeName'));
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 220;
      const cctx = canvas.getContext('2d')!;
      let size = 72;
      cctx.textAlign = 'center';
      cctx.textBaseline = 'middle';
      cctx.fillStyle = '#111111';
      do {
        cctx.font = `${size}px ${typeStyle}`;
        if (cctx.measureText(name).width <= 600) break;
        size -= 4;
      } while (size > 20);
      cctx.fillText(name, 320, 112);
      const blob = await canvasToBlob(canvas, 'image/png');
      return { data: new Uint8Array(await blob.arrayBuffer()), png: true, aspect: 640 / 220 };
    }
    if (!uploadUrl) throw new Error(s('errUploadSignature'));
    const data = await dataUrlToBytes(uploadUrl);
    return { data, png: uploadUrl.startsWith('data:image/png'), aspect: uploadAspect };
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" onFilesChange={(files) => void loadFile(files)}>
      {(ctx) => {
        const apply = async () => {
          if (!bytes) {
            ctx.setStatus('error', s('errChoosePdfFirst'));
            return;
          }
          try {
            ctx.setStatus('working', s('signStamping'));
            const sig = await getSignature();
            const doc = await loadPdf(bytes);
            const pageIdx = Math.min(doc.getPageCount(), Math.max(1, pageNum)) - 1;
            const page = doc.getPage(pageIdx);
            const { width: pageW, height: pageH } = page.getSize();
            const img = sig.png ? await doc.embedPng(sig.data) : await doc.embedJpg(sig.data);
            const w = Math.min(sigWidth, pageW - 24);
            const h = w / sig.aspect;
            let x = pageW - 36 - w;
            let y = 30;
            if (pos === 'bottom-left') x = 36;
            if (pos === 'bottom-center') x = (pageW - w) / 2;
            if (pos === 'center') {
              x = (pageW - w) / 2;
              y = (pageH - h) / 2;
            }
            page.drawImage(img, { x, y, width: w, height: h });
            const out = await savePdf(doc);
            downloadBytes(out, `${baseName(fileName)}-signed.pdf`);
            ctx.setStatus('done', s('signedDownloaded'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errSignFailed'));
          }
        };

        return (
          <div className="mt-5">
            {loadError && <LoadErrorBox message={loadError} />}
            <div className="flex flex-wrap gap-2 mb-3">
              <button type="button" className={btnTab(tab === 'draw')} onClick={() => setTab('draw')}>
                <PenLine className="w-4 h-4" /> {s('signModeDraw')}
              </button>
              <button type="button" className={btnTab(tab === 'type')} onClick={() => setTab('type')}>
                <Type className="w-4 h-4" /> {s('typeTab')}
              </button>
              <button type="button" className={btnTab(tab === 'upload')} onClick={() => setTab('upload')}>
                <Upload className="w-4 h-4" /> {s('signModeUpload')}
              </button>
            </div>

            {tab === 'draw' && (
              <div>
                <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white overflow-hidden touch-none">
                  <canvas
                    ref={drawRef}
                    width={520}
                    height={200}
                    className="w-full h-[200px] block cursor-crosshair"
                    onPointerDown={onDrawDown}
                    onPointerMove={onDrawMove}
                    onPointerUp={onDrawUp}
                    onPointerLeave={onDrawUp}
                  />
                </div>
                <button type="button" className={`${btnGhost} mt-2`} onClick={clearDraw}>
                  <Eraser className="w-4 h-4" /> {s('clearSignature')}
                </button>
              </div>
            )}
            {tab === 'type' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <OptLabel>{s('signNameLabel')}</OptLabel>
                  <OptInput value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder={s('egName')} />
                </div>
                <div>
                  <OptLabel>{s('signatureStyle')}</OptLabel>
                  <OptSelect value={typeStyle} onChange={(e) => setTypeStyle(e.target.value)}>
                    {SIGN_STYLES.map((style, i) => (
                      <option key={style.label} value={style.family}>
                        {s('handwriting')} {i + 1}
                      </option>
                    ))}
                  </OptSelect>
                </div>
                {typeName.trim() && (
                  <div className="sm:col-span-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-50 py-4 text-center overflow-hidden">
                    <span style={{ fontFamily: typeStyle, fontSize: 44, color: '#111111' }}>{typeName}</span>
                  </div>
                )}
              </div>
            )}
            {tab === 'upload' && (
              <div>
                <OptLabel>{s('signatureImageLabel')}</OptLabel>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => void handleUploadPick(e.target.files?.[0])}
                  className="block w-full text-xs text-gray-600 dark:text-gray-300 file:me-3 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:font-semibold file:cursor-pointer"
                />
                {uploadUrl && (
                  <div className="mt-2 inline-block border border-dashed border-gray-300 rounded-xl bg-white p-2">
                    <img src={uploadUrl} alt={s('signaturePreviewAlt')} className="max-h-24" />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div>
                <OptLabel>{c('page')}{pageCount ? ` (1–${pageCount})` : ''}</OptLabel>
                <OptInput
                  type="number"
                  min={1}
                  max={pageCount || 1}
                  value={pageNum}
                  onChange={(e) => setPageNum(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div>
                <OptLabel>{s('positionLabel')}</OptLabel>
                <OptSelect value={pos} onChange={(e) => setPos(e.target.value as SigPos)}>
                  <option value="bottom-right">{s('posBottomRight')}</option>
                  <option value="bottom-left">{s('posBottomLeft')}</option>
                  <option value="bottom-center">{s('posBottomCenter')}</option>
                  <option value="center">{s('centerOfPage')}</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>{s('signatureWidth').replace('{w}', String(sigWidth))}</OptLabel>
                <input
                  type="range"
                  min={90}
                  max={320}
                  value={sigWidth}
                  onChange={(e) => setSigWidth(Number(e.target.value))}
                  className="w-full accent-orange-500 mt-3"
                />
              </div>
            </div>

            <button type="button" className={btnPrimary} disabled={!bytes || ctx.status === 'working'} onClick={() => void apply()}>
              <PenLine className="w-4 h-4" /> {s('signDownloadBtn')}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Redact PDF — draw black boxes over content, or find a word/phrase.
//    Redacted pages are rasterized so the hidden text is truly destroyed.
// ---------------------------------------------------------------------------

interface RedactRect {
  xPct: number;
  yPct: number;
  wPct: number;
  hPct: number;
}

export const RedactPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const pv = usePdfPreview();
  const [rects, setRects] = useState<Record<number, RedactRect[]>>({});
  const [liveRect, setLiveRect] = useState<RedactRect | null>(null);
  const dragStartRef = useRef<{ xPct: number; yPct: number } | null>(null);
  const [phrase, setPhrase] = useState('');

  const totalRects = Object.values(rects).reduce((n, r) => n + r.length, 0);
  const pageRects = rects[pv.page] || [];

  const pctFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      xPct: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      yPct: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    };
  };

  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pv.doc) return;
    const p = pctFromEvent(e);
    dragStartRef.current = p;
    setLiveRect({ xPct: p.xPct, yPct: p.yPct, wPct: 0, hPct: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    const p = pctFromEvent(e);
    const s = dragStartRef.current;
    setLiveRect({
      xPct: Math.min(s.xPct, p.xPct),
      yPct: Math.min(s.yPct, p.yPct),
      wPct: Math.abs(p.xPct - s.xPct),
      hPct: Math.abs(p.yPct - s.yPct),
    });
  };
  const onDragEnd = () => {
    if (liveRect && liveRect.wPct >= 1 && liveRect.hPct >= 1) {
      setRects((prev) => ({ ...prev, [pv.page]: [...(prev[pv.page] || []), liveRect] }));
    }
    dragStartRef.current = null;
    setLiveRect(null);
  };

  const removeRect = (pageNum: number, idx: number) => {
    setRects((prev) => ({ ...prev, [pageNum]: (prev[pageNum] || []).filter((_, i) => i !== idx) }));
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".pdf,application/pdf"
      onFilesChange={(files) => {
        setRects({});
        setLiveRect(null);
        void pv.load(files);
      }}
    >
      {(ctx) => {
        const redactPhrase = async () => {
          if (!pv.doc) return;
          const q = phrase.trim().toLowerCase();
          if (!q) {
            ctx.setStatus('error', s('errTypePhrase'));
            return;
          }
          try {
            ctx.setStatus('working', s('searchingPhrase').replace('{phrase}', phrase.trim()));
            const additions: Record<number, RedactRect[]> = {};
            let count = 0;
            for (let p = 1; p <= pv.doc!.numPages; p++) {
              const pg = await pv.doc!.getPage(p);
              const vp = pg.getViewport({ scale: 1 });
              const items = await getPageTextItems(pv.doc!, p);
              for (const item of items) {
                const s = item.str.toLowerCase();
                if (s.includes(q) || (s.length >= 2 && q.includes(s))) {
                  const rect: RedactRect = {
                    xPct: (item.x / vp.width) * 100,
                    yPct: ((item.y - item.height) / vp.height) * 100,
                    wPct: (item.width / vp.width) * 100,
                    hPct: ((item.height * 1.3) / vp.height) * 100,
                  };
                  (additions[p] = additions[p] || []).push(rect);
                  count++;
                }
              }
            }
            if (count === 0) {
              ctx.setStatus('error', s('noMatchesPhrase').replace('{phrase}', phrase.trim()));
              return;
            }
            setRects((prev) => {
              const next = { ...prev };
              for (const [pStr, rs] of Object.entries(additions)) {
                const p = Number(pStr);
                next[p] = [...(next[p] || []), ...rs];
              }
              return next;
            });
            ctx.setStatus('done', s('addedBoxes').replace('{count}', String(count)));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errSearchFailed'));
          }
        };

        const apply = async () => {
          if (!pv.bytes || !pv.doc) return;
          if (totalRects === 0) {
            ctx.setStatus('error', s('errDrawBox'));
            return;
          }
          try {
            ctx.setStatus('working', s('redactApplying'));
            const srcDoc = await loadPdf(pv.bytes);
            const out = await PDFDocument.create();
            for (let p = 1; p <= pv.pageCount; p++) {
              const pageRectList = rects[p] || [];
              if (pageRectList.length === 0) {
                const [copied] = await out.copyPages(srcDoc, [p - 1]);
                out.addPage(copied);
                continue;
              }
              const pg = await pv.doc.getPage(p);
              const vp = pg.getViewport({ scale: 1 });
              const canvas = await renderPageCanvas(pv.doc, p, 3);
              const cctx = canvas.getContext('2d')!;
              cctx.fillStyle = '#000000';
              for (const r of pageRectList) {
                cctx.fillRect(
                  (r.xPct / 100) * canvas.width,
                  (r.yPct / 100) * canvas.height,
                  (r.wPct / 100) * canvas.width,
                  (r.hPct / 100) * canvas.height
                );
              }
              const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
              const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
              const newPage = out.addPage([vp.width, vp.height]);
              newPage.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
            }
            const outBytes = await savePdf(out);
            downloadBytes(outBytes, `${baseName(pv.fileName)}-redacted.pdf`);
            ctx.setStatus('done', s('redactDone2'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errRedactApply'));
          }
        };

        return (
          <div className="mt-5">
            {pv.loadError && <LoadErrorBox message={pv.loadError} />}
            {!pv.doc && !pv.loadError && (
              <p className="text-xs text-gray-500">{s('redactChoose2')}</p>
            )}
            {pv.doc && (
              <>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <div className="flex-1">
                    <OptInput
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      placeholder={s('redactPhrasePlaceholder')}
                    />
                  </div>
                  <button type="button" className={btnGhost} onClick={() => void redactPhrase()}>
                    <Search className="w-4 h-4" /> {s('findBoxIt')}
                  </button>
                </div>

                <div
                  className="relative w-full select-none border border-gray-300 dark:border-gray-600 shadow bg-white cursor-crosshair overflow-hidden touch-none"
                  onPointerDown={onDragStart}
                  onPointerMove={onDragMove}
                  onPointerUp={onDragEnd}
                >
                  <img src={pv.pageImg} alt={s('pagePreviewAlt').replace('{n}', String(pv.page))} className="w-full block" draggable={false} />
                  {pageRects.map((r, i) => (
                    <div
                      key={i}
                      className="absolute bg-black pointer-events-none"
                      style={{ left: `${r.xPct}%`, top: `${r.yPct}%`, width: `${r.wPct}%`, height: `${r.hPct}%` }}
                    />
                  ))}
                  {liveRect && (
                    <div
                      className="absolute bg-black/60 border border-red-500 pointer-events-none"
                      style={{ left: `${liveRect.xPct}%`, top: `${liveRect.yPct}%`, width: `${liveRect.wPct}%`, height: `${liveRect.hPct}%` }}
                    />
                  )}
                </div>
                <PageNav page={pv.page} pageCount={pv.pageCount} onChange={(p) => pv.setPage(Math.min(pv.pageCount, Math.max(1, p)))} />

                <p className="mt-3 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                  {s('redactWarning')}
                </p>

                {totalRects > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {Object.entries(rects).flatMap(([pStr, rs]) =>
                      rs.map((r, i) => (
                        <li
                          key={`${pStr}-${i}`}
                          className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                        >
                          <span className="font-bold text-gray-700 dark:text-gray-200">{s('redactionBox')}</span>
                          <span className="text-gray-500">
                            {s('redactInfoLine').replace('{page}', pStr).replace('{x}', r.xPct.toFixed(0)).replace('{y}', r.yPct.toFixed(0)).replace('{w}', r.wPct.toFixed(0)).replace('{h}', r.hPct.toFixed(0))}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRect(Number(pStr), i)}
                            className="ms-auto p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                            aria-label={s('removeRedactionBox')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}

                <button type="button" className={btnPrimary} disabled={ctx.status === 'working'} onClick={() => void apply()}>
                  <Play className="w-4 h-4" /> {s('applyRedactionBtn')}
                </button>
              </>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 4. Compare PDF — page-by-page word-level diff of two documents' text
// ---------------------------------------------------------------------------

interface DiffWord {
  w: string;
  changed: boolean;
}
interface PageDiff {
  page: number;
  identical: boolean;
  aWords: DiffWord[];
  bWords: DiffWord[];
}
interface CompareResult {
  pagesCompared: number;
  identicalCount: number;
  totalAdded: number;
  totalRemoved: number;
  pages: PageDiff[];
}

function tokenizeWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** LCS-based word diff. aWords flags words removed in B; bWords flags words added in B. */
function diffWords(a: string[], b: string[]): { aWords: DiffWord[]; bWords: DiffWord[] } {
  const n = a.length;
  const m = b.length;
  const dp: Uint32Array[] = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const aOut: DiffWord[] = [];
  const bOut: DiffWord[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      aOut.push({ w: a[i], changed: false });
      bOut.push({ w: b[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      aOut.push({ w: a[i], changed: true });
      i++;
    } else {
      bOut.push({ w: b[j], changed: true });
      j++;
    }
  }
  while (i < n) aOut.push({ w: a[i++], changed: true });
  while (j < m) bOut.push({ w: b[j++], changed: true });
  return { aWords: aOut, bWords: bOut };
}

function diffPage(page: number, aText: string, bText: string): PageDiff {
  const a = tokenizeWords(aText);
  const b = tokenizeWords(bText);
  if (a.join(' ') === b.join(' ')) {
    return { page, identical: true, aWords: a.map((w) => ({ w, changed: false })), bWords: b.map((w) => ({ w, changed: false })) };
  }
  // Guard: the LCS table is quadratic — fall back to whole-page comparison on huge pages.
  if (a.length > 3000 || b.length > 3000) {
    return {
      page,
      identical: false,
      aWords: a.slice(0, 3000).map((w) => ({ w, changed: true })),
      bWords: b.slice(0, 3000).map((w) => ({ w, changed: true })),
    };
  }
  const { aWords, bWords } = diffWords(a, b);
  return { page, identical: false, aWords, bWords };
}

export const ComparePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);

  const renderWords = (words: DiffWord[], side: 'a' | 'b') => (
    <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-200 break-words">
      {words.slice(0, 4000).map((wd, i) =>
        wd.changed ? (
          <span
            key={i}
            className={
              side === 'a'
                ? 'bg-red-200 dark:bg-red-900/60 line-through rounded px-0.5'
                : 'bg-emerald-200 dark:bg-emerald-900/60 rounded px-0.5'
            }
          >
            {wd.w}{' '}
          </span>
        ) : (
          <span key={i}>{wd.w} </span>
        )
      )}
      {words.length > 4000 && <span className="text-gray-400">{s('truncatedDisplay')}</span>}
      {words.length === 0 && <span className="text-gray-400 italic">{s('noTextOnPage')}</span>}
    </p>
  );

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" hideDropzone>
      {(ctx) => {
        const compare = async () => {
          if (!fileA || !fileB) {
            ctx.setStatus('error', s('errChooseBoth'));
            return;
          }
          try {
            setResult(null);
            ctx.setStatus('working', s('compareWorking'));
            const [bytesA, bytesB] = await Promise.all([fileToBytes(fileA), fileToBytes(fileB)]);
            const [pagesA, pagesB] = await Promise.all([extractAllText(bytesA), extractAllText(bytesB)]);
            const total = Math.max(pagesA.length, pagesB.length);
            const pages: PageDiff[] = [];
            let identicalCount = 0;
            let totalAdded = 0;
            let totalRemoved = 0;
            for (let p = 0; p < total; p++) {
              const d = diffPage(p + 1, pagesA[p] ?? '', pagesB[p] ?? '');
              if (d.identical) identicalCount++;
              totalRemoved += d.aWords.filter((w) => w.changed).length;
              totalAdded += d.bWords.filter((w) => w.changed).length;
              pages.push(d);
            }
            setResult({ pagesCompared: total, identicalCount, totalAdded, totalRemoved, pages });
            ctx.setStatus(
              'done',
              s('compareDone').replace('{total}', String(total)).replace('{identical}', String(identicalCount)).replace('{changed}', String(total - identicalCount)).replace('{added}', String(totalAdded)).replace('{removed}', String(totalRemoved))
            );
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errCompareFailed'));
          }
        };

        return (
          <div className="mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <OptLabel>{s('docAOriginal')}</OptLabel>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFileA(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-600 dark:text-gray-300 file:me-3 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:font-semibold file:cursor-pointer"
                />
                {fileA && <p className="text-[11px] text-gray-500 mt-1 truncate">{fileA.name}</p>}
              </div>
              <div>
                <OptLabel>{s('docBRevised')}</OptLabel>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setFileB(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-600 dark:text-gray-300 file:me-3 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:bg-gray-50 file:font-semibold file:cursor-pointer"
                />
                {fileB && <p className="text-[11px] text-gray-500 mt-1 truncate">{fileB.name}</p>}
              </div>
            </div>

            <button type="button" className={btnPrimary} disabled={!fileA || !fileB || ctx.status === 'working'} onClick={() => void compare()}>
              <ArrowLeftRight className="w-4 h-4" /> {s('compareDocuments')}
            </button>

            {result && (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {s('pagesCompared').replace('{count}', String(result.pagesCompared))}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {s('identicalCount').replace('{count}', String(result.identicalCount))}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {s('wordsAddedB').replace('{count}', String(result.totalAdded))}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    {s('wordsRemovedA').replace('{count}', String(result.totalRemoved))}
                  </span>
                </div>

                {result.pages.map((pd) =>
                  pd.identical ? (
                    <div
                      key={pd.page}
                      className="text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                    >
                      {s('pageIdentical').replace('{page}', String(pd.page))}
                    </div>
                  ) : (
                    <div key={pd.page} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                        {s('pageDifferences').replace('{page}', String(pd.page))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-3 border-b md:border-b-0 md:border-e border-gray-200 dark:border-gray-700">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1.5">{s('aRemovedLabel')}</span>
                          {renderWords(pd.aWords, 'a')}
                        </div>
                        <div className="p-3">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">{s('bAddedLabel')}</span>
                          {renderWords(pd.bWords, 'b')}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 5. OCR PDF — recognize scanned pages with Tesseract and embed an invisible
//    text layer so the result is searchable and copyable.
// ---------------------------------------------------------------------------

export const OcrPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [progress, setProgress] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf">
      {(ctx) => {
        const runOcr = async () => {
          const file = ctx.files[0];
          if (!file) {
            ctx.setStatus('error', s('errChooseScanned'));
            return;
          }
          setBusy(true);
          setOcrText('');
          let worker: Awaited<ReturnType<typeof Tesseract.createWorker>> | null = null;
          try {
            ctx.setStatus('working', s('ocrLoadingEngine'));
            setProgress(s('ocrLoadingProgress'));
            try {
              worker = await Tesseract.createWorker('eng');
            } catch {
              throw new Error(s('errOcrEngine'));
            }
            const bytes = await fileToBytes(file);
            const doc = await openPdfJs(bytes);
            const out = await PDFDocument.create();
            const font = await out.embedFont(StandardFonts.Helvetica);
            const allText: string[] = [];
            for (let p = 1; p <= doc.numPages; p++) {
              setProgress(s('ocrRecognizingPage').replace('{n}', String(p)).replace('{total}', String(doc.numPages)));
              ctx.setStatus('working', s('ocrRecognizingPage').replace('{n}', String(p)).replace('{total}', String(doc.numPages)));
              const pg = await doc.getPage(p);
              const vp = pg.getViewport({ scale: 1 });
              const pageW = vp.width;
              const pageH = vp.height;
              const canvas = await renderPageCanvas(doc, p, 2);
              const { data } = await worker.recognize(canvas as any);
              const text = (data?.text || '').trim();
              allText.push(text);
              const blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
              const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
              const newPage = out.addPage([pageW, pageH]);
              newPage.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
              const lines = (data as any)?.lines as
                | { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[]
                | undefined;
              if (lines && lines.length) {
                for (const line of lines) {
                  const clean = (line.text || '').replace(/[^\x20-\x7E]/g, '').trim();
                  if (!clean) continue;
                  const sizePt = Math.max(4, (line.bbox.y1 - line.bbox.y0) / 2);
                  try {
                    newPage.drawText(clean, {
                      x: line.bbox.x0 / 2,
                      y: pageH - line.bbox.y1 / 2,
                      size: sizePt,
                      font,
                      opacity: 0,
                    });
                  } catch {
                    /* unencodable line — skip it, the visible text is still OCR'd */
                  }
                }
              } else if (text) {
                const textLines = text.split('\n');
                const lineHeight = pageH / Math.max(1, textLines.length);
                textLines.forEach((raw, idx) => {
                  const clean = raw.replace(/[^\x20-\x7E]/g, '').trim();
                  if (!clean) return;
                  try {
                    newPage.drawText(clean, {
                      x: 36,
                      y: pageH - (idx + 1) * lineHeight,
                      size: Math.max(4, lineHeight * 0.8),
                      font,
                      opacity: 0,
                    });
                  } catch {
                    /* skip unencodable line */
                  }
                });
              }
            }
            setProgress('');
            const outBytes = await savePdf(out);
            downloadBytes(outBytes, `${baseName(file)}-ocr.pdf`);
            setOcrText(allText.join('\n\n'));
            ctx.setStatus('done', s('ocrDone2'));
          } catch (e: any) {
            setProgress('');
            ctx.setStatus('error', e?.message || s('errOcrFailed'));
          } finally {
            if (worker) {
              try {
                await worker.terminate();
              } catch {
                /* already terminated */
              }
            }
            setBusy(false);
          }
        };

        return (
          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-1">
              {s('ocrIntro')}
            </p>
            {progress && <p className="text-xs font-semibold text-orange-600 mt-2">{progress}</p>}
            <button type="button" className={btnPrimary} disabled={!ctx.files.length || busy} onClick={() => void runOcr()}>
              <ScanLine className="w-4 h-4" /> {busy ? s('ocrRunning') : s('ocrAction')}
            </button>
            {ocrText && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <OptLabel>{s('recognizedText')}</OptLabel>
                  <button type="button" className={btnGhost} onClick={() => downloadText(ocrText, `${baseName(ctx.files[0])}-ocr.txt`)}>
                    <Download className="w-3.5 h-3.5" /> {s('downloadTxtFile')}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={ocrText}
                  rows={10}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100"
                />
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. PDF Forms — fill existing AcroForm fields, or add a new field
// ---------------------------------------------------------------------------

interface FormFieldState {
  name: string;
  kind: string;
  value: string | boolean;
  options?: string[];
}

const FIELD_KIND_LABELS: Record<string, string> = {
  PDFTextField: 'fieldText',
  PDFCheckBox: 'fieldCheckbox',
  PDFDropdown: 'fieldDropdown',
  PDFRadioGroup: 'fieldRadio',
  PDFOptionList: 'fieldOptionList',
  PDFButton: 'fieldButton',
  PDFSignature: 'fieldSignature',
};

export const PdfFormsTool: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [fieldStates, setFieldStates] = useState<FormFieldState[]>([]);
  const [flatten, setFlatten] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'text' | 'checkbox'>('text');
  const [newPage, setNewPage] = useState(1);
  const [newX, setNewX] = useState(10);
  const [newY, setNewY] = useState(10);
  const [newW, setNewW] = useState(40);

  const loadForms = async (files: File[]) => {
    setLoaded(false);
    setFieldStates([]);
    setLoadError('');
    if (!files.length) {
      setBytes(null);
      setPageCount(0);
      return;
    }
    try {
      const b = await fileToBytes(files[0]);
      const doc = await loadPdf(b);
      setBytes(b);
      setFileName(files[0].name);
      setPageCount(doc.getPageCount());
      const form = doc.getForm();
      const states: FormFieldState[] = form.getFields().map((f) => {
        const kind = f.constructor.name;
        const anyF = f as any;
        let value: string | boolean = '';
        let options: string[] | undefined;
        try {
          if (kind === 'PDFTextField') value = anyF.getText?.() ?? '';
          else if (kind === 'PDFCheckBox') value = !!anyF.isChecked?.();
          else if (kind === 'PDFDropdown' || kind === 'PDFRadioGroup' || kind === 'PDFOptionList') {
            options = anyF.getOptions?.() ?? [];
            const sel = anyF.getSelected?.() ?? [];
            value = sel[0] ?? '';
          }
        } catch {
          /* unreadable field value — leave blank */
        }
        return { name: f.getName(), kind, value, options };
      });
      setFieldStates(states);
      setLoaded(true);
    } catch (e: any) {
      setLoadError(e?.message || s('errReadCorruptEncrypted'));
      setBytes(null);
    }
  };

  const setValue = (idx: number, value: string | boolean) => {
    setFieldStates((prev) => prev.map((f, i) => (i === idx ? { ...f, value } : f)));
  };

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf" onFilesChange={(files) => void loadForms(files)}>
      {(ctx) => {
        const applyFilled = async () => {
          if (!bytes) return;
          try {
            ctx.setStatus('working', s('formsWriting'));
            const doc = await loadPdf(bytes);
            const form = doc.getForm();
            for (const fs of fieldStates) {
              try {
                if (fs.kind === 'PDFTextField') {
                  form.getTextField(fs.name).setText(sanitizeForPdf(String(fs.value ?? '')));
                } else if (fs.kind === 'PDFCheckBox') {
                  const cb = form.getCheckBox(fs.name);
                  if (fs.value) cb.check();
                  else cb.uncheck();
                } else if (fs.kind === 'PDFDropdown') {
                  if (fs.value) form.getDropdown(fs.name).select(String(fs.value));
                } else if (fs.kind === 'PDFRadioGroup') {
                  if (fs.value) form.getRadioGroup(fs.name).select(String(fs.value));
                } else if (fs.kind === 'PDFOptionList') {
                  if (fs.value) form.getOptionList(fs.name).select(String(fs.value));
                }
              } catch {
                /* field type mismatch in the source PDF — skip that field */
              }
            }
            form.updateFieldAppearances();
            if (flatten) form.flatten();
            const out = await savePdf(doc);
            downloadBytes(out, `${baseName(fileName)}-filled.pdf`);
            ctx.setStatus('done', flatten ? s('formsDoneFlattened') : s('formsDoneKept'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errFillForm'));
          }
        };

        const addField = async () => {
          if (!bytes) return;
          const name = newName.trim();
          if (!name) {
            ctx.setStatus('error', s('errFieldNameFirst'));
            return;
          }
          if (fieldStates.some((f) => f.name === name)) {
            ctx.setStatus('error', s('fieldExists').replace('{name}', name));
            return;
          }
          try {
            ctx.setStatus('working', s('formsAdding'));
            const doc = await loadPdf(bytes);
            const form = doc.getForm();
            const pageIdx = Math.min(doc.getPageCount(), Math.max(1, newPage)) - 1;
            const page = doc.getPage(pageIdx);
            const { width: pw, height: ph } = page.getSize();
            const hPt = newType === 'text' ? 22 : 16;
            const wPt = newType === 'text' ? (newW / 100) * pw : hPt;
            const x = (newX / 100) * pw;
            const y = ph - (newY / 100) * ph - hPt;
            if (newType === 'text') {
              const tf = form.createTextField(name);
              tf.addToPage(page, {
                x,
                y,
                width: wPt,
                height: hPt,
                borderWidth: 1,
                backgroundColor: rgb(1, 1, 1),
                textColor: rgb(0, 0, 0),
              });
              (tf as any).setFontSize?.(12);
            } else {
              const cb = form.createCheckBox(name);
              cb.addToPage(page, { x, y, width: hPt, height: hPt, borderWidth: 1, backgroundColor: rgb(1, 1, 1) });
            }
            const out = await savePdf(doc);
            downloadBytes(out, `${baseName(fileName)}-form.pdf`);
            ctx.setStatus('done', s('fieldAdded').replace('{name}', name));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errAddField'));
          }
        };

        return (
          <div className="mt-5">
            {loadError && <LoadErrorBox message={loadError} />}
            {loaded && fieldStates.length === 0 && (
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl px-3 py-2.5 mb-4">
                {s('formsNoneBanner')}
              </div>
            )}
            {loaded && fieldStates.length > 0 && (
              <>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <ClipboardList className="w-4 h-4 text-orange-500" /> {s('fillFormHeading').replace('{fields}', pluralize(lang, fieldStates.length, 'wordFormField', 'wordFormFields'))}
                </h3>
                <div className="space-y-3">
                  {fieldStates.map((fs, i) => (
                    <div key={fs.name}>
                      <OptLabel>
                        {fs.name} <span className="text-gray-400 font-medium">· {FIELD_KIND_LABELS[fs.kind] ? s(FIELD_KIND_LABELS[fs.kind]) : fs.kind}</span>
                      </OptLabel>
                      {fs.kind === 'PDFTextField' ? (
                        <OptInput value={String(fs.value ?? '')} onChange={(e) => setValue(i, e.target.value)} />
                      ) : fs.kind === 'PDFCheckBox' ? (
                        <OptCheck label={s('fieldChecked')} checked={!!fs.value} onChange={(v) => setValue(i, v)} />
                      ) : fs.options ? (
                        <OptSelect value={String(fs.value ?? '')} onChange={(e) => setValue(i, e.target.value)}>
                          <option value="">{s('selectPlaceholder')}</option>
                          {fs.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </OptSelect>
                      ) : (
                        <p className="text-[11px] text-gray-400">{s('fieldNotEditable')}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <OptCheck label={s('flattenAfterFilling')} checked={flatten} onChange={setFlatten} />
                </div>
                <button type="button" className={btnPrimary} disabled={ctx.status === 'working'} onClick={() => void applyFilled()}>
                  <Play className="w-4 h-4" /> {s('applyAnswersBtn')}
                </button>
              </>
            )}

            {loaded && (
              <div className="mt-6 border-t border-dashed border-gray-200 dark:border-gray-700 pt-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                  <Plus className="w-4 h-4 text-orange-500" /> {s('addNewField')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <OptLabel>{s('fieldNameLabel')}</OptLabel>
                    <OptInput value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. signature_date" />
                  </div>
                  <div>
                    <OptLabel>{s('typeLabel')}</OptLabel>
                    <OptSelect value={newType} onChange={(e) => setNewType(e.target.value as 'text' | 'checkbox')}>
                      <option value="text">{s('fieldText')}</option>
                      <option value="checkbox">{s('fieldCheckbox')}</option>
                    </OptSelect>
                  </div>
                  <div>
                    <OptLabel>{c('page')}{pageCount ? ` (1–${pageCount})` : ''}</OptLabel>
                    <OptInput type="number" min={1} max={pageCount || 1} value={newPage} onChange={(e) => setNewPage(Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                  <div>
                    <OptLabel>{s('xPositionPct')}</OptLabel>
                    <OptInput type="number" min={0} max={95} value={newX} onChange={(e) => setNewX(Math.min(95, Math.max(0, Number(e.target.value) || 0)))} />
                  </div>
                  <div>
                    <OptLabel>{s('yPositionPct')}</OptLabel>
                    <OptInput type="number" min={0} max={95} value={newY} onChange={(e) => setNewY(Math.min(95, Math.max(0, Number(e.target.value) || 0)))} />
                  </div>
                  <div>
                    <OptLabel>{s('widthPctTextOnly')}</OptLabel>
                    <OptInput type="number" min={5} max={100} value={newW} onChange={(e) => setNewW(Math.min(100, Math.max(5, Number(e.target.value) || 40)))} />
                  </div>
                </div>
                <button type="button" className={btnPrimary} disabled={ctx.status === 'working'} onClick={() => void addField()}>
                  <Plus className="w-4 h-4" /> {s('addFieldDownloadBtn')}
                </button>
              </div>
            )}
            {!loaded && !loadError && <p className="text-xs text-gray-500">{s('formsChoose2')}</p>}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. Scan to PDF — photograph pages with the camera (or upload photos)
// ---------------------------------------------------------------------------

export const ScanToPdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [pageSize, setPageSize] = useState<'fit' | 'a4'>('fit');
  const [margin, setMargin] = useState(0);
  const [busy, setBusy] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <PdfToolShell tool={tool} accept="image/*" multiple>
      {(ctx) => {
        const openCamera = async () => {
          try {
            if (!navigator.mediaDevices?.getUserMedia) {
              throw new Error(s('errCameraUnavailable'));
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            setCameraOn(true);
            requestAnimationFrame(() => {
              if (videoRef.current) videoRef.current.srcObject = stream;
            });
            ctx.setStatus('idle', '');
          } catch (e: any) {
            ctx.setStatus('error', s('cameraUnavailable').replace('{msg}', e?.message || s('permissionDenied')));
          }
        };

        const capture = async () => {
          const video = videoRef.current;
          if (!video || !video.videoWidth) {
            ctx.setStatus('error', s('errCameraNotReady'));
            return;
          }
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')!.drawImage(video, 0, 0);
            const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
            const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
            ctx.setFiles([...ctx.files, file]);
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errCapture'));
          }
        };

        const convert = async () => {
          if (!ctx.files.length) {
            ctx.setStatus('error', s('errCaptureFirst'));
            return;
          }
          setBusy(true);
          try {
            ctx.setStatus('working', s('scanBuilding'));
            const out = await imagesToPdfBytes(ctx.files, pageSize, margin, lang);
            downloadBytes(out, 'scanned-document.pdf');
            ctx.setStatus('done', s('scanCreated').replace('{count}', String(ctx.files.length)));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errScanBuild'));
          } finally {
            setBusy(false);
          }
        };

        return (
          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {!cameraOn ? (
                <button type="button" className={btnGhost} onClick={() => void openCamera()}>
                  <Camera className="w-4 h-4" /> {s('openCamera')}
                </button>
              ) : (
                <>
                  <button type="button" className={btnGhost} onClick={() => void capture()}>
                    <Camera className="w-4 h-4" /> {s('capturePhoto')}
                  </button>
                  <button type="button" className={btnGhost} onClick={stopCamera}>
                    <VideoOff className="w-4 h-4" /> {s('closeCamera')}
                  </button>
                </>
              )}
            </div>
            {cameraOn && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-600 bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[420px] object-contain" />
              </div>
            )}
            <p className="text-[11px] text-gray-500 mt-2">
              {s('scanUploadHint')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div>
                <OptLabel>{s('pageSizeLabel')}</OptLabel>
                <OptSelect value={pageSize} onChange={(e) => setPageSize(e.target.value as 'fit' | 'a4')}>
                  <option value="fit">{s('fitToEachPhoto')}</option>
                  <option value="a4">{s('a4Pages')}</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>{s('marginLabel')}</OptLabel>
                <OptSelect value={String(margin)} onChange={(e) => setMargin(Number(e.target.value))}>
                  <option value="0">{s('marginNoneOpt')}</option>
                  <option value="18">{s('marginSmallOpt')}</option>
                  <option value="36">{s('marginMediumOpt')}</option>
                </OptSelect>
              </div>
            </div>

            <button type="button" className={btnPrimary} disabled={!ctx.files.length || busy} onClick={() => void convert()}>
              <Play className="w-4 h-4" /> {s('convertPagesToPdf').replace('{count}', String(ctx.files.length || ''))}
            </button>
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8 & 9. AI tools (Gemini) — summarize and translate a PDF's text
// ---------------------------------------------------------------------------

function getGeminiKey(): string {
  return ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';
}

const MissingKeyNotice: React.FC = () => {
  const s = useStrings(PDF_STRINGS);
  return (
  <div className="mt-4 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
    {s('missingKey2Before')} <span className="font-bold">aistudio.google.com</span>, {s('missingKey2Middle')}{' '}
    <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">VITE_GEMINI_API_KEY=your-key</code> {s('missingKey2After')}{' '}
    <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">.env</code> {s('missingKey2End')}
  </div>
  );
};

async function geminiText(apiKey: string, prompt: string, emptyMsg: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const res: any = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  const text = (res?.text ?? '') as string;
  if (!text || !text.trim()) throw new Error(emptyMsg);
  return text;
}

function chunkText(text: string, max = 3500): string[] {
  const paras = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let cur = '';
  const push = () => {
    if (cur.trim()) chunks.push(cur);
    cur = '';
  };
  for (const para of paras) {
    if (para.length > max) {
      push();
      for (let i = 0; i < para.length; i += max) chunks.push(para.slice(i, i + max));
      continue;
    }
    if (cur && (cur + '\n\n' + para).length > max) {
      push();
      cur = para;
    } else {
      cur = cur ? cur + '\n\n' + para : para;
    }
  }
  push();
  return chunks.filter((c) => c.trim().length > 0);
}

export const AiSummarizePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const apiKey = getGeminiKey();
  const [style, setStyle] = useState<'brief' | 'detailed' | 'bullets'>('brief');
  const [summary, setSummary] = useState('');

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf">
      {(ctx) => {
        const file = ctx.files[0];
        const run = async () => {
          if (!file) {
            ctx.setStatus('error', s('errChoosePdfFirst'));
            return;
          }
          if (!apiKey) {
            ctx.setStatus('error', s('errNoGeminiKey'));
            return;
          }
          try {
            setSummary('');
            ctx.setStatus('working', s('extractingText'));
            const pages = await extractAllText(await fileToBytes(file));
            const text = pages.join('\n\n').trim();
            if (!text) {
              throw new Error(s('errNoTextOcrFirst'));
            }
            const truncated = text.slice(0, 60000);
            ctx.setStatus('working', s('summarizingGemini'));
            const styleHint =
              style === 'brief'
                ? 'a brief style: one short, clear paragraph'
                : style === 'detailed'
                  ? 'a detailed style: a thorough multi-paragraph summary covering all major points'
                  : 'a bullet-point style: the key takeaways as a bullet list, one point per line starting with "- "';
            const out = await geminiText(
              apiKey,
              `You are an expert document summarizer. Summarize the following document in ${styleHint}. Output only the summary, no preamble.\n\n--- DOCUMENT ---\n${truncated}`,
              s('geminiEmptyResponse')
            );
            setSummary(out);
            ctx.setStatus('done', s('summaryReady'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errSummarizeFailed'));
          }
        };

        const downloadPdf = async () => {
          if (!summary || !file) return;
          try {
            const out = await buildTextPdfBytes(s('summaryOf').replace('{name}', file.name), summary);
            downloadBytes(out, `${baseName(file)}-summary.pdf`);
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errSummaryPdf'));
          }
        };

        return (
          <div>
            {!apiKey && <MissingKeyNotice />}
            <div className="mt-4 max-w-[260px]">
              <OptLabel>{s('summaryStyle')}</OptLabel>
              <OptSelect value={style} onChange={(e) => setStyle(e.target.value as 'brief' | 'detailed' | 'bullets')}>
                <option value="brief">{s('summaryBriefOpt')}</option>
                <option value="detailed">{s('summaryDetailedOpt')}</option>
                <option value="bullets">{s('summaryBulletsOpt')}</option>
              </OptSelect>
            </div>
            <button type="button" className={btnPrimary} disabled={!apiKey || !file || ctx.status === 'working'} onClick={() => void run()}>
              <Sparkles className="w-4 h-4" /> {s('extractSummarizeBtn')}
            </button>
            {summary && (
              <div className="mt-4">
                <OptLabel>{s('summaryHeading')}</OptLabel>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 px-4 py-3 max-h-[380px] overflow-y-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button" className={btnGhost} onClick={() => file && downloadText(summary, `${baseName(file)}-summary.txt`)}>
                    <Download className="w-3.5 h-3.5" /> {s('downloadTxtFile')}
                  </button>
                  <button type="button" className={btnGhost} onClick={() => void downloadPdf()}>
                    <FileText className="w-3.5 h-3.5" /> {s('downloadPdfFile')}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

const TRANSLATE_LANGUAGES = [
  'English',
];

export const TranslatePdf: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const uiLang = useLang();
  void uiLang;
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const apiKey = getGeminiKey();
  const [lang, setLang] = useState('English');
  const [result, setResult] = useState('');

  return (
    <PdfToolShell tool={tool} accept=".pdf,application/pdf">
      {(ctx) => {
        const file = ctx.files[0];
        const latin1Only = result.length > 0 && !/[^\u0000-\u00FF]/.test(result);

        const run = async () => {
          if (!file) {
            ctx.setStatus('error', s('errChoosePdfFirst'));
            return;
          }
          if (!apiKey) {
            ctx.setStatus('error', s('errNoGeminiKey'));
            return;
          }
          try {
            setResult('');
            ctx.setStatus('working', s('extractingText'));
            const pages = await extractAllText(await fileToBytes(file));
            const full = pages.join('\n\n').trim();
            if (!full) {
              throw new Error(s('errNoTextOcrFirst'));
            }
            const chunks = chunkText(full, 3500);
            const translated: string[] = [];
            for (let i = 0; i < chunks.length; i++) {
              ctx.setStatus('working', s('translatingChunk').replace('{n}', String(i + 1)).replace('{total}', String(chunks.length)).replace('{lang}', lang));
              const out = await geminiText(
                apiKey,
                `Translate the following text to ${lang}. Output only the translation — no notes, no preamble, keep paragraph breaks.\n\n${chunks[i]}`,
                s('geminiEmptyResponse')
              );
              translated.push(out.trim());
            }
            setResult(translated.join('\n\n'));
            ctx.setStatus('done', s('translationReady').replace('{lang}', lang));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errTranslateFailed'));
          }
        };

        const downloadPdf = async () => {
          if (!result || !file) return;
          try {
            const out = await buildTextPdfBytes(s('translatedToTitle').replace('{lang}', lang).replace('{name}', file.name), result);
            downloadBytes(out, `${baseName(file)}-translated.pdf`);
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('errTranslatedPdf'));
          }
        };

        return (
          <div>
            {!apiKey && <MissingKeyNotice />}
            <div className="mt-4 max-w-[260px]">
              <OptLabel>{s('translateToLabel')}</OptLabel>
              <OptSelect value={lang} onChange={(e) => setLang(e.target.value)}>
                {TRANSLATE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </OptSelect>
            </div>
            <button type="button" className={btnPrimary} disabled={!apiKey || !file || ctx.status === 'working'} onClick={() => void run()}>
              <Languages className="w-4 h-4" /> {s('extractTranslateBtn')}
            </button>
            {result && (
              <div className="mt-4">
                <OptLabel>{s('translationHeadingTpl').replace('{lang}', lang)}</OptLabel>
                <textarea
                  readOnly
                  value={result}
                  rows={12}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-100"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button" className={btnGhost} onClick={() => file && downloadText(result, `${baseName(file)}-translated.txt`)}>
                    <Download className="w-3.5 h-3.5" /> {s('downloadTxtFile')}
                  </button>
                  {latin1Only ? (
                    <button type="button" className={btnGhost} onClick={() => void downloadPdf()}>
                      <FileText className="w-3.5 h-3.5" /> {s('downloadPdfFile')}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 self-center">
                      {s('unicodeFontNote')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};
