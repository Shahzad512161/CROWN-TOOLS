/**
 * Internationalization — English only for now.
 *
 * Routing is locale-prefixed: English lives under /en (domain/en/...).
 * When localization launches, add the locale code here (e.g. 'ar'),
 * restore its dictionary, and extend LOCALE_PREFIXES — every route,
 * link and sitemap URL already flows through the helpers below.
 */
export type SupportedLanguage = 'en';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English (US/UK)', flag: '🇺🇸', dir: 'ltr' },
];

export const DEFAULT_LOCALE: SupportedLanguage = 'en';

/** URL path prefixes that carry a locale. Only '/en' is active today. */
export const LOCALE_PREFIXES = ['/en'] as const;

/** Strip the locale prefix from a pathname: '/en/tool/x' -> '/tool/x', '/en' -> '/'. */
export function stripLocalePrefix(pathname: string): string {
  for (const prefix of LOCALE_PREFIXES) {
    if (pathname === prefix) return '/';
    if (pathname.startsWith(prefix + '/')) return pathname.slice(prefix.length);
  }
  return pathname;
}

/** Prefix a path with the current locale: '/tool/x' -> '/en/tool/x', '/' -> '/en'. */
export function withLocalePrefix(path: string): string {
  const clean = path.startsWith('/') ? path : '/' + path;
  if (clean === '/') return '/en';
  if (LOCALE_PREFIXES.some((p) => clean === p || clean.startsWith(p + '/'))) return clean;
  return '/en' + clean;
}

export interface Translations {
  topTrustBar: string;
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
  heroGreetingSub: 'Which free tool do you need today?',
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

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: BASE_TRANSLATION_EN,
};

/** English is the only locale for now, so detection always returns 'en'. */
export function detectUserLanguage(): SupportedLanguage {
  return DEFAULT_LOCALE;
}
