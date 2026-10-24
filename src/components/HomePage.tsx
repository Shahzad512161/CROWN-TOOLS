import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ALL_TOOLS, TOP_EARNING_TOOLS, CATEGORIES_META, ToolItem, CategoryMeta 
} from '../lib/tools-data';
import { 
  Building2, Car, DollarSign, Receipt, Briefcase, FileSpreadsheet, 
  Coins, FileCode, Calculator, Image as ImageIcon, FileText, Wand2, 
  Scale, Home, Sparkles, Star, TrendingUp, Search, ChevronRight, 
  ShieldCheck, ArrowRight, Zap, CheckCircle2, ChevronLeft, Lock, Check,
  ChevronDown, ChevronUp, HelpCircle, ThumbsUp, ThumbsDown, MessageSquare,
  FolderOpen, Layers, LockOpen, X
} from 'lucide-react';
import { SupportedLanguage, Translations, TRANSLATIONS } from '../lib/i18n';
import { localizedTool } from '../lib/tools-fr';
import { useStrings } from '../lib/LangContext';
import { PAGES_STRINGS, HOME_GROUP_TEXT, PLATFORM_FAQ_TEXT, HOME_POPULAR_LABELS } from '../lib/strings/pages';
import { LogoMark } from './LogoMark';

interface HomePageProps {
  onSelectTool: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  t?: Translations;
  lang?: SupportedLanguage;
}

// 6. 2PX BOLD VIBRANT CARD PALETTES & 2.5PX HOVER BORDERS
interface VibrantColorTheme {
  cardBg: string;
  borderColor: string;
  borderHover: string;
  iconBg: string;
  tagColor: string;
}

const MONO_THEME: VibrantColorTheme = {
  cardBg: 'bg-white dark:bg-slate-900',
  borderColor: 'border-slate-200 dark:border-slate-700',
  borderHover: 'hover:border-slate-400 dark:hover:border-slate-500',
  iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100',
  tagColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
};

const VIBRANT_THEMES: VibrantColorTheme[] = [MONO_THEME, MONO_THEME, MONO_THEME, MONO_THEME, MONO_THEME];

// Catchy & Attractive Titles
const CATCHY_TITLES: Record<string, { title: string; catchyDesc: string }> = {
  'mortgage-calculator-usa': {
    title: 'USA Mortgage Calculator - Calculate in 3 Secs',
    catchyDesc: 'Instant 2026 breakdown of principal, interest, PMI & property taxes for US homes.'
  },
  'auto-insurance-calculator': {
    title: 'Auto Insurance Calculator - Save up to $780',
    catchyDesc: 'Compare 50-state risk ratings, deductible discounts & realistic monthly premiums.'
  },
  'loan-calculator-usa': {
    title: 'USA Loan Payoff & EMI - Cut Total Interest',
    catchyDesc: 'See how an extra $50/mo slashes months off your personal, auto or student loan.'
  },
  'tax-calculator-2026-usa': {
    title: 'USA Tax Calculator 2026 - Check Take-Home Pay',
    catchyDesc: 'Updated federal IRS brackets, FICA payroll & 50-state wage calculations.'
  },
  'resume-builder-usa-format': {
    title: 'US Resume Builder Pro - 100% ATS-Friendly',
    catchyDesc: 'Build clean, high-impact Fortune 500 resumes with instant PDF export.'
  },
  'invoice-generator-pro': {
    title: 'Invoice Generator Pro - Instant PDF & Multi-Currency',
    catchyDesc: 'Professional freelance and contractor billing in USD, GBP, EUR & CAD with auto tax.'
  },
  'live-currency-converter': {
    title: 'Live Currency Converter - Zero Bank Markup',
    catchyDesc: 'Mid-market interbank exchange rates with instant fee comparison matrix.'
  },
  'pdf-to-word-converter': {
    title: 'PDF to Word Converter - 100% Private In-Browser',
    catchyDesc: 'Extract structured text and export editable .DOC documents with zero server uploads.'
  },
  'image-compressor-lossless': {
    title: 'Compress Image 90% - No Quality Loss',
    catchyDesc: 'Shrink WebP, PNG, and JPG files client-side in under 1 second.'
  },
  'multi-calculator-all-in-one': {
    title: 'Multi Calculator All-In-One - 6 Pro Tools in 1',
    catchyDesc: 'Age, BMI, Loan, Mortgage, Tip Splitter, and Compound Growth in tabs.'
  }
};

