// Express entry point for Hostinger deployment.
// Serves the Vite production build in dist/ with SPA fallback, so every
// client-side route (tools, blog, guides) loads index.html.
//
// SEO shell (Ahrefs fixes, 2026-10-24): the static index.html shipped for
// every URL used to carry ONE canonical (https://freeomnitools.online/en),
// ONE title and ONE meta description, so any crawler that does not run JS
// saw every sitemap URL as a non-canonical duplicate of the homepage,
// with no H1 and no links. The fallback below injects, per requested URL:
//   - a self-canonical <link rel="canonical"> matching the sitemap URL
//   - hreflang alternates for the same page in all 5 languages
//   - a per-page <title> (<=60 chars) and meta description (<=160 chars)
//   - a <noscript> block with an H1, a short description and real <a> links
//     (home, blog index, about, contact, prev/next in category, and the
//     tool<->blog counterpart), so the page has outgoing links and content
//     even before JS runs.
// The JS app then takes over and its head manager sets the same values
// (App.tsx truncates identically), so JS and non-JS crawlers agree.
// Tool data comes from dist/seo-catalog.json, generated at build time
// (scripts/generate-seo-catalog.mjs); if it is missing the shell still
// emits a correct self-canonical with generic title/description.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const app = express();

const BASE = 'https://freeomnitools.online';
const LANGS = ['en', 'es', 'fr', 'ar', 'ru'];
const OG_LOCALE = { en: 'en_US', es: 'es_ES', fr: 'fr_FR', ar: 'ar_SA', ru: 'ru_RU' };
const HOME_TITLE = 'Free Omni Tools | 250+ Free Online Tools';
const HOME_DESC =
  '250+ free online tools, calculators, PDF converters and image utilities. 100% unlocked, no sign-up, no paywalls, everything runs in your browser.';
const STATIC_PAGES = {
  about: { title: 'About Us | Free Omni Tools', desc: 'Learn about Free Omni Tools, the free online toolkit with 250+ calculators, converters and utilities that run entirely in your browser.' },
  privacy: { title: 'Privacy Policy | Free Omni Tools', desc: 'Free Omni Tools privacy policy: tools run in your browser, no sign-up required, and your inputs are not stored on our servers.' },
  contact: { title: 'Contact Us | Free Omni Tools', desc: 'Contact Free Omni Tools for support, tool requests or feedback on our free online calculators, converters and utilities.' },
  blog: { title: 'Blog | Free Omni Tools', desc: 'Free Omni Tools guides: how-to articles and explanations for our calculators, converters, PDF tools and everyday utilities.' },
};

let shell = '';
try {
  shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
} catch {
  console.warn('SEO shell: dist/index.html not found yet (run npm run build first)');
}

let catalog = [];
try {
  catalog = JSON.parse(fs.readFileSync(path.join(distDir, 'seo-catalog.json'), 'utf8')).tools || [];
} catch {
  console.warn('SEO shell: dist/seo-catalog.json not found — shell falls back to generic titles');
}
const bySlug = new Map(catalog.map((t) => [t.slug, t]));
const byCategory = new Map();
for (const t of catalog) {
  if (!byCategory.has(t.category)) byCategory.set(t.category, []);
  byCategory.get(t.category).push(t);
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const trunc = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max).replace(/\s+\S*$/, '').trim();
  return cut || s.slice(0, max).trim();
};

// Correct MIME for WebAssembly assets (ort/ffmpeg workers in dist/assets)
express.static.mime.define({ 'application/wasm': ['wasm'] });

// Long cache for hashed build assets; never cache index.html
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }),
);
app.use(express.static(distDir, { maxAge: '1d' }));

// 301 redirects (Ahrefs found 2 3XX in the sample; these are the only
// redirect shapes this app should ever produce — they canonicalise URLs
// without changing any slug):
//   - trailing slash -> same URL without it (e.g. /en/tool/x/ -> /en/tool/x)
//   - unprefixed /tool/<slug> and /blog/<slug> -> /en/tool/<slug>, /en/blog/<slug>
// Bare "/" is NOT redirected: App.tsx rewrites it client-side to /en.
app.use((req, res, next) => {
  const [urlPath, query] = req.url.split('?');
  const suffix = query ? `?${query}` : '';
  if (urlPath.length > 1 && urlPath.endsWith('/')) {
    return res.redirect(301, urlPath.slice(0, -1) + suffix);
  }
  const unprefixed = urlPath.match(/^\/(tool|blog)\/(.+)$/);
  if (unprefixed) {
    return res.redirect(301, `/en/${unprefixed[1]}/${unprefixed[2]}${suffix}`);
  }
  next();
});

