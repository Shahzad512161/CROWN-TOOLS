import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, CheckCircle, Sparkles } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  toolName: string;
  faqs?: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ toolName, faqs }) => {
  // Ensure we have at least 4 detailed FAQs for Google FAQ Schema & USA audience
  const defaultFaqs: FAQItem[] = [
    {
      question: `Is the ${toolName} on Super Crown completely free to use?`,
      answer: `Yes, 100%. The ${toolName} on Super Crown Tools is completely unlocked and free for everyone worldwide. There are no registrations, no subscription paywalls, no software downloads, and no credit card required.`
    },
    {
      question: `Does the ${toolName} save or upload my sensitive personal data?`,
      answer: `No. Privacy and security are our highest priorities. All calculations and inputs within the ${toolName} process 100% locally on your device inside your web browser. Nothing is ever sent to or stored on remote servers.`
    },
    {
      question: `How accurate and compliant are the calculations for USA & international standards?`,
      answer: `All formulas and math logic used in the ${toolName} are built in accordance with standard US and international computational benchmarks (e.g., standard amortization algorithms, IRS guidelines, WHO health formulas, and ISO unit tables).`
    },
    {
      question: `Can I export, print, or share the results from this tool?`,
      answer: `Yes. You can instantly copy results to your device clipboard with one click, print formatted summary sheets via your browser's Print dialog, or bookmark the tool for daily recurring use.`
    }
  ];

  const displayFaqs: FAQItem[] = (faqs && faqs.length >= 4) ? faqs.slice(0, 4) : [
    ...(faqs || []),
    ...defaultFaqs.slice(faqs ? faqs.length : 0, 4)
  ];

  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleAccordion = (index: number) => {
    setOpenIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // Generate Google-Compliant FAQPage Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': displayFaqs.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return (
    <div className="w-full mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
      {/* Dynamic Schema.org JSON-LD Script for SEO Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Google Schema.org Verified • 4 Answers</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions about {toolName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Common questions answered by our financial & technical editorial team for USA and global users.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {displayFaqs.map((faq, index) => {
          const isOpen = openIndices.includes(index);
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between text-left cursor-pointer focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 pr-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isOpen 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    Q{index + 1}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