export interface IntuitiveCategoryGroup {
  id: string;
  category: ToolItem['category'];
  groupName: string;
  tagline: string;
  count: number;
  icon: string;
  colorClass: string;
  bgLight: string;
  borderClass: string;
  description: string;
  popularTools: { name: string; slug: string }[];
}

export const INTUITIVE_CATEGORY_GROUPS: IntuitiveCategoryGroup[] = [
  {
    id: 'finance',
    category: 'Daily Calculators',
    groupName: 'Finance',
    tagline: 'High-CPC Mortgage, Loan, Tax & Investments',
    count: 1000,
    icon: 'Calculator',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'Calculate mortgage amortization, loan payoffs, 2026 IRS taxes, auto insurance, retirement ROI, and compound savings.',
    popularTools: [
      { name: 'Mortgage Calculator USA', slug: 'mortgage-calculator-usa' },
      { name: 'Loan Payoff & EMI', slug: 'loan-calculator-usa' },
      { name: 'USA Tax Calculator 2026', slug: 'tax-calculator-2026-usa' },
      { name: 'Auto Insurance Calculator', slug: 'auto-insurance-calculator' }
    ]
  },
  {
    id: 'converters',
    category: 'Unit Converters',
    groupName: 'Converters',
    tagline: 'Real-Time Interbank Exchange & Engineering Units',
    count: 1000,
    icon: 'Scale',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'Precision conversions for length, weight, temperature, area, volume, currency rates, speed, and digital storage bytes.',
    popularTools: [
      { name: 'Live Currency Converter', slug: 'live-currency-converter' },
      { name: 'Metric & Imperial Length', slug: 'mortgage-calculator-usa' },
      { name: 'Weight & Mass Units', slug: 'bmi-calculator' },
      { name: 'Digital Storage Converter', slug: 'image-compressor-lossless' }
    ]
  },
  {
    id: 'productivity',
    category: 'Text & AI Tools',
    groupName: 'Productivity',
    tagline: 'ATS Resume, Markdown, Slugs & Word Analysis',
    count: 500,
    icon: 'Wand2',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'Build Fortune 500 ATS-friendly resumes, inspect word and character density, format slugs, clean text, and encode base64.',
    popularTools: [
      { name: 'US Resume Builder Pro', slug: 'resume-builder-usa-format' },
      { name: 'Invoice Generator Pro', slug: 'invoice-generator-pro' },
      { name: 'Word Counter & Stats', slug: 'resume-builder-usa-format' },
      { name: 'Slug & Case Formatter', slug: 'resume-builder-usa-format' }
    ]
  },
  {
    id: 'image-utilities',
    category: 'Image Tools',
    groupName: 'Image Utilities',
    tagline: 'Lossless Compression & Graphic Converters',
    count: 1000,
    icon: 'Image',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'Compress photos up to 90% without visible quality loss, resize for social media, convert JPG/PNG to WebP, and crop 100% in-browser.',
    popularTools: [
      { name: 'Compress Image 90%', slug: 'image-compressor-lossless' },
      { name: 'JPG/PNG to WebP', slug: 'image-compressor-lossless' },
      { name: 'Image Resizer Pro', slug: 'image-compressor-lossless' },
      { name: 'Lossless Optimizer', slug: 'image-compressor-lossless' }
    ]
  },
  {
    id: 'pdf-tools',
    category: 'PDF Tools',
    groupName: 'PDF & Documents',
    tagline: 'Client-Side Private Conversion & Document Tools',
    count: 800,
    icon: 'FileText',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'Convert PDF to editable Word DOC, merge multiple PDF documents, extract text strings, and generate invoices with zero cloud storage.',
    popularTools: [
      { name: 'PDF to Word Converter', slug: 'pdf-to-word-converter' },
      { name: 'Merge PDF Documents', slug: 'pdf-to-word-converter' },
      { name: 'Extract Structured Text', slug: 'pdf-to-word-converter' },
      { name: 'PDF Page Counter', slug: 'pdf-to-word-converter' }
    ]
  },
  {
    id: 'home-life',
    category: 'Home & Daily Life',
    groupName: 'Everyday Life',
    tagline: 'Health, Family, Budgeting & Math Solvers',
    count: 700,
    icon: 'Home',
    colorClass: 'text-slate-700 dark:text-slate-200',
    bgLight: 'bg-slate-50 dark:bg-slate-800/60',
    borderClass: 'border-slate-200 dark:border-slate-700',
    description: 'WHO-standard BMI calculator, exact chronological Age Calculator, restaurant tip splitter, grocery budget math, and paint calculators.',
    popularTools: [
      { name: 'BMI Health Calculator', slug: 'bmi-calculator' },
      { name: 'Exact Age Calculator', slug: 'age-calculator' },
      { name: 'Multi-Calculator Pro', slug: 'multi-calculator-all-in-one' },
      { name: 'Tip & Bill Splitter', slug: 'multi-calculator-all-in-one' }
    ]
  }
];

