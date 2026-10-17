import React, { useState } from 'react';
import { DollarSign, Clock, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

export const LoanCalculator: React.FC = () => {
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
    const text = `Super Crown US Loan Payoff Analysis:
Loan Amount: $${loanAmount.toLocaleString()}
Interest Rate: ${interestRate}% APR
Term: ${loanTermMonths} Months (${(loanTermMonths / 12).toFixed(1)} Years)
---------------------------------------
Standard Monthly Payment: $${Math.round(standardMonthlyPayment).toLocaleString()}/mo
Total Standard Interest: $${Math.round(totalStandardInterest).toLocaleString()}
With Extra $${extraPayment}/mo:
- Interest Saved: $${Math.round(interestSaved).toLocaleString()}
- Paid Off ${monthsSaved} months earlier!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💵</span> USA Loan Payoff & Interest Calculator
          </h2>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Personal loans, auto loans, debt consolidation, and student loans.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 hover:bg-orange-100 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>Loan Borrowing Amount</span>
              <span className="text-orange-600 font-bold">${loanAmount.toLocaleString()}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                min="500"
                max="250000"
                step="500"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Annual Interest Rate (APR %)
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
                Loan Term (Months)
              </label>
              <select
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={48}>48 Months (4 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
                <option value={72}>72 Months (6 Years)</option>
                <option value={84}>84 Months (7 Years)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <span>Extra Monthly Principal Payment</span>
              <span className="text-emerald-600 font-bold">+${extraPayment}/mo</span>
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
                Monthly Payment
              </span>
              <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-1">
                ${Math.round(standardMonthlyPayment).toLocaleString()}
                <span className="text-sm font-medium text-gray-500">/mo</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total Interest Paid: ${Math.round(totalStandardInterest).toLocaleString()}
              </p>
            </div>

            {extraPayment > 0 && (
              <div className="my-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4" /> Accelerated Payoff Benefit:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Interest Saved:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ${Math.round(interestSaved).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Timeline Saved:</span>
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                      {monthsSaved} Months Faster
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Total Principal:</span>
                <span className="font-semibold">${loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Total Cost of Loan:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${Math.round(totalStandardPaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Verified standard US loan amortization algorithm.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
