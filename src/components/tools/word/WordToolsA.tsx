// ============================================================
// Free Omni Tools   Word Tools A
// Viewers & converters built on the shared Word engine
// (src/lib/word/core.ts): mammoth docx -> HTML/text, an
// HTML -> docx walker, and JSZip for EPUB / ODT packages.
// Everything runs 100% in-browser; mammoth reads .docx only.
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, Undo2, Redo2, Download, Copy, Check, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import TurndownService from 'turndown';
import type { ToolItem } from '../../../lib/tools-data';
import { useLang, useStrings, COMMON } from '../../../lib/LangContext';
import { WORD_STRINGS } from '../../../lib/strings/word';
import { PdfToolShell, OptLabel, OptInput, OptSelect, OptCheck } from '../pdf/PdfToolShell';
import {
  docxToHtml,
  docxToText,
  loadDocxZip,
  parseXml,
  htmlToDocxBytes,
  textToDocxBytes,
  downloadDocx,
  downloadBytes,
  downloadBlob,
  stripFileExt,
  escapeXml,
  JSZip,
} from '../../../lib/word/core';

const DOCX_ACCEPT = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// Tailwind styling applied to rendered document HTML (viewer / editor pages).
const DOC_HTML_CLASSES = [
  'leading-relaxed',
  '[&_p]:mb-3 [&_li]:mb-1',
  '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2',
  '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5',
  '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4',
  '[&_ul]:list-disc [&_ul]:ps-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ps-6 [&_ol]:mb-3',
  '[&_table]:w-full [&_table]:border-collapse [&_table]:mb-4',
  '[&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1',
  '[&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-100',
  '[&_a]:text-blue-700 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto',
  '[&_blockquote]:border-s-4 [&_blockquote]:border-gray-300 [&_blockquote]:ps-4 [&_blockquote]:italic',
].join(' ');

const DocxNote: React.FC = () => {
  const s = useStrings(WORD_STRINGS);
  return <p className="mt-3 text-[11px] text-gray-500">{s('docxNote')}</p>;
};

const LoadError: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
    <AlertTriangle className="w-4 h-4 shrink-0" />
    <span>{message}</span>
  </div>
);

/** Mammoth output comes from the user's own file, but strip active content anyway. */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function makeUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const CopyButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const c = useStrings(COMMON);
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard unavailable (permissions)   user can select the preview text instead */
        }
      }}
      className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? c('copied') : label ?? c('copy')}
    </button>
  );
};

// ---------------------------------------------------------------------------
// 1. Word Viewer
// ---------------------------------------------------------------------------

export const WordViewer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(WORD_STRINGS);
  const [html, setHtml] = useState('');
  const [fileName, setFileName] = useState('');
  const [stats, setStats] = useState<{ words: number; chars: number } | null>(null);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState('');

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      setHtml('');
      setStats(null);
      setFileName('');
      setError('');
      return;
    }
    const file = files[0];
    try {
      setError('');
      const [rawHtml, text] = await Promise.all([docxToHtml(file), docxToText(file)]);
      setHtml(sanitizeHtml(rawHtml));
      setFileName(file.name);
      setStats({ words: countWords(text), chars: text.length });
    } catch {
      setHtml('');
      setStats(null);
      setError(s('readError'));
    }
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} onFilesChange={handleFiles}>
      {() => (
        <div>
          {error && <LoadError message={error} />}
          {html ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{s('zoom')}</span>
                {[75, 100, 125, 150].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      zoom === z
                        ? 'bg-[#f97316] border-orange-500 text-white'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {z}%
                  </button>
                ))}
                <span className="ms-auto text-[11px] text-gray-500 truncate max-w-[220px]">{fileName}</span>
              </div>
              <div className="mt-3 overflow-auto max-h-[760px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 sm:p-6">
                <div
                  className="mx-auto bg-white text-gray-900 shadow-lg rounded-sm max-w-[820px] px-8 py-10 sm:px-12"
                  style={{ fontSize: `${zoom}%` }}
                >
                  <div className={`font-serif ${DOC_HTML_CLASSES}`} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
              {stats && (
                <p className="mt-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {s('viewerStats')
                    .replace('{words}', stats.words.toLocaleString(lang))
                    .replace('{chars}', stats.chars.toLocaleString(lang))}
                </p>
              )}
            </>
          ) : (
            !error && <p className="mt-4 text-xs text-gray-500">{s('viewerEmpty')}</p>
          )}
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 2. Word Editor
// ---------------------------------------------------------------------------

