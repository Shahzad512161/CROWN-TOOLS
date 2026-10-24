// ============================================================
// Free Omni Tools   Developer engine
// Pure helpers behind the Developer Tools suite: JSON format /
// convert / diff, CSV, YAML (subset), JSON->TypeScript, XML and
// SQL formatters, encodings, JWT, hashes (pure-TS MD5 + WebCrypto
// SHA/HMAC), password/UUID generators, cron engine, color math,
// base conversion, URL + user-agent parsing, line diff, chmod.
// ============================================================

// ---------------- JSON ----------------

export interface JsonFormatResult {
  ok: boolean;
  output?: string;
  error?: { message: string; position?: number; line?: number; column?: number };
}

function positionToLineCol(text: string, position: number): { line: number; column: number } {
  const upto = text.slice(0, position);
  const lines = upto.split('\n');
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>).sort().forEach((k) => {
      out[k] = sortKeysDeep((value as Record<string, unknown>)[k]);
    });
    return out;
  }
  return value;
}

export function formatJson(text: string, indent: number | 'tab' = 2, sortKeys = false): JsonFormatResult {
  try {
    let value: unknown = JSON.parse(text);
    if (sortKeys) value = sortKeysDeep(value);
    return { ok: true, output: JSON.stringify(value, null, indent === 'tab' ? '\t' : indent) };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    const posMatch = message.match(/position (\d+)/i);
    if (posMatch) {
      const position = parseInt(posMatch[1], 10);
      const { line, column } = positionToLineCol(text, position);
      return { ok: false, error: { message, position, line, column } };
    }
    return { ok: false, error: { message } };
  }
}

export function minifyJson(text: string): JsonFormatResult {
  try {
    return { ok: true, output: JSON.stringify(JSON.parse(text)) };
  } catch (e) {
    return { ok: false, error: { message: e instanceof Error ? e.message : 'Invalid JSON' } };
  }
}

export interface JsonChange {
  path: string;
  type: 'added' | 'removed' | 'changed';
  oldValue?: unknown;
  newValue?: unknown;
}

export function jsonDiff(a: unknown, b: unknown, path = '$', out: JsonChange[] = []): JsonChange[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  const aObj = a !== null && typeof a === 'object';
  const bObj = b !== null && typeof b === 'object';
  if (!aObj || !bObj || Array.isArray(a) !== Array.isArray(b)) {
    out.push({ path, type: 'changed', oldValue: a, newValue: b });
    return out;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      if (i >= a.length) out.push({ path: `${path}[${i}]`, type: 'added', newValue: b[i] });
      else if (i >= b.length) out.push({ path: `${path}[${i}]`, type: 'removed', oldValue: a[i] });
      else jsonDiff(a[i], b[i], `${path}[${i}]`, out);
    }
    return out;
  }
  const aRec = a as Record<string, unknown>;
  const bRec = b as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(aRec), ...Object.keys(bRec)])];
  for (const k of keys) {
    const p = `${path}.${k}`;
    if (!(k in aRec)) out.push({ path: p, type: 'added', newValue: bRec[k] });
    else if (!(k in bRec)) out.push({ path: p, type: 'removed', oldValue: aRec[k] });
    else jsonDiff(aRec[k], bRec[k], p, out);
  }
  return out;
}

// ---------------- CSV ----------------

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function jsonToCsv(jsonText: string): string {
  const data: unknown = JSON.parse(jsonText);
  const items: unknown[] = Array.isArray(data) ? data : [data];
  if (!items.length) return '';
  if (items.every((x) => x === null || typeof x !== 'object')) {
    return ['value', ...items.map((x) => csvEscape(x === null ? '' : String(x)))].join('\n');
  }
  const columns: string[] = [];
  items.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((k) => { if (!columns.includes(k)) columns.push(k); });
    }
  });
  const lines = [columns.map(csvEscape).join(',')];
  items.forEach((item) => {
    const rec = (item || {}) as Record<string, unknown>;
    lines.push(columns.map((col) => {
      const v = rec[col];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return csvEscape(JSON.stringify(v));
      return csvEscape(String(v));
    }).join(','));
  });
  return lines.join('\n');
}

function inferCell(raw: string): unknown {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d*\.\d+([eE][+-]?\d+)?$/.test(v) || /^-?\d+[eE][+-]?\d+$/.test(v)) return parseFloat(v);
  return raw;
}

export function csvToJson(csvText: string, inferTypes = true): unknown[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const cell = row[i] ?? '';
      obj[h] = inferTypes ? inferCell(cell) : cell;
    });
    return obj;
  });
}

// ---------------- YAML (subset) ----------------

