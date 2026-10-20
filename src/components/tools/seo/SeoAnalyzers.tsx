import React, { useMemo, useRef, useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  analyzeMetaTags,
  onPageSeoAudit,
  keywordDensity,
  phraseOccurrences,
  readability,
  splitSentences,
  tokenizeWords,
  htmlToText,
  analyzeHeadline,
  codeToTextRatio,
  textSimilarity,
  extractHeadings,
} from '../../../lib/seo/core';
import type { CheckItem, DensityRow } from '../../../lib/seo/core';
import {
  SeoCard,
  SeoTextarea,
  Stat,
  ScoreBadge,
  CheckList,
  OptLabel,
  OptInput,
  OptCheck,
} from './SeoShell';
import { useStrings, useLang, COMMON } from '../../../lib/LangContext';
import { SEO_STRINGS } from '../../../lib/strings/seo';

// ---------------------------------------------------------------------------
// 1. Meta Tag Analyzer
// ---------------------------------------------------------------------------

export const MetaTagAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const result = useMemo(
    () => (html.includes('<') ? analyzeMetaTags(html, url.trim() || undefined) : null),
    [html, url]
  );

  const rows: [string, string | null][] = result
    ? [
        [s('titleLabel'), result.title],
        [s('metaDescription'), result.description],
        [s('canonicalUrl'), result.canonical],
        [s('robotsMeta'), result.robotsMeta],
        [s('viewportLabel'), result.viewport],
        [s('languageHtmlLang'), result.language],
      ]
    : [];
  const altPct = result && result.images.total ? Math.round((result.images.withAlt / result.images.total) * 100) : 100;

  return (
    <SeoCard tool={tool} note={s('metaAnalyzerNote')}>
      <div className="grid gap-4">
        <div>
          <OptLabel>{s('pageHtmlSource')}</OptLabel>
          <SeoTextarea dir="ltr" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={s('metaHtmlPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('pageUrlLinksLabel')}</OptLabel>
          <OptInput dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/my-page" />
        </div>
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('emptyHtmlMsg')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Stat label={s('titleChars')} value={result.titleLength} />
            <Stat label={s('descChars')} value={result.descriptionLength} />
            <Stat label={s('words')} value={result.wordCount} />
            <Stat label={s('imagesWithAlt')} value={`${altPct}%`} />
            <Stat label={s('totalLinks')} value={result.links.total} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('extractedValues')}</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-44 align-top">{label}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white break-words">
                        {value ? value : <span className="text-red-500 font-semibold">{s('notFound')}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Open Graph</h3>
              <ul className="space-y-1.5">
                {Object.entries(result.og).map(([k, v]) => (
                  <li key={k} className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{k}: </span>
                    {v ? <span className="text-gray-900 dark:text-white break-words">{v}</span> : <span className="text-red-500 font-semibold">{s('missing')}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Twitter Card</h3>
              <ul className="space-y-1.5">
                {Object.entries(result.twitter).map(([k, v]) => (
                  <li key={k} className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{k}: </span>
                    {v ? <span className="text-gray-900 dark:text-white break-words">{v}</span> : <span className="text-red-500 font-semibold">{s('missing')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('checksHeading')}</h3>
            <CheckList checks={result.checks} />
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 2. On-Page SEO Analyzer
// ---------------------------------------------------------------------------

export const OnPageSeoAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [html, setHtml] = useState('');
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const audit = useMemo(
    () => (html.includes('<') ? onPageSeoAudit(html, keyword, url.trim() || undefined) : null),
    [html, keyword, url]
  );
  const scoreLabel = audit ? (audit.score >= 80 ? s('scoreExcellent') : audit.score >= 60 ? s('scoreGood') : audit.score >= 40 ? s('scoreFair') : s('scoreNeedsWork')) : '';
  const h1Text = audit?.meta.headings.find((h) => h.level === 1)?.text;

  return (
    <SeoCard tool={tool} note={s('onPageNote')}>
      <div className="grid gap-4">
        <div>
          <OptLabel>{s('pageHtmlSource')}</OptLabel>
          <SeoTextarea dir="ltr" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={s('onPageHtmlPlaceholder')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>{s('targetKeyword')}</OptLabel>
            <OptInput value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={s('kwExampleShoes')} />
          </div>
          <div>
            <OptLabel>{s('pageUrlOptional')}</OptLabel>
            <OptInput dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/my-page" />
          </div>
        </div>
      </div>

      {!audit ? (
        <p className="mt-4 text-sm text-gray-500">{s('emptyHtmlMsg')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          {!keyword.trim() && (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
              {s('keywordUnlockNote')}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={audit.score} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{scoreLabel}</div>
              <div className="text-xs text-gray-500">{s('overallScoreFrom').replace('{n}', String(audit.checks.length))}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label={s('keywordUses')} value={audit.keywordOccurrences} />
            <Stat label={s('keywordDensityLabel')} value={`${audit.keywordDensityPercent}%`} />
            <Stat label={s('words')} value={audit.meta.wordCount} />
            <Stat label="H1" value={h1Text ? (h1Text.length > 42 ? `${h1Text.slice(0, 42)}…` : h1Text) : s('noneLabel')} />
          </div>
          <CheckList checks={audit.checks} />
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Keyword Density Checker
// ---------------------------------------------------------------------------

const DensityTable: React.FC<{ title: string; rows: DensityRow[] }> = ({ title, rows }) => {
  const s = useStrings(SEO_STRINGS);
  const max = rows.length ? Math.max(...rows.map((r) => r.density)) : 0;
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500">{s('noPhrases')}</p>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-start">
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300">{s('termCol')}</th>
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300 w-12 text-end">{s('countCol')}</th>
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300 w-24">{s('densityCol')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.term} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-2.5 py-1.5 text-gray-900 dark:text-white break-words">{r.term}</td>
                  <td className="px-2.5 py-1.5 text-end font-semibold text-gray-700 dark:text-gray-300">{r.count}</td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${max ? Math.max(4, (r.density / max) * 100) : 0}%` }} />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 w-11 text-end">{r.density.toFixed(2)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const KeywordDensityChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [input, setInput] = useState('');
  const [excludeStop, setExcludeStop] = useState(true);
  const [targetKw, setTargetKw] = useState('');

  const isHtml = input.includes('<');
  const plainText = useMemo(() => (isHtml ? htmlToText(input) : input), [input, isHtml]);
  const result = useMemo(
    () => (plainText.trim() ? keywordDensity(plainText, excludeStop, 20) : null),
    [plainText, excludeStop]
  );
  const rawTotal = useMemo(() => tokenizeWords(plainText).length, [plainText]);
  const kwOccurrences = targetKw.trim() ? phraseOccurrences(plainText, targetKw) : 0;
  const kwWords = targetKw.trim() ? tokenizeWords(targetKw).length : 0;
  const kwDensityPct = rawTotal && kwWords ? Math.round(((kwOccurrences * kwWords) / rawTotal) * 10000) / 100 : 0;

  return (
    <SeoCard tool={tool} note={s('densityNote')}>
      <div>
        <OptLabel>{s('yourContentLabel')}</OptLabel>
        <SeoTextarea rows={9} value={input} onChange={(e) => setInput(e.target.value)} placeholder={s('densityPlaceholder')} />
      </div>
      {isHtml && input.trim() && (
        <p className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">{s('htmlDetectedNote')}</p>
      )}
      <div className="mt-4 grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <OptLabel>{s('targetKeywordOptional')}</OptLabel>
          <OptInput value={targetKw} onChange={(e) => setTargetKw(e.target.value)} placeholder={s('kwExampleRunning')} />
        </div>
        <OptCheck label={s('excludeStopWords')} checked={excludeStop} onChange={setExcludeStop} />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('densityEmpty')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label={s('totalWordsCounted')} value={result.totalWords} />
            <Stat label={s('uniqueTerms')} value={result.singles.length >= 20 ? '20+' : result.singles.length} />
            {targetKw.trim() ? (
              <Stat label={`"${targetKw.trim()}" ${s('densityWord')}`} value={`${kwDensityPct}% (${kwOccurrences}×)`} />
            ) : (
              <Stat label={s('twoWordPhrases')} value={result.totalPhrases2} />
            )}
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <DensityTable title={s('topSingles')} rows={result.singles} />
            <DensityTable title={s('topBigrams')} rows={result.bigrams} />
            <DensityTable title={s('topTrigrams')} rows={result.trigrams} />
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Readability Checker
// ---------------------------------------------------------------------------

type StrFn = (key: string) => string;

function freLabel(v: number, s: StrFn): string {
  if (v >= 90) return s('freVeryEasy');
  if (v >= 80) return s('freEasy');
  if (v >= 70) return s('freFairlyEasy');
  if (v >= 60) return s('freStandard');
  if (v >= 50) return s('freFairlyDifficult');
  if (v >= 30) return s('freDifficult');
  return s('freVeryConfusing');
}

export const ReadabilityChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const c = useStrings(COMMON);
  const fmtMinutes = (mins: number) =>
    mins < 1 ? `${Math.max(1, Math.round(mins * 60))} ${s('unitSec')}` : `${mins} ${s('unitMin')}`;
  const [text, setText] = useState('');
  const result = useMemo(() => (tokenizeWords(text).length >= 3 ? readability(text) : null), [text]);
  const longSentences = useMemo(
    () =>
      text.trim()
        ? splitSentences(text)
            .map((s) => ({ s, words: tokenizeWords(s).length }))
            .filter((x) => x.words > 25)
            .slice(0, 10)
        : [],
    [text]
  );

  return (
    <SeoCard tool={tool} note={s('readabilityNote')}>
      <div>
        <OptLabel>{c('yourText')}</OptLabel>
        <SeoTextarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder={s('readabilityPlaceholder')} />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('readabilityEmpty')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <Stat label="Flesch Reading Ease" value={result.fleschReadingEase} />
            <Stat label={s('readingLevel')} value={freLabel(result.fleschReadingEase, s)} />
            <Stat label="Flesch-Kincaid Grade" value={result.fleschKincaidGrade} />
            <Stat label="Gunning Fog" value={result.gunningFog} />
            <Stat label="SMOG Index" value={result.smog} />
            <Stat label="Coleman-Liau" value={result.colemanLiau} />
            <Stat label="ARI" value={result.ari} />
            <Stat label={s('words')} value={result.words} />
            <Stat label={s('sentencesLabel')} value={result.sentences} />
            <Stat label={s('avgSentenceLength')} value={`${result.avgSentenceLength} ${s('wordsLower')}`} />
            <Stat label={s('readingTime')} value={fmtMinutes(result.readingTimeMinutes)} />
            <Stat label={s('speakingTime')} value={fmtMinutes(result.speakingTimeMinutes)} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('longSentencesHeading')}</h3>
            {longSentences.length === 0 ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
                {s('longSentencesNone')}
              </p>
            ) : (
              <ul className="space-y-2">
                {longSentences.map((x, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 shrink-0">{x.words} {s('wordsLower')}</span>
                    <span className="text-gray-700 dark:text-gray-200 leading-relaxed">{x.s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Headline Analyzer
// ---------------------------------------------------------------------------

export const HeadlineAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [headline, setHeadline] = useState('');
  const result = useMemo(() => (headline.trim() ? analyzeHeadline(headline) : null), [headline]);

  return (
    <SeoCard tool={tool} note={s('headlineNote')}>
      <div>
        <OptLabel>{s('headlineLabel')}</OptLabel>
        <OptInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder={s('headlinePlaceholder')} />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('headlineEmpty')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={result.score} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{result.scoreLabel}</div>
              <div className="text-xs text-gray-500">{s('headlineScore')}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label={s('words')} value={result.wordCount} />
            <Stat label={s('characters')} value={result.charCount} />
            <Stat label={s('commonWords')} value={`${result.commonWordPercent}%`} />
          </div>
          {(result.powerWordsFound.length > 0 || result.emotionalWordsFound.length > 0) && (
            <div className="space-y-2">
              {result.powerWordsFound.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 me-1">{s('powerWords')}</span>
                  {result.powerWordsFound.map((w) => (
                    <span key={w} className="text-[11px] font-bold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">{w}</span>
                  ))}
                </div>
              )}
              {result.emotionalWordsFound.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 me-1">{s('emotionalWords')}</span>
                  {result.emotionalWordsFound.map((w) => (
                    <span key={w} className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">{w}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          <CheckList checks={result.checks} />
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 6. SERP Snippet Preview
// ---------------------------------------------------------------------------

export const SerpSnippetPreview: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const measure = (text: string, font: string): number => {
    if (typeof document === 'undefined' || !text) return 0;
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return 0;
    ctx.font = font;
    return ctx.measureText(text).width;
  };
  const titlePx = useMemo(() => Math.round(measure(title, '20px Arial')), [title]);
  const descPx = useMemo(() => Math.round(measure(description, '13px Arial')), [description]);

  const parsed = useMemo(() => {
    const raw = url.trim();
    if (!raw) return { host: 'example.com', path: '' };
    try {
      const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return { host: u.hostname.replace(/^www\./, ''), path: u.pathname === '/' ? '' : u.pathname };
    } catch {
      return { host: raw, path: '' };
    }
  }, [url]);
  const displaySite = siteName.trim() || parsed.host;
  const breadcrumb = parsed.path
    ? `${parsed.host} ${parsed.path.split('/').filter(Boolean).map((seg) => `› ${decodeURIComponent(seg)}`).join(' ')}`
    : parsed.host;
  const faviconLetter = (displaySite || 'E').charAt(0).toUpperCase();
  const titleOver = titlePx > 580;
  const descOver = descPx > 920;

  const snippetHeader = (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
        {faviconLetter}
      </div>
      <div className="min-w-0 leading-tight">
        <div className="text-sm text-gray-800 truncate">{displaySite}</div>
        <div className="text-xs text-gray-600 truncate">{breadcrumb}</div>
      </div>
    </div>
  );

  return (
    <SeoCard tool={tool} note={s('serpNote')}>
      <div className="grid gap-4">
        <div>
          <OptLabel>{s('pageTitle')}</OptLabel>
          <OptInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder={s('serpTitlePlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('metaDescription')}</OptLabel>
          <SeoTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={s('serpDescPlaceholder')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>{s('pageUrl')}</OptLabel>
            <OptInput dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/blog/best-running-shoes" />
          </div>
          <div>
            <OptLabel>{s('siteNameOptional')}</OptLabel>
            <OptInput value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Runner's World" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{s('desktopPreview')}</h3>
          <div dir="ltr" className="bg-white border border-gray-200 rounded-xl p-4 max-w-[620px] shadow-sm">
            {snippetHeader}
            <div className={`text-[#1a0dab] text-xl leading-snug hover:underline cursor-pointer ${titleOver ? 'truncate' : ''}`}>
              {title.trim() || <span className="text-gray-400">{s('serpTitleEmpty')}</span>}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-0.5">
              {description.trim() || <span className="text-gray-400">{s('serpDescEmptyDesktop')}</span>}
            </p>
          </div>
          {titleOver && <p className="mt-1.5 text-xs font-semibold text-red-500">{s('titleTruncated').replace('{px}', String(titlePx))}</p>}
          {descOver && <p className="mt-1.5 text-xs font-semibold text-red-500">{s('descTruncated').replace('{px}', String(descPx))}</p>}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{s('mobilePreview')}</h3>
          <div dir="ltr" className="bg-white border border-gray-200 rounded-xl p-4 max-w-[380px] shadow-sm">
            {snippetHeader}
            <div className="text-[#1a0dab] text-lg leading-snug line-clamp-2">
              {title.trim() || <span className="text-gray-400">{s('serpTitleEmpty')}</span>}
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 mt-0.5">
              {description.trim() || <span className="text-gray-400">{s('serpDescEmptyMobile')}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold">
          <span className={titleOver ? 'text-red-500' : 'text-emerald-600'}>
            {s('titleLabel')}: {title.length} {s('charsUnit')} · {titlePx}px / 580px
          </span>
          <span className={descOver ? 'text-red-500' : 'text-emerald-600'}>
            {s('descriptionLabel')}: {description.length} {s('charsUnit')} · {descPx}px / ~920px
          </span>
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 7. Code-to-Text Ratio Checker
// ---------------------------------------------------------------------------

export const CodeToTextRatioChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [html, setHtml] = useState('');
  const result = useMemo(() => (html.includes('<') ? codeToTextRatio(html) : null), [html]);
  const textWords = useMemo(() => (result ? tokenizeWords(result.text).length : 0), [result]);

  return (
    <SeoCard tool={tool} note={s('ratioNote')}>
      <div>
        <OptLabel>{s('pageHtmlSource')}</OptLabel>
        <SeoTextarea dir="ltr" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={s('pasteFullHtml')} />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('emptyHtmlMsg')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label={s('htmlSize')} value={`${(result.htmlBytes / 1024).toFixed(1)} KB`} />
            <Stat label={s('textSize')} value={`${(result.textBytes / 1024).toFixed(1)} KB`} />
            <Stat label={s('textRatio')} value={`${result.ratioPercent}%`} />
            <Stat label={s('wordsInText')} value={textWords} />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
              <span>{s('visibleText')}</span>
              <span>{result.ratioPercent}% {s('ofTheHtml')}</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, result.ratioPercent)}%` }} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('extractedVisibleText')}</h3>
            <pre dir="ltr" className="max-h-60 overflow-auto whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-800 dark:text-gray-100">
              {result.text || s('noVisibleText')}
            </pre>
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Duplicate Content Checker
// ---------------------------------------------------------------------------

export const DuplicateContentChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const result = useMemo(
    () => (tokenizeWords(textA).length >= 5 && tokenizeWords(textB).length >= 5 ? textSimilarity(textA, textB) : null),
    [textA, textB]
  );
  const verdict = result
    ? result.similarityPercent < 10
      ? s('verdictUnique')
      : result.similarityPercent < 30
        ? s('verdictSomeOverlap')
        : result.similarityPercent < 60
          ? s('verdictSubstantial')
          : s('verdictNearDuplicate')
    : '';
  const matches = result ? result.matchingSentences.filter((m) => m.inBoth) : [];

  return (
    <SeoCard tool={tool} note={s('dupNote')}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <OptLabel>{s('textA')}</OptLabel>
          <SeoTextarea rows={8} value={textA} onChange={(e) => setTextA(e.target.value)} placeholder={s('pasteFirstText')} />
        </div>
        <div>
          <OptLabel>{s('textB')}</OptLabel>
          <SeoTextarea rows={8} value={textB} onChange={(e) => setTextB(e.target.value)} placeholder={s('pasteSecondText')} />
        </div>
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{s('dupEmpty')}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={Math.round(result.similarityPercent)} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{result.similarityPercent}% {s('similarWord')}</div>
              <div className="text-xs text-gray-500 max-w-md">{verdict}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label={s('containment')} value={`${result.containmentPercent}%`} />
            <Stat label={s('sharedPhrases')} value={result.sharedShingles} />
            <Stat label={s('wordsInA')} value={result.wordsA} />
            <Stat label={s('wordsInB')} value={result.wordsB} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('matchingSentences')}</h3>
            {matches.length === 0 ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
                {s('noMatchingSentences')}
              </p>
            ) : (
              <ul className="space-y-2">
                {matches.map((m, i) => (
                  <li key={i} className="text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-gray-800 dark:text-gray-100 leading-relaxed">
                    {m.sentence}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 9. Heading Structure Checker
// ---------------------------------------------------------------------------

const LEVEL_CHIP: Record<number, string> = {
  1: 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
  2: 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  3: 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  4: 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  5: 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  6: 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

export const HeadingChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const lang = useLang();
  const [html, setHtml] = useState('');
  const headings = useMemo(() => (html.includes('<') ? extractHeadings(html) : []), [html]);
  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    headings.forEach((h) => { c[h.level] = (c[h.level] || 0) + 1; });
    return c;
  }, [headings]);

  const issues = useMemo<CheckItem[]>(() => {
    if (!headings.length) return [];
    const out: CheckItem[] = [];
    const h1Count = counts[1] || 0;
    if (h1Count === 0) out.push({ label: s('h1Missing'), status: 'fail', detail: s('h1MissingDetail') });
    else if (h1Count === 1) out.push({ label: s('singleH1'), status: 'pass', detail: `${s('exactlyOneH1')}: "${headings.find((h) => h.level === 1)?.text.slice(0, 80)}"` });
    else out.push({ label: s('multipleH1s'), status: 'warn', detail: s('multipleH1sDetail').replace('{n}', String(h1Count)) });

    headings.forEach((h, i) => {
      if (i > 0 && h.level > headings[i - 1].level + 1) {
        out.push({
          label: s('skippedLevel'),
          status: 'warn',
          detail: s('skippedLevelDetail')
            .replace('{prevLevel}', String(headings[i - 1].level))
            .replace('{prevText}', headings[i - 1].text.slice(0, 50))
            .replace('{level}', String(h.level))
            .replace('{text}', h.text.slice(0, 50)),
        });
      }
      if (!h.text.trim()) {
        out.push({ label: s('emptyHeading'), status: 'fail', detail: s('emptyHeadingDetail').replace('{n}', String(i + 1)).replace('{level}', String(h.level)) });
      } else if (h.text.length > 70) {
        out.push({
          label: s('longHeading'),
          status: 'warn',
          detail: s('longHeadingDetail')
            .replace('{level}', String(h.level))
            .replace('{text}', h.text.slice(0, 60))
            .replace('{n}', String(h.text.length)),
        });
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings, counts, lang]);

  return (
    <SeoCard tool={tool} note={s('headingsNote')}>
      <div>
        <OptLabel>{s('pageHtmlSource')}</OptLabel>
        <SeoTextarea dir="ltr" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={s('pasteFullHtml')} />
      </div>

      {headings.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          {html.includes('<') ? s('noHeadingsFound') : s('emptyHtmlMsg')}
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <Stat key={lvl} label={`H${lvl} ${s('countWord')}`} value={counts[lvl] || 0} />
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('documentOutline').replace('{n}', String(headings.length))}</h3>
            <ul className="space-y-1.5">
              {headings.map((h, i) => (
                <li key={i} style={{ marginInlineStart: `${(h.level - 1) * 18}px` }} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  <span className={`text-[10px] font-extrabold border px-1.5 py-0.5 rounded ${LEVEL_CHIP[h.level]}`}>H{h.level}</span>
                  <span className="text-sm text-gray-900 dark:text-white break-words">{h.text || <span className="text-red-500 font-semibold">{s('emptyHeadingInline')}</span>}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{s('issuesHeading')}</h3>
            <CheckList checks={issues} />
          </div>
        </div>
      )}
    </SeoCard>
  );
};
