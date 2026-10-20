import React, { useState } from 'react';
import { DollarSign, Landmark, PieChart, ShieldAlert, Copy, Check } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

export const TaxCalculator: React.FC = () => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);

  const stateName = (code: string, fallback: string): string => {
    const entry = CALC_STRINGS[`state_${code}`];
    return entry ? entry[lang] ?? entry.en : fallback;
  };
  const [grossSalary, setGrossSalary] = useState<number>(95000);
  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'hoh'>('single');
  const [stateCode, setStateCode] = useState<string>('TX');
  const [preTax401k, setPreTax401k] = useState<number>(6000);
  const [copied, setCopied] = useState(false);

  // 2026 US Standard Deductions
  const standardDeduction = {
    single: 15000,
    married: 30000,
    hoh: 22500
  }[filingStatus];

  // Taxable federal income
  const taxableFederalIncome = Math.max(0, grossSalary - preTax401k - standardDeduction);

  // Progressive Federal Tax Brackets (Single example & married)
  const calculateFederalTax = (taxable: number, status: 'single' | 'married' | 'hoh') => {
    let tax = 0;
    const brackets =
      status === 'married'
        ? [
            { limit: 23200, rate: 0.10 },
            { limit: 94300, rate: 0.12 },
            { limit: 201050, rate: 0.22 },
            { limit: 383900, rate: 0.24 },
            { limit: 487450, rate: 0.32 },
            { limit: 731200, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
          ]
        : [
            { limit: 11600, rate: 0.10 },
            { limit: 47150, rate: 0.12 },
            { limit: 100525, rate: 0.22 },
            { limit: 191950, rate: 0.24 },
            { limit: 243725, rate: 0.32 },
            { limit: 609350, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
          ];

    let previousLimit = 0;
    for (const b of brackets) {
      if (taxable > previousLimit) {
        const taxableChunk = Math.min(taxable, b.limit) - previousLimit;
        tax += taxableChunk * b.rate;
        previousLimit = b.limit;
      } else {
        break;
      }
    }
    return tax;
  };

  const federalIncomeTax = calculateFederalTax(taxableFederalIncome, filingStatus);

  // FICA Taxes
  // Social security: 6.2% up to $168,600
  const socialSecurityCap = 168600;
  const socialSecurityTax = Math.min(grossSalary, socialSecurityCap) * 0.062;
  // Medicare: 1.45% (plus 0.9% over $200k)
  const baseMedicare = grossSalary * 0.0145;
  const additionalMedicare = grossSalary > 200000 ? (grossSalary - 200000) * 0.009 : 0;
  const medicareTax = baseMedicare + additionalMedicare;
  const totalFica = socialSecurityTax + medicareTax;

  // State Tax Rates
  const stateTaxRates: Record<string, { name: string; effectiveRate: number; isZero: boolean }> = {
    TX: { name: 'Texas', effectiveRate: 0, isZero: true },
    FL: { name: 'Florida', effectiveRate: 0, isZero: true },
    WA: { name: 'Washington', effectiveRate: 0, isZero: true },
    NV: { name: 'Nevada', effectiveRate: 0, isZero: true },
    TN: { name: 'Tennessee', effectiveRate: 0, isZero: true },
    CA: { name: 'California', effectiveRate: 0.062, isZero: false },
    NY: { name: 'New York', effectiveRate: 0.054, isZero: false },
    IL: { name: 'Illinois', effectiveRate: 0.0495, isZero: false },
    PA: { name: 'Pennsylvania', effectiveRate: 0.0307, isZero: false },
    OH: { name: 'Ohio', effectiveRate: 0.035, isZero: false },
    NC: { name: 'North Carolina', effectiveRate: 0.045, isZero: false },
    GA: { name: 'Georgia', effectiveRate: 0.053, isZero: false }
  };

  const currentState = stateTaxRates[stateCode] || { name: 'Other State', effectiveRate: 0.045, isZero: false };
  const currentStateName = stateTaxRates[stateCode] ? stateName(stateCode, currentState.name) : s('otherState');
  const filingStatusLabelText =
    filingStatus === 'single' ? s('filingSingle') : filingStatus === 'married' ? s('filingMarried') : s('filingHoh');
  const stateIncomeTax = currentState.isZero ? 0 : Math.max(0, grossSalary - 10000) * currentState.effectiveRate;

  const totalTaxes = federalIncomeTax + totalFica + stateIncomeTax;
  const netTakeHomeAnnual = Math.max(0, grossSalary - totalTaxes - preTax401k);
  const netTakeHomeMonthly = netTakeHomeAnnual / 12;
  const netTakeHomeBiweekly = netTakeHomeAnnual / 26;
  const effectiveTaxRate = grossSalary > 0 ? (totalTaxes / grossSalary) * 100 : 0;

  const handleCopy = () => {
    const money = (n: number) => `$${Math.round(n).toLocaleString(lang)}`;
    const text = [
      s('taxSummaryTitle'),
      s('sumGrossIncome').replace('{v}', `$${grossSalary.toLocaleString(lang)}`),
      s('sumFilingState').replace('{status}', filingStatusLabelText).replace('{state}', currentStateName),
      '-------------------------------------------',
      s('sumTakeHomeAnnual').replace('{v}', money(netTakeHomeAnnual)),
      s('sumTakeHomeMonthly').replace('{v}', money(netTakeHomeMonthly)),
      s('sumTakeHomeBiweekly').replace('{v}', money(netTakeHomeBiweekly)),
      '-------------------------------------------',
      s('sumFederalTax').replace('{v}', money(federalIncomeTax)),
      s('sumFica').replace('{v}', money(totalFica)),
      s('sumStateTax').replace('{v}', money(stateIncomeTax)),
      s('sumTotalTaxes').replace('{v}', money(totalTaxes)).replace('{rate}', effectiveTaxRate.toFixed(1))
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🏛️</span> {s('taxTitle')}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('taxSubtitle')}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? c('copied') : s('copyBreakdown')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>{s('grossSalaryLabel')}</span>
              <span className="text-orange-600 font-bold">${grossSalary.toLocaleString(lang)}</span>
            </div>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                min="250"
                max="2000000"
                step="2500"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value) || 0)}
                className="w-full ps-8 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('filingStatusLabel')}
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="single">{s('filingSingle')}</option>
                <option value="married">{s('filingMarried')}</option>
                <option value="hoh">{s('filingHoh')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('stateResidenceLabel')}
              </label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(stateTaxRates).map(([code, st]) => (
                  <option key={code} value={code}>
                    {stateName(code, st.name)} {st.isZero ? s('stateTaxZeroSuffix') : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>{s('contribLabel')}</span>
              <span className="text-emerald-600 font-bold">${preTax401k.toLocaleString(lang)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="23500"
              step="500"
              value={preTax401k}
              onChange={(e) => setPreTax401k(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              {s('limitNote401k')}
            </p>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-orange-400/30">
          <div>
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                {s('netTakeHomePay')}
              </span>
              <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${Math.round(netTakeHomeMonthly).toLocaleString(lang)}
                <span className="text-sm font-medium text-gray-500">{s('perMonth')}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mt-1">
                {s('perYearLine')
                  .replace('{annual}', `$${Math.round(netTakeHomeAnnual).toLocaleString(lang)}`)
                  .replace('{biweekly}', `$${Math.round(netTakeHomeBiweekly).toLocaleString(lang)}`)}
              </p>
            </div>

            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{s('federalTaxLabel')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Math.round(federalIncomeTax).toLocaleString(lang)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{s('ficaLabel')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${Math.round(totalFica).toLocaleString(lang)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{s('stateTaxLabel').replace('{state}', currentStateName)}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentState.isZero ? s('noStateTax') : `$${Math.round(stateIncomeTax).toLocaleString(lang)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 pt-2 font-bold">
                <span>{s('totalTaxBurdens')}</span>
                <span className="text-red-500">
                  ${Math.round(totalTaxes).toLocaleString(lang)} ({effectiveTaxRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {s('assumesNote').replace('{v}', `$${standardDeduction.toLocaleString(lang)}`)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
