import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ToolWrapper } from './components/ToolWrapper';
import { BlogIndex, BlogPostDetail } from './components/BlogSystem';
import { AboutPage, PrivacyPage, ContactPage } from './components/Pages';
import { LegalModal } from './components/LegalModals';
import { DonationBox } from './components/DonationBox';
import { TOOLS_BY_SLUG, ALL_TOOLS } from './lib/tools-data';
import { SupportedLanguage, TRANSLATIONS, detectUserLanguage } from './lib/i18n';
import { X } from 'lucide-react';

export type AppView = 'home' | 'tool' | 'blog' | 'blog-post' | 'about' | 'privacy' | 'contact' | 'terms' | 'disclaimer';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [legalModalType, setLegalModalType] = useState<'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'support' | 'legal-safe' | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);

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

    // 2. WORLDWIDE AUTO LANGUAGE DETECTION
    const detected = detectUserLanguage();
    setCurrentLang(detected);

    // 3. Routing Sync
    const handlePopState = () => {
      const path = window.location.pathname;
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
        if (slug) {
          setActiveBlogSlug(slug);
          setCurrentView('blog-post');
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
          setCurrentView('home');
        }
      } else {
        setCurrentView('home');
        setActiveToolSlug(null);
        setActiveBlogSlug(null);
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
  };

  // Navigation Helpers
  const handleNavigateHome = () => {
    setCurrentView('home');
    setActiveToolSlug(null);
    setActiveBlogSlug(null);
    window.history.pushState({}, '', '/');
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
    window.history.pushState({}, '', `/${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTool = (slug: string) => {
    setActiveToolSlug(slug);
    setCurrentView('tool');
    window.history.pushState({}, '', `/tool/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBlogPost = (slug: string) => {
    setActiveBlogSlug(slug);
    setCurrentView('blog-post');
    window.history.pushState({}, '', `/blog/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBlog = () => {
    setCurrentView('blog');
    window.history.pushState({}, '', '/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        darkMode ? 'dark bg-[#111827] text-gray-100' : 'bg-[#ffffff] text-gray-900'
      }`}
    >
      {/* ========================================================================= */}
      {/* DESIGN - 2 LINE TOP HEADER SYSTEM */}
      {/* 1. Top Black Bar (36px): [🌐 30+ Languages] [❤️ Support: 10 لاکھ] [support@ + Sun/Moon] */}
      {/* 2. Main White Header (68px): [👑 Logo Super Crown Tools] [About | Privacy | Contact | Blog] [Social + Ad] */}
      {/* ========================================================================= */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onNavigateHome={handleNavigateHome}
        onNavigatePage={handleNavigatePage}
        onOpenSupportModal={() => setIsDonationModalOpen(true)}
        currentLang={currentLang}
        onChangeLang={handleChangeLanguage}
        t={t}
        activePage={currentView}
      />

      {/* ========================================================================= */}
      {/* MAIN VIEW SYSTEM: 100% UNLOCKED TOOLS, BLOG, PAGES, OR HOMEPAGE */}
      {/* ========================================================================= */}
      <main className="flex-1">
        {currentView === 'tool' && activeToolSlug ? (
          <ToolWrapper
            slug={activeToolSlug}
            onNavigateHome={handleNavigateHome}
            onNavigateTool={handleSelectTool}
            onNavigateBlogGuide={handleSelectBlogPost}
            t={t}
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
        ) : (
          <HomePage
            onSelectTool={handleSelectTool}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenDonationModal={() => setIsDonationModalOpen(true)}
            t={t}
          />
        )}
      </main>

      {/* Footer with AdSense Compliance Links & Blog Navigation */}
      <Footer
        onOpenModal={(type) => setLegalModalType(type)}
        onNavigatePage={handleNavigatePage}
        onOpenDonationModal={() => setIsDonationModalOpen(true)}
        t={t}
      />

      {/* Compliance / Terms / Disclaimer Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Support Mission Modal (Wikipedia Style) */}
      {isDonationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#111827] rounded-[28px] border border-gray-200 dark:border-gray-700 shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setIsDonationModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <DonationBox t={t} />
          </div>
        </div>
      )}
    </div>
  );
}
