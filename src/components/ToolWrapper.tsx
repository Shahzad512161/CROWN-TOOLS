import React, { useState } from 'react';
import { ToolItem, ALL_TOOLS, TOOLS_BY_SLUG } from '../lib/tools-data';
import { FAQSection } from './FAQSection';
import { SpaLink } from './SpaLink';
import { 
  ArrowLeft, ChevronRight, CheckCircle2, ShieldCheck, 
  Share2, Bookmark, BookOpen, Star, Sparkles, ExternalLink,
  Printer, Copy, Check
} from 'lucide-react';
import { SupportedLanguage, Translations, TRANSLATIONS } from '../lib/i18n';
import { localizedTool } from '../lib/tools-fr';
import { CHROME, localizedCategory } from '../lib/strings-chrome';
import { lookup } from '../lib/LangContext';
import { localizedOverview, localizedFaqs } from '../lib/tool-content';

// Tool implementations are lazy-loaded per suite (see ToolBody below) so a
// tool page only downloads the code for the one tool being opened.
import { TOOL_SUITE_MAP, PDF_SLUG_COMPONENT, SuiteId } from '../lib/tool-suites';
import { COMMON } from '../lib/LangContext';

// PDF/Word tools load per source-file group (the full PDF registry chunk
// alone would break the per-page weight budget).
const PDF_GROUP_LOADERS: Record<string, () => Promise<Record<string, ToolComp>>> = {
  PdfOrganizeTools: () => import('./tools/pdf/PdfOrganizeTools') as unknown as Promise<Record<string, ToolComp>>,
  PdfConvertTools: () => import('./tools/pdf/PdfConvertTools') as unknown as Promise<Record<string, ToolComp>>,
  PdfInteractiveTools: () => import('./tools/pdf/PdfInteractiveTools') as unknown as Promise<Record<string, ToolComp>>,
  PdfCompetitorToolsA: () => import('./tools/pdf/PdfCompetitorToolsA') as unknown as Promise<Record<string, ToolComp>>,
  PdfCompetitorToolsB: () => import('./tools/pdf/PdfCompetitorToolsB') as unknown as Promise<Record<string, ToolComp>>,
  WordToolsA: () => import('./tools/word/WordToolsA') as unknown as Promise<Record<string, ToolComp>>,
  WordToolsB: () => import('./tools/word/WordToolsB') as unknown as Promise<Record<string, ToolComp>>
};

type ToolComp = React.ComponentType<{ tool: ToolItem }>;

const SUITE_LOADERS: Record<SuiteId, () => Promise<Record<string, ToolComp>>> = {
  pdf: () => import('./tools/pdf').then((m) => m.PDF_TOOL_COMPONENTS),
  seo: () => import('./tools/seo').then((m) => m.SEO_TOOL_COMPONENTS),
  dev: () => import('./tools/dev').then((m) => m.DEV_TOOL_COMPONENTS),
  image: () => import('./tools/image').then((m) => m.IMAGE_TOOL_COMPONENTS),
  media: () => import('./tools/media').then((m) => m.MEDIA_TOOL_COMPONENTS),
  ai: () => import('./tools/ai').then((m) => m.AI_TOOL_COMPONENTS),
  social: () => import('./tools/social').then((m) => m.SOCIAL_TOOL_COMPONENTS),
  student: () => import('./tools/student').then((m) => m.STUDENT_TOOL_COMPONENTS)
};

const STANDALONE_LOADERS: Record<string, () => Promise<ToolComp>> = {
  'mortgage-calculator-usa': () => import('./tools/MortgageCalculator').then((m) => () => <m.MortgageCalculator />),
  'auto-insurance-calculator': () => import('./tools/AutoInsuranceCalculator').then((m) => () => <m.AutoInsuranceCalculator />),
  'loan-calculator-usa': () => import('./tools/LoanCalculator').then((m) => () => <m.LoanCalculator />),
  'tax-calculator-2026-usa': () => import('./tools/TaxCalculator').then((m) => () => <m.TaxCalculator />),
  'resume-builder-usa-format': () => import('./tools/ResumeBuilder').then((m) => () => <m.ResumeBuilder />),
  'invoice-generator-pro': () => import('./tools/InvoiceGenerator').then((m) => () => <m.InvoiceGenerator />),
  'live-currency-converter': () => import('./tools/CurrencyConverter').then((m) => () => <m.CurrencyConverter />),
  'pdf-to-word-converter': () => import('./tools/PdfToWordConverter').then((m) => () => <m.PdfToWordConverter />)
};

