import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  extractLinks,
  parseRobotsTxt,
  isUrlAllowed,
  validateSitemapXml,
  analyzeRedirectMap,
  clusterKeywords,
  combineKeywords,
  wrapKeyword,
  minifyHtml,
  minifyCss,
  minifyJs,
} from '../../../lib/seo/core';
import {
  SeoCard,
  SeoTextarea,
  CopyBtn,
  DownloadBtn,
  Stat,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
} from './SeoShell';
import { useStrings, useLang, COMMON } from '../../../lib/LangContext';
import { SEO_STRINGS } from '../../../lib/strings/seo';

// ---------------------------------------------------------------------------
// 1. Link Extractor
// ---------------------------------------------------------------------------

const csvEscape = (s: string) => `"${s.replace(/"/g, '""')}"`;

export const LinkExtractor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [html, setHtml] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [uniqueOnly, setUniqueOnly] = useState(true);

  const links = useMemo(() => {
    if (!html.trim()) return [];
    let all = extractLinks(html, pageUrl.trim() || undefined);
    if (uniqueOnly) {
      const seen = new Set<string>();
      all = all.filter((l) => {
        if (seen.has(l.href)) return false;
        seen.add(l.href);
        return true;
      });
    }
    return all;
  }, [html, pageUrl, uniqueOnly]);

  const internal = links.filter((l) => l.internal === true).length;
  const external = links.filter((l) => l.internal === false).length;
  const dofollow = links.filter((l) => l.follow).length;
  const nofollow = links.length - dofollow;

  const csv = [
    'anchor,url,type,rel,follow',
    ...links.map((l) =>
      [
        csvEscape(l.anchor),
        csvEscape(l.href),
        l.internal === null ? '' : l.internal ? 'internal' : 'external',
        csvEscape(l.rel),
        l.follow ? 'dofollow' : 'nofollow',
      ].join(',')
    ),
  ].join('\n');
  const urlsText = links.map((l) => l.href).join('\n');

  return (
    <SeoCard tool={tool} note={s('linkExtNote')}>
      <OptLabel>{s('pageHtml')}</OptLabel>
      <SeoTextarea dir="ltr" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder={s('pasteFullHtmlHere')} />
      <div className="grid sm:grid-cols-2 gap-3 mt-3 items-end">
        <div>
          <OptLabel>{s('pageUrlDetectLabel')}</OptLabel>
          <OptInput dir="ltr" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://example.com/page" />
        </div>
        <OptCheck label={s('uniqueUrlsOnly')} checked={uniqueOnly} onChange={setUniqueOnly} />
      </div>

      {links.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            <Stat label={s('totalLinks')} value={links.length} />
            <Stat label={s('internalWord')} value={internal} />
            <Stat label={s('externalWord')} value={external} />
            <Stat label="Dofollow" value={dofollow} />
            <Stat label="Nofollow" value={nofollow} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={urlsText} label={s('copyAllUrls')} />
            <DownloadBtn content={csv} filename="links.csv" mime="text/csv" label={s('downloadCsv')} />
          </div>
          <div className="overflow-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-xl mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-start">
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('anchorCol')}</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">URL</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('typeCol')}</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Rel</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-1.5 max-w-[160px] truncate text-gray-800 dark:text-gray-100">{l.anchor || s('noAnchorText')}</td>
                    <td className="px-3 py-1.5 max-w-[260px] truncate text-gray-600 dark:text-gray-300" title={l.href}>{l.href}</td>
                    <td className="px-3 py-1.5">
                      {l.internal === null ? (
                        <span className="text-gray-400"> </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${l.internal ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300' : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'}`}>
                          {l.internal ? s('internalWord') : s('externalWord')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{l.rel || (l.follow ? 'dofollow' : ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500 mt-3">{s('linkExtEmpty')}</p>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Robots.txt Tester
// ---------------------------------------------------------------------------

const AGENT_CHIPS = ['Googlebot', 'Bingbot', '*'];

export const RobotsTxtTester: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [robots, setRobots] = useState('User-agent: *\nDisallow: /admin/\nAllow: /admin/public\n\nSitemap: https://example.com/sitemap.xml');
  const [agent, setAgent] = useState('Googlebot');
  const [urlsText, setUrlsText] = useState('');

  const parsed = useMemo(() => parseRobotsTxt(robots), [robots]);
  const totalRules = parsed.groups.reduce((a, g) => a + g.rules.length, 0);
  const urlLines = useMemo(() => urlsText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [urlsText]);
  const results = useMemo(
    () => urlLines.map((u) => ({ url: u, allowed: isUrlAllowed(robots, u, agent.trim() || '*') })),
    [urlLines, robots, agent]
  );

  return (
    <SeoCard tool={tool} note={s('robotsTestNote')}>
      <OptLabel>{s('robotsContentLabel')}</OptLabel>
      <SeoTextarea dir="ltr" rows={8} value={robots} onChange={(e) => setRobots(e.target.value)} placeholder={'User-agent: *\nDisallow: /private/'} />
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <OptLabel>{s('userAgentTestAs')}</OptLabel>
          <OptInput dir="ltr" value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="Googlebot" />
          <div className="flex gap-1.5 mt-2">
            {AGENT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setAgent(chip)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                  agent === chip
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <div>
          <OptLabel>{s('urlsToTest')}</OptLabel>
          <SeoTextarea dir="ltr" rows={4} value={urlsText} onChange={(e) => setUrlsText(e.target.value)} placeholder={'https://example.com/admin/\nhttps://example.com/admin/public\n/products/shoes'} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label={s('ruleGroups')} value={parsed.groups.length} />
        <Stat label={s('totalRules')} value={totalRules} />
        <Stat label={s('sitemapsDeclared')} value={parsed.sitemaps.length} />
      </div>
      {results.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {results.map((r, i) => (
            <li key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.allowed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'}`}>
                {r.allowed ? s('allowedWord') : s('blockedWord')}
              </span>
              <span dir="ltr" className="text-xs text-gray-700 dark:text-gray-200 truncate">{r.url}</span>
            </li>
          ))}
        </ul>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Sitemap Validator
