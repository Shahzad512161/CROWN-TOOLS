import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  FileDrop,
  BlobDownloadBtn,
} from './SocialShell';
import {
  SOCIAL_IMAGE_SIZES,
  POST_LIMITS,
  countChars,
  xWeightedLength,
  FANCY_STYLES,
  convertFancy,
  parseHashtags,
  analyzeHashtags,
  HASHTAG_NICHES,
  generateHashtags,
  engagementRate,
  generateUsernames,
} from '../../../lib/social/core';
import { fileToImage, canvasToBlobP, centeredCropRect } from '../../../lib/image/core';
import { useStrings, COMMON } from '../../../lib/LangContext';
import { SOCIAL_STRINGS } from '../../../lib/strings/social';

// core.ts data-table labels -> SOCIAL_STRINGS keys (core stays data/logic only)
const SIZE_NAME_KEYS: Record<string, string> = {
  'Square post': 'sizeSquarePost',
  'Portrait post': 'sizePortraitPost',
  'Story / Reel cover': 'sizeStoryReelCover',
  'Profile picture': 'sizeProfilePicture',
  'Post image': 'sizePostImage',
  Header: 'sizeHeader',
  'Cover photo': 'sizeCoverPhoto',
  Thumbnail: 'sizeThumbnail',
  'Channel banner': 'sizeChannelBanner',
  'Personal cover': 'sizePersonalCover',
  'Video / cover': 'sizeVideoCover',
  Pin: 'sizePin',
  Status: 'sizeStatus',
};
const FANCY_NAME_KEYS: Record<string, string> = {
  bold: 'fancyBold',
  italic: 'fancyItalic',
  boldItalic: 'fancyBoldItalic',
  script: 'fancyScript',
  boldScript: 'fancyBoldScript',
  fraktur: 'fancyFraktur',
  doubleStruck: 'fancyDoubleStruck',
  monospace: 'fancyMonospace',
  sansBold: 'fancySansBold',
  circled: 'fancyCircled',
  smallCaps: 'fancySmallCaps',
  fullwidth: 'fancyFullwidth',
  upsideDown: 'fancyUpsideDown',
  strikethrough: 'fancyStrikethrough',
  underline: 'fancyUnderline',
};
const LIMIT_NOTE_KEYS: Record<string, string> = {
  x: 'limitNoteX',
  instagram: 'limitNoteInstagram',
  threads: 'limitNoteThreads',
  tiktok: 'limitNoteTiktok',
  linkedin: 'limitNoteLinkedin',
  facebook: 'limitNoteFacebook',
  'youtube-title': 'limitNoteYoutubeTitle',
  'youtube-desc': 'limitNoteYoutubeDesc',
  pinterest: 'limitNotePinterest',
};
const PLATFORM_NAME_KEYS: Record<string, string> = {
  'youtube-title': 'platformYoutubeTitle',
  'youtube-desc': 'platformYoutubeDesc',
};
const NICHE_LABEL_KEYS: Record<string, string> = {
  general: 'nicheGeneral',
  fitness: 'nicheFitness',
  food: 'nicheFood',
  travel: 'nicheTravel',
  fashion: 'nicheFashion',
  business: 'nicheBusiness',
  photography: 'nichePhotography',
  tech: 'nicheTech',
  pets: 'nichePets',
  music: 'nicheMusic',
  gaming: 'nicheGaming',
  beauty: 'nicheBeauty',
};

const TEXTAREA_CLS =
  'w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-slate-100';
const SMALL_TEXT = 'text-xs text-slate-500 dark:text-slate-400';

// ---------------------------------------------------------------------------
// 1. Social Image Resizer
// ---------------------------------------------------------------------------

type ResizeMode = 'cover' | 'fit' | 'blur';

