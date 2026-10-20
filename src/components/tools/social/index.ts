import type { ComponentType } from 'react';
import type { ToolItem } from '../../../lib/tools-data';
import {
  SocialImageResizer,
  YoutubeThumbnailMaker,
  FancyTextGenerator,
  SocialPostComposer,
  HashtagGenerator,
  HashtagCounter,
  EngagementCalculator,
  UsernameGenerator,
} from './SocialStudioA';
import {
  SocialVideoResizer,
  PostIdeasGenerator,
  GiveawayPicker,
  PostCardMaker,
  LinkInBioBuilder,
  EmojiBoard,
  AiHashtagGenerator,
  AiHookGenerator,
} from './SocialStudioB';

type ToolComponent = ComponentType<{ tool: ToolItem }>;

/** Slug → component registry for the Social Media Tools suite. */
export const SOCIAL_TOOL_COMPONENTS: Record<string, ToolComponent> = {
  'social-image-resizer': SocialImageResizer,
  'youtube-thumbnail-maker': YoutubeThumbnailMaker,
  'fancy-text-generator': FancyTextGenerator,
  'social-post-composer': SocialPostComposer,
  'hashtag-generator': HashtagGenerator,
  'hashtag-counter': HashtagCounter,
  'engagement-rate-calculator': EngagementCalculator,
  'username-generator': UsernameGenerator,
  'social-video-resizer': SocialVideoResizer,
  'post-ideas-generator': PostIdeasGenerator,
  'giveaway-picker': GiveawayPicker,
  'post-card-maker': PostCardMaker,
  'link-in-bio-builder': LinkInBioBuilder,
  'emoji-picker': EmojiBoard,
  'ai-hashtag-generator': AiHashtagGenerator,
  'ai-hook-generator': AiHookGenerator,
};
