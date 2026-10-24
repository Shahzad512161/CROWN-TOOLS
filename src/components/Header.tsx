
import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Globe,
  Moon,
  Music2,
  Sun,
  Menu,
  X,
  Mail,
  ExternalLink,
} from 'lucide-react';

import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from '../lib/i18n';

import type {
  SupportedLanguage,
  Translations,
} from '../lib/i18n';

import { DonationHeart } from './DonationHeart';
import { SpaLink } from './SpaLink';
import { LogoMark } from './LogoMark';

export interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateHome?: () => void;
  onNavigatePage?: (
    page:
      | 'home'
      | 'about'
      | 'privacy'
      | 'contact'
      | 'blog'
      | 'terms'
      | 'disclaimer'
  ) => void;
  currentLang?: SupportedLanguage;
  onChangeLang?: (lang: SupportedLanguage) => void;
  t?: Translations;
  activePage?: string;
}

type NavigationPage =
  | 'home'
  | 'about'
  | 'privacy'
  | 'contact'
  | 'blog'
  | 'terms'
  | 'disclaimer';

const navigationItems: {
  label: string;
  page: NavigationPage;
}[] = [
  { label: 'About Us', page: 'about' },
  { label: 'Privacy Policy', page: 'privacy' },
  { label: 'Contact Us', page: 'contact' },
  { label: 'Blog', page: 'blog' },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: 'https://facebook.com',
    label: 'f',
    className: 'bg-[#1877F2]',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    label: '▶',
    className: 'bg-[#FF0000]',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    label: '◎',
    className:
      'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com',
    label: 'tiktok',
    className: 'bg-black',
  },
  {
    name: 'WhatsApp',
    href: 'https://whatsapp.com',
    label: 'W',
    className: 'bg-[#25D366]',
  },
  {
    name: 'X',
    href: 'https://x.com',
    label: '𝕏',
    className: 'bg-black',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    label: 'in',
    className: 'bg-[#0A66C2]',
  },
  {
    name: 'Pinterest',
    href: 'https://pinterest.com',
    label: 'P',
    className: 'bg-[#E60023]',
  },
];