export const WordEditor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [title, setTitle] = useState('edited');
  const [pendingHtml, setPendingHtml] = useState<string | null>(null);
  const [error, setError] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingHtml !== null && editorRef.current) {
      editorRef.current.innerHTML = pendingHtml;
    }
  }, [pendingHtml]);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    try {
      setError('');
      setPendingHtml(sanitizeHtml(await docxToHtml(file)));
      setTitle(stripFileExt(file.name) || 'edited');
    } catch {
      setError(s('readError'));
    }
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const toolBtn =
    'px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1 cursor-pointer';

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} onFilesChange={handleFiles}>
      {(ctx) => {
        const exportDocx = async () => {
          const html = editorRef.current?.innerHTML || '';
          if (!html.replace(/<[^>]*>/g, '').trim()) {
            ctx.setStatus('error', s('editorEmptyExport'));
            return;
          }
          try {
            ctx.setStatus('working', s('editorRebuilding'));
            const name = title.replace(/[^\w\- ]+/g, '').trim() || 'edited';
            const bytes = await htmlToDocxBytes(html, name);
            downloadDocx(bytes, `${name}.docx`);
            ctx.setStatus('done', s('editorExported').replace('{name}', name));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('exportFailed'));
          }
        };

        return (
          <div>
            {error && <LoadError message={error} />}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <button type="button" className={toolBtn} onClick={() => exec('bold')} title={s('bold')}>
                <Bold className="w-3.5 h-3.5" /> {s('bold')}
              </button>
              <button type="button" className={toolBtn} onClick={() => exec('italic')} title={s('italic')}>
                <Italic className="w-3.5 h-3.5" /> {s('italic')}
              </button>
              <button type="button" className={toolBtn} onClick={() => exec('underline')} title={s('underline')}>
                <Underline className="w-3.5 h-3.5" /> {s('underline')}
              </button>
              <div className="w-36">
                <OptSelect
                  value="p"
                  onChange={(e) => {
                    exec('formatBlock', `<${e.target.value}>`);
                    e.target.value = 'p';
                  }}
                  aria-label={s('paragraphStyle')}
                >
                  <option value="p">{s('paragraph')}</option>
                  <option value="h1">{s('heading1')}</option>
                  <option value="h2">{s('heading2')}</option>
                  <option value="h3">{s('heading3')}</option>
                </OptSelect>
              </div>
              <button type="button" className={toolBtn} onClick={() => exec('undo')} title={s('undo')}>
                <Undo2 className="w-3.5 h-3.5" /> {s('undo')}
              </button>
              <button type="button" className={toolBtn} onClick={() => exec('redo')} title={s('redo')}>
                <Redo2 className="w-3.5 h-3.5" /> {s('redo')}
              </button>
            </div>

            <div className="mt-3 overflow-auto max-h-[760px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 sm:p-6">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder={s('editorPlaceholder')}
                className={`mx-auto max-w-[820px] min-h-[480px] bg-white text-gray-900 shadow-lg rounded-sm px-8 py-10 sm:px-12 font-serif outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 ${DOC_HTML_CLASSES}`}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <OptLabel>{s('documentName')}</OptLabel>
                <OptInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="edited" />
              </div>
              <button
                type="button"
                onClick={exportDocx}
                className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-orange-600 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> {s('exportAsDocx')}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-gray-500">{s('editorExportNote')}</p>
            <DocxNote />
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Word to Images
// ---------------------------------------------------------------------------

export const WordToImages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');

  const process = async (files: File[]) => {
    const file = files[0];
    const html = sanitizeHtml(await docxToHtml(file));
    if (!html.trim()) throw new Error(s('noReadableContent'));

    // Render offscreen at A4 width with plain hex-color CSS (html2canvas-safe).
    const container = document.createElement('div');
    container.style.cssText =
      'position:absolute;left:-99999px;top:0;width:794px;background:#ffffff;color:#111827;padding:56px;font-family:Georgia,"Times New Roman",serif;font-size:16px;line-height:1.7;';
    container.innerHTML =
      '<style>' +
      'p{margin:0 0 12px}h1{font-size:28px;margin:0 0 16px;line-height:1.3}h2{font-size:22px;margin:20px 0 10px;line-height:1.3}' +
      'h3{font-size:18px;margin:16px 0 8px}ul{list-style:disc;padding-left:24px;margin:0 0 12px}ol{list-style:decimal;padding-left:24px;margin:0 0 12px}' +
      'li{margin:0 0 4px}table{border-collapse:collapse;margin:0 0 16px}td,th{border:1px solid #d1d5db;padding:6px 8px}' +
      'a{color:#1d4ed8}img{max-width:100%}blockquote{border-left:4px solid #d1d5db;padding-left:16px;margin:0 0 12px;font-style:italic}' +
      '</style>' +
      html;
    document.body.appendChild(container);
    try {
      await new Promise((r) => setTimeout(r, 80));
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const pageHeight = Math.floor((canvas.width * 297) / 210);
      const pageCount = Math.max(1, Math.ceil(canvas.height / pageHeight));
      const base = stripFileExt(file.name);
      const ext = format === 'jpeg' ? 'jpg' : 'png';
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';

      const renderSlice = (i: number): Promise<Blob> =>
        new Promise((resolve, reject) => {
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.min(pageHeight, canvas.height - i * pageHeight);
          const sctx = slice.getContext('2d');
          if (!sctx) return reject(new Error(s('canvasUnavailable')));
          sctx.fillStyle = '#ffffff';
          sctx.fillRect(0, 0, slice.width, slice.height);
          sctx.drawImage(canvas, 0, -i * pageHeight);
          slice.toBlob((b) => (b ? resolve(b) : reject(new Error(s('renderPageFailed')))), mime, 0.92);
        });

      if (pageCount === 1) {
        const blob = await renderSlice(0);
        downloadBlob(blob, `${base}.${ext}`);
        return s('renderedSingle').replace('{name}', file.name).replace('{ext}', ext.toUpperCase());
      }
      const zip = new JSZip();
      for (let i = 0; i < pageCount; i++) {
        const blob = await renderSlice(i);
        zip.file(`${base}-page-${i + 1}.${ext}`, await blob.arrayBuffer());
      }
      const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
      downloadBlob(zipBlob, `${base}-images.zip`);
      return s('renderedMulti')
        .replace('{count}', String(pageCount))
        .replace('{ext}', ext.toUpperCase())
        .replace('{name}', file.name);
    } finally {
      container.remove();
    }
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} actionLabel={s('convertToImages')} onProcess={process}>
      {() => (
        <div className="mt-4 max-w-xs">
          <OptLabel>{s('imageFormat')}</OptLabel>
          <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png')}>
            <option value="jpeg">{s('jpgOption')}</option>
            <option value="png">{s('pngOption')}</option>
          </OptSelect>
          <p className="mt-3 text-[11px] text-gray-500">{s('toImagesNote')}</p>
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 4. Word to HTML
// ---------------------------------------------------------------------------

export const WordToHtml: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const c = useStrings(COMMON);
  const [standalone, setStandalone] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      setStandalone('');
      setFileName('');
      setError('');
      return;
    }
    const file = files[0];
    try {
      setError('');
      const body = sanitizeHtml(await docxToHtml(file));
      const title = escapeXml(stripFileExt(file.name));
      setStandalone(
        '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
          `<title>${title}</title>\n` +
          '<style>body{font-family:Georgia,"Times New Roman",serif;line-height:1.7;color:#1f2937;max-width:760px;margin:40px auto;padding:0 20px}' +
          'img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #d1d5db;padding:6px 10px}a{color:#1d4ed8}</style>\n' +
          `</head>\n<body>\n${body}\n</body>\n</html>`
      );
      setFileName(file.name);
    } catch {
      setStandalone('');
      setError(s('readError'));
    }
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} onFilesChange={handleFiles}>
      {() => (
        <div>
          {error && <LoadError message={error} />}
          {standalone ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadBytes(
                      new TextEncoder().encode(standalone),
                      `${stripFileExt(fileName)}.html`,
                      'text/html;charset=utf-8'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> {s('downloadHtml')}
                </button>
                <CopyButton text={standalone} label={s('copyHtml')} />
              </div>
              <p className="mt-4 mb-2 text-xs font-bold text-gray-700 dark:text-gray-200">{c('preview')}</p>
              <iframe
                title={s('htmlPreviewTitle')}
                srcDoc={standalone}
                className="w-full h-96 rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
              />
            </>
          ) : (
            !error && <p className="mt-4 text-xs text-gray-500">{s('toHtmlEmpty')}</p>
          )}
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 5. Word to Text
// ---------------------------------------------------------------------------

export const WordToText: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(WORD_STRINGS);
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      setText('');
      setFileName('');
      setError('');
      return;
    }
    const file = files[0];
    try {
      setError('');
      setText(await docxToText(file));
      setFileName(file.name);
    } catch {
      setText('');
      setError(s('readError'));
    }
  };

  const paragraphs = text ? text.split(/\n+/).map((p) => p.trim()).filter(Boolean).length : 0;

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} onFilesChange={handleFiles}>
      {() => (
        <div>
          {error && <LoadError message={error} />}
          {text ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {s('textStats')
                    .replace('{words}', countWords(text).toLocaleString(lang))
                    .replace('{chars}', text.length.toLocaleString(lang))
                    .replace('{paragraphs}', paragraphs.toLocaleString(lang))}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    downloadBytes(new TextEncoder().encode(text), `${stripFileExt(fileName)}.txt`, 'text/plain;charset=utf-8')
                  }
                  className="ms-auto px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> {s('downloadTxt')}
                </button>
              </div>
              <textarea
                readOnly
                value={text}
                className="mt-3 w-full h-80 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white font-mono"
              />
            </>
          ) : (
            !error && <p className="mt-4 text-xs text-gray-500">{s('toTextEmpty')}</p>
          )}
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. Word to Markdown
// ---------------------------------------------------------------------------

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });

