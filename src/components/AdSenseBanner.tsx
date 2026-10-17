import React, { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';

interface AdSenseBannerProps {
  position: 'top' | 'sidebar' | 'bottom';
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({ position, className = '' }) => {
  const [showCodeNotice, setShowCodeNotice] = useState(false);

  if (position === 'top') {
    return (
      <div className={`w-full my-4 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-gray-700 dark:text-gray-400 uppercase tracking-widest px-2 mb-1">
          <span>Sponsored Advertisement • AdSense Top Leaderboard (728x90 / Responsive)</span>
          <button 
            onClick={() => setShowCodeNotice(!showCodeNotice)}
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3" /> Ad Info
          </button>
        </div>
        <div className="w-full min-h-[90px] p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-[#f97316]/50 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">AD</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              High-Yield Savings & Zero-Fee Mortgage Rates 2026
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-lg">
            Compare FDIC-insured APY rates up to 5.25% with leading US banking institutions. Instant pre-qualification.
          </p>
          <div className="mt-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
            <span>Explore High-Rate Savings</span>
            <ExternalLink className="w-3 h-3" />
          </div>

          {showCodeNotice && (
            <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 p-2 flex flex-col justify-center items-center text-xs text-gray-600 dark:text-gray-300 z-10">
              <p className="font-mono text-[11px]">&lt;ins class=&quot;adsbygoogle&quot; data-ad-client=&quot;ca-pub-XXXXXXXXXX&quot; data-ad-slot=&quot;1234567890&quot;&gt;&lt;/ins&gt;</p>
              <button onClick={() => setShowCodeNotice(false)} className="text-[10px] text-orange-500 font-bold mt-1">Close</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (position === 'sidebar') {
    return (
      <div className={`w-full my-4 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-gray-700 dark:text-gray-400 uppercase tracking-widest px-1 mb-1">
          <span>AdSense Skyscraper (300x250)</span>
          <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.2 rounded">Sponsored</span>
        </div>
        <div className="w-full min-h-[250px] p-5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 flex flex-col items-center justify-between text-center relative group hover:border-[#f97316]/50 transition-colors">
          <div className="w-full">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white mb-2">
              USA AUTO INSURANCE
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-2">
              Save up to $780/Year on Car Insurance
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Drivers in your ZIP code who switched saved an average of 34% on comprehensive coverage.
            </p>
          </div>

          <div className="w-full py-2.5 px-4 rounded-xl bg-orange-500 text-white font-bold text-xs shadow hover:bg-orange-600 transition-colors flex items-center justify-center gap-1 cursor-pointer">
            <span>Check Free Quotes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>

          <p className="text-[9px] text-gray-700 dark:text-gray-400 mt-2">
            AdSense Safe • Ad Slot 300x250 Desktop & Mobile
          </p>
        </div>
      </div>
    );
  }

  // position === 'bottom'
  return (
    <div className={`w-full my-6 ${className}`}>
      <div className="flex items-center justify-between text-[10px] text-gray-700 dark:text-gray-400 uppercase tracking-widest px-2 mb-1">
        <span>Sponsored Advertisement • In-Article Native Unit (728x90)</span>
        <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.2 rounded">AdSense Ready</span>
      </div>
      <div className="w-full min-h-[90px] p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left group hover:border-[#f97316]/50 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">PROMOTED</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              SBA Business Loans & Lines of Credit up to $500,000
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Fast approvals for small business owners and freelancers with 600+ credit score. Zero collateral required on qualifying tiers.
          </p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow cursor-pointer transition-colors">
            <span>Check Eligibility</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
