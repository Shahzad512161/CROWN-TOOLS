import React, { useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import { useStrings, COMMON } from '../../../lib/LangContext';
import { AI_STRINGS } from '../../../lib/strings/ai';
import {
  AiCard,
  AiOutput,
  AiTextarea,
  CopyBtn,
  DownloadBtn,
  ErrorBox,
  MissingKeyNotice,
  OptCheck,
  OptInput,
  OptLabel,
  OptSelect,
  PrimaryBtn,
  Stat,
  useAiText,
} from './AiShell';

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/* ================================================================
   1. AI Writer   generate content from a topic
   ================================================================ */
export const AiWriter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const c = useStrings(COMMON);
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('Blog intro');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium (~250 words)');
  const [localError, setLocalError] = useState('');

  const wordTarget = length.startsWith('Short') ? 100 : length.startsWith('Long') ? 500 : 250;
  const typeDesc: Record<string, string> = {
    'Blog intro': 'an engaging blog post introduction that hooks the reader',
    'Full blog post': 'a complete blog post',
    'Product description': 'a persuasive product description',
    'Social post': 'a social media post (hashtags at the end are allowed)',
    'Essay paragraph': 'a well-structured essay paragraph',
    'Story opening': 'the opening of a short story that hooks the reader',
  };

  const generate = async () => {
    if (!topic.trim()) { setLocalError(s('enterTopicFirst')); return; }
    setLocalError('');
    const headingsRule = type === 'Full blog post'
      ? 'You may use a short title on the first line and short plain-text section headings on their own lines.'
      : 'Use plain paragraphs only   no headings, no bullet lists.';
    await run(
      `Write ${typeDesc[type]} about the topic below.\n\n` +
      `Tone: ${tone}.\n` +
      `Length: about ${wordTarget} words.\n` +
      `Formatting: plain text only, no markdown symbols. ${headingsRule}\n` +
      `Output ONLY the finished text, with no preamble such as "Here is".\n\n` +
      `Topic: ${topic.trim()}`
    );
  };

  return (
    <AiCard tool={tool} note={s('writerNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{s('topic')}</OptLabel>
          <OptInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={s('writerTopicPlaceholder')} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <OptLabel>{s('contentType')}</OptLabel>
            <OptSelect value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Blog intro">{s('writerTypeBlogIntro')}</option>
              <option value="Full blog post">{s('writerTypeFullPost')}</option>
              <option value="Product description">{s('writerTypeProductDesc')}</option>
              <option value="Social post">{s('writerTypeSocialPost')}</option>
              <option value="Essay paragraph">{s('writerTypeEssay')}</option>
              <option value="Story opening">{s('writerTypeStoryOpening')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('tone')}</OptLabel>
            <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="Professional">{s('toneProfessional')}</option>
              <option value="Friendly">{s('toneFriendly')}</option>
              <option value="Persuasive">{s('tonePersuasive')}</option>
              <option value="Casual">{s('toneCasual')}</option>
              <option value="Formal">{s('toneFormal')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('length')}</OptLabel>
            <OptSelect value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="Short (~100 words)">{s('writerLenShort')}</option>
              <option value="Medium (~250 words)">{s('writerLenMedium')}</option>
              <option value="Long (~500 words)">{s('writerLenLong')}</option>
            </OptSelect>
          </div>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? s('generating') : `${c('generate')}${keyReady ? '' : s('addKeySuffix')}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="ai-writing.txt" />}
      </div>
    </AiCard>
  );
};

/* ================================================================
   2. AI Paraphraser   rewrite text in a chosen mode
   ================================================================ */
export const AiParaphraser: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const c = useStrings(COMMON);
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [mode, setMode] = useState('Standard rewrite');
  const [localError, setLocalError] = useState('');

  const modeInstruction: Record<string, string> = {
    'Standard rewrite': 'Rewrite it using different words and sentence structures, keeping the same tone and roughly the same length.',
    Fluency: 'Rewrite it so it flows naturally and smoothly, fixing awkward phrasing, as a skilled native writer would.',
    Formal: 'Rewrite it in a formal, professional tone suitable for business or academic use.',
    Simple: 'Rewrite it in plain, simple language with short sentences that a non-native speaker can easily understand.',
    Creative: 'Rewrite it in a more vivid, expressive and creative style.',
    Shorten: 'Rewrite it to about half its original length, keeping every key point and fact.',
    Expand: 'Rewrite it at roughly double the original length, elaborating with relevant supporting detail without inventing new facts.',
  };

  const generate = async () => {
    if (!text.trim()) { setLocalError(s('paraphraseEmpty')); return; }
    setLocalError('');
    await run(
      `Paraphrase the text below. ${modeInstruction[mode]}\n\n` +
      `Preserve the original meaning and all facts, names and numbers exactly.\n` +
      `Output ONLY the rewritten text   no explanations, no preamble, no quotation marks around it.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note={s('paraphraserNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{c('yourText')}</OptLabel>
          <AiTextarea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={s('paraphrasePlaceholder')} />
          <p className="text-[11px] text-gray-500 mt-1">
            {s('wordsChars').replace('{words}', String(countWords(text))).replace('{chars}', String(text.length))}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <OptLabel>{s('rewriteMode')}</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="Standard rewrite">{s('modeStandard')}</option>
              <option value="Fluency">{s('modeFluency')}</option>
              <option value="Formal">{s('modeFormal')}</option>
              <option value="Simple">{s('modeSimple')}</option>
              <option value="Creative">{s('modeCreative')}</option>
              <option value="Shorten">{s('modeShorten')}</option>
              <option value="Expand">{s('modeExpand')}</option>
            </OptSelect>
          </div>
          <div>
            <PrimaryBtn disabled={!keyReady || busy} onClick={generate} className="w-full sm:w-auto">
              {busy ? s('generating') : `${s('paraphraseBtn')}${keyReady ? '' : s('addKeySuffix')}`}
            </PrimaryBtn>
          </div>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Stat label={s('inputWords')} value={countWords(text)} />
              <Stat label={s('outputWords')} value={countWords(result)} />
            </div>
            <AiOutput text={result} filename="paraphrased.txt" />
          </>
        )}
      </div>
    </AiCard>
  );
};

/* ================================================================
   3. AI Grammar Checker   corrected text + list of changes
   ================================================================ */
export const AiGrammarChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const c = useStrings(COMMON);
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!text.trim()) { setLocalError(s('grammarEmpty')); return; }
    setLocalError('');
    await run(
      'Correct the grammar, spelling and punctuation of the text below. ' +
      'Return in EXACTLY this format: the corrected text, then a line containing only ===, then a bullet list (lines starting with "• ") of each significant change you made; if nothing changed write "• No changes needed." after the separator. ' +
      'Do not add any other commentary, headings or markdown.\n\n' +
      `Text:\n${text}`
    );
  };

  const sepMatch = result ? result.split(/^===\s*$/m) : [];
  const hasSplit = sepMatch.length > 1;
  const corrected = hasSplit ? sepMatch[0].trim() : result;
  const changes = hasSplit
    ? sepMatch.slice(1).join('===').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('•'))
    : [];

  return (
    <AiCard tool={tool} note={s('grammarNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{c('yourText')}</OptLabel>
          <AiTextarea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={s('grammarPlaceholder')} />
          <p className="text-[11px] text-gray-500 mt-1">
            {s('wordsChars').replace('{words}', String(countWords(text))).replace('{chars}', String(text.length))}
          </p>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? s('generating') : `${s('checkGrammar')}${keyReady ? '' : s('addKeySuffix')}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && !hasSplit && <AiOutput text={result} filename="corrected.txt" />}
        {result && hasSplit && (
          <>
            <AiOutput text={corrected} filename="corrected.txt" />
            {changes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{s('whatChanged')}</p>
                <ul className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3 space-y-1">
                  {changes.map((c, i) => (
                    <li key={i} className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </AiCard>
  );
};

/* ================================================================
   4. AI Text Summarizer
   ================================================================ */
export const AiTextSummarizer: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [style, setStyle] = useState('Short paragraph');
  const [localError, setLocalError] = useState('');

  const styleInstruction: Record<string, string> = {
    'Short paragraph': 'Summarize it in one short paragraph of 3–5 sentences covering only the main point.',
    'Detailed summary': 'Write a detailed summary in a few paragraphs, covering all main points, key evidence and conclusions.',
    'Bullet points': 'Summarize it as a bullet list, one key point per line, each line starting with "• ".',
    'Key takeaways': 'List the key takeaways as a numbered list (1. 2. 3. …), one sentence each.',
    'Explain simply': 'Explain the content in simple, everyday language that a smart 12-year-old could understand.',
  };

  const generate = async () => {
    if (!text.trim()) { setLocalError(s('summarizeEmpty')); return; }
    setLocalError('');
    await run(
      `Summarize the text below. ${styleInstruction[style]}\n\n` +
      `Stay faithful to the source   do not add facts, opinions or examples that are not in it.\n` +
      `Output ONLY the summary, in plain text with no markdown and no preamble.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note={s('summarizerNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{s('textToSummarize')}</OptLabel>
          <AiTextarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder={s('summarizePlaceholder')} />
          <p className="text-[11px] text-gray-500 mt-1">
            {s('wordsChars').replace('{words}', String(countWords(text))).replace('{chars}', String(text.length))}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <OptLabel>{s('summaryStyle')}</OptLabel>
            <OptSelect value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="Short paragraph">{s('styleShortPara')}</option>
              <option value="Detailed summary">{s('styleDetailed')}</option>
              <option value="Bullet points">{s('styleBullets')}</option>
              <option value="Key takeaways">{s('styleTakeaways')}</option>
              <option value="Explain simply">{s('styleExplainSimply')}</option>
            </OptSelect>
          </div>
          <div>
            <PrimaryBtn disabled={!keyReady || busy} onClick={generate} className="w-full sm:w-auto">
              {busy ? s('generating') : `${s('summarizeBtn')}${keyReady ? '' : s('addKeySuffix')}`}
            </PrimaryBtn>
          </div>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="summary.txt" />}
      </div>
    </AiCard>
  );
};

/* ================================================================
   5. AI Translator   translates text from any language into English
   ================================================================ */
export const AiTranslator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!text.trim()) { setLocalError(s('translatorEmpty')); return; }
    setLocalError('');
    await run(
      `Detect the language of the text below automatically and translate it into natural, fluent English.\n\n` +
      `Preserve the original formatting and line breaks. Keep names, numbers and formatting intact.\n` +
      `Output ONLY the English translation   no explanations, no transliteration, no quotation marks.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note={s('translatorNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{s('textToTranslate')}</OptLabel>
          <AiTextarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={s('translatorPlaceholder')} />
          <p className="text-[11px] text-gray-500 mt-1">
            {s('wordsChars').replace('{words}', String(countWords(text))).replace('{chars}', String(text.length))}
          </p>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? s('generating') : `${s('translateToEnglish')}${keyReady ? '' : s('addKeySuffix')}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="translation.txt" />}
      </div>
    </AiCard>
  );
};

