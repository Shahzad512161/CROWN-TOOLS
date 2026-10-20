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
  FolderOpen, Layers
} from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';
import { Translations, TRANSLATIONS } from '../lib/i18n';
import TalkingCartoon from './TalkingCartoon';

interface HomePageProps {
  onSelectTool: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDonationModal: () => void;
  t?: Translations;
}

// 6. 2PX BOLD VIBRANT CARD PALETTES & 2.5PX HOVER BORDERS
interface VibrantColorTheme {
  cardBg: string;
  borderColor: string;
  borderHover: string;
  iconBg: string;
  tagColor: string;
}

const VIBRANT_THEMES: VibrantColorTheme[] = [
  // Sky / Ocean
  {
    cardBg: 'bg-[#f0f9ff] dark:bg-[#0c2438]',
    borderColor: 'border-[#38bdf8] dark:border-[#0284c7]',
    borderHover: 'hover:border-[#0284c7] dark:hover:border-[#38bdf8]',
    iconBg: 'bg-[#0ea5e9] text-white',
    tagColor: 'bg-[#e0f2fe] text-[#0369a1] dark:bg-[#075985] dark:text-[#e0f2fe]'
  },
  // Vibrant Pink / Rose
  {
    cardBg: 'bg-[#fdf2f8] dark:bg-[#2e0d1d]',
    borderColor: 'border-[#f472b6] dark:border-[#db2777]',
    borderHover: 'hover:border-[#db2777] dark:hover:border-[#f472b6]',
    iconBg: 'bg-[#ec4899] text-white',
    tagColor: 'bg-[#fce7f3] text-[#be185d] dark:bg-[#831843] dark:text-[#fce7f3]'
  },
  // Vibrant Sea Green / Emerald
  {
    cardBg: 'bg-[#f0fdf4] dark:bg-[#0a2e1d]',
    borderColor: 'border-[#34d399] dark:border-[#059669]',
    borderHover: 'hover:border-[#059669] dark:hover:border-[#34d399]',
    iconBg: 'bg-[#10b981] text-white',
    tagColor: 'bg-[#dcfce7] text-[#047857] dark:bg-[#065f46] dark:text-[#dcfce7]'
  },
  // Vibrant Orange / Amber
  {
    cardBg: 'bg-[#fff7ed] dark:bg-[#33180c]',
    borderColor: 'border-[#fb923c] dark:border-[#ea580c]',
    borderHover: 'hover:border-[#ea580c] dark:hover:border-[#fb923c]',
    iconBg: 'bg-[#f97316] text-white',
    tagColor: 'bg-[#ffedd5] text-[#c2410c] dark:bg-[#7c2d12] dark:text-[#ffedd5]'
  },
  // Vibrant Purple
  {
    cardBg: 'bg-[#faf5ff] dark:bg-[#25123d]',
    borderColor: 'border-[#c084fc] dark:border-[#9333ea]',
    borderHover: 'hover:border-[#9333ea] dark:hover:border-[#c084fc]',
    iconBg: 'bg-[#a855f7] text-white',
    tagColor: 'bg-[#f3e8ff] text-[#7e22ce] dark:bg-[#581c87] dark:text-[#f3e8ff]'
  }
];

