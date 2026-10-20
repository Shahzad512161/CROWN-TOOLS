/**
 * Pure helpers for the Social Media Tools suite. Everything here is
 * deterministic and unit-testable — no DOM, no network.
 */

// ---------------------------------------------------------------------------
// Platform tables
// ---------------------------------------------------------------------------

export interface PostLimit {
  id: string;
  platform: string;
  /** Character limit for a post/caption (X uses the weighted count). */
  charLimit: number;
  weighted?: boolean;
  hashtagLimit?: number;
  note: string;
}

export const POST_LIMITS: PostLimit[] = [
  { id: 'x', platform: 'X (Twitter)', charLimit: 280, weighted: true, note: 'Free accounts; links count as 23 characters, most emoji and CJK characters count double.' },
  { id: 'instagram', platform: 'Instagram', charLimit: 2200, hashtagLimit: 30, note: 'Captions up to 2,200 characters and at most 30 hashtags.' },
  { id: 'threads', platform: 'Threads', charLimit: 500, note: 'Posts up to 500 characters.' },
  { id: 'tiktok', platform: 'TikTok', charLimit: 2200, note: 'Video descriptions up to 2,200 characters.' },
  { id: 'linkedin', platform: 'LinkedIn', charLimit: 3000, note: 'Posts up to 3,000 characters; only the first ~210 show before "see more".' },
  { id: 'facebook', platform: 'Facebook', charLimit: 63206, note: 'Posts can be very long, but engagement drops sharply after a few hundred characters.' },
  { id: 'youtube-title', platform: 'YouTube title', charLimit: 100, note: 'Titles up to 100 characters; keep the hook in the first 50.' },
  { id: 'youtube-desc', platform: 'YouTube description', charLimit: 5000, note: 'Descriptions up to 5,000 characters.' },
  { id: 'pinterest', platform: 'Pinterest', charLimit: 500, note: 'Pin descriptions up to 500 characters; titles up to 100.' },
];

export interface SocialImageSize {
  platform: string;
  name: string;
  width: number;
  height: number;
}

export const SOCIAL_IMAGE_SIZES: SocialImageSize[] = [
  { platform: 'Instagram', name: 'Square post', width: 1080, height: 1080 },
  { platform: 'Instagram', name: 'Portrait post', width: 1080, height: 1350 },
  { platform: 'Instagram', name: 'Story / Reel cover', width: 1080, height: 1920 },
  { platform: 'Instagram', name: 'Profile picture', width: 320, height: 320 },
  { platform: 'X (Twitter)', name: 'Post image', width: 1600, height: 900 },
  { platform: 'X (Twitter)', name: 'Header', width: 1500, height: 500 },
  { platform: 'X (Twitter)', name: 'Profile picture', width: 400, height: 400 },
  { platform: 'Facebook', name: 'Post image', width: 1200, height: 630 },
  { platform: 'Facebook', name: 'Cover photo', width: 820, height: 312 },
  { platform: 'Facebook', name: 'Profile picture', width: 720, height: 720 },
  { platform: 'YouTube', name: 'Thumbnail', width: 1280, height: 720 },
  { platform: 'YouTube', name: 'Channel banner', width: 2560, height: 1440 },
  { platform: 'LinkedIn', name: 'Post image', width: 1200, height: 627 },
  { platform: 'LinkedIn', name: 'Personal cover', width: 1584, height: 396 },
  { platform: 'LinkedIn', name: 'Profile picture', width: 400, height: 400 },
  { platform: 'TikTok', name: 'Video / cover', width: 1080, height: 1920 },
  { platform: 'Pinterest', name: 'Pin', width: 1000, height: 1500 },
  { platform: 'WhatsApp', name: 'Status', width: 1080, height: 1920 },
];

// ---------------------------------------------------------------------------
// Character counting
// ---------------------------------------------------------------------------

/** Unicode code-point count (what most platforms roughly use). */
export function countChars(text: string): number {
  return Array.from(text).length;
}

