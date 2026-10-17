import React, { useState } from 'react';
import { DollarSign, Percent, Calendar, PieChart, CheckCircle2, Copy, Download, RefreshCw } from 'lucide-react';

export const MortgageCalculator: React.FC = () => {
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(6.75);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.2);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1400);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Computed values
  const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
  const loanPrincipal = Math.max(0, homePrice - downPaymentAmount);
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;

  // Monthly Principal & Interest Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
  const monthlyPrincipalAndInterest =
    monthlyRate > 0 && totalMonths > 0
      ? (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanPrincipal / (totalMonths || 1);

  // Property tax per month
  const monthlyPropertyTax = (homePrice * (propertyTaxRate / 100)) / 12;

  // Home insurance per month
  const monthlyInsurance = annualHomeInsurance / 12;

  // PMI is typically ~0.75% of loan per year if down payment < 20%
  const monthlyPmi = downPaymentPercent < 20 ? (loanPrincipal * 0.0075) / 12 : 0;

  // Total monthly payment
  const totalMonthlyPayment =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPmi + monthlyHoa;

  const totalLoanRepayment = monthlyPrincipalAndInterest * totalMonths;
  const totalInterestPaid = Math.max(0, totalLoanRepayment - loanPrincipal);

  // Percentages for visual breakdown
  const piShare = Math.round((monthlyPrincipalAndInterest / totalMonthlyPayment) * 100) || 0;
  const taxShare = Math.round((monthlyPropertyTax / totalMonthlyPayment) * 100) || 0;
  const insShare = Math.round((monthlyInsurance / totalMonthlyPayment) * 100) || 0;
  const pmiShare = Math.round((monthlyPmi / totalMonthlyPayment) * 100) || 0;
  const hoaShare = Math.round((monthlyHoa / totalMonthlyPayment) * 100) || 0;

  const handleCopySummary = () => {
    const text = `Super Crown Mortgage Summary:
Home Price: $${homePrice.toLocaleString()}
Down Payment: $${downPaymentAmount.toLocaleString()} (${downPaymentPercent}%)
Loan Amount: $${loanPrincipal.toLocaleString()}
Interest Rate: ${interestRate}% (${loanTermYears} Years)
----------------------------------------
Total Monthly Payment: $${Math.round(totalMonthlyPayment).toLocaleString()}/mo
- Principal & Interest: $${Math.round(monthlyPrincipalAndInterest).toLocaleString()}
- Property Taxes: $${Math.round(monthlyPropertyTax).toLocaleString()}
- Homeowners Insurance: $${Math.round(monthlyInsurance).toLocaleString()}
${monthlyPmi > 0 ? `- PMI: $${Math.round(monthlyPmi).toLocaleString()}\n` : ''}${monthlyHoa > 0 ? `- HOA Fees: $${monthlyHoa}\n` : ''}Total Interest Paid: $${Math.round(totalInterestPaid).toLocaleString()}
Total Cost of Loan: $${Math.round(totalLoanRepayment).toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🏠</span> US Mortgage Calculator
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Calculated with 2026 US conventional loan and PMI rules.
          </p>
        </div>
        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Home Price */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>Home Purchase Price</span>
              <span className="text-orange-600 font-bold">${homePrice.toLocaleString()}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                min="20000"
                max="5000000"
                step="5000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="10000"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="w-full accent-orange-500 mt-2 cursor-pointer"
            />
          </div>

          {/* Down Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Down Payment (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Math.min(90, Math.max(0, Number(e.target.value))))}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Down Payment ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={Math.round(downPaymentAmount)}
                  onChange={(e) => {
                    const amt = Number(e.target.value) || 0;
                    setDownPaymentPercent(homePrice > 0 ? Math.min(90, (amt / homePrice) * 100) : 0);
                  }}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Interest Rate & Term */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Interest Rate (APR %)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="18"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Loan Term
              </label>
              <select
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value={30}>30 Years (Fixed)</option>
                <option value={20}>20 Years (Fixed)</option>
                <option value={15}>15 Years (Fixed)</option>
                <option value={10}>10 Years (Fixed)</option>
              </select>
            </div>
          </div>

          {/* Taxes, Insurance & HOA */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Property Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={propertyTaxRate}
                onChange={(e) => setPropertyTaxRate(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Insurance ($/yr)
              </label>
              <input
                type="number"
                step="50"
                value={annualHomeInsurance}
                onChange={(e) => setAnnualHomeInsurance(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                HOA Fee ($/mo)
              </label>
              <input
                type="number"
                step="10"
                value={monthlyHoa}
                onChange={(e) => setMonthlyHoa(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Calculated Results Box */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-gray-900 dark:to-gray-800/80 p-6 rounded-2xl border-2 border-orange-400/40 dark:border-orange-500/30">
          <div>
            <div className="text-center pb-4 border-b border-orange-200 dark:border-gray-700">
              <span className="text-xs uppercase font-bold tracking-wider text-orange-600 dark:text-orange-400">
                Estimated Monthly Payment
              </span>
              <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${Math.round(totalMonthlyPayment).toLocaleString()}
                <span className="text-sm font-medium text-gray-500">/mo</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Loan Principal: ${Math.round(loanPrincipal).toLocaleString()}
              </p>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="my-5">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
                <span>Payment Composition</span>
                <span>100%</span>
              </div>
              <div className="w-full h-3 rounded-full flex overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div style={{ width: `${piShare}%` }} className="bg-blue-600" title={`P&I: ${piShare}%`} />
                <div style={{ width: `${taxShare}%` }} className="bg-emerald-500" title={`Tax: ${taxShare}%`} />
                <div style={{ width: `${insShare}%` }} className="bg-amber-500" title={`Insurance: ${insShare}%`} />
                {pmiShare > 0 && <div style={{ width: `${pmiShare}%` }} className="bg-purple-500" title={`PMI: ${pmiShare}%`} />}
                {hoaShare > 0 && <div style={{ width: `${hoaShare}%` }} className="bg-rose-500" title={`HOA: ${hoaShare}%`} />}
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Principal & Interest
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Math.round(monthlyPrincipalAndInterest).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Property Taxes
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Math.round(monthlyPropertyTax).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Home Insurance
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Math.round(monthlyInsurance).toLocaleString()}
                </span>
              </div>
              {monthlyPmi > 0 && (
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> PMI (&lt;20% down)
                  </span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    ${Math.round(monthlyPmi).toLocaleString()}
                  </span>
                </div>
              )}
              {monthlyHoa > 0 && (
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> HOA Fees
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${monthlyHoa.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-orange-200 dark:border-gray-700 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Total Interest (Life of Loan):</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${Math.round(totalInterestPaid).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
