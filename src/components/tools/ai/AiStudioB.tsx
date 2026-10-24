import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import { aiChat, aiImage, hasGeminiKey, type AiChatMessage } from '../../../lib/ai/client';
import { useStrings } from '../../../lib/LangContext';
import { AI_STRINGS } from '../../../lib/strings/ai';
import {
  AiCard,
  PrimaryBtn,
  MissingKeyNotice,
  useAiText,
  AiOutput,
  AiTextarea,
  OptLabel,
  OptInput,
  OptSelect,
  OptCheck,
  ErrorBox,
  CopyBtn,
} from './AiShell';

// ============================================================
// AI Tools   group B: image generation, email, cover letter,
// bio, captions, business names, and the chat assistant.
// All generation runs through the site owner's Gemini key
// (see src/lib/ai/client.ts); no key → MissingKeyNotice.
// ============================================================

// Option values stay as English state keys (they feed the English Gemini
// prompts); these maps give the localized label key for each value.
const TONE_STYLE_KEYS: Record<string, string> = {
  Professional: 'toneProfessional',
  Friendly: 'toneFriendly',
  Formal: 'toneFormal',
  Concise: 'toneConcise',
  Confident: 'toneConfident',
  Enthusiastic: 'toneEnthusiastic',
  Fun: 'toneFun',
  Inspirational: 'toneInspirational',
  Witty: 'toneWitty',
  Casual: 'toneCasual',
  Minimal: 'styleMinimal',
  Bold: 'styleBold',
  Modern: 'bizStyleModern',
  Classic: 'bizStyleClassic',
  Playful: 'bizStylePlayful',
  Premium: 'bizStylePremium',
  'Short & brandable': 'bizStyleShort',
};

const PURPOSE_KEYS: Record<string, string> = {
  'Job application follow-up': 'purposeJobFollowUp',
  'Meeting request': 'purposeMeeting',
  'Sales introduction': 'purposeSales',
  'Thank-you': 'purposeThankYou',
  Apology: 'purposeApology',
  'Request for information': 'purposeInfoRequest',
  Resignation: 'purposeResignation',
  Custom: 'purposeCustom',
};

const IMG_STYLE_KEYS: Record<string, string> = {
  Photorealistic: 'imgStylePhoto',
  'Digital illustration': 'imgStyleIllustration',
  Anime: 'imgStyleAnime',
  '3D render': 'imgStyle3d',
  Watercolor: 'imgStyleWatercolor',
  'Pixel art': 'imgStylePixel',
  'Logo-style flat': 'imgStyleLogo',
};

const ASPECT_KEYS: Record<string, string> = {
  'Square (1:1)': 'aspectSquare',
  'Landscape (16:9)': 'aspectLandscape',
  'Portrait (9:16)': 'aspectPortrait',
};

const PRESET_KEYS: Record<string, string> = {
  'General assistant': 'presetGeneral',
  "Explain like I'm five": 'presetEli5',
  'Code helper': 'presetCode',
  'Interview practice': 'presetInterview',
  'Brainstorm partner': 'presetBrainstorm',
};

// ---------------- 1. AI Image Generator ----------------

const IMAGE_ASPECTS: Record<string, string> = {
  'Square (1:1)': '1:1 square composition',
  'Landscape (16:9)': '16:9 wide landscape composition',
  'Portrait (9:16)': '9:16 tall portrait composition',
};

