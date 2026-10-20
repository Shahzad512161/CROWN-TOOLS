/**
 * Internationalization — English (default), French, Arabic, Russian.
 *
 * Routing is locale-prefixed: /en, /fr, /ar, /ru (domain/en/... etc.).
 * A bare path is canonicalized to the default locale /en. Arabic is RTL.
 * More locales can be added by extending LOCALE_PREFIXES,
 * SUPPORTED_LANGUAGES and TRANSLATIONS.
 */
export type SupportedLanguage = 'en' | 'fr' | 'ar' | 'ru';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
];

export const DEFAULT_LOCALE: SupportedLanguage = 'en';

/** URL path prefixes that carry a locale. */
export const LOCALE_PREFIXES = ['/en', '/fr', '/ar', '/ru'] as const;

/** The locale a pathname belongs to ('/ar/...' -> 'ar', anything else -> default). */
export function localeFromPath(pathname: string): SupportedLanguage {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return prefix.slice(1) as SupportedLanguage;
    }
  }
  return DEFAULT_LOCALE;
}

/** Text direction for a locale (Arabic is right-to-left). */
export function textDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';
}

/** Strip the locale prefix from a pathname: '/fr/tool/x' -> '/tool/x', '/en' -> '/'. */
export function stripLocalePrefix(pathname: string): string {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix) return '/';
    if (pathname.startsWith(prefix + '/')) return pathname.slice(prefix.length);
  }
  return pathname;
}

/** Prefix a path with a locale: ('/tool/x', 'fr') -> '/fr/tool/x', ('/', 'en') -> '/en'. */
export function withLocalePrefix(path: string, locale: SupportedLanguage = DEFAULT_LOCALE): string {
  const clean = path.startsWith('/') ? path : '/' + path;
  const stripped = stripLocalePrefix(clean);
  if (stripped === '/') return '/' + locale;
  return '/' + locale + stripped;
}

export interface Translations {
  topTrustBar: string;
  supportEmail: string;
  logoSubtitle: string;
  searchPlaceholder: string;
  supportMissionBtn: string;
  missionStrip: string;
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
  heroTitle: string;
  heroSubtitle: string;
  heroGreetingSub: string;
  searchButton: string;
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
  catWordTools: string;
  catSeoTools: string;
  catDevTools: string;
  catMediaTools: string;
  catAiTools: string;
  catSocialTools: string;
  catStudentTools: string;
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

