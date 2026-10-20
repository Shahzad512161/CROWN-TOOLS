import React, { useState } from 'react';
import { Clapperboard } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';

export { FileDrop, BlobDownloadBtn } from '../image/ImageShell';
export { OptLabel, OptInput, OptSelect, OptCheck, CopyBtn, Stat, ErrorBox, DownloadBtn } from '../dev/DevShell';

/** Card chrome shared by the Video & Audio tools. */
export const MediaCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[28px] p-5 sm:p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <Clapperboard className="w-5 h-5 text-orange-600" />
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{tool.name}</h2>
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
        100% in-browser · private
      </span>
    </div>
    {children}
    {note && <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">{note}</p>}
  </div>
);

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${
      props.disabled
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-orange-600 hover:bg-orange-700 text-white shadow cursor-pointer'
    }`}
  >
    {children}
  </button>
);

export const ProgressBar: React.FC<{ ratio: number | null; label?: string }> = ({ ratio, label }) => {
  if (ratio === null) return null;
  const pct = Math.round(ratio * 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1">
        <span>{label || 'Processing…'}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const ENGINE_NOTE =
  'Powered by FFmpeg running as WebAssembly in your browser: the engine (~30 MB) loads once from this site when you start the first job, then everything processes locally — your media is never uploaded. The engine is single-threaded, so long or 4K files take a while; keep clips modest for the best experience.';

const sampleBtnCls =
  'px-3.5 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50';

/** Fetch one of Google's public sample videos (CORS-enabled demo bucket). */
export const SampleVideoBtn: React.FC<{ onFile: (file: File) => void }> = ({ onFile }) => {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className={sampleBtnCls}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          try {
            const res = await fetch('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
            if (!res.ok) throw new Error('fetch failed');
            const blob = await res.blob();
            onFile(new File([blob], 'sample-video.mp4', { type: 'video/mp4' }));
          } catch { setFailed(true); }
          setBusy(false);
        }}
      >
        {busy ? 'Loading…' : 'Try a sample video'}
      </button>
      {failed && <span className="text-[11px] text-gray-500">Sample unavailable offline — upload a file instead.</span>}
    </span>
  );
};

/** Fetch a public sample MP3 (SoundHelix demo songs). */
export const SampleAudioBtn: React.FC<{ onFile: (file: File) => void }> = ({ onFile }) => {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className={sampleBtnCls}
        onClick={async () => {
          setBusy(true);
          setFailed(false);
          try {
            const res = await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
            if (!res.ok) throw new Error('fetch failed');
            const blob = await res.blob();
            onFile(new File([blob], 'sample-audio.mp3', { type: 'audio/mpeg' }));
          } catch { setFailed(true); }
          setBusy(false);
        }}
      >
        {busy ? 'Loading…' : 'Try a sample song'}
      </button>
      {failed && <span className="text-[11px] text-gray-500">Sample unavailable offline — upload a file instead.</span>}
    </span>
  );
};