const CJK_WEIGHT2 =
  /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/;

/**
 * X/Twitter weighted length: URLs count as 23, CJK characters and astral
 * characters (most emoji) count as 2, everything else as 1.
 */
export function xWeightedLength(text: string): number {
  const urls = text.match(/https?:\/\/\S+/g) ?? [];
  const withoutUrls = text.replace(/https?:\/\/\S+/g, '');
  let len = urls.length * 23;
  for (const ch of withoutUrls) {
    const cp = ch.codePointAt(0) ?? 0;
    len += cp > 0xffff || CJK_WEIGHT2.test(ch) ? 2 : 1;
  }
  return len;
}

// ---------------------------------------------------------------------------
// Fancy text (Unicode styles)
// ---------------------------------------------------------------------------

function offsetStyle(upper: number, lower: number, digits: number | null): (ch: string) => string {
  return (ch) => {
    const c = ch.codePointAt(0) ?? 0;
    if (c >= 65 && c <= 90) return String.fromCodePoint(upper + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(lower + (c - 97));
    if (digits !== null && c >= 48 && c <= 57) return String.fromCodePoint(digits + (c - 48));
    return ch;
  };
}

function mapStyle(map: Record<string, string>): (ch: string) => string {
  return (ch) => map[ch] ?? ch;
}

/** Exception glyphs win over the offset conversion (they replace it). */
function withExceptions(offset: (ch: string) => string, ex: Record<string, string>): (ch: string) => string {
  return (ch) => ex[ch] ?? offset(ch);
}

const SCRIPT_EX: Record<string, string> = { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' };
const FRAKTUR_EX: Record<string, string> = { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' };
const DOUBLE_EX: Record<string, string> = { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' };

const SMALL_CAPS: Record<string, string> = {
  a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
  n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ',
};

const FLIP_MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ', i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'l', m: 'ɯ',
  n: 'u', o: 'o', p: 'd', q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x', y: 'ʎ', z: 'z',
  A: '∀', B: '𐐒', C: 'Ɔ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H', I: 'I', J: 'ſ', K: '⋊', L: '˥', M: 'W',
  N: 'N', O: 'O', P: 'Ԁ', Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X', Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[',
  '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾',
};

function circled(ch: string): string {
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 65 && c <= 90) return String.fromCodePoint(0x24b6 + (c - 65));
  if (c >= 97 && c <= 122) return String.fromCodePoint(0x24d0 + (c - 97));
  if (ch === '0') return '⓪';
  if (c >= 49 && c <= 57) return String.fromCodePoint(0x2460 + (c - 49));
  return ch;
}

function fullwidth(ch: string): string {
  if (ch === ' ') return '　';
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 33 && c <= 126) return String.fromCodePoint(0xff01 + (c - 33));
  return ch;
}

const COMBINING: Record<string, string> = { strike: '\u0336', underline: '\u0332', slash: '\u0338' };

export interface FancyStyle {
  id: string;
  name: string;
  sample: string;
}

export const FANCY_STYLES: FancyStyle[] = [
  { id: 'bold', name: 'Bold', sample: '𝗕𝗼𝗹𝗱' },
  { id: 'italic', name: 'Italic', sample: '𝐼𝑡𝑎𝑙𝑖𝑐' },
  { id: 'boldItalic', name: 'Bold Italic', sample: '𝑩𝒐𝒍𝒅' },
  { id: 'script', name: 'Script', sample: '𝒮𝒸𝓇𝒾𝓅𝓉' },
  { id: 'boldScript', name: 'Bold Script', sample: '𝓑𝓸𝓵𝓭' },
  { id: 'fraktur', name: 'Fraktur', sample: '𝔉𝔯𝔞𝔨' },
  { id: 'doubleStruck', name: 'Double Struck', sample: '𝔻𝕠𝕦𝕓𝕝𝕖' },
  { id: 'monospace', name: 'Monospace', sample: '𝙼𝚘𝚗𝚘' },
  { id: 'sansBold', name: 'Sans Bold', sample: '𝗦𝗮𝗻𝘀' },
  { id: 'circled', name: 'Circled', sample: 'Ⓒⓘⓡⓒ' },
  { id: 'smallCaps', name: 'Small Caps', sample: 'Sᴍᴀʟʟ' },
  { id: 'fullwidth', name: 'Fullwidth (vapor)', sample: 'Ｆｕｌｌ' },
  { id: 'upsideDown', name: 'Upside Down', sample: 'npsᴉpƎ' },
  { id: 'strikethrough', name: 'Strikethrough', sample: 'S̶t̶r̶i̶k̶e̶' },
  { id: 'underline', name: 'Underline', sample: 'U̲n̲d̲e̲r̲' },
];

const STYLE_FNS: Record<string, (ch: string) => string> = {
  bold: offsetStyle(0x1d400, 0x1d41a, 0x1d7ce),
  italic: offsetStyle(0x1d434, 0x1d44e, null),
  boldItalic: offsetStyle(0x1d468, 0x1d482, null),
  script: withExceptions(offsetStyle(0x1d49c, 0x1d4b6, null), SCRIPT_EX),
  boldScript: offsetStyle(0x1d4d0, 0x1d4ea, null),
  fraktur: withExceptions(offsetStyle(0x1d504, 0x1d51e, null), FRAKTUR_EX),
  doubleStruck: withExceptions(offsetStyle(0x1d538, 0x1d552, 0x1d7d8), DOUBLE_EX),
  monospace: offsetStyle(0x1d670, 0x1d68a, 0x1d7f6),
  sansBold: offsetStyle(0x1d5d4, 0x1d5ee, 0x1d7ec),
  circled,
  smallCaps: mapStyle(SMALL_CAPS),
  fullwidth,
  upsideDown: mapStyle(FLIP_MAP),
  strikethrough: (ch) => (ch === ' ' || ch === '\n' ? ch : ch + COMBINING.strike),
  underline: (ch) => (ch === ' ' || ch === '\n' ? ch : ch + COMBINING.underline),
};

export function convertFancy(text: string, styleId: string): string {
  const fn = STYLE_FNS[styleId];
  if (!fn) return text;
  const converted = Array.from(text, (ch) => fn(ch)).join('');
  return styleId === 'upsideDown' ? Array.from(converted).reverse().join('') : converted;
}

// ---------------------------------------------------------------------------
// Hashtags
// ---------------------------------------------------------------------------

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;

export function parseHashtags(text: string): string[] {
  return text.match(HASHTAG_RE) ?? [];
}

export interface HashtagAnalysis {
  total: number;
  unique: string[];
  duplicates: string[];
  overInstagramLimit: boolean;
  cleaned: string;
  textWithoutHashtags: string;
}

export function analyzeHashtags(text: string): HashtagAnalysis {
  const tags = parseHashtags(text);
  const seen = new Map<string, number>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const unique = [...seen.keys()];
  const duplicates = unique.filter((k) => (seen.get(k) ?? 0) > 1);
  const deduped: string[] = [];
  const kept = new Set<string>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!kept.has(key)) {
      kept.add(key);
      deduped.push(tag);
    }
  }
  return {
    total: tags.length,
    unique,
    duplicates,
    overInstagramLimit: unique.length > 30,
    cleaned: deduped.join(' '),
    textWithoutHashtags: text.replace(HASHTAG_RE, '').replace(/[ \t]{2,}/g, ' ').trim(),
  };
}

