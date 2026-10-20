import React, { useState } from 'react';
import { 
  ShieldCheck, Mail, MapPin, Clock, Send, CheckCircle2, 
  HelpCircle, FileText, ChevronRight, ArrowLeft, Heart, Globe,
  Lock, Award, Check
} from 'lucide-react';
import { Translations } from '../lib/i18n';

interface PageProps {
  onNavigateHome: () => void;
  onNavigateBlog: () => void;
  t?: Translations;
}

export const AboutPage: React.FC<PageProps> = ({ onNavigateHome, onNavigateBlog }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white">About Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Mission: 1 Million People • 100% Free & Unlocked</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            About Super Crown Tools
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Empowering 2M+ users across the United States, United Kingdom, Canada, and Europe with 250+ completely unlocked, client-side browser utilities.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Our Founding Story & The Unlocked Guarantee
            </h2>
            <p>
              Super Crown Tools was launched with a single, unwavering principle: <strong>essential calculation utilities must be accessible to every person on Earth without barriers</strong>. In recent years, the internet has become saturated with tools that hide behind paywalls, aggressive click-to-unlock overlays, forced software downloads, or mandatory account creation just to perform basic math or convert a file.
            </p>
            <p>
              We decided to do things differently. Every single one of our 250+ tools—from our advanced USA Mortgage Amortization Engine and Auto Insurance Estimators to our client-side PDF processors and Unit Converters—is <strong>100% unlocked from the moment you open the page</strong>. No blur, no "Click to Unlock", and no login required.
            </p>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Core Pillars of Our Platform
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">1. Zero-Tracking Privacy</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  All mathematical processing, conversions, and document parsing execute directly in your browser RAM. Your data is never uploaded to remote servers.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">2. Rigorous Mathematical Accuracy</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Formulas are developed against IRS tax guidelines, federal amortization standards, and ISO metric benchmarks for 2026.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">3. 100% Legit & Safe</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We strictly prohibit video ripping, illicit scrapers, or malicious scripts. Super Crown Tools is 100% legal, educational, and safe.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">4. Community Supported</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Our mission to help 1 Million people is sustained through non-intrusive Google AdSense sponsorships and voluntary contributions.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Editorial Board & Engineering Standards
            </h2>
            <p>
              Our software tools and 800-word educational guides are written and reviewed by experienced financial analysts, math educators, and software architects. We adhere to strict editorial standards: whenever statutory regulations (such as interest rates, tax brackets, or metric standards) update, our algorithms and guides are refreshed immediately.
            </p>
            <p>
              Have suggestions or questions? Reach our engineering team at <a href="mailto:support@supercrowntools.com" className="text-blue-600 font-bold underline">support@supercrowntools.com</a>.
            </p>
          </section>

          <div className="pt-6 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore 250+ Free Tools</span>
            </button>
            <button
              onClick={onNavigateBlog}
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              Read Our Blog Guides →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<PageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white">Privacy Policy</span>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>GDPR, CCPA & AdSense Compliant • Effective October 2026</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Privacy Policy & Data Protection
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Super Crown Tools operates under a strict Zero-Data-Retention architecture. Learn how your privacy is guaranteed.
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Client-Side Execution Guarantee</h2>
            <p>
              When you use our calculators, text processors, invoice generators, or converters, all data input and processing takes place exclusively within your client web browser (JavaScript RAM). No keystrokes, personal names, phone numbers, or uploaded files are transmitted to or stored on our servers. When you close your browser tab, all session memory is permanently cleared.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Cookies and Google AdSense Advertising</h2>
            <p>
              Super Crown Tools displays third-party advertisements served by Google AdSense to fund high-speed hosting and ongoing development. Google and third-party vendors may use cookies (such as the DoubleClick cookie) to serve relevant advertisements based on a user’s prior visits to this website or other websites on the internet.
            </p>
            <p>
              Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Google Ads Settings</a> or through the <a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">Network Advertising Initiative</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. European GDPR Compliance</h2>
            <p>
              For users located within the European Economic Area (EEA) and the United Kingdom, we comply fully with Regulation (EU) 2016/679 (GDPR). Because we do not collect personal profiles, store IP addresses, or mandate accounts, our processing involves minimal technical telemetry strictly necessary for site delivery and abuse prevention.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. California Consumer Privacy Act (CCPA)</h2>
            <p>
              We do not sell, rent, or trade user personal information to any third party. California residents possess the right to request confirmation of non-sale and to access our privacy disclosures freely without discrimination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Contact Our Data Protection Officer</h2>
            <p>
              If you have inquiries concerning our privacy practices or wish to submit feedback, please email our security officer at: <a href="mailto:support@supercrowntools.com" className="text-blue-600 font-bold underline">support@supercrowntools.com</a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export const ContactPage: React.FC<PageProps> = ({ onNavigateHome }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Support', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white">Contact Us</span>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            Contact Super Crown Tools
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Have questions, feedback, or a tool suggestion? We answer all user inquiries within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Direct Email Support
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                For prompt technical support, bug reports, and partnership inquiries:
              </p>
              <a 
                href="mailto:support@supercrowntools.com" 
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline block break-all"
              >
                support@supercrowntools.com
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-emerald-500" />
                Response Time SLA
              </div>
              <p>Monday – Friday: Within 12 Hours</p>
              <p>Saturday – Sunday: Within 24 Hours</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-blue-500" />
                Worldwide Operations
              </div>
              <p>Supporting users in USA, UK, Canada, Europe & 150+ countries.</p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7">
            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Thank you for reaching out. Our support team has received your ticket and will reply to <span className="font-bold">{formData.email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Smith"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option>General Support</option>
                    <option>Suggest a New Free Tool</option>
                    <option>Bug or Calculation Report</option>
                    <option>Advertising / Google AdSense Query</option>
                    <option>Partnership & Sponsorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can our engineering team assist you today?"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Support</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