// ---------------------------------------------------------------------------

export const SitemapValidator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [xml, setXml] = useState('');
  const result = useMemo(() => (xml.trim() ? validateSitemapXml(xml) : null), [xml]);

  return (
    <SeoCard tool={tool} note={s('sitemapValNote')}>
      <OptLabel>{s('sitemapXmlLabel')}</OptLabel>
      <SeoTextarea dir="ltr" rows={10} value={xml} onChange={(e) => setXml(e.target.value)} placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>'} />
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-500">{s('orLoadFile')}</span>
        <input
          type="file"
          accept=".xml,.txt"
          className="text-xs text-gray-600 dark:text-gray-300"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setXml(await f.text());
            e.target.value = '';
          }}
        />
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label={s('urlCount')} value={result.urlCount} />
            <Stat label={s('typeCol')} value={result.isIndex ? s('sitemapIndexVal') : s('urlSetVal')} />
            <Stat label={s('errorsLabel')} value={result.errors.length} />
            <Stat label={s('warningsLabel')} value={result.warnings.length} />
          </div>
          {result.errors.length === 0 && result.warnings.length === 0 && (
            <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{s('sitemapValid')}</span>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="mt-3">
              <OptLabel>{s('errorsLabel')}</OptLabel>
              <ul className="space-y-1.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className="mt-3">
              <OptLabel>{s('warningsLabel')}</OptLabel>
              <ul className="space-y-1.5">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">{w}</li>
                ))}
              </ul>
            </div>
          )}
          {result.duplicates.length > 0 && (
            <div className="mt-3">
              <OptLabel>{s('duplicateUrls').replace('{n}', String(result.duplicates.length))}</OptLabel>
              <ul className="space-y-1">
                {result.duplicates.slice(0, 20).map((d, i) => (
                  <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{d}</li>
                ))}
              </ul>
              {result.duplicates.length > 20 && <p className="text-[11px] text-gray-500 mt-1">{s('andMore').replace('{n}', String(result.duplicates.length - 20))}</p>}
            </div>
          )}
        </>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Redirect Chain Analyzer