export const HASHTAG_NICHES: { id: string; label: string; tags: string[] }[] = [
  { id: 'general', label: 'General / Viral', tags: ['viral', 'trending', 'explore', 'explorepage', 'fyp', 'foryou', 'instagood', 'photooftheday', 'love', 'instadaily', 'picoftheday', 'follow', 'likeforlikes', 'instalike', 'reels', 'reelsinstagram', 'viralreels', 'trendingreels', 'contentcreator', 'creator', 'daily', 'life', 'happy', 'amazing', 'bestofday', 'share', 'community', 'grow', 'discover', 'mustsee'] },
  { id: 'fitness', label: 'Fitness & Gym', tags: ['fitness', 'gym', 'workout', 'fitnessmotivation', 'training', 'health', 'fit', 'bodybuilding', 'lifestyle', 'gymlife', 'muscle', 'exercise', 'gymmotivation', 'fitfam', 'personaltrainer', 'fitnessjourney', 'trainingday', 'weightloss', 'strong', 'cardio', 'crossfit', 'yoga', 'healthylifestyle', 'getfit', 'fitlife', 'legday', 'nutrition', 'motivation', 'sport', 'athlete'] },
  { id: 'food', label: 'Food & Cooking', tags: ['food', 'foodie', 'foodporn', 'instafood', 'foodphotography', 'foodstagram', 'yummy', 'foodlover', 'delicious', 'foodblogger', 'homemade', 'healthyfood', 'cooking', 'foodies', 'tasty', 'recipe', 'easyrecipes', 'dinner', 'lunch', 'breakfast', 'dessert', 'baking', 'chef', 'eat', 'foodpics', 'yum', 'streetfood', 'vegan', 'foodrecipe', 'homecooking'] },
  { id: 'travel', label: 'Travel', tags: ['travel', 'travelphotography', 'travelgram', 'instatravel', 'wanderlust', 'travelblogger', 'traveling', 'vacation', 'trip', 'adventure', 'explore', 'nature', 'traveltheworld', 'tourism', 'passportready', 'traveladdict', 'holiday', 'travelguide', 'backpacking', 'solotravel', 'bucketlist', 'beautifuldestinations', 'earth', 'mountains', 'beach', 'citytrip', 'roadtrip', 'traveller', 'travelmore', 'wanderer'] },
  { id: 'fashion', label: 'Fashion & Style', tags: ['fashion', 'style', 'ootd', 'fashionblogger', 'fashionista', 'outfit', 'fashionstyle', 'instafashion', 'outfitoftheday', 'styleinspo', 'lookbook', 'streetstyle', 'fashionlover', 'trend', 'stylish', 'clothing', 'model', 'shopping', 'beauty', 'makeup', 'dress', 'shoes', 'accessories', 'fashionweek', 'dailylook', 'whatiwore', 'outfitinspo', 'trendingfashion', 'styleblogger', 'fashiondaily'] },
  { id: 'business', label: 'Business & Marketing', tags: ['business', 'entrepreneur', 'marketing', 'smallbusiness', 'success', 'startup', 'digitalmarketing', 'branding', 'socialmediamarketing', 'businessowner', 'entrepreneurlife', 'money', 'hustle', 'motivation', 'sales', 'ecommerce', 'onlinemarketing', 'contentmarketing', 'businesstips', 'growth', 'mindset', 'leadership', 'smallbusinessowner', 'shoplocal', 'freelance', 'workfromhome', 'passiveincome', 'investing', 'ceo', 'goals'] },
  { id: 'photography', label: 'Photography', tags: ['photography', 'photo', 'photographer', 'photooftheday', 'naturephotography', 'portrait', 'portraitphotography', 'canon', 'sonyalpha', 'streetphotography', 'landscape', 'photoshoot', 'model', 'camera', 'lightroom', 'edit', 'photographylover', 'instaphoto', 'pic', 'capture', 'moment', 'goldenhour', 'dslr', 'mirrorless', 'photogram', 'visuals', 'art', 'creative', 'shotoniphone', 'naturelover'] },
  { id: 'tech', label: 'Tech & Gadgets', tags: ['tech', 'technology', 'gadgets', 'innovation', 'ai', 'artificialintelligence', 'software', 'coding', 'programming', 'developer', 'webdeveloper', 'javascript', 'python', 'startup', 'iphone', 'android', 'smartphone', 'computer', 'engineering', 'science', 'future', 'automation', 'machinelearning', 'data', 'cybersecurity', 'technews', 'gadget', 'instatech', 'digital', 'robotics'] },
  { id: 'pets', label: 'Pets & Animals', tags: ['dog', 'dogsofinstagram', 'puppy', 'cat', 'catsofinstagram', 'pet', 'pets', 'petlover', 'doglover', 'catlover', 'cute', 'animals', 'animallovers', 'puppylove', 'doglife', 'catlife', 'kitten', 'dogoftheday', 'catoftheday', 'petstagram', 'dogstagram', 'furry', 'adopt', 'rescuedog', 'goldenretriever', 'frenchie', 'petcare', 'ilovemydog', 'ilovemycat', 'animalsofinstagram'] },
  { id: 'music', label: 'Music', tags: ['music', 'musician', 'singer', 'song', 'newmusic', 'producer', 'musicproducer', 'hiphop', 'rap', 'dj', 'concert', 'livemusic', 'guitar', 'piano', 'musicvideo', 'artist', 'studio', 'beats', 'songwriter', 'cover', 'vocals', 'musiclover', 'instamusic', 'spotify', 'soundcloud', 'musiclife', 'band', 'rnb', 'pop', 'edm'] },
  { id: 'gaming', label: 'Gaming', tags: ['gaming', 'gamer', 'videogames', 'game', 'xbox', 'playstation', 'ps5', 'pcgaming', 'fortnite', 'minecraft', 'gamingcommunity', 'streamer', 'twitch', 'esports', 'gaminglife', 'gamergirl', 'controller', 'fps', 'gamingsetup', 'rgb', 'gameroom', 'gamingposts', 'daily', 'clips', 'highlights', 'proplayer', 'ranked', 'gamingchannel', 'youtubegaming', 'gamingworld'] },
  { id: 'beauty', label: 'Beauty & Skincare', tags: ['beauty', 'makeup', 'skincare', 'makeupartist', 'mua', 'beautytips', 'glowup', 'skincareroutine', 'makeuplover', 'makeuptutorial', 'cosmetics', 'lipstick', 'foundation', 'eyeshadow', 'beautyblogger', 'glam', 'selfcare', 'skin', 'glow', 'naturalbeauty', 'makeupideas', 'beautyhacks', 'haircare', 'nails', 'nailart', 'fragrance', 'beautycommunity', 'makeupaddict', 'skincareproducts', 'beautyreview'] },
];

