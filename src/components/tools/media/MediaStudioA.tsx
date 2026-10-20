import React, { useEffect, useRef, useState } from 'react';
import { Camera, Scissors, X } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  MediaCard,
  FileDrop,
  BlobDownloadBtn,
  PrimaryBtn,
  ProgressBar,
  SampleVideoBtn,
  SampleAudioBtn,
  ENGINE_NOTE,
  OptLabel,
  OptInput,
  OptSelect,
  Stat,
  ErrorBox,
} from './MediaShell';
import {
  parseTimecode,
  formatTimecode,
  formatBytes,
  buildGifArgs,
  buildCompressArgs,
  buildTrimVideoArgs,
  buildConvertVideoArgs,
  buildExtractAudioArgs,
  buildAudioConvertArgs,
  buildAudioTrimArgs,
  audioMime,
  computePeaks,
  type AudioFormat,
  type VideoFormat,
} from '../../../lib/media/core';
import { runFfmpegJob, jobInputName, resetFfmpeg } from '../../../lib/media/ffmpeg';

// ---------------- shared helpers ----------------

const ghostBtnCls =
  'px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50';

function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

function useFileDuration(file: File | null, kind: 'video' | 'audio'): number | null {
  const [duration, setDuration] = useState<number | null>(null);
  useEffect(() => {
    if (!file) {
      setDuration(null);
      return;
    }
    const url = URL.createObjectURL(file);
    const el = document.createElement(kind);
    el.preload = 'metadata';
    const onLoad = () => setDuration(Number.isFinite(el.duration) ? el.duration : null);
    const onErr = () => setDuration(null);
    el.addEventListener('loadedmetadata', onLoad);
    el.addEventListener('error', onErr);
    el.src = url;
    return () => {
      el.removeEventListener('loadedmetadata', onLoad);
      el.removeEventListener('error', onErr);
      el.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [file, kind]);
  return duration;
}

/** Shared busy/progress/error/result state + runner for one-input FFmpeg tools. */
function useFfmpegJob() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);

  const run = async (
    file: File,
    argsFor: (inputName: string) => string[],
    outputName: string,
    mime: string,
  ): Promise<Blob | null> => {
    setBusy(true);
    setProgress(0);
    setError(null);
    setResult(null);
    try {
      const inputName = jobInputName(file, 'input');
      const [blob] = await runFfmpegJob({
        inputs: [{ name: inputName, source: file }],
        args: argsFor(inputName),
        outputs: [{ name: outputName, mime }],
        onProgress: setProgress,
      });
      setResult(blob);
      return blob;
    } catch (e) {
      resetFfmpeg();
      setError(e instanceof Error ? e.message : 'Processing failed — please try again.');
      return null;
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return { busy, progress, error, result, run, clear, setError };
}

function formatTcPrecise(s: number): string {
  const base = formatTimecode(s);
  const frac = s - Math.floor(s);
  return frac > 0.001 ? `${base}.${Math.round(frac * 10)}` : base;
}

/** Timecode text field that commits on blur/Enter and follows external (slider) changes. */
const TimecodeInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
  const [text, setText] = useState(formatTcPrecise(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(formatTcPrecise(value));
  }, [value, editing]);
  const commit = () => {
    setEditing(false);
    try {
      onChange(parseTimecode(text));
    } catch {
      setText(formatTcPrecise(value));
    }
  };
  return (
    <OptInput
      value={text}
      disabled={disabled}
      placeholder="0:00"
      onFocus={() => setEditing(true)}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
    />
  );
};

const SourceStats: React.FC<{ file: File; extra?: React.ReactNode }> = ({ file, extra }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    <Stat label="File size" value={formatBytes(file.size)} />
    {extra}
  </div>
);

// ---------------- 1. Video to GIF ----------------

export const VideoToGif: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [clipLen, setClipLen] = useState(5);
  const [width, setWidth] = useState(480);
  const [fps, setFps] = useState(15);
  const job = useFfmpegJob();
  const duration = useFileDuration(file, 'video');
  const fileUrl = useObjectUrl(file);
  const gifUrl = useObjectUrl(job.result);
  const videoRef = useRef<HTMLVideoElement>(null);

  const effectiveDur =
    duration !== null ? Math.max(0, Math.min(clipLen, duration - start)) : clipLen;

  const handleFile = (f: File) => {
    setFile(f);
    setStart(0);
    job.clear();
  };

  const convert = async () => {
    if (!file) return;
    if (duration !== null && start >= duration) {
      job.setError('The start time is beyond the end of the video.');
      return;
    }
    if (effectiveDur <= 0) {
      job.setError('Nothing left to capture — lower the start time.');
      return;
    }
    await job.run(
      file,
      (input) => buildGifArgs(input, 'output.gif', { start, duration: effectiveDur, width, fps }),
      'output.gif',
      'image/gif',
    );
  };

  return (
    <MediaCard tool={tool} note={`GIFs balloon fast — keep clips short and narrow for a sensible file size. ${ENGINE_NOTE}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && fileUrl && (
          <>
            <video ref={videoRef} src={fileUrl} controls className="w-full max-h-64 rounded-xl bg-black" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <OptLabel>Start</OptLabel>
                <TimecodeInput value={start} onChange={(v) => setStart(Math.max(0, v))} disabled={job.busy} />
              </div>
              <div>
                <OptLabel>Clip length (seconds)</OptLabel>
                <OptInput
                  type="number"
                  min={1}
                  max={30}
                  step={1}
                  value={clipLen}
                  disabled={job.busy}
                  onChange={(e) => setClipLen(Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)))}
                />
              </div>
              <div>
                <OptLabel>Width</OptLabel>
                <OptSelect value={width} disabled={job.busy} onChange={(e) => setWidth(parseInt(e.target.value, 10))}>
                  <option value={320}>320 px</option>
                  <option value={480}>480 px</option>
                  <option value={640}>640 px</option>
                  <option value={720}>720 px</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>Frame rate</OptLabel>
                <OptSelect value={fps} disabled={job.busy} onChange={(e) => setFps(parseInt(e.target.value, 10))}>
                  <option value={10}>10 fps</option>
                  <option value={15}>15 fps</option>
                  <option value={20}>20 fps</option>
                  <option value={25}>25 fps</option>
                </OptSelect>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryBtn disabled={job.busy} onClick={convert}>
                {job.busy ? 'Creating GIF…' : 'Create GIF'}
              </PrimaryBtn>
              <button
                type="button"
                className={ghostBtnCls}
                disabled={job.busy}
                onClick={() => videoRef.current && setStart(Math.floor(videoRef.current.currentTime * 10) / 10)}
              >
                Use playhead as start
              </button>
              {duration !== null && (
                <span className="text-xs text-gray-500">
                  Capturing {formatTcPrecise(start)} → {formatTcPrecise(start + effectiveDur)} of {formatTcPrecise(duration)}
                </span>
              )}
            </div>
            <ProgressBar ratio={job.progress} label="Building GIF…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && gifUrl && file && (
          <div className="space-y-3">
            <img src={gifUrl} alt="Generated GIF" className="max-w-full rounded-xl border border-gray-200 dark:border-gray-700" />
            <SourceStats
              file={file}
              extra={
                <>
                  <Stat label="GIF size" value={formatBytes(job.result.size)} />
                  <Stat label="Clip length" value={`${effectiveDur.toFixed(1)}s`} />
                </>
              }
            />
            <BlobDownloadBtn blob={job.result} filename="video-clip.gif" label="Download GIF" />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 2. Video Compressor ----------------

export const VideoCompressor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState(28);
  const [maxHeight, setMaxHeight] = useState('');
  const [preset, setPreset] = useState('fast');
  const job = useFfmpegJob();
  const resultUrl = useObjectUrl(job.result);

  const handleFile = (f: File) => {
    setFile(f);
    job.clear();
  };

  const compress = async () => {
    if (!file) return;
    await job.run(
      file,
      (input) =>
        buildCompressArgs(input, 'output.mp4', {
          crf,
          maxHeight: maxHeight ? parseInt(maxHeight, 10) : null,
          preset,
        }),
      'output.mp4',
      'video/mp4',
    );
  };

  const savedPct =
    job.result && file ? Math.round((1 - job.result.size / file.size) * 100) : 0;

  return (
    <MediaCard tool={tool} note={ENGINE_NOTE}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <OptLabel>Quality</OptLabel>
                <OptSelect value={crf} disabled={job.busy} onChange={(e) => setCrf(parseInt(e.target.value, 10))}>
                  <option value={23}>High quality (CRF 23)</option>
                  <option value={28}>Balanced (CRF 28)</option>
                  <option value={34}>Small file (CRF 34)</option>
                  <option value={40}>Tiny file (CRF 40)</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>Max height</OptLabel>
                <OptSelect value={maxHeight} disabled={job.busy} onChange={(e) => setMaxHeight(e.target.value)}>
                  <option value="">Original</option>
                  <option value="1080">1080p</option>
                  <option value="720">720p</option>
                  <option value="480">480p</option>
                  <option value="360">360p</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>Speed</OptLabel>
                <OptSelect value={preset} disabled={job.busy} onChange={(e) => setPreset(e.target.value)}>
                  <option value="fast">Faster (fast)</option>
                  <option value="medium">Better quality (medium)</option>
                </OptSelect>
              </div>
            </div>
            <PrimaryBtn disabled={job.busy} onClick={compress}>
              {job.busy ? 'Compressing…' : 'Compress video'}
            </PrimaryBtn>
            <ProgressBar ratio={job.progress} label="Compressing…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <video src={resultUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Original" value={formatBytes(file.size)} />
              <Stat label="Compressed" value={formatBytes(job.result.size)} />
              <Stat label="Size change" value={savedPct >= 0 ? `-${savedPct}%` : `+${-savedPct}%`} />
            </div>
            <BlobDownloadBtn blob={job.result} filename="compressed-video.mp4" label="Download MP4" />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 3. Video Trimmer ----------------

export const VideoTrimmer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState<number | null>(null);
  const [mode, setMode] = useState<'reencode' | 'copy'>('reencode');
  const job = useFfmpegJob();
  const duration = useFileDuration(file, 'video');
  const fileUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(job.result);
  const videoRef = useRef<HTMLVideoElement>(null);

  const endVal = end ?? duration ?? 0;
  const selDuration = Math.max(0, endVal - start);

  const handleFile = (f: File) => {
    setFile(f);
    setStart(0);
    setEnd(null);
    job.clear();
  };

  const trim = async () => {
    if (!file) return;
    if (selDuration < 0.1) {
      job.setError('Select at least a fraction of a second to keep.');
      return;
    }
    await job.run(
      file,
      (input) => buildTrimVideoArgs(input, 'output.mp4', { start, duration: selDuration, mode }),
      'output.mp4',
      'video/mp4',
    );
  };

  const playhead = () => (videoRef.current ? videoRef.current.currentTime : 0);

  return (
    <MediaCard
      tool={tool}
      note={`Fast mode copies the stream without re-encoding, but cuts can only land on keyframes, so the edges may shift by a second or two. Precise mode re-encodes for frame-accurate cuts. ${ENGINE_NOTE}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && fileUrl && (
          <>
            <video ref={videoRef} src={fileUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <OptLabel>Start</OptLabel>
                <TimecodeInput
                  value={start}
                  disabled={job.busy}
                  onChange={(v) => setStart(Math.max(0, Math.min(v, endVal - 0.1)))}
                />
              </div>
              <div>
                <OptLabel>End</OptLabel>
                <TimecodeInput
                  value={endVal}
                  disabled={job.busy}
                  onChange={(v) => setEnd(Math.min(duration ?? v, Math.max(v, start + 0.1)))}
                />
              </div>
              <div>
                <OptLabel>Mode</OptLabel>
                <OptSelect value={mode} disabled={job.busy} onChange={(e) => setMode(e.target.value as 'reencode' | 'copy')}>
                  <option value="reencode">Precise (re-encode)</option>
                  <option value="copy">Fast (stream copy)</option>
                </OptSelect>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 pb-1">
                Keeping <span className="font-bold text-gray-900 dark:text-white">{selDuration.toFixed(1)}s</span>
                {duration !== null && <> of {formatTcPrecise(duration)}</>}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 w-10">Start</span>
                <input
                  type="range"
                  min={0}
                  max={duration ?? 0}
                  step={0.1}
                  value={start}
                  disabled={job.busy || duration === null}
                  onChange={(e) => setStart(Math.min(parseFloat(e.target.value), endVal - 0.1))}
                  className="flex-1 accent-orange-600 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-gray-500 w-12 text-right">{formatTcPrecise(start)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 w-10">End</span>
                <input
                  type="range"
                  min={0}
                  max={duration ?? 0}
                  step={0.1}
                  value={endVal}
                  disabled={job.busy || duration === null}
                  onChange={(e) => setEnd(Math.max(parseFloat(e.target.value), start + 0.1))}
                  className="flex-1 accent-orange-600 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-gray-500 w-12 text-right">{formatTcPrecise(endVal)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryBtn disabled={job.busy} onClick={trim}>
                <Scissors className="w-4 h-4 inline -mt-0.5 mr-1.5" />
                {job.busy ? 'Trimming…' : 'Trim video'}
              </PrimaryBtn>
              <button type="button" className={ghostBtnCls} disabled={job.busy} onClick={() => setStart(Math.max(0, Math.min(playhead(), endVal - 0.1)))}>
                Start = playhead
              </button>
              <button type="button" className={ghostBtnCls} disabled={job.busy} onClick={() => setEnd(Math.max(playhead(), start + 0.1))}>
                End = playhead
              </button>
              {mode === 'copy' && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  Fast mode cuts at keyframes — edges can shift slightly.
                </span>
              )}
            </div>
            <ProgressBar ratio={job.progress} label="Trimming…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <video src={resultUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
            <SourceStats file={file} extra={<Stat label="Trimmed size" value={formatBytes(job.result.size)} />} />
            <BlobDownloadBtn blob={job.result} filename="trimmed-video.mp4" label="Download MP4" />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 4. Video Converter ----------------

const VIDEO_FORMATS: { id: VideoFormat; label: string; mime: string }[] = [
  { id: 'mp4', label: 'MP4', mime: 'video/mp4' },
  { id: 'webm', label: 'WebM', mime: 'video/webm' },
  { id: 'mov', label: 'MOV', mime: 'video/quicktime' },
];

export const VideoConverter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const job = useFfmpegJob();
  const resultUrl = useObjectUrl(job.result);

  const handleFile = (f: File) => {
    setFile(f);
    job.clear();
  };

  const convert = async () => {
    if (!file) return;
    const target = VIDEO_FORMATS.find((f) => f.id === format)!;
    await job.run(
      file,
      (input) => buildConvertVideoArgs(input, `output.${format}`, format),
      `output.${format}`,
      target.mime,
    );
  };

  const srcExt = file ? file.name.split('.').pop()?.toLowerCase() : null;

  return (
    <MediaCard tool={tool} note={ENGINE_NOTE}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && (
          <>
            <p className="text-xs text-gray-500">
              Source: <span className="font-semibold text-gray-700 dark:text-gray-300">.{srcExt || '?'}</span>
              {file.type && <> ({file.type})</>} · {formatBytes(file.size)}
            </p>
            <div>
              <OptLabel>Convert to</OptLabel>
              <div className="flex flex-wrap gap-2">
                {VIDEO_FORMATS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    disabled={job.busy}
                    onClick={() => setFormat(f.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      format === f.id
                        ? 'bg-orange-600 text-white border-orange-600 cursor-pointer'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-orange-400 cursor-pointer'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryBtn disabled={job.busy} onClick={convert}>
              {job.busy ? 'Converting…' : `Convert to ${format.toUpperCase()}`}
            </PrimaryBtn>
            <ProgressBar ratio={job.progress} label="Converting…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <video src={resultUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
            <SourceStats file={file} extra={<Stat label="Converted size" value={formatBytes(job.result.size)} />} />
            <BlobDownloadBtn blob={job.result} filename={`converted-video.${format}`} label={`Download ${format.toUpperCase()}`} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 5. Video to MP3 (audio extractor) ----------------

export const VideoToMp3: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [bitrate, setBitrate] = useState(192);
  const job = useFfmpegJob();
  const resultUrl = useObjectUrl(job.result);

  const handleFile = (f: File) => {
    setFile(f);
    job.clear();
  };

  const extract = async () => {
    if (!file) return;
    await job.run(
      file,
      (input) => buildExtractAudioArgs(input, `output.${format}`, format, bitrate),
      `output.${format}`,
      audioMime(format),
    );
  };

  return (
    <MediaCard tool={tool} note={ENGINE_NOTE}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <OptLabel>Audio format</OptLabel>
                <OptSelect value={format} disabled={job.busy} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV (lossless)</option>
                  <option value="m4a">M4A (AAC)</option>
                  <option value="ogg">OGG (Vorbis)</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>Bitrate</OptLabel>
                <OptSelect
                  value={bitrate}
                  disabled={job.busy || format === 'wav' || format === 'ogg'}
                  onChange={(e) => setBitrate(parseInt(e.target.value, 10))}
                >
                  <option value={128}>128 kbps</option>
                  <option value={192}>192 kbps</option>
                  <option value={320}>320 kbps</option>
                </OptSelect>
                {(format === 'wav' || format === 'ogg') && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {format === 'wav' ? 'WAV is uncompressed — no bitrate setting.' : 'OGG uses a fixed quality level instead.'}
                  </p>
                )}
              </div>
            </div>
            <PrimaryBtn disabled={job.busy} onClick={extract}>
              {job.busy ? 'Extracting…' : 'Extract audio'}
            </PrimaryBtn>
            <ProgressBar ratio={job.progress} label="Extracting audio…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <audio src={resultUrl} controls className="w-full" />
            <SourceStats file={file} extra={<Stat label="Audio size" value={formatBytes(job.result.size)} />} />
            <BlobDownloadBtn blob={job.result} filename={`audio.${format}`} label={`Download ${format.toUpperCase()}`} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 6. Video Frame Capture (native, no FFmpeg) ----------------

interface Capture {
  id: number;
  blob: Blob;
  time: number;
}

const CaptureItem: React.FC<{ capture: Capture; ext: string; onRemove: () => void }> = ({ capture, ext, onRemove }) => {
  const url = useObjectUrl(capture.blob);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
      {url && <img src={url} alt={`Frame at ${formatTimecode(capture.time)}`} className="w-full h-28 object-cover" />}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{formatTimecode(capture.time)}</span>
        <span className="flex items-center gap-1">
          <BlobDownloadBtn
            blob={capture.blob}
            filename={`frame-${formatTimecode(capture.time).replace(/:/g, '-')}.${ext}`}
            label="Save"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove frame"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      </div>
    </div>
  );
};

export const VideoFrameCapture: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [jumpText, setJumpText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileUrl = useObjectUrl(file);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idRef = useRef(0);

  const handleFile = (f: File) => {
    setFile(f);
    setCaptures([]);
    setError(null);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < 2 || !video.videoWidth) {
      setError('The video is not ready yet — give it a moment to load, then try again.');
      return;
    }
    setError(null);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const time = video.currentTime;
    canvas.toBlob(
      (blob) => {
        if (blob) setCaptures((prev) => [...prev, { id: ++idRef.current, blob, time }]);
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      0.92,
    );
  };

  const jumpAndCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    let t: number;
    try {
      t = parseTimecode(jumpText);
    } catch {
      setError('Enter a valid time — seconds, mm:ss or hh:mm:ss.');
      return;
    }
    setError(null);
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      captureFrame();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Number.isFinite(video.duration) ? Math.min(t, video.duration) : t;
  };

  return (
    <MediaCard
      tool={tool}
      note="Frames are grabbed natively by the browser at the video's full resolution — no processing engine is loaded for this tool. Seek to the exact moment (pause and use the player's controls for precision), then capture as many frames as you like."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="video/*" label="Drop a video here or click to browse" fileName={file?.name} />
          </div>
          <SampleVideoBtn onFile={handleFile} />
        </div>

        {file && fileUrl && (
          <>
            <video ref={videoRef} src={fileUrl} controls className="w-full max-h-80 rounded-xl bg-black" />
            <div className="flex flex-wrap items-end gap-3">
              <PrimaryBtn onClick={captureFrame}>
                <Camera className="w-4 h-4 inline -mt-0.5 mr-1.5" />
                Capture frame
              </PrimaryBtn>
              <div className="w-36">
                <OptLabel>Jump to time</OptLabel>
                <OptInput value={jumpText} placeholder="1:23" onChange={(e) => setJumpText(e.target.value)} />
              </div>
              <button type="button" className={ghostBtnCls} onClick={jumpAndCapture}>
                Jump &amp; capture
              </button>
              <div className="w-32">
                <OptLabel>Format</OptLabel>
                <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpg')}>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </OptSelect>
              </div>
            </div>
          </>
        )}

        {error && <ErrorBox message={error} />}

        {captures.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {captures.length} frame{captures.length === 1 ? '' : 's'} captured
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {captures.map((c) => (
                <CaptureItem key={c.id} capture={c} ext={format} onRemove={() => setCaptures((prev) => prev.filter((x) => x.id !== c.id))} />
              ))}
            </div>
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 7. Audio Converter ----------------

export const AudioConverter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [bitrate, setBitrate] = useState(192);
  const job = useFfmpegJob();
  const fileUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(job.result);

  const handleFile = (f: File) => {
    setFile(f);
    job.clear();
  };

  const convert = async () => {
    if (!file) return;
    await job.run(
      file,
      (input) => buildAudioConvertArgs(input, `output.${format}`, format, bitrate),
      `output.${format}`,
      audioMime(format),
    );
  };

  const srcExt = file ? file.name.split('.').pop()?.toLowerCase() : null;

  return (
    <MediaCard tool={tool} note={ENGINE_NOTE}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="audio/*" label="Drop an audio file here or click to browse" fileName={file?.name} />
          </div>
          <SampleAudioBtn onFile={handleFile} />
        </div>

        {file && fileUrl && (
          <>
            <audio src={fileUrl} controls className="w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <OptLabel>Convert to</OptLabel>
                <OptSelect value={format} disabled={job.busy} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV (lossless)</option>
                  <option value="m4a">M4A (AAC)</option>
                  <option value="ogg">OGG (Vorbis)</option>
                </OptSelect>
              </div>
              <div>
                <OptLabel>Bitrate</OptLabel>
                <OptSelect
                  value={bitrate}
                  disabled={job.busy || format === 'wav' || format === 'ogg'}
                  onChange={(e) => setBitrate(parseInt(e.target.value, 10))}
                >
                  <option value={128}>128 kbps</option>
                  <option value={192}>192 kbps</option>
                  <option value={320}>320 kbps</option>
                </OptSelect>
              </div>
            </div>
            {srcExt === format && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                The source is already .{format} — converting will re-encode it, which is useful for changing the bitrate but will not improve quality.
              </p>
            )}
            <PrimaryBtn disabled={job.busy} onClick={convert}>
              {job.busy ? 'Converting…' : `Convert to ${format.toUpperCase()}`}
            </PrimaryBtn>
            <ProgressBar ratio={job.progress} label="Converting…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <audio src={resultUrl} controls className="w-full" />
            <SourceStats file={file} extra={<Stat label="Converted size" value={formatBytes(job.result.size)} />} />
            <BlobDownloadBtn blob={job.result} filename={`converted-audio.${format}`} label={`Download ${format.toUpperCase()}`} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 8. Audio Trimmer ----------------

export const AudioTrimmer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const job = useFfmpegJob();
  const fileUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(job.result);
  const waveRef = useRef<HTMLCanvasElement>(null);

  const endVal = end ?? duration ?? 0;
  const selDuration = Math.max(0, endVal - start);

  // Decode the file for duration + waveform peaks
  useEffect(() => {
    if (!file) {
      setPeaks(null);
      setDuration(null);
      return;
    }
    let cancelled = false;
    setDecoding(true);
    (async () => {
      try {
        const AC: typeof AudioContext | undefined =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) throw new Error('no audiocontext');
        const buf = await file.arrayBuffer();
        const ctx = new AC();
        const audio = await ctx.decodeAudioData(buf);
        await ctx.close();
        if (cancelled) return;
        setDuration(audio.duration);
        setPeaks(computePeaks(audio.getChannelData(0), 160));
      } catch {
        if (!cancelled) {
          setPeaks(null);
          setDuration(null);
          job.setError('Could not decode this audio file to draw its waveform. You can still try trimming blind, but most likely the format is not supported by this browser.');
        }
      } finally {
        if (!cancelled) setDecoding(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Draw the waveform with the selection highlighted
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas || !peaks || duration === null || duration <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const selStartX = (start / duration) * w;
    const selEndX = (endVal / duration) * w;
    ctx.fillStyle = 'rgba(234, 88, 12, 0.08)';
    ctx.fillRect(selStartX, 0, Math.max(0, selEndX - selStartX), h);
    const buckets = peaks.length;
    const barW = w / buckets;
    for (let i = 0; i < buckets; i++) {
      const x = i * barW;
      const inSel = x + barW / 2 >= selStartX && x + barW / 2 <= selEndX;
      ctx.fillStyle = inSel ? '#ea580c' : 'rgba(100, 116, 139, 0.45)';
      const bh = Math.max(1, peaks[i] * (h - 10));
      ctx.fillRect(x + 0.5, (h - bh) / 2, Math.max(1, barW - 1), bh);
    }
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(selStartX - 1, 0, 2, h);
    ctx.fillRect(selEndX - 1, 0, 2, h);
  }, [peaks, start, endVal, duration]);

  const handleFile = (f: File) => {
    setFile(f);
    setStart(0);
    setEnd(null);
    setPeaks(null);
    setDuration(null);
    job.clear();
  };

  const trim = async () => {
    if (!file) return;
    if (selDuration < 0.1) {
      job.setError('Select at least a fraction of a second to keep.');
      return;
    }
    await job.run(
      file,
      (input) =>
        buildAudioTrimArgs(input, `output.${format}`, {
          start,
          duration: selDuration,
          fadeIn,
          fadeOut,
          format,
        }),
      `output.${format}`,
      audioMime(format),
    );
  };

  return (
    <MediaCard
      tool={tool}
      note={`The waveform is decoded in your browser from the file itself, so very long recordings can take a few seconds to draw. ${ENGINE_NOTE}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop onFile={handleFile} accept="audio/*" label="Drop an audio file here or click to browse" fileName={file?.name} />
          </div>
          <SampleAudioBtn onFile={handleFile} />
        </div>

        {file && fileUrl && (
          <>
            <audio src={fileUrl} controls className="w-full" />
            {decoding ? (
              <p className="text-xs text-gray-500">Decoding waveform…</p>
            ) : peaks ? (
              <canvas ref={waveRef} width={720} height={100} className="w-full h-[100px] rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            ) : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div>
                <OptLabel>Start</OptLabel>
                <TimecodeInput value={start} disabled={job.busy} onChange={(v) => setStart(Math.max(0, Math.min(v, endVal - 0.1)))} />
              </div>
              <div>
                <OptLabel>End</OptLabel>
                <TimecodeInput
                  value={endVal}
                  disabled={job.busy}
                  onChange={(v) => setEnd(Math.min(duration ?? v, Math.max(v, start + 0.1)))}
                />
              </div>
              <div>
                <OptLabel>Fade in (seconds)</OptLabel>
                <OptInput
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={fadeIn}
                  disabled={job.busy}
                  onChange={(e) => setFadeIn(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
                />
              </div>
              <div>
                <OptLabel>Fade out (seconds)</OptLabel>
                <OptInput
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={fadeOut}
                  disabled={job.busy}
                  onChange={(e) => setFadeOut(Math.max(0, Math.min(10, parseFloat(e.target.value) || 0)))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 w-10">Start</span>
                <input
                  type="range"
                  min={0}
                  max={duration ?? 0}
                  step={0.1}
                  value={start}
                  disabled={job.busy || duration === null}
                  onChange={(e) => setStart(Math.min(parseFloat(e.target.value), endVal - 0.1))}
                  className="flex-1 accent-orange-600 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-gray-500 w-12 text-right">{formatTcPrecise(start)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 w-10">End</span>
                <input
                  type="range"
                  min={0}
                  max={duration ?? 0}
                  step={0.1}
                  value={endVal}
                  disabled={job.busy || duration === null}
                  onChange={(e) => setEnd(Math.max(parseFloat(e.target.value), start + 0.1))}
                  className="flex-1 accent-orange-600 cursor-pointer"
                />
                <span className="text-[11px] font-mono text-gray-500 w-12 text-right">{formatTcPrecise(endVal)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-44">
                <OptLabel>Output format</OptLabel>
                <OptSelect value={format} disabled={job.busy} onChange={(e) => setFormat(e.target.value as AudioFormat)}>
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV (lossless)</option>
                  <option value="m4a">M4A (AAC)</option>
                  <option value="ogg">OGG (Vorbis)</option>
                </OptSelect>
              </div>
              <PrimaryBtn disabled={job.busy} onClick={trim}>
                <Scissors className="w-4 h-4 inline -mt-0.5 mr-1.5" />
                {job.busy ? 'Trimming…' : 'Trim audio'}
              </PrimaryBtn>
              <span className="text-xs text-gray-500">
                Keeping <span className="font-bold text-gray-900 dark:text-white">{selDuration.toFixed(1)}s</span>
                {duration !== null && <> of {formatTcPrecise(duration)}</>}
              </span>
            </div>
            <ProgressBar ratio={job.progress} label="Trimming…" />
          </>
        )}

        {job.error && <ErrorBox message={job.error} />}

        {job.result && resultUrl && file && (
          <div className="space-y-3">
            <audio src={resultUrl} controls className="w-full" />
            <SourceStats file={file} extra={<Stat label="Trimmed size" value={formatBytes(job.result.size)} />} />
            <BlobDownloadBtn blob={job.result} filename={`trimmed-audio.${format}`} label={`Download ${format.toUpperCase()}`} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};
