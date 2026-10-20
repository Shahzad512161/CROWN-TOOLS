import React, { useEffect, useRef, useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  SocialCard,
  PrimaryBtn,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
  CopyBtn,
  Stat,
  ErrorBox,
  FileDrop,
  BlobDownloadBtn,
  DownloadBtn,
} from './SocialShell';
import {
  SOCIAL_ASPECTS,
  buildSocialResizeArgs,
  IDEA_NICHES,
  generateCalendar,
  parseCommentEntries,
  EMOJI_CATEGORIES,
  buildLinkInBioHtml,
  type CalendarDay,
} from '../../../lib/social/core';
import { runFfmpegJob, jobInputName } from '../../../lib/media/ffmpeg';
import { ProgressBar, ENGINE_NOTE } from '../media/MediaShell';
import { useAiText, MissingKeyNotice, AiOutput, AiTextarea } from '../ai/AiShell';
import { canvasToBlobP } from '../../../lib/image/core';

const KEY_SUFFIX = ' — add API key first';

/* ================================================================
   1. Social Video Resizer — FFmpeg crop/pad to a platform aspect
   ================================================================ */
export const SocialVideoResizer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [aspectId, setAspectId] = useState('9:16');
  const [mode, setMode] = useState<'crop' | 'pad'>('crop');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState('');

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const run = async () => {
    if (!file) { setError('Choose a video file first.'); return; }
    setError('');
    setBusy(true);
    setProgress(0);
    setBlob(null);
    try {
      const inputName = jobInputName(file, 'input');
      const [out] = await runFfmpegJob({
        inputs: [{ name: inputName, source: file }],
        args: buildSocialResizeArgs(inputName, 'social.mp4', { aspectId, mode }),
        outputs: [{ name: 'social.mp4', mime: 'video/mp4' }],
        onProgress: (r) => setProgress(r),
      });
      setBlob(out);
      setUrl(URL.createObjectURL(out));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The resize failed.');
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <SocialCard tool={tool} note="Resize any video to a platform-ready aspect ratio — processed locally with FFmpeg.">
      <FileDrop
        accept="video/*"
        label="Drop a video here or click to browse"
        fileName={file?.name ?? null}
        onFile={(f) => { setFile(f); setBlob(null); setError(''); }}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Aspect ratio</OptLabel>
          <OptSelect value={aspectId} onChange={(e) => setAspectId(e.target.value)}>
            {SOCIAL_ASPECTS.map((a) => (
              <option key={a.id} value={a.id}>{a.label} ({a.width}×{a.height})</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Fit mode</OptLabel>
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="social-resize-mode" checked={mode === 'crop'} onChange={() => setMode('crop')} />
              Crop — fill the frame (edges may be cut off)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="social-resize-mode" checked={mode === 'pad'} onChange={() => setMode('pad')} />
              Pad — fit the whole video over a blurred background
            </label>
          </div>
        </div>
      </div>
      {error && <ErrorBox message={error} />}
      <ProgressBar ratio={progress} label={busy ? 'Resizing video…' : undefined} />
      <div className="flex flex-wrap items-center gap-2">
        <PrimaryBtn onClick={run} disabled={busy || !file}>
          {busy ? 'Resizing…' : 'Resize video'}
        </PrimaryBtn>
        {blob && <BlobDownloadBtn blob={blob} filename={`social-${aspectId.replace(':', 'x')}.mp4`} label="Download MP4" />}
      </div>
      {url && (
        <video src={url} controls className="w-full max-h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-black" />
      )}
      <p className="text-[11px] text-gray-500 leading-relaxed">{ENGINE_NOTE}</p>
    </SocialCard>
  );
};

/* ================================================================
   2. Post Ideas Generator — deterministic 30-day calendar
   ================================================================ */
export const PostIdeasGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [niche, setNiche] = useState(IDEA_NICHES[0]);
  const [custom, setCustom] = useState('');
  const [days, setDays] = useState<CalendarDay[]>([]);

  const effectiveNiche = custom.trim() || niche;
  const asText = days.map((d) => `Day ${d.day} — ${d.format} — ${d.idea}`).join('\n');

  return (
    <SocialCard tool={tool} note="A full month of post ideas for your niche — same plan every time for the same niche.">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Niche</OptLabel>
          <OptSelect value={niche} onChange={(e) => setNiche(e.target.value)}>
            {IDEA_NICHES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Or type your own niche (overrides the list)</OptLabel>
          <OptInput value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Wedding photographer in Lahore" />
        </div>
      </div>
      <PrimaryBtn onClick={() => setDays(generateCalendar(effectiveNiche, 30))}>
        Generate 30 days of ideas
      </PrimaryBtn>
      {days.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <CopyBtn text={asText} label="Copy all 30 ideas" />
            <DownloadBtn content={asText} filename="post-ideas.txt" label="Download .txt" />
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {days.map((d) => (
              <li key={d.day} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 bg-white dark:bg-slate-900">
                <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400 w-14 shrink-0">Day {d.day}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 rounded-full px-2 py-0.5 shrink-0">
                  {d.format}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-100">{d.idea}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </SocialCard>
  );
};

/* ================================================================
   3. Giveaway Picker — random winner from comment entries
   ================================================================ */
export const GiveawayPicker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [text, setText] = useState('');
  const [dedupe, setDedupe] = useState(true);
  const [error, setError] = useState('');
  const [display, setDisplay] = useState('');
  const [picking, setPicking] = useState(false);
  const [winners, setWinners] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
  }, []);

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).length;
  const entries = parseCommentEntries(text, dedupe);
  const pool = entries.filter((e) => !winners.some((w) => w.toLowerCase() === e.toLowerCase()));

  const pick = () => {
    setError('');
    if (entries.length === 0) { setError('Paste at least one entry first — one username per line.'); return; }
    if (pool.length === 0) { setError('Every entry has already won. Reset the winners list to start a new round.'); return; }
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    setPicking(true);
    const started = Date.now();
    intervalRef.current = window.setInterval(() => {
      setDisplay(pool[Math.floor(Math.random() * pool.length)]);
      if (Date.now() - started >= 1400) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        const winner = pool[Math.floor(Math.random() * pool.length)];
        setDisplay(winner);
        setWinners((prev) => [...prev, winner]);
        setPicking(false);
      }
    }, 60);
  };

  return (
    <SocialCard tool={tool} note="Paste the commenters from your giveaway post and pick a random winner — fairly, in your browser.">
      <div>
        <OptLabel>Entries — one per line ("username" or "username: comment")</OptLabel>
        <AiTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'sara.k\n@ali_eats: Great giveaway!\nfoodie.fatima\n@ali_eats: Great giveaway!'}
        />
      </div>
      <OptCheck label="Remove duplicate entries (same person counts once)" checked={dedupe} onChange={setDedupe} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Lines pasted" value={rawLines} />
        <Stat label="Eligible entries" value={entries.length} />
        <Stat label="Still in the pool" value={pool.length} />
      </div>
      {error && <ErrorBox message={error} />}
      {display && (
        <div className="text-center border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/40 rounded-xl px-4 py-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">
            {picking ? 'Picking…' : 'Winner'}
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white break-words mt-1">{display}</div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <PrimaryBtn onClick={pick} disabled={picking}>
          {picking ? 'Picking…' : winners.length ? 'Remove winner & pick again' : 'Pick a winner'}
        </PrimaryBtn>
        {winners.length > 0 && (
          <button
            type="button"
            onClick={() => { setWinners([]); setDisplay(''); }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            Reset winners
          </button>
        )}
      </div>
      {winners.length > 0 && (
        <div>
          <OptLabel>Winners so far</OptLabel>
          <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-gray-100 space-y-1">
            {winners.map((w, i) => (
              <li key={i} className="break-words">{w}</li>
            ))}
          </ol>
        </div>
      )}
    </SocialCard>
  );
};

/* ================================================================
   4. Post Card Maker — tweet-style design mockup card (canvas)
   ================================================================ */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) { lines.push(''); continue; }
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export const PostCardMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('Your Name');
  const [handle, setHandle] = useState('yourhandle');
  const [text, setText] = useState('This is my post. Design a clean social media card for thumbnails, presentations and content previews — no account needed.');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [avatarColor, setAvatarColor] = useState('#db2777');
  const [showStats, setShowStats] = useState(true);
  const [replies, setReplies] = useState('24');
  const [reposts, setReposts] = useState('312');
  const [likes, setLikes] = useState('1,204');
  const [blob, setBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 1200;
    const H = 630;
    const dark = theme === 'dark';
    const bg = dark ? '#15202b' : '#ffffff';
    const main = dark ? '#ffffff' : '#0f1419';
    const sub = dark ? '#8899a6' : '#536471';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Avatar: colored circle with initials
    const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
    ctx.beginPath();
    ctx.arc(104, 104, 40, 0, Math.PI * 2);
    ctx.fillStyle = avatarColor;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 104, 106);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Name + handle
    ctx.fillStyle = main;
    ctx.font = '700 30px system-ui, sans-serif';
    ctx.fillText(name.trim() || 'Your Name', 164, 100);
    ctx.fillStyle = sub;
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillText(`@${handle.trim().replace(/^@/, '') || 'handle'}`, 164, 138);

    // Post text: wrap by words, shrink the font until it fits 6 lines
    let size = 34;
    let lines: string[] = [];
    for (const s of [34, 30, 26, 22, 18]) {
      ctx.font = `400 ${s}px system-ui, sans-serif`;
      lines = wrapText(ctx, text, W - 128);
      size = s;
      if (lines.length <= 6) break;
    }
    if (lines.length > 6) {
      lines = lines.slice(0, 6);
      lines[5] = `${lines[5].replace(/…$/, '')}…`;
    }
    ctx.fillStyle = main;
    ctx.font = `400 ${size}px system-ui, sans-serif`;
    let y = 216;
    for (const line of lines) {
      ctx.fillText(line, 64, y);
      y += size * 1.4;
    }

    // Optional stats row
    if (showStats) {
      ctx.strokeStyle = dark ? '#38444d' : '#eff3f4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(64, 516);
      ctx.lineTo(W - 64, 516);
      ctx.stroke();
      const items: [string, string][] = [
        [replies || '0', 'Replies'],
        [reposts || '0', 'Reposts'],
        [likes || '0', 'Likes'],
      ];
      let x = 64;
      for (const [num, label] of items) {
        ctx.fillStyle = main;
        ctx.font = '700 24px system-ui, sans-serif';
        ctx.fillText(num, x, 566);
        const numW = ctx.measureText(num).width;
        ctx.fillStyle = sub;
        ctx.font = '400 24px system-ui, sans-serif';
        const labelText = ` ${label}`;
        ctx.fillText(labelText, x + numW, 566);
        x += numW + ctx.measureText(labelText).width + 56;
      }
    }

    let cancelled = false;
    canvasToBlobP(canvas).then((b) => { if (!cancelled) setBlob(b); }).catch(() => { if (!cancelled) setBlob(null); });
    return () => { cancelled = true; };
  }, [name, handle, text, theme, avatarColor, showStats, replies, reposts, likes]);

  return (
    <SocialCard tool={tool} note="Design mockup — create cards for thumbnails, presentations and content previews.">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Display name</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>
        <div>
          <OptLabel>Handle (without @)</OptLabel>
          <OptInput value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourhandle" />
        </div>
      </div>
      <div>
        <OptLabel>Post text</OptLabel>
        <AiTextarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write the post text…" />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <OptLabel>Theme</OptLabel>
          <OptSelect value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Avatar color</OptLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={avatarColor}
              onChange={(e) => setAvatarColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{avatarColor}</span>
          </div>
        </div>
        <OptCheck label="Show stats row" checked={showStats} onChange={setShowStats} />
      </div>
      {showStats && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <OptLabel>Replies</OptLabel>
            <OptInput value={replies} onChange={(e) => setReplies(e.target.value)} />
          </div>
          <div>
            <OptLabel>Reposts</OptLabel>
            <OptInput value={reposts} onChange={(e) => setReposts(e.target.value)} />
          </div>
          <div>
            <OptLabel>Likes</OptLabel>
            <OptInput value={likes} onChange={(e) => setLikes(e.target.value)} />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={1200} height={630} className="w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700" />
      <BlobDownloadBtn blob={blob} filename="post-card.png" label="Download PNG" />
    </SocialCard>
  );
};

/* ================================================================
   5. Link in Bio Builder — standalone HTML page generator
   ================================================================ */
const LINK_PRESETS: { id: string; label: string; bg: string; card: string; text: string }[] = [
  { id: 'light', label: 'Light', bg: '#f8fafc', card: '#ffffff', text: '#0f172a' },
  { id: 'dark', label: 'Dark', bg: '#0f172a', card: '#1e293b', text: '#f1f5f9' },
  { id: 'pink', label: 'Pink', bg: '#fdf2f8', card: '#ffffff', text: '#831843' },
  { id: 'forest', label: 'Forest', bg: '#f0fdf4', card: '#ffffff', text: '#14532d' },
];

export const LinkInBioBuilder: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [name, setName] = useState('Your Name');
  const [bio, setBio] = useState('Creator · Sharing what I make, every week.');
  const [avatarEmoji, setAvatarEmoji] = useState('👋');
  const [colors, setColors] = useState({ bg: '#fdf2f8', card: '#ffffff', text: '#831843' });
  const [links, setLinks] = useState<{ label: string; url: string }[]>([
    { label: 'My website', url: 'https://example.com' },
    { label: 'YouTube channel', url: 'https://youtube.com' },
    { label: '', url: '' },
  ]);

  const html = buildLinkInBioHtml({
    name: name.trim() || 'Your Name',
    bio,
    avatarEmoji,
    bg: colors.bg,
    card: colors.card,
    text: colors.text,
    links,
  });

  const setLink = (i: number, field: 'label' | 'url', value: string) =>
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  const ColorField: React.FC<{ label: string; field: 'bg' | 'card' | 'text' }> = ({ label, field }) => (
    <div>
      <OptLabel>{label}</OptLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colors[field]}
          onChange={(e) => setColors((prev) => ({ ...prev, [field]: e.target.value }))}
          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer"
        />
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{colors[field]}</span>
      </div>
    </div>
  );

  return (
    <SocialCard tool={tool} note="Build your own link-in-bio page and download it as a single HTML file — no monthly fee, no platform lock-in.">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Name</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>
        <div>
          <OptLabel>Avatar emoji</OptLabel>
          <OptInput value={avatarEmoji} onChange={(e) => setAvatarEmoji(e.target.value)} maxLength={4} placeholder="👋" />
        </div>
      </div>
      <div>
        <OptLabel>Bio</OptLabel>
        <AiTextarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder="A line or two about you…" />
      </div>
      <div>
        <OptLabel>Theme</OptLabel>
        <div className="flex flex-wrap gap-2">
          {LINK_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setColors({ bg: p.bg, card: p.card, text: p.text })}
              className="px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer"
              style={{ backgroundColor: p.bg, color: p.text, borderColor: p.card === '#ffffff' ? '#e5e7eb' : p.card }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ColorField label="Background" field="bg" />
        <ColorField label="Link cards" field="card" />
        <ColorField label="Text" field="text" />
      </div>
      <div>
        <OptLabel>Your links</OptLabel>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={l.label}
                onChange={(e) => setLink(i, 'label', e.target.value)}
                placeholder="Label (e.g. My shop)"
                className="w-2/5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              />
              <input
                value={l.url}
                onChange={(e) => setLink(i, 'url', e.target.value)}
                placeholder="https://…"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              />
              <button
                type="button"
                disabled={links.length <= 1}
                onClick={() => setLinks((prev) => prev.filter((_, idx) => idx !== i))}
                className="px-3 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Remove link"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinks((prev) => [...prev, { label: '', url: '' }])}
          className="mt-2 px-3 py-2 rounded-xl text-xs font-bold bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 cursor-pointer"
        >
          + Add a link
        </button>
      </div>
      <div>
        <OptLabel>Live preview</OptLabel>
        <iframe title="preview" srcDoc={html} className="w-full h-[480px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />
      </div>
      <DownloadBtn content={html} filename="links.html" mime="text/html" label="Download HTML page" />
      <p className="text-[11px] text-gray-500 leading-relaxed">
        How to use it: upload the downloaded file to any static host — Netlify Drop, GitHub Pages, or your own hosting —
        then put its URL in your Instagram/TikTok/X bio. The page is a single self-contained file with no scripts and no tracking.
      </p>
    </SocialCard>
  );
};