export const WordToMarkdown: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [markdown, setMarkdown] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFiles = async (files: File[]) => {
    if (!files.length) {
      setMarkdown('');
      setFileName('');
      setError('');
      return;
    }
    const file = files[0];
    try {
      setError('');
      setMarkdown(turndown.turndown(sanitizeHtml(await docxToHtml(file))));
      setFileName(file.name);
    } catch {
      setMarkdown('');
      setError(s('readError'));
    }
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} onFilesChange={handleFiles}>
      {() => (
        <div>
          {error && <LoadError message={error} />}
          {markdown ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadBytes(
                      new TextEncoder().encode(markdown),
                      `${stripFileExt(fileName)}.md`,
                      'text/markdown;charset=utf-8'
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-orange-600 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> {s('downloadMd')}
                </button>
                <CopyButton text={markdown} label={s('copyMarkdown')} />
              </div>
              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-xs font-mono p-4">
                {markdown}
              </pre>
            </>
          ) : (
            !error && <p className="mt-4 text-xs text-gray-500">{s('toMarkdownEmpty')}</p>
          )}
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. Word to EPUB
// ---------------------------------------------------------------------------

interface EpubChapter {
  title: string;
  html: string;
}

/** Serialize an HTML fragment's nodes as XHTML (escapes text correctly). */
function toXhtmlFragment(htmlFragment: string): string {
  const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head><title>t</title></head><body>${htmlFragment}</body></html>`,
    'text/html'
  );
  const serializer = new XMLSerializer();
  return Array.from(doc.body.childNodes)
    .map((n) => serializer.serializeToString(n))
    .join('\n');
}

export const WordToEpub: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [titleInput, setTitleInput] = useState('');

  const process = async (files: File[]) => {
    const file = files[0];
    const html = sanitizeHtml(await docxToHtml(file));
    if (!html.trim()) throw new Error(s('noReadableContent'));
    const title = titleInput.trim() || stripFileExt(file.name);

    // Split into chapters at <h1> boundaries; content before the first
    // heading (or the whole document) becomes the opening chapter.
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const chapters: EpubChapter[] = [];
    let current: { title: string; parts: string[] } | null = null;
    const flush = () => {
      if (current && current.parts.some((p) => p.replace(/<[^>]*>/g, '').trim())) {
        chapters.push({ title: current.title, html: current.parts.join('\n') });
      }
      current = null;
    };
    Array.from(parsed.body.children).forEach((el) => {
      const outer = (el as HTMLElement).outerHTML;
      if (el.tagName.toLowerCase() === 'h1') {
        flush();
        current = { title: el.textContent?.trim() || `Chapter ${chapters.length + 1}`, parts: [outer] };
      } else {
        if (!current) current = { title: title, parts: [] };
        current.parts.push(outer);
      }
    });
    flush();
    if (!chapters.length) chapters.push({ title, html });

    const uid = `urn:uuid:${makeUuid()}`;
    const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const chapterDocs = chapters.map(
      (c) =>
        `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(
          c.title
        )}</title></head><body>\n${toXhtmlFragment(c.html)}\n</body></html>`
    );

    const manifestItems = chapters
      .map((_, i) => `    <item id="chapter-${i + 1}" href="chapter-${i + 1}.xhtml" media-type="application/xhtml+xml"/>`)
      .join('\n');
    const spineItems = chapters.map((_, i) => `    <itemref idref="chapter-${i + 1}"/>`).join('\n');
    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${uid}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
${manifestItems}
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>`;
    const nav = `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><h1>Contents</h1><ol>${chapters
      .map((c, i) => `<li><a href="chapter-${i + 1}.xhtml">${escapeXml(c.title)}</a></li>`)
      .join('')}</ol></nav></body></html>`;
    const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>
${chapters
  .map(
    (c, i) =>
      `    <navPoint id="navpoint-${i + 1}" playOrder="${i + 1}"><navLabel><text>${escapeXml(
        c.title
      )}</text></navLabel><content src="chapter-${i + 1}.xhtml"/></navPoint>`
  )
  .join('\n')}
  </navMap>
</ncx>`;
    const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.file('META-INF/container.xml', container);
    zip.file('OEBPS/content.opf', opf);
    zip.file('OEBPS/nav.xhtml', nav);
    zip.file('OEBPS/toc.ncx', ncx);
    chapterDocs.forEach((c, i) => zip.file(`OEBPS/chapter-${i + 1}.xhtml`, c));
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
    downloadBlob(blob, `${stripFileExt(file.name)}.epub`);
    return s(chapters.length === 1 ? 'epubCreatedOne' : 'epubCreatedMany')
      .replace('{title}', title)
      .replace('{count}', String(chapters.length));
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} actionLabel={s('convertToEpub')} onProcess={process}>
      {() => (
        <div className="mt-4 max-w-md">
          <OptLabel>{s('bookTitleOptional')}</OptLabel>
          <OptInput value={titleInput} onChange={(e) => setTitleInput(e.target.value)} placeholder={s('defaultsToFileName')} />
          <p className="mt-3 text-[11px] text-gray-500">{s('epubNote')}</p>
          <DocxNote />
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. Word to ODT
// ---------------------------------------------------------------------------

interface InlineState {
  bold: boolean;
  italic: boolean;
}

function odtStyleName(state: InlineState): string | null {
  if (state.bold && state.italic) return 'T_BI';
  if (state.bold) return 'T_BOLD';
  if (state.italic) return 'T_ITALIC';
  return null;
}

function odtInline(node: Node, state: InlineState): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = escapeXml(node.textContent || '');
    if (!text) return '';
    const style = odtStyleName(state);
    return style ? `<text:span text:style-name="${style}">${text}</text:span>` : text;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  if (tag === 'br') return '<text:line-break/>';
  const next: InlineState = { ...state };
  if (tag === 'strong' || tag === 'b') next.bold = true;
  if (tag === 'em' || tag === 'i') next.italic = true;
  const inner = Array.from(el.childNodes).map((c) => odtInline(c, next)).join('');
  if (tag === 'a') {
    const href = el.getAttribute('href') || '';
    return href ? `<text:a xlink:href="${escapeXml(href)}">${inner}</text:a>` : inner;
  }
  return inner;
}

function odtBlocks(container: HTMLElement, out: string[]) {
  Array.from(container.children).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      const level = tag.charAt(1);
      out.push(
        `<text:h text:outline-level="${level}">${Array.from(el.childNodes)
          .map((c) => odtInline(c, { bold: false, italic: false }))
          .join('')}</text:h>`
      );
    } else if (tag === 'p' || tag === 'blockquote') {
      out.push(
        `<text:p>${Array.from(el.childNodes).map((c) => odtInline(c, { bold: false, italic: false })).join('')}</text:p>`
      );
    } else if (tag === 'ul' || tag === 'ol') {
      Array.from(el.querySelectorAll(':scope > li')).forEach((li, idx) => {
        const prefix = tag === 'ol' ? `${idx + 1}. ` : '• ';
        const inner = Array.from(li.childNodes).map((c) => odtInline(c, { bold: false, italic: false })).join('');
        out.push(`<text:p>${escapeXml(prefix)}${inner}</text:p>`);
      });
    } else if (tag === 'pre') {
      out.push(`<text:p>${escapeXml(el.textContent || '')}</text:p>`);
    } else {
      odtBlocks(el as HTMLElement, out);
    }
  });
}

export const WordToOdt: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);

  const process = async (files: File[]) => {
    const file = files[0];
    const html = sanitizeHtml(await docxToHtml(file));
    if (!html.trim()) throw new Error(s('noReadableContent'));
    const title = stripFileExt(file.name);

    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const bodyParts: string[] = [];
    odtBlocks(parsed.body, bodyParts);
    if (!bodyParts.length) throw new Error(s('noParagraphsExtracted'));

    const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:font-face-decls>
    <style:font-face style:name="Liberation Serif" svg:font-family="'Liberation Serif'"/>
  </office:font-face-decls>
  <office:automatic-styles>
    <style:style style:name="T_BOLD" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
    <style:style style:name="T_ITALIC" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
    <style:style style:name="T_BI" style:family="text"><style:text-properties fo:font-weight="bold" fo:font-style="italic"/></style:style>
  </office:automatic-styles>
  <office:body>
    <office:text>
${bodyParts.join('\n')}
    </office:text>
  </office:body>
</office:document-content>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:version="1.2">
  <office:font-face-decls>
    <style:font-face style:name="Liberation Serif" svg:font-family="'Liberation Serif'"/>
  </office:font-face-decls>
  <office:styles>
    <style:default-style style:family="paragraph">
      <style:paragraph-properties fo:text-align="start"/>
      <style:text-properties style:font-name="Liberation Serif" fo:font-size="12pt"/>
    </style:default-style>
    <style:style style:name="Standard" style:family="paragraph" style:class="text"/>
    <style:style style:name="Heading" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Standard" style:class="text">
      <style:text-properties fo:font-weight="bold"/>
    </style:style>
  </office:styles>
</office:document-styles>`;

    const metaXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" office:version="1.2">
  <office:meta>
    <dc:title>${escapeXml(title)}</dc:title>
    <meta:generator>Free Omni Tools</meta:generator>
  </office:meta>
</office:document-meta>`;

    const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

    const zip = new JSZip();
    zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
    zip.file('META-INF/manifest.xml', manifestXml);
    zip.file('content.xml', contentXml);
    zip.file('styles.xml', stylesXml);
    zip.file('meta.xml', metaXml);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
    downloadBlob(blob, `${title}.odt`);
    return s('odtCreated').replace('{title}', title).replace('{count}', String(bodyParts.length));
  };

  return (
    <PdfToolShell tool={tool} accept={DOCX_ACCEPT} dropzoneHint={s('docxOnlyHint')} actionLabel={s('convertToOdt')} onProcess={process}>
      {() => <DocxNote />}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 9. ODT to Word
// ---------------------------------------------------------------------------

interface OdtStyleInfo {
  bold: boolean;
  italic: boolean;
  parent: string | null;
}

export const OdtToWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);

  const process = async (files: File[]) => {
    const file = files[0];
    const zip = await loadDocxZip(file).catch(() => {
      throw new Error(s('odtOpenError'));
    });
    const contentXml = await (async () => {
      const entry = zip.file('content.xml');
      if (!entry) throw new Error(s('odtNoContent'));
      return entry.async('string');
    })();

    const doc = parseXml(contentXml);

    // Build the style map from automatic + named styles.
    const rawStyles = new Map<string, OdtStyleInfo & { ownBold: boolean; ownItalic: boolean }>();
    Array.from(doc.getElementsByTagName('style:style')).forEach((s) => {
      const name = s.getAttribute('style:name');
      if (!name) return;
      let ownBold = false;
      let ownItalic = false;
      Array.from(s.children).forEach((child) => {
        if (child.tagName === 'style:text-properties') {
          if (child.getAttribute('fo:font-weight') === 'bold') ownBold = true;
          if (child.getAttribute('fo:font-style') === 'italic') ownItalic = true;
        }
      });
      rawStyles.set(name, {
        bold: false,
        italic: false,
        ownBold,
        ownItalic,
        parent: s.getAttribute('style:parent-style-name'),
      });
    });
    const resolveStyle = (name: string | null, seen = new Set<string>()): { bold: boolean; italic: boolean } => {
      if (!name || seen.has(name)) return { bold: false, italic: false };
      seen.add(name);
      const info = rawStyles.get(name);
      if (!info) return { bold: false, italic: false };
      const parent = resolveStyle(info.parent, seen);
      return { bold: info.ownBold || parent.bold, italic: info.ownItalic || parent.italic };
    };

    const inlineHtml = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return escapeXml(node.textContent || '');
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const el = node as Element;
      const tag = el.tagName;
      if (tag === 'text:s') {
        const count = parseInt(el.getAttribute('text:c') || '1', 10) || 1;
        return ' '.repeat(Math.min(count, 20));
      }
      if (tag === 'text:tab') return ' ';
      if (tag === 'text:line-break') return '<br>';
      const inner = Array.from(el.childNodes).map((c) => inlineHtml(c)).join('');
      if (tag === 'text:span') {
        const { bold, italic } = resolveStyle(el.getAttribute('text:style-name'));
        if (bold && italic) return `<strong><em>${inner}</em></strong>`;
        if (bold) return `<strong>${inner}</strong>`;
        if (italic) return `<em>${inner}</em>`;
        return inner;
      }
      // text:a and everything else: keep the text content.
      return inner;
    };

    const officeText = doc.getElementsByTagName('office:text')[0];
    if (!officeText) throw new Error(s('odtNoBody'));
    const htmlParts: string[] = [];
    let paragraphCount = 0;
    Array.from(officeText.children).forEach((block) => {
      if (block.tagName === 'text:h') {
        const level = Math.min(6, Math.max(1, parseInt(block.getAttribute('text:outline-level') || '1', 10) || 1));
        htmlParts.push(`<h${level}>${Array.from(block.childNodes).map((c) => inlineHtml(c)).join('')}</h${level}>`);
        paragraphCount++;
      } else if (block.tagName === 'text:p') {
        htmlParts.push(`<p>${Array.from(block.childNodes).map((c) => inlineHtml(c)).join('')}</p>`);
        paragraphCount++;
      } else if (block.tagName === 'text:list') {
        Array.from(block.children).forEach((item) => {
          if (item.tagName !== 'text:list-item') return;
          const itemHtml = Array.from(item.children)
            .filter((c) => c.tagName === 'text:p' || c.tagName === 'text:h')
            .map((p) => Array.from(p.childNodes).map((c) => inlineHtml(c)).join(''))
            .filter(Boolean)
            .join(' ');
          if (itemHtml) {
            htmlParts.push(`<p>• ${itemHtml}</p>`);
            paragraphCount++;
          }
        });
      }
    });
    if (!paragraphCount) throw new Error(s('odtNoParagraphs'));

    const title = stripFileExt(file.name);
    const bytes = await htmlToDocxBytes(htmlParts.join('\n'), title);
    downloadDocx(bytes, `${title}.docx`);
    return s('odtConverted')
      .replace('{count}', String(paragraphCount))
      .replace('{name}', file.name)
      .replace('{title}', title);
  };

  return (
    <PdfToolShell
      tool={tool}
      accept=".odt,application/vnd.oasis.opendocument.text"
      dropzoneHint={s('odtOnlyHint')}
      actionLabel={s('convertToWord')}
      onProcess={process}
    >
      {() => <p className="mt-3 text-[11px] text-gray-500">{s('odtToWordNote')}</p>}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 10. Text to Word
// ---------------------------------------------------------------------------

function markdownLiteInline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function markdownLiteToHtml(md: string): string {
  const out: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${markdownLiteInline(escapeXml(paragraph.join(' ')))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((item) => `<li>${markdownLiteInline(escapeXml(item))}</li>`).join('')}</ul>`);
      list = [];
    }
  };
  md.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      out.push(`<h${heading[1].length}>${markdownLiteInline(escapeXml(heading[2]))}</h${heading[1].length}>`);
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
    } else if (!line) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line);
    }
  });
  flushParagraph();
  flushList();
  return out.join('\n');
}