function keywordTagForms(keyword: string): string[] {
  const words = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const joined = words.join('');
  const camel = words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('');
  const forms = [joined, camel, words.join('_')];
  if (words.length > 1) forms.push(words[words.length - 1]);
  return [...new Set(forms)];
}

/**
 * Build a hashtag set: variants of the user's keywords first, then popular
 * tags from the chosen niche, deduplicated, capped at `count` (max 30).
 */
export function generateHashtags(keywords: string[], nicheId: string, count = 30): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (tag: string) => {
    const clean = tag.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (clean && !seen.has(clean) && out.length < Math.min(count, 30)) {
      seen.add(clean);
      out.push('#' + clean);
    }
  };
  for (const kw of keywords) for (const form of keywordTagForms(kw)) push(form);
  // Combine the first two keywords for a couple of long-tail tags.
  if (keywords.length >= 2) {
    const a = keywordTagForms(keywords[0])[0];
    const b = keywordTagForms(keywords[1])[0];
    if (a && b) {
      push(a + b);
      push(a + '_' + b);
    }
  }
  const niche = HASHTAG_NICHES.find((n) => n.id === nicheId) ?? HASHTAG_NICHES[0];
  for (const tag of niche.tags) push(tag);
  return out;
}

// ---------------------------------------------------------------------------
// Engagement rate
// ---------------------------------------------------------------------------

