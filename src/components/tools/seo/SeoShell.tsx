import React, { useState } from 'react';
import { Search, Copy, Check, Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import type { CheckItem } from '../../../lib/seo/core';
import { downloadBlob } from '../../../lib/pdf/core';

export { OptLabel, OptInput, OptSelect, OptCheck } from '../pdf/PdfToolShell';

/** Card chrome shared by all SEO tools (mirrors PdfToolShell styling). */
export const SeoCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 sm:p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-4">
      <Search className="w-5 h-5 text-green-600" />
      <h2 className="text-base font-bold text-gray-900 dark:text-white">{tool.name}</h2>
      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
        100% in-browser · no upload
      </span>
    </div>
    {children}
    {note && <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">{note}</p>}
  </div>
);

export const SeoTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-900 dark:text-white"
  />
);

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
      props.disabled
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-green-600 hover:bg-green-700 text-white shadow cursor-pointer'
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
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
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
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
  >
    <Download className="w-3.5 h-3.5" />
    {label}
  </button>
);

export const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-center">
    <div className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{value}</div>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</div>
  </div>
);

export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40' : score >= 55 ? 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40' : 'text-red-600 border-red-300 bg-red-50 dark:bg-red-950/40';
  return (
    <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${color}`}>
      <span className="text-2xl font-extrabold leading-none">{score}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide">/ 100</span>
    </div>
  );
};

export const CheckList: React.FC<{ checks: CheckItem[] }> = ({ checks }) => (
  <ul className="space-y-2">
    {checks.map((c, i) => (
      <li key={i} className="flex items-start gap-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
        {c.status === 'pass' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        ) : c.status === 'warn' ? (
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <div className="text-xs font-bold text-gray-900 dark:text-white">{c.label}</div>
          <div className="text-[11px] text-gray-500 leading-relaxed">{c.detail}</div>
        </div>
      </li>
    ))}
  </ul>
);
