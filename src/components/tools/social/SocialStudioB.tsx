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
import { useStrings, COMMON } from '../../../lib/LangContext';
import { SOCIAL_STRINGS } from '../../../lib/strings/social';

// core.ts data-table labels -> SOCIAL_STRINGS keys (core stays data/logic only)
const ASPECT_LABEL_KEYS: Record<string, string> = {
  '9:16': 'aspect9x16',
  '1:1': 'aspect1x1',
  '4:5': 'aspect4x5',
  '16:9': 'aspect16x9',
};
const IDEA_NICHE_KEYS: Record<string, string> = {
  'Fitness coach': 'ideaNicheFitnessCoach',
  'Food / restaurant': 'ideaNicheFoodRestaurant',
  'Fashion brand': 'ideaNicheFashionBrand',
  'Travel creator': 'ideaNicheTravelCreator',
  'Beauty brand': 'ideaNicheBeautyBrand',
  'Tech / SaaS': 'ideaNicheTechSaas',
  'Real estate': 'ideaNicheRealEstate',
  'Small business': 'ideaNicheSmallBusiness',
  Photography: 'nichePhotography',
  'Education / coaching': 'ideaNicheEducationCoaching',
  Pets: 'ideaNichePets',
  'Music artist': 'ideaNicheMusicArtist',
  Gaming: 'nicheGaming',
  'Personal brand': 'ideaNichePersonalBrand',
};
const FORMAT_LABEL_KEYS: Record<string, string> = {
  'Reel / short video': 'formatReel',
  Carousel: 'formatCarousel',
  'Single photo + caption': 'formatSinglePhoto',
  'Story series': 'formatStorySeries',
  'Text post': 'formatTextPost',
  'Live / Q&A': 'formatLiveQa',
};
const EMOJI_CAT_KEYS: Record<string, string> = {
  faces: 'emojiCatFaces',
  hands: 'emojiCatHands',
  hearts: 'emojiCatHearts',
  objects: 'emojiCatObjects',
  food: 'emojiCatFood',
  nature: 'emojiCatNature',
  animals: 'emojiCatAnimals',
  activities: 'emojiCatActivities',
};
const AI_NICHE_KEYS: Record<string, string> = {
  Fitness: 'aiNicheFitness',
  Food: 'aiNicheFood',
  Travel: 'aiNicheTravel',
  Fashion: 'aiNicheFashion',
  Beauty: 'aiNicheBeauty',
  Business: 'aiNicheBusiness',
  Photography: 'nichePhotography',
  Tech: 'aiNicheTech',
  Pets: 'ideaNichePets',
  Music: 'nicheMusic',
  Gaming: 'nicheGaming',
  General: 'aiNicheGeneral',
};
const TONE_KEYS: Record<string, string> = {
  Bold: 'toneBold',
  Curious: 'toneCurious',
  Funny: 'toneFunny',
  'Shocking-but-honest': 'toneShockingHonest',
  Educational: 'toneEducational',
};
const LINK_PRESET_LABEL_KEYS: Record<string, string> = {
  light: 'themeLight',
  dark: 'themeDark',
  pink: 'presetPink',
  forest: 'presetForest',
};

/* ================================================================
   1. Social Video Resizer — FFmpeg crop/pad to a platform aspect
   ================================================================ */
