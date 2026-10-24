import React, { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  DevCard,
  DevTextarea,
  PrimaryBtn,
  CopyBtn,
  CodeOut,
  ErrorBox,
  Stat,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
} from './DevShell';
import { useStrings, COMMON } from '../../../lib/LangContext';
import { DEV_STRINGS } from '../../../lib/strings/dev';
import {
  regexTest,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  relativeLuminance,
  contrastRatio,
  convertBase,
  parseUrl,
  diffLines,
  parseUserAgent,
  chmodCalc,
} from '../../../lib/dev/core';
import type { Rgb } from '../../../lib/dev/core';

// Small shared bits -----------------------------------------------------------

const Chip: React.FC<{ children: React.ReactNode; onClick: () => void; active?: boolean }> = ({ children, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
      active
        ? 'bg-violet-600 text-white border-violet-700'
        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700'
    }`}
  >
    {children}
  </button>
);

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
    <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">{children}</div>
  </div>
);

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span dir="ltr" className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{children}</span>
);

// ---------------------------------------------------------------------------
// 1. Regex Tester
// ---------------------------------------------------------------------------

const QUICK_PATTERNS: { labelKey: string; pattern: string }[] = [
  { labelKey: 'qpEmail', pattern: String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}` },
  { labelKey: 'URL', pattern: String.raw`https?://[^\s]+` },
  { labelKey: 'IPv4', pattern: String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b` },
  { labelKey: 'qpHexColor', pattern: String.raw`#[0-9a-fA-F]{3,8}\b` },
  { labelKey: 'qpDate', pattern: String.raw`\b\d{4}-\d{2}-\d{2}\b` },
  { labelKey: 'qpPhone', pattern: String.raw`\+?\d[\d\s\-()]{6,}\d` },
];

export const RegexTester: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [pattern, setPattern] = useState(String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`);
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [text, setText] = useState('Contact us at support@example.com or sales@my-shop.org.\nInvalid: not-an-email@, and admin@test.io works too.');

  const flagsStr = (['g', 'i', 'm', 's', 'u'] as const).filter((f) => flags[f]).join('');
  const result = useMemo(() => (pattern ? regexTest(pattern, flagsStr, text) : { matches: [] }), [pattern, flagsStr, text]);

  const highlighted = useMemo(() => {
    if (!text || result.error) return null;
    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    let key = 0;
    for (const m of result.matches) {
      if (m.match.length === 0 || m.index < cursor) continue;
      if (m.index > cursor) nodes.push(<span key={key++}>{text.slice(cursor, m.index)}</span>);
      nodes.push(
        <mark key={key++} className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded px-0.5">
          {m.match}
        </mark>
      );
      cursor = m.index + m.match.length;
    }
    if (cursor < text.length) nodes.push(<span key={key++}>{text.slice(cursor)}</span>);
    return nodes;
  }, [text, result]);

  return (
    <DevCard tool={tool} note={s('regexNote')}>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <OptLabel>{s('patternLabel')}</OptLabel>
          <OptInput dir="ltr" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="e.g. \d{4}-\d{2}-\d{2}" className="font-mono text-left" spellCheck={false} />
        </div>
        <div className="flex gap-3 pb-1 flex-wrap">
          {(Object.keys(flags) as (keyof typeof flags)[]).map((f) => (
            <OptCheck key={f} label={f} checked={flags[f]} onChange={(v) => setFlags((prev) => ({ ...prev, [f]: v }))} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-3">
        {QUICK_PATTERNS.map((q) => (
          <Chip
            key={q.labelKey}
            onClick={() => {
              setPattern(q.pattern);
              setFlags((prev) => ({ ...prev, g: true }));
            }}
          >
            {s(q.labelKey)}
          </Chip>
        ))}
      </div>

      <div className="mt-4">
        <OptLabel>{s('testTextLabel')}</OptLabel>
        <DevTextarea rows={5} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      </div>

      {result.error ? (
        <div className="mt-4">
          <ErrorBox message={s('invalidRegex').replace('{msg}', result.error)} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat label={s('matchesLabel')} value={pattern ? result.matches.length : 0} />
            <Stat label={s('textLengthLabel')} value={s('charsCount').replace('{n}', String(text.length))} />
          </div>

          {text && (
            <div className="mt-4">
              <OptLabel>{s('highlightedPreview')}</OptLabel>
              <div dir="ltr" className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs font-mono whitespace-pre-wrap break-words text-left text-gray-900 dark:text-gray-100 max-h-56 overflow-auto">
                {highlighted}
              </div>
            </div>
          )}

          {pattern && result.matches.length > 0 && (
            <div className="mt-4 space-y-2 max-h-80 overflow-auto">
              {result.matches.map((m, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">#{i + 1}</span>
                    <span dir="ltr" className="font-mono text-sm font-bold text-violet-700 dark:text-violet-300 break-all">{m.match || s('emptyMatch')}</span>
                    <span className="text-[11px] text-gray-500">{s('indexWord')} {m.index}</span>
                  </div>
                  {m.groups.length > 0 && (
                    <div dir="ltr" className="mt-1 text-[11px] font-mono text-left text-gray-600 dark:text-gray-300">
                      {m.groups.map((g, gi) => (
                        <span key={gi} className="me-3">
                          ${gi + 1}: {g === undefined ? <em className="text-gray-400">{s('notCaptured')}</em> : g}
                        </span>
                      ))}
                    </div>
                  )}
                  {Object.keys(m.namedGroups).length > 0 && (
                    <div dir="ltr" className="mt-1 text-[11px] font-mono text-left text-gray-600 dark:text-gray-300">
                      {Object.entries(m.namedGroups).map(([k, v]) => (
                        <span key={k} className="me-3">
                          {k}: {v === undefined ? <em className="text-gray-400">{s('notCaptured')}</em> : v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {pattern && result.matches.length === 0 && text && <p className="mt-3 text-xs font-semibold text-gray-500">{s('noMatches')}</p>}
        </>
      )}
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Color Converter
// ---------------------------------------------------------------------------

const PassBadge: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => {
  const s = useStrings(DEV_STRINGS);
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
        ok
          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
      }`}
    >
      {label} {ok ? s('passWord') : s('failWord')}
    </span>
  );
};

