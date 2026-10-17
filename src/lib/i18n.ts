export type SupportedLanguage = 
  | 'en' | 'ur' | 'ar' | 'hi' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ru'
  | 'pt' | 'tr' | 'bn' | 'pa' | 'id' | 'it' | 'ko' | 'vi' | 'pl' | 'nl'
  | 'fa' | 'sv' | 'tl' | 'th' | 'el' | 'he' | 'cs' | 'ro' | 'hu' | 'uk' | 'ms';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو (پاکستان / بھارت)', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية (Middle East)', flag: '🇸🇦', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी (भारत)', flag: '🇮🇳', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español (España/LatAm)', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français (France/Canada)', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch (Deutschland)', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Brasil/Portugal)', flag: '🇵🇹', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা (বাংলাদেশ / ভারত)', flag: '🇧🇩', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ / پنجابی', flag: '🇵🇰', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', dir: 'ltr' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Filipino (Tagalog)', flag: '🇵🇭', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', dir: 'ltr' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' }
];

export interface Translations {
  topTrustBar: string;
  topSupportMissionUrdu: string;
  supportEmail: string;
  logoSubtitle: string;
  searchPlaceholder: string;
  supportMissionBtn: string;
  toggleThemeLight: string;
  toggleThemeDark: string;
  selectLanguage: string;
  
  // Header Navigation Links
  navAbout: string;
  navPrivacy: string;
  navTerms: string;
  navContact: string;
  navDisclaimer: string;
  navBlog: string;

  // Hero Section
  heroGreetingUrdu: string;
  heroGreetingSub: string;
  heroBadgeUnlocked: string;
  heroBadgeNoTracking: string;
  heroBadgeInstant: string;
  badgeFreeToStart: string;
  badgeNoTracking: string;
  badgeInstantResults: string;
  badgeBrowserSafe: string;
  badgeLegitTrusted: string;

  // Sections
  section1Title: string;
  section1Subtitle: string;
  badgePopular: string;
  badgeTrending: string;
  openToolNow: string;
  freeLabel: string;
  section2Title: string;
  section2Subtitle: string;
  catDailyCalc: string;
  catImageTools: string;
  catPdfTools: string;
  catTextAi: string;
  catUnitConv: string;
  catHomeLife: string;
  exploreCategory: string;
  section3Title: string;
  showingOf: string;
  toolsWord: string;
  allCategories: string;
  useToolFree: string;
  noToolsFound: string;
  resetFilters: string;
  pageOf: string;

  // Unlocked Guarantee
  unlockedBannerTitle: string;
  unlockedBannerSubtitle: string;

  // Support Box
  supportTitle: string;
  supportSubtitle: string;
  supportIntro: string;
  supportPayoneer: string;
  supportBinance: string;
  supportCrypto: string;
  supportPayPal: string;
  supportCoffee: string;
  copyAddress: string;
  copiedSuccess: string;
  supportFootnote: string;

  // Tool Page Detail
  howToUseStepsTitle: string;
  stepWord: string;
  legalSafeGuaranteeTitle: string;
  legalSafeGuaranteeDesc: string;
  guideOverviewTitle: string;
  faqSectionTitle: string;
  readCompleteGuideBtn: string;
  relatedToolsTitle: string;
  backToAllTools: string;
  bookmarkBtn: string;
  bookmarkedBtn: string;
}

