// ============================================================
// Free Omni Tools   SEO engine
// Pure, testable algorithms behind the SEO Tools suite:
// robots.txt parsing/matching (RFC 9309 basics), keyword density
// n-grams, readability scores, text similarity (shingles),
// redirect-chain analysis, sitemap validation, meta / on-page
// audits, headline scoring, keyword clustering, minifiers.
// HTML extraction is regex-based so it behaves identically in
// the browser and in headless tests.
// ============================================================

export interface CheckItem {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

// ---------------- basic text utilities ----------------

export function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

/** Convert an HTML document/fragment to readable plain text. */
export function htmlToText(html: string): string {
  let s = html;
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(script|style|noscript|svg|head)[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<\/(p|div|li|tr|h[1-6]|blockquote|section|article|header|footer|table|ul|ol)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s);
  return s
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

export function tokenizeWords(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9']+/g) || []).map((w) => w.replace(/^'+|'+$/g, '')).filter(Boolean);
}

export function splitSentences(text: string): string[] {
  return (text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [])
    .map((s) => s.trim())
    .filter((s) => /[a-z0-9]/i.test(s));
}

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]e|ed|es)$/, '').replace(/^y/, '');
  const groups = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

export const STOPWORDS = new Set(
  ('a,about,above,after,again,against,all,am,an,and,any,are,as,at,be,because,been,before,being,below,between,both,but,by,could,did,do,does,doing,down,during,each,few,for,from,further,had,has,have,having,he,her,here,hers,herself,him,himself,his,how,i,if,in,into,is,it,its,itself,just,me,more,most,my,of,on,once,only,or,other,our,out,over,own,s,same,she,should,so,some,such,t,than,that,the,their,theirs,them,themselves,then,there,these,they,this,those,through,to,too,under,until,up,very,was,we,were,what,when,where,which,while,who,whom,why,will,with,you,your,yours,yourself,yourselves,can,also,one,two,get,like,make,made,use,using,used,way,ways,new,first,last,long,great,little,own,other,old,right,big,high,different,small,large,next,early,young,important,few,public,bad,able,per,upon,within,without,per,via,etc').split(',')
);

// ---------------- keyword density ----------------

export interface DensityRow {
  term: string;
  count: number;
  density: number; // percent
}

export interface DensityResult {
  totalWords: number;
  totalPhrases2: number;
  totalPhrases3: number;
  singles: DensityRow[];
  bigrams: DensityRow[];
  trigrams: DensityRow[];
}

function ngrams(words: string[], n: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i + n <= words.length; i++) {
    const g = words.slice(i, i + n).join(' ');
    map.set(g, (map.get(g) || 0) + 1);
  }
  return map;
}

export function keywordDensity(text: string, excludeStopwords = true, limit = 50): DensityResult {
  const raw = tokenizeWords(text);
  const words = excludeStopwords ? raw.filter((w) => !STOPWORDS.has(w)) : raw;
  const total = words.length;
  const toRows = (m: Map<string, number>, n: number, denom: number): DensityRow[] =>
    [...m.entries()]
      .map(([term, count]) => ({ term, count, density: denom ? (count * n * 100) / denom : 0 }))
      .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
      .slice(0, limit);
  return {
    totalWords: total,
    totalPhrases2: Math.max(0, total - 1),
    totalPhrases3: Math.max(0, total - 2),
    singles: toRows(ngrams(words, 1), 1, total),
    bigrams: toRows(ngrams(words, 2), 2, total),
    trigrams: toRows(ngrams(words, 3), 3, total),
  };
}

/** Occurrences of an exact phrase in text (word-boundary, case-insensitive). */
export function phraseOccurrences(text: string, phrase: string): number {
  const p = phrase.trim().toLowerCase();
  if (!p) return 0;
  const words = tokenizeWords(text);
  const pWords = tokenizeWords(p);
  if (!pWords.length) return 0;
  let count = 0;
  for (let i = 0; i + pWords.length <= words.length; i++) {
    if (pWords.every((w, j) => words[i + j] === w)) count++;
  }
  return count;
}

// ---------------- readability ----------------

export interface ReadabilityResult {
  words: number;
  sentences: number;
  syllables: number;
  characters: number;
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
  complexWords: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  smog: number;
  colemanLiau: number;
  ari: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export function readability(text: string): ReadabilityResult {
  const words = tokenizeWords(text);
  const sentences = Math.max(1, splitSentences(text).length);
  const wordCount = words.length;
  const syllables = words.reduce((a, w) => a + countSyllables(w), 0);
  const characters = words.reduce((a, w) => a + w.length, 0);
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const asl = wordCount / sentences;
  const asw = wordCount ? syllables / wordCount : 0;
  const r1 = (v: number) => Math.round(v * 10) / 10;
  return {
    words: wordCount,
    sentences,
    syllables,
    characters,
    avgSentenceLength: r1(asl),
    avgSyllablesPerWord: r1(asw),
    complexWords,
    fleschReadingEase: wordCount ? r1(206.835 - 1.015 * asl - 84.6 * asw) : 0,
    fleschKincaidGrade: wordCount ? r1(0.39 * asl + 11.8 * asw - 15.59) : 0,
    gunningFog: wordCount ? r1(0.4 * (asl + 100 * (complexWords / wordCount))) : 0,
    smog: wordCount ? r1(1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291) : 0,
    colemanLiau: wordCount ? r1(0.0588 * ((characters / wordCount) * 100) - 0.296 * ((sentences / wordCount) * 100) - 15.8) : 0,
    ari: wordCount ? r1(4.71 * (characters / wordCount) + 0.5 * asl - 21.43) : 0,
    readingTimeMinutes: r1(wordCount / 200),
    speakingTimeMinutes: r1(wordCount / 130),
  };
}

// ---------------- duplicate content / similarity ----------------

export interface SimilarityResult {
  similarityPercent: number; // shingle Jaccard
  containmentPercent: number; // how much of the shorter text appears in the longer
  sharedShingles: number;
  matchingSentences: { sentence: string; inBoth: boolean }[];
  wordsA: number;
  wordsB: number;
}

function shingles(words: string[], size = 5): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i + size <= words.length; i++) set.add(words.slice(i, i + size).join(' '));
  return set;
}