export const ColorConverter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [hex, setHex] = useState('#3b82f6');
  const [copiedHex, setCopiedHex] = useState('');

  const rgb = useMemo<Rgb | null>(() => {
    if (!hex.trim()) return null;
    try {
      return hexToRgb(hex);
    } catch {
      return null;
    }
  }, [hex]);

  const derived = useMemo(() => {
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const rn = rgb.r / 255, gn = rgb.g / 255, bn = rgb.b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    const cmyk = k >= 1
      ? { c: 0, m: 0, y: 0, k: 100 }
      : {
          c: Math.round(((1 - rn - k) / (1 - k)) * 100),
          m: Math.round(((1 - gn - k) / (1 - k)) * 100),
          y: Math.round(((1 - bn - k) / (1 - k)) * 100),
          k: Math.round(k * 100),
        };
    const shades = [92, 80, 68, 56, 44, 34, 24, 14, 6].map((l) => rgbToHex(hslToRgb(hsl.h, hsl.s, l)));
    return {
      hex: rgbToHex(rgb),
      hsl,
      hsv,
      cmyk,
      luminance: relativeLuminance(rgb),
      shades,
      vsWhite: contrastRatio(rgb, { r: 255, g: 255, b: 255 }),
      vsBlack: contrastRatio(rgb, { r: 0, g: 0, b: 0 }),
    };
  }, [rgb]);

  const copySwatch = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedHex(value);
      setTimeout(() => setCopiedHex(''), 1400);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <DevCard tool={tool} note={s('colorNote')}>
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <OptLabel>{s('pickColor')}</OptLabel>
          <input
            type="color"
            value={derived ? derived.hex : '#000000'}
            onChange={(e) => setHex(e.target.value)}
            className="w-20 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer p-1"
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <OptLabel>{s('hexValue')}</OptLabel>
          <OptInput dir="ltr" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#3b82f6 or #fff" className="font-mono text-left" spellCheck={false} />
        </div>
        {derived && (
          <div className="w-20 h-11 rounded-xl border border-gray-200 dark:border-gray-700" style={{ backgroundColor: derived.hex }} title={derived.hex} />
        )}
      </div>
      {hex.trim() && !rgb && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{s('invalidHex')}</p>}

      {derived && rgb && (
        <>
          <div className="mt-4">
            <Row label="HEX">
              <Mono>{derived.hex}</Mono>
              <CopyBtn text={derived.hex} />
            </Row>
            <Row label="RGB">
              <Mono>{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</Mono>
              <CopyBtn text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
            </Row>
            <Row label="HSL">
              <Mono>{`hsl(${derived.hsl.h}, ${derived.hsl.s}%, ${derived.hsl.l}%)`}</Mono>
              <CopyBtn text={`hsl(${derived.hsl.h}, ${derived.hsl.s}%, ${derived.hsl.l}%)`} />
            </Row>
            <Row label="HSV">
              <Mono>{`hsv(${derived.hsv.h}, ${derived.hsv.s}%, ${derived.hsv.v}%)`}</Mono>
              <CopyBtn text={`hsv(${derived.hsv.h}, ${derived.hsv.s}%, ${derived.hsv.v}%)`} />
            </Row>
            <Row label="CMYK">
              <Mono>{`cmyk(${derived.cmyk.c}%, ${derived.cmyk.m}%, ${derived.cmyk.y}%, ${derived.cmyk.k}%)`}</Mono>
              <CopyBtn text={`cmyk(${derived.cmyk.c}%, ${derived.cmyk.m}%, ${derived.cmyk.y}%, ${derived.cmyk.k}%)`} />
            </Row>
            <Row label={s('luminanceLabel')}>
              <Mono>{derived.luminance.toFixed(4)}</Mono>
            </Row>
          </div>

          <div className="mt-5">
            <OptLabel>{s('tintsShades')}</OptLabel>
            <div className="grid grid-cols-9 gap-1.5">
              {derived.shades.map((shade) => (
                <button
                  key={shade}
                  type="button"
                  onClick={() => copySwatch(shade)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 h-12 cursor-pointer hover:scale-[1.03] transition-transform"
                  style={{ backgroundColor: shade }}
                  title={s('copyValue').replace('{value}', shade)}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] font-mono text-gray-500">{derived.shades[0]}</span>
              <span className="text-[10px] font-semibold text-emerald-600">{copiedHex ? s('copiedValue').replace('{value}', copiedHex) : ''}</span>
              <span className="text-[10px] font-mono text-gray-500">{derived.shades[derived.shades.length - 1]}</span>
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-white text-gray-900">
              <div className="text-xs font-bold mb-1" style={{ color: derived.hex }}>{s('sampleOnWhite')}</div>
              <div className="text-sm font-extrabold text-gray-900">{derived.vsWhite.toFixed(2)} : 1</div>
              <div className="flex gap-1.5 mt-2">
                <PassBadge ok={derived.vsWhite >= 4.5} label="AA" />
                <PassBadge ok={derived.vsWhite >= 7} label="AAA" />
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-950 text-gray-100">
              <div className="text-xs font-bold mb-1" style={{ color: derived.hex }}>{s('sampleOnBlack')}</div>
              <div className="text-sm font-extrabold">{derived.vsBlack.toFixed(2)} : 1</div>
              <div className="flex gap-1.5 mt-2">
                <PassBadge ok={derived.vsBlack >= 4.5} label="AA" />
                <PassBadge ok={derived.vsBlack >= 7} label="AAA" />
              </div>
            </div>
          </div>
        </>
      )}
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 3. CSS Gradient Generator
// ---------------------------------------------------------------------------

interface GradientStop {
  id: number;
  color: string;
  pos: number;
}

const GRADIENT_PRESETS: { labelKey: string; stops: [string, number][] }[] = [
  { labelKey: 'gradSunset', stops: [['#ff7e5f', 0], ['#feb47b', 100]] },
  { labelKey: 'gradOcean', stops: [['#2193b0', 0], ['#6dd5ed', 100]] },
  { labelKey: 'gradForest', stops: [['#11998e', 0], ['#38ef7d', 100]] },
  { labelKey: 'gradPurpleHaze', stops: [['#8e2de2', 0], ['#4a00e0', 100]] },
];

export const CssGradientGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const c = useStrings(COMMON);
  const idRef = useRef(2);
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<GradientStop[]>([
    { id: 0, color: '#ff7e5f', pos: 0 },
    { id: 1, color: '#feb47b', pos: 100 },
  ]);

  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopsCss = sorted.map((s) => `${s.color} ${s.pos}%`).join(', ');
  const gradientCss = type === 'linear' ? `linear-gradient(${angle}deg, ${stopsCss})` : `radial-gradient(circle, ${stopsCss})`;
  const cssOutput = `background: ${gradientCss};`;

  const applyPreset = (preset: (typeof GRADIENT_PRESETS)[number]) => {
    setType('linear');
    setStops(preset.stops.map(([color, pos], i) => ({ id: i, color, pos })));
    idRef.current = preset.stops.length;
  };

  const updateStop = (id: number, patch: Partial<GradientStop>) =>
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <DevCard tool={tool} note={s('gradientNote')}>
      <div className="flex gap-2 flex-wrap mb-4">
        {GRADIENT_PRESETS.map((p) => (
          <Chip key={p.labelKey} onClick={() => applyPreset(p)}>
            {s(p.labelKey)}
          </Chip>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('gradientType')}</OptLabel>
          <OptSelect value={type} onChange={(e) => setType(e.target.value as 'linear' | 'radial')}>
            <option value="linear">{s('linearOpt')}</option>
            <option value="radial">{s('radialOpt')}</option>
          </OptSelect>
        </div>
        {type === 'linear' && (
          <div>
            <OptLabel>{s('angleLabel')}: {angle}°</OptLabel>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="flex-1 accent-violet-600"
              />
              <div className="w-20">
                <OptInput type="number" min={0} max={360} value={angle} onChange={(e) => setAngle(Math.max(0, Math.min(360, parseInt(e.target.value || '0', 10) || 0)))} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <OptLabel>{s('colorStops')}</OptLabel>
        {stops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-2 flex-wrap">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(stop.color) ? stop.color : '#000000'}
              onChange={(e) => updateStop(stop.id, { color: e.target.value })}
              className="w-12 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer p-0.5 shrink-0"
            />
            <div className="w-28">
              <OptInput dir="ltr" value={stop.color} onChange={(e) => updateStop(stop.id, { color: e.target.value })} className="font-mono text-left" spellCheck={false} />
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min={0}
                max={100}
                value={stop.pos}
                onChange={(e) => updateStop(stop.id, { pos: parseInt(e.target.value, 10) })}
                className="w-28 accent-violet-600"
              />
              <div className="w-[70px]">
                <OptInput type="number" min={0} max={100} value={stop.pos} onChange={(e) => updateStop(stop.id, { pos: Math.max(0, Math.min(100, parseInt(e.target.value || '0', 10) || 0)) })} />
              </div>
              <span className="text-xs font-bold text-gray-500">%</span>
            </div>
            <button
              type="button"
              onClick={() => setStops((prev) => prev.filter((x) => x.id !== stop.id))}
              disabled={stops.length <= 2}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label={s('removeStop')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <PrimaryBtn
          onClick={() => {
            const mid = stops.length ? Math.round(stops.reduce((a, st) => a + st.pos, 0) / stops.length) : 50;
            setStops((prev) => [...prev, { id: idRef.current++, color: '#6366f1', pos: mid }]);
          }}
        >
          {s('addStop')}
        </PrimaryBtn>
      </div>

      <div className="mt-5">
        <OptLabel>{c('preview')}</OptLabel>
        <div className="h-44 rounded-2xl border border-gray-200 dark:border-gray-700" style={{ background: gradientCss }} />
      </div>

      <div className="mt-4">
        <OptLabel>CSS</OptLabel>
        <CodeOut code={cssOutput} />
        <div className="mt-2">
          <CopyBtn text={cssOutput} label={s('copyCss')} />
        </div>
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Number Base Converter
// ---------------------------------------------------------------------------

export const NumberBaseConverter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [value, setValue] = useState('255');
  const [fromSelect, setFromSelect] = useState('10');
  const [customFrom, setCustomFrom] = useState(5);
  const [customTo, setCustomTo] = useState(36);

  const fromBase = fromSelect === 'custom' ? Math.max(2, Math.min(36, customFrom || 2)) : parseInt(fromSelect, 10);

  const conversion = useMemo(() => {
    if (!value.trim()) return { error: '', results: [] as { base: number; value: string }[], bitDisplay: '' };
    try {
      convertBase(value, fromBase, 10);
    } catch (e) {
      return { error: e instanceof Error ? e.message : s('invalidValue'), results: [], bitDisplay: '' };
    }
    const bases = [2, 8, 10, 16];
    if (!bases.includes(customTo)) bases.push(customTo);
    const results = bases.map((b) => ({ base: b, value: convertBase(value, fromBase, b) }));
    let bitDisplay = '';
    const dec = convertBase(value, fromBase, 10);
    const bin = convertBase(value, fromBase, 2);
    if (!dec.startsWith('-')) {
      const n = Number(dec);
      if (Number.isSafeInteger(n)) {
        const padded = bin.padStart(Math.max(8, Math.ceil(bin.length / 8) * 8), '0');
        bitDisplay = (padded.match(/.{8}/g) || []).join(' ');
      }
    }
    return { error: '', results, bitDisplay };
  }, [value, fromBase, customTo, s]);

  const baseName = (b: number) =>
    b === 2 ? s('binaryWord') : b === 8 ? s('octalWord') : b === 10 ? s('decimalWord') : b === 16 ? s('hexWord') : s('baseWord').replace('{n}', String(b));

  return (
    <DevCard tool={tool} note={s('baseNote')}>
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div>
          <OptLabel>{s('valueLabel')}</OptLabel>
          <OptInput dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} className="font-mono text-left" placeholder="e.g. FF, 1010, 255" spellCheck={false} />
        </div>
        <div>
          <OptLabel>{s('fromBase')}</OptLabel>
          <OptSelect value={fromSelect} onChange={(e) => setFromSelect(e.target.value)}>
            <option value="2">2   {s('binaryWord')}</option>
            <option value="8">8   {s('octalWord')}</option>
            <option value="10">10   {s('decimalWord')}</option>
            <option value="16">16   {s('hexWord')}</option>
            <option value="custom">{s('customOpt')}</option>
          </OptSelect>
        </div>
        {fromSelect === 'custom' && (
          <div className="w-24">
            <OptLabel>{s('baseRange')}</OptLabel>
            <OptInput type="number" min={2} max={36} value={customFrom} onChange={(e) => setCustomFrom(parseInt(e.target.value || '2', 10))} />
          </div>
        )}
        <div className="w-28">
          <OptLabel>{s('extraBase')}</OptLabel>
          <OptInput type="number" min={2} max={36} value={customTo} onChange={(e) => setCustomTo(Math.max(2, Math.min(36, parseInt(e.target.value || '36', 10) || 36)))} />
        </div>
      </div>

      {conversion.error && (
        <div className="mt-4">
          <ErrorBox message={conversion.error} />
        </div>
      )}

      {conversion.results.length > 0 && (
        <div className="mt-4">
          {conversion.results.map((r) => (
            <Row key={r.base} label={s('baseWord').replace('{n}', String(r.base))}>
              <span className="text-[11px] font-semibold text-gray-400 w-24 shrink-0">{baseName(r.base)}</span>
              <Mono>{r.value}</Mono>
              <CopyBtn text={r.value} />
            </Row>
          ))}
          {conversion.bitDisplay && (
            <Row label={s('bitsLabel')}>
              <Mono>{conversion.bitDisplay}</Mono>
            </Row>
          )}
        </div>
      )}
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 5. URL Parser
// ---------------------------------------------------------------------------

export const UrlParser: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [raw, setRaw] = useState('https://user:pass@example.com:8080/path/to/page?foo=bar&baz=qux#section');
  const [paramsOverride, setParamsOverride] = useState<{ key: string; value: string }[] | null>(null);
  const [overrideFor, setOverrideFor] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const parsed = useMemo(() => {
    if (!raw.trim()) return { error: '' };
    try {
      return { parts: parseUrl(raw), error: '' };
    } catch {
      return { error: s('invalidAbsoluteUrl') };
    }
  }, [raw, s]);

  const effectiveParams = parsed.parts ? (overrideFor === raw && paramsOverride ? paramsOverride : parsed.parts.params) : [];

  const rebuilt = useMemo(() => {
    if (!parsed.parts) return '';
    try {
      const u = new URL(raw);
      u.search = '';
      effectiveParams.forEach((p) => u.searchParams.append(p.key, p.value));
      return u.toString();
    } catch {
      return '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.parts, effectiveParams, raw]);

  const applyParams = (next: { key: string; value: string }[]) => {
    setParamsOverride(next);
    setOverrideFor(raw);
  };

  return (
    <DevCard tool={tool} note={s('urlParserNote')}>
      <OptLabel>{s('urlToParse')}</OptLabel>
      <OptInput dir="ltr" value={raw} onChange={(e) => setRaw(e.target.value)} className="font-mono text-left" placeholder="https://example.com/path?a=1#top" spellCheck={false} />

      {parsed.error && (
        <div className="mt-4">
          <ErrorBox message={parsed.error} />
        </div>
      )}

      {parsed.parts && (
        <>
          <div className="mt-4">
            <Row label={s('rowProtocol')}><Mono>{parsed.parts.protocol}</Mono></Row>
            {parsed.parts.username && (
              <Row label={s('rowUsername')}><Mono>{decodeURIComponent(parsed.parts.username)}</Mono></Row>
            )}
            {parsed.parts.password && (
              <Row label={s('rowPassword')}><Mono>{decodeURIComponent(parsed.parts.password)}</Mono></Row>
            )}
            <Row label={s('rowHost')}><Mono>{parsed.parts.host}</Mono></Row>
            <Row label={s('rowHostname')}><Mono>{parsed.parts.hostname}</Mono></Row>
            <Row label={s('rowPort')}><Mono>{parsed.parts.port || s('defaultParens')}</Mono></Row>
            <Row label={s('rowPath')}><Mono>{parsed.parts.pathname}</Mono></Row>
            <Row label={s('rowSegments')}><Mono>{parsed.parts.pathSegments.length ? parsed.parts.pathSegments.join('  /  ') : s('noneParens')}</Mono></Row>
            <Row label={s('rowHash')}><Mono>{parsed.parts.hash || s('noneParens')}</Mono></Row>
            <Row label={s('rowOrigin')}><Mono>{parsed.parts.origin}</Mono></Row>
          </div>

          <div className="mt-5">
            <OptLabel>{s('queryParamsEditable')}</OptLabel>
            {effectiveParams.length === 0 && <p className="text-xs font-semibold text-gray-500">{s('noQueryParams')}</p>}
            <div className="space-y-2">
              {effectiveParams.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span dir="ltr" className="font-mono text-xs font-bold text-gray-700 dark:text-gray-200 w-32 truncate text-left" title={p.key}>{p.key}</span>
                  <div className="flex-1">
                    <OptInput
                      dir="ltr"
                      value={p.value}
                      onChange={(e) => applyParams(effectiveParams.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)))}
                      className="font-mono text-left"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => applyParams(effectiveParams.filter((_, xi) => xi !== i))}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                    aria-label={s('removeParam').replace('{key}', p.key)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 mt-3 flex-wrap">
              <div className="w-32">
                <OptLabel>{s('newKey')}</OptLabel>
                <OptInput dir="ltr" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="font-mono text-left" spellCheck={false} />
              </div>
              <div className="flex-1 min-w-[140px]">
                <OptLabel>{s('newValue')}</OptLabel>
                <OptInput dir="ltr" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="font-mono text-left" spellCheck={false} />
              </div>
              <PrimaryBtn
                disabled={!newKey.trim()}
                onClick={() => {
                  applyParams([...effectiveParams, { key: newKey.trim(), value: newValue }]);
                  setNewKey('');
                  setNewValue('');
                }}
              >
                {s('addParameter')}
              </PrimaryBtn>
            </div>
          </div>

          <div className="mt-5">
            <OptLabel>{s('rebuiltUrl')}</OptLabel>
            <CodeOut code={rebuilt} />
            <div className="mt-2">
              <CopyBtn text={rebuilt} label={s('copyUrl')} />
            </div>
          </div>
        </>
      )}
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 6. Text Diff Checker
// ---------------------------------------------------------------------------

export const TextDiffChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [a, setA] = useState('The quick brown fox\njumps over the lazy dog.\nLine three stays.\nOld line here.');
  const [b, setB] = useState('The quick brown fox\njumps over the sleepy dog.\nLine three stays.\nNew line here.');

  const aLines = a === '' ? 0 : a.split('\n').length;
  const bLines = b === '' ? 0 : b.split('\n').length;
  const tooBig = aLines > 1500 || bLines > 1500;

  const diff = useMemo(() => (tooBig || (!a && !b) ? [] : diffLines(a, b)), [a, b, tooBig]);
  const counts = useMemo(
    () => ({
      added: diff.filter((d) => d.type === 'added').length,
      removed: diff.filter((d) => d.type === 'removed').length,
      same: diff.filter((d) => d.type === 'same').length,
    }),
    [diff]
  );

  return (
    <DevCard tool={tool} note={s('diffNote')}>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('originalText')}</OptLabel>
          <DevTextarea rows={8} value={a} onChange={(e) => setA(e.target.value)} spellCheck={false} />
        </div>
        <div>
          <OptLabel>{s('changedText')}</OptLabel>
          <DevTextarea rows={8} value={b} onChange={(e) => setB(e.target.value)} spellCheck={false} />
        </div>
      </div>

      {tooBig ? (
        <p className="mt-4 text-xs font-semibold text-amber-600 dark:text-amber-400">
          {s('diffTooBig')}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Stat label={s('added')} value={counts.added} />
            <Stat label={s('removed')} value={counts.removed} />
            <Stat label={s('unchangedLabel')} value={counts.same} />
          </div>
          {diff.length > 0 && (
            <div dir="ltr" className="mt-4 border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto max-h-96">
              {diff.map((d, i) => (
                <div
                  key={i}
                  className={`flex gap-2 px-3 py-1 font-mono text-xs text-left whitespace-pre-wrap break-all ${
                    d.type === 'added'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                      : d.type === 'removed'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100'
                        : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="shrink-0 font-bold w-3 text-center">{d.type === 'added' ? '+' : d.type === 'removed' ? '−' : ' '}</span>
                  <span>{d.text || ' '}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 7. HTTP Status Code Reference
// ---------------------------------------------------------------------------

interface StatusInfo {
  code: number;
  name: string;
  desc: string;
}

const STATUS_CODES: StatusInfo[] = [
  { code: 100, name: 'Continue', desc: 'The server received the request headers; the client should send the body.' },
  { code: 101, name: 'Switching Protocols', desc: 'The server agrees to switch protocols, e.g. upgrading to WebSocket.' },
  { code: 103, name: 'Early Hints', desc: 'Hints at resources to preload while the server prepares the final response.' },
  { code: 200, name: 'OK', desc: 'The request succeeded. The default success response for GET requests.' },
  { code: 201, name: 'Created', desc: 'The request succeeded and a new resource was created (typical POST result).' },
  { code: 202, name: 'Accepted', desc: 'Accepted for processing, but not yet completed (async jobs, queues).' },
  { code: 204, name: 'No Content', desc: 'Success, but there is no body to return (common for DELETE).' },
  { code: 206, name: 'Partial Content', desc: 'Response to a Range request   used for resumable downloads and media streaming.' },
  { code: 301, name: 'Moved Permanently', desc: 'The resource permanently lives at a new URL. SEO link equity passes to the new URL.' },
  { code: 302, name: 'Found', desc: 'Temporary redirect to another URL; the original URL should be used in future.' },
  { code: 303, name: 'See Other', desc: 'Redirect to a new URL with a GET request, regardless of the original method.' },
  { code: 304, name: 'Not Modified', desc: 'The cached version is still valid   the body is not resent.' },
  { code: 307, name: 'Temporary Redirect', desc: 'Temporary redirect that preserves the request method and body (unlike 302).' },
  { code: 308, name: 'Permanent Redirect', desc: 'Permanent redirect that preserves the request method and body (unlike 301).' },
  { code: 400, name: 'Bad Request', desc: 'The server cannot process the request due to malformed syntax or invalid data.' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication is required or the supplied credentials were rejected.' },
  { code: 403, name: 'Forbidden', desc: 'The server understood the request but refuses to authorize it   login will not help.' },
  { code: 404, name: 'Not Found', desc: 'The requested resource does not exist on the server.' },
  { code: 405, name: 'Method Not Allowed', desc: 'The HTTP method (e.g. DELETE) is not supported for this resource.' },
  { code: 408, name: 'Request Timeout', desc: 'The client took too long to send the request.' },
  { code: 409, name: 'Conflict', desc: 'The request conflicts with the current state of the resource (e.g. edit conflicts).' },
  { code: 410, name: 'Gone', desc: 'The resource was intentionally and permanently removed (stronger than 404).' },
  { code: 413, name: 'Payload Too Large', desc: 'The request body exceeds the server\'s size limit.' },
  { code: 415, name: 'Unsupported Media Type', desc: 'The server refuses the request\'s content format (Content-Type).' },
  { code: 418, name: 'I\'m a Teapot', desc: 'An April Fools\' joke from RFC 2324   some APIs return it for requests they refuse to serve.' },
  { code: 422, name: 'Unprocessable Content', desc: 'Syntax is valid but the data fails semantic validation (very common in JSON APIs).' },
  { code: 429, name: 'Too Many Requests', desc: 'Rate limit hit. Back off and retry later, ideally honoring Retry-After.' },
  { code: 451, name: 'Unavailable For Legal Reasons', desc: 'Access is blocked for legal reasons, e.g. court orders or regional law.' },
  { code: 500, name: 'Internal Server Error', desc: 'A generic server-side failure   an unhandled exception or crash in the application.' },
  { code: 501, name: 'Not Implemented', desc: 'The server does not support the functionality required for this request.' },
  { code: 502, name: 'Bad Gateway', desc: 'A proxy/gateway received an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', desc: 'The server is temporarily down for maintenance or overloaded. Retry later.' },
  { code: 504, name: 'Gateway Timeout', desc: 'A proxy/gateway did not receive a timely response from the upstream server.' },
  { code: 507, name: 'Insufficient Storage', desc: 'The server has no space left to store the representation needed to complete the request.' },
  { code: 511, name: 'Network Authentication Required', desc: 'A captive portal (hotel/airport Wi-Fi) requires login before network access.' },
];

const CLASS_STYLES: Record<number, string> = {
  1: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  2: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  3: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  5: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800',
};

export const HttpStatusReference: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [query, setQuery] = useState('');
  const [cls, setCls] = useState(0);

  const filtered = STATUS_CODES.filter((s) => {
    if (cls && Math.floor(s.code / 100) !== cls) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return String(s.code).includes(q) || s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  });

  return (
    <DevCard tool={tool} note={s('httpNote')}>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <OptLabel>{s('searchCodes')}</OptLabel>
          <OptInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={s('searchCodesPlaceholder')} />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mt-3">
        {[0, 1, 2, 3, 4, 5].map((c) => (
          <Chip key={c} active={cls === c} onClick={() => setCls(c)}>
            {c === 0 ? s('allWord') : `${c}xx`}
          </Chip>
        ))}
      </div>

      <p className="mt-3 text-xs font-semibold text-gray-500">
        {s('showingCodes').replace('{x}', String(filtered.length)).replace('{y}', String(STATUS_CODES.length))}
      </p>
      <div className="mt-2 space-y-1.5 max-h-[480px] overflow-auto pe-1">
        {filtered.map((s) => (
          <div key={s.code} className="flex items-start gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900">
            <span className={`shrink-0 font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg border ${CLASS_STYLES[Math.floor(s.code / 100)]}`}>{s.code}</span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</div>
              <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-xs font-semibold text-gray-500 py-4 text-center">{s('noStatusMatch')}</p>}
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Chmod Calculator
// ---------------------------------------------------------------------------

type Triplet = [boolean, boolean, boolean];
interface PermState {
  owner: Triplet;
  group: Triplet;
  public: Triplet;
}

function permsFromOctal(octal: string): PermState {
  const digit = (ch: string): Triplet => {
    const n = parseInt(ch, 10);
    return [Boolean(n & 4), Boolean(n & 2), Boolean(n & 1)];
  };
  return { owner: digit(octal[0]), group: digit(octal[1]), public: digit(octal[2]) };
}

export const ChmodCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [perms, setPerms] = useState<PermState>({ owner: [true, true, false], group: [true, false, false], public: [true, false, false] });
  const [filename, setFilename] = useState('file.txt');
  const [octalOverride, setOctalOverride] = useState<string | null>(null);

  const result = chmodCalc(perms);
  const octalShown = octalOverride ?? result.octal;
  const octalValid = /^[0-7]{3}$/.test(octalShown);

  const applyPerms = (next: PermState) => {
    setPerms(next);
    setOctalOverride(null);
  };

  const toggle = (who: keyof PermState, idx: 0 | 1 | 2) => {
    const next: PermState = { owner: [...perms.owner] as Triplet, group: [...perms.group] as Triplet, public: [...perms.public] as Triplet };
    next[who][idx] = !next[who][idx];
    applyPerms(next);
  };

  const onOctalChange = (v: string) => {
    setOctalOverride(v);
    if (/^[0-7]{3}$/.test(v)) setPerms(permsFromOctal(v));
  };

  const command = `chmod ${result.octal} ${filename || 'file.txt'}`;
  const rows: { key: keyof PermState; label: string }[] = [
    { key: 'owner', label: s('permOwner') },
    { key: 'group', label: s('permGroup') },
    { key: 'public', label: s('permPublic') },
  ];
  const permNames = [s('permRead'), s('permWrite'), s('permExecute')];

  return (
    <DevCard tool={tool} note={s('chmodNote')}>
      <div className="flex gap-2 flex-wrap mb-4">
        {['644', '755', '777', '600', '700'].map((p) => (
          <Chip key={p} active={result.octal === p && octalOverride === null} onClick={() => applyPerms(permsFromOctal(p))}>
            {p}
          </Chip>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full max-w-md text-sm">
          <thead>
            <tr className="text-start text-xs uppercase tracking-wide text-gray-500">
              <th className="py-1.5 pe-3 font-bold">{s('chmodWho')}</th>
              <th className="py-1.5 px-3 font-bold text-center">{s('permRead')}</th>
              <th className="py-1.5 px-3 font-bold text-center">{s('permWrite')}</th>
              <th className="py-1.5 px-3 font-bold text-center">{s('permExecute')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 pe-3 font-bold text-gray-900 dark:text-white">{row.label}</td>
                {([0, 1, 2] as const).map((idx) => (
                  <td key={idx} className="py-2 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={perms[row.key][idx]}
                      onChange={() => toggle(row.key, idx)}
                      className="accent-violet-600 w-4 h-4 cursor-pointer"
                      aria-label={`${row.label} ${permNames[idx]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-end gap-4 mt-5 flex-wrap">
        <div>
          <OptLabel>{s('octalLabelX')}</OptLabel>
          <div className="text-4xl font-mono font-extrabold text-gray-900 dark:text-white leading-none">{result.octal}</div>
        </div>
        <div>
          <OptLabel>{s('symbolicLabel')}</OptLabel>
          <div dir="ltr" className="font-mono text-lg font-bold text-gray-900 dark:text-white leading-none">-{result.symbolic}</div>
        </div>
        <div className="w-28">
          <OptLabel>{s('typeOctal')}</OptLabel>
          <OptInput dir="ltr" value={octalShown} onChange={(e) => onOctalChange(e.target.value.replace(/[^0-7]/g, '').slice(0, 3))} className="font-mono text-left" maxLength={3} />
        </div>
      </div>
      {octalOverride !== null && !octalValid && <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">{s('octalError')}</p>}

      <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <OptLabel>{s('fileNameFull')}</OptLabel>
          <OptInput dir="ltr" value={filename} onChange={(e) => setFilename(e.target.value)} className="font-mono text-left" placeholder="file.txt" spellCheck={false} />
        </div>
      </div>
      <div className="mt-3">
        <CodeOut code={command} />
        <div className="mt-2">
          <CopyBtn text={command} label={s('copyCommand')} />
        </div>
      </div>
    </DevCard>
  );
};

// ---------------------------------------------------------------------------
// 9. User Agent Parser
// ---------------------------------------------------------------------------

export const UserAgentParser: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(DEV_STRINGS);
  const [ua, setUa] = useState('');
  const info = useMemo(() => (ua.trim() ? parseUserAgent(ua) : null), [ua]);

  return (
    <DevCard tool={tool} note={s('uaNote')}>
      <OptLabel>{s('uaString')}</OptLabel>
      <DevTextarea rows={3} value={ua} onChange={(e) => setUa(e.target.value)} placeholder={s('uaPlaceholder')} spellCheck={false} />
      <div className="mt-3">
        <PrimaryBtn onClick={() => setUa(navigator.userAgent)}>{s('useMyUa')}</PrimaryBtn>
      </div>

      {info && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <Stat label={s('statBrowser')} value={info.browserVersion ? `${info.browser} ${info.browserVersion.split('.')[0]}` : info.browser} />
            <Stat label="OS" value={info.os} />
            <Stat label={s('statDevice')} value={info.device} />
            <Stat label={s('statEngine')} value={info.engine} />
          </div>
          <div className="mt-4">
            <Row label={s('statBrowser')}><Mono>{info.browser}</Mono></Row>
            <Row label={s('versionLabel')}><Mono>{info.browserVersion || s('unknownParens')}</Mono></Row>
            <Row label={s('osLabel')}><Mono>{info.os}</Mono></Row>
            <Row label={s('deviceType')}><Mono>{info.device}</Mono></Row>
            <Row label={s('layoutEngine')}><Mono>{info.engine}</Mono></Row>
          </div>
        </>
      )}
      {!info && <p className="mt-4 text-xs font-semibold text-gray-500">{s('uaEmptyHint')}</p>}
    </DevCard>
  );
};