export const BASE_TRANSLATION_EN: Translations = {
  topTrustBar: '🌍 Trusted by 2M+ Users in USA, UK, Canada & Europe | GDPR Compliant | 100% Legit & Secure Platform',
  topSupportMissionUrdu: 'ہمارا مشن: 10 لاکھ لوگوں کی مدد',
  supportEmail: 'support@supercrowntools.com',
  logoSubtitle: '5000+ Free Online Tools - 100% Unlocked',
  searchPlaceholder: 'Search 5000+ Tools... e.g. Mortgage Calculator, BMI, Insurance, Loan',
  supportMissionBtn: 'Support Mission ❤️',
  toggleThemeLight: 'Switch to Light Mode',
  toggleThemeDark: 'Switch to Dark Mode',
  selectLanguage: 'Language',
  navAbout: 'About Us',
  navPrivacy: 'Privacy Policy',
  navTerms: 'Terms',
  navContact: 'Contact Us',
  navDisclaimer: 'Disclaimer',
  navBlog: 'Blog',
  heroGreetingUrdu: 'السلام علیکم! آپ کو کونسا ٹول چاہیے؟',
  heroGreetingSub: 'Peace be upon you! Which free tool do you need today?',
  heroBadgeUnlocked: '100% Unlocked - No Login',
  heroBadgeNoTracking: 'Zero Tracking - Private',
  heroBadgeInstant: 'Instant Browser Results',
  badgeFreeToStart: '100% Free Forever',
  badgeNoTracking: 'No Tracking - Private',
  badgeInstantResults: 'Instant Results',
  badgeBrowserSafe: 'Browser Safe - No Upload',
  badgeLegitTrusted: 'Legit & AdSense Approved',
  section1Title: '🔥 Most Popular Tools',
  section1Subtitle: 'Directly unlocked and free for users worldwide',
  badgePopular: 'Most Popular',
  badgeTrending: 'Trending',
  openToolNow: 'Open Tool (Unlocked)',
  freeLabel: '100% Free',
  section2Title: 'Browse 5,000+ Tools by Category',
  section2Subtitle: 'Comprehensive verified tools with zero logins, zero blur, and zero lock screens.',
  catDailyCalc: 'Daily Calculators',
  catImageTools: 'Image Tools',
  catPdfTools: 'PDF Tools',
  catTextAi: 'Text & AI Tools',
  catUnitConv: 'Unit Converters',
  catHomeLife: 'Home & Daily Life',
  exploreCategory: 'Explore Tools',
  section3Title: 'All 5000+ Free Online Tools Directory',
  showingOf: 'Showing',
  toolsWord: 'Tools',
  allCategories: 'All Tools (5,000)',
  useToolFree: 'Use Tool Now',
  noToolsFound: 'No tools found matching your search.',
  resetFilters: 'Reset Search & Filters',
  pageOf: 'Page',
  unlockedBannerTitle: '100% Free & Unlocked Guarantee',
  unlockedBannerSubtitle: 'No registration, no credit card, no click-to-unlock blur. All 5,000 tools run directly in your browser.',
  supportTitle: 'Support Our Mission ❤️',
  supportSubtitle: 'We keep 5000+ tools 100% Free, Safe & Legit for everyone. Your support helps us maintain high-speed servers.',
  supportIntro: 'Super Crown Tools is built to empower 1 Million+ students, workers, and families worldwide with completely unlocked daily utilities.',
  supportPayoneer: '💳 Payoneer (Direct to Card)',
  supportBinance: '🟡 Binance Pay ID: 851298616',
  supportCrypto: '₿ Crypto (USDT TRC20, BTC, ETH)',
  supportPayPal: 'PayPal International',
  supportCoffee: '☕ Buy Me a Coffee $3',
  copyAddress: 'Copy Address',
  copiedSuccess: 'Copied to Clipboard!',
  supportFootnote: 'Zero forced subscriptions. Even a small $1 contribution helps us keep 5,000+ utilities available to millions of users.',
  howToUseStepsTitle: 'How To Use in 3 Simple Steps:',
  stepWord: 'Step',
  legalSafeGuaranteeTitle: '100% Legit & Secure Platform Guarantee',
  legalSafeGuaranteeDesc: 'Super Crown strictly excludes copyrighted video rippers, fake IDs, or malicious utilities. All 5,000+ tools are verified 100% safe, legit, and client-side private.',
  guideOverviewTitle: 'Comprehensive Guide & 150-Word Overview',
  faqSectionTitle: 'Frequently Asked Questions (FAQ)',
  readCompleteGuideBtn: '📖 Read Complete Guide',
  relatedToolsTitle: 'Related Tools in Category',
  backToAllTools: 'Browse All 5000+ Free Tools',
  bookmarkBtn: 'Bookmark',
  bookmarkedBtn: 'Saved'
};

