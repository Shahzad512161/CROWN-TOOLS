/**
 * Pure helpers for the Student & Everyday Tools suite. Deterministic and
 * unit-testable — no DOM, no network. All date math is done in UTC on
 * 'YYYY-MM-DD' strings to avoid timezone drift.
 */

// ---------------------------------------------------------------------------
// GPA
// ---------------------------------------------------------------------------

export interface GradeScaleEntry {
  grade: string;
  points: number;
}

export const GRADE_SCALES: Record<string, { label: string; entries: GradeScaleEntry[] }> = {
  standard: {
    label: 'Standard 4.0',
    entries: [
      { grade: 'A', points: 4.0 }, { grade: 'B', points: 3.0 }, { grade: 'C', points: 2.0 },
      { grade: 'D', points: 1.0 }, { grade: 'F', points: 0.0 },
    ],
  },
  plusminus: {
    label: 'Plus / Minus 4.0',
    entries: [
      { grade: 'A+', points: 4.0 }, { grade: 'A', points: 4.0 }, { grade: 'A-', points: 3.7 },
      { grade: 'B+', points: 3.3 }, { grade: 'B', points: 3.0 }, { grade: 'B-', points: 2.7 },
      { grade: 'C+', points: 2.3 }, { grade: 'C', points: 2.0 }, { grade: 'C-', points: 1.7 },
      { grade: 'D+', points: 1.3 }, { grade: 'D', points: 1.0 }, { grade: 'D-', points: 0.7 },
      { grade: 'F', points: 0.0 },
    ],
  },
};

export interface CourseRow {
  grade: string;
  credits: number;
}

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  qualityPoints: number;
  counted: number;
}

export function computeGpa(courses: CourseRow[], scaleId: string): GpaResult {
  const scale = GRADE_SCALES[scaleId] ?? GRADE_SCALES.standard;
  const points = new Map(scale.entries.map((e) => [e.grade, e.points]));
  let qualityPoints = 0;
  let totalCredits = 0;
  let counted = 0;
  for (const c of courses) {
    const p = points.get(c.grade);
    if (p === undefined || !(c.credits > 0)) continue;
    qualityPoints += p * c.credits;
    totalCredits += c.credits;
    counted++;
  }
  return {
    gpa: totalCredits > 0 ? qualityPoints / totalCredits : 0,
    totalCredits,
    qualityPoints,
    counted,
  };
}

/** Combine a previous CGPA with new semester results. */
export function combineCgpa(prevGpa: number, prevCredits: number, semesters: GpaResult[]): GpaResult {
  let qualityPoints = prevGpa * prevCredits;
  let totalCredits = prevCredits;
  let counted = 0;
  for (const s of semesters) {
    qualityPoints += s.qualityPoints;
    totalCredits += s.totalCredits;
    counted += s.counted;
  }
  return {
    gpa: totalCredits > 0 ? qualityPoints / totalCredits : 0,
    totalCredits,
    qualityPoints,
    counted,
  };
}

/** GPA needed in the remaining credits to hit a target CGPA (null if impossible). */
export function neededGpa(currentGpa: number, currentCredits: number, targetGpa: number, remainingCredits: number): number | null {
  if (remainingCredits <= 0) return null;
  const needed = (targetGpa * (currentCredits + remainingCredits) - currentGpa * currentCredits) / remainingCredits;
  return Math.round(needed * 100) / 100;
}

// ---------------------------------------------------------------------------
// Citations (APA 7, MLA 9, Chicago 17 author-date/bibliography, Harvard)
// ---------------------------------------------------------------------------

export interface CitationAuthor {
  first: string;
  last: string;
}

export interface CitationInput {
  type: 'book' | 'journal' | 'website';
  authors: CitationAuthor[];
  year: string;
  title: string;
  // book
  publisher?: string;
  edition?: string;
  // journal
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  // website
  siteName?: string;
  url?: string;
  accessDate?: string;
}

const initials = (first: string) =>
  first
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + '.')
    .join(' ');

function apaAuthors(authors: CitationAuthor[]): string {
  const list = authors.map((a) => `${a.last}, ${initials(a.first)}`);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join(', ') + ', & ' + list[list.length - 1];
}

function mlaAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return '';
  const first = `${authors[0].last}, ${authors[0].first}`;
  if (authors.length === 1) return first;
  if (authors.length === 2) return `${first}, and ${authors[1].first} ${authors[1].last}`;
  return `${first}, et al`;
}

function chicagoAuthors(authors: CitationAuthor[]): string {
  const list = authors.map((a, i) => (i === 0 ? `${a.last}, ${a.first}` : `${a.first} ${a.last}`));
  if (list.length <= 1) return list[0] ?? '';
  return list.slice(0, -1).join(', ') + ', and ' + list[list.length - 1];
}

function harvardAuthors(authors: CitationAuthor[]): string {
  const list = authors.map((a) => `${a.last}, ${initials(a.first)}`);
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
}

function sentenceCase(title: string): string {
  const t = title.trim();
  if (!t) return t;
  const lower = t.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function formatCitation(input: CitationInput, style: 'apa' | 'mla' | 'chicago' | 'harvard'): string {
  const year = input.year.trim() || 'n.d.';
  if (style === 'apa') {
    const authors = apaAuthors(input.authors);
    const head = authors ? `${authors} (${year}). ` : `(${year}). `;
    if (input.type === 'book') {
      return `${head}${sentenceCase(input.title)}${input.edition ? ` (${input.edition})` : ''}. ${input.publisher ?? ''}`.trim();
    }
    if (input.type === 'journal') {
      const doi = input.doi ? ` https://doi.org/${input.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';
      return `${head}${sentenceCase(input.title)}. ${input.journal ?? ''}, ${input.volume ?? ''}${input.issue ? `(${input.issue})` : ''}, ${input.pages ?? ''}.${doi}`;
    }
    return `${head}${sentenceCase(input.title)}. ${input.siteName ?? ''}. ${input.url ?? ''}`.trim();
  }
  if (style === 'mla') {
    const authors = mlaAuthors(input.authors);
    const head = authors ? `${authors}. ` : '';
    if (input.type === 'book') {
      return `${head}"${input.title}." ${input.publisher ?? ''}, ${year}.`;
    }
    if (input.type === 'journal') {
      return `${head}"${input.title}." ${input.journal ?? ''}, vol. ${input.volume ?? ''}, no. ${input.issue ?? ''}, ${year}, pp. ${input.pages ?? ''}.`;
    }
    return `${head}"${input.title}." ${input.siteName ?? ''}, ${year}, ${input.url ?? ''}. Accessed ${input.accessDate ?? ''}.`;
  }
  if (style === 'chicago') {
    const authors = chicagoAuthors(input.authors);
    const head = authors ? `${authors}. ` : '';
    if (input.type === 'book') {
      return `${head}${year}. ${input.title}. ${input.publisher ?? ''}.`;
    }
    if (input.type === 'journal') {
      const doi = input.doi ? ` https://doi.org/${input.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';
      return `${head}${year}. "${input.title}." ${input.journal ?? ''} ${input.volume ?? ''}${input.issue ? ` (${input.issue})` : ''}: ${input.pages ?? ''}.${doi}`;
    }
    return `${head}${year}. "${input.title}." ${input.siteName ?? ''}. ${input.url ?? ''}.`;
  }
  // Harvard
  const authors = harvardAuthors(input.authors);
  const head = authors ? `${authors} (${year}) ` : `(${year}) `;
  if (input.type === 'book') {
    return `${head}${input.title}${input.edition ? `, ${input.edition}` : ''}. ${input.publisher ?? ''}.`;
  }
  if (input.type === 'journal') {
    return `${head}'${input.title}', ${input.journal ?? ''}, ${input.volume ?? ''}(${input.issue ?? ''}), pp. ${input.pages ?? ''}.`;
  }
  return `${head}${input.title}. Available at: ${input.url ?? ''} (Accessed: ${input.accessDate ?? ''}).`;
}

// ---------------------------------------------------------------------------
// Essay analysis
// ---------------------------------------------------------------------------

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/e$/, '').match(/[aeiouy]+/g);
  return Math.max(1, groups ? groups.length : 1);
}

export interface EssayStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  speakingMinutes: number;
  flesch: number;
  gradeLevel: string;
  longestSentenceWords: number;
  topWords: { word: string; count: number }[];
}