  // Footer
  footerMission: string;

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
  topTrustBar: 'Trusted by 2M+ Users in USA, UK, Canada & Europe | GDPR Compliant | 100% Legit & Secure Platform',
  supportEmail: 'support@supercrowntools.com',
  logoSubtitle: '5000+ Free Online Tools - 100% Unlocked',
  searchPlaceholder: 'Search 5000+ Tools... e.g. Mortgage Calculator, BMI, Insurance, Loan',
  supportMissionBtn: 'Support Mission',
  missionStrip: 'Our Mission: Make Your Life Easier',
  toggleThemeLight: 'Switch to Light Mode',
  toggleThemeDark: 'Switch to Dark Mode',
  selectLanguage: 'Language',
  navAbout: 'About Us',
  navPrivacy: 'Privacy Policy',
  navTerms: 'Terms',
  navContact: 'Contact Us',
  navDisclaimer: 'Disclaimer',
  navBlog: 'Blog',
  heroTitle: 'Every everyday tool. Free and unlocked.',
  heroSubtitle: 'Calculators, PDF and document tools, image and media utilities — everything runs in your browser. No sign-up, no lock screens, no uploads.',
  heroGreetingSub: 'Which free tool do you need today?',
  searchButton: 'Search',
  heroBadgeUnlocked: '100% Unlocked - No Login',
  heroBadgeNoTracking: 'Zero Tracking - Private',
  heroBadgeInstant: 'Instant Browser Results',
  badgeFreeToStart: '100% Free Forever',
  badgeNoTracking: 'No Tracking - Private',
  badgeInstantResults: 'Instant Results',
  badgeBrowserSafe: 'Browser Safe - No Upload',
  badgeLegitTrusted: 'Legit & Trusted',
  section1Title: 'Most Popular Tools',
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
  catWordTools: 'Word Tools',
  catSeoTools: 'SEO Tools',
  catDevTools: 'Developer Tools',
  catMediaTools: 'Video & Audio Tools',
  catAiTools: 'AI Tools',
  catSocialTools: 'Social Media Tools',
  catStudentTools: 'Student & Everyday Tools',
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
  supportTitle: 'Support Our Mission',
  supportSubtitle: 'We keep 5000+ tools 100% Free, Safe & Legit for everyone. Your support helps us maintain high-speed servers.',
  supportIntro: 'Super Crown Tools is built to empower 1 Million+ students, workers, and families worldwide with completely unlocked daily utilities.',
  supportPayoneer: 'Payoneer (Direct to Card)',
  supportBinance: 'Binance Pay ID: 851298616',
  supportCrypto: 'Crypto (USDT TRC20, BTC, ETH)',
  supportPayPal: 'PayPal International',
  supportCoffee: 'Buy Me a Coffee $3',
  copyAddress: 'Copy Address',
  copiedSuccess: 'Copied to Clipboard!',
  supportFootnote: 'Zero forced subscriptions. Even a small $1 contribution helps us keep 5,000+ utilities available to millions of users.',
  footerMission: 'Our Mission: Help 1 Million People • Built for USA, UK, Canada & Global Users',
  howToUseStepsTitle: 'How To Use in 3 Simple Steps:',
  stepWord: 'Step',
  legalSafeGuaranteeTitle: '100% Legit & Secure Platform Guarantee',
  legalSafeGuaranteeDesc: 'Super Crown strictly excludes copyrighted video rippers, fake IDs, or malicious utilities. All 5,000+ tools are verified 100% safe, legit, and client-side private.',
  guideOverviewTitle: 'Comprehensive Guide & 150-Word Overview',
  faqSectionTitle: 'Frequently Asked Questions (FAQ)',
  readCompleteGuideBtn: 'Read Complete Guide',
  relatedToolsTitle: 'Related Tools in Category',
  backToAllTools: 'Browse All 5000+ Free Tools',
  bookmarkBtn: 'Bookmark',
  bookmarkedBtn: 'Saved'
};