export function textSimilarity(a: string, b: string): SimilarityResult {
  const wordsA = tokenizeWords(a);
  const wordsB = tokenizeWords(b);
  const shA = shingles(wordsA);
  const shB = shingles(wordsB);
  let shared = 0;
  shA.forEach((s) => { if (shB.has(s)) shared++; });
  const union = new Set([...shA, ...shB]).size;
  const smaller = Math.max(1, Math.min(shA.size, shB.size));
  const sentA = splitSentences(a);
  const normB = b.toLowerCase().replace(/\s+/g, ' ');
  const matchingSentences = sentA
    .filter((s) => tokenizeWords(s).length >= 5)
    .slice(0, 200)
    .map((s) => ({ sentence: s, inBoth: normB.includes(s.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 120)) }));
  return {
    similarityPercent: union ? Math.round((shared / union) * 1000) / 10 : 0,
    containmentPercent: Math.round((shared / smaller) * 1000) / 10,
    sharedShingles: shared,
    matchingSentences,
    wordsA: wordsA.length,
    wordsB: wordsB.length,
  };
}

// ---------------- robots.txt ----------------

export interface RobotsGroup {
  agents: string[];
  rules: { type: 'allow' | 'disallow'; path: string }[];
  crawlDelay?: number;
}

export interface ParsedRobots {
  groups: RobotsGroup[];
  sitemaps: string[];
}

export function parseRobotsTxt(txt: string): ParsedRobots {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let seenRule = false;
  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (!current || seenRule) {
        current = { agents: [], rules: [] };
        groups.push(current);
        seenRule = false;
      }
      current.agents.push(value.toLowerCase());
    } else if (key === 'allow' || key === 'disallow') {
      if (!current) {
        current = { agents: ['*'], rules: [] };
        groups.push(current);
      }
      current.rules.push({ type: key, path: value });
      seenRule = true;
    } else if (key === 'crawl-delay') {
      if (current) current.crawlDelay = parseFloat(value);
      seenRule = true;
    } else if (key === 'sitemap') {
      sitemaps.push(value);
    }
  }
  return { groups, sitemaps };
}

function patternToRegex(pattern: string): RegExp {
  let p = pattern;
  let anchorEnd = false;
  if (p.endsWith('$')) {
    anchorEnd = true;
    p = p.slice(0, -1);
  }
  const body = p.replace(/[.+?^${}()|[\]\\]/g, (c) => (c === '*' ? '.*' : `\\${c}`)).replace(/\*/g, '.*');
  return new RegExp(`^${body}${anchorEnd ? '$' : ''}`);
}

export function isUrlAllowed(robotsTxt: string, url: string, agent = 'Googlebot'): boolean {
  const { groups } = parseRobotsTxt(robotsTxt);
  let target: string;
  try {
    const u = new URL(url);
    target = u.pathname + u.search;
  } catch {
    target = url.startsWith('/') ? url : `/${url}`;
  }
  const agentToken = agent.toLowerCase().split('/')[0].trim();
  let group: RobotsGroup | undefined = groups.find((g) => g.agents.includes(agentToken));
  if (!group) group = groups.find((g) => g.agents.includes('*'));
  if (!group) return true;
  let bestLen = -1;
  let allowed = true;
  for (const rule of group.rules) {
    if (rule.path === '') continue;
    let matches = false;
    try {
      matches = patternToRegex(rule.path).test(target);
    } catch {
      matches = target.startsWith(rule.path);
    }
    if (!matches) continue;
    const len = rule.path.length;
    if (len > bestLen || (len === bestLen && rule.type === 'allow')) {
      bestLen = len;
      allowed = rule.type === 'allow';
    }
  }
  return allowed;
}

export function buildRobotsTxt(groups: RobotsGroup[], sitemaps: string[]): string {
  const parts: string[] = [];
  for (const g of groups) {
    const lines: string[] = [];
    g.agents.forEach((a) => lines.push(`User-agent: ${a}`));
    if (!g.rules.length) lines.push('Disallow:');
    g.rules.forEach((r) => lines.push(`${r.type === 'allow' ? 'Allow' : 'Disallow'}: ${r.path}`));
    if (g.crawlDelay !== undefined && !Number.isNaN(g.crawlDelay)) lines.push(`Crawl-delay: ${g.crawlDelay}`);
    parts.push(lines.join('\n'));
  }
  sitemaps.filter(Boolean).forEach((s) => parts.push(`Sitemap: ${s}`));
  return parts.join('\n\n') + '\n';
}

