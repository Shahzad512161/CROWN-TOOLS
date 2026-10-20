import React, { useMemo, useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  buildRobotsTxt,
  buildSitemapXml,
  buildUtmUrl,
  buildHreflangLinkTags,
  buildHreflangSitemap,
} from '../../../lib/seo/core';
import type { RobotsGroup, SitemapUrl, HreflangEntry } from '../../../lib/seo/core';
import {
  SeoCard,
  SeoTextarea,
  PrimaryBtn,
  CopyBtn,
  DownloadBtn,
  Stat,
  OptLabel,
  OptInput,
  OptSelect,
} from './SeoShell';

const PRE_CLASS =
  'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap break-all';

let uid = 1;
const nextId = () => uid++;

const escAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const domainOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

// Small remove-row button reused by the list editors below.
const RemoveBtn: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-gray-200 dark:border-gray-700 cursor-pointer shrink-0"
  >
    <X className="w-4 h-4" />
  </button>
);

const AddRowBtn: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
  >
    <Plus className="w-3.5 h-3.5" />
    {children}
  </button>
);

// ---------------------------------------------------------------------------
// 1. Meta Tag Generator
// ---------------------------------------------------------------------------

const CharMeter: React.FC<{ len: number; min: number; max: number }> = ({ len, min, max }) => {
  const inRange = len >= min && len <= max;
  const cls = len === 0 ? 'text-gray-400' : inRange ? 'text-emerald-600' : 'text-amber-600';
  return (
    <span className={`text-[11px] font-semibold ${cls}`}>
      {len} characters · ideal {min}–{max}
      {inRange ? ' · good length' : len > max ? ' · too long, may be truncated' : len > 0 ? ' · a bit short' : ''}
    </span>
  );
};

export const MetaTagGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [canonical, setCanonical] = useState('');
  const [robots, setRobots] = useState('index, follow');
  const [themeColor, setThemeColor] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogType, setOgType] = useState('website');
  const [twitterHandle, setTwitterHandle] = useState('');

  const output = useMemo(() => {
    const lines: string[] = ['<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">'];
    if (title.trim()) lines.push(`<title>${escAttr(title.trim())}</title>`);
    if (description.trim()) lines.push(`<meta name="description" content="${escAttr(description.trim())}">`);
    if (keywords.trim()) lines.push(`<meta name="keywords" content="${escAttr(keywords.trim())}">`);
    if (author.trim()) lines.push(`<meta name="author" content="${escAttr(author.trim())}">`);
    lines.push(`<meta name="robots" content="${robots}">`);
    if (canonical.trim()) lines.push(`<link rel="canonical" href="${escAttr(canonical.trim())}">`);
    if (themeColor.trim()) lines.push(`<meta name="theme-color" content="${escAttr(themeColor.trim())}">`);
    if (title.trim() || description.trim() || ogImage.trim()) {
      lines.push('');
      lines.push('<!-- Open Graph -->');
      if (title.trim()) lines.push(`<meta property="og:title" content="${escAttr(title.trim())}">`);
      if (description.trim()) lines.push(`<meta property="og:description" content="${escAttr(description.trim())}">`);
      if (ogImage.trim()) lines.push(`<meta property="og:image" content="${escAttr(ogImage.trim())}">`);
      lines.push(`<meta property="og:type" content="${ogType}">`);
      lines.push('');
      lines.push('<!-- Twitter Card -->');
      lines.push('<meta name="twitter:card" content="summary_large_image">');
      if (title.trim()) lines.push(`<meta name="twitter:title" content="${escAttr(title.trim())}">`);
      if (description.trim()) lines.push(`<meta name="twitter:description" content="${escAttr(description.trim())}">`);
      if (ogImage.trim()) lines.push(`<meta name="twitter:image" content="${escAttr(ogImage.trim())}">`);
      const handle = twitterHandle.trim().replace(/^@/, '');
      if (handle) lines.push(`<meta name="twitter:site" content="@${escAttr(handle)}">`);
    }
    return lines.join('\n');
  }, [title, description, keywords, author, canonical, robots, themeColor, ogImage, ogType, twitterHandle]);

  return (
    <SeoCard tool={tool} note="Paste the generated tags into the <head> of your page. Titles around 30–60 characters and descriptions around 70–160 characters display fully in most search results.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <OptLabel>Page title</OptLabel>
          <OptInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Page Title — Brand" />
          <div className="mt-1"><CharMeter len={title.length} min={30} max={60} /></div>
        </div>
        <div className="sm:col-span-2">
          <OptLabel>Meta description</OptLabel>
          <SeoTextarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short, honest summary of the page that earns the click." />
          <div className="mt-1"><CharMeter len={description.length} min={70} max={160} /></div>
        </div>
        <div>
          <OptLabel>Keywords (comma separated, optional)</OptLabel>
          <OptInput value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword one, keyword two" />
        </div>
        <div>
          <OptLabel>Author (optional)</OptLabel>
          <OptInput value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author or site name" />
        </div>
        <div>
          <OptLabel>Canonical URL (optional)</OptLabel>
          <OptInput value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="https://example.com/page" />
        </div>
        <div>
          <OptLabel>Robots directive</OptLabel>
          <OptSelect value={robots} onChange={(e) => setRobots(e.target.value)}>
            <option value="index, follow">index, follow</option>
            <option value="noindex, follow">noindex, follow</option>
            <option value="index, nofollow">index, nofollow</option>
            <option value="noindex, nofollow">noindex, nofollow</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Open Graph image URL (optional)</OptLabel>
          <OptInput value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/share.jpg" />
        </div>
        <div>
          <OptLabel>Open Graph type</OptLabel>
          <OptSelect value={ogType} onChange={(e) => setOgType(e.target.value)}>
            <option value="website">website</option>
            <option value="article">article</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Theme color (optional)</OptLabel>
          <OptInput value={themeColor} onChange={(e) => setThemeColor(e.target.value)} placeholder="#16a34a" />
        </div>
        <div>
          <OptLabel>Twitter / X handle (optional)</OptLabel>
          <OptInput value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@yoursite" />
        </div>
      </div>
      <div className="mt-5">
        <OptLabel>Generated tags</OptLabel>
        <pre className={PRE_CLASS}>{output}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={output} label="Copy meta tags" />
          <DownloadBtn content={output} filename="meta-tags.html" mime="text/html" label="Download .html" />
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Open Graph Generator
// ---------------------------------------------------------------------------

export const OpenGraphGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogType, setOgType] = useState('website');
  const [siteName, setSiteName] = useState('');
  const [locale, setLocale] = useState('en_US');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [twitterSite, setTwitterSite] = useState('');

  const output = useMemo(() => {
    const lines: string[] = [];
    if (ogTitle.trim()) lines.push(`<meta property="og:title" content="${escAttr(ogTitle.trim())}">`);
    if (ogDescription.trim()) lines.push(`<meta property="og:description" content="${escAttr(ogDescription.trim())}">`);
    if (ogImage.trim()) lines.push(`<meta property="og:image" content="${escAttr(ogImage.trim())}">`);
    lines.push(`<meta property="og:type" content="${ogType}">`);
    if (siteName.trim()) lines.push(`<meta property="og:site_name" content="${escAttr(siteName.trim())}">`);
    if (locale.trim()) lines.push(`<meta property="og:locale" content="${escAttr(locale.trim())}">`);
    lines.push(`<meta name="twitter:card" content="${twitterCard}">`);
    const handle = twitterSite.trim().replace(/^@/, '');
    if (handle) lines.push(`<meta name="twitter:site" content="@${escAttr(handle)}">`);
    if (ogTitle.trim()) lines.push(`<meta name="twitter:title" content="${escAttr(ogTitle.trim())}">`);
    if (ogDescription.trim()) lines.push(`<meta name="twitter:description" content="${escAttr(ogDescription.trim())}">`);
    if (ogImage.trim()) lines.push(`<meta name="twitter:image" content="${escAttr(ogImage.trim())}">`);
    return lines.join('\n');
  }, [ogTitle, ogDescription, ogImage, ogType, siteName, locale, twitterCard, twitterSite]);

  const domain = domainOf(ogImage) || siteName.trim();
  const hideImg = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <SeoCard tool={tool} note="Open Graph tags control how your page looks when shared on Facebook, LinkedIn, WhatsApp and most other platforms. A 1200 × 630 image works best.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>Title (og:title)</OptLabel>
          <OptInput value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Page title for shares" />
        </div>
        <div>
          <OptLabel>Site name (og:site_name)</OptLabel>
          <OptInput value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Example Site" />
        </div>
        <div className="sm:col-span-2">
          <OptLabel>Description (og:description)</OptLabel>
          <SeoTextarea rows={2} value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} placeholder="One or two sentences shown under the title in shares." />
        </div>
        <div className="sm:col-span-2">
          <OptLabel>Image URL (og:image)</OptLabel>
          <OptInput value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/share.jpg" />
        </div>
        <div>
          <OptLabel>Type (og:type)</OptLabel>
          <OptSelect value={ogType} onChange={(e) => setOgType(e.target.value)}>
            <option value="website">website</option>
            <option value="article">article</option>
            <option value="product">product</option>
            <option value="profile">profile</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Locale (og:locale)</OptLabel>
          <OptInput value={locale} onChange={(e) => setLocale(e.target.value)} placeholder="en_US" />
        </div>
        <div>
          <OptLabel>Twitter card type</OptLabel>
          <OptSelect value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)}>
            <option value="summary_large_image">summary_large_image</option>
            <option value="summary">summary</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Twitter site handle</OptLabel>
          <OptInput value={twitterSite} onChange={(e) => setTwitterSite(e.target.value)} placeholder="@yoursite" />
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        <div>
          <OptLabel>Facebook / LinkedIn style preview</OptLabel>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 max-w-md">
            {ogImage.trim() && (
              <img key={ogImage} src={ogImage} alt="" onError={hideImg} className="w-full aspect-[1200/630] object-cover bg-gray-100 dark:bg-gray-800" />
            )}
            <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2.5">
              {domain && <div className="text-[11px] uppercase tracking-wide text-gray-500 truncate">{domain}</div>}
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{ogTitle || 'Your page title'}</div>
              <div className="text-xs text-gray-500 leading-snug line-clamp-2">{ogDescription || 'Your share description will appear here.'}</div>
            </div>
          </div>
        </div>
        <div>
          <OptLabel>X (Twitter) style preview</OptLabel>
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 max-w-md flex">
            {ogImage.trim() && (
              <img key={`x-${ogImage}`} src={ogImage} alt="" onError={hideImg} className="w-24 h-24 object-cover bg-gray-100 dark:bg-gray-800 shrink-0" />
            )}
            <div className="px-3 py-2.5 min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{ogTitle || 'Your page title'}</div>
              <div className="text-xs text-gray-500 leading-snug line-clamp-2">{ogDescription || 'Your share description will appear here.'}</div>
              {domain && <div className="text-[11px] text-gray-400 truncate mt-0.5">{domain}</div>}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Previews are approximations — each platform crops and truncates slightly differently.</p>
        </div>
      </div>

      <div className="mt-5">
        <OptLabel>Generated tags</OptLabel>
        <pre className={PRE_CLASS}>{output}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={output} label="Copy OG tags" />
          <DownloadBtn content={output} filename="open-graph-tags.html" mime="text/html" label="Download .html" />
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Robots.txt Generator
// ---------------------------------------------------------------------------

