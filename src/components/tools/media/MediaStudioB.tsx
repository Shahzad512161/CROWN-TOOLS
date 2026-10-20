import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Mic,
  Monitor,
  Pause,
  Play,
  Square,
  Trash2,
  Video,
  Volume2,
  X,
} from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  audioMime,
  buildAudioJoinArgs,
  buildSpeedArgs,
  buildVolumeArgs,
  formatBytes,
  formatTimecode,
  type AudioFormat,
} from '../../../lib/media/core';
import { jobInputName, resetFfmpeg, runFfmpegJob } from '../../../lib/media/ffmpeg';
import {
  BlobDownloadBtn,
  CopyBtn,
  DownloadBtn,
  ErrorBox,
  FileDrop,
  MediaCard,
  OptCheck,
  OptLabel,
  OptSelect,
  PrimaryBtn,
  ProgressBar,
  SampleAudioBtn,
  Stat,
} from './MediaShell';
import { useLang, useStrings, COMMON } from '../../../lib/LangContext';
import { MEDIA_STRINGS } from '../../../lib/strings/media';

// ---------------- shared helpers ----------------

/** Seconds counter that runs while `running` is true and resets when it restarts. */
function useElapsed(running: boolean): number {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!running) return;
    setSec(0);
    const t0 = Date.now();
    const id = setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => clearInterval(id);
  }, [running]);
  return sec;
}

function pickRecorderMime(candidates: string[]): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch { /* keep looking */ }
  }
  return '';
}

function makeRecorder(stream: MediaStream, mime: string): MediaRecorder {
  return mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
}

const VIDEO_MIME_CANDIDATES = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
const AUDIO_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];

function recordingExt(mime: string, kind: 'video' | 'audio'): string {
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('ogg')) return kind === 'video' ? 'ogv' : 'ogg';
  return 'webm';
}

const iconBtnCls =
  'p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

const ghostBtnCls =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const AUDIO_FORMAT_OPTIONS: { value: AudioFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV (lossless)' },
  { value: 'm4a', label: 'M4A (AAC)' },
  { value: 'ogg', label: 'OGG (Vorbis)' },
];

// ---------------- 1. Audio Joiner ----------------

