import { ToolItem, ALL_TOOLS, TOOLS_BY_SLUG } from './tools-data';
import type { SupportedLanguage } from './i18n';
import { lookup } from './LangContext';
import { BLOG_STRINGS } from './strings/blog';
import { localizedTool } from './tools-fr';

export interface BlogPost {
  slug: string;
  toolSlug: string;
  title: string;
  metaDescription: string;
  category: string;
  readTime: string;
  publishedDate: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  introParagraph: string;
  tableOfContents: string[];
  sections: {
    heading: string;
    paragraphs: string[];
    tips?: string[];
    formula?: string;
  }[];
  conclusion: string;
  faqs: { question: string; answer: string }[];
  tags: string[];
}

// Generate rich, authoritative 800+ words blog articles for tools.
// All structural text comes from BLOG_STRINGS templates ({name} = localized
// tool name), so passing a lang localizes the entire generated guide.
export function getBlogPostForTool(tool: ToolItem, lang: SupportedLanguage = 'en'): BlogPost {
  const name = localizedTool(tool, lang).name;
  const fill = (key: string): string => lookup(BLOG_STRINGS, lang, key).replaceAll('{name}', name);
  const raw = (key: string): string => lookup(BLOG_STRINGS, lang, key);

  const publishedDate = fill('genPublished');
  const author = {
    name: raw('genAuthorName'),
    role: fill('genAuthorRole'),
    avatar: '👨‍💼'
  };

  const title = fill('genTitle');
  const metaDescription = fill('genMeta');

  return {
    slug: tool.slug,
    toolSlug: tool.slug,
    title,
    metaDescription,
    category: tool.category,
    readTime: fill('genReadTime'),
    publishedDate,
    author,
    introParagraph: fill('genIntro'),
    tableOfContents: [
      fill('genToc1'),
      raw('genToc2'),
      raw('genToc3'),
      raw('genToc4'),
      raw('genToc5'),
      raw('genToc6')
    ],
    sections: [
      {
        heading: fill('genToc1'),
        paragraphs: [fill('genS1P1'), fill('genS1P2')]
      },
      {
        heading: raw('genToc2'),
        paragraphs: [fill('genS2P1'), fill('genS2P2')],
        formula: tool.category === 'Daily Calculators'
          ? raw('genFormulaDaily')
          : raw('genFormulaOther'),
        tips: [raw('genS2Tip1'), raw('genS2Tip2'), raw('genS2Tip3')]
      },
      {
        heading: raw('genToc3'),
        paragraphs: [fill('genS3P1'), fill('genS3P2')]
      },
      {
        heading: raw('genToc4'),
        paragraphs: [fill('genS4P1'), fill('genS4P2')]
      },
      {
        heading: raw('genToc5'),
        paragraphs: [fill('genS5P1'), fill('genS5P2')],
        tips: [raw('genS5Tip1'), raw('genS5Tip2'), raw('genS5Tip3')]
      },
      {
        heading: raw('genToc6'),
        paragraphs: [fill('genS6P1'), fill('genS6P2')]
      }
    ],
    conclusion: fill('genConclusion'),
    faqs: tool.faq && tool.faq.length >= 4 ? tool.faq.slice(0, 4) : [
      { question: fill('genFaqQ1'), answer: fill('genFaqA1') },
      { question: fill('genFaqQ2'), answer: fill('genFaqA2') },
      { question: fill('genFaqQ3'), answer: fill('genFaqA3') },
      { question: fill('genFaqQ4'), answer: fill('genFaqA4') }
    ],
    tags: [tool.category, raw('genTagGuide'), raw('genTagTutorial'), raw('genTagFree'), raw('genTagProductivity')]
  };
}

// Pre-compiled list of top blog posts for the /blog directory
export const FEATURED_BLOG_SLUGS = [
  'mortgage-calculator-usa',
  'auto-insurance-calculator',
  'loan-calculator-usa',
  'tax-calculator-2026-usa',
  'resume-builder-pro',
  'invoice-generator-free',
  'live-currency-converter',
  'pdf-to-word-converter'
];

export const ALL_BLOG_POSTS: BlogPost[] = ALL_TOOLS.slice(0, 30).map(t => getBlogPostForTool(t));
