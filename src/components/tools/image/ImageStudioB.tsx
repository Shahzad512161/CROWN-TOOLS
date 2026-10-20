import React, { useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Trash2, RotateCcw, Pipette, LayoutGrid } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  fileToImage,
  imageToCanvas,
  canvasToBlobP,
  getPixelData,
  extractPalette,
  imageDataToAscii,
  parseSvgSize,
  centeredCropRect,
  type PixelData,
  type PaletteColor,
} from '../../../lib/image/core';
import { rgbToHex, rgbToHsl, hexToRgb } from '../../../lib/dev/core';
import { downloadBlob } from '../../../lib/pdf/core';
import {
  ImageCard,
  FileDrop,
  SampleBtn,
  PrimaryBtn,
  BlobDownloadBtn,
  TransparencyBg,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
  CopyBtn,
  Stat,
  ErrorBox,
} from './ImageShell';
import { DownloadBtn } from '../dev/DevShell';

// ---------------- shared helpers ----------------

const baseName = (name: string | null | undefined, fallback: string) =>
  (name || fallback).replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').toLowerCase() || fallback;

/** Draw an image into a canvas capped at maxDim on the longest side. */
function scaledCanvas(img: HTMLImageElement, maxDim: number): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  return imageToCanvas(img, w, h);
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step = 1, suffix = '', onChange }) => (
  <div>
    <OptLabel>{label}: <span className="text-gray-900 dark:text-white">{value}{suffix}</span></OptLabel>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-rose-600"
    />
  </div>
);

// ============================================================
// 1. Color Palette Extractor
// ============================================================

export const ColorPaletteExtractor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [pixels, setPixels] = useState<PixelData | null>(null);
  const [count, setCount] = useState(6);
  const [stripBlob, setStripBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      const img = await fileToImage(file);
      setPixels(getPixelData(scaledCanvas(img, 400)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  const palette: PaletteColor[] = useMemo(
    () => (pixels ? extractPalette(pixels, count) : []),
    [pixels, count],
  );

  useEffect(() => {
    if (!palette.length) { setStripBlob(null); return; }
    const tile = 100;
    const canvas = document.createElement('canvas');
    canvas.width = tile * palette.length;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    palette.forEach((c, i) => {
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * tile, 0, tile, 92);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(i * tile, 92, tile, 28);
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.hex, i * tile + tile / 2, 110);
    });
    canvasToBlobP(canvas).then(setStripBlob).catch(() => setStripBlob(null));
  }, [palette]);

  const cssVars = palette.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');

  return (
    <ImageCard tool={tool} note="Colors are extracted with a median-cut algorithm over a downscaled copy of your image — near-transparent pixels are ignored. Shares are approximate (based on sampled pixels).">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {pixels && (
        <div className="mt-5 space-y-5">
          <div className="max-w-[180px]">
            <OptLabel>Palette size</OptLabel>
            <OptSelect value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} colors</option>)}
            </OptSelect>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {palette.map((c, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="p-2.5 space-y-1">
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{c.hex}</div>
                  <div className="font-mono text-[11px] text-gray-500">rgb({c.rgb.r}, {c.rgb.g}, {c.rgb.b})</div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full bg-rose-500" style={{ width: `${Math.max(2, Math.round(c.share * 100))}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-500">{(c.share * 100).toFixed(1)}%</span>
                    <CopyBtn text={c.hex} label="Copy hex" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4 items-start">
            <div>
              <OptLabel>CSS variables</OptLabel>
              <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-mono overflow-auto max-h-44 whitespace-pre text-gray-900 dark:text-gray-100">{cssVars}</pre>
              <div className="mt-2"><CopyBtn text={cssVars} label="Copy CSS variables" /></div>
            </div>
            <div>
              <OptLabel>Palette strip image</OptLabel>
              <div className="flex h-[104px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {palette.map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />)}
              </div>
              <div className="mt-2">
                <BlobDownloadBtn blob={stripBlob} filename={`${baseName(fileName, 'palette')}-palette.png`} label="Download palette PNG" />
              </div>
            </div>
          </div>
        </div>
      )}
    </ImageCard>
  );
};

// ============================================================
// 2. Profile Picture Maker
// ============================================================

