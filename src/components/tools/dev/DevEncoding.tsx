import React, { useEffect, useMemo, useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
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
import {
  decodeJwt,
  signJwtHs256,
  verifyJwtHs256,
  base64Encode,
  base64Decode,
  encodeHtmlEntities,
  decodeHtmlEntities,
  md5,
  shaHash,
  hmacHash,
  generatePassword,
  passwordEntropy,
  generateUuid,
  detectTimestampUnit,
  relativeTime,
  parseCron,
  explainCron,
  cronNextRuns,
} from '../../../lib/dev/core';
import type { PasswordOptions, CronField } from '../../../lib/dev/core';

// ---------------- shared bits ----------------

const ModeToggle: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}> = ({ options, value, onChange }) => (
  <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
          value === o.value
            ? 'bg-violet-600 text-white'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const WarnBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
    {message}
  </div>
);

const ResultTable: React.FC<{ rows: { label: string; value: string; copy?: boolean }[] }> = ({ rows }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
    {rows.map((r, i) => (
      <div
        key={r.label}
        className={`flex items-center gap-3 px-3 py-2 text-sm ${i % 2 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
      >
        <span className="w-36 shrink-0 text-xs font-bold uppercase tracking-wide text-gray-500">{r.label}</span>
        <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all">{r.value}</span>
        {r.copy && (
          <span className="ml-auto shrink-0">
            <CopyBtn text={r.value} />
          </span>
        )}
      </div>
    ))}
  </div>
);

// ---------------- 1. JWT Decoder ----------------

export const JwtDecoder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try {
      return { data: decodeJwt(token), error: '' };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Invalid token' };
    }
  }, [token]);

  useEffect(() => {
    setVerifyResult(null);
  }, [token, secret]);

  const loadDemo = async () => {
    const demoSecret = 'your-256-bit-secret';
    const t = await signJwtHs256({ sub: '1234567890', name: 'John Doe', iat: 1516239022 }, demoSecret);
    setSecret(demoSecret);
    setToken(t);
  };

  const doVerify = async () => {
    setVerifying(true);
    const ok = await verifyJwtHs256(token, secret);
    setVerifyResult(ok);
    setVerifying(false);
  };

  const payload = decoded?.data?.payload;
  const nowSec = Math.floor(Date.now() / 1000);
  const expired = payload && typeof payload.exp === 'number' && payload.exp < nowSec;
  const notYetValid = payload && typeof payload.nbf === 'number' && payload.nbf > nowSec;
  const dateClaims = ['exp', 'iat', 'nbf', 'auth_time'];

  return (
    <DevCard
      tool={tool}
      note="Decoding only reads the token's contents — anyone holding a token can do this; a JWT is signed, not encrypted, so never put secrets in one. Signature verification here supports HS256 (HMAC-SHA256) only."
    >
      <OptLabel>JSON Web Token</OptLabel>
      <DevTextarea
        rows={4}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        spellCheck={false}
      />
      <div className="mt-3">
        <PrimaryBtn onClick={loadDemo}>Load demo token</PrimaryBtn>
      </div>

      {decoded?.error && (
        <div className="mt-4">
          <ErrorBox message={decoded.error} />
        </div>
      )}

      {decoded?.data && (
        <div className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <OptLabel>Header</OptLabel>
              <CodeOut code={JSON.stringify(decoded.data.header, null, 2)} maxH="max-h-64" />
            </div>
            <div>
              <OptLabel>Payload</OptLabel>
              <CodeOut code={JSON.stringify(decoded.data.payload, null, 2)} maxH="max-h-64" />
            </div>
          </div>

          {expired && <WarnBox message="This token is expired — its exp claim is in the past, so servers should reject it." />}
          {notYetValid && <WarnBox message="This token is not yet valid — its nbf (not-before) claim is in the future." />}

          <div>
            <OptLabel>Claims</OptLabel>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {Object.entries(decoded.data.payload).map(([k, v], i) => {
                const isDate = dateClaims.includes(k) && typeof v === 'number';
                const d = isDate ? new Date((v as number) * 1000) : null;
                return (
                  <div
                    key={k}
                    className={`flex flex-wrap items-baseline gap-x-3 px-3 py-2 text-sm ${i % 2 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <span className="w-28 shrink-0 font-mono text-xs font-bold text-gray-700 dark:text-gray-200">{k}</span>
                    <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white break-all">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                    </span>
                    {d && (
                      <span className="text-xs text-gray-500">
                        = {d.toISOString()} ({relativeTime(d)})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <OptLabel>Signature (base64url)</OptLabel>
            <CodeOut code={decoded.data.signature || '(empty)'} maxH="max-h-24" />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <OptLabel>Verify HS256 signature — shared secret</OptLabel>
            <div className="flex flex-wrap gap-2 items-start">
              <div className="flex-1 min-w-[220px]">
                <OptInput
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="your-256-bit-secret"
                  spellCheck={false}
                />
              </div>
              <PrimaryBtn onClick={doVerify} disabled={verifying || !token.trim()}>
                {verifying ? 'Verifying…' : 'Verify HS256 signature'}
              </PrimaryBtn>
            </div>
            {verifyResult !== null && (
              <div
                className={`mt-3 text-xs font-semibold rounded-xl px-3 py-2.5 border ${
                  verifyResult
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                    : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
                }`}
              >
                {verifyResult
                  ? 'Signature is valid — this token was signed with that secret and has not been tampered with.'
                  : 'Signature is INVALID — the secret is wrong, or the token was modified after signing.'}
              </div>
            )}
          </div>
        </div>
      )}
    </DevCard>
  );
};

// ---------------- 2. Base64 ----------------

export const Base64Tool: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      return { output: mode === 'encode' ? base64Encode(input, urlSafe) : base64Decode(input), error: '' };
    } catch {
      return { output: '', error: 'That is not valid Base64 — check for missing padding or characters outside the Base64 alphabet.' };
    }
  }, [input, mode, urlSafe]);

  return (
    <DevCard
      tool={tool}
      note="Text is encoded as UTF-8 bytes first, so Unicode (emoji, Urdu, Chinese…) survives the round trip — unlike a naive btoa() call, which throws on anything outside Latin-1. Decoding accepts both the standard and URL-safe alphabets."
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <ModeToggle
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <OptCheck label="URL-safe alphabet (- and _, no padding)" checked={urlSafe} onChange={setUrlSafe} />
      </div>
      <OptLabel>{mode === 'encode' ? 'Text to encode' : 'Base64 to decode'}</OptLabel>
      <DevTextarea rows={5} value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Type or paste text…' : 'Paste Base64…'} spellCheck={false} />
      {result.error && (
        <div className="mt-3">
          <ErrorBox message={result.error} />
        </div>
      )}
      <div className="mt-4">
        <OptLabel>Result</OptLabel>
        <DevTextarea rows={5} value={result.output} readOnly placeholder="Output appears here…" spellCheck={false} />
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <CopyBtn text={result.output} label="Copy result" />
        <Stat label="Input chars" value={input.length} />
        <Stat label="Output chars" value={result.output.length} />
      </div>
    </DevCard>
  );
};

