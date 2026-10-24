// Builds dist/seo-catalog.json for server.js's SEO shell (see server.js).
// The catalog is the same ALL_TOOLS list the app renders from, in the same
// order, so the server can compute each tool's prev/next neighbours in its
// category without duplicating the catalog logic.
// Run with:  npx tsx scripts/generate-seo-catalog.mjs
// (invoked automatically by `npm run build`, after vite build.)
import { writeFileSync } from 'node:fs';
import { ALL_TOOLS } from '../src/lib/tools-data.ts';

const trunc = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max).replace(/\s+\S*$/, '').trim();
  return cut || s.slice(0, max).trim();
};

const tools = ALL_TOOLS.map((t) => ({
  slug: t.slug,
  name: t.name,
  // Description is capped here so the server shell can never emit a
  // >160-char meta description, even for the longest generated names.
  description: trunc(t.description, 160),
  category: t.category,
}));

writeFileSync(
  new URL('../dist/seo-catalog.json', import.meta.url),
  JSON.stringify({ tools }),
);
console.log(`seo-catalog: ${tools.length} tools -> dist/seo-catalog.json`);