export const BASE_TRANSLATION_FR: Translations = {
  topTrustBar: 'Approuvé par plus de 2 millions d\u2019utilisateurs aux États-Unis, au Royaume-Uni, au Canada et en Europe | Conforme au RGPD | Plateforme 100 % légitime et sécurisée',
  supportEmail: 'support@supercrowntools.com',
  logoSubtitle: '5000+ outils en ligne gratuits - 100 % débloqués',
  searchPlaceholder: 'Rechercher parmi 5000+ outils... ex. Calculateur hypothécaire, IMC, Assurance, Prêt',
  supportMissionBtn: 'Soutenir la mission',
  missionStrip: 'Notre mission : vous simplifier la vie',
  toggleThemeLight: 'Passer au mode clair',
  toggleThemeDark: 'Passer au mode sombre',
  selectLanguage: 'Langue',
  navAbout: 'À propos',
  navPrivacy: 'Politique de confidentialité',
  navTerms: 'Conditions',
  navContact: 'Nous contacter',
  navDisclaimer: 'Avertissement',
  navBlog: 'Blog',
  heroTitle: 'Tous les outils du quotidien. Gratuits et débloqués.',
  heroSubtitle: 'Calculatrices, outils PDF et documents, images et médias — tout fonctionne dans votre navigateur. Sans inscription, sans écran de verrouillage, sans envoi de fichiers.',
  heroGreetingSub: 'De quel outil gratuit avez-vous besoin aujourd\u2019hui ?',
  searchButton: 'Rechercher',
  heroBadgeUnlocked: '100 % débloqué - Sans connexion',
  heroBadgeNoTracking: 'Zéro suivi - Privé',
  heroBadgeInstant: 'Résultats instantanés dans le navigateur',
  badgeFreeToStart: '100 % gratuit pour toujours',
  badgeNoTracking: 'Sans suivi - Privé',
  badgeInstantResults: 'Résultats instantanés',
  badgeBrowserSafe: 'Sûr dans le navigateur - Aucun envoi',
  badgeLegitTrusted: 'Légitime et approuvé',
  section1Title: 'Outils les plus populaires',
  section1Subtitle: 'Directement débloqués et gratuits pour les utilisateurs du monde entier',
  badgePopular: 'Populaire',
  badgeTrending: 'Tendance',
  openToolNow: "Ouvrir l'outil (débloqué)",
  freeLabel: '100 % gratuit',
  section2Title: 'Parcourir plus de 5 000 outils par catégorie',
  section2Subtitle: 'Des outils vérifiés et complets, sans inscription, sans floutage et sans écran de verrouillage.',
  catDailyCalc: 'Calculatrices du quotidien',
  catImageTools: "Outils d'image",
  catPdfTools: 'Outils PDF',
  catWordTools: 'Outils Word',
  catSeoTools: 'Outils SEO',
  catDevTools: 'Outils développeur',
  catMediaTools: 'Outils vidéo et audio',
  catAiTools: 'Outils IA',
  catSocialTools: 'Outils réseaux sociaux',
  catStudentTools: 'Outils étudiants et quotidiens',
  catTextAi: 'Texte et IA',
  catUnitConv: "Convertisseurs d'unités",
  catHomeLife: 'Maison et vie quotidienne',
  exploreCategory: 'Explorer les outils',
  section3Title: 'Répertoire de plus de 5000 outils gratuits en ligne',
  showingOf: 'Affichage de',
  toolsWord: 'outils',
  allCategories: 'Tous les outils (5 000)',
  useToolFree: "Utiliser l'outil",
  noToolsFound: 'Aucun outil ne correspond à votre recherche.',
  resetFilters: 'Réinitialiser la recherche et les filtres',
  pageOf: 'Page',
  unlockedBannerTitle: 'Garantie 100 % gratuit et débloqué',
  unlockedBannerSubtitle: "Aucune inscription, aucune carte bancaire, aucun déblocage par clic. Les 5 000 outils fonctionnent directement dans votre navigateur.",
  supportTitle: 'Soutenez notre mission',
  supportSubtitle: 'Nous gardons plus de 5000 outils 100 % gratuits, sûrs et légitimes pour tous. Votre soutien nous aide à maintenir des serveurs rapides.',
  supportIntro: "Super Crown Tools aide plus d'un million d'étudiants, de travailleurs et de familles dans le monde avec des utilitaires quotidiens entièrement débloqués.",
  supportPayoneer: 'Payoneer (directement sur la carte)',
  supportBinance: 'Binance Pay ID : 851298616',
  supportCrypto: 'Crypto (USDT TRC20, BTC, ETH)',
  supportPayPal: 'PayPal International',
  supportCoffee: 'Offrez-moi un café - 3 $',
  copyAddress: "Copier l'adresse",
  copiedSuccess: 'Copié dans le presse-papiers !',
  supportFootnote: "Aucun abonnement forcé. Même un petit don d'1 $ nous aide à garder plus de 5 000 utilitaires accessibles à des millions d'utilisateurs.",
  footerMission: 'Notre mission : aider 1 million de personnes • Conçu pour les États-Unis, le Royaume-Uni, le Canada et le monde entier',
  howToUseStepsTitle: 'Comment utiliser en 3 étapes simples :',
  stepWord: 'Étape',
  legalSafeGuaranteeTitle: 'Garantie de plateforme 100 % légitime et sécurisée',
  legalSafeGuaranteeDesc: "Super Crown exclut strictement les extracteurs de vidéos protégées, les fausses pièces d'identité et les utilitaires malveillants. Les plus de 5 000 outils sont vérifiés, 100 % sûrs, légitimes et privés côté client.",
  guideOverviewTitle: 'Guide complet et aperçu détaillé',
  faqSectionTitle: 'Questions fréquentes (FAQ)',
  readCompleteGuideBtn: 'Lire le guide complet',
  relatedToolsTitle: 'Outils associés dans cette catégorie',
  backToAllTools: 'Parcourir les plus de 5000 outils gratuits',
  bookmarkBtn: 'Marquer',
  bookmarkedBtn: 'Enregistré'
};