export interface EngagementResult {
  rate: number;
  totalInteractions: number;
  label: string;
  advice: string;
}

export function engagementRate(input: {
  followers: number;
  avgLikes: number;
  avgComments: number;
  avgShares?: number;
  avgSaves?: number;
}): EngagementResult {
  const total = input.avgLikes + input.avgComments + (input.avgShares ?? 0) + (input.avgSaves ?? 0);
  const rate = input.followers > 0 ? (total / input.followers) * 100 : 0;
  let label = 'Low';
  let advice = 'Below typical benchmarks. Hooks in the first 2 seconds, posting when your audience is active, and replying to comments early all move this number.';
  if (rate >= 6) {
    label = 'Excellent';
    advice = 'Top-tier engagement. Your audience size and interaction are well matched — protect the format that is working.';
  } else if (rate >= 3) {
    label = 'High';
    advice = 'Well above average. Repurpose your best posts into new formats (Reel → carousel → Story) to compound it.';
  } else if (rate >= 1) {
    label = 'Average';
    advice = 'In the normal range for most accounts. Stronger first frames, questions in captions and shareable/saveable content push toward 3%+.';
  }
  return { rate, totalInteractions: total, label, advice };
}

// ---------------------------------------------------------------------------
// Username generator
// ---------------------------------------------------------------------------

