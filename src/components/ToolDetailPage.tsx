import React from 'react';
import { ToolWrapper } from './ToolWrapper';
import { Translations, TRANSLATIONS } from '../lib/i18n';

interface ToolDetailPageProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateTool: (slug: string) => void;
  onNavigateBlogGuide?: (slug: string) => void;
  t?: Translations;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({
  slug,
  onNavigateHome,
  onNavigateTool,
  onNavigateBlogGuide = () => {},
  t = TRANSLATIONS.en
}) => {
  return (
    <ToolWrapper
      slug={slug}
      onNavigateHome={onNavigateHome}
      onNavigateTool={onNavigateTool}
      onNavigateBlogGuide={onNavigateBlogGuide}
      t={t}
    />
  );
};