function yamlScalarToString(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  const s = String(v);
  if (s === '') return '""';
  const needsQuote =
    /[:#\n\t"']/.test(s) ||
    /^[\s\-?!&*\[\]{},|>@`]/.test(s) ||
    /\s$/.test(s) ||
    /^(true|false|null|~|yes|no|on|off)$/i.test(s) ||
    /^-?\d+(\.\d+)?$/.test(s);
  return needsQuote ? JSON.stringify(s) : s;
}

export function jsonToYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (value === null || typeof value !== 'object') return `${pad}${yamlScalarToString(value)}\n`;
  if (Array.isArray(value)) {
    if (!value.length) return `${pad}[]\n`;
    let out = '';
    for (const item of value) {
      if (item !== null && typeof item === 'object') {
        const sub = jsonToYaml(item, indent + 1);
        // Move the first line of the nested block onto the "- " line
        out += `${pad}- ${sub.slice(pad.length + 2)}`;
      } else {
        out += `${pad}- ${yamlScalarToString(item)}\n`;
      }
    }
    return out;
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return `${pad}{}\n`;
  let out = '';
  for (const [k, v] of entries) {
    const key = /^[A-Za-z0-9_-]+$/.test(k) ? k : JSON.stringify(k);
    if (v !== null && typeof v === 'object' && (Array.isArray(v) ? v.length : Object.keys(v).length)) {
      out += `${pad}${key}:\n${jsonToYaml(v, indent + 1)}`;
    } else if (v !== null && typeof v === 'object') {
      out += `${pad}${key}: ${Array.isArray(v) ? '[]' : '{}'}\n`;
    } else {
      out += `${pad}${key}: ${yamlScalarToString(v)}\n`;
    }
  }
  return out;
}

interface YamlLine { indent: number; content: string }

function parseYamlScalar(raw: string): unknown {
  const v = raw.trim();
  if (v === '' || v === '~' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"')) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return splitFlow(inner).map(parseYamlScalar);
  }
  if (v.startsWith('{') && v.endsWith('}')) {
    const inner = v.slice(1, -1).trim();
    const obj: Record<string, unknown> = {};
    if (inner) splitFlow(inner).forEach((pair) => {
      const idx = pair.indexOf(':');
      if (idx > -1) obj[String(parseYamlScalar(pair.slice(0, idx)))] = parseYamlScalar(pair.slice(idx + 1));
    });
    return obj;
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d*\.\d+([eE][+-]?\d+)?$/.test(v)) return parseFloat(v);
  return v;
}

function splitFlow(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0; let cur = ''; let quote = '';
  for (const c of inner) {
    if (quote) { cur += c; if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === '[' || c === '{') depth++;
    if (c === ']' || c === '}') depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim());
}

const YAML_KEY_RE = /^("(?:[^"\\]|\\.)*"|'[^']*'|[^:#\s][^:]*?):(\s+(.*))?$/;

function parseYamlBlock(lines: YamlLine[], start: number, indent: number): [unknown, number] {
  let i = start;
  if (i >= lines.length) return [null, i];
  const isList = lines[i].content === '-' || lines[i].content.startsWith('- ');
  if (isList) {
    const arr: unknown[] = [];
    while (i < lines.length && lines[i].indent === indent && (lines[i].content === '-' || lines[i].content.startsWith('- '))) {
      const itemContent = lines[i].content === '-' ? '' : lines[i].content.slice(2).trim();
      if (itemContent === '') {
        if (i + 1 < lines.length && lines[i + 1].indent > indent) {
          const [val, next] = parseYamlBlock(lines, i + 1, lines[i + 1].indent);
          arr.push(val);
          i = next;
        } else {
          arr.push(null);
          i++;
        }
      } else if (YAML_KEY_RE.test(itemContent) || itemContent.startsWith('- ')) {
        // Item content starts a nested block (usually a map). Treat the inline
        // content as a virtual line aligned with the item's following lines.
        // Only the CONTIGUOUS deeper-indented run belongs to this item   a
        // filter over the rest of the file would swallow sibling items' lines.
        const following: YamlLine[] = [];
        for (let j = i + 1; j < lines.length && lines[j].indent > indent; j++) following.push(lines[j]);
        const virtualIndent = following.length ? following[0].indent : indent + 2;
        const subLines = [{ indent: virtualIndent, content: itemContent }, ...following];
        const [val] = parseYamlBlock(subLines, 0, virtualIndent);
        arr.push(val);
        i = i + 1 + following.length;
      } else {
        arr.push(parseYamlScalar(itemContent));
        i++;
      }
    }
    return [arr, i];
  }
  const obj: Record<string, unknown> = {};
  let sawKey = false;
  while (i < lines.length && lines[i].indent === indent) {
    const m = lines[i].content.match(YAML_KEY_RE);
    if (!m) break;
    sawKey = true;
    const key = String(parseYamlScalar(m[1]));
    const inline = m[3];
    if (inline !== undefined && inline !== '') {
      if (inline === '|' || inline === '>' || inline.startsWith('|-') || inline.startsWith('>-')) {
        const collected: string[] = [];
        i++;
        while (i < lines.length && lines[i].indent > indent) { collected.push(lines[i].content); i++; }
        obj[key] = inline.startsWith('>') ? collected.join(' ') : collected.join('\n');
        continue;
      }
      obj[key] = parseYamlScalar(inline);
      i++;
    } else if (i + 1 < lines.length && lines[i + 1].indent > indent) {
      const [val, next] = parseYamlBlock(lines, i + 1, lines[i + 1].indent);
      obj[key] = val;
      i = next;
    } else {
      obj[key] = null;
      i++;
    }
  }
  if (!sawKey) return [parseYamlScalar(lines[start].content), start + 1];
  return [obj, i];
}

/** Parse the common subset of YAML (block maps/lists, scalars, flow collections, block scalars). */
export function yamlToJson(yamlText: string): unknown {
  const lines: YamlLine[] = [];
  for (const raw of yamlText.split(/\r?\n/)) {
    const noComment = raw.replace(/(^|\s)#.*$/, (m, p1) => (raw.trimStart().startsWith('#') ? '' : p1));
    if (!noComment.trim() || noComment.trim() === '---') continue;
    const indent = noComment.length - noComment.trimStart().length;
    lines.push({ indent, content: noComment.trim() });
  }
  if (!lines.length) return null;
  const [value] = parseYamlBlock(lines, 0, lines[0].indent);
  return value;
}

// ---------------- JSON -> TypeScript ----------------

function pascalCase(key: string): string {
  const cleaned = key.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  let name = cleaned.split(' ').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Value';
  if (/^\d/.test(name)) name = `N${name}`;
  return name;
}

function singular(name: string): string {
  if (name.endsWith('ies') && name.length > 3) return `${name.slice(0, -3)}y`;
  if (name.endsWith('s') && !name.endsWith('ss') && name.length > 1) return name.slice(0, -1);
  return name;
}

export function jsonToTypescript(jsonText: string, rootName = 'Root'): string {
  const data: unknown = JSON.parse(jsonText);
  const interfaces = new Map<string, string>();
  const shapeNames = new Map<string, string>();
  const usedNames = new Set<string>();

  const shapeSignature = (obj: Record<string, unknown>): string =>
    Object.keys(obj).sort().map((k) => `${k}:${typeSignature(obj[k])}`).join('|');
  const typeSignature = (v: unknown): string => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return `array<${v.length ? typeSignature(v[0]) : 'empty'}>`;
    if (typeof v === 'object') return `object{${shapeSignature(v as Record<string, unknown>)}}`;
    return typeof v;
  };

  const nameForObject = (obj: Record<string, unknown>, hint: string): string => {
    const sig = shapeSignature(obj);
    if (shapeNames.has(sig)) return shapeNames.get(sig)!;
    let name = pascalCase(hint);
    let base = name;
    let n = 2;
    while (usedNames.has(name)) { name = `${base}${n++}`; }
    usedNames.add(name);
    shapeNames.set(sig, name);
    // Build fields (merging is handled by caller for arrays)
    const fields = Object.entries(obj).map(([k, v]) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `  ${key}: ${typeOf(v, k)};`;
    });
    interfaces.set(name, `export interface ${name} {\n${fields.join('\n')}\n}`);
    return name;
  };

  const typeOf = (v: unknown, hint: string): string => {
    if (v === null) return 'unknown';
    if (Array.isArray(v)) {
      if (!v.length) return 'unknown[]';
      const elemTypes = [...new Set(v.map((el) => typeOf(el, singular(hint))))];
      const inner = elemTypes.length > 1 ? `(${elemTypes.join(' | ')})` : elemTypes[0];
      return `${inner}[]`;
    }
    if (typeof v === 'object') return nameForObject(v as Record<string, unknown>, hint);
    return typeof v === 'number' ? 'number' : typeof v;
  };

  const rootType = typeOf(data, rootName);
  const parts: string[] = [];
  interfaces.forEach((body) => parts.push(body));
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    parts.push(`export type ${pascalCase(rootName)} = ${rootType};`);
  } else {
    // Root object already emitted as an interface under the root name
    const rootIface = interfaces.get(pascalCase(rootName));
    if (!rootIface) parts.push(`export type ${pascalCase(rootName)} = ${rootType};`);
  }
  return parts.join('\n\n');
}

// ---------------- XML formatter ----------------

export function formatXml(xml: string, indentSize = 2): { ok: boolean; output?: string; error?: string } {
  const tokens = xml.match(/<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>|[^<]+/g) || [];
  const stack: string[] = [];
  let depth = 0;
  const lines: string[] = [];
  const pad = (d: number) => ' '.repeat(d * indentSize);
  for (const tok of tokens) {
    if (tok.startsWith('<?') || tok.startsWith('<!--')) { lines.push(pad(depth) + tok.trim()); continue; }
    if (tok.startsWith('<![CDATA[')) { lines.push(pad(depth) + tok); continue; }
    if (tok.startsWith('</')) {
      const name = tok.slice(2, -1).trim();
      depth = Math.max(0, depth - 1);
      if (stack.length && stack[stack.length - 1] !== name) {
        return { ok: false, error: `Mismatched closing tag </${name}>   expected </${stack[stack.length - 1]}>` };
      }
      stack.pop();
      // If previous line is the matching open tag with text, merge handled by text logic below
      lines.push(pad(depth) + tok);
      continue;
    }
    if (tok.startsWith('<')) {
      const selfClosing = tok.endsWith('/>');
      const name = (tok.match(/^<([A-Za-z0-9_:-]+)/) || [])[1] || '';
      lines.push(pad(depth) + tok);
      if (!selfClosing && !tok.startsWith('<!')) { stack.push(name); depth++; }
      continue;
    }
    const text = tok.trim();
    if (text) {
      // Inline text: attach to previous line if it was an opening tag
      if (lines.length && lines[lines.length - 1].trimStart().startsWith('<') && !lines[lines.length - 1].trimStart().startsWith('</')) {
        lines[lines.length - 1] += text;
      } else {
        lines.push(pad(depth) + text);
      }
    }
  }
  if (stack.length) return { ok: false, error: `Unclosed tag <${stack[stack.length - 1]}>` };
  // Merge "<tag>text" lines with their closing tag on the next line
  const merged: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];
    const openText = line.match(/<([A-Za-z0-9_:-]+)(?:\s[^>]*)?>([^<]+)$/);
    if (next && openText && next.trim() === `</${openText[1]}>`) {
      merged.push(line + next.trim());
      i++;
    } else merged.push(line);
  }
  return { ok: true, output: merged.join('\n') };
}

export function minifyXml(xml: string, removeComments = true): string {
  let s = xml;
  if (removeComments) s = s.replace(/<!--[\s\S]*?-->/g, '');
  return s.replace(/>\s+</g, '><').trim();
}

// ---------------- SQL formatter ----------------

const SQL_KEYWORDS = new Set(('select,from,where,group,by,order,having,limit,offset,join,left,right,inner,outer,full,cross,on,union,all,distinct,as,and,or,not,null,is,in,like,between,exists,case,when,then,else,end,insert,into,values,update,set,delete,create,table,primary,key,foreign,references,index,view,drop,alter,add,column,asc,desc,count,sum,avg,min,max,coalesce,cast,over,partition,window,returning,with,recursive').split(','));
const SQL_CLAUSES = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT', 'VALUES', 'SET', 'RETURNING'];

export function formatSql(sql: string, uppercase = true): string {
  // Protect string literals
  const literals: string[] = [];
  const protectedSql = sql.replace(/'(?:[^']|'')*'/g, (m) => { literals.push(m); return `\u0001${literals.length - 1}\u0002`; });
  const tokens = protectedSql.replace(/\s+/g, ' ').trim().split(/(?=[(),;=<>!+\-*/%])|(?<=[(),;=<>!+\-*/%])|\s+/).filter((t) => t !== undefined && t !== '');
  const words = tokens.join(' ').split(' ');
  const caseKw = (w: string) => (SQL_KEYWORDS.has(w.toLowerCase()) ? (uppercase ? w.toUpperCase() : w.toLowerCase()) : w);
  const cased = words.map(caseKw);
  let text = cased.join(' ');
  // Newline before major clauses
  for (const clause of SQL_CLAUSES) {
    const re = new RegExp(`\\s+${clause.replace(' ', '\\s+')}\\b`, 'g');
    text = text.replace(re, `\n${clause}`);
  }
  text = text.replace(new RegExp(`^${''}`), '');
  // SELECT list items on their own lines
  text = text.replace(/^(SELECT)\n?([\s\S]*?)(?=\nFROM|\nWHERE|$)/m, (_m, sel, list) => {
    const items = list.split(/,(?![^()]*\))/).map((s: string) => s.trim()).filter(Boolean);
    return items.length > 1 ? `${sel}\n  ${items.join(',\n  ')}` : `${sel} ${list.trim()}`;
  });
  // JOIN lines indented
  text = text.replace(/\s+(LEFT|RIGHT|INNER|FULL|CROSS)?\s*JOIN\b/g, (m) => `\n  ${m.trim()}`);
  text = text.replace(/\s+ON\s+/g, ' ON ');
  // AND/OR on new lines inside WHERE
  text = text.replace(/\nWHERE ([\s\S]*?)(?=\nGROUP BY|\nORDER BY|\nHAVING|\nLIMIT|\nUNION|$)/, (_m, cond) => `\nWHERE\n  ${cond.replace(/\s+(AND|OR)\s+/g, '\n  $1 ')}`);
  let out = text.split('\n').map((l) => l.trimEnd()).join('\n');
  out = out.replace(/\u0001(\d+)\u0002/g, (_, i) => literals[parseInt(i, 10)]);
  return out.trim();
}

// ---------------- encodings ----------------

export function base64Encode(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return out;
}

export function base64Decode(b64: string): string {
  let s = b64.trim().replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeHtmlEntities(text: string, namedOnly = false): string {
  let out = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  if (!namedOnly) {
    out = out.replace(/[\u00A0-\uFFFF]/g, (c) => `&#${c.charCodeAt(0)};`);
  }
  return out;
}

export function decodeHtmlEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™',
    hellip: '…', mdash: ' ', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
    laquo: '«', raquo: '»', deg: '°', plusmn: '±', times: '×', divide: '÷', euro: '€', pound: '£', yen: '¥', cent: '¢',
  };
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => named[name.toLowerCase()] ?? m);
}