const MULTI_SLUGS = [
  'multi-calculator-all-in-one',
  'bmi-calorie-deficit-calculator',
  'bmi-calculator',
  'age-calculator',
  'scientific-calculator',
  'compound-interest-calculator',
  'tip-bill-splitter-calculator',
  'tip-calculator',
  'calorie-calculator'
];

/** Loads and renders only the component the open tool needs. */
const ToolBody: React.FC<{ tool: ToolItem; lang: SupportedLanguage }> = ({ tool, lang }) => {
  const [Comp, setComp] = useState<ToolComp | null>(null);
  React.useEffect(() => {
    let live = true;
    setComp(null);
    const load = async (): Promise<ToolComp> => {
      const suite = TOOL_SUITE_MAP[tool.slug];
      if (suite === 'pdf' && PDF_SLUG_COMPONENT[tool.slug]) {
        const info = PDF_SLUG_COMPONENT[tool.slug];
        const mod = await PDF_GROUP_LOADERS[info.group]();
        if (mod[info.name]) return mod[info.name];
      }
      if (suite) {
        const map = await SUITE_LOADERS[suite]();
        if (map[tool.slug]) return map[tool.slug];
      }
      if (STANDALONE_LOADERS[tool.slug]) return STANDALONE_LOADERS[tool.slug]();
      if (MULTI_SLUGS.includes(tool.slug)) {
        const m = await import('./tools/MultiCalculator');
        return () => <m.MultiCalculator toolSlug={tool.slug} />;
      }
      const g = await import('./tools/GenericToolEngine');
      return g.GenericToolEngine;
    };
    load()
      .then((C) => {
        if (live) setComp(() => C);
      })
      .catch(() => {
        if (live) setComp(() => () => null);
      });
    return () => {
      live = false;
    };
  }, [tool.slug]);

  if (!Comp) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true" aria-label={lookup(COMMON, lang, 'working')}>
        <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-1/3 rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }
  return <Comp tool={tool} />;
};

interface ToolWrapperProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateTool: (slug: string) => void;
  onNavigateBlogGuide: (slug: string) => void;
  t?: Translations;
  lang?: SupportedLanguage;
}