export const AiImageGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const keyReady = hasGeminiKey();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspect, setAspect] = useState('Square (1:1)');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dataUrl, setDataUrl] = useState('');

  const generate = async () => {
    if (!prompt.trim()) {
      setError(s('imagePromptEmpty'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const finalPrompt = `${prompt.trim()} Style: ${style}. Aspect ratio: ${IMAGE_ASPECTS[aspect]}.`;
      setDataUrl(await aiImage(finalPrompt));
    } catch (e) {
      setError(e instanceof Error ? e.message : s('imageGenFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AiCard tool={tool} note={s('imageGenNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="mt-4">
        <OptLabel>{s('describeImage')}</OptLabel>
        <AiTextarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={s('imagePromptPlaceholder')}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <OptLabel>{s('style')}</OptLabel>
          <OptSelect value={style} onChange={(e) => setStyle(e.target.value)}>
            {Object.keys(IMG_STYLE_KEYS).map((st) => (
              <option key={st} value={st}>{s(IMG_STYLE_KEYS[st])}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('aspectRatio')}</OptLabel>
          <OptSelect value={aspect} onChange={(e) => setAspect(e.target.value)}>
            {Object.keys(IMAGE_ASPECTS).map((a) => (
              <option key={a} value={a}>{s(ASPECT_KEYS[a])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('generating') : s('generateImage')}
        </PrimaryBtn>
        {dataUrl && (
          <>
            <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
              {s('generateAnother')}
            </PrimaryBtn>
            <a
              href={dataUrl}
              download="ai-image.png"
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            >
              {s('downloadPng')}
            </a>
          </>
        )}
      </div>
      {dataUrl && (
        <div className="mt-4">
          <img src={dataUrl} alt={prompt} className="max-w-full rounded-xl border border-gray-200 dark:border-gray-700" />
        </div>
      )}
    </AiCard>
  );
};

// ---------------- 2. AI Email Writer ----------------

export const AiEmailWriter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [purpose, setPurpose] = useState('Meeting request');
  const [recipient, setRecipient] = useState('');
  const [points, setPoints] = useState('');
  const [tone, setTone] = useState('Professional');

  const generate = () => {
    const prompt = [
      'Write an email.',
      `Purpose: ${purpose}`,
      recipient.trim() ? `Recipient's name: ${recipient.trim()}` : 'The recipient\'s name was not given   address them politely without inventing a name.',
      `Tone: ${tone}`,
      points.trim() ? `Key points to cover:\n${points.trim()}` : 'No specific key points were given   write a sensible, complete email for the stated purpose.',
      '',
      'Return the result in exactly this format:',
      'Subject: <subject line>',
      '',
      '<email body>',
      'Do not add any explanation before or after.',
    ].join('\n');
    void run(prompt);
  };

  return (
    <AiCard tool={tool} note={s('emailNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <OptLabel>{s('purpose')}</OptLabel>
          <OptSelect value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            {Object.keys(PURPOSE_KEYS).map((p) => (
              <option key={p} value={p}>{s(PURPOSE_KEYS[p])}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('recipientOptional')}</OptLabel>
          <OptInput value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder={s('recipientPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('tone')}</OptLabel>
          <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
            {['Professional', 'Friendly', 'Formal', 'Concise'].map((t) => (
              <option key={t} value={t}>{s(TONE_STYLE_KEYS[t])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      <div className="mt-3">
        <OptLabel>{s('keyPoints')}</OptLabel>
        <AiTextarea
          rows={4}
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={s('keyPointsPlaceholder')}
        />
      </div>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('writing') : s('writeEmail')}
        </PrimaryBtn>
      </div>
      <AiOutput text={result} filename="email.txt" />
    </AiCard>
  );
};

// ---------------- 3. AI Cover Letter Generator ----------------

export const AiCoverLetterGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [years, setYears] = useState('');
  const [skills, setSkills] = useState('');
  const [achievement, setAchievement] = useState('');
  const [tone, setTone] = useState('Professional');
  const [localError, setLocalError] = useState('');

  const generate = () => {
    if (!name.trim() || !jobTitle.trim() || !company.trim()) {
      setLocalError(s('coverRequired'));
      return;
    }
    setLocalError('');
    const optional = [
      years.trim() ? `Years of experience: ${years.trim()}` : null,
      skills.trim() ? `Key skills: ${skills.trim()}` : null,
      achievement.trim() ? `Notable achievement: ${achievement.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    const prompt = [
      'Write a job application cover letter.',
      `Applicant name: ${name.trim()}`,
      `Job title applied for: ${jobTitle.trim()}`,
      `Company: ${company.trim()}`,
      optional,
      `Tone: ${tone}`,
      '',
      'Rules:',
      '- 3 to 4 paragraphs, ready to send.',
      '- Use the given name, job title and company. Never use placeholder brackets like [Your Name].',
      '- Do not invent employers, qualifications or numbers beyond what is given; phrase general strengths in general words.',
      '- Sign off with the applicant\'s name only (no fake address or phone number).',
    ]
      .filter((l) => l !== '')
      .join('\n');
    void run(prompt);
  };

  return (
    <AiCard tool={tool} note={s('coverNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <OptLabel>{s('yourNameReq')}</OptLabel>
          <OptInput value={name} onChange={(e) => setName(e.target.value)} placeholder={s('namePlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('jobTitleReq')}</OptLabel>
          <OptInput value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={s('jobTitlePlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('companyReq')}</OptLabel>
          <OptInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder={s('companyPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('yearsExpOptional')}</OptLabel>
          <OptInput type="number" min="0" max="60" value={years} onChange={(e) => setYears(e.target.value)} placeholder={s('yearsPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('keySkillsOptional')}</OptLabel>
          <OptInput value={skills} onChange={(e) => setSkills(e.target.value)} placeholder={s('keySkillsPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('tone')}</OptLabel>
          <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
            {['Professional', 'Confident', 'Enthusiastic'].map((t) => (
              <option key={t} value={t}>{s(TONE_STYLE_KEYS[t])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      <div className="mt-3">
        <OptLabel>{s('achievementOptional')}</OptLabel>
        <OptInput
          value={achievement}
          onChange={(e) => setAchievement(e.target.value)}
          placeholder={s('achievementPlaceholder')}
        />
      </div>
      {(localError || error) && (
        <div className="mt-3">
          <ErrorBox message={localError || error} />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('writing') : s('generateCoverLetter')}
        </PrimaryBtn>
      </div>
      <AiOutput text={result} filename="cover-letter.txt" />
    </AiCard>
  );
};

// ---------------- 4. AI Bio Generator ----------------

const BIO_LENGTHS: Record<string, string> = {
  Instagram: 'at most 150 characters each',
  'X/Twitter': 'at most 160 characters each',
  LinkedIn: 'around 200 to 260 characters each',
  TikTok: 'at most 80 characters each',
  Facebook: 'short and punchy, at most 120 characters each',
};

export const AiBioGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [platform, setPlatform] = useState('Instagram');
  const [about, setAbout] = useState('');
  const [style, setStyle] = useState('Professional');

  const generate = () => {
    const prompt = [
      `Write exactly 5 different ${platform} bio options.`,
      `About the person: ${about.trim() || 'not specified   write broadly appealing bios in the chosen style'}`,
      `Style: ${style}`,
      `Length: ${BIO_LENGTHS[platform]}.`,
      'Format: number the options 1. to 5., one bio per line, no headings and no explanations.',
    ].join('\n');
    void run(prompt);
  };

  return (
    <AiCard tool={tool} note={s('bioNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <OptLabel>{s('platform')}</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {Object.keys(BIO_LENGTHS).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('style')}</OptLabel>
          <OptSelect value={style} onChange={(e) => setStyle(e.target.value)}>
            {['Professional', 'Fun', 'Minimal', 'Bold'].map((st) => (
              <option key={st} value={st}>{s(TONE_STYLE_KEYS[st])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      <div className="mt-3">
        <OptLabel>{s('aboutYou')}</OptLabel>
        <AiTextarea
          rows={3}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder={s('aboutYouPlaceholder')}
        />
      </div>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('writing') : s('generateBios')}
        </PrimaryBtn>
      </div>
      <AiOutput text={result} filename="bios.txt" />
    </AiCard>
  );
};

// ---------------- 5. AI Caption Generator ----------------

export const AiCaptionGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [context, setContext] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Fun');
  const [hashtags, setHashtags] = useState(true);
  const [emojis, setEmojis] = useState(true);

  const generate = () => {
    const prompt = [
      `Write exactly 5 social media captions for ${platform}.`,
      `Post context: ${context.trim() || 'a general lifestyle post'}`,
      `Tone: ${tone}`,
      hashtags ? 'End each caption with 3 to 6 relevant hashtags.' : 'Do not include any hashtags.',
      emojis ? 'Emojis are welcome where they feel natural.' : 'Do not use any emojis.',
      'Format: number the captions 1. to 5., keep each caption (with its hashtags) as its own numbered block, no headings and no explanations.',
    ].join('\n');
    void run(prompt);
  };

  return (
    <AiCard tool={tool} note={s('captionNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="mt-4">
        <OptLabel>{s('postAbout')}</OptLabel>
        <AiTextarea
          rows={3}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={s('postAboutPlaceholder')}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <OptLabel>{s('platform')}</OptLabel>
          <OptSelect value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {['Instagram', 'Facebook', 'X', 'LinkedIn', 'TikTok'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('tone')}</OptLabel>
          <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
            {['Fun', 'Inspirational', 'Professional', 'Witty', 'Casual'].map((t) => (
              <option key={t} value={t}>{s(TONE_STYLE_KEYS[t])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        <OptCheck label={s('includeHashtags')} checked={hashtags} onChange={setHashtags} />
        <OptCheck label={s('allowEmojis')} checked={emojis} onChange={setEmojis} />
      </div>
      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('writing') : s('generateCaptions')}
        </PrimaryBtn>
      </div>
      <AiOutput text={result} filename="captions.txt" />
    </AiCard>
  );
};

// ---------------- 6. AI Business Name Generator ----------------

export const AiBusinessNameGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('Modern');
  const [localError, setLocalError] = useState('');

  const generate = () => {
    if (!industry.trim()) {
      setLocalError(s('bizIndustryEmpty'));
      return;
    }
    setLocalError('');
    const prompt = [
      `Invent exactly 15 brand name ideas for a business in this industry: ${industry.trim()}.`,
      keywords.trim() ? `Words or ideas to weave in where natural: ${keywords.trim()}` : '',
      `Preferred style: ${style}`,
      'Format: a numbered list from 1. to 15. Each line is the name, then "   ", then a 3 to 5 word tagline idea. No headings, no explanations, no extra text.',
      'Names must be original-sounding and easy to spell; do not copy famous brand names.',
    ]
      .filter(Boolean)
      .join('\n');
    void run(prompt);
  };

  return (
    <AiCard tool={tool} note={s('bizNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div>
          <OptLabel>{s('industryReq')}</OptLabel>
          <OptInput value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={s('industryPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('keywordsOptional')}</OptLabel>
          <OptInput value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={s('keywordsPlaceholder')} />
        </div>
        <div>
          <OptLabel>{s('style')}</OptLabel>
          <OptSelect value={style} onChange={(e) => setStyle(e.target.value)}>
            {['Modern', 'Classic', 'Playful', 'Premium', 'Short & brandable'].map((st) => (
              <option key={st} value={st}>{s(TONE_STYLE_KEYS[st])}</option>
            ))}
          </OptSelect>
        </div>
      </div>
      {(localError || error) && (
        <div className="mt-3">
          <ErrorBox message={localError || error} />
        </div>
      )}
      <div className="mt-4">
        <PrimaryBtn onClick={generate} disabled={busy || !keyReady}>
          {busy ? s('thinking') : s('generateNames')}
        </PrimaryBtn>
      </div>
      <AiOutput text={result} filename="business-names.txt" />
    </AiCard>
  );
};

// ---------------- 7. AI Chat ----------------

const CHAT_PRESETS: Record<string, string> = {
  'General assistant': 'You are a helpful, friendly general-purpose assistant. Answer clearly and concisely.',
  "Explain like I'm five":
    'Explain everything in very simple words, as if talking to a curious five-year-old. Use everyday examples, short sentences and a warm tone.',
  'Code helper':
    'You are an expert programming assistant. Give correct, working code with brief explanations. Prefer TypeScript and JavaScript examples unless the user asks for another language.',
  'Interview practice':
    'You are a job interview coach. Ask ONE interview question at a time, wait for the answer, then give brief, honest feedback and ask the next question. If the user has not said which role they are interviewing for, start by asking.',
  'Brainstorm partner':
    "You are an energetic brainstorming partner. Offer many varied ideas, build on the user's ideas, ask the occasional sharp question, and keep suggestions practical.",
};

export const AiChatTool: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const keyReady = hasGeminiKey();
  const [preset, setPreset] = useState('General assistant');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !keyReady) return;
    const userMsg: AiChatMessage = { role: 'user', text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const reply = await aiChat(history, CHAT_PRESETS[preset]);
      setMessages([...history, { role: 'model', text: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : s('aiRequestFailedRetry'));
    } finally {
      setBusy(false);
    }
  };

  const transcript = messages.map((m) => `${m.role === 'user' ? s('youLabel') : 'AI'}: ${m.text}`).join('\n\n');

  return (
    <AiCard tool={tool} note={s('chatNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div className="flex flex-wrap items-end gap-3 mt-4">
        <div className="min-w-[220px] flex-1 sm:flex-none sm:w-64">
          <OptLabel>{s('assistantPreset')}</OptLabel>
          <OptSelect value={preset} onChange={(e) => setPreset(e.target.value)} disabled={!keyReady}>
            {Object.keys(CHAT_PRESETS).map((p) => (
              <option key={p} value={p}>{s(PRESET_KEYS[p])}</option>
            ))}
          </OptSelect>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && <CopyBtn text={transcript} label={s('copyChat')} />}
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setError('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {s('clearChat')}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mt-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 p-3 h-[380px] overflow-y-auto"
      >
        {messages.length === 0 && !busy && (
          <p className="text-sm text-gray-500 text-center pt-16">
            {s('chatEmpty')}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'self-end bg-purple-600 text-white rounded-ee-md'
                  : 'self-start bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-es-md'
              }`}
            >
              {m.text}
            </div>
          ))}
          {busy && (
            <div className="self-start max-w-[85%] px-3 py-2 rounded-2xl rounded-es-md text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500">
              {s('thinking')}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <ErrorBox message={error} />
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <AiTextarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={keyReady ? s('chatPlaceholder') : s('chatPlaceholderNoKey')}
          disabled={!keyReady || busy}
          className="flex-1"
        />
        <PrimaryBtn onClick={() => void send()} disabled={busy || !keyReady || !input.trim()}>
          <span className="inline-flex items-center gap-1.5">
            <Send className="w-4 h-4" />
            {s('send')}
          </span>
        </PrimaryBtn>
      </div>
    </AiCard>
  );
};
