// ============================================================
// SUPER CROWN TOOLS — Media engine (pure layer)
// FFmpeg argument builders, WAV PCM encoder, waveform peaks and
// timecode helpers behind the Video & Audio suite. Everything
// here is pure and unit-testable; the actual FFmpeg.wasm client
// lives in ./ffmpeg.ts and components.
// ============================================================

// ---------------- timecode ----------------

/** Parse "ss", "mm:ss" or "hh:mm:ss" (decimals allowed) into seconds. */
export function parseTimecode(input: string): number {
  const s = input.trim();
  if (!s) throw new Error('Enter a time');
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const parts = s.split(':');
  if (parts.length < 2 || parts.length > 3) throw new Error('Use seconds, mm:ss or hh:mm:ss');
  let total = 0;
  for (const p of parts) {
    if (!/^\d+(\.\d+)?$/.test(p)) throw new Error('Use seconds, mm:ss or hh:mm:ss');
    total = total * 60 + parseFloat(p);
  }
  return total;
}

export function formatTimecode(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

// ---------------- shared audio encoding ----------------

export type AudioFormat = 'mp3' | 'wav' | 'm4a' | 'ogg';

export function audioCodecArgs(format: AudioFormat, bitrateK = 192): string[] {
  switch (format) {
    case 'mp3': return ['-c:a', 'libmp3lame', '-b:a', `${bitrateK}k`];
    case 'wav': return ['-c:a', 'pcm_s16le'];
    case 'm4a': return ['-c:a', 'aac', '-b:a', `${bitrateK}k`];
    case 'ogg': return ['-c:a', 'libvorbis', '-q:a', '5'];
  }
}

export function audioMime(format: AudioFormat): string {
  return { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg' }[format];
}

// ---------------- FFmpeg argument builders ----------------

const n = (v: number) => String(Math.round(v * 1000) / 1000);

export interface GifOptions { start: number; duration: number; width: number; fps: number }

export function buildGifArgs(input: string, output: string, o: GifOptions): string[] {
  const filter = `fps=${o.fps},scale=${o.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer`;
  return ['-ss', n(o.start), '-t', n(o.duration), '-i', input, '-vf', filter, '-loop', '0', output];
}

export interface CompressOptions { crf: number; maxHeight: number | null; preset: string }

export function buildCompressArgs(input: string, output: string, o: CompressOptions): string[] {
  const args = ['-i', input, '-c:v', 'libx264', '-crf', String(o.crf), '-preset', o.preset];
  if (o.maxHeight) args.push('-vf', `scale=-2:min(ih\\,${o.maxHeight})`);
  args.push('-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output);
  return args;
}

export interface TrimVideoOptions { start: number; duration: number; mode: 'copy' | 'reencode' }

export function buildTrimVideoArgs(input: string, output: string, o: TrimVideoOptions): string[] {
  const args = ['-ss', n(o.start), '-i', input, '-t', n(o.duration)];
  if (o.mode === 'copy') args.push('-c', 'copy');
  else args.push('-c:v', 'libx264', '-crf', '20', '-preset', 'fast', '-c:a', 'aac', '-b:a', '160k');
  args.push('-avoid_negative_ts', 'make_zero', output);
  return args;
}

export type VideoFormat = 'mp4' | 'webm' | 'mov';

export function buildConvertVideoArgs(input: string, output: string, format: VideoFormat): string[] {
  if (format === 'webm') {
    return ['-i', input, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32', '-c:a', 'libopus', '-b:a', '128k', output];
  }
  const args = ['-i', input, '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', '-c:a', 'aac', '-b:a', '160k'];
  if (format === 'mp4') args.push('-movflags', '+faststart');
  args.push(output);
  return args;
}

export function buildExtractAudioArgs(input: string, output: string, format: AudioFormat, bitrateK = 192): string[] {
  return ['-i', input, '-vn', ...audioCodecArgs(format, bitrateK), output];
}

export function buildAudioConvertArgs(input: string, output: string, format: AudioFormat, bitrateK = 192): string[] {
  return ['-i', input, ...audioCodecArgs(format, bitrateK), output];
}

export interface AudioTrimOptions { start: number; duration: number; fadeIn: number; fadeOut: number; format: AudioFormat }

export function buildAudioTrimArgs(input: string, output: string, o: AudioTrimOptions): string[] {
  const filters: string[] = [];
  if (o.fadeIn > 0) filters.push(`afade=t=in:st=0:d=${n(o.fadeIn)}`);
  if (o.fadeOut > 0) filters.push(`afade=t=out:st=${n(Math.max(0, o.duration - o.fadeOut))}:d=${n(o.fadeOut)}`);
  const args = ['-ss', n(o.start), '-i', input, '-t', n(o.duration)];
  if (filters.length) args.push('-af', filters.join(','));
  args.push(...audioCodecArgs(o.format), output);
  return args;
}

export function buildAudioJoinArgs(inputs: string[], output: string, format: AudioFormat): string[] {
  const args: string[] = [];
  inputs.forEach((name) => args.push('-i', name));
  args.push('-filter_complex', `concat=n=${inputs.length}:v=0:a=1[out]`, '-map', '[out]', ...audioCodecArgs(format), output);
  return args;
}

export interface VolumeOptions { mode: 'gain' | 'loudnorm'; gainDb: number }

export function buildVolumeArgs(input: string, output: string, o: VolumeOptions, format: AudioFormat): string[] {
  const filter = o.mode === 'loudnorm' ? 'loudnorm=I=-16:TP=-1.5:LRA=11' : `volume=${n(o.gainDb)}dB`;
  return ['-i', input, '-af', filter, ...audioCodecArgs(format), output];
}

/** Split a speed factor into atempo stages (each must be within 0.5–2.0). */
export function atempoChain(rate: number): number[] {
  if (rate <= 0) throw new Error('Rate must be positive');
  const stages: number[] = [];
  let r = rate;
  while (r > 2) { stages.push(2); r /= 2; }
  while (r < 0.5) { stages.push(0.5); r /= 0.5; }
  stages.push(Math.round(r * 1000) / 1000);
  return stages;
}

export function buildSpeedArgs(input: string, output: string, rate: number, format: AudioFormat): string[] {
  const filter = atempoChain(rate).map((f) => `atempo=${f}`).join(',');
  return ['-i', input, '-af', filter, ...audioCodecArgs(format), output];
}

// ---------------- waveform peaks ----------------

/** Absolute-max peak per bucket — for waveform rendering. */
export function computePeaks(channelData: ArrayLike<number>, buckets: number): Float32Array {
  const peaks = new Float32Array(buckets);
  const perBucket = Math.max(1, Math.floor(channelData.length / buckets));
  for (let b = 0; b < buckets; b++) {
    let max = 0;
    const start = b * perBucket;
    const end = Math.min(channelData.length, start + perBucket);
    for (let i = start; i < end; i++) {
      const v = Math.abs(channelData[i]);
      if (v > max) max = v;
    }
    peaks[b] = max;
  }
  return peaks;
}

// ---------------- WAV encoder (PCM16) ----------------

/** Encode 1+ channels of Float32 samples (-1..1) as a 16-bit PCM WAV file. */
export function encodeWavPcm16(channels: Float32Array[], sampleRate: number): Uint8Array {
  const numChannels = channels.length;
  const frames = channels[0]?.length ?? 0;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = frames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let f = 0; f < frames; f++) {
    for (let c = 0; c < numChannels; c++) {
      const clamped = Math.max(-1, Math.min(1, channels[c][f]));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }
  return new Uint8Array(buffer);
}
