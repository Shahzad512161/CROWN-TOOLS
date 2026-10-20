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

const EMPTY_HTML_MSG = 'Paste a page\'s HTML source above (in your browser: right-click the page → View Page Source) and the analysis will appear here automatically.';

// ---------------------------------------------------------------------------
// 1. Meta Tag Analyzer
// ---------------------------------------------------------------------------

export const MetaTagAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [html, setHtml] = useState('');
  const [url, setUrl] = useState('');
  const result = useMemo(
    () => (html.includes('<') ? analyzeMetaTags(html, url.trim() || undefined) : null),
    [html, url]
  );

  const rows: [string, string | null][] = result
    ? [
        ['Title', result.title],
        ['Meta description', result.description],
        ['Canonical URL', result.canonical],
        ['Robots meta', result.robotsMeta],
        ['Viewport', result.viewport],
        ['Language (html lang)', result.language],
      ]
    : [];
  const altPct = result && result.images.total ? Math.round((result.images.withAlt / result.images.total) * 100) : 100;

  return (
    <SeoCard tool={tool} note="Analysis is based only on the HTML you paste here — it reads the tags exactly as written, including anything your CMS or framework injected into the head.">
      <div className="grid gap-4">
        <div>
          <OptLabel>Page HTML source</OptLabel>
          <SeoTextarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste the full HTML of the page (<!DOCTYPE html> … )" />
        </div>
        <div>
          <OptLabel>Page URL (optional — used to classify internal vs external links)</OptLabel>
          <OptInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/my-page" />
        </div>
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{EMPTY_HTML_MSG}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Stat label="Title chars" value={result.titleLength} />
            <Stat label="Description chars" value={result.descriptionLength} />
            <Stat label="Words" value={result.wordCount} />
            <Stat label="Images with alt" value={`${altPct}%`} />
            <Stat label="Total links" value={result.links.total} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Extracted values</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {rows.map(([label, value]) => (
                    <tr key={label} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 w-44 align-top">{label}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white break-words">
                        {value ? value : <span className="text-red-500 font-semibold">Not found</span>}
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
                    {v ? <span className="text-gray-900 dark:text-white break-words">{v}</span> : <span className="text-red-500 font-semibold">missing</span>}
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
                    {v ? <span className="text-gray-900 dark:text-white break-words">{v}</span> : <span className="text-red-500 font-semibold">missing</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Checks</h3>
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
  const [html, setHtml] = useState('');
  const [keyword, setKeyword] = useState('');
  const [url, setUrl] = useState('');
  const audit = useMemo(
    () => (html.includes('<') ? onPageSeoAudit(html, keyword, url.trim() || undefined) : null),
    [html, keyword, url]
  );
  const scoreLabel = audit ? (audit.score >= 80 ? 'Excellent' : audit.score >= 60 ? 'Good' : audit.score >= 40 ? 'Fair' : 'Needs work') : '';
  const h1Text = audit?.meta.headings.find((h) => h.level === 1)?.text;

  return (
    <SeoCard tool={tool} note="The score weights every check equally (pass = 1, warning = 0.5). It is a practical on-page checklist, not a ranking prediction — backlinks, site authority and search intent are outside what page HTML can show.">
      <div className="grid gap-4">
        <div>
          <OptLabel>Page HTML source</OptLabel>
          <SeoTextarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste the full HTML of the page you want to audit" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>Target keyword</OptLabel>
            <OptInput value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. best running shoes" />
          </div>
          <div>
            <OptLabel>Page URL (optional)</OptLabel>
            <OptInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/my-page" />
          </div>
        </div>
      </div>

      {!audit ? (
        <p className="mt-4 text-sm text-gray-500">{EMPTY_HTML_MSG}</p>
      ) : (
        <div className="mt-5 space-y-5">
          {!keyword.trim() && (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
              Enter a target keyword above to unlock the keyword placement and density checks — the meta and structure checks below are already running.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={audit.score} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{scoreLabel}</div>
              <div className="text-xs text-gray-500">Overall on-page score from {audit.checks.length} checks</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Keyword uses" value={audit.keywordOccurrences} />
            <Stat label="Keyword density" value={`${audit.keywordDensityPercent}%`} />
            <Stat label="Words" value={audit.meta.wordCount} />
            <Stat label="H1" value={h1Text ? (h1Text.length > 42 ? `${h1Text.slice(0, 42)}…` : h1Text) : 'None'} />
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
  const max = rows.length ? Math.max(...rows.map((r) => r.density)) : 0;
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-500">No phrases found.</p>
      ) : (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300">Term</th>
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300 w-12 text-right">Count</th>
                <th className="px-2.5 py-2 font-bold text-gray-700 dark:text-gray-300 w-24">Density</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.term} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-2.5 py-1.5 text-gray-900 dark:text-white break-words">{r.term}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-gray-700 dark:text-gray-300">{r.count}</td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${max ? Math.max(4, (r.density / max) * 100) : 0}%` }} />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300 w-11 text-right">{r.density.toFixed(2)}%</span>
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
    <SeoCard tool={tool} note="Density is a descriptive stat, not a target to hit — write for readers first. Very high repetition of one phrase (roughly above 2.5–3%) is where stuffing risk starts.">
      <div>
        <OptLabel>Your content (plain text or HTML)</OptLabel>
        <SeoTextarea rows={9} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your article text — or paste page HTML and the tags will be stripped automatically" />
      </div>
      {isHtml && input.trim() && (
        <p className="mt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">This input looks like HTML, so tags were stripped and only the visible text was analyzed.</p>
      )}
      <div className="mt-4 grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <OptLabel>Target keyword (optional)</OptLabel>
          <OptInput value={targetKw} onChange={(e) => setTargetKw(e.target.value)} placeholder="e.g. running shoes" />
        </div>
        <OptCheck label="Exclude stop words (the, and, of…)" checked={excludeStop} onChange={setExcludeStop} />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">Paste content above and the density tables will appear here automatically.</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label="Total words counted" value={result.totalWords} />
            <Stat label="Unique 1-word terms" value={result.singles.length >= 20 ? '20+' : result.singles.length} />
            {targetKw.trim() ? (
              <Stat label={`"${targetKw.trim()}" density`} value={`${kwDensityPct}% (${kwOccurrences}×)`} />
            ) : (
              <Stat label="2-word phrases" value={result.totalPhrases2} />
            )}
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <DensityTable title="Top 1-word terms" rows={result.singles} />
            <DensityTable title="Top 2-word phrases" rows={result.bigrams} />
            <DensityTable title="Top 3-word phrases" rows={result.trigrams} />
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Readability Checker
// ---------------------------------------------------------------------------

function freLabel(v: number): string {
  if (v >= 90) return 'Very easy';
  if (v >= 80) return 'Easy';
  if (v >= 70) return 'Fairly easy';
  if (v >= 60) return 'Standard';
  if (v >= 50) return 'Fairly difficult';
  if (v >= 30) return 'Difficult';
  return 'Very confusing';
}

const fmtMinutes = (mins: number) => (mins < 1 ? `${Math.max(1, Math.round(mins * 60))} sec` : `${mins} min`);

export const ReadabilityChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    <SeoCard tool={tool} note="Scores are computed with the standard published formulas from the words and sentences in your text. Syllables are estimated by an algorithm, so treat scores as close approximations — and remember simpler text usually converts and ranks better for broad audiences.">
      <div>
        <OptLabel>Your text</OptLabel>
        <SeoTextarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text you want to check — articles, product descriptions, landing page copy…" />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">Paste at least a few words of text above and the readability scores will appear here automatically.</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <Stat label="Flesch Reading Ease" value={result.fleschReadingEase} />
            <Stat label="Reading level" value={freLabel(result.fleschReadingEase)} />
            <Stat label="Flesch-Kincaid Grade" value={result.fleschKincaidGrade} />
            <Stat label="Gunning Fog" value={result.gunningFog} />
            <Stat label="SMOG Index" value={result.smog} />
            <Stat label="Coleman-Liau" value={result.colemanLiau} />
            <Stat label="ARI" value={result.ari} />
            <Stat label="Words" value={result.words} />
            <Stat label="Sentences" value={result.sentences} />
            <Stat label="Avg sentence length" value={`${result.avgSentenceLength} words`} />
            <Stat label="Reading time" value={fmtMinutes(result.readingTimeMinutes)} />
            <Stat label="Speaking time" value={fmtMinutes(result.speakingTimeMinutes)} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Long sentences (over 25 words)</h3>
            {longSentences.length === 0 ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
                No sentences over 25 words — sentence length looks healthy.
              </p>
            ) : (
              <ul className="space-y-2">
                {longSentences.map((x, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 shrink-0">{x.words} words</span>
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
  const [headline, setHeadline] = useState('');
  const result = useMemo(() => (headline.trim() ? analyzeHeadline(headline) : null), [headline]);

  return (
    <SeoCard tool={tool} note="The score applies widely-used headline research heuristics (length, numbers, power words, format). It cannot know your audience or topic, so use it as a checklist, not a verdict.">
      <div>
        <OptLabel>Headline / page title</OptLabel>
        <OptInput value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. 7 Proven Ways to Boost Your SEO Rankings in 2026" />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">Type a headline above and its score will appear here as you type.</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={result.score} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{result.scoreLabel}</div>
              <div className="text-xs text-gray-500">Headline score</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Words" value={result.wordCount} />
            <Stat label="Characters" value={result.charCount} />
            <Stat label="Common words" value={`${result.commonWordPercent}%`} />
          </div>
          {(result.powerWordsFound.length > 0 || result.emotionalWordsFound.length > 0) && (
            <div className="space-y-2">
              {result.powerWordsFound.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">Power words:</span>
                  {result.powerWordsFound.map((w) => (
                    <span key={w} className="text-[11px] font-bold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">{w}</span>
                  ))}
                </div>
              )}
              {result.emotionalWordsFound.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mr-1">Emotional words:</span>
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
    <SeoCard tool={tool} note="Pixel widths are measured in Arial, which approximates how Google renders snippets — actual truncation varies by device and query. Google also rewrites titles and descriptions it dislikes, so a perfect preview is not a guarantee of what will be shown.">
      <div className="grid gap-4">
        <div>
          <OptLabel>Page title</OptLabel>
          <OptInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Best Running Shoes for Flat Feet — 2026 Guide" />
        </div>
        <div>
          <OptLabel>Meta description</OptLabel>
          <SeoTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Compare the 10 best running shoes for flat feet, tested by runners. Free shipping and 90-day returns." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <OptLabel>Page URL</OptLabel>
            <OptInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/blog/best-running-shoes" />
          </div>
          <div>
            <OptLabel>Site name (optional)</OptLabel>
            <OptInput value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Runner's World" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Desktop preview</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-[620px] shadow-sm">
            {snippetHeader}
            <div className={`text-[#1a0dab] text-xl leading-snug hover:underline cursor-pointer ${titleOver ? 'truncate' : ''}`}>
              {title.trim() || <span className="text-gray-400">Your page title will appear here</span>}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mt-0.5">
              {description.trim() || <span className="text-gray-400">Your meta description will appear here. Google shows roughly the first 150–160 characters on desktop.</span>}
            </p>
          </div>
          {titleOver && <p className="mt-1.5 text-xs font-semibold text-red-500">Title will be truncated on desktop (~{titlePx}px / 580px).</p>}
          {descOver && <p className="mt-1.5 text-xs font-semibold text-red-500">Description will likely be truncated (~{descPx}px / ~920px across two lines).</p>}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Mobile preview</h3>
          <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-[380px] shadow-sm">
            {snippetHeader}
            <div className="text-[#1a0dab] text-lg leading-snug line-clamp-2">
              {title.trim() || <span className="text-gray-400">Your page title will appear here</span>}
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 mt-0.5">
              {description.trim() || <span className="text-gray-400">Your meta description will appear here on mobile results.</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold">
          <span className={titleOver ? 'text-red-500' : 'text-emerald-600'}>
            Title: {title.length} chars · {titlePx}px / 580px
          </span>
          <span className={descOver ? 'text-red-500' : 'text-emerald-600'}>
            Description: {description.length} chars · {descPx}px / ~920px
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
  const [html, setHtml] = useState('');
  const result = useMemo(() => (html.includes('<') ? codeToTextRatio(html) : null), [html]);
  const textWords = useMemo(() => (result ? tokenizeWords(result.text).length : 0), [result]);

  return (
    <SeoCard tool={tool} note="A ratio of 10–25% is typical for content pages. A very low ratio combined with thin text can signal boilerplate-heavy pages — but the ratio itself is not a direct ranking factor; it is an informational signal about how much of the page is real content versus markup.">
      <div>
        <OptLabel>Page HTML source</OptLabel>
        <SeoTextarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste the full HTML of the page" />
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">{EMPTY_HTML_MSG}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="HTML size" value={`${(result.htmlBytes / 1024).toFixed(1)} KB`} />
            <Stat label="Text size" value={`${(result.textBytes / 1024).toFixed(1)} KB`} />
            <Stat label="Text ratio" value={`${result.ratioPercent}%`} />
            <Stat label="Words in text" value={textWords} />
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
              <span>Visible text</span>
              <span>{result.ratioPercent}% of the HTML</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, result.ratioPercent)}%` }} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Extracted visible text</h3>
            <pre className="max-h-60 overflow-auto whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-800 dark:text-gray-100">
              {result.text || '(no visible text found)'}
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
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const result = useMemo(
    () => (tokenizeWords(textA).length >= 5 && tokenizeWords(textB).length >= 5 ? textSimilarity(textA, textB) : null),
    [textA, textB]
  );
  const verdict = result
    ? result.similarityPercent < 10
      ? 'Essentially unique — the two texts share almost nothing beyond chance phrases.'
      : result.similarityPercent < 30
        ? 'Some overlap — a few shared passages, likely fine, but worth a look at the matching sentences below.'
        : result.similarityPercent < 60
          ? 'Substantial duplication — large parts of these texts are the same. Rewrite one of them.'
          : 'Near-duplicate — these texts are largely the same content. One should be rewritten or canonicalized.'
    : '';
  const matches = result ? result.matchingSentences.filter((m) => m.inBoth) : [];

  return (
    <SeoCard tool={tool} note="This compares the two texts you paste. Checking text against the whole web requires a search index/API, which no in-browser tool can do.">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <OptLabel>Text A (original)</OptLabel>
          <SeoTextarea rows={8} value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Paste the first text" />
        </div>
        <div>
          <OptLabel>Text B (compare against)</OptLabel>
          <SeoTextarea rows={8} value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Paste the second text" />
        </div>
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-gray-500">Paste at least a few words into both boxes and the comparison will appear here automatically.</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <ScoreBadge score={Math.round(result.similarityPercent)} />
            <div>
              <div className="text-lg font-extrabold text-gray-900 dark:text-white">{result.similarityPercent}% similar</div>
              <div className="text-xs text-gray-500 max-w-md">{verdict}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Containment" value={`${result.containmentPercent}%`} />
            <Stat label="Shared 5-word phrases" value={result.sharedShingles} />
            <Stat label="Words in A" value={result.wordsA} />
            <Stat label="Words in B" value={result.wordsB} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Matching sentences (from Text A also found in Text B)</h3>
            {matches.length === 0 ? (
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
                No full matching sentences found — sentence-level duplication is zero.
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
    if (h1Count === 0) out.push({ label: 'H1 missing', status: 'fail', detail: 'No H1 heading found. Every page should have exactly one H1 describing its main topic.' });
    else if (h1Count === 1) out.push({ label: 'Single H1', status: 'pass', detail: `Exactly one H1: "${headings.find((h) => h.level === 1)?.text.slice(0, 80)}"` });
    else out.push({ label: 'Multiple H1s', status: 'warn', detail: `${h1Count} H1 headings found — best practice is exactly one per page; demote the extras to H2.` });

    headings.forEach((h, i) => {
      if (i > 0 && h.level > headings[i - 1].level + 1) {
        out.push({
          label: 'Skipped heading level',
          status: 'warn',
          detail: `H${headings[i - 1].level} "${headings[i - 1].text.slice(0, 50)}" is followed directly by H${h.level} "${h.text.slice(0, 50)}" — don't skip levels; it breaks the document outline for screen readers.`,
        });
      }
      if (!h.text.trim()) {
        out.push({ label: 'Empty heading', status: 'fail', detail: `Heading #${i + 1} (H${h.level}) has no text.` });
      } else if (h.text.length > 70) {
        out.push({ label: 'Long heading', status: 'warn', detail: `H${h.level} "${h.text.slice(0, 60)}…" is ${h.text.length} characters — headings over ~70 chars are usually trying to say too much.` });
      }
    });
    return out;
  }, [headings, counts]);

  return (
    <SeoCard tool={tool} note="Headings are read in document order from the HTML you paste. A clean outline (one H1, no skipped levels) helps search engines and screen readers understand the page structure.">
      <div>
        <OptLabel>Page HTML source</OptLabel>
        <SeoTextarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste the full HTML of the page" />
      </div>

      {headings.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          {html.includes('<') ? 'No headings (H1–H6) found in this HTML.' : EMPTY_HTML_MSG}
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((lvl) => (
              <Stat key={lvl} label={`H${lvl} count`} value={counts[lvl] || 0} />
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Document outline ({headings.length} headings)</h3>
            <ul className="space-y-1.5">
              {headings.map((h, i) => (
                <li key={i} style={{ marginLeft: `${(h.level - 1) * 18}px` }} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  <span className={`text-[10px] font-extrabold border px-1.5 py-0.5 rounded ${LEVEL_CHIP[h.level]}`}>H{h.level}</span>
                  <span className="text-sm text-gray-900 dark:text-white break-words">{h.text || <span className="text-red-500 font-semibold">(empty heading)</span>}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Issues</h3>
            <CheckList checks={issues} />
          </div>
        </div>
      )}
    </SeoCard>
  );
};
