import React, { useState } from 'react';
import { ToolItem, ALL_TOOLS, TOOLS_BY_SLUG } from '../lib/tools-data';
import { FAQSection } from './FAQSection';
import { 
  ArrowLeft, ChevronRight, CheckCircle2, ShieldCheck, 
  Share2, Bookmark, BookOpen, Star, Sparkles, ExternalLink,
  Printer, Copy, Check
} from 'lucide-react';
import { Translations, TRANSLATIONS } from '../lib/i18n';

// Real Tool implementations
import { MortgageCalculator } from './tools/MortgageCalculator';
import { AutoInsuranceCalculator } from './tools/AutoInsuranceCalculator';
import { LoanCalculator } from './tools/LoanCalculator';
import { TaxCalculator } from './tools/TaxCalculator';
import { ResumeBuilder } from './tools/ResumeBuilder';
import { InvoiceGenerator } from './tools/InvoiceGenerator';
import { CurrencyConverter } from './tools/CurrencyConverter';
import { PdfToWordConverter } from './tools/PdfToWordConverter';
import { MultiCalculator } from './tools/MultiCalculator';
import { GenericToolEngine } from './tools/GenericToolEngine';
import { PDF_TOOL_COMPONENTS } from './tools/pdf';

interface ToolWrapperProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateTool: (slug: string) => void;
  onNavigateBlogGuide: (slug: string) => void;
  t?: Translations;
}