// ---------------- JWT ----------------

export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

export function decodeJwt(token: string): JwtDecoded {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('A JWT must have exactly 3 parts separated by dots.');
  const parsePart = (p: string, label: string) => {
    try { return JSON.parse(base64Decode(p)); } catch { throw new Error(`Could not decode the ${label}   it is not valid base64url JSON.`); }
  };
  return {
    header: parsePart(parts[0], 'header'),
    payload: parsePart(parts[1], 'payload'),
    signature: parts[2],
    raw: { header: parts[0], payload: parts[1], signature: parts[2] },
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signJwtHs256(payload: Record<string, unknown>, secret: string, extraHeader: Record<string, unknown> = {}): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT', ...extraHeader };
  const enc = (obj: unknown) => bytesToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
  const data = `${enc(header)}.${enc(payload)}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${bytesToBase64Url(new Uint8Array(sig))}`;
}

export async function verifyJwtHs256(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return false;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    return bytesToBase64Url(new Uint8Array(sig)) === parts[2];
  } catch {
    return false;
  }
}

// ---------------- hashes ----------------

/** Pure-TypeScript MD5 (RFC 1321)   WebCrypto has no MD5. */
export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const padLen = (bytes.length % 64 < 56 ? 56 : 120) - (bytes.length % 64);
  const total = bytes.length + padLen + 8;
  const msg = new Uint8Array(total);
  msg.set(bytes);
  msg[bytes.length] = 0x80;
  const dv = new DataView(msg.buffer);
  dv.setUint32(total - 8, bitLen >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bitLen / 4294967296), true);
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K: number[] = [];
  for (let i = 0; i < 64; i++) K.push(Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296));
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const rotl = (x: number, s: number) => (x << s) | (x >>> (32 - s));
  for (let off = 0; off < total; off += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) M.push(dv.getUint32(off + j * 4, true));
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const tmp = d;
      d = c;
      c = b;
      b = (b + rotl((a + f + K[i] + M[g]) >>> 0, S[i])) >>> 0;
      a = tmp;
    }
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }
  const hexWord = (n: number) => [0, 8, 16, 24].map((s) => ((n >>> s) & 0xff).toString(16).padStart(2, '0')).join('');
  return hexWord(a0) + hexWord(b0) + hexWord(c0) + hexWord(d0);
}