export const SocialVideoResizer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
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
    if (!file) { setError(s('errChooseVideo')); return; }
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
      setError(e instanceof Error ? e.message : s('errResizeFailed'));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <SocialCard tool={tool} note={s('videoResizerNote')}>
      <FileDrop
        accept="video/*"
        label={s('dropVideoLabel')}
        fileName={file?.name ?? null}
        onFile={(f) => { setFile(f); setBlob(null); setError(''); }}
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('aspectRatioLabel')}</OptLabel>
          <OptSelect value={aspectId} onChange={(e) => setAspectId(e.target.value)}>
            {SOCIAL_ASPECTS.map((a) => (
              <option key={a.id} value={a.id}>{ASPECT_LABEL_KEYS[a.id] ? s(ASPECT_LABEL_KEYS[a.id]) : a.label} ({a.width}×{a.height})</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('fitModeLabel')}</OptLabel>
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="social-resize-mode" checked={mode === 'crop'} onChange={() => setMode('crop')} />
              {s('modeCropLabel')}
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="radio" name="social-resize-mode" checked={mode === 'pad'} onChange={() => setMode('pad')} />
              {s('modePadLabel')}
            </label>
          </div>
        </div>
      </div>
      {error && <ErrorBox message={error} />}
      <ProgressBar ratio={progress} label={busy ? s('resizingVideo') : undefined} />
      <div className="flex flex-wrap items-center gap-2">
        <PrimaryBtn onClick={run} disabled={busy || !file}>
          {busy ? s('resizing') : s('resizeVideo')}
        </PrimaryBtn>
        {blob && <BlobDownloadBtn blob={blob} filename={`social-${aspectId.replace(':', 'x')}.mp4`} label={s('downloadMp4')} />}
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
  const s = useStrings(SOCIAL_STRINGS);
  const [niche, setNiche] = useState(IDEA_NICHES[0]);
  const [custom, setCustom] = useState('');
  const [days, setDays] = useState<CalendarDay[]>([]);

  const effectiveNiche = custom.trim() || niche;
  const asText = days.map((d) => `Day ${d.day} — ${d.format} — ${d.idea}`).join('\n');

  return (
    <SocialCard tool={tool} note={s('postIdeasNote')}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('nicheLabel')}</OptLabel>
          <OptSelect value={niche} onChange={(e) => setNiche(e.target.value)}>
            {IDEA_NICHES.map((n) => (
              <option key={n} value={n}>{IDEA_NICHE_KEYS[n] ? s(IDEA_NICHE_KEYS[n]) : n}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('customNicheLabel')}</OptLabel>
          <OptInput value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Wedding photographer in Lahore" />
        </div>
      </div>
      <PrimaryBtn onClick={() => setDays(generateCalendar(effectiveNiche, 30))}>
        {s('generate30Days')}
      </PrimaryBtn>
      {days.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <CopyBtn text={asText} label={s('copyAll30Ideas')} />
            <DownloadBtn content={asText} filename="post-ideas.txt" label={s('downloadTxt')} />
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {days.map((d) => (
              <li key={d.day} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-3 py-2.5 bg-white dark:bg-slate-900">
                <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400 w-14 shrink-0">{s('dayLabel').replace('{day}', String(d.day))}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 rounded-full px-2 py-0.5 shrink-0">
                  {FORMAT_LABEL_KEYS[d.format] ? s(FORMAT_LABEL_KEYS[d.format]) : d.format}
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
  const s = useStrings(SOCIAL_STRINGS);
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
    if (entries.length === 0) { setError(s('errNoEntries')); return; }
    if (pool.length === 0) { setError(s('errAllWon')); return; }
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
    <SocialCard tool={tool} note={s('giveawayNote')}>
      <div>
        <OptLabel>{s('entriesLabel')}</OptLabel>
        <AiTextarea
          dir="ltr"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'sara.k\n@ali_eats: Great giveaway!\nfoodie.fatima\n@ali_eats: Great giveaway!'}
        />
      </div>
      <OptCheck label={s('dedupeLabel')} checked={dedupe} onChange={setDedupe} />
      <div className="grid grid-cols-3 gap-2">
        <Stat label={s('linesPasted')} value={rawLines} />
        <Stat label={s('eligibleEntries')} value={entries.length} />
        <Stat label={s('stillInPool')} value={pool.length} />
      </div>
      {error && <ErrorBox message={error} />}
      {display && (
        <div className="text-center border border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-950/40 rounded-xl px-4 py-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-pink-600 dark:text-pink-400">
            {picking ? s('picking') : s('winnerLabel')}
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white break-words mt-1">{display}</div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <PrimaryBtn onClick={pick} disabled={picking}>
          {picking ? s('picking') : winners.length ? s('pickAgain') : s('pickWinner')}
        </PrimaryBtn>
        {winners.length > 0 && (
          <button
            type="button"
            onClick={() => { setWinners([]); setDisplay(''); }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            {s('resetWinners')}
          </button>
        )}
      </div>
      {winners.length > 0 && (
        <div>
          <OptLabel>{s('winnersSoFar')}</OptLabel>
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
  const s = useStrings(SOCIAL_STRINGS);
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
    <SocialCard tool={tool} note={s('postCardNote')}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('displayNameLabel')}</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>
        <div>
          <OptLabel>{s('handleLabel')}</OptLabel>
          <OptInput dir="ltr" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourhandle" />
        </div>
      </div>
      <div>
        <OptLabel>{s('postTextLabel')}</OptLabel>
        <AiTextarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder={s('writePostTextPlaceholder')} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <OptLabel>{s('themeLabel')}</OptLabel>
          <OptSelect value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
            <option value="light">{s('themeLight')}</option>
            <option value="dark">{s('themeDark')}</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('avatarColorLabel')}</OptLabel>
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
        <OptCheck label={s('showStatsRow')} checked={showStats} onChange={setShowStats} />
      </div>
      {showStats && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <OptLabel>{s('repliesLabel')}</OptLabel>
            <OptInput value={replies} onChange={(e) => setReplies(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('repostsLabel')}</OptLabel>
            <OptInput value={reposts} onChange={(e) => setReposts(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('likesLabel')}</OptLabel>
            <OptInput value={likes} onChange={(e) => setLikes(e.target.value)} />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={1200} height={630} className="w-full h-auto rounded-xl border border-gray-200 dark:border-gray-700" />
      <BlobDownloadBtn blob={blob} filename="post-card.png" label={s('downloadPng')} />
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
  const s = useStrings(SOCIAL_STRINGS);
  const c = useStrings(COMMON);
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
    <SocialCard tool={tool} note={s('linkInBioNote')}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('nameLabel')}</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>
        <div>
          <OptLabel>{s('avatarEmojiLabel')}</OptLabel>
          <OptInput value={avatarEmoji} onChange={(e) => setAvatarEmoji(e.target.value)} maxLength={4} placeholder="👋" />
        </div>
      </div>
      <div>
        <OptLabel>{s('bioLabel')}</OptLabel>
        <AiTextarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} placeholder={s('bioPlaceholder')} />
      </div>
      <div>
        <OptLabel>{s('themeLabel')}</OptLabel>
        <div className="flex flex-wrap gap-2">
          {LINK_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setColors({ bg: p.bg, card: p.card, text: p.text })}
              className="px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer"
              style={{ backgroundColor: p.bg, color: p.text, borderColor: p.card === '#ffffff' ? '#e5e7eb' : p.card }}
            >
              {LINK_PRESET_LABEL_KEYS[p.id] ? s(LINK_PRESET_LABEL_KEYS[p.id]) : p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ColorField label={s('backgroundLabel')} field="bg" />
        <ColorField label={s('linkCardsLabel')} field="card" />
        <ColorField label={s('textLabel')} field="text" />
      </div>
      <div>
        <OptLabel>{s('yourLinksLabel')}</OptLabel>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={l.label}
                onChange={(e) => setLink(i, 'label', e.target.value)}
                placeholder={s('linkLabelPlaceholder')}
                className="w-2/5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              />
              <input
                dir="ltr"
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
                aria-label={s('removeLink')}
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
          {s('addLink')}
        </button>
      </div>
      <div>
        <OptLabel>{s('livePreview')}</OptLabel>
        <iframe title={c('preview')} srcDoc={html} className="w-full h-[480px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />
      </div>
      <DownloadBtn content={html} filename="links.html" mime="text/html" label={s('downloadHtmlPage')} />
      <p className="text-[11px] text-gray-500 leading-relaxed">{s('linkInBioHowTo')}</p>
    </SocialCard>
  );
};

/* ================================================================
   6. Emoji Board — tap to build a copy-ready emoji tray
   ================================================================ */
export const EmojiBoard: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const c = useStrings(COMMON);
  const [active, setActive] = useState(EMOJI_CATEGORIES[0].id);
  const [tray, setTray] = useState('');
  const category = EMOJI_CATEGORIES.find((cat) => cat.id === active) ?? EMOJI_CATEGORIES[0];

  return (
    <SocialCard tool={tool} note={s('emojiBoardNote')}>
      <div className="flex flex-wrap gap-2">
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActive(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-colors ${
              active === cat.id
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-pink-400'
            }`}
          >
            {EMOJI_CAT_KEYS[cat.id] ? s(EMOJI_CAT_KEYS[cat.id]) : cat.label}
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
            title={s('addToTray').replace('{emoji}', emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div>
        <OptLabel>{s('yourTray')}</OptLabel>
        <div className="min-h-[52px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-2xl break-words">
          {tray || <span className="text-sm text-gray-400">{s('trayEmpty')}</span>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyBtn text={tray} label={s('copyTray')} />
        <button
          type="button"
          onClick={() => setTray('')}
          disabled={!tray}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer disabled:opacity-50"
        >
          {c('clear')}
        </button>
        <span className="text-[11px] text-gray-500">{s('emojisSelected').replace('{n}', String(Array.from(tray).length))}</span>
      </div>
    </SocialCard>
  );
};

/* ================================================================
   7. AI Hashtag Generator — Gemini
   ================================================================ */
const HASHTAG_AI_NICHES = ['Fitness', 'Food', 'Travel', 'Fashion', 'Beauty', 'Business', 'Photography', 'Tech', 'Pets', 'Music', 'Gaming', 'General'];

export const AiHashtagGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('General');
  const [platform, setPlatform] = useState('Instagram');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!topic.trim()) { setLocalError(s('errDescribePost')); return; }
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
    <SocialCard tool={tool} note={s('aiHashtagNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>{s('postTopicLabel')}</OptLabel>
        <AiTextarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. Sunrise hike in the mountains with my dog, autumn colours"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('nicheLabel')}</OptLabel>
          <OptSelect value={niche} onChange={(e) => setNiche(e.target.value)}>
            {HASHTAG_AI_NICHES.map((n) => (
              <option key={n} value={n}>{AI_NICHE_KEYS[n] ? s(AI_NICHE_KEYS[n]) : n}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('platformLabel')}</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="X">X (Twitter)</option>
          </OptSelect>
        </div>
      </div>
      {(localError || error) && <ErrorBox message={localError || error} />}
      <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
        {busy ? s('generating') : `${s('generateHashtags')}${keyReady ? '' : s('addApiKeySuffix')}`}
      </PrimaryBtn>
      <AiOutput text={result} filename="hashtags.txt" />
    </SocialCard>
  );
};

/* ================================================================
   8. AI Hook Generator — first-3-seconds video hooks (Gemini)
   ================================================================ */
export const AiHookGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [tone, setTone] = useState('Curious');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!topic.trim()) { setLocalError(s('errEnterTopic')); return; }
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
    <SocialCard tool={tool} note={s('aiHookNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>{s('videoTopicLabel')}</OptLabel>
        <AiTextarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder="e.g. How I edit product photos on my phone in under a minute"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('platformLabel')}</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="TikTok">TikTok</option>
            <option value="Instagram Reels">Instagram Reels</option>
            <option value="YouTube Shorts">YouTube Shorts</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('toneLabel')}</OptLabel>
          <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
            {Object.entries(TONE_KEYS).map(([value, key]) => (
              <option key={value} value={value}>{s(key)}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      {(localError || error) && <ErrorBox message={localError || error} />}
      <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
        {busy ? s('generating') : `${s('generateHooks')}${keyReady ? '' : s('addApiKeySuffix')}`}
      </PrimaryBtn>
      <AiOutput text={result} filename="hooks.txt" />
    </SocialCard>
  );
};