// ---------------- sitemap ----------------

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = urls
    .map((u) => {
      const lines = [`    <loc>${esc(u.loc)}</loc>`];
      if (u.lastmod) lines.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) lines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority) lines.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${lines.join('\n')}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export interface SitemapValidation {
  urlCount: number;
  isIndex: boolean;
  errors: string[];
  warnings: string[];
  duplicates: string[];
}

const CHANGEFREQS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

export function validateSitemapXml(xml: string): SitemapValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = xml.trim();
  const isIndex = /<sitemapindex[\s>]/i.test(trimmed);
  if (!/^<\?xml/i.test(trimmed) && !/^<(urlset|sitemapindex)/i.test(trimmed)) {
    errors.push('Document does not start with an XML declaration or a urlset/sitemapindex root element.');
  }
  if (!isIndex && !/<urlset[\s>]/i.test(trimmed)) errors.push('Missing <urlset> root element.');
  if (isIndex && !/<\/sitemapindex>/i.test(trimmed)) errors.push('Missing closing </sitemapindex>.');
  if (!isIndex && !/<\/urlset>/i.test(trimmed)) errors.push('Missing closing </urlset>.');
  const blocks = [...trimmed.matchAll(/<(url|sitemap)>([\s\S]*?)<\/\1>/g)].map((m) => m[2]);
  const locs: string[] = [];
  blocks.forEach((block, i) => {
    const n = i + 1;
    const loc = (block.match(/<loc>([\s\S]*?)<\/loc>/) || [])[1]?.trim();
    if (!loc) {
      errors.push(`Entry ${n}: missing <loc>.`);
      return;
    }
    locs.push(loc);
    if (!/^https?:\/\//i.test(loc)) errors.push(`Entry ${n}: <loc> is not an absolute URL: ${loc.slice(0, 80)}`);
    const lastmod = (block.match(/<lastmod>([\s\S]*?)<\/lastmod>/) || [])[1]?.trim();
    if (lastmod && !/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(lastmod)) {
      warnings.push(`Entry ${n}: <lastmod> format looks invalid: ${lastmod}`);
    }
    const cf = (block.match(/<changefreq>([\s\S]*?)<\/changefreq>/) || [])[1]?.trim();
    if (cf && !CHANGEFREQS.includes(cf.toLowerCase())) warnings.push(`Entry ${n}: unknown <changefreq> value: ${cf}`);
    const pr = (block.match(/<priority>([\s\S]*?)<\/priority>/) || [])[1]?.trim();
    if (pr) {
      const v = parseFloat(pr);
      if (Number.isNaN(v) || v < 0 || v > 1) warnings.push(`Entry ${n}: <priority> out of range 0.0–1.0: ${pr}`);
    }
  });
  const seen = new Set<string>();
  const duplicates: string[] = [];
  locs.forEach((l) => {
    if (seen.has(l) && !duplicates.includes(l)) duplicates.push(l);
    seen.add(l);
  });
  if (duplicates.length) warnings.push(`${duplicates.length} duplicate URL(s) found.`);
  if (locs.length > 50000) errors.push(`Sitemap contains ${locs.length} URLs   the protocol limit is 50,000 per file. Split it into a sitemap index.`);
  if (!blocks.length && !errors.length) warnings.push('No <url> entries found.');
  return { urlCount: locs.length, isIndex, errors, warnings, duplicates };
}

// ---------------- HTML structure extraction ----------------

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].replace(/<[^>]+>/g, '').trim()) : null;
}

