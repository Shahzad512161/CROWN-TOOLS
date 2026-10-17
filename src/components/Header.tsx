// V9 Final - Complete Updated Header
import React from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, Translations, TRANSLATIONS } from '../lib/i18n';
import { DonationHeart } from './DonationHeart';

export interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateHome?: () => void;
  onNavigatePage?: (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer') => void;
  onOpenSupportModal?: () => void;
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
  onOpenSupportModal,
  currentLang = 'en',
  onChangeLang,
  t = TRANSLATIONS.en,
  activePage = 'home'
}: HeaderProps) {
  return (
    <header className="w-full sticky top-0 z-[100] select-none shadow-xs">
      {/* ========================================================================= */}
      {/* Top Strip 44px */}
      {/* ========================================================================= */}
      <div className="bg-black text-white text-[13px] h-[44px] flex items-center border-b border-white/10">
        <div className="max-w-[1500px] mx-auto w-full px-4 flex justify-between items-center">
          
          {/* بائیں طرف - سپورٹ مشن */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="flex items-center gap-2 bg-[#ff2d55]/20 hover:bg-[#ff2d55]/30 border border-[#ff2d55]/30 px-4 py-1.5 rounded-full cursor-pointer transition-all text-white"
              title="سپورٹ مشن: ہماری مدد کریں"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span className="font-semibold tracking-wide text-xs sm:text-[13px]">
                ❤️ ہمارا مقصد: آپ کی زندگی آسان بنانا
              </span>
            </button>
          </div>

          {/* دائیں طرف - ای میل + Language + Theme Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:support@supercrowntools.com"
              className="hidden md:block text-white/60 hover:text-white text-[12px] transition-colors"
              title="Official Support Email"
            >
              support@supercrowntools.com
            </a>

            {/* Language Dropdown - 30+ Languages */}
            <select
              value={currentLang}
              onChange={(e) => onChangeLang?.(e.target.value as SupportedLanguage)}
              className="bg-white text-black rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-bold min-w-[140px] sm:min-w-[170px] outline-none cursor-pointer shadow-xs"
              title="Select Language"
            >
              <option value="en">🌐 English</option>
              <option value="ur">🌐 اردو</option>
              <option value="ar">🌐 العربية</option>
              <option value="hi">🌐 Hindi</option>
              {SUPPORTED_LANGUAGES.filter(
                (l) => !['en', 'ur', 'ar', 'hi'].includes(l.code)
              ).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>

            {/* Day / Night toggle button */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer shadow-xs text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Day / Night Mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Header 82px - No AD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 h-[82px] flex items-center shadow-xs transition-colors duration-200">
        <div className="max-w-[1500px] mx-auto w-full px-4 flex justify-between items-center">
          
          {/* Left: 👑 Logo + Title */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer text-left focus:outline-hidden group"
            title="Super Crown Tools Home"
          >
            <div className="text-[34px] leading-none transform group-hover:scale-105 transition-transform flex items-center justify-center">
              👑
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-[20px] sm:text-[26px] font-black tracking-tight text-[#0f172a] dark:text-white flex items-center gap-1.5">
                Super Crown Tools
                <span className="text-[10px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 hidden sm:inline-block">
                  5000+
                </span>
              </h1>
              <span className="text-[11px] sm:text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                5000+ Free Online Tools
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
              ♪
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