const STOP_WORDS = new Set('the of and a an in is it you that he was for on are as with his they i at be this have from or one had by word but not what all were we when your can said there use each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part'.split(' '));

export function analyzeEssay(text: string): EssayStats {
  const words = text.match(/\S+/g) ?? [];
  const wordCount = words.length;
  const sentences = (text.match(/[.!?]+(\s|$)/g) ?? []).length || (wordCount > 0 ? 1 : 0);
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const flesch =
    wordCount > 0 && sentences > 0
      ? 206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount)
      : 0;
  const sentenceTexts = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const longestSentenceWords = sentenceTexts.reduce((max, s) => Math.max(max, (s.match(/\S+/g) ?? []).length), 0);
  const freq = new Map<string, number>();
  for (const w of words) {
    const key = w.toLowerCase().replace(/[^a-z0-9']/g, '');
    if (key.length < 3 || STOP_WORDS.has(key)) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  const topWords = [...freq.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const gradeLevel =
    flesch >= 90 ? 'Very easy (grade 5)' : flesch >= 80 ? 'Easy (grade 6)' : flesch >= 70 ? 'Fairly easy (grade 7)'
    : flesch >= 60 ? 'Standard (grades 8–9)' : flesch >= 50 ? 'Fairly difficult (grades 10–12)'
    : flesch >= 30 ? 'Difficult (college)' : 'Very difficult (graduate)';
  return {
    words: wordCount,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences,
    paragraphs,
    readingMinutes: Math.round((wordCount / 200) * 10) / 10,
    speakingMinutes: Math.round((wordCount / 130) * 10) / 10,
    flesch: Math.round(flesch),
    gradeLevel,
    longestSentenceWords,
    topWords,
  };
}

// ---------------------------------------------------------------------------
// Flashcards
// ---------------------------------------------------------------------------

export interface Flashcard {
  front: string;
  back: string;
}

/** Parse "front :: back" lines (also accepts tab-separated lines). */
export function parseFlashcardText(text: string): Flashcard[] {
  const out: Flashcard[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const sep = line.includes('::') ? '::' : line.includes('\t') ? '\t' : null;
    if (!sep) continue;
    const idx = line.indexOf(sep);
    const front = line.slice(0, idx).trim();
    const back = line.slice(idx + sep.length).trim();
    if (front && back) out.push({ front, back });
  }
  return out;
}

export function flashcardsToText(cards: Flashcard[]): string {
  return cards.map((c) => `${c.front} :: ${c.back}`).join('\n');
}

// ---------------------------------------------------------------------------
// Study plan
// ---------------------------------------------------------------------------

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

function daysBetweenISO(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000);
}

export interface StudyDay {
  date: string;
  weekday: string;
  items: string[];
  kind: 'study' | 'revision' | 'rest';
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Build a study plan: topics rotate across study days, Sundays (or the chosen
 * rest weekday) are rest days, and the final stretch before the exam is
 * reserved for revision of all topics.
 */
export function buildStudyPlan(opts: {
  startISO: string;
  examISO: string;
  topics: string[];
  restWeekday?: number; // 0=Sunday
  revisionDays?: number;
}): StudyDay[] {
  const restWeekday = opts.restWeekday ?? 0;
  const revisionDays = opts.revisionDays ?? 2;
  const topics = opts.topics.map((t) => t.trim()).filter(Boolean);
  const total = daysBetweenISO(opts.startISO, opts.examISO);
  const days: StudyDay[] = [];
  let topicIdx = 0;
  for (let i = 0; i < total; i++) {
    const date = addDaysISO(opts.startISO, i);
    const weekday = WEEKDAYS[parseISODate(date).getUTCDay()];
    const daysLeft = total - i;
    if (parseISODate(date).getUTCDay() === restWeekday) {
      days.push({ date, weekday, items: [], kind: 'rest' });
    } else if (daysLeft <= revisionDays) {
      days.push({
        date,
        weekday,
        items: topics.length ? [`Revise all topics: ${topics.join(', ')}`, 'Do a timed past paper', 'Review your flashcards'] : ['Revise everything', 'Do a timed past paper'],
        kind: 'revision',
      });
    } else if (topics.length) {
      const first = topics[topicIdx % topics.length];
      const second = topics[(topicIdx + 1) % topics.length];
      topicIdx += 2;
      days.push({
        date,
        weekday,
        items: first === second ? [`Study: ${first}`, `Practice questions: ${first}`] : [`Study: ${first}`, `Study: ${second}`, `Quick review of yesterday's topics`],
        kind: 'study',
      });
    } else {
      days.push({ date, weekday, items: ['Study session'], kind: 'study' });
    }
  }
  return days;
}

// ---------------------------------------------------------------------------
// Periodic table (standard textbook data)
// ---------------------------------------------------------------------------

export type ElementCategory =
  | 'alkali' | 'alkaline' | 'transition' | 'post-transition' | 'metalloid'
  | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';

export interface ChemElement {
  n: number;
  symbol: string;
  name: string;
  mass: string;
  category: ElementCategory;
  group: number; // 1-18 display column (f-block: 4-18 on rows 9/10)
  period: number; // 1-7, f-block rows: 9 (lanthanides), 10 (actinides)
}

export const CATEGORY_LABELS: Record<ElementCategory, string> = {
  alkali: 'Alkali metal',
  alkaline: 'Alkaline earth metal',
  transition: 'Transition metal',
  'post-transition': 'Post-transition metal',
  metalloid: 'Metalloid',
  nonmetal: 'Reactive nonmetal',
  halogen: 'Halogen',
  noble: 'Noble gas',
  lanthanide: 'Lanthanide',
  actinide: 'Actinide',
};

// symbol|name|atomic number|mass|category|group|period
const ELEMENT_RAW = `
H|Hydrogen|1|1.008|nonmetal|1|1
He|Helium|2|4.003|noble|18|1
Li|Lithium|3|6.94|alkali|1|2
Be|Beryllium|4|9.012|alkaline|2|2
B|Boron|5|10.81|metalloid|13|2
C|Carbon|6|12.011|nonmetal|14|2
N|Nitrogen|7|14.007|nonmetal|15|2
O|Oxygen|8|15.999|nonmetal|16|2
F|Fluorine|9|18.998|halogen|17|2
Ne|Neon|10|20.180|noble|18|2
Na|Sodium|11|22.990|alkali|1|3
Mg|Magnesium|12|24.305|alkaline|2|3
Al|Aluminium|13|26.982|post-transition|13|3
Si|Silicon|14|28.085|metalloid|14|3
P|Phosphorus|15|30.974|nonmetal|15|3
S|Sulfur|16|32.06|nonmetal|16|3
Cl|Chlorine|17|35.45|halogen|17|3
Ar|Argon|18|39.948|noble|18|3
K|Potassium|19|39.098|alkali|1|4
Ca|Calcium|20|40.078|alkaline|2|4
Sc|Scandium|21|44.956|transition|3|4
Ti|Titanium|22|47.867|transition|4|4
V|Vanadium|23|50.942|transition|5|4
Cr|Chromium|24|51.996|transition|6|4
Mn|Manganese|25|54.938|transition|7|4
Fe|Iron|26|55.845|transition|8|4
Co|Cobalt|27|58.933|transition|9|4
Ni|Nickel|28|58.693|transition|10|4
Cu|Copper|29|63.546|transition|11|4
Zn|Zinc|30|65.38|transition|12|4
Ga|Gallium|31|69.723|post-transition|13|4
Ge|Germanium|32|72.630|metalloid|14|4
As|Arsenic|33|74.922|metalloid|15|4
Se|Selenium|34|78.971|nonmetal|16|4
Br|Bromine|35|79.904|halogen|17|4
Kr|Krypton|36|83.798|noble|18|4
Rb|Rubidium|37|85.468|alkali|1|5
Sr|Strontium|38|87.62|alkaline|2|5
Y|Yttrium|39|88.906|transition|3|5
Zr|Zirconium|40|91.224|transition|4|5
Nb|Niobium|41|92.906|transition|5|5
Mo|Molybdenum|42|95.95|transition|6|5
Tc|Technetium|43|(98)|transition|7|5
Ru|Ruthenium|44|101.07|transition|8|5
Rh|Rhodium|45|102.91|transition|9|5
Pd|Palladium|46|106.42|transition|10|5
Ag|Silver|47|107.87|transition|11|5
Cd|Cadmium|48|112.41|transition|12|5
In|Indium|49|114.82|post-transition|13|5
Sn|Tin|50|118.71|post-transition|14|5
Sb|Antimony|51|121.76|metalloid|15|5
Te|Tellurium|52|127.60|metalloid|16|5
I|Iodine|53|126.90|halogen|17|5
Xe|Xenon|54|131.29|noble|18|5
Cs|Caesium|55|132.91|alkali|1|6
Ba|Barium|56|137.33|alkaline|2|6
La|Lanthanum|57|138.91|lanthanide|4|9
Ce|Cerium|58|140.12|lanthanide|5|9
Pr|Praseodymium|59|140.91|lanthanide|6|9
Nd|Neodymium|60|144.24|lanthanide|7|9
Pm|Promethium|61|(145)|lanthanide|8|9
Sm|Samarium|62|150.36|lanthanide|9|9
Eu|Europium|63|151.96|lanthanide|10|9
Gd|Gadolinium|64|157.25|lanthanide|11|9
Tb|Terbium|65|158.93|lanthanide|12|9
Dy|Dysprosium|66|162.50|lanthanide|13|9
Ho|Holmium|67|164.93|lanthanide|14|9
Er|Erbium|68|167.26|lanthanide|15|9
Tm|Thulium|69|168.93|lanthanide|16|9
Yb|Ytterbium|70|173.05|lanthanide|17|9
Lu|Lutetium|71|174.97|lanthanide|18|9
Hf|Hafnium|72|178.49|transition|4|6
Ta|Tantalum|73|180.95|transition|5|6
W|Tungsten|74|183.84|transition|6|6
Re|Rhenium|75|186.21|transition|7|6
Os|Osmium|76|190.23|transition|8|6
Ir|Iridium|77|192.22|transition|9|6
Pt|Platinum|78|195.08|transition|10|6
Au|Gold|79|196.97|transition|11|6
Hg|Mercury|80|200.59|transition|12|6
Tl|Thallium|81|204.38|post-transition|13|6
Pb|Lead|82|207.2|post-transition|14|6
Bi|Bismuth|83|208.98|post-transition|15|6
Po|Polonium|84|(209)|post-transition|16|6
At|Astatine|85|(210)|halogen|17|6
Rn|Radon|86|(222)|noble|18|6
Fr|Francium|87|(223)|alkali|1|7
Ra|Radium|88|(226)|alkaline|2|7
Ac|Actinium|89|(227)|actinide|4|10
Th|Thorium|90|232.04|actinide|5|10
Pa|Protactinium|91|231.04|actinide|6|10
U|Uranium|92|238.03|actinide|7|10
Np|Neptunium|93|(237)|actinide|8|10
Pu|Plutonium|94|(244)|actinide|9|10
Am|Americium|95|(243)|actinide|10|10
Cm|Curium|96|(247)|actinide|11|10
Bk|Berkelium|97|(247)|actinide|12|10
Cf|Californium|98|(251)|actinide|13|10
Es|Einsteinium|99|(252)|actinide|14|10
Fm|Fermium|100|(257)|actinide|15|10
Md|Mendelevium|101|(258)|actinide|16|10
No|Nobelium|102|(259)|actinide|17|10
Lr|Lawrencium|103|(266)|actinide|18|10
Rf|Rutherfordium|104|(267)|transition|4|7
Db|Dubnium|105|(268)|transition|5|7
Sg|Seaborgium|106|(269)|transition|6|7
Bh|Bohrium|107|(270)|transition|7|7
Hs|Hassium|108|(277)|transition|8|7
Mt|Meitnerium|109|(278)|transition|9|7
Ds|Darmstadtium|110|(281)|transition|10|7
Rg|Roentgenium|111|(282)|transition|11|7
Cn|Copernicium|112|(285)|transition|12|7
Nh|Nihonium|113|(286)|post-transition|13|7
Fl|Flerovium|114|(289)|post-transition|14|7
Mc|Moscovium|115|(290)|post-transition|15|7
Lv|Livermorium|116|(293)|post-transition|16|7
Ts|Tennessine|117|(294)|halogen|17|7
Og|Oganesson|118|(294)|noble|18|7
`;

export const ELEMENTS: ChemElement[] = ELEMENT_RAW.trim().split('\n').map((line) => {
  const [symbol, name, n, mass, category, group, period] = line.split('|');
  return {
    symbol,
    name,
    n: Number(n),
    mass,
    category: category as ElementCategory,
    group: Number(group),
    period: Number(period),
  };
});

// ---------------------------------------------------------------------------
// Equation solver
// ---------------------------------------------------------------------------

export function fmtNum(x: number): string {
  if (!Number.isFinite(x)) return String(x);
  const rounded = Math.round(x * 1e6) / 1e6;
  return String(rounded);
}

export interface QuadraticResult {
  discriminant: number;
  kind: 'two-real' | 'one-real' | 'complex' | 'linear' | 'invalid';
  x1?: string;
  x2?: string;
  steps: string[];
}

/** Solve ax² + bx + c = 0 with worked steps. */
export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  const steps: string[] = [];
  if (a === 0) {
    if (b === 0) return { discriminant: 0, kind: 'invalid', steps: ['This is not an equation in x (a and b are both 0).'] };
    const x = -c / b;
    steps.push(`a = 0, so this is a linear equation: ${fmtNum(b)}x + ${fmtNum(c)} = 0`);
    steps.push(`x = ${fmtNum(-c)} / ${fmtNum(b)} = ${fmtNum(x)}`);
    return { discriminant: 0, kind: 'linear', x1: fmtNum(x), steps };
  }
  const d = b * b - 4 * a * c;
  steps.push(`Identify a = ${fmtNum(a)}, b = ${fmtNum(b)}, c = ${fmtNum(c)}`);
  steps.push(`Discriminant D = b² − 4ac = (${fmtNum(b)})² − 4(${fmtNum(a)})(${fmtNum(c)}) = ${fmtNum(d)}`);
  if (d > 0) {
    const sqrtD = Math.sqrt(d);
    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);
    steps.push(`D > 0, so there are two real roots. √D = ${fmtNum(sqrtD)}`);
    steps.push(`x = (−b ± √D) / 2a`);
    steps.push(`x₁ = (${fmtNum(-b)} + ${fmtNum(sqrtD)}) / ${fmtNum(2 * a)} = ${fmtNum(x1)}`);
    steps.push(`x₂ = (${fmtNum(-b)} − ${fmtNum(sqrtD)}) / ${fmtNum(2 * a)} = ${fmtNum(x2)}`);
    return { discriminant: d, kind: 'two-real', x1: fmtNum(x1), x2: fmtNum(x2), steps };
  }
  if (d === 0) {
    const x = -b / (2 * a);
    steps.push(`D = 0, so there is one repeated real root.`);
    steps.push(`x = −b / 2a = ${fmtNum(-b)} / ${fmtNum(2 * a)} = ${fmtNum(x)}`);
    return { discriminant: d, kind: 'one-real', x1: fmtNum(x), steps };
  }
  const real = -b / (2 * a);
  const imag = Math.sqrt(-d) / Math.abs(2 * a);
  steps.push(`D < 0, so the roots are complex. √|D| = ${fmtNum(Math.sqrt(-d))}`);
  steps.push(`x = ${fmtNum(real)} ± ${fmtNum(imag)}i`);
  return {
    discriminant: d,
    kind: 'complex',
    x1: `${fmtNum(real)} + ${fmtNum(imag)}i`,
    x2: `${fmtNum(real)} − ${fmtNum(imag)}i`,
    steps,
  };
}

export interface LinearResult {
  kind: 'one' | 'none' | 'infinite';
  x?: string;
  steps: string[];
}

/** Solve ax + b = cx + d with worked steps. */
export function solveLinear(a: number, b: number, c: number, d: number): LinearResult {
  const steps: string[] = [];
  steps.push(`Start: ${fmtNum(a)}x + ${fmtNum(b)} = ${fmtNum(c)}x + ${fmtNum(d)}`);
  const left = a - c;
  const right = d - b;
  steps.push(`Collect x terms on the left and numbers on the right: ${fmtNum(left)}x = ${fmtNum(right)}`);
  if (left === 0) {
    if (right === 0) {
      steps.push('Both sides are identical — every value of x is a solution.');
      return { kind: 'infinite', steps };
    }
    steps.push('The x terms cancel but the numbers differ — no value of x can satisfy this.');
    return { kind: 'none', steps };
  }
  const x = right / left;
  steps.push(`Divide both sides by ${fmtNum(left)}: x = ${fmtNum(right)} / ${fmtNum(left)} = ${fmtNum(x)}`);
  return { kind: 'one', x: fmtNum(x), steps };
}

// ---------------------------------------------------------------------------
// Age & date calculators
// ---------------------------------------------------------------------------

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function zodiacSign(month: number, day: number): string {
  const table: [number, number, string][] = [
    [3, 21, 'Aries'], [4, 20, 'Taurus'], [5, 21, 'Gemini'], [6, 21, 'Cancer'],
    [7, 23, 'Leo'], [8, 23, 'Virgo'], [9, 23, 'Libra'], [10, 23, 'Scorpio'],
    [11, 22, 'Sagittarius'], [12, 22, 'Capricorn'], [1, 20, 'Aquarius'], [2, 19, 'Pisces'],
  ];
  // Walk from the latest start date backwards.
  const starts: [number, number, string][] = [
    [12, 22, 'Capricorn'], [11, 22, 'Sagittarius'], [10, 23, 'Scorpio'], [9, 23, 'Libra'],
    [8, 23, 'Virgo'], [7, 23, 'Leo'], [6, 21, 'Cancer'], [5, 21, 'Gemini'],
    [4, 20, 'Taurus'], [3, 21, 'Aries'], [2, 19, 'Pisces'], [1, 20, 'Aquarius'],
  ];
  void table;
  for (const [m, d, sign] of starts) {
    if (month > m || (month === m && day >= d)) return sign;
  }
  return 'Capricorn';
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  bornWeekday: string;
  zodiac: string;
  nextBirthdayISO: string;
  daysToNextBirthday: number;
}

export function computeAge(dobISO: string, todayISO: string): AgeResult {
  const dob = parseISODate(dobISO);
  const today = parseISODate(todayISO);
  let years = today.getUTCFullYear() - dob.getUTCFullYear();
  let months = today.getUTCMonth() - dob.getUTCMonth();
  let days = today.getUTCDate() - dob.getUTCDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = daysBetweenISO(dobISO, todayISO);
  // Next birthday
  let nextYear = today.getUTCFullYear();
  let next = new Date(Date.UTC(nextYear, dob.getUTCMonth(), dob.getUTCDate()));
  if (next.getTime() <= today.getTime()) {
    nextYear += 1;
    next = new Date(Date.UTC(nextYear, dob.getUTCMonth(), dob.getUTCDate()));
  }
  const nextISO = toISODate(next);
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalHours: totalDays * 24,
    bornWeekday: WEEKDAYS[dob.getUTCDay()],
    zodiac: zodiacSign(dob.getUTCMonth() + 1, dob.getUTCDate()),
    nextBirthdayISO: nextISO,
    daysToNextBirthday: daysBetweenISO(todayISO, nextISO),
  };
}

