import React, { useState } from 'react';
import { ArrowLeftRight, TrendingUp, DollarSign, Copy, Check, RefreshCw } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

export const CurrencyConverter: React.FC = () => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);

  const curName = (code: string, fallback: string): string => {
    const entry = CALC_STRINGS[`cur_${code}`];
    return entry ? entry[lang] ?? entry.en : fallback;
  };
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('PKR');
  const [copied, setCopied] = useState(false);

  // Benchmarked exchange rates relative to 1 USD
  const ratesToUSD: Record<string, { rate: number; name: string; symbol: string }> = {
    USD: { rate: 1.0, name: 'US Dollar', symbol: '$' },
    EUR: { rate: 0.92, name: 'Euro', symbol: '€' },
    GBP: { rate: 0.79, name: 'British Pound', symbol: '£' },
    CAD: { rate: 1.36, name: 'Canadian Dollar', symbol: 'CA$' },
    AUD: { rate: 1.52, name: 'Australian Dollar', symbol: 'A$' },
    PKR: { rate: 278.4, name: 'Pakistani Rupee', symbol: 'Rs' },
    INR: { rate: 83.45, name: 'Indian Rupee', symbol: '₹' },
    AED: { rate: 3.67, name: 'UAE Dirham', symbol: 'AED' },
    SAR: { rate: 3.75, name: 'Saudi Riyal', symbol: 'SAR' },
    JPY: { rate: 154.2, name: 'Japanese Yen', symbol: '¥' },
    CHF: { rate: 0.91, name: 'Swiss Franc', symbol: 'CHF' },
    CNY: { rate: 7.24, name: 'Chinese Yuan', symbol: '¥' }
  };

  // Convert amount: (amount / fromRate) * toRate
  const fromRate = ratesToUSD[fromCurrency]?.rate || 1;
  const toRate = ratesToUSD[toCurrency]?.rate || 1;
  const unitRate = toRate / fromRate;
  const convertedResult = amount * unitRate;

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleCopy = () => {
    const text = s('curCopyLine')
      .replace('{amount}', amount.toLocaleString(lang))
      .replaceAll('{from}', fromCurrency)
      .replace('{result}', convertedResult.toLocaleString(lang, { maximumFractionDigits: 2 }))
      .replaceAll('{to}', toCurrency)
      .replace('{rate}', unitRate.toFixed(4));
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const benchmarkAmounts = [10, 50, 100, 500, 1000, 250];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💱</span> {s('curTitle')}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('curSubtitle')}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? c('copied') : c('copy')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {s('amountLabel')}
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('fromLabel')}
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {Object.entries(ratesToUSD).map(([code, cur]) => (
                  <option key={code} value={code}>
                    {code} - {curName(code, cur.name)} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="mt-6 p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-sm"
              title={s('swapTitle')}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('toLabel')}
              </label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {Object.entries(ratesToUSD).map(([code, cur]) => (
                  <option key={code} value={code}>
                    {code} - {curName(code, cur.name)} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Benchmark Matrix */}
          <div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
              {s('quickTableLabel')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {benchmarkAmounts.map((amt) => (
                <div key={amt} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-center">
                  <div className="text-gray-500 text-[10px]">{amt} {fromCurrency}</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {(amt * unitRate).toLocaleString(lang, { maximumFractionDigits: 1 })} {toCurrency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-emerald-400/30">
          <div>
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                {s('convertedValueLabel')}
              </span>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-1 break-words">
                {convertedResult.toLocaleString(lang, { maximumFractionDigits: 2 })} {toCurrency}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mt-1">
                {s('rateLine')
                  .replace('{amount}', amount.toLocaleString(lang))
                  .replaceAll('{from}', fromCurrency)
                  .replace('{rate}', unitRate.toFixed(4))
                  .replace('{to}', toCurrency)}
              </p>
            </div>

            <div className="my-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">{s('inverseRateLabel')}</span>
                <p className="text-gray-600 dark:text-gray-400">
                  1 {toCurrency} = {(1 / unitRate).toFixed(4)} {fromCurrency}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-800 dark:text-gray-200 block mb-1">{s('markupWarningLabel')}</span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {s('markupText').replace('{v}', `$${((amount * 0.032) / fromRate).toFixed(2)}`)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {s('curFooter')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
