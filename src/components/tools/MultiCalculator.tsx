import React, { useState } from 'react';
import { MortgageCalculator } from './MortgageCalculator';
import { LoanCalculator } from './LoanCalculator';
import { Calculator, Calendar, Activity, DollarSign, Percent, Split, PieChart, Sparkles } from 'lucide-react';
import { useLang, useStrings, COMMON } from '../../lib/LangContext';
import { CALC_STRINGS } from '../../lib/strings/calculators';

interface MultiCalculatorProps {
  initialTab?: 'mortgage' | 'loan' | 'bmi' | 'age' | 'tip' | 'compound';
  toolSlug?: string;
}

export const MultiCalculator: React.FC<MultiCalculatorProps> = ({ initialTab, toolSlug }) => {
  const lang = useLang();
  const s = useStrings(CALC_STRINGS);
  const c = useStrings(COMMON);
  const getStartingTab = (): 'mortgage' | 'loan' | 'bmi' | 'age' | 'tip' | 'compound' => {
    if (initialTab) return initialTab;
    if (toolSlug === 'bmi-calculator' || toolSlug === 'bmi-calorie-deficit-calculator') return 'bmi';
    if (toolSlug === 'age-calculator') return 'age';
    if (toolSlug === 'tip-calculator' || toolSlug === 'tip-bill-splitter-calculator') return 'tip';
    if (toolSlug === 'compound-interest-calculator') return 'compound';
    if (toolSlug === 'loan-calculator-usa') return 'loan';
    return 'age';
  };

  const [activeTab, setActiveTab] = useState<'mortgage' | 'loan' | 'bmi' | 'age' | 'tip' | 'compound'>(getStartingTab);

  // Age Calculator State
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const calculateAge = () => {
    if (!birthDate) return { years: 0, months: 0, days: 0, totalDays: 0, totalHours: 0 };
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = now.getTime() - birth.getTime();
    const totalDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const totalHours = totalDays * 24;

    // Next birthday
    let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) {
      nextBday = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilNext = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays, totalHours, daysUntilNext };
  };

  // BMI & Calorie State
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [userAge, setUserAge] = useState<number>(28);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityFactor, setActivityFactor] = useState<number>(1.375); // moderate

  const bmiValue = heightCm > 0 ? weightKg / Math.pow(heightCm / 100, 2) : 0;
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: s('bmiUnderweight'), color: 'text-amber-500' };
    if (bmi < 24.9) return { label: s('bmiNormal'), color: 'text-emerald-500' };
    if (bmi < 29.9) return { label: s('bmiOverweight'), color: 'text-amber-600' };
    return { label: s('bmiObese'), color: 'text-red-500' };
  };

  // BMR (Mifflin-St Jeor)
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * userAge + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * userAge - 161;
  const tdee = Math.round(bmr * activityFactor);

  // Tip & Bill Splitter State
  const [billAmount, setBillAmount] = useState<number>(120);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [splitCount, setSplitCount] = useState<number>(4);

  const tipTotal = (billAmount * tipPercent) / 100;
  const grandTotal = billAmount + tipTotal;
  const perPersonTotal = splitCount > 0 ? grandTotal / splitCount : grandTotal;
  const perPersonTip = splitCount > 0 ? tipTotal / splitCount : tipTotal;

  // Percentage & Compound State
  const [principal, setPrincipal] = useState<number>(10000);
  const [compoundRate, setCompoundRate] = useState<number>(7.5);
  const [compoundYears, setCompoundYears] = useState<number>(10);
  const futureCompound = principal * Math.pow(1 + compoundRate / 100, compoundYears);
  const totalCompoundInterest = futureCompound - principal;

  const ageData = calculateAge();
  const bmiCat = getBmiCategory(bmiValue);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-[#f97316]">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white">
              {s('multiTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {s('multiSubtitle').replace('{n}', '6')}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
          ✓ {s('allActive')}
        </span>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100 dark:border-gray-700">
        {[
          { id: 'age', label: s('tabAge'), icon: <Calendar className="w-4 h-4" /> },
          { id: 'bmi', label: s('tabBmi'), icon: <Activity className="w-4 h-4" /> },
          { id: 'mortgage', label: s('tabMortgage'), icon: <DollarSign className="w-4 h-4" /> },
          { id: 'loan', label: s('tabLoan'), icon: <PieChart className="w-4 h-4" /> },
          { id: 'tip', label: s('tabTip'), icon: <Split className="w-4 h-4" /> },
          { id: 'compound', label: s('tabCompound'), icon: <Percent className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Age Calculator */}
      {activeTab === 'age' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {s('selectDob')}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white"
              />
            </div>
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-xs space-y-1">
              <span className="font-bold text-orange-700 dark:text-orange-400">{s('nextBdayTitle')}</span>
              <p className="text-gray-700 dark:text-gray-300">
                {s('nextBdayText').split('{days}')[0]}
                <strong>{ageData.daysUntilNext}</strong>
                {s('nextBdayText').split('{days}')[1]}
              </p>
            </div>
          </div>

          <div className="md:col-span-7 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-orange-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-orange-600 dark:text-orange-400">{s('exactAgeLabel')}</span>
              <div className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white my-2">
                {s('ageResult')
                  .replace('{years}', String(ageData.years))
                  .replace('{months}', String(ageData.months))
                  .replace('{days}', String(ageData.days))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-orange-200 dark:border-gray-700 text-xs">
              <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl">
                <span className="text-gray-500 block text-[11px]">{s('totalDaysLived')}</span>
                <strong className="text-base text-gray-900 dark:text-white">{ageData.totalDays.toLocaleString(lang)}</strong>
              </div>
              <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl">
                <span className="text-gray-500 block text-[11px]">{s('totalHoursLived')}</span>
                <strong className="text-base text-gray-900 dark:text-white">{ageData.totalHours.toLocaleString(lang)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: BMI & Calorie Calculator */}
      {activeTab === 'bmi' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('weightLabel')}</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('heightLabel')}</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('ageFieldLabel')}</label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('sexLabel')}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
                >
                  <option value="male">{s('male')}</option>
                  <option value="female">{s('female')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('activityLabel')}</label>
              <select
                value={activityFactor}
                onChange={(e) => setActivityFactor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold"
              >
                <option value={1.2}>{s('actSedentary')}</option>
                <option value={1.375}>{s('actLight')}</option>
                <option value={1.55}>{s('actModerate')}</option>
                <option value={1.725}>{s('actVery')}</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-emerald-300 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400">{s('bmiTitle')}</span>
              <div className="text-4xl font-black text-gray-950 dark:text-white my-1">
                {bmiValue.toFixed(1)}
              </div>
              <p className={`text-xs font-bold ${bmiCat.color}`}>{bmiCat.label}</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-emerald-200 dark:border-gray-700 text-xs">
              <div className="flex justify-between">
                <span>{s('tdeeLabel')}</span>
                <strong className="text-gray-900 dark:text-white">{s('kcalDay').replace('{v}', tdee.toLocaleString(lang))}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>{s('fatLossLabel')}</span>
                <strong>{s('kcalDay').replace('{v}', Math.max(1200, tdee - 500).toLocaleString(lang))}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Mortgage Calculator */}
      {activeTab === 'mortgage' && (
        <div className="pt-2">
          <MortgageCalculator />
        </div>
      )}

      {/* Tab 4: Loan Calculator */}
      {activeTab === 'loan' && (
        <div className="pt-2">
          <LoanCalculator />
        </div>
      )}

      {/* Tab 5: Tip & Bill Splitter */}
      {activeTab === 'tip' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('billAmountLabel')}</label>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('tipPctLabel')}</label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 18, 20, 25].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipPercent(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      tipPercent === t
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('splitLabel')}</label>
              <input
                type="number"
                min="1"
                max="50"
                value={splitCount}
                onChange={(e) => setSplitCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400">{s('totalPerPersonLabel')}</span>
              <div className="text-4xl font-black text-gray-950 dark:text-white my-1">
                ${perPersonTotal.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {s('includesTip').replace('{v}', `$${perPersonTip.toFixed(2)}`)}
              </p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex justify-between">
                <span>{s('totalTipLabel').replace('{p}', String(tipPercent))}</span>
                <strong>${tipTotal.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-base font-bold text-orange-600">
                <span>{s('grandTotalLabel')}</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Compound Growth */}
      {activeTab === 'compound' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('depositLabel')}</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('annualReturnLabel')}</label>
                <input
                  type="number"
                  step="0.5"
                  value={compoundRate}
                  onChange={(e) => setCompoundRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{s('horizonLabel')}</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={compoundYears}
                  onChange={(e) => setCompoundYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">{s('futureBalanceLabel')}</span>
              <div className="text-4xl font-black text-gray-950 dark:text-white my-1">
                ${Math.round(futureCompound).toLocaleString(lang)}
              </div>
              <p className="text-xs text-gray-500">
                {s('afterYearsText').replace('{years}', String(compoundYears)).replace('{rate}', String(compoundRate))}
              </p>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex justify-between">
                <span>{s('principalInvestedLabel')}</span>
                <strong>${principal.toLocaleString(lang)}</strong>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>{s('totalGainsLabel')}</span>
                <span>+${Math.round(totalCompoundInterest).toLocaleString(lang)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
