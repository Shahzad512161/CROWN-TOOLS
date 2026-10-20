// Word document surgery / management tools — merge, split, image extraction,
// analysis, metadata editing, protection, watermarks, compression, repair,
// comparison, and find & replace. Everything runs 100% in the browser:
// a .docx is a zip of XML parts, edited with JSZip + DOMParser/XMLSerializer.
import React, { useState } from 'react';
import { Document as DocxDocument, Packer, Paragraph, PageBreak } from 'docx';
import { ArrowLeftRight, BarChart3 } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { useLang, useStrings } from '../../../lib/LangContext';
import { WORD_STRINGS } from '../../../lib/strings/word';
import {
  docxToHtml,
  docxToText,
  loadDocxZip,
  saveDocxZip,
  getZipText,
  setZipText,
  parseXml,
  serializeXml,
  htmlToDocxParagraphs,
  htmlToDocxBytes,
  textToDocxBytes,
  downloadDocx,
  downloadBytes,
  JSZip,
} from '../../../lib/word/core';
import { PdfToolShell, OptLabel, OptInput, OptSelect, OptCheck } from '../pdf/PdfToolShell';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const ACCEPT = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';
const OFFICE_REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const DC_NS = 'http://purl.org/dc/elements/1.1/';
const CP_NS = 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties';
const DCTERMS_NS = 'http://purl.org/dc/terms/';
const XML_DECL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n';

const btnPrimary =
  'w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#f97316] hover:bg-orange-600 text-white shadow cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors';
const btnGhost =
  'px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5 cursor-pointer hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed';

const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">{children}</p>
);

/** Local copies: the shared core re-exports these two names, but they are
 * defined here so this file never depends on another module's internals. */
function stripExt(name: string): string {
  return name.replace(/\.[^/.]+$/, '') || 'document';
}

function escXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function humanize(n: number): string {
  if (!n && n !== 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** XMLSerializer never emits the XML declaration; Word parts expect one. */
function withDecl(xml: string): string {
  return xml.startsWith('<?xml') ? xml : XML_DECL + xml;
}

/** All descendant elements with the given local name in the w namespace. */
function wAll(root: Document | Element, local: string): Element[] {
  const byNs = Array.from(root.getElementsByTagNameNS(W_NS, local));
  if (byNs.length) return byNs;
  return Array.from(root.getElementsByTagName(`w:${local}`));
}

function wAttr(el: Element, local: string): string {
  return el.getAttributeNS(W_NS, local) || el.getAttribute(`w:${local}`) || '';
}

async function loadPartDoc(zip: JSZip, path: string): Promise<Document | null> {
  const xml = await getZipText(zip, path);
  return xml ? parseXml(xml) : null;
}

/** 'rId' + (max numeric suffix + 1) across a relationships part. */
function nextRelId(doc: Document): string {
  let max = 0;
  Array.from(doc.getElementsByTagName('Relationship')).forEach((r) => {
    const m = /^rId(\d+)$/.exec(r.getAttribute('Id') || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `rId${max + 1}`;
}

/** Add an Override entry to [Content_Types].xml if one is not already there. */
async function ensureContentTypeOverride(zip: JSZip, partName: string, contentType: string): Promise<void> {
  const path = '[Content_Types].xml';
  const doc = await loadPartDoc(zip, path);
  if (!doc) return;
  const exists = Array.from(doc.getElementsByTagName('Override')).some(
    (o) => o.getAttribute('PartName') === partName
  );
  if (exists) return;
  const ov = doc.createElementNS(CT_NS, 'Override');
  ov.setAttribute('PartName', partName);
  ov.setAttribute('ContentType', contentType);
  doc.documentElement.appendChild(ov);
  setZipText(zip, path, withDecl(serializeXml(doc)));
}

// ---------------------------------------------------------------------------
// 1. Merge Word — content-level merge of several .docx files
// ---------------------------------------------------------------------------

export const MergeWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  return (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    multiple
    minFiles={2}
    actionLabel={s('mergeDocuments')}
    dropzoneHint={s('mergeHint')}
    onProcess={async (files) => {
      const groups: Paragraph[][] = [];
      for (const f of files) {
        try {
          groups.push(htmlToDocxParagraphs(await docxToHtml(f)));
        } catch {
          throw new Error(s('mergeReadError').replace('{name}', f.name));
        }
      }
      const children: Paragraph[] = [];
      groups.forEach((paras, i) => {
        if (i > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
        children.push(...paras);
      });
      const doc = new DocxDocument({ sections: [{ properties: {}, children }] });
      const blob = await Packer.toBlob(doc);
      downloadDocx(new Uint8Array(await blob.arrayBuffer()), 'merged.docx');
      return s('mergedDone').replace('{count}', String(files.length));
    }}
  >
    {(ctx) => (
      <div>
        {ctx.files.length > 1 && (
          <div className="mt-4">
            <OptLabel>{s('mergeOrder')}</OptLabel>
            <ul className="space-y-1.5">
              {ctx.files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                >
                  <span className="font-black text-orange-500 w-5 text-center">{i + 1}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{f.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Note>{s('mergeNote')}</Note>
      </div>
    )}
  </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 2. Split Word — by Heading 1 sections or every N paragraphs
// ---------------------------------------------------------------------------

export const SplitWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [mode, setMode] = useState<'headings' | 'paragraphs'>('headings');
  const [countText, setCountText] = useState('10');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('splitDocument')}
      onProcess={async (files) => {
        const html = await docxToHtml(files[0]);
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const blocks = Array.from(parsed.body.children) as HTMLElement[];
        if (!blocks.length) throw new Error(s('noContentFound'));
        const groups: string[][] = [];
        let current: string[] = [];
        const flush = () => {
          if (current.length) {
            groups.push(current);
            current = [];
          }
        };
        if (mode === 'headings') {
          for (const b of blocks) {
            if (b.tagName.toLowerCase() === 'h1' && current.length) flush();
            current.push(b.outerHTML);
          }
          flush();
        } else {
          const n = Math.max(1, parseInt(countText, 10) || 10);
          for (const b of blocks) {
            current.push(b.outerHTML);
            if (current.length >= n) flush();
          }
          flush();
        }
        if (!groups.length) throw new Error(s('nothingToSplit'));
        const base = stripExt(files[0].name);
        const zip = new JSZip();
        for (let i = 0; i < groups.length; i++) {
          const bytes = await htmlToDocxBytes(groups[i].join('\n'), `${base} — part ${i + 1}`);
          zip.file(`${base}-part-${String(i + 1).padStart(2, '0')}.docx`, bytes);
        }
        const zipBytes = await zip.generateAsync({ type: 'uint8array' });
        downloadBytes(zipBytes, 'split-word.zip', 'application/zip');
        return s('splitDone').replace('{count}', String(groups.length));
      }}
    >
      {() => (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('splitBy')}</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value as 'headings' | 'paragraphs')}>
              <option value="headings">{s('splitByHeadings')}</option>
              <option value="paragraphs">{s('splitByParagraphsOpt')}</option>
            </OptSelect>
          </div>
          {mode === 'paragraphs' && (
            <div>
              <OptLabel>{s('paragraphsPerFile')}</OptLabel>
              <OptInput type="number" min={1} value={countText} onChange={(e) => setCountText(e.target.value)} />
            </div>
          )}
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 3. Extract Word Images — pull every file out of word/media/
// ---------------------------------------------------------------------------

export const ExtractWordImages: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  return (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel={s('extractImages')}
    onProcess={async (files) => {
      const zip = await loadDocxZip(files[0]);
      const media: { path: string; entry: JSZip.JSZipObject }[] = [];
      zip.forEach((relPath, entry) => {
        if (!entry.dir && relPath.startsWith('word/media/') && relPath.length > 'word/media/'.length) {
          media.push({ path: relPath, entry });
        }
      });
      if (!media.length) return s('noImagesFound');
      const out = new JSZip();
      const used = new Set<string>();
      let total = 0;
      for (const m of media) {
        const data = await m.entry.async('uint8array');
        total += data.length;
        const base = m.path.split('/').pop() || 'image';
        let candidate = base;
        let k = 2;
        while (used.has(candidate)) {
          const dot = base.lastIndexOf('.');
          candidate = dot > 0 ? `${base.slice(0, dot)}-${k}${base.slice(dot)}` : `${base}-${k}`;
          k++;
        }
        used.add(candidate);
        out.file(candidate, data);
      }
      const zipBytes = await out.generateAsync({ type: 'uint8array' });
      downloadBytes(zipBytes, `${stripExt(files[0].name)}-images.zip`, 'application/zip');
      return s('extractedDone').replace('{count}', String(media.length)).replace('{size}', humanize(total));
    }}
  />
  );
};

// ---------------------------------------------------------------------------
// 4. Word Analyzer — document statistics from text + XML structure
// ---------------------------------------------------------------------------

interface WordStats {
  fileSize: number;
  words: number;
  chars: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  tables: number;
  headings: number;
  images: number;
  mediaFiles: number;
  readingTime: string;
  topWords: { word: string; count: number }[];
}

export const WordAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(WORD_STRINGS);
  const [stats, setStats] = useState<WordStats | null>(null);

  return (
    <PdfToolShell tool={tool} accept={ACCEPT} hideDropzone={false}>
      {(ctx) => {
        const analyze = async () => {
          const file = ctx.files[0];
          if (!file) {
            ctx.setStatus('error', s('chooseDocumentFirst'));
            return;
          }
          try {
            setStats(null);
            ctx.setStatus('working', s('analyzing'));
            const text = await docxToText(file);
            const wordsArr = text.split(/\s+/).filter(Boolean);
            const words = wordsArr.length;
            const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
            const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length;

            let tables = 0;
            let headings = 0;
            let images = 0;
            let mediaFiles = 0;
            const zip = await loadDocxZip(file);
            zip.forEach((p, e) => {
              if (!e.dir && p.startsWith('word/media/')) mediaFiles++;
            });
            const docXml = await getZipText(zip, 'word/document.xml');
            if (docXml) {
              const doc = parseXml(docXml);
              tables = wAll(doc, 'tbl').length;
              images = wAll(doc, 'drawing').length + wAll(doc, 'pict').length;
              for (const p of wAll(doc, 'p')) {
                const style = wAll(p, 'pStyle')[0];
                if (style && /^heading/i.test(wAttr(style, 'val'))) headings++;
              }
            }

            const freq = new Map<string, number>();
            for (const raw of wordsArr) {
              const w = raw.toLowerCase().replace(/[^a-z0-9'-]/gi, '');
              if (w.length > 3) freq.set(w, (freq.get(w) || 0) + 1);
            }
            const topWords = Array.from(freq.entries())
              .map(([word, count]) => ({ word, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 10);

            const mins = words / 200;
            setStats({
              fileSize: file.size,
              words,
              chars: text.length,
              charsNoSpaces: text.replace(/\s/g, '').length,
              sentences,
              paragraphs,
              tables,
              headings,
              images,
              mediaFiles,
              readingTime: mins < 1 ? s('readingUnderMin') : s('readingMinutes').replace('{n}', String(Math.round(mins))),
              topWords,
            });
            ctx.setStatus('done', s('analysisDone'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('analyzeFailed'));
          }
        };

        const cards: { label: string; value: string }[] = stats
          ? [
              { label: s('statWords'), value: stats.words.toLocaleString(lang) },
              { label: s('statCharacters'), value: stats.chars.toLocaleString(lang) },
              { label: s('statCharactersNoSpaces'), value: stats.charsNoSpaces.toLocaleString(lang) },
              { label: s('statSentences'), value: stats.sentences.toLocaleString(lang) },
              { label: s('statParagraphs'), value: stats.paragraphs.toLocaleString(lang) },
              { label: s('statHeadings'), value: stats.headings.toLocaleString(lang) },
              { label: s('statTables'), value: stats.tables.toLocaleString(lang) },
              { label: s('statInlineImages'), value: stats.images.toLocaleString(lang) },
              { label: s('statMediaFiles'), value: stats.mediaFiles.toLocaleString(lang) },
              { label: s('statFileSize'), value: humanize(stats.fileSize) },
              { label: s('statReadingTime'), value: stats.readingTime },
            ]
          : [];

        return (
          <div className="mt-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={!ctx.files.length || ctx.status === 'working'}
              onClick={() => void analyze()}
            >
              <BarChart3 className="w-4 h-4" /> {s('analyzeDocument')}
            </button>

            {stats && (
              <div className="mt-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cards.map((c) => (
                    <div
                      key={c.label}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3"
                    >
                      <span className="block text-lg font-black text-gray-900 dark:text-white">{c.value}</span>
                      <span className="block text-[11px] font-semibold text-gray-500 mt-0.5">{c.label}</span>
                    </div>
                  ))}
                </div>

                {stats.topWords.length > 0 && (
                  <div className="mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <span className="block text-xs font-bold text-gray-800 dark:text-gray-100 mb-3">
                      {s('mostFrequentWords')}
                    </span>
                    <div className="space-y-2">
                      {stats.topWords.map((t) => (
                        <div key={t.word} className="flex items-center gap-2 text-xs">
                          <span className="w-28 truncate font-semibold text-gray-700 dark:text-gray-200">{t.word}</span>
                          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${Math.max(4, (t.count / stats.topWords[0].count) * 100)}%` }}
                            />
                          </div>
                          <span className="w-10 text-end font-bold text-gray-600 dark:text-gray-300">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 5. Word Metadata Editor — docProps/core.xml (+ app.xml display)
// ---------------------------------------------------------------------------

interface MetaFields {
  title: string;
  creator: string;
  lastModifiedBy: string;
  subject: string;
  keywords: string;
  category: string;
  description: string;
}

const EMPTY_META: MetaFields = {
  title: '',
  creator: '',
  lastModifiedBy: '',
  subject: '',
  keywords: '',
  category: '',
  description: '',
};

function readNsText(doc: Document, ns: string, local: string): string {
  const el = doc.getElementsByTagNameNS(ns, local)[0];
  return el?.textContent || '';
}

function readTagText(doc: Document, tag: string): string {
  const el = doc.getElementsByTagName(tag)[0];
  return el?.textContent || '';
}

function setCoreField(doc: Document, root: Element, ns: string, qname: string, local: string, value: string) {
  let el: Element | undefined = doc.getElementsByTagNameNS(ns, local)[0] as Element | undefined;
  if (!el) {
    for (const child of Array.from(root.children)) {
      if (child.tagName === qname) {
        el = child;
        break;
      }
    }
  }
  if (!el) {
    el = doc.createElementNS(ns, qname);
    root.appendChild(el);
  }
  el.textContent = value;
}

/** When docProps/core.xml is missing entirely, create the part plus its
 * [Content_Types].xml Override and package relationship. */
async function createCorePropsPart(zip: JSZip): Promise<string> {
  const xml =
    XML_DECL +
    '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' +
    'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' +
    'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    '</cp:coreProperties>';
  setZipText(zip, 'docProps/core.xml', xml);
  await ensureContentTypeOverride(
    zip,
    '/docProps/core.xml',
    'application/vnd.openxmlformats-package.core-properties+xml'
  );
  const relsPath = '_rels/.rels';
  let relsDoc = await loadPartDoc(zip, relsPath);
  if (!relsDoc) {
    relsDoc = parseXml(XML_DECL + `<Relationships xmlns="${REL_NS}"></Relationships>`);
  }
  const hasCoreRel = Array.from(relsDoc.getElementsByTagName('Relationship')).some((r) =>
    (r.getAttribute('Type') || '').endsWith('/metadata/core-properties')
  );
  if (!hasCoreRel) {
    const rel = relsDoc.createElementNS(REL_NS, 'Relationship');
    rel.setAttribute('Id', nextRelId(relsDoc));
    rel.setAttribute('Type', 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties');
    rel.setAttribute('Target', 'docProps/core.xml');
    relsDoc.documentElement.appendChild(rel);
    setZipText(zip, relsPath, withDecl(serializeXml(relsDoc)));
  }
  return xml;
}

export const WordMetadataEditor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [meta, setMeta] = useState<MetaFields | null>(null);
  const [loadedFor, setLoadedFor] = useState('');
  const [createdOn, setCreatedOn] = useState('');
  const [modifiedOn, setModifiedOn] = useState('');
  const [application, setApplication] = useState('');
  const [company, setCompany] = useState('');

  return (
    <PdfToolShell tool={tool} accept={ACCEPT}>
      {(ctx) => {
        const file = ctx.files[0];
        const stale = !!meta && (!file || `${file.name}:${file.size}` !== loadedFor);

        const load = async () => {
          if (!file) {
            ctx.setStatus('error', s('chooseDocumentFirst'));
            return;
          }
          try {
            ctx.setStatus('working', s('readingMetadata'));
            const zip = await loadDocxZip(file);
            const coreXml = await getZipText(zip, 'docProps/core.xml');
            if (coreXml) {
              const doc = parseXml(coreXml);
              setMeta({
                title: readNsText(doc, DC_NS, 'title'),
                creator: readNsText(doc, DC_NS, 'creator'),
                lastModifiedBy: readNsText(doc, CP_NS, 'lastModifiedBy'),
                subject: readNsText(doc, DC_NS, 'subject'),
                keywords: readNsText(doc, CP_NS, 'keywords'),
                category: readNsText(doc, CP_NS, 'category'),
                description: readNsText(doc, DC_NS, 'description'),
              });
              setCreatedOn(readNsText(doc, DCTERMS_NS, 'created'));
              setModifiedOn(readNsText(doc, DCTERMS_NS, 'modified'));
            } else {
              setMeta({ ...EMPTY_META });
              setCreatedOn('');
              setModifiedOn('');
            }
            const appXml = await getZipText(zip, 'docProps/app.xml');
            if (appXml) {
              const appDoc = parseXml(appXml);
              setApplication(readTagText(appDoc, 'Application'));
              setCompany(readTagText(appDoc, 'Company'));
            } else {
              setApplication('');
              setCompany('');
            }
            setLoadedFor(`${file.name}:${file.size}`);
            ctx.setStatus('done', coreXml ? s('metadataLoaded') : s('metadataNoneYet'));
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('readDocumentFailed'));
          }
        };

        const apply = async (fields: MetaFields, message: string) => {
          if (!file) {
            ctx.setStatus('error', s('chooseDocumentFirst'));
            return;
          }
          try {
            ctx.setStatus('working', s('writingMetadata'));
            const zip = await loadDocxZip(file);
            let coreXml = await getZipText(zip, 'docProps/core.xml');
            if (!coreXml) coreXml = await createCorePropsPart(zip);
            const doc = parseXml(coreXml);
            const root = doc.documentElement;
            setCoreField(doc, root, DC_NS, 'dc:title', 'title', fields.title);
            setCoreField(doc, root, DC_NS, 'dc:creator', 'creator', fields.creator);
            setCoreField(doc, root, CP_NS, 'cp:lastModifiedBy', 'lastModifiedBy', fields.lastModifiedBy);
            setCoreField(doc, root, DC_NS, 'dc:subject', 'subject', fields.subject);
            setCoreField(doc, root, CP_NS, 'cp:keywords', 'keywords', fields.keywords);
            setCoreField(doc, root, CP_NS, 'cp:category', 'category', fields.category);
            setCoreField(doc, root, DC_NS, 'dc:description', 'description', fields.description);
            setZipText(zip, 'docProps/core.xml', withDecl(serializeXml(doc)));
            const bytes = await saveDocxZip(zip);
            downloadDocx(bytes, file.name);
            ctx.setStatus('done', message);
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('metadataWriteFailed'));
          }
        };

        const field = (key: keyof MetaFields, label: string) => (
          <div key={key}>
            <OptLabel>{label}</OptLabel>
            <OptInput
              value={meta?.[key] || ''}
              onChange={(e) => setMeta((m) => (m ? { ...m, [key]: e.target.value } : m))}
            />
          </div>
        );

        return (
          <div className="mt-2">
            {!meta || stale ? (
              <button
                type="button"
                className={btnPrimary}
                disabled={!file || ctx.status === 'working'}
                onClick={() => void load()}
              >
                {s('loadMetadata')}
              </button>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {field('title', s('metaTitle'))}
                  {field('creator', s('metaAuthor'))}
                  {field('lastModifiedBy', s('metaLastModifiedBy'))}
                  {field('subject', s('metaSubject'))}
                  {field('keywords', s('metaKeywords'))}
                  {field('category', s('metaCategory'))}
                </div>
                <div className="mt-3">
                  {field('description', s('metaDescription'))}
                </div>

                {(createdOn || modifiedOn || application || company) && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: s('metaCreated'), value: createdOn },
                      { label: s('metaModified'), value: modifiedOn },
                      { label: s('metaApplication'), value: application },
                      { label: s('metaCompany'), value: company },
                    ]
                      .filter((r) => r.value)
                      .map((r) => (
                        <div
                          key={r.label}
                          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {r.label}
                          </span>
                          <span className="block font-semibold text-gray-800 dark:text-gray-100 truncate" title={r.value}>
                            {r.value}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                <button
                  type="button"
                  className={btnPrimary}
                  disabled={ctx.status === 'working'}
                  onClick={() => meta && void apply(meta, s('metadataSaved'))}
                >
                  {s('saveMetadata')}
                </button>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={ctx.status === 'working'}
                    onClick={() => {
                      setMeta({ ...EMPTY_META });
                      void apply({ ...EMPTY_META }, s('metadataCleared'));
                    }}
                  >
                    {s('removeAllMetadata')}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 6. Unlock Word — strip w:documentProtection + range permissions
// ---------------------------------------------------------------------------

export const UnlockWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  return (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel={s('removeRestrictions')}
    onProcess={async (files) => {
      const file = files[0];
      const zip = await loadDocxZip(file);
      let removedProtection = false;
      let removedPerms = 0;

      const settingsDoc = await loadPartDoc(zip, 'word/settings.xml');
      if (settingsDoc) {
        const prot = wAll(settingsDoc, 'documentProtection');
        if (prot.length) {
          prot.forEach((el) => el.parentNode?.removeChild(el));
          removedProtection = true;
          setZipText(zip, 'word/settings.xml', withDecl(serializeXml(settingsDoc)));
        }
      }

      const docDoc = await loadPartDoc(zip, 'word/document.xml');
      if (docDoc) {
        const perms = [...wAll(docDoc, 'permStart'), ...wAll(docDoc, 'permEnd')];
        if (perms.length) {
          perms.forEach((el) => el.parentNode?.removeChild(el));
          removedPerms = perms.length;
          setZipText(zip, 'word/document.xml', withDecl(serializeXml(docDoc)));
        }
      }

      const bytes = await saveDocxZip(zip);
      downloadDocx(bytes, `${stripExt(file.name)}-unlocked.docx`);
      if (removedProtection || removedPerms) return s('restrictionsRemoved');
      return s('noRestrictions');
    }}
  >
    {() => <Note>{s('unlockNote')}</Note>}
  </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 7. Protect Word — add w:documentProtection to word/settings.xml
// ---------------------------------------------------------------------------

const PROTECT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'readOnly', labelKey: 'protectReadOnly' },
  { value: 'comments', labelKey: 'protectComments' },
  { value: 'trackedChanges', labelKey: 'protectTracked' },
  { value: 'forms', labelKey: 'protectForms' },
];

export const ProtectWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [editType, setEditType] = useState('readOnly');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('protectDocument')}
      onProcess={async (files) => {
        const file = files[0];
        const zip = await loadDocxZip(file);
        let settingsXml = await getZipText(zip, 'word/settings.xml');
        if (!settingsXml) {
          settingsXml = XML_DECL + `<w:settings xmlns:w="${W_NS}"></w:settings>`;
          await ensureContentTypeOverride(
            zip,
            '/word/settings.xml',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml'
          );
          const relsPath = 'word/_rels/document.xml.rels';
          let relsDoc = await loadPartDoc(zip, relsPath);
          if (!relsDoc) {
            relsDoc = parseXml(XML_DECL + `<Relationships xmlns="${REL_NS}"></Relationships>`);
          }
          const hasSettingsRel = Array.from(relsDoc.getElementsByTagName('Relationship')).some((r) =>
            (r.getAttribute('Type') || '').endsWith('/settings')
          );
          if (!hasSettingsRel) {
            const rel = relsDoc.createElementNS(REL_NS, 'Relationship');
            rel.setAttribute('Id', nextRelId(relsDoc));
            rel.setAttribute('Type', `${OFFICE_REL_NS}/settings`);
            rel.setAttribute('Target', 'settings.xml');
            relsDoc.documentElement.appendChild(rel);
            setZipText(zip, relsPath, withDecl(serializeXml(relsDoc)));
          }
        }
        const doc = parseXml(settingsXml);
        const root = doc.documentElement;
        wAll(doc, 'documentProtection').forEach((el) => el.parentNode?.removeChild(el));
        const prot = doc.createElementNS(W_NS, 'w:documentProtection');
        prot.setAttributeNS(W_NS, 'w:edit', editType);
        prot.setAttributeNS(W_NS, 'w:enforcement', '1');
        root.insertBefore(prot, root.firstChild);
        setZipText(zip, 'word/settings.xml', withDecl(serializeXml(doc)));
        const bytes = await saveDocxZip(zip);
        downloadDocx(bytes, `${stripExt(file.name)}-protected.docx`);
        const opt = PROTECT_OPTIONS.find((o) => o.value === editType);
        const label = opt ? s(opt.labelKey) : editType;
        return s('protectDoneMsg').replace('{label}', label);
      }}
    >
      {() => (
        <div className="mt-4">
          <div className="max-w-sm">
            <OptLabel>{s('restrictionType')}</OptLabel>
            <OptSelect value={editType} onChange={(e) => setEditType(e.target.value)}>
              {PROTECT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {s(o.labelKey)}
                </option>
              ))}
            </OptSelect>
          </div>
          <Note>{s('protectNote')}</Note>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 8. Word Watermark — classic VML text watermark in the section header
// ---------------------------------------------------------------------------

function watermarkParagraphXml(text: string, colorHex: string, sizePt: number): string {
  return (
    `<w:p xmlns:w="${W_NS}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">` +
    '<w:pPr><w:pStyle w:val="Header"/></w:pPr>' +
    '<w:r><w:rPr><w:noProof/></w:rPr><w:pict>' +
    '<v:shapetype id="_x0000_t136" coordsize="21600,21600" o:spt="136" adj="10800" path="m@7,l@8,m@5,21600l@6,21600e">' +
    '<v:formulas>' +
    '<v:f eqn="sum #0 0 10800"/><v:f eqn="prod #0 2 1"/><v:f eqn="sum 21600 0 @1"/><v:f eqn="sum 0 0 @2"/>' +
    '<v:f eqn="sum 21600 0 @3"/><v:f eqn="if @0 @3 0"/><v:f eqn="if @0 21600 @1"/><v:f eqn="if @0 0 @2"/>' +
    '<v:f eqn="if @0 @4 21600"/><v:f eqn="mid @5 @6"/><v:f eqn="mid @8 @5"/><v:f eqn="mid @7 @8"/><v:f eqn="mid @6 @7"/>' +
    '</v:formulas>' +
    '<v:path textpathok="t" o:connecttype="custom" o:connectlocs="@9,0;@10,10800;@11,21600;@12,10800" o:connectangles="270,180,90,0"/>' +
    '<v:textpath on="t" fitshape="t"/>' +
    '<v:handles><v:h position="#0,bottomRight" xrange="6629,14971"/></v:handles>' +
    '<o:lock v:ext="edit" text="t" shape="t"/>' +
    '</v:shapetype>' +
    `<v:shape id="PowerPlusWaterMarkObject1" o:spid="_x0000_s2049" type="#_x0000_t136" style="position:absolute;margin-left:0;margin-top:0;width:468pt;height:117pt;rotation:315;z-index:-251655168;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin" o:allowincell="f" fillcolor="#${colorHex}" stroked="f">` +
    `<v:textpath style="font-family:'Calibri';font-size:${sizePt}pt" string="${escXml(text)}"/>` +
    '</v:shape>' +
    '</w:pict></w:r></w:p>'
  );
}

function relTargetToPath(target: string): string {
  if (target.startsWith('/')) return target.slice(1);
  return `word/${target.replace(/^\.\//, '')}`;
}

export const WordWatermark: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [wmText, setWmText] = useState('CONFIDENTIAL');
  const [wmColor, setWmColor] = useState('C0C0C0');
  const [wmSize, setWmSize] = useState('54');

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('addWatermark')}
      onProcess={async (files) => {
        const file = files[0];
        const text = wmText.trim() || 'CONFIDENTIAL';
        const colorHex = (wmColor.trim().replace(/^#/, '') || 'C0C0C0').toUpperCase();
        const sizePt = Math.min(200, Math.max(10, parseInt(wmSize, 10) || 54));

        const zip = await loadDocxZip(file);
        const docXml = await getZipText(zip, 'word/document.xml');
        if (!docXml) throw new Error(s('wmNoDocumentXml'));
        const doc = parseXml(docXml);
        const body = wAll(doc, 'body')[0];
        let sectPr: Element | undefined;
        if (body) {
          for (const child of Array.from(body.children)) {
            if (child.localName === 'sectPr') sectPr = child;
          }
        }
        if (!sectPr) {
          const all = wAll(doc, 'sectPr');
          sectPr = all[all.length - 1];
        }
        if (!sectPr) throw new Error(s('wmNoSectionProps'));

        // Resolve an existing default header part, if the section has one.
        const relsPath = 'word/_rels/document.xml.rels';
        let relsDoc = await loadPartDoc(zip, relsPath);
        if (!relsDoc) relsDoc = parseXml(XML_DECL + `<Relationships xmlns="${REL_NS}"></Relationships>`);
        const targetById = new Map<string, string>();
        Array.from(relsDoc.getElementsByTagName('Relationship')).forEach((r) => {
          const id = r.getAttribute('Id');
          const target = r.getAttribute('Target');
          if (id && target) targetById.set(id, target);
        });
        const defaultRefs = wAll(sectPr, 'headerReference').filter((hr) => wAttr(hr, 'type') === 'default');
        let headerPath: string | null = null;
        if (defaultRefs.length) {
          const rid = defaultRefs[0].getAttributeNS(OFFICE_REL_NS, 'id') || defaultRefs[0].getAttribute('r:id') || '';
          const target = targetById.get(rid);
          if (target) headerPath = relTargetToPath(target);
        }

        const fragXml = watermarkParagraphXml(text, colorHex, sizePt);
        let appended = false;
        if (headerPath) {
          const headerDoc = await loadPartDoc(zip, headerPath);
          if (headerDoc) {
            const frag = parseXml(fragXml).documentElement;
            headerDoc.documentElement.appendChild(headerDoc.importNode(frag, true));
            setZipText(zip, headerPath, withDecl(serializeXml(headerDoc)));
            appended = true;
          } else {
            headerPath = null;
          }
        }

        if (!appended) {
          const newPath = 'word/headerWatermark.xml';
          const hdrXml =
            XML_DECL +
            `<w:hdr xmlns:w="${W_NS}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="${OFFICE_REL_NS}">` +
            fragXml +
            '</w:hdr>';
          setZipText(zip, newPath, hdrXml);
          await ensureContentTypeOverride(
            zip,
            '/word/headerWatermark.xml',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml'
          );
          const rid = nextRelId(relsDoc);
          const rel = relsDoc.createElementNS(REL_NS, 'Relationship');
          rel.setAttribute('Id', rid);
          rel.setAttribute('Type', `${OFFICE_REL_NS}/header`);
          rel.setAttribute('Target', 'headerWatermark.xml');
          relsDoc.documentElement.appendChild(rel);
          setZipText(zip, relsPath, withDecl(serializeXml(relsDoc)));
          // Replace any dangling default header reference, then add ours first.
          defaultRefs.forEach((hr) => hr.parentNode?.removeChild(hr));
          const hr = doc.createElementNS(W_NS, 'w:headerReference');
          hr.setAttributeNS(W_NS, 'w:type', 'default');
          hr.setAttributeNS(OFFICE_REL_NS, 'r:id', rid);
          sectPr.insertBefore(hr, sectPr.firstChild);
          setZipText(zip, 'word/document.xml', withDecl(serializeXml(doc)));
        }

        const bytes = await saveDocxZip(zip);
        downloadDocx(bytes, `${stripExt(file.name)}-watermarked.docx`);
        return s('watermarkAdded').replace('{text}', text);
      }}
    >
      {() => (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <OptLabel>{s('watermarkText')}</OptLabel>
              <OptInput value={wmText} onChange={(e) => setWmText(e.target.value)} />
            </div>
            <div>
              <OptLabel>{s('colorHex')}</OptLabel>
              <OptInput dir="ltr" value={wmColor} onChange={(e) => setWmColor(e.target.value)} placeholder="C0C0C0" />
            </div>
            <div>
              <OptLabel>{s('fontSizePt')}</OptLabel>
              <OptInput type="number" min={10} max={200} value={wmSize} onChange={(e) => setWmSize(e.target.value)} />
            </div>
          </div>
          <Note>{s('watermarkNote')}</Note>
        </div>
      )}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 9. Compress Word — recompress embedded PNG/JPEG images via canvas
// ---------------------------------------------------------------------------

export const CompressWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  return (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel={s('compressDocument')}
    onProcess={async (files) => {
      const file = files[0];
      const zip = await loadDocxZip(file);
      const mediaPaths: string[] = [];
      zip.forEach((p, e) => {
        if (!e.dir && /^word\/media\/.+\.(png|jpe?g)$/i.test(p)) mediaPaths.push(p);
      });
      if (!mediaPaths.length) {
        return s('compressNoImages');
      }
      let replaced = 0;
      for (const path of mediaPaths) {
        const entry = zip.file(path);
        if (!entry) continue;
        const data = await entry.async('uint8array');
        const isPng = /\.png$/i.test(path);
        try {
          const bmp = await createImageBitmap(new Blob([data as BlobPart]));
          const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
          const downscaled = scale < 1;
          // PNGs keep their format and are only rewritten when downscaled —
          // this also leaves transparent PNGs untouched at native size.
          if (isPng && !downscaled) {
            bmp.close();
            continue;
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(bmp.width * scale));
          canvas.height = Math.max(1, Math.round(bmp.height * scale));
          const cx = canvas.getContext('2d');
          if (!cx) {
            bmp.close();
            continue;
          }
          cx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
          bmp.close();
          const blob = await new Promise<Blob | null>((res) => {
            if (isPng) canvas.toBlob(res, 'image/png');
            else canvas.toBlob(res, 'image/jpeg', 0.78);
          });
          if (!blob) continue;
          const newData = new Uint8Array(await blob.arrayBuffer());
          if (newData.length < data.length) {
            zip.file(path, newData);
            replaced++;
          }
        } catch {
          // Undecodable image — leave the original bytes untouched.
        }
      }
      if (!replaced) {
        return s('compressNoSmaller');
      }
      const bytes = await saveDocxZip(zip);
      if (bytes.length >= file.size) {
        return s('compressNoShrink');
      }
      downloadDocx(bytes, `${stripExt(file.name)}-compressed.docx`);
      const pct = ((1 - bytes.length / file.size) * 100).toFixed(1);
      return s('compressedDone')
        .replace('{count}', String(replaced))
        .replace('{from}', humanize(file.size))
        .replace('{to}', humanize(bytes.length))
        .replace('{pct}', pct);
    }}
  >
    {() => <Note>{s('compressNote')}</Note>}
  </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 10. Repair Word — validate + rezip, or recover raw text into a clean file
// ---------------------------------------------------------------------------

export const RepairWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const lang = useLang();
  const s = useStrings(WORD_STRINGS);
  return (
  <PdfToolShell
    tool={tool}
    accept={ACCEPT}
    actionLabel={s('repairDocument')}
    onProcess={async (files) => {
      const file = files[0];
      let validZip: JSZip | null = null;
      try {
        const zip = await loadDocxZip(file);
        const docXml = await getZipText(zip, 'word/document.xml');
        if (docXml) {
          const parsed = parseXml(docXml);
          const hasError = parsed.getElementsByTagName('parsererror').length > 0;
          if (!hasError && parsed.documentElement?.localName === 'document') validZip = zip;
        }
      } catch {
        validZip = null;
      }
      if (validZip) {
        const bytes = await saveDocxZip(validZip);
        downloadDocx(bytes, `${stripExt(file.name)}-repaired.docx`);
        return s('repairValid');
      }
      try {
        const text = await docxToText(file);
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        if (wordCount > 0) {
          const bytes = await textToDocxBytes(text, stripExt(file.name));
          downloadDocx(bytes, `${stripExt(file.name)}-repaired.docx`);
          return s('repairRecovered').replace('{count}', wordCount.toLocaleString(lang));
        }
      } catch {
        // fall through to the error below
      }
      throw new Error(s('repairFailed'));
    }}
  >
    {() => <Note>{s('repairNote')}</Note>}
  </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 11. Compare Word — word-level (or paragraph-level) LCS diff of two docs
// ---------------------------------------------------------------------------

interface DiffToken {
  t: string;
  changed: boolean;
}

interface CompareWordResult {
  mode: 'words' | 'paragraphs';
  added: number;
  removed: number;
  unchangedPct: number;
  aTokens: DiffToken[];
  bTokens: DiffToken[];
}

/** LCS token diff (same algorithm as Compare PDF's diffWords). Oversized
 * inputs fall back to whole-document comparison instead of a quadratic table. */
function diffTokens(a: string[], b: string[]): { aOut: DiffToken[]; bOut: DiffToken[] } {
  if (a.length === b.length && a.every((t, i) => t === b[i])) {
    return {
      aOut: a.map((t) => ({ t, changed: false })),
      bOut: b.map((t) => ({ t, changed: false })),
    };
  }
  if (a.length > 3000 || b.length > 3000) {
    return {
      aOut: a.map((t) => ({ t, changed: true })),
      bOut: b.map((t) => ({ t, changed: true })),
    };
  }
  const n = a.length;
  const m = b.length;
  const dp: Uint32Array[] = [];
  for (let i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const aOut: DiffToken[] = [];
  const bOut: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      aOut.push({ t: a[i], changed: false });
      bOut.push({ t: b[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      aOut.push({ t: a[i], changed: true });
      i++;
    } else {
      bOut.push({ t: b[j], changed: true });
      j++;
    }
  }
  while (i < n) aOut.push({ t: a[i++], changed: true });
  while (j < m) bOut.push({ t: b[j++], changed: true });
  return { aOut, bOut };
}

export const CompareWord: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [result, setResult] = useState<CompareWordResult | null>(null);

  return (
    <PdfToolShell tool={tool} accept={ACCEPT} multiple minFiles={2}>
      {(ctx) => {
        const compare = async () => {
          const fileA = ctx.files[0];
          const fileB = ctx.files[1];
          if (!fileA || !fileB) {
            ctx.setStatus('error', s('compareNeedTwo'));
            return;
          }
          try {
            setResult(null);
            ctx.setStatus('working', s('compareWorking'));
            const [textA, textB] = await Promise.all([docxToText(fileA), docxToText(fileB)]);
            const paragraphMode = textA.length > 60000 || textB.length > 60000;
            const aTokens = paragraphMode
              ? textA.split(/\n+/).map((s) => s.trim()).filter(Boolean)
              : textA.split(/\s+/).filter(Boolean);
            const bTokens = paragraphMode
              ? textB.split(/\n+/).map((s) => s.trim()).filter(Boolean)
              : textB.split(/\s+/).filter(Boolean);
            const { aOut, bOut } = diffTokens(aTokens, bTokens);
            const removed = aOut.filter((t) => t.changed).length;
            const added = bOut.filter((t) => t.changed).length;
            const unchanged = aOut.filter((t) => !t.changed).length;
            const denom = Math.max(aOut.length, bOut.length, 1);
            setResult({
              mode: paragraphMode ? 'paragraphs' : 'words',
              added,
              removed,
              unchangedPct: Math.round((unchanged / denom) * 100),
              aTokens: aOut,
              bTokens: bOut,
            });
            ctx.setStatus(
              'done',
              s(paragraphMode ? 'compareDoneParagraphs' : 'compareDoneWords')
                .replace('{added}', String(added))
                .replace('{removed}', String(removed))
                .replace('{pct}', String(Math.round((unchanged / denom) * 100)))
            );
          } catch (e: any) {
            ctx.setStatus('error', e?.message || s('compareFailed'));
          }
        };

        const renderSide = (tokens: DiffToken[], side: 'a' | 'b', block: boolean) => {
          const shown = tokens.slice(0, 4000);
          if (!block) {
            return (
              <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-200 break-words">
                {shown.map((tk, i) =>
                  tk.changed ? (
                    <span
                      key={i}
                      className={
                        side === 'a'
                          ? 'bg-red-200 dark:bg-red-900/60 line-through rounded px-0.5'
                          : 'bg-emerald-200 dark:bg-emerald-900/60 rounded px-0.5'
                      }
                    >
                      {tk.t}{' '}
                    </span>
                  ) : (
                    <span key={i}>{tk.t} </span>
                  )
                )}
                {tokens.length > 4000 && <span className="text-gray-400">{s('truncatedForDisplay')}</span>}
                {tokens.length === 0 && <span className="text-gray-400 italic">{s('noExtractableText')}</span>}
              </p>
            );
          }
          return (
            <div className="space-y-1.5">
              {shown.map((tk, i) => (
                <p
                  key={i}
                  className={`text-xs leading-relaxed rounded px-2 py-1 break-words ${
                    tk.changed
                      ? side === 'a'
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 line-through'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {tk.t}
                </p>
              ))}
              {tokens.length > 4000 && <p className="text-gray-400 text-xs">{s('truncatedForDisplay')}</p>}
              {tokens.length === 0 && <p className="text-gray-400 italic text-xs">{s('noExtractableText')}</p>}
            </div>
          );
        };

        return (
          <div className="mt-2">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {s('compareIntroThe')}
              <strong>{s('compareIntroStrong1')}</strong>
              {s('compareIntroMid')}
              <strong>{s('compareIntroStrong2')}</strong>
              {s('compareIntroRest')}
            </p>
            {ctx.files.length < 2 && (
              <p className="mt-2 text-[11px] font-semibold text-gray-500">
                {s('compareAddTwo').replace('{count}', String(ctx.files.length))}
              </p>
            )}
            {ctx.files.length >= 2 && (
              <p className="mt-2 text-[11px] text-gray-500 truncate">
                A: {ctx.files[0].name} · B: {ctx.files[1].name}
              </p>
            )}

            <button
              type="button"
              className={btnPrimary}
              disabled={ctx.files.length < 2 || ctx.status === 'working'}
              onClick={() => void compare()}
            >
              <ArrowLeftRight className="w-4 h-4" /> {s('compareDocuments')}
            </button>

            {result && (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                    {s('pctUnchanged').replace('{pct}', String(result.unchangedPct))}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {s(result.mode === 'words' ? 'addedInBWords' : 'addedInBParagraphs').replace('{count}', String(result.added))}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    {s(result.mode === 'words' ? 'removedFromAWords' : 'removedFromAParagraphs').replace('{count}', String(result.removed))}
                  </span>
                  {result.mode === 'paragraphs' && (
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      {s('compareLargeDoc')}
                    </span>
                  )}
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-3 border-b md:border-b-0 md:border-e border-gray-200 dark:border-gray-700">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1.5">
                        {s('compareAOriginal')}
                      </span>
                      {renderSide(result.aTokens, 'a', result.mode === 'paragraphs')}
                    </div>
                    <div className="p-3">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
                        {s('compareBRevised')}
                      </span>
                      {renderSide(result.bTokens, 'b', result.mode === 'paragraphs')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};

// ---------------------------------------------------------------------------
// 12. Word Find & Replace — run-level replace across body, headers, footers
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const WordFindReplace: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(WORD_STRINGS);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [includeHF, setIncludeHF] = useState(true);

  return (
    <PdfToolShell
      tool={tool}
      accept={ACCEPT}
      actionLabel={s('findReplace')}
      onProcess={async (files) => {
        if (!findText) throw new Error(s('findEmptyError'));
        const file = files[0];
        const zip = await loadDocxZip(file);
        const parts: string[] = ['word/document.xml'];
        if (includeHF) {
          zip.forEach((p, e) => {
            if (!e.dir && /^word\/(header|footer)\d*\.xml$/.test(p)) parts.push(p);
          });
        }
        const needleCmp = caseSensitive ? findText : findText.toLowerCase();
        let totalOccurrences = 0;
        let touchedParagraphs = 0;

        for (const part of parts) {
          const xml = await getZipText(zip, part);
          if (!xml) continue;
          const doc = parseXml(xml);
          let partChanged = false;
          for (const p of wAll(doc, 'p')) {
            const tNodes = wAll(p, 't');
            if (!tNodes.length) continue;
            const concat = tNodes.map((t) => t.textContent || '').join('');
            const hay = caseSensitive ? concat : concat.toLowerCase();
            if (!hay.includes(needleCmp)) continue;
            let count = 0;
            let idx = 0;
            while ((idx = hay.indexOf(needleCmp, idx)) !== -1) {
              count++;
              idx += needleCmp.length;
            }
            const replacedText = caseSensitive
              ? concat.split(findText).join(replaceText)
              : concat.replace(new RegExp(escapeRegExp(findText), 'gi'), replaceText);
            tNodes[0].textContent = replacedText;
            tNodes[0].setAttribute('xml:space', 'preserve');
            for (let i = 1; i < tNodes.length; i++) tNodes[i].textContent = '';
            totalOccurrences += count;
            touchedParagraphs++;
            partChanged = true;
          }
          if (partChanged) setZipText(zip, part, withDecl(serializeXml(doc)));
        }

        if (totalOccurrences === 0) return s('noMatches');
        const bytes = await saveDocxZip(zip);
        downloadDocx(bytes, `${stripExt(file.name)}-edited.docx`);
        return s('replacedDone')
          .replace('{count}', String(totalOccurrences))
          .replace('{paragraphs}', String(touchedParagraphs));
      }}
    >
      {() => (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <OptLabel>{s('findLabel')}</OptLabel>
              <OptInput value={findText} onChange={(e) => setFindText(e.target.value)} placeholder={s('findPlaceholder')} />
            </div>
            <div>
              <OptLabel>{s('replaceWithLabel')}</OptLabel>
              <OptInput value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder={s('replacePlaceholder')} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <OptCheck label={s('caseSensitive')} checked={caseSensitive} onChange={setCaseSensitive} />
            <OptCheck label={s('searchHeadersFooters')} checked={includeHF} onChange={setIncludeHF} />
          </div>
          <Note>{s('findReplaceNote')}</Note>
        </div>
      )}
    </PdfToolShell>
  );
};