// Catchy & Attractive Titles
const CATCHY_TITLES: Record<string, { title: string; catchyDesc: string }> = {
  'mortgage-calculator-usa': {
    title: '🏠 USA Mortgage Calculator - Calculate in 3 Secs',
    catchyDesc: 'Instant 2026 breakdown of principal, interest, PMI & property taxes for US homes.'
  },
  'auto-insurance-calculator': {
    title: '🚗 Auto Insurance Calculator - Save up to $780',
    catchyDesc: 'Compare 50-state risk ratings, deductible discounts & realistic monthly premiums.'
  },
  'loan-calculator-usa': {
    title: '💵 USA Loan Payoff & EMI - Cut Total Interest',
    catchyDesc: 'See how an extra $50/mo slashes months off your personal, auto or student loan.'
  },
  'tax-calculator-2026-usa': {
    title: '🏛️ USA Tax Calculator 2026 - Check Take-Home Pay',
    catchyDesc: 'Updated federal IRS brackets, FICA payroll & 50-state wage calculations.'
  },
  'resume-builder-usa-format': {
    title: '📄 US Resume Builder Pro - 100% ATS-Friendly',
    catchyDesc: 'Build clean, high-impact Fortune 500 resumes with instant PDF export.'
  },
  'invoice-generator-pro': {
    title: '🧾 Invoice Generator Pro - Instant PDF & Multi-Currency',
    catchyDesc: 'Professional freelance and contractor billing in USD, GBP, EUR & CAD with auto tax.'
  },
  'live-currency-converter': {
    title: '💱 Live Currency Converter - Zero Bank Markup',
    catchyDesc: 'Mid-market interbank exchange rates with instant fee comparison matrix.'
  },
  'pdf-to-word-converter': {
    title: '📑 PDF to Word Converter - 100% Private In-Browser',
    catchyDesc: 'Extract structured text and export editable .DOC documents with zero server uploads.'
  },
  'image-compressor-lossless': {
    title: '⚡ Compress Image 90% - No Quality Loss',
    catchyDesc: 'Shrink WebP, PNG, and JPG files client-side in under 1 second.'
  },
  'multi-calculator-all-in-one': {
    title: '🧮 Multi Calculator All-In-One - 6 Pro Tools in 1',
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
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-[#e0f2fe] dark:bg-blue-950/40',
    borderClass: 'border-blue-300 dark:border-blue-700',
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
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-[#dcfce7] dark:bg-emerald-950/40',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
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
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-[#ede9fe] dark:bg-purple-950/40',
    borderClass: 'border-purple-300 dark:border-purple-700',
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
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-[#fce7f3] dark:bg-pink-950/40',
    borderClass: 'border-pink-300 dark:border-pink-700',
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
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-[#fef9c3] dark:bg-yellow-950/40',
    borderClass: 'border-amber-300 dark:border-amber-700',
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
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-[#ffedd5] dark:bg-amber-950/40',
    borderClass: 'border-orange-300 dark:border-orange-700',
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
    question: 'How are all 5,000+ tools on Super Crown 100% free to use?',
    badge: '100% Free Forever',
    answer: 'Super Crown runs entirely on client-side edge computing. When you perform mathematical calculations, PDF extractions, image compression, or document generation, your web browser executes the code locally using HTML5 Canvas, Web Workers, and Web Crypto. Because our centralized cloud bandwidth overhead is drastically minimized, we keep the entire 5,000+ tool directory free for everyone, supported by unobtrusive Google AdSense ads and voluntary user contributions.'
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
    answer: 'All financial utilities—including the USA Mortgage Calculator, 2026 Federal IRS Tax Calculator, Auto Insurance Estimator, and Loan Payoff Models—are maintained by experienced software engineers and calibrated against official IRS tax brackets, state payroll deductions, Fannie Mae amortization schedules, and interbank exchange benchmark feeds. They deliver institutional-grade estimates.'
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
  onOpenDonationModal,
  t = TRANSLATIONS.en
}) => {
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

  const handleExpandAllFaqs = () => {
    setOpenFaqIds(PLATFORM_FAQS.map((f) => f.id));
  };

  const handleCollapseAllFaqs = () => {
    setOpenFaqIds([]);
  };

  const handleFaqFeedback = (id: string, type: 'yes' | 'no') => {
    setFaqHelpful((prev) => ({ ...prev, [id]: type }));
  };

  const filteredFaqs = useMemo(() => {
    const q = faqSearchQuery.toLowerCase().trim();
    return PLATFORM_FAQS.filter((faq) => {
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
  }, [faqSearchQuery, selectedFaqCategory]);

  const faqCategories = useMemo(() => {
    const cats = Array.from(new Set(PLATFORM_FAQS.map((f) => f.category)));
    return ['All', ...cats];
  }, []);

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
      mainEntity: PLATFORM_FAQS.map((faq) => ({
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
  }, []);

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

      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
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
      {/* HERO SECTION: */}
      {/* - Left side: Greeting Cartoon Character saying "السلام علیکم! آپ کو کونسا ٹول چاہیے؟" with waving hand animation */}
      {/* - Right side: Big Search Bar "Search 5000+ Tools..." */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#eff6ff] dark:from-[#111827] dark:via-[#162032] dark:to-[#1e293b] border-2 border-[#e2e8f0] dark:border-slate-800 rounded-[32px] shadow-sm p-6 sm:p-10 relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* ===================================================================== */}
            {/* LEFT SIDE (5 Cols): Talking Cartoon Character with voice + animation */}
            {/* ===================================================================== */}
            <div className="lg:col-span-5 flex flex-col items-center text-center lg:items-start lg:text-left">
              <TalkingCartoon />
            </div>

            {/* ===================================================================== */}
            {/* RIGHT SIDE (7 Cols): Big Search Bar "Search 5000+ Tools..." */}
            {/* ===================================================================== */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              
              {/* Category pill */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Super Crown Tools • 100% Unlocked Suite</span>
              </div>

              {/* Title & Tagline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white tracking-tight leading-tight">
                Super Crown Tools — 5000+ Free Online Tools
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Instant calculators, document engines, image compressors, and daily utilities. No registration, no lock screens, and no blur—use every tool immediately.
              </p>

              {/* BIG SEARCH BAR "Search 5000+ Tools..." */}
              <div className="pt-2">
                <div className="relative flex items-center shadow-lg rounded-full">
                  {/* Left Search Icon */}
                  <Search className="w-6 h-6 absolute left-5 text-blue-500 pointer-events-none" />

                  {/* Input */}
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
                    placeholder="Search 5000+ Tools... e.g. Mortgage Calculator, BMI, Insurance, Loan"
                    className="w-full h-14 sm:h-16 pl-14 sm:pl-16 pr-28 sm:pr-36 rounded-full border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-bold shadow-inner focus:outline-hidden focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/60 transition-all"
                  />

                  {/* Clear Button */}
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-28 sm:right-32 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}

                  {/* Search Button */}
                  <button
                    onClick={() => {
                      const section = document.getElementById('all-tools-section');
                      if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="absolute right-2 h-10 sm:h-12 px-5 sm:px-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Popular Quick Search Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-slate-500 font-semibold mr-1">Popular:</span>
                {[
                  { name: 'Mortgage Calculator', slug: 'mortgage-calculator-usa' },
                  { name: 'BMI Calculator', slug: 'bmi-calculator' },
                  { name: 'Age Calculator', slug: 'age-calculator' },
                  { name: 'Loan Calculator', slug: 'loan-calculator-usa' },
                  { name: 'Auto Insurance', slug: 'auto-insurance-calculator' },
                  { name: 'Tax 2026', slug: 'tax-calculator-2026-usa' },
                  { name: 'Resume Builder', slug: 'resume-builder-pro' }
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => onSelectTool(item.slug)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer font-medium"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Browse by Category Quick Navigation */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Browse by Category:
                  </span>
                  <button 
                    onClick={() => {
                      const sec = document.getElementById('browse-categories-section');
                      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View All Groups <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: '💰 Finance', category: 'Daily Calculators', count: '1,000+' },
                    { label: '🔄 Converters', category: 'Unit Converters', count: '1,000+' },
                    { label: '⚡ Productivity', category: 'Text & AI Tools', count: '500+' },
                    { label: '🎨 Image Utilities', category: 'Image Tools', count: '1,000+' },
                    { label: '📑 PDF & Docs', category: 'PDF Tools', count: '800+' },
                    { label: '📝 Word Tools', category: 'Word Tools', count: '300+' },
                    { label: '🔍 SEO Tools', category: 'SEO Tools', count: '400+' },
                    { label: '💻 Developer Tools', category: 'Developer Tools', count: '400+' },
                    { label: '🎬 Video & Audio Tools', category: 'Video & Audio Tools', count: '300+' },
                    { label: '🤖 AI Tools', category: 'AI Tools', count: '300+' },
                    { label: '📱 Social Media Tools', category: 'Social Media Tools', count: '300+' },
                    { label: '🏡 Daily Life', category: 'Home & Daily Life', count: '700+' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleCategoryClick(cat.category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-2xs cursor-pointer border ${
                        selectedCategory === cat.category
                          ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        selectedCategory === cat.category
                          ? 'bg-blue-800 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  ✓ 100% Free Forever
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
                  🔒 Zero Tracking - Private
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  ⚡ Instant Results
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-bold">
                  🛡️ No Lock / No Blur
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Top AdSense Banner (728x90) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2">
        <AdSenseBanner position="top" />
      </div>

      {/* ========================================================================= */}
      {/* 5. "MOST POPULAR TOOLS" SECTION:
          Title: Big, bold, with a left blue border 4px solid #3b82f6, icon 🔥.
          Subtitle: "Loved by users in USA, UK, Canada & Europe"
          6. BOLD 2PX VIBRANT CARDS: Rounded 24px, 2px solid border,
             hover shadow-xl & lift -translate-y-1, CATCHY & ATTRACTIVE TEXT.
      {/* ========================================================================= */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="border-l-4 border-[#3b82f6] pl-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] dark:text-white tracking-tight">
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
                className={`relative group rounded-[24px] p-6 cursor-pointer border-2 ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[310px] shadow-sm`}
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
                  <h3 className="text-[15px] font-bold text-[#1e293b] dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {catchy.title}
                  </h3>

                  {/* Catchy Description */}
                  <p className="text-xs text-[#475569] dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {catchy.catchyDesc}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold text-[#0f172a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
          Organize 5000+ tools into intuitive groups: Finance, Converters, Productivity, Image Utilities, etc.
      {/* ========================================================================= */}
      <section id="browse-categories-section" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-2xs">
            <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Browse by Category • 5000+ Tools Organized</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0f172a] dark:text-white tracking-tight">
            Browse by Category
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Quickly navigate 5,000+ completely unlocked, zero-login utilities structured into intuitive collections for <strong>Finance</strong>, <strong>Converters</strong>, <strong>Productivity</strong>, and <strong>Image Utilities</strong>.
          </p>

          {/* Quick Category Navigation Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              🌐 All 5,000+ Tools
            </button>
            {INTUITIVE_CATEGORY_GROUPS.map((group) => {
              const isActive = selectedCategory === group.category;
              return (
                <button
                  key={group.id}
                  onClick={() => handleCategoryClick(group.category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs cursor-pointer border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600'
                  }`}
                >
                  <span>{group.groupName}</span>
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
            const theme = VIBRANT_THEMES[idx % VIBRANT_THEMES.length];

            return (
              <div
                key={group.id}
                className={`p-6 sm:p-7 rounded-[28px] transition-all duration-300 border-2 ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-2xl hover:-translate-y-1.5 flex flex-col justify-between group relative overflow-hidden ${
                  isSelected ? 'ring-4 ring-blue-500/40 shadow-lg' : 'shadow-xs'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
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
                        {group.count.toLocaleString()} Free Tools
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        ✓ 100% Unlocked
                      </span>
                    </div>
                  </div>

                  {/* Group Name & Subtitle */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-[#0f172a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {group.groupName}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                        ({getCategoryTranslatedName(group.category)})
                      </span>
                    </div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {group.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {group.description}
                  </p>

                  {/* Quick Launch Popular Tools */}
                  <div className="mb-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      Popular Quick Launch:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.popularTools.map((pt) => (
                        <button
                          key={pt.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTool(pt.slug);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={`Open ${pt.name}`}
                        >
                          {pt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Click to explore whole category in directory */}
                <div className="pt-4 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCategoryClick(group.category)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 group-hover:bg-blue-600 text-[#0f172a] dark:text-white group-hover:text-white border border-slate-300 dark:border-slate-700 group-hover:border-blue-600 text-xs font-bold flex items-center justify-between transition-all shadow-2xs cursor-pointer"
                  >
                    <span>Browse all {group.count.toLocaleString()} {group.groupName} Tools</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Middle Native Ad Placement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <AdSenseBanner position="bottom" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: All Tools searchable grid loading from lib/tools-data.ts (5000 tools)
          6. CATEGORY FILTER BUTTONS - BOLD, COLOURFUL, LARGE, ROUNDED FULL:
          All Tools - Blue #3b82f6 text white
          Daily Calculators - Green #10b981 text white
          Image Tools - Pink #ec4899 text white
          PDF Tools - Amber #f59e0b text white
          Text & AI Tools - Purple #8b5cf6 text white
          Unit Converters - Cyan #06b6d4 text white
          Home & Daily Life - Orange #f97316 text white
      {/* ========================================================================= */}
      <section id="all-tools-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
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

        {/* 4. CATEGORY FILTER BUTTONS SECTION: Background #f8fafc with left/right scroll arrow buttons */}
        <div className="w-full bg-[#f8fafc] dark:bg-[#162032] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-2.5 shadow-xs flex items-center gap-2 mb-8">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => scrollCategories('left')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div ref={categoryScrollRef} className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none flex-1">
            {/* All Tools - Blue */}
            <button
              onClick={() => { setSelectedCategory('All'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'All'
                  ? 'bg-[#3b82f6] text-white border-[#2563eb] shadow-md ring-2 ring-blue-300 dark:ring-blue-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#3b82f6]/40 hover:bg-[#3b82f6] hover:text-white'
              }`}
            >
              🌐 {t.allCategories}
            </button>

            {/* Daily Calculators - Green */}
            <button
              onClick={() => { setSelectedCategory('Daily Calculators'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Daily Calculators'
                  ? 'bg-[#10b981] text-white border-[#059669] shadow-md ring-2 ring-emerald-300 dark:ring-emerald-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#10b981]/40 hover:bg-[#10b981] hover:text-white'
              }`}
            >
              🧮 {t.catDailyCalc} (1,000)
            </button>

            {/* Image Tools - Pink */}
            <button
              onClick={() => { setSelectedCategory('Image Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Image Tools'
                  ? 'bg-[#ec4899] text-white border-[#db2777] shadow-md ring-2 ring-pink-300 dark:ring-pink-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#ec4899]/40 hover:bg-[#ec4899] hover:text-white'
              }`}
            >
              🖼️ {t.catImageTools} (1,000)
            </button>

            {/* PDF Tools - Amber */}
            <button
              onClick={() => { setSelectedCategory('PDF Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'PDF Tools'
                  ? 'bg-[#f59e0b] text-white border-[#d97706] shadow-md ring-2 ring-amber-300 dark:ring-amber-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#f59e0b]/40 hover:bg-[#f59e0b] hover:text-white'
              }`}
            >
              📄 {t.catPdfTools} (800)
            </button>

            {/* Text & AI Tools - Purple */}
            <button
              onClick={() => { setSelectedCategory('Text & AI Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Text & AI Tools'
                  ? 'bg-[#8b5cf6] text-white border-[#7c3aed] shadow-md ring-2 ring-purple-300 dark:ring-purple-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#8b5cf6]/40 hover:bg-[#8b5cf6] hover:text-white'
              }`}
            >
              ✨ {t.catTextAi} (500)
            </button>

            {/* Unit Converters - Cyan */}
            <button
              onClick={() => { setSelectedCategory('Unit Converters'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Unit Converters'
                  ? 'bg-[#06b6d4] text-white border-[#0891b2] shadow-md ring-2 ring-cyan-300 dark:ring-cyan-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#06b6d4]/40 hover:bg-[#06b6d4] hover:text-white'
              }`}
            >
              ⚖️ {t.catUnitConv} (1,000)
            </button>

            {/* Home & Daily Life - Orange */}
            <button
              onClick={() => { setSelectedCategory('Home & Daily Life'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Home & Daily Life'
                  ? 'bg-[#f97316] text-white border-[#ea580c] shadow-md ring-2 ring-orange-300 dark:ring-orange-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#f97316]/40 hover:bg-[#f97316] hover:text-white'
              }`}
            >
              🏡 {t.catHomeLife} (700)
            </button>

            {/* Word Tools - Blue */}
            <button
              onClick={() => { setSelectedCategory('Word Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Word Tools'
                  ? 'bg-[#2563eb] text-white border-[#1d4ed8] shadow-md ring-2 ring-blue-300 dark:ring-blue-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#2563eb]/40 hover:bg-[#2563eb] hover:text-white'
              }`}
            >
              📝 Word Tools (300)
            </button>

            {/* SEO Tools - Green */}
            <button
              onClick={() => { setSelectedCategory('SEO Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'SEO Tools'
                  ? 'bg-[#16a34a] text-white border-[#15803d] shadow-md ring-2 ring-green-300 dark:ring-green-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#16a34a]/40 hover:bg-[#16a34a] hover:text-white'
              }`}
            >
              🔍 SEO Tools (400)
            </button>

            {/* Developer Tools - Violet */}
            <button
              onClick={() => { setSelectedCategory('Developer Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Developer Tools'
                  ? 'bg-[#7c3aed] text-white border-[#6d28d9] shadow-md ring-2 ring-violet-300 dark:ring-violet-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#7c3aed]/40 hover:bg-[#7c3aed] hover:text-white'
              }`}
            >
              💻 Developer Tools (400)
            </button>

            {/* Video & Audio Tools - Orange */}
            <button
              onClick={() => { setSelectedCategory('Video & Audio Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Video & Audio Tools'
                  ? 'bg-[#ea580c] text-white border-[#c2410c] shadow-md ring-2 ring-orange-300 dark:ring-orange-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#ea580c]/40 hover:bg-[#ea580c] hover:text-white'
              }`}
            >
              🎬 Video & Audio Tools (300)
            </button>

            {/* AI Tools - Purple */}
            <button
              onClick={() => { setSelectedCategory('AI Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'AI Tools'
                  ? 'bg-[#9333ea] text-white border-[#7e22ce] shadow-md ring-2 ring-purple-300 dark:ring-purple-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#9333ea]/40 hover:bg-[#9333ea] hover:text-white'
              }`}
            >
              🤖 AI Tools (300)
            </button>

            {/* Social Media Tools - Pink */}
            <button
              onClick={() => { setSelectedCategory('Social Media Tools'); setCurrentPage(1); }}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 border-2 ${
                selectedCategory === 'Social Media Tools'
                  ? 'bg-[#db2777] text-white border-[#be185d] shadow-md ring-2 ring-pink-300 dark:ring-pink-900'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-[#db2777]/40 hover:bg-[#db2777] hover:text-white'
              }`}
            >
              📱 Social Media Tools (300)
            </button>
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scrollCategories('right')}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label="Scroll right"
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
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
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
                  className={`rounded-[24px] p-5 cursor-pointer border-2 ${theme.borderColor} ${theme.borderHover} ${theme.cardBg} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[235px] group shadow-2xs`}
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
                          ✓ Free
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-[15px] text-[#1e293b] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {catchy.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {catchy.catchyDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#0f172a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
              <strong className="text-slate-900 dark:text-white">{totalPages}</strong> (24 Tools per Page)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="Previous page"
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
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500'
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
                title="Next page"
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
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-800">
        
        {/* FAQ Header with Left Blue Accent */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="border-l-4 border-[#3b82f6] pl-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#475569] dark:text-[#94a3b8] mt-1.5 max-w-2xl">
              Learn how Super Crown operates 5,000+ daily utilities with a zero-server-upload architecture, verified privacy, and institutional-grade precision.
            </p>
          </div>

          {/* Quick Expand / Collapse All Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExpandAllFaqs}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAllFaqs}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Dynamic FAQ Filter Bar: Search Input + Category Filter Pills */}
        <div className="w-full bg-[#f8fafc] dark:bg-[#162032] border border-[#e2e8f0] dark:border-slate-800 rounded-2xl p-3.5 shadow-xs mb-8 space-y-3">
          
          {/* FAQ Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              placeholder="Search FAQ questions (e.g., privacy, IRS tax accuracy, free, offline, ATS resume)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 transition-all"
            />
            {faqSearchQuery && (
              <button
                onClick={() => setFaqSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                title="Clear FAQ search"
              >
                ✕
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
                  {cat === 'All' ? 'All Questions' : cat}
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
              No questions found matching your search
            </h4>
            <p className="text-xs text-slate-500 mt-1">"{faqSearchQuery}"</p>
            <button
              onClick={() => { setFaqSearchQuery(''); setSelectedFaqCategory('All'); }}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset FAQ Search
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
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900">
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
                      isOpen ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
                          Was this answer helpful?
                        </span>
                        
                        {feedback ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Thank you for your feedback!
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleFaqFeedback(faq.id, 'yes')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 hover:border-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" /> Yes
                            </button>
                            <button
                              onClick={() => handleFaqFeedback(faq.id, 'no')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-300 transition-colors text-[11px] font-semibold cursor-pointer"
                            >
                              <ThumbsDown className="w-3 h-3" /> No
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

        {/* Footer Support Prompt */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-200/60 dark:border-slate-700 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200 font-medium">
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Have a technical question or feature request not answered here?</span>
          </div>
          <button
            onClick={onOpenDonationModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            Contact Team & Support
          </button>
        </div>
      </section>

      {/* Community Mission Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 uppercase tracking-wide border border-white/10">
              Community Supported Infrastructure
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Help Keep 5,000+ Tools 100% Free To Start
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              {t.supportSubtitle}
            </p>
          </div>
          <button
            onClick={onOpenDonationModal}
            className="px-6 py-3.5 rounded-2xl bg-white text-[#0f172a] hover:bg-slate-100 font-bold text-sm shadow-xl transition-all cursor-pointer transform hover:scale-105 shrink-0"
          >
            {t.supportMissionBtn} →
          </button>
        </div>
      </section>
    </div>
  );
};