export const BASE_TRANSLATION_UR: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 20 لاکھ سے زائد صارفین کا اعتماد | 100% مفت، محفوظ اور قانونی ٹولز',
  topSupportMissionUrdu: 'ہمارا مشن: 10 لاکھ لوگوں کی مدد',
  logoSubtitle: '5000+ مفت آن لائن ٹولز - 100% ان لاکڈ',
  searchPlaceholder: '5000 سے زائد ٹولز تلاش کریں... مثلاً مارگیج، بی ایم آئی، انشورنس',
  supportMissionBtn: 'ہمارا مشن سپورٹ کریں ❤️',
  toggleThemeLight: 'لائٹ موڈ',
  toggleThemeDark: 'ڈارک موڈ',
  selectLanguage: 'زبان منتخب کریں',
  navAbout: 'ہمارے بارے میں',
  navPrivacy: 'پرائیویسی پالیسی',
  navTerms: 'شرائط و ضوابط',
  navContact: 'رابطہ کریں',
  navDisclaimer: 'ڈس کلیمر',
  navBlog: 'بلاگ اور گائیڈز',
  heroGreetingUrdu: 'السلام علیکم! آپ کو کونسا ٹول چاہیے؟',
  heroGreetingSub: 'آپ کی خدمت کے لیے 5000+ مفت آن لائن ٹولز بغیر کسی لاگ ان یا لاک کے حاضر ہیں۔',
  heroBadgeUnlocked: '100% ان لاکڈ - کوئی لاگ ان نہیں',
  heroBadgeNoTracking: 'زیرو ٹریکنگ - پرائیویٹ',
  heroBadgeInstant: 'براؤزر میں فوری نتائج',
  section1Title: '🔥 سب سے زیادہ مقبول ٹولز',
  section1Subtitle: 'مکمل طور پر ان لاک اور دنیا بھر کے تمام صارفین کے لیے مفت',
  badgePopular: 'مقبول ترین',
  badgeTrending: 'ٹرینڈنگ',
  openToolNow: 'ٹول کھولیں (مفت)',
  freeLabel: '100% مفت',
  catDailyCalc: 'روزمرہ کیلکولیٹرز',
  catImageTools: 'تصویری ٹولز',
  catPdfTools: 'پی ڈی ایف ٹولز',
  catTextAi: 'ٹیکسٹ و اے آئی ٹولز',
  catUnitConv: 'یونٹ کنورٹرز',
  catHomeLife: 'گھریلو و روزمرہ زندگی',
  readCompleteGuideBtn: '📖 مکمل گائیڈ پڑھیں',
  guideOverviewTitle: 'ٹول کا جامع تعارف و رہنمائی',
  faqSectionTitle: 'عام طور پر پوچھے جانے والے سوالات (FAQ)'
};

export const BASE_TRANSLATION_AR: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 موثوق به من قبل أكثر من 2 مليون مستخدم | متوافق مع GDPR | أدوات مجانية وآمنة 100%',
  topSupportMissionUrdu: 'مهمتنا: مساعدة 1 مليون شخص',
  logoSubtitle: '5000+ أداة مجانية عبر الإنترنت - مفتوحة 100%',
  searchPlaceholder: 'ابحث في أكثر من 5000 أداة... مثل حساب التمويل العقاري، مؤشر كتلة الجسم',
  supportMissionBtn: 'دعم المهمة ❤️',
  toggleThemeLight: 'الوضع الفاتح',
  toggleThemeDark: 'الوضع الداكن',
  selectLanguage: 'اللغة',
  navAbout: 'من نحن',
  navPrivacy: 'سياسة الخصوصية',
  navTerms: 'الشروط والأحكام',
  navContact: 'اتصل بنا',
  navDisclaimer: 'إخلاء المسؤولية',
  navBlog: 'المدونة',
  heroGreetingUrdu: 'السلام عليكم! ما هي الأداة التي تحتاجها؟',
  heroGreetingSub: 'جميع الأدوات مفتوحة ومجانية 100% بدون أي تسجيل أو قفل.',
  heroBadgeUnlocked: 'مفتوح 100% - بدون تسجيل',
  section1Title: '🔥 الأدوات الأكثر شيوعاً',
  readCompleteGuideBtn: '📖 قراءة الدليل الكامل',
  guideOverviewTitle: 'نظرة عامة ودليل شامل للأداة'
};

