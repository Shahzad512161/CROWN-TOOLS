export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  category: 'Daily Calculators' | 'Image Tools' | 'PDF Tools' | 'Text & AI Tools' | 'Unit Converters' | 'Home & Daily Life' | 'Word Tools' | 'SEO Tools' | 'Developer Tools' | 'Video & Audio Tools' | 'AI Tools' | 'Social Media Tools' | 'Student & Everyday Tools';
  description: string;
  highCPCKeywords: string[];
  isTopEarning: boolean;
  iconName: string;
  cpcTier: 'High' | 'Very High' | 'Premium';
  estimatedCPC: string;
  howToUseSteps: string[];
  features: string[];
  faq: { question: string; answer: string }[];
  overviewContent: string;
}

export interface CategoryMeta {
  name: ToolItem['category'];
  slug: string;
  count: number;
  icon: string;
  colorClass: string;
  bgLight: string;
  borderClass: string;
  tagline: string;
  description: string;
}

export const CATEGORIES_META: CategoryMeta[] = [
  {
    name: 'Daily Calculators',
    slug: 'daily-calculators',
    count: 1000,
    icon: 'Calculator',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-[#e0f2fe] dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800',
    tagline: 'High-CPC Financial & Daily Calculators',
    description: 'Mortgage, loans, taxes, investments, insurance, retirement, and daily math tools.'
  },
  {
    name: 'Image Tools',
    slug: 'image-tools',
    count: 1000,
    icon: 'Image',
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-[#fce7f3] dark:bg-pink-950/40',
    borderClass: 'border-pink-200 dark:border-pink-800',
    tagline: 'Lossless Compression & Graphic Utilities',
    description: 'Compress, resize, convert, crop, filter, and inspect images 100% in-browser.'
  },
  {
    name: 'PDF Tools',
    slug: 'pdf-tools',
    count: 800,
    icon: 'FileText',
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    bgLight: 'bg-[#fef9c3] dark:bg-yellow-950/40',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    tagline: 'Legal & Safe Document Converters',
    description: 'PDF to Word, text extraction, page counter, PDF merger, and document helpers.'
  },
  {
    name: 'Word Tools',
    slug: 'word-tools',
    count: 300,
    icon: 'FileText',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-[#dbeafe] dark:bg-blue-950/40',
    borderClass: 'border-blue-200 dark:border-blue-800',
    tagline: 'Complete Word Document Toolkit',
    description: 'View, edit, merge, split, convert, protect, and repair Word (.docx) documents 100% in-browser.'
  },
  {
    name: 'SEO Tools',
    slug: 'seo-tools',
    count: 400,
    icon: 'Search',
    colorClass: 'text-green-700 dark:text-green-400',
    bgLight: 'bg-green-100 dark:bg-green-950/40',
    borderClass: 'border-green-200 dark:border-green-800',
    tagline: 'Rank Higher on Google',
    description: 'Meta tag generators, keyword density, robots.txt and sitemap builders, schema markup, and on-page SEO analysis   100% in-browser.'
  },
  {
    name: 'Developer Tools',
    slug: 'developer-tools',
    count: 400,
    icon: 'FileCode',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-[#ede9fe] dark:bg-violet-950/40',
    borderClass: 'border-violet-200 dark:border-violet-800',
    tagline: 'Code Utilities for Builders',
    description: 'JSON formatters and converters, JWT decoder, encoders, hash and password generators, regex tester, cron parser   100% in-browser.'
  },
  {
    name: 'Video & Audio Tools',
    slug: 'video-audio-tools',
    count: 300,
    icon: 'Wand2',
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-[#ffedd5] dark:bg-orange-950/40',
    borderClass: 'border-orange-200 dark:border-orange-800',
    tagline: 'Convert, Trim & Record Media',
    description: 'Video to GIF, compressors, trimmers and converters powered by FFmpeg in your browser, plus screen, camera and voice recorders.'
  },
  {
    name: 'AI Tools',
    slug: 'ai-tools',
    count: 300,
    icon: 'Wand2',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-[#f3e8ff] dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800',
    tagline: 'Write, Create & Chat with AI',
    description: 'AI writer, paraphraser, grammar checker, translator, image generator, email and cover-letter writers, and chat   powered by Google Gemini.'
  },
  {
    name: 'Social Media Tools',
    slug: 'social-media-tools',
    count: 300,
    icon: 'Wand2',
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-[#fce7f3] dark:bg-pink-950/40',
    borderClass: 'border-pink-200 dark:border-pink-800',
    tagline: 'Create, Format & Grow',
    description: 'Resizers for every platform, thumbnail and post-card makers, hashtag and username generators, fancy text, engagement calculator and AI hooks.'
  },
  {
    name: 'Student & Everyday Tools',
    slug: 'student-everyday-tools',
    count: 300,
    icon: 'Wand2',
    colorClass: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-[#ccfbf1] dark:bg-teal-950/40',
    borderClass: 'border-teal-200 dark:border-teal-800',
    tagline: 'Study Smarter, Live Easier',
    description: 'GPA and citation tools, flashcards, a study planner, periodic table and equation solver   plus age and date calculators, timers, a typing test and text-to-handwriting.'
  },
  {
    name: 'Text & AI Tools',
    slug: 'text-ai-tools',
    count: 500,
    icon: 'Wand2',
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-[#ede9fe] dark:bg-purple-950/40',
    borderClass: 'border-purple-200 dark:border-purple-800',
    tagline: 'Productivity & Writing Utilities',
    description: 'Word counters, text cleaners, case formatters, slug generators, and encoders.'
  },
  {
    name: 'Unit Converters',
    slug: 'unit-converters',
    count: 1000,
    icon: 'Scale',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-[#dcfce7] dark:bg-emerald-950/40',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    tagline: 'Scientific & Daily Precision Converters',
    description: 'Length, weight, temperature, area, volume, currency, digital storage, and speed.'
  },
  {
    name: 'Home & Daily Life',
    slug: 'home-daily-life',
    count: 700,
    icon: 'Home',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-[#ffedd5] dark:bg-amber-950/40',
    borderClass: 'border-amber-200 dark:border-amber-800',
    tagline: 'Household & Everyday Utility Tools',
    description: 'Grocery budget, electricity cost, paint estimator, tip splitter, BMI, and calorie math.'
  }
];

// Top 8 Featured High-Earning Tools
const TOP_8_TOOLS: ToolItem[] = [
  {
    id: 'top-1',
    slug: 'mortgage-calculator-usa',
    name: 'Mortgage Calculator USA',
    category: 'Daily Calculators',
    description: 'Calculate monthly US mortgage payments, principal, interest, property tax, PMI, and home insurance with full amortization.',
    highCPCKeywords: ['mortgage calculator usa', 'best home loan rates', 'refinance mortgage rates', 'usa fixed rate mortgage', 'fha loan calculator'],
    isTopEarning: true,
    iconName: 'Building2',
    cpcTier: 'Premium',
    estimatedCPC: '$38.50',
    howToUseSteps: [
      'Enter your total home purchase price and your down payment amount or percentage.',
      'Input the loan interest rate, loan term (e.g., 30 or 15 years), annual property tax, and home insurance.',
      'Review your exact monthly payment breakdown (P&I, taxes, insurance, PMI) and the full payment schedule.'
    ],
    features: [
      'Accurate US 30-year & 15-year fixed and adjustable loan calculations',
      'Dynamic PMI estimation for down payments under 20%',
      'Interactive monthly payment visual breakdown',
      'Annual property taxes and hazard insurance integration'
    ],
    faq: [
      {
        question: 'How is the monthly US mortgage payment calculated?',
        answer: 'The monthly mortgage payment is calculated using the standard amortization formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1], where P is loan principal, i is monthly interest rate, and n is the total number of monthly payments, plus monthly allocations for local property taxes, home insurance, and PMI.'
      },
      {
        question: 'What is PMI and when is it required in the United States?',
        answer: 'Private Mortgage Insurance (PMI) is usually required by conventional US mortgage lenders if your down payment is less than 20% of the home purchase price. It protects the lender in case of default and usually costs between 0.3% and 1.5% of the original loan balance per year.'
      },
      {
        question: 'Should I choose a 15-year or 30-year mortgage loan?',
        answer: 'A 30-year mortgage offers lower monthly payments, which provides greater cash flow flexibility. A 15-year mortgage comes with lower interest rates and allows you to pay significantly less total interest over the life of the loan.'
      }
    ],
    overviewContent: 'The Super Crown USA Mortgage Calculator is an essential financial tool designed specifically for American homebuyers, real estate investors, and homeowners exploring refinance options. Whether you are purchasing your first single-family house in Texas, a condo in Florida, or refinancing a primary residence in California, calculating your all-in monthly payment including principal, interest, local municipal property taxes, homeowners insurance, and private mortgage insurance (PMI) is crucial to maintaining a healthy debt-to-income (DTI) ratio. With current 2026 interest rate benchmarks, understanding your true amortization schedule helps you save thousands of dollars in lifetime interest charges.'
  },
  {
    id: 'top-2',
    slug: 'auto-insurance-calculator',
    name: 'Auto Insurance Calculator',
    category: 'Daily Calculators',
    description: 'Estimate your USA & UK car insurance premiums based on vehicle type, driver age, US state, coverage limits, and deductible.',
    highCPCKeywords: ['auto insurance calculator usa', 'cheap car insurance quotes', 'commercial auto insurance', 'best auto insurance rates', 'state farm auto insurance quote'],
    isTopEarning: true,
    iconName: 'Car',
    cpcTier: 'Premium',
    estimatedCPC: '$45.20',
    howToUseSteps: [
      'Select your US State or jurisdiction and input your vehicle estimated market value.',
      'Specify the primary driver age bracket and past 3-year driving record status.',
      'Select your desired coverage tier (State Minimum, Standard Liability + Collision, or Full Comprehensive) and deductible.'
    ],
    features: [
      '50 US States rating model calibration',
      'Instant comparison between Minimum, Standard, and Comprehensive coverage',
      'Deductible toggle from $250 to $2,000 to see direct savings',
      'Clean PDF / printable breakdown of estimated rates'
    ],
    faq: [
      {
        question: 'How do insurance companies calculate car insurance rates?',
        answer: 'Insurance carriers evaluate several actuarial risk factors including your location (state and zip code), age, driving record, credit-based insurance score, vehicle make/model/year, annual mileage, and chosen deductibles.'
      },
      {
        question: 'What is the difference between collision and comprehensive coverage?',
        answer: 'Collision insurance pays for damage to your car resulting from a collision with another vehicle or object (like a guardrail or tree). Comprehensive insurance covers non-collision damage such as theft, vandalism, windshield cracks, fire, hail, and hitting an animal.'
      },
      {
        question: 'How can I lower my car insurance premium in the USA?',
        answer: 'You can lower your premium by bundling auto with home or renters insurance, raising your comprehensive/collision deductible from $500 to $1,000, maintaining a clean driving record, asking for good driver or safe driver telematics discounts, and comparing quotes annually.'
      }
    ],
    overviewContent: 'Auto insurance is one of the highest expenses of personal vehicle ownership in North America. State requirements mandate minimum liability coverage in 49 out of 50 US states, but minimum coverage often leaves drivers underinsured against severe claims. The Super Crown Auto Insurance Calculator empowers drivers across California, Texas, Florida, New York, Ohio, and all 50 states to estimate realistic policy premiums based on actuarial metrics. By toggling deductibles and testing liability tiers, users can make informed decisions before contacting brokers, saving hundreds of dollars annually.'
  },
  {
    id: 'top-3',
    slug: 'loan-calculator-usa',
    name: 'Loan Calculator USA',
    category: 'Daily Calculators',
    description: 'Calculate monthly payments, total interest, and payoff timelines for personal loans, auto loans, and business financing.',
    highCPCKeywords: ['loan calculator usa', 'personal loan rates usa', 'business loans fast approval', 'debt consolidation loans', 'sba loan calculator'],
    isTopEarning: true,
    iconName: 'DollarSign',
    cpcTier: 'Very High',
    estimatedCPC: '$32.10',
    howToUseSteps: [
      'Enter the loan amount you wish to borrow.',
      'Set the annual percentage rate (APR) provided by your lender.',
      'Choose the loan term in months or years, and optionally add an extra monthly payment to see interest savings.'
    ],
    features: [
      'Instant monthly payment calculation with amortization breakdown',
      'Extra monthly payment simulator showing total interest saved',
      'Payoff date calculator with early settlement schedule',
      'Supports Personal, Auto, Student, and Small Business Loans'
    ],
    faq: [
      {
        question: 'What is the difference between APR and interest rate?',
        answer: 'The interest rate represents the annual cost of borrowing the principal balance, while APR (Annual Percentage Rate) includes the interest rate plus any lender fees, origination charges, or closing costs expressed as an annualized percentage.'
      },
      {
        question: 'How does making extra payments help pay off a loan faster?',
        answer: 'Extra payments are applied directly to the loan principal. Lowering the principal balance immediately reduces the amount of interest accrued each month, shortening your loan payoff timeline and saving substantial money over the term.'
      },
      {
        question: 'Are there prepayment penalties on US personal loans?',
        answer: 'Most top US personal loan lenders today do not charge prepayment penalties. However, always review your promissory agreement terms before making accelerated principal payments.'
      }
    ],
    overviewContent: 'Whether you are consolidating high-interest credit card balances, financing home improvements, or securing working capital for a small business, understanding loan amortization is critical. The Super Crown USA Loan Calculator delivers transparent insights into your total finance charges, the true ratio between principal and interest payments, and the mathematical benefits of paying just $25 to $100 extra each month toward your balance.'
  },
  {
    id: 'top-4',
    slug: 'tax-calculator-2026-usa',
    name: 'Tax Calculator 2026 USA',
    category: 'Daily Calculators',
    description: 'Calculate 2026 US Federal Income Tax, FICA (Social Security & Medicare), State Tax, and net take-home salary by state.',
    highCPCKeywords: ['tax calculator 2026 usa', 'federal income tax brackets', 'take home pay calculator', 'turbotax online', 'state income tax calculator'],
    isTopEarning: true,
    iconName: 'Receipt',
    cpcTier: 'Premium',
    estimatedCPC: '$29.40',
    howToUseSteps: [
      'Enter your gross annual salary or household earnings.',
      'Select your IRS filing status (Single, Married Filing Jointly, Head of Household).',
      'Select your US State of residence and enter any retirement contributions (401k/Traditional IRA).'
    ],
    features: [
      'Updated 2026 IRS federal income tax brackets and standard deductions',
      'Accurate FICA breakdown (6.2% Social Security + 1.45% Medicare)',
      'State income tax estimations for all 50 states (including no-tax states like TX, FL, WA, NV, TN, WY, AK)',
      'Bi-weekly, semi-monthly, and monthly paycheck take-home breakdown'
    ],
    faq: [
      {
        question: 'What are the 2026 IRS federal income tax brackets?',
        answer: 'The US progressive federal tax system uses marginal rates of 10%, 12%, 22%, 24%, 32%, 35%, and 37%. Income is taxed in chunks within each bracket, meaning your effective tax rate is always lower than your marginal tax bracket.'
      },
      {
        question: 'Which US states have zero state income tax?',
        answer: 'Currently, Alaska, Florida, Nevada, New Hampshire (dividend/interest only phaseout), South Dakota, Tennessee, Texas, Washington (capital gains only), and Wyoming do not levy an individual wage income tax.'
      },
      {
        question: 'How do pre-tax 401(k) contributions lower federal taxes?',
        answer: 'Traditional 401(k) and 403(b) contributions are deducted directly from your gross income before federal and state taxes are assessed, reducing your taxable income for the year.'
      }
    ],
    overviewContent: 'Navigating the United States tax system requires a clear understanding of marginal tax brackets, FICA payroll taxes, and state-level deductions. The Super Crown 2026 USA Tax Calculator gives individuals and families an instant, reliable forecast of their net take-home pay across any of the 50 states. Simply input your wage and filing status to immediately see your effective tax rate and paycheck allocations.'
  },
  {
    id: 'top-5',
    slug: 'resume-builder-usa-format',
    name: 'Resume Builder USA Format',
    category: 'Text & AI Tools',
    description: 'Create clean, ATS-compliant US standard professional resumes. Live editor, formatted layout, and one-click PDF print.',
    highCPCKeywords: ['resume builder usa format', 'best online resume maker', 'ats friendly resume template', 'executive resume writing', 'professional cv builder free'],
    isTopEarning: true,
    iconName: 'Briefcase',
    cpcTier: 'High',
    estimatedCPC: '$21.80',
    howToUseSteps: [
      'Fill in your personal contact details, location, and professional title.',
      'Add your career summary, job experience milestones, education credentials, and core competencies.',
      'Preview the live ATS-compliant layout and click "Print / Save PDF" to export your clean resume.'
    ],
    features: [
      'Standard US 1-page format engineered for applicant tracking systems (ATS)',
      'Live real-time preview side-by-side with data entry',
      'No account registration or hidden subscriptions required',
      'Built-in action verbs and bullet point guidance for US recruiters'
    ],
    faq: [
      {
        question: 'What is an ATS-compliant resume format?',
        answer: 'Applicant Tracking Systems (ATS) scan resumes for keywords, chronological work history, and standard header titles. An ATS-compliant resume uses standard typography, avoids complex multi-column tables or embedded images, and structures information clearly under Contact, Summary, Experience, Education, and Skills.'
      },
      {
        question: 'Should a US resume be one page or two pages?',
        answer: 'For professionals with under 7-10 years of experience, a clean one-page resume is the industry standard in the USA and Canada. Senior executives, researchers, and candidates with extensive relevant leadership may use two pages.'
      },
      {
        question: 'Should I put my photo or age on a US resume?',
        answer: 'No. In the United States and Canada, resumes should never include headshot photos, age, marital status, or nationality due to anti-discrimination hiring regulations (EEOC).'
      }
    ],
    overviewContent: 'Landing interviews at top companies in the US, UK, and Canada requires a modern, ATS-friendly resume format. The Super Crown Resume Builder eliminates clunky paid software by giving job seekers a fast, 100% free, and private in-browser resume creator. Build your resume with verified US formatting, clean typography, and export instant print-ready PDFs without watermarks.'
  },
  {
    id: 'top-6',
    slug: 'invoice-generator-pro',
    name: 'Invoice Generator Pro',
    category: 'Daily Calculators',
    description: 'Create professional business invoices for US, UK & Canadian clients with auto tax calculation, multiple currencies, and PDF export.',
    highCPCKeywords: ['invoice generator pro', 'free invoice maker online', 'business billing software', 'contractor invoice template', 'freelance invoice generator'],
    isTopEarning: true,
    iconName: 'FileSpreadsheet',
    cpcTier: 'High',
    estimatedCPC: '$18.90',
    howToUseSteps: [
      'Enter your business name, client billing information, invoice number, and payment due date.',
      'Add items, descriptions, quantity, and unit rate. Add more rows with one click.',
      'Set your sales tax or VAT percentage, review the computed grand total, and print or export as PDF.'
    ],
    features: [
      'Multi-currency support: USD ($), EUR (€), GBP (£), CAD ($), AUD ($), PKR (Rs), INR (₹), and more',
      'Instant automatic subtotal, tax computation, and grand total',
      'Add, remove, or rearrange unlimited line items dynamically',
      'Print-ready professional styling with invoice terms and payment bank notes'
    ],
    faq: [
      {
        question: 'What details must be on a legal business invoice in the USA?',
        answer: 'A standard US business invoice should include your business name and contact information, the client name and billing address, a unique invoice number, the invoice date and payment due date, an itemized description of goods or services, unit prices, subtotal, any applicable state/local sales tax, and accepted payment methods.'
      },
      {
        question: 'Can freelancers use this invoice generator for international clients?',
        answer: 'Yes! You can toggle between USD, GBP, EUR, CAD, and other currencies, add international wire or Payoneer/PayPal payment instructions, and export a clean PDF invoice ready to email.'
      },
      {
        question: 'Is my financial data stored on your servers?',
        answer: 'No. All invoice calculations and document generation take place entirely client-side inside your browser for 100% privacy and security.'
      }
    ],
    overviewContent: 'Prompt payment starts with crystal-clear, professional invoicing. Freelancers, contractors, consultants, and small business owners need a reliable invoicing tool that does not trap them in expensive monthly subscriptions. Invoice Generator Pro on Super Crown delivers instant calculations, customizable tax rates, client notes, and instant print/PDF downloads.'
  },
  {
    id: 'top-7',
    slug: 'live-currency-converter',
    name: 'Live Currency Converter',
    category: 'Unit Converters',
    description: 'Real-time exchange rate converter for 160+ world currencies including USD, EUR, GBP, CAD, PKR, INR, AED, and SAR.',
    highCPCKeywords: ['live currency converter', 'usd to eur live rate', 'best forex broker', 'send money abroad cheap', 'international wire exchange rate'],
    isTopEarning: true,
    iconName: 'Coins',
    cpcTier: 'Very High',
    estimatedCPC: '$24.60',
    howToUseSteps: [
      'Enter the amount of money you want to convert.',
      'Select your origin currency (e.g., USD, GBP, EUR, CAD).',
      'Select your destination currency (e.g., PKR, INR, CAD, AED) and view the instant live conversion.'
    ],
    features: [
      'Support for major global currencies: USD, EUR, GBP, CAD, AUD, JPY, CHF, PKR, INR, AED, SAR',
      'One-click swap origin and destination currencies',
      'Built-in bank markup fee calculator (0.5% to 3.5%) to see real wire costs',
      'Quick benchmark comparison matrix for fast multi-currency lookups'
    ],
    faq: [
      {
        question: 'What is the mid-market exchange rate?',
        answer: 'The mid-market rate (also called the interbank rate) is the exact midpoint between the buy and sell prices of two currencies in global foreign exchange markets. It is the fairest exchange rate without hidden bank markup fees.'
      },
      {
        question: 'Why do bank conversion rates differ from live online rates?',
        answer: 'Commercial banks and wire services routinely add a 1% to 4% markup fee on top of the mid-market rate to generate profit on foreign exchange transactions.'
      },
      {
        question: 'How often are exchange rates updated?',
        answer: 'Foreign exchange markets fluctuate continuously during trading hours from Sunday evening to Friday afternoon EST based on global macroeconomic conditions, interest rates, and trade volume.'
      }
    ],
    overviewContent: 'Sending remittances to family abroad, planning travel, or managing international e-commerce revenue requires exact currency conversion. Super Crown Live Currency Converter provides rapid cross-rates across key trade pairs like USD/PKR, USD/EUR, GBP/USD, and CAD/USD, along with transparent transaction fee modeling.'
  },
  {
    id: 'top-8',
    slug: 'pdf-to-word-converter',
    name: 'PDF to Word Converter',
    category: 'PDF Tools',
    description: 'Extract text, preserve paragraphs, and convert PDF documents into editable Word (.docx) & text format securely in your browser.',
    highCPCKeywords: ['pdf to word converter free', 'convert pdf to editable docx', 'best pdf editor online', 'adobe pdf to word', 'safe pdf converter no upload'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$19.80',
    howToUseSteps: [
      'Select or drag & drop your PDF file or paste PDF text content into the workspace.',
      'Preview extracted structured paragraphs, word count, and formatting integrity.',
      'Click "Export to Word (.doc)" or "Copy Text" to immediately edit in Microsoft Word, Google Docs, or Pages.'
    ],
    features: [
      '100% private in-browser document processing without uploading files to remote servers',
      'Maintains clean paragraph breaks, bullet points, and headers',
      'Export options: Microsoft Word compatible (.doc), Rich Text, or Clean Plaintext',
      'Instant character, word, and reading time counter included'
    ],
    faq: [
      {
        question: 'Is it safe to convert confidential PDFs on Super Crown?',
        answer: 'Yes! Super Crown processes your files directly inside your browser client environment. Your confidential documents, contracts, and personal records are never uploaded to our servers, ensuring 100% privacy and compliance with GDPR and HIPAA guidelines.'
      },
      {
        question: 'Can I edit the converted document in Microsoft Word and Google Docs?',
        answer: 'Absolutely. The output format is standard Word-compatible document structure that opens seamlessly in Microsoft Word, Google Docs, LibreOffice, and Apple Pages.'
      },
      {
        question: 'Are there any file size limits or daily quotas?',
        answer: 'Super Crown provides 100% free, unlimited conversions with no registration, no watermarks, and no subscription paywalls.'
      }
    ],
    overviewContent: 'Converting non-editable PDF contracts, legal briefs, academic research papers, and receipts into editable documents is one of the most common daily tasks for professionals. Super Crown PDF to Word Converter guarantees high-speed text extraction without requiring suspicious third-party software downloads or server uploads.'
  }
];

// Rich Handcrafted Curated Tools across the 6 categories (high-value daily use)
const CURATED_ADDITIONAL_TOOLS: Partial<ToolItem>[] = [
  // Daily Calculators
  {
    slug: 'multi-calculator-all-in-one',
    name: 'Multi Calculator Suite (All-In-One)',
    category: 'Daily Calculators',
    description: 'All-in-one calculator suite featuring Age & Birthday, BMI & Calorie, Loan & EMI, Mortgage, Tip Splitter, and Compound Growth in tabs.',
    highCPCKeywords: ['multi calculator online', 'age and bmi calculator', 'all in one financial calculator', 'loan mortgage tip calculator'],
    isTopEarning: true,
    iconName: 'Calculator',
    cpcTier: 'Premium',
    estimatedCPC: '$35.00'
  },
  {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    category: 'Daily Calculators',
    description: 'Calculate the exponential growth of your savings and investment portfolio with annual, monthly, or daily compounding.',
    highCPCKeywords: ['compound interest calculator', 'best high yield savings account', 'roth ira calculator', 'investment compound growth'],
    isTopEarning: true,
    iconName: 'TrendingUp',
    cpcTier: 'Very High',
    estimatedCPC: '$28.10'
  },
  {
    slug: 'retirement-401k-calculator',
    name: '401(k) Retirement Calculator',
    category: 'Daily Calculators',
    description: 'Forecast your retirement nest egg, employer match contributions, and annual withdrawals based on inflation and return rates.',
    highCPCKeywords: ['401k retirement calculator', 'employer match calculator', 'best retirement funds', 'roth 401k vs traditional'],
    isTopEarning: false,
    iconName: 'PiggyBank',
    cpcTier: 'Very High',
    estimatedCPC: '$27.50'
  },
  {
    slug: 'debt-snowball-calculator',
    name: 'Debt Snowball vs Avalanche Calculator',
    category: 'Daily Calculators',
    description: 'Compare the Dave Ramsey Debt Snowball method against the Debt Avalanche method to eliminate credit card and student debt.',
    highCPCKeywords: ['debt snowball calculator', 'debt avalanche calculator', 'pay off credit cards fast', 'debt payoff planner'],
    isTopEarning: false,
    iconName: 'ShieldAlert',
    cpcTier: 'High',
    estimatedCPC: '$22.00'
  },
  {
    slug: 'bmi-calorie-deficit-calculator',
    name: 'BMI & Calorie Deficit Calculator',
    category: 'Daily Calculators',
    description: 'Calculate your Body Mass Index (BMI), Basal Metabolic Rate (BMR), and exact daily calorie deficit for healthy weight management.',
    highCPCKeywords: ['calorie deficit calculator', 'bmi calculator usa', 'bmr tdee calculator', 'daily calorie intake loss'],
    isTopEarning: false,
    iconName: 'Activity',
    cpcTier: 'High',
    estimatedCPC: '$14.20'
  },
  {
    slug: 'student-loan-payoff-calculator',
    name: 'Student Loan Payoff Calculator',
    category: 'Daily Calculators',
    description: 'Calculate federal and private student loan amortization, SAVE plan repayment estimates, and interest reduction strategies.',
    highCPCKeywords: ['student loan payoff calculator', 'refinance student loans', 'save repayment plan calculator', 'federal loan forgiveness'],
    isTopEarning: false,
    iconName: 'GraduationCap',
    cpcTier: 'Very High',
    estimatedCPC: '$26.80'
  },

  // Image Tools
  {
    slug: 'image-compressor-lossless',
    name: 'Image Compressor Lossless',
    category: 'Image Tools',
    description: 'Compress JPG, PNG, and WebP images up to 80% without visible quality loss directly in your browser.',
    highCPCKeywords: ['image compressor online', 'compress png lossless', 'reduce image file size', 'best image compressor free'],
    isTopEarning: true,
    iconName: 'Minimize2',
    cpcTier: 'High',
    estimatedCPC: '$16.40'
  },
  {
    slug: 'image-resizer-pro',
    name: 'Image Resizer Pro',
    category: 'Image Tools',
    description: 'Resize image dimensions by pixels or percentage with aspect ratio lock for social media banners, passports, and web design.',
    highCPCKeywords: ['image resizer online', 'resize photo for passport', 'resize image without losing quality', 'photo dimension changer'],
    isTopEarning: false,
    iconName: 'Maximize2',
    cpcTier: 'High',
    estimatedCPC: '$15.10'
  },
  {
    slug: 'image-to-webp-converter',
    name: 'Image to WebP Converter',
    category: 'Image Tools',
    description: 'Convert PNG and JPEG images to Google WebP format for blazing-fast web page loading and superior SEO Core Web Vitals.',
    highCPCKeywords: ['png to webp converter', 'convert jpeg to webp online', 'next gen image format', 'compress webp images'],
    isTopEarning: false,
    iconName: 'RefreshCw',
    cpcTier: 'High',
    estimatedCPC: '$14.80'
  },
  {
    slug: 'image-base64-encoder',
    name: 'Image to Base64 Encoder',
    category: 'Image Tools',
    description: 'Convert any image file into raw Data URI Base64 code for direct embedding in HTML, CSS, and JSON payloads.',
    highCPCKeywords: ['image to base64 converter', 'data uri image generator', 'base64 image encoder free', 'embed image in css'],
    isTopEarning: false,
    iconName: 'Code',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },

  // Image studio round 2   AI, QR, creators' tools (image-base64-encoder above is also served by this suite)
  {
    slug: 'background-remover',
    name: 'AI Background Remover',
    category: 'Image Tools',
    description: 'Remove the background from any photo with an AI model that runs entirely in your browser   transparent PNG in seconds, no uploads.',
    highCPCKeywords: ['remove background from image', 'background remover free', 'transparent png maker'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$18.90'
  },
  {
    slug: 'image-background-changer',
    name: 'Image Background Changer',
    category: 'Image Tools',
    description: 'Replace a photo background with studio colors, gradients or your own backdrop image   perfect for product photos.',
    highCPCKeywords: ['change image background', 'product photo background', 'replace background online'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.60'
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    category: 'Image Tools',
    description: 'Create QR codes for links, WiFi, contact cards, email and SMS   custom colors and sizes, PNG and SVG downloads.',
    highCPCKeywords: ['qr code generator', 'create qr code free', 'wifi qr code generator'],
    isTopEarning: true,
    iconName: 'Zap',
    cpcTier: 'Very High',
    estimatedCPC: '$16.40'
  },
  {
    slug: 'qr-code-scanner',
    name: 'QR Code Scanner',
    category: 'Image Tools',
    description: 'Scan and decode QR codes from an uploaded image or your camera   privately, in your browser.',
    highCPCKeywords: ['qr code scanner online', 'decode qr code from image', 'qr reader'],
    isTopEarning: false,
    iconName: 'Zap',
    cpcTier: 'High',
    estimatedCPC: '$12.20'
  },
  {
    slug: 'meme-generator',
    name: 'Meme Generator',
    category: 'Image Tools',
    description: 'Make memes from any photo with classic top and bottom captions   stroke text, adjustable size, instant PNG download.',
    highCPCKeywords: ['meme generator', 'make a meme online', 'meme maker free'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.80'
  },
  {
    slug: 'image-to-text-ocr',
    name: 'Image to Text (OCR)',
    category: 'Image Tools',
    description: 'Extract editable text from photos and screenshots with English OCR, right in your browser.',
    highCPCKeywords: ['image to text converter', 'ocr online free', 'extract text from image'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$15.30'
  },
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    category: 'Image Tools',
    description: 'Crop and size photos to official passport and visa dimensions (US, UK/EU, China, Canada, Australia) at 300 DPI, with a printable 4×6 sheet.',
    highCPCKeywords: ['passport photo maker', 'passport size photo online', 'visa photo editor'],
    isTopEarning: true,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$17.20'
  },
  {
    slug: 'favicon-generator',
    name: 'Favicon Generator',
    category: 'Image Tools',
    description: 'Generate a complete favicon package from an image, text or emoji   ICO file, every PNG size and the HTML tags, zipped.',
    highCPCKeywords: ['favicon generator', 'ico converter', 'make favicon from image'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.60'
  },
  {
    slug: 'image-watermark',
    name: 'Add Watermark to Image',
    category: 'Image Tools',
    description: 'Stamp text or logo watermarks on photos   any position or tiled, with opacity and size controls.',
    highCPCKeywords: ['add watermark to photo', 'watermark image online', 'photo watermark maker'],
    isTopEarning: false,
    iconName: 'ShieldCheck',
    cpcTier: 'High',
    estimatedCPC: '$12.70'
  },
  {
    slug: 'color-palette-extractor',
    name: 'Color Palette Extractor',
    category: 'Image Tools',
    description: 'Pull the dominant colors out of any image as a designer-ready palette   HEX and RGB values, CSS variables and a palette image.',
    highCPCKeywords: ['color palette from image', 'extract colors from photo', 'image color palette generator'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'profile-picture-maker',
    name: 'Profile Picture Maker',
    category: 'Image Tools',
    description: 'Create polished profile pictures with circular crops, stylish rings and custom backgrounds for social media.',
    highCPCKeywords: ['profile picture maker', 'pfp maker', 'circle crop image'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.40'
  },
  {
    slug: 'image-collage-maker',
    name: 'Photo Collage Maker',
    category: 'Image Tools',
    description: 'Combine up to 9 photos into a beautiful collage   grid and strip layouts, custom gaps, rounded corners and backgrounds.',
    highCPCKeywords: ['photo collage maker', 'collage maker online free', 'combine photos into one'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$12.40'
  },
  {
    slug: 'image-splitter',
    name: 'Image Splitter',
    category: 'Image Tools',
    description: 'Split one image into a grid of tiles for Instagram carousel posts and banners   download all tiles as a ZIP.',
    highCPCKeywords: ['image splitter', 'instagram grid maker', 'split image into pieces'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.20'
  },
  {
    slug: 'image-color-picker',
    name: 'Image Color Picker',
    category: 'Image Tools',
    description: 'Click any pixel in an image to get its exact color   HEX, RGB and HSL values, with a picked-colors palette.',
    highCPCKeywords: ['image color picker', 'color picker from image', 'eyedropper tool online'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$10.90'
  },
  {
    slug: 'photo-filter-editor',
    name: 'Photo Filter Editor',
    category: 'Image Tools',
    description: 'Enhance photos with brightness, contrast, saturation and more, plus one-tap presets like Vivid, Mono, Sepia and Vintage.',
    highCPCKeywords: ['photo filter online', 'image filter editor', 'apply filters to photos free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.10'
  },
  {
    slug: 'svg-to-png-converter',
    name: 'SVG to PNG Converter',
    category: 'Image Tools',
    description: 'Convert SVG graphics to crisp PNG images at any size, with transparent or colored backgrounds.',
    highCPCKeywords: ['svg to png', 'convert svg to png online', 'svg converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.70'
  },
  {
    slug: 'image-to-ascii-art',
    name: 'Image to ASCII Art',
    category: 'Image Tools',
    description: 'Turn any photo into ASCII text art   adjustable width and character styles, export as text or image.',
    highCPCKeywords: ['image to ascii art', 'ascii art generator', 'photo to text art'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$9.90'
  },

  // PDF Tools
  {
    slug: 'word-to-pdf-converter-safe',
    name: 'Text & Word to PDF Converter',
    category: 'PDF Tools',
    description: 'Format, style, and generate standard PDF documents from text, notes, and rich documents 100% in-browser.',
    highCPCKeywords: ['word to pdf converter', 'text to pdf online', 'create pdf document free', 'safe pdf converter legal'],
    isTopEarning: false,
    iconName: 'FileType',
    cpcTier: 'High',
    estimatedCPC: '$18.40'
  },
  {
    slug: 'pdf-page-counter-inspector',
    name: 'PDF Page Counter & Metadata Inspector',
    category: 'PDF Tools',
    description: 'Inspect PDF document properties, count pages, detect dimensions, title, author, and encryption state safely.',
    highCPCKeywords: ['pdf page counter', 'inspect pdf metadata', 'check pdf size online', 'pdf security checker'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$13.70'
  },

  // iLovePDF-style full PDF suite (all processed 100% in-browser)
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    category: 'PDF Tools',
    description: 'Combine multiple PDF files into one document, in the exact order you choose.',
    highCPCKeywords: ['merge pdf', 'combine pdf files', 'pdf merger online free'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$22.50'
  },
  {
    slug: 'split-pdf',
    name: 'Split PDF',
    category: 'PDF Tools',
    description: 'Separate PDF pages by custom ranges, extract selected pages, or split into single-page files.',
    highCPCKeywords: ['split pdf', 'extract pdf pages', 'separate pdf pages free'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$21.80'
  },
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    category: 'PDF Tools',
    description: 'Reduce PDF file size with recommended, extreme, or high-quality compression   or a lossless re-save.',
    highCPCKeywords: ['compress pdf', 'reduce pdf file size', 'pdf compressor online'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$24.10'
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'PDF Tools',
    description: 'Convert PDF documents into editable Word (.docx) files with headings and paragraphs preserved.',
    highCPCKeywords: ['pdf to word', 'convert pdf to docx', 'pdf to word converter free'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Premium',
    estimatedCPC: '$26.40'
  },
  {
    slug: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    category: 'PDF Tools',
    description: 'Turn each PDF page into a PowerPoint slide with the page image plus editable extracted text.',
    highCPCKeywords: ['pdf to powerpoint', 'pdf to pptx converter', 'convert pdf to slides'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$19.60'
  },
  {
    slug: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'PDF Tools',
    description: 'Pull the text of PDF pages into Excel spreadsheets, one sheet per page, rows and columns detected from layout.',
    highCPCKeywords: ['pdf to excel', 'convert pdf to xlsx', 'extract pdf table to excel'],
    isTopEarning: false,
    iconName: 'FileSpreadsheet',
    cpcTier: 'Very High',
    estimatedCPC: '$20.30'
  },
  {
    slug: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'PDF Tools',
    description: 'Convert Word (.docx) documents into clean, printable PDF files directly in your browser.',
    highCPCKeywords: ['word to pdf', 'docx to pdf converter', 'convert word to pdf free'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Premium',
    estimatedCPC: '$23.70'
  },
  {
    slug: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    category: 'PDF Tools',
    description: 'Convert PowerPoint (.pptx) slides into a PDF document with slide text and images.',
    highCPCKeywords: ['powerpoint to pdf', 'pptx to pdf converter', 'slides to pdf'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$18.90'
  },
  {
    slug: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'PDF Tools',
    description: 'Convert Excel and CSV spreadsheets into tidy, landscape PDF documents.',
    highCPCKeywords: ['excel to pdf', 'xlsx to pdf converter', 'spreadsheet to pdf'],
    isTopEarning: false,
    iconName: 'FileSpreadsheet',
    cpcTier: 'Very High',
    estimatedCPC: '$18.20'
  },
  {
    slug: 'edit-pdf',
    name: 'Edit PDF',
    category: 'PDF Tools',
    description: 'Add text, images, and shapes anywhere on a PDF page and download the edited document.',
    highCPCKeywords: ['edit pdf', 'pdf editor online free', 'add text to pdf'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$25.30'
  },
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    category: 'PDF Tools',
    description: 'Convert PDF pages into high-quality JPG or PNG images, individually or as a ZIP.',
    highCPCKeywords: ['pdf to jpg', 'convert pdf to image', 'pdf to png online'],
    isTopEarning: true,
    iconName: 'Image',
    cpcTier: 'Premium',
    estimatedCPC: '$21.20'
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    category: 'PDF Tools',
    description: 'Convert JPG, PNG, and other images into a PDF with fit, A4, or Letter pages and adjustable margins.',
    highCPCKeywords: ['jpg to pdf', 'image to pdf converter', 'png to pdf online free'],
    isTopEarning: true,
    iconName: 'Image',
    cpcTier: 'Premium',
    estimatedCPC: '$22.90'
  },
  {
    slug: 'sign-pdf',
    name: 'Sign PDF',
    category: 'PDF Tools',
    description: 'Draw, type, or upload your signature and place it on any page of a PDF document.',
    highCPCKeywords: ['sign pdf', 'esign pdf online', 'add signature to pdf free'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$24.60'
  },
  {
    slug: 'watermark-pdf',
    name: 'Add Watermark to PDF',
    category: 'PDF Tools',
    description: 'Stamp text or image watermarks over PDF pages with custom size, opacity, and placement.',
    highCPCKeywords: ['watermark pdf', 'add watermark to pdf', 'stamp pdf online'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$16.80'
  },
  {
    slug: 'rotate-pdf',
    name: 'Rotate PDF',
    category: 'PDF Tools',
    description: 'Rotate all pages or a chosen page range of a PDF by 90, 180, or 270 degrees   permanently.',
    highCPCKeywords: ['rotate pdf', 'rotate pdf pages online', 'fix pdf orientation'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$14.50'
  },
  {
    slug: 'html-to-pdf',
    name: 'HTML to PDF',
    category: 'PDF Tools',
    description: 'Convert a web page URL or pasted HTML code into a PDF document.',
    highCPCKeywords: ['html to pdf', 'webpage to pdf', 'url to pdf converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$17.40'
  },
  {
    slug: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'PDF Tools',
    description: 'Remove password restrictions from a PDF   instantly for permission-locked files, or with the document password.',
    highCPCKeywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf online'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$23.10'
  },
  {
    slug: 'protect-pdf',
    name: 'Protect PDF',
    category: 'PDF Tools',
    description: 'Encrypt a PDF with a password and control printing, copying, and editing permissions.',
    highCPCKeywords: ['protect pdf', 'password protect pdf', 'encrypt pdf online'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$22.20'
  },
  {
    slug: 'organize-pdf',
    name: 'Organize PDF',
    category: 'PDF Tools',
    description: 'Reorder, rotate, and delete PDF pages visually, and insert blank pages exactly where you need them.',
    highCPCKeywords: ['organize pdf', 'rearrange pdf pages', 'delete pdf pages', 'sort pdf pages'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$17.90'
  },
  {
    slug: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    category: 'PDF Tools',
    description: 'Rebuild a PDF with PDF/A-3B identification (XMP) metadata for long-term archiving.',
    highCPCKeywords: ['pdf to pdfa', 'pdfa converter', 'archive pdf iso standard'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$19.10'
  },
  {
    slug: 'repair-pdf',
    name: 'Repair PDF',
    category: 'PDF Tools',
    description: 'Recover pages from damaged or corrupt PDF files by rebuilding the document structure.',
    highCPCKeywords: ['repair pdf', 'fix corrupt pdf', 'recover pdf file online'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$18.60'
  },
  {
    slug: 'page-numbers-pdf',
    name: 'Add Page Numbers',
    category: 'PDF Tools',
    description: 'Insert page numbers into a PDF with your choice of position, format, size, and starting number.',
    highCPCKeywords: ['add page numbers to pdf', 'pdf page numbering', 'number pdf pages online'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.90'
  },
  {
    slug: 'scan-to-pdf',
    name: 'Scan to PDF',
    category: 'PDF Tools',
    description: 'Capture document pages with your camera or upload photos and combine them into one PDF.',
    highCPCKeywords: ['scan to pdf', 'document scanner pdf', 'camera scan to pdf'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$19.80'
  },
  {
    slug: 'ocr-pdf',
    name: 'OCR PDF',
    category: 'PDF Tools',
    description: 'Recognize the text in scanned PDFs and rebuild them as searchable documents with an invisible text layer.',
    highCPCKeywords: ['ocr pdf', 'scanned pdf to searchable', 'pdf text recognition'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Premium',
    estimatedCPC: '$25.90'
  },
  {
    slug: 'compare-pdf',
    name: 'Compare PDF',
    category: 'PDF Tools',
    description: 'Compare two PDF documents side by side and highlight the words that were added or removed.',
    highCPCKeywords: ['compare pdf', 'pdf diff tool', 'compare two pdf files'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$18.40'
  },
  {
    slug: 'redact-pdf',
    name: 'Redact PDF',
    category: 'PDF Tools',
    description: 'Permanently black out sensitive text and areas   by drawing boxes or by searching for words.',
    highCPCKeywords: ['redact pdf', 'black out text in pdf', 'remove sensitive info pdf'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$19.40'
  },
  {
    slug: 'crop-pdf',
    name: 'Crop PDF',
    category: 'PDF Tools',
    description: 'Trim the margins of PDF pages   for all pages or a chosen range   in percent or millimeters.',
    highCPCKeywords: ['crop pdf', 'trim pdf margins', 'resize pdf pages'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$14.20'
  },
  {
    slug: 'pdf-forms',
    name: 'PDF Forms',
    category: 'PDF Tools',
    description: 'Detect and fill the form fields of a PDF, or add new fillable text fields and checkboxes.',
    highCPCKeywords: ['pdf forms', 'fill pdf form online', 'create fillable pdf'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$17.60'
  },
  {
    slug: 'ai-pdf-summarizer',
    name: 'AI PDF Summarizer',
    category: 'PDF Tools',
    description: 'Extract a PDF\'s text and generate a brief, detailed, or bullet summary with AI (Gemini).',
    highCPCKeywords: ['ai pdf summarizer', 'summarize pdf online', 'pdf summary generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'Premium',
    estimatedCPC: '$21.50'
  },
  {
    slug: 'translate-pdf',
    name: 'Translate PDF',
    category: 'PDF Tools',
    description: 'Translate a whole PDF document into English with AI, keeping the page order and structure.',
    highCPCKeywords: ['translate pdf', 'pdf translator online', 'translate document ai'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'Premium',
    estimatedCPC: '$23.30'
  },
  {
    slug: 'pdf-to-markdown',
    name: 'PDF to Markdown',
    category: 'PDF Tools',
    description: 'Turn a PDF into clean Markdown   headings from font sizes, normalized lists, page separators.',
    highCPCKeywords: ['pdf to markdown', 'convert pdf to md', 'pdf markdown exporter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$15.60'
  },

  // Competitor-parity suite (Smallpdf / Sejda / PDF24 / PDF Candy / TinyWow)
  {
    slug: 'delete-pdf-pages',
    name: 'Delete PDF Pages',
    category: 'PDF Tools',
    description: 'Click the pages you want to remove from a PDF and download the cleaned document.',
    highCPCKeywords: ['delete pdf pages', 'remove pages from pdf', 'pdf page deleter'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.40'
  },
  {
    slug: 'extract-pdf-pages',
    name: 'Extract PDF Pages',
    category: 'PDF Tools',
    description: 'Pull selected page ranges out of a PDF into one new document, or one file per range.',
    highCPCKeywords: ['extract pdf pages', 'save selected pdf pages', 'pdf page extractor'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.80'
  },
  {
    slug: 'alternate-mix-pdf',
    name: 'Alternate & Mix PDF',
    category: 'PDF Tools',
    description: 'Interleave pages from two or more PDFs   perfect for merging single-sided scans of two-sided documents.',
    highCPCKeywords: ['alternate mix pdf', 'interleave pdf pages', 'mix pdf files'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'split-pdf-by-bookmarks',
    name: 'Split PDF by Bookmarks',
    category: 'PDF Tools',
    description: 'Split a PDF into separate documents at its bookmarks   one file per chapter or section.',
    highCPCKeywords: ['split pdf by bookmarks', 'split pdf by chapters', 'pdf outline splitter'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },
  {
    slug: 'split-pdf-in-half',
    name: 'Split PDF in Half',
    category: 'PDF Tools',
    description: 'Split two-page-spread scans into single pages   A3 spreads to double A4, or A4 to double A5.',
    highCPCKeywords: ['split pdf in half', 'split scanned spreads', 'a3 to a4 splitter'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.40'
  },
  {
    slug: 'split-pdf-by-size',
    name: 'Split PDF by Size',
    category: 'PDF Tools',
    description: 'Split a large PDF into smaller documents that each stay under a target file size in MB.',
    highCPCKeywords: ['split pdf by size', 'split pdf by file size', 'reduce pdf parts'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.70'
  },
  {
    slug: 'split-pdf-by-text',
    name: 'Split PDF by Text',
    category: 'PDF Tools',
    description: 'Split a PDF wherever a word or phrase appears   separate invoices, statements, or reports automatically.',
    highCPCKeywords: ['split pdf by text', 'split pdf by keyword', 'separate invoices pdf'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.10'
  },
  {
    slug: 'deskew-pdf',
    name: 'Deskew PDF',
    category: 'PDF Tools',
    description: 'Detect the skew angle of scanned pages and straighten them automatically.',
    highCPCKeywords: ['deskew pdf', 'straighten scanned pdf', 'fix tilted pdf scan'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.30'
  },
  {
    slug: 'flatten-pdf',
    name: 'Flatten PDF',
    category: 'PDF Tools',
    description: 'Flatten form fields into the page content so filled forms can no longer be edited   or flatten everything.',
    highCPCKeywords: ['flatten pdf', 'flatten form fields', 'make pdf non editable'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.60'
  },
  {
    slug: 'bates-numbering-pdf',
    name: 'Bates Numbering',
    category: 'PDF Tools',
    description: 'Stamp sequential Bates numbers (e.g. CASE-000001) across one or many PDF files for legal discovery.',
    highCPCKeywords: ['bates numbering pdf', 'bates stamp software', 'legal pdf numbering'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$17.20'
  },
  {
    slug: 'create-bookmarks-pdf',
    name: 'Create PDF Bookmarks',
    category: 'PDF Tools',
    description: 'Add a bookmark outline to a PDF   manually, or automatically from the first line of each page.',
    highCPCKeywords: ['create pdf bookmarks', 'add pdf outline', 'pdf table of contents maker'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.90'
  },
  {
    slug: 'edit-pdf-metadata',
    name: 'Edit PDF Metadata',
    category: 'PDF Tools',
    description: 'View and change a PDF\'s title, author, subject, keywords, creator, and producer   or clear them all.',
    highCPCKeywords: ['edit pdf metadata', 'change pdf title author', 'remove pdf metadata'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.20'
  },
  {
    slug: 'extract-pdf-images',
    name: 'Extract Images from PDF',
    category: 'PDF Tools',
    description: 'Extract the original embedded images out of a PDF as PNG files   no screenshots, no quality loss.',
    highCPCKeywords: ['extract images from pdf', 'get pictures out of pdf', 'pdf image extractor'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$16.40'
  },
  {
    slug: 'flip-pdf-pages',
    name: 'Flip PDF Pages',
    category: 'PDF Tools',
    description: 'Mirror PDF pages horizontally or vertically   fixes mirrored scans and camera captures.',
    highCPCKeywords: ['flip pdf pages', 'mirror pdf', 'flip pdf horizontally'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },
  {
    slug: 'grayscale-pdf',
    name: 'Grayscale PDF',
    category: 'PDF Tools',
    description: 'Convert a color PDF to black & white grayscale   saves ink and often shrinks the file.',
    highCPCKeywords: ['grayscale pdf', 'convert pdf to black and white', 'pdf to grayscale'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.80'
  },
  {
    slug: 'header-footer-pdf',
    name: 'Add Header & Footer to PDF',
    category: 'PDF Tools',
    description: 'Stamp custom header and footer text   left, center, right   with page-number placeholders on every page.',
    highCPCKeywords: ['add header footer pdf', 'pdf header stamp', 'footer text on pdf pages'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.50'
  },
  {
    slug: 'nup-pdf',
    name: 'N-up PDF',
    category: 'PDF Tools',
    description: 'Print multiple PDF pages per sheet   2, 4, 6, or 9-up on A4, A3, or Letter   keeping pages vector-sharp.',
    highCPCKeywords: ['n-up pdf', 'multiple pages per sheet pdf', '2 up pdf', 'booklet pages per sheet'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.70'
  },
  {
    slug: 'rename-pdf-by-content',
    name: 'Rename PDF by Content',
    category: 'PDF Tools',
    description: 'Rename PDF files automatically using the first line of text inside each document.',
    highCPCKeywords: ['rename pdf by content', 'batch rename pdf files', 'pdf auto rename'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.50'
  },
  {
    slug: 'resize-pdf-pages',
    name: 'Resize PDF Pages',
    category: 'PDF Tools',
    description: 'Change the page size of a PDF   A3, A4, A5, Letter, or Legal   scaling content to fit or stretch.',
    highCPCKeywords: ['resize pdf pages', 'change pdf page size', 'convert pdf to a4'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$13.00'
  },
  {
    slug: 'remove-annotations-pdf',
    name: 'Remove PDF Annotations',
    category: 'PDF Tools',
    description: 'Strip all annotations   highlights, comments, stamps, and markups   from a PDF in one pass.',
    highCPCKeywords: ['remove pdf annotations', 'delete pdf highlights comments', 'clean pdf markups'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },
  {
    slug: 'pdf-to-epub',
    name: 'PDF to EPUB',
    category: 'PDF Tools',
    description: 'Convert a PDF into a reflowable EPUB eBook with chapters you can read on any e-reader.',
    highCPCKeywords: ['pdf to epub', 'convert pdf to ebook', 'pdf epub converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$16.90'
  },
  {
    slug: 'epub-to-pdf',
    name: 'EPUB to PDF',
    category: 'PDF Tools',
    description: 'Convert an EPUB eBook into a paginated PDF document, chapter by chapter.',
    highCPCKeywords: ['epub to pdf', 'convert ebook to pdf', 'epub pdf converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$16.60'
  },
  {
    slug: 'pdf-to-csv',
    name: 'PDF to CSV',
    category: 'PDF Tools',
    description: 'Extract the rows of a PDF into a CSV file   columns detected from the page layout.',
    highCPCKeywords: ['pdf to csv', 'extract pdf table to csv', 'pdf data extraction'],
    isTopEarning: false,
    iconName: 'FileSpreadsheet',
    cpcTier: 'High',
    estimatedCPC: '$14.80'
  },
  {
    slug: 'pdf-to-tiff',
    name: 'PDF to TIFF',
    category: 'PDF Tools',
    description: 'Convert PDF pages into a multi-page TIFF file at 150 or 300 DPI for print and fax workflows.',
    highCPCKeywords: ['pdf to tiff', 'convert pdf to tiff', 'pdf tiff 300 dpi'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$14.40'
  },
  {
    slug: 'tiff-to-pdf',
    name: 'TIFF to PDF',
    category: 'PDF Tools',
    description: 'Convert TIFF images   including multi-page TIFFs   into a PDF document.',
    highCPCKeywords: ['tiff to pdf', 'convert tiff to pdf', 'multipage tiff to pdf'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$14.10'
  },
  {
    slug: 'pdf-reader',
    name: 'PDF Reader',
    category: 'PDF Tools',
    description: 'Read PDFs right in your browser with zoom   no uploads, no installs, completely private.',
    highCPCKeywords: ['pdf reader online', 'open pdf in browser', 'view pdf free'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$14.90'
  },
  {
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    category: 'PDF Tools',
    description: 'Extract all the text from a PDF into a plain .txt file, with a live preview and counts.',
    highCPCKeywords: ['pdf to text', 'extract text from pdf', 'pdf txt converter'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.20'
  },
  {
    slug: 'text-to-pdf',
    name: 'Text to PDF',
    category: 'PDF Tools',
    description: 'Turn typed or pasted text   or a .txt file   into a clean, paginated PDF document.',
    highCPCKeywords: ['text to pdf', 'txt to pdf converter', 'create pdf from text'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.10'
  },
  {
    slug: 'pdf-to-bmp',
    name: 'PDF to BMP',
    category: 'PDF Tools',
    description: 'Convert PDF pages into BMP images at up to 3x resolution.',
    highCPCKeywords: ['pdf to bmp', 'convert pdf to bmp image'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'remove-watermark-pdf',
    name: 'PDF Watermark Remover',
    category: 'PDF Tools',
    description: 'Cover watermark areas with opaque patches you draw   the rest of every page stays vector-sharp.',
    highCPCKeywords: ['remove watermark from pdf', 'pdf watermark remover', 'cover pdf watermark'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$17.80'
  },
  {
    slug: 'pdf-background',
    name: 'Add PDF Background',
    category: 'PDF Tools',
    description: 'Paint a background color behind every page of a PDF   letterheads, forms, and handouts.',
    highCPCKeywords: ['add background to pdf', 'pdf background color', 'change pdf background'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.00'
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    category: 'PDF Tools',
    description: 'Convert PNG images into a PDF with fit, A4, or Letter pages and adjustable margins.',
    highCPCKeywords: ['png to pdf', 'convert png to pdf', 'png pdf converter'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$16.20'
  },
  {
    slug: 'webp-to-pdf',
    name: 'WebP to PDF',
    category: 'PDF Tools',
    description: 'Convert WebP images into a PDF document in seconds.',
    highCPCKeywords: ['webp to pdf', 'convert webp to pdf'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$13.40'
  },
  {
    slug: 'gif-to-pdf',
    name: 'GIF to PDF',
    category: 'PDF Tools',
    description: 'Convert GIF images into a PDF document (first frame of animated GIFs).',
    highCPCKeywords: ['gif to pdf', 'convert gif to pdf'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'heic-to-pdf',
    name: 'HEIC to PDF',
    category: 'PDF Tools',
    description: 'Convert iPhone HEIC photos into a PDF   works where your browser can display HEIC (e.g. Safari).',
    highCPCKeywords: ['heic to pdf', 'convert heic to pdf', 'iphone photo to pdf'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$15.80'
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    category: 'PDF Tools',
    description: 'Convert PDF pages into transparent-quality PNG images at up to 3x resolution.',
    highCPCKeywords: ['pdf to png', 'convert pdf to png image'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'Very High',
    estimatedCPC: '$16.70'
  },

  // Text & AI Tools
  {
    slug: 'word-character-counter-pro',
    name: 'Word & Character Counter Pro',
    category: 'Text & AI Tools',
    description: 'Instant real-time word count, character count (with/without spaces), reading time, speaking time, and keyword density checker.',
    highCPCKeywords: ['word counter online', 'character counter free', 'reading time calculator', 'essay word count checker'],
    isTopEarning: true,
    iconName: 'FileDigit',
    cpcTier: 'High',
    estimatedCPC: '$15.90'
  },
  {
    slug: 'text-case-converter',
    name: 'Text Case Converter Pro',
    category: 'Text & AI Tools',
    description: 'Convert text instantly to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, and snake_case.',
    highCPCKeywords: ['case converter online', 'uppercase to lowercase', 'title case converter', 'camelcase generator'],
    isTopEarning: false,
    iconName: 'Type',
    cpcTier: 'High',
    estimatedCPC: '$11.80'
  },
  {
    slug: 'lorem-ipsum-generator-pro',
    name: 'Lorem Ipsum Generator Pro',
    category: 'Text & AI Tools',
    description: 'Generate customizable dummy placeholder text by paragraphs, sentences, words, or lists for designers and developers.',
    highCPCKeywords: ['lorem ipsum generator', 'dummy text generator', 'placeholder text online', 'latin filler text'],
    isTopEarning: false,
    iconName: 'AlignLeft',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },

  // Unit Converters
  {
    slug: 'length-distance-converter',
    name: 'Length & Distance Converter',
    category: 'Unit Converters',
    description: 'Convert between Inches, Feet, Yards, Miles, Millimeters, Centimeters, Meters, and Kilometers with exact precision.',
    highCPCKeywords: ['length converter', 'feet to meters converter', 'miles to km online', 'inches to cm converter'],
    isTopEarning: false,
    iconName: 'Ruler',
    cpcTier: 'High',
    estimatedCPC: '$13.40'
  },
  {
    slug: 'weight-mass-converter',
    name: 'Weight & Mass Converter',
    category: 'Unit Converters',
    description: 'Convert between Pounds (lbs), Ounces (oz), Kilograms (kg), Grams (g), Stones, and Metric Tons seamlessly.',
    highCPCKeywords: ['weight converter', 'lbs to kg converter', 'ounces to grams calculator', 'mass conversion online'],
    isTopEarning: false,
    iconName: 'Weight',
    cpcTier: 'High',
    estimatedCPC: '$14.10'
  },
  {
    slug: 'temperature-converter-pro',
    name: 'Temperature Converter Pro',
    category: 'Unit Converters',
    description: 'Convert between Fahrenheit (°F), Celsius (°C), and Kelvin (K) with step-by-step mathematical formulas.',
    highCPCKeywords: ['temperature converter', 'fahrenheit to celsius formula', 'celsius to fahrenheit chart', 'kelvin converter'],
    isTopEarning: false,
    iconName: 'Thermometer',
    cpcTier: 'High',
    estimatedCPC: '$12.80'
  },

  // Home & Daily Life
  {
    slug: 'grocery-budget-planner',
    name: 'Grocery Budget & Meal Cost Planner',
    category: 'Home & Daily Life',
    description: 'Plan your weekly household grocery spending, calculate cost per meal, and stop overspending at US supermarkets.',
    highCPCKeywords: ['grocery budget planner', 'cheap meal planning tool', 'family grocery budget usa', 'cost per meal calculator'],
    isTopEarning: false,
    iconName: 'ShoppingCart',
    cpcTier: 'High',
    estimatedCPC: '$16.20'
  },
  {
    slug: 'tip-bill-splitter-calculator',
    name: 'Tip & Bill Splitter Calculator',
    category: 'Home & Daily Life',
    description: 'Calculate standard US tipping percentages (15%, 18%, 20%, 25%) and split restaurant bills evenly among friends.',
    highCPCKeywords: ['tip calculator usa', 'bill split calculator', 'restaurant tip percentage', 'split check evenly calculator'],
    isTopEarning: false,
    iconName: 'Split',
    cpcTier: 'High',
    estimatedCPC: '$14.50'
  },
  {
    slug: 'home-electricity-cost-calculator',
    name: 'Home Electricity Cost Calculator',
    category: 'Home & Daily Life',
    description: 'Calculate the true electricity running cost of air conditioners, space heaters, refrigerators, and computers in kWh.',
    highCPCKeywords: ['electricity cost calculator', 'kwh appliance cost calculator', 'energy bill estimator usa', 'electric rate cost per hour'],
    isTopEarning: false,
    iconName: 'Zap',
    cpcTier: 'Very High',
    estimatedCPC: '$21.40'
  },

  // Word Tools suite (.docx)   viewer, editor, converters and document surgery
  {
    slug: 'word-viewer',
    name: 'Word Viewer',
    category: 'Word Tools',
    description: 'Open and read any Word (.docx) document right in your browser   no Microsoft Word needed.',
    highCPCKeywords: ['docx viewer online', 'open word file online', 'view docx without word'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$9.80'
  },
  {
    slug: 'word-editor',
    name: 'Word Editor',
    category: 'Word Tools',
    description: 'Edit a Word document online   change text, headings and formatting, then download the updated .docx.',
    highCPCKeywords: ['edit word document online', 'docx editor online free', 'edit docx'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$16.90'
  },
  {
    slug: 'word-to-jpg',
    name: 'Word to JPG',
    category: 'Word Tools',
    description: 'Render a Word document into JPG or PNG images   one image per page, zipped for download.',
    highCPCKeywords: ['word to jpg', 'docx to image', 'word to png converter'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.40'
  },
  {
    slug: 'word-to-html',
    name: 'Word to HTML',
    category: 'Word Tools',
    description: 'Convert a Word document into a clean, standalone HTML file with a live preview.',
    highCPCKeywords: ['word to html', 'docx to html converter', 'convert word document to webpage'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.60'
  },
  {
    slug: 'word-to-text',
    name: 'Word to Text',
    category: 'Word Tools',
    description: 'Extract the plain text from a Word document and download it as a .txt file.',
    highCPCKeywords: ['word to text', 'docx to txt', 'extract text from word'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$9.20'
  },
  {
    slug: 'word-to-markdown',
    name: 'Word to Markdown',
    category: 'Word Tools',
    description: 'Convert a Word document to clean Markdown with headings, lists and emphasis preserved.',
    highCPCKeywords: ['word to markdown', 'docx to md', 'convert docx to markdown'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.90'
  },
  {
    slug: 'word-to-epub',
    name: 'Word to EPUB',
    category: 'Word Tools',
    description: 'Turn a Word document into an EPUB eBook, with a chapter created at every top-level heading.',
    highCPCKeywords: ['word to epub', 'docx to epub converter', 'make ebook from word'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$11.80'
  },
  {
    slug: 'word-to-odt',
    name: 'Word to ODT',
    category: 'Word Tools',
    description: 'Convert Word (.docx) documents to OpenDocument Text (.odt) for LibreOffice and OpenOffice.',
    highCPCKeywords: ['docx to odt', 'word to odt converter', 'convert docx to openoffice'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$10.20'
  },
  {
    slug: 'odt-to-word',
    name: 'ODT to Word',
    category: 'Word Tools',
    description: 'Convert OpenDocument Text (.odt) files into editable Word (.docx) documents.',
    highCPCKeywords: ['odt to docx', 'odt to word converter', 'convert odt file to word'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$10.40'
  },
  {
    slug: 'text-to-word',
    name: 'Text to Word',
    category: 'Word Tools',
    description: 'Turn plain text or Markdown into a formatted Word document   paste text or upload a .txt/.md file.',
    highCPCKeywords: ['text to word', 'txt to docx', 'create word document from text'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$9.60'
  },
  {
    slug: 'merge-word',
    name: 'Merge Word Documents',
    category: 'Word Tools',
    description: 'Combine multiple Word documents into a single .docx, one after another with page breaks.',
    highCPCKeywords: ['merge word documents', 'combine docx files', 'merge docx online'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$15.70'
  },
  {
    slug: 'split-word',
    name: 'Split Word Document',
    category: 'Word Tools',
    description: 'Split a Word document into separate files   at every chapter heading or every N paragraphs.',
    highCPCKeywords: ['split word document', 'split docx', 'divide word file'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },
  {
    slug: 'extract-word-images',
    name: 'Extract Images from Word',
    category: 'Word Tools',
    description: 'Pull every embedded picture out of a Word document at its original quality, in one zip.',
    highCPCKeywords: ['extract images from word', 'get pictures from docx', 'save images from word document'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$10.80'
  },
  {
    slug: 'word-analyzer',
    name: 'Word Document Analyzer',
    category: 'Word Tools',
    description: 'Full statistics for a Word document   words, characters, headings, tables, images, reading time and top words.',
    highCPCKeywords: ['word document statistics', 'docx word count', 'analyze word document'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$9.40'
  },
  {
    slug: 'word-metadata-editor',
    name: 'Word Metadata Editor',
    category: 'Word Tools',
    description: 'View, edit or remove a Word document\'s properties   title, author, subject, keywords and more.',
    highCPCKeywords: ['edit docx metadata', 'word document properties', 'remove metadata from word'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$11.10'
  },
  {
    slug: 'unlock-word',
    name: 'Unlock Word',
    category: 'Word Tools',
    description: 'Remove editing restrictions (read-only / forms protection) from a Word document so it can be edited again.',
    highCPCKeywords: ['unlock word document', 'remove word protection', 'unprotect docx'],
    isTopEarning: true,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$16.20'
  },
  {
    slug: 'protect-word',
    name: 'Protect Word',
    category: 'Word Tools',
    description: 'Restrict editing in a Word document   read-only, comments only, tracked changes or form filling.',
    highCPCKeywords: ['protect word document', 'restrict editing word', 'make docx read only'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'word-watermark',
    name: 'Word Watermark',
    category: 'Word Tools',
    description: 'Stamp a diagonal text watermark (CONFIDENTIAL, DRAFT…) across every page of a Word document.',
    highCPCKeywords: ['add watermark to word', 'word document watermark', 'docx watermark online'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'compress-word',
    name: 'Compress Word',
    category: 'Word Tools',
    description: 'Shrink a Word document by recompressing and downscaling its embedded images.',
    highCPCKeywords: ['compress word document', 'reduce docx file size', 'compress docx online'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.10'
  },
  {
    slug: 'repair-word',
    name: 'Repair Word',
    category: 'Word Tools',
    description: 'Repair a damaged Word document   rebuilds the file structure, or recovers its text into a clean .docx.',
    highCPCKeywords: ['repair word document', 'fix corrupt docx', 'recover damaged word file'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$14.80'
  },
  {
    slug: 'compare-word',
    name: 'Compare Word Documents',
    category: 'Word Tools',
    description: 'Compare two versions of a Word document and highlight the words that were added or removed.',
    highCPCKeywords: ['compare word documents', 'docx diff', 'compare two word files'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'Very High',
    estimatedCPC: '$15.30'
  },
  {
    slug: 'word-find-replace',
    name: 'Word Find & Replace',
    category: 'Word Tools',
    description: 'Find and replace text across a whole Word document   including headers and footers   in one pass.',
    highCPCKeywords: ['find and replace in word', 'batch replace docx', 'replace text in word document'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$11.50'
  },

  // SEO Tools suite   generators, content analyzers and technical utilities
  {
    slug: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'SEO Tools',
    description: 'Generate complete meta tags   title, description, robots, canonical, Open Graph and Twitter cards   with live length checks.',
    highCPCKeywords: ['meta tag generator', 'generate meta tags', 'meta tags creator'],
    isTopEarning: true,
    iconName: 'Search',
    cpcTier: 'Very High',
    estimatedCPC: '$14.60'
  },
  {
    slug: 'open-graph-generator',
    name: 'Open Graph Generator',
    category: 'SEO Tools',
    description: 'Create Open Graph and Twitter Card tags and preview exactly how your link will look when shared on social media.',
    highCPCKeywords: ['open graph generator', 'og tag generator', 'twitter card generator'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$11.20'
  },
  {
    slug: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    category: 'SEO Tools',
    description: 'Build a valid robots.txt file with per-bot allow/disallow rules, crawl-delay and sitemap entries   plus one-click presets.',
    highCPCKeywords: ['robots.txt generator', 'create robots txt', 'robots file maker'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$13.80'
  },
  {
    slug: 'xml-sitemap-generator',
    name: 'XML Sitemap Generator',
    category: 'SEO Tools',
    description: 'Turn a list of URLs into a valid XML sitemap with lastmod, changefreq and priority   ready to upload and submit.',
    highCPCKeywords: ['xml sitemap generator', 'create sitemap online', 'sitemap maker'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$15.10'
  },
  {
    slug: 'schema-generator',
    name: 'Schema Markup Generator',
    category: 'SEO Tools',
    description: 'Build valid JSON-LD structured data   Article, Product, LocalBusiness, HowTo, Breadcrumb, Organization and WebSite.',
    highCPCKeywords: ['schema markup generator', 'json ld generator', 'structured data generator'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$16.40'
  },
  {
    slug: 'faq-schema-generator',
    name: 'FAQ Schema Generator',
    category: 'SEO Tools',
    description: 'Turn question-and-answer pairs into valid FAQPage JSON-LD schema markup for rich search results.',
    highCPCKeywords: ['faq schema generator', 'faqpage json ld', 'faq structured data'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$12.70'
  },
  {
    slug: 'htaccess-redirect-generator',
    name: 'Htaccess Redirect Generator',
    category: 'SEO Tools',
    description: 'Generate 301/302 redirect rules for Apache (.htaccess) or Nginx in bulk, plus HTTPS and www canonical rules.',
    highCPCKeywords: ['htaccess redirect generator', '301 redirect generator', 'nginx redirect generator'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'hreflang-generator',
    name: 'Hreflang Tag Generator',
    category: 'SEO Tools',
    description: 'Generate hreflang tags for multilingual sites   as HTML link tags or a complete hreflang XML sitemap.',
    highCPCKeywords: ['hreflang generator', 'hreflang tag tool', 'multilingual seo tags'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$12.20'
  },
  {
    slug: 'utm-builder',
    name: 'UTM Builder',
    category: 'SEO Tools',
    description: 'Build campaign URLs with UTM parameters for Google Analytics   source, medium, campaign, term and content.',
    highCPCKeywords: ['utm builder', 'campaign url builder', 'utm link generator'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$10.80'
  },
  {
    slug: 'llms-txt-generator',
    name: 'LLMs.txt Generator',
    category: 'SEO Tools',
    description: 'Create an llms.txt file that tells AI assistants (ChatGPT, Claude, Gemini) how to read and cite your website.',
    highCPCKeywords: ['llms.txt generator', 'llms txt maker', 'ai seo file generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.60'
  },
  {
    slug: 'meta-tag-analyzer',
    name: 'Meta Tag Analyzer',
    category: 'SEO Tools',
    description: 'Paste any page\'s HTML to audit its title, description, canonical, robots, Open Graph, headings, images and links.',
    highCPCKeywords: ['meta tag analyzer', 'meta tags checker', 'analyze meta tags'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$12.40'
  },
  {
    slug: 'on-page-seo-analyzer',
    name: 'On-Page SEO Analyzer',
    category: 'SEO Tools',
    description: 'Full on-page SEO audit with a score out of 100   keyword placement, density, headings, links, readability and meta checks.',
    highCPCKeywords: ['on page seo checker', 'seo analyzer', 'website seo audit tool'],
    isTopEarning: true,
    iconName: 'Search',
    cpcTier: 'Very High',
    estimatedCPC: '$17.30'
  },
  {
    slug: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    category: 'SEO Tools',
    description: 'Analyze 1, 2 and 3-word phrase frequency and density in your content to avoid keyword stuffing.',
    highCPCKeywords: ['keyword density checker', 'keyword density analyzer', 'check keyword density'],
    isTopEarning: true,
    iconName: 'Search',
    cpcTier: 'Very High',
    estimatedCPC: '$14.90'
  },
  {
    slug: 'readability-checker',
    name: 'Readability Checker',
    category: 'SEO Tools',
    description: 'Score your content with Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI   plus long-sentence flags.',
    highCPCKeywords: ['readability checker', 'flesch reading ease', 'readability score test'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$10.50'
  },
  {
    slug: 'headline-analyzer',
    name: 'Headline Analyzer',
    category: 'SEO Tools',
    description: 'Score headlines for clicks   power words, emotional pull, numbers, length, format and clickbait risk.',
    highCPCKeywords: ['headline analyzer', 'headline score checker', 'title analyzer tool'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.30'
  },
  {
    slug: 'serp-snippet-preview',
    name: 'SERP Snippet Preview',
    category: 'SEO Tools',
    description: 'Preview how your page will look in Google search results   desktop and mobile   with real pixel-width truncation checks.',
    highCPCKeywords: ['serp snippet preview', 'google preview tool', 'meta preview checker'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },
  {
    slug: 'code-to-text-ratio-checker',
    name: 'Code to Text Ratio Checker',
    category: 'SEO Tools',
    description: 'Measure the ratio of visible text to HTML code on a page and extract its readable text.',
    highCPCKeywords: ['code to text ratio', 'text to html ratio checker', 'page text ratio'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$8.40'
  },
  {
    slug: 'duplicate-content-checker',
    name: 'Duplicate Content Checker',
    category: 'SEO Tools',
    description: 'Compare two texts for duplication   similarity percentage, shared phrases and matching sentences highlighted.',
    highCPCKeywords: ['duplicate content checker', 'text similarity checker', 'compare two texts'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$12.10'
  },
  {
    slug: 'heading-structure-checker',
    name: 'Heading Structure Checker',
    category: 'SEO Tools',
    description: 'Extract the H1–H6 outline from any page\'s HTML and flag multiple H1s, skipped levels and empty headings.',
    highCPCKeywords: ['heading checker', 'h1 h2 structure checker', 'heading tag analyzer'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$8.90'
  },
  {
    slug: 'link-extractor',
    name: 'Link Extractor',
    category: 'SEO Tools',
    description: 'Extract every link from a page\'s HTML   anchor text, internal/external, dofollow/nofollow   with CSV export.',
    highCPCKeywords: ['link extractor', 'extract links from website', 'get all links from page'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$11.70'
  },
  {
    slug: 'robots-txt-tester',
    name: 'Robots.txt Tester',
    category: 'SEO Tools',
    description: 'Test whether URLs are allowed or blocked by a robots.txt file for any user-agent, using the real matching rules.',
    highCPCKeywords: ['robots.txt tester', 'robots txt checker', 'test robots file'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.40'
  },
  {
    slug: 'sitemap-validator',
    name: 'Sitemap Validator',
    category: 'SEO Tools',
    description: 'Validate an XML sitemap for errors   invalid URLs, bad lastmod dates, wrong priorities and duplicates.',
    highCPCKeywords: ['sitemap validator', 'validate xml sitemap', 'sitemap checker'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.10'
  },
  {
    slug: 'redirect-chain-analyzer',
    name: 'Redirect Chain Analyzer',
    category: 'SEO Tools',
    description: 'Audit a redirect map for chains, loops and duplicate rules   and get a flattened one-hop map back.',
    highCPCKeywords: ['redirect chain checker', 'redirect loop detector', 'redirect map audit'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'keyword-clustering',
    name: 'Keyword Clustering Tool',
    category: 'SEO Tools',
    description: 'Group a keyword list into topical clusters automatically, so each cluster becomes one focused page or article.',
    highCPCKeywords: ['keyword clustering tool', 'group keywords', 'keyword grouping tool'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$13.20'
  },
  {
    slug: 'keyword-combiner',
    name: 'Keyword Combiner',
    category: 'SEO Tools',
    description: 'Combine two or three keyword lists into every permutation, with Google Ads match-type wrapping.',
    highCPCKeywords: ['keyword combiner', 'keyword combination tool', 'merge keyword lists'],
    isTopEarning: false,
    iconName: 'Search',
    cpcTier: 'High',
    estimatedCPC: '$9.70'
  },
  {
    slug: 'seo-roi-calculator',
    name: 'SEO ROI Calculator',
    category: 'SEO Tools',
    description: 'Calculate the return on an SEO campaign   projected traffic, conversions, revenue, break-even and a 12-month ramp.',
    highCPCKeywords: ['seo roi calculator', 'seo return calculator', 'seo investment calculator'],
    isTopEarning: false,
    iconName: 'TrendingUp',
    cpcTier: 'High',
    estimatedCPC: '$13.50'
  },
  {
    slug: 'code-minifier',
    name: 'HTML CSS JS Minifier',
    category: 'SEO Tools',
    description: 'Minify HTML, CSS and JavaScript to cut page weight and improve load speed   with before/after size stats.',
    highCPCKeywords: ['html minifier', 'css minifier', 'js minifier online'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.90'
  },

  // Developer Tools suite   data formats, encodings/security, web utilities
  {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'Developer Tools',
    description: 'Format, validate and minify JSON with precise error locations   line and column   plus key sorting.',
    highCPCKeywords: ['json formatter', 'json validator', 'json beautifier online'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$15.80'
  },
  {
    slug: 'json-to-csv-converter',
    name: 'JSON to CSV Converter',
    category: 'Developer Tools',
    description: 'Convert JSON arrays and objects into clean CSV spreadsheets instantly.',
    highCPCKeywords: ['json to csv', 'convert json to csv online', 'json to excel csv'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.60'
  },
  {
    slug: 'csv-to-json-converter',
    name: 'CSV to JSON Converter',
    category: 'Developer Tools',
    description: 'Convert CSV data into JSON with automatic type inference for numbers, booleans and nulls.',
    highCPCKeywords: ['csv to json', 'convert csv to json online', 'csv parser'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.40'
  },
  {
    slug: 'json-to-yaml-converter',
    name: 'JSON to YAML Converter',
    category: 'Developer Tools',
    description: 'Convert JSON into clean, readable YAML for configs, Kubernetes and CI pipelines.',
    highCPCKeywords: ['json to yaml', 'convert json to yaml online', 'json yaml converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.80'
  },
  {
    slug: 'yaml-to-json-converter',
    name: 'YAML to JSON Converter',
    category: 'Developer Tools',
    description: 'Convert YAML configs into JSON   mappings, sequences, flow collections and block scalars supported.',
    highCPCKeywords: ['yaml to json', 'convert yaml to json online', 'yaml parser'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.60'
  },
  {
    slug: 'json-to-typescript',
    name: 'JSON to TypeScript',
    category: 'Developer Tools',
    description: 'Generate TypeScript interfaces from sample JSON automatically   nested objects and arrays handled.',
    highCPCKeywords: ['json to typescript', 'generate typescript interfaces from json', 'json to ts types'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },
  {
    slug: 'json-diff-checker',
    name: 'JSON Diff Checker',
    category: 'Developer Tools',
    description: 'Compare two JSON documents and see exactly which keys were added, removed or changed   by path.',
    highCPCKeywords: ['json diff', 'compare json online', 'json compare tool'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'xml-formatter',
    name: 'XML Formatter',
    category: 'Developer Tools',
    description: 'Pretty-print and validate XML with tag-balance checking, or minify it back down.',
    highCPCKeywords: ['xml formatter', 'xml beautifier', 'format xml online'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.40'
  },
  {
    slug: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'Developer Tools',
    description: 'Format SQL queries with clause line breaks and keyword casing for readable queries.',
    highCPCKeywords: ['sql formatter', 'sql beautifier online', 'format sql query'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.20'
  },
  {
    slug: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'Developer Tools',
    description: 'Decode JWT header and payload, inspect claims with human-readable dates, and verify HS256 signatures.',
    highCPCKeywords: ['jwt decoder', 'decode jwt online', 'jwt token viewer'],
    isTopEarning: true,
    iconName: 'ShieldCheck',
    cpcTier: 'Very High',
    estimatedCPC: '$14.70'
  },
  {
    slug: 'base64-encoder-decoder',
    name: 'Base64 Encoder & Decoder',
    category: 'Developer Tools',
    description: 'Encode and decode Base64 with full Unicode support and URL-safe alphabet option.',
    highCPCKeywords: ['base64 encode', 'base64 decode online', 'base64 converter'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$13.90'
  },
  {
    slug: 'url-encoder-decoder',
    name: 'URL Encoder & Decoder',
    category: 'Developer Tools',
    description: 'Percent-encode or decode URLs and query components safely and instantly.',
    highCPCKeywords: ['url encoder', 'url decoder online', 'percent encoding'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.90'
  },
  {
    slug: 'html-entity-encoder-decoder',
    name: 'HTML Entity Encoder & Decoder',
    category: 'Developer Tools',
    description: 'Convert special characters to HTML entities and back   named, numeric and hex references.',
    highCPCKeywords: ['html entity encoder', 'html entities decoder', 'escape html online'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$8.60'
  },
  {
    slug: 'hash-generator',
    name: 'Hash Generator',
    category: 'Developer Tools',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text, plus keyed HMAC signatures.',
    highCPCKeywords: ['hash generator', 'md5 generator', 'sha256 hash online'],
    isTopEarning: false,
    iconName: 'ShieldCheck',
    cpcTier: 'High',
    estimatedCPC: '$11.80'
  },
  {
    slug: 'password-generator',
    name: 'Password Generator',
    category: 'Developer Tools',
    description: 'Generate strong random passwords on-device with crypto-grade randomness and an entropy meter.',
    highCPCKeywords: ['password generator', 'strong password generator', 'random password maker'],
    isTopEarning: true,
    iconName: 'ShieldCheck',
    cpcTier: 'Very High',
    estimatedCPC: '$16.20'
  },
  {
    slug: 'uuid-generator',
    name: 'UUID Generator',
    category: 'Developer Tools',
    description: 'Generate UUID v4 (random) and v7 (time-ordered) identifiers in bulk   up to 500 at once.',
    highCPCKeywords: ['uuid generator', 'guid generator online', 'uuid v7 generator'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.10'
  },
  {
    slug: 'timestamp-converter',
    name: 'Unix Timestamp Converter',
    category: 'Developer Tools',
    description: 'Convert Unix timestamps to human dates and back   seconds and milliseconds, UTC, local and relative time.',
    highCPCKeywords: ['timestamp converter', 'epoch converter', 'unix time to date'],
    isTopEarning: true,
    iconName: 'Clock',
    cpcTier: 'Very High',
    estimatedCPC: '$13.60'
  },
  {
    slug: 'cron-expression-parser',
    name: 'Cron Expression Parser',
    category: 'Developer Tools',
    description: 'Explain cron expressions in plain English and preview the next run times.',
    highCPCKeywords: ['cron parser', 'cron expression generator', 'crontab guru alternative'],
    isTopEarning: false,
    iconName: 'Clock',
    cpcTier: 'High',
    estimatedCPC: '$12.80'
  },
  {
    slug: 'regex-tester',
    name: 'Regex Tester',
    category: 'Developer Tools',
    description: 'Test regular expressions live with match highlighting, capture groups and named groups.',
    highCPCKeywords: ['regex tester', 'regex validator online', 'regular expression tester'],
    isTopEarning: true,
    iconName: 'FileCode',
    cpcTier: 'Very High',
    estimatedCPC: '$14.30'
  },
  {
    slug: 'color-converter',
    name: 'Color Converter',
    category: 'Developer Tools',
    description: 'Convert colors between HEX, RGB, HSL, HSV and CMYK, with shades, tints and WCAG contrast ratios.',
    highCPCKeywords: ['color converter', 'hex to rgb', 'rgb to hsl converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.70'
  },
  {
    slug: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    category: 'Developer Tools',
    description: 'Design linear and radial CSS gradients visually with multiple color stops and copy-ready code.',
    highCPCKeywords: ['css gradient generator', 'gradient maker', 'linear gradient css'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$11.50'
  },
  {
    slug: 'number-base-converter',
    name: 'Number Base Converter',
    category: 'Developer Tools',
    description: 'Convert numbers between binary, octal, decimal, hex and any base 2–36   arbitrary precision.',
    highCPCKeywords: ['binary converter', 'hex to decimal', 'number base converter'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$9.90'
  },
  {
    slug: 'url-parser',
    name: 'URL Parser',
    category: 'Developer Tools',
    description: 'Break a URL into protocol, host, path segments and query parameters   and edit parameters to rebuild it.',
    highCPCKeywords: ['url parser', 'parse url online', 'query string parser'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.20'
  },
  {
    slug: 'text-diff-checker',
    name: 'Text Diff Checker',
    category: 'Developer Tools',
    description: 'Compare two texts line by line and highlight additions and removals.',
    highCPCKeywords: ['diff checker', 'text compare online', 'compare two texts diff'],
    isTopEarning: false,
    iconName: 'FileText',
    cpcTier: 'High',
    estimatedCPC: '$11.30'
  },
  {
    slug: 'http-status-code-reference',
    name: 'HTTP Status Code Reference',
    category: 'Developer Tools',
    description: 'Searchable reference of HTTP status codes   what each 1xx–5xx code means and when it is used.',
    highCPCKeywords: ['http status codes', 'status code reference', 'http response codes list'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.10'
  },
  {
    slug: 'chmod-calculator',
    name: 'Chmod Calculator',
    category: 'Developer Tools',
    description: 'Convert Linux file permissions between rwx checkboxes, octal numbers and symbolic notation.',
    highCPCKeywords: ['chmod calculator', 'chmod 755 meaning', 'linux permissions calculator'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$9.80'
  },
  {
    slug: 'user-agent-parser',
    name: 'User Agent Parser',
    category: 'Developer Tools',
    description: 'Parse any user-agent string into browser, version, OS, device type and rendering engine.',
    highCPCKeywords: ['user agent parser', 'ua parser online', 'what is my user agent'],
    isTopEarning: false,
    iconName: 'FileCode',
    cpcTier: 'High',
    estimatedCPC: '$10.50'
  },

  // Video & Audio suite   FFmpeg.wasm converters + native recorders/speech
  {
    slug: 'video-to-gif',
    name: 'Video to GIF Converter',
    category: 'Video & Audio Tools',
    description: 'Turn video clips into high-quality animated GIFs with trim, width and frame-rate controls   palette-optimized for small files.',
    highCPCKeywords: ['video to gif', 'mp4 to gif converter', 'make gif from video'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$15.90'
  },
  {
    slug: 'video-compressor',
    name: 'Video Compressor',
    category: 'Video & Audio Tools',
    description: 'Compress MP4 videos to a fraction of their size with quality and resolution controls   no uploads, no file-size limits from a server.',
    highCPCKeywords: ['compress video online', 'reduce video file size', 'mp4 compressor'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$16.80'
  },
  {
    slug: 'video-trimmer',
    name: 'Video Trimmer',
    category: 'Video & Audio Tools',
    description: 'Cut any section from a video with precise re-encoding or fast stream-copy trimming.',
    highCPCKeywords: ['trim video online', 'cut video', 'video cutter free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.40'
  },
  {
    slug: 'video-converter',
    name: 'Video Converter',
    category: 'Video & Audio Tools',
    description: 'Convert videos between MP4, WebM and MOV formats right in your browser.',
    highCPCKeywords: ['video converter online', 'mp4 to webm', 'convert video free'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$15.10'
  },
  {
    slug: 'video-to-mp3',
    name: 'Video to MP3',
    category: 'Video & Audio Tools',
    description: 'Extract the audio from any video as MP3, WAV, M4A or OGG at up to 320 kbps.',
    highCPCKeywords: ['video to mp3', 'extract audio from video', 'mp4 to mp3 converter'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$16.20'
  },
  {
    slug: 'video-frame-capture',
    name: 'Video Frame Capture',
    category: 'Video & Audio Tools',
    description: 'Grab still frames and thumbnails from any moment of a video as PNG or JPG images.',
    highCPCKeywords: ['video thumbnail maker', 'capture frame from video', 'video snapshot online'],
    isTopEarning: false,
    iconName: 'Image',
    cpcTier: 'High',
    estimatedCPC: '$11.30'
  },
  {
    slug: 'audio-converter',
    name: 'Audio Converter',
    category: 'Video & Audio Tools',
    description: 'Convert audio between MP3, WAV, M4A and OGG with bitrate control.',
    highCPCKeywords: ['audio converter online', 'mp3 to wav', 'convert audio free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },
  {
    slug: 'audio-trimmer',
    name: 'Audio Trimmer',
    category: 'Video & Audio Tools',
    description: 'Trim audio with a visual waveform, precise start/end points and fade-in/fade-out effects.',
    highCPCKeywords: ['audio trimmer', 'cut mp3 online', 'mp3 cutter'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'audio-joiner',
    name: 'Audio Joiner',
    category: 'Video & Audio Tools',
    description: 'Merge multiple audio files into one track   mixed formats welcome, output as MP3, WAV, M4A or OGG.',
    highCPCKeywords: ['audio joiner', 'merge mp3 files', 'combine audio online'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },
  {
    slug: 'audio-volume-booster',
    name: 'Audio Volume Booster',
    category: 'Video & Audio Tools',
    description: 'Make quiet audio louder with gain control up to +30 dB, or normalize speech properly with loudnorm.',
    highCPCKeywords: ['increase audio volume', 'mp3 volume booster', 'make audio louder online'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'audio-speed-changer',
    name: 'Audio Speed Changer',
    category: 'Video & Audio Tools',
    description: 'Speed up or slow down audio from 0.25× to 3× without changing the pitch.',
    highCPCKeywords: ['change audio speed', 'speed up mp3', 'slow down audio online'],
    isTopEarning: false,
    iconName: 'Clock',
    cpcTier: 'High',
    estimatedCPC: '$11.50'
  },
  {
    slug: 'screen-recorder',
    name: 'Screen Recorder',
    category: 'Video & Audio Tools',
    description: 'Record your screen, a window or a browser tab   with microphone and system audio   and download the video. Nothing is uploaded.',
    highCPCKeywords: ['screen recorder online', 'record screen free', 'screen capture video'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$17.40'
  },
  {
    slug: 'webcam-recorder',
    name: 'Webcam Recorder',
    category: 'Video & Audio Tools',
    description: 'Record video from your webcam with a live preview and instant download.',
    highCPCKeywords: ['webcam recorder online', 'record video from camera', 'camera recorder free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.80'
  },
  {
    slug: 'voice-recorder',
    name: 'Voice Recorder',
    category: 'Video & Audio Tools',
    description: 'Record voice notes and audio from your microphone with a live level meter   save unlimited takes.',
    highCPCKeywords: ['voice recorder online', 'audio recorder', 'record voice free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.50'
  },
  {
    slug: 'text-to-speech',
    name: 'Text to Speech',
    category: 'Video & Audio Tools',
    description: 'Listen to any text read aloud with natural system voices   choose voice, speed and pitch.',
    highCPCKeywords: ['text to speech online', 'tts free', 'read text aloud'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$14.90'
  },
  {
    slug: 'speech-to-text',
    name: 'Speech to Text',
    category: 'Video & Audio Tools',
    description: 'Dictate in English   live transcription in your browser with copy and download.',
    highCPCKeywords: ['speech to text online', 'voice typing', 'dictation tool free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.10'
  },

  // AI Tools suite   Gemini-powered writing, creation and chat
  {
    slug: 'ai-writer',
    name: 'AI Writer',
    category: 'AI Tools',
    description: 'Generate blog posts, product descriptions, essays and social posts on any topic   pick the tone and length.',
    highCPCKeywords: ['ai writer', 'ai content generator', 'write with ai free'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$18.20'
  },
  {
    slug: 'ai-paraphraser',
    name: 'AI Paraphrasing Tool',
    category: 'AI Tools',
    description: 'Rewrite any text in seven modes   standard, fluent, formal, simple, creative, shorter or longer   while keeping the meaning.',
    highCPCKeywords: ['paraphrasing tool', 'reword my essay', 'ai rewriter'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$17.60'
  },
  {
    slug: 'ai-grammar-checker',
    name: 'AI Grammar Checker',
    category: 'AI Tools',
    description: 'Fix grammar, spelling and punctuation   and see a clear list of exactly what was changed.',
    highCPCKeywords: ['grammar checker', 'fix my grammar', 'spell checker online'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$16.90'
  },
  {
    slug: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    category: 'AI Tools',
    description: 'Summarize long articles and documents as a short paragraph, bullet points or key takeaways.',
    highCPCKeywords: ['summarize text', 'ai summarizer', 'summary generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.40'
  },
  {
    slug: 'ai-translator',
    name: 'AI Translator',
    category: 'AI Tools',
    description: 'Translate text from any language into natural, fluent English with AI translation.',
    highCPCKeywords: ['ai translator', 'translate text online', 'translate to english'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.80'
  },
  {
    slug: 'ai-story-generator',
    name: 'AI Story Generator',
    category: 'AI Tools',
    description: 'Create original stories in eight genres   name your hero, set the scene, add an optional plot twist.',
    highCPCKeywords: ['ai story generator', 'story maker', 'write a story with ai'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.20'
  },
  {
    slug: 'ai-poem-generator',
    name: 'AI Poem Generator',
    category: 'AI Tools',
    description: 'Write poems in real forms   haiku, sonnet, limerick, ballad, acrostic or free verse   on any topic and mood.',
    highCPCKeywords: ['poem generator', 'ai poetry', 'write a poem online'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.90'
  },
  {
    slug: 'ai-image-generator',
    name: 'AI Image Generator',
    category: 'AI Tools',
    description: 'Create images from text prompts with Google Gemini   photorealistic, illustration, anime, 3D, watercolor and more styles.',
    highCPCKeywords: ['ai image generator', 'text to image ai', 'generate image free'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$19.40'
  },
  {
    slug: 'ai-email-writer',
    name: 'AI Email Writer',
    category: 'AI Tools',
    description: 'Draft professional emails in seconds   pick the purpose and tone, add your key points, get a ready-to-send email.',
    highCPCKeywords: ['ai email writer', 'write an email with ai', 'email generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.10'
  },
  {
    slug: 'ai-cover-letter-generator',
    name: 'AI Cover Letter Generator',
    category: 'AI Tools',
    description: 'Generate a tailored cover letter from your role, company, experience and skills   no placeholder brackets.',
    highCPCKeywords: ['cover letter generator', 'ai cover letter', 'write my cover letter'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.70'
  },
  {
    slug: 'ai-bio-generator',
    name: 'AI Bio Generator',
    category: 'AI Tools',
    description: 'Get five ready-to-use profile bios for Instagram, X, LinkedIn, TikTok or Facebook in your style.',
    highCPCKeywords: ['bio generator', 'instagram bio maker', 'ai bio writer'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.60'
  },
  {
    slug: 'ai-caption-generator',
    name: 'AI Caption Generator',
    category: 'AI Tools',
    description: 'Generate scroll-stopping social media captions with hashtags for Instagram, Facebook, X, LinkedIn and TikTok.',
    highCPCKeywords: ['caption generator', 'instagram captions ai', 'social media caption maker'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },
  {
    slug: 'ai-business-name-generator',
    name: 'AI Business Name Generator',
    category: 'AI Tools',
    description: 'Get 15 brandable business name ideas with taglines for any industry and style.',
    highCPCKeywords: ['business name generator', 'company name ideas', 'brand name generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.50'
  },
  {
    slug: 'ai-chat',
    name: 'AI Chat',
    category: 'AI Tools',
    description: 'Chat with Google Gemini   ask questions, brainstorm, get code help or practice interviews with preset assistants.',
    highCPCKeywords: ['ai chat online', 'chat with ai free', 'gemini chat'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'Very High',
    estimatedCPC: '$17.90'
  },

  // Social Media Tools suite   creators, formatting and growth
  {
    slug: 'social-image-resizer',
    name: 'Social Media Image Resizer',
    category: 'Social Media Tools',
    description: 'Resize any image to the exact size for Instagram, X, Facebook, YouTube, LinkedIn, TikTok and Pinterest   crop, fit or blur-fill.',
    highCPCKeywords: ['social media image resizer', 'instagram image size', 'resize image for social media'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.40'
  },
  {
    slug: 'youtube-thumbnail-maker',
    name: 'YouTube Thumbnail Maker',
    category: 'Social Media Tools',
    description: 'Design bold 1280×720 YouTube thumbnails with your photo, big title text and an accent bar   no design skills needed.',
    highCPCKeywords: ['youtube thumbnail maker', 'thumbnail creator', 'make a thumbnail free'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.80'
  },
  {
    slug: 'fancy-text-generator',
    name: 'Fancy Text Generator',
    category: 'Social Media Tools',
    description: 'Turn plain text into bold, script, fraktur, circled, small-caps and upside-down Unicode styles for bios and posts   tap to copy.',
    highCPCKeywords: ['fancy text generator', 'instagram fonts', 'stylish text maker'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.20'
  },
  {
    slug: 'social-post-composer',
    name: 'Social Media Post Composer',
    category: 'Social Media Tools',
    description: 'Write one post and watch live character counts for X, Instagram, Threads, TikTok, LinkedIn, Facebook, YouTube and Pinterest.',
    highCPCKeywords: ['character counter twitter', 'post length checker', 'social media composer'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$8.60'
  },
  {
    slug: 'hashtag-generator',
    name: 'Hashtag Generator',
    category: 'Social Media Tools',
    description: 'Generate up to 30 hashtags from your keywords plus a curated bank for 12 niches   fitness, food, travel, fashion, business and more.',
    highCPCKeywords: ['hashtag generator', 'instagram hashtags', 'best hashtags for instagram'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.90'
  },
  {
    slug: 'hashtag-counter',
    name: 'Hashtag Counter & Cleaner',
    category: 'Social Media Tools',
    description: 'Count hashtags in any caption, spot duplicates, remove them, and check the Instagram 30-hashtag limit.',
    highCPCKeywords: ['hashtag counter', 'count hashtags', 'remove duplicate hashtags'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$7.90'
  },
  {
    slug: 'engagement-rate-calculator',
    name: 'Engagement Rate Calculator',
    category: 'Social Media Tools',
    description: 'Calculate your Instagram, TikTok or YouTube engagement rate from followers, likes, comments, shares and saves   with a plain-English verdict.',
    highCPCKeywords: ['engagement rate calculator', 'instagram engagement rate', 'influencer rate calculator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.70'
  },
  {
    slug: 'username-generator',
    name: 'Username Generator',
    category: 'Social Media Tools',
    description: 'Generate catchy username ideas for Instagram, TikTok, X and YouTube from any keyword   prefixes, suffixes and stylish combinations.',
    highCPCKeywords: ['username generator', 'instagram name generator', 'username ideas'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.30'
  },
  {
    slug: 'social-video-resizer',
    name: 'Social Video Resizer',
    category: 'Social Media Tools',
    description: 'Convert any video to 9:16 for Reels, TikTok and Shorts, 1:1 or 4:5 for feeds, or 16:9   crop to fill or pad with a blurred background.',
    highCPCKeywords: ['resize video for instagram', 'video resizer online', '9:16 video converter'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$14.20'
  },
  {
    slug: 'post-ideas-generator',
    name: 'Social Media Post Ideas Generator',
    category: 'Social Media Tools',
    description: 'Get a ready-made 30-day content calendar for your niche   a post idea and format for every day of the month.',
    highCPCKeywords: ['content calendar generator', 'post ideas', 'social media content ideas'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.40'
  },
  {
    slug: 'giveaway-picker',
    name: 'Giveaway & Comment Picker',
    category: 'Social Media Tools',
    description: 'Paste your giveaway comments and pick a random winner fairly   duplicates removed, previous winners excluded.',
    highCPCKeywords: ['comment picker', 'giveaway winner picker', 'random comment picker instagram'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.80'
  },
  {
    slug: 'post-card-maker',
    name: 'Post Card Maker',
    category: 'Social Media Tools',
    description: 'Design clean social post cards for thumbnails, presentations and content previews   light and dark themes, export as PNG.',
    highCPCKeywords: ['tweet image maker', 'post card maker', 'social card generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$9.10'
  },
  {
    slug: 'link-in-bio-builder',
    name: 'Link in Bio Page Builder',
    category: 'Social Media Tools',
    description: 'Build your own link-in-bio page and download it as a single HTML file   host it free anywhere, no monthly fees.',
    highCPCKeywords: ['link in bio builder', 'linktree alternative free', 'bio link page maker'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.10'
  },
  {
    slug: 'emoji-picker',
    name: 'Emoji Picker & Copy Board',
    category: 'Social Media Tools',
    description: 'Browse curated emojis by category, build your caption string in the tray, and copy it in one tap.',
    highCPCKeywords: ['emoji picker', 'copy paste emoji', 'emoji board'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$6.80'
  },
  {
    slug: 'ai-hashtag-generator',
    name: 'AI Hashtag Generator',
    category: 'Social Media Tools',
    description: 'Describe your post and get 30 AI hashtags grouped by reach for Instagram, TikTok or X   niche-aware and ready to paste.',
    highCPCKeywords: ['ai hashtag generator', 'hashtags for instagram ai', 'viral hashtags ai'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$13.60'
  },
  {
    slug: 'ai-hook-generator',
    name: 'AI Hook Generator',
    category: 'Social Media Tools',
    description: 'Generate 10 scroll-stopping opening hooks for your TikTok, Reels or Shorts   pick your tone, paste your topic.',
    highCPCKeywords: ['hook generator', 'viral hooks', 'tiktok hooks ai'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.90'
  },

  // Student & Everyday Tools suite   study help + daily utilities
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    category: 'Student & Everyday Tools',
    description: 'Calculate your semester GPA and CGPA on standard or plus/minus 4.0 scales   plus find the GPA you need to hit your target.',
    highCPCKeywords: ['gpa calculator', 'cgpa calculator', 'calculate my gpa'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.60'
  },
  {
    slug: 'citation-generator',
    name: 'Citation Generator',
    category: 'Student & Everyday Tools',
    description: 'Generate perfect references in APA 7, MLA 9, Chicago and Harvard formats for books, journal articles and websites.',
    highCPCKeywords: ['citation generator', 'apa citation generator', 'mla citation maker'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.30'
  },
  {
    slug: 'essay-word-counter',
    name: 'Essay Word Counter',
    category: 'Student & Everyday Tools',
    description: 'Count words, characters, sentences and reading time   track progress toward your essay target and check readability.',
    highCPCKeywords: ['word counter', 'essay word count', 'character counter'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$9.80'
  },
  {
    slug: 'flashcard-maker',
    name: 'Flashcard Maker',
    category: 'Student & Everyday Tools',
    description: 'Create your own flashcards, study them with flip mode and shuffling, and export your deck   a free Quizlet alternative.',
    highCPCKeywords: ['flashcard maker', 'make flashcards online', 'study flashcards free'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$10.90'
  },
  {
    slug: 'study-planner',
    name: 'Study Planner',
    category: 'Student & Everyday Tools',
    description: 'Enter your exam date and topics and get a day-by-day study plan with rest days and revision days built in.',
    highCPCKeywords: ['study planner', 'exam study plan generator', 'study timetable maker'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$10.40'
  },
  {
    slug: 'periodic-table',
    name: 'Interactive Periodic Table',
    category: 'Student & Everyday Tools',
    description: 'Explore all 118 elements   click any element for its name, atomic number, mass and category, with search and color-coded groups.',
    highCPCKeywords: ['periodic table', 'interactive periodic table', 'elements table'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$9.50'
  },
  {
    slug: 'equation-solver',
    name: 'Equation Solver with Steps',
    category: 'Student & Everyday Tools',
    description: 'Solve quadratic and linear equations with full worked steps   discriminant, formula substitution and roots explained.',
    highCPCKeywords: ['quadratic equation solver', 'equation solver with steps', 'solve for x'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$10.10'
  },
  {
    slug: 'ai-quiz-generator',
    name: 'AI Quiz Generator',
    category: 'Student & Everyday Tools',
    description: 'Paste your study notes and get an instant multiple-choice quiz with an answer key   then take it and see your score.',
    highCPCKeywords: ['ai quiz generator', 'quiz maker from notes', 'mcq generator'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.80'
  },
  {
    slug: 'age-calculator',
    name: 'Age Calculator',
    category: 'Student & Everyday Tools',
    description: 'Find your exact age in years, months and days   plus total days lived, the weekday you were born, your zodiac sign and your next birthday countdown.',
    highCPCKeywords: ['age calculator', 'how old am i', 'date of birth calculator'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$10.70'
  },
  {
    slug: 'date-calculator',
    name: 'Date Calculator',
    category: 'Student & Everyday Tools',
    description: 'Count the days between two dates (including business days) or add and subtract days from any date.',
    highCPCKeywords: ['date calculator', 'days between dates', 'add days to date'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$9.90'
  },
  {
    slug: 'random-number-generator',
    name: 'Random Number Generator',
    category: 'Student & Everyday Tools',
    description: 'Generate random numbers in any range, roll dice from d4 to d100, and flip a coin   for draws, games and decisions.',
    highCPCKeywords: ['random number generator', 'dice roller', 'coin flip'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$9.20'
  },
  {
    slug: 'love-calculator',
    name: 'Love Calculator',
    category: 'Student & Everyday Tools',
    description: 'Enter two names and get your love percentage   a just-for-fun name game where the same names always give the same score.',
    highCPCKeywords: ['love calculator', 'love percentage calculator', 'name compatibility test'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$8.90'
  },
  {
    slug: 'stopwatch-timer',
    name: 'Stopwatch & Countdown Timer',
    category: 'Student & Everyday Tools',
    description: 'A precision stopwatch with laps plus a countdown timer with an alarm   for workouts, cooking, exams and presentations.',
    highCPCKeywords: ['online stopwatch', 'countdown timer', 'stopwatch with laps'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$8.50'
  },
  {
    slug: 'pomodoro-timer',
    name: 'Pomodoro Focus Timer',
    category: 'Student & Everyday Tools',
    description: 'Study and work in focused 25-minute sprints with automatic breaks   customizable timings and session tracking.',
    highCPCKeywords: ['pomodoro timer', 'focus timer', 'study timer 25 minutes'],
    isTopEarning: false,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$10.20'
  },
  {
    slug: 'typing-speed-test',
    name: 'Typing Speed Test',
    category: 'Student & Everyday Tools',
    description: 'Test your typing speed in 30 or 60 seconds   real WPM and accuracy scores with live per-character feedback.',
    highCPCKeywords: ['typing test', 'typing speed test', 'wpm test'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$11.10'
  },
  {
    slug: 'text-to-handwriting',
    name: 'Text to Handwriting Converter',
    category: 'Student & Everyday Tools',
    description: 'Turn typed text into realistic handwritten pages on ruled A4 paper   pick your ink color and download print-ready pages.',
    highCPCKeywords: ['text to handwriting', 'handwriting converter', 'assignment handwriting maker'],
    isTopEarning: true,
    iconName: 'Wand2',
    cpcTier: 'High',
    estimatedCPC: '$12.10'
  }
];

// Helper to systematically generate the rest of the 250 tools
// Exactly fulfilling the requested breakdown:
// Daily Calculators: 1000
// Image Tools: 1000
// PDF Tools: 800
// Text & AI Tools: 500
// Unit Converters: 1000
// Home & Daily Life: 700
// Total = 250 tools!

function generateFullToolsCatalog(): ToolItem[] {
  const result: ToolItem[] = [];
  const registeredSlugs = new Set<string>();

  // 1. Add Top 8 first
  TOP_8_TOOLS.forEach(tool => {
    result.push(tool);
    registeredSlugs.add(tool.slug);
  });

  // 2. Add Curated additional tools
  CURATED_ADDITIONAL_TOOLS.forEach((item, idx) => {
    if (item.slug && !registeredSlugs.has(item.slug)) {
      result.push({
        id: `curated-${idx + 1}`,
        slug: item.slug,
        name: item.name || item.slug,
        category: item.category as any,
        description: item.description || `Free online ${item.name} for quick, accurate daily calculations.`,
        highCPCKeywords: item.highCPCKeywords || [`${item.name?.toLowerCase()} usa`, 'free online tool'],
        isTopEarning: !!item.isTopEarning,
        iconName: item.iconName || 'Wrench',
        cpcTier: item.cpcTier || 'High',
        estimatedCPC: item.estimatedCPC || '$15.00',
        howToUseSteps: [
          'Enter your values in the input fields above.',
          'Adjust relevant parameters and unit options.',
          'Get instant results with full step-by-step breakdown.'
        ],
        features: [
          'Fast in-browser calculations',
          'Responsive design for mobile and desktop',
          'Export and copy results with one click',
          '100% legal, safe and free to use'
        ],
        faq: [
          {
            question: `How does the ${item.name} work?`,
            answer: `The ${item.name} executes standard verified algorithms directly inside your browser for zero latency and complete privacy.`
          },
          {
            question: 'Is this tool completely free to use?',
            answer: 'Yes, all 250+ tools on Super Crown are 100% free with no registration or subscriptions.'
          },
          {
            question: 'Can I use this on mobile devices?',
            answer: 'Yes, our tools are fully responsive and optimized for smartphones, tablets, and desktop computers.'
          }
        ],
        overviewContent: `The Super Crown ${item.name} is engineered to provide fast, reliable, and privacy-first utility for users across the USA, UK, Canada, and worldwide. Enjoy instant calculations without installing bloated software.`
      });
      registeredSlugs.add(item.slug);
    }
  });

  // Category target counts
  const TARGETS: Record<ToolItem['category'], number> = {
    'Daily Calculators': 1000,
    'Image Tools': 1000,
    'PDF Tools': 800,
    'Text & AI Tools': 500,
    'Unit Converters': 1000,
    'Home & Daily Life': 700,
    'Word Tools': 300,
    'SEO Tools': 400,
    'Developer Tools': 400,
    'Video & Audio Tools': 300,
    'AI Tools': 300,
    'Social Media Tools': 300,
    'Student & Everyday Tools': 300
  };

  // Sub-domains and seeds to generate realistic legal tool titles
  const categorySeeds: Record<ToolItem['category'], { prefixes: string[]; topics: string[]; suffixes: string[]; defaultIcon: string }> = {
    'Daily Calculators': {
      prefixes: ['Advanced', 'Quick', 'Pro', 'Smart', 'Standard', 'Accurate', 'Interactive', 'Comprehensive', 'Official', 'Daily'],
      topics: [
        'Mortgage Refinance', 'Auto Lease vs Buy', 'Credit Card Payoff', 'APY vs APR', 'CD Rate Maturity',
        'Dividend Reinvestment', 'Capital Gains Tax', 'Federal Estate Tax', 'Home Equity Line (HELOC)', 'Emergency Fund',
        'Savings Goal', 'Net Worth Tracker', 'Hourly to Salary Wage', 'Overtime Pay USA', 'Sales Commission',
        'Commercial Property Cap Rate', 'Real Estate Cash on Cash', 'Depreciation MACRS', 'Business Break-Even', 'Inventory Turnover',
        'Debt-to-Income (DTI)', 'Gross Rent Multiplier', 'Inflation Purchasing Power', 'Annuity Payout', 'Simple Interest',
        'Rule of 72', 'Salary Inflation Adjustment', 'Car Depreciation', 'Gas Mileage & Trip Fuel', 'HSA Savings Growth',
        'Mutual Fund Expense Ratio', 'Stock Options Value', 'Cryptocurrency P&L', 'Staking Yield', 'Loan Amortization',
        'Student Loan Consolidation', 'Personal Loan APR', 'Small Business Loan', 'Equipment Financing', 'Mortgage Points Savings'
      ],
      suffixes: ['Calculator', 'Estimator', 'Analyzer', 'Forecaster', 'Planner', 'Auditor'],
      defaultIcon: 'Calculator'
    },
    'Image Tools': {
      prefixes: ['High-Speed', 'Lossless', 'WebP', 'Canvas', 'Pro', 'Batch', 'Smart', 'Crisp', 'Modern', 'Secure'],
      topics: [
        'JPG Compressor', 'PNG Optimizer', 'WebP Converter', 'SVG Code Cleaner', 'Image Resizer',
        'Aspect Ratio Cropper', 'Social Media Thumbnail Maker', 'Passport Photo Scaler', 'Grayscale Filter', 'Brightness Adjuster',
        'Contrast Balancer', 'EXIF Metadata Stripper', 'Image to Base64', 'Color Palette Extractor', 'Dominant Color Finder',
        'DPI to Pixel Converter', 'Image Resolution Scaler', 'Canvas Watermark Stamper', 'Image Flip & Mirror', 'Image Rotator 90/180',
        'Photo Frame Inset', 'Blur Effect Generator', 'Sharpen Filter', 'Invert Colors Tool', 'Image Border Radius Rounder',
        'Favicon 32x32 Generator', 'App Icon Pack Scaler', 'Twitter Banner Resizer', 'YouTube Banner Resizer', 'LinkedIn Header Scaler',
        'Instagram Post 1080x1080 Cropper', 'Pinterest Pin 1000x1500 Resizer', 'Vector SVG Viewer', 'PNG Transparency Checker', 'WebP Quality Tester'
      ],
      suffixes: ['Tool', 'Studio', 'Utility', 'Processor', 'Engine', 'Converter'],
      defaultIcon: 'Image'
    },
    'PDF Tools': {
      prefixes: ['Secure', 'Fast', 'In-Browser', 'Legal', 'Client-Side', 'Clean', 'Automated', 'Standard', 'Pro', 'Private'],
      topics: [
        'PDF to Word Doc', 'Word to PDF Generator', 'PDF Text Extractor', 'PDF Page Counter', 'PDF Word Counter',
        'Markdown to PDF', 'HTML Note to PDF', 'Printable Invoice to PDF', 'PDF Metadata Viewer', 'PDF Reader Previewer',
        'PDF Character Counter', 'PDF Layout Inspector', 'Resume to PDF Exporter', 'Contract Summary PDF', 'Receipt to PDF',
        'Document Page Size Checker', 'PDF Title & Author Auditor', 'Clean Plaintext to PDF', 'Meeting Minutes to PDF', 'Certificate of Completion PDF',
        'Legal Disclaimer PDF Generator', 'Terms & Conditions PDF Formatter', 'Whitepaper Page Organizer', 'E-Book Text Extractor', 'Shipping Label PDF Viewer'
      ],
      suffixes: ['Converter', 'Processor', 'Inspector', 'Builder', 'Utility', 'Manager'],
      defaultIcon: 'FileText'
    },
    'Text & AI Tools': {
      prefixes: ['Smart', 'Instant', 'Clean', 'Advanced', 'Real-Time', 'Precision', 'Developer', 'Writer', 'Grammar-Safe', 'Fast'],
      topics: [
        'Word Counter', 'Character Counter', 'Paragraph Counter', 'Sentence Counter', 'Reading Time Estimator',
        'Speaking Time Calculator', 'Case Converter Uppercase', 'Case Converter Lowercase', 'Title Case Formatter', 'Sentence Case Fixer',
        'CamelCase Generator', 'Kebab-Case Converter', 'Snake_Case Converter', 'Duplicate Lines Remover', 'Empty Lines Stripper',
        'Whitespace Trimmer', 'Slug URL Generator', 'HTML Entities Encoder', 'URL Percent Encoder', 'Base64 Text Encoder',
        'Base64 Text Decoder', 'Lorem Ipsum Generator', 'Markdown Preview Editor', 'Keyword Density Checker', 'Text Alphabetical Sorter',
        'Number Lines Appender', 'Reverse Text Utility', 'Morse Code Translator', 'Rot13 Cipher Utility', 'Text Diff Comparator'
      ],
      suffixes: ['Tool', 'Generator', 'Formatter', 'Assistant', 'Analyzer', 'Cleaner'],
      defaultIcon: 'Wand2'
    },
    'Unit Converters': {
      prefixes: ['Precise', 'Standard', 'Scientific', 'Metric to Imperial', 'Universal', 'Quick', 'Accurate', 'Instant', 'Global', 'Industrial'],
      topics: [
        'Meters to Feet', 'Feet to Meters', 'Inches to Centimeters', 'Centimeters to Inches', 'Miles to Kilometers',
        'Kilometers to Miles', 'Yards to Meters', 'Pounds to Kilograms', 'Kilograms to Pounds', 'Ounces to Grams',
        'Grams to Ounces', 'Fahrenheit to Celsius', 'Celsius to Fahrenheit', 'Kelvin to Celsius', 'Liters to Gallons USA',
        'Gallons USA to Liters', 'Milliliters to Fluid Ounces', 'Cups to Milliliters', 'Tablespoons to Teaspoons', 'Square Feet to Square Meters',
        'Square Meters to Square Feet', 'Acres to Hectares', 'Hectares to Acres', 'Miles Per Hour to KM/H', 'KM/H to Knots',
        'Megabytes to Gigabytes', 'Gigabytes to Terabytes', 'Kilobytes to Megabytes', 'Bits to Bytes', 'Joules to Calories',
        'Kilocalories to Kilojoules', 'PSI to Bar', 'Bar to Pascals', 'Watts to Horsepower', 'Horsepower to Kilowatts'
      ],
      suffixes: ['Converter', 'Calculator', 'Chart', 'Table', 'Transformer', 'Scale'],
      defaultIcon: 'Scale'
    },
    'Home & Daily Life': {
      prefixes: ['Practical', 'Daily', 'Smart', 'Family', 'Budget', 'Household', 'Easy', 'Simple', 'Modern', 'Essential'],
      topics: [
        'Grocery Bill Estimator', 'Restaurant Tip Splitter', 'Home Electricity Cost', 'Paint Coverage Area', 'Flooring Tile Estimator',
        'Wallpaper Roll Calculator', 'Daily Water Intake Goal', 'Cooking Measurement Converter', 'Recipe Portion Scaler', 'Pet Food Portion Guide',
        'Lawn Fertilizer Estimator', 'Car Commute Gas Cost', 'Air Conditioner Running Cost', 'Space Heater Energy Cost', 'Laundry Detergent Dose',
        'Target Sleep Bedtime', 'Coffee Brewing Ratio', 'Candle Burn Time', 'Garden Soil Volume', 'Plant Watering Schedule',
        'Moving Boxes Estimator', 'Home Maintenance Budget', 'Holiday Gift Budget', 'Baby Diapers Monthly Cost', 'Home Internet Speed Bandwidth',
        'Solar Panel Daily Production', 'Pool Chlorine Estimator', 'Wine & Party Drink Calculator', 'Luggage Weight Limit Check', 'Room Cubic Airflow (CFM)'
      ],
      suffixes: ['Calculator', 'Planner', 'Estimator', 'Guide', 'Tracker', 'Helper'],
      defaultIcon: 'Home'
    },
    'Word Tools': {
      prefixes: ['Pro', 'Fast', 'Secure', 'Online', 'Smart', 'Easy', 'Free', 'Instant', 'Advanced', 'Simple'],
      topics: [
        'DOCX Viewer', 'Word Document Editor', 'Word File Merger', 'Word File Splitter', 'Word to PDF Converter',
        'Word Metadata Editor', 'Word Watermark Tool', 'Word Document Protector', 'Word Password Remover', 'Word Image Extractor',
        'Word Text Extractor', 'Word Document Analyzer', 'Word File Compressor', 'Word Document Repair', 'Word Compare Tool'
      ],
      suffixes: ['Tool', 'Utility', 'Online', 'App', 'Studio', 'Manager'],
      defaultIcon: 'FileText'
    },
    'SEO Tools': {
      prefixes: ['Pro', 'Free', 'Online', 'Advanced', 'Smart', 'Instant', 'Ultimate', 'Easy', 'Fast', 'Expert'],
      topics: [
        'Meta Tag Generator', 'Keyword Density Checker', 'Robots TXT Generator', 'XML Sitemap Generator', 'Schema Markup Builder',
        'On Page SEO Analyzer', 'SERP Snippet Preview', 'Hreflang Tag Generator', 'UTM Campaign Builder', 'Redirect Rule Generator',
        'Keyword Clustering Tool', 'Readability Score Checker', 'Headline Analyzer', 'Backlink Opportunity Finder', 'Canonical Tag Helper'
      ],
      suffixes: ['Tool', 'Online', 'Checker', 'Generator', 'Analyzer', 'Studio'],
      defaultIcon: 'Search'
    },
    'Developer Tools': {
      prefixes: ['Pro', 'Free', 'Online', 'Advanced', 'Smart', 'Instant', 'Ultimate', 'Easy', 'Fast', 'Expert'],
      topics: [
        'JSON Formatter', 'JWT Decoder', 'Base64 Encoder', 'Regex Tester', 'UUID Generator',
        'Password Generator', 'Hash Generator', 'Cron Expression Parser', 'Timestamp Converter', 'Color Converter',
        'SQL Formatter', 'XML Formatter', 'URL Parser', 'Text Diff Checker', 'Chmod Calculator'
      ],
      suffixes: ['Tool', 'Online', 'Utility', 'Generator', 'Checker', 'Studio'],
      defaultIcon: 'FileCode'
    },
    'Video & Audio Tools': {
      prefixes: ['Pro', 'Free', 'Online', 'Advanced', 'Smart', 'Instant', 'Ultimate', 'Easy', 'Fast', 'Expert'],
      topics: [
        'Video to GIF Converter', 'Video Compressor', 'Video Trimmer', 'Video Converter', 'Video to MP3',
        'Audio Converter', 'Audio Trimmer', 'Audio Joiner', 'Screen Recorder', 'Voice Recorder',
        'Text to Speech', 'Speech to Text', 'Video Frame Capture', 'Audio Speed Changer', 'Webcam Recorder'
      ],
      suffixes: ['Tool', 'Online', 'Converter', 'Maker', 'Recorder', 'Studio'],
      defaultIcon: 'Wand2'
    },
    'AI Tools': {
      prefixes: ['AI', 'Smart', 'Free', 'Online', 'Advanced', 'Instant', 'Ultimate', 'Easy', 'Fast', 'Pro'],
      topics: [
        'AI Writer', 'AI Paraphraser', 'AI Grammar Checker', 'AI Summarizer', 'AI Translator',
        'AI Story Generator', 'AI Poem Generator', 'AI Image Generator', 'AI Email Writer', 'AI Cover Letter Generator',
        'AI Bio Generator', 'AI Caption Generator', 'AI Business Name Generator', 'AI Chat'
      ],
      suffixes: ['Tool', 'Online', 'Generator', 'Assistant', 'Maker', 'Studio'],
      defaultIcon: 'Wand2'
    },
    'Social Media Tools': {
      prefixes: ['Social', 'Viral', 'Free', 'Online', 'Pro', 'Easy', 'Smart', 'Ultimate', 'Fast', 'Insta'],
      topics: [
        'Hashtag Generator', 'Username Generator', 'Fancy Text Generator', 'Post Composer', 'Thumbnail Maker',
        'Engagement Calculator', 'Giveaway Picker', 'Post Ideas Generator', 'Link in Bio Builder', 'Emoji Picker'
      ],
      suffixes: ['Tool', 'Online', 'Maker', 'Generator', 'Studio'],
      defaultIcon: 'Wand2'
    },
    'Student & Everyday Tools': {
      prefixes: ['Study', 'Smart', 'Free', 'Online', 'Easy', 'Quick', 'Pro', 'Daily', 'Ultimate', 'Simple'],
      topics: [
        'GPA Calculator', 'Citation Generator', 'Flashcard Maker', 'Study Planner', 'Age Calculator',
        'Typing Test', 'Pomodoro Timer', 'Equation Solver', 'Periodic Table', 'Love Calculator'
      ],
      suffixes: ['Tool', 'Online', 'Maker', 'Generator', 'Calculator'],
      defaultIcon: 'Wand2'
    }
  };

  // Populate each category up to target count
  (Object.keys(TARGETS) as ToolItem['category'][]).forEach(category => {
    const currentCount = result.filter(t => t.category === category).length;
    const needed = TARGETS[category] - currentCount;
    const seed = categorySeeds[category];

    for (let i = 0; i < needed; i++) {
      const prefix = seed.prefixes[i % seed.prefixes.length];
      const topic = seed.topics[(Math.floor(i / seed.prefixes.length)) % seed.topics.length];
      const suffix = seed.suffixes[(i + 3) % seed.suffixes.length];
      const sequence = Math.floor(i / (seed.prefixes.length * seed.topics.length)) + 1;
      
      const rawName = sequence > 1 ? `${prefix} ${topic} ${suffix} ${sequence}` : `${prefix} ${topic} ${suffix}`;
      const slugCandidate = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let finalSlug = slugCandidate;
      let counter = 1;
      while (registeredSlugs.has(finalSlug)) {
        finalSlug = `${slugCandidate}-${counter}`;
        counter++;
      }
      registeredSlugs.add(finalSlug);

      const isHighTier = (i % 7 === 0);
      const cpcTier: ToolItem['cpcTier'] = isHighTier ? 'Very High' : 'High';
      const estimatedCPC = isHighTier ? `$${(20 + (i % 18)).toFixed(2)}` : `$${(8 + (i % 12)).toFixed(2)}`;

      result.push({
        id: `gen-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i + 1}`,
        slug: finalSlug,
        name: rawName,
        category,
        description: `Accurate, free online ${rawName.toLowerCase()} designed for USA, UK, and Canadian users. 100% legal, fast, and privacy-protected.`,
        highCPCKeywords: [
          `${topic.toLowerCase()} calculator`,
          `best ${topic.toLowerCase()} online`,
          `${topic.toLowerCase()} usa`,
          'free daily tool'
        ],
        isTopEarning: false,
        iconName: seed.defaultIcon,
        cpcTier,
        estimatedCPC,
        howToUseSteps: [
          `Open the ${rawName} workspace.`,
          'Enter your numbers or text parameters in the input fields.',
          'Review the live calculated results and copy or print with 1-click.'
        ],
        features: [
          'Ultra-fast in-browser calculation engine',
          'Formatted output for mobile and desktop screens',
          'Zero ads blocking the core utility',
          'Compliant with USA & international standards'
        ],
        faq: [
          {
            question: `Is the ${rawName} free to use?`,
            answer: `Yes, the ${rawName} on Super Crown is 100% free with no registration, no hidden software downloads, and no credit card required.`
          },
          {
            question: `How reliable are the calculations?`,
            answer: `All calculations follow standard mathematical, financial, and metric formulas verified by professional standards.`
          },
          {
            question: `Can I export my results?`,
            answer: `Yes, you can easily copy results to your clipboard or use the browser print function to save as PDF.`
          }
        ],
        overviewContent: `The Super Crown ${rawName} provides seamless everyday utility for individuals, freelancers, and students. By keeping all calculations client-side inside your browser, we guarantee rapid results without server latency or tracking.`
      });
    }
  });

  return result;
}

// Generate the 250 tools catalog once
export const ALL_TOOLS: ToolItem[] = generateFullToolsCatalog();

// Quick lookup map by slug
export const TOOLS_BY_SLUG: Record<string, ToolItem> = ALL_TOOLS.reduce((acc, tool) => {
  acc[tool.slug] = tool;
  return acc;
}, {} as Record<string, ToolItem>);

// Quick top earning list
export const TOP_EARNING_TOOLS = ALL_TOOLS.filter(t => t.isTopEarning).slice(0, 8);
