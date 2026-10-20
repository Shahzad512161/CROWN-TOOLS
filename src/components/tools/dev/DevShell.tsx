import React, { useState } from 'react';
import { Code2, Copy, Check, Download } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { downloadBlob } from '../../../lib/pdf/core';

export { OptLabel, OptInput, OptSelect, OptCheck } from '../pdf/PdfToolShell';
export { Stat, CheckList, ScoreBadge } from '../seo/SeoShell';
export type { CheckItem } from '../../../lib/seo/core';

/** Card chrome shared by all Developer tools (mirrors SeoCard styling). */
export const DevCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[28px] p-5 sm:p-6 shadow-none">
    <div className="flex items-center gap-2 mb-4">
      <Code2 className="w-5 h-5 text-violet-600" />
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{tool.name}</h2>
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
        100% in-browser · private
      </span>
    </div>
    {children}
    {note && <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">{note}</p>}
  </div>
);

export const DevTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white"
  />
);

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${
      props.disabled
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-violet-600 hover:bg-violet-700 text-white shadow cursor-pointer'
    }`}
  >
    {children}
  </button>
);

export const CopyBtn: React.FC<{ text: string; label?: string }> = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch { /* clipboard unavailable */ }
      }}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
};

export const DownloadBtn: React.FC<{ content: string; filename: string; mime?: string; label?: string }> = ({
  content,
  filename,
  mime = 'text/plain',
  label = 'Download',
}) => (
  <button
    type="button"
    onClick={() => downloadBlob(new Blob([content], { type: mime }), filename)}
    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
  >
    <Download className="w-3.5 h-3.5" />
    {label}
  </button>
);

/** Read-only code output block. */
export const CodeOut: React.FC<{ code: string; maxH?: string }> = ({ code, maxH = 'max-h-96' }) => (
  <pre className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-mono overflow-auto ${maxH} whitespace-pre text-gray-900 dark:text-gray-100`}>
    {code}
  </pre>
);

export const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
    <span>{message}</span>
  </div>
);
