import React, { useState } from 'react';
import { 
  BookOpen, Clock, Calendar, User, ArrowRight, ArrowLeft, 
  Search, Tag, Sparkles, CheckCircle2, Share2, Bookmark,
  ChevronRight, HelpCircle
} from 'lucide-react';
import { BlogPost, getBlogPostForTool, ALL_BLOG_POSTS } from '../lib/blog-data';
import { TOOLS_BY_SLUG, ToolItem, ALL_TOOLS } from '../lib/tools-data';
import { FAQSection } from './FAQSection';

interface BlogIndexProps {
  onSelectPost: (slug: string) => void;
  onNavigateHome: () => void;
  onSelectTool: (slug: string) => void;
}

export const BlogIndex: React.FC<BlogIndexProps> = ({
  onSelectPost,
  onNavigateHome,
  onSelectTool
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Daily Calculators', 'Image Tools', 'PDF Tools', 'Text & AI Tools', 'Unit Converters', 'Home & Daily Life'];

  const filteredPosts = ALL_BLOG_POSTS.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-slate-900 dark:text-white">Blog & In-Depth Guides</span>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Super Crown Knowledge Base • 800+ Words Educational Guides</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Complete Guides & Tutorials for 5000+ Tools
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Master essential daily calculators, conversion algorithms, productivity hacks, and financial benchmarks with research-backed educational tutorials.
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides... e.g. Mortgage, BMI, Insurance, Loan"
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* AdSense Placement: Above Post Grid */}
        <div className="mb-8 p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Advertisement • Google AdSense Responsive Unit
          </span>
          <div className="h-16 flex items-center justify-center text-xs text-slate-400">
            (AdSense In-Feed / Banner Placeholder)
          </div>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/70 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {post.category}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                  <button onClick={() => onSelectPost(post.slug)} className="text-left cursor-pointer">
                    {post.title}
                  </button>
                </h2>

                <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {post.metaDescription}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{post.author.avatar}</span>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {post.author.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {post.publishedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectTool(post.toolSlug)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    title="Open the unlocked tool directly"
                  >
                    Open Tool
                  </button>
                  <button
                    onClick={() => onSelectPost(post.slug)}
                    className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                    title="Read complete 800-word guide"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
};

interface BlogPostDetailProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateBlog: () => void;
  onSelectTool: (slug: string) => void;
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({
  slug,
  onNavigateHome,
  onNavigateBlog,
  onSelectTool
}) => {
  const tool: ToolItem = TOOLS_BY_SLUG[slug] || ALL_TOOLS[0];
  const post: BlogPost = getBlogPostForTool(tool);

  return (
    <article className="min-h-screen bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={onNavigateBlog} className="hover:text-blue-600 transition-colors cursor-pointer">
            Blog
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            {post.publishedDate}
          </span>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl sm:text-4xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Author Bio Bar */}
        <div className="mt-4 pb-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-xs">
              {post.author.avatar}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {post.author.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {post.author.role} • Verified Editorial Standards
              </p>
            </div>
          </div>

          {/* Quick CTA to open unlocked tool */}
          <button
            onClick={() => onSelectTool(post.toolSlug)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>👉 Open {tool.name} (Unlocked)</span>
          </button>
        </div>

        {/* AdSense Placement: 1 in header area */}
        <div className="my-6 p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            AdSense Top Leaderboard Unit
          </span>
          <div className="h-14 flex items-center justify-center text-xs text-slate-400">
            (Header Ad Placeholder • 728x90 / Responsive Display)
          </div>
        </div>

        {/* Table of Contents */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 uppercase tracking-wide text-xs">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Table of Contents
          </h2>
          <ul className="space-y-1.5 text-xs sm:text-sm">
            {post.tableOfContents.map((item, idx) => (
              <li key={idx} className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Article Body */}
        <div className="prose dark:prose-invert max-w-none space-y-6 text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
            {post.introParagraph}
          </p>

          {post.sections.map((section, idx) => (
            <section key={idx} className="space-y-3 pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                {section.heading}
              </h2>
              {section.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {para}
                </p>
              ))}

              {section.formula && (
                <div className="p-3.5 rounded-xl bg-slate-900 text-amber-300 font-mono text-xs sm:text-sm border border-slate-700 shadow-inner">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans mb-1">Mathematical Formula:</div>
                  <code>{section.formula}</code>
                </div>
              )}

              {section.tips && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Pro Insights & Best Practices:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
                    {section.tips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}

          {/* Conclusion */}
          <section className="pt-4 pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-3">
              Final Summary & Verdict
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {post.conclusion}
            </p>
          </section>
        </div>

        {/* AdSense Placement: Below Tool / Article Content */}
        <div className="my-8 p-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            AdSense Content Banner
          </span>
          <div className="h-20 flex items-center justify-center text-xs text-slate-400">
            (In-Article Ad Placeholder • 336x280 Large Rectangle)
          </div>
        </div>

        {/* FAQ Section with Google FAQ Schema */}
        <FAQSection toolName={tool.name} faqs={post.faqs} />

        {/* Bottom Navigation */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={onNavigateBlog}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Guides</span>
          </button>

          <button
            onClick={() => onSelectTool(post.toolSlug)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <span>Launch {tool.name} (100% Unlocked)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </article>
  );
};