const USERNAME_ADJECTIVES = [
  'swift', 'bold', 'clever', 'daily', 'prime', 'epic', 'vivid', 'noble', 'urban', 'cosmic',
  'golden', 'rapid', 'bright', 'wild', 'pure', 'true', 'next', 'hyper', 'ultra', 'fresh',
];
const USERNAME_SUFFIXES = ['hq', 'official', 'daily', 'world', 'lab', 'studio', 'club', 'hub', 'now', 'pro'];
const USERNAME_PREFIXES = ['the', 'its', 'get', 'try', 'hey', 'mr', 'ms', 'team', 'real'];

export function sanitizeUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9._]/g, '').replace(/\.{2,}/g, '.').slice(0, 30);
}

export function generateUsernames(keyword: string, count = 24): string[] {
  const base = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).join('');
  if (!base) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: string) => {
    const clean = sanitizeUsername(u);
    if (clean.length >= 3 && !seen.has(clean) && out.length < count) {
      seen.add(clean);
      out.push(clean);
    }
  };
  push(base);
  for (const s of USERNAME_SUFFIXES) {
    push(base + s);
    push(base + '.' + s);
    push(base + '_' + s);
  }
  for (const p of USERNAME_PREFIXES) {
    push(p + base);
    push(p + '.' + base);
  }
  for (const a of USERNAME_ADJECTIVES) {
    push(a + base);
    push(a + '.' + base);
  }
  for (const s of USERNAME_SUFFIXES) push('the' + base + s);
  return out;
}

// ---------------------------------------------------------------------------
// Post ideas calendar
// ---------------------------------------------------------------------------

export const IDEA_NICHES = [
  'Fitness coach', 'Food / restaurant', 'Fashion brand', 'Travel creator', 'Beauty brand',
  'Tech / SaaS', 'Real estate', 'Small business', 'Photography', 'Education / coaching',
  'Pets', 'Music artist', 'Gaming', 'Personal brand',
];

