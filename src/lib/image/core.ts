// ============================================================
// Free Omni Tools   Image engine (round 2)
// Pure helpers behind the Image studio suite: median-cut color
// palette extraction, QR payload builders (WiFi / vCard / …),
// ICO file assembly, ASCII-art conversion, SVG size parsing.
// Canvas/DOM helpers live here too; anything testable in Node
// takes plain { data, width, height } pixel buffers.
// ============================================================

export interface PixelData {
  data: Uint8ClampedArray | number[];
  width: number;
  height: number;
}

// ---------------- loading / canvas ----------------

export function fileToImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load that image file.')); };
    img.src = url;
  });
}

export function imageToCanvas(img: HTMLImageElement | HTMLCanvasElement, width?: number, height?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width ?? (img as HTMLImageElement).naturalWidth ?? img.width;
  canvas.height = height ?? (img as HTMLImageElement).naturalHeight ?? img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlobP(canvas: HTMLCanvasElement, type = 'image/png', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality);
  });
}

export function getPixelData(canvas: HTMLCanvasElement): PixelData {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { data: img.data, width: img.width, height: img.height };
}

// ---------------- color palette (median cut) ----------------

export interface PaletteColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  /** Share of sampled pixels, 0..1 */
  share: number;
}

function rgbHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

interface PixelBox {
  pixels: [number, number, number][];
}

function channelRanges(pixels: [number, number, number][]): [number, number, number] {
  const min: [number, number, number] = [255, 255, 255];
  const max: [number, number, number] = [0, 0, 0];
  for (const p of pixels) {
    for (let c = 0; c < 3; c++) {
      if (p[c] < min[c]) min[c] = p[c];
      if (p[c] > max[c]) max[c] = p[c];
    }
  }
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}

/**
 * Median-cut palette extraction. Ignores near-transparent pixels.
 * Samples at most ~12k pixels for speed; deterministic.
 */
export function extractPalette(pixels: PixelData, count = 6): PaletteColor[] {
  const totalPixels = pixels.width * pixels.height;
  const stride = Math.max(1, Math.floor(totalPixels / 12000));
  const samples: [number, number, number][] = [];
  for (let i = 0; i < totalPixels; i += stride) {
    const a = pixels.data[i * 4 + 3];
    if (a < 125) continue;
    samples.push([pixels.data[i * 4], pixels.data[i * 4 + 1], pixels.data[i * 4 + 2]]);
  }
  if (!samples.length) return [];

  const boxes: PixelBox[] = [{ pixels: samples }];
  while (boxes.length < count) {
    // Split the box with the largest channel range (and >1 pixel)
    let splitIdx = -1;
    let splitRange = -1;
    boxes.forEach((box, i) => {
      if (box.pixels.length < 2) return;
      const range = Math.max(...channelRanges(box.pixels));
      if (range > splitRange) { splitRange = range; splitIdx = i; }
    });
    if (splitIdx === -1) break;
    const box = boxes[splitIdx];
    const ranges = channelRanges(box.pixels);
    const channel = ranges.indexOf(Math.max(...ranges));
    const sorted = [...box.pixels].sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(sorted.length / 2);
    boxes.splice(splitIdx, 1, { pixels: sorted.slice(0, mid) }, { pixels: sorted.slice(mid) });
  }

  const total = samples.length;
  const colors = boxes
    .filter((b) => b.pixels.length)
    .map((box) => {
      const sum = box.pixels.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
      const r = sum[0] / box.pixels.length;
      const g = sum[1] / box.pixels.length;
      const b = sum[2] / box.pixels.length;
      return {
        hex: rgbHex(r, g, b),
        rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
        share: box.pixels.length / total,
      };
    });
  // Median-cut splits can land on identical averages (flat images, logos)  
  // merge those so a single dominant color is not shown several times.
  const merged = new Map<string, PaletteColor>();
  for (const c of colors) {
    const existing = merged.get(c.hex);
    if (existing) existing.share += c.share;
    else merged.set(c.hex, { ...c });
  }
  return [...merged.values()].sort((a, b) => b.share - a.share);
}

// ---------------- QR payload builders ----------------

function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:""])/g, '\\$1');
}

