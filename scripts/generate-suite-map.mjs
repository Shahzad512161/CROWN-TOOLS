// Generates src/lib/tool-suites.ts: tool slug -> suite id, extracted from the
// suite registries (src/components/tools/<suite>/index.ts). Precedence matches
// ToolWrapper's check order: pdf, seo, dev, image, media, ai, social, student.
// Re-run after adding/removing tools from a registry.
import { readFileSync, writeFileSync } from 'node:fs';

const SUITES = ['pdf', 'seo', 'dev', 'image', 'media', 'ai', 'social', 'student'];
const map = {};
for (const suite of SUITES) {
  const src = readFileSync(new URL(`../src/components/tools/${suite}/index.ts`, import.meta.url), 'utf8');
  const block = src.split(/_TOOL_COMPONENTS[^=]*=/)[1];
  if (!block) throw new Error(`registry not found for suite ${suite}`);
  for (const m of block.matchAll(/^\s*'([^']+)':/gm)) {
    if (!(m[1] in map)) map[m[1]] = suite;
  }
}

// The PDF registry is big enough to split per source file: map each of its
// slugs to { group: source file base name, name: exported component name }.
const pdfSrc = readFileSync(new URL('../src/components/tools/pdf/index.ts', import.meta.url), 'utf8');
const identGroup = {};
for (const m of pdfSrc.matchAll(/import\s*\{([^}]+)\}\s*from\s*'(?:\.\.\/word\/|\.\/)([A-Za-z]+)'/gs)) {
  const group = m[2];
  for (const ident of m[1].split(',').map((s) => s.trim()).filter(Boolean)) identGroup[ident] = group;
}
const pdfBlock = pdfSrc.split(/PDF_TOOL_COMPONENTS[^=]*=/)[1];
const pdfMap = {};
for (const m of pdfBlock.matchAll(/^\s*'([^']+)':\s*([A-Za-z0-9_]+)/gm)) {
  pdfMap[m[1]] = { group: identGroup[m[2]], name: m[2] };
}

const body = `/**
 * Tool slug -> suite id, generated from the suite registries by
 * scripts/generate-suite-map.mjs. Used to lazy-load only the suite a tool
 * page needs. Slugs absent here use a standalone calculator or the generic
 * engine.
 */
export type SuiteId = 'pdf' | 'seo' | 'dev' | 'image' | 'media' | 'ai' | 'social' | 'student';

export const TOOL_SUITE_MAP: Record<string, SuiteId> = ${JSON.stringify(map, null, 1)};

/** PDF/Word slugs load per source-file group so one PDF page stays light. */
export const PDF_SLUG_COMPONENT: Record<string, { group: string; name: string }> = ${JSON.stringify(pdfMap, null, 1)};
`;
writeFileSync(new URL('../src/lib/tool-suites.ts', import.meta.url), body);
console.log(`tool-suites.ts generated: ${Object.keys(map).length} slugs, ${Object.keys(pdfMap).length} pdf-grouped`);
