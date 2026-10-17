import React, { useState } from 'react';
import { Heart, Copy, Check, ExternalLink, ShieldCheck, Globe, CreditCard } from 'lucide-react';
import { Translations, TRANSLATIONS } from '../lib/i18n';

interface DonationBoxProps {
  toolName?: string;
  t?: Translations;
}

export const DonationBox: React.FC<DonationBoxProps> = ({ toolName, t = TRANSLATIONS.en }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  const internationalPaymentMethods = [
    {
      id: 'payoneer',
      title: 'Payoneer (Direct to Card)',
      sub: 'Email / Direct Card Transfer',
      val: 'najafdiyal@gmail.com',
      actionType: 'email',
      link: 'mailto:najafdiyal@gmail.com?subject=Support%20Super%20Crown%20Platform&body=Hello%20Super%20Crown%20Team%2C%20I%20would%20like%20to%20support%20your%20mission.',
      badge: 'USD / EUR / GBP',
      btnLabel: 'Transfer via Payoneer'
    },
    {
      id: 'binance',
      title: 'Binance Pay ID: 851298616',
      sub: 'Instant Zero-Fee Crypto Transfer',
      val: '851298616',
      actionType: 'copy',
      link: 'https://pay.binance.com',
      badge: '0% Fees • Instant',
      btnLabel: 'Copy Binance Pay ID'
    },
    {
      id: 'usdt',
      title: 'Crypto USDT (TRC20)',
      sub: 'Tether TRC20 Address',
      val: 'TX9zDiyAL99CrownTRC20OfficialSupport77X',
      actionType: 'copy',
      link: '#',
      badge: 'USDT TRC20',
      btnLabel: 'Copy USDT Address'
    },
    {
      id: 'btc',
      title: 'Bitcoin (BTC) & Ethereum (ETH)',
      sub: 'Multi-Chain Crypto Support',
      val: '0x71C67E7aEdf2122b07eEAdFa49096181d584345B',
      actionType: 'copy',
      link: '#',
      badge: 'BTC / ETH / EVM',
      btnLabel: 'Copy Multi-Chain Address'
    },
    {
      id: 'paypal',
      title: 'PayPal International',
      sub: 'Credit Cards, Debit Cards, Visa, AMEX',
      val: 'https://paypal.me/supercrowntools',
      actionType: 'link',
      link: 'https://paypal.me/supercrowntools',
      badge: 'Global Visa / MC',
      btnLabel: 'Support via PayPal'
    },
    {
      id: 'coffee',
      title: 'Buy Me a Coffee $3',
      sub: 'Quick one-click server contribution',
      val: 'https://buymeacoffee.com/supercrowntools',
      actionType: 'link',
      link: 'https://buymeacoffee.com/supercrowntools',
      badge: 'Quick $3 Contribution',
      btnLabel: 'Contribute $3'
    }
  ];

  return (
    <div className="w-full my-10 p-6 sm:p-10 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-[28px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <Globe className="w-4 h-4 text-gray-500" />
          Independent Community-Funded Platform
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {toolName ? `${toolName}` : 'Super Crown Network'}
        </span>
      </div>

      {/* Title & Subtitle - Wikipedia Style Dignified Tone */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 dark:text-white flex items-center justify-center gap-2">
          <span>{t.supportTitle}</span>
        </h2>
        <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
          {t.supportSubtitle}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed pt-1">
          {t.supportIntro}
        </p>
      </div>

      {/* Grid of Minimalist International Buttons (No pulse, Wikipedia style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {internationalPaymentMethods.map((method) => {
          const isCopied = copiedKey === method.id;
          return (
            <div
              key={method.id}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    {method.badge}
                  </span>
                  {method.actionType === 'copy' && (
                    <span className="text-[10px] text-gray-400">Click to copy</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                  {method.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-3 line-clamp-1">
                  {method.sub}
                </p>
              </div>

              {method.actionType === 'copy' ? (
                <button
                  onClick={() => copyToClipboard(method.val, method.id)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">{t.copiedSuccess}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>{method.btnLabel}</span>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={method.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>{method.btnLabel}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Dignified Footnote */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center space-y-1">
        <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {t.supportFootnote}
        </p>
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Transparent
          </span>
          <span>•</span>
          <span>Zero User Tracking</span>
          <span>•</span>
          <span>5000+ Free Tools Forever</span>
        </div>
      </div>
    </div>
  );
};