export const BASE_TRANSLATION_AR: Translations = {
  topTrustBar: 'موثوق من أكثر من مليوني مستخدم في الولايات المتحدة والمملكة المتحدة وكندا وأوروبا | متوافق مع اللائحة العامة لحماية البيانات | منصة شرعية وآمنة 100%',
  supportEmail: 'support@supercrowntools.com',
  logoSubtitle: 'أكثر من 5000 أداة مجانية على الإنترنت - مفتوحة 100%',
  searchPlaceholder: 'ابحث في أكثر من 5000 أداة... مثال: حاسبة الرهن العقاري، مؤشر كتلة الجسم، التأمين، القروض',
  supportMissionBtn: 'ادعم مهمتنا',
  missionStrip: 'مهمتنا: تسهيل حياتك',
  toggleThemeLight: 'التبديل إلى الوضع الفاتح',
  toggleThemeDark: 'التبديل إلى الوضع الداكن',
  selectLanguage: 'اللغة',
  navAbout: 'من نحن',
  navPrivacy: 'سياسة الخصوصية',
  navTerms: 'الشروط',
  navContact: 'اتصل بنا',
  navDisclaimer: 'إخلاء المسؤولية',
  navBlog: 'المدونة',
  heroTitle: 'كل أدواتك اليومية. مجانية ومفتوحة.',
  heroSubtitle: 'حاسبات وأدوات PDF والمستندات والصور والوسائط — كل شيء يعمل في متصفحك. بدون تسجيل، بدون شاشات قفل، بدون رفع ملفات.',
  heroGreetingSub: 'ما الأداة المجانية التي تحتاجها اليوم؟',
  searchButton: 'بحث',
  heroBadgeUnlocked: 'مفتوح 100% - بدون تسجيل دخول',
  heroBadgeNoTracking: 'بدون تتبع - خصوصية تامة',
  heroBadgeInstant: 'نتائج فورية في المتصفح',
  badgeFreeToStart: 'مجاني 100% إلى الأبد',
  badgeNoTracking: 'بدون تتبع - خصوصية',
  badgeInstantResults: 'نتائج فورية',
  badgeBrowserSafe: 'آمن في المتصفح - بدون رفع',
  badgeLegitTrusted: 'شرعي وموثوق',
  section1Title: 'الأدوات الأكثر شيوعًا',
  section1Subtitle: 'مفتوحة مباشرة ومجانية للمستخدمين في جميع أنحاء العالم',
  badgePopular: 'الأكثر شيوعًا',
  badgeTrending: 'رائج',
  openToolNow: 'افتح الأداة (مفتوحة)',
  freeLabel: 'مجاني 100%',
  section2Title: 'تصفح أكثر من 5,000 أداة حسب الفئة',
  section2Subtitle: 'أدوات شاملة وموثقة بدون تسجيل دخول وبدون تعتيم وبدون شاشات قفل.',
  catDailyCalc: 'حاسبات يومية',
  catImageTools: 'أدوات الصور',
  catPdfTools: 'أدوات PDF',
  catWordTools: 'أدوات Word',
  catSeoTools: 'أدوات SEO',
  catDevTools: 'أدوات المطورين',
  catMediaTools: 'أدوات الفيديو والصوت',
  catAiTools: 'أدوات الذكاء الاصطناعي',
  catSocialTools: 'أدوات التواصل الاجتماعي',
  catStudentTools: 'أدوات الطلاب واليومية',
  catTextAi: 'النص والذكاء الاصطناعي',
  catUnitConv: 'محولات الوحدات',
  catHomeLife: 'المنزل والحياة اليومية',
  exploreCategory: 'استكشف الأدوات',
  section3Title: 'دليل جميع الأدوات المجانية على الإنترنت +5000',
  showingOf: 'عرض',
  toolsWord: 'أداة',
  allCategories: 'كل الأدوات (5,000)',
  useToolFree: 'استخدم الأداة الآن',
  noToolsFound: 'لم يتم العثور على أدوات مطابقة لبحثك.',
  resetFilters: 'إعادة تعيين البحث والفلاتر',
  pageOf: 'صفحة',
  unlockedBannerTitle: 'ضمان مجاني ومفتوح 100%',
  unlockedBannerSubtitle: 'بدون تسجيل، بدون بطاقة ائتمان، بدون تعتيم للنقر للفتح. جميع الأدوات الخمسة آلاف تعمل مباشرة في متصفحك.',
  supportTitle: 'ادعم مهمتنا',
  supportSubtitle: 'نبقي أكثر من 5000 أداة مجانية وآمنة وشرعية 100% للجميع. دعمك يساعدنا في الحفاظ على خوادم سريعة.',
  supportIntro: 'تم بناء Super Crown Tools لتمكين أكثر من مليون طالب وعامل وأسرة حول العالم بأدوات يومية مفتوحة بالكامل.',
  supportPayoneer: 'Payoneer (مباشرة إلى البطاقة)',
  supportBinance: 'Binance Pay ID: 851298616',
  supportCrypto: 'العملات الرقمية (USDT TRC20، BTC، ETH)',
  supportPayPal: 'PayPal الدولي',
  supportCoffee: 'ادعمني بقهوة - 3$',
  copyAddress: 'نسخ العنوان',
  copiedSuccess: 'تم النسخ إلى الحافظة!',
  supportFootnote: 'بدون اشتراكات إجبارية. حتى مساهمة صغيرة بقيمة 1$ تساعدنا في إبقاء أكثر من 5,000 أداة متاحة لملايين المستخدمين.',
  footerMission: 'مهمتنا: مساعدة مليون شخص • مصمم للمستخدمين في الولايات المتحدة والمملكة المتحدة وكندا وحول العالم',
  howToUseStepsTitle: 'كيفية الاستخدام في 3 خطوات بسيطة:',
  stepWord: 'الخطوة',
  legalSafeGuaranteeTitle: 'ضمان منصة شرعية وآمنة 100%',
  legalSafeGuaranteeDesc: 'يستبعد Super Crown بشكل صارم أدوات نسخ الفيديو المحمية بحقوق النشر والهويات المزيفة والأدوات الضارة. جميع الأدوات التي تزيد عن 5,000 تم التحقق منها وهي آمنة وشرعية وخاصة من جانب العميل بنسبة 100%.',
  guideOverviewTitle: 'الدليل الشامل والنظرة العامة',
  faqSectionTitle: 'الأسئلة الشائعة (FAQ)',
  readCompleteGuideBtn: 'اقرأ الدليل الكامل',
  relatedToolsTitle: 'أدوات ذات صلة في هذه الفئة',
  backToAllTools: 'تصفح جميع الأدوات المجانية +5000',
  bookmarkBtn: 'حفظ',
  bookmarkedBtn: 'تم الحفظ'
};

