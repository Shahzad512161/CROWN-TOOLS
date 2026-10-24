// Regenerates the SEO files in public/ from the real (TOP_8 + CURATED) tool
// slugs in src/lib/tools-data.ts:
//   - sitemap.xml        -> sitemap INDEX pointing at one sitemap per language
//   - sitemap-<loc>.xml  -> that language's pages (static + tools), each entry
//                           carrying hreflang alternates for all locales
//   - robots.txt         -> allow-all + sitemap index reference
//   - llms.txt           -> AI-readable index of the site (llmstxt.org format)
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://ais-dev-mb6kxrssbsl3owvmcbb7wm-851298616605.asia-southeast1.run.app';
const today = new Date().toISOString().slice(0, 10);

// Locales: English (default) /en, Spanish /es, French /fr, Arabic /ar (RTL), Russian /ru.
const LOCALES = ['en', 'es', 'fr', 'ar', 'ru'];
const LOCALE_NAMES = { en: 'English', es: 'Español', fr: 'Français', ar: 'العربية', ru: 'Русский' };

const src = readFileSync(new URL('../src/lib/tools-data.ts', import.meta.url), 'utf8');
const top8 = src.split('const TOP_8_TOOLS')[1].split('];')[0];
const curated = src.split('const CURATED_ADDITIONAL_TOOLS')[1].split('\n];')[0];
const slugs = new Set();
for (const chunk of [top8, curated]) {
  for (const m of chunk.matchAll(/slug: '([^']+)'/g)) slugs.add(m[1]);
}

const staticPages = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
];

const paths = [
  ...staticPages,
  ...[...slugs].sort().map((s) => ({ path: `/tool/${s}`, changefreq: 'weekly', priority: '0.9' }))
];

// ---- Per-language sitemaps -------------------------------------------------
for (const loc of LOCALES) {
  const entries = paths.map(({ path, changefreq, priority }) => {
    const alternates = [
      ...LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${path}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en${path}"/>`
    ].join('\n');
    return `  <url>\n    <loc>${BASE}/${loc}${path}</loc>\n${alternates}\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });
  writeFileSync(
    new URL(`../public/sitemap-${loc}.xml`, import.meta.url),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
  );
}

// ---- Sitemap index -----------------------------------------------------------
const indexEntries = LOCALES.map(
  (loc) => `  <sitemap>\n    <loc>${BASE}/sitemap-${loc}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
).join('\n');
writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries}\n</sitemapindex>\n`
);

// ---- robots.txt ---------------------------------------------------------------
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `# Free Omni Tools   all content is public and crawlable in every locale.
User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`
);

// ---- llms.txt -------------------------------------------------------------------
// Escape-aware extraction of slug/name/category/description for the 251 real tools.
const un = (t) => t.replace(/\\'/g, "'");
const toolRe = /slug: '([^']+)',\s*name: '((?:[^'\\]|\\.)*)',\s*category: '([^']+)',\s*description: '((?:[^'\\]|\\.)*)'/g;
const byCategory = new Map();
for (const chunk of [top8, curated]) {
  for (const m of chunk.matchAll(toolRe)) {
    const [, slug, name, category, description] = m;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push({ slug, name: un(name), description: un(description) });
  }
}
const catSections = [...byCategory.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([category, tools]) => {
    const lines = tools
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => `- [${t.name}](${BASE}/en/tool/${t.slug}): ${t.description}`)
      .join('\n');
    return `### ${category}\n\n${lines}`;
  })
  .join('\n\n');

const llms = `# Free Omni Tools

> Free online tools that run 100% in the browser   no sign-up, no uploads, no tracking. ${slugs.size} real tools across PDF, Word, image, video & audio, SEO, developer, AI, social media, student and everyday calculators, published in five languages: English (/en), Spanish (/es), French (/fr), Arabic (/ar, right-to-left) and Russian (/ru). Every page exists under each locale prefix; swap the prefix to read the same page in another language.

## Languages

${LOCALES.map((l) => `- [Free Omni Tools in ${LOCALE_NAMES[l]}](${BASE}/${l})`).join('\n')}

## Main pages (English; replace /en with /es, /fr, /ar or /ru for other languages)

- [Home](${BASE}/en): Browse and search all tools by category.
- [About](${BASE}/en/about): What Free Omni Tools is and how it works.
- [Blog](${BASE}/en/blog): In-depth guides for every tool   formulas, examples and expert tips.
- [Contact](${BASE}/en/contact): Get in touch with the team.
- [Privacy Policy](${BASE}/en/privacy): How the site handles data (all tools run client-side; nothing is uploaded).

## Tools

${catSections}
`;
writeFileSync(new URL('../public/llms.txt', import.meta.url), llms);

console.log(
  `SEO files regenerated: sitemap index + ${LOCALES.length} locale sitemaps (${paths.length} URLs each), robots.txt, llms.txt (${slugs.size} tools)`
);
