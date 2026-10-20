import React from 'react';
import { X, ShieldCheck, Mail, Globe, CheckCircle2, FileText, AlertCircle, Heart } from 'lucide-react';
import { LogoMark } from './LogoMark';
import { useStrings, COMMON } from '../lib/LangContext';
import { LEGAL_STRINGS } from '../lib/strings/legal';

interface LegalModalProps {
  type: 'about' | 'privacy' | 'terms' | 'contact' | 'disclaimer' | 'legal-safe' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const s = useStrings(LEGAL_STRINGS);
  const c = useStrings(COMMON);

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-white dark:bg-[#111827] rounded-[28px] shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60">
          <div className="flex items-center gap-2.5">
            <LogoMark className="w-7 h-7 text-amber-500" />
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-gray-950 dark:text-white">
                {type === 'about' && s('titleAbout')}
                {type === 'privacy' && s('titlePrivacy')}
                {type === 'terms' && s('titleTerms')}
                {type === 'contact' && s('titleContact')}
                {type === 'disclaimer' && s('titleDisclaimer')}
                {type === 'legal-safe' && s('titleLegalSafe')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {s('subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={c('close')}
            className="p-2.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (500+ Words for AdSense Approval) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* ABOUT US (500+ words) */}
          {type === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <h4 className="font-bold text-orange-900 dark:text-orange-300 text-sm">{s('aboutBannerTitle')}</h4>
                <p className="text-xs text-orange-800/90 dark:text-orange-200/90 mt-1">
                  {s('aboutBannerP')}
                </p>
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('aboutH1')}</h4>
              <p>
                {s('aboutP1')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('aboutH2')}</h4>
              <p>
                {s('aboutP2')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('aboutH3')}</h4>
              <p>
                {s('aboutP3')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('aboutH4')}</h4>
              <p>
                {s('aboutP4')}
              </p>
            </div>
          )}

          {/* PRIVACY POLICY (500+ words) */}
          {type === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
                {s('privacyBanner')}
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('privacyH1')}</h4>
              <p>
                {s('privacyP1')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('privacyH2')}</h4>
              <p>
                {s('privacyP2')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('privacyH3')}</h4>
              <p>
                {s('privacyP3')}
              </p>
              <ul className="list-disc ps-5 space-y-1 text-xs">
                <li>{s('privacyLi1')}</li>
                <li>{s('privacyLi2')}</li>
                <li>{s('privacyLi3')}</li>
              </ul>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('privacyH4')}</h4>
              <p>
                {s('privacyP4')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('privacyH5')}</h4>
              <p>
                {s('privacyP5')}
              </p>
            </div>
          )}

          {/* TERMS OF SERVICE (500+ words) */}
          {type === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('termsH1')}</h4>
              <p>
                {s('termsP1')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('termsH2')}</h4>
              <p>
                {s('termsP2')}
              </p>
              <ul className="list-disc ps-5 space-y-1 text-xs">
                <li>{s('termsLi1')}</li>
                <li>{s('termsLi2')}</li>
                <li>{s('termsLi3')}</li>
                <li>{s('termsLi4')}</li>
              </ul>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('termsH3')}</h4>
              <p>
                {s('termsP3')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('termsH4')}</h4>
              <p>
                {s('termsP4')}
              </p>
            </div>
          )}

          {/* CONTACT US (500+ words) */}
          {type === 'contact' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('contactH1')}</h4>
              <p>
                {s('contactP1')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-orange-600 font-bold">
                    <Mail className="w-4 h-4" />
                    <span>{s('contactEmailLabel')}</span>
                  </div>
                  <a href="mailto:najafdiyal@gmail.com" className="text-xs font-semibold text-gray-900 dark:text-white hover:underline block">
                    najafdiyal@gmail.com
                  </a>
                  <p className="text-[11px] text-gray-500">{s('contactTurnaround')}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>{s('contactNetworkLabel')}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {s('contactNetworkName')}
                  </p>
                  <p className="text-[11px] text-gray-500">{s('contactNetworkNote')}</p>
                </div>
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('contactH2')}</h4>
              <p>
                {s('contactP2')}
              </p>
            </div>
          )}

          {/* DISCLAIMER (500+ words) */}
          {type === 'disclaimer' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{s('disclaimerNotice')}</span>
              </div>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('disclaimerH1')}</h4>
              <p>
                {s('disclaimerP1')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('disclaimerH2')}</h4>
              <p>
                {s('disclaimerP2')}
              </p>

              <h4 className="text-base font-bold text-gray-900 dark:text-white">{s('disclaimerH3')}</h4>
              <p>
                {s('disclaimerP3')}
              </p>
            </div>
          )}

          {/* 100% LEGAL & SAFE */}
          {type === 'legal-safe' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                    {s('legalSafeBannerTitle')}
                  </h4>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 mt-1">
                    {s('legalSafeBannerP')}
                  </p>
                </div>
              </div>
              <ul className="space-y-2 list-disc ps-5 text-xs text-gray-700 dark:text-gray-300">
                <li><strong>{s('legalSafeLi1Label')}</strong> {s('legalSafeLi1Text')}</li>
                <li><strong>{s('legalSafeLi2Label')}</strong> {s('legalSafeLi2Text')}</li>
                <li><strong>{s('legalSafeLi3Label')}</strong> {s('legalSafeLi3Text')}</li>
                <li><strong>{s('legalSafeLi4Label')}</strong> {s('legalSafeLi4Text')}</li>
                <li><strong>{s('legalSafeLi5Label')}</strong> {s('legalSafeLi5Text')}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-gray-50/80 dark:bg-gray-800/60">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#0c4a6e] hover:bg-[#075985] text-white font-bold text-xs cursor-pointer transition-colors shadow-sm"
          >
            {s('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
