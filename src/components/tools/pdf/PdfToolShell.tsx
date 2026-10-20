import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { formatBytes } from '../../../lib/pdf/core';
import { useLang, useStrings, COMMON } from '../../../lib/LangContext';
import { PDF_STRINGS } from '../../../lib/strings/pdf';

export type ShellStatus = 'idle' | 'working' | 'done' | 'error';

export interface ShellCtx {
  files: File[];
  setFiles: (f: File[]) => void;
  setStatus: (s: ShellStatus, msg?: string) => void;
  status: ShellStatus;
}

interface Props {
  tool: ToolItem;
  accept: string;
  multiple?: boolean;
  actionLabel?: string;
  minFiles?: number;
  hideDropzone?: boolean;
  dropzoneHint?: string;
  onProcess?: (files: File[]) => Promise<string | void>;
  onFilesChange?: (files: File[]) => void;
  children?: (ctx: ShellCtx) => React.ReactNode;
}

export const PdfToolShell: React.FC<Props> = ({
  tool,
  accept,
  multiple = false,
  actionLabel,
  minFiles = 1,
  hideDropzone = false,
  dropzoneHint,
  onProcess,
  onFilesChange,
  children,
}) => {
  const lang = useLang();
  void lang;
  const s = useStrings(PDF_STRINGS);
  const c = useStrings(COMMON);
  const [files, setFilesState] = useState<File[]>([]);
  const [status, setStatusState] = useState<ShellStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setFiles = (f: File[]) => {
    setFilesState(f);
    onFilesChange?.(f);
    setStatusState('idle');
    setMessage('');
  };

  const setStatus = (s: ShellStatus, msg?: string) => {
    setStatusState(s);
    if (msg !== undefined) setMessage(msg);
  };

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (!incoming.length) return;
    if (multiple) setFiles([...files, ...incoming]);
    else setFiles([incoming[0]]);
  };

  const runProcess = async () => {
    if (!onProcess || status === 'working') return;
    setStatus('working', s('shellProcessingNote'));
    try {
      const msg = await onProcess(files);
      setStatus('done', msg || s('shellDoneDefault'));
    } catch (err: any) {
      console.error(err);
      setStatus('error', err?.message || s('shellErrorDefault'));
    }
  };

  const busy = status === 'working';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[28px] p-5 sm:p-6 shadow-none">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-orange-500" />
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{tool.name}</h2>
        <span className="ms-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
          {s('shellInBrowserBadge')}
        </span>
      </div>

      {!hideDropzone && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-[28px] p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                : 'border-orange-300 dark:border-orange-800 hover:border-orange-500 bg-orange-50/40 dark:bg-orange-950/10'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <Upload className="w-9 h-9 text-orange-500 mx-auto mb-2" />
            <span className="text-sm font-bold text-gray-900 dark:text-white block">
              {files.length ? s('shellAddMore') : s('shellSelectFiles')}
            </span>
            <span className="text-[11px] text-gray-500 block mt-1">
              {dropzoneHint || s('shellAcceptedTemplate').replace('{accept}', accept)}
            </span>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                >
                  <FileText className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{f.name}</span>
                  <span className="text-gray-400 shrink-0">{formatBytes(f.size)}</span>
                  <button
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="ms-auto p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                    aria-label={s('shellRemoveFile').replace('{name}', f.name)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {children?.({ files, setFiles, setStatus, status })}

      {onProcess && (
        <button
          onClick={runProcess}
          disabled={files.length < minFiles || busy}
          className={`w-full mt-5 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            files.length >= minFiles && !busy
              ? 'bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{busy ? c('processing') : actionLabel || s('shellRunTool').replace('{name}', tool.name)}</span>
        </button>
      )}

      {status === 'done' && (
        <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {status === 'working' && message && (
        <p className="mt-3 text-[11px] text-gray-500 text-center">{message}</p>
      )}
    </div>
  );
};

// Small shared option controls ------------------------------------------------

export const OptLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{children}</label>
);

export const OptInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
  />
);

export const OptSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
  />
);

export const OptCheck: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label,
  checked,
  onChange,
}) => (
  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="accent-orange-500 w-4 h-4"
    />
    {label}
  </label>
);
