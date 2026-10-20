import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';

// Non-landing views are lazy-loaded so the homepage (and every page) stays
// well under the 1 MB initial-load budget; each view ships as its own chunk.
const ToolWrapper = React.lazy(() => import('./components/ToolWrapper').then((m) => ({ default: m.ToolWrapper })));
const BlogIndex = React.lazy(() => import('./components/BlogSystem').then((m) => ({ default: m.BlogIndex })));
const BlogPostDetail = React.lazy(() => import('./components/BlogSystem').then((m) => ({ default: m.BlogPostDetail })));
const AboutPage = React.lazy(() => import('./components/Pages').then((m) => ({ default: m.AboutPage })));
const PrivacyPage = React.lazy(() => import('./components/Pages').then((m) => ({ default: m.PrivacyPage })));
const ContactPage = React.lazy(() => import('./components/Pages').then((m) => ({ default: m.ContactPage })));
const LegalModal = React.lazy(() => import('./components/LegalModals').then((m) => ({ default: m.LegalModal })));

const ViewFallback = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse" aria-busy="true">
    <div className="h-8 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />
    <div className="h-48 rounded-[28px] bg-slate-200 dark:bg-slate-800" />
  </div>
);
import { TOOLS_BY_SLUG, ALL_TOOLS } from './lib/tools-data';
import { SUPPORTED_LANGUAGES, SupportedLanguage, TRANSLATIONS, localeFromPath, stripLocalePrefix, textDirection, withLocalePrefix } from './lib/i18n';
import { LangContext, lookup } from './lib/LangContext';
import { SITE_BASE, SITE_NAME } from './lib/site';
import { localizedTool } from './lib/tools-fr';
import { getBlogPostForTool } from './lib/blog-data';
import { CHROME } from './lib/strings-chrome';
import { X } from 'lucide-react';

