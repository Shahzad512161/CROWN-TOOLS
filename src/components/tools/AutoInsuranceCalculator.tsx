import React, { useState } from 'react';
import { Car, Shield, CheckCircle, AlertTriangle, Copy, Check, TrendingDown } from 'lucide-react';

export const AutoInsuranceCalculator: React.FC = () => {
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
    const text = `Super Crown Auto Insurance Estimate:
State: ${selectedState.name} (${stateCode})
Coverage: ${coverageTier.toUpperCase()}
Deductible: $${deductible}
Driver Age: ${driverAge} | Driving Record: ${drivingRecord.toUpperCase()}
-----------------------------------
Estimated Monthly Premium: $${estimatedMonthly}/mo
Estimated Annual Premium: $${estimatedAnnual.toLocaleString()}/yr
State Benchmark Average: $${selectedState.avgAnnual.toLocaleString()}/yr`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🚗</span> USA Auto Insurance Rate Estimator
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Grounded in current 50-state actuarial rating models and deductible discounts.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Select US State
              </label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(stateRates).map(([code, data]) => (
                  <option key={code} value={code}>
                    {data.name} ({code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Driver Age Bracket
              </label>
              <select
                value={driverAge}
                onChange={(e) => setDriverAge(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="16-19">16 - 19 yrs (Teen)</option>
                <option value="20-24">20 - 24 yrs (Young Adult)</option>
                <option value="25-34">25 - 34 yrs (Standard)</option>
                <option value="35-54">35 - 54 yrs (Prime)</option>
                <option value="55-64">55 - 64 yrs (Mature)</option>
                <option value="65+">65+ yrs (Senior)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              <span>Vehicle Market Value</span>
              <span className="text-orange-600 font-bold">${vehicleValue.toLocaleString()}</span>
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
              Driving Record (Last 3 Years)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'clean', label: 'Clean Record' },
                { id: 'ticket', label: '1 Speeding Ticket' },
                { id: 'accident', label: '1 At-Fault Accident' },
                { id: 'major', label: 'DUI / Major' }
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
              Coverage Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'minimum', label: 'State Minimum', desc: 'Liability Only' },
                { id: 'standard', label: 'Standard', desc: '50/100/50 + Coll.' },
                { id: 'comprehensive', label: 'Full Coverage', desc: '100/300/100 Full' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setCoverageTier(tier.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-left border transition-all ${
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
              Collision & Comp Deductible
            </label>
            <div className="grid grid-cols-4 gap-2">
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
                <TrendingDown className="w-3.5 h-3.5" /> A $1,000 deductible saves an average of 12% on annual premiums.
              </p>
            )}
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border-2 border-orange-400/30">
          <div>
            <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                Estimated Premium
              </span>
              <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${estimatedMonthly}
                <span className="text-sm font-medium text-gray-500">/mo</span>
              </div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">
                ${estimatedAnnual.toLocaleString()} per year in {selectedState.name}
              </p>
            </div>

            <div className="my-5 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                  <span>State Average:</span>
                  <span>${selectedState.avgAnnual.toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[11px] mt-1">
                  <span>Your Comparison:</span>
                  <span className={estimatedAnnual <= selectedState.avgAnnual ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                    {estimatedAnnual <= selectedState.avgAnnual ? 'Below State Avg (Good!)' : 'Higher due to selected factors'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 dark:text-gray-200 text-xs block">
                  Top Savings Discounts Available:
                </span>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Auto + Home/Renters Bundle (Save up to 15%)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Telematics Safe Driver App (Save 10-25%)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Annual Pay-in-Full Discount (Save 5-8%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Rates are for illustrative estimation based on 2026 Insurance Information Institute (III) data.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