// ---------------- 3. URL encoder / decoder ----------------

export const UrlEncoderDecoder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState('encode');
  const [variant, setVariant] = useState('component');
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    if (!input) return { output: '', error: '' };
    try {
      const output =
        mode === 'encode'
          ? variant === 'component'
            ? encodeURIComponent(input)
            : encodeURI(input)
          : variant === 'component'
            ? decodeURIComponent(input)
            : decodeURI(input);
      return { output, error: '' };
    } catch {
      return { output: '', error: 'Malformed percent-encoding — a "%" that is not followed by two hex digits cannot be decoded.' };
    }
  }, [input, mode, variant]);

  return (
    <DevCard
      tool={tool}
      note="encodeURIComponent escapes everything except A-Z a-z 0-9 - _ . ! ~ * ' ( ) — use it for a single value inside a query string. encodeURI leaves URL structure characters (: / ? & = #) intact — use it for a complete URL."
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <ModeToggle
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <div className="w-56">
          <OptSelect value={variant} onChange={(e) => setVariant(e.target.value)}>
            <option value="component">Component (query value)</option>
            <option value="uri">Full URL (encodeURI)</option>
          </OptSelect>
        </div>
      </div>
      <OptLabel>Input</OptLabel>
      <DevTextarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'https://example.com/search?q=hello world&lang=ur' : 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world'} spellCheck={false} />
      {result.error && (
        <div className="mt-3">
          <ErrorBox message={result.error} />
        </div>
      )}
      <div className="mt-4">
        <OptLabel>Result</OptLabel>
        <DevTextarea rows={4} value={result.output} readOnly placeholder="Output appears here…" spellCheck={false} />
      </div>
      <div className="mt-3">
        <CopyBtn text={result.output} label="Copy result" />
      </div>
    </DevCard>
  );
};

