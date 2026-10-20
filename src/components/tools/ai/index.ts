import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  AiWriter,
  AiParaphraser,
  AiGrammarChecker,
  AiTextSummarizer,
  AiTranslator,
  AiStoryGenerator,
  AiPoemGenerator,
} from './AiStudioA';
import {
  AiImageGenerator,
  AiEmailWriter,
  AiCoverLetterGenerator,
  AiBioGenerator,
  AiCaptionGenerator,
  AiBusinessNameGenerator,
  AiChatTool,
} from './AiStudioB';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the AI Tools suite (Gemini-powered). */
export const AI_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  'ai-writer': AiWriter,
  'ai-paraphraser': AiParaphraser,
  'ai-grammar-checker': AiGrammarChecker,
  'ai-text-summarizer': AiTextSummarizer,
  'ai-translator': AiTranslator,
  'ai-story-generator': AiStoryGenerator,
  'ai-poem-generator': AiPoemGenerator,
  'ai-image-generator': AiImageGenerator,
  'ai-email-writer': AiEmailWriter,
  'ai-cover-letter-generator': AiCoverLetterGenerator,
  'ai-bio-generator': AiBioGenerator,
  'ai-caption-generator': AiCaptionGenerator,
  'ai-business-name-generator': AiBusinessNameGenerator,
  'ai-chat': AiChatTool,
};
