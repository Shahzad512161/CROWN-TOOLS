import React from 'react';
import { ShieldCheck, Heart, Sparkles, Mail, Globe, CheckCircle2, BookOpen } from 'lucide-react';
import { Translations, TRANSLATIONS } from '../lib/i18n';
import { useStrings } from '../lib/LangContext';
import { PAGES_STRINGS } from '../lib/strings/pages';
import { LogoMark } from './LogoMark';

interface FooterProps {
  onOpenModal: (type: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'legal-safe') => void;
  onNavigatePage?: (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer') => void;
  t?: Translations;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenModal, 
  onNavigatePage,

  t = TRANSLATIONS.en
}) => {
  const s = useStrings(PAGES_STRINGS);
  const handleNav = (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer', modalFallback: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer') => {
    if (onNavigatePage) {
      onNavigatePage(page);
    } else {
      onOpenModal(modalFallback);
    }
  };

  return (
    <footer className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
                <LogoMark className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-lg font-black text-[#0f172a] dark:text-white">
                Free Omni Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {s('footerTagline')}
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{s('footerCompliant')}</span>
            </div>
          </div>

          {/* Quick Legal Links for AdSense Approval */}
          <div>
            <h4 className="font-bold text-[#0f172a] dark:text-white text-xs uppercase tracking-wider mb-3">
              {s('footerLegalHeading')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('privacy', 'privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start"
                >
                  {t.navPrivacy || 'Privacy Policy'} {s('footerGdprCcpa')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('terms', 'terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start"
                >
                  {t.navTerms || 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('disclaimer', 'disclaimer')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start"
                >
                  {t.navDisclaimer || 'Disclaimer'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('legal-safe')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  {s('footerSafePolicy')}
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              {s('footerCompanyHeading')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('about', 'about')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start"
                >
                  {t.navAbout || 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('blog', 'about')}
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-start flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{s('footerBlogGuides')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact', 'contact')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-start"
                >
                  {t.navContact || 'Contact Us'}
                </button>
              </li>
            </ul>
          </div>

          {/* Safe & Clean Web Guarantee */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
              {s('footerGuaranteeHeading')}
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {s('footerGuaranteeText')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>{s('footerSupportEmail')}</span>
              <a href="mailto:support@supercrowntools.com" className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline break-all">
                support@supercrowntools.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start text-[11px]">
          <p className="text-slate-500 dark:text-slate-400">
            {s('footerCopyright')}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              {t.footerMission}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