export const BASE_TRANSLATION_HI: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 20 लाख+ उपयोगकर्ताओं द्वारा विश्वसनीय | 100% मुफ़्त, सुरक्षित और वैध टूल्स',
  topSupportMissionUrdu: 'हमारा मिशन: 10 लाख लोगों की मदद',
  logoSubtitle: '5000+ मुफ़्त ऑनलाइन टूल्स - 100% अनलॉक',
  searchPlaceholder: '5000+ टूल्स में खोजें... जैसे मॉर्गेज कैलकुलेटर, बीएमआई, लोन',
  supportMissionBtn: 'मिशन का समर्थन करें ❤️',
  toggleThemeLight: 'लाइट मोड',
  toggleThemeDark: 'डार्क मोड',
  selectLanguage: 'भाषा चुनें',
  navAbout: 'हमारे बारे में',
  navPrivacy: 'गोपनीयता नीति',
  navTerms: 'नियम व शर्तें',
  navContact: 'संपर्क करें',
  navDisclaimer: 'अस्वीकरण',
  navBlog: 'ब्लॉग',
  heroGreetingUrdu: 'السلام علیکم! آپ کو کونسا ٹول چاہیے؟',
  heroGreetingSub: 'नमस्ते! आज आपको कौन सा मुफ़्त टूल चाहिए?',
  heroBadgeUnlocked: '100% अनलॉक - बिना लॉगिन',
  section1Title: '🔥 सबसे लोकप्रिय टूल्स',
  readCompleteGuideBtn: '📖 पूरी गाइड पढ़ें',
  guideOverviewTitle: 'टूल का सम्पूर्ण विवरण और गाइड'
};

export const BASE_TRANSLATION_ES: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 Más de 2M+ usuarios en EE. UU. y Europa | Conforme a GDPR | 100% Seguro y Desbloqueado',
  topSupportMissionUrdu: 'Nuestra Misión: Ayudar a 1 Millón de Personas',
  logoSubtitle: '5000+ Herramientas Gratuitas en Línea - 100% Desbloqueadas',
  searchPlaceholder: 'Buscar 5000+ herramientas... p. ej. Hipotecas, IMC, Préstamos',
  supportMissionBtn: 'Apoyar Misión ❤️',
  toggleThemeLight: 'Modo Claro',
  toggleThemeDark: 'Modo Oscuro',
  selectLanguage: 'Idioma',
  navAbout: 'Sobre Nosotros',
  navPrivacy: 'Privacidad',
  navTerms: 'Términos',
  navContact: 'Contacto',
  navDisclaimer: 'Aviso Legal',
  navBlog: 'Blog',
  heroBadgeUnlocked: '100% Desbloqueado - Sin Login',
  section1Title: '🔥 Herramientas Más Populares',
  readCompleteGuideBtn: '📖 Leer Guía Completa'
};