export const AudioJoiner: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const addFiles = (incoming: File[]) => {
    const audio = incoming.filter(
      (f) => f.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|oga|flac|aac|opus|webm|aif|aiff)$/i.test(f.name),
    );
    if (audio.length) setFiles((prev) => [...prev, ...audio].slice(0, 10));
  };

  const move = (idx: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const run = async () => {
    if (files.length < 2 || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    const names = files.map((f, i) => jobInputName(f, `input${i}`));
    const outName = `output.${format}`;
    try {
      const [blob] = await runFfmpegJob({
        inputs: files.map((f, i) => ({ name: names[i], source: f })),
        args: buildAudioJoinArgs(names, outName, format),
        outputs: [{ name: outName, mime: audioMime(format) }],
        onProgress: (r) => setProgress(r),
      });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      resetFfmpeg();
      setError(e instanceof Error ? e.message : s('joinErrorFallback'));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  const totalIn = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <MediaCard tool={tool} note={`${s('joinerNote')} ${s('engineNote')}`}>
      <div className="space-y-4">
        <div
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (!busy) addFiles(Array.from(e.dataTransfer.files || []));
          }}
          className={`border-2 border-dashed rounded-2xl px-4 py-8 text-center cursor-pointer transition-colors ${
            drag
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{s('dropAudioFiles')}</p>
          <p className="text-[11px] text-gray-500 mt-1">{s('joinerDropHint')}</p>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(Array.from(e.target.files || []));
              e.target.value = '';
            }}
          />
        </div>

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-800"
              >
                <span className="text-xs font-extrabold text-gray-400 w-5 text-center">{i + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{f.name}</span>
                  <span className="block text-[11px] text-gray-500">{formatBytes(f.size)}</span>
                </span>
                <button type="button" className={iconBtnCls} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={s('moveUp')}>
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" className={iconBtnCls} disabled={busy || i === files.length - 1} onClick={() => move(i, 1)} aria-label={s('moveDown')}>
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className={iconBtnCls}
                  disabled={busy}
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={s('removeTrack')}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <OptLabel>{s('outputFormat')}</OptLabel>
            <OptSelect value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)} disabled={busy}>
              {AUDIO_FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.value === 'wav' ? s('wavLossless') : o.label}</option>
              ))}
            </OptSelect>
          </div>
          <PrimaryBtn onClick={run} disabled={busy || files.length < 2}>
            {busy ? s('joining') : s('joinAudio')}
          </PrimaryBtn>
          {files.length === 1 && <span className="text-[11px] font-semibold text-gray-500 pb-2.5">{s('addAnotherTrack')}</span>}
        </div>

        <ProgressBar ratio={progress} label={s('joiningAudio')} />
        {error && <ErrorBox message={error} />}

        {result && (
          <div className="space-y-3">
            <audio controls src={result.url} className="w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Stat label={s('tracksJoined')} value={files.length} />
              <Stat label={s('inputTotal')} value={formatBytes(totalIn)} />
              <Stat label={s('outputSize')} value={formatBytes(result.blob.size)} />
            </div>
            <BlobDownloadBtn blob={result.blob} filename={`joined-audio.${format}`} label={s('downloadJoinedAudio').replace('{format}', format)} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 2. Audio Volume Booster ----------------

export const AudioVolumeBooster: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const c = useStrings(COMMON);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'gain' | 'loudnorm'>('gain');
  const [gainDb, setGainDb] = useState(6);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const onFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    const inputName = jobInputName(file, 'input');
    const outName = `output.${format}`;
    try {
      const [blob] = await runFfmpegJob({
        inputs: [{ name: inputName, source: file }],
        args: buildVolumeArgs(inputName, outName, { mode, gainDb }, format),
        outputs: [{ name: outName, mime: audioMime(format) }],
        onProgress: (r) => setProgress(r),
      });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      resetFfmpeg();
      setError(e instanceof Error ? e.message : s('volumeErrorFallback'));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <MediaCard tool={tool} note={s('engineNote')}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop accept="audio/*" label={s('dropAudio')} fileName={file?.name ?? null} onFile={onFile} />
          </div>
          <SampleAudioBtn onFile={onFile} />
        </div>

        {previewUrl && <audio controls src={previewUrl} className="w-full" />}

        <div>
          <OptLabel>{s('modeLabel')}</OptLabel>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="volume-mode" checked={mode === 'gain'} onChange={() => setMode('gain')} className="accent-orange-500 w-4 h-4" disabled={busy} />
              {s('gainDbLabel')}
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="volume-mode" checked={mode === 'loudnorm'} onChange={() => setMode('loudnorm')} className="accent-orange-500 w-4 h-4" disabled={busy} />
              {s('normalizeLoudnorm')}
            </label>
          </div>
        </div>

        {mode === 'gain' ? (
          <div>
            <OptLabel>{s('gainValue').replace('{value}', gainDb > 0 ? `+${gainDb}` : String(gainDb))}</OptLabel>
            <input
              type="range"
              min={-20}
              max={30}
              step={1}
              value={gainDb}
              onChange={(e) => setGainDb(parseInt(e.target.value, 10))}
              disabled={busy}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[11px] font-semibold text-gray-500">
              <span>{s('quieterEnd')}</span>
              <span>{s('louderEnd')}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {s('loudnormExplainer')}
          </p>
        )}

        {mode === 'gain' && gainDb > 12 && (
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
            {s('clipWarning')}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <OptLabel>{s('outputFormat')}</OptLabel>
            <OptSelect value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)} disabled={busy}>
              {AUDIO_FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.value === 'wav' ? s('wavLossless') : o.label}</option>
              ))}
            </OptSelect>
          </div>
          <PrimaryBtn onClick={run} disabled={busy || !file}>
            <span className="inline-flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              {busy ? c('processing') : s('applyVolumeChange')}
            </span>
          </PrimaryBtn>
        </div>

        <ProgressBar ratio={progress} label={s('adjustingVolume')} />
        {error && <ErrorBox message={error} />}

        {result && (
          <div className="space-y-3">
            <audio controls src={result.url} className="w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Stat label={s('inputSize')} value={file ? formatBytes(file.size) : '—'} />
              <Stat label={s('outputSize')} value={formatBytes(result.blob.size)} />
            </div>
            <BlobDownloadBtn blob={result.blob} filename={`volume-adjusted.${format}`} label={s('downloadAudioFormat').replace('{format}', format)} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 3. Audio Speed Changer ----------------

const SPEED_CHIPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

export const AudioSpeedChanger: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const c = useStrings(COMMON);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [rate, setRate] = useState(1.25);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const onFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setDuration(null);
    setResult(null);
    setError(null);
  };

  const run = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    const inputName = jobInputName(file, 'input');
    const outName = `output.${format}`;
    try {
      const [blob] = await runFfmpegJob({
        inputs: [{ name: inputName, source: file }],
        args: buildSpeedArgs(inputName, outName, rate, format),
        outputs: [{ name: outName, mime: audioMime(format) }],
        onProgress: (r) => setProgress(r),
      });
      setResult({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      resetFfmpeg();
      setError(e instanceof Error ? e.message : s('speedErrorFallback'));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <MediaCard tool={tool} note={`${s('speedNote')} ${s('engineNote')}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-[240px]">
            <FileDrop accept="audio/*" label={s('dropAudio')} fileName={file?.name ?? null} onFile={onFile} />
          </div>
          <SampleAudioBtn onFile={onFile} />
        </div>

        {previewUrl && (
          <audio
            controls
            src={previewUrl}
            className="w-full"
            onLoadedMetadata={(e) => {
              const d = e.currentTarget.duration;
              setDuration(Number.isFinite(d) ? d : null);
            }}
          />
        )}

        <div>
          <OptLabel>{s('speedLabel')}</OptLabel>
          <div className="flex flex-wrap gap-2">
            {SPEED_CHIPS.map((r) => (
              <button
                key={r}
                type="button"
                disabled={busy}
                onClick={() => setRate(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  rate === r
                    ? 'bg-orange-600 text-white border-orange-600 cursor-pointer'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                } disabled:opacity-50`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        <div>
          <OptLabel>{s('fineTuneSpeed').replace('{value}', rate.toFixed(2))}</OptLabel>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            disabled={busy}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-[11px] font-semibold text-gray-500">
            <span>{s('muchSlowerEnd')}</span>
            <span>{s('muchFasterEnd')}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label={s('originalLength')} value={duration !== null ? formatTimecode(duration) : '—'} />
          <Stat label={s('newLengthEst')} value={duration !== null ? formatTimecode(duration / rate) : '—'} />
          <Stat label={s('speedLabel')} value={`${rate.toFixed(2)}×`} />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <OptLabel>{s('outputFormat')}</OptLabel>
            <OptSelect value={format} onChange={(e) => setFormat(e.target.value as AudioFormat)} disabled={busy}>
              {AUDIO_FORMAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.value === 'wav' ? s('wavLossless') : o.label}</option>
              ))}
            </OptSelect>
          </div>
          <PrimaryBtn onClick={run} disabled={busy || !file}>
            {busy ? c('processing') : s('changeSpeed')}
          </PrimaryBtn>
        </div>

        <ProgressBar ratio={progress} label={s('changingSpeed')} />
        {error && <ErrorBox message={error} />}

        {result && (
          <div className="space-y-3">
            <audio controls src={result.url} className="w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Stat label={s('inputSize')} value={file ? formatBytes(file.size) : '—'} />
              <Stat label={s('outputSize')} value={formatBytes(result.blob.size)} />
            </div>
            <BlobDownloadBtn blob={result.blob} filename={`speed-${rate}x.${format}`} label={s('downloadAudioFormat').replace('{format}', format)} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 4. Screen Recorder ----------------

export const ScreenRecorder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const [includeMic, setIncludeMic] = useState(false);
  const [includeSystem, setIncludeSystem] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; ext: string; duration: number } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsed = useElapsed(recording);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { /* noop */ }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = async () => {
    setError(null);
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: includeSystem });
      const tracks: MediaStreamTrack[] = [...display.getVideoTracks(), ...display.getAudioTracks()];
      if (includeMic) {
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
          tracks.push(...mic.getAudioTracks());
        } catch {
          display.getTracks().forEach((t) => t.stop());
          setError(s('micDeniedScreen'));
          return;
        }
      }
      const stream = new MediaStream(tracks);
      streamRef.current = stream;
      const mime = pickRecorderMime(VIDEO_MIME_CANDIDATES);
      const recorder = makeRecorder(stream, mime);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        setResult({ blob, url: URL.createObjectURL(blob), ext: recordingExt(type, 'video'), duration: elapsedRef.current });
        setRecording(false);
        stopTracks();
      };
      const videoTrack = display.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          const rec = recorderRef.current;
          if (rec && rec.state !== 'inactive') rec.stop();
        });
      }
      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
    } catch (e) {
      stopTracks();
      if (e instanceof DOMException && e.name === 'NotAllowedError') {
        setError(s('screenShareCancelled'));
      } else {
        setError(e instanceof Error ? e.message : s('screenStartFailed'));
      }
    }
  };

  const stop = () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  };

  return (
    <MediaCard tool={tool} note={s('screenRecorderNote')}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <OptCheck label={s('includeMicrophone')} checked={includeMic} onChange={setIncludeMic} />
          <OptCheck label={s('includeSystemAudio')} checked={includeSystem} onChange={setIncludeSystem} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <PrimaryBtn onClick={start}>
              <span className="inline-flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                {s('startRecording')}
              </span>
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={stop}>
              <span className="inline-flex items-center gap-2">
                <Square className="w-4 h-4" />
                {s('stopRecording')}
              </span>
            </PrimaryBtn>
          )}
          {recording && (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              {s('recordingElapsed').replace('{time}', formatTimecode(elapsed))}
            </span>
          )}
        </div>

        {error && <ErrorBox message={error} />}

        {result && (
          <div className="space-y-3">
            <video controls src={result.url} className="w-full rounded-xl border border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-2">
              <Stat label={s('durationLabel')} value={formatTimecode(result.duration)} />
              <Stat label={s('fileSize')} value={formatBytes(result.blob.size)} />
            </div>
            <BlobDownloadBtn blob={result.blob} filename={`screen-recording.${result.ext}`} label={s('downloadRecordingFormat').replace('{format}', result.ext)} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 5. Webcam Recorder ----------------

export const WebcamRecorder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const c = useStrings(COMMON);
  const [cameraOn, setCameraOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [resolution, setResolution] = useState<'720' | '480'>('720');
  const [mirror, setMirror] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string; ext: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsed = useElapsed(recording);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const releaseCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  useEffect(() => () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { /* noop */ }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: resolution === '720' ? 1280 : 640 },
          height: { ideal: resolution === '720' ? 720 : 480 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? s('camMicDenied')
          : s('cameraOpenFailed'),
      );
    }
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream) return;
    setError(null);
    const mime = pickRecorderMime(VIDEO_MIME_CANDIDATES);
    const recorder = makeRecorder(stream, mime);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || mime || 'video/webm';
      const blob = new Blob(chunksRef.current, { type });
      chunksRef.current = [];
      setResult({ blob, url: URL.createObjectURL(blob), ext: recordingExt(type, 'video') });
      setRecording(false);
    };
    recorderRef.current = recorder;
    recorder.start(250);
    setRecording(true);
  };

  const stopRecording = () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  };

  const stopCamera = () => {
    stopRecording();
    releaseCamera();
  };

  return (
    <MediaCard tool={tool} note={s('webcamNote')}>
      <div className="space-y-4">
        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900">
          <video ref={videoRef} autoPlay muted playsInline className={`w-full aspect-video object-cover ${mirror ? '-scale-x-100' : ''}`} />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-300">
              {s('cameraOffHint')}
            </div>
          )}
          {recording && (
            <div className="absolute top-3 start-3 inline-flex items-center gap-2 text-xs font-bold text-white bg-black/60 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatTimecode(elapsed)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <OptLabel>{s('resolutionLabel')}</OptLabel>
            <OptSelect value={resolution} onChange={(e) => setResolution(e.target.value as '720' | '480')} disabled={cameraOn}>
              <option value="720">HD · 1280 × 720</option>
              <option value="480">SD · 640 × 480</option>
            </OptSelect>
          </div>
          <div className="pb-1">
            <OptCheck label={s('mirrorPreview')} checked={mirror} onChange={setMirror} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!cameraOn ? (
            <PrimaryBtn onClick={startCamera}>
              <span className="inline-flex items-center gap-2">
                <Camera className="w-4 h-4" />
                {s('startCamera')}
              </span>
            </PrimaryBtn>
          ) : (
            <>
              {!recording ? (
                <PrimaryBtn onClick={startRecording}>
                  <span className="inline-flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    {c('record')}
                  </span>
                </PrimaryBtn>
              ) : (
                <PrimaryBtn onClick={stopRecording}>
                  <span className="inline-flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    {s('stopElapsed').replace('{time}', formatTimecode(elapsed))}
                  </span>
                </PrimaryBtn>
              )}
              <button type="button" className={`${ghostBtnCls} self-center`} onClick={stopCamera}>
                {s('stopCamera')}
              </button>
            </>
          )}
        </div>

        {error && <ErrorBox message={error} />}

        {result && (
          <div className="space-y-3">
            <video controls src={result.url} className="w-full rounded-xl border border-gray-200 dark:border-gray-700" />
            <div className="grid grid-cols-2 gap-2">
              <Stat label={s('fileSize')} value={formatBytes(result.blob.size)} />
              <Stat label={c('format')} value={result.ext.toUpperCase()} />
            </div>
            <BlobDownloadBtn blob={result.blob} filename={`webcam-recording.${result.ext}`} label={s('downloadRecordingFormat').replace('{format}', result.ext)} />
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 6. Voice Recorder ----------------

interface VoiceTake {
  id: number;
  blob: Blob;
  url: string;
  duration: number;
  createdAt: Date;
  ext: string;
}

export const VoiceRecorder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(MEDIA_STRINGS);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [takes, setTakes] = useState<VoiceTake[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const levelRef = useRef<HTMLDivElement>(null);
  const takeIdRef = useRef(0);
  const elapsed = useElapsed(recording);

  const stopMeter = () => {
    cancelAnimationFrame(rafRef.current);
    if (levelRef.current) levelRef.current.style.width = '0%';
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => undefined);
      ctxRef.current = null;
    }
  };

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    if (ctxRef.current) ctxRef.current.close().catch(() => undefined);
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') {
      try { rec.stop(); } catch { /* noop */ }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      try {
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        void ctx.resume();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          if (levelRef.current) levelRef.current.style.width = `${Math.min(100, Math.round(rms * 320))}%`;
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch { /* level meter is optional */ }
      const mime = pickRecorderMime(AUDIO_MIME_CANDIDATES);
      const recorder = makeRecorder(stream, mime);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        takeIdRef.current += 1;
        const take: VoiceTake = {
          id: takeIdRef.current,
          blob,
          url: URL.createObjectURL(blob),
          duration: Math.max(0, (Date.now() - startRef.current) / 1000),
          createdAt: new Date(),
          ext: recordingExt(type, 'audio'),
        };
        setTakes((prev) => [take, ...prev]);
        setRecording(false);
        stopMeter();
        releaseStream();
      };
      recorderRef.current = recorder;
      startRef.current = Date.now();
      recorder.start(250);
      setRecording(true);
    } catch (e) {
      releaseStream();
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? s('micDeniedVoice')
          : s('micAccessFailed'),
      );
    }
  };

  const stop = () => {
    const rec = recorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
  };

  const deleteTake = (id: number) => {
    setTakes((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((t) => t.id !== id);
    });
  };

  return (
    <MediaCard tool={tool} note={s('voiceNote')}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <PrimaryBtn onClick={start}>
              <span className="inline-flex items-center gap-2">
                <Mic className="w-4 h-4" />
                {s('startRecording')}
              </span>
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={stop}>
              <span className="inline-flex items-center gap-2">
                <Square className="w-4 h-4" />
                {s('stopElapsed').replace('{time}', formatTimecode(elapsed))}
              </span>
            </PrimaryBtn>
          )}
          {recording && (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              {s('recordingWord')}
            </span>
          )}
        </div>

        <div>
          <OptLabel>{s('inputLevel')}</OptLabel>
          <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div ref={levelRef} className="h-full bg-orange-500 rounded-full transition-[width] duration-75" style={{ width: '0%' }} />
          </div>
        </div>

        {error && <ErrorBox message={error} />}

        {takes.length > 0 && (
          <div className="space-y-2">
            <OptLabel>{s('takesLabel').replace('{n}', String(takes.length))}</OptLabel>
            {takes.map((take) => (
              <div key={take.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                    {s('takeLine')
                      .replace('{id}', String(take.id))
                      .replace('{time}', take.createdAt.toLocaleTimeString(lang))
                      .replace('{duration}', formatTimecode(take.duration))}
                  </span>
                  <button type="button" className={iconBtnCls} onClick={() => deleteTake(take.id)} aria-label={s('deleteTake').replace('{id}', String(take.id))}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <audio controls src={take.url} className="w-full" />
                <BlobDownloadBtn blob={take.blob} filename={`voice-take-${take.id}.${take.ext}`} label={s('downloadTakeFormat').replace('{format}', take.ext)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MediaCard>
  );
};

// ---------------- 7. Text to Speech ----------------

export const TextToSpeech: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const c = useStrings(COMMON);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState('');
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) {
    return (
      <MediaCard tool={tool} note={s('ttsOsNote')}>
        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 leading-relaxed">
          {s('ttsUnsupported')}
        </div>
      </MediaCard>
    );
  }

  const speak = () => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <MediaCard tool={tool} note={s('ttsNote')}>
      <div className="space-y-4">
        <div>
          <OptLabel>{s('textToSpeak')}</OptLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={s('ttsPlaceholder')}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label={s('charactersLabel')} value={text.length} />
          <Stat label={s('wordsLabel')} value={text.trim() ? text.trim().split(/\s+/).length : 0} />
        </div>

        <div className="w-full sm:w-96">
          <OptLabel>{s('voiceLabel')}</OptLabel>
          <OptSelect value={voiceURI} onChange={(e) => setVoiceURI(e.target.value)}>
            <option value="">{s('defaultVoice')}</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} — {v.lang}
              </option>
            ))}
          </OptSelect>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>{s('rateValue').replace('{value}', rate.toFixed(2))}</OptLabel>
            <input type="range" min={0.5} max={2} step={0.05} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-orange-500" />
          </div>
          <div>
            <OptLabel>{s('pitchValue').replace('{value}', pitch.toFixed(2))}</OptLabel>
            <input type="range" min={0} max={2} step={0.05} value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-orange-500" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryBtn onClick={speak} disabled={!text.trim()}>
            <span className="inline-flex items-center gap-2">
              <Play className="w-4 h-4" />
              {s('speak')}
            </span>
          </PrimaryBtn>
          <button type="button" className={ghostBtnCls} onClick={() => window.speechSynthesis.pause()}>
            <Pause className="w-4 h-4" />
            {c('pause')}
          </button>
          <button type="button" className={ghostBtnCls} onClick={() => window.speechSynthesis.resume()}>
            <Play className="w-4 h-4" />
            {s('resumeLabel')}
          </button>
          <button type="button" className={ghostBtnCls} onClick={stop}>
            <Square className="w-4 h-4" />
            {c('stop')}
          </button>
          {speaking && (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <Volume2 className="w-4 h-4" />
              {s('speakingNow')}
            </span>
          )}
        </div>
      </div>
    </MediaCard>
  );
};

// ---------------- 8. Speech to Text ----------------

const STT_LANGUAGES: { value: string; labelKey: string }[] = [
  { value: 'en-US', labelKey: 'langEnUS' },
  { value: 'en-GB', labelKey: 'langEnGB' },
  { value: 'en-AU', labelKey: 'langEnAU' },
  { value: 'en-CA', labelKey: 'langEnCA' },
  { value: 'en-IN', labelKey: 'langEnIN' },
];

export const SpeechToText: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(MEDIA_STRINGS);
  const c = useStrings(COMMON);
  const [SR] = useState<any>(() =>
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
      : null,
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState('en-US');
  const [continuous, setContinuous] = useState(true);
  const recognitionRef = useRef<any>(null);
  const shouldRunRef = useRef(false);
  const finalRef = useRef('');

  useEffect(() => () => {
    shouldRunRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try { rec.abort(); } catch { /* noop */ }
    }
  }, []);

  if (!SR) {
    return (
      <MediaCard tool={tool} note={s('sttFeatureNote')}>
        <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 leading-relaxed">
          {s('sttUnsupportedPre')} <strong>Chrome</strong> {s('sttUnsupportedMid')} <strong>Edge</strong>
          {s('sttUnsupportedPost')}
        </div>
      </MediaCard>
    );
  }

  const startListening = () => {
    setError(null);
    try {
      const rec = new SR();
      rec.lang = lang;
      rec.continuous = continuous;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) finalRef.current += res[0].transcript;
          else interimText += res[0].transcript;
        }
        setTranscript(finalRef.current);
        setInterim(interimText);
      };
      rec.onerror = (event: any) => {
        const code = event?.error as string | undefined;
        if (code === 'not-allowed' || code === 'service-not-allowed') {
          shouldRunRef.current = false;
          setListening(false);
          setError(s('sttMicBlocked'));
        } else if (code === 'audio-capture') {
          shouldRunRef.current = false;
          setListening(false);
          setError(s('sttNoMic'));
        } else if (code === 'network') {
          shouldRunRef.current = false;
          setListening(false);
          setError(s('sttNetwork'));
        }
      };
      rec.onend = () => {
        if (shouldRunRef.current) {
          try {
            rec.start();
          } catch {
            shouldRunRef.current = false;
            setListening(false);
          }
        } else {
          setListening(false);
        }
      };
      recognitionRef.current = rec;
      shouldRunRef.current = true;
      rec.start();
      setListening(true);
    } catch (e) {
      shouldRunRef.current = false;
      setListening(false);
      setError(e instanceof Error ? e.message : s('sttStartFailed'));
    }
  };

  const stopListening = () => {
    shouldRunRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    setListening(false);
    setInterim('');
  };

  const clearAll = () => {
    finalRef.current = '';
    setTranscript('');
    setInterim('');
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <MediaCard tool={tool} note={s('sttNote')}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <OptLabel>{s('languageLabel')}</OptLabel>
            <OptSelect value={lang} onChange={(e) => setLang(e.target.value)} disabled={listening}>
              {STT_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{s(l.labelKey)}</option>
              ))}
            </OptSelect>
          </div>
          <div className="pb-1">
            <OptCheck label={s('continuousDictation')} checked={continuous} onChange={setContinuous} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!listening ? (
            <PrimaryBtn onClick={startListening}>
              <span className="inline-flex items-center gap-2">
                <Mic className="w-4 h-4" />
                {s('startDictation')}
              </span>
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={stopListening}>
              <span className="inline-flex items-center gap-2">
                <Square className="w-4 h-4" />
                {c('stop')}
              </span>
            </PrimaryBtn>
          )}
          {listening && (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              {s('listeningNow')}
            </span>
          )}
          <button type="button" className={ghostBtnCls} onClick={clearAll}>
            <X className="w-4 h-4" />
            {c('clear')}
          </button>
        </div>

        {error && <ErrorBox message={error} />}

        <div>
          <OptLabel>{s('transcriptLabel')}</OptLabel>
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              finalRef.current = e.target.value;
            }}
            rows={8}
            placeholder={s('sttPlaceholder')}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
          />
          {interim && <p className="mt-1.5 text-sm italic text-gray-400 dark:text-gray-500">{interim}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label={s('wordsLabel')} value={wordCount} />
          <Stat label={s('charactersLabel')} value={transcript.length} />
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyBtn text={transcript} label={s('copyTranscript')} />
          <DownloadBtn content={transcript} filename="transcript.txt" label={s('downloadTxt')} />
        </div>
      </div>
    </MediaCard>
  );
};