// ---------------- 4. HTML entities ----------------

export const HtmlEntityTool: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [mode, setMode] = useState('encode');
  const [numericNonAscii, setNumericNonAscii] = useState(true);
  const [input, setInput] = useState('');

  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'encode' ? encodeHtmlEntities(input, !numericNonAscii) : decodeHtmlEntities(input);
  }, [input, mode, numericNonAscii]);

  return (
    <DevCard
      tool={tool}
      note="Encoding escapes & < > &quot; and ' — the characters that break HTML when pasted as text. Decoding understands named entities (&amp;copy; &amp;mdash;…), decimal (&#169;) and hex (&#xA9;) forms."
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <ModeToggle
          options={[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === 'encode' && (
          <OptCheck label="Encode non-ASCII as numeric entities too" checked={numericNonAscii} onChange={setNumericNonAscii} />
        )}
      </div>
      <OptLabel>Input</OptLabel>
      <DevTextarea rows={5} value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Tom & Jerry <3 "quotes" — café' : '&lt;p&gt;Tom &amp;amp; Jerry &amp;#169;&lt;/p&gt;'} spellCheck={false} />
      <div className="mt-4">
        <OptLabel>Result</OptLabel>
        <DevTextarea rows={5} value={output} readOnly placeholder="Output appears here…" spellCheck={false} />
      </div>
      <div className="mt-3">
        <CopyBtn text={output} label="Copy result" />
      </div>
    </DevCard>
  );
};

// ---------------- 5. Hash generator ----------------

const SHA_ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