interface PlatformFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  badge?: string;
}

const PLATFORM_FAQS: PlatformFAQ[] = [
  {
    id: 'free-platform',
    category: 'Platform & Pricing',
    question: 'How are all 250+ tools on Super Crown 100% free to use?',
    badge: '100% Free Forever',
    answer: 'Super Crown runs entirely on client-side edge computing. When you perform mathematical calculations, PDF extractions, image compression, or document generation, your web browser executes the code locally using HTML5 Canvas, Web Workers, and Web Crypto. Because our centralized cloud bandwidth overhead is drastically minimized, we keep the entire 250+ tool directory free for everyone, supported by unobtrusive Google AdSense ads and voluntary user contributions.'
  },
  {
    id: 'privacy-safe',
    category: 'Privacy & Security',
    question: 'Are my uploaded documents, resumes, and calculation inputs private and secure?',
    badge: 'Zero Server Upload',
    answer: 'Yes, 100% private. Super Crown operates under a strict Zero-Server-Upload policy. Unlike conventional cloud converters that upload your PDFs, tax numbers, and personal resumes to remote servers, our engines process your files directly in your browser’s volatile memory. Once you close or refresh the tab, your data is instantly cleared. We never log, store, or sell your personal information.'
  },
  {
    id: 'calculators-accuracy',
    category: 'Financial Accuracy',
    question: 'How accurate are the Mortgage, Tax 2026, and Auto Insurance calculators?',
    badge: 'IRS & Real-Time Verified',
    answer: 'All financial utilities including the USA Mortgage Calculator, 2026 Federal IRS Tax Calculator, Auto Insurance Estimator, and Loan Payoff Models are maintained by experienced software engineers and calibrated against official IRS tax brackets, state payroll deductions, Fannie Mae amortization schedules, and interbank exchange benchmark feeds. They deliver institutional-grade estimates.'
  },
  {
    id: 'account-required',
    category: 'Platform & Pricing',
    question: 'Do I need to create an account, register, or provide a credit card?',
    badge: 'No Sign-Up Required',
    answer: 'Zero registration is required. You do not need to provide an email address, create a password, or submit a payment card. Every single tool across all six categories is accessible with one click.'
  },
  {
    id: 'gdpr-compliance',
    category: 'Privacy & Security',
    question: 'Is Super Crown compliant with GDPR, CCPA, and Google AdSense guidelines?',
    badge: 'GDPR & CCPA Compliant',
    answer: 'Yes. Super Crown fully complies with the European Union General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Google AdSense publisher terms. We do not sell user data, utilize intrusive trackers, or host illegal file downloaders. All tools are vetted for safe, lawful, and ethical everyday use.'
  },
  {
    id: 'mobile-offline',
    category: 'Speed & Compatibility',
    question: 'Can I use Super Crown on mobile phones, tablets, or with slow internet?',
    badge: 'Mobile & Offline Ready',
    answer: 'Yes. Super Crown is engineered with a responsive mobile-first interface optimized for iPhone, iPad, Android, macOS, and Windows. Once a tool page loads in your browser cache, the computation engine runs locally without requiring continuous server roundtrips, ensuring rapid performance even on low-bandwidth networks.'
  },
  {
    id: 'ats-resume-invoices',
    category: 'Speed & Compatibility',
    question: 'Are exported resumes and invoices formatted for ATS systems and accounting software?',
    badge: 'Fortune 500 ATS Standard',
    answer: 'Yes. The US Resume Builder outputs clean, single-column, ATS-friendly printable documents formatted to pass Applicant Tracking Systems used by top recruiters. The Invoice Generator creates structured billing statements in USD, EUR, GBP, and CAD with automatic sales tax and subtotal calculations ready for business records.'
  },
  {
    id: 'support-mission',
    category: 'Platform & Pricing',
    question: 'How can I support the Super Crown mission and help maintain high-speed servers?',
    badge: 'Community Supported',
    answer: 'Super Crown is sustained as an independent utility suite. If our free calculators and tools save you time, legal fees, or subscription costs, you can support our server bandwidth via our "Support Mission" portal using Payoneer, Binance Pay, Crypto (USDT TRC20, BTC, ETH), PayPal, or Buy Me a Coffee.'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTool,
  searchQuery,
  onSearchChange,
  t = TRANSLATIONS.en,
  lang = 'en'
}) => {
  const s = useStrings(PAGES_STRINGS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 24;
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Dynamic FAQ Interactive State
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('All');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['free-platform', 'privacy-safe']);
  const [faqHelpful, setFaqHelpful] = useState<Record<string, 'yes' | 'no'>>({});

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Platform FAQs in the active language (English source lives in PLATFORM_FAQS)
  const platformFaqs = useMemo<PlatformFAQ[]>(
    () => PLATFORM_FAQS.map((f) => ({ ...f, ...(PLATFORM_FAQ_TEXT[f.id]?.[lang] ?? {}) })),
    [lang]
  );

  const handleExpandAllFaqs = () => {
    setOpenFaqIds(platformFaqs.map((f) => f.id));
  };

  const handleCollapseAllFaqs = () => {
    setOpenFaqIds([]);
  };

  const handleFaqFeedback = (id: string, type: 'yes' | 'no') => {
    setFaqHelpful((prev) => ({ ...prev, [id]: type }));
  };

  const filteredFaqs = useMemo(() => {
    const q = faqSearchQuery.toLowerCase().trim();
    return platformFaqs.filter((faq) => {
      const matchesCategory =
        selectedFaqCategory === 'All' || faq.category === selectedFaqCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        (faq.badge && faq.badge.toLowerCase().includes(q))
      );
    });
  }, [faqSearchQuery, selectedFaqCategory, platformFaqs]);

  const faqCategories = useMemo(() => {
    const cats = Array.from(new Set(platformFaqs.map((f) => f.category)));
    return ['All', ...cats];
  }, [platformFaqs]);

  // SEO Schema.org FAQPage sync for Homepage
  useEffect(() => {
    const scriptId = 'homepage-faq-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: platformFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
    script.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [platformFaqs]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5" />;
      case 'Receipt': return <Receipt className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      case 'FileCode': return <FileCode className="w-5 h-5" />;
      case 'Calculator': return <Calculator className="w-5 h-5" />;
      case 'Image': return <ImageIcon className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Wand2': return <Wand2 className="w-5 h-5" />;
      case 'Scale': return <Scale className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getCategoryTranslatedName = (catName: string) => {
    switch (catName) {
      case 'Daily Calculators': return t.catDailyCalc;
      case 'Image Tools': return t.catImageTools;
      case 'PDF Tools': return t.catPdfTools;
      case 'Word Tools': return t.catWordTools;
      case 'SEO Tools': return t.catSeoTools;
      case 'Developer Tools': return t.catDevTools;
      case 'Video & Audio Tools': return t.catMediaTools;
      case 'AI Tools': return t.catAiTools;
      case 'Social Media Tools': return t.catSocialTools;
      case 'Student & Everyday Tools': return t.catStudentTools;
      case 'Text & AI Tools': return t.catTextAi;
      case 'Unit Converters': return t.catUnitConv;
      case 'Home & Daily Life': return t.catHomeLife;
      default: return catName;
    }
  };

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const ltTool = lang !== 'en' ? localizedTool(tool, lang) : null;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (ltTool ? ltTool.name.toLowerCase().includes(q) || ltTool.description.toLowerCase().includes(q) : false) ||
        tool.category.toLowerCase().includes(q) ||
        tool.highCPCKeywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredTools.length / pageSize) || 1;
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTools.slice(start, start + pageSize);
  }, [filteredTools, currentPage, pageSize]);

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    setCurrentPage(1);
    const section3 = document.getElementById('all-tools-section');
    if (section3) {
      section3.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* HERO SECTION   minimal: headline, subtitle, search. Nothing else. */}
      {/* ========================================================================= */}
      <section className=" mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-[#0f172a] dark:text-white leading-[1.08]">
            {t.heroTitle}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            {t.heroSubtitle}
          </p>

          <div className="w-full mt-10">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const section = document.getElementById('all-tools-section');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="w-full h-14 sm:h-16 pl-13 sm:pl-14 pr-28 sm:pr-32 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-medium focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-24 sm:right-28 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                  title={s('homeClearSearch')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  const section = document.getElementById('all-tools-section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute right-2 h-10 sm:h-12 px-5 sm:px-6 rounded-full bg-slate-900 hover:bg-slate-700 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t.searchButton}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "MOST POPULAR TOOLS" SECTION:
          Title: Big, bold, with a left blue border 4px solid #3b82f6, icon 🔥.
          Subtitle: "Loved by users in USA, UK, Canada & Europe"
          6. BOLD 2PX VIBRANT CARDS: Rounded 24px, 2px solid border,
             hover shadow-xl & lift -translate-y-1, CATCHY & ATTRACTIVE TEXT.
      {/* ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8  mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="border-l-4 border-slate-900 dark:border-white pl-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-display text-[#0f172a] dark:text-white">
                {t.section1Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#94a3b8] mt-1">
              {t.section1Subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#3b82f6] text-white shadow-xs">
              {t.badgeTrending} Top 8
            </span>
          </div>
        </div>

        {/* 8 BIG Cards Grid with 2px BOLD Borders, Rounded 24px, Bold 15px text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOP_EARNING_TOOLS.map((tool, index) => {
            const theme = VIBRANT_THEMES[index % VIBRANT_THEMES.length];
            const catchy = CATCHY_TITLES[tool.slug] || {
              title: tool.name,
              catchyDesc: tool.description
            };

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.slug)}
                className={`relative group rounded-[28px] p-6 cursor-pointer border ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[310px] shadow-sm`}
              >
                {/* Header Row: Icon + Popular Badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      {getToolIcon(tool.iconName)}
                    </div>
                    
                    {/* Small "Popular" tag on top right */}
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/95 dark:bg-slate-900 text-[#0f172a] dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {t.badgePopular}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider mb-2.5 ${theme.tagColor}`}>
                    {getCategoryTranslatedName(tool.category)}
                  </span>

                  {/* Catchy Title: Bold 15px, perfect contrast */}
                  <h3 className="text-[15px] font-bold text-[#1e293b] dark:text-white leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {lang !== 'en' ? localizedTool(tool, lang).name : catchy.title}
                  </h3>

                  {/* Catchy Description */}
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {lang !== 'en' ? localizedTool(tool, lang).description : catchy.catchyDesc}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-[#0f172a] dark:text-white group-hover:text-slate-900 dark:group-hover:text-white">
                  <span className="flex items-center gap-1">
                    {t.openToolNow} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{t.freeLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BROWSE BY CATEGORY NAVIGATION SECTION
          Organize 250+ tools into intuitive groups: Finance, Converters, Productivity, Image Utilities, etc.
      {/* ========================================================================= */}
      <section id="browse-categories-section" className="py-14 px-4 sm:px-6 lg:px-8  mx-auto border-t border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FolderOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{s('homeBrowseBadge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display text-[#0f172a] dark:text-white">
            {t.section2Title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.section2Subtitle}
          </p>

          {/* Quick Category Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.allCategories}
            </button>
            {INTUITIVE_CATEGORY_GROUPS.map((group) => {
              const isActive = selectedCategory === group.category;
              const gt = HOME_GROUP_TEXT[group.id]?.[lang];
              return (
                <button
                  key={group.id}
                  onClick={() => handleCategoryClick(group.category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{gt?.name ?? group.groupName}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {group.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6 Intuitive Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {INTUITIVE_CATEGORY_GROUPS.map((group, idx) => {
            const isSelected = selectedCategory === group.category;
            const gt = HOME_GROUP_TEXT[group.id]?.[lang];
            const theme = VIBRANT_THEMES[idx % VIBRANT_THEMES.length];

            return (
              <div
                key={group.id}
                className={`p-6 sm:p-7 rounded-[28px] transition-all duration-300 border ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-md hover:-translate-y-1.5 flex flex-col justify-between group relative overflow-hidden ${
                  isSelected ? 'ring-2 ring-slate-400/40 shadow-none' : 'shadow-xs'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900 dark:bg-white"></div>
                )}

                <div>
                  {/* Header Row: Icon + Tool Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} shadow-md flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {group.icon === 'Calculator' ? <Calculator className="w-7 h-7" /> :
                       group.icon === 'Scale' ? <Scale className="w-7 h-7" /> :
                       group.icon === 'Wand2' ? <Wand2 className="w-7 h-7" /> :
                       group.icon === 'Image' ? <ImageIcon className="w-7 h-7" /> :
                       group.icon === 'FileText' ? <FileText className="w-7 h-7" /> :
                       <Home className="w-7 h-7" />}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-slate-900 text-[#0f172a] dark:text-white border border-slate-300 dark:border-slate-700 shadow-2xs">
                        {s('homeFreeTools').replace('{count}', group.count.toLocaleString())}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        {t.freeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Group Name & Subtitle */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-[#0f172a] dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {gt?.name ?? group.groupName}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        ({getCategoryTranslatedName(group.category)})
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {gt?.tagline ?? group.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {gt?.description ?? group.description}
                  </p>

                  {/* Quick Launch Popular Tools */}
                  <div className="mb-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-slate-400" />
                      {t.badgePopular}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.popularTools.map((pt) => {
                        const ptLabel = HOME_POPULAR_LABELS[pt.name]?.[lang] ?? pt.name;
                        return (
                        <button
                          key={pt.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTool(pt.slug);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={s('homeOpenTool').replace('{name}', ptLabel)}
                        >
                          {ptLabel}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Click to explore whole category in directory */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCategoryClick(group.category)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 group-hover:bg-slate-900 dark:group-hover:bg-white text-[#0f172a] dark:text-white group-hover:text-white dark:group-hover:text-slate-900 border border-slate-300 dark:border-slate-700 group-hover:border-slate-900 dark:group-hover:border-white text-xs font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer"
                  >
                    <span>{s('homeBrowseAll').replace('{count}', group.count.toLocaleString()).replace('{group}', gt?.name ?? group.groupName)}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: All Tools searchable grid loading from lib/tools-data.ts */}
      {/* ========================================================================= */}
      <section id="all-tools-section" className="py-10 px-4 sm:px-6 lg:px-8  mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f172a] dark:text-white">
                {t.section3Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.showingOf} {filteredTools.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, filteredTools.length)} of {filteredTools.length.toLocaleString()} {t.toolsWord}
              {selectedCategory !== 'All' && ` in ${getCategoryTranslatedName(selectedCategory)}`}
            </p>
          </div>
        </div>

        {/* Category filter buttons */}
        <div className="w-full bg-[#f8fafc] dark:bg-[#162032] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 mb-8">
          <button
            onClick={() => scrollCategories('left')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all"
            aria-label={s('homeScrollLeft')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div ref={categoryScrollRef} className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none flex-1">
            {[
              { category: 'All', label: t.allCategories, count: '' },
              { category: 'Daily Calculators', label: t.catDailyCalc, count: '1,000' },
              { category: 'Image Tools', label: t.catImageTools, count: '1,000' },
              { category: 'PDF Tools', label: t.catPdfTools, count: '800' },
              { category: 'Text & AI Tools', label: t.catTextAi, count: '500' },
              { category: 'Unit Converters', label: t.catUnitConv, count: '1,000' },
              { category: 'Home & Daily Life', label: t.catHomeLife, count: '700' },
              { category: 'Word Tools', label: t.catWordTools, count: '300' },
              { category: 'SEO Tools', label: t.catSeoTools, count: '400' },
              { category: 'Developer Tools', label: t.catDevTools, count: '400' },
              { category: 'Video & Audio Tools', label: t.catMediaTools, count: '300' },
              { category: 'AI Tools', label: t.catAiTools, count: '300' },
              { category: 'Social Media Tools', label: t.catSocialTools, count: '300' },
              { category: 'Student & Everyday Tools', label: t.catStudentTools, count: '300' },
            ].map((chip) => (
              <button
                key={chip.category}
                onClick={() => { setSelectedCategory(chip.category as typeof selectedCategory); setCurrentPage(1); }}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-colors cursor-pointer border ${
                  selectedCategory === chip.category
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white'
                }`}
              >
                {chip.label}{chip.count ? ` (${chip.count})` : ''}
              </button>
            ))}

          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollCategories('right')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label={s('homeScrollRight')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tools Searchable Grid with 2px BOLD Borders & Rounded 24px */}
        {paginatedTools.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border-2 border-dashed border-slate-300 dark:border-slate-700">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.noToolsFound}</h3>
            <p className="text-xs text-slate-500 mt-1">"{searchQuery}"</p>
            <button
              onClick={() => { onSearchChange(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {paginatedTools.map((tool, index) => {
              const theme = VIBRANT_THEMES[index % VIBRANT_THEMES.length];
              const catchy = CATCHY_TITLES[tool.slug] || {
                title: tool.name,
                catchyDesc: tool.description
              };

              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.slug)}
                  className={`rounded-[28px] p-5 cursor-pointer border ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[235px] group shadow-2xs`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${theme.tagColor}`}>
                        {getCategoryTranslatedName(tool.category)}
                      </span>
                      {tool.isTopEarning ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {t.badgePopular}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {t.freeLabel}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-[15px] text-[#1e293b] dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {lang !== 'en' ? localizedTool(tool, lang).name : catchy.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {lang !== 'en' ? localizedTool(tool, lang).description : catchy.catchyDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#0f172a] dark:text-white group-hover:text-slate-900 dark:group-hover:text-white">
                    <span>{t.useToolFree}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {t.pageOf} <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong> {s('homePerPage')}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title={s('homePrevPage')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNumber = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNumber = currentPage - 2 + idx;
                  if (pageNumber > totalPages) pageNumber = totalPages - (4 - idx);
                }
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                      currentPage === pageNumber
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title={s('homeNextPage')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* DYNAMIC FAQ SECTION FOR SEO & USER ENGAGEMENT */}
      {/* Category filters, real-time question search, expand/collapse, feedback & Schema */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8  mx-auto border-t border-slate-100 dark:border-slate-800">
        
        {/* FAQ Header with Left Blue Accent */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="border-s-4 border-slate-900 dark:border-white ps-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-display text-[#0f172a] dark:text-white">
                {s('homeFaqHeading')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#94a3b8] mt-1.5 max-w-2xl">
              {s('homeFaqSub')}
            </p>
          </div>

          {/* Quick Expand / Collapse All Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExpandAllFaqs}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              {s('homeExpandAll')}
            </button>
            <button
              onClick={handleCollapseAllFaqs}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              {s('homeCollapseAll')}
            </button>
          </div>
        </div>

        {/* Dynamic FAQ Filter Bar: Search Input + Category Filter Pills */}
        <div className="w-full bg-[#f8fafc] dark:bg-[#162032] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-3.5 shadow-xs mb-8 space-y-3">
          
          {/* FAQ Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute start-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              placeholder={s('homeFaqSearchPlaceholder')}
              className="w-full ps-10 pe-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-900 dark:focus:border-white focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 transition-all"
            />
            {faqSearchQuery && (
              <button
                onClick={() => setFaqSearchQuery('')}
                className="absolute end-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                title={s('homeClearFaqSearch')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* FAQ Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-xs">
            {faqCategories.map((cat) => {
              const isSelected = selectedFaqCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedFaqCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#3b82f6] text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat === 'All' ? s('homeAllQuestions') : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {s('homeNoFaqResults')}
            </h4>
            <p className="text-xs text-slate-500 mt-1">"{faqSearchQuery}"</p>
            <button
              onClick={() => { setFaqSearchQuery(''); setSelectedFaqCategory('All'); }}
              className="mt-3 px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {s('homeResetFaqSearch')}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.includes(faq.id);
              const feedback = faqHelpful[faq.id];

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-200 border-2 overflow-hidden ${
                    isOpen
                      ? 'border-[#3b82f6]/60 dark:border-[#3b82f6]/50 bg-white dark:bg-slate-800/95 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Clickable Question Header */}
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 text-start flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {faq.category}
                        </span>
                        {faq.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            ✓ {faq.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-xl mt-0.5 transition-colors shrink-0 ${
                      isOpen ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expandable Answer Body */}
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 space-y-4">
                      <p className="pt-3">{faq.answer}</p>

                      {/* Interactive Feedback Reaction */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 dark:border-slate-700/50">
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                          {s('homeWasHelpful')}
                        </span>

                        {feedback ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {s('homeThanksFeedback')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFaqFeedback(faq.id, 'yes')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 hover:border-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" /> {s('homeYes')}
                            </button>
                            <button
                              onClick={() => handleFaqFeedback(faq.id, 'no')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-300 transition-colors text-[11px] font-semibold cursor-pointer"
                            >
                              <ThumbsDown className="w-3 h-3" /> {s('homeNo')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
};
