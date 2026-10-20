// V9 Final - Complete Updated Header
import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Heart, Moon, Music2, Sun } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, Translations, TRANSLATIONS } from '../lib/i18n';
import { DonationHeart } from './DonationHeart';
import { LogoMark } from './LogoMark';

export interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateHome?: () => void;
  onNavigatePage?: (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer') => void;
  currentLang?: SupportedLanguage;
  onChangeLang?: (lang: SupportedLanguage) => void;
  t?: Translations;
  activePage?: string;
}

export default function Header({
  darkMode = false,
  onToggleDarkMode,
  onNavigateHome,
  onNavigatePage,
  currentLang = 'en',
  onChangeLang,
  t = TRANSLATIONS.en,
  activePage = 'home'
}: HeaderProps) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!langMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setLangMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [langMenuOpen]);

  return (
    <header className="w-full sticky top-0 z-[100] select-none shadow-xs">
      {/* ========================================================================= */}
      {/* Top Strip 44px */}
      {/* ========================================================================= */}
      <div className="bg-black text-white text-[13px] h-[44px] flex items-center border-b border-white/10">
        <div className="max-w-[1500px] mx-auto w-full px-4 flex justify-between items-center">
          
          {/* Right - Email + Language + Theme Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@supercrowntools.com"
              className="hidden md:block text-white/60 hover:text-white text-[12px] transition-colors"
              title="Official Support Email"
            >
              support@supercrowntools.com
            </a>

            {/* Language dropdown (URL prefix /en, /es, /fr, /ar, /ru) */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen((open) => !open)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-full ps-3 pe-2 py-1 text-[12px] font-semibold text-white cursor-pointer transition-colors"
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                aria-label={t.selectLanguage}
              >
                <Globe className="w-3.5 h-3.5 text-white/60" />
                <span>{currentLangInfo.nativeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div
                  className="absolute end-0 top-full mt-2 w-44 rounded-xl bg-neutral-900 border border-white/15 shadow-xl py-1.5 z-50"
                  role="listbox"
                  aria-label={t.selectLanguage}
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      role="option"
                      aria-selected={currentLang === l.code}
                      onClick={() => {
                        onChangeLang?.(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] cursor-pointer transition-colors ${
                        currentLang === l.code ? 'text-white font-bold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex items-baseline gap-2 min-w-0">
                        <span className="truncate">{l.nativeName}</span>
                        <span className="text-[11px] text-white/40 shrink-0">{l.name}</span>
                      </span>
                      {currentLang === l.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Day / Night toggle button */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 active:scale-95 transition-all"
                title={darkMode ? t.toggleThemeLight : t.toggleThemeDark}
                aria-label="Toggle Day / Night Mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Header 82px - No AD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 h-[68px] flex items-center shadow-xs transition-colors duration-200">
        <div className="max-w-[1500px] mx-auto w-full px-4 flex justify-between items-center">
          
          {/* Left: Logo + Title */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer text-left focus:outline-hidden group"
            title="Super Crown Tools Home"
          >
            <div className="transform group-hover:scale-105 transition-transform flex items-center justify-center">
              <LogoMark className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="text-[19px] sm:text-[22px] font-display tracking-tight text-[#0f172a] dark:text-white flex items-center gap-1.5">
                Super Crown Tools
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 hidden sm:inline-block">
                  250+
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                250+ Free Online Tools
              </span>
            </div>
          </button>

          {/* Center: Navigation (AdSense Requirement) */}
          <nav className="hidden lg:flex items-center gap-6 font-bold text-[15px]">
            <button
              type="button"
              onClick={() => onNavigatePage?.('about')}
              className={`cursor-pointer transition-colors ${
                activePage === 'about'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold underline underline-offset-4'
                  : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage?.('privacy')}
              className={`cursor-pointer transition-colors ${
                activePage === 'privacy'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold underline underline-offset-4'
                  : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage?.('contact')}
              className={`cursor-pointer transition-colors ${
                activePage === 'contact'
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold underline underline-offset-4'
                  : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Contact Us
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage?.('blog')}
              className={`cursor-pointer transition-colors flex items-center gap-1.5 ${
                activePage === 'blog'
                  ? 'text-red-600 font-extrabold underline underline-offset-4'
                  : 'text-red-500 hover:text-red-600'
              }`}
            >
              <span>Blog</span>
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full uppercase leading-tight animate-pulse">
                New
              </span>
            </button>
          </nav>

          {/* Right: Social Icons (8 Platforms) - w-9 h-9 */}
          <div className="flex items-center gap-1.5">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              f
            </a>
            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              title="YouTube"
              className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              ▶
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              ◎
            </a>
            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              <Music2 className="w-4 h-4" />
            </a>
            {/* WhatsApp */}
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              W
            </a>
            {/* X */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              title="X"
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              𝕏
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              className="w-9 h-9 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              in
            </a>
            {/* Pinterest */}
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Pinterest"
              className="w-9 h-9 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold text-sm shadow-xs hover:scale-110 active:scale-95 transition-transform"
            >
              P
            </a>

            {/* Mobile View Navigation Toggle */}
            <div className="lg:hidden flex items-center ml-1">
              <button
                type="button"
                onClick={() => onNavigatePage?.('blog')}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              >
                Blog
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

// Named export for backwards compatibility
export { Header, DonationHeart };