export const HashGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ label: string; value: string }[]>([]);
  const [hmacKey, setHmacKey] = useState('');
  const [hmacAlgo, setHmacAlgo] = useState<'SHA-256' | 'SHA-512'>('SHA-256');
  const [hmacValue, setHmacValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSha256, setFileSha256] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = [{ label: 'MD5', value: md5(input) }];
      const sha = await Promise.all(SHA_ALGOS.map((a) => shaHash(a, input)));
      if (cancelled) return;
      SHA_ALGOS.forEach((a, i) => rows.push({ label: a, value: sha[i] }));
      setHashes(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hmacKey) {
        if (!cancelled) setHmacValue('');
        return;
      }
      const v = await hmacHash(hmacAlgo, hmacKey, input);
      if (!cancelled) setHmacValue(v);
    })();
    return () => {
      cancelled = true;
    };
  }, [input, hmacKey, hmacAlgo]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setFileName(f.name);
    const buf = await f.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buf);
    setFileSha256([...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <DevCard
      tool={tool}
      note="A hash is a one-way fingerprint: same input, same hash, and the input cannot be recovered from it. MD5 and SHA-1 are collision-broken — fine as checksums, never for password storage or signatures. File hashing below computes SHA-256 only."
    >
      <OptLabel>Text to hash</OptLabel>
      <DevTextarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text…" spellCheck={false} />
      <div className="mt-4 space-y-2">
        {hashes.map((h) => (
          <div key={h.label} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <span className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-gray-500">{h.label}</span>
            <span className="font-mono text-xs text-gray-900 dark:text-white break-all">{h.value}</span>
            <span className="ml-auto shrink-0">
              <CopyBtn text={h.value} />
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-4">
        <OptLabel>HMAC (keyed hash) of the same text</OptLabel>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px]">
            <OptInput value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Secret key" spellCheck={false} />
          </div>
          <div className="w-36">
            <OptSelect value={hmacAlgo} onChange={(e) => setHmacAlgo(e.target.value as 'SHA-256' | 'SHA-512')}>
              <option value="SHA-256">HMAC-SHA-256</option>
              <option value="SHA-512">HMAC-SHA-512</option>
            </OptSelect>
          </div>
        </div>
        {hmacValue && (
          <div className="flex items-center gap-3 mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <span className="font-mono text-xs text-gray-900 dark:text-white break-all">{hmacValue}</span>
            <span className="ml-auto shrink-0">
              <CopyBtn text={hmacValue} />
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-4">
        <OptLabel>Hash a file (SHA-256)</OptLabel>
        <input
          type="file"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border file:border-gray-200 file:dark:border-gray-700 file:bg-gray-100 file:dark:bg-gray-800 file:text-xs file:font-bold file:cursor-pointer"
        />
        {fileSha256 && (
          <div className="flex items-center gap-3 mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <span className="shrink-0 text-xs font-bold text-gray-500 truncate max-w-[140px]">{fileName}</span>
            <span className="font-mono text-xs text-gray-900 dark:text-white break-all">{fileSha256}</span>
            <span className="ml-auto shrink-0">
              <CopyBtn text={fileSha256} />
            </span>
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------- 6. Password generator ----------------

const DEFAULT_PW_OPTS: PasswordOptions = {
  length: 16,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: false,
  excludeAmbiguous: false,
};

function entropyLabel(bits: number): string {
  if (bits < 40) return 'Weak';
  if (bits < 60) return 'Fair';
  if (bits < 80) return 'Strong';
  return 'Excellent';
}

export const PasswordGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_PW_OPTS);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>(() =>
    Array.from({ length: 5 }, () => generatePassword(DEFAULT_PW_OPTS))
  );

  const hasSet = opts.lowercase || opts.uppercase || opts.numbers || opts.symbols;
  const entropy = passwordEntropy(opts);

  const regenerate = () => {
    if (!hasSet) {
      setPasswords([]);
      return;
    }
    setPasswords(Array.from({ length: count }, () => generatePassword(opts)));
  };

  const setOpt = <K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) =>
    setOpts((o) => ({ ...o, [key]: value }));

  return (
    <DevCard
      tool={tool}
      note="Passwords are generated on this device with crypto.getRandomValues — a cryptographically secure random source — and are never sent anywhere. Use a unique password per account and store them in a password manager."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>Length: {opts.length}</OptLabel>
          <input
            type="range"
            min={4}
            max={128}
            value={opts.length}
            onChange={(e) => setOpt('length', parseInt(e.target.value, 10))}
            className="w-full accent-violet-600"
          />
          <OptInput
            type="number"
            min={4}
            max={128}
            value={opts.length}
            onChange={(e) => setOpt('length', Math.max(4, Math.min(128, parseInt(e.target.value || '16', 10))))}
          />
        </div>
        <div>
          <OptLabel>How many</OptLabel>
          <OptSelect value={count} onChange={(e) => setCount(parseInt(e.target.value, 10))}>
            {[1, 5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n} password{n > 1 ? 's' : ''}
              </option>
            ))}
          </OptSelect>
          <div className="flex flex-wrap gap-4 mt-3">
            <Stat label="Entropy" value={`${entropy} bits`} />
            <Stat label="Strength" value={hasSet ? entropyLabel(entropy) : '—'} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
        <OptCheck label="Lowercase (a-z)" checked={opts.lowercase} onChange={(v) => setOpt('lowercase', v)} />
        <OptCheck label="Uppercase (A-Z)" checked={opts.uppercase} onChange={(v) => setOpt('uppercase', v)} />
        <OptCheck label="Numbers (0-9)" checked={opts.numbers} onChange={(v) => setOpt('numbers', v)} />
        <OptCheck label="Symbols (!@#$…)" checked={opts.symbols} onChange={(v) => setOpt('symbols', v)} />
        <OptCheck label="Exclude ambiguous (0, O, l, 1, I)" checked={opts.excludeAmbiguous} onChange={(v) => setOpt('excludeAmbiguous', v)} />
      </div>
      {!hasSet && (
        <div className="mt-4">
          <ErrorBox message="Select at least one character set — a password cannot be generated from an empty pool." />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={regenerate} disabled={!hasSet}>
          Generate new passwords
        </PrimaryBtn>
      </div>
      {passwords.length > 0 && (
        <div className="mt-4 space-y-2">
          {passwords.map((pw, i) => (
            <div key={`${i}-${pw}`} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
              <span className="font-mono text-sm text-gray-900 dark:text-white break-all">{pw}</span>
              <span className="ml-auto shrink-0">
                <CopyBtn text={pw} />
              </span>
            </div>
          ))}
        </div>
      )}
    </DevCard>
  );
};

// ---------------- 7. UUID generator ----------------

export const UuidGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [version, setVersion] = useState<'4' | '7'>('4');
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, () => generateUuid(4)));

  const regenerate = () => {
    const n = Math.max(1, Math.min(500, count || 1));
    setUuids(Array.from({ length: n }, () => generateUuid(version === '7' ? 7 : 4)));
  };

  return (
    <DevCard
      tool={tool}
      note="Version 4 UUIDs are fully random (122 bits of entropy — collisions are practically impossible). Version 7 embeds the current millisecond timestamp first, so UUIDs sort by creation time — friendlier for database indexes."
    >
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-52">
          <OptLabel>Version</OptLabel>
          <OptSelect value={version} onChange={(e) => setVersion(e.target.value as '4' | '7')}>
            <option value="4">Version 4 (random)</option>
            <option value="7">Version 7 (time-ordered)</option>
          </OptSelect>
        </div>
        <div className="w-32">
          <OptLabel>Count (1–500)</OptLabel>
          <OptInput
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value || '1', 10))}
          />
        </div>
        <PrimaryBtn onClick={regenerate}>Generate UUIDs</PrimaryBtn>
      </div>
      <div className="mt-4">
        <DevTextarea rows={8} value={uuids.join('\n')} readOnly spellCheck={false} />
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <CopyBtn text={uuids.join('\n')} label="Copy all" />
        <DownloadBtn content={uuids.join('\n')} filename="uuids.txt" label="Download .txt" />
        <Stat label="Generated" value={uuids.length} />
        <Stat label="Version" value={`v${version}`} />
      </div>
    </DevCard>
  );
};