function seoPage(urlPath) {
  const parts = urlPath.split('/').filter(Boolean);
  const lang = LANGS.includes(parts[0]) ? parts[0] : 'en';
  const kind = parts[1]; // undefined | 'tool' | 'blog' | static page
  const slug = parts[2];
  const canonicalPath = `/${lang}${kind ? `/${kind}` : ''}${slug ? `/${slug}` : ''}`;
  const canonical = `${BASE}${canonicalPath}`;
  let title = HOME_TITLE;
  let desc = HOME_DESC;
  let h1 = 'Free Omni Tools';
  let links = '';
  const link = (href, label) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;

  if (!kind) {
    // Homepage
    links = [link(`/${lang}/blog`, 'Blog'), link(`/${lang}/about`, 'About Us'), link(`/${lang}/contact`, 'Contact Us')].join(' | ');
  } else if ((kind === 'tool' || kind === 'blog') && slug) {
    // NOTE: this branch must come BEFORE the STATIC_PAGES check, because
    // 'blog' is both a static index page (/en/blog) and a post prefix
    // (/en/blog/<slug>). With the slug present it is a post, not the index.
    // (The index case, with no slug, falls through to STATIC_PAGES below.)
    const tool = bySlug.get(slug);
    if (tool) {
      if (kind === 'tool') {
        title = trunc(`${tool.name} | Free Omni Tools`, 60);
        desc = tool.description;
        h1 = tool.name;
      } else {
        title = trunc(`${tool.name} Guide | Free Omni Tools`, 60);
        desc = trunc(`How to use the ${tool.name}: a complete guide with steps, examples and FAQs.`, 160);
        h1 = `${tool.name} Guide`;
      }
      const siblings = byCategory.get(tool.category) || [];
      const idx = siblings.findIndex((t) => t.slug === slug);
      const prev = siblings.length > 1 ? siblings[(idx - 1 + siblings.length) % siblings.length] : null;
      const next = siblings.length > 1 ? siblings[(idx + 1) % siblings.length] : null;
      const counterpart = kind === 'tool' ? `/${lang}/blog/${slug}` : `/${lang}/tool/${slug}`;
      const counterpartLabel = kind === 'tool' ? `${tool.name} Guide` : tool.name;
      const extra = [
        link(`/${lang}`, 'Free Omni Tools'),
        link(`/${lang}/blog`, 'Blog'),
        prev ? link(`/${lang}/${kind}/${prev.slug}`, prev.name) : null,
        next ? link(`/${lang}/${kind}/${next.slug}`, next.name) : null,
        link(counterpart, counterpartLabel),
      ].filter(Boolean);
      links = extra.join(' | ');
    } else {
      // Unknown slug: JS renders the not-found view (which has an H1).
      // Keep the canonical self-referential and do not invent a tool page.
      title = 'Page Not Found | Free Omni Tools';
      desc = 'This page does not exist on Free Omni Tools. Browse 250+ free online tools, calculators and converters instead.';
      h1 = 'Page Not Found';
      links = [link(`/${lang}`, 'Free Omni Tools'), link(`/${lang}/blog`, 'Blog'), link(`/${lang}/about`, 'About Us'), link(`/${lang}/contact`, 'Contact Us')].join(' | ');
    }
  } else if (STATIC_PAGES[kind]) {
    title = STATIC_PAGES[kind].title;
    desc = STATIC_PAGES[kind].desc;
    h1 = STATIC_PAGES[kind].title.split(' | ')[0];
    links = [link(`/${lang}`, 'Free Omni Tools'), link(`/${lang}/blog`, 'Blog'), link(`/${lang}/about`, 'About Us'), link(`/${lang}/contact`, 'Contact Us')].join(' | ');
  } else {
    links = [link(`/${lang}`, 'Free Omni Tools'), link(`/${lang}/blog`, 'Blog')].join(' | ');
  }

  let html = shell || '<!doctype html><html><head><title></title></head><body><div id="root"></div></body></html>';
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(desc)}" />`,
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />`,
  );
  for (const l of LANGS) {
    html = html.replace(
      new RegExp(`<link rel="alternate" hreflang="${l}" href="[^"]*" />`),
      `<link rel="alternate" hreflang="${l}" href="${BASE}/${l}${kind ? `/${kind}` : ''}${slug ? `/${slug}` : ''}" />`,
    );
  }
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="x-default" href="${BASE}/en${kind ? `/${kind}` : ''}${slug ? `/${slug}` : ''}" />`,
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = html.replace(
    /<meta property="og:locale" content="[^"]*" \/>/,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(desc)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(desc)}" />`,
  );
  // <noscript> content: only read by crawlers and no-JS browsers; the JS
  // app renders into #root and never touches this block.
  const noscript = `<noscript><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(desc)}</p><nav>${links}</nav></noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${noscript}`);
  return html;
}

// SPA fallback: any non-file route serves the SEO-injected index.html
app.get('*', (req, res) => {
  res.send(seoPage(req.path));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`CROWN-TOOLS serving ${distDir} on port ${port}`);
});
