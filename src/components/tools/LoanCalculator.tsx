import React, { useState } from 'react';
import { DollarSign, Clock, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

export const LoanCalculator: React.FC = () => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);
  const [loanAmount, setLoanAmount] = useState<number>(25000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(48);
  const [extraPayment, setExtraPayment] = useState<number>(50);
  const [copied, setCopied] = useState<boolean>(false);

  // Standard monthly payment calculation
  const monthlyRate = interestRate / 100 / 12;
  const standardMonthlyPayment =
    monthlyRate > 0 && loanTermMonths > 0
      ? (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : loanAmount / (loanTermMonths || 1);

  const totalStandardPaid = standardMonthlyPayment * loanTermMonths;
  const totalStandardInterest = Math.max(0, totalStandardPaid - loanAmount);

  // Extra payment calculation (amortization loop)
  let balance = loanAmount;
  let acceleratedMonths = 0;
  let acceleratedTotalInterest = 0;
  const acceleratedMonthlyPayment = standardMonthlyPayment + extraPayment;

  while (balance > 0 && acceleratedMonths < 360) {
    acceleratedMonths++;
    const interestForMonth = balance * monthlyRate;
    acceleratedTotalInterest += interestForMonth;
    const principalPaid = Math.min(balance, acceleratedMonthlyPayment - interestForMonth);
    balance -= principalPaid;
    if (balance <= 0.01) break;
  }

  const interestSaved = Math.max(0, totalStandardInterest - acceleratedTotalInterest);
  const monthsSaved = Math.max(0, loanTermMonths - acceleratedMonths);

  const handleCopy = () => {
    const money = (n: number) => `$${Math.round(n).toLocaleString(lang)}`;
    const text = [
      s('loanSummaryTitle'),
      s('sumLoanAmount').replace('{v}', `$${loanAmount.toLocaleString(lang)}`),
      s('sumInterestApr').replace('{rate}', String(interestRate)),
      s('sumTermMonths')
        .replace('{months}', String(loanTermMonths))
        .replace('{years}', (loanTermMonths / 12).toFixed(1)),
      '---------------------------------------',
      s('sumStandardMonthly').replace('{v}', money(standardMonthlyPayment)),
      s('sumTotalStandardInterest').replace('{v}', money(totalStandardInterest)),
      s('sumWithExtra').replace('{v}', `$${extraPayment.toLocaleString(lang)}`),
      `- ${s('sumInterestSaved').replace('{v}', money(interestSaved))}`,
      `- ${s('sumPaidOffEarlier').replace('{n}', String(monthsSaved))}`
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💵</span> {s('loanTitle')}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('loanSubtitle')}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? c('copied') : s('copySummary')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>{s('loanAmountLabel')}</span>
              <span className="text-orange-600 font-bold">${loanAmount.toLocaleString(lang)}</span>
            </div>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                min="500"
                max="250000"
                step="500"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                className="w-full ps-8 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('loanAprLabel')}
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="36"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('loanTermMonthsLabel')}
              </label>
              <select
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value={12}>{s('loanTermOption1').replace('{m}', '12')}</option>
                {[24, 36, 48, 60, 72, 84].map((m) => (
                  <option key={m} value={m}>
                    {s('loanTermOption').replace('{m}', String(m)).replace('{y}', String(m / 12))}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>{s('extraMonthlyPrincipal')}</span>
              <span className="text-emerald-600 font-bold">+${extraPayment.toLocaleString(lang)}{s('perMonth')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-emerald-400/30">
          <div>
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                {s('monthlyPayment')}
              </span>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${Math.round(standardMonthlyPayment).toLocaleString(lang)}
                <span className="text-sm font-medium text-gray-500">{s('perMonth')}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {s('totalInterestPaidLine').replace('{v}', `$${Math.round(totalStandardInterest).toLocaleString(lang)}`)}
              </p>
            </div>

            {extraPayment > 0 && (
              <div className="my-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4" /> {s('accelBenefit')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">{s('interestSavedLabel')}</span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ${Math.round(interestSaved).toLocaleString(lang)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">{s('timelineSavedLabel')}</span>
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                      {s('monthsFaster').replace('{n}', String(monthsSaved))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{s('totalPrincipalLabel')}</span>
                <span className="font-semibold">${loanAmount.toLocaleString(lang)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{s('totalCostOfLoanLabel')}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Math.round(totalStandardPaid).toLocaleString(lang)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {s('loanFooterNote')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
