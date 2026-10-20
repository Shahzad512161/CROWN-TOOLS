import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  StudentCard, PrimaryBtn, OptLabel, OptSelect, CopyBtn, Stat, ErrorBox, DownloadBtn,
} from './StudentShell';
import {
  GRADE_SCALES, computeGpa, combineCgpa, neededGpa, formatCitation, analyzeEssay,
  parseFlashcardText, flashcardsToText, buildStudyPlan, ELEMENTS, CATEGORY_LABELS,
  solveQuadratic, solveLinear,
} from '../../../lib/student/core';
import type { CitationInput, Flashcard, ChemElement, ElementCategory } from '../../../lib/student/core';
import { useAiText, MissingKeyNotice, AiTextarea } from '../ai/AiShell';

// ---------------------------------------------------------------------------
// Shared local helpers
// ---------------------------------------------------------------------------

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100';

const tabCls = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
    active
      ? 'bg-teal-600 text-white border-teal-600'
      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-teal-500'
  }`;

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{children}</h3>
);

const num = (s: string): number => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// 1. GPA Calculator
// ---------------------------------------------------------------------------

interface CourseInput {
  name: string;
  grade: string;
  credits: string;
}

export const GpaCalculator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [scaleId, setScaleId] = useState('plusminus');
  const [courses, setCourses] = useState<CourseInput[]>([
    { name: '', grade: 'A', credits: '3' },
    { name: '', grade: 'A', credits: '3' },
    { name: '', grade: 'A', credits: '3' },
    { name: '', grade: 'A', credits: '3' },
  ]);
  const [prevGpa, setPrevGpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');
  const [targetGpa, setTargetGpa] = useState('');
  const [remainingCredits, setRemainingCredits] = useState('');

  const scale = GRADE_SCALES[scaleId] ?? GRADE_SCALES.standard;

  const semester = useMemo(
    () => computeGpa(courses.map((c) => ({ grade: c.grade, credits: num(c.credits) })), scaleId),
    [courses, scaleId],
  );

  const prevCreditsNum = num(prevCredits);
  const combined = useMemo(
    () => (prevCreditsNum > 0 ? combineCgpa(num(prevGpa), prevCreditsNum, [semester]) : null),
    [prevGpa, prevCreditsNum, semester],
  );

  const base = combined ?? semester;
  const needed = neededGpa(base.gpa, base.totalCredits, num(targetGpa), num(remainingCredits));

  const changeScale = (id: string) => {
    setScaleId(id);
    const valid = new Set((GRADE_SCALES[id] ?? GRADE_SCALES.standard).entries.map((e) => e.grade));
    const fallback = (GRADE_SCALES[id] ?? GRADE_SCALES.standard).entries[0].grade;
    setCourses((prev) => prev.map((c) => ({ ...c, grade: valid.has(c.grade) ? c.grade : fallback })));
  };

  const updateCourse = (i: number, patch: Partial<CourseInput>) =>
    setCourses((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  return (
    <StudentCard tool={tool} note="Semester GPA, cumulative CGPA and target planner">
      <div className="max-w-xs">
        <OptLabel>Grading scale</OptLabel>
        <OptSelect value={scaleId} onChange={(e) => changeScale(e.target.value)}>
          {Object.entries(GRADE_SCALES).map(([id, s]) => (
            <option key={id} value={id}>{s.label}</option>
          ))}
        </OptSelect>
      </div>

      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[1fr_110px_110px_36px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-0.5">
          <span>Course (optional)</span><span>Grade</span><span>Credits</span><span />
        </div>
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_96px_84px_36px] sm:grid-cols-[1fr_110px_110px_36px] gap-2 items-center">
            <input
              className={inputCls}
              placeholder={`Course ${i + 1}`}
              value={c.name}
              onChange={(e) => updateCourse(i, { name: e.target.value })}
            />
            <select
              className={inputCls}
              value={c.grade}
              onChange={(e) => updateCourse(i, { grade: e.target.value })}
            >
              {scale.entries.map((e) => (
                <option key={e.grade} value={e.grade}>{e.grade} ({e.points.toFixed(1)})</option>
              ))}
            </select>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.5"
              value={c.credits}
              onChange={(e) => updateCourse(i, { credits: e.target.value })}
            />
            <button
              type="button"
              aria-label="Remove course"
              disabled={courses.length <= 1}
              onClick={() => setCourses((prev) => prev.filter((_, idx) => idx !== i))}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setCourses((prev) => [...prev, { name: '', grade: scale.entries[0].grade, credits: '3' }])}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add course
        </button>
      </div>

      <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-center">
        <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-300">{semester.gpa.toFixed(2)}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">Semester GPA</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Total credits" value={semester.totalCredits} />
        <Stat label="Quality points" value={Math.round(semester.qualityPoints * 100) / 100} />
        <Stat label="Courses counted" value={semester.counted} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <SectionTitle>Cumulative CGPA</SectionTitle>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <OptLabel>Previous CGPA</OptLabel>
            <input className={inputCls} type="number" step="0.01" min="0" placeholder="e.g. 3.40" value={prevGpa} onChange={(e) => setPrevGpa(e.target.value)} />
          </div>
          <div>
            <OptLabel>Previous credits</OptLabel>
            <input className={inputCls} type="number" step="0.5" min="0" placeholder="e.g. 60" value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} />
          </div>
        </div>
        {combined ? (
          <div className="grid grid-cols-3 gap-2 max-w-md">
            <Stat label="New CGPA" value={combined.gpa.toFixed(2)} />
            <Stat label="Total credits" value={combined.totalCredits} />
            <Stat label="Quality points" value={Math.round(combined.qualityPoints * 100) / 100} />
          </div>
        ) : (
          <p className="text-xs text-slate-400">Enter your previous CGPA and credits to see your updated cumulative GPA including this semester.</p>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <SectionTitle>Target planner</SectionTitle>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <OptLabel>Target CGPA</OptLabel>
            <input className={inputCls} type="number" step="0.01" min="0" placeholder="e.g. 3.50" value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)} />
          </div>
          <div>
            <OptLabel>Remaining credits</OptLabel>
            <input className={inputCls} type="number" step="0.5" min="0" placeholder="e.g. 30" value={remainingCredits} onChange={(e) => setRemainingCredits(e.target.value)} />
          </div>
        </div>
        {!targetGpa || !remainingCredits ? (
          <p className="text-xs text-slate-400">Enter a target CGPA and how many credits you still have to take, and this will show the GPA you need to average.</p>
        ) : needed === null ? (
          <p className="text-xs text-slate-400">Add remaining credits above 0 to calculate what you need.</p>
        ) : needed > 4.0 ? (
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
            Not reachable on a 4.0 scale — you would need a {needed.toFixed(2)} GPA across your remaining {num(remainingCredits)} credits, which is above the maximum. A lower target or extra credits would be needed.
          </div>
        ) : needed <= 0 ? (
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl px-3 py-2.5">
            Already secured — your current record keeps you at or above a {num(targetGpa).toFixed(2)} CGPA even before the remaining credits.
          </div>
        ) : (
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl px-3 py-2.5">
            You need to average at least a <span className="font-extrabold">{needed.toFixed(2)} GPA</span> across your remaining {num(remainingCredits)} credits to reach a {num(targetGpa).toFixed(2)} CGPA.
          </div>
        )}
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 2. Citation Generator
// ---------------------------------------------------------------------------

type CiteStyle = 'apa' | 'mla' | 'chicago' | 'harvard';
const CITE_STYLES: { id: CiteStyle; label: string }[] = [
  { id: 'apa', label: 'APA 7' },
  { id: 'mla', label: 'MLA 9' },
  { id: 'chicago', label: 'Chicago' },
  { id: 'harvard', label: 'Harvard' },
];

export const CitationGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [type, setType] = useState<CitationInput['type']>('book');
  const [authors, setAuthors] = useState([{ first: '', last: '' }]);
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [edition, setEdition] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const [siteName, setSiteName] = useState('');
  const [url, setUrl] = useState('');
  const [accessDate, setAccessDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [style, setStyle] = useState<CiteStyle>('apa');

  const input: CitationInput = {
    type,
    authors: authors.filter((a) => a.first.trim() || a.last.trim()),
    year, title, publisher, edition, journal, volume, issue, pages, doi, siteName, url, accessDate,
  };
  const formatted = (s: CiteStyle) => formatCitation(input, s);

  const updateAuthor = (i: number, patch: Partial<{ first: string; last: string }>) =>
    setAuthors((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  return (
    <StudentCard tool={tool} note="APA 7, MLA 9, Chicago and Harvard reference formats">
      <div className="flex flex-wrap gap-2">
        {(['book', 'journal', 'website'] as const).map((t) => (
          <button key={t} type="button" className={tabCls(type === t)} onClick={() => setType(t)}>
            {t === 'book' ? 'Book' : t === 'journal' ? 'Journal article' : 'Website'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <OptLabel>Authors</OptLabel>
        {authors.map((a, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
            <input className={inputCls} placeholder="First name" value={a.first} onChange={(e) => updateAuthor(i, { first: e.target.value })} />
            <input className={inputCls} placeholder="Last name" value={a.last} onChange={(e) => updateAuthor(i, { last: e.target.value })} />
            <button
              type="button"
              aria-label="Remove author"
              disabled={authors.length <= 1}
              onClick={() => setAuthors((prev) => prev.filter((_, idx) => idx !== i))}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setAuthors((prev) => [...prev, { first: '', last: '' }])}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
        >
          <Plus className="w-3.5 h-3.5" /> Add author
        </button>
      </div>

      <div className="grid sm:grid-cols-[140px_1fr] gap-3">
        <div>
          <OptLabel>Year</OptLabel>
          <input className={inputCls} placeholder="2023" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div>
          <OptLabel>{type === 'journal' ? 'Article title' : 'Title'}</OptLabel>
          <input className={inputCls} placeholder="Title of the work" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      {type === 'book' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>Publisher</OptLabel>
            <input className={inputCls} placeholder="e.g. Pearson" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>
          <div>
            <OptLabel>Edition (optional)</OptLabel>
            <input className={inputCls} placeholder="e.g. 3rd ed." value={edition} onChange={(e) => setEdition(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'journal' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>Journal name</OptLabel>
            <input className={inputCls} placeholder="e.g. Nature" value={journal} onChange={(e) => setJournal(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <OptLabel>Volume</OptLabel>
              <input className={inputCls} placeholder="12" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div>
              <OptLabel>Issue</OptLabel>
              <input className={inputCls} placeholder="3" value={issue} onChange={(e) => setIssue(e.target.value)} />
            </div>
            <div>
              <OptLabel>Pages</OptLabel>
              <input className={inputCls} placeholder="45-61" value={pages} onChange={(e) => setPages(e.target.value)} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <OptLabel>DOI (optional)</OptLabel>
            <input className={inputCls} placeholder="10.1038/s41586-023-00001-1" value={doi} onChange={(e) => setDoi(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'website' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>Site name</OptLabel>
            <input className={inputCls} placeholder="e.g. BBC News" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div>
            <OptLabel>Date accessed</OptLabel>
            <input className={inputCls} placeholder="e.g. 20 October 2026" value={accessDate} onChange={(e) => setAccessDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <OptLabel>URL</OptLabel>
            <input className={inputCls} placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {CITE_STYLES.map((s) => (
          <button key={s.id} type="button" className={tabCls(style === s.id)} onClick={() => setStyle(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed break-words">{formatted(style) || 'Fill in the fields above to build your citation.'}</p>
          <CopyBtn text={formatted(style)} />
        </div>
      </div>

      <div className="space-y-2">
        <SectionTitle>All styles</SectionTitle>
        {CITE_STYLES.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              <span className="font-bold text-slate-800 dark:text-slate-100">{s.label}: </span>
              {formatted(s.id)}
            </p>
            <CopyBtn text={formatted(s.id)} />
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Note: in a finished reference list, book and journal titles are italicized in APA, MLA, Chicago and Harvard styles. This
        plain-text output cannot carry italics — italicize the titles yourself after pasting the citation into your document.
      </p>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Essay Word Counter
// ---------------------------------------------------------------------------

export const EssayWordCounter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');
  const stats = useMemo(() => analyzeEssay(text), [text]);

  const targetNum = num(target);
  const pct = targetNum > 0 ? Math.min(100, Math.round((stats.words / targetNum) * 100)) : 0;
  const diff = targetNum - stats.words;

  return (
    <StudentCard tool={tool} note="Word count, readability and reading time — counted live">
      <textarea
        className={`${inputCls} min-h-[180px] resize-y`}
        placeholder="Paste or type your essay here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="max-w-xs">
        <OptLabel>Target word count (optional)</OptLabel>
        <input className={inputCls} type="number" min="0" placeholder="e.g. 1500" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      {targetNum > 0 && (
        <div className="space-y-1.5">
          <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${diff < 0 ? 'bg-red-500' : 'bg-teal-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {stats.words} of {targetNum} words ({pct}%) — {diff > 0 ? `${diff} words to go` : diff < 0 ? `${Math.abs(diff)} words over` : 'exactly on target'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.characters} />
        <Stat label="Chars (no spaces)" value={stats.charactersNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
        <Stat label="Reading time (min)" value={stats.readingMinutes} />
        <Stat label="Speaking time (min)" value={stats.speakingMinutes} />
        <Stat label="Longest sentence (words)" value={stats.longestSentenceWords} />
      </div>

      {stats.words > 0 && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          Flesch Reading Ease: <span className="font-extrabold">{stats.flesch}</span> — {stats.gradeLevel}
        </div>
      )}

      {stats.topWords.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Most used words</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {stats.topWords.map((w) => (
              <span key={w.word} className="px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-800 dark:text-teal-200">
                {w.word} ×{w.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 4. Flashcard Maker
// ---------------------------------------------------------------------------

export const FlashcardMaker: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [cards, setCards] = useState<Flashcard[]>([
    { front: 'Capital of France', back: 'Paris' },
    { front: 'Chemical symbol for gold', back: 'Au' },
    { front: 'Year World War II ended', back: '1945' },
  ]);
  const [mode, setMode] = useState<'edit' | 'study'>('edit');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // study state
  const [order, setOrder] = useState<number[]>([0, 1, 2]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [learning, setLearning] = useState(0);

  const validCards = cards.filter((c) => c.front.trim() && c.back.trim());

  const resetStudy = (deck: Flashcard[]) => {
    setOrder(deck.map((_, i) => i));
    setPos(0);
    setFlipped(false);
    setKnown(0);
    setLearning(0);
  };

  const updateCard = (i: number, patch: Partial<Flashcard>) =>
    setCards((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const removeCard = (i: number) => {
    const next = cards.filter((_, idx) => idx !== i);
    setCards(next);
    resetStudy(next.filter((c) => c.front.trim() && c.back.trim()));
  };

  const doImport = () => {
    const parsed = parseFlashcardText(importText);
    if (parsed.length === 0) {
      setImportError('No valid cards found. Use one card per line in the format: front :: back');
      return;
    }
    setImportError('');
    setCards(parsed);
    resetStudy(parsed);
    setImportText('');
  };

  const shuffle = () => {
    const idx = validCards.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    setOrder(idx);
    setPos(0);
    setFlipped(false);
    setKnown(0);
    setLearning(0);
  };

  const mark = (knows: boolean) => {
    if (knows) setKnown((k) => k + 1);
    else setLearning((k) => k + 1);
    setFlipped(false);
    setPos((p) => p + 1);
  };

  const currentIdx = order[Math.min(pos, Math.max(order.length - 1, 0))];
  const current = currentIdx !== undefined ? validCards[currentIdx] : undefined;
  const finished = validCards.length > 0 && pos >= order.length;

  return (
    <StudentCard tool={tool} note="Create, import, export and study flashcards">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabCls(mode === 'edit')} onClick={() => setMode('edit')}>Edit cards</button>
        <button type="button" className={tabCls(mode === 'study')} onClick={() => setMode('study')}>Study mode</button>
      </div>

      {mode === 'edit' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_36px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-0.5">
              <span>Front (question)</span><span>Back (answer)</span><span />
            </div>
            {cards.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
                <input className={inputCls} placeholder="Front" value={c.front} onChange={(e) => updateCard(i, { front: e.target.value })} />
                <input className={inputCls} placeholder="Back" value={c.back} onChange={(e) => updateCard(i, { back: e.target.value })} />
                <button
                  type="button"
                  aria-label="Remove card"
                  disabled={cards.length <= 1}
                  onClick={() => removeCard(i)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setCards((prev) => [...prev, { front: '', back: '' }])}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add card
            </button>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <SectionTitle>Import cards</SectionTitle>
            <textarea
              className={`${inputCls} min-h-[90px] resize-y`}
              placeholder={'One card per line:\ncapital of Japan :: Tokyo\nH2O is :: water'}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            {importError && <ErrorBox message={importError} />}
            <PrimaryBtn type="button" onClick={doImport} disabled={!importText.trim()}>Import &amp; replace deck</PrimaryBtn>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <DownloadBtn content={flashcardsToText(validCards)} filename="flashcards.txt" label="Export .txt" />
            <DownloadBtn content={JSON.stringify(validCards, null, 2)} filename="flashcards.json" mime="application/json" label="Export .json" />
            <span className="text-xs text-slate-400 self-center">{validCards.length} complete card{validCards.length === 1 ? '' : 's'}</span>
          </div>
        </div>
      )}

      {mode === 'study' && (
        <div className="space-y-4">
          {validCards.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Your deck is empty. Switch to Edit cards and add at least one card with both a front and a back.</p>
          ) : finished ? (
            <div className="space-y-3 text-center py-4">
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Deck finished</p>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <Stat label="Know it" value={known} />
                <Stat label="Still learning" value={learning} />
              </div>
              <PrimaryBtn type="button" onClick={() => { setPos(0); setFlipped(false); setKnown(0); setLearning(0); }}>
                <RotateCcw className="w-4 h-4" /> Study again
              </PrimaryBtn>
            </div>
          ) : current ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 text-center">Card {Math.min(pos + 1, order.length)} / {order.length}</p>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className={`w-full min-h-[180px] rounded-2xl border-2 px-6 py-8 text-center transition-colors ${
                  flipped
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-teal-400'
                }`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{flipped ? 'Answer' : 'Question — click to flip'}</span>
                <span className="block text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{flipped ? current.back : current.front}</span>
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={pos === 0}
                  onClick={() => { setPos((p) => Math.max(0, p - 1)); setFlipped(false); }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <button
                  type="button"
                  disabled={pos >= order.length - 1}
                  onClick={() => { setPos((p) => Math.min(order.length - 1, p + 1)); setFlipped(false); }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={shuffle}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Shuffle
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => mark(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                >
                  Still learning ({learning})
                </button>
                <button
                  type="button"
                  onClick={() => mark(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Know it ({known})
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 5. Study Planner
// ---------------------------------------------------------------------------

const REST_DAYS: { value: string; label: string }[] = [
  { value: '-1', label: 'No rest day' },
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export const StudyPlanner: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [startISO, setStartISO] = useState(todayISO);
  const [examISO, setExamISO] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [topicsText, setTopicsText] = useState('');
  const [restDay, setRestDay] = useState('0');
  const [revisionDays, setRevisionDays] = useState('2');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<ReturnType<typeof buildStudyPlan> | null>(null);

  const generate = () => {
    const topics = topicsText.split(/\r?\n/).map((t) => t.trim()).filter(Boolean);
    if (!startISO || !examISO || examISO <= startISO) {
      setError('The exam date must be after the start date.');
      setPlan(null);
      return;
    }
    if (topics.length === 0) {
      setError('Add at least one topic (one per line).');
      setPlan(null);
      return;
    }
    setError('');
    setPlan(buildStudyPlan({
      startISO,
      examISO,
      topics,
      restWeekday: restDay === '-1' ? 7 : parseInt(restDay, 10),
      revisionDays: Math.max(0, Math.floor(num(revisionDays))),
    }));
  };

  const planText = plan
    ? plan.map((d) => `${d.date} (${d.weekday}) — ${d.kind.toUpperCase()}\n${d.items.map((i) => `  - ${i}`).join('\n') || '  - Rest day'}`).join('\n\n')
    : '';

  const kindChip = (kind: string) =>
    kind === 'study'
      ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800'
      : kind === 'revision'
        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600';

  return (
    <StudentCard tool={tool} note="A day-by-day plan from today to exam day">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>Start date</OptLabel>
          <input className={inputCls} type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)} />
        </div>
        <div>
          <OptLabel>Exam date</OptLabel>
          <input className={inputCls} type="date" value={examISO} onChange={(e) => setExamISO(e.target.value)} />
        </div>
        <div>
          <OptLabel>Weekly rest day</OptLabel>
          <OptSelect value={restDay} onChange={(e) => setRestDay(e.target.value)}>
            {REST_DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>Revision days before exam</OptLabel>
          <input className={inputCls} type="number" min="0" step="1" value={revisionDays} onChange={(e) => setRevisionDays(e.target.value)} />
        </div>
      </div>
      <div>
        <OptLabel>Topics (one per line)</OptLabel>
        <textarea
          className={`${inputCls} min-h-[110px] resize-y`}
          placeholder={'Algebra basics\nCell biology\nWorld War II causes'}
          value={topicsText}
          onChange={(e) => setTopicsText(e.target.value)}
        />
      </div>
      {error && <ErrorBox message={error} />}
      <div className="flex flex-wrap gap-2 items-center">
        <PrimaryBtn type="button" onClick={generate}>Generate plan</PrimaryBtn>
        {plan && <DownloadBtn content={planText} filename="study-plan.txt" label="Download plan (.txt)" />}
      </div>

      {plan && (
        <div className="space-y-2">
          {plan.map((d) => (
            <div key={d.date} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{d.date}</span>
                <span className="text-xs text-slate-400">{d.weekday}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${kindChip(d.kind)}`}>
                  {d.kind === 'study' ? 'Study' : d.kind === 'revision' ? 'Revision' : 'Rest'}
                </span>
              </div>
              {d.items.length > 0 ? (
                <ul className="list-disc pl-5 space-y-0.5 text-sm text-slate-600 dark:text-slate-300">
                  {d.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Rest day — no studying scheduled.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 6. Periodic Table
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<ElementCategory, string> = {
  alkali: 'bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-900 dark:text-red-100',
  alkaline: 'bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800 text-orange-900 dark:text-orange-100',
  transition: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100',
  'post-transition': 'bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800 text-teal-900 dark:text-teal-100',
  metalloid: 'bg-green-100 dark:bg-green-950/60 border-green-300 dark:border-green-800 text-green-900 dark:text-green-100',
  nonmetal: 'bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-100',
  halogen: 'bg-violet-100 dark:bg-violet-950/60 border-violet-300 dark:border-violet-800 text-violet-900 dark:text-violet-100',
  noble: 'bg-pink-100 dark:bg-pink-950/60 border-pink-300 dark:border-pink-800 text-pink-900 dark:text-pink-100',
  lanthanide: 'bg-rose-200 dark:bg-rose-900/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100',
  actinide: 'bg-purple-200 dark:bg-purple-900/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-100',
};

export const PeriodicTable: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ChemElement>(() => ELEMENTS.find((e) => e.n === 26) ?? ELEMENTS[0]);

  const q = query.trim().toLowerCase();
  const matches = (el: ChemElement) =>
    !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.n) === q;

  const byNumber = (n: number) => ELEMENTS.find((e) => e.n === n);

  return (
    <StudentCard tool={tool} note="All 118 elements — click any element for details">
      <div className="max-w-sm">
        <OptLabel>Search by name, symbol or atomic number</OptLabel>
        <input className={inputCls} placeholder="e.g. iron, Fe, 26" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).map((cat) => (
          <span key={cat} className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${CATEGORY_STYLES[cat]}`}>
            {CATEGORY_LABELS[cat]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-1 min-w-[900px]"
          style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
        >
          <div
            className={`rounded-md border flex flex-col items-center justify-center p-1 leading-tight ${CATEGORY_STYLES.lanthanide}`}
            style={{ gridColumn: 3, gridRow: 6 }}
          >
            <span className="text-[10px] font-extrabold">57–71</span>
            <span className="text-[8px] truncate w-full text-center">Lanthanides</span>
          </div>
          <div
            className={`rounded-md border flex flex-col items-center justify-center p-1 leading-tight ${CATEGORY_STYLES.actinide}`}
            style={{ gridColumn: 3, gridRow: 7 }}
          >
            <span className="text-[10px] font-extrabold">89–103</span>
            <span className="text-[8px] truncate w-full text-center">Actinides</span>
          </div>
          {ELEMENTS.map((el) => (
            <button
              key={el.n}
              type="button"
              onClick={() => setSelected(el)}
              style={{ gridColumn: el.group, gridRow: el.period }}
              className={`rounded-md border flex flex-col items-center p-1 leading-tight transition-opacity hover:ring-2 hover:ring-teal-400 ${CATEGORY_STYLES[el.category]} ${
                matches(el) ? '' : 'opacity-25'
              } ${selected.n === el.n ? 'ring-2 ring-teal-600' : ''}`}
            >
              <span className="text-[9px] self-start font-semibold">{el.n}</span>
              <span className="text-sm font-extrabold">{el.symbol}</span>
              <span className="text-[8px] truncate w-full text-center">{el.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className={`w-20 h-20 shrink-0 rounded-xl border flex flex-col items-center justify-center ${CATEGORY_STYLES[selected.category]}`}>
            <span className="text-[10px] font-semibold self-start pl-2">{selected.n}</span>
            <span className="text-3xl font-extrabold leading-none">{selected.symbol}</span>
            <span className="text-[9px] mt-0.5">{selected.mass}</span>
          </div>
          <div className="flex-1 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{selected.name}</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous element"
                  disabled={selected.n <= 1}
                  onClick={() => { const prev = byNumber(selected.n - 1); if (prev) setSelected(prev); }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next element"
                  disabled={selected.n >= 118}
                  onClick={() => { const next = byNumber(selected.n + 1); if (next) setSelected(next); }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label="Atomic number" value={selected.n} />
              <Stat label="Atomic mass" value={selected.mass} />
              <Stat label="Group" value={selected.period >= 9 ? 'f-block' : selected.group} />
              <Stat label="Period" value={selected.period >= 9 ? (selected.period === 9 ? 6 : 7) : selected.period} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Category: <span className="font-bold text-slate-700 dark:text-slate-200">{CATEGORY_LABELS[selected.category]}</span>
              {selected.period >= 9 ? ' — shown in the f-block rows below the main table.' : ''}
            </p>
          </div>
        </div>
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 7. Equation Solver
// ---------------------------------------------------------------------------

const QUAD_KIND_LABELS: Record<string, string> = {
  'two-real': 'Two real roots',
  'one-real': 'One repeated root',
  complex: 'Complex roots',
  linear: 'Linear equation (a = 0)',
  invalid: 'Not an equation in x',
};

export const EquationSolver: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const [qa, setQa] = useState('1');
  const [qb, setQb] = useState('-3');
  const [qc, setQc] = useState('2');
  const [la, setLa] = useState('2');
  const [lb, setLb] = useState('3');
  const [lc, setLc] = useState('1');
  const [ld, setLd] = useState('7');

  const quad = useMemo(() => solveQuadratic(num(qa), num(qb), num(qc)), [qa, qb, qc]);
  const lin = useMemo(() => solveLinear(num(la), num(lb), num(lc), num(ld)), [la, lb, lc, ld]);

  const stepsList = (steps: string[]) => (
    <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
      {steps.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );

  const coefInput = (value: string, set: (v: string) => void, label: string) => (
    <div>
      <OptLabel>{label}</OptLabel>
      <input className={inputCls} type="number" step="any" value={value} onChange={(e) => set(e.target.value)} />
    </div>
  );

  return (
    <StudentCard tool={tool} note="Quadratic and linear equations with worked steps">
      <div className="space-y-3">
        <SectionTitle>Quadratic: ax² + bx + c = 0</SectionTitle>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {coefInput(qa, setQa, 'a')}
          {coefInput(qb, setQb, 'b')}
          {coefInput(qc, setQc, 'c')}
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {num(qa)}x² + {num(qb)}x + {num(qc)} = 0
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <Stat label="Discriminant" value={Math.round(quad.discriminant * 1e6) / 1e6} />
          <Stat label="Type" value={QUAD_KIND_LABELS[quad.kind]} />
        </div>
        {quad.x1 !== undefined && (
          <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-sm font-bold text-teal-800 dark:text-teal-200">
            x₁ = {quad.x1}{quad.x2 !== undefined ? `   ·   x₂ = ${quad.x2}` : ''}
          </div>
        )}
        {stepsList(quad.steps)}
      </div>

      <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
        <SectionTitle>Linear: ax + b = cx + d</SectionTitle>
        <div className="grid grid-cols-4 gap-3 max-w-lg">
          {coefInput(la, setLa, 'a')}
          {coefInput(lb, setLb, 'b')}
          {coefInput(lc, setLc, 'c')}
          {coefInput(ld, setLd, 'd')}
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {num(la)}x + {num(lb)} = {num(lc)}x + {num(ld)}
        </p>
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-sm font-bold text-teal-800 dark:text-teal-200">
          {lin.kind === 'one' && `x = ${lin.x}`}
          {lin.kind === 'none' && 'No solution — the equation can never be true.'}
          {lin.kind === 'infinite' && 'Infinitely many solutions — both sides are always equal.'}
        </div>
        {stepsList(lin.steps)}
      </div>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 8. AI Quiz Generator
// ---------------------------------------------------------------------------

interface ParsedQuestion {
  q: string;
  options: [string, string, string, string];
  answer: string; // 'A' | 'B' | 'C' | 'D'
}

function parseQuiz(raw: string): ParsedQuestion[] {
  const out: ParsedQuestion[] = [];
  for (const block of raw.split(/\n\s*\n/)) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    let q = '';
    const opts: Record<string, string> = {};
    let ans = '';
    for (const line of lines) {
      const qm = line.match(/^Q[:.)]\s*(.+)$/i);
      if (qm) { q = qm[1]; continue; }
      const am = line.match(/^ANSWER[:.)]?\s*([A-D])\b/i);
      if (am) { ans = am[1].toUpperCase(); continue; }
      const om = line.match(/^([A-D])[:.)]\s*(.+)$/);
      if (om) { opts[om[1].toUpperCase()] = om[2]; continue; }
      if (q && Object.keys(opts).length === 0) q += ' ' + line;
    }
    if (q && opts.A && opts.B && opts.C && opts.D && ans) {
      out.push({ q, options: [opts.A, opts.B, opts.C, opts.D], answer: ans });
    }
  }
  return out;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export const AiQuizGenerator: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const { busy, error, result, run, keyReady } = useAiText();
  const [material, setMaterial] = useState('');
  const [count, setCount] = useState('10');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<ParsedQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [parseFailed, setParseFailed] = useState(false);

  const generate = async () => {
    setQuestions(null);
    setAnswers({});
    setChecked(false);
    setParseFailed(false);
    const prompt = [
      `Create exactly ${count} multiple-choice questions at ${difficulty} difficulty from the study material below.`,
      'Use EXACTLY this format for every question and nothing else — no introduction, no explanations, no extra text:',
      'Q: <question>',
      'A) <option>',
      'B) <option>',
      'C) <option>',
      'D) <option>',
      'ANSWER: <letter>',
      'Separate each question block with exactly one blank line. Vary which letter is correct.',
      '',
      'Study material:',
      material,
    ].join('\n');
    const out = await run(prompt);
    if (!out) return;
    const parsed = parseQuiz(out);
    if (parsed.length > 0) setQuestions(parsed);
    else setParseFailed(true);
  };

  const score = questions
    ? questions.reduce((sum, q, i) => sum + (answers[i] === q.answer ? 1 : 0), 0)
    : 0;

  return (
    <StudentCard tool={tool} note="Turn your notes into a practice quiz with AI">
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>Your study material (notes, a chapter, an article…)</OptLabel>
        <AiTextarea
          rows={8}
          placeholder="Paste the text you want to be quizzed on…"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          disabled={!keyReady}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div>
          <OptLabel>Questions</OptLabel>
          <OptSelect value={count} onChange={(e) => setCount(e.target.value)} disabled={!keyReady}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>Difficulty</OptLabel>
          <OptSelect value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={!keyReady}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </OptSelect>
        </div>
      </div>
      <PrimaryBtn type="button" onClick={generate} disabled={busy || !keyReady || !material.trim()}>
        {busy ? 'Generating…' : 'Generate quiz'}
      </PrimaryBtn>
      {error && <ErrorBox message={error} />}

      {parseFailed && (
        <div className="space-y-2">
          <ErrorBox message="The AI reply could not be turned into a quiz automatically. Here is the raw output — you can still study from it, or generate again." />
          <pre className="whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 max-h-80 overflow-y-auto">{result}</pre>
        </div>
      )}

      {questions && (
        <div className="space-y-4">
          {checked && (
            <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-center">
              <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">
                {score} / {questions.length}
              </span>
              <span className="block text-xs font-semibold text-teal-600 dark:text-teal-400">
                {Math.round((score / questions.length) * 100)}% correct
              </span>
            </div>
          )}
          {questions.map((q, qi) => {
            const selected = answers[qi];
            const isCorrect = checked && selected === q.answer;
            return (
              <div key={qi} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-2">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {qi + 1}. {q.q}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const letter = LETTERS[oi];
                    const isSelected = selected === letter;
                    const isAnswer = q.answer === letter;
                    let cls = 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-400';
                    if (checked) {
                      if (isAnswer) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200';
                      else if (isSelected) cls = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200';
                      else cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400';
                    } else if (isSelected) {
                      cls = 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200';
                    }
                    return (
                      <button
                        key={letter}
                        type="button"
                        disabled={checked}
                        onClick={() => setAnswers((prev) => ({ ...prev, [qi]: letter }))}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${cls}`}
                      >
                        {letter}) {opt}
                      </button>
                    );
                  })}
                </div>
                {checked && (
                  <p className={`text-xs font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isCorrect
                      ? 'Correct'
                      : `Wrong — correct answer: ${q.answer}) ${q.options[LETTERS.indexOf(q.answer)]}`}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            {!checked ? (
              <PrimaryBtn type="button" onClick={() => setChecked(true)}>Check answers</PrimaryBtn>
            ) : (
              <PrimaryBtn
                type="button"
                onClick={() => { setAnswers({}); setChecked(false); }}
              >
                <RotateCcw className="w-4 h-4" /> Retake quiz
              </PrimaryBtn>
            )}
          </div>
        </div>
      )}
    </StudentCard>
  );
};