const GRADIENT_PRESETS: Record<string, { label: string; stops: [string, string, string] }> = {
  sunset: { label: 'Sunset', stops: ['#f59e0b', '#ef4444', '#ec4899'] },
  ocean: { label: 'Ocean', stops: ['#06b6d4', '#3b82f6', '#6366f1'] },
  violet: { label: 'Violet', stops: ['#8b5cf6', '#d946ef', '#ec4899'] },
};

export const ProfilePictureMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [ringStyle, setRingStyle] = useState<'none' | 'solid' | 'gradient'>('solid');
  const [ringColor, setRingColor] = useState('#e11d48');
  const [gradientPreset, setGradientPreset] = useState<keyof typeof GRADIENT_PRESETS>('sunset');
  const [ringWidth, setRingWidth] = useState(18);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [transparent, setTransparent] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      const loaded = await fileToImage(file);
      setImg(loaded);
      setZoom(1); setShiftX(0); setShiftY(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) { setBlob(null); return; }
    const SIZE = 800;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    if (!transparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }
    ctx.save();
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const cover = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * cover;
    const dh = img.naturalHeight * cover;
    ctx.drawImage(img, SIZE / 2 - dw / 2 + shiftX, SIZE / 2 - dh / 2 + shiftY, dw, dh);
    ctx.restore();
    if (ringStyle !== 'none' && ringWidth > 0) {
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - ringWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = ringWidth;
      if (ringStyle === 'solid') {
        ctx.strokeStyle = ringColor;
      } else {
        const stops = GRADIENT_PRESETS[gradientPreset].stops;
        const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
        grad.addColorStop(0, stops[0]);
        grad.addColorStop(0.5, stops[1]);
        grad.addColorStop(1, stops[2]);
        ctx.strokeStyle = grad;
      }
      ctx.stroke();
    }
    canvasToBlobP(canvas).then(setBlob).catch(() => setBlob(null));
  }, [img, zoom, shiftX, shiftY, ringStyle, ringColor, gradientPreset, ringWidth, bgColor, transparent]);

  return (
    <ImageCard tool={tool} note="Exports an 800 × 800 PNG. With 'Transparent corners' on, the area outside the circle stays transparent, which suits most profile-photo uploads.">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {img && (
        <div className="mt-5 grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <TransparencyBg>
            <canvas ref={canvasRef} width={800} height={800} className="w-full h-auto block" />
          </TransparencyBg>
          <div className="space-y-4">
            <Slider label="Zoom" value={zoom} min={1} max={3} step={0.05} suffix="×" onChange={setZoom} />
            <Slider label="Shift left / right" value={shiftX} min={-300} max={300} suffix="px" onChange={setShiftX} />
            <Slider label="Shift up / down" value={shiftY} min={-300} max={300} suffix="px" onChange={setShiftY} />
            <div>
              <OptLabel>Ring style</OptLabel>
              <OptSelect value={ringStyle} onChange={(e) => setRingStyle(e.target.value as typeof ringStyle)}>
                <option value="none">None</option>
                <option value="solid">Solid color</option>
                <option value="gradient">Gradient</option>
              </OptSelect>
            </div>
            {ringStyle === 'solid' && (
              <div>
                <OptLabel>Ring color</OptLabel>
                <input type="color" value={ringColor} onChange={(e) => setRingColor(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
              </div>
            )}
            {ringStyle === 'gradient' && (
              <div>
                <OptLabel>Gradient preset</OptLabel>
                <OptSelect value={gradientPreset} onChange={(e) => setGradientPreset(e.target.value as keyof typeof GRADIENT_PRESETS)}>
                  {Object.entries(GRADIENT_PRESETS).map(([key, p]) => <option key={key} value={key}>{p.label}</option>)}
                </OptSelect>
              </div>
            )}
            <Slider label="Ring width" value={ringWidth} min={0} max={60} suffix="px" onChange={setRingWidth} />
            <div>
              <OptLabel>Background color (corners)</OptLabel>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} disabled={transparent} className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer disabled:opacity-40" />
            </div>
            <OptCheck label="Transparent corners" checked={transparent} onChange={setTransparent} />
            <BlobDownloadBtn blob={blob} filename={`${baseName(fileName, 'profile')}-profile.png`} label="Download profile picture" />
          </div>
        </div>
      )}
      {!img && <canvas ref={canvasRef} width={800} height={800} className="hidden" />}
    </ImageCard>
  );
};