export function Header({
  darkMode = false,
  onToggleDarkMode,
  onNavigateHome,
  onNavigatePage,
  currentLang = 'en',
  onChangeLang,
  t = TRANSLATIONS.en,
  activePage = 'home',
}: HeaderProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find(
      (language) => language.code === currentLang
    ) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(target)
      ) {
        setLangMenuOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [activePage]);

  const navigateToPage = (page: NavigationPage) => {
    onNavigatePage?.(page);
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  };

  const navigateHome = () => {
    onNavigateHome?.();
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  };

  const renderSocialLinks = (compact = false) =>
    socialLinks.map((social) => (
      <a
        key={social.name}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        title={social.name}
        aria-label={`Visit ${social.name}`}
        className={[
          'flex shrink-0 items-center justify-center rounded-full',
          'text-sm font-bold text-white shadow-sm',
          'transition-transform duration-200 hover:scale-110',
          'active:scale-95 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-amber-400',
          compact ? 'h-9 w-9' : 'h-10 w-10',
          social.className,
        ].join(' ')}
      >
        {social.name === 'TikTok' ? (
          <Music2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          social.label
        )}
      </a>
    ));

  return (
    <header className="sticky top-0 z-[100] w-full shadow-sm">
      {/* Top utility bar */}
      <div className="border-b border-white/10 bg-black text-white">
        <div className="mx-auto flex min-h-10 w-full max-w-[1500px] items-center justify-between gap-3 px-3 py-1.5 sm:px-5 lg:px-6">
          <a
            href="mailto:support@supercrowntools.com"
            className="hidden items-center gap-2 text-xs text-white/70 transition-colors hover:text-white sm:inline-flex"
            title="Official Support Email"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            <span>support@supercrowntools.com</span>
          </a>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() =>
                  setLangMenuOpen((open) => !open)
                }
                className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/20 sm:px-3"
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                aria-label={t.selectLanguage}
              >
                <Globe
                  className="h-3.5 w-3.5 shrink-0 text-white/70"
                  aria-hidden="true"
                />

                <span>{currentLangInfo.nativeName}</span>

                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                    langMenuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {langMenuOpen && (
                <div
                  className="absolute end-0 top-full z-[120] mt-2 max-h-[min(70vh,420px)] w-52 overflow-y-auto rounded-xl border border-white/15 bg-neutral-900 py-1.5 text-white shadow-xl"
                  role="listbox"
                  aria-label={t.selectLanguage}
                >
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      role="option"
                      aria-selected={
                        currentLang === language.code
                      }
                      onClick={() => {
                        onChangeLang?.(language.code);
                        setLangMenuOpen(false);
                      }}
                      className={`flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        currentLang === language.code
                          ? 'bg-white/10 font-bold text-white'
                          : 'text-white/75 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="truncate">
                          {language.nativeName}
                        </span>

                        <span className="shrink-0 text-[10px] text-white/45">
                          {language.name}
                        </span>
                      </span>

                      {currentLang === language.code && (
                        <Check
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title={
                  darkMode
                    ? t.toggleThemeLight
                    : t.toggleThemeDark
                }
                aria-label={
                  darkMode
                    ? t.toggleThemeLight
                    : t.toggleThemeDark
                }
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-slate-200 bg-white transition-colors duration-200 dark:border-slate-800 dark:bg-[#0f172a]">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1500px] items-center justify-between gap-3 px-3 py-2 sm:min-h-[72px] sm:px-5 lg:gap-5 lg:px-6">
          {/* Brand */}
          <SpaLink
            href={`/${currentLang}`}
            onNavigate={navigateHome}
            className="group flex min-w-0 shrink items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:gap-3"
            title="Free Omni Tools Home"
            aria-label="Free Omni Tools Home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10 lg:h-11 lg:w-11">
              <LogoMark className="h-full w-full text-amber-500" />
            </span>

            <span className="flex min-w-0 flex-col justify-center">
              <span className="whitespace-nowrap text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-base md:text-lg lg:text-xl">
                Free Omni Tools
              </span>

              <span className="mt-0.5 hidden text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:block sm:text-xs">
                7,300+ Free Online Tools
              </span>
            </span>
          </SpaLink>

          {/* Desktop navigation: visible at lg and above */}
          <nav
            className="hidden items-center gap-3 lg:flex xl:gap-4 2xl:gap-6"
            aria-label="Main navigation"
          >
            {navigationItems.map((item) => {
              const isActive = activePage === item.page;
              const isBlog = item.page === 'blog';

              return (
                <SpaLink
                  key={item.page}
                  href={`/${currentLang}/${item.page}`}
                  onNavigate={() => navigateToPage(item.page)}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                  className={`relative inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isBlog
                      ? isActive
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-red-500 hover:text-red-600 dark:text-red-400'
                      : isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400'
                  }`}
                >
                  {item.label}

                  {isBlog && (
                    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight text-white">
                      New
                    </span>
                  )}

                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-current" />
                  )}
                </SpaLink>
              );
            })}
          </nav>

          {/* Desktop social icons: 2xl and above */}
          <div className="hidden shrink-0 items-center gap-1.5 2xl:flex">
            {renderSocialLinks(true)}
          </div>

          {/* Hamburger: visible below lg */}
          <div className="ml-auto flex shrink-0 items-center lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              aria-label={
                mobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="responsive-header-menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive mobile/tablet menu: hidden at lg and above */}
      <div
        id="responsive-header-menu"
        ref={mobileMenuRef}
        className={`absolute inset-x-0 top-full z-[110] max-h-[calc(100dvh-80px)] overflow-y-auto border-b border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0f172a] lg:hidden ${
          mobileMenuOpen ? 'block' : 'hidden'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6">
          {/* Navigation links */}
          <nav
            className="grid grid-cols-1 gap-1 sm:grid-cols-2"
            aria-label="Mobile navigation"
          >
            {navigationItems.map((item) => {
              const isActive = activePage === item.page;
              const isBlog = item.page === 'blog';

              return (
                <SpaLink
                  key={item.page}
                  href={`/${currentLang}/${item.page}`}
                  onNavigate={() => navigateToPage(item.page)}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                  className={`flex min-h-12 w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    isActive
                      ? isBlog
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>

                  {isBlog ? (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      New
                    </span>
                  ) : (
                    <ExternalLink
                      className="h-4 w-4 opacity-40"
                      aria-hidden="true"
                    />
                  )}
                </SpaLink>
              );
            })}
          </nav>

          {/* Support email */}
          <a
            href="mailto:support@supercrowntools.com"
            tabIndex={mobileMenuOpen ? 0 : -1}
            className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="break-all">
              support@supercrowntools.com
            </span>
          </a>

          {/* Social links */}
          <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Follow us
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {renderSocialLinks()}
            </div>
          </div>

          {/* Additional policy links */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigateToPage('terms')}
              tabIndex={mobileMenuOpen ? 0 : -1}
              className={`text-xs transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                activePage === 'terms'
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Terms &amp; Conditions
            </button>

            <button
              type="button"
              onClick={() => navigateToPage('disclaimer')}
              tabIndex={mobileMenuOpen ? 0 : -1}
              className={`text-xs transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                activePage === 'disclaimer'
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Disclaimer
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

// Preserve the existing named export used by other files.
export { DonationHeart };