/* ================================================================
   6. Emoji Board — tap to build a copy-ready emoji tray
   ================================================================ */
export const EmojiBoard: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [active, setActive] = useState(EMOJI_CATEGORIES[0].id);
  const [tray, setTray] = useState('');
  const category = EMOJI_CATEGORIES.find((c) => c.id === active) ?? EMOJI_CATEGORIES[0];

  return (
    <SocialCard tool={tool} note="Tap emojis to build a set for your caption, then copy the whole tray at once.">
      <div className="flex flex-wrap gap-2">
        {EMOJI_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
              active === c.id
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-pink-400'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
        {category.emojis.split(' ').filter(Boolean).map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            onClick={() => setTray((prev) => prev + emoji)}
            className="text-2xl py-1.5 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/40 cursor-pointer"
            title={`Add ${emoji} to the tray`}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div>
        <OptLabel>Your tray</OptLabel>
        <div className="min-h-[52px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-2xl break-words">
          {tray || <span className="text-sm text-gray-400">Tap emojis above to add them here…</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyBtn text={tray} label="Copy tray" />
        <button
          type="button"
          onClick={() => setTray('')}
          disabled={!tray}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50"
        >
          Clear
        </button>
        <span className="text-[11px] text-gray-500">{Array.from(tray).length} emojis selected</span>
      </div>
    </SocialCard>
  );
};

/* ================================================================
   7. AI Hashtag Generator — Gemini
   ================================================================ */
const HASHTAG_AI_NICHES = ['Fitness', 'Food', 'Travel', 'Fashion', 'Beauty', 'Business', 'Photography', 'Tech', 'Pets', 'Music', 'Gaming', 'General'];

export const AiHashtagGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('General');
  const [platform, setPlatform] = useState('Instagram');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!topic.trim()) { setLocalError('Describe your post or photo first.'); return; }
    setLocalError('');
    await run(
      `You are an expert social media marketer. Generate hashtags for a ${platform} post.\n\n` +
      `Niche: ${niche}.\n` +
      `Post topic / photo description: ${topic.trim()}\n\n` +
      `Rules:\n` +
      `- Return exactly 30 hashtags, lowercase, each starting with #.\n` +
      `- Output exactly 3 lines: line 1 = 10 high-reach hashtags, line 2 = 10 medium-reach hashtags, line 3 = 10 niche-specific hashtags.\n` +
      `- Hashtags on each line separated by single spaces.\n` +
      `- No explanations, no headings, no numbering — only the 3 lines of hashtags.`,
    );
  };

  return (
    <SocialCard tool={tool} note="AI-picked hashtags grouped by reach: broad, medium and niche-specific.">
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>Post topic or photo description</OptLabel>
        <AiTextarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Sunrise hike in the mountains with my dog, autumn colours"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Niche</OptLabel>
          <OptSelect value={niche} onChange={(e) => setNiche(e.target.value)}>
            {HASHTAG_AI_NICHES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Platform</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="X">X (Twitter)</option>
          </OptSelect>
        </div>
      </div>
      {(localError || error) && <ErrorBox message={localError || error} />}
      <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
        {busy ? 'Generating…' : `Generate hashtags${keyReady ? '' : KEY_SUFFIX}`}
      </PrimaryBtn>
      <AiOutput text={result} filename="hashtags.txt" />
    </SocialCard>
  );
};

