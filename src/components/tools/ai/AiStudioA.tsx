import React, { useState } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
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

const KEY_SUFFIX = ' — add API key first';

/* ================================================================
   1. AI Writer — generate content from a topic
   ================================================================ */
export const AiWriter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    if (!topic.trim()) { setLocalError('Enter a topic first.'); return; }
    setLocalError('');
    const headingsRule = type === 'Full blog post'
      ? 'You may use a short title on the first line and short plain-text section headings on their own lines.'
      : 'Use plain paragraphs only — no headings, no bullet lists.';
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
    <AiCard tool={tool} note="Drafts come from Google Gemini and can contain factual errors — review and edit before publishing. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Topic</OptLabel>
          <OptInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Benefits of rooftop gardening for beginners" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <OptLabel>Content type</OptLabel>
            <OptSelect value={type} onChange={(e) => setType(e.target.value)}>
              <option>Blog intro</option>
              <option>Full blog post</option>
              <option>Product description</option>
              <option>Social post</option>
              <option>Essay paragraph</option>
              <option>Story opening</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Tone</OptLabel>
            <OptSelect value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Professional</option>
              <option>Friendly</option>
              <option>Persuasive</option>
              <option>Casual</option>
              <option>Formal</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Length</OptLabel>
            <OptSelect value={length} onChange={(e) => setLength(e.target.value)}>
              <option>Short (~100 words)</option>
              <option>Medium (~250 words)</option>
              <option>Long (~500 words)</option>
            </OptSelect>
          </div>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? 'Generating…' : `Generate${keyReady ? '' : KEY_SUFFIX}`}
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
   2. AI Paraphraser — rewrite text in a chosen mode
   ================================================================ */