export const IDEA_TEMPLATES: string[] = [
  'Share the #1 mistake beginners make in {niche} — and the fix',
  'Post a before/after transformation related to {niche}',
  'Answer the question you get asked most about {niche}',
  'Show your behind-the-scenes process, start to finish',
  'Debunk a popular {niche} myth',
  'Share 3 tools/resources you cannot work without',
  'Tell the story of how you started in {niche}',
  'Post a quick 30-second tip most people overlook',
  'React to a trending topic from a {niche} angle',
  'Share a client/customer win (with permission)',
  'Make a "stop doing this" list for {niche} beginners',
  'Show what a real day in your work looks like',
  'Compare two popular options in {niche} honestly',
  'Share your favourite budget option vs premium option',
  'Post a carousel: 5 lessons you learned the hard way',
  'Run a poll: this or that (two {niche} choices)',
  'Share a checklist your audience can save',
  'Film a "watch me fix this common problem" video',
  'Share an unpopular opinion about {niche} (politely)',
  'Post a FAQ roundup: 4 questions, 4 short answers',
  'Introduce yourself again for new followers (your story in 30s)',
  'Share a seasonal or timely {niche} tip',
  'Post a tutorial: the exact steps, no fluff',
  'Show your workspace/setup tour',
  'Share the best advice you ever received about {niche}',
  'Make a "things in my bag/kit" post',
  'Reply to a comment with a full video answer',
  'Share a number: your results, costs or timeline, transparently',
  'Post a meme your {niche} audience will feel in their soul',
  'Collaborate: shout out another creator in {niche} and why',
  'Share a mini case study: problem → process → result',
  'Ask your audience their biggest {niche} struggle (and answer the top replies)',
  'Share a "one year ago vs today" progress post',
  'Post your weekly routine as a saveable carousel',
  'Review a product/service in {niche} — honest pros and cons',
];

const IDEA_FORMATS = ['Reel / short video', 'Carousel', 'Single photo + caption', 'Story series', 'Text post', 'Live / Q&A'];

export interface CalendarDay {
  day: number;
  format: string;
  idea: string;
}