// ============================================================
// 3. Image Collage Maker
// ============================================================

interface CollageItem { id: number; img: HTMLImageElement; url: string; name: string }
type CollageLayout = 'auto' | '2x2' | '3x3' | '2x1' | '1x2' | 'strip-h' | 'strip-v';

function collageGrid(layout: CollageLayout, n: number): { cols: number; rows: number } {
  switch (layout) {
    case '2x2': return { cols: 2, rows: 2 };
    case '3x3': return { cols: 3, rows: 3 };
    case '2x1': return { cols: 2, rows: 1 };
    case '1x2': return { cols: 1, rows: 2 };
    case 'strip-h': return { cols: Math.max(1, n), rows: 1 };
    case 'strip-v': return { cols: 1, rows: Math.max(1, n) };
    default: {
      const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, n))));
      return { cols, rows: Math.max(1, Math.ceil(Math.max(1, n) / cols)) };
    }
  }
}

export const ImageCollageMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [items, setItems] = useState<CollageItem[]>([]);
  const [layout, setLayout] = useState<CollageLayout>('auto');
  const [gap, setGap] = useState(12);
  const [bg, setBg] = useState('#ffffff');
  const [radius, setRadius] = useState(12);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addFiles = async (files: FileList | File[]) => {
    setError(null);
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, 9 - items.length);
    const loaded: CollageItem[] = [];
    for (const f of list) {
      try {
        const img = await fileToImage(f);
        loaded.push({ id: ++idRef.current, img, url: URL.createObjectURL(f), name: f.name });
      } catch { /* skip unreadable file */ }
    }
    if (loaded.length) setItems((prev) => [...prev, ...loaded].slice(0, 9));
    else if (items.length >= 9) setError('Maximum of 9 images reached.');
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !items.length) { setBlob(null); return; }
    const n = items.length;
    const { cols, rows } = collageGrid(layout, n);
    const vertical = layout === 'strip-v';
    const cell = vertical
      ? Math.floor((1200 - gap * (rows + 1)) / rows)
      : Math.floor((1200 - gap * (cols + 1)) / cols);
    canvas.width = vertical ? cell + gap * 2 : 1200;
    canvas.height = vertical ? 1200 : rows * cell + gap * (rows + 1);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = gap + col * (cell + gap);
      const y = gap + row * (cell + gap);
      ctx.save();
      roundedRectPath(ctx, x, y, cell, cell, radius);
      ctx.clip();
      const crop = centeredCropRect(item.img.naturalWidth, item.img.naturalHeight, 1);
      ctx.drawImage(item.img, crop.sx, crop.sy, crop.sw, crop.sh, x, y, cell, cell);
      ctx.restore();
    });
    canvasToBlobP(canvas).then(setBlob).catch(() => setBlob(null));
  }, [items, layout, gap, bg, radius]);

  return (
    <ImageCard tool={tool} note="Cells are square and center-cropped, so portrait and landscape photos mix cleanly. The collage renders at 1200 px on its long side; individual photos are not upscaled beyond the cell size.">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-2xl px-4 py-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'border-gray-300 dark:border-gray-600 hover:border-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <LayoutGrid className="w-8 h-8 mx-auto text-rose-500 mb-2" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Drop up to 9 images here or click to browse</p>
        <p className="text-[11px] text-gray-500 mt-1">{items.length} / 9 images added</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              <span className="absolute top-0.5 left-0.5 text-[9px] font-bold bg-black/60 text-white rounded px-1">{i + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 text-white cursor-pointer hover:bg-black/80"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-5 grid lg:grid-cols-[1fr_300px] gap-5 items-start">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <canvas ref={canvasRef} className="w-full h-auto block rounded-lg" />
          </div>
          <div className="space-y-4">
            <div>
              <OptLabel>Layout</OptLabel>
              <OptSelect value={layout} onChange={(e) => setLayout(e.target.value as CollageLayout)}>
                <option value="auto">Auto grid</option>
                <option value="2x2">Grid 2 × 2</option>
                <option value="3x3">Grid 3 × 3</option>
                <option value="2x1">2 × 1 wide</option>
                <option value="1x2">1 × 2 tall</option>
                <option value="strip-h">Horizontal strip</option>
                <option value="strip-v">Vertical strip</option>
              </OptSelect>
            </div>
            <Slider label="Gap" value={gap} min={0} max={40} suffix="px" onChange={setGap} />
            <Slider label="Corner radius" value={radius} min={0} max={40} suffix="px" onChange={setRadius} />
            <div>
              <OptLabel>Background color</OptLabel>
              <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
            </div>
            <BlobDownloadBtn blob={blob} filename="collage.png" label="Download collage PNG" />
          </div>
        </div>
      )}
      {!items.length && <canvas ref={canvasRef} className="hidden" />}
    </ImageCard>
  );
};

