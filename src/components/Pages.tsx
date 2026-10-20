import React, { useState } from 'react';
import {
  ShieldCheck, Mail, MapPin, Clock, Send, CheckCircle2,
  HelpCircle, FileText, ChevronRight, ArrowLeft, Heart, Globe,
  Lock, Award, Check
} from 'lucide-react';
import { Translations } from '../lib/i18n';
import { useStrings } from '../lib/LangContext';
import { PAGES_STRINGS } from '../lib/strings/pages';

interface PageProps {
  onNavigateHome: () => void;
  onNavigateBlog: () => void;
  t?: Translations;
}

export const AboutPage: React.FC<PageProps> = ({ onNavigateHome, onNavigateBlog }) => {
  const s = useStrings(PAGES_STRINGS);
  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            {s('crumbHome')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="font-bold text-slate-900 dark:text-white">{s('aboutCrumb')}</span>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>{s('aboutBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {s('aboutTitle')}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {s('aboutSubtitle')}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {s('aboutStoryHeading')}
            </h2>
            <p>
              {s('aboutStoryP1a')}<strong>{s('aboutStoryP1b')}</strong>{s('aboutStoryP1c')}
            </p>
            <p>
              {s('aboutStoryP2a')}<strong>{s('aboutStoryP2b')}</strong>{s('aboutStoryP2c')}
            </p>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {s('pillarsHeading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s('pillar1Title')}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s('pillar1Text')}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s('pillar2Title')}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s('pillar2Text')}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s('pillar3Title')}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s('pillar3Text')}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s('pillar4Title')}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {s('pillar4Text')}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {s('editorialHeading')}
            </h2>
            <p>
              {s('editorialP1')}
            </p>
            <p>
              {s('editorialP2a')}<a href="mailto:support@supercrowntools.com" className="text-blue-600 font-bold underline">support@supercrowntools.com</a>.
            </p>
          </section>

          <div className="pt-6 flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{s('exploreToolsBtn')}</span>
            </button>
            <button
              onClick={onNavigateBlog}
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white transition-all cursor-pointer"
            >
              {s('readBlogBtn')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<PageProps> = ({ onNavigateHome }) => {
  const s = useStrings(PAGES_STRINGS);
  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            {s('crumbHome')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="font-bold text-slate-900 dark:text-white">{s('privacyCrumb')}</span>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>{s('privacyBadge')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {s('privacyTitle')}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {s('privacySubtitle')}
          </p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s('privS1Heading')}</h2>
            <p>
              {s('privS1Text')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s('privS2Heading')}</h2>
            <p>
              {s('privS2P1')}
            </p>
            <p>
              {s('privS2P2a')}<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">{s('privS2Link1')}</a>{s('privS2P2b')}<a href="https://aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">{s('privS2Link2')}</a>{s('privS2P2c')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s('privS3Heading')}</h2>
            <p>
              {s('privS3Text')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s('privS4Heading')}</h2>
            <p>
              {s('privS4Text')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{s('privS5Heading')}</h2>
            <p>
              {s('privS5TextA')}<a href="mailto:support@supercrowntools.com" className="text-blue-600 font-bold underline">support@supercrowntools.com</a>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export const ContactPage: React.FC<PageProps> = ({ onNavigateHome }) => {
  const s = useStrings(PAGES_STRINGS);
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
            {s('crumbHome')}
          </button>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="font-bold text-slate-900 dark:text-white">{s('contactCrumb')}</span>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight">
            {s('contactTitle')}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {s('contactSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                {s('emailCardHeading')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {s('emailCardText')}
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
                {s('slaHeading')}
              </div>
              <p>{s('slaWeekday')}</p>
              <p>{s('slaWeekend')}</p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-blue-500" />
                {s('worldwideHeading')}
              </div>
              <p>{s('worldwideText')}</p>
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
                  {s('successHeading')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {s('successTextA')}<span className="font-bold">{formData.email}</span>{s('successTextB')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100"
                >
                  {s('sendAnotherBtn')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {s('formNameLabel')}
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
                    {s('formEmailLabel')}
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
                    {s('formTopicLabel')}
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="General Support">{s('topicGeneral')}</option>
                    <option value="Suggest a New Free Tool">{s('topicSuggest')}</option>
                    <option value="Bug or Calculation Report">{s('topicBug')}</option>
                    <option value="Advertising / Google AdSense Query">{s('topicAds')}</option>
                    <option value="Partnership & Sponsorship">{s('topicPartner')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {s('formMessageLabel')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={s('formMessagePlaceholder')}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{s('sendBtn')}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