export const AiParaphraser: React.FC<{ tool: ToolItem }> = ({ tool }) => {
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
    if (!text.trim()) { setLocalError('Paste some text to paraphrase first.'); return; }
    setLocalError('');
    await run(
      `Paraphrase the text below. ${modeInstruction[mode]}\n\n` +
      `Preserve the original meaning and all facts, names and numbers exactly.\n` +
      `Output ONLY the rewritten text — no explanations, no preamble, no quotation marks around it.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note="The AI preserves meaning and facts, but always re-read the rewrite — nuanced or technical wording can shift slightly. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Your text</OptLabel>
          <AiTextarea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text you want rewritten…" />
          <p className="text-[11px] text-gray-500 mt-1">{countWords(text)} words · {text.length} characters</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <OptLabel>Rewrite mode</OptLabel>
            <OptSelect value={mode} onChange={(e) => setMode(e.target.value)}>
              <option>Standard rewrite</option>
              <option>Fluency</option>
              <option>Formal</option>
              <option>Simple</option>
              <option>Creative</option>
              <option>Shorten</option>
              <option>Expand</option>
            </OptSelect>
          </div>
          <div>
            <PrimaryBtn disabled={!keyReady || busy} onClick={generate} className="w-full sm:w-auto">
              {busy ? 'Generating…' : `Paraphrase${keyReady ? '' : KEY_SUFFIX}`}
            </PrimaryBtn>
          </div>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <Stat label="Input words" value={countWords(text)} />
              <Stat label="Output words" value={countWords(result)} />
            </div>
            <AiOutput text={result} filename="paraphrased.txt" />
          </>
        )}
      </div>
    </AiCard>
  );
};

/* ================================================================
   3. AI Grammar Checker — corrected text + list of changes
   ================================================================ */
export const AiGrammarChecker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!text.trim()) { setLocalError('Paste some text to check first.'); return; }
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
    <AiCard tool={tool} note="The checker fixes clear errors and lists the big changes, but it may occasionally 'correct' an intentional style choice — keep the final say yourself. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Your text</OptLabel>
          <AiTextarea rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the text you want checked…" />
          <p className="text-[11px] text-gray-500 mt-1">{countWords(text)} words · {text.length} characters</p>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? 'Generating…' : `Check grammar${keyReady ? '' : KEY_SUFFIX}`}
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
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">What changed</p>
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
    if (!text.trim()) { setLocalError('Paste some text to summarize first.'); return; }
    setLocalError('');
    await run(
      `Summarize the text below. ${styleInstruction[style]}\n\n` +
      `Stay faithful to the source — do not add facts, opinions or examples that are not in it.\n` +
      `Output ONLY the summary, in plain text with no markdown and no preamble.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note="Summaries compress aggressively and can drop nuance or caveats from the source — check the original before acting on details. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Text to summarize</OptLabel>
          <AiTextarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste an article, report, notes…" />
          <p className="text-[11px] text-gray-500 mt-1">{countWords(text)} words · {text.length} characters</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 items-end">
          <div>
            <OptLabel>Summary style</OptLabel>
            <OptSelect value={style} onChange={(e) => setStyle(e.target.value)}>
              <option>Short paragraph</option>
              <option>Detailed summary</option>
              <option>Bullet points</option>
              <option>Key takeaways</option>
              <option>Explain simply</option>
            </OptSelect>
          </div>
          <div>
            <PrimaryBtn disabled={!keyReady || busy} onClick={generate} className="w-full sm:w-auto">
              {busy ? 'Generating…' : `Summarize${keyReady ? '' : KEY_SUFFIX}`}
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
   5. AI Translator — translates text from any language into English
   ================================================================ */
export const AiTranslator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const { busy, error, result, run, keyReady } = useAiText();
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState('');

  const generate = async () => {
    if (!text.trim()) { setLocalError('Enter some text to translate first.'); return; }
    setLocalError('');
    await run(
      `Detect the language of the text below automatically and translate it into natural, fluent English.\n\n` +
      `Preserve the original formatting and line breaks. Keep names, numbers and formatting intact.\n` +
      `Output ONLY the English translation — no explanations, no transliteration, no quotation marks.\n\n` +
      `Text:\n${text}`
    );
  };

  return (
    <AiCard tool={tool} note="Translates text from any language into English. AI translation handles everyday text well, but idioms, poetry and legal/medical wording can come out wrong — have a fluent speaker review anything important. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Text to translate into English</OptLabel>
          <AiTextarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste text in any language…" />
          <p className="text-[11px] text-gray-500 mt-1">{countWords(text)} words · {text.length} characters</p>
        </div>
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? 'Generating…' : `Translate to English${keyReady ? '' : KEY_SUFFIX}`}
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
  const { busy, error, result, run, keyReady } = useAiText();
  const [genre, setGenre] = useState('Fantasy');
  const [hero, setHero] = useState('');
  const [setting, setSetting] = useState('');
  const [length, setLength] = useState('Short story (~700 words)');
  const [twist, setTwist] = useState(false);
  const [localError, setLocalError] = useState('');

  const wordTarget = length.startsWith('Flash') ? 300 : length.startsWith('Longer') ? 1200 : 700;

  const generate = async () => {
    if (!hero.trim()) { setLocalError("Enter your hero's name first."); return; }
    setLocalError('');
    await run(
      `Write a ${genre} story.\n\n` +
      `Hero: ${hero.trim()}.\n` +
      (setting.trim() ? `Setting: ${setting.trim()}.\n` : 'Setting: one fitting the genre.\n') +
      `Length: about ${wordTarget} words.\n` +
      (twist ? 'Include one surprising plot twist near the end that still makes sense in hindsight.\n' : '') +
      `Formatting: plain text paragraphs only — no title line, no chapter headings, no markdown.\n` +
      `Output ONLY the story, starting directly with its first sentence.`
    );
  };

  return (
    <AiCard tool={tool} note="Stories are original AI drafts — great for inspiration and first drafts, but characters and plots can feel familiar; make them your own in the edit. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>Genre</OptLabel>
            <OptSelect value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option>Fantasy</option>
              <option>Sci-Fi</option>
              <option>Mystery</option>
              <option>Romance</option>
              <option>Horror</option>
              <option>Adventure</option>
              <option>Comedy</option>
              <option>Children's</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Length</OptLabel>
            <OptSelect value={length} onChange={(e) => setLength(e.target.value)}>
              <option>Flash (~300 words)</option>
              <option>Short story (~700 words)</option>
              <option>Longer (~1200 words)</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Hero's name</OptLabel>
            <OptInput value={hero} onChange={(e) => setHero(e.target.value)} placeholder="e.g. Zara Ahmed" />
          </div>
          <div>
            <OptLabel>Setting (optional)</OptLabel>
            <OptInput value={setting} onChange={(e) => setSetting(e.target.value)} placeholder="e.g. A floating city above the Karakoram mountains" />
          </div>
        </div>
        <OptCheck label="Add a plot twist" checked={twist} onChange={setTwist} />
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? 'Generating…' : `Write story${keyReady ? '' : KEY_SUFFIX}`}
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
  const { busy, error, result, run, keyReady } = useAiText();
  const [topic, setTopic] = useState('');
  const [form, setForm] = useState('Free verse');
  const [acrosticWord, setAcrosticWord] = useState('');
  const [mood, setMood] = useState('Hopeful');
  const [localError, setLocalError] = useState('');

  const formInstruction: Record<string, string> = {
    'Free verse': 'Write it in free verse — no fixed rhyme or meter, shaped by natural rhythm and imagery.',
    'Haiku (5-7-5)': 'Write a single haiku: exactly 3 lines with 5, then 7, then 5 syllables.',
    'Sonnet (14 lines)': 'Write a sonnet: exactly 14 lines in iambic pentameter with an ABAB CDCD EFEF GG rhyme scheme.',
    Limerick: 'Write a limerick: exactly 5 lines with an AABBA rhyme scheme and a bouncy rhythm.',
    Ballad: 'Write a ballad of 4 quatrains (16 lines) with an ABAB rhyme scheme that tells a small story.',
    Acrostic: `Write an acrostic on the word "${acrosticWord.trim().toUpperCase()}": one line per letter, and each line must begin with the successive letters of that word.`,
  };

  const generate = async () => {
    if (!topic.trim()) { setLocalError('Enter a topic for the poem first.'); return; }
    if (form === 'Acrostic' && !acrosticWord.trim()) { setLocalError('Enter the word for the acrostic first.'); return; }
    setLocalError('');
    await run(
      `Write a poem about: ${topic.trim()}.\n\n` +
      `Form: ${form}. ${formInstruction[form]}\n` +
      `Mood: ${mood}.\n` +
      `Output ONLY the poem itself — plain text, one verse line per line, no title line, no explanation, no markdown.`
    );
  };

  return (
    <AiCard tool={tool} note="The AI follows classic forms closely, but strict syllable counts (haiku, sonnets) can occasionally slip by a syllable — count before submitting anywhere formal. Quality depends on the model and the site's API key quota.">
      {!keyReady && <div className="mb-4"><MissingKeyNotice /></div>}
      <div className="grid gap-3">
        <div>
          <OptLabel>Topic</OptLabel>
          <OptInput value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Rain over the old city at dawn" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>Form</OptLabel>
            <OptSelect value={form} onChange={(e) => setForm(e.target.value)}>
              <option>Free verse</option>
              <option>Haiku (5-7-5)</option>
              <option>Sonnet (14 lines)</option>
              <option>Limerick</option>
              <option>Ballad</option>
              <option>Acrostic</option>
            </OptSelect>
          </div>
          <div>
            <OptLabel>Mood</OptLabel>
            <OptSelect value={mood} onChange={(e) => setMood(e.target.value)}>
              <option>Joyful</option>
              <option>Melancholic</option>
              <option>Romantic</option>
              <option>Hopeful</option>
              <option>Dark</option>
            </OptSelect>
          </div>
        </div>
        {form === 'Acrostic' && (
          <div>
            <OptLabel>Acrostic word</OptLabel>
            <OptInput value={acrosticWord} onChange={(e) => setAcrosticWord(e.target.value)} placeholder="e.g. HOPE" maxLength={14} />
          </div>
        )}
        <div>
          <PrimaryBtn disabled={!keyReady || busy} onClick={generate}>
            {busy ? 'Generating…' : `Write poem${keyReady ? '' : KEY_SUFFIX}`}
          </PrimaryBtn>
        </div>
        {localError && <ErrorBox message={localError} />}
        {error && <ErrorBox message={error} />}
        {result && <AiOutput text={result} filename="poem.txt" />}
      </div>
    </AiCard>
  );
};
