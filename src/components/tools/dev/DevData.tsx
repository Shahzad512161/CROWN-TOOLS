import React, { useMemo, useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  formatJson,
  minifyJson,
  jsonToCsv,
  csvToJson,
  parseCsv,
  jsonToYaml,
  yamlToJson,
  jsonToTypescript,
  jsonDiff,
  formatXml,
  minifyXml,
  formatSql,
  type JsonChange,
} from '../../../lib/dev/core';
import {
  DevCard,
  DevTextarea,
  PrimaryBtn,
  CopyBtn,
  DownloadBtn,
  CodeOut,
  ErrorBox,
  Stat,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
} from './DevShell';

// ---------------- shared helpers ----------------

const SecondaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`px-4 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
      props.disabled
        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 cursor-pointer'
    }`}
  >
    {children}
  </button>
);

function byteSize(s: string): number {
  return new Blob([s]).size;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

function countObjectKeys(value: unknown): number {
  if (Array.isArray(value)) return value.reduce((acc, v) => acc + countObjectKeys(v), 0);
  if (value && typeof value === 'object') {
    const entries = Object.values(value as Record<string, unknown>);
    return Object.keys(value as Record<string, unknown>).length + entries.reduce<number>((acc, v) => acc + countObjectKeys(v), 0);
  }
  return 0;
}

function topLevelType(value: unknown): string {
  if (Array.isArray(value)) return `Array (${value.length} items)`;
  if (value === null) return 'null';
  if (typeof value === 'object') return `Object (${Object.keys(value as Record<string, unknown>).length} keys)`;
  return typeof value;
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}

type IndentChoice = '2' | '4' | 'tab';

const IndentSelect: React.FC<{ value: IndentChoice; onChange: (v: IndentChoice) => void }> = ({ value, onChange }) => (
  <OptSelect value={value} onChange={(e) => onChange(e.target.value as IndentChoice)}>
    <option value="2">2 spaces</option>
    <option value="4">4 spaces</option>
    <option value="tab">Tab</option>
  </OptSelect>
);

const indentOf = (v: IndentChoice): number | 'tab' => (v === 'tab' ? 'tab' : parseInt(v, 10));
const stringifyIndentOf = (v: IndentChoice): string | number => (v === 'tab' ? '\t' : parseInt(v, 10));

// ---------------------------------------------------------------------------
// 1. JSON Formatter
// ---------------------------------------------------------------------------

export const JsonFormatter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentChoice>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [fileName, setFileName] = useState('formatted.json');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<{ before: number; after: number; type: string; keys: number } | null>(null);

  const fail = (message: string, line?: number, column?: number) => {
    setError(line !== undefined ? `Line ${line}, column ${column}: ${message}` : message);
    setOutput(null);
    setStats(null);
    setNotice(null);
  };

  const succeed = (out: string, name: string) => {
    let parsed: unknown = null;
    try { parsed = JSON.parse(input); } catch { /* formatJson already validated */ }
    setOutput(out);
    setFileName(name);
    setError(null);
    setNotice(null);
    setStats({
      before: byteSize(input),
      after: byteSize(out),
      type: topLevelType(parsed),
      keys: countObjectKeys(parsed),
    });
  };

  const runFormat = () => {
    const res = formatJson(input, indentOf(indent), sortKeys);
    if (res.ok && res.output !== undefined) succeed(res.output, 'formatted.json');
    else fail(res.error?.message || 'Invalid JSON', res.error?.line, res.error?.column);
  };

  const runMinify = () => {
    const res = minifyJson(input);
    if (res.ok && res.output !== undefined) succeed(res.output, 'minified.json');
    else fail(res.error?.message || 'Invalid JSON', res.error?.line, res.error?.column);
  };

  const runValidate = () => {
    const res = formatJson(input, 2, false);
    if (res.ok) {
      let parsed: unknown = null;
      try { parsed = JSON.parse(input); } catch { /* already validated */ }
      setError(null);
      setOutput(null);
      setStats(null);
      setNotice(`Valid JSON — ${topLevelType(parsed)}, ${countObjectKeys(parsed)} keys in total.`);
    } else {
      fail(res.error?.message || 'Invalid JSON', res.error?.line, res.error?.column);
    }
  };

  return (
    <DevCard tool={tool} note="Formatting and validation happen entirely in your browser using the native JSON parser — error positions are reported as line and column.">
      <div className="space-y-4">
        <div>
          <OptLabel>JSON input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder='{"name": "example", "items": [1, 2, 3]}' value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <OptLabel>Indent</OptLabel>
            <IndentSelect value={indent} onChange={setIndent} />
          </div>
          <div className="pb-2.5">
            <OptCheck label="Sort keys" checked={sortKeys} onChange={setSortKeys} />
          </div>
          <div className="flex gap-2 ml-auto">
            <PrimaryBtn onClick={runFormat} disabled={!input.trim()}>Format</PrimaryBtn>
            <SecondaryBtn onClick={runMinify} disabled={!input.trim()}>Minify</SecondaryBtn>
            <SecondaryBtn onClick={runValidate} disabled={!input.trim()}>Validate only</SecondaryBtn>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        {notice && (
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
            {notice}
          </div>
        )}
        {output !== null && (
          <div className="space-y-3">
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Size before" value={formatBytes(stats.before)} />
                <Stat label="Size after" value={formatBytes(stats.after)} />
                <Stat label="Top-level type" value={stats.type} />
                <Stat label="Total keys" value={stats.keys} />
              </div>
            )}
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename={fileName} mime="application/json" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 2. JSON to CSV
// ---------------------------------------------------------------------------

export const JsonToCsv: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rows: number; columns: number } | null>(null);

  const convert = () => {
    try {
      const csv = jsonToCsv(input);
      if (!csv) {
        setError('The JSON did not contain any rows to convert.');
        setOutput(null);
        setStats(null);
        return;
      }
      const parsed = parseCsv(csv);
      setOutput(csv);
      setError(null);
      setStats({ rows: Math.max(0, parsed.length - 1), columns: parsed[0]?.length || 0 });
    } catch (e) {
      setError(errMessage(e));
      setOutput(null);
      setStats(null);
    }
  };

  return (
    <DevCard tool={tool} note="Nested objects and arrays are written into cells as JSON text. Columns are the union of all object keys, in the order they first appear.">
      <div className="space-y-4">
        <div>
          <OptLabel>JSON input (array of objects works best)</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder='[{"id": 1, "name": "Ada"}, {"id": 2, "name": "Alan"}]' value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <PrimaryBtn onClick={convert} disabled={!input.trim()}>Convert to CSV</PrimaryBtn>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            {stats && (
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                <Stat label="Data rows" value={stats.rows} />
                <Stat label="Columns" value={stats.columns} />
              </div>
            )}
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="data.csv" mime="text/csv" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 3. CSV to JSON
// ---------------------------------------------------------------------------

export const CsvToJson: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [infer, setInfer] = useState(true);
  const [indent, setIndent] = useState<IndentChoice>('2');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rows: number; columns: number } | null>(null);

  const convert = () => {
    try {
      const parsed = parseCsv(input);
      if (parsed.length < 2) throw new Error('The CSV needs a header row and at least one data row.');
      const data = csvToJson(input, infer);
      setOutput(JSON.stringify(data, null, stringifyIndentOf(indent)));
      setError(null);
      setStats({
        rows: data.length,
        columns: data.length && data[0] && typeof data[0] === 'object' ? Object.keys(data[0] as Record<string, unknown>).length : parsed[0].length,
      });
    } catch (e) {
      setError(errMessage(e));
      setOutput(null);
      setStats(null);
    }
  };

  return (
    <DevCard tool={tool} note="The first row is treated as the header. Quoted fields, embedded commas and doubled quotes are handled per RFC 4180.">
      <div className="space-y-4">
        <div>
          <OptLabel>CSV input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder={'id,name,active\n1,Ada,true\n2,Alan,false'} value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <OptLabel>Indent</OptLabel>
            <IndentSelect value={indent} onChange={setIndent} />
          </div>
          <div className="pb-2.5">
            <OptCheck label="Infer types (numbers, booleans, null)" checked={infer} onChange={setInfer} />
          </div>
          <div className="ml-auto">
            <PrimaryBtn onClick={convert} disabled={!input.trim()}>Convert to JSON</PrimaryBtn>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            {stats && (
              <div className="grid grid-cols-2 gap-2 max-w-sm">
                <Stat label="Rows" value={stats.rows} />
                <Stat label="Columns" value={stats.columns} />
              </div>
            )}
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="data.json" mime="application/json" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 4. JSON to YAML
// ---------------------------------------------------------------------------

export const JsonToYaml: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    try {
      const value: unknown = JSON.parse(input);
      setOutput(jsonToYaml(value).trimEnd());
      setError(null);
    } catch (e) {
      setError(errMessage(e));
      setOutput(null);
    }
  };

  return (
    <DevCard tool={tool} note="Strings that would be ambiguous in YAML (booleans, numbers, values containing ':' or '#') are quoted automatically.">
      <div className="space-y-4">
        <div>
          <OptLabel>JSON input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder='{"server": {"host": "localhost", "port": 8080}}' value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <PrimaryBtn onClick={convert} disabled={!input.trim()}>Convert to YAML</PrimaryBtn>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="data.yaml" mime="text/yaml" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 5. YAML to JSON
// ---------------------------------------------------------------------------

export const YamlToJson: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<IndentChoice>('2');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    try {
      const value = yamlToJson(input);
      setOutput(JSON.stringify(value, null, stringifyIndentOf(indent)));
      setError(null);
    } catch (e) {
      setError(errMessage(e));
      setOutput(null);
    }
  };

  return (
    <DevCard
      tool={tool}
      note="Supports the common YAML subset: block mappings/sequences, scalars, flow collections ([a, b], {a: b}), comments and literal/folded block scalars. Anchors, tags and multi-document streams are not supported."
    >
      <div className="space-y-4">
        <div>
          <OptLabel>YAML input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder={'server:\n  host: localhost\n  port: 8080'} value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <OptLabel>Indent</OptLabel>
            <IndentSelect value={indent} onChange={setIndent} />
          </div>
          <div className="ml-auto">
            <PrimaryBtn onClick={convert} disabled={!input.trim()}>Convert to JSON</PrimaryBtn>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="data.json" mime="application/json" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 6. JSON to TypeScript
// ---------------------------------------------------------------------------

export const JsonToTypescript: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = () => {
    try {
      setOutput(jsonToTypescript(input, rootName.trim() || 'Root'));
      setError(null);
    } catch (e) {
      setError(errMessage(e));
      setOutput(null);
    }
  };

  return (
    <DevCard
      tool={tool}
      note="Interfaces are inferred from the sample data: identical object shapes are merged into a single interface, arrays whose items have different shapes produce union types, and null becomes unknown (TypeScript cannot infer more from one sample)."
    >
      <div className="space-y-4">
        <div>
          <OptLabel>JSON input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder='{"id": 1, "name": "Ada", "tags": ["admin"]}' value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <OptLabel>Root interface name</OptLabel>
            <OptInput value={rootName} onChange={(e) => setRootName(e.target.value)} placeholder="Root" />
          </div>
          <div className="ml-auto">
            <PrimaryBtn onClick={convert} disabled={!input.trim()}>Generate interfaces</PrimaryBtn>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="types.ts" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 7. JSON Diff Checker
// ---------------------------------------------------------------------------

function diffValue(v: unknown): string {
  if (v === undefined) return '';
  let s: string;
  try { s = JSON.stringify(v) ?? String(v); } catch { s = String(v); }
  return s.length > 120 ? `${s.slice(0, 120)}…` : s;
}

export const JsonDiffChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [changes, setChanges] = useState<JsonChange[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compare = () => {
    let a: unknown;
    let b: unknown;
    try { a = JSON.parse(inputA); } catch (e) { setError(`JSON A: ${errMessage(e)}`); setChanges(null); return; }
    try { b = JSON.parse(inputB); } catch (e) { setError(`JSON B: ${errMessage(e)}`); setChanges(null); return; }
    setError(null);
    setChanges(jsonDiff(a, b));
  };

  const counts = useMemo(() => {
    if (!changes) return null;
    return {
      added: changes.filter((c) => c.type === 'added').length,
      removed: changes.filter((c) => c.type === 'removed').length,
      changed: changes.filter((c) => c.type === 'changed').length,
    };
  }, [changes]);

  const badge = (type: JsonChange['type']) =>
    type === 'added'
      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      : type === 'removed'
        ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

  return (
    <DevCard tool={tool} note="Comparison is structural: object key order does not matter, but array order does. Paths use $ for the root document.">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <OptLabel>JSON A (original)</OptLabel>
            <DevTextarea rows={10} spellCheck={false} placeholder='{"version": 1}' value={inputA} onChange={(e) => setInputA(e.target.value)} />
          </div>
          <div>
            <OptLabel>JSON B (revised)</OptLabel>
            <DevTextarea rows={10} spellCheck={false} placeholder='{"version": 2}' value={inputB} onChange={(e) => setInputB(e.target.value)} />
          </div>
        </div>
        <PrimaryBtn onClick={compare} disabled={!inputA.trim() || !inputB.trim()}>Compare</PrimaryBtn>
        {error && <ErrorBox message={error} />}
        {changes !== null && counts && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 max-w-md">
              <Stat label="Added" value={counts.added} />
              <Stat label="Removed" value={counts.removed} />
              <Stat label="Changed" value={counts.changed} />
            </div>
            {changes.length === 0 ? (
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
                The two JSON documents are identical.
              </div>
            ) : (
              <ul className="space-y-1.5 max-h-96 overflow-auto pr-1">
                {changes.map((c, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${badge(c.type)}`}>{c.type}</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">{c.path}</span>
                    <span className="font-mono text-gray-600 dark:text-gray-300 break-all">
                      {c.type === 'added' && `+ ${diffValue(c.newValue)}`}
                      {c.type === 'removed' && `− ${diffValue(c.oldValue)}`}
                      {c.type === 'changed' && `${diffValue(c.oldValue)} → ${diffValue(c.newValue)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 8. XML Formatter
// ---------------------------------------------------------------------------

export const XmlFormatter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState<'2' | '4'>('2');
  const [removeComments, setRemoveComments] = useState(true);
  const [output, setOutput] = useState<string | null>(null);
  const [fileName, setFileName] = useState('formatted.xml');
  const [error, setError] = useState<string | null>(null);

  const runFormat = () => {
    const res = formatXml(input, parseInt(indent, 10));
    if (res.ok && res.output !== undefined) {
      setOutput(res.output);
      setFileName('formatted.xml');
      setError(null);
    } else {
      setError(res.error || 'Invalid XML');
      setOutput(null);
    }
  };

  const runMinify = () => {
    setOutput(minifyXml(input, removeComments));
    setFileName('minified.xml');
    setError(null);
  };

  return (
    <DevCard tool={tool} note="The formatter checks that opening and closing tags match and reports the first mismatch it finds. Attribute order and CDATA sections are preserved.">
      <div className="space-y-4">
        <div>
          <OptLabel>XML input</OptLabel>
          <DevTextarea rows={10} spellCheck={false} placeholder="<root><item id='1'>Hello</item></root>" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-36">
            <OptLabel>Indent</OptLabel>
            <OptSelect value={indent} onChange={(e) => setIndent(e.target.value as '2' | '4')}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </OptSelect>
          </div>
          <div className="pb-2.5">
            <OptCheck label="Remove comments (minify)" checked={removeComments} onChange={setRemoveComments} />
          </div>
          <div className="flex gap-2 ml-auto">
            <PrimaryBtn onClick={runFormat} disabled={!input.trim()}>Format</PrimaryBtn>
            <SecondaryBtn onClick={runMinify} disabled={!input.trim()}>Minify</SecondaryBtn>
          </div>
        </div>
        {error && <ErrorBox message={error} />}
        {output !== null && (
          <div className="space-y-3">
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename={fileName} mime="application/xml" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 9. SQL Formatter
// ---------------------------------------------------------------------------

const SAMPLE_SQL =
  "select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.status = 'active' and u.age >= 18 group by u.id, u.name having count(o.id) > 2 order by order_count desc limit 25";

export const SqlFormatter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>('upper');

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return formatSql(input, keywordCase === 'upper');
    } catch {
      return '';
    }
  }, [input, keywordCase]);

  return (
    <DevCard
      tool={tool}
      note="Basic formatter — handles standard SELECT / INSERT / UPDATE / DELETE statements and puts each clause on its own line. Exotic dialect syntax (vendor-specific functions, procedural SQL) may not indent perfectly, and string literals are never altered."
    >
      <div className="space-y-4">
        <div>
          <OptLabel>SQL input</OptLabel>
          <DevTextarea rows={8} spellCheck={false} placeholder="select * from users where id = 1" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <OptLabel>Keyword case</OptLabel>
            <OptSelect value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as 'upper' | 'lower')}>
              <option value="upper">UPPERCASE</option>
              <option value="lower">lowercase</option>
            </OptSelect>
          </div>
          <div className="ml-auto">
            <SecondaryBtn onClick={() => setInput(SAMPLE_SQL)}>Load sample</SecondaryBtn>
          </div>
        </div>
        {output && (
          <div className="space-y-3">
            <CodeOut code={output} />
            <div className="flex gap-2">
              <CopyBtn text={output} />
              <DownloadBtn content={output} filename="query.sql" />
            </div>
          </div>
        )}
      </div>
    </DevCard>
  );
};