export const SocialImageResizer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [presetIdx, setPresetIdx] = useState(0);
  const [mode, setMode] = useState<ResizeMode>('cover');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const preset = SOCIAL_IMAGE_SIZES[presetIdx] ?? SOCIAL_IMAGE_SIZES[0];

  const onFile = async (file: File) => {
    setError('');
    try {
      const image = await fileToImage(file);
      setImg(image);
      setFileName(file.name);
    } catch {
      setError(s('errNotImage'));
    }
  };

  useEffect(() => {
    if (!img) {
      setBlob(null);
      setPreviewUrl(null);
      return;
    }
    const { width: W, height: H } = preset;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    if (mode === 'cover') {
      const r = centeredCropRect(iw, ih, W / H);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, W, H);
    } else if (mode === 'fit') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
      const scale = Math.min(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      // Blurred backdrop: cover-draw the image, blur it, then fit the sharp image on top.
      const r = centeredCropRect(iw, ih, W / H);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, W, H);
      ctx.filter = 'blur(30px)';
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, W, H);
      ctx.filter = 'none';
      const scale = Math.min(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    let cancelled = false;
    let url: string | null = null;
    canvasToBlobP(canvas, format === 'png' ? 'image/png' : 'image/jpeg', 0.92)
      .then((b) => {
        if (cancelled || !b) return;
        url = URL.createObjectURL(b);
        setBlob(b);
        setPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(s('errRenderFailed'));
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [img, preset, mode, bgColor, format]);

  return (
    <SocialCard tool={tool} note={s('resizerNote')}>
      <FileDrop onFile={onFile} accept="image/*" fileName={fileName} />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>{s('platformSizePreset')}</OptLabel>
          <OptSelect value={presetIdx} onChange={(e) => setPresetIdx(Number(e.target.value))}>
            {SOCIAL_IMAGE_SIZES.map((sz, i) => (
              <option key={`${sz.platform}-${sz.name}`} value={i}>
                {sz.platform}   {SIZE_NAME_KEYS[sz.name] ? s(SIZE_NAME_KEYS[sz.name]) : sz.name} ({sz.width}×{sz.height})
              </option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('outputFormat')}</OptLabel>
          <OptSelect value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}>
            <option value="png">PNG</option>
            <option value="jpeg">JPG</option>
          </OptSelect>
        </div>
      </div>

      <div>
        <OptLabel>{s('fillFrameLabel')}</OptLabel>
        <div className="flex flex-wrap gap-4 mt-1">
          {(
            [
              ['cover', 'modeCover'],
              ['fit', 'modeFit'],
              ['blur', 'modeBlur'],
            ] as [ResizeMode, string][]
          ).map(([value, labelKey]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
              <input type="radio" name="resize-mode" checked={mode === value} onChange={() => setMode(value)} className="accent-pink-600" />
              {s(labelKey)}
            </label>
          ))}
        </div>
      </div>

      {mode === 'fit' && (
        <div className="flex items-center gap-3">
          <OptLabel>{s('backgroundColor')}</OptLabel>
          <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
          <span className="text-sm text-slate-600 dark:text-slate-300">{bgColor}</span>
        </div>
      )}

      {img && previewUrl && (
        <div className="space-y-3">
          <img src={previewUrl} alt={s('resizedPreviewAlt')} className="max-w-full max-h-96 rounded-lg border border-slate-200 dark:border-slate-700 mx-auto" />
          <div className="flex flex-wrap items-center gap-3">
            <Stat label={s('outputSize')} value={`${preset.width}×${preset.height}`} />
            <BlobDownloadBtn blob={blob} filename={`resized-${preset.width}x${preset.height}.${format === 'png' ? 'png' : 'jpg'}`} label={s('downloadResizedImage')} />
          </div>
        </div>
      )}
      {!img && <p className={SMALL_TEXT}>{s('resizerEmpty')}</p>}
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 2. YouTube Thumbnail Maker
// ---------------------------------------------------------------------------

export const YoutubeThumbnailMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgColor, setBgColor] = useState('#0f172a');
  const [title, setTitle] = useState('I Tried It\nFor 30 Days');
  const [subtitle, setSubtitle] = useState('The results shocked me');
  const [fontSize, setFontSize] = useState(96);
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentOn, setAccentOn] = useState(true);
  const [accentColor, setAccentColor] = useState('#db2777');
  const [outline, setOutline] = useState(true);
  const [position, setPosition] = useState<'left' | 'center'>('left');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState('');

  const onBgFile = async (file: File) => {
    setError('');
    try {
      setBgImg(await fileToImage(file));
    } catch {
      setError(s('errNotImage'));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 1280;
    const H = 720;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    if (bgImg) {
      const r = centeredCropRect(bgImg.naturalWidth, bgImg.naturalHeight, W / H);
      ctx.drawImage(bgImg, r.sx, r.sy, r.sw, r.sh, 0, 0, W, H);
    }

    // Text block
    const lines = title.split('\n');
    const lineHeight = fontSize * 1.12;
    const subSize = Math.round(fontSize * 0.42);
    const blockHeight = lines.length * lineHeight + (subtitle.trim() ? subSize + 26 : 0);
    let y = (H - blockHeight) / 2;
    const x = position === 'left' ? 64 : W / 2;
    ctx.textAlign = position === 'left' ? 'left' : 'center';
    ctx.textBaseline = 'top';

    ctx.font = `${fontSize}px 'Arial Black', Arial, sans-serif`;
    for (const line of lines) {
      if (outline) {
        ctx.lineWidth = Math.max(2, fontSize / 10);
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'round';
        ctx.strokeText(line, x, y);
      }
      ctx.fillStyle = textColor;
      ctx.fillText(line, x, y);
      y += lineHeight;
    }

    if (subtitle.trim()) {
      y += 10;
      ctx.font = `bold ${subSize}px Arial, sans-serif`;
      if (outline) {
        ctx.lineWidth = Math.max(2, subSize / 8);
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'round';
        ctx.strokeText(subtitle, x, y);
      }
      ctx.fillStyle = textColor;
      ctx.fillText(subtitle, x, y);
    }

    // Accent bar
    if (accentOn) {
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, H - 14, W, 14);
    }

    let cancelled = false;
    canvasToBlobP(canvas, 'image/png')
      .then((b) => {
        if (!cancelled) setBlob(b);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [bgImg, bgColor, title, subtitle, fontSize, textColor, accentOn, accentColor, outline, position]);

  return (
    <SocialCard tool={tool} note={s('thumbnailNote')}>
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-3">
          <canvas ref={canvasRef} width={1280} height={720} className="w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700" />
          <BlobDownloadBtn blob={blob} filename="youtube-thumbnail.png" label={s('downloadThumbnail')} />
        </div>
        <div className="space-y-4">
          <div>
            <OptLabel>{s('bgImageOptional')}</OptLabel>
            <FileDrop onFile={onBgFile} accept="image/*" label={s('dropBgImage')} />
            {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
            {bgImg && (
              <button type="button" onClick={() => setBgImg(null)} className="text-xs font-semibold text-pink-600 hover:text-pink-700 mt-1">
                {s('removeBgImage')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <OptLabel>{s('backgroundColor')}</OptLabel>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{bgColor}</span>
          </div>
          <div>
            <OptLabel>{s('thumbnailTitleLabel')}</OptLabel>
            <textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} className={TEXTAREA_CLS} />
          </div>
          <div>
            <OptLabel>{s('subtitleOptional')}</OptLabel>
            <OptInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={s('subtitlePlaceholder')} />
          </div>
          <div>
            <OptLabel>{s('titleSizeLabel').replace('{size}', String(fontSize))}</OptLabel>
            <input type="range" min={48} max={140} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-pink-600" />
          </div>
          <div className="flex items-center gap-3">
            <OptLabel>{s('textColor')}</OptLabel>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{textColor}</span>
          </div>
          <div>
            <OptLabel>{s('textPosition')}</OptLabel>
            <OptSelect value={position} onChange={(e) => setPosition(e.target.value as 'left' | 'center')}>
              <option value="left">{s('positionLeft')}</option>
              <option value="center">{s('positionCenter')}</option>
            </OptSelect>
          </div>
          <OptCheck label={s('outlineLabel')} checked={outline} onChange={setOutline} />
          <OptCheck label={s('accentBarLabel')} checked={accentOn} onChange={setAccentOn} />
          {accentOn && (
            <div className="flex items-center gap-3">
              <OptLabel>{s('accentColor')}</OptLabel>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{accentColor}</span>
            </div>
          )}
        </div>
      </div>
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Fancy Text Generator
// ---------------------------------------------------------------------------

export const FancyTextGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const c = useStrings(COMMON);
  const [text, setText] = useState('Your name');
  const hasText = text.trim().length > 0;

  return (
    <SocialCard tool={tool} note={s('fancyNote')}>
      <div>
        <OptLabel>{c('yourText')}</OptLabel>
        <OptInput value={text} onChange={(e) => setText(e.target.value)} placeholder={s('typeSomething')} maxLength={80} />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {FANCY_STYLES.map((style) => {
          const converted = hasText ? convertFancy(text, style.id) : '';
          return (
            <div key={style.id} className="flex flex-wrap items-center gap-1 sm:gap-3 py-2.5">
              <span className="w-full sm:w-32 sm:shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">{FANCY_NAME_KEYS[style.id] ? s(FANCY_NAME_KEYS[style.id]) : style.name}</span>
              <span className="flex-1 min-w-0 break-words text-base text-slate-800 dark:text-slate-100">
                {hasText ? converted : <span className="text-slate-400">{s('typeSomethingAbove')}</span>}
              </span>
              <CopyBtn text={converted} />
            </div>
          );
        })}
      </div>
      <p className={SMALL_TEXT}>{s('fancyFootnote')}</p>
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Social Post Composer
// ---------------------------------------------------------------------------

export const SocialPostComposer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [text, setText] = useState('');
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);
  const hashtagCount = useMemo(() => parseHashtags(text).length, [text]);

  return (
    <SocialCard tool={tool} note={s('composerNote')}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={s('writePostPlaceholder')}
        className={TEXTAREA_CLS}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Stat label={s('wordsLabel')} value={words} />
        <Stat label={s('charactersLabel')} value={countChars(text)} />
        <CopyBtn text={text} label={s('copyPost')} />
      </div>
      <div className="space-y-3">
        {POST_LIMITS.map((entry) => {
          const used = entry.weighted ? xWeightedLength(text) : countChars(text);
          const over = used > entry.charLimit;
          const pct = Math.min(100, entry.charLimit > 0 ? (used / entry.charLimit) * 100 : 0);
          const showNote = over || entry.id === 'x';
          return (
            <div key={entry.id} className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{PLATFORM_NAME_KEYS[entry.id] ? s(PLATFORM_NAME_KEYS[entry.id]) : entry.platform}</span>
                <span className={`text-xs font-semibold ${over ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {used.toLocaleString()} / {entry.charLimit.toLocaleString()}
                  {over
                    ? `   ${s('charsOver').replace('{n}', String(used - entry.charLimit))}`
                    : ` · ${s('charsLeft').replace('{n}', String(entry.charLimit - used))}`}
                </span>
              </div>
              <div className="h-1.5 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-pink-500'}`} style={{ width: `${pct}%` }} />
              </div>
              {entry.id === 'instagram' && (
                <p className={`text-xs mt-1.5 ${hashtagCount > (entry.hashtagLimit ?? 30) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {s('hashtagsCount').replace('{used}', String(hashtagCount)).replace('{limit}', String(entry.hashtagLimit ?? 30))}
                </p>
              )}
              {showNote && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{LIMIT_NOTE_KEYS[entry.id] ? s(LIMIT_NOTE_KEYS[entry.id]) : entry.note}</p>}
            </div>
          );
        })}
      </div>
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Hashtag Generator
// ---------------------------------------------------------------------------

export const HashtagGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [keywordsText, setKeywordsText] = useState('');
  const [nicheId, setNicheId] = useState(HASHTAG_NICHES[0]?.id ?? '');
  const [count, setCount] = useState(30);
  const [tags, setTags] = useState<string[]>([]);

  const generate = () => {
    const keywords = keywordsText.split(/[\n,]+/).map((k) => k.trim()).filter(Boolean);
    setTags(generateHashtags(keywords, nicheId, count));
  };

  return (
    <SocialCard tool={tool} note={s('hashtagGenNote')}>
      <div>
        <OptLabel>{s('keywordsLabel')}</OptLabel>
        <textarea
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          rows={3}
          placeholder={'home workout\nno equipment\nbeginner fitness'}
          className={TEXTAREA_CLS}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <OptLabel>{s('nicheLabel')}</OptLabel>
          <OptSelect value={nicheId} onChange={(e) => setNicheId(e.target.value)}>
            {HASHTAG_NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {NICHE_LABEL_KEYS[n.id] ? s(NICHE_LABEL_KEYS[n.id]) : n.label}
              </option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('howManyHashtags')}</OptLabel>
          <OptSelect value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </OptSelect>
        </div>
      </div>
      <PrimaryBtn onClick={generate}>{s('generateHashtags')}</PrimaryBtn>

      {tags.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="px-2 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-semibold">
                {tag}
              </span>
            ))}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-sm break-all text-slate-800 dark:text-slate-100">{tags.join(' ')}</p>
            <div className="mt-2">
              <CopyBtn text={tags.join(' ')} label={s('copyAllHashtags')} />
            </div>
          </div>
          <Stat label={s('hashtagsGenerated')} value={tags.length} />
        </div>
      )}
      <p className={SMALL_TEXT}>{s('hashtagGenFootnote')}</p>
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 6. Hashtag Counter
// ---------------------------------------------------------------------------

export const HashtagCounter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [text, setText] = useState('');
  const analysis = useMemo(() => analyzeHashtags(text), [text]);

  return (
    <SocialCard tool={tool} note={s('hashtagCounterNote')}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={s('pasteCaptionPlaceholder')}
        className={TEXTAREA_CLS}
      />
      <div className="grid grid-cols-3 gap-3">
        <Stat label={s('totalHashtags')} value={analysis.total} />
        <Stat label={s('uniqueLabel')} value={analysis.unique.length} />
        <Stat label={s('duplicatedTags')} value={analysis.duplicates.length} />
      </div>
      {analysis.duplicates.length > 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{s('duplicatesFound')}</span> {analysis.duplicates.map((d) => `#${d}`).join(' ')}
        </p>
      )}
      {analysis.overInstagramLimit && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-200">
          {s('overLimitWarning').replace('{n}', String(analysis.unique.length))}
        </div>
      )}
      {text.trim() && (
        <div className="space-y-3">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{s('cleanedHashtagsLabel')}</p>
            <p className="text-sm break-all text-slate-800 dark:text-slate-100">{analysis.cleaned || ' '}</p>
            <div className="mt-2">
              <CopyBtn text={analysis.cleaned} label={s('copyCleanedHashtags')} />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{s('textWithoutHashtags')}</p>
            <p className="text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-100">{analysis.textWithoutHashtags || ' '}</p>
            <div className="mt-2">
              <CopyBtn text={analysis.textWithoutHashtags} label={s('copyText')} />
            </div>
          </div>
        </div>
      )}
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 7. Engagement Rate Calculator
// ---------------------------------------------------------------------------

export const EngagementCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [followers, setFollowers] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState('');
  const [shares, setShares] = useState('');
  const [saves, setSaves] = useState('');

  const num = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const followerCount = num(followers);
  const result =
    followerCount > 0
      ? engagementRate({
          followers: followerCount,
          avgLikes: num(likes),
          avgComments: num(comments),
          avgShares: num(shares),
          avgSaves: num(saves),
        })
      : null;

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <div>
      <OptLabel>{label}</OptLabel>
      <OptInput type="number" min={0} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <SocialCard tool={tool} note={s('engagementNote')}>
      <div className="grid sm:grid-cols-2 gap-4">
        {field(s('followersLabel'), followers, setFollowers, 'e.g. 25000')}
        {field(s('avgLikesLabel'), likes, setLikes, 'e.g. 1200')}
        {field(s('avgCommentsLabel'), comments, setComments, 'e.g. 85')}
        {field(s('avgSharesLabel'), shares, setShares, 'e.g. 40')}
        {field(s('avgSavesLabel'), saves, setSaves, 'e.g. 150')}
      </div>
      {result ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{result.rate.toFixed(2)}%</span>
            <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-bold">{s(`engLabel${result.label}`)}</span>
            <Stat label={s('avgInteractions')} value={result.totalInteractions.toLocaleString()} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{s(`engAdvice${result.label}`)}</p>
        </div>
      ) : (
        <p className={SMALL_TEXT}>{s('engagementHint')}</p>
      )}
      <p className={SMALL_TEXT}>{s('engagementFootnote')}</p>
    </SocialCard>
  );
};

// ---------------------------------------------------------------------------
// 8. Username Generator
// ---------------------------------------------------------------------------

export const UsernameGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(SOCIAL_STRINGS);
  const [keyword, setKeyword] = useState('');
  const [names, setNames] = useState<string[]>([]);

  const generate = () => {
    if (!keyword.trim()) return;
    setNames(generateUsernames(keyword.trim(), 24));
  };

  return (
    <SocialCard tool={tool} note={s('usernameNote')}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-52">
          <OptLabel>{s('keywordLabel')}</OptLabel>
          <OptInput
            dir="ltr"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') generate();
            }}
            placeholder="e.g. pixelcraft"
          />
        </div>
        <PrimaryBtn onClick={generate} disabled={!keyword.trim()}>
          {s('generateUsernames')}
        </PrimaryBtn>
      </div>
      {names.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {names.map((name) => (
            <div key={name} className="flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">{name}</span>
              <CopyBtn text={name} />
            </div>
          ))}
        </div>
      )}
      <p className={SMALL_TEXT}>{s('usernameFootnote')}</p>
    </SocialCard>
  );
};