export function addDaysToDate(iso: string, days: number): { iso: string; weekday: string } {
  const out = addDaysISO(iso, days);
  return { iso: out, weekday: WEEKDAYS[parseISODate(out).getUTCDay()] };
}

export function dateDifference(aISO: string, bISO: string): { days: number; weeks: number; monthsApprox: number; yearsApprox: number } {
  const days = Math.abs(daysBetweenISO(aISO, bISO));
  return {
    days,
    weeks: Math.floor(days / 7),
    monthsApprox: Math.round((days / 30.44) * 10) / 10,
    yearsApprox: Math.round((days / 365.25) * 100) / 100,
  };
}

export function businessDaysBetween(aISO: string, bISO: string): number {
  const start = parseISODate(aISO <= bISO ? aISO : bISO);
  const end = parseISODate(aISO <= bISO ? bISO : aISO);
  let count = 0;
  const cur = new Date(start);
  while (cur.getTime() < end.getTime()) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Random generators (rng is injectable for tests)
// ---------------------------------------------------------------------------

export function randomInt(min: number, max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomInts(min: number, max: number, count: number, unique: boolean, rng: () => number = Math.random): number[] {
  if (unique) {
    const pool = new Set<number>();
    const range = max - min + 1;
    const target = Math.min(count, range);
    let guard = 0;
    while (pool.size < target && guard++ < 10000) pool.add(randomInt(min, max, rng));
    return [...pool];
  }
  return Array.from({ length: count }, () => randomInt(min, max, rng));
}

export function rollDice(sides: number, count: number, rng: () => number = Math.random): { rolls: number[]; total: number } {
  const rolls = Array.from({ length: count }, () => randomInt(1, sides, rng));
  return { rolls, total: rolls.reduce((a, b) => a + b, 0) };
}

// ---------------------------------------------------------------------------
// Love calculator (entertainment — deterministic name hash)
// ---------------------------------------------------------------------------

export interface LoveResult {
  score: number;
  label: string;
  message: string;
}

/**
 * A deterministic "for fun" score: the same two names always give the same
 * result. This is entertainment, not a real compatibility measure.
 */
export function loveScore(nameA: string, nameB: string): LoveResult {
  const a = nameA.trim().toLowerCase();
  const b = nameB.trim().toLowerCase();
  if (!a || !b) return { score: 0, label: 'Two names needed', message: 'Enter both names to calculate your (totally unscientific) score.' };
  const key = [a, b].sort().join('|');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const score = key ? 25 + (hash % 76) : 0; // 25–100 for any real pair
  if (score >= 90) return { score, label: 'Written in the stars', message: 'Off-the-charts chemistry — at least according to this very scientific* (*not scientific) calculator.' };
  if (score >= 75) return { score, label: 'Strong spark', message: 'Serious potential. The algorithm ships it.' };
  if (score >= 55) return { score, label: 'Promising', message: 'A solid match with room to grow — like most real relationships.' };
  if (score >= 40) return { score, label: 'Slow burn', message: 'Not instant fireworks, but slow burns often last the longest.' };
  return { score, label: 'Opposites attract?', message: 'The score is low, but this thing also thinks pineapple belongs on pizza. Trust yourselves, not the calculator.' };
}

// ---------------------------------------------------------------------------
// Typing test
// ---------------------------------------------------------------------------

export const TYPING_TEXTS: string[] = [
  'The quick brown fox jumps over the lazy dog. Practice makes progress, and a few minutes of focused typing every day will slowly turn careful keystrokes into fast, confident ones.',
  'In the middle of difficulty lies opportunity. The people who improve the fastest are rarely the most talented; they are the ones who show up, measure honestly, and keep going.',
  'A journey of a thousand miles begins with a single step. Type each word with care, keep your eyes on the text ahead, and let speed arrive as a side effect of accuracy.',
  'Technology works best when it stays invisible. Good tools feel like an extension of your hands: quiet, reliable, and ready the moment an idea appears.',
  'The library was quiet except for the soft sound of turning pages and the rain against the tall windows. She read the same paragraph twice, not because it was hard, but because it was beautiful.',
];

export interface TypingScore {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
}

export function scoreTyping(target: string, typed: string, seconds: number): TypingScore {
  let correct = 0;
  let incorrect = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === target[i]) correct++;
    else incorrect++;
  }
  const minutes = seconds / 60;
  const grossWords = typed.length / 5;
  const rawWpm = minutes > 0 ? grossWords / minutes : 0;
  const wpm = minutes > 0 ? (correct / 5) / minutes : 0;
  const accuracy = typed.length > 0 ? (correct / typed.length) * 100 : 100;
  return {
    wpm: Math.round(wpm),
    rawWpm: Math.round(rawWpm),
    accuracy: Math.round(accuracy * 10) / 10,
    correctChars: correct,
    incorrectChars: incorrect,
  };
}

// ---------------------------------------------------------------------------
// Handwriting layout
// ---------------------------------------------------------------------------

/** Greedy word wrap to a max number of characters per line. */
export function wrapTextLines(text: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (!line) {
        line = word;
      } else if ((line + ' ' + word).length <= maxChars) {
        line += ' ' + word;
      } else {
        out.push(line);
        line = word;
      }
    }
    if (line) out.push(line);
  }
  return out;
}
