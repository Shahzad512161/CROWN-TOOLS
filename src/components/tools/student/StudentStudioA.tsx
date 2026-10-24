import React, { useMemo, useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  StudentCard, PrimaryBtn, OptLabel, OptSelect, CopyBtn, Stat, ErrorBox, DownloadBtn,
} from './StudentShell';
import {
  GRADE_SCALES, computeGpa, combineCgpa, neededGpa, formatCitation, analyzeEssay,
  parseFlashcardText, flashcardsToText, buildStudyPlan, ELEMENTS,
  solveQuadratic, solveLinear,
} from '../../../lib/student/core';
import type { CitationInput, Flashcard, ChemElement, ElementCategory } from '../../../lib/student/core';
import { useAiText, MissingKeyNotice, AiTextarea } from '../ai/AiShell';
import { useStrings, COMMON } from '../../../lib/LangContext';
import { STUDENT_STRINGS } from '../../../lib/strings/student';

// Lib data keys -> dictionary keys (labels for scales / element categories / result kinds)
const SCALE_LABEL_KEYS: Record<string, string> = { standard: 'scaleStandard', plusminus: 'scalePlusMinus' };
const CAT_KEYS: Record<ElementCategory, string> = {
  alkali: 'catAlkali',
  alkaline: 'catAlkaline',
  transition: 'catTransition',
  'post-transition': 'catPostTransition',
  metalloid: 'catMetalloid',
  nonmetal: 'catNonmetal',
  halogen: 'catHalogen',
  noble: 'catNoble',
  lanthanide: 'catLanthanide',
  actinide: 'catActinide',
};
const WEEKDAY_KEYS: Record<string, string> = {
  Sunday: 'weekdaySunday',
  Monday: 'weekdayMonday',
  Tuesday: 'weekdayTuesday',
  Wednesday: 'weekdayWednesday',
  Thursday: 'weekdayThursday',
  Friday: 'weekdayFriday',
  Saturday: 'weekdaySaturday',
};
const QUAD_KIND_KEYS: Record<string, string> = {
  'two-real': 'quadTwoReal',
  'one-real': 'quadOneReal',
  complex: 'quadComplex',
  linear: 'quadLinear',
  invalid: 'quadInvalid',
};

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
  const s = useStrings(STUDENT_STRINGS);
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
    <StudentCard tool={tool} note={s('gpaNote')}>
      <div className="max-w-xs">
        <OptLabel>{s('gradingScale')}</OptLabel>
        <OptSelect value={scaleId} onChange={(e) => changeScale(e.target.value)}>
          {Object.entries(GRADE_SCALES).map(([id, sc]) => (
            <option key={id} value={id}>{SCALE_LABEL_KEYS[id] ? s(SCALE_LABEL_KEYS[id]) : sc.label}</option>
          ))}
        </OptSelect>
      </div>

      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-[1fr_110px_110px_36px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-0.5">
          <span>{s('colCourseOptional')}</span><span>{s('colGrade')}</span><span>{s('colCredits')}</span><span />
        </div>
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_96px_84px_36px] sm:grid-cols-[1fr_110px_110px_36px] gap-2 items-center">
            <input
              className={inputCls}
              placeholder={s('coursePlaceholder').replace('{n}', String(i + 1))}
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
              aria-label={s('removeCourse')}
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
          <Plus className="w-3.5 h-3.5" /> {s('addCourse')}
        </button>
      </div>

      <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-center">
        <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-300">{semester.gpa.toFixed(2)}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">{s('semesterGpa')}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={s('totalCredits')} value={semester.totalCredits} />
        <Stat label={s('qualityPoints')} value={Math.round(semester.qualityPoints * 100) / 100} />
        <Stat label={s('coursesCounted')} value={semester.counted} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <SectionTitle>{s('cumulativeCgpa')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <OptLabel>{s('prevCgpa')}</OptLabel>
            <input className={inputCls} type="number" step="0.01" min="0" placeholder="e.g. 3.40" value={prevGpa} onChange={(e) => setPrevGpa(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('prevCredits')}</OptLabel>
            <input className={inputCls} type="number" step="0.5" min="0" placeholder="e.g. 60" value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} />
          </div>
        </div>
        {combined ? (
          <div className="grid grid-cols-3 gap-2 max-w-md">
            <Stat label={s('newCgpa')} value={combined.gpa.toFixed(2)} />
            <Stat label={s('totalCredits')} value={combined.totalCredits} />
            <Stat label={s('qualityPoints')} value={Math.round(combined.qualityPoints * 100) / 100} />
          </div>
        ) : (
          <p className="text-xs text-slate-400">{s('cgpaHint')}</p>
        )}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
        <SectionTitle>{s('targetPlanner')}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div>
            <OptLabel>{s('targetCgpa')}</OptLabel>
            <input className={inputCls} type="number" step="0.01" min="0" placeholder="e.g. 3.50" value={targetGpa} onChange={(e) => setTargetGpa(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('remainingCredits')}</OptLabel>
            <input className={inputCls} type="number" step="0.5" min="0" placeholder="e.g. 30" value={remainingCredits} onChange={(e) => setRemainingCredits(e.target.value)} />
          </div>
        </div>
        {!targetGpa || !remainingCredits ? (
          <p className="text-xs text-slate-400">{s('targetHint')}</p>
        ) : needed === null ? (
          <p className="text-xs text-slate-400">{s('targetZeroHint')}</p>
        ) : needed > 4.0 ? (
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2.5">
            {s('targetUnreachable').replace('{needed}', needed.toFixed(2)).replace('{credits}', String(num(remainingCredits)))}
          </div>
        ) : needed <= 0 ? (
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl px-3 py-2.5">
            {s('targetSecured').replace('{target}', num(targetGpa).toFixed(2))}
          </div>
        ) : (
          <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl px-3 py-2.5">
            {(() => {
              const parts = s('targetNeeded')
                .replace('{credits}', String(num(remainingCredits)))
                .replace('{target}', num(targetGpa).toFixed(2))
                .split('{needed}');
              return (
                <>
                  {parts[0]}
                  <span className="font-extrabold">{needed.toFixed(2)} GPA</span>
                  {parts[1]}
                </>
              );
            })()}
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
  const s = useStrings(STUDENT_STRINGS);
  const c = useStrings(COMMON);
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
    <StudentCard tool={tool} note={s('citeNote')}>
      <div className="flex flex-wrap gap-2">
        {(['book', 'journal', 'website'] as const).map((t) => (
          <button key={t} type="button" className={tabCls(type === t)} onClick={() => setType(t)}>
            {t === 'book' ? s('sourceBook') : t === 'journal' ? s('sourceJournal') : s('sourceWebsite')}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <OptLabel>{s('authors')}</OptLabel>
        {authors.map((a, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
            <input className={inputCls} placeholder={s('firstName')} value={a.first} onChange={(e) => updateAuthor(i, { first: e.target.value })} />
            <input className={inputCls} placeholder={s('lastName')} value={a.last} onChange={(e) => updateAuthor(i, { last: e.target.value })} />
            <button
              type="button"
              aria-label={s('removeAuthor')}
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
          <Plus className="w-3.5 h-3.5" /> {s('addAuthor')}
        </button>
      </div>

      <div className="grid sm:grid-cols-[140px_1fr] gap-3">
        <div>
          <OptLabel>{s('year')}</OptLabel>
          <input className={inputCls} placeholder="2023" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div>
          <OptLabel>{type === 'journal' ? s('articleTitle') : s('titleLabel')}</OptLabel>
          <input className={inputCls} placeholder={s('titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      {type === 'book' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('publisher')}</OptLabel>
            <input className={inputCls} placeholder="e.g. Pearson" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('editionOptional')}</OptLabel>
            <input className={inputCls} placeholder="e.g. 3rd ed." value={edition} onChange={(e) => setEdition(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'journal' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('journalName')}</OptLabel>
            <input className={inputCls} placeholder="e.g. Nature" value={journal} onChange={(e) => setJournal(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <OptLabel>{s('volume')}</OptLabel>
              <input className={inputCls} placeholder="12" value={volume} onChange={(e) => setVolume(e.target.value)} />
            </div>
            <div>
              <OptLabel>{s('issue')}</OptLabel>
              <input className={inputCls} placeholder="3" value={issue} onChange={(e) => setIssue(e.target.value)} />
            </div>
            <div>
              <OptLabel>{c('pages')}</OptLabel>
              <input className={inputCls} placeholder="45-61" value={pages} onChange={(e) => setPages(e.target.value)} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <OptLabel>{s('doiOptional')}</OptLabel>
            <input className={inputCls} dir="ltr" placeholder="10.1038/s41586-023-00001-1" value={doi} onChange={(e) => setDoi(e.target.value)} />
          </div>
        </div>
      )}

      {type === 'website' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <OptLabel>{s('siteName')}</OptLabel>
            <input className={inputCls} placeholder="e.g. BBC News" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div>
            <OptLabel>{s('dateAccessed')}</OptLabel>
            <input className={inputCls} placeholder="e.g. 20 October 2026" value={accessDate} onChange={(e) => setAccessDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <OptLabel>{s('urlLabel')}</OptLabel>
            <input className={inputCls} dir="ltr" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
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
          <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed break-words">{formatted(style) || s('citationEmpty')}</p>
          <CopyBtn text={formatted(style)} />
        </div>
      </div>

      <div className="space-y-2">
        <SectionTitle>{s('allStyles')}</SectionTitle>
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
        {s('citationNote')}
      </p>
    </StudentCard>
  );
};

// ---------------------------------------------------------------------------
// 3. Essay Word Counter
// ---------------------------------------------------------------------------

export const EssayWordCounter: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(STUDENT_STRINGS);
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');
  const stats = useMemo(() => analyzeEssay(text), [text]);

  const targetNum = num(target);
  const pct = targetNum > 0 ? Math.min(100, Math.round((stats.words / targetNum) * 100)) : 0;
  const diff = targetNum - stats.words;

  // Readability verdict band, recomputed from the Flesch score (lib returns an English string).
  const gradeKey =
    stats.flesch >= 90 ? 'gradeVeryEasy' : stats.flesch >= 80 ? 'gradeEasy' : stats.flesch >= 70 ? 'gradeFairlyEasy'
    : stats.flesch >= 60 ? 'gradeStandard' : stats.flesch >= 50 ? 'gradeFairlyDifficult'
    : stats.flesch >= 30 ? 'gradeDifficult' : 'gradeVeryDifficult';

  return (
    <StudentCard tool={tool} note={s('essayNote')}>
      <textarea
        className={`${inputCls} min-h-[180px] resize-y`}
        placeholder={s('essayPlaceholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="max-w-xs">
        <OptLabel>{s('targetWordCount')}</OptLabel>
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
            {s('progressOf').replace('{words}', String(stats.words)).replace('{target}', String(targetNum)).replace('{pct}', String(pct))}   {diff > 0 ? s('wordsToGo').replace('{n}', String(diff)) : diff < 0 ? s('wordsOver').replace('{n}', String(Math.abs(diff))) : s('exactlyOnTarget')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat label={s('words')} value={stats.words} />
        <Stat label={s('characters')} value={stats.characters} />
        <Stat label={s('charsNoSpaces')} value={stats.charactersNoSpaces} />
        <Stat label={s('sentences')} value={stats.sentences} />
        <Stat label={s('paragraphs')} value={stats.paragraphs} />
        <Stat label={s('readingTimeMin')} value={stats.readingMinutes} />
        <Stat label={s('speakingTimeMin')} value={stats.speakingMinutes} />
        <Stat label={s('longestSentence')} value={stats.longestSentenceWords} />
      </div>

      {stats.words > 0 && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
          Flesch Reading Ease: <span className="font-extrabold">{stats.flesch}</span>   {s(gradeKey)}
        </div>
      )}

      {stats.topWords.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>{s('mostUsedWords')}</SectionTitle>
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
  const s = useStrings(STUDENT_STRINGS);
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
      setImportError(s('importError'));
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
    <StudentCard tool={tool} note={s('flashNote')}>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabCls(mode === 'edit')} onClick={() => setMode('edit')}>{s('editCards')}</button>
        <button type="button" className={tabCls(mode === 'study')} onClick={() => setMode('study')}>{s('studyMode')}</button>
      </div>

      {mode === 'edit' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_36px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 px-0.5">
              <span>{s('colFront')}</span><span>{s('colBack')}</span><span />
            </div>
            {cards.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_36px] gap-2 items-center">
                <input className={inputCls} placeholder={s('frontPlaceholder')} value={c.front} onChange={(e) => updateCard(i, { front: e.target.value })} />
                <input className={inputCls} placeholder={s('backPlaceholder')} value={c.back} onChange={(e) => updateCard(i, { back: e.target.value })} />
                <button
                  type="button"
                  aria-label={s('removeCard')}
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
              <Plus className="w-3.5 h-3.5" /> {s('addCard')}
            </button>
          </div>

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <SectionTitle>{s('importCards')}</SectionTitle>
            <textarea
              className={`${inputCls} min-h-[90px] resize-y`}
              placeholder={s('importPlaceholder')}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            {importError && <ErrorBox message={importError} />}
            <PrimaryBtn type="button" onClick={doImport} disabled={!importText.trim()}>{s('importReplace')}</PrimaryBtn>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <DownloadBtn content={flashcardsToText(validCards)} filename="flashcards.txt" label={s('exportTxt')} />
            <DownloadBtn content={JSON.stringify(validCards, null, 2)} filename="flashcards.json" mime="application/json" label={s('exportJson')} />
            <span className="text-xs text-slate-400 self-center">{s(validCards.length === 1 ? 'cardsCountOne' : 'cardsCountMany').replace('{n}', String(validCards.length))}</span>
          </div>
        </div>
      )}

      {mode === 'study' && (
        <div className="space-y-4">
          {validCards.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{s('deckEmpty')}</p>
          ) : finished ? (
            <div className="space-y-3 text-center py-4">
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{s('deckFinished')}</p>
              <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                <Stat label={s('knowIt')} value={known} />
                <Stat label={s('stillLearning')} value={learning} />
              </div>
              <PrimaryBtn type="button" onClick={() => { setPos(0); setFlipped(false); setKnown(0); setLearning(0); }}>
                <RotateCcw className="w-4 h-4" /> {s('studyAgain')}
              </PrimaryBtn>
            </div>
          ) : current ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 text-center">{s('cardProgress').replace('{n}', String(Math.min(pos + 1, order.length))).replace('{total}', String(order.length))}</p>
              <button
                type="button"
                onClick={() => setFlipped((f) => !f)}
                className={`w-full min-h-[180px] rounded-2xl border-2 px-6 py-8 text-center transition-colors ${
                  flipped
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-teal-400'
                }`}
              >
                <span className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{flipped ? s('answerLabel') : s('questionFlip')}</span>
                <span className="block text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{flipped ? current.back : current.front}</span>
              </button>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={pos === 0}
                  onClick={() => { setPos((p) => Math.max(0, p - 1)); setFlipped(false); }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rtl:-scale-x-100" /> {s('prev')}
                </button>
                <button
                  type="button"
                  disabled={pos >= order.length - 1}
                  onClick={() => { setPos((p) => Math.min(order.length - 1, p + 1)); setFlipped(false); }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                >
                  {s('next')} <ChevronRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={shuffle}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  <Shuffle className="w-3.5 h-3.5" /> {s('shuffle')}
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => mark(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                >
                  {s('stillLearningBtn').replace('{n}', String(learning))}
                </button>
                <button
                  type="button"
                  onClick={() => mark(true)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {s('knowItBtn').replace('{n}', String(known))}
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

const REST_DAY_VALUES = ['-1', '0', '1', '2', '3', '4', '5', '6'];
const REST_DAY_KEYS = ['restNone', 'weekdaySunday', 'weekdayMonday', 'weekdayTuesday', 'weekdayWednesday', 'weekdayThursday', 'weekdayFriday', 'weekdaySaturday'];

export const StudyPlanner: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(STUDENT_STRINGS);
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
      setError(s('errExamAfterStart'));
      setPlan(null);
      return;
    }
    if (topics.length === 0) {
      setError(s('errAddTopic'));
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

  const kindLabel = (kind: string) => (kind === 'study' ? s('kindStudy') : kind === 'revision' ? s('kindRevision') : s('kindRest'));
  const weekdayLabel = (name: string) => (WEEKDAY_KEYS[name] ? s(WEEKDAY_KEYS[name]) : name);

  const planText = plan
    ? plan.map((d) => `${d.date} (${weekdayLabel(d.weekday)})   ${kindLabel(d.kind).toUpperCase()}\n${d.items.map((i) => `  - ${i}`).join('\n') || `  - ${s('planRestLine')}`}`).join('\n\n')
    : '';

  const kindChip = (kind: string) =>
    kind === 'study'
      ? 'bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-800'
      : kind === 'revision'
        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600';

  return (
    <StudentCard tool={tool} note={s('planNote')}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <OptLabel>{s('startDate')}</OptLabel>
          <input className={inputCls} type="date" value={startISO} onChange={(e) => setStartISO(e.target.value)} />
        </div>
        <div>
          <OptLabel>{s('examDate')}</OptLabel>
          <input className={inputCls} type="date" value={examISO} onChange={(e) => setExamISO(e.target.value)} />
        </div>
        <div>
          <OptLabel>{s('weeklyRestDay')}</OptLabel>
          <OptSelect value={restDay} onChange={(e) => setRestDay(e.target.value)}>
            {REST_DAY_VALUES.map((v, i) => (
              <option key={v} value={v}>{s(REST_DAY_KEYS[i])}</option>
            ))}
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('revisionDaysLabel')}</OptLabel>
          <input className={inputCls} type="number" min="0" step="1" value={revisionDays} onChange={(e) => setRevisionDays(e.target.value)} />
        </div>
      </div>
      <div>
        <OptLabel>{s('topicsLabel')}</OptLabel>
        <textarea
          className={`${inputCls} min-h-[110px] resize-y`}
          placeholder={'Algebra basics\nCell biology\nWorld War II causes'}
          value={topicsText}
          onChange={(e) => setTopicsText(e.target.value)}
        />
      </div>
      {error && <ErrorBox message={error} />}
      <div className="flex flex-wrap gap-2 items-center">
        <PrimaryBtn type="button" onClick={generate}>{s('generatePlan')}</PrimaryBtn>
        {plan && <DownloadBtn content={planText} filename="study-plan.txt" label={s('downloadPlan')} />}
      </div>

      {plan && (
        <div className="space-y-2">
          {plan.map((d) => (
            <div key={d.date} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{d.date}</span>
                <span className="text-xs text-slate-400">{weekdayLabel(d.weekday)}</span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${kindChip(d.kind)}`}>
                  {kindLabel(d.kind)}
                </span>
              </div>
              {d.items.length > 0 ? (
                <ul className="list-disc ps-5 space-y-0.5 text-sm text-slate-600 dark:text-slate-300">
                  {d.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">{s('planRestText')}</p>
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
  const s = useStrings(STUDENT_STRINGS);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ChemElement>(() => ELEMENTS.find((e) => e.n === 26) ?? ELEMENTS[0]);

  const q = query.trim().toLowerCase();
  const matches = (el: ChemElement) =>
    !q || el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q) || String(el.n) === q;

  const byNumber = (n: number) => ELEMENTS.find((e) => e.n === n);

  return (
    <StudentCard tool={tool} note={s('ptNote')}>
      <div className="max-w-sm">
        <OptLabel>{s('ptSearchLabel')}</OptLabel>
        <input className={inputCls} placeholder="e.g. iron, Fe, 26" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CAT_KEYS) as ElementCategory[]).map((cat) => (
          <span key={cat} className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${CATEGORY_STYLES[cat]}`}>
            {s(CAT_KEYS[cat])}
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
            <span className="text-[8px] truncate w-full text-center">{s('lanthanidesPlural')}</span>
          </div>
          <div
            className={`rounded-md border flex flex-col items-center justify-center p-1 leading-tight ${CATEGORY_STYLES.actinide}`}
            style={{ gridColumn: 3, gridRow: 7 }}
          >
            <span className="text-[10px] font-extrabold">89–103</span>
            <span className="text-[8px] truncate w-full text-center">{s('actinidesPlural')}</span>
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
            <span className="text-[10px] font-semibold self-start ps-2">{selected.n}</span>
            <span className="text-3xl font-extrabold leading-none">{selected.symbol}</span>
            <span className="text-[9px] mt-0.5">{selected.mass}</span>
          </div>
          <div className="flex-1 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{selected.name}</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={s('prevElement')}
                  disabled={selected.n <= 1}
                  onClick={() => { const prev = byNumber(selected.n - 1); if (prev) setSelected(prev); }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 rtl:-scale-x-100" />
                </button>
                <button
                  type="button"
                  aria-label={s('nextElement')}
                  disabled={selected.n >= 118}
                  onClick={() => { const next = byNumber(selected.n + 1); if (next) setSelected(next); }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 rtl:-scale-x-100" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Stat label={s('atomicNumber')} value={selected.n} />
              <Stat label={s('atomicMass')} value={selected.mass} />
              <Stat label={s('groupLabel')} value={selected.period >= 9 ? 'f-block' : selected.group} />
              <Stat label={s('periodLabel')} value={selected.period >= 9 ? (selected.period === 9 ? 6 : 7) : selected.period} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {s('categoryLabel')}: <span className="font-bold text-slate-700 dark:text-slate-200">{s(CAT_KEYS[selected.category])}</span>
              {selected.period >= 9 ? s('fBlockShown') : ''}
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

export const EquationSolver: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  const s = useStrings(STUDENT_STRINGS);
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
    <ol dir="ltr" className="list-decimal ps-5 space-y-1 text-sm text-slate-600 dark:text-slate-300">
      {steps.map((step, i) => (
        <li key={i}>{step}</li>
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
    <StudentCard tool={tool} note={s('eqNote')}>
      <div className="space-y-3">
        <SectionTitle><span dir="ltr">{s('quadTitle')}</span></SectionTitle>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {coefInput(qa, setQa, 'a')}
          {coefInput(qb, setQb, 'b')}
          {coefInput(qc, setQc, 'c')}
        </div>
        <p dir="ltr" className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-start">
          {num(qa)}x² + {num(qb)}x + {num(qc)} = 0
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-md">
          <Stat label={s('discriminant')} value={Math.round(quad.discriminant * 1e6) / 1e6} />
          <Stat label={s('typeLabel')} value={QUAD_KIND_KEYS[quad.kind] ? s(QUAD_KIND_KEYS[quad.kind]) : quad.kind} />
        </div>
        {quad.x1 !== undefined && (
          <div dir="ltr" className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-sm font-bold text-teal-800 dark:text-teal-200 text-left">
            x₁ = {quad.x1}{quad.x2 !== undefined ? `   ·   x₂ = ${quad.x2}` : ''}
          </div>
        )}
        {stepsList(quad.steps)}
      </div>

      <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
        <SectionTitle><span dir="ltr">{s('linTitle')}</span></SectionTitle>
        <div className="grid grid-cols-4 gap-3 max-w-lg">
          {coefInput(la, setLa, 'a')}
          {coefInput(lb, setLb, 'b')}
          {coefInput(lc, setLc, 'c')}
          {coefInput(ld, setLd, 'd')}
        </div>
        <p dir="ltr" className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-start">
          {num(la)}x + {num(lb)} = {num(lc)}x + {num(ld)}
        </p>
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-4 py-3 text-sm font-bold text-teal-800 dark:text-teal-200">
          {lin.kind === 'one' && <span dir="ltr">x = {lin.x}</span>}
          {lin.kind === 'none' && s('linNoSolution')}
          {lin.kind === 'infinite' && s('linInfinite')}
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
  const s = useStrings(STUDENT_STRINGS);
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
      'Use EXACTLY this format for every question and nothing else   no introduction, no explanations, no extra text:',
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
    <StudentCard tool={tool} note={s('quizNote')}>
      {!keyReady && <MissingKeyNotice />}
      <div>
        <OptLabel>{s('studyMaterialLabel')}</OptLabel>
        <AiTextarea
          rows={8}
          placeholder={s('quizMaterialPlaceholder')}
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          disabled={!keyReady}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <div>
          <OptLabel>{s('questionsLabel')}</OptLabel>
          <OptSelect value={count} onChange={(e) => setCount(e.target.value)} disabled={!keyReady}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </OptSelect>
        </div>
        <div>
          <OptLabel>{s('difficultyLabel')}</OptLabel>
          <OptSelect value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={!keyReady}>
            <option value="Easy">{s('diffEasy')}</option>
            <option value="Medium">{s('diffMedium')}</option>
            <option value="Hard">{s('diffHard')}</option>
          </OptSelect>
        </div>
      </div>
      <PrimaryBtn type="button" onClick={generate} disabled={busy || !keyReady || !material.trim()}>
        {busy ? s('generating') : s('generateQuiz')}
      </PrimaryBtn>
      {error && <ErrorBox message={error} />}

      {parseFailed && (
        <div className="space-y-2">
          <ErrorBox message={s('parseFailedMsg')} />
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
                {s('pctCorrect').replace('{pct}', String(Math.round((score / questions.length) * 100)))}
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
                        className={`w-full text-start px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${cls}`}
                      >
                        {letter}) {opt}
                      </button>
                    );
                  })}
                </div>
                {checked && (
                  <p className={`text-xs font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isCorrect
                      ? s('correctLabel')
                      : s('wrongCorrect').replace('{letter}', q.answer).replace('{option}', q.options[LETTERS.indexOf(q.answer)])}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            {!checked ? (
              <PrimaryBtn type="button" onClick={() => setChecked(true)}>{s('checkAnswers')}</PrimaryBtn>
            ) : (
              <PrimaryBtn
                type="button"
                onClick={() => { setAnswers({}); setChecked(false); }}
              >
                <RotateCcw className="w-4 h-4" /> {s('retakeQuiz')}
              </PrimaryBtn>
            )}
          </div>
        </div>
      )}
    </StudentCard>
  );
};