/** Deterministic 30-day calendar: stride-picked templates, rotating formats. */
export function generateCalendar(nicheLabel: string, days = 30): CalendarDay[] {
  const out: CalendarDay[] = [];
  for (let i = 0; i < days; i++) {
    const template = IDEA_TEMPLATES[(i * 11 + 5) % IDEA_TEMPLATES.length];
    out.push({
      day: i + 1,
      format: IDEA_FORMATS[i % IDEA_FORMATS.length],
      idea: template.replaceAll('{niche}', nicheLabel.toLowerCase()),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Giveaway entries
// ---------------------------------------------------------------------------

export function parseCommentEntries(text: string, dedupe = true): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!dedupe) return lines;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(line);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Link-in-bio page generator
// ---------------------------------------------------------------------------

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export interface LinkInBioInput {
  name: string;
  bio: string;
  avatarEmoji: string;
  bg: string;
  card: string;
  text: string;
  links: { label: string; url: string }[];
}

export function buildLinkInBioHtml(input: LinkInBioInput): string {
  const links = input.links
    .filter((l) => l.label.trim() && l.url.trim())
    .map(
      (l) =>
        `    <a class="link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`,
    )
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(input.name)} — Links</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background: ${input.bg}; color: ${input.text}; min-height: 100vh; display: flex; justify-content: center; padding: 48px 16px; }
  main { width: 100%; max-width: 480px; text-align: center; }
  .avatar { width: 96px; height: 96px; border-radius: 9999px; background: ${input.card}; display: flex; align-items: center; justify-content: center; font-size: 44px; margin: 0 auto 16px; }
  h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
  p { font-size: 15px; opacity: .85; margin-bottom: 28px; line-height: 1.5; }
  .link { display: block; background: ${input.card}; color: ${input.text}; text-decoration: none; font-weight: 600; padding: 15px 20px; border-radius: 12px; margin-bottom: 12px; transition: transform .15s ease, opacity .15s ease; }
  .link:hover { transform: translateY(-2px); opacity: .92; }
  footer { margin-top: 24px; font-size: 12px; opacity: .6; }
</style>
</head>
<body>
<main>
  <div class="avatar">${escapeHtml(input.avatarEmoji || '👋')}</div>
  <h1>${escapeHtml(input.name)}</h1>
  <p>${escapeHtml(input.bio)}</p>
${links}
  <footer>Made with Super Crown Tools</footer>
</main>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// FFmpeg social video resize args
// ---------------------------------------------------------------------------

export const SOCIAL_ASPECTS: { id: string; label: string; width: number; height: number }[] = [
  { id: '9:16', label: '9:16 — Reels / TikTok / Shorts', width: 1080, height: 1920 },
  { id: '1:1', label: '1:1 — Square post', width: 1080, height: 1080 },
  { id: '4:5', label: '4:5 — Portrait post', width: 1080, height: 1350 },
  { id: '16:9', label: '16:9 — YouTube / landscape', width: 1920, height: 1080 },
];

/**
 * FFmpeg args to resize a video into a social aspect ratio.
 * 'crop' fills the frame (edges cut); 'pad' fits the whole video over a
 * blurred copy of itself (nothing is cut off).
 */
export function buildSocialResizeArgs(
  input: string,
  output: string,
  opts: { aspectId: string; mode: 'crop' | 'pad' },
): string[] {
  const aspect = SOCIAL_ASPECTS.find((a) => a.id === opts.aspectId) ?? SOCIAL_ASPECTS[0];
  const { width: w, height: h } = aspect;
  if (opts.mode === 'crop') {
    return [
      '-i', input,
      '-vf', `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
      '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-y', output,
    ];
  }
  const filter =
    `split[a][b];[a]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},gblur=sigma=40[bg];` +
    `[b]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
  return [
    '-i', input,
    '-vf', filter,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-y', output,
  ];
}

// ---------------------------------------------------------------------------
// Emoji board data
// ---------------------------------------------------------------------------

export const EMOJI_CATEGORIES: { id: string; label: string; emojis: string }[] = [
  { id: 'faces', label: 'Faces', emojis: '😀 😁 😂 🤣 😊 😍 😘 😎 🤩 🥳 😏 😌 😴 🤯 🥺 😢 😭 😤 🤔 🤫 🤭 🫡 🫠 🙃 😉 😇 🥰 😋 🤪 🤨 🧐 🤓 😈 👻 💀 🤖' },
  { id: 'hands', label: 'Hands & People', emojis: '👍 👎 👏 🙌 🤝 🙏 💪 🔥 ✌️ 🤞 👌 👈 👉 👆 👇 👋 🤚 ✋ 🖖 👊 ✊ 🫶 ❤️‍🔥 🫂 👑 💼 🎓' },
  { id: 'hearts', label: 'Hearts & Love', emojis: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 💖 💗 💓 💞 💕 💌 💋 🌹 🥀 💐 💎 ✨ ⭐ 🌟 💫 🔥' },
  { id: 'objects', label: 'Objects & Symbols', emojis: '💰 💸 💵 🏆 🎯 🚀 💡 📈 📉 📌 📍 🔔 🔑 🎁 🎉 🎊 🏅 🥇 💎 👑 🔥 ⚡ 🌈 ☀️ 🌙 ⭐ ✅ ❌ ⚠️ 🚨 💯 🎬 📸 🎥 💻 📱' },
  { id: 'food', label: 'Food & Drink', emojis: '🍕 🍔 🍟 🌮 🍣 🍜 🍩 🍰 🎂 🍦 🍓 🍇 🥑 ☕ 🍵 🧋 🍺 🍷 🥤 🍽️ 👨‍🍳 🔥 😋 🤤' },
  { id: 'nature', label: 'Nature & Travel', emojis: '🌍 ✈️ 🏝️ 🏖️ 🌅 🌄 🏔️ 🌊 🌴 🌸 🌺 🍀 🌿 🔥 💧 ⚡ 🌈 ☀️ 🌙 ⭐ 🗺️ 🧳 🚗 🏕️ ⛺ 🚢' },
  { id: 'animals', label: 'Animals', emojis: '🐶 🐱 🦁 🐯 🦊 🐻 🐼 🐨 🦄 🐸 🐵 🙈 🙉 🙊 🐷 🐮 🐔 🦋 🐝 🐢 🦉 🐺 🐴 🐙 🦈 🐬' },
  { id: 'activities', label: 'Activities & Sports', emojis: '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥊 🥋 🎯 🎮 🎲 🎸 🎤 🎧 🎬 🏆 🥇 🏋️ 🚴 🏊 🏃 💪 🔥 🎉' },
];
