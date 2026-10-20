import React from 'react';
import { Share2 } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';

export const SocialCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => (
  <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
    <div className="flex items-center gap-3">
      <span className="p-2 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
        <Share2 className="w-5 h-5" />
      </span>
      <div>
        <h2 className="font-bold text-slate-800 dark:text-slate-100">{tool.name}</h2>
        {note && <p className="text-xs text-slate-400">{note}</p>}
      </div>
    </div>
    {children}
  </div>
);

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
  >
    {children}
  </button>
);

export { OptLabel, OptInput, OptSelect, OptCheck, CopyBtn, Stat, ErrorBox, DownloadBtn } from '../dev/DevShell';
export { FileDrop, BlobDownloadBtn, TransparencyBg } from '../image/ImageShell';