export const ToolWrapper: React.FC<ToolWrapperProps> = ({
  slug,
  onNavigateHome,
  onNavigateTool,
  onNavigateBlogGuide,
  t = TRANSLATIONS.en,
  lang = 'en'
}) => {
  const tool: ToolItem = TOOLS_BY_SLUG[slug] || ALL_TOOLS[0];
  const lt = localizedTool(tool, lang);
  const c = (k: string) => lookup(CHROME, lang, k);
  const catLabel = localizedCategory(tool.category, t);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Find 4 related tools in the same category
  const relatedTools = ALL_TOOLS
    .filter(item => item.category === tool.category && item.slug !== tool.slug)
    .slice(0, 4);

  // Prev/next chain in the same category (circular). Related tools only
  // ever link to the first 4 tools in a category, so without this chain
  // every tool past position 5 in its category is an orphan in the
  // crawled link graph, even once links are real <a> tags. With the
  // chain, every tool is reachable from every other tool in its category.
  const categoryTools = ALL_TOOLS.filter(item => item.category === tool.category);
  const categoryIndex = categoryTools.findIndex(item => item.slug === tool.slug);
  const prevTool = categoryTools.length > 1 ? categoryTools[(categoryIndex - 1 + categoryTools.length) % categoryTools.length] : null;
  const nextTool = categoryTools.length > 1 ? categoryTools[(categoryIndex + 1) % categoryTools.length] : null;

  // Render the corresponding unlocked tool (lazy-loaded per suite)
  const renderInteractiveTool = () => <ToolBody tool={tool} lang={lang} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs sticky top-[104px] z-30">
        <div className=" mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden whitespace-nowrap">
            <SpaLink
              href={`/${lang}`}
              onNavigate={onNavigateHome}
              className="flex shrink-0 items-center gap-1 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span className="hidden min-[400px]:inline">{c('crumbTools')}</span>
            </SpaLink>
            <ChevronRight className="hidden w-3 h-3 shrink-0 text-slate-400 rtl:rotate-180 sm:block" />
            <span className="hidden shrink-0 text-slate-500 dark:text-slate-400 sm:inline">{catLabel}</span>
            <ChevronRight className="hidden w-3 h-3 shrink-0 text-slate-400 sm:block" />
            <span className="min-w-0 font-bold text-slate-950 dark:text-white truncate">{lt.name}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Share / Copy URL */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
              title={c('shareTitle')}
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
              <span className="hidden sm:inline">{copiedLink ? c('copiedLink') : c('shareBtn')}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/60'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden min-[400px]:inline">{isBookmarked ? t.bookmarkedBtn : t.bookmarkBtn}</span>
            </button>

            {/* Unlocked & Verified Badge */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> {c('unlockedFreeBadge')}
            </span>
          </div>
        </div>
      </div>

      <div className=" mx-auto px-3 sm:px-6 lg:px-8 py-6">

        {/* Tool Header Meta Title & Tagline */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {catLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              ✓ {t.heroBadgeUnlocked}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              {c('instantBrowser')}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-display text-slate-950 dark:text-white">
            {lt.name}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-4xl">
            {lt.description}
          </p>
        </div>

        {/* 2-COLUMN MAIN CONTENT & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* LEFT 8/9 COLS: TOOL ITSELF + 150-WORD INTRO + FAQ SECTION */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* a) Tool itself at top (FULLY WORKING, 100% UNLOCKED - NO BLUR, NO LOCK) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {c('workspaceLabel')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {c('workspaceNote')}
                </span>
              </div>

              {/* Renders the actual working tool */}
              {renderInteractiveTool()}
            </div>

            {/* b) Below tool: 150-Word Short Intro / Comprehensive Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  {c('aboutHeading').replace('{name}', lt.name)}
                </h2>
                <span className="text-xs text-slate-400 font-medium">{c('overviewTag')}</span>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                <p>
                  {localizedOverview(tool, lang, lt.name)}
                </p>
                <p>
                  {c('overviewP2')}
                </p>
              </div>

              {/* d) Button: "📖 Read Complete Guide" linking to /blog/[tool-name] */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {c('guideTeaser')}
                </div>
                <SpaLink
                  href={`/${lang}/blog/${tool.slug}`}
                  onNavigate={() => onNavigateBlogGuide(tool.slug)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.readCompleteGuideBtn || 'Read Complete Guide'}</span>
                </SpaLink>
              </div>
            </div>

            {/* c) FAQSection Component with 4 FAQs and FAQ Schema JSON-LD */}
            <FAQSection toolName={lt.name} faqs={localizedFaqs(tool, lang, lt.name)} />

          </div>

          {/* RIGHT 4 COLS: SIDEBAR (QUICK SPECS & RELATED TOOLS) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Tool Trust & Safety Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {c('trustHeading')}
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{c('trust1')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{c('trust2')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{c('trust3')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{c('trust4')}</span>
                </li>
              </ul>
            </div>

            {/* Read Complete Guide Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-blue-200 dark:border-blue-800/60 p-5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                {c('guideCardTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                {c('guideCardText')}
              </p>
              <SpaLink
                href={`/${lang}/blog/${tool.slug}`}
                onNavigate={() => onNavigateBlogGuide(tool.slug)}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-center block"
              >
                {t.readCompleteGuideBtn}
              </SpaLink>
            </div>

            {/* Related Tools */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {c('relatedHeading').replace('{category}', catLabel)}
              </h3>
              <div className="space-y-2">
                {relatedTools.map(rt => { const rlt = localizedTool(rt, lang); return (
                  <SpaLink
                    key={rt.slug}
                    href={`/${lang}/tool/${rt.slug}`}
                    onNavigate={() => onNavigateTool(rt.slug)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer group block"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white transition-colors">
                      {rlt.name}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rlt.description}
                    </p>
                  </SpaLink>
                ); })}
              </div>
            </div>

            {/* Prev / Next tool in this category — the chain that ends
                orphan pages. Link text is the neighbouring tool's name,
                so no new translation strings are needed. */}
            {(prevTool || nextTool) && (
              <nav className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2" aria-label="More tools">
                {prevTool && (
                  <SpaLink
                    href={`/${lang}/tool/${prevTool.slug}`}
                    onNavigate={() => onNavigateTool(prevTool.slug)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <span aria-hidden="true">←</span>
                    <span className="min-w-0 truncate">{localizedTool(prevTool, lang).name}</span>
                  </SpaLink>
                )}
                {nextTool && (
                  <SpaLink
                    href={`/${lang}/tool/${nextTool.slug}`}
                    onNavigate={() => onNavigateTool(nextTool.slug)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <span className="min-w-0 truncate">{localizedTool(nextTool, lang).name}</span>
                    <span aria-hidden="true">→</span>
                  </SpaLink>
                )}
              </nav>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