// ---------------- 8. Timestamp converter ----------------

export const TimestampConverter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [tsInput, setTsInput] = useState('');
  const [unitOverride, setUnitOverride] = useState<'auto' | 's' | 'ms'>('auto');
  const [dateInput, setDateInput] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed = useMemo(() => {
    const v = Number(tsInput.trim());
    if (!tsInput.trim() || Number.isNaN(v)) return null;
    const unit = unitOverride === 'auto' ? detectTimestampUnit(v) : unitOverride;
    const date = new Date(unit === 's' ? v * 1000 : v);
    if (Number.isNaN(date.getTime())) return null;
    return { v, unit, date };
  }, [tsInput, unitOverride]);

  const fromDate = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (Number.isNaN(d.getTime())) return null;
    return { seconds: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }, [dateInput]);

  return (
    <DevCard
      tool={tool}
      note="Unix timestamps count seconds since 1 Jan 1970 UTC — but JavaScript and many APIs use milliseconds, a 1000× trap. The auto detector treats values with 11+ digits as milliseconds; override it if a value is misread."
    >
      <div>
        <OptLabel>Current time (live)</OptLabel>
        <ResultTable
          rows={[
            { label: 'Unix seconds', value: String(Math.floor(now.getTime() / 1000)), copy: true },
            { label: 'Unix milliseconds', value: String(now.getTime()), copy: true },
            { label: 'ISO 8601', value: now.toISOString(), copy: true },
          ]}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-4">
        <OptLabel>Timestamp → date</OptLabel>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[220px]">
            <OptInput value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder="e.g. 1760000000 or 1760000000000" spellCheck={false} />
          </div>
          <div className="w-44">
            <OptSelect value={unitOverride} onChange={(e) => setUnitOverride(e.target.value as 'auto' | 's' | 'ms')}>
              <option value="auto">Unit: Auto-detect</option>
              <option value="s">Unit: Seconds</option>
              <option value="ms">Unit: Milliseconds</option>
            </OptSelect>
          </div>
        </div>
        {tsInput.trim() && !parsed && (
          <div className="mt-3">
            <ErrorBox message="That does not parse as a valid timestamp." />
          </div>
        )}
        {parsed && (
          <div className="mt-3">
            <ResultTable
              rows={[
                { label: `Detected unit`, value: parsed.unit === 's' ? 'Seconds' : 'Milliseconds' },
                { label: 'ISO 8601', value: parsed.date.toISOString(), copy: true },
                { label: 'UTC', value: parsed.date.toUTCString() },
                { label: 'Local', value: parsed.date.toLocaleString() },
                { label: 'Unix seconds', value: String(Math.floor(parsed.date.getTime() / 1000)), copy: true },
                { label: 'Unix milliseconds', value: String(parsed.date.getTime()), copy: true },
                { label: 'Relative', value: relativeTime(parsed.date) },
              ]}
            />
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 mt-5 pt-4">
        <OptLabel>Date → timestamp</OptLabel>
        <div className="max-w-sm">
          <OptInput type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        </div>
        {fromDate && (
          <div className="mt-3">
            <ResultTable
              rows={[
                { label: 'Unix seconds', value: String(fromDate.seconds), copy: true },
                { label: 'Unix milliseconds', value: String(fromDate.ms), copy: true },
              ]}
            />
          </div>
        )}
      </div>
    </DevCard>
  );
};

// ---------------- 9. Cron parser ----------------

const CRON_PRESETS: { label: string; expr: string }[] = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Hourly', expr: '0 * * * *' },
  { label: 'Daily midnight', expr: '0 0 * * *' },
  { label: 'Weekdays 9am', expr: '0 9 * * 1-5' },
  { label: 'Weekly Sunday', expr: '0 0 * * 0' },
  { label: 'Monthly 1st', expr: '0 0 1 * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
];

function summarizeField(field: CronField): string {
  if (!field.restricted) return 'Every value (*)';
  const vals = [...field.values].sort((a, b) => a - b);
  const list = vals.slice(0, 14).join(', ');
  return vals.length > 14 ? `${vals.length} values: ${list}, …` : `${vals.length} value${vals.length === 1 ? '' : 's'}: ${list}`;
}

export const CronParser: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [expr, setExpr] = useState('0 9 * * 1-5');

  const result = useMemo(() => {
    if (!expr.trim()) return null;
    try {
      const parsedCron = parseCron(expr);
      return {
        error: '',
        explanation: explainCron(expr),
        fields: [
          { label: 'Minute', field: parsedCron.minute },
          { label: 'Hour', field: parsedCron.hour },
          { label: 'Day of month', field: parsedCron.dom },
          { label: 'Month', field: parsedCron.month },
          { label: 'Day of week', field: parsedCron.dow },
        ],
        next: cronNextRuns(expr, 5),
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid cron expression', explanation: '', fields: [], next: [] };
    }
  }, [expr]);

  return (
    <DevCard
      tool={tool}
      note="Standard 5-field cron (minute hour day-of-month month day-of-week), as used by Linux crontab, GitHub Actions and most schedulers. When both day-of-month and day-of-week are restricted, standard cron runs when EITHER matches. Quartz-style seconds/year fields and @daily aliases are not supported."
    >
      <OptLabel>Cron expression</OptLabel>
      <OptInput value={expr} onChange={(e) => setExpr(e.target.value)} placeholder="0 9 * * 1-5" spellCheck={false} className="font-mono" />
      <div className="flex flex-wrap gap-2 mt-3">
        {CRON_PRESETS.map((p) => (
          <button
            key={p.expr + p.label}
            type="button"
            onClick={() => setExpr(p.expr)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
              expr === p.expr
                ? 'bg-violet-600 text-white border-violet-600'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {result?.error && (
        <div className="mt-4">
          <ErrorBox message={result.error} />
        </div>
      )}

      {result && !result.error && (
        <div className="mt-5 space-y-4">
          <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1">In plain English</div>
            <div className="text-base font-bold text-gray-900 dark:text-white">{result.explanation}</div>
          </div>
          <div>
            <OptLabel>Field breakdown</OptLabel>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {result.fields.map((f, i) => (
                <div
                  key={f.label}
                  className={`flex flex-wrap items-baseline gap-x-3 px-3 py-2 text-sm ${i % 2 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                >
                  <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-gray-500">{f.label}</span>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{f.field.raw}</span>
                  <span className="text-xs text-gray-500">{summarizeField(f.field)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <OptLabel>Next 5 runs (your local time)</OptLabel>
            {result.next.length ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {result.next.map((d, i) => (
                  <div
                    key={d.toISOString()}
                    className={`flex flex-wrap items-baseline gap-x-3 px-3 py-2 text-sm ${i % 2 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <span className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white">{d.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{relativeTime(d)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <WarnBox message="No runs found in the next two years — this schedule may never fire (for example, February 31st)." />
            )}
          </div>
        </div>
      )}
    </DevCard>
  );
};
