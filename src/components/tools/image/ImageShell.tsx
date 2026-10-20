import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Download } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { downloadBlob } from '../../../lib/pdf/core';

export { OptLabel, OptInput, OptSelect, OptCheck, CopyBtn, Stat } from '../dev/DevShell';
export { ErrorBox } from '../dev/DevShell';

/** Card chrome shared by the Image studio tools. */
export const ImageCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[28px] p-5 sm:p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <ImageIcon className="w-5 h-5 text-rose-600" />
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
        : 'bg-rose-600 hover:bg-rose-700 text-white shadow cursor-pointer'
    }`}
  >
    {children}
  </button>
);

/** Drag & drop / click-to-browse single-file picker with a preview slot below. */
export const FileDrop: React.FC<{
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  fileName?: string | null;
}> = ({ onFile, accept = 'image/*', label = 'Drop an image here or click to browse', fileName }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={`border-2 border-dashed rounded-[28px] px-4 py-8 text-center cursor-pointer transition-colors ${
          drag ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30' : 'border-gray-300 dark:border-gray-600 hover:border-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        <Upload className="w-8 h-8 mx-auto text-rose-500 mb-2" />
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-[11px] text-gray-500 mt-1">Your file never leaves this device — processing happens in your browser.</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = '';
          }}
        />
      </div>
      {fileName && <p className="mt-2 text-xs text-gray-500 truncate">Selected: <span className="font-semibold text-gray-700 dark:text-gray-300">{fileName}</span></p>}
    </div>
  );
};

/** "Try a sample photo" helper — fetches a random photo from picsum.photos. */
export const SampleBtn: React.FC<{ onFile: (file: File) => void; label?: string }> = ({ onFile, label = 'Try a sample photo' }) => {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch('https://picsum.photos/900/650');
          const blob = await res.blob();
          onFile(new File([blob], 'sample-photo.jpg', { type: blob.type || 'image/jpeg' }));
        } catch { /* offline — user can still upload */ }
        setBusy(false);
      }}
      className="px-3.5 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50"
    >
      {busy ? 'Loading…' : label}
    </button>
  );
};

export const BlobDownloadBtn: React.FC<{ blob: Blob | null; filename: string; label?: string }> = ({ blob, filename, label = 'Download' }) => (
  <button
    type="button"
    disabled={!blob}
    onClick={() => blob && downloadBlob(blob, filename)}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border ${
      blob
        ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 cursor-pointer'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
    }`}
  >
    <Download className="w-3.5 h-3.5" />
    {label}
  </button>
);

/** Checkerboard-backed preview for transparent images. */
export const TransparencyBg: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    style={{
      backgroundImage: 'conic-gradient(#e5e7eb 0 25%, #ffffff 0 50%, #e5e7eb 0 75%, #ffffff 0)',
      backgroundSize: '16px 16px',
    }}
  >
    {children}
  </div>
);
