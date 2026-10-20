import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  MetaTagGenerator,
  OpenGraphGenerator,
  RobotsTxtGenerator,
  XmlSitemapGenerator,
  SchemaGenerator,
  FaqSchemaGenerator,
  HtaccessRedirectGenerator,
  HreflangGenerator,
  UtmBuilder,
  LlmsTxtGenerator,
} from './SeoGenerators';
import {
  MetaTagAnalyzer,
  OnPageSeoAnalyzer,
  KeywordDensityChecker,
  ReadabilityChecker,
  HeadlineAnalyzer,
  SerpSnippetPreview,
  CodeToTextRatioChecker,
  DuplicateContentChecker,
  HeadingChecker,
} from './SeoAnalyzers';
import {
  LinkExtractor,
  RobotsTxtTester,
  SitemapValidator,
  RedirectChainAnalyzer,
  KeywordClustering,
  KeywordCombiner,
  SeoRoiCalculator,
  CodeMinifier,
} from './SeoTechnical';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the SEO Tools suite. */
export const SEO_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  // Generators
  'meta-tag-generator': MetaTagGenerator,
  'open-graph-generator': OpenGraphGenerator,
  'robots-txt-generator': RobotsTxtGenerator,
  'xml-sitemap-generator': XmlSitemapGenerator,
  'schema-generator': SchemaGenerator,
  'faq-schema-generator': FaqSchemaGenerator,
  'htaccess-redirect-generator': HtaccessRedirectGenerator,
  'hreflang-generator': HreflangGenerator,
  'utm-builder': UtmBuilder,
  'llms-txt-generator': LlmsTxtGenerator,
  // Content analyzers
  'meta-tag-analyzer': MetaTagAnalyzer,
  'on-page-seo-analyzer': OnPageSeoAnalyzer,
  'keyword-density-checker': KeywordDensityChecker,
  'readability-checker': ReadabilityChecker,
  'headline-analyzer': HeadlineAnalyzer,
  'serp-snippet-preview': SerpSnippetPreview,
  'code-to-text-ratio-checker': CodeToTextRatioChecker,
  'duplicate-content-checker': DuplicateContentChecker,
  'heading-structure-checker': HeadingChecker,
  // Technical tools
  'link-extractor': LinkExtractor,
  'robots-txt-tester': RobotsTxtTester,
  'sitemap-validator': SitemapValidator,
  'redirect-chain-analyzer': RedirectChainAnalyzer,
  'keyword-clustering': KeywordClustering,
  'keyword-combiner': KeywordCombiner,
  'seo-roi-calculator': SeoRoiCalculator,
  'code-minifier': CodeMinifier,
};
