// ============================================================
// SUPER CROWN TOOLS — FFmpeg.wasm client (browser-only)
// Lazily loads the single-thread FFmpeg core (~30 MB of assets
// served from this site's own static files) on first use and
// runs one job at a time. Files exist only in the wasm virtual
// FS during a job and are deleted afterwards.
// ============================================================
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

let instance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;
let busy = false;
let progressHandler: ((ratio: number) => void) | null = null;
const logTail: string[] = [];

export function isFfmpegBusy(): boolean {
  return busy;
}

export async function loadFfmpeg(): Promise<FFmpeg> {
  if (instance) return instance;
  if (!loadPromise) {
    loadPromise = (async () => {
      const ff = new FFmpeg();
      ff.on('log', ({ message }) => {
        logTail.push(message);
        if (logTail.length > 8) logTail.shift();
      });
      ff.on('progress', ({ progress }) => {
        if (progressHandler) progressHandler(Math.max(0, Math.min(1, progress)));
      });
      await ff.load({ coreURL, wasmURL });
      instance = ff;
      return ff;
    })();
    loadPromise.catch(() => { loadPromise = null; });
  }
  return loadPromise;
}

export interface FfmpegJobInput {
  name: string;
  source: File | Blob | Uint8Array;
}

export interface FfmpegJob {
  inputs: FfmpegJobInput[];
  args: string[];
  outputs: { name: string; mime: string }[];
  onProgress?: (ratio: number) => void;
}

/** Run one FFmpeg job end-to-end; returns the output blobs in order. */
export async function runFfmpegJob(job: FfmpegJob): Promise<Blob[]> {
  if (busy) throw new Error('Another media job is still running — wait for it to finish.');
  busy = true;
  progressHandler = job.onProgress ?? null;
  const ff = await loadFfmpeg();
  const written: string[] = [];
  try {
    for (const input of job.inputs) {
      await ff.writeFile(input.name, input.source instanceof Uint8Array ? input.source : await fetchFile(input.source));
      written.push(input.name);
    }
    logTail.length = 0;
    const code = await ff.exec(job.args);
    if (code !== 0) {
      throw new Error(`FFmpeg could not process this file (exit ${code}). ${logTail.slice(-3).join(' ')}`.trim());
    }
    const blobs: Blob[] = [];
    for (const out of job.outputs) {
      const data = await ff.readFile(out.name);
      const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      blobs.push(new Blob([bytes as BlobPart], { type: out.mime }));
    }
    return blobs;
  } finally {
    progressHandler = null;
    busy = false;
    for (const name of written) {
      try { await ff.deleteFile(name); } catch { /* already gone */ }
    }
    for (const out of job.outputs) {
      try { await ff.deleteFile(out.name); } catch { /* already gone */ }
    }
  }
}

/** Terminate the worker and forget the instance (recovery after a hard failure). */
export function resetFfmpeg(): void {
  try { instance?.terminate(); } catch { /* noop */ }
  instance = null;
  loadPromise = null;
  busy = false;
  progressHandler = null;
}

/** Safe wasm-FS filename for an uploaded file, keeping its extension. */
export function jobInputName(file: File, fallbackBase: string): string {
  const dot = file.name.lastIndexOf('.');
  const ext = dot > -1 ? file.name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : '';
  return `${fallbackBase}${ext || '.bin'}`;
}