/* ================================================================
   8. AI Hook Generator — first-3-seconds video hooks (Gemini)
   ================================================================ */
export const AiHookGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [tone, setTone] = useState('Curious');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!topic.trim()) { setLocalError('Enter your video topic first.'); return; }
    setLocalError('');
    await run(
      `You are an expert short-form video creator. Write opening hooks for a ${platform} video.\n\n` +
      `Video topic: ${topic.trim()}\n` +
      `Tone: ${tone}.\n\n` +
      `Rules:\n` +
      `- Return exactly 10 hooks, numbered 1 to 10, one per line.\n` +
      `- Each hook is under 12 words — it must work as the first 3 seconds spoken on camera.\n` +
      `- Be specific to the topic; vary the angles (mistake, secret, story, question, result, myth).\n` +
      `- No clickbait lies: never promise something the video cannot deliver, no fake numbers or invented claims.\n` +
      `- Plain text only: no markdown, no explanations before or after the list.`,
    );
  };

  return (
    <SocialCard tool={tool} note="Ten scroll-stopping opening lines for your next short video — honest hooks, no clickbait lies.">
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>Video topic</OptLabel>
        <AiTextarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. How I edit product photos on my phone in under a minute"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Platform</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="TikTok">TikTok</option>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="YouTube Shorts">YouTube Shorts</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Tone</OptLabel>
          <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="Bold">Bold</option>
            <option value="Curious">Curious</option>
            <option value="Funny">Funny</option>
            <option value="Shocking-but-honest">Shocking-but-honest</option>
            <option value="Educational">Educational</option>
          </OptSelect>
        </div>
      </div>
      {(localError || error) && <ErrorBox message={localError || error} />}
      <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
        {busy ? 'Generating…' : `Generate hooks${keyReady ? '' : KEY_SUFFIX}`}
      </PrimaryBtn>
      <AiOutput text={result} filename="hooks.txt" />
    </SocialCard>
  );
};