export async function shaHash(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512', text: string): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hmacHash(algorithm: 'SHA-256' | 'SHA-512', key: string, text: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: algorithm }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------- generators ----------------

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(opts: PasswordOptions): string {
  let pool = '';
  const sets: string[] = [];
  if (opts.lowercase) { const s = opts.excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'; sets.push(s); pool += s; }
  if (opts.uppercase) { const s = opts.excludeAmbiguous ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; sets.push(s); pool += s; }
  if (opts.numbers) { const s = opts.excludeAmbiguous ? '23456789' : '0123456789'; sets.push(s); pool += s; }
  if (opts.symbols) { const s = '!@#$%^&*()-_=+[]{};:,.<>?'; sets.push(s); pool += s; }
  if (!pool) return '';
  const rand = new Uint32Array(1);
  const pick = (chars: string) => {
    const max = Math.floor(4294967296 / chars.length) * chars.length;
    let x: number;
    do { crypto.getRandomValues(rand); x = rand[0]; } while (x >= max);
    return chars[x % chars.length];
  };
  const chars: string[] = sets.map((s) => pick(s));
  while (chars.length < opts.length) chars.push(pick(pool));
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, opts.length).join('');
}

export function passwordEntropy(opts: PasswordOptions): number {
  let pool = 0;
  if (opts.lowercase) pool += opts.excludeAmbiguous ? 23 : 26;
  if (opts.uppercase) pool += opts.excludeAmbiguous ? 23 : 26;
  if (opts.numbers) pool += opts.excludeAmbiguous ? 8 : 10;
  if (opts.symbols) pool += 26;
  return pool ? Math.round(opts.length * Math.log2(pool)) : 0;
}

export function generateUuid(version: 4 | 7 = 4): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  if (version === 7) {
    const now = Date.now();
    bytes[0] = Math.floor(now / 2 ** 40) & 0xff;
    bytes[1] = Math.floor(now / 2 ** 32) & 0xff;
    bytes[2] = Math.floor(now / 2 ** 24) & 0xff;
    bytes[3] = Math.floor(now / 2 ** 16) & 0xff;
    bytes[4] = Math.floor(now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
  } else {
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
  }
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ---------------- timestamps ----------------

export function detectTimestampUnit(value: number): 's' | 'ms' {
  return Math.abs(value) >= 1e11 ? 'ms' : 's';
}

export function relativeTime(date: Date, now = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const units: [number, string][] = [
    [365.25 * 24 * 3600e3, 'year'], [30.44 * 24 * 3600e3, 'month'], [7 * 24 * 3600e3, 'week'],
    [24 * 3600e3, 'day'], [3600e3, 'hour'], [60e3, 'minute'], [1e3, 'second'],
  ];
  for (const [ms, label] of units) {
    if (abs >= ms) {
      const n = Math.round(abs / ms);
      const plural = n === 1 ? label : `${label}s`;
      return diffMs > 0 ? `in ${n} ${plural}` : `${n} ${plural} ago`;
    }
  }
  return 'just now';
}

// ---------------- cron ----------------

const MONTH_NAMES: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const DOW_NAMES: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

export interface CronField {
  values: Set<number>;
  restricted: boolean;
  raw: string;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
  expression: string;
}

function parseCronField(raw: string, min: number, max: number, names?: Record<string, number>): CronField {
  const values = new Set<number>();
  const norm = (tok: string): number => {
    const t = tok.trim().toLowerCase();
    if (names && t in names) return names[t];
    const n = parseInt(t, 10);
    if (Number.isNaN(n)) throw new Error(`Invalid cron value: ${tok}`);
    return n;
  };
  if (raw.trim() === '*') {
    for (let v = min; v <= max; v++) values.add(v);
    return { values, restricted: false, raw };
  }
  for (const part of raw.split(',')) {
    const [rangePart, stepPart] = part.split('/');
    const step = stepPart ? parseInt(stepPart, 10) : 1;
    if (Number.isNaN(step) || step < 1) throw new Error(`Invalid step in: ${part}`);
    let lo: number, hi: number;
    if (rangePart === '*') { lo = min; hi = max; }
    else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-');
      lo = norm(a); hi = norm(b);
    } else {
      lo = norm(rangePart);
      hi = stepPart ? max : lo;
    }
    for (let v = lo; v <= hi; v += step) {
      if (v < min || v > max) throw new Error(`Cron value ${v} out of range ${min}-${max}`);
      values.add(v);
    }
  }
  return { values, restricted: true, raw };
}

export function parseCron(expression: string): ParsedCron {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error('A cron expression needs exactly 5 fields: minute hour day-of-month month day-of-week.');
  const dowField = parseCronField(parts[4], 0, 7, DOW_NAMES);
  if (dowField.values.has(7)) { dowField.values.delete(7); dowField.values.add(0); }
  return {
    minute: parseCronField(parts[0], 0, 59),
    hour: parseCronField(parts[1], 0, 23),
    dom: parseCronField(parts[2], 1, 31),
    month: parseCronField(parts[3], 1, 12, MONTH_NAMES),
    dow: dowField,
    expression: expression.trim(),
  };
}

const MONTH_LABELS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function listOf(field: CronField, labels?: string[]): string {
  const vals = [...field.values].sort((a, b) => a - b);
  return vals.map((v) => (labels ? labels[v] : String(v))).join(', ');
}

export function explainCron(expression: string): string {
  const c = parseCron(expression);
  const parts: string[] = [];
  if (!c.minute.restricted && !c.hour.restricted) parts.push('Every minute');
  else if (!c.minute.restricted) parts.push(`Every minute of hour ${listOf(c.hour)}`);
  else if (!c.hour.restricted) parts.push(`At minute ${listOf(c.minute)} of every hour`);
  else if (c.minute.values.size === 1 && c.hour.values.size === 1) {
    const h = [...c.hour.values][0];
    const m = [...c.minute.values][0];
    parts.push(`At ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  } else {
    parts.push(`At minute ${listOf(c.minute)}, hour ${listOf(c.hour)}`);
  }
  const minuteStep = /^(\*\/(\d+))$/.exec(c.minute.raw);
  if (minuteStep && !c.hour.restricted) parts[0] = `Every ${minuteStep[2]} minutes`;
  if (c.dom.restricted) parts.push(`on day ${listOf(c.dom)} of the month`);
  if (c.month.restricted) parts.push(`in ${listOf(c.month, MONTH_LABELS)}`);
  if (c.dow.restricted) parts.push(`on ${listOf(c.dow, DOW_LABELS)}`);
  if (!c.dom.restricted && !c.month.restricted && !c.dow.restricted) parts.push('every day');
  const sentence = parts.join(', ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

export function cronNextRuns(expression: string, count = 5, from = new Date()): Date[] {
  const c = parseCron(expression);
  const runs: Date[] = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const maxIterations = 366 * 24 * 60 * 2;
  let iter = 0;
  while (runs.length < count && iter++ < maxIterations) {
    const domMatch = c.dom.values.has(cursor.getDate());
    const dowMatch = c.dow.values.has(cursor.getDay());
    const dayOk = c.dom.restricted && c.dow.restricted ? domMatch || dowMatch : domMatch && dowMatch;
    if (c.minute.values.has(cursor.getMinutes()) && c.hour.values.has(cursor.getHours()) && c.month.values.has(cursor.getMonth() + 1) && dayOk) {
      runs.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return runs;
}

// ---------------- color ----------------

export interface Rgb { r: number; g: number; b: number }

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('Invalid hex color');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = s / 100, ln = l / 100;
  if (sn === 0) { const v = Math.round(ln * 255); return { r: v, g: v, b: v }; }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return { r: Math.round(hue2rgb(hn + 1 / 3) * 255), g: Math.round(hue2rgb(hn) * 255), b: Math.round(hue2rgb(hn - 1 / 3) * 255) };
}

export function rgbToHsv({ r, g, b }: Rgb): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return { h: Math.round(h), s: max === 0 ? 0 : Math.round((d / max) * 100), v: Math.round(max * 100) };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
}

// ---------------- numbers / urls / misc ----------------

export function convertBase(value: string, fromBase: number, toBase: number): string {
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  const v = value.trim().toLowerCase();
  if (!v) throw new Error('Enter a value');
  const negative = v.startsWith('-');
  const body = negative ? v.slice(1) : v;
  let result = 0n;
  const fb = BigInt(fromBase);
  for (const ch of body) {
    const d = digits.indexOf(ch);
    if (d === -1 || d >= fromBase) throw new Error(`Digit "${ch}" is not valid in base ${fromBase}`);
    result = result * fb + BigInt(d);
  }
  if (result === 0n) return '0';
  const tb = BigInt(toBase);
  let out = '';
  let n = result;
  while (n > 0n) {
    out = digits[Number(n % tb)] + out;
    n = n / tb;
  }
  return (negative ? '-' : '') + out;
}

export interface UrlParts {
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  pathSegments: string[];
  params: { key: string; value: string }[];
  hash: string;
  origin: string;
}

export function parseUrl(raw: string): UrlParts {
  const u = new URL(raw);
  return {
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    pathSegments: u.pathname.split('/').filter(Boolean).map((s) => decodeURIComponent(s)),
    params: [...u.searchParams.entries()].map(([key, value]) => ({ key, value })),
    hash: u.hash,
    origin: u.origin,
  };
}

export interface DiffLine { type: 'same' | 'added' | 'removed'; text: string }

export function diffLines(a: string, b: string): DiffLine[] {
  const aLines = a.split('\n');
  const bLines = b.split('\n');
  const m = aLines.length, n = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = aLines[i] === bLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (aLines[i] === bLines[j]) { out.push({ type: 'same', text: aLines[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'removed', text: aLines[i] }); i++; }
    else { out.push({ type: 'added', text: bLines[j] }); j++; }
  }
  while (i < m) out.push({ type: 'removed', text: aLines[i++] });
  while (j < n) out.push({ type: 'added', text: bLines[j++] });
  return out;
}

export interface RegexMatch {
  match: string;
  index: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
}

export function regexTest(pattern: string, flags: string, text: string): { matches: RegexMatch[]; error?: string } {
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    return { matches: [], error: e instanceof Error ? e.message : 'Invalid regex' };
  }
  const matches: RegexMatch[] = [];
  if (!re.global) {
    const m = re.exec(text);
    if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1), namedGroups: m.groups || {} });
    return { matches };
  }
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(text)) && guard++ < 1000) {
    matches.push({ match: m[0], index: m.index, groups: m.slice(1), namedGroups: m.groups || {} });
    if (m[0] === '') re.lastIndex++;
  }
  return { matches };
}

// ---------------- user agent ----------------

export interface UaInfo {
  browser: string;
  browserVersion: string;
  os: string;
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown';
  engine: string;
}

export function parseUserAgent(ua: string): UaInfo {
  const s = ua || '';
  let browser = 'Unknown', browserVersion = '', engine = 'Unknown';
  const ver = (re: RegExp) => (s.match(re) || [])[1] || '';
  if (/bot|crawler|spider|crawling/i.test(s)) {
    return { browser: (s.match(/([A-Za-z]+)[Bb]ot/) || [])[1] ? `${(s.match(/([A-Za-z]+)[Bb]ot/) || [])[1]} Bot` : 'Bot / Crawler', browserVersion: '', os: 'Unknown', device: 'Bot', engine: 'Unknown' };
  }
  if (/Edg\//.test(s)) { browser = 'Microsoft Edge'; browserVersion = ver(/Edg\/([\d.]+)/); engine = 'Blink'; }
  else if (/OPR\//.test(s)) { browser = 'Opera'; browserVersion = ver(/OPR\/([\d.]+)/); engine = 'Blink'; }
  else if (/SamsungBrowser\//.test(s)) { browser = 'Samsung Internet'; browserVersion = ver(/SamsungBrowser\/([\d.]+)/); engine = 'Blink'; }
  else if (/Chrome\//.test(s)) { browser = 'Chrome'; browserVersion = ver(/Chrome\/([\d.]+)/); engine = 'Blink'; }
  else if (/Firefox\//.test(s)) { browser = 'Firefox'; browserVersion = ver(/Firefox\/([\d.]+)/); engine = 'Gecko'; }
  else if (/Version\/[\d.]+.*Safari\//.test(s)) { browser = 'Safari'; browserVersion = ver(/Version\/([\d.]+)/); engine = 'WebKit'; }
  else if (/MSIE |Trident\//.test(s)) { browser = 'Internet Explorer'; browserVersion = ver(/(?:MSIE |rv:)([\d.]+)/); engine = 'Trident'; }

  let os = 'Unknown';
  if (/Windows NT 10/.test(s)) os = 'Windows 10 / 11';
  else if (/Windows NT 6.3/.test(s)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/.test(s)) os = 'Windows 7';
  else if (/Android ([\d.]+)/.test(s)) os = `Android ${ver(/Android ([\d.]+)/)}`;
  else if (/Android/.test(s)) os = 'Android';
  else if (/(?:iPhone|iPad|iPod).*OS ([\d_]+)/.test(s)) os = `iOS ${ver(/(?:iPhone|iPad|iPod).*OS ([\d_]+)/).replace(/_/g, '.')}`;
  else if (/Mac OS X ([\d_]+)/.test(s)) os = `macOS ${ver(/Mac OS X ([\d_]+)/).replace(/_/g, '.')}`;
  else if (/Linux/.test(s)) os = 'Linux';

  let device: UaInfo['device'] = 'Desktop';
  if (/iPad|Tablet/i.test(s)) device = 'Tablet';
  else if (/Mobi|iPhone|Android.*Mobile/i.test(s)) device = 'Mobile';
  return { browser, browserVersion, os, device, engine };
}

// ---------------- chmod ----------------

export interface ChmodResult { octal: string; symbolic: string }

export function chmodCalc(perms: { owner: [boolean, boolean, boolean]; group: [boolean, boolean, boolean]; public: [boolean, boolean, boolean] }): ChmodResult {
  const digit = (t: [boolean, boolean, boolean]) => (t[0] ? 4 : 0) + (t[1] ? 2 : 0) + (t[2] ? 1 : 0);
  const sym = (t: [boolean, boolean, boolean]) => `${t[0] ? 'r' : '-'}${t[1] ? 'w' : '-'}${t[2] ? 'x' : '-'}`;
  return {
    octal: `${digit(perms.owner)}${digit(perms.group)}${digit(perms.public)}`,
    symbolic: `${sym(perms.owner)}${sym(perms.group)}${sym(perms.public)}`,
  };
}
