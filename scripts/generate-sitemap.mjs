// Regenerates public/sitemap.xml from the real (TOP_8 + CURATED) tool slugs
// in src/lib/tools-data.ts plus the static pages.
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://ais-dev-mb6kxrssbsl3owvmcbb7wm-851298616605.asia-southeast1.run.app';
const today = new Date().toISOString().slice(0, 10);

const src = readFileSync(new URL('../src/lib/tools-data.ts', import.meta.url), 'utf8');
const top8 = src.split('const TOP_8_TOOLS')[1].split('];')[0];
const curated = src.split('const CURATED_ADDITIONAL_TOOLS')[1].split('\n];')[0];
const slugs = new Set();
for (const chunk of [top8, curated]) {
  for (const m of chunk.matchAll(/slug: '([^']+)'/g)) slugs.add(m[1]);
}

// Locales: English (default) under /en, French under /fr. Every URL is
// emitted once per locale with hreflang alternates (x-default -> /en).
const LOCALES = ['en', 'fr'];

const staticPages = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
];

const url = (path, changefreq, priority) =>
  LOCALES.map((loc) => {
    const alternates = [
      ...LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}/${l}${path}"/>`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/en${path}"/>`,
    ].join('\n');
    return `  <url>\n    <loc>${BASE}/${loc}${path}</loc>\n${alternates}\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });

const entries = [
  ...staticPages.flatMap((p) => url(p.path, p.changefreq, p.priority)),
  ...[...slugs].sort().flatMap((s) => url(`/tool/${s}`, 'weekly', '0.9')),
];

writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`
);
console.log(`sitemap regenerated: ${entries.length} URLs (${slugs.size} real tools + ${staticPages.length} static, x ${LOCALES.length} locales)`);