// ============================================================
// 4. Image Splitter
// ============================================================

const SPLIT_PRESETS: { label: string; rows: number; cols: number }[] = [
  { label: 'Instagram grid 3×3', rows: 3, cols: 3 },
  { label: 'Banner 3×1', rows: 1, cols: 3 },
  { label: '2×2', rows: 2, cols: 2 },
  { label: '2×3 portrait', rows: 3, cols: 2 },
];

export const ImageSplitter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setZipBlob(null);
    try {
      const loaded = await fileToImage(file);
      setImg(loaded);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  const split = async () => {
    if (!img) return;
    setBusy(true);
    setError(null);
    try {
      const zip = new JSZip();
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = Math.round((c * W) / cols);
          const sy = Math.round((r * H) / rows);
          const sw = Math.round(((c + 1) * W) / cols) - sx;
          const sh = Math.round(((r + 1) * H) / rows) - sy;
          const tile = document.createElement('canvas');
          tile.width = sw;
          tile.height = sh;
          tile.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          const blob = await canvasToBlobP(tile, 'image/png');
          zip.file(`part-${r + 1}-${c + 1}.png`, blob);
        }
      }
      setZipBlob(await zip.generateAsync({ type: 'blob' }));
    } catch {
      setError('Splitting failed — the image may be too large for this browser.');
    }
    setBusy(false);
  };

  return (
    <ImageCard tool={tool} note="Tiles are cut at full original resolution and named part-{row}-{col}.png in row-major order starting from the top-left. For an Instagram profile grid, post the tiles in reverse order (bottom-right first) so they land in the right sequence on your profile.">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {img && previewUrl && (
        <div className="mt-5 grid lg:grid-cols-[1fr_300px] gap-5 items-start">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <img src={previewUrl} alt="To split" className="w-full h-auto block" />
            {Array.from({ length: cols - 1 }, (_, i) => (
              <div key={`v${i}`} className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80" style={{ left: `${((i + 1) / cols) * 100}%` }} />
            ))}
            {Array.from({ length: rows - 1 }, (_, i) => (
              <div key={`h${i}`} className="absolute left-0 right-0 h-0.5 bg-rose-500/80" style={{ top: `${((i + 1) / rows) * 100}%` }} />
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <OptLabel>Presets</OptLabel>
              <div className="flex flex-wrap gap-1.5">
                {SPLIT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setRows(p.rows); setCols(p.cols); setZipBlob(null); }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      rows === p.rows && cols === p.cols
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <OptLabel>Rows</OptLabel>
                <OptSelect value={rows} onChange={(e) => { setRows(Number(e.target.value)); setZipBlob(null); }}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </OptSelect>
              </div>
              <div>
                <OptLabel>Columns</OptLabel>
                <OptSelect value={cols} onChange={(e) => { setCols(Number(e.target.value)); setZipBlob(null); }}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </OptSelect>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Tiles" value={rows * cols} />
              <Stat label="Tile size" value={`${Math.round(img.naturalWidth / cols)}×${Math.round(img.naturalHeight / rows)}`} />
            </div>
            <PrimaryBtn onClick={split} disabled={busy} className="w-full">
              {busy ? 'Splitting…' : 'Split image'}
            </PrimaryBtn>
            <BlobDownloadBtn blob={zipBlob} filename={`${baseName(fileName, 'image')}-tiles.zip`} label="Download tiles ZIP" />
          </div>
        </div>
      )}
    </ImageCard>
  );
};

// ============================================================
// 5. Image Color Picker (eyedropper)
// ============================================================

interface RgbColor { r: number; g: number; b: number }

export const ImageColorPicker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [picked, setPicked] = useState<RgbColor | null>(null);
  const [hover, setHover] = useState<RgbColor | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setPicked(null);
    setHistory([]);
    try {
      const img = await fileToImage(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const drawn = scaledCanvas(img, 900);
      canvas.width = drawn.width;
      canvas.height = drawn.height;
      canvas.getContext('2d', { willReadFrequently: true })!.drawImage(drawn, 0, 0);
      setHasImage(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  const colorAt = (e: React.MouseEvent<HTMLCanvasElement>): RgbColor | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null;
    const data = canvas.getContext('2d', { willReadFrequently: true })!.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  };

  const onPick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = colorAt(e);
    if (!c) return;
    setPicked(c);
    const hex = rgbToHex(c);
    setHistory((prev) => [hex, ...prev.filter((h) => h !== hex)].slice(0, 12));
  };

  const shown = picked ?? hover;
  const hsl = shown ? rgbToHsl(shown) : null;
  const cssPalette = history.map((h, i) => `--picked-${i + 1}: ${h};`).join('\n');

  return (
    <ImageCard tool={tool} note="Click anywhere on the image to sample that exact pixel. Colors are read from a copy scaled to at most 900 px wide, so a sampled pixel can differ by a step or two from the full-resolution original at sharp edges.">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      <div className={hasImage ? 'mt-5 grid lg:grid-cols-[1fr_300px] gap-5 items-start' : 'hidden'}>
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <canvas
            ref={canvasRef}
            onClick={onPick}
            onMouseMove={(e) => setHover(colorAt(e))}
            onMouseLeave={() => setHover(null)}
            className="w-full h-auto block cursor-crosshair"
          />
          {hover && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 pointer-events-none">
              <span className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: rgbToHex(hover) }} />
              <span className="font-mono text-[11px] font-bold text-gray-800 dark:text-gray-100">{rgbToHex(hover)}</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <Pipette className="w-4 h-4 text-rose-600" /> {picked ? 'Picked color' : 'Hover the image, click to pick'}
          </div>
          {shown && hsl ? (
            <>
              <div className="h-20 rounded-xl border border-gray-200 dark:border-gray-700" style={{ backgroundColor: rgbToHex(shown) }} />
              <div className="space-y-2">
                {[
                  { label: 'HEX', value: rgbToHex(shown) },
                  { label: 'RGB', value: `rgb(${shown.r}, ${shown.g}, ${shown.b})` },
                  { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 w-8">{row.label}</span>
                    <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white flex-1 truncate">{row.value}</span>
                    <CopyBtn text={row.value} label="Copy" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">No color sampled yet.</p>
          )}
          {history.length > 0 && (
            <div>
              <OptLabel>Picked colors (click to re-select)</OptLabel>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h) => (
                  <button
                    key={h}
                    type="button"
                    title={h}
                    onClick={() => setPicked(hexToRgb(h))}
                    className="w-9 h-9 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    style={{ backgroundColor: h }}
                  />
                ))}
              </div>
              <div className="mt-3">
                <CopyBtn text={cssPalette} label="Copy palette as CSS" />
              </div>
            </div>
          )}
        </div>
      </div>
      {!hasImage && <canvas ref={canvasRef} className="hidden" />}
    </ImageCard>
  );
};

// ============================================================
// 6. Photo Filter Editor
// ============================================================

interface FilterState {
  brightness: number; contrast: number; saturate: number; grayscale: number;
  sepia: number; hue: number; blur: number;
}

const FILTER_DEFAULTS: FilterState = { brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, hue: 0, blur: 0 };

const FILTER_SLIDERS: { key: keyof FilterState; label: string; min: number; max: number; suffix: string }[] = [
  { key: 'brightness', label: 'Brightness', min: 0, max: 200, suffix: '%' },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, suffix: '%' },
  { key: 'saturate', label: 'Saturation', min: 0, max: 200, suffix: '%' },
  { key: 'grayscale', label: 'Grayscale', min: 0, max: 100, suffix: '%' },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100, suffix: '%' },
  { key: 'hue', label: 'Hue rotate', min: 0, max: 360, suffix: '°' },
  { key: 'blur', label: 'Blur', min: 0, max: 10, suffix: 'px' },
];

