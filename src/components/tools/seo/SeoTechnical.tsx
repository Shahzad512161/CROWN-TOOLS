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

// ---------------------------------------------------------------------------
// 1. Link Extractor
// ---------------------------------------------------------------------------

const csvEscape = (s: string) => `"${s.replace(/"/g, '""')}"`;

export const LinkExtractor: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    <SeoCard tool={tool} note="Extraction reads the HTML you paste — anchor text, rel attributes and follow status come straight from the markup. Internal/external is only classified when you provide the page URL.">
      <OptLabel>Page HTML</OptLabel>
      <SeoTextarea rows={8} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Paste the full page HTML here…" />
      <div className="grid sm:grid-cols-2 gap-3 mt-3 items-end">
        <div>
          <OptLabel>Page URL (optional — enables internal/external detection)</OptLabel>
          <OptInput value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} placeholder="https://example.com/page" />
        </div>
        <OptCheck label="Unique URLs only" checked={uniqueOnly} onChange={setUniqueOnly} />
      </div>

      {links.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
            <Stat label="Total links" value={links.length} />
            <Stat label="Internal" value={internal} />
            <Stat label="External" value={external} />
            <Stat label="Dofollow" value={dofollow} />
            <Stat label="Nofollow" value={nofollow} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={urlsText} label="Copy all URLs" />
            <DownloadBtn content={csv} filename="links.csv" mime="text/csv" label="Download CSV" />
          </div>
          <div className="overflow-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-xl mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Anchor</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">URL</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Type</th>
                  <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Rel</th>
                </tr>
              </thead>
              <tbody>
                {links.map((l, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-3 py-1.5 max-w-[160px] truncate text-gray-800 dark:text-gray-100">{l.anchor || '(no anchor text)'}</td>
                    <td className="px-3 py-1.5 max-w-[260px] truncate text-gray-600 dark:text-gray-300" title={l.href}>{l.href}</td>
                    <td className="px-3 py-1.5">
                      {l.internal === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${l.internal ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300' : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'}`}>
                          {l.internal ? 'Internal' : 'External'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600 dark:text-gray-300">{l.rel || (l.follow ? 'dofollow' : '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-500 mt-3">Paste some HTML above and every link in it will be listed here.</p>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Robots.txt Tester
// ---------------------------------------------------------------------------

const AGENT_CHIPS = ['Googlebot', 'Bingbot', '*'];

export const RobotsTxtTester: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    <SeoCard tool={tool} note="Matching follows the robots.txt spec (RFC 9309): the longest matching rule wins, Allow wins ties, * is a wildcard and $ anchors the end of the URL. The group for the exact user-agent is used when present, otherwise the * group.">
      <OptLabel>robots.txt content</OptLabel>
      <SeoTextarea rows={8} value={robots} onChange={(e) => setRobots(e.target.value)} placeholder={'User-agent: *\nDisallow: /private/'} />
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <OptLabel>User-agent to test as</OptLabel>
          <OptInput value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="Googlebot" />
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
          <OptLabel>URLs to test (one per line)</OptLabel>
          <SeoTextarea rows={4} value={urlsText} onChange={(e) => setUrlsText(e.target.value)} placeholder={'https://example.com/admin/\nhttps://example.com/admin/public\n/products/shoes'} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat label="Rule groups" value={parsed.groups.length} />
        <Stat label="Total rules" value={totalRules} />
        <Stat label="Sitemaps declared" value={parsed.sitemaps.length} />
      </div>
      {results.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {results.map((r, i) => (
            <li key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${r.allowed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300'}`}>
                {r.allowed ? 'Allowed' : 'Blocked'}
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-200 truncate">{r.url}</span>
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
  const [xml, setXml] = useState('');
  const result = useMemo(() => (xml.trim() ? validateSitemapXml(xml) : null), [xml]);

  return (
    <SeoCard tool={tool} note="Validation checks the sitemap protocol rules that can be verified from the file itself: XML structure, absolute URLs, valid lastmod/changefreq/priority values, duplicates and the 50,000-URL limit. It does not fetch the URLs to check they are live.">
      <OptLabel>Sitemap XML</OptLabel>
      <SeoTextarea rows={10} value={xml} onChange={(e) => setXml(e.target.value)} placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://example.com/</loc></url>\n</urlset>'} />
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-gray-500">…or load a file:</span>
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
            <Stat label="URL count" value={result.urlCount} />
            <Stat label="Type" value={result.isIndex ? 'Sitemap index' : 'URL set'} />
            <Stat label="Errors" value={result.errors.length} />
            <Stat label="Warnings" value={result.warnings.length} />
          </div>
          {result.errors.length === 0 && result.warnings.length === 0 && (
            <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>This sitemap is valid.</span>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="mt-3">
              <OptLabel>Errors</OptLabel>
              <ul className="space-y-1.5">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div className="mt-3">
              <OptLabel>Warnings</OptLabel>
              <ul className="space-y-1.5">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">{w}</li>
                ))}
              </ul>
            </div>
          )}
          {result.duplicates.length > 0 && (
            <div className="mt-3">
              <OptLabel>Duplicate URLs ({result.duplicates.length})</OptLabel>
              <ul className="space-y-1">
                {result.duplicates.slice(0, 20).map((d, i) => (
                  <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{d}</li>
                ))}
              </ul>
              {result.duplicates.length > 20 && <p className="text-[11px] text-gray-500 mt-1">…and {result.duplicates.length - 20} more.</p>}
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
  const [text, setText] = useState('');
  const result = useMemo(() => (text.trim() ? analyzeRedirectMap(text) : null), [text]);
  const flattenedText = result ? result.flattened.map((f) => `${f.from} ${f.to}`).join('\n') : '';

  return (
    <SeoCard tool={tool} note="Paste a redirect map to audit it — this checks the map itself; fetching live redirect chains from a server needs that server to allow cross-origin requests.">
      <OptLabel>Redirect map — one rule per line: old-url new-url (spaces, commas or semicolons)</OptLabel>
      <SeoTextarea
        rows={9}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={'/old-page /newer-page\n/newer-page /newest-page\n/blog/old-post /blog/new-post'}
      />
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label="Rules" value={result.pairs.length} />
            <Stat label="Chains found" value={result.chains.length} />
            <Stat label="Loops found" value={result.loops.length} />
            <Stat label="Duplicate sources" value={result.duplicateSources.length} />
          </div>

          {result.chains.length > 0 && (
            <div className="mt-4">
              <OptLabel>Chains (collapse these to a single hop)</OptLabel>
              <div className="space-y-2">
                {result.chains.map((c, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                    {c.path.map((seg, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                        <span className="text-[11px] font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-0.5 text-gray-800 dark:text-gray-100">{seg}</span>
                      </React.Fragment>
                    ))}
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">{c.hops} hops</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.loops.length > 0 && (
            <div className="mt-4">
              <OptLabel>Loops (fix these first — they never resolve)</OptLabel>
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
              <OptLabel>Duplicate sources (first rule wins)</OptLabel>
              <ul className="space-y-1">
                {result.duplicateSources.map((d, i) => (
                  <li key={i} className="text-[11px] text-gray-600 dark:text-gray-300 truncate">{d}</li>
                ))}
              </ul>
            </div>
          )}

          {result.invalidLines.length > 0 && (
            <div className="mt-4">
              <OptLabel>Invalid lines (skipped)</OptLabel>
              <ul className="space-y-1">
                {result.invalidLines.map((l, i) => (
                  <li key={i} className="text-[11px] text-gray-400 truncate">{l}</li>
                ))}
              </ul>
            </div>
          )}

          {result.flattened.length > 0 && (
            <div className="mt-4">
              <OptLabel>Flattened map — every source pointed straight at its final URL</OptLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                <CopyBtn text={flattenedText} label="Copy flattened map" />
                <DownloadBtn content={flattenedText} filename="redirect-map-flattened.txt" label="Download flattened map" />
              </div>
              <div className="overflow-auto max-h-80 border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">From</th>
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Final URL</th>
                      <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Hops</th>
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
  const [text, setText] = useState('');
  const keywords = useMemo(() => text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean), [text]);
  const clusters = useMemo(() => (keywords.length ? clusterKeywords(keywords) : []), [keywords]);
  const largest = clusters.reduce((a, c) => Math.max(a, c.keywords.length), 0);
  const singletons = clusters.filter((c) => c.keywords.length === 1).length;
  const exportText = clusters.map((c) => `## ${c.label} (${c.keywords.length})\n${c.keywords.join('\n')}`).join('\n\n');

  return (
    <SeoCard tool={tool} note="Keywords are grouped when they share at least two words, or one is a subset of the other — a fast topical grouping for planning content hubs. It is a heuristic, not a SERP-overlap analysis.">
      <OptLabel>Keywords (one per line)</OptLabel>
      <SeoTextarea rows={9} value={text} onChange={(e) => setText(e.target.value)} placeholder={'buy running shoes\nbest running shoes for men\nrunning shoes sale\nhow to boil eggs\nboiled egg time'} />
      {clusters.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <Stat label="Keywords in" value={keywords.length} />
            <Stat label="Clusters out" value={clusters.length} />
            <Stat label="Largest cluster" value={largest} />
            <Stat label="Singletons" value={singletons} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={exportText} label="Copy clusters" />
            <DownloadBtn content={exportText} filename="keyword-clusters.txt" label="Download clusters" />
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
    <SeoCard tool={tool} note="Combines List A × List B (and × List C) in list order — every keyword in one list is paired with every keyword in the next, space-joined. Duplicates within a list are removed first.">
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <OptLabel>List A</OptLabel>
          <SeoTextarea rows={6} value={listA} onChange={(e) => setListA(e.target.value)} placeholder={'buy\nbest\ncheap'} />
        </div>
        <div>
          <OptLabel>List B (optional)</OptLabel>
          <SeoTextarea rows={6} value={listB} onChange={(e) => setListB(e.target.value)} placeholder={'running shoes\ntrail shoes'} />
        </div>
        <div>
          <OptLabel>List C (optional)</OptLabel>
          <SeoTextarea rows={6} value={listC} onChange={(e) => setListC(e.target.value)} placeholder={'online\nnear me'} />
        </div>
      </div>
      <div className="max-w-xs mt-3">
        <OptLabel>Match type</OptLabel>
        <OptSelect value={matchType} onChange={(e) => setMatchType(e.target.value as MatchType)}>
          <option value="none">None</option>
          <option value="broad">Broad match</option>
          <option value="phrase">Phrase match</option>
          <option value="exact">Exact match</option>
          <option value="bmm">Broad match modifier</option>
        </OptSelect>
      </div>
      {capped && (
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>The full combination would exceed 10,000 keywords — the input lists were trimmed so generation is capped at 10,000 results.</span>
        </div>
      )}
      {results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
            <Stat label="Combined keywords" value={results.length} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={resultsText} label="Copy all" />
            <DownloadBtn content={resultsText} filename="combined-keywords.txt" label="Download .txt" />
          </div>
          <OptLabel>Preview (first 200)</OptLabel>
          <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-[11px] text-gray-700 dark:text-gray-200 max-h-72 overflow-auto whitespace-pre-wrap">
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
const moneyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export const SeoRoiCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    { label: 'Monthly SEO cost ($)', value: cost, set: setCost },
    { label: 'Monthly search volume of target keywords', value: volume, set: setVolume },
    { label: 'Expected CTR (%)', value: ctr, set: setCtr },
    { label: 'Conversion rate (%)', value: convRate, set: setConvRate },
    { label: 'Average order / lead value ($)', value: orderValue, set: setOrderValue },
    { label: 'Gross margin (%)', value: margin, set: setMargin },
  ];

  return (
    <SeoCard tool={tool} note="Projections are estimates based on your inputs and an assumed 12-month traffic ramp (10% of steady traffic in month 1, reaching 100% by month 10) — they are not guarantees of rankings, traffic or revenue.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((f) => (
          <div key={f.label}>
            <OptLabel>{f.label}</OptLabel>
            <OptInput type="number" min="0" value={f.value} onChange={(e) => f.set(e.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        <Stat label="Visitors / month" value={numFmt.format(Math.round(calc.visitors))} />
        <Stat label="Conversions / month" value={numFmt.format(Math.round(calc.conversions))} />
        <Stat label="Revenue / month" value={moneyFmt.format(calc.revenue)} />
        <Stat label="Gross profit / month" value={moneyFmt.format(calc.grossProfit)} />
        <Stat label="Net / month" value={moneyFmt.format(calc.net)} />
        <Stat label="ROI" value={`${calc.roi.toFixed(1)}%`} />
        <Stat label="Break-even conversions" value={calc.breakEven === null ? '—' : numFmt.format(Math.ceil(calc.breakEven))} />
      </div>
      <div className="mt-4">
        <OptLabel>12-month projection (ramped)</OptLabel>
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
          <table className="w-full text-xs tabular-nums">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Month</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Visitors</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Conversions</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Revenue</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Net profit</th>
                <th className="px-3 py-2 font-bold text-gray-700 dark:text-gray-200">Cumulative net</th>
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
                <td className="px-3 py-2 text-gray-900 dark:text-white">Total</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{numFmt.format(Math.round(calc.totals.visitors))}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{numFmt.format(Math.round(calc.totals.conversions))}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{moneyFmt.format(calc.totals.revenue)}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{moneyFmt.format(calc.totals.net)}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">—</td>
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
  const [mode, setMode] = useState<MinifyMode>('html');
  const [input, setInput] = useState('');
  const [removeComments, setRemoveComments] = useState(true);

  const { output, error } = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      const out = mode === 'html' ? minifyHtml(input, removeComments) : mode === 'css' ? minifyCss(input) : minifyJs(input);
      return { output: out, error: '' };
    } catch (e: any) {
      return { output: '', error: e?.message || 'Minification failed.' };
    }
  }, [input, mode, removeComments]);

  const beforeBytes = new Blob([input]).size;
  const afterBytes = new Blob([output]).size;
  const savedPct = beforeBytes ? Math.round((1 - afterBytes / beforeBytes) * 1000) / 10 : 0;

  return (
    <SeoCard tool={tool} note="The JavaScript minifier is conservative: it strips comments and blank lines and collapses runs of spaces, but keeps the line structure so automatic semicolon insertion stays safe — it does not rename variables or rewrite code. HTML minification preserves <pre>, <textarea>, <script> and <style> blocks.">
      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <div className="max-w-xs">
          <OptLabel>Code type</OptLabel>
          <OptSelect value={mode} onChange={(e) => setMode(e.target.value as MinifyMode)}>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="js">JavaScript</option>
          </OptSelect>
        </div>
        {mode === 'html' && <OptCheck label="Remove comments" checked={removeComments} onChange={setRemoveComments} />}
      </div>
      <div className="mt-3">
        <OptLabel>Input</OptLabel>
        <SeoTextarea rows={9} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your code here…" />
      </div>
      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {input && !error && (
        <>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="Before" value={`${numFmt.format(beforeBytes)} B`} />
            <Stat label="After" value={`${numFmt.format(afterBytes)} B`} />
            <Stat label="Saved" value={`${savedPct}%`} />
          </div>
          <div className="mt-3">
            <OptLabel>Minified output</OptLabel>
            <SeoTextarea rows={9} readOnly value={output} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <CopyBtn text={output} label="Copy minified code" />
            <DownloadBtn content={output} filename={MINIFY_FILES[mode]} label={`Download ${MINIFY_FILES[mode]}`} />
          </div>
        </>
      )}
    </SeoCard>
  );
};