export interface WifiPayloadInput {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export function wifiPayload({ ssid, password, encryption, hidden }: WifiPayloadInput): string {
  let out = `WIFI:T:${encryption};S:${escapeWifiField(ssid)};`;
  if (encryption !== 'nopass') out += `P:${escapeWifiField(password)};`;
  if (hidden) out += 'H:true;';
  return `${out};`;
}

export interface VCardInput {
  firstName: string;
  lastName: string;
  org?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
}

export function vCardPayload(v: VCardInput): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `N:${v.lastName};${v.firstName};;;`, `FN:${`${v.firstName} ${v.lastName}`.trim()}`];
  if (v.org) lines.push(`ORG:${v.org}`);
  if (v.title) lines.push(`TITLE:${v.title}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone}`);
  if (v.email) lines.push(`EMAIL:${v.email}`);
  if (v.url) lines.push(`URL:${v.url}`);
  if (v.street || v.city || v.zip || v.country) lines.push(`ADR:;;${v.street || ''};${v.city || ''};;${v.zip || ''};${v.country || ''}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function smsPayload(phone: string, message: string): string {
  return `SMSTO:${phone}:${message}`;
}

export function mailtoPayload(email: string, subject: string, body: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const qs = params.toString();
  return `mailto:${email}${qs ? `?${qs}` : ''}`;
}

// ---------------- ICO assembly ----------------

/**
 * Build a Windows .ico containing PNG-compressed entries
 * (valid for all modern browsers / Windows Vista+).
 */
export function buildIco(entries: { size: number; png: Uint8Array }[]): Uint8Array {
  const headerSize = 6;
  const entrySize = 16;
  const dataStart = headerSize + entrySize * entries.length;
  const totalSize = dataStart + entries.reduce((acc, e) => acc + e.png.length, 0);
  const out = new Uint8Array(totalSize);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, 0, true); // reserved
  dv.setUint16(2, 1, true); // type: icon
  dv.setUint16(4, entries.length, true);
  let offset = dataStart;
  entries.forEach((e, i) => {
    const base = headerSize + i * entrySize;
    out[base] = e.size >= 256 ? 0 : e.size; // width (0 = 256)
    out[base + 1] = e.size >= 256 ? 0 : e.size; // height
    out[base + 2] = 0; // palette colors
    out[base + 3] = 0; // reserved
    dv.setUint16(base + 4, 1, true); // color planes
    dv.setUint16(base + 6, 32, true); // bits per pixel
    dv.setUint32(base + 8, e.png.length, true);
    dv.setUint32(base + 12, offset, true);
    out.set(e.png, offset);
    offset += e.png.length;
  });
  return out;
}

// ---------------- ASCII art ----------------

const ASCII_RAMPS: Record<string, string> = {
  standard: ' .:-=+*#%@',
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: ' ░▒▓█',
};

export function imageDataToAscii(pixels: PixelData, columns = 100, rampName: keyof typeof ASCII_RAMPS = 'standard', invert = false): string {
  const ramp = ASCII_RAMPS[rampName] || ASCII_RAMPS.standard;
  const chars = invert ? [...ramp].reverse().join('') : ramp;
  // Character cells are ~twice as tall as wide
  const rows = Math.max(1, Math.round((pixels.height / pixels.width) * columns * 0.5));
  const cellW = pixels.width / columns;
  const cellH = pixels.height / rows;
  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    let line = '';
    for (let col = 0; col < columns; col++) {
      const sx = Math.min(pixels.width - 1, Math.floor((col + 0.5) * cellW));
      const sy = Math.min(pixels.height - 1, Math.floor((row + 0.5) * cellH));
      const idx = (sy * pixels.width + sx) * 4;
      const r = pixels.data[idx], g = pixels.data[idx + 1], b = pixels.data[idx + 2];
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const ci = Math.min(chars.length - 1, Math.floor(lum * chars.length));
      line += chars[ci];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

// ---------------- SVG helpers ----------------

export function parseSvgSize(svgText: string): { width: number; height: number } | null {
  const tag = svgText.match(/<svg[^>]*>/i);
  if (!tag) return null;
  const w = tag[0].match(/width=["']([\d.]+)/i);
  const h = tag[0].match(/height=["']([\d.]+)/i);
  if (w && h) return { width: parseFloat(w[1]), height: parseFloat(h[1]) };
  const vb = tag[0].match(/viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i);
  if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]) };
  return null;
}

// ---------------- misc layout math ----------------

/** Fit (w,h) inside a target aspect ratio box, centered crop rect in source pixels. */
export function centeredCropRect(srcW: number, srcH: number, targetAspect: number): { sx: number; sy: number; sw: number; sh: number } {
  const srcAspect = srcW / srcH;
  if (srcAspect > targetAspect) {
    const sw = srcH * targetAspect;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / targetAspect;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

export const PASSPORT_SIZES: { id: string; label: string; widthMm: number; heightMm: number; note: string }[] = [
  { id: 'us', label: 'US / Pakistan (2 × 2 in)', widthMm: 51, heightMm: 51, note: 'US passport & visa, Pakistan CNIC/passport photos' },
  { id: 'uk', label: 'UK / EU (35 × 45 mm)', widthMm: 35, heightMm: 45, note: 'UK passport, EU ID and Schengen visa' },
  { id: 'in', label: 'India (2 × 2 in)', widthMm: 51, heightMm: 51, note: 'Indian passport & visa' },
  { id: 'cn', label: 'China (33 × 48 mm)', widthMm: 33, heightMm: 48, note: 'Chinese passport & visa' },
  { id: 'ca', label: 'Canada (50 × 70 mm)', widthMm: 50, heightMm: 70, note: 'Canadian passport' },
  { id: 'au', label: 'Australia (35 × 45 mm)', widthMm: 35, heightMm: 45, note: 'Australian passport' },
];