export const BASE_TRANSLATION_FR: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 Utilisé par plus de 2M d\'utilisateurs | Conforme RGPD | 100% Débloqué & Sécurisé',
  topSupportMissionUrdu: 'Notre Mission: Aider 1 Million de Personnes',
  logoSubtitle: '5000+ Outils Gratuits en Ligne - 100% Débloqués',
  searchPlaceholder: 'Rechercher 5000+ outils... ex. Prêt immobilier, IMC, Assurance',
  supportMissionBtn: 'Soutenir la Mission ❤️',
  toggleThemeLight: 'Mode Clair',
  toggleThemeDark: 'Mode Sombre',
  selectLanguage: 'Langue',
  navAbout: 'À Propos',
  navPrivacy: 'Politique de Confidentialité',
  navTerms: 'Conditions',
  navContact: 'Contact',
  navDisclaimer: 'Mentions Légales',
  navBlog: 'Blog',
  heroBadgeUnlocked: '100% Débloqué - Sans Inscription',
  section1Title: '🔥 Outils Les Plus Populaires',
  readCompleteGuideBtn: '📖 Lire le Guide Complet'
};

export const BASE_TRANSLATION_DE: Translations = {
  ...BASE_TRANSLATION_EN,
  topTrustBar: '🌍 Von über 2 Mio. Nutzern geschätzt | DSGVO-konform | 100% Freigeschaltet & Sicher',
  topSupportMissionUrdu: 'Unsere Mission: 1 Million Menschen helfen',
  logoSubtitle: '5000+ Kostenlose Online-Tools - 100% Freigeschaltet',
  searchPlaceholder: '5000+ Tools durchsuchen... z. B. Baufinanzierung, BMI, Kredite',
  supportMissionBtn: 'Mission Unterstützen ❤️',
  toggleThemeLight: 'Heller Modus',
  toggleThemeDark: 'Dunkler Modus',
  selectLanguage: 'Sprache',
  navAbout: 'Über Uns',
  navPrivacy: 'Datenschutz',
  navTerms: 'AGB',
  navContact: 'Kontakt',
  navDisclaimer: 'Haftungsausschluss',
  navBlog: 'Blog',
  heroBadgeUnlocked: '100% Freigeschaltet - Kein Login',
  section1Title: '🔥 Beliebteste Tools',
  readCompleteGuideBtn: '📖 Vollständigen Leitfaden lesen'
};

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: BASE_TRANSLATION_EN,
  ur: BASE_TRANSLATION_UR,
  ar: BASE_TRANSLATION_AR,
  hi: BASE_TRANSLATION_HI,
  es: BASE_TRANSLATION_ES,
  fr: BASE_TRANSLATION_FR,
  de: BASE_TRANSLATION_DE,
  zh: { ...BASE_TRANSLATION_EN, navBlog: '博客', selectLanguage: '语言', readCompleteGuideBtn: '📖 阅读完整指南' },
  ja: { ...BASE_TRANSLATION_EN, navBlog: 'ブログ', selectLanguage: '言語', readCompleteGuideBtn: '📖 完全ガイドを読む' },
  ru: { ...BASE_TRANSLATION_EN, navBlog: 'Блог', selectLanguage: 'Язык', readCompleteGuideBtn: '📖 Читать полное руководство' },
  pt: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Idioma', readCompleteGuideBtn: '📖 Ler Guia Completo' },
  tr: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Dil', readCompleteGuideBtn: '📖 Kılavuzun Tamamını Oku' },
  bn: { ...BASE_TRANSLATION_EN, navBlog: 'ব্লগ', selectLanguage: 'ভাষা', readCompleteGuideBtn: '📖 সম্পূর্ণ গাইড পড়ুন' },
  pa: { ...BASE_TRANSLATION_EN, navBlog: 'ਬਲੌਗ', selectLanguage: 'ਭਾਸ਼ਾ', readCompleteGuideBtn: '📖 ਪੂਰੀ ਗਾਈਡ ਪੜ੍ਹੋ' },
  id: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Bahasa', readCompleteGuideBtn: '📖 Baca Panduan Lengkap' },
  it: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Lingua', readCompleteGuideBtn: '📖 Leggi la Guida Completa' },
  ko: { ...BASE_TRANSLATION_EN, navBlog: '블로그', selectLanguage: '언어', readCompleteGuideBtn: '📖 전체 가이드 읽기' },
  vi: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Ngôn ngữ', readCompleteGuideBtn: '📖 Đọc hướng dẫn đầy đủ' },
  pl: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Język', readCompleteGuideBtn: '📖 Przeczytaj pełny przewodnik' },
  nl: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Taal', readCompleteGuideBtn: '📖 Lees de volledige gids' },
  fa: { ...BASE_TRANSLATION_EN, navBlog: 'وبلاگ', selectLanguage: 'زبان', readCompleteGuideBtn: '📖 خواندن راهنمای کامل' },
  sv: { ...BASE_TRANSLATION_EN, navBlog: 'Blogg', selectLanguage: 'Språk', readCompleteGuideBtn: '📖 Läs hela guiden' },
  tl: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Wika', readCompleteGuideBtn: '📖 Basahin ang Buong Gabay' },
  th: { ...BASE_TRANSLATION_EN, navBlog: 'บล็อก', selectLanguage: 'ภาษา', readCompleteGuideBtn: '📖 อ่านคู่มือฉบับเต็ม' },
  el: { ...BASE_TRANSLATION_EN, navBlog: 'Ιστολόγιο', selectLanguage: 'Γλώσσα', readCompleteGuideBtn: '📖 Διαβάστε τον πλήρη οδηγό' },
  he: { ...BASE_TRANSLATION_EN, navBlog: 'בלוג', selectLanguage: 'שפה', readCompleteGuideBtn: '📖 קרא את המדריך המלא' },
  cs: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Jazyk', readCompleteGuideBtn: '📖 Přečtěte si celého průvodce' },
  ro: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Limbă', readCompleteGuideBtn: '📖 Citiți ghidul complet' },
  hu: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Nyelv', readCompleteGuideBtn: '📖 Teljes útmutató elolvasása' },
  uk: { ...BASE_TRANSLATION_EN, navBlog: 'Блог', selectLanguage: 'Мова', readCompleteGuideBtn: '📖 Читати повний посібник' },
  ms: { ...BASE_TRANSLATION_EN, navBlog: 'Blog', selectLanguage: 'Bahasa', readCompleteGuideBtn: '📖 Baca Panduan Lengkap' }
};