export const ToolWrapper: React.FC<ToolWrapperProps> = ({
  slug,
  onNavigateHome,
  onNavigateTool,
  onNavigateBlogGuide,
  t = TRANSLATIONS.en
}) => {
  const tool: ToolItem = TOOLS_BY_SLUG[slug] || ALL_TOOLS[0];
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

  // Render the corresponding unlocked tool
  const renderInteractiveTool = () => {
    // Real PDF suite (single registry — slug keys live next to the components)
    const PdfTool = PDF_TOOL_COMPONENTS[tool.slug];
    if (PdfTool) {
      return <PdfTool tool={tool} />;
    }
    switch (tool.slug) {
      case 'mortgage-calculator-usa':
        return <MortgageCalculator />;
      case 'auto-insurance-calculator':
        return <AutoInsuranceCalculator />;
      case 'loan-calculator-usa':
        return <LoanCalculator />;
      case 'tax-calculator-2026-usa':
        return <TaxCalculator />;
      case 'resume-builder-usa-format':
        return <ResumeBuilder />;
      case 'invoice-generator-pro':
        return <InvoiceGenerator />;
      case 'live-currency-converter':
        return <CurrencyConverter />;
      case 'pdf-to-word-converter':
        return <PdfToWordConverter />;
      case 'multi-calculator-all-in-one':
      case 'bmi-calorie-deficit-calculator':
      case 'bmi-calculator':
      case 'age-calculator':
      case 'scientific-calculator':
      case 'compound-interest-calculator':
      case 'tip-bill-splitter-calculator':
      case 'tip-calculator':
      case 'calorie-calculator':
        return <MultiCalculator toolSlug={tool.slug} />;
      default:
        return <GenericToolEngine tool={tool} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs sticky top-[104px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 hover:text-blue-600 font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>5000+ Tools</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">{tool.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-950 dark:text-white truncate">{tool.name}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Share / Copy URL */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
              title="Copy shareable link to this unlocked tool"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
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
              <span>{isBookmarked ? t.bookmarkedBtn : t.bookmarkBtn}</span>
            </button>

            {/* Unlocked & Verified Badge */}
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Unlocked & Free
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ========================================================================= */}
        {/* AD PLACEHOLDER 1: Header slot (Top of tool page) */}
        {/* ========================================================================= */}
        <div className="mb-6 p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 text-center">
          <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider px-2">
            <span>Google AdSense Header Unit</span>
            <span>Responsive 728x90 / Leaderboard</span>
          </div>
          <div className="h-14 sm:h-16 flex items-center justify-center text-xs text-slate-400 font-medium">
            (Ad Slot #1 • Above Unlocked Tool)
          </div>
        </div>

        {/* Tool Header Meta Title & Tagline */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {tool.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              ✓ 100% Unlocked • No Login Required
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Instant In-Browser Execution
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            {tool.name}
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-4xl">
            {tool.description}
          </p>
        </div>

        {/* 2-COLUMN MAIN CONTENT & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8/9 COLS: TOOL ITSELF + 150-WORD INTRO + FAQ SECTION */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* a) Tool itself at top (FULLY WORKING, 100% UNLOCKED - NO BLUR, NO LOCK) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Interactive Tool Workspace
                </span>
                <span className="text-[11px] text-slate-400">
                  Client-side • Zero Data Retention
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
                  About {tool.name} & How It Works
                </h2>
                <span className="text-xs text-slate-400 font-medium">150-Word Overview</span>
              </div>

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                <p>
                  {tool.overviewContent || (
                    `The Super Crown ${tool.name} is engineered to provide precise, institutional-grade calculation support directly inside your web browser. Built specifically for homeowners, students, freelancers, and working professionals across the USA, UK, Canada, and Europe, this utility completely eliminates manual math errors, subscription paywalls, and intrusive software downloads.`
                  )}
                </p>
                <p>
                  Every computation is performed using verified standard formulas (such as standard amortization algorithms, IRS-aligned tax tables, WHO health index metrics, or ISO standard conversion matrices). Because all computations execute entirely client-side using modern web technologies, your sensitive numbers and financial entries remain strictly confined to your device memory with zero server logging or tracking.
                </p>
              </div>

              {/* d) Button: "📖 Read Complete Guide" linking to /blog/[tool-name] */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Want the full mathematical derivation, edge-case analysis, and expert tips?
                </div>
                <button
                  onClick={() => onNavigateBlogGuide(tool.slug)}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.readCompleteGuideBtn || '📖 Read Complete Guide'}</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AD PLACEHOLDER 2: Below Tool Unit (In-Content Slot) */}
            {/* ========================================================================= */}
            <div className="p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 text-center">
              <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider mb-1">
                <span>Google AdSense Slot #2</span>
                <span>Below-Tool In-Content Banner</span>
              </div>
              <div className="h-20 sm:h-24 flex items-center justify-center text-xs text-slate-400 font-medium">
                (AdSense Responsive Banner / Native Article Unit)
              </div>
            </div>

            {/* c) FAQSection Component with 4 FAQs and FAQ Schema JSON-LD */}
            <FAQSection toolName={tool.name} faqs={tool.faq} />

          </div>

          {/* RIGHT 4 COLS: SIDEBAR (AD PLACEHOLDER 3, QUICK SPECS & RELATED TOOLS) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ========================================================================= */}
            {/* AD PLACEHOLDER 3: Sidebar Slot (300x250 or 300x600 Half-Page) */}
            {/* ========================================================================= */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-amber-400 dark:border-amber-700/60 p-4 text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-2">
                Ad Space • 300x250 Medium Rectangle
              </span>
              <div className="h-60 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col items-center justify-center text-xs text-slate-400 font-medium p-4">
                <span>Google AdSense</span>
                <span className="text-[10px] text-slate-500 mt-1">Sidebar Ad Placement #3</span>
              </div>
            </div>

            {/* Tool Trust & Safety Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Guaranteed Legit & Safe
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>100% Unlocked — No Login Required</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Zero Server Logging — Private to You</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>No Piracy or Copyrighted Media Ripping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Fully AdSense & GDPR Compliant</span>
                </li>
              </ul>
            </div>

            {/* Read Complete Guide Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-blue-200 dark:border-blue-800/60 p-5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                Detailed 800-Word Guide Available
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Read our in-depth educational article explaining formulas, step-by-step applications, and common pitfalls.
              </p>
              <button
                onClick={() => onNavigateBlogGuide(tool.slug)}
                className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer text-center block"
              >
                Read Complete Guide →
              </button>
            </div>

            {/* Related Tools */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Related {tool.category}
              </h3>
              <div className="space-y-2">
                {relatedTools.map(rt => (
                  <button
                    key={rt.slug}
                    onClick={() => onNavigateTool(rt.slug)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {rt.name}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