// ---------------------------------------------------------------------------

export const RedirectChainAnalyzer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [text, setText] = useState('');
  const result = useMemo(() => (text.trim() ? analyzeRedirectMap(text) : null), [text]);
  const flattenedText = result ? result.flattened.map((f) => `${f.from} ${f.to}`).join('\n') : '';

  return (
    <SeoCard tool={tool} note={s('redirectNote')}>
      <OptLabel>{s('redirectMapLabel')}</OptLabel>
      <SeoTextarea
        dir="ltr"
        rows={9}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'/old-page /newer-page\n/newer-page /newest-page\n/blog/old-post /blog/new-post'}
      />
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label={s('rulesWord')} value={result.pairs.length} />
            <Stat label={s('chainsFound')} value={result.chains.length} />
            <Stat label={s('loopsFound')} value={result.loops.length} />
            <Stat label={s('duplicateSourcesStat')} value={result.duplicateSources.length} />
          </div>

          {result.chains.length > 0 && (
            <div className="mt-4">
              <OptLabel>{s('chainsLabel')}</OptLabel>
              <div className="space-y-2">
                {result.chains.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                    {c.path.map((seg, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                        <span className="text-[11px] font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5 text-gray-800 dark:text-gray-100">{seg}</span>
                      </React.Fragment>
                    ))}
                    <span className="ms-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">{c.hops} {s('hopsWord')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.loops.length > 0 && (
            <div className="mt-4">
              <OptLabel>{s('loopsLabel')}</OptLabel>
              <div className="space-y-2">
                {result.loops.map((loop, i) => (
                  <div key={i} className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 break-all">
                    {loop.join(' → ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.duplicateSources.length > 0 && (
            <div className="mt-4">
              <OptLabel>{s('duplicateSourcesLabel')}</OptLabel>
              <ul className="space-y-1">
                {result.duplicateSources.map((d, i) => (
                  <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {result.invalidLines.length > 0 && (
            <div className="mt-4">
              <OptLabel>{s('invalidLines')}</OptLabel>
              <ul className="space-y-1">
                {result.invalidLines.map((l, i) => (
                  <li key={i} className="text-[11px] text-gray-400 truncate">{l}</li>
                ))}
              </ul>
            </div>
          )}

          {result.flattened.length > 0 && (
            <div className="mt-4">
              <OptLabel>{s('flattenedLabel')}</OptLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                <CopyBtn text={flattenedText} label={s('copyFlattened')} />
                <DownloadBtn content={flattenedText} filename="redirect-map-flattened.txt" label={s('downloadFlattened')} />
              </div>
              <div className="overflow-auto max-h-80 border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-start">
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('fromCol')}</th>
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('finalUrlCol')}</th>
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('hopsCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.flattened.map((f, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1.5 max-w-[200px] truncate text-gray-800 dark:text-gray-100">{f.from}</td>
                        <td className="px-3 py-1.5 max-w-[200px] truncate text-gray-600 dark:text-gray-300">{f.to}</td>
                        <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{f.hops}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Keyword Clustering
// ---------------------------------------------------------------------------

export const KeywordClustering: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [text, setText] = useState('');
  const keywords = useMemo(() => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [text]);
  const clusters = useMemo(() => (keywords.length ? clusterKeywords(keywords) : []), [keywords]);
  const largest = clusters.reduce((a, c) => Math.max(a, c.keywords.length), 0);
  const singletons = clusters.filter((c) => c.keywords.length === 1).length;
  const exportText = clusters.map((c) => `## ${c.label} (${c.keywords.length})\n${c.keywords.join('\n')}`).join('\n\n');

  return (
    <SeoCard tool={tool} note={s('kwClusterNote')}>
      <OptLabel>{s('keywordsOnePerLine')}</OptLabel>
      <SeoTextarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder={'buy running shoes\nbest running shoes for men\nrunning shoes sale\nhow to boil eggs\nboiled egg time'} />
      {clusters.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label={s('keywordsIn')} value={keywords.length} />
            <Stat label={s('clustersOut')} value={clusters.length} />
            <Stat label={s('largestCluster')} value={largest} />
            <Stat label={s('singletonsWord')} value={singletons} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={exportText} label={s('copyClusters')} />
            <DownloadBtn content={exportText} filename="keyword-clusters.txt" label={s('downloadClusters')} />
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            {clusters.map((c, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">{c.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300">{c.keywords.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.keywords.map((k, j) => (
                    <span key={j} className="text-[11px] font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 text-gray-700 dark:text-gray-200">{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 6. Keyword Combiner
// ---------------------------------------------------------------------------

type MatchType = 'none' | 'broad' | 'phrase' | 'exact' | 'bmm';
const MAX_COMBINATIONS = 10000;

function parseList(s: string): string[] {
  return [...new Set(s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean))];
}

function wrapAll(kws: string[], mt: string): string[] {
  if (mt === 'phrase' || mt === 'exact' || mt === 'bmm' || mt === 'broad') {
    return kws.map((k) => wrapKeyword(k, mt));
  }
  return kws;
}

export const KeywordCombiner: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const [listA, setListA] = useState('');
  const [listB, setListB] = useState('');
  const [listC, setListC] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('none');

  const { results, capped } = useMemo(() => {
    const lists = [parseList(listA), parseList(listB), parseList(listC)].filter((l) => l.length);
    if (!lists.length) return { results: [] as string[], capped: false };
    const total = lists.reduce((a, l) => a * l.length, 1);
    let cappedFlag = false;
    let trimmed = lists;
    if (total > MAX_COMBINATIONS) {
      cappedFlag = true;
      const perList = Math.max(1, Math.floor(Math.pow(MAX_COMBINATIONS, 1 / lists.length)));
      trimmed = lists.map((l) => l.slice(0, perList));
    }
    const combined = wrapAll(combineKeywords(trimmed), matchType);
    return { results: combined.slice(0, MAX_COMBINATIONS), capped: cappedFlag };
  }, [listA, listB, listC, matchType]);

  const resultsText = results.join('\n');

  return (
    <SeoCard tool={tool} note={s('kwCombinerNote')}>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <OptLabel>{s('listA')}</OptLabel>
          <SeoTextarea rows={6} value={listA} onChange={(e) => setListA(e.target.value)} placeholder={'buy\nbest\ncheap'} />
        </div>
        <div>
          <OptLabel>{s('listBOptional')}</OptLabel>
          <SeoTextarea rows={6} value={listB} onChange={(e) => setListB(e.target.value)} placeholder={'running shoes\ntrail shoes'} />
        </div>
        <div>
          <OptLabel>{s('listCOptional')}</OptLabel>
          <SeoTextarea rows={6} value={listC} onChange={(e) => setListC(e.target.value)} placeholder={'online\nnear me'} />
        </div>
      </div>
      <div className="max-w-xs mt-3">
        <OptLabel>{s('matchType')}</OptLabel>
        <OptSelect value={matchType} onChange={(e) => setMatchType(e.target.value as MatchType)}>
          <option value="none">{s('noneLabel')}</option>
          <option value="broad">{s('broadMatch')}</option>
          <option value="phrase">{s('phraseMatch')}</option>
          <option value="exact">{s('exactMatch')}</option>
          <option value="bmm">{s('broadMatchModifier')}</option>
        </OptSelect>
      </div>
      {capped && (
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{s('cappedWarn')}</span>
        </div>
      )}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            <Stat label={s('combinedKeywords')} value={results.length} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={resultsText} label={s('copyAll')} />
            <DownloadBtn content={resultsText} filename="combined-keywords.txt" label={s('downloadTxt')} />
          </div>
          <OptLabel>{s('previewFirst200')}</OptLabel>
          <pre dir="ltr" className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-[11px] text-gray-700 dark:text-gray-200 max-h-72 overflow-auto whitespace-pre-wrap">
            {results.slice(0, 200).join('\n')}
          </pre>
        </>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 7. SEO ROI Calculator
// ---------------------------------------------------------------------------

const RAMP = [0.1, 0.2, 0.35, 0.5, 0.65, 0.75, 0.85, 0.9, 0.95, 1, 1, 1];

export const SeoRoiCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const c = useStrings(COMMON);
  const lang = useLang();
  const moneyFmt = useMemo(
    () => new Intl.NumberFormat(lang, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    [lang]
  );
  const numFmt = useMemo(() => new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }), [lang]);
  const [cost, setCost] = useState('1500');
  const [volume, setVolume] = useState('20000');
  const [ctr, setCtr] = useState('25');
  const [convRate, setConvRate] = useState('3');
  const [orderValue, setOrderValue] = useState('120');
  const [margin, setMargin] = useState('60');

  const calc = useMemo(() => {
    const n = (s: string) => {
      const v = parseFloat(s);
      return Number.isFinite(v) ? v : 0;
    };
    const c = n(cost);
    const visitors = (n(volume) * n(ctr)) / 100;
    const conversions = (visitors * n(convRate)) / 100;
    const revenue = conversions * n(orderValue);
    const grossProfit = (revenue * n(margin)) / 100;
    const net = grossProfit - c;
    const roi = c > 0 ? (net / c) * 100 : 0;
    const valuePerConversion = (n(orderValue) * n(margin)) / 100;
    const breakEven = valuePerConversion > 0 ? c / valuePerConversion : null;
    const months = RAMP.map((f, i) => {
      const v = visitors * f;
      const conv = (v * n(convRate)) / 100;
      const rev = conv * n(orderValue);
      const monthNet = (rev * n(margin)) / 100 - c;
      return { month: i + 1, visitors: v, conversions: conv, revenue: rev, net: monthNet };
    });
    let cumulative = 0;
    const rows = months.map((m) => {
      cumulative += m.net;
      return { ...m, cumulative };
    });
    const totals = rows.reduce(
      (a, r) => ({ visitors: a.visitors + r.visitors, conversions: a.conversions + r.conversions, revenue: a.revenue + r.revenue, net: a.net + r.net }),
      { visitors: 0, conversions: 0, revenue: 0, net: 0 }
    );
    return { visitors, conversions, revenue, grossProfit, net, roi, breakEven, rows, totals };
  }, [cost, volume, ctr, convRate, orderValue, margin]);

  const fields: { label: string; value: string; set: (v: string) => void }[] = [
    { label: s('roiCost'), value: cost, set: setCost },
    { label: s('roiVolume'), value: volume, set: setVolume },
    { label: s('roiCtr'), value: ctr, set: setCtr },
    { label: s('roiConvRate'), value: convRate, set: setConvRate },
    { label: s('roiOrderValue'), value: orderValue, set: setOrderValue },
    { label: s('roiMargin'), value: margin, set: setMargin },
  ];

  return (
    <SeoCard tool={tool} note={s('roiNote')}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <OptLabel>{f.label}</OptLabel>
            <OptInput type="number" min="0" value={f.value} onChange={(e) => f.set(e.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        <Stat label={s('visitorsPerMonth')} value={numFmt.format(Math.round(calc.visitors))} />
        <Stat label={s('conversionsPerMonth')} value={numFmt.format(Math.round(calc.conversions))} />
        <Stat label={s('revenuePerMonth')} value={moneyFmt.format(calc.revenue)} />
        <Stat label={s('grossProfitPerMonth')} value={moneyFmt.format(calc.grossProfit)} />
        <Stat label={s('netPerMonth')} value={moneyFmt.format(calc.net)} />
        <Stat label="ROI" value={`${calc.roi.toFixed(1)}%`} />
        <Stat label={s('breakEvenConversions')} value={calc.breakEven === null ? ' ' : numFmt.format(Math.ceil(calc.breakEven))} />
      </div>
      <div className="mt-4">
        <OptLabel>{s('projection12')}</OptLabel>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-start">
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('monthCol')}</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('visitorsCol')}</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('conversionsCol')}</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('revenueCol')}</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('netProfitCol')}</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">{s('cumulativeNetCol')}</th>
              </tr>
            </thead>
            <tbody>
              {calc.rows.map((r) => (
                <tr key={r.month} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-1.5 text-gray-800 dark:text-gray-100 font-semibold">{r.month}</td>
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{numFmt.format(Math.round(r.visitors))}</td>
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{numFmt.format(Math.round(r.conversions))}</td>
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{moneyFmt.format(r.revenue)}</td>
                  <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{moneyFmt.format(r.net)}</td>
                  <td className={`px-3 py-1.5 font-semibold ${r.cumulative >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{moneyFmt.format(r.cumulative)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold">
                <td className="px-3 py-2 text-gray-900 dark:text-white">{c('total')}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{numFmt.format(Math.round(calc.totals.visitors))}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{numFmt.format(Math.round(calc.totals.conversions))}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{moneyFmt.format(calc.totals.revenue)}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{moneyFmt.format(calc.totals.net)}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white"> </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Code Minifier
// ---------------------------------------------------------------------------

type MinifyMode = 'html' | 'css' | 'js';
const MINIFY_FILES: Record<MinifyMode, string> = { html: 'minified.html', css: 'styles.min.css', js: 'script.min.js' };

export const CodeMinifier: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SEO_STRINGS);
  const c = useStrings(COMMON);
  const lang = useLang();
  const numFmt = useMemo(() => new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }), [lang]);
  const [mode, setMode] = useState<MinifyMode>('html');
  const [input, setInput] = useState('');
  const [removeComments, setRemoveComments] = useState(true);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      const out = mode === 'html' ? minifyHtml(input, removeComments) : mode === 'css' ? minifyCss(input) : minifyJs(input);
      return { output: out, error: '' };
    } catch (e: any) {
      return { output: '', error: e?.message || 'minify-failed' };
    }
  }, [input, mode, removeComments]);

  const beforeBytes = new Blob([input]).size;
  const afterBytes = new Blob([output]).size;
  const savedPct = beforeBytes ? Math.round((1 - afterBytes / beforeBytes) * 1000) / 10 : 0;

  return (
    <SeoCard tool={tool} note={s('minifyNote')}>
      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <div className="max-w-xs">
          <OptLabel>{s('codeType')}</OptLabel>
          <OptSelect value={mode} onChange={(e) => setMode(e.target.value as MinifyMode)}>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="js">JavaScript</option>
          </OptSelect>
        </div>
        {mode === 'html' && <OptCheck label={s('removeComments')} checked={removeComments} onChange={setRemoveComments} />}
      </div>
      <div className="mt-3">
        <OptLabel>{c('input')}</OptLabel>
        <SeoTextarea dir="ltr" rows={9} value={input} onChange={(e) => setInput(e.target.value)} placeholder={s('pasteCodeHere')} />
      </div>
      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error === 'minify-failed' ? s('minifyFailed') : error}</span>
        </div>
      )}
      {input && !error && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label={s('beforeWord')} value={`${numFmt.format(beforeBytes)} B`} />
            <Stat label={s('afterWord')} value={`${numFmt.format(afterBytes)} B`} />
            <Stat label={s('savedWord')} value={`${savedPct}%`} />
          </div>
          <div className="mt-3">
            <OptLabel>{s('minifiedOutput')}</OptLabel>
            <SeoTextarea dir="ltr" rows={9} readOnly value={output} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={output} label={s('copyMinified')} />
            <DownloadBtn content={output} filename={MINIFY_FILES[mode]} label={`${c('download')} ${MINIFY_FILES[mode]}`} />
          </div>
        </>
      )}
    </SeoCard>
  );
};