interface RobotsRuleRow {
  id: number;
  type: 'allow' | 'disallow';
  path: string;
}

interface RobotsGroupRow {
  id: number;
  agent: string;
  rules: RobotsRuleRow[];
  crawlDelay: string;
}

const AGENT_CHIPS = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'ClaudeBot'];

const blankRule = (): RobotsRuleRow => ({ id: nextId(), type: 'disallow', path: '' });
const blankGroup = (): RobotsGroupRow => ({ id: nextId(), agent: '*', rules: [blankRule()], crawlDelay: '' });

export const RobotsTxtGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [groups, setGroups] = useState<RobotsGroupRow[]>([blankGroup()]);
  const [sitemaps, setSitemaps] = useState<{ id: number; url: string }[]>([{ id: nextId(), url: '' }]);

  const output = useMemo(() => {
    const built: RobotsGroup[] = groups.map((g) => {
      const delay = parseFloat(g.crawlDelay);
      return {
        agents: [g.agent.trim() || '*'],
        rules: g.rules.filter((r) => r.path.trim()).map((r) => ({ type: r.type, path: r.path.trim() })),
        crawlDelay: g.crawlDelay.trim() && !Number.isNaN(delay) ? delay : undefined,
      };
    });
    return buildRobotsTxt(built, sitemaps.map((s) => s.url.trim()).filter(Boolean));
  }, [groups, sitemaps]);

  const patchGroup = (i: number, patch: Partial<RobotsGroupRow>) =>
    setGroups((gs) => gs.map((g, gi) => (gi === i ? { ...g, ...patch } : g)));
  const patchRule = (gi: number, ri: number, patch: Partial<RobotsRuleRow>) =>
    setGroups((gs) =>
      gs.map((g, i) => (i === gi ? { ...g, rules: g.rules.map((r, j) => (j === ri ? { ...r, ...patch } : r)) } : g))
    );

  const applyPreset = (preset: 'allow-all' | 'block-all' | 'block-admin') => {
    if (preset === 'allow-all') setGroups([{ id: nextId(), agent: '*', rules: [], crawlDelay: '' }]);
    if (preset === 'block-all')
      setGroups([{ id: nextId(), agent: '*', rules: [{ id: nextId(), type: 'disallow', path: '/' }], crawlDelay: '' }]);
    if (preset === 'block-admin')
      setGroups([
        {
          id: nextId(),
          agent: '*',
          rules: [
            { id: nextId(), type: 'disallow', path: '/wp-admin/' },
            { id: nextId(), type: 'allow', path: '/wp-admin/admin-ajax.php' },
            { id: nextId(), type: 'disallow', path: '/wp-login.php' },
            { id: nextId(), type: 'disallow', path: '/admin/' },
            { id: nextId(), type: 'disallow', path: '/search/' },
          ],
          crawlDelay: '',
        },
      ]);
  };

  return (
    <SeoCard tool={tool} note="Upload the finished file as robots.txt in your site's root so it is reachable at yourdomain.com/robots.txt. A Disallow with an empty path (no rules in a group) means everything is allowed.">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 py-2">Presets:</span>
        <AddRowBtn onClick={() => applyPreset('allow-all')}>Allow everything</AddRowBtn>
        <AddRowBtn onClick={() => applyPreset('block-all')}>Block everything</AddRowBtn>
        <AddRowBtn onClick={() => applyPreset('block-admin')}>Block admin &amp; login areas</AddRowBtn>
      </div>

      <div className="space-y-4">
        {groups.map((g, gi) => (
          <div key={g.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/60 dark:bg-gray-800/40">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grow min-w-44">
                <OptLabel>User-agent</OptLabel>
                <OptInput value={g.agent} onChange={(e) => patchGroup(gi, { agent: e.target.value })} placeholder="*" />
              </div>
              <div className="w-36">
                <OptLabel>Crawl-delay (optional)</OptLabel>
                <OptInput type="number" min="0" step="1" value={g.crawlDelay} onChange={(e) => patchGroup(gi, { crawlDelay: e.target.value })} placeholder="e.g. 10" />
              </div>
              {groups.length > 1 && (
                <RemoveBtn onClick={() => setGroups((gs) => gs.filter((_, i) => i !== gi))} label="Remove group" />
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {AGENT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => patchGroup(gi, { agent: chip })}
                  className={`px-2 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                    g.agent === chip
                      ? 'bg-green-600 text-white border-green-700'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-3">
              {g.rules.map((r, ri) => (
                <div key={r.id} className="flex items-center gap-2">
                  <div className="w-32 shrink-0">
                    <OptSelect value={r.type} onChange={(e) => patchRule(gi, ri, { type: e.target.value as 'allow' | 'disallow' })}>
                      <option value="disallow">Disallow</option>
                      <option value="allow">Allow</option>
                    </OptSelect>
                  </div>
                  <OptInput value={r.path} onChange={(e) => patchRule(gi, ri, { path: e.target.value })} placeholder="/private/" />
                  <RemoveBtn onClick={() => patchGroup(gi, { rules: g.rules.filter((_, j) => j !== ri) })} label="Remove rule" />
                </div>
              ))}
              <AddRowBtn onClick={() => patchGroup(gi, { rules: [...g.rules, blankRule()] })}>Add rule</AddRowBtn>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <AddRowBtn onClick={() => setGroups((gs) => [...gs, blankGroup()])}>Add user-agent group</AddRowBtn>
      </div>

      <div className="mt-5">
        <OptLabel>Sitemap URLs</OptLabel>
        <div className="space-y-2">
          {sitemaps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <OptInput
                value={s.url}
                onChange={(e) => setSitemaps((ss) => ss.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                placeholder="https://example.com/sitemap.xml"
              />
              {sitemaps.length > 1 && (
                <RemoveBtn onClick={() => setSitemaps((ss) => ss.filter((_, j) => j !== i))} label="Remove sitemap" />
              )}
            </div>
          ))}
          <AddRowBtn onClick={() => setSitemaps((ss) => [...ss, { id: nextId(), url: '' }])}>Add sitemap</AddRowBtn>
        </div>
      </div>

      <div className="mt-5">
        <OptLabel>Preview — robots.txt</OptLabel>
        <pre className={PRE_CLASS}>{output}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={output} label="Copy robots.txt" />
          <DownloadBtn content={output} filename="robots.txt" label="Download robots.txt" />
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 4. XML Sitemap Generator
// ---------------------------------------------------------------------------

export const XmlSitemapGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [urlsText, setUrlsText] = useState('');
  const [changefreq, setChangefreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [useToday, setUseToday] = useState(true);
  const [lastmodDate, setLastmodDate] = useState(todayStr);

  const { urls, skipped } = useMemo(() => {
    const out: SitemapUrl[] = [];
    let bad = 0;
    const lastmod = useToday ? todayStr : lastmodDate || undefined;
    for (const raw of urlsText.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      try {
        const u = new URL(line);
        if (!/^https?:$/.test(u.protocol)) throw new Error('protocol');
        out.push({ loc: u.toString(), lastmod, changefreq, priority });
      } catch {
        bad++;
      }
    }
    return { urls: out, skipped: bad };
  }, [urlsText, changefreq, priority, useToday, lastmodDate, todayStr]);

  const output = useMemo(() => (urls.length ? buildSitemapXml(urls) : ''), [urls]);

  return (
    <SeoCard tool={tool} note="A sitemap can hold up to 50,000 URLs per file. List each page once, use the canonical (final) URL, and submit the file in Google Search Console and Bing Webmaster Tools.">
      <OptLabel>Page URLs — one per line</OptLabel>
      <SeoTextarea
        rows={8}
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        placeholder={'https://example.com/\nhttps://example.com/about\nhttps://example.com/pricing'}
        className="font-mono text-xs"
      />
      <div className="grid sm:grid-cols-4 gap-4 mt-4">
        <div>
          <OptLabel>Default change frequency</OptLabel>
          <OptSelect value={changefreq} onChange={(e) => setChangefreq(e.target.value)}>
            {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map((cf) => (
              <option key={cf} value={cf}>{cf}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Default priority</OptLabel>
          <OptSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
            {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Last modified</OptLabel>
          <div className="flex items-center gap-2 h-10">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input type="checkbox" checked={useToday} onChange={(e) => setUseToday(e.target.checked)} className="accent-green-600 w-4 h-4" />
              Use today&apos;s date
            </label>
          </div>
        </div>
        <div>
          <OptLabel>Or pick a date</OptLabel>
          <OptInput type="date" value={lastmodDate} disabled={useToday} onChange={(e) => setLastmodDate(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Valid URLs" value={urls.length} />
        <Stat label="Lines skipped (invalid)" value={skipped} />
        <Stat label="Lastmod" value={useToday ? todayStr : lastmodDate || '—'} />
      </div>

      {output && (
        <div className="mt-5">
          <OptLabel>Generated sitemap.xml</OptLabel>
          <pre className={PRE_CLASS}>{output}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyBtn text={output} label="Copy sitemap" />
            <DownloadBtn content={output} filename="sitemap.xml" mime="application/xml" label="Download sitemap.xml" />
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Schema (JSON-LD) Generator
// ---------------------------------------------------------------------------

interface QaRow {
  id: number;
  q: string;
  a: string;
}
interface StepRow {
  id: number;
  name: string;
  text: string;
}
interface NameUrlRow {
  id: number;
  name: string;
  url: string;
}

const SCHEMA_TYPES = ['Article', 'FAQPage', 'HowTo', 'Product', 'LocalBusiness', 'BreadcrumbList', 'Organization', 'WebSite'] as const;
type SchemaType = (typeof SCHEMA_TYPES)[number];

const QaRowsEditor: React.FC<{ rows: QaRow[]; setRows: (r: QaRow[]) => void }> = ({ rows, setRows }) => (
  <div className="space-y-3">
    {rows.map((row, i) => (
      <div key={row.id} className="flex gap-2 items-start">
        <div className="grow grid sm:grid-cols-2 gap-2">
          <OptInput
            value={row.q}
            onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, q: e.target.value } : r)))}
            placeholder={`Question ${i + 1}`}
          />
          <OptInput
            value={row.a}
            onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, a: e.target.value } : r)))}
            placeholder="Answer"
          />
        </div>
        {rows.length > 1 && <RemoveBtn onClick={() => setRows(rows.filter((_, j) => j !== i))} label="Remove question" />}
      </div>
    ))}
    <AddRowBtn onClick={() => setRows([...rows, { id: nextId(), q: '', a: '' }])}>Add question</AddRowBtn>
  </div>
);

export const SchemaGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [schemaType, setSchemaType] = useState<SchemaType>('Article');

  // Article
  const [aHeadline, setAHeadline] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aImage, setAImage] = useState('');
  const [aAuthor, setAAuthor] = useState('');
  const [aPublisher, setAPublisher] = useState('');
  const [aDate, setADate] = useState('');
  // FAQ
  const [faqRows, setFaqRows] = useState<QaRow[]>([{ id: nextId(), q: '', a: '' }]);
  // HowTo
  const [hName, setHName] = useState('');
  const [hDesc, setHDesc] = useState('');
  const [steps, setSteps] = useState<StepRow[]>([{ id: nextId(), name: '', text: '' }]);
  // Product
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImage, setPImage] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCurrency, setPCurrency] = useState('USD');
  const [pAvailability, setPAvailability] = useState('https://schema.org/InStock');
  const [pRating, setPRating] = useState('');
  const [pReviews, setPReviews] = useState('');
  // LocalBusiness
  const [bName, setBName] = useState('');
  const [bType, setBType] = useState('LocalBusiness');
  const [bAddress, setBAddress] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bHours, setBHours] = useState('');
  const [bPriceRange, setBPriceRange] = useState('');
  // Breadcrumb
  const [crumbs, setCrumbs] = useState<NameUrlRow[]>([{ id: nextId(), name: '', url: '' }]);
  // Organization
  const [oName, setOName] = useState('');
  const [oUrl, setOUrl] = useState('');
  const [oLogo, setOLogo] = useState('');
  const [sameAs, setSameAs] = useState<{ id: number; url: string }[]>([{ id: nextId(), url: '' }]);
  // WebSite
  const [wName, setWName] = useState('');
  const [wUrl, setWUrl] = useState('');
  const [wSearch, setWSearch] = useState('');

  const { json, warnings } = useMemo(() => {
    const warn: string[] = [];
    const req = (label: string, v: string) => {
      if (!v.trim()) warn.push(label);
    };
    let obj: Record<string, unknown> = { '@context': 'https://schema.org' };

    if (schemaType === 'Article') {
      req('Headline', aHeadline);
      obj = {
        ...obj,
        '@type': 'Article',
        ...(aHeadline.trim() && { headline: aHeadline.trim() }),
        ...(aDesc.trim() && { description: aDesc.trim() }),
        ...(aImage.trim() && { image: aImage.trim() }),
        ...(aAuthor.trim() && { author: { '@type': 'Person', name: aAuthor.trim() } }),
        ...(aPublisher.trim() && { publisher: { '@type': 'Organization', name: aPublisher.trim() } }),
        ...(aDate && { datePublished: aDate }),
      };
    } else if (schemaType === 'FAQPage') {
      const items = faqRows.filter((r) => r.q.trim() && r.a.trim());
      if (!items.length) warn.push('At least one complete question & answer');
      obj = {
        ...obj,
        '@type': 'FAQPage',
        mainEntity: items.map((r) => ({
          '@type': 'Question',
          name: r.q.trim(),
          acceptedAnswer: { '@type': 'Answer', text: r.a.trim() },
        })),
      };
    } else if (schemaType === 'HowTo') {
      req('Name', hName);
      const done = steps.filter((s) => s.text.trim());
      if (!done.length) warn.push('At least one step');
      obj = {
        ...obj,
        '@type': 'HowTo',
        ...(hName.trim() && { name: hName.trim() }),
        ...(hDesc.trim() && { description: hDesc.trim() }),
        step: done.map((s) => ({
          '@type': 'HowToStep',
          ...(s.name.trim() && { name: s.name.trim() }),
          text: s.text.trim(),
        })),
      };
    } else if (schemaType === 'Product') {
      req('Product name', pName);
      req('Price', pPrice);
      const ratingVal = parseFloat(pRating);
      const reviewCount = parseInt(pReviews, 10);
      obj = {
        ...obj,
        '@type': 'Product',
        ...(pName.trim() && { name: pName.trim() }),
        ...(pDesc.trim() && { description: pDesc.trim() }),
        ...(pImage.trim() && { image: pImage.trim() }),
        ...(pBrand.trim() && { brand: { '@type': 'Brand', name: pBrand.trim() } }),
        ...(pPrice.trim() && {
          offers: { '@type': 'Offer', priceCurrency: pCurrency, price: pPrice.trim(), availability: pAvailability },
        }),
        ...(pRating.trim() && pReviews.trim() && !Number.isNaN(ratingVal) && !Number.isNaN(reviewCount)
          ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: ratingVal, reviewCount } }
          : {}),
      };
    } else if (schemaType === 'LocalBusiness') {
      req('Business name', bName);
      obj = {
        ...obj,
        '@type': bType,
        ...(bName.trim() && { name: bName.trim() }),
        ...(bAddress.trim() && { address: { '@type': 'PostalAddress', streetAddress: bAddress.trim() } }),
        ...(bPhone.trim() && { telephone: bPhone.trim() }),
        ...(bHours.trim() && { openingHours: bHours.trim() }),
        ...(bPriceRange.trim() && { priceRange: bPriceRange.trim() }),
      };
    } else if (schemaType === 'BreadcrumbList') {
      const items = crumbs.filter((c) => c.name.trim() && c.url.trim());
      if (!items.length) warn.push('At least one breadcrumb (name + URL)');
      obj = {
        ...obj,
        '@type': 'BreadcrumbList',
        itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name.trim(), item: c.url.trim() })),
      };
    } else if (schemaType === 'Organization') {
      req('Organization name', oName);
      obj = {
        ...obj,
        '@type': 'Organization',
        ...(oName.trim() && { name: oName.trim() }),
        ...(oUrl.trim() && { url: oUrl.trim() }),
        ...(oLogo.trim() && { logo: oLogo.trim() }),
        ...(sameAs.some((s) => s.url.trim()) && { sameAs: sameAs.map((s) => s.url.trim()).filter(Boolean) }),
      };
    } else {
      req('Site name', wName);
      req('Site URL', wUrl);
      obj = {
        ...obj,
        '@type': 'WebSite',
        ...(wName.trim() && { name: wName.trim() }),
        ...(wUrl.trim() && { url: wUrl.trim() }),
        ...(wSearch.trim() && {
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: wSearch.trim() },
            'query-input': 'required name=search_term_string',
          },
        }),
      };
    }
    return { json: JSON.stringify(obj, null, 2), warnings: warn };
  }, [
    schemaType, aHeadline, aDesc, aImage, aAuthor, aPublisher, aDate, faqRows, hName, hDesc, steps,
    pName, pDesc, pImage, pBrand, pPrice, pCurrency, pAvailability, pRating, pReviews,
    bName, bType, bAddress, bPhone, bHours, bPriceRange, crumbs, oName, oUrl, oLogo, sameAs,
    wName, wUrl, wSearch,
  ]);

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }, [json]);

  const scriptBlock = `<script type="application/ld+json">\n${json}\n</script>`;

  return (
    <SeoCard tool={tool} note="Structured data helps search engines understand your content and can unlock rich results. Only add ratings and reviews that are real and visible on the page — fabricated review markup can get the page demoted.">
      <div className="max-w-xs">
        <OptLabel>Schema type</OptLabel>
        <OptSelect value={schemaType} onChange={(e) => setSchemaType(e.target.value as SchemaType)}>
          {SCHEMA_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </OptSelect>
      </div>

      <div className="mt-4">
        {schemaType === 'Article' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <OptLabel>Headline *</OptLabel>
              <OptInput value={aHeadline} onChange={(e) => setAHeadline(e.target.value)} placeholder="Article headline" />
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Description</OptLabel>
              <SeoTextarea rows={2} value={aDesc} onChange={(e) => setADesc(e.target.value)} placeholder="Short summary of the article" />
            </div>
            <div>
              <OptLabel>Image URL</OptLabel>
              <OptInput value={aImage} onChange={(e) => setAImage(e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <OptLabel>Date published</OptLabel>
              <OptInput type="date" value={aDate} onChange={(e) => setADate(e.target.value)} />
            </div>
            <div>
              <OptLabel>Author name</OptLabel>
              <OptInput value={aAuthor} onChange={(e) => setAAuthor(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <OptLabel>Publisher name</OptLabel>
              <OptInput value={aPublisher} onChange={(e) => setAPublisher(e.target.value)} placeholder="Example News" />
            </div>
          </div>
        )}

        {schemaType === 'FAQPage' && <QaRowsEditor rows={faqRows} setRows={setFaqRows} />}

        {schemaType === 'HowTo' && (
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <OptLabel>How-to name *</OptLabel>
                <OptInput value={hName} onChange={(e) => setHName(e.target.value)} placeholder="How to change a bicycle tyre" />
              </div>
              <div>
                <OptLabel>Description</OptLabel>
                <OptInput value={hDesc} onChange={(e) => setHDesc(e.target.value)} placeholder="What the reader will achieve" />
              </div>
            </div>
            <OptLabel>Steps</OptLabel>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex gap-2 items-start">
                  <div className="grow grid sm:grid-cols-[1fr_2fr] gap-2">
                    <OptInput
                      value={s.name}
                      onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      placeholder={`Step ${i + 1} name (optional)`}
                    />
                    <OptInput
                      value={s.text}
                      onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                      placeholder="What to do in this step"
                    />
                  </div>
                  {steps.length > 1 && <RemoveBtn onClick={() => setSteps(steps.filter((_, j) => j !== i))} label="Remove step" />}
                </div>
              ))}
              <AddRowBtn onClick={() => setSteps([...steps, { id: nextId(), name: '', text: '' }])}>Add step</AddRowBtn>
            </div>
          </div>
        )}

        {schemaType === 'Product' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <OptLabel>Product name *</OptLabel>
              <OptInput value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Product name" />
            </div>
            <div>
              <OptLabel>Brand</OptLabel>
              <OptInput value={pBrand} onChange={(e) => setPBrand(e.target.value)} placeholder="Brand name" />
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Description</OptLabel>
              <SeoTextarea rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Short product description" />
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Image URL</OptLabel>
              <OptInput value={pImage} onChange={(e) => setPImage(e.target.value)} placeholder="https://example.com/product.jpg" />
            </div>
            <div>
              <OptLabel>Price *</OptLabel>
              <OptInput value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="49.99" inputMode="decimal" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <OptLabel>Currency</OptLabel>
                <OptSelect value={pCurrency} onChange={(e) => setPCurrency(e.target.value)}>
                  {['USD', 'GBP', 'EUR', 'PKR', 'INR'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </OptSelect>
              </div>
              <div>
                <OptLabel>Availability</OptLabel>
                <OptSelect value={pAvailability} onChange={(e) => setPAvailability(e.target.value)}>
                  <option value="https://schema.org/InStock">In stock</option>
                  <option value="https://schema.org/OutOfStock">Out of stock</option>
                  <option value="https://schema.org/PreOrder">Pre-order</option>
                  <option value="https://schema.org/BackOrder">Back order</option>
                </OptSelect>
              </div>
            </div>
            <div>
              <OptLabel>Rating value (e.g. 4.7)</OptLabel>
              <OptInput value={pRating} onChange={(e) => setPRating(e.target.value)} placeholder="Leave empty if none" inputMode="decimal" />
            </div>
            <div>
              <OptLabel>Review count</OptLabel>
              <OptInput value={pReviews} onChange={(e) => setPReviews(e.target.value)} placeholder="Real reviews only" inputMode="numeric" />
            </div>
            <p className="sm:col-span-2 text-[11px] text-gray-500">AggregateRating is included only when both a rating value and a review count are given.</p>
          </div>
        )}

        {schemaType === 'LocalBusiness' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <OptLabel>Business name *</OptLabel>
              <OptInput value={bName} onChange={(e) => setBName(e.target.value)} placeholder="Business name" />
            </div>
            <div>
              <OptLabel>Business type</OptLabel>
              <OptSelect value={bType} onChange={(e) => setBType(e.target.value)}>
                <option value="LocalBusiness">LocalBusiness</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Store">Store</option>
              </OptSelect>
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Street address</OptLabel>
              <OptInput value={bAddress} onChange={(e) => setBAddress(e.target.value)} placeholder="123 Main Street, Springfield" />
            </div>
            <div>
              <OptLabel>Phone</OptLabel>
              <OptInput value={bPhone} onChange={(e) => setBPhone(e.target.value)} placeholder="+1 555 010 1234" />
            </div>
            <div>
              <OptLabel>Price range</OptLabel>
              <OptInput value={bPriceRange} onChange={(e) => setBPriceRange(e.target.value)} placeholder="$$" />
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Opening hours (schema format)</OptLabel>
              <OptInput value={bHours} onChange={(e) => setBHours(e.target.value)} placeholder="Mo-Fr 09:00-17:00" />
            </div>
          </div>
        )}

        {schemaType === 'BreadcrumbList' && (
          <div className="space-y-2">
            {crumbs.map((c, i) => (
              <div key={c.id} className="flex gap-2 items-start">
                <span className="text-xs font-bold text-gray-400 pt-3 w-5 text-right">{i + 1}</span>
                <div className="grow grid sm:grid-cols-2 gap-2">
                  <OptInput
                    value={c.name}
                    onChange={(e) => setCrumbs(crumbs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                    placeholder="Breadcrumb label"
                  />
                  <OptInput
                    value={c.url}
                    onChange={(e) => setCrumbs(crumbs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    placeholder="https://example.com/section"
                  />
                </div>
                {crumbs.length > 1 && <RemoveBtn onClick={() => setCrumbs(crumbs.filter((_, j) => j !== i))} label="Remove breadcrumb" />}
              </div>
            ))}
            <AddRowBtn onClick={() => setCrumbs([...crumbs, { id: nextId(), name: '', url: '' }])}>Add breadcrumb</AddRowBtn>
          </div>
        )}

        {schemaType === 'Organization' && (
          <div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <OptLabel>Organization name *</OptLabel>
                <OptInput value={oName} onChange={(e) => setOName(e.target.value)} placeholder="Company Ltd" />
              </div>
              <div>
                <OptLabel>Website URL</OptLabel>
                <OptInput value={oUrl} onChange={(e) => setOUrl(e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="sm:col-span-2">
                <OptLabel>Logo URL</OptLabel>
                <OptInput value={oLogo} onChange={(e) => setOLogo(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
            </div>
            <OptLabel>Social / profile URLs (sameAs)</OptLabel>
            <div className="space-y-2">
              {sameAs.map((s, i) => (
                <div key={s.id} className="flex gap-2 items-center">
                  <OptInput
                    value={s.url}
                    onChange={(e) => setSameAs(sameAs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                    placeholder="https://facebook.com/yourpage"
                  />
                  {sameAs.length > 1 && <RemoveBtn onClick={() => setSameAs(sameAs.filter((_, j) => j !== i))} label="Remove profile URL" />}
                </div>
              ))}
              <AddRowBtn onClick={() => setSameAs([...sameAs, { id: nextId(), url: '' }])}>Add profile URL</AddRowBtn>
            </div>
          </div>
        )}

        {schemaType === 'WebSite' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <OptLabel>Site name *</OptLabel>
              <OptInput value={wName} onChange={(e) => setWName(e.target.value)} placeholder="Example Site" />
            </div>
            <div>
              <OptLabel>Site URL *</OptLabel>
              <OptInput value={wUrl} onChange={(e) => setWUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="sm:col-span-2">
              <OptLabel>Search URL template (optional — enables the sitelinks search box)</OptLabel>
              <OptInput value={wSearch} onChange={(e) => setWSearch(e.target.value)} placeholder="https://example.com/search?q={search_term_string}" />
              <p className="text-[11px] text-gray-500 mt-1">Keep the literal {'{search_term_string}'} placeholder in the template.</p>
            </div>
          </div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Still empty: {warnings.join(', ')}. The markup will work better once these are filled.</span>
        </div>
      )}
      <p className="mt-3 text-[11px] font-semibold text-emerald-600">{isValidJson ? 'JSON is valid.' : 'JSON is invalid — please report this.'}</p>

      <div className="mt-3">
        <OptLabel>Generated JSON-LD</OptLabel>
        <pre className={PRE_CLASS}>{scriptBlock}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={scriptBlock} label="Copy script block" />
          <DownloadBtn content={json} filename="schema.json" mime="application/json" label="Download schema.json" />
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 6. FAQ Schema Generator
// ---------------------------------------------------------------------------

export const FaqSchemaGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [rows, setRows] = useState<QaRow[]>([
    { id: nextId(), q: '', a: '' },
    { id: nextId(), q: '', a: '' },
  ]);

  const complete = useMemo(() => rows.filter((r) => r.q.trim() && r.a.trim()), [rows]);

  const json = useMemo(
    () =>
      JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: complete.map((r) => ({
            '@type': 'Question',
            name: r.q.trim(),
            acceptedAnswer: { '@type': 'Answer', text: r.a.trim() },
          })),
        },
        null,
        2
      ),
    [complete]
  );
  const scriptBlock = `<script type="application/ld+json">\n${json}\n</script>`;

  return (
    <SeoCard
      tool={tool}
      note="Note: Google now limits FAQ rich results mostly to government and health sites, but the markup still helps other search engines and AI answers quote your content accurately. The questions and answers in the markup must also be visible on the page itself."
    >
      <QaRowsEditor rows={rows} setRows={setRows} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
        <Stat label="Complete questions" value={complete.length} />
        <Stat label="Rows started" value={rows.filter((r) => r.q.trim() || r.a.trim()).length} />
      </div>

      {complete.length > 0 && (
        <div className="mt-5">
          <OptLabel>Preview</OptLabel>
          <div className="space-y-2">
            {complete.map((r) => (
              <details key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800">
                <summary className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer">{r.q.trim()}</summary>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{r.a.trim()}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <OptLabel>Generated FAQPage JSON-LD</OptLabel>
        <pre className={PRE_CLASS}>{scriptBlock}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={scriptBlock} label="Copy script block" />
          <DownloadBtn content={json} filename="faq-schema.json" mime="application/json" label="Download faq-schema.json" />
        </div>
      </div>
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 7. .htaccess / Nginx Redirect Generator
// ---------------------------------------------------------------------------

export const HtaccessRedirectGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [pairsText, setPairsText] = useState('');
  const [status, setStatus] = useState<'301' | '302' | '307'>('301');
  const [format, setFormat] = useState<'apache' | 'nginx'>('apache');
  const [forceHttps, setForceHttps] = useState(false);
  const [wwwToNonWww, setWwwToNonWww] = useState(false);
  const [nonWwwToWww, setNonWwwToWww] = useState(false);

  const { pairs, skipped } = useMemo(() => {
    const out: { from: string; to: string }[] = [];
    let bad = 0;
    for (const raw of pairsText.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const parts = line.split(/[\s,]+/).filter(Boolean);
      if (parts.length >= 2) out.push({ from: parts[0], to: parts[1] });
      else bad++;
    }
    return { pairs: out, skipped: bad };
  }, [pairsText]);

  const pathOf = (v: string): string => {
    try {
      return new URL(v).pathname || '/';
    } catch {
      return v.startsWith('/') ? v : `/${v}`;
    }
  };

  const output = useMemo(() => {
    const lines: string[] = [];
    if (format === 'apache') {
      const needsEngine = forceHttps || wwwToNonWww || nonWwwToWww;
      if (needsEngine) lines.push('RewriteEngine On', '');
      if (forceHttps) {
        lines.push('# Force HTTPS', 'RewriteCond %{HTTPS} off', 'RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]', '');
      }
      if (wwwToNonWww) {
        lines.push('# Redirect www to non-www', 'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]', 'RewriteRule ^(.*)$ https://%1/$1 [R=301,L]', '');
      } else if (nonWwwToWww) {
        lines.push('# Redirect non-www to www', 'RewriteCond %{HTTP_HOST} !^www\\. [NC]', 'RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [R=301,L]', '');
      }
      if (pairs.length) {
        lines.push('# Page redirects');
        pairs.forEach((p) => lines.push(`Redirect ${status} "${pathOf(p.from)}" "${p.to}"`));
      }
    } else {
      if (forceHttps) {
        lines.push('# Force HTTPS (put in the port-80 server block)', 'return 301 https://$host$request_uri;', '');
      }
      if (wwwToNonWww) {
        lines.push('# Redirect www to non-www', 'if ($host ~* ^www\\.(.+)$) {', '  return 301 https://$1$request_uri;', '}', '');
      } else if (nonWwwToWww) {
        lines.push('# Redirect non-www to www', 'if ($host !~* ^www\\.) {', '  return 301 https://www.$host$request_uri;', '}', '');
      }
      if (pairs.length) {
        lines.push('# Page redirects');
        pairs.forEach((p) => {
          const from = pathOf(p.from).replace(/[.+?^${}()|[\]\\]/g, '\\$&');
          lines.push(`rewrite ^${from}$ ${p.to} ${status === '301' ? 'permanent' : 'redirect'};`);
        });
      }
    }
    return lines.join('\n').trim();
  }, [format, forceHttps, wwwToNonWww, nonWwwToWww, pairs, status]);

  const bothWww = wwwToNonWww && nonWwwToWww;

  return (
    <SeoCard tool={tool} note="Use 301 for permanent moves (passes link equity), 302/307 for temporary ones. Test redirects after deploying — a wrong rule can loop or break a whole site. Keep a backup of your existing .htaccess.">
      <OptLabel>Redirect pairs — one per line: old path/URL, then the new URL (space or comma separated)</OptLabel>
      <SeoTextarea
        rows={6}
        value={pairsText}
        onChange={(e) => setPairsText(e.target.value)}
        placeholder={'/old-page https://example.com/new-page\n/legacy https://example.com/modern'}
        className="font-mono text-xs"
      />
      <div className="grid sm:grid-cols-2 gap-4 mt-4 max-w-lg">
        <div>
          <OptLabel>Redirect status</OptLabel>
          <OptSelect value={status} onChange={(e) => setStatus(e.target.value as '301' | '302' | '307')}>
            <option value="301">301 — Permanent</option>
            <option value="302">302 — Temporary (found)</option>
            <option value="307">307 — Temporary (method preserved)</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Server format</OptLabel>
          <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'apache' | 'nginx')}>
            <option value="apache">Apache (.htaccess)</option>
            <option value="nginx">Nginx (server block)</option>
          </OptSelect>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
        {[
          { label: 'Force HTTPS', v: forceHttps, set: setForceHttps },
          { label: 'Redirect www to non-www', v: wwwToNonWww, set: setWwwToNonWww },
          { label: 'Redirect non-www to www', v: nonWwwToWww, set: setNonWwwToWww },
        ].map((c) => (
          <label key={c.label} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            <input type="checkbox" checked={c.v} onChange={(e) => c.set(e.target.checked)} className="accent-green-600 w-4 h-4" />
            {c.label}
          </label>
        ))}
      </div>
      {bothWww && (
        <div className="mt-3 flex items-start gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Both www options are on — they conflict, so only &quot;www to non-www&quot; is included in the output.</span>
        </div>
      )}
      <p className="text-[11px] text-gray-500 mt-3">
        {pairs.length} redirect pair(s) parsed{skipped ? `, ${skipped} line(s) skipped (need both an old and a new URL)` : ''}.
      </p>

      {output && (
        <div className="mt-4">
          <OptLabel>Generated {format === 'apache' ? '.htaccess' : 'Nginx rules'}</OptLabel>
          <pre className={PRE_CLASS}>{output}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyBtn text={output} label="Copy rules" />
            <DownloadBtn
              content={output}
              filename={format === 'apache' ? '.htaccess' : 'nginx-redirects.conf'}
              label={format === 'apache' ? 'Download .htaccess' : 'Download nginx-redirects.conf'}
            />
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Hreflang Generator
// ---------------------------------------------------------------------------

const HREFLANG_CODES = ['en', 'en-US', 'en-GB', 'es', 'es-ES', 'fr', 'de', 'it', 'pt-BR', 'ar', 'ur', 'hi', 'ja', 'zh-CN', 'x-default'];

interface HreflangRow {
  id: number;
  lang: string;
  url: string;
}

export const HreflangGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [rows, setRows] = useState<HreflangRow[]>([
    { id: nextId(), lang: 'en', url: '' },
    { id: nextId(), lang: 'x-default', url: '' },
  ]);
  const [mode, setMode] = useState<'tags' | 'sitemap'>('tags');

  const entries: HreflangEntry[] = useMemo(
    () => rows.map((r) => ({ lang: r.lang.trim(), url: r.url.trim() })).filter((e) => e.lang && e.url),
    [rows]
  );

  const output = useMemo(() => {
    if (!entries.length) return '';
    if (mode === 'tags') return buildHreflangLinkTags(entries);
    return buildHreflangSitemap(entries.map((e) => ({ loc: e.url, alternates: entries })));
  }, [entries, mode]);

  return (
    <SeoCard
      tool={tool}
      note="Every language version must list all versions including itself — the tag set has to be identical on every page, or Google may ignore it. Add an x-default entry pointing at your fallback page."
    >
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.id} className="flex gap-2 items-center">
            <div className="w-36 shrink-0">
              <OptInput
                value={r.lang}
                onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, lang: e.target.value } : x)))}
                placeholder="en-US"
                list="hreflang-codes"
              />
            </div>
            <OptInput
              value={r.url}
              onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
              placeholder="https://example.com/en/page"
            />
            {rows.length > 1 && <RemoveBtn onClick={() => setRows(rows.filter((_, j) => j !== i))} label="Remove language" />}
          </div>
        ))}
        <datalist id="hreflang-codes">
          {HREFLANG_CODES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <AddRowBtn onClick={() => setRows([...rows, { id: nextId(), lang: '', url: '' }])}>Add language version</AddRowBtn>
      </div>

      <div className="mt-5">
        <OptLabel>Output format</OptLabel>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { v: 'tags', label: 'HTML link tags (for the page <head>)' },
              { v: 'sitemap', label: 'XML sitemap entries' },
            ] as const
          ).map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              <input type="radio" name="hreflang-mode" checked={mode === o.v} onChange={() => setMode(o.v)} className="accent-green-600 w-4 h-4" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {output ? (
        <div className="mt-4">
          <OptLabel>{mode === 'tags' ? 'Generated link tags' : 'Generated sitemap'}</OptLabel>
          <pre className={PRE_CLASS}>{output}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyBtn text={output} label="Copy output" />
            <DownloadBtn
              content={output}
              filename={mode === 'tags' ? 'hreflang-tags.html' : 'hreflang-sitemap.xml'}
              mime={mode === 'tags' ? 'text/html' : 'application/xml'}
              label={mode === 'tags' ? 'Download hreflang-tags.html' : 'Download hreflang-sitemap.xml'}
            />
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-gray-500 mt-4">Add a language code and its full URL for at least one row to generate output.</p>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 9. UTM Builder
// ---------------------------------------------------------------------------

const MEDIUM_CHIPS = ['cpc', 'organic', 'social', 'email', 'referral', 'display'];

export const UtmBuilder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [base, setBase] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const { result, error } = useMemo(() => {
    if (!base.trim()) return { result: '', error: '' };
    try {
      return { result: buildUtmUrl(base.trim(), { source, medium, campaign, term, content }), error: '' };
    } catch {
      return { result: '', error: 'That base URL does not look valid — include the protocol, e.g. https://example.com/page' };
    }
  }, [base, source, medium, campaign, term, content]);

  const addToList = () => {
    if (result) setHistory((h) => (h.includes(result) ? h : [...h, result]));
  };

  return (
    <SeoCard tool={tool} note="Use consistent lowercase naming for sources, mediums and campaigns — 'Facebook', 'facebook' and 'FB' show up as three different sources in analytics.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <OptLabel>Website URL</OptLabel>
          <OptInput value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://example.com/landing-page" />
          {error && <p className="text-[11px] font-semibold text-red-600 mt-1">{error}</p>}
        </div>
        <div>
          <OptLabel>Source (utm_source) *</OptLabel>
          <OptInput value={source} onChange={(e) => setSource(e.target.value)} placeholder="google, facebook, newsletter…" />
        </div>
        <div>
          <OptLabel>Medium (utm_medium) *</OptLabel>
          <OptInput value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc, email, social…" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {MEDIUM_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setMedium(chip)}
                className={`px-2 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${
                  medium === chip
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-400'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <div>
          <OptLabel>Campaign (utm_campaign) *</OptLabel>
          <OptInput value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="winter_sale_2026" />
        </div>
        <div>
          <OptLabel>Term (utm_term — paid keywords)</OptLabel>
          <OptInput value={term} onChange={(e) => setTerm(e.target.value)} placeholder="running+shoes" />
        </div>
        <div>
          <OptLabel>Content (utm_content — A/B variant)</OptLabel>
          <OptInput value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner_v2" />
        </div>
      </div>

      <div className="mt-5">
        <OptLabel>Tagged URL</OptLabel>
        <div className="flex gap-2 items-start">
          <div className="grow">
            <OptInput value={result} readOnly placeholder="Fill in the fields above to build your URL" />
          </div>
          {result && <CopyBtn text={result} label="Copy URL" />}
        </div>
        <div className="mt-3">
          <PrimaryBtn onClick={addToList} disabled={!result}>
            Add to list
          </PrimaryBtn>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-5">
          <OptLabel>Saved URLs ({history.length})</OptLabel>
          <ul className="space-y-2">
            {history.map((u, i) => (
              <li
                key={`${u}-${i}`}
                className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2"
              >
                <span className="text-xs font-mono text-gray-700 dark:text-gray-200 truncate grow">{u}</span>
                <CopyBtn text={u} />
                <RemoveBtn onClick={() => setHistory((h) => h.filter((_, j) => j !== i))} label="Remove saved URL" />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <DownloadBtn content={history.join('\n')} filename="utm-urls.txt" label="Download all as .txt" />
            <button
              type="button"
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              Clear list
            </button>
          </div>
        </div>
      )}
    </SeoCard>
  );
};

// ---------------------------------------------------------------------------
// 10. llms.txt Generator
// ---------------------------------------------------------------------------

interface LlmsLink {
  id: number;
  title: string;
  url: string;
  note: string;
}

interface LlmsSection {
  id: number;
  title: string;
  links: LlmsLink[];
}

const blankLink = (): LlmsLink => ({ id: nextId(), title: '', url: '', note: '' });
const blankSection = (): LlmsSection => ({ id: nextId(), title: '', links: [blankLink()] });

export const LlmsTxtGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [sections, setSections] = useState<LlmsSection[]>([blankSection()]);

  const output = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ${name.trim() || 'Your Site Name'}`);
    if (summary.trim()) lines.push('', `> ${summary.trim()}`);
    if (details.trim()) lines.push('', details.trim());
    for (const s of sections) {
      const links = s.links.filter((l) => l.title.trim() && l.url.trim());
      if (!s.title.trim() || !links.length) continue;
      lines.push('', `## ${s.title.trim()}`, '');
      links.forEach((l) => lines.push(`- [${l.title.trim()}](${l.url.trim()})${l.note.trim() ? `: ${l.note.trim()}` : ''}`));
    }
    return lines.join('\n') + '\n';
  }, [name, summary, details, sections]);

  const patchSection = (i: number, patch: Partial<LlmsSection>) =>
    setSections((ss) => ss.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const patchLink = (si: number, li: number, patch: Partial<LlmsLink>) =>
    setSections((ss) =>
      ss.map((s, j) => (j === si ? { ...s, links: s.links.map((l, k) => (k === li ? { ...l, ...patch } : l)) } : s))
    );

  return (
    <SeoCard
      tool={tool}
      note="llms.txt is the emerging standard proposed at llmstxt.org: a plain-Markdown file at your site root that tells AI assistants what your site is and which pages matter most. Place the finished file at yourdomain.com/llms.txt."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>Site / product name</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Example Site" />
        </div>
        <div>
          <OptLabel>One-line summary</OptLabel>
          <OptInput value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What this site does, in one sentence" />
        </div>
        <div className="sm:col-span-2">
          <OptLabel>Details (optional paragraph)</OptLabel>
          <SeoTextarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything else an AI assistant should know — audience, key facts, how content is organized." />
        </div>
      </div>

      <div className="space-y-4 mt-5">
        {sections.map((s, si) => (
          <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/60 dark:bg-gray-800/40">
            <div className="flex items-end gap-2">
              <div className="grow">
                <OptLabel>Section title</OptLabel>
                <OptInput value={s.title} onChange={(e) => patchSection(si, { title: e.target.value })} placeholder="Docs, Guides, Products…" />
              </div>
              {sections.length > 1 && <RemoveBtn onClick={() => setSections((ss) => ss.filter((_, j) => j !== si))} label="Remove section" />}
            </div>
            <div className="space-y-2 mt-3">
              {s.links.map((l, li) => (
                <div key={l.id} className="flex gap-2 items-start">
                  <div className="grow grid sm:grid-cols-[1fr_1.4fr_1fr] gap-2">
                    <OptInput value={l.title} onChange={(e) => patchLink(si, li, { title: e.target.value })} placeholder="Link title" />
                    <OptInput value={l.url} onChange={(e) => patchLink(si, li, { url: e.target.value })} placeholder="https://example.com/page" />
                    <OptInput value={l.note} onChange={(e) => patchLink(si, li, { note: e.target.value })} placeholder="Optional note" />
                  </div>
                  {s.links.length > 1 && <RemoveBtn onClick={() => patchSection(si, { links: s.links.filter((_, k) => k !== li) })} label="Remove link" />}
                </div>
              ))}
              <AddRowBtn onClick={() => patchSection(si, { links: [...s.links, blankLink()] })}>Add link</AddRowBtn>
            </div>
          </div>
        ))}
        <AddRowBtn onClick={() => setSections((ss) => [...ss, blankSection()])}>Add section</AddRowBtn>
      </div>

      <div className="mt-5">
        <OptLabel>Preview — llms.txt</OptLabel>
        <pre className={PRE_CLASS}>{output}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyBtn text={output} label="Copy llms.txt" />
          <DownloadBtn content={output} filename="llms.txt" label="Download llms.txt" />
        </div>
      </div>
    </SeoCard>
  );
};