export function extractMeta(html: string, attr: 'name' | 'property', key: string): string | null {
  const tags = html.match(/<meta[^>]+>/gi) || [];
  for (const tag of tags) {
    const attrRe = new RegExp(`${attr}\\s*=\\s*["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i');
    if (attrRe.test(tag)) {
      const c = tag.match(/content\s*=\s*"([^"]*)"|content\s*=\s*'([^']*)'/i);
      if (c) return decodeEntities(c[1] ?? c[2] ?? '');
    }
  }
  return null;
}

export function extractCanonical(html: string): string | null {
  const tags = html.match(/<link[^>]+>/gi) || [];
  for (const tag of tags) {
    if (/rel\s*=\s*["']canonical["']/i.test(tag)) {
      const h = tag.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i);
      if (h) return h[1] ?? h[2];
    }
  }
  return null;
}

export interface HeadingInfo {
  level: number;
  text: string;
}

export function extractHeadings(html: string): HeadingInfo[] {
  const out: HeadingInfo[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({ level: parseInt(m[1], 10), text: decodeEntities(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) });
  }
  return out;
}

export interface ImageInfo {
  src: string;
  alt: string | null;
}

export function extractImages(html: string): ImageInfo[] {
  const tags = html.match(/<img[^>]*>/gi) || [];
  return tags.map((tag) => {
    const src = (tag.match(/src\s*=\s*"([^"]*)"|src\s*=\s*'([^']*)'/i) || []);
    const alt = tag.match(/alt\s*=\s*"([^"]*)"|alt\s*=\s*'([^']*)'/i);
    return {
      src: src[1] ?? src[2] ?? '',
      alt: alt ? decodeEntities(alt[1] ?? alt[2] ?? '') : null,
    };
  });
}

export interface LinkInfo {
  href: string;
  anchor: string;
  rel: string;
  follow: boolean;
  internal: boolean | null;
}

export function extractLinks(html: string, pageUrl?: string): LinkInfo[] {
  const out: LinkInfo[] = [];
  const re = /<a[^>]*href\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>|<a[^>]*href\s*=\s*'([^']*)'[^>]*>([\s\S]*?)<\/a>/gi;
  let host: string | null = null;
  if (pageUrl) {
    try { host = new URL(pageUrl).hostname; } catch { host = null; }
  }
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1] ?? m[3] ?? '';
    const inner = m[2] ?? m[4] ?? '';
    const tagStart = html.slice(Math.max(0, m.index), m.index + (m[0].indexOf('>') + 1));
    const relM = tagStart.match(/rel\s*=\s*"([^"]*)"|rel\s*=\s*'([^']*)'/i);
    const rel = relM ? (relM[1] ?? relM[2] ?? '') : '';
    let internal: boolean | null = null;
    if (host) {
      if (/^(#|mailto:|tel:|javascript:)/i.test(href)) internal = true;
      else {
        try { internal = new URL(href, pageUrl).hostname === host; } catch { internal = null; }
      }
    }
    out.push({
      href,
      anchor: decodeEntities(inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()),
      rel,
      follow: !/nofollow/i.test(rel),
      internal,
    });
  }
  return out;
}

export function codeToTextRatio(html: string): { ratioPercent: number; htmlBytes: number; textBytes: number; text: string } {
  const text = htmlToText(html);
  const htmlBytes = new Blob([html]).size;
  const textBytes = new Blob([text]).size;
  return { ratioPercent: htmlBytes ? Math.round((textBytes / htmlBytes) * 1000) / 10 : 0, htmlBytes, textBytes, text };
}

// ---------------- meta tag analysis ----------------

export interface MetaAnalysis {
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  canonical: string | null;
  robotsMeta: string | null;
  viewport: string | null;
  charset: string | null;
  language: string | null;
  og: Record<string, string | null>;
  twitter: Record<string, string | null>;
  headings: HeadingInfo[];
  images: { total: number; withAlt: number; withoutAlt: number };
  links: { total: number; internal: number; external: number; nofollow: number };
  wordCount: number;
  checks: CheckItem[];
}

export function analyzeMetaTags(html: string, pageUrl?: string): MetaAnalysis {
  const title = extractTitle(html);
  const description = extractMeta(html, 'name', 'description');
  const canonical = extractCanonical(html);
  const robotsMeta = extractMeta(html, 'name', 'robots');
  const viewport = extractMeta(html, 'name', 'viewport');
  const charsetM = html.match(/<meta[^>]+charset\s*=\s*["']?([^"'\s/>]+)/i);
  const langM = html.match(/<html[^>]+lang\s*=\s*["']([^"']+)["']/i);
  const og: Record<string, string | null> = {};
  ['og:title', 'og:description', 'og:image', 'og:type', 'og:url'].forEach((k) => { og[k] = extractMeta(html, 'property', k); });
  const twitter: Record<string, string | null> = {};
  ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'].forEach((k) => { twitter[k] = extractMeta(html, 'name', k); });
  const headings = extractHeadings(html);
  const images = extractImages(html);
  const links = extractLinks(html, pageUrl);
  const text = htmlToText(html);
  const wordCount = tokenizeWords(text).length;

  const checks: CheckItem[] = [];
  const push = (label: string, status: CheckItem['status'], detail: string) => checks.push({ label, status, detail });

  if (!title) push('Title tag', 'fail', 'No <title> found. Every page needs a unique, descriptive title.');
  else if (title.length < 30) push('Title tag', 'warn', `Title is ${title.length} characters   under 30 can miss keyword opportunities.`);
  else if (title.length <= 60) push('Title tag', 'pass', `Title is ${title.length} characters   within the ideal 30–60 range.`);
  else if (title.length <= 70) push('Title tag', 'warn', `Title is ${title.length} characters   may be truncated in search results (~60 shown).`);
  else push('Title tag', 'fail', `Title is ${title.length} characters   will almost certainly be truncated in search results.`);

  if (!description) push('Meta description', 'fail', 'No meta description found. Google will pick random page text for the snippet.');
  else if (description.length < 70) push('Meta description', 'warn', `Description is only ${description.length} characters   too short to sell the click.`);
  else if (description.length <= 160) push('Meta description', 'pass', `Description is ${description.length} characters   within the ideal 70–160 range.`);
  else push('Meta description', 'warn', `Description is ${description.length} characters   over ~160 it risks truncation.`);

  push('Canonical URL', canonical ? 'pass' : 'warn', canonical ? `Canonical: ${canonical}` : 'No canonical tag. Adding one helps prevent duplicate-content issues.');
  push('Robots meta', 'pass', robotsMeta ? `Robots directive: ${robotsMeta}` : 'No robots meta tag   the page is indexable and links are followed by default.');
  if (robotsMeta && /noindex/i.test(robotsMeta)) push('Indexability', 'fail', 'This page has "noindex"   it will NOT appear in search results.');
  push('Viewport (mobile)', viewport ? 'pass' : 'fail', viewport ? 'Viewport meta present   page can adapt to mobile screens.' : 'No viewport meta tag   the page will render poorly on mobile and fail mobile-friendliness checks.');
  push('Charset', charsetM ? 'pass' : 'warn', charsetM ? `Charset declared: ${charsetM[1]}` : 'No charset declared   browsers may mis-render special characters.');
  push('Language', langM ? 'pass' : 'warn', langM ? `html lang="${langM[1]}"` : 'No lang attribute on <html>   screen readers and search engines use it to identify the language.');

  const ogMissing = Object.entries(og).filter(([, v]) => !v).map(([k]) => k);
  push('Open Graph tags', ogMissing.length === 0 ? 'pass' : 'warn', ogMissing.length === 0 ? 'All core OG tags present (title, description, image, type, url).' : `Missing: ${ogMissing.join(', ')}   social shares will look incomplete.`);
  const twPresent = Object.values(twitter).some(Boolean);
  push('Twitter Card tags', twPresent ? 'pass' : 'warn', twPresent ? 'Twitter card tags present.' : 'No Twitter card tags   X/Twitter shares fall back to Open Graph or plain links.');

  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 1) push('H1 heading', 'pass', `Exactly one H1: "${h1s[0].text.slice(0, 80)}"`);
  else if (h1s.length === 0) push('H1 heading', 'fail', 'No H1 heading found. A page should have one clear H1.');
  else push('H1 heading', 'warn', `${h1s.length} H1 headings found   best practice is exactly one per page.`);

  const withAlt = images.filter((i) => i.alt !== null && i.alt.trim() !== '').length;
  if (images.length === 0) push('Image alt text', 'pass', 'No images on the page.');
  else if (withAlt === images.length) push('Image alt text', 'pass', `All ${images.length} images have alt text.`);
  else if (withAlt / images.length >= 0.8) push('Image alt text', 'warn', `${images.length - withAlt} of ${images.length} images are missing alt text.`);
  else push('Image alt text', 'fail', `${images.length - withAlt} of ${images.length} images are missing alt text   hurts accessibility and image search.`);

  if (wordCount >= 300) push('Content length', 'pass', `${wordCount} words of visible text.`);
  else if (wordCount >= 100) push('Content length', 'warn', `Only ${wordCount} words of visible text   thin content struggles to rank.`);
  else push('Content length', 'fail', `Only ${wordCount} words of visible text   this is very thin content.`);

  const internal = links.filter((l) => l.internal === true).length;
  const external = links.filter((l) => l.internal === false).length;
  return {
    title,
    titleLength: title?.length || 0,
    description,
    descriptionLength: description?.length || 0,
    canonical,
    robotsMeta,
    viewport,
    charset: charsetM ? charsetM[1] : null,
    language: langM ? langM[1] : null,
    og,
    twitter,
    headings,
    images: { total: images.length, withAlt, withoutAlt: images.length - withAlt },
    links: { total: links.length, internal, external, nofollow: links.filter((l) => !l.follow).length },
    wordCount,
    checks,
  };
}

// ---------------- on-page SEO audit ----------------

export interface OnPageAudit {
  score: number;
  keyword: string;
  meta: MetaAnalysis;
  keywordDensityPercent: number;
  keywordOccurrences: number;
  checks: CheckItem[];
}

export function onPageSeoAudit(html: string, keyword: string, pageUrl?: string): OnPageAudit {
  const meta = analyzeMetaTags(html, pageUrl);
  const checks: CheckItem[] = [...meta.checks];
  const text = htmlToText(html);
  const words = tokenizeWords(text);
  const kw = keyword.trim().toLowerCase();
  const occurrences = kw ? phraseOccurrences(text, kw) : 0;
  const kwWords = kw ? tokenizeWords(kw).length : 0;
  const density = words.length && kwWords ? Math.round(((occurrences * kwWords) / words.length) * 10000) / 100 : 0;
  const push = (label: string, status: CheckItem['status'], detail: string) => checks.push({ label, status, detail });

  if (kw) {
    const inTitle = meta.title?.toLowerCase().includes(kw);
    push('Keyword in title', inTitle ? 'pass' : 'fail', inTitle ? 'Target keyword appears in the title tag.' : 'Target keyword is missing from the title tag   the strongest on-page signal.');
    const inDesc = meta.description?.toLowerCase().includes(kw);
    push('Keyword in description', inDesc ? 'pass' : 'warn', inDesc ? 'Keyword appears in the meta description.' : 'Keyword missing from the meta description   including it lifts click-through.');
    const h1 = meta.headings.find((h) => h.level === 1);
    const inH1 = h1?.text.toLowerCase().includes(kw);
    push('Keyword in H1', inH1 ? 'pass' : 'fail', inH1 ? 'Keyword appears in the H1.' : 'Keyword is missing from the H1 heading.');
    const first100 = words.slice(0, 100).join(' ');
    const inIntro = first100.includes(kw.replace(/\s+/g, ' ')) || phraseOccurrences(words.slice(0, 100).join(' '), kw) > 0;
    push('Keyword in first 100 words', inIntro ? 'pass' : 'warn', inIntro ? 'Keyword appears early in the content.' : 'Keyword does not appear in the first 100 words   introduce it in the opening paragraph.');
    if (occurrences === 0) push('Keyword density', 'fail', 'Keyword never appears in the body text.');
    else if (density < 0.5) push('Keyword density', 'warn', `Density is ${density}% (${occurrences} mentions)   a little low; 0.5–2.5% is a healthy range.`);
    else if (density <= 2.5) push('Keyword density', 'pass', `Density is ${density}% (${occurrences} mentions)   inside the healthy 0.5–2.5% range.`);
    else push('Keyword density', 'fail', `Density is ${density}% (${occurrences} mentions)   over 2.5% risks keyword-stuffing penalties.`);
    const inH2 = meta.headings.some((h) => h.level === 2 && h.text.toLowerCase().includes(kw));
    push('Keyword in an H2', inH2 ? 'pass' : 'warn', inH2 ? 'Keyword appears in at least one H2 subheading.' : 'No H2 contains the keyword   use it in a subheading where it reads naturally.');
    const images = extractImages(html);
    if (images.length) {
      const inAlt = images.some((i) => i.alt?.toLowerCase().includes(kw));
      push('Keyword in image alt', inAlt ? 'pass' : 'warn', inAlt ? 'Keyword appears in an image alt attribute.' : 'No image alt text contains the keyword.');
    }
    if (pageUrl) {
      const slugPart = pageUrl.toLowerCase().split('/').filter(Boolean).pop() || '';
      const inUrl = slugPart.replace(/-/g, ' ').includes(kw) || pageUrl.toLowerCase().includes(kw.replace(/\s+/g, '-'));
      push('Keyword in URL', inUrl ? 'pass' : 'warn', inUrl ? 'Keyword appears in the URL.' : 'Keyword is not in the URL slug   keyword URLs are a small positive signal.');
    }
  }

  const internal = meta.links.internal;
  const external = meta.links.external;
  push('Internal links', internal > 0 ? 'pass' : 'warn', internal > 0 ? `${internal} internal link(s) help spread authority and guide crawlers.` : 'No internal links found   link to related pages on your site.');
  push('Outbound links', external > 0 ? 'pass' : 'warn', external > 0 ? `${external} outbound link(s) to other sites.` : 'No outbound links   citing authoritative sources supports E-E-A-T.');
  const r = readability(text);
  if (r.words >= 50) {
    if (r.fleschReadingEase >= 60) push('Readability', 'pass', `Flesch Reading Ease ${r.fleschReadingEase}   easy to read for a broad audience.`);
    else if (r.fleschReadingEase >= 40) push('Readability', 'warn', `Flesch Reading Ease ${r.fleschReadingEase}   somewhat difficult; shorten sentences to improve engagement.`);
    else push('Readability', 'fail', `Flesch Reading Ease ${r.fleschReadingEase}   difficult to read; simplify the writing.`);
  }

  const weights = checks.reduce((acc, c) => acc + (c.status === 'pass' ? 1 : c.status === 'warn' ? 0.5 : 0), 0);
  const score = checks.length ? Math.round((weights / checks.length) * 100) : 0;
  return { score, keyword: kw, meta, keywordDensityPercent: density, keywordOccurrences: occurrences, checks };
}

// ---------------- headline analyzer ----------------

const POWER_WORDS = new Set(('ultimate,complete,essential,proven,secret,secrets,powerful,amazing,incredible,free,guaranteed,exclusive,limited,breakthrough,revolutionary,effortless,simple,easy,quick,fast,instant,step-by-step,beginner,advanced,expert,definitive,comprehensive,boost,skyrocket,double,triple,save,win,discover,unlock,transform,master,perfect,best,top,new,latest,greatest,remarkable,stunning,brilliant,smart,genius,hacks,tips,tricks,strategies,mistakes,avoid,never,always,why,how').split(','));
const EMOTIONAL_WORDS = new Set(('love,hate,fear,happy,sad,angry,excited,shocking,surprising,terrifying,beautiful,horrible,wonderful,awful,amazing,furious,thrilled,devastating,inspiring,heartbreaking,outrageous,hilarious,embarrassing,frustrating,delightful,miserable,joy,pride,shame,guilt,hope,anxiety,stress,relief').split(','));
const CLICKBAIT_WORDS = new Set(('unbelievable,mind-blowing,mindblowing,shocking,insane,crazy,epic,fail,won\'t believe,wont believe,what happens next,goes viral,breaks the internet').split(','));

export interface HeadlineAnalysis {
  score: number;
  wordCount: number;
  charCount: number;
  hasNumber: boolean;
  hasPowerWord: boolean;
  powerWordsFound: string[];
  emotionalWordsFound: string[];
  isQuestion: boolean;
  hasBrackets: boolean;
  hasHowTo: boolean;
  commonWordPercent: number;
  checks: CheckItem[];
  scoreLabel: string;
}

export function analyzeHeadline(headline: string): HeadlineAnalysis {
  const h = headline.trim();
  const words = tokenizeWords(h);
  const lower = h.toLowerCase();
  const checks: CheckItem[] = [];
  const push = (label: string, status: CheckItem['status'], detail: string) => checks.push({ label, status, detail });
  let score = 0;

  if (words.length >= 5 && words.length <= 12) { push('Length (words)', 'pass', `${words.length} words   in the 5–12 sweet spot for clicks and sharing.`); score += 18; }
  else if (words.length > 0 && words.length < 5) { push('Length (words)', 'warn', `Only ${words.length} words   short headlines under-explain the value.`); score += 8; }
  else if (words.length > 12) { push('Length (words)', 'warn', `${words.length} words   long headlines get cut off in feeds and results.`); score += 8; }
  else push('Length (words)', 'fail', 'Headline is empty.');

  if (h.length >= 30 && h.length <= 65) { push('Length (characters)', 'pass', `${h.length} characters   fits search results and social cards.`); score += 14; }
  else if (h.length > 0) { push('Length (characters)', 'warn', `${h.length} characters   aim for 30–65 so it is not truncated in Google results.`); score += 6; }

  const hasNumber = /\d/.test(h);
  push('Number', hasNumber ? 'pass' : 'warn', hasNumber ? 'Contains a number   list/number headlines earn measurably more clicks.' : 'No number. Adding one (e.g. "7 Ways…") usually lifts click-through.');
  if (hasNumber) score += 16;

  const powerWordsFound = words.filter((w) => POWER_WORDS.has(w));
  push('Power words', powerWordsFound.length ? 'pass' : 'warn', powerWordsFound.length ? `Power words: ${[...new Set(powerWordsFound)].join(', ')}.` : 'No power words (try: ultimate, proven, essential, step-by-step, free…).');
  score += Math.min(16, powerWordsFound.length * 8);

  const emotionalWordsFound = words.filter((w) => EMOTIONAL_WORDS.has(w));
  push('Emotional pull', emotionalWordsFound.length ? 'pass' : 'warn', emotionalWordsFound.length ? `Emotional words: ${[...new Set(emotionalWordsFound)].join(', ')}.` : 'No emotional words   a little feeling makes headlines memorable.');
  score += Math.min(10, emotionalWordsFound.length * 5);

  const isQuestion = h.includes('?');
  const hasHowTo = /\bhow to\b/.test(lower);
  if (isQuestion || hasHowTo) { push('Format', 'pass', isQuestion ? 'Question format invites the reader to find the answer.' : '"How to" format promises a clear payoff.'); score += 10; }
  else push('Format', 'warn', 'Statement format. Questions and "how to" headlines tend to out-click plain statements.');

  const hasBrackets = /[([{]/.test(h);
  push('Brackets / parentheses', hasBrackets ? 'pass' : 'warn', hasBrackets ? 'Brackets add a clarifying hook and lift CTR.' : 'No brackets. A short bracketed addition like [Guide] or (2026) can lift clicks.');
  if (hasBrackets) score += 8;

  const uncommon = words.filter((w) => !STOPWORDS.has(w)).length;
  const commonWordPercent = words.length ? Math.round(((words.length - uncommon) / words.length) * 100) : 0;
  if (commonWordPercent >= 20 && commonWordPercent <= 40) { push('Word balance', 'pass', `${commonWordPercent}% common words   natural, readable balance.`); score += 8; }
  else push('Word balance', 'warn', `${commonWordPercent}% common words (ideal 20–40%)   too few reads jargon-heavy, too many reads bland.`);

  if (h === h.toUpperCase() && /[A-Z]/.test(h)) { push('Capitalization', 'fail', 'ALL CAPS reads as shouting and hurts trust.'); score -= 10; }
  const clickbait = [...CLICKBAIT_WORDS].filter((w) => lower.includes(w));
  if (clickbait.length) { push('Clickbait risk', 'warn', `Clickbait phrasing detected (${clickbait.join(', ')})   can earn clicks but damages trust and invites demotion.`); score -= 5; }

  score = Math.max(0, Math.min(100, score));
  const scoreLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs work';
  return {
    score, wordCount: words.length, charCount: h.length, hasNumber,
    hasPowerWord: powerWordsFound.length > 0, powerWordsFound: [...new Set(powerWordsFound)],
    emotionalWordsFound: [...new Set(emotionalWordsFound)],
    isQuestion, hasBrackets, hasHowTo, commonWordPercent, checks, scoreLabel,
  };
}

// ---------------- redirect map analysis ----------------

export interface RedirectAnalysis {
  pairs: { from: string; to: string }[];
  chains: { path: string[]; hops: number }[];
  loops: string[][];
  duplicateSources: string[];
  flattened: { from: string; to: string; hops: number }[];
  invalidLines: string[];
}

export function analyzeRedirectMap(text: string): RedirectAnalysis {
  const pairs: { from: string; to: string }[] = [];
  const invalidLines: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/[\s,;]+/).filter(Boolean);
    if (parts.length >= 2) pairs.push({ from: parts[0], to: parts[1] });
    else invalidLines.push(line);
  }
  const map = new Map<string, string>();
  const counts = new Map<string, number>();
  pairs.forEach((p) => {
    counts.set(p.from, (counts.get(p.from) || 0) + 1);
    if (!map.has(p.from)) map.set(p.from, p.to);
  });
  const duplicateSources = [...counts.entries()].filter(([, c]) => c > 1).map(([k]) => k);
  const chains: RedirectAnalysis['chains'] = [];
  const loops: string[][] = [];
  const flattened: RedirectAnalysis['flattened'] = [];
  const seenLoops = new Set<string>();
  for (const start of map.keys()) {
    const path = [start];
    const visited = new Set([start]);
    let current = start;
    let looped = false;
    while (map.has(current)) {
      const next = map.get(current)!;
      if (visited.has(next)) {
        looped = true;
        const loop = [...path.slice(path.indexOf(next)), next];
        const key = [...new Set(loop)].sort().join('|');
        if (!seenLoops.has(key)) { seenLoops.add(key); loops.push(loop); }
        break;
      }
      visited.add(next);
      path.push(next);
      current = next;
    }
    if (!looped) {
      if (path.length > 2) chains.push({ path, hops: path.length - 1 });
      flattened.push({ from: start, to: path[path.length - 1], hops: path.length - 1 });
    }
  }
  return { pairs, chains, loops, duplicateSources, flattened, invalidLines };
}

// ---------------- keyword tools ----------------

export function combineKeywords(lists: string[][]): string[] {
  const cleaned = lists.map((l) => [...new Set(l.map((s) => s.trim()).filter(Boolean))]).filter((l) => l.length);
  if (!cleaned.length) return [];
  let results = cleaned[0];
  for (let i = 1; i < cleaned.length; i++) {
    const next: string[] = [];
    for (const a of results) for (const b of cleaned[i]) next.push(`${a} ${b}`);
    results = next;
  }
  return [...new Set(results)];
}

export function wrapKeyword(keyword: string, matchType: 'broad' | 'phrase' | 'exact' | 'bmm'): string {
  const kw = keyword.trim();
  if (!kw) return '';
  if (matchType === 'phrase') return `"${kw}"`;
  if (matchType === 'exact') return `[${kw}]`;
  if (matchType === 'bmm') return kw.split(/\s+/).map((w) => `+${w}`).join(' ');
  return kw;
}

export interface KeywordCluster {
  label: string;
  keywords: string[];
}

export function clusterKeywords(keywords: string[]): KeywordCluster[] {
  const unique = [...new Set(keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))];
  const tokenSets = unique.map((k) => new Set(tokenizeWords(k)));
  const parent = unique.map((_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const a = tokenSets[i], b = tokenSets[j];
      const shared = [...a].filter((t) => b.has(t));
      const subset = shared.length === Math.min(a.size, b.size);
      const sharedContent = shared.filter((t) => !STOPWORDS.has(t));
      if (
        shared.length >= 2 ||
        (subset && Math.min(a.size, b.size) >= 2) ||
        (sharedContent.some((t) => t.length >= 4) && Math.min(a.size, b.size) <= 3)
      ) {
        union(i, j);
      }
    }
  }
  const groups = new Map<number, string[]>();
  unique.forEach((k, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root)!.push(k);
  });
  return [...groups.values()]
    .map((kws) => {
      const freq = new Map<string, number>();
      kws.forEach((k) => tokenizeWords(k).forEach((t) => { if (!STOPWORDS.has(t)) freq.set(t, (freq.get(t) || 0) + 1); }));
      const label = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t).join(' ') || kws[0];
      return { label, keywords: kws.sort() };
    })
    .sort((a, b) => b.keywords.length - a.keywords.length);
}

// ---------------- minifiers ----------------

export function minifyHtml(html: string, removeComments = true): string {
  const preserved: string[] = [];
  let s = html.replace(/<(pre|textarea|script|style)[\s\S]*?<\/\1>/gi, (m) => {
    preserved.push(m);
    return `\u0000${preserved.length - 1}\u0000`;
  });
  if (removeComments) s = s.replace(/<!--(?!!\[if)[\s\S]*?-->/g, '');
  s = s.replace(/>\s+</g, '><');
  s = s.replace(/\s{2,}/g, ' ');
  s = s.trim();
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => preserved[parseInt(i, 10)]);
  return s;
}

export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export function minifyJs(js: string): string {
  let out = '';
  let i = 0;
  let state: 'code' | 'sq' | 'dq' | 'tpl' | 'regex' = 'code';
  let prevSignificant = '';
  const regexAllowedAfter = new Set(['', '(', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', ',', '+', '-', '*', '%', '<', '>', '^', '~']);
  while (i < js.length) {
    const c = js[i];
    const next = js[i + 1] || '';
    if (state === 'code') {
      if (c === '/' && next === '/') {
        while (i < js.length && js[i] !== '\n') i++;
        continue;
      }
      if (c === '/' && next === '*') {
        i += 2;
        while (i < js.length && !(js[i] === '*' && js[i + 1] === '/')) i++;
        i += 2;
        out += ' ';
        continue;
      }
      if (c === "'") state = 'sq';
      else if (c === '"') state = 'dq';
      else if (c === '`') state = 'tpl';
      else if (c === '/' && regexAllowedAfter.has(prevSignificant)) state = 'regex';
      out += c;
      if (!/\s/.test(c)) prevSignificant = c;
      i++;
      continue;
    }
    // inside a literal
    out += c;
    if (c === '\\') {
      out += next;
      i += 2;
      continue;
    }
    if ((state === 'sq' && c === "'") || (state === 'dq' && c === '"') || (state === 'tpl' && c === '`')) {
      state = 'code';
      prevSignificant = c;
    } else if (state === 'regex' && c === '/') {
      state = 'code';
      prevSignificant = '/';
    } else if (state === 'regex' && c === '\n') {
      state = 'code';
    }
    i++;
  }
  return out
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l.length)
    .join('\n');
}

// ---------------- small builders ----------------

export function buildUtmUrl(base: string, params: { source?: string; medium?: string; campaign?: string; term?: string; content?: string }): string {
  const u = new URL(base);
  const set = (k: string, v?: string) => { if (v && v.trim()) u.searchParams.set(k, v.trim()); };
  set('utm_source', params.source);
  set('utm_medium', params.medium);
  set('utm_campaign', params.campaign);
  set('utm_term', params.term);
  set('utm_content', params.content);
  return u.toString();
}

export interface HreflangEntry {
  lang: string; // e.g. en, en-US, x-default
  url: string;
}

export function buildHreflangLinkTags(entries: HreflangEntry[]): string {
  return entries
    .filter((e) => e.lang && e.url)
    .map((e) => `<link rel="alternate" hreflang="${e.lang}" href="${e.url}" />`)
    .join('\n');
}

export function buildHreflangSitemap(urls: { loc: string; alternates: HreflangEntry[] }[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = urls
    .map((u) => {
      const alts = u.alternates
        .filter((a) => a.lang && a.url)
        .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${esc(a.url)}" />`)
        .join('\n');
      return `  <url>\n    <loc>${esc(u.loc)}</loc>\n${alts}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}