const FILTER_PRESETS: { label: string; values: Partial<FilterState> }[] = [
  { label: 'Normal', values: {} },
  { label: 'Vivid', values: { saturate: 160, contrast: 110 } },
  { label: 'Mono', values: { grayscale: 100 } },
  { label: 'Sepia', values: { sepia: 80 } },
  { label: 'Vintage', values: { sepia: 40, contrast: 90, brightness: 105, saturate: 80 } },
  { label: 'Cold', values: { hue: 15, saturate: 90, brightness: 105 } },
  { label: 'Warm', values: { sepia: 25, saturate: 130, brightness: 103 } },
];

const filterString = (f: FilterState) =>
  `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%) sepia(${f.sepia}%) hue-rotate(${f.hue}deg) blur(${f.blur}px)`;

export const PhotoFilterEditor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [filters, setFilters] = useState<FilterState>(FILTER_DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      setImg(await fileToImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const drawn = scaledCanvas(img, 1400);
    canvas.width = drawn.width;
    canvas.height = drawn.height;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = filterString(filters);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  }, [img, filters]);

  const applyPreset = (values: Partial<FilterState>) => setFilters({ ...FILTER_DEFAULTS, ...values });

  const downloadFullRes = async () => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = filterString(filters);
    ctx.drawImage(img, 0, 0);
    const blob = await canvasToBlobP(canvas, 'image/png');
    downloadBlob(blob, `${baseName(fileName, 'photo')}-filtered.png`);
  };

  const isDefault = JSON.stringify(filters) === JSON.stringify(FILTER_DEFAULTS);

  return (
    <ImageCard tool={tool} note="Filters use the browser's built-in CSS filter engine on canvas. The preview is capped at 1400 px, but downloads render at the photo's full original resolution.">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {img && (
        <div className="mt-5 grid lg:grid-cols-[1fr_300px] gap-5 items-start">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
            <canvas ref={canvasRef} className="w-full h-auto block rounded-lg" />
          </div>
          <div className="space-y-4">
            <div>
              <OptLabel>Presets</OptLabel>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.values)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            {FILTER_SLIDERS.map((s) => (
              <Slider
                key={s.key}
                label={s.label}
                value={filters[s.key]}
                min={s.min}
                max={s.max}
                suffix={s.suffix}
                onChange={(v) => setFilters((prev) => ({ ...prev, [s.key]: v }))}
              />
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFilters(FILTER_DEFAULTS)}
                disabled={isDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <PrimaryBtn onClick={downloadFullRes}>Download full resolution</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
      {!img && <canvas ref={canvasRef} className="hidden" />}
    </ImageCard>
  );
};

// ============================================================
// 7. SVG to PNG Converter
// ============================================================

export const SvgToPng: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [fileName, setFileName] = useState<string | null>(null);
  const [svgText, setSvgText] = useState('');
  const [outWidth, setOutWidth] = useState(512);
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'custom'>('transparent');
  const [bgColor, setBgColor] = useState('#f59e0b');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parsed = useMemo(() => (svgText.trim() ? parseSvgSize(svgText) : null), [svgText]);

  useEffect(() => {
    if (parsed) setOutWidth(Math.round(parsed.width));
  }, [parsed]);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      setSvgText(await file.text());
    } catch {
      setError('Could not read that file as text.');
    }
  };

  const convert = async () => {
    if (!svgText.trim()) { setError('Paste SVG code or upload an .svg file first.'); return; }
    setBusy(true);
    setError(null);
    setBlob(null);
    try {
      const aspect = parsed ? parsed.width / parsed.height : null;
      const W = Math.max(1, Math.round(outWidth));
      let src = svgText;
      // Force explicit dimensions so viewBox-only SVGs rasterize at the requested size
      if (!/<svg[^>]*\bwidth\s*=/i.test(src)) {
        const H = aspect ? Math.round(W / aspect) : W;
        src = src.replace(/<svg\b/i, `<svg width="${W}" height="${H}"`);
      }
      const url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('The browser could not render that SVG. Check the code is valid and self-contained.'));
        img.src = url;
      });
      const ratio = aspect ?? (img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
      const H = Math.max(1, Math.round(W / ratio));
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, W, H);
      if (bgMode !== 'transparent') {
        ctx.fillStyle = bgMode === 'white' ? '#ffffff' : bgColor;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      setBlob(await canvasToBlobP(canvas, 'image/png'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed.');
    }
    setBusy(false);
  };

  const outHeight = parsed ? Math.round(outWidth / (parsed.width / parsed.height)) : null;

  return (
    <ImageCard tool={tool} note="The SVG is rasterized by your browser's own SVG engine. External images, web fonts or scripts referenced by the SVG are blocked by browser security and will not appear — inline (embedded) assets only.">
      <div className="flex gap-2 mb-4">
        {(['paste', 'upload'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              mode === m
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {m === 'paste' ? 'Paste SVG code' : 'Upload .svg file'}
          </button>
        ))}
      </div>
      {mode === 'upload' && (
        <FileDrop onFile={handleFile} accept=".svg,image/svg+xml" label="Drop an .svg file here or click to browse" fileName={fileName} />
      )}
      <div className="mt-4">
        <OptLabel>SVG code</OptLabel>
        <textarea
          value={svgText}
          onChange={(e) => setSvgText(e.target.value)}
          rows={mode === 'paste' ? 8 : 4}
          placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">…</svg>'
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-900 dark:text-white"
          spellCheck={false}
        />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      <div className="mt-4 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <OptLabel>Intrinsic size</OptLabel>
          <div className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white">
            {parsed ? `${Math.round(parsed.width)} × ${Math.round(parsed.height)}` : 'Unknown'}
          </div>
        </div>
        <div>
          <OptLabel>Output width (px)</OptLabel>
          <OptInput type="number" min={1} max={8000} value={outWidth} onChange={(e) => setOutWidth(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div>
          <OptLabel>Output height</OptLabel>
          <div className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white">
            {outHeight ? `${outHeight} px (locked)` : 'From image'}
          </div>
        </div>
        <div>
          <OptLabel>Background</OptLabel>
          <OptSelect value={bgMode} onChange={(e) => setBgMode(e.target.value as typeof bgMode)}>
            <option value="transparent">Transparent</option>
            <option value="white">White</option>
            <option value="custom">Custom color</option>
          </OptSelect>
        </div>
      </div>
      {bgMode === 'custom' && (
        <div className="mt-3 max-w-[200px]">
          <OptLabel>Background color</OptLabel>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer" />
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PrimaryBtn onClick={convert} disabled={busy || !svgText.trim()}>
          {busy ? 'Converting…' : 'Convert to PNG'}
        </PrimaryBtn>
        <BlobDownloadBtn blob={blob} filename={`${baseName(fileName, 'vector')}.png`} label="Download PNG" />
      </div>
      <div className="mt-4">
        <TransparencyBg>
          <canvas ref={canvasRef} className="max-w-full h-auto block mx-auto" />
        </TransparencyBg>
      </div>
    </ImageCard>
  );
};

// ============================================================
// 8. Image to ASCII Art
// ============================================================

type AsciiRamp = 'standard' | 'detailed' | 'blocks';

export const ImageToAscii: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [columns, setColumns] = useState(100);
  const [ramp, setRamp] = useState<AsciiRamp>('standard');
  const [invert, setInvert] = useState(false);
  const [fontSize, setFontSize] = useState(8);
  const [text, setText] = useState('');
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    try {
      setImg(await fileToImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load that image.');
    }
  };

  useEffect(() => {
    if (!img) { setText(''); return; }
    const px = getPixelData(scaledCanvas(img, 400));
    setText(imageDataToAscii(px, columns, ramp, invert));
  }, [img, columns, ramp, invert]);

  useEffect(() => {
    if (!text) { setPngBlob(null); return; }
    const lines = text.split('\n');
    const fs = 14;
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = `${fs}px monospace`;
    const charW = probe.measureText('M').width;
    const lineH = fs * 1.25;
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(Math.max(...lines.map((l) => l.length)) * charW) + 16;
    canvas.height = Math.ceil(lines.length * lineH) + 16;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = invert ? '#ffffff' : '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = invert ? '#000000' : '#ffffff';
    ctx.font = `${fs}px monospace`;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => ctx.fillText(line, 8, 8 + i * lineH));
    canvasToBlobP(canvas).then(setPngBlob).catch(() => setPngBlob(null));
  }, [text, invert]);

  return (
    <ImageCard tool={tool} note="Each character cell samples the brightness at its center — fine detail smaller than a cell is lost, and wide images are analyzed at 400 px across. Block ramps (░▒▓█) give a chunkier, poster-like result.">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-[220px]">
          <FileDrop onFile={handleFile} fileName={fileName} />
        </div>
        <SampleBtn onFile={handleFile} />
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {img && text && (
        <div className="mt-5 grid lg:grid-cols-[1fr_280px] gap-5 items-start">
          <pre
            className="bg-gray-950 text-gray-100 rounded-xl border border-gray-800 p-3 overflow-auto max-h-[560px] whitespace-pre"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.05, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          >
            {text}
          </pre>
          <div className="space-y-4">
            <Slider label="Columns (width)" value={columns} min={40} max={200} onChange={setColumns} />
            <div>
              <OptLabel>Character ramp</OptLabel>
              <OptSelect value={ramp} onChange={(e) => setRamp(e.target.value as AsciiRamp)}>
                <option value="standard">Standard ( .:-=+*#%@ )</option>
                <option value="detailed">Detailed (70 shades)</option>
                <option value="blocks">Blocks ( ░▒▓█ )</option>
              </OptSelect>
            </div>
            <Slider label="Preview font size" value={fontSize} min={5} max={14} suffix="px" onChange={setFontSize} />
            <OptCheck label="Invert brightness" checked={invert} onChange={setInvert} />
            <div className="flex flex-wrap gap-2">
              <CopyBtn text={text} label="Copy ASCII art" />
              <DownloadBtn content={text} filename={`${baseName(fileName, 'ascii')}.txt`} label="Download .txt" />
              <BlobDownloadBtn blob={pngBlob} filename={`${baseName(fileName, 'ascii')}.png`} label="Download as PNG" />
            </div>
          </div>
        </div>
      )}
    </ImageCard>
  );
};

// ============================================================
// 9. Image to Base64 Encoder
// ============================================================

export const ImageBase64: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    setFileName(file.name);
    setFileSize(file.size);
    const reader = new FileReader();
    reader.onload = () => setDataUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsDataURL(file);
  };

  const base64Part = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : '';
  const mime = dataUrl.match(/^data:([^;]+)/)?.[1] || 'image/*';
  const overhead = fileSize > 0 ? (((dataUrl.length - fileSize) / fileSize) * 100).toFixed(1) : '0.0';

  const sections: { label: string; value: string }[] = dataUrl
    ? [
        { label: 'Full data URL', value: dataUrl },
        { label: 'Raw Base64 only', value: base64Part },
        { label: 'HTML snippet', value: `<img src="${dataUrl}" alt="" />` },
        { label: 'CSS snippet', value: `background-image: url("${dataUrl}");` },
      ]
    : [];

  return (
    <ImageCard tool={tool} note="Base64 inflates data by about 33%, and browsers and email clients handle data URLs differently (Outlook and Gmail clip or block them in many cases). Very large images produce multi-megabyte strings that can slow editors down — keep source images under roughly 1 MB.">
      <FileDrop onFile={handleFile} fileName={fileName} />
      {error && <div className="mt-3"><ErrorBox message={error} /></div>}
      {dataUrl && (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-start gap-4">
            <img src={dataUrl} alt="Uploaded preview" className="max-h-40 rounded-xl border border-gray-200 dark:border-gray-700 object-contain bg-gray-50 dark:bg-gray-800" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-[260px]">
              <Stat label="File size" value={`${(fileSize / 1024).toFixed(1)} KB`} />
              <Stat label="Base64 length" value={base64Part.length.toLocaleString()} />
              <Stat label="Data URL length" value={dataUrl.length.toLocaleString()} />
              <Stat label="Size overhead" value={`+${overhead}%`} />
            </div>
          </div>
          <p className="text-xs text-gray-500">Detected type: <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{mime}</span></p>
          {sections.map((s) => (
            <div key={s.label}>
              <OptLabel>{s.label}</OptLabel>
              <div className="flex gap-2 items-start">
                <textarea
                  readOnly
                  value={s.value}
                  rows={3}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[11px] font-mono text-gray-900 dark:text-white break-all"
                />
                <CopyBtn text={s.value} label="Copy" />
              </div>
            </div>
          ))}
        </div>
      )}
    </ImageCard>
  );
};
