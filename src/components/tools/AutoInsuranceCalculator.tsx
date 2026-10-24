import React, { useState } from 'react';
import { Car, Shield, CheckCircle, AlertTriangle, Copy, Check, TrendingDown } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

export const AutoInsuranceCalculator: React.FC = () => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);

  const stateName = (code: string, fallback: string): string => {
    const entry = CALC_STRINGS[`state_${code}`];
    return entry ? entry[lang] ?? entry.en : fallback;
  };
  const [vehicleValue, setVehicleValue] = useState<number>(32000);
  const [driverAge, setDriverAge] = useState<string>('25-34');
  const [stateCode, setStateCode] = useState<string>('CA');
  const [drivingRecord, setDrivingRecord] = useState<string>('clean');
  const [coverageTier, setCoverageTier] = useState<'minimum' | 'standard' | 'comprehensive'>('standard');
  const [deductible, setDeductible] = useState<number>(500);
  const [copied, setCopied] = useState(false);

  // Actuarial multipliers by state
  const stateRates: Record<string, { name: string; multiplier: number; avgAnnual: number }> = {
    CA: { name: 'California', multiplier: 1.15, avgAnnual: 2290 },
    TX: { name: 'Texas', multiplier: 1.12, avgAnnual: 2150 },
    FL: { name: 'Florida', multiplier: 1.38, avgAnnual: 2950 },
    NY: { name: 'New York', multiplier: 1.25, avgAnnual: 2540 },
    IL: { name: 'Illinois', multiplier: 0.95, avgAnnual: 1780 },
    OH: { name: 'Ohio', multiplier: 0.82, avgAnnual: 1420 },
    PA: { name: 'Pennsylvania', multiplier: 0.98, avgAnnual: 1840 },
    GA: { name: 'Georgia', multiplier: 1.14, avgAnnual: 2210 },
    NC: { name: 'North Carolina', multiplier: 0.84, avgAnnual: 1450 },
    MI: { name: 'Michigan', multiplier: 1.45, avgAnnual: 3100 },
    WA: { name: 'Washington', multiplier: 0.92, avgAnnual: 1690 },
    AZ: { name: 'Arizona', multiplier: 1.05, avgAnnual: 1980 }
  };

  const ageMultiplier: Record<string, number> = {
    '16-19': 2.3,
    '20-24': 1.6,
    '25-34': 1.0,
    '35-54': 0.85,
    '55-64': 0.82,
    '65+': 0.95
  };

  const recordMultiplier: Record<string, number> = {
    clean: 1.0,
    ticket: 1.25,
    accident: 1.55,
    major: 2.1
  };

  const tierBase: Record<'minimum' | 'standard' | 'comprehensive', number> = {
    minimum: 750,
    standard: 1450,
    comprehensive: 2100
  };

  const deductibleDiscount: Record<number, number> = {
    250: 1.1,
    500: 1.0,
    1000: 0.88,
    2000: 0.78
  };

  const selectedState = stateRates[stateCode] || { name: 'USA Average', multiplier: 1.0, avgAnnual: 1900 };
  const selectedStateName = stateRates[stateCode] ? stateName(stateCode, selectedState.name) : s('stateUSAvg');
  const tierLabelText =
    coverageTier === 'minimum' ? s('tierMinimum') : coverageTier === 'standard' ? s('tierStandard') : s('tierComprehensive');
  const recordLabelText =
    drivingRecord === 'clean'
      ? s('recordClean')
      : drivingRecord === 'ticket'
        ? s('recordTicket')
        : drivingRecord === 'accident'
          ? s('recordAccident')
          : s('recordMajor');
  const basePrice = tierBase[coverageTier];
  const valueFactor = 1 + (vehicleValue - 25000) * 0.000012;

  const estimatedAnnual = Math.round(
    basePrice *
      selectedState.multiplier *
      ageMultiplier[driverAge] *
      recordMultiplier[drivingRecord] *
      deductibleDiscount[deductible] *
      Math.max(0.7, valueFactor)
  );

  const estimatedMonthly = Math.round(estimatedAnnual / 12);

  const handleCopy = () => {
    const text = [
      s('insSummaryTitle'),
      s('sumInsState').replace('{state}', selectedStateName).replace('{code}', stateCode),
      s('sumInsCoverage').replace('{tier}', tierLabelText),
      s('sumInsDeductible').replace('{v}', `$${deductible.toLocaleString(lang)}`),
      s('sumInsDriver').replace('{age}', driverAge).replace('{record}', recordLabelText),
      '-----------------------------------',
      s('sumInsMonthly').replace('{v}', `$${estimatedMonthly.toLocaleString(lang)}`),
      s('sumInsAnnual').replace('{v}', `$${estimatedAnnual.toLocaleString(lang)}`),
      s('sumInsBenchmark').replace('{v}', `$${selectedState.avgAnnual.toLocaleString(lang)}`)
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
            <span>🚗</span> {s('insTitle')}
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('insSubtitle')}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? c('copied') : s('copyQuote')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('selectStateLabel')}
              </label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(stateRates).map(([code, data]) => (
                  <option key={code} value={code}>
                    {stateName(code, data.name)} ({code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('driverAgeLabel')}
              </label>
              <select
                value={driverAge}
                onChange={(e) => setDriverAge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="16-19">{s('ageOption').replace('{range}', '16 - 19').replace('{desc}', s('ageTeen'))}</option>
                <option value="20-24">{s('ageOption').replace('{range}', '20 - 24').replace('{desc}', s('ageYoungAdult'))}</option>
                <option value="25-34">{s('ageOption').replace('{range}', '25 - 34').replace('{desc}', s('ageStandard'))}</option>
                <option value="35-54">{s('ageOption').replace('{range}', '35 - 54').replace('{desc}', s('agePrime'))}</option>
                <option value="55-64">{s('ageOption').replace('{range}', '55 - 64').replace('{desc}', s('ageMature'))}</option>
                <option value="65+">{s('ageOption').replace('{range}', '65+').replace('{desc}', s('ageSenior'))}</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>{s('vehicleValueLabel')}</span>
              <span className="text-orange-600 font-bold">${vehicleValue.toLocaleString(lang)}</span>
            </div>
            <input
              type="range"
              min="250"
              max="95000"
              step="1000"
              value={vehicleValue}
              onChange={(e) => setVehicleValue(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Driving Record */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {s('drivingRecordLabel')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'clean', label: s('recordClean') },
                { id: 'ticket', label: s('recordTicket') },
                { id: 'accident', label: s('recordAccident') },
                { id: 'major', label: s('recordMajor') }
              ].map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setDrivingRecord(rec.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                    drivingRecord === rec.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {rec.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage Tier */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {s('coverageLevelLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: 'minimum', label: s('tierMinimum'), desc: s('tierMinimumDesc') },
                { id: 'standard', label: s('tierStandard'), desc: s('tierStandardDesc') },
                { id: 'comprehensive', label: s('tierComprehensive'), desc: s('tierComprehensiveDesc') }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setCoverageTier(tier.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-start border transition-all ${
                    coverageTier === tier.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="font-bold text-xs">{tier.label}</div>
                  <div className="text-[10px] opacity-75">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Deductible */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              {s('deductibleLabel')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[250, 500, 1000, 2000].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeductible(d)}
                  className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    deductible === d
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  ${d}
                </button>
              ))}
            </div>
            {deductible === 1000 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingDown className="w-3.5 h-3.5" /> {s('deductibleTip')}
              </p>
            )}
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-orange-400/30">
          <div>
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                {s('estimatedPremium')}
              </span>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${estimatedMonthly.toLocaleString(lang)}
                <span className="text-sm font-medium text-gray-500">{s('perMonth')}</span>
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">
                {s('perYearInState')
                  .replace('{v}', `$${estimatedAnnual.toLocaleString(lang)}`)
                  .replace('{state}', selectedStateName)}
              </p>
            </div>

            <div className="my-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                  <span>{s('stateAverageLabel')}</span>
                  <span>${selectedState.avgAnnual.toLocaleString(lang)}{s('perYear')}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[11px] mt-1">
                  <span>{s('yourComparisonLabel')}</span>
                  <span className={estimatedAnnual <= selectedState.avgAnnual ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                    {estimatedAnnual <= selectedState.avgAnnual ? s('belowAvg') : s('higherFactors')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-200 text-xs block">
                  {s('topSavings')}
                </span>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{s('discountBundle')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{s('discountTelematics')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{s('discountPayInFull')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {s('insFooter')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