export function detectUserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('supercrown_lang') as SupportedLanguage;
  if (saved && TRANSLATIONS[saved]) {
    return saved;
  }

  const navLangs = navigator.languages || [navigator.language || 'en'];
  for (const lang of navLangs) {
    const code = lang.toLowerCase().slice(0, 2);
    if (code === 'ur' || code === 'pk') return 'ur';
    if (code === 'ar' || code === 'sa' || code === 'ae' || code === 'eg') return 'ar';
    if (code === 'hi' || code === 'in') return 'hi';
    if (code === 'es') return 'es';
    if (code === 'fr') return 'fr';
    if (code === 'de') return 'de';
    if (code === 'zh') return 'zh';
    if (code === 'ja') return 'ja';
    if (code === 'ru') return 'ru';
    if (code === 'pt') return 'pt';
    if (code === 'tr') return 'tr';
    if (code === 'bn') return 'bn';
    if (code === 'pa') return 'pa';
    if (code === 'id') return 'id';
    if (code === 'it') return 'it';
    if (code === 'ko') return 'ko';
    if (code === 'vi') return 'vi';
    if (code === 'pl') return 'pl';
    if (code === 'nl') return 'nl';
    if (code === 'fa') return 'fa';
    if (code === 'sv') return 'sv';
    if (code === 'tl' || code === 'fil') return 'tl';
    if (code === 'th') return 'th';
    if (code === 'el') return 'el';
    if (code === 'he') return 'he';
    if (code === 'cs') return 'cs';
    if (code === 'ro') return 'ro';
    if (code === 'hu') return 'hu';
    if (code === 'uk') return 'uk';
    if (code === 'ms') return 'ms';
  }

  return 'en';
}