export const BASE_TRANSLATION_RU: Translations = {
  topTrustBar: 'Нам доверяют более 2 млн пользователей в США, Великобритании, Канаде и Европе | Соответствие GDPR | 100% легальная и безопасная платформа',
  supportEmail: 'support@supercrowntools.com',
  logoSubtitle: '5000+ бесплатных онлайн-инструментов - 100% открыто',
  searchPlaceholder: 'Поиск среди 5000+ инструментов... например: ипотечный калькулятор, ИМТ, страхование, кредит',
  supportMissionBtn: 'Поддержать миссию',
  missionStrip: 'Наша миссия: сделать вашу жизнь проще',
  toggleThemeLight: 'Светлая тема',
  toggleThemeDark: 'Тёмная тема',
  selectLanguage: 'Язык',
  navAbout: 'О нас',
  navPrivacy: 'Политика конфиденциальности',
  navTerms: 'Условия',
  navContact: 'Связаться с нами',
  navDisclaimer: 'Отказ от ответственности',
  navBlog: 'Блог',
  heroTitle: 'Все повседневные инструменты. Бесплатно и открыто.',
  heroSubtitle: 'Калькуляторы, инструменты для PDF и документов, изображений и медиа — всё работает прямо в вашем браузере. Без регистрации, без экранов блокировки, без загрузки файлов.',
  heroGreetingSub: 'Какой бесплатный инструмент вам нужен сегодня?',
  searchButton: 'Поиск',
  heroBadgeUnlocked: '100% открыто - без входа',
  heroBadgeNoTracking: 'Без отслеживания - приватно',
  heroBadgeInstant: 'Мгновенные результаты в браузере',
  badgeFreeToStart: '100% бесплатно навсегда',
  badgeNoTracking: 'Без отслеживания - приватно',
  badgeInstantResults: 'Мгновенные результаты',
  badgeBrowserSafe: 'Безопасно в браузере - без загрузок',
  badgeLegitTrusted: 'Легально и надёжно',
  section1Title: 'Самые популярные инструменты',
  section1Subtitle: 'Открыты напрямую и бесплатны для пользователей по всему миру',
  badgePopular: 'Популярное',
  badgeTrending: 'В тренде',
  openToolNow: 'Открыть инструмент (открыто)',
  freeLabel: '100% бесплатно',
  section2Title: 'Более 5 000 инструментов по категориям',
  section2Subtitle: 'Полные проверенные инструменты без регистрации, без затемнения и без экранов блокировки.',
  catDailyCalc: 'Повседневные калькуляторы',
  catImageTools: 'Инструменты для изображений',
  catPdfTools: 'Инструменты PDF',
  catWordTools: 'Инструменты Word',
  catSeoTools: 'SEO-инструменты',
  catDevTools: 'Инструменты разработчика',
  catMediaTools: 'Видео- и аудиоинструменты',
  catAiTools: 'Инструменты ИИ',
  catSocialTools: 'Инструменты для соцсетей',
  catStudentTools: 'Студенческие и повседневные инструменты',
  catTextAi: 'Текст и ИИ',
  catUnitConv: 'Конвертеры единиц',
  catHomeLife: 'Дом и повседневная жизнь',
  exploreCategory: 'Смотреть инструменты',
  section3Title: 'Каталог всех 5000+ бесплатных онлайн-инструментов',
  showingOf: 'Показано',
  toolsWord: 'инструментов',
  allCategories: 'Все инструменты (5 000)',
  useToolFree: 'Использовать инструмент',
  noToolsFound: 'По вашему запросу ничего не найдено.',
  resetFilters: 'Сбросить поиск и фильтры',
  pageOf: 'Страница',
  unlockedBannerTitle: 'Гарантия 100% бесплатно и открыто',
  unlockedBannerSubtitle: 'Без регистрации, без банковской карты, без разблокировки по клику. Все 5 000 инструментов работают прямо в вашем браузере.',
  supportTitle: 'Поддержите нашу миссию',
  supportSubtitle: 'Мы сохраняем более 5000 инструментов на 100% бесплатными, безопасными и легальными для всех. Ваша поддержка помогает нам держать быстрые серверы.',
  supportIntro: 'Super Crown Tools создан, чтобы помочь более чем миллиону студентов, работников и семей по всему миру полностью открытыми повседневными инструментами.',
  supportPayoneer: 'Payoneer (прямо на карту)',
  supportBinance: 'Binance Pay ID: 851298616',
  supportCrypto: 'Крипто (USDT TRC20, BTC, ETH)',
  supportPayPal: 'PayPal International',
  supportCoffee: 'Угостить кофе за $3',
  copyAddress: 'Копировать адрес',
  copiedSuccess: 'Скопировано в буфер обмена!',
  supportFootnote: 'Никаких принудительных подписок. Даже небольшой вклад в $1 помогает нам сохранять более 5 000 инструментов доступными миллионам пользователей.',
  footerMission: 'Наша миссия: помочь 1 миллиону человек • Создано для пользователей США, Великобритании, Канады и всего мира',
  howToUseStepsTitle: 'Как использовать в 3 простых шага:',
  stepWord: 'Шаг',
  legalSafeGuaranteeTitle: 'Гарантия 100% легальной и безопасной платформы',
  legalSafeGuaranteeDesc: 'Super Crown строго исключает загрузчики защищённого видео, поддельные документы и вредоносные утилиты. Все 5 000+ инструментов проверены, на 100% безопасны, легальны и приватны на стороне клиента.',
  guideOverviewTitle: 'Полное руководство и обзор',
  faqSectionTitle: 'Часто задаваемые вопросы (FAQ)',
  readCompleteGuideBtn: 'Читать полное руководство',
  relatedToolsTitle: 'Похожие инструменты в категории',
  backToAllTools: 'Смотреть все 5000+ бесплатных инструментов',
  bookmarkBtn: 'В закладки',
  bookmarkedBtn: 'Сохранено'
};

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: BASE_TRANSLATION_EN,
  fr: BASE_TRANSLATION_FR,
  ar: BASE_TRANSLATION_AR,
  ru: BASE_TRANSLATION_RU,
};

/** Default-locale detection for a bare path: always the default locale (en). */
export function detectUserLanguage(): SupportedLanguage {
  return DEFAULT_LOCALE;
}
