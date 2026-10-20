import React from 'react';
import { ShieldCheck, Heart, Sparkles, Mail, Globe, CheckCircle2, BookOpen } from 'lucide-react';
import { Translations, TRANSLATIONS } from '../lib/i18n';
import { LogoMark } from './LogoMark';

interface FooterProps {
  onOpenModal: (type: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'support' | 'legal-safe') => void;
  onNavigatePage?: (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer') => void;
  onOpenDonationModal: () => void;
  t?: Translations;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenModal, 
  onNavigatePage,
  onOpenDonationModal, 
  t = TRANSLATIONS.en 
}) => {
  const handleNav = (page: 'home' | 'about' | 'privacy' | 'contact' | 'blog' | 'terms' | 'disclaimer', modalFallback: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer') => {
    if (onNavigatePage) {
      onNavigatePage(page);
    } else {
      onOpenModal(modalFallback);
    }
  };

  return (
    <footer className="w-full bg-[#f8fafc] dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
                <LogoMark className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-lg font-black text-[#0f172a] dark:text-white">
                Super Crown Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              5000+ Free Online Tools – 100% Unlocked, Legit, Safe & Private. High-precision calculators, document tools, and unit converters for USA, UK, Canada & global users.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Google AdSense & GDPR Compliant</span>
            </div>
          </div>

          {/* Quick Legal Links for AdSense Approval */}
          <div>
            <h4 className="font-bold text-[#0f172a] dark:text-white text-xs uppercase tracking-wider mb-3">
              Legal & Compliance (500+ Words)
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('privacy', 'privacy')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {t.navPrivacy || 'Privacy Policy'} (GDPR / CCPA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('terms', 'terms')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {t.navTerms || 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('disclaimer', 'disclaimer')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {t.navDisclaimer || 'Disclaimer'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenModal('legal-safe')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  100% Unlocked & Safe Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              Company & Guides
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('about', 'about')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {t.navAbout || 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('blog', 'about')}
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-left flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Blog & 800-Word Guides</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact', 'contact')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                >
                  {t.navContact || 'Contact Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDonationModal}
                  className="text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer text-left flex items-center gap-1"
                >
                  <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                  <span>Support Mission (1M People)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Safe & Clean Web Guarantee */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2">
              Zero Lock & Safe Web Guarantee
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              No piracy, zero scrapers, and zero lock screens. All 5,000 calculations and text transformations are rendered 100% client-side for maximum speed and data privacy.
            </p>
            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Support Email:</span>
              <a href="mailto:support@supercrowntools.com" className="font-mono text-blue-600 dark:text-blue-400 font-bold hover:underline">
                support@supercrowntools.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
          <p className="text-slate-500 dark:text-slate-400">
            © 2026 Super Crown Tools. All 5,000+ tools are 100% unlocked and free for public use.
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
