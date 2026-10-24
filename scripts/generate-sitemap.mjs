// Regenerates the SEO files in public/ from the REAL route set of the app:
//   - sitemap.xml        -> sitemap INDEX pointing at one sitemap per language
//   - sitemap-<loc>.xml  -> that language's EVERY page, each entry carrying
//                           hreflang alternates for all locales + x-default
//   - robots.txt         -> allow-all + sitemap index reference
//   - llms.txt           -> AI-readable index (llmstxt.org format) of the
//                           hand-curated tools + main pages, with a pointer
//                           to the sitemap for the full catalog
//
// Route set (per language) — this is exactly what App.tsx renders, nothing
// more, nothing less, so there are no broken or orphan sitemap URLs:
//   /<lang>                      home
//   /<lang>/about  /privacy  /contact  /blog
//   /<lang>/tool/<slug>      for EVERY slug in ALL_TOOLS (7,300 at last count:
//                           251 hand-curated + programmatic catalog — the
//                           old generator only listed the 251, which is why
//                           the sitemap looked "not correct")
//   /<lang>/blog/<slug>      for EVERY tool slug (BlogPostDetail renders a
//                           generated guide for any valid tool slug)
// NOT included on purpose (they are not routes):
//   /terms, /disclaimer    -> legal MODALS, not pages (no URL change)
//   ?tool=<slug>           -> duplicate of /tool/<slug>; canonical points there
//   bare https://freeomnitools.online/ -> App rewrites it to /en (x-default)
//   category anchors       -> in-page sections on home, not pages
//
// Run with:  npx tsx scripts/generate-sitemap.mjs
// (tsx is needed because the slug list is imported from the TypeScript
// catalog — parsing tools-data.ts with regexes again would drift the moment
// the catalog generation changes, which is exactly how the old 251-only
// sitemap happened.)
import { readFileSync, writeFileSync } from 'node:fs';
import { ALL_TOOLS } from '../src/lib/tools-data.ts';

const BASE = 'https://freeomnitools.online';
const today = new Date().toISOString().slice(0, 10);

// Locales: English (default) /en, Spanish /es, French /fr, Arabic /ar (RTL), Russian /ru.
const LOCALES = ['en', 'es', 'fr', 'ar', 'ru'];
const LOCALE_NAMES = { en: 'English', es: 'Español', fr: 'Français', ar: 'العربية', ru: 'Русский' };

const slugs = [...new Set(ALL_TOOLS.map((t) => t.slug))].sort();
if (slugs.length !== ALL_TOOLS.length) {
  throw new Error(`Duplicate slugs in catalog: ${ALL_TOOLS.length} tools, ${slugs.length} unique`);
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
  ...slugs.map((s) => ({ path: `/tool/${s}`, changefreq: 'weekly', priority: '0.9' })),
  ...slugs.map((s) => ({ path: `/blog/${s}`, changefreq: 'weekly', priority: '0.8' })),
];

// ---- Per-language sitemaps -------------------------------------------------
// NOTE on hreflang: it is deliberately NOT duplicated here. Every page
// already carries the full hreflang set in its <head> (App.tsx ensureLink:
// self + all 5 locales + x-default), which is Google's recommended method
// alongside a sitemap. Duplicating it for 73,025 URLs would bloat each
// language file from ~3 MB to ~14 MB for zero extra signal, and make the
// files painful to open in a browser. Language separation here comes from
// the URLs themselves: sitemap-en.xml lists only /en/ URLs, and so on.
for (const loc of LOCALES) {
  const entries = paths.map(({ path, changefreq, priority }) =>
    `  <url>\n    <loc>${BASE}/${loc}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  );
  writeFileSync(
    new URL(`../public/sitemap-${loc}.xml`, import.meta.url),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
  );
  console.log(`sitemap-${loc}.xml: ${entries.length} urls`);
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
  `# Free Omni Tools — all content is public and crawlable in every locale.\nUser-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`
);

// ---- llms.txt -------------------------------------------------------------------
// The curated tools are the ones with hand-written names/descriptions in
// TOP_8 + CURATED_ADDITIONAL_TOOLS; the programmatic catalog tools share a
// template description, so listing all 7,300 here would be noise. llms.txt
// therefore lists the curated set + main pages, and points at the sitemap
// index for the complete catalog (that is the file crawlers should use for
// completeness, and it is what keeps llms.txt honest about its scope).
const src = readFileSync(new URL('../src/lib/tools-data.ts', import.meta.url), 'utf8');
const top8 = src.split('const TOP_8_TOOLS')[1].split('];')[0];
const curated = src.split('const CURATED_ADDITIONAL_TOOLS')[1].split('\n];')[0];
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
const curatedCount = [...byCategory.values()].reduce((n, a) => n + a.length, 0);
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

> Free online tools that run 100% in the browser — no sign-up, no uploads, no tracking. ${slugs.length} tool pages and ${slugs.length} matching blog guides, published in five languages: English (/en), Spanish (/es), French (/fr), Arabic (/ar, right-to-left) and Russian (/ru). Every page exists under each locale prefix; swap the prefix to read the same page in another language.

> Complete catalog: the full list of all ${slugs.length} tools (and their blog guides) in every language is in the sitemap index at ${BASE}/sitemap.xml — one sitemap per language (sitemap-en.xml, sitemap-es.xml, sitemap-fr.xml, sitemap-ar.xml, sitemap-ru.xml). The ${curatedCount} curated tools listed below are the hand-written set; the remaining pages are the programmatic catalog, each with a working in-browser tool.

## Languages

${LOCALES.map((l) => `- [Free Omni Tools in ${LOCALE_NAMES[l]}](${BASE}/${l})`).join('\n')}

## Main pages (English; replace /en with /es, /fr, /ar or /ru for other languages)

- [Home](${BASE}/en): Browse and search all tools by category.
- [About](${BASE}/en/about): What Free Omni Tools is and how it works.
- [Blog](${BASE}/en/blog): In-depth guides for every tool — formulas, examples and expert tips.
- [Contact](${BASE}/en/contact): Get in touch with the team.
- [Privacy Policy](${BASE}/en/privacy): How the site handles data (all tools run client-side; nothing is uploaded).

## Curated tools

${catSections}
`;
writeFileSync(new URL('../public/llms.txt', import.meta.url), llms);

console.log(`robots.txt + llms.txt written (curated tools in llms.txt: ${curatedCount}; total catalog: ${slugs.length})`);
console.log(`Per-language sitemap urls: ${paths.length} (5 static + ${slugs.length} tools + ${slugs.length} blog guides)`);
