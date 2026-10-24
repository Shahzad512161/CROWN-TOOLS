import React, { useCallback, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { aiText, hasGeminiKey } from '../../../lib/ai/client';
import { useStrings } from '../../../lib/LangContext';
import { AI_STRINGS } from '../../../lib/strings/ai';
import { CopyBtn, DownloadBtn } from '../dev/DevShell';

export { OptLabel, OptInput, OptSelect, OptCheck, CopyBtn, Stat, ErrorBox, DownloadBtn } from '../dev/DevShell';

/** Card chrome shared by the AI Tools suite. */
export const AiCard: React.FC<{ tool: ToolItem; children: React.ReactNode; note?: string }> = ({ tool, children, note }) => {
  const s = useStrings(AI_STRINGS);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[28px] p-4 sm:p-6 shadow-none">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{tool.name}</h2>
        <span className="ms-auto text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
          {s('poweredByGemini')}
        </span>
      </div>
      {children}
      {note && <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">{note}</p>}
    </div>
  );
};

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${
      props.disabled
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        : 'bg-purple-600 hover:bg-purple-700 text-white shadow cursor-pointer'
    }`}
  >
    {children}
  </button>
);

/** Shown instead of a dead tool when the site has no Gemini key configured. */
export const MissingKeyNotice: React.FC = () => {
  const s = useStrings(AI_STRINGS);
  const parts = s('missingKeyNotice').split(/(\{site\}|\{code1\}|\{code2\})/g);
  return (
    <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
      {parts.map((part, i) => {
        if (part === '{site}') return <span key={i} className="font-bold">aistudio.google.com</span>;
        if (part === '{code1}')
          return (
            <code key={i} dir="ltr" className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">
              VITE_GEMINI_API_KEY={'<your-key>'}
            </code>
          );
        if (part === '{code2}')
          return (
            <code key={i} dir="ltr" className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">
              .env
            </code>
          );
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </div>
  );
};

/** Tiny state machine for one-shot AI text generation. */
export function useAiText() {
  const s = useStrings(AI_STRINGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const keyReady = hasGeminiKey();
  const run = useCallback(
    async (prompt: string) => {
      setBusy(true);
      setError('');
      try {
        const out = await aiText(prompt);
        setResult(out);
        return out;
      } catch (e) {
        setError(e instanceof Error ? e.message : s('aiRequestFailed'));
        return '';
      } finally {
        setBusy(false);
      }
    },
    [s]
  );
  return { busy, error, result, setResult, run, keyReady };
}

/** Rendered AI text output with copy / download / word count. */
export const AiOutput: React.FC<{ text: string; filename?: string }> = ({ text, filename = 'ai-output.txt' }) => {
  const s = useStrings(AI_STRINGS);
  if (!text) return null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div className="mt-4">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-auto">
        {text}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <CopyBtn text={text} />
        <DownloadBtn content={text} filename={filename} />
        <span className="text-[11px] text-gray-500">
          {s('wordsChars').replace('{words}', String(words)).replace('{chars}', String(text.length))}
        </span>
      </div>
    </div>
  );
};

export const AiTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
  />
);