export type AppView = 'home' | 'tool' | 'blog' | 'blog-post' | 'about' | 'privacy' | 'contact' | 'terms' | 'disclaimer' | 'not-found';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [legalModalType, setLegalModalType] = useState<'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'legal-safe' | null>(null);

  // Initialize Theme, Auto Language, and URL PopState routing
  useEffect(() => {
    // 1. THEME: Light #ffffff / Dark #111827 with LocalStorage persistence
    const savedTheme = localStorage.getItem('supercrown_theme');
    let isDark = false;
    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // 2. LANGUAGE: the locale comes from the URL prefix (/en or /fr).
    // A bare path (main domain) canonicalizes to the default locale /en.
    const detected = localeFromPath(window.location.pathname);
    setCurrentLang(detected);
    document.documentElement.lang = detected;
    document.documentElement.dir = textDirection(detected);

    // Canonicalize to the locale-prefixed URL (domain/en/... or domain/fr/...)
    const rawPath = window.location.pathname;
    const stripped = stripLocalePrefix(rawPath);
    if (rawPath !== withLocalePrefix(stripped, detected)) {
      window.history.replaceState({}, '', withLocalePrefix(stripped, detected) + window.location.search);
    }

    // 3. Routing Sync
    const handlePopState = () => {
      const loc = localeFromPath(window.location.pathname);
      setCurrentLang(loc);
      document.documentElement.lang = loc;
      document.documentElement.dir = textDirection(loc);
      const path = stripLocalePrefix(window.location.pathname);
      const params = new URLSearchParams(window.location.search);
      const queryTool = params.get('tool');

      if (path === '/about') {
        setCurrentView('about');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/contact') {
        setCurrentView('contact');
      } else if (path === '/blog') {
        setCurrentView('blog');
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '').trim();
        if (slug && TOOLS_BY_SLUG[slug]) {
          setActiveBlogSlug(slug);
          setCurrentView('blog-post');
        } else if (slug) {
          setCurrentView('not-found');
        } else {
          setCurrentView('blog');
        }
      } else if (queryTool && TOOLS_BY_SLUG[queryTool]) {
        setActiveToolSlug(queryTool);
        setCurrentView('tool');
      } else if (path.startsWith('/tool/')) {
        const slug = path.replace('/tool/', '').trim();
        if (slug && TOOLS_BY_SLUG[slug]) {
          setActiveToolSlug(slug);
          setCurrentView('tool');
        } else {
          setCurrentView('not-found');
        }
      } else if (path === '/' || path === '') {
        setCurrentView('home');
        setActiveToolSlug(null);
        setActiveBlogSlug(null);
      } else {
        setCurrentView('not-found');
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('supercrown_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('supercrown_theme', 'light');
      }
      return next;
    });
  };

  const handleChangeLanguage = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    localStorage.setItem('supercrown_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = textDirection(lang);
    // Rewrite the current URL under the new locale: /en/tool/x -> /fr/tool/x
    const stripped = stripLocalePrefix(window.location.pathname);
    window.history.pushState({}, '', withLocalePrefix(stripped, lang) + window.location.search);
  };

  // Navigation Helpers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setActiveToolSlug(null);
    setActiveBlogSlug(null);
    window.history.pushState({}, '', withLocalePrefix('/', currentLang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePage = (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer') => {
    if (page === 'home') {
      handleNavigateHome();
      return;
    }
    if (page === 'terms' || page === 'disclaimer') {
      setLegalModalType(page);
      return;
    }
    setCurrentView(page);
    window.history.pushState({}, '', withLocalePrefix(`/${page}`, currentLang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (slug: string) => {
    setActiveToolSlug(slug);
    setCurrentView('tool');
    window.history.pushState({}, '', withLocalePrefix(`/tool/${slug}`, currentLang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlogPost = (slug: string) => {
    setActiveBlogSlug(slug);
    setCurrentView('blog-post');
    window.history.pushState({}, '', withLocalePrefix(`/blog/${slug}`, currentLang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBlog = () => {
    setCurrentView('blog');
    window.history.pushState({}, '', withLocalePrefix('/blog', currentLang));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // SEO head manager: every view gets its OWN title, description, canonical
  // and hreflang set (one shared static canonical for all pages is an SEO
  // defect). Unknown routes render the not-found view with noindex, so they
  // can never become soft 404s or duplicate-content traps.
  useEffect(() => {
    const path =
      currentView === 'tool' && activeToolSlug
        ? `/tool/${activeToolSlug}`
        : currentView === 'blog'
          ? '/blog'
          : currentView === 'blog-post' && activeBlogSlug
            ? `/blog/${activeBlogSlug}`
            : currentView === 'about'
              ? '/about'
              : currentView === 'privacy'
                ? '/privacy'
                : currentView === 'contact'
                  ? '/contact'
                  : '/';
    let title = `${SITE_NAME} — ${t.logoSubtitle}`;
    let description = t.heroSubtitle;
    if (currentView === 'tool' && activeToolSlug && TOOLS_BY_SLUG[activeToolSlug]) {
      const lt = localizedTool(TOOLS_BY_SLUG[activeToolSlug], currentLang);
      title = `${lt.name} — ${SITE_NAME}`;
      description = lt.description;
    } else if (currentView === 'blog') {
      title = `${t.navBlog} — ${SITE_NAME}`;
    } else if (currentView === 'blog-post' && activeBlogSlug && TOOLS_BY_SLUG[activeBlogSlug]) {
      const post = getBlogPostForTool(TOOLS_BY_SLUG[activeBlogSlug], currentLang);
      title = `${post.title} — ${SITE_NAME}`;
      description = post.metaDescription;
    } else if (currentView === 'about') {
      title = `${t.navAbout} — ${SITE_NAME}`;
    } else if (currentView === 'privacy') {
      title = `${t.navPrivacy} — ${SITE_NAME}`;
    } else if (currentView === 'contact') {
      title = `${t.navContact} — ${SITE_NAME}`;
    } else if (currentView === 'not-found') {
      title = `${lookup(CHROME, currentLang, 'notFoundTitle')} — ${SITE_NAME}`;
    }
    document.title = title;

    const suffix = path === '/' ? '' : path;
    const url = `${SITE_BASE}/${currentLang}${suffix}`;
    const ensureLink = (rel: string, hreflang: string | null, href: string) => {
      const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
      let el = document.head.querySelector(sel) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        if (hreflang) el.hreflang = hreflang;
        document.head.appendChild(el);
      }
      el.href = href;
    };
    ensureLink('canonical', null, url);
    for (const l of SUPPORTED_LANGUAGES) {
      ensureLink('alternate', l.code, `${SITE_BASE}/${l.code}${suffix}`);
    }
    ensureLink('alternate', 'x-default', `${SITE_BASE}/en${suffix}`);

    const setMeta = (key: 'name' | 'property', name: string, content: string) => {
      let el = document.head.querySelector(`meta[${key}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(key, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setMeta('name', 'description', description);
    setMeta('name', 'robots', currentView === 'not-found' ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
  }, [currentView, activeToolSlug, activeBlogSlug, currentLang, t]);

  return (
   <LangContext.Provider value={currentLang}>
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        darkMode ? 'dark bg-[#111827] text-gray-100' : 'bg-[#ffffff] text-gray-900'
      }`}
    >
      {/* ========================================================================= */}
      {/* DESIGN - 2 LINE TOP HEADER SYSTEM */}
      {/* 1. Top Black Bar (36px): [❤️ Support Mission] [support@ + Sun/Moon] */}
      {/* 2. Main White Header (68px): [👑 Logo Super Crown Tools] [About | Privacy | Contact | Blog] [Social + Ad] */}
      {/* ========================================================================= */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onNavigateHome={handleNavigateHome}
        onNavigatePage={handleNavigatePage}
        currentLang={currentLang}
        onChangeLang={handleChangeLanguage}
        t={t}
        activePage={currentView}
      />

      {/* ========================================================================= */}
      {/* MAIN VIEW SYSTEM: 100% UNLOCKED TOOLS, BLOG, PAGES, OR HOMEPAGE */}
      {/* ========================================================================= */}
      <main className="flex-1">
       <Suspense fallback={<ViewFallback />}>
        {currentView === 'tool' && activeToolSlug ? (
          <ToolWrapper
            slug={activeToolSlug}
            onNavigateHome={handleNavigateHome}
            onNavigateTool={handleSelectTool}
            onNavigateBlogGuide={handleSelectBlogPost}
            t={t}
            lang={currentLang}
          />
        ) : currentView === 'blog' ? (
          <BlogIndex
            onSelectPost={handleSelectBlogPost}
            onNavigateHome={handleNavigateHome}
            onSelectTool={handleSelectTool}
          />
        ) : currentView === 'blog-post' && activeBlogSlug ? (
          <BlogPostDetail
            slug={activeBlogSlug}
            onNavigateHome={handleNavigateHome}
            onNavigateBlog={handleNavigateBlog}
            onSelectTool={handleSelectTool}
          />
        ) : currentView === 'about' ? (
          <AboutPage
            onNavigateHome={handleNavigateHome}
            onNavigateBlog={handleNavigateBlog}
            t={t}
          />
        ) : currentView === 'privacy' ? (
          <PrivacyPage
            onNavigateHome={handleNavigateHome}
            onNavigateBlog={handleNavigateBlog}
            t={t}
          />
        ) : currentView === 'contact' ? (
          <ContactPage
            onNavigateHome={handleNavigateHome}
            onNavigateBlog={handleNavigateBlog}
            t={t}
          />
        ) : currentView === 'not-found' ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <p className="text-6xl sm:text-7xl font-display text-slate-300 dark:text-slate-600">404</p>
            <h1 className="mt-4 text-2xl sm:text-3xl font-display text-slate-950 dark:text-white">
              {lookup(CHROME, currentLang, 'notFoundTitle')}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {lookup(CHROME, currentLang, 'notFoundText')}
            </p>
            <button
              onClick={handleNavigateHome}
              className="mt-8 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              {lookup(CHROME, currentLang, 'backHomeBtn')}
            </button>
          </div>
        ) : (
          <HomePage
            onSelectTool={handleSelectTool}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            t={t}
            lang={currentLang}
          />
        )}
       </Suspense>
      </main>

      {/* Footer with AdSense Compliance Links & Blog Navigation */}
      <Footer
        onOpenModal={(type) => setLegalModalType(type)}
        onNavigatePage={handleNavigatePage}
        t={t}
      />

      {/* Compliance / Terms / Disclaimer Modals */}
      <Suspense fallback={null}>
        <LegalModal
          type={legalModalType}
          onClose={() => setLegalModalType(null)}
        />
      </Suspense>

    </div>
   </LangContext.Provider>
  );
}