export const TextToWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(WORD_STRINGS);
  const c = useStrings(COMMON);
  const [text, setText] = useState('');
  const [docTitle, setDocTitle] = useState('document');
  const [markdownMode, setMarkdownMode] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    setText(await file.text());
    setDocTitle(stripFileExt(file.name) || 'document');
    if (/\.md$/i.test(file.name)) setMarkdownMode(true);
  };

  return (
    <PdfToolShell tool={tool} accept=".txt,.md,text/plain" dropzoneHint={s('textToWordHint')} onFilesChange={handleFiles}>
      {(ctx) => {
        const download = async () => {
          if (!text.trim()) {
            ctx.setStatus('error', s('textEmptyError'));
            return;
          }
          try {
            setBusy(true);
            ctx.setStatus('working', s('buildingDocument'));
            const name = docTitle.replace(/[^\w\- ]+/g, '').trim() || 'document';
            const bytes = markdownMode
              ? await htmlToDocxBytes(markdownLiteToHtml(text), name)
              : await textToDocxBytes(text, name);
            downloadDocx(bytes, `${name}.docx`);
            ctx.setStatus(
              'done',
              s('textCreated').replace('{name}', name).replace('{count}', countWords(text).toLocaleString(lang))
            );
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('createFailed'));
          } finally {
            setBusy(false);
          }
        };

        return (
          <div className="mt-4">
            <OptLabel>{c('yourText')}</OptLabel>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={s('textPlaceholder')}
              className="w-full h-64 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
            />
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <OptLabel>{s('documentName')}</OptLabel>
                <OptInput value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="document" />
              </div>
              <button
                type="button"
                onClick={download}
                disabled={busy}
                className="px-4 py-2.5 rounded-xl bg-[#f97316] hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-400 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> {s('downloadDocxBtn')}
              </button>
            </div>
            <div className="mt-3">
              <OptCheck label={s('markdownModeLabel')} checked={markdownMode} onChange={setMarkdownMode} />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              {s('textStatsLine').replace('{count}', countWords(text).toLocaleString(lang))}
            </p>
          </div>
        );
      }}
    </PdfToolShell>
  );
};