/* ================================================================
   6. AI Story Generator
   ================================================================ */
export const AiStoryGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [genre, setGenre] = useState('Fantasy');
  const [hero, setHero] = useState('');
  const [setting, setSetting] = useState('');
  const [length, setLength] = useState('Short story (~700 words)');
  const [twist, setTwist] = useState(false);
  const [localError, setLocalError] = useState('');

  const wordTarget = length.startsWith('Flash') ? 300 : length.startsWith('Longer') ? 1200 : 700;

  const generate = async () => {
    if (!hero.trim()) { setLocalError(s('storyHeroEmpty')); return; }
    setLocalError('');
    await run(
      `Write a ${genre} story.\n\n` +
      `Hero: ${hero.trim()}.\n` +
      (setting.trim() ? `Setting: ${setting.trim()}.\n` : 'Setting: one fitting the genre.\n') +
      `Length: about ${wordTarget} words.\n` +
      (twist ? 'Include one surprising plot twist near the end that still makes sense in hindsight.\n' : '') +
      `Formatting: plain text paragraphs only   no title line, no chapter headings, no markdown.\n` +
      `Output ONLY the story, starting directly with its first sentence.`
    );
  };

  return (
    <AiCard tool={tool} note={s('storyNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('genre')}</OptLabel>
            <OptSelect value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="Fantasy">{s('genreFantasy')}</option>
              <option value="Sci-Fi">{s('genreSciFi')}</option>
              <option value="Mystery">{s('genreMystery')}</option>
              <option value="Romance">{s('genreRomance')}</option>
              <option value="Horror">{s('genreHorror')}</option>
              <option value="Adventure">{s('genreAdventure')}</option>
              <option value="Comedy">{s('genreComedy')}</option>
              <option value="Children's">{s('genreChildrens')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('length')}</OptLabel>
            <OptSelect value={length} onChange={(e) => setLength(e.target.value)}>
              <option value="Flash (~300 words)">{s('storyLenFlash')}</option>
              <option value="Short story (~700 words)">{s('storyLenShort')}</option>
              <option value="Longer (~1200 words)">{s('storyLenLonger')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('heroName')}</OptLabel>
            <OptInput value={hero} onChange={(e) => setHero(e.target.value)} placeholder={s('heroNamePlaceholder')} />
          </div>
          <div>
            <OptLabel>{s('settingOptional')}</OptLabel>
            <OptInput value={setting} onChange={(e) => setSetting(e.target.value)} placeholder={s('settingPlaceholder')} />
          </div>
        </div>
        <OptCheck label={s('addPlotTwist')} checked={twist} onChange={setTwist} />
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? s('generating') : `${s('writeStory')}${keyReady ? '' : s('addKeySuffix')}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="story.txt" />}
      </div>
    </AiCard>
  );
};

/* ================================================================
   7. AI Poem Generator
   ================================================================ */
export const AiPoemGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(AI_STRINGS);
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [form, setForm] = useState('Free verse');
  const [acrosticWord, setAcrosticWord] = useState('');
  const [mood, setMood] = useState('Hopeful');
  const [localError, setLocalError] = useState('');

  const formInstruction: Record<string, string> = {
    'Free verse': 'Write it in free verse   no fixed rhyme or meter, shaped by natural rhythm and imagery.',
    'Haiku (5-7-5)': 'Write a single haiku: exactly 3 lines with 5, then 7, then 5 syllables.',
    'Sonnet (14 lines)': 'Write a sonnet: exactly 14 lines in iambic pentameter with an ABAB CDCD EFEF GG rhyme scheme.',
    Limerick: 'Write a limerick: exactly 5 lines with an AABBA rhyme scheme and a bouncy rhythm.',
    Ballad: 'Write a ballad of 4 quatrains (16 lines) with an ABAB rhyme scheme that tells a small story.',
    Acrostic: `Write an acrostic on the word "${acrosticWord.trim().toUpperCase()}": one line per letter, and each line must begin with the successive letters of that word.`,
  };

  const generate = async () => {
    if (!topic.trim()) { setLocalError(s('poemTopicEmpty')); return; }
    if (form === 'Acrostic' && !acrosticWord.trim()) { setLocalError(s('poemAcrosticEmpty')); return; }
    setLocalError('');
    await run(
      `Write a poem about: ${topic.trim()}.\n\n` +
      `Form: ${form}. ${formInstruction[form]}\n` +
      `Mood: ${mood}.\n` +
      `Output ONLY the poem itself   plain text, one verse line per line, no title line, no explanation, no markdown.`
    );
  };

  return (
    <AiCard tool={tool} note={s('poemNote')}>
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>{s('topic')}</OptLabel>
          <OptInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={s('poemTopicPlaceholder')} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('poemForm')}</OptLabel>
            <OptSelect value={form} onChange={(e) => setForm(e.target.value)}>
              <option value="Free verse">{s('formFreeVerse')}</option>
              <option value="Haiku (5-7-5)">{s('formHaiku')}</option>
              <option value="Sonnet (14 lines)">{s('formSonnet')}</option>
              <option value="Limerick">{s('formLimerick')}</option>
              <option value="Ballad">{s('formBallad')}</option>
              <option value="Acrostic">{s('formAcrostic')}</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>{s('mood')}</OptLabel>
            <OptSelect value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="Joyful">{s('moodJoyful')}</option>
              <option value="Melancholic">{s('moodMelancholic')}</option>
              <option value="Romantic">{s('moodRomantic')}</option>
              <option value="Hopeful">{s('moodHopeful')}</option>
              <option value="Dark">{s('moodDark')}</option>
            </OptSelect>
          </div>
        </div>
        {form === 'Acrostic' && (
          <div>
            <OptLabel>{s('acrosticWord')}</OptLabel>
            <OptInput value={acrosticWord} onChange={(e) => setAcrosticWord(e.target.value)} placeholder={s('acrosticPlaceholder')} maxLength={14} />
          </div>
        )}
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? s('generating') : `${s('writePoem')}${keyReady ? '' : s('addKeySuffix')}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="poem.txt" />}
      </div>
    </AiCard>
  );
};
